
import React, { useState } from 'react';
import { ArrowLeft, Plug, Clock, CheckCircle2, ArrowRight, Zap as ZapIcon, Navigation, MapPin, Info } from 'lucide-react';
import { Station, ChargingMode } from '../types';
import { PRICING } from '../constants';

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
         {/* Location & Directions */}
         <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
               <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin size={24} />
               </div>
               <div className="flex-1">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Location</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{selectedStation.address}</p>
               </div>
            </div>
            <button 
               onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.coordinates}`, '_blank')}
               className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-200"
            >
               <Navigation size={14} />
               Get Directions
            </button>
         </div>

         {/* Pricing Details */}
         <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <ZapIcon size={24} />
               </div>
               <div>
                  <p className="text-sm font-black text-gray-900">Standard Charge</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Available Now</p>
               </div>
            </div>
            
            <div className="space-y-3">
               <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2">
                     <Info size={14} className="text-gray-400" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Energy Rate</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">RM {PRICING.rate.toFixed(2)} / Wh</span>
               </div>

               <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2">
                     <Clock size={14} className="text-gray-400" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overstay Fee</span>
                  </div>
                  <span className="text-sm font-black text-red-500">RM {PRICING.overstayFee.toFixed(2)} / 15s</span>
               </div>
               
               <p className="text-[8px] font-medium text-gray-400 text-center px-4">
                  *Overstay fee applies 15 seconds after charging is complete (Demo Mode).
               </p>
            </div>
         </div>

         {/* Reviews Section */}
         <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Community Reviews</h3>
            <div className="space-y-3">
               {selectedStation.reviews.map(review => (
                  <div key={review.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <p className="text-xs font-black text-gray-900">{review.user}</p>
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{review.date}</p>
                        </div>
                        <div className="flex gap-0.5">
                           {Array.from({ length: 5 }).map((_, i) => (
                              <CheckCircle2 key={i} size={10} className={i < review.rating ? "text-emerald-500" : "text-gray-200"} />
                           ))}
                        </div>
                     </div>
                     <p className="text-[10px] text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                  </div>
               ))}
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
