import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Check, Copy, ImageDown, Lock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { buildShareUrl } from "@/lib/share";
import { SharePreview } from "@/components/SharePreview";
import type { Plan } from "@/lib/types";

export function ShareSheet({ open, onOpenChange, plan }: { open: boolean; onOpenChange: (o: boolean) => void; plan: Plan }) {
  const url = useMemo(() => (open ? buildShareUrl(plan) : ""), [open, plan]);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
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

  async function saveImage() {
    if (!cardRef.current) return;
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--primary");
    const png = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true, backgroundColor: bg || undefined });
    const a = document.createElement("a");
    a.href = png;
    a.download = `${plan.name.replace(/\W+/g, "-").toLowerCase() || "budget"}.png`;
    a.click();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Share budget" description="Anyone with the link sees a read-only copy.">
        <div className="space-y-4">
          <SharePreview ref={cardRef} plan={plan} />
          <div className="flex gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <p>
              The budget is packed inside the link itself. No account, no server — nothing is uploaded.
              Anyone you send it to gets a snapshot; later edits won't change it.
            </p>
          </div>
          <p className="line-clamp-2 break-all rounded-xl border bg-card p-3 font-mono text-xs text-muted-foreground">{url}</p>
          <Button variant="outline" size="lg" className="w-full" onClick={() => saveImage().catch(() => {})}>
            <ImageDown /> Save as image
          </Button>
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
