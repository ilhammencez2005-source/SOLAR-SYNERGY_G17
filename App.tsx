
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
import { LoginView } from './components/LoginView';
import { STATIONS, PRICING } from './constants';
import { Station, Session, UserLocation, ViewState, ChargingMode, Receipt, ChargingHistoryItem } from './types';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, where, addDoc, serverTimestamp, handleFirestoreError, OperationType } from './firebase';

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
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSimulation, setIsSimulation] = useState(false);

  const addCredits = async (amount: number) => {
    if (!auth.currentUser) return;
    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        walletBalance: newBalance
      });
      showNotification(`RM ${amount.toFixed(2)} ADDED TO WALLET`);
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthLoading(true);
        setIsLoggedIn(true);
        setIsSimulation(false);
        setUserEmail(user.email);
        
        // Sync user profile/wallet from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setWalletBalance(userDoc.data().walletBalance);
          } else {
            // Create initial user profile
            const newUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              walletBalance: 50.00,
              createdAt: serverTimestamp(),
              role: 'client'
            };
            await setDoc(userDocRef, newUser);
            setWalletBalance(50.00);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
        setIsAuthLoading(false);
      } else {
        // Only clear if we're not in simulation mode
        if (!isSimulation) {
          setIsLoggedIn(false);
          setUserEmail(null);
        }
        setIsAuthLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [isSimulation]);

  // Sync Stations from Firestore
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const q = query(collection(db, 'stations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Seed stations if empty (first time)
        STATIONS.forEach(async (s) => {
          try {
            await setDoc(doc(db, 'stations', s.id.toString()), s);
          } catch (error) {
            console.error("Error seeding station:", error);
          }
        });
      } else {
        const updatedStations = snapshot.docs.map(doc => doc.data() as Station);
        setStations(prev => {
          if (JSON.stringify(prev) === JSON.stringify(updatedStations)) return prev;
          return updatedStations;
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'stations');
    });
    
    return () => unsubscribe();
  }, [isLoggedIn]);

  // Sync History from Firestore
  useEffect(() => {
    if (!isLoggedIn || !auth.currentUser) return;
    
    const q = query(collection(db, 'sessions'), where('uid', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs
        .map(doc => {
          const data = doc.data();
          const startTime = data.startTime?.toDate?.() || new Date(data.startTime);
          const completionTime = data.completionTime?.toDate?.() || (data.completionTime ? new Date(data.completionTime) : null);
          
          const energy = data.energyConsumed || (data.cost / PRICING.rate);
          const co2Saved = (energy * 0.475).toFixed(1);

          return {
            id: doc.id,
            stationName: data.station?.name || 'Unknown Station',
            date: startTime,
            amount: (data.cost || 0) + (data.overstayFee || 0),
            energy: energy,
            duration: completionTime ? 
              `${Math.floor((completionTime.getTime() - startTime.getTime()) / 60000)}m` : 
              'Active',
            co2Saved: `${co2Saved}g`,
            status: data.status === 'completed' ? 'Completed' : 'Active'
          } as ChargingHistoryItem;
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      setChargingHistory(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sessions');
    });
    
    return () => unsubscribe();
  }, [isLoggedIn]);

  // WiFi State
  const [connectionMode, setConnectionMode] = useState<'ble' | 'wifi'>('ble');
  const [wifiIp, setWifiIp] = useState<string>('');
  const [isWifiConnected, setIsWifiConnected] = useState(false);
  const [lastVibState, setLastVibState] = useState(false);

  const handleOccupancyUpdate = (event: any) => {
    const value = new TextDecoder().decode(event.target.value);
    console.log("BLE Notification Received:", value);
    
    if (value.includes("OCCUPIED") || value.includes("AVAILABLE") || value.includes("VACANT") || value.includes("VIBRATION_ALERT")) {
      const isOccupied = value.includes("OCCUPIED") || value.includes("VIBRATION_ALERT");
      const isVacant = value.includes("AVAILABLE") || value.includes("VACANT");
      
      // Sync to Firestore
      const stationRef = doc(db, 'stations', '4'); // Village 4 is ID 4
      updateDoc(stationRef, {
        status: isOccupied ? "Occupied" : "Active",
        slots: isOccupied ? 0 : 1
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'stations/4'));
      
      if (value.includes("VIBRATION_ALERT")) {
        if (!lastVibState) {
          showNotification("VILLAGE 4: VIBRATION DETECTED!");
          setLastVibState(true);
        }
      } else {
        setLastVibState(false);
        showNotification(isOccupied ? "VILLAGE 4 PORT OCCUPIED" : "VILLAGE 4 PORT AVAILABLE");
      }
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
          if (data.includes("OCCUPIED") || data.includes("AVAILABLE") || data.includes("VACANT") || data.includes("VIBRATION_ALERT")) {
            const isOccupied = data.includes("OCCUPIED") || data.includes("VIBRATION_ALERT");
            
            // Sync to Firestore
            const stationRef = doc(db, 'stations', '4');
            updateDoc(stationRef, {
              status: isOccupied ? "Occupied" : "Active",
              slots: isOccupied ? 0 : 1
            }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'stations/4'));
            
            setIsWifiConnected(true);
            
            if (data.includes("VIBRATION_ALERT")) {
              if (!lastVibState) {
                showNotification("VILLAGE 4: VIBRATION DETECTED!");
                setLastVibState(true);
              }
            } else {
              setLastVibState(false);
            }
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
            // 40 steps to 100% (at 2.5% per step). 400Wh total = 10 Wh per step.
            // 400Wh * RM 0.03 = RM 12.00 for full charge.
            const energyInc = 10; 
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
    if (!isLoggedIn) return showNotification("LOGIN REQUIRED");
    
    // Only lock immediately if NOT in reservation mode
    if (!isReservationMode) {
      const locked = await sendCommand('LOCK');
      if (!locked && (bleCharacteristic || wifiIp)) {
        showNotification("WARNING: HUB FAILED TO HUB LOCK");
      }
    } else {
      showNotification("RESERVATION ACTIVE - PARK YOUR SCOOTER");
    }
    
    const newBalance = walletBalance - preAuth;
    setWalletBalance(newBalance);
    
    // Sync wallet to Firestore if real user
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      updateDoc(userDocRef, { walletBalance: newBalance })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser?.uid}`));
    }

    const sessionData = { 
      uid: auth.currentUser?.uid || 'demo-user',
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
    };

    // Save session to Firestore if real user
    if (auth.currentUser) {
      try {
        const sessionRef = await addDoc(collection(db, 'sessions'), sessionData);
        setActiveSession({ ...sessionData, id: sessionRef.id } as any);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'sessions');
      }
    } else {
      // Simulation mode
      setActiveSession({ ...sessionData, id: 'demo-' + Date.now() } as any);
    }
    
    setView('charging');
  };

  const endSession = async (cur = activeSession) => {
    if (!cur || !isLoggedIn) return;
    
    await sendCommand('UNLOCK');

    const totalCost = cur.cost + cur.overstayFee;
    const refund = cur.preAuthAmount - totalCost;
    const energy = cur.cost / PRICING.rate; 
    const co2Saved = (energy * 0.475).toFixed(1); // 475g per kWh
    
    const newBalance = walletBalance + refund;
    setWalletBalance(newBalance);

    // Sync wallet to Firestore if real user
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      updateDoc(userDocRef, { walletBalance: newBalance })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser?.uid}`));

      // Update session in Firestore
      if ((cur as any).id) {
        const sessionRef = doc(db, 'sessions', (cur as any).id);
        updateDoc(sessionRef, {
          status: 'completed',
          completionTime: new Date(),
          cost: cur.cost,
          overstayFee: cur.overstayFee,
          energyConsumed: energy
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `sessions/${(cur as any).id}`));
      }
    }
    
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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginView onLogin={(email) => { 
      setIsLoggedIn(true); 
      setUserEmail(email); 
      if (email.includes('solarsynergy.com')) setIsSimulation(true);
    }} />;
  }

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
              onAddCredits={() => addCredits(50.00)}
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
              onLogout={() => { setIsLoggedIn(false); setUserEmail(null); setView('home'); }}
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
