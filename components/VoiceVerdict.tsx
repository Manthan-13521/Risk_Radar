'use client';

import { useState } from 'react';

interface VoiceVerdictProps {
  investigationId: string;
  voiceText?: string;
  riskScore?: number;
  classification?: string;
  attackerIntent?: string;
  recommendedAction?: string;
}

export default function VoiceVerdict({
  voiceText,
  riskScore = 0,
  classification = 'safe',
}: VoiceVerdictProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [supported] = useState(() =>
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  const isRisk =
    riskScore >= 30 ||
    classification === 'critical' ||
    classification === 'dangerous' ||
    classification === 'suspicious';

  const accentColor = isRisk ? '#990011' : '#176B52';

  const script =
    voiceText ||
    (isRisk
      ? `Risk detected. Score is ${riskScore} out of 100. Access restricted. Do not continue.`
      : `Verified safe. Score is ${riskScore} out of 100. Access allowed.`);

  // Direct user-gesture handler — called only from onClick, never from useEffect
  const handlePlay = () => {
    if (!window.speechSynthesis) return;

    // Kill any running speech first
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(script);
    utter.rate = 1.0;
    utter.pitch = isRisk ? 1.1 : 0.95;
    utter.volume = 1;

    // Pick best English voice available
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Karen') ||
            v.name.includes('Alex'))
      ) || voices.find((v) => v.lang.startsWith('en'));
    if (preferred) utter.voice = preferred;

    utter.onstart = () => {
      setIsSpeaking(true);
      setHasPlayed(true);
    };
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  };

  const handleStop = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  if (!supported) return null;

  return (
    <div
      className="rounded-2xl border p-5 shadow-sm"
      style={{
        background: isRisk ? 'rgba(153,0,17,0.06)' : 'rgba(23,107,82,0.06)',
        borderColor: isRisk ? 'rgba(153,0,17,0.3)' : 'rgba(23,107,82,0.3)',
      }}
      role="region"
      aria-label="Voice verdict"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        {/* Left — icon + text */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Speaker / equalizer icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-xs transition-all"
            style={{
              background: isSpeaking ? accentColor : '#ECE6E2',
              borderColor: '#C4B5B0',
            }}
          >
            {isSpeaking ? (
              <div className="flex items-end gap-0.5 h-5">
                <span
                  className="w-1 rounded-full"
                  style={{
                    background: '#fff',
                    height: '10px',
                    animation: 'barBounce 0.6s ease-in-out infinite',
                  }}
                />
                <span
                  className="w-1 rounded-full"
                  style={{
                    background: '#fff',
                    height: '16px',
                    animation: 'barBounce 0.6s ease-in-out infinite 0.1s',
                  }}
                />
                <span
                  className="w-1 rounded-full"
                  style={{
                    background: '#fff',
                    height: '8px',
                    animation: 'barBounce 0.6s ease-in-out infinite 0.2s',
                  }}
                />
              </div>
            ) : (
              <span className="text-xl" style={{ color: accentColor }}>
                🔊
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div
              className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2"
              style={{ color: accentColor }}
            >
              Voice Verdict
              {isSpeaking && (
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{
                    background: accentColor,
                    animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite',
                  }}
                />
              )}
            </div>
            <div
              className="text-xs font-semibold mt-0.5 max-w-xs sm:max-w-md truncate"
              style={{ color: '#111111' }}
            >
              &ldquo;{script}&rdquo;
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: '#554B49' }}>
              {isSpeaking
                ? 'Speaking now…'
                : hasPlayed
                ? 'Click Replay to hear again'
                : 'Click Play to hear the verdict read aloud'}
            </div>
          </div>
        </div>

        {/* Right — button */}
        <div className="shrink-0 self-end sm:self-center">
          {isSpeaking ? (
            <button
              onClick={handleStop}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border transition hover:bg-white shadow-xs"
              style={{
                background: '#ECE6E2',
                borderColor: '#C4B5B0',
                color: '#111111',
              }}
            >
              ⏹&nbsp;Stop
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="px-5 py-3 rounded-xl text-sm font-extrabold text-white shadow-md flex items-center gap-2 transition hover:opacity-90"
              style={{
                background: accentColor,
                // Pulse animation only before first play to draw attention
                animation: !hasPlayed
                  ? 'verdictPulse 2s ease-in-out infinite'
                  : 'none',
              }}
            >
              <span style={{ fontSize: '16px' }}>▶</span>
              <span>{hasPlayed ? 'Replay' : 'Play Voice Verdict'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes verdictPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${isRisk ? 'rgba(153,0,17,0.5)' : 'rgba(23,107,82,0.5)'}; }
          50% { box-shadow: 0 0 0 8px ${isRisk ? 'rgba(153,0,17,0)' : 'rgba(23,107,82,0)'}; }
        }
        @keyframes barBounce {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.6); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}