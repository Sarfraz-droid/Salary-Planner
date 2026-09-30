import { Checkbox } from "@/components/ui/checkbox";
import { money } from "@/lib/format";
import { BUCKETS, type Item } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ItemRow({ item, currency, readOnly, onToggle, onEdit }: {
  item: Item;
  currency: string;
  readOnly?: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const b = BUCKETS.find((x) => x.id === item.bucket)!;
  return (
    <li className="flex items-center gap-3 rounded-xl border bg-card p-2 pr-3">
      {!readOnly && (
        <div className="grid size-10 place-items-center">
          <Checkbox checked={item.paid} onCheckedChange={onToggle} aria-label={`Mark ${item.name} as paid`} />
        </div>
      )}
      <button
        onClick={readOnly ? undefined : onEdit}
        disabled={readOnly}
        className={cn("flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40", readOnly && "pl-2")}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full text-base" style={{ background: `color-mix(in oklch, var(--${b.id}) 18%, transparent)` }}>
          {b.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate font-medium", item.paid && "text-muted-foreground line-through")}>{item.name}</span>
          <span className="text-xs text-muted-foreground">{b.label}</span>
        </span>
        <span className={cn("font-semibold tabular", item.paid && "text-muted-foreground")}>{money(item.amount, currency)}</span>
      </button>
    </li>
  );
}
