import { getDb } from './mongodb';

export interface DashboardStats {
  totalScans: number;
  todayScans: number;
  threatsDetected: number;
  highRiskCount: number;
  dangerousCount: number;
  criticalCount: number;
  safeCount: number;
  suspiciousCount: number;
  recentScans: Array<Record<string, unknown>>;
  topDnaTags: Array<{ tag: string; count: number; avgRisk: number }>;
  riskTrend: Array<{ label: string; risk: number; dangerous: number }>;
  threatDistribution: { safe: number; suspicious: number; dangerous: number; critical: number };
}

export interface SecurityPosture {
  score: number;
  status: 'HEALTHY' | 'WATCH' | 'DEGRADED' | 'CRITICAL';
}

let cachedStats: { data: DashboardStats; timestamp: number } | null = null;
const CACHE_TTL_MS = 3000; // 3-second cache for instant page loads

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = Date.now();
  if (cachedStats && now - cachedStats.timestamp < CACHE_TTL_MS) {
    return cachedStats.data;
  }

  const db = await getDb();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalScans, todayScans, classificationCounts, recentScans, dnaTagData] = await Promise.all([
    db.collection('scans').countDocuments(),
    db.collection('scans').countDocuments({ createdAt: { $gte: startOfDay } }),
    db.collection('scans').aggregate([
      { $group: { _id: '$classification', count: { $sum: 1 } } },
    ]).toArray(),
    db.collection('scans').find({}).sort({ createdAt: -1 }).limit(10).toArray(),
    db.collection('scans').aggregate([
      { $unwind: '$dnaTags' },
      { $match: { dnaTags: { $exists: true, $ne: '' } } },
      { $group: { _id: '$dnaTags', count: { $sum: 1 }, avgRisk: { $avg: '$riskScore' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray(),
  ]);

  const counts: Record<string, number> = {};
  for (const c of classificationCounts) {
    counts[String(c._id)] = Number(c.count);
  }

  const threatsDetected = (counts.dangerous || 0) + (counts.critical || 0) + (counts.suspicious || 0);

  const topDnaTags = dnaTagData.map((d) => ({
    tag: String(d._id),
    count: Number(d.count),
    avgRisk: Math.round(Number(d.avgRisk)),
  }));

  const riskTrend = recentScans.map((s, i) => ({
    label: `#${recentScans.length - i}`,
    risk: Number(s.riskScore) || 0,
    dangerous: s.classification === 'dangerous' || s.classification === 'critical' ? 1 : 0,
  }));

  const data: DashboardStats = {
    totalScans,
    todayScans,
    threatsDetected,
    highRiskCount: (counts.dangerous || 0) + (counts.critical || 0),
    dangerousCount: counts.dangerous || 0,
    criticalCount: counts.critical || 0,
    safeCount: counts.safe || 0,
    suspiciousCount: counts.suspicious || 0,
    recentScans,
    topDnaTags,
    riskTrend,
    threatDistribution: {
      safe: counts.safe || 0,
      suspicious: counts.suspicious || 0,
      dangerous: counts.dangerous || 0,
      critical: counts.critical || 0,
    },
  };

  cachedStats = { data, timestamp: now };
  return data;
}

export function calculateSecurityPosture(stats: DashboardStats): SecurityPosture {
  let score = 100;
  if (stats.criticalCount > 0) score -= Math.min(40, stats.criticalCount * 15);
  if (stats.dangerousCount > 0) score -= Math.min(25, stats.dangerousCount * 5);
  if (stats.suspiciousCount > 0) score -= Math.min(15, stats.suspiciousCount * 2);
  score = Math.max(0, Math.min(100, score));
  const status: SecurityPosture['status'] =
    score >= 80 ? 'HEALTHY' : score >= 60 ? 'WATCH' : score >= 40 ? 'DEGRADED' : 'CRITICAL';
  return { score, status };
}
