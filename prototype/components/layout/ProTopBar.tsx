'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Check,
  ChevronDown,
  Home as HomeIcon,
  Plus,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RegionSwitcher } from './RegionSwitcher';
import {
  getActiveWorkspace,
  getWorkspaceHomeHref,
  getWorkspaces,
  setActiveWorkspace,
  subscribeWorkspaceChange,
  WORKSPACE_ROLE_LABEL,
  WORKSPACE_TYPE_LABEL,
  type BuilderWorkspace,
} from '@/lib/workspaces';
import { UsageQuotaButton } from '@/components/usage/UsageQuotaButton';
import { cn } from '@/lib/utils';

function verificationLabel(workspace: BuilderWorkspace) {
  if (workspace.verification === 'verified') return 'Verified';
  if (workspace.verification === 'pending') return 'Pending';
  return workspace.type === 'personal' ? 'Private' : 'Unverified';
}

function workspacePlanLabel(plan: BuilderWorkspace['plan']) {
  if (plan === 'enterprise') return 'Enterprise';
  if (plan === 'business') return 'Business';
  if (plan === 'pro') return 'Pro';
  return 'Free';
}

export function ProTopBar() {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspaceState] = useState<BuilderWorkspace>(() => getWorkspaces()[0]);
  const router = useRouter();
  const pathname = usePathname() ?? '/pro';
  const searchParams = useSearchParams();

  useEffect(() => {
    setActiveWorkspaceState(getActiveWorkspace());
    return subscribeWorkspaceChange(setActiveWorkspaceState);
  }, []);

  const workspaces = useMemo(() => getWorkspaces(), []);
  const personalWorkspaces = workspaces.filter(workspace => workspace.type === 'personal');
  const teamWorkspaces = workspaces.filter(workspace => workspace.type === 'team');

  const switchToUser = () => {
    setWorkspaceOpen(false);
    router.push('/home');
  };

  const selectWorkspace = (workspace: BuilderWorkspace) => {
    setActiveWorkspace(workspace.id);
    setActiveWorkspaceState(workspace);
    setWorkspaceOpen(false);
    const params = new URLSearchParams(searchParams?.toString());
    const isHomePath = pathname === '/pro' || pathname === '/pro/personal/home' || pathname.endsWith('/home');
    if (isHomePath) {
      params.delete('workspace');
      router.replace(`${getWorkspaceHomeHref(workspace)}${params.toString() ? `?${params.toString()}` : ''}`);
      return;
    }
    params.set('workspace', workspace.id);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-30 h-12 border-b border-border bg-bg-elevated/90 backdrop-blur-xl shadow-sm shadow-slate-300/60 dark:shadow-black/30 flex items-center px-4 gap-3">
      <div className="relative">
        <button
          type="button"
          data-tour="workspace"
          aria-haspopup="menu"
          aria-expanded={workspaceOpen}
          onClick={() => setWorkspaceOpen(open => !open)}
          className="group inline-flex h-9 min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-left transition hover:bg-bg-subtle focus:outline-none focus:ring-2 focus:ring-accent/25"
          title="Switch workspace"
        >
          <span className="min-w-0">
            <span className="block max-w-[190px] truncate text-sm font-semibold leading-tight text-text">
              {activeWorkspace.name}
            </span>
            <span className="hidden max-w-[190px] truncate text-[9px] leading-tight text-text-subtle opacity-80 sm:block">
              {WORKSPACE_TYPE_LABEL[activeWorkspace.type]} · {workspacePlanLabel(activeWorkspace.plan)}
            </span>
          </span>
          <ChevronDown
            size={13}
            className={cn('shrink-0 text-text-subtle opacity-70 transition group-hover:opacity-100', workspaceOpen && 'rotate-180 opacity-100')}
          />
        </button>

        <AnimatePresence>
          {workspaceOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setWorkspaceOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="absolute left-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-2xl shadow-slate-300/50 dark:shadow-black/40"
              >
                <div className="border-b border-border px-3 py-2.5">
                  <div className="text-sm font-semibold">Workspaces</div>
                </div>

                <div className="max-h-[320px] overflow-y-auto p-1.5">
                  <WorkspaceGroup title="Personal" workspaces={personalWorkspaces} activeId={activeWorkspace.id} onSelect={selectWorkspace} />
                  <WorkspaceGroup title="Team" workspaces={teamWorkspaces} activeId={activeWorkspace.id} onSelect={selectWorkspace} />
                </div>

                <div className="border-t border-border bg-bg-subtle p-1.5">
                  <Link
                    href="/pro/workspaces?new=1"
                    onClick={() => setWorkspaceOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-center text-xs font-medium text-text-muted transition hover:bg-bg-elevated hover:text-text"
                  >
                    <Plus size={13} />
                    Create Workspace
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden h-7 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-bg-subtle px-2.5 text-text-subtle md:flex">
        <Search size={13} />
        <span className="truncate text-xs">Search projects, leads, work orders, contracts...</span>
        <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[9px] text-text-subtle">⌘K</kbd>
      </div>

      <Link
        href="/pro/projects?new=1"
        className="hidden h-7 items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-2.5 text-xs font-medium text-accent transition hover:bg-accent/15 lg:inline-flex"
        title="Create new project"
      >
        <Plus size={13} />
        New
      </Link>

      <UsageQuotaButton
        compact
        planId={activeWorkspace.plan}
        workspaceId={activeWorkspace.id}
        workspaceName={activeWorkspace.name}
        workspaceType={activeWorkspace.type}
        workspaceRole={activeWorkspace.role}
        professional
      />

      <button
        className="relative flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg-elevated text-text-muted shadow-sm transition hover:bg-bg-subtle hover:text-text"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={13} />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
      </button>

      <button
        onClick={switchToUser}
        className="hidden h-7 items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-2.5 text-xs text-text-muted transition hover:bg-bg-subtle hover:text-text xl:inline-flex"
      >
        <HomeIcon size={13} />
        Community
      </button>

      <RegionSwitcher compact />
    </header>
  );
}

function WorkspaceGroup({
  title,
  workspaces,
  activeId,
  onSelect,
}: {
  title: string;
  workspaces: BuilderWorkspace[];
  activeId: string;
  onSelect: (workspace: BuilderWorkspace) => void;
}) {
  if (workspaces.length === 0) return null;

  return (
    <div className="mb-2 last:mb-0">
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-subtle">
        {title}
      </div>
      <div className="space-y-1">
        {workspaces.map(workspace => (
          <WorkspaceButton
            key={workspace.id}
            workspace={workspace}
            active={workspace.id === activeId}
            onSelect={() => onSelect(workspace)}
          />
        ))}
      </div>
    </div>
  );
}

function WorkspaceButton({
  workspace,
  active,
  onSelect,
}: {
  workspace: BuilderWorkspace;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon: LucideIcon = workspace.icon;

  return (
    <button
      onClick={onSelect}
      className="w-full rounded-lg px-2.5 py-2.5 text-left transition hover:bg-bg-subtle data-[active=true]:bg-accent/10 data-[active=true]:ring-1 data-[active=true]:ring-accent/25"
      data-active={active}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-bg-subtle text-text-muted">
          <Icon size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-text">{workspace.name}</span>
            {active && <Check size={12} className="text-success" />}
            {workspace.verification === 'verified' && <ShieldCheck size={11} className="text-amber-500" />}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-text-muted">
            <span>{WORKSPACE_TYPE_LABEL[workspace.type]}</span>
            <span className="text-text-subtle">·</span>
            <span>{WORKSPACE_ROLE_LABEL[workspace.role]}</span>
            <span className="text-text-subtle">·</span>
            <span>{workspacePlanLabel(workspace.plan)}</span>
          </span>
        </span>
        <span className="flex items-center">
          <span className={cn(
            'rounded-full border px-1.5 py-0.5 text-[9px]',
            workspace.verification === 'verified'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-600'
              : 'border-border bg-bg-subtle text-text-muted'
          )}>
            {verificationLabel(workspace)}
          </span>
        </span>
      </div>
    </button>
  );
}
