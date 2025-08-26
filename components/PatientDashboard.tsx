import React, { useState, useMemo } from 'react';
import { Appointment, Doctor, Patient, AppointmentStatus, Role, MedicalRecord, Review } from '../types';
import AppointmentTable from './AppointmentTable';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';
import MedicalRecordUploadForm from './MedicalRecordUploadForm';
import ReviewModal from './ReviewModal';

interface PatientDashboardProps {
  patient: Patient;
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  medicalRecords: MedicalRecord[];
  reviews: Review[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => void;
  addReview: (review: Omit<Review, 'id'>) => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient, appointments, patients, doctors, medicalRecords, reviews, addAppointment, addMedicalRecord, addReview }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingAppointment, setReviewingAppointment] = useState<Appointment | null>(null);
  
  const patientAppointments = useMemo(() => {
    return appointments
      .filter(appt => appt.patientId === patient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, patient.id]);

  const patientMedicalRecords = useMemo(() => medicalRecords.filter(r => r.patientId === patient.id), [medicalRecords, patient.id]);
  const patientUploads = patientMedicalRecords.filter(r => r.uploadedBy === 'patient');
  const doctorUploads = patientMedicalRecords.filter(r => r.uploadedBy === 'doctor');


  const handleSaveAppointment = (appointmentData: Omit<Appointment, 'id'> | Appointment) => {
    addAppointment(appointmentData);
    setIsModalOpen(false);
  };

  const handleSaveMedicalRecord = (recordData: Omit<MedicalRecord, 'id' | 'patientId' | 'uploadedBy' | 'uploaderId'>) => {
    addMedicalRecord({
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

  const handleSaveReview = (reviewData: Omit<Review, 'id'>) => {
    addReview(reviewData);
    setIsReviewModalOpen(false);
    setReviewingAppointment(null);
  }

  const upcomingAppointment = patientAppointments.find(a => new Date(`${a.date}T${a.time}`) > new Date() && a.status === AppointmentStatus.Confirmed);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {patient.name}</h2>
        {upcomingAppointment ? (
            <p className="text-gray-600 mt-2">
                Your next appointment is on <span className="font-bold text-primary-600">{upcomingAppointment.date} at {upcomingAppointment.time}</span> with {doctors.find(d => d.id === upcomingAppointment.doctorId)?.name}.
            </p>
        ) : (
             <p className="text-gray-600 mt-2">You have no upcoming appointments.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Your Appointments</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            Book New Appointment
          </button>
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

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Your Medical Records</h3>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            Upload Record
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2">Your Uploads</h4>
                {patientUploads.length > 0 ? (
                    <ul className="space-y-3">
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
                    <ul className="space-y-3">
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
    </div>
  );
};

export default PatientDashboard;