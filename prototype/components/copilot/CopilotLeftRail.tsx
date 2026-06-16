'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Package, Cpu, History,
  Search, Lock, ChevronDown, ChevronRight,
  Plus, Zap, Sparkles,
  // 角色 Agent icons
  Home as HomeIcon, Users, Wifi, Layers, Clock,
  Bolt, BarChart3, Stethoscope, Activity, Server,
  Code, Compass, FileText, ShieldCheck, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AGENTS, AGENT_GROUPS,
  type Agent, type AgentForm,
  isAgentLocked,
} from '@/lib/mock/agents';
import {
  SOLUTIONS, VISIBILITY_META,
  STUDIO_CONNECTIONS, STUDIO_KIND_META, STUDIO_STATUS_META,
} from '@/lib/mock/solutions';

// 把 lib 里的字符串 iconKey 映射到组件
const ICON_MAP: Record<string, any> = {
  home: HomeIcon, users: Users, cpu: Cpu, wifi: Wifi, layers: Layers,
  sparkles: Sparkles, zap: Zap, clock: Clock, bolt: Bolt,
  'bar-chart': BarChart3, stethoscope: Stethoscope, activity: Activity,
  server: Server, code: Code, compass: Compass, 'file-text': FileText,
  'shield-check': ShieldCheck, globe: Globe,
};

type LeftTab = 'agents' | 'solutions' | 'studios' | 'history';

interface Props {
  activeAgents: string[];
  onToggleAgent: (id: string) => void;
}

export function CopilotLeftRail({ activeAgents, onToggleAgent }: Props) {
  const [tab, setTab] = useState<LeftTab>('agents');

  return (
    <aside data-tour="left-rail" className="w-[260px] flex-shrink-0 border-r border-border flex flex-col bg-bg-elevated/30 min-h-0">
      {/* Tab bar */}
      <div className="flex border-b border-border flex-shrink-0">
        {(
          [
            { id: 'agents',    label: 'Agents',    icon: Bot,     badge: activeAgents.length },
            { id: 'solutions', label: 'Solutions', icon: Package, badge: SOLUTIONS.length },
            { id: 'studios',   label: 'Studios',   icon: Cpu,     badge: 5 },
            { id: 'history',   label: 'History',   icon: History, badge: 0 },
          ] as const
        ).map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition relative',
                active ? 'text-accent-glow' : 'text-text-subtle hover:text-text'
              )}
            >
              <div className="relative">
                <t.icon size={14} />
                {t.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold rounded-full bg-accent text-white leading-none num">
                    {t.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-none">{t.label}</span>
              {active && (
                <motion.span
                  layoutId="left-rail-active"
                  className="absolute bottom-0 left-2 right-2 h-px bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === 'agents'    && <AgentsPanel    activeAgents={activeAgents} onToggle={onToggleAgent} />}
        {tab === 'solutions' && <SolutionsPanel />}
        {tab === 'studios'   && <StudiosPanel />}
        {tab === 'history'   && <HistoryPanel />}
      </div>
    </aside>
  );
}

// ─── Agents tab ──────────────────────────────────────

function AgentsPanel({ activeAgents, onToggle }: { activeAgents: string[]; onToggle: (id: string) => void }) {
  const [q, setQ] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!q.trim()) return AGENTS;
    const s = q.trim().toLowerCase();
    return AGENTS.filter(a => a.name.toLowerCase().includes(s) || a.desc.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="flex flex-col">
      {/* Search */}
      <div className="px-3 pt-3 pb-2 sticky top-0 bg-bg-elevated/95 backdrop-blur z-10 border-b border-border">
        <div className="relative">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="搜 Agent..."
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded bg-bg/60 border border-border outline-none focus:border-border-strong placeholder:text-text-subtle"
          />
        </div>
        <div className="mt-2 text-2xs text-text-muted flex items-center justify-between">
          <span><span className="num text-accent-glow">{activeAgents.length}</span> 启用 · 共 <span className="num">{AGENTS.length}</span></span>
          <button className="text-accent-glow hover:underline">Marketplace →</button>
        </div>
      </div>

      {/* Groups */}
      {AGENT_GROUPS.map(g => {
        const groupAgents = filtered.filter(a => a.group === g.id);
        if (groupAgents.length === 0) return null;
        const isCollapsed = !!collapsed[g.id];
        return (
          <div key={g.id} className="border-b border-border last:border-b-0">
            <button
              onClick={() => setCollapsed(c => ({ ...c, [g.id]: !c[g.id] }))}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/5"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: g.color }} />
              <span className="text-2xs font-semibold uppercase tracking-wider">{g.label}</span>
              <span className="text-2xs text-text-subtle num">{groupAgents.length}</span>
              <span className="flex-1" />
              {isCollapsed ? <ChevronRight size={10} className="text-text-subtle" /> : <ChevronDown size={10} className="text-text-subtle" />}
            </button>
            {!isCollapsed && (
              <div className="px-2 pb-2 space-y-1">
                {groupAgents.map(a => (
                  <AgentCard
                    key={a.id}
                    agent={a}
                    active={activeAgents.includes(a.id)}
                    onToggle={() => onToggle(a.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AgentCard({ agent, active, onToggle }: { agent: Agent; active: boolean; onToggle: () => void }) {
  // 当前 builder = certified, 所有低于 certified 的都解锁,enterprise 锁住
  const locked = isAgentLocked(agent, 'certified');
  const Icon = ICON_MAP[agent.iconKey] ?? Sparkles;
  return (
    <button
      onClick={() => !locked && onToggle()}
      disabled={locked}
      className={cn(
        'w-full text-left p-2 rounded-md transition flex items-start gap-2 border relative group',
        active && !locked && 'border-accent/40 bg-accent/5',
        !active && !locked && 'border-transparent hover:bg-white/5 hover:border-border',
        locked && 'border-transparent opacity-50 cursor-not-allowed'
      )}
    >
      <div
        className="w-7 h-7 rounded border flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${agent.color}15`, borderColor: `${agent.color}40` }}
      >
        <Icon size={12} style={{ color: agent.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium truncate">{agent.name.replace(' Agent', '')}</span>
          {active && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
          {locked && <Lock size={9} className="text-warning" />}
        </div>
        <div className="text-[10px] text-text-muted mt-0.5 line-clamp-1 leading-tight">{agent.desc}</div>
        <div className="mt-1 flex items-center gap-1">
          <FormBadge form={agent.defaultForm} />
        </div>
      </div>
    </button>
  );
}

function FormBadge({ form }: { form: AgentForm }) {
  const meta = {
    ambient: { label: 'Ambient', color: '#06b6d4' },
    invoked: { label: 'Invoked', color: '#a855f7' },
    agentic: { label: 'Agentic', color: '#10b981' },
  }[form];
  return (
    <span
      className="text-[9px] px-1 py-0 rounded uppercase tracking-wider font-bold"
      style={{ background: `${meta.color}15`, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

// ─── Solutions tab ──────────────────────────────────────

function SolutionsPanel() {
  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2 sticky top-0 bg-bg-elevated/95 backdrop-blur z-10 border-b border-border">
        <button className="w-full px-2.5 py-1.5 rounded bg-gradient-to-br from-accent to-accent2 text-white text-2xs font-medium inline-flex items-center justify-center gap-1.5">
          <Plus size={11} /> Snapshot 当前为 Solution
        </button>
        <div className="mt-2 text-2xs text-text-muted flex items-center justify-between">
          <span><span className="num">{SOLUTIONS.length}</span> 个方案</span>
          <a href="/pro/build/solutions" className="text-accent-glow hover:underline">全部 →</a>
        </div>
      </div>
      <div className="px-2 pt-2 pb-3 space-y-1.5">
        {SOLUTIONS.map(s => (
          <a
            key={s.id}
            href="/pro/build/solutions"
            className="block p-2 rounded-md border border-border hover:border-accent/40 hover:bg-accent/[0.03] transition group"
          >
            <div className="flex items-start gap-2">
              <div
                className="w-9 h-9 rounded flex-shrink-0 relative overflow-hidden"
                style={{ background: s.thumbnailGradient }}
              >
                <div className="absolute inset-0 grid-pattern opacity-30" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium truncate group-hover:text-accent-glow transition">{s.name}</span>
                </div>
                <div className="text-[10px] text-text-muted mt-0.5 num">v{s.version} · {s.applicableArea}</div>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[9px] px-1 py-0 rounded font-medium"
                    style={{ background: `${VISIBILITY_META[s.visibility].color}20`, color: VISIBILITY_META[s.visibility].color }}
                  >
                    {VISIBILITY_META[s.visibility].label}
                  </span>
                  <span className="text-[9px] text-text-subtle inline-flex items-center gap-0.5">
                    🚀 <span className="num">{s.deployedTo}</span>
                  </span>
                  <span className="text-[9px] text-text-subtle inline-flex items-center gap-0.5">
                    ⑂ <span className="num">{s.forks}</span>
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Studios tab ──────────────────────────────────────

function StudiosPanel() {
  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2 sticky top-0 bg-bg-elevated/95 backdrop-blur z-10 border-b border-border">
        <button className="w-full px-2.5 py-1.5 rounded border border-dashed border-border hover:border-accent/50 text-2xs text-text-muted hover:text-accent-glow inline-flex items-center justify-center gap-1.5">
          <Plus size={11} /> 连接新 Studio (MCP)
        </button>
        <div className="mt-2 text-2xs text-text-muted flex items-center justify-between">
          <span><span className="num">{STUDIO_CONNECTIONS.filter(s => s.status === 'connected').length}</span> 在线 · <span className="num">{STUDIO_CONNECTIONS.length}</span> 总连接</span>
          <span className="num">5/20 配额</span>
        </div>
      </div>
      <div className="px-2 pt-2 pb-3 space-y-1.5">
        {STUDIO_CONNECTIONS.map(s => (
          <div
            key={s.id}
            className="p-2 rounded-md border border-border hover:border-border-strong"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: STUDIO_STATUS_META[s.status].color }}
              />
              <span className="text-xs font-medium truncate flex-1">{s.label}</span>
              <span
                className="text-[9px] px-1 py-0 rounded uppercase tracking-wider font-bold"
                style={{ background: `${STUDIO_KIND_META[s.kind].color}20`, color: STUDIO_KIND_META[s.kind].color }}
              >
                {STUDIO_KIND_META[s.kind].label}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-text-subtle">
              <span className="num">{s.online}/{s.devices}</span>
              <span>设备</span>
              {s.rtt !== undefined && (
                <>
                  <span>·</span>
                  <span className="num">{s.rtt}ms</span>
                </>
              )}
              <span>·</span>
              <span style={{ color: STUDIO_STATUS_META[s.status].color }}>{STUDIO_STATUS_META[s.status].label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── History tab ──────────────────────────────────────

const HISTORY = [
  { group: '今天', items: [
    { id: 'h1', title: '张奶奶家 · 适老化方案', time: '14:32', active: true },
    { id: 'h2', title: '李先生家 · 客厅观影优化', time: '11:08' },
  ]},
  { group: '昨天', items: [
    { id: 'h3', title: '别墅二楼 · Persona 重构', time: '昨天 18:42' },
    { id: 'h4', title: '出租 #3 · 漏水规则补充', time: '昨天 15:20' },
  ]},
  { group: '本周', items: [
    { id: 'h5', title: 'Fork Kim 适老化模板', time: '周一 09:15' },
    { id: 'h6', title: '小户型节能模板 v1', time: '周一 08:02' },
  ]},
];

function HistoryPanel() {
  return (
    <div className="flex flex-col p-3 space-y-3">
      {HISTORY.map(g => (
        <div key={g.group}>
          <div className="text-2xs uppercase tracking-wider text-text-subtle mb-1.5">{g.group}</div>
          <div className="space-y-0.5">
            {g.items.map(it => (
              <button
                key={it.id}
                className={cn(
                  'w-full text-left p-2 rounded-md transition flex items-start gap-2',
                  it.active ? 'bg-accent/10 ring-1 ring-accent/30' : 'hover:bg-white/5'
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-text-subtle mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{it.title}</div>
                  <div className="text-[10px] text-text-subtle mt-0.5">{it.time}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
