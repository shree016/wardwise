'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-context';
import { UploadIcon, LocateIcon } from 'lucide-react';

const wards = [
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

export default function ReportPage() {
  const [image, setImage] = useState<string | null>(null);
  const [classification, setClassification] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [form, setForm] = useState({
    reporter_name: '',
    ward_name: 'Koramangala',
    ward_number: 1,
    latitude: 12.9352,
    longitude: 77.6245,
  });

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const email = user?.email || '';
    // Redirect BBMP officials to their dashboard
    if (email === 'bbmp@wardwise.com') { router.push('/dashboard'); return; }
    // Pre-fill reporter name from account if available
    if (user?.user_metadata?.full_name) {
      setForm(prev => ({ ...prev, reporter_name: user.user_metadata.full_name }));
    }
  }, [authLoading, user, router]);

  const getLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({ ...prev, latitude: position.coords.latitude, longitude: position.coords.longitude }));
        setLocationDetected(true);
        setDetectingLocation(false);
      },
      () => { alert('Could not get location. Please enter manually.'); setDetectingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setClassification(null);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const base64Reader = new FileReader();
      base64Reader.onload = async (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        const response = await axios.post(`/api/classify`, { image: base64, mimeType: file.type });
        setClassification(response.data.classification);
      };
      base64Reader.readAsDataURL(file);
    } catch (err) {
      console.error('Classification failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!classification || !image) return;
    setSubmitting(true);
    try {
      await axios.post(`/api/issues`, { ...classification, ...form, photo_url: image });
      setSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const severityColor = (severity: string) => {
    if (severity === 'high') return 'text-red-400';
    if (severity === 'medium') return 'text-yellow-400';
    return 'text-green-400';
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-3xl mx-auto mb-6 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
            ✅
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Issue Reported!</h2>
          <p className="text-muted-foreground mb-8">Your report has been submitted and officials have been notified.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setSubmitted(false); setImage(null); setClassification(null); setLocationDetected(false); }}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              Report Another
            </button>
            <Link href="/map" className="bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-xl transition-colors border border-border">
              View on Map
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Report a Civic Issue</h2>
          <p className="text-muted-foreground mt-2">Upload a photo and our AI will automatically classify it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Upload Photo *</label>
            <label className="border-2 border-dashed border-border hover:border-violet-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-64 bg-card">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center mb-4">
                    <UploadIcon className="w-7 h-7 text-violet-400" />
                  </div>
                  <div className="text-foreground/70 text-center font-medium">Click to upload a photo</div>
                  <div className="text-muted-foreground text-sm mt-1">JPG, PNG supported</div>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            {loading && (
              <div className="mt-4 bg-card rounded-xl p-4 border border-border flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-border border-t-violet-500 animate-spin flex-shrink-0" />
                <span className="text-muted-foreground text-sm">AI is analyzing your image...</span>
              </div>
            )}

            {classification && !loading && (
              <div className="mt-4 bg-card rounded-xl p-4 border border-violet-500/20">
                <div className="text-sm font-medium text-violet-400 mb-3">✨ AI Classification Result</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issue Type</span>
                    <span className="font-semibold text-foreground capitalize">{classification.issue_type?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Severity</span>
                    <span className={`font-semibold capitalize ${severityColor(classification.severity)}`}>
                      {classification.severity} ({classification.severity_score}/10)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold text-foreground">{((classification.confidence || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-2">{classification.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={form.reporter_name}
                onChange={(e) => setForm(prev => ({ ...prev, reporter_name: e.target.value }))}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Ward</label>
              <select
                value={form.ward_number}
                onChange={(e) => {
                  const ward = wards.find(w => w.number === parseInt(e.target.value));
                  setForm(prev => ({ ...prev, ward_number: parseInt(e.target.value), ward_name: ward?.name || '' }));
                }}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
              >
                {wards.map(w => (
                  <option key={w.number} value={w.number}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
              <button
                type="button"
                onClick={getLocation}
                disabled={detectingLocation}
                className={`w-full border px-4 py-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                  locationDetected
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-card border-border hover:border-violet-500/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  locationDetected ? 'bg-green-500/20' : 'bg-gradient-to-br from-violet-600/20 to-blue-600/20'
                }`}>
                  {detectingLocation
                    ? <div className="w-4 h-4 rounded-full border-2 border-border border-t-violet-500 animate-spin" />
                    : <LocateIcon className={`w-4 h-4 ${locationDetected ? 'text-green-400' : 'text-violet-400'}`} />
                  }
                </div>
                <div>
                  <div className="text-foreground text-sm font-medium">
                    {detectingLocation ? 'Detecting location...' : locationDetected ? 'Location Detected!' : 'Detect My Location'}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {locationDetected
                      ? `${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`
                      : 'Click to use your current GPS location'}
                  </div>
                </div>
              </button>
            </div>

            {!locationDetected && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Latitude</label>
                  <input
                    type="number"
                    value={form.latitude}
                    onChange={(e) => setForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Longitude</label>
                  <input
                    type="number"
                    value={form.longitude}
                    onChange={(e) => setForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!classification || submitting}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold text-base transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] disabled:shadow-none mt-2"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Submitting...
                </span>
              ) : !classification ? 'Upload a photo first' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
