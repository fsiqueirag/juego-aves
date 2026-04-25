import type { Dispatch, SetStateAction } from "react";
import { formatTime, getModeTitle, getSoundFile } from "@/lib/game";
import type { AudioSettings, BaseMode, Bird, DifficultyKey, GameMode } from "@/lib/types";
import { DB_BADGE } from "@/lib/game-ui-constants";
import { Button } from "@/components/button";
import { ResultMessage } from "@/components/result-message";
import { SectionCard } from "@/components/section-card";
import { cn } from "@/lib/ui";

type GameScreenProps = {
  currentQuestion: Bird | null;
  currentMode: GameMode;
  currentDb: DifficultyKey;
  currentSubMode: BaseMode;
  questionIndex: number;
  queueLength: number;
  score: number;
  elapsedSeconds: number;
  progressPct: number;
  audioSettings: AudioSettings;
  playingSoundSrc: string | null;
  writeValue: string;
  writeAttempts: number;
  selectedOption: string | null;
  wrongOptions: string[];
  resultText: string;
  showReveal: boolean;
  imageOptions: string[];
  imagePickOptions: Bird[];
  soundOptions: string[];
  nameSoundOptions: Bird[];
  nameSoundReady: string | null;
  nameSoundPlayed: string[];
  onBack: () => void;
  onAudioSettingsChange: Dispatch<SetStateAction<AudioSettings>>;
  onPlayBirdSound: (src: string) => void;
  onOptionAnswer: (correct: boolean, label: string) => void;
  onWriteValueChange: (value: string) => void;
  onWriteSubmit: () => void;
  onNameSoundOption: (bird: Bird) => void;
};

export function GameScreen({
  currentQuestion,
  currentMode,
  currentDb,
  currentSubMode,
  questionIndex,
  queueLength,
  score,
  elapsedSeconds,
  progressPct,
  audioSettings,
  playingSoundSrc,
  writeValue,
  writeAttempts,
  selectedOption,
  wrongOptions,
  resultText,
  showReveal,
  imageOptions,
  imagePickOptions,
  soundOptions,
  nameSoundOptions,
  nameSoundReady,
  nameSoundPlayed,
  onBack,
  onAudioSettingsChange,
  onPlayBirdSound,
  onOptionAnswer,
  onWriteValueChange,
  onWriteSubmit,
  onNameSoundOption,
}: GameScreenProps) {
  if (!currentQuestion) return null;

  return (
    <SectionCard className="mx-auto w-full max-w-3xl p-6 sm:p-8">
      <GameHeader
        currentMode={currentMode}
        currentDb={currentDb}
        questionIndex={questionIndex}
        queueLength={queueLength}
        score={score}
        elapsedSeconds={elapsedSeconds}
        progressPct={progressPct}
        autoPlayEnabled={audioSettings.autoPlayEnabled}
        onBack={onBack}
        onToggleAutoPlay={() => onAudioSettingsChange((value) => ({ ...value, autoPlayEnabled: !value.autoPlayEnabled }))}
      />

      <div className="space-y-5">
        {(currentSubMode === "imagen" || currentSubMode === "imagen-libre") && (
          <ImagePrompt bird={currentQuestion} playingSoundSrc={playingSoundSrc} onPlayBirdSound={onPlayBirdSound} />
        )}

        {currentSubMode === "imagen" && (
          <TextOptions
            options={imageOptions}
            selectedOption={selectedOption}
            wrongOptions={wrongOptions}
            getIsCorrect={(option) => option === currentQuestion.name}
            onOptionAnswer={onOptionAnswer}
          />
        )}

        {currentSubMode === "imagen-libre" && (
          <WriteAnswerForm
            writeValue={writeValue}
            writeAttempts={writeAttempts}
            answer={currentQuestion.name}
            showReveal={showReveal}
            onWriteValueChange={onWriteValueChange}
            onWriteSubmit={onWriteSubmit}
          />
        )}

        {currentSubMode === "nombre" && (
          <NameToImageQuestion
            currentQuestion={currentQuestion}
            options={imagePickOptions}
            selectedOption={selectedOption}
            wrongOptions={wrongOptions}
            onPlayBirdSound={onPlayBirdSound}
            onOptionAnswer={onOptionAnswer}
          />
        )}

        {currentSubMode === "nombre-sonido" && (
          <NameToSoundQuestion
            currentQuestion={currentQuestion}
            options={nameSoundOptions}
            selectedOption={selectedOption}
            wrongOptions={wrongOptions}
            nameSoundReady={nameSoundReady}
            nameSoundPlayed={nameSoundPlayed}
            onNameSoundOption={onNameSoundOption}
          />
        )}

        {(currentSubMode === "sonido" || currentSubMode === "sonido-libre") && (
          <SoundPrompt bird={currentQuestion} playingSoundSrc={playingSoundSrc} onPlayBirdSound={onPlayBirdSound} />
        )}

        {currentSubMode === "sonido" && (
          <>
            {showReveal ? <RevealBird bird={currentQuestion} /> : null}
            <TextOptions
              options={soundOptions}
              selectedOption={selectedOption}
              wrongOptions={wrongOptions}
              getIsCorrect={(option) => option === currentQuestion.name}
              onOptionAnswer={onOptionAnswer}
              className="grid-cols-1"
            />
          </>
        )}

        {currentSubMode === "sonido-libre" && (
          <>
            {showReveal ? <RevealBird bird={currentQuestion} /> : null}
            <p className="text-sm text-zinc-500">Escribí el nombre del ave:</p>
            <WriteAnswerForm
              writeValue={writeValue}
              writeAttempts={writeAttempts}
              answer={currentQuestion.name}
              showReveal={showReveal}
              onWriteValueChange={onWriteValueChange}
              onWriteSubmit={onWriteSubmit}
            />
          </>
        )}

        <ResultMessage className="text-base">{resultText}</ResultMessage>
      </div>
    </SectionCard>
  );
}

function GameHeader({
  currentMode,
  currentDb,
  questionIndex,
  queueLength,
  score,
  elapsedSeconds,
  progressPct,
  autoPlayEnabled,
  onBack,
  onToggleAutoPlay,
}: {
  currentMode: GameMode;
  currentDb: DifficultyKey;
  questionIndex: number;
  queueLength: number;
  score: number;
  elapsedSeconds: number;
  progressPct: number;
  autoPlayEnabled: boolean;
  onBack: () => void;
  onToggleAutoPlay: () => void;
}) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button className="text-sm font-semibold text-emerald-700" onClick={onBack}>
          ← Volver al menú
        </Button>
        <Button
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-semibold transition",
            autoPlayEnabled ? "border-emerald-400 bg-emerald-100 text-emerald-800" : "border-emerald-200 bg-emerald-50 text-emerald-700",
          )}
          onClick={onToggleAutoPlay}
        >
          🔊 Auto: {autoPlayEnabled ? "ON" : "OFF"}
        </Button>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-bold text-zinc-900">
          {getModeTitle(currentMode)} {DB_BADGE[currentDb].split(" ")[0]}
        </h2>
        <div className="mt-3 flex flex-wrap gap-6 text-sm text-zinc-600">
          <div>
            Pregunta <span className="text-lg font-bold text-zinc-900">{questionIndex + 1}</span>
          </div>
          <div>
            <span className="text-lg font-bold text-zinc-900">{score}</span> aciertos
          </div>
          <div>⏱ {formatTime(elapsedSeconds)}</div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          {questionIndex} de {queueLength} respondidas
        </div>
      </div>
    </>
  );
}

function ImagePrompt({
  bird,
  playingSoundSrc,
  onPlayBirdSound,
}: {
  bird: Bird;
  playingSoundSrc: string | null;
  onPlayBirdSound: (src: string) => void;
}) {
  const soundFile = getSoundFile(bird.image);
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-64 flex-1 items-center justify-center overflow-hidden rounded-[24px] border border-zinc-200 bg-white">
          <img src={bird.image} alt={bird.name} className="max-h-full max-w-full object-contain" />
        </div>
        <SoundButton active={playingSoundSrc === soundFile} label="🔊" onClick={() => onPlayBirdSound(soundFile)} />
      </div>
      <div className="text-xs italic text-zinc-500">{bird.obra}</div>
    </>
  );
}

function SoundPrompt({
  bird,
  playingSoundSrc,
  onPlayBirdSound,
}: {
  bird: Bird;
  playingSoundSrc: string | null;
  onPlayBirdSound: (src: string) => void;
}) {
  const soundFile = getSoundFile(bird.image);
  return (
    <div className="rounded-[24px] border-2 border-emerald-200 bg-white px-5 py-6 text-center">
      <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">Escuchá el canto del ave</div>
      <Button
        className={cn(
          "mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-emerald-600 bg-emerald-50 text-3xl text-emerald-700 transition hover:scale-105",
          playingSoundSrc === soundFile && "animate-pulse-ring bg-emerald-100",
        )}
        onClick={() => onPlayBirdSound(soundFile)}
      >
        ▶️
      </Button>
      <div className="mt-3 text-xs text-zinc-400">Clic para reproducir / detener</div>
    </div>
  );
}

function SoundButton({
  active,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      className={cn(
        "inline-flex h-14 w-14 items-center justify-center self-center rounded-full border-2 border-emerald-200 bg-white text-2xl text-emerald-700 transition hover:scale-105 hover:border-emerald-400 hover:bg-emerald-50",
        active && "animate-pulse-ring bg-emerald-100",
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function TextOptions({
  options,
  selectedOption,
  wrongOptions,
  getIsCorrect,
  onOptionAnswer,
  className,
}: {
  options: string[];
  selectedOption: string | null;
  wrongOptions: string[];
  getIsCorrect: (option: string) => boolean;
  onOptionAnswer: (correct: boolean, label: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {options.map((option) => (
        <Button
          key={option}
          disabled={selectedOption === "correct" || wrongOptions.includes(option)}
          onClick={() => onOptionAnswer(getIsCorrect(option), option)}
          className={cn(
            "rounded-[18px] border-2 px-4 py-3 text-sm font-semibold transition",
            selectedOption === option
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : wrongOptions.includes(option)
                ? "border-rose-300 bg-rose-50 text-zinc-400 line-through"
                : "border-zinc-200 bg-white text-zinc-800 hover:border-emerald-300 hover:bg-emerald-50",
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}

function WriteAnswerForm({
  writeValue,
  writeAttempts,
  answer,
  showReveal,
  onWriteValueChange,
  onWriteSubmit,
}: {
  writeValue: string;
  writeAttempts: number;
  answer: string;
  showReveal: boolean;
  onWriteValueChange: (value: string) => void;
  onWriteSubmit: () => void;
}) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={writeValue}
          onChange={(event) => onWriteValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onWriteSubmit();
          }}
          className="flex-1 rounded-[18px] border-2 border-emerald-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
          placeholder="Nombre del ave..."
        />
        <Button className="rounded-[18px] bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800" onClick={onWriteSubmit}>
          ✓
        </Button>
      </div>
      {showReveal && writeAttempts >= 2 ? (
        <div className="mt-3 rounded-[18px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-zinc-700">
          💡 La respuesta es: <strong>{answer}</strong>
        </div>
      ) : null}
    </div>
  );
}

function NameToImageQuestion({
  currentQuestion,
  options,
  selectedOption,
  wrongOptions,
  onPlayBirdSound,
  onOptionAnswer,
}: {
  currentQuestion: Bird;
  options: Bird[];
  selectedOption: string | null;
  wrongOptions: string[];
  onPlayBirdSound: (src: string) => void;
  onOptionAnswer: (correct: boolean, label: string) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-[22px] border-2 border-emerald-200 bg-white px-5 py-4 text-center text-2xl font-bold text-zinc-900">{currentQuestion.name}</div>
        <SoundButton label="🔊" onClick={() => onPlayBirdSound(getSoundFile(currentQuestion.image))} />
      </div>
      <div className="text-xs italic text-zinc-500">{currentQuestion.obra}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((bird) => (
          <Button
            key={bird.image}
            disabled={selectedOption === "correct" || wrongOptions.includes(bird.image)}
            onClick={() => onOptionAnswer(bird.image === currentQuestion.image, bird.image)}
            className={cn(
              "overflow-hidden rounded-[20px] border-[3px] bg-white p-2 transition",
              selectedOption === bird.image
                ? "border-emerald-500 bg-emerald-50"
                : wrongOptions.includes(bird.image)
                  ? "border-rose-300 bg-rose-50 opacity-50"
                  : "border-zinc-200 hover:border-emerald-300",
            )}
          >
            <div className="flex h-36 items-center justify-center rounded-[14px] bg-zinc-50">
              <img src={bird.image} alt={bird.name} className="max-h-full max-w-full object-contain" />
            </div>
          </Button>
        ))}
      </div>
    </>
  );
}

function NameToSoundQuestion({
  currentQuestion,
  options,
  selectedOption,
  wrongOptions,
  nameSoundReady,
  nameSoundPlayed,
  onNameSoundOption,
}: {
  currentQuestion: Bird;
  options: Bird[];
  selectedOption: string | null;
  wrongOptions: string[];
  nameSoundReady: string | null;
  nameSoundPlayed: string[];
  onNameSoundOption: (bird: Bird) => void;
}) {
  return (
    <>
      <div className="rounded-[22px] border-2 border-emerald-200 bg-white px-5 py-4 text-center text-2xl font-bold text-zinc-900">{currentQuestion.name}</div>
      <div className="text-xs italic text-zinc-500">{currentQuestion.obra}</div>
      <p className="text-sm text-zinc-500">Escuchá los cantos y elegí el del ave.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((bird, index) => {
          const key = bird.image;
          const played = nameSoundPlayed.includes(key);
          const ready = nameSoundReady === key;
          const wrong = wrongOptions.includes(key);
          const correct = selectedOption === key;
          return (
            <Button
              key={key}
              disabled={correct || wrong}
              onClick={() => onNameSoundOption(bird)}
              className={cn(
                "rounded-[20px] border-[3px] px-4 py-5 transition",
                correct
                  ? "border-emerald-500 bg-emerald-50"
                  : wrong
                    ? "border-rose-300 bg-rose-50 opacity-60"
                    : ready
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-zinc-200 bg-white hover:border-emerald-300",
              )}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-50 text-xl text-emerald-700">▶️</div>
              <div className="mt-3 text-xs text-zinc-500">Canto {index + 1}</div>
              <div className="mt-1 text-xs font-semibold text-zinc-700">{played ? "Tocá de nuevo para responder" : "Tocá para escuchar"}</div>
            </Button>
          );
        })}
      </div>
    </>
  );
}

function RevealBird({ bird }: { bird: Bird }) {
  return (
    <div className="rounded-[20px] border-2 border-emerald-300 bg-emerald-50 p-3">
      <div className="flex h-40 items-center justify-center overflow-hidden rounded-[14px] bg-white">
        <img src={bird.image} alt={bird.name} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="mt-2 text-xs italic text-zinc-500">
        {bird.name} · {bird.obra}
      </div>
    </div>
  );
}
