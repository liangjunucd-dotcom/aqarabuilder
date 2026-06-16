// ─────────────────────────────────────────────────────────────────────────────
// Studios + Workspaces — 统一数据模型（对齐 Builder 平台规则）
//
// 关键规则：
//   1. Studio 只能在本地端绑定到某个 Workspace；Builder 网页/前台不支持新增 Studio
//   2. 每个 Studio 必须归属一个 Workspace，云端只做管理
//   3. 当前账号在 Workspace 中的角色：owner | admin | member | guest
//      - owner: 完全控制（升降权、删除、转移）
//      - admin: 服务商交付完成后保留的运维权限（可远程维护，但不能转回所有权）
//      - member: 普通成员（被邀请加入），可正常使用
//      - guest: 临时访客，受限权限
//   4. Builder 前台默认显示个人/亲友 Space，不混入 Pro 客户托管 Space
//   5. Builder Pro 的 Spaces 只显示被 Project / OperatorGrant / ServiceSession 引用的客户托管 Space
// ─────────────────────────────────────────────────────────────────────────────

export type StudioHealth = 'healthy' | 'warning' | 'critical' | 'offline';
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';
export type WorkspaceBusinessScope = 'personal' | 'family_invited' | 'project_commissioning' | 'customer_managed' | 'customer_limited';
export type ProServiceStage = 'installing' | 'handover' | 'needs_access';

export interface Studio {
  id: string;
  deviceId: string;
  name: string;
  spaceName: string;
  spaceEmoji: string;
  workspaceId: string;
  health: StudioHealth;
  cpu: number;
  memory: number;
  uptime: number;
  devices: number;
  online: number;
  ipLocal: string;
  lastSeen: string;
  installedAt: string;
}

export interface WorkspaceMember {
  name: string;
  contact: string;
  role: WorkspaceRole;
  joinedAt?: string;
  isMe?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  emoji: string;
  region: 'CN' | 'US' | 'EU';
  flag: string;
  /** 当前账号在这个 Workspace 中的角色 */
  currentRole: WorkspaceRole;
  /** 创建/绑定时间 */
  createdAt: string;
  members: WorkspaceMember[];
  studioIds: string[];
  /** 前台 / Pro 的业务上下文。角色是权限事实，businessScope 是产品展示边界。 */
  businessScope?: WorkspaceBusinessScope;
  /** Builder Pro Space 托管列表使用的交付状态，不再从 owner/admin/member 直接推导。 */
  serviceStage?: ProServiceStage;
  /** 仅当 currentRole !== 'owner' 时存在，记录所有权信息 */
  ownerName?: string;
  ownerContact?: string;
  /** Pro 服务商专属：标记业务/客户身份；前台不展示 */
  customerLabel?: string;
  /** 转移记录（用于 Builder Pro 显示 timeline） */
  transferLog?: Array<{ ts: string; from: string; to: string; note?: string }>;
}

export interface ProjectCommissioningTarget {
  id: string;
  projectId: string;
  label: string;
  region: Workspace['region'];
  installerAccount: string;
  code: string;
  expiresAt: string;
  studioIds: string[];
  transferTarget: string;
}

// ─── Mock Workspaces ──────────────────────────────────────────────────────────

const ME = '我（Jun）';

export const Workspaces: Workspace[] = [
  // ── 个人 Workspace（我是 Owner）─────────────────────────────────
  {
    id: 'ws-home',
    name: '我的家',
    emoji: '🏠',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'owner',
    businessScope: 'personal',
    createdAt: '2024-11-12',
    members: [
      { name: ME, contact: '+86 138xxxx0001', role: 'owner', isMe: true, joinedAt: '2024-11-12' },
      { name: '配偶', contact: '+86 138xxxx0002', role: 'admin', joinedAt: '2024-12-01' },
      { name: '孩子', contact: '+86 138xxxx0003', role: 'member', joinedAt: '2025-01-15' },
      { name: '阿姨', contact: '+86 138xxxx0004', role: 'guest', joinedAt: '2025-08-20' },
    ],
    studioIds: ['aqarastudio-b9c4'],
  },
  {
    id: 'ws-la',
    name: '洛杉矶的家',
    emoji: '🌴',
    region: 'US',
    flag: '🇺🇸',
    currentRole: 'owner',
    businessScope: 'personal',
    createdAt: '2024-08-01',
    members: [
      { name: ME, contact: '+86 138xxxx0001', role: 'owner', isMe: true, joinedAt: '2024-08-01' },
    ],
    studioIds: ['aqarastudio-la'],
  },
  // ── 个人测试空间（Owner，只属于 Builder 前台的个人空间）──────────
  {
    id: 'ws-self',
    name: '我的测试空间',
    emoji: '🧪',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'owner',
    businessScope: 'personal',
    createdAt: '2024-09-01',
    members: [
      { name: ME, contact: '+86 138xxxx0001', role: 'owner', isMe: true, joinedAt: '2024-09-01' },
    ],
    studioIds: ['aq-geek-self', 'aq-young-couple', 'aq-test-studio-3', 'aq-test-studio-4'],
  },
  // ── 被邀请的 Workspace（我是 admin / member）──────────────────
  {
    id: 'ws-parents',
    name: '父母家',
    emoji: '🏡',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'admin',  // 父母是 Owner，我有管理权可以远程帮忙
    businessScope: 'family_invited',
    createdAt: '2025-03-20',
    ownerName: '父亲（爸爸）',
    ownerContact: '+86 138xxxx5678',
    members: [
      { name: '父亲（爸爸）', contact: '+86 138xxxx5678', role: 'owner', joinedAt: '2025-03-20' },
      { name: '母亲（妈妈）', contact: '+86 138xxxx5679', role: 'admin', joinedAt: '2025-03-20' },
      { name: ME, contact: '+86 138xxxx0001', role: 'admin', isMe: true, joinedAt: '2025-03-20' },
    ],
    studioIds: ['aqarastudio-parents'],
  },
];

// ─── Pro 服务商专属 Workspace（仅 Builder Pro 的 Space 托管可见）────────
// 这些 Space 的底层角色仍是 owner/admin/member，但进入 Pro 的原因不是“我能访问”，
// 而是它们被 Project、交付记录、OperatorGrant 或远程服务合同引用。
// Builder 前台默认不显示这些客户 Space，避免和“我的空间 / 亲友空间”混在一起。

export const ProServiceWorkspaces: Workspace[] = [
  // ── 已转移给业主，我保留 admin（Builder Pro 持续可见）──
  {
    id: 'ws-customer-li',
    name: '李先生家',
    emoji: '🏙️',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'admin',
    businessScope: 'customer_managed',
    serviceStage: 'handover',
    createdAt: '2024-11-08',
    ownerName: '李先生',
    ownerContact: '+86 138xxxx7788',
    customerLabel: '李先生 · 上海徐汇',
    members: [
      { name: '李先生', contact: '+86 138xxxx7788', role: 'owner', joinedAt: '2024-11-25' },
      { name: '李太太', contact: '+86 138xxxx7789', role: 'admin', joinedAt: '2024-11-25' },
      { name: ME + '（服务商）', contact: '+86 138xxxx0001', role: 'admin', isMe: true, joinedAt: '2024-11-08' },
    ],
    studioIds: ['aq-li-001'],
    transferLog: [
      { ts: '2024-11-08 09:30', from: ME + '（服务商）', to: ME + '（服务商）', note: '现场绑定 Studio 完成施工' },
      { ts: '2024-11-25 16:42', from: ME + '（服务商）', to: '李先生', note: '交付完成，转移所有权' },
    ],
  },
  {
    id: 'ws-customer-wang-villa',
    name: 'J氏别墅',
    emoji: '🏡',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'admin',
    businessScope: 'customer_managed',
    serviceStage: 'handover',
    createdAt: '2024-09-15',
    ownerName: 'J先生',
    ownerContact: '+86 139xxxx2233',
    customerLabel: 'J先生 · 苏州园区 · 高净值',
    members: [
      { name: 'J先生', contact: '+86 139xxxx2233', role: 'owner', joinedAt: '2024-10-12' },
      { name: ME + '（服务商）', contact: '+86 138xxxx0001', role: 'admin', isMe: true, joinedAt: '2024-09-15' },
    ],
    studioIds: ['aq-wang-villa'],
    transferLog: [
      { ts: '2024-10-12', from: ME + '（服务商）', to: 'J先生', note: '别墅装修完工，转移所有权' },
    ],
  },
  {
    id: 'ws-customer-wu-villa',
    name: '吴先生别墅',
    emoji: '🏡',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'admin',
    businessScope: 'customer_managed',
    serviceStage: 'handover',
    createdAt: '2026-01-18',
    ownerName: '吴先生',
    ownerContact: '+86 139xxxx7788',
    customerLabel: '吴先生 · 杭州西湖 · 庭院二期',
    members: [
      { name: '吴先生', contact: '+86 139xxxx7788', role: 'owner', joinedAt: '2026-01-18' },
      { name: ME + '（服务商）', contact: '+86 138xxxx0001', role: 'admin', isMe: true, joinedAt: '2026-01-18' },
    ],
    studioIds: ['aq-wu-villa'],
    transferLog: [
      { ts: '2026-01-18', from: ME + '（服务商）', to: '吴先生', note: '主屋一期交付，保留二期运维权限' },
    ],
  },
  // ── 出租房项目：业主把多个 Studio 都给我托管，我是 admin ──
  {
    id: 'ws-rental',
    name: '赵房东 · 出租公寓',
    emoji: '🏢',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'admin',
    businessScope: 'customer_managed',
    serviceStage: 'handover',
    createdAt: '2025-02-01',
    ownerName: '赵房东',
    ownerContact: '+86 137xxxx5555',
    customerLabel: '赵房东 · 上海静安',
    members: [
      { name: '赵房东', contact: '+86 137xxxx5555', role: 'owner', joinedAt: '2025-02-15' },
      { name: ME + '（服务商）', contact: '+86 138xxxx0001', role: 'admin', isMe: true, joinedAt: '2025-02-01' },
    ],
    studioIds: ['aq-zhao-rental-1', 'aq-zhao-rental-2'],
    transferLog: [
      { ts: '2025-02-15', from: ME + '（服务商）', to: '赵房东', note: '两套出租公寓交付' },
    ],
  },
  // ── 张奶奶家：项目调试目标。不是普通账号 Space，不进入 Studio Web / Builder 前台 Space 列表 ──
  {
    id: 'ws-zhang-eldercare',
    name: '张奶奶家 · 项目调试目标',
    emoji: '👵',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'owner',
    businessScope: 'project_commissioning',
    serviceStage: 'installing',
    createdAt: '2026-05-10',
    customerLabel: '张奶奶女儿 · 待转移给客户 Space',
    members: [
      { name: ME + '（服务商）', contact: '+86 138xxxx0001', role: 'owner', isMe: true, joinedAt: '2026-05-10' },
    ],
    studioIds: ['aq-eldercare-zhang'],
    // 转移记录留空，交付完成后转移给客户，服务商保留 Admin 或限时 OperatorGrant
  },
  // ── 业主只给了 Operator（member）权限，无法直接 Connect，需 Request Access ──
  {
    id: 'ws-operator-demo',
    name: '未来公寓（示范楼）',
    emoji: '🏗️',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'member',      // 业主没给 Admin，只给了普通成员权限
    businessScope: 'customer_limited',
    serviceStage: 'needs_access',
    createdAt: '2026-03-01',
    ownerName: '开发商 · 王总',
    ownerContact: '+86 133xxxx6600',
    customerLabel: '开发商 · 精装示范单位',
    members: [
      { name: '开发商 · 王总', contact: '+86 133xxxx6600', role: 'owner', joinedAt: '2026-03-01' },
      { name: ME + '（服务商）', contact: '+86 138xxxx0001', role: 'member', isMe: true, joinedAt: '2026-04-10' },
    ],
    studioIds: ['aq-operator-demo'],
  },
  // ── 故障告警客户 ──
  {
    id: 'ws-customer-chen',
    name: '陈先生家',
    emoji: '🏙️',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'admin',
    businessScope: 'customer_managed',
    serviceStage: 'handover',
    createdAt: '2024-06-12',
    ownerName: '陈先生',
    ownerContact: '+86 136xxxx9999',
    customerLabel: '陈先生 · 上海浦东',
    members: [
      { name: '陈先生', contact: '+86 136xxxx9999', role: 'owner' },
      { name: ME + '（服务商）', contact: '+86 138xxxx0001', role: 'admin', isMe: true },
    ],
    studioIds: ['aq-chen-family'],
    transferLog: [{ ts: '2024-07-05', from: ME + '（服务商）', to: '陈先生' }],
  },
  {
    id: 'ws-customer-liu',
    name: '刘女士家',
    emoji: '🏙️',
    region: 'CN',
    flag: '🇨🇳',
    currentRole: 'admin',
    businessScope: 'customer_managed',
    serviceStage: 'handover',
    createdAt: '2024-05-20',
    ownerName: '刘女士',
    ownerContact: '+86 135xxxx1111',
    customerLabel: '刘女士 · 上海浦东',
    members: [
      { name: '刘女士', contact: '+86 135xxxx1111', role: 'owner' },
      { name: ME + '（服务商）', contact: '+86 138xxxx0001', role: 'admin', isMe: true },
    ],
    studioIds: ['aq-liu-family'],
    transferLog: [{ ts: '2024-06-10', from: ME + '（服务商）', to: '刘女士' }],
  },
];

export const ProjectCommissioningTargets: ProjectCommissioningTarget[] = [
  {
    id: 'comm-zhang-eldercare',
    projectId: 'proj-zhang-elder',
    label: '张奶奶家 · 现场施工调试',
    region: 'CN',
    installerAccount: '+86 138xxxx0001',
    code: 'ZHANG-0510-7QK2',
    expiresAt: '2026-06-08 23:59',
    studioIds: ['aq-eldercare-zhang'],
    transferTarget: '张奶奶女儿账号下的客户 Space',
  },
];

// ─── My Studios ───────────────────────────────────────────────────────────────

export const MyStudios: Studio[] = [
  {
    id: 'aqarastudio-b9c4',
    deviceId: 'lumi3.a414b5a8dabc4e03',
    name: 'aqarastudio-b9c4',
    spaceName: '我的家',
    spaceEmoji: '🏠',
    workspaceId: 'ws-home',
    health: 'healthy',
    cpu: 28, memory: 41, uptime: 99.8,
    devices: 47, online: 45,
    ipLocal: '192.168.1.117',
    lastSeen: '刚刚',
    installedAt: '2024-11-12',
  },
  {
    id: 'aqarastudio-parents',
    deviceId: 'lumi3.b2c3d4e5f6a70001',
    name: 'aqarastudio-parents',
    spaceName: '父母家',
    spaceEmoji: '🏡',
    workspaceId: 'ws-parents',
    health: 'healthy',
    cpu: 18, memory: 32, uptime: 99.1,
    devices: 22, online: 21,
    ipLocal: '192.168.31.5',
    lastSeen: '2 分钟前',
    installedAt: '2025-03-20',
  },
  {
    id: 'aqarastudio-la',
    deviceId: 'lumi3.c3d4e5f6a7b80002',
    name: 'aqarastudio-la',
    spaceName: '洛杉矶的家',
    spaceEmoji: '🌴',
    workspaceId: 'ws-la',
    health: 'offline',
    cpu: 0, memory: 0, uptime: 94.2,
    devices: 18, online: 0,
    ipLocal: '10.0.1.42',
    lastSeen: '8 小时前',
    installedAt: '2024-08-01',
  },
  {
    id: 'aq-geek-self',
    deviceId: 'lumi3.geek001',
    name: 'aq-geek-self',
    spaceName: '测试空间 · 公寓',
    spaceEmoji: '🧪',
    workspaceId: 'ws-self',
    health: 'healthy',
    cpu: 22, memory: 38, uptime: 99.6,
    devices: 41, online: 41,
    ipLocal: '192.168.1.50',
    lastSeen: '刚刚',
    installedAt: '2024-09-01',
  },
  {
    id: 'aq-young-couple',
    deviceId: 'lumi3.couple001',
    name: 'aq-young-couple',
    spaceName: '测试空间 · 小户型',
    spaceEmoji: '🧪',
    workspaceId: 'ws-self',
    health: 'healthy',
    cpu: 20, memory: 32, uptime: 99.8,
    devices: 24, online: 24,
    ipLocal: '192.168.1.80',
    lastSeen: '刚刚',
    installedAt: '2024-09-15',
  },
  {
    id: 'aq-test-studio-3',
    deviceId: 'lumi3.test003',
    name: 'aq-test-studio-3',
    spaceName: '测试空间 · 适老化样板',
    spaceEmoji: '🧪',
    workspaceId: 'ws-self',
    health: 'warning',
    cpu: 55, memory: 72, uptime: 97.1,
    devices: 18, online: 17,
    ipLocal: '192.168.1.81',
    lastSeen: '15 分钟前',
    installedAt: '2025-01-10',
  },
  {
    id: 'aq-test-studio-4',
    deviceId: 'lumi3.test004',
    name: 'aq-test-studio-4',
    spaceName: '测试空间 · 办公室',
    spaceEmoji: '🧪',
    workspaceId: 'ws-self',
    health: 'offline',
    cpu: 0, memory: 0, uptime: 91.5,
    devices: 32, online: 0,
    ipLocal: '192.168.1.82',
    lastSeen: '3 天前',
    installedAt: '2025-03-05',
  },
];

// ─── Pro Service Studios（属于 Pro 服务的 customer workspaces）────────────────

export interface ProManagedStudio extends Studio {
  customer: string;
  city: string;
  alerts?: number;
  workspaceName: string;
  workspaceEmoji: string;
}

export const ProManagedStudios: ProManagedStudio[] = [
  { id: 'aq-li-001', name: 'aq-li-001', deviceId: 'lumi3.li001', customer: '李先生家', spaceName: '主屋', spaceEmoji: '🏙️', workspaceId: 'ws-customer-li', workspaceName: '李先生家', workspaceEmoji: '🏙️', city: '上海·徐汇', health: 'healthy', cpu: 28, memory: 41, uptime: 99.8, devices: 28, online: 28, ipLocal: '192.168.1.10', lastSeen: '刚刚', installedAt: '2024-11-08' },
  { id: 'aq-wang-villa', name: 'aq-wang-villa', deviceId: 'lumi3.wang001', customer: 'J氏别墅', spaceName: '一楼+二楼', spaceEmoji: '🏡', workspaceId: 'ws-customer-wang-villa', workspaceName: 'J氏别墅', workspaceEmoji: '🏡', city: '苏州·园区', health: 'healthy', cpu: 35, memory: 52, uptime: 99.5, devices: 142, online: 138, ipLocal: '192.168.1.20', lastSeen: '2 分钟前', installedAt: '2024-10-12' },
  { id: 'aq-zhao-rental-1', name: 'aq-zhao-rental-1', deviceId: 'lumi3.zhao001', customer: '赵房东 · #1', spaceName: '101', spaceEmoji: '🏢', workspaceId: 'ws-rental', workspaceName: '赵房东 · 出租公寓', workspaceEmoji: '🏢', city: '上海·静安', health: 'healthy', cpu: 12, memory: 22, uptime: 99.9, devices: 12, online: 12, ipLocal: '192.168.1.30', lastSeen: '5 分钟前', installedAt: '2025-02-15' },
  { id: 'aq-zhao-rental-2', name: 'aq-zhao-rental-2', deviceId: 'lumi3.zhao002', customer: '赵房东 · #2', spaceName: '102', spaceEmoji: '🏢', workspaceId: 'ws-rental', workspaceName: '赵房东 · 出租公寓', workspaceEmoji: '🏢', city: '上海·静安', health: 'healthy', cpu: 14, memory: 24, uptime: 99.9, devices: 12, online: 12, ipLocal: '192.168.1.31', lastSeen: '5 分钟前', installedAt: '2025-02-15' },
  { id: 'aq-chen-family', name: 'aq-chen-family', deviceId: 'lumi3.chen001', customer: '陈先生家', spaceName: '主屋', spaceEmoji: '🏙️', workspaceId: 'ws-customer-chen', workspaceName: '陈先生家', workspaceEmoji: '🏙️', city: '上海·浦东', health: 'critical', cpu: 8, memory: 15, uptime: 87.3, devices: 38, online: 28, ipLocal: '192.168.1.60', lastSeen: '14 小时前', installedAt: '2024-07-05', alerts: 3 },
  { id: 'aq-liu-family', name: 'aq-liu-family', deviceId: 'lumi3.liu001', customer: '刘女士家', spaceName: '三居', spaceEmoji: '🏙️', workspaceId: 'ws-customer-liu', workspaceName: '刘女士家', workspaceEmoji: '🏙️', city: '上海·浦东', health: 'healthy', cpu: 30, memory: 44, uptime: 99.4, devices: 32, online: 32, ipLocal: '192.168.1.70', lastSeen: '1 分钟前', installedAt: '2024-06-10' },
  { id: 'aq-wu-villa', name: 'aq-wu-villa', deviceId: 'lumi3.wu001', customer: '吴先生别墅', spaceName: '上下两层', spaceEmoji: '🏡', workspaceId: 'ws-customer-wu-villa', workspaceName: '吴先生别墅', workspaceEmoji: '🏡', city: '杭州·西湖', health: 'healthy', cpu: 38, memory: 50, uptime: 99.2, devices: 96, online: 95, ipLocal: '192.168.1.90', lastSeen: '8 分钟前', installedAt: '2026-01-18' },
  { id: 'aq-eldercare-zhang', name: 'aq-eldercare-zhang', deviceId: 'lumi3.zhang001', customer: '张奶奶家', spaceName: '主屋', spaceEmoji: '👵', workspaceId: 'ws-zhang-eldercare', workspaceName: '张奶奶家', workspaceEmoji: '👵', city: '上海·徐汇', health: 'warning', cpu: 41, memory: 68, uptime: 98.2, devices: 11, online: 10, ipLocal: '192.168.1.40', lastSeen: '1 小时前', installedAt: '2026-05-10', alerts: 1 },
  { id: 'aq-operator-demo', name: 'aq-operator-demo', deviceId: 'lumi3.demo001', customer: '未来公寓', spaceName: '示范单位', spaceEmoji: '🏗️', workspaceId: 'ws-operator-demo', workspaceName: '未来公寓（示范楼）', workspaceEmoji: '🏗️', city: '上海·青浦', health: 'healthy', cpu: 18, memory: 28, uptime: 99.9, devices: 62, online: 62, ipLocal: '192.168.2.10', lastSeen: '1 分钟前', installedAt: '2026-04-10' },
];

// ─── Helpers & Display Meta ───────────────────────────────────────────────────

export const ROLE_META: Record<WorkspaceRole, { label: string; color: string; desc: string }> = {
  owner:  { label: 'Owner',  color: '#10b981', desc: '所有者 · 完整控制权' },
  admin:  { label: 'Admin',  color: '#06b6d4', desc: '管理员 · 远程运维' },
  member: { label: 'Member', color: '#6366f1', desc: '成员 · 正常使用' },
  guest:  { label: 'Guest',  color: '#94a3b8', desc: '访客 · 受限权限' },
};

export const HEALTH_META: Record<StudioHealth, { label: string; color: string }> = {
  healthy:  { label: '在线', color: '#10b981' },
  warning:  { label: '预警', color: '#f59e0b' },
  critical: { label: '告警', color: '#f43f5e' },
  offline:  { label: '离线', color: '#64748b' },
};

/**
 * Builder 前台可见的 Workspace = 我自己的家庭 / 被邀请加入的家庭。
 * 不包含专业交付中的客户项目 Space，即便当前技术上仍是 owner，
 * 这些空间也应只在 Builder Pro 的客户/服务视图中按 Workspace 上下文出现。
 */
export function getFrontendWorkspaces(): Workspace[] {
  return Workspaces;
}

export function getFrontendOwnerWorkspaces(): Workspace[] {
  return Workspaces.filter(workspace => workspace.currentRole === 'owner');
}

export function getFrontendInvitedWorkspaces(): Workspace[] {
  return Workspaces.filter(workspace => workspace.currentRole !== 'owner');
}

/** Builder Pro 的 Space 托管视图：只看项目/服务关系下的客户 Space */
export function getProServiceWorkspaces(): Workspace[] {
  return ProServiceWorkspaces;
}

export function isInstallerStagingWorkspace(workspace: Workspace): boolean {
  return workspace.businessScope === 'project_commissioning';
}

export function isCustomerManagedWorkspace(workspace: Workspace): boolean {
  return workspace.businessScope === 'customer_managed' || workspace.businessScope === 'customer_limited';
}

/** 当前账号有底层访问角色的全部 Space；仅用于权限判断，不应用作默认列表 */
export function getProConsoleWorkspaces(): Workspace[] {
  return [...Workspaces, ...ProServiceWorkspaces];
}

/** Studio Web 输入账号后的普通 Space 列表：不包含项目调试目标。 */
export function getStudioWebAccountSpaces(): Workspace[] {
  return [...Workspaces, ...ProServiceWorkspaces].filter(
    workspace => workspace.businessScope !== 'project_commissioning'
  );
}

/** 施工人员通过 Project Code / QR 进入的调试目标，不属于普通 Space 列表。 */
export function getProjectCommissioningTargets(): ProjectCommissioningTarget[] {
  return ProjectCommissioningTargets;
}

function uniqueStudios<T extends Studio>(studios: T[]): T[] {
  return [...new Map(studios.map(studio => [studio.id, studio])).values()];
}

export function getStudio(id: string): Studio | undefined {
  return [...MyStudios, ...ProManagedStudios].find(s => s.id === id);
}

export function getStudiosForWorkspace(workspaceId: string): Studio[] {
  return uniqueStudios([...MyStudios, ...ProManagedStudios].filter(s => s.workspaceId === workspaceId));
}

export function studioStats() {
  const total = MyStudios.length;
  const online = MyStudios.filter(s => s.health === 'healthy' || s.health === 'warning').length;
  const totalDevices = MyStudios.reduce((n, s) => n + s.devices, 0);
  return { total, online, totalDevices };
}

// ─── Legacy compatibility ─────────────────────────────────────────────────────
// 旧代码使用 ownership='owner'/'service-only'/'pending-transfer'/'managing'
// 为兼容性保留 type alias，但现在主要靠 Workspace.currentRole

export type StudioOwnership = 'owner' | 'service-only' | 'pending-transfer' | 'managing';

export const OWNERSHIP_META: Record<StudioOwnership, { label: string; color: string; desc: string }> = {
  'owner':            { label: '我的',     color: '#10b981', desc: '完整控制权' },
  'service-only':     { label: '已交付',   color: '#06b6d4', desc: '已转给客户，保留服务权' },
  'pending-transfer': { label: '施工中',   color: '#f59e0b', desc: '待交付转移' },
  'managing':         { label: '受托管理', color: '#06b6d4', desc: '专业服务中' },
};

/** 旧字段兼容：根据 workspace.currentRole 推导 */
export function getStudioOwnership(s: Studio | ProManagedStudio): StudioOwnership {
  const wsId = s.workspaceId;
  const ws = [...Workspaces, ...ProServiceWorkspaces].find(w => w.id === wsId);
  if (!ws) return 'owner';
  if (ws.businessScope === 'project_commissioning') return 'pending-transfer';
  if (ws.businessScope === 'customer_limited') return 'managing';
  if (ws.businessScope === 'customer_managed') return 'service-only';
  if (ws.currentRole === 'owner') {
    return ws.customerLabel ? 'pending-transfer' : 'owner';
  }
  if (ws.currentRole === 'admin') return 'service-only';
  return 'managing';
}

// 前台空间切换器：只列个人 Owner Space，不列 Pro 客户托管 Space
export const SpaceList = getFrontendOwnerWorkspaces()
  .map(w => ({
    id: w.id, name: w.name, dc: w.region, flag: w.flag,
    isDefault: w.id === 'ws-home',
    studios: w.studioIds.length, members: w.members.length, emoji: w.emoji,
  }));
