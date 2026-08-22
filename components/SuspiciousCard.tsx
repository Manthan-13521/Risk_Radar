"use client";

import { useState } from 'react';

interface SuspiciousCardProps {
  riskScore: number;
  confidenceScore: number;
  explanation: string;
}

export default function SuspiciousCard({
  riskScore,
  confidenceScore,
  explanation,
}: SuspiciousCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative"
      style={{ background: 'rgba(184,106,0,0.06)', borderColor: 'rgba(184,106,0,0.25)' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">⚠️</span>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-base" style={{ color: '#B86A00' }}>SUSPICIOUS ACTIVITY DETECTED</h3>
            <span
              className="text-xs px-2 py-0.5 rounded font-mono font-bold"
              style={{ background: 'rgba(184,106,0,0.1)', color: '#B86A00' }}
            >
              Score: {riskScore}/100 · Conf: {confidenceScore}%
            </span>
          </div>
          <p className="text-xs mt-1 max-w-2xl leading-relaxed" style={{ color: '#6F6664' }}>
            {explanation || 'Risk_Radar found some warning signs, but the evidence is not strong enough to classify this as high-risk. Caution is recommended.'}
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-xs px-3 py-1.5 rounded-xl border transition whitespace-nowrap self-end md:self-auto font-bold"
        style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#6F6664' }}
      >
        Dismiss notice
      </button>
    </div>
  );
}
