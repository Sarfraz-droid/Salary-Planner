const UNITS: Record<string, number> = { k: 1e3, thousand: 1e3, l: 1e5, lac: 1e5, lakh: 1e5, lakhs: 1e5, m: 1e6, cr: 1e7, crore: 1e7 };

/**
 * Pull an amount and a name out of free text.
 * "swiggy 450 dinner" → { name: "Swiggy dinner", amount: 450 }, "sip ₹5k" → 5000, "rent 1.2 lakh" → 120000
 */
export function parseQuick(input: string): { name: string; amount: number } {
  const text = input.trim();
  const re = /(?:₹|rs\.?|inr|\$|€|£)?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|lakhs?|lacs?|l|cr|crore|m)?\b/gi;
  let last: RegExpExecArray | null = null;
  for (let m = re.exec(text); m; m = re.exec(text)) last = m;
  if (!last) return { name: text, amount: 0 };
  const unit = last[2] ? UNITS[last[2].toLowerCase()] ?? 1 : 1;
  const amount = Math.round(parseFloat(last[1].replace(/,/g, "")) * unit);
  const rest = (text.slice(0, last.index) + " " + text.slice(last.index + last[0].length))
    .replace(/\b(for|on|of|paid|spent|bought|rs\.?|inr)\b/gi, " ")
    .replace(/[₹$€£]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const name = rest ? rest[0].toUpperCase() + rest.slice(1) : "";
  return { name, amount };
}
