// Copilot Studio · Solution Library
// 方案 = 设计成果资产,可 Deploy / Remix / Publish

export type SolutionVisibility = 'private' | 'shared' | 'marketplace';
export type SolutionStatus = 'draft' | 'verified' | 'archived';

export interface SolutionVariant {
  id: string;
  label: string; // S / M / L
  area: string;  // 60-90m² / 90-150m² / 150-300m²
  rooms: number;
  devices: number;
}

export interface Solution {
  id: string;
  name: string;
  version: string; // semver
  author: string;
  authorAvatar: string;
  authorGradient: string;
  description: string;
  category: 'eldercare' | 'family' | 'rental' | 'villa' | 'minimal' | 'commercial';
  applicableArea: string;   // "80-120m²"
  rooms: number;
  devices: number;
  rules: number;
  personas: number;
  pluginsRequired: number;
  variants?: SolutionVariant[];
  thumbnailGradient: string;
  // 流转指标
  deployedTo: number;       // 已部署到 N 个 Studio
  forks: number;            // 被 Remix 次数
  subscribes: number;       // marketplace 订阅数(如已发布)
  rating?: number;          // 1-5
  visibility: SolutionVisibility;
  status: SolutionStatus;
  lastUpdated: string;
  // Marketplace 商业化
  pricing?: 'free' | { type: 'oneoff' | 'subscription'; amount: number; currency: 'CNY' | 'USD' };
}

const CATEGORY_LABEL_ALL: Record<Solution['category'], string> = {
  eldercare:  '适老化',
  family:     '亲子',
  rental:     '出租',
  villa:      '别墅',
  minimal:    '极简',
  commercial: '商用',
};
export const SOLUTION_CATEGORY_LABEL = CATEGORY_LABEL_ALL;

export const SOLUTIONS: Solution[] = [
  {
    id: 'sol-eldercare-90',
    name: '老人独居 · 起夜防跌',
    version: '2.3.1',
    author: 'Jun',
    authorAvatar: 'J',
    authorGradient: 'from-accent to-accent2',
    description: '90m² 独居老人方案 · 雷达 + 走廊渐亮 + 紧急按钮 + 远程关怀。已在 8 个客户 Studio 部署,平均部署耗时 12 分钟。',
    category: 'eldercare',
    applicableArea: '80-120m²',
    rooms: 4, devices: 11, rules: 9, personas: 2, pluginsRequired: 1,
    thumbnailGradient: 'linear-gradient(135deg,#064e3b 0%,#10b981 60%,#34d399 100%)',
    variants: [
      { id: 'v-s', label: 'S', area: '60-80m²',   rooms: 3, devices: 8 },
      { id: 'v-m', label: 'M', area: '80-120m²',  rooms: 4, devices: 11 },
      { id: 'v-l', label: 'L', area: '120-160m²', rooms: 5, devices: 14 },
    ],
    deployedTo: 8, forks: 14, subscribes: 47, rating: 4.8,
    visibility: 'marketplace', status: 'verified',
    lastUpdated: '3 天前',
    pricing: { type: 'subscription', amount: 39, currency: 'CNY' },
  },
  {
    id: 'sol-villa-380',
    name: '别墅整装 · 双 Studio · 6 Persona',
    version: '1.4.0',
    author: 'Jun',
    authorAvatar: 'J',
    authorGradient: 'from-accent to-accent2',
    description: '380m² 双层别墅,一楼公共 + 二楼私密区分双 Studio。6 Persona 跨层联动,庭院二期独立扩展。',
    category: 'villa',
    applicableArea: '300-500m²',
    rooms: 14, devices: 142, rules: 38, personas: 6, pluginsRequired: 4,
    thumbnailGradient: 'linear-gradient(135deg,#1e1b4b 0%,#7c3aed 60%,#a855f7 100%)',
    deployedTo: 1, forks: 3, subscribes: 0,
    visibility: 'private', status: 'verified',
    lastUpdated: '昨天',
  },
  {
    id: 'sol-rental-batch',
    name: '出租房标配 · 批量复用',
    version: '1.2.5',
    author: 'Jun',
    authorAvatar: 'J',
    authorGradient: 'from-accent to-accent2',
    description: '12 件设备标配 · 节能 + 漏水告警 + 钥匙托管。一份模板复制到 N 套房,设备绑定全自动。',
    category: 'rental',
    applicableArea: '40-70m²',
    rooms: 3, devices: 12, rules: 6, personas: 1, pluginsRequired: 0,
    thumbnailGradient: 'linear-gradient(135deg,#78350f 0%,#f59e0b 60%,#fcd34d 100%)',
    deployedTo: 6, forks: 22, subscribes: 0,
    visibility: 'shared', status: 'verified',
    lastUpdated: '上周',
  },
  {
    id: 'sol-family-120',
    name: '亲子三居 · 学习专注 + 晚安仪式',
    version: '1.1.2',
    author: 'Jun',
    authorAvatar: 'J',
    authorGradient: 'from-accent to-accent2',
    description: '120m² 三居 · 学龄儿专注模式 + 家长管控 + 晚安渐暗。包含 Aqara Life 学习计时插件。',
    category: 'family',
    applicableArea: '90-140m²',
    rooms: 5, devices: 28, rules: 14, personas: 4, pluginsRequired: 2,
    thumbnailGradient: 'linear-gradient(135deg,#831843 0%,#ec4899 60%,#f9a8d4 100%)',
    deployedTo: 2, forks: 5, subscribes: 0,
    visibility: 'private', status: 'draft',
    lastUpdated: '5 天前',
  },
  {
    id: 'sol-minimal-60',
    name: '小户型 · 极简单身',
    version: '1.0.0',
    author: 'Jun',
    authorAvatar: 'J',
    authorGradient: 'from-accent to-accent2',
    description: '60m² 一居 · 节能优先 · 离家全断电 + 回家迎宾 · 24 件低成本设备。适合年轻租客。',
    category: 'minimal',
    applicableArea: '40-70m²',
    rooms: 3, devices: 24, rules: 8, personas: 1, pluginsRequired: 0,
    thumbnailGradient: 'linear-gradient(135deg,#0c4a6e 0%,#0ea5e9 60%,#38bdf8 100%)',
    deployedTo: 1, forks: 0, subscribes: 0,
    visibility: 'private', status: 'draft',
    lastUpdated: '2 周前',
  },
  {
    id: 'sol-fork-kim',
    name: '韩国 Kim · 适老化 (Fork)',
    version: '2.0.0',
    author: 'Kim Min-jae',
    authorAvatar: 'K',
    authorGradient: 'from-rose-500 to-pink-500',
    description: 'Fork 自韩国 Kim,1247 Apply 爆款。已本地化:走廊雷达 + 中文播报。',
    category: 'eldercare',
    applicableArea: '80-130m²',
    rooms: 4, devices: 14, rules: 11, personas: 2, pluginsRequired: 1,
    thumbnailGradient: 'linear-gradient(135deg,#0c4a6e 0%,#0ea5e9 60%,#38bdf8 100%)',
    deployedTo: 0, forks: 0, subscribes: 0,
    visibility: 'private', status: 'draft',
    lastUpdated: '今天',
  },
];

export const VISIBILITY_META: Record<SolutionVisibility, { label: string; color: string; desc: string }> = {
  private:     { label: '私有',         color: '#64748b', desc: '只有我看得见 / 用得了' },
  shared:      { label: '团队/客户共享', color: '#06b6d4', desc: '指定客户或团队成员可见' },
  marketplace: { label: '已上架',       color: '#10b981', desc: '在 Marketplace 公开,Builder 可订阅' },
};

export const STATUS_META: Record<SolutionStatus, { label: string; color: string }> = {
  draft:    { label: '草稿',   color: '#f59e0b' },
  verified: { label: '已验证', color: '#10b981' },
  archived: { label: '已归档', color: '#64748b' },
};

export function getSolution(id: string): Solution | undefined {
  return SOLUTIONS.find(s => s.id === id);
}

// Studio 连接(Copilot Studio 顶部 Switcher 用)
export type StudioConnKind = 'sandbox' | 'production' | 'staging';
export type StudioConnStatus = 'connected' | 'connecting' | 'offline' | 'readonly';

export interface StudioConnection {
  id: string;
  label: string;
  customer?: string;
  customerId?: string;
  kind: StudioConnKind;
  status: StudioConnStatus;
  devices: number;
  online: number;
  ip?: string;
  rtt?: number; // ms
}

export const STUDIO_CONNECTIONS: StudioConnection[] = [
  {
    id: 'sandbox-1', label: 'Sandbox · 我的实验沙箱',
    kind: 'sandbox', status: 'connected',
    devices: 24, online: 24, ip: 'local', rtt: 2,
  },
  {
    id: 'aq-li-001', label: '李先生 · 主屋 140m²',
    customer: '李先生', customerId: 'cust-li',
    kind: 'production', status: 'connected',
    devices: 28, online: 27, ip: '192.168.10.42', rtt: 18,
  },
  {
    id: 'aq-eldercare-zhang', label: '张奶奶家 · 主屋 90m²',
    customer: '张奶奶家', customerId: 'cust-zhang',
    kind: 'production', status: 'readonly',
    devices: 11, online: 10, ip: '192.168.20.18', rtt: 32,
  },
  {
    id: 'aq-zhao-rental-3', label: '赵房东 · 出租 #3 · 待部署',
    customer: '赵房东', customerId: 'cust-zhao',
    kind: 'staging', status: 'connecting',
    devices: 12, online: 0, ip: '—', rtt: undefined,
  },
  {
    id: 'aq-wang-villa-2f', label: 'J女士 · 别墅二楼',
    customer: 'J女士', customerId: 'cust-wang',
    kind: 'production', status: 'offline',
    devices: 64, online: 0, rtt: undefined,
  },
];

export const STUDIO_KIND_META: Record<StudioConnKind, { label: string; color: string }> = {
  sandbox:    { label: 'Sandbox',    color: '#06b6d4' },
  production: { label: 'Production', color: '#10b981' },
  staging:    { label: 'Staging',    color: '#f59e0b' },
};
export const STUDIO_STATUS_META: Record<StudioConnStatus, { label: string; color: string }> = {
  connected:  { label: '已连接',    color: '#10b981' },
  connecting: { label: '连接中…',   color: '#f59e0b' },
  offline:    { label: '离线',      color: '#64748b' },
  readonly:   { label: '只读',      color: '#0ea5e9' },
};
