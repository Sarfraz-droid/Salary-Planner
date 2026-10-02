import { useEffect, useState, useSyncExternalStore } from "react";
import { Cpu, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { aiWanted, chosenModel, diagnose, disableAi, enableAi, getAiStatus, MODELS, subscribeAi } from "@/lib/ai";
import type { Kind } from "@/lib/learned";
import { forgetAll, readMemory } from "@/lib/learned";
import { parseQuick } from "@/lib/parse";

/** Toggle between the manual form and the smart (text) entry. */
export function ModeSwitch({ mode, onChange }: { mode: "manual" | "smart"; onChange: (m: "manual" | "smart") => void }) {
  const opts = [["manual", "Manual", null], ["smart", "Smart", Sparkles]] as const;
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="group" aria-label="Entry mode">
      {opts.map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          aria-pressed={mode === id}
          onClick={() => onChange(id)}
          className={`flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/40 ${mode === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          {Icon && <Icon className="size-4" />}
          {label}
        </button>
      ))}
    </div>
  );
}

/** Status + opt-in for the on-device model. Lives in its own card, apart from the inputs. */
function AiCard({ kind }: { kind: Kind }) {
  const ai = useSyncExternalStore(subscribeAi, getAiStatus);
  const [pick, setPick] = useState<string>(chosenModel());
  const [learned, setLearned] = useState(() => readMemory().length);
  // Re-load on later visits if the user opted in (cached, so quick).
  useEffect(() => { if (aiWanted() && getAiStatus().state === "off") enableAi().catch(() => {}); }, []);

  const model = MODELS.find((m) => m.id === (ai.state === "off" || ai.state === "error" ? pick : ai.model)) ?? MODELS[0];
  const idle = ai.state === "off" || ai.state === "error";
  const [probe, setProbe] = useState("");
  const [result, setResult] = useState<{ rows: { label: string; score: number }[]; error?: string } | null>(null);
  async function runProbe() { if (probe.trim()) setResult(await diagnose(kind, probe)); }

  return (
    <div className="space-y-4 rounded-2xl bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted"><Cpu className="size-5" /></span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold">On-device AI</p>
          {ai.state === "off" && <p className="mt-0.5 text-muted-foreground">Works out what a name means, like “chole bhature” is food. Runs on your phone; nothing is uploaded.</p>}
          {ai.state === "loading" && <p className="mt-0.5 text-muted-foreground">Downloading {model.label.toLowerCase()} model… {ai.progress}%</p>}
          {ai.state === "ready" && <p className="mt-0.5 text-muted-foreground">Ready · {model.label} model. It also learns from what you save.</p>}
          {ai.state === "error" && <p className="mt-0.5 text-muted-foreground">Couldn't load (offline?). Keywords and what you've taught it still work.</p>}
        </div>
        {ai.state === "ready" && (
          <button type="button" onClick={disableAi} className="h-9 shrink-0 rounded-full bg-secondary px-4 text-sm font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">Turn off</button>
        )}
      </div>

      {ai.state === "loading" && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${ai.progress}%` }} /></div>
      )}

      {idle && (
        <>
          <div className="grid gap-2" role="radiogroup" aria-label="Model">
            {MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={pick === m.id}
                onClick={() => setPick(m.id)}
                className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-3 text-left text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 ${pick === m.id ? "border-primary" : "border-transparent bg-muted"}`}
              >
                <span><span className="block font-semibold">{m.label} <span className="font-normal text-muted-foreground">· {m.size}</span></span><span className="text-muted-foreground">{m.note}</span></span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => enableAi(pick).catch(() => {})} className="h-11 w-full rounded-full bg-primary font-semibold text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
            Download &amp; enable
          </button>
        </>
      )}

      {ai.state === "ready" && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-semibold">Test it</p>
          <div className="flex gap-2">
            <Input value={probe} onChange={(e) => setProbe(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runProbe(); } }} placeholder="chole bhature" aria-label="Test text" className="h-10 text-sm" />
            <button type="button" onClick={runProbe} className="h-10 shrink-0 rounded-full bg-secondary px-4 text-sm font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">Run</button>
          </div>
          {result?.error && <p className="text-xs text-destructive">Error: {result.error}</p>}
          {result && !result.error && (
            <ul className="space-y-1 text-xs">
              {result.rows.map((r, i) => (
                <li key={r.label} className="flex justify-between"><span className={i === 0 ? "font-semibold" : "text-muted-foreground"}>{r.label}</span><span className="tabular text-muted-foreground">{r.score.toFixed(2)}</span></li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="border-t pt-3 text-xs text-muted-foreground">
        Learned from you: <b className="text-foreground">{learned}</b> {learned === 1 ? "item" : "items"}.{" "}
        {learned > 0 && <button type="button" className="underline" onClick={() => { forgetAll(); setLearned(0); }}>Forget</button>}
      </p>
    </div>
  );
}

interface Props {
  kind: Kind;
  placeholder: string;
  examples: string[];
  /** Resolve a parsed line into form fields (icon, bucket/category…). */
  onFill: (r: { name: string; amount: number }) => void | Promise<void>;
}

/** The smart tab: one text box + examples + the AI card. Works with keywords alone. */
export function SmartAdd({ kind, placeholder, examples, onFill }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await onFill(parseQuick(text));
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Describe it</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Type it the way you'd say it. We'll fill in the rest.</p>
        </div>
        <Input
          aria-label="Smart add"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
          placeholder={placeholder}
          enterKeyHint="go"
          autoComplete="off"
        />
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Examples">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setText(ex)}
              className="h-9 shrink-0 rounded-full border bg-card px-3.5 text-sm text-muted-foreground outline-none transition-transform active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {ex}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || busy}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground outline-none transition-opacity disabled:opacity-30 focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Fill it in
        </button>
      </section>
      <AiCard kind={kind} />
    </div>
  );
}
