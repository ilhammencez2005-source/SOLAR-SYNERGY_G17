
import React from 'react';
import { Calendar, Zap, CreditCard, ChevronRight, History } from 'lucide-react';
import { MOCK_HISTORY } from '../constants';

export const HistoryView: React.FC = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-slide-up pb-44">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Charging History</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your past energy consumption</p>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_HISTORY.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${item.amount > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {item.amount > 0 ? <Zap size={20} fill="currentColor" /> : <Zap size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 uppercase tracking-tight">{item.stationName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-black tracking-tighter ${item.amount > 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                  {item.amount > 0 ? `RM ${item.amount.toFixed(2)}` : 'FREE'}
                </p>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Success</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Energy</p>
                  <p className="text-xs font-black text-gray-700">{item.energy.toFixed(1)} kWh</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Impact</p>
                  <p className="text-xs font-black text-emerald-600">{(item.energy * 0.7).toFixed(1)}kg CO₂ saved</p>
                </div>
              </div>
              <button className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-emerald-600 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-8 bg-emerald-900 rounded-[3rem] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap size={80} fill="white" />
        </div>
        <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-emerald-300">Total Lifecycle Savings</h4>
        <div className="flex gap-10">
          <div>
            <p className="text-3xl font-black tracking-tighter">RM 34.70</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Total Saved</p>
          </div>
          <div>
            <p className="text-3xl font-black tracking-tighter">33.4 kWh</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Eco Energy</p>
          </div>
        </div>
      </div>
    </div>
  );
};
