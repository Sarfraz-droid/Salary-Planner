/**
 * Keyword test shared by expense and trip-cost matching.
 * Short keywords (≤3 letters) must start a word ("ola" ≠ "chocolate"); longer ones match anywhere ("grocer" → "groceries").
 */
export function hasKeyword(text: string, kw: string): boolean {
  if (kw.includes(" ") || kw.length >= 4) return text.includes(kw);
  return text.split(/[^a-z0-9]+/).some((w) => w.startsWith(kw));
}
