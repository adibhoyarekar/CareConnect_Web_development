import React, { useState, useEffect, useRef } from 'react';
// FIX: Import GoogleGenAI, Type, and Chat for a stateful conversational experience.
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Appointment, Doctor, Patient, AppointmentStatus } from '../types';
import Modal from './Modal';
import Spinner from './Spinner';
import { SparklesIcon } from './icons/SparklesIcon';

interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  doctors: Doctor[];
  appointments: Appointment[];
  onAppointmentBooked: (appointmentData: Omit<Appointment, 'id'>) => Promise<void>;
}

interface Message {
  sender: 'user' | 'ai' | 'system';
  text: string;
  suggestions?: AppointmentSuggestion[];
}

interface AppointmentSuggestion {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const AIAgentModal: React.FC<AIAgentModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctors,
  appointments,
  onAppointmentBooked,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<AppointmentSuggestion | null>(null);
  // FIX: Add state to hold the stateful chat instance.
  const [chat, setChat] = useState<Chat | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // FIX: Initialize a new stateful chat session when the modal is opened.
  useEffect(() => {
    if (isOpen) {
      // Initialize the chat session with a system prompt and response schema.
      const systemInstruction = generateSystemPrompt();
      const responseSchema = getResponseSchema();
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });
      setChat(newChat);
      
      // Set the initial greeting message.
      const todayStr = new Date().toISOString().split('T')[0];

      const patientUpcomingAppointments = appointments
        .filter(a => 
            a.patientId === patient.id &&
            (a.status === AppointmentStatus.Confirmed || a.status === AppointmentStatus.Pending) &&
            a.date >= todayStr
        )
        .sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
            const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
            return dateTimeA - dateTimeB;
        });

      const nextAppointment = patientUpcomingAppointments.length > 0 ? patientUpcomingAppointments[0] : null;

      let greeting = `Hello, ${patient.name}! `;

      if (nextAppointment) {
          const doctorName = doctors.find(d => d.id === nextAppointment.doctorId)?.name || 'a doctor';
          const appointmentDate = new Date(nextAppointment.date).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC'
          });
          greeting += `I see you have an upcoming appointment with ${doctorName} on ${appointmentDate} at ${nextAppointment.time}. How can I help you today? You can ask me about this appointment, schedule a new one, or ask other questions.`;
      } else {
          greeting += `Welcome to the CareConnect AI assistant. How can I help you today? I can help you book an appointment, find a doctor, or answer questions about our clinic.`;
      }

      setMessages([ { sender: 'ai', text: greeting } ]);
      setInput('');
      setIsLoading(false);
      setBookingConfirmation(null);
    }
  }, [isOpen, patient, appointments, doctors]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const getResponseSchema = () => ({
    type: Type.OBJECT,
    properties: {
      response_type: {
        type: Type.STRING,
        description: "Either 'clarification' or 'suggestion'. Use 'clarification' if you need more information or are answering a question, 'suggestion' if you are providing appointment options.",
      },
      message: {
        type: Type.STRING,
        description: "A friendly, conversational message to display to the user.",
      },
      suggestions: {
        type: Type.ARRAY,
        description: "An array of up to 5 appointment suggestions. This should be empty if response_type is 'clarification'.",
        items: {
          type: Type.OBJECT,
          properties: {
            doctorId: { type: Type.STRING, description: "The ID of the suggested doctor." },
            date: { type: Type.STRING, description: "The date of the appointment in YYYY-MM-DD format." },
            time: { type: Type.STRING, description: "The time of the appointment in HH:mm format." },
            reason: { type: Type.STRING, description: "A concise reason for the visit based on the user's query." },
          },
          required: ["doctorId", "date", "time", "reason"],
        },
      },
    },
    required: ["response_type", "message"],
  });

  const generateSystemPrompt = () => {
    const today = new Date().toISOString().split('T')[0];
    const availableDoctors = doctors
        .filter(d => d.profileComplete)
        .map(d => ({
            id: d.id,
            name: d.name,
            specialty: d.specialty,
            workingSchedule: d.workingSchedule,
            fees: d.fees,
        }));
    
    const bookedSlots = appointments
      .filter(a => a.status !== 'Cancelled' && a.status !== 'Rejected')
      .map(a => ({
        doctorId: a.doctorId,
        date: a.date,
        time: a.time,
    }));

    return `You are a friendly and professional AI assistant for the 'CareConnect' medical clinic. Your goal is to help patients with their inquiries. You can book appointments and answer questions about the clinic, doctors, and general health topics. The current patient is ${patient.name}.

    Current date: ${today}.

    Clinic Information:
    - Doctors: ${JSON.stringify(availableDoctors, null, 2)}
    - Existing Booked Appointments (unavailable slots): ${JSON.stringify(bookedSlots, null, 2)}
    
    Conversational Context:
    - You MUST maintain context throughout the conversation. Remember previous questions and answers to handle follow-up questions naturally. For example, if a user asks "What about Dr. Smith?" after asking about cardiologists, you should understand they are asking about Dr. Smith's specialty.
    - When providing information, be thorough but not overly verbose. You can offer to provide more details if the user asks.

    Core Tasks:
    1.  Answer general questions: Provide helpful information based on the provided clinic data or your general knowledge for health FAQs.
    2.  Book appointments: If the user wants to book an appointment, follow these steps:
        a. Gather information: Determine the reason for the visit, preferred doctor, and desired date/time from the user's request.
        b. Check availability: Based on the doctor's working schedule and existing bookings, find available 30-minute slots.
        c. Propose Slots: Once you have a specific doctor and date from the user, you MUST calculate all available 30-minute time slots for that day. Base this on the doctor's working schedule and the list of already booked appointments. Present ALL available slots for that specific day in the \`suggestions\` array. For example, if the user asks for "Dr. Smith on Tuesday" and she is available, your response message should be something like "Certainly. Dr. Smith has the following times available on Tuesday:" and the \`suggestions\` array must be populated with all corresponding available time objects.
        d. Handle conflicts: If no slots are available for the requested doctor/date, clearly state this and suggest alternatives, like another date or a different doctor. For example: "I'm sorry, but Dr. Jane Smith has no available slots on that day. Would you like to try a different date, or see another doctor?"
        e. Clarify: If the user's request is ambiguous (e.g., "I have a headache"), ask for more details to suggest the right specialist.

    Response Format:
    - You MUST respond in JSON format, adhering strictly to the provided schema.
    - Your conversational message should be helpful and clear.
    `;
  };

  const handleSendMessage = async () => {
    // FIX: Check for the existence of the chat instance.
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // FIX: Use the stateful chat.sendMessage method to maintain conversation history.
      const result = await chat.sendMessage({ message: userMessage.text });

      const jsonString = result.text.trim();
      const parsedResponse = JSON.parse(jsonString);

      const aiMessage: Message = {
        sender: 'ai',
        text: parsedResponse.message,
        suggestions: parsedResponse.suggestions || [],
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("AI agent error:", error);
      const errorMessage: Message = {
        sender: 'ai',
        text: "I'm sorry, I encountered an error. Please try again or book your appointment manually.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: AppointmentSuggestion) => {
    setBookingConfirmation(suggestion);
  }

  const confirmBooking = async () => {
    if (!bookingConfirmation) return;
    setIsLoading(true);
    try {
        await onAppointmentBooked({
            ...bookingConfirmation,
            patientId: patient.id,
            status: AppointmentStatus.Pending,
        });
    } catch (error) {
        console.error("Failed to book appointment from AI suggestion", error);
        const errorMessage: Message = {
            sender: 'ai',
            text: "Sorry, there was a problem booking that appointment. Please try again.",
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        // Parent component will close the modal upon successful booking.
    }
  }

  const renderMessageContent = (msg: Message) => {
    const doctorMap = new Map(doctors.map(d => [d.id, d.name]));

    // Group suggestions by doctor and date for a cleaner UI
    const groupedSuggestions = (msg.suggestions || []).reduce((acc, s) => {
        const key = `${s.doctorId}|${s.date}`;
        if (!acc[key]) {
            acc[key] = { doctorId: s.doctorId, date: s.date, times: [] };
        }
        acc[key].times.push(s);
        return acc;
    }, {} as Record<string, { doctorId: string; date: string; times: AppointmentSuggestion[] }>);

    return (
        <div className="space-y-3">
            <p className="whitespace-pre-wrap">{msg.text}</p>
            {Object.keys(groupedSuggestions).length > 0 && !bookingConfirmation && (
                <div className="space-y-3 pt-2">
                    {Object.values(groupedSuggestions).map((group, index) => (
                        <div key={index} className="p-3 bg-primary-100/50 rounded-lg border border-primary-200">
                            <p className="font-semibold text-primary-800">
                                {doctorMap.get(group.doctorId) || 'Unknown Doctor'}
                            </p>
                            <p className="text-sm text-primary-700 mb-2">
                                {new Date(group.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {group.times.sort((a,b) => a.time.localeCompare(b.time)).map((suggestion, tIndex) => (
                                    <button
                                        key={tIndex}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-3 py-1.5 bg-white hover:bg-primary-50 text-primary-800 rounded-md text-sm font-semibold transition-colors duration-200 border border-primary-300 shadow-sm"
                                    >
                                        {suggestion.time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  }
  
  const renderBookingConfirmation = () => {
    if (!bookingConfirmation) return null;
    const doctor = doctors.find(d => d.id === bookingConfirmation.doctorId);
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm m-4 animate-modal-in">
                <h3 className="text-lg font-bold text-gray-900">Confirm Appointment</h3>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <p><span className="font-semibold">Patient:</span> {patient.name}</p>
                    <p><span className="font-semibold">Doctor:</span> {doctor?.name}</p>
                    <p><span className="font-semibold">Date:</span> {new Date(bookingConfirmation.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                    <p><span className="font-semibold">Time:</span> {bookingConfirmation.time}</p>
                    <p><span className="font-semibold">Reason:</span> {bookingConfirmation.reason}</p>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={() => setBookingConfirmation(null)}
                        disabled={isLoading}
                        className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmBooking}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        {isLoading ? <Spinner size="sm" color="text-white"/> : 'Confirm & Book'}
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Assistant">
      <div className="flex flex-col h-[65vh]">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0">
                    <SparklesIcon />
                </div>
              )}
              <div
                className={`max-w-md p-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                }`}
              >
                {renderMessageContent(msg)}
              </div>
            </div>
          ))}
          {isLoading && !bookingConfirmation && (
            <div className="flex items-end gap-2">
               <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0">
                    <SparklesIcon />
                </div>
              <div className="max-w-sm p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none border border-gray-200">
                <Spinner size="sm" color="text-purple-600" />
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading || !!bookingConfirmation}
              className="flex-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3 disabled:bg-gray-200"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || !!bookingConfirmation}
              className="inline-flex items-center justify-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {renderBookingConfirmation()}
    </Modal>
  );
};

export default AIAgentModal;