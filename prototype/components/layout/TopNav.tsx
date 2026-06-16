'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AqaraLogo } from '@/components/brand/AqaraLogo';
import { BuilderAvatarMenu } from '@/components/layout/BuilderAvatarMenu';
import { UsageQuotaButton } from '@/components/usage/UsageQuotaButton';
import { cn } from '@/lib/utils';
import { ExternalLink, Search, LogIn } from 'lucide-react';
import { useRole, isBuilderRole, isProBuilderRole } from '@/lib/role';
import { planForRole } from '@/lib/plans';

type TopNavItem = {
  href: string;
  label: string;
  external?: boolean;
};

const CORE_NAV: TopNavItem[] = [
  { href: '/home', label: 'Home' },
  { href: '/home/build', label: 'Create' },
  { href: '/home/discover', label: 'Discover' },
  { href: '/home/community', label: 'Community' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/builders', label: 'Find Professionals' },
];

export function TopNav({ variant = 'public' }: { variant?: 'public' | 'minimal' | 'landing' }) {
  const pathname = usePathname() ?? '';
  const { role, mounted } = useRole();
  const plan = mounted ? planForRole(role) : planForRole('builder');
  const navItems = CORE_NAV;

  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-bg/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2">
          <AqaraLogo size={22} />
        </Link>

        {(variant === 'public' || variant === 'landing') && (
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navItems.map(it => {
              const active = !it.external && (pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href)));
              const className = cn(
                'px-3 py-1.5 text-sm rounded transition-colors inline-flex items-center gap-1.5',
                active ? 'text-text bg-white/5' : 'text-text-muted hover:text-text hover:bg-white/5'
              );

              if (it.external) {
                return (
                  <a
                    key={it.href}
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                  >
                    {it.label}
                    <ExternalLink size={12} />
                  </a>
                );
              }

              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={className}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex-1" />

        {(variant === 'public' || variant === 'landing') && (
          <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted rounded-md border border-border hover:border-border-strong transition">
            <Search size={14} />
            <span>搜空间、插件、专业人</span>
            <kbd className="text-2xs text-text-subtle border border-border px-1.5 py-0.5 rounded ml-2">⌘K</kbd>
          </button>
        )}

        {mounted && role === 'anonymous' && (
          <>
            <Link
              href="/signin"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/92 px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white"
            >
              <LogIn size={14} />
              登录
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-lg border border-slate-900/10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-700 px-3.5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/20"
            >
              {variant === 'landing' ? '开始创作' : '立即开始'}
            </Link>
          </>
        )}

        {mounted && isBuilderRole(role) && (
          <>
            <UsageQuotaButton
              showLabel
              planId={plan.id}
              professional={isProBuilderRole(role)}
            />
            <BuilderAvatarMenu />
          </>
        )}
      </div>
    </header>
  );
}
