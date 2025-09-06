import React, { useMemo, useState } from 'react';
import { Appointment, Patient, Doctor, AppointmentStatus, Role, Review, MedicalRecord } from '../types';
import AppointmentTable from './AppointmentTable';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';
import { exportToExcel } from '../utils/excelExport';
import { sortAppointmentsChronologically } from '../utils/sorting';

interface ReceptionistDashboardProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  reviews: Review[];
  medicalRecords: MedicalRecord[];
  updateAppointment: (appointment: Appointment) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ appointments, patients, doctors, reviews, medicalRecords, updateAppointment, addAppointment, deleteAppointment }) => {
  const [filter, setFilter] = useState<AppointmentStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const filteredAppointments = useMemo(() => {
    const filtered = appointments
      .filter(appt => {
        const patient = patients.find(p => p.id === appt.patientId);
        const doctor = doctors.find(d => d.id === appt.doctorId);
        const patientName = patient?.name.toLowerCase() || '';
        const doctorName = doctor?.name.toLowerCase() || '';
        const lowerCaseSearch = searchTerm.toLowerCase();

        const matchesSearch = patientName.includes(lowerCaseSearch) || doctorName.includes(lowerCaseSearch);
        const matchesFilter = filter === 'All' || appt.status === filter;

        return matchesSearch && matchesFilter;
      });
      
    return sortAppointmentsChronologically(filtered);
  }, [appointments, patients, doctors, filter, searchTerm]);

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    const appointmentToUpdate = appointments.find(appt => appt.id === id);
    if (appointmentToUpdate) {
      updateAppointment({ ...appointmentToUpdate, status });
    }
  };
  
  const handleExport = () => {
    exportToExcel(filteredAppointments, patients, doctors);
  }

  const handleOpenModal = (appointment: Appointment | null) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAppointment(null);
    setIsModalOpen(false);
  };
  
  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'> | Appointment) => {
    if ('id' in appointmentData) {
        await updateAppointment(appointmentData);
    } else {
        await addAppointment(appointmentData);
    }
    handleCloseModal();
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
        await deleteAppointment(id);
    }
  };

  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === AppointmentStatus.Pending).length;
    const today = new Date().toISOString().split('T')[0];
    const confirmedToday = appointments.filter(a => a.status === AppointmentStatus.Confirmed && a.date === today).length;
    const completed = appointments.filter(a => a.status === AppointmentStatus.Completed).length;
    return { total, pending, confirmedToday, completed };
  }, [appointments]);

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Appointments" value={stats.total} />
            <StatCard title="Pending Confirmation" value={stats.pending} color="yellow" />
            <StatCard title="Confirmed for Today" value={stats.confirmedToday} color="green" />
            <StatCard title="Total Completed" value={stats.completed} color="blue" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Manage Appointments</h3>
             <input
                type="text"
                placeholder="Search by patient or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 block pl-3 pr-10 py-2 text-base rounded-md sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <div className="flex items-center space-x-4">
               <select 
                 value={filter} 
                 onChange={(e) => setFilter(e.target.value as AppointmentStatus | 'All')}
                 className="block pl-3 pr-10 py-2 text-base rounded-md sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
               >
                 <option value="All">All Statuses</option>
                 {Object.values(AppointmentStatus).map(status => (
                   <option key={status} value={status}>{status}</option>
                 ))}
               </select>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => handleOpenModal(null)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95">
                    Add Appointment
                </button>
                <button onClick={handleExport} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Export to Excel
                </button>
            </div>
          </div>
          <AppointmentTable
            appointments={filteredAppointments}
            patients={patients}
            doctors={doctors}
            currentUserRole={Role.Receptionist}
            onStatusChange={handleStatusChange}
            onEditAppointment={(appt) => handleOpenModal(appt)}
            onDeleteAppointment={handleDeleteAppointment}
          />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}>
        <AppointmentForm 
            appointments={appointments}
            patients={patients}
            doctors={doctors}
            reviews={reviews}
            onSave={handleSaveAppointment}
            onClose={handleCloseModal}
            currentUserId={'rec1'} // Receptionist ID, not crucial for this form
            currentUserRole={Role.Receptionist}
            appointmentToEdit={editingAppointment}
        />
      </Modal>
    </>
  );
};

const StatCard: React.FC<{title: string, value: number, color?: string}> = ({ title, value, color = 'indigo' }) => {
    const colors: {[key: string]: string} = {
        indigo: 'from-indigo-500 to-purple-600',
        yellow: 'from-yellow-400 to-amber-500',
        green: 'from-green-400 to-emerald-500',
        blue: 'from-blue-400 to-cyan-500'
    };
    return (
         <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-xl shadow-lg text-white`}>
            <h4 className="text-sm font-medium uppercase tracking-wider">{title}</h4>
            <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
    )
}

export default ReceptionistDashboard;