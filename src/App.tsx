import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Eye, Moon, Plus, Share2, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Analytics } from "@/components/Analytics";
import { Toast } from "@/components/Toast";
import { ItemRow } from "@/components/ItemRow";
import { ItemSheet } from "@/components/ItemSheet";
import { SetupSheet } from "@/components/SetupSheet";
import { ShareSheet } from "@/components/ShareSheet";
import { Trips } from "@/components/Trips";
import { Summary } from "@/components/Summary";
import { starterPlan } from "@/lib/plan";
import { readSharedPlan } from "@/lib/share";
import { usePlan } from "@/lib/usePlan";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { totals } from "@/lib/plan";
import { BUCKETS, type Item, type Plan } from "@/lib/types";

export default function App() {
  const { plan: mine, setPlan, update } = usePlan();
  const [shared, setShared] = useState<Plan | null>(() => readSharedPlan());
  const plan = shared ?? mine;
  const readOnly = !!shared;

  const [view, setView] = useState<"budget" | "trips">("budget");
  const [editing, setEditing] = useState<Item | null>(null);
  const [itemOpen, setItemOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [undo, setUndo] = useState<{ item: Item; index: number } | null>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const onHash = () => setShared(readSharedPlan());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // First visit: ask for salary straight away.
  useEffect(() => {
    if (!readOnly && mine.salary === 0 && mine.items.length === 0) setSetupOpen(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("gareeb-budget:theme", next ? "dark" : "light"); } catch { /* ignore */ }
  }

  function leaveShared() {
    history.replaceState(null, "", location.pathname);
    setShared(null);
  }

  function saveCopy() {
    if (!shared) return;
    if (mine.items.length && !confirm("This replaces the budget saved on this device. Continue?")) return;
    setPlan({ ...shared });
    leaveShared();
  }

  const sums = useMemo(() => totals(plan).byBucket, [plan]);

  function deleteItem(id: string) {
    const index = mine.items.findIndex((i) => i.id === id);
    if (index < 0) return;
    setUndo({ item: mine.items[index], index });
    update((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }));
  }
  function undoDelete() {
    if (!undo) return;
    const { item, index } = undo;
    update((p) => ({ ...p, items: [...p.items.slice(0, index), item, ...p.items.slice(index)] }));
    setUndo(null);
  }

  const openNew = () => { setEditing(null); setItemOpen(true); };
  const openEdit = (i: Item) => { setEditing(i); setItemOpen(true); };

  return (
    <MotionConfig reducedMotion="user">
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Gareeb Budget</p>
          <h1 className="truncate text-2xl font-bold">{plan.name}</h1>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? <Sun /> : <Moon />}
          </Button>
          {!readOnly && (
            <Button variant="ghost" size="icon" onClick={() => setShareOpen(true)} aria-label="Share budget" disabled={plan.items.length === 0}>
              <Share2 />
            </Button>
          )}
        </div>
      </header>

      <nav className="relative mb-5 grid grid-cols-2 rounded-full bg-muted p-1" aria-label="Sections">
        {(["budget", "trips"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-current={view === v}
            className={cn("relative h-10 rounded-full text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40", view === v ? "text-foreground" : "text-muted-foreground")}
          >
            {view === v && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-card shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative">{v === "budget" ? "Budget" : "Trips"}</span>
          </button>
        ))}
      </nav>

      {readOnly && (
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-accent/60 p-3 text-accent-foreground">
          <Eye className="size-5 shrink-0" />
          <p className="flex-1 text-sm font-medium">You're viewing a shared budget (read-only).</p>
        </div>
      )}

      {view === "trips" ? (
        <Trips plan={plan} readOnly={readOnly} update={update} />
      ) : plan.salary === 0 && !readOnly ? (
        <div className="mt-10 rounded-xl border border-dashed p-8 text-center">
          <p className="font-display text-xl font-bold">Every rupee needs a job.</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your salary to start planning.</p>
          <Button className="mt-5" onClick={() => setSetupOpen(true)}>Set my salary</Button>
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Summary plan={plan} onEdit={readOnly ? undefined : () => setSetupOpen(true)} onInsights={() => setInsightsOpen(true)} />
          </motion.div>

          <div className="mt-8 space-y-7">
            {BUCKETS.map((b) => {
              const items = plan.items.filter((i) => i.bucket === b.id);
              if (!items.length) return null;
              return (
                <section key={b.id}>
                  <div className="mb-2 flex items-baseline justify-between px-1">
                    <h2 className="flex items-center gap-2 text-base font-semibold">
                      <span className="size-2.5 rounded-full" style={{ background: `var(--${b.id})` }} />
                      {b.label}
                    </h2>
                    <span className="text-sm tabular text-muted-foreground">
                      {money(sums[b.id], plan.currency)}
                      {plan.salary > 0 && <> · {Math.round((sums[b.id] / plan.salary) * 100)}%</>}
                    </span>
                  </div>
                  <ul className="divide-y overflow-hidden rounded-2xl bg-card">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          currency={plan.currency}
                          readOnly={readOnly}
                          onToggle={() => update((p) => ({ ...p, items: p.items.map((i) => (i.id === item.id ? { ...i, paid: !i.paid } : i)) }))}
                          onEdit={() => openEdit(item)}
                          onDelete={() => deleteItem(item.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </section>
              );
            })}
          </div>

          {plan.items.length === 0 && (
            <p className="mt-12 text-center text-sm text-muted-foreground">Nothing planned yet.{!readOnly && " Tap + to start."}</p>
          )}
          {plan.items.length > 0 && !readOnly && (
            <p className="mt-6 text-center text-xs text-muted-foreground/80">Swipe a row right to mark paid, left to delete</p>
          )}
        </>
      )}

      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.2 }} className="fixed inset-x-0 bottom-0 z-40 pointer-events-none px-4 pb-[max(1rem,env(safe-area-inset-bottom))] [&>div>*]:pointer-events-auto">
        <div className="mx-auto flex max-w-lg gap-3">
          {readOnly ? (
            <>
              <Button variant="outline" size="lg" className="flex-1" onClick={leaveShared}>Back to mine</Button>
              <Button size="lg" className="flex-1" onClick={saveCopy}>Save a copy</Button>
            </>
          ) : (
            plan.salary > 0 && view === "budget" && (
              <Button size="icon" className="ml-auto size-14 shadow-xl" onClick={openNew} aria-label="Add expense">
                <Plus className="size-6" />
              </Button>
            )
          )}
        </div>
      </motion.div>

      <ItemSheet
        open={itemOpen}
        onOpenChange={setItemOpen}
        item={editing}
        defaultBucket="needs"
        currency={plan.currency}
        onSave={(item) =>
          update((p) => ({
            ...p,
            items: p.items.some((i) => i.id === item.id) ? p.items.map((i) => (i.id === item.id ? item : i)) : [...p.items, item],
          }))
        }
        onDelete={deleteItem}
      />
      <SetupSheet
        open={setupOpen}
        onOpenChange={setSetupOpen}
        plan={mine}
        onSave={(v, useStarter) =>
          setPlan((p) => (useStarter ? { ...starterPlan(v.salary, v.currency), name: v.name, trips: p.trips } : { ...p, ...v }))
        }
      />
      <Analytics open={insightsOpen} onOpenChange={setInsightsOpen} plan={plan} />
      <Toast message={undo ? `Deleted “${undo.item.name}”` : null} onUndo={undoDelete} onDone={() => setUndo(null)} />
      <ShareSheet open={shareOpen} onOpenChange={setShareOpen} plan={mine} />
    </div>
    </MotionConfig>
  );
}
