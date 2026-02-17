
import React from 'react';
import { User, Wallet, ShieldCheck, Bluetooth, Loader2, LogOut, ChevronRight, Zap, Lock, Unlock } from 'lucide-react';

interface ProfileViewProps {
  walletBalance: number;
  isBleConnected: boolean;
  isBleConnecting: boolean;
  bleDeviceName?: string;
  onConnectBle: () => void;
  onDisconnectBle: () => void;
  onTestCommand: (cmd: 'LOCK' | 'UNLOCK') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  walletBalance, 
  isBleConnected, 
  isBleConnecting, 
  bleDeviceName, 
  onConnectBle,
  onDisconnectBle,
  onTestCommand
}) => {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-slide-up pb-44 space-y-8">
      {/* User Header */}
      <div className="flex items-center gap-5 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 ring-4 ring-emerald-50">
          <User size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">SYNERGY USER</h2>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Account</span>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-gray-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/10">
        <div className="absolute right-0 top-0 p-8 opacity-10">
          <Wallet size={80} />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">Synergy Credits</h3>
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-gray-400 text-lg font-bold">RM</span>
          <span className="text-5xl font-black tracking-tighter tabular-nums">{walletBalance.toFixed(2)}</span>
        </div>
        <button className="w-full bg-emerald-600 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          Top Up Balance
        </button>
      </div>

      {/* Hardware Pairing Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Hardware Connection</h3>
        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isBleConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                <Bluetooth size={24} className={isBleConnecting ? 'animate-spin' : ''} />
              </div>
              <div>
                <p className="font-black text-gray-900 uppercase tracking-tight">Synergy Hub</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  {isBleConnected ? `Connected: ${bleDeviceName || "SolarSynergyHub"}` : "Direct Bluetooth Pairing"}
                </p>
              </div>
            </div>
            {isBleConnected && (
              <div className="bg-emerald-100 px-3 py-1 rounded-lg animate-pulse">
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Linked</span>
              </div>
            )}
          </div>

          {/* Test Controls for D4 Pin */}
          {isBleConnected && (
            <div className="space-y-3">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Pin D4 Controls</p>
              <div className="grid grid-cols-2 gap-3 pb-2">
                <button 
                    onClick={() => onTestCommand('LOCK')}
                    className="bg-gray-900 text-white py-5 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-all shadow-lg"
                >
                    <Lock size={20} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Lock Hub</span>
                </button>
                <button 
                    onClick={() => onTestCommand('UNLOCK')}
                    className="bg-emerald-600 text-white py-5 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-all shadow-lg"
                >
                    <Unlock size={20} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Unlock Hub</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            {isBleConnected ? (
              <button 
                onClick={onDisconnectBle}
                className="w-full py-5 rounded-[2rem] border-2 border-rose-500 text-rose-600 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                UNPAIR HUB
              </button>
            ) : (
              <button 
                onClick={onConnectBle}
                disabled={isBleConnecting}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 shadow-xl transition-all disabled:opacity-50"
              >
                {isBleConnecting ? <Loader2 size={16} className="animate-spin" /> : <Bluetooth size={16} />}
                {isBleConnecting ? "LINKING..." : "PAIR WITH HUB"}
              </button>
            )}
          </div>
          
          <p className="text-[8px] text-center text-gray-400 font-black uppercase tracking-widest leading-relaxed px-4">
            Connect your servo signal wire to pin D4 on the ESP32.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 space-y-3">
        <button className="w-full flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 text-gray-400 font-black uppercase text-[10px] tracking-widest">
          <div className="flex items-center gap-3 text-gray-600">
            <LogOut size={18} />
            Logout Account
          </div>
          <ChevronRight size={16} />
        </button>
        <p className="text-[8px] text-center text-gray-300 font-bold uppercase tracking-[0.2em]">ETP Group 17 • Solar Synergy v1.0</p>
      </div>
    </div>
  );
};
