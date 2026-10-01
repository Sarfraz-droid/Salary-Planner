import { useRef } from "react";
import { motion, useTransform, useMotionValue, type PanInfo } from "motion/react";
import { Check, Lock, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { money } from "@/lib/format";
import { getIcon } from "@/lib/icons";
import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const THRESHOLD = 90;

/** Flat list row. Swipe right = paid / unpaid, swipe left = delete (with undo). */
export function ItemRow({ item, currency, readOnly, showLock, onToggle, onEdit, onDelete }: {
  item: Item;
  currency: string;
  readOnly?: boolean;
  showLock?: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className="relative overflow-hidden"
    >
      {!readOnly && (
        <>
          <motion.div style={{ opacity: paidOpacity }} className="absolute inset-0 flex items-center gap-2 bg-primary pl-5 text-sm font-semibold text-primary-foreground" aria-hidden>
            <Check className="size-5" /> {item.paid ? "Unpaid" : "Paid"}
          </motion.div>
          <motion.div style={{ opacity: delOpacity }} className="absolute inset-0 flex items-center justify-end gap-2 bg-destructive pr-5 text-sm font-semibold text-white" aria-hidden>
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
        className="relative flex items-center gap-3 bg-card px-4 py-3"
      >
        <button
          onClick={() => !readOnly && !dragged.current && onEdit()}
          disabled={readOnly}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted" >
            <Icon className="size-[18px]" />
          </span>
          <span className={cn("flex min-w-0 flex-1 items-center gap-1.5 font-medium", item.paid && "text-muted-foreground line-through")}>
            <span className="truncate">{item.name}</span>
            {showLock && item.locked && <Lock className="size-3 shrink-0 text-muted-foreground" aria-label="Fixed amount" />}
          </span>
          <span className={cn("font-semibold tabular", item.paid && "text-muted-foreground")}>{money(item.amount, currency)}</span>
        </button>
        {!readOnly && (
          <Checkbox checked={item.paid} onCheckedChange={onToggle} aria-label={`Mark ${item.name} as paid`} />
        )}
      </motion.div>
    </motion.li>
  );
}
