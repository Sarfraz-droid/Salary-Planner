import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { currencySymbol } from "@/lib/format";
import { uid } from "@/lib/plan";
import { TRIP_CATS } from "@/lib/trip";
import type { Trip, TripCat, TripItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const digits = (v: string) => v.replace(/[^\d]/g, "");

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
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(trip?.name ?? "");
    setDestination(trip?.destination ?? "");
    setStart(trip?.start ?? "");
    setEnd(trip?.end ?? "");
    setBudget(trip?.budget ? String(trip.budget) : "");
    setSaved(trip?.saved ? String(trip.saved) : "");
  }, [open, trip]);

  const valid = name.trim().length > 0 && (!start || !end || end >= start);
  const sym = currencySymbol(currency);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={trip ? "Edit trip" : "New trip"} description="Plan the money before you go.">
        <form
          className="space-y-5"
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
              saved: Number(saved) || 0,
              items: trip?.items ?? [],
            });
            onOpenChange(false);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="tname">Trip name</Label>
            <Input id="tname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Goa with friends" autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tdest">Destination</Label>
            <Input id="tdest" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Optional" autoComplete="off" />
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tbudget">Budget ({sym})</Label>
              <Input id="tbudget" inputMode="numeric" value={budget} onChange={(e) => setBudget(digits(e.target.value))} placeholder="0" className="tabular" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tsaved">Saved so far ({sym})</Label>
              <Input id="tsaved" inputMode="numeric" value={saved} onChange={(e) => setSaved(digits(e.target.value))} placeholder="0" className="tabular" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            {trip && (
              <Button type="button" variant="destructive" size="icon" aria-label="Delete trip" onClick={() => { if (confirm(`Delete “${trip.name}”?`)) { onDelete(trip.id); onOpenChange(false); } }}>
                <Trash2 />
              </Button>
            )}
            <Button type="submit" size="lg" className="flex-1" disabled={!valid}>{trip ? "Save trip" : "Create trip"}</Button>
          </div>
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

  useEffect(() => {
    if (!open) return;
    setName(item?.name ?? "");
    setAmount(item ? String(item.amount) : "");
    setCategory(item?.category ?? "stay");
  }, [open, item]);

  const valid = name.trim().length > 0 && Number(amount) > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={item ? "Edit cost" : "Add cost"}>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSave({ id: item?.id ?? uid(), name: name.trim(), amount: Number(amount), category });
            onOpenChange(false);
          }}
        >
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {TRIP_CATS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    category === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <c.icon className="size-5" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="iname">What is it?</Label>
            <Input id="iname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hotel, train tickets, dinner…" autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iamount">Amount ({currencySymbol(currency)})</Label>
            <Input id="iamount" inputMode="numeric" value={amount} onChange={(e) => setAmount(digits(e.target.value))} placeholder="0" className="tabular text-xl font-semibold" />
          </div>
          <div className="flex gap-3 pt-1">
            {item && (
              <Button type="button" variant="destructive" size="icon" aria-label="Delete" onClick={() => { onDelete(item.id); onOpenChange(false); }}>
                <Trash2 />
              </Button>
            )}
            <Button type="submit" size="lg" className="flex-1" disabled={!valid}>{item ? "Save changes" : "Add cost"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
