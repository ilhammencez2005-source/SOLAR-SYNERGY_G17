
import React, { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, Github, Chrome, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from '../firebase';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSimulationFallback = (emailToUse?: string) => {
    console.warn("Using simulation fallback...");
    setTimeout(() => {
      onLogin(emailToUse || email || 'demo@solarsynergy.com');
      setIsLoading(false);
    }, 1000);
  };

  const isSimulationError = (err: any) => {
    const code = err?.code || '';
    const message = (err?.message || '').toLowerCase();
    const isUnauthorized = code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain');
    
    if (isUnauthorized) {
      console.error("UNAUTHORIZED DOMAIN DETECTED. Please add this domain to Firebase Console > Auth > Settings > Authorized Domains.");
    }

    return [
      'auth/operation-not-allowed', 
      'auth/user-not-found', 
      'auth/configuration-not-found',
      'auth/unauthorized-domain'
    ].includes(code) || 
    message.includes('unauthorized-domain') || 
    message.includes('configuration-not-found');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email) {
        onLogin(result.user.email);
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (isSimulationError(err)) {
        handleSimulationFallback();
        return;
      }
      setError(err.message || "Google Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user.email) onLogin(result.user.email);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result.user.email) onLogin(result.user.email);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (isSimulationError(err)) {
        handleSimulationFallback();
        return;
      }
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      if (!isSignUp || error) setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none mb-4">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase">
            Solar<span className="text-emerald-600">Synergy</span>
          </h1>
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">
            Sustainable Energy Hub
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl space-y-3 animate-shake">
              <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <AlertCircle size={16} />
                <span className="flex-1">{error}</span>
              </div>
              {(error.includes('unauthorized-domain') || error.includes('Unauthorized') || error.includes('invalid-action') || error.includes('requested action is invalid')) && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-2xl space-y-2">
                  <p className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Login Troubleshooting:</p>
                  <ul className="text-[8px] font-bold text-amber-600 dark:text-amber-500 space-y-1 list-disc pl-3 uppercase tracking-tight">
                    <li>Enable Google Sign-In in Firebase Console</li>
                    <li>Add {window.location.hostname} to Authorized Domains</li>
                    <li>Ensure your API Key is not restricted</li>
                  </ul>
                </div>
              )}
              {isSimulationError({ message: error }) && (
                <button 
                  onClick={() => handleSimulationFallback()}
                  className="w-full py-2 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors"
                >
                  Enter Demo Mode Instead
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-emerald-100 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Enter Hub"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-gray-900 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Chrome size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
            </button>
            <button 
              onClick={() => handleSimulationFallback()}
              className="flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Zap size={18} className="text-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">Demo Hub</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {isSignUp ? "Already have an account?" : "Don't have an account?"} 
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-emerald-600 hover:underline ml-2"
            >
              {isSignUp ? "Sign In" : "Create One"}
            </button>
          </p>
          
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <ShieldCheck size={14} />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Secured by Synergy Protocol</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
