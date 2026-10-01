import { useEffect, useState, useSyncExternalStore } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { aiWanted, disableAi, enableAi, getAiStatus, subscribeAi } from "@/lib/ai";
import { parseQuick } from "@/lib/parse";

interface Props {
  placeholder: string;
  /** Resolve a parsed line into form fields (icon, bucket/category…). */
  onFill: (r: { name: string; amount: number }) => void | Promise<void>;
}

/** One-line "type it like you'd say it" box. Works with keywords alone; the optional local model fills the gaps. */
export function SmartAdd({ placeholder, onFill }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const ai = useSyncExternalStore(subscribeAi, getAiStatus);

  // Re-load the model on later visits if the user opted in (cached, so quick).
  useEffect(() => { if (aiWanted() && getAiStatus().state === "off") enableAi().catch(() => {}); }, []);

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
    <div className="space-y-1.5">
      <div className="relative">
        <Sparkles className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Smart add"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
          placeholder={placeholder}
          enterKeyHint="go"
          autoComplete="off"
          className="pl-10 pr-16"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || busy}
          className="absolute right-1.5 top-1/2 flex h-9 -translate-y-1/2 items-center rounded-full bg-primary px-3.5 text-sm font-semibold text-primary-foreground outline-none transition-opacity disabled:opacity-30 focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Fill"}
        </button>
      </div>
      <p className="px-1 text-xs text-muted-foreground">
        {ai.state === "ready" && <>On-device AI ready · <button type="button" className="underline" onClick={disableAi}>turn off</button></>}
        {ai.state === "loading" && <>Downloading on-device AI… {ai.progress}%</>}
        {ai.state === "error" && <>Couldn't load AI (offline?). Keyword matching still works.</>}
        {ai.state === "off" && (
          <>Try “uber 250” or “sip 5k”. <button type="button" className="font-semibold text-foreground underline" onClick={() => enableAi().catch(() => {})}>Add on-device AI (~25 MB, once)</button></>
        )}
      </p>
    </div>
  );
}
