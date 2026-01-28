
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Zap, Sun, Navigation, Plug, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import { Station, ChargingMode } from '../types';
import { PRICING } from '../constants';

interface BookingViewProps {
  selectedStation: Station;
  onBack: () => void;
  onStartCharging: (mode: ChargingMode, slotId: string, duration: number | 'full', preAuth: number) => void;
}

type BookingStep = 'mode' | 'slot' | 'limit';

export const BookingView: React.FC<BookingViewProps> = ({ selectedStation, onBack, onStartCharging }) => {
  const [showNavModal, setShowNavModal] = useState(false);
  const [step, setStep] = useState<BookingStep>('mode');
  const [selectedMode, setSelectedMode] = useState<ChargingMode | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const slots = Array.from({ length: selectedStation.totalSlots }, (_, i) => ({
    id: String.fromCharCode(65 + i),
    status: i < selectedStation.slots ? 'Available' : 'Occupied'
  }));

  const handleModeSelect = (mode: ChargingMode) => {
    setSelectedMode(mode);
    setStep('slot');
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    setStep('limit');
  };

  const handleLimitSelect = (duration: number | 'full') => {
    if (!selectedMode || !selectedSlot) return;
    
    // Calculate pre-auth amount
    let preAuth = 0;
    if (selectedMode === 'fast') {
      if (duration === 'full') {
        preAuth = 50.00; // Max cap
      } else {
        // Simple estimation: 1.20 RM/kWh. 
        // Let's assume Turbo charges 0.5 kWh every 15 mins (approx 2kWh/hour)
        const estKwh = (duration as number / 15) * 0.5;
        preAuth = Math.max(5, Math.ceil(estKwh * PRICING.fast * 1.2)); // Pad with 20%
      }
    }
    
    onStartCharging(selectedMode, selectedSlot, duration, preAuth);
  };

  const getTimeOptions = () => [
    { label: '15 Mins', value: 15 },
    { label: '30 Mins', value: 30 },
    { label: '1 Hour', value: 60 },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white shadow-sm z-20 border-b border-gray-200">
         <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button 
              onClick={step === 'mode' ? onBack : () => setStep(step === 'limit' ? 'slot' : 'mode')} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            >
                <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedStation.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedStation.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {selectedStation.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{selectedStation.distance}</span>
                </div>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
         <div className="h-[30vh] min-h-[200px] bg-gray-200 relative w-full shadow-inner">
            <iframe 
               width="100%" 
               height="100%" 
               frameBorder="0" 
               scrolling="no" 
               src={`https://maps.google.com/maps?q=${selectedStation.coordinates}&hl=en&z=16&output=embed&iwloc=near`}
               className="absolute inset-0 w-full h-full opacity-90"
               title="Station Map"
            ></iframe>
         </div>

         <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6 -mt-12 relative z-10">
            
            {step === 'mode' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-slide-up">
                 <h3 className="text-lg font-bold text-gray-800 mb-5">Select Charging Mode</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => handleModeSelect('normal')} className="group border-2 border-emerald-100 bg-emerald-50/30 p-4 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left">
                       <div className="flex justify-between mb-3">
                          <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                              <Sun size={24} className="text-emerald-600" />
                          </div>
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full h-fit">FREE</span>
                       </div>
                       <p className="font-bold text-base text-gray-900">Eco Charge</p>
                       <p className="text-xs text-gray-500 mt-1">Standard solar speed</p>
                    </button>

                    <button onClick={() => handleModeSelect('fast')} className="group border-2 border-yellow-100 bg-yellow-50/30 p-4 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left">
                        <div className="flex justify-between mb-3">
                          <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                              <Zap size={24} className="text-yellow-600" />
                          </div>
                          <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full h-fit">PAID</span>
                       </div>
                       <p className="font-bold text-base text-gray-900">Turbo Charge</p>
                       <p className="text-xs text-gray-500 mt-1">Max charging speed</p>
                    </button>
                 </div>
                 <button onClick={() => setShowNavModal(true)} className="mt-6 w-full bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Navigation size={18} />
                    Get Directions
                 </button>
              </div>
            )}

            {step === 'slot' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-slide-up">
                  <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2 rounded-lg ${selectedMode === 'fast' ? 'bg-yellow-100' : 'bg-emerald-100'}`}>
                          {selectedMode === 'fast' ? <Zap size={20} className="text-yellow-600" /> : <Sun size={20} className="text-emerald-600" />}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Select Connector</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      {slots.map((slot) => (
                          <button
                              key={slot.id}
                              disabled={slot.status === 'Occupied'}
                              onClick={() => handleSlotSelect(slot.id)}
                              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                                  slot.status === 'Occupied' 
                                  ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' 
                                  : 'bg-white border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30'
                              }`}
                          >
                              <div className="bg-gray-100 p-3 rounded-full">
                                  <Plug size={24} className="text-gray-600" />
                              </div>
                              <span className="font-bold text-gray-900">Slot {slot.id}</span>
                          </button>
                      ))}
                  </div>
              </div>
            )}

            {step === 'limit' && (
               <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-slide-up">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-emerald-100">
                           <Clock size={20} className="text-emerald-600" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-gray-800">Charging Limit</h3>
                          <p className="text-xs text-gray-500">How long would you like to charge?</p>
                      </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        {getTimeOptions().map((opt) => {
                            const estKwh = (opt.value / 15) * 0.5;
                            const estCost = selectedMode === 'fast' ? estKwh * PRICING.fast : 0;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleLimitSelect(opt.value)}
                                    className="p-4 border-2 border-gray-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-100">
                                            <Clock size={18} className="text-gray-400 group-hover:text-emerald-600" />
                                        </div>
                                        <span className="font-bold text-gray-800">{opt.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">Est. RM {estCost.toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Pre-auth limit</p>
                                    </div>
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handleLimitSelect('full')}
                            className="p-5 border-2 border-emerald-100 bg-emerald-50/50 rounded-xl hover:border-emerald-600 transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle2 size={18} className="text-emerald-600" />
                                </div>
                                <div>
                                    <span className="font-bold text-emerald-900">Full Charge</span>
                                    <p className="text-[10px] text-emerald-600 font-bold">AUTOMATIC REFUND</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-emerald-900">Max RM 50.00</p>
                                <p className="text-[10px] text-emerald-500 uppercase font-bold">Auto-calculated</p>
                            </div>
                        </button>
                    </div>
                  </div>

                  <p className="text-center text-[10px] text-gray-400 mt-6 leading-relaxed">
                      Session will automatically end when the selected time is reached or the battery is full. Unused balance is refunded instantly.
                  </p>
               </div>
            )}

         </div>
      </div>
      
      {showNavModal && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowNavModal(false)}>
            <div className="bg-white rounded-3xl p-8 space-y-6 animate-slide-up max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
               <h3 className="text-xl font-bold text-gray-900">Navigate with</h3>
               <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <MapPin size={24} className="text-red-500" />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Google Maps</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-orange-50">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        <Navigation size={24} className="text-emerald-600" />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Waze</span>
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
