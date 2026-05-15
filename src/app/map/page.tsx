'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import dynamic from 'next/dynamic';
import type { Issue } from './MapboxCanvas';

// Load map only on client — mapbox-gl references browser globals (window, Worker)
const MapboxCanvas = dynamic(() => import('./MapboxCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-violet-500 animate-spin" />
      <p className="text-white/40 text-sm">Loading map…</p>
    </div>
  ),
});

const ISSUE_TYPES = ['all', 'pothole', 'garbage_dump', 'broken_streetlight'];
const STATUSES = ['all', 'open', 'fixed', 'verified'];

const issueEmoji = (type: string) => {
  if (type === 'pothole') return '🕳️';
  if (type === 'garbage_dump') return '🗑️';
  if (type === 'broken_streetlight') return '💡';
  return '⚠️';
};

const statusClass = (status: string) => {
  if (status === 'open') return 'bg-red-500/10 text-red-400 border border-red-500/30';
  if (status === 'fixed') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
  return 'bg-green-500/10 text-green-400 border border-green-500/30';
};

const severityClass = (severity: string) => {
  if (severity === 'high') return 'bg-red-500/10 text-red-400 border border-red-500/30';
  if (severity === 'medium') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
  return 'bg-green-500/10 text-green-400 border border-green-500/30';
};

export default function MapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selected, setSelected] = useState<Issue | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingIssues, setLoadingIssues] = useState(true);

  useEffect(() => {
    axios.get('/api/issues')
      .then(res => setIssues(res.data.issues || []))
      .catch(err => console.error('Failed to fetch issues:', err))
      .finally(() => setLoadingIssues(false));
  }, []);

  const filteredIssues = issues.filter(issue => {
    if (typeFilter !== 'all' && issue.issue_type !== typeFilter) return false;
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    return true;
  });

  const openCount = issues.filter(i => i.status === 'open').length;
  const fixedCount = issues.filter(i => i.status === 'fixed').length;
  const verifiedCount = issues.filter(i => i.status === 'verified').length;

  return (
    <main className="h-[calc(100vh-3.5rem)] bg-background text-foreground flex overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="w-[340px] flex flex-col border-r border-border bg-card flex-shrink-0">

        {/* Header + filters */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Live Issues Map</h2>
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
              {loadingIssues ? '…' : `${filteredIssues.length} shown`}
            </span>
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-1.5">
            {ISSUE_TYPES.map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  typeFilter === f
                    ? 'bg-violet-600 text-white shadow-[0_0_8px_rgba(139,92,246,0.5)]'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' ? 'All types' : `${issueEmoji(f)} ${f.replace(/_/g, ' ')}`}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div className="grid grid-cols-4 gap-1">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? s === 'all' ? 'bg-secondary text-foreground ring-1 ring-border'
                      : s === 'open' ? 'bg-red-500 text-white'
                      : s === 'fixed' ? 'bg-yellow-500 text-black'
                      : 'bg-green-500 text-white'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'all' ? 'All' : s === 'open' ? '🔴 Open' : s === 'fixed' ? '🟡 Fixed' : '🟢 Done'}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-2 border-b border-border flex items-center gap-3 text-xs text-muted-foreground">
          {[['bg-red-500', 'Open'], ['bg-yellow-500', 'Fixed'], ['bg-green-500', 'Verified']].map(([cls, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${cls} inline-block`} />
              {label}
            </span>
          ))}
          <span className="ml-auto">Larger = high severity</span>
        </div>

        {/* Issue list */}
        <div className="flex-1 overflow-y-auto">
          {loadingIssues ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-border border-t-violet-500 animate-spin" />
              <p className="text-xs text-muted-foreground">Loading issues…</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="text-sm">No issues match the current filters</p>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => setSelected(issue)}
                className={`px-4 py-3 border-b border-border cursor-pointer transition-all hover:bg-secondary/40 ${
                  selected?.id === issue.id
                    ? 'bg-violet-500/10 border-l-2 border-l-violet-500 pl-3.5'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-base mt-0.5 flex-shrink-0">{issueEmoji(issue.issue_type)}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm capitalize text-foreground leading-tight truncate">
                        {issue.issue_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{issue.ward_name}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${statusClass(issue.status)}`}>
                      {issue.status}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${severityClass(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>
                {issue.reported_count > 1 && (
                  <p className="text-xs text-violet-400 mt-1.5">
                    🔄 {issue.reported_count} reports
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Report CTA */}
        <div className="p-3 border-t border-border">
          <Link
            href="/report"
            className="block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-medium transition-all shadow-[0_0_12px_rgba(139,92,246,0.3)]"
          >
            📷 Report a New Issue
          </Link>
        </div>
      </aside>

      {/* ── Map canvas ───────────────────────────────────── */}
      <div className="flex-1 relative">
        <MapboxCanvas
          issues={filteredIssues}
          selected={selected}
          onSelect={issue => setSelected(issue)}
          openCount={openCount}
          fixedCount={fixedCount}
          verifiedCount={verifiedCount}
        />

        {/* Selected issue detail panel */}
        {selected && (
          <div className="absolute bottom-6 right-6 bg-card/95 backdrop-blur-md rounded-2xl p-4 border border-border w-[300px] z-10 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{issueEmoji(selected.issue_type)}</span>
                <div>
                  <h3 className="font-semibold capitalize text-sm text-foreground leading-tight">
                    {selected.issue_type.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selected.ward_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground w-6 h-6 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusClass(selected.status)}`}>
                {selected.status}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${severityClass(selected.severity)}`}>
                {selected.severity} · {selected.severity_score}/10
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Reports</span>
                <span className="text-foreground font-medium">{selected.reported_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Reported on</span>
                <span className="text-foreground">{new Date(selected.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Reporter</span>
                <span className="text-foreground truncate max-w-[140px]">{selected.reporter_name || 'Anonymous'}</span>
              </div>
            </div>

            {selected.description && (
              <p className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {selected.description}
              </p>
            )}

            <div className="mt-3 flex gap-2">
              {selected.status === 'fixed' && (
                <Link
                  href={`/verify/${selected.id}`}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white py-2 rounded-xl text-xs font-medium text-center transition-all"
                >
                  ✓ Verify Fix
                </Link>
              )}
              <Link
                href={`/issues/${selected.id}`}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-xl text-xs font-medium text-center transition-colors border border-border"
              >
                View Details →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
