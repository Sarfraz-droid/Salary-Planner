import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Donut } from "@/components/Donut";
import { money } from "@/lib/format";
import { totals } from "@/lib/plan";
import { BUCKETS, type Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Summary({ plan, onEdit }: { plan: Plan; onEdit?: () => void }) {
  const t = totals(plan);
  const over = t.left < 0;
  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Monthly salary</p>
          <p className="font-display text-3xl font-bold tabular">{money(plan.salary, plan.currency)}</p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3.5 text-sm font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <Pencil className="size-3.5" /> Edit
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Donut salary={plan.salary} byBucket={t.byBucket}>
          <div>
            <p className="text-xs text-muted-foreground">{over ? "Over by" : "Left"}</p>
            <p
              className={cn(
                "font-display text-xl font-bold tabular",
                over ? "text-destructive" : "text-primary",
              )}
            >
              {money(Math.abs(t.left), plan.currency, true)}
            </p>
          </div>
        </Donut>

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
                  {money(t.byBucket[b.id], plan.currency)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {over && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          You've planned {money(-t.left, plan.currency)} more than your salary. Trim something!
        </p>
      )}
    </Card>
  );
}
