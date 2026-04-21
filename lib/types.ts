export type UserRole = "guest" | "host";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Listing {
  id: string;
  hostId: string;
  hostName?: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  propertyType: string;
  amenities: string[];
  images: string[];
  isVerified?: boolean;
  createdAt: Date;
}

export interface Booking {
  id: string;
  listingId: string;
  listingTitle?: string;
  guestId: string;
  guestName?: string;
  hostId: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  nights: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
}

export const GHANA_LOCATIONS = [
  "Accra",
  "Kumasi",
  "East Legon",
  "Tema",
  "Aburi",
];

export const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Studio",
  "Villa",
  "Guesthouse",
  "Airbnb",
];

export const AMENITIES_LIST = [
  "WiFi",
  "Air Conditioning",
  "Swimming Pool",
  "Parking",
  "Kitchen",
  "Washer",
  "TV",
  "Generator",
  "Security",
  "Garden",
  "Balcony",
  "Hot Water",
];

export const GHS_TO_USD = 0.063;
