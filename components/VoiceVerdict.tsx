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
  voiceText,
  riskScore = 0,
  classification = 'safe',
}: VoiceVerdictProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isRisk = riskScore >= 30 || classification === 'critical' || classification === 'dangerous' || classification === 'suspicious';
  const accentColor = isRisk ? '#990011' : '#176B52';

  const script = voiceText || (
    isRisk
      ? `Risk detected. Score is ${riskScore} out of 100. Access restricted.`
      : `Verified safe. Score is ${riskScore} out of 100. Access allowed.`
  );

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeechSupported(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(script);
      utterance.rate = 1.05;
      utterance.pitch = isRisk ? 1.05 : 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred =
          voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen'))) ||
          voices.find(v => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setHasPlayed(true);
        setAutoplayBlocked(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (e) => {
        console.warn('[VoiceVerdict] Speech error:', e);
        setIsSpeaking(false);
        if (e.error === 'not-allowed') {
          setAutoplayBlocked(true);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[VoiceVerdict] Exception during speak:', err);
      setAutoplayBlocked(true);
    }
  }, [script, isRisk]);

  const stop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeechSupported(false);
      return;
    }

    // Try auto-play after slight delay
    const timer = setTimeout(() => {
      speak();
    }, 400);

    // If voices load asynchronously in Chrome/Safari, ensure voice is ready
    const handleVoicesChanged = () => {
      // voices loaded
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // If browser autoplay policy blocked speech on load, unlock and play on first document interaction
    const handleUserInteraction = () => {
      if (!hasPlayed && !isSpeaking) {
        speak();
      }
    };
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      if (window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        window.speechSynthesis.cancel();
      }
    };
  }, [investigationId, speak, hasPlayed, isSpeaking]);

  if (!speechSupported) return null;

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-all"
      style={{
        background: isRisk ? 'rgba(153,0,17,0.06)' : 'rgba(23,107,82,0.06)',
        borderColor: isRisk ? 'rgba(153,0,17,0.25)' : 'rgba(23,107,82,0.25)',
      }}
      role="region"
      aria-label="Audio voice verdict briefing"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Animated equalizer waves when speaking, speaker icon otherwise */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs"
          style={{
            background: isSpeaking ? accentColor : '#ECE6E2',
            borderColor: '#C4B5B0',
            color: isSpeaking ? '#ffffff' : accentColor,
          }}
        >
          {isSpeaking ? (
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-white rounded-full animate-pulse h-3" />
              <span className="w-1 bg-white rounded-full animate-pulse h-4 delay-75" />
              <span className="w-1 bg-white rounded-full animate-pulse h-2 delay-150" />
            </div>
          ) : (
            <span className="text-lg">🔊</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: accentColor }}>
              VOICE VERDICT · {isSpeaking ? 'SPEAKING NOW' : hasPlayed ? 'READY' : 'AUTO-BRIEFING'}
            </span>
            {isSpeaking && (
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: accentColor }} />
            )}
          </div>
          <div className="text-xs font-semibold mt-0.5 truncate max-w-lg" style={{ color: '#111111' }}>
            &ldquo;{script}&rdquo;
          </div>
          <div className="text-[10px] mt-0.5 font-medium" style={{ color: '#554B49' }}>
            Synthesized live using local high-fidelity neural speech.
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
        {isSpeaking ? (
          <button
            onClick={stop}
            className="px-4 py-2 rounded-xl text-xs font-bold border transition hover:bg-white shadow-xs"
            style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111' }}
          >
            ⏹ Stop Audio
          </button>
        ) : (
          <button
            onClick={speak}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white transition hover:opacity-90 shadow-md flex items-center gap-1.5"
            style={{
              background: accentColor,
              animation: autoplayBlocked ? 'pulse 2s infinite' : 'none',
            }}
          >
            <span>▶</span>
            <span>{hasPlayed ? 'Replay Voice Verdict' : 'Play Voice Verdict'}</span>
          </button>
        )}
      </div>
    </div>
  );
}