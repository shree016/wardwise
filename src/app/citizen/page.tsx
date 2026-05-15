'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { MapPinIcon, LogOutIcon, MapIcon, TrophyIcon, CameraIcon } from 'lucide-react';

interface Issue {
  id: string;
  issue_type: string;
  severity: string;
  severity_score: number;
  status: string;
  description: string;
  ward_name: string;
  reporter_name: string;
  reported_count: number;
  verification_count: number;
  verification_needed: number;
  created_at: string;
  latitude: number;
  longitude: number;
}

export default function CitizenPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'my_reports' | 'verify_needed' | 'resolved'>('my_reports');
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;
    const email = user?.primaryEmailAddress?.emailAddress || '';
    setUserEmail(email);
    if (email === 'bbmp@wardwise.com') router.push('/dashboard');
  }, [isLoaded, user, router]);

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get(`/api/issues`);
      setIssues(res.data.issues);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const needsVerification = issues.filter(i => i.status === 'fixed');
  const resolved = issues.filter(i => i.status === 'verified');

  const severityColor = (severity: string) => {
    if (severity === 'high') return 'text-red-400';
    if (severity === 'medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  const statusBadge = (status: string) => {
    if (status === 'open') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    if (status === 'fixed') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    return 'bg-green-500/10 text-green-400 border border-green-500/20';
  };

  const issueEmoji = (type: string) => {
    if (type === 'pothole') return '🕳️';
    if (type === 'garbage_dump') return '🗑️';
    if (type === 'broken_streetlight') return '💡';
    return '⚠️';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-violet-500 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
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
              Citizen
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
            <Link href="/report" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              <CameraIcon className="w-3.5 h-3.5" /> Report
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Welcome back! 👋</h2>
          <p className="text-muted-foreground mt-1">Help make Bangalore better — report issues and verify fixes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Issues in City', value: issues.length, color: 'text-violet-400', border: 'border-violet-500/20' },
            { label: 'Fixes Awaiting Verification', value: needsVerification.length, color: 'text-yellow-400', border: 'border-yellow-500/20' },
            { label: 'Issues Resolved', value: resolved.length, color: 'text-green-400', border: 'border-green-500/20' },
          ].map((stat, i) => (
            <div key={i} className={`bg-card rounded-xl p-5 border ${stat.border} text-center`}>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/report"
            className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 hover:from-violet-600/30 hover:to-blue-600/30 border border-violet-500/20 rounded-xl p-6 transition-all flex items-center gap-4 group"
          >
            <div className="text-4xl">📷</div>
            <div>
              <div className="font-bold text-lg text-foreground group-hover:text-violet-400 transition-colors">Report an Issue</div>
              <div className="text-muted-foreground text-sm">Upload photo — AI classifies automatically</div>
            </div>
          </Link>
          <Link
            href="/map"
            className="bg-card hover:bg-secondary/50 border border-border rounded-xl p-6 transition-all flex items-center gap-4"
          >
            <div className="text-4xl">🗺️</div>
            <div>
              <div className="font-bold text-lg text-foreground">View Live Map</div>
              <div className="text-muted-foreground text-sm">See all issues in your area</div>
            </div>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'my_reports', label: '📋 Recent Issues' },
            { key: 'verify_needed', label: `✅ Verify Fixes (${needsVerification.length})` },
            { key: 'resolved', label: `🎉 Resolved (${resolved.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border">
          {activeTab === 'my_reports' && (
            <div>
              <div className="p-5 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Recent Issues in Your City</h3>
                <Link href="/map" className="text-violet-400 text-sm hover:text-violet-300 transition-colors">View all on map →</Link>
              </div>
              {issues.slice(0, 8).map(issue => (
                <div key={issue.id} className="p-4 border-b border-border flex justify-between items-center hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{issueEmoji(issue.issue_type)}</div>
                    <div>
                      <div className="font-medium capitalize text-foreground">{issue.issue_type.replace('_', ' ')}</div>
                      <div className="text-muted-foreground text-sm">{issue.ward_name}</div>
                      <div className={`text-xs font-medium ${severityColor(issue.severity)}`}>
                        {issue.severity} severity · {issue.reported_count} report(s)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(issue.status)}`}>
                      {issue.status}
                    </span>
                    <span className="text-muted-foreground text-xs">{new Date(issue.created_at).toLocaleDateString()}</span>
                    <Link href={`/issues/${issue.id}`} className="text-xs bg-secondary hover:bg-secondary/80 text-foreground px-2 py-1 rounded-lg transition-colors border border-border whitespace-nowrap">
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'verify_needed' && (
            <div>
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">Issues Marked Fixed by BBMP</h3>
                <p className="text-muted-foreground text-sm mt-1">Visit these locations and verify if they&apos;re actually fixed</p>
              </div>
              {needsVerification.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No fixes pending verification right now 🎉</div>
              ) : (
                needsVerification.map(issue => (
                  <div key={issue.id} className="p-4 border-b border-border hover:bg-secondary/20 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{issueEmoji(issue.issue_type)}</div>
                        <div>
                          <div className="font-medium capitalize text-foreground">{issue.issue_type.replace('_', ' ')}</div>
                          <div className="text-muted-foreground text-sm">{issue.ward_name}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-24 bg-secondary rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-violet-500 to-blue-500 h-1.5 rounded-full"
                                style={{ width: `${((issue.verification_count || 0) / (issue.verification_needed || 2)) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-violet-400">
                              {issue.verification_count || 0}/{issue.verification_needed || 2} verified
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/verify/${issue.id}`}
                        className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                      >
                        Verify Fix →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'resolved' && (
            <div>
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">✅ Successfully Resolved Issues</h3>
                <p className="text-muted-foreground text-sm mt-1">Issues verified by citizens as genuinely fixed</p>
              </div>
              {resolved.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No resolved issues yet — be the first to verify a fix!</div>
              ) : (
                resolved.map(issue => (
                  <div key={issue.id} className="p-4 border-b border-border flex justify-between items-center hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">✅</div>
                      <div>
                        <div className="font-medium capitalize text-foreground">{issue.issue_type.replace('_', ' ')}</div>
                        <div className="text-muted-foreground text-sm">{issue.ward_name}</div>
                      </div>
                    </div>
                    <span className="text-green-400 text-sm font-medium">Verified Fixed</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Ward leaderboard CTA */}
        <div className="mt-6 bg-card rounded-xl p-5 border border-violet-500/20 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-foreground">🏆 Ward Leaderboard</h3>
            <p className="text-muted-foreground text-sm mt-1">See how your ward ranks against others</p>
          </div>
          <Link
            href="/wards"
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)]"
          >
            View Leaderboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
