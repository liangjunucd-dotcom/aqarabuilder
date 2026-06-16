'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  MoreHorizontal,
  PackageCheck,
  ScrollText,
  Search,
  X,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import {
  ASSET_TYPE_LABELS,
  MARKET_PRODUCT_TYPE_LABELS,
  PERMISSION_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  marketAssetPriceLabel,
  marketProductType,
  seededUserEntitledAssets,
  userEntitledAssets,
} from '@/lib/mock/commerce';
import { getApplicationLogs } from '@/lib/mock/application-logs';
import { COUNTRIES } from '@/lib/regions';
import {
  getFrontendStudioSpaceGroups,
  type FrontendStudioSpaceGroup,
  type StudioInstanceRow,
} from '@/lib/studios-view';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'capability', label: '能力资产' },
  { id: 'service', label: '服务包' },
] as const;

const ITEMS_PER_PAGE = 5;

type TabId = (typeof TABS)[number]['id'];
type PersonalAssetRow = ReturnType<typeof userEntitledAssets>[number];
type AssignmentOverride = {
  status: 'active';
  runtimeTarget: string;
  studioId: string;
  spaceId: string;
  spaceName: string;
  countryCode: string;
  countryLabel: string;
  assignedAt: string;
};
type StudioAssignmentSelection = {
  studio: StudioInstanceRow;
  spaceId: string;
  spaceName: string;
  countryCode: string;
  countryLabel: string;
};
function categoryOf(row: PersonalAssetRow): TabId {
  if (row.asset.type === 'service_pack') return 'service';
  return 'capability';
}

function purchaseDateOf(row: PersonalAssetRow, index: number) {
  const timestamp = row.entitlement.id.match(/-(\d{13})-/)?.[1];
  if (timestamp) {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(Number(timestamp));
  }
  return ['2026年6月3日', '2026年5月28日', '2026年5月21日', '2026年5月16日'][index % 4];
}

function priceLabelOf(row: PersonalAssetRow) {
  if (row.asset.creditCost > 0 || row.asset.permission === 'free') return marketAssetPriceLabel(row.asset);
  return PERMISSION_LABELS[row.asset.permission];
}

function creatorLabelOf(row: PersonalAssetRow) {
  if (row.asset.type === 'service_pack') {
    return row.asset.provider || row.asset.publisher;
  }
  return row.asset.publisher;
}

function creatorMetaOf(row: PersonalAssetRow) {
  if (row.asset.type === 'service_pack') {
    return (row.asset.serviceRegions || row.asset.regions).join(' · ');
  }
  return MARKET_PRODUCT_TYPE_LABELS[marketProductType(row.asset)];
}

export default function AssetsPage() {
  const [tab, setTab] = useState<TabId>('capability');
  const [assignments, setAssignments] = useState<Record<string, AssignmentOverride>>({});
  const [assigningRow, setAssigningRow] = useState<PersonalAssetRow | null>(null);
  const [assetVersion, setAssetVersion] = useState(0);
  const [assetReady, setAssetReady] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const studioSpaceGroups = useMemo(() => getFrontendStudioSpaceGroups(), []);
  const rows = useMemo(() => {
    const sourceRows = assetReady ? userEntitledAssets() : seededUserEntitledAssets();
    return sourceRows.map(row => {
      const override = assignments[row.entitlement.id];
      if (!override) return row;
      return {
        ...row,
        entitlement: {
          ...row.entitlement,
          status: override.status,
          runtimeTarget: override.runtimeTarget,
        },
      };
    });
  }, [assetReady, assignments, assetVersion]);

  useEffect(() => {
    const sync = () => {
      setAssetReady(true);
      setAssetVersion(current => current + 1);
    };
    sync();
    window.addEventListener('aqara:market-change', sync);
    return () => window.removeEventListener('aqara:market-change', sync);
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(row => {
      if (categoryOf(row) !== tab) return false;
      if (!query.trim()) return true;
      const haystack = [
        row.asset.name,
        row.asset.publisher,
        row.asset.summary,
        ASSET_TYPE_LABELS[row.asset.type],
        MARKET_PRODUCT_TYPE_LABELS[marketProductType(row.asset)],
      ].join(' ').toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [query, rows, tab]);

  const categoryCounts = useMemo(() => {
    return rows.reduce<Record<TabId, number>>(
      (acc, row) => {
        acc[categoryOf(row)] += 1;
        return acc;
      },
      { capability: 0, service: 0 }
    );
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [query, tab]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const applicationHistory = useMemo(() => {
    const initial = getApplicationLogs();

    const overrides = Object.entries(assignments).map(([entitlementId, assignment]) => {
      const boundRow = rows.find(item => item.entitlement.id === entitlementId);
      return {
        id: `override-${entitlementId}-${assignment.assignedAt}`,
        pluginName: boundRow?.asset.name ?? entitlementId,
        pluginVersion: 'manual',
        applicationObject: assignment.studioId,
        applicationStatus: '已应用' as const,
        spaceName: assignment.spaceName,
        countryLabel: assignment.countryLabel,
        time: `${assignment.assignedAt}:00`,
      };
    });

    return [...overrides, ...initial].sort((a, b) => b.time.localeCompare(a.time));
  }, [assignments, rows, assetVersion]);

  const appliedStudioCount = useMemo(() => {
    const studioNames = applicationHistory
      .map(entry => entry.applicationObject)
      .filter(label => label !== 'Aqara Life' && !label.includes('待') && !label.includes('未'));
    return new Set(studioNames).size;
  }, [applicationHistory]);

  const handleAssign = (row: PersonalAssetRow, selection: StudioAssignmentSelection) => {
    setAssignments(current => ({
      ...current,
      [row.entitlement.id]: {
        status: 'active',
        runtimeTarget: selection.studio.name,
        studioId: selection.studio.id,
        spaceId: selection.spaceId,
        spaceName: selection.spaceName,
        countryCode: selection.countryCode,
        countryLabel: selection.countryLabel,
        assignedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      },
    }));
    setAssigningRow(null);
  };

  return (
    <div className="min-h-screen">
      <UserTopBar title="My Assets" />

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm">
              <PackageCheck size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">My Assets</h1>
              <div className="mt-1 text-sm text-slate-500">
                管理已获取的能力资产，并分配到 Studio、项目或客户空间。
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/marketplace" className="btn-hero-secondary">
              Marketplace
            </Link>
            <Link href="/home/assets/logs?demo_as=pro" className="btn-hero-primary">
              授权记录
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/88 px-6 pb-5 pt-5 shadow-[0_18px_56px_rgba(15,23,42,0.06)] lg:px-7">
          <div className="flex flex-col gap-4 border-b border-slate-100 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              {TABS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'border-b-2 pb-2 text-sm transition',
                    tab === item.id
                      ? 'border-slate-950 font-medium text-slate-950'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  )}
                >
                  {item.label} <span className="ml-1 text-slate-400">{categoryCounts[item.id]}</span>
                </button>
              ))}
            </div>
            <div className="relative mb-2 w-full sm:w-64">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="搜索产品、创建者"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-normal text-slate-500">
                  <th className="w-[46%] py-4 pr-4 font-normal">Asset</th>
                  <th className="w-[22%] px-4 py-4 font-normal">创建者 / Provider</th>
                  <th className="w-[12%] px-4 py-4 font-normal">Credits</th>
                  <th className="w-[12%] px-4 py-4 font-normal">交易日期 ↓</th>
                  <th className="w-[8%] py-4 pl-4 text-right font-normal">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyPurchasedState tabLabel={TABS.find(item => item.id === tab)?.label ?? '产品'} />
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, index) => (
                    <AssetListRow
                      key={row.entitlement.id}
                      row={row}
                      creator={creatorLabelOf(row)}
                      creatorMeta={creatorMetaOf(row)}
                      price={priceLabelOf(row)}
                      date={purchaseDateOf(row, (page - 1) * ITEMS_PER_PAGE + index)}
                      onAssign={() => setAssigningRow(row)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <div>
                显示 {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(current => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="h-8 rounded-lg border border-slate-200 px-3 font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  上一页
                </button>
                <span className="min-w-10 text-center text-slate-400">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(current => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="h-8 rounded-lg border border-slate-200 px-3 font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/88 px-6 py-5 shadow-[0_18px_56px_rgba(15,23,42,0.06)] lg:px-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ScrollText size={15} className="text-slate-500" />
              授权记录
              <span className="font-normal text-slate-400">
                {applicationHistory.length} 条 · {appliedStudioCount} 台 Studio
              </span>
            </div>
            <Link href="/home/assets/logs?demo_as=pro" className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-950">
              查看更多
              <ArrowRight size={12} />
            </Link>
          </div>

          {applicationHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
              暂无授权记录。
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[minmax(0,1.5fr)_1.1fr_0.8fr_160px] gap-4 border-b border-slate-100 px-5 py-3 text-xs text-slate-500">
                  <div>Asset</div>
                  <div>应用对象</div>
                  <div>应用状态</div>
                  <div className="text-right">时间</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {applicationHistory.slice(0, 6).map(entry => (
                    <div key={entry.id} className="grid grid-cols-[minmax(0,1.5fr)_1.1fr_0.8fr_160px] gap-4 px-5 py-3 text-xs">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{entry.pluginName}</div>
                        <div className="mt-0.5 truncate text-slate-500">v{entry.pluginVersion}</div>
                      </div>
                      <div className="truncate text-slate-600">{entry.applicationObject}</div>
                      <div className="truncate text-slate-500">{entry.applicationStatus}</div>
                      <div className="text-right text-slate-400">{entry.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {assigningRow && (
          <AssignStudioModal
            row={assigningRow}
            groups={studioSpaceGroups}
            onClose={() => setAssigningRow(null)}
            onAssign={selection => handleAssign(assigningRow, selection)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyPurchasedState({ tabLabel }: { tabLabel: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 text-5xl leading-none text-slate-950">⌁</div>
      <div className="text-base font-semibold text-slate-950">无产品</div>
      <div className="mt-2 text-xs text-slate-500">
        从 Marketplace 获取或兑换的{tabLabel}将显示在此处
      </div>
    </div>
  );
}

function AssetListRow({
  row,
  creator,
  creatorMeta,
  price,
  date,
  onAssign,
}: {
  row: PersonalAssetRow;
  creator: string;
  creatorMeta: string;
  price: string;
  date: string;
  onAssign: () => void;
}) {
  const { asset, entitlement } = row;
  const pending = entitlement.status !== 'active';

  return (
    <tr className="group border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70">
      <td className="py-4 pr-4 align-middle">
        <div className="min-w-0">
          <div className="truncate font-medium text-slate-900">{asset.name}</div>
          <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <span className="truncate">{ASSET_TYPE_LABELS[asset.type]}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="truncate">{entitlement.subjectLabel}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="truncate">{pending ? `待应用 · ${entitlement.runtimeTarget}` : STATUS_LABELS[entitlement.status]}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 align-middle text-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
            {creator.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm text-slate-800">{creator}</div>
            <div className="truncate text-[11px] text-slate-500">{creatorMeta}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 align-middle">
        <div className="text-slate-900">{price}</div>
        <div className="mt-1 truncate text-[11px] text-slate-500">{SOURCE_LABELS[entitlement.source]}</div>
      </td>
      <td className="px-4 py-4 align-middle text-slate-700">{date}</td>
      <td className="py-4 pl-4 align-middle text-right">
        {pending ? (
          <button
            onClick={onAssign}
            className="inline-flex h-8 items-center whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-950"
          >
            {asset.type === 'service_pack' ? '绑定服务' : '分配'}
          </button>
        ) : (
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700">
            <MoreHorizontal size={16} />
          </button>
        )}
      </td>
    </tr>
  );
}

function AssignStudioModal({
  row,
  groups,
  onClose,
  onAssign,
}: {
  row: PersonalAssetRow;
  groups: FrontendStudioSpaceGroup[];
  onClose: () => void;
  onAssign: (selection: StudioAssignmentSelection) => void;
}) {
  const availableCountries = useMemo(() => {
    const countryCodes = Array.from(new Set(groups.map(group => group.country.code)));
    return COUNTRIES.filter(country => countryCodes.includes(country.code));
  }, [groups]);
  const [selectedCountryCode, setSelectedCountryCode] = useState(availableCountries[0]?.code ?? '');
  const spaceOptions = useMemo(
    () => groups.filter(group => group.country.code === selectedCountryCode),
    [groups, selectedCountryCode]
  );
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaceOptions[0]?.workspace.id ?? '');

  useEffect(() => {
    if (!spaceOptions.some(group => group.workspace.id === selectedSpaceId)) {
      setSelectedSpaceId(spaceOptions[0]?.workspace.id ?? '');
    }
  }, [selectedSpaceId, spaceOptions]);

  const selectedSpaceGroup = spaceOptions.find(group => group.workspace.id === selectedSpaceId) ?? spaceOptions[0];
  const studioOptions = selectedSpaceGroup?.items ?? [];
  const [selectedStudioId, setSelectedStudioId] = useState(studioOptions[0]?.id ?? '');
  const isService = row.asset.type === 'service_pack';

  useEffect(() => {
    if (!studioOptions.some(studio => studio.id === selectedStudioId)) {
      setSelectedStudioId(studioOptions[0]?.id ?? '');
    }
  }, [selectedStudioId, studioOptions]);

  const selectedStudio = studioOptions.find(studio => studio.id === selectedStudioId) ?? studioOptions[0];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="w-[min(960px,calc(100vw-32px))] rounded-3xl border border-border bg-bg-elevated p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">{isService ? '绑定服务对象' : '分配授权给 Studio'}</div>
              <div className="mt-1 text-sm text-text-muted">
                {isService ? (
                  <>为 <span className="text-text">{row.asset.name}</span> 选择服务区域、空间和目标 Studio，用于后续履约与授权记录。</>
                ) : (
                  <>为 <span className="text-text">{row.asset.name}</span> 依次选择地区、空间和目标 Studio。Studio Runtime 将负责启用、运行和生命周期管理。</>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-border p-2 text-text-subtle transition hover:border-border-strong hover:text-text"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white/[0.02] p-3">
                <div className="mb-2 text-xs font-medium text-text">地区</div>
                <div className="relative">
                  <select
                    value={selectedCountryCode}
                    onChange={event => setSelectedCountryCode(event.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border bg-white/[0.02] px-4 pr-10 text-sm text-text outline-none transition hover:border-border-strong focus:border-accent/40"
                  >
                    {availableCountries.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white/[0.02] p-3">
                <div className="mb-2 text-xs font-medium text-text">空间</div>
                <div className="relative">
                  <select
                    value={selectedSpaceId}
                    onChange={event => setSelectedSpaceId(event.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-border bg-white/[0.02] px-4 pr-10 text-sm text-text outline-none transition hover:border-border-strong focus:border-accent/40"
                  >
                    {spaceOptions.map(group => (
                      <option key={group.workspace.id} value={group.workspace.id}>
                        {group.workspace.emoji} {group.workspace.name} · {group.items.length} 台 Studio
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white/[0.02] p-3">
              <div className="mb-2 text-xs font-medium text-text">Studio</div>
              <div className="max-h-[320px] space-y-2 overflow-auto pr-1">
                {studioOptions.map(studio => (
                  <button
                    key={studio.id}
                    onClick={() => setSelectedStudioId(studio.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition',
                      selectedStudioId === studio.id
                        ? 'border-accent/40 bg-accent/[0.06]'
                        : 'border-border bg-white/[0.02] hover:border-border-strong'
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-text">{studio.name}</span>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-subtle">
                          {studio.spaceName}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-text-muted">
                        {studio.country.flag} {studio.serverLabel} · {studio.role === 'owner' ? '所有者' : studio.role === 'admin' ? '管理员' : studio.role === 'member' ? '成员' : '访客'}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border',
                        selectedStudioId === studio.id ? 'border-accent bg-accent' : 'border-border'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4">
            <div className="text-xs text-text-muted">
              {selectedStudio && selectedSpaceGroup
                ? `${isService ? '当前将服务于' : '当前将授权给'} ${selectedSpaceGroup.country.flag} ${selectedSpaceGroup.workspace.name} / ${selectedStudio.name}`
                : `请选择完整的目标 ${isService ? '服务对象' : 'Studio'}`}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-hero-secondary">
                取消
              </button>
              <button
                onClick={() =>
                  selectedStudio &&
                  selectedSpaceGroup &&
                  onAssign({
                    studio: selectedStudio,
                    spaceId: selectedSpaceGroup.workspace.id,
                    spaceName: selectedSpaceGroup.workspace.name,
                    countryCode: selectedSpaceGroup.country.code,
                    countryLabel: selectedSpaceGroup.country.label,
                  })
                }
                disabled={!selectedStudio || !selectedSpaceGroup}
                className="btn-hero-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isService ? '确认绑定' : '确认授权'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
