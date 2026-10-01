import { AnimatePresence, motion } from "motion/react";
import { BarChart3, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedMoney } from "@/components/AnimatedMoney";
import { Donut } from "@/components/Donut";
import { money } from "@/lib/format";
import { totals } from "@/lib/plan";
import { BUCKETS, type Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Summary({ plan, onEdit, onInsights }: { plan: Plan; onEdit?: () => void; onInsights: () => void }) {
  const t = totals(plan);
  const over = t.left < 0;
  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Monthly salary</p>
          <p className="font-display text-3xl font-bold tabular"><AnimatedMoney value={plan.salary} currency={plan.currency} /></p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onInsights}
            className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <BarChart3 className="size-3.5" /> Insights
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              aria-label="Edit salary"
              className="grid size-9 place-items-center rounded-full bg-secondary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <motion.button onClick={onInsights} whileTap={{ scale: 0.95 }} aria-label="Open insights" className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
        <Donut salary={plan.salary} byBucket={t.byBucket}>
          <div>
            <p className="text-xs text-muted-foreground">{over ? "Over by" : "Left"}</p>
            <p
              className={cn(
                "font-display text-lg font-bold tabular",
                over ? "text-destructive" : "text-primary",
              )}
            >
              <AnimatedMoney value={Math.abs(t.left)} currency={plan.currency} />
            </p>
          </div>
        </Donut>
        </motion.button>

        <ul className="flex-1 space-y-3">
          {BUCKETS.map((b) => {
            const pct = plan.salary ? Math.round((t.byBucket[b.id] / plan.salary) * 100) : 0;
            return (
              <li key={b.id}>
                <div className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 rounded-full" style={{ background: `var(--${b.id})` }} />
                  <span className="font-medium">{b.label}</span>
                  <span className="ml-auto tabular text-muted-foreground">{pct}%</span>
                </div>
                <p className="pl-[18px] text-sm font-semibold tabular">
                  <AnimatedMoney value={t.byBucket[b.id]} currency={plan.currency} />
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <AnimatePresence>
        {over && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            You've planned {money(-t.left, plan.currency)} more than your salary. Trim something!
          </motion.p>
        )}
      </AnimatePresence>
    </Card>
  );
}
