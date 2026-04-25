import { ALE_LIB_HINT, ALE_OPC_HINT, UNLOCK_HINTS } from "@/lib/data";
import { getGroupPct, getSubModePct, helperText, pctTone } from "@/lib/game";
import type { GameMode, RecordsMap } from "@/lib/types";
import { DIFFICULTIES, GROUP_MODES } from "@/lib/game-ui-constants";
import { Button } from "@/components/button";
import { SectionCard } from "@/components/section-card";
import { cn, toneClasses } from "@/lib/ui";

type MenuScreenProps = {
  rankLabel: string;
  overallPct: number;
  starCount: number;
  records: RecordsMap;
  unlocked: Set<string>;
  onRecordsOpen: () => void;
  onModeOpen: (mode: GameMode) => void;
  onGuideOpen: () => void;
  onMiniGamesOpen: () => void;
  onSecretOpen: () => void;
};

export function MenuScreen({
  rankLabel,
  overallPct,
  starCount,
  records,
  unlocked,
  onRecordsOpen,
  onModeOpen,
  onGuideOpen,
  onMiniGamesOpen,
  onSecretOpen,
}: MenuScreenProps) {
  return (
    <SectionCard className="mx-auto w-full max-w-3xl p-6 sm:p-8">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.38em] text-emerald-700/70">Entrenamiento ornitológico</p>
        <h1 className="text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">🐦 Adiviná el Ave</h1>
        <p className="mt-3 text-sm text-zinc-600">Entrenamiento de identificación de aves argentinas</p>
      </div>

      <Button className="mb-6 w-full rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50" onClick={onRecordsOpen}>
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-zinc-700">Progreso total</div>
            <div className="text-xs italic text-zinc-500">{rankLabel}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-amber-600">⭐ {starCount}/{helperText.totalStars}</div>
            <div className={cn("text-lg font-bold", toneClasses(pctTone(overallPct)))}>{overallPct}%</div>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="mt-2 text-right text-xs text-zinc-400">Tocá para ver tus récords →</div>
      </Button>

      <div className="space-y-4">
        {Object.entries(GROUP_MODES).map(([groupKey, modes]) => (
          <ModeGroup key={groupKey} groupKey={groupKey} modes={modes} records={records} unlocked={unlocked} onModeOpen={onModeOpen} />
        ))}

        <MenuAction icon="📖" title="Guía de Aves" description="Explorá todas las aves con sus nombres, nombres científicos y cantos." onClick={onGuideOpen} />
        <MenuAction
          icon="🎮"
          title="Minijuegos"
          description="Memotest, Ordenar y Encontrá al Impostor. Para practicar sin presión."
          onClick={onMiniGamesOpen}
          className="border-fuchsia-200 bg-fuchsia-50 hover:border-fuchsia-300 hover:bg-fuchsia-100/70"
          titleClassName="text-fuchsia-900"
        />

        <Button
          disabled={overallPct < 100}
          className={cn(
            "flex w-full items-center gap-4 rounded-[24px] border px-5 py-4 text-left transition",
            overallPct >= 100
              ? "border-amber-300 bg-amber-50 hover:-translate-y-0.5 hover:bg-amber-100/70"
              : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-500",
          )}
          onClick={onSecretOpen}
        >
          <div className="text-3xl">{overallPct >= 100 ? "🎉" : "🔒"}</div>
          <div>
            <div className="font-semibold">Mensaje Secreto</div>
            <div className="text-sm text-zinc-500">
              {overallPct >= 100 ? "¡Felicitaciones! Hacé clic para leer tu mensaje." : "Completá el 100% del juego para desbloquearlo."}
            </div>
          </div>
        </Button>
      </div>

      <div className="mt-6 border-t border-emerald-100 pt-5 text-center text-sm text-zinc-500">
        <strong className="text-zinc-700">Hecho por Emanuel Juliá</strong>
        <br />
        Compositor · Director Coral
      </div>
    </SectionCard>
  );
}

function ModeGroup({
  groupKey,
  modes,
  records,
  unlocked,
  onModeOpen,
}: {
  groupKey: string;
  modes: GameMode[];
  records: RecordsMap;
  unlocked: Set<string>;
  onModeOpen: (mode: GameMode) => void;
}) {
  const cells = modes.flatMap((mode) => DIFFICULTIES.filter((db) => unlocked.has(`${mode}_${db}`)).map((db) => `${mode}_${db}`));
  const avgPct = getGroupPct(records, cells);
  const groupLocked = cells.length === 0;
  const title = groupKey === "imagen" ? "🖼️ Por Imagen" : groupKey === "nombre" ? "🔤 Por Nombre" : groupKey === "sonido" ? "🎧 Por Sonido" : "🎲 Aleatorio";

  return (
    <div className={cn("overflow-hidden rounded-[24px] border", groupLocked ? "border-zinc-200 bg-zinc-100/70" : "border-emerald-200 bg-emerald-50/50")}>
      <div className="flex items-center justify-between gap-4 border-b border-black/5 px-5 py-4">
        <div className="text-sm font-semibold text-zinc-800">{title}</div>
        <div className={cn("text-sm font-semibold", groupLocked ? "text-zinc-400" : toneClasses(pctTone(avgPct)))}>
          {groupLocked ? "🔒 Bloqueado" : `Progreso ${avgPct}%`}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-px bg-black/5 sm:grid-cols-2">
        {modes.map((mode) => (
          <ModeButton key={mode} mode={mode} records={records} unlocked={unlocked} onModeOpen={onModeOpen} />
        ))}
      </div>
    </div>
  );
}

function ModeButton({
  mode,
  records,
  unlocked,
  onModeOpen,
}: {
  mode: GameMode;
  records: RecordsMap;
  unlocked: Set<string>;
  onModeOpen: (mode: GameMode) => void;
}) {
  const modeUnlocked = DIFFICULTIES.some((db) => unlocked.has(`${mode}_${db}`));
  const subPct = getSubModePct(records, unlocked, mode);
  const label =
    mode === "imagen"
      ? ["🔘", "Opciones", "Elegí entre 4 nombres"]
      : mode === "imagen-libre"
        ? ["✏️", "Escribir", "Escribí el nombre vos"]
        : mode === "nombre"
          ? ["🖼️", "Imagen", "Elegí la foto correcta"]
          : mode === "nombre-sonido"
            ? ["🔊", "Sonido", "Elegí el canto correcto"]
            : mode === "sonido"
              ? ["🔘", "Opciones", "Elegí entre 4 nombres"]
              : mode === "sonido-libre"
                ? ["✏️", "Escribir", "Escribí el nombre vos"]
                : mode === "aleatorio-opc"
                  ? ["🎲", "Con opciones", "Imagen, nombre o sonido al azar"]
                  : ["🎲", "Sin opciones", "Escritura o canto al azar"];

  const hint = mode === "aleatorio-opc" ? ALE_OPC_HINT : mode === "aleatorio-libre" ? ALE_LIB_HINT : UNLOCK_HINTS[`${mode}_facil`] ?? "Bloqueado";

  return (
    <Button
      disabled={!modeUnlocked}
      onClick={() => onModeOpen(mode)}
      className={cn("bg-white px-5 py-4 text-left transition", modeUnlocked ? "hover:bg-emerald-50" : "cursor-not-allowed bg-zinc-100 text-zinc-400")}
    >
      <div className="text-lg">{label[0]}</div>
      <div className="mt-1 text-sm font-semibold">{label[1]}</div>
      <div className="text-xs text-zinc-500">{label[2]}</div>
      <div className={cn("mt-3 text-xs font-semibold", modeUnlocked ? toneClasses(pctTone(subPct)) : "text-zinc-400")}>
        {modeUnlocked ? `${subPct}%${subPct === 100 ? " ⭐" : ""}` : `🔒 ${hint}`}
      </div>
    </Button>
  );
}

function MenuAction({
  icon,
  title,
  description,
  onClick,
  className,
  titleClassName,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <Button
      className={cn("flex w-full items-center gap-4 rounded-[24px] border border-emerald-200 bg-white px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50", className)}
      onClick={onClick}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <div className={cn("font-semibold text-zinc-900", titleClassName)}>{title}</div>
        <div className="text-sm text-zinc-500">{description}</div>
      </div>
    </Button>
  );
}
