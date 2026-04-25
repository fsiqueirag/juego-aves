import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/ui";

export function Button({ className, type = "button", ...props }: ComponentPropsWithoutRef<"button">) {
  return <button type={type} className={cn("cursor-pointer disabled:cursor-not-allowed", className)} {...props} />;
}
