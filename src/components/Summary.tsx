import { motion } from "motion/react";
import { ChevronRight, Pencil } from "lucide-react";
import { AnimatedMoney } from "@/components/AnimatedMoney";
import { money } from "@/lib/format";
import { totals } from "@/lib/plan";
import { BUCKETS, type Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

/** One calm hero: how much is left, and a single bar showing where the rest goes. */
export function Summary({ plan, onEdit, onInsights }: { plan: Plan; onEdit?: () => void; onInsights: () => void }) {
  const t = totals(plan);
  const over = t.left < 0;
  const base = Math.max(plan.salary, t.planned, 1);

  return (
    <section className="rounded-[1.75rem] bg-card p-6 shadow-[0_8px_30px_-18px_rgb(0_0_0/0.25)]">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          Salary {money(plan.salary, plan.currency)}
          {onEdit && (
            <button onClick={onEdit} aria-label="Edit salary" className="grid size-7 place-items-center rounded-full outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40">
              <Pencil className="size-3.5" />
            </button>
          )}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{over ? "Over budget by" : "Left to plan"}</p>
      <p className={cn("font-display text-5xl font-bold tabular", over ? "text-destructive" : "text-foreground")}>
        <AnimatedMoney value={Math.abs(t.left)} currency={plan.currency} />
      </p>

      <div className="mt-6 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted">
        {BUCKETS.map((b) => (
          <motion.div
            key={b.id}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ background: `var(--${b.id})` }}
            initial={{ width: 0 }}
            animate={{ width: `${(t.byBucket[b.id] / base) * 100}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
          />
        ))}
      </div>

      <button
        onClick={onInsights}
        className="mt-5 flex w-full items-center justify-between rounded-full text-sm font-semibold text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        See insights <ChevronRight className="size-4" />
      </button>
    </section>
  );
}
