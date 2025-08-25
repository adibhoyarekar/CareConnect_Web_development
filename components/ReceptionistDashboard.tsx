import React, { useState, useMemo } from 'react';
import { Appointment, Doctor, Patient, Role, AppointmentStatus, User, Review } from '../types';
import AppointmentTable from './AppointmentTable';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';

interface ReceptionistDashboardProps {
  user: User;
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  reviews: Review[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (appointment: Appointment) => void;
}

const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ user, appointments, patients, doctors, reviews, addAppointment, updateAppointment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    const currentMonth = new Date().getMonth();

    return appointments.filter(appt => {
      // Date filter logic
      const apptDate = new Date(appt.date);
      if (dateFilter === 'today' && appt.date !== todayStr) return false;
      if (dateFilter === 'week' && (apptDate < weekStart || apptDate > weekEnd)) return false;
      if (dateFilter === 'month' && apptDate.getMonth() !== currentMonth) return false;
      
      // Search term logic
      const lowercasedTerm = searchTerm.toLowerCase();
      if (!lowercasedTerm) return true;
      const patient = patients.find(p => p.id === appt.patientId);
      const doctor = doctors.find(d => d.id === appt.doctorId);
      return (
        patient?.name.toLowerCase().includes(lowercasedTerm) ||
        doctor?.name.toLowerCase().includes(lowercasedTerm) ||
        appt.status.toLowerCase().includes(lowercasedTerm)
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, patients, doctors, searchTerm, dateFilter]);

  const handleOpenModalForNew = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = (appointmentData: Omit<Appointment, 'id'> | Appointment) => {
    if ('id' in appointmentData && editingAppointment) {
      updateAppointment(appointmentData as Appointment);
    } else {
      addAppointment(appointmentData);
    }
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    const appointmentToUpdate = appointments.find(appt => appt.id === id);
    if(appointmentToUpdate) {
        updateAppointment({...appointmentToUpdate, status});
    }
  };
  
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h2>
        <p className="text-gray-600">Manage all appointments and patient records.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="space-y-4">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-2/5">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                       <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                           <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                       </svg>
                     </span>
                     <input 
                         type="text" 
                         placeholder="Search by patient, doctor, or status..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
                     />
                 </div>
                  <button
                   onClick={handleOpenModalForNew}
                   className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
                 >
                   Book New Appointment
                 </button>
           </div>
            <div className="flex items-center space-x-2">
               <span className="text-sm font-medium text-gray-700">Filter by:</span>
               {(['all', 'today', 'week', 'month'] as const).map(filter => (
                    <button key={filter} onClick={() => setDateFilter(filter)} 
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${dateFilter === filter ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                       {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
               ))}
             </div>
        </div>

        <div className="mt-6">
          <AppointmentTable
            appointments={filteredAppointments}
            patients={patients}
            doctors={doctors}
            currentUserRole={Role.Receptionist}
            onEdit={handleOpenModalForEdit}
            onStatusChange={handleStatusChange}
            onCall={handleCall}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAppointment ? "Edit Appointment" : "Book New Appointment"}>
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients}
          doctors={doctors}
          reviews={reviews}
          onSave={handleSaveAppointment}
          onClose={() => setIsModalOpen(false)}
          currentUserId={user.id}
          currentUserRole={Role.Receptionist}
        />
      </Modal>
    </div>
  );
};

export default ReceptionistDashboard;