'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ReportPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.email === 'bbmp@wardwise.com') {
      router.push('/dashboard');
    }
  };

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

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm({
          ...form,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationDetected(true);
        setDetectingLocation(false);
      },
      () => {
        alert('Could not get location. Please enter manually.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setClassification(null);

    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const base64Reader = new FileReader();
      base64Reader.onload = async (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classify`,
          { image: base64, mimeType: file.type }
        );
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
    if (!classification || !imageFile) return;
    setSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/issues`, {
        ...classification,
        ...form,
        photo_url: image,
      });
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
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold mb-4">Issue Reported!</h2>
          <p className="text-gray-400 mb-8">Your report has been submitted and officials have been notified.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/report"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition"
              onClick={() => { setSubmitted(false); setImage(null); setClassification(null); setLocationDetected(false); }}>
              Report Another
            </Link>
            <Link href="/map" className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition">
              View on Map
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-blue-400">WardWise</h1>
          </Link>
          <div className="flex items-center gap-4">
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

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">Report a Civic Issue</h2>
        <p className="text-gray-400 mb-8">Upload a photo and our AI will automatically classify it.</p>

        <div className="grid grid-cols-2 gap-8">
          {/* Left - Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Upload Photo *
            </label>
            <label className="border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition min-h-64 block">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              ) : (
                <>
                  <div className="text-5xl mb-4">📷</div>
                  <div className="text-gray-400 text-center">Click to upload a photo of the civic issue</div>
                  <div className="text-gray-600 text-sm mt-2">JPG, PNG supported</div>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            {loading && (
              <div className="mt-4 bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="animate-spin text-2xl">⏳</div>
                  <span className="text-gray-400">AI is analyzing your image...</span>
                </div>
              </div>
            )}

            {classification && !loading && (
              <div className="mt-4 bg-gray-900 rounded-xl p-4 border border-blue-800">
                <div className="text-sm font-medium text-blue-400 mb-3">✨ AI Classification Result</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issue Type</span>
                    <span className="font-semibold capitalize">{classification.issue_type?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Severity</span>
                    <span className={`font-semibold capitalize ${severityColor(classification.severity)}`}>
                      {classification.severity} ({classification.severity_score}/10)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence</span>
                    <span className="font-semibold">{((classification.confidence || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-2 text-gray-400 text-sm">{classification.description}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right - Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={form.reporter_name}
                onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Ward</label>
              <select
                value={form.ward_number}
                onChange={(e) => {
                  const ward = wards.find(w => w.number === parseInt(e.target.value));
                  setForm({ ...form, ward_number: parseInt(e.target.value), ward_name: ward?.name || '' });
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                {wards.map(w => (
                  <option key={w.number} value={w.number}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
              <button
                type="button"
                onClick={getLocation}
                disabled={detectingLocation}
                className={`w-full border px-4 py-3 rounded-xl text-left transition flex items-center gap-3 ${
                  locationDetected
                    ? 'bg-green-900 border-green-600'
                    : 'bg-gray-900 border-gray-700 hover:border-blue-500'
                }`}
              >
                <span className="text-2xl">
                  {detectingLocation ? '⏳' : locationDetected ? '✅' : '📍'}
                </span>
                <div>
                  <div className="text-white text-sm font-medium">
                    {detectingLocation ? 'Detecting location...' : locationDetected ? 'Location Detected!' : 'Detect My Location'}
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">Latitude</label>
                  <input
                    type="number"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Longitude</label>
                  <input
                    type="number"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!classification || submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-semibold text-lg transition mt-4"
            >
              {submitting ? 'Submitting...' : !classification ? 'Upload a photo first' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}