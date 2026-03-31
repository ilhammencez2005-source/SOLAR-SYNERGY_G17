
import React, { useState } from 'react';
import { AlertTriangle, X, Camera, Send, CheckCircle2, ShieldAlert, ZapOff, Lock } from 'lucide-react';

interface ReportIssueModalProps {
  onClose: () => void;
  stationName?: string;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ onClose, stationName }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypes = [
    { id: 'lock', label: 'Broken Lock', icon: Lock, color: 'text-amber-500' },
    { id: 'charger', label: 'Charger Failure', icon: ZapOff, color: 'text-rose-500' },
    { id: 'safety', label: 'Safety Hazard', icon: ShieldAlert, color: 'text-red-600' },
    { id: 'other', label: 'Other Issue', icon: AlertTriangle, color: 'text-gray-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueType || !description) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 border border-white dark:border-gray-700 shadow-sm">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Report Issue</h2>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Health & Safety Maintenance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-full text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Station Context */}
              {stationName && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <p className="text-[10px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-tight">
                    Reporting for: <span className="text-emerald-600 dark:text-emerald-400">{stationName}</span>
                  </p>
                </div>
              )}

              {/* Issue Type Grid */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Select Issue Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {issueTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = issueType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setIssueType(type.id)}
                        className={`p-5 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-3 group ${
                          isSelected 
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' 
                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-rose-200 dark:hover:border-rose-800'
                        }`}
                      >
                        <Icon size={24} className={`${isSelected ? type.color : 'text-gray-400 dark:text-gray-600'} group-hover:scale-110 transition-transform`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Description</h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what's wrong (e.g. Lock is jammed, cable is frayed...)"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] p-6 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 min-h-[120px] placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  required
                />
              </div>

              {/* Photo Upload Placeholder */}
              <button type="button" className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[1.5rem] flex items-center justify-center gap-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 transition-all">
                <Camera size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest">Attach Photo (Optional)</span>
              </button>

              <button
                type="submit"
                disabled={!issueType || !description || isSubmitting}
                className="w-full bg-rose-600 text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-200 dark:shadow-rose-900/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    Submit Report
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-fade-in-up">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Report Received</h3>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 max-w-[240px] leading-relaxed uppercase">
                  Thank you for keeping Solar Synergy safe. Our maintenance team will inspect the hub within 24 hours.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-12 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            Emergency? Call Campus Security: <span className="text-rose-500">+60 5-368 8000</span>
          </p>
        </div>
      </div>
    </div>
  );
};
