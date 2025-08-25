import React, { useCallback, useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { User, Role, Appointment, Patient, Doctor, MedicalRecord, Review } from './types';
import Login from './components/Login';
import Header from './components/Header';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import DoctorOnboarding from './components/DoctorOnboarding';
import PatientOnboarding from './components/PatientOnboarding';
import { MOCK_APPOINTMENTS, MOCK_DOCTORS, MOCK_PATIENTS, MOCK_RECEPTIONIST, MOCK_MEDICAL_RECORDS, MOCK_REVIEWS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', MOCK_APPOINTMENTS);
  const [patients, setPatients] = useLocalStorage<Patient[]>('patients', MOCK_PATIENTS);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>('doctors', MOCK_DOCTORS);
  const [receptionists, setReceptionists] = useLocalStorage<User[]>('receptionists', [MOCK_RECEPTIONIST]);
  const [medicalRecords, setMedicalRecords] = useLocalStorage<MedicalRecord[]>('medicalRecords', MOCK_MEDICAL_RECORDS);
  const [reviews, setReviews] = useLocalStorage<Review[]>('reviews', MOCK_REVIEWS);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSignIn = ({ email, password }: {email: string, password: string}) => {
    setLoginError(null);
    const allUsers = [...doctors, ...patients, ...receptionists];
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
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
        setCurrentUser(newDoctor);
    } else if (newUser.role === Role.Patient) {
        const newPatient: Patient = {
            ...newUser,
            age: 0, gender: 'Other', contact: '', profileComplete: false
        };
        setPatients(prev => [...prev, newPatient]);
        setCurrentUser(newPatient);
    } else if (newUser.role === Role.Receptionist) {
        setReceptionists(prev => [...prev, newUser]);
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
        setCurrentUser(newDoctor);
    } else if (role === Role.Patient) {
        const newPatient: Patient = {
            ...newUserBase,
            age: 0, gender: 'Other', contact: '', profileComplete: false, weight: 0
        };
        setPatients(prev => [...prev, newPatient]);
        setCurrentUser(newPatient);
    }
  };


  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const addAppointment = useCallback((newAppointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...newAppointmentData,
      id: `apt-${Date.now()}-${Math.random()}`,
    };
    setAppointments(prev => [...prev, newAppointment]);
  }, [setAppointments]);
  
  const updateAppointment = useCallback((updatedAppointment: Appointment) => {
    setAppointments(prev => prev.map(appt => appt.id === updatedAppointment.id ? updatedAppointment : appt));
  }, [setAppointments]);

  const updateDoctorProfile = useCallback((updatedDoctor: Doctor) => {
    setDoctors(prev => prev.map(doc => doc.id === updatedDoctor.id ? updatedDoctor : doc));
    setCurrentUser(updatedDoctor);
  }, [setDoctors, setCurrentUser]);

  const updatePatientProfile = useCallback((updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setCurrentUser(updatedPatient);
  }, [setPatients, setCurrentUser]);

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


  const renderDashboard = () => {
    if (!currentUser) return null;

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

  return (
    <div className="min-h-screen bg-transparent text-gray-700">
      <Header user={currentUser} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default App;