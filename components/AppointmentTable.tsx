import React from 'react';
import { Appointment, Patient, Doctor, Role, AppointmentStatus, Review } from '../types';

interface AppointmentTableProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  reviews?: Review[];
  currentUserRole: Role;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  onPatientClick?: (patientId: string) => void;
  onLeaveReview?: (appointment: Appointment) => void;
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (id: string) => void;
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  patients,
  doctors,
  reviews,
  currentUserRole,
  onStatusChange,
  onPatientClick,
  onLeaveReview,
  onEditAppointment,
  onDeleteAppointment,
}) => {

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'N/A';
  const getDoctorName = (id: string) => doctors.find(d => d.id === id)?.name || 'N/A';

  const renderStatusBadge = (status: AppointmentStatus) => {
    const statusColors: { [key in AppointmentStatus]: string } = {
      [AppointmentStatus.Pending]: 'bg-yellow-100 text-yellow-800',
      [AppointmentStatus.Confirmed]: 'bg-green-100 text-green-800',
      [AppointmentStatus.Completed]: 'bg-blue-100 text-blue-800',
      [AppointmentStatus.Cancelled]: 'bg-red-100 text-red-800',
      [AppointmentStatus.Rejected]: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
        {status}
      </span>
    );
  };
  
  const hasReview = (appointmentId: string) => {
    return reviews?.some(r => r.appointmentId === appointmentId);
  }

  if (appointments.length === 0) {
    return <p className="text-center text-gray-500 py-8">No appointments found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {currentUserRole !== Role.Patient && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>}
            {currentUserRole !== Role.Doctor && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((appt) => (
            <tr key={appt.id}>
              {currentUserRole !== Role.Patient && (
                <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => onPatientClick && onPatientClick(appt.patientId)} className="text-sm font-medium text-primary-600 hover:underline disabled:text-gray-500 disabled:no-underline" disabled={!onPatientClick}>
                        {getPatientName(appt.patientId)}
                    </button>
                </td>
              )}
              {currentUserRole !== Role.Doctor && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getDoctorName(appt.doctorId)}</div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{new Date(appt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</div>
                <div className="text-sm text-gray-500">{appt.time}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 truncate max-w-xs">{appt.reason}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {currentUserRole === Role.Doctor || currentUserRole === Role.Receptionist ? (
                    <select
                        value={appt.status}
                        onChange={(e) => onStatusChange && onStatusChange(appt.id, e.target.value as AppointmentStatus)}
                        className="text-xs rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={appt.status === AppointmentStatus.Completed || appt.status === AppointmentStatus.Cancelled || !onStatusChange}
                    >
                        {Object.values(AppointmentStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                ) : (
                    renderStatusBadge(appt.status)
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {currentUserRole === Role.Patient && appt.status === AppointmentStatus.Completed && onLeaveReview && (
                    hasReview(appt.id) ? (
                        <span className="text-sm text-gray-500 italic">Reviewed</span>
                    ) : (
                        <button onClick={() => onLeaveReview(appt)} className="text-primary-600 hover:text-primary-900">Leave Review</button>
                    )
                )}
                {currentUserRole === Role.Receptionist && onEditAppointment && onDeleteAppointment && (
                    <div className="flex space-x-2">
                        <button onClick={() => onEditAppointment(appt)} className="text-primary-600 hover:text-primary-900">Edit</button>
                        <button onClick={() => onDeleteAppointment(appt.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                )}
                 {(currentUserRole === Role.Doctor) && (
                    <span className="text-sm text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
