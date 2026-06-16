export type MarketAssetType =
  | 'studio_plugin'
  | 'device_connector'
  | 'automation_pack'
  | 'widget'
  | 'scene_pack'
  | 'solution_template'
  | 'service_pack'
  | 'private_solution';

export type MarketPermission = 'free' | 'pro' | 'commercial' | 'enterprise';
export type MarketProductType = 'plugin' | 'template' | 'service_package' | 'agent' | 'connector' | 'solution_pack';
export type MarketCapabilityCategory = 'automation' | 'ai' | 'design' | 'integration' | 'operations' | 'service';
export type MarketAcquisitionMethod = 'free' | 'credits' | 'included' | 'quote';
export type MarketSource = 'free' | 'purchase' | 'plan_included' | 'included' | 'credits' | 'points_redeem' | 'quote' | 'partner_policy' | 'contract' | 'manual_grant';
export type MarketSubject = 'workspace' | 'project' | 'studio' | 'customer_space' | 'studio_group';
export type MarketStatus = 'active' | 'pending_binding' | 'pending_approval' | 'expired';
export type MarketTarget = 'life' | 'studio' | 'both';
export type MarketFulfillment = 'self_service' | 'builder_assisted' | 'project_binding' | 'private_distribution';
export type MarketWorkspaceType = 'personal' | 'team';
export type MarketPlan = 'free' | 'pro' | 'business' | 'enterprise';

export interface MarketAccessPolicy {
  requiresProfessional: boolean;
  allowedWorkspaceTypes: MarketWorkspaceType[];
  allowedPlans: MarketPlan[];
}

export interface MarketAsset {
  id: string;
  name: string;
  type: MarketAssetType;
  productType?: MarketProductType;
  capabilityCategory?: MarketCapabilityCategory;
  permission: MarketPermission;
  sourceHint: MarketSource;
  acquisitionMethod?: MarketAcquisitionMethod;
  includedPlans?: MarketPlan[];
  accessPolicy?: MarketAccessPolicy;
  target: MarketTarget;
  fulfillment: MarketFulfillment;
  publisher: string;
  summary: string;
  /**
   * Legacy field name kept for older prototype pages.
   * Marketplace treats this value as redeem Credits.
   */
  creditCost: number;
  featured?: boolean;
  regions: string[];
  tags: string[];
  provider?: string;
  serviceRegions?: string[];
  deliveryPolicy?: string;
}

export interface EntitlementRecord {
  id: string;
  assetId: string;
  subject: MarketSubject;
  subjectLabel: string;
  permission: MarketPermission;
  source: MarketSource;
  status: MarketStatus;
  scope: string;
  runtimeTarget: string;
  workspaceId?: string;
  paidByAccountLabel?: string;
  pointsSpent?: number;
  expiresAt?: string;
  note?: string;
}

export interface CreditLedgerEntry {
  id: string;
  type: 'grant' | 'usage' | 'redeem';
  title: string;
  amount: number;
  date: string;
  category: 'ai' | 'design' | 'entitlement' | 'ops';
  note?: string;
}

export interface AccountCreditWallet {
  accountLabel: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  periodLabel: string;
  expiresAt: string;
}

export interface MarketInstallTarget {
  workspaceId: string;
  workspaceName: string;
  workspaceType: MarketWorkspaceType;
  role: string;
  canInstall: boolean;
}

export type RedeemMarketAssetStatus =
  | 'redeemed'
  | 'installed'
  | 'requested'
  | 'already_installed'
  | 'insufficient_credits'
  | 'unavailable';

export interface RedeemMarketAssetResult {
  status: RedeemMarketAssetStatus;
  wallet: AccountCreditWallet;
  entitlement?: EntitlementRecord;
  message: string;
}

export const ASSET_TYPE_LABELS: Record<MarketAssetType, string> = {
  studio_plugin: 'Studio 插件',
  device_connector: '设备连接器',
  automation_pack: '自动化包',
  widget: 'Life 控件',
  scene_pack: '场景包',
  solution_template: '方案模板',
  service_pack: '服务包',
  private_solution: '私有方案',
};

export const MARKET_PRODUCT_TYPE_LABELS: Record<MarketProductType, string> = {
  plugin: 'Plugin',
  template: 'Template',
  service_package: 'Service Package',
  agent: 'Agent',
  connector: 'Connector',
  solution_pack: 'Solution Pack',
};

export const CAPABILITY_CATEGORY_LABELS: Record<MarketCapabilityCategory, string> = {
  automation: '自动化',
  ai: 'AI',
  design: '设计',
  integration: '集成',
  operations: '运维',
  service: '服务',
};

export const PERMISSION_LABELS: Record<MarketPermission, string> = {
  free: 'Free',
  pro: 'Pro',
  commercial: 'Business',
  enterprise: 'Enterprise',
};

export const SOURCE_LABELS: Record<MarketSource, string> = {
  free: '免费获得',
  purchase: '已兑换',
  plan_included: '套餐包含',
  included: '套餐包含',
  credits: 'Credits 授权',
  points_redeem: 'Credits 兑换',
  quote: '报价授权',
  partner_policy: '伙伴策略',
  contract: '合同授权',
  manual_grant: '人工授予',
};

export const STATUS_LABELS: Record<MarketStatus, string> = {
  active: '已生效',
  pending_binding: '待绑定',
  pending_approval: '待审批',
  expired: '已过期',
};

export const TARGET_LABELS: Record<MarketTarget, string> = {
  life: 'Aqara Life',
  studio: 'Aqara Studio',
  both: 'Life + Studio',
};

export const FULFILLMENT_LABELS: Record<MarketFulfillment, string> = {
  self_service: '用户可自助',
  builder_assisted: '需专业协助',
  project_binding: '项目部署时绑定',
  private_distribution: '私有分发',
};

export const MARKET_ASSETS: MarketAsset[] = [
  {
    id: 'asset-matter-core',
    name: 'Matter 基础接入包',
    type: 'device_connector',
    permission: 'free',
    sourceHint: 'free',
    target: 'studio',
    fulfillment: 'self_service',
    publisher: 'Aqara Device Team',
    summary: 'Aqara 自有与标准 Matter 设备的基础接入能力，优先降低商业门槛。',
    creditCost: 0,
    featured: true,
    regions: ['全球'],
    tags: ['官方', '基础协议'],
  },
  {
    id: 'asset-rental-scenes',
    name: '出租公寓场景包',
    type: 'scene_pack',
    permission: 'free',
    sourceHint: 'free',
    target: 'life',
    fulfillment: 'self_service',
    publisher: 'Mika Tanaka',
    summary: '入住、退房、节能与远程巡检场景，适合个人房东和轻度运营场景。',
    creditCost: 0,
    featured: true,
    regions: ['全球'],
    tags: ['社区传播', '可直接应用'],
  },
  {
    id: 'asset-fp400-dashboard',
    name: 'FP400 占用感知面板',
    type: 'studio_plugin',
    permission: 'free',
    sourceHint: 'free',
    target: 'studio',
    fulfillment: 'self_service',
    publisher: 'North Star Studio',
    summary: '把 FP400 的存在、静止、区域状态聚合成 Studio 运行面板。',
    creditCost: 0,
    featured: true,
    regions: ['全球'],
    tags: ['雷达', '可视化'],
  },
  {
    id: 'asset-zigbee-health',
    name: 'Zigbee 网络健康视图',
    type: 'studio_plugin',
    permission: 'free',
    sourceHint: 'free',
    target: 'studio',
    fulfillment: 'self_service',
    publisher: 'Aqara Runtime Team',
    summary: '查看子设备在线、链路质量和弱连接状态，适合日常排障。',
    creditCost: 0,
    regions: ['全球'],
    tags: ['Zigbee', '诊断'],
  },
  {
    id: 'asset-lighting-scenes',
    name: '基础灯光场景包',
    type: 'scene_pack',
    permission: 'free',
    sourceHint: 'free',
    target: 'both',
    fulfillment: 'self_service',
    publisher: 'Lina Park',
    summary: '回家、离家、观影、夜灯等常用灯光场景，可直接应用后微调。',
    creditCost: 0,
    regions: ['全球'],
    tags: ['灯光', '场景'],
  },
  {
    id: 'asset-camera-privacy',
    name: '摄像头隐私模式',
    type: 'automation_pack',
    permission: 'free',
    sourceHint: 'free',
    target: 'both',
    fulfillment: 'self_service',
    publisher: 'Sora Living Lab',
    summary: '在家庭成员在家、访客到访或夜间休息时自动切换摄像头隐私策略。',
    creditCost: 0,
    regions: ['全球'],
    tags: ['摄像头', '隐私'],
  },
  {
    id: 'asset-persona-widget',
    name: 'Persona 快捷控件组',
    type: 'widget',
    permission: 'pro',
    sourceHint: 'credits',
    target: 'life',
    fulfillment: 'self_service',
    publisher: 'Aqara Experience Team',
    summary: '适用于家庭成员入口、访客入口和房东视图的轻量控件包。',
    creditCost: 40,
    regions: ['全球'],
    tags: ['Life', '轻量解锁'],
  },
  {
    id: 'asset-villa-template',
    name: '两层住宅空间模板',
    type: 'solution_template',
    permission: 'pro',
    sourceHint: 'credits',
    target: 'studio',
    fulfillment: 'project_binding',
    publisher: 'Aqara Spatial Lab',
    summary: '包含楼层、房间、点位与常见家具语义，适合住宅类项目起稿。',
    creditCost: 60,
    featured: true,
    regions: ['全球'],
    tags: ['空间设计', '模板复用'],
  },
  {
    id: 'asset-elder-automation',
    name: '适老守护自动化包',
    type: 'automation_pack',
    permission: 'commercial',
    sourceHint: 'credits',
    target: 'both',
    fulfillment: 'builder_assisted',
    publisher: 'Aqara Care Lab',
    summary: '跌倒、起夜、久坐与异常活动提醒，需要在真实项目部署前完成授权校验。',
    creditCost: 120,
    featured: true,
    regions: ['中国', '日本', '意大利'],
    tags: ['适老化', '高维护'],
    provider: 'Aqara Care Service',
    serviceRegions: ['中国大陆', '日本', '意大利'],
    deliveryPolicy: '远程配置 + 项目授权校验',
  },
  {
    id: 'asset-bacnet-connector',
    name: 'BACnet 商业连接器',
    type: 'device_connector',
    permission: 'commercial',
    sourceHint: 'credits',
    target: 'studio',
    fulfillment: 'project_binding',
    publisher: 'Aqara BMS Team',
    summary: '用于楼宇、酒店、办公等商业空间接入，部署前按项目或站点绑定授权。',
    creditCost: 180,
    regions: ['全球'],
    tags: ['商业项目', '楼控'],
  },
  {
    id: 'asset-remote-commissioning',
    name: '远程调试服务包',
    type: 'service_pack',
    permission: 'commercial',
    sourceHint: 'partner_policy',
    target: 'studio',
    fulfillment: 'builder_assisted',
    publisher: 'Aqara Service Network',
    summary: '用于远程诊断、协议排查和二次调优，前期以项目服务项和账本记录为主。',
    creditCost: 90,
    regions: ['全球'],
    tags: ['服务记录', '远程支持'],
    provider: 'Jun Remote Ops',
    serviceRegions: ['中国大陆', '新加坡', '德国', '美国西海岸'],
    deliveryPolicy: '按服务窗口履约 · 需授权会话',
  },
  {
    id: 'asset-quarterly-maintenance',
    name: '季度健康巡检服务包',
    type: 'service_pack',
    permission: 'commercial',
    sourceHint: 'credits',
    target: 'both',
    fulfillment: 'builder_assisted',
    publisher: 'Aqara Space Shanghai Xuhui',
    summary: '按季度检查 Studio、设备在线、自动化日志与 Life Dashboard 体验，并生成客户报告。',
    creditCost: 160,
    featured: true,
    regions: ['中国'],
    tags: ['Service Plan', '定期巡检'],
    provider: 'Aqara Space Shanghai Xuhui',
    serviceRegions: ['上海', '苏州', '杭州'],
    deliveryPolicy: '固定 Credits · 季度服务窗口',
  },
  {
    id: 'asset-rental-care-plan',
    name: '民宿远程运营服务包',
    type: 'service_pack',
    permission: 'commercial',
    sourceHint: 'credits',
    target: 'both',
    fulfillment: 'builder_assisted',
    publisher: 'Liang Studio',
    summary: '为短租和民宿提供门锁、入住场景、告警联动和月度运行报告，复杂项目可转报价。',
    creditCost: 240,
    regions: ['全球'],
    tags: ['Rental', 'Remote Service'],
    provider: 'Liang Studio',
    serviceRegions: ['远程全球', '上海现场'],
    deliveryPolicy: '订阅 Credits · 可升级项目报价',
  },
  {
    id: 'asset-bank-suite',
    name: '银行网点私有方案',
    type: 'private_solution',
    permission: 'enterprise',
    sourceHint: 'contract',
    target: 'studio',
    fulfillment: 'private_distribution',
    publisher: 'Aqara Enterprise Solutions',
    summary: '适用于金融行业的私有目录方案，按合同、区域和审计要求分发。',
    creditCost: 0,
    regions: ['企业客户'],
    tags: ['私有目录', '审计'],
  },
];

export const PERSONAL_ENTITLEMENTS: EntitlementRecord[] = [
  {
    id: 'ent-user-1',
    assetId: 'asset-matter-core',
    subject: 'workspace',
    subjectLabel: 'Personal',
    permission: 'free',
    source: 'free',
    status: 'active',
    scope: '全球',
    runtimeTarget: 'Aqara Studio',
    workspaceId: 'personal',
  },
  {
    id: 'ent-user-2',
    assetId: 'asset-rental-scenes',
    subject: 'workspace',
    subjectLabel: 'Personal',
    permission: 'free',
    source: 'free',
    status: 'active',
    scope: '全球',
    runtimeTarget: 'Aqara Life',
    workspaceId: 'personal',
  },
  {
    id: 'ent-user-3',
    assetId: 'asset-persona-widget',
    subject: 'workspace',
    subjectLabel: 'Personal',
    permission: 'pro',
    source: 'credits',
    status: 'active',
    scope: '个人使用',
    runtimeTarget: 'Aqara Life',
    workspaceId: 'personal',
    paidByAccountLabel: 'Jun',
    pointsSpent: 40,
  },
  {
    id: 'ent-user-4',
    assetId: 'asset-villa-template',
    subject: 'project',
    subjectLabel: '王府别墅',
    permission: 'pro',
    source: 'plan_included',
    status: 'pending_binding',
    scope: '项目级',
    runtimeTarget: '待部署 Studio',
    note: '已进入设计包，尚未绑定目标 Studio。',
  },
];

export const PROJECT_ENTITLEMENTS: EntitlementRecord[] = [
  {
    id: 'ent-proj-1',
    assetId: 'asset-bacnet-connector',
    subject: 'project',
    subjectLabel: '王府别墅',
    permission: 'commercial',
    source: 'credits',
    status: 'pending_approval',
    scope: '项目级',
    runtimeTarget: 'Studio Hub',
    note: '等待客户确认后绑定到部署目标。',
  },
  {
    id: 'ent-proj-2',
    assetId: 'asset-remote-commissioning',
    subject: 'project',
    subjectLabel: '王府别墅',
    permission: 'commercial',
    source: 'partner_policy',
    status: 'active',
    scope: '项目服务期 12 个月',
    runtimeTarget: 'Studio Hub',
    expiresAt: '2027-05-12',
  },
  {
    id: 'ent-proj-3',
    assetId: 'asset-elder-automation',
    subject: 'studio',
    subjectLabel: '王府别墅 · 主 Studio',
    permission: 'commercial',
    source: 'credits',
    status: 'active',
    scope: '指定 Studio',
    runtimeTarget: 'Aqara Studio',
  },
];

export const CREDIT_LEDGER: CreditLedgerEntry[] = [
  { id: 'cr-1', type: 'grant', title: '月度配额发放', amount: 1200, date: '2026-05-01', category: 'ai', note: 'Individual 月度额度' },
  { id: 'cr-2', type: 'usage', title: '户型识别与墙体重建', amount: -160, date: '2026-05-08', category: 'design' },
  { id: 'cr-3', type: 'usage', title: '覆盖仿真与设备点位建议', amount: -120, date: '2026-05-12', category: 'ai' },
  { id: 'cr-4', type: 'usage', title: '自动化建议生成', amount: -45, date: '2026-05-16', category: 'ai' },
  { id: 'cr-5', type: 'usage', title: '3D 视觉生成', amount: -180, date: '2026-05-21', category: 'design', note: '渲染队列消耗' },
  { id: 'cr-6', type: 'grant', title: '活动奖励', amount: 20, date: '2026-05-24', category: 'ops', note: 'Academy 认证完成奖励' },
];

const ACCOUNT_CREDIT_WALLET_KEY = 'aqara:builder:credits-wallet:v1';
const WORKSPACE_CREDIT_WALLET_KEY_PREFIX = 'aqara:builder:workspace-credits-wallet:v1:';
const MARKET_ENTITLEMENTS_KEY = 'aqara:builder:market-entitlements:v2';

export const DEFAULT_ACCOUNT_CREDIT_WALLET: AccountCreditWallet = {
  accountLabel: 'Jun',
  balance: 1280,
  lifetimeEarned: 1880,
  lifetimeRedeemed: 600,
  periodLabel: 'Redeem Credits',
  expiresAt: '2026-12-31',
};

const DEFAULT_WORKSPACE_CREDIT_BALANCE: Record<string, number> = {
  personal: DEFAULT_ACCOUNT_CREDIT_WALLET.balance,
  'design-studio': 4_600,
  'seven-mi': 12_000,
};

function parseStoredEntitlements(raw: string | null): EntitlementRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as EntitlementRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function creditWalletStorageKey(workspaceId: string) {
  return workspaceId === 'personal' ? ACCOUNT_CREDIT_WALLET_KEY : `${WORKSPACE_CREDIT_WALLET_KEY_PREFIX}${workspaceId}`;
}

function defaultWorkspaceCreditWallet(workspaceId: string, workspaceName?: string): AccountCreditWallet {
  const balance = DEFAULT_WORKSPACE_CREDIT_BALANCE[workspaceId] ?? 2_400;
  return {
    ...DEFAULT_ACCOUNT_CREDIT_WALLET,
    accountLabel: workspaceName || (workspaceId === 'personal' ? 'Personal' : workspaceId),
    balance,
    lifetimeEarned: balance,
    lifetimeRedeemed: 0,
    periodLabel: 'Workspace Credit Pool',
  };
}

function readStoredCreditWallet(workspaceId: string, workspaceName?: string): AccountCreditWallet | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(creditWalletStorageKey(workspaceId)) ?? 'null') as AccountCreditWallet | null;
    if (!parsed || typeof parsed.balance !== 'number') return null;
    return { ...defaultWorkspaceCreditWallet(workspaceId, workspaceName), ...parsed };
  } catch {
    return null;
  }
}

function persistCreditWallet(next: AccountCreditWallet, workspaceId = 'personal') {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(creditWalletStorageKey(workspaceId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('aqara:credits-change'));
}

export function getAccountCreditWallet(): AccountCreditWallet {
  return getWorkspaceCreditWallet('personal', 'Personal');
}

export function getWorkspaceCreditWallet(workspaceId: string, workspaceName?: string): AccountCreditWallet {
  return readStoredCreditWallet(workspaceId, workspaceName) ?? defaultWorkspaceCreditWallet(workspaceId, workspaceName);
}

export function resetAccountCreditWallet() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCOUNT_CREDIT_WALLET_KEY);
  window.dispatchEvent(new CustomEvent('aqara:credits-change'));
}

export function getPurchasedPersonalEntitlements(): EntitlementRecord[] {
  if (typeof window === 'undefined') return [];
  return parseStoredEntitlements(window.localStorage.getItem(MARKET_ENTITLEMENTS_KEY));
}

function persistPurchasedPersonalEntitlements(next: EntitlementRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MARKET_ENTITLEMENTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('aqara:market-change'));
}

export function marketAssetPointCost(asset: MarketAsset): number {
  return Math.max(0, asset.creditCost);
}

export function marketProductType(asset: MarketAsset): MarketProductType {
  if (asset.productType) return asset.productType;
  if (asset.type === 'solution_template') return 'template';
  if (asset.type === 'service_pack') return 'service_package';
  if (asset.type === 'device_connector') return 'connector';
  if (asset.type === 'private_solution') return 'solution_pack';
  return 'plugin';
}

export function marketCapabilityCategory(asset: MarketAsset): MarketCapabilityCategory {
  if (asset.capabilityCategory) return asset.capabilityCategory;
  if (asset.type === 'automation_pack' || asset.type === 'scene_pack' || asset.tags.some(tag => ['场景', '自动化'].includes(tag))) {
    return 'automation';
  }
  if (asset.name.toLowerCase().includes('ai') || asset.tags.some(tag => ['AI', '智能体'].includes(tag))) {
    return 'ai';
  }
  if (asset.type === 'solution_template' || asset.type === 'private_solution' || asset.tags.some(tag => ['空间设计', '模板复用'].includes(tag))) {
    return 'design';
  }
  if (asset.type === 'device_connector' || asset.tags.some(tag => ['楼控', '基础协议'].includes(tag))) {
    return 'integration';
  }
  if (asset.type === 'service_pack') {
    return 'service';
  }
  if (asset.tags.some(tag => ['诊断', '雷达', '可视化', '高维护', 'Service Plan', 'Remote Service'].includes(tag))) {
    return 'operations';
  }
  return 'automation';
}

export function marketAcquisitionMethod(asset: MarketAsset): MarketAcquisitionMethod {
  if (asset.acquisitionMethod) return asset.acquisitionMethod;
  if (asset.permission === 'enterprise' || asset.sourceHint === 'contract' || asset.sourceHint === 'quote') return 'quote';
  if (asset.sourceHint === 'plan_included' || asset.sourceHint === 'included') return 'included';
  if (marketAssetPointCost(asset) > 0) return 'credits';
  return 'free';
}

export function marketAccessPolicy(asset: MarketAsset): MarketAccessPolicy {
  if (asset.accessPolicy) return asset.accessPolicy;
  if (asset.permission === 'free') {
    return {
      requiresProfessional: false,
      allowedWorkspaceTypes: ['personal', 'team'],
      allowedPlans: ['free', 'pro', 'business', 'enterprise'],
    };
  }
  if (asset.permission === 'pro') {
    return {
      requiresProfessional: false,
      allowedWorkspaceTypes: ['personal', 'team'],
      allowedPlans: ['pro', 'business', 'enterprise'],
    };
  }
  if (asset.permission === 'commercial') {
    return {
      requiresProfessional: true,
      allowedWorkspaceTypes: ['team'],
      allowedPlans: ['business', 'enterprise'],
    };
  }
  return {
    requiresProfessional: true,
    allowedWorkspaceTypes: ['team'],
    allowedPlans: ['enterprise'],
  };
}

export function marketAssetPriceLabel(asset: MarketAsset): string {
  const method = marketAcquisitionMethod(asset);
  if (method === 'quote') return 'Contact Sales';
  if (method === 'included') {
    const plans = asset.includedPlans?.length ? asset.includedPlans : ['pro'];
    return `Included in ${plans.map(plan => plan[0].toUpperCase() + plan.slice(1)).join(' / ')}`;
  }
  const credits = marketAssetPointCost(asset);
  return credits > 0 ? `${credits} Credits` : 'Free';
}

export function acquisitionLabelForAsset(asset: MarketAsset): string {
  return marketAssetPriceLabel(asset);
}

function runtimeTargetForAsset(asset: MarketAsset) {
  if (asset.target === 'life') return 'Aqara Life';
  if (asset.target === 'studio') return '待应用到 Studio';
  return '待应用到 Life / Studio';
}

function statusForAsset(asset: MarketAsset): MarketStatus {
  return asset.target === 'life' ? 'active' : 'pending_binding';
}

function entitlementAlreadyExists(assetId: string, workspaceId: string) {
  return [...PERSONAL_ENTITLEMENTS, ...getPurchasedPersonalEntitlements()].some(entitlement =>
    entitlement.assetId === assetId &&
    entitlement.workspaceId === workspaceId &&
    entitlement.status !== 'expired'
  );
}

function createWorkspaceEntitlement(asset: MarketAsset, target: MarketInstallTarget, status?: MarketStatus): EntitlementRecord {
  const runtimeTarget =
    status === 'pending_approval'
      ? '等待 Owner/Admin 审批'
      : runtimeTargetForAsset(asset);

  return {
    id: `ent-${target.workspaceId}-${asset.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    assetId: asset.id,
    subject: 'workspace',
    subjectLabel: target.workspaceName,
    permission: asset.permission,
    source: asset.permission === 'free' ? 'free' : status === 'pending_approval' ? 'manual_grant' : marketAcquisitionMethod(asset) === 'included' ? 'included' : 'credits',
    status: status ?? statusForAsset(asset),
    scope: target.workspaceType === 'personal' ? 'Personal Workspace' : 'Team Workspace',
    runtimeTarget,
    workspaceId: target.workspaceId,
    paidByAccountLabel: status === 'pending_approval' || asset.permission === 'free' ? undefined : 'Jun',
    pointsSpent: status === 'pending_approval' ? 0 : marketAssetPointCost(asset),
    note:
      status === 'pending_approval'
        ? '成员已发起安装申请，等待 Workspace Owner/Admin 审批。'
        : statusForAsset(asset) === 'pending_binding'
        ? '已归属 Workspace，后续可应用到目标 Studio。'
        : undefined,
  };
}

export function redeemMarketAsset(assetId: string, target: MarketInstallTarget): RedeemMarketAssetResult {
  const wallet = getWorkspaceCreditWallet(target.workspaceId, target.workspaceName);
  const asset = getMarketAsset(assetId);
  if (!asset || asset.permission === 'enterprise') {
    return { status: 'unavailable', wallet, message: '该内容当前不支持自助兑换。' };
  }
  if (!target.canInstall) {
    return requestMarketAssetInstall(assetId, target);
  }
  if (entitlementAlreadyExists(asset.id, target.workspaceId)) {
    return { status: 'already_installed', wallet, message: `${asset.name} 已归属 ${target.workspaceName}。` };
  }

  const cost = marketAssetPointCost(asset);
  if (wallet.balance < cost) {
    return { status: 'insufficient_credits', wallet, message: 'Credits 不足，可升级计划或申请加量。' };
  }

  const nextWallet: AccountCreditWallet = {
    ...wallet,
    balance: wallet.balance - cost,
    lifetimeRedeemed: wallet.lifetimeRedeemed + cost,
  };
  const entitlement = createWorkspaceEntitlement(asset, target);
  persistCreditWallet(nextWallet, target.workspaceId);
  persistPurchasedPersonalEntitlements([...getPurchasedPersonalEntitlements(), entitlement]);

  return {
    status: cost > 0 ? 'redeemed' : 'installed',
    wallet: nextWallet,
    entitlement,
    message: cost > 0
      ? `${asset.name} 已用 ${cost} Credits 兑换，并归属到 ${target.workspaceName}。`
      : `${asset.name} 已归属到 ${target.workspaceName}。`,
  };
}

export function requestMarketAssetInstall(assetId: string, target: MarketInstallTarget): RedeemMarketAssetResult {
  const wallet = getWorkspaceCreditWallet(target.workspaceId, target.workspaceName);
  const asset = getMarketAsset(assetId);
  if (!asset || asset.permission === 'enterprise') {
    return { status: 'unavailable', wallet, message: '该内容当前不支持自助申请。' };
  }
  if (entitlementAlreadyExists(asset.id, target.workspaceId)) {
    return { status: 'already_installed', wallet, message: `${asset.name} 已在 ${target.workspaceName} 有记录。` };
  }
  const entitlement = createWorkspaceEntitlement(asset, target, 'pending_approval');
  persistPurchasedPersonalEntitlements([...getPurchasedPersonalEntitlements(), entitlement]);
  return {
    status: 'requested',
    wallet,
    entitlement,
    message: `已向 ${target.workspaceName} 的 Owner/Admin 发起安装申请。`,
  };
}

export function purchaseMarketAsset(assetId: string): EntitlementRecord | null {
  const result = redeemMarketAsset(assetId, {
    workspaceId: 'personal',
    workspaceName: 'Personal',
    workspaceType: 'personal',
    role: 'owner',
    canInstall: true,
  });
  return result.entitlement ?? null;
}

export function getMarketAsset(id: string) {
  return MARKET_ASSETS.find(item => item.id === id);
}

export function publicMarketAssets() {
  return MARKET_ASSETS.filter(asset => asset.permission !== 'enterprise');
}

export function userEntitledAssets() {
  return [...PERSONAL_ENTITLEMENTS, ...getPurchasedPersonalEntitlements()].map(ent => ({
    entitlement: ent,
    asset: getMarketAsset(ent.assetId)!,
  })).filter(row => Boolean(row.asset));
}

export function seededUserEntitledAssets() {
  return PERSONAL_ENTITLEMENTS.map(ent => ({
    entitlement: ent,
    asset: getMarketAsset(ent.assetId)!,
  })).filter(row => Boolean(row.asset));
}

export function workspaceEntitledAssets(workspaceId: string) {
  return userEntitledAssets().filter(row => row.entitlement.workspaceId === workspaceId);
}

export function projectEntitledAssets() {
  return PROJECT_ENTITLEMENTS.map(ent => ({
    entitlement: ent,
    asset: getMarketAsset(ent.assetId)!,
  }));
}

export function licensableAssets() {
  return MARKET_ASSETS.filter(asset => asset.permission === 'commercial' || asset.permission === 'pro');
}
