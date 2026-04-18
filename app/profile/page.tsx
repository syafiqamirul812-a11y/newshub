'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Profile {
  email: string;
  created_at: string;
  id: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login');
        return;
      }
      setProfile({
        email: data.user.email || '',
        created_at: data.user.created_at,
        id: data.user.id,
      });

      const { count } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', data.user.id);

      setBookmarkCount(count || 0);
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  function getInitial(email: string) {
    return email.charAt(0).toUpperCase();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Background */}
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

        {/* Profile Card */}
        <div className="bg-white/3 border border-white/10 rounded-3xl p-8 mb-6">

          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-900/40">
              {profile && getInitial(profile.email)}
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">{profile?.email}</h1>
              <p className="text-gray-500 text-sm">
                Member since {profile && new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 mb-8"></div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Bookmarks', value: bookmarkCount, icon: '🔖' },
              { label: 'Member Days', value: Math.floor((Date.now() - new Date(profile?.created_at || '').getTime()) / (1000 * 60 * 60 * 24)), icon: '📅' },
              { label: 'Status', value: 'Active', icon: '✅' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-black mb-1">{stat.value}</div>
                <div className="text-gray-500 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 mb-8"></div>

          {/* Account Info */}
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-gray-400 text-sm uppercase tracking-widest">Account Info</h2>
            <div className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <p className="text-sm font-medium">{profile?.email}</p>
              </div>
              <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                Verified
              </span>
            </div>
            <div className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">User ID</p>
                <p className="text-sm font-medium text-gray-400 truncate max-w-xs">{profile?.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href="/news"
            className="flex items-center gap-3 bg-white/3 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 transition hover:-translate-y-1 duration-300"
          >
            <span className="text-2xl">📰</span>
            <div>
              <p className="font-bold text-sm">Browse News</p>
              <p className="text-gray-500 text-xs">Read latest articles</p>
            </div>
          </Link>
          <Link
            href="/bookmarks"
            className="flex items-center gap-3 bg-white/3 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 transition hover:-translate-y-1 duration-300"
          >
            <span className="text-2xl">🔖</span>
            <div>
              <p className="font-bold text-sm">My Bookmarks</p>
              <p className="text-gray-500 text-xs">{bookmarkCount} saved articles</p>
            </div>
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 rounded-2xl font-bold transition"
        >
          Log Out
        </button>
      </div>
    </main>
  );
}
