'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ElementType } from 'react';
import {
  ArrowRight,
  Blocks,
  Bot,
  CheckCircle2,
  ChevronDown,
  Cpu,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  WalletCards,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  CAPABILITY_CATEGORY_LABELS,
  MARKET_PRODUCT_TYPE_LABELS,
  acquisitionLabelForAsset,
  getWorkspaceCreditWallet,
  marketAccessPolicy,
  marketCapabilityCategory,
  marketProductType,
  publicMarketAssets,
  redeemMarketAsset,
  requestMarketAssetInstall,
  workspaceEntitledAssets,
  type MarketAsset,
  type MarketCapabilityCategory,
  type MarketPermission,
  type MarketProductType,
} from '@/lib/mock/commerce';
import {
  getActiveWorkspace,
  subscribeWorkspaceChange,
  WORKSPACE_PLAN_LABEL,
  WORKSPACE_ROLE_LABEL,
  WORKSPACE_TYPE_LABEL,
  type BuilderWorkspace,
} from '@/lib/workspaces';
import { cn } from '@/lib/utils';

type CategoryId = 'all' | MarketCapabilityCategory;
type MarketView = 'all' | 'official';

const CATEGORIES: Array<{ id: CategoryId; label: string; icon: ElementType; match: (asset: MarketAsset) => boolean }> = [
  { id: 'all', label: '全部', icon: Blocks, match: () => true },
  { id: 'automation', label: CAPABILITY_CATEGORY_LABELS.automation, icon: Zap, match: asset => marketCapabilityCategory(asset) === 'automation' },
  { id: 'ai', label: CAPABILITY_CATEGORY_LABELS.ai, icon: Bot, match: asset => marketCapabilityCategory(asset) === 'ai' },
  { id: 'design', label: CAPABILITY_CATEGORY_LABELS.design, icon: LayoutGrid, match: asset => marketCapabilityCategory(asset) === 'design' },
  { id: 'integration', label: CAPABILITY_CATEGORY_LABELS.integration, icon: Cpu, match: asset => marketCapabilityCategory(asset) === 'integration' },
  { id: 'operations', label: CAPABILITY_CATEGORY_LABELS.operations, icon: ShieldCheck, match: asset => marketCapabilityCategory(asset) === 'operations' },
  { id: 'service', label: CAPABILITY_CATEGORY_LABELS.service, icon: Wrench, match: asset => marketCapabilityCategory(asset) === 'service' },
];

const TYPE_ICON: Record<MarketProductType, ElementType> = {
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

function permissionTone(permission: MarketPermission) {
  if (permission === 'free') return 'bg-emerald-50 text-emerald-700';
  if (permission === 'pro') return 'bg-violet-50 text-violet-700';
  if (permission === 'commercial') return 'bg-amber-50 text-amber-700';
  return 'bg-[#151515] text-white';
}

function canRedeem(workspace: BuilderWorkspace) {
  return workspace.role === 'owner' || workspace.role === 'admin' || workspace.role === 'billing_admin';
}

function isEligible(asset: MarketAsset, workspace: BuilderWorkspace) {
  const policy = marketAccessPolicy(asset);
  return policy.allowedWorkspaceTypes.includes(workspace.type) && policy.allowedPlans.includes(workspace.plan);
}

function assetUsageCount(asset: MarketAsset) {
  const seed = asset.name.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const range = asset.permission === 'enterprise' ? 4_000 : asset.featured ? 18_000 : 12_000;
  const base = asset.permission === 'enterprise' ? 3_800 : asset.featured ? 16_000 : 9_000;
  return base + ((seed * 41 + asset.tags.length * 719) % range);
}

export default function ProMarketplacePage() {
  const [workspace, setWorkspace] = useState<BuilderWorkspace | null>(null);
  const [view, setView] = useState<MarketView>('all');
  const [category, setCategory] = useState<CategoryId>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'hot' | 'new'>('hot');
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const assets = publicMarketAssets();

  useEffect(() => {
    setWorkspace(getActiveWorkspace());
    const unsubscribe = subscribeWorkspaceChange(setWorkspace);
    const refresh = () => setVersion(current => current + 1);
    window.addEventListener('aqara:market-change', refresh);
    window.addEventListener('aqara:credits-change', refresh);
    return () => {
      unsubscribe();
      window.removeEventListener('aqara:market-change', refresh);
      window.removeEventListener('aqara:credits-change', refresh);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const ownedAssetIds = useMemo(() => {
    if (!workspace) return new Set<string>();
    return new Set(workspaceEntitledAssets(workspace.id).map(row => row.asset.id));
  }, [workspace, version]);

  const wallet = workspace ? getWorkspaceCreditWallet(workspace.id, workspace.name) : null;

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
          ...asset.tags,
        ].join(' ').toLowerCase().includes(keyword);
      })
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return sort === 'hot' ? assetUsageCount(b) - assetUsageCount(a) : a.name.localeCompare(b.name);
      });
  }, [assets, category, query, sort, view]);

  const handleAcquire = (asset: MarketAsset) => {
    if (!workspace) return;
    if (ownedAssetIds.has(asset.id)) {
      setNotice(`${asset.name} 已在 ${workspace.name} 的 Workspace Assets 中。`);
      return;
    }
    if (asset.permission === 'enterprise') {
      setNotice('Enterprise 能力需要联系销售或总部授权。');
      return;
    }
    if (!isEligible(asset, workspace)) {
      setNotice(`当前 Workspace 需要 ${PERMISSION_LABEL[asset.permission]} 计划或更高权限。`);
      return;
    }

    const target = {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      workspaceType: workspace.type,
      role: workspace.role,
      canInstall: canRedeem(workspace),
    };
    const result = canRedeem(workspace)
      ? redeemMarketAsset(asset.id, target)
      : requestMarketAssetInstall(asset.id, target);
    setVersion(current => current + 1);
    setNotice(result.message);
  };

  if (!workspace) {
    return <main className="h-screen bg-[#fbfbfa]" />;
  }

  return (
    <main className="h-screen overflow-y-auto bg-[#fbfbfa] text-[#202020]">
      <header className="flex h-16 items-center justify-between border-b border-[#e6e2dc] bg-white px-5">
        <div className="min-w-0">
          <div className="text-base font-semibold">Marketplace</div>
          <div className="mt-0.5 truncate text-xs text-[#777]">
            Current Workspace · {workspace.name}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#666]">
          <span className="rounded-full border border-[#e6e2dc] bg-white px-3 py-1.5">
            {WORKSPACE_TYPE_LABEL[workspace.type]}
          </span>
          <span className="rounded-full border border-[#e6e2dc] bg-white px-3 py-1.5">
            {WORKSPACE_ROLE_LABEL[workspace.role]}
          </span>
          <span className="rounded-full border border-[#e6e2dc] bg-white px-3 py-1.5">
            {WORKSPACE_PLAN_LABEL[workspace.plan]}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6e2dc] bg-white px-3 py-1.5">
            <WalletCards size={13} />
            {wallet?.balance.toLocaleString('en-US') ?? '-'} Credits
          </span>
          <Link href="/pro/settings?tab=overview" className="inline-flex h-8 items-center gap-1.5 rounded border border-[#232323] bg-white px-3 font-semibold text-[#202020]">
            <Store size={13} />
            Workspace Assets
          </Link>
        </div>
      </header>

      <section className="px-5 py-5">
        <div className="mb-5 flex min-w-0 items-center gap-6 overflow-x-auto border-b border-[#e8e8e8] pb-4 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        <div className="mb-5 flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] xl:flex-wrap xl:overflow-visible [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map(item => (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-2 rounded-[6px] border px-3 text-sm transition',
                  category === item.id
                    ? 'border-[#171717] bg-[#171717] text-white'
                    : 'border-[#e2e2e2] bg-white text-[#666] hover:border-[#cfcfcf] hover:text-[#171717]',
                )}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-[320px] sm:flex-none">
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
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[6px] border border-[#e2e2e2] bg-white px-3 text-sm text-[#666] transition hover:border-[#cfcfcf] hover:text-[#171717]"
            >
              {sort === 'hot' ? '最热' : '最新'}
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-4">
          {filtered.map(asset => {
            const productType = marketProductType(asset);
            const Icon = TYPE_ICON[productType];
            const owned = ownedAssetIds.has(asset.id);
            const eligible = isEligible(asset, workspace);
            const blocked = asset.permission === 'enterprise' || !eligible || workspace.role === 'viewer';
            const actionLabel = owned
              ? 'Owned'
              : asset.permission === 'enterprise'
              ? 'Contact Sales'
              : !eligible
              ? 'Unavailable'
              : canRedeem(workspace)
              ? acquisitionLabelForAsset(asset)
              : 'Request Purchase';

            return (
              <article
                key={asset.id}
                className="flex min-h-[214px] flex-col rounded border border-[#e3e0da] bg-white p-4 shadow-sm shadow-black/[0.02]"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#e5e2dd] bg-white text-[#171717]">
                    <Icon size={17} />
                  </div>
                  <span className={cn('rounded-[4px] px-2 py-1 text-xs font-medium', permissionTone(asset.permission))}>
                    {PERMISSION_LABEL[asset.permission]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-1 text-base font-semibold tracking-tight">{asset.name}</h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#777]">{asset.summary}</p>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3 text-xs text-[#888]">
                  <div className="min-w-0">
                    <div className="truncate">By @{asset.publisher.replace(/\s+/g, '')}</div>
                    <div className="mt-1.5 flex min-w-0 flex-wrap gap-2">
                      <span>{MARKET_PRODUCT_TYPE_LABELS[productType]}</span>
                      <span>{assetUsageCount(asset).toLocaleString('en-US')}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAcquire(asset)}
                    disabled={owned || blocked}
                    className={cn(
                      'inline-flex h-8 shrink-0 items-center gap-1.5 rounded px-3 text-xs font-semibold transition',
                      owned
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : blocked
                        ? 'border border-[#e0ddd7] bg-[#f5f3ef] text-[#aaa]'
                        : 'bg-[#202020] text-white hover:bg-[#111]',
                    )}
                  >
                    {owned ? <CheckCircle2 size={13} /> : null}
                    {actionLabel}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded border border-dashed border-[#d8d3ca] bg-white px-6 py-14 text-center text-sm text-[#777]">
            没有匹配的能力资产。
          </div>
        ) : null}
      </section>

      {notice ? (
        <div className="fixed right-6 top-20 z-[80] rounded border border-[#e3e0da] bg-white px-4 py-3 text-sm text-[#202020] shadow-2xl shadow-black/10">
          {notice}
        </div>
      ) : null}

      <Link
        href="/pro/settings?tab=overview"
        className="fixed bottom-6 right-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#202020] px-4 text-sm font-semibold text-white shadow-xl shadow-black/15"
      >
        Workspace Assets
        <ArrowRight size={14} />
      </Link>
    </main>
  );
}
