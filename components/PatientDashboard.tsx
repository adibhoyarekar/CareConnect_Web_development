import React, { useState, useMemo } from 'react';
import { Appointment, Doctor, Patient, AppointmentStatus, Role, MedicalRecord, Review, HealthHistoryItem } from '../types';
import AppointmentTable from './AppointmentTable';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';
import MedicalRecordUploadForm from './MedicalRecordUploadForm';
import ReviewModal from './ReviewModal';
import { sortAppointmentsChronologically } from '../utils/sorting';
import AIAgentModal from './AIAgentModal';
import { SparklesIcon } from './icons/SparklesIcon';

interface PatientDashboardProps {
  patient: Patient;
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  medicalRecords: MedicalRecord[];
  reviews: Review[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => Promise<void>;
  addReview: (review: Omit<Review, 'id'>) => Promise<void>;
  onNavigateToProfile: () => void;
}

// Health History Display Component for Dashboard
const HealthHistorySummary: React.FC<{ history: HealthHistoryItem[], onManage: () => void }> = ({ history = [], onManage }) => {
  const typeStyles = {
    condition: { icon: '❤️', color: 'bg-blue-100 text-blue-800' },
    illness: { icon: '🤒', color: 'bg-yellow-100 text-yellow-800' },
    surgery: { icon: '🔪', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-3d">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Your Health History</h3>
        <button
          onClick={onManage}
          className="text-sm text-primary-600 hover:underline"
        >
          View & Manage
        </button>
      </div>
      {history.length > 0 ? (
        <ul className="space-y-3 max-h-60 overflow-y-auto">
          {history.slice(0, 4).map(item => ( // Show first 4 items
             <li key={item.id} className="p-3 bg-gray-100 rounded-lg flex items-start space-x-3">
               <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${typeStyles[item.type].color}`}>{typeStyles[item.type].icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
            </li>
          ))}
          {history.length > 4 && <p className="text-center text-sm text-gray-500 pt-2">...and {history.length - 4} more.</p>}
        </ul>
      ) : (
        <div className="text-center py-8">
            <p className="text-gray-500">No health history recorded yet.</p>
            <button onClick={onManage} className="mt-2 text-sm text-primary-600 font-semibold hover:underline">Click here to add your first item</button>
        </div>
      )}
    </div>
  );
}


const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient, appointments, patients, doctors, medicalRecords, reviews, addAppointment, addMedicalRecord, addReview, onNavigateToProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [reviewingAppointment, setReviewingAppointment] = useState<Appointment | null>(null);
  
  const patientAppointments = useMemo(() => {
    const filtered = appointments
      .filter(appt => appt.patientId === patient.id);
    return sortAppointmentsChronologically(filtered, 'desc');
  }, [appointments, patient.id]);

  const patientMedicalRecords = useMemo(() => medicalRecords.filter(r => r.patientId === patient.id), [medicalRecords, patient.id]);
  const patientUploads = patientMedicalRecords.filter(r => r.uploadedBy === 'patient');
  const doctorUploads = patientMedicalRecords.filter(r => r.uploadedBy === 'doctor');


  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id'> | Appointment) => {
    await addAppointment(appointmentData);
    setIsModalOpen(false);
  };

  const handleSaveMedicalRecord = async (recordData: Omit<MedicalRecord, 'id' | 'patientId' | 'uploadedBy' | 'uploaderId'>) => {
    await addMedicalRecord({
        ...recordData,
        patientId: patient.id,
        uploadedBy: 'patient',
        uploaderId: patient.id,
        dateUploaded: new Date().toISOString(),
        fileType: 'pdf', // a default for simulation
        fileUrl: '#'
    });
    setIsUploadModalOpen(false);
  }

  const handleOpenReviewModal = (appointment: Appointment) => {
    setReviewingAppointment(appointment);
    setIsReviewModalOpen(true);
  }

  const handleSaveReview = async (reviewData: Omit<Review, 'id'>) => {
    await addReview(reviewData);
    setIsReviewModalOpen(false);
    setReviewingAppointment(null);
  }

  const upcomingAppointment = patientAppointments.find(a => new Date(`${a.date}T${a.time}`) > new Date() && a.status === AppointmentStatus.Confirmed);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-3d">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {patient.name}</h2>
        {upcomingAppointment ? (
            <p className="text-gray-600 mt-2">
                Your next appointment is on <span className="font-bold text-primary-600">{new Date(upcomingAppointment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} at {upcomingAppointment.time}</span> with {doctors.find(d => d.id === upcomingAppointment.doctorId)?.name}.
            </p>
        ) : (
             <p className="text-gray-600 mt-2">You have no upcoming appointments.</p>
        )}
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-3d">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Your Appointments</h3>
          <div className="flex items-center space-x-2">
             <button
                onClick={() => setIsAiModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <SparklesIcon />
                Book with AI
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Book Manually
              </button>
          </div>
        </div>
        <AppointmentTable
          appointments={patientAppointments}
          patients={patients}
          doctors={doctors}
          reviews={reviews}
          currentUserRole={Role.Patient}
          onLeaveReview={handleOpenReviewModal}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-3d">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Your Medical Records</h3>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Upload New Record
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">Your Uploads</h4>
                  {patientUploads.length > 0 ? (
                      <ul className="space-y-3 max-h-60 overflow-y-auto">
                          {patientUploads.map(rec => (
                              <li key={rec.id} className="p-3 bg-gray-100 rounded-lg">
                                  <p className="font-semibold text-gray-800">{rec.title} <span className="text-xs font-normal text-gray-500">({rec.fileType})</span></p>
                                  <p className="text-sm text-gray-600">{rec.description}</p>
                                  <p className="text-xs text-gray-500 mt-1">Uploaded on {new Date(rec.dateUploaded).toLocaleDateString()}</p>
                              </li>
                          ))}
                      </ul>
                  ) : <p className="text-gray-500">You haven't uploaded any records.</p>}
              </div>
               <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">From Your Doctor</h4>
                  {doctorUploads.length > 0 ? (
                      <ul className="space-y-3 max-h-60 overflow-y-auto">
                           {doctorUploads.map(rec => (
                              <li key={rec.id} className="p-3 bg-gray-100 rounded-lg">
                                  <p className="font-semibold text-gray-800">{rec.title} <span className="text-xs font-normal text-gray-500">({rec.fileType})</span></p>
                                  <p className="text-sm text-gray-600">{rec.description}</p>
                                  <p className="text-xs text-gray-500 mt-1">Uploaded by {doctors.find(d => d.id === rec.uploaderId)?.name} on {new Date(rec.dateUploaded).toLocaleDateString()}</p>
                              </li>
                          ))}
                      </ul>
                  ) : <p className="text-gray-500">No records from your doctor yet.</p>}
              </div>
          </div>
        </div>

        <HealthHistorySummary history={patient.healthHistory || []} onManage={onNavigateToProfile} />
      </div>


      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book an Appointment">
        <AppointmentForm
          appointments={appointments}
          patients={patients}
          doctors={doctors}
          reviews={reviews}
          onSave={handleSaveAppointment}
          onClose={() => setIsModalOpen(false)}
          currentUserId={patient.id}
          currentUserRole={Role.Patient}
        />
      </Modal>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Medical Record">
        <MedicalRecordUploadForm onSave={handleSaveMedicalRecord} onClose={() => setIsUploadModalOpen(false)} />
      </Modal>

      {reviewingAppointment && (
        <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => {
                setIsReviewModalOpen(false);
                setReviewingAppointment(null);
            }}
            onSubmit={handleSaveReview}
            appointment={reviewingAppointment}
            patient={patient}
            doctor={doctors.find(d => d.id === reviewingAppointment.doctorId)!}
        />
      )}
      
      {isAiModalOpen && (
        <AIAgentModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          patient={patient}
          doctors={doctors}
          appointments={appointments}
          onAppointmentBooked={async (appointmentData) => {
            await addAppointment(appointmentData);
            setIsAiModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PatientDashboard;