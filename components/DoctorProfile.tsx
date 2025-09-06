import React, { useState } from 'react';
import { Doctor, WorkingHours } from '../types';
import Spinner from './Spinner';
import WorkingHoursEditor from './WorkingHoursEditor';
import ProfilePhotoUploader from './ProfilePhotoUploader';

interface DoctorProfileProps {
  doctor: Doctor;
  onSave: (updatedDoctor: Doctor) => Promise<void>;
  onBack: () => void;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor, onSave, onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty || '',
        hospitalName: doctor.hospitalName || '',
        address: doctor.address || '',
        workingSchedule: doctor.workingSchedule || {},
        mobile: doctor.mobile || '',
        fees: doctor.fees || 0,
        profilePhotoUrl: doctor.profilePhotoUrl || '',
    });
    
    const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3 disabled:bg-gray-200 disabled:text-gray-500";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleChange = (newSchedule: { [day: string]: WorkingHours }) => {
        setFormData(prev => ({ ...prev, workingSchedule: newSchedule }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const updatedDoctor: Doctor = {
            ...doctor,
            ...formData,
            fees: Number(formData.fees),
        };
        await onSave(updatedDoctor);
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: doctor.name,
            email: doctor.email,
            specialty: doctor.specialty || '',
            hospitalName: doctor.hospitalName || '',
            address: doctor.address || '',
            workingSchedule: doctor.workingSchedule || {},
            mobile: doctor.mobile || '',
            fees: doctor.fees || 0,
            profilePhotoUrl: doctor.profilePhotoUrl || '',
        });
        setIsEditing(false);
    };
    
    return (
        <>
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-modal-in">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <img 
                            src={formData.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=cffafe&color=0e7490&size=128`}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover bg-gray-200 border-4 border-white shadow-md"
                        />
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsPhotoUploaderOpen(true)}
                                className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors shadow"
                                aria-label="Change profile photo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </button>
                        )}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{formData.name}</h2>
                        <p className="text-gray-500">{formData.email}</p>
                    </div>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSave}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Specialty</label>
                            <input type="text" id="specialty" name="specialty" value={formData.specialty} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                         <div>
                            <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">Hospital/Clinic Name</label>
                            <input type="text" id="hospitalName" name="hospitalName" value={formData.hospitalName} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Work Address</label>
                        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                        <div>
                            <label htmlFor="fees" className="block text-sm font-medium text-gray-700">Consultation Fees ($)</label>
                            <input type="number" id="fees" name="fees" value={formData.fees} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                    </div>

                     <div>
                        <WorkingHoursEditor schedule={formData.workingSchedule} onChange={handleScheduleChange} disabled={!isEditing} />
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onBack} className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                            Back to Dashboard
                        </button>
                         {isEditing && (
                            <>
                                <button type="button" onClick={handleCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-75">
                                    {isSaving ? <Spinner size="sm" color="text-white" /> : 'Save Changes'}
                                </button>
                            </>
                        )}
                    </div>
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

export default DoctorProfile;