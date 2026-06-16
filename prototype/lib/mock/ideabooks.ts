export interface Ideabook {
  id: string;
  title: string;
  emoji: string;
  description: string;
  itemCount: number;
  gradient: string;
  updatedAt: string;
  visibility: 'private' | 'shared' | 'public';
  items: IdeabookItem[];
}

export interface IdeabookItem {
  id: string;
  type: 'showcase' | 'builder' | 'plugin' | 'device' | 'automation' | 'note';
  refId: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  gradient?: string;
  note?: string;
  addedAt: string;
}

export const MyIdeabooks: Ideabook[] = [
  {
    id: 'ib-living-room',
    title: '我家客厅灵感',
    emoji: '🛋',
    description: '暖光 + 自然材质 + 智能升降',
    itemCount: 12,
    gradient: 'linear-gradient(135deg,#fbbf24,#f97316)',
    updatedAt: '3 天前',
    visibility: 'private',
    items: [
      { id: 'i1', type: 'showcase', refId: 'sc-001', title: '意大利米兰 · 温润客厅', subtitle: 'Marco Bianchi', gradient: 'linear-gradient(135deg,#fef3c7,#f59e0b)', addedAt: '昨天' },
      { id: 'i2', type: 'showcase', refId: 'sc-002', title: '新中式书房融合方案', subtitle: '陈雪 · 北京', gradient: 'linear-gradient(135deg,#d4a373,#a68a64)', addedAt: '2 天前' },
      { id: 'i3', type: 'builder', refId: 'marco_bianchi', title: 'Marco Bianchi', subtitle: '🇮🇹 米兰 · Builder L5', addedAt: '2 天前' },
      { id: 'i4', type: 'plugin', refId: 'pl-ambient', title: '氛围灯 AI 自适应', subtitle: 'Aqara Official · ¥9/月', addedAt: '3 天前' },
      { id: 'i5', type: 'showcase', refId: 'sc-003', title: '北欧极简客厅', subtitle: 'Lee Soo-young · 首尔', gradient: 'linear-gradient(135deg,#e0e7ff,#a5b4fc)', addedAt: '3 天前' },
      { id: 'i6', type: 'device', refId: 'd-panel-h1', title: 'H1 智能面板 · 6 键', subtitle: 'Aqara 硬件 · ¥599', addedAt: '5 天前' },
      { id: 'i7', type: 'note', refId: 'n1', title: '周日去宜家看看沙发', note: '想要灰绿色 · 布艺 · 中大型 · 可拆洗', addedAt: '1 周前' },
    ],
  },
  {
    id: 'ib-eldercare',
    title: '适老化方案',
    emoji: '👴',
    description: '爸妈搬来同住 · 起夜防跌 · 紧急呼叫',
    itemCount: 8,
    gradient: 'linear-gradient(135deg,#86efac,#10b981)',
    updatedAt: '1 周前',
    visibility: 'private',
    items: [
      { id: 'e1', type: 'showcase', refId: 'sc-eldercare-01', title: '适老化万能方案 v2', subtitle: 'Aqara 官方认证', gradient: 'linear-gradient(135deg,#dcfce7,#86efac)', addedAt: '1 周前' },
      { id: 'e2', type: 'builder', refId: 'kim_acb', title: 'Kim Min-jun', subtitle: '🇰🇷 首尔 · 适老化专家', addedAt: '1 周前' },
      { id: 'e3', type: 'device', refId: 'd-fp2', title: '雷达防跌倒传感器 FP2', subtitle: '¥399', addedAt: '1 周前' },
      { id: 'e4', type: 'plugin', refId: 'pl-fall', title: '适老防跌倒预警 AI', subtitle: '@kim_acb · ¥19/月', addedAt: '1 周前' },
    ],
  },
  {
    id: 'ib-devices',
    title: '想要的设备',
    emoji: '📱',
    description: '攒钱清单 · 陆续买入',
    itemCount: 5,
    gradient: 'linear-gradient(135deg,#a5b4fc,#6366f1)',
    updatedAt: '2 周前',
    visibility: 'private',
    items: [
      { id: 'w1', type: 'device', refId: 'd-studio', title: 'Aqara Studio 主机', subtitle: '¥1,299 · 本地 AI 大脑', addedAt: '2 周前' },
      { id: 'w2', type: 'device', refId: 'd-g5', title: '摄像头 G5 Pro', subtitle: '¥799 · 全屋安防', addedAt: '2 周前' },
      { id: 'w3', type: 'device', refId: 'd-curtain', title: '智能窗帘电机', subtitle: '¥1,099 · 静音版', addedAt: '2 周前' },
    ],
  },
  {
    id: 'ib-remote',
    title: '远程办公改造',
    emoji: '💼',
    description: '让 home office 更专业',
    itemCount: 3,
    gradient: 'linear-gradient(135deg,#cbd5e1,#64748b)',
    updatedAt: '上个月',
    visibility: 'private',
    items: [
      { id: 'r1', type: 'automation', refId: 'a-focus', title: '专注模式', subtitle: 'AI 生成 · 2026-04-05', addedAt: '1 个月前' },
      { id: 'r2', type: 'plugin', refId: 'pl-meeting', title: '会议模式 Pro', subtitle: 'Aqara · ¥29/月', addedAt: '1 个月前' },
    ],
  },
];

export const getIdeabook = (id: string) => MyIdeabooks.find(b => b.id === id);
