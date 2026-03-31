
import React from 'react';
import { User } from 'lucide-react';

interface HeaderProps {
  walletBalance: number;
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ walletBalance, onProfileClick }) => (
  <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-900 shadow-sm shrink-0 border-b border-gray-200 dark:border-gray-800 z-10 transition-colors">
    <div className="flex items-center gap-3">
      <div className="h-10 w-12 flex items-center justify-center relative">
         <img 
           src="https://lh3.googleusercontent.com/d/1JB1msv8nSU3u--ywu_bAhKEhKar-94Vb" 
           alt="UTP" 
           className="h-full w-full object-contain dark:brightness-110"
         />
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">Solar Synergy</h1>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">UTP MICROMOBILITY</p>
        <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold tracking-wider mt-0.5 uppercase">ETP GROUP 17</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
       <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-end">
         <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Wallet</span>
         <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 leading-none">RM {walletBalance.toFixed(2)}</span>
       </div>
       <button 
         onClick={onProfileClick}
         className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
       >
         <User size={18} />
       </button>
    </div>
  </div>
);
