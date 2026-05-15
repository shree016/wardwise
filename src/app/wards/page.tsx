'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Ward {
  id: string;
  number: number;
  name: string;
  area_sqkm: number;
  population: number;
  center_lat: number;
  center_lng: number;
}

interface WardStat {
  ward_number: number;
  ward_name: string;
  area_sqkm: number;
  population: number;
  total: number;
  open: number;
  fixed: number;
  verified: number;
  score: number;
  rank: number;
}

export default function WardsPage() {
  const [wardStats, setWardStats] = useState<WardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'total' | 'open'>('score');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wardsRes, issuesRes] = await Promise.all([
          axios.get('/api/wards'),
          axios.get('/api/issues'),
        ]);
        computeWardStats(wardsRes.data.wards || [], issuesRes.data.issues || []);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load ward data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const computeWardStats = (wards: Ward[], issues: any[]) => {
    const map: Record<string, WardStat> = {};

    wards.forEach(w => {
      map[w.name] = {
        ward_number: w.number,
        ward_name: w.name,
        area_sqkm: w.area_sqkm,
        population: w.population,
        total: 0, open: 0, fixed: 0, verified: 0,
        score: 100, rank: 0,
      };
    });

    issues.forEach(issue => {
      const w = issue.ward_name;
      if (!map[w]) return;
      map[w].total++;
      if (issue.status === 'open') map[w].open++;
      if (issue.status === 'fixed') map[w].fixed++;
      if (issue.status === 'verified') map[w].verified++;
    });

    Object.values(map).forEach(w => {
      w.score = Math.max(0, 100 - (w.open * 10) + (w.verified * 5));
    });

    const sorted = Object.values(map).sort((a, b) => b.score - a.score);
    sorted.forEach((w, i) => { w.rank = i + 1; });
    setWardStats(sorted);
  };

  const getSorted = () => {
    const copy = [...wardStats];
    if (sortBy === 'score') return copy.sort((a, b) => b.score - a.score);
    if (sortBy === 'total') return copy.sort((a, b) => b.total - a.total);
    if (sortBy === 'open') return copy.sort((a, b) => b.open - a.open);
    return copy;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-900/60 border-green-700/60';
    if (score >= 60) return 'bg-yellow-900/60 border-yellow-700/60';
    if (score >= 40) return 'bg-orange-900/60 border-orange-700/60';
    return 'bg-red-900/60 border-red-700/60';
  };

  const scoreBar = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-violet-500 animate-spin" />
          <p className="text-muted-foreground">Loading ward data…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-secondary rounded-lg text-sm">
            Retry
          </button>
        </div>
      </main>
    );
  }

  const sorted = getSorted();
  const topWard = wardStats[0];
  const worstWard = [...wardStats].sort((a, b) => a.score - b.score)[0];
  const totalIssues = wardStats.reduce((a, b) => a + b.total, 0);
  const totalPopulation = wardStats.reduce((a, b) => a + (b.population || 0), 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-2">🏆 Ward Leaderboard</h2>
          <p className="text-muted-foreground">Public accountability scores for all Bangalore wards</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Higher score = better civic maintenance · Updated live</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-5 border border-border text-center">
            <div className="text-3xl font-bold text-foreground">{wardStats.length}</div>
            <div className="text-muted-foreground text-sm mt-1">Total Wards</div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border text-center">
            <div className="text-3xl font-bold text-violet-400">{totalIssues}</div>
            <div className="text-muted-foreground text-sm mt-1">Total Issues</div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-green-500/20 text-center">
            <div className="text-xl font-bold text-green-400 truncate px-2">{topWard?.ward_name}</div>
            <div className="text-muted-foreground text-sm mt-1">🥇 Best Ward</div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-red-500/20 text-center">
            <div className="text-xl font-bold text-red-400 truncate px-2">{worstWard?.ward_name}</div>
            <div className="text-muted-foreground text-sm mt-1">⚠️ Needs Attention</div>
          </div>
        </div>

        {/* Population coverage */}
        <div className="bg-card rounded-xl p-4 border border-border mb-8 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Coverage: <span className="text-foreground font-medium">{totalPopulation.toLocaleString()} residents</span> across{' '}
            <span className="text-foreground font-medium">{wardStats.length} wards</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Issues per 10k residents:{' '}
            <span className="text-violet-400 font-medium">
              {totalPopulation > 0 ? ((totalIssues / totalPopulation) * 10000).toFixed(1) : '—'}
            </span>
          </div>
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {wardStats.slice(0, 3).map((ward, i) => (
            <div
              key={ward.ward_name}
              className={`rounded-xl p-5 border text-center ${scoreBg(ward.score)} ${i === 0 ? 'ring-2 ring-yellow-400/60' : ''}`}
            >
              <div className="text-4xl mb-2">{getRankEmoji(i + 1)}</div>
              <div className="font-bold text-lg text-foreground">{ward.ward_name}</div>
              {ward.population > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {(ward.population / 1000).toFixed(0)}k residents · {ward.area_sqkm} km²
                </div>
              )}
              <div className={`text-3xl font-bold mt-3 ${scoreColor(ward.score)}`}>{ward.score}</div>
              <div className="text-muted-foreground text-xs mt-1">Accountability Score</div>
              <div className="mt-3 grid grid-cols-3 gap-1 text-xs">
                <div className="bg-black/20 rounded p-1.5">
                  <div className="text-red-400 font-bold">{ward.open}</div>
                  <div className="text-muted-foreground">Open</div>
                </div>
                <div className="bg-black/20 rounded p-1.5">
                  <div className="text-yellow-400 font-bold">{ward.fixed}</div>
                  <div className="text-muted-foreground">Fixed</div>
                </div>
                <div className="bg-black/20 rounded p-1.5">
                  <div className="text-green-400 font-bold">{ward.verified}</div>
                  <div className="text-muted-foreground">Verified</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full table */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">All Wards</h3>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm mr-1">Sort by:</span>
            {(['score', 'total', 'open'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition capitalize ${
                  sortBy === s
                    ? 'bg-violet-600 text-white shadow-[0_0_8px_rgba(139,92,246,0.4)]'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'score' ? '🏆 Score' : s === 'total' ? '📊 Total' : '🔴 Open'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider">Rank</th>
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider">Ward</th>
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Population</th>
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Area</th>
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider">Total</th>
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider">Open</th>
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider">Fixed</th>
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider">Verified</th>
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider">Score</th>
                <th className="text-left px-5 py-3.5 text-muted-foreground text-xs uppercase tracking-wider w-28">Progress</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(ward => (
                <tr key={ward.ward_name} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-4 text-base">{getRankEmoji(ward.rank)}</td>
                  <td className="px-5 py-4 font-semibold text-foreground">{ward.ward_name}</td>
                  <td className="px-5 py-4 text-muted-foreground text-sm hidden md:table-cell">
                    {ward.population > 0 ? `${(ward.population / 1000).toFixed(0)}k` : '—'}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground text-sm hidden md:table-cell">
                    {ward.area_sqkm > 0 ? `${ward.area_sqkm} km²` : '—'}
                  </td>
                  <td className="px-5 py-4 text-foreground">{ward.total}</td>
                  <td className="px-5 py-4 text-red-400 font-medium">{ward.open}</td>
                  <td className="px-5 py-4 text-yellow-400 font-medium">{ward.fixed}</td>
                  <td className="px-5 py-4 text-green-400 font-medium">{ward.verified}</td>
                  <td className="px-5 py-4">
                    <span className={`font-bold text-lg ${scoreColor(ward.score)}`}>{ward.score}</span>
                  </td>
                  <td className="px-5 py-4 w-28">
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${scoreBar(ward.score)}`}
                        style={{ width: `${Math.min(ward.score, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5 block">{ward.score}/100</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-card rounded-xl p-5 border border-border">
          <h4 className="font-semibold mb-3 text-foreground">📊 How the Score is Calculated</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-bold text-base">−10</span>
              <span>points per open issue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold text-base">+5</span>
              <span>points per citizen-verified fix</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-bold text-base">100</span>
              <span>base score (all wards start equal)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
