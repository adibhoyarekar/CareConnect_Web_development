import { Doctor, Patient, Appointment, Role, AppointmentStatus, User, MockGoogleAccount, MedicalRecord, Review, Notification, NotificationType } from './types';

const MOCK_PASSWORD = 'password123';

export const MOCK_DOCTORS: Doctor[] = [
  { id: 'doc1', name: 'Dr. John Doe', email: 'john.doe@clinic.com', role: Role.Doctor, specialty: 'Cardiologist', address: '123 Heart Lane, Cardio City', fees: 250, mobile: '123-456-7890', profileComplete: false, password: MOCK_PASSWORD },
  { id: 'doc2', name: 'Dr. Jane Smith', email: 'jane.smith@clinic.com', role: Role.Doctor, specialty: 'Dentist', address: '456 Tooth Ave, Smile Town', fees: 150, mobile: '123-456-7891', hospitalName: 'Smile Town Dental', availableTime: 'Mon-Fri, 9am-5pm', profileComplete: true, password: MOCK_PASSWORD },
  { id: 'doc3', name: 'Dr. Emily White', email: 'emily.white@clinic.com', role: Role.Doctor, specialty: 'Dermatologist', address: '789 Skin St, Glow Village', fees: 200, mobile: '123-456-7892', hospitalName: 'Glow Village Dermatology', availableTime: 'Tue, Thu, Fri, 10am-6pm', profileComplete: true, password: MOCK_PASSWORD },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'pat1', name: 'Alice Johnson', email: 'alice@email.com', role: Role.Patient, age: 0, gender: 'Other', contact: '', medicalNotes: 'Allergic to penicillin.', profileComplete: false, password: MOCK_PASSWORD, weight: 0 },
  { id: 'pat2', name: 'Bob Williams', email: 'bob@email.com', role: Role.Patient, age: 45, gender: 'Male', contact: '987-654-3211', profileComplete: true, password: MOCK_PASSWORD, weight: 85 },
  { id: 'pat3', name: 'Charlie Brown', email: 'charlie@email.com', role: Role.Patient, age: 28, gender: 'Male', contact: '987-654-3212', profileComplete: true, password: MOCK_PASSWORD, weight: 70 },
  { id: 'pat4', name: 'Diana Prince', email: 'diana@email.com', role: Role.Patient, age: 52, gender: 'Female', contact: '987-654-3213', medicalNotes: 'History of migraines.', profileComplete: true, password: MOCK_PASSWORD, weight: 65 },
];

export const MOCK_RECEPTIONIST: User = { id: 'rec1', name: 'Alex Ray', email: 'alex.ray@clinic.com', role: Role.Receptionist, password: MOCK_PASSWORD };

export const MOCK_USERS = [...MOCK_DOCTORS, ...MOCK_PATIENTS, MOCK_RECEPTIONIST];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'apt1', patientId: 'pat1', doctorId: 'doc1', date: '2024-08-10', time: '10:00', reason: 'Annual Checkup', status: AppointmentStatus.Confirmed },
  { id: 'apt2', patientId: 'pat2', doctorId: 'doc1', date: '2024-08-10', time: '11:00', reason: 'Chest Pain', status: AppointmentStatus.Pending },
  { id: 'apt3', patientId: 'pat3', doctorId: 'doc2', date: '2024-08-11', time: '14:30', reason: 'Toothache', status: AppointmentStatus.Completed },
  { id: 'apt4', patientId: 'pat4', doctorId: 'doc3', date: '2024-08-12', time: '09:00', reason: 'Skin Rash', status: AppointmentStatus.Cancelled },
  { id: 'apt5', patientId: 'pat1', doctorId: 'doc3', date: '2024-08-15', time: '16:00', reason: 'Follow-up', status: AppointmentStatus.Confirmed },
];

export const MOCK_GOOGLE_ACCOUNTS: MockGoogleAccount[] = [
  { id: 'g_acc_1', name: 'Alice Johnson', email: 'alice.j@gmail.com' },
  { id: 'g_acc_2', name: 'Bob Williams', email: 'bob.w@gmail.com' },
  { id: 'g_acc_3', name: 'Charlie Brown', email: 'charlie.b@gmail.com' },
];

export const MOCK_FACEBOOK_ACCOUNT: {id: string; name: string; email: string} = {
  id: 'fb_acc_1',
  name: 'Diana Prince',
  email: 'diana.prince@facebook.com',
};

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  { id: 'rec1', patientId: 'pat2', uploadedBy: 'patient', uploaderId: 'pat2', title: 'Previous Blood Test', description: 'Routine checkup from last year.', fileUrl: '#', fileType: 'pdf', dateUploaded: new Date('2023-05-20').toISOString() },
  { id: 'rec2', patientId: 'pat2', uploadedBy: 'doctor', uploaderId: 'doc1', title: 'Cardiologist Prescription', description: 'Prescription for blood pressure.', fileUrl: '#', fileType: 'pdf', dateUploaded: new Date('2024-08-10').toISOString() },
];

export const MOCK_REVIEWS: Review[] = [
    { id: 'rev1', patientId: 'pat3', doctorId: 'doc2', appointmentId: 'apt3', rating: 5, comment: 'Dr. Smith was fantastic! Very professional and made me feel at ease.', date: new Date().toISOString() },
    { id: 'rev2', patientId: 'pat1', doctorId: 'doc2', appointmentId: 'apt1', rating: 4, comment: 'Dr. Smith is very knowledgeable and caring. I had a great experience.', date: new Date().toISOString() },
];

export const MOCK_NOTIFICATIONS: Notification[] = [];