import type { DifficultyKey } from "@/lib/types";
import { DB_BADGE } from "@/lib/game-ui-constants";
import type { MemoCard } from "@/lib/game-ui-types";
import { Button } from "@/components/button";
import { SectionCard } from "@/components/section-card";
import { cn } from "@/lib/ui";

type MemoGameProps = {
  miniDb: DifficultyKey;
  cards: MemoCard[];
  flipped: number[];
  matched: number[];
  moves: number;
  done: boolean;
  onBack: () => void;
  onCardClick: (index: number) => void;
  onRestart: () => void;
  onChangeMiniGame: () => void;
};

export function MemoGame({ miniDb, cards, flipped, matched, moves, done, onBack, onCardClick, onRestart, onChangeMiniGame }: MemoGameProps) {
  return (
    <SectionCard className="mx-auto w-full max-w-4xl p-6">
      <Button className="mb-5 text-sm font-semibold text-fuchsia-800" onClick={onBack}>
        ← Minijuegos
      </Button>
      <h2 className="text-3xl font-bold text-fuchsia-950">
        🃏 Memotest <span className="text-lg">{DB_BADGE[miniDb]}</span>
      </h2>
      <div className="mt-3 flex flex-wrap gap-6 text-sm text-zinc-600">
        <div>
          Movimientos: <span className="font-bold text-emerald-700">{moves}</span>
        </div>
        <div>
          Pares: <span className="font-bold text-emerald-700">{matched.length}</span> / {cards.length / 2}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card, index) => (
          <MemoCardButton
            key={`${card.id}-${card.type}-${index}`}
            card={card}
            flipped={flipped.includes(index) || matched.includes(card.id)}
            matched={matched.includes(card.id)}
            onClick={() => onCardClick(index)}
          />
        ))}
      </div>
      {done ? (
        <div className="mt-6 rounded-[24px] border border-fuchsia-200 bg-fuchsia-50 p-6 text-center">
          <h3 className="text-2xl font-bold text-fuchsia-900">🎉 ¡Completaste el Memotest!</h3>
          <div className="mt-3 text-lg">
            Movimientos: <span className="text-4xl font-bold text-emerald-700">{moves}</span>
          </div>
          <MiniGameActions onRestart={onRestart} onChangeMiniGame={onChangeMiniGame} />
        </div>
      ) : null}
    </SectionCard>
  );
}

function MemoCardButton({ card, flipped, matched, onClick }: { card: MemoCard; flipped: boolean; matched: boolean; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "aspect-square overflow-hidden rounded-[20px] border-2 p-2 transition",
        matched ? "border-emerald-400 bg-emerald-50" : "border-emerald-200 bg-emerald-50 hover:border-emerald-400",
      )}
    >
      {flipped ? (
        <div className={cn("flex h-full items-center justify-center rounded-[14px]", card.type === "name" ? "bg-sky-50 p-3" : "bg-white")}>
          {card.type === "image" ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <img src={card.bird.image} alt={card.bird.name} className="max-h-[78%] max-w-full object-contain" />
              <div className="text-[11px] font-semibold text-zinc-700">{card.bird.name}</div>
            </div>
          ) : (
            <div className="text-center text-sm font-bold text-sky-700">{card.bird.name}</div>
          )}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-4xl text-emerald-300">🐦</div>
      )}
    </Button>
  );
}

function MiniGameActions({ onRestart, onChangeMiniGame }: { onRestart: () => void; onChangeMiniGame: () => void }) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-3">
      <Button className="rounded-[18px] bg-fuchsia-700 px-5 py-3 font-semibold text-white" onClick={onRestart}>
        Jugar de nuevo
      </Button>
      <Button className="rounded-[18px] border-2 border-fuchsia-700 px-5 py-3 font-semibold text-fuchsia-700" onClick={onChangeMiniGame}>
        Cambiar minijuego
      </Button>
    </div>
  );
}

export { MiniGameActions };
