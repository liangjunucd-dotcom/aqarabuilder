'use client';

// ─────────────────────────────────────────────────────────────────────────────
// /home/solutions  —  Your Solutions (个人设计资产)
//
// 展示用户的全部工作：设计阶段的方案 + 交付阶段的客户项目。
// - 设计方案 = 无客户关联，在 Build 中创作编辑
// - 客户项目 = 已关联客户，进入 Builder Pro 交付流程（Open → In Progress → Done → Closed）
// 方案关联客户后自动转为客户项目进入交付流程。
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Plus, Search, ArrowRight,
  Code2, Briefcase, Crown,
  CheckCircle2, FolderOpen,
  LayoutDashboard,
  Loader2,
  PenLine,
  X,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { SolutionPreviewCard } from '@/components/solutions/SolutionPreviewCard';
import { isProBuilderRole, useRole } from '@/lib/role';
import { cn } from '@/lib/utils';
import {
  getWorkspaceProjects,
  createCubixProject,
  deleteProject,
  normalizeProjectForDisplay,
  resolveSolutionStatus,
  saveCubixLocalProject,
  SOLUTION_STATUS_META,
  type Project,
} from '@/lib/mock/projects';
import { getFrontendWorkspaces, getStudiosForWorkspace, HEALTH_META, type Studio, type Workspace } from '@/lib/mock/studios';

type AccountStudioOption = {
  studio: Studio;
  workspace: Workspace;
};

function accountStudioOptions(): AccountStudioOption[] {
  return getFrontendWorkspaces().flatMap(workspace => (
    getStudiosForWorkspace(workspace.id).map(studio => ({ studio, workspace }))
  ));
}

function designPlatformHref(p: Project) {
  const isCustomerProject = !!(p.customerId || p.customerName);
  const isLifeDashboard = p.buildMode === 'life-dashboard';
  const params = new URLSearchParams();
  if (isCustomerProject) {
    params.set('entry', 'pro');
    params.set('demo_as', 'pro');
    params.set('project', p.id);
  } else {
    params.set('entry', 'personal');
    params.set('demo_as', 'builder');
    params.set('solution', p.id);
  }
  if (isLifeDashboard) {
    params.set('workflow', 'life');
    if (p.linkedStudioId) params.set('studioId', p.linkedStudioId);
    params.set('ready', '1');
  }
  return `/build?${params.toString()}`;
}

function deployHref(p: Project) {
  const params = new URLSearchParams();
  params.set('entry', p.customerId || p.customerName ? 'pro' : 'personal');
  params.set('demo_as', p.customerId || p.customerName ? 'pro' : 'builder');
  params.set(p.customerId || p.customerName ? 'project' : 'solution', p.id);
  params.set('workflow', 'space');
  params.set('stage', 'deploy');
  params.set('ready', '1');
  return `/build?${params.toString()}`;
}

function canDeploySolution(p: Project) {
  return resolveSolutionStatus(p) === 'finalized';
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function MySolutionsPage() {
  const router = useRouter();
  const { role, mounted } = useRole();
  const isPro = mounted && isProBuilderRole(role);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'designing' | 'finalized'>('all');
  const [projectRev, setProjectRev] = useState(0);
  const [createLifeOpen, setCreateLifeOpen] = useState(false);
  const [creatingSolution, setCreatingSolution] = useState(false);

  useEffect(() => {
    const refresh = () => setProjectRev(v => v + 1);
    window.addEventListener('aqara:cubix-projects-change', refresh);
    return () => window.removeEventListener('aqara:cubix-projects-change', refresh);
  }, []);

  // Show all user's work:
  // - Design solutions (no customer) — from Build
  // - Customer projects (has customer info) — from Builder Pro (Pro users only)
  const allMine = useMemo(() => {
    return getWorkspaceProjects().filter(p => {
      const isActive = p.phase !== 'cancelled';
      const isVerified = p.visibility === 'verified';
      const isCustomerProject = !!(p.customerId || p.customerName);
      // Non-Pro users only see personal solutions
      if (!isPro && isCustomerProject) return false;
      // Exclude verified templates (shown on /build templates page)
      if (isVerified) return false;
      return isActive;
    }).map(normalizeProjectForDisplay);
  }, [projectRev, isPro]);

  // Split by type
  const personalSolutions = useMemo(() => allMine.filter(p => !(p.customerId || p.customerName)), [allMine]);
  const customerProjects = useMemo(() => allMine.filter(p => !!(p.customerId || p.customerName)), [allMine]);
  const spaceSolutions = useMemo(() => personalSolutions.filter(p => p.buildMode !== 'life-dashboard'), [personalSolutions]);
  const lifeDashboards = useMemo(() => personalSolutions.filter(p => p.buildMode === 'life-dashboard'), [personalSolutions]);

  const matchesSearch = (p: Project) => !search || p.title.includes(search) || (p.subtitle ?? '').includes(search);
  const filteredSolutions = useMemo(
    () => personalSolutions.filter(p => {
      if (!matchesSearch(p)) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'designing') return resolveSolutionStatus(p) !== 'finalized';
      return resolveSolutionStatus(p) === 'finalized';
    }),
    [personalSolutions, search, statusFilter]
  );
  const filteredSpaceSolutions = useMemo(
    () => filteredSolutions.filter(p => p.buildMode !== 'life-dashboard'),
    [filteredSolutions]
  );
  const filteredLifeDashboards = useMemo(
    () => filteredSolutions.filter(p => p.buildMode === 'life-dashboard'),
    [filteredSolutions]
  );
  const filteredProjects = useMemo(
    () => statusFilter === 'all' ? customerProjects.filter(matchesSearch) : [],
    [customerProjects, search, statusFilter]
  );
  const filteredCount = filteredSolutions.length + filteredProjects.length;
  const showBoth = statusFilter === 'all';

  const createNewSolution = () => {
    if (creatingSolution) return;
    setCreatingSolution(true);
    const solution = createCubixProject('Untitled');
    window.setTimeout(() => {
      const params = new URLSearchParams();
      params.set('entry', 'personal');
      params.set('demo_as', 'builder');
      params.set('workflow', 'space');
      params.set('solution', solution.id);
      params.set('stage', 'floor');
      params.set('guide', '1');
      router.push(`/build?${params.toString()}`);
    }, 500);
  };

  const handleCreateLifeDashboard = ({ name, studio }: { name: string; studio: Studio }) => {
    const project = createCubixProject(name, { buildingType: 'apartment' });
    const nextProject: Project = {
      ...project,
      subtitle: `${studio.spaceName} · 生活看板创作中`,
      buildMode: 'life-dashboard',
      linkedStudioId: studio.id,
      designStage: 'review',
      solutionStatus: 'editing',
      lifeDashboardPluginCount: 0,
    };
    saveCubixLocalProject(nextProject);
    setCreateLifeOpen(false);
    router.push(`/build?entry=personal&demo_as=builder&workflow=life&solution=${project.id}&studioId=${studio.id}&ready=1`);
  };

  const handleDeleteSolution = (project: Project) => {
    if (!window.confirm(`删除「${project.title}」？`)) return;
    deleteProject(project.id);
  };

  return (
    <div className="min-h-screen">
      <UserTopBar title="我的方案" />

      <main className="relative mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">我的方案</h1>
          </div>
          <button
            onClick={createNewSolution}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200/70 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-200"
          >
            <Code2 size={14} />
            新建方案
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索方案…"
              className="pl-8 pr-3 py-2 text-xs rounded-lg bg-bg-elevated/40 border border-border outline-none focus:border-accent/50 transition w-56"
            />
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setStatusFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs transition',
                statusFilter === 'all'
                  ? 'border-accent/50 bg-accent/10 text-accent-glow'
                  : 'border-border text-text-muted hover:border-border-strong hover:text-text'
              )}>
              全部
            </button>
            <button onClick={() => setStatusFilter('designing')}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs transition',
                statusFilter === 'designing'
                  ? 'border-accent/50 bg-accent/10 text-accent-glow'
                  : 'border-border text-text-muted hover:border-border-strong hover:text-text'
              )}>
              设计中
            </button>
            <button onClick={() => setStatusFilter('finalized')}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs transition',
                statusFilter === 'finalized'
                  ? 'border-accent/50 bg-accent/10 text-accent-glow'
                  : 'border-border text-text-muted hover:border-border-strong hover:text-text'
              )}>
              {SOLUTION_STATUS_META.finalized.label}
            </button>
          </div>

          <div className="ml-auto text-xs text-text-muted">
            <span className="num">{filteredCount}</span> 个方案
          </div>
        </div>

        {/* Grid */}
        {filteredCount === 0 ? (
          <div className="py-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent/20 to-accent2/20 flex items-center justify-center">
              <FolderOpen size={24} className="text-accent-glow" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold mb-1">还没有方案</div>
              <p className="text-xs text-text-muted mb-4 max-w-xs">
                从 Build 开始创建你的第一份空间方案。
              </p>
              <button onClick={createNewSolution}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-accent to-accent2 text-white text-xs font-semibold">
                <Sparkles size={12} /> 新建方案
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── 设计方案 Section ── */}
            {filteredSpaceSolutions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                    <PenLine size={11} className="text-purple-400" />
                  </div>
                  <h2 className="text-sm font-semibold">空间方案</h2>
                  <span className="ml-auto text-2xs text-text-muted num">{filteredSpaceSolutions.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {filteredSpaceSolutions.map((p, i) => (
                    <SolutionPreviewCard
                      key={p.id}
                      project={p}
                      index={i}
                      href={designPlatformHref(p)}
                      deployHref={deployHref(p)}
                      deployDisabled={!canDeploySolution(p)}
                      onDelete={handleDeleteSolution}
                      compact
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredLifeDashboards.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                    <LayoutDashboard size={11} className="text-blue-500" />
                  </div>
                  <h2 className="text-sm font-semibold">生活看板</h2>
                  <span className="ml-auto text-2xs text-text-muted num">{filteredLifeDashboards.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {filteredLifeDashboards.map((p, i) => (
                    <SolutionPreviewCard
                      key={p.id}
                      project={p}
                      index={i}
                      href={designPlatformHref(p)}
                      onDelete={handleDeleteSolution}
                      compact
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── 交付项目 Section ── */}
            {showBoth && (
              <section>
                {filteredProjects.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                        <Briefcase size={11} className="text-emerald-400" />
                      </div>
                      <h2 className="text-sm font-semibold">客户项目</h2>
                      <span className="ml-auto text-2xs text-text-muted num">{filteredProjects.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                      {filteredProjects.map((p, i) => (
                        <SolutionPreviewCard
                          key={p.id}
                          project={p}
                          index={i}
                          href={designPlatformHref(p)}
                          deployHref={deployHref(p)}
                          deployDisabled={!canDeploySolution(p)}
                          onDelete={handleDeleteSolution}
                          compact
                        />
                      ))}
                    </div>
                  </>
                ) : isPro ? (
                  <div className="card p-6 border-dashed text-center">
                    <Briefcase size={20} className="text-text-subtle mx-auto mb-2" />
                    <p className="text-xs text-text-muted mb-3">还没有客户项目。</p>
                    <Link href="/pro/projects?new=1"
                      className="px-3 py-1.5 rounded-md text-2xs bg-gradient-to-br from-emerald-500 to-emerald-600 text-white inline-flex items-center gap-1.5">
                      <Plus size={10} /> 新建项目
                    </Link>
                  </div>
                ) : null}
              </section>
            )}
          </div>
        )}

        {mounted && role === 'anonymous' && <UpgradeBanner />}
      </main>
      {creatingSolution ? <SolutionCreatingOverlay /> : null}
      {createLifeOpen ? (
        <CreateLifeDashboardDialog
          onCancel={() => setCreateLifeOpen(false)}
          onCreate={handleCreateLifeDashboard}
        />
      ) : null}
    </div>
  );
}

function CreateSolutionTypeDialog({
  onCancel,
  onCreateSpace,
  onCreateLife,
}: {
  onCancel: () => void;
  onCreateSpace: () => void;
  onCreateLife: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/20 p-4">
      <section className="w-full max-w-[430px] rounded-[6px] border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl shadow-slate-900/10">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="min-w-0 flex-1 text-sm font-semibold">新建方案</h2>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="关闭">
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={onCreateSpace} className="group rounded-[6px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/60">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-500 transition group-hover:bg-white">
              <PenLine size={18} />
            </div>
            <div className="text-sm font-semibold">空间方案</div>
            <div className="mt-1 text-[11px] text-slate-500">户型、空间、设备点位</div>
          </button>
          <button onClick={onCreateLife} className="group rounded-[6px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/60">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 transition group-hover:bg-white">
              <LayoutDashboard size={18} />
            </div>
            <div className="text-sm font-semibold">生活看板</div>
            <div className="mt-1 text-[11px] text-slate-500">基于 Studio 生成 App 插件</div>
          </button>
        </div>
      </section>
    </div>
  );
}

function SolutionCreatingOverlay() {
  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/20 p-4 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 shadow-2xl shadow-slate-950/15">
        <Loader2 size={17} className="animate-spin text-blue-600" />
        Loading
      </div>
    </div>
  );
}

function CreateLifeDashboardDialog({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (payload: { name: string; studio: Studio }) => void;
}) {
  const studios = accountStudioOptions();
  const [name, setName] = useState('');
  const [studioId, setStudioId] = useState(studios[0]?.studio.id ?? '');
  const selectedStudio = studios.find(item => item.studio.id === studioId)?.studio ?? studios[0]?.studio;
  const canCreate = Boolean(name.trim() && selectedStudio);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/20 p-4">
      <section className="w-full max-w-[430px] rounded-[6px] border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl shadow-slate-900/10">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="min-w-0 flex-1 text-sm font-semibold">新建生活看板</h2>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="关闭">
            <X size={16} />
          </button>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-[11px] font-medium text-slate-500">方案名</span>
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            className="h-10 w-full rounded-[4px] border border-transparent bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-200 focus:bg-white"
            autoFocus
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-2 block text-[11px] font-medium text-slate-500">Studio</span>
          <select
            value={studioId}
            onChange={event => setStudioId(event.target.value)}
            className="h-10 w-full rounded-[4px] border border-transparent bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-200 focus:bg-white"
          >
            {studios.map(({ studio, workspace }) => {
              const health = HEALTH_META[studio.health];
              return (
                <option key={studio.id} value={studio.id}>
                  {workspace.name} / {studio.name} · {studio.online}/{studio.devices} 在线 · {health.label}
                </option>
              );
            })}
          </select>
        </label>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="h-9 rounded-[4px] px-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
            取消
          </button>
          <button
            onClick={() => selectedStudio && onCreate({ name: name.trim(), studio: selectedStudio })}
            disabled={!canCreate}
            className="h-9 rounded-[4px] bg-blue-500 px-5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:text-white/70"
          >
            创建
          </button>
        </div>
      </section>
    </div>
  );
}

// ─── Upgrade Banner ───────────────────────────────────────────────────

function UpgradeBanner() {
  return (
    <div className="mt-6 rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] via-bg to-accent/[0.04]">
      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
          <Crown size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold mb-1">把方案变成收入 · 开启 Builder Pro</div>
          <p className="text-xs text-text-muted leading-relaxed mb-3">
            将方案关联客户进入专业交付流程，上架 Marketplace 获取分润。
          </p>
          <div className="flex flex-wrap gap-3 text-2xs text-text-muted">
            <span className="inline-flex items-center gap-1"><CheckCircle2 size={11} className="text-success" /> 客户项目管理</span>
            <span className="inline-flex items-center gap-1"><CheckCircle2 size={11} className="text-success" /> Marketplace 分润</span>
            <span className="inline-flex items-center gap-1"><CheckCircle2 size={11} className="text-success" /> 采购与结算</span>
          </div>
        </div>
        <Link href="/onboarding"
          className="px-4 py-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
          开启 Builder Pro <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}
