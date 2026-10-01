import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmountPicker } from "@/components/AmountPicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { currencySymbol } from "@/lib/format";
import { CURRENCIES, type Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  plan: Plan;
  onSave: (v: { name: string; salary: number; currency: string }, useStarter: boolean) => void;
}

export function SetupSheet({ open, onOpenChange, plan, onSave }: Props) {
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [starter, setStarter] = useState(true);
  const fresh = plan.items.length === 0;

  useEffect(() => {
    if (!open) return;
    setName(plan.name);
    setSalary(plan.salary ? String(plan.salary) : "");
    setCurrency(plan.currency);
    setStarter(true);
  }, [open, plan]);

  const valid = Number(salary) > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={fresh ? "Let's start" : "Salary & settings"} description="Stored only on this device.">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSave({ name: name.trim() || "My budget", salary: Number(salary), currency }, fresh && starter);
            onOpenChange(false);
          }}
        >
          <div className="space-y-1">
            <Label>Monthly take-home salary</Label>
            <AmountPicker value={salary} onChange={setSalary} currency={currency} steps={[1000, 5000, 10000, 25000]} />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  aria-pressed={currency === c.code}
                  onClick={() => setCurrency(c.code)}
                  className={cn(
                    "h-9 rounded-full border px-3.5 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    currency === c.code ? "border-primary bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pname">Budget name</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </div>
          {fresh && (
            <button
              type="button"
              onClick={() => setStarter(!starter)}
              aria-pressed={starter}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                starter ? "border-primary bg-primary/5" : "border-transparent bg-card",
              )}
            >
              <Sparkles className="size-5 text-primary" />
              <span className="text-sm">
                <span className="block font-semibold">Start with a 50/30/20 plan</span>
                <span className="text-muted-foreground">Needs, wants &amp; savings pre-filled. Edit anything.</span>
              </span>
            </button>
          )}
          <div className="sticky bottom-0 -mx-5 bg-background px-5 pb-1 pt-3">
            <Button type="submit" size="lg" className="w-full" disabled={!valid}>
              {fresh ? "Create my budget" : "Save"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
