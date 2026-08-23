'use client';

import { useState } from 'react';
import Link from 'next/link';
import securityCases from '@/tests/fixtures/security-cases.json';

interface ScanResult {
  risk_score: number;
  classification: string;
  recommended_action: string;
  threat_category: string;
  confidence: number;
  explanation: string;
  evidence: Array<{
    type: string;
    description: string;
    severity?: string;
  }>;
  threatDna?: {
    tags: string[];
    topMatch?: {
      similarity: number;
      quality: string;
      threat_name: string;
    };
  };
}

export default function AdversarialLabPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCaseId, setActiveCaseId] = useState<string>(securityCases[0].id);
  const [customPayload, setCustomPayload] = useState<string>(securityCases[0].content);
  const [customType, setCustomType] = useState<string>(securityCases[0].type);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Vectors (105)' },
    { id: 'brand_impersonation', label: 'Brand Impersonation' },
    { id: 'url_obfuscation', label: 'URL Obfuscation' },
    { id: 'prompt_injection', label: 'Prompt Injection' },
    { id: 'credential_context', label: 'Credential Harvesting' },
    { id: 'payment_scam', label: 'Payment Fraud' },
    { id: 'social_engineering', label: 'Social Engineering' },
    { id: 'false_positive_challenge', label: 'Benign Challenges' },
    { id: 'file_analysis', label: 'File Masquerading' },
    { id: 'mixed_vectors', label: 'Mixed Vectors' },
  ];

  const filteredCases = selectedCategory === 'all'
    ? securityCases
    : securityCases.filter((c) => c.category === selectedCategory);

  const activeCase = securityCases.find((c) => c.id === activeCaseId) || securityCases[0];

  const selectTestCase = (tc: typeof securityCases[0]) => {
    setActiveCaseId(tc.id);
    setCustomPayload(tc.content);
    setCustomType(tc.type);
    setScanResult(null);
    setErrorMsg(null);
  };

  const handleRunLiveScan = async () => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: customType,
          content: customPayload,
          metadata: {
            source: 'adversarial_lab_evaluation',
            caseId: activeCaseId,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Scan investigation failed');
      }

      const data = await res.json();
      setScanResult(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setErrorMsg(errorMsg);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Breadcrumb & Header */}
      <div className="border-b pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4" style={{ borderColor: '#C4B5B0' }}>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: '#554B49' }}>
            <Link href="/evaluation" className="hover:underline" style={{ color: '#990011' }}>
              Evaluation Overview
            </Link>
            <span>/</span>
            <span>Adversarial Testing Lab</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#111111' }}>
            ADVERSARIAL SECURITY TESTING LAB
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>
            Live interactive sandbox executing multi-vector attacks directly against deterministic rules, dynamic knowledge policies, and AI reasoning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-xs"
            style={{ background: 'rgba(23,107,82,0.1)', borderColor: 'rgba(23,107,82,0.25)', color: '#176B52' }}
          >
            105 GOLDEN PAYLOADS READY
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-xs border"
              style={{
                background: isSelected ? '#990011' : '#E0D8D4',
                color: isSelected ? '#FFFFFF' : '#554B49',
                borderColor: isSelected ? '#990011' : '#C4B5B0',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Test Cases Picker */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border overflow-hidden shadow-sm flex flex-col h-[720px]" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#C4B5B0', background: '#D3C9C5' }}>
              <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#111111' }}>
                Test Cases ({filteredCases.length})
              </span>
              <span className="text-[10px] font-mono font-bold" style={{ color: '#554B49' }}>
                CLICK TO LOAD
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: '#C4B5B0' }}>
              {filteredCases.map((tc) => {
                const isActive = tc.id === activeCaseId;
                const isSafe = tc.expectedClassification === 'safe';
                return (
                  <button
                    key={tc.id}
                    onClick={() => selectTestCase(tc)}
                    className="w-full text-left p-3.5 transition flex flex-col gap-1.5 hover:bg-white/40"
                    style={{
                      background: isActive ? '#ECE6E2' : 'transparent',
                      borderLeft: isActive ? '4px solid #990011' : '4px solid transparent',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold" style={{ color: '#990011' }}>
                        {tc.id}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold"
                        style={{
                          background: isSafe ? 'rgba(23,107,82,0.12)' : 'rgba(153,0,17,0.12)',
                          color: isSafe ? '#176B52' : '#990011',
                        }}
                      >
                        {tc.expectedClassification}
                      </span>
                    </div>
                    <div className="text-xs font-medium line-clamp-1" style={{ color: '#111111' }}>
                      {tc.description}
                    </div>
                    <div className="text-[11px] font-mono truncate" style={{ color: '#554B49' }}>
                      {tc.content}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Workbench & Decision Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Test Case Specification */}
          <div className="rounded-2xl border p-6 shadow-sm space-y-4" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#C4B5B0' }}>
              <div>
                <span className="text-xs font-mono font-bold mr-2" style={{ color: '#990011' }}>
                  [{activeCase.id}]
                </span>
                <span className="text-sm font-extrabold uppercase tracking-wide" style={{ color: '#111111' }}>
                  {activeCase.description}
                </span>
              </div>
              <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-black/5" style={{ color: '#554B49' }}>
                Category: {activeCase.category?.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border bg-white/40" style={{ borderColor: '#C4B5B0' }}>
                <div className="text-[10px] font-extrabold uppercase text-gray-500">Expected Verdict</div>
                <div className="text-sm font-extrabold uppercase" style={{ color: activeCase.expectedClassification === 'safe' ? '#176B52' : '#990011' }}>
                  {activeCase.expectedClassification}
                </div>
              </div>

              <div className="p-3 rounded-xl border bg-white/40" style={{ borderColor: '#C4B5B0' }}>
                <div className="text-[10px] font-extrabold uppercase text-gray-500">Risk Range</div>
                <div className="text-sm font-extrabold font-mono" style={{ color: '#111111' }}>
                  {activeCase.riskRange ? `${activeCase.riskRange[0]} - ${activeCase.riskRange[1]}` : 'N/A'}
                </div>
              </div>

              <div className="p-3 rounded-xl border bg-white/40" style={{ borderColor: '#C4B5B0' }}>
                <div className="text-[10px] font-extrabold uppercase text-gray-500">Expected Action</div>
                <div className="text-sm font-extrabold uppercase" style={{ color: '#111111' }}>
                  {activeCase.expectedAction || 'quarantine'}
                </div>
              </div>

              <div className="p-3 rounded-xl border bg-white/40" style={{ borderColor: '#C4B5B0' }}>
                <div className="text-[10px] font-extrabold uppercase text-gray-500">Forbidden Action</div>
                <div className="text-sm font-extrabold uppercase font-mono text-red-700">
                  {activeCase.forbiddenAction || 'none'}
                </div>
              </div>
            </div>

            {/* Editor & Execution Form */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wide" style={{ color: '#111111' }}>
                  Target Payload Content
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold" style={{ color: '#554B49' }}>Type:</span>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="text-xs font-bold rounded-lg border px-2 py-1 bg-white/80"
                    style={{ borderColor: '#C4B5B0', color: '#111111' }}
                  >
                    <option value="url">URL</option>
                    <option value="message">Message Text</option>
                    <option value="file">File Name</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={4}
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                className="w-full p-3.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-900 shadow-inner"
                style={{ background: '#FFFFFF', borderColor: '#C4B5B0', color: '#111111' }}
              />

              <button
                onClick={handleRunLiveScan}
                disabled={isScanning || !customPayload.trim()}
                className="w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider text-white shadow-md hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#990011' }}
              >
                {isScanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing Live Adversarial Pipeline...</span>
                  </>
                ) : (
                  <>
                    <span>Run Adversarial Scan Through Live Pipeline</span>
                    <span>⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scan Output Card */}
          {errorMsg && (
            <div className="rounded-2xl border p-5 bg-red-100 border-red-300 text-red-900 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {scanResult && (
            <div className="rounded-2xl border p-6 shadow-sm space-y-6" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#C4B5B0' }}>
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: scanResult.classification === 'safe' ? '#176B52' : '#990011',
                    }}
                  />
                  <h3 className="text-lg font-extrabold" style={{ color: '#111111' }}>
                    LIVE SECURITY VERDICT & DECISION
                  </h3>
                </div>

                <span
                  className="px-3 py-1 rounded-xl text-xs font-extrabold uppercase shadow-xs"
                  style={{
                    background: scanResult.classification === 'safe' ? 'rgba(23,107,82,0.15)' : 'rgba(153,0,17,0.15)',
                    color: scanResult.classification === 'safe' ? '#176B52' : '#990011',
                  }}
                >
                  {scanResult.classification}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-white/50" style={{ borderColor: '#C4B5B0' }}>
                  <div className="text-[10px] font-extrabold uppercase text-gray-500">Calculated Risk</div>
                  <div className="text-3xl font-extrabold font-mono" style={{ color: scanResult.risk_score > 60 ? '#990011' : '#111111' }}>
                    {scanResult.risk_score} <span className="text-xs text-gray-500">/ 100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-white/50" style={{ borderColor: '#C4B5B0' }}>
                  <div className="text-[10px] font-extrabold uppercase text-gray-500">Recommended Action</div>
                  <div className="text-xl font-extrabold uppercase" style={{ color: '#990011' }}>
                    {scanResult.recommended_action}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-white/50" style={{ borderColor: '#C4B5B0' }}>
                  <div className="text-[10px] font-extrabold uppercase text-gray-500">Threat Category</div>
                  <div className="text-sm font-extrabold capitalize" style={{ color: '#111111' }}>
                    {scanResult.threat_category?.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-white/50" style={{ borderColor: '#C4B5B0' }}>
                  <div className="text-[10px] font-extrabold uppercase text-gray-500">Confidence Score</div>
                  <div className="text-xl font-extrabold font-mono" style={{ color: '#111111' }}>
                    {scanResult.confidence}%
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wide" style={{ color: '#111111' }}>
                  Security Explanation & Rule Enforcement
                </div>
                <p className="text-xs font-medium p-4 rounded-xl border bg-white/40 leading-relaxed" style={{ borderColor: '#C4B5B0', color: '#111111' }}>
                  {scanResult.explanation}
                </p>
              </div>

              {/* Threat DNA Fingerprint */}
              {scanResult.threatDna && (
                <div className="space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wide flex items-center justify-between" style={{ color: '#111111' }}>
                    <span>Threat DNA Behavioral Fingerprint</span>
                    {scanResult.threatDna.topMatch && (
                      <span className="text-[11px] font-mono text-emerald-800">
                        Top Pattern: {scanResult.threatDna.topMatch.threat_name} ({Math.round(scanResult.threatDna.topMatch.similarity * 100)}% match)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl border bg-white/30" style={{ borderColor: '#C4B5B0' }}>
                    {scanResult.threatDna.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border bg-white/70"
                        style={{ borderColor: '#C4B5B0', color: '#990011' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Evidence Breakdown */}
              {scanResult.evidence && scanResult.evidence.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wide" style={{ color: '#111111' }}>
                    Extracted Evidence & Signal Matrix ({scanResult.evidence.length})
                  </div>
                  <div className="divide-y rounded-xl border bg-white/40 overflow-hidden" style={{ borderColor: '#C4B5B0' }}>
                    {scanResult.evidence.map((ev, idx) => (
                      <div key={idx} className="p-3 text-xs flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/5" style={{ color: '#554B49' }}>
                          {ev.type}
                        </span>
                        <span className="flex-1 font-medium" style={{ color: '#111111' }}>
                          {ev.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
