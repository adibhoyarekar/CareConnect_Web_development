import React, { useState } from 'react';
import { Doctor } from '../types';

interface DoctorProfileProps {
  doctor: Doctor;
  onSave: (updatedDoctor: Doctor) => void;
  onBack: () => void;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor, onSave, onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty || '',
        hospitalName: doctor.hospitalName || '',
        address: doctor.address || '',
        availableTime: doctor.availableTime || '',
        mobile: doctor.mobile || '',
        fees: doctor.fees || 0,
    });
    
    const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3 disabled:bg-gray-200 disabled:text-gray-500";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedDoctor: Doctor = {
            ...doctor,
            ...formData,
            fees: Number(formData.fees),
        };
        onSave(updatedDoctor);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: doctor.name,
            email: doctor.email,
            specialty: doctor.specialty || '',
            hospitalName: doctor.hospitalName || '',
            address: doctor.address || '',
            availableTime: doctor.availableTime || '',
            mobile: doctor.mobile || '',
            fees: doctor.fees || 0,
        });
        setIsEditing(false);
    };
    
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
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                        <div>
                            <label htmlFor="fees" className="block text-sm font-medium text-gray-700">Consultation Fees ($)</label>
                            <input type="number" id="fees" name="fees" value={formData.fees} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} />
                        </div>
                        <div>
                            <label htmlFor="availableTime" className="block text-sm font-medium text-gray-700">Available Times</label>
                            <input type="text" id="availableTime" name="availableTime" value={formData.availableTime} onChange={handleChange} className={inputBaseClasses} disabled={!isEditing} placeholder="e.g., Mon-Fri, 9am-5pm" />
                        </div>
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
                                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95">
                                    Save Changes
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DoctorProfile;