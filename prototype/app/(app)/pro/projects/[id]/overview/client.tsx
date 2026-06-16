'use client';

import Link from 'next/link';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { useState, type ElementType, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Box,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Cloud,
  Cpu,
  FileText,
  ImageIcon,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  PackageCheck,
  Plus,
  Receipt,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  Users,
  Wrench,
} from 'lucide-react';
import {
  getProject,
  STATUS_META,
  STATUS_ORDER,
  resolveProjectStatus,
  type Project,
  type ProjectStatus,
} from '@/lib/mock/projects';
import { getCustomer } from '@/lib/mock/customers';
import { cn, formatNumber } from '@/lib/utils';

type ProjectTab =
  | 'overview'
  | 'contracts'
  | 'estimates'
  | 'takeoffs'
  | 'floorplans'
  | 'moodboards'
  | 'selectionboards'
  | 'selectionstracker'
  | 'bids'
  | 'files'
  | 'schedule'
  | 'tasks'
  | 'clientdashboard'
  | 'dailylogs'
  | 'timeexpenses'
  | 'warranty'
  | 'invoices'
  | 'purchaseorders'
  | 'changeorders'
  | 'retainers';

const PLANNING_ITEMS: { id: ProjectTab; label: string }[] = [
  { id: 'contracts', label: 'Contracts' },
  { id: 'estimates', label: 'Estimates' },
  { id: 'takeoffs', label: 'Takeoffs' },
  { id: 'floorplans', label: '3D Floor Plans' },
  { id: 'moodboards', label: 'Mood Boards' },
  { id: 'selectionboards', label: 'Selection Boards' },
  { id: 'selectionstracker', label: 'Selections Tracker' },
  { id: 'bids', label: 'Bids' },
];

const MANAGEMENT_ITEMS: { id: ProjectTab; label: string }[] = [
  { id: 'files', label: 'Files & Photos' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'tasks', label: 'Tasks & Punchlist' },
  { id: 'clientdashboard', label: 'Client Dashboard' },
  { id: 'dailylogs', label: 'Daily Logs' },
  { id: 'timeexpenses', label: 'Time & Expenses' },
  { id: 'warranty', label: 'Warranty Claims' },
];

const FINANCE_ITEMS: { id: ProjectTab; label: string }[] = [
  { id: 'invoices', label: 'Invoices' },
  { id: 'purchaseorders', label: 'Purchase Orders' },
  { id: 'changeorders', label: 'Change Orders' },
  { id: 'retainers', label: 'Retainers & Credits' },
];

const TABLE_TABS = new Set<ProjectTab>([
  'contracts',
  'estimates',
  'takeoffs',
  'bids',
  'invoices',
  'purchaseorders',
  'changeorders',
  'retainers',
  'dailylogs',
  'timeexpenses',
  'warranty',
]);

export default function ProjectOverviewPage() {
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const projectId = params?.id ?? '';
  const project = getProject(projectId);

  if (!project) return notFound();

  const requestedTab = searchParams?.get('tab') as ProjectTab | null;
  const activeTab = requestedTab && isProjectTab(requestedTab) ? requestedTab : 'overview';
  const customer = project.customerId ? getCustomer(project.customerId) : null;

  const showInspector = activeTab === 'overview';

  return (
    <div className={cn(
      'grid h-screen overflow-hidden bg-white text-slate-950',
      showInspector ? 'grid-cols-[280px_minmax(0,1fr)_320px]' : 'grid-cols-[280px_minmax(0,1fr)]',
    )}>
      <ProjectObjectSidebar project={project} activeTab={activeTab} />

      <main className="min-w-0 overflow-y-auto border-r border-slate-200 bg-white">
        {activeTab === 'overview' ? (
          <ProjectOverviewRoom project={project} customer={customer} />
        ) : TABLE_TABS.has(activeTab) ? (
          <ProjectSpreadsheet project={project} tab={activeTab} />
        ) : (
          <ProjectSimpleWorkspace project={project} tab={activeTab} />
        )}
      </main>

      {showInspector && <ProjectInspector project={project} customer={customer} />}
    </div>
  );
}

function isProjectTab(value: string): value is ProjectTab {
  return value === 'overview'
    || PLANNING_ITEMS.some(item => item.id === value)
    || MANAGEMENT_ITEMS.some(item => item.id === value)
    || FINANCE_ITEMS.some(item => item.id === value);
}

function ProjectObjectSidebar({ project, activeTab }: { project: Project; activeTab: ProjectTab }) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="border-l-4 border-violet-600 pl-4">
          <h2 className="text-lg font-semibold leading-snug text-slate-950">{project.title}</h2>
          <div className="mt-1 text-xs text-slate-500">{project.customerName ?? 'Client'} · {project.city ?? project.countryLabel ?? 'Remote'}</div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <IconSquare icon={Mail} />
          <IconSquare icon={MessageSquare} />
          <IconSquare icon={FileText} />
          <IconSquare icon={Settings} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <SidebarGroup title="Planning">
          {PLANNING_ITEMS.map(item => <ProjectNavItem key={item.id} project={project} item={item} active={activeTab === item.id} />)}
        </SidebarGroup>
        <SidebarGroup title="Management">
          {MANAGEMENT_ITEMS.map(item => <ProjectNavItem key={item.id} project={project} item={item} active={activeTab === item.id} />)}
        </SidebarGroup>
        <SidebarGroup title="Finance">
          {FINANCE_ITEMS.map(item => <ProjectNavItem key={item.id} project={project} item={item} active={activeTab === item.id} />)}
        </SidebarGroup>
      </div>
    </aside>
  );
}

function IconSquare({ icon: Icon }: { icon: ElementType }) {
  return (
    <button className="flex h-10 items-center justify-center rounded bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
      <Icon size={16} />
    </button>
  );
}

function SidebarGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
        <span>{title}</span>
        <ChevronDown size={14} />
      </div>
      <div className="space-y-1 border-l border-slate-200 pl-3">
        {children}
      </div>
    </section>
  );
}

function ProjectNavItem({
  project,
  item,
  active,
}: {
  project: Project;
  item: { id: ProjectTab; label: string };
  active: boolean;
}) {
  return (
    <Link
      href={`/pro/projects/${project.id}/overview?tab=${item.id}`}
      className={cn(
        'flex h-9 items-center rounded px-3 text-sm transition',
        active ? 'bg-slate-100 font-medium text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
      )}
    >
      {item.label}
    </Link>
  );
}

function ProjectOverviewRoom({ project, customer }: { project: Project; customer: ReturnType<typeof getCustomer> | null }) {
  return (
    <div className="space-y-5 p-6">
      <ProjectPlanningPanels project={project} />
      <StudioDeploymentPanel project={project} customer={customer} />
      <UpcomingPanel />
      <FilesPanel project={project} />
      <TasksPunchlist project={project} />
      <BudgetPanel project={project} />
    </div>
  );
}

function ProjectPlanningPanels({ project }: { project: Project }) {
  return (
    <>
      <OverviewActionPanel
        title="Estimates"
        href={`/pro/projects/${project.id}/overview?tab=estimates`}
        actions={[
          { label: 'Create with AI', icon: BarChart3, href: `/pro/projects/${project.id}/overview?tab=estimates&new=ai` },
          { label: 'Start from Scratch', icon: Plus, href: `/pro/projects/${project.id}/overview?tab=estimates&new=scratch` },
          { label: 'From Templates', icon: FileText, href: `/pro/projects/${project.id}/overview?tab=estimates&new=template` },
        ]}
      />

      <OverviewActionPanel
        title="Takeoffs (1)"
        href={`/pro/projects/${project.id}/overview?tab=takeoffs`}
        actions={[
          { label: 'Upload Plans', icon: UploadCloud, href: `/pro/projects/${project.id}/overview?tab=takeoffs&new=upload` },
        ]}
      >
        <Link
          href={`/pro/projects/${project.id}/takeoffs/framing-plan`}
          className="flex h-28 w-36 flex-col items-center justify-center gap-2 rounded border border-transparent bg-white text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded bg-red-500 text-white">
            <FileText size={17} />
          </span>
          Framing Plan
        </Link>
      </OverviewActionPanel>

      <OverviewActionPanel
        title="3D Floor Plans (1)"
        href={`/pro/projects/${project.id}/overview?tab=floorplans`}
        actions={[
          { label: 'Start from Scratch', icon: Plus, href: `/pro/projects/${project.id}/overview?tab=floorplans&new=scratch` },
          { label: '3D Room Scan', icon: Box, href: `/pro/projects/${project.id}/overview?tab=floorplans&new=scan` },
          { label: 'Upload 2D Plan', icon: UploadCloud, href: `/pro/projects/${project.id}/overview?tab=floorplans&new=upload` },
          { label: 'From Templates', icon: FileText, href: `/pro/projects/${project.id}/overview?tab=floorplans&new=template` },
        ]}
      >
        <Link
          href={`/build?entry=pro&demo_as=pro&workflow=space&project=${project.id}`}
          className="flex h-28 w-36 flex-col items-center justify-center gap-2 rounded border border-transparent bg-white text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded bg-indigo-500 text-white">
            <Box size={17} />
          </span>
          Space Plan
        </Link>
      </OverviewActionPanel>
    </>
  );
}

function OverviewActionPanel({
  title,
  href,
  actions,
  children,
}: {
  title: string;
  href: string;
  actions: { label: string; icon: ElementType; href: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <Link href={href} className="mb-4 inline-flex items-center gap-1 text-base font-semibold text-slate-950">
        {title} <ArrowRight size={15} />
      </Link>
      <div className="flex flex-wrap gap-3">
        {actions.map(action => (
          <ActionTile key={action.label} action={action} />
        ))}
        {children}
      </div>
    </section>
  );
}

function ActionTile({ action }: { action: { label: string; icon: ElementType; href: string } }) {
  const Icon = action.icon;
  return (
    <Link
      href={action.href}
      className="flex h-28 w-36 flex-col items-center justify-center gap-3 rounded border border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
    >
      <Icon size={18} />
      <span>{action.label}</span>
    </Link>
  );
}

const STUDIO_DELIVERY_STEPS = [
  {
    key: 'construction',
    label: 'Start Construction',
    desc: 'Mobile installer session starts and project moves to Installing.',
    actor: 'Installer',
    time: '09:18',
    icon: Smartphone,
  },
  {
    key: 'temporary-space',
    label: 'Temporary Space',
    desc: 'Studio Cloud creates a temporary virtual Space for this project.',
    actor: 'Studio Cloud',
    time: '09:21',
    icon: Cloud,
  },
  {
    key: 'studio-onboarding',
    label: 'M300 Studio Online',
    desc: 'Power check, health scan, and bind Studio into the temporary Space.',
    actor: 'Installer',
    time: '09:36',
    icon: Cpu,
  },
  {
    key: 'device-onboarding',
    label: 'Device Onboarding',
    desc: 'Installer batches physical devices into rooms from the mobile tool.',
    actor: 'Installer',
    time: '10:12',
    icon: PackageCheck,
  },
  {
    key: 'mapping',
    label: 'Virtual-Physical Binding',
    desc: 'Match planned points to real devices, then verify on site.',
    actor: 'Builder Pro',
    time: '10:48',
    icon: Link2,
  },
  {
    key: 'deploy',
    label: 'Deploy Solution',
    desc: 'Confirm mapping and push the design package to Studio.',
    actor: 'Project Lead',
    time: '11:06',
    icon: Send,
  },
  {
    key: 'acceptance',
    label: 'Acceptance & Transfer',
    desc: 'Submit evidence, transfer Space and Studio to the customer.',
    actor: 'Customer',
    time: 'Pending',
    icon: ShieldCheck,
  },
];

function StudioDeploymentPanel({ project, customer }: { project: Project; customer: ReturnType<typeof getCustomer> | null }) {
  const [activeIndex, setActiveIndex] = useState(2);
  const clientName = customer?.name ?? project.customerName ?? project.contactName ?? 'Customer';
  const mappedDevices = Math.min(38 + activeIndex * 2, 46);
  const currentStep = STUDIO_DELIVERY_STEPS[activeIndex];
  const CurrentIcon = currentStep.icon;

  function advanceTo(index: number) {
    setActiveIndex(Math.min(index, STUDIO_DELIVERY_STEPS.length - 1));
  }

  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/pro/projects/${project.id}/overview?tab=tasks`} className="inline-flex items-center gap-1 text-base font-semibold text-slate-950">
          Studio Delivery <ArrowRight size={15} />
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => advanceTo(0)}
            className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Smartphone size={15} /> Start Construction
          </button>
          <button
            onClick={() => advanceTo(4)}
            className="inline-flex h-9 items-center gap-2 rounded bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Link2 size={15} /> Deploy Solution
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveIndex(activeIndex)}
          className="flex h-28 w-36 flex-col items-center justify-center gap-2 rounded border border-transparent bg-white text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded bg-slate-950 text-white">
            <CurrentIcon size={17} />
          </span>
          {currentStep.label}
        </button>

        <div className="flex h-28 min-w-[520px] flex-1 flex-col justify-center rounded border border-slate-200 bg-slate-50 px-5">
          <div className="grid grid-cols-7">
            {STUDIO_DELIVERY_STEPS.map((step, index) => {
              const Icon = step.icon;
              const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'next';
              return (
                <button
                  key={step.key}
                  onClick={() => setActiveIndex(index)}
                  className="group relative flex min-w-0 flex-col items-center gap-2 px-1 text-center"
                >
                  {index > 0 && (
                    <span
                      className={cn(
                        'absolute right-1/2 top-4 h-0.5 w-full',
                        index <= activeIndex ? 'bg-emerald-500' : 'bg-slate-200'
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 transition',
                      state === 'done' && 'bg-emerald-500 text-white ring-emerald-500',
                      state === 'active' && 'bg-slate-950 text-white ring-slate-950',
                      state === 'next' && 'text-slate-400 ring-slate-200 group-hover:text-slate-700 group-hover:ring-slate-300'
                    )}
                  >
                    {state === 'done' ? <CheckCircle2 size={15} /> : <Icon size={15} />}
                  </span>
                  <span className={cn('line-clamp-2 text-[11px] font-medium leading-4', state === 'active' ? 'text-slate-950' : 'text-slate-500')}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex h-28 w-36 flex-col items-center justify-center gap-2 rounded border border-transparent bg-white text-sm font-medium text-slate-700">
          <span className="flex h-10 w-10 items-center justify-center rounded bg-emerald-500 text-white">
            <Link2 size={17} />
          </span>
          {mappedDevices}/46 Mapped
        </div>

        <div className="flex h-28 w-36 flex-col items-center justify-center gap-2 rounded border border-transparent bg-white text-sm font-medium text-slate-700">
          <span className="flex h-10 w-10 items-center justify-center rounded bg-cyan-500 text-white">
            <ShieldCheck size={17} />
          </span>
          {activeIndex >= 6 ? 'Transfer Ready' : `${clientName} Space`}
        </div>

        <div className="flex h-28 min-w-[220px] flex-1 flex-col justify-center rounded border border-slate-200 bg-white px-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <StatusMetric label="State" value={activeIndex >= 6 ? 'Acceptance' : activeIndex >= 4 ? 'Deploying' : 'Installing'} />
            <StatusMetric label="Studio" value="M300 Online" />
            <StatusMetric label="Space" value="Temporary" />
            <StatusMetric label="Evidence" value="Ready" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="max-w-36 text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function UpcomingPanel() {
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-950">Upcoming</h2>
        <button className="inline-flex items-center gap-1 text-sm text-slate-700">
          Filter by: All <ChevronDown size={14} />
        </button>
      </div>
      <div className="flex gap-3">
        {['Today', 'This Week', 'Next Week'].map((item, index) => (
          <button
            key={item}
            className={cn('h-10 rounded-full px-5 text-sm font-medium', index === 0 ? 'border border-slate-950 bg-white text-slate-950' : 'bg-slate-100 text-slate-700')}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid min-h-36 place-items-center text-center">
        <div>
          <Calendar size={22} className="mx-auto text-slate-600" />
          <div className="mt-3 text-sm font-semibold text-slate-950">Upcoming Due Dates</div>
          <div className="mt-1 text-xs text-slate-500">See your upcoming due dates appear here</div>
        </div>
      </div>
    </section>
  );
}

function FilesPanel({ project }: { project: Project }) {
  const files = project.files ?? [];
  return (
    <section className="rounded border border-slate-200 bg-white p-5">
      <Link href={`/pro/projects/${project.id}/overview?tab=files`} className="mb-4 inline-flex items-center gap-1 text-base font-semibold text-slate-950">
        Files & Photos ({Math.max(files.length, 1)}) <ArrowRight size={15} />
      </Link>
      <div className="mb-4 flex items-center justify-between rounded bg-emerald-50 px-4 py-3 text-sm text-slate-700">
        <span>Upload from your Google Drive to manage all your files in one place</span>
        <button className="text-slate-400">×</button>
      </div>
      <div className="flex gap-3">
        <button className="flex h-28 w-40 flex-col items-center justify-center gap-2 rounded bg-indigo-50 text-sm font-medium text-slate-700">
          <UploadCloud size={18} /> Upload Files
        </button>
        <div className="h-28 w-32 rounded border border-slate-200 bg-slate-50 p-2">
          <div className="h-full rounded bg-white shadow-inner">
            <div className="grid h-full grid-cols-3 grid-rows-4 gap-px p-2">
              {Array.from({ length: 12 }).map((_, index) => <span key={index} className="rounded-sm bg-slate-200" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TasksPunchlist({ project }: { project: Project }) {
  const tasks = project.tasks ?? [];
  const rows = tasks.length > 0 ? tasks : [
    { id: 'task-1', title: 'Confirm outlet and fixture placements with electricians', done: false, due: 'Aug 8', owner: 'Team' },
    { id: 'task-2', title: 'Order rigid duct for HVAC installation', done: false, due: 'Aug 8', owner: 'Team' },
    { id: 'task-3', title: 'Discuss water damage repair scope with homeowner', done: false, due: 'Aug 2', owner: 'Team' },
  ];

  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <Link href={`/pro/projects/${project.id}/overview?tab=tasks`} className="inline-flex items-center gap-1 text-base font-semibold text-slate-950">
          Tasks & Punchlist ({rows.length}) <ArrowRight size={15} />
        </Link>
      </div>
      <div className="px-5 py-4">
        <div className="mb-4 flex gap-3">
          <button className="h-10 rounded-full border border-slate-950 px-5 text-sm font-medium">Tasks ({rows.length})</button>
          <button className="h-10 rounded-full bg-slate-100 px-5 text-sm font-medium text-slate-700">Punchlist</button>
        </div>
        <button className="mb-2 flex h-9 items-center gap-3 text-sm text-slate-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white"><Plus size={14} /></span>
          Create New Task
        </button>
        <div className="divide-y divide-slate-200">
          {rows.slice(0, 4).map(task => (
            <div key={task.id} className="grid grid-cols-[24px_minmax(0,1fr)_88px_32px] items-center gap-3 py-4">
              <span className={cn('h-5 w-5 rounded-full border', task.done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300')} />
              <span className={cn('truncate text-sm font-medium text-slate-800', task.done && 'text-slate-400 line-through')}>{task.title}</span>
              <span className="justify-self-end rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-600">{task.due ?? ''}</span>
              <Users size={16} className="text-slate-400" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BudgetPanel({ project }: { project: Project }) {
  const quoted = project.financials?.quotedAmount ?? project.quotedAmount ?? 0;
  const paid = project.financials?.paidAmount ?? 0;
  const pending = project.financials?.pendingAmount ?? quoted;

  return (
    <section className="rounded border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <Link href={`/pro/projects/${project.id}/overview?tab=estimates`} className="inline-flex items-center gap-1 text-base font-semibold text-slate-950">
          Budget <ArrowRight size={15} />
        </Link>
        <button className="text-sm font-medium text-slate-700">Full View</button>
      </div>
      <div className="grid grid-cols-3 gap-4 p-5">
        <BudgetCell label="Quoted" value={quoted} />
        <BudgetCell label="Paid" value={paid} tone="success" />
        <BudgetCell label="Pending" value={pending} tone="warning" />
      </div>
    </section>
  );
}

function BudgetCell({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'warning' }) {
  return (
    <div className="rounded border border-slate-200 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={cn('mt-2 text-xl font-semibold text-slate-950', tone === 'success' && 'text-emerald-600', tone === 'warning' && 'text-amber-600')}>
        ¥{formatNumber(value)}
      </div>
    </div>
  );
}

function ProjectSpreadsheet({ project, tab }: { project: Project; tab: ProjectTab }) {
  const title = getTabLabel(tab);
  const rows = buildProjectTableRows(project, tab);
  const canCreate = ['contracts', 'estimates', 'invoices', 'changeorders'].includes(tab);

  return (
    <div className="p-5">
      <div className="mb-5 flex h-9 items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
        {canCreate && (
          <div className="relative">
            <button className="flex h-9 items-center gap-2 rounded bg-slate-950 px-4 text-sm font-semibold text-white">
              New {singular(title)} <ChevronDown size={15} />
            </button>
          </div>
        )}
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="h-10 w-64 rounded border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400" placeholder="Search" />
        </div>
        {['Date Created: 01/...', 'Type: Active', 'Status: None', 'Recipient: None'].map(filter => (
          <button key={filter} className="flex h-10 items-center gap-2 rounded border border-slate-200 px-4 text-sm text-slate-700">
            {filter} <ChevronDown size={14} />
          </button>
        ))}
      </div>
      <div className="overflow-hidden border-t border-slate-200 bg-white">
        <div className="grid grid-cols-[1.45fr_1fr_.7fr_.8fr_1fr_.8fr_.8fr] border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
          {['Title', 'Recipient', 'Status', 'Created', 'Signed Copy', 'Sent', 'Updated'].map((header, index) => (
            <div key={header} className={cn('px-4 py-3', index === 0 && 'border-r border-slate-300')}>{header}</div>
          ))}
        </div>
        {rows.map(row => (
          <Link key={row.id} href={`/pro/projects/${project.id}/overview`} className="grid grid-cols-[1.45fr_1fr_.7fr_.8fr_1fr_.8fr_.8fr] border-b border-slate-200 text-sm text-slate-700 transition last:border-b-0 hover:bg-slate-50">
            <div className="border-r border-slate-300 px-4 py-4 font-medium text-slate-950">{row.title}</div>
            <div className="px-4 py-4">{row.recipient}</div>
            <div className="px-4 py-4"><StatusDot label={row.status} /></div>
            <div className="px-4 py-4">{row.created}</div>
            <div className="px-4 py-4 text-slate-400">{row.signedCopy}</div>
            <div className="px-4 py-4">{row.sent}</div>
            <div className="px-4 py-4">{row.updated}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProjectSimpleWorkspace({ project, tab }: { project: Project; tab: ProjectTab }) {
  return (
    <div className="p-6">
      <h1 className="mb-5 text-xl font-semibold text-slate-950">{getTabLabel(tab)}</h1>
      <div className="grid min-h-[460px] place-items-center rounded border border-slate-200 bg-white">
        <div className="text-center">
          <Box size={28} className="mx-auto text-slate-400" />
          <div className="mt-3 text-sm font-medium text-slate-700">{getTabLabel(tab)} workspace</div>
          <Link href={`/build?entry=pro&demo_as=pro&workflow=space&project=${project.id}`} className="mt-4 inline-flex h-10 items-center rounded bg-slate-950 px-4 text-sm font-semibold text-white">
            Open Design Platform
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProjectInspector({ project, customer }: { project: Project; customer: ReturnType<typeof getCustomer> | null }) {
  const status = resolveProjectStatus(project);
  const statusMeta = STATUS_META[status];
  const clientName = customer?.name ?? project.customerName ?? project.contactName ?? 'Client';
  const location = [project.addressDetail, project.addressRegion, project.city, project.countryLabel].filter(Boolean).join(', ') || 'Project address not set';

  return (
    <aside className="min-h-0 overflow-y-auto bg-white px-6 py-5">
      <div className="mb-5">
        <button className="flex h-9 w-full items-center justify-between rounded border border-indigo-100 bg-indigo-50 px-3 text-sm font-medium" style={{ color: statusMeta.color }}>
          <span>• {statusMeta.label}</span>
          <ChevronDown size={15} />
        </button>
      </div>

      <InspectorSection title="Project Location" action="Edit">
        <p className="text-sm leading-6 text-slate-700">{location}</p>
        <div className="mt-4 h-36 overflow-hidden rounded border border-slate-200 bg-emerald-50">
          <div className="relative h-full w-full">
            <div className="absolute left-8 top-7 h-16 w-24 rotate-12 rounded-full bg-emerald-100" />
            <div className="absolute right-6 top-4 h-20 w-20 rounded-full bg-cyan-100" />
            <div className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-lg" />
            <div className="absolute left-4 top-4 rounded bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm">View larger map</div>
          </div>
        </div>
      </InspectorSection>

      <InspectorSection title="Client Details" action="Edit">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-200 text-sm font-semibold text-violet-800">
            {clientName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-950">{clientName}</div>
            <div className="mt-1 text-sm text-slate-500">{project.contactPhone ?? 'No phone added'}</div>
            <div className="mt-2 text-sm leading-5 text-slate-600">{location}</div>
          </div>
        </div>
      </InspectorSection>

      <InspectorSection title="Project Chat" action="Open">
        <p className="mb-3 text-sm text-slate-500">Start chatting with your team</p>
        <button className="flex h-10 w-full items-center justify-between rounded border border-slate-300 px-3 text-sm text-slate-700">
          Start Chat <ArrowRight size={16} />
        </button>
      </InspectorSection>

      <InspectorSection title="Collaborators" action="Manage">
        <CollaboratorRow label="Managers" values={project.managers?.slice(0, 1) ?? ['J']} />
        <CollaboratorRow label="Team" values={project.managers ?? ['JR', 'TS', 'CD']} />
        <CollaboratorRow label="Subcontractors" values={[]} />
      </InspectorSection>
    </aside>
  );
}

function InspectorSection({ title, action, children }: { title: string; action?: string; children: ReactNode }) {
  return (
    <section className="mb-5 rounded border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {action && <button className="text-sm font-semibold text-slate-700">{action}</button>}
      </div>
      {children}
    </section>
  );
}

function CollaboratorRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="mb-4 flex items-center justify-between last:mb-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex -space-x-2">
        {values.length > 0 ? values.map(value => (
          <span key={value} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-cyan-100 text-[10px] font-semibold text-cyan-700">
            {value.slice(0, 2).toUpperCase()}
          </span>
        )) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Plus size={14} />
          </span>
        )}
      </div>
    </div>
  );
}

function getTabLabel(tab: ProjectTab) {
  return [...PLANNING_ITEMS, ...MANAGEMENT_ITEMS, ...FINANCE_ITEMS].find(item => item.id === tab)?.label ?? 'Overview';
}

function singular(label: string) {
  return label.endsWith('s') ? label.slice(0, -1) : label;
}

function buildProjectTableRows(project: Project, tab: ProjectTab) {
  const baseRecipient = project.customerName ?? project.contactName ?? 'Client';
  const amount = project.quotedAmount ? `¥${formatNumber(project.quotedAmount)}` : '';
  return [
    {
      id: `${tab}-1`,
      title: tab === 'contracts' ? 'General Contractor Agreement' : `${singular(getTabLabel(tab))} for ${project.title}`,
      recipient: baseRecipient,
      status: tab === 'contracts' ? 'Sent' : tab === 'invoices' ? 'Open' : 'Draft',
      created: project.createdAt,
      signedCopy: '',
      sent: project.updatedAt,
      updated: project.updatedAt,
      amount,
    },
  ];
}

function StatusDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
      {label}
    </span>
  );
}
