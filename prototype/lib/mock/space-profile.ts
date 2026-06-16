import { FloorPlanRef, getAllProjects, resolveProjectStatus, type BuildingType, type Project } from './projects';

// ─── Space Card — 核心内容单元 ──────────────────────────────────────────
// Space = 一个物理空间 + Studio 硬件 + 空间智能配置的组合体
// 是 Builder 前台信息流、搜索、展示的基础卡片单元

export interface SpaceCard {
  id: string;
  name: string;
  type: 'home' | 'office' | 'store' | 'other';
  buildingType: BuildingType;
  area: number;
  rooms: number;
  devices: number;
  personas: number;
  thumbnailGradient: string;
  ownerName: string;
  ownerBadge: 'builder' | 'pro' | 'verified';
  isPublic: boolean;
  remixCount: number;
  likeCount: number;
  updatedAt: string;
}

// ─── Space Profile — 完整空间档案 ──────────────────────────────────────

export interface SpacePrivacy {
  aiLearning: boolean;
  proAccess: boolean;
  anonymousContribution: boolean;
  publicShowcase: boolean;
}

export interface SpaceScene {
  id: string;
  name: string;
  icon: string;
  deviceIds: string[];
  triggerDescription: string;
}

export interface SpaceAutomation {
  id: string;
  name: string;
  type: 'schedule' | 'sensor' | 'manual' | 'ai';
  description: string;
  active: boolean;
}

export interface SpaceProfile {
  id: string;
  name: string;
  type: 'home' | 'office' | 'store' | 'other';
  buildingType: BuildingType;
  area: number;
  rooms: number;
  devices: number;
  personas: number;
  studioId: string;
  studioName: string;
  thumbnailGradient: string;

  privacy: SpacePrivacy;
  createdAt: string;
  updatedAt: string;
  lastActive: string;

  /** owner = 实际住户/终端客户，builder = 部署此空间的服务商 */
  ownerId: string;
  ownerName: string;
  builderId: string;
  builderName: string;
  linkedProjectId: string;
  linkedSolutionId?: string;

  floorPlans?: FloorPlanRef[];
  scenes: SpaceScene[];
  automations: SpaceAutomation[];

  remixCount: number;
  likeCount: number;
  remixSourceId?: string;
}

// ─── 默认隐私设置 ──────────────────────────────────────────────────────

export const DEFAULT_PRIVACY: SpacePrivacy = {
  aiLearning: true,
  proAccess: false,
  anonymousContribution: true,
  publicShowcase: false,
};

export const PRIVACY_LABELS: Record<keyof SpacePrivacy, { label: string; desc: string }> = {
  aiLearning:              { label: 'AI 学习',       desc: '允许 AI 从此空间学习使用模式，持续优化个性化体验' },
  proAccess:               { label: '服务商访问',    desc: '允许认证服务商远程访问空间数据以提供运维支持' },
  anonymousContribution:   { label: '匿名贡献',      desc: '匿名贡献空间数据用于联邦训练，帮助改进所有人的 AI 体验' },
  publicShowcase:          { label: '公开展示',      desc: '在 Discover 社区中展示此空间作为案例，其他 Builder 可浏览与 remix' },
};

// ─── 从 Project 派生 Space Profile ─────────────────────────────────────
// Space Profile 不独立存在 — 每个部署到 Studio 的项目自动生成一个 Space Profile
// 这保证 Builder 前台、Builder Pro、Discover 三处数据永远一致

const SPACE_PRIVACY_KEY = 'aqara_space_privacy_overrides';

function getPrivacyOverrides(): Record<string, SpacePrivacy> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SPACE_PRIVACY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function setSpacePrivacy(spaceId: string, privacy: SpacePrivacy) {
  if (typeof window === 'undefined') return;
  const overrides = getPrivacyOverrides();
  overrides[spaceId] = privacy;
  window.localStorage.setItem(SPACE_PRIVACY_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event('aqara:space-privacy-change'));
}

// 模拟面积 — 从项目标签/设备数推导
function deriveArea(p: Project): number {
  if (p.buildingType === 'villa') return p.devices > 100 ? 380 : 280;
  if (p.buildingType === 'office') return 200;
  if (p.buildingType === 'store') return 120;
  if (p.tags?.includes('别墅')) return 280;
  return p.devices > 30 ? 140 : p.devices > 10 ? 90 : 65;
}

function deriveRooms(area: number, buildingType?: string): number {
  if (buildingType === 'villa') return 8;
  if (buildingType === 'office') return 4;
  if (area >= 140) return 5;
  if (area >= 90) return 3;
  return 2;
}

// 从项目标签和类型生成 demo 场景
function deriveScenes(p: Project): SpaceScene[] {
  const scenes: SpaceScene[] = [];
  const tags = p.tags ?? [];
  const hasElder = tags.some(t => t.includes('适老化') || t.includes('老人'));
  const hasVilla = tags.some(t => t.includes('别墅'));
  const hasGarden = tags.some(t => t.includes('庭院'));
  const hasGeek = tags.some(t => t.includes('极客'));

  if (hasElder) {
    scenes.push(
      { id: `${p.id}-s1`, name: '起夜防跌', icon: '🌙', deviceIds: ['d1','d2'], triggerDescription: '床侧传感器检测下床 → 夜灯自动亮起 + 卫生间灯预热' },
      { id: `${p.id}-s2`, name: '紧急呼叫', icon: '🆘', deviceIds: ['d3'], triggerDescription: '无线按钮长按 3s → 推送通知给家属 + 社区服务站' },
      { id: `${p.id}-s3`, name: '回家模式', icon: '🏠', deviceIds: ['d4','d5'], triggerDescription: '门锁开启 → 灯光渐亮 + 窗帘打开' },
    );
  } else if (hasVilla) {
    scenes.push(
      { id: `${p.id}-s1`, name: '家庭影院', icon: '🎬', deviceIds: [], triggerDescription: '一键切换观影模式：灯光调暗 + 投影降下 + 音响开启' },
      { id: `${p.id}-s2`, name: '庭院派对', icon: '🎉', deviceIds: [], triggerDescription: '室外灯光秀 + 背景音乐同步' },
    );
  } else if (hasGeek) {
    scenes.push(
      { id: `${p.id}-s1`, name: '极客模式', icon: '💻', deviceIds: [], triggerDescription: '桌面传感器检测到坐下 → 显示器背光 + 智能排插开启' },
    );
  } else {
    scenes.push(
      { id: `${p.id}-s1`, name: '回家模式', icon: '🏠', deviceIds: ['d1','d2'], triggerDescription: '门锁开启 → 灯光渐亮 + 空调预设温度' },
      { id: `${p.id}-s2`, name: '离家模式', icon: '🔒', deviceIds: ['d1','d2','d3'], triggerDescription: '门锁反锁 → 全屋灯关 + 安防布防 + 电器断电' },
    );
  }

  if (hasGarden) {
    scenes.push(
      { id: `${p.id}-s-g`, name: '庭院自动浇灌', icon: '🌿', deviceIds: [], triggerDescription: '每日 06:00 自动浇灌 15 分钟' },
    );
  }

  return scenes;
}

function deriveAutomations(p: Project): SpaceAutomation[] {
  const autos: SpaceAutomation[] = [];
  const tags = p.tags ?? [];
  const hasElder = tags.some(t => t.includes('适老化') || t.includes('老人'));
  const hasGeek = tags.some(t => t.includes('极客'));
  const hasVilla = tags.some(t => t.includes('别墅'));

  if (hasElder) {
    autos.push(
      { id: `${p.id}-a1`, name: '跌倒检测告警', type: 'ai', description: 'FP2 检测跌倒姿态 → 30s 确认 → 紧急通知', active: true },
      { id: `${p.id}-a2`, name: '温湿度自动调节', type: 'sensor', description: '湿度 < 40% 自动开启加湿器', active: true },
    );
  } else if (hasGeek) {
    autos.push(
      { id: `${p.id}-a1`, name: 'Matter Bridge 转发', type: 'ai', description: 'Modbus → Matter 协议桥接自动转发', active: true },
    );
  } else if (hasVilla) {
    autos.push(
      { id: `${p.id}-a1`, name: '庭院灌溉定时', type: 'schedule', description: '每日 06:00 自动浇灌 15 分钟', active: true },
    );
  }

  return autos;
}

/** 从 Project 派生 Space Profile — 只有已绑定 Studio 的项目才有 Space Profile */
export function deriveSpaceProfile(p: Project): SpaceProfile | null {
  const studioId = p.linkedStudioId;
  if (!studioId) return null;

  const isPersonal = !p.customerId || p.customerName === '自己家' || p.customerId === 'cust-self';
  const builderName = p.managers?.[0]?.split(' (')[0] || 'Jun';
  const builderId = `builder-${builderName.toLowerCase()}`;
  // 个人项目：owner = builder 自己；客户项目：owner = 客户
  const ownerName = isPersonal ? builderName : (p.customerName || '客户');
  const ownerId = isPersonal ? builderId : (p.customerId || `cust-${ownerName.toLowerCase()}`);
  const area = deriveArea(p);
  const rooms = deriveRooms(area, p.buildingType);

  const privacyOverrides = getPrivacyOverrides();
  const basePrivacy = isPersonal
    ? { ...DEFAULT_PRIVACY, publicShowcase: true }
    : { ...DEFAULT_PRIVACY, proAccess: true };

  const profile: SpaceProfile = {
    id: `space-${p.id}`,
    name: p.title,
    type: (p.buildingType === 'office' ? 'office' : p.buildingType === 'store' ? 'store' : 'home') as SpaceProfile['type'],
    buildingType: p.buildingType || 'apartment',
    area,
    rooms,
    devices: p.devices || 0,
    personas: p.personas || 1,
    studioId,
    studioName: 'M300',
    thumbnailGradient: p.thumbnailGradient || 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    privacy: privacyOverrides[`space-${p.id}`] || basePrivacy,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    lastActive: p.updatedAt,
    ownerId,
    ownerName,
    builderId,
    builderName,
    linkedProjectId: p.id,
    linkedSolutionId: p.linkedSolutionId ?? undefined,
    floorPlans: p.floorPlans,
    scenes: deriveScenes(p),
    automations: deriveAutomations(p),
    remixCount: p.forkCount || 0,
    likeCount: p.applyCount ? Math.round(p.applyCount * 0.1) : 0,
    remixSourceId: p.linkedSolutionId ? `space-${p.linkedSolutionId}` : undefined,
  };

  return profile;
}

// ─── 查询函数 — 所有函数从 Projects 派生，保证数据一致性 ─────────────

/** 所有 Space Profile（从所有已部署 Studio 的项目派生） */
export function getAllSpaceProfiles(): SpaceProfile[] {
  const projects = getAllProjects();
  return projects
    .filter(p => !!p.linkedStudioId && p.phase !== 'cancelled' && p.visibility !== 'verified')
    .map(p => deriveSpaceProfile(p))
    .filter((s): s is SpaceProfile => s !== null);
}

export function getSpaceProfile(id: string): SpaceProfile | undefined {
  return getAllSpaceProfiles().find(s => s.id === id);
}

/** 公开展示的 Space — 用于 Discover 社区浏览 */
export function getPublicSpaces(): SpaceProfile[] {
  return getAllSpaceProfiles().filter(s => s.privacy.publicShowcase);
}

/** 我自己的家 — ownerId === builderId 的空间（Builder 前台「我的家」） */
export function getMyOwnSpaces(builderId: string): SpaceProfile[] {
  return getAllSpaceProfiles().filter(s => s.ownerId === builderId);
}

/** 我管理的客户空间 — builderId 是我但 ownerId 不是我的（Builder Pro「空间」） */
export function getMyManagedSpaces(builderId: string): SpaceProfile[] {
  return getAllSpaceProfiles().filter(s => s.builderId === builderId && s.ownerId !== builderId);
}

/** 所有与我相关的空间（我自己的 + 我管理的客户） */
export function getAllMySpaces(builderId: string): SpaceProfile[] {
  return getAllSpaceProfiles().filter(s => s.builderId === builderId || s.ownerId === builderId);
}

export function toSpaceCard(profile: SpaceProfile): SpaceCard {
  const isOwn = profile.ownerId === profile.builderId;
  return {
    id: profile.id,
    name: profile.name,
    type: profile.type,
    buildingType: profile.buildingType,
    area: profile.area,
    rooms: profile.rooms,
    devices: profile.devices,
    personas: profile.personas,
    thumbnailGradient: profile.thumbnailGradient,
    ownerName: profile.ownerName,
    ownerBadge: isOwn ? 'builder' : 'verified',
    isPublic: profile.privacy.publicShowcase,
    remixCount: profile.remixCount,
    likeCount: profile.likeCount,
    updatedAt: profile.updatedAt,
  };
}
