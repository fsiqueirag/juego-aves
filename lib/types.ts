export type DifficultyKey = "facil" | "medio" | "dificil" | "experto";

export type BaseMode =
  | "imagen"
  | "imagen-libre"
  | "nombre"
  | "nombre-sonido"
  | "sonido"
  | "sonido-libre";

export type GameMode = BaseMode | "aleatorio-opc" | "aleatorio-libre";

export type MiniGame = "memo" | "ordenar" | "impostor";

export type Screen =
  | "menu"
  | "difficulty-select"
  | "game"
  | "guide"
  | "minigames"
  | "memo"
  | "ordenar"
  | "impostor"
  | "results"
  | "secret";

export type ModeCell = `${GameMode}_${DifficultyKey}`;

export type Bird = {
  image: string;
  name: string;
  obra: string;
  cat: string[];
  level?: Exclude<DifficultyKey, "experto">;
};

export type BirdWithLevel = Bird & { level: Exclude<DifficultyKey, "experto"> };

export type RecordEntry = {
  bestScore?: number;
  bestTime?: number;
};

export type RecordsMap = Partial<Record<ModeCell, RecordEntry>>;

export type AudioSettings = {
  musicVolume: number;
  birdVolume: number;
  sfxVolume: number;
  musicMuted: boolean;
  birdMuted: boolean;
  sfxMuted: boolean;
  autoPlayEnabled: boolean;
};

export type UnlockRule = {
  from: string;
  pct: number;
  unlock: string;
  label: string;
};

export type RankDef = {
  min: number;
  label: string;
};
