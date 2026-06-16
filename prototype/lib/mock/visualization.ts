export type VisualizationOutputType = 'still' | 'short_video' | 'walkthrough' | 'before_after';
export type VisualizationReviewStatus = 'draft' | 'queued' | 'rendering' | 'ready' | 'pro_reviewed' | 'client_shared';

export interface VisualizationBrief {
  sourceDesignPlan: string;
  rooms: string[];
  moments: string[];
  deviceHighlights: string[];
  styleReference: string;
  constraints: string[];
  outputType: VisualizationOutputType;
  estimatedCredits: number;
  reviewStatus: VisualizationReviewStatus;
}

export interface GeneratedMediaAsset {
  id: string;
  title: string;
  room: string;
  moment: string;
  outputType: VisualizationOutputType;
  provider: 'marble' | 'internal-renderer';
  providerLabel: string;
  modelVersion: string;
  sourceDesignPlanVersion: string;
  promptHash: string;
  seed: number;
  generatedAt: string;
  creditsCost: number;
  reviewStatus: VisualizationReviewStatus;
  shareStatus: 'private' | 'in_client_package' | 'client_commented';
  gradient: string;
  script: string;
}

export const SAMPLE_VISUALIZATION_BRIEF: VisualizationBrief = {
  sourceDesignPlan: 'design-plan.v2.3',
  rooms: ['客厅', '玄关', '主卧'],
  moments: ['回家', '观影', '起夜'],
  deviceHighlights: ['Presence Sensor FP2', '智能灯带', '窗帘电机', '安防面板'],
  styleReference: 'Aqara Space 展厅风 · 明亮现代 · 暖白灯光',
  constraints: ['不移动承重墙', '不改主电箱', '只使用可施工 SKU', '客户地址与人物信息不进入外部模型'],
  outputType: 'walkthrough',
  estimatedCredits: 180,
  reviewStatus: 'ready',
};

export const SAMPLE_VISUALIZATION_ASSETS: GeneratedMediaAsset[] = [
  {
    id: 'vis-living-cinema',
    title: '客厅观影 Moment · 3D 漫游',
    room: '客厅',
    moment: '观影',
    outputType: 'walkthrough',
    provider: 'marble',
    providerLabel: 'World Model Provider',
    modelVersion: 'Marble preview adapter · v0.4',
    sourceDesignPlanVersion: 'design-plan.v2.3',
    promptHash: 'pmpt_7f3a91',
    seed: 28417,
    generatedAt: '2026-06-01 14:20',
    creditsCost: 180,
    reviewStatus: 'pro_reviewed',
    shareStatus: 'in_client_package',
    gradient: 'from-indigo-500/55 via-violet-500/35 to-cyan-400/45',
    script: '灯光从会客亮度平滑降到 18%，窗帘关闭，FP2 维持客厅存在感知，HomeKit 场景可同步触发。',
  },
  {
    id: 'vis-entry-arrive',
    title: '玄关回家 Moment · 前后对比',
    room: '玄关',
    moment: '回家',
    outputType: 'before_after',
    provider: 'marble',
    providerLabel: 'World Model Provider',
    modelVersion: 'Marble preview adapter · v0.4',
    sourceDesignPlanVersion: 'design-plan.v2.3',
    promptHash: 'pmpt_21cb09',
    seed: 94126,
    generatedAt: '2026-06-01 14:24',
    creditsCost: 96,
    reviewStatus: 'ready',
    shareStatus: 'private',
    gradient: 'from-amber-400/50 via-blue-500/30 to-emerald-400/45',
    script: '门锁开门后玄关灯自动亮起，客厅主灯进入迎宾亮度，安防状态切换到在家模式。',
  },
];

export function outputTypeLabel(type: VisualizationOutputType) {
  return {
    still: '效果图',
    short_video: '短视频',
    walkthrough: '可走动 3D 预览',
    before_after: '前后对比',
  }[type];
}

export function reviewStatusLabel(status: VisualizationReviewStatus) {
  return {
    draft: 'Brief 草稿',
    queued: '排队中',
    rendering: '生成中',
    ready: '待 Pro 审阅',
    pro_reviewed: 'Pro 已审阅',
    client_shared: '已进入客户评审包',
  }[status];
}
