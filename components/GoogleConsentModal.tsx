import React from 'react';
import { MockGoogleAccount } from '../types';

interface GoogleConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: (account: MockGoogleAccount) => void;
  account: MockGoogleAccount | null;
  appName: string;
}

const GoogleConsentModal: React.FC<GoogleConsentModalProps> = ({ isOpen, onClose, onAllow, account, appName }) => {
  if (!isOpen || !account) return null;

  const handleAllow = () => {
    onAllow(account);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-modal-in overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Sign in with Google</h2>
          </div>

          <div className="flex items-center p-3 rounded-lg border border-gray-300">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
              {account.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{account.name}</p>
              <p className="text-xs text-gray-500">{account.email}</p>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-4">
              By continuing, Google will share your name, email address, and profile picture with <span className="font-semibold text-gray-900">{appName}</span>. See {appName}'s <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a> and <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>.
            </p>
            <p>
              This app would like to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>View your name and profile picture</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>View your email address</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end items-center space-x-4">
          <button
            onClick={onClose}
            className="text-primary-600 bg-transparent hover:bg-primary-500/10 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-200 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={handleAllow}
            className="bg-primary-600 text-white hover:bg-primary-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleConsentModal;