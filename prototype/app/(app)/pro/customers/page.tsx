'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Plus,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Phone,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Heart,
  ChevronDown,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MyCustomers, customerStats, customerHealth, customerDeviceCount, TAG_LABEL, TAG_COLOR, type Customer } from '@/lib/mock/customers';
import { cn } from '@/lib/utils';

const FILTERS = ['全部', '活跃中', '有订阅', '健康预警', '最近联络'];

const ACQ_LABEL: Record<Customer['acquiredVia'], string> = {
  lead: 'Lead',
  referral: '推荐',
  community: '社群',
  'walk-in': '门店',
};

const HEALTH = {
  healthy: { color: 'text-success', label: '在线' },
  warning: { color: 'text-warning', label: '预警' },
  critical: { color: 'text-rose-400', label: '严重' },
  offline: { color: 'text-text-subtle', label: '离线' },
};

export default function CustomersPage() {
  const [filter, setFilter] = useState('全部');
  const stats = customerStats();

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Users size={20} className="text-accent-glow" />
              我的客户
              <span className="text-2xs text-text-muted font-normal num">{stats.total} 户</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-xs rounded-md border border-border hover:border-border-strong text-text-muted hover:text-text inline-flex items-center gap-1.5">
              <ArrowRight size={11} className="rotate-180" /> 导出 CSV
            </button>
            <button className="px-3 py-2 text-xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1.5">
              <Plus size={12} /> 新建客户
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Stat icon={Users} color="accent" label="客户总数" value={stats.total.toString()} sub="+2 本月新增" />
          <Stat icon={Cpu} color="success" label="管控 Studios" value={stats.totalStudios.toString()} sub={`${stats.totalDevices} 设备`} />
          <Stat icon={CheckCircle2} color="success" label="活跃项目" value={stats.active.toString()} sub="进行中" />
          <Stat
            icon={CreditCard}
            color="success"
            label="累计客户终生值"
            value={`¥${(stats.lifetimeValue / 1000).toFixed(1)}k`}
            sub="所有客户累计"
          />
          <Stat
            icon={TrendingUp}
            color="accent"
            label="月经常性收入 MRR"
            value={`¥${(stats.monthlyRecurring / 1000).toFixed(1)}k`}
            sub="订阅 + 持续服务"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              placeholder="搜索客户名 / 城市 / Studio ID / 标签..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none"
            />
          </div>
          <button className="px-3 py-2 text-xs rounded-md border border-border hover:border-border-strong text-text-muted inline-flex items-center gap-1.5">
            <Filter size={12} /> 高级筛选
          </button>
          <button className="px-3 py-2 text-xs rounded-md border border-border hover:border-border-strong text-text-muted inline-flex items-center gap-1.5">
            排序 · 最近联络
            <ChevronDown size={11} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1 text-2xs rounded-full border transition whitespace-nowrap',
                filter === f
                  ? 'border-accent/60 bg-accent/10 text-text'
                  : 'border-border bg-bg-elevated/50 text-text-muted hover:border-border-strong hover:text-text'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Customer list */}
        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_140px_160px_120px_140px_120px] gap-4 px-5 py-3 border-b border-border text-2xs text-text-subtle uppercase tracking-wider bg-white/[0.02]">
            <div>客户</div>
            <div>标签</div>
            <div>Studios (1+)</div>
            <div>项目</div>
            <div>累计 / 月订阅</div>
            <div>最近联络</div>
          </div>
          {MyCustomers.map((c, i) => {
            const health = customerHealth(c);
            const devices = customerDeviceCount(c);
            return (
            <motion.div
              key={c.id}
              initial={{ y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link
                href={`/pro/customers/${c.id}`}
                className="block px-5 py-4 border-b border-border hover:bg-white/[0.02] transition group"
              >
                <div className="grid md:grid-cols-[1fr_140px_160px_120px_140px_120px] grid-cols-1 gap-4 items-center">
                  {/* Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-sm font-semibold',
                        c.avatarGradient
                      )}
                    >
                      {c.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate group-hover:text-accent-glow transition">
                          {c.name}
                        </span>
                        {c.contractStatus === 'pending' && (
                          <span className="text-2xs px-1.5 py-0 rounded bg-warning/15 text-warning border border-warning/30">
                            新 Lead
                          </span>
                        )}
                      </div>
                      <div className="text-2xs text-text-muted mt-0.5 flex items-center gap-1.5">
                        <MapPin size={9} /> {c.city} · {c.spaceName}
                      </div>
                      <div className="text-2xs text-text-subtle mt-0.5">
                        来源 {ACQ_LABEL[c.acquiredVia]} · 加入 {c.joinedAt}
                      </div>
                    </div>
                  </div>

                  {/* Tag */}
                  <div>
                    <span
                      className="text-2xs px-1.5 py-0.5 rounded border inline-flex items-center gap-1"
                      style={{
                        background: `${TAG_COLOR[c.tag]}15`,
                        borderColor: `${TAG_COLOR[c.tag]}40`,
                        color: TAG_COLOR[c.tag],
                      }}
                    >
                      {TAG_LABEL[c.tag]}
                    </span>
                  </div>

                  {/* Studios — multi-count with worst health */}
                  <div className="text-2xs">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={11} className={HEALTH[health].color} />
                      <span className="num text-text">{c.studios.length}</span>
                      <span className="text-text-muted">台 Studio</span>
                      <span className={cn('ml-1', HEALTH[health].color)}>
                        · {HEALTH[health].label}
                      </span>
                    </div>
                    <div className="text-text-subtle mt-0.5 truncate">
                      {devices} 设备 ·
                      {c.studios.length === 1 ? (
                        <span className="font-mono ml-1">{c.studios[0].id}</span>
                      ) : (
                        <span className="ml-1">{c.studios.map(s => s.label).join(' · ')}</span>
                      )}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="text-2xs">
                    <div className="flex items-center gap-1.5">
                      <span className="num text-text">{c.projects}</span>
                      <span className="text-text-muted">个项目</span>
                    </div>
                    {c.activeProjects > 0 && (
                      <div className="text-success mt-0.5">{c.activeProjects} 进行中</div>
                    )}
                  </div>

                  {/* Revenue */}
                  <div className="text-2xs">
                    <div className="num text-text">¥{(c.lifetimeValue / 1000).toFixed(1)}k</div>
                    {c.recurringRevenue ? (
                      <div className="text-text-muted mt-0.5 num">¥{c.recurringRevenue}/月</div>
                    ) : (
                      <div className="text-text-subtle mt-0.5">无订阅</div>
                    )}
                  </div>

                  {/* Last contact */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-2xs text-text-muted flex items-center gap-1">
                      <Clock size={9} /> {c.lastContact}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5"
                        title="发消息"
                      >
                        <MessageSquare size={11} />
                      </button>
                    </div>
                  </div>
                </div>
                {c.notes && (
                  <div className="mt-2.5 pl-13 ml-13 text-2xs text-text-muted line-clamp-1 italic">
                    💭 {c.notes}
                  </div>
                )}
              </Link>
            </motion.div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="mt-6 card p-4 border-accent/30 bg-accent/5">
          <div className="flex items-start gap-2">
            <Sparkles size={13} className="text-accent-glow mt-0.5 flex-shrink-0" />
            <div className="text-2xs">
              <div className="text-accent-glow font-medium">💡 CRM 小技巧</div>
              <p className="mt-1 text-text-muted leading-relaxed">
                客户的 Studio 与你的项目档案是一对一绑定的。点击客户进入详情,可以看见全部:项目历史 / 沟通记录 / 合同付款 / Studio 实时健康。
                陈先生家 Studio 已离线 14h,点进去可一键远程协助 →
                <Link href="/pro/customers/cust-chen" className="text-accent-glow hover:underline ml-1">
                  立即处理
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  color,
  label,
  value,
  sub,
}: {
  icon: any;
  color: 'accent' | 'success' | 'warning';
  label: string;
  value: string;
  sub?: string;
}) {
  const colorClass = {
    accent: 'text-accent-glow',
    success: 'text-success',
    warning: 'text-warning',
  }[color];
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-2xs text-text-muted">
        <Icon size={12} className={colorClass} />
        {label}
      </div>
      <div className="mt-1.5 text-xl font-semibold num">{value}</div>
      {sub && <div className="mt-0.5 text-2xs text-text-subtle">{sub}</div>}
    </div>
  );
}
