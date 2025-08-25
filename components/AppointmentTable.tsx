import React from 'react';
import { Appointment, Patient, Doctor, Role, AppointmentStatus, Review } from '../types';

interface AppointmentTableProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  reviews?: Review[];
  currentUserRole: Role;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  onEdit?: (appointment: Appointment) => void;
  onCall?: (phone: string) => void;
  onLeaveReview?: (appointment: Appointment) => void;
  onPatientClick?: (patientId: string) => void;
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments, patients, doctors, reviews, currentUserRole, onStatusChange, onEdit, onCall, onLeaveReview, onPatientClick }) => {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Confirmed: return 'bg-green-100 text-green-800';
      case AppointmentStatus.Completed: return 'bg-blue-100 text-blue-800';
      case AppointmentStatus.Pending: return 'bg-yellow-100 text-yellow-800';
      case AppointmentStatus.Cancelled: return 'bg-gray-100 text-gray-800';
      case AppointmentStatus.Rejected: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const buttonBaseClasses = "font-medium transition-all duration-200 ease-in-out transform hover:scale-110";

  const hasReview = (appointmentId: string) => {
    return reviews?.some(review => review.appointmentId === appointmentId);
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.length === 0 ? (
            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No appointments found.</td></tr>
          ) : appointments.map((appt) => {
            const patient = patients.find(p => p.id === appt.patientId);
            const doctor = doctors.find(d => d.id === appt.doctorId);
            return (
              <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {currentUserRole !== Role.Patient && onPatientClick && patient ? (
                     <button onClick={() => onPatientClick(patient.id)} className="text-sm font-medium text-primary-600 hover:text-primary-800 text-left">
                        {patient.name}
                     </button>
                  ) : (
                     <div className="text-sm font-medium text-gray-900">{patient?.name}</div>
                  )}
                  <div className="text-sm text-gray-500">{patient?.contact}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{doctor?.name}</div>
                  <div className="text-sm text-gray-500">{doctor?.specialty}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{appt.date}</div>
                  <div className="text-sm text-gray-500">{appt.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">{appt.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {currentUserRole === Role.Patient && onLeaveReview && appt.status === AppointmentStatus.Completed && (
                    !hasReview(appt.id) ? (
                      <button onClick={() => onLeaveReview(appt)} className={`${buttonBaseClasses} text-primary-600 hover:text-primary-800`}>Leave a Review</button>
                    ) : (
                      <span className="text-sm text-green-600 italic">Review Submitted</span>
                    )
                  )}
                  {currentUserRole === Role.Doctor && onStatusChange && (
                    <div className="flex space-x-4">
                       {appt.status === AppointmentStatus.Pending && 
                        <>
                          <button onClick={() => onStatusChange(appt.id, AppointmentStatus.Confirmed)} className={`${buttonBaseClasses} text-green-600 hover:text-green-800`}>Accept</button>
                          <button onClick={() => onStatusChange(appt.id, AppointmentStatus.Rejected)} className={`${buttonBaseClasses} text-red-600 hover:text-red-800`}>Reject</button>
                        </>
                      }
                      {appt.status === AppointmentStatus.Confirmed && 
                        <button onClick={() => onStatusChange(appt.id, AppointmentStatus.Completed)} className={`${buttonBaseClasses} text-blue-600 hover:text-blue-800`}>Complete</button>
                      }
                    </div>
                  )}
                  {currentUserRole === Role.Receptionist && onEdit && onStatusChange && (
                    <div className="flex justify-end space-x-4">
                        <button onClick={() => onEdit(appt)} className={`${buttonBaseClasses} text-primary-600 hover:text-primary-800`}>Reschedule</button>
                        {appt.status !== AppointmentStatus.Cancelled &&
                            <button onClick={() => onStatusChange(appt.id, AppointmentStatus.Cancelled)} className={`${buttonBaseClasses} text-red-600 hover:text-red-800`}>Cancel</button>
                        }
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;