import { Appointment, Patient, Doctor } from '../types';

declare const XLSX: any;

export const exportToExcel = (appointments: Appointment[], patients: Patient[], doctors: Doctor[]) => {
  const data = appointments.map(appt => {
    const patient = patients.find(p => p.id === appt.patientId);
    const doctor = doctors.find(d => d.id === appt.doctorId);
    return {
      'Appointment ID': appt.id,
      'Patient Name': patient?.name || 'N/A',
      'Patient Contact': patient?.contact || 'N/A',
      'Doctor Name': doctor?.name || 'N/A',
      'Doctor Specialty': doctor?.specialty || 'N/A',
      'Appointment Date': appt.date,
      'Time': appt.time,
      'Reason': appt.reason,
      'Status': appt.status,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, 
    { wch: 15 }, { wch: 10 }, { wch: 30 }, { wch: 15 }
  ];

  XLSX.writeFile(workbook, 'Appointments.xlsx');
};