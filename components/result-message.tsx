import type { ReactNode } from "react";
import { cn } from "@/lib/ui";

export function ResultMessage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const text = typeof children === "string" ? children : "";
  return <p className={cn("min-h-6 font-semibold", text.includes("❌") ? "text-rose-700" : "text-emerald-700", className)}>{children}</p>;
}
