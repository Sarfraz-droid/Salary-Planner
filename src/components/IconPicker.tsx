import { cn } from "@/lib/utils";

export type IconDefs = Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }>;

/** Round button showing the current icon; sits beside a name field. */
export function IconToggle({ defs, shown, open, onToggle }: { defs: IconDefs; shown: string; open: boolean; onToggle: () => void }) {
  const Current = defs[shown].icon;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`Icon: ${defs[shown].label}. Tap to change`}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
        open ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
      )}
    >
      <Current className="size-5" />
    </button>
  );
}

export function IconGrid({ defs, shown, onPick }: { defs: IconDefs; shown: string; onPick: (k: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2 rounded-2xl bg-card p-3">
      {Object.entries(defs).map(([key, d]) => (
        <button
          key={key}
          type="button"
          title={d.label}
          aria-label={d.label}
          aria-pressed={shown === key}
          onClick={() => onPick(key)}
          className={cn(
            "grid aspect-square place-items-center rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
            shown === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <d.icon className="size-5" />
        </button>
      ))}
    </div>
  );
}
