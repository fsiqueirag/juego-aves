import type { DifficultyKey, MiniGame } from "@/lib/types";
import { DB_BADGE, DIFFICULTIES } from "@/lib/game-ui-constants";
import { Button } from "@/components/button";
import { SectionCard } from "@/components/section-card";

const MINI_GAMES: Array<{ id: MiniGame; icon: string; title: string; description: string }> = [
  { id: "memo", icon: "🃏", title: "Memotest", description: "Encontrá los pares imagen + nombre. Al acertar suena el canto." },
  { id: "ordenar", icon: "🔀", title: "Ordenar", description: "Arrastrá los nombres a la imagen correcta." },
  { id: "impostor", icon: "🕵️", title: "Encontrá al Impostor", description: "Uno de los nombres no corresponde a ninguna de las aves." },
];

type MinigamesScreenProps = {
  onBack: () => void;
  onLaunch: (game: MiniGame, db: DifficultyKey) => void;
};

export function MinigamesScreen({ onBack, onLaunch }: MinigamesScreenProps) {
  return (
    <SectionCard className="mx-auto w-full max-w-3xl p-6 sm:p-8">
      <Button className="mb-5 text-sm font-semibold text-emerald-700" onClick={onBack}>
        ← Volver al menú
      </Button>
      <h2 className="text-3xl font-bold text-fuchsia-900">🎮 Minijuegos</h2>
      <p className="mt-2 text-sm text-zinc-500">Practicá sin presión. No cuentan para tu progreso.</p>
      <div className="mt-6 space-y-4">
        {MINI_GAMES.map((game) => (
          <div key={game.id} className="overflow-hidden rounded-[24px] border border-fuchsia-200 bg-fuchsia-50">
            <div className="flex items-center gap-4 border-b border-fuchsia-100 px-5 py-4">
              <div className="text-3xl">{game.icon}</div>
              <div>
                <div className="font-semibold text-fuchsia-950">{game.title}</div>
                <div className="text-sm text-zinc-500">{game.description}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-fuchsia-100 sm:grid-cols-4">
              {DIFFICULTIES.map((db) => (
                <Button key={db} className="bg-white px-4 py-4 text-center text-sm font-semibold text-fuchsia-900 transition hover:bg-fuchsia-100" onClick={() => onLaunch(game.id, db)}>
                  <div>{DB_BADGE[db].split(" ")[0]}</div>
                  <div className="text-xs text-zinc-500">{db[0].toUpperCase() + db.slice(1)}</div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
