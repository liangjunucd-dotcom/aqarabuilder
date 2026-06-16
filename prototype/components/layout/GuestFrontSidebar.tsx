'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AqaraLogo } from '@/components/brand/AqaraLogo';
import { cn } from '@/lib/utils';
import {
  Compass,
  GraduationCap,
  Home,
  LogIn,
  MessageSquare,
  Store,
  Users,
  MessageCircleQuestion,
} from 'lucide-react';

const GUEST_SECTIONS = [
  {
    id: 'main',
    label: '',
    items: [
      { href: '/home', icon: Home, label: 'Home' },
      { href: '/home/discover', icon: Compass, label: 'Discover' },
      { href: '/home/community', icon: MessageSquare, label: 'Community' },
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

export function GuestFrontSidebar() {
  const pathname = usePathname() ?? '';

  return (
    <aside className="sticky top-0 z-20 h-screen w-[252px] flex-shrink-0 bg-white/68 backdrop-blur-2xl shadow-[12px_0_34px_rgba(15,23,42,0.045)]">
      <div className="flex h-14 items-center border-b border-white/10 bg-[linear-gradient(90deg,#070a12_0%,#0d1222_100%)] px-4">
        <Link href="/home" className="flex items-center gap-2 overflow-hidden text-white">
          <AqaraLogo size={22} className="text-white" />
          <span className="text-2xs rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-white/60">Beta</span>
        </Link>
      </div>

      <nav className="h-[calc(100vh-56px)] overflow-y-auto border-r border-slate-200/70 px-3 py-3">
        {GUEST_SECTIONS.map((section, sectionIndex) => (
          <div key={section.id} className={cn(sectionIndex > 0 && 'mt-4')}>
            {section.label && (
              <div className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
                if ('external' in item && item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-slate-500 transition hover:bg-white/70 hover:text-slate-900"
                    >
                      <item.icon size={18} className="flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition',
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm shadow-blue-100/70'
                        : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
                    )}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white/88 p-4 shadow-sm shadow-slate-200/70">
          <div className="mb-3 text-[11px] font-semibold text-slate-400">我</div>
          <div className="text-sm font-semibold text-slate-950">登录即可继续创作</div>
          <div className="mt-2 text-xs leading-5 text-slate-500">
            收藏案例、保存灵感本、创建设计方案，并把能力分配到你的 Aqara Studio。
          </div>
          <Link
            href="/signin?redirect=%2Fhome"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-700"
          >
            <LogIn size={14} />
            登录
          </Link>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4 text-[11px] leading-5 text-slate-400">
          <div>公开案例、插件市场与专业服务可直接浏览。</div>
          <div className="mt-1">登录后即可保存方案、灵感与 Studio 资产。</div>
        </div>
      </nav>
    </aside>
  );
}
