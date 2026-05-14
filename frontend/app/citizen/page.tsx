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

  useEffect(() => {
    checkAuth();
    fetchIssues();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.email === 'bbmp@wardwise.com') {
      router.push('/dashboard');
      return;
    }
    setUserEmail(user.email || '');
  };

  const fetchIssues = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/issues`);
      setIssues(res.data.issues);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const myReports = issues.filter(i => i.reporter_name === userEmail || true).slice(0, 5);
  const needsVerification = issues.filter(i => i.status === 'fixed');
  const resolved = issues.filter(i => i.status === 'verified');

  const severityColor = (severity: string) => {
    if (severity === 'high') return 'text-red-400';
    if (severity === 'medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  const statusColor = (status: string) => {
    if (status === 'open') return 'bg-red-600';
    if (status === 'fixed') return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/"><h1 className="text-2xl font-bold text-blue-400">WardWise</h1></Link>
            <p className="text-gray-400 text-sm">Citizen Dashboard</p>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-gray-500 text-sm">{userEmail}</span>
            <Link href="/map" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition">
              Map
            </Link>
            <Link href="/wards" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition">
              Ward Scores
            </Link>
            <Link href="/report" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition">
              Report Issue
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

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Welcome back! 👋</h2>
          <p className="text-gray-400 mt-1">Help make Bangalore better — report issues and verify fixes</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
            <div className="text-3xl font-bold text-blue-400">{issues.length}</div>
            <div className="text-gray-400 text-sm mt-1">Total Issues in City</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-yellow-900 text-center">
            <div className="text-3xl font-bold text-yellow-400">{needsVerification.length}</div>
            <div className="text-gray-400 text-sm mt-1">Fixes Awaiting Your Verification</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-green-900 text-center">
            <div className="text-3xl font-bold text-green-400">{resolved.length}</div>
            <div className="text-gray-400 text-sm mt-1">Issues Resolved</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/report"
            className="bg-blue-600 hover:bg-blue-700 rounded-xl p-6 transition flex items-center gap-4">
            <div className="text-4xl">📷</div>
            <div>
              <div className="font-bold text-lg">Report an Issue</div>
              <div className="text-blue-200 text-sm">Upload photo — AI classifies automatically</div>
            </div>
          </Link>
          <Link href="/map"
            className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition flex items-center gap-4 border border-gray-700">
            <div className="text-4xl">🗺️</div>
            <div>
              <div className="font-bold text-lg">View Live Map</div>
              <div className="text-gray-400 text-sm">See all issues in your area</div>
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">

          {/* Recent Issues Tab */}
          {activeTab === 'my_reports' && (
            <div>
              <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold">Recent Issues in Your City</h3>
                <Link href="/map" className="text-blue-400 text-sm hover:underline">View all on map →</Link>
              </div>
              {issues.slice(0, 8).map(issue => (
                <div key={issue.id} className="p-4 border-b border-gray-800 flex justify-between items-center hover:bg-gray-800 transition">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {issue.issue_type === 'pothole' ? '🕳️' :
                       issue.issue_type === 'garbage_dump' ? '🗑️' :
                       issue.issue_type === 'broken_streetlight' ? '💡' : '⚠️'}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{issue.issue_type.replace('_', ' ')}</div>
                      <div className="text-gray-400 text-sm">{issue.ward_name}</div>
                      <div className={`text-xs font-medium ${severityColor(issue.severity)}`}>
                        {issue.severity} severity • {issue.reported_count} report(s)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${statusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Verify Fixes Tab */}
          {activeTab === 'verify_needed' && (
            <div>
              <div className="p-5 border-b border-gray-800">
                <h3 className="font-semibold">Issues Marked Fixed by BBMP</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Visit these locations and verify if they're actually fixed
                </p>
              </div>
              {needsVerification.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No fixes pending verification right now 🎉
                </div>
              ) : (
                needsVerification.map(issue => (
                  <div key={issue.id} className="p-4 border-b border-gray-800 hover:bg-gray-800 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {issue.issue_type === 'pothole' ? '🕳️' :
                           issue.issue_type === 'garbage_dump' ? '🗑️' :
                           issue.issue_type === 'broken_streetlight' ? '💡' : '⚠️'}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{issue.issue_type.replace('_', ' ')}</div>
                          <div className="text-gray-400 text-sm">{issue.ward_name}</div>
                          <div className="text-gray-500 text-xs mt-1">{issue.description}</div>
                          {/* Verification progress */}
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${((issue.verification_count || 0) / (issue.verification_needed || 2)) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-blue-400">
                                {issue.verification_count || 0}/{issue.verification_needed || 2} verified
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/verify/${issue.id}`}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap"
                      >
                        Verify Fix →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Resolved Tab */}
          {activeTab === 'resolved' && (
            <div>
              <div className="p-5 border-b border-gray-800">
                <h3 className="font-semibold">✅ Successfully Resolved Issues</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Issues verified by citizens as genuinely fixed
                </p>
              </div>
              {resolved.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No resolved issues yet — be the first to verify a fix!
                </div>
              ) : (
                resolved.map(issue => (
                  <div key={issue.id} className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">✅</div>
                      <div>
                        <div className="font-medium capitalize">{issue.issue_type.replace('_', ' ')}</div>
                        <div className="text-gray-400 text-sm">{issue.ward_name}</div>
                      </div>
                    </div>
                    <span className="text-green-400 text-sm font-medium">Verified Fixed</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Ward Leaderboard Teaser */}
        <div className="mt-6 bg-gray-900 rounded-xl p-5 border border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">🏆 Ward Leaderboard</h3>
            <p className="text-gray-400 text-sm mt-1">See how your ward ranks against others</p>
          </div>
          <Link
            href="/wards"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl text-sm font-medium transition"
          >
            View Leaderboard →
          </Link>
        </div>

      </div>
    </main>
  );
}