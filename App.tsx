import React, { useCallback, useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { User, Role, Appointment, Patient, Doctor, MedicalRecord, Review, Notification, AppointmentStatus, NotificationType } from './types';
import Login from './components/Login';
import Header from './components/Header';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import DoctorOnboarding from './components/DoctorOnboarding';
import PatientOnboarding from './components/PatientOnboarding';
import DoctorProfile from './components/DoctorProfile';
import PatientProfile from './components/PatientProfile';
import ReceptionistProfile from './components/ReceptionistProfile';
import { MOCK_APPOINTMENTS, MOCK_DOCTORS, MOCK_PATIENTS, MOCK_RECEPTIONIST, MOCK_MEDICAL_RECORDS, MOCK_REVIEWS, MOCK_NOTIFICATIONS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', MOCK_APPOINTMENTS);
  const [patients, setPatients] = useLocalStorage<Patient[]>('patients', MOCK_PATIENTS);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>('doctors', MOCK_DOCTORS);
  const [receptionists, setReceptionists] = useLocalStorage<User[]>('receptionists', [MOCK_RECEPTIONIST]);
  const [medicalRecords, setMedicalRecords] = useLocalStorage<MedicalRecord[]>('medicalRecords', MOCK_MEDICAL_RECORDS);
  const [reviews, setReviews] = useLocalStorage<Review[]>('reviews', MOCK_REVIEWS);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', MOCK_NOTIFICATIONS);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'profile'>('dashboard');

  // Reminder generation logic, runs on login
  useEffect(() => {
    if (!currentUser) return;

    const getTomorrowsDate = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    };

    const tomorrowsDate = getTomorrowsDate();

    const upcomingAppointments = appointments.filter(
      appt => appt.date === tomorrowsDate && appt.status === AppointmentStatus.Confirmed
    );

    let newNotifications: Notification[] = [];

    upcomingAppointments.forEach(appt => {
      const patient = patients.find(p => p.id === appt.patientId);
      const doctor = doctors.find(d => d.id === appt.doctorId);
      if (!patient || !doctor) return;

      const patientNotifExists = notifications.some(
        n => n.appointmentId === appt.id && n.userId === patient.id && n.type === NotificationType.Reminder
      );
      if (!patientNotifExists) {
        newNotifications.push({
          id: `notif-p-${appt.id}`,
          userId: patient.id,
          appointmentId: appt.id,
          message: `Reminder: You have an appointment with ${doctor.name} tomorrow at ${appt.time}.`,
          date: new Date().toISOString(),
          read: false,
          type: NotificationType.Reminder,
        });
      }
      
      const doctorNotifExists = notifications.some(
        n => n.appointmentId === appt.id && n.userId === doctor.id && n.type === NotificationType.Reminder
      );
      if (!doctorNotifExists) {
        newNotifications.push({
          id: `notif-d-${appt.id}`,
          userId: doctor.id,
          appointmentId: appt.id,
          message: `Reminder: You have an appointment with ${patient.name} tomorrow at ${appt.time}.`,
          date: new Date().toISOString(),
          read: false,
          type: NotificationType.Reminder,
        });
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleSignIn = ({ email, password }: {email: string, password: string}) => {
    setLoginError(null);
    const allUsers = [...doctors, ...patients, ...receptionists];
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setView('dashboard');
      setCurrentUser(user);
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleSignUp = (details: Omit<User, 'id'>) => {
    setLoginError(null);
    const allUsers = [...doctors, ...patients, ...receptionists];
    if (allUsers.some(u => u.email.toLowerCase() === details.email.toLowerCase())) {
        setLoginError('An account with this email already exists.');
        return;
    }
    
    const newUser: User = {
        ...details,
        id: `${details.role.toLowerCase()}-${Date.now()}`
    };

    if (newUser.role === Role.Doctor) {
        const newDoctor: Doctor = {
            ...newUser,
            specialty: '', address: '', fees: 0, mobile: '', profileComplete: false
        };
        setDoctors(prev => [...prev, newDoctor]);
        setView('dashboard');
        setCurrentUser(newDoctor);
    } else if (newUser.role === Role.Patient) {
        const newPatient: Patient = {
            ...newUser,
            age: 0, gender: 'Other', contact: '', profileComplete: false
        };
        setPatients(prev => [...prev, newPatient]);
        setView('dashboard');
        setCurrentUser(newPatient);
    } else if (newUser.role === Role.Receptionist) {
        setReceptionists(prev => [...prev, newUser]);
        setView('dashboard');
        setCurrentUser(newUser);
    }
  };

  const handleSocialSignUp = (role: Role, provider: 'Google' | 'Facebook', account: { name: string; email: string }) => {
    setLoginError(null);
    const allUsers = [...doctors, ...patients, ...receptionists];
    if (allUsers.some(u => u.email.toLowerCase() === account.email.toLowerCase())) {
        setLoginError('An account with this email already exists. Please sign in.');
        return;
    }

    const newUserBase = {
        name: account.name,
        email: account.email,
        password: 'social_login_password',
        role: role,
        id: `${role.toLowerCase()}-${Date.now()}`
    };

    if (role === Role.Doctor) {
        const newDoctor: Doctor = {
            ...newUserBase,
            specialty: '', address: '', fees: 0, mobile: '', profileComplete: false
        };
        setDoctors(prev => [...prev, newDoctor]);
        setView('dashboard');
        setCurrentUser(newDoctor);
    } else if (role === Role.Patient) {
        const newPatient: Patient = {
            ...newUserBase,
            age: 0, gender: 'Other', contact: '', profileComplete: false, weight: 0
        };
        setPatients(prev => [...prev, newPatient]);
        setView('dashboard');
        setCurrentUser(newPatient);
    }
  };


  const handleLogout = () => {
    setCurrentUser(null);
  };

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, [setNotifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    if(!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  }, [currentUser, setNotifications]);
  
  const addAppointment = useCallback((newAppointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...newAppointmentData,
      id: `apt-${Date.now()}-${Math.random()}`,
    };
    setAppointments(prev => [...prev, newAppointment]);
  }, [setAppointments]);
  
  const updateAppointment = useCallback((updatedAppointment: Appointment) => {
    const previousAppointment = appointments.find(appt => appt.id === updatedAppointment.id);

    // If status changed to 'Confirmed', create notifications
    if (previousAppointment && previousAppointment.status !== AppointmentStatus.Confirmed && updatedAppointment.status === AppointmentStatus.Confirmed) {
      const patient = patients.find(p => p.id === updatedAppointment.patientId);
      const doctor = doctors.find(d => d.id === updatedAppointment.doctorId);

      if (patient && doctor) {
        const newNotifications: Notification[] = [];
        
        const patientNotifExists = notifications.some(n => n.appointmentId === updatedAppointment.id && n.userId === patient.id && n.type === NotificationType.Confirmation);
        if (!patientNotifExists) {
            newNotifications.push({
                id: `notif-confirm-p-${updatedAppointment.id}`,
                userId: patient.id,
                appointmentId: updatedAppointment.id,
                message: `Your appointment with ${doctor.name} on ${updatedAppointment.date} at ${updatedAppointment.time} for "${updatedAppointment.reason}" has been confirmed.`,
                date: new Date().toISOString(),
                read: false,
                type: NotificationType.Confirmation,
            });
        }

        const doctorNotifExists = notifications.some(n => n.appointmentId === updatedAppointment.id && n.userId === doctor.id && n.type === NotificationType.Confirmation);
        if (!doctorNotifExists) {
            newNotifications.push({
                id: `notif-confirm-d-${updatedAppointment.id}`,
                userId: doctor.id,
                appointmentId: updatedAppointment.id,
                message: `Your appointment with ${patient.name} on ${updatedAppointment.date} at ${updatedAppointment.time} for "${updatedAppointment.reason}" has been confirmed.`,
                date: new Date().toISOString(),
                read: false,
                type: NotificationType.Confirmation,
            });
        }
        
        if (newNotifications.length > 0) {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
      }
    }
    setAppointments(prev => prev.map(appt => appt.id === updatedAppointment.id ? updatedAppointment : appt));
  }, [appointments, doctors, patients, setAppointments, notifications, setNotifications]);

  const updateDoctorProfile = useCallback((updatedDoctor: Doctor) => {
    setDoctors(prev => prev.map(doc => doc.id === updatedDoctor.id ? updatedDoctor : doc));
    setCurrentUser(updatedDoctor);
  }, [setDoctors, setCurrentUser]);

  const updatePatientProfile = useCallback((updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setCurrentUser(updatedPatient);
  }, [setPatients, setCurrentUser]);

  const updateReceptionistProfile = useCallback((updatedUser: User) => {
    setReceptionists(prev => prev.map(r => r.id === updatedUser.id ? updatedUser : r));
    setCurrentUser(updatedUser);
  }, [setReceptionists, setCurrentUser]);


  const addMedicalRecord = useCallback((newRecordData: Omit<MedicalRecord, 'id'>) => {
    const newRecord: MedicalRecord = {
      ...newRecordData,
      id: `rec-${Date.now()}-${Math.random()}`,
    };
    setMedicalRecords(prev => [...prev, newRecord]);
  }, [setMedicalRecords]);

  const addReview = useCallback((newReviewData: Omit<Review, 'id'>) => {
    const newReview: Review = {
      ...newReviewData,
      id: `rev-${Date.now()}-${Math.random()}`,
    };
    setReviews(prev => [...prev, newReview]);
  }, [setReviews]);


  const renderMainContent = () => {
    if (!currentUser) return null;

    if (view === 'profile') {
       switch (currentUser.role) {
         case Role.Doctor:
           return <DoctorProfile doctor={doctors.find(d => d.id === currentUser.id)!} onSave={updateDoctorProfile} onBack={() => setView('dashboard')} />;
         case Role.Patient:
           return <PatientProfile patient={patients.find(p => p.id === currentUser.id)!} onSave={updatePatientProfile} onBack={() => setView('dashboard')} />;
         case Role.Receptionist:
           return <ReceptionistProfile user={currentUser} onSave={updateReceptionistProfile} onBack={() => setView('dashboard')} />;
         default:
           return <div>Invalid Role</div>;
       }
    }

    // Default to dashboard view
    switch (currentUser.role) {
      case Role.Doctor:
        const doctor = doctors.find(d => d.id === currentUser.id) as Doctor;
        if (!doctor.profileComplete) {
            return <DoctorOnboarding doctor={doctor} onSave={updateDoctorProfile} />;
        }
        return <DoctorDashboard 
                  doctor={doctor} 
                  appointments={appointments}
                  patients={patients}
                  doctors={doctors}
                  medicalRecords={medicalRecords}
                  reviews={reviews}
                  updateAppointment={updateAppointment}
                  updateDoctorProfile={updateDoctorProfile}
                  addMedicalRecord={addMedicalRecord}
                />;
      case Role.Patient:
        const patient = patients.find(p => p.id === currentUser.id) as Patient;
        if (!patient.profileComplete) {
            return <PatientOnboarding patient={patient} onSave={updatePatientProfile} />;
        }
        return <PatientDashboard 
                  patient={patient} 
                  appointments={appointments}
                  patients={patients}
                  doctors={doctors}
                  medicalRecords={medicalRecords}
                  reviews={reviews}
                  addAppointment={addAppointment}
                  addMedicalRecord={addMedicalRecord}
                  addReview={addReview}
                />;
      case Role.Receptionist:
        return <ReceptionistDashboard 
                  user={currentUser}
                  appointments={appointments}
                  patients={patients}
                  doctors={doctors}
                  reviews={reviews}
                  addAppointment={addAppointment}
                  updateAppointment={updateAppointment}
                />;
      default:
        return <div>Invalid Role</div>;
    }
  };

  if (!currentUser) {
    return <Login onSignIn={handleSignIn} onSignUp={handleSignUp} onSocialSignUp={handleSocialSignUp} error={loginError} />;
  }

  const userNotifications = notifications.filter(n => n.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-transparent text-gray-700">
      <Header 
        user={currentUser} 
        onLogout={handleLogout}
        notifications={userNotifications}
        onMarkNotificationAsRead={markNotificationAsRead}
        onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
        onNavigateToProfile={() => setView('profile')}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default App;