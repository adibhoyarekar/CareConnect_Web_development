import React, { useState, useEffect, useMemo } from 'react';
import { Appointment, Doctor, Patient, Role, AppointmentStatus, Review } from '../types';
import Spinner from './Spinner';

interface AppointmentFormProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  reviews: Review[];
  onSave: (appointmentData: Omit<Appointment, 'id'> | Appointment) => Promise<void>;
  onClose: () => void;
  currentUserId: string;
  currentUserRole: Role;
  appointmentToEdit?: Appointment | null;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointments,
  patients,
  doctors,
  onSave,
  onClose,
  currentUserId,
  currentUserRole,
  appointmentToEdit,
}) => {
  const [formData, setFormData] = useState({
    patientId: currentUserRole === Role.Patient ? currentUserId : (appointmentToEdit?.patientId || ''),
    doctorId: appointmentToEdit?.doctorId || '',
    date: appointmentToEdit?.date || '',
    time: appointmentToEdit?.time || '',
    reason: appointmentToEdit?.reason || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3";


  useEffect(() => {
    if (appointmentToEdit) {
      setFormData({
        patientId: appointmentToEdit.patientId,
        doctorId: appointmentToEdit.doctorId,
        date: appointmentToEdit.date,
        time: appointmentToEdit.time,
        reason: appointmentToEdit.reason,
      });
    } else {
        // Reset for new appointment form
        setFormData({
            patientId: currentUserRole === Role.Patient ? currentUserId : '',
            doctorId: '',
            date: '',
            time: '',
            reason: '',
        });
    }
  }, [appointmentToEdit, currentUserRole, currentUserId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
        if (appointmentToEdit) {
            await onSave({
                ...appointmentToEdit,
                ...formData,
            });
        } else {
            await onSave({
                ...formData,
                status: AppointmentStatus.Pending,
            });
        }
    } catch (error) {
        console.error("Failed to save appointment", error);
        setIsSaving(false);
    }
  };

  const availableTimes = useMemo(() => {
    if (!formData.doctorId || !formData.date) return [];
    
    const standardTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    
    const bookedTimes = appointments
      .filter(appt => 
          appt.doctorId === formData.doctorId && 
          appt.date === formData.date &&
          (!appointmentToEdit || appt.id !== appointmentToEdit.id)
      )
      .map(appt => appt.time);
      
    const freeSlots = standardTimes.filter(time => !bookedTimes.includes(time));

    if (appointmentToEdit && 
        appointmentToEdit.doctorId === formData.doctorId &&
        appointmentToEdit.date === formData.date &&
        !freeSlots.includes(appointmentToEdit.time)) {
      freeSlots.push(appointmentToEdit.time);
      freeSlots.sort();
    }
      
    return freeSlots;
  }, [formData.doctorId, formData.date, appointments, appointmentToEdit]);
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {currentUserRole === Role.Receptionist && (
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient</label>
          <select
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className={inputBaseClasses}
            required
          >
            <option value="">Select a patient</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">Doctor</label>
        <select
          id="doctorId"
          name="doctorId"
          value={formData.doctorId}
          onChange={handleChange}
          className={inputBaseClasses}
          required
        >
          <option value="">Select a doctor</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
        </select>
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
            min={today}
            className={inputBaseClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
          <select
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={inputBaseClasses}
            required
            disabled={!formData.doctorId || !formData.date}
          >
            <option value="">Select a time</option>
            {availableTimes.map(time => <option key={time} value={time}>{time}</option>)}
            {availableTimes.length === 0 && (
                <option disabled>
                    {(!formData.doctorId || !formData.date) ? 'Select doctor & date first' : 'No available slots'}
                </option>
            )}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Appointment</label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          value={formData.reason}
          onChange={handleChange}
          className={inputBaseClasses}
          required
          placeholder="e.g., Annual Checkup, Follow-up, etc."
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
          disabled={isSaving || (!formData.patientId || !formData.doctorId || !formData.date || !formData.time)}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-75"
        >
          {isSaving ? <Spinner size="sm" color="text-white" /> : (appointmentToEdit ? 'Save Changes' : 'Book Appointment')}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
