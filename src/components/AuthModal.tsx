import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginWithGoogle, auth } from '../lib/firebase';

export function AuthModal({ onLogin }: { onLogin: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onLogin();
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user' || e.message?.includes('popup-closed-by-user')) {
        setError(null);
      } else {
        setError(e.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Create user
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        // Set display name if provided
        if (displayName && credential.user) {
          await updateProfile(credential.user, { displayName });
        }
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (e: any) {
      console.error("Auth error:", e);
      let errorMsg = e.message || 'An error occurred during authentication';
      if (e.code === 'auth/email-already-in-use') {
        errorMsg = 'This email address is already in use.';
      } else if (e.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak. Please use at least 6 characters.';
      } else if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        errorMsg = 'Invalid email or password. Please verify your credentials.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#F3F4F6] border border-slate-200 rounded-xl p-6 lg:p-8 max-w-md w-full shadow-2xl flex flex-col relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-[#F3F4F6]/95 rounded-xl z-20 flex flex-col items-center justify-center space-y-4">
             <h2 className="text-lg font-bold text-slate-950 tracking-tighter animate-pulse text-center">
               INSIDER <span className="text-slate-950 font-normal">TRADER</span> <span className="text-slate-900 font-semibold ml-1 text-[10px] tracking-normal opacity-70">PRO</span>
             </h2>
             <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-center animate-pulse">
               {isSignUp ? 'Inscribing Credentials...' : 'Establishing Secure Session...'}
             </div>
          </div>
        )}

        <div className="flex flex-col items-center text-center mb-6">
          <h2 className="text-xl font-bold text-slate-950 tracking-tighter mb-2">
            INSIDER <span className="text-slate-900 font-normal">TRADER</span> <span className="text-slate-800 font-mono ml-1 text-[10px] tracking-normal opacity-70">PRO</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600 flex items-center gap-1.5">
             <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
             AI Trading System
          </p>
        </div>

        <div className="flex border-b border-slate-300 mb-6">
          <button 
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 pb-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all duration-300 ${!isSignUp ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 pb-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all duration-300 ${isSignUp ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Join / Sign Up
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleManualAuth} className="space-y-4 animate-fade-in">
          {isSignUp && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950 placeholder:text-slate-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950 placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-1.5">Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950 placeholder:text-slate-400 transition-colors font-mono"
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950 placeholder:text-slate-400 transition-colors font-mono"
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-slate-950 hover:bg-black text-white transition-colors py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-black/10 cursor-pointer mt-2"
          >
            <span>{isSignUp ? 'Inscribe & Launch' : 'Authenticate Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-[#F3F4F6] px-3 text-slate-500 font-semibold font-mono">Or Alternative</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 transition-all py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-3 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="tracking-widest capitalize">Continue with Google</span>
        </button>
      </div>
    </div>
  );
}

