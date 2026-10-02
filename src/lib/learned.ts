/**
 * Personal memory: every expense/cost you save teaches the app what that name means to you.
 * Stored only in localStorage. Exact repeats resolve instantly (no model needed);
 * with the AI model loaded, similar names are matched by meaning too.
 */
export type Kind = "expense" | "cost";
export interface Memory { text: string; kind: Kind; icon: string; group: string } // group = bucket or trip category

const KEY = "gareeb-budget:learned";
const MAX = 400;

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ ]+/g, " ").replace(/\s+/g, " ").trim();

export function readMemory(): Memory[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function remember(kind: Kind, name: string, icon: string, group: string) {
  const text = norm(name);
  if (!text) return;
  const rest = readMemory().filter((m) => !(m.kind === kind && m.text === text));
  rest.push({ text, kind, icon, group });
  try { localStorage.setItem(KEY, JSON.stringify(rest.slice(-MAX))); } catch { /* storage full */ }
}

export function recall(kind: Kind, name: string): Memory | null {
  const text = norm(name);
  return text ? readMemory().find((m) => m.kind === kind && m.text === text) ?? null : null;
}

export function forgetAll() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
