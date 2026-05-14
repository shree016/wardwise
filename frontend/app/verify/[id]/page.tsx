'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface Issue {
  id: string;
  issue_type: string;
  severity: string;
  severity_score: number;
  status: string;
  description: string;
  ward_name: string;
  photo_url: string;
  fixed_photo_url: string;
  created_at: string;
  fixed_at: string;
  latitude: number;
  longitude: number;
}

export default function VerifyPage() {
  const { id } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verifierName, setVerifierName] = useState('');
  const [verifierLocation, setVerifierLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/issues/${id}`
      );
      setIssue(res.data.issue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = () => {
    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    setOtpLoading(true);
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setTimeout(() => {
      setOtpSent(true);
      setOtpLoading(false);
      alert(`Demo Mode: Your OTP is ${mockOtp}\n(In production this would be sent via SMS)`);
    }, 1500);
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setOtpVerified(true);
    } else {
      alert('Invalid OTP. Please try again.');
      setOtp('');
    }
  };

  const getVerifierLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setVerifierLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => {
        setLocationError('Could not get location. Please enable GPS.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleVerify = async () => {
    if (!image || !issue) return;
    if (!verifierLocation) {
      alert('Please detect your location first.');
      return;
    }
    setVerifying(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify/${id}`,
        {
          after_photo: image,
          verifier_name: verifierName || 'Anonymous',
          verifier_lat: verifierLocation.lat,
          verifier_lng: verifierLocation.lng,
        }
      );
      setResult(res.data);
    } catch (err: any) {
      if (err.response?.data?.too_far) {
        alert(`❌ You are ${err.response.data.distance}m away. Must be within 500m to verify.`);
      } else {
        console.error(err);
      }
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading issue...</div>
      </main>
    );
  }

  if (!issue) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-gray-400">Issue not found</div>
          <Link href="/map" className="text-blue-400 mt-4 block">Back to Map</Link>
        </div>
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">
            {result.fully_verified ? '🎉' : result.verified ? '✅' : result.reopened ? '🔄' : '❌'}
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {result.fully_verified
              ? 'Issue Fully Verified!'
              : result.verified && !result.fully_verified
              ? 'Verification Recorded!'
              : result.reopened
              ? 'Issue Reopened!'
              : 'Fix Not Confirmed'}
          </h2>
          <p className="text-gray-400 mb-4">{result.message || result.reason}</p>

          {result.verified && !result.fully_verified && (
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-4">
              <div className="text-sm text-gray-400 mb-2">Citizen Verifications</div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${(result.verification_count / result.verification_needed) * 100}%` }}
                />
              </div>
              <div className="text-blue-400 text-sm mt-2">
                {result.verification_count}/{result.verification_needed} citizens verified
              </div>
              <div className="text-gray-500 text-xs mt-1">
                Need {result.verification_needed - result.verification_count} more citizen(s) to confirm
              </div>
            </div>
          )}

          {result.reopened && (
            <div className="bg-red-900 border border-red-700 rounded-xl p-4 mb-4">
              <div className="text-red-300 text-sm">
                Issue reopened — officials will be notified to fix it properly.
              </div>
            </div>
          )}

          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
            <div className="text-sm text-gray-400">AI Confidence</div>
            <div className="text-2xl font-bold text-blue-400">
              {((result.confidence || 0) * 100).toFixed(0)}%
            </div>
            <div className="text-gray-500 text-xs mt-1">{result.reason}</div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/citizen" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition">
              My Dashboard
            </Link>
            <Link href="/map" className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition">
              Back to Map
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
          <Link href="/"><h1 className="text-2xl font-bold text-blue-400">WardWise</h1></Link>
          <span className="text-gray-400 text-sm">Verify Fix</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2">Verify Issue Fix</h2>
        <p className="text-gray-400 mb-8">
          Complete all steps below to submit your verification.
        </p>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Phone OTP', 'Location', 'Photo', 'Submit'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                (i === 0 && otpVerified) || (i === 1 && verifierLocation) || (i === 2 && image)
                  ? 'bg-green-600'
                  : i === 0
                  ? 'bg-blue-600'
                  : 'bg-gray-700'
              }`}>
                {(i === 0 && otpVerified) || (i === 1 && verifierLocation) || (i === 2 && image)
                  ? '✓' : i + 1}
              </div>
              <span className="text-gray-400 text-xs">{step}</span>
              {i < 3 && <div className="w-8 h-px bg-gray-700" />}
            </div>
          ))}
        </div>

        {/* Issue Details */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold capitalize text-lg">
                {issue.issue_type.replace('_', ' ')}
              </h3>
              <div className="text-gray-400 text-sm mt-1">{issue.ward_name}</div>
              <div className="text-gray-400 text-sm mt-1">{issue.description}</div>
            </div>
            <div className="text-right">
              <span className="bg-yellow-600 text-white text-xs px-3 py-1 rounded-full">
                {issue.status}
              </span>
              <div className="text-gray-400 text-xs mt-2">
                Reported: {new Date(issue.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1 - OTP */}
        {!otpVerified ? (
          <div className="bg-gray-900 rounded-xl p-5 border border-blue-800 mb-6">
            <h3 className="font-semibold text-blue-400 mb-1">
              Step 1: 📱 Verify Your Identity
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Enter your phone number to receive an OTP
            </p>
            {!otpSent ? (
              <div className="flex gap-3">
                <div className="flex-1 flex items-center bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                  <span className="px-3 text-gray-400 text-sm border-r border-gray-700 py-3">+91</span>
                  <input
                    type="number"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.slice(0, 10))}
                    className="flex-1 bg-transparent py-3 px-4 text-white placeholder-gray-600 focus:outline-none"
                  />
                </div>
                <button
                  onClick={sendOtp}
                  disabled={otpLoading || phone.length !== 10}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-5 py-3 rounded-xl font-medium transition whitespace-nowrap"
                >
                  {otpLoading ? '⏳ Sending...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-green-900 border border-green-700 rounded-xl px-4 py-2 text-green-300 text-sm mb-3">
                  ✅ OTP sent to +91{phone}
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 tracking-widest text-lg"
                  />
                  <button
                    onClick={verifyOtp}
                    disabled={otp.length !== 6}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 px-5 py-3 rounded-xl font-medium transition"
                  >
                    Verify
                  </button>
                </div>
                <button
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                  className="text-gray-500 text-xs mt-2 hover:text-gray-300"
                >
                  Change number
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-green-900 border border-green-700 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
            <span className="text-2xl">✅</span>
            <div>
              <div className="text-green-300 font-medium">Step 1: Identity Verified</div>
              <div className="text-green-400 text-xs">+91{phone} confirmed</div>
            </div>
          </div>
        )}

        {/* Step 2 - Photos */}
        <div className={`mb-6 ${!otpVerified ? 'opacity-40 pointer-events-none' : ''}`}>
          <h3 className="font-semibold text-gray-300 mb-4">Step 2: 📸 Upload Photos</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-400 mb-3">Original Issue Photo</h4>
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden h-56 flex items-center justify-center">
                {issue.photo_url ? (
                  <img src={issue.photo_url} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-600">No original photo</div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-400 mb-3">After Fix Photo *</h4>
              <label className="bg-gray-900 rounded-xl border-2 border-dashed border-gray-700 hover:border-green-500 overflow-hidden h-56 flex items-center justify-center cursor-pointer transition block">
                {image ? (
                  <img src={image} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-gray-400 text-sm">Click to upload after photo</div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Step 3 - Location + Name */}
        <div className={`mb-6 ${!otpVerified ? 'opacity-40 pointer-events-none' : ''}`}>
          <h3 className="font-semibold text-gray-300 mb-4">Step 3: 📍 Confirm Your Location</h3>
          <button
            type="button"
            onClick={getVerifierLocation}
            disabled={locationLoading}
            className={`w-full border px-4 py-3 rounded-xl text-left transition flex items-center gap-3 ${
              verifierLocation
                ? 'bg-green-900 border-green-600'
                : 'bg-gray-900 border-gray-700 hover:border-blue-500'
            }`}
          >
            <span className="text-2xl">
              {locationLoading ? '⏳' : verifierLocation ? '✅' : '📍'}
            </span>
            <div>
              <div className="text-white text-sm font-medium">
                {locationLoading
                  ? 'Getting your location...'
                  : verifierLocation
                  ? 'Location Detected!'
                  : 'Detect My Location'}
              </div>
              <div className="text-gray-400 text-xs mt-0.5">
                {verifierLocation
                  ? `${verifierLocation.lat.toFixed(5)}, ${verifierLocation.lng.toFixed(5)}`
                  : 'You must be within 500m of the issue to verify'}
              </div>
            </div>
          </button>
          {locationError && <div className="text-red-400 text-xs mt-2">{locationError}</div>}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={verifierName}
              onChange={(e) => setVerifierName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 mb-6">
          <div className="text-sm text-gray-400 space-y-1">
            <div>🤖 AI compares before and after photos to confirm genuine fix</div>
            <div>📍 You must be within 500m of the issue location</div>
            <div>👥 2 independent citizens must verify before closure</div>
            <div>📱 Phone OTP prevents fake verifications</div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleVerify}
          disabled={!image || !verifierLocation || !otpVerified || verifying}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-semibold text-lg transition"
        >
          {verifying
            ? ' comparing photos...'
            : !otpVerified
            ? '📱 Complete phone verification first'
            : !verifierLocation
            ? '📍 Detect location first'
            : !image
            ? '📸 Upload after photo first'
            : '✅ Submit Verification'}
        </button>
      </div>
    </main>
  );
}