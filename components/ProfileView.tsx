
import React, { useState } from 'react';
import { useUser, SignInButton, SignOutButton } from '@clerk/clerk-react';
import { User, Wallet, ShieldCheck, Bluetooth, Loader2, LogOut, ChevronRight, Zap, QrCode, Lock, Unlock, AlertCircle, Info, Settings, Bell, Moon, Sun, LogIn } from 'lucide-react';

interface ProfileViewProps {
  walletBalance: number;
  isBleConnected: boolean;
  isBleConnecting: boolean;
  bleDeviceName?: string;
  onConnectBle: () => void;
  onDisconnectBle: () => void;
  onTestCommand: (cmd: 'LOCK' | 'UNLOCK', userId?: string) => void;
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
  const { user, isSignedIn } = useUser();
  const [showQr, setShowQr] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'hub' | 'about' | 'settings'>('wallet');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const isBluetoothSupported = typeof navigator !== 'undefined' && !!(navigator as any).bluetooth;

  const tabs = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'hub', label: 'Hub', icon: Bluetooth },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ] as const;

  return (
    <div className="p-6 max-w-2xl mx-auto animate-slide-up pb-44 space-y-8">
      {/* User Header */}
      <div className="flex items-center justify-between bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 ring-4 ring-emerald-50 overflow-hidden">
            {isSignedIn && user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={40} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1 uppercase">
              {isSignedIn ? user?.fullName : "Guest User"}
            </h2>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className={isSignedIn ? "text-emerald-500" : "text-gray-300"} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isSignedIn ? "text-emerald-600" : "text-gray-400"}`}>
                {isSignedIn ? "VERIFIED USER" : "NOT LOGGED IN"}
              </span>
            </div>
          </div>
        </div>
        
        {isSignedIn ? (
          <SignOutButton>
            <button className="p-4 bg-gray-50 text-gray-400 hover:text-rose-500 rounded-2xl transition-colors">
              <LogOut size={20} />
            </button>
          </SignOutButton>
        ) : (
          <SignInButton mode="modal">
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-200">
              <LogIn size={16} />
              Login
            </button>
          </SignInButton>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 p-1.5 rounded-[2rem] gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                isActive 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'wallet' && (
          <div className="animate-fade-in-down space-y-6">
            {!isSignedIn ? (
              <div className="bg-white rounded-[3rem] p-12 border border-dashed border-gray-200 text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto">
                  <Wallet size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Wallet Protected</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">Please login to view your balance and top up.</p>
                </div>
                <SignInButton mode="modal">
                  <button className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                    Login to Access Wallet
                  </button>
                </SignInButton>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 p-8 opacity-10">
                  <Wallet size={80} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4 tracking-widest">CURRENT BALANCE</h3>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-gray-400 text-lg font-bold">RM</span>
                  <span className="text-5xl font-black tracking-tighter tabular-nums">{walletBalance.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setShowQr(!showQr)}
                  className="w-full bg-emerald-600 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-emerald-900/40"
                >
                  <QrCode size={16} />
                  {showQr ? "HIDE RELOAD DETAILS" : "TOP UP WALLET"}
                </button>

                {showQr && (
                  <div className="mt-6 bg-white rounded-3xl p-6 text-center animate-fade-in-down border border-emerald-100 shadow-xl overflow-hidden">
                    <div className="mb-4 flex flex-col items-center">
                      <div className="bg-pink-600 px-3 py-1 rounded-md mb-2">
                        <span className="text-white font-black text-[10px] uppercase">DuitNow QR</span>
                      </div>
                      <div className="w-56 h-56 bg-white rounded-2xl mx-auto flex items-center justify-center border-4 border-pink-600 p-2 shadow-inner">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DuitNow-${user?.id}&color=db2777`} 
                          alt="DuitNow QR" 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    </div>
                    <p className="text-gray-900 font-black text-[11px] uppercase tracking-widest">SCAN TO TOP UP</p>
                    <p className="text-gray-400 text-[9px] mt-1 uppercase font-bold tracking-wider px-2">{user?.fullName}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'hub' && (
          <div className="animate-fade-in-down space-y-6">
            {!isSignedIn ? (
              <div className="bg-white rounded-[3rem] p-12 border border-dashed border-gray-200 text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto">
                  <Bluetooth size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Connection Protected</h3>
                  <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wide">Please login to manage hardware links.</p>
                </div>
                <SignInButton mode="modal">
                  <button className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                    Login to Access Hub
                  </button>
                </SignInButton>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Hardware Link & Testing</h3>
                </div>
                
                {!isBluetoothSupported && (
                  <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2.5rem] flex items-center gap-4 text-rose-700 mb-4">
                    <AlertCircle className="shrink-0" size={24} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Browser Not Supported</p>
                      <p className="text-[9px] font-bold mt-1 leading-tight uppercase">iPhone users must use <span className="underline">Bluefy</span> app.</p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${isBleConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Bluetooth size={24} className={isBleConnecting ? 'animate-spin' : ''} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 uppercase tracking-tight">Hub Link</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          {isBleConnected ? `Linked: ${bleDeviceName || "SolarSynergyHub"}` : "Bluetooth Standby"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isBleConnected && (
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => onTestCommand('LOCK', user?.id)}
                        className="bg-gray-900 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:bg-black group"
                      >
                        <Lock size={22} className="group-active:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">TEST LOCK</span>
                      </button>
                      <button 
                        onClick={() => onTestCommand('UNLOCK', user?.id)}
                        className="bg-emerald-600 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:bg-emerald-700 group"
                      >
                        <Unlock size={22} className="group-active:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">TEST UNLOCK</span>
                      </button>
                    </div>
                  )}

                  <div className="pt-2">
                    {isBleConnected ? (
                      <button 
                        onClick={onDisconnectBle}
                        className="w-full py-5 rounded-[2rem] border-2 border-rose-500 text-rose-600 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                      >
                        UNLINK HUB
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <button 
                          onClick={onConnectBle}
                          disabled={isBleConnecting || !isBluetoothSupported}
                          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 shadow-xl transition-all disabled:opacity-30"
                        >
                          {isBleConnecting ? <Loader2 size={16} className="animate-spin" /> : <Bluetooth size={16} />}
                          {isBleConnecting ? "LINKING..." : "LINK WITH HUB"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fade-in-down space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] px-2">App Settings</h3>
              
              <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm space-y-8">
                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                      <Bell size={24} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 uppercase tracking-tight">Notifications</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Push alerts for charging status</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
                      {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 uppercase tracking-tight">Appearance</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{darkMode ? 'Dark Mode Active' : 'Light Mode Active'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-14 h-8 rounded-full transition-colors relative ${darkMode ? 'bg-purple-600' : 'bg-amber-400'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {/* Account Security */}
                <div className="pt-4 border-t border-gray-50">
                  <button className="w-full flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-gray-100 transition-colors">
                        <Lock size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-gray-900 uppercase tracking-tight">Security</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Manage your password & 2FA</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </button>
                </div>
              </div>

              <button className="w-full bg-rose-50 text-rose-600 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all border border-rose-100">
                <LogOut size={16} />
                Sign Out Account
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="animate-fade-in-down space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] px-2">Project Information</h3>
              <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mb-4 p-2 border-4 border-emerald-100 shadow-inner">
                    <img 
                      src="https://picsum.photos/seed/solarsynergy/200/200" 
                      alt="Solar Synergy Logo" 
                      className="w-full h-full object-contain rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Solar Synergy</h2>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">ETP Group 17</p>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Origin</p>
                    <p className="text-[11px] font-medium text-gray-600 leading-relaxed uppercase tracking-wide">
                      We are from <span className="font-black text-gray-900">ETP Group 17 Universiti Teknologi Petronas</span>.
                    </p>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Mission</p>
                    <p className="text-[11px] font-medium text-gray-600 leading-relaxed uppercase tracking-wide">
                      Solar Synergy is a sustainable micro-mobility charging platform designed for the UTP campus. 
                      Our project leverages solar energy to provide eco-friendly charging for electric scooters 
                      and bicycles, promoting a greener and smarter campus environment through innovative 
                      hardware integration and real-time synergy assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-8 pb-12 space-y-2 opacity-50">
        <p className="text-[8px] text-center text-gray-400 font-black uppercase tracking-[0.2em]">ETP Group 17 • Solar Synergy v1.8</p>
        <p className="text-[7px] text-center text-gray-400 font-black uppercase tracking-[0.3em]">Created by Ilhammencez Bin Mohd Rasyidi</p>
      </div>
    </div>
  );
};
