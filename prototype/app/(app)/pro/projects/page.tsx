'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Search, Plus, Cpu, Sparkles,
  Users, Inbox, ClipboardCheck,
  Shield, PenLine, X, Briefcase, Rocket, GitFork,
  Building2, Home, Store, Lock, MapPin, CalendarDays, Trash2, Eye, Copy,
  MessageSquare, CheckCircle2, ArrowDown, ArrowUp, ArrowUpDown, SlidersHorizontal,
  ExternalLink, Globe2, ChevronDown, Pin,
} from 'lucide-react';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import { cn, formatNumber } from '@/lib/utils';
import {
  getAllProjects,
  verifiedTemplates,
  createCubixProject,
  saveCubixLocalProject,
  deleteProject,
  STATUS_META,
  STATUS_ORDER,
  SOLUTION_STATUS_META,
  resolveProjectStatus,
  resolveLifecycleStatus,
  LIFECYCLE_STATUS_META,
  type Project,
  type ProjectStatus,
  type SolutionStatus,
} from '@/lib/mock/projects';
import { MyCustomers } from '@/lib/mock/customers';
import { getCustomer, TAG_LABEL, TAG_COLOR } from '@/lib/mock/customers';
import { useRole, can, isProBuilderRole, type Role } from '@/lib/role';
import { PRO_WORK_MODES } from '@/lib/pro-workbench-architecture';
import { CreateNewProjectDialog, type CreateNewProjectPayload } from '@/components/projects/CreateNewProjectDialog';

// ─── Filter types ─────────────────────────────────────────────────────

type CustomerFilter = 'all' | 'linked' | 'unlinked';
type ProjectSortKey = 'updated' | 'created' | 'name' | 'devices';
type SortDirection = 'asc' | 'desc';
type FilterPanelId = 'type' | 'status' | 'country';

const SOURCE_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  'build-ai': { label: 'Design Platform', color: '#a855f7', icon: Sparkles },
  'fork':     { label: 'Remix',       color: '#06b6d4', icon: GitFork },
  'manual':   { label: '手动创建',     color: '#64748b', icon: FolderOpen },
};

const PROJECT_VIEWS = [
  { id: 'all' as const, label: '全部 Passport' },
  { id: 'linked' as const, label: '客户交付' },
  { id: 'unlinked' as const, label: '待成单方案' },
];

function proRoleParam(role?: Role) {
  if (!role && typeof window !== 'undefined') {
    const seed = new URLSearchParams(window.location.search).get('demo_as');
    if (seed === 'verified') return 'verified';
  }
  return role === 'verified' ? 'verified' : 'pro';
}

function proProjectOverviewHref(projectId: string, role?: Role) {
  return `/pro/projects/${projectId}/overview?demo_as=${proRoleParam(role)}`;
}

type ProjectDirectoryStage =
  | 'all_active'
  | 'open'
  | 'design'
  | 'in_progress'
  | 'scheduled'
  | 'installing'
  | 'awaiting_client'
  | 'done'
  | 'closed'
  | 'archived';

type ProjectDirectoryRow = Project & {
  baseProjectId: string;
  directoryStage: Exclude<ProjectDirectoryStage, 'all_active'>;
  taskTitle: string;
  dueLabel: string;
  projectType: string;
  manager: string;
  clientName: string;
  locationLabel: string;
  tagList: string[];
};

const PROJECT_STAGE_TARGET_COUNTS: Record<Exclude<ProjectDirectoryStage, 'all_active'>, number> = {
  open: 8,
  design: 6,
  in_progress: 10,
  scheduled: 4,
  installing: 5,
  awaiting_client: 3,
  done: 6,
  closed: 8,
  archived: 4,
};

const ACTIVE_PROJECT_STAGES: Exclude<ProjectDirectoryStage, 'all_active'>[] = [
  'open',
  'design',
  'in_progress',
  'scheduled',
  'installing',
  'awaiting_client',
];

const COMPLETED_PROJECT_STAGES: Exclude<ProjectDirectoryStage, 'all_active'>[] = ['done'];
const INACTIVE_PROJECT_STAGES: Exclude<ProjectDirectoryStage, 'all_active'>[] = ['closed', 'archived'];

const PROJECT_STAGE_LABEL: Record<ProjectDirectoryStage, string> = {
  all_active: 'All Active Projects',
  open: 'Open',
  design: 'Design',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  installing: 'Installing',
  awaiting_client: 'Awaiting Client',
  done: 'Done',
  closed: 'Closed',
  archived: 'Archived',
};

const PROJECT_TYPES = ['Residential', 'Villa', 'Apartment', 'Office', 'Retail', 'Aging Care', 'Smart Garden', 'Service'];
const PROJECT_MANAGERS = ['Jun', 'Katie Congress', 'A. Chen', 'Bo Li'];
const PROJECT_TASKS = [
  'Send estimate',
  'Review floor plan',
  'Confirm device list',
  'Schedule site survey',
  'Prepare installation pack',
  'Client approval',
  'Commissioning checklist',
  'Add New Task',
];

function stageToProjectStatus(stage: ProjectDirectoryRow['directoryStage']): ProjectStatus {
  if (stage === 'done') return 'done';
  if (stage === 'closed' || stage === 'archived') return 'closed';
  if (stage === 'open' || stage === 'design') return 'open';
  return 'in_progress';
}

function buildProjectDirectoryRows(seed: Project[]): ProjectDirectoryRow[] {
  if (seed.length === 0) return [];
  const rows: ProjectDirectoryRow[] = [];
  let cursor = 0;

  (Object.keys(PROJECT_STAGE_TARGET_COUNTS) as ProjectDirectoryRow['directoryStage'][]).forEach(stage => {
    const count = PROJECT_STAGE_TARGET_COUNTS[stage];
    for (let i = 0; i < count; i += 1) {
      const sourceProject = seed[cursor % seed.length];
      const projectType = sourceProject.projectTypeLabel || PROJECT_TYPES[cursor % PROJECT_TYPES.length];
      const clientName = sourceProject.customerName || sourceProject.contactName || `Client ${cursor + 1}`;
      const locationLabel = sourceProject.addressRegion || sourceProject.city || sourceProject.countryLabel || sourceProject.country || 'Remote';
      const status = stageToProjectStatus(stage);
      rows.push({
        ...sourceProject,
        baseProjectId: sourceProject.id,
        id: `${sourceProject.id}-${stage}-${i}`,
        title: i === 0 ? sourceProject.title : `${sourceProject.title} · ${PROJECT_STAGE_LABEL[stage]} ${i + 1}`,
        projectStatus: status,
        managedStatus: PROJECT_STAGE_LABEL[stage],
        directoryStage: stage,
        taskTitle: PROJECT_TASKS[cursor % PROJECT_TASKS.length],
        dueLabel: cursor % 7 === 2 ? 'Overdue' : cursor % 4 === 0 ? 'Due by Nov 15' : '',
        projectType,
        manager: PROJECT_MANAGERS[cursor % PROJECT_MANAGERS.length],
        clientName,
        locationLabel,
        tagList: sourceProject.tags?.length ? sourceProject.tags.slice(0, 2) : cursor % 3 === 0 ? ['Residential', projectType] : [],
        updatedAt: cursor < 8 ? `${cursor + 1} hours ago` : `${(cursor % 9) + 1} days ago`,
      });
      cursor += 1;
    }
  });

  return rows;
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function ProProjectsPage() {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<ProjectDirectoryStage>('all_active');
  const [search, setSearch] = useState('');
  const [projectType, setProjectType] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [manager, setManager] = useState('all');
  const [market, setMarket] = useState('all');
  const [showNewProject, setShowNewProject] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [projectRevision, setProjectRevision] = useState(0);
  const { role, mounted: roleMounted } = useRole();
  const effectiveRole = roleMounted ? role : 'verified';

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('new') === '1') {
      setShowNewProject(true);
    }
  }, []);

  useEffect(() => {
    const refresh = () => setProjectRevision(v => v + 1);
    window.addEventListener('aqara:cubix-projects-change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('aqara:cubix-projects-change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const all = useMemo(() => {
    return getAllProjects().filter(p => {
      const isStandaloneSolution = !(p.customerId || p.customerName) && !p.projectStatus;
      return p.phase !== 'cancelled' && p.visibility !== 'verified' && !isStandaloneSolution;
    });
  }, [projectRevision]);

  const directoryRows = useMemo(() => buildProjectDirectoryRows(all), [all]);

  const stageCounts = useMemo(() => {
    const counts: Record<ProjectDirectoryStage, number> = {
      all_active: 0,
      open: 0,
      design: 0,
      in_progress: 0,
      scheduled: 0,
      installing: 0,
      awaiting_client: 0,
      done: 0,
      closed: 0,
      archived: 0,
    };
    for (const row of directoryRows) {
      counts[row.directoryStage] += 1;
      if (ACTIVE_PROJECT_STAGES.includes(row.directoryStage)) counts.all_active += 1;
    }
    return counts;
  }, [directoryRows]);

  const solutions = useMemo(() => {
    return getAllProjects().filter(p => {
      const isSpaceSolution = !p.buildMode || p.buildMode === 'architect';
      return p.phase !== 'cancelled'
        && p.visibility !== 'verified'
        && !(p.customerId || p.customerName)
        && isSpaceSolution;
    });
  }, [projectRevision]);

  const projectTypeOptions = useMemo(() => Array.from(new Set(directoryRows.map(row => row.projectType))), [directoryRows]);
  const managerOptions = useMemo(() => Array.from(new Set(directoryRows.map(row => row.manager))), [directoryRows]);
  const marketOptions = useMemo(() => Array.from(new Set(directoryRows.map(row => row.locationLabel))), [directoryRows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return directoryRows.filter(row => {
      const inStage = selectedStage === 'all_active'
        ? ACTIVE_PROJECT_STAGES.includes(row.directoryStage)
        : row.directoryStage === selectedStage;
      const status = resolveProjectStatus(row);
      const matchesSearch = !term
        || row.title.toLowerCase().includes(term)
        || row.clientName.toLowerCase().includes(term)
        || row.locationLabel.toLowerCase().includes(term);
      const matchesType = projectType === 'all' || row.projectType === projectType;
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesManager = manager === 'all' || row.manager === manager;
      const matchesMarket = market === 'all' || row.locationLabel === market;
      return inStage && matchesSearch && matchesType && matchesStatus && matchesManager && matchesMarket;
    });
  }, [directoryRows, selectedStage, search, projectType, statusFilter, manager, market]);

  const handleCreateProject = (payload: CreateNewProjectPayload) => {
    const linked = payload.linkedSolutionId ? solutions.find(s => s.id === payload.linkedSolutionId) : null;
    const project = createCubixProject(payload.name.trim() || '新建项目', {
      country: payload.country,
      countryLabel: payload.countryLabel,
      buildingType: payload.buildingType,
    });
    const address = [payload.addressRegion, payload.addressDetail].filter(Boolean).join(' · ');
    project.projectTypeLabel = payload.projectTypeLabel;
    project.addressRegion = payload.addressRegion;
    project.addressDetail = payload.addressDetail;
    project.contactName = payload.contactName;
    project.contactPhone = payload.contactPhone;
    project.backgroundDescription = payload.backgroundDescription;
    project.customerName = payload.contactName;
    project.city = payload.addressRegion;
    project.subtitle = `${payload.projectTypeLabel} · ${address}`;
    project.notes = [
      {
        id: `note-${Date.now()}`,
        text: payload.backgroundDescription,
        author: 'Jun',
        createdAt: 'just now',
        pinned: true,
      },
    ];
    if (linked) {
      project.linkedSolutionId = linked.linkedSolutionId ?? linked.id;
      project.linkedSolutionName = linked.linkedSolutionName ?? linked.title;
      project.subtitle = `${payload.projectTypeLabel} · 继承自 ${linked.title}`;
      project.thumbnailGradient = linked.thumbnailGradient;
      project.floorPlans = linked.floorPlans;
      project.devices = linked.devices;
      project.personas = linked.personas;
      project.designStage = linked.designStage;
      project.solutionVersion = linked.solutionVersion;
    }
    project.origin = 'pro-console';
    project.projectStatus = 'open';
    saveCubixLocalProject(project);
    setShowNewProject(false);
    router.push(proProjectOverviewHref(project.id, effectiveRole));
  };

  return (
    <div className="grid h-screen grid-cols-[216px_minmax(0,1fr)] overflow-hidden bg-white text-[#2f2f2f]">
      <ProjectManagementSidebar
        counts={stageCounts}
        selected={selectedStage}
        onSelect={setSelectedStage}
      />

      <main className="flex min-w-0 flex-col overflow-hidden bg-white">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e8e5df] px-5">
          <h1 className="text-lg font-semibold">
            {selectedStage === 'all_active' ? 'Active Projects' : PROJECT_STAGE_LABEL[selectedStage]}
          </h1>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-1 rounded px-2 text-sm font-semibold text-[#333] hover:bg-[#f6f4f0]">
              Actions <ChevronDown size={14} />
            </button>
            <button onClick={() => setShowDemoModal(true)} className="inline-flex h-9 items-center gap-2 rounded border border-[#d8d4cc] bg-white px-3 text-sm font-semibold text-[#333] hover:bg-[#f6f4f0]">
              <Copy size={14} /> Template
            </button>
            <button onClick={() => setShowNewProject(true)} className="inline-flex h-9 items-center gap-2 rounded bg-[#222] px-4 text-sm font-semibold text-white hover:bg-black">
              Add Project <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="flex h-12 shrink-0 items-end gap-7 border-b border-[#e8e5df] px-5 text-sm">
          {['Main View', 'My Projects', 'Residential', 'Service'].map((tab, index) => (
            <button
              key={tab}
              className={cn('h-12 border-b-2 font-medium', index === 0 ? 'border-[#222] text-[#222]' : 'border-transparent text-[#666] hover:text-[#222]')}
            >
              {tab}
            </button>
          ))}
          <button className="mb-3 text-[#777] hover:text-[#222]"><Plus size={18} /></button>
        </div>

        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#e8e5df] px-5">
          <label className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="h-10 w-48 rounded border border-[#e8e5df] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#bdb6aa]"
              placeholder="Search"
            />
          </label>
          <ProjectManagementFilterSelect value={projectType} onChange={setProjectType} label="All Project Types" options={projectTypeOptions} />
          <ProjectManagementFilterSelect
            value={statusFilter}
            onChange={value => setStatusFilter(value as ProjectStatus | 'all')}
            label="All Statuses"
            options={STATUS_ORDER}
            labels={Object.fromEntries(STATUS_ORDER.map(status => [status, STATUS_META[status].label]))}
          />
          <ProjectManagementFilterSelect value={manager} onChange={setManager} label="All Managers" options={managerOptions} />
          <ProjectManagementFilterSelect value={market} onChange={setMarket} label="All Markets" options={marketOptions} />
          <button className="ml-auto flex h-10 w-10 items-center justify-center rounded border border-[#e8e5df] text-[#555] hover:bg-[#f6f4f0]">
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <ProjectManagementTable rows={filtered} demoRole={effectiveRole} />
      </main>

      <AnimatePresence>
        {showNewProject && (
          <CreateNewProjectDialog
            title="Create New Project"
            linkedSolutions={solutions}
            onCancel={() => setShowNewProject(false)}
            onCreate={handleCreateProject}
          />
        )}
        {showDemoModal && <DemoProjectModal onClose={() => setShowDemoModal(false)} demoRole={effectiveRole} />}
      </AnimatePresence>
    </div>
  );
}

function ProjectManagementSidebar({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<ProjectDirectoryStage, number>;
  selected: ProjectDirectoryStage;
  onSelect: (stage: ProjectDirectoryStage) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-[#e8e5df] bg-white">
      <div className="flex h-16 shrink-0 items-center px-5">
        <h2 className="text-base font-semibold">Projects</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <ProjectStageGroup title="Active Projects">
          <ProjectStageButton stage="all_active" count={counts.all_active} selected={selected} onSelect={onSelect} />
          {ACTIVE_PROJECT_STAGES.map(stage => (
            <ProjectStageButton key={stage} stage={stage} count={counts[stage]} selected={selected} onSelect={onSelect} />
          ))}
        </ProjectStageGroup>
        <ProjectStageGroup title="Completed Projects">
          {COMPLETED_PROJECT_STAGES.map(stage => (
            <ProjectStageButton key={stage} stage={stage} count={counts[stage]} selected={selected} onSelect={onSelect} />
          ))}
        </ProjectStageGroup>
        <ProjectStageGroup title="Inactive Projects">
          {INACTIVE_PROJECT_STAGES.map(stage => (
            <ProjectStageButton key={stage} stage={stage} count={counts[stage]} selected={selected} onSelect={onSelect} />
          ))}
        </ProjectStageGroup>
        <ProjectStageGroup title="Imported Projects">
          <button className="flex h-9 w-full items-center rounded px-3 text-left text-sm font-medium text-[#666] hover:bg-[#f5f2ee] hover:text-[#222]">
            Project Import History
          </button>
        </ProjectStageGroup>
      </div>
      <div className="flex h-12 shrink-0 items-center gap-2 border-t border-[#e8e5df] px-5 text-sm font-medium text-[#555]">
        <FolderOpen size={15} />
        Project files
      </div>
    </aside>
  );
}

function ProjectStageGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#777]">
        {title}
        <ChevronDown size={14} />
      </div>
      <div className="space-y-1 border-l border-[#eeeae5] pl-2">{children}</div>
    </section>
  );
}

function ProjectStageButton({
  stage,
  count,
  selected,
  onSelect,
}: {
  stage: ProjectDirectoryStage;
  count: number;
  selected: ProjectDirectoryStage;
  onSelect: (stage: ProjectDirectoryStage) => void;
}) {
  const active = selected === stage;
  return (
    <button
      onClick={() => onSelect(stage)}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded px-3 text-left text-sm font-semibold transition',
        active ? 'bg-[#eeeae5] text-[#222]' : 'text-[#666] hover:bg-[#f5f2ee] hover:text-[#222]'
      )}
    >
      <span className="truncate">{PROJECT_STAGE_LABEL[stage]}</span>
      <span className="num ml-2 text-[#555]">{count}</span>
    </button>
  );
}

function ProjectManagementFilterSelect({
  value,
  onChange,
  label,
  options,
  labels,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="relative">
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="h-10 appearance-none rounded border border-[#e8e5df] bg-white pl-3 pr-9 text-sm font-medium text-[#555] outline-none hover:border-[#d7d2c9]"
      >
        <option value="all">{label}</option>
        {options.map(option => (
          <option key={option} value={option}>{labels?.[option] ?? option}</option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]" />
    </label>
  );
}

function ProjectManagementTable({ rows, demoRole }: { rows: ProjectDirectoryRow[]; demoRole: Role }) {
  const router = useRouter();

  if (rows.length === 0) {
    return (
      <div className="grid flex-1 place-items-center text-center">
        <div className="text-sm text-[#777]">No projects match this view</div>
      </div>
    );
  }

  return (
    <div data-projects-table-scroller className="min-h-0 flex-1 overflow-auto bg-white">
      <table className="min-w-[1780px] w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-[#e8e5df] text-left text-xs font-semibold text-[#777]">
            <th className="sticky left-0 z-30 w-[48px] min-w-[48px] border-b border-[#e8e5df] bg-white px-4 py-3"><input type="checkbox" className="h-4 w-4 rounded border-[#ddd]" /></th>
            <th className="sticky left-[48px] z-30 w-[360px] min-w-[360px] border-b border-[#e8e5df] bg-white px-4 py-3">Project Name ↕</th>
            <th className="sticky left-[408px] z-30 w-[240px] min-w-[240px] border-b border-[#e8e5df] bg-white px-4 py-3">Task</th>
            <th className="sticky left-[648px] z-30 w-[160px] min-w-[160px] border-b border-r-2 border-[#ddd8d0] bg-white px-4 py-3 shadow-[6px_0_10px_-10px_rgba(32,32,32,0.65)]"><Pin size={15} /></th>
            <th className="min-w-[150px] border-b border-[#e8e5df] px-4 py-3">Stage ↕</th>
            <th className="min-w-[150px] border-b border-[#e8e5df] px-4 py-3">Project Type ↕</th>
            <th className="min-w-[150px] border-b border-[#e8e5df] px-4 py-3">Client</th>
            <th className="min-w-[150px] border-b border-[#e8e5df] px-4 py-3">Location</th>
            <th className="min-w-[130px] border-b border-[#e8e5df] px-4 py-3">Manager</th>
            <th className="min-w-[170px] border-b border-[#e8e5df] px-4 py-3">Tags</th>
            <th className="min-w-[130px] border-b border-[#e8e5df] px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const status = resolveProjectStatus(row);
            const statusMeta = STATUS_META[status];
            return (
              <tr
                key={row.id}
                onClick={() => router.push(proProjectOverviewHref(row.baseProjectId, demoRole))}
                className="group h-16 cursor-pointer text-[#555] transition hover:bg-[#faf9f7]"
              >
                <td className="sticky left-0 z-20 border-b border-[#eeeae5] bg-white px-4 py-3 group-hover:bg-[#faf9f7]" onClick={event => event.stopPropagation()}>
                  <input type="checkbox" className="h-4 w-4 rounded border-[#ddd]" />
                </td>
                <td className="sticky left-[48px] z-20 border-b border-[#eeeae5] bg-white px-4 py-3 group-hover:bg-[#faf9f7]">
                  <div className="line-clamp-2 max-w-[320px] font-semibold leading-5 text-[#444]">{row.title}</div>
                  <div className="mt-1 text-xs text-[#888]">{row.clientName}</div>
                </td>
                <td className="sticky left-[408px] z-20 border-b border-[#eeeae5] bg-white px-4 py-3 group-hover:bg-[#faf9f7]">
                  {row.taskTitle === 'Add New Task' ? (
                    <button onClick={event => event.stopPropagation()} className="inline-flex items-center gap-2 text-[#aaa]">
                      <Plus size={16} /> Add New Task
                    </button>
                  ) : (
                    <span>{row.taskTitle}</span>
                  )}
                </td>
                <td className="sticky left-[648px] z-20 border-b border-r-2 border-[#ddd8d0] bg-white px-4 py-3 shadow-[6px_0_10px_-10px_rgba(32,32,32,0.65)] group-hover:bg-[#faf9f7]">
                  {row.dueLabel === 'Overdue' ? (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-500">• Overdue</span>
                  ) : (
                    <span className="text-xs font-medium text-[#777]">{row.dueLabel}</span>
                  )}
                </td>
                <td className="border-b border-[#eeeae5] px-4 py-3">
                  <button className="inline-flex min-w-[118px] items-center justify-between gap-3 text-left">
                    <span>{PROJECT_STAGE_LABEL[row.directoryStage]}</span>
                    <ChevronDown size={14} />
                  </button>
                  <div className="mt-1 text-xs" style={{ color: statusMeta.color }}>{statusMeta.label}</div>
                </td>
                <td className="border-b border-[#eeeae5] px-4 py-3">{row.projectType}</td>
                <td className="border-b border-[#eeeae5] px-4 py-3">{row.clientName}</td>
                <td className="border-b border-[#eeeae5] px-4 py-3">{row.locationLabel}</td>
                <td className="border-b border-[#eeeae5] px-4 py-3">{row.manager}</td>
                <td className="border-b border-[#eeeae5] px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {row.tagList.length > 0 ? row.tagList.slice(0, 2).map(tag => (
                      <span key={tag} className="rounded-full border border-[#e6e2dc] bg-white px-2 py-1 text-xs font-medium text-[#777]">{tag}</span>
                    )) : (
                      <button onClick={event => event.stopPropagation()} className="text-xs text-[#aaa] underline">Add tags</button>
                    )}
                  </div>
                </td>
                <td className="border-b border-[#eeeae5] px-4 py-3">{row.updatedAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex h-14 items-center border-t border-[#e8e5df] px-5 text-xs text-[#777]">
        {rows.length} records
      </div>
    </div>
  );
}

function normalizeDateValue(value?: string) {
  if (!value) return '0000-00-00';
  const lower = value.toLowerCase();
  if (lower.includes('just now')) return '9999-12-31T23:59:59';
  if (lower.includes('minute')) return '9999-12-31T23:58:00';
  if (lower.includes('hour')) return '9999-12-31T22:00:00';
  if (lower.includes('yesterday') || value === '昨天') return '9999-12-30';
  if (lower.includes('day') || value.includes('天前')) return '9999-12-20';
  if (lower.includes('week')) return '9999-11-30';
  return value;
}

function MetricPill({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'accent' | 'success' | 'warning';
}) {
  const toneClass = {
    default: 'border-border bg-bg-elevated/70 text-text-muted',
    accent: 'border-accent/30 bg-accent/10 text-accent-glow',
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
  }[tone];
  return (
    <div className={cn('inline-flex h-8 items-center gap-2 rounded-lg border px-2.5 text-xs', toneClass)}>
      <span className="text-[10px] text-text-subtle">{label}</span>
      <span className="num font-semibold text-text">{value}</span>
    </div>
  );
}

function ActiveFilter({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      onClick={onClear}
      className="inline-flex max-w-[180px] items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] text-accent-glow transition hover:bg-accent/15"
      title={`Clear ${label}`}
    >
      <span className="truncate">{label}</span>
      <X size={10} />
    </button>
  );
}

const FILTER_FLYOUT_TOP: Record<FilterPanelId, string> = {
  type: '108px',
  status: '156px',
  country: '204px',
};

function FilterRailButton({
  label,
  icon: Icon,
  active,
  open,
  onClick,
}: {
  label: string;
  icon: any;
  active?: boolean;
  open?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex h-11 w-full flex-col items-center justify-center gap-0.5 rounded-xl border text-[9px] font-medium transition',
        open
          ? 'border-accent/45 bg-accent/[0.12] text-accent shadow-sm shadow-accent/10'
          : active
          ? 'border-accent/30 bg-accent/10 text-accent'
          : 'border-border bg-bg-elevated text-text-muted hover:border-border-strong hover:bg-bg-subtle hover:text-text',
      )}
      title={label}
    >
      <Icon size={15} />
      <span>{label}</span>
      {active && !open && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />}
    </button>
  );
}

function FilterFlyout({
  panel,
  title,
  children,
  onClose,
}: {
  panel: FilterPanelId;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -6, scale: 0.98 }}
      transition={{ duration: 0.14, ease: 'easeOut' }}
      style={{ top: FILTER_FLYOUT_TOP[panel] }}
      className="absolute left-[56px] z-40 w-72 rounded-2xl border border-border bg-bg-elevated p-3 shadow-2xl shadow-slate-300/50 dark:shadow-black/40"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-subtle">{title}</div>
        <button
          onClick={onClose}
          className="ml-auto rounded-md p-1 text-text-subtle transition hover:bg-bg-subtle hover:text-text"
          title="Close"
        >
          <X size={12} />
        </button>
      </div>
      {children}
    </motion.div>
  );
}

function FilterBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4 border-t border-border pt-3">
      <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-subtle">
        {title}
        <span className="text-text-subtle">⌃</span>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function FilterOption({
  label,
  count,
  checked,
  onClick,
}: {
  label: string;
  count: number;
  checked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-xs transition',
        checked ? 'bg-accent/10 text-text' : 'text-text-muted hover:bg-bg-subtle hover:text-text',
      )}
    >
      <span className={cn(
        'flex h-4 w-4 items-center justify-center rounded-full border',
        checked ? 'border-accent bg-accent/15 text-accent-glow' : 'border-border bg-bg'
      )}>
        {checked && <CheckCircle2 size={10} />}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="num text-[10px] text-text-subtle">{count}</span>
    </button>
  );
}

function ProjectDirectoryTable({
  projects,
  remoteDesignHref,
  selectedId,
  onSelect,
  sortKey,
  sortDir,
  onSort,
  demoRole,
}: {
  projects: Project[];
  remoteDesignHref: (projectId?: string) => string;
  selectedId: string | null;
  onSelect: (projectId: string) => void;
  sortKey: ProjectSortKey;
  sortDir: SortDirection;
  onSort: (key: ProjectSortKey) => void;
  demoRole: Role;
}) {
  return (
    <div className="h-[calc(100%-44px)] overflow-auto">
      <table className="w-full min-w-[1060px] table-fixed border-separate border-spacing-0 text-xs">
        <thead className="sticky top-0 z-10 bg-bg">
          <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
            <th className="w-[30%] border-b border-border px-4 py-3">
              <SortHeader label="Name" active={sortKey === 'name'} direction={sortDir} onClick={() => onSort('name')} />
            </th>
            <th className="w-[10%] border-b border-border px-3 py-3">Type</th>
            <th className="w-[7%] border-b border-border px-3 py-3">Plans</th>
            <th className="w-[11%] border-b border-border px-3 py-3">Country</th>
            <th className="w-[11%] border-b border-border px-3 py-3">
              <SortHeader label="Updated" active={sortKey === 'updated'} direction={sortDir} onClick={() => onSort('updated')} />
            </th>
            <th className="w-[11%] border-b border-border px-3 py-3">
              <SortHeader label="Created" active={sortKey === 'created'} direction={sortDir} onClick={() => onSort('created')} />
            </th>
            <th className="w-[10%] border-b border-border px-3 py-3">
              <SortHeader label="Devices" active={sortKey === 'devices'} direction={sortDir} onClick={() => onSort('devices')} />
            </th>
            <th className="w-[10%] border-b border-border px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => {
            const status = resolveProjectStatus(project);
            const statusMeta = STATUS_META[status];
            const customer = project.customerId ? getCustomer(project.customerId) : null;
            const type = project.customerId ? 'Customer' : project.buildingType === 'villa' ? 'Villa' : 'Office';
            const floorCount = project.floorPlans?.length || (project.buildingType === 'villa' ? 2 : 1);
            const selected = project.id === selectedId;
            return (
              <tr
                key={project.id}
                onClick={() => onSelect(project.id)}
                className={cn(
                  'group cursor-pointer transition',
                  selected ? 'bg-accent/[0.08]' : 'hover:bg-slate-50',
                )}
              >
                <td className="border-b border-border/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={cn('h-8 w-1 rounded-full', selected ? 'bg-accent' : 'bg-transparent group-hover:bg-border-strong')} />
                    <div className="min-w-0">
                      <span className="block truncate font-medium text-text transition group-hover:text-accent">
                        {project.title}
                      </span>
                      <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[11px] text-text-subtle">
                        <span className="truncate">{project.customerName || customer?.name || project.subtitle}</span>
                        <span
                          className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px]"
                          style={{ background: `${statusMeta.color}12`, borderColor: `${statusMeta.color}35`, color: statusMeta.color }}
                        >
                          <span className="h-1 w-1 rounded-full" style={{ background: statusMeta.color }} />
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="border-b border-border/50 px-3 py-3 text-text-muted">
                  <span className="inline-flex items-center gap-2">
                    {type === 'Villa' ? <Home size={14} className="text-text-subtle" /> : <Building2 size={14} className="text-text-subtle" />}
                    {type}
                  </span>
                </td>
                <td className="border-b border-border/50 px-3 py-3 text-text-muted num">{floorCount}</td>
                <td className="border-b border-border/50 px-3 py-3 text-text-muted">{project.countryLabel || project.country || project.city || 'Remote'}</td>
                <td className="border-b border-border/50 px-3 py-3 text-text-muted">{project.updatedAt}</td>
                <td className="border-b border-border/50 px-3 py-3 text-text-muted">{project.createdAt}</td>
                <td className="border-b border-border/50 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-text-muted">
                    <span className="inline-flex items-center gap-1"><Cpu size={13} /> {project.devices || 0}</span>
                    <span className="inline-flex items-center gap-1"><Users size={13} /> {project.personas || 0}</span>
                  </div>
                </td>
                <td className="border-b border-border/50 px-3 py-3">
                  <div className="flex justify-end gap-1.5 opacity-85 transition group-hover:opacity-100" onClick={event => event.stopPropagation()}>
                    <Link href={remoteDesignHref(project.id)} className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-[11px] font-semibold text-accent transition hover:bg-accent/15">
                      Design
                    </Link>
                    <Link href={proProjectOverviewHref(project.id, demoRole)} className="hidden rounded-md border border-border bg-bg-elevated px-2.5 py-1.5 text-[11px] font-semibold text-text-muted transition hover:border-border-strong hover:text-text 2xl:inline-flex">
                      Open
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={cn('inline-flex items-center gap-1 transition hover:text-text', active && 'text-accent-glow')}>
      {label}
      {active ? (direction === 'desc' ? <ArrowDown size={11} /> : <ArrowUp size={11} />) : <ArrowUpDown size={11} />}
    </button>
  );
}

function ProjectInspector({
  project,
  remoteDesignHref,
  onClose,
  demoRole,
}: {
  project: Project;
  remoteDesignHref: (projectId?: string) => string;
  onClose: () => void;
  demoRole: Role;
}) {
  const status = resolveProjectStatus(project);
  const statusMeta = STATUS_META[status];
  const customer = project.customerId ? getCustomer(project.customerId) : null;
  const checks = getPassportChecks(project);
  const nextAction = project.nextActionHint || projectNextAction(project, status);
  const lifecycle = resolveLifecycleStatus(project);
  const lifecycleMeta = lifecycle ? LIFECYCLE_STATUS_META[lifecycle] : null;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-bg-elevated/55 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.14em] text-text-subtle">Selected Project</div>
            <h2 className="mt-1 truncate text-sm font-semibold text-text">{project.title}</h2>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-muted">
              {project.customerName || customer?.name || project.subtitle}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-start gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px]"
              style={{ background: `${statusMeta.color}15`, borderColor: `${statusMeta.color}35`, color: statusMeta.color }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusMeta.color }} />
              {statusMeta.label}
            </span>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-text-subtle transition hover:bg-bg-subtle hover:text-text"
              title="Close project preview"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniSpec icon={Cpu} label="Devices" value={`${project.devices || 0}`} />
          <MiniSpec icon={Users} label="Personas" value={`${project.personas || 0}`} />
          <MiniSpec icon={MapPin} label="Market" value={project.countryLabel || project.country || project.city || 'Remote'} />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Link href={remoteDesignHref(project.id)} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-white transition hover:bg-accent-glow">
            <Sparkles size={13} /> Open Design Platform
          </Link>
          <Link href={proProjectOverviewHref(project.id, demoRole)} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-bg px-3 text-xs font-medium text-text-muted transition hover:border-border-strong hover:text-text">
            <ExternalLink size={13} /> Project Overview
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-bg-elevated/45 p-4">
        <div className="text-[10px] uppercase tracking-[0.14em] text-text-subtle">Next Action</div>
        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          {lifecycleMeta ? <span className="text-text">{lifecycleMeta.label}: </span> : null}
          {nextAction}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-bg-elevated/45 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.14em] text-text-subtle">Project Passport</div>
          <span className="text-[10px] text-text-subtle">{checks.filter(item => item.ok).length}/{checks.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {checks.map(item => (
            <div
              key={item.label}
              className="rounded-md border px-2.5 py-2"
              style={{
                background: item.ok ? `${item.color}10` : 'rgba(255,255,255,0.02)',
                borderColor: item.ok ? `${item.color}35` : 'rgba(255,255,255,0.08)',
              }}
            >
              <div className="text-[9px] text-text-subtle">{item.label}</div>
              <div className="mt-0.5 truncate text-[11px] font-medium" style={{ color: item.ok ? item.color : 'rgba(255,255,255,0.6)' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-bg-elevated/45 p-4">
        <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-text-subtle">Quick Handoff</div>
        <div className="space-y-2 text-[11px]">
          <HandoffItem label="Brief to Design" done={!!(project.customerBriefId || project.customerName)} />
          <HandoffItem label="Design to Quote" done={!!project.quotedAmount} />
          <HandoffItem label="Quote to Studio" done={!!project.linkedStudioId} />
        </div>
      </div>
    </div>
  );
}

function HandoffItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-bg px-2.5 py-2">
      <span className="text-text-muted">{label}</span>
      <span className={cn('text-[10px] font-medium', done ? 'text-success' : 'text-warning')}>
        {done ? 'Ready' : 'Pending'}
      </span>
    </div>
  );
}

// ─── Demo Project Modal ───────────────────────────────────────────────

function DemoProjectModal({ onClose, demoRole }: { onClose: () => void; demoRole: Role }) {
  const router = useRouter();
  const templates = useMemo(() => verifiedTemplates(), []);
  const [forkingId, setForkingId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleFork = (template: Project) => {
    setForkingId(template.id);
    const now = new Date();
    const id = `cubix-${Date.now()}`;
    const forked: Project = {
      ...template,
      id,
      title: `${template.title} (我的副本)`,
      visibility: 'private' as any,
      appliedTo: 0,
      updatedAt: 'just now',
      createdAt: now.toISOString().slice(0, 10),
      source: 'fork',
      origin: 'cubix',
      customerId: undefined,
      customerName: undefined,
      projectStatus: undefined,
      managedStatus: undefined,
      linkedSolutionId: template.id,
      linkedSolutionName: template.title,
    };
    saveCubixLocalProject(forked);
    setTimeout(() => {
      onClose();
      router.push(proProjectOverviewHref(forked.id, demoRole));
    }, 400);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[640px] rounded-xl border border-border bg-bg-elevated shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Eye size={16} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold">Try Demo Project</h2>
              <p className="text-2xs text-text-muted">预览认证模板方案，一键创建副本到你的项目空间</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5 text-text-muted hover:text-text">
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-3">
            {templates.map((t, i) => {
              const ss = (t.solutionStatus || 'finalized') as SolutionStatus;
              const ssMeta = SOLUTION_STATUS_META[ss];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-border bg-bg/50 overflow-hidden hover:border-emerald-500/30 transition"
                >
                  <div className="flex">
                    {/* Thumbnail */}
                    <div
                      className="w-28 flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                      style={{ background: t.thumbnailGradient }}
                    >
                      <div className="absolute inset-0 grid-pattern opacity-30" />
                      <span className="text-3xl relative z-10">
                        {i === 0 ? '🧓' : '👨‍👩‍👧'}
                      </span>
                      <span className="absolute top-1.5 right-1.5 text-[9px] px-1 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 backdrop-blur-sm">
                        认证
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-xs font-semibold">{t.title}</h3>
                          <span className="text-[9px] px-1 py-0.5 rounded"
                            style={{ background: `${ssMeta.color}15`, color: ssMeta.color, border: `1px solid ${ssMeta.color}30` }}>
                            {ssMeta.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted line-clamp-1 mb-1.5">{t.subtitle}</p>
                        <div className="flex items-center gap-3 text-[10px] text-text-muted">
                          {t.devices > 0 && <span className="flex items-center gap-1"><Cpu size={9} /> {t.devices} 设备</span>}
                          {t.personas > 0 && <span className="flex items-center gap-1"><Users size={9} /> {t.personas} Persona</span>}
                          {(t.applyCount ?? t.appliedTo) > 0 && (
                            <span className="flex items-center gap-1"><Copy size={9} /> {(t.applyCount ?? t.appliedTo)} 次使用</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Link
                          href={proProjectOverviewHref(t.id, demoRole)}
                          onClick={onClose}
                          className="px-2.5 py-1 rounded text-[10px] border border-border text-text-muted hover:text-text hover:border-border-strong transition inline-flex items-center gap-1"
                        >
                          <Eye size={9} /> 预览 Demo
                        </Link>
                        <button
                          onClick={() => handleFork(t)}
                          disabled={forkingId === t.id}
                          className="px-2.5 py-1 rounded text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Copy size={9} />
                          {forkingId === t.id ? '创建中...' : '基于此创建'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border flex-shrink-0 bg-bg/50">
            <p className="text-[10px] text-text-muted">
              模板方案来自 <span className="text-emerald-400">Aqara Lab</span> 认证，基于模板创建的项目会保留原始方案关联。
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Work Cards ──────────────────────────────────────────────────────

function projectNextAction(p: Project, status: ProjectStatus) {
  if (!p.customerId) return '关联客户和 Brief 后，即可进入空间建模、报价和交付排期。';
  if (status === 'open') return '打开 Design Platform，完成户型图、设备点位和方案报价。';
  if (status === 'in_progress') return p.linkedStudioId ? '协同 Installer 实施，并跟进 Studio 授权状态。' : '准备 Installer 交接，等待客户 Studio 授权。';
  if (status === 'done') return '可转为服务包续费，或匿名化回流 Marketplace。';
  return '项目已归档，可查看交付记录。';
}

function getPassportChecks(p: Project) {
  const status = resolveProjectStatus(p);
  return [
    {
      label: 'Brief',
      value: p.customerBriefId || p.customerName ? 'Ready' : 'Need',
      ok: !!(p.customerBriefId || p.customerName),
      color: '#06b6d4',
    },
    {
      label: 'SpaceModel',
      value: (p.floorPlans?.length ?? 0) > 0 || p.devices > 0 ? 'Modeled' : 'Draft',
      ok: (p.floorPlans?.length ?? 0) > 0 || p.devices > 0,
      color: '#a855f7',
    },
    {
      label: 'Quote',
      value: p.quotedAmount ? `¥${formatNumber(p.quotedAmount)}` : 'Pending',
      ok: !!p.quotedAmount,
      color: '#f59e0b',
    },
    {
      label: 'Studio',
      value: p.linkedStudioId ? 'Bound' : 'Grant',
      ok: !!p.linkedStudioId,
      color: '#10b981',
    },
    {
      label: 'Ledger',
      value: p.financials ? (p.financials.pendingAmount > 0 ? 'Collect' : 'Clear') : 'Setup',
      ok: !!p.financials,
      color: '#f97316',
    },
    {
      label: 'Showcase',
      value: status === 'done' ? 'Ready' : 'Later',
      ok: status === 'done',
      color: '#22c55e',
    },
  ];
}

function ProjectCards({ projects, remoteDesignHref }: {
  projects: Project[];
  remoteDesignHref: (projectId?: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {projects.map((p, index) => (
        <RemoteDesignProjectCard key={p.id} project={p} index={index} remoteDesignHref={remoteDesignHref} />
      ))}
    </div>
  );
}

function RemoteDesignProjectCard({ project: p, index, remoteDesignHref }: {
  project: Project;
  index: number;
  remoteDesignHref: (projectId?: string) => string;
}) {
  const status = resolveProjectStatus(p);
  const statusMeta = STATUS_META[status];
  const customer = p.customerId ? getCustomer(p.customerId) : null;
  const source = SOURCE_LABEL[p.source] ?? SOURCE_LABEL.manual;
  const SourceIcon = source.icon;
  const openHref = proProjectOverviewHref(p.id);
  const nextAction = p.nextActionHint || projectNextAction(p, status);
  const thumbnailPattern = p.floorPlans?.[0]?.thumbnailPattern ?? (p.buildingType === 'villa' ? 'two-floor' : 'rooms');
  const lifecycle = resolveLifecycleStatus(p);
  const lifecycleMeta = lifecycle ? LIFECYCLE_STATUS_META[lifecycle] : null;
  const passportChecks = getPassportChecks(p);

  return (
    <motion.div
      initial={{ y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.25) }}
      className="card card-hover overflow-hidden group"
    >
      <div className="grid sm:grid-cols-[160px_1fr]">
        <Link href={openHref} className="relative min-h-[170px] overflow-hidden" style={{ background: p.thumbnailGradient }}>
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-4 opacity-75">
            <FloorplanSVG pattern={thumbnailPattern} showDevices={false} />
          </div>
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/45 px-2 py-0.5 text-[10px] text-white backdrop-blur-md">
            <SourceIcon size={10} />
            {source.label}
          </div>
          {p.linkedStudioId && (
            <div className="absolute bottom-3 left-3 rounded-full border border-success/30 bg-success/20 px-2 py-0.5 text-[10px] text-success backdrop-blur-md">
              Studio linked
            </div>
          )}
        </Link>

        <div className="p-4 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={openHref} className="text-sm font-semibold leading-snug line-clamp-1 group-hover:text-accent-glow transition">
                {p.title}
              </Link>
              <p className="mt-1 text-2xs text-text-muted line-clamp-1">{p.subtitle}</p>
            </div>
            <span
              className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
              style={{ background: `${statusMeta.color}15`, borderColor: `${statusMeta.color}30`, color: statusMeta.color }}
            >
              <span className="w-1 h-1 rounded-full" style={{ background: statusMeta.color }} />
              {statusMeta.label}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniSpec icon={Users} label="客户" value={p.customerName || customer?.name || '待关联'} />
            <MiniSpec icon={Cpu} label="设备" value={p.devices ? `${p.devices}` : '待定'} />
            <MiniSpec icon={MapPin} label="位置" value={p.city || customer?.city || '远程'} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {passportChecks.map(item => (
              <div
                key={item.label}
                className="rounded-lg border px-2 py-1.5"
                style={{
                  background: item.ok ? `${item.color}10` : 'rgba(255,255,255,0.02)',
                  borderColor: item.ok ? `${item.color}35` : 'rgba(148,163,184,0.18)',
                }}
              >
                <div className="text-[9px] text-text-subtle">{item.label}</div>
                <div className="mt-0.5 text-[10px] font-medium truncate" style={{ color: item.ok ? item.color : undefined }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <StatusTrack currentStatus={status} />
            <p className="mt-2 text-2xs text-text-muted leading-relaxed">
              {lifecycleMeta ? `${lifecycleMeta.label}: ${lifecycleMeta.sub} · ` : ''}{nextAction}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={remoteDesignHref(p.id)}
              className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-accent-glow text-2xs hover:bg-accent/15 inline-flex items-center gap-1.5"
            >
              <PenLine size={11} /> 空间建模
            </Link>
            <Link
              href={openHref}
              className="px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text hover:border-border-strong text-2xs inline-flex items-center gap-1.5"
            >
              <ClipboardCheck size={11} /> 项目详情
            </Link>
            <Link
              href={p.linkedStudioId ? '/pro/studios' : `${openHref}?tab=studio`}
              className="px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text hover:border-border-strong text-2xs inline-flex items-center gap-1.5"
            >
              <Shield size={11} /> {p.linkedStudioId ? '查看授权' : '请求授权'}
            </Link>
            {p.quotedAmount ? (
              <span className="ml-auto text-2xs text-success num">¥{formatNumber(p.quotedAmount)}</span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniSpec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated/60 px-2.5 py-2 min-w-0">
      <div className="flex items-center gap-1 text-[10px] text-text-subtle">
        <Icon size={10} />
        {label}
      </div>
      <div className="mt-1 truncate text-xs text-text-muted">{value}</div>
    </div>
  );
}

// ─── Project Table ────────────────────────────────────────────────────

const TABLE_COLS = [
  { key: 'name', label: '项目', className: 'w-[28%]' },
  { key: 'customer', label: '客户', className: 'w-[14%]' },
  { key: 'created', label: '创建日期', className: 'w-[11%]' },
  { key: 'location', label: '位置', className: 'w-[12%]' },
  { key: 'status', label: '状态', className: 'w-[14%]' },
  { key: 'tags', label: '标签', className: 'w-[12%]' },
  { key: 'managers', label: '负责人', className: 'w-[9%]' },
];

function ProjectTable({ projects }: { projects: Project[] }) {
  const router = useRouter();

  if (projects.length === 0) return null;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-2xs">
          <thead>
            <tr className="border-b border-border text-text-subtle text-left">
              {TABLE_COLS.map(col => (
                <th key={col.key} className={`py-2 px-2 font-medium ${col.className}`}>
                  {col.label}
                </th>
              ))}
              <th className="py-2 px-2 w-[40px]" />
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const status = resolveProjectStatus(p);
              const statusMeta = STATUS_META[status];
              const customer = p.customerId ? getCustomer(p.customerId) : null;
              const hasCustomer = !!p.customerId;
              return (
                <tr
                  key={p.id}
                  onClick={() => router.push(proProjectOverviewHref(p.id))}
                  className="border-b border-border/50 hover:bg-accent/[0.03] cursor-pointer transition"
                >
                  {/* Name */}
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded flex-shrink-0" style={{ background: p.thumbnailGradient }} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text truncate">{p.title}</p>
                        <p className="text-[10px] text-text-muted truncate">{p.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  {/* Customer */}
                  <td className="py-2.5 px-2">
                    {hasCustomer ? (
                      <span className="text-xs text-text">{p.customerName || customer?.name || '—'}</span>
                    ) : (
                      <span className="text-[10px] text-text-subtle inline-flex items-center gap-1">
                        <Sparkles size={9} className="text-accent-glow" /> 待关联
                      </span>
                    )}
                  </td>
                  {/* Created */}
                  <td className="py-2.5 px-2 text-text-muted">{p.createdAt}</td>
                  {/* Location */}
                  <td className="py-2.5 px-2 text-text-muted">
                    {p.city || (hasCustomer ? '—' : '—')}
                  </td>
                  {/* Status */}
                  <td className="py-2.5 px-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
                      style={{ background: `${statusMeta.color}15`, color: statusMeta.color, border: `1px solid ${statusMeta.color}30` }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: statusMeta.color }} />
                      {statusMeta.label}
                    </span>
                  </td>
                  {/* Tags */}
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      {(p.tags || (customer ? [TAG_LABEL[customer.tag]] : [])).slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-1 py-0.5 rounded text-[9px] border"
                          style={{
                            background: `${Object.values(TAG_COLOR)[i % Object.keys(TAG_COLOR).length]}10`,
                            borderColor: `${Object.values(TAG_COLOR)[i % Object.keys(TAG_COLOR).length]}30`,
                            color: Object.values(TAG_COLOR)[i % Object.keys(TAG_COLOR).length],
                          }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  {/* Managers */}
                  <td className="py-2.5 px-2 text-text-muted">
                    {(p.managers?.length ?? 0) > 0 ? p.managers!.join(', ') : '—'}
                  </td>
                  {/* Delete */}
                  <td className="py-2.5 px-1 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`删除「${p.title}」？此操作不可撤销。`)) {
                          deleteProject(p.id);
                        }
                      }}
                      className="p-1 rounded text-text-subtle hover:text-red-400 hover:bg-red-500/10 transition"
                      title="删除"
                    >
                      <Trash2 size={10} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {projects.map(p => {
          const status = resolveProjectStatus(p);
          const statusMeta = STATUS_META[status];
          const customer = p.customerId ? getCustomer(p.customerId) : null;
          const hasCustomer = !!p.customerId;
          return (
            <button
              key={p.id}
              onClick={() => router.push(proProjectOverviewHref(p.id))}
              className="w-full card p-3 text-left hover:border-accent/30 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded flex-shrink-0" style={{ background: p.thumbnailGradient }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text truncate">{p.title}</p>
                  <p className="text-[10px] text-text-muted truncate">{p.subtitle}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px]"
                  style={{ background: `${statusMeta.color}15`, color: statusMeta.color, border: `1px solid ${statusMeta.color}30` }}>
                  {statusMeta.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`删除「${p.title}」？此操作不可撤销。`)) {
                      deleteProject(p.id);
                    }
                  }}
                  className="p-1 rounded text-text-subtle hover:text-red-400 hover:bg-red-500/10 transition flex-shrink-0"
                  title="删除"
                >
                  <Trash2 size={10} />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-text-muted">
                {hasCustomer ? (
                  <span className="flex items-center gap-1"><Users size={9} /> {p.customerName || customer?.name}</span>
                ) : (
                  <span className="text-text-subtle inline-flex items-center gap-1"><Sparkles size={9} className="text-accent-glow" /> 待关联</span>
                )}
                {p.city && <span className="flex items-center gap-1"><MapPin size={9} /> {p.city}</span>}
                <span className="flex items-center gap-1"><CalendarDays size={9} /> {p.createdAt}</span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Status Track ──────────────────────────────────────────────────────

function StatusTrack({ currentStatus }: { currentStatus: ProjectStatus }) {
  return (
    <div className="flex items-center gap-1">
      {STATUS_ORDER.map(s => {
        const meta = STATUS_META[s];
        const currentIdx = STATUS_ORDER.indexOf(currentStatus);
        const idx = STATUS_ORDER.indexOf(s);
        const reached = idx <= currentIdx;
        return (
          <div key={s} className="h-1 flex-1 rounded-full transition"
            style={{
              background: reached ? meta.color : undefined,
              opacity: s === currentStatus ? 1 : reached ? 0.45 : 0.15,
            }}
            title={`${meta.label}`}
          />
        );
      })}
    </div>
  );
}

// ─── New Project Modal ────────────────────────────────────────────────

type BuildingType = 'apartment' | 'villa' | 'office' | 'store';

const BUILDING_TYPES: { id: BuildingType; label: string; icon: any; emoji: string }[] = [
  { id: 'apartment', label: '公寓', icon: Building2, emoji: '🏢' },
  { id: 'villa',     label: '别墅', icon: Home,      emoji: '🏡' },
  { id: 'office',    label: '办公', icon: Briefcase, emoji: '💼' },
  { id: 'store',     label: '商铺', icon: Store,     emoji: '🏪' },
];

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [buildingType, setBuildingType] = useState<BuildingType>('apartment');
  const [customerId, setCustomerId] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [linkedSolutionId, setLinkedSolutionId] = useState('');
  const [step, setStep] = useState<'form' | 'creating'>('form');

  const allProjects = useMemo(() => getAllProjects(), []);
  const solutions = useMemo(() => allProjects.filter(p => !p.customerId && p.visibility !== 'verified' && (!p.buildMode || p.buildMode === 'architect')), [allProjects]);

  const canSubmit = name.trim().length >= 2;

  const handleCreate = () => {
    setStep('creating');
    const linked = linkedSolutionId ? solutions.find(s => s.id === linkedSolutionId) : null;
    const project = createCubixProject(name.trim() || '新建项目');
    project.buildingType = buildingType;
    if (linked) {
      project.linkedSolutionId = linked.id;
      project.linkedSolutionName = linked.title;
    }
    if (customerId) {
      project.customerId = customerId;
      const selectedCustomer = MyCustomers.find(c => c.id === customerId);
      project.customerName = selectedCustomer?.name || customerNameInput.trim();
      project.origin = 'pro-console';
      project.solutionStatus = 'finalized';
      project.projectStatus = 'open';
    } else if (customerNameInput.trim()) {
      project.customerName = customerNameInput.trim();
    }
    saveCubixLocalProject(project);
    setTimeout(() => {
      onClose();
      router.push(proProjectOverviewHref(project.id));
    }, 600);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[440px] rounded-xl border border-border bg-bg-elevated shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
              <Briefcase size={16} className="text-accent-glow" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold">新建 Project Passport</h2>
              <p className="text-2xs text-text-muted">
                从客户 Brief 或方案草稿开始，后续统一承载设计、报价、实施、验收与账本
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5 text-text-muted"><X size={15} /></button>
          </div>

          {step === 'form' && (
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-text mb-1.5 block">项目名称 <span className="text-warning">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="例如：陈女士全屋智能交付"
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-bg border border-border focus:border-accent/50 outline-none transition" autoFocus />
              </div>

              <div>
                <label className="text-xs font-medium text-text mb-1.5 block">建筑类型</label>
                <div className="grid grid-cols-4 gap-2">
                  {BUILDING_TYPES.map(b => {
                    const active = buildingType === b.id;
                    return (
                      <button key={b.id} onClick={() => setBuildingType(b.id)} type="button"
                        className={cn(
                          'flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border transition text-center',
                          active
                            ? 'border-accent/60 bg-accent/10'
                            : 'border-border bg-bg hover:border-border-strong'
                        )}>
                        <span className="text-lg leading-none">{b.emoji}</span>
                        <span className={cn('text-2xs', active ? 'text-accent-glow font-medium' : 'text-text-muted')}>
                          {b.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {solutions.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-text mb-1.5 block">关联已有方案 <span className="text-text-subtle font-normal">(可选)</span></label>
                  <select
                    value={linkedSolutionId}
                    onChange={e => setLinkedSolutionId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-bg border border-border focus:border-accent/50 outline-none transition text-text-muted"
                  >
                    <option value="">不关联（创建空白项目）</option>
                    {solutions.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-2xs text-text-subtle">关联后 Passport 会继承方案的 SpaceModel、设备清单和 Persona 数据</p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-text mb-1.5 block">客户 / Brief <span className="text-text-subtle font-normal">(可选)</span></label>
                <select
                  value={customerId}
                  onChange={e => {
                    setCustomerId(e.target.value);
                    if (e.target.value) {
                      const c = MyCustomers.find(x => x.id === e.target.value);
                      if (c) setCustomerNameInput(c.name);
                    }
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-bg border border-border focus:border-accent/50 outline-none transition text-text-muted mb-2"
                >
                  <option value="">手动输入或选择已有客户...</option>
                  {MyCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.city} · {c.tag}</option>
                  ))}
                </select>
                <input
                  value={customerNameInput}
                  onChange={e => {
                    setCustomerNameInput(e.target.value);
                    if (customerId && !MyCustomers.find(c => c.name === e.target.value)) {
                      setCustomerId('');
                    }
                  }}
                  placeholder="或直接输入新客户姓名，稍后补全 Brief、预算和授权信息"
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-bg border border-border focus:border-accent/50 outline-none transition"
                />
              </div>

              {solutions.length === 0 && (
                <div className="px-3 py-2.5 rounded-lg bg-accent/[0.03] border border-accent/20 text-2xs text-text-muted flex items-start gap-2">
                  <Sparkles size={11} className="text-accent-glow mt-0.5 shrink-0" />
                  <span>
                    还没有方案？先在 <Link href="/build?entry=pro" className="text-accent-glow hover:underline">Design Platform</Link> 中创作方案，
                    或直接创建空白项目。
                  </span>
                </div>
              )}
            </div>
          )}

          {step === 'creating' && (
            <div className="px-5 py-16 flex flex-col items-center gap-4">
              <div className="w-11 h-11 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <p className="text-sm text-text-muted">正在创建…</p>
            </div>
          )}

          <div className="flex items-center gap-2 px-5 py-3.5 border-t border-border bg-bg/80">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:text-text transition">取消</button>
            <div className="flex-1" />
            {step === 'form' && (
              <button disabled={!canSubmit} onClick={handleCreate}
                className={cn('px-5 py-2 rounded-lg text-sm font-medium transition',
                  canSubmit ? 'bg-gradient-to-br from-accent to-accent2 text-white' : 'bg-white/5 text-text-subtle cursor-not-allowed')}>
                创建项目
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
