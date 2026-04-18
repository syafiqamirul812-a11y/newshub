'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
export const dynamic = 'force-dynamic';

export default function TipsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit() {
    if (!title || !description) {
      setError('Please fill in title and description');
      return;
    }
    setLoading(true);
    setError('');

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push('/login');
      return;
    }

    // Save tip to Supabase
    const { error: dbError } = await supabase.from('tips').insert({
      user_id: userData.user.id,
      email: userData.user.email,
      title,
      description,
      url,
      category,
    });

    if (dbError) {
      setError('Something went wrong. Please try again.');
    } else {
      setSuccess(true);
      setTitle('');
      setDescription('');
      setUrl('');
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-900 opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-900 opacity-10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/5 backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg">
            📰
          </div>
          <span className="text-xl font-black">NewsHub</span>
        </div>
        <Link
          href="/news"
          className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-full text-sm transition"
        >
          ← Back to News
        </Link>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20 uppercase tracking-widest inline-block mb-3">
            📢 Community
          </p>
          <h1 className="text-4xl font-black mb-2">Submit a News Tip</h1>
          <p className="text-gray-500">Know something newsworthy? Share it with the community!</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold">Tip submitted successfully!</p>
              <p className="text-sm text-green-500/70">Thank you for contributing to NewsHub.</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/3 border border-white/10 rounded-3xl p-8 flex flex-col gap-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-medium">
              Headline <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Major discovery in renewable energy..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
            >
              {['general', 'technology', 'business', 'sports', 'health', 'entertainment'].map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900 capitalize">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-medium">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about this news tip..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* URL */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-medium">
              Source URL <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition shadow-lg shadow-blue-900/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Submitting...' : '📢 Submit Tip'}
          </button>
        </div>
      </div>
    </main>
  );
}
