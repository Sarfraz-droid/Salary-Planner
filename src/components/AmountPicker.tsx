import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Delete } from "lucide-react";
import { currencySymbol } from "@/lib/format";
import { CURRENCIES } from "@/lib/types";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"] as const;
const MAX_DIGITS = 9;

const buzz = () => { try { navigator.vibrate?.(6); } catch { /* unsupported */ } };

interface Props {
  value: string; // digits only
  onChange: (v: string) => void;
  currency: string;
  /** Quick-add chip amounts. */
  steps?: number[];
  className?: string;
}

/** Big amount readout + quick-add chips + on-screen keypad. No native keyboard needed. */
export function AmountPicker({ value, onChange, currency, steps = [100, 500, 1000, 5000], className }: Props) {
  const clearTimer = useRef<number | undefined>(undefined);
  const valueRef = useRef(value);
  valueRef.current = value;

  const locale = CURRENCIES.find((c) => c.code === currency)?.locale ?? "en-IN";
  const n = Number(value) || 0;
  const shown = value ? new Intl.NumberFormat(locale).format(n) : "0";

  const press = (k: string) => {
    buzz();
    const v = valueRef.current;
    if (k === "back") return onChange(v.slice(0, -1));
    if (!v && (k === "0" || k === "00")) return;
    if ((v + k).length > MAX_DIGITS) return;
    onChange(v + k);
  };
  const add = (amt: number) => {
    buzz();
    onChange(String(Math.min(n + amt, 10 ** MAX_DIGITS - 1)));
  };

  // Hardware keyboard support (desktop), unless a text field has focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select")) return;
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("back");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className}>
      <div className="flex items-baseline justify-center gap-1.5 py-2" aria-live="polite" aria-label={`Amount ${shown}`}>
        <span className="font-display text-2xl font-semibold text-muted-foreground">{currencySymbol(currency)}</span>
        <motion.span
          key={value}
          initial={{ y: 6, opacity: 0.4 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.12 }}
          className={cn("font-display text-5xl font-bold tabular", !value && "text-muted-foreground/40")}
        >
          {shown}
        </motion.span>
      </div>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-3 pt-1">
        {steps.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => add(s)}
            className="h-9 shrink-0 rounded-full bg-secondary px-4 text-sm font-semibold tabular outline-none transition-transform active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            +{new Intl.NumberFormat(locale, { notation: "compact" }).format(s).replace("T", "K")}
          </button>
        ))}
        {n > 0 && (
          <button
            type="button"
            onClick={() => { buzz(); onChange(""); }}
            className="h-9 shrink-0 rounded-full px-4 text-sm font-semibold text-muted-foreground outline-none active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Keypad">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            aria-label={k === "back" ? "Backspace" : k}
            onClick={() => press(k)}
            onPointerDown={k === "back" ? () => { clearTimer.current = window.setTimeout(() => { buzz(); onChange(""); }, 600); } : undefined}
            onPointerUp={() => window.clearTimeout(clearTimer.current)}
            onPointerLeave={() => window.clearTimeout(clearTimer.current)}
            className="grid h-12 place-items-center rounded-2xl bg-card font-display text-xl font-semibold outline-none transition-transform select-none active:scale-95 active:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {k === "back" ? <Delete className="size-5" /> : k}
          </button>
        ))}
      </div>
    </div>
  );
}
