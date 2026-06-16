'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  FolderOpen,
  Package,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import {
  getAllProjects,
  resolveProjectStatus,
  type Project,
} from '@/lib/mock/projects';
import { cn, formatNumber } from '@/lib/utils';

const LEDGER_STEPS = [
  { label: 'Quote', desc: '报价与服务范围', color: '#6366f1' },
  { label: 'Deposit', desc: '订金 / 首款回填', color: '#06b6d4' },
  { label: 'Handoff', desc: '施工交接与设备清单', color: '#a855f7' },
  { label: 'Acceptance', desc: '客户验收与证据链', color: '#10b981' },
  { label: 'Post-care', desc: '维保 / 复访 / 续费', color: '#f59e0b' },
];

const SERVICE_PACKAGES = [
  {
    title: 'Remote Design Fee',
    desc: '户型建模、设备点位、Persona、部署包与报价说明。',
    binding: 'Project Passport',
    price: '按项目',
    color: '#a855f7',
  },
  {
    title: 'Installer Handoff',
    desc: '施工清单、入网顺序、现场问题回执与验收准备。',
    binding: 'Project + Installer',
    price: '按交付阶段',
    color: '#ef4444',
  },
  {
    title: 'Studio Care',
    desc: '客户授权服务窗口、健康巡检、远程诊断和复访。',
    binding: 'Customer Studio',
    price: '按月 / 年',
    color: '#10b981',
  },
  {
    title: 'Showcase Attribution',
    desc: '脱敏案例带来的咨询、成交和分佣归因。',
    binding: 'Showcase → Lead',
    price: '按归因',
    color: '#06b6d4',
  },
];

type FinancialTab = 'overview' | 'estimates' | 'contracts' | 'invoices' | 'settlements';

const FINANCIAL_TABS: { id: FinancialTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'estimates', label: 'Estimates' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'settlements', label: 'Settlements' },
];

const QUICK_CREATE = [
  { label: 'Estimate', href: '/pro/financials?tab=estimates&new=1', icon: FileText, color: '#6366f1' },
  { label: 'Contract', href: '/pro/financials?tab=contracts&new=1', icon: ShieldCheck, color: '#64748b' },
  { label: 'Invoice', href: '/pro/financials?tab=invoices&new=1', icon: Receipt, color: '#f59e0b' },
  { label: 'Payment', href: '/pro/financials?tab=invoices&record=payment', icon: CreditCard, color: '#10b981' },
  { label: 'Change Order', href: '/pro/financials?tab=estimates&type=change_order', icon: Package, color: '#a855f7' },
  { label: 'Settlement', href: '/pro/financials?tab=settlements&new=1', icon: Wallet, color: '#06b6d4' },
];

function ProEarningsPageContent() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams?.get('tab') as FinancialTab | null;
  const activeTab = FINANCIAL_TABS.some(t => t.id === requestedTab) ? requestedTab! : 'overview';
  const projects = getAllProjects().filter(p => !!p.customerId && p.visibility !== 'verified' && p.phase !== 'cancelled');
  const ledgerProjects = projects.filter(p => p.financials || p.quotedAmount);
  const pendingProjects = ledgerProjects
    .filter(p => ledgerOf(p).pendingAmount > 0)
    .sort((a, b) => ledgerOf(b).pendingAmount - ledgerOf(a).pendingAmount);
  const acceptanceProjects = projects.filter(p => p.phase === 'acceptance');
  const completedProjects = projects.filter(p => resolveProjectStatus(p) === 'done');

  const totals = ledgerProjects.reduce(
    (acc, project) => {
      const ledger = ledgerOf(project);
      acc.quoted += ledger.quotedAmount;
      acc.invoiced += ledger.invoicedAmount;
      acc.paid += ledger.paidAmount;
      acc.pending += ledger.pendingAmount;
      return acc;
    },
    { quoted: 0, invoiced: 0, paid: 0, pending: 0 },
  );

  const collectionRate = Math.round((totals.paid / Math.max(totals.quoted, 1)) * 100);
  const evidenceReady = projects.filter(project => acceptanceChecklist(project).filter(i => i.done).length >= 4).length;
  const billingReadyRate = Math.round((evidenceReady / Math.max(projects.length, 1)) * 100);
  const documents = buildFinancialDocuments(ledgerProjects).filter(doc => activeTab === 'overview' || doc.tab === activeTab);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1400px] px-8 py-8">
        <header className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-subtle">Financials</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Financials Workbench</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-text-muted hover:border-border-strong hover:text-text">
              <Download size={12} /> Export
            </button>
            <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-medium text-emerald-500 hover:bg-emerald-500/15">
              <CreditCard size={12} /> Record Payment
            </button>
            <Link href="/pro/financials?tab=estimates&new=1" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-white shadow-lg shadow-accent/20 hover:bg-accent-glow">
              <FileText size={12} /> New Estimate
            </Link>
          </div>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryTile icon={FileText} label="Quoted" value={`¥${formatNumber(totals.quoted)}`} sub={`${ledgerProjects.length} projects`} color="#6366f1" />
          <SummaryTile icon={Wallet} label="Paid" value={`¥${formatNumber(totals.paid)}`} sub={`${collectionRate}% collected`} color="#10b981" />
          <SummaryTile icon={Clock} label="To Collect" value={`¥${formatNumber(totals.pending)}`} sub={`${pendingProjects.length} open`} color="#f59e0b" />
          <SummaryTile icon={ShieldCheck} label="Billing Ready" value={`${billingReadyRate}%`} sub={`${evidenceReady}/${projects.length} projects`} color="#06b6d4" />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-elevated p-0.5">
            {FINANCIAL_TABS.map(tab => (
              <Link
                key={tab.id}
                href={tab.id === 'overview' ? '/pro/financials' : `/pro/financials?tab=${tab.id}`}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs transition',
                  activeTab === tab.id ? 'bg-accent/15 font-medium text-accent-glow' : 'text-text-muted hover:text-text'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <AlertCircle size={14} className="text-warning" />
                  Collection Queue
                </h2>
                <span className="text-2xs text-text-subtle">{pendingProjects.length} open</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {pendingProjects.length > 0 ? (
                  pendingProjects.slice(0, 4).map(project => (
                    <CollectionCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="card border-dashed p-8 text-center lg:col-span-2">
                    <CheckCircle2 size={24} className="mx-auto mb-3 text-success" />
                    <p className="text-sm font-medium">No open collections</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <FolderOpen size={14} className="text-accent-glow" />
                  Commercial Documents
                </h2>
                <Link href="/pro/projects" className="inline-flex items-center gap-1 text-2xs text-text-muted hover:text-text">
                  Projects <ArrowRight size={11} />
                </Link>
              </div>
              <FinancialDocumentsTable documents={documents} />
            </section>
          </div>

          <aside className="space-y-4">
            <QuickCreatePanel />
            <SettlementPanel projects={projects} evidenceReady={evidenceReady} />
            <ServicePackagingPanel />
          </aside>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-3">
          <BottomSignal icon={CheckCircle2} label="Acceptance Pending" value={acceptanceProjects.length} desc="尾款、验收和责任边界。" />
          <BottomSignal icon={ShieldCheck} label="Post-care Base" value={completedProjects.length} desc="维保、续费和复访基础池。" />
          <BottomSignal icon={TrendingUp} label="Future Billing" value="Ready" desc="可升级托管、分账和发票。" />
        </section>
      </main>
    </div>
  );
}

export default function ProEarningsPage() {
  return (
    <Suspense fallback={null}>
      <ProEarningsPageContent />
    </Suspense>
  );
}

function buildFinancialDocuments(projects: Project[]) {
  return projects.flatMap(project => {
    const ledger = ledgerOf(project);
    const status = resolveProjectStatus(project);
    const ready = acceptanceChecklist(project).filter(i => i.done).length;
    const docs = [
      {
        id: `${project.id}-estimate`,
        tab: 'estimates' as FinancialTab,
        type: 'Estimate',
        project,
        amount: ledger.quotedAmount,
        status: ledger.quotedAmount > 0 ? 'Sent' : 'Draft',
        due: project.updatedAt,
        tone: ledger.quotedAmount > 0 ? 'accent' : 'default',
      },
      {
        id: `${project.id}-contract`,
        tab: 'contracts' as FinancialTab,
        type: 'Contract',
        project,
        amount: ledger.invoicedAmount || ledger.quotedAmount,
        status: ledger.invoicedAmount > 0 || status !== 'open' ? 'Signed' : 'Draft',
        due: status === 'open' ? 'Awaiting' : 'Active',
        tone: ledger.invoicedAmount > 0 || status !== 'open' ? 'success' : 'default',
      },
      {
        id: `${project.id}-invoice`,
        tab: 'invoices' as FinancialTab,
        type: 'Invoice',
        project,
        amount: ledger.pendingAmount,
        status: ledger.pendingAmount > 0 ? 'Open' : 'Paid',
        due: ledger.nextInvoiceDue ?? 'On acceptance',
        tone: ledger.pendingAmount > 0 ? 'warning' : 'success',
      },
      {
        id: `${project.id}-settlement`,
        tab: 'settlements' as FinancialTab,
        type: 'Settlement',
        project,
        amount: Math.round(ledger.paidAmount * 0.18),
        status: ready >= 4 ? 'Ready' : 'Blocked',
        due: `${ready}/5 evidence`,
        tone: ready >= 4 ? 'success' : 'default',
      },
    ];
    return docs;
  });
}

type FinancialDocument = ReturnType<typeof buildFinancialDocuments>[number];

function FinancialDocumentsTable({ documents }: { documents: FinancialDocument[] }) {
  if (documents.length === 0) {
    return (
      <div className="card border-dashed p-10 text-center text-sm text-text-muted">
        No documents in this view
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1.2fr_.9fr_.75fr_.75fr_.6fr] gap-3 border-b border-border px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-text-subtle">
        <span>Document</span>
        <span>Project</span>
        <span>Status</span>
        <span>Amount</span>
        <span className="text-right">Due</span>
      </div>
      <div className="divide-y divide-border">
        {documents.slice(0, 12).map(doc => (
          <Link
            key={doc.id}
            href={`/pro/projects/${doc.project.id}/overview`}
            className="grid grid-cols-[1.2fr_.9fr_.75fr_.75fr_.6fr] items-center gap-3 px-4 py-3 text-xs transition hover:bg-bg-subtle/50"
          >
            <div className="min-w-0">
              <div className="font-medium text-text">{doc.type}</div>
              <div className="mt-0.5 truncate text-[10px] text-text-subtle">{doc.id}</div>
            </div>
            <div className="min-w-0">
              <div className="truncate text-text">{doc.project.title}</div>
              <div className="mt-0.5 truncate text-[10px] text-text-subtle">{doc.project.customerName ?? 'Client'}</div>
            </div>
            <StatusPill label={doc.status} tone={doc.tone} />
            <span className="num text-text">¥{formatNumber(doc.amount)}</span>
            <span className="truncate text-right text-text-muted">{doc.due}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  const cls =
    tone === 'success' ? 'border-success/30 bg-success/10 text-success' :
    tone === 'warning' ? 'border-warning/30 bg-warning/10 text-warning' :
    tone === 'accent' ? 'border-accent/30 bg-accent/10 text-accent-glow' :
    'border-border bg-bg text-text-muted';

  return (
    <span className={cn('inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px]', cls)}>
      {label}
    </span>
  );
}

function QuickCreatePanel() {
  return (
    <section className="rounded-xl border border-border bg-bg-elevated p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle">Create New</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {QUICK_CREATE.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-bg/60 px-2 py-2 text-center text-[10px] text-text-muted transition hover:border-border-strong hover:text-text"
            >
              <Icon size={15} style={{ color: item.color }} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SettlementPanel({ projects, evidenceReady }: { projects: Project[]; evidenceReady: number }) {
  return (
    <section className="rounded-xl border border-border bg-bg-elevated p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-text-subtle">Settlement</div>
        <span className="text-2xs text-success">{evidenceReady}/{projects.length} ready</span>
      </div>
      <div className="mt-3 space-y-3">
        {LEDGER_STEPS.map((step, index) => (
          <EvidenceStep key={step.label} step={step} index={index} active={index <= 3} />
        ))}
      </div>
    </section>
  );
}

function ServicePackagingPanel() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Package size={14} className="text-success" />
        Service Packages
      </div>
      <div className="space-y-3">
        {SERVICE_PACKAGES.slice(0, 3).map(pkg => (
          <ServicePackageCard key={pkg.title} item={pkg} />
        ))}
      </div>
    </section>
  );
}

function ledgerOf(project: Project) {
  return project.financials ?? {
    quotedAmount: project.quotedAmount ?? 0,
    invoicedAmount: project.quotedAmount ?? 0,
    paidAmount: 0,
    pendingAmount: project.quotedAmount ?? 0,
    nextInvoiceDue: project.phase === 'acceptance' ? '验收后' : '待回填',
  };
}

function acceptanceChecklist(project: Project) {
  const status = resolveProjectStatus(project);
  return [
    { label: 'Quote', done: (project.quotedAmount ?? project.financials?.quotedAmount ?? 0) > 0 },
    { label: 'Brief', done: !!project.customerBriefId || !!project.customerId },
    { label: 'Design', done: project.solutionStatus === 'finalized' || status !== 'open' },
    { label: 'Studio', done: !!project.linkedStudioId },
    { label: 'Acceptance', done: project.phase === 'acceptance' || status === 'done' },
  ];
}

function ledgerStatus(project: Project) {
  const ledger = ledgerOf(project);
  if (ledger.pendingAmount <= 0) return { label: '已结清', tone: 'success' as const };
  if (project.phase === 'acceptance') return { label: '验收后尾款', tone: 'warning' as const };
  if (ledger.paidAmount > 0) return { label: '部分回款', tone: 'warning' as const };
  return { label: '待回填收款', tone: 'default' as const };
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-4 shadow-sm shadow-slate-200/60 dark:shadow-black/25">
      <div className="flex items-center gap-2 text-2xs text-text-muted">
        <Icon size={12} style={{ color }} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold num leading-none">{value}</div>
      <div className="mt-1.5 text-2xs text-text-subtle">{sub}</div>
    </div>
  );
}

function CollectionCard({ project }: { project: Project }) {
  const ledger = ledgerOf(project);
  const status = ledgerStatus(project);
  const paidPct = Math.round((ledger.paidAmount / Math.max(ledger.quotedAmount, 1)) * 100);

  return (
    <Link href={`/pro/projects/${project.id}/overview`} className="card card-hover p-4 block group">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold line-clamp-1 group-hover:text-accent-glow transition">{project.title}</div>
          <p className="mt-1 text-2xs text-text-muted line-clamp-1">
            {project.customerName ?? '客户'} · {ledger.nextInvoiceDue ?? '待回填节点'}
          </p>
        </div>
        <span className={cn(
          'text-[10px] rounded-full border px-2 py-0.5 shrink-0',
          status.tone === 'success' && 'border-success/30 bg-success/10 text-success',
          status.tone === 'warning' && 'border-warning/30 bg-warning/10 text-warning',
          status.tone === 'default' && 'border-border bg-white/[0.03] text-text-muted',
        )}>
          {status.label}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-2xs text-text-subtle">待回款</div>
          <div className="mt-1 text-xl font-semibold num text-warning">¥{formatNumber(ledger.pendingAmount)}</div>
        </div>
        <div className="text-right">
          <div className="text-2xs text-text-subtle">已回款</div>
          <div className="mt-1 text-sm num text-success">¥{formatNumber(ledger.paidAmount)}</div>
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-success to-emerald-300" style={{ width: `${Math.min(paidPct, 100)}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-2xs text-text-muted">
        <span>回款进度 {paidPct}%</span>
        <span className="text-accent-glow inline-flex items-center gap-1">Open <ArrowRight size={10} /></span>
      </div>
    </Link>
  );
}

function LedgerRow({ project }: { project: Project }) {
  const ledger = ledgerOf(project);
  const checklist = acceptanceChecklist(project);
  const ready = checklist.filter(i => i.done).length;

  return (
    <Link href={`/pro/projects/${project.id}/overview`} className="grid grid-cols-[1.4fr_.8fr_.8fr_.8fr_.8fr] gap-3 px-4 py-3 hover:bg-white/[0.03] transition text-2xs items-center">
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{project.title}</div>
        <div className="mt-0.5 text-text-subtle truncate">{project.customerName ?? '客户待关联'} · {project.city ?? '远程'}</div>
      </div>
      <span className="num">¥{formatNumber(ledger.quotedAmount)}</span>
      <span className="num text-success">¥{formatNumber(ledger.paidAmount)}</span>
      <span className={cn('num', ledger.pendingAmount > 0 ? 'text-warning' : 'text-text-muted')}>¥{formatNumber(ledger.pendingAmount)}</span>
      <div className="flex items-center gap-1.5">
        <span className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <span className="block h-full rounded-full bg-accent" style={{ width: `${(ready / checklist.length) * 100}%` }} />
        </span>
        <span className="text-text-subtle">{ready}/{checklist.length}</span>
      </div>
    </Link>
  );
}

function EvidenceStep({
  step,
  index,
  active,
}: {
  step: (typeof LEDGER_STEPS)[number];
  index: number;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] num shrink-0"
        style={{ background: `${step.color}14`, borderColor: `${step.color}40`, color: step.color }}
      >
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{step.label}</span>
          {active && <CheckCircle2 size={11} className="text-success" />}
        </div>
        <p className="mt-0.5 text-2xs text-text-muted leading-snug">{step.desc}</p>
      </div>
    </div>
  );
}

function ServicePackageCard({
  item,
}: {
  item: (typeof SERVICE_PACKAGES)[number];
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{item.title}</span>
        <span className="text-[10px] rounded-full border border-border bg-white/[0.03] px-2 py-0.5 text-text-muted">{item.price}</span>
      </div>
      <p className="mt-2 text-2xs text-text-muted leading-relaxed">{item.desc}</p>
      <div className="mt-3 rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-2xs text-text-subtle">
        绑定对象：<span style={{ color: item.color }}>{item.binding}</span>
      </div>
    </div>
  );
}

function BottomSignal({
  icon: Icon,
  label,
  value,
  desc,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  desc: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-2xs text-text-muted">
        <Icon size={12} className="text-accent-glow" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold num">{value}</div>
      <p className="mt-1 text-2xs text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}
