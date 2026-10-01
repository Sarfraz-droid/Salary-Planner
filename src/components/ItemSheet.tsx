import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmountPicker } from "@/components/AmountPicker";
import { SmartAdd } from "@/components/SmartAdd";
import { smartExpense } from "@/lib/ai";
import { PRESETS } from "@/lib/presets";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { IconGrid, IconToggle } from "@/components/IconPicker";
import { Sheet, SheetBody, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { currencySymbol } from "@/lib/format";
import { ICONS, suggestIcon } from "@/lib/icons";
import { uid } from "@/lib/plan";
import { BUCKETS, type BucketId, type Item } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: Item | null; // null = new
  defaultBucket: BucketId;
  currency: string;
  auto: boolean;
  onSave: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function ItemSheet({ open, onOpenChange, item, defaultBucket, currency, auto, onSave, onDelete }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [bucket, setBucket] = useState<BucketId>(defaultBucket);
  const [locked, setLocked] = useState(true);
  const [picking, setPicking] = useState(false);
  const [icon, setIcon] = useState<string | null>(null); // null = auto from name

  useEffect(() => {
    if (!open) return;
    setName(item?.name ?? "");
    setAmount(item ? String(item.amount) : "");
    setBucket(item?.bucket ?? defaultBucket);
    setIcon(item?.icon ?? null);
    setPicking(false);
    setLocked(item ? !!item.locked || auto : true);
  }, [open, item, defaultBucket]);

  const shownIcon = icon ?? suggestIcon(name, bucket);
  const valid = name.trim().length > 0 && Number(amount) > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={item ? "Edit expense" : "Add expense"}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSave({ id: item?.id ?? uid(), name: name.trim(), amount: Number(amount), bucket, paid: item?.paid ?? false, icon: shownIcon, locked: auto ? locked : item?.locked });
            onOpenChange(false);
          }}
        >
          <SheetBody>
            {!item && (
              <SmartAdd
                placeholder='e.g. "swiggy 450" or "rent 15k"'
                onFill={async ({ name: n, amount: a }) => {
                  const r = await smartExpense(n, bucket);
                  if (n) setName(n);
                  if (a) setAmount(String(a));
                  setIcon(r.icon);
                  setBucket(r.bucket);
                }}
              />
            )}
            {!item && (
              <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Quick picks">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => { setName(p.name); setBucket(p.bucket); setIcon(null); }}
                    className={cn(
                      "h-9 shrink-0 rounded-full border px-4 text-sm font-medium outline-none transition-transform active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/40",
                      name === p.name ? "border-primary bg-primary text-primary-foreground" : "bg-card",
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <IconToggle defs={ICONS} shown={shownIcon} open={picking} onToggle={() => setPicking(!picking)} />
              <Input id="name" aria-label="What is it for?" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rent, SIP, Netflix…" autoComplete="off" />
            </div>
            {picking && <IconGrid defs={ICONS} shown={shownIcon} onPick={(k) => { setIcon(k); setPicking(false); }} />}
            <div className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1" role="group" aria-label="Bucket">
              {BUCKETS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBucket(b.id)}
                  aria-pressed={bucket === b.id}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    bucket === b.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <span className="size-2 rounded-full" style={{ background: `var(--${b.id})` }} />
                  {b.label}
                </button>
              ))}
            </div>
            <AmountPicker value={amount} onChange={setAmount} currency={currency} />
            {auto && (
              <label className="flex items-center justify-between gap-4 rounded-xl bg-muted p-3">
                <span className="text-sm">
                  <span className="block font-semibold">Fixed amount</span>
                  <span className="text-muted-foreground">{locked ? "Other items adjust around this." : "This item can adjust too."}</span>
                </span>
                <Switch checked={locked} onCheckedChange={setLocked} />
              </label>
            )}
          </SheetBody>
          <SheetFooter>
            {item && (
              <Button type="button" variant="destructive" size="icon" aria-label="Delete" onClick={() => { onDelete(item.id); onOpenChange(false); }}>
                <Trash2 />
              </Button>
            )}
            <Button type="submit" size="lg" className="flex-1" disabled={!valid}>
              {item ? "Save changes" : "Add to budget"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
