import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Eye, Moon, Plus, Share2, Sun, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemRow } from "@/components/ItemRow";
import { ItemSheet } from "@/components/ItemSheet";
import { SetupSheet } from "@/components/SetupSheet";
import { ShareSheet } from "@/components/ShareSheet";
import { Summary } from "@/components/Summary";
import { starterPlan } from "@/lib/plan";
import { readSharedPlan } from "@/lib/share";
import { usePlan } from "@/lib/usePlan";
import { BUCKETS, type BucketId, type Item, type Plan } from "@/lib/types";

type Filter = "all" | BucketId;

export default function App() {
  const { plan: mine, setPlan, update } = usePlan();
  const [shared, setShared] = useState<Plan | null>(() => readSharedPlan());
  const plan = shared ?? mine;
  const readOnly = !!shared;

  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<Item | null>(null);
  const [itemOpen, setItemOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
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

  const visible = useMemo(
    () => plan.items.filter((i) => filter === "all" || i.bucket === filter),
    [plan.items, filter],
  );

  const openNew = () => { setEditing(null); setItemOpen(true); };
  const openEdit = (i: Item) => { setEditing(i); setItemOpen(true); };

  return (
    <MotionConfig reducedMotion="user">
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="size-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold">Gareeb Budget</h1>
            <p className="max-w-[11rem] truncate text-xs text-muted-foreground">{plan.name}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {dark ? <Sun /> : <Moon />}
          </Button>
          {!readOnly && (
            <Button variant="secondary" size="icon" onClick={() => setShareOpen(true)} aria-label="Share budget" disabled={plan.items.length === 0}>
              <Share2 />
            </Button>
          )}
        </div>
      </header>

      {readOnly && (
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-accent/60 p-3 text-accent-foreground">
          <Eye className="size-5 shrink-0" />
          <p className="flex-1 text-sm font-medium">You're viewing a shared budget (read-only).</p>
        </div>
      )}

      {plan.salary === 0 && !readOnly ? (
        <div className="mt-10 rounded-xl border border-dashed p-8 text-center">
          <p className="font-display text-xl font-bold">Every rupee needs a job.</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your salary to start planning.</p>
          <Button className="mt-5" onClick={() => setSetupOpen(true)}>Set my salary</Button>
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Summary plan={plan} onEdit={readOnly ? undefined : () => setSetupOpen(true)} />
          </motion.div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mt-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {BUCKETS.map((b) => (
                <TabsTrigger key={b.id} value={b.id}>{b.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ul className="mt-4 space-y-2">
            <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((item, idx) => (
              <ItemRow
                key={item.id}
                index={idx}
                item={item}
                currency={plan.currency}
                readOnly={readOnly}
                onToggle={() => update((p) => ({ ...p, items: p.items.map((i) => (i.id === item.id ? { ...i, paid: !i.paid } : i)) }))}
                onEdit={() => openEdit(item)}
              />
            ))}
            </AnimatePresence>
          </ul>

          {visible.length === 0 && (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              {filter === "all" ? "Nothing planned yet." : BUCKETS.find((b) => b.id === filter)!.hint}
              {!readOnly && " Tap + to add."}
            </p>
          )}
        </>
      )}

      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.2 }} className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        <div className="mx-auto flex max-w-lg gap-3">
          {readOnly ? (
            <>
              <Button variant="outline" size="lg" className="flex-1" onClick={leaveShared}>Back to mine</Button>
              <Button size="lg" className="flex-1" onClick={saveCopy}>Save a copy</Button>
            </>
          ) : (
            plan.salary > 0 && (
              <Button variant="accent" size="lg" className="w-full shadow-lg" onClick={openNew}>
                <Plus className="size-5" /> Add expense
              </Button>
            )
          )}
        </div>
      </motion.div>

      <ItemSheet
        open={itemOpen}
        onOpenChange={setItemOpen}
        item={editing}
        defaultBucket={filter === "all" ? "needs" : filter}
        currency={plan.currency}
        onSave={(item) =>
          update((p) => ({
            ...p,
            items: p.items.some((i) => i.id === item.id) ? p.items.map((i) => (i.id === item.id ? item : i)) : [...p.items, item],
          }))
        }
        onDelete={(id) => update((p) => ({ ...p, items: p.items.filter((i) => i.id !== id) }))}
      />
      <SetupSheet
        open={setupOpen}
        onOpenChange={setSetupOpen}
        plan={mine}
        onSave={(v, useStarter) =>
          setPlan((p) => (useStarter ? { ...starterPlan(v.salary, v.currency), name: v.name } : { ...p, ...v }))
        }
      />
      <ShareSheet open={shareOpen} onOpenChange={setShareOpen} plan={mine} />
    </div>
    </MotionConfig>
  );
}
