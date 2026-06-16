'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Network, Map, Cpu, Zap, GitBranch, Activity,
  Search, Filter, MoreHorizontal, Check, ChevronRight, Plus,
  Sparkles, CircleDot, Eye, Edit3,
  AlertTriangle, Trash2, Settings, Wifi, Users, Home as HomeIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';

type WorkspaceTab = 'topology' | 'floorplan' | 'devices' | 'rules' | 'diff' | 'run';

interface Props {
  studioId: string;
}

const TABS: { id: WorkspaceTab; label: string; icon: any; badge?: string }[] = [
  { id: 'topology',  label: 'Topology',  icon: Network },
  { id: 'floorplan', label: 'Floorplan', icon: Map },
  { id: 'devices',   label: 'Devices',   icon: Cpu, badge: '13' },
  { id: 'rules',     label: 'Rules',     icon: Zap, badge: '9' },
  { id: 'diff',      label: 'Diff',      icon: GitBranch, badge: '+25' },
  { id: 'run',       label: 'Run',       icon: Activity },
];

export function CopilotWorkspace({ studioId }: Props) {
  const [tab, setTab] = useState<WorkspaceTab>('topology');

  return (
    <main data-tour="workspace" className="flex-1 flex flex-col min-h-0 min-w-0 bg-white/[0.01]">
      {/* Tab bar */}
      <div className="h-10 border-b border-border bg-bg/40 flex items-center px-3 gap-0.5 flex-shrink-0 overflow-x-auto">
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 h-full text-xs transition relative whitespace-nowrap',
                active ? 'text-text' : 'text-text-muted hover:text-text'
              )}
            >
              <t.icon size={12} />
              <span>{t.label}</span>
              {t.badge && (
                <span className={cn(
                  'text-[9px] num px-1 py-0 rounded',
                  active ? 'bg-accent/20 text-accent-glow' : 'bg-white/5 text-text-muted'
                )}>
                  {t.badge}
                </span>
              )}
              {active && (
                <motion.span
                  layoutId="ws-active"
                  className="absolute bottom-0 left-2 right-2 h-px bg-accent"
                />
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5" title="过滤">
          <Filter size={12} />
        </button>
        <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5" title="更多">
          <MoreHorizontal size={12} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === 'topology'  && <TopologyView />}
        {tab === 'floorplan' && <FloorplanView />}
        {tab === 'devices'   && <DevicesView />}
        {tab === 'rules'     && <RulesView />}
        {tab === 'diff'      && <DiffView />}
        {tab === 'run'       && <RunView />}
      </div>
    </main>
  );
}

// ─── Topology ───────────────────────────────────────

const TOPO_ROOMS = [
  { id: 'r-bedroom',  name: '主卧',   x: 110, y: 100, color: '#a855f7', devices: 4, persona: '独居老人' },
  { id: 'r-hall',     name: '走廊',   x: 290, y: 100, color: '#f59e0b', devices: 1, hi: true },
  { id: 'r-bath',     name: '卫生间', x: 460, y: 100, color: '#06b6d4', devices: 3 },
  { id: 'r-living',   name: '客厅',   x: 110, y: 280, color: '#10b981', devices: 3 },
  { id: 'r-kitchen',  name: '厨房',   x: 290, y: 280, color: '#ec4899', devices: 1 },
  { id: 'r-entry',    name: '玄关',   x: 460, y: 280, color: '#0ea5e9', devices: 1 },
];

const TOPO_EDGES: [string, string, string?][] = [
  ['r-bedroom', 'r-hall', '夜间高风险动线'],
  ['r-hall', 'r-bath'],
  ['r-living', 'r-bath'],
  ['r-living', 'r-kitchen'],
  ['r-living', 'r-entry'],
  ['r-bedroom', 'r-living'],
];

function TopologyView() {
  return (
    <div className="relative h-full min-h-[500px]">
      {/* Toolbar overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2">
        <div className="card px-2.5 py-1.5 inline-flex items-center gap-1.5">
          <Sparkles size={11} className="text-accent-glow" />
          <span className="text-2xs">Space Agent 已识别 · <span className="num text-text">5</span> 房间 / <span className="num text-text">13</span> 设备</span>
        </div>
        <div className="card px-2.5 py-1.5 inline-flex items-center gap-1.5">
          <Users size={11} className="text-accent-glow" />
          <span className="text-2xs">Persona · <span className="text-accent-glow">独居老人</span></span>
        </div>
        <div className="flex-1" />
        <button className="card px-2.5 py-1.5 inline-flex items-center gap-1.5 text-2xs text-text-muted hover:text-text">
          <Plus size={11} /> 加房间
        </button>
        <button className="card px-2.5 py-1.5 inline-flex items-center gap-1.5 text-2xs text-text-muted hover:text-text">
          <Edit3 size={11} /> 编辑
        </button>
      </div>

      {/* SVG topology */}
      <svg viewBox="0 0 600 400" className="w-full h-full">
        <defs>
          <pattern id="topo-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="risk-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(245,158,11,0.35)" />
            <stop offset="100%" stopColor="rgba(245,158,11,0)" />
          </radialGradient>
        </defs>
        <rect width="600" height="400" fill="url(#topo-grid)" />

        {/* edges */}
        {TOPO_EDGES.map(([a, b, label], i) => {
          const fromR = TOPO_ROOMS.find(r => r.id === a)!;
          const toR = TOPO_ROOMS.find(r => r.id === b)!;
          const risky = !!label;
          return (
            <g key={i}>
              <line
                x1={fromR.x} y1={fromR.y} x2={toR.x} y2={toR.y}
                stroke={risky ? '#f59e0b' : 'rgba(255,255,255,0.18)'}
                strokeWidth={risky ? 2 : 1}
                strokeDasharray={risky ? '4 2' : undefined}
              />
              {label && (
                <text x={(fromR.x + toR.x) / 2} y={(fromR.y + toR.y) / 2 - 4} textAnchor="middle"
                      fill="#f59e0b" fontSize="9" fontWeight="500">{label}</text>
              )}
            </g>
          );
        })}

        {/* rooms */}
        {TOPO_ROOMS.map(r => (
          <g key={r.id} transform={`translate(${r.x},${r.y})`}>
            {r.hi && <circle r="60" fill="url(#risk-glow)" />}
            <circle r="36" fill={`${r.color}20`} stroke={`${r.color}80`} strokeWidth="1.5" />
            <circle r="36" fill="rgba(0,0,0,0.4)" />
            <text textAnchor="middle" dy="-2" fill="white" fontSize="13" fontWeight="600">{r.name}</text>
            <text textAnchor="middle" dy="14" fill="rgba(255,255,255,0.55)" fontSize="9">
              {r.devices} 设备
            </text>
            {r.persona && (
              <text textAnchor="middle" dy="-22" fill={r.color} fontSize="9" fontWeight="500">
                ◆ {r.persona}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Bottom legend */}
      <div className="absolute bottom-3 left-3 right-3 z-10 card px-3 py-2 flex items-center gap-4 text-2xs">
        <div className="inline-flex items-center gap-1.5">
          <span className="w-3 h-px bg-warning border-dashed" style={{ borderTop: '1px dashed' }} />
          <span className="text-text-muted">高风险动线</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a855f7' }} />
          <span className="text-text-muted">已绑 Persona</span>
        </div>
        <div className="flex-1" />
        <button className="text-accent-glow hover:underline inline-flex items-center gap-1">
          导出图谱 <ChevronRight size={9} />
        </button>
      </div>
    </div>
  );
}

// ─── Floorplan ───────────────────────────────────────

function FloorplanView() {
  return (
    <div className="p-6 h-full">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2">
            <Map size={13} className="text-accent-glow" />
            <span className="text-sm font-medium">张奶奶家 · 90m² 两居</span>
            <span className="text-2xs text-text-muted">· Space Agent 识别</span>
          </div>
          <div className="flex items-center gap-2 text-2xs">
            <button className="px-2 py-1 rounded border border-border hover:border-border-strong inline-flex items-center gap-1">
              <Eye size={10} /> 显示设备
            </button>
            <button className="px-2 py-1 rounded border border-border hover:border-border-strong inline-flex items-center gap-1">
              <Users size={10} /> 显示 Persona
            </button>
          </div>
        </div>
        <div className="flex-1 card p-6 relative">
          <FloorplanSVG pattern="rooms" showDevices showPersona className="text-text-muted" />
          <div className="absolute bottom-3 right-3 card px-3 py-2 text-2xs">
            <div className="text-text-muted">点击设备查看详情 · 拖动可重新放置</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Devices ───────────────────────────────────────

const DEVICES = [
  { id: 'd-fp2-1', name: 'FP2 雷达 #1',   room: '主卧',   model: 'FP2',          new: true, status: 'pending', power: 'AC' },
  { id: 'd-fp2-2', name: 'FP2 雷达 #2',   room: '卫生间', model: 'FP2',          new: true, status: 'pending', power: 'AC' },
  { id: 'd-led-1', name: '走廊 LED 灯带', room: '走廊',   model: 'LED-T1-Pro',   new: true, status: 'pending', power: 'AC' },
  { id: 'd-btn-1', name: '紧急按钮 #1',   room: '主卧',   model: 'WXKG13',       new: true, status: 'pending', power: 'CR2032' },
  { id: 'd-btn-2', name: '紧急按钮 #2',   room: '卫生间', model: 'WXKG13',       new: true, status: 'pending', power: 'CR2032' },
  { id: 'd-door',  name: '智能门锁',     room: '玄关',   model: 'A100 Zigbee',  new: true, status: 'pending', power: 'AA × 4' },
  { id: 'd-gw',    name: 'M3 网关',       room: '客厅',   model: 'M3',           new: true, status: 'pending', power: 'AC' },
  { id: 'd-env-1', name: '环境感应器 #1', room: '主卧',   model: 'TVOC',         new: true, status: 'pending', power: 'CR2450' },
  { id: 'd-win-1', name: '门窗传感器 #1', room: '主卧',   model: 'MCCGQ11',      new: true, status: 'pending', power: 'CR1632' },
  { id: 'd-win-2', name: '门窗传感器 #2', room: '客厅',   model: 'MCCGQ11',      new: true, status: 'pending', power: 'CR1632' },
];

function DevicesView() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            placeholder="搜索设备 / 房间 / 型号..."
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded bg-bg/60 border border-border outline-none focus:border-border-strong placeholder:text-text-subtle"
          />
        </div>
        <span className="text-2xs text-text-muted">
          共 <span className="num text-text">{DEVICES.length}</span> 设备 ·
          <span className="text-warning ml-1 num">{DEVICES.filter(d => d.new).length}</span> 待入网
        </span>
        <div className="flex-1" />
        <button className="text-2xs px-2.5 py-1.5 rounded bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1.5 font-medium">
          <Sparkles size={10} /> Provisioning · 一键配网
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-bg/40 border-b border-border">
            <tr className="text-text-muted">
              <th className="text-left px-3 py-2 font-medium">设备</th>
              <th className="text-left px-3 py-2 font-medium">房间</th>
              <th className="text-left px-3 py-2 font-medium">型号</th>
              <th className="text-left px-3 py-2 font-medium">供电</th>
              <th className="text-left px-3 py-2 font-medium">状态</th>
              <th className="text-right px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {DEVICES.map((d, i) => (
              <tr key={d.id} className={cn('border-b border-border last:border-b-0 group hover:bg-white/[0.02]', d.new && 'bg-warning/[0.03]')}>
                <td className="px-3 py-2.5">
                  <div className="inline-flex items-center gap-2">
                    {d.new && <span className="text-[9px] px-1 py-0 rounded bg-warning/20 text-warning font-bold tracking-wider">NEW</span>}
                    <span className="font-medium">{d.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-text-muted">{d.room}</td>
                <td className="px-3 py-2.5 text-text-muted num">{d.model}</td>
                <td className="px-3 py-2.5 text-text-subtle">{d.power}</td>
                <td className="px-3 py-2.5">
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/30 inline-flex items-center gap-1">
                    <CircleDot size={8} /> 待配网
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/5 text-text-muted">
                    <MoreHorizontal size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Rules ───────────────────────────────────────

const RULES = [
  { id: 'r1', name: '起夜引导 · 走廊灯渐亮',     trigger: 'FP2 检测到离床 (主卧)',   then: '走廊 LED · 2.5s 渐亮至 40%', when: '00:00-06:00', enabled: true, new: true },
  { id: 'r2', name: '卫生间安全照明',           trigger: 'FP2 检测到进入 (卫生间)', then: '卫生间灯 · 60%',             when: '夜间',      enabled: true, new: true },
  { id: 'r3', name: '紧急一键呼 · 推送女儿',     trigger: '紧急按钮按下',           then: 'SMS + 电话拨打 (女儿) + 摄像头开启', when: '任何时间', enabled: true, new: true },
  { id: 'r4', name: '离床过久检测',             trigger: 'FP2 检测到离床 > 15 分钟', then: '推送女儿 "可能需要关注"',   when: '01:00-05:00', enabled: true, new: true },
  { id: 'r5', name: '夜间门锁反锁提醒',          trigger: '21:00 仍未反锁',          then: '播报提醒 + 推送女儿',         when: '21:00 后',  enabled: true, new: true },
  { id: 'r6', name: '燃气泄漏 · 紧急联动',       trigger: '燃气感应器报警',          then: '关闭电磁阀 + SMS + 推送物业', when: '任何时间', enabled: true, new: true },
  { id: 'r7', name: '门窗异常 · 离家时段',       trigger: '门窗打开 (离家模式)',     then: '推送女儿 + 摄像头录像',       when: '离家',      enabled: true, new: true },
  { id: 'r8', name: '远程关怀日报',              trigger: '每日 09:00',              then: '生成昨日活动报告 → 女儿邮箱', when: '每天',     enabled: true, new: true },
  { id: 'r9', name: '环境异常告警',              trigger: 'TVOC > 阈值 / 温度异常',  then: '通风模式 + 推送',             when: '任何时间', enabled: false, new: true },
];

function RulesView() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xs text-text-muted">
          共 <span className="num text-text">{RULES.length}</span> 条规则 ·
          <span className="text-success ml-1 num">{RULES.filter(r => r.enabled).length}</span> 启用 ·
          <span className="text-warning ml-1 num">{RULES.filter(r => r.new).length}</span> 待部署
        </span>
        <div className="flex-1" />
        <button className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-border-strong inline-flex items-center gap-1.5">
          <Sparkles size={10} className="text-accent-glow" /> Linkage Agent · 冲突检查
        </button>
      </div>
      <div className="space-y-2">
        {RULES.map(r => (
          <div key={r.id} className={cn(
            'card p-3 flex items-start gap-3 group transition',
            r.new && 'border-warning/30 bg-warning/[0.02]'
          )}>
            <div className={cn(
              'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0',
              r.enabled ? 'bg-accent/15 text-accent-glow' : 'bg-white/5 text-text-subtle'
            )}>
              <Zap size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{r.name}</span>
                {r.new && <span className="text-[9px] px-1 py-0 rounded bg-warning/20 text-warning font-bold tracking-wider">NEW</span>}
                <span className="text-2xs text-text-subtle">· {r.when}</span>
              </div>
              <div className="mt-1 text-2xs text-text-muted flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-bg/60 border border-border">触发 · {r.trigger}</span>
                <ChevronRight size={10} className="text-text-subtle" />
                <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent-glow border border-accent/30">{r.then}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button className="p-1.5 rounded hover:bg-white/5 text-text-muted" title="编辑">
                <Edit3 size={11} />
              </button>
              <button className="p-1.5 rounded hover:bg-white/5 text-text-muted" title="删除">
                <Trash2 size={11} />
              </button>
            </div>
            <div className={cn(
              'w-8 h-4 rounded-full relative transition flex-shrink-0 mt-1',
              r.enabled ? 'bg-accent' : 'bg-white/10'
            )}>
              <div className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full bg-white transition',
                r.enabled ? 'left-4' : 'left-0.5'
              )} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Diff ───────────────────────────────────────

const DIFF = [
  { kind: 'add' as const,    items: [
    { type: '设备',     count: 13, names: 'FP2 × 2 / 走廊 LED / 紧急按钮 × 2 / 门窗 × 4 / 网关 / 环境 × 2 / 门锁' },
    { type: '自动化',   count: 9,  names: '起夜引导 / 紧急呼叫 / 离床检测 / 远程关怀日报 等' },
    { type: 'Persona', count: 2,  names: '独居老人 · 远程关怀(女儿账号)' },
  ]},
  { kind: 'modify' as const, items: [
    { type: '群组',     count: 1, names: '"夜间区域" 新增 卫生间 + 主卧' },
  ]},
  { kind: 'remove' as const, items: [] },
];

function DiffView() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <GitBranch size={13} className="text-accent-glow" />
        <span className="text-sm font-medium">Deploy Plan · 待部署到</span>
        <span className="text-sm font-medium text-accent-glow">张奶奶家 · 主屋 90m²</span>
        <span className="text-2xs text-text-muted">· 对比 Studio 当前状态</span>
        <div className="flex-1" />
        <button className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-border-strong inline-flex items-center gap-1.5">
          <Eye size={10} /> 干跑模拟
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <DiffStat label="新增" value={25} color="#10b981" />
        <DiffStat label="修改" value={1} color="#f59e0b" />
        <DiffStat label="删除" value={0} color="#64748b" />
        <DiffStat label="预计耗时" value="4m" color="#06b6d4" />
      </div>

      {/* Changes */}
      <div className="space-y-3">
        {DIFF.filter(d => d.items.length > 0).map(d => (
          <div key={d.kind} className="card overflow-hidden">
            <div className={cn(
              'px-3 py-2 text-2xs uppercase tracking-wider font-semibold flex items-center gap-2 border-b border-border',
              d.kind === 'add' && 'bg-success/[0.05] text-success',
              d.kind === 'modify' && 'bg-warning/[0.05] text-warning',
              d.kind === 'remove' && 'bg-rose-500/[0.05] text-rose-400',
            )}>
              <span>
                {d.kind === 'add' ? '+ 新增' : d.kind === 'modify' ? '~ 修改' : '- 删除'}
              </span>
              <span className="num font-normal">{d.items.reduce((s, x) => s + x.count, 0)}</span>
            </div>
            <div className="divide-y divide-border">
              {d.items.map((it, i) => (
                <div key={i} className="px-3 py-2.5 flex items-start gap-3">
                  <div className="text-xs text-text-muted w-16 flex-shrink-0">
                    {it.type}
                  </div>
                  <div className="text-xs num text-text font-medium w-8 flex-shrink-0">{it.count}</div>
                  <div className="flex-1 text-2xs text-text-muted leading-relaxed">{it.names}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom prompt */}
      <div className="mt-4 card p-3 border-warning/30 bg-warning/[0.04] flex items-start gap-2.5">
        <AlertTriangle size={14} className="text-warning flex-shrink-0 mt-0.5" />
        <div className="text-2xs text-text-muted leading-relaxed flex-1">
          物理部署不可逆。Builder Copilot 会在右侧请求你确认 · 部署后 72 小时内可一键回滚。
        </div>
        <button className="text-2xs px-2.5 py-1.5 rounded bg-gradient-to-br from-accent to-accent2 text-white font-medium inline-flex items-center gap-1.5 whitespace-nowrap">
          去审批 →
        </button>
      </div>
    </div>
  );
}

function DiffStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="card p-3 text-center" style={{ borderColor: `${color}40` }}>
      <div className="text-2xs text-text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold num" style={{ color }}>{value}</div>
    </div>
  );
}

// ─── Run / Event stream ───────────────────────────────────────

const EVENTS = [
  { t: '14:35:12', agent: 'Scene Agent',        msg: '正在生成 "远程关怀日报"...', level: 'info' },
  { t: '14:35:08', agent: 'Linkage Agent',      msg: '冲突检查通过 · 0 冲突',         level: 'success' },
  { t: '14:35:02', agent: 'Scene Agent',        msg: '已生成规则 7/9 · "门窗异常 · 离家时段"', level: 'info' },
  { t: '14:34:55', agent: 'Provisioning Agent', msg: '设备 BOM 写入 ¥6,840 / 预算 ¥8,000', level: 'success' },
  { t: '14:34:48', agent: 'Persona Agent',      msg: '应用 Persona: 独居老人 + 远程关怀', level: 'info' },
  { t: '14:34:42', agent: 'Space Agent',        msg: '识别 5 个房间 · 标注 2 条高风险动线', level: 'success' },
  { t: '14:34:35', agent: 'Copilot',            msg: 'Plan 创建 · 5 步骤', level: 'info' },
  { t: '14:34:32', agent: 'Copilot',            msg: '会话开始 · target: 张奶奶家', level: 'info' },
];

function RunView() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-sm font-medium">实时事件流</span>
        <span className="text-2xs text-text-muted">· tail -f copilot.log</span>
        <div className="flex-1" />
        <button className="text-2xs px-2 py-1 rounded text-text-muted hover:text-text">清空</button>
        <button className="text-2xs px-2 py-1 rounded text-text-muted hover:text-text">导出</button>
      </div>
      <div className="card p-3 font-mono text-2xs space-y-1.5 max-h-[60vh] overflow-y-auto">
        {EVENTS.map((e, i) => (
          <div key={i} className="flex items-start gap-2.5 leading-relaxed">
            <span className="text-text-subtle num">{e.t}</span>
            <span className={cn(
              'px-1 py-0 rounded text-[10px] font-semibold w-28 flex-shrink-0 text-center',
              e.level === 'success' ? 'bg-success/10 text-success' :
              e.level === 'info' ? 'bg-accent/10 text-accent-glow' : 'bg-warning/10 text-warning'
            )}>
              {e.agent}
            </span>
            <span className="text-text-muted flex-1">{e.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
