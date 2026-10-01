import { suggestIcon } from "./icons";
import type { BucketId, Item, Plan, Trip, TripCat } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function emptyPlan(): Plan {
  return { v: 1, name: "My budget", currency: "INR", salary: 0, items: [] };
}

export function starterPlan(salary: number, currency = "INR"): Plan {
  const mk = (name: string, pct: number, bucket: BucketId): Item => ({
    id: uid(),
    name,
    amount: Math.round((salary * pct) / 100 / 100) * 100,
    bucket,
    paid: false,
    icon: suggestIcon(name, bucket),
  });
  return {
    v: 1,
    name: "My budget",
    currency,
    salary,
    items: [
      mk("Rent", 25, "needs"),
      mk("Groceries", 15, "needs"),
      mk("Bills & transport", 10, "needs"),
      mk("Eating out & fun", 15, "wants"),
      mk("Shopping", 15, "wants"),
      mk("Emergency fund", 10, "savings"),
      mk("SIP / Investments", 10, "savings"),
    ],
  };
}

/**
 * Auto-balance: keep the plan summing to the salary. Locked (fixed) and paid items
 * keep their amounts; the rest share what remains, in proportion to their current size.
 */
export function rebalance(plan: Plan): Plan {
  const flex = plan.items.filter((i) => !i.locked && !i.paid);
  if (!flex.length || plan.salary <= 0) return plan;

  const fixed = plan.items.reduce((n, i) => (flex.includes(i) ? n : n + i.amount), 0);
  const pool = Math.max(0, plan.salary - fixed);
  const weight = flex.reduce((n, i) => n + i.amount, 0);
  const step = plan.salary >= 10000 ? 10 : 1;

  const raw = flex.map((i) => (weight > 0 ? (pool * i.amount) / weight : pool / flex.length));
  const out = raw.map((r) => Math.floor(r / step) * step);
  let rem = pool - out.reduce((n, v) => n + v, 0);
  // Hand the rounding leftovers out, largest fractional part first.
  const order = raw.map((r, k) => k).sort((a, b) => raw[b] - out[b] - (raw[a] - out[a]));
  for (let k = 0; rem > 0; k = (k + 1) % order.length) {
    const give = Math.min(step, rem);
    out[order[k]] += give;
    rem -= give;
  }

  const next = new Map(flex.map((i, k) => [i.id, out[k]]));
  return { ...plan, items: plan.items.map((i) => (next.has(i.id) ? { ...i, amount: next.get(i.id)! } : i)) };
}

export function totals(plan: Plan) {
  const byBucket: Record<BucketId, number> = { needs: 0, wants: 0, savings: 0 };
  let paid = 0;
  for (const i of plan.items) {
    byBucket[i.bucket] += i.amount;
    if (i.paid) paid += i.amount;
  }
  const planned = byBucket.needs + byBucket.wants + byBucket.savings;
  return { byBucket, planned, paid, left: plan.salary - planned };
}

const TRIP_CATS: TripCat[] = ["stay", "food", "transport", "activities", "shopping", "other"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function sanitizeTrip(t: Trip): Trip {
  return {
    id: String(t.id ?? uid()),
    name: String(t.name ?? "").slice(0, 60),
    destination: String(t.destination ?? "").slice(0, 60),
    start: DATE.test(t.start) ? t.start : "",
    end: DATE.test(t.end) ? t.end : "",
    budget: Math.max(0, Number(t.budget) || 0),
    saved: Math.max(0, Number(t.saved) || 0),
    items: (Array.isArray(t.items) ? t.items : []).slice(0, 100).map((i) => ({
      id: String(i.id ?? uid()),
      name: String(i.name ?? "").slice(0, 60),
      amount: Math.max(0, Number(i.amount) || 0),
      category: TRIP_CATS.includes(i.category) ? i.category : "other",
    })),
  };
}

export function tripPlanned(t: Trip) {
  return t.items.reduce((n, i) => n + i.amount, 0);
}

/** Defensive parse so bad localStorage / share links can't crash the app. */
export function sanitize(raw: unknown): Plan | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<Plan>;
  if (r.v !== 1 || !Array.isArray(r.items)) return null;
  const buckets = ["needs", "wants", "savings"];
  return {
    v: 1,
    name: String(r.name ?? "My budget").slice(0, 60),
    currency: String(r.currency ?? "INR").slice(0, 3),
    salary: Math.max(0, Number(r.salary) || 0),
    items: r.items.slice(0, 200).map((i: Item) => ({
      id: String(i.id ?? uid()),
      name: String(i.name ?? "").slice(0, 60),
      amount: Math.max(0, Number(i.amount) || 0),
      bucket: buckets.includes(i.bucket) ? i.bucket : "needs",
      paid: !!i.paid,
      icon: typeof i.icon === "string" ? i.icon.slice(0, 20) : undefined,
      locked: !!i.locked,
    })),
    auto: !!r.auto,
    trips: Array.isArray(r.trips) ? r.trips.slice(0, 30).map(sanitizeTrip) : [],
  };
}
