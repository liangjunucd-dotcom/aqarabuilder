import { getCustomer, TAG_LABEL } from './customers';

export type DesignStage = 'floor' | 'points' | 'logic' | 'visualize' | 'review' | 'deploy';

export type BuildingType = 'apartment' | 'villa' | 'office' | 'store' | 'stadium' | 'hotel' | 'school' | 'other';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  status: 'draft' | 'testing' | 'delivered' | 'active' | 'verified';
  visibility: 'private' | 'published' | 'verified';
  thumbnailGradient: string;
  appliedTo: number; // studios deployed
  devices: number;
  personas: number;
  updatedAt: string;
  createdAt: string;
  applyCount?: number;
  forkCount?: number;
  // ─── Aqara Design ↔ Project flow ───
  source: 'build-ai' | 'fork' | 'manual';
  customerId?: string;
  buildMode?: string;
  aBurned?: number;
  // ─── 5 阶段交付生命周期（v2） ───
  // 详见 docs/01-product/builder-pro-delivery-flow.md
  phase?: ProjectPhase;
  /** 方案设计成熟度 — 独立于交付阶段 phase */
  solutionStatus?: SolutionStatus;
  /** 设计平台当前成熟阶段，用于重新进入时恢复进度 */
  designStage?: DesignStage;
  country?: string;       // ISO 国家代码（用于 DC 推导）
  countryLabel?: string;  // 显示文案
  quotedAmount?: number;  // 报价金额（人民币元）
  warrantyDaysLeft?: number;
  customerName?: string;
  nextActionHint?: string; // 下一步提示给 Builder
  /** 项目来源：Builder Pro 创建 / Aqara Design 创建 */
  origin?: 'pro-console' | 'cubix';
  /** 当前是否已关联现场 Studio；未关联也可以先做方案设计 */
  linkedStudioId?: string | null;
  /** Design Platform 方案包版本 */
  solutionVersion?: string;
  /** 关联的源方案 ID（Your Solutions / Pro Solution Library 共用） */
  linkedSolutionId?: string | null;
  /** 关联方案名称（用于卡片展示，避免每次 lookup） */
  linkedSolutionName?: string | null;
  /** Remix 来源项目/方案 ID — 追溯创作链路 */
  remixSourceId?: string | null;
  /** Remix 链（从源头到当前的所有 remix 节点 ID，含自身） */
  remixChain?: string[];
  /** 客户原始需求与附件（方案包内长期留存） */
  customerBriefId?: string | null;
  /** 建筑类型 */
  buildingType?: BuildingType;
  /** Design Platform 当前 Building 名称 */
  buildingName?: string;
  /** Life Dashboard 已生成的 App 插件数量，用于恢复画布和判断制作状态 */
  lifeDashboardPluginCount?: number;
  /** Life Dashboard 最近一次用于生成的 Prompt */
  lifeDashboardLastPrompt?: string;
  // ─── 列表与仪表盘扩展字段 ───
  /** 标签（从客户标签推导或手动设置） */
  tags?: string[];
  /** 项目负责人（Builder 姓名） */
  managers?: string[];
  /** 城市（从客户 city 推导） */
  city?: string;
  /** 任务列表（仪表盘最近任务 + tasks Tab） */
  tasks?: ProjectTask[];
  /** 上传文件/图片（仪表盘最近文件 + files Tab） */
  files?: ProjectFile[];
  /** 财务摘要 */
  financials?: ProjectFinancial;
  /** 关键日程节点 */
  schedule?: ProjectScheduleMilestone[];
  // ─── 新状态系统字段 ───
  /** Houzz Pro 主状态 */
  projectStatus?: ProjectStatus;
  /** 自定义子状态标签 */
  managedStatus?: string;
  /** 标准化闭环生命周期状态（7 阶段） */
  lifecycleStatus?: ProjectLifecycleStatus;
  /** 关联的户型图列表 */
  floorPlans?: FloorPlanRef[];
  /** 项目备注 */
  notes?: ProjectNote[];
  /** Builder Pro 创建项目时的行业/项目类型显示名 */
  projectTypeLabel?: string;
  /** 标准化地址区域，例如 广东省 / 深圳市 / 南山区 */
  addressRegion?: string;
  /** 详细地址 */
  addressDetail?: string;
  /** 项目联系人 */
  contactName?: string;
  /** 项目联系电话 */
  contactPhone?: string;
  /** 项目背景描述 */
  backgroundDescription?: string;
}

/** 户型图引用 */
export interface FloorPlanRef {
  id: string;
  name: string;
  thumbnailPattern: 'top' | 'rooms' | 'cross' | 'L' | 'open' | 'two-floor';
  rooms: number;
  devices: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'finalized';
}

/** 项目备注 */
export interface ProjectNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  pinned?: boolean;
}

/** 项目任务 */
export interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
  due?: string;
  owner?: string;
  priority?: 'high' | 'medium' | 'low';
}

/** 项目文件/附件 */
export interface ProjectFile {
  name: string;
  size: string;
  kind: string;
  tag: 'planning' | 'delivery' | 'finance';
  uploadedAt?: string;
  count?: number;
}

/** 项目财务摘要 */
export interface ProjectFinancial {
  quotedAmount: number;
  invoicedAmount: number;
  paidAmount: number;
  pendingAmount: number;
  nextInvoiceDue?: string;
}

/** 项目日程节点 */
export interface ProjectScheduleMilestone {
  date: string;
  day: string;
  title: string;
  detail?: string;
  tone: 'planning' | 'critical' | 'info';
}

/**
 * 5 阶段交付生命周期 + 7 个关键节点。已废弃，请使用 ProjectStatus 代替。
 * @deprecated Use ProjectStatus instead
 */
export type ProjectPhase =
  | 'lead'
  | 'designing'
  | 'confirmed'
  | 'installing'
  | 'acceptance'
  | 'completed'
  | 'cancelled';

/**
 * Houzz Pro 风格项目状态 — 4 级主状态 + 可自定义的 Managed Status
 *
 *  open        → 立项/需求确认（原 lead + designing 前半段）
 *  in_progress → 设计深化 · 施工 · 验收
 *  done        → 已交付 · 维保期内
 *  closed      → 已归档 / 已取消
 */
export type ProjectStatus = 'open' | 'in_progress' | 'done' | 'closed';

export const STATUS_META: Record<ProjectStatus, { label: string; color: string; emoji: string; stage: 1 | 2 | 3 | 4 }> = {
  open:        { label: 'Open',         color: '#06b6d4', emoji: '📋', stage: 1 },
  in_progress: { label: 'In Progress',  color: '#a855f7', emoji: '🔧', stage: 2 },
  done:        { label: 'Done',         color: '#10b981', emoji: '✅', stage: 3 },
  closed:      { label: 'Closed',       color: '#64748b', emoji: '📁', stage: 4 },
};

export const STATUS_ORDER: ProjectStatus[] = ['open', 'in_progress', 'done', 'closed'];

/** 各主状态下预设的 Managed Status 标签 */
export const MANAGED_STATUS_PRESETS: Record<ProjectStatus, string[]> = {
  open:        ['New Lead', 'Awaiting Brief', 'Site Survey Scheduled'],
  in_progress: ['Design In Progress', 'Quote Pending', 'Scheduled', 'Installing', 'Awaiting Acceptance'],
  done:        ['Delivered', 'In Warranty', 'Post-Warranty Support'],
  closed:      ['Cancelled', 'Archived', 'Lost Opportunity'],
};

/** Phase → Status 迁移映射 */
const PHASE_TO_STATUS_MAP: Record<ProjectPhase, ProjectStatus> = {
  lead:       'open',
  designing:  'open',
  confirmed:  'in_progress',
  installing: 'in_progress',
  acceptance: 'in_progress',
  completed:  'done',
  cancelled:  'closed',
};

/** 解析项目主状态：优先使用 projectStatus 字段，兼容旧 phase */
export function resolveProjectStatus(p: { projectStatus?: ProjectStatus; phase?: ProjectPhase }): ProjectStatus {
  if (p.projectStatus) return p.projectStatus;
  if (p.phase) return PHASE_TO_STATUS_MAP[p.phase] ?? 'open';
  return 'open';
}

export const PHASE_TO_STAGE: Record<ProjectPhase, 1 | 2 | 3 | 4 | 5> = {
  'lead': 1,
  'designing': 2,
  'confirmed': 3,
  'installing': 4,
  'acceptance': 4,
  'completed': 5,
  'cancelled': 5,
};

export const PHASE_META: Record<ProjectPhase, { label: string; color: string; emoji: string }> = {
  'lead':       { label: '待确认',     color: '#64748b', emoji: '📋' },
  'designing':  { label: '方案设计中', color: '#a855f7', emoji: '✏️' },
  'confirmed':  { label: '待施工',     color: '#f59e0b', emoji: '📐' },
  'installing': { label: '施工中',     color: '#f59e0b', emoji: '🔧' },
  'acceptance': { label: '待验收',     color: '#10b981', emoji: '🤝' },
  'completed':  { label: '已完成',     color: '#10b981', emoji: '✅' },
  'cancelled':  { label: '已取消',     color: '#ef4444', emoji: '✖️' },
};

/** 方案设计成熟度 — 独立于交付阶段 */
export type SolutionStatus = 'draft' | 'editing' | 'finalized';

export const SOLUTION_STATUS_META: Record<SolutionStatus, { label: string; color: string; emoji: string }> = {
  'draft':     { label: '设计中', color: '#2563eb', emoji: '✏️' },
  'editing':   { label: '设计中', color: '#2563eb', emoji: '✏️' },
  'finalized': { label: '已确认', color: '#10b981', emoji: '✅' },
};

/** 解析方案状态，兼容未设置 solutionStatus 的遗留数据 */
export function resolveSolutionStatus(p: { solutionStatus?: SolutionStatus; customerId?: string; devices?: number; personas?: number }): SolutionStatus {
  if (p.solutionStatus) return p.solutionStatus;
  if (p.customerId) return 'finalized';
  if ((p.devices ?? 0) > 0 || (p.personas ?? 0) > 0) return 'editing';
  return 'draft';
}

/** 标准化闭环生命周期状态 — 7 阶段覆盖 discover → completed 全流程 */
export type ProjectLifecycleStatus = 'discover' | 'design' | 'procurement' | 'installation' | 'deployment' | 'diagnostics' | 'completed';

export const LIFECYCLE_STATUS_META: Record<ProjectLifecycleStatus, { label: string; sub: string; color: string; emoji: string; stage: number }> = {
  discover:     { label: 'Discover',      sub: '发现 · 需求确认',     color: '#06b6d4', emoji: '🔍', stage: 1 },
  design:       { label: 'Design',        sub: '方案设计 · 报价',     color: '#a855f7', emoji: '✏️', stage: 2 },
  procurement:  { label: 'Procurement',   sub: '设备采购 · 物流',     color: '#f59e0b', emoji: '📦', stage: 3 },
  installation: { label: 'Installation',  sub: '现场安装 · 入网',     color: '#ef4444', emoji: '🔧', stage: 4 },
  deployment:   { label: 'Deployment',    sub: '场景部署 · 验收',     color: '#8b5cf6', emoji: '🚀', stage: 5 },
  diagnostics:  { label: 'Diagnostics',   sub: '运维诊断 · 维保',     color: '#f97316', emoji: '🩺', stage: 6 },
  completed:    { label: 'Completed',     sub: '已完结 · 归档',       color: '#10b981', emoji: '✅', stage: 7 },
};

export const LIFECYCLE_STATUS_ORDER: ProjectLifecycleStatus[] = [
  'discover', 'design', 'procurement', 'installation', 'deployment', 'diagnostics', 'completed',
];

/** 将旧 phase / projectStatus 映射到标准化闭环生命周期 */
export function resolveLifecycleStatus(p: { lifecycleStatus?: ProjectLifecycleStatus; projectStatus?: ProjectStatus; phase?: ProjectPhase }): ProjectLifecycleStatus | null {
  if (p.lifecycleStatus) return p.lifecycleStatus;

  // 从 Houzz Pro 主状态推导
  if (p.projectStatus) {
    const map: Record<ProjectStatus, ProjectLifecycleStatus> = {
      open:        'discover',
      in_progress: 'installation',
      done:        'diagnostics',
      closed:      'completed',
    };
    return map[p.projectStatus] ?? null;
  }

  // 从旧 phase 推导
  if (p.phase) {
    const map: Record<ProjectPhase, ProjectLifecycleStatus> = {
      lead:       'discover',
      designing:  'design',
      confirmed:  'procurement',
      installing: 'installation',
      acceptance: 'deployment',
      completed:  'diagnostics',
      cancelled:  'completed',
    };
    return map[p.phase] ?? null;
  }

  return null;
}

export const MyProjects: Project[] = [
  // ─── 已绑定客户的进行中项目 ───
  {
    id: 'proj-lixs',
    title: '李先生家',
    subtitle: '140m² 三室两卫 · 老父同住',
    status: 'active',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
    appliedTo: 1,
    devices: 28,
    personas: 4,
    updatedAt: '2 hours ago',
    createdAt: '2026-05-08',
    source: 'build-ai',
    customerId: 'cust-li',
    buildMode: 'architect',
    aBurned: 240,
    phase: 'installing',
    solutionStatus: 'finalized',
    country: 'cn',
    countryLabel: '中国大陆',
    quotedAmount: 18800,
    customerName: '李先生',
    nextActionHint: '现场实施进行中 · 4/11 设备已绑',
    origin: 'pro-console',
    linkedStudioId: 'aq-li-001',
    solutionVersion: 'v1.2',
    customerBriefId: 'proj-lixs',
    tags: ['适老化', '三室'],
    managers: ['Jun (A)', 'Bob (B)'],
    city: '上海·徐汇',
    tasks: [
      { id: 't1', title: '确认客户需求上门时间', done: true, due: '5/20', owner: 'Jun (A)' },
      { id: 't2', title: 'M300 Studio 到货验收', done: false, due: '5/22', owner: 'Bob (B)', priority: 'high' },
      { id: 't3', title: '11 台设备批量入网', done: false, due: '5/22', owner: 'Bob (B)' },
      { id: 't4', title: '关键场景验证录屏', done: false, due: '5/23', owner: 'Bob (B)' },
      { id: 't5', title: '提交验收报告', done: false, due: '5/25', owner: 'Jun (A)', priority: 'medium' },
    ],
    files: [
      { name: '户型图_主屋.dwg', size: '2.4 MB', kind: 'dwg', tag: 'planning', uploadedAt: '5/15' },
      { name: '现场入门照片', size: '38.6 MB', kind: 'photos', tag: 'delivery', uploadedAt: '5/22', count: 12 },
      { name: '报价单_v1.2.pdf', size: '840 KB', kind: 'pdf', tag: 'finance', uploadedAt: '5/18' },
      { name: '施工进度记录', size: '15.2 MB', kind: 'video', tag: 'delivery', uploadedAt: '5/21', count: 3 },
    ],
    financials: { quotedAmount: 18800, invoicedAmount: 9400, paidAmount: 9400, pendingAmount: 9400, nextInvoiceDue: '验收后' },
    schedule: [
      { date: '5/18', day: '周三', title: '方案确认会议', tone: 'planning' },
      { date: '5/22', day: '周日', title: '现场实施日', detail: '上午到场 · 下午验收', tone: 'critical' },
      { date: '5/30', day: '周一', title: '自动结算 + 保修', tone: 'info' },
    ],
  },
  {
    id: 'proj-wang-villa',
    title: 'J氏别墅整装',
    subtitle: '380m² 双层 · 6 Persona · 142 设备',
    status: 'delivered',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)',
    appliedTo: 1,
    devices: 142,
    personas: 6,
    updatedAt: '3 days ago',
    createdAt: '2026-04-02',
    source: 'manual',
    customerId: 'cust-wang',
    aBurned: 580,
    phase: 'completed',
    solutionStatus: 'finalized',
    country: 'cn',
    countryLabel: '中国大陆',
    quotedAmount: 268000,
    warrantyDaysLeft: 67,
    customerName: 'J. Wang',
    nextActionHint: '保修期内 · 上周处理 1 个工单',
    origin: 'pro-console',
    linkedStudioId: 'aq-wang-villa',
    solutionVersion: 'v2.0',
    tags: ['别墅', '整装'],
    managers: ['Bob (B)'],
    city: '苏州·园区',
    tasks: [
      { id: 't1', title: '保修期内巡检', done: true, due: '5/15', owner: 'Bob (B)' },
      { id: 't2', title: '客户追加庭院灯光', done: false, due: '6/01', owner: 'Bob (B)', priority: 'medium' },
    ],
    files: [
      { name: '别墅平面图_F1.dwg', size: '4.2 MB', kind: 'dwg', tag: 'planning', uploadedAt: '4/01' },
      { name: '竣工现场全景', size: '52 MB', kind: 'photos', tag: 'delivery', uploadedAt: '4/20', count: 24 },
      { name: '质保卡_签收.pdf', size: '320 KB', kind: 'pdf', tag: 'finance', uploadedAt: '4/22' },
    ],
    financials: { quotedAmount: 268000, invoicedAmount: 268000, paidAmount: 268000, pendingAmount: 0 },
    schedule: [
      { date: '4/15', day: '周五', title: '竣工验收', tone: 'critical' },
      { date: '6/01', day: '周三', title: '半年例行巡检', tone: 'planning' },
    ],
  },
  {
    id: 'proj-geek',
    title: '极客单身公寓',
    subtitle: '自己家 · 24 Plugin · Matter Bridge',
    status: 'testing',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#06b6d4 0%,#6366f1 100%)',
    appliedTo: 1,
    devices: 41,
    personas: 1,
    updatedAt: 'just now',
    createdAt: '2026-05-09',
    source: 'manual',
    customerId: 'cust-self',
    phase: 'designing',
    solutionStatus: 'finalized',
    country: 'cn',
    countryLabel: '中国大陆',
    quotedAmount: 0,
    customerName: '自己家',
    nextActionHint: '自用 · 不走结算',
    origin: 'cubix',
    linkedStudioId: 'aq-geek-self',
    solutionVersion: 'v0.9',
    tags: ['极客', '实验'],
    managers: ['Jun (A)'],
    city: '上海·徐汇',
    tasks: [
      { id: 't1', title: 'Matter Bridge 稳定性测试', done: false, due: '5/28', owner: 'Jun (A)', priority: 'high' },
      { id: 't2', title: '24 Plugin 兼容性回归', done: true, due: '5/20', owner: 'Jun (A)' },
    ],
    files: [
      { name: 'Driver_Modbus.js', size: '18 KB', kind: 'js', tag: 'planning', uploadedAt: '5/10' },
      { name: 'LA 父母家远程配置.json', size: '4 KB', kind: 'json', tag: 'delivery', uploadedAt: '5/12' },
    ],
    financials: { quotedAmount: 0, invoicedAmount: 0, paidAmount: 0, pendingAmount: 0 },
    schedule: [
      { date: '5/28', day: '周六', title: 'Bridge 上线测试', tone: 'critical' },
    ],
  },
  {
    id: 'proj-rental',
    title: '出租公寓 · 房东省心包',
    subtitle: '标配 · 12 设备 · 可复用到 N 套房',
    status: 'draft',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#64748b 0%,#475569 100%)',
    appliedTo: 0,
    devices: 12,
    personas: 1,
    updatedAt: '1 week ago',
    createdAt: '2026-05-01',
    source: 'fork',
    customerId: 'cust-zhao',
    phase: 'lead',
    solutionStatus: 'finalized',
    country: 'cn',
    countryLabel: '中国大陆',
    quotedAmount: 6800,
    customerName: '赵房东',
    nextActionHint: '客户询单 18h · 待报价',
    tags: ['出租', '标配'],
    managers: ['Jun (A)'],
    city: '上海·静安',
    tasks: [
      { id: 't1', title: '回应客户询单', done: false, due: '5/20', owner: 'Jun (A)', priority: 'high' },
      { id: 't2', title: '准备出租方案报价', done: false, due: '5/21', owner: 'Jun (A)' },
    ],
    files: [
      { name: '出租公寓户型.pdf', size: '1.2 MB', kind: 'pdf', tag: 'planning', uploadedAt: '5/01' },
    ],
    financials: { quotedAmount: 6800, invoicedAmount: 0, paidAmount: 0, pendingAmount: 6800 },
    schedule: [
      { date: '5/21', day: '周六', title: '方案报价发送', tone: 'planning' },
    ],
  },
  {
    id: 'proj-wu-garden',
    title: '吴先生别墅 · 庭院二期',
    subtitle: '室外灯光 + 自动浇灌 + 安防',
    status: 'active',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#10b981 0%,#06b6d4 100%)',
    appliedTo: 1,
    devices: 18,
    personas: 2,
    updatedAt: '8 minutes ago',
    createdAt: '2026-05-06',
    source: 'build-ai',
    customerId: 'cust-wu',
    buildMode: 'planner',
    aBurned: 90,
    phase: 'acceptance',
    solutionStatus: 'finalized',
    country: 'cn',
    countryLabel: '中国大陆',
    quotedAmount: 32500,
    customerName: '吴先生',
    nextActionHint: '客户验收倒计时 28h',
    origin: 'pro-console',
    linkedStudioId: 'aq-wu-villa',
    solutionVersion: 'v1.0',
    linkedSolutionId: 'sol-villa-garden',
    linkedSolutionName: '别墅庭院 · 全屋安防 + 灯光',
    tags: ['别墅', '庭院'],
    managers: ['Jun (A)', 'Charlie (C)'],
    city: '杭州·西湖',
    tasks: [
      { id: 't1', title: '庭院灯光自动场景验证', done: true, due: '5/22', owner: 'Charlie (C)' },
      { id: 't2', title: '灌溉系统联动测试', done: true, due: '5/23', owner: 'Charlie (C)' },
      { id: 't3', title: '客户验收 walk-through', done: false, due: '5/25', owner: 'Jun (A)', priority: 'high' },
    ],
    files: [
      { name: '庭院点位图_v2.dwg', size: '3.8 MB', kind: 'dwg', tag: 'planning', uploadedAt: '5/06' },
      { name: '灌溉控制器配置.json', size: '2 KB', kind: 'json', tag: 'delivery', uploadedAt: '5/20' },
      { name: '验收清单_draft.docx', size: '156 KB', kind: 'doc', tag: 'finance', uploadedAt: '5/23' },
    ],
    financials: { quotedAmount: 32500, invoicedAmount: 32500, paidAmount: 16250, pendingAmount: 16250, nextInvoiceDue: '验收后' },
    schedule: [
      { date: '5/22', day: '周日', title: '庭院设备调试', tone: 'critical' },
      { date: '5/25', day: '周三', title: '客户验收日', detail: '下午 14:00 到场', tone: 'critical' },
      { date: '5/28', day: '周六', title: '二期竣工结算', tone: 'info' },
    ],
  },
  {
    id: 'proj-zhang-elder',
    title: '张奶奶适老化',
    subtitle: '90m² · 起夜防跌 · 紧急呼叫',
    status: 'delivered',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#10b981 0%,#06b6d4 100%)',
    appliedTo: 1,
    devices: 11,
    personas: 1,
    updatedAt: 'yesterday',
    createdAt: '2026-04-25',
    source: 'fork',
    customerId: 'cust-zhang',
    phase: 'completed',
    solutionStatus: 'finalized',
    country: 'cn',
    countryLabel: '中国大陆',
    quotedAmount: 8400,
    warrantyDaysLeft: 84,
    customerName: '张奶奶',
    nextActionHint: 'NPS 4.9 · 保修平稳',
    origin: 'pro-console',
    linkedStudioId: 'aq-eldercare-zhang',
    solutionVersion: 'v1.4',
    linkedSolutionId: 'sol-eldercare-90m',
    linkedSolutionName: '90m² 适老化标准方案',
    tags: ['适老化', '已完成'],
    managers: ['Jun (A)'],
    city: '上海·徐汇',
    tasks: [
      { id: 't1', title: 'FP2 雷达灵敏度微调', done: true, due: '4/28', owner: 'Jun (A)' },
      { id: 't2', title: '紧急按钮联动测试', done: true, due: '4/30', owner: 'Jun (A)' },
    ],
    files: [
      { name: '适老化方案说明.pdf', size: '1.1 MB', kind: 'pdf', tag: 'planning', uploadedAt: '4/20' },
      { name: '验收签字扫描.pdf', size: '420 KB', kind: 'pdf', tag: 'finance', uploadedAt: '4/30' },
    ],
    financials: { quotedAmount: 8400, invoicedAmount: 8400, paidAmount: 8400, pendingAmount: 0 },
    schedule: [
      { date: '4/25', day: '周一', title: '设备安装日', tone: 'critical' },
      { date: '4/30', day: '周六', title: '客户验收 + 签字', tone: 'critical' },
    ],
  },
  {
    id: 'proj-eu-villa',
    title: 'Schmidt 智能花园',
    subtitle: 'München · 双层别墅 · 室外 22 设备',
    status: 'active',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)',
    appliedTo: 1,
    devices: 22,
    personas: 3,
    updatedAt: '5 hours ago',
    createdAt: '2026-05-04',
    source: 'manual',
    customerId: 'cust-schmidt',
    phase: 'designing',
    solutionStatus: 'finalized',
    country: 'de',
    countryLabel: '德国',
    quotedAmount: 9800,
    customerName: 'A. Schmidt',
    nextActionHint: 'Lead 已 Won · 开始 Design Platform 方案设计',
    origin: 'pro-console',
    linkedStudioId: null,
    solutionVersion: 'v1.0',
    customerBriefId: 'proj-eu-villa',
    tags: ['别墅', '海外'],
    managers: ['Jun (A)', 'Bob (B)'],
    city: 'München',
    tasks: [
      { id: 't1', title: 'Lead 确认 + 需求分析', done: true, due: '5/10', owner: 'Jun (A)' },
      { id: 't2', title: '方案初步设计 (22 设备)', done: false, due: '5/28', owner: 'Bob (B)', priority: 'high' },
      { id: 't3', title: '跨时区视频会议', done: false, due: '5/30', owner: 'Jun (A)', priority: 'medium' },
    ],
    files: [
      { name: '花园平面图_München.dwg', size: '4.5 MB', kind: 'dwg', tag: 'planning', uploadedAt: '5/04' },
      { name: '需求邮件_原文.pdf', size: '280 KB', kind: 'pdf', tag: 'planning', uploadedAt: '5/04' },
    ],
    financials: { quotedAmount: 9800, invoicedAmount: 0, paidAmount: 0, pendingAmount: 9800 },
    schedule: [
      { date: '5/10', day: '周二', title: '需求确认完成', tone: 'planning' },
      { date: '5/28', day: '周六', title: '方案初稿交付', tone: 'critical' },
      { date: '5/30', day: '周一', title: '国际视频会议', detail: '德国时间 10:00 CET', tone: 'info' },
    ],
  },
  {
    id: 'proj-chen-aftercare',
    title: '陈先生家 · 售后巡检',
    subtitle: '180m² 主屋 · Studio 告警处理',
    status: 'active',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#f43f5e 0%,#f97316 100%)',
    appliedTo: 1,
    devices: 38,
    personas: 2,
    updatedAt: '14 hours ago',
    createdAt: '2026-03-20',
    source: 'manual',
    customerId: 'cust-chen',
    phase: 'completed',
    solutionStatus: 'finalized',
    country: 'cn',
    countryLabel: '中国大陆',
    quotedAmount: 18600,
    warrantyDaysLeft: 42,
    customerName: '陈先生',
    nextActionHint: 'Studio 离线 14h · 需远程协助',
    origin: 'pro-console',
    linkedStudioId: 'aq-chen-family',
    solutionVersion: 'v1.1',
    tags: ['售后', '告警'],
    managers: ['Jun (A)'],
    city: '上海·浦东',
    tasks: [
      { id: 't1', title: '排查 Studio 离线原因', done: false, due: 'today', owner: 'Jun (A)', priority: 'high' },
      { id: 't2', title: '同步客户远程处理结果', done: false, due: 'today', owner: 'Jun (A)' },
    ],
    files: [
      { name: '远程诊断日志.json', size: '48 KB', kind: 'json', tag: 'delivery', uploadedAt: '5/31' },
    ],
    financials: { quotedAmount: 18600, invoicedAmount: 18600, paidAmount: 18600, pendingAmount: 0 },
    schedule: [
      { date: '6/01', day: '周一', title: '远程售后巡检', tone: 'critical' },
    ],
  },
  {
    id: 'proj-liu-aftercare',
    title: '刘女士家 · 运维服务',
    subtitle: '120m² 三居 · 已交付持续服务',
    status: 'delivered',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#a855f7 0%,#ec4899 100%)',
    appliedTo: 1,
    devices: 32,
    personas: 2,
    updatedAt: '1 minute ago',
    createdAt: '2026-02-28',
    source: 'manual',
    customerId: 'cust-liu',
    phase: 'completed',
    solutionStatus: 'finalized',
    country: 'cn',
    countryLabel: '中国大陆',
    quotedAmount: 14200,
    warrantyDaysLeft: 58,
    customerName: '刘女士',
    nextActionHint: '月度运维正常 · 设备在线率 100%',
    origin: 'pro-console',
    linkedStudioId: 'aq-liu-family',
    solutionVersion: 'v1.0',
    tags: ['运维', '三居'],
    managers: ['Jun (A)'],
    city: '上海·浦东',
    tasks: [
      { id: 't1', title: '月度健康报告', done: true, due: '5/30', owner: 'Jun (A)' },
      { id: 't2', title: '下月巡检提醒', done: false, due: '6/30', owner: 'Jun (A)' },
    ],
    files: [
      { name: '月度健康报告.pdf', size: '620 KB', kind: 'pdf', tag: 'delivery', uploadedAt: '5/30' },
    ],
    financials: { quotedAmount: 14200, invoicedAmount: 14200, paidAmount: 14200, pendingAmount: 0 },
    schedule: [
      { date: '6/30', day: '周二', title: '下次例行巡检', tone: 'planning' },
    ],
  },

  // ─── Aqara Design 草稿 (未绑定客户) ───
  {
    id: 'draft-eldercare-180m',
    title: '180m² 适老化方案 (AI 草稿)',
    subtitle: 'AI 空间智能 Agent 生成 · 待关联客户 · 待勘察',
    status: 'draft',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#10b981 0%,#06b6d4 100%)',
    appliedTo: 0,
    devices: 22,
    personas: 4,
    updatedAt: 'just now',
    createdAt: '2026-05-11',
    source: 'build-ai',
    buildMode: 'architect',
    aBurned: 80,
    solutionStatus: 'editing',
    tags: ['方案', '适老化'],
    managers: ['Jun (A)'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'draft-modbus-driver',
    title: 'Modbus → Zigbee 桥 Driver (AI 草稿)',
    subtitle: 'Driver Studio · 工业协议接入',
    status: 'draft',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#0891b2 0%,#0e7490 100%)',
    appliedTo: 0,
    devices: 0,
    personas: 0,
    updatedAt: '昨天',
    createdAt: '2026-05-10',
    source: 'build-ai',
    buildMode: 'driver',
    aBurned: 50,
    solutionStatus: 'editing',
    tags: ['方案', '驱动'],
    managers: ['Jun (A)'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'draft-night-agent',
    title: '夜间老人异常 AI Agent (草稿)',
    subtitle: 'Service Agent · 待 Pcap 上传',
    status: 'draft',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#1e293b 0%,#3730a3 100%)',
    appliedTo: 0,
    devices: 0,
    personas: 1,
    updatedAt: '3 天前',
    createdAt: '2026-05-08',
    source: 'build-ai',
    buildMode: 'service-agent',
    aBurned: 100,
    solutionStatus: 'editing',
    tags: ['方案', 'AI Agent'],
    managers: ['Jun (A)'],
    tasks: [],
    files: [],
    schedule: [],
  },

  // ─── 已发布的 Verified 模板 ───
  {
    id: 'sol-eldercare-90m',
    title: '90m² 适老化标准方案',
    subtitle: '起夜防跌 · 紧急呼叫 · 子女远程关怀',
    status: 'verified',
    visibility: 'verified',
    thumbnailGradient: 'linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)',
    appliedTo: 1247,
    devices: 11,
    personas: 1,
    updatedAt: '2 weeks ago',
    createdAt: '2026-03-14',
    applyCount: 1247,
    forkCount: 89,
    source: 'manual',
    solutionStatus: 'finalized',
    designStage: 'review',
    solutionVersion: 'v2.0',
    tags: ['模板', '适老化', '社区精选'],
    managers: ['Aqara Lab'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'sol-geek-apartment-matter',
    title: '极客单身公寓 · Matter Bridge 方案',
    subtitle: '全语音控制 · 24 Plugin · 高密度设备实验',
    status: 'verified',
    visibility: 'verified',
    thumbnailGradient: 'linear-gradient(135deg,#06b6d4 0%,#6366f1 50%,#a855f7 100%)',
    appliedTo: 234,
    devices: 41,
    personas: 1,
    updatedAt: '5 days ago',
    createdAt: '2026-04-28',
    applyCount: 234,
    forkCount: 67,
    source: 'manual',
    solutionStatus: 'finalized',
    designStage: 'review',
    solutionVersion: 'v1.1',
    tags: ['模板', '极客', 'Matter'],
    managers: ['Aqara Lab'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'sol-family-three-room',
    title: '亲子三居标配',
    subtitle: '学习模式 · 安全区域 · 家长管控',
    status: 'verified',
    visibility: 'verified',
    thumbnailGradient: 'linear-gradient(135deg,#ec4899 0%,#a855f7 50%,#6366f1 100%)',
    appliedTo: 1876,
    devices: 38,
    personas: 4,
    updatedAt: '1 week ago',
    createdAt: '2026-02-20',
    applyCount: 1876,
    forkCount: 412,
    source: 'manual',
    solutionStatus: 'finalized',
    designStage: 'review',
    solutionVersion: 'v1.6',
    tags: ['模板', '亲子', '三居'],
    managers: ['Aqara Lab'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'sol-rental-landlord-pack',
    title: '出租公寓 · 房东省心包',
    subtitle: '低成本部署 · 漏水监控 · 房客隔离',
    status: 'verified',
    visibility: 'verified',
    thumbnailGradient: 'linear-gradient(135deg,#475569 0%,#64748b 100%)',
    appliedTo: 543,
    devices: 12,
    personas: 1,
    updatedAt: '6 days ago',
    createdAt: '2026-04-12',
    applyCount: 543,
    forkCount: 178,
    source: 'manual',
    solutionStatus: 'finalized',
    designStage: 'review',
    solutionVersion: 'v1.0',
    tags: ['模板', '出租', '标准化'],
    managers: ['Aqara Lab'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'sol-eldercare-story-kit',
    title: '适老化 Persona 故事包',
    subtitle: '夜起 · 午睡 · 子女远程关怀',
    status: 'verified',
    visibility: 'verified',
    thumbnailGradient: 'linear-gradient(135deg,#fbcfe8 0%,#ec4899 50%,#7c3aed 100%)',
    appliedTo: 312,
    devices: 11,
    personas: 1,
    updatedAt: 'last week',
    createdAt: '2026-03-22',
    applyCount: 312,
    forkCount: 45,
    source: 'manual',
    solutionStatus: 'finalized',
    designStage: 'review',
    solutionVersion: 'v1.3',
    tags: ['模板', 'Persona', '适老化'],
    managers: ['Aqara Lab'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'sol-family-multi-persona',
    title: '三代同堂 Persona 方案',
    subtitle: '父母作息 · 小孩学习 · 夫妻夜间模式',
    status: 'verified',
    visibility: 'verified',
    thumbnailGradient: 'linear-gradient(135deg,#fcd34d 0%,#f59e0b 50%,#dc2626 100%)',
    appliedTo: 145,
    devices: 38,
    personas: 4,
    updatedAt: '2 weeks ago',
    createdAt: '2026-03-01',
    applyCount: 145,
    forkCount: 67,
    source: 'manual',
    solutionStatus: 'finalized',
    designStage: 'review',
    solutionVersion: 'v1.2',
    tags: ['模板', '三代同堂', 'Persona'],
    managers: ['Aqara Lab'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'sol-minimal-japanese-flat',
    title: '现代日式一居方案',
    subtitle: '隐藏式设备 · 木质空间 · 低打扰运行',
    status: 'verified',
    visibility: 'verified',
    thumbnailGradient: 'linear-gradient(135deg,#e7e5e4 0%,#a8a29e 50%,#44403c 100%)',
    appliedTo: 89,
    devices: 18,
    personas: 1,
    updatedAt: 'last week',
    createdAt: '2026-04-04',
    applyCount: 89,
    forkCount: 23,
    source: 'manual',
    solutionStatus: 'finalized',
    designStage: 'review',
    solutionVersion: 'v1.0',
    tags: ['模板', '极简', '日式'],
    managers: ['Aqara Lab'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'proj-eldercare',
    title: '适老化万能方案 v2',
    subtitle: '可改造 · 起夜防跌 · 紧急呼叫',
    status: 'verified',
    visibility: 'verified',
    thumbnailGradient: 'linear-gradient(135deg,#10b981 0%,#06b6d4 100%)',
    appliedTo: 83,
    devices: 11,
    personas: 1,
    updatedAt: 'yesterday',
    createdAt: '2026-03-14',
    applyCount: 1247,
    forkCount: 89,
    source: 'manual',
    solutionStatus: 'finalized',
    tags: ['模板', '适老化'],
    managers: ['Aqara Lab'],
    tasks: [],
    files: [],
    schedule: [],
  },
  {
    id: 'proj-family',
    title: '亲子三居标配',
    subtitle: 'Verified · 家长管控 + 学习模式',
    status: 'verified',
    visibility: 'verified',
    thumbnailGradient: 'linear-gradient(135deg,#ec4899 0%,#a855f7 100%)',
    appliedTo: 42,
    devices: 38,
    personas: 4,
    updatedAt: '5 days ago',
    createdAt: '2026-02-20',
    applyCount: 1876,
    forkCount: 412,
    source: 'manual',
    solutionStatus: 'finalized',
    tags: ['模板', '亲子'],
    managers: ['Aqara Lab'],
    tasks: [],
    files: [],
    schedule: [],
  },
];

const CUBIX_PROJECTS_KEY = 'aqara_cubix_projects';
const DELETED_PROJECTS_KEY = 'aqara_deleted_projects';
const PHASE_OVERRIDES_KEY = 'aqara_project_phase_overrides';
const STUDIO_LINK_OVERRIDES_KEY = 'aqara_project_studio_links';
const IDE_HIDDEN_PROJECTS_KEY = 'aqara_ide_hidden_projects';

/** Builder Pro 种子项目 ID — Life / 深链保留；IDE 侧可「从列表隐藏」 */
export const SEED_PROJECT_IDS = new Set(MyProjects.map(p => p.id));

export function getIdeHiddenProjectIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(IDE_HIDDEN_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(IDE_HIDDEN_PROJECTS_KEY);
      return [];
    }
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    try {
      window.localStorage.removeItem(IDE_HIDDEN_PROJECTS_KEY);
    } catch {
      /* private mode / blocked storage */
    }
    return [];
  }
}

function writeIdeHiddenProjectIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(IDE_HIDDEN_PROJECTS_KEY, JSON.stringify(Array.from(new Set(ids))));
    window.dispatchEvent(new Event('aqara:cubix-projects-change'));
  } catch {
    /* quota / private browsing */
  }
}

/** 恢复 IDE 侧栏中被隐藏的演示项目（控制台可调用） */
export function clearIdeHiddenProjects() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(IDE_HIDDEN_PROJECTS_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('aqara:cubix-projects-change'));
}

/** 从 Design Platform 侧栏隐藏（种子项目走此路径，不进入 deleted 黑名单） */
export function hideProjectFromBuilderIde(projectId: string) {
  writeIdeHiddenProjectIds([...getIdeHiddenProjectIds(), projectId]);
}

/** Demo 推进阶段时使用的真实 Studio ID（避免 mock-studio-* 无法连接） */
export const PROJECT_DEFAULT_STUDIO: Record<string, string> = {
  'proj-lixs': 'aq-li-001',
  'proj-wu-garden': 'aq-wu-villa',
  'proj-wang-villa': 'aq-wang-villa',
  'proj-geek': 'aq-geek-self',
  'proj-zhang-elder': 'aq-eldercare-zhang',
  'proj-rental': 'aq-zhao-rental-1',
  'proj-eu-villa': 'aq-operator-demo',
  'proj-chen-aftercare': 'aq-chen-family',
  'proj-liu-aftercare': 'aq-liu-family',
};

function defaultStudioForProject(projectId: string): string | null {
  return PROJECT_DEFAULT_STUDIO[projectId] ?? null;
}

export function getStudioLinkOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STUDIO_LINK_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) ?? {};
  } catch {
    return {};
  }
}

function writeStudioLinkOverrides(map: Record<string, string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STUDIO_LINK_OVERRIDES_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event('aqara:cubix-projects-change'));
}

/** 解析项目应关联的 Studio（覆盖 mock-studio、localStorage 映射） */
export function resolveProjectStudioId(project: Pick<Project, 'id' | 'linkedStudioId'>): string | null {
  const override = getStudioLinkOverrides()[project.id];
  if (override) return override;
  const raw = project.linkedStudioId;
  if (!raw) return defaultStudioForProject(project.id);
  if (raw.startsWith('mock-studio-')) return defaultStudioForProject(project.id);
  return raw;
}

/** IDE / 项目上下文：持久化 Studio 关联 */
export function linkProjectToStudio(projectId: string, studioId: string) {
  if (typeof window === 'undefined') return;
  const map = getStudioLinkOverrides();
  map[projectId] = studioId;
  writeStudioLinkOverrides(map);

  const localProjects = getCubixLocalProjects();
  const localIdx = localProjects.findIndex(p => p.id === projectId);
  if (localIdx >= 0) {
    localProjects[localIdx] = { ...localProjects[localIdx], linkedStudioId: studioId };
    window.localStorage.setItem(CUBIX_PROJECTS_KEY, JSON.stringify(localProjects));
  }
}

// ─── Phase 顺序：7 个关键节点 ─────────────────────────────────────────────
export const PHASE_ORDER: ProjectPhase[] = [
  'lead',
  'designing',
  'confirmed',
  'installing',
  'acceptance',
  'completed',
];

// 旧 phase → 新 phase 迁移映射
const PHASE_MIGRATION: Record<string, ProjectPhase> = {
  'accepted': 'designing',
  'design-confirmed': 'confirmed',
  'studio-bound': 'installing',
  'mapping': 'installing',
  'mapped': 'installing',
  'deploying': 'installing',
  'installed': 'installing',
  'pending-acceptance': 'acceptance',
  'delivered': 'completed',
  'in-warranty': 'completed',
  'closed': 'completed',
};

/** Phase override 存储：projectId → phase（任意项目都可以被 demo 推进） */
export function getPhaseOverrides(): Record<string, ProjectPhase> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PHASE_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) ?? {};
    // 迁移旧 phase 值到新 phase 系统
    let migrated = false;
    for (const [id, phase] of Object.entries(parsed)) {
      if (typeof phase === 'string' && phase in PHASE_MIGRATION) {
        parsed[id] = PHASE_MIGRATION[phase];
        migrated = true;
      }
    }
    if (migrated) {
      window.localStorage.setItem(PHASE_OVERRIDES_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return {};
  }
}

function writePhaseOverrides(map: Record<string, ProjectPhase>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PHASE_OVERRIDES_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event('aqara:cubix-projects-change'));
}

/** 把任意项目推进到下一个状态 */
export function advanceProject(projectId: string): ProjectStatus | null {
  const all = getAllProjects();
  const project = all.find(p => p.id === projectId);
  if (!project) return null;
  const current = resolveProjectStatus(project);
  const idx = STATUS_ORDER.indexOf(current);
  if (idx < 0 || idx === STATUS_ORDER.length - 1) return current;
  const next = STATUS_ORDER[idx + 1];
  setProjectStatus(projectId, next);
  return next;
}

/** 把任意项目回退到上一个状态 */
export function rewindProject(projectId: string): ProjectStatus | null {
  const all = getAllProjects();
  const project = all.find(p => p.id === projectId);
  if (!project) return null;
  const current = resolveProjectStatus(project);
  const idx = STATUS_ORDER.indexOf(current);
  if (idx <= 0) return current;
  const prev = STATUS_ORDER[idx - 1];
  setProjectStatus(projectId, prev);
  return prev;
}

/** 把项目直接设到指定 phase（demo 用） */
export function setProjectPhase(projectId: string, phase: ProjectPhase) {
  if (typeof window === 'undefined') return;
  const map = getPhaseOverrides();
  map[projectId] = phase;
  writePhaseOverrides(map);

  // 如果是本地 cubix 项目，写到 cubix 仓库；否则只走 override
  const localProjects = getCubixLocalProjects();
  const localIdx = localProjects.findIndex(p => p.id === projectId);
  if (localIdx >= 0) {
    localProjects[localIdx] = {
      ...localProjects[localIdx],
      phase,
      projectStatus: PHASE_TO_STATUS_MAP[phase],
      // 当推进到 installing 时自动给一个 mock Studio
      linkedStudioId:
        (PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf('installing'))
          ? localProjects[localIdx].linkedStudioId || defaultStudioForProject(projectId)
          : localProjects[localIdx].linkedStudioId,
    };
    window.localStorage.setItem(CUBIX_PROJECTS_KEY, JSON.stringify(localProjects));
  }
}

/** 把项目直接设到指定 status */
export function setProjectStatus(projectId: string, status: ProjectStatus) {
  if (typeof window === 'undefined') return;
  const localProjects = getCubixLocalProjects();
  const localIdx = localProjects.findIndex(p => p.id === projectId);
  if (localIdx >= 0) {
    localProjects[localIdx] = {
      ...localProjects[localIdx],
      projectStatus: status,
      phase: statusToPhase(status, localProjects[localIdx].phase),
      linkedStudioId:
        (STATUS_ORDER.indexOf(status) >= STATUS_ORDER.indexOf('in_progress'))
          ? localProjects[localIdx].linkedStudioId || defaultStudioForProject(projectId)
          : localProjects[localIdx].linkedStudioId,
    };
    window.localStorage.setItem(CUBIX_PROJECTS_KEY, JSON.stringify(localProjects));
    window.dispatchEvent(new CustomEvent('aqara:cubix-projects-change'));
  }
  // Also update phase override for backward compat
  const map = getPhaseOverrides();
  const phaseOverride = statusToPhase(status);
  if (phaseOverride) {
    map[projectId] = phaseOverride;
    writePhaseOverrides(map);
  }
}

function statusToPhase(s: ProjectStatus, fallback?: ProjectPhase): ProjectPhase | undefined {
  const map: Record<ProjectStatus, ProjectPhase> = {
    open: 'lead',
    in_progress: 'installing',
    done: 'completed',
    closed: 'cancelled',
  };
  return fallback ? map[s] || fallback : map[s];
}

/** 重置所有 demo 阶段推进 */
export function resetPhaseOverrides() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PHASE_OVERRIDES_KEY);
  window.dispatchEvent(new Event('aqara:cubix-projects-change'));
}

/** 把 phase override 套用到原始 project 上 */
function applyPhaseOverrides(projects: Project[]): Project[] {
  const overrides = getPhaseOverrides();
  if (!Object.keys(overrides).length) return projects;
  const validPhases = new Set(PHASE_ORDER);
  return projects.map(p => {
    const ov = overrides[p.id];
    if (!ov || !validPhases.has(ov)) return p;
    return {
      ...p,
      phase: ov,
      linkedStudioId:
        !p.linkedStudioId && PHASE_ORDER.indexOf(ov) >= PHASE_ORDER.indexOf('installing')
          ? defaultStudioForProject(p.id)
          : p.linkedStudioId,
    };
  });
}

function uniqProjects(projects: Project[]) {
  const map = new Map<string, Project>();
  for (const p of projects) map.set(p.id, p);
  return Array.from(map.values());
}

export function getDeletedProjectIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DELETED_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeDeletedProjectIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify(Array.from(new Set(ids))));
}

export function getCubixLocalProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUBIX_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCubixLocalProject(project: Project) {
  if (typeof window === 'undefined') return;
  const normalized = normalizeProjectForDisplay(project);
  // Put the updated project last so it wins in uniqProjects (Map keeps last write)
  const next = uniqProjects([...getCubixLocalProjects(), normalized]);
  window.localStorage.setItem(CUBIX_PROJECTS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('aqara:cubix-projects-change'));
}

function isSystemGeneratedTitle(title?: string | null) {
  const text = (title ?? '').trim();
  return (
    /^Builder\s*IDE\s*方案\s*\d*$/i.test(text) ||
    /^未命名(?:\s*Design\s*Platform\s*项目|方案)?$/i.test(text)
  );
}

function buildReadableProjectTitle(project: Project) {
  if (!isSystemGeneratedTitle(project.title)) return project.title;
  if (project.customerName) return `${project.customerName} · 空间智能`;
  if (project.floorPlans?.[0]?.name) return `${project.floorPlans[0].name} · 空间模型`;
  if (project.linkedSolutionName && !isSystemGeneratedTitle(project.linkedSolutionName)) return project.linkedSolutionName;
  const suffix = project.id.replace(/^cubix-/, '').slice(-7);
  return suffix ? `空间智能草稿 · ${suffix}` : '空间智能草稿';
}

function buildReadableProjectSubtitle(project: Project, title: string) {
  const subtitle = project.subtitle?.trim();
  const isInternalSubtitle = /Builder\s*IDE|Aqara\s*Design\s*创建|Design\s*Platform\s*创建/i.test(subtitle ?? '');
  if (subtitle && !isInternalSubtitle) return subtitle;
  if (project.solutionStatus === 'finalized') return '方案已确认 · 可部署到 Studio';
  if (project.linkedStudioId) return '已关联 Studio · 可继续部署';
  if (project.devices > 0) return `${project.devices} 个点位 · 待确认方案`;
  if (project.floorPlans?.[0]) return `${project.floorPlans[0].rooms} 房间 · 户型设计中`;
  return title.includes('草稿') ? '户型待确认 · 点位待设计' : '空间智能 · 待确认';
}

export function normalizeProjectForDisplay(project: Project): Project {
  const title = buildReadableProjectTitle(project);
  return {
    ...project,
    title,
    subtitle: buildReadableProjectSubtitle(project, title),
    linkedSolutionName: project.linkedSolutionName && isSystemGeneratedTitle(project.linkedSolutionName)
      ? title
      : project.linkedSolutionName,
  };
}

export function deleteProject(projectId: string) {
  if (typeof window === 'undefined') return;
  // Remove from localStorage if present
  const localProjects = getCubixLocalProjects().filter(p => p.id !== projectId);
  window.localStorage.setItem(CUBIX_PROJECTS_KEY, JSON.stringify(localProjects));
  // Soft-delete — add to deleted list (works for both seed and local projects)
  writeDeletedProjectIds([...getDeletedProjectIds(), projectId]);
  window.dispatchEvent(new Event('aqara:cubix-projects-change'));
}

export function createCubixProject(title = '空间智能草稿', options: {
  country?: string;
  countryLabel?: string;
  buildingType?: BuildingType;
} = {}): Project {
  const now = new Date();
  const id = `cubix-${Date.now()}`;
  const project: Project = {
    id,
    title,
    subtitle: '户型待确认 · 点位待设计',
    status: 'draft' as any,
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#4f46e5 0%,#06b6d4 100%)',
    appliedTo: 0,
    devices: 0,
    personas: 0,
    updatedAt: 'just now',
    createdAt: now.toISOString().slice(0, 10),
    source: 'build-ai',
    buildMode: 'architect',
    phase: 'designing',
    solutionStatus: 'editing',
    origin: 'cubix',
    linkedStudioId: null,
    solutionVersion: 'v0.1',
    // 个人 Aqara Design 创建的项目同时也是一个个人方案：用同一 id 作为 solutionId，
    // 这样 Builder 前台「My Solutions」与 Builder Pro「Projects」共享同一资产。
    linkedSolutionId: id,
    linkedSolutionName: title,
    country: options.country ?? 'us',
    countryLabel: options.countryLabel ?? 'United States of America',
    buildingType: options.buildingType ?? 'office',
  };
  saveCubixLocalProject(project);
  return project;
}

/** 从 Lead 创建项目：Lead Name → Customer Name，自动带城市、标签、预算。转移所有资料。 */
export function createProjectFromLead(lead: {
  customer: string; city: string; budget: string; desc: string; tags: string[];
  notes?: ProjectNote[]; tasks?: ProjectTask[]; files?: ProjectFile[]; floorPlans?: FloorPlanRef[];
}): Project {
  const project = createCubixProject(`${lead.customer} · ${lead.tags[0] || '智能'}方案`);
  project.customerName = lead.customer;
  project.city = lead.city;
  project.subtitle = lead.desc.slice(0, 60);
  project.tags = [...lead.tags, 'Lead转化'];
  project.managers = ['Jun (A)'];
  project.source = 'manual';
  project.phase = 'lead';
  project.projectStatus = 'open';
  project.managedStatus = 'New Lead';
  project.country = 'cn';
  project.countryLabel = '中国大陆';
  project.origin = 'pro-console';
  // Transfer lead materials
  project.notes = lead.notes ?? [];
  project.tasks = (lead.tasks ?? []).map(t => ({ ...t, id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }));
  project.files = lead.files ?? [];
  project.floorPlans = lead.floorPlans ?? [];
  if (lead.budget) {
    const nums = lead.budget.match(/[\d.]+/g);
    if (nums) {
      const max = Math.max(...nums.map(n => parseFloat(n)));
      project.quotedAmount = max >= 100 ? max : max * 10000;
    }
  }
  if (project.quotedAmount) {
    project.financials = {
      quotedAmount: project.quotedAmount,
      invoicedAmount: 0,
      paidAmount: 0,
      pendingAmount: project.quotedAmount,
    };
  }
  saveCubixLocalProject(project);
  return project;
}

function applyStudioLinkOverrides(projects: Project[]): Project[] {
  const overrides = getStudioLinkOverrides();
  return projects.map(p => {
    const resolved = resolveProjectStudioId({
      id: p.id,
      linkedStudioId: overrides[p.id] ?? p.linkedStudioId,
    });
    if (!resolved || resolved === p.linkedStudioId) return p;
    return { ...p, linkedStudioId: resolved };
  });
}

/** 从关联 Customer 补充 tags / city / customerName 等展示字段 */
export function enrichProject(project: Project): Project {
  const normalized = normalizeProjectForDisplay(project);
  if (!normalized.customerId) return normalized;
  const customer = getCustomer(normalized.customerId);
  if (!customer) return normalized;
  return {
    ...normalized,
    customerName: normalized.customerName || customer.name,
    tags: normalized.tags?.length ? normalized.tags : [TAG_LABEL[customer.tag]],
    city: normalized.city ?? customer.city,
    managers: normalized.managers?.length ? normalized.managers : ['—'],
  };
}

export function getAllProjects() {
  const deleted = new Set(getDeletedProjectIds());
  // MyProjects seeds first, cubix localStorage second — so localStorage overrides win for duplicates
  const merged = uniqProjects([...MyProjects, ...getCubixLocalProjects()]).filter(
    p => !deleted.has(p.id) && p.title && p.title.trim().length > 0
  );
  return applyStudioLinkOverrides(applyPhaseOverrides(merged)).map(enrichProject);
}

/** 用户自己的真实方案库：仅来自本地创建/保存的数据，不混入演示种子。 */
export function getWorkspaceProjects() {
  const deleted = new Set(getDeletedProjectIds());
  const localOnly = getCubixLocalProjects().filter(
    p => !deleted.has(p.id) && p.title && p.title.trim().length > 0
  );
  return applyStudioLinkOverrides(applyPhaseOverrides(localOnly)).map(enrichProject);
}

function createCubixFallbackProject(id: string): Project {
  const suffix = id.replace(/^cubix-/, '').slice(-7);
  const title = suffix ? `空间智能草稿 · ${suffix}` : '空间智能草稿';
  return {
    id,
    title,
    subtitle: '户型待确认 · 点位待设计',
    status: 'draft',
    visibility: 'private',
    thumbnailGradient: 'linear-gradient(135deg,#2563eb 0%,#10b981 100%)',
    appliedTo: 0,
    devices: 0,
    personas: 0,
    updatedAt: 'just now',
    createdAt: new Date().toISOString().slice(0, 10),
    source: 'build-ai',
    buildMode: 'architect',
    phase: 'designing',
    solutionStatus: 'editing',
    designStage: 'floor',
    origin: 'cubix',
    linkedStudioId: null,
    solutionVersion: 'v0.1',
    linkedSolutionId: id,
    linkedSolutionName: title,
  };
}

export const getProject = (id: string) => {
  const project = getAllProjects().find(p => p.id === id);
  if (project) return project;
  const seedProject = MyProjects.find(p => p.id === id);
  if (seedProject) {
    const [restored] = applyStudioLinkOverrides(applyPhaseOverrides([seedProject])).map(enrichProject);
    return restored;
  }
  return id.startsWith('cubix-') ? createCubixFallbackProject(id) : undefined;
};

// ─── Floor Plan Persistence ──────────────────────────────────────────

const FLOOR_PLANS_DATA_KEY = 'aqara_floor_plans_data';

export interface FloorPlanDesignData {
  walls: { id: string; start: { x: number; y: number }; end: { x: number; y: number }; thickness: number }[];
  devices: { id: string; type: string; x: number; y: number; label: string }[];
  rooms: { id: string; name: string; x: number; y: number; w: number; h: number }[];
}

/** Get all floor plan design data from localStorage (keyed by floorPlanId) */
export function getFloorPlansDesignData(): Record<string, FloorPlanDesignData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(FLOOR_PLANS_DATA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/** Save detailed design data for a specific floor plan */
export function saveFloorPlanDesignData(floorPlanId: string, data: FloorPlanDesignData) {
  if (typeof window === 'undefined') return;
  const all = getFloorPlansDesignData();
  all[floorPlanId] = data;
  window.localStorage.setItem(FLOOR_PLANS_DATA_KEY, JSON.stringify(all));
}

/** Save a floor plan to a project — updates project.floorPlans and persists design data */
export function saveFloorPlanToProject(
  projectId: string,
  fp: FloorPlanRef,
  designData: FloorPlanDesignData,
) {
  if (typeof window === 'undefined') return;
  // Save design data
  saveFloorPlanDesignData(fp.id, designData);
  // Update project's floorPlans array
  const projects = getCubixLocalProjects();
  const existing = projects.find(p => p.id === projectId);
  if (existing) {
    const existingFps = existing.floorPlans ?? [];
    const idx = existingFps.findIndex(f => f.id === fp.id);
    let nextFps: FloorPlanRef[];
    if (idx >= 0) {
      nextFps = [...existingFps];
      nextFps[idx] = fp;
    } else {
      nextFps = [...existingFps, fp];
    }
    existing.floorPlans = nextFps;
    saveCubixLocalProject(existing);
  } else {
    // Project not in localStorage yet — create a stub
    const stub: Project = {
      id: projectId,
      title: fp.name,
      subtitle: `${fp.rooms} 房间 · ${fp.devices} 设备`,
      status: 'draft',
      visibility: 'private',
      thumbnailGradient: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
      appliedTo: 0,
      devices: 0,
      personas: 0,
      updatedAt: 'just now',
      createdAt: new Date().toISOString().slice(0, 10),
      source: 'manual',
      floorPlans: [fp],
    };
    saveCubixLocalProject(stub);
  }
}

// Helper splitters for /pro/projects 3-section view (legacy)
export const buildAIDrafts = () => getAllProjects().filter(p => p.source === 'build-ai' && !p.customerId);
export const customerProjects = () => getAllProjects().filter(p => !!p.customerId);
export const verifiedTemplates = () => getAllProjects().filter(p => p.visibility === 'verified');

export const cubixProjects = () => {
  const hidden = new Set(getIdeHiddenProjectIds());
  return getAllProjects().filter(
    p =>
      !hidden.has(p.id) &&
      p.visibility !== 'verified' &&
      (p.origin === 'cubix' || p.phase || p.source === 'build-ai')
  );
};

// ─── 5 阶段交付视图 helpers ───
export const deliveryProjects = () =>
  getAllProjects().filter(p => !!p.customerId && p.visibility !== 'verified' && !!p.phase);

export const proConsoleProjects = () =>
  getAllProjects().filter(p => p.visibility !== 'verified' && (!!p.phase || p.origin === 'cubix'));

export const groupByStage = (projects: Project[]) => {
  const result: Record<1 | 2 | 3 | 4 | 5, Project[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  for (const p of projects) {
    if (!p.phase) continue;
    const stage = PHASE_TO_STAGE[p.phase];
    if (stage == null) continue;
    result[stage].push(p);
  }
  return result;
};

export const groupByStatus = (projects: Project[]) => {
  const result: Record<ProjectStatus, Project[]> = { open: [], in_progress: [], done: [], closed: [] };
  for (const p of projects) {
    const s = resolveProjectStatus(p);
    result[s].push(p);
  }
  return result;
};

export const STAGE_META: Record<1 | 2 | 3 | 4 | 5, { label: string; sub: string; tool: string; toolHref: string; emoji: string; color: string }> = {
  1: { label: '立项',      sub: '售前沟通 · 需求确认',           tool: 'Builder Pro · Leads',    toolHref: '/pro/leads',       emoji: '📋', color: '#64748b' },
  2: { label: '设计',      sub: 'Design Platform 方案创作 · 报价',   tool: 'Design Platform',             toolHref: '/build?entry=pro', emoji: '✏️', color: '#a855f7' },
  3: { label: '待施工',    sub: '方案定稿 · 排期 · 准备施工包',  tool: 'Builder Pro',             toolHref: '#',                emoji: '📐', color: '#f59e0b' },
  4: { label: '施工 · 验收', sub: '现场施工 · 客户验收',        tool: 'Life App（Builder 模式）', toolHref: '/life/me/pro-toolbox', emoji: '🔧', color: '#f59e0b' },
  5: { label: '售后',      sub: '保修运维 · 结算 · 续约',       tool: 'Builder Pro',             toolHref: '#',                emoji: '🛡️', color: '#10b981' },
};
