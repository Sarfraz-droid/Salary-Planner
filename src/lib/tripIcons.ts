import {
  BedDouble, Building2, Bus, Camera, Car, Coffee, Compass, Fuel, Heart, IdCard, Landmark, MapPin,
  Mountain, PartyPopper, Plane, ShoppingBag, Shield, Ship, Smartphone, Snowflake, Tag, Tent, Ticket,
  TrainFront, TreePalm, Utensils, Waves, type LucideIcon,
} from "lucide-react";
import { recall } from "./learned";
import { hasKeyword } from "./match";
import type { TripCat } from "./types";

interface Def { icon: LucideIcon; label: string; keywords: string[] }

/** Icons for a whole trip, picked from its name / destination. */
export const TRIP_ICONS: Record<string, Def> = {
  beach: { icon: TreePalm, label: "Beach", keywords: ["beach", "goa", "island", "andaman", "maldives", "bali", "pondicherry", "gokarna", "kovalam", "coast"] },
  mountain: { icon: Mountain, label: "Mountains", keywords: ["mountain", "hill", "manali", "shimla", "ladakh", "leh", "himalaya", "darjeeling", "ooty", "munnar", "trek", "kashmir", "spiti", "nainital", "mussoorie"] },
  snow: { icon: Snowflake, label: "Snow", keywords: ["snow", "ski", "winter", "gulmarg"] },
  city: { icon: Building2, label: "City", keywords: ["city", "delhi", "mumbai", "bangalore", "bengaluru", "kolkata", "chennai", "hyderabad", "dubai", "singapore", "london", "paris", "new york", "tokyo", "bangkok"] },
  camp: { icon: Tent, label: "Camping", keywords: ["camp", "forest", "jungle", "safari", "nature", "corbett", "rishikesh"] },
  road: { icon: Car, label: "Road trip", keywords: ["road", "drive", "ride", "bike", "highway"] },
  cruise: { icon: Ship, label: "Cruise", keywords: ["cruise", "ship", "boat", "ferry", "backwater", "kerala", "alleppey"] },
  heritage: { icon: Landmark, label: "Heritage", keywords: ["temple", "heritage", "fort", "palace", "jaipur", "agra", "varanasi", "udaipur", "pilgrim", "umrah", "hajj", "yatra", "tirupati", "mecca"] },
  party: { icon: PartyPopper, label: "Celebration", keywords: ["wedding", "party", "birthday", "bachelor", "reunion", "anniversary", "festival"] },
  honeymoon: { icon: Heart, label: "Romantic", keywords: ["honeymoon", "romantic", "couple", "date"] },
  flight: { icon: Plane, label: "Flight", keywords: ["abroad", "international", "flight", "europe", "usa", "uk"] },
  adventure: { icon: Compass, label: "Adventure", keywords: ["adventure", "explore", "backpack", "solo"] },
  place: { icon: MapPin, label: "Place", keywords: [] },
};

export function suggestTripIcon(name: string, destination: string) {
  const text = `${name} ${destination}`.toLowerCase();
  for (const [key, d] of Object.entries(TRIP_ICONS)) if (d.keywords.some((k) => text.includes(k))) return key;
  return "flight";
}
export const getTripIcon = (key: string | undefined, name: string, destination: string) =>
  TRIP_ICONS[key && TRIP_ICONS[key] ? key : suggestTripIcon(name, destination)].icon;

/** Icons for a single cost line; each also implies a category. */
export const COST_ICONS: Record<string, Def & { category: TripCat }> = {
  hotel: { icon: BedDouble, label: "Hotel", category: "stay", keywords: ["hotel", "stay", "hostel", "resort", "airbnb", "room", "homestay", "lodge", "villa"] },
  flight: { icon: Plane, label: "Flight", category: "transport", keywords: ["flight", "air", "plane", "airfare"] },
  train: { icon: TrainFront, label: "Train", category: "transport", keywords: ["train", "rail", "irctc", "metro"] },
  bus: { icon: Bus, label: "Bus", category: "transport", keywords: ["bus", "volvo"] },
  cab: { icon: Car, label: "Cab / Car", category: "transport", keywords: ["cab", "taxi", "uber", "ola", "car", "rental", "self-drive", "auto"] },
  fuel: { icon: Fuel, label: "Fuel / Toll", category: "transport", keywords: ["fuel", "petrol", "diesel", "toll", "parking"] },
  ferry: { icon: Ship, label: "Ferry", category: "transport", keywords: ["ferry", "boat", "cruise"] },
  food: { icon: Utensils, label: "Meals", category: "food", keywords: ["food", "restaurant", "eat", "buffet", "swiggy", "zomato", "chole", "bhature", "bhatura", "biryani", "dosa", "idli", "thali", "paratha", "paneer", "roti", "naan", "samosa", "pizza", "burger", "momo", "maggi", "pasta", "sandwich", "dhaba", "tiffin", "lassi", "kebab", "tikka", "curry", "noodle", "fries", "pav", "vada", "poha", "upma", "chaat", "golgappa", "pani puri", "dessert", "juice", "shake", "breakfast", "lunch", "dinner", "meal", "canteen", "mess", "snack", "dal", "rajma", "khichdi", "chinese", "fast food", "takeaway", "kfc", "dominos", "mcdonald", "subway", "starbucks"] },
  cafe: { icon: Coffee, label: "Cafe / Drinks", category: "food", keywords: ["cafe", "coffee", "drinks", "chai", "tea", "bar", "beer", "bakery", "sweets", "mithai", "ice cream"] },
  ticket: { icon: Ticket, label: "Entry tickets", category: "activities", keywords: ["ticket", "entry", "museum", "park", "show", "pass"] },
  activity: { icon: Waves, label: "Activity", category: "activities", keywords: ["scuba", "dive", "rafting", "paraglid", "trek", "activity", "tour", "safari", "surf", "sport"] },
  photo: { icon: Camera, label: "Sightseeing", category: "activities", keywords: ["photo", "sightsee", "guide", "camera"] },
  hill: { icon: Mountain, label: "Trek / Hike", category: "activities", keywords: ["hike", "camp", "trail"] },
  shopping: { icon: ShoppingBag, label: "Shopping", category: "shopping", keywords: ["shop", "souvenir", "gift", "market", "buy"] },
  visa: { icon: IdCard, label: "Visa / Docs", category: "other", keywords: ["visa", "passport", "permit", "doc"] },
  insurance: { icon: Shield, label: "Insurance", category: "other", keywords: ["insur", "safety"] },
  sim: { icon: Smartphone, label: "SIM / Data", category: "other", keywords: ["sim", "roaming", "data", "esim", "wifi"] },
  city: { icon: Building2, label: "City pass", category: "activities", keywords: ["citypass", "city pass"] },
  other: { icon: Tag, label: "Other", category: "other", keywords: [] },
};

const CAT_ICON: Record<TripCat, string> = { stay: "hotel", food: "food", transport: "cab", activities: "ticket", shopping: "shopping", other: "other" };

export function matchCost(name: string): { icon: string; category: TripCat } | null {
  const learned = recall("cost", name);
  if (learned) return { icon: learned.icon, category: learned.group as TripCat };
  const n = name.toLowerCase();
  for (const [key, d] of Object.entries(COST_ICONS)) if (d.keywords.some((k) => hasKeyword(n, k))) return { icon: key, category: d.category };
  return null;
}
export function suggestCost(name: string, fallback: TripCat): { icon: string; category: TripCat } {
  return matchCost(name) ?? { icon: CAT_ICON[fallback], category: fallback };
}
export const getCostIcon = (key: string | undefined, name: string, category: TripCat) =>
  COST_ICONS[key && COST_ICONS[key] ? key : suggestCost(name, category).icon].icon;

export const COST_PRESETS = ["Hotel", "Flights", "Train", "Cab", "Meals", "Entry tickets", "Shopping", "Visa"];
