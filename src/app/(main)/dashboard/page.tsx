'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-context';
import { ExternalLinkIcon, XIcon } from 'lucide-react';

interface Issue {
  id: string; ticket_number: string; issue_type: string; severity: string; severity_score: number;
  status: string; description: string; ward_name: string; reported_count: number;
  verification_count: number; verification_needed: number; created_at: string;
  contractor_assigned: string; progress_percentage: number;
}
interface WardStat { ward_name: string; total: number; open: number; fixed: number; verified: number; score: number; }
interface Contractor { id: string; name: string; company: string; reliability_score: number; specializations: string[]; }

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [wardStats, setWardStats] = useState<WardStat[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'issues' | 'wards' | 'analytics'>('issues');
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [tenderForm, setTenderForm] = useState({ contractor_id: '', estimated_cost: '', awarded_amount: '', estimated_days: '', start_date: '', expected_completion: '', description: '' });
  const [submittingTender, setSubmittingTender] = useState(false);
  const [markingFixed, setMarkingFixed] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const email = user?.email || '';
    setUserEmail(email);
    if (email && email !== 'bbmp@wardwise.com') router.push('/citizen');
  }, [authLoading, user, router]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [issuesRes, contractorsRes, analyticsRes] = await Promise.all([
        axios.get('/api/issues'),
        axios.get('/api/contractors').catch(() => ({ data: { contractors: [] } })),
        axios.get('/api/analytics').catch(() => ({ data: { analytics: null } })),
      ]);
      const data: Issue[] = issuesRes.data.issues;
      setIssues(data);
      setContractors(contractorsRes.data.contractors || []);
      setAnalytics(analyticsRes.data.analytics || null);
      computeWardStats(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
    Object.values(map).forEach(w => { w.score = Math.max(0, 100 - (w.open * 10) + (w.verified * 5)); });
    setWardStats(Object.values(map).sort((a, b) => b.total - a.total));
  };

  const handleMarkFixed = async (issue: Issue) => {
    setMarkingFixed(issue.id);
    try {
      await axios.patch(`/api/issues/${issue.id}/fix`, { fixed_photo_url: '' });
      await fetchData();
    } catch (err) { console.error(err); }
    finally { setMarkingFixed(null); }
  };

  const handleAssignTender = async () => {
    if (!selectedIssue || !tenderForm.contractor_id) return;
    setSubmittingTender(true);
    try {
      await axios.post('/api/tenders', {
        issue_id: selectedIssue.id,
        contractor_id: tenderForm.contractor_id || undefined,
        estimated_cost: parseFloat(tenderForm.estimated_cost) || undefined,
        awarded_amount: parseFloat(tenderForm.awarded_amount) || undefined,
        estimated_days: parseInt(tenderForm.estimated_days) || undefined,
        start_date: tenderForm.start_date || undefined,
        expected_completion: tenderForm.expected_completion || undefined,
        description: tenderForm.description || undefined,
      });
      setShowTenderModal(false);
      setTenderForm({ contractor_id: '', estimated_cost: '', awarded_amount: '', estimated_days: '', start_date: '', expected_completion: '', description: '' });
      await fetchData();
    } catch (err) { console.error(err); }
    finally { setSubmittingTender(false); }
  };

  const openTenderModal = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowTenderModal(true);
  };

  const totalOpen = issues.filter(i => i.status === 'open').length;
  const totalFixed = issues.filter(i => i.status === 'fixed').length;
  const totalVerified = issues.filter(i => i.status === 'verified').length;
  const highSeverity = issues.filter(i => i.severity === 'high').length;
  const typeCount = issues.reduce((acc: Record<string, number>, i) => { acc[i.issue_type] = (acc[i.issue_type] || 0) + 1; return acc; }, {});

  const scoreColor = (s: number) => s >= 80 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400';
  const severityColor = (s: string) => s === 'high' ? 'text-red-400' : s === 'medium' ? 'text-yellow-400' : 'text-green-400';
  const statusBadge = (s: string) => s === 'open' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : s === 'fixed' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20';

  if (loading) return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-violet-500 animate-spin" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Issues', value: issues.length, color: 'text-foreground', border: 'border-border' },
            { label: 'Open Issues', value: totalOpen, color: 'text-red-400', border: 'border-red-500/20' },
            { label: 'Fixed (Unverified)', value: totalFixed, color: 'text-yellow-400', border: 'border-yellow-500/20' },
            { label: 'Verified Fixed', value: totalVerified, color: 'text-green-400', border: 'border-green-500/20' },
          ].map((stat, i) => (
            <div key={i} className={`bg-card rounded-xl p-5 border ${stat.border}`}>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Overview cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold mb-4 text-foreground">Issue Types</h3>
            <div className="space-y-3">
              {Object.entries(typeCount).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-foreground/80">{type.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-violet-500 to-blue-500 h-1.5 rounded-full" style={{ width: `${issues.length > 0 ? (count / issues.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-red-500/20">
            <h3 className="font-semibold mb-4 text-red-400">⚠️ High Severity</h3>
            <div className="text-5xl font-bold text-red-400 mb-2">{highSeverity}</div>
            <div className="text-muted-foreground text-sm">Require immediate attention</div>
            <div className="mt-4 space-y-2">
              {issues.filter(i => i.severity === 'high').slice(0, 3).map(issue => (
                <Link key={issue.id} href={`/issues/${issue.id}`} className="block text-xs bg-secondary rounded-lg p-2 border border-border hover:border-red-500/30 transition-colors">
                  <span className="capitalize text-foreground/80">{issue.issue_type.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground ml-2">{issue.ward_name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold mb-4 text-foreground">Resolution Rate</h3>
            <div className="flex items-center justify-center h-28">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  {issues.length > 0 ? Math.round(((totalFixed + totalVerified) / issues.length) * 100) : 0}%
                </div>
                <div className="text-muted-foreground text-sm mt-2">Issues Addressed</div>
              </div>
            </div>
            <Link href="/architecture" className="block mt-2 text-center text-xs text-violet-400 hover:text-violet-300 transition-colors">View Architecture Diagram →</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ key: 'issues', label: `📋 Issues (${issues.length})` }, { key: 'wards', label: '🏘️ Ward Scores' }, { key: 'analytics', label: '📊 Analytics' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-foreground">All Issues</h3>
              <Link href="/map" className="text-violet-400 text-sm hover:text-violet-300 transition-colors">View on map →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Ticket', 'Type', 'Ward', 'Severity', 'Status', 'Reports', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {issues.slice(0, 15).map(issue => (
                    <tr key={issue.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-violet-400">{issue.ticket_number || `NMG-${issue.id.slice(0, 8).toUpperCase()}`}</td>
                      <td className="px-4 py-3 capitalize font-medium text-foreground">{issue.issue_type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{issue.ward_name}</td>
                      <td className={`px-4 py-3 capitalize font-semibold text-sm ${severityColor(issue.severity)}`}>{issue.severity}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(issue.status)}`}>{issue.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{issue.reported_count}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(issue.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/issues/${issue.id}`} className="flex items-center gap-1 text-xs bg-secondary hover:bg-secondary/80 text-foreground px-2 py-1 rounded-lg transition-colors">
                            <ExternalLinkIcon className="w-3 h-3" /> View
                          </Link>
                          {issue.status === 'open' && !issue.contractor_assigned && (
                            <button onClick={() => openTenderModal(issue)} className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-lg transition-colors whitespace-nowrap">
                              📄 Assign
                            </button>
                          )}
                          {issue.status === 'open' && (
                            <button
                              onClick={() => handleMarkFixed(issue)}
                              disabled={markingFixed === issue.id}
                              className="text-xs bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-secondary disabled:to-secondary text-white px-2 py-1 rounded-lg transition-all"
                            >
                              {markingFixed === issue.id ? '...' : '✓ Fix'}
                            </button>
                          )}
                          {issue.status === 'fixed' && (
                            <span className="text-xs text-muted-foreground">{issue.verification_count || 0}/{issue.verification_needed || 2} verified</span>
                          )}
                          {issue.status === 'verified' && <span className="text-xs text-green-400 font-medium">✓ Done</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ward Scores Tab */}
        {activeTab === 'wards' && (
          <div className="bg-card rounded-xl border border-border">
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
                      <td className="px-5 py-3"><span className={`font-bold ${scoreColor(ward.score)}`}>{ward.score}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Avg Resolution Days', value: analytics.overview.avg_resolution_days, color: 'text-violet-400' },
                { label: 'High Severity Issues', value: analytics.overview.high_severity, color: 'text-red-400' },
                { label: 'Active Complaints', value: analytics.overview.open_complaints, color: 'text-orange-400' },
                { label: 'Total Budget (₹)', value: `${((analytics.tender_stats.total_budget || 0) / 100000).toFixed(1)}L`, color: 'text-green-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-card rounded-xl p-5 border border-border">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ward heatmap */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">🗺️ Ward Issue Heatmap</h3></div>
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {analytics.ward_heatmap.slice(0, 10).map((w: any) => (
                    <div key={w.ward} className="flex items-center gap-3">
                      <div className="text-sm text-foreground/80 w-28 truncate">{w.ward}</div>
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full" style={{ width: `${(w.total / Math.max(...analytics.ward_heatmap.map((x: any) => x.total))) * 100}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground w-8 text-right">{w.total}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Contractor performance */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">👷 Contractor Rankings</h3></div>
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {analytics.contractor_performance.slice(0, 6).map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.company}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${c.reliability_score >= 8 ? 'text-green-400' : c.reliability_score >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>{c.reliability_score}/10</div>
                        <div className="text-xs text-muted-foreground">{c.completed_projects} projects</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'analytics' && !analytics && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-muted-foreground">Analytics data will appear as issues are created and resolved.</p>
          </div>
        )}
      </div>

      {/* Assign Tender Modal */}
      {showTenderModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-foreground">Assign Tender</h3>
                <p className="text-muted-foreground text-sm mt-0.5 capitalize">{selectedIssue.issue_type.replace(/_/g, ' ')} — {selectedIssue.ward_name}</p>
              </div>
              <button onClick={() => setShowTenderModal(false)} className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Select Contractor *</label>
                <select value={tenderForm.contractor_id} onChange={(e) => setTenderForm(p => ({ ...p, contractor_id: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50">
                  <option value="">— Choose contractor —</option>
                  {contractors.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company}) — {c.reliability_score}/10</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Estimated Cost (₹)</label>
                  <input type="number" placeholder="e.g. 45000" value={tenderForm.estimated_cost} onChange={(e) => setTenderForm(p => ({ ...p, estimated_cost: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Awarded Amount (₹)</label>
                  <input type="number" placeholder="e.g. 42000" value={tenderForm.awarded_amount} onChange={(e) => setTenderForm(p => ({ ...p, awarded_amount: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Duration (days)</label>
                  <input type="number" placeholder="e.g. 7" value={tenderForm.estimated_days} onChange={(e) => setTenderForm(p => ({ ...p, estimated_days: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Start Date</label>
                  <input type="date" value={tenderForm.start_date} onChange={(e) => setTenderForm(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Expected Completion</label>
                <input type="date" value={tenderForm.expected_completion} onChange={(e) => setTenderForm(p => ({ ...p, expected_completion: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Work Description</label>
                <textarea placeholder="Describe the repair work required..." value={tenderForm.description} onChange={(e) => setTenderForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-violet-500/50 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowTenderModal(false)} className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-3 rounded-xl font-medium transition-colors">Cancel</button>
                <button onClick={handleAssignTender} disabled={!tenderForm.contractor_id || submittingTender}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground text-white px-4 py-3 rounded-xl font-medium transition-all">
                  {submittingTender ? 'Assigning...' : 'Assign Tender'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
