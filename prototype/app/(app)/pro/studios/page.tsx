'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  Clock,
  Cpu,
  FileText,
  History,
  Lock,
  RefreshCw,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { useCurrentDc, type DcId } from '@/components/layout/RegionSwitcher';
import {
  resolveProjectStatus,
  STATUS_META,
  type Project,
} from '@/lib/mock/projects';
import {
  getProjectSiteProjects,
  getProjectSiteStudioIds,
  getProjectSiteTopology,
  getProjectSiteWorkspaceIds,
  PROJECT_SITE_TOPOLOGY_META,
  type ProjectSiteTopology,
} from '@/lib/mock/project-sites';
import {
  HEALTH_META,
  ROLE_META,
  ProManagedStudios,
  getProServiceWorkspaces,
  isInstallerStagingWorkspace,
  type ProManagedStudio,
  type Workspace,
} from '@/lib/mock/studios';
import { cn } from '@/lib/utils';

type SitePhase = 'handover' | 'installing' | 'needs_access';
type StudioScope = 'all' | SitePhase | 'risk';
type SiteProjectContextKind = 'all' | ProjectSiteTopology;

interface SiteProjectContext {
  id: string;
  label: string;
  sub: string;
  kind: SiteProjectContextKind;
  workspaceIds: string[];
  studioIds: string[];
  project?: Project;
  statusLabel?: string;
  statusColor?: string;
  siteCount: number;
  studioCount: number;
  riskCount: number;
}

const DC_TO_WS_REGION: Record<DcId, Workspace['region']> = {
  cn: 'CN',
  us: 'US',
  eu: 'EU',
  sg: 'EU',
  kr: 'CN',
  ru: 'EU',
};

const SCOPE_META: Record<StudioScope, { label: string }> = {
  all: { label: '全部托管' },
  handover: { label: '已托管' },
  installing: { label: '交付中' },
  needs_access: { label: '待客户授权' },
  risk: { label: '有风险' },
};

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map(item => [item.id, item])).values()];
}

function workspacePhase(ws: Workspace): SitePhase {
  if (ws.serviceStage) return ws.serviceStage;
  if (ws.currentRole === 'owner') return 'installing';
  if (ws.currentRole === 'admin') return 'handover';
  return 'needs_access';
}

function workspaceMatchesDc(ws: Workspace, dc: DcId): boolean {
  return ws.region === DC_TO_WS_REGION[dc];
}

function studiosForWorkspace(workspaceId: string): ProManagedStudio[] {
  return uniqueById(ProManagedStudios.filter(s => s.workspaceId === workspaceId));
}

function isRiskStudio(studio: ProManagedStudio): boolean {
  return studio.health === 'warning' || studio.health === 'critical' || studio.health === 'offline' || (studio.alerts ?? 0) > 0;
}

function filterRowStudios(
  row: { workspace: Workspace; phase: SitePhase; studios: ProManagedStudio[]; hasRisk: boolean },
  studioIds: Set<string> | null,
) {
  const studios = studioIds ? row.studios.filter(studio => studioIds.has(studio.id)) : row.studios;
  return {
    ...row,
    studios,
    hasRisk: studios.some(isRiskStudio),
  };
}

export default function ProStudiosPage() {
  const router = useRouter();
  const currentDc = useCurrentDc();
  const [scope, setScope] = useState<StudioScope>('all');
  const [activeContextId, setActiveContextId] = useState('all');
  const [selectedStudioId, setSelectedStudioId] = useState('all');
  const [requesting, setRequesting] = useState<ProManagedStudio | null>(null);
  const [projectRevision, setProjectRevision] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    const studioId = params.get('studio');
    const scopeParam = params.get('scope') as StudioScope | null;
    if (projectId) setActiveContextId(projectId);
    if (studioId) setSelectedStudioId(studioId);
    if (scopeParam && Object.keys(SCOPE_META).includes(scopeParam)) setScope(scopeParam);
  }, []);

  useEffect(() => {
    const refresh = () => setProjectRevision(rev => rev + 1);
    window.addEventListener('aqara:cubix-projects-change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('aqara:cubix-projects-change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const rows = useMemo(() => {
    return getProServiceWorkspaces()
      .filter(ws => workspaceMatchesDc(ws, currentDc))
      .map(workspace => {
        const studios = studiosForWorkspace(workspace.id);
        return {
          workspace,
          phase: workspacePhase(workspace),
          studios,
          hasRisk: studios.some(isRiskStudio),
        };
      })
      .filter(row => row.studios.length > 0);
  }, [currentDc]);

  const projects = useMemo(() => {
    return getProjectSiteProjects();
  }, [projectRevision]);

  const projectContexts = useMemo<SiteProjectContext[]>(() => {
    const rowByWorkspace = new Map(rows.map(row => [row.workspace.id, row]));
    const allStudioCount = rows.reduce((sum, row) => sum + row.studios.length, 0);
    const allRiskCount = rows.reduce((sum, row) => sum + row.studios.filter(isRiskStudio).length, 0);

    const contexts: SiteProjectContext[] = [{
      id: 'all',
      label: '全部托管 Space',
      sub: '跨项目客户 Space 与 Studio',
      kind: 'all',
      workspaceIds: rows.map(row => row.workspace.id),
      studioIds: rows.flatMap(row => row.studios.map(studio => studio.id)),
      siteCount: rows.length,
      studioCount: allStudioCount,
      riskCount: allRiskCount,
    }];

    projects.forEach(project => {
      const topology = getProjectSiteTopology(project);
      const workspaceIds = getProjectSiteWorkspaceIds(project).filter(id => rowByWorkspace.has(id));
      if (workspaceIds.length === 0) return;
      const linkedRows = workspaceIds.map(id => rowByWorkspace.get(id)!).filter(Boolean);
      const projectStudioSet = new Set(getProjectSiteStudioIds(project));
      const studioIds = linkedRows.flatMap(row => row.studios.filter(studio => projectStudioSet.has(studio.id)).map(studio => studio.id));
      if (studioIds.length === 0) return;
      const studioIdSet = new Set(studioIds);
      const projectRows = linkedRows
        .map(row => filterRowStudios(row, studioIdSet))
        .filter(row => row.studios.length > 0);
      const studioCount = projectRows.reduce((sum, row) => sum + row.studios.length, 0);
      const riskCount = projectRows.reduce((sum, row) => sum + row.studios.filter(isRiskStudio).length, 0);
      const status = resolveProjectStatus(project);
      const statusMeta = STATUS_META[status];

      contexts.push({
        id: project.id,
        label: project.title,
        sub: `${PROJECT_SITE_TOPOLOGY_META[topology].label} · ${project.customerName ?? project.city ?? project.subtitle}`,
        kind: topology,
        workspaceIds,
        studioIds,
        project,
        statusLabel: project.managedStatus || statusMeta.label,
        statusColor: statusMeta.color,
        siteCount: projectRows.length,
        studioCount,
        riskCount,
      });
    });

    return contexts;
  }, [projects, rows]);

  const activeContext = projectContexts.find(context => context.id === activeContextId) ?? projectContexts[0];
  const contextRows = useMemo(() => {
    if (activeContext.kind === 'all') return rows;
    const workspaceSet = new Set(activeContext.workspaceIds);
    const studioSet = new Set(activeContext.studioIds);
    return rows
      .filter(row => workspaceSet.has(row.workspace.id))
      .map(row => filterRowStudios(row, studioSet))
      .filter(row => row.studios.length > 0);
  }, [activeContext, rows]);

  const studioOptions = useMemo(() => {
    return uniqueById(contextRows.flatMap(row => row.studios)).map(studio => ({
      studio,
      workspace: contextRows.find(row => row.workspace.id === studio.workspaceId)?.workspace,
    }));
  }, [contextRows]);

  useEffect(() => {
    if (selectedStudioId === 'all') return;
    if (!studioOptions.some(option => option.studio.id === selectedStudioId)) {
      setSelectedStudioId('all');
    }
  }, [selectedStudioId, studioOptions]);

  const studioFilteredRows = useMemo(() => {
    if (selectedStudioId === 'all') return contextRows;
    return contextRows
      .map(row => {
        const studios = row.studios.filter(studio => studio.id === selectedStudioId);
        return {
          ...row,
          studios,
          hasRisk: studios.some(isRiskStudio),
        };
      })
      .filter(row => row.studios.length > 0);
  }, [contextRows, selectedStudioId]);

  const visibleRows = useMemo(() => {
    if (scope === 'all') return studioFilteredRows;
    if (scope === 'risk') return studioFilteredRows.filter(row => row.hasRisk);
    return studioFilteredRows.filter(row => row.phase === scope);
  }, [studioFilteredRows, scope]);

  const allStudios = studioFilteredRows.flatMap(row => row.studios);
  const visibleStudios = visibleRows.flatMap(row => row.studios);
  const totalDevices = allStudios.reduce((sum, studio) => sum + studio.devices, 0);
  const onlineDevices = allStudios.reduce((sum, studio) => sum + studio.online, 0);
  const riskStudios = allStudios.filter(isRiskStudio);
  const onlineCount = allStudios.filter(s => s.health === 'healthy' || s.health === 'warning').length;
  const pendingAccess = studioFilteredRows.filter(row => row.phase === 'needs_access').length;
  const scopeCounts: Record<StudioScope, number> = {
    all: studioFilteredRows.length,
    handover: studioFilteredRows.filter(row => row.phase === 'handover').length,
    installing: studioFilteredRows.filter(row => row.phase === 'installing').length,
    needs_access: pendingAccess,
    risk: studioFilteredRows.filter(row => row.hasRisk).length,
  };

  const selectContext = (contextId: string) => {
    setActiveContextId(contextId);
    setScope('all');
    setSelectedStudioId('all');
    const params = new URLSearchParams(window.location.search);
    if (contextId === 'all') params.delete('project');
    else params.set('project', contextId);
    params.delete('studio');
    const query = params.toString();
    router.replace(`/pro/studios${query ? `?${query}` : ''}`, { scroll: false });
  };

  const selectStudio = (studioId: string) => {
    setSelectedStudioId(studioId);
    setScope('all');
    const params = new URLSearchParams(window.location.search);
    if (activeContext.id !== 'all') params.set('project', activeContext.id);
    else params.delete('project');
    if (studioId === 'all') params.delete('studio');
    else params.set('studio', studioId);
    params.delete('scope');
    const query = params.toString();
    router.replace(`/pro/studios${query ? `?${query}` : ''}`, { scroll: false });
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <section className="mb-4 rounded-[1.6rem] border border-border bg-bg-elevated p-5 shadow-sm shadow-slate-200/70 dark:shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-subtle">Builder Pro</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text">Space 托管</h1>
              <p className="mt-1 max-w-2xl text-xs text-text-muted">
                这里不新建客户 Space，只管理项目交付中的调试目标、客户授权和远程服务关系。
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-2xs text-text-muted">
                <StatusPill label="项目范围" value={activeContext.kind === 'all' ? projectContexts.length - 1 : 1} />
                <StatusPill label="Space" value={contextRows.length} />
                <StatusPill label="Studio" value={allStudios.length} />
                <StatusPill label="待授权" value={pendingAccess} tone={pendingAccess > 0 ? 'warning' : 'default'} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/pro/projects"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-bg-subtle px-3 py-2 text-xs font-medium text-text-muted transition hover:border-border-strong hover:text-text"
              >
                <FileText size={13} />
                项目
              </Link>
              <Link
                href="/pro/projects?tab=in_progress"
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:opacity-90"
              >
                <ShieldAlert size={13} />
                请求托管授权
              </Link>
            </div>
          </div>
        </section>

        <ProjectFilterBar
          contexts={projectContexts}
          activeContext={activeContext}
          studioOptions={studioOptions}
          selectedStudioId={selectedStudioId}
          onSelect={selectContext}
          onStudioSelect={selectStudio}
        />

        <div className="min-w-0">
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard icon={Building2} label="Space" value={studioFilteredRows.length} sub="客户授权空间" />
            <MetricCard icon={Cpu} label="Studio" value={allStudios.length} sub={`${totalDevices} 设备`} />
            <MetricCard icon={Activity} label="在线" value={`${onlineCount}/${allStudios.length || 0}`} sub={`${onlineDevices}/${totalDevices || 0} 设备在线`} />
            <MetricCard icon={AlertTriangle} label="风险" value={riskStudios.length} sub="告警 / 离线 / 授权问题" tone={riskStudios.length > 0 ? 'warning' : 'default'} />
          </div>

          <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-bg-elevated px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(SCOPE_META) as StudioScope[]).map(key => {
                const active = scope === key;
                const disabled = key !== 'all' && scopeCounts[key] === 0;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => setScope(key)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-2xs font-medium transition',
                      active
                        ? 'border-accent/45 bg-accent/10 text-accent'
                        : 'border-border bg-bg-subtle text-text-muted hover:border-border-strong hover:text-text',
                      disabled && 'cursor-not-allowed opacity-40 hover:border-border hover:text-text-muted',
                    )}
                  >
                    {SCOPE_META[key].label}
                    <span className="num ml-1 opacity-65">{scopeCounts[key]}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-2xs text-text-muted">
              当前显示 <span className="num text-text">{visibleRows.length}</span> 个托管 Space · <span className="num text-text">{visibleStudios.length}</span> 台 Studio
            </div>
          </section>

          {visibleRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-bg-elevated px-6 py-16 text-center">
              <Building2 size={28} className="mx-auto mb-3 text-text-subtle" />
              <p className="text-sm font-medium text-text">当前筛选暂无托管 Space</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleRows.map(row => (
                <CustomerSiteBlock
                  key={row.workspace.id}
                  workspace={row.workspace}
                  phase={row.phase}
                  studios={row.studios}
                  projects={projects.filter(project => getProjectSiteWorkspaceIds(project).includes(row.workspace.id))}
                  activeProject={activeContext.project}
                  onRequestAccess={setRequesting}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {requesting && (
        <AccessRequestModal studio={requesting} onClose={() => setRequesting(null)} />
      )}
    </div>
  );
}

function ProjectFilterBar({
  contexts,
  activeContext,
  studioOptions,
  selectedStudioId,
  onSelect,
  onStudioSelect,
}: {
  contexts: SiteProjectContext[];
  activeContext: SiteProjectContext;
  studioOptions: Array<{ studio: ProManagedStudio; workspace?: Workspace }>;
  selectedStudioId: string;
  onSelect: (id: string) => void;
  onStudioSelect: (id: string) => void;
}) {
  const topologyGroups: ProjectSiteTopology[] = ['home', 'building', 'portfolio'];
  const selectedStudio = studioOptions.find(option => option.studio.id === selectedStudioId)?.studio;
  const activeKindLabel = activeContext.kind === 'all'
    ? '全部项目'
    : PROJECT_SITE_TOPOLOGY_META[activeContext.kind].label;

  return (
    <section className="mb-4 rounded-2xl border border-border bg-bg-elevated px-4 py-3 shadow-sm shadow-slate-200/60 dark:shadow-black/20">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="min-w-0">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-subtle">Project</span>
            <span className="text-[10px] text-text-subtle">{contexts.length - 1} 个项目</span>
          </div>
          <select
            value={activeContext.id}
            onChange={event => onSelect(event.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-bg-subtle px-3 text-sm font-medium text-text outline-none transition hover:border-border-strong focus:border-accent/50"
          >
            <option value="all">全部项目 · 查看托管 Space</option>
            {topologyGroups.map(topology => {
              const groupedContexts = contexts.filter(context => context.kind === topology);
              if (groupedContexts.length === 0) return null;
              return (
                <optgroup key={topology} label={PROJECT_SITE_TOPOLOGY_META[topology].label}>
                  {groupedContexts.map(context => (
                  <option key={context.id} value={context.id}>
                    {context.label} · {context.siteCount} Space · {context.studioCount} Studio
                  </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </label>

        <label className="min-w-0">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-subtle">Studio</span>
            <span className="text-[10px] text-text-subtle">{studioOptions.length} 台可筛选</span>
          </div>
          <select
            value={selectedStudioId}
            onChange={event => onStudioSelect(event.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-bg-subtle px-3 text-sm font-medium text-text outline-none transition hover:border-border-strong focus:border-accent/50"
          >
            <option value="all">全部 Studio · 显示当前 Project / Space 下的 Studio</option>
            {studioOptions.map(({ studio, workspace }) => (
              <option key={studio.id} value={studio.id}>
                {studio.name} · {workspace?.name ?? studio.workspaceName} · {studio.online}/{studio.devices} 设备
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-2 text-2xs lg:justify-end">
          <span className="rounded-full border border-border bg-bg-subtle px-2.5 py-1 text-text-muted">
            {activeKindLabel}
          </span>
          <span className="rounded-full border border-border bg-bg-subtle px-2.5 py-1 text-text-muted">
            {activeContext.siteCount} Space
          </span>
          <span className="rounded-full border border-border bg-bg-subtle px-2.5 py-1 text-text-muted">
            {activeContext.studioCount} Studio
          </span>
          {activeContext.riskCount > 0 && (
            <span className="rounded-full border border-warning/35 bg-warning/10 px-2.5 py-1 text-warning">
              {activeContext.riskCount} 风险
            </span>
          )}
          {selectedStudio && (
            <span className="rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-accent">
              {selectedStudio.name}
            </span>
          )}
          {activeContext.project && (
            <Link
              href={`/pro/projects/${activeContext.project.id}/overview`}
              className="rounded-full border border-border bg-bg-subtle px-2.5 py-1 text-text-muted transition hover:text-text"
            >
              项目详情
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function StatusPill({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'warning' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1',
        tone === 'warning'
          ? 'border-warning/35 bg-warning/10 text-warning'
          : 'border-border bg-bg-subtle text-text-muted',
      )}
    >
      {label}
      <span className="num font-semibold text-text">{value}</span>
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'default',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  tone?: 'default' | 'warning';
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-subtle p-4">
      <div className="flex items-center gap-2 text-2xs font-medium text-text-muted">
        <Icon size={13} className={tone === 'warning' ? 'text-warning' : 'text-accent'} />
        {label}
      </div>
      <div className="num mt-2 text-2xl font-semibold text-text">{value}</div>
      <div className="mt-1 text-2xs text-text-subtle">{sub}</div>
    </div>
  );
}

function CustomerSiteBlock({
  workspace,
  phase,
  studios,
  projects,
  activeProject,
  onRequestAccess,
}: {
  workspace: Workspace;
  phase: SitePhase;
  studios: ProManagedStudio[];
  projects: Project[];
  activeProject?: Project;
  onRequestAccess: (studio: ProManagedStudio) => void;
}) {
  const role = ROLE_META[workspace.currentRole];
  const phaseTone = phase === 'handover' ? 'success' : phase === 'installing' ? 'warning' : 'danger';
  const riskCount = studios.filter(isRiskStudio).length;
  const project = activeProject ?? projects[0];
  const isStaging = isInstallerStagingWorkspace(workspace);
  const relationLabel = isStaging
    ? '项目调试目标 · 不进入普通 Space 列表'
    : workspace.ownerName
      ? `${workspace.ownerName} 的 Space`
      : '当前账号可服务 Space';

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm shadow-slate-200/60 dark:shadow-black/20">
      <div className="border-b border-border bg-bg-subtle px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-elevated text-lg">{workspace.emoji}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-subtle">Space</span>
                <h2 className="truncate text-base font-semibold text-text">{workspace.name}</h2>
                <PhaseBadge phase={phase} tone={phaseTone} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-2xs text-text-muted">
                <span>{relationLabel}</span>
                <span
                  className="rounded-full border px-1.5 py-0.5 text-[10px]"
                  style={{ color: role.color, borderColor: `${role.color}44`, background: `${role.color}12` }}
                >
                  我是 {role.label}
                </span>
                {isStaging && <span className="text-warning">验收后转移到客户 Space</span>}
                {riskCount > 0 && <span className="text-warning">{riskCount} 个风险 Studio</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-2xs">
            {project && (
              <Link
                href={`/pro/studios?project=${project.id}`}
                className={cn(
                  'rounded-full border px-2.5 py-1 transition',
                  activeProject?.id === project.id
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border bg-bg-elevated text-text-muted hover:text-text',
                )}
              >
                {project.title}
              </Link>
            )}
            <span className="rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-text-muted">
              {studios.length} Studio
            </span>
          </div>
        </div>
      </div>

      <div className="hidden grid-cols-[1.15fr_1fr_0.75fr_0.85fr_auto] border-b border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle md:grid">
        <span>设备名称</span>
        <span>设备 ID</span>
        <span>IP</span>
        <span>最后活跃</span>
        <span className="text-right">操作</span>
      </div>

      <div className="divide-y divide-border">
        {studios.map(studio => (
          <StudioRow
            key={studio.id}
            studio={studio}
            workspace={workspace}
            onRequestAccess={() => onRequestAccess(studio)}
          />
        ))}
      </div>

      {workspace.transferLog && workspace.transferLog.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-bg-subtle px-5 py-3 text-2xs text-text-muted">
          <History size={12} className="text-text-subtle" />
          <span>最近交接</span>
          <span className="num text-text">{workspace.transferLog[workspace.transferLog.length - 1].ts}</span>
          {workspace.transferLog[workspace.transferLog.length - 1].note && (
            <span className="text-text-subtle">{workspace.transferLog[workspace.transferLog.length - 1].note}</span>
          )}
        </div>
      )}
    </section>
  );
}

function PhaseBadge({ phase, tone }: { phase: SitePhase; tone: 'success' | 'warning' | 'danger' }) {
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 text-[10px] font-medium',
        tone === 'success' && 'border-success/35 bg-success/10 text-success',
        tone === 'warning' && 'border-warning/35 bg-warning/10 text-warning',
        tone === 'danger' && 'border-danger/35 bg-danger/10 text-danger',
      )}
    >
      {SCOPE_META[phase].label}
    </span>
  );
}

function StudioRow({
  studio,
  workspace,
  onRequestAccess,
}: {
  studio: ProManagedStudio;
  workspace: Workspace;
  onRequestAccess: () => void;
}) {
  const health = HEALTH_META[studio.health];
  const canOpenServiceMode = workspace.currentRole === 'owner' || workspace.currentRole === 'admin';
  const hasRisk = isRiskStudio(studio);

  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-3 transition hover:bg-bg-subtle/70 md:grid-cols-[1.15fr_1fr_0.75fr_0.85fr_auto] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-subtle">
          <Cpu size={16} className="text-accent" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-elevated" style={{ background: health.color }} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-text">{studio.name}</div>
          <div className="mt-0.5 truncate text-2xs text-text-muted md:hidden">{studio.deviceId}</div>
        </div>
      </div>

      <div className="hidden truncate font-mono text-2xs text-text-muted md:block">{studio.deviceId}</div>

      <div className="flex items-center gap-1.5 font-mono text-2xs text-text-muted">
        <span>{studio.ipLocal}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium"
          style={{ color: health.color, borderColor: `${health.color}44`, background: `${health.color}16` }}
        >
          {hasRisk ? <AlertTriangle size={10} /> : <Check size={10} />}
          {health.label}
        </span>
        <span className="inline-flex items-center gap-1 text-2xs text-text-muted">
          <Clock size={10} /> {studio.lastSeen}
        </span>
        {(studio.alerts ?? 0) > 0 && (
          <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-2xs text-warning">
            {studio.alerts} 告警
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        {canOpenServiceMode ? (
          <Link
            href={`/build?entry=pro&studio=${studio.id}&mode=service`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          >
            <Wrench size={12} />
            服务模式
          </Link>
        ) : (
          <button
            type="button"
            onClick={onRequestAccess}
            className="inline-flex items-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning transition hover:bg-warning/15"
          >
            <ShieldAlert size={12} />
            请求授权
          </button>
        )}
        <Link
          href={`/pro/projects?studio=${studio.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-subtle px-2.5 py-1.5 text-xs text-text-muted transition hover:border-border-strong hover:text-text"
        >
          <ArrowRight size={12} />
          项目
        </Link>
      </div>
    </div>
  );
}

function AccessRequestModal({ studio, onClose }: { studio: ProManagedStudio; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg-elevated p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-warning/30 bg-warning/10">
            <Lock size={18} className="text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">授权请求已创建</h3>
            <p className="mt-1 text-2xs text-text-muted">
              {studio.customer} · {studio.name}
            </p>
            <p className="mt-2 text-2xs text-text-subtle">等待客户在 Builder / Aqara Life 开启限时服务窗口。</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-bg-subtle px-3 py-2 text-2xs text-text-muted">
          <RefreshCw size={12} />
          Messages 与 Project Timeline 会同步状态。
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-accent py-2 text-xs font-semibold text-white transition hover:opacity-90"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
