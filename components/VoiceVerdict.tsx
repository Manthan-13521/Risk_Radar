'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface VoiceVerdictProps {
  investigationId: string;
  voiceText?: string;
  riskScore?: number;
  classification?: string;
  attackerIntent?: string;
  recommendedAction?: string;
}

export default function VoiceVerdict({
  investigationId,
  riskScore = 0,
  classification = 'safe',
}: VoiceVerdictProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const hasSpokenRef = useRef<string | null>(null);

  const isRisk = riskScore >= 30 || classification === 'critical' || classification === 'dangerous' || classification === 'suspicious';

  // Crisp 1-line concise voice script
  const getSpeechScript = useCallback((): string => {
    if (isRisk) {
      return `Risk detected. Score is ${riskScore} out of 100. Access restricted.`;
    }
    return `Verified safe. Score is ${riskScore} out of 100. Access allowed.`;
  }, [riskScore, isRisk]);

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeechSupported(false);
      return;
    }

    // Cancel any previous utterances
    window.speechSynthesis.cancel();

    const script = getSpeechScript();
    const utterance = new SpeechSynthesisUtterance(script);

    // Speed up slightly for fast delivery
    utterance.rate = 1.1;
    utterance.pitch = isRisk ? 1.05 : 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setHasStarted(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.warn('[VoiceVerdict] Speech error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    hasSpokenRef.current = investigationId;
  }, [getSpeechScript, investigationId, isRisk]);

  const stop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Compulsory voice playback on investigation view
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeechSupported(false);
      return;
    }

    if (hasSpokenRef.current === investigationId) return;

    const timer = setTimeout(() => {
      speak();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [investigationId, speak]);

  if (!speechSupported) return null;

  return (
    <div
      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition shadow-xl ${
        isRisk
          ? 'bg-[#120707] border-red-900/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
          : 'bg-[#07110d] border-teal-900/60 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
      }`}
      role="region"
      aria-label="Audio voice verdict"
    >
      {/* Voice Status & Text Preview */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 border ${
            isRisk
              ? 'bg-red-950/80 border-red-700/60 text-red-400'
              : 'bg-teal-950/80 border-teal-700/60 text-teal-400'
          }`}
        >
          {isSpeaking ? (
            <span className="animate-pulse">🔊</span>
          ) : (
            <span>🔈</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold font-mono uppercase tracking-wider ${
                isRisk ? 'text-red-400' : 'text-teal-400'
              }`}
            >
              {isSpeaking ? 'Voice Alert Speaking...' : isRisk ? 'Risk Alert' : 'Clean Verdict'}
            </span>
            {isSpeaking && (
              <span className="flex gap-0.5 items-end h-3">
                <span className="w-1 bg-red-400 h-2 animate-bounce" />
                <span className="w-1 bg-red-400 h-3 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 bg-red-400 h-1.5 animate-bounce [animation-delay:0.3s]" />
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-300 font-mono truncate max-w-md mt-0.5">
            {isRisk
              ? `Risk detected. Score: ${riskScore}/100. Access restricted.`
              : `Verified safe. Score: ${riskScore}/100. Access allowed.`}
          </p>
        </div>
      </div>

      {/* Play / Stop Control Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {isSpeaking ? (
          <button
            onClick={stop}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition flex items-center gap-1 border border-zinc-700"
          >
            <span>⏹</span>
            <span>Stop</span>
          </button>
        ) : (
          <button
            onClick={speak}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-lg ${
              isRisk
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-950/60'
            }`}
          >
            <span>🔊</span>
            <span>{hasStarted ? 'Replay' : 'Play Voice'}</span>
          </button>
        )}
      </div>
    </div>
  );
}