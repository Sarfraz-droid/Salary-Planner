import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmountPicker } from "@/components/AmountPicker";
import { PRESETS } from "@/lib/presets";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
  const SelectedIcon = ICONS[shownIcon].icon;
  const valid = name.trim().length > 0 && Number(amount) > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={item ? "Edit expense" : "Add expense"}>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSave({ id: item?.id ?? uid(), name: name.trim(), amount: Number(amount), bucket, paid: item?.paid ?? false, icon: shownIcon, locked: auto ? locked : item?.locked });
            onOpenChange(false);
          }}
        >
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
          <div className="space-y-2">
            <Label htmlFor="name">What is it for?</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rent, SIP, Netflix…" autoComplete="off" />
          </div>
          <AmountPicker value={amount} onChange={setAmount} currency={currency} />
          <div className="space-y-2">
            <Label>Bucket</Label>
            <div className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
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
          </div>
          <div>
            <button
              type="button"
              onClick={() => setPicking(!picking)}
              className="flex items-center gap-3 rounded-full text-sm font-medium text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <span className="grid size-10 place-items-center rounded-full bg-muted text-foreground">
                <SelectedIcon className="size-5" />
              </span>
              {picking ? "Hide icons" : "Change icon"}
            </button>
            {picking && (
              <div className="mt-3 grid grid-cols-6 gap-2">
                {Object.entries(ICONS).map(([key, v]) => (
                  <button
                    key={key}
                    type="button"
                    title={v.label}
                    aria-label={v.label}
                    aria-pressed={shownIcon === key}
                    onClick={() => { setIcon(key); setPicking(false); }}
                    className={cn(
                      "grid aspect-square place-items-center rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                      shownIcon === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <v.icon className="size-5" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {auto && (
            <label className="flex items-center justify-between gap-4 rounded-xl bg-muted p-3">
              <span className="text-sm">
                <span className="block font-semibold">Fixed amount</span>
                <span className="text-muted-foreground">{locked ? "Other items adjust around this." : "This item can adjust too."}</span>
              </span>
              <Switch checked={locked} onCheckedChange={setLocked} />
            </label>
          )}
          <div className="sticky bottom-0 -mx-5 flex gap-3 bg-background px-5 pb-1 pt-3">
            {item && (
              <Button type="button" variant="destructive" size="icon" aria-label="Delete" onClick={() => { onDelete(item.id); onOpenChange(false); }}>
                <Trash2 />
              </Button>
            )}
            <Button type="submit" size="lg" className="flex-1" disabled={!valid}>
              {item ? "Save changes" : "Add to budget"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
