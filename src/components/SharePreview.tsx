import { forwardRef } from "react";
import { Wallet } from "lucide-react";
import { money } from "@/lib/format";
import { totals } from "@/lib/plan";
import { BUCKETS, type Plan } from "@/lib/types";

/**
 * Self-contained, brandable snapshot of a plan. Uses inline colors from the
 * design tokens so it renders identically on screen and when exported to PNG.
 */
export const SharePreview = forwardRef<HTMLDivElement, { plan: Plan }>(function SharePreview({ plan }, ref) {
  const t = totals(plan);
  const base = Math.max(plan.salary, t.planned, 1);
  const top = [...plan.items].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return (
    <div ref={ref} className="w-full rounded-[1.5rem] bg-neutral-950 p-5 text-white"
      style={{ "--needs": "#ffffff", "--wants": "#9a9a9a", "--savings": "#4d4d4d" } as React.CSSProperties}>
      <div className="flex items-center gap-2 text-sm font-semibold opacity-90">
        <Wallet className="size-4" /> Gareeb Budget
      </div>
      <h3 className="mt-3 truncate text-2xl font-bold">{plan.name}</h3>
      <p className="mt-0.5 text-sm opacity-80">Monthly salary</p>
      <p className="font-display text-4xl font-bold tabular">{money(plan.salary, plan.currency)}</p>

      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/15">
        {BUCKETS.map((b) => (
          <div key={b.id} style={{ width: `${(t.byBucket[b.id] / base) * 100}%`, background: `var(--${b.id})` }} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[13px]">
        {BUCKETS.map((b) => (
          <div key={b.id}>
            <div className="flex items-center gap-1.5 opacity-90">
              <span className="size-2 rounded-full" style={{ background: `var(--${b.id})` }} />
              {b.label}
            </div>
            <div className="font-semibold tabular">{money(t.byBucket[b.id], plan.currency)}</div>
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-1.5 rounded-xl bg-white/10 p-3 text-sm">
        {top.map((i) => (
          <li key={i.id} className="flex justify-between gap-3">
            <span className="truncate">{i.name}</span>
            <span className="font-semibold tabular">{money(i.amount, plan.currency)}</span>
          </li>
        ))}
        {plan.items.length > top.length && (
          <li className="opacity-70">+ {plan.items.length - top.length} more</li>
        )}
      </ul>
      <p className="mt-3 text-xs opacity-70">
        {t.left >= 0 ? `${money(t.left, plan.currency)} unallocated` : `${money(-t.left, plan.currency)} over budget`}
      </p>
    </div>
  );
});
