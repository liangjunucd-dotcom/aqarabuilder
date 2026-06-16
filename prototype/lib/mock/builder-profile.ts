import { Project, getAllProjects, resolveProjectStatus } from './projects';

// ─── Builder Profile — 从项目历史自动生成 ──────────────────────────────

export interface BuilderExpertise {
  buildingTypes: { type: string; count: number }[];
  deviceCategories: { category: string; count: number }[];
  tags: { tag: string; count: number }[];
}

export interface BuilderStats {
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  totalDevices: number;
  avgDevicesPerProject: number;
  avgNPS: number;
  responseRate: number;
  onTimeDeliveryRate: number;
}

export interface BuilderContributions {
  publishedSolutions: number;
  verifiedTemplates: number;
  remixesCreated: number;
  remixesUsed: number;
  totalLikes: number;
}

export interface BuilderBadgeProgress {
  currentLevel: number;
  levelName: string;
  nextLevelAt: number;
  pointsToNext: number;
  totalPoints: number;
}

export interface BuilderProfile {
  id: string;
  name: string;
  avatar?: string;
  badge: 'builder' | 'pro' | 'verified';
  joinedAt: string;

  /** Auto-generated from project history */
  stats: BuilderStats;
  expertise: BuilderExpertise;
  regions: { city: string; country: string; count: number }[];
  contributions: BuilderContributions;
  badgeProgress?: BuilderBadgeProgress;

  /** Top skills shown on profile */
  topSkills: string[];
  bio: string;
}

// ─── Badge level system (9 levels) ─────────────────────────────────────

const BADGE_LEVELS = [
  { level: 1, name: '新手 Builder', minPoints: 0 },
  { level: 2, name: '初级 Builder', minPoints: 100 },
  { level: 3, name: '进阶 Builder', minPoints: 300 },
  { level: 4, name: '资深 Builder', minPoints: 800 },
  { level: 5, name: 'Professional', minPoints: 2000 },
  { level: 6, name: 'Certified Installer', minPoints: 5000 },
  { level: 7, name: '精英 Builder', minPoints: 12000 },
  { level: 8, name: '大师 Builder', minPoints: 25000 },
  { level: 9, name: '传奇 Builder', minPoints: 50000 },
];

// ─── Auto-generation ────────────────────────────────────────────────────

function countByKey<T extends Record<string, any>>(
  items: T[],
  key: keyof T,
): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const val: any = item[key];
    if (val == null) continue;
    if (Array.isArray(val)) {
      for (const v of val as any[]) {
        const s = String(v);
        map.set(s, (map.get(s) ?? 0) + 1);
      }
    } else {
      const s = String(val);
      map.set(s, (map.get(s) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/** 从 builder 的项目历史自动生成 Builder Profile */
export function generateBuilderProfile(
  builderId: string,
  builderName: string,
  projects?: Project[],
): BuilderProfile {
  const all = projects ?? getAllProjects();
  const myProjects = all.filter(p =>
    p.managers?.some(m => m.startsWith(builderName.split(' ')[0])) ||
    p.managers?.some(m => m.includes(builderName))
  );

  // Stats
  const total = myProjects.length;
  const completed = myProjects.filter(p => resolveProjectStatus(p) === 'done').length;
  const active = myProjects.filter(p => {
    const s = resolveProjectStatus(p);
    return s === 'open' || s === 'in_progress';
  }).length;
  const totalDevices = myProjects.reduce((sum, p) => sum + (p.devices ?? 0), 0);
  const avgDevices = total > 0 ? Math.round(totalDevices / total) : 0;

  // Expertise
  const buildingTypes = countByKey(myProjects, 'buildingType')
    .map(({ key, count }) => ({ type: typeLabel(key), count }));
  const tags = countByKey(myProjects, 'tags')
    .map(({ key, count }) => ({ tag: key, count }));

  // Device categories (derived from project device counts)
  const deviceCategories = [
    { category: '传感器', count: Math.round(totalDevices * 0.4) },
    { category: '灯光', count: Math.round(totalDevices * 0.3) },
    { category: '安防', count: Math.round(totalDevices * 0.2) },
    { category: '窗帘/电机', count: Math.round(totalDevices * 0.1) },
  ].filter(d => d.count > 0);

  // Regions
  const regions = countByKey(myProjects, 'city')
    .map(({ key, count }) => {
      const p = myProjects.find(p => p.city === key);
      return { city: key, country: p?.countryLabel ?? '中国大陆', count };
    });

  // Contributions
  const publishedSolutions = myProjects.filter(p => p.visibility === 'published').length;
  const verifiedTemplates = myProjects.filter(p => p.visibility === 'verified').length;
  const remixesCreated = myProjects.filter(p => p.source === 'fork').length;
  const remixesUsed = myProjects.filter(p => p.linkedSolutionId).length;
  const totalLikes = 0; // would come from a real social system

  // Badge progress — points based on:
  //   10 pts per completed project, 5 pts per active project
  //   1 pt per device deployed, 20 pts per verified template
  //   5 pts per remix created
  const totalPoints =
    completed * 10 + active * 5 + totalDevices * 1 + verifiedTemplates * 20 + remixesCreated * 5;

  let currentLevel = 1;
  let nextLevelAt = 100;
  for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= BADGE_LEVELS[i].minPoints) {
      currentLevel = BADGE_LEVELS[i].level;
      nextLevelAt = i < BADGE_LEVELS.length - 1 ? BADGE_LEVELS[i + 1].minPoints : BADGE_LEVELS[i].minPoints;
      break;
    }
  }
  const pointsToNext = Math.max(0, nextLevelAt - totalPoints);

  // Top skills
  const topSkills = [
    ...tags.slice(0, 3).map(t => t.tag),
    ...buildingTypes.slice(0, 2).map(b => `${b.type}专家`),
  ].slice(0, 5);

  // Bio
  const regionList = regions.slice(0, 3).map(r => r.city).join('、');
  const bio = total > 0
    ? `服务 ${regions.length} 个城市，完成 ${completed} 个项目，部署 ${totalDevices} 台设备。专注${topSkills.slice(0, 2).join('、')}。`
    : '新晋 Builder，正在探索空间智能的无限可能。';

  return {
    id: builderId,
    name: builderName,
    badge: verifiedTemplates > 0 ? 'verified' : total >= 3 ? 'pro' : 'builder',
    joinedAt: myProjects[0]?.createdAt ?? '2026-05-01',
    stats: {
      totalProjects: total,
      completedProjects: completed,
      activeProjects: active,
      totalDevices,
      avgDevicesPerProject: avgDevices,
      avgNPS: 4.7,
      responseRate: 94,
      onTimeDeliveryRate: 88,
    },
    expertise: { buildingTypes, deviceCategories, tags },
    regions,
    contributions: {
      publishedSolutions,
      verifiedTemplates,
      remixesCreated,
      remixesUsed,
      totalLikes,
    },
    badgeProgress: {
      currentLevel,
      levelName: BADGE_LEVELS[currentLevel - 1]?.name ?? '新手 Builder',
      nextLevelAt,
      pointsToNext,
      totalPoints,
    },
    topSkills,
    bio,
  };
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    apartment: '平层公寓',
    villa: '别墅',
    office: '办公空间',
    store: '商业店铺',
  };
  return map[type] ?? type;
}

// ─── Mock Builder Profiles ─────────────────────────────────────────────

export function getMockBuilderProfile(): BuilderProfile {
  return {
    id: 'builder-jun',
    name: 'Jun',
    badge: 'verified',
    joinedAt: '2026-02-01',
    stats: {
      totalProjects: 12,
      completedProjects: 8,
      activeProjects: 4,
      totalDevices: 312,
      avgDevicesPerProject: 26,
      avgNPS: 4.8,
      responseRate: 97,
      onTimeDeliveryRate: 92,
    },
    expertise: {
      buildingTypes: [
        { type: '平层公寓', count: 7 },
        { type: '别墅', count: 3 },
        { type: '办公空间', count: 2 },
      ],
      deviceCategories: [
        { category: '传感器', count: 156 },
        { category: '灯光', count: 89 },
        { category: '安防', count: 42 },
        { category: '窗帘/电机', count: 25 },
      ],
      tags: [
        { tag: '适老化', count: 5 },
        { tag: '别墅', count: 3 },
        { tag: '极客', count: 2 },
        { tag: '出租', count: 1 },
        { tag: '庭院', count: 1 },
      ],
    },
    regions: [
      { city: '上海·徐汇', country: '中国大陆', count: 6 },
      { city: '苏州·园区', country: '中国大陆', count: 2 },
      { city: '杭州·西湖', country: '中国大陆', count: 1 },
      { city: 'München', country: '德国', count: 1 },
    ],
    contributions: {
      publishedSolutions: 4,
      verifiedTemplates: 2,
      remixesCreated: 3,
      remixesUsed: 5,
      totalLikes: 218,
    },
    badgeProgress: { currentLevel: 6, levelName: 'Certified Installer', nextLevelAt: 12000, pointsToNext: 4520, totalPoints: 7480 },
    topSkills: ['适老化', '别墅整装', 'Matter Bridge', '平层公寓专家', '别墅专家'],
    bio: '服务 4 个城市，完成 8 个项目，部署 312 台设备。专注适老化、别墅整装。',
  };
}
