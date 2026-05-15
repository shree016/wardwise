'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { MapPinIcon, LogOutIcon, MapIcon, TrophyIcon, LayoutDashboardIcon } from 'lucide-react';

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
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;
    const email = user?.primaryEmailAddress?.emailAddress || '';
    setUserEmail(email);
    if (email && email !== 'bbmp@wardwise.com') {
      router.push('/citizen');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/issues`);
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
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-violet-500 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                <MapPinIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-violet-500 to-blue-400 bg-clip-text text-transparent">
                NammaMarg
              </span>
            </Link>
            <span className="hidden sm:block text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
              BBMP Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-sm text-muted-foreground">{userEmail}</span>
            <Link href="/map" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors">
              <MapIcon className="w-3.5 h-3.5" /> Map
            </Link>
            <Link href="/wards" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors">
              <TrophyIcon className="w-3.5 h-3.5" /> Wards
            </Link>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
            >
              <LogOutIcon className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
  { label: '📋 Total Issues', value: issues.length, color: 'text-foreground', border: 'border-border' },

  { label: '🚨 Open Issues', value: totalOpen, color: 'text-red-400', border: 'border-red-500/20' },

  { label: '🛠 Fixed Issues', value: totalFixed, color: 'text-yellow-400', border: 'border-yellow-500/20' },

  { label: '✅ Verified Fixed', value: totalVerified, color: 'text-green-400', border: 'border-green-500/20' },
].map((stat, i) => (
            <div key={i} className={`bg-card rounded-xl p-5 border ${stat.border}`}>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Issue types */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold mb-4 text-foreground">Issue Types</h3>
            <div className="space-y-3">
              {Object.entries(typeCount).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-foreground/80">{type.replace('_', ' ')}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-blue-500 h-1.5 rounded-full"
                      style={{ width: `${issues.length > 0 ? (count / issues.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High severity */}
          <div className="bg-card rounded-xl p-5 border border-red-500/20">
            <h3 className="font-semibold mb-4 text-red-400">⚠️ High Severity</h3>
            <div className="text-5xl font-bold text-red-400 mb-2">{highSeverity}</div>
            <div className="text-muted-foreground text-sm">Require immediate attention</div>
            <div className="mt-4 space-y-2">
              {issues.filter(i => i.severity === 'high').slice(0, 3).map(issue => (
                <div key={issue.id} className="text-xs bg-secondary rounded-lg p-2 border border-border">
                  <span className="capitalize text-foreground/80">{issue.issue_type.replace('_', ' ')}</span>
                  <span className="text-muted-foreground ml-2">{issue.ward_name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution rate */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold mb-4 text-foreground">Resolution Rate</h3>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  {issues.length > 0 ? Math.round(((totalFixed + totalVerified) / issues.length) * 100) : 0}%
                </div>
                <div className="text-muted-foreground text-sm mt-2">Issues Addressed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ward scores table */}
        <div className="bg-card rounded-xl border border-border mb-8">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">Ward Accountability Scores</h3>
            <p className="text-muted-foreground text-sm mt-1">Lower score = more neglected ward</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Ward', 'Total', 'Open', 'Fixed', 'Verified', 'Score'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-muted-foreground text-sm font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wardStats.map(ward => (
                  <tr key={ward.ward_name} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{ward.ward_name}</td>
                    <td className="px-5 py-3 text-foreground/70">{ward.total}</td>
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

        {/* Recent issues table */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Recent Issues</h3>
            <Link href="/map" className="text-violet-400 text-sm hover:text-violet-300 transition-colors">View on map →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Type', 'Ward', 'Severity', 'Status', 'Reports', 'Date', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-muted-foreground text-sm font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issues.slice(0, 10).map(issue => (
                  <tr key={issue.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 capitalize font-medium text-foreground">
                      {issue.issue_type.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{issue.ward_name}</td>
                    <td className={`px-5 py-3 capitalize font-medium ${severityColor(issue.severity)}`}>
                      {issue.severity}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'open' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        issue.status === 'fixed' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{issue.reported_count}</td>
                    <td className="px-5 py-3 text-muted-foreground text-sm">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {issue.status === 'open' && (
                        <button
                          onClick={async () => {
                            await axios.patch(`/api/issues/${issue.id}/fix`, { fixed_photo_url: '' });
                            fetchData();
                          }}
                          className="text-xs bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-3 py-1 rounded-lg transition-all"
                        >
                          Mark Fixed
                        </button>
                      )}
                      {issue.status === 'fixed' && (
                        <span className="text-xs text-muted-foreground italic">
                          {issue.verification_count || 0}/{issue.verification_needed || 2} verified
                        </span>
                      )}
                      {issue.status === 'verified' && (
                        <span className="text-xs text-green-400 font-medium">✓ Verified</span>
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
