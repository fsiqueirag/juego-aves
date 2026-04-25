"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { allBirds, databases } from "@/lib/data";
import {
  checkUnlocks,
  countStars,
  getModeTitle,
  getOverallPct,
  getRankLabel,
  getSoundFile,
  makeOptions,
  normalize,
  pctTone,
  pickAleatorioSubMode,
  shuffle,
  updateRecord,
} from "@/lib/game";
import {
  DEFAULT_AUDIO_SETTINGS,
  loadAudioSettings,
  loadRecords,
  loadUnlocked,
  saveAudioSettings,
  saveRecords,
  saveUnlocked,
} from "@/lib/storage";
import type { AudioSettings, BaseMode, Bird, DifficultyKey, GameMode, MiniGame, ModeCell, RecordsMap, Screen } from "@/lib/types";
import { Button } from "@/components/button";
import { RecordsModal } from "@/components/records-modal";
import { VolumePanel } from "@/components/volume-panel";
import { DB_BADGE } from "@/lib/game-ui-constants";
import { useAudioController } from "@/hooks/use-audio-controller";
import { useToast } from "@/hooks/use-toast";
import { DifficultySelector } from "@/screens/difficulty-selector";
import { GameScreen } from "@/screens/game-screen";
import { GuideScreen } from "@/screens/guide-screen";
import { ImpostorGame } from "@/screens/impostor-game";
import { MemoGame } from "@/screens/memo-game";
import { MenuScreen } from "@/screens/menu-screen";
import { MinigamesScreen } from "@/screens/minigames-screen";
import { OrdenarGame } from "@/screens/ordenar-game";
import { ResultsScreen } from "@/screens/results-screen";
import { SecretScreen } from "@/screens/secret-screen";
import type { ImpostorRound, MemoCard, ResultState } from "@/lib/game-ui-types";
import { cn } from "@/lib/ui";

export function BirdGameApp() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);
  const [currentMode, setCurrentMode] = useState<GameMode>("imagen");
  const [currentDb, setCurrentDb] = useState<DifficultyKey>("facil");
  const [currentSubMode, setCurrentSubMode] = useState<BaseMode>("imagen");
  const [queue, setQueue] = useState<Bird[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [failedOnce, setFailedOnce] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [writeValue, setWriteValue] = useState("");
  const [writeAttempts, setWriteAttempts] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [resultText, setResultText] = useState("");
  const [showReveal, setShowReveal] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [guideFilter, setGuideFilter] = useState("todos");
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [records, setRecords] = useState<RecordsMap>({});
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [resultState, setResultState] = useState<ResultState | null>(null);
  const [nameSoundReady, setNameSoundReady] = useState<string | null>(null);
  const [nameSoundPlayed, setNameSoundPlayed] = useState<string[]>([]);
  const [miniDb, setMiniDb] = useState<DifficultyKey>("facil");

  const [memoCards, setMemoCards] = useState<MemoCard[]>([]);
  const [memoFlipped, setMemoFlipped] = useState<number[]>([]);
  const [memoMatched, setMemoMatched] = useState<number[]>([]);
  const [memoMoves, setMemoMoves] = useState(0);
  const [memoDone, setMemoDone] = useState(false);

  const [ordenarBirds, setOrdenarBirds] = useState<Bird[]>([]);
  const [ordenarNames, setOrdenarNames] = useState<string[]>([]);
  const [ordenarAssignments, setOrdenarAssignments] = useState<Record<string, string>>({});
  const [ordenarDragging, setOrdenarDragging] = useState<string | null>(null);
  const [ordenarResult, setOrdenarResult] = useState("");
  const [ordenarDone, setOrdenarDone] = useState(false);

  const [impRound, setImpRound] = useState(1);
  const [impScore, setImpScore] = useState(0);
  const [impDone, setImpDone] = useState(false);
  const [impResult, setImpResult] = useState("");
  const [impRoundData, setImpRoundData] = useState<ImpostorRound | null>(null);
  const [impAnswered, setImpAnswered] = useState(false);

  const currentQuestion = queue[questionIndex] ?? null;
  const currentPool = databases[currentDb];

  const volumeRef = useRef<HTMLDivElement | null>(null);
  const nextQuestionTimerRef = useRef<number | null>(null);
  const impTimerRef = useRef<number | null>(null);
  const memoTimerRef = useRef<number | null>(null);

  const { toast, showToast } = useToast();
  const { playingSoundSrc, ensureMenuMusic, duckMusic, restoreMusic, stopBirdAudio, playBirdSound, playSfx } = useAudioController(audioSettings);

  useEffect(() => {
    setUnlocked(loadUnlocked());
    setRecords(loadRecords());
    setAudioSettings(loadAudioSettings());
  }, []);

  useEffect(() => {
    saveAudioSettings(audioSettings);
  }, [audioSettings]);

  useEffect(() => {
    if (screen !== "game") return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    resetGameFeedback();
    if (screen !== "game" || !currentQuestion) return;

    const activeMode = (currentMode === "aleatorio-opc" || currentMode === "aleatorio-libre" ? pickAleatorioSubMode(currentMode) : currentMode) as BaseMode;
    setCurrentSubMode(activeMode);

    const shouldAutoplay = activeMode === "sonido" || activeMode === "sonido-libre";
    const mayAutoPlay = audioSettings.autoPlayEnabled && !shouldAutoplay;
    if (shouldAutoplay || mayAutoPlay) {
      const timeout = window.setTimeout(() => {
        playBirdSound(getSoundFile(currentQuestion.image));
      }, 300);
      return () => window.clearTimeout(timeout);
    }
  }, [screen, questionIndex, currentMode, currentQuestion, audioSettings.autoPlayEnabled]);

  useEffect(() => {
    return () => {
      if (nextQuestionTimerRef.current) window.clearTimeout(nextQuestionTimerRef.current);
      if (impTimerRef.current) window.clearTimeout(impTimerRef.current);
      if (memoTimerRef.current) window.clearTimeout(memoTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (memoFlipped.length !== 2) return;
    const [firstIndex, secondIndex] = memoFlipped;
    const first = memoCards[firstIndex];
    const second = memoCards[secondIndex];
    if (!first || !second) return;

    setMemoMoves((value) => value + 1);
    if (first.id === second.id && first.type !== second.type) {
      playSfx("memo");
      memoTimerRef.current = window.setTimeout(() => {
        setMemoMatched((value) => [...value, first.id]);
        setMemoFlipped([]);
        playBirdSound(getSoundFile(first.bird.image));
      }, 250);
      return;
    }

    memoTimerRef.current = window.setTimeout(() => setMemoFlipped([]), 900);
  }, [memoFlipped, memoCards]);

  useEffect(() => {
    const totalPairs = memoCards.length / 2;
    if (memoCards.length && memoMatched.length === totalPairs) {
      setMemoDone(true);
      playSfx("record");
    }
  }, [memoCards.length, memoMatched]);

  useEffect(() => {
    const zones = Object.entries(ordenarAssignments);
    if (!zones.length) {
      setOrdenarResult("");
      setOrdenarDone(false);
      return;
    }

    const allFilled = ordenarBirds.every((bird) => Boolean(ordenarAssignments[bird.name]));
    const allCorrect = ordenarBirds.every((bird) => ordenarAssignments[bird.name] === bird.name);

    if (allFilled && allCorrect) {
      setOrdenarDone(true);
      setOrdenarResult("");
      playSfx("correct");
    } else if (allFilled) {
      setOrdenarDone(false);
      setOrdenarResult("❌ Hay errores — seguí intentando");
      playSfx("wrong");
    } else {
      setOrdenarDone(false);
      setOrdenarResult("");
    }
  }, [ordenarAssignments, ordenarBirds]);

  useEffect(() => {
    if (!volumeOpen) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (volumeRef.current && !volumeRef.current.contains(target)) {
        setVolumeOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [volumeOpen]);

  useEffect(() => {
    if (writeAttempts >= 2) setShowReveal(true);
  }, [writeAttempts]);

  const overallPct = useMemo(() => getOverallPct(records), [records]);
  const starCount = useMemo(() => countStars(records), [records]);
  const rankLabel = useMemo(() => getRankLabel(overallPct), [overallPct]);

  const filteredGuideBirds = useMemo(() => {
    if (guideFilter === "todos") return allBirds;
    if (guideFilter === "A–Z") return [...allBirds].sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (guideFilter === "Por nivel") return allBirds;
    return allBirds.filter((bird) => bird.cat.includes(guideFilter));
  }, [guideFilter]);

  const imageOptions = useMemo(() => {
    if (!currentQuestion || currentSubMode !== "imagen") return [];
    return makeOptions(currentQuestion, currentPool, "name") as string[];
  }, [currentQuestion, currentPool, currentSubMode]);

  const imagePickOptions = useMemo(() => {
    if (!currentQuestion || currentSubMode !== "nombre") return [];
    return makeOptions(currentQuestion, currentPool, "bird") as Bird[];
  }, [currentQuestion, currentPool, currentSubMode]);

  const soundOptions = useMemo(() => {
    if (!currentQuestion || currentSubMode !== "sonido") return [];
    return makeOptions(currentQuestion, currentPool, "name") as string[];
  }, [currentQuestion, currentPool, currentSubMode]);

  const nameSoundOptions = useMemo(() => {
    if (!currentQuestion || currentSubMode !== "nombre-sonido") return [];
    return makeOptions(currentQuestion, currentPool, "bird") as Bird[];
  }, [currentQuestion, currentPool, currentSubMode]);

  const progressPct = queue.length ? Math.round((questionIndex / queue.length) * 100) : 0;

  function performAction(callback: () => void) {
    ensureMenuMusic();
    playSfx("click");
    callback();
  }

  function resetGameFeedback() {
    setWriteValue("");
    setWriteAttempts(0);
    setSelectedOption(null);
    setWrongOptions([]);
    setResultText("");
    setShowReveal(false);
    setNameSoundReady(null);
    setNameSoundPlayed([]);
    setFailedOnce(false);
  }

  function openMode(mode: GameMode) {
    const available = ["facil", "medio", "dificil", "experto"].filter((db) => unlocked.has(`${mode}_${db}`));
    if (!available.length) {
      showToast("error", "🔒 Este modo está bloqueado");
      return;
    }
    stopBirdAudio();
    duckMusic();
    setPendingMode(mode);
    setScreen("difficulty-select");
  }

  function startGame(mode: GameMode, db: DifficultyKey) {
    stopBirdAudio();
    duckMusic();
    setPendingMode(null);
    setCurrentMode(mode);
    setCurrentDb(db);
    setQueue(shuffle(databases[db]));
    setQuestionIndex(0);
    setScore(0);
    setElapsedSeconds(0);
    resetGameFeedback();
    setResultState(null);
    setScreen("game");
  }

  function goMenu() {
    stopBirdAudio();
    restoreMusic();
    setRecordsOpen(false);
    setScreen("menu");
  }

  function scheduleNextQuestion(delay = 1600) {
    if (nextQuestionTimerRef.current) window.clearTimeout(nextQuestionTimerRef.current);
    nextQuestionTimerRef.current = window.setTimeout(() => {
      if (questionIndex + 1 >= queue.length) {
        endGame();
      } else {
        setQuestionIndex((value) => value + 1);
      }
    }, delay);
  }

  function markCorrect(delay = 1600) {
    if (!failedOnce) setScore((value) => value + 1);
    playSfx("correct");
    setSelectedOption("correct");
    setResultText(failedOnce ? "✅ Correcto (sin punto)" : "✅ ¡Correcto!");
    setShowReveal(currentSubMode === "sonido" || currentSubMode === "sonido-libre");
    stopBirdAudio();
    scheduleNextQuestion(delay);
  }

  function handleOptionAnswer(correct: boolean, label: string) {
    if (selectedOption === "correct") return;
    if (correct) {
      setSelectedOption(label);
      markCorrect();
      return;
    }
    playSfx("wrong");
    setFailedOnce(true);
    setWrongOptions((value) => [...value, label]);
    setResultText(currentSubMode === "nombre-sonido" ? "❌ Ese no es el canto — seguí escuchando" : "❌ Incorrecto, seguí intentando");
  }

  function handleWriteSubmit() {
    if (!currentQuestion) return;
    const typed = normalize(writeValue);
    if (!typed) return;
    if (typed === normalize(currentQuestion.name)) {
      markCorrect(1800);
      return;
    }
    playSfx("wrong");
    setFailedOnce(true);
    setWriteAttempts((value) => value + 1);
    setWriteValue("");
    setResultText("❌ Incorrecto — intentá de nuevo");
  }

  function handleNameSoundOption(bird: Bird) {
    if (!currentQuestion) return;
    const key = bird.image;
    if (!nameSoundPlayed.includes(key)) {
      playBirdSound(getSoundFile(bird.image));
      setNameSoundPlayed((value) => [...value, key]);
      setNameSoundReady(key);
      return;
    }
    handleOptionAnswer(bird.image === currentQuestion.image, key);
  }

  function endGame() {
    stopBirdAudio();
    const total = queue.length;
    const modeKey = `${currentMode}_${currentDb}` as ModeCell;
    const { nextRecords, isNewScore, isNewTime, entry } = updateRecord(records, modeKey, score, elapsedSeconds);
    setRecords(nextRecords);
    saveRecords(nextRecords);

    const scorePct = Math.round((score / total) * 100);
    const unlockResult = checkUnlocks(modeKey, scorePct, unlocked);
    setUnlocked(unlockResult.unlocked);
    saveUnlocked(unlockResult.unlocked);

    const newBadges: string[] = [];
    if (isNewScore) newBadges.push("🏆 ¡Nuevo récord de aciertos!");
    if (isNewTime) newBadges.push("⚡ ¡Nuevo récord de tiempo!");

    if (isNewScore || isNewTime) playSfx("record");
    else playSfx("finish");
    if (unlockResult.newlyUnlocked.length) playSfx("unlock");

    setResultState({
      subtitle: `${getModeTitle(currentMode)} · ${DB_BADGE[currentDb]}`,
      score,
      total,
      elapsedSeconds,
      newBadges,
      newlyUnlocked: unlockResult.newlyUnlocked,
      bestScore: entry.bestScore ?? score,
      bestTime: entry.bestTime,
    });
    setScreen("results");
  }

  function launchMiniGame(game: MiniGame, db: DifficultyKey) {
    setMiniDb(db);
    stopBirdAudio();
    duckMusic();
    if (game === "memo") {
      startMemo(db);
      setScreen("memo");
      return;
    }
    if (game === "ordenar") {
      startOrdenar(db);
      setScreen("ordenar");
      return;
    }
    startImpostor(db);
    setScreen("impostor");
  }

  function startMemo(db: DifficultyKey) {
    const birds = shuffle(databases[db]).slice(0, 6);
    const cards = shuffle([
      ...birds.map((bird, index) => ({ id: index, type: "image" as const, bird })),
      ...birds.map((bird, index) => ({ id: index, type: "name" as const, bird })),
    ]);
    setMemoCards(cards);
    setMemoFlipped([]);
    setMemoMatched([]);
    setMemoMoves(0);
    setMemoDone(false);
  }

  function handleMemoClick(index: number) {
    if (memoDone) return;
    const card = memoCards[index];
    if (!card) return;
    if (memoFlipped.includes(index) || memoMatched.includes(card.id) || memoFlipped.length >= 2) return;
    setMemoFlipped((value) => [...value, index]);
  }

  function startOrdenar(db: DifficultyKey) {
    const birds = shuffle(databases[db]).slice(0, 4);
    setOrdenarBirds(birds);
    setOrdenarNames(shuffle(birds.map((bird) => bird.name)));
    setOrdenarAssignments({});
    setOrdenarDragging(null);
    setOrdenarResult("");
    setOrdenarDone(false);
  }

  function assignOrdenar(targetBird: string, draggedName: string) {
    setOrdenarAssignments((value) => ({ ...value, [targetBird]: draggedName }));
  }

  function startImpostor(db: DifficultyKey) {
    setMiniDb(db);
    setImpRound(1);
    setImpScore(0);
    setImpDone(false);
    setImpResult("");
    setImpAnswered(false);
    setImpRoundData(makeImpostorRound(db));
  }

  function makeImpostorRound(db: DifficultyKey): ImpostorRound {
    const pool = databases[db];
    const birds = shuffle(pool).slice(0, 4);
    const impostorBird =
      shuffle(pool.filter((candidate) => !birds.some((bird) => bird.name === candidate.name)))[0] ??
      shuffle(allBirds.filter((candidate) => !birds.some((bird) => bird.name === candidate.name)))[0];
    const names = birds.map((bird) => bird.name);
    names[Math.floor(Math.random() * names.length)] = impostorBird.name;
    return { birds, names: shuffle(names), impostorName: impostorBird.name };
  }

  function handleImpostorAnswer(name: string) {
    if (!impRoundData || impAnswered) return;
    setImpAnswered(true);
    const correct = name === impRoundData.impostorName;
    if (correct) {
      playSfx("correct");
      setImpScore((value) => value + 1);
      setImpResult("✅ ¡Correcto! Ese nombre no correspondía a ningún ave.");
    } else {
      playSfx("wrong");
      setImpResult(`❌ El nombre impostor era: "${impRoundData.impostorName}"`);
    }
    if (impTimerRef.current) window.clearTimeout(impTimerRef.current);
    impTimerRef.current = window.setTimeout(() => {
      if (impRound >= 10) {
        setImpDone(true);
        return;
      }
      setImpRound((value) => value + 1);
      setImpAnswered(false);
      setImpResult("");
      setImpRoundData(makeImpostorRound(miniDb));
    }, 2200);
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <Button
        className="fixed right-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-200 bg-white text-xl shadow-lg transition hover:border-emerald-400 hover:bg-emerald-50"
        onClick={() => {
          ensureMenuMusic();
          setVolumeOpen((value) => !value);
        }}
        title="Configurar audio"
      >
        🎵
      </Button>

      {toast ? (
        <div
          className={cn(
            "fixed left-1/2 top-18 z-40 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg",
            toast.kind === "error" ? "bg-rose-700" : toast.kind === "success" ? "bg-emerald-700" : "bg-zinc-800",
          )}
        >
          {toast.message}
        </div>
      ) : null}

      {volumeOpen ? <VolumePanel panelRef={volumeRef} audioSettings={audioSettings} onAudioSettingsChange={setAudioSettings} onClose={() => setVolumeOpen(false)} /> : null}
      {recordsOpen ? <RecordsModal rankLabel={rankLabel} overallPct={overallPct} starCount={starCount} unlocked={unlocked} records={records} onClose={() => setRecordsOpen(false)} /> : null}

      {screen === "menu" ? (
        <MenuScreen
          rankLabel={rankLabel}
          overallPct={overallPct}
          starCount={starCount}
          records={records}
          unlocked={unlocked}
          onRecordsOpen={() => setRecordsOpen(true)}
          onModeOpen={(mode) => performAction(() => openMode(mode))}
          onGuideOpen={() =>
            performAction(() => {
              duckMusic();
              setGuideFilter("todos");
              setScreen("guide");
            })
          }
          onMiniGamesOpen={() =>
            performAction(() => {
              duckMusic();
              setScreen("minigames");
            })
          }
          onSecretOpen={() => performAction(() => setScreen("secret"))}
        />
      ) : null}

      {screen === "difficulty-select" ? (
        <DifficultySelector pendingMode={pendingMode} unlocked={unlocked} records={records} onBack={() => performAction(goMenu)} onStart={(mode, db) => performAction(() => startGame(mode, db))} />
      ) : null}

      {screen === "game" ? (
        <GameScreen
          currentQuestion={currentQuestion}
          currentMode={currentMode}
          currentDb={currentDb}
          currentSubMode={currentSubMode}
          questionIndex={questionIndex}
          queueLength={queue.length}
          score={score}
          elapsedSeconds={elapsedSeconds}
          progressPct={progressPct}
          audioSettings={audioSettings}
          playingSoundSrc={playingSoundSrc}
          writeValue={writeValue}
          writeAttempts={writeAttempts}
          selectedOption={selectedOption}
          wrongOptions={wrongOptions}
          resultText={resultText}
          showReveal={showReveal}
          imageOptions={imageOptions}
          imagePickOptions={imagePickOptions}
          soundOptions={soundOptions}
          nameSoundOptions={nameSoundOptions}
          nameSoundReady={nameSoundReady}
          nameSoundPlayed={nameSoundPlayed}
          onBack={() => performAction(goMenu)}
          onAudioSettingsChange={setAudioSettings}
          onPlayBirdSound={playBirdSound}
          onOptionAnswer={handleOptionAnswer}
          onWriteValueChange={setWriteValue}
          onWriteSubmit={handleWriteSubmit}
          onNameSoundOption={handleNameSoundOption}
        />
      ) : null}

      {screen === "guide" ? <GuideScreen guideFilter={guideFilter} birds={filteredGuideBirds} onFilterChange={setGuideFilter} onBack={() => performAction(goMenu)} onPlayBirdSound={playBirdSound} /> : null}
      {screen === "minigames" ? <MinigamesScreen onBack={() => performAction(goMenu)} onLaunch={(game, db) => performAction(() => launchMiniGame(game, db))} /> : null}
      {screen === "memo" ? (
        <MemoGame
          miniDb={miniDb}
          cards={memoCards}
          flipped={memoFlipped}
          matched={memoMatched}
          moves={memoMoves}
          done={memoDone}
          onBack={() => performAction(() => setScreen("minigames"))}
          onCardClick={handleMemoClick}
          onRestart={() => performAction(() => startMemo(miniDb))}
          onChangeMiniGame={() => performAction(() => setScreen("minigames"))}
        />
      ) : null}
      {screen === "ordenar" ? (
        <OrdenarGame
          miniDb={miniDb}
          birds={ordenarBirds}
          names={ordenarNames}
          assignments={ordenarAssignments}
          dragging={ordenarDragging}
          result={ordenarResult}
          done={ordenarDone}
          onBack={() => performAction(() => setScreen("minigames"))}
          onAssign={assignOrdenar}
          onDragStart={setOrdenarDragging}
          onDragEnd={() => setOrdenarDragging(null)}
          onRestart={() => performAction(() => startOrdenar(miniDb))}
          onChangeMiniGame={() => performAction(() => setScreen("minigames"))}
        />
      ) : null}
      {screen === "impostor" ? (
        <ImpostorGame
          miniDb={miniDb}
          round={impRound}
          score={impScore}
          done={impDone}
          result={impResult}
          roundData={impRoundData}
          answered={impAnswered}
          onBack={() => performAction(() => setScreen("minigames"))}
          onAnswer={handleImpostorAnswer}
          onRestart={() => performAction(() => startImpostor(miniDb))}
          onChangeMiniGame={() => performAction(() => setScreen("minigames"))}
        />
      ) : null}
      {screen === "results" ? <ResultsScreen resultState={resultState} onRestart={() => performAction(() => startGame(currentMode, currentDb))} onMenu={() => performAction(goMenu)} /> : null}
      {screen === "secret" ? <SecretScreen onBack={() => performAction(goMenu)} /> : null}
    </main>
  );
}
