import type { Capability } from './role';

export type ProWorkbenchModuleKey =
  | 'projects'
  | 'leads'
  | 'financials'
  | 'company';

export interface ProWorkbenchChild {
  href: string;
  label: string;
  desc: string;
  badge?: string;
  cap?: Capability;
}

export interface ProWorkbenchModule {
  key: ProWorkbenchModuleKey;
  href: string;
  label: string;
  exact?: boolean;
  badge?: string;
  cap?: Capability;
  flyoutDesc: string;
  productObject: string;
  principle: string;
  children: ProWorkbenchChild[];
}

export type ProWorkModeKey = 'personal' | 'remote' | 'delivery';

export const PRO_WORK_MODES = [
  {
    key: 'personal',
    label: 'Personal',
    shortLabel: '个人工作',
    desc: '个人 Pro 的草稿、远程服务和个人项目，商业责任归 Personal Workspace。',
    href: '/pro/projects?view=personal',
    color: '#a855f7',
  },
  {
    key: 'remote',
    label: 'Remote Jobs',
    shortLabel: '远程服务',
    desc: '从 Lead / Service Intent 接受远程设计、诊断或调优，系统生成 Project / Work Order。',
    href: '/pro/leads?type=remote_service',
    color: '#06b6d4',
  },
  {
    key: 'delivery',
    label: 'Delivery',
    shortLabel: '交付履约',
    desc: '项目内通过 Work Orders 承载设计、勘测、安装、调试、验收和维护。',
    href: '/pro/projects?view=delivery',
    color: '#10b981',
  },
] as const;

export const PRO_WORKBENCH_PRINCIPLES = [
  {
    title: 'Four domains only',
    desc: 'Builder Pro 默认一级菜单固定为 Projects、Leads、Financials、Company。',
  },
  {
    title: 'Workspace remains scope',
    desc: 'Workspace 仍然决定责任主体、Credits、项目、线索、结算和成员作用域，但不是一级菜单。',
  },
  {
    title: 'Project is the container',
    desc: '正式服务必须进入 Project Passport；用户不必手动新建，接受服务请求时系统可自动创建。',
  },
  {
    title: 'WorkOrder is fulfillment',
    desc: '远程设计、本地安装、Studio 调试、远程服务和维护都以 WorkOrder 作为履约单元。',
  },
  {
    title: 'AI attaches to objects',
    desc: 'AI Agent 输出必须挂到 Lead、Project、Design Package、WorkOrder、Quote 或 Service Session。',
  },
];

export type ProWorkbenchMenuGroupKey = 'projects' | 'leads' | 'financials' | 'company';

export const PRO_WORKBENCH_MENU_GROUPS: Record<ProWorkbenchMenuGroupKey, { label: string; desc: string }> = {
  projects: {
    label: 'Projects',
    desc: 'Project Passport、Work Orders、Studio 调试、验收和服务记录。',
  },
  leads: {
    label: 'Leads',
    desc: '客户咨询、平台派单、服务意图和成交转项目。',
  },
  financials: {
    label: 'Financials',
    desc: '报价、合同、发票、Credits、收款、结算和收益。',
  },
  company: {
    label: 'Company',
    desc: '公司资料、成员、认证、服务区域、官方项目资格和供给目录。',
  },
};

export const PRO_WORKBENCH_MENU_REVIEW = [
  {
    key: 'projects',
    group: 'projects',
    label: 'Projects',
    owns: 'ProjectPassport / WorkOrder',
    input: 'won lead, personal draft, service request, customer project',
    output: 'design-confirmed project, approved work order, accepted delivery',
    principle: '项目是业务容器；设计、交付、远程服务、Studio 和验收都折叠进项目。',
  },
  {
    key: 'leads',
    group: 'leads',
    label: 'Leads',
    owns: 'Lead / ServiceIntent / DispatchMatch',
    input: 'Find Pros, Life App, Marketplace, Aqara Space, manual referral',
    output: 'qualified lead, converted project or work order',
    principle: '线索是机会，不是履约证据；接受正式服务后必须进入 Project / WorkOrder。',
  },
  {
    key: 'financials',
    group: 'financials',
    label: 'Financials',
    owns: 'Quote / Contract / Invoice / Credit / Settlement',
    input: 'project, service plan, marketplace purchase, work order',
    output: 'commercial record, receivable state and settlement readiness',
    principle: 'Financials 承载旧 Ledger / Earnings，不做完整 ERP，但必须保留商业事实。',
  },
  {
    key: 'company',
    group: 'company',
    label: 'Company',
    owns: 'Company / Credential / Catalog',
    input: 'profile, team, certification, service area, marketplace supply',
    output: 'trust, permission, membership and service capability',
    principle: 'Company 证明团队或服务商能做这件事；个人资料留在 User Settings。',
  },
] as const;

export const PRO_WORKBENCH_MODULES: ProWorkbenchModule[] = [
  {
    key: 'projects',
    href: '/pro/projects',
    label: 'Projects',
    flyoutDesc: 'Project Passport、Work Orders、Studio 和验收记录',
    productObject: 'ProjectPassport / WorkOrder',
    principle: '所有正式服务都要回到 Project；WorkOrder 是履约单位。',
    children: [
      { href: '/pro/projects', label: 'All Projects', desc: '正式项目、个人草稿和远程服务项目' },
      { href: '/pro/projects?new=1', label: 'New Project', desc: '手动创建 Project Passport' },
      { href: '/pro/projects?tab=work-orders', label: 'Work Orders', desc: '远程设计、安装、调试和维护' },
      { href: '/build?entry=pro&demo_as=pro&workflow=space', label: 'Design Platform', desc: '带 Project 上下文打开空间方案' },
    ],
  },
  {
    key: 'leads',
    href: '/pro/leads',
    label: 'Leads',
    badge: '3',
    flyoutDesc: '客户咨询、平台派单、服务意图和转项目',
    productObject: 'Lead / ServiceIntent / DispatchMatch',
    principle: '接受正式服务时，系统创建 Project / WorkOrder。',
    cap: 'pro.leads.receive',
    children: [
      { href: '/pro/leads', label: 'Lead Inbox', badge: '3', desc: '询单、派单、区域机会', cap: 'pro.leads.receive' },
      { href: '/pro/leads?type=remote_design', label: 'Remote Design', desc: '个人可接远程设计单', cap: 'pro.leads.receive' },
      { href: '/pro/leads?type=remote_service', label: 'Remote Service', desc: '客户授权后的诊断与调优', cap: 'pro.leads.receive' },
      { href: '/pro/leads?stage=won', label: 'Won to Project', desc: '成交后建立 Project Passport', cap: 'pro.leads.receive' },
    ],
  },
  {
    key: 'financials',
    href: '/pro/financials',
    label: 'Financials',
    flyoutDesc: '报价、合同、发票、Credits、收款与结算',
    productObject: 'Quote / Contract / Invoice / Credit / Settlement',
    principle: '旧 Ledger / Earnings 归入 Financials。',
    cap: 'pro.purchase.order',
    children: [
      { href: '/pro/financials', label: 'Overview', desc: '项目商业事实和待处理收款', cap: 'pro.settlement.receive' },
      { href: '/pro/financials?tab=estimates', label: 'Estimates', desc: '报价、提案和变更单', cap: 'pro.purchase.order' },
      { href: '/pro/financials?tab=contracts', label: 'Contracts', desc: '电子签约和设计确认' },
      { href: '/pro/financials?tab=settlements', label: 'Settlements', desc: '安装工、团队和平台分账' },
    ],
  },
  {
    key: 'company',
    href: '/pro/company',
    label: 'Company',
    flyoutDesc: '公司资料、成员、认证、服务区域和供给目录',
    productObject: 'Company / Credential / Program / Catalog',
    principle: 'Company 管组织主体；Workspace Switcher 只切换当前工作容器。',
    children: [
      { href: '/pro/company?tab=overview', label: 'Company Overview', desc: '公司资料、标签和认证状态' },
      { href: '/pro/company?tab=organization', label: 'Members', desc: '团队成员、权限和邀请' },
      { href: '/pro/company?tab=credentials', label: 'Credentials', desc: '个人 Badge、资质和服务区域' },
      { href: '/pro/company?tab=catalog', label: 'Catalog', desc: '服务包、插件和方案供给' },
    ],
  },
];

export const PRO_DELIVERY_PIPELINE = [
  { key: 'lead', label: 'Lead', desc: 'Community / Life App / 门店询单', href: '/pro/leads', color: '#06b6d4' },
  { key: 'quote', label: 'Quote', desc: '需求确认、报价、客户签字', href: '/pro/projects?status=open', color: '#a855f7' },
  { key: 'sign', label: 'Sign', desc: '合同、押金、排期', href: '/pro/projects', color: '#f59e0b' },
  { key: 'deliver', label: 'Deliver', desc: '施工、部署、验收', href: '/pro/projects?status=in_progress', color: '#ef4444' },
  { key: 'post-care', label: 'Post-care', desc: '维保、复访、Showcase', href: '/pro/projects?status=done', color: '#10b981' },
];

export const PRO_OPERATING_LOOP = [
  {
    key: 'lead',
    label: 'Lead',
    object: 'Lead / Attribution',
    desc: 'SLA 响应、需求判断、归因记录',
    href: '/pro/leads',
    color: '#06b6d4',
  },
  {
    key: 'passport',
    label: 'Passport',
    object: 'Project Passport',
    desc: '客户、范围、报价、授权、证据链',
    href: '/pro/projects',
    color: '#6366f1',
  },
  {
    key: 'model',
    label: 'Model',
    object: 'SpaceModel / DesignPlan',
    desc: '户型、设备点位、Persona、部署包',
    href: '/pro/workshop',
    color: '#a855f7',
  },
  {
    key: 'install',
    label: 'Install',
    object: 'Installer Handoff',
    desc: '施工清单、入网回执、现场问题',
    href: '/pro/projects?status=in_progress',
    color: '#ef4444',
  },
  {
    key: 'runtime',
    label: 'Runtime',
    object: 'Customer Studio',
    desc: '客户授权、服务窗口、健康监控',
    href: '/pro/studios',
    color: '#10b981',
  },
  {
    key: 'ledger',
    label: 'Ledger',
    object: 'Quote / Payment / Acceptance',
    desc: '线下收款、验收、未来结算数据',
    href: '/pro/earnings',
    color: '#f59e0b',
  },
  {
    key: 'showcase',
    label: 'Showcase',
    object: 'Showcase / Privacy Mask',
    desc: '脱敏案例、内容回流、下一批线索',
    href: '/pro/showcase',
    color: '#22c55e',
  },
] as const;
