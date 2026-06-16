'use client';

import {
  Building2,
  Home,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type WorkspaceType = 'personal' | 'team';
export type PersonalWorkspacePlan = 'free' | 'pro';
export type TeamWorkspacePlan = 'business' | 'enterprise';
export type WorkspacePlan = PersonalWorkspacePlan | TeamWorkspacePlan;
export type WorkspaceRole = 'owner' | 'admin' | 'billing_admin' | 'project_manager' | 'member' | 'viewer';
export type WorkspaceVerification = 'none' | 'pending' | 'verified';

export interface BuilderWorkspace {
  id: string;
  name: string;
  type: WorkspaceType;
  role: WorkspaceRole;
  plan: WorkspacePlan;
  credits: string;
  labels: string[];
  verification: WorkspaceVerification;
  description: string;
  ownerLabel: string;
  icon: LucideIcon;
  billingPolicy?: 'aqara_subsidized' | 'contract' | 'standard';
}

const ACTIVE_WORKSPACE_KEY = 'aqara:builder-pro:active-workspace';
const ONBOARDING_TEAM_WORKSPACE_KEY = 'aqara:builder-pro:onboarding-team-workspace';
const DELETED_WORKSPACE_IDS_KEY = 'aqara:builder-pro:deleted-workspace-ids';

export const WORKSPACE_ROLE_LABEL: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  billing_admin: 'Billing Admin',
  project_manager: 'Project Manager',
  member: 'Member',
  viewer: 'Viewer',
};

export const WORKSPACE_PLAN_LABEL: Record<WorkspacePlan, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
};

export const WORKSPACE_TYPE_LABEL: Record<WorkspaceType, string> = {
  personal: 'Personal Workspace',
  team: 'Team Workspace',
};

export const BUILDER_WORKSPACES: BuilderWorkspace[] = [
  {
    id: 'personal',
    name: 'Personal',
    type: 'personal',
    role: 'owner',
    plan: 'free',
    credits: 'Basic',
    labels: ['Personal'],
    verification: 'none',
    description: '个人项目与私有创作。',
    ownerLabel: 'Jun',
    icon: Home,
  },
  {
    id: 'design-studio',
    name: 'Design Studio',
    type: 'team',
    role: 'owner',
    plan: 'business',
    credits: '4,600',
    labels: ['Team'],
    verification: 'none',
    description: '团队项目与成员协作。',
    ownerLabel: 'Organization',
    icon: Users,
  },
  {
    id: 'seven-mi',
    name: 'Seven Mi Co., Ltd',
    type: 'team',
    role: 'member',
    plan: 'enterprise',
    credits: 'Contract',
    labels: ['Aqara Space'],
    verification: 'verified',
    description: '服务商门店项目与服务。',
    ownerLabel: 'Organization',
    icon: Building2,
    billingPolicy: 'aqara_subsidized',
  },
];

type StoredTeamWorkspace = {
  id: string;
  name: string;
  plan: TeamWorkspacePlan | 'team';
};

function normalizeWorkspaceName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function readDeletedWorkspaceIds() {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = localStorage.getItem(DELETED_WORKSPACE_IDS_KEY);
    const ids = raw ? JSON.parse(raw) as string[] : [];
    return new Set(ids.filter(Boolean));
  } catch {
    return new Set<string>();
  }
}

function writeDeletedWorkspaceIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DELETED_WORKSPACE_IDS_KEY, JSON.stringify([...ids]));
}

function removeDeletedWorkspaceId(id: string) {
  if (typeof window === 'undefined') return;
  const deletedIds = readDeletedWorkspaceIds();
  if (!deletedIds.delete(id)) return;
  writeDeletedWorkspaceIds(deletedIds);
}

function readOnboardingTeamWorkspace(): BuilderWorkspace | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_TEAM_WORKSPACE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredTeamWorkspace;
    const normalizedPlan = normalizeTeamWorkspacePlan(stored.plan);
    if (!stored.id || !stored.name || !normalizedPlan) return null;
    const existing = BUILDER_WORKSPACES.find(workspace =>
      workspace.type === 'team' &&
      normalizeWorkspaceName(workspace.name) === normalizeWorkspaceName(stored.name)
    );
    if (existing && existing.id !== stored.id) {
      localStorage.removeItem(ONBOARDING_TEAM_WORKSPACE_KEY);
      return null;
    }
    return {
      id: stored.id,
      name: stored.name,
      type: 'team',
      role: 'owner',
      plan: normalizedPlan,
      credits: normalizedPlan === 'enterprise' ? 'Contract' : '4,600',
      labels: ['Team'],
      verification: 'none',
      description: '团队项目与成员协作。',
      ownerLabel: 'Organization',
      icon: Users,
    };
  } catch {
    return null;
  }
}

export function getWorkspaces(): BuilderWorkspace[] {
  const onboardingTeamWorkspace = readOnboardingTeamWorkspace();
  const deletedIds = readDeletedWorkspaceIds();
  const isVisible = (workspace: BuilderWorkspace) => workspace.type === 'personal' || !deletedIds.has(workspace.id);
  if (!onboardingTeamWorkspace) return BUILDER_WORKSPACES.filter(isVisible);
  const onboardingName = normalizeWorkspaceName(onboardingTeamWorkspace.name);
  return [
    ...BUILDER_WORKSPACES.filter(workspace => {
      const sameId = workspace.id === onboardingTeamWorkspace.id;
      const sameTeamName = workspace.type === onboardingTeamWorkspace.type && normalizeWorkspaceName(workspace.name) === onboardingName;
      return !sameId && !sameTeamName;
    }),
    onboardingTeamWorkspace,
  ].filter((workspace, index, items) => {
    const duplicateIndex = items.findIndex(item =>
      item.type === workspace.type &&
      normalizeWorkspaceName(item.name) === normalizeWorkspaceName(workspace.name)
    );
    return duplicateIndex === index;
  }).filter(isVisible);
}

export function getWorkspace(id: string | null | undefined): BuilderWorkspace | undefined {
  if (!id) return undefined;
  return getWorkspaces().find(workspace => workspace.id === id);
}

function slugifyWorkspacePathSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'workspace';
}

export function getWorkspaceOrganizationName(workspace: BuilderWorkspace) {
  if (workspace.type === 'personal') return 'personal';
  return workspace.name;
}

export function getWorkspaceHomeHref(workspace: BuilderWorkspace) {
  if (workspace.type === 'personal') return '/pro/personal/home';
  const organizationSlug = slugifyWorkspacePathSegment(getWorkspaceOrganizationName(workspace));
  const workspaceSlug = slugifyWorkspacePathSegment(workspace.name);
  return `/pro/${organizationSlug}/${workspaceSlug}/home`;
}

export function getWorkspaceFromProPath(pathname: string | null | undefined) {
  if (!pathname) return undefined;
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/pro/personal/home') return getWorkspace('personal');
  return getWorkspaces().find(workspace => workspace.type === 'team' && normalizedPath === getWorkspaceHomeHref(workspace));
}

export function getActiveWorkspace(): BuilderWorkspace {
  if (typeof window === 'undefined') return getWorkspaces()[0];
  return getWorkspace(getActiveWorkspaceId()) ?? getWorkspaces()[0];
}

export function getActiveWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
}

export function setActiveWorkspace(id: string) {
  if (typeof window === 'undefined') return;
  const workspace = getWorkspace(id);
  if (!workspace) return;
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace.id);
  window.dispatchEvent(new CustomEvent<BuilderWorkspace>('aqara:workspace-change', { detail: workspace }));
}

export function saveOnboardingTeamWorkspace(input: { name: string; plan: TeamWorkspacePlan }) {
  if (typeof window === 'undefined') return null;
  const name = input.name.trim() || 'Team Workspace';
  const existing = BUILDER_WORKSPACES.find(workspace =>
    workspace.type === 'team' &&
    normalizeWorkspaceName(workspace.name) === normalizeWorkspaceName(name)
  );
  if (existing) {
    localStorage.removeItem(ONBOARDING_TEAM_WORKSPACE_KEY);
    removeDeletedWorkspaceId(existing.id);
    return existing.id;
  }
  const workspace: StoredTeamWorkspace = {
    id: 'onboarding-team',
    name,
    plan: input.plan,
  };
  removeDeletedWorkspaceId(workspace.id);
  localStorage.setItem(ONBOARDING_TEAM_WORKSPACE_KEY, JSON.stringify(workspace));
  return workspace.id;
}

export function canDeleteWorkspace(workspace: BuilderWorkspace) {
  return workspace.type !== 'personal' && workspace.role === 'owner';
}

export function canLeaveWorkspace(workspace: BuilderWorkspace) {
  return workspace.type !== 'personal' && workspace.role !== 'owner';
}

export function deleteWorkspace(id: string) {
  if (typeof window === 'undefined') return false;
  const workspace = getWorkspace(id);
  if (!workspace || !canDeleteWorkspace(workspace)) return false;

  const deletedIds = readDeletedWorkspaceIds();
  deletedIds.add(workspace.id);
  writeDeletedWorkspaceIds(deletedIds);

  if (workspace.id === 'onboarding-team') {
    localStorage.removeItem(ONBOARDING_TEAM_WORKSPACE_KEY);
  }

  let nextWorkspace = getActiveWorkspace();
  if (getActiveWorkspaceId() === workspace.id) {
    nextWorkspace = getWorkspace('personal') ?? getWorkspaces()[0];
    if (nextWorkspace) {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, nextWorkspace.id);
    }
  }

  if (nextWorkspace) {
    window.dispatchEvent(new CustomEvent<BuilderWorkspace>('aqara:workspace-change', { detail: nextWorkspace }));
  }
  return true;
}

export function leaveWorkspace(id: string) {
  if (typeof window === 'undefined') return false;
  const workspace = getWorkspace(id);
  if (!workspace || !canLeaveWorkspace(workspace)) return false;

  const deletedIds = readDeletedWorkspaceIds();
  deletedIds.add(workspace.id);
  writeDeletedWorkspaceIds(deletedIds);

  let nextWorkspace = getActiveWorkspace();
  if (getActiveWorkspaceId() === workspace.id) {
    nextWorkspace = getWorkspace('personal') ?? getWorkspaces()[0];
    if (nextWorkspace) {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, nextWorkspace.id);
    }
  }

  if (nextWorkspace) {
    window.dispatchEvent(new CustomEvent<BuilderWorkspace>('aqara:workspace-change', { detail: nextWorkspace }));
  }
  return true;
}

export function subscribeWorkspaceChange(callback: (workspace: BuilderWorkspace) => void) {
  if (typeof window === 'undefined') return () => {};
  const onChange = (event: Event) => {
    if (event instanceof CustomEvent && event.detail?.id) {
      callback(event.detail as BuilderWorkspace);
      return;
    }
    callback(getActiveWorkspace());
  };
  window.addEventListener('aqara:workspace-change', onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener('aqara:workspace-change', onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function isTeamWorkspacePlan(plan: WorkspacePlan): plan is TeamWorkspacePlan {
  return plan === 'business' || plan === 'enterprise';
}

function normalizeTeamWorkspacePlan(plan: string | null | undefined): TeamWorkspacePlan | null {
  if (plan === 'business' || plan === 'team') return 'business';
  if (plan === 'enterprise') return 'enterprise';
  return null;
}
