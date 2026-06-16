// Copilot Studio · Agent Library
// Agents 按"使用场景域"分组,而不是技术模块,让 Builder 用起来更直觉

export type AgentGroup = 'discover' | 'provision' | 'automate' | 'optimize' | 'operate' | 'build';
export type AgentForm = 'ambient' | 'invoked' | 'agentic';
export type AgentTier = 'free' | 'pro' | 'certified' | 'enterprise';

export interface Agent {
  id: string;
  name: string;
  group: AgentGroup;
  desc: string;
  longDesc: string;
  defaultForm: AgentForm;
  unlocksFor: AgentTier;
  iconKey: string; // 映射到 lucide
  color: string;
  // MCP 工具/权限范围 — 自然限制能力
  capabilities: string[];
  // 默认是否启用,在 Design Platform 里上线时勾选
  enabledByDefault: boolean;
}

export const AGENT_GROUPS: { id: AgentGroup; label: string; desc: string; color: string }[] = [
  { id: 'discover',  label: 'Discover',  desc: '空间识别 · 用户洞察',     color: '#6366f1' },
  { id: 'provision', label: 'Provision', desc: '设备发现 · 拓扑配网',      color: '#06b6d4' },
  { id: 'automate',  label: 'Automate',  desc: '场景 · 联动 · 时序',       color: '#10b981' },
  { id: 'optimize',  label: 'Optimize',  desc: '能耗 · 数据洞察',           color: '#f59e0b' },
  { id: 'operate',   label: 'Operate',   desc: '诊断 · 事件 · 运维',        color: '#a855f7' },
  { id: 'build',     label: 'Build',     desc: '插件代码 · 文档 · 测试',    color: '#ec4899' },
];

export const FORM_LABEL: Record<AgentForm, string> = {
  ambient: '环境式',
  invoked: '召唤式',
  agentic: '代理式',
};

export const TIER_LABEL: Record<AgentTier, string> = {
  free: 'Free',
  pro: 'Pro',
  certified: 'Certified',
  enterprise: 'Enterprise',
};

export const AGENTS: Agent[] = [
  // ─── Discover ───────────────────────────────
  {
    id: 'space-agent', name: 'Space Agent', group: 'discover',
    desc: '画/识别空间图谱 · 户型解读',
    longDesc: '从户型图、扫描或自然语言描述,识别房间、出入口、家具尺度,生成空间本体图谱(Ontology)。',
    defaultForm: 'invoked', unlocksFor: 'free',
    iconKey: 'home', color: '#6366f1',
    capabilities: ['floorplan.parse', 'topology.create', 'topology.label'],
    enabledByDefault: true,
  },
  {
    id: 'persona-agent', name: 'Persona Agent', group: 'discover',
    desc: '推荐人群画像 · 生活方式映射',
    longDesc: '基于客户描述和空间信息,推荐家庭成员 Persona 模板(老人 / 学龄儿 / 远程办公等),并把生活节律映射到房间动线。',
    defaultForm: 'ambient', unlocksFor: 'free',
    iconKey: 'users', color: '#8b5cf6',
    capabilities: ['persona.suggest', 'persona.map'],
    enabledByDefault: true,
  },

  // ─── Provision ──────────────────────────────
  {
    id: 'provisioning-agent', name: 'Provisioning Agent', group: 'provision',
    desc: '批量入网 · 拓扑校验',
    longDesc: '设备批量发现、按房间归类、自动绑定网关。冲突时给出替代方案,部署前 dry-run 校验。',
    defaultForm: 'agentic', unlocksFor: 'free',
    iconKey: 'cpu', color: '#06b6d4',
    capabilities: ['device.discover', 'device.bind', 'device.batch'],
    enabledByDefault: true,
  },
  {
    id: 'gateway-agent', name: 'Gateway Agent', group: 'provision',
    desc: '网关选型 · Mesh 信道规划',
    longDesc: 'Zigbee/Thread/BLE Mesh 信道分析,基于设备数与房间布局推荐网关位置,避免无线干扰。',
    defaultForm: 'invoked', unlocksFor: 'pro',
    iconKey: 'wifi', color: '#0ea5e9',
    capabilities: ['network.analyze', 'gateway.recommend'],
    enabledByDefault: false,
  },
  {
    id: 'group-agent', name: 'Group Agent', group: 'provision',
    desc: '群组 / 区域划分',
    longDesc: '按房间、楼层、Persona 自动分组;支持跨房间逻辑组(如"夜间区域"=主卧+老人房+卫生间)。',
    defaultForm: 'invoked', unlocksFor: 'free',
    iconKey: 'layers', color: '#0284c7',
    capabilities: ['group.create', 'group.assign'],
    enabledByDefault: true,
  },

  // ─── Automate ──────────────────────────────
  {
    id: 'scene-agent', name: 'Scene Agent', group: 'automate',
    desc: '场景生成 · 基于人/时/事件',
    longDesc: '基于 Persona 节律、空间语义、当前时段,生成场景候选并模拟执行。',
    defaultForm: 'agentic', unlocksFor: 'free',
    iconKey: 'sparkles', color: '#10b981',
    capabilities: ['scene.create', 'scene.simulate'],
    enabledByDefault: true,
  },
  {
    id: 'linkage-agent', name: 'Linkage Agent', group: 'automate',
    desc: '联动规则 · 冲突检测',
    longDesc: '生成跨设备联动规则,检测潜在冲突(如同一时段窗帘同时开/关)、给出优先级建议。',
    defaultForm: 'agentic', unlocksFor: 'free',
    iconKey: 'zap', color: '#22c55e',
    capabilities: ['rule.create', 'rule.lint', 'rule.simulate'],
    enabledByDefault: true,
  },
  {
    id: 'scheduler-agent', name: 'Scheduler Agent', group: 'automate',
    desc: '时序 · 节律 · 季节性',
    longDesc: '基于日出日落、节假日、家庭日历,生成时序规则;支持季节切换(冬季加预热)。',
    defaultForm: 'invoked', unlocksFor: 'pro',
    iconKey: 'clock', color: '#16a34a',
    capabilities: ['schedule.create', 'schedule.seasonal'],
    enabledByDefault: false,
  },

  // ─── Optimize ───────────────────────────────
  {
    id: 'energy-agent', name: 'Energy Agent', group: 'optimize',
    desc: '能耗分析 · 用电报告',
    longDesc: '持续分析家庭用电,识别高能耗设备时段,推荐节能策略并量化收益。',
    defaultForm: 'ambient', unlocksFor: 'pro',
    iconKey: 'bolt', color: '#f59e0b',
    capabilities: ['energy.analyze', 'energy.report'],
    enabledByDefault: true,
  },
  {
    id: 'data-agent', name: 'Data Agent', group: 'optimize',
    desc: '使用洞察 · 改进建议',
    longDesc: '分析自动化触发频次、用户手动覆盖率,识别"无人用"的场景并给出改进建议。',
    defaultForm: 'ambient', unlocksFor: 'pro',
    iconKey: 'bar-chart', color: '#eab308',
    capabilities: ['data.aggregate', 'data.suggest'],
    enabledByDefault: false,
  },

  // ─── Operate ───────────────────────────────
  {
    id: 'diagnose-agent', name: 'Diagnose Agent', group: 'operate',
    desc: '故障诊断 · 日志解读',
    longDesc: '从设备日志、信号强度、规则触发情况快速定位问题根因,给出修复路径。',
    defaultForm: 'invoked', unlocksFor: 'free',
    iconKey: 'stethoscope', color: '#a855f7',
    capabilities: ['log.analyze', 'device.test'],
    enabledByDefault: true,
  },
  {
    id: 'event-agent', name: 'Event Agent', group: 'operate',
    desc: '事件流追踪',
    longDesc: '实时事件流可视化,过滤特定房间/设备/Persona 的事件,辅助调试自动化。',
    defaultForm: 'ambient', unlocksFor: 'free',
    iconKey: 'activity', color: '#9333ea',
    capabilities: ['event.stream', 'event.filter'],
    enabledByDefault: false,
  },
  {
    id: 'devops-agent', name: 'DevOps Agent', group: 'operate',
    desc: 'OTA · 批量运维',
    longDesc: '跨多个客户 Studio 的批量固件升级、配置同步、健康巡检,失败自动回滚。',
    defaultForm: 'invoked', unlocksFor: 'certified',
    iconKey: 'server', color: '#7e22ce',
    capabilities: ['fleet.update', 'fleet.rollback', 'fleet.audit'],
    enabledByDefault: false,
  },

  // ─── Build (高阶) ───────────────────────────────
  {
    id: 'plugin-code-agent', name: 'Plugin Code Agent', group: 'build',
    desc: 'Aqara Life 插件代码生成',
    longDesc: '从设备能力描述生成 Aqara Life 插件骨架(UI + 逻辑 + 国际化),沙箱预览 + 一键打包。',
    defaultForm: 'invoked', unlocksFor: 'certified',
    iconKey: 'code', color: '#ec4899',
    capabilities: ['plugin.scaffold', 'plugin.preview', 'plugin.build'],
    enabledByDefault: false,
  },
  {
    id: 'arch-agent', name: 'Arch Agent', group: 'build',
    desc: '复杂方案架构',
    longDesc: '面向多 Studio / 跨楼层 / 多 Persona 的复杂方案,生成架构图、Studio 拆分建议、规则归属。',
    defaultForm: 'agentic', unlocksFor: 'certified',
    iconKey: 'compass', color: '#db2777',
    capabilities: ['arch.design', 'arch.split'],
    enabledByDefault: false,
  },
  {
    id: 'doc-agent', name: 'Doc Agent', group: 'build',
    desc: '方案文档化 · 交付手册',
    longDesc: '把当前方案自动生成客户验收手册、Builder 维护文档、Showcase 草稿。',
    defaultForm: 'invoked', unlocksFor: 'pro',
    iconKey: 'file-text', color: '#be185d',
    capabilities: ['doc.draft', 'doc.export'],
    enabledByDefault: false,
  },
  {
    id: 'review-agent', name: 'Review Agent', group: 'build',
    desc: '方案审阅 · 风险检查',
    longDesc: '部署前安全/隐私/合规风险扫描:摄像头朝向、远程访问范围、敏感传感器位置等。',
    defaultForm: 'invoked', unlocksFor: 'pro',
    iconKey: 'shield-check', color: '#9d174d',
    capabilities: ['review.security', 'review.privacy'],
    enabledByDefault: true,
  },
  {
    id: 'translate-agent', name: 'Translate Agent', group: 'build',
    desc: '本地化 · 多语言交付',
    longDesc: '把方案描述、Showcase、客户面板自动翻译成 EN/KR/JP/IT,保留品牌术语一致性。',
    defaultForm: 'invoked', unlocksFor: 'free',
    iconKey: 'globe', color: '#831843',
    capabilities: ['i18n.translate', 'i18n.terms'],
    enabledByDefault: false,
  },
];

// 权限/配额(给 IDE 顶部展示用)
export interface BuilderTierQuota {
  tier: AgentTier;
  label: string;
  monthlyCalls: number;
  concurrentStudios: number;
  solutionsCap: number | 'unlimited';
  agenticMaxSteps: number | 'unlimited';
  canPublish: boolean;
}

export const TIER_QUOTAS: BuilderTierQuota[] = [
  { tier: 'free',       label: 'Free',       monthlyCalls: 100,    concurrentStudios: 1,  solutionsCap: 3,           agenticMaxSteps: 0,           canPublish: false },
  { tier: 'pro',        label: 'Pro',        monthlyCalls: 2000,   concurrentStudios: 5,  solutionsCap: 50,          agenticMaxSteps: 10,          canPublish: false },
  { tier: 'certified',  label: 'Certified',  monthlyCalls: 20000,  concurrentStudios: 20, solutionsCap: 'unlimited', agenticMaxSteps: 50,          canPublish: true  },
  { tier: 'enterprise', label: 'Enterprise', monthlyCalls: 99999,  concurrentStudios: 99, solutionsCap: 'unlimited', agenticMaxSteps: 'unlimited', canPublish: true  },
];

export function agentsByGroup(group: AgentGroup): Agent[] {
  return AGENTS.filter(a => a.group === group);
}

export function isAgentLocked(agent: Agent, currentTier: AgentTier): boolean {
  const order: AgentTier[] = ['free', 'pro', 'certified', 'enterprise'];
  return order.indexOf(agent.unlocksFor) > order.indexOf(currentTier);
}

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find(a => a.id === id);
}
