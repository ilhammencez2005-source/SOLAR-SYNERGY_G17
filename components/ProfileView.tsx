
import React, { useState } from 'react';
import { User, Wallet, ShieldCheck, Bluetooth, Loader2, ChevronRight, Zap, QrCode, Lock, Unlock, AlertCircle, Info, Wifi, Globe, Moon, Sun, FileText, AlertTriangle, Leaf } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { PrivacyPolicy } from './PrivacyPolicy';
import { ReportIssueModal } from './ReportIssueModal';
import { auth, signOut } from '../firebase';

interface ProfileViewProps {
  walletBalance: number;
  isBleConnected: boolean;
  isBleConnecting: boolean;
  bleDeviceName?: string;
  onConnectBle: () => void;
  onDisconnectBle: () => void;
  onTestCommand: (cmd: 'LOCK' | 'UNLOCK') => void;
  connectionMode: 'ble' | 'wifi';
  setConnectionMode: (mode: 'ble' | 'wifi') => void;
  wifiIp: string;
  setWifiIp: (ip: string) => void;
  isWifiConnected: boolean;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  walletBalance, 
  isBleConnected, 
  isBleConnecting, 
  bleDeviceName, 
  onConnectBle,
  onDisconnectBle,
  onTestCommand,
  connectionMode,
  setConnectionMode,
  wifiIp,
  setWifiIp,
  isWifiConnected,
  onLogout
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showQr, setShowQr] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'hub' | 'about'>('wallet');
  
  const isBluetoothSupported = typeof navigator !== 'undefined' && !!(navigator as any).bluetooth;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const tabs = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'hub', label: 'Hub Connection', icon: Bluetooth },
    { id: 'about', label: 'About', icon: Info },
  ] as const;

  return (
    <div className="p-6 max-w-2xl mx-auto animate-slide-up pb-44 space-y-8">
      {/* User Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-50 dark:ring-emerald-900/20">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1 uppercase">{auth.currentUser?.displayName || "Ilhammencez bin Mohd Rasyidi"}</h2>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">VERIFIED USER</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
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
                <div className="mt-8 bg-[#f1f1f3] rounded-[3rem] p-4 text-center animate-fade-in-down shadow-2xl overflow-hidden relative border border-white/20 max-w-[260px] mx-auto group">
                  {/* Subtle Pink Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="aspect-square flex items-center justify-center overflow-hidden rounded-[2rem]">
                      <img 
                        src="https://lh3.googleusercontent.com/d/1usUmakfqoX6yrVG_BQucVdmQx4jDpxoO" 
                        alt="DuitNow QR" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes("drive.google.com")) {
                            target.src = "https://drive.google.com/uc?id=1usUmakfqoX6yrVG_BQucVdmQx4jDpxoO";
                          }
                        }}
                      />
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-black/5 space-y-1">
                      <p className="text-gray-400 font-black text-[8px] uppercase tracking-[0.3em]">Top Up Wallet</p>
                      <p className="text-[#ED008C] text-[9px] uppercase font-black tracking-widest px-2">ILHAMMENCEZ BIN MOHD RASYIDI</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hub' && (
          <div className="animate-fade-in-down space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Hardware Link & Testing</h3>
              </div>
              
              {/* Connection Mode Selector */}
              <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 mb-4">
                <button 
                  onClick={() => setConnectionMode('ble')}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${connectionMode === 'ble' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                >
                  <Bluetooth size={14} />
                  Bluetooth
                </button>
                <button 
                  onClick={() => setConnectionMode('wifi')}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${connectionMode === 'wifi' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                >
                  <Wifi size={14} />
                  WiFi (ESP8266)
                </button>
              </div>
              
              {connectionMode === 'ble' ? (
                <>
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
                          onClick={() => onTestCommand('LOCK')}
                          className="bg-gray-900 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:bg-black group"
                        >
                          <Lock size={22} className="group-active:scale-110 transition-transform" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em]">TEST LOCK</span>
                        </button>
                        <button 
                          onClick={() => onTestCommand('UNLOCK')}
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
                </>
              ) : (
                <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${isWifiConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Wifi size={24} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 uppercase tracking-tight">WiFi Hub (ESP8266)</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          {isWifiConnected ? "Hub Online" : "Hub Offline / Standby"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-2">Hub IP Address</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input 
                          type="text" 
                          placeholder="e.g. 192.168.1.100"
                          value={wifiIp}
                          onChange={(e) => setWifiIp(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {wifiIp && (
                    <div className="space-y-4 animate-fade-in-down">
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => onTestCommand('LOCK')}
                          className="bg-gray-900 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:bg-black group"
                        >
                          <Lock size={22} className="group-active:scale-110 transition-transform" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em]">TEST LOCK</span>
                        </button>
                        <button 
                          onClick={() => onTestCommand('UNLOCK')}
                          className="bg-emerald-600 text-white py-5 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:bg-emerald-700 group"
                        >
                          <Unlock size={22} className="group-active:scale-110 transition-transform" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em]">TEST UNLOCK</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => window.open(`http://${wifiIp}/status`, '_blank')}
                        className="w-full py-4 rounded-[2rem] border-2 border-amber-500 text-amber-600 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <ShieldCheck size={14} />
                        Authorize Hub (Fix Safari Error)
                      </button>

                      <button 
                        onClick={() => onTestCommand('LOCK')} // This just triggers a fetch to the IP
                        className="w-full py-4 rounded-[2rem] border-2 border-emerald-500 text-emerald-600 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                      >
                        CHECK HUB CONNECTION
                      </button>
                    </div>
                  )}
                  
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-3">
                    <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest leading-relaxed">
                      Note: Ensure your phone and ESP8266 are on the same WiFi network.
                    </p>
                    <div className="pt-2 border-t border-amber-200/50">
                      <p className="text-[7px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Troubleshooting:</p>
                      <ul className="text-[7px] font-bold text-amber-700/80 space-y-1 list-disc pl-3 uppercase">
                        <li>Use "Authorize Hub" button first</li>
                        <li>Try "Add to Home Screen" trick</li>
                        <li>Disable "Private Relay" in iCloud settings</li>
                        <li>Disable "Limit IP Address Tracking" in WiFi settings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="animate-fade-in-down space-y-8 pb-10">
            <div className="space-y-6">
              <div className="px-2 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Project Information</h3>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full">v1.8 Stable</span>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-100/50 dark:shadow-none transition-colors">
                <div className="flex items-center gap-6 mb-10">
                  <div className="relative">
                    <div className="p-5 rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                      <Zap size={32} fill="currentColor" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Solar Synergy</h2>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mt-2">ETP GROUP 17 • UTP</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  <div className="group p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                        <Globe size={18} />
                      </div>
                      <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Origin</p>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 leading-relaxed uppercase tracking-tight">
                      We are a dedicated team from <span className="font-black text-gray-900 dark:text-white">ETP Group 17 Universiti Teknologi Petronas</span>, committed to campus sustainability.
                    </p>
                  </div>

                  <div className="group p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                        <Leaf size={18} />
                      </div>
                      <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Mission</p>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 leading-relaxed uppercase tracking-tight">
                      Solar Synergy is a sustainable micro-mobility charging platform designed for the UTP campus. 
                      Our project leverages solar energy to provide eco-friendly charging for electric scooters 
                      and bicycles, promoting a greener and smarter campus environment through innovative 
                      hardware integration and real-time synergy assistance.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <button 
                      onClick={() => setShowPrivacy(true)}
                      className="flex items-center justify-between p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 group hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">
                          <FileText size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-tight">Privacy Policy</p>
                          <p className="text-[8px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest">PDPA Compliance</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                      onClick={() => setShowReport(true)}
                      className="flex items-center justify-between p-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-800/30 group hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-rose-600 dark:text-rose-400 shadow-sm">
                          <AlertTriangle size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-rose-900 dark:text-rose-300 uppercase tracking-tight">Report Issue</p>
                          <p className="text-[8px] font-bold text-rose-700 dark:text-rose-500 uppercase tracking-widest">Safety Support</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {showReport && <ReportIssueModal onClose={() => setShowReport(false)} />}

      <div className="pt-8 pb-12 space-y-6 opacity-50">
        <button 
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl border-2 border-rose-500/30 text-rose-500 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all active:scale-95"
        >
          Logout Session
        </button>
        <div className="space-y-2">
          <p className="text-[8px] text-center text-gray-400 font-black uppercase tracking-[0.2em]">ETP Group 17 • Solar Synergy v1.8</p>
          <p className="text-[7px] text-center text-gray-400 font-black uppercase tracking-[0.3em]">Created by Ilhammencez Bin Mohd Rasyidi</p>
        </div>
      </div>
    </div>
  );
};
