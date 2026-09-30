import { useCallback, useEffect, useState } from "react";
import { emptyPlan, sanitize } from "./plan";
import type { Plan } from "./types";

const KEY = "gareeb-budget:v1";

function load(): Plan {
  try {
    const raw = localStorage.getItem(KEY);
    return (raw && sanitize(JSON.parse(raw))) || emptyPlan();
  } catch {
    return emptyPlan();
  }
}

export function usePlan() {
  const [plan, setPlan] = useState<Plan>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(plan));
    } catch {
      /* storage full or blocked — app keeps working in memory */
    }
  }, [plan]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === KEY && setPlan(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (p: Plan) => Plan) => setPlan(fn), []);
  return { plan, setPlan, update };
}
