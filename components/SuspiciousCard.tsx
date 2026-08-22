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
    <div className="bg-yellow-950/20 border border-yellow-700/50 rounded-xl p-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">⚠️</span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-yellow-300 text-lg">SUSPICIOUS ACTIVITY DETECTED</h3>
            <span className="text-xs bg-yellow-900/60 text-yellow-200 px-2 py-0.5 rounded font-mono">
              Score: {riskScore}/100 • Conf: {confidenceScore}%
            </span>
          </div>
          <p className="text-zinc-300 text-sm mt-1 max-w-2xl">
            {explanation || 'ShieldSense found some warning signs, but the evidence is not strong enough to classify this as high-risk. Caution is recommended.'}
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-xs text-zinc-500 hover:text-zinc-300 px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800 transition whitespace-nowrap self-end md:self-auto"
      >
        Dismiss notice
      </button>
    </div>
  );
}
