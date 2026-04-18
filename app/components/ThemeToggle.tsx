'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
        isDark
          ? 'bg-white/5 border-white/10 hover:border-white/20'
          : 'bg-black/5 border-black/10 hover:border-black/20'
      }`}
      title="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}