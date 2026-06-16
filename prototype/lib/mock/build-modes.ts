import {
  Sparkles,
  Brain,
  Crown,
  Wand2,
  Home as HomeIcon,
  FileImage,
  Lightbulb,
  GitFork,
  Cpu,
  type LucideIcon,
} from 'lucide-react';

export type BuildTier = 'user' | 'pro';

// ─── AI Tier ──────────────────────────────────
// 空间设计职业层级: 总设计师 / 方案师 / 草图师
export type AITier = 'assistant' | 'pro' | 'architect';

export interface AITierDef {
  id: AITier;
  label: string;
  factor: string; // "0.5x" / "3x" / "5x"
  desc: string;
  detail: string; // long description shown in dropdown
  icon: LucideIcon;
  unlocksFor: BuildTier; // user = 所有人; pro = 仅 Pro
  approxCost: string; // 单次约消耗
}

export const AI_TIERS: AITierDef[] = [
  {
    id: 'architect',
    label: '总设计师',
    factor: '5x',
    desc: '深思熟虑 · 整屋整项目',
    detail: '最强方案构思能力。适合从 0 创建客户项目、完整户型方案、跨房间 Persona 编排。速度慢、消耗高,但成品最完整。',
    icon: Crown,
    unlocksFor: 'pro',
    approxCost: '40-80 A',
  },
  {
    id: 'pro',
    label: '方案师',
    factor: '3x',
    desc: '稳定 · 大多数任务首选',
    detail: '平衡的方案能力。适合修改优化已有方案、单房间布置、自动化场景细化、设备清单。速度较快、消耗中等。User 默认档。',
    icon: Brain,
    unlocksFor: 'user',
    approxCost: '5-15 A',
  },
  {
    id: 'assistant',
    label: '草图师',
    factor: '0.5x',
    desc: '快、便宜 · 单条任务',
    detail: '最快最便宜。适合改个文案、生成单条自动化、格式转换、配色微调。不适合从 0 创作新方案。',
    icon: Sparkles,
    unlocksFor: 'user',
    approxCost: '1-3 A',
  },
];

// ─── Source ──────────────────────────────────
// 起点 — 用户从哪里开始
// 这是关键设计: 普通用户可以"虚拟创作"(户型图)或"基于真实 Studio"
export type SourceId = 'studio' | 'floorplan' | 'inspiration' | 'fork';

export interface SourceDef {
  id: SourceId;
  label: string;
  desc: string;
  icon: LucideIcon;
  emoji: string;
  unlocksFor: BuildTier;
}

export const BUILD_SOURCES: SourceDef[] = [
  {
    id: 'studio',
    label: '从我家 Studio',
    desc: '基于真实设备 + 空间语义 · 推荐',
    icon: Cpu,
    emoji: '🏠',
    unlocksFor: 'user',
  },
  {
    id: 'floorplan',
    label: '上传户型图',
    desc: '虚拟创作 · 体验完整流程',
    icon: FileImage,
    emoji: '📐',
    unlocksFor: 'user',
  },
  {
    id: 'inspiration',
    label: '从灵感开始',
    desc: '纯文字描述,边聊边定',
    icon: Lightbulb,
    emoji: '✨',
    unlocksFor: 'user',
  },
  {
    id: 'fork',
    label: 'Fork 别人作品',
    desc: '从 Discover 上的方案改一改',
    icon: GitFork,
    emoji: '🌐',
    unlocksFor: 'pro',
  },
];

// ─── Templates ──────────────────────────────────
// 模板 = 已经验证过的"成品方向",一键复用

export interface BuildTemplate {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  badge?: 'NEW' | 'QUICK' | 'PRO' | 'HOT';
  tier: BuildTier;
  prompt?: string;
  // Recommended source + tier when picking this template
  recommendedSource: SourceId;
  recommendedTier: AITier;
  gradient: string;
}

export const BUILD_TEMPLATES: BuildTemplate[] = [
  // User-level templates
  {
    id: 't-cinema',
    title: '客厅观影',
    desc: '主灯关 + 氛围灯 + 投影',
    emoji: '🎬',
    badge: 'HOT',
    tier: 'user',
    prompt: '客厅晚上想要电影院的氛围,主灯关、氛围灯紫色、投影自动开',
    recommendedSource: 'studio',
    recommendedTier: 'pro',
    gradient: 'linear-gradient(135deg,#1e293b 0%,#7c3aed 100%)',
  },
  {
    id: 't-morning',
    title: '早起仪式',
    desc: '工作日 7:00 渐进唤醒',
    emoji: '🌅',
    badge: 'QUICK',
    tier: 'user',
    prompt: '工作日 7:00 窗帘渐开 30%,咖啡机预热,播放新闻',
    recommendedSource: 'studio',
    recommendedTier: 'assistant',
    gradient: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)',
  },
  {
    id: 't-elder',
    title: '老人安全',
    desc: '夜间起夜防跌倒',
    emoji: '👴',
    badge: 'NEW',
    tier: 'user',
    prompt: '父母同住,夜间起夜希望走廊灯渐亮,降低跌倒风险',
    recommendedSource: 'studio',
    recommendedTier: 'pro',
    gradient: 'linear-gradient(135deg,#10b981 0%,#06b6d4 100%)',
  },
  {
    id: 't-virtual-90',
    title: '虚拟新家 · 90m²',
    desc: '上传户型图,AI 帮你预演',
    emoji: '📐',
    badge: 'NEW',
    tier: 'user',
    prompt: '新房 90m² 三居,准备装修,想看看智能化能做到什么',
    recommendedSource: 'floorplan',
    recommendedTier: 'pro',
    gradient: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
  },
  {
    id: 't-leave',
    title: '离家自动化',
    desc: '出门反锁 → 全屋断电',
    emoji: '🚪',
    tier: 'user',
    prompt: '门锁反锁后,全屋断电、摄像头布防、空调关闭',
    recommendedSource: 'studio',
    recommendedTier: 'assistant',
    gradient: 'linear-gradient(135deg,#64748b 0%,#475569 100%)',
  },
  {
    id: 't-pet',
    title: '宠物友好',
    desc: '出门也能照顾它们',
    emoji: '🐱',
    tier: 'user',
    prompt: '家里养了一只猫,白天希望摄像头自动关注它,异常发通知',
    recommendedSource: 'studio',
    recommendedTier: 'pro',
    gradient: 'linear-gradient(135deg,#a855f7 0%,#ec4899 100%)',
  },

  // Pro-level templates — 5 cards, big visual style
  {
    id: 'p-eldercare-v3',
    title: '适老化整屋',
    desc: '4 Persona · 起夜防跌 · 远程关怀',
    emoji: '🌿',
    badge: 'PRO',
    tier: 'pro',
    prompt: '客户 90m² 主屋,老母亲独居,女儿在加州。要全屋适老化:起夜防跌、紧急一键呼、卫生间防滑、远程关怀。预算 ¥18k',
    recommendedSource: 'studio',
    recommendedTier: 'architect',
    gradient: 'linear-gradient(135deg,#064e3b 0%,#10b981 60%,#34d399 100%)',
  },
  {
    id: 'p-villa',
    title: '别墅整装提案',
    desc: '380m² · 上传户型 → 完整方案 + 漫游',
    emoji: '🏡',
    badge: 'NEW',
    tier: 'pro',
    prompt: '客户别墅 380m² 双层,六口之家。一楼公共区 + 二楼卧室区 + 庭院。要 4 Persona、夜间安防、远程关怀',
    recommendedSource: 'floorplan',
    recommendedTier: 'architect',
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#7c3aed 60%,#a855f7 100%)',
  },
  {
    id: 'p-rental-v2',
    title: '出租房批量方案',
    desc: '一套模板复制到 N 套房',
    emoji: '🏠',
    badge: 'QUICK',
    tier: 'pro',
    prompt: '出租房标配方案,12 件设备,要节能、漏水告警、钥匙托管。一套模板复制到 N 套房',
    recommendedSource: 'floorplan',
    recommendedTier: 'pro',
    gradient: 'linear-gradient(135deg,#78350f 0%,#f59e0b 60%,#fcd34d 100%)',
  },
  {
    id: 'p-fork-eldercare',
    title: 'Fork 爆款方案',
    desc: '韩国 Kim 适老化 · 1247 Apply',
    emoji: '🔱',
    badge: 'HOT',
    tier: 'pro',
    prompt: '基于"老人房适老化 · 起夜防跌方案"模板,客户家有走廊较长,需要再加一个走廊雷达',
    recommendedSource: 'fork',
    recommendedTier: 'pro',
    gradient: 'linear-gradient(135deg,#0c4a6e 0%,#0ea5e9 60%,#38bdf8 100%)',
  },
  {
    id: 'p-family',
    title: '亲子三居',
    desc: '家长管控 · 学习模式 · 晚安仪式',
    emoji: '👨‍👩‍👧',
    badge: 'PRO',
    tier: 'pro',
    prompt: '120m² 三居,有 6 岁孩子。要儿童安全锁、学习专注模式、家长管控、晚安仪式',
    recommendedSource: 'studio',
    recommendedTier: 'architect',
    gradient: 'linear-gradient(135deg,#831843 0%,#ec4899 60%,#f9a8d4 100%)',
  },
];

// ─── Inspiration prompts ──────────────────────

export const INSPIRATION_PROMPTS: Record<BuildTier, string[]> = {
  user: [
    '客厅观影 · 氛围灯 + 投影',
    '父母起夜 · 走廊灯渐亮',
    '专注模式 · 关通知 + 调温',
    '出租屋节能 · 离开自动断电',
    '宠物友好 · 摄像头 + 自动喂食',
    '夜安宁 · 22:30 卧室自动调暗',
    '玄关迎宾 · 门锁开 → 灯亮',
    '雨天关窗 · 检测到雨自动关',
  ],
  pro: [
    '180m² 三居 · 老人同住 · 预算 8w',
    '别墅整装 · 6 Persona · 跨层联动',
    '20 套出租房 · 复用模板 · 远程巡检',
    '幼儿园项目 · Persona 安全 + 学习',
    '高端酒店 · 隐私优先 · 多语言面板',
    '复式跨层 · 一二楼分区 + 庭院',
    '客户验收交付 · 自动生成手册',
    '基于韩国 Kim 适老化模板改本地化',
  ],
};

// ─── Helpers ──────────────────────────────────

export function sourcesForTier(tier: BuildTier): SourceDef[] {
  return BUILD_SOURCES; // All visible, locked ones shown but disabled
}

export function tiersForTier(tier: BuildTier): AITierDef[] {
  return AI_TIERS; // All visible, Pro tiers shown but locked for user
}

export function templatesForTier(tier: BuildTier): BuildTemplate[] {
  if (tier === 'pro') return BUILD_TEMPLATES;
  return BUILD_TEMPLATES.filter(t => t.tier === 'user');
}
