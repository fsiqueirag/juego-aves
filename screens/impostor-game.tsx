import type { DifficultyKey } from "@/lib/types";
import { DB_BADGE } from "@/lib/game-ui-constants";
import type { ImpostorRound } from "@/lib/game-ui-types";
import { Button } from "@/components/button";
import { ResultMessage } from "@/components/result-message";
import { SectionCard } from "@/components/section-card";
import { cn } from "@/lib/ui";
import { MiniGameActions } from "./memo-game";

type ImpostorGameProps = {
  miniDb: DifficultyKey;
  round: number;
  score: number;
  done: boolean;
  result: string;
  roundData: ImpostorRound | null;
  answered: boolean;
  onBack: () => void;
  onAnswer: (name: string) => void;
  onRestart: () => void;
  onChangeMiniGame: () => void;
};

export function ImpostorGame({ miniDb, round, score, done, result, roundData, answered, onBack, onAnswer, onRestart, onChangeMiniGame }: ImpostorGameProps) {
  return (
    <SectionCard className="mx-auto w-full max-w-4xl p-6">
      <Button className="mb-5 text-sm font-semibold text-fuchsia-800" onClick={onBack}>
        ← Minijuegos
      </Button>
      <h2 className="text-3xl font-bold text-fuchsia-950">
        🕵️ Impostor <span className="text-lg">{DB_BADGE[miniDb]}</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-500">¿Cuál de estos nombres no corresponde a ninguna de las aves que ves?</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {roundData?.birds.map((bird) => (
          <div key={bird.name} className="rounded-[22px] border border-zinc-200 bg-white p-3">
            <div className="flex h-36 items-center justify-center rounded-[16px] bg-zinc-50">
              <img src={bird.image} alt={bird.name} className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {roundData?.names.map((name) => (
          <Button
            key={name}
            disabled={answered}
            onClick={() => onAnswer(name)}
            className={cn(
              "rounded-full border-2 px-5 py-3 text-sm font-semibold transition",
              answered && name === roundData.impostorName ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-zinc-300 bg-white text-zinc-800 hover:border-orange-400 hover:bg-orange-50",
            )}
          >
            {name}
          </Button>
        ))}
      </div>
      <ResultMessage className="mt-4 text-center">{result}</ResultMessage>
      <div className="mt-2 flex justify-center gap-6 text-sm text-zinc-600">
        <div>
          Aciertos: <span className="font-bold text-emerald-700">{score}</span>
        </div>
        <div>
          Ronda: <span className="font-bold">{round}</span> / 10
        </div>
      </div>
      {done ? (
        <div className="mt-4 rounded-[24px] border border-fuchsia-200 bg-fuchsia-50 p-6 text-center">
          <h3 className="text-2xl font-bold text-fuchsia-900">🕵️ ¡Ronda terminada!</h3>
          <div className="mt-3">
            Tu puntaje: <span className="text-4xl font-bold text-emerald-700">{score}</span> / 10
          </div>
          <MiniGameActions onRestart={onRestart} onChangeMiniGame={onChangeMiniGame} />
        </div>
      ) : null}
    </SectionCard>
  );
}
