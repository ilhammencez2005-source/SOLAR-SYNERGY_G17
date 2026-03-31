
import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, Zap as ZapIcon, Power, History, Loader2, ShieldCheck, Clock } from 'lucide-react';
import { Header } from './components/Header';
import { NavigationBar } from './components/NavigationBar';
import { HomeView } from './components/HomeView';
import { BookingView } from './components/BookingView';
import { ChargingSessionView } from './components/ChargingSessionView';
import { GeminiAssistant } from './components/GeminiAssistant';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { ReceiptView } from './components/ReceiptView';
import { STATIONS, PRICING } from './constants';
import { Station, Session, UserLocation, ViewState, ChargingMode, Receipt, ChargingHistoryItem } from './types';

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export default function App() {
  const [view, setView] = useState<ViewState>('home'); 
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [walletBalance, setWalletBalance] = useState(50.00);
  const [notification, setNotification] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null); 
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [chargingHistory, setChargingHistory] = useState<ChargingHistoryItem[]>([]);
  
  const [stations, setStations] = useState<Station[]>(STATIONS);
  const [isReservationMode, setIsReservationMode] = useState(false);
  const [bleDevice, setBleDevice] = useState<any | null>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [bleCharacteristic, setBleCharacteristic] = useState<any | null>(null);
  const [isBleConnecting, setIsBleConnecting] = useState(false);
  
  // WiFi State
  const [connectionMode, setConnectionMode] = useState<'ble' | 'wifi'>('ble');
  const [wifiIp, setWifiIp] = useState<string>('');
  const [isWifiConnected, setIsWifiConnected] = useState(false);

  const handleOccupancyUpdate = (event: any) => {
    const value = new TextDecoder().decode(event.target.value);
    console.log("BLE Notification Received:", value);
    
    if (value.includes("OCCUPIED") || value.includes("AVAILABLE")) {
      const isOccupied = value.includes("OCCUPIED");
      setStations(prev => prev.map(s => {
        if (s.name === "Village 4") {
          return {
            ...s,
            status: isOccupied ? "Occupied" : "Active",
            slots: isOccupied ? 0 : 1
          };
        }
        return s;
      }));
      showNotification(isOccupied ? "VILLAGE 4 PORT OCCUPIED" : "VILLAGE 4 PORT AVAILABLE");
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const connectBluetooth = async () => {
    if (!(navigator as any).bluetooth) {
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      showNotification(isIOS ? "USE BLUEFY APP ON IOS" : "BROWSER NOT SUPPORTED");
      return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      showNotification("HTTPS REQUIRED FOR BT");
      return;
    }

    setIsBleConnecting(true);
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ name: 'SolarSynergyHub' }],
        optionalServices: [SERVICE_UUID]
      });
      
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(SERVICE_UUID);
      const characteristic = await service?.getCharacteristic(CHARACTERISTIC_UUID);
      
      if (characteristic) {
        setBleDevice(device);
        setBleCharacteristic(characteristic);
        
        // Enable Notifications for IR Sensor
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleOccupancyUpdate);
        
        showNotification("HUB PAIRED SUCCESSFULLY");
        
        device.addEventListener('gattserverdisconnected', () => {
          setBleDevice(null);
          setBleCharacteristic(null);
          showNotification("HUB DISCONNECTED");
        });
      }
    } catch (error: any) {
      console.error("BLE Error Detail:", error);
      if (error.name === 'NotFoundError') {
        showNotification("DEVICE NOT FOUND/CANCELLED");
      } else if (error.name === 'SecurityError') {
        showNotification("SECURITY BLOCK (USE HTTPS)");
      } else if (error.name === 'NotAllowedError') {
        showNotification("BT PERMISSION DENIED");
      } else {
        showNotification(`BT FAIL: ${error.message?.substring(0, 15) || "UNKNOWN"}`);
      }
    } finally {
      setIsBleConnecting(false);
    }
  };

  const disconnectBluetooth = () => {
    if (bleDevice?.gatt?.connected) bleDevice.gatt.disconnect();
    setBleDevice(null);
    setBleCharacteristic(null);
  };

  const sendBleCommand = async (command: 'UNLOCK' | 'LOCK') => {
    if (!bleCharacteristic || !bleDevice?.gatt?.connected) {
      showNotification("HUB NOT CONNECTED");
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(command);
      
      if (bleCharacteristic.writeValueWithResponse) {
        await bleCharacteristic.writeValueWithResponse(data);
      } else {
        await bleCharacteristic.writeValue(data);
      }
      
      return true;
    } catch (error: any) {
      console.error("BLE Write Error:", error);
      
      if (error.message?.includes('GATT operation already in progress')) {
        showNotification("COMMAND IN PROGRESS...");
      } else {
        showNotification("HARDWARE CMD FAILED");
      }
      return false;
    }
  };

  const sendWifiCommand = async (command: 'UNLOCK' | 'LOCK') => {
    if (!wifiIp) {
      showNotification("IP ADDRESS REQUIRED");
      return false;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`http://${wifiIp}/${command.toLowerCase()}`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors', // Use CORS since we added headers to ESP
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);
      setIsWifiConnected(true);
      return true;
    } catch (error) {
      console.error("WiFi Error:", error);
      showNotification("WIFI HUB UNREACHABLE");
      return false;
    }
  };

  const sendCommand = async (command: 'UNLOCK' | 'LOCK') => {
    if (connectionMode === 'ble') {
      return await sendBleCommand(command);
    } else {
      return await sendWifiCommand(command);
    }
  };

  // WiFi Status Polling
  useEffect(() => {
    let interval: any;
    if (connectionMode === 'wifi' && wifiIp) {
      interval = setInterval(async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(`http://${wifiIp}/status`, { 
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-cache'
          });
          clearTimeout(timeoutId);
          const data = await res.text();
          if (data.includes("OCCUPIED") || data.includes("AVAILABLE")) {
            const isOccupied = data.includes("OCCUPIED");
            setStations(prev => prev.map(s => {
              if (s.name === "Village 4") {
                return { ...s, status: isOccupied ? "Occupied" : "Active", slots: isOccupied ? 0 : 1 };
              }
              return s;
            }));
            setIsWifiConnected(true);
          }
        } catch (e) {
          // Don't show notification on poll failure to avoid spam
          setIsWifiConnected(false);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [connectionMode, wifiIp]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = { 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude, 
            timestamp: Date.now() 
          };
          setUserLocation(newLoc);
          // Set initial map center
          setMapCenter(prev => prev || { lat: newLoc.lat, lng: newLoc.lng });
        },
        (err) => console.error("Location Error:", err),
        { 
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeSession) {
      interval = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          
          if (prev.status === 'reserving') {
            if (prev.reservationCountdown !== undefined && prev.reservationCountdown > 0) {
              return { ...prev, reservationCountdown: prev.reservationCountdown - 1 };
            } else {
              // LOCK THE HUB AFTER RESERVATION COUNTDOWN
              sendCommand('LOCK');
              showNotification("RESERVATION COMPLETE - HUB LOCKED");
              return { ...prev, status: 'charging', startTime: new Date(), isLocked: true };
            }
          }

          if (prev.status === 'charging') {
            const increment = 2.5; // Charge level increment (FASTER FOR DEMO)
            const newLevel = prev.chargeLevel + increment;
            
            // Calculate energy consumed in Wh (simulated)
            // 40 steps to 100% (at 2.5% per step). 100Wh total = 2.5 Wh per step.
            // 100Wh * RM 0.12 = RM 12.00 for full charge.
            const energyInc = 2.5; 
            const newCost = prev.cost + (energyInc * PRICING.rate);
            
            if (newLevel >= 100) { 
              return { 
                ...prev, 
                chargeLevel: 100, 
                cost: newCost, 
                status: 'completed', 
                completionTime: new Date() 
              };
            }
            
            return { 
              ...prev, 
              chargeLevel: Math.min(newLevel, 100), 
              cost: newCost, 
              timeElapsed: prev.timeElapsed + 1 
            };
          } else if (prev.status === 'completed' || prev.status === 'overstay') {
            if (prev.completionTime) {
              const now = new Date();
              const diffMs = now.getTime() - prev.completionTime.getTime();
              const diffSeconds = diffMs / 1000;
              
              // DEMO MODE: Overstay fee after 15 seconds, then every 15 seconds after
              const overstayIntervals = Math.floor(diffSeconds / 15);
              const expectedFee = overstayIntervals * PRICING.overstayFee;

              if (overstayIntervals >= 1 && prev.overstayFee < expectedFee) {
                showNotification(`OVERSTAY FEE UPDATED: RM ${expectedFee.toFixed(2)}`);
                return {
                  ...prev,
                  status: 'overstay',
                  overstayFee: expectedFee
                };
              }
            }
            return { ...prev, timeElapsed: prev.timeElapsed + 1 };
          }
          
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession?.status]);

  const startCharging = async (mode: ChargingMode, slotId: string, duration: number | 'full', preAuth: number) => {
    if (preAuth > walletBalance) return showNotification("INSUFFICIENT CREDITS");
    
    // Only lock immediately if NOT in reservation mode
    if (!isReservationMode) {
      const locked = await sendCommand('LOCK');
      if (!locked && (bleCharacteristic || wifiIp)) {
        showNotification("WARNING: HUB FAILED TO LOCK");
      }
    } else {
      showNotification("RESERVATION ACTIVE - PARK YOUR SCOOTER");
    }
    
    setWalletBalance(p => p - preAuth);
    setActiveSession({ 
      station: selectedStation!, 
      mode, 
      slotId, 
      startTime: new Date(), 
      status: isReservationMode ? 'reserving' : 'charging', 
      reservationCountdown: isReservationMode ? 10 : undefined,
      chargeLevel: 0, 
      cost: 0, 
      overstayFee: 0, 
      preAuthAmount: preAuth, 
      durationLimit: duration, 
      timeElapsed: 0, 
      isLocked: !isReservationMode 
    });
    setView('charging');
  };

  const endSession = async (cur = activeSession) => {
    if (!cur) return;
    
    await sendCommand('UNLOCK');

    const totalCost = cur.cost + cur.overstayFee;
    const refund = cur.preAuthAmount - totalCost;
    const energy = cur.cost / PRICING.rate; 
    const co2Saved = (energy * 0.475).toFixed(1); // 475g per kWh
    
    setWalletBalance(p => p + refund);
    
    const historyItem: ChargingHistoryItem = {
      id: Date.now(),
      stationName: cur.station.name,
      date: new Date().toLocaleString(),
      amount: totalCost,
      energy: energy,
      duration: `${Math.floor(cur.timeElapsed / 60)}m ${cur.timeElapsed % 60}s`,
      co2Saved: `${co2Saved}g`,
      status: 'Completed'
    };
    
    setChargingHistory(prev => [historyItem, ...prev]);
    setReceipt({ 
      stationName: cur.station.name, 
      date: new Date().toLocaleString(), 
      duration: `${Math.floor(cur.timeElapsed / 60)}m ${cur.timeElapsed % 60}s`, 
      totalEnergy: `${energy.toFixed(1)}Wh`, 
      mode: cur.mode, 
      cost: cur.cost, 
      overstayFee: cur.overstayFee,
      paid: totalCost, 
      refund: refund,
      co2Saved: `${co2Saved}g`
    });
    
    setActiveSession(null); 
    setSelectedStation(null); 
    setView('receipt');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors">
        {notification && (
          <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-[150] bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900 px-6 py-4 rounded-3xl shadow-2xl text-[10px] font-black animate-fade-in-down border border-white/10 dark:border-black/10 text-center uppercase tracking-widest">
            {notification}
          </div>
        )}
        
        {view !== 'charging' && view !== 'assistant' && (
          <div className="shrink-0 w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 relative z-50 transition-colors">
             <Header walletBalance={walletBalance} onProfileClick={() => setView('profile')} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto relative w-full scrollbar-hide">
          {view === 'home' && (
            <HomeView 
              userLocation={userLocation} 
              mapCenter={mapCenter}
              handleLocateMe={() => {
                if (userLocation) {
                  setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });
                  showNotification("LOCATING...");
                }
              }} 
              stations={stations} 
              onBookStation={(s) => { setSelectedStation(s); setIsReservationMode(false); setView('booking'); }} 
              onPrebook={(s) => { setSelectedStation(s); setIsReservationMode(true); setView('booking'); }} 
            />
          )}
          {view === 'booking' && selectedStation && (
            <BookingView 
              selectedStation={selectedStation} 
              onBack={() => { setView('home'); setSelectedStation(null); }} 
              onStartCharging={startCharging} 
              isPrebook={isReservationMode}
            />
          )}
          {view === 'charging' && (
            <ChargingSessionView 
              activeSession={activeSession} 
              toggleLock={() => {}} 
              endSession={() => endSession()} 
              isBleConnected={connectionMode === 'ble' ? !!bleCharacteristic : isWifiConnected}
              isBleConnecting={isBleConnecting}
              onConnectBle={connectionMode === 'ble' ? connectBluetooth : () => {}}
            />
          )}
          {view === 'history' && <HistoryView history={chargingHistory} onClearHistory={() => setChargingHistory([])} />}
          {view === 'profile' && (
            <ProfileView 
              walletBalance={walletBalance} 
              isBleConnected={!!bleCharacteristic}
              isBleConnecting={isBleConnecting}
              bleDeviceName={bleDevice?.name}
              onConnectBle={connectBluetooth}
              onDisconnectBle={disconnectBluetooth}
              onTestCommand={sendCommand}
              connectionMode={connectionMode}
              setConnectionMode={setConnectionMode}
              wifiIp={wifiIp}
              setWifiIp={setWifiIp}
              isWifiConnected={isWifiConnected}
            />
          )}
          {view === 'assistant' && (
            <GeminiAssistant 
              onClose={() => setView('home')} 
              contextData={{ walletBalance, selectedStation, userLocation }} 
            />
          )}
          {view === 'receipt' && receipt && (
            <ReceiptView receipt={receipt} onBack={() => setView('home')} />
          )}
        </main>

        {view !== 'receipt' && (
          <NavigationBar view={view} setView={setView} hasActiveSession={!!activeSession} showNotification={showNotification} />
        )}

    </div>
  );
}
