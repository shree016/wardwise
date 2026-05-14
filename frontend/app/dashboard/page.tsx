'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Issue {
  id: string;
  issue_type: string;
  severity: string;
  severity_score: number;
  status: string;
  description: string;
  ward_name: string;
  reported_count: number;
  verification_count: number;
  verification_needed: number;
  created_at: string;
}

interface WardStat {
  ward_name: string;
  total: number;
  open: number;
  fixed: number;
  verified: number;
  score: number;
}

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [wardStats, setWardStats] = useState<WardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserEmail(user.email || '');
    if (user.email !== 'bbmp@wardwise.com') {
      router.push('/report');
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/issues`);
      const data: Issue[] = res.data.issues;
      setIssues(data);
      computeWardStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const computeWardStats = (data: Issue[]) => {
    const map: Record<string, WardStat> = {};
    data.forEach(issue => {
      const w = issue.ward_name || 'Unknown';
      if (!map[w]) map[w] = { ward_name: w, total: 0, open: 0, fixed: 0, verified: 0, score: 100 };
      map[w].total++;
      if (issue.status === 'open') map[w].open++;
      if (issue.status === 'fixed') map[w].fixed++;
      if (issue.status === 'verified') map[w].verified++;
    });

    Object.values(map).forEach(w => {
      w.score = Math.max(0, 100 - (w.open * 10) + (w.verified * 5));
    });

    setWardStats(Object.values(map).sort((a, b) => b.total - a.total));
  };

  const totalOpen = issues.filter(i => i.status === 'open').length;
  const totalFixed = issues.filter(i => i.status === 'fixed').length;
  const totalVerified = issues.filter(i => i.status === 'verified').length;
  const highSeverity = issues.filter(i => i.severity === 'high').length;

  const typeCount = issues.reduce((acc: Record<string, number>, i) => {
    acc[i.issue_type] = (acc[i.issue_type] || 0) + 1;
    return acc;
  }, {});

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const severityColor = (severity: string) => {
    if (severity === 'high') return 'text-red-400';
    if (severity === 'medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/"><h1 className="text-2xl font-bold text-blue-400">WardWise</h1></Link>
            <p className="text-gray-400 text-sm">BBMP Official Dashboard</p>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-gray-500 text-sm">{userEmail}</span>
            <Link href="/map" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition">
              View Map
            </Link>
            <Link href="/wards" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition">
  Ward Scores
</Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="text-3xl font-bold text-white">{issues.length}</div>
            <div className="text-gray-400 text-sm mt-1">Total Issues</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-red-900">
            <div className="text-3xl font-bold text-red-400">{totalOpen}</div>
            <div className="text-gray-400 text-sm mt-1">Open Issues</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-yellow-900">
            <div className="text-3xl font-bold text-yellow-400">{totalFixed}</div>
            <div className="text-gray-400 text-sm mt-1">Fixed (Unverified)</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-green-900">
            <div className="text-3xl font-bold text-green-400">{totalVerified}</div>
            <div className="text-gray-400 text-sm mt-1">Verified Fixed</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Issue Type Breakdown */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 className="font-semibold mb-4">Issue Types</h3>
            <div className="space-y-3">
              {Object.entries(typeCount).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-300">{type.replace('_', ' ')}</span>
                    <span className="text-gray-400">{count}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / issues.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Severity Alert */}
          <div className="bg-gray-900 rounded-xl p-5 border border-red-900">
            <h3 className="font-semibold mb-4 text-red-400">⚠️ High Severity Issues</h3>
            <div className="text-5xl font-bold text-red-400 mb-2">{highSeverity}</div>
            <div className="text-gray-400 text-sm">Require immediate attention</div>
            <div className="mt-4 space-y-2">
              {issues.filter(i => i.severity === 'high').slice(0, 3).map(issue => (
                <div key={issue.id} className="text-xs bg-gray-800 rounded-lg p-2">
                  <span className="capitalize">{issue.issue_type.replace('_', ' ')}</span>
                  <span className="text-gray-500 ml-2">{issue.ward_name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Rate */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 className="font-semibold mb-4">Resolution Rate</h3>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400">
                  {issues.length > 0
                    ? Math.round(((totalFixed + totalVerified) / issues.length) * 100)
                    : 0}%
                </div>
                <div className="text-gray-400 text-sm mt-2">Issues Addressed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ward Accountability Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 mb-8">
          <div className="p-5 border-b border-gray-800">
            <h3 className="font-semibold">Ward Accountability Scores</h3>
            <p className="text-gray-400 text-sm mt-1">Lower score = more neglected ward</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Ward</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Total</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Open</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Fixed</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Verified</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Score</th>
                </tr>
              </thead>
              <tbody>
                {wardStats.map(ward => (
                  <tr key={ward.ward_name} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="px-5 py-3 font-medium">{ward.ward_name}</td>
                    <td className="px-5 py-3 text-gray-300">{ward.total}</td>
                    <td className="px-5 py-3 text-red-400">{ward.open}</td>
                    <td className="px-5 py-3 text-yellow-400">{ward.fixed}</td>
                    <td className="px-5 py-3 text-green-400">{ward.verified}</td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${scoreColor(ward.score)}`}>{ward.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold">Recent Issues</h3>
            <Link href="/map" className="text-blue-400 text-sm hover:underline">View on map →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Type</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Ward</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Severity</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Status</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Reports</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Date</th>
                  <th className="text-left px-5 py-3 text-gray-400 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.slice(0, 10).map(issue => (
                  <tr key={issue.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="px-5 py-3 capitalize font-medium">
                      {issue.issue_type.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-3 text-gray-400">{issue.ward_name}</td>
                    <td className={`px-5 py-3 capitalize font-medium ${severityColor(issue.severity)}`}>
                      {issue.severity}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${
                        issue.status === 'open' ? 'bg-red-600' :
                        issue.status === 'fixed' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{issue.reported_count}</td>
                    <td className="px-5 py-3 text-gray-400 text-sm">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {/* BBMP only sees Mark Fixed */}
                      {issue.status === 'open' && (
                        <button
                          onClick={async () => {
                            await axios.patch(
                              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/issues/${issue.id}/fix`,
                              { fixed_photo_url: '' }
                            );
                            fetchData();
                          }}
                          className="text-xs bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-lg transition"
                        >
                          Mark Fixed
                        </button>
                      )}
                      {/* Fixed — waiting for citizens */}
                      {issue.status === 'fixed' && (
                        <span className="text-xs text-gray-500 italic">
                          Awaiting citizens ({issue.verification_count || 0}/{issue.verification_needed || 2})
                        </span>
                      )}
                      {/* Fully verified by citizens */}
                      {issue.status === 'verified' && (
                        <span className="text-xs text-green-400 font-medium">✅ Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}