'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Cpu,
  HardDrive,
  Activity,
  Zap,
  Settings,
  AlertTriangle,
  Layers3,
  Bell,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Wifi,
  Lock,
  Code2,
  Database,
  ExternalLink,
  Shield,
  Smartphone,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Monitor,
} from 'lucide-react';
import { getProjectCommissioningTargets, getStudioWebAccountSpaces } from '@/lib/mock/studios';
import { cn } from '@/lib/utils';

// Mock Studio Web Console — mimics the actual Studio local web UI (image 9)
// Framed as "via Aqara Builder secure remote proxy"

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Monitor, group: '' },
  { id: 'spaces', label: 'Spaces', icon: Layers3, group: 'BUILD' },
  { id: 'devices', label: 'Devices', icon: Cpu, group: 'BUILD' },
  { id: 'automations', label: 'Automations', icon: Zap, group: 'BUILD', badge: '8' },
  { id: 'energy', label: 'Energy', icon: Activity, group: 'OPERATE' },
  { id: 'alarms', label: 'Alarms', icon: AlertTriangle, group: 'OPERATE' },
  { id: 'logs', label: 'Logs', icon: Database, group: 'OPERATE' },
  { id: 'user', label: 'User', icon: Lock, group: 'SYSTEM' },
  { id: 'backup', label: 'Backup & Restore', icon: HardDrive, group: 'SYSTEM' },
  { id: 'cloud', label: 'Cloud Connection', icon: ExternalLink, group: 'SYSTEM' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'SYSTEM' },
  { id: 'plugins', label: 'Plugin Center', icon: Sparkles, group: 'EXTENSION' },
  { id: 'developer', label: 'Developer', icon: Code2, group: 'EXTENSION' },
];

const STUDIO_AUTOMATIONS = [
  { id: 1, name: '起夜模式', enabled: true, type: 'Flow', source: 'Builder · AI 生成', created: '2026-05-09', triggers: 3, actions: 5 },
  { id: 2, name: '离家模式', enabled: true, type: 'Flow', source: 'Builder · AI 生成', created: '2026-05-09', triggers: 2, actions: 4 },
  { id: 3, name: '晚安模式', enabled: true, type: 'Flow', source: 'Builder · AI 生成', created: '2026-05-09', triggers: 1, actions: 6 },
  { id: 4, name: '回家迎接', enabled: true, type: 'Scene', source: '本地创建', created: '2026-05-10', triggers: 1, actions: 4 },
  { id: 5, name: '客厅观影', enabled: true, type: 'Scene', source: '本地创建', created: '2026-05-10', triggers: 1, actions: 4 },
  { id: 6, name: '工作日早起', enabled: false, type: 'Flow', source: 'Builder · AI 生成', created: '2026-05-08', triggers: 1, actions: 3 },
  { id: 7, name: '雨天关窗 (实验)', enabled: false, type: 'Flow', source: '本地创建', created: '2026-05-11', triggers: 2, actions: 2 },
  { id: 8, name: '极客 Matter Bridge', enabled: true, type: 'Driver', source: '本地 Plugin', created: '2026-04-30', triggers: 0, actions: 0 },
];

export default function StudioConsolePage() {
  const [section, setSection] = useState('cloud');

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Builder remote proxy banner — critical: tells user this is NOT a separate site */}
      <div className="h-9 border-b border-accent/30 bg-accent/5 flex items-center px-5 gap-3 text-2xs">
        <Link
          href="/home/devices"
          className="text-accent-glow hover:text-text inline-flex items-center gap-1"
        >
          <ArrowLeft size={11} /> 回到 My Home
        </Link>
        <div className="text-text-subtle">·</div>
        <div className="text-text-muted inline-flex items-center gap-1.5">
          <Shield size={10} className="text-success" />
          <span>已通过 Aqara Builder 安全代理访问</span>
          <span className="text-text-subtle">→</span>
          <span className="font-mono">aqarastudio-b9c4.local</span>
        </div>
        <div className="flex-1" />
        <div className="text-2xs text-text-subtle inline-flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
          延迟 12ms · 端到端加密
        </div>
      </div>

      {/* Top bar — mimics actual Studio UI */}
      <header className="h-12 border-b border-border bg-bg-elevated flex items-center px-5 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-xs font-semibold">
            A
          </div>
          <span className="font-semibold text-sm">Aqara Studio</span>
          <span className="text-2xs text-text-subtle">v3.4.2</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-2xs px-2 py-0.5 rounded-full bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1">
            <Sparkles size={9} /> Builder
          </span>
          <button className="text-2xs px-2 py-0.5 rounded border border-border text-text-muted hover:text-text inline-flex items-center gap-1">
            <Bell size={10} /> Quick Start
          </button>
          <button className="text-2xs px-2 py-0.5 rounded border border-border text-text-muted hover:text-text">
            🇺🇸 English
          </button>
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-2xs">
            👤
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Studio Sidebar — mimics image 9 */}
        <aside className="w-52 border-r border-border bg-bg flex-shrink-0 overflow-y-auto py-3">
          {SECTIONS.map((s, i) => {
            const showGroup = s.group && (i === 0 || SECTIONS[i - 1].group !== s.group);
            return (
              <div key={s.id}>
                {showGroup && (
                  <div className="px-4 py-2 text-2xs text-text-subtle uppercase tracking-wider mt-2">
                    {s.group}
                  </div>
                )}
                <button
                  onClick={() => setSection(s.id)}
                  className={cn(
                    'w-full px-4 py-2 flex items-center gap-2.5 text-sm text-left transition',
                    section === s.id
                      ? 'bg-white/10 text-text border-r-2 border-accent'
                      : 'text-text-muted hover:bg-white/5 hover:text-text'
                  )}
                >
                  <s.icon size={14} className="flex-shrink-0" />
                  <span className="flex-1">{s.label}</span>
                  {s.badge && (
                    <span className="text-2xs num text-text-subtle">{s.badge}</span>
                  )}
                </button>
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-white/[0.01]">
          {section === 'automations' && <AutomationsView />}
          {section === 'cloud' && <CloudConnectionView />}
          {section !== 'automations' && section !== 'cloud' && <PlaceholderView section={section} />}
        </main>
      </div>
    </div>
  );
}

function AutomationsView() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-base font-semibold">Automations</h1>
        <div className="flex-1" />
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            placeholder="Please enter the automation name"
            className="pl-7 pr-3 py-1.5 text-2xs rounded border border-border bg-bg outline-none focus:border-border-strong w-64"
          />
        </div>
        <button className="text-2xs px-3 py-1.5 rounded border border-border text-text-muted">Batch Operations</button>
        <button className="text-2xs px-3 py-1.5 rounded bg-accent text-white inline-flex items-center gap-1">
          <Plus size={10} /> Create
        </button>
      </div>

      {/* Builder note */}
      <div className="mb-4 p-3 rounded border border-accent/30 bg-accent/5 flex items-start gap-2 text-2xs">
        <Sparkles size={11} className="text-accent-glow mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-accent-glow font-medium">这里是你的 Studio 本地数据</div>
          <p className="text-text-muted mt-0.5">
            你在 Build 生成并部署的自动化，这里有完整本地数据；你在这里直接创建的，会自动同步回 Builder 前台「我的家」。
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_120px_120px_180px_140px_60px] gap-3 px-4 py-2.5 border-b border-border bg-white/[0.02] text-2xs text-text-subtle uppercase tracking-wider">
          <div>No.</div>
          <div>Name</div>
          <div>Enable/Disable</div>
          <div>Type</div>
          <div>Source</div>
          <div>Creation Time</div>
          <div>Operation</div>
        </div>
        {STUDIO_AUTOMATIONS.map(a => (
          <div
            key={a.id}
            className="grid grid-cols-[40px_1fr_120px_120px_180px_140px_60px] gap-3 px-4 py-3 border-b border-border last:border-b-0 items-center hover:bg-white/[0.02] text-xs"
          >
            <div className="text-text-subtle num">{a.id}</div>
            <div className="font-medium">{a.name}</div>
            <div>
              <div
                className={cn(
                  'w-8 h-4 rounded-full relative transition',
                  a.enabled ? 'bg-accent' : 'bg-white/10'
                )}
              >
                <div
                  className={cn(
                    'absolute top-0.5 w-3 h-3 rounded-full bg-white transition',
                    a.enabled ? 'right-0.5' : 'left-0.5'
                  )}
                />
              </div>
            </div>
            <div className="text-text-muted">{a.type}</div>
            <div className="text-text-muted text-2xs">
              {a.source.includes('Builder') ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent-glow">
                  <Sparkles size={9} /> {a.source}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-border text-text-muted">
                  <HardDrive size={9} /> {a.source}
                </span>
              )}
            </div>
            <div className="text-text-muted num text-2xs">{a.created} 00:23</div>
            <div className="text-text-subtle">···</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-2xs text-text-muted">
        <div>{STUDIO_AUTOMATIONS.length} items</div>
        <div className="flex items-center gap-2">
          <span>20 / page</span>
          <button className="px-2 py-0.5 rounded bg-accent text-white">1</button>
        </div>
      </div>
    </div>
  );
}

function CloudConnectionView() {
  // 模拟当前会话信息（实际由 Studio Web 登录链路决定）
  const account = '18718670866';
  const region = { flag: '🇨🇳', label: '中国大陆', dcLabel: 'CN 数据中心' };
  const workspaceName = 'Personal'; // 自动落到该账号在该 DC 的 Personal Space
  const accountSpaces = getStudioWebAccountSpaces().filter(space => space.region === 'CN');
  const commissioningTargets = getProjectCommissioningTargets();
  const target = commissioningTargets[0];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-2 text-2xs text-text-subtle">
        <span>Settings</span>
        <ChevronRight size={10}/>
        <span className="text-text-muted">Cloud Connection</span>
      </div>
      <h1 className="text-base font-semibold mb-1">云端连接</h1>
      <p className="text-2xs text-text-muted mb-6">
        将本地 Studio 安全连接到 Aqara 云，开放远程访问与多平台协作。
      </p>

      {/* 连接状态卡片 — 主信息：账号 + 国家/地区；Space 弱化为小灰标签 */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 pt-7 pb-6 text-center border-b border-border bg-gradient-to-b from-success/8 to-transparent">
          <div className="w-12 h-12 mx-auto rounded-full bg-success/15 border border-success/30 flex items-center justify-center mb-3">
            <CheckCircle2 size={22} className="text-success"/>
          </div>
          <h2 className="text-sm font-semibold mb-1">云端连接已就绪</h2>
          <p className="text-2xs text-text-muted">
            Studio 已成功连接 Aqara 云 · 端到端加密 · 延迟 12ms
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="px-5 py-4">
            <div className="text-2xs text-text-subtle mb-1">账号</div>
            <div className="text-sm font-medium num">{account}</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-2xs text-text-subtle mb-1">地区</div>
            <div className="text-sm font-medium">
              <span className="mr-1.5">{region.flag}</span>
              {region.label}
              <span className="ml-2 text-2xs text-text-subtle">({region.dcLabel})</span>
            </div>
          </div>
        </div>

        {/* Space 弱化：小灰标签 + 解除绑定 */}
        <div className="px-5 py-3 border-t border-border bg-white/[0.02] flex items-center gap-3 text-2xs">
          <span className="text-text-subtle">归属于</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-border bg-bg text-text-muted">
            <Layers3 size={9}/> 我的 {workspaceName} Space
          </span>
          <div className="flex-1"/>
          <button className="text-text-subtle hover:text-warning transition">解除绑定</button>
        </div>
      </div>

      <div className="grid gap-3 mb-6 md:grid-cols-2">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers3 size={13} className="text-accent" />
            <div className="text-sm font-medium">账号 Space</div>
          </div>
          <p className="text-2xs text-text-muted leading-relaxed">
            输入账号后只列出真实 Space；这些 Space 与 Builder 前台可访问列表保持一致。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {accountSpaces.slice(0, 4).map(space => (
              <span key={space.id} className="inline-flex items-center gap-1 rounded border border-border bg-bg px-2 py-1 text-2xs text-text-muted">
                <span>{space.emoji}</span>
                {space.name}
              </span>
            ))}
          </div>
        </div>

        <div className="card p-4 border-accent/30 bg-accent/5">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={13} className="text-accent" />
            <div className="text-sm font-medium">项目施工绑定</div>
          </div>
          <p className="text-2xs text-text-muted leading-relaxed">
            施工人员不需要创建隐藏 Space；在 Studio Web 输入 Project Code / 扫 QR，即可把 Studio 连接到项目调试目标。
          </p>
          <div className="mt-3 rounded-lg border border-accent/25 bg-bg px-3 py-2 text-2xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-text-subtle">{target.label}</span>
              <span className="font-mono text-accent-glow">{target.code}</span>
            </div>
            <div className="mt-1 text-text-subtle">验收后转移到：{target.transferTarget}</div>
          </div>
        </div>
      </div>

      {/* 三选一入口 — 替代原先单一的"前往 Aqara Builder 控制台" */}
      <div className="text-2xs text-text-subtle font-medium mb-2.5 uppercase tracking-wider">接下来你可以</div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <a href="/home" className="card p-4 hover:border-accent/40 transition group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20 border border-accent/30 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Monitor size={15} className="text-accent-glow"/>
          </div>
          <div className="text-sm font-medium mb-0.5">Aqara Builder</div>
          <div className="text-2xs text-text-subtle leading-relaxed">
            远程访问、协作、安装 Solution
          </div>
        </a>

        <a href="/build?entry=personal&demo_as=builder&workflow=space" className="card p-4 hover:border-indigo-400/40 transition group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/25 to-purple-500/20 border border-indigo-400/30 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Sparkles size={15} className="text-indigo-300"/>
          </div>
          <div className="text-sm font-medium mb-0.5">Build</div>
          <div className="text-2xs text-text-subtle leading-relaxed">
            空间方案、家人看板、自动化
          </div>
        </a>

        <a href="https://developer.aqara.com" className="card p-4 hover:border-cyan-400/40 transition group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/15 border border-cyan-400/30 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Code2 size={15} className="text-cyan-300"/>
          </div>
          <div className="text-sm font-medium mb-0.5">Developer Portal</div>
          <div className="text-2xs text-text-subtle leading-relaxed">
            调用 OpenAPI、Webhook、SDK 开发
          </div>
        </a>
      </div>

      {/* 关于云连接 */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={13} className="text-accent"/>
          <h3 className="text-sm font-medium">什么是云端连接？</h3>
        </div>
        <p className="text-2xs text-text-muted leading-relaxed mb-3">
          Edge2Cloud 把本地 Studio 安全代理至 Aqara 云，让你在任何地方访问本地 Studio。
          数据保留在本地、传输全程端到端加密。
        </p>
        <ul className="space-y-1.5">
          {[
            '为云平台具权限的用户提供远程安全访问',
            '可通过云平台远程监控等运维能力',
            '为本地 Studio 提供更多扩展的增值服务',
          ].map(t => (
            <li key={t} className="flex items-start gap-2 text-2xs text-text-subtle">
              <CheckCircle2 size={11} className="text-success shrink-0 mt-0.5"/>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PlaceholderView({ section }: { section: string }) {
  const titles: Record<string, string> = {
    overview: 'Overview',
    spaces: 'Spaces',
    devices: 'Devices',
    energy: 'Energy',
    alarms: 'Alarms',
    logs: 'Logs',
    user: 'User',
    backup: 'Backup & Restore',
    settings: 'Settings',
    plugins: 'Plugin Center',
    developer: 'Developer',
  };
  return (
    <div className="p-12 max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-accent2/20 border border-accent/30 flex items-center justify-center mb-4">
        <Monitor size={28} className="text-accent-glow" />
      </div>
      <h2 className="text-xl font-semibold">{titles[section]}</h2>
      <p className="mt-2 text-sm text-text-muted">
        Studio 本地的「{titles[section]}」页面 — 完整功能在原型里待实现,实际产品中这里展示真实 Studio 的 Web 界面。
      </p>
      <div className="mt-6 inline-flex items-center gap-2 text-2xs text-text-subtle">
        <Wifi size={11} className="text-success" />
        Connected via Aqara Builder remote proxy
      </div>
    </div>
  );
}
