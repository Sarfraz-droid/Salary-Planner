import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { CheckCircle2, PiggyBank, Sun, Wallet } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedMoney } from "@/components/AnimatedMoney";
import { money } from "@/lib/format";
import { getIcon } from "@/lib/icons";
import { totals } from "@/lib/plan";
import { BUCKETS, type Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

const VIEWS = ["split", "expenses", "progress"] as const;
type View = (typeof VIEWS)[number];
const SPRING = { type: "spring", stiffness: 140, damping: 22 } as const;

function Tile({ icon: Icon, label, children, i }: { icon: typeof Sun; label: string; children: React.ReactNode; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * i, ...SPRING }}
      className="rounded-xl bg-card p-3"
    >
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-[11px] leading-tight text-muted-foreground">{label}</p>
      <p className="font-display text-base font-bold tabular">{children}</p>
    </motion.div>
  );
}

function Split({ plan }: { plan: Plan }) {
  const t = totals(plan);
  const salary = Math.max(plan.salary, 1);
  const saveRate = Math.round((t.byBucket.savings / salary) * 100);
  const perDay = Math.max(0, Math.round((t.byBucket.needs + t.byBucket.wants) / 30));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <Tile i={0} icon={PiggyBank} label="Savings rate">{saveRate}%</Tile>
        <Tile i={1} icon={Sun} label="Spend / day"><AnimatedMoney value={perDay} currency={plan.currency} /></Tile>
        <Tile i={2} icon={Wallet} label={t.left >= 0 ? "Unallocated" : "Over by"}>
          <AnimatedMoney value={Math.abs(t.left)} currency={plan.currency} />
        </Tile>
      </div>

      {BUCKETS.map((b, i) => {
        const actual = t.byBucket[b.id] / salary;
        const diff = actual - b.target;
        const bad = b.id === "savings" ? diff < -0.02 : diff > 0.02;
        const gap = Math.round(Math.abs(diff) * salary);
        const msg = bad
          ? b.id === "savings" ? `Save ${money(gap, plan.currency)} more to hit ${b.target * 100}%` : `${money(gap, plan.currency)} over the ${b.target * 100}% guide`
          : "On track";
        return (
          <motion.div key={b.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.08, ...SPRING }}>
            <div className="flex items-baseline justify-between">
              <span className="flex items-center gap-2 font-semibold"><span className="size-2.5 rounded-full" style={{ background: `var(--${b.id})` }} />{b.label}</span>
              <span className="tabular text-sm text-muted-foreground">
                <b className="text-foreground">{Math.round(actual * 100)}%</b> of {b.target * 100}% guide
              </span>
            </div>
            <div className="relative mt-2 h-4 rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `var(--${b.id})` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(actual, 1) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.1, ...SPRING }}
              />
              <div className="absolute -top-1 h-6 w-0.5 rounded bg-foreground/60" style={{ left: `${b.target * 100}%` }} title="Guide" />
            </div>
            <p className={cn("mt-1.5 text-xs font-medium", bad ? "text-destructive" : "text-primary")}>{msg}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function Expenses({ plan }: { plan: Plan }) {
  const sorted = [...plan.items].sort((a, b) => b.amount - a.amount).slice(0, 8);
  const max = Math.max(...sorted.map((i) => i.amount), 1);
  if (!sorted.length) return <p className="py-10 text-center text-sm text-muted-foreground">Add expenses to see where money goes.</p>;
  return (
    <ul className="space-y-3.5">
      {sorted.map((item, i) => {
        const Icon = getIcon(item.icon, item.name, item.bucket);
        return (
          <motion.li key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ...SPRING }}>
            <div className="flex items-center gap-2 text-sm">
              <Icon className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
              <span className="tabular font-semibold">{money(item.amount, plan.currency)}</span>
              <span className="w-10 text-right text-xs tabular text-muted-foreground">
                {plan.salary ? Math.round((item.amount / plan.salary) * 100) : 0}%
              </span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `var(--${item.bucket})` }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.amount / max) * 100}%` }}
                transition={{ delay: 0.1 + i * 0.06, ...SPRING }}
              />
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

function Progress({ plan }: { plan: Plan }) {
  const t = totals(plan);
  const paidCount = plan.items.filter((i) => i.paid).length;
  const frac = t.planned ? t.paid / t.planned : 0;
  const pending = plan.items.filter((i) => !i.paid).sort((a, b) => b.amount - a.amount).slice(0, 5);
  const r = 48;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="12" />
            <motion.circle
              cx="60" cy="60" r={r} fill="none" stroke="var(--primary)" strokeWidth="12" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: frac }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="font-display text-2xl font-bold tabular">{Math.round(frac * 100)}%</p>
              <p className="text-xs text-muted-foreground">paid</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Paid so far</p>
            <p className="font-display text-lg font-bold tabular text-primary"><AnimatedMoney value={t.paid} currency={plan.currency} /></p>
          </div>
          <div>
            <p className="text-muted-foreground">Still to pay</p>
            <p className="font-display text-lg font-bold tabular"><AnimatedMoney value={t.planned - t.paid} currency={plan.currency} /></p>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{paidCount} of {plan.items.length} expenses paid this month.</p>
      {pending.length > 0 ? (
        <ul className="space-y-2">
          {pending.map((i, k) => (
            <motion.li key={i.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + k * 0.05, ...SPRING }}
              className="flex justify-between rounded-xl bg-card px-3 py-2.5 text-sm">
              <span className="truncate">{i.name}</span>
              <span className="font-semibold tabular">{money(i.amount, plan.currency)}</span>
            </motion.li>
          ))}
        </ul>
      ) : plan.items.length > 0 ? (
        <p className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm font-medium text-primary"><CheckCircle2 className="size-4" /> Everything is paid. Nice!</p>
      ) : null}
    </div>
  );
}

export function Analytics({ open, onOpenChange, plan }: { open: boolean; onOpenChange: (o: boolean) => void; plan: Plan }) {
  const [view, setView] = useState<View>("split");
  const [dir, setDir] = useState(1);

  function go(next: View) {
    setDir(VIEWS.indexOf(next) >= VIEWS.indexOf(view) ? 1 : -1);
    setView(next);
  }
  function onDragEnd(_: unknown, info: PanInfo) {
    const i = VIEWS.indexOf(view);
    if (info.offset.x < -60 && i < VIEWS.length - 1) go(VIEWS[i + 1]);
    else if (info.offset.x > 60 && i > 0) go(VIEWS[i - 1]);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Insights" description="Where your salary is going. Swipe to switch views." className="min-h-[70dvh]">
        <Tabs value={view} onValueChange={(v) => go(v as View)}>
          <TabsList className="grid-cols-3">
            <TabsTrigger value="split">Split</TabsTrigger>
            <TabsTrigger value="expenses">Top expenses</TabsTrigger>
            <TabsTrigger value="progress">Paid</TabsTrigger>
          </TabsList>
        </Tabs>
        <motion.div drag="x" dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={onDragEnd} className="mt-5 min-h-[50dvh] overflow-x-hidden">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={view}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: 40 * d }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: -40 * d }),
              }}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
            >
              {view === "split" && <Split plan={plan} />}
              {view === "expenses" && <Expenses plan={plan} />}
              {view === "progress" && <Progress plan={plan} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
