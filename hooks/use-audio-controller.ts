import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioSettings } from "@/lib/types";
import { shuffle } from "@/lib/game";
import { MUSIC_TRACKS } from "@/lib/game-ui-constants";
import type { SfxKind } from "@/lib/game-ui-types";

export function useAudioController(audioSettings: AudioSettings) {
  const [playingSoundSrc, setPlayingSoundSrc] = useState<string | null>(null);
  const menuAudioRef = useRef<HTMLAudioElement | null>(null);
  const birdAudioRef = useRef<HTMLAudioElement | null>(null);
  const birdAudioSrcRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicStartedRef = useRef(false);

  useEffect(() => {
    if (menuAudioRef.current) {
      menuAudioRef.current.volume = audioSettings.musicMuted ? 0 : audioSettings.musicVolume;
    }
    if (birdAudioRef.current) {
      birdAudioRef.current.volume = audioSettings.birdMuted ? 0 : audioSettings.birdVolume;
    }
  }, [audioSettings]);

  const getAudioContext = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  }, []);

  const beep = useCallback(
    (frequency: number, duration: number, gain: number, type: OscillatorType = "triangle", delay = 0) => {
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
    },
    [audioSettings.sfxMuted, audioSettings.sfxVolume, getAudioContext],
  );

  const playSfx = useCallback(
    (kind: SfxKind) => {
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
    },
    [beep],
  );

  const ensureMenuMusic = useCallback(() => {
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
  }, [audioSettings.musicMuted, audioSettings.musicVolume]);

  const restoreMusic = useCallback(() => {
    if (!menuAudioRef.current) return;
    menuAudioRef.current.volume = audioSettings.musicMuted ? 0 : audioSettings.musicVolume;
  }, [audioSettings.musicMuted, audioSettings.musicVolume]);

  const duckMusic = useCallback(() => {
    if (!menuAudioRef.current || audioSettings.musicMuted) return;
    menuAudioRef.current.volume = Math.max(0.03, audioSettings.musicVolume * 0.18);
  }, [audioSettings.musicMuted, audioSettings.musicVolume]);

  const stopBirdAudio = useCallback(() => {
    if (!birdAudioRef.current) return;
    birdAudioRef.current.pause();
    birdAudioRef.current.currentTime = 0;
    birdAudioRef.current = null;
    birdAudioSrcRef.current = null;
    setPlayingSoundSrc(null);
    restoreMusic();
  }, [restoreMusic]);

  const playBirdSound = useCallback(
    (src: string) => {
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
        setPlayingSoundSrc(null);
        restoreMusic();
      };
      audio.play().catch(() => restoreMusic());
      birdAudioRef.current = audio;
      birdAudioSrcRef.current = src;
      setPlayingSoundSrc(src);
    },
    [audioSettings.birdMuted, audioSettings.birdVolume, duckMusic, ensureMenuMusic, restoreMusic, stopBirdAudio],
  );

  useEffect(() => {
    return () => {
      if (birdAudioRef.current) {
        birdAudioRef.current.pause();
      }
      if (menuAudioRef.current) {
        menuAudioRef.current.pause();
      }
    };
  }, []);

  return {
    playingSoundSrc,
    ensureMenuMusic,
    duckMusic,
    restoreMusic,
    stopBirdAudio,
    playBirdSound,
    playSfx,
  };
}
