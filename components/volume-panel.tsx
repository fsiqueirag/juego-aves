import type { Dispatch, RefObject, SetStateAction } from "react";
import type { AudioSettings } from "@/lib/types";
import { Button } from "@/components/button";
import { cn } from "@/lib/ui";

type VolumePanelProps = {
  panelRef: RefObject<HTMLDivElement | null>;
  audioSettings: AudioSettings;
  onAudioSettingsChange: Dispatch<SetStateAction<AudioSettings>>;
  onClose: () => void;
};

const AUDIO_CONTROLS = [
  ["Música", "musicVolume", "musicMuted"],
  ["Cantos", "birdVolume", "birdMuted"],
  ["Efectos", "sfxVolume", "sfxMuted"],
] as const;

export function VolumePanel({ panelRef, audioSettings, onAudioSettingsChange, onClose }: VolumePanelProps) {
  return (
    <div ref={panelRef} className="fixed right-4 top-20 z-40 w-72 rounded-[24px] border border-emerald-200 bg-white/95 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">🎛️ Control de Audio</div>
      {AUDIO_CONTROLS.map(([label, volumeKey, muteKey]) => (
        <div key={label} className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm text-zinc-600">
            <span>{label}</span>
            <Button
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                audioSettings[muteKey] ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700",
              )}
              onClick={() => onAudioSettingsChange((value) => ({ ...value, [muteKey]: !value[muteKey] }))}
            >
              {audioSettings[muteKey] ? "🔕" : "🔊"}
            </Button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={audioSettings[volumeKey]}
            onChange={(event) => onAudioSettingsChange((value) => ({ ...value, [volumeKey]: Number(event.target.value) }))}
            className="w-full accent-emerald-700"
          />
        </div>
      ))}
      <Button className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800" onClick={onClose}>
        Cerrar
      </Button>
    </div>
  );
}
