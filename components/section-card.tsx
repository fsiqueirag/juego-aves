import type { ReactNode } from "react";
import { cn } from "@/lib/ui";

export function SectionCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-gentle-pop rounded-[28px] border border-emerald-200/80 bg-white/90 p-5 shadow-[0_24px_80px_-32px_rgba(16,60,31,0.45)] backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}
