
import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, Wifi, Search, Activity, RefreshCw, Zap as ZapIcon, Info, Settings2, AlertTriangle, ArrowRight, WifiOff, ShieldAlert, Globe, Link, Copy, ExternalLink } from 'lucide-react';
import { Header } from './components/Header';
import { NavigationBar } from './components/NavigationBar';
import { HomeView } from './components/HomeView';
import { BookingView } from './components/BookingView';
import { ChargingSessionView } from './components/ChargingSessionView';
import { GeminiAssistant } from './components/GeminiAssistant';
import { STATIONS } from './constants';
import { Station, Session, UserLocation, ViewState, ChargingMode, Receipt } from './types';

export default function App() {
  const [view, setView] = useState<ViewState>('home'); 
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [walletBalance, setWalletBalance] = useState(50.00);
  const [notification, setNotification] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null); 
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  
  // HARDWARE CONFIGURATION
  const [isHardwareOnline, setIsHardwareOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  
  // Internal API path
  const apiPath = '/api/status';
  // Full URL for display (Arduino)
  const fullUrl = `${window.location.protocol}//${window.location.host}${apiPath}`;
  const [stationId, setStationId] = useState('ETP-G17-HUB');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const checkHardwareStatus = async () => {
    setSyncing(true);
    setBridgeError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(apiPath, { 
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      
      // If we get HTML, the rewrite is sending us the App instead of the API
      if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
        console.error("Bridge Error: Received HTML. Rewrites might be misconfigured.");
        setBridgeError("Endpoint returning HTML instead of status. Check vercel.json.");
        setIsHardwareOnline(false);
      } else if (text.trim() === 'LOCK' || text.trim() === 'UNLOCK') {
        setIsHardwareOnline(true);
      } else {
        console.warn("Bridge responded with unexpected text:", text);
        setIsHardwareOnline(true); // Still treat as online if it's a valid 200 non-HTML
      }
    } catch (e: any) {
      console.error("Bridge check failed:", e);
      setIsHardwareOnline(false);
      setBridgeError(e.name === 'AbortError' ? "Connection Timeout" : "Bridge Endpoint Not Found");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    checkHardwareStatus();
    const interval = setInterval(checkHardwareStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const sendCommand = async (command: 'UNLOCK' | 'LOCK') => {
     try {
       const res = await fetch(apiPath, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: stationId, command })
       });
       if (res.ok) {
         showNotification(`Cloud: ${command} Command Sent`);
       } else {
         showNotification("Bridge Sync Failed");
       }
     } catch (e) {
       console.error("Failed to send command.");
       showNotification("Bridge Offline");
     }
  };

  useEffect(() => {
    let interval: any;
    if (activeSession && activeSession.status === 'charging') {
      interval = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          if (prev.chargeLevel >= 100) { endSession(prev); return null; }
          return { ...prev, chargeLevel: prev.chargeLevel + 0.5, cost: prev.cost + 0.01, timeElapsed: prev.timeElapsed + 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession?.status]);

  const startCharging = (mode: ChargingMode, slotId: string, duration: number | 'full', preAuth: number) => {
    if (preAuth > walletBalance) return showNotification("Insufficient balance.");
    setWalletBalance(p => p - preAuth);
    setActiveSession({ station: selectedStation!, mode, slotId, startTime: new Date(), status: 'charging', chargeLevel: 20, cost: 0, preAuthAmount: preAuth, durationLimit: duration, timeElapsed: 0, isLocked: true });
    sendCommand('LOCK');
    setView('charging');
  };

  const toggleLock = async () => {
    if (!activeSession) return;
    const next = !activeSession.isLocked;
    await sendCommand(next ? 'LOCK' : 'UNLOCK');
    setActiveSession(prev => prev ? ({ ...prev, isLocked: next }) : null);
  };

  const endSession = (cur = activeSession) => {
    if (!cur) return;
    sendCommand('UNLOCK');
    setWalletBalance(p => p + (cur.preAuthAmount - cur.cost));
    setReceipt({ stationName: cur.station.name, date: new Date().toLocaleString(), duration: "Session ended", totalEnergy: "2.1kWh", mode: cur.mode, cost: cur.cost, paid: cur.preAuthAmount, refund: cur.preAuthAmount - cur.cost });
    setActiveSession(null);
    setSelectedStation(null);
    setView('home');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 text-gray-900 font-sans overflow-hidden">
        {notification && (
          <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-[150] bg-gray-900/95 text-white px-6 py-4 rounded-3xl shadow-2xl text-[10px] font-black animate-fade-in-down backdrop-blur-md max-w-[300px] w-full border border-white/10 text-center uppercase tracking-widest">
            {notification}
          </div>
        )}
        
        {view !== 'charging' && view !== 'assistant' && (
          <div className="shrink-0 w-full bg-white shadow-sm border-b border-gray-100 relative z-50">
             <Header walletBalance={walletBalance} onProfileClick={() => setView('profile')} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto relative w-full scrollbar-hide">
          {view === 'home' && (
            <HomeView userLocation={userLocation} handleLocateMe={() => {}} stations={STATIONS} onBookStation={(s) => { setSelectedStation(s); setView('booking'); }} onPrebook={(s) => { setSelectedStation(s); setView('booking'); }} />
          )}
          
          {view === 'booking' && selectedStation && (
            <BookingView selectedStation={selectedStation} onBack={() => { setView('home'); setSelectedStation(null); }} onStartCharging={startCharging} />
          )}

          {view === 'charging' && (
            <ChargingSessionView activeSession={activeSession} toggleLock={toggleLock} endSession={() => endSession()} isHardwareConnected={isHardwareOnline} />
          )}
          
          {view === 'profile' && (
            <div className="p-6 flex flex-col items-center max-w-md mx-auto animate-slide-up pb-44">
              <div className="w-full bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                        <User size={48} className="text-emerald-600"/>
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white shadow-sm">
                        <CheckCircle2 size={14} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter text-gray-900">Ilhammencez</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">UTP Student • ID: 22003814</p>
              </div>

              {/* HARDWARE BRIDGE INTERFACE */}
              <div className="w-full mt-4 bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="relative z-10 flex flex-col gap-5">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-emerald-400" />
                        <h3 className="text-white font-black text-xs uppercase tracking-wider">Bridge Status</h3>
                      </div>
                      <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isHardwareOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {isHardwareOnline ? 'System Linked' : 'Link Broken'}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-3 flex items-center gap-2">
                          <Link size={10} /> Arduino IDE Config
                        </p>
                        <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                           <code className="flex-1 text-[9px] text-emerald-300 font-mono break-all overflow-hidden whitespace-nowrap overflow-ellipsis">
                              {fullUrl}
                           </code>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(fullUrl);
                               showNotification("Link Copied!");
                             }}
                             className="text-white/40 hover:text-white transition-colors"
                           >
                             <Copy size={14} />
                           </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                         <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">State</p>
                            <p className="text-[10px] font-black text-white uppercase">{isHardwareOnline ? 'Ready for Hub' : 'Checking...'}</p>
                         </div>
                         <button onClick={checkHardwareStatus} className="bg-emerald-600 px-6 rounded-2xl text-white shadow-lg active:scale-95 transition-all">
                            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                         </button>
                      </div>
                   </div>
                   
                   {!isHardwareOnline && (
                     <div className="text-[9px] text-rose-300 font-bold bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 space-y-1">
                        <p className="uppercase">⚠️ Bridge Check Failed</p>
                        <p className="font-medium opacity-80 leading-relaxed">{bridgeError || "Could not reach the status endpoint. Ensure the file 'api/status.ts' exists and you have deployed."}</p>
                     </div>
                   )}
                </div>
              </div>

              <div className="w-full bg-white rounded-[3rem] p-8 border border-gray-100 mt-4 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Synergy Credits</p>
                       <h4 className="text-4xl font-black text-emerald-600 tracking-tighter">RM {walletBalance.toFixed(2)}</h4>
                    </div>
                    <button onClick={() => setShowTopUpModal(true)} className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl"><ZapIcon size={24} fill="currentColor" /></button>
                 </div>
                 <button onClick={() => setShowTopUpModal(true)} className="w-full bg-gray-900 text-white py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-xl">Top Up Wallet</button>
              </div>

              <div className="w-full mt-4 space-y-2">
                 {[
                   { i: <Info size={18}/>, t: "ESP8266 Setup Guide" },
                   { i: <Settings2 size={18}/>, t: "App Preferences" }
                 ].map((item, i) => (
                   <button key={i} className="w-full bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between text-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="text-gray-400">{item.i}</div>
                        <span className="text-xs font-black uppercase tracking-wider">{item.t}</span>
                      </div>
                      <ArrowRight size={16} className="text-gray-300" />
                   </button>
                 ))}
              </div>
            </div>
          )}
          {view === 'assistant' && <GeminiAssistant onClose={() => setView('home')} contextData={{ walletBalance, selectedStation }} />}
        </main>

        <NavigationBar view={view} setView={setView} hasActiveSession={!!activeSession} showNotification={showNotification} />

        {showTopUpModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8" onClick={() => setShowTopUpModal(false)}>
             <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-[360px] text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="bg-emerald-600 p-8 rounded-[3rem] mb-8 flex items-center justify-center">
                  <div className="bg-white p-3 rounded-3xl relative z-10">
                    <img src="https://lh3.googleusercontent.com/d/1usUmakfqoX6yrVG_BQucVdmQx4jDpxoO" alt="QR" className="w-full aspect-square object-contain" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase">Terminal Sync</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Scan QR at any Village Kiosk<br/>to reload your Synergy Wallet</p>
             </div>
          </div>
        )}

        {receipt && (
          <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-2xl flex items-center justify-center p-6">
             <div className="bg-white w-full max-w-sm rounded-[3.5rem] shadow-2xl p-12 text-center animate-fade-in-down">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600"><CheckCircle2 size={48} /></div>
                <h2 className="text-3xl font-black text-gray-900 uppercase mb-2">Success</h2>
                <div className="my-10 bg-gray-50/50 py-8 rounded-[2.5rem] border border-gray-100">
                   <p className="text-6xl font-black text-emerald-600 tracking-tighter">RM {receipt.cost.toFixed(2)}</p>
                </div>
                <button onClick={() => setReceipt(null)} className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em]">Done</button>
             </div>
          </div>
        )}
    </div>
  );
}
