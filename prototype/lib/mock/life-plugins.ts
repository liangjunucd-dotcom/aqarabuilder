export type LifeCategory = 'security' | 'energy' | 'health' | 'kids' | 'lighting'
export type PluginTag = 'Official' | 'ACB' | 'Developer'

export interface LifePlugin {
  id: string
  name: string
  desc: string
  category: LifeCategory
  gradient: string      // tailwind bg-gradient-to-br classes (from-X to-Y)
  emoji: string
  rating: number        // 0–100 thumb-up %
  installs: string      // e.g. "4.2K"
  author: string
  tag: PluginTag
  studioOnly: boolean
  price: string
}

export interface HotPlay {
  id: string
  name: string
  gradient: string
  emoji: string
  rating: number
  installs: string
  studioOnly: boolean
}

export const LIFE_CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: 'all',      label: '全部',   emoji: '✦' },
  { id: 'security', label: '安全服务', emoji: '🛡️' },
  { id: 'energy',   label: '节能管理', emoji: '⚡' },
  { id: 'health',   label: '健康生活', emoji: '🌿' },
  { id: 'kids',     label: '儿童模式', emoji: '🧒' },
  { id: 'lighting', label: '氛围照明', emoji: '💡' },
]

export const LIFE_PLUGINS: LifePlugin[] = [
  // ─── 安全服务 (studioOnly) ──────────────────────────────────────
  {
    id: 'lp-001',
    name: '家庭安防套装',
    desc: '全屋门窗传感器 + 摄像头联动防护，异常立即推送。支持布防 / 撤防时间表，Aqara FP2 毫米波雷达可选配。',
    category: 'security',
    gradient: 'from-slate-800 to-blue-900',
    emoji: '🛡️',
    rating: 96,
    installs: '4.2K',
    author: 'Aqara Official',
    tag: 'Official',
    studioOnly: true,
    price: 'Free',
  },
  {
    id: 'lp-002',
    name: '门锁访问日志',
    desc: '全天候记录门锁开关事件，陌生人脸识别预警，支持子账户权限精细管理与操作审计导出。',
    category: 'security',
    gradient: 'from-gray-800 to-slate-700',
    emoji: '🔑',
    rating: 89,
    installs: '2.1K',
    author: 'kim_acb',
    tag: 'ACB',
    studioOnly: true,
    price: '¥9.9',
  },
  {
    id: 'lp-003',
    name: '漏水烟雾预警',
    desc: '水浸 + 烟雾传感器联动报警，自动关闭电动阀门，微信 / 短信双通道推送，30 秒内响应。',
    category: 'security',
    gradient: 'from-cyan-900 to-blue-800',
    emoji: '🚨',
    rating: 94,
    installs: '3.1K',
    author: 'Aqara Official',
    tag: 'Official',
    studioOnly: true,
    price: 'Free',
  },

  // ─── 节能管理 (studioOnly) ──────────────────────────────────────
  {
    id: 'lp-004',
    name: '能耗分析报告',
    desc: '按日 / 月可视化用电趋势，自动识别高耗能设备，生成节能建议报告，同比数据对比。',
    category: 'energy',
    gradient: 'from-amber-700 to-yellow-600',
    emoji: '⚡',
    rating: 91,
    installs: '3.8K',
    author: 'Aqara Official',
    tag: 'Official',
    studioOnly: true,
    price: 'Free',
  },
  {
    id: 'lp-005',
    name: '离家节能模式',
    desc: '人员离开后自动关闭待机设备、降低空调设定温度，平均节省 18% 月电费，支持例外规则配置。',
    category: 'energy',
    gradient: 'from-green-800 to-emerald-700',
    emoji: '🚪',
    rating: 94,
    installs: '5.1K',
    author: 'chen_dev',
    tag: 'ACB',
    studioOnly: true,
    price: '¥6.9',
  },

  // ─── 健康生活 ────────────────────────────────────────────────────
  {
    id: 'lp-006',
    name: '健康睡眠助手',
    desc: '睡眠模式自动降温、关灯、静音。FP2 雷达监测睡眠质量，次日生成报告，适合全家成员独立设置。',
    category: 'health',
    gradient: 'from-indigo-800 to-purple-900',
    emoji: '🌙',
    rating: 93,
    installs: '6.7K',
    author: 'Aqara Official',
    tag: 'Official',
    studioOnly: false,
    price: 'Free',
  },
  {
    id: 'lp-007',
    name: '空气质量守护',
    desc: 'PM2.5 / CO₂ / 温湿度实时监测，净化器 + 新风系统智能联动，触发阈值可自定义。',
    category: 'health',
    gradient: 'from-teal-700 to-cyan-600',
    emoji: '🌿',
    rating: 88,
    installs: '3.3K',
    author: 'kim_acb',
    tag: 'ACB',
    studioOnly: false,
    price: '¥12.9',
  },
  {
    id: 'lp-008',
    name: '适老防跌倒预警',
    desc: 'FP2 毫米波雷达姿态识别，摔倒自动推送子女账户并呼叫紧急联系人，误报率低于 2%。',
    category: 'health',
    gradient: 'from-emerald-700 to-green-900',
    emoji: '🏥',
    rating: 97,
    installs: '4.3K',
    author: 'kim_acb',
    tag: 'ACB',
    studioOnly: false,
    price: '订阅 ¥19/月',
  },

  // ─── 儿童模式 ────────────────────────────────────────────────────
  {
    id: 'lp-009',
    name: '亲子学习模式',
    desc: '上课/作业/休息三阶段自动切换。低蓝光护眼灯 + WiFi 限速 + 专注计时器，家长端实时查看状态。',
    category: 'kids',
    gradient: 'from-orange-600 to-amber-500',
    emoji: '📚',
    rating: 97,
    installs: '5.6K',
    author: 'Aqara Official',
    tag: 'Official',
    studioOnly: false,
    price: 'Free',
  },
  {
    id: 'lp-010',
    name: '晚安故事灯',
    desc: '睡前灯光渐暗场景 + 故事音频播放，定时关闭，亮度色温随故事情节自动变化，支持家长预设剧本。',
    category: 'kids',
    gradient: 'from-rose-800 to-pink-900',
    emoji: '⭐',
    rating: 95,
    installs: '4.4K',
    author: 'chen_dev',
    tag: 'ACB',
    studioOnly: false,
    price: '¥8.9',
  },

  // ─── 氛围照明 ────────────────────────────────────────────────────
  {
    id: 'lp-011',
    name: '日出日落模拟',
    desc: '根据地理位置自动同步日出日落时间，光色温从冷到暖渐变，配合唤醒闹钟和入睡场景，更符合人体节律。',
    category: 'lighting',
    gradient: 'from-orange-500 to-amber-400',
    emoji: '🌅',
    rating: 94,
    installs: '8.2K',
    author: 'Aqara Official',
    tag: 'Official',
    studioOnly: false,
    price: 'Free',
  },
  {
    id: 'lp-012',
    name: '星空氛围灯',
    desc: '深夜治愈系星空投影效果，灯光随机闪烁模拟真实夜空，支持多区域分组、亮度与节奏自定义。',
    category: 'lighting',
    gradient: 'from-slate-900 to-blue-950',
    emoji: '🌌',
    rating: 91,
    installs: '7.1K',
    author: 'lee_acb',
    tag: 'ACB',
    studioOnly: false,
    price: '¥9.9',
  },
  {
    id: 'lp-013',
    name: '音乐律动灯光',
    desc: '麦克风拾音实时分析节拍，灯光色彩随音乐跳动，支持 20+ 内置音乐风格主题，派对必备。',
    category: 'lighting',
    gradient: 'from-indigo-700 to-purple-700',
    emoji: '🦋',
    rating: 88,
    installs: '3.9K',
    author: 'kim_acb',
    tag: 'ACB',
    studioOnly: false,
    price: '¥6.9',
  },
  {
    id: 'lp-014',
    name: '影院氛围套装',
    desc: '电视背光 + 环境灯联动，随片源自动调色，支持 Ambilight 风格延伸，Kodi / Apple TV 兼容。',
    category: 'lighting',
    gradient: 'from-gray-900 to-slate-800',
    emoji: '🎬',
    rating: 92,
    installs: '6.0K',
    author: 'Aqara Official',
    tag: 'Official',
    studioOnly: false,
    price: 'Free',
  },
]

export const HOT_PLAYS: HotPlay[] = [
  { id: 'hp-001', name: '到家开灯',   gradient: 'from-sky-700 to-blue-800',     emoji: '🏠', rating: 96, installs: '12K',  studioOnly: false },
  { id: 'hp-002', name: '睡前放松',   gradient: 'from-indigo-900 to-purple-900', emoji: '😴', rating: 98, installs: '9.8K', studioOnly: false },
  { id: 'hp-003', name: '离家一键',   gradient: 'from-green-800 to-emerald-900', emoji: '🚪', rating: 92, installs: '7.2K', studioOnly: true  },
  { id: 'hp-004', name: '晚餐氛围',   gradient: 'from-amber-700 to-orange-700',  emoji: '🕯️', rating: 89, installs: '5.4K', studioOnly: false },
  { id: 'hp-005', name: '影院模式',   gradient: 'from-slate-900 to-gray-900',    emoji: '🎬', rating: 94, installs: '8.1K', studioOnly: true  },
  { id: 'hp-006', name: '晨间唤醒',   gradient: 'from-orange-600 to-yellow-500', emoji: '☀️', rating: 91, installs: '6.6K', studioOnly: false },
]

export const getLifePlugin = (id: string) => LIFE_PLUGINS.find(p => p.id === id)
