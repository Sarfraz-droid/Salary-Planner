import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { AmountPicker } from "@/components/AmountPicker";
import { IconGrid, IconToggle } from "@/components/IconPicker";
import { SmartAdd } from "@/components/SmartAdd";
import { StepSummary } from "@/components/StepSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetSection, SheetStep } from "@/components/ui/sheet";
import { smartCost } from "@/lib/ai";
import { uid } from "@/lib/plan";
import { fmtRange, TRIP_CATS } from "@/lib/trip";
import { COST_ICONS, COST_PRESETS, suggestCost, suggestTripIcon, TRIP_ICONS } from "@/lib/tripIcons";
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
  const [step, setStep] = useState(0); // 0 = trip details, 1 = budget
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [budget, setBudget] = useState("");
  const [icon, setIcon] = useState<string | null>(null); // null = auto
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0);
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

  function save() {
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
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={trip ? "Edit trip" : "New trip"} description={step === 0 ? "Step 1 of 2 · Where and when?" : "Step 2 of 2 · Trip budget"}>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => { e.preventDefault(); step === 0 ? valid && setStep(1) : save(); }}>
          <SheetBody>
            {step === 0 ? (
              <SheetStep stepKey="trip">
                <SheetSection title="Trip">
                  <div className="flex items-center gap-2">
                    <IconToggle defs={TRIP_ICONS} shown={shownIcon} open={picking} onToggle={() => setPicking(!picking)} />
                    <Input id="tname" aria-label="Trip name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Goa with friends" autoComplete="off" />
                  </div>
                  {picking && <IconGrid defs={TRIP_ICONS} shown={shownIcon} onPick={(k) => { setIcon(k); setPicking(false); }} />}
                </SheetSection>
                <SheetSection title="Where">
                  <Input id="tdest" aria-label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (optional)" autoComplete="off" />
                </SheetSection>
                <SheetSection title="When">
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
                </SheetSection>
              </SheetStep>
            ) : (
              <SheetStep stepKey="budget">
                <StepSummary
                  icon={TRIP_ICONS[shownIcon].icon}
                  title={name}
                  subtitle={[destination, fmtRange({ start, end: end || start } as Trip)].filter(Boolean).join(" · ")}
                  onEdit={() => setStep(0)}
                />
                <SheetSection title="Trip budget" hint="Roughly how much you want to spend in total.">
                  <AmountPicker value={budget} onChange={setBudget} currency={currency} steps={[1000, 5000, 10000, 25000]} />
                </SheetSection>
              </SheetStep>
            )}
          </SheetBody>
          <SheetFooter>
            {step === 0 ? (
              <>
                {trip && (
                  <Button type="button" variant="destructive" size="icon" aria-label="Delete trip" onClick={() => { if (confirm(`Delete “${trip.name}”?`)) { onDelete(trip.id); onOpenChange(false); } }}>
                    <Trash2 />
                  </Button>
                )}
                <Button type="submit" size="lg" className="flex-1" disabled={!valid}>Next <ArrowRight /></Button>
              </>
            ) : (
              <>
                <Button type="button" variant="secondary" size="icon" aria-label="Back" onClick={() => setStep(0)}><ArrowLeft /></Button>
                <Button type="submit" size="lg" className="flex-1">{trip ? "Save trip" : "Create trip"}</Button>
              </>
            )}
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
  const [step, setStep] = useState(0); // 0 = what, 1 = how much
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TripCat>("stay");
  const [catTouched, setCatTouched] = useState(false);
  const [icon, setIcon] = useState<string | null>(null); // null = auto
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(item ? 1 : 0);
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

  const hasName = name.trim().length > 0;
  const valid = hasName && Number(amount) > 0;
  const shownIcon = icon ?? suggestCost(name, category).icon;
  const catLabel = TRIP_CATS.find((c) => c.id === category)!.label;

  function submit() {
    if (!valid) return;
    onSave({ id: item?.id ?? uid(), name: name.trim(), amount: Number(amount), category, icon: shownIcon });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={item ? "Edit cost" : "Add cost"} description={step === 0 ? "Step 1 of 2 · What is it?" : "Step 2 of 2 · How much?"}>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => { e.preventDefault(); step === 0 ? hasName && setStep(1) : submit(); }}>
          <SheetBody>
            {step === 0 ? (
              <SheetStep stepKey="what">
                {!item && (
                  <SheetSection title="Quick add" hint="Type it like you'd say it.">
                    <SmartAdd
                      placeholder='e.g. "hotel 6000" or "train 1.2k"'
                      onFill={async ({ name: n, amount: a }) => {
                        const r = await smartCost(n, category);
                        if (n) setName(n);
                        setIcon(r.icon);
                        setCategory(r.category);
                        setCatTouched(true);
                        if (a) { setAmount(String(a)); setStep(1); }
                      }}
                    />
                  </SheetSection>
                )}
                {!item && (
                  <SheetSection title="Common">
                    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Quick picks">
                      {COST_PRESETS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { changeName(p); setIcon(null); }}
                          className={cn(
                            "h-10 shrink-0 rounded-full border px-4 text-sm font-medium outline-none transition-transform active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/40",
                            name === p ? "border-primary bg-primary text-primary-foreground" : "bg-card",
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </SheetSection>
                )}
                <SheetSection title="Name">
                  <div className="flex items-center gap-2">
                    <IconToggle defs={COST_ICONS} shown={shownIcon} open={picking} onToggle={() => setPicking(!picking)} />
                    <Input id="iname" aria-label="Name" value={name} onChange={(e) => changeName(e.target.value)} placeholder="Hotel, train tickets, dinner…" autoComplete="off" />
                  </div>
                  {picking && <IconGrid defs={COST_ICONS} shown={shownIcon} onPick={(k) => { setIcon(k); setPicking(false); }} />}
                </SheetSection>
                <SheetSection title="Category">
                  <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Category">
                    {TRIP_CATS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={category === c.id}
                        onClick={() => { setCategory(c.id); setCatTouched(true); }}
                        className={cn(
                          "flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                          category === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <c.icon className="size-4" />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </SheetSection>
              </SheetStep>
            ) : (
              <SheetStep stepKey="amount">
                <StepSummary icon={COST_ICONS[shownIcon].icon} title={name || "Untitled"} subtitle={catLabel} onEdit={() => setStep(0)} />
                <AmountPicker value={amount} onChange={setAmount} currency={currency} steps={[500, 1000, 2000, 5000, 10000]} />
              </SheetStep>
            )}
          </SheetBody>
          <SheetFooter>
            {step === 0 ? (
              <Button type="submit" size="lg" className="flex-1" disabled={!hasName}>Next <ArrowRight /></Button>
            ) : (
              <>
                {item ? (
                  <Button type="button" variant="destructive" size="icon" aria-label="Delete" onClick={() => { onDelete(item.id); onOpenChange(false); }}><Trash2 /></Button>
                ) : (
                  <Button type="button" variant="secondary" size="icon" aria-label="Back" onClick={() => setStep(0)}><ArrowLeft /></Button>
                )}
                <Button type="submit" size="lg" className="flex-1" disabled={!valid}>{item ? "Save changes" : "Add cost"}</Button>
              </>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
