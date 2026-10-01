import { BedDouble, Plane, Tag, Ticket, Utensils, ShoppingBag, type LucideIcon } from "lucide-react";
import type { Trip, TripCat } from "./types";

export const TRIP_CATS: { id: TripCat; label: string; icon: LucideIcon }[] = [
  { id: "stay", label: "Stay", icon: BedDouble },
  { id: "food", label: "Food", icon: Utensils },
  { id: "transport", label: "Travel", icon: Plane },
  { id: "activities", label: "Things to do", icon: Ticket },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "other", label: "Other", icon: Tag },
];

const DAY = 86_400_000;
const parse = (d: string) => (d ? new Date(d + "T00:00:00").getTime() : NaN);

export function tripDays(t: Trip) {
  const a = parse(t.start), b = parse(t.end);
  return Number.isNaN(a) || Number.isNaN(b) || b < a ? 0 : Math.round((b - a) / DAY) + 1;
}

/** Days until the trip starts (negative once started), or null if no date set. */
export function daysUntil(t: Trip): number | null {
  const a = parse(t.start);
  if (Number.isNaN(a)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((a - today.getTime()) / DAY);
}

export function fmtRange(t: Trip) {
  if (!t.start) return "Dates not set";
  const f = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return t.end && t.end !== t.start ? `${f(t.start)} – ${f(t.end)}` : f(t.start);
}

export function countdown(t: Trip) {
  const d = daysUntil(t);
  if (d === null) return null;
  if (d > 1) return `in ${d} days`;
  if (d === 1) return "tomorrow";
  if (d === 0) return "today";
  const days = tripDays(t);
  return days && -d < days ? "on now" : "done";
}
