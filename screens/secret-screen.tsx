import { Button } from "@/components/button";
import { SectionCard } from "@/components/section-card";

type SecretScreenProps = {
  onBack: () => void;
};

export function SecretScreen({ onBack }: SecretScreenProps) {
  return (
    <SectionCard className="mx-auto w-full max-w-3xl p-8">
      <Button className="mb-5 text-sm font-semibold text-emerald-700" onClick={onBack}>
        ← Volver al menú
      </Button>
      <div className="text-center">
        <div className="text-6xl">🦜</div>
        <h2 className="mt-4 text-3xl font-bold text-emerald-900">Nivel Secreto completado</h2>
      </div>
      <div className="mt-6 space-y-5 text-base leading-8 text-zinc-700">
        <p>
          Gracias por haber jugado y haber completado todo el juego. ¡Felicitaciones! Has demostrado ser una persona sensible, atenta y que se interesa y preocupa por las aves y seguramente también por la naturaleza.
        </p>
        <p>Personas como vos hacen que este mundo sea un lugar mejor, cuidando a nuestro medio ambiente y a los animales y plantas que viven en él.</p>
        <p>
          No se puede amar lo que uno desconoce, pero informando sobre las especies que habitan en él uno se involucra y sensibiliza, y de esta manera aprende lo que existe para poder defenderlo y cuidarlo.
        </p>
        <p>
          Compartí este juego con otros, grandes y chicos, así todos podemos crecer amando a la naturaleza y así, como seres humanos en armonía con el planeta Tierra, <strong>volar muy alto</strong>. 🌿
        </p>
      </div>
      <div className="mt-8 text-center text-4xl">🌍🌿🐦⭐</div>
    </SectionCard>
  );
}
