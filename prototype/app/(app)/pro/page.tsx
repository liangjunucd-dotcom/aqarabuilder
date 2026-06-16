'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ElementType, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  CloudUpload,
  FileCheck2,
  ImageIcon,
  Inbox,
  KeyRound,
  MonitorUp,
  Network,
  Package,
  PackageCheck,
  Plus,
  Rows3,
  ShieldCheck,
  Smartphone,
  Table2,
  UserPlus,
  UserRoundCheck,
  Users,
  Wrench,
} from 'lucide-react';
import { ACTIVE_LEAD_STAGES, CARDS, resolveLeadStage } from '@/lib/mock/leads';
import { getAllProjects, resolveProjectStatus, type Project } from '@/lib/mock/projects';
import {
  getActiveWorkspace,
  getWorkspaceFromProPath,
  getWorkspaceHomeHref,
  getWorkspaces,
  getWorkspace,
  setActiveWorkspace as persistActiveWorkspace,
  subscribeWorkspaceChange,
  WORKSPACE_ROLE_LABEL,
  WORKSPACE_TYPE_LABEL,
  type BuilderWorkspace,
} from '@/lib/workspaces';
import { UsageQuotaButton } from '@/components/usage/UsageQuotaButton';
import { cn } from '@/lib/utils';

const QUICK_CREATE: Array<{ label: string; href: string; icon: ElementType }> = [
  { label: 'Lead', href: '/pro/leads?new=1', icon: Inbox },
  { label: 'Customer', href: '/pro/customers?new=1', icon: UserRoundCheck },
  { label: 'Project Site', href: '/pro/projects?new=1&type=site', icon: Building2 },
  { label: 'Project', href: '/pro/projects?new=1', icon: ClipboardCheck },
  { label: '3D Floor Plan', href: '/pro/projects/proj-eu-villa/overview?tab=floorplans', icon: Package },
  { label: 'Automation', href: '/build?entry=pro&demo_as=pro&workflow=automation', icon: Network },
  { label: 'BOM', href: '/pro/projects/proj-eu-villa/overview?tab=takeoffs', icon: Table2 },
  { label: 'Purchase Order', href: '/pro/financials?tab=orders', icon: PackageCheck },
  { label: 'Install Task', href: '/pro/projects/proj-eu-villa/overview?tab=tasks', icon: Wrench },
  { label: 'Provision Code', href: '/pro/projects?tab=work-orders', icon: KeyRound },
  { label: 'Site Evidence', href: '/pro/delivery', icon: CloudUpload },
  { label: 'Acceptance', href: '/pro/delivery', icon: FileCheck2 },
  { label: 'Marble Preview', href: '/pro/leads?tab=preview', icon: ImageIcon },
];

const CARD_ACCENTS = ['#ef6b5a', '#f0c75e', '#e85d56', '#8152d9', '#b48df0'];
const WORKSPACE_MEMBERS = [
  { name: 'Jun Liang', role: 'Admin', labels: ['Designer', 'PM'], status: 'Design review' },
  { name: 'Bob Chen', role: 'Member', labels: ['SE', 'Installer'], status: 'On-site today' },
  { name: 'Charlie Wu', role: 'Viewer', labels: ['Developer'], status: 'Automation QA' },
];

const DELIVERY_STAGES = [
  { key: 'leads', label: 'Leads', desc: '客户信息与询单', tone: '#06b6d4' },
  { key: 'design', label: 'Design', desc: '3D Floor Plan + 自动化', tone: '#8b5cf6' },
  { key: 'procurement', label: 'Procurement', desc: '设备清单、订单、备货', tone: '#f59e0b' },
  { key: 'install', label: 'Install', desc: '派单给 SE 现场实施', tone: '#ef6b5a' },
  { key: 'acceptance', label: 'Acceptance', desc: '诊断、验收、服务开通', tone: '#10b981' },
  { key: 'sites', label: 'Sites', desc: 'B端站点与Studio托管', tone: '#0ea5e9' },
  { key: 'transfer', label: 'Transfer', desc: '客户 Claiming 与账号转移', tone: '#64748b' },
] as const;

function workspacePlanLabel(plan: BuilderWorkspace['plan'] | undefined) {
  if (plan === 'enterprise') return 'Enterprise';
  if (plan === 'business') return 'Business';
  if (plan === 'pro') return 'Pro';
  return 'Free';
}

export default function ProHomePage() {
  const [workspace, setWorkspace] = useState<BuilderWorkspace | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = getWorkspace(params.get('workspace')) ?? getWorkspaceFromProPath(window.location.pathname);
    if (requested) persistActiveWorkspace(requested.id);
    setWorkspace(requested ?? getActiveWorkspace());
    const unsubscribe = subscribeWorkspaceChange(setWorkspace);
    const refresh = () => setRev(v => v + 1);
    window.addEventListener('aqara:cubix-projects-change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      unsubscribe();
      window.removeEventListener('aqara:cubix-projects-change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const projects = useMemo(
    () => getAllProjects().filter(project => project.phase !== 'cancelled' && project.visibility !== 'verified'),
    [rev],
  );
  const workProjects = projects.filter(project => project.customerId || project.projectStatus);
  const projectCards = workProjects.slice(0, 5);
  const activeLeads = CARDS.filter(card => ACTIVE_LEAD_STAGES.includes(resolveLeadStage(card)));
  const todos = buildTodos(workProjects, activeLeads);
  const stageCounts = buildStageCounts(workProjects, activeLeads.length);
  const implementationProjects = workProjects
    .filter(project => ['confirmed', 'installing', 'acceptance', 'completed'].includes(project.phase ?? ''))
    .slice(0, 4);
  const workspaces = useMemo(() => getWorkspaces(), []);
  const workspaceName = workspace?.name ?? 'Personal';
  const isTeamWorkspace = workspace?.type === 'team';
  const workspacePlan = workspace?.plan ?? 'pro';
  const workspaceInitials = workspaceName
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const selectWorkspace = (nextWorkspace: BuilderWorkspace) => {
    persistActiveWorkspace(nextWorkspace.id);
    setWorkspace(nextWorkspace);
    setWorkspaceOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('workspace');
    const nextPath = getWorkspaceHomeHref(nextWorkspace);
    window.history.replaceState(null, '', `${nextPath}${url.search}${url.hash}`);
  };

  return (
    <main className="h-screen overflow-y-auto bg-[#fbfbfa] text-[#202020]">
      <header className="flex h-16 items-center justify-between border-b border-[#e6e2dc] bg-white px-5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setWorkspaceOpen(open => !open)}
            className="flex items-center gap-3 rounded-lg pr-2 transition hover:bg-[#f6f4f0] focus:outline-none focus:ring-2 focus:ring-[#232323]/15"
            aria-haspopup="menu"
            aria-expanded={workspaceOpen}
            title="Switch workspace"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#f4f2ee] text-xs font-semibold text-[#777]">
              {workspaceInitials}
            </span>
            <span className="min-w-0 text-left">
              <span className="block max-w-[220px] truncate text-base font-semibold leading-tight">{workspaceName}</span>
              <span className="block text-[11px] leading-tight text-[#777]">
                {workspace ? WORKSPACE_TYPE_LABEL[workspace.type] : 'Personal Workspace'} · {workspacePlanLabel(workspacePlan)}
              </span>
            </span>
            <ChevronDown size={16} className={cn('text-[#777] transition', workspaceOpen && 'rotate-180 text-[#202020]')} />
          </button>

          {workspaceOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setWorkspaceOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-xl border border-[#e6e2dc] bg-white shadow-2xl shadow-black/15">
                <div className="border-b border-[#eeeae5] px-3 py-2 text-sm font-semibold">Workspaces</div>
                <div className="max-h-72 overflow-y-auto p-1.5">
                  {workspaces.map(item => {
                    const active = item.id === workspace?.id;
                    const initials = item.name
                      .split(/\s+/)
                      .map(part => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectWorkspace(item)}
                        className={cn(
                          'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition hover:bg-[#f6f4f0]',
                          active && 'bg-[#f6f4f0]',
                        )}
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#f4f2ee] text-[10px] font-semibold text-[#777]">
                          {initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-[#202020]">{item.name}</span>
                            {active && <Check size={13} className="text-emerald-600" />}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-[#777]">
                            {WORKSPACE_TYPE_LABEL[item.type]} · {WORKSPACE_ROLE_LABEL[item.role]} · {workspacePlanLabel(item.plan)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Link
                  href="/pro/workspaces?new=1"
                  onClick={() => setWorkspaceOpen(false)}
                  className="flex items-center justify-center gap-1.5 border-t border-[#eeeae5] bg-[#faf9f7] px-3 py-2 text-center text-xs font-semibold text-[#555] transition hover:bg-[#f6f4f0] hover:text-[#202020]"
                >
                  <Plus size={13} />
                  Create Workspace
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <UsageQuotaButton
            compact
            planId={workspacePlan}
            workspaceId={workspace?.id}
            workspaceName={workspaceName}
            workspaceType={workspace?.type}
            workspaceRole={workspace?.role}
            professional
          />
          {isTeamWorkspace && (
            <Link
              href="/pro/workspaces"
              className="inline-flex h-9 items-center gap-2 rounded border border-[#232323] bg-white px-3 text-sm font-semibold text-[#202020] shadow-sm"
            >
              <UserPlus size={15} />
              Invite to Workspace
            </Link>
          )}
        </div>
      </header>

      <div className="p-4">
        {showSetup && (
          <section className="mb-4 flex min-h-[72px] items-center justify-between gap-4 rounded border border-[#e8e5df] bg-white px-4 py-3 shadow-sm shadow-black/[0.02]">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Workspace Delivery Command Center</h2>
              <p className="mt-1 text-xs text-[#777]">
                {workspaceName} · Members manage leads, design packages, procurement, installer work orders, acceptance and customer transfer.
              </p>
            </div>
            <button
              onClick={() => setShowSetup(false)}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#333]"
            >
              <ShieldCheck size={16} className="text-emerald-600" />
              Workspace ready · {WORKSPACE_MEMBERS.length} members
              <ChevronDown size={18} />
            </button>
          </section>
        )}

        <section className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-7">
          {DELIVERY_STAGES.map(stage => (
            <Link
              key={stage.key}
              href={stage.key === 'leads' ? '/pro/leads' : stage.key === 'transfer' || stage.key === 'sites' ? '/pro/studios' : '/pro/projects'}
              className="min-h-[104px] rounded border border-[#e8e5df] bg-white p-3 shadow-sm shadow-black/[0.02] transition hover:border-[#d8d3ca]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#777]">{stage.label}</span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.tone }} />
              </div>
              <div className="mt-3 text-2xl font-semibold">{stageCounts[stage.key] ?? 0}</div>
              <p className="mt-2 min-h-8 text-xs leading-4 text-[#777]">{stage.desc}</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_468px]">
          <div className="space-y-4">
            <Panel
              title={`Projects (${workProjects.length})`}
              titleHref="/pro/projects"
              action={
                <Link href="/pro/projects?new=1" className="rounded bg-[#202020] px-4 py-2 text-sm font-semibold text-white">
                  Create New Project
                </Link>
              }
            >
              <div
                data-project-strip="true"
                className="-mx-1 flex gap-3 overflow-x-auto overscroll-x-contain px-1 pb-2 pr-3 scroll-smooth [scrollbar-width:thin]"
              >
                {projectCards.map((project, index) => (
                  <ProjectCard key={project.id} project={project} accent={CARD_ACCENTS[index % CARD_ACCENTS.length]} />
                ))}
                <Link
                  href="/pro/projects"
                  className="flex min-h-[128px] w-12 shrink-0 items-center justify-center rounded-r border border-[#eeeae5] bg-white text-[#777] shadow-sm"
                  aria-label="View all projects"
                >
                  <ChevronRight size={22} />
                </Link>
              </div>
            </Panel>

            <Panel
              title={`Installer Work Orders (${todos.length})`}
              action={
                <Link href="/pro/projects/proj-eu-villa/overview?tab=tasks" className="rounded bg-[#202020] px-4 py-2 text-sm font-semibold text-white">
                  Assign SE
                </Link>
              }
            >
              <div className="mb-5 grid grid-cols-[48px_minmax(0,1fr)_48px] items-center">
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eeeae5] text-[#aaa]">
                  ‹
                </button>
                <div>
                  <div className="mx-auto mb-3 flex h-7 w-24 items-center justify-center rounded bg-[#f2f0ed] text-sm font-medium text-[#777]">November</div>
                  <div className="mx-auto grid max-w-[360px] grid-cols-7 text-center text-sm text-[#bbb]">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
                    {[9, 10, 11, 12, 13, 14, 15].map(day => (
                      <span key={day} className="relative mt-3 text-base text-[#aaa]">
                        {day}
                        {[13, 14, 15].includes(day) && <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-y-1 rounded-full bg-[#dc5147]" />}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#eeeae5] text-[#aaa]">
                  ›
                </button>
              </div>

              <div className="mb-3 flex gap-2 text-sm">
                {['All', 'Installer', 'Designer', 'Customer'].map((item, index) => (
                  <button
                    key={item}
                    className={cn(
                      'rounded-full border px-3 py-1.5 font-medium',
                      index === 0 ? 'border-[#202020] bg-white text-[#202020]' : 'border-[#eeeae5] bg-white text-[#777]',
                      item === 'Meetings' && 'text-[#d6d2cc]'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-[#eeeae5]">
                {todos.map(todo => <TodoRow key={todo.title} {...todo} />)}
              </div>
            </Panel>

            <Panel
              title="Implementation & Transfer"
              action={
                <Link href="/pro/delivery" className="inline-flex items-center gap-1 rounded bg-[#202020] px-4 py-2 text-sm font-semibold text-white">
                  Open Delivery <ArrowRight size={15} />
                </Link>
              }
            >
              <div className="divide-y divide-[#eeeae5]">
                {implementationProjects.map(project => <ImplementationRow key={project.id} project={project} />)}
              </div>
            </Panel>
          </div>

          <aside className="space-y-4">
            <Panel title="Create New">
              <div className="grid grid-cols-4 gap-x-5 gap-y-7 px-3 py-3">
                {QUICK_CREATE.map(item => <QuickCreate key={item.label} {...item} />)}
              </div>
            </Panel>

            <Panel title="Workspace Members">
              <div className="space-y-3">
                {WORKSPACE_MEMBERS.map(member => (
                  <div key={member.name} className="rounded border border-[#eeeae5] bg-[#faf9f7] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{member.name}</div>
                        <div className="mt-1 text-xs text-[#777]">{member.role} · {member.status}</div>
                      </div>
                      <Users size={15} className="shrink-0 text-[#777]" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {member.labels.map(label => (
                        <span key={label} className="rounded bg-white px-2 py-1 text-[11px] font-medium text-[#555]">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <Link href="/pro/company?tab=organization" className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-[#232323] bg-white px-3 py-2 text-sm font-semibold">
                  Manage Members <ArrowRight size={13} />
                </Link>
              </div>
            </Panel>

            <Panel title="Marble 3D Preview">
              <div className="space-y-4">
                <div className="relative h-36 overflow-hidden rounded border border-[#e8e5df] bg-[#f5f3ef]">
                  <div className="absolute inset-3 grid grid-cols-[1.2fr_.8fr] gap-2">
                    <div className="rounded bg-white shadow-sm">
                      <div className="h-1/2 border-b border-[#e8e5df]" />
                      <div className="grid h-1/2 grid-cols-2">
                        <div className="border-r border-[#e8e5df]" />
                        <div />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded bg-white shadow-sm" />
                      <div className="h-12 rounded bg-white shadow-sm" />
                    </div>
                  </div>
                  <MonitorUp size={24} className="absolute bottom-3 right-3 text-[#202020]" />
                </div>
                <p className="text-xs leading-5 text-[#777]">
                  Marble 3D preview is for pre-sales storytelling, operations and marketing reference only. Final delivery uses the Design Platform package.
                </p>
                <Link href="/pro/leads?tab=preview" className="inline-flex w-full items-center justify-center gap-1.5 rounded bg-[#202020] px-3 py-2 text-sm font-semibold text-white">
                  Send Client Preview <ArrowRight size={13} />
                </Link>
              </div>
            </Panel>

            <Panel title="Site Management">
              <div className="space-y-3 text-sm">
                <div className="rounded border border-[#eeeae5] bg-[#faf9f7] p-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Building2 size={15} />
                    Project Site
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#777]">
                    For B-side projects, Studio fleet can be hosted under a Site before a customer account is attached.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ['4', 'Sites'],
                    ['9', 'Studios'],
                    ['2', 'Alerts'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded border border-[#eeeae5] bg-white p-2">
                      <div className="text-lg font-semibold">{value}</div>
                      <div className="text-[11px] text-[#777]">{label}</div>
                    </div>
                  ))}
                </div>
                <Link href="/pro/studios" className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-[#232323] bg-white px-3 py-2 text-sm font-semibold">
                  Open Studio Fleet <ArrowRight size={13} />
                </Link>
              </div>
            </Panel>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Panel({
  title,
  titleHref,
  action,
  children,
}: {
  title: string;
  titleHref?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const titleNode = (
    <h2 className="inline-flex items-center gap-1 text-base font-semibold">
      {title}
      {titleHref && <ChevronRight size={18} />}
    </h2>
  );

  return (
    <section className="rounded border border-[#e8e5df] bg-white shadow-sm shadow-black/[0.02]">
      <div className="flex min-h-14 items-center justify-between px-4 pt-4">
        {titleHref ? <Link href={titleHref}>{titleNode}</Link> : titleNode}
        {action}
      </div>
      <div className="px-4 pb-4 pt-3">{children}</div>
    </section>
  );
}

function ProjectCard({ project, accent }: { project: Project; accent: string }) {
  const status = resolveProjectStatus(project);
  const statusLabel = status === 'in_progress' ? 'In Progress' : status === 'open' ? 'Open' : status === 'done' ? 'Done' : 'Closed';

  return (
    <Link
      href={`/pro/projects/${project.id}/overview`}
      className="min-h-[128px] w-[190px] shrink-0 border border-[#eeeae5] bg-[#f7f5f1] px-4 py-3 transition hover:bg-white"
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <div className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">{project.title}</div>
      <div className="mt-3 truncate text-xs text-[#777]">{project.customerName || project.contactName || 'Client'}</div>
      <div className="mt-3 inline-flex rounded bg-white px-2 py-1 text-xs font-medium text-[#777]">{statusLabel}</div>
    </Link>
  );
}

function buildTodos(projects: Project[], leads: typeof CARDS) {
  const firstLead = leads[0];
  const firstProject = projects[0];
  const secondProject = projects[1] ?? firstProject;

  return [
    {
      icon: MonitorUp,
      title: firstLead ? 'Send Marble preview' : 'Prepare Marble preview',
      middle: firstLead ? `${firstLead.customer} · pre-sales reference` : 'Lead follow-up',
      due: 'Due by Nov 15',
      href: firstLead ? `/pro/leads/${firstLead.id}` : '/pro/leads',
      tone: 'cyan' as const,
    },
    {
      icon: KeyRound,
      title: 'Generate Provisioning Code',
      middle: secondProject?.title ?? 'Nelson Residence',
      due: 'Nov 13 - Nov 14',
      href: secondProject ? `/pro/projects/${secondProject.id}/overview` : '/pro/projects',
      tone: 'amber' as const,
    },
    {
      icon: Smartphone,
      title: 'SE on-site implementation',
      middle: firstProject?.title ?? 'Project',
      due: 'Nov 13 - Nov 14',
      href: firstProject ? `/pro/projects/${firstProject.id}/overview` : '/pro/projects',
      tone: 'amber' as const,
    },
  ];
}

function buildStageCounts(projects: Project[], leadCount: number) {
  return {
    leads: leadCount,
    design: projects.filter(project => ['lead', 'designing'].includes(project.phase ?? '')).length,
    procurement: projects.filter(project => project.phase === 'confirmed').length || 2,
    install: projects.filter(project => project.phase === 'installing').length,
    acceptance: projects.filter(project => project.phase === 'acceptance').length,
    sites: projects.filter(project => ['office', 'store', 'hotel', 'school', 'stadium'].includes(project.buildingType ?? '')).length || 4,
    transfer: projects.filter(project => project.phase === 'completed' && project.linkedStudioId).length,
  };
}

function TodoRow({
  icon: Icon,
  title,
  middle,
  due,
  href,
  tone,
}: {
  icon: ElementType;
  title: string;
  middle: string;
  due: string;
  href: string;
  tone: 'cyan' | 'amber';
}) {
  return (
    <Link href={href} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_120px] items-center gap-4 py-3 text-sm hover:bg-[#faf9f7]">
      <span className="flex min-w-0 items-center gap-3 font-semibold">
        <span className={cn('flex h-6 w-6 items-center justify-center rounded', tone === 'cyan' ? 'bg-cyan-50 text-cyan-500' : 'bg-amber-50 text-amber-500')}>
          <Icon size={14} />
        </span>
        <span className="truncate">{title}</span>
      </span>
      <span className="truncate text-[#777]">{middle}</span>
      <span className="justify-self-end text-xs font-medium text-[#777]">{due}</span>
    </Link>
  );
}

function ImplementationRow({ project }: { project: Project }) {
  const phaseLabel = project.phase === 'installing'
    ? 'Implementing | Not completed'
    : project.phase === 'acceptance'
      ? 'Implemented | Service pending'
      : project.phase === 'completed'
        ? 'Transferred | Awaiting review'
        : 'Ready for installer';
  const codeState = project.phase === 'installing' ? 'Provisioning issued' : project.linkedStudioId ? 'Studio bound' : 'Code pending';
  const studioState = project.phase === 'completed' ? 'Temporary ID deleted' : project.phase === 'acceptance' ? 'Ready for transfer' : 'Temporary ID issued';

  return (
    <Link href={`/pro/projects/${project.id}/overview`} className="grid grid-cols-[minmax(0,1fr)_150px_160px] gap-4 py-3 text-sm hover:bg-[#faf9f7]">
      <span className="min-w-0">
        <span className="block truncate font-semibold">{project.title}</span>
        <span className="mt-1 block truncate text-xs text-[#777]">{project.customerName ?? 'Customer'} · {project.devices} devices · {project.managers?.join(', ')}</span>
      </span>
      <span className="text-xs">
        <span className="block font-semibold text-[#202020]">{phaseLabel}</span>
        <span className="mt-1 flex items-center gap-1 text-[#777]"><KeyRound size={12} /> {codeState}</span>
      </span>
      <span className="text-xs">
        <span className="block font-semibold text-[#202020]">{studioState}</span>
        <span className="mt-1 flex items-center gap-1 text-[#777]">
          {project.linkedStudioId ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
          {project.linkedStudioId ?? 'No Studio yet'}
        </span>
      </span>
    </Link>
  );
}

function QuickCreate({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: string;
  icon: ElementType;
}) {
  return (
    <Link href={href} className="group flex min-h-[72px] flex-col items-center justify-start gap-2 text-center text-sm font-medium text-[#555]">
      <span className="flex h-10 w-10 items-center justify-center rounded bg-[#faf9f7] text-[#202020] transition group-hover:bg-[#f1eee8]">
        <Icon size={20} strokeWidth={2.2} />
      </span>
      <span className="leading-4">{label}</span>
    </Link>
  );
}
