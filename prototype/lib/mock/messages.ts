export interface Conversation {
  id: string;
  peerHandle: string;
  peerName: string;
  peerAvatar: string;
  peerLabel?: string;         // "Certified Installer · 上海徐汇"
  avatarGradient: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  context?: {
    // Lead / Quote context
    type: 'quote' | 'following' | 'support';
    projectTitle?: string;
    quoteStatus?: 'pending' | 'responded' | 'scheduled' | 'declined';
  };
  messages: Message[];
}

export interface Message {
  id: string;
  sender: 'me' | 'peer' | 'system';
  content: string;
  time: string;
  attachments?: { type: 'image' | 'ideabook' | 'floorplan'; label: string }[];
}

export const MyConversations: Conversation[] = [
  {
    id: 'conv-1',
    peerHandle: 'kim_acb',
    peerName: 'Kim Min-jun',
    peerAvatar: 'K',
    peerLabel: '🇰🇷 Certified Installer · 适老化专家',
    avatarGradient: 'from-purple-500 to-pink-500',
    lastMessage: '好的,我本周四下午 2 点到你家看下户型,可以吗?',
    lastTime: '10 分钟前',
    unread: 1,
    context: {
      type: 'quote',
      projectTitle: '适老化方案咨询',
      quoteStatus: 'scheduled',
    },
    messages: [
      { id: 'm1', sender: 'me', content: '你好 Kim,看到你在 Discover 上有个"适老化万能方案",我父母即将搬来同住,希望有类似方案。', time: '昨天 16:30' },
      { id: 'm2', sender: 'me', content: '我在上海徐汇,户型 180m² 三室两厅,预算大概 8w 以内。', time: '昨天 16:31', attachments: [{ type: 'ideabook', label: '已分享:适老化方案 Ideabook' }] },
      { id: 'm3', sender: 'peer', content: '感谢联系!刚好看到你的 Ideabook 收藏,思路很清晰 — 有起夜防跌倒 + 紧急呼叫需求对吧?', time: '昨天 17:05' },
      { id: 'm4', sender: 'peer', content: '建议方案分两阶段:\n1. 立刻装防跌倒雷达 + 紧急按钮(解决关键安全)\n2. 后续再把全屋加入 Persona 编排\n预算 8w 完全够,留部分给后期服务。', time: '昨天 17:07' },
      { id: 'm5', sender: 'me', content: '听起来很靠谱,能来家里看看吗?', time: '今晨 09:15' },
      { id: 'm6', sender: 'peer', content: '好的,我本周四下午 2 点到你家看下户型,可以吗?', time: '10 分钟前' },
    ],
  },
  {
    id: 'conv-2',
    peerHandle: 'marco_bianchi',
    peerName: 'Marco Bianchi',
    peerAvatar: 'M',
    peerLabel: '🇮🇹 Founder Creator · 米兰',
    avatarGradient: 'from-amber-500 to-red-500',
    lastMessage: '感谢关注!我上周末刚发了新作品,有你感兴趣的"温润客厅"系列',
    lastTime: '2 天前',
    unread: 0,
    context: {
      type: 'following',
    },
    messages: [
      { id: 'm1', sender: 'system', content: '你开始关注 Marco Bianchi · 2026-04-12', time: '2026-04-12' },
      { id: 'm2', sender: 'peer', content: '感谢关注!我上周末刚发了新作品,有你感兴趣的"温润客厅"系列', time: '2 天前', attachments: [{ type: 'image', label: '查看新作品' }] },
    ],
  },
  {
    id: 'conv-3',
    peerHandle: 'aqara_official',
    peerName: 'Aqara 客服',
    peerAvatar: '🅐',
    peerLabel: 'Aqara Official Support',
    avatarGradient: 'from-accent to-accent2',
    lastMessage: '你的 FP2 雷达已发货,预计 5/12 到货。',
    lastTime: '3 天前',
    unread: 0,
    context: { type: 'support' },
    messages: [
      { id: 'm1', sender: 'peer', content: '你的 FP2 雷达已发货,预计 5/12 到货。', time: '3 天前' },
    ],
  },
];

export const getConversation = (id: string) => MyConversations.find(c => c.id === id);

// ─── Pro-side: Builder receives messages from customers / leads ───

export interface ProConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  avatarGradient: string;
  customerLabel?: string; // "客户 · 适老化 · 3 项目"
  lastMessage: string;
  lastTime: string;
  unread: number;
  priority: 'urgent' | 'lead' | 'normal';
  context?: {
    type: 'lead-inquiry' | 'project-update' | 'support' | 'service-renewal';
    projectTitle?: string;
    studioId?: string;
    leadValue?: number;
  };
  messages: Message[];
}

export const ProConversations: ProConversation[] = [
  {
    id: 'pconv-chen',
    customerId: 'cust-chen',
    customerName: '陈先生',
    customerAvatar: '陈',
    avatarGradient: 'from-rose-500 to-red-600',
    customerLabel: '客户 · 亲子 · Studio 离线 14h',
    lastMessage: 'Jun 你好,我家的 Studio 是不是出问题了?门锁 App 里也连不上了,有点慌',
    lastTime: '23 分钟前',
    unread: 2,
    priority: 'urgent',
    context: {
      type: 'support',
      studioId: 'aq-chen-family',
    },
    messages: [
      { id: 'm1', sender: 'peer', content: 'Jun 你好,我家的 Studio 是不是出问题了?早上起来发现自动化全没响应', time: '今晨 09:02' },
      { id: 'm2', sender: 'peer', content: '门锁 App 里也连不上了,有点慌', time: '23 分钟前' },
    ],
  },
  {
    id: 'pconv-sun',
    customerId: 'cust-sun',
    customerName: '孙女士',
    customerAvatar: '孙',
    avatarGradient: 'from-orange-500 to-amber-500',
    customerLabel: 'Lead · 静安复式 · 极简风',
    lastMessage: '我看到你 Discover 上的"极简之家 v2",很喜欢。我家 200m² 复式,可以来勘察一下吗?预算 12w',
    lastTime: '今天上午',
    unread: 1,
    priority: 'lead',
    context: {
      type: 'lead-inquiry',
      leadValue: 120000,
    },
    messages: [
      { id: 'm1', sender: 'peer', content: '你好 Jun,我从 Aqara Builder 找到你', time: '今天 10:30' },
      { id: 'm2', sender: 'peer', content: '我看到你 Discover 上的"极简之家 v2",很喜欢。我家 200m² 复式,可以来勘察一下吗?预算 12w', time: '今天 10:32', attachments: [{ type: 'ideabook', label: '已分享:她的 Ideabook(8 张)' }] },
    ],
  },
  {
    id: 'pconv-wu',
    customerId: 'cust-wu',
    customerName: '吴先生',
    customerAvatar: '吴',
    avatarGradient: 'from-violet-500 to-fuchsia-500',
    customerLabel: '客户 · 别墅 · 二期改造',
    lastMessage: '上周方案里那个庭院灯光,我和老婆商量了下,想再加 2 个区域 — 凉亭 + 鱼池边',
    lastTime: '8 分钟前',
    unread: 1,
    priority: 'normal',
    context: {
      type: 'project-update',
      projectTitle: 'J氏别墅二期改造',
      studioId: 'aq-wu-villa',
    },
    messages: [
      { id: 'm1', sender: 'me', content: '吴先生好,二期方案我已经发到您邮箱,有时间看看。庭院的部分按上次聊的做了 4 个区域。', time: '昨天 18:00' },
      { id: 'm2', sender: 'peer', content: '好的,看完了,大体满意!', time: '今晨 11:00' },
      { id: 'm3', sender: 'peer', content: '上周方案里那个庭院灯光,我和老婆商量了下,想再加 2 个区域 — 凉亭 + 鱼池边', time: '8 分钟前' },
    ],
  },
  {
    id: 'pconv-zhao',
    customerId: 'cust-zhao',
    customerName: '赵房东',
    customerAvatar: '赵',
    avatarGradient: 'from-amber-400 to-orange-500',
    customerLabel: '客户 · 出租 ×6 · 月续费',
    lastMessage: '本月续费的服务订阅,我直接微信付了哈,你看下后台',
    lastTime: '5 天前',
    unread: 0,
    priority: 'normal',
    context: {
      type: 'service-renewal',
    },
    messages: [
      { id: 'm1', sender: 'peer', content: '本月续费的服务订阅,我直接微信付了哈,你看下后台', time: '5 天前' },
      { id: 'm2', sender: 'me', content: '收到!后台已确认 ¥720 入账,本月监控继续。任何新房间装修需要也直接说。', time: '5 天前' },
    ],
  },
  {
    id: 'pconv-zhang',
    customerId: 'cust-zhang',
    customerName: '张奶奶家(王女士联络)',
    customerAvatar: '张',
    avatarGradient: 'from-pink-500 to-rose-500',
    customerLabel: '客户 · 适老化 · 远程关怀',
    lastMessage: 'Jun 你好,我妈昨晚那个紧急按钮按了一次,我看到了通知。我家在加州能不能远程查一下?',
    lastTime: '1 小时前',
    unread: 1,
    priority: 'urgent',
    context: {
      type: 'support',
      studioId: 'aq-eldercare-zhang',
    },
    messages: [
      { id: 'm1', sender: 'peer', content: 'Jun 你好,我妈昨晚那个紧急按钮按了一次,我看到了通知', time: '1 小时前' },
      { id: 'm2', sender: 'peer', content: '我家在加州能不能远程查一下?她现在没接电话,有点担心', time: '1 小时前' },
    ],
  },
];

export const getProConversation = (id: string) => ProConversations.find(c => c.id === id);

export const proMessageStats = () => {
  const total = ProConversations.length;
  const unread = ProConversations.reduce((s, c) => s + c.unread, 0);
  const urgent = ProConversations.filter(c => c.priority === 'urgent').length;
  const leads = ProConversations.filter(c => c.priority === 'lead').length;
  return { total, unread, urgent, leads };
};
