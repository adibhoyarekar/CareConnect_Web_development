import React, { useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';

interface PasswordResetRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = 'https://careconnect-backend-45u6.onrender.com/api';

const PasswordResetRequestModal: React.FC<PasswordResetRequestModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // We don't care about the response, just that it completed.
    } catch (error) {
      console.error("Password reset request failed:", error);
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };
  
  const handleClose = () => {
      // Reset state on close after a brief delay to allow exit animation
      setTimeout(() => {
        setEmail('');
        setIsSubmitted(false);
        setIsLoading(false);
      }, 300);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Password">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the email address associated with your account, and we'll send you a link to reset your password.
          </p>
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-200 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-75"
            >
              {isLoading ? <Spinner size="sm" color="text-white" /> : 'Send Reset Link'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 className="text-xl font-semibold text-gray-900 mt-4">Check your email</h3>
            <p className="text-gray-600 mt-2">
                If an account with that email address exists, we have sent instructions to reset your password.
            </p>
            <div className="mt-6">
                 <button
                    onClick={handleClose}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
                >
                    Done
                </button>
            </div>
        </div>
      )}
    </Modal>
  );
};

export default PasswordResetRequestModal;
