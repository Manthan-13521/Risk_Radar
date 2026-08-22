'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface IncidentItem {
  _id?: string;
  incidentId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | string;
  status: 'triage' | 'investigating' | 'contained' | 'resolved' | string;
  riskScore: number;
  confidenceScore: number;
  attackerIntent: string;
  summary: string;
  evidence?: Array<{ title?: string; description?: string; severity?: string }>;
  dnaTags?: string[];
  recommendedAction?: string;
  actionTaken?: string;
  scanId?: string;
  createdAt: string | Date;
}

export function IncidentQuickDrawer({
  incident,
  isOpen,
  onClose,
}: {
  incident: IncidentItem | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(incident?.status || 'triage');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (incident) setStatus(incident.status);
  }, [incident]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !incident) return null;

  const sevColor =
    incident.severity === 'critical'
      ? '#76000D'
      : incident.severity === 'high'
      ? '#990011'
      : incident.severity === 'medium'
      ? '#B86A00'
      : '#6F6664';

  const handleUpdateStatus = async (newStatus: string, actionNote: string) => {
    if (!incident._id) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incident._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, actionTaken: actionNote }),
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const topEvidence = (incident.evidence || []).slice(0, 3);
  const formattedIntent = incident.attackerIntent.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity duration-300 animate-in fade-in"
        style={{ background: 'rgba(17,17,17,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Side Slide-Over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md md:max-w-lg border-l shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
          style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}
        >
          {/* Header */}
          <div className="p-6 border-b flex items-start justify-between gap-4 shrink-0" style={{ borderColor: '#D5C8C5', background: '#F0E8E6' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase"
                  style={{ background: 'rgba(153,0,17,0.1)', color: sevColor, border: `1px solid ${sevColor}` }}
                >
                  {incident.severity}
                </span>
                <span className="text-xs font-mono" style={{ color: '#6F6664' }}>
                  {incident.incidentId}
                </span>
              </div>
              <h2 className="text-lg font-extrabold" style={{ color: '#111111' }}>
                INCIDENT REPORT PREVIEW
              </h2>
              <div className="text-[11px]" style={{ color: '#6F6664' }}>
                Logged on {new Date(incident.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border text-sm font-bold transition hover:bg-white"
              style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Top 3 Metric Gauges */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>Risk</div>
                <div className="text-2xl font-extrabold font-mono mt-0.5" style={{ color: '#990011' }}>
                  {incident.riskScore}
                  <span className="text-xs" style={{ color: '#6F6664' }}>/100</span>
                </div>
              </div>
              <div className="text-center border-x" style={{ borderColor: '#D5C8C5' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>Confidence</div>
                <div className="text-2xl font-extrabold font-mono mt-0.5" style={{ color: '#111111' }}>
                  {incident.confidenceScore}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>Status</div>
                <div className="text-xs font-bold uppercase font-mono mt-2" style={{ color: status === 'resolved' ? '#176B52' : '#990011' }}>
                  {status}
                </div>
              </div>
            </div>

            {/* Top 3 Summary Lines / Intent */}
            <div className="rounded-xl border p-4 space-y-2" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>
                Top 3 Incident Highlights
              </div>
              <div className="space-y-1.5 text-xs leading-relaxed" style={{ color: '#111111' }}>
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: '#990011' }}>1.</span>
                  <span className="font-semibold">Objective: {formattedIntent || 'UNCONFIRMED THREAT'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: '#990011' }}>2.</span>
                  <span>{incident.summary || 'Elevated behavioral anomaly flagged by deterministic heuristics engine.'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: '#990011' }}>3.</span>
                  <span>Enforced Policy Guard: <strong className="uppercase">{incident.recommendedAction || 'QUARANTINE'}</strong></span>
                </div>
              </div>
            </div>

            {/* Corroborating Signals (Top 3 Lines) */}
            {topEvidence.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>
                  Top 3 Key Malicious Indicators
                </div>
                <div className="space-y-2">
                  {topEvidence.map((e, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border text-xs"
                      style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-bold" style={{ color: '#990011' }}>{e.title || 'Signal Detected'}</span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(153,0,17,0.08)', color: '#990011' }}>
                          {e.severity || 'high'}
                        </span>
                      </div>
                      {e.description && (
                        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#6F6664' }}>
                          {e.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Behavioral DNA Signatures */}
            {incident.dnaTags && incident.dnaTags.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#6F6664' }}>
                  Behavioral DNA Signatures
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {incident.dnaTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg border text-xs font-mono"
                      style={{ background: '#E7DEDC', borderColor: '#D5C8C5', color: '#111111' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lifecycle Quick Actions */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>
                Incident Lifecycle Actions
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus('investigating', 'Analyst actively investigating')}
                  disabled={actionLoading || status === 'investigating'}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border transition disabled:opacity-50"
                  style={{
                    background: status === 'investigating' ? '#B86A00' : '#FCF6F5',
                    color: status === 'investigating' ? '#fff' : '#B86A00',
                    borderColor: '#B86A00',
                  }}
                >
                  Mark Investigating
                </button>
                <button
                  onClick={() => handleUpdateStatus('contained', 'Threat simulated quarantine enacted')}
                  disabled={actionLoading || status === 'contained'}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border transition disabled:opacity-50"
                  style={{
                    background: status === 'contained' ? '#990011' : '#FCF6F5',
                    color: status === 'contained' ? '#fff' : '#990011',
                    borderColor: '#990011',
                  }}
                >
                  Mark Contained
                </button>
                <button
                  onClick={() => handleUpdateStatus('resolved', 'Analyst marked incident as remediated')}
                  disabled={actionLoading || status === 'resolved'}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border transition disabled:opacity-50"
                  style={{
                    background: status === 'resolved' ? '#176B52' : '#FCF6F5',
                    color: status === 'resolved' ? '#fff' : '#176B52',
                    borderColor: '#176B52',
                  }}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-5 border-t flex items-center justify-between gap-3 shrink-0" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
            {incident.scanId ? (
              <Link
                href={`/investigate/${incident.scanId}`}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border transition hover:bg-white"
                style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}
              >
                View Investigation Scan →
              </Link>
            ) : <div />}
            {incident._id ? (
              <Link
                href={`/incidents/${incident._id}`}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white transition hover:opacity-90"
                style={{ background: '#990011' }}
              >
                Open Full Incident →
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
