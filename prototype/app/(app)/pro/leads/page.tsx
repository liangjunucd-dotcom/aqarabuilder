'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, MapPin, Clock, X, CheckCircle2, AlertCircle,
  FolderPlus, Lock, ShieldCheck, Plus, List, LayoutGrid,
  Search, UserPlus, MessageSquare, FileText, TrendingUp,
  ChevronDown, SlidersHorizontal, Pin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole, can } from '@/lib/role';
import { createProjectFromLead, saveCubixLocalProject } from '@/lib/mock/projects';
import {
  CARDS,
  LEAD_SOURCES,
  LEAD_STAGE_META,
  LEAD_STAGE_ORDER,
  ACTIVE_LEAD_STAGES,
  INACTIVE_LEAD_STAGES,
  resolveLeadStage,
  type Lead,
  type LeadStage,
} from '@/lib/mock/leads';

// ─── Locked View ──────────────────────────────────────────────────────

function LockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-xl card p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
          <Lock size={22} className="text-amber-400" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Leads</h1>
        <p className="text-2xs text-text-muted leading-relaxed mb-6">
          Leads 线索池为<b className="text-amber-400">Aqara Certified Professional 专属</b>能力。认证后自动接收询单，按 SLA 分发，Won 后一键转项目。
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link href="/pro/projects" className="px-3 py-2 text-2xs rounded-md border border-border hover:border-border-strong text-text-muted">返回项目</Link>
          <Link href="/pro/academy?tab=verify" className="px-3 py-2 text-2xs rounded-md bg-gradient-to-br from-amber-500 to-orange-500 text-white inline-flex items-center gap-1.5 shadow-lg">
            <ShieldCheck size={11} /> 申请 Aqara Certified 认证
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'blue' | 'amber' | 'green' | 'violet';
}) {
  const toneClass = {
    default: 'border-border bg-bg-elevated text-text-muted',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-600',
    amber: 'border-amber-500/25 bg-amber-500/10 text-amber-600',
    green: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600',
    violet: 'border-violet-500/25 bg-violet-500/10 text-violet-600',
  }[tone];

  return (
    <span className={cn('inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs', toneClass)}>
      <span>{label}</span>
      <span className="font-semibold num">{value}</span>
    </span>
  );
}

// ─── Add Lead Modal ───────────────────────────────────────────────────

function AddLeadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (lead: Lead) => void }) {
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [city, setCity] = useState('');
  const [size, setSize] = useState('');
  const [budget, setBudget] = useState('');
  const [desc, setDesc] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const canSubmit = name.trim().length >= 1 && source.length > 0;

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); setTagInput(''); }
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const handleSubmit = () => {
    if (!canSubmit) return;
    const card: Lead = {
      id: `L-${Date.now()}`,
      customer: name.trim(),
      city: city.trim() || '待确认',
      size: size.trim() || '待确认',
      budget: budget.trim() || '待确认',
      source: source,
      desc: desc.trim() || '待补充需求描述',
      postedAt: '刚刚',
      status: 'new',
      stage: 'new',
      tags,
      responseHours: 0,
      responseSla: 24,
    };
    onAdd(card);
    onClose();
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg rounded-xl border border-border bg-bg-elevated shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <UserPlus size={15} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">添加线索</div>
              <div className="text-2xs text-text-muted mt-0.5">手动录入来自线下/电话的咨询线索</div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5 text-text-muted"><X size={15} /></button>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <label className="text-2xs text-text-muted mb-1 block">客户姓名 <span className="text-warning">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="例如：陈女士" autoFocus
                className="w-full px-3 py-2 rounded-md border border-border bg-bg text-sm" />
            </div>
            <div>
              <label className="text-2xs text-text-muted mb-1 block">线索来源 <span className="text-warning">*</span></label>
              <select value={source} onChange={e => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-bg text-sm text-text-muted">
                <option value="">选择来源...</option>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs text-text-muted mb-1 block">所在地</label>
                <input value={city} onChange={e => setCity(e.target.value)}
                  placeholder="例如：上海·浦东" className="w-full px-3 py-2 rounded-md border border-border bg-bg text-sm" />
              </div>
              <div>
                <label className="text-2xs text-text-muted mb-1 block">户型面积</label>
                <input value={size} onChange={e => setSize(e.target.value)}
                  placeholder="例如：120m² 三室" className="w-full px-3 py-2 rounded-md border border-border bg-bg text-sm" />
              </div>
            </div>
            <div>
              <label className="text-2xs text-text-muted mb-1 block">预算范围</label>
              <input value={budget} onChange={e => setBudget(e.target.value)}
                placeholder="例如：¥50k–¥80k" className="w-full px-3 py-2 rounded-md border border-border bg-bg text-sm" />
            </div>
            <div>
              <label className="text-2xs text-text-muted mb-1 block">需求描述</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                placeholder="简述客户需求..."
                className="w-full px-3 py-2 rounded-md border border-border bg-bg text-sm resize-none" />
            </div>
            <div>
              <label className="text-2xs text-text-muted mb-1 block">标签</label>
              <div className="flex items-center gap-1.5">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="输入标签后回车" className="flex-1 px-3 py-2 rounded-md border border-border bg-bg text-sm" />
                <button onClick={addTag} className="px-3 py-2 rounded-md border border-border text-xs text-text-muted hover:text-text">添加</button>
              </div>
              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {tags.map(t => (
                    <span key={t} className="text-2xs px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent-glow inline-flex items-center gap-1">
                      {t} <button onClick={() => removeTag(t)}><X size={9} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-bg-elevated/30">
            <button onClick={onClose} className="px-3 py-1.5 rounded-md border border-border text-2xs text-text-muted hover:text-text">取消</button>
            <button onClick={handleSubmit} disabled={!canSubmit}
              className={cn('px-4 py-1.5 rounded-md text-2xs font-medium inline-flex items-center gap-1.5',
                canSubmit ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white' : 'bg-white/5 text-text-subtle cursor-not-allowed')}>
              <Plus size={11} /> 添加线索
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Won → Project Modal ──────────────────────────────────────────────

function WonToProjectModal({ card, onClose, onCreated }: {
  card: Lead; onClose: () => void; onCreated: (projectId: string) => void;
}) {
  const [step, setStep] = useState<'confirm' | 'creating' | 'done'>('confirm');
  const [projectName, setProjectName] = useState(`${card.customer} · ${card.size.split(' ')[0]} 项目`);
  const [country, setCountry] = useState(card.city.includes('München') ? 'de' : 'cn');
  const [createdId, setCreatedId] = useState('');

  const handleCreate = () => {
    setStep('creating');
    const project = createProjectFromLead(card);
    if (projectName.trim()) {
      project.title = projectName.trim();
      saveCubixLocalProject(project);
    }
    // Transfer enriched data
    if (card.notes) project.notes = card.notes;
    if (card.tasks) project.tasks = card.tasks;
    if (card.files) project.files = card.files;
    if (card.floorPlans) project.floorPlans = card.floorPlans;
    saveCubixLocalProject(project);
    setCreatedId(project.id);
    setTimeout(() => {
      setStep('done');
      setTimeout(() => onCreated(project.id), 600);
    }, 800);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg rounded-xl border border-border bg-bg-elevated shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={15} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">Won · 创建交付项目</div>
              <div className="text-2xs text-text-muted mt-0.5">将自动创建项目，进入方案设计阶段</div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5 text-text-muted"><X size={15} /></button>
          </div>

          {step === 'confirm' && (
            <>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="text-2xs text-text-muted">项目名称</label>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-bg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-2xs text-text-muted">客户</label>
                    <div className="mt-1 px-3 py-2 rounded-md border border-border bg-bg-elevated text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-accent/30 to-accent2/30 inline-flex items-center justify-center text-[10px] font-medium">{card.customer[0]}</span>
                      {card.customer}
                    </div>
                  </div>
                  <div>
                    <label className="text-2xs text-text-muted">报价金额</label>
                    <div className="mt-1 px-3 py-2 rounded-md border border-border bg-bg-elevated text-sm num">{card.budget}</div>
                  </div>
                </div>
                <div>
                  <label className="text-2xs text-text-muted">项目所在地</label>
                  <select value={country} onChange={e => setCountry(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-bg text-sm">
                    <option value="cn">🇨🇳 中国大陆 · 中国服务器</option>
                    <option value="us">🇺🇸 美国 · 美国服务器</option>
                    <option value="de">🇩🇪 德国 · 欧洲服务器</option>
                    <option value="kr">🇰🇷 韩国 · 韩国服务器</option>
                    <option value="sg">🇸🇬 新加坡 · 新加坡服务器</option>
                  </select>
                </div>
                <div className="rounded-md border border-accent/30 bg-accent/[0.06] px-3 py-2.5 text-2xs text-text-muted leading-snug">
                  创建后项目进入「方案设计中」阶段，可直接跳转 Design Platform 开始点位设计与方案配置。
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-bg-elevated/30">
                <button onClick={onClose} className="px-3 py-1.5 rounded-md border border-border text-2xs text-text-muted hover:text-text">取消</button>
                <button onClick={handleCreate} className="px-4 py-1.5 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-2xs font-medium inline-flex items-center gap-1.5">
                  <FolderPlus size={11} /> 创建项目
                </button>
              </div>
            </>
          )}

          {step === 'creating' && (
            <div className="px-5 py-12 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <div className="text-2xs text-text-muted">创建中 · 写入 Order Hash · 写入 Timeline ...</div>
            </div>
          )}

          {step === 'done' && (
            <>
              <div className="px-5 py-7 flex flex-col items-center gap-3 text-center">
                <CheckCircle2 size={42} className="text-emerald-400" />
                <div>
                  <div className="text-base font-semibold">项目已创建</div>
                  <div className="text-2xs text-text-muted mt-1">「{projectName}」已进入方案设计阶段</div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-bg-elevated/30">
                <button onClick={() => onCreated(createdId)}
                  className="px-4 py-1.5 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-2xs font-medium inline-flex items-center gap-1.5">
                  进入项目 <ArrowRight size={11} />
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────

type DirectoryStage =
  | 'all_active'
  | 'new'
  | 'contacted'
  | 'followed_up'
  | 'connected'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'estimate_signed_not_paid'
  | 'won'
  | 'snoozed'
  | 'archived';

type LeadDirectoryRow = Lead & {
  baseLeadId: string;
  directoryStage: Exclude<DirectoryStage, 'all_active'>;
  taskTitle: string;
  dueLabel: string;
  projectType: string;
  manager: string;
  messages: 'all' | 'unread' | 'read';
};

const STAGE_TARGET_COUNTS: Record<Exclude<DirectoryStage, 'all_active'>, number> = {
  new: 16,
  contacted: 15,
  followed_up: 5,
  connected: 4,
  meeting_scheduled: 0,
  proposal_sent: 1,
  estimate_signed_not_paid: 0,
  won: 6,
  snoozed: 0,
  archived: 18,
};

const ACTIVE_DIRECTORY_STAGES: Exclude<DirectoryStage, 'all_active'>[] = [
  'new',
  'contacted',
  'followed_up',
  'connected',
  'meeting_scheduled',
  'proposal_sent',
  'estimate_signed_not_paid',
  'won',
];

const INACTIVE_DIRECTORY_STAGES: Exclude<DirectoryStage, 'all_active'>[] = ['snoozed', 'archived'];

const DIRECTORY_STAGE_LABEL: Record<DirectoryStage, string> = {
  all_active: 'All Active Leads',
  new: 'New',
  contacted: 'Contacted',
  followed_up: 'Followed Up',
  connected: 'Connected',
  meeting_scheduled: 'Meeting Scheduled',
  proposal_sent: 'Proposal Sent',
  estimate_signed_not_paid: 'Estimate signed not paid',
  won: 'Won',
  snoozed: 'Snoozed',
  archived: 'Archived',
};

const LEAD_NAMES = [
  'Andréa Blanc du Collet sent a Direct Message',
  'Garage Conversion - Sophie Kim',
  'Window Replacement - Mark Davis',
  'Kitchen Expansion - Jane Wilson',
  'Roof Replacement - Adam Turner',
  'Basement Finish - Michael Lee',
  'Attic Conversion - Emily Clark',
  'Home Extension - David Brown',
  'Living Room Update - Lisa Chen',
  'Bathroom Revamp - John Carter',
  'Kitchen Overhaul - Sarah Miller',
  'Villa Garden Lighting - A. Schmidt',
  'Aging Care Upgrade - Chen Family',
  'Smart Apartment - Li Residence',
  'Rental Retrofit - Wu Residence',
  'HomeKit Integration - Huang Residence',
];

const PROJECT_TYPES = ['Residential', 'Garage Remodel', 'Window Upgrade', 'Kitchen Remodel', 'Roof Renovation', 'Basement Remodel', 'Attic Renovation', 'Home Addition', 'Living Room Remodel'];
const MANAGERS = ['Jun', 'Katie Congress', 'A. Chen', 'Bo Li'];

function stageToLeadStage(stage: LeadDirectoryRow['directoryStage']): LeadStage {
  if (stage === 'new') return 'new';
  if (stage === 'contacted' || stage === 'connected') return 'connected';
  if (stage === 'followed_up') return 'follow_up';
  if (stage === 'meeting_scheduled') return 'meeting_scheduled';
  if (stage === 'proposal_sent' || stage === 'estimate_signed_not_paid') return 'estimate_sent';
  if (stage === 'won') return 'won';
  return 'lost';
}

function buildLeadDirectoryRows(seed: Lead[]): LeadDirectoryRow[] {
  const rows: LeadDirectoryRow[] = [];
  let cursor = 0;

  (Object.keys(STAGE_TARGET_COUNTS) as LeadDirectoryRow['directoryStage'][]).forEach(stage => {
    const count = STAGE_TARGET_COUNTS[stage];
    for (let i = 0; i < count; i += 1) {
      const sourceLead = seed[cursor % seed.length];
      const leadStage = stageToLeadStage(stage);
      const projectType = PROJECT_TYPES[cursor % PROJECT_TYPES.length];
      const name = LEAD_NAMES[cursor % LEAD_NAMES.length];
      const isUnread = cursor % 5 === 0 || stage === 'new';
      rows.push({
        ...sourceLead,
        baseLeadId: sourceLead.id,
        id: `${sourceLead.id}-${stage}-${i}`,
        customer: name,
        stage: leadStage,
        status: leadStage === 'won' ? 'won' : leadStage === 'lost' ? 'lost' : leadStage === 'estimate_sent' ? 'quoted' : 'contacted',
        postedAt: cursor < 8 ? `${cursor + 1} hours ago` : `${(cursor % 9) + 1} days ago`,
        source: sourceLead.source,
        tags: projectType === 'Residential' ? ['Residential'] : cursor % 3 === 0 ? ['Residential', projectType.split(' ')[0]] : [],
        directoryStage: stage,
        taskTitle: cursor % 4 === 0 ? 'Send a proposal' : cursor % 4 === 1 ? 'Add New Task' : cursor % 4 === 2 ? 'Send out estimate' : 'Add New Task',
        dueLabel: cursor % 6 === 2 ? 'Overdue' : cursor % 4 === 0 ? 'Due by Nov 15' : '',
        projectType,
        manager: MANAGERS[cursor % MANAGERS.length],
        messages: isUnread ? 'unread' : 'read',
      });
      cursor += 1;
    }
  });

  return rows;
}

export default function LeadsPage() {
  const router = useRouter();
  const { role, mounted } = useRole();
  const effectiveRole = mounted ? role : 'verified';
  const canLead = can(effectiveRole, 'pro.leads.receive');

  const [selectedStage, setSelectedStage] = useState<DirectoryStage>('all_active');
  const [search, setSearch] = useState('');
  const [projectType, setProjectType] = useState('all');
  const [source, setSource] = useState('all');
  const [manager, setManager] = useState('all');
  const [messageFilter, setMessageFilter] = useState('all');
  const [leads, setLeads] = useState<Lead[]>(CARDS);
  const [showAddLead, setShowAddLead] = useState(false);
  const [wonCard, setWonCard] = useState<Lead | null>(null);

  const directoryRows = useMemo(() => buildLeadDirectoryRows(leads), [leads]);

  const stageCounts = useMemo(() => {
    const result: Record<DirectoryStage, number> = {
      all_active: 0,
      new: 0,
      contacted: 0,
      followed_up: 0,
      connected: 0,
      meeting_scheduled: 0,
      proposal_sent: 0,
      estimate_signed_not_paid: 0,
      won: 0,
      snoozed: 0,
      archived: 0,
    };
    for (const row of directoryRows) {
      result[row.directoryStage] += 1;
      if (ACTIVE_DIRECTORY_STAGES.includes(row.directoryStage)) result.all_active += 1;
    }
    return result;
  }, [directoryRows]);

  const filtered = useMemo(() => {
    let result = directoryRows;
    if (selectedStage === 'all_active') {
      result = result.filter(row => ACTIVE_DIRECTORY_STAGES.includes(row.directoryStage));
    } else {
      result = result.filter(row => row.directoryStage === selectedStage);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(row => row.customer.toLowerCase().includes(q) || row.source.toLowerCase().includes(q) || row.projectType.toLowerCase().includes(q));
    }
    if (projectType !== 'all') result = result.filter(row => row.projectType === projectType);
    if (source !== 'all') result = result.filter(row => row.source === source);
    if (manager !== 'all') result = result.filter(row => row.manager === manager);
    if (messageFilter !== 'all') result = result.filter(row => row.messages === messageFilter);
    return result;
  }, [directoryRows, manager, messageFilter, projectType, search, selectedStage, source]);

  const sourceOptions = useMemo(() => Array.from(new Set(directoryRows.map(row => row.source))), [directoryRows]);
  const projectTypeOptions = useMemo(() => Array.from(new Set(directoryRows.map(row => row.projectType))), [directoryRows]);
  const managerOptions = useMemo(() => Array.from(new Set(directoryRows.map(row => row.manager))), [directoryRows]);

  if (!canLead) return <LockedPage />;

  return (
    <div className="grid h-screen grid-cols-[216px_minmax(0,1fr)] overflow-hidden bg-white text-[#202020]">
      <LeadStageSidebar
        selected={selectedStage}
        counts={stageCounts}
        onSelect={setSelectedStage}
      />

      <main className="flex min-w-0 flex-col overflow-hidden">
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#e8e5df] bg-white px-5">
          <h1 className="text-lg font-semibold">{selectedStage === 'all_active' ? 'Active Leads' : DIRECTORY_STAGE_LABEL[selectedStage]}</h1>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-1 rounded px-2 text-sm font-semibold text-[#333]">
              Actions <ChevronDown size={15} />
            </button>
            <Link href="/pro/company?tab=forms" className="inline-flex h-9 items-center gap-1.5 rounded border border-[#242424] bg-white px-3 text-sm font-semibold">
              ✨ Contact Form
            </Link>
            <Link href="/pro/leads?view=insights" className="inline-flex h-9 items-center gap-1.5 rounded border border-[#242424] bg-white px-3 text-sm font-semibold">
              ✨ Insights
            </Link>
            <button onClick={() => setShowAddLead(true)} className="inline-flex h-9 items-center gap-1 rounded bg-[#202020] px-3 text-sm font-semibold text-white">
              Add Leads <ChevronDown size={15} />
            </button>
          </div>
        </header>

        <div className="flex h-12 shrink-0 items-end border-b border-[#e8e5df] bg-white px-5">
          {['Main View', 'My New View', 'Residential', 'My New View'].map((view, index) => (
            <button
              key={`${view}-${index}`}
              className={cn(
                'mr-7 h-12 border-b-2 text-sm font-medium',
                index === 0 ? 'border-[#202020] text-[#202020]' : 'border-transparent text-[#666] hover:text-[#202020]',
              )}
            >
              {view}
            </button>
          ))}
          <button className="mb-3 text-[#777]"><Plus size={18} /></button>
        </div>

        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#e8e5df] bg-white px-5">
          <label className="flex h-10 w-48 items-center gap-2 rounded border border-[#e8e5df] px-3 text-sm text-[#888]">
            <Search size={17} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent outline-none" />
          </label>
          <FilterSelect value={projectType} onChange={setProjectType} label="All Project Types" options={projectTypeOptions} />
          <FilterSelect value={source} onChange={setSource} label="All Lead Sources" options={sourceOptions} />
          <FilterSelect value="all" onChange={() => undefined} label="Tags" options={['Residential', 'House', 'Kitchen remodel']} />
          <FilterSelect value={manager} onChange={setManager} label="All Managers" options={managerOptions} />
          <FilterSelect value={messageFilter} onChange={setMessageFilter} label="All Messages" options={['unread', 'read']} labels={{ unread: 'Unread', read: 'Read' }} />
          <button className="ml-auto flex h-10 w-10 items-center justify-center rounded border border-[#e8e5df] text-[#333]">
            <SlidersHorizontal size={17} />
          </button>
        </div>

        <LeadDirectoryTable rows={filtered} onWon={setWonCard} />

        {/* Modals */}
        <AnimatePresence>
          {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} onAdd={l => setLeads(prev => [l, ...prev])} />}
          {wonCard && (
            <WonToProjectModal card={wonCard} onClose={() => setWonCard(null)}
              onCreated={(projectId) => { setWonCard(null); router.push(`/pro/projects/${projectId}/overview`); }} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function LeadStageSidebar({
  selected,
  counts,
  onSelect,
}: {
  selected: DirectoryStage;
  counts: Record<DirectoryStage, number>;
  onSelect: (stage: DirectoryStage) => void;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-[#e8e5df] bg-white">
      <div className="flex h-16 items-center px-5">
        <h2 className="text-base font-semibold">Leads</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
        <StageGroup title="Active Leads">
          {(['all_active', ...ACTIVE_DIRECTORY_STAGES] as DirectoryStage[]).map(stage => (
            <StageButton key={stage} stage={stage} selected={selected === stage} count={counts[stage]} onClick={() => onSelect(stage)} />
          ))}
        </StageGroup>
        <StageGroup title="Inactive Leads">
          {INACTIVE_DIRECTORY_STAGES.map(stage => (
            <StageButton key={stage} stage={stage} selected={selected === stage} count={counts[stage]} onClick={() => onSelect(stage)} />
          ))}
        </StageGroup>
        <StageGroup title="Imported Leads">
          <button className="flex h-9 w-full items-center justify-between rounded px-2 text-left text-sm font-medium text-[#666] hover:bg-[#f6f4f0]">
            Lead Import History
          </button>
        </StageGroup>
      </div>
      <Link href="/pro/company?tab=integrations" className="flex h-12 items-center gap-2 border-t border-[#e8e5df] px-5 text-sm font-semibold text-[#555]">
        <span className="font-bold text-red-500">M</span>
        Get Builder Pro for Gmail
      </Link>
    </aside>
  );
}

function StageGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <div className="mb-1 flex items-center justify-between text-sm font-semibold text-[#777]">
        <span>{title}</span>
        <ChevronDown size={15} />
      </div>
      <div className="space-y-0.5 border-l border-[#eeeae5] pl-2">{children}</div>
    </section>
  );
}

function StageButton({
  stage,
  count,
  selected,
  onClick,
}: {
  stage: DirectoryStage;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'grid h-9 w-full grid-cols-[minmax(0,1fr)_32px] items-center rounded px-2 text-left text-sm font-semibold transition',
        selected ? 'bg-[#f1efeb] text-[#202020]' : 'text-[#666] hover:bg-[#f7f5f1] hover:text-[#202020]'
      )}
    >
      <span className="truncate">{DIRECTORY_STAGE_LABEL[stage]}</span>
      <span className="justify-self-end tabular-nums">{count}</span>
    </button>
  );
}

function FilterSelect({
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

function LeadDirectoryTable({ rows, onWon }: { rows: LeadDirectoryRow[]; onWon: (c: Lead) => void }) {
  const router = useRouter();

  if (rows.length === 0) {
    return (
      <div className="grid flex-1 place-items-center text-center">
        <div className="text-sm text-[#777]">No leads match this view</div>
      </div>
    );
  }

  return (
    <div data-leads-table-scroller className="min-h-0 flex-1 overflow-auto bg-white">
      <table className="min-w-[1680px] w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-[#e8e5df] text-left text-xs font-semibold text-[#777]">
            <th className="sticky left-0 z-30 w-[48px] min-w-[48px] border-b border-[#e8e5df] bg-white px-4 py-3"><input type="checkbox" className="h-4 w-4 rounded border-[#ddd]" /></th>
            <th className="sticky left-[48px] z-30 w-[360px] min-w-[360px] border-b border-[#e8e5df] bg-white px-4 py-3">Lead Name ↕</th>
            <th className="sticky left-[408px] z-30 w-[240px] min-w-[240px] border-b border-[#e8e5df] bg-white px-4 py-3">Task</th>
            <th className="sticky left-[648px] z-30 w-[160px] min-w-[160px] border-b border-r-2 border-[#ddd8d0] bg-white px-4 py-3 shadow-[6px_0_10px_-10px_rgba(32,32,32,0.65)]"><Pin size={15} /></th>
            <th className="min-w-[150px] border-b border-[#e8e5df] px-4 py-3">Stage ↕</th>
            <th className="min-w-[170px] border-b border-[#e8e5df] px-4 py-3">Project Type ↕</th>
            <th className="min-w-[190px] border-b border-[#e8e5df] px-4 py-3">Tags</th>
            <th className="min-w-[140px] border-b border-[#e8e5df] px-4 py-3">Manager</th>
            <th className="min-w-[160px] border-b border-[#e8e5df] px-4 py-3">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const isWon = row.directoryStage === 'won';
            const isLost = row.directoryStage === 'archived' || row.directoryStage === 'snoozed';
            return (
              <tr
                key={row.id}
                onClick={() => router.push(`/pro/leads/${row.baseLeadId}`)}
                className="group h-16 cursor-pointer text-[#555] transition hover:bg-[#faf9f7]"
              >
                <td className="sticky left-0 z-20 border-b border-[#eeeae5] bg-white px-4 py-3 group-hover:bg-[#faf9f7]" onClick={event => event.stopPropagation()}><input type="checkbox" className="h-4 w-4 rounded border-[#ddd]" /></td>
                <td className="sticky left-[48px] z-20 border-b border-[#eeeae5] bg-white px-4 py-3 font-semibold text-[#555] group-hover:bg-[#faf9f7]">
                  <div className="line-clamp-2 max-w-[300px] leading-5">{row.customer}</div>
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
                    <span>{DIRECTORY_STAGE_LABEL[row.directoryStage]}</span>
                    <ChevronDown size={14} />
                  </button>
                </td>
                <td className="border-b border-[#eeeae5] px-4 py-3">{row.projectType}</td>
                <td className="border-b border-[#eeeae5] px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {row.tags.length > 0 ? row.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="rounded-full border border-[#e6e2dc] bg-white px-2 py-1 text-xs font-medium text-[#777]">{tag}</span>
                    )) : (
                      <button onClick={event => event.stopPropagation()} className="text-xs text-[#aaa] underline">Add tags</button>
                    )}
                  </div>
                </td>
                <td className="border-b border-[#eeeae5] px-4 py-3">{row.manager}</td>
                <td className="border-b border-[#eeeae5] px-4 py-3">{row.source}</td>
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

// ─── Legacy table / mobile cards retained for prototype fallback ───────

function LeadTable({ leads, onWon }: { leads: Lead[]; onWon: (c: Lead) => void }) {
  const router = useRouter();

  if (leads.length === 0) {
    return (
      <div className="card p-12 text-center border-dashed">
        <div className="text-2xs text-text-muted">暂无符合条件的线索</div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden lg:block card overflow-hidden">
        <table className="w-full text-2xs">
          <thead>
            <tr className="border-b border-border text-text-subtle text-left">
              <th className="py-2.5 px-4 font-medium">线索名称</th>
              <th className="py-2.5 px-4 font-medium">来源</th>
              <th className="py-2.5 px-4 font-medium">阶段</th>
              <th className="py-2.5 px-4 font-medium">创建时间</th>
              <th className="py-2.5 px-4 font-medium">预算</th>
              <th className="py-2.5 px-4 font-medium">所在地</th>
              <th className="py-2.5 px-4 font-medium">标签</th>
              <th className="py-2.5 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(c => {
              const stage = resolveLeadStage(c);
              const stageMeta = LEAD_STAGE_META[stage];
              const isWon = stage === 'won';
              const isLost = stage === 'lost';
              return (
                <tr key={c.id}
                  onClick={() => router.push(`/pro/leads/${c.id}`)}
                  className="border-b border-border/50 hover:bg-white/[0.02] cursor-pointer transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20 border border-border flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium">{c.customer[0]}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium">{c.customer}</span>
                        {c.matchScore != null && (
                          <span className="ml-1.5 text-[10px] text-accent-glow inline-flex items-center gap-0.5">
                            <Sparkles size={8} /><span className="num">{c.matchScore}%</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-muted">{c.source}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {/* Stage dots track */}
                      <div className="flex items-center gap-0.5">
                        {LEAD_STAGE_ORDER.map((s, i) => {
                          const sm = LEAD_STAGE_META[s];
                          const isActive = s === stage || (LEAD_STAGE_ORDER.indexOf(stage) >= i && !isLost);
                          const isCurrent = s === stage;
                          return (
                            <div key={s} className="relative group">
                              <div
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full transition',
                                  isLost ? 'bg-white/10' : isActive ? 'opacity-100' : 'opacity-30',
                                )}
                                style={{ background: isLost ? undefined : isActive ? sm.color : `${sm.color}60` }}
                              />
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition z-10">
                                {sm.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-2xs px-1.5 py-0.5 rounded-full border inline-flex items-center gap-1"
                        style={{ background: `${stageMeta.color}15`, borderColor: `${stageMeta.color}40`, color: stageMeta.color }}>
                        <stageMeta.icon size={9} /> {stageMeta.label}
                      </span>
                      {c.managedStage && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-text-muted border border-border/50">
                          {c.managedStage}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-muted">{c.postedAt}</td>
                  <td className="py-3 px-4 text-text-muted num">{c.budget}</td>
                  <td className="py-3 px-4 text-text-muted text-[10px] flex items-center gap-1">
                    <MapPin size={9} /> {c.city}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {c.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-border">{t}</span>
                      ))}
                      {c.tags.length > 2 && <span className="text-[9px] text-text-subtle">+{c.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      {!isWon && !isLost && (
                        <>
                          <Link
                            href={`/pro/messages?lead=${c.id}`}
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[10px] text-text-muted hover:text-text"
                          >
                            <MessageSquare size={10} /> Respond
                          </Link>
                          <button
                            onClick={() => onWon(c)}
                            className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 text-[10px] font-medium text-emerald-500"
                          >
                            <FolderPlus size={10} /> Convert
                          </button>
                        </>
                      )}
                      {isWon && (
                        <Link
                          href="/pro/projects"
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 text-[10px] text-emerald-500"
                        >
                          Project <ArrowRight size={10} />
                        </Link>
                      )}
                      {isLost && <span className="text-[10px] text-text-subtle">Archived</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-2">
        {leads.map(c => {
          const stage = resolveLeadStage(c);
          const stageMeta = LEAD_STAGE_META[stage];
          return (
            <motion.div key={c.id} initial={{ y: 4, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              onClick={() => router.push(`/pro/leads/${c.id}`)}
              className="card p-4 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20 border border-border flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium">{c.customer[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{c.customer}</span>
                    {c.matchScore != null && (
                      <span className="text-2xs text-accent-glow inline-flex items-center gap-0.5"><Sparkles size={9} /><span className="num">{c.matchScore}%</span></span>
                    )}
                    <span className="text-2xs px-1.5 py-0.5 rounded-full border" style={{ background: `${stageMeta.color}15`, borderColor: `${stageMeta.color}40`, color: stageMeta.color }}>
                      <stageMeta.icon size={9} /> {stageMeta.label}
                    </span>
                    {c.managedStage && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-text-muted border border-border/50">{c.managedStage}</span>
                    )}
                  </div>
                  <div className="text-2xs text-text-muted mt-0.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1"><MapPin size={10} />{c.city}</span>
                    <span className="num">{c.budget}</span>
                    <span>· {c.source}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {c.tags.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-border">{t}</span>)}
                  </div>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-2xs text-text-subtle ml-auto">{c.postedAt}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

// ─── Kanban View ───────────────────────────────────────────────────────

function KanbanView({ leads, onWon }: { leads: Lead[]; onWon: (c: Lead) => void }) {
  const activeLeads = leads.filter(c => ACTIVE_LEAD_STAGES.includes(resolveLeadStage(c)));
  const groups = useMemo(() => {
    const result: Record<string, Lead[]> = {};
    for (const s of ACTIVE_LEAD_STAGES) result[s] = [];
    for (const c of activeLeads) {
      const stage = resolveLeadStage(c);
      if (result[stage]) result[stage].push(c);
    }
    return result;
  }, [activeLeads]);

  const KANBAN_SUBS: Record<LeadStage, string> = {
    new: '24h 内回复，转化率最高',
    follow_up: '已发起跟进，等待客户响应',
    connected: '已建立联系，推进中',
    meeting_scheduled: '已安排会议，深入沟通需求',
    estimate_sent: '已发送报价，等待确认',
    won: '',
    lost: '',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {ACTIVE_LEAD_STAGES.map(stageKey => {
        const sm = LEAD_STAGE_META[stageKey];
        const cards = groups[stageKey] || [];
        const Icon = sm.icon;
        return (
          <div key={stageKey} className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0"
                style={{ background: `${sm.color}15`, borderColor: `${sm.color}40` }}>
                <Icon size={13} style={{ color: sm.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <span style={{ color: sm.color }}>{sm.label}</span>
                  <span className="text-2xs text-text-muted font-normal num">{cards.length}</span>
                </div>
                <div className="text-2xs text-text-muted">{KANBAN_SUBS[stageKey]}</div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {cards.length === 0 ? (
                <div className="card p-6 border-dashed text-center">
                  <div className="text-2xs text-text-muted">暂无卡片</div>
                </div>
              ) : cards.map((c, i) => (
                <KanbanCard key={c.id} card={c} index={i} onWon={() => onWon(c)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ card, index, onWon }: { card: Lead; index: number; onWon: () => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const stage = resolveLeadStage(card);
  const stageMeta = LEAD_STAGE_META[stage];
  const slaWarn = card.responseHours != null && card.responseSla != null && card.responseHours > card.responseSla * 0.8;

  return (
    <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="card p-4 hover:border-border-strong transition cursor-pointer"
      onClick={() => router.push(`/pro/leads/${card.id}`)}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/20 to-accent2/20 border border-border flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium">{card.customer[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{card.customer}</span>
            {card.matchScore != null && (
              <span className="text-2xs text-accent-glow inline-flex items-center gap-0.5"><Sparkles size={9} /><span className="num">{card.matchScore}%</span></span>
            )}
          </div>
          <div className="text-2xs text-text-muted mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1"><MapPin size={10} />{card.city}</span>
            <span className="num">{card.budget}</span>
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-2xs text-text-muted leading-snug line-clamp-2">{card.desc}</p>
      {card.tags.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          {card.tags.map(t => <span key={t} className="text-2xs px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-border">{t}</span>)}
        </div>
      )}
      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 text-2xs">
        <span className={cn('inline-flex items-center gap-1', slaWarn ? 'text-warning' : 'text-text-muted')}>
          {slaWarn ? <AlertCircle size={10} /> : <Clock size={10} />}
          {card.responseHours}h / {card.responseSla}h SLA
        </span>
        <span className="text-text-subtle">{card.postedAt}</span>
      </div>
      <div className="mt-2 flex items-center gap-2 flex-wrap"
        onClick={e => e.stopPropagation()}>
        {stage !== 'won' && stage !== 'lost' && (
          <button
            onClick={(e) => { e.stopPropagation(); onWon(); }}
            className="px-2.5 py-1.5 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-2xs font-medium inline-flex items-center gap-1.5">
            <CheckCircle2 size={11} /> Won · 转为 Project
          </button>
        )}
        {stage === 'won' && (
          <Link href={`/pro/projects/proj-eu-villa/overview`}
            onClick={e => e.stopPropagation()}
            className="px-2.5 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-2xs inline-flex items-center gap-1.5">
            查看项目 <ArrowRight size={10} />
          </Link>
        )}
        {stage === 'lost' && (
          <span className="text-2xs text-text-subtle">已归档</span>
        )}
      </div>
    </motion.div>
  );
}
