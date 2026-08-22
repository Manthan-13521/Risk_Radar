"use client";

import { useEffect, useRef, useState } from "react";

interface VoiceVerdictProps {
  investigationId: string;
  voiceText: string;
}

type VoiceState =
  | "idle"
  | "loading"
  | "playing"
  | "done"
  | "blocked"
  | "error";

export default function VoiceVerdict({
  investigationId,
  voiceText,
}: VoiceVerdictProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Track which investigation has already been spoken this session
  const spokenIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Don't re-speak if this scan was already spoken
    if (spokenIdRef.current === investigationId) return;

    let cancelled = false;

    async function fetchAndPlay() {
      setState("loading");

      try {
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: voiceText }),
        });

        if (cancelled) return;

        if (!res.ok) {
          setState("error");
          return;
        }

        const audioBlob = await res.blob();
        if (cancelled) return;

        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setState("done");
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setState("error");
          URL.revokeObjectURL(url);
        };

        try {
          await audio.play();
          spokenIdRef.current = investigationId;
          setState("playing");
        } catch {
          // Autoplay blocked by browser policy
          setState("blocked");
          // Keep the audio object so the user can manually play
        }
      } catch {
        if (!cancelled) setState("error");
      }
    }

    fetchAndPlay();

    return () => {
      cancelled = true;
      // Stop audio if user navigates away
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [investigationId, voiceText]);

  async function handleManualPlay() {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      spokenIdRef.current = investigationId;
      setState("playing");
    } catch {
      setState("error");
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex items-center gap-3 py-2 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-sm"
      aria-label="ShieldSense voice verdict"
      aria-live="polite"
    >
      {state === "idle" && null}

      {state === "loading" && (
        <>
          <span className="animate-pulse text-blue-400 text-lg">🔊</span>
          <span className="text-zinc-400">Preparing voice verdict...</span>
        </>
      )}

      {state === "playing" && (
        <>
          <span className="text-blue-400 text-lg animate-pulse">🔊</span>
          <span className="text-zinc-300">Speaking...</span>
        </>
      )}

      {state === "done" && (
        <>
          <span className="text-zinc-500 text-lg">🔊</span>
          <span className="text-zinc-500">Voice verdict complete</span>
        </>
      )}

      {state === "blocked" && (
        <>
          <button
            onClick={handleManualPlay}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 transition"
            aria-label="Play voice verdict"
          >
            <span className="text-lg">🔊</span>
            <span className="font-medium">Tap to hear verdict</span>
          </button>
        </>
      )}

      {state === "error" && (
        <>
          <span className="text-zinc-600 text-lg">🔇</span>
          <span className="text-zinc-600">Voice explanation unavailable</span>
        </>
      )}
    </div>
  );
}