'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'aqara_builder_theme';

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
}

export function ThemeMenuItem({
  onDone,
  compact = false,
}: {
  onDone?: () => void;
  compact?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const next = saved === 'dark' || saved === 'light' ? saved : 'light';
    setTheme(next);
    applyTheme(next);
    setMounted(true);
  }, []);

  const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
  const Icon = theme === 'dark' ? Moon : Sun;

  return (
    <button
      onClick={() => {
        setTheme(nextTheme);
        window.localStorage.setItem(THEME_KEY, nextTheme);
        applyTheme(nextTheme);
        onDone?.();
      }}
      className={cn(
        'w-full flex items-center text-left transition',
        compact
          ? 'gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950'
          : 'gap-3 px-4 py-2.5 text-sm hover:bg-bg-subtle',
      )}
    >
      <Icon size={compact ? 12 : 15} className={compact ? 'text-slate-500' : 'text-text-muted'} />
      <span className="min-w-0 flex-1">主题</span>
      {mounted && (
        <span className={cn(
          'rounded-full border px-2 py-0.5 text-[10px]',
          compact ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-border bg-bg-subtle text-text-muted',
        )}>
          {theme === 'dark' ? '深色' : '浅色'}
        </span>
      )}
    </button>
  );
}
