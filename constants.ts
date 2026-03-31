
import { Station, ChargingHistoryItem } from './types';

export const STATIONS: Station[] = [
  { 
    id: 1, 
    name: "Village 3", 
    address: "Village 3 Cafe, Universiti Teknologi PETRONAS, 31750 Seri Iskandar, Perak", 
    distance: "120m", 
    slots: 2, 
    totalSlots: 2,
    type: "Type 2 (22.0kW)",
    status: "Active",
    coordinates: "4.3822,100.9662",
    operatingHours: "24/7",
    features: ["Sheltered", "Solar Powered", "Nearby Cafe"],
    reviews: [
      { id: 1, user: "Dr. Azlan", rating: 5, comment: "Super fast charging! The solar canopy is a nice touch.", date: "2 days ago" },
      { id: 2, user: "Dr. Yit", rating: 4, comment: "Good location, but sometimes crowded during lunch.", date: "1 week ago" },
      { id: 3, user: "Dr Ahmad Kamal B Mohd Nor", rating: 5, comment: "Excellent initiative for green energy in Seri Iskandar. The solar integration is top-notch.", date: "Today" },
      { id: 4, user: "Mr Hareshwara Ruban Subramaniam", rating: 5, comment: "Seamless integration with IoT and BLE. Very impressive technical execution.", date: "Today" }
    ]
  },
  { 
    id: 2, 
    name: "Village 4", 
    address: "Village 4, Universiti Teknologi PETRONAS, 31750 Seri Iskandar, Perak",
    distance: "450m", 
    slots: 0, 
    totalSlots: 2,
    type: "Type 2 (11.0kW)",
    status: "Occupied",
    coordinates: "4.3842,100.9768",
    operatingHours: "7:00 AM - 11:00 PM",
    features: ["Security Guard", "Vending Machine"],
    reviews: [
      { id: 1, user: "Dr. Azlan", rating: 5, comment: "Very convenient for V4 residents.", date: "3 days ago" },
      { id: 2, user: "Dr. Yit", rating: 3, comment: "One port was under maintenance last time.", date: "2 weeks ago" },
      { id: 3, user: "Dr Ahmad Kamal B Mohd Nor", rating: 5, comment: "Great accessibility for the student community. Highly recommended.", date: "Today" },
      { id: 4, user: "Mr Hareshwara Ruban Subramaniam", rating: 5, comment: "The real-time occupancy tracking via IR sensor is a game changer.", date: "Today" }
    ]
  },
];

export const PRICING = {
  rate: 0.12, // RM per Wh
  overstayFee: 1.00, // RM after 1 hour of occupancy after charging
  maxPower: 3000, // Watts (3kW)
};
