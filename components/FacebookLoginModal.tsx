import React, { useState } from 'react';
import { MOCK_FACEBOOK_ACCOUNT } from '../constants';

interface FacebookLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: { name: string; email: string }) => void;
}

const FacebookLoginModal: React.FC<FacebookLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleLogin = () => {
    // Simulate a successful login and move to the consent step
    setStep(2);
  };
  
  const handleConfirm = () => {
    onLoginSuccess(MOCK_FACEBOOK_ACCOUNT);
  };
  
  const account = MOCK_FACEBOOK_ACCOUNT;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-modal-in overflow-hidden border border-gray-200">
        {step === 1 && (
          // Step 1: Login Form Simulation
          <div>
            <div className="p-4 text-center border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Log in to Facebook</h2>
            </div>
            <div className="p-6 space-y-4">
                <input
                    type="email"
                    placeholder="Email address or phone number"
                    value={account.email}
                    disabled
                    className="w-full px-4 py-3 rounded-md bg-gray-100 border border-gray-300 text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value="••••••••••"
                    disabled
                    className="w-full px-4 py-3 rounded-md bg-gray-100 border border-gray-300 text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                 <button
                    onClick={handleLogin}
                    className="w-full bg-[#1877F2] text-white font-bold py-3 px-4 rounded-md hover:bg-[#166fe5] transition-colors duration-300"
                >
                    Log In
                </button>
                 <button onClick={onClose} className="w-full text-center text-sm text-gray-500 hover:underline mt-2">
                    Cancel
                </button>
            </div>
          </div>
        )}

        {step === 2 && (
          // Step 2: Consent Screen Simulation
          <div className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4">
              {account.name.charAt(0)}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Continue as {account.name}?</h2>
            <p className="text-sm text-gray-500 mt-2">
              You've previously logged in to CareConnect with Facebook.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full bg-[#1877F2] text-white font-bold py-2 px-4 rounded-md hover:bg-[#166fe5] transition-colors duration-300"
              >
                Continue
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookLoginModal;