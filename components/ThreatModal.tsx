"use client";

import { useState } from 'react';

interface ThreatModalProps {
  riskScore: number;
  confidenceScore: number;
  classification: string;
  attackerIntent: string;
  evidence: Array<{ severity: string; title: string; description: string }>;
  recommendedAction: string;
  scanId: string;
  actionTaken?: string | null;
}

export default function ThreatModal({
  riskScore,
  confidenceScore,
  attackerIntent,
  evidence,
  recommendedAction,
  scanId,
  actionTaken,
}: ThreatModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  const topEvidence = evidence.slice(0, 3);
  const formattedIntent = attackerIntent
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="threat-modal-title"
    >
      <div className="bg-zinc-900 border-2 border-red-600/80 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl shadow-red-950/60 space-y-6 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🚨</span>
            <div>
              <h2 id="threat-modal-title" className="text-2xl font-bold text-red-400 tracking-tight">
                THREAT DETECTED
              </h2>
              <p className="text-xs text-zinc-400 uppercase tracking-widest mt-0.5">
                High-Risk Security Finding
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>

        {/* Scores & Intent Card */}
        <div className="grid grid-cols-3 gap-3 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800">
          <div className="text-center">
            <div className="text-xs text-zinc-500 font-semibold uppercase">Risk</div>
            <div className="text-2xl font-extrabold text-red-400 mt-1">{riskScore} <span className="text-xs text-zinc-500">/100</span></div>
          </div>
          <div className="text-center border-x border-zinc-800">
            <div className="text-xs text-zinc-500 font-semibold uppercase">Confidence</div>
            <div className="text-2xl font-extrabold text-blue-400 mt-1">{confidenceScore}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-zinc-500 font-semibold uppercase">Likely Intent</div>
            <div className="text-xs font-bold text-zinc-200 mt-2 truncate px-1" title={formattedIntent}>
              {formattedIntent}
            </div>
          </div>
        </div>

        {/* Top Warning Signs */}
        {topEvidence.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">
              Key Malicious Indicators
            </div>
            <ul className="space-y-1.5">
              {topEvidence.map((e, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300 bg-red-950/20 p-2 rounded border border-red-900/30">
                  <span className="text-red-400 font-bold">•</span>
                  <div>
                    <span className="font-medium text-red-200">{e.title}:</span>{' '}
                    <span className="text-zinc-400 text-xs">{e.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Action */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500 uppercase font-semibold">Recommended Action</div>
            <div className="text-lg font-bold text-red-400 capitalize mt-0.5 flex items-center gap-2">
              🔒 {recommendedAction}
            </div>
          </div>
          <div className="text-xs text-zinc-500 italic max-w-[180px] text-right">
            Simulated policy response
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              setIsOpen(false);
              const el = document.getElementById('evidence-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition text-center text-sm border border-zinc-700"
          >
            Review Full Evidence
          </button>

          {actionTaken ? (
            <div className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 text-zinc-400 font-medium text-center text-sm border border-zinc-700 flex items-center justify-center gap-1.5">
              ✓ Simulated {actionTaken}
            </div>
          ) : (
            <form
              action={`/api/scans/${scanId}/action`}
              method="POST"
              className="flex-1"
              onSubmit={() => setIsOpen(false)}
            >
              <button
                type="submit"
                name="action"
                value={recommendedAction}
                className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition text-sm shadow-lg shadow-red-950"
              >
                Approve Simulated {recommendedAction}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
