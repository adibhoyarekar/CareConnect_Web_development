import React, { useState } from 'react';
import { MedicalRecord } from '../types';
import Spinner from './Spinner';

interface MedicalRecordUploadFormProps {
  onSave: (recordData: Omit<MedicalRecord, 'id' | 'patientId' | 'uploadedBy' | 'uploaderId' | 'dateUploaded' | 'fileUrl' | 'fileType'>) => Promise<void>;
  onClose: () => void;
}

const MedicalRecordUploadForm: React.FC<MedicalRecordUploadFormProps> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || isSaving) return;

    setIsSaving(true);
    // In a real app, you would handle file upload to a server here.
    // For this simulation, we'll just pass the text data.
    await onSave({ title, description });
    // Parent component handles closing, no need to setIsSaving(false)
  };
  
  const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Record Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputBaseClasses} py-2 px-3`}
          required
          placeholder="e.g., Blood Test Results"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputBaseClasses} py-2 px-3`}
          placeholder="e.g., From January 2024"
        />
      </div>
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">File</label>
        <input
          type="file"
          id="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className={`${inputBaseClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700`}
          accept=".pdf,.jpg,.jpeg,.png"
        />
         <p className="text-xs text-gray-500 mt-1">File upload is for demonstration only.</p>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-75"
        >
          {isSaving ? <Spinner size="sm" color="text-white" /> : 'Save Record'}
        </button>
      </div>
    </form>
  );
};

export default MedicalRecordUploadForm;
