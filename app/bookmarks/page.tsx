'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Bookmark {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  created_at: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login');
      } else {
        fetchBookmarks(data.user.id);
      }
    });
  }, []);

  async function fetchBookmarks(userId: string) {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setBookmarks(data);
    setLoading(false);
  }

  async function removeBookmark(id: string) {
    await supabase.from('bookmarks').delete().eq('id', id);
    setBookmarks(bookmarks.filter((b) => b.id !== id));
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

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-8">
        <div className="mb-8">
          <p className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20 uppercase tracking-widest inline-block mb-3">
            🔖 Your Collection
          </p>
          <h1 className="text-4xl font-black mb-2">Saved Articles</h1>
          <p className="text-gray-500">{bookmarks.length} bookmarked article{bookmarks.length !== 1 ? 's' : ''}</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center my-20">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {!loading && bookmarks.length === 0 && (
          <div className="text-center mt-24">
            <div className="text-6xl mb-4">🔖</div>
            <p className="text-white text-2xl font-bold mb-2">No bookmarks yet!</p>
            <p className="text-gray-600 mb-8">Go back to news and save articles you like.</p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold hover:opacity-90 transition hover:scale-105"
            >
              Browse News
            </Link>
          </div>
        )}

        {!loading && bookmarks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group bg-white/3 border border-white/5 hover:border-blue-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative overflow-hidden h-48">
                  <img
                    src={bookmark.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={bookmark.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 text-xs bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    {bookmark.source}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h2 className="font-bold text-sm leading-snug mb-2 line-clamp-2">
                    {bookmark.title}
                  </h2>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 flex-1">
                    {bookmark.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="text-gray-600 text-xs">
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center text-xs transition"
                      >
                        ✕
                      </button>
                      
                       <a href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm text-gray-500 hover:text-white transition"
                      >
                        {String.fromCharCode(8599)}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
