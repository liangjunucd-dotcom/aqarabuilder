import {
  getAllProjects,
  MyProjects,
  PROJECT_DEFAULT_STUDIO,
  resolveProjectStudioId,
  type Project,
} from './projects';
import { ProManagedStudios, type ProManagedStudio } from './studios';

export type ProjectSiteTopology = 'home' | 'building' | 'portfolio';

export interface ProjectSiteBinding {
  projectId: string;
  topology: ProjectSiteTopology;
  sites: Array<{
    workspaceId: string;
    studioIds: string[];
  }>;
}

export const PROJECT_SITE_TOPOLOGY_META: Record<ProjectSiteTopology, { label: string; description: string }> = {
  home: { label: '家庭项目', description: '一个项目 · 一个 Space · 通常一台 Studio' },
  building: { label: '楼宇项目', description: '一个项目 · 一个 Space · 多台 Studio' },
  portfolio: { label: '多站点项目', description: '一个项目 · 多个 Space · 每个 Space 可多台 Studio' },
};

export const PROJECT_SITE_BINDINGS: ProjectSiteBinding[] = [
  { projectId: 'proj-lixs', topology: 'home', sites: [{ workspaceId: 'ws-customer-li', studioIds: ['aq-li-001'] }] },
  { projectId: 'proj-wang-villa', topology: 'home', sites: [{ workspaceId: 'ws-customer-wang-villa', studioIds: ['aq-wang-villa'] }] },
  { projectId: 'proj-rental', topology: 'building', sites: [{ workspaceId: 'ws-rental', studioIds: ['aq-zhao-rental-1', 'aq-zhao-rental-2'] }] },
  { projectId: 'proj-wu-garden', topology: 'home', sites: [{ workspaceId: 'ws-customer-wu-villa', studioIds: ['aq-wu-villa'] }] },
  { projectId: 'proj-zhang-elder', topology: 'home', sites: [{ workspaceId: 'ws-zhang-eldercare', studioIds: ['aq-eldercare-zhang'] }] },
  { projectId: 'proj-eu-villa', topology: 'home', sites: [{ workspaceId: 'ws-operator-demo', studioIds: ['aq-operator-demo'] }] },
  { projectId: 'proj-chen-aftercare', topology: 'home', sites: [{ workspaceId: 'ws-customer-chen', studioIds: ['aq-chen-family'] }] },
  { projectId: 'proj-liu-aftercare', topology: 'home', sites: [{ workspaceId: 'ws-customer-liu', studioIds: ['aq-liu-family'] }] },
];

const PROJECT_SITE_IDS = PROJECT_SITE_BINDINGS.map(binding => binding.projectId);

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return [...new Map(items.map(item => [item.id, item])).values()];
}

function findManagedStudio(studioId: string | null | undefined): ProManagedStudio | undefined {
  if (!studioId) return undefined;
  return ProManagedStudios.find(studio => studio.id === studioId);
}

function bindingForProject(projectId: string): ProjectSiteBinding | undefined {
  return PROJECT_SITE_BINDINGS.find(binding => binding.projectId === projectId);
}

function fallbackSiteBinding(project: Project): ProjectSiteBinding | null {
  const studioId = resolveProjectStudioId(project) ?? project.linkedStudioId ?? PROJECT_DEFAULT_STUDIO[project.id];
  const studio = findManagedStudio(studioId);
  if (!studio) return null;
  return {
    projectId: project.id,
    topology: 'home',
    sites: [{ workspaceId: studio.workspaceId, studioIds: [studio.id] }],
  };
}

export function getProjectSiteBinding(project: Project): ProjectSiteBinding | null {
  return bindingForProject(project.id) ?? fallbackSiteBinding(project);
}

export function getProjectSiteTopology(project: Project): ProjectSiteTopology {
  return getProjectSiteBinding(project)?.topology ?? 'home';
}

export function getProjectSiteStudioIds(project: Project): string[] {
  const binding = getProjectSiteBinding(project);
  if (!binding) return [];
  return [...new Set(binding.sites.flatMap(site => site.studioIds))].filter(studioId => !!findManagedStudio(studioId));
}

export function getProjectSiteWorkspaceIds(project: Project): string[] {
  const binding = getProjectSiteBinding(project);
  if (!binding) return [];
  return [...new Set(binding.sites.map(site => site.workspaceId))];
}

export function getProjectSiteProjects(): Project[] {
  const siteSeedProjects = MyProjects.filter(project => PROJECT_SITE_IDS.includes(project.id));
  const currentProjects = getAllProjects().filter(project => project.visibility !== 'verified' && project.phase !== 'cancelled');
  return uniqueById([...siteSeedProjects, ...currentProjects]).filter(project => {
    if (project.visibility === 'verified' || project.phase === 'cancelled') return false;
    return getProjectSiteStudioIds(project).length > 0;
  });
}
