
import React, { useState } from 'react';
import { ArrowLeft, Plug, Clock, CheckCircle2, ArrowRight, Zap as ZapIcon } from 'lucide-react';
import { Station, ChargingMode } from '../types';

interface BookingViewProps {
  selectedStation: Station;
  onBack: () => void;
  onStartCharging: (mode: ChargingMode, slotId: string, duration: number | 'full', preAuth: number) => void;
  isPrebook?: boolean;
}

type BookingStep = 'mode' | 'slot';

export const BookingView: React.FC<BookingViewProps> = ({ selectedStation, onBack, onStartCharging, isPrebook }) => {
  const [step, setStep] = useState<BookingStep>('slot');

  const slots = Array.from({ length: selectedStation.totalSlots }, (_, i) => ({
    id: String.fromCharCode(65 + i),
    status: i < selectedStation.slots ? 'Available' : 'Occupied'
  }));

  const handleSlotSelect = (slotId: string) => {
    // Fixed rate of RM 0.15/Wh. Pre-auth RM 10.00
    const preAuth = 10.00;
    onStartCharging('standard', slotId, 'full', preAuth);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white shadow-sm z-20 border-b border-gray-200 shrink-0">
         <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
               <ArrowLeft size={24} />
            </button>
            <div>
               <h2 className="text-xl font-black text-gray-900 leading-tight">{selectedStation.name}</h2>
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isPrebook ? "PREBOOKING FLOW" : "INSTANT CHARGE"}</p>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <ZapIcon size={24} />
               </div>
               <div>
                  <p className="text-sm font-black text-gray-900">Standard Charge</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RM 0.12 / Wh • Max 3kW</p>
               </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Overstay Fee</span>
                  <span className="text-red-500">RM 1.00 / 15 SEC (DEMO)</span>
               </div>
               {isPrebook && (
                 <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-amber-600 border-t border-gray-100 pt-2">
                   <span>Reservation Timer</span>
                   <span>10 SECONDS</span>
                 </div>
               )}
            </div>
         </div>

         <div className="space-y-4 animate-slide-up">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Choose Connector</h3>
            <div className="grid grid-cols-2 gap-4">
               {slots.map(slot => (
                 <button 
                   key={slot.id}
                   disabled={slot.status === 'Occupied'}
                   onClick={() => handleSlotSelect(slot.id)}
                   className={`p-10 rounded-[3rem] border-2 flex flex-col items-center gap-4 transition-all ${slot.status === 'Occupied' ? 'bg-gray-50 border-gray-100 opacity-50' : 'bg-white border-gray-100 active:border-emerald-600 active:bg-emerald-50'}`}
                 >
                   <Plug size={40} className={slot.status === 'Occupied' ? 'text-gray-300' : 'text-emerald-600'} />
                   <span className="font-black text-xl text-gray-900">Slot {slot.id}</span>
                   {isPrebook && slot.status === 'Available' && (
                     <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">10s Reservation</span>
                   )}
                 </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
