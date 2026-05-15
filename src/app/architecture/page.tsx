'use client';

import Link from 'next/link';
import { MapPinIcon } from 'lucide-react';

const layers = [
  {
    number: 1,
    title: 'Citizen Interaction Layer',
    color: 'from-violet-600 to-purple-600',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/5',
    icon: '📱',
    steps: [
      { label: 'Citizen opens mobile app', type: 'process', icon: '👤' },
      { label: 'Capture civic issue image / video', type: 'process', icon: '📷' },
      { label: 'GPS location auto-captured', type: 'process', icon: '📍' },
      { label: 'Optional: voice / text description', type: 'process', icon: '🎙️' },
      { label: 'Citizen submits complaint', type: 'action', icon: '📤' },
    ],
    features: ['Multilingual (Kannada + English)', 'Live map view', 'Issue tracking dashboard', 'Public transparency portal'],
  },
  {
    number: 2,
    title: 'AI Validation & Detection Layer',
    color: 'from-blue-600 to-cyan-600',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    icon: '🤖',
    steps: [
      { label: 'Image authenticity check (spam / fake / duplicate hash)', type: 'process', icon: '🔍' },
      { label: 'Gemini AI object detection & classification', type: 'ai', icon: '🧠' },
      { label: 'Classify: pothole / garbage / waterlogging / fallen tree / sewage / road crack', type: 'process', icon: '🏷️' },
      { label: 'Generate confidence score + severity (Low / Medium / High)', type: 'process', icon: '📊' },
      { label: 'PostGIS geospatial duplicate detection (10m radius)', type: 'process', icon: '🗺️' },
    ],
    decision: {
      label: 'Duplicate or Fake?',
      yes: 'Merge report → increase confirmation count → update citizen trust score',
      no: 'Generate unique civic ticket → assign Issue ID (NMG-XXXXXXXX)',
    },
  },
  {
    number: 3,
    title: 'Smart Prioritization Engine',
    color: 'from-indigo-600 to-blue-600',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/5',
    icon: '⚡',
    steps: [
      { label: 'AI prioritizes issues based on severity, traffic density, school/hospital proximity', type: 'ai', icon: '🧠' },
      { label: 'Factor: flood-prone zones + accident risk + citizen confirmations', type: 'process', icon: '📈' },
      { label: 'Ward-level complaint density analysis', type: 'process', icon: '📊' },
    ],
    outputs: ['Urgency Score (1–10)', 'Estimated repair cost (₹)', 'Estimated repair time (days)', 'Material estimation'],
  },
  {
    number: 4,
    title: 'BBMP Authority Dashboard',
    color: 'from-emerald-600 to-teal-600',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    icon: '🏛️',
    steps: [
      { label: 'BBMP officials receive issue dashboard', type: 'process', icon: '📋' },
      { label: 'Ward officer reviews issue with photos, map, severity', type: 'process', icon: '👨‍💼' },
      { label: 'Approve issue for tender + assign contractor', type: 'action', icon: '✅' },
    ],
    features: ['Live map location', 'Severity rating', 'Duplicate report count', 'Repair history', 'Estimated budget'],
  },
  {
    number: 5,
    title: 'Tender & Contract Management',
    color: 'from-amber-600 to-orange-600',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    icon: '📄',
    steps: [
      { label: 'Create public tender notice with TNR-XXXXXXXX ID', type: 'process', icon: '📝' },
      { label: 'Contractors apply for tender', type: 'process', icon: '👷' },
      { label: 'AI contractor reliability score evaluated', type: 'ai', icon: '🧠' },
    ],
    decision: {
      label: 'Is contractor blacklisted?',
      yes: 'Reject tender participation',
      no: 'Approve contractor → BBMP selects and awards tender',
    },
    features: ['Contractor name & company', 'Tender amount', 'Project duration', 'Start & completion dates', 'Previous project ratings', 'Corruption complaint history'],
  },
  {
    number: 6,
    title: 'Work Execution & Live Tracking',
    color: 'from-orange-600 to-red-600',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    icon: '🔧',
    steps: [
      { label: 'Approved contractor receives work order', type: 'process', icon: '📋' },
      { label: 'Repair team dispatched to site', type: 'process', icon: '🚛' },
      { label: 'Live progress updates uploaded by contractor', type: 'process', icon: '📤' },
    ],
    features: ['Before / during / after photos', 'Geo-tagged proof', 'Timestamps', 'Materials used', 'Worker attendance', 'Daily progress %'],
    citizen: 'Citizens can track live repair status, comment on quality, upload feedback images',
  },
  {
    number: 7,
    title: 'Quality Inspection & Anti-Corruption System',
    color: 'from-red-600 to-pink-600',
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    icon: '🔍',
    steps: [
      { label: 'Government inspection officer visits site', type: 'process', icon: '👮' },
      { label: 'Inspector uploads photos, report, digital signature', type: 'process', icon: '📄' },
      { label: 'AI quality verification: before vs after comparison', type: 'ai', icon: '🧠' },
    ],
    decision: {
      label: 'Repair properly completed?',
      yes: 'Proceed to payment + close issue',
      no: 'Hold contractor payment → reopen issue → notify higher authority → create public corruption flag',
    },
    antiCorruption: 'Repeated complaints → contractor blacklisted → future tender restriction → authority investigation triggered',
  },
  {
    number: 8,
    title: 'Payment & Accountability System',
    color: 'from-pink-600 to-rose-600',
    border: 'border-pink-500/30',
    bg: 'bg-pink-500/5',
    icon: '💰',
    conditions: ['✅ AI verification passed', '✅ Inspector approval obtained', '✅ Citizen feedback threshold met'],
    decision: {
      label: 'All conditions met?',
      yes: 'Release contractor payment',
      no: 'Payment on hold → reinspection required',
    },
    features: ['Approved amount', 'Released amount', 'Pending payment', 'Project completion %'],
  },
  {
    number: 9,
    title: 'Analytics & Smart City Intelligence',
    color: 'from-violet-600 to-indigo-600',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/5',
    icon: '📊',
    analytics: ['Ward-wise issue heatmaps', 'Most damaged roads', 'Flood-prone area mapping', 'Contractor performance ranking', 'Corruption hotspot analysis', 'Repair efficiency metrics', 'Average repair time'],
    predictive: ['Predicts future potholes using ML patterns', 'Predicts flood-risk roads before monsoon', 'Recommends preventive maintenance schedules'],
  },
  {
    number: 10,
    title: 'Public Transparency Portal',
    color: 'from-teal-600 to-green-600',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/5',
    icon: '🌐',
    features: ['Issue status & repair progress', 'Contractor details & tender amount', 'Completion reports & inspector details', 'Approval documents & quality reports', 'Corruption complaints & resolutions', 'Ward performance rankings'],
    goal: 'Corruption-resistant, AI-powered civic governance ecosystem improving transparency, accountability, and citizen trust in Bengaluru',
  },
];

function Arrow() {
  return (
    <div className="flex justify-center my-2">
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500/60 to-blue-500/60" />
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-violet-400/60" />
      </div>
    </div>
  );
}

function Diamond({ label, yes, no }: { label: string; yes: string; no: string }) {
  return (
    <div className="flex flex-col items-center my-4">
      <div className="relative">
        <div className="w-40 h-10 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/40 rotate-0 flex items-center justify-center rounded-lg px-3 py-2 text-center" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-violet-300 text-center leading-tight px-2 w-36">{label}</span>
        </div>
      </div>
      <div className="flex gap-8 mt-1">
        <div className="flex flex-col items-center">
          <div className="text-xs text-red-400 font-medium">YES</div>
          <div className="text-xs text-muted-foreground bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 max-w-48 text-center mt-1">{yes}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs text-green-400 font-medium">NO</div>
          <div className="text-xs text-muted-foreground bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 max-w-48 text-center mt-1">{no}</div>
        </div>
      </div>
    </div>
  );
}

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.5)]">
              <MapPinIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-500 to-blue-400 bg-clip-text text-transparent">NammaMarg</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/citizen" className="text-sm px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">Dashboard</Link>
            <Link href="/map" className="text-sm px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">Map</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-sm font-medium mb-6">
            🏗️ System Architecture
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI-Powered Civic Governance
            <span className="block bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Architecture Diagram</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            End-to-end workflow for transparent, corruption-resistant civic infrastructure management in Bengaluru
          </p>
          <div className="flex justify-center gap-6 mt-6 text-xs text-muted-foreground flex-wrap">
            {[['bg-violet-500/20 border-violet-500/30 text-violet-400', 'Process Step'], ['bg-blue-500/20 border-blue-500/30 text-blue-400', 'AI Engine'], ['bg-green-500/20 border-green-500/30 text-green-400', 'Action/Output'], ['border-violet-500/40 text-violet-300', '◆ Decision Node']].map(([cls, label]) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded border text-xs ${cls}`}>{label.split(' ')[0]}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Layers */}
        <div className="space-y-3">
          {layers.map((layer, li) => (
            <div key={layer.number}>
              <div className={`rounded-2xl border ${layer.border} ${layer.bg} overflow-hidden`}>
                {/* Layer header */}
                <div className={`bg-gradient-to-r ${layer.color} px-6 py-3 flex items-center gap-3`}>
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">{layer.number}</div>
                  <span className="text-lg">{layer.icon}</span>
                  <span className="text-white font-bold text-base">{layer.title}</span>
                </div>

                <div className="p-5">
                  {/* Process steps */}
                  {layer.steps && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {layer.steps.map((step, si) => (
                        <div key={si} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${step.type === 'ai' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : step.type === 'action' ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-secondary border-border text-foreground/80'}`}>
                          <span>{step.icon}</span>
                          <span>{step.label}</span>
                          {si < layer.steps!.length - 1 && <span className="text-muted-foreground ml-1">→</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conditions */}
                  {layer.conditions && (
                    <div className="mb-4">
                      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-2">Payment Conditions</p>
                      <div className="flex flex-wrap gap-2">
                        {layer.conditions.map((c, ci) => (
                          <span key={ci} className="text-sm bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-xl">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decision node */}
                  {layer.decision && (
                    <div className="bg-background/50 rounded-xl p-4 border border-border mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-violet-600 to-blue-600 rotate-45 rounded-sm flex-shrink-0" />
                        <span className="font-semibold text-violet-300 text-sm">Decision: {layer.decision.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                          <div className="text-xs font-bold text-red-400 mb-1">IF YES →</div>
                          <div className="text-xs text-muted-foreground">{layer.decision.yes}</div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                          <div className="text-xs font-bold text-green-400 mb-1">IF NO →</div>
                          <div className="text-xs text-muted-foreground">{layer.decision.no}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features / outputs */}
                  {layer.features && (
                    <div className="mb-3">
                      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-2">{layer.number === 10 ? 'Public Portal Displays' : 'Features'}</p>
                      <div className="flex flex-wrap gap-2">
                        {layer.features.map((f, fi) => (
                          <span key={fi} className="text-xs bg-secondary border border-border text-foreground/70 px-2.5 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outputs */}
                  {layer.outputs && (
                    <div className="mb-3">
                      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-2">Generated Outputs</p>
                      <div className="flex flex-wrap gap-2">
                        {layer.outputs.map((o, oi) => (
                          <span key={oi} className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2.5 py-1 rounded-full">{o}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analytics */}
                  {layer.analytics && (
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-2">Analytics Dashboard</p>
                        <div className="space-y-1">
                          {layer.analytics.map((a, ai) => (
                            <div key={ai} className="flex items-center gap-2 text-xs text-foreground/70"><span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />{a}</div>
                          ))}
                        </div>
                      </div>
                      {layer.predictive && (
                        <div>
                          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-2">🔮 Predictive AI</p>
                          <div className="space-y-1">
                            {layer.predictive.map((p, pi) => (
                              <div key={pi} className="flex items-center gap-2 text-xs text-blue-400"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />{p}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Anti-corruption note */}
                  {layer.antiCorruption && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 mt-3">
                      🚨 <span className="font-semibold">Anti-Corruption:</span> {layer.antiCorruption}
                    </div>
                  )}

                  {/* Citizen note */}
                  {layer.citizen && (
                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-400 mt-3">
                      👥 <span className="font-semibold">Citizen Participation:</span> {layer.citizen}
                    </div>
                  )}

                  {/* Goal */}
                  {layer.goal && (
                    <div className="bg-gradient-to-r from-violet-600/10 to-blue-600/10 border border-violet-500/20 rounded-xl p-4 mt-3">
                      <p className="text-xs font-bold text-violet-300 mb-1">🎯 Platform Goal</p>
                      <p className="text-sm text-muted-foreground">{layer.goal}</p>
                    </div>
                  )}
                </div>
              </div>

              {li < layers.length - 1 && <Arrow />}
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="mt-12 bg-card rounded-2xl border border-border p-6">
          <h3 className="font-bold text-foreground text-lg mb-4">🛠️ Technology Stack</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Frontend', items: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS'] },
              { label: 'AI / ML', items: ['Google Gemini 2.5', 'Image Classification', 'Before/After Comparison', 'Confidence Scoring'] },
              { label: 'Backend / DB', items: ['Supabase (PostgreSQL)', 'PostGIS (Geo queries)', 'Next.js API Routes', 'Clerk Auth'] },
              { label: 'Infrastructure', items: ['Vercel (hosting)', 'Supabase (BaaS)', 'GPS / Geolocation API', 'RESTful APIs'] },
            ].map(({ label, items }) => (
              <div key={label} className="bg-secondary rounded-xl p-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">{label}</div>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/report" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">📷 Report an Issue</Link>
            <Link href="/map" className="bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-xl font-medium transition-colors border border-border">🗺️ View Live Map</Link>
            <Link href="/wards" className="bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-xl font-medium transition-colors border border-border">🏆 Ward Rankings</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
