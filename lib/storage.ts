import { getDefaultUnlocked } from "@/lib/game";
import type { AudioSettings, RecordsMap } from "@/lib/types";

export const STORAGE_KEYS = {
  unlocked: "avesUnlocked5",
  records: "avesRecords5",
  settings: "avesSettings1",
} as const;

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  musicVolume: 0.5,
  birdVolume: 0.5,
  sfxVolume: 0.5,
  musicMuted: false,
  birdMuted: false,
  sfxMuted: false,
  autoPlayEnabled: false,
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadUnlocked(): Set<string> {
  if (typeof window === "undefined") return getDefaultUnlocked();
  const parsed = safeParse<string[] | null>(window.localStorage.getItem(STORAGE_KEYS.unlocked), null);
  return parsed ? new Set(parsed) : getDefaultUnlocked();
}

export function saveUnlocked(unlocked: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.unlocked, JSON.stringify([...unlocked]));
}

export function loadRecords(): RecordsMap {
  if (typeof window === "undefined") return {};
  return safeParse<RecordsMap>(window.localStorage.getItem(STORAGE_KEYS.records), {});
}

export function saveRecords(records: RecordsMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
}

export function loadAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return DEFAULT_AUDIO_SETTINGS;
  const raw = safeParse<Partial<AudioSettings>>(window.localStorage.getItem(STORAGE_KEYS.settings), {});
  return { ...DEFAULT_AUDIO_SETTINGS, ...raw };
}

export function saveAudioSettings(settings: AudioSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}
