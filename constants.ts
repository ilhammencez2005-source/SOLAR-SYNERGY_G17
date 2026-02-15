
import { Station, ChargingHistoryItem } from './types';

export const STATIONS: Station[] = [
  { 
    id: 1, 
    name: "Village 3C", 
    address: "9XP8+RH, 31750, Perak", 
    distance: "433 m away", 
    slots: 2, 
    totalSlots: 2,
    type: "Type 2 (22.0kW)",
    status: "Active",
    coordinates: "4.3835,100.9638",
    operatingHours: "24/7",
    features: ["Sheltered", "Solar Powered", "Nearby Cafe"],
    reviews: [
      { id: 1, user: "Dr. Azlan", rating: 5, comment: "Super fast charging! The solar canopy is a nice touch.", date: "2 days ago" },
      { id: 2, user: "Dr. Yit", rating: 4, comment: "Good location, but sometimes crowded during lunch.", date: "1 week ago" }
    ]
  },
  { 
    id: 2, 
    name: "Village 4", 
    address: "Universiti Teknologi PETRONAS, Village 4",
    distance: "1.2 km away", 
    slots: 0, 
    totalSlots: 2,
    type: "Type 2 (11.0kW)",
    status: "Occupied",
    coordinates: "4.3880,100.9750",
    operatingHours: "7:00 AM - 11:00 PM",
    features: ["Security Guard", "Vending Machine"],
    reviews: [
      { id: 1, user: "Dr. Azlan", rating: 5, comment: "Very convenient for V4 residents.", date: "3 days ago" },
      { id: 2, user: "Dr. Yit", rating: 3, comment: "One port was under maintenance last time.", date: "2 weeks ago" }
    ]
  },
];

export const PRICING = {
  fast: 1.20, // RM per kWh
  normal: 0,   // Free
};

export const MOCK_HISTORY: ChargingHistoryItem[] = [
  { 
    id: 1, 
    stationName: "Village 3C Hub", 
    date: "24 Oct 2024, 02:45 PM", 
    amount: 14.20, 
    energy: 11.8, 
    status: 'Completed' 
  },
  { 
    id: 2, 
    stationName: "Village 4 Dock", 
    date: "22 Oct 2024, 09:12 AM", 
    amount: 0.00, 
    energy: 4.5, 
    status: 'Completed' 
  },
  { 
    id: 3, 
    stationName: "Village 3C Hub", 
    date: "19 Oct 2024, 11:30 PM", 
    amount: 8.50, 
    energy: 7.1, 
    status: 'Completed' 
  },
  { 
    id: 4, 
    stationName: "Village 4 Dock", 
    date: "15 Oct 2024, 05:20 PM", 
    amount: 12.00, 
    energy: 10.0, 
    status: 'Completed' 
  },
];
