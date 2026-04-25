import { ALE_LIB_HINT, ALE_OPC_HINT, TOTAL_STARS, UNLOCK_HINTS, databases } from "@/lib/data";
import { formatTime, pctTone } from "@/lib/game";
import type { DifficultyKey, ModeCell, RecordsMap } from "@/lib/types";
import { DB_BADGE, DIFFICULTIES } from "@/lib/game-ui-constants";
import { Button } from "@/components/button";
import { SectionCard } from "@/components/section-card";
import { cn, toneClasses } from "@/lib/ui";

const RECORD_GROUPS = [
  { title: "🖼️ Por Imagen", modes: [["imagen", "Opciones"], ["imagen-libre", "Escribir"]] },
  { title: "🔤 Por Nombre", modes: [["nombre", "Imagen"], ["nombre-sonido", "Sonido"]] },
  { title: "🎧 Por Sonido", modes: [["sonido", "Opciones"], ["sonido-libre", "Escribir"]] },
  { title: "🎲 Aleatorio — Con Opciones", modes: [["aleatorio-opc", "Con opciones"]] },
  { title: "🎲 Aleatorio — Sin Opciones", modes: [["aleatorio-libre", "Sin opciones"]] },
] as const;

type RecordsModalProps = {
  rankLabel: string;
  overallPct: number;
  starCount: number;
  unlocked: Set<string>;
  records: RecordsMap;
  onClose: () => void;
};

export function RecordsModal({ rankLabel, overallPct, starCount, unlocked, records, onClose }: RecordsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <SectionCard className="max-h-[82vh] w-full max-w-2xl overflow-y-auto p-6">
        <div className="cursor-default" onClick={(event) => event.stopPropagation()}>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-emerald-900">📊 Mis Récords</h2>
            <p className="text-sm text-zinc-500">
              Rango: {rankLabel} · {overallPct}% · ⭐ {starCount}/{TOTAL_STARS}
            </p>
          </div>
          <div className="space-y-5">
            {RECORD_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="mb-2 border-b border-emerald-100 pb-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                  {group.title}
                </div>
                <div className="space-y-2">
                  {group.modes.flatMap(([mode, label]) =>
                    DIFFICULTIES.map((db) => (
                      <RecordRow key={`${mode}_${db}`} mode={mode} label={label} db={db} unlocked={unlocked} records={records} />
                    )),
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-6 w-full rounded-2xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function RecordRow({
  mode,
  label,
  db,
  unlocked,
  records,
}: {
  mode: string;
  label: string;
  db: DifficultyKey;
  unlocked: Set<string>;
  records: RecordsMap;
}) {
  const cell = `${mode}_${db}`;
  const unlockedCell = unlocked.has(cell);
  const record = records[cell as ModeCell];
  const total = databases[db].length;
  const pct = record?.bestScore !== undefined ? Math.round((record.bestScore / total) * 100) : 0;
  const hint =
    mode === "aleatorio-opc"
      ? `${ALE_OPC_HINT} ${DB_BADGE[db].split(" ")[0]}`
      : mode === "aleatorio-libre"
        ? `${ALE_LIB_HINT} ${DB_BADGE[db].split(" ")[0]}`
        : UNLOCK_HINTS[cell] ?? "Bloqueado";

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-100 px-4 py-3 text-sm">
      <span className="text-zinc-700">
        {label} {DB_BADGE[db].split(" ")[0]} {!unlockedCell ? "🔒" : ""}
      </span>
      {!unlockedCell ? (
        <span className="text-right text-xs text-zinc-400">{hint}</span>
      ) : !record?.bestScore && record?.bestScore !== 0 ? (
        <span className="text-zinc-400">Sin jugar</span>
      ) : (
        <span className={cn("font-semibold", toneClasses(pctTone(pct)))}>
          {pct === 100 ? "⭐ " : ""}
          {record?.bestScore}/{total} · {pct}%
          {record?.bestTime !== undefined ? ` · ⏱ ${formatTime(record.bestTime)}` : ""}
        </span>
      )}
    </div>
  );
}
