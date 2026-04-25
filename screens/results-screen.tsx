import { formatTime } from "@/lib/game";
import type { ResultState } from "@/lib/game-ui-types";
import { Button } from "@/components/button";
import { SectionCard } from "@/components/section-card";

type ResultsScreenProps = {
  resultState: ResultState | null;
  onRestart: () => void;
  onMenu: () => void;
};

export function ResultsScreen({ resultState, onRestart, onMenu }: ResultsScreenProps) {
  if (!resultState) return null;

  return (
    <SectionCard className="mx-auto w-full max-w-3xl p-8 text-center">
      <h2 className="text-4xl font-bold text-zinc-900">¡Fin del juego!</h2>
      <p className="mt-2 text-sm text-zinc-500">{resultState.subtitle}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <ResultStat label="Aciertos" value={resultState.score} helper={`de ${resultState.total}`} />
        <ResultStat label="Tiempo" value={formatTime(resultState.elapsedSeconds)} helper="min : seg" />
      </div>
      <div className="mt-6 space-y-2">
        {resultState.newlyUnlocked.map((item) => (
          <div key={item.unlock} className="rounded-[18px] border border-emerald-300 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
            🔓 ¡Nuevo desbloqueado: {item.label}!
          </div>
        ))}
        {resultState.newBadges.map((badge) => (
          <div key={badge} className="rounded-[18px] border border-amber-300 bg-amber-50 px-4 py-3 font-semibold text-orange-700">
            {badge}
          </div>
        ))}
      </div>
      <div className="mt-5 text-sm text-zinc-500">
        Mejor puntaje: <span className="font-semibold text-zinc-700">{resultState.bestScore} / {resultState.total}</span>
        {resultState.bestTime !== undefined ? (
          <>
            {" "}
            | Mejor tiempo: <span className="font-semibold text-zinc-700">{formatTime(resultState.bestTime)}</span>
          </>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button className="rounded-[18px] bg-emerald-700 px-5 py-3 font-semibold text-white" onClick={onRestart}>
          Jugar de nuevo
        </Button>
        <Button className="rounded-[18px] border-2 border-emerald-700 px-5 py-3 font-semibold text-emerald-700" onClick={onMenu}>
          Cambiar modo
        </Button>
      </div>
    </SectionCard>
  );
}

function ResultStat({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <div className="min-w-32 rounded-[22px] border border-emerald-200 bg-emerald-50 px-6 py-5">
      <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</div>
      <div className="mt-1 text-5xl font-bold text-emerald-700">{value}</div>
      <div className="text-xs text-zinc-500">{helper}</div>
    </div>
  );
}
