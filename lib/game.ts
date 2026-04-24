import {
  ALE_LIB_HINT,
  ALE_OPC_HINT,
  ALL_DBS,
  ALL_GAME_MODES,
  databases,
  DEFAULT_UNLOCKED,
  RANKS,
  TOTAL_STARS,
  UNLOCK_RULES,
} from "@/lib/data";
import type { Bird, DifficultyKey, GameMode, ModeCell, RecordEntry, RecordsMap } from "@/lib/types";

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getRankLabel(pct: number): string {
  let rank = RANKS[0];
  for (const current of RANKS) {
    if (pct >= current.min) rank = current;
  }
  return rank.label;
}

export function getSoundFile(imagePath: string): string {
  const file = imagePath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
  const isEasyBucket = imagePath.includes("/facil/") || imagePath.includes("/medio/");
  return `${isEasyBucket ? "/sonidos/facil" : "/sonidos"}/${file}.mp3`;
}

export function getBestPct(records: RecordsMap, modeKey: string): number {
  const record = records[modeKey as ModeCell];
  if (!record || record.bestScore === undefined) return 0;
  const parts = modeKey.split("_");
  const db = parts.at(-1) as DifficultyKey;
  const total = databases[db]?.length ?? 1;
  return Math.round((record.bestScore / total) * 100);
}

export function getGroupPct(records: RecordsMap, cells: string[]): number {
  if (!cells.length) return 0;
  const values = cells.map((cell) => getBestPct(records, cell));
  return Math.floor(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function getSubModePct(records: RecordsMap, unlocked: Set<string>, mode: string): number {
  const cells = ALL_DBS.filter((db) => unlocked.has(`${mode}_${db}`)).map((db) => `${mode}_${db}`);
  if (!cells.length) return 0;
  const values = cells.map((cell) => getBestPct(records, cell));
  return Math.floor(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function getOverallPct(records: RecordsMap): number {
  let sum = 0;
  let count = 0;
  for (const mode of ALL_GAME_MODES) {
    for (const db of ALL_DBS) {
      sum += getBestPct(records, `${mode}_${db}`);
      count += 1;
    }
  }
  return count ? Math.floor(sum / count) : 0;
}

export function countStars(records: RecordsMap): number {
  let earned = 0;
  for (const mode of ALL_GAME_MODES) {
    for (const db of ALL_DBS) {
      const record = records[`${mode}_${db}`];
      if (record?.bestScore !== undefined && record.bestScore >= databases[db].length) earned += 1;
    }
  }
  return earned;
}

export function pctTone(pct: number): "low" | "mid" | "high" {
  if (pct >= 70) return "high";
  if (pct >= 50) return "mid";
  return "low";
}

export function getDefaultUnlocked(): Set<string> {
  return new Set(DEFAULT_UNLOCKED);
}

export function checkUnlocks(modeKey: string, scorePct: number, currentUnlocked: Set<string>) {
  const unlocked = new Set(currentUnlocked);
  const newlyUnlocked: { unlock: string; label: string }[] = [];

  for (const rule of UNLOCK_RULES) {
    if (rule.from === modeKey && scorePct >= rule.pct && !unlocked.has(rule.unlock)) {
      unlocked.add(rule.unlock);
      if (rule.label) newlyUnlocked.push({ unlock: rule.unlock, label: rule.label });
    }
  }

  const aleOpcLevels = [
    { db: "facil", flags: ["_aleopc_img_ok", "_aleopc_nom_ok", "_aleopc_snd_ok"], label: "Aleatorio Con Opciones 🟢 Fácil" },
    { db: "medio", flags: ["_aleopc_img_med_ok", "_aleopc_nom_med_ok", "_aleopc_snd_med_ok"], label: "Aleatorio Con Opciones 🔵 Medio" },
    { db: "dificil", flags: ["_aleopc_img_dif_ok", "_aleopc_nom_dif_ok", "_aleopc_snd_dif_ok"], label: "Aleatorio Con Opciones 🔴 Difícil" },
    { db: "experto", flags: ["_aleopc_img_exp_ok", "_aleopc_nom_exp_ok", "_aleopc_snd_exp_ok"], label: "Aleatorio Con Opciones 🟣 Experto" },
  ] as const;

  const aleLibLevels = [
    { db: "facil", flags: ["_alelib_img_ok", "_alelib_nom_ok", "_alelib_snd_ok"], label: "Aleatorio Sin Opciones 🟢 Fácil" },
    { db: "medio", flags: ["_alelib_img_med_ok", "_alelib_nom_med_ok", "_alelib_snd_med_ok"], label: "Aleatorio Sin Opciones 🔵 Medio" },
    { db: "dificil", flags: ["_alelib_img_dif_ok", "_alelib_nom_dif_ok", "_alelib_snd_dif_ok"], label: "Aleatorio Sin Opciones 🔴 Difícil" },
    { db: "experto", flags: ["_alelib_img_exp_ok", "_alelib_nom_exp_ok", "_alelib_snd_exp_ok"], label: "Aleatorio Sin Opciones 🟣 Experto" },
  ] as const;

  for (const level of aleOpcLevels) {
    const cell = `aleatorio-opc_${level.db}`;
    if (!unlocked.has(cell) && level.flags.every((flag) => unlocked.has(flag))) {
      unlocked.add(cell);
      newlyUnlocked.push({ unlock: cell, label: level.label });
    }
  }

  for (const level of aleLibLevels) {
    const cell = `aleatorio-libre_${level.db}`;
    if (!unlocked.has(cell) && level.flags.every((flag) => unlocked.has(flag))) {
      unlocked.add(cell);
      newlyUnlocked.push({ unlock: cell, label: level.label });
    }
  }

  return { unlocked, newlyUnlocked };
}

export function pickAleatorioSubMode(mode: GameMode) {
  const optionModes = ["imagen", "nombre", "sonido"] as const;
  const freeModes = ["imagen-libre", "nombre-sonido", "sonido-libre"] as const;
  const pool = mode === "aleatorio-libre" ? freeModes : optionModes;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function updateRecord(records: RecordsMap, modeKey: ModeCell, score: number, elapsedSeconds: number): {
  nextRecords: RecordsMap;
  isNewScore: boolean;
  isNewTime: boolean;
  entry: RecordEntry;
} {
  const current = records[modeKey] ?? {};
  const previousScore = current.bestScore ?? -1;
  const previousTime = current.bestTime ?? Number.POSITIVE_INFINITY;
  const isNewScore = score > previousScore;
  const isNewTime = elapsedSeconds < previousTime;
  const entry: RecordEntry = {
    bestScore: Math.max(score, previousScore < 0 ? 0 : previousScore),
    bestTime: isNewTime ? elapsedSeconds : current.bestTime,
  };
  return {
    nextRecords: { ...records, [modeKey]: entry },
    isNewScore,
    isNewTime,
    entry,
  };
}

export const helperText = {
  aleOpc: ALE_OPC_HINT,
  aleLib: ALE_LIB_HINT,
  totalStars: TOTAL_STARS,
};

export function getDbMeta(db: DifficultyKey) {
  if (db === "facil") return { emoji: "🟢", title: "Aves Muy Comunes", desc: "Benteveo, Hornero, Gorrión, Calandria y otras aves del día a día." };
  if (db === "medio") return { emoji: "🔵", title: "Aves Conocidas", desc: "Carancho, Cotorra, Lechuza vizcachera, patos y otras aves reconocibles." };
  if (db === "dificil") return { emoji: "🔴", title: "Aves Desafiantes", desc: "Sirirí pampa, Atajacaminos, Hocó colorado y otras especies poco conocidas." };
  return { emoji: "🟣", title: "Experto — Todas las aves", desc: `¡Las ${databases.experto.length} aves juntas! Necesitás 70% en Difícil del mismo modo.` };
}

export function getModeTitle(mode: GameMode): string {
  return {
    imagen: "🖼️ Por Imagen — Opciones",
    "imagen-libre": "✏️ Por Imagen — Escribir",
    nombre: "🔤 Por Nombre — Imagen",
    "nombre-sonido": "🔊 Por Nombre — Sonido",
    sonido: "🎧 Por Sonido — Opciones",
    "sonido-libre": "🎤 Por Sonido — Escribir",
    "aleatorio-opc": "🎲 Aleatorio — Con Opciones",
    "aleatorio-libre": "🎲 Aleatorio — Sin Opciones",
  }[mode];
}

export function makeOptions(question: Bird, pool: Bird[], pick: "name" | "bird", count = 4) {
  if (pick === "name") {
    return shuffle([
      question.name,
      ...shuffle(pool.filter((bird) => bird.name !== question.name).map((bird) => bird.name)).slice(0, count - 1),
    ]);
  }
  return shuffle([question, ...shuffle(pool.filter((bird) => bird.image !== question.image)).slice(0, count - 1)]);
}
