// Copilot Studio · 对话 + Plan + Tool Call 时间线
// 模拟一个正在进行的设计 session — 用于 IDE 右侧面板

export type ChatRole = 'user' | 'assistant' | 'system';
export type StepStatus = 'pending' | 'running' | 'success' | 'fail' | 'waiting-approval';
export type ToolKind = 'topology' | 'device' | 'rule' | 'scene' | 'persona' | 'diff' | 'deploy' | 'simulate';

export interface ToolCall {
  kind: ToolKind;
  agent: string;          // agent id
  agentName: string;
  summary: string;        // "新增 8 台设备 / 3 条规则"
  detail?: string[];      // 展开 bullet
  status: StepStatus;
  durationMs?: number;
  needsApproval?: boolean;
}

export interface PlanStep {
  id: string;
  index: number;
  title: string;
  status: StepStatus;
  toolCalls: ToolCall[];
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: string;
  // assistant 消息可能附带 plan / 单独 tool call
  plan?: PlanStep[];
  pendingApproval?: {
    title: string;
    desc: string;
    changes: { kind: 'add' | 'modify' | 'remove'; target: string; detail?: string }[];
  };
}

// 当前 session 内容(模拟一个适老化项目的设计过程)
export const COPILOT_SESSION: ChatMessage[] = [
  {
    id: 'm-1',
    role: 'user',
    timestamp: '14:32',
    text: '张奶奶家 90m² 两居,独居,女儿在加州。要起夜防跌 + 紧急呼叫 + 远程关怀。预算 ¥8k。',
  },
  {
    id: 'm-2',
    role: 'assistant',
    timestamp: '14:32',
    text: '我已读取空间结构(2 室 + 卫生间 + 厨房 + 客厅),并基于"独居老人"Persona 启动了 3 个 Agent 协作。下面是我建议的方案,请审阅:',
    plan: [
      {
        id: 'step-1',
        index: 1,
        title: '识别空间 · 标注高风险动线',
        status: 'success',
        toolCalls: [
          {
            kind: 'topology', agent: 'space-agent', agentName: 'Space Agent',
            summary: '识别 5 个房间 · 标注 2 条夜间高风险动线(卧室→卫生间)',
            detail: ['主卧 → 走廊 → 卫生间 · 距离 4.2m', '客厅 → 卫生间 · 距离 6.8m'],
            status: 'success', durationMs: 820,
          },
          {
            kind: 'persona', agent: 'persona-agent', agentName: 'Persona Agent',
            summary: '应用 Persona: 独居老人 · 远程关怀',
            status: 'success', durationMs: 410,
          },
        ],
      },
      {
        id: 'step-2',
        index: 2,
        title: '布置设备 BOM · 13 件',
        status: 'success',
        toolCalls: [
          {
            kind: 'device', agent: 'provisioning-agent', agentName: 'Provisioning Agent',
            summary: '推荐 13 台设备 · ¥6,840(预算内)',
            detail: [
              'FP2 雷达 × 2 (主卧 + 卫生间)',
              '走廊 LED 灯带 × 1',
              '紧急按钮 × 2 (床头 + 卫生间)',
              '门窗传感器 × 4',
              '智能门锁 × 1 (含临时密码下发)',
              'M3 网关 × 1',
              '环境感应器 × 2',
            ],
            status: 'success', durationMs: 1240,
          },
        ],
      },
      {
        id: 'step-3',
        index: 3,
        title: '生成自动化场景 · 9 条',
        status: 'running',
        toolCalls: [
          {
            kind: 'scene', agent: 'scene-agent', agentName: 'Scene Agent',
            summary: '已生成 7 / 9 条规则,正在生成"远程关怀日报"',
            status: 'running',
          },
          {
            kind: 'rule', agent: 'linkage-agent', agentName: 'Linkage Agent',
            summary: '冲突检查 · 暂无冲突',
            status: 'success', durationMs: 280,
          },
        ],
      },
      {
        id: 'step-4',
        index: 4,
        title: '风险审阅 · 待执行',
        status: 'pending',
        toolCalls: [
          {
            kind: 'simulate', agent: 'review-agent', agentName: 'Review Agent',
            summary: '安全/隐私/合规审阅 · 等待前一步完成',
            status: 'pending',
          },
        ],
      },
      {
        id: 'step-5',
        index: 5,
        title: '部署到张奶奶家 Studio · 需审批',
        status: 'waiting-approval',
        toolCalls: [
          {
            kind: 'deploy', agent: 'devops-agent', agentName: 'DevOps Agent',
            summary: '生成 Deploy Plan · 物理操作需 Builder 确认',
            status: 'waiting-approval', needsApproval: true,
          },
        ],
      },
    ],
  },
  {
    id: 'm-3',
    role: 'user',
    timestamp: '14:35',
    text: '主卧的雷达放床头还是床尾?另外晚上灯渐亮要亮多久?',
  },
  {
    id: 'm-4',
    role: 'assistant',
    timestamp: '14:35',
    text: '推荐床尾 · 离床 1.8-2.4m 安装在墙面 220cm 高,这个角度能同时覆盖"床上动作"和"下床落地"两个场景。走廊灯渐亮建议 2.5 秒达到 40% 亮度 — 既能引导视线,又不会刺眼。两条都已经写入 step 3,需要我现在调整吗?',
  },
];

// Builder Copilot 在等审批的部署计划 — 右侧 Approval 卡片
export type DiffKind = 'add' | 'modify' | 'remove';

export interface PendingDeployChange {
  kind: DiffKind;
  count: number;
  target: string;
  detail: string;
}

export const PENDING_DEPLOY: {
  targetStudio: string;
  targetLabel: string;
  estimatedDuration: string;
  changes: PendingDeployChange[];
  snapshot: string;
  rollbackWindow: string;
  reviewFlags: { severity: 'info' | 'warn'; msg: string }[];
} = {
  targetStudio: 'aq-eldercare-zhang',
  targetLabel: '张奶奶家 · 主屋 90m²',
  estimatedDuration: '约 4 分钟',
  changes: [
    { kind: 'add',    count: 13, target: '新增设备', detail: 'FP2 × 2 / 走廊灯带 / 紧急按钮 × 2 / 门窗 × 4 / 网关 / 环境 × 2 / 门锁' },
    { kind: 'add',    count: 9,  target: '新增自动化规则', detail: '起夜引导 / 紧急呼叫 / 离床检测 / 远程关怀日报 等' },
    { kind: 'add',    count: 2,  target: '新增 Persona', detail: '独居老人 · 远程关怀(女儿账号)' },
    { kind: 'modify', count: 1,  target: '修改群组', detail: '"夜间区域" = 走廊 + 卫生间 + 主卧' },
  ],
  snapshot: 'snapshot-2026-05-14-14-32-pre-deploy',
  rollbackWindow: '部署后 72 小时一键回滚',
  reviewFlags: [
    { severity: 'info', msg: '紧急按钮已绑定女儿手机 SMS · 已在 Persona 中明示授权' },
    { severity: 'info', msg: 'FP2 雷达不采集图像 · 符合老人房隐私偏好' },
  ],
};
