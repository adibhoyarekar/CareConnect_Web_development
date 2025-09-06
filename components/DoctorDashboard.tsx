import React, { useMemo, useState } from 'react';
import { Appointment, Doctor, Patient, AppointmentStatus, MedicalRecord, Review } from '../types';
import AppointmentTable from './AppointmentTable';
import Modal from './Modal';
import { exportToExcel } from '../utils/excelExport';
import MedicalRecordUploadForm from './MedicalRecordUploadForm';
import Spinner from './Spinner';

interface DoctorDashboardProps {
  doctor: Doctor;
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  medicalRecords: MedicalRecord[];
  reviews: Review[];
  updateAppointment: (appointment: Appointment) => Promise<void>;
  updateDoctorProfile: (doctor: Doctor) => Promise<void>;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => Promise<void>;
}

const DoctorProfileForm: React.FC<{doctor: Doctor, onSave: (doctor: Doctor) => Promise<void>, onClose: () => void}> = ({doctor, onSave, onClose}) => {
    const [formData, setFormData] = useState({
        hospitalName: doctor.hospitalName || '',
        address: doctor.address || '',
        specialty: doctor.specialty || '',
        availableTime: doctor.availableTime || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3";
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, [e.target.name]: e.target.value});
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({...doctor, ...formData});
        setIsSaving(false);
        onClose();
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">Hospital/Clinic Name</label>
                <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} className={inputBaseClasses} required />
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Work Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputBaseClasses} required />
            </div>
            <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className={inputBaseClasses} required />
            </div>
            <div>
                <label htmlFor="availableTime" className="block text-sm font-medium text-gray-700">Available Times</label>
                <input type="text" name="availableTime" value={formData.availableTime} onChange={handleChange} className={inputBaseClasses} required />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">Cancel</button>
                <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-75">
                    {isSaving ? <Spinner size="sm" color="text-white" /> : 'Save Changes'}
                </button>
            </div>
        </form>
    )
}


const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor, appointments, patients, doctors, medicalRecords, reviews, updateAppointment, updateDoctorProfile, addMedicalRecord }) => {
  const [filter, setFilter] = useState<AppointmentStatus | 'All'>('All');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isRecordUploadModalOpen, setIsRecordUploadModalOpen] = useState(false);
  
  const doctorAppointments = useMemo(() => {
    return appointments
      .filter(appt => appt.doctorId === doctor.id)
      .filter(appt => filter === 'All' || appt.status === filter)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, doctor.id, filter]);

  const doctorReviews = useMemo(() => reviews.filter(r => r.doctorId === doctor.id), [reviews, doctor.id]);
  const averageRating = useMemo(() => {
    if (doctorReviews.length === 0) return 0;
    return doctorReviews.reduce((acc, r) => acc + r.rating, 0) / doctorReviews.length;
  }, [doctorReviews]);
  
  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    const appointmentToUpdate = appointments.find(appt => appt.id === id);
    if (appointmentToUpdate) {
      updateAppointment({ ...appointmentToUpdate, status });
    }
  };
  
  const handleExport = () => {
    exportToExcel(doctorAppointments, patients, doctors);
  }

  const handlePatientClick = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setIsPatientModalOpen(true);
    }
  };

  const handleSaveMedicalRecord = async (recordData: Omit<MedicalRecord, 'id' | 'patientId' | 'uploadedBy' | 'uploaderId'>) => {
    if (selectedPatient) {
        await addMedicalRecord({
            ...recordData,
            patientId: selectedPatient.id,
            uploadedBy: 'doctor',
            uploaderId: doctor.id,
            dateUploaded: new Date().toISOString(),
            fileType: 'pdf', // a default for simulation
            fileUrl: '#'
        });
        setIsRecordUploadModalOpen(false);
    }
  }

  const upcomingAppointments = doctorAppointments.filter(a => new Date(a.date) >= new Date() && a.status !== AppointmentStatus.Completed && a.status !== AppointmentStatus.Cancelled && a.status !== AppointmentStatus.Rejected);
  
  const patientRecords = selectedPatient ? medicalRecords.filter(r => r.patientId === selectedPatient.id) : [];
  const patientUploads = patientRecords.filter(r => r.uploadedBy === 'patient');
  const doctorUploads = patientRecords.filter(r => r.uploadedBy === 'doctor');

  return (
    <>
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {doctor.name}</h2>
              <p className="text-gray-600">You have <span className="font-bold text-primary-600">{upcomingAppointments.length}</span> upcoming appointments.</p>
            </div>
            <button
                onClick={() => setIsProfileModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Edit Profile
              </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-semibold text-gray-800">Your Rating</h3>
            <p className="text-4xl font-bold text-yellow-500 mt-2">
                {averageRating.toFixed(1)} <span className="text-2xl">⭐</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">from {doctorReviews.length} reviews</p>
            <button 
                onClick={() => setIsReviewModalOpen(true)} 
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
            >
                View All Reviews
            </button>
        </div>
      </div>


      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Your Appointments</h3>
          <div className="flex items-center space-x-4">
             <select 
               value={filter} 
               onChange={(e) => setFilter(e.target.value as AppointmentStatus | 'All')}
               className="block pl-3 pr-10 py-2 text-base rounded-md sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500"
             >
               <option value="All">All Statuses</option>
               {Object.values(AppointmentStatus).map(status => (
                 <option key={status} value={status}>{status}</option>
               ))}
             </select>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Export to Excel
            </button>
          </div>
        </div>
        <AppointmentTable
          appointments={doctorAppointments}
          patients={patients}
          doctors={doctors}
          currentUserRole={doctor.role}
          onStatusChange={handleStatusChange}
          onPatientClick={handlePatientClick}
        />
      </div>
    </div>
     <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Edit Your Profile">
        <DoctorProfileForm doctor={doctor} onSave={updateDoctorProfile} onClose={() => setIsProfileModalOpen(false)} />
     </Modal>
     <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} title={`Patient Details: ${selectedPatient?.name}`}>
        {selectedPatient && <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-lg text-gray-900">Patient Uploaded Records</h4>
                {patientUploads.length > 0 ? (
                    <ul className="space-y-3 mt-2 max-h-60 overflow-y-auto">
                        {patientUploads.map(rec => (
                            <li key={rec.id} className="p-3 bg-gray-100 rounded-lg">
                                <p className="font-semibold text-gray-800">{rec.title} <span className="text-xs font-normal text-gray-500">({rec.fileType})</span></p>
                                <p className="text-sm text-gray-600">{rec.description}</p>
                                <p className="text-xs text-gray-500 mt-1">Uploaded on {new Date(rec.dateUploaded).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-500 mt-2">No records uploaded by the patient.</p>}
            </div>

            <div>
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg text-gray-900">Clinic Uploaded Reports</h4>
                    <button onClick={() => setIsRecordUploadModalOpen(true)} className="text-sm text-primary-600 hover:underline">Upload New Report</button>
                </div>
                 {doctorUploads.length > 0 ? (
                    <ul className="space-y-3 mt-2 max-h-60 overflow-y-auto">
                        {doctorUploads.map(rec => {
                             const uploader = doctors.find(d => d.id === rec.uploaderId);
                             const uploaderName = uploader ? uploader.name : 'A doctor';
                             return (
                                <li key={rec.id} className="p-3 bg-gray-100 rounded-lg">
                                    <p className="font-semibold text-gray-800">{rec.title} <span className="text-xs font-normal text-gray-500">({rec.fileType})</span></p>
                                    <p className="text-sm text-gray-600">{rec.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">Uploaded by {uploaderName} on {new Date(rec.dateUploaded).toLocaleDateString()}</p>
                                </li>
                             )
                        })}
                    </ul>
                ) : <p className="text-gray-500 mt-2">No reports uploaded by the clinic for this patient.</p>}
            </div>
        </div>}
     </Modal>
     <Modal isOpen={isRecordUploadModalOpen} onClose={() => setIsRecordUploadModalOpen(false)} title={`Upload for ${selectedPatient?.name}`}>
        <MedicalRecordUploadForm onSave={handleSaveMedicalRecord} onClose={() => setIsRecordUploadModalOpen(false)} />
     </Modal>
     <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="Patient Reviews">
        <div className="space-y-4 max-h-96 overflow-y-auto">
            {doctorReviews.length > 0 ? doctorReviews.map(review => {
                const patient = patients.find(p => p.id === review.patientId);
                return (
                    <div key={review.id} className="p-4 bg-gray-100 rounded-lg">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-gray-800">{patient?.name || 'Anonymous'}</p>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 mt-2 italic">"{review.comment}"</p>
                        <p className="text-xs text-gray-500 text-right mt-2">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                );
            }) : <p className="text-gray-500 text-center">You have no reviews yet.</p>}
        </div>
     </Modal>
    </>
  );
};

export default DoctorDashboard;
