import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, Mail, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Reset state when modal opens with a specific mode
  React.useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
      setError(null);
      setVerificationSent(false);
    }
  }, [isOpen, initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        console.log('Attempting sign in...');
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        if (!user.emailVerified) {
          setError('Please verify your email before logging in.');
          setVerificationSent(true);
          setLoading(false);
          return;
        }

        // Check if profile exists (handles case where signup couldn't create it due to verification rules)
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          console.log('Profile missing, creating now that user is verified...');
          try {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (err) {
            console.error('Final profile creation failed:', err);
            // This might happen if verification state isn't propagated yet in the token
          }
        }
      } else {
        console.log('Attempting sign up...');
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Auth user created, updating profile...');
        await updateProfile(user, { displayName: name });
        
        console.log('Sending verification email...');
        await sendEmailVerification(user);
        
        // Create user document in Firestore
        console.log('Creating user document in Firestore...');
        const userRef = doc(db, 'users', user.uid);
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: name,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('User document created successfully');
        } catch (err) {
          console.error('Firestore user creation failed:', err);
          // We don't throw here if it's just a permission issue because email isn't verified yet
          // But we should handle it gracefully
        }
        setVerificationSent(true);
        return; // Don't close modal yet if we want to show success message
      }
      console.log('Authentication process complete');
      onClose();
    } catch (err: any) {
      console.error('Authentication error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password Authentication is not enabled in your Firebase Console.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid login credentials. Please check your email and password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.message?.includes('Missing or insufficient permissions')) {
        setError('Firestore setup incomplete: Please apply security rules in your Firebase Console.');
      } else {
        setError(err.message || 'An error occurred during authentication. Please check your configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setError('Verification email resent!');
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      console.log('Attempting Google Sign In...');
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user document exists, if not create it
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log('New user detected, creating Firestore document...');
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('User document created successfully');
        } catch (err) {
          console.error('Firestore user creation failed:', err);
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      }
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in popup was closed before completion.');
      } else {
        setError(err.message || 'Error signing in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 sm:p-10">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
                  <Shield className="text-white w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  {verificationSent ? 'Check your email' : (isLogin ? 'Welcome back' : 'Create account')}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {verificationSent 
                    ? `We've sent a verification link to ${email}` 
                    : (isLogin ? 'Access your secure workspace' : 'Join modern teams using VaultFlow')}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              {verificationSent ? (
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] text-center">
                    <Mail className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                    <p className="text-slate-700 text-sm leading-relaxed mb-4">
                      Please click the link in the email to verify your account. If you don't see it, check your spam folder.
                    </p>
                    <button 
                      onClick={handleResend}
                      className="text-emerald-600 font-bold text-sm hover:underline"
                    >
                      Resend verification email
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setVerificationSent(false);
                      setIsLogin(true);
                      setError(null);
                    }}
                    className="w-full bg-slate-900 text-white py-4 rounded-full font-bold transition-all active:scale-[0.98]"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input 
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          placeholder="name@company.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button 
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98] mt-4"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        isLogin ? 'Sign In' : 'Create Account'
                      )}
                    </button>
                  </form>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-slate-400 font-medium">Or continue with</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    Google
                  </button>

                  <p className="text-center text-sm text-slate-500 mt-8">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button 
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
