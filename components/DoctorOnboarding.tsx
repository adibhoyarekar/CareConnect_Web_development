import React, { useState } from 'react';
import { Doctor, WorkingHours } from '../types';
import Spinner from './Spinner';
import WorkingHoursEditor from './WorkingHoursEditor';
import ProfilePhotoUploader from './ProfilePhotoUploader';

interface DoctorOnboardingProps {
  doctor: Doctor;
  onSave: (updatedDoctor: Doctor) => Promise<void>;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const defaultSchedule = daysOfWeek.reduce((acc, day) => {
    acc[day] = {
        startTime: '09:00',
        endTime: '17:00',
        isOff: day === 'Sunday' || day === 'Saturday'
    };
    return acc;
}, {} as { [day: string]: WorkingHours });


const DoctorOnboarding: React.FC<DoctorOnboardingProps> = ({ doctor, onSave }) => {
    const [formData, setFormData] = useState({
        hospitalName: doctor.hospitalName || '',
        address: doctor.address || '',
        specialty: doctor.specialty || '',
        workingSchedule: doctor.workingSchedule && Object.keys(doctor.workingSchedule).length > 0 ? doctor.workingSchedule : defaultSchedule,
        profilePhotoUrl: doctor.profilePhotoUrl || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
    
    const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleChange = (newSchedule: { [day: string]: WorkingHours }) => {
        setFormData(prev => ({ ...prev, workingSchedule: newSchedule }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const updatedDoctor = {
            ...doctor,
            ...formData,
            profileComplete: true,
        };
        await onSave(updatedDoctor);
        // Component will unmount, no need to setIsSaving(false)
    };
    
    return (
        <>
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-modal-in">
            <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="text-gray-600 mt-2 mb-8">Welcome, {doctor.name}. Please provide your professional details to get started.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <img 
                        src={formData.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=cffafe&color=0e7490&size=128`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover bg-gray-200 border-4 border-white shadow-md"
                        />
                        <button
                            type="button"
                            onClick={() => setIsPhotoUploaderOpen(true)}
                            className="absolute bottom-1 right-1 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors shadow"
                            aria-label="Change profile photo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">Add a professional photo (optional)</p>
                </div>

                <div>
                    <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">Hospital/Clinic Name</label>
                    <input
                        type="text"
                        id="hospitalName"
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleChange}
                        className={inputBaseClasses}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Work Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={inputBaseClasses}
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                    <input
                        type="text"
                        id="specialty"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        className={inputBaseClasses}
                        required
                    />
                </div>
                <div>
                    <WorkingHoursEditor schedule={formData.workingSchedule} onChange={handleScheduleChange} />
                </div>
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-75"
                    >
                        {isSaving ? <Spinner size="sm" color="text-white" /> : 'Save and Continue'}
                    </button>
                </div>
            </form>
        </div>
         <ProfilePhotoUploader 
          isOpen={isPhotoUploaderOpen}
          onClose={() => setIsPhotoUploaderOpen(false)}
          onPhotoSave={(photoDataUrl) => {
            setFormData(prev => ({...prev, profilePhotoUrl: photoDataUrl}));
            setIsPhotoUploaderOpen(false);
          }}
        />
      </>
    );
};

export default DoctorOnboarding;