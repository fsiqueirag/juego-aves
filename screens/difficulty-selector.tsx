import { UNLOCK_HINTS, databases } from "@/lib/data";
import { formatTime, getBestPct, getDbMeta, getModeTitle, helperText, pctTone } from "@/lib/game";
import type { DifficultyKey, GameMode, ModeCell, RecordsMap } from "@/lib/types";
import { DIFFICULTIES } from "@/lib/game-ui-constants";
import { Button } from "@/components/button";
import { SectionCard } from "@/components/section-card";
import { cn, toneClasses } from "@/lib/ui";

type DifficultySelectorProps = {
  pendingMode: GameMode | null;
  unlocked: Set<string>;
  records: RecordsMap;
  onBack: () => void;
  onStart: (mode: GameMode, db: DifficultyKey) => void;
};

export function DifficultySelector({ pendingMode, unlocked, records, onBack, onStart }: DifficultySelectorProps) {
  if (!pendingMode) return null;

  return (
    <SectionCard className="mx-auto w-full max-w-2xl p-6 sm:p-8">
      <Button className="mb-5 text-sm font-semibold text-emerald-700" onClick={onBack}>
        ← Volver al menú
      </Button>
      <h2 className="text-3xl font-bold text-emerald-950">🗂️ Elegí la dificultad</h2>
      <p className="mt-2 text-sm text-zinc-500">Modo: {getModeTitle(pendingMode)}</p>
      <div className="mt-6 space-y-3">
        {DIFFICULTIES.map((db) => (
          <DifficultyOption key={db} db={db} pendingMode={pendingMode} unlocked={unlocked} records={records} onStart={onStart} />
        ))}
      </div>
    </SectionCard>
  );
}

function DifficultyOption({
  db,
  pendingMode,
  unlocked,
  records,
  onStart,
}: {
  db: DifficultyKey;
  pendingMode: GameMode;
  unlocked: Set<string>;
  records: RecordsMap;
  onStart: (mode: GameMode, db: DifficultyKey) => void;
}) {
  const meta = getDbMeta(db);
  const cell = `${pendingMode}_${db}`;
  const locked = !unlocked.has(cell);
  const pct = getBestPct(records, cell);
  const record = records[cell as ModeCell];
  const hint = pendingMode === "aleatorio-opc" ? helperText.aleOpc : pendingMode === "aleatorio-libre" ? helperText.aleLib : UNLOCK_HINTS[cell] ?? "";

  return (
    <Button
      disabled={locked}
      onClick={() => onStart(pendingMode, db)}
      className={cn(
        "w-full rounded-[24px] border px-5 py-5 text-left transition",
        locked ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-500" : "border-emerald-200 bg-emerald-50/50 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50",
      )}
    >
      <div className="mb-2 inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
        {locked ? "🔒 Bloqueado" : `${meta.emoji} ${db[0].toUpperCase()}${db.slice(1)}`}
      </div>
      <div className="text-lg font-semibold text-zinc-900">{meta.title}</div>
      <div className="mt-1 text-sm text-zinc-500">{meta.desc}</div>
      <div className="mt-3 text-xs text-zinc-500">
        {databases[db].length} aves ·{" "}
        {locked ? (
          <span className="text-zinc-400">Nivel bloqueado</span>
        ) : (
          <span className={cn("font-semibold", toneClasses(pctTone(pct)))}>
            {pct}%{pct === 100 ? " ⭐" : ""}
            {record?.bestTime !== undefined ? ` · ⏱ ${formatTime(record.bestTime)}` : ""}
          </span>
        )}
      </div>
      {locked && hint ? <div className="mt-2 text-xs font-medium text-orange-600">📌 {hint}</div> : null}
    </Button>
  );
}
