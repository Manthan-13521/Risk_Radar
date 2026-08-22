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
  const accentColor = isRisk ? '#990011' : '#176B52';

  const getSpeechScript = useCallback((): string => {
    if (isRisk) return `Risk detected. Score is ${riskScore} out of 100. Access restricted.`;
    return `Verified safe. Score is ${riskScore} out of 100. Access allowed.`;
  }, [riskScore, isRisk]);

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { setSpeechSupported(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(getSpeechScript());
    utterance.rate = 1.1;
    utterance.pitch = isRisk ? 1.05 : 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => { setIsSpeaking(true); setHasStarted(true); };
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    hasSpokenRef.current = investigationId;
  }, [getSpeechScript, investigationId, isRisk]);

  const stop = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false); };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { setSpeechSupported(false); return; }
    if (hasSpokenRef.current === investigationId) return;
    const t = setTimeout(() => speak(), 300);
    return () => { clearTimeout(t); window.speechSynthesis?.cancel(); };
  }, [investigationId, speak]);

  if (!speechSupported) return null;

  return (
    <div
      className="rounded-xl border p-4 flex items-center justify-between gap-4"
      style={{
        background: isRisk ? 'rgba(153,0,17,0.04)' : 'rgba(23,107,82,0.04)',
        borderColor: isRisk ? 'rgba(153,0,17,0.2)' : 'rgba(23,107,82,0.2)',
      }}
      role="region"
      aria-label="Audio voice verdict"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-base shrink-0" style={{ color: accentColor }}>{isSpeaking ? '🔊' : '🔈'}</span>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            VOICE VERDICT · {isSpeaking ? 'SPEAKING' : 'READY'}
          </div>
          <div className="text-xs truncate mt-0.5" style={{ color: '#6F6664' }}>
            {isRisk
              ? `Risk detected. Score: ${riskScore}/100. Access restricted.`
              : `Verified safe. Score: ${riskScore}/100. Access allowed.`}
          </div>
        </div>
      </div>
      <div className="shrink-0">
        {isSpeaking ? (
          <button
            onClick={stop}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition"
            style={{ background: '#F0E8E6', borderColor: '#D5C8C5', color: '#111111' }}
          >
            Stop
          </button>
        ) : (
          <button
            onClick={speak}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
            style={{ background: accentColor }}
          >
            {hasStarted ? 'Replay' : 'Play'}
          </button>
        )}
      </div>
    </div>
  );
}