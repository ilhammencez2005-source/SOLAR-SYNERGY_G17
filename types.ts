
export interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Station {
  id: number;
  name: string;
  address: string;
  distance: string;
  slots: number;
  totalSlots: number;
  type: string;
  status: 'Active' | 'Occupied';
  coordinates: string;
  operatingHours: string;
  reviews: Review[];
  features: string[];
}

export type ChargingMode = 'standard';

export interface Session {
  station: Station;
  mode: ChargingMode;
  slotId: string;
  startTime: Date;
  status: 'reserving' | 'charging' | 'completed' | 'overstay';
  reservationCountdown?: number;
  chargeLevel: number;
  cost: number;
  overstayFee: number;
  preAuthAmount: number;
  durationLimit: number | 'full'; 
  timeElapsed: number;
  completionTime?: Date;
  isLocked: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  timestamp?: number;
}

export interface ChargingHistoryItem {
  id: number | string;
  stationName: string;
  date: Date;
  amount: number;
  energy: number;
  duration: string;
  co2Saved: string;
  status: 'Completed' | 'Active';
}

export interface Receipt {
  stationName: string;
  date: string;
  duration: string;
  totalEnergy: string;
  mode: ChargingMode;
  cost: number;
  overstayFee: number;
  paid: number;
  refund: number;
  co2Saved: string;
}

export type ViewState = 'home' | 'booking' | 'charging' | 'assistant' | 'profile' | 'history' | 'receipt';

export interface ContextData {
  walletBalance: number;
  selectedStation: Station | null;
  userLocation: UserLocation | null;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  grounding?: any[];
}
