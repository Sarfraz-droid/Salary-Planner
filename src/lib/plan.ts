import type { BucketId, Item, Plan } from "./types";

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
    })),
  };
}
