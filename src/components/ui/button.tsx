import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "ghost" | "outline";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-lothar-yellow focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-lothar-yellow text-lothar-black hover:bg-[#e5c51e]",
        variant === "dark" && "bg-lothar-black text-white hover:bg-black",
        variant === "ghost" && "bg-transparent text-neutral-700 hover:bg-neutral-100",
        variant === "outline" && "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
        className
      )}
      {...props}
    />
  );
}
