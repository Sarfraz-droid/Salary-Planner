import { motion } from "motion/react";
import type { BucketId } from "@/lib/types";

const COLORS: Record<BucketId, string> = {
  needs: "var(--needs)",
  wants: "var(--wants)",
  savings: "var(--savings)",
};

interface Props {
  salary: number;
  byBucket: Record<BucketId, number>;
  children?: React.ReactNode;
}

/** Budget donut. Segments are scaled to the salary; the muted gap is unallocated money. */
export function Donut({ salary, byBucket, children }: Props) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const planned = byBucket.needs + byBucket.wants + byBucket.savings;
  const base = Math.max(salary, planned, 1);
  let offset = 0;
  return (
    <div className="relative size-44 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label="Budget split">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="14" />
        {(["needs", "wants", "savings"] as BucketId[]).map((id) => {
          const len = (byBucket[id] / base) * c;
          if (len <= 0) return null;
          const el = (
            <motion.circle
              key={id}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={COLORS[id]}
              strokeWidth="14"
              strokeLinecap="butt"
              initial={{ strokeDasharray: `0 ${c}`, strokeDashoffset: -offset }}
              animate={{ strokeDasharray: `${Math.max(len - 2, 0)} ${c}`, strokeDashoffset: -offset }}
              transition={{ type: "spring", stiffness: 90, damping: 20 }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
