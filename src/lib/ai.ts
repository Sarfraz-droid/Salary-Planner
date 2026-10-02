/**
 * On-device AI for naming things. A small sentence-embedding model runs in the browser
 * (transformers.js, WASM). Pipeline, most trusted first:
 *   1. what you've taught it (your saved items; lib/learned.ts)
 *   2. the model: similar to something you've saved, else closest meaning among the category descriptions
 *   3. keyword matching, only as a fallback when the model isn't loaded
 * Nothing about your budget leaves the device; model files are downloaded once and cached.
 */
import { ICONS, ICON_BUCKET, matchIcon, suggestIcon } from "./icons";
import { norm, readMemory, recall, type Kind } from "./learned";
import { COST_PROTOS, EXPENSE_PROTOS } from "./protos";
import { COST_ICONS, matchCost, suggestCost } from "./tripIcons";
import type { BucketId, TripCat } from "./types";

export const MODELS = [
  { id: "Xenova/all-MiniLM-L6-v2", label: "Standard", size: "~25 MB", note: "English. Fast." },
  { id: "Xenova/paraphrase-multilingual-MiniLM-L12-v2", label: "Better", size: "~120 MB", note: "Multilingual. Knows more dishes, brands and Hinglish." },
] as const;

export type AiStatus = { state: "off" | "loading" | "ready" | "error"; progress: number; model: string };

const FLAG = "gareeb-budget:ai";
const MODEL_KEY = "gareeb-budget:ai-model";
const LEARNED_SIM = 0.8; // how close a saved item must be to reuse its category
const FLOOR = 0.12; // below this the text is basically noise

type Embedder = (texts: string[], opts: object) => Promise<{ tolist(): number[][] }>;

const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  del: (k: string) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

export const chosenModel = () => {
  const saved = store.get(MODEL_KEY);
  return MODELS.some((m) => m.id === saved) ? saved! : MODELS[0].id;
};

let status: AiStatus = { state: "off", progress: 0, model: chosenModel() };
let embedder: Promise<Embedder> | null = null;
const listeners = new Set<() => void>();
const cache = new Map<string, number[]>(); // `${model}|${text}` → vector

const set = (s: Partial<AiStatus>) => { status = { ...status, ...s }; listeners.forEach((l) => l()); };
export const getAiStatus = () => status;
export function subscribeAi(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export const aiWanted = () => store.get(FLAG) === "1";

export function enableAi(model: string = chosenModel()) {
  store.set(FLAG, "1");
  store.set(MODEL_KEY, model);
  if (embedder && status.model === model) return embedder;
  embedder = null;
  set({ state: "loading", progress: 0, model });
  const mine = (embedder = import("@huggingface/transformers")
    .then(async ({ pipeline }) => {
      const pipe = await pipeline("feature-extraction", model, {
        dtype: "q8",
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (embedder === mine && p.status === "progress" && typeof p.progress === "number") set({ state: "loading", progress: Math.round(p.progress) });
        },
      });
      if (embedder === mine) set({ state: "ready", progress: 100 });
      return pipe as unknown as Embedder;
    })
    .catch((e) => {
      if (embedder === mine) { embedder = null; set({ state: "error", progress: 0 }); }
      throw e;
    }));
  return mine;
}

export function disableAi() {
  store.del(FLAG);
  embedder = null;
  set({ state: "off", progress: 0 });
}

async function embed(texts: string[]): Promise<number[][]> {
  const e = await embedder!;
  const model = status.model;
  const missing = [...new Set(texts)].filter((t) => !cache.has(`${model}|${t}`));
  if (missing.length) {
    const out = (await e(missing, { pooling: "mean", normalize: true })).tolist();
    missing.forEach((t, i) => cache.set(`${model}|${t}`, out[i]));
  }
  return texts.map((t) => cache.get(`${model}|${t}`)!);
}

const dot = (a: number[], b: number[]) => a.reduce((n, v, i) => n + v * b[i], 0);

type Source = "learned" | "ai" | "keywords" | "default";

/** For the "Test it" box: what the model thinks, with scores, and the real error if it fails. */
export async function diagnose(kind: Kind, text: string): Promise<{ rows: { label: string; score: number }[]; error?: string }> {
  if (status.state !== "ready") return { rows: [], error: "Model isn't loaded yet." };
  try {
    const protos = kind === "expense" ? EXPENSE_PROTOS : COST_PROTOS;
    const flat = Object.keys(protos).flatMap((k) => protos[k].map((t) => ({ k, t })));
    const [q, ...vecs] = await embed([norm(text), ...flat.map((f) => f.t)]);
    const score: Record<string, number> = {};
    vecs.forEach((v, i) => { const s = dot(q, v); const k = flat[i].k; if (s > (score[k] ?? -1)) score[k] = s; });
    const defs = kind === "expense" ? ICONS : COST_ICONS;
    const rows = Object.entries(score).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => ({ label: defs[k]?.label ?? k, score: v }));
    return { rows };
  } catch (e) {
    return { rows: [], error: e instanceof Error ? e.message : String(e) };
  }
}

/** Meaning-based lookup: closest saved item, else closest category description. */
async function infer(kind: Kind, name: string, protos: Record<string, string[]>): Promise<{ icon: string; group?: string; by: "learned" | "ai" } | null> {
  if (status.state === "loading" && embedder) await embedder.catch(() => {}); // model still warming up: wait for it
  if (status.state !== "ready" || !name.trim()) return null;
  try {
    const mem = readMemory().filter((m) => m.kind === kind);
    const keys = Object.keys(protos);
    const flat = keys.flatMap((k) => protos[k].map((text) => ({ k, text })));
    const [q, ...vecs] = await embed([norm(name), ...mem.map((m) => m.text), ...flat.map((f) => f.text)]);
    const memVecs = vecs.slice(0, mem.length);
    const protoVecs = vecs.slice(mem.length);

    let bestMem = -1, bestM: (typeof mem)[number] | null = null;
    memVecs.forEach((v, i) => { const s = dot(q, v); if (s > bestMem) { bestMem = s; bestM = mem[i]; } });
    if (bestM && bestMem >= LEARNED_SIM) return { icon: (bestM as { icon: string }).icon, group: (bestM as { group: string }).group, by: "learned" };

    const score: Record<string, number> = {};
    protoVecs.forEach((v, i) => { const s = dot(q, v); const k = flat[i].k; if (s > (score[k] ?? -1)) score[k] = s; });
    const [best, top] = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    return top >= FLOOR ? { icon: best, by: "ai" } : null;
  } catch {
    return null;
  }
}

export async function smartExpense(name: string, fallback: BucketId): Promise<{ icon: string; bucket: BucketId; by: Source }> {
  const mem = recall("expense", name);
  if (mem) return { icon: mem.icon, bucket: mem.group as BucketId, by: "learned" };
  const ai = await infer("expense", name, EXPENSE_PROTOS);
  if (ai) return { icon: ai.icon, bucket: (ai.group as BucketId) ?? ICON_BUCKET[ai.icon] ?? fallback, by: ai.by };
  const hit = matchIcon(name);
  if (hit) return { icon: hit, bucket: ICON_BUCKET[hit] ?? fallback, by: "keywords" };
  return { icon: suggestIcon(name, fallback), bucket: fallback, by: "default" };
}

export async function smartCost(name: string, fallback: TripCat): Promise<{ icon: string; category: TripCat; by: Source }> {
  const mem = recall("cost", name);
  if (mem) return { icon: mem.icon, category: mem.group as TripCat, by: "learned" };
  const ai = await infer("cost", name, COST_PROTOS);
  if (ai) return { icon: ai.icon, category: (ai.group as TripCat) ?? COST_ICONS[ai.icon].category, by: ai.by };
  const hit = matchCost(name);
  if (hit) return { ...hit, by: "keywords" };
  return { ...suggestCost(name, fallback), by: "default" };
}

export const SOURCE_LABEL: Record<Source, string> = { learned: "learned from you", ai: "AI guess", keywords: "keyword match", default: "not sure" };
