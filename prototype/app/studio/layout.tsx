'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  BookOpen,
  Box,
  Building2,
  Cloud,
  Code2,
  Cpu,
  Home,
  Info,
  Languages,
  Lightbulb,
  Menu,
  Puzzle,
  RotateCcw,
  ScrollText,
  Settings,
  User,
  Workflow,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MyStudios, Workspaces } from '@/lib/mock/studios';

interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const LEGACY_NAV_GROUPS: NavGroup[] = [
  {
    label: 'Build',
    items: [
      { key: 'spaces', href: '/studio/spaces', icon: Building2, label: 'Spaces' },
      { key: 'devices', href: '/studio/devices', icon: Cpu, label: 'Devices' },
      { key: 'automations', href: '/studio/automations', icon: Workflow, label: 'Automations', disabled: true },
    ],
  },
  {
    label: 'Operate',
    items: [
      { key: 'energy', href: '/studio/energy', icon: Lightbulb, label: 'Energy', disabled: true },
      { key: 'alarm', href: '/studio/alarm', icon: Bell, label: 'Alarm', disabled: true },
      { key: 'logs', href: '/studio/logs', icon: ScrollText, label: 'Logs', disabled: true },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'user', href: '/studio/user', icon: User, label: 'User', disabled: true },
      { key: 'backup', href: '/studio/backup', icon: RotateCcw, label: 'Backup & Restore', disabled: true },
      { key: 'settings', href: '/studio/settings', icon: Settings, label: 'Settings', disabled: true },
    ],
  },
  {
    label: 'Extension',
    items: [
      { key: 'plugins', href: '/studio/plugins', icon: Puzzle, label: 'Plugin Center', disabled: true },
      { key: 'developer', href: '/studio/developer', icon: Code2, label: 'Developer', disabled: true },
    ],
  },
];

const CONSOLE_OVERVIEW_ITEM: NavItem = {
  key: 'overview',
  href: '/studio/home',
  icon: Home,
  label: '概览',
};

const CONSOLE_NAV_GROUPS: NavGroup[] = [
  {
    label: '构建',
    items: [
      { key: 'spaces', href: '/studio/spaces', icon: Box, label: '空间管理' },
      { key: 'devices', href: '/studio/devices', icon: Cpu, label: '设备管理' },
      { key: 'automations', href: '/studio/automations', icon: Workflow, label: '自动化', disabled: true },
    ],
  },
  {
    label: '运维',
    items: [
      { key: 'energy', href: '/studio/energy', icon: Lightbulb, label: '能耗管理', disabled: true },
      { key: 'alarm', href: '/studio/alarm', icon: Bell, label: '告警中心', disabled: true },
      { key: 'logs', href: '/studio/logs', icon: ScrollText, label: '日志审计', disabled: true },
    ],
  },
  {
    label: '管理',
    items: [
      { key: 'user', href: '/studio/user', icon: User, label: '用户管理', disabled: true },
      { key: 'backup', href: '/studio/backup', icon: RotateCcw, label: '备份与还原', disabled: true },
      { key: 'settings', href: '/studio/settings', icon: Settings, label: '设置', disabled: true },
    ],
  },
  {
    label: '扩展',
    items: [
      { key: 'plugins', href: '/studio/plugins', icon: Puzzle, label: '插件中心', disabled: true },
      { key: 'developer', href: '/studio/developer', icon: Code2, label: '开发者', disabled: true },
    ],
  },
];

export default function StudioLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeStudio = MyStudios[0];
  const workspace = activeStudio
    ? Workspaces.find(item => item.studioIds.includes(activeStudio.id))
    : undefined;
  const isOverviewShell =
    pathname === '/studio/home' ||
    pathname === '/studio/spaces' ||
    pathname === '/studio/devices';

  useEffect(() => {
    const handleSidebarCollapse = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      setSidebarCollapsed(Boolean(customEvent.detail));
    };

    window.addEventListener('studio-sidebar-collapse', handleSidebarCollapse);
    return () => window.removeEventListener('studio-sidebar-collapse', handleSidebarCollapse);
  }, []);

  if (!activeStudio) {
    return <main className="min-h-screen bg-[#0b0c0f]" />;
  }

  if (isOverviewShell) {
    return (
      <div className="min-h-screen bg-[#0b0e16] text-[#12141a] [color-scheme:light]">
        <header className="flex h-16 items-center justify-between gap-4 px-4 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
              aria-label="打开导航"
            >
              <Menu size={18} />
            </button>
            <Link href="/studio/home" className="min-w-0">
              <div className="truncate text-[20px] font-semibold tracking-[-0.06em] text-white sm:text-[24px]">
                Aqara <span className="ml-2 font-light tracking-[-0.04em] text-white/88">Studio</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="hidden h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#0d86ff] to-[#7a2dff] px-5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(59,130,246,0.28)] transition hover:brightness-110 sm:inline-flex"
            >
              <Cloud size={16} />
              Builder
            </button>
            <HeaderAction icon={Info} label="快速开始" />
            <HeaderAction icon={BookOpen} />
            <button
              type="button"
              className="hidden h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm text-white/92 transition hover:bg-white/15 lg:inline-flex"
            >
              <Languages size={17} />
              简体中文
              <ChevronDown size={16} className="text-white/70" />
            </button>
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-full bg-transparent px-1.5 text-white transition hover:bg-white/5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-white">
                <User size={16} />
              </span>
              <span className="hidden text-sm font-medium sm:inline">super</span>
            </button>
          </div>
        </header>

        <div className="relative min-h-[calc(100vh-64px)] overflow-hidden rounded-t-[28px] bg-[#edf1f7] md:flex md:h-[calc(100vh-64px)]">
          {sidebarOpen && (
            <button
              type="button"
              aria-label="关闭导航"
              className="absolute inset-0 z-20 bg-[#0b0e16]/45 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={cn(
              'absolute inset-y-0 left-0 z-30 flex w-[276px] flex-col border-r border-[#d4dae6] bg-[#eef2f7] transition-[width,transform] duration-300 md:static md:translate-x-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
              sidebarCollapsed ? 'md:w-[76px]' : 'md:w-[276px]'
            )}
          >
            <div className={cn('flex-1 overflow-y-auto py-5', sidebarCollapsed ? 'px-3' : 'px-4')}>
              <StudioConsoleNavLink
                item={CONSOLE_OVERVIEW_ITEM}
                active={pathname === CONSOLE_OVERVIEW_ITEM.href}
                onNavigate={() => setSidebarOpen(false)}
                prominent
                collapsed={sidebarCollapsed}
              />

              <div className="mt-6 space-y-6">
                {CONSOLE_NAV_GROUPS.map(group => (
                  <div key={group.label}>
                    {sidebarCollapsed ? (
                      <div className="mx-auto h-px w-8 bg-[#d4dae6]" />
                    ) : (
                      <div className="px-3 text-[13px] font-medium text-[#9aa1b1]">{group.label}</div>
                    )}
                    <div className="mt-3 space-y-1.5">
                      {group.items.map(item => (
                        <StudioConsoleNavLink
                          key={item.key}
                          item={item}
                          active={pathname.startsWith(item.href)}
                          onNavigate={() => setSidebarOpen(false)}
                          collapsed={sidebarCollapsed}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cn('border-t border-[#d4dae6] py-4', sidebarCollapsed ? 'px-3' : 'px-4')}>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(value => !value)}
                className={cn(
                  'inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#1a1d25] transition hover:bg-white',
                  sidebarCollapsed && 'mx-auto'
                )}
                aria-label={sidebarCollapsed ? '展开导航' : '折叠导航'}
                title={sidebarCollapsed ? '展开导航' : '折叠导航'}
              >
                <Menu size={22} />
              </button>
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto bg-[#f4f6fb]">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0c0f]">
      <aside className="w-[230px] flex-shrink-0 border-r border-white/[0.06] bg-[#0e0f13]">
        <div className="border-b border-white/[0.06] px-4 py-3.5">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-text-subtle">Overview</div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{workspace?.emoji ?? activeStudio.spaceEmoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{workspace?.name ?? activeStudio.spaceName}</div>
              <div className="truncate text-[10px] text-text-muted">Hub M300 · v3.2.1</div>
            </div>
            <span
              className={cn(
                'h-2 w-2 flex-shrink-0 rounded-full',
                activeStudio.health === 'healthy'
                  ? 'bg-emerald-400'
                  : activeStudio.health === 'offline'
                    ? 'bg-danger'
                    : 'bg-warning'
              )}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {LEGACY_NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-3">
              <div className="px-4 py-1 text-[10px] font-medium uppercase tracking-wider text-text-subtle">
                {group.label}
              </div>
              {group.items.map(item => (
                <LegacyNavLink key={item.key} item={item} pathname={pathname} />
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] bg-[#0a0b0e] px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                activeStudio.health === 'healthy'
                  ? 'bg-emerald-400'
                  : activeStudio.health === 'offline'
                    ? 'bg-danger'
                    : activeStudio.health === 'critical'
                      ? 'animate-pulse bg-danger'
                      : 'bg-warning'
              )}
            />
            <span
              className={cn(
                'text-[11px] font-medium',
                activeStudio.health === 'healthy'
                  ? 'text-emerald-400'
                  : activeStudio.health === 'offline'
                    ? 'text-danger'
                    : 'text-warning'
              )}
            >
              {activeStudio.health === 'healthy'
                ? 'System Running'
                : activeStudio.health === 'offline'
                  ? 'Offline'
                  : activeStudio.health === 'critical'
                    ? 'Error'
                    : 'Degraded'}
            </span>
          </div>
          <div className="space-y-0.5 text-[9px] text-text-subtle">
            <div className="flex justify-between">
              <span>LAN IP</span>
              <span className="font-mono text-text-muted">{activeStudio.ipLocal}</span>
            </div>
            <div className="flex justify-between">
              <span>Devices</span>
              <span className="text-text-muted">
                {activeStudio.online}/{activeStudio.devices} online
              </span>
            </div>
            <div className="flex justify-between">
              <span>Uptime</span>
              <span className="text-text-muted">{activeStudio.uptime}%</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}

function HeaderAction({ icon: Icon, label }: { icon: LucideIcon; label?: string }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-full bg-white/10 px-4 text-sm text-white/92 transition hover:bg-white/15',
        label ? 'gap-2' : 'w-10 px-0'
      )}
    >
      <Icon size={17} />
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}

function StudioConsoleNavLink({
  item,
  active,
  onNavigate,
  prominent = false,
  collapsed = false,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
  prominent?: boolean;
  collapsed?: boolean;
}) {
  const className = cn(
    'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition',
    active
      ? 'bg-white text-[#17181d] shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
      : 'text-[#1c1f27] hover:bg-white/75',
    item.disabled && 'cursor-not-allowed opacity-58 hover:bg-transparent',
    prominent && 'py-3.5 text-[15px]',
    collapsed && 'justify-center gap-0 px-0'
  );

  const content = (
    <>
      <item.icon size={20} className={active ? 'text-[#101217]' : 'text-[#7c8394]'} />
      {!collapsed && <span className="flex-1">{item.label}</span>}
    </>
  );

  if (item.disabled) {
    return (
      <button type="button" disabled className={className} title={item.label}>
        {content}
      </button>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate} title={item.label}>
      {content}
    </Link>
  );
}

function LegacyNavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = pathname.startsWith(item.href);
  const className = cn(
    'mx-2 mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 text-xs transition',
    active
      ? 'bg-emerald-500/10 font-medium text-emerald-400'
      : 'text-text-muted hover:bg-white/[0.03] hover:text-text',
    item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-text-muted'
  );

  const content = (
    <>
      <item.icon size={14} className={cn(active && 'text-emerald-400')} />
      <span className="flex-1">{item.label}</span>
    </>
  );

  if (item.disabled) {
    return (
      <button type="button" disabled className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}
