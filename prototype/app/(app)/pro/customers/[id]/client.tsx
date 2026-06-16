'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MessageSquare, Phone, Mail, MapPin, Cpu,
  CheckCircle2, AlertTriangle, CreditCard, FileText, Calendar,
  Clock, ExternalLink, Activity, Wifi, Edit3, Plus, Sparkles,
  History, Users, ArrowRight,
  Smartphone, Package, Check, RefreshCw, Send, Lock,
  Users as UsersIcon, Crown,
} from 'lucide-react';
import { getCustomer, customerHealth, customerDeviceCount, TAG_LABEL, TAG_COLOR, type Customer } from '@/lib/mock/customers';
import { cn } from '@/lib/utils';

const TABS = ['概览', '项目', 'Life App', '沟通', '合同与付款', 'Studios'];

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const c = getCustomer(id);
  const [tab, setTab] = useState('概览');

  if (!c) return notFound();

  const aggHealth = customerHealth(c);
  const totalDevices = customerDeviceCount(c);
  const HEALTH = {
    healthy: { color: 'text-success bg-success/15 border-success/30', label: '所有 Studio 健康' },
    warning: { color: 'text-warning bg-warning/15 border-warning/30', label: '有 Studio 预警' },
    critical: { color: 'text-rose-400 bg-rose-500/15 border-rose-500/30', label: '有 Studio 严重告警' },
    offline: { color: 'text-text-subtle bg-white/5 border-border', label: '部分离线' },
  }[aggHealth];

  return (
    <div className="min-h-screen">
      {/* Sticky breadcrumb header */}
      <div className="sticky top-12 z-20 border-b border-border bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-8 py-3 flex items-center gap-3">
          <Link
            href="/pro/customers"
            className="text-text-muted hover:text-text inline-flex items-center gap-1 text-2xs"
          >
            <ArrowLeft size={11} /> Customers
          </Link>
          <span className="text-text-subtle text-2xs">/</span>
          <span className="text-2xs">{c.name}</span>
          <div className="flex-1" />
          <button className="px-2.5 py-1 text-2xs rounded-md border border-border hover:border-border-strong text-text-muted hover:text-text inline-flex items-center gap-1.5">
            <Phone size={10} /> 拨号
          </button>
          <Link
            href="/pro/messages"
            className="px-2.5 py-1 text-2xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1.5"
          >
            <MessageSquare size={10} /> 发消息
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Identity card */}
        <div className="card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent2/5 pointer-events-none" />
          <div className="relative flex items-start gap-5">
            <div
              className={cn(
                'w-16 h-16 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-2xl font-semibold',
                c.avatarGradient
              )}
            >
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
                <span
                  className="text-2xs px-1.5 py-0.5 rounded border inline-flex items-center"
                  style={{
                    background: `${TAG_COLOR[c.tag]}15`,
                    borderColor: `${TAG_COLOR[c.tag]}40`,
                    color: TAG_COLOR[c.tag],
                  }}
                >
                  {TAG_LABEL[c.tag]}
                </span>
                {c.contractStatus === 'active' && (
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-success/15 border border-success/30 text-success">
                    合同进行中
                  </span>
                )}
                {c.contractStatus === 'pending' && (
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-warning/15 border border-warning/30 text-warning">
                    待签合同
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-sm text-text-muted flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={11} /> {c.city} · {c.spaceName}
                </span>
                <span className="text-text-subtle">·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={11} /> 客户自 {c.joinedAt}
                </span>
                <span className="text-text-subtle">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} /> 最近联络 {c.lastContact}
                </span>
              </div>
              {c.notes && (
                <div className="mt-3 p-2.5 rounded-md bg-white/[0.03] border border-border text-2xs text-text-muted italic">
                  💭 {c.notes}
                </div>
              )}
            </div>
            <button className="p-2 rounded-md text-text-muted hover:text-text hover:bg-white/5 flex-shrink-0">
              <Edit3 size={13} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="relative mt-6 pt-5 border-t border-border grid grid-cols-2 md:grid-cols-5 gap-4">
            <Mini icon={FileText} label="项目数" value={c.projects.toString()} />
            <Mini icon={Cpu} label="管控 Studios" value={c.studios.length.toString()} sub={`${totalDevices} 设备`} />
            <Mini
              icon={CreditCard}
              label="客户终生值"
              value={`¥${c.lifetimeValue.toLocaleString()}`}
              tone="success"
            />
            <Mini
              icon={Activity}
              label="月经常性收入"
              value={c.recurringRevenue ? `¥${c.recurringRevenue}` : '—'}
              tone={c.recurringRevenue ? 'success' : undefined}
            />
            <Mini icon={CheckCircle2} label="Studio 状态" value={HEALTH.label} tone={
              aggHealth === 'healthy' ? 'success' :
              aggHealth === 'warning' ? 'warning' :
              aggHealth === 'critical' ? 'critical' : undefined
            } />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6 overflow-x-auto">
          <div className="flex items-center gap-1">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-2.5 text-sm transition relative whitespace-nowrap',
                  tab === t ? 'text-text' : 'text-text-muted hover:text-text'
                )}
              >
                {t}
                {tab === t && (
                  <motion.div
                    layoutId="custTabIndicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === '概览' && <Overview c={c} healthLabel={HEALTH.label} aggHealth={aggHealth} />}
        {tab === '项目' && <Projects c={c} />}
        {tab === 'Life App' && <LifeAppPanel c={c} />}
        {tab === '沟通' && <Communication c={c} />}
        {tab === '合同与付款' && <Contracts c={c} />}
        {tab === 'Studios' && <StudioPanel c={c} />}
      </main>
    </div>
  );
}

function Overview({ c, healthLabel, aggHealth }: { c: any; healthLabel: string; aggHealth: string }) {
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      {/* Left - timeline */}
      <div>
        <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
          <History size={13} className="text-accent-glow" />
          关系时间线
        </h2>
        <div className="card overflow-hidden">
          {[
            { date: c.lastContact, type: '远程', text: 'Studio 健康检查 + 远程重启路由器', icon: Wifi, iconColor: 'text-accent-glow' },
            { date: '昨天', type: '现场', text: '完成"起夜模式 v2"调试 + 客户验收', icon: CheckCircle2, iconColor: 'text-success' },
            { date: '4 天前', type: '消息', text: '客户提交反馈:走廊雷达响应略慢', icon: MessageSquare, iconColor: 'text-text-muted' },
            { date: '上周', type: '部署', text: '部署 5 个新 Persona 自动化到 Studio', icon: Sparkles, iconColor: 'text-accent-glow' },
            { date: c.joinedAt, type: '签约', text: '客户加入 · 首次方案签约 + 服务订阅 ¥' + (c.recurringRevenue || 0) + '/月', icon: FileText, iconColor: 'text-text-muted' },
          ].map((e, i) => (
            <div key={i} className="px-5 py-3.5 border-b border-border last:border-b-0 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-white/5 border border-border flex items-center justify-center flex-shrink-0">
                <e.icon size={12} className={e.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm leading-snug">{e.text}</div>
                <div className="text-2xs text-text-muted mt-0.5">{e.type} · {e.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - actions */}
      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="text-sm font-medium mb-3">快速操作</h3>
          <div className="space-y-2">
            <Link
              href="/pro/messages"
              className="flex items-center gap-3 p-2.5 rounded-md border border-border hover:border-border-strong transition"
            >
              <MessageSquare size={14} className="text-accent-glow" />
              <div className="flex-1 text-sm">发消息</div>
              <ArrowRight size={11} className="text-text-subtle" />
            </Link>
            <Link
              href="/pro/projects/proj-lixs/overview"
              className="flex items-center gap-3 p-2.5 rounded-md border border-border hover:border-border-strong transition"
            >
              <FileText size={14} className="text-text-muted" />
              <div className="flex-1 text-sm">打开项目工作台</div>
              <ArrowRight size={11} className="text-text-subtle" />
            </Link>
            <Link
              href="/pro/studios"
              className="flex items-center gap-3 p-2.5 rounded-md border border-border hover:border-border-strong transition"
            >
              <Cpu size={14} className="text-text-muted" />
              <div className="flex-1 text-sm">Studio 远程协助</div>
              <ExternalLink size={11} className="text-text-subtle" />
            </Link>
            <button className="w-full flex items-center gap-3 p-2.5 rounded-md border border-border hover:border-border-strong transition text-left">
              <Plus size={14} className="text-text-muted" />
              <div className="flex-1 text-sm">新建上门</div>
            </button>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium mb-3">联系信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={11} className="text-text-subtle" />
              <span className="text-text-muted">+86 138-XXXX-XXXX</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={11} className="text-text-subtle" />
              <span className="text-text-muted">{c.id}@example.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={11} className="text-text-subtle" />
              <span className="text-text-muted text-xs">{c.city} · 详细地址保密</span>
            </div>
          </div>
        </div>

        {aggHealth === 'critical' && (
          <div className="card p-4 border-rose-500/30 bg-rose-500/5">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-rose-400">有 Studio 严重告警</div>
                <p className="mt-1 text-2xs text-text-muted">
                  {c.studios.filter((s: any) => s.health === 'critical').map((s: any) => s.label).join(', ')} 离线,客户可能尚未察觉。建议立即远程协助。
                </p>
                <Link
                  href="/pro/studios"
                  className="mt-2 inline-flex items-center gap-1 text-2xs text-rose-400 hover:underline"
                >
                  立即处理 <ArrowRight size={9} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Projects({ c }: { c: any }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-text-muted">
        客户共有 <span className="num text-text">{c.projects}</span> 个项目,
        其中 <span className="num text-success">{c.activeProjects}</span> 个进行中。
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: c.projects }).map((_, i) => (
          <Link
            key={i}
            href="/pro/projects/proj-lixs/overview"
            className="flex items-center gap-4 p-4 rounded-md border border-border hover:border-border-strong transition"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-accent/20 to-accent2/20 border border-border flex items-center justify-center">
              <FileText size={16} className="text-accent-glow" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{c.spaceName} · 主方案</div>
              <div className="text-2xs text-text-muted mt-0.5">28 设备 · 4 Persona · 已部署</div>
            </div>
            <ArrowRight size={12} className="text-text-subtle" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Communication({ c }: { c: any }) {
  return (
    <div className="card p-5 text-sm text-text-muted">
      最近沟通见 <Link href="/pro/messages" className="text-accent-glow hover:underline">/pro/messages</Link>。
      该客户共有 8 条消息记录,3 次现场上门,12 次远程接入。
    </div>
  );
}

function Contracts({ c }: { c: any }) {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h3 className="text-sm font-medium mb-3">当前合同</h3>
        {c.contractStatus === 'active' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-2xs text-text-muted">合同号</div>
              <div className="font-mono mt-0.5 text-xs">CT-{c.id.toUpperCase()}-001</div>
            </div>
            <div>
              <div className="text-2xs text-text-muted">类型</div>
              <div className="mt-0.5">设计 + 持续服务</div>
            </div>
            <div>
              <div className="text-2xs text-text-muted">合同金额</div>
              <div className="num text-success mt-0.5">¥{c.lifetimeValue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-2xs text-text-muted">月订阅</div>
              <div className="num text-success mt-0.5">¥{c.recurringRevenue || 0}/月</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-text-muted">暂无合同 — <button className="text-accent-glow hover:underline">+ 新建合同</button></div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-medium mb-3">付款记录</h3>
        <div className="space-y-2">
          {[
            { date: '昨天', amount: 12400, type: '验收金' },
            { date: '4 月', amount: c.recurringRevenue, type: '月订阅' },
            { date: '3 月', amount: c.recurringRevenue, type: '月订阅' },
            { date: c.joinedAt, amount: Math.round(c.lifetimeValue * 0.6), type: '首期款' },
          ].filter(p => p.amount).map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={12} className="text-success" />
                <div>
                  <div className="text-sm">{p.type}</div>
                  <div className="text-2xs text-text-muted">{p.date}</div>
                </div>
              </div>
              <div className="text-sm num text-success">+¥{p.amount?.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudioPanel({ c }: { c: Customer }) {
  const HEALTH_ICON = {
    healthy: { icon: CheckCircle2, color: 'text-success', label: '健康' },
    warning: { icon: AlertTriangle, color: 'text-warning', label: '预警' },
    critical: { icon: AlertTriangle, color: 'text-rose-400', label: '严重' },
    offline: { icon: Wifi, color: 'text-text-subtle', label: '离线' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">管控 Studios</h3>
          <p className="text-2xs text-text-muted mt-0.5">
            该客户共 {c.studios.length} 台 Studio · {customerDeviceCount(c)} 设备 ·
            一个客户可以有多台 Studio(主屋 / 别墅多层 / 多套房 / 异地家)
          </p>
        </div>
        <button className="px-3 py-1.5 text-xs rounded-md border border-border hover:border-border-strong inline-flex items-center gap-1.5">
          <Plus size={11} /> 注册新 Studio
        </button>
      </div>

      <div className="space-y-3">
        {c.studios.map(s => {
          const H = HEALTH_ICON[s.health];
          return (
            <div key={s.id} className="card p-4 hover:border-border-strong transition group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Cpu size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.label}</span>
                    <span className={cn('text-2xs px-1.5 py-0 rounded border inline-flex items-center gap-1',
                      s.health === 'healthy' ? 'bg-success/15 border-success/30 text-success' :
                      s.health === 'warning' ? 'bg-warning/15 border-warning/30 text-warning' :
                      s.health === 'critical' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' :
                      'bg-white/5 border-border text-text-subtle'
                    )}>
                      <H.icon size={9} />
                      {H.label}
                    </span>
                  </div>
                  <div className="text-2xs text-text-muted mt-0.5 font-mono">{s.id}</div>
                  <div className="text-2xs text-text-subtle mt-0.5">
                    {s.devices} 设备
                    {s.city && s.city !== c.city && <span className="ml-2 text-warning">· 异地 {s.city}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="px-2.5 py-1.5 text-2xs rounded-md border border-amber-500/35 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 inline-flex items-center gap-1"
                  >
                    <ExternalLink size={10} /> Request Access
                  </button>
                  <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5" title="诊断">
                    <Activity size={11} />
                  </button>
                </div>
              </div>
              {/* Per-studio metrics */}
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-4 gap-3 text-center">
                <Mini icon={Activity} label="CPU" value={s.health === 'critical' ? '—' : `${20 + (s.devices % 30)}%`} tone={s.health === 'critical' ? 'critical' : 'success'} />
                <Mini icon={Activity} label="内存" value={s.health === 'critical' ? '—' : `${30 + (s.devices % 40)}%`} tone={s.health === 'critical' ? 'critical' : 'success'} />
                <Mini icon={CheckCircle2} label="可用率" value={s.health === 'critical' ? '87%' : s.health === 'warning' ? '98%' : '99.8%'} tone={s.health === 'critical' ? 'critical' : s.health === 'warning' ? 'warning' : 'success'} />
                <Mini icon={Cpu} label="设备" value={s.devices.toString()} />
              </div>
            </div>
          );
        })}
      </div>

      {c.studios.length === 0 && (
        <div className="card p-8 text-center">
          <Cpu size={32} className="mx-auto text-text-subtle mb-3" />
          <div className="text-sm text-text-muted">该客户尚未安装 Studio</div>
          <button className="mt-4 px-4 py-2 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-sm font-medium inline-flex items-center gap-1.5">
            <Plus size={12} /> 注册首台 Studio
          </button>
        </div>
      )}
    </div>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  tone?: 'success' | 'warning' | 'critical';
}) {
  const color =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' :
    tone === 'critical' ? 'text-rose-400' : 'text-text';
  return (
    <div>
      <div className="flex items-center gap-1 text-2xs text-text-muted">
        <Icon size={10} />
        {label}
      </div>
      <div className={cn('mt-1 text-base font-medium num', color)}>{value}</div>
      {sub && <div className="text-2xs text-text-subtle mt-0.5">{sub}</div>}
    </div>
  );
}


// ─── Life App 插件分配 ─────────────────────────────────────────────────────────

const LIFE_PERSONAS_DATA = [
  {
    id: 'elder', name: '老人（张奶奶）', icon: '👴', color: '#10b981',
    plugins: [
      { id: 'emergency', name: '紧急呼叫', icon: '🆘', active: true },
      { id: 'night',     name: '夜间模式', icon: '🌙', active: true },
      { id: 'health',    name: '健康监测', icon: '💊', active: true },
      { id: 'weather',   name: '天气提醒', icon: '⛅', active: true },
    ],
    assigned: true, lastPush: '3 天前',
  },
  {
    id: 'owner', name: '家庭主人（女儿）', icon: '👩', color: '#6366f1',
    plugins: [
      { id: 'dashboard', name: '全局控制台', icon: '🎛', active: true },
      { id: 'energy',    name: '能耗报表',   icon: '⚡', active: true },
      { id: 'security',  name: '安防监控',   icon: '🔒', active: true },
      { id: 'care',      name: '远程关怀',   icon: '💛', active: true },
    ],
    assigned: true, lastPush: '3 天前',
  },
];

const PLUGIN_LIBRARY = [
  { id: 'emergency', name: '紧急呼叫',   icon: '🆘', desc: '一键呼叫紧急联系人' },
  { id: 'night',     name: '夜间模式',   icon: '🌙', desc: '夜间照明 + 起夜引导' },
  { id: 'health',    name: '健康监测',   icon: '💊', desc: 'FP2 活动检测 + 提醒' },
  { id: 'weather',   name: '天气提醒',   icon: '⛅', desc: '每日天气 + 开窗建议' },
  { id: 'dashboard', name: '全局控制台', icon: '🎛', desc: '全屋设备快捷控制' },
  { id: 'energy',    name: '能耗报表',   icon: '⚡', desc: '实时用电 + 节能建议' },
  { id: 'security',  name: '安防监控',   icon: '🔒', desc: '门锁 + 摄像头 + 告警' },
  { id: 'care',      name: '远程关怀',   icon: '💛', desc: '日报推送 + 异常通知' },
  { id: 'scenario',  name: '场景中心',   icon: '✨', desc: '一键执行常用场景' },
];

function LifeAppPanel({ c }: { c: Customer }) {
  const [personas, setPersonas] = useState(LIFE_PERSONAS_DATA);
  const [selectedId, setSelectedId] = useState(LIFE_PERSONAS_DATA[0].id);
  const [pushing, setPushing] = useState(false);
  const [pushed, setPushed] = useState(false);

  const active = personas.find(p => p.id === selectedId)!;

  const togglePlugin = (pluginId: string) => {
    setPersonas(ps => ps.map(p =>
      p.id === selectedId
        ? { ...p, plugins: p.plugins.map(pl => pl.id === pluginId ? { ...pl, active: !pl.active } : pl) }
        : p
    ));
  };

  const pushToLife = () => {
    setPushing(true);
    setTimeout(() => {
      setPushing(false); setPushed(true);
      setPersonas(ps => ps.map(p => p.id === selectedId ? { ...p, assigned: true, lastPush: '刚刚' } : p));
      setTimeout(() => setPushed(false), 2000);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
      {/* Left — Persona list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold inline-flex items-center gap-1.5">
            <UsersIcon size={14} className="text-accent-glow" /> Personas
          </h3>
          <button className="text-2xs text-accent-glow hover:underline">+ 添加</button>
        </div>
        <div className="space-y-2">
          {personas.map(p => (
            <button key={p.id} onClick={() => setSelectedId(p.id)}
              className={cn('w-full card p-3 text-left transition',
                selectedId === p.id ? 'border-accent/50 bg-accent/5' : 'hover:border-border-strong')}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{p.name}</div>
                  <div className="text-2xs text-text-muted mt-0.5">
                    {p.plugins.filter(pl => pl.active).length} 个插件
                    {p.assigned && <span className="text-success ml-1.5">✓ 已推送 {p.lastPush}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-md bg-bg-elevated/50 border border-border text-2xs text-text-muted leading-relaxed">
          <div className="font-medium text-text mb-1">💡 Life App 分配</div>
          每个家庭成员用自己的 Persona 打开 Aqara Life，看到 Builder 定制的控制面板。老人看到"紧急按钮 + 夜间模式"，主人看到"全局控制台 + 能耗"。
        </div>
      </div>

      {/* Right — Plugin editor */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{active.icon} {active.name} · 插件布局</h3>
          <div className="flex items-center gap-2">
            <Link href="/build?entry=pro" className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-accent/40 hover:text-accent-glow text-text-muted transition inline-flex items-center gap-1">
              <Sparkles size={10} /> Design Platform 设计
            </Link>
            <button onClick={pushToLife} disabled={pushing}
              className={cn('text-2xs px-3 py-1.5 rounded font-medium inline-flex items-center gap-1.5 transition',
                pushed ? 'bg-success/15 text-success border border-success/30'
                       : 'bg-gradient-to-br from-accent to-accent2 text-white')}>
              {pushing ? <><RefreshCw size={10} className="animate-spin" /> 推送中…</>
               : pushed ? <><Check size={10} /> 已推送</>
               : <><Send size={10} /> 推送到 Aqara Life</>}
            </button>
          </div>
        </div>

        {/* Active */}
        <div className="mb-4">
          <div className="text-2xs uppercase tracking-wider text-text-subtle font-semibold mb-2">已启用</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {active.plugins.filter(pl => pl.active).map(pl => (
              <div key={pl.id} className="card p-3 flex items-center gap-2 border-accent/20 bg-accent/[0.02] group">
                <span className="text-xl">{pl.icon}</span>
                <span className="text-xs font-medium flex-1 truncate">{pl.name}</span>
                <button onClick={() => togglePlugin(pl.id)}
                  className="opacity-0 group-hover:opacity-100 transition text-text-subtle hover:text-rose-400">
                  <Lock size={9} />
                </button>
              </div>
            ))}
            <button className="card p-3 border-dashed flex items-center justify-center gap-1 text-2xs text-text-muted hover:text-accent-glow hover:border-accent/40 transition">
              + 添加
            </button>
          </div>
        </div>

        {/* Library */}
        <div>
          <div className="text-2xs uppercase tracking-wider text-text-subtle font-semibold mb-2">插件库</div>
          <div className="space-y-1.5">
            {PLUGIN_LIBRARY.filter(ap => !active.plugins.find(p => p.id === ap.id && p.active)).map(ap => (
              <div key={ap.id} className="flex items-center gap-3 p-2 rounded-md border border-border hover:border-border-strong transition">
                <span className="text-lg">{ap.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{ap.name}</div>
                  <div className="text-2xs text-text-muted">{ap.desc}</div>
                </div>
                <button onClick={() => togglePlugin(ap.id)}
                  className="text-2xs px-2.5 py-1 rounded border border-border hover:border-accent/40 hover:text-accent-glow text-text-muted transition">
                  + 添加
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
