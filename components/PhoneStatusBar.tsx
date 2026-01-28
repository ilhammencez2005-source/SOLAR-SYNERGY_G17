import React from 'react';
import { Signal, Wifi } from 'lucide-react';

export const PhoneStatusBar: React.FC = () => (
  <div className="flex justify-between items-center px-6 py-2 bg-white text-black text-xs font-bold sticky top-0 z-50">
    <span>9:41</span>
    <div className="flex items-center gap-1.5">
      <Signal size={12} fill="currentColor" />
      <Wifi size={12} />
      <div className="w-5 h-2.5 bg-black rounded-sm relative">
         <div className="absolute inset-0.5 bg-white rounded-[1px]"></div>
         <div className="absolute inset-0.5 bg-black w-[70%] rounded-[1px]"></div>
      </div>
    </div>
  </div>
);