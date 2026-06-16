'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Blocks,
  Bot,
  ChevronDown,
  Cpu,
  LayoutGrid,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { BuilderFrontShell } from '@/components/layout/BuilderFrontShell';
import { UserTopBar } from '@/components/layout/UserTopBar';
import {
  CAPABILITY_CATEGORY_LABELS,
  MARKET_PRODUCT_TYPE_LABELS,
  TARGET_LABELS,
  acquisitionLabelForAsset,
  marketCapabilityCategory,
  marketProductType,
  publicMarketAssets,
  type MarketAsset,
  type MarketCapabilityCategory,
  type MarketProductType,
  type MarketPermission,
} from '@/lib/mock/commerce';
import { cn } from '@/lib/utils';

type CategoryId = 'all' | MarketCapabilityCategory;

const CATEGORIES: Array<{
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  match: (asset: MarketAsset) => boolean;
}> = [
  { id: 'all', label: '全部', icon: Blocks, match: () => true },
  { id: 'automation', label: CAPABILITY_CATEGORY_LABELS.automation, icon: Zap, match: asset => marketCapabilityCategory(asset) === 'automation' },
  { id: 'ai', label: CAPABILITY_CATEGORY_LABELS.ai, icon: Bot, match: asset => marketCapabilityCategory(asset) === 'ai' },
  { id: 'design', label: CAPABILITY_CATEGORY_LABELS.design, icon: LayoutGrid, match: asset => marketCapabilityCategory(asset) === 'design' },
  { id: 'integration', label: CAPABILITY_CATEGORY_LABELS.integration, icon: Cpu, match: asset => marketCapabilityCategory(asset) === 'integration' },
  { id: 'operations', label: CAPABILITY_CATEGORY_LABELS.operations, icon: ShieldCheck, match: asset => marketCapabilityCategory(asset) === 'operations' },
  { id: 'service', label: CAPABILITY_CATEGORY_LABELS.service, icon: Wrench, match: asset => marketCapabilityCategory(asset) === 'service' },
];

const TYPE_ICON: Record<MarketProductType, LucideIcon> = {
  plugin: Sparkles,
  template: LayoutGrid,
  service_package: Wrench,
  agent: Bot,
  connector: ShieldCheck,
  solution_pack: Blocks,
};

const PERMISSION_LABEL: Record<MarketPermission, string> = {
  free: 'Free',
  pro: 'Pro',
  commercial: 'Business',
  enterprise: 'Enterprise',
};

type MarketView = 'all' | 'official';

function assetUsageCount(asset: MarketAsset) {
  const seed = asset.name.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const range = asset.permission === 'enterprise' ? 4_000 : asset.featured ? 18_000 : 12_000;
  const base = asset.permission === 'enterprise' ? 3_800 : asset.featured ? 16_000 : 9_000;
  return base + ((seed * 41 + asset.tags.length * 719) % range);
}

function assetUsageLabel(asset: MarketAsset) {
  return assetUsageCount(asset).toLocaleString('en-US');
}

function permissionTone(permission: MarketPermission) {
  if (permission === 'free') return 'bg-emerald-50 text-emerald-700';
  if (permission === 'pro') return 'bg-violet-50 text-violet-700';
  if (permission === 'commercial') return 'bg-amber-50 text-amber-700';
  return 'bg-[#151515] text-white';
}

export default function MarketplacePage() {
  const [view, setView] = useState<MarketView>('all');
  const [category, setCategory] = useState<CategoryId>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'hot' | 'new'>('hot');
  const assets = publicMarketAssets();

  const filtered = useMemo(() => {
    const active = CATEGORIES.find(item => item.id === category) ?? CATEGORIES[0];
    const keyword = query.trim().toLowerCase();
    return assets
      .filter(asset => view === 'all' || asset.publisher.toLowerCase().includes('aqara') || Boolean(asset.featured))
      .filter(asset => active.match(asset))
      .filter(asset => {
        if (!keyword) return true;
        return [
          asset.name,
          asset.publisher,
          asset.summary,
          MARKET_PRODUCT_TYPE_LABELS[marketProductType(asset)],
          CAPABILITY_CATEGORY_LABELS[marketCapabilityCategory(asset)],
          TARGET_LABELS[asset.target],
          ...asset.tags,
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      })
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return sort === 'hot' ? assetUsageCount(b) - assetUsageCount(a) : a.name.localeCompare(b.name);
      });
  }, [assets, category, query, sort, view]);

  return (
    <BuilderFrontShell>
      <UserTopBar title="市场" />
      <main className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-4 py-5 text-[#171717] sm:px-5 lg:px-7 2xl:px-8">
        <header className="mb-6 flex flex-col gap-4">
          <div className="flex min-w-0 items-center gap-6 overflow-x-auto border-b border-[#e8e8e8] pb-4 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'all' as const, label: '全部' },
              { id: 'official' as const, label: '官方精选' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn('shrink-0 font-medium transition', view === item.id ? 'text-[#171717]' : 'text-[#858585] hover:text-[#171717]')}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] 2xl:flex-wrap 2xl:overflow-visible [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className={cn(
                    'inline-flex h-9 shrink-0 items-center gap-2 rounded-[6px] border px-3 text-sm transition lg:h-10 lg:px-4',
                    category === item.id
                      ? 'border-[#171717] bg-white text-[#171717]'
                      : 'border-[#e2e2e2] bg-white text-[#666] hover:border-[#cfcfcf] hover:text-[#171717]'
                  )}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="relative min-w-0 flex-1 sm:max-w-[320px] 2xl:w-[280px] 2xl:flex-none">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search capabilities..."
                  className="h-10 w-full rounded-[6px] border border-[#e2e2e2] bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-[#aaa] focus:border-[#bdbdbd]"
                />
              </div>
              <button
                onClick={() => setSort(current => (current === 'hot' ? 'new' : 'hot'))}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[6px] border border-[#e2e2e2] bg-white px-3 text-sm text-[#666] transition hover:border-[#cfcfcf] hover:text-[#171717] sm:px-4"
              >
                {sort === 'hot' ? '最热' : '最新'}
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4 2xl:gap-5">
          {filtered.map(asset => {
            const productType = marketProductType(asset);
            const Icon = TYPE_ICON[productType];
            return (
              <Link
                key={asset.id}
                href={`/marketplace/skill?id=${asset.id}`}
                className="group flex min-h-[184px] min-w-0 flex-col rounded-[12px] border border-[#e3e3e3] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#cfcfcf] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] lg:p-5"
              >
                <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-[#e5e5e5] bg-white text-[#171717]">
                    <Icon size={18} />
                  </div>
                  <span className={cn('shrink-0 rounded-[4px] px-2 py-1 text-xs font-medium', permissionTone(asset.permission))}>
                    {PERMISSION_LABEL[asset.permission]}
                  </span>
                </div>

                <h2 className="line-clamp-1 min-w-0 text-base font-semibold tracking-tight text-[#171717]">{asset.name}</h2>
                <p className="line-clamp-3 flex-1 text-sm leading-6 text-[#777]">{asset.summary}</p>

                <div className="mt-5 flex min-w-0 items-end justify-between gap-3 text-xs text-[#888]">
                  <div className="min-w-0">
                    <div className="truncate">By @{asset.publisher.replace(/\s+/g, '')}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span>{MARKET_PRODUCT_TYPE_LABELS[productType]}</span>
                      <span>{acquisitionLabelForAsset(asset)}</span>
                    </div>
                  </div>
                  <div className="inline-flex shrink-0 items-center gap-1 text-[#8a8a8a]">
                    <ChevronDown size={11} />
                    {assetUsageLabel(asset)}
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-[12px] border border-dashed border-[#d8d8d8] bg-white px-6 py-16 text-center text-sm text-[#777]">
            没有匹配的能力资产。
          </div>
        ) : null}

        <div className="mt-10 flex items-center justify-center gap-4 text-sm text-[#888]">
          <span className="rounded-[6px] border border-[#e2e2e2] bg-white px-3 py-2 text-[#171717]">1</span>
          <span>2</span>
          <span>...</span>
          <span>352</span>
          <PenLine size={14} className="rotate-180" />
        </div>
      </main>
    </BuilderFrontShell>
  );
}
