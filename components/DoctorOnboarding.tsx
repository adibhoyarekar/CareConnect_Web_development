import React, { useState } from 'react';
import { Doctor } from '../types';
import Spinner from './Spinner';

interface DoctorOnboardingProps {
  doctor: Doctor;
  onSave: (updatedDoctor: Doctor) => Promise<void>;
}

const DoctorOnboarding: React.FC<DoctorOnboardingProps> = ({ doctor, onSave }) => {
    const [formData, setFormData] = useState({
        hospitalName: doctor.hospitalName || '',
        address: doctor.address || '',
        specialty: doctor.specialty || '',
        availableTime: doctor.availableTime || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    
    const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-modal-in">
            <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="text-gray-600 mt-2 mb-8">Welcome, {doctor.name}. Please provide your professional details to get started.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label htmlFor="availableTime" className="block text-sm font-medium text-gray-700">Available Times (e.g., Mon-Fri, 9am-5pm)</label>
                    <input
                        type="text"
                        id="availableTime"
                        name="availableTime"
                        value={formData.availableTime}
                        onChange={handleChange}
                        className={inputBaseClasses}
                        required
                    />
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
    );
};

export default DoctorOnboarding;
