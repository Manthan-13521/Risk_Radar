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
  riskScore, confidenceScore, attackerIntent, evidence, recommendedAction, scanId, actionTaken,
}: ThreatModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  if (!isOpen) return null;

  const top = evidence.slice(0, 3);
  const intent = attackerIntent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(17,17,17,0.6)', backdropFilter: 'blur(8px)' }}
      role="dialog" aria-modal="true" aria-labelledby="threat-modal-title"
    >
      <div
        className="max-w-lg w-full rounded-2xl border-2 p-6 md:p-8 space-y-5 shadow-2xl"
        style={{ background: '#ECE6E2', borderColor: '#990011' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: '#C4B5B0' }}>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#990011' }}>Risk_Radar Alert</div>
            <h2 id="threat-modal-title" className="text-2xl font-extrabold" style={{ color: '#111111' }}>THREAT DETECTED</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg font-bold"
            style={{ color: '#554B49' }}
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-center">
            <div className="text-[10px] font-extrabold uppercase" style={{ color: '#554B49' }}>Risk</div>
            <div className="text-2xl font-extrabold font-mono" style={{ color: '#990011' }}>
              {riskScore}<span className="text-xs font-normal" style={{ color: '#554B49' }}>/100</span>
            </div>
          </div>
          <div className="text-center border-x" style={{ borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase" style={{ color: '#554B49' }}>Confidence</div>
            <div className="text-2xl font-extrabold font-mono" style={{ color: '#111111' }}>{confidenceScore}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-extrabold uppercase" style={{ color: '#554B49' }}>Intent</div>
            <div className="text-xs font-bold mt-2 px-1 truncate" title={intent} style={{ color: '#111111' }}>{intent}</div>
          </div>
        </div>

        {/* Top evidence */}
        {top.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>Key Indicators</div>
            {top.map((e, i) => (
              <div
                key={i}
                className="flex gap-2 p-2.5 rounded-xl border shadow-xs"
                style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}
              >
                <span className="font-bold text-sm" style={{ color: '#990011' }}>·</span>
                <div>
                  <span className="text-xs font-bold" style={{ color: '#990011' }}>{e.title}: </span>
                  <span className="text-xs font-medium" style={{ color: '#554B49' }}>{e.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              setIsOpen(false);
              document.getElementById('evidence-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 px-4 py-3 rounded-xl text-xs font-bold border transition hover:bg-white"
            style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#111111' }}
          >
            Review Evidence
          </button>
          {actionTaken ? (
            <div className="flex-1 px-4 py-3 rounded-xl text-xs font-bold text-center border" style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#176B52' }}>
              ✓ Simulated {actionTaken}
            </div>
          ) : (
            <form action={`/api/scans/${scanId}/action`} method="POST" className="flex-1" onSubmit={() => setIsOpen(false)}>
              <button
                type="submit" name="action" value={recommendedAction}
                className="w-full px-4 py-3 rounded-xl text-xs font-extrabold text-white transition hover:opacity-90 shadow-sm"
                style={{ background: '#990011' }}
              >
                APPROVE SIMULATED {recommendedAction.toUpperCase()}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
