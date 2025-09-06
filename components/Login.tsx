import React, { useState } from 'react';
import { Role, MockGoogleAccount, User } from '../types';
import Spinner from './Spinner';
import GoogleAccountChooserModal from './SocialLoginModal';
import GoogleConsentModal from './GoogleConsentModal';
import FacebookLoginModal from './FacebookLoginModal';
import PasswordResetRequestModal from './PasswordResetRequestModal';

interface LoginProps {
  onSignIn: (credentials: { email: string; password: string }) => Promise<void>;
  onSignUp: (details: Omit<User, 'id'>) => Promise<void>;
  onSocialSignUp: (role: Role, provider: 'Google' | 'Facebook', account: { name: string; email: string }) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onSignIn, onSignUp, onSocialSignUp, error, isLoading }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.Patient);

  // Social Login Modal States
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [isGoogleConsentOpen, setIsGoogleConsentOpen] = useState(false);
  const [isFacebookLoginOpen, setIsFacebookLoginOpen] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<MockGoogleAccount | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onSignUp({ name, email, password, role });
    } else {
      onSignIn({ email, password });
    }
  };

  const handleGoogleSelect = (account: MockGoogleAccount) => {
    setSelectedGoogleAccount(account);
    setIsGoogleChooserOpen(false);
    setIsGoogleConsentOpen(true);
  };
  
  const handleGoogleAllow = (account: MockGoogleAccount) => {
    onSocialSignUp(role, 'Google', account);
    setIsGoogleConsentOpen(false);
  };

  const handleFacebookLogin = (account: { name: string; email: string }) => {
    onSocialSignUp(role, 'Facebook', account);
    setIsFacebookLoginOpen(false);
  };

  const inputClasses = "w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none";
  const buttonBaseClasses = "w-full block text-white font-semibold rounded-lg px-4 py-3 mt-6 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95";

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-primary-50 p-6">
        <div className="w-full max-w-4xl flex bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left side */}
          <div className="w-full md:w-1/2 p-8 sm:p-12">
            <div className="flex items-center space-x-3 mb-8">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h1 className="text-3xl font-bold text-gray-900">CareConnect</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{isSignUp ? 'Create an account' : 'Sign in to your account'}</h2>
            <p className="text-gray-600 mt-2">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary-600 hover:underline font-semibold">
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>

            <form className="mt-8" onSubmit={handleSubmit}>
              {isSignUp && (
                <div>
                  <label className="block text-gray-700">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className={inputClasses} required />
                </div>
              )}
              <div className="mt-4">
                <label className="block text-gray-700">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className={inputClasses} required />
              </div>
              <div className="mt-4">
                <label className="block text-gray-700">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className={inputClasses} required minLength={6} />
              </div>
              
              {!isSignUp && (
                 <div className="text-right mt-2">
                    <button type="button" onClick={() => setIsResetModalOpen(true)} className="text-sm font-semibold text-gray-700 hover:text-primary-600 hover:underline">
                      Forgot Password?
                    </button>
                  </div>
              )}

              {isSignUp && (
                <div className="mt-4">
                  <label className="block text-gray-700">I am a...</label>
                  <div className="mt-2 flex space-x-4">
                    <button type="button" onClick={() => setRole(Role.Patient)} className={`px-4 py-2 rounded-lg border-2 ${role === Role.Patient ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-200 border-gray-200'}`}>Patient</button>
                    <button type="button" onClick={() => setRole(Role.Doctor)} className={`px-4 py-2 rounded-lg border-2 ${role === Role.Doctor ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-200 border-gray-200'}`}>Doctor</button>
                  </div>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
              
              <button type="submit" disabled={isLoading} className={`${buttonBaseClasses} bg-primary-600 hover:bg-primary-700 focus:bg-primary-700`}>
                {isLoading ? <Spinner size="sm" color="text-white" className="mx-auto" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
              
              <div className="my-6 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or {isSignUp ? 'sign up' : 'sign in'} with
                </div>
              </div>
              
              <div className="flex justify-center items-center gap-4">
                <button type="button" onClick={() => setIsGoogleChooserOpen(true)} className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
                    {/* Google Icon */}
                    <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                </button>
                <button type="button" onClick={() => setIsFacebookLoginOpen(true)} className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
                    {/* Facebook Icon */}
                    <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2"/></svg>
                </button>
              </div>
            </form>
          </div>
          {/* Right side Image */}
          <div className="hidden md:block w-1/2 bg-primary-500 p-12">
            <div className="h-full bg-cover bg-center rounded-2xl" style={{backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')"}}></div>
          </div>
        </div>
      </div>
      <PasswordResetRequestModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />
      <GoogleAccountChooserModal isOpen={isGoogleChooserOpen} onClose={() => setIsGoogleChooserOpen(false)} onAccountSelect={handleGoogleSelect} />
      <GoogleConsentModal isOpen={isGoogleConsentOpen} onClose={() => setIsGoogleConsentOpen(false)} onAllow={handleGoogleAllow} account={selectedGoogleAccount} appName="CareConnect" />
      <FacebookLoginModal isOpen={isFacebookLoginOpen} onClose={() => setIsFacebookLoginOpen(false)} onLoginSuccess={handleFacebookLogin} />
    </>
  );
};

export default Login;