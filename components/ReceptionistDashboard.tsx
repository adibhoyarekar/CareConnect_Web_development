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
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'All'>('All');


  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      // Date range filter
      if (dateRange.start && appt.date < dateRange.start) return false;
      if (dateRange.end && appt.date > dateRange.end) return false;
      
      // Status filter
      if (statusFilter !== 'All' && appt.status !== statusFilter) return false;
      
      // Search term filter (patient/doctor name)
      const lowercasedTerm = searchTerm.toLowerCase();
      if (lowercasedTerm) {
        const patient = patients.find(p => p.id === appt.patientId);
        const doctor = doctors.find(d => d.id === appt.doctorId);
        const patientMatch = patient?.name.toLowerCase().includes(lowercasedTerm);
        const doctorMatch = doctor?.name.toLowerCase().includes(lowercasedTerm);
        if (!patientMatch && !doctorMatch) {
            return false;
        }
      }

      return true; // Keep the appointment if it passes all filters
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date ascending
  }, [appointments, patients, doctors, searchTerm, dateRange, statusFilter]);

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
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setStatusFilter('All');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h2>
        <p className="text-gray-600">Manage all appointments and patient records.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-2/3">
                     <label htmlFor="search" className="sr-only">Search</label>
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                       <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                           <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                       </svg>
                     </span>
                     <input 
                         id="search"
                         type="text" 
                         placeholder="Search by patient or doctor name..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
                     />
                 </div>
                  <button
                   onClick={handleOpenModalForNew}
                   className="w-full md:w-auto flex-shrink-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
                 >
                   Book New Appointment
                 </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">From</label>
                <input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="mt-1 w-full pl-3 pr-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100 border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">To</label>
                <input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="mt-1 w-full pl-3 pr-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100 border-gray-300 text-gray-900"
                  min={dateRange.start}
                />
              </div>
              
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  id="statusFilter"
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'All')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="All">All Statuses</option>
                  {Object.values(AppointmentStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <button 
                  onClick={clearFilters}
                  className="w-full bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
                >
                  Clear Filters
                </button>
              </div>
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
          appointments={appointments}
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