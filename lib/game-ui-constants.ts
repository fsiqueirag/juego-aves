import type { DifficultyKey, GameMode } from "@/lib/types";

export const DIFFICULTIES: DifficultyKey[] = ["facil", "medio", "dificil", "experto"];

export const DB_BADGE: Record<DifficultyKey, string> = {
  facil: "🟢 Fácil",
  medio: "🔵 Medio",
  dificil: "🔴 Difícil",
  experto: "🟣 Experto",
};

export const GROUP_MODES: Record<string, GameMode[]> = {
  imagen: ["imagen", "imagen-libre"],
  nombre: ["nombre", "nombre-sonido"],
  sonido: ["sonido", "sonido-libre"],
  aleatorio: ["aleatorio-opc", "aleatorio-libre"],
};

export const MUSIC_TRACKS = ["/sonidos/musicamenu1.mp3", "/sonidos/musicamenu2.mp3", "/sonidos/musicamenu3.mp3"];
