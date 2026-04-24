"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALE_LIB_HINT,
  ALE_OPC_HINT,
  ALL_CATS,
  databases,
  TOTAL_STARS,
  UNLOCK_HINTS,
  allBirds,
} from "@/lib/data";
import {
  checkUnlocks,
  countStars,
  formatTime,
  getBestPct,
  getDbMeta,
  getGroupPct,
  getModeTitle,
  getOverallPct,
  getRankLabel,
  getSoundFile,
  getSubModePct,
  helperText,
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
import type {
  AudioSettings,
  BaseMode,
  Bird,
  DifficultyKey,
  GameMode,
  MiniGame,
  ModeCell,
  RecordsMap,
  Screen,
} from "@/lib/types";

const OPTION_MODES: BaseMode[] = ["imagen", "nombre", "sonido"];
const FREE_MODES: BaseMode[] = ["imagen-libre", "nombre-sonido", "sonido-libre"];
const DB_BADGE: Record<DifficultyKey, string> = {
  facil: "🟢 Fácil",
  medio: "🔵 Medio",
  dificil: "🔴 Difícil",
  experto: "🟣 Experto",
};

const GROUP_MODES: Record<string, GameMode[]> = {
  imagen: ["imagen", "imagen-libre"],
  nombre: ["nombre", "nombre-sonido"],
  sonido: ["sonido", "sonido-libre"],
  aleatorio: ["aleatorio-opc", "aleatorio-libre"],
};

const MUSIC_TRACKS = ["/sonidos/musicamenu1.mp3", "/sonidos/musicamenu2.mp3", "/sonidos/musicamenu3.mp3"];

type ResultState = {
  subtitle: string;
  score: number;
  total: number;
  elapsedSeconds: number;
  newBadges: string[];
  newlyUnlocked: { unlock: string; label: string }[];
  bestScore: number;
  bestTime?: number;
};

type ToastState = {
  kind: "success" | "error" | "info";
  message: string;
};

type MemoCard = {
  id: number;
  type: "image" | "name";
  bird: Bird;
};

type ImpostorRound = {
  birds: Bird[];
  names: string[];
  impostorName: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toneClasses(tone: "low" | "mid" | "high") {
  if (tone === "high") return "text-emerald-700";
  if (tone === "mid") return "text-orange-600";
  return "text-zinc-600";
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-gentle-pop rounded-[28px] border border-emerald-200/80 bg-white/90 p-5 shadow-[0_24px_80px_-32px_rgba(16,60,31,0.45)] backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

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
  const [toast, setToast] = useState<ToastState | null>(null);
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

  const menuAudioRef = useRef<HTMLAudioElement | null>(null);
  const birdAudioRef = useRef<HTMLAudioElement | null>(null);
  const birdAudioSrcRef = useRef<string | null>(null);
  const toastRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextQuestionTimerRef = useRef<number | null>(null);
  const impTimerRef = useRef<number | null>(null);
  const memoTimerRef = useRef<number | null>(null);
  const musicStartedRef = useRef(false);
  const volumeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setUnlocked(loadUnlocked());
    setRecords(loadRecords());
    setAudioSettings(loadAudioSettings());
  }, []);

  useEffect(() => {
    saveAudioSettings(audioSettings);
    if (menuAudioRef.current) {
      menuAudioRef.current.volume = audioSettings.musicMuted ? 0 : audioSettings.musicVolume;
    }
    if (birdAudioRef.current) {
      birdAudioRef.current.volume = audioSettings.birdMuted ? 0 : audioSettings.birdVolume;
    }
  }, [audioSettings]);

  useEffect(() => {
    if (screen !== "game") return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    setWriteValue("");
    setWriteAttempts(0);
    setSelectedOption(null);
    setWrongOptions([]);
    setResultText("");
    setShowReveal(false);
    setNameSoundReady(null);
    setNameSoundPlayed([]);
    setFailedOnce(false);

    if (screen !== "game" || !currentQuestion) return;

    const activeMode = (currentMode === "aleatorio-opc" || currentMode === "aleatorio-libre"
      ? pickAleatorioSubMode(currentMode)
      : currentMode) as BaseMode;

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
      stopBirdAudio();
      if (menuAudioRef.current) menuAudioRef.current.pause();
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

  const overallPct = useMemo(() => getOverallPct(records), [records]);
  const starCount = useMemo(() => countStars(records), [records]);
  const rankLabel = useMemo(() => getRankLabel(overallPct), [overallPct]);

  const filteredGuideBirds = useMemo(() => {
    if (guideFilter === "todos") return allBirds;
    if (guideFilter === "A–Z") return [...allBirds].sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (guideFilter === "Por nivel") return allBirds;
    return allBirds.filter((bird) => bird.cat.includes(guideFilter));
  }, [guideFilter]);

  function showToast(kind: ToastState["kind"], message: string) {
    if (toastRef.current) window.clearTimeout(toastRef.current);
    setToast({ kind, message });
    toastRef.current = window.setTimeout(() => setToast(null), 3000);
  }

  function getAudioContext() {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  }

  function beep(frequency: number, duration: number, gain: number, type: OscillatorType = "triangle", delay = 0) {
    const ctx = getAudioContext();
    if (!ctx || audioSettings.sfxMuted) return;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.connect(envelope);
    envelope.connect(ctx.destination);
    const start = ctx.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.linearRampToValueAtTime(gain * audioSettings.sfxVolume * 0.4, start + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  }

  function playSfx(kind: "click" | "correct" | "wrong" | "finish" | "record" | "unlock" | "memo") {
    if (kind === "click") {
      beep(600, 0.08, 0.12, "sine");
      return;
    }
    if (kind === "wrong") {
      beep(280, 0.18, 0.12, "sawtooth");
      beep(220, 0.18, 0.1, "sawtooth", 0.12);
      return;
    }
    if (kind === "correct") {
      beep(523, 0.24, 0.13);
      beep(659, 0.24, 0.13, "triangle", 0.08);
      beep(784, 0.28, 0.13, "triangle", 0.16);
      return;
    }
    if (kind === "finish") {
      [392, 392, 392, 523, 659].forEach((frequency, index) => beep(frequency, 0.2, 0.13, "triangle", index * 0.1));
      return;
    }
    if (kind === "record") {
      [523, 659, 784, 1047, 880].forEach((frequency, index) => beep(frequency, 0.24, 0.15, "triangle", index * 0.08));
      return;
    }
    if (kind === "unlock") {
      [523, 659, 784, 1047].forEach((frequency, index) => beep(frequency, 0.28, 0.16, "triangle", index * 0.14));
      return;
    }
    beep(784, 0.14, 0.1, "sine");
    beep(880, 0.14, 0.1, "sine", 0.12);
    beep(1047, 0.2, 0.1, "sine", 0.25);
  }

  function ensureMenuMusic() {
    if (musicStartedRef.current || typeof window === "undefined") return;
    musicStartedRef.current = true;
    const src = shuffle(MUSIC_TRACKS)[0];
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = audioSettings.musicMuted ? 0 : audioSettings.musicVolume;
    audio.play().catch(() => {
      musicStartedRef.current = false;
    });
    menuAudioRef.current = audio;
  }

  function duckMusic() {
    if (!menuAudioRef.current || audioSettings.musicMuted) return;
    menuAudioRef.current.volume = Math.max(0.03, audioSettings.musicVolume * 0.18);
  }

  function restoreMusic() {
    if (!menuAudioRef.current) return;
    menuAudioRef.current.volume = audioSettings.musicMuted ? 0 : audioSettings.musicVolume;
  }

  function stopBirdAudio() {
    if (!birdAudioRef.current) return;
    birdAudioRef.current.pause();
    birdAudioRef.current.currentTime = 0;
    birdAudioRef.current = null;
    birdAudioSrcRef.current = null;
    restoreMusic();
  }

  function playBirdSound(src: string) {
    ensureMenuMusic();
    if (birdAudioRef.current && birdAudioSrcRef.current === src) {
      stopBirdAudio();
      return;
    }
    stopBirdAudio();
    duckMusic();
    const audio = new Audio(src);
    audio.volume = audioSettings.birdMuted ? 0 : audioSettings.birdVolume;
    audio.onended = () => {
      birdAudioRef.current = null;
      birdAudioSrcRef.current = null;
      restoreMusic();
    };
    audio.play().catch(() => restoreMusic());
    birdAudioRef.current = audio;
    birdAudioSrcRef.current = src;
  }

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

  useEffect(() => {
    if (writeAttempts < 2) return;
    setShowReveal(true);
  }, [writeAttempts]);

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

  function restartCurrentGame() {
    performAction(() => startGame(currentMode, currentDb));
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
    return {
      birds,
      names: shuffle(names),
      impostorName: impostorBird.name,
    };
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

  function renderRecordsModal() {
    const groups = [
      { title: "🖼️ Por Imagen", modes: [["imagen", "Opciones"], ["imagen-libre", "Escribir"]] },
      { title: "🔤 Por Nombre", modes: [["nombre", "Imagen"], ["nombre-sonido", "Sonido"]] },
      { title: "🎧 Por Sonido", modes: [["sonido", "Opciones"], ["sonido-libre", "Escribir"]] },
      { title: "🎲 Aleatorio — Con Opciones", modes: [["aleatorio-opc", "Con opciones"]] },
      { title: "🎲 Aleatorio — Sin Opciones", modes: [["aleatorio-libre", "Sin opciones"]] },
    ] as const;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRecordsOpen(false)}>
        <SectionCard className="max-h-[82vh] w-full max-w-2xl overflow-y-auto p-6" >
          <div onClick={(event) => event.stopPropagation()}>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-emerald-900">📊 Mis Récords</h2>
              <p className="text-sm text-zinc-500">
                Rango: {rankLabel} · {overallPct}% · ⭐ {starCount}/{TOTAL_STARS}
              </p>
            </div>
            <div className="space-y-5">
              {groups.map((group) => (
                <div key={group.title}>
                  <div className="mb-2 border-b border-emerald-100 pb-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                    {group.title}
                  </div>
                  <div className="space-y-2">
                    {group.modes.flatMap(([mode, label]) =>
                      (["facil", "medio", "dificil", "experto"] as DifficultyKey[]).map((db) => {
                        const cell = `${mode}_${db}`;
                        const unlockedCell = unlocked.has(cell);
                        const record = records[cell as ModeCell];
                        const total = databases[db].length;
                        const pct = record?.bestScore !== undefined ? Math.round((record.bestScore / total) * 100) : 0;
                        const hint =
                          mode === "aleatorio-opc"
                            ? `${ALE_OPC_HINT} ${DB_BADGE[db].split(" ")[0]}`
                            : mode === "aleatorio-libre"
                              ? `${ALE_LIB_HINT} ${DB_BADGE[db].split(" ")[0]}`
                              : UNLOCK_HINTS[cell] ?? "Bloqueado";
                        return (
                          <div key={cell} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-100 px-4 py-3 text-sm">
                            <span className="text-zinc-700">
                              {label} {DB_BADGE[db].split(" ")[0]} {!unlockedCell ? "🔒" : ""}
                            </span>
                            {!unlockedCell ? (
                              <span className="text-right text-xs text-zinc-400">{hint}</span>
                            ) : !record?.bestScore && record?.bestScore !== 0 ? (
                              <span className="text-zinc-400">Sin jugar</span>
                            ) : (
                              <span className={cn("font-semibold", toneClasses(pctTone(pct)))}>
                                {pct === 100 ? "⭐ " : ""}
                                {record?.bestScore}/{total} · {pct}%
                                {record?.bestTime !== undefined ? ` · ⏱ ${formatTime(record.bestTime)}` : ""}
                              </span>
                            )}
                          </div>
                        );
                      }),
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-6 w-full rounded-2xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800"
              onClick={() => setRecordsOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderVolumePanel() {
    return (
      <div ref={volumeRef} className="fixed right-4 top-20 z-40 w-72 rounded-[24px] border border-emerald-200 bg-white/95 p-5 shadow-2xl backdrop-blur">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">🎛️ Control de Audio</div>
        {[
          ["Música", "musicVolume", "musicMuted"] as const,
          ["Cantos", "birdVolume", "birdMuted"] as const,
          ["Efectos", "sfxVolume", "sfxMuted"] as const,
        ].map(([label, volumeKey, muteKey]) => (
          <div key={label} className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm text-zinc-600">
              <span>{label}</span>
              <button
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  audioSettings[muteKey] ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700",
                )}
                onClick={() => setAudioSettings((value) => ({ ...value, [muteKey]: !value[muteKey] }))}
              >
                {audioSettings[muteKey] ? "🔕" : "🔊"}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audioSettings[volumeKey]}
              onChange={(event) => setAudioSettings((value) => ({ ...value, [volumeKey]: Number(event.target.value) }))}
              className="w-full accent-emerald-700"
            />
          </div>
        ))}
        <button
          className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
          onClick={() => setVolumeOpen(false)}
        >
          Cerrar
        </button>
      </div>
    );
  }

  function renderMenu() {
    return (
      <SectionCard className="mx-auto w-full max-w-3xl p-6 sm:p-8">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.38em] text-emerald-700/70">Entrenamiento ornitológico</p>
          <h1 className="text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">🐦 Adiviná el Ave</h1>
          <p className="mt-3 text-sm text-zinc-600">Entrenamiento de identificación de aves argentinas</p>
        </div>

        <button
          className="mb-6 w-full rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
          onClick={() => setRecordsOpen(true)}
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-zinc-700">Progreso total</div>
              <div className="text-xs italic text-zinc-500">{rankLabel}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-amber-600">⭐ {starCount}/{helperText.totalStars}</div>
              <div className={cn("text-lg font-bold", toneClasses(pctTone(overallPct)))}>{overallPct}%</div>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="mt-2 text-right text-xs text-zinc-400">Tocá para ver tus récords →</div>
        </button>

        <div className="space-y-4">
          {Object.entries(GROUP_MODES).map(([groupKey, modes]) => {
            const cells = modes.flatMap((mode) =>
              (["facil", "medio", "dificil", "experto"] as DifficultyKey[])
                .filter((db) => unlocked.has(`${mode}_${db}`))
                .map((db) => `${mode}_${db}`),
            );
            const avgPct = getGroupPct(records, cells);
            const groupLocked = cells.length === 0;
            const title = groupKey === "imagen" ? "🖼️ Por Imagen" : groupKey === "nombre" ? "🔤 Por Nombre" : groupKey === "sonido" ? "🎧 Por Sonido" : "🎲 Aleatorio";

            return (
              <div key={groupKey} className={cn("overflow-hidden rounded-[24px] border", groupLocked ? "border-zinc-200 bg-zinc-100/70" : "border-emerald-200 bg-emerald-50/50")}>
                <div className="flex items-center justify-between gap-4 border-b border-black/5 px-5 py-4">
                  <div className="text-sm font-semibold text-zinc-800">{title}</div>
                  <div className={cn("text-sm font-semibold", groupLocked ? "text-zinc-400" : toneClasses(pctTone(avgPct)))}>
                    {groupLocked ? "🔒 Bloqueado" : `Progreso ${avgPct}%`}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-px bg-black/5 sm:grid-cols-2">
                  {modes.map((mode) => {
                    const modeUnlocked = (["facil", "medio", "dificil", "experto"] as DifficultyKey[]).some((db) => unlocked.has(`${mode}_${db}`));
                    const subPct = getSubModePct(records, unlocked, mode);
                    const label =
                      mode === "imagen"
                        ? ["🔘", "Opciones", "Elegí entre 4 nombres"]
                        : mode === "imagen-libre"
                          ? ["✏️", "Escribir", "Escribí el nombre vos"]
                          : mode === "nombre"
                            ? ["🖼️", "Imagen", "Elegí la foto correcta"]
                            : mode === "nombre-sonido"
                              ? ["🔊", "Sonido", "Elegí el canto correcto"]
                              : mode === "sonido"
                                ? ["🔘", "Opciones", "Elegí entre 4 nombres"]
                                : mode === "sonido-libre"
                                  ? ["✏️", "Escribir", "Escribí el nombre vos"]
                                  : mode === "aleatorio-opc"
                                    ? ["🎲", "Con opciones", "Imagen, nombre o sonido al azar"]
                                    : ["🎲", "Sin opciones", "Escritura o canto al azar"];

                    const hint =
                      mode === "aleatorio-opc"
                        ? ALE_OPC_HINT
                        : mode === "aleatorio-libre"
                          ? ALE_LIB_HINT
                          : UNLOCK_HINTS[`${mode}_facil`] ?? "Bloqueado";

                    return (
                      <button
                        key={mode}
                        disabled={!modeUnlocked}
                        onClick={() => performAction(() => openMode(mode))}
                        className={cn(
                          "bg-white px-5 py-4 text-left transition",
                          modeUnlocked ? "hover:bg-emerald-50" : "cursor-not-allowed bg-zinc-100 text-zinc-400",
                        )}
                      >
                        <div className="text-lg">{label[0]}</div>
                        <div className="mt-1 text-sm font-semibold">{label[1]}</div>
                        <div className="text-xs text-zinc-500">{label[2]}</div>
                        <div className={cn("mt-3 text-xs font-semibold", modeUnlocked ? toneClasses(pctTone(subPct)) : "text-zinc-400")}>
                          {modeUnlocked ? `${subPct}%${subPct === 100 ? " ⭐" : ""}` : `🔒 ${hint}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            className="flex w-full items-center gap-4 rounded-[24px] border border-emerald-200 bg-white px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50"
            onClick={() => performAction(() => {
              duckMusic();
              setGuideFilter("todos");
              setScreen("guide");
            })}
          >
            <div className="text-3xl">📖</div>
            <div>
              <div className="font-semibold text-zinc-900">Guía de Aves</div>
              <div className="text-sm text-zinc-500">Explorá todas las aves con sus nombres, nombres científicos y cantos.</div>
            </div>
          </button>

          <button
            className="flex w-full items-center gap-4 rounded-[24px] border border-fuchsia-200 bg-fuchsia-50 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-fuchsia-300 hover:bg-fuchsia-100/70"
            onClick={() => performAction(() => {
              duckMusic();
              setScreen("minigames");
            })}
          >
            <div className="text-3xl">🎮</div>
            <div>
              <div className="font-semibold text-fuchsia-900">Minijuegos</div>
              <div className="text-sm text-zinc-500">Memotest, Ordenar y Encontrá al Impostor. Para practicar sin presión.</div>
            </div>
          </button>

          <button
            disabled={overallPct < 100}
            className={cn(
              "flex w-full items-center gap-4 rounded-[24px] border px-5 py-4 text-left transition",
              overallPct >= 100
                ? "border-amber-300 bg-amber-50 hover:-translate-y-0.5 hover:bg-amber-100/70"
                : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-500",
            )}
            onClick={() => performAction(() => setScreen("secret"))}
          >
            <div className="text-3xl">{overallPct >= 100 ? "🎉" : "🔒"}</div>
            <div>
              <div className="font-semibold">{overallPct >= 100 ? "Mensaje Secreto" : "Mensaje Secreto"}</div>
              <div className="text-sm text-zinc-500">
                {overallPct >= 100 ? "¡Felicitaciones! Hacé clic para leer tu mensaje." : "Completá el 100% del juego para desbloquearlo."}
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 border-t border-emerald-100 pt-5 text-center text-sm text-zinc-500">
          <strong className="text-zinc-700">Hecho por Emanuel Juliá</strong>
          <br />
          Compositor · Director Coral
        </div>
      </SectionCard>
    );
  }

  function renderDifficultySelector() {
    if (!pendingMode) return null;
    return (
      <SectionCard className="mx-auto w-full max-w-2xl p-6 sm:p-8">
        <button className="mb-5 text-sm font-semibold text-emerald-700" onClick={() => performAction(() => goMenu())}>
          ← Volver al menú
        </button>
        <h2 className="text-3xl font-bold text-emerald-950">🗂️ Elegí la dificultad</h2>
        <p className="mt-2 text-sm text-zinc-500">Modo: {getModeTitle(pendingMode)}</p>
        <div className="mt-6 space-y-3">
          {(["facil", "medio", "dificil", "experto"] as DifficultyKey[]).map((db) => {
            const meta = getDbMeta(db);
            const cell = `${pendingMode}_${db}`;
            const locked = !unlocked.has(cell);
            const pct = getBestPct(records, cell);
            const record = records[cell as ModeCell];
            const hint =
              pendingMode === "aleatorio-opc"
                ? helperText.aleOpc
                : pendingMode === "aleatorio-libre"
                  ? helperText.aleLib
                  : UNLOCK_HINTS[cell] ?? "";

            return (
              <button
                key={db}
                disabled={locked}
                onClick={() => performAction(() => startGame(pendingMode, db))}
                className={cn(
                  "w-full rounded-[24px] border px-5 py-5 text-left transition",
                  locked ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-500" : "border-emerald-200 bg-emerald-50/50 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50",
                )}
              >
                <div className="mb-2 inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
                  {locked ? "🔒 Bloqueado" : `${meta.emoji} ${db[0].toUpperCase()}${db.slice(1)}`}
                </div>
                <div className="text-lg font-semibold text-zinc-900">{meta.title}</div>
                <div className="mt-1 text-sm text-zinc-500">{meta.desc}</div>
                <div className="mt-3 text-xs text-zinc-500">
                  {databases[db].length} aves ·{" "}
                  {locked ? (
                    <span className="text-zinc-400">Nivel bloqueado</span>
                  ) : (
                    <span className={cn("font-semibold", toneClasses(pctTone(pct)))}>
                      {pct}%{pct === 100 ? " ⭐" : ""}
                      {record?.bestTime !== undefined ? ` · ⏱ ${formatTime(record.bestTime)}` : ""}
                    </span>
                  )}
                </div>
                {locked && hint ? <div className="mt-2 text-xs font-medium text-orange-600">📌 {hint}</div> : null}
              </button>
            );
          })}
        </div>
      </SectionCard>
    );
  }

  function renderGame() {
    if (!currentQuestion) return null;
    return (
      <SectionCard className="mx-auto w-full max-w-3xl p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button className="text-sm font-semibold text-emerald-700" onClick={() => performAction(() => goMenu())}>
            ← Volver al menú
          </button>
          <button
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold transition",
              audioSettings.autoPlayEnabled ? "border-emerald-400 bg-emerald-100 text-emerald-800" : "border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
            onClick={() => setAudioSettings((value) => ({ ...value, autoPlayEnabled: !value.autoPlayEnabled }))}
          >
            🔊 Auto: {audioSettings.autoPlayEnabled ? "ON" : "OFF"}
          </button>
        </div>

        <div className="mb-5">
          <h2 className="text-2xl font-bold text-zinc-900">{getModeTitle(currentMode)} {DB_BADGE[currentDb].split(" ")[0]}</h2>
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
            {questionIndex} de {queue.length} respondidas
          </div>
        </div>

        <div className="space-y-5">
          {(currentSubMode === "imagen" || currentSubMode === "imagen-libre") && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-64 flex-1 items-center justify-center overflow-hidden rounded-[24px] border border-zinc-200 bg-white">
                  <img src={currentQuestion.image} alt={currentQuestion.name} className="max-h-full max-w-full object-contain" />
                </div>
                <button
                  className={cn(
                    "inline-flex h-14 w-14 items-center justify-center self-center rounded-full border-2 border-emerald-200 bg-white text-2xl text-emerald-700 transition hover:scale-105 hover:border-emerald-400 hover:bg-emerald-50",
                    birdAudioSrcRef.current === getSoundFile(currentQuestion.image) && "animate-pulse-ring bg-emerald-100",
                  )}
                  onClick={() => playBirdSound(getSoundFile(currentQuestion.image))}
                >
                  🔊
                </button>
              </div>
              <div className="text-xs italic text-zinc-500">{currentQuestion.obra}</div>
            </>
          )}

          {currentSubMode === "imagen" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {imageOptions.map((option) => (
                <button
                  key={option}
                  disabled={selectedOption === "correct" || wrongOptions.includes(option)}
                  onClick={() => handleOptionAnswer(option === currentQuestion.name, option)}
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
                </button>
              ))}
            </div>
          )}

          {currentSubMode === "imagen-libre" && (
            <div>
              <p className="mb-2 text-sm text-zinc-500">Escribí el nombre del ave:</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={writeValue}
                  onChange={(event) => setWriteValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleWriteSubmit();
                  }}
                  className="flex-1 rounded-[18px] border-2 border-emerald-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
                  placeholder="Nombre del ave..."
                />
                <button className="rounded-[18px] bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800" onClick={handleWriteSubmit}>
                  ✓
                </button>
              </div>
              {showReveal && writeAttempts >= 2 ? (
                <div className="mt-3 rounded-[18px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-zinc-700">
                  💡 La respuesta es: <strong>{currentQuestion.name}</strong>
                </div>
              ) : null}
            </div>
          )}

          {currentSubMode === "nombre" && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-[22px] border-2 border-emerald-200 bg-white px-5 py-4 text-center text-2xl font-bold text-zinc-900">
                  {currentQuestion.name}
                </div>
                <button
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-200 bg-white text-2xl text-emerald-700"
                  onClick={() => playBirdSound(getSoundFile(currentQuestion.image))}
                >
                  🔊
                </button>
              </div>
              <div className="text-xs italic text-zinc-500">{currentQuestion.obra}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {imagePickOptions.map((bird) => (
                  <button
                    key={bird.image}
                    disabled={selectedOption === "correct" || wrongOptions.includes(bird.image)}
                    onClick={() => handleOptionAnswer(bird.image === currentQuestion.image, bird.image)}
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
                  </button>
                ))}
              </div>
            </>
          )}

          {currentSubMode === "nombre-sonido" && (
            <>
              <div className="rounded-[22px] border-2 border-emerald-200 bg-white px-5 py-4 text-center text-2xl font-bold text-zinc-900">
                {currentQuestion.name}
              </div>
              <div className="text-xs italic text-zinc-500">{currentQuestion.obra}</div>
              <p className="text-sm text-zinc-500">Escuchá los cantos y elegí el del ave.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {nameSoundOptions.map((bird, index) => {
                  const key = bird.image;
                  const played = nameSoundPlayed.includes(key);
                  const ready = nameSoundReady === key;
                  const wrong = wrongOptions.includes(key);
                  const correct = selectedOption === key;
                  return (
                    <button
                      key={key}
                      disabled={correct || wrong}
                      onClick={() => {
                        if (!played) {
                          playBirdSound(getSoundFile(bird.image));
                          setNameSoundPlayed((value) => [...value, key]);
                          setNameSoundReady(key);
                          return;
                        }
                        handleOptionAnswer(bird.image === currentQuestion.image, key);
                      }}
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
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-50 text-xl text-emerald-700">
                        ▶️
                      </div>
                      <div className="mt-3 text-xs text-zinc-500">Canto {index + 1}</div>
                      <div className="mt-1 text-xs font-semibold text-zinc-700">{played ? "Tocá de nuevo para responder" : "Tocá para escuchar"}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {(currentSubMode === "sonido" || currentSubMode === "sonido-libre") && (
            <div className="rounded-[24px] border-2 border-emerald-200 bg-white px-5 py-6 text-center">
              <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">Escuchá el canto del ave</div>
              <button
                className={cn(
                  "mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-emerald-600 bg-emerald-50 text-3xl text-emerald-700 transition hover:scale-105",
                  birdAudioSrcRef.current === getSoundFile(currentQuestion.image) && "animate-pulse-ring bg-emerald-100",
                )}
                onClick={() => playBirdSound(getSoundFile(currentQuestion.image))}
              >
                ▶️
              </button>
              <div className="mt-3 text-xs text-zinc-400">Clic para reproducir / detener</div>
            </div>
          )}

          {currentSubMode === "sonido" && (
            <>
              {showReveal ? (
                <div className="rounded-[20px] border-2 border-emerald-300 bg-emerald-50 p-3">
                  <div className="flex h-40 items-center justify-center overflow-hidden rounded-[14px] bg-white">
                    <img src={currentQuestion.image} alt={currentQuestion.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="mt-2 text-xs italic text-zinc-500">
                    {currentQuestion.name} · {currentQuestion.obra}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-3">
                {soundOptions.map((option) => (
                  <button
                    key={option}
                    disabled={selectedOption === "correct" || wrongOptions.includes(option)}
                    onClick={() => handleOptionAnswer(option === currentQuestion.name, option)}
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
                  </button>
                ))}
              </div>
            </>
          )}

          {currentSubMode === "sonido-libre" && (
            <>
              {showReveal ? (
                <div className="rounded-[20px] border-2 border-emerald-300 bg-emerald-50 p-3">
                  <div className="flex h-40 items-center justify-center overflow-hidden rounded-[14px] bg-white">
                    <img src={currentQuestion.image} alt={currentQuestion.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="mt-2 text-xs italic text-zinc-500">
                    {currentQuestion.name} · {currentQuestion.obra}
                  </div>
                </div>
              ) : null}
              <p className="text-sm text-zinc-500">Escribí el nombre del ave:</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={writeValue}
                  onChange={(event) => setWriteValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleWriteSubmit();
                  }}
                  className="flex-1 rounded-[18px] border-2 border-emerald-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
                  placeholder="Nombre del ave..."
                />
                <button className="rounded-[18px] bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800" onClick={handleWriteSubmit}>
                  ✓
                </button>
              </div>
              {showReveal && writeAttempts >= 2 ? (
                <div className="mt-3 rounded-[18px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-zinc-700">
                  💡 La respuesta es: <strong>{currentQuestion.name}</strong>
                </div>
              ) : null}
            </>
          )}

          <p className={cn("min-h-6 text-base font-semibold", resultText.includes("❌") ? "text-rose-700" : "text-emerald-700")}>{resultText}</p>
        </div>
      </SectionCard>
    );
  }

  function renderGuide() {
    const filters = ["todos", "Por nivel", "A–Z", ...ALL_CATS];
    return (
      <SectionCard className="mx-auto w-full max-w-5xl p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <button className="text-sm font-semibold text-emerald-700" onClick={() => performAction(() => goMenu())}>
            ← Menú
          </button>
          <h2 className="text-3xl font-bold text-zinc-900">📖 Guía de Aves</h2>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setGuideFilter(filter)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold transition",
                guideFilter === filter ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",
              )}
            >
              {filter === "todos" ? "🦜 Todas" : filter === "Por nivel" ? "📊 Por nivel" : filter === "A–Z" ? "🔤 A–Z" : filter}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {guideFilter === "Por nivel" || guideFilter === "todos"
            ? ([
                { title: "🟢 Fácil — Aves Muy Comunes", level: "facil" },
                { title: "🔵 Medio — Aves Conocidas", level: "medio" },
                { title: "🔴 Difícil — Aves Desafiantes", level: "dificil" },
              ] as const).map((group) => {
                const birds = filteredGuideBirds.filter((bird) => bird.level === group.level);
                if (!birds.length) return null;
                return (
                  <div key={group.level}>
                    <div className="mb-2 border-b border-emerald-100 pb-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                      {group.title}
                    </div>
                    <div className="grid gap-3">
                      {birds.map((bird) => (
                        <GuideCard key={`${bird.level}-${bird.name}`} bird={bird} onPlay={() => playBirdSound(getSoundFile(bird.image))} />
                      ))}
                    </div>
                  </div>
                );
              })
            : filteredGuideBirds.map((bird) => (
                <GuideCard key={`${bird.level}-${bird.name}`} bird={bird} onPlay={() => playBirdSound(getSoundFile(bird.image))} />
              ))}
        </div>
      </SectionCard>
    );
  }

  function renderMinigames() {
    const games: Array<{ id: MiniGame; icon: string; title: string; description: string }> = [
      { id: "memo", icon: "🃏", title: "Memotest", description: "Encontrá los pares imagen + nombre. Al acertar suena el canto." },
      { id: "ordenar", icon: "🔀", title: "Ordenar", description: "Arrastrá los nombres a la imagen correcta." },
      { id: "impostor", icon: "🕵️", title: "Encontrá al Impostor", description: "Uno de los nombres no corresponde a ninguna de las aves." },
    ];
    return (
      <SectionCard className="mx-auto w-full max-w-3xl p-6 sm:p-8">
        <button className="mb-5 text-sm font-semibold text-emerald-700" onClick={() => performAction(() => goMenu())}>
          ← Volver al menú
        </button>
        <h2 className="text-3xl font-bold text-fuchsia-900">🎮 Minijuegos</h2>
        <p className="mt-2 text-sm text-zinc-500">Practicá sin presión. No cuentan para tu progreso.</p>
        <div className="mt-6 space-y-4">
          {games.map((game) => (
            <div key={game.id} className="overflow-hidden rounded-[24px] border border-fuchsia-200 bg-fuchsia-50">
              <div className="flex items-center gap-4 border-b border-fuchsia-100 px-5 py-4">
                <div className="text-3xl">{game.icon}</div>
                <div>
                  <div className="font-semibold text-fuchsia-950">{game.title}</div>
                  <div className="text-sm text-zinc-500">{game.description}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px bg-fuchsia-100 sm:grid-cols-4">
                {(["facil", "medio", "dificil", "experto"] as DifficultyKey[]).map((db) => (
                  <button
                    key={db}
                    className="bg-white px-4 py-4 text-center text-sm font-semibold text-fuchsia-900 transition hover:bg-fuchsia-100"
                    onClick={() => performAction(() => launchMiniGame(game.id, db))}
                  >
                    <div>{DB_BADGE[db].split(" ")[0]}</div>
                    <div className="text-xs text-zinc-500">{db[0].toUpperCase() + db.slice(1)}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  function renderMemo() {
    return (
      <SectionCard className="mx-auto w-full max-w-4xl p-6">
        <button className="mb-5 text-sm font-semibold text-fuchsia-800" onClick={() => performAction(() => setScreen("minigames"))}>
          ← Minijuegos
        </button>
        <h2 className="text-3xl font-bold text-fuchsia-950">🃏 Memotest <span className="text-lg">{DB_BADGE[miniDb]}</span></h2>
        <div className="mt-3 flex flex-wrap gap-6 text-sm text-zinc-600">
          <div>Movimientos: <span className="font-bold text-emerald-700">{memoMoves}</span></div>
          <div>Pares: <span className="font-bold text-emerald-700">{memoMatched.length}</span> / {memoCards.length / 2}</div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {memoCards.map((card, index) => {
            const flipped = memoFlipped.includes(index) || memoMatched.includes(card.id);
            const matched = memoMatched.includes(card.id);
            return (
              <button
                key={`${card.id}-${card.type}-${index}`}
                onClick={() => handleMemoClick(index)}
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
              </button>
            );
          })}
        </div>
        {memoDone ? (
          <div className="mt-6 rounded-[24px] border border-fuchsia-200 bg-fuchsia-50 p-6 text-center">
            <h3 className="text-2xl font-bold text-fuchsia-900">🎉 ¡Completaste el Memotest!</h3>
            <div className="mt-3 text-lg">Movimientos: <span className="text-4xl font-bold text-emerald-700">{memoMoves}</span></div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button className="rounded-[18px] bg-fuchsia-700 px-5 py-3 font-semibold text-white" onClick={() => performAction(() => startMemo(miniDb))}>Jugar de nuevo</button>
              <button className="rounded-[18px] border-2 border-fuchsia-700 px-5 py-3 font-semibold text-fuchsia-700" onClick={() => performAction(() => setScreen("minigames"))}>Cambiar minijuego</button>
            </div>
          </div>
        ) : null}
      </SectionCard>
    );
  }

  function renderOrdenar() {
    const shuffledNames = shuffle(ordenarBirds.map((bird) => bird.name));
    return (
      <SectionCard className="mx-auto w-full max-w-4xl p-6">
        <button className="mb-5 text-sm font-semibold text-fuchsia-800" onClick={() => performAction(() => setScreen("minigames"))}>
          ← Minijuegos
        </button>
        <h2 className="text-3xl font-bold text-fuchsia-950">🔀 Ordenar <span className="text-lg">{DB_BADGE[miniDb]}</span></h2>
        <p className="mt-2 text-sm text-zinc-500">Arrastrá los nombres al casillero de la imagen correspondiente.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {ordenarBirds.map((bird) => {
            const placed = ordenarAssignments[bird.name];
            const correct = placed === bird.name;
            const wrong = Boolean(placed) && placed !== bird.name;
            return (
              <div key={bird.name} className="rounded-[22px] border border-emerald-200 bg-white p-3">
                <div className="flex h-36 items-center justify-center rounded-[16px] bg-zinc-50">
                  <img src={bird.image} alt={bird.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => ordenarDragging && assignOrdenar(bird.name, ordenarDragging)}
                  className={cn(
                    "mt-3 rounded-[16px] border-2 border-dashed px-4 py-3 text-center text-sm font-semibold",
                    correct
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : wrong
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-emerald-200 bg-emerald-50 text-zinc-400",
                  )}
                >
                  {placed ?? "Soltá aquí"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {shuffledNames.map((name) => {
            const alreadyPlaced = Object.values(ordenarAssignments).includes(name);
            return (
              <div
                key={name}
                draggable={!alreadyPlaced}
                onDragStart={() => setOrdenarDragging(name)}
                onDragEnd={() => setOrdenarDragging(null)}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-sm font-semibold",
                  alreadyPlaced ? "hidden" : "cursor-grab border-emerald-700 bg-white text-emerald-700",
                )}
              >
                {name}
              </div>
            );
          })}
        </div>
        <p className={cn("mt-4 min-h-6 text-center font-semibold", ordenarResult.includes("❌") ? "text-rose-700" : "text-emerald-700")}>{ordenarResult}</p>
        {ordenarDone ? (
          <div className="mt-4 rounded-[24px] border border-fuchsia-200 bg-fuchsia-50 p-6 text-center">
            <h3 className="text-2xl font-bold text-fuchsia-900">✅ ¡Todas asociadas correctamente!</h3>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button className="rounded-[18px] bg-fuchsia-700 px-5 py-3 font-semibold text-white" onClick={() => performAction(() => startOrdenar(miniDb))}>Jugar de nuevo</button>
              <button className="rounded-[18px] border-2 border-fuchsia-700 px-5 py-3 font-semibold text-fuchsia-700" onClick={() => performAction(() => setScreen("minigames"))}>Cambiar minijuego</button>
            </div>
          </div>
        ) : null}
      </SectionCard>
    );
  }

  function renderImpostor() {
    return (
      <SectionCard className="mx-auto w-full max-w-4xl p-6">
        <button className="mb-5 text-sm font-semibold text-fuchsia-800" onClick={() => performAction(() => setScreen("minigames"))}>
          ← Minijuegos
        </button>
        <h2 className="text-3xl font-bold text-fuchsia-950">🕵️ Impostor <span className="text-lg">{DB_BADGE[miniDb]}</span></h2>
        <p className="mt-2 text-sm text-zinc-500">¿Cuál de estos nombres no corresponde a ninguna de las aves que ves?</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {impRoundData?.birds.map((bird) => (
            <div key={bird.name} className="rounded-[22px] border border-zinc-200 bg-white p-3">
              <div className="flex h-36 items-center justify-center rounded-[16px] bg-zinc-50">
                <img src={bird.image} alt={bird.name} className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {impRoundData?.names.map((name) => (
            <button
              key={name}
              disabled={impAnswered}
              onClick={() => handleImpostorAnswer(name)}
              className={cn(
                "rounded-full border-2 px-5 py-3 text-sm font-semibold transition",
                impAnswered && name === impRoundData.impostorName
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-zinc-300 bg-white text-zinc-800 hover:border-orange-400 hover:bg-orange-50",
              )}
            >
              {name}
            </button>
          ))}
        </div>
        <p className={cn("mt-4 min-h-6 text-center font-semibold", impResult.includes("❌") ? "text-rose-700" : "text-emerald-700")}>{impResult}</p>
        <div className="mt-2 flex justify-center gap-6 text-sm text-zinc-600">
          <div>Aciertos: <span className="font-bold text-emerald-700">{impScore}</span></div>
          <div>Ronda: <span className="font-bold">{impRound}</span> / 10</div>
        </div>
        {impDone ? (
          <div className="mt-4 rounded-[24px] border border-fuchsia-200 bg-fuchsia-50 p-6 text-center">
            <h3 className="text-2xl font-bold text-fuchsia-900">🕵️ ¡Ronda terminada!</h3>
            <div className="mt-3">
              Tu puntaje: <span className="text-4xl font-bold text-emerald-700">{impScore}</span> / 10
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button className="rounded-[18px] bg-fuchsia-700 px-5 py-3 font-semibold text-white" onClick={() => performAction(() => startImpostor(miniDb))}>Jugar de nuevo</button>
              <button className="rounded-[18px] border-2 border-fuchsia-700 px-5 py-3 font-semibold text-fuchsia-700" onClick={() => performAction(() => setScreen("minigames"))}>Cambiar minijuego</button>
            </div>
          </div>
        ) : null}
      </SectionCard>
    );
  }

  function renderResults() {
    if (!resultState) return null;
    return (
      <SectionCard className="mx-auto w-full max-w-3xl p-8 text-center">
        <h2 className="text-4xl font-bold text-zinc-900">¡Fin del juego!</h2>
        <p className="mt-2 text-sm text-zinc-500">{resultState.subtitle}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="min-w-32 rounded-[22px] border border-emerald-200 bg-emerald-50 px-6 py-5">
            <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Aciertos</div>
            <div className="mt-1 text-5xl font-bold text-emerald-700">{resultState.score}</div>
            <div className="text-xs text-zinc-500">de {resultState.total}</div>
          </div>
          <div className="min-w-32 rounded-[22px] border border-emerald-200 bg-emerald-50 px-6 py-5">
            <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Tiempo</div>
            <div className="mt-1 text-5xl font-bold text-emerald-700">{formatTime(resultState.elapsedSeconds)}</div>
            <div className="text-xs text-zinc-500">min : seg</div>
          </div>
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
          <button className="rounded-[18px] bg-emerald-700 px-5 py-3 font-semibold text-white" onClick={() => restartCurrentGame()}>
            Jugar de nuevo
          </button>
          <button className="rounded-[18px] border-2 border-emerald-700 px-5 py-3 font-semibold text-emerald-700" onClick={() => performAction(() => goMenu())}>
            Cambiar modo
          </button>
        </div>
      </SectionCard>
    );
  }

  function renderSecret() {
    return (
      <SectionCard className="mx-auto w-full max-w-3xl p-8">
        <button className="mb-5 text-sm font-semibold text-emerald-700" onClick={() => performAction(() => goMenu())}>
          ← Volver al menú
        </button>
        <div className="text-center">
          <div className="text-6xl">🦜</div>
          <h2 className="mt-4 text-3xl font-bold text-emerald-900">Nivel Secreto completado</h2>
        </div>
        <div className="mt-6 space-y-5 text-base leading-8 text-zinc-700">
          <p>
            Gracias por haber jugado y haber completado todo el juego. ¡Felicitaciones! Has demostrado ser una persona sensible, atenta y que se interesa y preocupa por las aves y seguramente también por la naturaleza.
          </p>
          <p>
            Personas como vos hacen que este mundo sea un lugar mejor, cuidando a nuestro medio ambiente y a los animales y plantas que viven en él.
          </p>
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

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <button
        className="fixed right-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-200 bg-white text-xl shadow-lg transition hover:border-emerald-400 hover:bg-emerald-50"
        onClick={() => {
          ensureMenuMusic();
          setVolumeOpen((value) => !value);
        }}
        title="Configurar audio"
      >
        🎵
      </button>

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

      {volumeOpen ? renderVolumePanel() : null}
      {recordsOpen ? renderRecordsModal() : null}

      {screen === "menu" ? renderMenu() : null}
      {screen === "difficulty-select" ? renderDifficultySelector() : null}
      {screen === "game" ? renderGame() : null}
      {screen === "guide" ? renderGuide() : null}
      {screen === "minigames" ? renderMinigames() : null}
      {screen === "memo" ? renderMemo() : null}
      {screen === "ordenar" ? renderOrdenar() : null}
      {screen === "impostor" ? renderImpostor() : null}
      {screen === "results" ? renderResults() : null}
      {screen === "secret" ? renderSecret() : null}
    </main>
  );
}

function GuideCard({
  bird,
  onPlay,
}: {
  bird: Bird;
  onPlay: () => void;
}) {
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
      <button
        onClick={onPlay}
        className="inline-flex h-12 w-12 items-center justify-center self-center rounded-full border-2 border-emerald-200 bg-white text-xl text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50"
      >
        🔊
      </button>
    </div>
  );
}
