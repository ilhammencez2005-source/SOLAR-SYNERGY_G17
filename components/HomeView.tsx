
import React, { useState } from 'react';
import { MapPin, User, Crosshair, Navigation, CalendarClock, Zap, Star, Clock, Info, X, MessageSquare, DollarSign, Shield, ArrowRight } from 'lucide-react';
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

  // Added &iwloc=near to suppress the default info window (coordinates/directions box)
  const mapSrc = userLocation
    ? `https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&hl=en&z=15&output=embed&iwloc=near`
    : `https://maps.google.com/maps?q=4.3835,100.9638&hl=en&z=17&output=embed&iwloc=near`;

  return (
    <div className="bg-gray-50 min-h-full flex flex-col">
       <div className="h-[45vh] min-h-[350px] bg-slate-200 w-full relative overflow-hidden shadow-inner">
          <iframe 
             key={userLocation ? `${userLocation.lat}-${userLocation.lng}-${userLocation.timestamp}` : 'default-map'}
             width="100%" 
             height="100%" 
             frameBorder="0" 
             scrolling="no" 
             marginHeight={0} 
             marginWidth={0} 
             src={mapSrc}
             className="absolute inset-0 w-full h-full opacity-90"
             style={{ filter: 'grayscale(10%) contrast(1.1)' }}
             title="Map"
          ></iframe>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-gray-50/60"></div>
          
          <button 
             onClick={handleLocateMe}
             className="absolute bottom-6 right-6 bg-white p-3 rounded-xl shadow-lg text-gray-700 z-10 active:scale-95 transition-all hover:bg-gray-50 hover:shadow-xl"
             aria-label="Locate me"
          >
             <Crosshair size={24} className={userLocation ? 'text-emerald-600' : 'text-gray-700'} />
          </button>
       </div>

       <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 -mt-10 relative z-10 space-y-4 pb-8">
          {stations.map(station => (
             <div key={station.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-5">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                         <h3 className="text-xl font-bold text-gray-900">{station.name}</h3>
                         <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${station.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                               {station.status.toUpperCase()}
                            </span>
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <MapPin size={12} /> {station.distance}
                            </span>
                         </div>
                      </div>
                   </div>
                   <p className="text-sm text-gray-600 mb-5 flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <span className="font-semibold">🔌 Availability:</span> {station.slots} / {station.totalSlots} Slots Free
                   </p>
                   
                   {/* Action Buttons */}
                   <div className="grid grid-cols-2 gap-3 mb-3">
                      <button 
                         onClick={() => onPrebook(station)}
                         className="px-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-700 text-sm font-bold py-3 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                         <CalendarClock size={16} />
                         PREBOOK
                      </button>
                      <button 
                         onClick={() => onBookStation(station)}
                         className="px-4 bg-emerald-600 border-2 border-emerald-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
                      >
                         <Zap size={16} fill="currentColor" />
                         CHARGE
                      </button>
                   </div>
                   <button 
                       onClick={() => setDetailStation(station)}
                       className="w-full bg-white border border-gray-200 text-gray-600 text-sm font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                       VIEW DETAILS
                       <ArrowRight size={14} />
                    </button>
                </div>
             </div>
          ))}
       </div>

       {/* Detail Modal */}
       {detailStation && (
         <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in-down" onClick={() => setDetailStation(null)}>
            <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl h-[85vh] sm:h-auto overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
               
               {/* Modal Header */}
               <div className="relative h-48 bg-gray-200 shrink-0">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    src={`https://maps.google.com/maps?q=${detailStation.coordinates}&hl=en&z=17&output=embed&iwloc=near`}
                    className="absolute inset-0 w-full h-full opacity-80"
                    title="Detail Map"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <button onClick={() => setDetailStation(null)} className="absolute top-4 right-4 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 backdrop-blur-md transition-colors">
                     <X size={20} />
                  </button>
                  <div className="absolute bottom-4 left-6 text-white">
                     <h2 className="text-2xl font-bold leading-none mb-1">{detailStation.name}</h2>
                     <p className="text-sm opacity-90 flex items-center gap-1"><MapPin size={14} /> {detailStation.address}</p>
                  </div>
               </div>

               {/* Scrollable Content */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                           <Clock size={20} />
                        </div>
                        <div>
                           <p className="text-xs text-gray-500 font-bold uppercase">Hours</p>
                           <p className="text-sm font-bold text-gray-800">{detailStation.operatingHours}</p>
                        </div>
                     </div>
                     <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                           <Shield size={20} />
                        </div>
                        <div>
                           <p className="text-xs text-gray-500 font-bold uppercase">Status</p>
                           <p className="text-sm font-bold text-gray-800">{detailStation.status}</p>
                        </div>
                     </div>
                  </div>

                  {/* Pricing Info */}
                  <div>
                     <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <DollarSign size={20} className="text-emerald-600" />
                        Pricing
                     </h3>
                     <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                           <div>
                              <p className="font-bold text-gray-800">Eco Charge (Solar)</p>
                              <p className="text-xs text-gray-500">Standard speed</p>
                           </div>
                           <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <div>
                              <p className="font-bold text-gray-800">Turbo Charge</p>
                              <p className="text-xs text-gray-500">Fast charging</p>
                           </div>
                           <span className="text-gray-900 font-bold">RM {PRICING.fast.toFixed(2)}/kWh</span>
                        </div>
                     </div>
                  </div>

                  {/* Reviews */}
                  <div>
                     <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare size={20} className="text-yellow-500" />
                        Reviews
                     </h3>
                     <div className="space-y-3">
                        {detailStation.reviews && detailStation.reviews.length > 0 ? (
                           detailStation.reviews.map(review => (
                              <div key={review.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                 <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-sm text-gray-900">{review.user}</span>
                                    <span className="text-xs text-gray-400">{review.date}</span>
                                 </div>
                                 <div className="flex text-yellow-400 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                       <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                                    ))}
                                 </div>
                                 <p className="text-sm text-gray-600 leading-relaxed">"{review.comment}"</p>
                              </div>
                           ))
                        ) : (
                           <div className="text-center py-6 text-gray-400 text-sm italic bg-gray-50 rounded-xl">
                              No reviews yet. Be the first!
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Features */}
                   <div>
                     <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Info size={20} className="text-blue-500" />
                        Amenities
                     </h3>
                     <div className="flex flex-wrap gap-2">
                        {detailStation.features.map((feature, idx) => (
                           <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200">
                              {feature}
                           </span>
                        ))}
                     </div>
                  </div>

               </div>

               {/* Modal Footer */}
               <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                  <button 
                     onClick={() => {
                        setDetailStation(null);
                        onBookStation(detailStation);
                     }}
                     className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                  >
                     Select Station
                  </button>
               </div>

            </div>
         </div>
       )}
    </div>
  );
};
