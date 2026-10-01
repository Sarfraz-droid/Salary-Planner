import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmountPicker } from "@/components/AmountPicker";
import { StepSummary } from "@/components/StepSummary";
import { Input } from "@/components/ui/input";
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetSection, SheetStep } from "@/components/ui/sheet";
import { money } from "@/lib/format";
import { CURRENCIES, type Plan } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  plan: Plan;
  onSave: (v: { name: string; salary: number; currency: string }, useStarter: boolean) => void;
}

export function SetupSheet({ open, onOpenChange, plan, onSave }: Props) {
  const [step, setStep] = useState(0); // 0 = salary, 1 = details
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [starter, setStarter] = useState(true);
  const fresh = plan.items.length === 0;

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setName(plan.name);
    setSalary(plan.salary ? String(plan.salary) : "");
    setCurrency(plan.currency);
    setStarter(true);
  }, [open, plan]);

  const valid = Number(salary) > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={fresh ? "Let's start" : "Salary & settings"} description={step === 0 ? "Step 1 of 2 · Monthly take-home salary" : "Step 2 of 2 · Details · stored only on this device"}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            if (step === 0) return setStep(1);
            onSave({ name: name.trim() || "My budget", salary: Number(salary), currency }, fresh && starter);
            onOpenChange(false);
          }}
        >
          <SheetBody>
            {step === 0 ? (
              <SheetStep stepKey="salary">
                <AmountPicker value={salary} onChange={setSalary} currency={currency} steps={[1000, 5000, 10000, 25000]} />
              </SheetStep>
            ) : (
              <SheetStep stepKey="details">
                <StepSummary icon={Wallet} title={money(Number(salary), currency)} subtitle="Monthly salary" onEdit={() => setStep(0)} />
                <SheetSection title="Currency">
                  <div className="flex flex-wrap gap-2">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        aria-pressed={currency === c.code}
                        onClick={() => setCurrency(c.code)}
                        className={cn(
                          "h-10 rounded-full border px-4 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                          currency === c.code ? "border-primary bg-primary text-primary-foreground" : "bg-card",
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </SheetSection>
                <SheetSection title="Budget name">
                  <Input id="pname" aria-label="Budget name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
                </SheetSection>
                {fresh && (
                  <SheetSection>
                    <button
                      type="button"
                      onClick={() => setStarter(!starter)}
                      aria-pressed={starter}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                        starter ? "border-primary bg-card" : "border-transparent bg-card",
                      )}
                    >
                      <Sparkles className="size-5" />
                      <span className="text-sm">
                        <span className="block font-semibold">Start with a 50/30/20 plan</span>
                        <span className="text-muted-foreground">Needs, wants &amp; savings pre-filled. Edit anything.</span>
                      </span>
                    </button>
                  </SheetSection>
                )}
              </SheetStep>
            )}
          </SheetBody>
          <SheetFooter>
            {step === 0 ? (
              <Button type="submit" size="lg" className="flex-1" disabled={!valid}>Next <ArrowRight /></Button>
            ) : (
              <>
                <Button type="button" variant="secondary" size="icon" aria-label="Back" onClick={() => setStep(0)}><ArrowLeft /></Button>
                <Button type="submit" size="lg" className="flex-1">{fresh ? "Create my budget" : "Save"}</Button>
              </>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
