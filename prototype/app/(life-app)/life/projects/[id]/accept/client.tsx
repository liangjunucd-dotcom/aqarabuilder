'use client';

import { useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useClientProject } from '@/lib/hooks/use-client-project';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Cpu,
  Camera,
  PlayCircle,
  Star,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Send,
  Phone,
  MessageSquare,
  ArrowRight,
  Hash,
  Lock,
  Activity,
  Zap,
  Home,
  Plus,
  Building2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { PHASE_META, type Project } from '@/lib/mock/projects';
import { cn } from '@/lib/utils';
import {
  SAMPLE_VISUALIZATION_ASSETS,
  outputTypeLabel,
  reviewStatusLabel,
} from '@/lib/mock/visualization';

// 客户已有的 Space 列表（mock）
const MY_SPACES = [
  { id: 'sp-home',    emoji: '🏠', name: '我的家',   desc: '上海 · M300 · 已有 18 台设备' },
  { id: 'sp-parents', emoji: '👴', name: '父母家',   desc: '杭州 · M300 · 已有 9 台设备' },
  { id: 'sp-shop',    emoji: '🏪', name: '我的门店', desc: '上海徐汇 · 商业空间' },
];

// ─────────────────────────────────────────────────────────────────────
//  /life/projects/[id]/accept
//  客户在 Aqara Life App 内：
//   · Phase = design-confirmed → 设计预览签字
//   · Phase = pending-acceptance → 现场装机验收（一键触发 Transfer）
//  对应 docs/01-product/builder-pro-delivery-flow.md 阶段 2.5 / 阶段 4
// ─────────────────────────────────────────────────────────────────────

const ISSUES = ['设备无响应', '场景未生效', '部分设备未配对', 'App 显示异常', '其他'];

export default function ProjectAcceptPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const project = useClientProject(params?.id ?? '');

  const [step, setStep] = useState<'info' | 'space-pick' | 'submitted'>('info');
  const [showDevices, setShowDevices] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [issue, setIssue] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [scenarioTested, setScenarioTested] = useState<Record<string, boolean>>({});
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [createNew, setCreateNew] = useState(false);

  if (project === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center text-2xs text-text-muted">
        加载中…
      </div>
    );
  }
  if (project === null) return notFound();

  const phase = project.phase || 'acceptance';
  const isDesignPreview = phase === 'designing';
  const isInstallAccept = phase === 'acceptance' || phase === 'completed';

  const SCENARIOS = isInstallAccept
    ? [
        { id: 's1', name: '起夜模式', desc: '夜里起身 → 走廊小夜灯 + 卫生间灯' },
        { id: 's2', name: '紧急呼叫', desc: '按下 SOS → 子女手机收到通知' },
        { id: 's3', name: '跌倒检测', desc: '人体传感器 + 报警逻辑' },
        { id: 's4', name: '回家场景', desc: '门开 → 灯亮 + 空调启动' },
        { id: 's5', name: '外出离家', desc: '关灯 + 安防布防' },
      ]
    : [];

  const allTested = SCENARIOS.every(s => scenarioTested[s.id]);

  const handleSubmit = () => {
    setStep('submitted');
    setTimeout(() => {
      router.push('/life/home?mode=remote&accepted=1');
    }, 2400);
  };

  const spaceChosen = createNew ? newSpaceName.trim().length > 0 : selectedSpaceId !== null;
  const chosenSpaceLabel = createNew
    ? newSpaceName.trim()
    : MY_SPACES.find(s => s.id === selectedSpaceId)?.name || '';

  if (step === 'submitted') {
    return <SuccessView phase={phase} project={project} spaceName={chosenSpaceLabel} />;
  }

  // 安装验收：先选 Space，再提交
  if (step === 'space-pick') {
    return (
      <SpacePickView
        project={project}
        spaces={MY_SPACES}
        selectedSpaceId={selectedSpaceId}
        onSelectSpace={id => { setSelectedSpaceId(id); setCreateNew(false); }}
        createNew={createNew}
        onCreateNew={() => { setCreateNew(true); setSelectedSpaceId(null); }}
        newSpaceName={newSpaceName}
        onNewSpaceName={setNewSpaceName}
        spaceChosen={spaceChosen}
        onBack={() => setStep('info')}
        onConfirm={handleSubmit}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-bg-subtle">
          <ChevronLeft size={20} className="text-text-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-text">
            {isDesignPreview ? '方案预览签字' : '安装验收'}
          </h1>
          <p className="text-2xs text-text-subtle truncate">{project.title}</p>
        </div>
        <span
          className="text-2xs px-2 py-0.5 rounded-full border"
          style={{
            background: `${PHASE_META[phase].color}15`,
            borderColor: `${PHASE_META[phase].color}40`,
            color: PHASE_META[phase].color,
          }}
        >
          {PHASE_META[phase].emoji} {PHASE_META[phase].label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-32">
        {/* Hero */}
        <div className="card p-5 overflow-hidden relative">
          <div
            className="absolute inset-x-0 top-0 h-12 opacity-20"
            style={{ background: project.thumbnailGradient }}
          />
          <div className="relative">
            <div className="text-2xs text-text-muted">{isDesignPreview ? '请确认设计方案' : '请验收安装质量'}</div>
            <h2 className="text-lg font-semibold mt-1">{project.title}</h2>
            <p className="text-2xs text-text-muted mt-1 leading-snug">{project.subtitle}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-2xs">
            <Info label="设备数量" value={`${project.devices} 件`} />
            <Info label="Persona" value={`${project.personas} 个`} />
            <Info label="所在地" value={project.countryLabel || '—'} />
            <Info
              label="合同金额"
              value={project.quotedAmount ? `¥${project.quotedAmount.toLocaleString()}` : '—'}
            />
          </div>
        </div>

        {/* Builder card */}
        <BuilderCard />

        {isDesignPreview ? (
          <DesignPreviewSection devices={project.devices} />
        ) : (
          <>
            {/* 测试场景 */}
            <SectionTitle icon={Activity}>测试场景（请逐个体验）</SectionTitle>
            <div className="space-y-2">
              {SCENARIOS.map(s => (
                <ScenarioRow
                  key={s.id}
                  name={s.name}
                  desc={s.desc}
                  tested={!!scenarioTested[s.id]}
                  onToggle={() => setScenarioTested(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                />
              ))}
            </div>

            {/* 设备清单（折叠） */}
            <button
              onClick={() => setShowDevices(o => !o)}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-bg-subtle text-left"
            >
              <Cpu size={13} className="text-text-subtle shrink-0" />
              <span className="flex-1 text-2xs text-text-subtle">设备清单（{project.devices} 件）</span>
              {showDevices ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <AnimatePresence>
              {showDevices && <DevicesList total={project.devices} />}
            </AnimatePresence>
          </>
        )}

        {/* 现场录屏（仅装机阶段） */}
        {isInstallAccept && <RecordingCard />}

        {/* 评价 */}
        <SectionTitle icon={Star}>对 Builder 评价</SectionTitle>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform active:scale-90"
              >
                <Star
                  size={28}
                  className={cn('transition-colors', n <= (hoverRating || rating) ? 'text-warning' : 'text-border-strong')}
                  fill={n <= (hoverRating || rating) ? 'currentColor' : 'none'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
            <span className="ml-2 text-2xs text-text-subtle">
              {['', '很差', '较差', '一般', '不错', '非常满意'][rating]}
            </span>
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="说几句鼓励 Builder 的话（可选）"
            className="mt-3 w-full px-3 py-2 text-2xs rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none resize-none"
            rows={2}
          />
        </div>

        {/* 报问题 */}
        <SectionTitle icon={AlertCircle}>有问题？告诉我们</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {ISSUES.map(i => (
            <button
              key={i}
              onClick={() => setIssue(prev => (prev === i ? null : i))}
              className={cn(
                'px-3 py-2 rounded-md border text-2xs text-left transition',
                issue === i ? 'border-warning bg-warning/10 text-warning' : 'border-border bg-bg-subtle text-text-muted hover:text-text'
              )}
            >
              {i}
            </button>
          ))}
        </div>

        {/* 验收承诺 */}
        <div className="card p-4 border-success/30 bg-success/[0.04]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-success"
            />
            <div className="flex-1 text-2xs leading-relaxed">
              <div className="text-text font-medium">
                {isDesignPreview ? '我已确认设计方案，同意 Builder 按此实施' : '我已完成场景验收测试，同意接收此项目'}
              </div>
              <div className="text-text-muted mt-1">
                {isInstallAccept && '下一步我将选择接收到哪个 Space。完成后 Studio 归我所有，Builder 保留 90 天运维授权（可随时撤销）。'}
                {isDesignPreview && '签字后该方案进入实施阶段，Builder 将按方案准备设备并安排上门。'}
              </div>
            </div>
          </label>
        </div>

        {/* 安全提示 */}
        <div className="text-2xs text-text-subtle leading-relaxed flex items-start gap-2 px-1">
          <ShieldCheck size={11} className="text-success mt-0.5 flex-shrink-0" />
          <span>
            签字 / 验收使用 Aqara IAM 鉴权，时间戳与 hash 写入不可篡改的 Project Timeline。
            该日志同时作为 Builder 结算与争议仲裁的唯一证据来源。
          </span>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-0 px-5 py-4 border-t border-border bg-bg/95 backdrop-blur-md">
        {isInstallAccept && !allTested && (
          <div className="text-2xs text-warning mb-2 flex items-center gap-1.5">
            <AlertCircle size={11} /> 请先体验全部 {SCENARIOS.length} 个测试场景
          </div>
        )}
        <button
          onClick={isInstallAccept ? () => setStep('space-pick') : handleSubmit}
          disabled={!agreed || (isInstallAccept && !allTested)}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition',
            agreed && (!isInstallAccept || allTested)
              ? 'bg-gradient-to-br from-accent to-accent2 text-white shadow-lg'
              : 'bg-bg-subtle text-text-subtle cursor-not-allowed'
          )}
        >
          {isDesignPreview ? (
            <>
              <Send size={14} /> 一键签字确认
            </>
          ) : (
            <>
              下一步：选择接收到哪个 Space <ChevronRight size={14} />
            </>
          )}
        </button>
        <div className="mt-2 text-2xs text-text-subtle text-center">
          {isInstallAccept ? '接收完成后 7 天冷静期自动结算给 Builder' : '签字后 Builder 将立即开始实施准备'}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Building Blocks ───────────────────────────

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-bg-subtle px-3 py-2 border border-border">
      <div className="text-text-subtle">{label}</div>
      <div className="text-text num mt-0.5">{value}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-2 text-2xs uppercase tracking-wide text-text-muted font-medium">
      <Icon size={11} />
      {children}
    </div>
  );
}

function BuilderCard() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent2/20 border border-accent/30 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-accent">J</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">Jun L.</span>
          <span className="text-2xs px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">Silver</span>
        </div>
        <div className="text-2xs text-text-muted mt-0.5">Aqara Certified Installer · 上海 · NPS 4.86</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <button className="p-1.5 rounded-md border border-border hover:border-border-strong">
          <Phone size={11} className="text-text-muted" />
        </button>
        <button className="p-1.5 rounded-md border border-border hover:border-border-strong">
          <MessageSquare size={11} className="text-text-muted" />
        </button>
      </div>
    </div>
  );
}

function DesignPreviewSection({ devices }: { devices: number }) {
  const heroAsset = SAMPLE_VISUALIZATION_ASSETS[0]!;
  const secondaryAsset = SAMPLE_VISUALIZATION_ASSETS[1]!;

  return (
    <>
      <SectionTitle icon={Sparkles}>客户方案效果预览（Design Platform · Pro 已审阅）</SectionTitle>
      <div className="card p-0 overflow-hidden">
        <div className={cn('h-48 bg-gradient-to-br grid-pattern relative overflow-hidden', heroAsset.gradient)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_24%),linear-gradient(120deg,rgba(15,23,42,0.05),rgba(15,23,42,0.62))]" />
          <div className="absolute left-[12%] top-[18%] h-[58%] w-[76%] rounded-[28px] border border-white/20 bg-white/10 shadow-2xl shadow-black/25 backdrop-blur-sm" />
          <div className="absolute left-4 top-4 rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-white backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/55">{outputTypeLabel(heroAsset.outputType)}</div>
            <div className="mt-1 text-sm font-semibold">{heroAsset.room} · {heroAsset.moment}</div>
          </div>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <div className="min-w-0 rounded-2xl border border-white/15 bg-black/30 p-3 text-white backdrop-blur">
              <div className="truncate text-sm font-semibold">{heroAsset.title}</div>
              <div className="mt-1 text-[10px] text-white/65">
                {reviewStatusLabel(heroAsset.reviewStatus)} · {heroAsset.providerLabel}
              </div>
            </div>
            <button className="shrink-0 px-3 py-2 rounded-full bg-white/12 backdrop-blur-md text-2xs text-white inline-flex items-center gap-1.5 border border-white/20">
              <PlayCircle size={12} /> 查看 3D 漫游
            </button>
          </div>
        </div>
        <div className="p-4 space-y-2 text-2xs">
          <Row label="空间图谱" value="✓ 已生成" />
          <Row label="设备清单" value={`${devices} 件已锁定`} />
          <Row label="自动化场景" value="5 套（起夜 / 紧急 / 跌倒 / 回家 / 外出）" />
          <Row label="可视化素材" value={`${outputTypeLabel(heroAsset.outputType)} + ${outputTypeLabel(secondaryAsset.outputType)} · 已加入客户评审包`} />
          <Row label="来源版本" value={`${heroAsset.sourceDesignPlanVersion} · ${heroAsset.promptHash}`} />
          <Row label="预计装机时长" value="约 4 小时" />
          <Row label="A 币消耗" value="240 A（已含在合同内）" />
          <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 leading-5 text-amber-600">
            这是方案效果预览，用于理解体验、灯光和设备价值；最终交付仍以报价、现场勘测、可施工设备和验收清单为准。
          </div>
        </div>
      </div>
    </>
  );
}

function DevicesList({ total }: { total: number }) {
  const items = [
    { cat: '传感器', n: Math.floor(total * 0.55), e: '人体 ×3 · 门窗 ×2 · 烟雾 ×1' },
    { cat: '执行器', n: Math.floor(total * 0.3), e: '智能开关 ×2 · 智能灯 ×1' },
    { cat: '安防', n: Math.floor(total * 0.15), e: '紧急按钮 + SOS 拉绳' },
  ];
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="px-4 py-3 rounded-xl border border-border bg-bg-subtle space-y-2.5">
        {items.map(it => (
          <div key={it.cat} className="flex items-center gap-2 text-2xs">
            <CheckCircle2 size={11} className="text-success shrink-0" />
            <span className="font-medium">{it.cat}</span>
            <span className="text-text-subtle">· {it.e}</span>
            <span className="ml-auto num text-text-muted">{it.n}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RecordingCard() {
  return (
    <>
      <SectionTitle icon={Camera}>现场装机录屏</SectionTitle>
      <div className="card p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0">
          <PlayCircle size={20} className="text-accent-glow" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-2xs font-medium">cubix-record-2026-05-19.mp4</div>
          <div className="text-2xs text-text-muted mt-0.5 flex items-center gap-2">
            <span>12 分 38 秒</span>
            <span>·</span>
            <span className="font-mono inline-flex items-center gap-0.5">
              <Hash size={9} />
              a51c4f...
            </span>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-md border border-accent/40 bg-accent/10 text-accent-glow text-2xs">
          播放
        </button>
      </div>
    </>
  );
}

function ScenarioRow({
  name, desc, tested, onToggle,
}: { name: string; desc: string; tested: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition',
        tested ? 'border-success/40 bg-success/[0.04]' : 'border-border bg-bg-subtle hover:border-border-strong'
      )}
    >
      <div
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0',
          tested ? 'bg-success/15 text-success' : 'bg-white/5 text-text-muted'
        )}
      >
        {tested ? <CheckCircle2 size={14} /> : <PlayCircle size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn('text-2xs font-medium', tested && 'text-success')}>{name}</div>
        <div className="text-2xs text-text-muted mt-0.5">{desc}</div>
      </div>
      <span className="text-2xs text-text-subtle">
        {tested ? '已通过' : '体验 →'}
      </span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}

// ─────────────────────────── Space 选择视图 ───────────────────────────

interface SpacePickViewProps {
  project: Project;
  spaces: typeof MY_SPACES;
  selectedSpaceId: string | null;
  onSelectSpace: (id: string) => void;
  createNew: boolean;
  onCreateNew: () => void;
  newSpaceName: string;
  onNewSpaceName: (v: string) => void;
  spaceChosen: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

function SpacePickView({
  project, spaces, selectedSpaceId, onSelectSpace,
  createNew, onCreateNew, newSpaceName, onNewSpaceName,
  spaceChosen, onBack, onConfirm,
}: SpacePickViewProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-bg-subtle">
          <ChevronLeft size={20} className="text-text-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-text">选择接收到哪个 Space</h1>
          <p className="text-2xs text-text-subtle truncate">{project.title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-32">
        {/* 说明 */}
        <div className="card p-4 border-accent/20 bg-accent/[0.04] text-2xs text-text-muted leading-relaxed">
          <p className="font-medium text-text mb-1">🤝 项目接收流程</p>
          <p>Builder 将把 Studio、设备与全套方案完整移交给你。请选择将此项目接收到哪个 Space，或创建一个新 Space 专属存放。</p>
          <p className="mt-2 text-text-subtle">移交完成后，Studio 永久留存在你家中独立运行；Builder 保留 90 天运维授权，可随时撤销。</p>
        </div>

        {/* 已有 Space */}
        <div className="text-2xs uppercase tracking-wide text-text-muted font-medium mt-1">接收到已有 Space</div>
        <div className="space-y-2">
          {spaces.map(sp => (
            <button
              key={sp.id}
              onClick={() => onSelectSpace(sp.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition',
                selectedSpaceId === sp.id
                  ? 'border-accent/50 bg-accent/[0.06]'
                  : 'border-border bg-bg-subtle hover:border-border-strong'
              )}
            >
              <span className="text-2xl">{sp.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm font-medium', selectedSpaceId === sp.id && 'text-accent-glow')}>{sp.name}</div>
                <div className="text-2xs text-text-muted mt-0.5">{sp.desc}</div>
              </div>
              {selectedSpaceId === sp.id && <CheckCircle2 size={16} className="text-accent-glow shrink-0" />}
            </button>
          ))}
        </div>

        {/* 创建新 Space */}
        <div className="text-2xs uppercase tracking-wide text-text-muted font-medium mt-2">或创建全新 Space</div>
        <button
          onClick={onCreateNew}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition',
            createNew ? 'border-accent/50 bg-accent/[0.06]' : 'border-dashed border-border hover:border-border-strong'
          )}
        >
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
            createNew ? 'bg-accent/15 text-accent-glow' : 'bg-bg-elevated text-text-subtle'
          )}>
            <Plus size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn('text-sm font-medium', createNew && 'text-accent-glow')}>创建新 Space</div>
            <div className="text-2xs text-text-muted mt-0.5">为此项目单独建一个 Space</div>
          </div>
          {createNew && <CheckCircle2 size={16} className="text-accent-glow shrink-0" />}
        </button>

        <AnimatePresence>
          {createNew && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="card p-4 space-y-3">
                <div className="text-2xs text-text-muted">Space 名称</div>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={e => onNewSpaceName(e.target.value)}
                  placeholder="例如：我的家、父母家、咖啡厅…"
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-bg-elevated border border-border focus:border-border-strong outline-none"
                  autoFocus
                />
                <p className="text-2xs text-text-subtle">新 Space 将自动添加到你的 Aqara Life · 我的空间</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 权限说明 */}
        <div className="card p-4 space-y-2.5 text-2xs">
          <div className="font-medium text-text flex items-center gap-1.5"><ShieldCheck size={13} className="text-success" /> 接收后你的权限</div>
          <div className="space-y-1.5 text-text-muted leading-snug">
            <p>✓ &nbsp;你成为 Studio 与 Space 的最高所有者</p>
            <p>✓ &nbsp;可自由控制设备、添加家庭成员、修改配置</p>
            <p>✓ &nbsp;Builder 自动降为运维授权（可远程维护，不可删设备或改核心逻辑）</p>
            <p>✓ &nbsp;可随时在 Space 设置中撤销 Builder 的运维授权</p>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 px-5 py-4 border-t border-border bg-bg/95 backdrop-blur-md">
        <button
          onClick={onConfirm}
          disabled={!spaceChosen}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition',
            spaceChosen
              ? 'bg-gradient-to-br from-accent to-accent2 text-white shadow-lg'
              : 'bg-bg-subtle text-text-subtle cursor-not-allowed'
          )}
        >
          <CheckCircle2 size={14} />
          {spaceChosen
            ? `确认接收到「${createNew ? (newSpaceName || '新 Space') : (MY_SPACES.find(s => s.id === selectedSpaceId)?.name ?? '…')}」`
            : '确认接收'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── Success View ───────────────────────────

function SuccessView({ phase, project, spaceName }: { phase: string; project: Project; spaceName?: string }) {
  const isDesign = phase === 'designing';
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 bg-bg">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      >
        <div className="relative">
          <CheckCircle2 size={72} className="text-success" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-success"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
        <h2 className="text-xl font-bold text-text mb-1">
          {isDesign ? '签字成功' : '项目接收完成 🎉'}
        </h2>
        <p className="text-sm text-text-muted">
          {isDesign
            ? 'Builder 将按此方案开始实施准备'
            : spaceName
              ? `Studio 已加入「${spaceName}」· 90 天保修期已开启`
              : 'Studio 已成为你的 · 90 天保修期已开启'
          }
        </p>
        {!isDesign && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-2xs text-success">
            <Lock size={11} /> 7 天冷静期后将自动结算给 Builder
          </div>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-2 w-full max-w-xs mt-2"
      >
        <Link
          href={`/life/home?mode=remote&studio=${encodeURIComponent(project.title)}`}
          className="px-4 py-3 rounded-xl bg-gradient-to-br from-accent to-accent2 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
        >
          {isDesign ? '查看进度' : '进入我的空间'} <ArrowRight size={13} />
        </Link>
        {!isDesign && (
          <button className="px-4 py-2.5 rounded-xl border border-border text-text-muted text-2xs inline-flex items-center justify-center gap-1.5">
            <Zap size={11} /> 立即试一个场景
          </button>
        )}
      </motion.div>
    </div>
  );
}
