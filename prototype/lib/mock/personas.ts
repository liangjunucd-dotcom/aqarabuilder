export interface PersonaTemplate {
  id: string;
  name: string;
  role: string; // 主人 / 老人 / 儿童 / 宠物 / 客人
  avatar: string;
  traits: string[];
  emoji: string;
  color: string;
}

export const Personas: PersonaTemplate[] = [
  {
    id: 'p-host',
    name: 'Jun',
    role: '主人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=host&backgroundColor=6366f1',
    traits: ['科技感', '语音优先', '通勤场景', '健康监测'],
    emoji: '👤',
    color: '#6366f1',
  },
  {
    id: 'p-elder',
    name: 'J伯父',
    role: '老人 (78)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elder&backgroundColor=10b981',
    traits: ['大字体', '低亮度', '紧急一键呼', '起夜防跌'],
    emoji: '🌿',
    color: '#10b981',
  },
  {
    id: 'p-kid',
    name: '小宝',
    role: '儿童 (10)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kid&backgroundColor=ec4899',
    traits: ['家长管控', '学习模式', '低蓝光', '故事时间'],
    emoji: '🎒',
    color: '#ec4899',
  },
  {
    id: 'p-pet',
    name: '小白',
    role: '宠物 (柯基)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pet&backgroundColor=f59e0b',
    traits: ['自动喂食', '定位', '出门提醒', '运动量监测'],
    emoji: '🐶',
    color: '#f59e0b',
  },
  {
    id: 'p-guest',
    name: '客人',
    role: '访客 / 临时',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=64748b',
    traits: ['时间窗访问', '简化界面', '隐私模式', '到期自动失效'],
    emoji: '✦',
    color: '#64748b',
  },
];
