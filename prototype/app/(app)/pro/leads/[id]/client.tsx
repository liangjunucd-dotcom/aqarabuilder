'use client';

import Link from 'next/link';
import { useParams, notFound, useRouter, useSearchParams } from 'next/navigation';
import { useState, type ElementType, type ReactNode } from 'react';
import {
  Activity,
  ArrowLeft,
  Box,
  Calendar,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Filter,
  ImageIcon,
  Mail,
  MapPin,
  PenLine,
  Phone,
  Plus,
  Receipt,
} from 'lucide-react';
import {
  getLead,
  LEAD_STAGE_META,
  LEAD_STAGE_ORDER,
  resolveLeadStage,
  type Lead,
  type LeadStage,
} from '@/lib/mock/leads';
import { createProjectFromLead, saveCubixLocalProject } from '@/lib/mock/projects';
import { FloorPlansTab } from '@/components/overview/FloorPlansTab';
import { cn } from '@/lib/utils';

type LeadTabId = 'overview' | 'notes' | 'tasks' | 'floorplans' | 'schedule' | 'files' | 'proposals' | 'contracts';

const LEAD_TABS: { id: LeadTabId; label: string; icon: ElementType; count?: (lead: Lead) => number }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'notes', label: 'Notes', icon: FileText, count: lead => lead.notes?.length ?? 0 },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList, count: lead => lead.tasks?.length ?? 0 },
  { id: 'floorplans', label: '3D Floor Plans', icon: Box },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'files', label: 'Files', icon: ImageIcon },
  { id: 'proposals', label: 'Proposals', icon: Receipt },
  { id: 'contracts', label: 'Contracts', icon: FileText },
];

const QUICK_CREATE = [
  { label: 'Task', icon: ClipboardList },
  { label: 'Meeting', icon: Calendar },
  { label: 'Contract', icon: FileText },
  { label: 'Proposal', icon: Receipt },
  { label: 'Schedule', icon: Calendar },
  { label: '3D Floor Plan', icon: Box },
  { label: 'Note', icon: PenLine },
  { label: 'Call Log', icon: Phone },
  { label: 'Takeoff', icon: ClipboardList },
];

const CONFETTI = [
  ['8%', '22%', '#ef4444'], ['12%', '34%', '#f59e0b'], ['18%', '18%', '#6366f1'],
  ['25%', '28%', '#10b981'], ['32%', '16%', '#f97316'], ['42%', '31%', '#8b5cf6'],
  ['58%', '18%', '#ef4444'], ['66%', '32%', '#06b6d4'], ['74%', '16%', '#f59e0b'],
  ['82%', '28%', '#10b981'], ['90%', '20%', '#6366f1'],
] as const;

export default function LeadDetailPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id ?? '';
  const lead = getLead(id);
  const activeTab = searchParams?.get('tab') as LeadTabId | null;
  const tab = activeTab && LEAD_TABS.some(item => item.id === activeTab) ? activeTab : 'overview';
  const [inspectorOpen, setInspectorOpen] = useState(true);

  if (!lead) notFound();

  const stage = resolveLeadStage(lead);

  const handleStageChange = (newStage: LeadStage) => {
    lead.stage = newStage;
    lead.managedStage = undefined;
  };

  const handleConvertToProject = () => {
    const project = createProjectFromLead({
      customer: lead.customer,
      city: lead.city,
      budget: lead.budget,
      desc: lead.desc,
      tags: lead.tags,
    });
    project.title = `${lead.customer} · ${lead.size.split(' ')[0]} 项目`;
    project.notes = lead.notes;
    project.tasks = lead.tasks;
    project.files = lead.files;
    project.floorPlans = lead.floorPlans;
    saveCubixLocalProject(project);
    router.push(`/pro/projects/${project.id}/overview`);
  };

  return (
    <div className={cn(
      'grid h-screen overflow-hidden bg-white text-slate-950',
      inspectorOpen ? 'grid-cols-[280px_minmax(0,1fr)_340px]' : 'grid-cols-[280px_minmax(0,1fr)]'
    )}>
      <LeadObjectSidebar
        lead={lead}
        activeTab={tab}
        onConvert={handleConvertToProject}
      />

      <main className="relative min-w-0 overflow-y-auto bg-white">
        {!inspectorOpen && (
          <button
            onClick={() => setInspectorOpen(true)}
            className="fixed right-4 top-24 z-30 flex h-9 items-center gap-1 rounded border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ChevronLeft size={15} />
            Details
          </button>
        )}
        <LeadCenterHeader lead={lead} stage={stage} onStageChange={handleStageChange} />
        <LeadTaskNotice lead={lead} />
        {tab === 'overview' && <LeadTimeline lead={lead} />}
        {tab === 'notes' && <NotesPanel lead={lead} />}
        {tab === 'tasks' && <TasksPanel lead={lead} />}
        {tab === 'floorplans' && <FloorPlansPanel lead={lead} />}
        {tab === 'schedule' && <EmptyPanel icon={Calendar} title="No schedule items" />}
        {tab === 'files' && <FilesPanel lead={lead} />}
        {tab === 'proposals' && <EmptyPanel icon={Receipt} title="No proposals yet" cta="Create Proposal" />}
        {tab === 'contracts' && <EmptyPanel icon={FileText} title="No contracts yet" cta="Create Contract" />}
      </main>

      {inspectorOpen && (
        <LeadInspector
          lead={lead}
          stage={stage}
          onStageChange={handleStageChange}
          onClose={() => setInspectorOpen(false)}
        />
      )}
    </div>
  );
}

function LeadObjectSidebar({
  lead,
  activeTab,
  onConvert,
}: {
  lead: Lead;
  activeTab: LeadTabId;
  onConvert: () => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <Link href="/pro/leads" className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft size={13} /> Leads
        </Link>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-snug text-slate-950">
            {lead.customer} sent a Direct Message
          </h2>
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-950">
            <PenLine size={15} />
          </button>
        </div>
      </div>

      <nav className="border-b border-slate-200 px-5 py-4">
        {LEAD_TABS.map(item => {
          const Icon = item.icon;
          const count = item.count?.(lead);
          return (
            <Link
              key={item.id}
              href={item.id === 'overview' ? `/pro/leads/${lead.id}` : `/pro/leads/${lead.id}?tab=${item.id}`}
              className={cn(
                'flex h-10 items-center gap-3 rounded px-3 text-sm transition',
                activeTab === item.id ? 'bg-slate-100 font-medium text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              )}
            >
              <Icon size={16} />
              <span className="min-w-0 flex-1 truncate">{item.label}{count ? ` (${count})` : ''}</span>
            </Link>
          );
        })}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="text-xs font-medium text-slate-400">Quick Create</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {QUICK_CREATE.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="flex h-[72px] flex-col items-center justify-center gap-2 rounded border border-slate-200 bg-slate-50 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 p-5">
        <button
          onClick={onConvert}
          className="flex h-11 w-full items-center justify-center rounded bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Convert to Project
        </button>
      </div>
    </aside>
  );
}

function LeadCenterHeader({
  lead,
  stage,
  onStageChange,
}: {
  lead: Lead;
  stage: LeadStage;
  onStageChange: (stage: LeadStage) => void;
}) {
  const stageMeta = LEAD_STAGE_META[stage];

  return (
    <header className="sticky top-0 z-10 flex h-[68px] items-center gap-3 border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <LeadAvatar lead={lead} />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold text-slate-950">{lead.customer}</h1>
        <div className="mt-0.5 truncate text-xs text-slate-500">{lead.source} · {lead.postedAt}</div>
      </div>
      <button className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
        <Filter size={16} />
      </button>
      <button className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
        <ExternalLink size={16} />
      </button>
      <div className="relative">
        <select
          value={stage}
          onChange={event => onStageChange(event.target.value as LeadStage)}
          className="h-10 appearance-none rounded bg-slate-950 pl-4 pr-10 text-sm font-medium text-white outline-none"
        >
          {Object.entries(LEAD_STAGE_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" />
      </div>
      <div className="hidden text-xs text-slate-500 2xl:block" style={{ color: stageMeta.color }}>
        {stageMeta.label}
      </div>
    </header>
  );
}

function LeadTaskNotice({ lead }: { lead: Lead }) {
  const openTasks = (lead.tasks ?? []).filter(task => !task.done);
  const taskText = openTasks.length > 0 ? `${openTasks.length} task due this week` : 'No open tasks';

  return (
    <div className="border-b border-slate-200 px-7 py-4 text-sm text-slate-700">
      <div className="flex items-center gap-3">
        <ClipboardList size={16} className="text-slate-500" />
        <span className="font-medium">{taskText}</span>
        <Link href={`/pro/leads/${lead.id}?tab=tasks`} className="font-medium text-slate-950 underline underline-offset-2">
          See Tasks
        </Link>
      </div>
      <div className="ml-7 mt-2 text-slate-600">
        No reply has been sent yet{' '}
        <Link href="/pro/messages" className="font-medium text-slate-950 underline underline-offset-2">
          Preview and Share
        </Link>
      </div>
    </div>
  );
}

function LeadTimeline({ lead }: { lead: Lead }) {
  const stage = resolveLeadStage(lead);
  const stageMeta = LEAD_STAGE_META[stage];
  const activities = lead.activities ?? [];
  const synthetic = [
    `Lead received from ${lead.source}`,
    `You moved the Lead Stage to "${stageMeta.label}"`,
  ];

  return (
    <section className="px-8 py-8">
      <div className="relative mx-auto max-w-4xl border-b border-slate-200 pb-9 pt-7 text-center">
        {CONFETTI.map(([left, top, color], index) => (
          <span
            key={index}
            className="absolute h-1.5 w-1.5 rounded-sm"
            style={{ left, top, background: color, transform: `rotate(${index * 18}deg)` }}
          />
        ))}
        <h2 className="text-xl font-semibold text-slate-950">You've got a new lead!</h2>
      </div>

      <TimelineDivider label={lead.postedAt} />
      <LeadMessageCard lead={lead} />
      <LeadReplyComposer lead={lead} />
      <div className="mt-8 space-y-4">
        {synthetic.map((text, index) => (
          <TimelineEvent key={text} text={text} time={index === 0 ? '03:00 PM' : '12:39 PM'} />
        ))}
        {activities.map((activity, index) => (
          <TimelineEvent
            key={activity.id}
            text={activity.text}
            time={activity.timestamp}
            highlighted={index >= 1}
          />
        ))}
        <TimelineEvent text={`Proposal draft was created for ${lead.customer}`} time="12:46 PM" highlighted />
      </div>
    </section>
  );
}

function LeadMessageCard({ lead }: { lead: Lead }) {
  return (
    <div className="mx-auto flex max-w-3xl items-start gap-4">
      <LeadAvatar lead={lead} />
      <div className="min-w-0 flex-1 rounded border border-slate-200 bg-[#faf9f7] px-5 py-4 text-sm text-slate-800">
        <div className="grid gap-3">
          <MessageBlock label="Contact Name" value={lead.customer} />
          <MessageBlock label="Project Location" value={lead.city} />
          <div>
            <div className="text-xs font-semibold text-slate-700">Message</div>
            <p className="mt-1 leading-6 text-slate-700">
              {lead.desc || 'I am interested in a smart-space design and would like to learn more about your process, estimated timeline and next steps.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      <div className="mt-1 text-sm text-slate-900">{value}</div>
    </div>
  );
}

function LeadReplyComposer({ lead }: { lead: Lead }) {
  return (
    <div className="mx-auto mt-6 max-w-3xl rounded border border-slate-200 bg-white">
      <div className="flex min-h-11 items-center gap-3 border-b border-slate-200 px-4 text-sm">
        <span className="text-slate-500">To:</span>
        <span className="font-medium text-slate-900">{lead.customer}</span>
        <div className="ml-auto flex items-center gap-5 text-xs font-medium text-slate-500">
          <button className="hover:text-slate-950">Cc</button>
          <button className="inline-flex items-center gap-1 hover:text-slate-950">
            Templates <ChevronDown size={13} />
          </button>
        </div>
      </div>
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-900">
        Subject: New message from Builder Pro about {lead.customer}'s project
      </div>
      <textarea
        className="h-32 w-full resize-none px-4 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        placeholder="Write a message..."
      />
    </div>
  );
}

function TimelineDivider({ label }: { label: string }) {
  return (
    <div className="mx-auto my-8 flex max-w-4xl items-center gap-4 text-center text-xs text-slate-400">
      <span className="h-px flex-1 bg-slate-200" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function TimelineEvent({
  text,
  time,
  highlighted,
}: {
  text: string;
  time: string;
  highlighted?: boolean;
}) {
  return (
    <div className={cn(
      'mx-auto flex max-w-2xl items-center justify-center gap-2 text-center text-sm text-slate-500',
      highlighted && 'max-w-xl rounded border border-slate-200 bg-white px-4 py-3 shadow-sm'
    )}>
      {highlighted && <ClipboardList size={15} className="shrink-0 text-slate-500" />}
      <span>{text}</span>
      <span className="text-xs text-slate-400">{time}</span>
    </div>
  );
}

function LeadInspector({
  lead,
  stage,
  onStageChange,
  onClose,
}: {
  lead: Lead;
  stage: LeadStage;
  onStageChange: (stage: LeadStage) => void;
  onClose: () => void;
}) {
  const stageIndex = stage === 'lost' ? 0 : LEAD_STAGE_ORDER.indexOf(stage) + 1;
  const stageMeta = LEAD_STAGE_META[stage];

  return (
    <aside className="relative min-h-0 overflow-y-auto border-l border-slate-200 bg-white px-7 py-5">
      <button
        onClick={onClose}
        className="absolute -left-4 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-950"
        aria-label="Hide details"
      >
        <ChevronRight size={16} />
      </button>

      <ClientDetails lead={lead} />

      <InspectorSection title="Tags">
        <div className="flex flex-wrap gap-2">
          {lead.tags.length > 0 ? lead.tags.map(tag => (
            <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
              {tag}
            </span>
          )) : <button className="text-sm text-slate-500 underline">Add</button>}
        </div>
      </InspectorSection>

      <InspectorSection title="Lead Stage" collapsible>
        <div className="rounded border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>{stageMeta.label}</span>
            <span>{stageIndex} of {LEAD_STAGE_ORDER.length}</span>
          </div>
          <div className="flex gap-1">
            {LEAD_STAGE_ORDER.map(item => {
              const reached = item === stage || (stage !== 'lost' && LEAD_STAGE_ORDER.indexOf(item) < LEAD_STAGE_ORDER.indexOf(stage));
              return (
                <span key={item} className={cn('h-1.5 flex-1 rounded-full', reached ? 'bg-slate-950' : 'bg-slate-100')} />
              );
            })}
          </div>
          <select
            value={stage}
            onChange={event => onStageChange(event.target.value as LeadStage)}
            className="mt-4 h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            {Object.entries(LEAD_STAGE_META).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </select>
        </div>
      </InspectorSection>

      <InspectorSection title="Team">
        <AvatarSelect values={['J', 'K', '+']} />
      </InspectorSection>

      <InspectorSection title="Manager">
        <AvatarSelect values={['K']} />
      </InspectorSection>

      <InspectorSection title="Lead Details" collapsible>
        <DetailRow label="Lead Source" value={lead.source} />
        <EditableDetail label="Expected Start Date" />
        <EditableDetail label="Estimated Revenue" value={lead.budget} />
        <EditableDetail label="Estimated Profit" />
        <DetailRow label="Location" value={lead.city} />
        <DetailRow label="Scope" value={lead.size} />
        {lead.email && <DetailRow label="Email" value={lead.email} />}
        {lead.phone && <DetailRow label="Phone" value={lead.phone} />}
      </InspectorSection>
    </aside>
  );
}

function InspectorSection({
  title,
  children,
  collapsible,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
}) {
  return (
    <section className="border-b border-slate-200 py-6 first:pt-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {collapsible && <ChevronDown size={17} className="text-slate-500" />}
      </div>
      {children}
    </section>
  );
}

function ClientDetails({ lead }: { lead: Lead }) {
  return (
    <section className="border-b border-slate-200 pb-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Client Details</h3>
        <button className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950">
          Edit <ChevronDown size={14} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-400 text-sm font-semibold text-white">
          {lead.customer.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold text-slate-950">{lead.customer}</div>
        </div>
      </div>

      <ClientField icon={Mail} label="Email" value={maskEmail(lead.email)} />
      <ClientField icon={Phone} label="Phone Number" value={lead.phone ?? 'Not provided'} actionLabel="Call" />
      <ClientField icon={MapPin} label="Location" value={lead.city} actionLabel="Map" />
    </section>
  );
}

function ClientField({
  icon: Icon,
  label,
  value,
  actionLabel,
}: {
  icon: ElementType;
  label: string;
  value: string;
  actionLabel?: string;
}) {
  return (
    <div className="mt-5 grid grid-cols-[1fr_40px] items-center gap-3">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-600">{label}</div>
        <div className="mt-2 truncate text-sm text-slate-900">{value}</div>
      </div>
      {actionLabel ? (
        <button
          className="flex h-10 w-10 items-center justify-center rounded bg-slate-50 text-slate-700 hover:bg-slate-100"
          aria-label={actionLabel}
        >
          <Icon size={17} />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

function maskEmail(email?: string) {
  if (!email) return 'Not provided';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.charAt(0)}******@${domain}`;
}

function AvatarSelect({ values }: { values: string[] }) {
  return (
    <button className="flex h-12 w-full items-center justify-between rounded border border-slate-200 px-3 text-left">
      <div className="flex -space-x-2">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold',
              value === '+' ? 'bg-slate-50 text-slate-400' : 'bg-emerald-700 text-white'
            )}
          >
            {value}
          </span>
        ))}
      </div>
      <ChevronDown size={16} className="text-slate-500" />
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-sm text-slate-900">{value}</div>
    </div>
  );
}

function EditableDetail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="text-sm text-slate-500">{label}</div>
      <button className="mt-2 text-sm text-slate-500 underline underline-offset-2 hover:text-slate-950">
        {value ?? 'Add'}
      </button>
    </div>
  );
}

function LeadAvatar({ lead }: { lead: Lead }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
      {lead.customer.charAt(0)}
    </div>
  );
}

function NotesPanel({ lead }: { lead: Lead }) {
  const notes = lead.notes ?? [];
  return (
    <SimpleList
      empty="No notes yet"
      items={notes.map(note => ({
        id: note.id,
        title: note.text,
        meta: `${note.author} · ${note.createdAt}`,
      }))}
    />
  );
}

function TasksPanel({ lead }: { lead: Lead }) {
  const tasks = lead.tasks ?? [];
  return (
    <SimpleList
      empty="No tasks yet"
      items={tasks.map(task => ({
        id: task.id,
        title: task.title,
        meta: `${task.owner ?? 'Unassigned'} · ${task.due ?? 'No due date'}`,
        done: task.done,
      }))}
    />
  );
}

function FilesPanel({ lead }: { lead: Lead }) {
  const files = lead.files ?? [];
  return (
    <SimpleList
      empty="No files yet"
      items={files.map(file => ({
        id: file.name,
        title: file.name,
        meta: `${file.size} · ${file.uploadedAt ?? 'Uploaded'}`,
      }))}
    />
  );
}

function FloorPlansPanel({ lead }: { lead: Lead }) {
  return (
    <div className="p-8">
      <FloorPlansTab floorPlans={lead.floorPlans ?? []} projectId="" leadId={lead.id} />
    </div>
  );
}

function SimpleList({
  items,
  empty,
}: {
  items: { id: string; title: string; meta: string; done?: boolean }[];
  empty: string;
}) {
  if (items.length === 0) return <EmptyPanel icon={FileText} title={empty} />;

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl overflow-hidden rounded border border-slate-200 bg-white">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0">
            <span className={cn('h-3 w-3 rounded-full border', item.done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300')} />
            <div className="min-w-0 flex-1">
              <div className={cn('truncate text-sm text-slate-900', item.done && 'text-slate-400 line-through')}>{item.title}</div>
              <div className="mt-0.5 truncate text-xs text-slate-500">{item.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, cta }: { icon: ElementType; title: string; cta?: string }) {
  return (
    <div className="grid min-h-[360px] place-items-center p-8">
      <div className="text-center">
        <Icon size={24} className="mx-auto text-slate-400" />
        <div className="mt-3 text-sm font-medium text-slate-700">{title}</div>
        {cta && (
          <button className="mt-4 rounded bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}
