import React, { useCallback, useState, useEffect } from 'react';
import { User, Role, Appointment, Patient, Doctor, MedicalRecord, Review, Notification } from './types';
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
import Spinner from './components/Spinner';

// IMPORTANT: Replace this URL with your actual Render backend URL
const API_BASE_URL = 'https://careconnect-backend-45u6.onrender.com/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [receptionists, setReceptionists] = useState<User[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [loginError, setLoginError] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'profile'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentUser) {
        setIsLoading(false);
        return;
    }
    try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setAppointments(data.appointments);
        setPatients(data.patients);
        setDoctors(data.doctors);
        setReceptionists(data.receptionists);
        setMedicalRecords(data.medicalRecords);
        setReviews(data.reviews);
        setNotifications(data.notifications);
        
        // Trigger reminder generation on the server
        await fetch(`${API_BASE_URL}/generate-reminders`, { method: 'POST' });

    } catch (error) {
        console.error("Error fetching data:", error);
        setLoginError("Could not connect to the server.");
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoginSuccess = (user: User) => {
      setLoginError(null);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setView('dashboard');
      setCurrentUser(user);
  };

  const handleSignIn = async (credentials: {email: string, password: string}) => {
    setIsAuthLoading(true);
    setLoginError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (response.ok) {
        handleLoginSuccess(data);
      } else {
        setLoginError(data.message || 'Invalid email or password.');
      }
    } catch (error) {
       setLoginError('Failed to connect to the server.');
    } finally {
        setIsAuthLoading(false);
    }
  };
  
  const handleSignUp = async (details: Omit<User, 'id'>) => {
     setIsAuthLoading(true);
     setLoginError(null);
     try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      const data = await response.json();
      if (response.ok) {
        handleLoginSuccess(data);
      } else {
        setLoginError(data.message || 'Failed to sign up.');
      }
    } catch (error) {
       setLoginError('Failed to connect to the server.');
    } finally {
        setIsAuthLoading(false);
    }
  };

  const handleSocialSignUp = async (role: Role, provider: 'Google' | 'Facebook', account: { name: string; email: string }) => {
    setIsAuthLoading(true);
    setLoginError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/social-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, account }),
      });
      const data = await response.json();
      if (response.ok) {
        const user = data; // API returns user if exists or newly created one
        handleLoginSuccess(user);
      } else {
        setLoginError(data.message || 'Social login failed.');
      }
    } catch (error) {
       setLoginError('Failed to connect to the server.');
    } finally {
       setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    // Clear all data on logout
    setAppointments([]);
    setPatients([]);
    setDoctors([]);
    setReceptionists([]);
    setMedicalRecords([]);
    setReviews([]);
    setNotifications([]);
  };

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    try {
        await fetch(`${API_BASE_URL}/notifications/read`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: notificationId }),
        });
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
        // Optionally revert state on failure
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    if(!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
    try {
        await fetch(`${API_BASE_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id }),
        });
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
    }
  }, [currentUser]);
  
  const addAppointment = useCallback(async (newAppointmentData: Omit<Appointment, 'id'>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAppointmentData),
        });
        const newAppointment = await response.json();
        if (response.ok) {
            setAppointments(prev => [...prev, newAppointment]);
        }
    } catch (error) {
        console.error("Failed to add appointment:", error);
    }
  }, []);
  
  const updateAppointment = useCallback(async (updatedAppointment: Appointment) => {
    try {
        const response = await fetch(`${API_BASE_URL}/appointments/${updatedAppointment.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedAppointment),
        });
        const data = await response.json();
        if (response.ok) {
            setAppointments(prev => prev.map(appt => appt.id === data.updatedAppointment.id ? data.updatedAppointment : appt));
            setNotifications(data.notifications); // Update notifications from server response
        }
    } catch (error) {
        console.error("Failed to update appointment:", error);
    }
  }, []);

  const updateProfile = useCallback(async (updatedUser: User | Doctor | Patient) => {
    const roleEndpoint = `${updatedUser.role.toLowerCase()}s`; // doctors, patients, receptionists
    try {
        const response = await fetch(`${API_BASE_URL}/${roleEndpoint}/${updatedUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser),
        });
        const savedUser = await response.json();
        if(response.ok) {
            switch(savedUser.role) {
                case Role.Doctor:
                    setDoctors(prev => prev.map(d => d.id === savedUser.id ? savedUser : d));
                    break;
                case Role.Patient:
                    setPatients(prev => prev.map(p => p.id === savedUser.id ? savedUser : p));
                    break;
                case Role.Receptionist:
                    setReceptionists(prev => prev.map(r => r.id === savedUser.id ? savedUser : r));
                    break;
            }
            setCurrentUser(savedUser);
            localStorage.setItem('currentUser', JSON.stringify(savedUser));
        }
    } catch (error) {
        console.error(`Failed to update ${updatedUser.role} profile:`, error);
    }
  }, []);

  const addMedicalRecord = useCallback(async (newRecordData: Omit<MedicalRecord, 'id'>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/medical-records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecordData),
        });
        const newRecord = await response.json();
        if (response.ok) {
            setMedicalRecords(prev => [...prev, newRecord]);
        }
    } catch(error) {
        console.error("Failed to add medical record:", error);
    }
  }, []);

  const addReview = useCallback(async (newReviewData: Omit<Review, 'id'>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReviewData),
        });
        const newReview = await response.json();
        if (response.ok) {
            setReviews(prev => [...prev, newReview]);
        }
    } catch(error) {
        console.error("Failed to add review:", error);
    }
  }, []);

  const renderMainContent = () => {
    if (!currentUser) return null;
    if (isLoading) {
        return (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <Spinner size="lg" />
            <div className="text-lg text-gray-600">Loading your dashboard...</div>
          </div>
        );
    }

    if (view === 'profile') {
       switch (currentUser.role) {
         case Role.Doctor:
           return <DoctorProfile doctor={doctors.find(d => d.id === currentUser.id)!} onSave={updateProfile} onBack={() => setView('dashboard')} />;
         case Role.Patient:
           return <PatientProfile patient={patients.find(p => p.id === currentUser.id)!} onSave={updateProfile} onBack={() => setView('dashboard')} />;
         case Role.Receptionist:
           return <ReceptionistProfile user={currentUser} onSave={updateProfile} onBack={() => setView('dashboard')} />;
         default:
           return <div>Invalid Role</div>;
       }
    }

    // Default to dashboard view
    switch (currentUser.role) {
      case Role.Doctor:
        const doctor = doctors.find(d => d.id === currentUser.id) as Doctor;
        if (!doctor.profileComplete) {
            return <DoctorOnboarding doctor={doctor} onSave={updateProfile} />;
        }
        return <DoctorDashboard 
                  doctor={doctor} 
                  appointments={appointments}
                  patients={patients}
                  doctors={doctors}
                  medicalRecords={medicalRecords}
                  reviews={reviews}
                  updateAppointment={updateAppointment}
                  updateDoctorProfile={updateProfile}
                  addMedicalRecord={addMedicalRecord}
                />;
      case Role.Patient:
        const patient = patients.find(p => p.id === currentUser.id) as Patient;
        if (!patient.profileComplete) {
            return <PatientOnboarding patient={patient} onSave={updateProfile} />;
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
    return <Login onSignIn={handleSignIn} onSignUp={handleSignUp} onSocialSignUp={handleSocialSignUp} error={loginError} isLoading={isAuthLoading} />;
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