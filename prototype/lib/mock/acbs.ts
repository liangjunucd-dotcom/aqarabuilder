export type CountryCode = 'CN' | 'KR' | 'AE' | 'IT' | 'US' | 'JP' | 'DE';

export type ACBLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** Badge（技能徽章）— ACB 通过认证获得的技能标识 */
export type ACBBadge = 'Certified Installer' | 'Designer' | 'Developer' | 'Service';

export interface ACB {
  id: string;
  handle: string; // url-safe, no @
  name: string;
  nameLocal?: string; // localized
  avatar: string;
  cover: string;
  level: ACBLevel;
  subRoles: ACBBadge[];
  city: string;
  country: CountryCode;
  countryFlag: string;
  affiliatedStore: string; // Aqara Space 门店
  bio: string;
  joinedYear: number;
  stats: {
    projects: number;
    studiosDeployed: number;
    applies: number; // total apply count of works
    clients: number;
    rating: number; // 1-5
  };
  badges: { name: string; level?: string; year: number }[];
  acceptingClients: boolean;
}

export const ACBs: ACB[] = [
  {
    id: 'acb-001',
    handle: 'kim_acb',
    name: 'Kim Min-jun',
    nameLocal: '김민준',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim&backgroundColor=6366f1',
    cover: 'linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#ec4899 100%)',
    level: 'L4',
    subRoles: ['Designer', 'Service'],
    city: 'Seoul · 首尔',
    country: 'KR',
    countryFlag: '🇰🇷',
    affiliatedStore: 'Aqara Space Gangnam Studio',
    bio: '专注东亚极简风 + 适老化 Persona,12 年高端公寓改造经验。Design Platform 早期合作 Builder。',
    joinedYear: 2024,
    stats: { projects: 47, studiosDeployed: 89, applies: 1247, clients: 31, rating: 4.9 },
    badges: [
      { name: 'Designer', level: 'L4', year: 2025 },
      { name: 'Service', level: 'L3', year: 2025 },
      { name: 'Founder Creator', year: 2026 },
      { name: 'Persona Expert · 适老', year: 2026 },
    ],
    acceptingClients: true,
  },
  {
    id: 'acb-002',
    handle: 'marco_b',
    name: 'Marco Bianchi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco&backgroundColor=a855f7',
    cover: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 50%,#8b5cf6 100%)',
    level: 'L3',
    subRoles: ['Designer', 'Certified Installer'],
    city: 'Milano · 米兰',
    country: 'IT',
    countryFlag: '🇮🇹',
    affiliatedStore: 'Aqara Space Milano Brera (Operator-Store)',
    bio: 'Architetto. 老建筑改造 + GDPR 合规专家。Aqara 欧洲首批 Founder Creator。',
    joinedYear: 2025,
    stats: { projects: 18, studiosDeployed: 23, applies: 412, clients: 14, rating: 4.8 },
    badges: [
      { name: 'Designer', level: 'L3', year: 2025 },
      { name: 'Certified Installer', level: 'L2', year: 2025 },
      { name: 'Founder Creator', year: 2026 },
      { name: 'Heritage Building Expert', year: 2026 },
    ],
    acceptingClients: true,
  },
  {
    id: 'acb-003',
    handle: 'ahmed_dxb',
    name: 'Ahmed Al-Rashid',
    nameLocal: 'أحمد الراشد',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed&backgroundColor=f59e0b',
    cover: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 50%,#a855f7 100%)',
    level: 'L5',
    subRoles: ['Designer', 'Service', 'Developer'],
    city: 'Dubai · 迪拜',
    country: 'AE',
    countryFlag: '🇦🇪',
    affiliatedStore: 'Aqara Space Dubai Marina',
    bio: '豪宅整装 + 多语言语音方案,客单 ¥150k+,持续服务订阅留存 96%。',
    joinedYear: 2024,
    stats: { projects: 62, studiosDeployed: 187, applies: 2891, clients: 48, rating: 4.95 },
    badges: [
      { name: 'Designer', level: 'L5', year: 2026 },
      { name: 'Service', level: 'L4', year: 2025 },
      { name: 'Developer', level: 'L3', year: 2025 },
      { name: 'Founder Creator', year: 2026 },
      { name: 'Top 10 Global', year: 2026 },
    ],
    acceptingClients: true,
  },
  {
    id: 'acb-004',
    handle: 'wang_hao',
    name: 'Jun',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wanghao&backgroundColor=10b981',
    cover: 'linear-gradient(135deg,#10b981 0%,#06b6d4 50%,#6366f1 100%)',
    level: 'L4',
    subRoles: ['Certified Installer', 'Service'],
    city: '上海',
    country: 'CN',
    countryFlag: '🇨🇳',
    affiliatedStore: 'Aqara Space 上海徐汇店',
    bio: '8 年 Aqara 服务商,平移注册首批 ACB。专做新房整装 + 智能照明。',
    joinedYear: 2026,
    stats: { projects: 124, studiosDeployed: 312, applies: 678, clients: 89, rating: 4.85 },
    badges: [
      { name: 'Certified Installer', level: 'L4', year: 2026 },
      { name: 'Service', level: 'L3', year: 2026 },
      { name: '老服务商升级', year: 2026 },
    ],
    acceptingClients: true,
  },
  {
    id: 'acb-005',
    handle: 'chenxue',
    name: '陈雪',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenxue&backgroundColor=ec4899',
    cover: 'linear-gradient(135deg,#ec4899 0%,#a855f7 50%,#6366f1 100%)',
    level: 'L3',
    subRoles: ['Designer'],
    city: '北京',
    country: 'CN',
    countryFlag: '🇨🇳',
    affiliatedStore: 'Aqara Space 北京朝阳店',
    bio: '亲子家庭 + 千人千面 Persona 设计师,作品被 Fork 1,200+ 次。',
    joinedYear: 2025,
    stats: { projects: 38, studiosDeployed: 51, applies: 1876, clients: 22, rating: 4.92 },
    badges: [
      { name: 'Designer', level: 'L3', year: 2025 },
      { name: 'Persona Expert · 亲子', year: 2026 },
      { name: 'Verified Composer', year: 2025 },
    ],
    acceptingClients: true,
  },
  {
    id: 'acb-006',
    handle: 'lee_dev',
    name: 'Lee Soo-young',
    nameLocal: '이수영',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee&backgroundColor=8b5cf6',
    cover: 'linear-gradient(135deg,#8b5cf6 0%,#3b82f6 100%)',
    level: 'L4',
    subRoles: ['Developer'],
    city: 'Seoul · 首尔',
    country: 'KR',
    countryFlag: '🇰🇷',
    affiliatedStore: 'Aqara Space Hongdae Lab',
    bio: '协议驱动开发者。已贡献 23 个 Driver,接入 LG / 三星 / Bosch 等本土设备。',
    joinedYear: 2024,
    stats: { projects: 9, studiosDeployed: 0, applies: 0, clients: 0, rating: 4.7 },
    badges: [
      { name: 'Developer', level: 'L4', year: 2026 },
      { name: 'Driver Author · 23 Drivers', year: 2026 },
      { name: 'Founder Creator', year: 2026 },
    ],
    acceptingClients: false,
  },
  {
    id: 'acb-007',
    handle: 'sara_geek',
    name: 'Sara Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara&backgroundColor=06b6d4',
    cover: 'linear-gradient(135deg,#06b6d4 0%,#8b5cf6 100%)',
    level: 'L2',
    subRoles: ['Designer', 'Developer'],
    city: '深圳',
    country: 'CN',
    countryFlag: '🇨🇳',
    affiliatedStore: '— 自由 ACB',
    bio: '极客 / 重度 DIY 玩家。喜欢复杂场景与自定义 Plugin。',
    joinedYear: 2026,
    stats: { projects: 14, studiosDeployed: 6, applies: 234, clients: 4, rating: 4.6 },
    badges: [
      { name: 'Designer', level: 'L2', year: 2026 },
      { name: 'Developer', level: 'L2', year: 2026 },
    ],
    acceptingClients: true,
  },
  {
    id: 'acb-jun',
    handle: 'jun',
    name: 'Jun Liang',
    nameLocal: 'Jun',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jun&backgroundColor=6366f1',
    cover: 'linear-gradient(135deg,#6366f1 0%,#06b6d4 50%,#8b5cf6 100%)',
    level: 'L4',
    subRoles: ['Designer', 'Developer', 'Certified Installer'],
    city: '上海',
    country: 'CN',
    countryFlag: '🇨🇳',
    affiliatedStore: 'Aqara Space 上海徐汇店',
    bio: 'Aqara Builder 原型主 Builder · 全屋智能方案与 Studio 交付。专注虚实映射与 Builder Pro 交付闭环。',
    joinedYear: 2024,
    stats: { projects: 36, studiosDeployed: 58, applies: 892, clients: 24, rating: 4.92 },
    badges: [
      { name: 'Designer', level: 'L4', year: 2025 },
      { name: 'Developer', level: 'L3', year: 2025 },
      { name: 'Founder Creator', year: 2026 },
    ],
    acceptingClients: true,
  },
  {
    id: 'acb-008',
    handle: 'zhang_ms',
    name: '张明硕',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangms&backgroundColor=f97316',
    cover: 'linear-gradient(135deg,#f97316 0%,#ef4444 100%)',
    level: 'L5',
    subRoles: ['Designer', 'Certified Installer', 'Service'],
    city: '成都',
    country: 'CN',
    countryFlag: '🇨🇳',
    affiliatedStore: 'Aqara Space 成都天府店',
    bio: '12 年高端别墅整装,现转向 Aqara Studio 主导方案。月均交付 8 户。',
    joinedYear: 2025,
    stats: { projects: 89, studiosDeployed: 142, applies: 543, clients: 67, rating: 4.97 },
    badges: [
      { name: 'Designer', level: 'L5', year: 2026 },
      { name: 'Certified Installer', level: 'L4', year: 2026 },
      { name: 'Service', level: 'L3', year: 2026 },
      { name: 'Top 50 Global', year: 2026 },
      { name: '老服务商升级', year: 2026 },
    ],
    acceptingClients: true,
  },
];

export const getACB = (handle: string) => ACBs.find(a => a.handle === handle);
