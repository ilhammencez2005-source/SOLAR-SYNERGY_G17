
import React, { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck, Github, Chrome } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, googleProvider, signInWithPopup } from '../firebase';

interface LoginViewProps {
  onLogin: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email) {
        onLogin(result.user.email);
      }
    } catch (error) {
      console.error("Google Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // For demo, we still simulate email/password login as we haven't enabled it in Firebase console
    // but we'll use the onLogin callback which will be handled by onAuthStateChanged in App.tsx
    setTimeout(() => {
      onLogin(email || 'demo@solarsynergy.com');
      setIsLoading(false);
    }, 1500);
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

            <div className="flex justify-end">
              <button type="button" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-emerald-100 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Hub
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
            <button className="flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Github size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">GitHub</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Don't have an account? <button className="text-emerald-600 hover:underline">Create One</button>
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
