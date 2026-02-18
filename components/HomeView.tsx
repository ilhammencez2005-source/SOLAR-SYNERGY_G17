
import React, { useState, useMemo } from 'react';
import { MapPin, Crosshair, CalendarClock, Zap, ArrowRight, Sun, Leaf, X, Star, Clock } from 'lucide-react';
import { Station, UserLocation } from '../types';
import { PRICING } from '../constants';

interface HomeViewProps {
  userLocation: UserLocation | null;
  handleLocateMe: () => void;
  stations: Station[];
  onBookStation: (station: Station) => void;
  onPrebook: (station: Station) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ userLocation, handleLocateMe, stations, onBookStation, onPrebook }) => {
  const [detailStation, setDetailStation] = useState<Station | null>(null);

  // Accurate Distance Calculation using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, stationCoords: string) => {
    const [lat2, lon2] = stationCoords.split(',').map(Number);
    const R = 6371; // radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    
    if (d < 1) return `${(d * 1000).toFixed(0)}m`;
    if (d > 1000) return `>1000km`; // Sanity check for extreme distances
    return `${d.toFixed(1)}km`;
  };

  const mapSrc = useMemo(() => {
    return userLocation
      ? `https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&hl=en&z=15&output=embed&iwloc=near`
      : `https://maps.google.com/maps?q=4.3835,100.9638&hl=en&z=17&output=embed&iwloc=near`;
  }, [userLocation?.lat, userLocation?.lng]);

  return (
    <div className="bg-gray-50 min-h-full flex flex-col pb-40">
       {/* Map View */}
       <div className="h-[35vh] min-h-[250px] bg-slate-200 w-full relative overflow-hidden shadow-inner">
          <iframe 
             key={userLocation ? `${userLocation.lat}-${userLocation.lng}-${userLocation.timestamp}` : 'default-map'}
             width="100%" 
             height="100%" 
             frameBorder="0" 
             src={mapSrc}
             className="absolute inset-0 w-full h-full opacity-90 grayscale-[10%]"
             title="Map"
          ></iframe>
          <button 
             onClick={handleLocateMe}
             className="absolute bottom-6 right-6 bg-white p-3 rounded-2xl shadow-xl text-gray-700 z-10 active:scale-95 transition-all hover:bg-gray-50 border border-gray-100"
          >
             <Crosshair size={24} className={userLocation ? 'text-emerald-600' : 'text-gray-700'} />
          </button>
       </div>

       {/* List of Hubs */}
       <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 relative z-10 space-y-6">
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
               <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Nearby Charging Hubs</h2>
               {!userLocation && (
                 <span className="text-[8px] font-black text-emerald-500 animate-pulse uppercase tracking-widest">Waiting for Location...</span>
               )}
             </div>
             
             {stations.map(station => {
                const displayDistance = userLocation 
                  ? calculateDistance(userLocation.lat, userLocation.lng, station.coordinates)
                  : "Locating..."; 

                return (
                  <div key={station.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                              <h3 className="text-xl font-black text-gray-900 tracking-tight">{station.name}</h3>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-lg ${station.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {station.status.toUpperCase()}
                                </span>
                                <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                                    <MapPin size={12} className="text-emerald-500" /> {displayDistance}
                                </span>
                              </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-2 rounded-2xl flex flex-col items-center border border-gray-100">
                              <span className="text-lg font-black text-gray-800 leading-none">{station.slots}</span>
                              <span className="text-[8px] font-black text-gray-400 uppercase">Slots</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <button 
                              onClick={() => onPrebook(station)}
                              className="px-4 bg-gray-50 border border-gray-100 text-gray-800 text-[10px] font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                          >
                              <CalendarClock size={16} />
                              PREBOOK
                          </button>
                          <button 
                              onClick={() => onBookStation(station)}
                              className="px-4 bg-emerald-600 text-white text-[10px] font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 active:scale-95 uppercase tracking-widest"
                          >
                              <Zap size={16} fill="currentColor" />
                              CHARGE NOW
                          </button>
                        </div>
                        <button 
                            onClick={() => setDetailStation(station)}
                            className="w-full text-gray-400 text-[9px] font-black py-2 rounded-xl flex items-center justify-center gap-1 uppercase tracking-[0.3em]"
                        >
                            Details & Pricing
                            <ArrowRight size={10} />
                        </button>
                    </div>
                  </div>
                );
             })}
          </div>
       </div>

       {detailStation && (
         <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fade-in-down" onClick={() => setDetailStation(null)}>
            <div className="bg-white w-full max-w-lg rounded-t-[3rem] shadow-2xl h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
               <div className="p-10 flex-1 overflow-y-auto space-y-10 scrollbar-hide">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black tracking-tight">{detailStation.name}</h2>
                    <button onClick={() => setDetailStation(null)} className="p-2 bg-gray-100 rounded-full"><X size={24} /></button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Available Modes</h3>
                    <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8 space-y-8">
                       {/* Eco Mode Info */}
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <Sun size={24} className="text-emerald-500" />
                             <div>
                                <p className="font-black text-gray-800">Eco Charge</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Free Solar Synergy</p>
                             </div>
                          </div>
                          <span className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">FREE</span>
                       </div>

                       {/* Turbo Mode Info */}
                       <div className="flex justify-between items-center border-t border-gray-200 pt-8">
                          <div className="flex items-center gap-3">
                             <Zap size={24} className="text-yellow-500" fill="currentColor" />
                             <div>
                                <p className="font-black text-gray-800">Turbo Charge</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">RM 1.20 Per kWh</p>
                             </div>
                          </div>
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">PAID</span>
                       </div>
                    </div>
                  </div>

                  {/* Aesthetic Operating Hours Section */}
                  <div className="px-2">
                    <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-sm">
                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                          <Clock size={28} strokeWidth={2.5} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-1">Status</p>
                          <div className="flex items-baseline gap-2">
                             <p className="text-2xl font-black text-gray-900 tracking-tighter uppercase">OPERATING: {detailStation.operatingHours}</p>
                             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mb-1"></div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* RESTORED REVIEWS SECTION */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Community Reviews</h3>
                    <div className="space-y-3">
                      {detailStation.reviews.map((review) => (
                        <div key={review.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                           <div className="flex justify-between items-start mb-2">
                             <div>
                               <p className="font-black text-gray-900 text-xs uppercase tracking-tight">{review.user}</p>
                               <div className="flex items-center gap-0.5 mt-1">
                                 {[...Array(5)].map((_, i) => (
                                   <Star key={i} size={10} className={i < review.rating ? "text-yellow-400" : "text-gray-200"} fill={i < review.rating ? "currentColor" : "none"} />
                                 ))}
                               </div>
                             </div>
                             <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{review.date}</span>
                           </div>
                           <p className="text-[11px] text-gray-600 font-bold leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
               
               <div className="p-10 border-t border-gray-100 bg-white rounded-t-3xl">
                  <button 
                     onClick={() => { setDetailStation(null); onBookStation(detailStation); }}
                     className="w-full bg-emerald-600 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-2xl active:scale-95 transition-all uppercase tracking-widest"
                  >
                     BOOK HUB
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};
