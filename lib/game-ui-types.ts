import type { Bird } from "@/lib/types";

export type ResultState = {
  subtitle: string;
  score: number;
  total: number;
  elapsedSeconds: number;
  newBadges: string[];
  newlyUnlocked: { unlock: string; label: string }[];
  bestScore: number;
  bestTime?: number;
};

export type ToastState = {
  kind: "success" | "error" | "info";
  message: string;
};

export type MemoCard = {
  id: number;
  type: "image" | "name";
  bird: Bird;
};

export type ImpostorRound = {
  birds: Bird[];
  names: string[];
  impostorName: string;
};

export type SfxKind = "click" | "correct" | "wrong" | "finish" | "record" | "unlock" | "memo";
