import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';

const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

interface ProfilePhotoUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSave: (photoDataUrl: string) => void;
}

const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({ isOpen, onClose, onPhotoSave }) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { // Allow close animation to finish
        setImageDataUrl(null);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (e.g., JPG, PNG, GIF).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (imageDataUrl) {
      onPhotoSave(imageDataUrl);
    }
  };
  
  const triggerFileSelect = () => {
      fileInputRef.current?.click();
  }
  
  const resetSelection = () => {
    setImageDataUrl(null);
    setError(null);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Profile Photo">
      <div className="p-2">
        <div className="flex flex-col items-center">
            {imageDataUrl ? (
                // Preview View
                <>
                    <img src={imageDataUrl} alt="Preview" className="rounded-full w-48 h-48 object-cover mb-6 border-4 border-white shadow-lg" />
                    <div className="flex space-x-4">
                        <button onClick={resetSelection} className="bg-gray-200 py-2 px-4 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-300">
                            Change Photo
                        </button>
                        <button onClick={handleSave} className="py-2 px-6 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                            Save Photo
                        </button>
                    </div>
                </>
            ) : (
                // Select View
                <div className="text-center w-full">
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <button 
                        onClick={triggerFileSelect} 
                        className="w-full flex flex-col items-center justify-center p-8 bg-gray-50 hover:bg-primary-100 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-primary-400"
                    >
                        <UploadIcon />
                        <span className="mt-2 font-semibold text-gray-700">Choose from Device</span>
                        <p className="text-xs text-gray-500 mt-1">Click here to select a photo</p>
                    </button>
                </div>
            )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
      </div>
    </Modal>
  );
};

export default ProfilePhotoUploader;