'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CircleX,
  Copy,
  KeyRound,
  Link2,
  LogOut,
  Mail,
  MoreHorizontal,
  PackageCheck,
  PencilLine,
  RotateCcw,
  Store,
  Trash2,
  UserRound,
  UserPlus,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  getActiveWorkspace,
  getWorkspace,
  getWorkspaces,
  canDeleteWorkspace,
  canLeaveWorkspace,
  deleteWorkspace,
  leaveWorkspace,
  setActiveWorkspace as persistActiveWorkspace,
  subscribeWorkspaceChange,
  WORKSPACE_PLAN_LABEL,
  WORKSPACE_ROLE_LABEL,
  type BuilderWorkspace,
} from '@/lib/workspaces';
import {
  ASSET_TYPE_LABELS,
  STATUS_LABELS,
  workspaceEntitledAssets,
} from '@/lib/mock/commerce';
import { getUsageCenterPool } from '@/lib/ai-pool';
import { getPlanBenefits } from '@/lib/plans';
import { cn } from '@/lib/utils';

const USER_NAME = 'Jun Liang';
const USER_EMAIL = 'liangjunucd@163.com';

type SettingsKey =
  | 'overview'
  | 'plan'
  | 'members'
  | 'invitation_links'
  | 'general'
  | 'security'
  | 'notifications'
  | 'usage'
  | 'my_workspaces'
  | 'my_invites';

const SETTINGS_KEYS = new Set<SettingsKey>([
  'overview',
  'plan',
  'members',
  'invitation_links',
  'general',
  'security',
  'notifications',
  'usage',
  'my_workspaces',
  'my_invites',
]);

const TEAM_ONLY_KEYS = new Set<SettingsKey>(['members', 'invitation_links']);

type MenuSection = {
  title?: string;
  items: Array<{ id: SettingsKey; label: string; icon: LucideIcon }>;
};

type ComparisonPlanId = 'free' | 'pro' | 'business' | 'enterprise';

const PLAN_COMPARISON_TIERS: Array<{
  id: ComparisonPlanId;
  name: string;
  scope: string;
  description: string;
}> = [
  {
    id: 'free',
    name: 'Free',
    scope: 'Personal Plan',
    description: 'Basic Builder Pro access, personal workspace, and starter Credits.',
  },
  {
    id: 'pro',
    name: 'Pro',
    scope: 'Personal Plan',
    description: 'More personal Credits, advanced exports, and personal commercial project capacity.',
  },
  {
    id: 'business',
    name: 'Business',
    scope: 'Business Plan',
    description: 'Shared projects, members, invitations, and team Credits for a team workspace.',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    scope: 'Business Plan',
    description: 'Contract Credits, service provider programs, audit, and private resources for a company workspace.',
  },
];

const PLAN_FEATURE_ROWS: Array<{
  label: string;
  values: Record<ComparisonPlanId, boolean | string>;
}> = [
  {
    label: 'Builder Community and Marketplace',
    values: { free: true, pro: true, business: true, enterprise: true },
  },
  {
    label: 'Personal Workspace',
    values: { free: true, pro: true, business: true, enterprise: true },
  },
  {
    label: 'Builder Pro Workbench',
    values: { free: 'Basic', pro: true, business: true, enterprise: true },
  },
  {
    label: 'Personal Plan Credits',
    values: { free: 'Weekly basic', pro: '2,000 / month', business: false, enterprise: false },
  },
  {
    label: 'Advanced Export and Remote Service',
    values: { free: false, pro: true, business: true, enterprise: true },
  },
  {
    label: 'Business Members and Invitation Links',
    values: { free: false, pro: false, business: true, enterprise: true },
  },
  {
    label: 'Shared Business Credits',
    values: { free: false, pro: false, business: 'Per seat', enterprise: 'Contract' },
  },
  {
    label: 'Shared Projects and Client Pipeline',
    values: { free: 'Limited', pro: 'Personal projects', business: true, enterprise: true },
  },
  {
    label: 'Service Provider / Aqara Space Program',
    values: { free: false, pro: false, business: false, enterprise: 'Contract' },
  },
  {
    label: 'Enterprise Controls and Audit',
    values: { free: false, pro: false, business: false, enterprise: true },
  },
];

function ProSettingsPageContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<SettingsKey>('overview');
  const [inviteWorkspace, setInviteWorkspace] = useState<BuilderWorkspace | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<BuilderWorkspace>(() => getWorkspaces()[0]);
  const [workspaceRevision, setWorkspaceRevision] = useState(0);
  const [marketVersion, setMarketVersion] = useState(0);
  const [marketReady, setMarketReady] = useState(false);

  useEffect(() => {
    const queryTab = searchParams?.get('tab');
    if (queryTab === 'workspace') {
      setTab('overview');
    } else if (queryTab === 'feature_comparison') {
      setTab('plan');
    } else if (isSettingsKey(queryTab)) {
      setTab(queryTab);
    }
  }, [searchParams]);

  useEffect(() => {
    const queryWorkspace = getWorkspace(searchParams?.get('workspace'));
    if (queryWorkspace) {
      persistActiveWorkspace(queryWorkspace.id);
      setActiveWorkspace(queryWorkspace);
    } else {
      setActiveWorkspace(getActiveWorkspace());
    }

    const unsubscribeWorkspace = subscribeWorkspaceChange(setActiveWorkspace);
    const syncMarket = () => {
      setMarketReady(true);
      setMarketVersion(current => current + 1);
    };
    syncMarket();
    window.addEventListener('aqara:market-change', syncMarket);
    return () => {
      unsubscribeWorkspace();
      window.removeEventListener('aqara:market-change', syncMarket);
    };
  }, [searchParams]);

  useEffect(() => {
    if (activeWorkspace.type === 'personal' && TEAM_ONLY_KEYS.has(tab)) {
      setTab('overview');
    }
  }, [activeWorkspace.type, tab]);

  const selectWorkspace = (workspace: BuilderWorkspace) => {
    persistActiveWorkspace(workspace.id);
    setActiveWorkspace(workspace);

    const url = new URL(window.location.href);
    url.searchParams.set('workspace', workspace.id);
    if (workspace.type === 'personal' && TEAM_ONLY_KEYS.has(tab)) {
      url.searchParams.set('tab', 'overview');
      setTab('overview');
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const editWorkspace = (workspace: BuilderWorkspace) => {
    persistActiveWorkspace(workspace.id);
    setActiveWorkspace(workspace);
    setTab('overview');

    const url = new URL(window.location.href);
    url.searchParams.set('workspace', workspace.id);
    url.searchParams.set('tab', 'workspace');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const removeWorkspace = (workspace: BuilderWorkspace) => {
    if (!canDeleteWorkspace(workspace)) return;
    const confirmed = window.confirm(`Delete ${workspace.name}?`);
    if (!confirmed) return;
    if (!deleteWorkspace(workspace.id)) return;

    const nextWorkspace = getActiveWorkspace();
    setActiveWorkspace(nextWorkspace);
    setWorkspaceRevision(value => value + 1);

    const url = new URL(window.location.href);
    url.searchParams.set('workspace', nextWorkspace.id);
    if (workspace.id === activeWorkspace.id) {
      url.searchParams.set('tab', 'workspace');
      setTab('overview');
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const resetWorkspace = (workspace: BuilderWorkspace) => {
    const confirmed = window.confirm(`Reset ${workspace.name}?`);
    if (!confirmed) return;
    localStorage.setItem('aqara:builder-pro:last-workspace-reset', JSON.stringify({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      resetAt: new Date().toISOString(),
    }));
    setWorkspaceRevision(value => value + 1);
  };

  const leaveCurrentWorkspace = (workspace: BuilderWorkspace) => {
    if (!canLeaveWorkspace(workspace)) return;
    const confirmed = window.confirm(`Leave ${workspace.name}?`);
    if (!confirmed) return;
    if (!leaveWorkspace(workspace.id)) return;

    const nextWorkspace = getActiveWorkspace();
    setActiveWorkspace(nextWorkspace);
    setWorkspaceRevision(value => value + 1);

    const url = new URL(window.location.href);
    url.searchParams.set('workspace', nextWorkspace.id);
    if (workspace.id === activeWorkspace.id) {
      url.searchParams.set('tab', 'workspace');
      setTab('overview');
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const menuSections = buildMenu(activeWorkspace);

  return (
    <main className="h-full overflow-y-auto bg-[#f7f7f6] px-5 py-5 text-[#222]">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="mt-5 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-[#d9d6d1] bg-white p-3">
          <SettingsIdentity workspace={activeWorkspace} />

          <div className="mt-6 space-y-5">
            {menuSections.map(section => (
              <SettingsSection key={section.title ?? 'workspace-menu'} title={section.title}>
                {section.items.map(item => (
                  <SideItem
                    key={item.id}
                    active={tab === item.id}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => setTab(item.id)}
                  />
                ))}
              </SettingsSection>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          <SettingsContent
            tab={tab}
            activeWorkspace={activeWorkspace}
            marketReady={marketReady}
            marketVersion={marketVersion}
            onInvite={setInviteWorkspace}
            onSelectWorkspace={selectWorkspace}
            onEditWorkspace={editWorkspace}
            onResetWorkspace={resetWorkspace}
            onDeleteWorkspace={removeWorkspace}
            onLeaveWorkspace={leaveCurrentWorkspace}
            workspaceRevision={workspaceRevision}
          />
        </section>
      </div>

      {inviteWorkspace && (
        <InviteWorkspaceDialog workspace={inviteWorkspace} onClose={() => setInviteWorkspace(null)} />
      )}
    </main>
  );
}

export default function ProSettingsPage() {
  return (
    <Suspense fallback={null}>
      <ProSettingsPageContent />
    </Suspense>
  );
}

function isSettingsKey(value: string | null | undefined): value is SettingsKey {
  return Boolean(value && SETTINGS_KEYS.has(value as SettingsKey));
}

function buildMenu(workspace: BuilderWorkspace): MenuSection[] {
  const sections: MenuSection[] = [
    {
      items: [
        { id: 'overview', label: 'Overview', icon: BriefcaseBusiness },
        { id: 'plan', label: 'Plans & Credits', icon: BadgeCheck },
      ],
    },
  ];

  if (workspace.type === 'team') {
    sections.push({
      title: 'Team',
      items: [
        { id: 'members', label: 'Members', icon: Users },
        { id: 'invitation_links', label: 'Invitation Links', icon: Link2 },
      ],
    });
  }

  sections.push({
    title: 'User',
    items: [
      { id: 'general', label: 'General', icon: UserRound },
      { id: 'security', label: 'Security', icon: KeyRound },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'usage', label: 'Usage', icon: WalletCards },
      { id: 'my_workspaces', label: 'My Workspaces', icon: BriefcaseBusiness },
      { id: 'my_invites', label: 'My Invites', icon: Mail },
    ],
  });

  return sections;
}

function SettingsIdentity({ workspace }: { workspace: BuilderWorkspace }) {
  const isPersonal = workspace.type === 'personal';
  const title = isPersonal ? 'Personal' : workspace.name;
  const subtitle = isPersonal ? USER_EMAIL : resolveCompanyName(workspace);

  return (
    <div className="flex items-center gap-3 px-2 pt-1">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#85ff69] text-sm font-semibold text-[#111]">
        {isPersonal ? 'P' : workspaceInitials(workspace.name)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-base font-semibold leading-tight">{title}</div>
        <div className="mt-1 truncate text-sm text-[#555]">{subtitle}</div>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div>
      {title && <div className="mb-2 px-2 text-sm font-semibold text-[#222]">{title}</div>}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SideItem({
  label,
  icon: Icon,
  active = false,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        'flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition',
        active ? 'bg-[#e5e2dd] font-semibold text-[#222]' : 'text-[#444] hover:bg-[#f1efeb]',
      )}
      type="button"
      onClick={onClick}
    >
      <Icon size={16} className={active ? 'text-[#111]' : 'text-[#777]'} />
      <span>{label}</span>
    </button>
  );
}

function SettingsContent({
  tab,
  activeWorkspace,
  marketReady,
  marketVersion,
  onInvite,
  onSelectWorkspace,
  onEditWorkspace,
  onResetWorkspace,
  onDeleteWorkspace,
  onLeaveWorkspace,
  workspaceRevision,
}: {
  tab: SettingsKey;
  activeWorkspace: BuilderWorkspace;
  marketReady: boolean;
  marketVersion: number;
  onInvite: (workspace: BuilderWorkspace) => void;
  onSelectWorkspace: (workspace: BuilderWorkspace) => void;
  onEditWorkspace: (workspace: BuilderWorkspace) => void;
  onResetWorkspace: (workspace: BuilderWorkspace) => void;
  onDeleteWorkspace: (workspace: BuilderWorkspace) => void;
  onLeaveWorkspace: (workspace: BuilderWorkspace) => void;
  workspaceRevision: number;
}) {
  if (activeWorkspace.type === 'personal' && TEAM_ONLY_KEYS.has(tab)) {
    return <WorkspaceContent workspace={activeWorkspace} marketReady={marketReady} marketVersion={marketVersion} />;
  }

  if (tab === 'overview') {
    return <WorkspaceContent workspace={activeWorkspace} marketReady={marketReady} marketVersion={marketVersion} />;
  }
  if (tab === 'plan') {
    return <PlanContent workspace={activeWorkspace} />;
  }
  if (tab === 'members') {
    return <MembersContent workspace={activeWorkspace} onInvite={onInvite} />;
  }
  if (tab === 'invitation_links') {
    return <InvitationLinksContent workspace={activeWorkspace} />;
  }
  if (tab === 'general') {
    return <GeneralContent />;
  }
  if (tab === 'security') {
    return <SecurityContent />;
  }
  if (tab === 'notifications') {
    return <NotificationsContent />;
  }
  if (tab === 'usage') {
    return <UsageContent workspace={activeWorkspace} />;
  }
  if (tab === 'my_workspaces') {
    return (
      <MyWorkspacesContent
        activeWorkspace={activeWorkspace}
        workspaceRevision={workspaceRevision}
        onSelectWorkspace={onSelectWorkspace}
        onEditWorkspace={onEditWorkspace}
        onResetWorkspace={onResetWorkspace}
        onDeleteWorkspace={onDeleteWorkspace}
        onLeaveWorkspace={onLeaveWorkspace}
      />
    );
  }
  return <MyInvitesContent />;
}

function WorkspaceContent({
  workspace,
  marketReady,
  marketVersion,
}: {
  workspace: BuilderWorkspace;
  marketReady: boolean;
  marketVersion: number;
}) {
  void marketVersion;
  const workspaceAssets = marketReady ? workspaceEntitledAssets(workspace.id) : [];
  const isPersonal = workspace.type === 'personal';
  const detailRows = [
    { label: 'Workspace Name', value: workspace.name },
    { label: 'Type', value: isPersonal ? 'Personal Workspace' : 'Team Workspace' },
    { label: isPersonal ? 'Account' : 'Company', value: isPersonal ? USER_EMAIL : resolveCompanyName(workspace) },
    { label: 'Role', value: WORKSPACE_ROLE_LABEL[workspace.role] },
    { label: 'Verification', value: workspace.verification === 'verified' ? 'Verified' : workspace.verification === 'pending' ? 'Pending' : 'Not verified' },
    { label: 'Owner', value: workspace.type === 'personal' ? USER_NAME : resolveCompanyName(workspace) },
  ];

  return (
    <SettingsFrame title="Overview">
      <div className="rounded-xl border border-[#e4e1dc] bg-[#faf9f7] p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#85ff69] text-sm font-semibold text-[#111]">
              {isPersonal ? 'P' : workspaceInitials(workspace.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">{workspace.name}</div>
              <div className="mt-1 truncate text-sm text-[#666]">
                {isPersonal ? USER_EMAIL : resolveCompanyName(workspace)}
              </div>
            </div>
          </div>
          <div className="rounded-full bg-[#151515] px-3 py-1 text-xs font-semibold text-white">
            {isPersonal ? 'Personal' : 'Team'}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {detailRows.map(item => (
          <Metric key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="mt-5">
        <Panel
          title="Workspace Assets"
          action={
            <Link href="/pro/marketplace" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d9d6d1] bg-white px-3 text-xs font-semibold text-[#333] transition hover:border-[#151515]">
              <Store size={13} />
              Marketplace
              <ArrowRight size={12} />
            </Link>
          }
        >
          <PluginEntitlements workspace={workspace} rows={workspaceAssets} />
        </Panel>
      </div>
    </SettingsFrame>
  );
}

type PlanLicenseTab = 'overview' | 'license_codes' | 'comparison';

const PLAN_LICENSE_TABS: Array<{ id: PlanLicenseTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'license_codes', label: 'License Codes' },
  { id: 'comparison', label: 'Feature Comparison' },
];

function PlanContent({ workspace }: { workspace: BuilderWorkspace }) {
  const [activeTab, setActiveTab] = useState<PlanLicenseTab>('overview');
  const benefits = getPlanBenefits(workspace.plan);
  const usage = getUsageSummary(workspace);
  const currentPlan = planDisplayName(workspace.plan);

  return (
    <SettingsFrame title="Plans & Credits">
      <div className="mb-5 flex flex-wrap gap-2">
        {PLAN_LICENSE_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'h-9 rounded-full px-4 text-sm font-semibold transition',
              activeTab === tab.id ? 'bg-[#151515] text-white' : 'bg-[#f1efeb] text-[#333] hover:bg-[#e5e2dd]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <Panel title="Subscription Plan">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold text-[#222]">{currentPlan}</div>
                <div className="mt-2 max-w-2xl text-sm leading-6 text-[#666]">
                  {workspace.type === 'personal'
                    ? 'This personal workspace uses the Personal Plan on your account.'
                    : 'This team workspace uses the Business Plan assigned to the company.'}
                </div>
              </div>
              <button type="button" className="h-9 rounded-md bg-[#151515] px-4 text-sm font-semibold text-white">
                {workspace.plan === 'enterprise' ? 'Contact Aqara' : workspace.type === 'team' ? 'Manage Plan' : 'View Plans'}
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Metric label="Plan Source" value={workspace.type === 'personal' ? 'Personal Plan' : 'Business Plan'} />
              <Metric label="Plan Credits" value={benefits.planCredits} />
              <Metric label="Add-on Credits" value={benefits.addOnCredits} />
            </div>
          </Panel>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Metric label="Credit Pool" value={creditPoolLabel(benefits.creditPool)} />
            <Metric label="Used Credits" value={`${usage.used} / ${usage.total}`} />
            <Metric label="Remaining Credits" value={`${usage.remaining}`} />
          </div>

          <div className="mt-4">
            <Panel title="Studio Licenses">
              <StudioLicenseTable workspace={workspace} />
            </Panel>
          </div>
        </>
      )}

      {activeTab === 'license_codes' && <LicenseCodesContent workspace={workspace} />}
      {activeTab === 'comparison' && <FeatureComparisonContent workspace={workspace} />}
    </SettingsFrame>
  );
}

function FeatureComparisonContent({ workspace }: { workspace: BuilderWorkspace }) {
  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-4">
        {PLAN_COMPARISON_TIERS.map(tier => (
          <PlanComparisonCard
            key={tier.id}
            active={tier.id === workspace.plan}
            name={tier.name}
            scope={tier.scope}
            description={tier.description}
          />
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-[#e4e1dc]">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-[#faf9f7] text-left text-xs uppercase tracking-[0.08em] text-[#777]">
            <tr>
              <th className="w-[32%] px-4 py-4 font-semibold">Feature</th>
              {PLAN_COMPARISON_TIERS.map(tier => (
                <th key={tier.id} className="px-4 py-4 text-center font-semibold">
                  <div>{tier.name}</div>
                  {tier.id === workspace.plan && <div className="mt-1 text-[10px] text-[#20a60f]">Current Plan</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e1dc]">
            {PLAN_FEATURE_ROWS.map(row => (
              <tr key={row.label}>
                <td className="px-4 py-3 font-medium text-[#222]">{row.label}</td>
                {PLAN_COMPARISON_TIERS.map(tier => (
                  <td key={tier.id} className="px-4 py-3 text-center">
                    <PlanFeatureCell value={row.values[tier.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LicenseCodesContent({ workspace }: { workspace: BuilderWorkspace }) {
  const rows = workspace.type === 'personal'
    ? [
      { code: 'PERSONAL-STUDIO-TRIAL', scope: 'Personal workspace', status: 'Trial' },
    ]
    : [
      { code: `${workspaceInitials(workspace.name)}-STUDIO-001`, scope: workspace.name, status: workspace.plan === 'enterprise' ? 'Contract' : 'Active' },
      { code: `${workspaceInitials(workspace.name)}-SMS-ALERT`, scope: workspace.name, status: 'Available' },
    ];

  return (
    <Panel title="License Codes">
      <div className="overflow-hidden rounded-lg border border-[#e4e1dc]">
        <table className="w-full text-sm">
          <thead className="bg-[#faf9f7] text-left text-xs uppercase tracking-[0.08em] text-[#777]">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Scope</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e1dc]">
            {rows.map(row => (
              <tr key={row.code}>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-[#222]">{row.code}</td>
                <td className="px-4 py-3 text-[#555]">{row.scope}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-[#d9d6d1] bg-[#faf9f7] px-2.5 py-1 text-xs font-semibold text-[#333]">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function MembersContent({
  workspace,
  onInvite,
}: {
  workspace: BuilderWorkspace;
  onInvite: (workspace: BuilderWorkspace) => void;
}) {
  const members = memberRowsForWorkspace(workspace);
  const canInvite = canInviteWorkspace(workspace);

  return (
    <SettingsFrame
      title="Members"
      action={
        canInvite ? (
          <button
            type="button"
            onClick={() => onInvite(workspace)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#85ff69] px-4 text-sm font-semibold text-[#111] transition hover:bg-[#75ef5b]"
          >
            <UserPlus size={16} />
            Invite user
          </button>
        ) : null
      }
    >
      <div className="overflow-hidden rounded-xl border border-[#e4e1dc]">
        <table className="w-full text-sm">
          <thead className="bg-[#faf9f7] text-left text-xs uppercase tracking-[0.08em] text-[#777]">
            <tr>
              <th className="px-4 py-3 font-semibold">Account Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e1dc]">
            {members.map(member => (
              <tr key={member.email}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#222]">{member.name}</div>
                  <div className="mt-0.5 text-xs text-[#666]">{member.email}</div>
                </td>
                <td className="px-4 py-3 text-[#444]">{member.role}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff7ec] px-2.5 py-1 text-xs font-semibold text-[#268319]">
                    <CheckCircle2 size={13} />
                    {member.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsFrame>
  );
}

function InvitationLinksContent({ workspace }: { workspace: BuilderWorkspace }) {
  const canManage = canInviteWorkspace(workspace);
  const teamCode = teamCodeForWorkspace(workspace);

  return (
    <SettingsFrame title="Invitation Links">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
        <Panel title="Team Code">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xl font-semibold tracking-[0.14em] text-[#222]">{teamCode}</div>
              <div className="mt-1 text-sm text-[#666]">People can request access to {workspace.name} with this code.</div>
            </div>
            <button
              type="button"
              disabled={!canManage}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition',
                canManage ? 'border border-[#d9d6d1] bg-white text-[#333] hover:border-[#151515]' : 'bg-[#ebe7e1] text-[#aaa]',
              )}
            >
              <Copy size={15} />
              Copy
            </button>
          </div>
        </Panel>

        <Panel title="Access">
          <div className="text-sm text-[#555]">
            {canManage ? 'Owner/Admin can invite users and approve join requests.' : 'Owner/Admin manage invitation links and join requests.'}
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Join Requests">
          {canManage ? (
            <div className="divide-y divide-[#e4e1dc] rounded-lg border border-[#e4e1dc]">
              {joinRequestsForWorkspace(workspace).map(request => (
                <div key={request.email} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
                  <div>
                    <div className="text-sm font-semibold text-[#222]">{request.name}</div>
                    <div className="mt-0.5 text-xs text-[#666]">{request.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="h-8 rounded-md border border-[#d9d6d1] bg-white px-3 text-xs font-semibold text-[#333]">
                      Decline
                    </button>
                    <button type="button" className="h-8 rounded-md bg-[#151515] px-3 text-xs font-semibold text-white">
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No access to manage join requests" />
          )}
        </Panel>
      </div>
    </SettingsFrame>
  );
}

function GeneralContent() {
  return (
    <SettingsFrame title="General">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Name" value={USER_NAME} />
        <Metric label="Email" value={USER_EMAIL} />
        <Metric label="Account Status" value="Active" />
      </div>

      <div className="mt-4">
        <Panel title="Preferences">
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleRow label="Language" value="English" />
            <ToggleRow label="Region" value="China" />
          </div>
        </Panel>
      </div>
    </SettingsFrame>
  );
}

function SecurityContent() {
  return (
    <SettingsFrame title="Security">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Password" value="Configured" />
        <Metric label="Two-factor" value="Not enabled" />
        <Metric label="Last sign-in" value="Today" />
      </div>

      <div className="mt-4">
        <Panel title="Sessions">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-[#555]">Manage signed-in devices and revoke inactive sessions.</div>
            <button type="button" className="h-9 rounded-md border border-[#d9d6d1] bg-white px-4 text-sm font-semibold text-[#333]">
              Review sessions
            </button>
          </div>
        </Panel>
      </div>
    </SettingsFrame>
  );
}

function NotificationsContent() {
  return (
    <SettingsFrame title="Notifications">
      <Panel title="Email Notifications">
        <div className="divide-y divide-[#e4e1dc]">
          <ToggleRow label="Project updates" value="On" />
          <ToggleRow label="Workspace invites" value="On" />
          <ToggleRow label="Credits alerts" value="On" />
        </div>
      </Panel>
    </SettingsFrame>
  );
}

function UsageContent({ workspace }: { workspace: BuilderWorkspace }) {
  const usage = getUsageSummary(workspace);
  const benefits = getPlanBenefits(workspace.plan);

  return (
    <SettingsFrame title="Usage">
      <Panel title="Credits Usage">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-[#222]">Plan Credits</div>
            <div className="mt-1 text-sm text-[#666]">
              {usage.periodLabel} · {usage.periodStart} - {usage.periodEnd}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-[#222]">{usage.used} / {usage.total}</div>
            <div className="text-xs text-[#777]">{usage.percent}% used</div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ece9e4]">
          <div className="h-full rounded-full bg-[#26b94f]" style={{ width: `${Math.min(usage.percent, 100)}%` }} />
        </div>
      </Panel>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Metric label="Plan" value={WORKSPACE_PLAN_LABEL[workspace.plan]} />
        <Metric label="Plan Credits" value={benefits.planCredits} />
        <Metric label="Credit Owner" value={creditOwnerLabel(benefits.creditOwner)} />
      </div>
    </SettingsFrame>
  );
}

function MyWorkspacesContent({
  activeWorkspace,
  workspaceRevision,
  onSelectWorkspace,
  onEditWorkspace,
  onResetWorkspace,
  onDeleteWorkspace,
  onLeaveWorkspace,
}: {
  activeWorkspace: BuilderWorkspace;
  workspaceRevision: number;
  onSelectWorkspace: (workspace: BuilderWorkspace) => void;
  onEditWorkspace: (workspace: BuilderWorkspace) => void;
  onResetWorkspace: (workspace: BuilderWorkspace) => void;
  onDeleteWorkspace: (workspace: BuilderWorkspace) => void;
  onLeaveWorkspace: (workspace: BuilderWorkspace) => void;
}) {
  const workspaces = useMemo(() => getWorkspaces(), [workspaceRevision, activeWorkspace.id]);

  return (
    <SettingsFrame title="My Workspaces">
      <div className="overflow-visible rounded-xl border border-[#e4e1dc] bg-white">
        <table className="w-full min-w-[1040px] text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.12em] text-[#aaa]">
            <tr>
              <th className="w-[28%] px-8 py-5 font-semibold">Name</th>
              <th className="w-[12%] px-4 py-5 font-semibold">Plan</th>
              <th className="w-[20%] px-4 py-5 font-semibold">Organization</th>
              <th className="w-[12%] px-4 py-5 font-semibold">Role</th>
              <th className="w-[14%] px-4 py-5 font-semibold">Last Modified</th>
              <th className="w-[8%] px-8 py-5 text-right font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e1dc]">
            {workspaces.map(workspace => (
              <WorkspaceRow
                key={workspace.id}
                active={workspace.id === activeWorkspace.id}
                workspace={workspace}
                onSelect={() => onSelectWorkspace(workspace)}
                onEdit={() => onEditWorkspace(workspace)}
                onReset={() => onResetWorkspace(workspace)}
                onDelete={() => onDeleteWorkspace(workspace)}
                onLeave={() => onLeaveWorkspace(workspace)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </SettingsFrame>
  );
}

function MyInvitesContent() {
  return (
    <SettingsFrame title="My Invites">
      <Panel title="Pending Invites">
        <EmptyState title="No pending invites" />
      </Panel>
    </SettingsFrame>
  );
}

function SettingsFrame({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-h-[620px] rounded-xl border border-[#d9d6d1] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-[#e4e1dc] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e4e1dc] bg-[#faf9f7] p-3">
      <div className="text-xs text-[#777]">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-[#222]">{value}</div>
    </div>
  );
}

function PlanBadge({ plan }: { plan: BuilderWorkspace['plan'] }) {
  if (plan === 'free') return <span className="text-sm text-[#bbb]">-</span>;
  const colorClass = plan === 'enterprise'
    ? 'border-violet-400 text-violet-600'
    : 'border-emerald-400 text-emerald-600';
  const label = plan === 'enterprise' ? 'ENT' : plan === 'business' ? 'BUS' : 'PRO';

  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em]', colorClass)}>
      {label}
    </span>
  );
}

function ToggleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="text-sm font-medium text-[#222]">{label}</div>
      <div className="text-sm text-[#666]">{value}</div>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-[#d9d6d1] bg-[#faf9f7] px-4 text-center text-sm font-medium text-[#777]">
      {title}
    </div>
  );
}

function PlanComparisonCard({
  active,
  name,
  scope,
  description,
}: {
  active: boolean;
  name: string;
  scope: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4',
        active ? 'border-[#22b414] ring-1 ring-[#22b414]' : 'border-[#e4e1dc]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.08em] text-[#222]">{name}</div>
          <div className="mt-1 text-xs text-[#777]">{scope}</div>
        </div>
        {active && (
          <span className="rounded-full bg-[#22b414] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
            Current
          </span>
        )}
      </div>
      <p className="mt-4 text-sm leading-6 text-[#555]">{description}</p>
    </div>
  );
}

function PlanFeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#22b414] text-white">
        <CheckCircle2 size={17} />
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#df3345] text-white">
        <CircleX size={17} />
      </span>
    );
  }

  return <span className="text-sm font-medium text-[#333]">{value}</span>;
}

function StudioLicenseTable({ workspace }: { workspace: BuilderWorkspace }) {
  const rows = [
    {
      state: 'Unmanaged',
      description: 'Studio is connected but not managed by Builder Pro.',
      count: workspace.type === 'personal' ? 1 : 0,
      color: '#6b7280',
    },
    {
      state: 'Trial',
      description: 'Studio is in trial with full project delivery features.',
      count: workspace.type === 'team' && workspace.plan === 'business' ? 2 : 0,
      color: '#a6e58e',
    },
    {
      state: 'Licensed',
      description: 'Studio has a valid license and full functionality.',
      count: workspace.plan === 'enterprise' ? 12 : workspace.plan === 'business' ? 3 : 0,
      color: '#5fc44b',
    },
    {
      state: 'Expired',
      description: 'License has expired and requires renewal.',
      count: 0,
      color: '#df1f3a',
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-[#e4e1dc]">
      <table className="w-full text-sm">
        <thead className="bg-[#faf9f7] text-left text-xs uppercase tracking-[0.08em] text-[#777]">
          <tr>
            <th className="px-4 py-3 font-semibold">State</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 text-right font-semibold">Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4e1dc]">
          {rows.map(row => (
            <tr key={row.state}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: row.color }} />
                  <span className="font-medium text-[#222]">{row.state}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[#555]">{row.description}</td>
              <td className="px-4 py-3 text-right font-semibold text-[#222]">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PluginEntitlements({
  workspace,
  rows,
}: {
  workspace: BuilderWorkspace;
  rows: ReturnType<typeof workspaceEntitledAssets>;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#d9d6d1] bg-[#faf9f7] px-4 py-6 text-sm text-[#666]">
        No workspace assets in {workspace.name}.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#e4e1dc] rounded-lg border border-[#e4e1dc]">
      {rows.slice(0, 4).map(row => (
        <div key={row.entitlement.id} className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f1efeb] text-[#333]">
            <PackageCheck size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-[#222]">{row.asset.name}</div>
            <div className="mt-0.5 truncate text-xs text-[#777]">
              {ASSET_TYPE_LABELS[row.asset.type]} · {STATUS_LABELS[row.entitlement.status]}
            </div>
          </div>
          <div className="shrink-0 text-right text-xs text-[#666]">
            <div className="font-semibold text-[#222]">{row.asset.permission === 'free' ? 'Free' : 'Included'}</div>
            <div className="mt-0.5">{row.entitlement.paidByAccountLabel ? `Added by ${row.entitlement.paidByAccountLabel}` : 'Plan access'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkspaceRow({
  workspace,
  active,
  onSelect,
  onEdit,
  onReset,
  onDelete,
  onLeave,
}: {
  workspace: BuilderWorkspace;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onReset: () => void;
  onDelete: () => void;
  onLeave: () => void;
}) {
  const canDelete = canDeleteWorkspace(workspace);
  const canLeave = canLeaveWorkspace(workspace);
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = workspace.role === 'owner';

  const runAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <tr
      onClick={onSelect}
      className={cn('cursor-pointer transition hover:bg-[#faf9f7]', active && 'bg-[#faf9f7]')}
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-8">
          <div className="w-5 text-center text-sm font-bold text-[#222]">
            {workspace.type === 'personal' ? 'P' : workspaceInitials(workspace.name)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-medium tracking-wide text-[#222]">{workspace.name}</div>
            {active && <div className="mt-1 text-xs font-semibold text-[#20a60f]">Current workspace</div>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <PlanBadge plan={workspace.plan} />
      </td>
      <td className="px-4 py-3 text-base font-medium text-[#9b9b9b]">{workspaceOrganizationLabel(workspace)}</td>
      <td className="px-4 py-3 text-xs font-bold uppercase text-[#222]">{WORKSPACE_ROLE_LABEL[workspace.role]}</td>
      <td className="px-4 py-3 text-base font-medium text-[#9b9b9b]">{workspaceLastModified(workspace)}</td>
      <td className="relative px-8 py-3 text-right">
        <button
          type="button"
          aria-label={`Workspace actions for ${workspace.name}`}
          aria-expanded={menuOpen}
          onClick={event => {
            event.stopPropagation();
            setMenuOpen(open => !open);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#aaa] transition hover:bg-[#f1efeb] hover:text-[#222]"
        >
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close workspace actions"
              className="fixed inset-0 z-30 cursor-default"
              onClick={event => {
                event.stopPropagation();
                setMenuOpen(false);
              }}
            />
            <div
              onClick={event => event.stopPropagation()}
              className="absolute right-6 top-12 z-40 w-52 rounded-lg border border-[#e4e1dc] bg-white py-1.5 text-left shadow-lg shadow-black/12"
            >
              {isOwner ? (
                <>
                  <WorkspaceActionItem icon={PencilLine} label="Edit Workspace" onClick={() => runAction(onEdit)} />
                  <WorkspaceActionItem icon={RotateCcw} label="Reset" tone="danger" onClick={() => runAction(onReset)} />
                  {canDelete && (
                    <WorkspaceActionItem icon={Trash2} label="Delete Workspace" tone="danger" onClick={() => runAction(onDelete)} />
                  )}
                </>
              ) : (
                canLeave && <WorkspaceActionItem icon={LogOut} label="Leave" onClick={() => runAction(onLeave)} />
              )}
            </div>
          </>
        )}
      </td>
    </tr>
  );
}

function WorkspaceActionItem({
  icon: Icon,
  label,
  tone = 'default',
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  tone?: 'default' | 'danger';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-9 w-full items-center gap-2.5 px-4 text-sm transition',
        tone === 'danger'
          ? 'text-red-500 hover:bg-red-50'
          : 'text-[#333] hover:bg-[#faf9f7]',
      )}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}

function InviteWorkspaceDialog({ workspace, onClose }: { workspace: BuilderWorkspace; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-md rounded-xl border border-[#d9d6d1] bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Invite to Workspace</h2>
            <p className="mt-1 text-sm text-[#666]">{workspace.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#666] transition hover:bg-[#f1efeb] hover:text-[#222]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-[#333]">
            Email
            <input
              type="email"
              placeholder="name@example.com"
              className="mt-2 h-10 w-full rounded-md border border-[#d9d6d1] bg-white px-3 text-sm outline-none transition focus:border-[#151515] focus:ring-4 focus:ring-black/5"
            />
          </label>
          <label className="block text-sm font-medium text-[#333]">
            Workspace role
            <select className="mt-2 h-10 w-full rounded-md border border-[#d9d6d1] bg-white px-3 text-sm outline-none transition focus:border-[#151515] focus:ring-4 focus:ring-black/5">
              <option>Member</option>
              <option>Project Manager</option>
              <option>Viewer</option>
              <option>Admin</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-[#d9d6d1] bg-white px-4 text-sm font-semibold text-[#333]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md bg-[#151515] px-4 text-sm font-semibold text-white"
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}

function canInviteWorkspace(workspace: BuilderWorkspace) {
  return workspace.type === 'team' && ['owner', 'admin', 'billing_admin'].includes(workspace.role);
}

function resolveCompanyName(workspace: BuilderWorkspace) {
  if (workspace.type === 'personal') return USER_EMAIL;
  return workspace.name;
}

function workspaceOrganizationLabel(workspace: BuilderWorkspace) {
  if (workspace.type === 'personal') return USER_EMAIL;
  return resolveCompanyName(workspace);
}

function workspaceLastModified(workspace: BuilderWorkspace) {
  if (workspace.id === 'personal') return '2025/8/11';
  if (workspace.id === 'seven-mi') return '2026/6/7';
  if (workspace.id === 'design-studio') return '2026/5/12';
  return '2026/6/7';
}

function workspaceInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function creditPoolLabel(pool: ReturnType<typeof getPlanBenefits>['creditPool']) {
  if (pool === 'organization') return 'Organization';
  if (pool === 'contract') return 'Contract';
  return 'Personal account';
}

function planDisplayName(plan: BuilderWorkspace['plan']) {
  if (plan === 'pro') return 'Pro';
  return WORKSPACE_PLAN_LABEL[plan];
}

function creditOwnerLabel(owner: ReturnType<typeof getPlanBenefits>['creditOwner']) {
  if (owner === 'organization') return 'Organization';
  if (owner === 'contract') return 'Contract';
  return 'Personal account';
}

function getUsageSummary(workspace: BuilderWorkspace) {
  const pool = getUsageCenterPool({
    planId: workspace.plan,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
  });
  const total = pool.buckets.reduce((sum, bucket) => sum + bucket.limit, 0);
  const used = pool.buckets.reduce((sum, bucket) => sum + bucket.used, 0);
  const remaining = Math.max(total - used, 0);
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  return {
    total,
    used,
    remaining,
    percent,
    periodLabel: pool.periodLabel,
    periodStart: pool.periodStart,
    periodEnd: pool.periodEnd,
  };
}

function memberRowsForWorkspace(workspace: BuilderWorkspace) {
  if (workspace.id === 'seven-mi') {
    return [
      { name: 'Company Boss', email: 'owner@sevenmi.example', role: 'Owner', status: 'Active' },
      { name: USER_NAME, email: USER_EMAIL, role: WORKSPACE_ROLE_LABEL[workspace.role], status: 'Active' },
      { name: 'Aqara Field Admin', email: 'admin@sevenmi.example', role: 'Admin', status: 'Active' },
    ];
  }

  return [
    { name: USER_NAME, email: USER_EMAIL, role: WORKSPACE_ROLE_LABEL[workspace.role], status: 'Active' },
    { name: 'Mia Chen', email: 'mia.chen@example.com', role: 'Member', status: 'Active' },
    { name: 'Wei Zhang', email: 'wei.zhang@example.com', role: 'Project Manager', status: 'Active' },
  ];
}

function joinRequestsForWorkspace(workspace: BuilderWorkspace) {
  if (workspace.id === 'seven-mi') {
    return [
      { name: 'Alex Chen', email: 'alex.chen@example.com' },
      { name: 'Mia Wang', email: 'mia.wang@example.com' },
    ];
  }

  return [
    { name: 'Chris Lee', email: 'chris.lee@example.com' },
    { name: 'Nora Wu', email: 'nora.wu@example.com' },
  ];
}

function teamCodeForWorkspace(workspace: BuilderWorkspace) {
  const prefix = workspace.name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 4)
    .toUpperCase() || 'TEAM';
  return `${prefix}-4820`;
}
