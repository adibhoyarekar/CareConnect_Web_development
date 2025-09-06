import React, { useState, useMemo } from 'react';
import { Appointment, Doctor, Patient, Role, AppointmentStatus, MedicalRecord, Review } from '../types';
import AppointmentTable from './AppointmentTable';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';
import { exportToExcel } from '../utils/excelExport';
import { sortAppointmentsChronologically } from '../utils/sorting';

interface ReceptionistDashboardProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  medicalRecords: MedicalRecord[];
  reviews: Review[];
  updateAppointment: (appointment: Appointment) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({
  appointments,
  patients,
  doctors,
  reviews,
  updateAppointment,
  addAppointment,
  deleteAppointment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<{ status: AppointmentStatus | 'All'; doctorId: string | 'All' }>({
    status: 'All',
    doctorId: 'All',
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);


  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter(appt => {
      const statusMatch = filter.status === 'All' || appt.status === filter.status;
      const doctorMatch = filter.doctorId === 'All' || appt.doctorId === filter.doctorId;
      return statusMatch && doctorMatch;
    });
    return sortAppointmentsChronologically(filtered);
  }, [appointments, filter]);

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'> | Appointment) => {
    if ('id' in appointmentData) {
      await updateAppointment(appointmentData);
    } else {
      await addAppointment(appointmentData);
    }
    setIsModalOpen(false);
    setAppointmentToEdit(null);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setIsModalOpen(true);
  };
  
  const openDeleteConfirmation = (id: string) => {
    setAppointmentToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAppointment = async () => {
    if (appointmentToDelete) {
      await deleteAppointment(appointmentToDelete);
      setIsDeleteConfirmOpen(false);
      setAppointmentToDelete(null);
    }
  };
  
  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    const appointmentToUpdate = appointments.find(appt => appt.id === id);
    if (appointmentToUpdate) {
      updateAppointment({ ...appointmentToUpdate, status });
    }
  };

  const handleExport = () => {
    exportToExcel(filteredAppointments, patients, doctors);
  };

  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === AppointmentStatus.Pending).length;
    const confirmed = appointments.filter(a => a.status === AppointmentStatus.Confirmed).length;
    const completed = appointments.filter(a => a.status === AppointmentStatus.Completed).length;
    return { total, pending, confirmed, completed };
  }, [appointments]);

  return (
    <>
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-3d">
        <h2 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h2>
        <p className="text-gray-600 mt-2">Manage all patient appointments and records efficiently.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-3d"><h3 className="text-sm font-medium text-gray-500">Total Appointments</h3><p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p></div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-3d"><h3 className="text-sm font-medium text-yellow-500">Pending</h3><p className="mt-2 text-3xl font-bold text-yellow-400">{stats.pending}</p></div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-3d"><h3 className="text-sm font-medium text-green-500">Confirmed</h3><p className="mt-2 text-3xl font-bold text-green-400">{stats.confirmed}</p></div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-3d"><h3 className="text-sm font-medium text-blue-500">Completed</h3><p className="mt-2 text-3xl font-bold text-blue-400">{stats.completed}</p></div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-3d">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h3 className="text-xl font-semibold text-gray-900">All Appointments</h3>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <select
              value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value as AppointmentStatus | 'All' }))}
              className="block pl-3 pr-10 py-2 text-base rounded-md sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="All">All Statuses</option>
              {Object.values(AppointmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filter.doctorId}
              onChange={e => setFilter(f => ({ ...f, doctorId: e.target.value }))}
              className="block pl-3 pr-10 py-2 text-base rounded-md sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="All">All Doctors</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Export
            </button>
            <button
              onClick={() => { setAppointmentToEdit(null); setIsModalOpen(true); }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              New Appointment
            </button>
          </div>
        </div>
        <AppointmentTable
          appointments={filteredAppointments}
          patients={patients}
          doctors={doctors}
          currentUserRole={Role.Receptionist}
          onStatusChange={handleStatusChange}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={openDeleteConfirmation}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setAppointmentToEdit(null); }} title={appointmentToEdit ? 'Edit Appointment' : 'Book New Appointment'}>
        <AppointmentForm
          appointments={appointments}
          patients={patients}
          doctors={doctors}
          reviews={reviews}
          onSave={handleSaveAppointment}
          onClose={() => { setIsModalOpen(false); setAppointmentToEdit(null); }}
          currentUserId="" // Not applicable
          currentUserRole={Role.Receptionist}
          appointmentToEdit={appointmentToEdit}
        />
      </Modal>

       <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
          <div>
            <p className="text-gray-700">Are you sure you want to delete this appointment? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAppointment}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
       </Modal>
    </div>
    </>
  );
};

export default ReceptionistDashboard;