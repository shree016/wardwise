'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Invalid email or password');
        return;
      }

    // Route based on role
if (email === 'bbmp@wardwise.com') {
  router.push('/dashboard');
} else {
  router.push('/citizen');
}

    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">WardWise</h1>
          <p className="text-gray-400 mt-2">Municipal Intelligence Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-semibold text-lg transition"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 border-t border-gray-800 pt-6">
            <p className="text-gray-500 text-sm text-center mb-3">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setEmail('citizen@wardwise.com'); setPassword('citizen123'); }}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-xl text-sm transition text-left"
              >
                <div className="text-blue-400 font-medium">👤 Citizen</div>
                <div className="text-gray-500 text-xs mt-1">citizen@wardwise.com</div>
              </button>
              <button
                onClick={() => { setEmail('bbmp@wardwise.com'); setPassword('bbmp123'); }}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-xl text-sm transition text-left"
              >
                <div className="text-yellow-400 font-medium">🏛️ BBMP Official</div>
                <div className="text-gray-500 text-xs mt-1">bbmp@wardwise.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}