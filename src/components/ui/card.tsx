import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-xl border bg-card text-card-foreground shadow-[0_1px_0_0_rgb(0_0_0/0.03),0_8px_24px_-16px_rgb(0_0_0/0.18)]", className)}
      {...props}
    />
  );
}

export { Card };
