import React, { useState } from 'react';
import { Patient, HealthHistoryItem } from '../types';
import Spinner from './Spinner';
import HealthHistoryManager from './HealthHistoryManager';

interface PatientProfileProps {
  patient: Patient;
  onSave: (updatedPatient: Patient) => Promise<void>;
  onBack: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onSave, onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: patient.name,
        email: patient.email,
        age: patient.age || '',
        gender: patient.gender || 'Other',
        contact: patient.contact || '',
        weight: patient.weight || '',
        medicalNotes: patient.medicalNotes || '',
        healthHistory: patient.healthHistory || [],
    });
    
    const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3 disabled:bg-gray-200 disabled:text-gray-500";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleHistoryChange = (newHistory: HealthHistoryItem[]) => {
        if (isEditing) {
            setFormData(prev => ({ ...prev, healthHistory: newHistory }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const updatedPatient: Patient = {
            ...patient,
            ...formData,
            age: Number(formData.age),
            gender: formData.gender as 'Male' | 'Female' | 'Other',
            weight: Number(formData.weight),
        };
        await onSave(updatedPatient);
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: patient.name,
            email: patient.email,
            age: patient.age,
            gender: patient.gender,
            contact: patient.contact,
            weight: patient.weight || '',
            medicalNotes: patient.medicalNotes || '',
            healthHistory: patient.healthHistory || [],
        });
        setIsEditing(false);
    }
    
    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-modal-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                            <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                            <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input type="tel" id="contact" name="contact" value={formData.contact} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                    </div>
                    <div>
                        <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700">General Medical Notes</label>
                        <textarea id="medicalNotes" name="medicalNotes" rows={4} value={formData.medicalNotes} onChange={handleChange} className={inputBaseClasses} placeholder="e.g. Allergies, current medications..." disabled={!isEditing} />
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                        <HealthHistoryManager 
                            healthHistory={formData.healthHistory}
                            onHistoryChange={handleHistoryChange}
                            isEditing={isEditing}
                        />
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
    );
};

export default PatientProfile;