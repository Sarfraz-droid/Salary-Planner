import { useEffect, useState, useSyncExternalStore } from "react";
import { Cpu, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { aiWanted, disableAi, enableAi, getAiStatus, subscribeAi } from "@/lib/ai";
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
function AiCard() {
  const ai = useSyncExternalStore(subscribeAi, getAiStatus);
  // Re-load on later visits if the user opted in (cached, so quick).
  useEffect(() => { if (aiWanted() && getAiStatus().state === "off") enableAi().catch(() => {}); }, []);

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted"><Cpu className="size-5" /></span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">On-device AI</p>
        {ai.state === "off" && <p className="mt-0.5 text-muted-foreground">Optional. Understands names keywords miss, like “dentist” or “biryani”. Downloads ~25 MB once; runs on your phone.</p>}
        {ai.state === "loading" && <p className="mt-0.5 text-muted-foreground">Downloading… {ai.progress}%</p>}
        {ai.state === "ready" && <p className="mt-0.5 text-muted-foreground">Ready. Nothing leaves your device.</p>}
        {ai.state === "error" && <p className="mt-0.5 text-muted-foreground">Couldn't load (offline?). Keyword matching still works.</p>}
        {ai.state === "loading" && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${ai.progress}%` }} /></div>
        )}
      </div>
      {(ai.state === "off" || ai.state === "error") && (
        <button type="button" onClick={() => enableAi().catch(() => {})} className="h-9 shrink-0 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
          Enable
        </button>
      )}
      {ai.state === "ready" && (
        <button type="button" onClick={disableAi} className="h-9 shrink-0 rounded-full bg-secondary px-4 text-sm font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
          Turn off
        </button>
      )}
    </div>
  );
}

interface Props {
  placeholder: string;
  examples: string[];
  /** Resolve a parsed line into form fields (icon, bucket/category…). */
  onFill: (r: { name: string; amount: number }) => void | Promise<void>;
}

/** The smart tab: one text box + examples + the AI card. Works with keywords alone. */
export function SmartAdd({ placeholder, examples, onFill }: Props) {
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
      <AiCard />
    </div>
  );
}
