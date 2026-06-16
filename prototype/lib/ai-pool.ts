// Plan Credits 与 Business Credits 的数据契约
//
// Credits 是用户可见的统一资源单位，用于 AI/model/compute 消耗。

import type { PlanId } from './plans';

export interface AIUsageBucket {
  /** 按稳定成本形态分桶，不按具体按钮分桶。 */
  category: 'ai_assistant' | 'space_analysis' | 'solution' | 'visualization' | 'automation' | 'ide' | 'driver';
  label: string;
  rateLabel?: string;
  /** 已消耗 Credits */
  used: number;
  /** 本周期该类预算；0 表示只记录不设分类上限 */
  limit: number;
}

export type AIClientApp = 'life_app' | 'builder_home' | 'builder_pro' | 'builder_pro_mobile' | 'design_platform';

export interface UsageCenterPool {
  workspaceId: string;
  workspaceName: string;
  planId: PlanId;
  planName: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  welcomeCredits?: number;
  buckets: AIUsageBucket[];
}

export interface PersonalAIPool {
  kind: 'personal';
  planId: PlanId;
  /** 当前剩余可用 Credits */
  balance: number;
  /** 本周期总额度（每月赠送 + 已购） */
  monthlyQuota: number;
  /** 本月已用 */
  monthlyUsed: number;
  /** 距离重置剩余天数 */
  resetInDays: number;
  /** 分类用量 */
  buckets: AIUsageBucket[];
  /** 最近 7 天每天消耗，用作 trend chart */
  weeklyTrend: number[];
}

export interface TeamAIPool {
  kind: 'team';
  comingSoon: true;
  description: string;
  capabilities: string[];
}

export const SAMPLE_PERSONAL_POOL: PersonalAIPool = {
  kind: 'personal',
  planId: 'pro',
  balance: 720,
  monthlyQuota: 1200,
  monthlyUsed: 480,
  resetInDays: 18,
  buckets: [
    { category: 'ai_assistant',   label: 'AI Chat',              rateLabel: '≈ 1-8 Credits / request', used: 180, limit: 600 },
    { category: 'space_analysis', label: 'Floor Plan Analysis',  rateLabel: '≈ 10-80 Credits / run',   used: 120, limit: 300 },
    { category: 'solution',       label: 'Solution Generation',  rateLabel: '≈ 20-120 Credits / run',  used: 90,  limit: 200 },
    { category: 'visualization',  label: '3D / Visual',          rateLabel: '≈ 20-200 Credits / run',  used: 70,  limit: 100 },
    { category: 'automation',     label: 'Automation Design',    rateLabel: '≈ 5-50 Credits / run',    used: 20,  limit: 100 },
    { category: 'ide',            label: 'Design Platform',      rateLabel: 'usage-based',             used: 10,  limit: 0 },
  ],
  weeklyTrend: [40, 65, 28, 90, 70, 110, 77],
};

export const FREE_USAGE_CENTER_POOL: UsageCenterPool = {
  workspaceId: 'personal',
  workspaceName: 'Personal',
  planId: 'free',
  planName: 'Free',
  periodLabel: '本周额度',
  periodStart: '2026-06-01',
  periodEnd: '2026-06-07',
  welcomeCredits: 100,
  buckets: [
    { category: 'ai_assistant', label: 'AI Chat', rateLabel: 'basic model', used: 12, limit: 60 },
    { category: 'space_analysis', label: 'Floor Plan', rateLabel: 'light analysis', used: 10, limit: 20 },
    { category: 'solution', label: 'Solution / Automation', rateLabel: 'draft mode', used: 4, limit: 15 },
    { category: 'visualization', label: '3D / Visual', rateLabel: 'preview mode', used: 0, limit: 5 },
  ],
};

export const PROFESSIONAL_FREE_USAGE_CENTER_POOL: UsageCenterPool = {
  workspaceId: 'personal',
  workspaceName: 'Personal Workspace',
  planId: 'free',
  planName: 'Free',
  periodLabel: '每月刷新',
  periodStart: '2026-06-01',
  periodEnd: '2026-06-30',
  buckets: [
    { category: 'ai_assistant', label: 'AI Chat', rateLabel: 'included with Free', used: 12, limit: 60 },
    { category: 'space_analysis', label: 'Floor Plan Analysis', rateLabel: 'included with Free', used: 10, limit: 20 },
    { category: 'solution', label: 'Solution / Automation', rateLabel: 'included with Free', used: 4, limit: 15 },
    { category: 'visualization', label: '3D / Visual', rateLabel: 'included with Free', used: 0, limit: 5 },
  ],
};

export const PRO_USAGE_CENTER_POOL: UsageCenterPool = {
  workspaceId: 'personal',
  workspaceName: 'Personal',
  planId: 'pro',
  planName: 'Pro',
  periodLabel: '本月额度',
  periodStart: '2026-06-01',
  periodEnd: '2026-06-30',
  buckets: [
    { category: 'ai_assistant', label: 'AI Chat', rateLabel: '≈ 1-8 Credits / request', used: 280, limit: 900 },
    { category: 'space_analysis', label: 'Floor Plan Analysis', rateLabel: '≈ 10-80 Credits / run', used: 160, limit: 400 },
    { category: 'solution', label: 'Solution / Automation', rateLabel: '≈ 20-120 Credits / run', used: 140, limit: 450 },
    { category: 'visualization', label: '3D / Visual', rateLabel: '≈ 20-200 Credits / run', used: 100, limit: 250 },
  ],
};

export const SAMPLE_USAGE_CENTER_POOL = PRO_USAGE_CENTER_POOL;

export function getUsageCenterPool(input?: {
  planId?: PlanId;
  workspaceId?: string;
  workspaceName?: string;
  professional?: boolean;
}): UsageCenterPool {
  const planId = input?.planId ?? 'free';
  const base: UsageCenterPool =
    planId === 'free'
      ? input?.professional
        ? PROFESSIONAL_FREE_USAGE_CENTER_POOL
        : FREE_USAGE_CENTER_POOL
      : planId === 'business'
        ? {
          workspaceId: 'business',
          workspaceName: 'Team Workspace',
          planId: 'business',
          planName: 'Business',
          periodLabel: '本月额度',
          periodStart: '2026-06-01',
          periodEnd: '2026-06-30',
          buckets: [
            { category: 'ai_assistant', label: 'AI Chat', rateLabel: 'shared by seats', used: 1800, limit: 4200 },
            { category: 'space_analysis', label: 'Floor Plan Analysis', rateLabel: 'shared by projects', used: 1100, limit: 2400 },
            { category: 'solution', label: 'Solution / Automation', rateLabel: 'shared by projects', used: 800, limit: 2200 },
            { category: 'visualization', label: '3D / Visual', rateLabel: 'shared by projects', used: 500, limit: 1200 },
          ],
        }
        : planId === 'enterprise'
          ? {
            workspaceId: 'enterprise',
            workspaceName: 'Enterprise Workspace',
            planId: 'enterprise',
            planName: 'Enterprise',
            periodLabel: '合同额度',
            periodStart: '2026-06-01',
            periodEnd: '2026-06-30',
            buckets: [
              { category: 'ai_assistant', label: 'AI Chat', rateLabel: 'contract pool', used: 1200, limit: 24000 },
              { category: 'space_analysis', label: 'Floor Plan Analysis', rateLabel: 'contract pool', used: 820, limit: 12000 },
              { category: 'solution', label: 'Solution / Automation', rateLabel: 'contract pool', used: 520, limit: 12000 },
              { category: 'visualization', label: '3D / Visual', rateLabel: 'contract pool', used: 260, limit: 6000 },
            ],
          }
          : PRO_USAGE_CENTER_POOL;

  return {
    ...base,
    workspaceId: input?.workspaceId ?? base.workspaceId,
    workspaceName: input?.workspaceName ?? base.workspaceName,
  };
}

export const TEAM_POOL_PREVIEW: TeamAIPool = {
  kind: 'team',
  comingSoon: true,
  description: '面向团队工作区的共享 Credits，Business / Enterprise 计划提供。',
  capabilities: [
    '团队共享 Plan Credits',
    '成员使用上限',
    '项目 AI 成本统计',
    '团队用量看板',
  ],
};
