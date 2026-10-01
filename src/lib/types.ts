export type BucketId = "needs" | "wants" | "savings";

export interface Item {
  id: string;
  name: string;
  amount: number;
  bucket: BucketId;
  paid: boolean;
  icon?: string;
  /** Fixed amount: auto-balance never changes it. */
  locked?: boolean;
}

export type TripCat = "stay" | "food" | "transport" | "activities" | "shopping" | "other";

export interface TripItem {
  id: string;
  name: string;
  amount: number;
  category: TripCat;
  icon?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start: string; // YYYY-MM-DD or ""
  end: string; // YYYY-MM-DD or ""
  budget: number;
  saved: number;
  icon?: string;
  items: TripItem[];
}

export interface Plan {
  v: 1;
  name: string;
  currency: string;
  salary: number;
  items: Item[];
  trips?: Trip[];
  /** Auto-balance: unlocked items flex so the plan always uses the whole salary. */
  auto?: boolean;
}

export const BUCKETS: {
  id: BucketId;
  label: string;
  hint: string;
  target: number; // suggested share of salary (50/30/20)
  emoji: string;
}[] = [
  { id: "needs", label: "Needs", hint: "Rent, food, bills, EMI", target: 0.5, emoji: "🏠" },
  { id: "wants", label: "Wants", hint: "Outings, shopping, fun", target: 0.3, emoji: "🎉" },
  { id: "savings", label: "Savings", hint: "SIP, emergency fund, debt", target: 0.2, emoji: "🌱" },
];

export const CURRENCIES = [
  { code: "INR", label: "₹ Rupee", locale: "en-IN" },
  { code: "USD", label: "$ Dollar", locale: "en-US" },
  { code: "EUR", label: "€ Euro", locale: "de-DE" },
  { code: "GBP", label: "£ Pound", locale: "en-GB" },
  { code: "PKR", label: "₨ Pak Rupee", locale: "en-PK" },
  { code: "BDT", label: "৳ Taka", locale: "en-BD" },
];
