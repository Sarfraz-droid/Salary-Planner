/**
 * Tiny on-device "AI": a quantised MiniLM sentence-embedding model (~23 MB) that runs in the
 * browser via transformers.js. We embed the expense name and pick the closest category by
 * cosine similarity. Everything stays on the phone; the model is downloaded once and cached.
 * Keyword matching always runs first and works with no model at all.
 */
import { ICONS, ICON_BUCKET, matchIcon, suggestIcon } from "./icons";
import { COST_ICONS, matchCost, suggestCost } from "./tripIcons";
import type { BucketId, TripCat } from "./types";

export type AiStatus = { state: "off" | "loading" | "ready" | "error"; progress: number };

const FLAG = "gareeb-budget:ai";
const MODEL = "Xenova/all-MiniLM-L6-v2";
const MIN_SCORE = 0.32;

type Embedder = (texts: string[], opts: object) => Promise<{ tolist(): number[][] }>;

let status: AiStatus = { state: "off", progress: 0 };
let embedder: Promise<Embedder> | null = null;
const listeners = new Set<() => void>();
const cache = new Map<string, number[]>();

const set = (s: AiStatus) => { status = s; listeners.forEach((l) => l()); };
export const getAiStatus = () => status;
export function subscribeAi(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }

export const aiWanted = () => { try { return localStorage.getItem(FLAG) === "1"; } catch { return false; } };

export function enableAi() {
  try { localStorage.setItem(FLAG, "1"); } catch { /* ignore */ }
  if (embedder) return embedder;
  set({ state: "loading", progress: 0 });
  embedder = import("@huggingface/transformers")
    .then(async ({ pipeline }) => {
      const pipe = await pipeline("feature-extraction", MODEL, {
        dtype: "q8",
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (p.status === "progress" && typeof p.progress === "number") set({ state: "loading", progress: Math.round(p.progress) });
        },
      });
      set({ state: "ready", progress: 100 });
      return pipe as unknown as Embedder;
    })
    .catch((e) => {
      embedder = null;
      set({ state: "error", progress: 0 });
      throw e;
    });
  return embedder;
}

export function disableAi() {
  try { localStorage.removeItem(FLAG); } catch { /* ignore */ }
  set({ state: "off", progress: 0 });
}

async function embed(texts: string[]): Promise<number[][]> {
  const e = await embedder!;
  const missing = texts.filter((t) => !cache.has(t));
  if (missing.length) {
    const out = (await e(missing, { pooling: "mean", normalize: true })).tolist();
    missing.forEach((t, i) => cache.set(t, out[i]));
  }
  return texts.map((t) => cache.get(t)!);
}

const dot = (a: number[], b: number[]) => a.reduce((n, v, i) => n + v * b[i], 0);

async function nearest(text: string, labels: { key: string; text: string }[]): Promise<string | null> {
  if (status.state !== "ready") return null;
  try {
    const [q, ...c] = await embed([text, ...labels.map((l) => l.text)]);
    let best = -1, bestKey: string | null = null;
    c.forEach((v, i) => { const s = dot(q, v); if (s > best) { best = s; bestKey = labels[i].key; } });
    return best >= MIN_SCORE ? bestKey : null;
  } catch {
    return null;
  }
}

const expenseLabels = Object.entries(ICONS).filter(([k]) => k !== "other").map(([key, v]) => ({ key, text: `${v.label}: ${v.keywords.join(", ")}` }));
const costLabels = Object.entries(COST_ICONS).filter(([k]) => k !== "other").map(([key, v]) => ({ key, text: `${v.label} while travelling: ${v.keywords.join(", ")}` }));

/** Pick icon + bucket for an expense name: keywords first, then the local model. */
export async function smartExpense(name: string, fallback: BucketId): Promise<{ icon: string; bucket: BucketId; by: "keywords" | "ai" | "default" }> {
  const hit = matchIcon(name);
  if (hit) return { icon: hit, bucket: ICON_BUCKET[hit] ?? fallback, by: "keywords" };
  const ai = name.trim() ? await nearest(name, expenseLabels) : null;
  if (ai) return { icon: ai, bucket: ICON_BUCKET[ai] ?? fallback, by: "ai" };
  return { icon: suggestIcon(name, fallback), bucket: fallback, by: "default" };
}

export async function smartCost(name: string, fallback: TripCat): Promise<{ icon: string; category: TripCat; by: "keywords" | "ai" | "default" }> {
  const hit = matchCost(name);
  if (hit) return { ...hit, by: "keywords" };
  const ai = name.trim() ? await nearest(name, costLabels) : null;
  if (ai) return { icon: ai, category: COST_ICONS[ai].category, by: "ai" };
  return { ...suggestCost(name, fallback), by: "default" };
}
