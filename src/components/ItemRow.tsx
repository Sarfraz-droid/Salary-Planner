import { useRef } from "react";
import { motion, useTransform, useMotionValue, type PanInfo } from "motion/react";
import { Check, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { money } from "@/lib/format";
import { getIcon } from "@/lib/icons";
import { BUCKETS, type Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const THRESHOLD = 90;

/** Swipe right to mark paid / unpaid, swipe left to delete (with undo). */
export function ItemRow({ item, currency, readOnly, index = 0, onToggle, onEdit, onDelete }: {
  item: Item;
  currency: string;
  readOnly?: boolean;
  index?: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const b = BUCKETS.find((x) => x.id === item.bucket)!;
  const Icon = getIcon(item.icon, item.name, item.bucket);
  const x = useMotionValue(0);
  const paidOpacity = useTransform(x, [0, THRESHOLD], [0, 1]);
  const delOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0]);
  const dragged = useRef(false);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > THRESHOLD) onToggle();
    else if (info.offset.x < -THRESHOLD) onDelete();
    setTimeout(() => (dragged.current = false), 0);
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 32, delay: Math.min(index, 8) * 0.03 }}
      className="relative overflow-hidden rounded-xl"
    >
      {!readOnly && (
        <>
          <motion.div style={{ opacity: paidOpacity }} className="absolute inset-0 flex items-center gap-2 rounded-xl bg-primary pl-5 text-sm font-semibold text-primary-foreground" aria-hidden>
            <Check className="size-5" /> {item.paid ? "Unpaid" : "Paid"}
          </motion.div>
          <motion.div style={{ opacity: delOpacity }} className="absolute inset-0 flex items-center justify-end gap-2 rounded-xl bg-destructive pr-5 text-sm font-semibold text-white" aria-hidden>
            Delete <Trash2 className="size-5" />
          </motion.div>
        </>
      )}
      <motion.div
        drag={readOnly ? false : "x"}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.35}
        style={{ x }}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={onDragEnd}
        whileTap={readOnly ? undefined : { scale: 0.985 }}
        className="relative flex items-center gap-3 rounded-xl border bg-card p-2 pr-3"
      >
        {!readOnly && (
          <div className="grid size-10 place-items-center">
            <Checkbox checked={item.paid} onCheckedChange={onToggle} aria-label={`Mark ${item.name} as paid`} />
          </div>
        )}
        <button
          onClick={() => !readOnly && !dragged.current && onEdit()}
          disabled={readOnly}
          className={cn("flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40", readOnly && "pl-2")}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in oklch, var(--${b.id}) 18%, transparent)` }}>
            <Icon className="size-[18px]" style={{ color: `var(--${b.id})` }} />
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate font-medium", item.paid && "text-muted-foreground line-through")}>{item.name}</span>
            <span className="text-xs text-muted-foreground">{b.label}</span>
          </span>
          <span className={cn("font-semibold tabular", item.paid && "text-muted-foreground")}>{money(item.amount, currency)}</span>
        </button>
      </motion.div>
    </motion.li>
  );
}
