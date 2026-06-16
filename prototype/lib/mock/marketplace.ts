// Solution Marketplace · 来自其他 Builder 的方案
// 自己的方案在 lib/mock/solutions.ts;此文件是"社区视角" — 浏览 + 订阅

import type { Solution } from './solutions';

export interface CommunityBuilder {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  gradient: string;
  region: string;
  flag: string;
  tier: 'pro' | 'certified' | 'enterprise';
  badge?: 'top-pro' | 'official-partner' | 'rising';
  solutionsCount: number;
  totalDeployed: number;
  totalSubscribers: number;
  thisMonthSubs: number;
  rating: number;
  topCategories: string[];
  bio: string;
}

export const COMMUNITY_BUILDERS: CommunityBuilder[] = [
  {
    id: 'b-kim',
    name: 'Kim Min-jae',
    handle: '@kim_seoul',
    avatar: 'K',
    gradient: 'from-rose-500 to-pink-500',
    region: '首尔 · 韩国',
    flag: '🇰🇷',
    tier: 'certified',
    badge: 'top-pro',
    solutionsCount: 12,
    totalDeployed: 380,
    totalSubscribers: 1247,
    thisMonthSubs: 184,
    rating: 4.9,
    topCategories: ['eldercare', 'minimal'],
    bio: '专注独居老人 · 已部署 380 家庭,韩日双区域服务',
  },
  {
    id: 'b-daniel',
    name: 'Daniel Romano',
    handle: '@daniel_milano',
    avatar: 'D',
    gradient: 'from-amber-500 to-orange-500',
    region: '米兰 · 意大利',
    flag: '🇮🇹',
    tier: 'certified',
    badge: 'official-partner',
    solutionsCount: 8,
    totalDeployed: 142,
    totalSubscribers: 632,
    thisMonthSubs: 78,
    rating: 4.8,
    topCategories: ['villa', 'family'],
    bio: '欧洲别墅整装 · 与 Aqara EU 战略合作',
  },
  {
    id: 'b-yuki',
    name: 'Yuki Tanaka',
    handle: '@yuki_tokyo',
    avatar: 'Y',
    gradient: 'from-violet-500 to-fuchsia-500',
    region: '东京 · 日本',
    flag: '🇯🇵',
    tier: 'certified',
    solutionsCount: 15,
    totalDeployed: 218,
    totalSubscribers: 489,
    thisMonthSubs: 52,
    rating: 4.7,
    topCategories: ['minimal', 'rental'],
    bio: '极简日式 + 出租房标配方案专家',
  },
  {
    id: 'b-sara',
    name: 'Sara Chen',
    handle: '@sara_la',
    avatar: 'S',
    gradient: 'from-cyan-500 to-blue-500',
    region: '洛杉矶 · 美国',
    flag: '🇺🇸',
    tier: 'certified',
    badge: 'rising',
    solutionsCount: 6,
    totalDeployed: 89,
    totalSubscribers: 312,
    thisMonthSubs: 91,
    rating: 4.6,
    topCategories: ['family', 'villa'],
    bio: '加州大宅 · 跨太平洋父母家关怀方案',
  },
  {
    id: 'b-li-pro',
    name: '李工 (Li Pro)',
    handle: '@li_pro_shenzhen',
    avatar: '李',
    gradient: 'from-emerald-500 to-cyan-500',
    region: '深圳 · 中国',
    flag: '🇨🇳',
    tier: 'enterprise',
    badge: 'top-pro',
    solutionsCount: 22,
    totalDeployed: 1280,
    totalSubscribers: 2840,
    thisMonthSubs: 412,
    rating: 4.9,
    topCategories: ['rental', 'commercial'],
    bio: '长租公寓 + 酒店连锁方案 · 累计 1200+ Studio 部署',
  },
  {
    id: 'b-wang-zh',
    name: '王师傅',
    handle: '@wang_zh',
    avatar: '王',
    gradient: 'from-purple-500 to-pink-500',
    region: '北京 · 中国',
    flag: '🇨🇳',
    tier: 'certified',
    solutionsCount: 9,
    totalDeployed: 156,
    totalSubscribers: 421,
    thisMonthSubs: 38,
    rating: 4.7,
    topCategories: ['eldercare', 'family'],
    bio: '北方适老化资深 · 走廊雷达组合优化',
  },
  {
    id: 'b-sg',
    name: 'Aqara SG Studio',
    handle: '@aqara_official_sg',
    avatar: 'A',
    gradient: 'from-accent to-accent2',
    region: '新加坡',
    flag: '🇸🇬',
    tier: 'enterprise',
    badge: 'official-partner',
    solutionsCount: 18,
    totalDeployed: 520,
    totalSubscribers: 1830,
    thisMonthSubs: 220,
    rating: 4.8,
    topCategories: ['commercial', 'villa'],
    bio: 'Aqara 东南亚官方方案库 · 商用 + 高端住宅',
  },
];

// Marketplace 上的 Solutions(其他 Builder 发布的)
// 类型扩展 Solution
export interface MarketSolution extends Omit<Solution, 'visibility' | 'author' | 'authorAvatar' | 'authorGradient'> {
  visibility: 'marketplace';
  builderId: string;
  region: string;
  flag: string;
  localization: string[]; // ['zh-CN', 'en', 'ja']
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  subscriberGrowth: number; // last 30 days %
  reviewCount: number;
}

export const MARKETPLACE_SOLUTIONS: MarketSolution[] = [
  {
    id: 'ms-kim-eldercare',
    name: 'Kim 适老化 · 韩日通用',
    version: '3.2.0',
    description: '已在 380 家庭部署的韩日通用适老化方案。雷达 + 紧急呼 + 远程关怀 + 中文/韩文/日文播报。',
    category: 'eldercare',
    applicableArea: '80-130m²',
    rooms: 4, devices: 14, rules: 11, personas: 2, pluginsRequired: 1,
    thumbnailGradient: 'linear-gradient(135deg,#0c4a6e 0%,#0ea5e9 60%,#38bdf8 100%)',
    deployedTo: 380, forks: 47, subscribes: 1247, rating: 4.9, reviewCount: 312,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '5 天前',
    pricing: { type: 'subscription', amount: 49, currency: 'CNY' },
    builderId: 'b-kim',
    region: '首尔',
    flag: '🇰🇷',
    localization: ['ko', 'ja', 'zh-CN', 'en'],
    featured: true, trending: true,
    subscriberGrowth: 18,
  },
  {
    id: 'ms-daniel-villa',
    name: 'Italian Villa 整装方案',
    version: '2.0.1',
    description: '300-600m² 欧式别墅整装。多 Studio + 智能门窗 + 庭院灌溉 + 客厅声场。',
    category: 'villa',
    applicableArea: '300-600m²',
    rooms: 16, devices: 168, rules: 42, personas: 6, pluginsRequired: 5,
    thumbnailGradient: 'linear-gradient(135deg,#1e1b4b 0%,#7c3aed 60%,#a855f7 100%)',
    deployedTo: 142, forks: 18, subscribes: 632, rating: 4.8, reviewCount: 89,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '2 周前',
    pricing: { type: 'subscription', amount: 199, currency: 'CNY' },
    builderId: 'b-daniel',
    region: '米兰',
    flag: '🇮🇹',
    localization: ['it', 'en', 'fr', 'de'],
    featured: true,
    subscriberGrowth: 12,
  },
  {
    id: 'ms-yuki-minimal',
    name: '日式极简单身',
    version: '1.4.2',
    description: '40-60m² 日式极简公寓。节能 + 自动通风 + 安心睡眠 + 番茄钟工作模式。',
    category: 'minimal',
    applicableArea: '40-60m²',
    rooms: 3, devices: 18, rules: 9, personas: 1, pluginsRequired: 0,
    thumbnailGradient: 'linear-gradient(135deg,#1c1917 0%,#44403c 50%,#a8a29e 100%)',
    deployedTo: 218, forks: 31, subscribes: 489, rating: 4.7, reviewCount: 156,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '1 周前',
    pricing: 'free',
    builderId: 'b-yuki',
    region: '东京',
    flag: '🇯🇵',
    localization: ['ja', 'en', 'zh-CN'],
    trending: true,
    subscriberGrowth: 22,
  },
  {
    id: 'ms-sara-cross-pacific',
    name: '跨太平洋父母关怀',
    version: '1.2.0',
    description: '加州 → 中国异地父母家。时差自动同步 / 视频呼叫 / 紧急通知。FaceTime 集成。',
    category: 'family',
    applicableArea: '90-180m²',
    rooms: 5, devices: 22, rules: 16, personas: 3, pluginsRequired: 2,
    thumbnailGradient: 'linear-gradient(135deg,#0c4a6e 0%,#06b6d4 60%,#67e8f9 100%)',
    deployedTo: 89, forks: 14, subscribes: 312, rating: 4.6, reviewCount: 52,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '3 天前',
    pricing: { type: 'subscription', amount: 79, currency: 'CNY' },
    builderId: 'b-sara',
    region: '洛杉矶',
    flag: '🇺🇸',
    localization: ['en', 'zh-CN'],
    isNew: true, featured: true,
    subscriberGrowth: 38,
  },
  {
    id: 'ms-li-hotel',
    name: '酒店连锁标配 · 商用',
    version: '4.1.0',
    description: '12-48 房型酒店连锁标准方案。一份模板复制到所有房间 · 前台中央管控 · 节能审计。',
    category: 'commercial',
    applicableArea: '20-35m²/间',
    rooms: 1, devices: 9, rules: 6, personas: 0, pluginsRequired: 3,
    thumbnailGradient: 'linear-gradient(135deg,#78350f 0%,#f59e0b 60%,#fcd34d 100%)',
    deployedTo: 1280, forks: 89, subscribes: 2840, rating: 4.9, reviewCount: 412,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '昨天',
    pricing: { type: 'subscription', amount: 89, currency: 'CNY' },
    builderId: 'b-li-pro',
    region: '深圳',
    flag: '🇨🇳',
    localization: ['zh-CN', 'en'],
    featured: true, trending: true,
    subscriberGrowth: 15,
  },
  {
    id: 'ms-li-rental-pro',
    name: '长租公寓批量管控',
    version: '3.0.0',
    description: '10+ 套出租房中央管控。水电监测 / 智能门锁批量管理 / 自动验房 / 漏水自动断闸。',
    category: 'rental',
    applicableArea: '20-80m²/套',
    rooms: 2, devices: 11, rules: 8, personas: 0, pluginsRequired: 2,
    thumbnailGradient: 'linear-gradient(135deg,#78350f 0%,#ea580c 60%,#fb923c 100%)',
    deployedTo: 420, forks: 36, subscribes: 980, rating: 4.8, reviewCount: 198,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '4 天前',
    pricing: { type: 'subscription', amount: 39, currency: 'CNY' },
    builderId: 'b-li-pro',
    region: '深圳',
    flag: '🇨🇳',
    localization: ['zh-CN'],
    trending: true,
    subscriberGrowth: 28,
  },
  {
    id: 'ms-wang-corridor',
    name: '北方适老化 · 长走廊',
    version: '2.1.0',
    description: '北方户型常见长走廊场景。雷达 + 渐亮 + 紧急一键呼 + 灶台离人提醒。',
    category: 'eldercare',
    applicableArea: '90-150m²',
    rooms: 5, devices: 16, rules: 12, personas: 2, pluginsRequired: 1,
    thumbnailGradient: 'linear-gradient(135deg,#064e3b 0%,#10b981 60%,#34d399 100%)',
    deployedTo: 156, forks: 28, subscribes: 421, rating: 4.7, reviewCount: 102,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '6 天前',
    pricing: { type: 'subscription', amount: 35, currency: 'CNY' },
    builderId: 'b-wang-zh',
    region: '北京',
    flag: '🇨🇳',
    localization: ['zh-CN'],
    subscriberGrowth: 9,
  },
  {
    id: 'ms-aqara-school',
    name: '幼儿园 · 安全 + 学习',
    version: '1.0.0',
    description: '60-200m² 幼儿园教室方案。儿童安全锁 / 学习模式 / 接送动线 / 异常告警 → 家长。',
    category: 'commercial',
    applicableArea: '60-200m²',
    rooms: 4, devices: 24, rules: 18, personas: 2, pluginsRequired: 3,
    thumbnailGradient: 'linear-gradient(135deg,#831843 0%,#ec4899 60%,#f9a8d4 100%)',
    deployedTo: 38, forks: 6, subscribes: 145, rating: 4.8, reviewCount: 24,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '昨天',
    pricing: { type: 'subscription', amount: 159, currency: 'CNY' },
    builderId: 'b-sg',
    region: '新加坡',
    flag: '🇸🇬',
    localization: ['en', 'zh-CN'],
    isNew: true,
    subscriberGrowth: 65,
  },
  {
    id: 'ms-yuki-rental-jp',
    name: '日式出租 · 短租 Air 友好',
    version: '1.3.0',
    description: '日本短租房标配。客人离开自动重置 / 钥匙临时码 / 噪音监测 / 节能模式。',
    category: 'rental',
    applicableArea: '20-50m²',
    rooms: 2, devices: 10, rules: 7, personas: 0, pluginsRequired: 1,
    thumbnailGradient: 'linear-gradient(135deg,#4a044e 0%,#a21caf 60%,#e879f9 100%)',
    deployedTo: 92, forks: 18, subscribes: 240, rating: 4.6, reviewCount: 58,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '1 周前',
    pricing: { type: 'subscription', amount: 25, currency: 'CNY' },
    builderId: 'b-yuki',
    region: '东京',
    flag: '🇯🇵',
    localization: ['ja', 'en'],
    subscriberGrowth: 11,
  },
  {
    id: 'ms-aqara-cafe',
    name: '咖啡馆/小餐饮 · 商用',
    version: '1.1.0',
    description: '40-120m² 咖啡店或小餐饮。开店关店自动化 / 客流计数 / 收银异常监控 / 离店巡检。',
    category: 'commercial',
    applicableArea: '40-120m²',
    rooms: 3, devices: 22, rules: 14, personas: 0, pluginsRequired: 2,
    thumbnailGradient: 'linear-gradient(135deg,#451a03 0%,#92400e 60%,#d97706 100%)',
    deployedTo: 68, forks: 12, subscribes: 220, rating: 4.7, reviewCount: 42,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '5 天前',
    pricing: { type: 'subscription', amount: 99, currency: 'CNY' },
    builderId: 'b-sg',
    region: '新加坡',
    flag: '🇸🇬',
    localization: ['en', 'zh-CN', 'ms'],
    isNew: true,
    subscriberGrowth: 42,
  },
  {
    id: 'ms-daniel-pool',
    name: '别墅泳池 · 庭院联动',
    version: '1.0.2',
    description: '别墅二期庭院扩展包。泳池水温水质 / 自动浇灌 / 庭院夜间安防 / 派对模式。',
    category: 'villa',
    applicableArea: '> 500m²',
    rooms: 4, devices: 38, rules: 18, personas: 3, pluginsRequired: 4,
    thumbnailGradient: 'linear-gradient(135deg,#082f49 0%,#0ea5e9 60%,#7dd3fc 100%)',
    deployedTo: 24, forks: 4, subscribes: 86, rating: 4.9, reviewCount: 12,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '2 周前',
    pricing: { type: 'subscription', amount: 299, currency: 'CNY' },
    builderId: 'b-daniel',
    region: '米兰',
    flag: '🇮🇹',
    localization: ['it', 'en'],
    subscriberGrowth: 24,
  },
  {
    id: 'ms-yuki-tea',
    name: '茶室禅意',
    version: '1.0.0',
    description: '日式茶室 + 禅意空间。柔光渐变 / 音景生成 / 焚香节律 / 客人入席自动布局。',
    category: 'minimal',
    applicableArea: '15-40m²',
    rooms: 1, devices: 12, rules: 6, personas: 1, pluginsRequired: 1,
    thumbnailGradient: 'linear-gradient(135deg,#14532d 0%,#16a34a 60%,#86efac 100%)',
    deployedTo: 8, forks: 2, subscribes: 32, rating: 5.0, reviewCount: 6,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '3 天前',
    pricing: 'free',
    builderId: 'b-yuki',
    region: '东京',
    flag: '🇯🇵',
    localization: ['ja', 'zh-CN', 'en'],
    isNew: true,
    subscriberGrowth: 320, // brand new, exploding growth
  },
];

// ─── Helpers ─────────────────────────────────

export function getCommunityBuilder(id: string): CommunityBuilder | undefined {
  return COMMUNITY_BUILDERS.find(b => b.id === id);
}

export function getMarketSolution(id: string): MarketSolution | undefined {
  return MARKETPLACE_SOLUTIONS.find(s => s.id === id);
}

export function topBuildersByGrowth(n = 5): CommunityBuilder[] {
  return [...COMMUNITY_BUILDERS]
    .sort((a, b) => b.thisMonthSubs - a.thisMonthSubs)
    .slice(0, n);
}

export function trendingSolutions(): MarketSolution[] {
  return MARKETPLACE_SOLUTIONS.filter(s => s.trending);
}

export function featuredSolutions(): MarketSolution[] {
  return MARKETPLACE_SOLUTIONS.filter(s => s.featured);
}

export function newSolutions(): MarketSolution[] {
  return MARKETPLACE_SOLUTIONS.filter(s => s.isNew);
}

// 全局 Marketplace 统计(用于 hero)
export function marketplaceStats() {
  return {
    totalSolutions: MARKETPLACE_SOLUTIONS.length,
    totalBuilders: COMMUNITY_BUILDERS.length,
    totalDeployed: MARKETPLACE_SOLUTIONS.reduce((s, x) => s + x.deployedTo, 0),
    totalSubscribers: MARKETPLACE_SOLUTIONS.reduce((s, x) => s + x.subscribes, 0),
  };
}
