export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function toneClasses(tone: "low" | "mid" | "high") {
  if (tone === "high") return "text-emerald-700";
  if (tone === "mid") return "text-orange-600";
  return "text-zinc-600";
}
