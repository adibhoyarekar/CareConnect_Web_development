import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
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
  onAppointmentBooked: (appointmentData: Omit<Appointment, 'id'>) => void;
}

type Message = {
  role: 'user' | 'model';
  text: string;
};

const extractJson = (text: string): any | null => {
    const match = text.match(/```json\s*(\{[\s\S]*\})\s*```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            console.error("Failed to parse JSON from AI response", e);
            return null;
        }
    }
    return null;
};

const AIAgentModal: React.FC<AIAgentModalProps> = ({ isOpen, onClose, patient, doctors, appointments, onAppointmentBooked }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] =useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [bookingDetails, setBookingDetails] = useState({ doctorId: '', date: '' });

  useEffect(() => {
    if (isOpen) {
        // Reset state when modal opens
        setMessages([]);
        setUserInput('');
        setIsLoading(true);
        setBookingDetails({ doctorId: '', date: '' });

        const initializeChat = async () => {
            try {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
              const doctorListString = doctors.map(d => `- Dr. ${d.name} (ID: ${d.id}), Specialty: ${d.specialty}`).join('\n');
              
              const systemInstruction = `You are CareConnect AI, a friendly and efficient virtual assistant for a medical clinic. Your primary goal is to help patients book appointments.

Your Persona:
- You are polite, empathetic, and professional.
- You are clear and concise in your communication.
- You should guide the user through the booking process step-by-step.

Clinic Information:
Here is a list of our available doctors and their specialties:
${doctorListString}

Booking Process:
1. Greet the user and confirm their identity (${patient.name}). Start by asking what you can help them with today.
2. Ask for the reason for their appointment.
3. Ask them to choose a doctor from the list provided.
4. Once a doctor is chosen, ask for their preferred date.
5. IMPORTANT: After the user provides a date, you will receive a list of available time slots from the system. Present these options clearly to the user.
6. Once all information (reason, doctorId, date, time) is gathered, summarize the appointment details and ask the user for final confirmation.
7. Final Output: Upon user confirmation, and ONLY then, you MUST respond with ONLY a single JSON object in a markdown code block. Do not include any other text before or after the JSON block. The JSON object must have this exact structure:
\`\`\`json
{
  "action": "BOOK_APPOINTMENT",
  "payload": {
    "doctorId": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:mm",
    "reason": "string"
  }
}
\`\`\`
Replace the string values with the collected information. The doctorId must be one of the IDs from the doctor list.`;

              chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction }
              });

              // Send initial message
              const response = await chatRef.current.sendMessage({ message: "Hello" });
              setMessages([{ role: 'model', text: response.text }]);
            } catch (error) {
                console.error("AI initialization failed:", error);
                setMessages([{ role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
            } finally {
                setIsLoading(false);
            }
        };
        initializeChat();
    }
  }, [isOpen, doctors, patient.name]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const availableTimes = useMemo(() => {
    if (!bookingDetails.doctorId || !bookingDetails.date) return [];
    
    const selectedDoctor = doctors.find(d => d.id === bookingDetails.doctorId);
    if (!selectedDoctor?.workingSchedule) return [];

    const selectedDate = new Date(`${bookingDetails.date}T00:00:00Z`);
    const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });
    
    const scheduleForDay = selectedDoctor.workingSchedule[dayOfWeek];
    if (!scheduleForDay || scheduleForDay.isOff) return [];

    const slots = [];
    const { startTime, endTime } = scheduleForDay;
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    
    const bookedTimes = new Set(
      appointments.filter(appt => appt.doctorId === bookingDetails.doctorId && appt.date === bookingDetails.date).map(appt => appt.time)
    );
      
    return slots.filter(time => !bookedTimes.has(time));
  }, [bookingDetails.doctorId, bookingDetails.date, appointments, doctors]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatRef.current) return;

    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
        let prompt = userInput;
        
        // Simple heuristic to detect if a doctor and date have been mentioned
        const doctorMentioned = doctors.find(d => prompt.toLowerCase().includes(d.name.toLowerCase()));
        const dateMentioned = prompt.match(/\d{4}-\d{2}-\d{2}|\b\w+\s\d{1,2}(st|nd|rd|th)?\b/);
        
        const currentDetails = { ...bookingDetails };
        if (doctorMentioned) currentDetails.doctorId = doctorMentioned.id;
        if (dateMentioned) {
             // A more robust date parser would be needed for production
            try {
                currentDetails.date = new Date(dateMentioned[0] + (new Date().getFullYear())).toISOString().split('T')[0]
            } catch {}
        }

        setBookingDetails(currentDetails);

        // If we have doctor and date, inject available times into the prompt
        if(currentDetails.doctorId && currentDetails.date) {
            const times = availableTimes;
            if(times.length > 0) {
                 prompt += `\n\n[System note: The available time slots for the user on ${currentDetails.date} are: ${times.join(', ')}. Please present these options to the user.]`;
            } else {
                 prompt += `\n\n[System note: There are no available slots on ${currentDetails.date}. Please inform the user and ask for another date.]`;
            }
        }
        
        const response = await chatRef.current.sendMessage({ message: prompt });
        const aiResponseText = response.text;
        
        const jsonData = extractJson(aiResponseText);
        if (jsonData && jsonData.action === 'BOOK_APPOINTMENT') {
            const { doctorId, date, time, reason } = jsonData.payload;
            onAppointmentBooked({
                patientId: patient.id,
                doctorId,
                date,
                time,
                reason,
                status: AppointmentStatus.Pending,
            });
             setMessages(prev => [...prev, { role: 'model', text: "Great! I've booked that appointment for you. You'll receive a confirmation soon." }]);
        } else {
            setMessages(prev => [...prev, { role: 'model', text: aiResponseText }]);
        }
    } catch (error) {
        console.error("AI response failed:", error);
        setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, something went wrong. Could you try that again?" }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Booking Assistant">
        <div className="flex flex-col h-[60vh]">
            <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-100/50 rounded-lg">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-white text-gray-800 border border-gray-200 rounded-bl-none flex items-center space-x-2">
                            <Spinner size="sm" />
                            <span className="text-sm text-gray-500 italic">thinking...</span>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
                 <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3"
                    disabled={isLoading}
                    aria-label="Chat input"
                 />
                 <button type="submit" disabled={isLoading || !userInput.trim()} className="inline-flex items-center justify-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                 </button>
            </form>
        </div>
    </Modal>
  );
};

export default AIAgentModal;