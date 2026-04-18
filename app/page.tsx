import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-8">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-900 opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-900 opacity-10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            📰
          </div>
          <h1 className="text-4xl font-black tracking-tight">NewsHub</h1>
        </div>

        <p className="text-gray-400 text-xl mb-12">
          Your personalized news experience. Stay informed, bookmark articles, and never miss a story.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl font-semibold transition hover:bg-white/10"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl font-bold transition shadow-lg shadow-blue-900/40 hover:scale-105"
          >
            Get Started →
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-16">
          {[
            { icon: '🌍', title: 'Live News', desc: 'Latest headlines from around the world' },
            { icon: '🔖', title: 'Bookmarks', desc: 'Save articles to read later' },
            { icon: '🔐', title: 'Secure', desc: 'Your data is private and protected' },
          ].map((f) => (
            <div key={f.title} className="bg-white/3 border border-white/5 rounded-2xl p-4 text-left">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}