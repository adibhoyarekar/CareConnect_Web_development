import React, { useState } from 'react';
import { Patient } from '../types';
import Spinner from './Spinner';

interface PatientOnboardingProps {
  patient: Patient;
  onSave: (updatedPatient: Patient) => Promise<void>;
}

const PatientOnboarding: React.FC<PatientOnboardingProps> = ({ patient, onSave }) => {
    const [formData, setFormData] = useState({
        age: patient.age || '',
        gender: patient.gender || 'Other',
        contact: patient.contact || '',
        weight: patient.weight || '',
        medicalNotes: patient.medicalNotes || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    
    const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const updatedPatient: Patient = {
            ...patient,
            age: Number(formData.age),
            gender: formData.gender as 'Male' | 'Female' | 'Other',
            contact: formData.contact,
            weight: Number(formData.weight),
            medicalNotes: formData.medicalNotes,
            profileComplete: true,
        };
        await onSave(updatedPatient);
        // Component will unmount, no need to setIsSaving(false)
    };
    
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-modal-in">
            <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="text-gray-600 mt-2 mb-8">Welcome, {patient.name}. Please provide your details to get started.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                        <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} className={inputBaseClasses} required />
                    </div>
                     <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputBaseClasses} required>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input type="tel" id="contact" name="contact" value={formData.contact} onChange={handleChange} className={inputBaseClasses} required />
                    </div>
                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleChange} className={inputBaseClasses} />
                    </div>
                </div>
                <div>
                    <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700">Medical Notes (optional)</label>
                    <textarea id="medicalNotes" name="medicalNotes" rows={3} value={formData.medicalNotes} onChange={handleChange} className={inputBaseClasses} placeholder="e.g. Allergies, past conditions..." />
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

export default PatientOnboarding;
