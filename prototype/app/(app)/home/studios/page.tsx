'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Copy,
  Cpu,
  Globe2,
  LayoutGrid,
  LayoutList,
  MoreHorizontal,
  RefreshCw,
  Settings2,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { COUNTRIES } from '@/lib/regions';
import type { Workspace, WorkspaceRole } from '@/lib/mock/studios';
import { HEALTH_META, getFrontendWorkspaces } from '@/lib/mock/studios';
import { cn } from '@/lib/utils';
import { getAllFrontendStudioInstances, type StudioInstanceRow } from '@/lib/studios-view';

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function roleLabel(role: WorkspaceRole) {
  if (role === 'owner') return '所有者';
  if (role === 'admin') return '管理员';
  if (role === 'member') return '成员';
  return '访客';
}

function CountryFilter({
  value,
  onChange,
  counts,
}: {
  value: string | 'all';
  onChange: (v: string | 'all') => void;
  counts: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const selected =
    value === 'all'
      ? { label: '全部地区', flag: '🌐' }
      : COUNTRIES.find(c => c.code === value) ?? { label: '全部地区', flag: '🌐' };

  return (
    <motion.div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex min-w-[220px] items-center gap-2.5 rounded-xl border border-[#e3ded6] bg-white px-3 py-2 text-left shadow-sm shadow-black/[0.025] transition hover:border-[#cfc6ba]"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e8e3dc] bg-[#f7f5f2] text-base">
          {selected.flag}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#202020]">{selected.label}</p>
          <p className="flex items-center gap-1 text-2xs text-[#8a8176]">
            <Globe2 size={10} />
            当前地区
          </p>
        </div>
        <ChevronDown size={14} className={cn('shrink-0 text-[#8a8176] transition', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#e3ded6] bg-white shadow-2xl shadow-black/10"
            >
              <button
                type="button"
                onClick={() => {
                  onChange('all');
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left text-[#202020] hover:bg-[#f7f5f2]',
                  value === 'all' && 'bg-[#f0f6ff]'
                )}
              >
                <span className="text-lg">🌐</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">全部地区</p>
                  <p className="text-2xs text-[#8a8176]">所有家庭下的 Studio</p>
                </div>
                {value === 'all' && <Check size={13} className="text-blue-600" />}
              </button>
              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.code);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left text-[#202020] hover:bg-[#f7f5f2]',
                    value === country.code && 'bg-[#f0f6ff]'
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{country.label}</p>
                    <p className="text-2xs text-[#8a8176]">
                      {counts[country.code] ? `${counts[country.code]} 台 Studio` : '暂无 Studio'}
                    </p>
                  </div>
                  {value === country.code && <Check size={13} className="text-blue-600" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function HomeSwitcher({
  spaces,
  selectedId,
  onChange,
}: {
  spaces: Workspace[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = spaces.find(space => space.id === selectedId) ?? spaces[0];

  return (
    <motion.div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex min-w-[260px] items-center gap-3 rounded-xl border border-[#e3ded6] bg-white px-3 py-2 text-left shadow-sm shadow-black/[0.025] transition hover:border-[#cfc6ba]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#202020] text-white">
          <span className="text-lg">{selected?.emoji ?? '🏠'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#202020]">{selected?.name ?? '我的家庭'}</p>
          <p className="text-2xs text-[#8a8176]">{selected ? roleLabel(selected.currentRole) : '未选择'}</p>
        </div>
        <ChevronDown size={14} className={cn('shrink-0 text-[#8a8176] transition', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-xl border border-[#e3ded6] bg-white shadow-2xl shadow-black/10"
            >
              <div className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a8176]">
                家庭
              </div>
              <div className="px-2 pb-2">
                {spaces.map(space => (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => {
                      onChange(space.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition',
                      selectedId === space.id ? 'bg-[#202020] text-white' : 'text-[#202020] hover:bg-[#f7f5f2]'
                    )}
                  >
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl border shrink-0',
                      selectedId === space.id
                        ? 'border-white/20 bg-white/12'
                        : 'border-[#e8e3dc] bg-[#f7f5f2]'
                    )}>
                      <span className="text-lg">{space.emoji}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{space.name}</p>
                      <p className={cn(
                        'text-2xs',
                        selectedId === space.id ? 'text-white/75' : 'text-[#8a8176]'
                      )}>
                        {roleLabel(space.currentRole)}
                      </p>
                    </div>
                    {selectedId === space.id && <Check size={14} />}
                  </button>
                ))}
              </div>
              <div className="border-t border-[#eeeae5]" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-[#6f675f] transition hover:bg-[#f7f5f2] hover:text-[#202020]"
              >
                <Settings2 size={14} />
                <span className="text-sm">Manage Spaces</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StudioTable({
  rows,
  copied,
  onCopy,
}: {
  rows: StudioInstanceRow[];
  copied: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#eeeae5] bg-[#faf9f7] text-2xs uppercase tracking-wider text-[#8a8176]">
            <th className="px-4 py-3 font-medium">设备名称</th>
            <th className="px-4 py-3 font-medium">设备 ID</th>
            <th className="px-4 py-3 font-medium">IP</th>
            <th className="px-4 py-3 font-medium">最后活跃</th>
            <th className="px-4 py-3 font-medium text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const health = HEALTH_META[row.health];
            return (
              <tr key={row.id} className="border-b border-[#eeeae5] transition hover:bg-[#faf9f7] last:border-0">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e8e3dc] bg-[#f7f5f2]">
                      <Cpu size={17} className="text-[#202020]" />
                      <span
                        className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                        style={{ backgroundColor: health.color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#202020]">{row.name}</p>
                      <p className="truncate text-2xs text-[#8a8176]">
                        {row.spaceName} · {roleLabel(row.role)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="num font-mono text-2xs text-[#6f675f]">{row.deviceId}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="num font-mono text-2xs text-[#6f675f]">{row.ipLocal}</span>
                    <button
                      type="button"
                      onClick={() => onCopy(row.ipLocal, `ip-${row.id}`)}
                      className="rounded p-1 text-[#8a8176] hover:bg-[#f1efeb] hover:text-[#202020]"
                    >
                      {copied === `ip-${row.id}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-2xs text-[#6f675f] num">
                  {row.lastSeenIso}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href="/studio/home"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded bg-[#202020] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      进入
                    </a>
                    <button
                      type="button"
                      className="rounded p-1.5 text-[#8a8176] hover:bg-[#f1efeb] hover:text-[#202020]"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StudioGrid({
  rows,
  copied,
  onCopy,
}: {
  rows: StudioInstanceRow[];
  copied: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(row => {
        const health = HEALTH_META[row.health];
        return (
          <div
            key={row.id}
            className="group rounded-xl border border-[#e8e5df] bg-white p-4 shadow-sm shadow-black/[0.02] transition hover:-translate-y-0.5 hover:border-[#d5cec4] hover:shadow-md hover:shadow-black/[0.05]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#202020] text-white shadow-sm">
                  <Cpu size={18} />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: health.color }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#202020]">{row.name}</p>
                  <p className="mt-0.5 text-2xs text-[#8a8176]">
                    {row.spaceEmoji} {row.spaceName} · {roleLabel(row.role)}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[#e8e3dc] bg-[#f7f5f2] px-2 py-1 text-2xs font-medium text-[#6f675f]">
                {row.country.flag} {row.country.label}
              </span>
            </div>

            <div className="mt-4 space-y-2 rounded-lg border border-[#eeeae5] bg-[#faf9f7] p-3">
              <div className="flex items-center justify-between gap-3 text-2xs">
                <span className="text-[#8a8176]">设备 ID</span>
                <span className="num truncate font-mono text-[#6f675f]">{row.deviceId}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-2xs">
                <span className="text-[#8a8176]">IP</span>
                <button
                  type="button"
                  onClick={() => onCopy(row.ipLocal, `grid-ip-${row.id}`)}
                  className="group/copy inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[#6f675f] transition hover:bg-white hover:text-[#202020]"
                >
                  {row.ipLocal}
                  {copied === `grid-ip-${row.id}` ? (
                    <Check size={11} className="text-emerald-600" />
                  ) : (
                    <Copy size={11} className="text-[#a29a91] group-hover/copy:text-[#202020]" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 text-2xs">
                <span className="text-[#8a8176]">最后活跃</span>
                <span className="num text-[#6f675f]">{row.lastSeenIso}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-[#6f675f]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: health.color }} />
                {health.label}
              </span>
              <a
                href="/studio/home"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center rounded bg-[#202020] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                进入
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MyStudiosPage() {
  const spaces = useMemo(() => getFrontendWorkspaces(), []);
  const rows = useMemo(() => getAllFrontendStudioInstances(), []);
  const [countryFilter, setCountryFilter] = useState<string | 'all'>('all');
  const [selectedSpaceId, setSelectedSpaceId] = useState(() => spaces[0]?.id ?? 'all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [copied, setCopied] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.country.code] = (counts[row.country.code] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const selectedSpace = spaces.find(space => space.id === selectedSpaceId) ?? spaces[0];

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchCountry = countryFilter === 'all' || row.country.code === countryFilter;
      const matchSpace = !selectedSpace || selectedSpace.studioIds.includes(row.id);
      return matchCountry && matchSpace;
    });
  }, [countryFilter, rows, selectedSpace]);

  const handleCopy = (text: string, id: string) => {
    copyText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#202020]">
      <UserTopBar title="我的空间" />

      <main className="mx-auto max-w-6xl px-6 py-7">
        <section className="mb-5 rounded border border-[#e8e5df] bg-white px-5 py-4 shadow-sm shadow-black/[0.02]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#202020]">Aqara Studio</h1>
              <p className="mt-1 text-sm text-[#777]">
                查看你可访问的本地空间智能 OS，并把已购买的能力分配到对应 Studio。
              </p>
            </div>
            <Link
              href="/home/assets"
              className="inline-flex h-9 items-center gap-2 rounded border border-[#202020] bg-white px-3 text-sm font-semibold text-[#202020] shadow-sm transition hover:bg-[#202020] hover:text-white"
            >
              授权与插件
              <Settings2 size={14} />
            </Link>
          </div>
        </section>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <HomeSwitcher spaces={spaces} selectedId={selectedSpaceId} onChange={setSelectedSpaceId} />
            <p className="mt-2 text-xs text-[#777]">
              切换家庭后，可查看当前家庭下的 Aqara Studio。这里只展示你作为所有者、管理员、成员或访客可访问的运行端。
            </p>
          </div>
          <CountryFilter value={countryFilter} onChange={setCountryFilter} counts={countryCounts} />
        </div>

        <div className="overflow-hidden rounded border border-[#e8e5df] bg-white shadow-sm shadow-black/[0.02]">
          <div className="flex items-center justify-between border-b border-[#eeeae5] bg-[#faf9f7] px-4 py-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#202020]">
                <Cpu size={15} className="text-[#777]" />
                Studio 列表
                <span className="num text-2xs font-normal text-[#8a8176]">({filteredRows.length})</span>
              </div>
              <div className="mt-1 text-2xs text-[#8a8176]">
                {selectedSpace?.name ?? '未选择家庭'} · {selectedSpace ? roleLabel(selectedSpace.currentRole) : '未设置角色'}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-md border p-2 transition',
                  viewMode === 'list'
                    ? 'border-[#202020] bg-[#202020] text-white'
                    : 'border-[#e3ded6] bg-white text-[#8a8176] hover:border-[#cfc6ba] hover:text-[#202020]'
                )}
                title="列表"
              >
                <LayoutList size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-md border p-2 transition',
                  viewMode === 'grid'
                    ? 'border-[#202020] bg-[#202020] text-white'
                    : 'border-[#e3ded6] bg-white text-[#8a8176] hover:border-[#cfc6ba] hover:text-[#202020]'
                )}
                title="网格"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setRefreshing(true);
                  setTimeout(() => setRefreshing(false), 800);
                }}
                className="ml-1 rounded-md border border-[#e3ded6] bg-white p-2 text-[#8a8176] transition hover:border-[#cfc6ba] hover:text-[#202020]"
                title="刷新"
              >
                <RefreshCw size={14} className={cn(refreshing && 'animate-spin')} />
              </button>
            </div>
          </div>

          {filteredRows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Cpu size={32} className="mx-auto mb-3 text-[#bbb4ab]" />
              <p className="text-sm text-[#6f675f]">当前家庭下暂无 Aqara Studio</p>
              <p className="mt-1 text-2xs text-[#8a8176]">
                你可以切换到其他家庭，或在本地完成绑定后再回到这里查看。
              </p>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <StudioGrid rows={filteredRows} copied={copied} onCopy={handleCopy} />
            ) : (
              <StudioTable rows={filteredRows} copied={copied} onCopy={handleCopy} />
            )
          )}
        </div>

        <div className="mt-4 text-right text-xs text-[#8a8176]">
          Studio Web 在本地运行；这里仅呈现你账号可访问的 Studio 索引与授权分配入口。
        </div>
      </main>
    </div>
  );
}
