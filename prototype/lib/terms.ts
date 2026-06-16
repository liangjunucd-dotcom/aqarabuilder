/**
 * 全局术语表 — 单一事实源 (SoT)。
 * 所有 UI 文案从这里读,方便全局替换。
 *
 * 关键决策:
 * - 平台名 = 身份名:都是 "Builder"(所有用户)
 * - 三维身份模型：Access Level (builder/pro/verified) + Badge (4种) + Level (1-5)
 * - verified = Aqara Certified Professional（Aqara 总部认证伞），解锁线索、协作、服务记录
 * - Badge 4 选多(叠加):Certified Installer / Spatial Designer / Plugin Developer / Solution Architect
 * - 顶级名衔:Founder(灯塔三国 30 名)
 * - 创作工具统称 "Build"，旧 Build AI 并入 Build Brief / Agent 流程
 * - 三件套:Build · Space / Build · Life / Build · Driver
 */
export const TERMS = {
  platform: 'Aqara Builder',
  platformShort: 'Builder',
  proConsole: 'Builder Pro',
  proDomain: 'pro.builder.aqara.com',
  publicDomain: 'builder.aqara.com',

  // 身份
  role: {
    user: 'Builder',
    userVerified: 'Aqara Certified Professional',
    verifiedBadge: 'Certified Installer',
    founder: 'Founder',
  },

  // Badge（子角色）
  subRoles: [
    { id: 'installer', en: 'Certified Installer', zh: '认证安装' },
    { id: 'designer', en: 'Spatial Designer', zh: '空间设计' },
    { id: 'developer', en: 'Plugin Developer', zh: '插件开发' },
    { id: 'architect', en: 'Solution Architect', zh: '方案架构' },
  ],

  // 创作工具
  build: {
    group: 'Build',
    space: { en: 'Build · Space', zh: '空间编排', desc: 'Persona + 户型 + 设备 + 自动化' },
    app: { en: 'Build · Life', zh: '家庭看板', desc: '家庭成员看板 / 卡片 / 交互' },
    driver: { en: 'Build · Driver', zh: '驱动开发', desc: '协议解析 / 设备适配' },
  },

  // Builder Pro 导航(最新,已废弃 Workshop 作为顶层名)
  proNav: {
    home: { label: 'Home', zh: '工作台' },
    build: { label: 'Build', zh: '创作' },
    projects: { label: 'Projects', zh: '项目' },
    studios: { label: 'Studios', zh: 'Studio 管理' },
    leads: { label: 'Leads', zh: '派单' },
    earnings: { label: 'Ledger', zh: '项目账本' },
    academy: { label: 'Academy', zh: '学习' },
    marketplace: { label: 'Marketplace', zh: '我的插件' },
    settings: { label: 'Settings', zh: '设置' },
    help: { label: 'Help', zh: '帮助' },
  },

  // AI 算力档
  aiTiers: [
    { id: 'architect', label: '空间设计师', factor: '5x', desc: '从 0 新项目 / 复杂全屋 / Persona 全重做' },
    { id: 'planner', label: '方案师', factor: '3x', desc: '已有方案优化 / 风格改写 / 标配微调' },
    { id: 'helper', label: '助理', factor: '0.5x', desc: '格式转换 / 单点调整 / 快速渲染' },
  ],
};
