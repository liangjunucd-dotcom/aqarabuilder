'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Trophy,
  TrendingUp,
  TrendingDown,
  Crown,
  Medal,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  Shield,
  Target,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────
//  Performance · Pro 自己的 KPI / 平台评级 / 行业排名
//  对应 docs/01-product/builder-pro-delivery-flow.md §5
// ─────────────────────────────────────────────────────────────────────

type Tier = 'bronze' | 'silver' | 'gold';

interface TierMeta {
  label: string;
  color: string;
  icon: any;
  threshold: { nps: number; firstPass: number; delivered: number };
  perks: string[];
}

const TIERS: Record<Tier, TierMeta> = {
  bronze: {
    label: 'Bronze',
    color: '#a16207',
    icon: Award,
    threshold: { nps: 4.0, firstPass: 80, delivered: 0 },
    perks: ['Verified ✓ 标识', '基础曝光', '自找客户'],
  },
  silver: {
    label: 'Silver',
    color: '#94a3b8',
    icon: Medal,
    threshold: { nps: 4.5, firstPass: 90, delivered: 20 },
    perks: ['精准 Lead 派发', '客户优先匹配', '社区帖优先曝光'],
  },
  gold: {
    label: 'Gold',
    color: '#eab308',
    icon: Crown,
    threshold: { nps: 4.8, firstPass: 95, delivered: 50 },
    perks: ['高净值 Lead 优先派发', 'Aqara 联合品牌', '专属客户经理', '保险费率优惠 30%'],
  },
};

interface KpiSpec {
  id: string;
  label: string;
  value: string;
  target: string;
  trend: 'up' | 'down' | 'flat';
  delta: string;
  good: boolean;
  spark?: number[];
  hint: string;
  icon: any;
}

const KPIS: KpiSpec[] = [
  {
    id: 'response',
    label: '响应时长',
    value: '0.8h',
    target: '≤ 24h',
    trend: 'down',
    delta: '-32%',
    good: true,
    spark: [3.2, 2.8, 2.1, 1.5, 1.2, 0.9, 0.8],
    hint: 'Lead → Accepted 平均时长',
    icon: Clock,
  },
  {
    id: 'firstPass',
    label: '装机一次通过率',
    value: '93%',
    target: '≥ 90%',
    trend: 'up',
    delta: '+4%',
    good: true,
    spark: [82, 84, 85, 88, 89, 91, 93],
    hint: 'Installing 阶段不被打回的占比',
    icon: CheckCircle2,
  },
  {
    id: 'designRollback',
    label: '设计回退率',
    value: '8%',
    target: '≤ 15%',
    trend: 'down',
    delta: '-3%',
    good: true,
    spark: [16, 14, 12, 11, 10, 9, 8],
    hint: '客户预览阶段被打回重做的占比',
    icon: AlertTriangle,
  },
  {
    id: 'acceptTime',
    label: '客户验收时长',
    value: '14h',
    target: '≤ 24h',
    trend: 'flat',
    delta: '0%',
    good: true,
    spark: [16, 15, 14, 14, 14, 14, 14],
    hint: 'Pending-Acceptance → Delivered 平均时长',
    icon: Target,
  },
  {
    id: 'warrantyTickets',
    label: '保修期工单数 / 项目',
    value: '0.6',
    target: '≤ 1.0',
    trend: 'down',
    delta: '-25%',
    good: true,
    spark: [1.4, 1.2, 1.0, 0.9, 0.8, 0.7, 0.6],
    hint: '装机后 90 天内平均工单',
    icon: Shield,
  },
  {
    id: 'nps',
    label: '客户 NPS',
    value: '4.86',
    target: '≥ 4.5',
    trend: 'up',
    delta: '+0.06',
    good: true,
    spark: [4.5, 4.6, 4.7, 4.7, 4.8, 4.85, 4.86],
    hint: '客户在 Life App 评分 + 评论',
    icon: Star,
  },
];

interface LeaderItem {
  rank: number;
  name: string;
  city: string;
  tier: Tier;
  delivered: number;
  nps: number;
  growth: number;
  isMe?: boolean;
}

const LEADERBOARD: LeaderItem[] = [
  { rank: 1, name: 'Lin Chen',     city: '上海', tier: 'gold',   delivered: 142, nps: 4.92, growth: 12 },
  { rank: 2, name: 'Studio Hangzhou', city: '杭州', tier: 'gold',delivered: 118, nps: 4.89, growth: 8  },
  { rank: 3, name: 'Smart Munich',  city: 'München', tier: 'gold', delivered: 96,  nps: 4.88, growth: 24 },
  { rank: 4, name: 'Jun L.',        city: '上海', tier: 'silver', delivered: 47,  nps: 4.86, growth: 18, isMe: true },
  { rank: 5, name: 'Wang K.',       city: '北京', tier: 'silver', delivered: 42,  nps: 4.83, growth: 5  },
  { rank: 6, name: 'Aqara Tokyo',   city: '東京', tier: 'silver', delivered: 38,  nps: 4.81, growth: 9  },
];

export default function PerformancePage() {
  const myTier: Tier = 'silver';
  const nextTier: Tier = 'gold';
  const me = LEADERBOARD.find(l => l.isMe)!;

  const progress = useMemo(() => {
    const cur = TIERS[myTier].threshold;
    const next = TIERS[nextTier].threshold;
    const my = { nps: 4.86, firstPass: 93, delivered: me.delivered };
    return [
      { key: 'NPS',          have: my.nps,       need: next.nps,       suffix: '',  pct: Math.min(100, Math.round(((my.nps - cur.nps) / (next.nps - cur.nps)) * 100)) },
      { key: '一次通过',      have: my.firstPass, need: next.firstPass, suffix: '%', pct: Math.min(100, Math.round(((my.firstPass - cur.firstPass) / (next.firstPass - cur.firstPass)) * 100)) },
      { key: '累计交付',      have: my.delivered, need: next.delivered, suffix: '',  pct: Math.min(100, Math.round((my.delivered / next.delivered) * 100)) },
    ];
  }, [myTier, nextTier, me.delivered]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <BarChart3 size={20} className="text-accent-glow" />
              KPI · Performance
            </h1>
            <p className="text-2xs text-text-muted mt-1">
              Aqara 全球 Verified Pro 质量看板 · 每季度自动重算 Tier
            </p>
          </div>
          <Link href="/docs/builder-pro-delivery-flow" className="text-2xs text-text-muted hover:text-text inline-flex items-center gap-1">
            评分规则 <ExternalLink size={9} />
          </Link>
        </div>

        {/* Tier Hero */}
        <TierHero myTier={myTier} nextTier={nextTier} progress={progress} me={me} />

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {KPIS.map((k, i) => (
            <KpiCard key={k.id} kpi={k} index={i} />
          ))}
        </div>

        {/* Leaderboard + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <Leaderboard items={LEADERBOARD} />
          </div>
          <div className="space-y-5">
            <InsightCard />
            <TierBenefits myTier={myTier} nextTier={nextTier} />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────── Tier Hero ───────────────────────────

function TierHero({
  myTier, nextTier, progress, me,
}: {
  myTier: Tier; nextTier: Tier;
  progress: { key: string; have: number; need: number; suffix: string; pct: number }[];
  me: LeaderItem;
}) {
  const tier = TIERS[myTier];
  const next = TIERS[nextTier];
  const TierIcon = tier.icon;
  const NextIcon = next.icon;

  return (
    <div className="card overflow-hidden mb-6">
      <div className="relative px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 当前等级 */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border"
            style={{ background: `${tier.color}15`, borderColor: `${tier.color}40` }}
          >
            <TierIcon size={28} style={{ color: tier.color }} />
          </div>
          <div className="min-w-0">
            <div className="text-2xs text-text-muted">当前等级</div>
            <div className="text-xl font-semibold flex items-center gap-2" style={{ color: tier.color }}>
              {tier.label}
              <span className="text-2xs text-text-muted font-normal">{me.city} · 第 {me.rank} 位</span>
            </div>
            <div className="text-2xs text-text-muted mt-0.5">
              累计交付 <span className="num text-text">{me.delivered}</span> · NPS <span className="num text-text">{me.nps}</span>
            </div>
          </div>
        </div>

        {/* 升级进度 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xs text-text-muted">距 {next.label} 升级</div>
            <div className="text-2xs flex items-center gap-1.5" style={{ color: next.color }}>
              <NextIcon size={12} />
              <span className="font-medium">{next.label}</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {progress.map(p => (
              <div key={p.key}>
                <div className="flex items-center justify-between text-2xs mb-1">
                  <span className="text-text-muted">{p.key}</span>
                  <span className="num">
                    <span className="text-text">{p.have}{p.suffix}</span>
                    <span className="text-text-subtle"> / {p.need}{p.suffix}</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: next.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── KPI Card ───────────────────────────

function KpiCard({ kpi, index }: { kpi: KpiSpec; index: number }) {
  const Icon = kpi.icon;
  const TrendIcon = kpi.trend === 'up' ? ArrowUp : kpi.trend === 'down' ? ArrowDown : Minus;
  const trendColor = kpi.good ? 'text-success' : 'text-warning';

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="card p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} className="text-accent-glow" />
        <span className="text-2xs text-text-muted">{kpi.label}</span>
        <span className={cn('ml-auto text-2xs num inline-flex items-center gap-0.5', trendColor)}>
          <TrendIcon size={10} />
          {kpi.delta}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold num">{kpi.value}</div>
          <div className="text-2xs text-text-subtle mt-0.5">目标 {kpi.target}</div>
        </div>
        {kpi.spark && <Sparkline data={kpi.spark} good={kpi.good} />}
      </div>
      <div className="mt-2.5 pt-2.5 border-t border-border/60 text-2xs text-text-muted leading-snug">
        {kpi.hint}
      </div>
    </motion.div>
  );
}

function Sparkline({ data, good }: { data: number[]; good: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  const color = good ? '#10b981' : '#f59e0b';

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={color}
        fillOpacity={0.1}
      />
    </svg>
  );
}

// ─────────────────────────── Leaderboard ───────────────────────────

function Leaderboard({ items }: { items: LeaderItem[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Trophy size={14} className="text-warning" />
        <span className="text-sm font-semibold">Pro 排行榜</span>
        <span className="text-2xs text-text-muted ml-auto">本季度 · 全球 Top</span>
      </div>
      <div>
        {items.map(it => {
          const tierMeta = TIERS[it.tier];
          const TierIcon = tierMeta.icon;
          return (
            <div
              key={it.rank}
              className={cn(
                'flex items-center gap-3 px-5 py-3 border-b border-border/60 last:border-b-0',
                it.isMe && 'bg-accent/[0.06] border-l-2 border-l-accent'
              )}
            >
              <div className="w-7 text-center">
                <span className={cn(
                  'text-sm font-semibold num',
                  it.rank === 1 && 'text-warning',
                  it.rank === 2 && 'text-text',
                  it.rank === 3 && 'text-amber-700',
                  it.rank > 3 && 'text-text-muted',
                )}>
                  #{it.rank}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/20 to-accent2/20 border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-2xs font-medium">{it.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-medium truncate">{it.name}</span>
                  {it.isMe && <span className="text-2xs px-1 py-0.5 rounded bg-accent/20 text-accent-glow">我</span>}
                  <TierIcon size={10} style={{ color: tierMeta.color }} />
                </div>
                <div className="text-2xs text-text-muted mt-0.5">{it.city}</div>
              </div>
              <div className="text-right">
                <div className="text-2xs num">{it.delivered} 项目</div>
                <div className="text-2xs text-text-muted">NPS {it.nps}</div>
              </div>
              <div className="w-12 text-right">
                <span className="text-2xs num text-success inline-flex items-center gap-0.5">
                  <ArrowUp size={9} />
                  {it.growth}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────── Insight Card ───────────────────────────

function InsightCard() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={13} className="text-warning" />
        <span className="text-2xs uppercase tracking-wide text-text-muted font-medium">本周建议</span>
      </div>
      <div className="space-y-3">
        <div className="text-2xs leading-snug">
          <span className="font-medium text-success">✓ 强项：</span>
          <span className="text-text-muted">响应时长持续优化，连续 4 周下降。</span>
        </div>
        <div className="text-2xs leading-snug">
          <span className="font-medium text-warning">! 待改进：</span>
          <span className="text-text-muted">累计交付距 Gold 还差 3 单，可在 Leads 接入跨境项目加速积累。</span>
        </div>
        <div className="text-2xs leading-snug">
          <span className="font-medium text-accent-glow">→ 推荐动作：</span>
          <span className="text-text-muted">本周 EU Builder Network 有 2 个高匹配 Lead，匹配度 95%+。</span>
        </div>
      </div>
      <Link
        href="/pro/leads"
        className="mt-4 w-full px-3 py-2 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-2xs font-medium inline-flex items-center justify-center gap-1.5"
      >
        <Sparkles size={11} /> 查看推荐 Lead
      </Link>
    </div>
  );
}

// ─────────────────────────── Tier Benefits ───────────────────────────

function TierBenefits({ myTier, nextTier }: { myTier: Tier; nextTier: Tier }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={13} className="text-warning" />
        <span className="text-2xs uppercase tracking-wide text-text-muted font-medium">等级权益</span>
      </div>
      {(['bronze', 'silver', 'gold'] as Tier[]).map(t => {
        const tier = TIERS[t];
        const TierIcon = tier.icon;
        const isMine = t === myTier;
        const isNext = t === nextTier;
        return (
          <div
            key={t}
            className={cn(
              'mb-3 last:mb-0 px-3 py-2.5 rounded border',
              isMine ? 'border-accent/40 bg-accent/[0.06]' : isNext ? 'border-warning/30 bg-warning/[0.04]' : 'border-border bg-bg-elevated'
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <TierIcon size={12} style={{ color: tier.color }} />
              <span className="text-2xs font-medium" style={{ color: tier.color }}>{tier.label}</span>
              {isMine && <span className="text-2xs px-1 py-0.5 rounded bg-accent/20 text-accent-glow ml-auto">当前</span>}
              {isNext && <span className="text-2xs px-1 py-0.5 rounded bg-warning/20 text-warning ml-auto">下一级</span>}
            </div>
            <ul className="space-y-0.5">
              {tier.perks.map(perk => (
                <li key={perk} className="text-2xs text-text-muted">· {perk}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
