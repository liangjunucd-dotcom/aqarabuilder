'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Cpu,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Settings2,
  Play,
  Pause,
  MoreVertical,
  Zap,
  Sparkles,
  ArrowRight,
  Activity,
  ExternalLink,
  Shield,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { MyAutomations, MySpaces } from '@/lib/mock/automations';
import { cn } from '@/lib/utils';

export default function DevicesPage() {
  const [spaceId, setSpaceId] = useState('space-home');
  const [spaceOpen, setSpaceOpen] = useState(false);
  const space = MySpaces.find(s => s.id === spaceId)!;

  const automations = MyAutomations.filter(a => a.spaceId === spaceId);
  const activeAutos = automations.filter(a => a.status === 'active');
  const draftAutos = automations.filter(a => a.status === 'draft');
  const pausedAutos = automations.filter(a => a.status === 'paused');
  // Source-of-truth split for Studio fusion narrative
  const fromBuilder = activeAutos.filter(a => a.createdFrom === 'ai').length;
  const fromStudio = activeAutos.length - fromBuilder;

  return (
    <div className="min-h-screen">
      <UserTopBar title="My Home" />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Space switcher */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <button
              onClick={() => setSpaceOpen(o => !o)}
              className="flex items-center gap-3 p-3 pr-4 rounded-xl bg-bg-elevated border border-border hover:border-border-strong transition min-w-[260px]"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20 border border-border flex items-center justify-center text-xl">
                {space.emoji}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium truncate">{space.name}</div>
                <div className="text-2xs text-text-muted">
                  {space.deviceCount} 设备 · {space.studioName}
                </div>
              </div>
              <ChevronDown size={14} className={cn('text-text-muted transition', spaceOpen && 'rotate-180')} />
            </button>
            {spaceOpen && (
              <motion.div
                initial={{ y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 w-80 card p-2 z-30 shadow-2xl"
              >
                <div className="px-2 py-1 text-2xs text-text-subtle">切换 Space</div>
                {MySpaces.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSpaceId(s.id);
                      setSpaceOpen(false);
                    }}
                    className={cn(
                      'w-full p-2.5 rounded-md flex items-center gap-3 text-left transition',
                      s.id === spaceId ? 'bg-white/10' : 'hover:bg-white/5'
                    )}
                  >
                    <div className="w-8 h-8 rounded-md bg-white/5 border border-border flex items-center justify-center text-base">
                      {s.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        {s.name}
                        {s.isDefault && <span className="text-2xs text-accent-glow">默认</span>}
                      </div>
                      <div className="text-2xs text-text-muted">{s.deviceCount} 设备 · {s.studioName}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-2xs text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Studio
                    </span>
                  </button>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button className="w-full p-2 rounded-md text-left text-sm text-accent-glow hover:bg-accent/10 inline-flex items-center gap-2">
                    <Plus size={12} /> 添加新 Space
                  </button>
                </div>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md border border-border hover:border-border-strong">
              <Settings2 size={13} />
            </button>
            <button className="px-3 py-2 text-xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1.5">
              <Plus size={12} /> 添加设备
            </button>
          </div>
        </div>

        {/* Space stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <StatCard icon={Smartphone} color="accent" label="设备总数" value={space.deviceCount} unit="台" />
          <StatCard icon={HardDrive} color="success" label="Studio 本地运行" value="99.8%" unit="" />
          <StatCard icon={Activity} color="success" label="活跃自动化" value={activeAutos.length} unit="个" />
          <StatCard icon={AlertTriangle} color="warning" label="需要关注" value={2} unit="条" sub="2 个低电量" />
        </div>

        {/* Automations */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap size={16} className="text-accent-glow" />
                自动化 / Scenes
              </h2>
              <p className="mt-1 text-2xs text-text-muted">
                <span className="text-text num">{activeAutos.length + pausedAutos.length}</span> 条在 Studio 运行 ·
                <a href="/studio/home" target="_blank" rel="noopener noreferrer" className="text-accent-glow ml-1 hover:underline">在 Studio Web 管理</a>
              </p>
            </div>
            <Link
              href="/build?entry=personal&demo_as=builder"
              className="px-3 py-1.5 text-xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1.5"
            >
              <Sparkles size={12} /> Aqara Design 创建
            </Link>
          </div>

          {/* Only show AI-generated drafts pending activation */}
          {draftAutos.length > 0 ? (
            <div className="card p-4 border-accent/30 bg-accent/5">
              <div className="flex items-start gap-3">
                <Sparkles size={16} className="text-accent-glow mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    <span className="num">{draftAutos.length}</span> 个 AI 草稿待激活
                  </div>
                  <p className="text-2xs text-text-muted mt-0.5">
                    在 Aqara Design 生成的自动化，预览效果后一键激活，或继续微调再用。
                  </p>
                </div>
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {draftAutos.map(a => (
                  <AutomationCard key={a.id} auto={a} />
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-sm text-text-muted">所有 Aqara Design 草稿均已激活</p>
              <Link href="/build?entry=personal&demo_as=builder" className="mt-2 inline-flex items-center gap-1 text-2xs text-accent-glow hover:underline">
                <Sparkles size={10} /> 创建新的自动化
              </Link>
            </div>
          )}
        </section>

        {/* Studio hardware section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Cpu size={16} className="text-accent-glow" />
              Aqara Studio
              <span className="text-2xs text-text-muted font-normal">本地 AI 大脑 · 你家的"私有云"</span>
            </h2>
            <a
              href="/studio/home"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs rounded-md border border-accent/40 bg-accent/5 hover:bg-accent/10 text-accent-glow inline-flex items-center gap-1.5"
            >
              <ExternalLink size={11} /> 远程访问 Studio Web Console
            </a>
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-4 border-b border-border">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20 border border-border flex items-center justify-center">
                <Cpu size={20} className="text-accent-glow" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{space.studioName}</span>
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-success/15 border border-success/30 text-success inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                    在线
                  </span>
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-white/5 border border-border text-text-muted inline-flex items-center gap-1">
                    <HardDrive size={9} /> 本地运行
                  </span>
                </div>
                <div className="text-2xs text-text-muted mt-0.5 font-mono">
                  192.168.1.42 · aqarastudio-b9c4 · 运行 67 天
                </div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10">管理</button>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Meter label="CPU" value="28%" tone="success" />
              <Meter label="内存" value="41%" tone="success" />
              <Meter label="本月可用率" value="99.8%" tone="success" />
              <Meter label="自动化执行" value="2,847 次" tone="success" />
            </div>
          </div>
        </section>

        {/* Bottom CTA — contact builder */}
        <section className="mt-12">
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent2/10 pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="text-3xl">👋</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">想把家做得更有个性?</div>
                <p className="mt-1 text-2xs text-text-muted">
                  找一位 Certified Installer 上门做专业方案。他们可以做:全屋定制 Persona、复杂场景编排、特殊硬件集成。
                </p>
              </div>
              <Link
                href="/home/find-pro"
                className="px-4 py-2 text-xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white font-medium whitespace-nowrap inline-flex items-center gap-1"
              >
                Find Pros <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  color,
  label,
  value,
  unit,
  sub,
}: {
  icon: any;
  color: 'accent' | 'success' | 'warning';
  label: string;
  value: number | string;
  unit?: string;
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
      <div className="mt-1.5 text-2xl font-semibold num">
        {value}
        {unit && <span className="text-xs text-text-muted ml-1">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-2xs text-text-subtle">{sub}</div>}
    </div>
  );
}

function Meter({ label, value, tone }: { label: string; value: string; tone: 'success' | 'warning' }) {
  return (
    <div>
      <div className="text-2xs text-text-muted">{label}</div>
      <div className={cn('mt-1 text-xl font-semibold num', tone === 'success' ? 'text-success' : 'text-warning')}>{value}</div>
    </div>
  );
}

function SyncCell({
  icon: Icon,
  color,
  title,
  desc,
  stat,
}: {
  icon: any;
  color: string;
  title: string;
  desc: string;
  stat: string;
}) {
  return (
    <div className="p-3 rounded-md border border-border bg-white/[0.02]">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded border flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, borderColor: `${color}40` }}
        >
          <Icon size={12} style={{ color }} />
        </div>
        <div className="text-xs font-medium">{title}</div>
      </div>
      <p className="text-2xs text-text-muted leading-relaxed">{desc}</p>
      <div className="mt-2 text-2xs num text-text-muted">{stat}</div>
    </div>
  );
}

function AutomationCard({ auto: a }: { auto: typeof MyAutomations[0] }) {
  return (
    <div className="card p-4 hover:border-border-strong transition group relative">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{a.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm">{a.name}</span>
            {a.createdFrom === 'ai' && (
              <span className="text-2xs px-1 py-0 rounded bg-accent/15 border border-accent/30 text-accent-glow inline-flex items-center gap-0.5">
                <Sparkles size={9} /> AI
              </span>
            )}
          </div>
          <div className="mt-1 text-2xs text-text-muted line-clamp-1">{a.trigger}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {a.actions.slice(0, 3).map((act, i) => (
              <span key={i} className="text-2xs px-1.5 py-0.5 rounded bg-white/5 border border-border text-text-muted">
                {act}
              </span>
            ))}
            {a.actions.length > 3 && (
              <span className="text-2xs text-text-subtle">+{a.actions.length - 3}</span>
            )}
          </div>
          {a.lastTriggered && a.status === 'active' && (
            <div className="mt-2 text-2xs text-text-subtle">上次触发 · {a.lastTriggered}</div>
          )}
        </div>
        {a.status === 'active' && (
          <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5 opacity-0 group-hover:opacity-100 transition">
            <Pause size={12} />
          </button>
        )}
        {a.status === 'paused' && (
          <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5">
            <Play size={12} />
          </button>
        )}
        {a.status === 'draft' && (
          <button className="px-2 py-1 text-2xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white whitespace-nowrap">
            激活
          </button>
        )}
      </div>
    </div>
  );
}
