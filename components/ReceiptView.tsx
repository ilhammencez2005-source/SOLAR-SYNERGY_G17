import React from 'react';
import { motion } from 'motion/react';
import { Receipt, ViewState } from '../types';
import { 
  CheckCircle2, 
  Share2, 
  Download, 
  ArrowLeft, 
  Leaf, 
  Clock, 
  Zap, 
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface ReceiptViewProps {
  receipt: Receipt;
  onBack: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ receipt, onBack }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Solar Synergy Hub Receipt',
          text: `Charged my scooter at ${receipt.stationName}! Saved ${receipt.co2Saved} of CO2.`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 overflow-y-auto pb-24 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-6 py-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors text-gray-400"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.3em]">Session Receipt</h2>
        <div className="w-12"></div>
      </div>

      <div className="px-6 py-8 space-y-6">
        {/* Success Banner */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-600 rounded-[3rem] p-8 text-center text-white shadow-xl shadow-emerald-100 dark:shadow-none relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <CheckCircle2 size={64} className="mx-auto mb-4" />
          <h3 className="text-2xl font-black tracking-tighter mb-1">Charging Complete!</h3>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Hub Unlocked Successfully</p>
        </motion.div>

        {/* Main Receipt Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div className="p-8 border-b border-dashed border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-start mb-6">
               <div>
                 <h4 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{receipt.stationName}</h4>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{receipt.date}</p>
               </div>
               <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                 {receipt.mode}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Duration</span>
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">{receipt.duration}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <Zap size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Energy</span>
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">{receipt.totalEnergy}</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Cost</span>
              <span className="text-sm font-black text-gray-900 dark:text-gray-100">RM {receipt.cost.toFixed(2)}</span>
            </div>
            
            {receipt.overstayFee > 0 && (
              <div className="flex justify-between items-center text-rose-500">
                <div className="flex items-center gap-2">
                  <AlertCircle size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Overstay Fee</span>
                </div>
                <span className="text-sm font-black">RM {receipt.overstayFee.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Total Paid</span>
              <span className="text-2xl font-black text-emerald-600 tracking-tighter">RM {(receipt.cost + receipt.overstayFee).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span>Pre-Auth Refunded</span>
              <span>RM {receipt.refund.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Environmental Impact */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem] p-8 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
            <Leaf size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h5 className="text-emerald-900 dark:text-emerald-100 font-black text-lg tracking-tight">Eco-Impact</h5>
            <p className="text-emerald-700 dark:text-emerald-300 text-xs font-bold leading-relaxed">
              You saved <span className="font-black underline">{receipt.co2Saved}</span> of CO2 emissions by using solar energy!
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all"
          >
            <Share2 size={18} />
            Share
          </button>
          <button 
            className="flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all"
          >
            <Download size={18} />
            Save PDF
          </button>
        </div>

        <button 
          onClick={onBack}
          className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-6 rounded-[2.5rem] text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-gray-200 dark:shadow-none active:scale-[0.98] transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
