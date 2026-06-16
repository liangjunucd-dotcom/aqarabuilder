'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileUp,
  Info,
  Plus,
  Search,
  UserPlus,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { AqaraLogo } from '@/components/brand/AqaraLogo';
import {
  getWorkspaces,
  getWorkspaceHomeHref,
  saveOnboardingTeamWorkspace,
  setActiveWorkspace,
  WORKSPACE_PLAN_LABEL,
  WORKSPACE_ROLE_LABEL,
  WORKSPACE_TYPE_LABEL,
  type BuilderWorkspace,
  type TeamWorkspacePlan,
} from '@/lib/workspaces';
import { getPlanBenefits, type PlanId } from '@/lib/plans';
import { cn } from '@/lib/utils';

const BUSINESS_PLAN_COLUMNS = ['Business', 'Enterprise'] as const;

const PLAN_SECTIONS = [
  {
    title: 'Workspace Capabilities',
    rows: [
      { feature: 'Team members', values: ['Unlimited', 'Unlimited'] },
      { feature: 'Plan Credits', values: ['3,000 / seat / month', 'Contract'] },
      { feature: 'Shared Add-on Credits', values: ['Yes', 'Yes'] },
      { feature: 'Project ledger', values: ['Workspace', 'Advanced'] },
      { feature: 'Workspace labels', values: ['Yes', 'Yes'] },
    ],
  },
  {
    title: 'Team & Operations',
    rows: [
      { feature: 'Role-based permissions', values: ['Yes', 'Yes'] },
      { feature: 'Billing admin', values: ['Yes', 'Yes'] },
      { feature: 'Advanced audit', values: ['No', 'Yes'] },
      { feature: 'SSO / private catalog', values: ['No', 'Yes'] },
    ],
  },
  {
    title: 'Service Provider Readiness',
    rows: [
      { feature: 'Service Provider label', values: ['Optional', 'Optional'] },
      { feature: 'Aqara Space verification', values: ['Optional', 'Optional'] },
      { feature: 'Aqara subsidy policy', values: ['Optional', 'Optional'] },
      { feature: 'Contract credits', values: ['No', 'Yes'] },
    ],
  },
];

export default function ProWorkspacesPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [inviteWorkspace, setInviteWorkspace] = useState<BuilderWorkspace | null>(null);
  const [fromOnboarding, setFromOnboarding] = useState(false);
  const [fromBuilder, setFromBuilder] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspacePlan, setNewWorkspacePlan] = useState<TeamWorkspacePlan>('business');
  const [businessProof, setBusinessProof] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowNew(params.get('new') === '1');
    setFromOnboarding(params.get('from') === 'onboarding');
    setFromBuilder(params.get('from') === 'builder');
    const planParam = params.get('plan');
    if (planParam === 'business' || planParam === 'enterprise') {
      setNewWorkspacePlan(planParam);
    } else if (planParam === 'team') {
      setNewWorkspacePlan('business');
    }
  }, []);

  const workspaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return getWorkspaces();
    return getWorkspaces().filter(workspace =>
      workspace.name.toLowerCase().includes(normalized) ||
      workspace.labels.some(label => label.toLowerCase().includes(normalized))
    );
  }, [query]);

  const openWorkspace = (workspace: BuilderWorkspace) => {
    setActiveWorkspace(workspace.id);
    router.push(`${getWorkspaceHomeHref(workspace)}?demo_as=pro`);
  };

  const createWorkspace = () => {
    const workspaceName = newWorkspaceName.trim();
    if (!workspaceName || !businessProof || creating) return;
    setCreating(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aqara:builder-pro:last-business-proof', JSON.stringify({
        workspaceName,
        proofOfBusiness: businessProof,
        createdAt: new Date().toISOString(),
      }));
    }
    const targetWorkspaceId = saveOnboardingTeamWorkspace({ name: workspaceName, plan: newWorkspacePlan }) ?? 'design-studio';
    setActiveWorkspace(targetWorkspaceId);
    window.setTimeout(() => {
      const targetWorkspace = getWorkspaces().find(workspace => workspace.id === targetWorkspaceId);
      setCreating(false);
      setShowNew(false);
      setNewWorkspaceName('');
      setBusinessProof('');
      router.push(`${targetWorkspace ? getWorkspaceHomeHref(targetWorkspace) : '/pro'}?demo_as=pro`);
    }, 700);
  };

  const goBack = () => {
    if (fromOnboarding) {
      router.back();
      return;
    }
    if (fromBuilder) {
      router.push('/home');
      return;
    }
    router.push('/home/profile');
  };

  const backLabel = fromOnboarding ? '返回上一步' : fromBuilder ? '返回 Builder' : '返回 Profile';

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-5 sm:px-8 lg:py-7">
        <header className="flex shrink-0 items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <AqaraLogo className="h-8 w-auto" />
            <span className="text-sm font-semibold tracking-[0.24em] text-slate-400">BUILDER PRO</span>
          </Link>
          <button onClick={goBack} className="hidden text-sm font-medium text-slate-500 hover:text-slate-950 sm:inline">
            {backLabel}
          </button>
        </header>

        <section className="flex min-h-0 flex-1 items-center py-6">
          {!showNew ? (
            <div className="w-full">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Builder Pro</div>
                <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-950">
                  选择工作区
                </h1>
              </div>

              <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="搜索工作区"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={() => setShowNew(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
                >
                  <Plus size={16} />
                  新建
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                {workspaces.map(workspace => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    onOpen={() => openWorkspace(workspace)}
                    onInvite={() => setInviteWorkspace(workspace)}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                <button onClick={goBack} className="inline-flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-white">
                  <ArrowLeft size={16} />
                  {backLabel}
                </button>
                <button onClick={() => setShowCompare(true)} className="rounded-xl px-2 py-2 font-medium text-slate-500 transition hover:bg-white hover:text-slate-950">计划</button>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-lg">
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Team</div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">新建工作区</h1>

                <div className="mt-5">
                  <label className="text-sm font-medium text-slate-800">
                    工作区名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={newWorkspaceName}
                    onChange={event => setNewWorkspaceName(event.target.value)}
                    placeholder="例如 Design Studio"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
                  />
                </div>

                <div className="mt-5">
                  <ProofOfBusinessUpload value={businessProof} onChange={setBusinessProof} />
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-800">
                      订阅计划 <span className="text-red-500">*</span>
                    </label>
                    <button onClick={() => setShowCompare(true)} className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-950">
                      对比计划
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200">
                    {(['business', 'enterprise'] as const).map(plan => (
                      <button
                        key={plan}
                        onClick={() => setNewWorkspacePlan(plan)}
                        className={cn(
                          'h-11 text-sm font-medium transition',
                          newWorkspacePlan === plan
                            ? 'bg-slate-950 text-white'
                            : 'bg-white text-slate-950 hover:bg-slate-50'
                        )}
                      >
                        {WORKSPACE_PLAN_LABEL[plan]}
                      </button>
                    ))}
                  </div>
                  <PlanBenefitSummary planId={newWorkspacePlan} />
                </div>

                <button
                  onClick={createWorkspace}
                  disabled={!newWorkspaceName.trim() || !businessProof || creating}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {creating ? 'Creating Workspace...' : '创建并进入'}
                </button>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  创建后会直接进入该 Team Workspace。付款、续费和额度可以稍后在 Settings 的 Plans & Credits 中管理。
                </p>

                <button onClick={() => setShowNew(false)} className="mt-4 text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-slate-950">
                  我的工作区
                </button>
              </div>
            </div>
          )}
        </section>
      </section>

      {showCompare && <ComparePlansModal onClose={() => setShowCompare(false)} />}
      {inviteWorkspace && (
        <InviteWorkspaceDialog workspace={inviteWorkspace} onClose={() => setInviteWorkspace(null)} />
      )}
    </main>
  );
}

function canInviteWorkspace(workspace: BuilderWorkspace) {
  return workspace.type === 'team' && ['owner', 'admin', 'billing_admin'].includes(workspace.role);
}

function WorkspaceCard({
  workspace,
  onOpen,
  onInvite,
}: {
  workspace: BuilderWorkspace;
  onOpen: () => void;
  onInvite: () => void;
}) {
  const Icon: LucideIcon = workspace.icon;
  const canInvite = canInviteWorkspace(workspace);
  const benefits = getPlanBenefits(workspace.plan as PlanId);

  return (
    <div
      className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold tracking-tight text-slate-950">{workspace.name}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">
          {WORKSPACE_PLAN_LABEL[workspace.plan]} · {WORKSPACE_ROLE_LABEL[workspace.role]}
        </span>
        <span className="mt-1 block truncate text-[11px] text-slate-400">
          {benefits.planCredits} · {benefits.addOnCredits}
        </span>
      </span>
      {canInvite && (
        <button
          type="button"
          onClick={onInvite}
          className="hidden h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-950 sm:inline-flex"
        >
          <UserPlus size={13} />
          Invite
        </button>
      )}
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-slate-950 group-hover:text-white"
      >
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

function PlanBenefitSummary({ planId }: { planId: PlanId }) {
  const benefits = getPlanBenefits(planId);

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      <PlanFact label="Plan Credits" value={benefits.planCredits} />
      <PlanFact label="Add-on" value={benefits.addOnCredits} />
      <PlanFact
        label="Credit owner"
        value={benefits.creditOwner === 'organization' ? '组织池' : benefits.creditOwner === 'contract' ? '合同池' : '个人账号'}
      />
    </div>
  );
}

function PlanFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 truncate text-xs font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function ProofOfBusinessUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-800">
        Proof of Business <span className="text-red-500">*</span>
      </span>
      <span className="mt-2 flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 transition hover:border-slate-400 hover:bg-white">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
          <FileUp size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-sm font-semibold', value ? 'text-slate-950' : 'text-slate-500')}>
            {value || '上传营业执照、工商证明或业务资质文件'}
          </span>
          <span className="mt-0.5 block text-xs text-slate-400">PDF, JPG, PNG</span>
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          Browse
        </span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={(event) => onChange(event.target.files?.[0]?.name ?? '')}
        />
      </span>
    </label>
  );
}

function InviteWorkspaceDialog({ workspace, onClose }: { workspace: BuilderWorkspace; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace Invite</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Invite to Workspace</h2>
            <p className="mt-1 text-sm text-slate-500">{workspace.name}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block text-sm font-medium text-slate-800">
            Email
            <input
              type="email"
              placeholder="name@example.com"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
            />
          </label>
          <label className="block text-sm font-medium text-slate-800">
            Workspace role
            <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5">
              <option>Member</option>
              <option>Project Manager</option>
              <option>Viewer</option>
              <option>Admin</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
            Cancel
          </button>
          <button type="button" onClick={onClose} className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}

function ComparePlansModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f4f5f7] px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium tracking-tight">Business Plans</h2>
            <p className="mt-2 text-sm text-slate-500">创建 Team Workspace 时，可以选择 Business 或 Enterprise。个人工作区计划在 Pricing 的 Personal 页签中管理。</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-white">
            <X size={24} />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-[1.4fr_repeat(2,1fr)] px-4 text-sm font-medium uppercase tracking-[0.12em] text-slate-700">
          <div>Feature</div>
          {BUSINESS_PLAN_COLUMNS.map(column => <div key={column} className="text-center">{column}</div>)}
        </div>

        <div className="space-y-6">
          {PLAN_SECTIONS.map(section => (
            <section key={section.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-5 text-sm font-semibold uppercase tracking-[0.08em]">
                {section.title}
              </div>
              {section.rows.map(row => (
                <div key={row.feature} className="grid min-h-16 grid-cols-[1.4fr_repeat(2,1fr)] items-center border-b border-slate-200 px-5 last:border-b-0">
                  <div className="flex items-center gap-2 text-sm text-slate-800">
                    {row.feature}
                    {row.feature.includes('Aqara') && <Info size={13} className="text-slate-400" />}
                  </div>
                  {row.values.map((value, index) => (
                    <div key={`${row.feature}-${index}`} className="flex justify-center text-sm text-slate-800">
                      {value === 'Yes' || value === 'Optional' ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CheckIcon />
                          {value === 'Optional' ? <span className="text-xs text-slate-500">Optional</span> : null}
                        </span>
                      ) : value === 'No' ? (
                        <XIcon />
                      ) : (
                        value
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#24c90a] text-white"><Check size={13} /></span>;
}

function XIcon() {
  return <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"><X size={13} /></span>;
}
