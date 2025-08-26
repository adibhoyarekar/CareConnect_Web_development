import React, { useState, useEffect } from 'react';
import { Appointment, Doctor, Patient, AppointmentStatus, Review } from '../types';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  reviews: Review[];
  onSave: (appointment: Omit<Appointment, 'id'> | Appointment) => void;
  onClose: () => void;
  currentUserId: string;
  currentUserRole: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, patients, doctors, appointments, reviews, onSave, onClose, currentUserId, currentUserRole }) => {
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || (currentUserRole === 'Patient' ? currentUserId : ''),
    doctorId: appointment?.doctorId || '',
    date: appointment?.date || '',
    time: appointment?.time || '',
    reason: appointment?.reason || '',
    status: appointment?.status || AppointmentStatus.Pending,
  });
  const [doctorAvailability, setDoctorAvailability] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
      });
    }
  }, [appointment]);

  useEffect(() => {
    // Update doctor availability when doctorId changes
    if (formData.doctorId) {
        const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
        setDoctorAvailability(selectedDoctor?.availableTime || 'Not specified');
    } else {
        setDoctorAvailability(null);
    }

    // Validate booking time if all fields are filled
    if (formData.doctorId && formData.date && formData.time) {
        const isDoubleBooked = appointments.some(appt => 
            appt.doctorId === formData.doctorId &&
            appt.date === formData.date &&
            appt.time === formData.time &&
            appt.id !== appointment?.id && // Exclude the current appointment if editing
            (appt.status === AppointmentStatus.Confirmed || appt.status === AppointmentStatus.Pending)
        );

        if (isDoubleBooked) {
            setBookingError("This time slot is already booked for the selected doctor. Please choose another time.");
        } else {
            setBookingError(null);
        }
    } else {
        // Clear error if not all fields are filled
        setBookingError(null);
    }
  }, [formData.doctorId, formData.date, formData.time, doctors, appointments, appointment]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingError) return;
    if (appointment) {
      onSave({ ...appointment, ...formData });
    } else {
      onSave({ ...formData, id: `apt-${Date.now()}` });
    }
  };
  
  const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500";
  
  const getDoctorAverageRating = (doctorId: string) => {
    const doctorReviews = reviews.filter(r => r.doctorId === doctorId);
    if (doctorReviews.length === 0) {
      return { avgRating: 0, reviewCount: 0 };
    }
    const totalRating = doctorReviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      avgRating: totalRating / doctorReviews.length,
      reviewCount: doctorReviews.length
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient</label>
        <select
          id="patientId"
          name="patientId"
          value={formData.patientId}
          onChange={handleChange}
          className={`${inputBaseClasses} pl-3 pr-10 py-2 text-base`}
          required
          disabled={currentUserRole === 'Patient'}
        >
          <option value="">Select Patient</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">Doctor</label>
        <select
          id="doctorId"
          name="doctorId"
          value={formData.doctorId}
          onChange={handleChange}
          className={`${inputBaseClasses} pl-3 pr-10 py-2 text-base`}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map(d => {
            const { avgRating, reviewCount } = getDoctorAverageRating(d.id);
            const ratingText = reviewCount > 0 ? `⭐ ${avgRating.toFixed(1)} (${reviewCount} review${reviewCount !== 1 ? 's' : ''})` : 'No reviews yet';
            return <option key={d.id} value={d.id}>{d.name} ({d.specialty}) - {ratingText}</option>
          })}
        </select>
        {doctorAvailability && (
            <p className="text-xs text-gray-500 mt-1 pl-1">
                Availability: {doctorAvailability}
            </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`${inputBaseClasses} py-2 px-3`}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`${inputBaseClasses} py-2 px-3`}
            required
          />
        </div>
      </div>
      {bookingError && (
        <p className="text-sm text-red-600 -mt-2 text-center">{bookingError}</p>
      )}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Visit</label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          value={formData.reason}
          onChange={handleChange}
          className={`${inputBaseClasses} py-2 px-3`}
          required
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!!bookingError}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:bg-primary-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          Save Appointment
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;