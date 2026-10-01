import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { SmartAdd } from "@/components/SmartAdd";
import { smartCost } from "@/lib/ai";
import { AmountPicker } from "@/components/AmountPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconGrid, IconToggle } from "@/components/IconPicker";
import { Sheet, SheetBody, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { uid } from "@/lib/plan";
import { TRIP_CATS } from "@/lib/trip";
import { COST_ICONS, COST_PRESETS, suggestCost, TRIP_ICONS, suggestTripIcon } from "@/lib/tripIcons";
import type { Trip, TripCat, TripItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TripSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  trip: Trip | null; // null = new
  currency: string;
  onSave: (t: Trip) => void;
  onDelete: (id: string) => void;
}

export function TripSheet({ open, onOpenChange, trip, currency, onSave, onDelete }: TripSheetProps) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [budget, setBudget] = useState("");
  const [icon, setIcon] = useState<string | null>(null); // null = auto
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPicking(false);
    setName(trip?.name ?? "");
    setDestination(trip?.destination ?? "");
    setStart(trip?.start ?? "");
    setEnd(trip?.end ?? "");
    setBudget(trip?.budget ? String(trip.budget) : "");
    setIcon(trip?.icon ?? null);
  }, [open, trip]);

  const valid = name.trim().length > 0 && (!start || !end || end >= start);
  const shownIcon = icon ?? suggestTripIcon(name, destination);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={trip ? "Edit trip" : "New trip"} description="Plan the money before you go.">
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSave({
              id: trip?.id ?? uid(),
              name: name.trim(),
              destination: destination.trim(),
              start,
              end: end || start,
              budget: Number(budget) || 0,
              saved: trip?.saved ?? 0,
              icon: shownIcon,
              items: trip?.items ?? [],
            });
            onOpenChange(false);
          }}
        >
          <SheetBody>
          <div className="flex items-center gap-2">
            <IconToggle defs={TRIP_ICONS} shown={shownIcon} open={picking} onToggle={() => setPicking(!picking)} />
            <Input id="tname" aria-label="Trip name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Trip name, e.g. Goa with friends" autoComplete="off" />
          </div>
          {picking && <IconGrid defs={TRIP_ICONS} shown={shownIcon} onPick={(k) => { setIcon(k); setPicking(false); }} />}
          <Input id="tdest" aria-label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (optional)" autoComplete="off" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tstart">From</Label>
              <Input id="tstart" type="date" value={start} onChange={(e) => { setStart(e.target.value); if (end && e.target.value > end) setEnd(e.target.value); }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tend">To</Label>
              <Input id="tend" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div>
            <p className="text-center text-sm text-muted-foreground">Trip budget</p>
            <AmountPicker value={budget} onChange={setBudget} currency={currency} steps={[1000, 5000, 10000, 25000]} />
          </div>
          </SheetBody>
          <SheetFooter>
            {trip && (
              <Button type="button" variant="destructive" size="icon" aria-label="Delete trip" onClick={() => { if (confirm(`Delete “${trip.name}”?`)) { onDelete(trip.id); onOpenChange(false); } }}>
                <Trash2 />
              </Button>
            )}
            <Button type="submit" size="lg" className="flex-1" disabled={!valid}>{trip ? "Save trip" : "Create trip"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

interface TripItemSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: TripItem | null;
  currency: string;
  onSave: (i: TripItem) => void;
  onDelete: (id: string) => void;
}

export function TripItemSheet({ open, onOpenChange, item, currency, onSave, onDelete }: TripItemSheetProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TripCat>("stay");
  const [catTouched, setCatTouched] = useState(false);
  const [icon, setIcon] = useState<string | null>(null); // null = auto
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPicking(false);
    setName(item?.name ?? "");
    setAmount(item ? String(item.amount) : "");
    setCategory(item?.category ?? "stay");
    setCatTouched(!!item);
    setIcon(item?.icon ?? null);
  }, [open, item]);

  /** Typing a name auto-picks the category (until you choose one yourself). */
  function changeName(v: string) {
    setName(v);
    if (!catTouched) setCategory(suggestCost(v, category).category);
  }

  const valid = name.trim().length > 0 && Number(amount) > 0;
  const shownIcon = icon ?? suggestCost(name, category).icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={item ? "Edit cost" : "Add cost"}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSave({ id: item?.id ?? uid(), name: name.trim(), amount: Number(amount), category, icon: shownIcon });
            onOpenChange(false);
          }}
        >
          <SheetBody>
          {!item && (
            <SmartAdd
              placeholder='e.g. "hotel 6000" or "train 1.2k"'
              onFill={async ({ name: n, amount: a }) => {
                const r = await smartCost(n, category);
                if (n) setName(n);
                if (a) setAmount(String(a));
                setIcon(r.icon);
                setCategory(r.category);
                setCatTouched(true);
              }}
            />
          )}
          {!item && (
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Quick picks">
              {COST_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { changeName(p); setIcon(null); }}
                  className={cn(
                    "h-9 shrink-0 rounded-full border px-4 text-sm font-medium outline-none transition-transform active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    name === p ? "border-primary bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <IconToggle defs={COST_ICONS} shown={shownIcon} open={picking} onToggle={() => setPicking(!picking)} />
            <Input id="iname" aria-label="What is it?" value={name} onChange={(e) => changeName(e.target.value)} placeholder="Hotel, train tickets, dinner…" autoComplete="off" />
          </div>
          {picking && <IconGrid defs={COST_ICONS} shown={shownIcon} onPick={(k) => { setIcon(k); setPicking(false); }} />}
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Category">
            {TRIP_CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => { setCategory(c.id); setCatTouched(true); }}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                  category === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <c.icon className="size-4" />
                {c.label}
              </button>
            ))}
          </div>
          <AmountPicker value={amount} onChange={setAmount} currency={currency} steps={[500, 1000, 2000, 5000, 10000]} />
          </SheetBody>
          <SheetFooter>
            {item && (
              <Button type="button" variant="destructive" size="icon" aria-label="Delete" onClick={() => { onDelete(item.id); onOpenChange(false); }}>
                <Trash2 />
              </Button>
            )}
            <Button type="submit" size="lg" className="flex-1" disabled={!valid}>{item ? "Save changes" : "Add cost"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
