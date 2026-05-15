'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useUser, useClerk } from '@clerk/nextjs';
import { MapPinIcon, LogOutIcon, MapIcon, ArrowLeftIcon, ClockIcon, UserIcon } from 'lucide-react';

interface Issue {
  id: string; ticket_number: string; issue_type: string; severity: string; severity_score: number;
  status: string; description: string; ward_name: string; ward_number: number; reporter_name: string;
  reported_count: number; verification_count: number; verification_needed: number; confidence: number;
  photo_url: string; fixed_photo_url: string; latitude: number; longitude: number;
  created_at: string; fixed_at: string; verified_at: string; urgency_score: number;
  estimated_cost: number; progress_percentage: number; contractor_assigned: string;
}
interface Contractor {
  id: string; name: string; company: string; phone: string; reliability_score: number;
  completed_projects: number; average_quality_score: number; is_blacklisted: boolean;
  corruption_complaints_count: number; specializations: string[];
}
interface Tender {
  id: string; tender_number: string; status: string; estimated_cost: number;
  awarded_amount: number; released_amount: number; estimated_days: number;
  start_date: string; expected_completion: string; actual_completion: string;
  description: string; contractors: Contractor;
}
interface WorkProgress {
  id: string; update_type: string; description: string; photo_url: string;
  progress_percentage: number; workers_count: number; materials_used: string;
  uploaded_by: string; created_at: string;
}
interface Verification {
  id: string; verifier_name: string; photo_url: string; ai_verified: boolean;
  ai_confidence: number; ai_reason: string; verdict: string; created_at: string;
}
interface Inspection {
  id: string; inspector_name: string; department: string; inspection_date: string;
  quality_score: number; status: string; remarks: string; ai_verified: boolean;
  ai_confidence: number; ai_reason: string; created_at: string;
}
interface Complaint {
  id: string; complaint_type: string; description: string; complainant_name: string;
  status: string; created_at: string;
}

export default function IssueDetailPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [tender, setTender] = useState<Tender | null>(null);
  const [workProgress, setWorkProgress] = useState<WorkProgress[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ type: 'poor_quality', description: '', name: '' });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const { user } = useUser();
  const { signOut } = useClerk();
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const isBBMP = userEmail === 'bbmp@wardwise.com';

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/issues/${id}/full`);
      if (res.data.success) {
        setIssue(res.data.issue);
        setTender(res.data.tender);
        setWorkProgress(res.data.work_progress);
        setVerifications(res.data.verifications);
        setInspections(res.data.inspections);
        setComplaints(res.data.corruption_complaints);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const submitComplaint = async () => {
    if (!complaintForm.description.trim()) return;
    setSubmittingComplaint(true);
    try {
      await axios.post(`/api/corruption/${id}`, {
        complaint_type: complaintForm.type,
        description: complaintForm.description,
        complainant_name: complaintForm.name || 'Anonymous',
        tender_id: tender?.id,
      });
      await fetchData();
      setShowComplaintModal(false);
      setComplaintForm({ type: 'poor_quality', description: '', name: '' });
    } catch (err) { console.error(err); }
    finally { setSubmittingComplaint(false); }
  };

  const issueEmoji = (type: string) => ({ pothole: '🕳️', garbage_dump: '🗑️', broken_streetlight: '💡', waterlogging: '💧', sewage_overflow: '🚽', fallen_tree: '🌳', road_crack: '⚡', other: '⚠️' }[type] || '⚠️');
  const severityColor = (s: string) => s === 'high' ? 'text-red-400' : s === 'medium' ? 'text-yellow-400' : 'text-green-400';
  const severityBg = (s: string) => s === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' : s === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-green-500/10 border-green-500/20 text-green-400';
  const statusBg = (s: string) => ({ open: 'bg-red-500/10 border-red-500/20 text-red-400', assigned: 'bg-blue-500/10 border-blue-500/20 text-blue-400', in_progress: 'bg-violet-500/10 border-violet-500/20 text-violet-400', fixed: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', verified: 'bg-green-500/10 border-green-500/20 text-green-400', awarded: 'bg-blue-500/10 border-blue-500/20 text-blue-400', completed: 'bg-green-500/10 border-green-500/20 text-green-400', on_hold: 'bg-orange-500/10 border-orange-500/20 text-orange-400' }[s] || 'bg-secondary text-muted-foreground border-border');

  const getTimelineStep = () => {
    if (!issue) return 0;
    if (issue.status === 'verified') return 5;
    if (issue.status === 'fixed') return 4;
    if (tender?.status === 'in_progress') return 3;
    if (tender) return 2;
    return 1;
  };

  const currentStep = getTimelineStep();
  const timelineSteps = [
    { label: 'Reported', icon: '📋', desc: issue ? new Date(issue.created_at).toLocaleDateString('en-IN') : '' },
    { label: 'AI Validated', icon: '🤖', desc: `${((issue?.confidence || 0) * 100).toFixed(0)}% confidence` },
    { label: 'Tender Issued', icon: '📄', desc: tender ? tender.tender_number : 'Pending' },
    { label: 'Work In Progress', icon: '🔧', desc: tender?.status === 'in_progress' ? `${issue?.progress_percentage || 0}% done` : 'Pending' },
    { label: 'Verified', icon: '✅', desc: issue?.verified_at ? new Date(issue.verified_at).toLocaleDateString('en-IN') : 'Pending' },
  ];

  if (loading) return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-violet-500 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading issue details...</p>
      </div>
    </main>
  );

  if (!issue) return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Issue Not Found</h2>
        <p className="text-muted-foreground mb-6">This issue may not exist.</p>
        <Link href={isBBMP ? '/dashboard' : '/citizen'} className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-3 rounded-xl">Back to Dashboard</Link>
      </div>
    </main>
  );

  const ticketId = issue.ticket_number || `NMG-${issue.id.slice(0, 8).toUpperCase()}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href={isBBMP ? '/dashboard' : '/citizen'} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeftIcon className="w-4 h-4" /> Back
            </Link>
            <div className="w-px h-4 bg-border" />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
                <MapPinIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-violet-500 to-blue-400 bg-clip-text text-transparent">NammaMarg</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/map" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <MapIcon className="w-3.5 h-3.5" /> Map
            </Link>
            <button onClick={() => signOut({ redirectUrl: '/' })} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors">
              <LogOutIcon className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Issue Hero */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                {issueEmoji(issue.issue_type)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">{ticketId}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${severityBg(issue.severity)}`}>{issue.severity.toUpperCase()} SEVERITY</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBg(issue.status)}`}>{issue.status.toUpperCase().replace('_', ' ')}</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground capitalize">{issue.issue_type.replace(/_/g, ' ')}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><MapPinIcon className="w-3.5 h-3.5 text-violet-400" />{issue.ward_name} (Ward {issue.ward_number})</span>
                  <span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5" />{new Date(issue.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" />{issue.reporter_name || 'Anonymous'}</span>
                  {issue.reported_count > 1 && <span className="text-violet-400">👥 {issue.reported_count} citizens reported this</span>}
                </div>
              </div>
            </div>
            {issue.status === 'fixed' && (
              <Link href={`/verify/${issue.id}`} className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all whitespace-nowrap">
                ✅ Verify Fix
              </Link>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Issue Lifecycle</p>
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
            <div className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-violet-600 to-blue-600 transition-all" style={{ width: `${Math.min(100, (currentStep / (timelineSteps.length - 1)) * 100)}%`, right: 'auto' }} />
            {timelineSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center relative z-10 flex-1 px-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm mb-2 border-2 transition-all ${i < currentStep ? 'bg-gradient-to-br from-violet-600 to-blue-600 border-transparent text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' : i === currentStep ? 'bg-card border-violet-500 text-violet-400' : 'bg-card border-border text-muted-foreground'}`}>
                  {i < currentStep ? '✓' : step.icon}
                </div>
                <div className={`text-xs font-semibold text-center ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                <div className="text-xs text-muted-foreground text-center mt-0.5 hidden sm:block truncate max-w-20">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'overview', label: '📋 Overview' },
            { key: 'tender', label: `📄 Tender${tender ? ' ✓' : ''}` },
            { key: 'progress', label: `🔧 Work (${workProgress.length})` },
            { key: 'verifications', label: `✅ Verifications (${verifications.length})` },
            { key: 'inspection', label: `🔍 Inspection${inspections.length > 0 ? ` (${inspections.length})` : ''}` },
            { key: 'complaints', label: `⚠️ Complaints (${complaints.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Photos */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Issue Photos</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  {[
                    { label: 'Before — Issue Photo', url: issue.photo_url },
                    { label: 'After — Fix Photo', url: issue.fixed_photo_url, placeholder: 'Photo will appear once the fix is submitted' },
                  ].map(({ label, url, placeholder }) => (
                    <div key={label}>
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">{label}</div>
                      <div className="bg-secondary rounded-lg overflow-hidden h-52 flex items-center justify-center">
                        {url ? <img src={url} alt={label} className="w-full h-full object-cover" /> : <p className="text-muted-foreground text-xs text-center px-4">{placeholder || 'No photo'}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-card rounded-xl border border-violet-500/20 overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <span className="text-violet-400 text-lg">🤖</span>
                  <h3 className="font-semibold text-foreground">AI Classification Analysis</h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'AI Confidence', value: `${((issue.confidence || 0) * 100).toFixed(0)}%`, color: 'text-violet-400' },
                      { label: 'Severity Score', value: `${issue.severity_score}/10`, color: severityColor(issue.severity) },
                      { label: 'Urgency Score', value: `${issue.urgency_score || 5}/10`, color: 'text-blue-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-secondary rounded-xl p-4 text-center">
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{issue.description}</p>
                  {issue.estimated_cost && (
                    <div className="mt-4 flex items-center gap-2 text-sm bg-secondary rounded-lg px-3 py-2">
                      <span className="text-muted-foreground">Estimated Repair Cost:</span>
                      <span className="text-foreground font-semibold">₹{issue.estimated_cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Issue details */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">Issue Details</h3></div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'Issue ID', value: ticketId },
                    { label: 'Issue Type', value: issue.issue_type.replace(/_/g, ' ') },
                    { label: 'Ward', value: `${issue.ward_name} (Ward ${issue.ward_number})` },
                    { label: 'Reported By', value: issue.reporter_name || 'Anonymous' },
                    { label: 'Duplicate Reports', value: `${issue.reported_count} citizen(s)` },
                    { label: 'GPS Location', value: `${issue.latitude?.toFixed(4)}, ${issue.longitude?.toFixed(4)}` },
                    { label: 'Reported On', value: new Date(issue.created_at).toLocaleDateString('en-IN') },
                    ...(issue.fixed_at ? [{ label: 'Fixed On', value: new Date(issue.fixed_at).toLocaleDateString('en-IN') }] : []),
                    ...(issue.verified_at ? [{ label: 'Verified On', value: new Date(issue.verified_at).toLocaleDateString('en-IN') }] : []),
                    ...(issue.contractor_assigned ? [{ label: 'Contractor', value: issue.contractor_assigned }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-medium capitalize text-right max-w-[55%] truncate" title={value}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification progress */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">Citizen Verifications</h3></div>
                <div className="p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-violet-400">{issue.verification_count || 0}/{issue.verification_needed || 2} verified</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, ((issue.verification_count || 0) / (issue.verification_needed || 2)) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{issue.status === 'verified' ? '✅ Fully verified by citizens' : issue.status === 'fixed' ? `Need ${(issue.verification_needed || 2) - (issue.verification_count || 0)} more to close` : 'Waiting for fix submission'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="font-semibold text-foreground">Actions</h3></div>
                <div className="p-4 space-y-2">
                  {issue.status === 'fixed' && (
                    <Link href={`/verify/${issue.id}`} className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-center block shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                      ✅ Verify Fix
                    </Link>
                  )}
                  <a href={`https://maps.google.com/?q=${issue.latitude},${issue.longitude}`} target="_blank" rel="noopener noreferrer"
                    className="w-full bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-center block">
                    📍 Open in Google Maps
                  </a>
                  <button onClick={() => setShowComplaintModal(true)}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    ⚠️ Report Corruption
                  </button>
                  <Link href="/map" className="w-full bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-center block">
                    🗺️ View on Map
                  </Link>
                </div>
              </div>

              {complaints.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="text-red-400 font-medium text-sm">⚠️ {complaints.length} Corruption Report{complaints.length > 1 ? 's' : ''}</div>
                  <p className="text-red-400/70 text-xs mt-1">This issue has been flagged</p>
                  <button onClick={() => setActiveTab('complaints')} className="text-red-400 text-xs mt-2 hover:text-red-300 underline">View complaints →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TENDER TAB ── */}
        {activeTab === 'tender' && (
          tender ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tender info */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center gap-2">
                    <span>📄</span><h3 className="font-semibold text-foreground">Tender Details</h3>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border font-semibold ${statusBg(tender.status)}`}>{tender.status.toUpperCase().replace('_', ' ')}</span>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { label: 'Tender Number', value: tender.tender_number },
                      { label: 'Estimated Cost', value: `₹${tender.estimated_cost?.toLocaleString() || 'TBD'}` },
                      { label: 'Awarded Amount', value: tender.awarded_amount ? `₹${tender.awarded_amount.toLocaleString()}` : 'Pending' },
                      { label: 'Duration', value: `${tender.estimated_days || '?'} days` },
                      { label: 'Start Date', value: tender.start_date ? new Date(tender.start_date).toLocaleDateString('en-IN') : 'TBD' },
                      { label: 'Expected Completion', value: tender.expected_completion ? new Date(tender.expected_completion).toLocaleDateString('en-IN') : 'TBD' },
                      ...(tender.actual_completion ? [{ label: 'Actual Completion', value: new Date(tender.actual_completion).toLocaleDateString('en-IN') }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span><span className="text-foreground font-medium">{value}</span>
                      </div>
                    ))}
                    {tender.description && <p className="text-muted-foreground text-sm pt-3 border-t border-border">{tender.description}</p>}
                  </div>
                </div>
                {/* Contractor */}
                {tender.contractors && (
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center gap-2">
                      <span>👷</span><h3 className="font-semibold text-foreground">Assigned Contractor</h3>
                      {tender.contractors.is_blacklisted && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-semibold">BLACKLISTED</span>}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center text-2xl">👷</div>
                        <div>
                          <div className="font-semibold text-foreground">{tender.contractors.name}</div>
                          <div className="text-muted-foreground text-sm">{tender.contractors.company}</div>
                          <div className="text-violet-400 text-xs mt-1">{tender.contractors.phone}</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">AI Reliability Score</span>
                            <span className={`font-bold ${tender.contractors.reliability_score >= 8 ? 'text-green-400' : tender.contractors.reliability_score >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>{tender.contractors.reliability_score}/10</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div className={`h-2 rounded-full ${tender.contractors.reliability_score >= 8 ? 'bg-green-500' : tender.contractors.reliability_score >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${tender.contractors.reliability_score * 10}%` }} />
                          </div>
                        </div>
                        {[
                          { label: 'Completed Projects', value: tender.contractors.completed_projects },
                          { label: 'Avg Quality Score', value: `${tender.contractors.average_quality_score}/10` },
                          { label: 'Corruption Complaints', value: tender.contractors.corruption_complaints_count || 0, danger: (tender.contractors.corruption_complaints_count || 0) > 2 },
                        ].map(({ label, value, danger }) => (
                          <div key={label} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className={`font-medium ${danger ? 'text-red-400' : 'text-foreground'}`}>{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tender.contractors.specializations?.map((s: string) => (
                          <span key={s} className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full capitalize">{s.replace('_', ' ')}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Payment */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-2"><span>💰</span><h3 className="font-semibold text-foreground">Payment & Accountability</h3></div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      { label: 'Total Approved', value: `₹${(tender.awarded_amount || 0).toLocaleString()}`, color: 'text-foreground' },
                      { label: 'Amount Released', value: `₹${(tender.released_amount || 0).toLocaleString()}`, color: 'text-green-400' },
                      { label: 'Pending Release', value: `₹${((tender.awarded_amount || 0) - (tender.released_amount || 0)).toLocaleString()}`, color: 'text-yellow-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-secondary rounded-xl p-4 text-center">
                        <div className={`text-xl font-bold ${color}`}>{value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground">
                    💡 Payment released only after: AI verification passed + Inspector approval + Citizen feedback threshold met
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-16 text-center">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Tender Assigned Yet</h3>
              <p className="text-muted-foreground text-sm">{isBBMP ? 'Assign a tender from the dashboard.' : 'BBMP will assign a tender once the issue is reviewed.'}</p>
              {isBBMP && <Link href="/dashboard" className="mt-4 inline-block bg-gradient-to-r from-violet-600 to-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium">Go to Dashboard →</Link>}
            </div>
          )
        )}

        {/* ── WORK PROGRESS TAB ── */}
        {activeTab === 'progress' && (
          workProgress.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-16 text-center">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Work Updates Yet</h3>
              <p className="text-muted-foreground text-sm">The contractor hasn&apos;t uploaded progress updates yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workProgress.map((update, i) => (
                <div key={update.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                      <div>
                        <div className="text-sm font-semibold text-foreground capitalize">{update.update_type.replace('_', ' ')} Update</div>
                        <div className="text-xs text-muted-foreground">{new Date(update.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-violet-400">{update.progress_percentage}%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="w-full bg-secondary rounded-full h-2 mb-3">
                      <div className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full" style={{ width: `${update.progress_percentage}%` }} />
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{update.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {update.workers_count && <span className="text-foreground/70">👷 {update.workers_count} workers</span>}
                      {update.materials_used && <span className="text-foreground/70">🧱 {update.materials_used}</span>}
                      {update.uploaded_by && <span className="text-foreground/70">By: {update.uploaded_by}</span>}
                    </div>
                    {update.photo_url && <img src={update.photo_url} alt="Progress" className="mt-3 rounded-lg h-48 w-full object-cover" />}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── VERIFICATIONS TAB ── */}
        {activeTab === 'verifications' && (
          verifications.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-16 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Verifications Yet</h3>
              <p className="text-muted-foreground text-sm">{issue.status === 'fixed' ? 'Citizens can now verify if this issue has been properly fixed.' : 'Issue must be marked as fixed before citizen verification.'}</p>
              {issue.status === 'fixed' && <Link href={`/verify/${issue.id}`} className="mt-4 inline-block bg-gradient-to-r from-violet-600 to-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium">Be the first to verify →</Link>}
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((v) => (
                <div key={v.id} className={`bg-card rounded-xl border overflow-hidden ${v.ai_verified ? 'border-green-500/20' : 'border-red-500/20'}`}>
                  <div className={`p-4 border-b flex items-center justify-between ${v.ai_verified ? 'border-green-500/10 bg-green-500/5' : 'border-red-500/10 bg-red-500/5'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${v.ai_verified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{v.ai_verified ? '✓' : '✗'}</div>
                      <div>
                        <div className="font-medium text-foreground">{v.verifier_name || 'Anonymous'}</div>
                        <div className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${v.ai_verified ? 'text-green-400' : 'text-red-400'}`}>{v.ai_verified ? '✅ Fix Confirmed' : '❌ Fix Rejected'}</div>
                      <div className="text-xs text-muted-foreground">AI: {((v.ai_confidence || 0) * 100).toFixed(0)}% confidence</div>
                    </div>
                  </div>
                  {(v.ai_reason || v.photo_url) && (
                    <div className="p-4">
                      {v.ai_reason && <p className="text-muted-foreground text-sm mb-3">{v.ai_reason}</p>}
                      {v.photo_url && <img src={v.photo_url} alt="Verification" className="rounded-lg h-40 object-cover" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ── INSPECTION TAB ── */}
        {activeTab === 'inspection' && (
          inspections.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Inspections Yet</h3>
              <p className="text-muted-foreground text-sm">Government quality inspection hasn&apos;t been conducted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspections.map((inspection) => (
                <div key={inspection.id} className={`bg-card rounded-xl border overflow-hidden ${inspection.status === 'approved' ? 'border-green-500/20' : inspection.status === 'rejected' ? 'border-red-500/20' : 'border-border'}`}>
                  <div className="p-5 border-b border-border flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center text-2xl">🔍</div>
                      <div>
                        <div className="font-semibold text-foreground">{inspection.inspector_name}</div>
                        <div className="text-muted-foreground text-sm">{inspection.department}</div>
                        <div className="text-muted-foreground text-xs">{inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString('en-IN') : 'Date TBD'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${inspection.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : inspection.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>{inspection.status.toUpperCase().replace('_', ' ')}</span>
                      {inspection.quality_score && <div className="text-2xl font-bold text-foreground mt-2">{inspection.quality_score}<span className="text-sm text-muted-foreground">/10</span></div>}
                    </div>
                  </div>
                  {inspection.remarks && (
                    <div className="p-5">
                      <p className="text-muted-foreground text-sm">{inspection.remarks}</p>
                      {inspection.ai_verified !== null && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <span className="text-violet-400">🤖 AI Verification:</span>
                          <span className={inspection.ai_verified ? 'text-green-400' : 'text-red-400'}>{inspection.ai_verified ? 'Passed' : 'Failed'} ({((inspection.ai_confidence || 0) * 100).toFixed(0)}% confidence)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ── COMPLAINTS TAB ── */}
        {activeTab === 'complaints' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Corruption &amp; Quality Complaints</h3>
              <button onClick={() => setShowComplaintModal(true)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">+ File Complaint</button>
            </div>
            {complaints.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-16 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Complaints Filed</h3>
                <p className="text-muted-foreground text-sm">No corruption or quality complaints have been filed for this issue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="bg-card rounded-xl border border-red-500/20 overflow-hidden">
                    <div className="p-4 bg-red-500/5 border-b border-red-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>⚠️</span><span className="text-sm font-semibold text-red-400 capitalize">{complaint.complaint_type?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${complaint.status === 'investigating' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : complaint.status === 'resolved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{complaint.status.toUpperCase()}</span>
                        <span className="text-xs text-muted-foreground">{new Date(complaint.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-muted-foreground text-sm">{complaint.description}</p>
                      <div className="text-xs text-muted-foreground mt-2">Filed by: {complaint.complainant_name || 'Anonymous'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-foreground mb-1">File Corruption Complaint</h3>
            <p className="text-muted-foreground text-sm mb-6">Report fake completion, poor quality, or bribery</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Complaint Type</label>
                <select value={complaintForm.type} onChange={(e) => setComplaintForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50">
                  {[['fake_completion', 'Fake Completion'], ['poor_quality', 'Poor Work Quality'], ['material_mismatch', 'Material Mismatch'], ['bribery', 'Bribery / Corruption'], ['delayed_work', 'Deliberate Work Delay'], ['overcharging', 'Overcharging'], ['other', 'Other']].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Description *</label>
                <textarea placeholder="Describe the issue in detail..." value={complaintForm.description} onChange={(e) => setComplaintForm(p => ({ ...p, description: e.target.value }))} rows={4}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-violet-500/50 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Your Name (optional)</label>
                <input type="text" placeholder="Anonymous" value={complaintForm.name} onChange={(e) => setComplaintForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-violet-500/50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowComplaintModal(false)} className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-3 rounded-xl font-medium transition-colors">Cancel</button>
                <button onClick={submitComplaint} disabled={!complaintForm.description.trim() || submittingComplaint}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-secondary disabled:text-muted-foreground text-white px-4 py-3 rounded-xl font-medium transition-colors">
                  {submittingComplaint ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
