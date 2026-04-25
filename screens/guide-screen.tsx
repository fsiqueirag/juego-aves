import { ALL_CATS } from "@/lib/data";
import { getSoundFile } from "@/lib/game";
import type { Bird } from "@/lib/types";
import { Button } from "@/components/button";
import { SectionCard } from "@/components/section-card";
import { cn } from "@/lib/ui";

type GuideScreenProps = {
  guideFilter: string;
  birds: Bird[];
  onFilterChange: (filter: string) => void;
  onBack: () => void;
  onPlayBirdSound: (src: string) => void;
};

export function GuideScreen({ guideFilter, birds, onFilterChange, onBack, onPlayBirdSound }: GuideScreenProps) {
  const filters = ["todos", "Por nivel", "A–Z", ...ALL_CATS];

  return (
    <SectionCard className="mx-auto w-full max-w-5xl p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Button className="text-sm font-semibold text-emerald-700" onClick={onBack}>
          ← Menú
        </Button>
        <h2 className="text-3xl font-bold text-zinc-900">📖 Guía de Aves</h2>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold transition",
              guideFilter === filter ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",
            )}
          >
            {filter === "todos" ? "🦜 Todas" : filter === "Por nivel" ? "📊 Por nivel" : filter === "A–Z" ? "🔤 A–Z" : filter}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {guideFilter === "Por nivel" || guideFilter === "todos"
          ? ([
              { title: "🟢 Fácil — Aves Muy Comunes", level: "facil" },
              { title: "🔵 Medio — Aves Conocidas", level: "medio" },
              { title: "🔴 Difícil — Aves Desafiantes", level: "dificil" },
            ] as const).map((group) => {
              const groupBirds = birds.filter((bird) => bird.level === group.level);
              if (!groupBirds.length) return null;
              return (
                <div key={group.level}>
                  <div className="mb-2 border-b border-emerald-100 pb-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">{group.title}</div>
                  <div className="grid gap-3">
                    {groupBirds.map((bird) => (
                      <GuideCard key={`${bird.level}-${bird.name}`} bird={bird} onPlay={() => onPlayBirdSound(getSoundFile(bird.image))} />
                    ))}
                  </div>
                </div>
              );
            })
          : birds.map((bird) => <GuideCard key={`${bird.level}-${bird.name}`} bird={bird} onPlay={() => onPlayBirdSound(getSoundFile(bird.image))} />)}
      </div>
    </SectionCard>
  );
}

function GuideCard({ bird, onPlay }: { bird: Bird; onPlay: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-emerald-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
      <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-[14px] border border-emerald-100 bg-emerald-50 sm:w-28">
        <img src={bird.image} alt={bird.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="flex-1">
        <div className="text-lg font-semibold text-zinc-900">{bird.name}</div>
        <div className="text-xs italic text-zinc-500">{bird.obra}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {bird.cat.map((tag) => (
            <span key={tag} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <Button onClick={onPlay} className="inline-flex h-12 w-12 items-center justify-center self-center rounded-full border-2 border-emerald-200 bg-white text-xl text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50">
        🔊
      </Button>
    </div>
  );
}
