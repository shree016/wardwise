'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface WardStat {
  ward_number: number;
  ward_name: string;
  total: number;
  open: number;
  fixed: number;
  verified: number;
  score: number;
  rank: number;
}

const allWards = [
  { number: 1, name: 'Koramangala' },
  { number: 2, name: 'Indiranagar' },
  { number: 3, name: 'JP Nagar' },
  { number: 4, name: 'Jayanagar' },
  { number: 5, name: 'Whitefield' },
  { number: 6, name: 'Hebbal' },
  { number: 7, name: 'Marathahalli' },
  { number: 8, name: 'BTM Layout' },
  { number: 9, name: 'HSR Layout' },
  { number: 10, name: 'Banashankari' },
];

export default function WardsPage() {
  const [wardStats, setWardStats] = useState<WardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'total' | 'open'>('score');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/issues`);
        computeWardStats(res.data.issues);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const computeWardStats = (issues: any[]) => {
    const map: Record<string, WardStat> = {};

    allWards.forEach(w => {
      map[w.name] = { ward_number: w.number, ward_name: w.name, total: 0, open: 0, fixed: 0, verified: 0, score: 100, rank: 0 };
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-900 border-green-700';
    if (score >= 60) return 'bg-yellow-900 border-yellow-700';
    if (score >= 40) return 'bg-orange-900 border-orange-700';
    return 'bg-red-900 border-red-700';
  };

  const getScoreBar = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading ward data...</div>
      </main>
    );
  }

  const sorted = getSorted();
  const topWard = wardStats[0];
  const worstWard = wardStats[wardStats.length - 1];
  const totalIssues = wardStats.reduce((a, b) => a + b.total, 0);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/"><h1 className="text-2xl font-bold text-blue-400">NammaMarg</h1></Link>
            <p className="text-gray-400 text-sm">Ward Leaderboard</p>
          </div>
          <div className="flex gap-3">
            <Link href="/map" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition">View Map</Link>
            <Link href="/report" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition">Report Issue</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-2">🏆 Ward Leaderboard</h2>
          <p className="text-gray-400">Public accountability scores for all Bangalore wards</p>
          <p className="text-gray-500 text-sm mt-1">Higher score = better civic maintenance</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-white">{wardStats.length}</div>
            <div className="text-gray-400 text-sm mt-1">Total Wards</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-blue-400">{totalIssues}</div>
            <div className="text-gray-400 text-sm mt-1">Total Issues</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-green-900 text-center">
            <div className="text-2xl font-bold text-green-400">{topWard?.ward_name}</div>
            <div className="text-gray-400 text-sm mt-1">🥇 Best Ward</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-red-900 text-center">
            <div className="text-2xl font-bold text-red-400">{worstWard?.ward_name}</div>
            <div className="text-gray-400 text-sm mt-1">⚠️ Needs Attention</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {wardStats.slice(0, 3).map((ward, i) => (
            <div key={ward.ward_name}
              className={`rounded-xl p-5 border text-center ${getScoreBg(ward.score)} ${i === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="text-4xl mb-2">{getRankEmoji(i + 1)}</div>
              <div className="font-bold text-lg">{ward.ward_name}</div>
              <div className={`text-3xl font-bold mt-2 ${getScoreColor(ward.score)}`}>{ward.score}</div>
              <div className="text-gray-400 text-xs mt-1">Accountability Score</div>
              <div className="mt-3 grid grid-cols-3 gap-1 text-xs">
                <div className="bg-black bg-opacity-30 rounded p-1">
                  <div className="text-red-400 font-bold">{ward.open}</div>
                  <div className="text-gray-500">Open</div>
                </div>
                <div className="bg-black bg-opacity-30 rounded p-1">
                  <div className="text-yellow-400 font-bold">{ward.fixed}</div>
                  <div className="text-gray-500">Fixed</div>
                </div>
                <div className="bg-black bg-opacity-30 rounded p-1">
                  <div className="text-green-400 font-bold">{ward.verified}</div>
                  <div className="text-gray-500">Verified</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">All Wards</h3>
          <div className="flex gap-2">
            <span className="text-gray-400 text-sm mr-2">Sort by:</span>
            {(['score', 'total', 'open'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition capitalize ${
                  sortBy === s ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {s === 'score' ? '🏆 Score' : s === 'total' ? '📊 Total' : '🔴 Open'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800">
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Rank</th>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Ward</th>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Total</th>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Open</th>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Fixed</th>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Verified</th>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Score</th>
                <th className="text-left px-5 py-4 text-gray-400 text-sm">Progress</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(ward => (
                <tr key={ward.ward_name} className="border-b border-gray-800 hover:bg-gray-800 transition">
                  <td className="px-5 py-4 text-lg">{getRankEmoji(ward.rank)}</td>
                  <td className="px-5 py-4 font-semibold">{ward.ward_name}</td>
                  <td className="px-5 py-4 text-gray-300">{ward.total}</td>
                  <td className="px-5 py-4 text-red-400 font-medium">{ward.open}</td>
                  <td className="px-5 py-4 text-yellow-400 font-medium">{ward.fixed}</td>
                  <td className="px-5 py-4 text-green-400 font-medium">{ward.verified}</td>
                  <td className="px-5 py-4">
                    <span className={`font-bold text-lg ${getScoreColor(ward.score)}`}>{ward.score}</span>
                  </td>
                  <td className="px-5 py-4 w-36">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getScoreBar(ward.score)}`}
                        style={{ width: `${ward.score}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h4 className="font-semibold mb-3 text-gray-300">📊 How Score is Calculated</h4>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-bold">-10</span>
              <span>points per open issue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold">+5</span>
              <span>points per verified fix</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-bold">100</span>
              <span>starting score per ward</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
