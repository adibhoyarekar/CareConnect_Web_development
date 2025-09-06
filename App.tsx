import React, { useCallback, useState, useEffect } from 'react';
import { Appointment, Doctor, Patient, Role, User, MedicalRecord, Review, Notification } from './types';
import Login from './components/Login';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import Header from './components/Header';
import PatientOnboarding from './components/PatientOnboarding';
import DoctorOnboarding from './components/DoctorOnboarding';
import Spinner from './components/Spinner';
import PatientProfile from './components/PatientProfile';
import DoctorProfile from './components/DoctorProfile';
import ReceptionistProfile from './components/ReceptionistProfile';

const API_BASE_URL = 'https://careconnect-backend-45u6.onrender.com/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | Doctor | Patient | null>(() => {
    const savedUser = localStorage.getItem('careconnect_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
  
  // Data states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [receptionists, setReceptionists] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setDoctors(data.doctors);
      setPatients(data.patients);
      setReceptionists(data.receptionists);
      setAppointments(data.appointments);
      setMedicalRecords(data.medicalRecords);
      setReviews(data.reviews);
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Fetch data error:", error);
      setAuthError('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate reminders on initial load
  useEffect(() => {
    const generateReminders = async () => {
      try {
        await fetch(`${API_BASE_URL}/generate-reminders`, { method: 'POST' });
        fetchData(); // Refetch data to get new reminders
      } catch (error) {
        console.error("Failed to generate reminders:", error);
      }
    };
    generateReminders();
  }, []);


  const handleSignIn = async (credentials: {email: string, password: string}) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const user = await response.json();
      setCurrentUser(user);
      localStorage.setItem('careconnect_user', JSON.stringify(user));
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignUp = async (details: Omit<User, 'id'>) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Sign up failed');
        }
        const newUser = await response.json();
        setCurrentUser(newUser);
        localStorage.setItem('careconnect_user', JSON.stringify(newUser));
        await fetchData();
    } catch (error: any) {
        setAuthError(error.message);
    } finally {
        setIsAuthLoading(false);
    }
  };
  
  const handleSocialSignUp = async (role: Role, provider: 'Google' | 'Facebook', account: {name: string, email: string}) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
        const response = await fetch(`${API_BASE_URL}/social-signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, account }),
        });
         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Social sign up failed');
        }
        const user = await response.json();
        setCurrentUser(user);
        localStorage.setItem('careconnect_user', JSON.stringify(user));
        await fetchData();
    } catch (error: any) {
        setAuthError(error.message);
    } finally {
        setIsAuthLoading(false);
    }
  }

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('careconnect_user');
    setActiveView('dashboard');
  };

  const handleAddAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    const newAppointment = await response.json();
    setAppointments(prev => [...prev, newAppointment]);
  };

  const handleUpdateAppointment = async (appointment: Appointment) => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
    });
    const { updatedAppointment, notifications: updatedNotifications } = await response.json();
    setAppointments(prev => prev.map(a => (a.id === updatedAppointment.id ? updatedAppointment : a)));
    if (updatedNotifications) {
      setNotifications(updatedNotifications);
    }
  };

  // FIX: Add a function to handle deleting appointments
  const handleDeleteAppointment = async (id: string) => {
    const originalAppointments = [...appointments];
    setAppointments(prev => prev.filter(a => a.id !== id));
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        setAppointments(originalAppointments);
        console.error('Failed to delete appointment.');
      }
    } catch (error) {
      setAppointments(originalAppointments);
      console.error('Error deleting appointment:', error);
    }
  };

  const updateUserProfile = async (user: User | Doctor | Patient) => {
    const roleEndpoint = `${user.role.toLowerCase()}s`;
    const response = await fetch(`${API_BASE_URL}/${roleEndpoint}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
    const updatedUser = await response.json();
    
    setCurrentUser(updatedUser);
    localStorage.setItem('careconnect_user', JSON.stringify(updatedUser));
    
    // Update the specific user list
    if (user.role === Role.Doctor) {
        setDoctors(prev => prev.map(d => d.id === user.id ? updatedUser : d));
    } else if (user.role === Role.Patient) {
        setPatients(prev => prev.map(p => p.id === user.id ? updatedUser : p));
    } else if (user.role === Role.Receptionist) {
        setReceptionists(prev => prev.map(r => r.id === user.id ? updatedUser : r));
    }
    return updatedUser;
  };
  
  const handleAddMedicalRecord = async (record: Omit<MedicalRecord, 'id'>) => {
    const response = await fetch(`${API_BASE_URL}/medical-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    const newRecord = await response.json();
    setMedicalRecords(prev => [...prev, newRecord]);
  };
  
  const handleAddReview = async (review: Omit<Review, 'id'>) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    const newReview = await response.json();
    setReviews(prev => [...prev, newReview]);
  };
  
  const handleMarkNotificationAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
       setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
       await fetch(`${API_BASE_URL}/notifications/read`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id }),
       });
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    if (currentUser) {
      setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
    }
  };

  const renderDashboard = () => {
    if (!currentUser) return null;

    if ((currentUser.role === Role.Patient && !(currentUser as Patient).profileComplete) ||
        (currentUser.role === Role.Doctor && !(currentUser as Doctor).profileComplete)) {
      if (currentUser.role === Role.Patient) {
        return <PatientOnboarding patient={currentUser as Patient} onSave={updateUserProfile} />;
      }
      if (currentUser.role === Role.Doctor) {
        return <DoctorOnboarding doctor={currentUser as Doctor} onSave={updateUserProfile} />;
      }
    }
    
    if (activeView === 'profile') {
      switch (currentUser.role) {
        case Role.Patient:
          return <PatientProfile patient={currentUser as Patient} onSave={updateUserProfile} onBack={() => setActiveView('dashboard')} />;
        case Role.Doctor:
          return <DoctorProfile doctor={currentUser as Doctor} onSave={updateUserProfile} onBack={() => setActiveView('dashboard')} />;
        case Role.Receptionist:
          return <ReceptionistProfile user={currentUser as User} onSave={updateUserProfile} onBack={() => setActiveView('dashboard')} />;
      }
    }

    switch (currentUser.role) {
      case Role.Patient:
        return (
          <PatientDashboard
            patient={currentUser as Patient}
            appointments={appointments}
            patients={patients}
            doctors={doctors}
            medicalRecords={medicalRecords}
            reviews={reviews}
            addAppointment={handleAddAppointment}
            addMedicalRecord={handleAddMedicalRecord}
            addReview={handleAddReview}
          />
        );
      case Role.Doctor:
        return (
          <DoctorDashboard
            doctor={currentUser as Doctor}
            appointments={appointments}
            patients={patients}
            doctors={doctors}
            medicalRecords={medicalRecords}
            reviews={reviews}
            updateAppointment={handleUpdateAppointment}
            updateDoctorProfile={updateUserProfile}
            addMedicalRecord={handleAddMedicalRecord}
          />
        );
      case Role.Receptionist:
        return (
          <ReceptionistDashboard
            appointments={appointments}
            patients={patients as Patient[]}
            doctors={doctors as Doctor[]}
            medicalRecords={medicalRecords}
            reviews={reviews}
            updateAppointment={handleUpdateAppointment}
            addAppointment={handleAddAppointment}
            deleteAppointment={handleDeleteAppointment}
          />
        );
      default:
        return null;
    }
  };

  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);

  return (
    <div className="min-h-screen bg-primary-50 font-sans">
      {!currentUser ? (
        <Login onSignIn={handleSignIn} onSignUp={handleSignUp} onSocialSignUp={handleSocialSignUp} error={authError} isLoading={isAuthLoading} />
      ) : (
        <>
          <Header
            user={currentUser}
            onLogout={handleLogout}
            notifications={userNotifications}
            onMarkNotificationAsRead={handleMarkNotificationAsRead}
            onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
            onNavigateToProfile={() => setActiveView('profile')}
          />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {isLoading ? (
               <div className="flex flex-col justify-center items-center h-96">
                  <Spinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading your dashboard...</p>
               </div>
            ) : renderDashboard()}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
