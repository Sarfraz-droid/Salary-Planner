import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

export function Toast({ message, onUndo, onDone }: { message: string | null; onUndo: () => void; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-full bg-foreground py-2 pl-5 pr-2 text-sm text-background shadow-xl"
          role="status"
        >
          <span className="truncate">{message}</span>
          <button onClick={onUndo} className="h-8 shrink-0 rounded-full bg-background/15 px-4 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-background">Undo</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
