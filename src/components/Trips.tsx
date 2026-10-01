import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CalendarDays, ChevronRight, MapPin, Pencil, Plane, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedMoney } from "@/components/AnimatedMoney";
import { TripItemSheet, TripSheet } from "@/components/TripSheets";
import { money } from "@/lib/format";
import { tripPlanned } from "@/lib/plan";
import { getCostIcon, getTripIcon } from "@/lib/tripIcons";
import { countdown, fmtRange, tripDays, TRIP_CATS } from "@/lib/trip";
import type { Plan, Trip, TripItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  plan: Plan;
  readOnly: boolean;
  update: (fn: (p: Plan) => Plan) => void;
}

const SPRING = { type: "spring", stiffness: 140, damping: 22 } as const;

function Bar({ value, max, over }: { value: number; max: number; over?: boolean }) {
  const pct = max > 0 ? Math.min(value / max, 1) * 100 : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <motion.div
        className={cn("h-full rounded-full", over ? "bg-destructive" : "bg-foreground")}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={SPRING}
      />
    </div>
  );
}

function TripCard({ trip, currency, index, onOpen }: { trip: Trip; currency: string; index: number; onOpen: () => void }) {
  const planned = tripPlanned(trip);
  const target = trip.budget || planned;
  const when = countdown(trip);
  const TripIcon = getTripIcon(trip.icon, trip.name, trip.destination);
  return (
    <motion.li initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, ...SPRING }}>
      <button onClick={onOpen} className="w-full rounded-2xl bg-card p-4 text-left outline-none transition-transform active:scale-[0.985] focus-visible:ring-[3px] focus-visible:ring-ring/40">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted"><TripIcon className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">{trip.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
              {trip.destination ? <><MapPin className="size-3.5 shrink-0" />{trip.destination} · </> : null}
              {fmtRange(trip)}
            </p>
          </div>
          {when && <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold">{when}</span>}
        </div>
        <div className="mt-4">
          <Bar value={planned} max={target} over={trip.budget > 0 && planned > trip.budget} />
          <div className="mt-2 flex justify-between text-sm tabular text-muted-foreground">
            <span>{money(planned, currency)} planned</span>
            {trip.budget > 0 && <span>of {money(trip.budget, currency)}</span>}
          </div>
        </div>
      </button>
    </motion.li>
  );
}

function Detail({ trip, plan, readOnly, onBack, onEditTrip, onAddItem, onEditItem }: {
  trip: Trip;
  plan: Plan;
  readOnly: boolean;
  onBack: () => void;
  onEditTrip: () => void;
  onAddItem: () => void;
  onEditItem: (i: TripItem) => void;
}) {
  const cur = plan.currency;
  const planned = tripPlanned(trip);
  const target = trip.budget || planned;
  const left = trip.budget - planned;
  const days = tripDays(trip);
  const DetailIcon = getTripIcon(trip.icon, trip.name, trip.destination);
  const groups = TRIP_CATS.map((c) => ({ ...c, items: trip.items.filter((i) => i.category === c.id) })).filter((g) => g.items.length);

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="-ml-3" onClick={onBack}><ArrowLeft /> Trips</Button>
        {!readOnly && <Button variant="ghost" size="icon-sm" aria-label="Edit trip" onClick={onEditTrip}><Pencil /></Button>}
      </div>

      <span className="mt-3 grid size-12 place-items-center rounded-full bg-card"><DetailIcon className="size-6" /></span>
      <h2 className="mt-3 text-3xl font-bold">{trip.name}</h2>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {trip.destination && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{trip.destination}</span>}
        <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{fmtRange(trip)}{days > 0 && ` · ${days} day${days > 1 ? "s" : ""}`}</span>
      </p>

      <section className="mt-6 rounded-[1.75rem] bg-card p-6">
        <p className="text-sm text-muted-foreground">{trip.budget ? (left >= 0 ? "Left in trip budget" : "Over trip budget by") : "Planned so far"}</p>
        <p className={cn("font-display text-5xl font-bold tabular", trip.budget && left < 0 && "text-destructive")}>
          <AnimatedMoney value={trip.budget ? Math.abs(left) : planned} currency={cur} />
        </p>
        <div className="mt-5"><Bar value={planned} max={target} over={trip.budget > 0 && left < 0} /></div>
        <div className="mt-2 flex justify-between text-sm tabular text-muted-foreground">
          <span>{money(planned, cur)} planned</span>
          {trip.budget > 0 && <span>Budget {money(trip.budget, cur)}</span>}
        </div>
        {days > 0 && target > 0 && (
          <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
            About <b className="text-foreground tabular">{money(Math.round(target / days), cur)}</b> per day
          </p>
        )}
      </section>

      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <section key={g.id}>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h3 className="flex items-center gap-2 text-base font-semibold"><g.icon className="size-4 text-muted-foreground" />{g.label}</h3>
              <span className="text-sm tabular text-muted-foreground">{money(g.items.reduce((n, i) => n + i.amount, 0), cur)}</span>
            </div>
            <ul className="divide-y overflow-hidden rounded-2xl bg-card">
              {g.items.map((i) => (
                <li key={i.id}>
                  <button
                    onClick={() => !readOnly && onEditItem(i)}
                    disabled={readOnly}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted">
                        {(() => { const I = getCostIcon(i.icon, i.name, i.category); return <I className="size-[18px]" />; })()}
                      </span>
                      <span className="truncate font-medium">{i.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 font-semibold tabular">{money(i.amount, cur)}{!readOnly && <ChevronRight className="size-4 text-muted-foreground" />}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {trip.items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No costs yet.{!readOnly && " Tap + to add stay, travel, food…"}</p>
        )}
      </div>

      {!readOnly && <Fab label="Add cost" onClick={onAddItem} />}
    </motion.div>
  );
}

function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-lg">
        <Button size="icon" className="pointer-events-auto ml-auto size-14 shadow-xl" onClick={onClick} aria-label={label}><Plus className="size-6" /></Button>
      </div>
    </div>
  );
}

export function Trips({ plan, readOnly, update }: Props) {
  const trips = plan.trips ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const [tripSheet, setTripSheet] = useState<{ open: boolean; trip: Trip | null }>({ open: false, trip: null });
  const [itemSheet, setItemSheet] = useState<{ open: boolean; item: TripItem | null }>({ open: false, item: null });

  const sorted = useMemo(
    () => [...trips].sort((a, b) => (a.start || "9999").localeCompare(b.start || "9999")),
    [trips],
  );
  const current = trips.find((t) => t.id === openId) ?? null;

  const mutateTrips = (fn: (t: Trip[]) => Trip[]) => update((p) => ({ ...p, trips: fn(p.trips ?? []) }));
  const saveTrip = (t: Trip) =>
    mutateTrips((ts) => (ts.some((x) => x.id === t.id) ? ts.map((x) => (x.id === t.id ? t : x)) : [...ts, t]));
  const saveItem = (i: TripItem) =>
    current && mutateTrips((ts) => ts.map((t) => t.id === current.id ? { ...t, items: t.items.some((x) => x.id === i.id) ? t.items.map((x) => (x.id === i.id ? i : x)) : [...t.items, i] } : t));
  const deleteItem = (id: string) =>
    current && mutateTrips((ts) => ts.map((t) => (t.id === current.id ? { ...t, items: t.items.filter((x) => x.id !== id) } : t)));

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {current ? (
          <Detail
            key={current.id}
            trip={current}
            plan={plan}
            readOnly={readOnly}
            onBack={() => setOpenId(null)}
            onEditTrip={() => setTripSheet({ open: true, trip: current })}
            onAddItem={() => setItemSheet({ open: true, item: null })}
            onEditItem={(item) => setItemSheet({ open: true, item })}
          />
        ) : (
          <motion.div key="list" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            {sorted.length === 0 ? (
              <div className="mt-16 flex flex-col items-center text-center">
                <div className="grid size-16 place-items-center rounded-full bg-muted"><Plane className="size-7" /></div>
                <p className="mt-5 font-display text-xl font-bold">Where to next?</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">Plan a trip, list the costs and see how much to save each month.</p>
                {!readOnly && <Button className="mt-6" onClick={() => setTripSheet({ open: true, trip: null })}><Plus /> Plan a trip</Button>}
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {sorted.map((t, i) => (
                  <TripCard key={t.id} trip={t} currency={plan.currency} index={i} onOpen={() => setOpenId(t.id)} />
                ))}
              </ul>
            )}
            {!readOnly && sorted.length > 0 && <Fab label="New trip" onClick={() => setTripSheet({ open: true, trip: null })} />}
          </motion.div>
        )}
      </AnimatePresence>

      <TripSheet
        open={tripSheet.open}
        onOpenChange={(o) => setTripSheet((s) => ({ ...s, open: o }))}
        trip={tripSheet.trip}
        currency={plan.currency}
        onSave={saveTrip}
        onDelete={(id) => { setOpenId(null); mutateTrips((ts) => ts.filter((t) => t.id !== id)); }}
      />
      <TripItemSheet
        open={itemSheet.open}
        onOpenChange={(o) => setItemSheet((s) => ({ ...s, open: o }))}
        item={itemSheet.item}
        currency={plan.currency}
        onSave={saveItem}
        onDelete={deleteItem}
      />
    </>
  );
}
