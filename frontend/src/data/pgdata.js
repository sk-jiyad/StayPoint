// src/data/pgdata.js

export const pgListings = [
  {
    id: 1,
    name: "Adhya PG",
    address: "Beside Aayakar Bhawan, Gobindpur, Asansol",
    description: "Safe and comfortable PG for students with homely food and peaceful environment.",
    college: "Asansol Engineering College",
    rating: 4.4,
    reviews: 18,
    ownerName: "Rajesh Kumar",
    ownerPhone: "9876543210",
    ownerEmail: "rajesh@adhya.com",
    latitude: 23.6739,
    longitude: 86.9524,
    gender: "girls", // 'boys' | 'girls' | 'coed'
    distance: 2.5,
    status: "vacant", // 'vacant' | 'few' | 'full'
    images: [
      "/pg-room-1.jpg",
      "/pg-room-2.jpg",
      "/pg-room-3.jpg",
    ],
    amenities: [
      "WiFi",
      "Food",
      "AC",
      "Laundry",
      "Parking",
      "Attached Bath",
    ],
    // Dynamic pricing structure
    sharingOptions: [
      { type: "Single", rent: 8000 },
      { type: "Double", rent: 6000 },
      { type: "Triple", rent: 4500 },
    ],
    // Tenant management for Owner Dashboard
    tenants: [
      { 
        id: 101, 
        name: "Rahul K.", 
        college: "Asansol Engineering College", 
        phone: "9876543210", 
        roomType: "Single", 
        rentPaid: true 
      },
      { 
        id: 102, 
        name: "Priya S.", 
        college: "NIT Durgapur", 
        phone: "9123456789", 
        roomType: "Double", 
        rentPaid: false 
      }
    ],
    reviewsList: [
      { user: "Rahul K.", rating: 5, text: "Great place, very safe!", date: "June 2026" },
      { user: "Amit P.", rating: 4, text: "Good food, nice location.", date: "May 2026" }
    ]
  },
  {
    id: 2,
    name: "Lok Santosh PG",
    address: "GT Road, Ushagram, Asansol",
    description: "Budget-friendly stay perfect for students looking for proximity to college.",
    college: "BB College",
    rating: 4.0,
    reviews: 12,
    ownerName: "Suresh Das",
    ownerPhone: "9933001122",
    ownerEmail: "suresh@loksantosh.com",
    latitude: 23.6800,
    longitude: 86.9600,
    gender: "boys",
    distance: 3.4,
    status: "vacant",
    images: [
      "/pg-room-2.jpg",
      "/pg-room-1.jpg",
    ],
    amenities: ["WiFi", "Laundry", "Food"],
    sharingOptions: [
      { type: "Double", rent: 5000 },
      { type: "Triple", rent: 3500 },
    ],
    tenants: [
      { id: 201, name: "Imran H.", college: "AEC", phone: "8899776655", roomType: "Triple", rentPaid: true }
    ],
    reviewsList: [
      { user: "Imran H.", rating: 4, text: "Affordable and close to the market.", date: "June 2026" }
    ]
  }
];