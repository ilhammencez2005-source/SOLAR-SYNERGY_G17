import React from 'react';
import { Shield, Lock, Eye, FileText, X, ChevronRight, Scale, Globe, UserCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl h-[85vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-white dark:border-gray-700 shadow-sm">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Privacy Policy</h2>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">PDPA Compliance Notice (Malaysia)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-full text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Scale size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">1. PDPA Commitment</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              Solar Synergy is committed to protecting your personal data in accordance with the 
              <span className="text-emerald-600 dark:text-emerald-400"> Personal Data Protection Act 2010 (PDPA)</span> of Malaysia. 
              This policy outlines how we collect, use, and safeguard your information when you use our campus charging services.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Eye size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">2. Data Collection</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Personal Info</p>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Name, Email, Phone Number, and Student ID for authentication.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Usage Data</p>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Charging history, location data (for finding hubs), and device identifiers.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Lock size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">3. Data Security</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              We implement robust technical and organizational security measures to prevent unauthorized access, 
              disclosure, or alteration of your personal data. This includes:
            </p>
            <ul className="space-y-3">
              {['End-to-end encryption for sensitive data', 'Secure cloud storage with restricted access', 'Regular security audits and vulnerability assessments'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <UserCheck size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">4. Your Rights</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-bold leading-relaxed">
              Under the PDPA, you have the right to access, correct, or withdraw consent for the processing of your personal data. 
              To exercise these rights, please contact our Data Protection Officer through the app's support channel.
            </p>
          </section>

          <section className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-start gap-4">
              <Globe className="text-emerald-600 dark:text-emerald-400 mt-1" size={20} />
              <div>
                <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-tight">Cross-Border Transfer</p>
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-500 mt-1 leading-relaxed">
                  Your data may be processed on servers located outside Malaysia. We ensure that any such transfer 
                  complies with PDPA requirements for adequate protection.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button 
            onClick={onClose}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-5 rounded-[1.5rem] font-black text-xs shadow-xl active:scale-[0.98] transition-all uppercase tracking-[0.2em]"
          >
            I Understand
          </button>
          <p className="text-[8px] text-center text-gray-400 dark:text-gray-500 font-bold mt-4 uppercase tracking-widest">
            Last Updated: March 2026 • Solar Synergy UTP
          </p>
        </div>
      </div>
    </div>
  );
};
