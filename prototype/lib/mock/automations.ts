export interface Automation {
  id: string;
  name: string;
  emoji: string;
  spaceId: string;
  spaceName: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  actions: string[];
  devicesInvolved: number;
  lastTriggered?: string;
  createdFrom: 'template' | 'ai' | 'manual';
  createdAt: string;
}

export const MyAutomations: Automation[] = [
  {
    id: 'auto-001',
    name: '晚安模式',
    emoji: '🌙',
    spaceId: 'space-home',
    spaceName: '我的家',
    status: 'active',
    trigger: '每天 23:00',
    actions: ['主灯关闭', '氛围灯 10%', '窗帘关闭', '门锁布防'],
    devicesInvolved: 7,
    lastTriggered: '昨晚 23:00',
    createdFrom: 'template',
    createdAt: '2026-03-10',
  },
  {
    id: 'auto-002',
    name: '起夜模式',
    emoji: '🚽',
    spaceId: 'space-home',
    spaceName: '我的家',
    status: 'active',
    trigger: '走廊检测到人 + 时间 22:00–06:30',
    actions: ['走廊夜灯 10%', '卫生间灯 30%', '3 分钟无人熄灭'],
    devicesInvolved: 3,
    lastTriggered: '今晨 02:34',
    createdFrom: 'ai',
    createdAt: '2026-04-02',
  },
  {
    id: 'auto-003',
    name: '离家模式',
    emoji: '🚪',
    spaceId: 'space-home',
    spaceName: '我的家',
    status: 'active',
    trigger: '门锁反锁',
    actions: ['全屋断电 (非必要)', '摄像头布防', '空调关闭', '窗户状态检测'],
    devicesInvolved: 12,
    lastTriggered: '昨天 08:45',
    createdFrom: 'template',
    createdAt: '2026-03-12',
  },
  {
    id: 'auto-004',
    name: '电影院模式',
    emoji: '🎬',
    spaceId: 'space-home',
    spaceName: '我的家',
    status: 'active',
    trigger: '说"看电影" / 按场景键',
    actions: ['主灯关闭', '氛围灯紫色', '投影打开', '窗帘关闭'],
    devicesInvolved: 5,
    lastTriggered: '3 天前',
    createdFrom: 'ai',
    createdAt: '2026-04-15',
  },
  {
    id: 'auto-005',
    name: '周末赖床',
    emoji: '🛏',
    spaceId: 'space-home',
    spaceName: '我的家',
    status: 'paused',
    trigger: '周六/周日 09:00',
    actions: ['窗帘缓慢打开 30%', '咖啡机预热', '轻音乐'],
    devicesInvolved: 3,
    lastTriggered: '暂停中',
    createdFrom: 'ai',
    createdAt: '2026-04-20',
  },
  {
    id: 'auto-006',
    name: '父母家晚安',
    emoji: '👴',
    spaceId: 'space-parents',
    spaceName: '父母家',
    status: 'active',
    trigger: '每天 22:00',
    actions: ['走廊夜灯开启', '防跌倒雷达启用', '紧急按钮检测'],
    devicesInvolved: 6,
    lastTriggered: '昨晚 22:00',
    createdFrom: 'template',
    createdAt: '2026-02-18',
  },
  // Draft (from AI, not yet activated)
  {
    id: 'auto-draft-01',
    name: '专注模式',
    emoji: '🎯',
    spaceId: 'space-home',
    spaceName: '我的家',
    status: 'draft',
    trigger: '说"专注"',
    actions: ['通知屏蔽', '主灯 80% 冷光', '空调 24°C', '白噪音'],
    devicesInvolved: 4,
    createdFrom: 'ai',
    createdAt: '2026-05-08',
  },
  {
    id: 'auto-draft-02',
    name: '客人到家',
    emoji: '👋',
    spaceId: 'space-home',
    spaceName: '我的家',
    status: 'draft',
    trigger: '门锁识别到访客 + 预约过',
    actions: ['主灯全开', '空调 24°C 5 分钟前预热', '欢迎音乐'],
    devicesInvolved: 6,
    createdFrom: 'ai',
    createdAt: '2026-05-09',
  },
];

export const MySpaces = [
  { id: 'space-home', name: '我的家', emoji: '🏠', deviceCount: 47, studioName: 'aqarastudio-b9c4', status: 'healthy', isDefault: true },
  { id: 'space-parents', name: '父母家', emoji: '👴', deviceCount: 23, studioName: 'aqarastudio-elder', status: 'healthy', isDefault: false },
  { id: 'space-la', name: '洛杉矶的家', emoji: '🇺🇸', deviceCount: 15, studioName: 'aqarastudio-la', status: 'offline', isDefault: false },
];
