import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">WardWise</h1>
            <p className="text-gray-400 text-sm">Municipal Intelligence Platform</p>
          </div>
          <nav className="flex gap-4">
            <Link href="/login"className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition">
              Report Issue
            </Link>
            <Link href="/map" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition">
              View Map
            </Link>
            <Link href="/dashboard" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition">
              Dashboard
            </Link>
            <Link href="/wards" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition">
  Ward Scores
</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Report. Track. <span className="text-blue-400">Verify.</span>
        </h2>
        <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
          AI-powered civic issue reporting for Bangalore. Upload a photo, let AI classify it, and hold BBMP accountable.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-lg font-semibold transition">
            Report an Issue
          </Link>
          <Link href="/map" className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-xl text-lg font-semibold transition">
            View Live Map
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800">
            <div className="text-4xl font-bold text-blue-400">AI</div>
            <div className="text-gray-400 mt-2">Auto Classification</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800">
            <div className="text-4xl font-bold text-green-400">0m</div>
            <div className="text-gray-400 mt-2">Manual Work</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800">
            <div className="text-4xl font-bold text-yellow-400">100%</div>
            <div className="text-gray-400 mt-2">Citizen Verified</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h3 className="text-2xl font-bold text-center mb-10">How It Works</h3>
        <div className="grid grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Upload Photo', desc: 'Citizen takes a photo of the issue', color: 'blue' },
            { step: '2', title: 'AI Classifies', desc: 'Gemini AI detects type and severity', color: 'purple' },
            { step: '3', title: 'BBMP Notified', desc: 'Officials see it on dashboard', color: 'yellow' },
            { step: '4', title: 'Citizen Verifies', desc: 'Fix confirmed by locals, not officials', color: 'green' },
          ].map((item) => (
            <div key={item.step} className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
              <div className={`text-3xl font-bold text-${item.color}-400 mb-3`}>{item.step}</div>
              <div className="font-semibold mb-2">{item.title}</div>
              <div className="text-gray-400 text-sm">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}