'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams, notFound } from 'next/navigation';
import { useClientProject } from '@/lib/hooks/use-client-project';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CheckCircle2,
  Wifi, Cloud, Crosshair, Rocket,
  ShieldCheck, Smartphone, Eye, Loader2,
} from 'lucide-react';
import { PHASE_META, type Project } from '@/lib/mock/projects';
import { cn } from '@/lib/utils';
import { DeviceMappingPanel } from '@/components/build/DeviceMappingPanel';
import {
  type PlanPoint,
  type StudioDevice,
  MOCK_PLAN_POINTS,
  MOCK_STUDIO_DEVICES,
  assignStudioDeviceToPoint,
  autoMatch,
  clearPointAssignment,
  confirmAllAutoMatched,
  confirmPointMapping,
} from '@/lib/device-mapping';

// ─────────────────────────────────────────────────────────────────────
//  /life/projects/[id]/install
//  Builder B 现场实施工作台（Aqara Life · Builder 施工模式）
//  也可从 IDE 项目页 → mapping 标签进入（同款面板，不同布局）
// ─────────────────────────────────────────────────────────────────────

type StepKey = 'connect' | 'fetch' | 'mapping' | 'deploy' | 'done';

const STEPS: { key: StepKey; label: string; sub: string; icon: any; color: string }[] = [
  { key: 'connect', label: '施工 Space',     sub: 'M300 上电 + 批量入网',  icon: Wifi,      color: '#06b6d4' },
  { key: 'fetch',   label: '拉取方案',       sub: '方案设备 · Studio 数据', icon: Cloud,     color: '#a855f7' },
  { key: 'mapping', label: '虚实绑定',       sub: '方案设备 · 现场验证',    icon: Crosshair, color: '#f59e0b' },
  { key: 'deploy',  label: '下发方案',       sub: '写入 Studio 本地运行',   icon: Rocket,    color: '#10b981' },
];

// ─── Main Component ───────────────────────────────────────────────────

function ProjectInstallContent() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const project = useClientProject(params?.id ?? '');

  const [step, setStep] = useState<StepKey>('connect');
  const [studioOnline, setStudioOnline] = useState(false);
  const [paired, setPaired] = useState(0);
  const [solutionFetched, setSolutionFetched] = useState(false);

  // mapping state — data lives here so the parent controls confirm/deploy gating
  const [points, setPoints] = useState<PlanPoint[]>([]);
  const [studioDevices] = useState<StudioDevice[]>(MOCK_STUDIO_DEVICES);

  const [deploying, setDeploying] = useState(false);
  const [deployedAt, setDeployedAt] = useState<string | null>(null);

  const totalPoints = MOCK_PLAN_POINTS.length;
  const confirmedCount = points.filter(p => p.status === 'confirmed').length;
  const allConfirmed = points.length > 0 && confirmedCount === points.length;

  useEffect(() => {
    const s = searchParams?.get('step');
    if (s === 'connect' || s === 'fetch' || s === 'mapping' || s === 'deploy' || s === 'done') {
      setStep(s);
    }
    if (s === 'mapping') {
      setStudioOnline(true);
      setPaired(totalPoints);
      setSolutionFetched(true);
      setPoints(autoMatch(MOCK_PLAN_POINTS, MOCK_STUDIO_DEVICES));
    }
  }, [searchParams, totalPoints]);

  if (project === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center text-2xs text-text-muted">
        加载中…
      </div>
    );
  }
  if (project === null) return notFound();

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  const handleConnectStudio = () => {
    setStudioOnline(true);
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setPaired(n);
      if (n >= totalPoints) {
        clearInterval(t);
        setTimeout(() => setStep('fetch'), 400);
      }
    }, 200);
  };

  const handleFetchSolution = () => {
    setTimeout(() => {
      setSolutionFetched(true);
      setPoints(autoMatch(MOCK_PLAN_POINTS, MOCK_STUDIO_DEVICES));
      setTimeout(() => setStep('mapping'), 600);
    }, 800);
  };

  // ─── mapping callbacks (data mutations, UI state lives in the panel) ───

  const handleTriggerFeedback = (pointCode: string) => {
    setPoints(prev => prev.map(p => p.pointCode === pointCode ? { ...p, feedbackActive: true } : p));
    setTimeout(() => {
      setPoints(prev => prev.map(p => p.pointCode === pointCode ? { ...p, feedbackActive: false } : p));
    }, 2000);
  };

  const handleConfirm = (pointCode: string) => {
    setPoints(prev => confirmPointMapping(prev, pointCode));
  };

  const handleBatchConfirmHigh = () => {
    setPoints(prev => confirmAllAutoMatched(prev));
  };

  const handleReassign = (pointCode: string) => {
    setPoints(prev => clearPointAssignment(prev, pointCode));
  };

  const handleAssignDevice = (pointCode: string, deviceId: string) => {
    setPoints(prev => assignStudioDeviceToPoint(prev, studioDevices, pointCode, deviceId));
  };

  const handleDeploy = () => {
    setDeploying(true);
    setTimeout(() => {
      setDeployedAt(new Date().toLocaleString('zh-CN'));
      setDeploying(false);
      setStep('done');
    }, 1800);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg">
      <Header project={project} />
      <Stepper steps={STEPS} currentIndex={currentStepIndex} />

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-32">
        {step === 'connect' && (
          <ConnectStep
            project={project}
            studioOnline={studioOnline}
            paired={paired}
            total={totalPoints}
            onConnect={handleConnectStudio}
          />
        )}

        {step === 'fetch' && (
          <FetchStep
            project={project}
            fetched={solutionFetched}
            onFetch={handleFetchSolution}
          />
        )}

        {step === 'mapping' && (
          <DeviceMappingPanel
            points={points}
            studioDevices={studioDevices}
            onTriggerFeedback={handleTriggerFeedback}
            onConfirm={handleConfirm}
            onReassign={handleReassign}
            onAssignDevice={handleAssignDevice}
            onBatchConfirmHigh={handleBatchConfirmHigh}
          />
        )}

        {step === 'deploy' && (
          <DeployStep
            project={project}
            mappedCount={confirmedCount}
            total={totalPoints}
            deploying={deploying}
            onDeploy={handleDeploy}
          />
        )}

        {step === 'done' && (
          <DoneStep project={project} deployedAt={deployedAt} />
        )}
      </div>

      <StickyCTA
        step={step}
        canProceed={
          (step === 'connect' && studioOnline && paired === totalPoints) ||
          (step === 'fetch' && solutionFetched) ||
          (step === 'mapping' && allConfirmed) ||
          (step === 'deploy' && !!deployedAt)
        }
        onNext={() => {
          if (step === 'mapping') setStep('deploy');
          if (step === 'done') router.push('/pro/projects/' + project.id + '/overview');
        }}
        deploying={deploying}
        onDeploy={handleDeploy}
      />
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────

function Header({ project }: { project: Project }) {
  const phase = (project.phase || 'installing') as keyof typeof PHASE_META;
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
      <Link href={`/pro/projects/${project.id}/overview`} className="p-1 rounded-lg hover:bg-bg-subtle">
        <ChevronLeft size={20} className="text-text-muted" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-2xs px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 inline-flex items-center gap-1">
            <ShieldCheck size={9} /> Builder · 施工模式
          </span>
        </div>
        <h1 className="text-base font-semibold text-text mt-1">现场实施工作台</h1>
        <p className="text-2xs text-text-subtle truncate mt-0.5">{project.title} · {project.customerName}</p>
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
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────

function Stepper({ steps, currentIndex }: { steps: typeof STEPS; currentIndex: number }) {
  return (
    <div className="px-5 py-3 border-b border-border shrink-0 flex items-center gap-1.5 overflow-x-auto">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const active = i === currentIndex;
        const done = i < currentIndex;
        return (
          <div key={s.key} className="flex items-center gap-1.5 shrink-0">
            <div
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-2xs transition',
                active && 'bg-accent/10 text-accent-glow border border-accent/30',
                done && 'text-success',
                !active && !done && 'text-text-subtle'
              )}
              style={active ? { borderColor: `${s.color}50`, background: `${s.color}10`, color: s.color } : undefined}
            >
              {done ? <CheckCircle2 size={11} /> : <Icon size={11} />}
              <span className="font-medium">{i + 1}. {s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={10} className="text-text-subtle shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Connect ──────────────────────────────────────────────────

function ConnectStep({
  project, studioOnline, paired, total, onConnect,
}: {
  project: Project; studioOnline: boolean; paired: number; total: number;
  onConnect: () => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>第一步：创建项目施工 Space + 设备批量入网</SectionTitle>

      <div className="card p-4 border-amber-500/20 bg-amber-500/[0.04] text-2xs leading-relaxed">
        <p className="font-medium text-text mb-1">施工说明</p>
        <p className="text-text-muted">
          Studio Cloud 会为客户项目创建临时施工 Space。M300 上电检查后，设备先批量入网到该 Space，最后再做虚实绑定。
        </p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            studioOnline ? 'bg-success/15 text-success' : 'bg-bg-elevated text-text-muted'
          )}>
            {studioOnline ? <CheckCircle2 size={18} /> : <Wifi size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">M300 Studio · 项目施工 Space</div>
            <div className="text-2xs text-text-muted mt-0.5">
              {studioOnline ? '✓ 已接入临时 Space · 设备批量入网中' : '扫码连接 M300，并把现场设备批量入网'}
            </div>
          </div>
        </div>

        {studioOnline && (
          <>
            <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent2 transition-all"
                style={{ width: `${(paired / total) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-2xs">
              <span className="text-text-muted">现场设备入网</span>
              <span className="num text-accent-glow">{paired} / {total}</span>
            </div>
          </>
        )}

        {!studioOnline && (
          <button
            onClick={onConnect}
            className="w-full mt-2 px-4 py-3 rounded-xl bg-gradient-to-br from-accent to-accent2 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-lg"
          >
            <Wifi size={14} /> 连接 M300 · 批量入网
          </button>
        )}
      </div>

      <div className="card p-4 text-2xs space-y-2">
        <Row label="项目编号" value={project.id} />
        <Row label="设计师" value="Jun（云端定稿）" />
        <Row label="施工账号" value="Wei · Bronze · 上海" />
        <Row label="客户" value={project.customerName ?? '—'} />
      </div>
    </div>
  );
}

// ─── Step 2: Fetch Solution ───────────────────────────────────────────

function FetchStep({
  project, fetched, onFetch,
}: {
  project: Project; fetched: boolean; onFetch: () => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>第二步：拉取云端方案和 Studio 设备</SectionTitle>

      <div className="card p-5">
        <div className="grid grid-cols-3 gap-3">
          <Cell label="云端方案" value={fetched ? '✓ 已下载' : '待下载'} tone={fetched ? 'success' : 'muted'} />
          <Cell label="方案设备" value="14 个" />
          <Cell label="自动化场景" value="5 套" />
        </div>

        {!fetched ? (
          <button
            onClick={onFetch}
            className="mt-4 w-full px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <Cloud size={14} /> 拉取方案设备 · 读取 Studio 设备
          </button>
        ) : (
          <div className="mt-4 p-3 rounded-xl border border-success/30 bg-success/[0.04] text-2xs">
            <div className="flex items-center gap-2 text-success font-medium">
              <CheckCircle2 size={12} /> 数字孪生对齐完成
            </div>
            <p className="text-text-muted mt-1.5 leading-relaxed">
              Studio 已挂载在项目施工 Space 下。已读取 Studio 内全部已入网设备，准备进入虚实绑定。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Deploy ───────────────────────────────────────────────────

function DeployStep({
  project, mappedCount, total, deploying, onDeploy,
}: {
  project: Project; mappedCount: number; total: number; deploying: boolean; onDeploy: () => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>第四步：校验并下发到 Studio</SectionTitle>

      <div className="card p-5">
        <div className="grid grid-cols-3 gap-3">
          <Cell label="设备映射" value={`${mappedCount}/${total}`} tone="success" />
          <Cell label="自动化规则" value="5 套" />
          <Cell label="部署目标" value="Studio · 本地" />
        </div>
        <div className="mt-4 p-3 rounded-xl bg-bg-elevated text-2xs leading-relaxed text-text-muted">
          下发空间结构、设备绑定关系、设备命名、参数配置与自动化规则。验收后平台会把临时施工 Space 转移到客户 Space。
        </div>
      </div>

      {deploying && (
        <div className="card p-5 flex items-center gap-3">
          <Loader2 size={16} className="text-accent-glow animate-spin" />
          <div className="flex-1 text-2xs">
            正在下发空间结构 + 设备绑定 + 自动化规则…
            <div className="text-text-subtle mt-0.5">写入 Project Timeline</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 5: Done ────────────────────────────────────────────────────

function DoneStep({ project, deployedAt }: { project: Project; deployedAt: string | null }) {
  return (
    <div className="space-y-4">
      <div className="card p-5 border-success/30 bg-success/[0.04] text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/15 mb-3"
        >
          <CheckCircle2 size={28} className="text-success" />
        </motion.div>
        <h2 className="text-base font-semibold mb-1">现场部署完成</h2>
        <p className="text-2xs text-text-muted">本地化部署已完成 · {deployedAt}</p>
        <p className="mt-2 text-2xs text-text-subtle">Studio 暂挂项目施工 Space，客户验收后由平台转移到客户 Space。</p>
      </div>

      <div className="card p-5 space-y-3">
        <div className="text-xs font-medium">下一步</div>
        <Link
          href={`/life/projects/${project.id}/accept`}
          className="flex items-start gap-3 p-3 rounded-xl border border-accent/40 bg-accent/[0.05] hover:bg-accent/[0.08] transition"
        >
          <Smartphone size={14} className="text-accent-glow mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-accent-glow">通知客户验收</div>
            <div className="text-2xs text-text-muted mt-0.5">客户在 Aqara Life App 接收项目，确认 Space 转移与服务权限</div>
          </div>
          <ChevronRight size={12} className="text-text-subtle mt-1" />
        </Link>
        <Link
          href={`/pro/projects/${project.id}/overview`}
          className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-border-strong transition"
        >
          <Eye size={14} className="text-text-muted mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">提交回执到 Builder Pro</div>
            <div className="text-2xs text-text-muted mt-0.5">Builder A 复核项目落地状态</div>
          </div>
          <ChevronRight size={12} className="text-text-subtle mt-1" />
        </Link>
      </div>
    </div>
  );
}

// ─── Sticky CTA ───────────────────────────────────────────────────────

function StickyCTA({
  step, canProceed, onNext, deploying, onDeploy,
}: {
  step: StepKey; canProceed: boolean; onNext: () => void; deploying: boolean; onDeploy: () => void;
}) {
  if (step === 'connect' || step === 'fetch') return null;
  return (
    <div className="sticky bottom-0 px-5 py-4 border-t border-border bg-bg/95 backdrop-blur-md">
      {step === 'mapping' && (
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition',
            canProceed
              ? 'bg-gradient-to-br from-accent to-accent2 text-white shadow-lg'
              : 'bg-bg-subtle text-text-subtle cursor-not-allowed'
          )}
        >
          {canProceed ? <><CheckCircle2 size={14} /> 全部确认 · 进入部署</> : '请先确认全部设备绑定'}
        </button>
      )}
      {step === 'deploy' && (
        <button
          onClick={onDeploy}
          disabled={deploying || canProceed}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition',
            !deploying && !canProceed
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg'
              : 'bg-bg-subtle text-text-subtle cursor-not-allowed'
          )}
        >
          {deploying ? <><Loader2 size={14} className="animate-spin" /> 下发中…</> : <><Rocket size={14} /> 一键下发部署</>}
        </button>
      )}
      {step === 'done' && (
        <button
          onClick={onNext}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-accent to-accent2 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
        >
          回到 Builder Pro · 提交回执 <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Building Blocks ──────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-2xs uppercase tracking-wide text-text-muted font-medium">{children}</div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-2xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text num">{value}</span>
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'muted' }) {
  return (
    <div className="rounded-md bg-bg-elevated px-3 py-2 border border-border">
      <div className="text-text-subtle text-2xs">{label}</div>
      <div className={cn(
        'mt-0.5 num',
        tone === 'success' ? 'text-success' : tone === 'muted' ? 'text-text-muted' : 'text-text'
      )}>{value}</div>
    </div>
  );
}

export default function ProjectInstallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-2xs text-text-muted">
          加载中…
        </div>
      }
    >
      <ProjectInstallContent />
    </Suspense>
  );
}
