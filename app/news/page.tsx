'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../components/ThemeToggle';
export const dynamic = 'force-dynamic';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
}

const CATEGORIES = [
  { id: 'general', label: 'Top Stories', icon: '🌍' },
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'business', label: 'Business', icon: '📈' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'health', label: 'Health', icon: '🏥' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
];

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('general');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return; }
      setUser(data.user);
      fetchBookmarks(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!search) fetchNews();
  }, [category]);

async function fetchNews(searchQuery = '') {
    setLoading(true);
    try {
      let url = '';
      if (searchQuery) {
        url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&max=12&apikey=${process.env.NEXT_PUBLIC_GNEWS_API_KEY}`;
      } else {
        url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=12&apikey=${process.env.NEXT_PUBLIC_GNEWS_API_KEY}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      const mapped = (data.articles || []).map((a: any) => ({
        title: a.title,
        description: a.description,
        url: a.url,
        urlToImage: a.image,
        publishedAt: a.publishedAt,
        source: { name: a.source?.name || 'Unknown' },
      }));
      setArticles(mapped);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function fetchBookmarks(userId: string) {
    const { data } = await supabase.from('bookmarks').select('url').eq('user_id', userId);
    if (data) setBookmarked(data.map((b) => b.url));
  }

  async function toggleBookmark(article: Article) {
    if (!user) return;
    const isBookmarked = bookmarked.includes(article.url);
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('url', article.url).eq('user_id', user.id);
      setBookmarked(bookmarked.filter((url) => url !== article.url));
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id, title: article.title, description: article.description,
        url: article.url, image: article.urlToImage, source: article.source.name,
      });
      setBookmarked([...bookmarked, article.url]);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const filteredArticles = articles.filter(a => a.title !== '[Removed]');
  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* Top Bar */}
      <div className="border-b border-white/5 dark:border-white/5 light:border-black/5 px-10 py-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{currentTime?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>•</span>
          <span>{currentTime?.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span>
            Live Updates
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-purple-900/30 rotate-3 hover:rotate-0 transition-transform">
              📰
            </div>
            <div>
              <span className="text-xl font-black tracking-tight">NewsHub</span>
              <span className="ml-2 text-[9px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-full border border-blue-400/20 uppercase tracking-widest">Live</span>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 w-72 focus-within:border-purple-500/50 transition">
            <span className="text-gray-500 text-sm">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearch(searchInput);
                  fetchNews(searchInput);
                }
              }}
              placeholder="Search stories..."
              className="bg-transparent text-sm focus:outline-none text-[var(--foreground)] placeholder-gray-600 w-full"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch(''); fetchNews(''); }} className="text-gray-500 hover:text-white text-xs">✕</button>
            )}
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/tips" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition">
              📢 <span>Tip</span>
            </Link>
            <Link href="/bookmarks" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition">
              🔖 <span>Saved</span>
              {bookmarked.length > 0 && (
                <span className="bg-blue-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{bookmarked.length}</span>
              )}
            </Link>
            <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-400 max-w-[100px] truncate">{user?.email?.split('@')[0]}</span>
            </Link>
            <button onClick={handleLogout} className="px-3 py-2 text-xs text-gray-500 hover:text-red-400 transition">
              Sign out
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="max-w-7xl mx-auto px-8 pb-3 flex gap-1 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setSearch(''); setSearchInput(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                category === cat.id && !search
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Search Results Header */}
        {search && (
          <div className="flex items-center gap-3 mb-6">
            <p className="text-gray-500 text-sm">Search results for</p>
            <span className="text-white font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10 text-sm">"{search}"</span>
            <button onClick={() => { setSearch(''); setSearchInput(''); fetchNews(''); }} className="text-gray-600 hover:text-white text-xs transition">Clear ✕</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col justify-center items-center my-32 gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{animationDirection:'reverse', animationDuration:'0.7s'}}></div>
            </div>
            <p className="text-gray-600 text-sm animate-pulse">Loading latest stories...</p>
          </div>
        )}

        {!loading && filteredArticles.length > 0 && (
          <>
            {/* Featured Article */}
            {featuredArticle && !search && (
              <div className="group relative rounded-3xl overflow-hidden mb-8 cursor-pointer border border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/20">
                <div className="relative h-[420px]">
                  <img
                    src={featuredArticle.urlToImage || 'https://via.placeholder.com/1200x420?text=No+Image'}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x420?text=No+Image'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs bg-blue-600 px-3 py-1 rounded-full font-semibold">{featuredArticle.source.name}</span>
                      <span className="text-xs text-gray-400">{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                      <span className="text-xs bg-red-500/80 px-2 py-0.5 rounded-full animate-pulse">FEATURED</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 leading-tight max-w-3xl">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-gray-300 text-sm max-w-2xl line-clamp-2 mb-4">
                      {featuredArticle.description}
                    </p>
                    <div className="flex items-center gap-3">
                      
                        <a href={featuredArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition"
                      >
                        Read Full Story
                      </a>
                      <button
                        onClick={() => toggleBookmark(featuredArticle)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition ${
                          bookmarked.includes(featuredArticle.url)
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                        }`}
                      >
                        {bookmarked.includes(featuredArticle.url) ? '🔖 Saved' : '+ Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section Header */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-black">
                {search ? `Results` : CATEGORIES.find(c => c.id === category)?.label}
              </h2>
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-gray-600 text-xs">{filteredArticles.length} stories</span>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(search ? filteredArticles : remainingArticles).map((article, index) => (
                <div
                  key={index}
                  className="group bg-white/3 border border-white/5 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/10 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative overflow-hidden h-44">
                    <img
                      src={article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleBookmark(article)}
                        className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center text-xs transition-all duration-200 ${
                          bookmarked.includes(article.url)
                            ? 'bg-blue-500 shadow-lg shadow-blue-900/50'
                            : 'bg-black/40 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {bookmarked.includes(article.url) ? '🔖' : '＋'}
                      </button>
                    </div>
                    <span className="absolute bottom-3 left-3 text-xs bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                      {article.source.name}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 flex-1">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <span className="text-gray-600 text-xs">
                        {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      
                       <a href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition flex items-center gap-1"
                      >
                        Read more {String.fromCharCode(8599)}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}