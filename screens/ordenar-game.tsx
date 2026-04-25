import type { DifficultyKey, Bird } from "@/lib/types";
import { DB_BADGE } from "@/lib/game-ui-constants";
import { Button } from "@/components/button";
import { ResultMessage } from "@/components/result-message";
import { SectionCard } from "@/components/section-card";
import { cn } from "@/lib/ui";
import { MiniGameActions } from "./memo-game";

type OrdenarGameProps = {
  miniDb: DifficultyKey;
  birds: Bird[];
  names: string[];
  assignments: Record<string, string>;
  dragging: string | null;
  result: string;
  done: boolean;
  onBack: () => void;
  onAssign: (targetBird: string, draggedName: string) => void;
  onDragStart: (name: string) => void;
  onDragEnd: () => void;
  onRestart: () => void;
  onChangeMiniGame: () => void;
};

export function OrdenarGame({
  miniDb,
  birds,
  names,
  assignments,
  dragging,
  result,
  done,
  onBack,
  onAssign,
  onDragStart,
  onDragEnd,
  onRestart,
  onChangeMiniGame,
}: OrdenarGameProps) {
  return (
    <SectionCard className="mx-auto w-full max-w-4xl p-6">
      <Button className="mb-5 text-sm font-semibold text-fuchsia-800" onClick={onBack}>
        ← Minijuegos
      </Button>
      <h2 className="text-3xl font-bold text-fuchsia-950">
        🔀 Ordenar <span className="text-lg">{DB_BADGE[miniDb]}</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-500">Arrastrá los nombres al casillero de la imagen correspondiente.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {birds.map((bird) => (
          <OrdenarDropCard key={bird.name} bird={bird} placed={assignments[bird.name]} dragging={dragging} onAssign={onAssign} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {names.map((name) => {
          const alreadyPlaced = Object.values(assignments).includes(name);
          return (
            <div
              key={name}
              draggable={!alreadyPlaced}
              onDragStart={() => onDragStart(name)}
              onDragEnd={onDragEnd}
              className={cn("rounded-full border-2 px-4 py-2 text-sm font-semibold", alreadyPlaced ? "hidden" : "cursor-grab border-emerald-700 bg-white text-emerald-700")}
            >
              {name}
            </div>
          );
        })}
      </div>
      <ResultMessage className="mt-4 text-center">{result}</ResultMessage>
      {done ? (
        <div className="mt-4 rounded-[24px] border border-fuchsia-200 bg-fuchsia-50 p-6 text-center">
          <h3 className="text-2xl font-bold text-fuchsia-900">✅ ¡Todas asociadas correctamente!</h3>
          <MiniGameActions onRestart={onRestart} onChangeMiniGame={onChangeMiniGame} />
        </div>
      ) : null}
    </SectionCard>
  );
}

function OrdenarDropCard({
  bird,
  placed,
  dragging,
  onAssign,
}: {
  bird: Bird;
  placed?: string;
  dragging: string | null;
  onAssign: (targetBird: string, draggedName: string) => void;
}) {
  const correct = placed === bird.name;
  const wrong = Boolean(placed) && placed !== bird.name;

  return (
    <div className="rounded-[22px] border border-emerald-200 bg-white p-3">
      <div className="flex h-36 items-center justify-center rounded-[16px] bg-zinc-50">
        <img src={bird.image} alt={bird.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => dragging && onAssign(bird.name, dragging)}
        className={cn(
          "mt-3 rounded-[16px] border-2 border-dashed px-4 py-3 text-center text-sm font-semibold",
          correct ? "border-emerald-400 bg-emerald-50 text-emerald-700" : wrong ? "border-rose-300 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-zinc-400",
        )}
      >
        {placed ?? "Soltá aquí"}
      </div>
    </div>
  );
}
