'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Sparkles, Package, Rocket, GitFork, Upload,
  Layers, Cpu, Zap, Users, Puzzle, Star, TrendingUp, Crown,
  Calendar, ChevronRight, History, Eye, Settings, MoreHorizontal,
  Check, X, RefreshCw, Globe, Edit3, ExternalLink, Map,
  FileText, Shield, Network, BookOpen, ShoppingBag, DollarSign,
  ChevronDown, AlertTriangle, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SOLUTIONS, VISIBILITY_META, STATUS_META, STUDIO_CONNECTIONS,
  type Solution,
} from '@/lib/mock/solutions';
import { getProject } from '@/lib/mock/projects';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';

type DetailTab = 'overview' | 'topology' | 'devices' | 'rules' | 'variants' | 'versions' | 'forks';

export default function SolutionDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const s = SOLUTIONS.find(x => x.id === id);
  const project = getProject(id);

  // Redirect project IDs to the unified project overview
  useEffect(() => {
    if (project && !s) {
      router.replace(`/pro/projects/${id}/overview`);
    }
  }, [project, s, id, router]);

  if (project && !s) return null; // redirecting
  if (!s) return notFound();

  const [tab, setTab] = useState<DetailTab>('overview');
  const [publishOpen, setPublishOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Sticky breadcrumb */}
      <div className="border-b border-border bg-bg/95 sticky top-0 z-20 backdrop-blur-xl">
        <div className="px-6 py-2.5 flex items-center gap-2 text-2xs">
          <Link href="/pro/projects" className="text-text-muted hover:text-text inline-flex items-center gap-1">
            <ArrowLeft size={11} /> 创作与交付
          </Link>
          <ChevronRight size={9} className="text-text-subtle" />
          <span className="text-text truncate">{s.name}</span>
          <span className="text-text-subtle num">v{s.version}</span>
          <div className="flex-1" />
          <Link
            href={`/build?solution=${s.id}`}
            className="text-2xs text-accent-glow hover:underline inline-flex items-center gap-1"
          >
            在 Design Platform 打开 <ExternalLink size={9} />
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0" style={{ background: s.thumbnailGradient, opacity: 0.18 }} />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative px-6 py-6">
          <div className="flex items-start gap-5">
            {/* Thumbnail */}
            <div
              className="w-28 h-28 rounded-xl flex-shrink-0 relative overflow-hidden ring-1 ring-border-strong"
              style={{ background: s.thumbnailGradient }}
            >
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="absolute bottom-2 left-2 text-[10px] text-white/80 num">v{s.version}</div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-2xs px-1.5 py-0.5 rounded font-medium"
                  style={{
                    background: `${VISIBILITY_META[s.visibility].color}20`,
                    color: VISIBILITY_META[s.visibility].color,
                    border: `1px solid ${VISIBILITY_META[s.visibility].color}40`,
                  }}
                >
                  {VISIBILITY_META[s.visibility].label}
                </span>
                <span
                  className="text-2xs px-1.5 py-0.5 rounded font-medium"
                  style={{
                    background: `${STATUS_META[s.status].color}20`,
                    color: STATUS_META[s.status].color,
                    border: `1px solid ${STATUS_META[s.status].color}40`,
                  }}
                >
                  {STATUS_META[s.status].label}
                </span>
                <span className="text-2xs px-1.5 py-0.5 rounded bg-bg-elevated border border-border text-text-muted num">
                  {s.applicableArea}
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight">{s.name}</h1>
              <p className="mt-1.5 text-sm text-text-muted leading-relaxed max-w-2xl">
                {s.description}
              </p>

              <div className="mt-3 flex items-center gap-4 text-2xs text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <div className={cn('w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center text-[9px] font-semibold text-white', s.authorGradient)}>
                    {s.authorAvatar}
                  </div>
                  {s.author}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={9} /> 更新于 {s.lastUpdated}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Rocket size={9} className="text-success" /> <span className="num text-text">{s.deployedTo}</span> 部署
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitFork size={9} /> <span className="num text-text">{s.forks}</span> Forks
                </span>
                {s.rating && (
                  <span className="inline-flex items-center gap-1">
                    <Star size={9} className="text-warning fill-warning" />
                    <span className="num text-text">{s.rating}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/build?solution=${s.id}`}
                className="px-3 py-2 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-xs font-medium inline-flex items-center gap-1.5 hover:shadow-lg hover:shadow-accent/30 transition"
              >
                <Sparkles size={11} /> 打开编辑
              </Link>
              <Link
                href={`/pro/projects?new=1&solution=${s.id}`}
                className="px-3 py-2 rounded-md border border-border hover:border-border-strong text-xs inline-flex items-center gap-1.5"
              >
                <Package size={11} /> 用于项目
              </Link>
              {s.visibility !== 'marketplace' && (
                <button
                  onClick={() => setPublishOpen(true)}
                  className="px-3 py-2 rounded-md border border-border hover:border-border-strong text-xs inline-flex items-center gap-1.5"
                >
                  <Upload size={11} /> Publish
                </button>
              )}
              <button className="p-2 rounded text-text-muted hover:text-text hover:bg-white/5">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Specs row */}
          <div className="mt-5 grid grid-cols-6 gap-2">
            <SpecCard icon={Layers} value={s.rooms} label="房间" />
            <SpecCard icon={Cpu} value={s.devices} label="设备" />
            <SpecCard icon={Zap} value={s.rules} label="规则" />
            <SpecCard icon={Users} value={s.personas} label="Persona" />
            <SpecCard icon={Puzzle} value={s.pluginsRequired} label="插件依赖" />
            <SpecCard icon={Package} value={s.variants?.length ?? 1} label="变体" />
          </div>
        </div>
      </div>

      {/* Body — tabs + content */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Main */}
          <div>
            {/* Tabs */}
            <div className="flex items-center gap-0.5 border-b border-border mb-4">
              {(
                [
                  { id: 'overview',  label: '概览',     icon: BookOpen },
                  { id: 'topology',  label: '拓扑',     icon: Map },
                  { id: 'devices',   label: '设备清单', icon: Cpu, badge: s.devices },
                  { id: 'rules',     label: '规则',     icon: Zap, badge: s.rules },
                  { id: 'variants',  label: '变体',     icon: Package, badge: s.variants?.length ?? 0 },
                  { id: 'versions',  label: '版本',     icon: History },
                  { id: 'forks',     label: 'Forks',    icon: GitFork, badge: s.forks },
                ] as const
              ).map(t => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'px-3 py-2 inline-flex items-center gap-1.5 text-xs transition relative',
                      active ? 'text-text' : 'text-text-muted hover:text-text'
                    )}
                  >
                    <t.icon size={12} />
                    <span>{t.label}</span>
                    {'badge' in t && t.badge !== undefined && t.badge > 0 && (
                      <span className={cn(
                        'text-2xs num px-1 py-0 rounded',
                        active ? 'bg-accent/20 text-accent-glow' : 'bg-white/5 text-text-muted'
                      )}>
                        {t.badge}
                      </span>
                    )}
                    {active && (
                      <motion.span
                        layoutId="solution-tab"
                        className="absolute bottom-0 left-2 right-2 h-px bg-accent"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            {tab === 'overview' && <OverviewTab s={s} />}
            {tab === 'topology' && <TopologyTab solutionId={s.id} />}
            {tab === 'devices'  && <DevicesTab s={s} />}
            {tab === 'rules'    && <RulesTab s={s} />}
            {tab === 'variants' && <VariantsTab s={s} />}
            {tab === 'versions' && <VersionsTab />}
            {tab === 'forks'    && <ForksTab s={s} />}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-16 self-start">
            <SidebarCard title="性能指标">
              <SidebarMetric label="平均部署耗时" value="12 分钟" />
              <SidebarMetric label="平均设备入网" value="58 秒/台" />
              <SidebarMetric label="规则触发成功率" value="99.6%" highlight />
              <SidebarMetric label="部署 7 天内回滚率" value="0%" highlight />
            </SidebarCard>

            <SidebarCard title="商业化">
              {s.pricing && typeof s.pricing !== 'string' ? (
                <>
                  <div className="text-xs">
                    <div className="text-text-muted mb-1">订阅价</div>
                    <div className="text-2xl font-semibold num">
                      ¥{s.pricing.amount}
                      <span className="text-2xs text-text-muted ml-1">/月</span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <SidebarMetric label="累计订阅" value={`${s.subscribes}`} highlight />
                    <SidebarMetric label="本月新增" value={`+${Math.floor(s.subscribes / 3)}`} />
                    <SidebarMetric label="月收入(估)" value={`¥${s.subscribes * s.pricing.amount}`} highlight />
                  </div>
                </>
              ) : (
                <div className="text-2xs text-text-muted leading-relaxed">
                  尚未上架。
                  <button onClick={() => setPublishOpen(true)} className="text-accent-glow hover:underline ml-1">
                    Publish 到 Marketplace
                  </button>
                  ,被其他 Builder 订阅可获分成。
                </div>
              )}
            </SidebarCard>

            <SidebarCard title="依赖">
              <div className="space-y-1.5 text-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Aqara Life 插件</span>
                  <span className="num">{s.pluginsRequired}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">推荐网关</span>
                  <span>M3 Pro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">最低固件</span>
                  <span className="num">Aqara OS 3.4+</span>
                </div>
              </div>
            </SidebarCard>
          </aside>
        </div>
      </div>

      {/* Modals */}
      <PublishModal open={publishOpen} onClose={() => setPublishOpen(false)} solution={s} />
    </div>
  );
}

// ─── Spec card ───────────────────────────────────────

function SpecCard({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="card p-2.5 text-center">
      <Icon size={11} className="text-text-subtle mx-auto" />
      <div className="mt-1 text-xl font-semibold num">{value}</div>
      <div className="text-2xs text-text-muted mt-0.5">{label}</div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-3.5">
      <div className="text-2xs uppercase tracking-wider text-text-subtle font-semibold mb-2">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SidebarMetric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-2xs">
      <span className="text-text-muted">{label}</span>
      <span className={cn('num font-medium', highlight ? 'text-accent-glow' : 'text-text')}>{value}</span>
    </div>
  );
}

// ─── Overview tab ───────────────────────────────────────

function OverviewTab({ s }: { s: Solution }) {
  return (
    <div className="space-y-4">
      {/* Floorplan preview */}
      <div className="card overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center gap-2">
          <Map size={11} className="text-accent-glow" />
          <span className="text-xs font-medium">布局预览</span>
          <span className="text-2xs text-text-subtle">· 默认 M 变体</span>
          <div className="flex-1" />
          <button className="text-2xs text-text-muted hover:text-text inline-flex items-center gap-1">
            <Eye size={10} /> 完整视图
          </button>
        </div>
        <div className="p-4 h-64 bg-bg/20">
          <FloorplanSVG pattern="rooms" showDevices showPersona className="text-text-muted" />
        </div>
      </div>

      {/* Highlights */}
      <div className="card p-4">
        <div className="text-sm font-medium mb-3 inline-flex items-center gap-1.5">
          <Sparkles size={13} className="text-accent-glow" /> 方案亮点
        </div>
        <ul className="space-y-2 text-2xs">
          {[
            { icon: '🌙', t: '夜间安全',     d: 'FP2 雷达 + 走廊渐亮 2.5s 达 40% · 防跌不刺眼' },
            { icon: '🚨', t: '紧急一键呼',  d: '床头 + 卫生间紧急按钮 · 自动 SMS + 拨打子女' },
            { icon: '💛', t: '远程关怀',    d: '日报 + 实时离床检测 + 异常事件推送(隐私优先 · 不录像)' },
            { icon: '🔒', t: '隐私保障',    d: 'FP2 不采集图像 · 摄像头仅紧急触发录制 · 数据本地优先' },
          ].map((h, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-base leading-none mt-0.5">{h.icon}</span>
              <div>
                <div className="text-text font-medium">{h.t}</div>
                <div className="text-text-muted leading-relaxed">{h.d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Compatibility */}
      <div className="card p-4">
        <div className="text-sm font-medium mb-3 inline-flex items-center gap-1.5">
          <Shield size={13} className="text-success" /> 兼容性
        </div>
        <div className="grid grid-cols-2 gap-2 text-2xs">
          <Compat icon={Check} text="2-4 室户型 · 80-160m²" />
          <Compat icon={Check} text="独居 / 双人老人房" />
          <Compat icon={Check} text="Zigbee 3.0 + BLE Mesh" />
          <Compat icon={Check} text="Aqara OS 3.4+" />
          <Compat icon={AlertTriangle} text="复式 / 跨层(需另配方案)" warn />
          <Compat icon={AlertTriangle} text="洗手间无电源点位需改造" warn />
        </div>
      </div>
    </div>
  );
}

function Compat({ icon: Icon, text, warn }: { icon: any; text: string; warn?: boolean }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <Icon size={11} className={warn ? 'text-warning' : 'text-success'} />
      <span className="text-text-muted">{text}</span>
    </div>
  );
}

// ─── Topology / Devices / Rules / Variants / Versions / Forks ────────────

function TopologyTab({ solutionId }: { solutionId: string }) {
  return (
    <div className="card p-6 h-96 flex items-center justify-center text-text-muted text-sm">
      <div className="text-center">
        <Network size={32} className="mx-auto text-text-subtle mb-3" />
        <div>拓扑视图与 Design Platform 一致 ·
          <Link href={`/build?solution=${solutionId}`} className="text-accent-glow hover:underline ml-1">在 Design Platform 中编辑 →</Link>
        </div>
      </div>
    </div>
  );
}

function DevicesTab({ s }: { s: Solution }) {
  const devices = [
    { name: 'FP2 雷达',        model: 'FP2',         qty: 2, room: '主卧/卫生间', power: 'AC' },
    { name: '走廊 LED 灯带',   model: 'LED-T1-Pro',  qty: 1, room: '走廊',         power: 'AC' },
    { name: '紧急按钮',         model: 'WXKG13',      qty: 2, room: '主卧/卫生间', power: 'CR2032' },
    { name: '门窗传感器',       model: 'MCCGQ11',     qty: 4, room: '主卧/客厅/玄关', power: 'CR1632' },
    { name: '智能门锁',         model: 'A100 Zigbee', qty: 1, room: '玄关',         power: 'AA × 4' },
    { name: 'M3 网关',          model: 'M3',          qty: 1, room: '客厅',         power: 'AC' },
    { name: '环境感应器',       model: 'TVOC',        qty: 2, room: '主卧/客厅',   power: 'CR2450' },
  ];
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-bg/40 border-b border-border text-text-muted">
          <tr>
            <th className="text-left px-3 py-2 font-medium">设备</th>
            <th className="text-left px-3 py-2 font-medium">型号</th>
            <th className="text-right px-3 py-2 font-medium">数量</th>
            <th className="text-left px-3 py-2 font-medium">房间</th>
            <th className="text-left px-3 py-2 font-medium">供电</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d, i) => (
            <tr key={i} className="border-b border-border last:border-b-0 hover:bg-white/[0.02]">
              <td className="px-3 py-2.5 font-medium">{d.name}</td>
              <td className="px-3 py-2.5 text-text-muted num">{d.model}</td>
              <td className="px-3 py-2.5 text-right num">× {d.qty}</td>
              <td className="px-3 py-2.5 text-text-muted">{d.room}</td>
              <td className="px-3 py-2.5 text-text-subtle">{d.power}</td>
            </tr>
          ))}
          <tr className="bg-bg/20 font-medium">
            <td className="px-3 py-2.5">合计</td>
            <td></td>
            <td className="px-3 py-2.5 text-right num">{s.devices}</td>
            <td colSpan={2} className="px-3 py-2.5 text-text-muted">5 类设备</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function RulesTab({ s }: { s: Solution }) {
  const rules = [
    { name: '起夜引导 · 走廊灯渐亮',  trigger: 'FP2 检测离床',    when: '00:00-06:00' },
    { name: '卫生间安全照明',         trigger: 'FP2 检测进入',    when: '夜间' },
    { name: '紧急一键呼',             trigger: '紧急按钮',        when: '任何时间' },
    { name: '离床过久检测',           trigger: '> 15 分钟未回床', when: '01:00-05:00' },
    { name: '夜间门锁反锁提醒',       trigger: '21:00 未反锁',    when: '21:00 后' },
    { name: '燃气泄漏 · 紧急联动',    trigger: '感应器报警',      when: '任何时间' },
    { name: '门窗异常 · 离家时段',    trigger: '门窗打开',        when: '离家' },
    { name: '远程关怀日报',           trigger: '每日 09:00',      when: '每天' },
    { name: '环境异常告警',           trigger: 'TVOC 阈值',        when: '任何时间' },
  ].slice(0, s.rules);
  return (
    <div className="space-y-2">
      {rules.map((r, i) => (
        <div key={i} className="card p-3 flex items-start gap-3">
          <div className="w-7 h-7 rounded-md bg-accent/15 text-accent-glow flex items-center justify-center flex-shrink-0">
            <Zap size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{r.name}</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-2xs text-text-muted">
              <span className="px-1.5 py-0.5 rounded bg-bg/60 border border-border">触发 · {r.trigger}</span>
              <span className="text-text-subtle">· {r.when}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VariantsTab({ s }: { s: Solution }) {
  if (!s.variants || s.variants.length === 0) {
    return <div className="card p-6 text-center text-2xs text-text-muted">此方案没有变体 · 单一规格</div>;
  }
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {s.variants.map(v => (
        <div key={v.id} className="card p-4 hover:border-accent/40 transition cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold text-accent-glow tracking-tight">{v.label}</span>
            <span className="text-2xs text-text-muted num">{v.area}</span>
          </div>
          <div className="space-y-1 text-2xs">
            <div className="flex justify-between">
              <span className="text-text-muted">房间</span>
              <span className="num">{v.rooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">设备</span>
              <span className="num">{v.devices}</span>
            </div>
          </div>
          <button className="mt-3 w-full px-2.5 py-1.5 rounded text-2xs border border-border hover:border-accent/40 inline-flex items-center justify-center gap-1">
            选择此变体 <ArrowRight size={10} />
          </button>
        </div>
      ))}
    </div>
  );
}

function VersionsTab() {
  const versions = [
    { v: '2.3.1', date: '3 天前', changes: 'fix: FP2 灵敏度阈值调整(防误触发)', critical: false },
    { v: '2.3.0', date: '2 周前', changes: 'feat: 新增 TVOC 环境异常告警 + 远程关怀日报', critical: false },
    { v: '2.2.0', date: '1 个月前', changes: '⚠ breaking: 紧急按钮事件结构调整,旧版插件需重新配网', critical: true },
    { v: '2.1.0', date: '2 个月前', changes: 'feat: 多变体支持 · 增加 S/L 规格', critical: false },
    { v: '2.0.0', date: '3 个月前', changes: 'feat: 重构为标准 Solution 格式,可发布 Marketplace', critical: false },
    { v: '1.0.0', date: '6 个月前', changes: '初始版本 · 仅用于自有客户', critical: false },
  ];
  return (
    <div className="space-y-2">
      {versions.map((v, i) => (
        <div key={v.v} className="card p-3 flex items-start gap-3">
          <div className={cn(
            'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 num text-2xs font-bold',
            i === 0 ? 'bg-accent text-white' : 'bg-bg-elevated border border-border text-text-muted'
          )}>
            v{v.v.split('.')[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium num">v{v.v}</span>
              {i === 0 && <span className="text-2xs px-1.5 py-0 rounded bg-accent/15 text-accent-glow font-medium">当前</span>}
              {v.critical && <span className="text-2xs px-1.5 py-0 rounded bg-rose-500/15 text-rose-400 font-medium">破坏性</span>}
              <span className="text-2xs text-text-subtle ml-auto">{v.date}</span>
            </div>
            <div className="mt-1 text-2xs text-text-muted leading-relaxed">{v.changes}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ForksTab({ s }: { s: Solution }) {
  if (s.forks === 0) return <div className="card p-6 text-center text-2xs text-text-muted">尚无 Fork</div>;
  const forks = [
    { name: 'Kim 适老化 · 韩国本地化', author: 'Kim Min-jae', deployed: 47, time: '2 周前' },
    { name: '走廊雷达加强版',          author: '王师傅',      deployed: 8,  time: '3 周前' },
    { name: '中文播报优化',            author: '李工',        deployed: 12, time: '1 个月前' },
    { name: '父母异地版',              author: 'Daniel',      deployed: 3,  time: '1 个月前' },
  ].slice(0, Math.min(s.forks, 8));
  return (
    <div className="space-y-2">
      {forks.map((f, i) => (
        <div key={i} className="card p-3 flex items-center gap-3 hover:border-accent/30 transition">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-2xs font-semibold text-white">
            {f.author[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{f.name}</div>
            <div className="text-2xs text-text-muted">{f.author} · {f.time}</div>
          </div>
          <div className="text-2xs text-text-subtle inline-flex items-center gap-1">
            <Rocket size={9} /> <span className="num">{f.deployed}</span>
          </div>
          <button className="p-1.5 rounded hover:bg-white/5 text-text-muted">
            <ChevronRight size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Modals ───────────────────────────────────────

function DeployToStudioModal({ open, onClose, solution }: { open: boolean; onClose: () => void; solution: Solution }) {
  const [targetId, setTargetId] = useState('');
  const [variantId, setVariantId] = useState(solution.variants?.[0]?.id ?? '');
  return (
    <ModalShell open={open} onClose={onClose} icon={Rocket} iconColor="#10b981" title="Deploy 到 Studio">
      <div className="p-5 space-y-4">
        <div>
          <div className="text-2xs text-text-muted mb-1.5">目标 Studio</div>
          <div className="space-y-1.5">
            {STUDIO_CONNECTIONS.filter(s => s.kind !== 'sandbox').map(s => (
              <button
                key={s.id}
                onClick={() => setTargetId(s.id)}
                className={cn(
                  'w-full text-left p-2.5 rounded-md border transition flex items-center gap-2.5',
                  targetId === s.id ? 'border-accent/50 bg-accent/5' : 'border-border hover:border-border-strong'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{s.label}</div>
                  <div className="text-2xs text-text-muted num">{s.online}/{s.devices} 设备</div>
                </div>
                {targetId === s.id && <Check size={12} className="text-accent" />}
              </button>
            ))}
          </div>
        </div>

        {solution.variants && solution.variants.length > 0 && (
          <div>
            <div className="text-2xs text-text-muted mb-1.5">变体</div>
            <div className="flex gap-1.5">
              {solution.variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    'flex-1 py-2 rounded-md border text-xs transition',
                    variantId === v.id ? 'border-accent/50 bg-accent/5 text-accent-glow' : 'border-border hover:border-border-strong text-text-muted'
                  )}
                >
                  {v.label} <span className="num text-text-subtle ml-1">{v.area}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="card bg-warning/[0.04] border-warning/30 p-3 flex items-start gap-2 text-2xs">
          <AlertTriangle size={11} className="text-warning flex-shrink-0 mt-0.5" />
          <span className="text-text-muted leading-relaxed">
            Deploy 将物理修改目标 Studio · Copilot 会生成 Plan 并请求审批 · 72h 内可一键回滚
          </span>
        </div>
      </div>
      <div className="border-t border-border px-5 py-3 flex items-center gap-2">
        <button onClick={onClose} className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-border-strong">
          取消
        </button>
        <div className="flex-1" />
        <Link
          href="/pro/build/copilot"
          className={cn(
            'text-2xs px-3 py-1.5 rounded font-medium inline-flex items-center gap-1.5',
            targetId
              ? 'bg-gradient-to-br from-accent to-accent2 text-white'
              : 'bg-white/5 text-text-subtle pointer-events-none'
          )}
        >
          <Sparkles size={10} /> 在 Copilot 中规划部署 →
        </Link>
      </div>
    </ModalShell>
  );
}

function RemixModal({ open, onClose, solution }: { open: boolean; onClose: () => void; solution: Solution }) {
  const [name, setName] = useState(`${solution.name} (Remix)`);
  return (
    <ModalShell open={open} onClose={onClose} icon={GitFork} iconColor="#06b6d4" title="Remix 派生新方案">
      <div className="p-5 space-y-4">
        <div>
          <div className="text-2xs text-text-muted mb-1.5">新方案名称</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md bg-bg-elevated border border-border outline-none focus:border-border-strong"
          />
        </div>
        <div className="card p-3 bg-bg/30 space-y-2">
          <div className="text-2xs text-text-muted mb-1">从 <span className="text-text font-medium">{solution.name}</span> 继承</div>
          <RemixCheck label="空间图谱 + 房间结构" />
          <RemixCheck label={`${solution.devices} 台设备清单`} />
          <RemixCheck label={`${solution.rules} 条自动化规则`} />
          <RemixCheck label={`${solution.personas} 个 Persona`} />
        </div>
        <div className="text-2xs text-text-muted leading-relaxed">
          Remix 不影响原方案 · 上游更新时你会看到合并建议 · 已 Fork 给原作者(<span className="text-accent-glow">{solution.author}</span>)增长 Fork 计数。
        </div>
      </div>
      <div className="border-t border-border px-5 py-3 flex items-center gap-2">
        <button onClick={onClose} className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-border-strong">取消</button>
        <div className="flex-1" />
        <Link href="/pro/build/copilot" className="text-2xs px-3 py-1.5 rounded font-medium inline-flex items-center gap-1.5 bg-gradient-to-br from-accent to-accent2 text-white">
          <GitFork size={10} /> Fork 并打开 Copilot →
        </Link>
      </div>
    </ModalShell>
  );
}

function RemixCheck({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-2xs">
      <Check size={10} className="text-success" />
      <span className="text-text-muted">{label}</span>
    </div>
  );
}

function PublishModal({ open, onClose, solution }: { open: boolean; onClose: () => void; solution: Solution }) {
  const [type, setType] = useState<'free' | 'subscription'>('subscription');
  const [price, setPrice] = useState(39);
  return (
    <ModalShell open={open} onClose={onClose} icon={Upload} iconColor="#f59e0b" title="Publish 到 Marketplace">
      <div className="p-5 space-y-4">
        <div className="card p-3 bg-amber-500/[0.05] border-amber-500/30 flex items-start gap-2 text-2xs">
          <Crown size={11} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="text-text-muted leading-relaxed">
            Publish 后,其他 Builder 可订阅并 Deploy 给客户。你按订阅获 <span className="text-amber-400 font-medium">70%</span> 分成,平台 30%。
          </span>
        </div>
        <div>
          <div className="text-2xs text-text-muted mb-2">定价方式</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setType('free')}
              className={cn(
                'p-3 rounded-md border text-left transition',
                type === 'free' ? 'border-accent/50 bg-accent/5' : 'border-border hover:border-border-strong'
              )}
            >
              <div className="text-sm font-medium">免费</div>
              <div className="text-2xs text-text-muted mt-0.5">扩大影响力 · 积累 Reputation</div>
            </button>
            <button
              onClick={() => setType('subscription')}
              className={cn(
                'p-3 rounded-md border text-left transition',
                type === 'subscription' ? 'border-accent/50 bg-accent/5' : 'border-border hover:border-border-strong'
              )}
            >
              <div className="text-sm font-medium inline-flex items-center gap-1">月订阅 <DollarSign size={11} className="text-success" /></div>
              <div className="text-2xs text-text-muted mt-0.5">按月分成 · 推荐</div>
            </button>
          </div>
        </div>

        {type === 'subscription' && (
          <div>
            <div className="text-2xs text-text-muted mb-1.5">订阅价(¥/月)</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={price}
                onChange={e => setPrice(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 text-sm num rounded-md bg-bg-elevated border border-border outline-none focus:border-border-strong"
              />
              <span className="text-2xs text-text-muted">
                ≈ 月收入 ¥{price * (solution.subscribes || 30)} (按当前 {solution.subscribes || 30} 订阅估)
              </span>
            </div>
          </div>
        )}

        <div className="text-2xs text-text-muted leading-relaxed">
          <Lock size={10} className="inline mr-1" />
          Publish 需 Certified Badge · 内容须通过 Aqara Academy 审核(3-5 个工作日)
        </div>
      </div>
      <div className="border-t border-border px-5 py-3 flex items-center gap-2">
        <button onClick={onClose} className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-border-strong">取消</button>
        <div className="flex-1" />
        <button className="text-2xs px-3 py-1.5 rounded font-medium inline-flex items-center gap-1.5 bg-gradient-to-br from-accent to-accent2 text-white">
          <Upload size={10} /> 提交审核
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ open, onClose, icon: Icon, iconColor, title, children }: {
  open: boolean; onClose: () => void; icon: any; iconColor: string; title: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="card bg-bg-elevated w-[min(520px,100%)] max-h-[88vh] flex flex-col pointer-events-auto overflow-hidden shadow-2xl">
              <div className="px-5 py-3 border-b border-border flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}15`, color: iconColor }}>
                  <Icon size={14} />
                </div>
                <span className="text-sm font-semibold flex-1">{title}</span>
                <button onClick={onClose} className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5">
                  <X size={13} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
