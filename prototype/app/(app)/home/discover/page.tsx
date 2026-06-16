'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Compass,
  LayoutGrid,
  MessageCircleQuestion,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  TrendingUp,
  Users2,
  X,
  Zap,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import { Showcases, STYLE_LABELS, type Showcase, type Style } from '@/lib/mock/showcases';
import { SOLUTIONS, SOLUTION_CATEGORY_LABEL } from '@/lib/mock/solutions';
import { MyAutomations } from '@/lib/mock/automations';
import { publicPlugins } from '@/lib/mock/plugins';
import { ACBs } from '@/lib/mock/acbs';
import { cn, formatNumber } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────

type ContentType = 'all' | 'case' | 'design' | 'automation' | 'plugin' | 'service' | 'pro';
type SortMode = 'recommended' | 'engagement' | 'latest';

const CONTENT_TABS: { id: ContentType; label: string; icon: typeof Compass }[] = [
  { id: 'all', label: '全部', icon: Compass },
  { id: 'case', label: '案例', icon: Sparkles },
  { id: 'design', label: '方案', icon: Compass },
  { id: 'automation', label: '自动化', icon: Zap },
  { id: 'plugin', label: '插件', icon: Store },
  { id: 'service', label: '服务', icon: MessageCircleQuestion },
  { id: 'pro', label: '专业人士', icon: Users2 },
];

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'recommended', label: '推荐' },
  { id: 'engagement', label: '互动量最多' },
  { id: 'latest', label: '最新发布' },
];

type UnifiedCard = {
  id: string;
  href: string;
  type: ContentType;
  title: string;
  subtitle: string;
  author: string;
  authorHandle?: string;
  authorMeta: string;
  metaLine: string;
  badge: string;
  verified?: boolean;
  avatar?: string;
  avatarFallback?: string;
  gradient: string;
  pattern?: string;
  emoji?: string;
  spotlight?: string;
  style?: Style;
  caseMeta?: DiscoverCaseMeta;
  engagementScore: number;
  publishedAt: string;
};

type DiscoverCaseMeta = {
  propertyType: string;
  area: string;
  rooms: number;
  devices: number;
  automations: number;
  deployments: number;
  trustScore: string;
  countryCode: string;
  category: string;
  imagePosition: string;
};

// ─── Data Builders ───────────────────────────────────────────────────

function authorForHandle(handle: string) {
  return ACBs.find(item => item.handle === handle);
}

function buildDiscoverCaseMeta(showcase: Showcase, index: number): DiscoverCaseMeta {
  const areaNumber = parseAreaNumber(showcase.size);
  const rooms = estimateRoomCount(showcase, areaNumber);
  const deployments = Math.max(showcase.applies, showcase.forks * 2, Math.round(showcase.hearts / 16));
  const trustScore = Math.min(
    9.8,
    8.2 +
      (showcase.verified ? 0.55 : 0) +
      (showcase.featured ? 0.25 : 0) +
      Math.min(showcase.hearts / 9000, 0.45) +
      Math.min(showcase.forks / 1400, 0.35),
  ).toFixed(1);

  return {
    propertyType: inferPropertyType(showcase),
    area: areaNumber ? `${formatNumber(areaNumber)}㎡` : '120㎡',
    rooms,
    devices: showcase.devices,
    automations: Math.max(4, Math.round(showcase.devices * 0.46)),
    deployments,
    trustScore,
    countryCode: showcase.country,
    category: showcase.style === 'luxury' ? 'Luxury Home' : showcase.style === 'rental' ? 'Rental' : 'Smart Home',
    imagePosition: ['center', '42% 50%', '58% 50%', '50% 42%', '64% 52%', '36% 54%'][index % 6],
  };
}

function parseAreaNumber(size: string) {
  const match = size.match(/([\d,]+)\s*(?:m²|㎡)/i);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function estimateRoomCount(showcase: Showcase, area: number | null) {
  const text = `${showcase.title} ${showcase.size}`;
  const chineseDigits: Record<string, number> = {
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  const roomMatch = text.match(/([一二两三四五六七八九十\d]+)\s*(?:室|房)/);
  if (roomMatch) {
    const bedrooms = /^\d+$/.test(roomMatch[1]) ? Number(roomMatch[1]) : chineseDigits[roomMatch[1]] ?? 3;
    return Math.max(1, bedrooms + (text.includes('厅') || bedrooms >= 2 ? 1 : 0));
  }
  if (text.includes('老人独立卧') || text.includes('工作室')) return 1;
  if (!area) return 4;
  if (area <= 60) return 2;
  if (area <= 100) return 3;
  if (area <= 150) return 4;
  if (area <= 260) return 5;
  return text.includes('别墅') || text.includes('顶层') ? 8 : 6;
}

function inferPropertyType(showcase: Showcase) {
  const text = `${showcase.title} ${showcase.size}`.toLowerCase();
  if (text.includes('办公室') || text.includes('cowork') || text.includes('工作室')) return 'Office';
  if (text.includes('四合院')) return 'House';
  if (text.includes('别墅') || text.includes('villa')) return 'Villa';
  return 'Apartment';
}

function buildCaseCards(): UnifiedCard[] {
  return Showcases.filter(item => item.kind === 'showcase' || item.kind === 'persona-story').map((showcase, index) => {
    const author = authorForHandle(showcase.authorHandle);
    return {
      id: `case-${showcase.id}`,
      href: `/showcase/${showcase.id}`,
      type: 'case' as const,
      title: showcase.title,
      subtitle: showcase.subtitle,
      author: author?.name ?? showcase.authorHandle,
      authorHandle: showcase.authorHandle,
      authorMeta: `${showcase.countryFlag} ${showcase.publishedAt}`,
      metaLine: `${formatNumber(showcase.applies)} 应用 · ${showcase.devices} 台设备`,
      badge: showcase.linkedSolutionId ? '可 Remix' : '公开案例',
      verified: showcase.verified,
      avatar: author?.avatar,
      avatarFallback: showcase.countryFlag,
      gradient: showcase.thumbnailGradient,
      pattern: showcase.thumbnailPattern,
      spotlight: showcase.size,
      style: showcase.style,
      caseMeta: buildDiscoverCaseMeta(showcase, index),
      engagementScore: (showcase.applies ?? 0) + ((showcase.forks ?? 0) * 2) + ((showcase.hearts ?? 0) * 3),
      publishedAt: showcase.publishedAt ?? '2025-01-01',
    };
  });
}

function buildDesignCards(): UnifiedCard[] {
  return SOLUTIONS.filter(s => s.visibility !== 'private').map(solution => {
    return {
      id: `design-${solution.id}`,
      href: `/home/solutions?solution=${solution.id}`,
      type: 'design' as const,
      title: solution.name,
      subtitle: `${solution.rooms} 房间 · ${solution.devices} 设备`,
      author: 'Aqara',
      authorMeta: SOLUTION_CATEGORY_LABEL[solution.category] ?? '方案模板',
      metaLine: `${solution.forks ?? 0} 次 Remix`,
      badge: solution.status === 'verified' ? '已验证' : '草稿',
      verified: solution.status === 'verified',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      engagementScore: ((solution.forks ?? 0) * 5),
      publishedAt: solution.lastUpdated ?? '2025-06-01',
    };
  });
}

function buildAutomationCards(): UnifiedCard[] {
  return MyAutomations.filter(a => !a.id.startsWith('auto-draft')).map(auto => {
    return {
      id: `auto-${auto.id}`,
      href: `/home/community?automation=${auto.id}`,
      type: 'automation' as const,
      title: auto.name,
      subtitle: `触发: ${auto.trigger} · ${auto.actions.length} 动作`,
      author: auto.spaceName,
      authorMeta: auto.status === 'active' ? '运行中' : '模板',
      metaLine: `${auto.devicesInvolved ?? 0} 台设备联动`,
      badge: auto.createdFrom === 'template' ? '可复用' : '可复用',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      engagementScore: (auto.devicesInvolved ?? 0) * 2,
      publishedAt: '2025-05-15',
    };
  });
}

function buildPluginCards(): UnifiedCard[] {
  return publicPlugins().map(plugin => {
    const author = authorForHandle(plugin.authorHandle);
    return {
      id: `plugin-${plugin.id}`,
      href: `/marketplace?highlight=${plugin.id}`,
      type: 'plugin' as const,
      title: plugin.name,
      subtitle: plugin.description,
      author: author?.name ?? plugin.author,
      authorMeta: `${plugin.category} · ${plugin.target === 'both' ? '全平台' : plugin.target === 'studio' ? 'Studio' : 'Life'}`,
      metaLine: `${formatNumber(plugin.installs)} 安装`,
      badge: plugin.tag === 'Official' ? '官方' : '社区',
      verified: plugin.verified,
      avatar: author?.avatar,
      avatarFallback: plugin.icon,
      gradient: plugin.gradient,
      emoji: plugin.icon,
      spotlight: plugin.priceType === 'free' ? '免费' : plugin.price,
      engagementScore: (plugin.installs ?? 0),
      publishedAt: '2025-04-01',
    };
  });
}

function buildServiceCards(): UnifiedCard[] {
  return [
    {
      id: 'svc-remote-design',
      href: '/home/find-pro',
      type: 'service' as const,
      title: '远程设计方案',
      subtitle: '上传户型，获得专业点位设计与方案建议',
      author: '平台服务',
      authorMeta: '远程 · 按项目',
      metaLine: '23 人已咨询',
      badge: '热门',
      gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
      engagementScore: 23,
      publishedAt: '2025-06-01',
    },
    {
      id: 'svc-automation-check',
      href: '/home/find-pro',
      type: 'service' as const,
      title: '自动化诊断与优化',
      subtitle: '排查自动化失效、延迟与冲突，优化联动逻辑',
      author: '平台服务',
      authorMeta: '远程 · 按次',
      metaLine: '17 人已咨询',
      badge: '推荐',
      gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
      engagementScore: 17,
      publishedAt: '2025-06-01',
    },
    {
      id: 'svc-site-delivery',
      href: '/home/find-pro',
      type: 'service' as const,
      title: '上门安装与交付',
      subtitle: '由认证 Installer 上门完成设备安装与验收',
      author: '平台服务',
      authorMeta: '上门 · 按项目',
      metaLine: '8 人已预约',
      badge: '认证',
      verified: true,
      gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)',
      engagementScore: 8,
      publishedAt: '2025-06-01',
    },
  ];
}

function buildProCards(): UnifiedCard[] {
  return ACBs.filter(acb => acb.acceptingClients).map(acb => ({
    id: `pro-${acb.id}`,
    href: `/u/${acb.handle}`,
    type: 'pro' as const,
    title: acb.name,
    subtitle: acb.bio,
    author: acb.affiliatedStore,
    authorMeta: `${acb.countryFlag} ${acb.city}`,
    metaLine: `${acb.stats.projects} 个项目 · 评分 ${acb.stats.rating.toFixed(1)}`,
    badge: '可预约',
    verified: true,
    avatar: acb.avatar,
    avatarFallback: acb.countryFlag,
    gradient: acb.cover,
    engagementScore: (acb.stats.projects ?? 0) * 10 + (acb.stats.rating ?? 0) * 100,
    publishedAt: '2025-05-01',
  }));
}

// ─── Page ────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f8fb]" />}>
      <DiscoverPageContent />
    </Suspense>
  );
}

function DiscoverPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams?.get('q') ?? '';

  const [query, setQuery] = useState(urlQuery);
  const [activeType, setActiveType] = useState<ContentType>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recommended');

  // Build all content cards
  const allCards = useMemo<UnifiedCard[]>(() => {
    const caseCards = buildCaseCards();
    const designCards = buildDesignCards();
    const autoCards = buildAutomationCards();
    const pluginCards = buildPluginCards();
    const serviceCards = buildServiceCards();
    const proCards = buildProCards();

    // Interleave for visual variety in "all" view
    return interleaveFeed([caseCards, designCards, autoCards, pluginCards, serviceCards, proCards]);
  }, []);

  // Filter by type
  const typeFiltered = useMemo(() => {
    if (activeType === 'all') return allCards;
    return allCards.filter(card => card.type === activeType);
  }, [allCards, activeType]);

  // Search
  const searchFiltered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return typeFiltered;
    return typeFiltered.filter(card =>
      [card.title, card.subtitle, card.author, card.metaLine, card.badge].join(' ').toLowerCase().includes(normalized)
    );
  }, [typeFiltered, query]);

  // Sort
  const sortedCards = useMemo(() => {
    const items = [...searchFiltered];
    switch (sortMode) {
      case 'engagement':
        return items.sort((a, b) => b.engagementScore - a.engagementScore);
      case 'latest':
        return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      default: // recommended — interleaved is already the initial order
        return items;
    }
  }, [searchFiltered, sortMode]);

  const contentCounts = useMemo(() => {
    const counts: Record<ContentType, number> = {
      all: allCards.length,
      case: 0,
      design: 0,
      automation: 0,
      plugin: 0,
      service: 0,
      pro: 0,
    };

    allCards.forEach(card => {
      if (card.type !== 'all') counts[card.type] += 1;
    });

    return counts;
  }, [allCards]);

  const activeTypeLabel = CONTENT_TABS.find(tab => tab.id === activeType)?.label ?? '全部';
  const verifiedCount = allCards.filter(card => card.verified).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.replace(`/home/discover?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.replace('/home/discover');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <UserTopBar
        title="发现"
          centerSlot={(
          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <label className="flex h-10 w-full items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 shadow-sm shadow-black/20 transition focus-within:border-blue-300/80 focus-within:bg-white/20">
              <Search size={16} className="shrink-0 text-white/60" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="搜索案例、方案、自动化、插件、服务、专业人士"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-white"
                  aria-label="清除搜索"
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </form>
        )}
      />

      <main className="mx-auto max-w-[1600px] px-5 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-500 shadow-sm shadow-slate-200/60">
              <LayoutGrid size={13} />
              空间灵感网络
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Discover</h1>
            <p className="mt-1 text-sm text-slate-500">
              统一发现案例、方案、自动化、插件、服务与专业人士。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-500 shadow-sm shadow-slate-200/60 sm:flex">
              <span className="font-semibold text-slate-950">{allCards.length}</span>
              <span>内容</span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="font-semibold text-slate-950">{contentCounts.case}</span>
              <span>案例</span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="font-semibold text-slate-950">{verifiedCount}</span>
              <span>认证</span>
            </div>
            <Link
              href="/home/ideas"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/70 transition hover:border-blue-300 hover:bg-white"
            >
              <Bookmark size={14} />
              我的灵感本
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Toolbar: type and sort */}
        <section className="mb-6 rounded-lg border border-slate-200 bg-white/[0.92] p-2 shadow-sm shadow-slate-200/70 backdrop-blur">
          <div className="flex flex-col gap-2 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-1">
                {CONTENT_TABS.map(tab => {
                  const Icon = tab.icon;
                  const active = activeType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveType(tab.id)}
                      className={cn(
                        'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition',
                        active
                          ? 'bg-slate-950 text-white shadow-sm shadow-slate-900/20'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950',
                      )}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                      <span className={cn(
                        'num rounded px-1.5 py-0.5 text-[10px] leading-none',
                        active ? 'bg-white/[0.14] text-white/80' : 'bg-slate-100 text-slate-400',
                      )}>
                        {contentCounts[tab.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 pt-2 2xl:border-t-0 2xl:pt-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-medium text-slate-600">{activeTypeLabel}</span>
                <span>·</span>
                <span>{sortedCards.length} 项</span>
              </div>
              <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-0.5">
                <SlidersHorizontal size={13} className="ml-2 hidden text-slate-400 sm:block" />
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSortMode(opt.id)}
                    className={cn(
                      'inline-flex h-7 items-center gap-1 rounded px-2.5 text-xs font-medium transition',
                      sortMode === opt.id
                        ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:text-slate-900',
                    )}
                  >
                    {opt.id === 'engagement' && <TrendingUp size={11} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content grid — high density 4-column */}
        {sortedCards.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {sortedCards.map((card, index) => (
              <DiscoverCard key={card.id} card={card} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <Search size={24} />
            </div>
            <div className="mt-4 text-lg font-semibold text-slate-900">没有找到匹配内容</div>
            <div className="mt-2 text-sm text-slate-500">试试切换内容类型或修改搜索关键词。</div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Interleave ──────────────────────────────────────────────────────

function interleaveFeed<T>(groups: T[][]) {
  const output: T[] = [];
  const max = Math.max(...groups.map(g => g.length), 0);
  for (let i = 0; i < max; i++) {
    groups.forEach(g => {
      if (g[i]) output.push(g[i]);
    });
  }
  return output;
}

// ─── Discover Card ───────────────────────────────────────────────────

function DiscoverCard({ card, index }: { card: UnifiedCard; index: number }) {
  const iconEl = typeIcon(card.type);
  const typeLabel = CONTENT_TABS.find(tab => tab.id === card.type)?.label ?? '内容';
  const styleMeta = card.style ? STYLE_LABELS[card.style] : null;
  const useImmersiveCaseCard = card.type === 'case' && Boolean(card.caseMeta);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.15) }}
      className={cn('h-full', useImmersiveCaseCard && index % 7 === 0 && 'lg:col-span-2')}
    >
      {useImmersiveCaseCard ? (
        <DiscoverCaseCard card={card} featured={index % 7 === 0} />
      ) : (
        <Link href={card.href} className="group block">
        <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/60 transition group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)]">
          {/* Thumbnail */}
          <div
            className="relative aspect-[4/3] overflow-hidden bg-slate-100"
            style={{ background: card.gradient || undefined }}
          >
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/24 via-slate-950/0 to-white/[0.12]" />

            {/* Type icon */}
            <div className="absolute left-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-white/50 bg-white/[0.86] text-slate-800 shadow-sm backdrop-blur">
              {iconEl}
            </div>

            {/* Badge */}
            <span className="absolute right-2.5 top-2.5 z-10 rounded-md border border-white/50 bg-white/[0.88] px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur">
              {card.badge}
            </span>

            {/* Thumbnail content */}
            <CardThumbnail card={card} />

            {styleMeta && (
              <span className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 rounded-md border border-white/40 bg-white/[0.86] px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: styleMeta.color }} />
                {styleMeta.zh}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-semibold text-slate-500">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span className="truncate">{typeLabel}</span>
              </span>
              <span className="truncate text-right">{card.authorMeta}</span>
            </div>

            <h3 className="line-clamp-2 min-h-10 text-[15px] font-semibold leading-5 text-slate-950 transition group-hover:text-blue-700">
              {card.title}
            </h3>
            <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{card.subtitle}</p>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                {card.avatar ? (
                  <img src={card.avatar} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
                ) : (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-500 ring-1 ring-slate-200">
                    {card.avatarFallback ?? card.author.slice(0, 1)}
                  </span>
                )}
                <span className="truncate">{card.author}</span>
                {card.verified && <ShieldCheck size={10} className="shrink-0 text-blue-600" />}
              </span>
              <span className="shrink-0 truncate text-right font-medium text-slate-500">
                {card.spotlight ?? card.metaLine}
              </span>
            </div>
          </div>
        </article>
        </Link>
      )}
    </motion.div>
  );
}

function DiscoverCaseCard({ card, featured }: { card: UnifiedCard; featured: boolean }) {
  const meta = card.caseMeta!;
  const statItems = [
    ['类型', meta.propertyType],
    ['面积', meta.area],
    ['房间', String(meta.rooms)],
    ['设备', String(meta.devices)],
    ['自动化', String(meta.automations)],
    ['部署次数', formatNumber(meta.deployments)],
    ['Trust Score', meta.trustScore],
  ];

  return (
    <Link href={card.href} className="group block h-full">
      <article
        className={cn(
          'flex h-full min-h-[390px] overflow-hidden rounded-[8px] border border-slate-200 bg-white text-slate-950 shadow-sm shadow-slate-200/60 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)]',
          featured ? 'min-h-[430px]' : 'min-h-[390px]',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className={cn('relative overflow-hidden bg-slate-100', featured ? 'aspect-[2.35/1]' : 'aspect-[4/3]')}>
            <div
              className="absolute inset-0 scale-100 bg-cover transition duration-700 group-hover:scale-[1.035]"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(248,250,252,0.02) 0%, rgba(15,23,42,0.16) 100%), url('/images/aqara-home-spatial-hero.png')`,
                backgroundPosition: meta.imagePosition,
                filter: 'brightness(1.08) saturate(0.9)',
              }}
            />
            <div
              className="absolute inset-0 opacity-10 mix-blend-soft-light"
              style={{ background: card.gradient }}
            />

            <div className="absolute left-3 top-3 z-10 rounded-[8px] bg-white px-3 py-2 text-sm font-bold text-slate-950 shadow-sm shadow-slate-900/10">
              {meta.countryCode}
            </div>
            <div className="absolute right-3 top-3 z-10 rounded-[8px] border border-white/40 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
              {card.badge}
            </div>

            <div className="absolute bottom-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-[8px] bg-white text-slate-950 shadow-sm shadow-slate-900/20 transition group-hover:translate-x-0.5">
              <ArrowRight size={22} />
            </div>
          </div>

          <div className="border-t border-slate-100 p-3.5">
            <div className="mb-3 flex items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-semibold text-slate-500">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span className="truncate">案例</span>
              </span>
              <span className="truncate text-right font-medium">{meta.category}</span>
            </div>
            <h3 className={cn('line-clamp-2 font-semibold leading-5 text-slate-950 transition group-hover:text-blue-700', featured ? 'text-lg' : 'text-[15px]')}>
              {card.title}
            </h3>

            <dl className={cn(
              'mt-3 grid gap-2 rounded-[8px] border border-slate-200 bg-slate-50 p-3',
              featured ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2',
            )}>
              {statItems.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="truncate text-[10px] font-medium text-slate-400">{label}</dt>
                  <dd className="mt-1 truncate text-sm font-semibold text-slate-950">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </article>
    </Link>
  );
}

function CardThumbnail({ card }: { card: UnifiedCard }) {
  // Professional: show avatar
  if (card.type === 'pro' && card.avatar) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600/30 to-slate-950/40">
        <img src={card.avatar} alt="" className="h-20 w-20 rounded-full border-4 border-white/60 object-cover shadow-xl" />
      </div>
    );
  }

  // Plugin: show emoji
  if (card.type === 'plugin' && card.emoji) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-4xl shadow-lg backdrop-blur">
          {card.emoji}
        </div>
      </div>
    );
  }

  // Service: show icon
  if (card.type === 'service') {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <MessageCircleQuestion size={44} strokeWidth={1.3} className="text-white/80" />
      </div>
    );
  }

  // Default: floorplan pattern
  return (
    <div className="absolute inset-0 p-4">
      <FloorplanSVG pattern={(card.pattern || 'rooms') as 'top' | 'rooms' | 'cross' | 'L' | 'open' | 'two-floor'} />
    </div>
  );
}

function typeIcon(type: ContentType) {
  switch (type) {
    case 'case': return <Sparkles size={13} />;
    case 'design': return <Compass size={13} />;
    case 'automation': return <Zap size={13} />;
    case 'plugin': return <Store size={13} />;
    case 'service': return <MessageCircleQuestion size={13} />;
    case 'pro': return <Users2 size={13} />;
    default: return <Compass size={13} />;
  }
}
