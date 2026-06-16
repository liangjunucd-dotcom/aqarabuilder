'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Coins,
  Cpu,
  Download,
  ExternalLink,
  Home,
  Info,
  LayoutGrid,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { BuilderFrontShell } from '@/components/layout/BuilderFrontShell';
import { UserTopBar } from '@/components/layout/UserTopBar';
import {
  ASSET_TYPE_LABELS,
  DEFAULT_ACCOUNT_CREDIT_WALLET,
  PERMISSION_LABELS,
  TARGET_LABELS,
  getAccountCreditWallet,
  getMarketAsset,
  marketAssetPointCost,
  marketAssetPriceLabel,
  purchaseMarketAsset,
  userEntitledAssets,
  type MarketAsset,
  type MarketAssetType,
} from '@/lib/mock/commerce';
import { getFrontendStudioSpaceGroups, type FrontendStudioSpaceGroup, type StudioInstanceRow } from '@/lib/studios-view';
import { isBuilderRole, isProBuilderRole, useRole } from '@/lib/role';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<MarketAssetType, LucideIcon> = {
  studio_plugin: Cpu,
  device_connector: ShieldCheck,
  automation_pack: Sparkles,
  widget: PackageCheck,
  scene_pack: Home,
  solution_template: LayoutGrid,
  service_pack: Wrench,
  private_solution: ShieldCheck,
};

type AssignmentSelection = {
  studio: StudioInstanceRow;
  group: FrontendStudioSpaceGroup;
};

function assetUsageCount(asset: MarketAsset) {
  const seed = asset.name.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const range = asset.permission === 'enterprise' ? 4_000 : asset.featured ? 18_000 : 12_000;
  const base = asset.permission === 'enterprise' ? 3_800 : asset.featured ? 16_000 : 9_000;
  return (base + ((seed * 41 + asset.tags.length * 719) % range)).toLocaleString('en-US');
}

function detailActionLabel(asset: MarketAsset, owned: boolean, canUsePro: boolean) {
  if (asset.permission === 'enterprise') return '联系 Aqara';
  if (asset.permission === 'pro' && !canUsePro) return '需要 Pro';
  if (owned) return '已获取';
  const cost = marketAssetPointCost(asset);
  return cost > 0 ? `Redeem · ${cost} Credits` : 'Get';
}

function MarketplaceSkillPageContent() {
  const params = useSearchParams();
  const asset = getMarketAsset(params?.get('id') ?? '') ?? getMarketAsset('asset-matter-core');
  const { role, mounted } = useRole();
  const signedIn = mounted && isBuilderRole(role);
  const isPro = mounted && isProBuilderRole(role);
  const [wallet, setWallet] = useState(DEFAULT_ACCOUNT_CREDIT_WALLET);
  const [assetVersion, setAssetVersion] = useState(0);
  const [assignOpen, setAssignOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const groups = useMemo(() => getFrontendStudioSpaceGroups(), []);
  const ownedRows = useMemo(() => userEntitledAssets(), [assetVersion]);

  useEffect(() => {
    const sync = () => {
      setWallet(getAccountCreditWallet());
      setAssetVersion(current => current + 1);
    };
    sync();
    window.addEventListener('aqara:market-change', sync);
    window.addEventListener('aqara:credits-change', sync);
    return () => {
      window.removeEventListener('aqara:market-change', sync);
      window.removeEventListener('aqara:credits-change', sync);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!asset) {
    return (
      <BuilderFrontShell>
        <UserTopBar title="市场" />
        <main className="mx-auto max-w-5xl px-8 py-16 text-center">
          <div className="text-lg font-semibold text-slate-950">能力资产不存在</div>
          <Link href="/marketplace" className="mt-4 inline-flex text-sm text-blue-600">返回市场</Link>
        </main>
      </BuilderFrontShell>
    );
  }

  const Icon = TYPE_ICON[asset.type];
  const owned = ownedRows.some(row => row.asset.id === asset.id);
  const proLocked = asset.permission === 'pro' && !isPro;
  const insufficient = marketAssetPointCost(asset) > wallet.balance;
  const canAcquire = signedIn && !proLocked && asset.permission !== 'enterprise' && !insufficient;

  const handleAcquire = () => {
    if (!signedIn) {
      window.location.href = `/signin?redirect=${encodeURIComponent(`/marketplace/skill?id=${asset.id}`)}`;
      return;
    }
    if (proLocked) {
      setNotice('该能力资产需要 Pro 权限。');
      return;
    }
    if (asset.permission === 'enterprise') {
      setNotice('企业授权需要联系 Aqara 或区域服务商。');
      return;
    }
    if (owned) {
      setNotice('该能力资产已在你的个人资产中。');
      return;
    }
    if (insufficient) {
      setNotice('Credits 不足。');
      return;
    }
    const entitlement = purchaseMarketAsset(asset.id);
    if (entitlement) {
      setWallet(getAccountCreditWallet());
      setAssetVersion(current => current + 1);
      setNotice(`${asset.name} 已加入你的个人资产。`);
    }
  };

  const handleAssign = () => {
    if (!signedIn) {
      window.location.href = `/signin?redirect=${encodeURIComponent(`/marketplace/skill?id=${asset.id}`)}`;
      return;
    }
    if (!owned && canAcquire) {
      const entitlement = purchaseMarketAsset(asset.id);
      if (entitlement) {
        setWallet(getAccountCreditWallet());
        setAssetVersion(current => current + 1);
      }
    }
    if (proLocked || asset.permission === 'enterprise' || insufficient) {
      handleAcquire();
      return;
    }
    setAssignOpen(true);
  };

  return (
    <BuilderFrontShell>
      <UserTopBar title="市场" />
      <main className="mx-auto max-w-6xl px-6 py-6 text-[#171717] lg:px-8">
        <Link href="/marketplace" className="mb-7 inline-flex items-center gap-2 text-sm text-[#777] transition hover:text-[#171717]">
          <ArrowLeft size={15} />
          返回市场
        </Link>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[16px] border border-[#e3e3e3] bg-white p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] border border-[#e5e5e5] bg-white text-[#171717] shadow-sm">
                <Icon size={30} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {asset.featured ? <span className="rounded-[4px] bg-emerald-50 px-2 py-1 text-xs text-emerald-600">推荐</span> : null}
                  <span className="rounded-[4px] bg-slate-100 px-2 py-1 text-xs text-slate-600">{PERMISSION_LABELS[asset.permission]}</span>
                  <span className="rounded-[4px] bg-slate-100 px-2 py-1 text-xs text-slate-600">{TARGET_LABELS[asset.target]}</span>
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight">{asset.name}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[#666]">{asset.summary}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#777]">
                  <span>By @{asset.publisher.replace(/\s+/g, '')}</span>
                  <span className="inline-flex items-center gap-1">
                    <Download size={14} />
                    {assetUsageCount(asset)}
                  </span>
                  <span>{ASSET_TYPE_LABELS[asset.type]}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <InfoCard title="运行端" value={TARGET_LABELS[asset.target]} />
              <InfoCard title="授权" value={asset.permission === 'free' ? '免费' : marketAssetPriceLabel(asset)} />
              <InfoCard title="交付边界" value={asset.type === 'service_pack' ? '服务计划' : 'Studio 本地运行'} />
            </div>

            <div className="mt-8 border-t border-[#ededed] pt-7">
              <h2 className="text-lg font-semibold">能力说明</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  'Get / Redeem 后进入个人资产。',
                  'Assign 后 Studio 获得该能力资产授权。',
                  '下载、启用、运行和卸载由 Studio Runtime 完成。',
                  'Builder 仅记录授权、消耗、分配和回传状态。',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3 rounded-[10px] border border-[#ececec] bg-[#fbfbfb] p-4 text-sm text-[#666]">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[16px] border border-[#e3e3e3] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[#777]">Redeem</div>
              <div className="text-xs text-[#999]">余额 {wallet.balance.toLocaleString()} Credits</div>
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">
              {marketAssetPriceLabel(asset)}
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={handleAcquire}
                disabled={owned || asset.permission === 'enterprise'}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#d8d8d8] bg-white text-sm font-semibold text-[#171717] transition hover:border-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {owned ? <CheckCircle2 size={16} /> : marketAssetPointCost(asset) > 0 ? <Coins size={16} /> : <PackageCheck size={16} />}
                {detailActionLabel(asset, owned, !proLocked)}
              </button>
              <button
                onClick={handleAssign}
                disabled={asset.permission === 'enterprise' || proLocked || insufficient}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#171717] text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-[#cfcfcf]"
              >
                <ExternalLink size={16} />
                {owned ? 'Assign to Studio' : 'Get 并 Assign to Studio'}
              </button>
            </div>

            <div className="mt-5 rounded-[10px] border border-[#ececec] bg-[#fafafa] p-4 text-xs leading-6 text-[#666]">
              一键 Assign 只在 Builder 侧生成授权分配。Studio 会读取授权后，完成能力运行和生命周期管理。
            </div>

            {proLocked ? (
              <Link href="/onboarding" className="mt-4 flex items-center gap-2 rounded-[10px] border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-blue-700">
                <LockKeyhole size={15} />
                需要 Pro 权限
              </Link>
            ) : null}

            <Link href="/home/assets" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#d8d8d8] px-3 py-2.5 text-sm font-semibold text-[#171717] transition hover:border-[#171717]">
              打开 My Assets
            </Link>
          </aside>
        </section>
      </main>

      {notice ? (
        <div className="fixed right-6 top-20 z-[80] rounded-[10px] border border-[#e3e3e3] bg-white px-4 py-3 text-sm text-[#171717] shadow-2xl shadow-black/10">
          {notice}
        </div>
      ) : null}

      {assignOpen ? (
        <AssignStudioDialog
          asset={asset}
          groups={groups}
          onClose={() => setAssignOpen(false)}
          onAssign={selection => {
            setAssignOpen(false);
            setNotice(`${asset.name} 已分配授权给 ${selection.studio.name}。`);
          }}
        />
      ) : null}
    </BuilderFrontShell>
  );
}

export default function MarketplaceSkillPage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceSkillPageContent />
    </Suspense>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#ececec] bg-[#fbfbfb] p-4">
      <div className="text-xs text-[#888]">{title}</div>
      <div className="mt-2 text-base font-semibold text-[#171717]">{value}</div>
    </div>
  );
}

function AssignStudioDialog({
  asset,
  groups,
  onClose,
  onAssign,
}: {
  asset: MarketAsset;
  groups: FrontendStudioSpaceGroup[];
  onClose: () => void;
  onAssign: (selection: AssignmentSelection) => void;
}) {
  const [spaceId, setSpaceId] = useState(groups[0]?.workspace.id ?? '');
  const activeGroup = groups.find(group => group.workspace.id === spaceId) ?? groups[0];
  const [studioId, setStudioId] = useState(activeGroup?.items[0]?.id ?? '');

  useEffect(() => {
    if (!activeGroup?.items.some(studio => studio.id === studioId)) {
      setStudioId(activeGroup?.items[0]?.id ?? '');
    }
  }, [activeGroup, studioId]);

  const activeStudio = activeGroup?.items.find(studio => studio.id === studioId) ?? activeGroup?.items[0];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-[16px] border border-[#e3e3e3] bg-white p-6 shadow-2xl shadow-black/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#171717]">Assign to Studio</h2>
            <p className="mt-2 text-sm leading-6 text-[#666]">
              为 {asset.name} 选择 Space 和 Studio。Builder 只分配授权，运行由 Studio Runtime 完成。
            </p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#777] transition hover:bg-[#f5f5f5] hover:text-[#171717]">
            <X size={17} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#171717]">Space</span>
            <div className="relative">
              <select
                value={spaceId}
                onChange={event => setSpaceId(event.target.value)}
                className="h-11 w-full appearance-none rounded-[8px] border border-[#d8d8d8] bg-white px-3 pr-10 text-sm outline-none transition focus:border-[#171717]"
              >
                {groups.map(group => (
                  <option key={group.workspace.id} value={group.workspace.id}>
                    {group.workspace.emoji} {group.workspace.name} · {group.items.length} 台 Studio
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888]" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#171717]">Studio</span>
            <div className="relative">
              <select
                value={studioId}
                onChange={event => setStudioId(event.target.value)}
                className="h-11 w-full appearance-none rounded-[8px] border border-[#d8d8d8] bg-white px-3 pr-10 text-sm outline-none transition focus:border-[#171717]"
              >
                {(activeGroup?.items ?? []).map(studio => (
                  <option key={studio.id} value={studio.id}>
                    {studio.name} · {studio.ipLocal}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888]" />
            </div>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#ececec] pt-5">
          <div className="text-xs leading-5 text-[#777]">
            {activeGroup && activeStudio ? `${activeGroup.country.flag} ${activeGroup.workspace.name} / ${activeStudio.name}` : '请选择目标 Studio'}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="h-10 rounded-[8px] border border-[#d8d8d8] px-4 text-sm font-semibold text-[#171717] transition hover:border-[#171717]">
              取消
            </button>
            <button
              disabled={!activeGroup || !activeStudio}
              onClick={() => activeGroup && activeStudio && onAssign({ group: activeGroup, studio: activeStudio })}
              className="h-10 rounded-[8px] bg-[#171717] px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-[#cfcfcf]"
            >
              确认 Assign
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
