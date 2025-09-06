import React, { useState } from 'react';
import { Role, MockGoogleAccount, User } from '../types';
import Spinner from './Spinner';
import GoogleAccountChooserModal from './SocialLoginModal';
import GoogleConsentModal from './GoogleConsentModal';
import FacebookLoginModal from './FacebookLoginModal';
import PasswordResetRequestModal from './PasswordResetRequestModal';
import { motion, AnimatePresence, Variants } from 'framer-motion';

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        url: string;
      };
    }
  }
}

interface LoginProps {
  onSignIn: (credentials: { email: string; password:string }) => Promise<void>;
  onSignUp: (details: Omit<User, 'id'>) => Promise<void>;
  onSocialSignUp: (role: Role, provider: 'Google' | 'Facebook', account: { name: string; email: string }) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);
const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
);
const PasswordIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm-2 6V6a2 2 0 114 0v2H8z" clipRule="evenodd" />
    </svg>
);


export default function Login(props: LoginProps) {
  const { onSignIn, onSignUp, onSocialSignUp, error, isLoading } = props;
  const [formType, setFormType] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.Patient);

  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [isGoogleConsentOpen, setIsGoogleConsentOpen] = useState(false);
  const [isFacebookLoginOpen, setIsFacebookLoginOpen] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<MockGoogleAccount | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const isSignUp = formType === 'signUp';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) onSignUp({ name, email, password, role });
    else onSignIn({ email, password });
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

  const inputContainerClasses = "relative";
  const inputBaseClasses = "w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white/30 transition-colors";
  const iconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300";

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-primary-950">
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-3d p-8"
      >
        <div className="flex flex-col items-center text-center">
            <motion.div variants={itemVariants} className="w-24 h-24 -mt-20 mb-2">
                 <spline-viewer url="https://prod.spline.design/iWjvxP6f208G46g1/scene.splinecode"></spline-viewer>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white tracking-wide">
              CareConnect
            </motion.h1>

            <motion.div variants={itemVariants} className="mt-6 w-full max-w-xs">
              <div className="relative flex p-1 bg-white/10 rounded-full">
                <button
                  onClick={() => setFormType('signIn')}
                  className={`w-1/2 py-2 text-sm font-semibold rounded-full relative z-10 transition-colors ${formType === 'signIn' ? 'text-primary-900' : 'text-white/80 hover:text-white'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setFormType('signUp')}
                  className={`w-1/2 py-2 text-sm font-semibold rounded-full relative z-10 transition-colors ${formType === 'signUp' ? 'text-primary-900' : 'text-white/80 hover:text-white'}`}
                >
                  Sign Up
                </button>
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary-300 rounded-full"
                  style={{ x: formType === 'signIn' ? 'calc(50% - 100%)' : 'calc(50%)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </div>
            </motion.div>
        </div>
        
        <motion.div variants={itemVariants} className="mt-8">
            <AnimatePresence mode="wait">
            <motion.div
                key={formType}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
            <form className="space-y-4" onSubmit={handleSubmit}>
                {isSignUp && (
                    <div className={inputContainerClasses}>
                        <div className={iconClasses}><UserIcon /></div>
                        <input id="name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputBaseClasses} placeholder="Full Name" required />
                    </div>
                )}
                
                <div className={inputContainerClasses}>
                    <div className={iconClasses}><EmailIcon /></div>
                    <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputBaseClasses} placeholder="Email Address" required />
                </div>

                <div className={inputContainerClasses}>
                    <div className={iconClasses}><PasswordIcon /></div>
                    <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputBaseClasses} placeholder="Password" required minLength={6} />
                </div>

                {!isSignUp && (
                    <div className="text-right">
                        <button type="button" onClick={() => setIsResetModalOpen(true)} className="text-sm font-semibold text-gray-300 hover:text-primary-400 hover:underline">
                        Forgot Password?
                        </button>
                    </div>
                )}
                
                {isSignUp && (
                    <div>
                        <label className="block text-gray-300 text-center text-sm mb-2">I am a...</label>
                        <div className="flex justify-center space-x-4">
                        <button type="button" onClick={() => setRole(Role.Patient)} className={`px-4 py-2 rounded-lg border-2 transition-all ${role === Role.Patient ? 'bg-primary-500 text-white border-primary-500' : 'bg-white/20 border-transparent text-white hover:bg-white/30'}`}>Patient</button>
                        <button type="button" onClick={() => setRole(Role.Doctor)} className={`px-4 py-2 rounded-lg border-2 transition-all ${role === Role.Doctor ? 'bg-primary-500 text-white border-primary-500' : 'bg-white/20 border-transparent text-white hover:bg-white/30'}`}>Doctor</button>
                        </div>
                    </div>
                )}
                
                <div className="h-10">
                    <AnimatePresence>
                    {error && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-400 bg-red-900/50 p-2 rounded-lg text-center"
                        >
                          {error}
                        </motion.p>
                    )}
                    </AnimatePresence>
                </div>

                <div>
                    <button type="submit" disabled={isLoading} className="w-full block text-white font-semibold rounded-lg px-4 py-3 mt-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-primary-500/30 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? <Spinner size="sm" color="text-white" className="mx-auto" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </div>
                
                <div className="my-6 border-b border-gray-500 text-center">
                    <div className="leading-none px-2 inline-block text-sm text-gray-300 tracking-wide font-medium bg-primary-950 transform translate-y-1/2 rounded-full">
                        Or continue with
                    </div>
                </div>
                
                <div className="flex justify-center items-center gap-4">
                    <button type="button" onClick={() => setIsGoogleChooserOpen(true)} className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors shadow-md transform hover:scale-105">
                        <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    </button>

                    <button type="button" onClick={() => setIsFacebookLoginOpen(true)} className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors shadow-md transform hover:scale-105">
                        <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2"/></svg>
                    </button>
                </div>
            </form>
            </motion.div>
            </AnimatePresence>
        </motion.div>
      </motion.div>

      <PasswordResetRequestModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />
      <GoogleAccountChooserModal isOpen={isGoogleChooserOpen} onClose={() => setIsGoogleChooserOpen(false)} onAccountSelect={handleGoogleSelect} />
      <GoogleConsentModal isOpen={isGoogleConsentOpen} onClose={() => setIsGoogleConsentOpen(false)} onAllow={handleGoogleAllow} account={selectedGoogleAccount} appName="CareConnect" />
      <FacebookLoginModal isOpen={isFacebookLoginOpen} onClose={() => setIsFacebookLoginOpen(false)} onLoginSuccess={handleFacebookLogin} />
    </div>
  );
}