import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onSave: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function ItemSheet({ open, onOpenChange, item, defaultBucket, currency, onSave, onDelete }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [bucket, setBucket] = useState<BucketId>(defaultBucket);
  const [icon, setIcon] = useState<string | null>(null); // null = auto from name

  useEffect(() => {
    if (!open) return;
    setName(item?.name ?? "");
    setAmount(item ? String(item.amount) : "");
    setBucket(item?.bucket ?? defaultBucket);
    setIcon(item?.icon ?? null);
  }, [open, item, defaultBucket]);

  const shownIcon = icon ?? suggestIcon(name, bucket);
  const valid = name.trim().length > 0 && Number(amount) > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={item ? "Edit expense" : "Add expense"}>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSave({ id: item?.id ?? uid(), name: name.trim(), amount: Number(amount), bucket, paid: item?.paid ?? false, icon: shownIcon });
            onOpenChange(false);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">What is it for?</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rent, SIP, Netflix…" autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currencySymbol(currency)})</Label>
            <Input id="amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} placeholder="0" className="tabular text-xl font-semibold" />
          </div>
          <div className="space-y-2">
            <Label>Bucket</Label>
            <div className="grid grid-cols-3 gap-2">
              {BUCKETS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBucket(b.id)}
                  aria-pressed={bucket === b.id}
                  className={cn(
                    "rounded-xl border-2 bg-card px-2 py-3 text-center outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    bucket === b.id ? "text-foreground" : "border-transparent text-muted-foreground",
                  )}
                  style={bucket === b.id ? { borderColor: `var(--${b.id})` } : undefined}
                >
                  <div className="text-xl">{b.emoji}</div>
                  <div className="text-sm font-semibold">{b.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(ICONS).map(([key, v]) => (
                <button
                  key={key}
                  type="button"
                  title={v.label}
                  aria-label={v.label}
                  aria-pressed={shownIcon === key}
                  onClick={() => setIcon(key)}
                  className={cn(
                    "grid aspect-square place-items-center rounded-xl border-2 bg-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    shownIcon === key ? "border-primary text-primary" : "border-transparent text-muted-foreground",
                  )}
                >
                  <v.icon className="size-5" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
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
