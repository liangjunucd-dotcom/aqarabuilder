export interface CustomerStudio {
  id: string;
  label: string; // 主屋 / 一楼 / 出租 #1
  health: 'healthy' | 'warning' | 'critical' | 'offline';
  devices: number;
  city?: string; // 不同 Studio 可能在不同城市(异地家)
}

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  avatarGradient: string;
  city: string;
  spaceName: string; // 描述性: 主屋 140m² / 别墅 ×2 楼 / 出租 ×6
  studios: CustomerStudio[]; // 1+ Studios per customer
  projects: number;
  activeProjects: number;
  lifetimeValue: number; // 累计为我贡献的分润 (¥)
  lastContact: string;
  lastContactType: 'message' | 'on-site' | 'remote' | 'install';
  tag: 'eldercare' | 'family' | 'rental' | 'villa' | 'geek' | 'minimal';
  acquiredVia: 'lead' | 'referral' | 'community' | 'walk-in';
  joinedAt: string;
  notes?: string;
  contractStatus: 'active' | 'expired' | 'pending' | 'none';
  recurringRevenue?: number; // 月订阅
}

export const TAG_LABEL: Record<Customer['tag'], string> = {
  eldercare: '适老化',
  family: '亲子',
  rental: '出租',
  villa: '别墅',
  geek: '极客',
  minimal: '极简',
};

export const TAG_COLOR: Record<Customer['tag'], string> = {
  eldercare: '#10b981',
  family: '#ec4899',
  rental: '#f59e0b',
  villa: '#a855f7',
  geek: '#06b6d4',
  minimal: '#64748b',
};

// Aggregate health from multiple studios — worst wins
function worstHealth(studios: CustomerStudio[]): CustomerStudio['health'] {
  if (studios.some(s => s.health === 'critical')) return 'critical';
  if (studios.some(s => s.health === 'offline')) return 'offline';
  if (studios.some(s => s.health === 'warning')) return 'warning';
  return 'healthy';
}

export function customerHealth(c: Customer) {
  return worstHealth(c.studios);
}

export function customerDeviceCount(c: Customer) {
  return c.studios.reduce((s, x) => s + x.devices, 0);
}

export const MyCustomers: Customer[] = [
  {
    id: 'cust-li',
    name: '李先生',
    avatar: '李',
    avatarGradient: 'from-emerald-500 to-cyan-500',
    city: '上海·徐汇',
    spaceName: '主屋 140m²',
    studios: [
      { id: 'aq-li-001', label: '主屋', health: 'healthy', devices: 28 },
    ],
    projects: 1,
    activeProjects: 1,
    lifetimeValue: 12400,
    lastContact: '昨天',
    lastContactType: 'install',
    tag: 'eldercare',
    acquiredVia: 'lead',
    joinedAt: '2026-04-22',
    contractStatus: 'active',
    recurringRevenue: 280,
    notes: '老父同住,家中有走廊,起夜需要灯光辅助',
  },
  {
    id: 'cust-wang',
    name: 'J女士',
    avatar: 'J',
    avatarGradient: 'from-amber-500 to-red-500',
    city: '苏州·园区',
    spaceName: '别墅 380m² · 上下两层',
    studios: [
      { id: 'aq-wang-villa-1f', label: '一楼 (公共区)', health: 'healthy', devices: 78 },
      { id: 'aq-wang-villa-2f', label: '二楼 (卧室区)', health: 'healthy', devices: 64 },
    ],
    projects: 1,
    activeProjects: 0,
    lifetimeValue: 86200,
    lastContact: '3 天前',
    lastContactType: 'remote',
    tag: 'villa',
    acquiredVia: 'referral',
    joinedAt: '2026-03-08',
    contractStatus: 'active',
    recurringRevenue: 1200,
    notes: '六口之家,二楼有岳父岳母,要求全屋 Persona — 双 Studio 区分公共 vs 私密',
  },
  {
    id: 'cust-zhao',
    name: '赵房东',
    avatar: '赵',
    avatarGradient: 'from-amber-400 to-orange-500',
    city: '上海·静安',
    spaceName: '出租 ×6 套',
    studios: [
      { id: 'aq-zhao-rental-1', label: '出租 #1 (101)', health: 'healthy', devices: 12 },
      { id: 'aq-zhao-rental-2', label: '出租 #2 (102)', health: 'healthy', devices: 12 },
      { id: 'aq-zhao-rental-3', label: '出租 #3 (201)', health: 'warning', devices: 12 },
      { id: 'aq-zhao-rental-4', label: '出租 #4 (202)', health: 'healthy', devices: 12 },
      { id: 'aq-zhao-rental-5', label: '出租 #5 (301)', health: 'healthy', devices: 12 },
      { id: 'aq-zhao-rental-6', label: '出租 #6 (302)', health: 'healthy', devices: 12 },
    ],
    projects: 1,
    activeProjects: 1,
    lifetimeValue: 28400,
    lastContact: '5 天前',
    lastContactType: 'message',
    tag: 'rental',
    acquiredVia: 'community',
    joinedAt: '2026-02-15',
    contractStatus: 'active',
    recurringRevenue: 720,
    notes: '出租房标配方案 — 节能 + 漏水 + 钥匙托管 · 每套独立 Studio · 一份方案模板复制',
  },
  {
    id: 'cust-zhang',
    name: '张奶奶家',
    avatar: '张',
    avatarGradient: 'from-pink-500 to-rose-500',
    city: '上海·徐汇',
    spaceName: '主屋 90m²',
    studios: [
      { id: 'aq-eldercare-zhang', label: '主屋', health: 'warning', devices: 11 },
    ],
    projects: 1,
    activeProjects: 1,
    lifetimeValue: 6800,
    lastContact: '1 小时前',
    lastContactType: 'remote',
    tag: 'eldercare',
    acquiredVia: 'lead',
    joinedAt: '2026-04-29',
    contractStatus: 'active',
    recurringRevenue: 180,
    notes: '独居,女儿在加州,远程关怀刚需,FP2 雷达 + 紧急按钮',
  },
  {
    id: 'cust-chen',
    name: '陈先生',
    avatar: '陈',
    avatarGradient: 'from-rose-500 to-red-600',
    city: '上海·浦东',
    spaceName: '主屋 180m² + 父母家 95m²',
    studios: [
      { id: 'aq-chen-family', label: '主屋', health: 'critical', devices: 38 },
      { id: 'aq-chen-parents', label: '父母家 (闵行)', health: 'healthy', devices: 14, city: '上海·闵行' },
    ],
    projects: 1,
    activeProjects: 0,
    lifetimeValue: 18600,
    lastContact: '14 小时前',
    lastContactType: 'remote',
    tag: 'family',
    acquiredVia: 'lead',
    joinedAt: '2026-03-20',
    contractStatus: 'active',
    recurringRevenue: 360,
    notes: '主屋 Studio 离线 14h,需远程协助 · 同时管父母家(异地)Studio',
  },
  {
    id: 'cust-liu',
    name: '刘女士',
    avatar: '刘',
    avatarGradient: 'from-purple-500 to-pink-500',
    city: '上海·浦东',
    spaceName: '三居 120m²',
    studios: [
      { id: 'aq-liu-family', label: '主屋', health: 'healthy', devices: 32 },
    ],
    projects: 1,
    activeProjects: 0,
    lifetimeValue: 14200,
    lastContact: '上周',
    lastContactType: 'on-site',
    tag: 'family',
    acquiredVia: 'referral',
    joinedAt: '2026-02-28',
    contractStatus: 'active',
    recurringRevenue: 220,
  },
  {
    id: 'cust-zhou',
    name: '周爷爷家',
    avatar: '周',
    avatarGradient: 'from-emerald-400 to-teal-500',
    city: '上海·闵行',
    spaceName: '主屋 80m²',
    studios: [
      { id: 'aq-elder-002', label: '主屋', health: 'healthy', devices: 11 },
    ],
    projects: 1,
    activeProjects: 0,
    lifetimeValue: 5400,
    lastContact: '上周',
    lastContactType: 'install',
    tag: 'eldercare',
    acquiredVia: 'community',
    joinedAt: '2026-03-12',
    contractStatus: 'active',
    recurringRevenue: 180,
  },
  {
    id: 'cust-wu',
    name: '吴先生',
    avatar: '吴',
    avatarGradient: 'from-violet-500 to-fuchsia-500',
    city: '杭州·西湖',
    spaceName: '别墅 320m² + 庭院系统',
    studios: [
      { id: 'aq-wu-villa-main', label: '主屋', health: 'healthy', devices: 96 },
      { id: 'aq-wu-villa-garden', label: '庭院 + 池塘 (二期)', health: 'healthy', devices: 18 },
    ],
    projects: 2,
    activeProjects: 1,
    lifetimeValue: 64800,
    lastContact: '8 分钟前',
    lastContactType: 'message',
    tag: 'villa',
    acquiredVia: 'referral',
    joinedAt: '2026-01-18',
    contractStatus: 'active',
    recurringRevenue: 980,
    notes: '主屋一期 + 庭院二期改造 · 二期独立 Studio 管室外灯光与自动浇灌',
  },
  {
    id: 'cust-young',
    name: '青年夫妻 · 王 & 林',
    avatar: '王',
    avatarGradient: 'from-cyan-500 to-blue-500',
    city: '上海·虹口',
    spaceName: '小户型 60m²',
    studios: [
      { id: 'aq-young-couple', label: '公寓', health: 'healthy', devices: 24 },
    ],
    projects: 1,
    activeProjects: 0,
    lifetimeValue: 4200,
    lastContact: '2 周前',
    lastContactType: 'install',
    tag: 'minimal',
    acquiredVia: 'walk-in',
    joinedAt: '2026-04-10',
    contractStatus: 'active',
    recurringRevenue: 99,
  },
  {
    id: 'cust-qian',
    name: '钱阿姨家',
    avatar: '钱',
    avatarGradient: 'from-pink-400 to-rose-400',
    city: '上海·长宁',
    spaceName: '主屋 95m²',
    studios: [
      { id: 'aq-elder-003', label: '主屋', health: 'healthy', devices: 11 },
    ],
    projects: 1,
    activeProjects: 0,
    lifetimeValue: 5800,
    lastContact: '12 分钟前',
    lastContactType: 'remote',
    tag: 'eldercare',
    acquiredVia: 'lead',
    joinedAt: '2026-04-05',
    contractStatus: 'active',
    recurringRevenue: 180,
  },
  {
    id: 'cust-self',
    name: '我家(自用)',
    avatar: '我',
    avatarGradient: 'from-accent to-accent2',
    city: '上海·徐汇',
    spaceName: '公寓 70m² + 工作室 + LA 父母家',
    studios: [
      { id: 'aq-geek-self', label: '主居公寓', health: 'healthy', devices: 41 },
      { id: 'aq-geek-studio', label: '工作室 (实验)', health: 'healthy', devices: 22 },
      { id: 'aq-geek-la', label: '父母家 (洛杉矶)', health: 'healthy', devices: 18, city: '洛杉矶' },
    ],
    projects: 1,
    activeProjects: 1,
    lifetimeValue: 0,
    lastContact: '刚刚',
    lastContactType: 'on-site',
    tag: 'geek',
    acquiredVia: 'community',
    joinedAt: '2025-11-01',
    contractStatus: 'none',
    notes: '自用 / 测试新功能 / Driver 开发 · 跨太平洋管父母家',
  },
  {
    id: 'cust-sun',
    name: '孙女士',
    avatar: '孙',
    avatarGradient: 'from-orange-500 to-amber-500',
    city: '上海·静安',
    spaceName: '复式 200m²',
    studios: [
      { id: 'aq-sun-duplex', label: '复式 (待勘察)', health: 'offline', devices: 0 },
    ],
    projects: 0,
    activeProjects: 1,
    lifetimeValue: 2800,
    lastContact: '今天',
    lastContactType: 'message',
    tag: 'minimal',
    acquiredVia: 'lead',
    joinedAt: '2026-05-08',
    contractStatus: 'pending',
    notes: '新 Lead — 极简风格,独居,本周勘察 · Studio 待安装',
  },
];

export const getCustomer = (id: string) => MyCustomers.find(c => c.id === id);

export const customerStats = () => {
  const total = MyCustomers.length;
  const active = MyCustomers.filter(c => c.activeProjects > 0).length;
  const lifetimeValue = MyCustomers.reduce((s, c) => s + c.lifetimeValue, 0);
  const monthlyRecurring = MyCustomers.reduce((s, c) => s + (c.recurringRevenue || 0), 0);
  const totalStudios = MyCustomers.reduce((s, c) => s + c.studios.length, 0);
  const totalDevices = MyCustomers.reduce((s, c) => s + customerDeviceCount(c), 0);
  return { total, active, lifetimeValue, monthlyRecurring, totalStudios, totalDevices };
};
