export enum Role {
  Doctor = 'Doctor',
  Patient = 'Patient',
  Receptionist = 'Receptionist',
}

export enum AppointmentStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rejected = 'Rejected'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
}

export interface WorkingHours {
  startTime: string; // "HH:mm" format
  endTime: string;   // "HH:mm" format
  isOff: boolean;
}

export interface Doctor extends User {
  specialty: string;
  address: string;
  fees: number;
  mobile: string;
  hospitalName?: string;
  workingSchedule?: { [day: string]: WorkingHours };
  profileComplete?: boolean;
}

export interface Patient extends User {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  medicalNotes?: string;
  weight?: number;
  profileComplete?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason: string;
  status: AppointmentStatus;
}

export interface MockGoogleAccount {
  id: string;
  name: string;
  email: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  uploadedBy: 'patient' | 'doctor';
  uploaderId: string;
  title: string;
  description: string;
  fileUrl: string; // Simulated URL
  fileType: 'pdf' | 'jpg' | 'png';
  dateUploaded: string; // ISO string
}

export interface Review {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
}

export enum NotificationType {
  Reminder = 'Reminder',
  Confirmation = 'Confirmation',
}

export interface Notification {
  id: string;
  userId: string;
  appointmentId: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  type: NotificationType;
}