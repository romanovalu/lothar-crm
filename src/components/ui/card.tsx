import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn("rounded-lg border border-neutral-200 bg-white p-5 shadow-panel", className)}
      {...props}
    />
  );
}
