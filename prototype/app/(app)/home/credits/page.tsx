'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Download,
  FileText,
  Gift,
  GraduationCap,
  PackageCheck,
  ReceiptText,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { getUsageCenterPool } from '@/lib/ai-pool';
import { CREDIT_LEDGER } from '@/lib/mock/commerce';
import { planForRole } from '@/lib/plans';
import { useRole } from '@/lib/role';
import { cn, formatNumber } from '@/lib/utils';

const TYPE_TABS = [
  { id: 'all', label: '全部' },
  { id: 'grant', label: '发放' },
  { id: 'usage', label: '消耗' },
  { id: 'redeem', label: '兑换' },
] as const;

const CATEGORY_LABELS = {
  ai: 'AI',
  design: '设计',
  entitlement: '授权',
  ops: '奖励',
} as const;

const EARN_TASKS = [
  { title: '完成 Academy 认证', reward: 120, progress: 72, icon: GraduationCap },
  { title: '发布可 Remix 方案', reward: 180, progress: 46, icon: PackageCheck },
  { title: '完善个人主页', reward: 60, progress: 88, icon: CheckCircle2 },
  { title: '提交插件或模板', reward: 240, progress: 28, icon: Wand2 },
];

const REDEEM_ITEMS = [
  { title: 'Personal Add-on', desc: '补充到个人账号，可用于 Life App 与 Builder', cost: 500, tag: '个人' },
  { title: 'Team Shared Add-on', desc: '补充到组织池，由团队成员共享使用', cost: 3000, tag: '团队' },
  { title: '3D Burst Pack', desc: '适合短期高频 3D / 视觉生成', cost: 800, tag: '视觉' },
  { title: 'Project Review Pack', desc: '适合大型项目的方案评审和图纸解析', cost: 1200, tag: '项目' },
];

type TypeTab = (typeof TYPE_TABS)[number]['id'];

export default function PersonalCreditsPage() {
  const { role, mounted } = useRole();
  const currentPlan = planForRole(mounted ? role : 'builder');
  const usagePool = getUsageCenterPool({ planId: currentPlan.id, workspaceId: 'personal', workspaceName: 'Personal' });
  const [type, setType] = useState<TypeTab>('all');
  const ledger = CREDIT_LEDGER;

  const filtered = useMemo(() => ledger.filter(entry => type === 'all' || entry.type === type), [ledger, type]);
  const monthlyGrant = ledger.filter(entry => entry.type === 'grant').reduce((sum, entry) => sum + entry.amount, 0);
  const monthlyUsage = Math.abs(ledger.filter(entry => entry.type === 'usage').reduce((sum, entry) => sum + entry.amount, 0));
  const monthlyRedeem = Math.abs(ledger.filter(entry => entry.type === 'redeem').reduce((sum, entry) => sum + entry.amount, 0));
  const quotaTotal = usagePool.buckets.reduce((sum, bucket) => sum + bucket.limit, 0);
  const quotaUsed = usagePool.buckets.reduce((sum, bucket) => sum + bucket.used, 0);
  const quotaRemaining = Math.max(quotaTotal - quotaUsed, 0);
  const balance = quotaRemaining + (usagePool.welcomeCredits ?? 0);
  const usedPercent = quotaTotal > 0 ? Math.round((quotaUsed / quotaTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <UserTopBar title="Credits" />

      <main className="mx-auto max-w-7xl px-6 py-6">
        <section className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white shadow-sm shadow-amber-100/70">
            <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-xl shadow-amber-200/80">
                <Coins size={44} />
              </div>
              <div className="mt-5 text-5xl font-semibold tracking-tight text-slate-950">{formatNumber(balance)}</div>
              <div className="mt-2 text-sm text-slate-500">Plan Credits</div>
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <MiniMetric label={usagePool.periodLabel} value={`${formatNumber(quotaRemaining)} 剩余`} />
                <MiniMetric label="当前计划" value={usagePool.planName} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {EARN_TASKS.map(task => (
              <TaskCard key={task.title} task={task} />
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Credits Usage</h1>
                <div className="mt-1 text-sm text-slate-500">Credits 用于 AI 对话、户型解析、方案生成和 3D / 视觉生成。</div>
              </div>
              <Link href="/marketplace" className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-blue-700">
                去市场
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-900">{usagePool.periodLabel}</span>
                <span className="text-slate-500">{formatNumber(quotaUsed)} / {formatNumber(quotaTotal)}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-400" style={{ width: `${usedPercent}%` }} />
              </div>
              <div className="mt-2 text-xs text-slate-500">{usagePool.periodStart} 起{usagePool.welcomeCredits ? ` · Welcome +${usagePool.welcomeCredits}` : ''}</div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-950">Add-on Credits</div>
              <div className="text-xs text-slate-500">购买后补充到账号或组织 Credit Pool</div>
            </div>

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {REDEEM_ITEMS.map(item => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{item.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.desc}</div>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{item.tag}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                      <Coins size={14} />
                      {item.cost} Credits
                    </div>
                    <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:border-slate-950">
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Sparkles size={16} className="text-blue-600" />
                消耗分类
              </div>
              <div className="mt-4 space-y-3">
                {usagePool.buckets.map(bucket => {
                  const width = bucket.limit ? Math.min(100, Math.round((bucket.used / bucket.limit) * 100)) : 52;
                  return (
                    <div key={bucket.category}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{bucket.label}</span>
                        <span className="font-semibold text-slate-900">{bucket.used}{bucket.limit ? `/${bucket.limit}` : ''}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-slate-950" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ReceiptText size={16} className="text-blue-600" />
                本月账单
              </div>
              <div className="mt-4 space-y-3">
                <SummaryRow label="发放" value={`+${formatNumber(monthlyGrant)}`} positive />
                <SummaryRow label="AI / 设计消耗" value={`-${formatNumber(monthlyUsage)}`} />
                <SummaryRow label="Add-on Credits" value="Credit Pack records" />
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <FileText size={16} className="text-blue-600" />
              交易记录
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {TYPE_TABS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setType(item.id)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                    type === item.id
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'
                  )}
                >
                  {item.label}
                </button>
              ))}
              <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900">
                <Download size={12} />
                导出
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  <th className="px-5 py-3 font-semibold">日期</th>
                  <th className="px-5 py-3 font-semibold">类型</th>
                  <th className="px-5 py-3 font-semibold">名称</th>
                  <th className="px-5 py-3 font-semibold">分类</th>
                  <th className="px-5 py-3 text-right font-semibold">Credits</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{entry.date}</td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        entry.type === 'grant' ? 'bg-emerald-50 text-emerald-700' : entry.type === 'usage' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      )}>
                        {entry.type === 'grant' ? '发放' : entry.type === 'usage' ? '消耗' : '兑换'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{entry.title}</div>
                      {entry.note ? <div className="mt-1 text-xs text-slate-400">{entry.note}</div> : null}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{CATEGORY_LABELS[entry.category]}</td>
                    <td className={cn('px-5 py-4 text-right font-semibold', entry.amount > 0 ? 'text-emerald-600' : 'text-slate-950')}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-amber-200/70 bg-white/80 px-3 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function TaskCard({ task }: { task: (typeof EARN_TASKS)[number] }) {
  const Icon = task.icon;
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Icon size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-950">{task.title}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                <Gift size={12} />
              +{task.reward} Credits
            </div>
          </div>
        </div>
        <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-950">
          查看
        </button>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-400" style={{ width: `${task.progress}%` }} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={cn('text-sm font-semibold', positive ? 'text-emerald-600' : 'text-slate-950')}>{value}</span>
    </div>
  );
}
