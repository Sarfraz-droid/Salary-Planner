import {
  Baby, Bus, Car, Coffee, Dumbbell, Film, Gift, GraduationCap, HeartPulse, Home, Landmark,
  PiggyBank, Plane, Shield, ShoppingBag, ShoppingCart, Shirt, Smartphone, Tag, TrendingUp,
  Utensils, Wifi, Zap, type LucideIcon,
} from "lucide-react";
import type { BucketId } from "./types";

export const ICONS: Record<string, { icon: LucideIcon; label: string; keywords: string[] }> = {
  home: { icon: Home, label: "Rent / Home", keywords: ["rent", "home", "house", "maintenance", "mortgage"] },
  groceries: { icon: ShoppingCart, label: "Groceries", keywords: ["grocer", "vegetable", "kirana", "milk", "ration"] },
  food: { icon: Utensils, label: "Eating out", keywords: ["eat", "food", "restaurant", "swiggy", "zomato", "dining"] },
  coffee: { icon: Coffee, label: "Coffee / Snacks", keywords: ["coffee", "chai", "tea", "snack", "cafe"] },
  bills: { icon: Zap, label: "Utilities", keywords: ["bill", "electric", "light", "gas", "water", "utilit"] },
  internet: { icon: Wifi, label: "Internet", keywords: ["wifi", "internet", "broadband"] },
  phone: { icon: Smartphone, label: "Phone", keywords: ["phone", "mobile", "recharge", "sim"] },
  transport: { icon: Bus, label: "Transport", keywords: ["transport", "bus", "metro", "train", "commute", "auto", "cab", "uber", "ola"] },
  car: { icon: Car, label: "Vehicle", keywords: ["car", "bike", "petrol", "fuel", "vehicle", "scooter"] },
  health: { icon: HeartPulse, label: "Health", keywords: ["health", "medic", "doctor", "pharm", "hospital"] },
  insurance: { icon: Shield, label: "Insurance", keywords: ["insur", "lic", "premium"] },
  education: { icon: GraduationCap, label: "Education", keywords: ["school", "tuition", "fees", "course", "education", "college"] },
  kids: { icon: Baby, label: "Kids / Family", keywords: ["kid", "child", "baby", "family", "parents"] },
  fun: { icon: Film, label: "Entertainment", keywords: ["movie", "netflix", "fun", "ott", "game", "entertain", "spotify"] },
  shopping: { icon: ShoppingBag, label: "Shopping", keywords: ["shop", "amazon", "flipkart", "gadget"] },
  clothes: { icon: Shirt, label: "Clothes", keywords: ["cloth", "dress", "fashion", "shoe"] },
  fitness: { icon: Dumbbell, label: "Fitness", keywords: ["gym", "fitness", "yoga", "sport"] },
  travel: { icon: Plane, label: "Travel", keywords: ["travel", "trip", "holiday", "vacation", "flight"] },
  gift: { icon: Gift, label: "Gifts", keywords: ["gift", "donat", "charity", "zakat", "festival", "wedding"] },
  savings: { icon: PiggyBank, label: "Savings", keywords: ["saving", "emergency", "fund", "rd", "deposit"] },
  invest: { icon: TrendingUp, label: "Investments", keywords: ["sip", "invest", "mutual", "stock", "share", "gold", "ppf", "nps"] },
  debt: { icon: Landmark, label: "Loan / EMI", keywords: ["emi", "loan", "debt", "credit", "card"] },
  other: { icon: Tag, label: "Other", keywords: [] },
};

const BUCKET_DEFAULT: Record<BucketId, string> = { needs: "home", wants: "fun", savings: "savings" };

/** Keyword match only: null when nothing recognises the name. */
export function matchIcon(name: string): string | null {
  const n = name.toLowerCase();
  for (const [key, v] of Object.entries(ICONS)) {
    if (v.keywords.some((k) => n.includes(k))) return key;
  }
  return null;
}

export function suggestIcon(name: string, bucket: BucketId): string {
  return matchIcon(name) ?? BUCKET_DEFAULT[bucket];
}

/** Which bucket an icon usually belongs to (used by smart add). */
export const ICON_BUCKET: Record<string, BucketId> = {
  home: "needs", groceries: "needs", food: "wants", coffee: "wants", bills: "needs", internet: "needs",
  phone: "needs", transport: "needs", car: "needs", health: "needs", insurance: "needs", education: "needs",
  kids: "needs", fun: "wants", shopping: "wants", clothes: "wants", fitness: "wants", travel: "wants",
  gift: "wants", savings: "savings", invest: "savings", debt: "needs", other: "wants",
};

export function getIcon(key: string | undefined, name: string, bucket: BucketId) {
  return ICONS[key && ICONS[key] ? key : suggestIcon(name, bucket)].icon;
}
