import React from 'react';
import { MapPin, Sparkles, Zap } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationBarProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  hasActiveSession: boolean;
  showNotification: (msg: string) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ view, setView, hasActiveSession, showNotification }) => (
  <div className="px-6 py-4 flex justify-between items-center pb-safe w-full">
    <button 
      onClick={() => setView('home')} 
      className={`flex flex-col items-center gap-1.5 transition-colors hover:bg-gray-50 px-4 py-2 rounded-xl ${view === 'home' || view === 'booking' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <MapPin size={24} />
      <span className="text-[10px] font-bold uppercase tracking-wide">Stations</span>
    </button>

    <div className="relative -top-8">
      <button 
        onClick={() => setView('assistant')}
        className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center border-4 border-gray-50 transition-transform active:scale-95 ${
          view === 'assistant' 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ring-4 ring-emerald-100' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:shadow-orange-200/50'
        }`}
      >
        <Sparkles size={28} className={view === 'assistant' ? '' : 'animate-pulse'}/>
      </button>
    </div>

    <button 
      onClick={() => hasActiveSession ? setView('charging') : showNotification("No active session")}
      className={`flex flex-col items-center gap-1.5 transition-colors hover:bg-gray-50 px-4 py-2 rounded-xl ${view === 'charging' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <Zap size={24} className={hasActiveSession ? "animate-pulse text-emerald-600" : ""} />
      <span className="text-[10px] font-bold uppercase tracking-wide">Charge</span>
    </button>
  </div>
);