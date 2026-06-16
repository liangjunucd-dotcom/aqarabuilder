'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AqaraLogo, AqaraMark } from '@/components/brand/AqaraLogo';
import {
  Home,
  Compass,
  Sparkles,
  Smartphone,
  Lightbulb,
  Store,
  Users,
  MessageSquare,
  GraduationCap,
  ChevronsLeft,
  MessageCircleQuestion,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_SECTIONS = [
  {
    id: 'platform',
    label: '',
    items: [
      { href: '/home', icon: Home, label: 'Home' },
      { href: '/home/discover', icon: Compass, label: 'Discover' },
      { href: '/home/community', icon: MessageSquare, label: 'Community' },
    ],
  },
  {
    id: 'mine',
    label: '我',
    items: [
      { href: '/home/solutions', icon: Sparkles, label: '我的方案' },
      { href: '/home/ideas', icon: Lightbulb, label: '灵感本' },
      { href: '/home/studios', icon: Smartphone, label: '我的空间' },
      { href: '/home/assets', icon: Store, label: 'My Assets' },
    ],
  },
  {
    id: 'explore',
    label: '探索',
    items: [
      { href: '/marketplace', icon: Store, label: 'Marketplace' },
      { href: '/home/find-pro', icon: Users, label: 'Find Professionals' },
      { href: 'https://academy.aqara.com', icon: GraduationCap, label: 'Academy', external: true },
      { href: 'https://forum.aqara.com', icon: MessageCircleQuestion, label: 'Forum', external: true },
    ],
  },
];

export function UserSidebar() {
  const pathname = usePathname() ?? '';
  const [collapsed, setCollapsed] = useState(false);

  const renderItem = (item: any) => {
    const active = !item.external && (
      pathname === item.href ||
      (item.href !== '/home' && pathname.startsWith(item.href)) ||
      item.activePaths?.some((path: string) => pathname.startsWith(path))
    );
    const className = cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition group',
      active
        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm shadow-blue-100/70'
        : 'text-slate-500 hover:text-slate-900 hover:bg-white/70',
      collapsed && 'justify-center px-2'
    );
    const content = (
      <>
        <item.icon size={18} className="flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-[13px] leading-none truncate">{item.label}</span>
            {item.external && <ExternalLink size={12} className="text-text-subtle" />}
            {item.badge && (
              <span className="text-2xs num px-1.5 py-0.5 rounded-full bg-accent/15 text-accent-glow border border-accent/30">
                {item.badge}
              </span>
            )}
          </>
        )}
      </>
    );

    if (item.external) {
      return (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className={className}
          title={collapsed ? item.label : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={className}
        title={collapsed ? item.label : undefined}
      >
        {content}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'sticky top-0 z-20 h-screen flex-shrink-0 flex flex-col bg-white/68 backdrop-blur-2xl shadow-[12px_0_34px_rgba(15,23,42,0.045)] transition-all duration-200',
        collapsed ? 'w-[68px]' : 'w-[252px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/10 bg-[linear-gradient(90deg,#070a12_0%,#0d1222_100%)] px-4">
        <Link href="/" className="flex items-center gap-2 overflow-hidden text-white">
          {collapsed ? <AqaraMark size={22} /> : <AqaraLogo size={22} className="text-white" />}
          {!collapsed && (
            <span className="text-2xs rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-white/60">Beta</span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronsLeft size={14} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto border-r border-slate-200/70 py-3">
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.id} className={cn('px-3', si > 0 && 'mt-4')}>
            {!collapsed && section.label && (
              <div className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(renderItem)}
            </div>
          </div>
        ))}

      </nav>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <div className="flex justify-center border-r border-t border-slate-200/70 p-2">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-white/70"
          >
            <ChevronsLeft size={14} className="rotate-180" />
          </button>
        </div>
      )}
    </aside>
  );
}
