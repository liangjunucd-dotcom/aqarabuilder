'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, CircleHelp, Clock3, PackageCheck, Search } from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { getApplicationLogs } from '@/lib/mock/application-logs';

const DEFAULT_START = '2026-06-03 00:00:00';
const DEFAULT_END = '2026-06-03 23:59:59';

function toTime(value: string) {
  const parsed = Date.parse(value.replace(' ', 'T'));
  return Number.isNaN(parsed) ? null : parsed;
}

export default function AssetApplicationLogsPage() {
  const logs = useMemo(() => getApplicationLogs(), []);
  const pluginOptions = useMemo(() => Array.from(new Set(logs.map(log => log.pluginName))), [logs]);
  const [pluginName, setPluginName] = useState('');
  const [versionQuery, setVersionQuery] = useState('');
  const [startTime, setStartTime] = useState(DEFAULT_START);
  const [endTime, setEndTime] = useState(DEFAULT_END);

  const filtered = useMemo(() => {
    const start = toTime(startTime);
    const end = toTime(endTime);
    const version = versionQuery.trim().toLowerCase();

    return logs.filter(log => {
      if (pluginName && log.pluginName !== pluginName) return false;
      if (version && !log.pluginVersion.toLowerCase().includes(version)) return false;
      const current = toTime(log.time);
      if (current !== null && start !== null && current < start) return false;
      if (current !== null && end !== null && current > end) return false;
      return true;
    });
  }, [endTime, logs, pluginName, startTime, versionQuery]);

  return (
    <div className="min-h-screen">
      <UserTopBar title="应用日志" />

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/88 px-7 pb-6 pt-7 shadow-[0_18px_56px_rgba(15,23,42,0.06)] lg:px-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <PackageCheck size={17} />
              </div>
              <div>
                <h1 className="text-[26px] font-semibold leading-tight tracking-normal">应用日志</h1>
                <div className="mt-1 text-xs text-slate-500">
                  查询能力资产的应用对象、应用状态与执行时间
                </div>
              </div>
            </div>
            <Link href="/home/assets?demo_as=pro" className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950">
              <ArrowLeft size={12} />
              返回已购买
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-[180px]">
              <select
                value={pluginName}
                onChange={event => setPluginName(event.target.value)}
                className="h-9 w-full appearance-none rounded border border-slate-200 bg-white px-3 pr-9 text-xs text-slate-700 outline-none transition focus:border-slate-400"
              >
                <option value="">请选择</option>
                {pluginOptions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative w-full lg:w-[300px]">
              <input
                value={versionQuery}
                onChange={event => setVersionQuery(event.target.value)}
                placeholder="请输入版本号"
                className="h-9 w-full rounded border border-slate-200 bg-white px-3 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
              <Search size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex h-9 w-full min-w-0 items-center rounded border border-slate-200 bg-white px-3 text-xs text-slate-700 lg:w-[400px]">
              <Clock3 size={14} className="mr-2 shrink-0 text-slate-400" />
              <input
                value={startTime}
                onChange={event => setStartTime(event.target.value)}
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
              <span className="px-3 text-slate-500">-</span>
              <input
                value={endTime}
                onChange={event => setEndTime(event.target.value)}
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
            </div>

            <CircleHelp size={15} className="hidden text-slate-400 lg:block" />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/88 px-7 pb-8 pt-1 shadow-[0_18px_56px_rgba(15,23,42,0.06)] lg:px-9">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400">
                  <th className="w-[30%] px-4 py-4 font-normal">Asset</th>
                  <th className="w-[28%] px-4 py-4 font-normal">应用对象</th>
                  <th className="w-[18%] px-4 py-4 font-normal">应用状态</th>
                  <th className="w-[24%] px-4 py-4 text-right font-normal">时间</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex min-h-[360px] items-center justify-center text-xs text-slate-400">
                        无数据
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(log => (
                    <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                      <td className="px-4 py-4 align-middle">
                        <div className="truncate font-medium text-slate-900">{log.pluginName}</div>
                        <div className="mt-1 truncate text-xs text-slate-400">版本号 {log.pluginVersion}</div>
                      </td>
                      <td className="px-4 py-4 align-middle font-mono text-xs text-slate-700">{log.applicationObject}</td>
                      <td className="px-4 py-4 align-middle text-slate-700">{log.applicationStatus}</td>
                      <td className="px-4 py-4 text-right align-middle font-mono text-xs text-slate-500">{log.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/88 px-7 py-4 text-xs text-slate-500 shadow-[0_18px_56px_rgba(15,23,42,0.06)] lg:px-9">
          <Link href="/home/assets?demo_as=pro" className="inline-flex items-center gap-1 font-medium text-slate-600 transition hover:text-slate-950">
            <ArrowLeft size={12} />
            返回已购买
          </Link>
          <span>当前显示 {filtered.length} / {logs.length} 条</span>
        </div>
      </main>
    </div>
  );
}
