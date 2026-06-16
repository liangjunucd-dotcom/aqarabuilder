'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AqaraMark } from '@/components/brand/AqaraLogo';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sparkles, FolderOpen, Cpu,
  CreditCard, GraduationCap, Store, Settings, HelpCircle,
  Users, MessageSquare, Home as HomeIcon, LogOut, User,
  ChevronDown, ChevronRight, Package, Workflow, BarChart3, Target,
  Search, Building2, FileText, Camera, Calendar, ClipboardList,
  Wallet, Bell, Trophy, Code2, Briefcase, Lock, ShieldCheck,
  Wrench, ClipboardCheck, Repeat, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { setRole, useRole, can, isVerifiedInstallerRole, isProBuilderRole, type Capability } from '@/lib/role';
import { PRO_WORKBENCH_MODULES, type ProWorkbenchModuleKey } from '@/lib/pro-workbench-architecture';
import { getActiveWorkspace, getWorkspace, getWorkspaceHomeHref, getWorkspaces, setActiveWorkspace as persistActiveWorkspace, subscribeWorkspaceChange, type BuilderWorkspace } from '@/lib/workspaces';

// ─── Houzz Pro 风格：极简一级 + hover 展开二级 ──────────────────────────────────
//
//  一级保持 9 项以内（图标 + 文字），鼠标悬停时右侧弹出二级 flyout
//  视觉层级与 Houzz Pro / Linear / Slack 一致
//  状态体系：Open → In Progress → Done → Closed

interface NavChild {
  href: string;
  label: string;
  desc?: string;
  badge?: string;
  /** 子项需要的能力，Builder 看到锁标 */
  cap?: Capability;
}

interface NavItem {
  key: string;
  href: string;
  icon: any;
  label: string;
  exact?: boolean;
  badge?: string;
  /** flyout 二级菜单，无则不展开 */
  children?: NavChild[];
  /** flyout 顶部说明 */
  flyoutDesc?: string;
  /** 一级菜单需要的能力（如 Leads / Ledger），Builder 看到锁标 */
  cap?: Capability;
  /** 标记为未来能力（Business / Enterprise 才解锁），整组以灰态显示 */
  comingSoon?: boolean;
}

const PRO_NAV_ICONS: Record<ProWorkbenchModuleKey, any> = {
  projects: FolderOpen,
  leads: Target,
  financials: Wallet,
  company: Building2,
};

const NAV: NavItem[] = PRO_WORKBENCH_MODULES.map(module => ({
  key: module.key,
  href: module.href,
  icon: PRO_NAV_ICONS[module.key],
  label: module.label,
  exact: module.exact,
  badge: module.badge,
  cap: module.cap,
  flyoutDesc: module.flyoutDesc,
  children: module.children,
}));

const FOOTER_NAV: NavItem[] = [
  {
    key: 'inbox',
    href: '/pro/messages',
    icon: Bell,
    label: '消息',
    badge: '2',
    flyoutDesc: '消息与通知中心',
    children: [
      { href: '/pro/messages',                  label: '未读消息',   badge: '2', desc: '客户与团队消息' },
      { href: '/pro/messages?tab=notifications', label: '通知',      desc: '系统与项目通知' },
      { href: '/pro/messages?tab=announcements', label: '系统公告',  desc: '产品更新与维护通知' },
    ],
  },
  {
    key: 'settings',
    href: '/pro/settings',
    icon: Settings,
    label: '设置',
    flyoutDesc: '工作区、团队与用户设置',
    children: [
      { href: '/pro/settings',                   label: 'Workspace',     desc: '当前工作区信息与计划' },
      { href: '/pro/settings?tab=general',       label: 'User Settings', desc: '账号资料与个人偏好' },
      { href: '/pro/settings?tab=security',      label: 'Security',      desc: '登录安全与会话' },
      { href: '/pro/settings?tab=notifications', label: 'Notifications', desc: '通知偏好与邀请提醒' },
      { href: '/pro/workspaces',                 label: 'My Workspaces', desc: '工作区与邀请' },
    ],
  },
  {
    key: 'help',
    href: '/pro/help',
    icon: HelpCircle,
    label: '帮助',
    flyoutDesc: '帮助中心与支持资源',
    children: [
      { href: '/pro/help',                  label: '帮助中心',     desc: '常见问题与操作指南' },
      { href: '/pro/help?tab=docs',         label: '文档',         desc: 'API 与集成文档' },
      { href: '/pro/help?tab=contact',      label: '联系支持',     desc: '提交工单或在线咨询' },
    ],
  },
];

const HOVER_PANELS: Record<string, {
  title: string;
  newHref?: string;
  searchPlaceholder?: string;
  sections: Array<{
    title?: string;
    items: Array<{ label: string; href: string; meta?: string }>;
  }>;
}> = {
  projects: {
    title: 'Projects',
    newHref: '/pro/projects?new=1',
    searchPlaceholder: 'Search All Projects',
    sections: [
      {
        title: 'Recent',
        items: [
          { label: 'Schmidt 智能花园', href: '/pro/projects/proj-eu-villa/overview', meta: 'Open' },
          { label: '极奢单身公寓', href: '/pro/projects/proj-urban-penthouse/overview', meta: 'Open' },
          { label: '吴先生别墅 · 庭院二期', href: '/pro/projects/proj-villa-garden/overview', meta: 'In Progress' },
          { label: '刘女士家 · 运维服务', href: '/pro/projects/proj-ops-care/overview', meta: 'Done' },
        ],
      },
      {
        title: 'Planning',
        items: [
          { label: 'Contracts', href: '/pro/projects/proj-eu-villa/overview?tab=contracts' },
          { label: 'Estimates', href: '/pro/projects/proj-eu-villa/overview?tab=estimates' },
          { label: '3D Floor Plans', href: '/pro/projects/proj-eu-villa/overview?tab=floorplans' },
          { label: 'Tasks & Punchlist', href: '/pro/projects/proj-eu-villa/overview?tab=tasks' },
        ],
      },
    ],
  },
  leads: {
    title: 'Leads',
    newHref: '/pro/leads?new=1',
    searchPlaceholder: 'Search All Leads',
    sections: [
      {
        title: '6 Unreads',
        items: [
          { label: 'Basement Finish - Michael...', href: '/pro/leads/L-2026051001' },
          { label: 'Attic Conversion - Emily ...', href: '/pro/leads/L-2026051002' },
          { label: 'Home Extension - David B...', href: '/pro/leads/L-2026051003' },
          { label: 'Living Room Update - Lis...', href: '/pro/leads/L-2026051004' },
          { label: 'Bathroom Revamp - John ...', href: '/pro/leads/L-2026051005' },
          { label: 'Kitchen Overhaul - Sarah ...', href: '/pro/leads/L-2026051006' },
        ],
      },
      {
        title: 'Read',
        items: [
          { label: 'Andréa Blanc du Collet se...', href: '/pro/leads/L-2026051001' },
          { label: 'Garage Conversion - Sop...', href: '/pro/leads/L-2026051002' },
          { label: 'Phone call from +185589...', href: '/pro/leads/L-2026051003' },
          { label: 'Window Replacement - M...', href: '/pro/leads/L-2026051004' },
          { label: 'Kitchen Expansion - Jane ...', href: '/pro/leads/L-2026051005' },
          { label: 'Girard Travaux', href: '/pro/leads/L-2026051006' },
          { label: 'Lambert Design', href: '/pro/leads/L-2026051007' },
        ],
      },
    ],
  },
  financials: {
    title: 'Financials',
    newHref: '/pro/financials?new=1',
    searchPlaceholder: 'Search Financials',
    sections: [
      {
        title: 'Documents',
        items: [
          { label: 'Contracts', href: '/pro/financials?tab=contracts' },
          { label: 'Proposals', href: '/pro/financials?tab=estimates' },
          { label: 'Invoices', href: '/pro/financials?tab=invoices' },
          { label: 'Settlements', href: '/pro/financials?tab=settlements' },
        ],
      },
    ],
  },
  company: {
    title: 'Company',
    sections: [
      {
        items: [
          { label: 'Company Overview', href: '/pro/company?tab=overview' },
          { label: 'Members', href: '/pro/company?tab=members' },
          { label: 'Credentials', href: '/pro/company?tab=credentials' },
          { label: 'Programs', href: '/pro/company?tab=programs' },
        ],
      },
    ],
  },
  inbox: {
    title: 'Messages',
    searchPlaceholder: 'Search Messages',
    sections: [
      {
        title: 'Recent',
        items: [
          { label: 'A. Schmidt', href: '/pro/messages' },
          { label: '陈女士', href: '/pro/messages' },
          { label: 'System notifications', href: '/pro/messages?tab=notifications' },
        ],
      },
    ],
  },
  settings: {
    title: 'Settings',
    sections: [
      {
        items: [
          { label: 'Workspace', href: '/pro/settings' },
          { label: 'User Settings', href: '/pro/settings?tab=general' },
          { label: 'Security', href: '/pro/settings?tab=security' },
          { label: 'Notifications', href: '/pro/settings?tab=notifications' },
          { label: 'My Workspaces', href: '/pro/workspaces' },
        ],
      },
    ],
  },
  help: {
    title: 'Help',
    sections: [
      {
        items: [
          { label: 'Help Center', href: '/pro/help' },
          { label: 'Docs', href: '/pro/help?tab=docs' },
          { label: 'Contact Support', href: '/pro/help?tab=contact' },
        ],
      },
    ],
  },
};

export function ProSidebar() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { role, mounted } = useRole();
  // 在 mount 之前默认按「Certified」展示，避免 SSR / 首次闪烁锁标
  const effectiveRole = mounted ? role : 'verified';
  const isProBuilder = isProBuilderRole(effectiveRole);
  const isVerified = isVerifiedInstallerRole(effectiveRole);
  const demoRoleParam = isVerified ? 'verified' : 'pro';
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [hoverTop, setHoverTop] = useState<number>(0);
  const [activeWorkspace, setActiveWorkspaceState] = useState<BuilderWorkspace>(() => getWorkspaces()[0]);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const workspaceId = new URLSearchParams(window.location.search).get('workspace');
    const workspace = getWorkspace(workspaceId);
    if (workspace) {
      persistActiveWorkspace(workspace.id);
      setActiveWorkspaceState(workspace);
    }
    return subscribeWorkspaceChange(setActiveWorkspaceState);
  }, []);

  const handleEnter = (key: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverTop(rect.top);
    setHoveredKey(key);
  };

  const handleLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHoveredKey(null), 180);
  };

  const handleFlyoutEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const isActive = (item: NavItem) => {
    const hrefPath = item.href.split('?')[0];
    return item.exact ? pathname === hrefPath : pathname.startsWith(hrefPath);
  };

  const itemLocked = (item: NavItem) => !!item.cap && !can(effectiveRole, item.cap);

  const withDemoRole = (href: string) => {
    if (!href.startsWith('/pro')) return href;
    const [path, query = ''] = href.split('?');
    const params = new URLSearchParams(query);
    params.set('demo_as', demoRoleParam);
    return `${path}?${params.toString()}`;
  };

  const visibleNav = activeWorkspace.type === 'personal'
    ? NAV.filter(item => item.key !== 'company')
    : NAV;

  const renderItem = (item: NavItem) => {
    const active = isActive(item);
    const isLocked = itemLocked(item);
    const isComingSoon = item.comingSoon === true;
    return (
      <div
        key={item.key}
        onMouseEnter={(e) => handleEnter(item.key, e)}
        onMouseLeave={handleLeave}
        className={cn('w-full', isComingSoon && 'opacity-60')}
      >
        <Link
          href={withDemoRole(item.href)}
          title={isComingSoon ? `${item.label} · Coming Soon (Business / Enterprise)` : item.label}
          className={cn(
            'relative w-full flex flex-col items-center justify-center gap-1 py-2.5 rounded-none transition',
            active
              ? 'bg-transparent text-white'
              : hoveredKey === item.key
              ? 'bg-white/5 text-white'
              : isLocked
              ? 'text-white/35 hover:text-white/60'
              : 'text-white/70 hover:text-white',
          )}
        >
          <div className={cn(
            'relative z-10 flex h-9 w-9 items-center justify-center rounded-full',
            active && 'bg-white text-[#222]'
          )}>
            <item.icon size={18} className="flex-shrink-0" strokeWidth={2.2} />
            {item.badge && !isLocked && !isComingSoon && (
              <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-1 flex items-center justify-center text-[8px] font-bold rounded-full bg-accent text-white leading-none">
                {item.badge}
              </span>
            )}
            {isLocked && !isComingSoon && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-500/90 border border-bg flex items-center justify-center">
                <Lock size={7} className="text-white" strokeWidth={3} />
              </span>
            )}
            {isComingSoon && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-text-subtle/70 border border-bg flex items-center justify-center" title="Coming Soon">
                <Lock size={7} className="text-bg" strokeWidth={3} />
              </span>
            )}
          </div>
          <span className={cn('relative z-10 text-[11px] leading-tight font-medium', active ? 'text-white' : 'text-current')}>
            {item.label}
          </span>
        </Link>
      </div>
    );
  };

  // 当前 hover 的 item，用于 flyout
  const hoveredItem =
    visibleNav.find(i => i.key === hoveredKey) ?? FOOTER_NAV.find(i => i.key === hoveredKey);

  return (
    <>
      <aside className="sticky top-0 z-30 flex h-screen w-20 flex-shrink-0 flex-col overflow-visible bg-[#222222] text-white">
        {/* Logo */}
        <div className="flex h-14 flex-col items-center justify-center gap-0.5 px-1">
          <Link href={withDemoRole(getWorkspaceHomeHref(activeWorkspace))} className="rounded-md p-1 transition hover:bg-white/5" title="Builder Pro Home">
            <AqaraMark size={26} />
          </Link>
        </div>

        {/* 主导航 */}
        <nav className="flex flex-1 flex-col items-center gap-1 py-2">
          {visibleNav.map(renderItem)}
        </nav>

        {/* 底部：Inbox · Settings · Help · Avatar */}
        <div className="flex flex-col items-center gap-1 py-2">
          {FOOTER_NAV.map(renderItem)}

          {/* Avatar */}
          <div className="relative w-full">
            <button
              onClick={() => setAvatarOpen(o => !o)}
              className="mt-1 flex w-full flex-col items-center justify-center gap-1 rounded-none py-2 text-white/75 transition hover:bg-white/5 hover:text-white"
              title={isVerified ? 'Jun · Certified' : isProBuilder ? 'Jun · Professional' : 'Jun · User'}
            >
              <div className="relative">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-orange-400 text-xs font-semibold text-white">
                  J
                </div>
                {isVerified && (
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#222] bg-amber-400" title="Certified">
                    <ShieldCheck size={7} className="text-white" strokeWidth={3} />
                  </span>
                )}
              </div>
              <span className={cn('max-w-[72px] truncate text-center text-[9px] leading-none', isVerified ? 'text-amber-300' : isProBuilder ? 'text-white' : 'text-white/60')}>
                {isVerified ? 'Certified' : isProBuilder ? 'Professional' : 'User'}
              </span>
            </button>

            <AnimatePresence>
              {avatarOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
                  <motion.div
                    data-pro-avatar-menu
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.08, ease: 'easeOut' }}
                    style={{ backgroundColor: '#ffffff', color: '#0f172a', opacity: 1 }}
                    className="fixed bottom-3 left-[88px] z-[80] w-[300px] rounded-2xl border border-slate-200 bg-white p-2 text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.28)] ring-1 ring-black/5"
                  >
                    <div className="border-b border-slate-200 px-2.5 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent2 text-xs font-semibold text-white">
                          J
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-950">Jun</div>
                          <div className="truncate text-[10px] text-slate-500">jun@example.com</div>
                        </div>
                        {isVerified ? (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30 inline-flex items-center gap-1">
                            <ShieldCheck size={8} /> Certified
                          </span>
                        ) : isProBuilder ? (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
                            Professional
                          </span>
                        ) : (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                            User
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link href={withDemoRole('/pro/settings?tab=general')} onClick={() => setAvatarOpen(false)} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                        <Settings size={12} /> User Settings
                      </Link>
                      <Link href="/pro/workspaces" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                        <Briefcase size={12} /> My Workspaces
                      </Link>
                    </div>
                    <div className="border-t border-slate-200 pt-1">
                      <button
                        onClick={() => { setAvatarOpen(false); setRole('anonymous'); router.push('/'); }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                      >
                        <LogOut size={12} /> Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Hover Quick Panel */}
      <AnimatePresence>
        {hoveredItem && (
          <HoverQuickPanel
            item={hoveredItem}
            panel={HOVER_PANELS[hoveredItem.key]}
            label={hoveredItem.label}
            withDemoRole={withDemoRole}
            onMouseEnter={handleFlyoutEnter}
            onMouseLeave={handleLeave}
            onNavigate={() => setHoveredKey(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function HoverQuickPanel({
  item,
  panel,
  label,
  withDemoRole,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: {
  item: NavItem;
  panel?: typeof HOVER_PANELS[string];
  label: string;
  withDemoRole: (href: string) => string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate: () => void;
}) {
  const sections = panel?.sections ?? [
    {
      items: item.children?.map(child => ({ label: child.label, href: child.href, meta: child.badge })) ?? [
        { label, href: item.href },
      ],
    },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed bottom-0 left-20 top-0 z-50 flex w-[236px] flex-col border-r border-[#dedbd5] bg-white text-[#222] shadow-xl shadow-black/10"
    >
      <div className="flex h-16 items-center gap-2 border-b border-[#eeeae5] px-4">
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold">{panel?.title ?? label}</h2>
        {panel?.newHref && (
          <Link
            href={withDemoRole(panel.newHref)}
            onClick={onNavigate}
            className="inline-flex h-8 items-center gap-1 rounded bg-[#202020] px-3 text-sm font-semibold text-white"
          >
            <Plus size={14} />
            New
          </Link>
        )}
      </div>

      {panel?.searchPlaceholder && (
        <div className="border-b border-[#eeeae5] px-4 py-3">
          <label className="flex h-9 items-center gap-2 rounded border border-[#e6e2dc] bg-white px-2 text-sm text-[#888]">
            <Search size={16} />
            <span>{panel.searchPlaceholder}</span>
          </label>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {sections.map((section, index) => (
          <section key={section.title ?? index} className="mb-4 last:mb-0">
            {section.title && (
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#8c8983]">
                <span>{section.title}</span>
                <ChevronDown size={14} />
              </div>
            )}
            <div className="space-y-0.5 border-l border-[#eeeae5] pl-4">
              {section.items.map(entry => (
                <Link
                  key={`${entry.href}-${entry.label}`}
                  href={withDemoRole(entry.href)}
                  onClick={onNavigate}
                  className="block rounded px-2 py-1.5 text-sm font-medium text-[#555] transition hover:bg-[#f6f4f0] hover:text-[#202020]"
                >
                  <span className="block truncate">{entry.label}</span>
                  {entry.meta && <span className="block truncate text-[11px] font-normal text-[#999]">{entry.meta}</span>}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </motion.aside>
  );
}
