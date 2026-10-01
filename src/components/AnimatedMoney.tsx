import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { money } from "@/lib/format";

/** Counts smoothly from the previous value to the new one. */
export function AnimatedMoney({ value, currency, compact }: { value: number; currency: string; compact?: boolean }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduce) { setShown(value); from.current = value; return; }
    const controls = animate(from.current, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { from.current = v; setShown(Math.round(v)); },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return <>{money(shown, currency, compact)}</>;
}
