import type { BucketId } from "./types";

/** One-tap starting points for the add sheet. */
export const PRESETS: { name: string; bucket: BucketId }[] = [
  { name: "Rent", bucket: "needs" },
  { name: "Groceries", bucket: "needs" },
  { name: "Electricity", bucket: "needs" },
  { name: "Transport", bucket: "needs" },
  { name: "EMI", bucket: "needs" },
  { name: "Eating out", bucket: "wants" },
  { name: "Netflix", bucket: "wants" },
  { name: "Shopping", bucket: "wants" },
  { name: "SIP", bucket: "savings" },
  { name: "Emergency fund", bucket: "savings" },
];
