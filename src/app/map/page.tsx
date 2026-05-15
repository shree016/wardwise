'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

interface Issue {
  id: string;
  issue_type: string;
  severity: string;
  severity_score: number;
  status: string;
  description: string;
  latitude: number;
  longitude: number;
  ward_name: string;
  reporter_name: string;
  reported_count: number;
  created_at: string;
}

const issueIcon = (type: string, severity: string) => {
  const colors: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
  };
  const emojis: Record<string, string> = {
    pothole: '🕳️',
    garbage_dump: '🗑️',
    broken_streetlight: '💡',
    other: '⚠️',
  };
  return { color: colors[severity] || '#6b7280', emoji: emojis[type] || '⚠️' };
};

export default function MapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selected, setSelected] = useState<Issue | null>(null);
  const [filter, setFilter] = useState('all');
  const [MapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    fetchIssues();
    import('leaflet').then((L) => {
      import('react-leaflet').then((RL) => {
        setMapComponents({ L, RL });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get(`/api/issues`);
      setIssues(res.data.issues);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    }
  };

  const filteredIssues = filter === 'all'
    ? issues
    : issues.filter(i => i.issue_type === filter || i.status === filter);

  const severityColor = (severity: string) => {
    if (severity === 'high') return 'text-red-400';
    if (severity === 'medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  const statusColor = (status: string) => {
    if (status === 'open') return 'bg-red-500';
    if (status === 'fixed') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <main className="h-screen bg-gray-950 text-white flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <Link href="/"><h1 className="text-2xl font-bold text-blue-400">NammaMarg</h1></Link>
          <div className="flex gap-3">
            <Link href="/report" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition">
              Report Issue
            </Link>
            <Link href="/dashboard" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <div className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-semibold mb-3">Live Issues ({filteredIssues.length})</h2>
            <div className="flex flex-wrap gap-2">
              {['all', 'pothole', 'garbage_dump', 'broken_streetlight', 'open', 'verified'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    filter === f ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredIssues.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No issues found</div>
            ) : (
              filteredIssues.map(issue => (
                <div
                  key={issue.id}
                  onClick={() => setSelected(issue)}
                  className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition ${
                    selected?.id === issue.id ? 'bg-gray-800 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span>{issueIcon(issue.issue_type, issue.severity).emoji}</span>
                      <span className="font-medium capitalize text-sm">
                        {issue.issue_type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mb-1">{issue.ward_name}</div>
                  <div className={`text-xs font-medium ${severityColor(issue.severity)}`}>
                    {issue.severity} severity • {issue.severity_score}/10
                  </div>
                  {issue.reported_count > 1 && (
                    <div className="text-xs text-blue-400 mt-1">
                      🔄 Reported {issue.reported_count} times
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          {!MapComponents ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading map...</div>
            </div>
          ) : (
            <MapComponents.RL.MapContainer
              center={[12.9352, 77.6245]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <MapComponents.RL.TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {filteredIssues.map(issue => (
                <MapComponents.RL.CircleMarker
                  key={issue.id}
                  center={[issue.latitude, issue.longitude]}
                  radius={issue.severity === 'high' ? 14 : issue.severity === 'medium' ? 10 : 7}
                  pathOptions={{
                    color: issueIcon(issue.issue_type, issue.severity).color,
                    fillColor: issueIcon(issue.issue_type, issue.severity).color,
                    fillOpacity: 0.7,
                  }}
                  eventHandlers={{ click: () => setSelected(issue) }}
                >
                  <MapComponents.RL.Popup>
                    <div className="text-gray-900">
                      <strong className="capitalize">{issue.issue_type.replace('_', ' ')}</strong>
                      <br />Severity: {issue.severity} ({issue.severity_score}/10)
                      <br />Ward: {issue.ward_name}
                      <br />Status: {issue.status}
                    </div>
                  </MapComponents.RL.Popup>
                </MapComponents.RL.CircleMarker>
              ))}
            </MapComponents.RL.MapContainer>
          )}

          {selected && (
            <div className="absolute bottom-4 right-4 bg-gray-900 rounded-xl p-4 border border-gray-700 w-80 z-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold capitalize">
                  {issueIcon(selected.issue_type, selected.severity).emoji} {selected.issue_type.replace('_', ' ')}
                </h3>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ward</span>
                  <span>{selected.ward_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Severity</span>
                  <span className={severityColor(selected.severity)}>
                    {selected.severity} ({selected.severity_score}/10)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="capitalize">{selected.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reports</span>
                  <span>{selected.reported_count}</span>
                </div>
                <div className="text-gray-400 mt-2 text-xs">{selected.description}</div>
              </div>
              {selected.status === 'fixed' && (
                <Link
                  href={`/verify/${selected.id}`}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm text-center block transition"
                >
                  Verify Fix ✓
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
