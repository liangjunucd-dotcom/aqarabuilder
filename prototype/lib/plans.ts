// Aqara Builder — account subscription, credits and commercial entitlement model
//
// Product terms:
//   Builder Pro              = professional workbench capability, not a plan,
//                              certification level, or user role.
//   Become Professional      = onboarding action that activates the professional identity.
//   Professional Identity    = access to Builder Pro after onboarding.
//   Personal Plans           = Free / Pro, purchased by an account for personal use.
//   Business Plans           = Business / Enterprise, purchased by an account for an organization.
//   Plan Credits             = subscription credits for AI/model/compute usage.
//   Add-on Credits           = prepaid credit packs for extra usage.
//   Commercial Entitlement   = permission to use Builder assets for client delivery.
//   Pilot Upgrade            = MVP activation request. Future payment checkout
//                              can attach to the same upgrade intent.
//
// Plans are purchased by accounts. Workspaces are usage contexts that consume
// from the personal account or organization credit pool.

import type { Role } from './role';

export type PlanScope = 'personal' | 'business';
export type PlanId = 'free' | 'pro' | 'business' | 'enterprise';

export interface Plan {
  id: PlanId;
  scope: PlanScope;
  name: string;
  tagline: string;
  /** Display placeholder. Real pricing is localized by region. */
  priceLabel: string;
  /** 0 = free, -1 = custom / contact sales. */
  monthly: number;
  ctaLabel: string;
  available: boolean;
  highlight?: 'popular' | 'recommended';
  audience: string[];
  features: string[];
  limits?: string[];
  creditsLabel: string;
  capabilityLevel: 'basic' | 'personal_plus' | 'business' | 'enterprise';
  commercialEntitlement: 'none' | 'project' | 'organization' | 'contract';
  findProfessionals: 'none' | 'optional' | 'business' | 'private';
}

export interface PlanBenefits {
  planId: PlanId;
  planCredits: string;
  addOnCredits: string;
  creditOwner: 'personal_account' | 'organization' | 'contract';
  creditPool: 'personal' | 'organization' | 'contract';
  marketplace: string;
}

export const PERSONAL_PLANS: Plan[] = [
  {
    id: 'free',
    scope: 'personal',
    name: 'Free',
    tagline: '浏览社区、进入 Builder Pro 个人工作区，并用基础 Credits 体验专业流程。',
    priceLabel: '$0',
    monthly: 0,
    ctaLabel: '开始使用',
    available: true,
    creditsLabel: 'Weekly Basic Credits',
    capabilityLevel: 'basic',
    commercialEntitlement: 'none',
    findProfessionals: 'none',
    audience: ['家庭用户', '极客用户', '社区浏览者'],
    features: [
      'Community / Forum / Marketplace 浏览',
      '免费插件、公开方案与案例收藏',
      '自有 Studio 的基础管理入口',
      '可向 Builder 发起远程协助请求',
      '完成 Professional Onboarding 后可进入 Builder Pro',
      'Personal Workspace 中可创建基础项目并体验专业工具',
      '每周刷新基础 Credits，体验 AI 对话和轻量方案能力',
    ],
    limits: [
      '高级导出、协作、Remote Service 和商业交付能力需升级',
      'Find Pros 展示、认证 Badge 和线索权益独立申请',
      '项目数量、Credits 和 Marketplace 权益有基础限制',
    ],
  },
  {
    id: 'pro',
    scope: 'personal',
    name: 'Pro',
    tagline: '个人账号升级 Pro，获得更多 Credits、高级导出和个人商业项目能力。',
    priceLabel: 'Region-based',
    monthly: -1,
    ctaLabel: 'Upgrade to Pro',
    available: true,
    highlight: 'recommended',
    creditsLabel: '2,000 Plan Credits / month',
    capabilityLevel: 'personal_plus',
    commercialEntitlement: 'project',
    findProfessionals: 'optional',
    audience: ['远程设计师', '独立 Installer', '插件开发者', '高级极客用户'],
    features: [
      'Personal Workspace 的高级项目、Studio 授权和远程服务能力',
      'Builder Design Platform：户型、空间图谱、点位与方案包',
      '每月 Plan Credits，用于 AI 对话、户型解析、方案和 3D 生成',
      '可购买 Add-on Credits 补充额度',
      'Professional Profile 可继续完善，并按规则发布到 Find Professionals',
      '可为自己的 Studio 或客户项目创建方案',
      '项目级 Commercial Entitlement 可单独记录或购买',
    ],
    limits: [
      '成为 Pro 不自动公开接单',
      '认证 Badge、线索优先级与商业授权独立管理',
      '服务费与设备款初期由团队或服务商按当地方式收款并在项目内记账',
    ],
  },
];

export const BUSINESS_PLANS: Plan[] = [
  {
    id: 'business',
    scope: 'business',
    name: 'Business',
    tagline: '账号为组织购买 Business，按席位获得共享 Plan Credits。',
    priceLabel: 'Region-based',
    monthly: -1,
    ctaLabel: '创建 Team Workspace',
    available: true,
    highlight: 'popular',
    creditsLabel: '3,000 Credits / seat / month',
    capabilityLevel: 'business',
    commercialEntitlement: 'project',
    findProfessionals: 'business',
    audience: ['设计工作室', '安装团队', '轻量服务商'],
    features: [
      '多人 Builder Pro 工作区与角色权限',
      '共享项目、客户、Studio 授权与服务会话',
      '组织共享 Plan Credits、成员上限和项目用量记录',
      '可购买 Shared Add-on Credits 补充组织额度',
      '团队成员可拥有各自 Badge 和 Professional Profile',
      '项目账本记录设计费、安装费、调试费和维护费',
    ],
    limits: [
      '不强制平台收款',
      'Business 不自动获得 Aqara Space、Service Provider 或区域线索权益',
      '项目商业授权仍按项目或区域政策确认',
    ],
  },
  {
    id: 'enterprise',
    scope: 'business',
    name: 'Enterprise',
    tagline: '账号为组织购买 Enterprise，按合同获得席位、Credits 和服务政策。',
    priceLabel: 'Contact Aqara',
    monthly: -1,
    ctaLabel: '联系 Aqara',
    available: true,
    creditsLabel: 'Contract Credits',
    capabilityLevel: 'enterprise',
    commercialEntitlement: 'contract',
    findProfessionals: 'private',
    audience: ['服务商门店', 'Aqara Space', '大型系统集成商', '地产 / 酒店 / 银行', '企业客户'],
    features: [
      '多组织、多区域、多项目组合管理',
      '私有 Marketplace、私有插件和专属模板库',
      '企业级权限、审计、SSO 和数据隔离',
      'Remote Service Console 高级诊断与运维审计',
      '合同 Credits、服务 SLA、补贴政策和采购体系按合同执行',
    ],
    limits: [
      '服务商、Aqara Space 和区域政策通过标签、认证和 Billing Policy 叠加',
      'Aqara 补贴不改变 Plan 名称，只改变费用承担方式',
    ],
  },
];

export const TEAM_PLANS = BUSINESS_PLANS;

export const ALL_PLANS: Plan[] = [...PERSONAL_PLANS, ...BUSINESS_PLANS];

export const PLAN_BENEFITS: Record<PlanId, PlanBenefits> = {
  free: {
    planId: 'free',
    planCredits: '每周基础 Credits',
    addOnCredits: '不可购买资源包',
    creditOwner: 'personal_account',
    creditPool: 'personal',
    marketplace: '免费资源和公开模板',
  },
  pro: {
    planId: 'pro',
    planCredits: '2,000 Credits / 月',
    addOnCredits: '个人 Add-on Credits',
    creditOwner: 'personal_account',
    creditPool: 'personal',
    marketplace: 'Pro 资源可安装到 Personal 或可管理的 Team Workspace',
  },
  business: {
    planId: 'business',
    planCredits: '3,000 Credits / 席位 / 月',
    addOnCredits: '组织 Shared Add-on Credits',
    creditOwner: 'organization',
    creditPool: 'organization',
    marketplace: 'Owner/Admin 安装到 Team Workspace',
  },
  enterprise: {
    planId: 'enterprise',
    planCredits: '合同 Credits',
    addOnCredits: '合同资源包 / 补贴额度',
    creditOwner: 'contract',
    creditPool: 'contract',
    marketplace: '合同授权、私有资源和官方补贴',
  },
};

export function getPlan(id: PlanId): Plan | undefined {
  return ALL_PLANS.find(p => p.id === id);
}

export function getPlanBenefits(id: PlanId): PlanBenefits {
  return PLAN_BENEFITS[id];
}

/** Role -> default visible personal plan for demo UI only. Professional identity is checked separately. */
export function planForRole(role: Role): Plan {
  if (role === 'anonymous') return PERSONAL_PLANS[0];
  return PERSONAL_PLANS[0];
}
