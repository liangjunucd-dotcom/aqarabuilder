'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BadgeCheck,
  Building2,
  FileCheck2,
  Globe2,
  Link2,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Tag,
  UserRound,
  Users,
} from 'lucide-react';
import {
  getActiveWorkspace,
  getWorkspace,
  setActiveWorkspace as persistActiveWorkspace,
  subscribeWorkspaceChange,
  WORKSPACE_PLAN_LABEL,
  WORKSPACE_ROLE_LABEL,
  type WorkspaceRole,
  type BuilderWorkspace,
} from '@/lib/workspaces';
import { cn } from '@/lib/utils';

type TabKey = 'overview' | 'members' | 'credentials' | 'programs';

const TABS: { id: TabKey; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'members', label: 'Members' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'programs', label: 'Programs' },
];

type CompanyRecord = {
  name: string;
  profileStatus: 'basic' | 'complete';
  verificationStatus: 'none' | 'pending' | 'verified';
  labels: string[];
  programs: { code: string; label: string; status: 'active' | 'pending' }[];
  serviceArea: string;
  website?: string;
  workspaceName: string;
};

const MEMBERS = [
  { name: 'Jun Liang', email: 'jun@aqara.dev', role: 'Owner', status: 'Active' },
  { name: 'Wei Zhang', email: 'wei@aqara.dev', role: 'Admin', status: 'Active' },
  { name: 'Fang Liu', email: 'fang@aqara.dev', role: 'Member', status: 'Active' },
];

const CREDENTIALS = [
  { label: 'Certified Installer', owner: 'Jun Liang', status: 'Verified' },
  { label: 'Matter Pro', owner: 'Wei Zhang', status: 'Verified' },
  { label: 'Project Delivery Training', owner: 'Team', status: 'Active' },
];

const JOIN_REQUESTS = [
  { name: 'Alex Chen', email: 'alex.chen@example.com', requestedWorkspace: 'Seven Mi Co., Ltd', requestedAt: 'Today' },
  { name: 'Mia Wang', email: 'mia.wang@example.com', requestedWorkspace: 'Seven Mi Co., Ltd', requestedAt: 'Yesterday' },
];

function CompanyPageContent() {
  const [workspace, setWorkspace] = useState<BuilderWorkspace | null>(null);
  const [tab, setTab] = useState<TabKey>('overview');
  const searchParams = useSearchParams();

  useEffect(() => {
    const workspaceId = searchParams?.get('workspace');
    const queryTab = searchParams?.get('tab');
    if (queryTab === 'overview' || queryTab === 'members' || queryTab === 'credentials' || queryTab === 'programs') {
      setTab(queryTab);
    }
    const queryWorkspace = getWorkspace(workspaceId);
    if (queryWorkspace) {
      persistActiveWorkspace(queryWorkspace.id);
      setWorkspace(queryWorkspace);
    } else {
      setWorkspace(getActiveWorkspace());
    }
    return subscribeWorkspaceChange(setWorkspace);
  }, [searchParams]);

  const company = useMemo(() => workspace ? resolveCompany(workspace) : null, [workspace]);
  const canManageCompany = workspace ? canManageCompanyRole(workspace.role) : false;

  const initials = useMemo(() => {
    const name = company?.name ?? 'Company';
    return name
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [company?.name]);

  return (
    <main className="h-full overflow-y-auto bg-[#f7f7f6] px-5 py-5 text-[#222]">
      <h1 className="text-2xl font-semibold tracking-tight">Company</h1>

      <div className="mt-5 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-[#d9d6d1] bg-white p-3">
          <div className="mb-5 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#85ff69] text-sm font-semibold text-[#111]">
              {workspace?.type === 'personal' ? 'P' : initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{company?.name ?? 'No Company'}</div>
              <div className="truncate text-xs text-[#777]">
                {workspace?.type === 'personal' ? 'Personal workspace' : 'Company profile'}
              </div>
            </div>
          </div>

          <SideSection title="Company">
            <SideItem active={tab === 'overview'} icon={Building2} label="Overview" onClick={() => setTab('overview')} />
            <SideItem icon={Tag} label="Labels" />
            <SideItem icon={ShieldCheck} label="Verification" />
            <SideItem icon={MapPin} label="Service Area" />
          </SideSection>

          <SideSection title="Team">
            <SideItem active={tab === 'members'} icon={Users} label="Members" onClick={() => setTab('members')} />
            <SideItem icon={Link2} label="Join Requests" onClick={() => setTab('members')} />
          </SideSection>

          <SideSection title="Business">
            <SideItem active={tab === 'programs'} icon={BadgeCheck} label="Programs" onClick={() => setTab('programs')} />
            <SideItem icon={Package} label="Catalog" onClick={() => setTab('programs')} />
          </SideSection>

          <SideSection title="User">
            <SideItem icon={UserRound} label="User Settings" href="/pro/settings?tab=general" />
            <SideItem icon={Settings} label="My Workspaces" href="/pro/workspaces" />
          </SideSection>
        </aside>

        <section className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {TABS.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  'h-9 rounded-full px-4 text-xs font-semibold transition',
                  tab === item.id ? 'bg-[#151515] text-white' : 'bg-white text-[#333] hover:bg-[#ece9e4]',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {!workspace || !company ? (
            <PersonalCompanyEmpty />
          ) : (
            <>
              {tab === 'overview' && <Overview workspace={workspace} company={company} canManageCompany={canManageCompany} />}
              {tab === 'members' && <Members canManageCompany={canManageCompany} />}
              {tab === 'credentials' && <Credentials />}
              {tab === 'programs' && <Programs company={company} canManageCompany={canManageCompany} />}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function CompanyPage() {
  return (
    <Suspense fallback={null}>
      <CompanyPageContent />
    </Suspense>
  );
}

function canManageCompanyRole(role: WorkspaceRole) {
  return role === 'owner' || role === 'admin' || role === 'billing_admin';
}

function resolveCompany(workspace: BuilderWorkspace): CompanyRecord | null {
  if (workspace.type === 'personal') return null;

  const isAqaraSpace = workspace.labels.some(label => label.toLowerCase().includes('aqara'));
  const isVerified = workspace.verification === 'verified';

  return {
    name: workspace.name === 'Seven Mi Co., Ltd' ? 'Seven Mi Co., Ltd' : workspace.name,
    profileStatus: isVerified ? 'complete' : 'basic',
    verificationStatus: workspace.verification,
    labels: isAqaraSpace
      ? ['Service Provider', 'Aqara Space', 'Installation']
      : ['Design', 'Installation'],
    programs: isAqaraSpace
      ? [{ code: 'aqara_space', label: 'Aqara Space Program', status: 'active' }]
      : [],
    serviceArea: isAqaraSpace ? 'Shenzhen · Guangdong' : 'Shanghai · China',
    website: isVerified ? 'company.example' : undefined,
    workspaceName: workspace.name,
  };
}

function PersonalCompanyEmpty() {
  return (
    <div className="mt-3">
      <Panel title="No Company Attached">
        <div className="max-w-2xl text-sm leading-6 text-[#555]">
          Personal workspace does not have a Company object. Create or join a Team Workspace to manage company profile, members, credentials, service area, and programs.
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/pro/workspaces?new=1" className="inline-flex h-9 items-center rounded-md bg-[#151515] px-4 text-sm font-semibold text-white">
            Create Team Workspace
          </Link>
          <Link href="/pro/workspaces" className="inline-flex h-9 items-center rounded-md border border-[#d9d6d1] bg-white px-4 text-sm font-semibold text-[#333]">
            My Workspaces
          </Link>
        </div>
      </Panel>
    </div>
  );
}

function Overview({
  workspace,
  company,
  canManageCompany,
}: {
  workspace: BuilderWorkspace;
  company: CompanyRecord;
  canManageCompany: boolean;
}) {
  return (
    <div className="mt-3 space-y-3">
      <Panel title="Company Profile">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[#555]">
            {canManageCompany ? 'You can manage company profile, members, credentials, and programs.' : 'You can view company profile and credentials. Management actions are limited to owners and admins.'}
          </div>
          {canManageCompany && (
            <button className="inline-flex h-8 items-center rounded-md bg-[#151515] px-3 text-xs font-semibold text-white">
              Edit Company
            </button>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Company" value={company.name} />
          <Metric label="Profile Status" value={company.profileStatus === 'complete' ? 'Complete' : 'Basic'} />
          <Metric label="Verification" value={company.verificationStatus === 'verified' ? 'Verified' : 'Unverified'} />
        </div>
      </Panel>

      <Panel title="Company Labels">
        <div className="flex flex-wrap gap-2">
          {company.labels.map(label => (
            <span key={label} className="rounded-full border border-[#d9d6d1] bg-[#faf9f7] px-3 py-1 text-xs font-medium text-[#333]">
              {label}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Current Team Workspace">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Workspace" value={company.workspaceName} />
          <Metric label="My Role" value={WORKSPACE_ROLE_LABEL[workspace.role]} />
          <Metric label="Access" value={canManageCompany ? 'Manage' : 'View only'} />
          <Metric label="Plan" value={WORKSPACE_PLAN_LABEL[workspace.plan]} />
        </div>
      </Panel>

      <Panel title="Company Boundary">
        <table className="w-full text-sm">
          <tbody>
            <BoundaryRow label="Company manages" value="company profile, members, credentials, service area, programs, catalog" />
            <BoundaryRow label="Workspace manages" value="projects, credits, plan, ledger, project Spaces and Studios" />
            <BoundaryRow label="Switcher behavior" value="Workspace Switcher only changes current work container" />
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Members({ canManageCompany }: { canManageCompany: boolean }) {
  return (
    <div className="mt-3 space-y-3">
      <Panel title="Join Requests">
        <div className="mb-4 text-sm text-[#555]">
          {canManageCompany ? 'People who searched your Team Code and requested to join the company.' : 'Join requests are managed by company owners and admins.'}
        </div>
        {canManageCompany ? (
          <table className="w-full text-sm">
            <thead className="text-xs font-medium text-[#666]">
              <tr className="border-b border-[#d9d6d1]">
                <th className="py-2 text-left">Requester</th>
                <th className="py-2 text-left">Workspace Access</th>
                <th className="py-2 text-left">Requested</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {JOIN_REQUESTS.map(request => (
                <tr key={request.email} className="border-b border-[#e4e1dc] last:border-0">
                  <td className="py-3">
                    <div className="font-medium text-[#222]">{request.name}</div>
                    <div className="text-xs text-[#777]">{request.email}</div>
                  </td>
                  <td className="py-3 text-[#555]">{request.requestedWorkspace}</td>
                  <td className="py-3 text-[#555]">{request.requestedAt}</td>
                  <td className="py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button className="h-8 rounded-md bg-[#151515] px-3 text-xs font-semibold text-white">Approve</button>
                      <button className="h-8 rounded-md border border-[#d9d6d1] bg-white px-3 text-xs font-semibold text-[#555]">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="rounded-lg border border-[#e4e1dc] bg-[#faf9f7] p-3 text-sm text-[#555]">
            You can view members, but cannot approve join requests.
          </div>
        )}
      </Panel>

      <Panel title="Members">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[#555]">
            {canManageCompany ? 'Manage company roles and review access. New members are invited from the Workspace they will join.' : 'Members are visible. Role changes require owner or admin access.'}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs font-medium text-[#666]">
            <tr className="border-b border-[#d9d6d1]">
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Email</th>
              <th className="py-2 text-left">Role</th>
              <th className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map(member => (
              <tr key={member.email} className="border-b border-[#e4e1dc] last:border-0">
                <td className="py-3 font-medium text-[#222]">{member.name}</td>
                <td className="py-3 text-[#555]">{member.email}</td>
                <td className="py-3 text-[#555]">{member.role}</td>
                <td className="py-3 text-right text-[#555]">{member.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Credentials() {
  return (
    <div className="mt-3">
      <Panel title="Credentials">
        <table className="w-full text-sm">
          <thead className="text-xs font-medium text-[#666]">
            <tr className="border-b border-[#d9d6d1]">
              <th className="py-2 text-left">Credential</th>
              <th className="py-2 text-left">Owner</th>
              <th className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {CREDENTIALS.map(row => (
              <tr key={row.label} className="border-b border-[#e4e1dc] last:border-0">
                <td className="py-3 font-medium text-[#222]">{row.label}</td>
                <td className="py-3 text-[#555]">{row.owner}</td>
                <td className="py-3 text-right text-[#555]">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Programs({ company, canManageCompany }: { company: CompanyRecord; canManageCompany: boolean }) {
  return (
    <div className="mt-3 space-y-3">
      <Panel title="Official Programs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[#555]">
            {canManageCompany ? 'Official programs are granted by Aqara and managed with company verification.' : 'Program details are read-only for members.'}
          </div>
          {canManageCompany && company.programs.length === 0 && (
            <button className="inline-flex h-8 items-center rounded-md border border-[#d9d6d1] bg-white px-3 text-xs font-semibold text-[#333]">
              Apply Program
            </button>
          )}
        </div>
        {company.programs.length > 0 ? (
          <div className="space-y-2">
            {company.programs.map(program => (
              <div key={program.code} className="flex items-center justify-between rounded-lg border border-[#e4e1dc] bg-[#faf9f7] px-3 py-2 text-sm">
                <span className="font-medium">{program.label}</span>
                <span className="text-xs text-emerald-700">{program.status === 'active' ? 'Active' : 'Pending'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[#555]">No official program attached.</div>
        )}
      </Panel>

      <Panel title="Service Catalog">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Remote Design" value="Available" />
          <Metric label="On-site Delivery" value="Available" />
          <Metric label="After-care" value="Draft" />
        </div>
      </Panel>
    </div>
  );
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 px-2 text-xs font-semibold text-[#222]">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SideItem({
  label,
  icon: Icon,
  href,
  active = false,
  onClick,
}: {
  label: string;
  icon: typeof Building2;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Icon size={14} className={active ? 'text-[#111]' : 'text-[#777]'} />
      <span>{label}</span>
    </>
  );
  const className = cn(
    'flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm transition',
    active ? 'bg-[#e5e2dd] font-medium text-[#222]' : 'text-[#444] hover:bg-[#f1efeb]',
  );

  if (href) {
    return <Link href={href} className={className}>{content}</Link>;
  }

  return <button className={className} type="button" onClick={onClick}>{content}</button>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[#d9d6d1] bg-white p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
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

function BoundaryRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-[#e4e1dc] last:border-0">
      <td className="w-44 py-2 pr-4 text-[#777]">{label}</td>
      <td className="py-2 text-[#333]">{value}</td>
    </tr>
  );
}
