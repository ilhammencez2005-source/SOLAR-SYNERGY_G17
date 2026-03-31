
import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Navigation, Zap, MapPin, Info } from 'lucide-react';
import { Station, UserLocation } from '../types';

interface ARViewProps {
  userLocation: UserLocation | null;
  stations: Station[];
  onClose: () => void;
}

export const ARView: React.FC<ARViewProps> = ({ userLocation, stations, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Haversine formula for distance
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  };

  // Bearing formula
  const getBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const λ1 = lon1 * Math.PI / 180;
    const λ2 = lon2 * Math.PI / 180;

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360; // in degrees
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setError("CAMERA ACCESS DENIED");
      }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is for iOS, alpha is for Android
      const compassHeading = (e as any).webkitCompassHeading || (360 - (e.alpha || 0));
      setHeading(compassHeading);
    };

    // Request permission for iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    startCamera();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const renderMarkers = () => {
    if (!userLocation || heading === null) return null;

    return stations.map(station => {
      const [sLat, sLng] = station.coordinates.split(',').map(Number);
      const distance = getDistance(userLocation.lat, userLocation.lng, sLat, sLng);
      const bearing = getBearing(userLocation.lat, userLocation.lng, sLat, sLng);

      // Calculate relative angle
      let diff = bearing - heading;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      // Only show markers within 45 degrees of center
      if (Math.abs(diff) > 45) return null;

      // Map angle to horizontal position (-45 to 45 -> 0% to 100%)
      const left = 50 + (diff / 45) * 50;
      
      // Vertical position based on distance (closer = lower)
      const top = 50 - (Math.min(distance, 500) / 500) * 20;

      return (
        <div 
          key={station.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <div className="flex flex-col items-center group">
            <div className="bg-emerald-600/90 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-2 animate-bounce-slow">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                <Zap size={20} fill="currentColor" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{station.name}</p>
                <p className="text-[8px] font-bold text-emerald-200 uppercase tracking-tighter">{distance.toFixed(0)}m AWAY</p>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[7px] font-black text-white uppercase">{station.slots} SLOTS</span>
              </div>
            </div>
            <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-600 to-transparent"></div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden flex flex-col">
      {/* Camera Feed */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      {/* AR Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {isCameraReady && renderMarkers()}
      </div>

      {/* UI Controls */}
      <div className="relative z-10 flex flex-col h-full p-6 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                <Navigation size={20} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">AR Hub Finder</h2>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Scanning for sustainable energy...</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white/10 backdrop-blur-xl hover:bg-white/20 rounded-2xl flex items-center justify-center text-white border border-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4">
          {error ? (
            <div className="bg-rose-600/90 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 animate-shake">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">{error}</p>
            </div>
          ) : !heading ? (
            <div className="bg-amber-600/90 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 animate-pulse">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Calibrating Compass...</p>
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Heading: {heading.toFixed(0)}°</p>
            </div>
          )}
          
          <div className="w-full max-w-xs bg-white/5 backdrop-blur-md p-4 rounded-[2rem] border border-white/10 text-center">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
              Point your camera at the horizon to locate nearby Solar Synergy hubs.
            </p>
          </div>
        </div>
      </div>

      {/* Scanning Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-1 bg-emerald-500/30 absolute top-0 animate-scan shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
      </div>
    </div>
  );
};
