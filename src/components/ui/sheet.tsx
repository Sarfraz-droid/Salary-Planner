import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, useDragControls } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Bottom sheet built on Radix Dialog. Drag the handle or header down to dismiss. */
const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetContent({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { title: string; description?: string }) {
  const controls = useDragControls();
  const closeRef = React.useRef<HTMLButtonElement>(null);

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content asChild {...props}>
        <motion.div
          drag="y"
          dragControls={controls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 600) closeRef.current?.click();
          }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg rounded-t-[1.75rem] border-t bg-background px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom duration-300 max-h-[90dvh] overflow-y-auto shadow-2xl",
            className,
          )}
        >
          {/* Drag zone: handle + header */}
          <div
            onPointerDown={(e) => controls.start(e)}
            className="-mx-5 cursor-grab touch-none px-5 pt-3 active:cursor-grabbing"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <DialogPrimitive.Title className="font-display text-2xl font-bold">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className={cn("mt-1 text-sm text-muted-foreground", !description && "sr-only")}>
                  {description ?? title}
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                ref={closeRef}
                onPointerDown={(e) => e.stopPropagation()}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          </div>
          {children}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
