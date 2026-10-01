/** Compact recap of step 1, shown at the top of step 2 with a way back to edit. */
export function StepSummary({ icon: Icon, title, subtitle, onEdit }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 pr-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted"><Icon className="size-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <button type="button" onClick={onEdit} className="rounded-full px-3 py-1.5 text-sm font-semibold underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40">
        Edit
      </button>
    </div>
  );
}
