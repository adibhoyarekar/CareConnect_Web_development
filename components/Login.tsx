import React, { useState } from 'react';
import { User, Role, MockGoogleAccount } from '../types';
import GoogleAccountChooserModal from './SocialLoginModal';
import GoogleConsentModal from './GoogleConsentModal';
import FacebookLoginModal from './FacebookLoginModal';

interface LoginProps {
  onSignIn: (credentials: {email: string, password: string}) => void;
  onSignUp: (details: Omit<User, 'id'>) => void;
  onSocialSignUp: (role: Role, provider: 'Google' | 'Facebook', account: {name: string, email: string}) => void;
  error: string | null;
}

const Login: React.FC<LoginProps> = ({ onSignIn, onSignUp, onSocialSignUp, error }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.Patient,
  });

  const [activeSocialModal, setActiveSocialModal] = useState<'Google' | 'Facebook' | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [selectedAccountForConsent, setSelectedAccountForConsent] = useState<MockGoogleAccount | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const { name, email, password, role } = formData;
      onSignUp({ name, email, password, role });
    } else {
      const { email, password } = formData;
      onSignIn({ email, password });
    }
  };
  
  const handleGoogleAccountSelect = (account: MockGoogleAccount) => {
    setActiveSocialModal(null); // Close the account picker
    setSelectedAccountForConsent(account); // Store the selected account
    setIsConsentModalOpen(true); // Open the consent screen
  };
  
  const handleGoogleConsentAllow = (account: MockGoogleAccount) => {
    const roleForSocial = isSignUp ? formData.role : Role.Patient;
    onSocialSignUp(roleForSocial, 'Google', account);
    setIsConsentModalOpen(false);
    setSelectedAccountForConsent(null);
  };
  
  const handleFacebookLoginSuccess = (account: { name: string; email: string }) => {
    const roleForSocial = isSignUp ? formData.role : Role.Patient;
    onSocialSignUp(roleForSocial, 'Facebook', account);
    setActiveSocialModal(null);
  };

  const inputBaseClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm bg-gray-100 border-gray-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500 py-2 px-3";

  return (
    <>
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-6">
            <svg aria-label="CareConnect Logo" className="mx-auto h-16 w-auto mb-4" viewBox="0 0 200 40">
              <text x="0" y="30" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="30" fontWeight="bold" fill="#312e81">
                Care<tspan fill="#4f46e5">Connect</tspan>
              </text>
            </svg>
          <p className="text-gray-500 mt-2">{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputBaseClasses} required />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputBaseClasses} required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className={inputBaseClasses} required />
          </div>
          {isSignUp && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">I am a...</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange} className={inputBaseClasses} required>
                {Object.values(Role).map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          )}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveSocialModal('Google')} className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
            </button>
            <button onClick={() => setActiveSocialModal('Facebook')} className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                 <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="#1877F2" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
                Facebook
            </button>
        </div>


        <div className="mt-6 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-medium text-primary-600 hover:text-primary-500">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
    <GoogleAccountChooserModal
        isOpen={activeSocialModal === 'Google'}
        onClose={() => setActiveSocialModal(null)}
        onAccountSelect={handleGoogleAccountSelect}
      />
    <FacebookLoginModal
      isOpen={activeSocialModal === 'Facebook'}
      onClose={() => setActiveSocialModal(null)}
      onLoginSuccess={handleFacebookLoginSuccess}
    />
    <GoogleConsentModal 
        isOpen={isConsentModalOpen}
        onClose={() => {
            setIsConsentModalOpen(false);
            setSelectedAccountForConsent(null);
        }}
        onAllow={handleGoogleConsentAllow}
        account={selectedAccountForConsent}
        appName="CareConnect"
    />
    </>
  );
};

export default Login;