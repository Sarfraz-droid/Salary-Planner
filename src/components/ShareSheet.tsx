import { useMemo, useState } from "react";
import { Check, Copy, Lock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { buildShareUrl } from "@/lib/share";
import type { Plan } from "@/lib/types";

export function ShareSheet({ open, onOpenChange, plan }: { open: boolean; onOpenChange: (o: boolean) => void; plan: Plan }) {
  const url = useMemo(() => (open ? buildShareUrl(plan) : ""), [open, plan]);
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Share budget" description="Anyone with the link sees a read-only copy.">
        <div className="space-y-4">
          <div className="flex gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <p>
              The budget is packed inside the link itself. No account, no server — nothing is uploaded.
              Anyone you send it to gets a snapshot; later edits won't change it.
            </p>
          </div>
          <p className="line-clamp-2 break-all rounded-xl border bg-card p-3 font-mono text-xs text-muted-foreground">{url}</p>
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" className="flex-1" onClick={copy}>
              {copied ? <Check /> : <Copy />} {copied ? "Copied!" : "Copy link"}
            </Button>
            {canShare && (
              <Button size="lg" className="flex-1" onClick={() => navigator.share({ title: plan.name, text: `My budget: ${plan.name}`, url }).catch(() => {})}>
                <Share2 /> Share
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
