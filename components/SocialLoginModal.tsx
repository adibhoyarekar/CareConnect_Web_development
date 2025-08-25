import React from 'react';
import { MOCK_GOOGLE_ACCOUNTS } from '../constants';
import { MockGoogleAccount } from '../types';

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountSelect: (account: MockGoogleAccount) => void;
}

const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({ isOpen, onClose, onAccountSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-modal-in overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Choose an account</h2>
          </div>
          <p className="text-sm text-gray-500 mt-2">to continue to CareConnect</p>
        </div>
        <div className="py-2">
          {MOCK_GOOGLE_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              onClick={() => onAccountSelect(account)}
              className="w-full flex items-center px-6 py-3 text-left hover:bg-primary-50 transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                {account.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{account.name}</p>
                <p className="text-sm text-gray-500">{account.email}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200">
           <button
            onClick={onClose}
            className="w-full text-primary-600 bg-transparent hover:bg-primary-500/10 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-200 ease-in-out"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleAccountChooserModal;