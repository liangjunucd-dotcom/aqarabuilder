import { Inbox, MessageSquare, FileSignature, CheckCircle2, Ban, Phone, Calendar, FileText } from 'lucide-react';
import type { ProjectNote, ProjectTask, ProjectFile, FloorPlanRef } from './projects';

// ─── Lead Status (legacy, kept for backward compat) ───────────────────

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

export const STATUS_META: Record<LeadStatus, { label: string; color: string; icon: any }> = {
  new:       { label: '新线索', color: '#06b6d4', icon: Inbox },
  contacted: { label: '已联系', color: '#8b5cf6', icon: MessageSquare },
  quoted:    { label: '已报价', color: '#a855f7', icon: FileSignature },
  won:       { label: '已成交', color: '#10b981', icon: CheckCircle2 },
  lost:      { label: '已放弃', color: '#64748b', icon: Ban },
};

export const ACTIVE_STATUSES: LeadStatus[] = ['new', 'contacted', 'quoted'];
export const INACTIVE_STATUSES: LeadStatus[] = ['won', 'lost'];

// ─── Lead Stage (new primary system) ──────────────────────────────────

export type LeadStage = 'new' | 'follow_up' | 'connected' | 'meeting_scheduled' | 'estimate_sent' | 'won' | 'lost';

export const LEAD_STAGE_META: Record<LeadStage, { label: string; color: string; icon: any; stage: number }> = {
  new:               { label: 'New',                color: '#06b6d4', icon: Inbox,           stage: 1 },
  follow_up:         { label: 'Follow Up',          color: '#8b5cf6', icon: MessageSquare,   stage: 2 },
  connected:         { label: 'Connected',          color: '#a855f7', icon: Phone,           stage: 3 },
  meeting_scheduled: { label: 'Meeting Scheduled',  color: '#f59e0b', icon: Calendar,        stage: 4 },
  estimate_sent:     { label: 'Estimate Sent',      color: '#ef4444', icon: FileSignature,   stage: 5 },
  won:               { label: 'Won',                color: '#10b981', icon: CheckCircle2,    stage: 6 },
  lost:              { label: 'Lost',               color: '#64748b', icon: Ban,             stage: 0 },
};

export const LEAD_STAGE_ORDER: LeadStage[] = [
  'new', 'follow_up', 'connected', 'meeting_scheduled', 'estimate_sent', 'won',
];

export const ACTIVE_LEAD_STAGES: LeadStage[] = [
  'new', 'follow_up', 'connected', 'meeting_scheduled', 'estimate_sent',
];

export const INACTIVE_LEAD_STAGES: LeadStage[] = ['won', 'lost'];

// Managed Lead Stages — customizable sub-stages for each main stage
export const MANAGED_LEAD_STAGES: Record<LeadStage, string[]> = {
  new:               [],
  follow_up:         ['Phone Call', 'Email', 'SMS / WeChat'],
  connected:         ['Needs Assessment', 'Site Visit Pending', 'Awaiting Client Input'],
  meeting_scheduled: ['Confirmed', 'Rescheduled', 'Post-Meeting Follow-up'],
  estimate_sent:     ['Awaiting Response', 'Negotiating', 'Revision Requested'],
  won:               ['Contract Signed', 'Deposit Received', 'Ready to Convert'],
  lost:              ['No Response', 'Budget Rejected', 'Competitor Chosen', 'Timing'],
};

// Map legacy status to new stage
export function legacyStatusToStage(status: LeadStatus): LeadStage {
  const map: Record<LeadStatus, LeadStage> = {
    new: 'new',
    contacted: 'connected',
    quoted: 'estimate_sent',
    won: 'won',
    lost: 'lost',
  };
  return map[status] || 'new';
}

// ─── Lead Interface ───────────────────────────────────────────────────

export interface LeadActivity {
  id: string;
  type: 'note' | 'call' | 'email' | 'quote_sent' | 'status_change' | 'task_added' | 'file_uploaded';
  text: string;
  author: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  customer: string;
  city: string;
  size: string;
  budget: string;
  source: string;
  desc: string;
  matchScore?: number;
  postedAt: string;
  status: LeadStatus;
  // New stage system (primary display)
  stage?: LeadStage;
  managedStage?: string;
  tags: string[];
  orderId?: string;
  acceptedAt?: string;
  responseHours?: number;
  responseSla?: 24 | 48;
  // Enriched fields for detail page
  email?: string;
  phone?: string;
  notes?: ProjectNote[];
  tasks?: ProjectTask[];
  files?: ProjectFile[];
  floorPlans?: FloorPlanRef[];
  activities?: LeadActivity[];
}

export const LEAD_SOURCES = [
  '门店转介', '官网表单', '社交媒体', 'Life App 询单', '客户推荐', 'EU Builder Network', '社区话题转介', '其他',
];

// ─── Helpers ──────────────────────────────────────────────────────────

/** Resolve a lead's effective stage, falling back from legacy status */
export function resolveLeadStage(lead: Lead): LeadStage {
  return lead.stage ?? legacyStatusToStage(lead.status);
}

// ─── Mock Data ───────────────────────────────────────────────────────

export const CARDS: Lead[] = [
  {
    id: 'L-2026051001', customer: '陈女士', city: '上海·浦东', size: '180m² 三室两厅',
    budget: '¥80k–¥120k', source: '浦东东方店转介', desc: '父母同住适老化 — 起夜防跌、紧急呼叫、子女远程查看。',
    matchScore: 96, postedAt: '23 分钟前', status: 'new', stage: 'new',
    tags: ['适老化', '高优'], responseHours: 0.4, responseSla: 24,
    phone: '138****6789', email: 'chen@example.com',
    activities: [
      { id: 'a1', type: 'note', text: '高匹配度线索，适老化标签匹配公司核心能力', author: '系统', timestamp: '23 分钟前' },
    ],
  },
  {
    id: 'L-2026050902', customer: '吴先生', city: '上海·徐汇', size: '95m² 两室',
    budget: '¥30k–¥50k', source: '小红书 #适老化', desc: '租房改造，要求方案可拆卸不破坏墙体，预算紧张。',
    matchScore: 88, postedAt: '2 小时前', status: 'new', stage: 'follow_up',
    tags: ['租房'], responseHours: 2, responseSla: 24,
    phone: '139****1234',
    activities: [
      { id: 'a2', type: 'note', text: '租房场景，需要可拆卸方案', author: '系统', timestamp: '2 小时前' },
    ],
  },
  {
    id: 'L-2026050903', customer: '郑先生', city: '上海·虹桥', size: '140m² 三室',
    budget: '¥50k–¥70k', source: '客户推荐', desc: '新房装修，想做全屋智能灯光 + 窗帘 + 门锁联动。',
    matchScore: 91, postedAt: '5 小时前', status: 'new', stage: 'new',
    tags: ['全屋智能', '新房'], responseHours: 5, responseSla: 24,
  },
  {
    id: 'L-2026050803', customer: '王女士', city: '杭州·西湖', size: '120m² 三室',
    budget: '¥40k–¥60k', source: '官网表单', desc: '家里有孩子，想做亲子智能方案，关注安全与健康监测。',
    matchScore: 85, postedAt: '1 天前', status: 'contacted', stage: 'connected',
    tags: ['亲子', '安全'], responseHours: 8, responseSla: 48,
    phone: '186****3456', email: 'wang@example.com',
    notes: [
      { id: 'n1', text: '客户预算弹性较大，可推荐高端传感器套装', author: 'Jun (A)', createdAt: '1 天前', pinned: true },
      { id: 'n2', text: '已通过电话确认需求，近期安排上门勘测', author: 'Jun (A)', createdAt: '12 小时前' },
    ],
    tasks: [
      { id: 't1', title: '上门勘测预约', done: true, due: '2026-05-09', owner: 'Jun (A)', priority: 'high' },
      { id: 't2', title: '准备亲子方案初稿', done: false, due: '2026-05-11', owner: 'Jun (A)', priority: 'medium' },
    ],
    files: [
      { name: '户型图-v1.pdf', size: '2.4 MB', kind: 'pdf', tag: 'planning', uploadedAt: '2026-05-08' },
      { name: '勘测照片-客厅.jpg', size: '3.1 MB', kind: 'photos', tag: 'planning', uploadedAt: '2026-05-08' },
    ],
    activities: [
      { id: 'a3', type: 'call', text: '电话沟通 15 分钟 — 确认需求和预算范围', author: 'Jun (A)', timestamp: '昨天 14:30' },
      { id: 'a4', type: 'note', text: '客户对安全监测特别关注，家有 3 岁小孩', author: 'Jun (A)', timestamp: '昨天 14:35' },
      { id: 'a5', type: 'task_added', text: '添加上门勘测任务', author: 'Jun (A)', timestamp: '昨天 15:00' },
      { id: 'a6', type: 'file_uploaded', text: '上传户型图 v1', author: 'Jun (A)', timestamp: '昨天 15:10' },
    ],
  },
  {
    id: 'L-2026050801', customer: 'J先生', city: '苏州·园区', size: '380m² 别墅 双层',
    budget: '¥300k+', source: '官网 / 别墅整装表单', desc: '别墅全屋智能 + 影音室 + 庭院联动。',
    matchScore: 99, postedAt: '昨天', status: 'quoted', stage: 'estimate_sent',
    tags: ['别墅', '高客单'], responseHours: 18, responseSla: 48,
    email: 'j@villa.com',
    notes: [
      { id: 'n3', text: '高客单价项目，建议安排 Senior 设计师跟进', author: 'Jun (A)', createdAt: '昨天 10:00', pinned: true },
      { id: 'n4', text: '客户偏好 KNX 总线方案 + HomeKit 集成', author: 'Jun (A)', createdAt: '昨天 16:00' },
    ],
    tasks: [
      { id: 't3', title: '发送初步报价', done: true, due: '2026-05-09', owner: 'Jun (A)', priority: 'high' },
      { id: 't4', title: '准备影音室方案', done: false, due: '2026-05-14', owner: 'Jun (A)', priority: 'high' },
      { id: 't5', title: '庭院联动设计', done: false, due: '2026-05-16', owner: 'Jun (A)', priority: 'medium' },
    ],
    files: [
      { name: '别墅平面图.dwg', size: '8.5 MB', kind: 'dwg', tag: 'planning', uploadedAt: '2026-05-08' },
      { name: '影音室需求清单.pdf', size: '1.2 MB', kind: 'pdf', tag: 'planning', uploadedAt: '2026-05-08' },
      { name: '参考案例-现代风.jpg', size: '4.7 MB', kind: 'photos', tag: 'planning', uploadedAt: '2026-05-09' },
    ],
    floorPlans: [
      { id: 'fp-1', name: '一层平面图', thumbnailPattern: 'rooms', rooms: 8, devices: 24, createdAt: '2026-05-08', updatedAt: '2026-05-09', status: 'draft' },
      { id: 'fp-2', name: '二层平面图', thumbnailPattern: 'top', rooms: 5, devices: 18, createdAt: '2026-05-09', updatedAt: '2026-05-09', status: 'draft' },
    ],
    activities: [
      { id: 'a7', type: 'call', text: '电话沟通 30 分钟 — 确认全屋需求范围', author: 'Jun (A)', timestamp: '昨天 09:00' },
      { id: 'a8', type: 'quote_sent', text: '初步报价已发送 ¥300k+', author: 'Jun (A)', timestamp: '昨天 17:00' },
      { id: 'a9', type: 'file_uploaded', text: '上传别墅平面图 DWG', author: 'Jun (A)', timestamp: '昨天 16:30' },
      { id: 'a10', type: 'note', text: '等待客户确认报价，预计本周内回复', author: 'Jun (A)', timestamp: '今天 08:00' },
    ],
  },
  {
    id: 'L-2026050702', customer: '李奶奶女儿', city: '杭州·拱墅', size: '90m² 两室',
    budget: '¥6k–¥10k', source: 'Life App 询单', desc: '想给奶奶装套基础适老化，希望参考"张奶奶适老化"方案。',
    matchScore: 92, postedAt: '2 天前', status: 'quoted', stage: 'estimate_sent',
    tags: ['适老化', '小户型'], responseHours: 36, responseSla: 48,
    phone: '150****7890',
    notes: [
      { id: 'n5', text: '可复用"张奶奶适老化"方案模板，降低设计成本', author: 'Jun (A)', createdAt: '2 天前' },
    ],
    tasks: [
      { id: 't6', title: '复用张奶奶方案并调整', done: true, due: '2026-05-10', owner: 'Jun (A)', priority: 'medium' },
      { id: 't7', title: '发送参考报价', done: false, due: '2026-05-12', owner: 'Jun (A)', priority: 'medium' },
    ],
    activities: [
      { id: 'a11', type: 'note', text: '通过 Life App 询单，客户明确想要参考"张奶奶适老化"方案', author: '系统', timestamp: '2 天前' },
      { id: 'a12', type: 'status_change', text: '状态变更为 Estimate Sent', author: 'Jun (A)', timestamp: '1 天前' },
    ],
  },
  {
    id: 'L-2026050601', customer: '黄先生', city: '北京·海淀', size: '200m² 复式',
    budget: '¥100k–¥150k', source: '社交媒体', desc: '高科技爱好者，想要极致自动化体验 + HomeKit 全屋集成。',
    matchScore: 78, postedAt: '3 天前', status: 'contacted', stage: 'meeting_scheduled',
    tags: ['极客', 'HomeKit'], responseHours: 30, responseSla: 48,
    email: 'huang@geek.com',
    notes: [
      { id: 'n6', text: '技术型客户，需要准备详细的自动化架构文档', author: 'Jun (A)', createdAt: '3 天前' },
    ],
    tasks: [
      { id: 't8', title: '准备 HomeKit 集成方案文档', done: false, due: '2026-05-13', owner: 'Jun (A)', priority: 'high' },
    ],
    files: [
      { name: '黄先生需求笔记.md', size: '8 KB', kind: 'json', tag: 'planning', uploadedAt: '2026-05-07' },
    ],
    activities: [
      { id: 'a13', type: 'email', text: '发送初步方案思路邮件', author: 'Jun (A)', timestamp: '2 天前' },
      { id: 'a14', type: 'note', text: '客户回复邮件，补充了 HomeKit 设备清单', author: 'Jun (A)', timestamp: '1 天前' },
    ],
  },
  {
    id: 'L-2026050501', customer: 'A. Schmidt', city: 'München · DE', size: '双层别墅 · 庭院',
    budget: '€7.5k–€10k', source: 'EU Builder Network', desc: '室外灯光 + 自动浇灌 + 安防一体化。',
    matchScore: 95, postedAt: '4 天前', status: 'won', stage: 'won', orderId: 'ORD-EU-1009', acceptedAt: '2026-05-09',
    tags: ['庭院', '跨境'],
    email: 'schmidt@example.de', phone: '+49 89 *******',
    notes: [
      { id: 'n7', text: '跨境项目，注意 GDPR 合规和欧盟设备认证', author: 'Jun (A)', createdAt: '4 天前', pinned: true },
      { id: 'n8', text: '客户偏好本地化控制，不要云端依赖', author: 'Jun (A)', createdAt: '3 天前' },
    ],
    tasks: [
      { id: 't9', title: '确认欧盟设备认证清单', done: true, due: '2026-05-10', owner: 'Jun (A)', priority: 'high' },
      { id: 't10', title: '准备庭院方案设计', done: true, due: '2026-05-11', owner: 'Jun (A)', priority: 'high' },
      { id: 't11', title: '安排施工团队确认排期', done: false, due: '2026-05-15', owner: 'Jun (A)', priority: 'high' },
    ],
    files: [
      { name: '庭院测量图.dwg', size: '5.2 MB', kind: 'dwg', tag: 'planning', uploadedAt: '2026-05-09' },
      { name: 'EU合规检查表.pdf', size: '320 KB', kind: 'pdf', tag: 'planning', uploadedAt: '2026-05-09' },
    ],
    activities: [
      { id: 'a15', type: 'status_change', text: '线索成交 — Won', author: '系统', timestamp: '4 天前' },
      { id: 'a16', type: 'call', text: '视频通话 45 分钟确认庭院方案细节', author: 'Jun (A)', timestamp: '3 天前' },
      { id: 'a17', type: 'task_added', text: '创建施工排期确认任务', author: 'Jun (A)', timestamp: '2 天前' },
    ],
  },
  {
    id: 'L-2026050402', customer: '张奶奶女儿', city: '北京·朝阳', size: '90m² 两室',
    budget: '¥8k', source: '社区话题转介', desc: '起夜防跌 + 紧急呼叫，希望快速交付。',
    matchScore: 98, postedAt: '5 天前', status: 'won', stage: 'won', orderId: 'ORD-CN-1024', acceptedAt: '2026-05-08',
    tags: ['适老化'],
    phone: '185****4321',
    notes: [
      { id: 'n9', text: '标准适老化方案，可快速交付', author: 'Jun (A)', createdAt: '5 天前' },
    ],
    tasks: [
      { id: 't12', title: '设备采购下单', done: true, due: '2026-05-09', owner: 'Jun (A)', priority: 'high' },
      { id: 't13', title: '安排安装日期', done: false, due: '2026-05-14', owner: 'Jun (A)', priority: 'high' },
    ],
    files: [
      { name: '张奶奶家户型图.pdf', size: '1.8 MB', kind: 'pdf', tag: 'planning', uploadedAt: '2026-05-06' },
    ],
    activities: [
      { id: 'a18', type: 'status_change', text: '成交 — 社区话题转介高匹配度线索', author: '系统', timestamp: '5 天前' },
      { id: 'a19', type: 'note', text: '设备清单已确认，进入采购流程', author: 'Jun (A)', timestamp: '3 天前' },
    ],
    floorPlans: [
      { id: 'fp-3', name: '张奶奶家点位图', thumbnailPattern: 'cross', rooms: 5, devices: 12, createdAt: '2026-05-06', updatedAt: '2026-05-07', status: 'finalized' },
    ],
  },
  {
    id: 'L-2026050301', customer: '刘先生', city: '上海·杨浦', size: '100m² 两室',
    budget: '¥20k–¥30k', source: '门店转介', desc: '想做智能灯光，但预算有限，最终选择了 DIY 方案。',
    matchScore: 72, postedAt: '2 周前', status: 'lost', stage: 'lost', managedStage: 'Budget Rejected',
    tags: ['预算不足'],
    activities: [
      { id: 'a20', type: 'status_change', text: '线索关闭 — 客户选择 DIY', author: '系统', timestamp: '2 周前' },
      { id: 'a21', type: 'note', text: '跟进 3 次未果，预算差距较大', author: 'Jun (A)', timestamp: '2 周前' },
    ],
  },
  {
    id: 'L-2026042801', customer: '高先生', city: '南京·鼓楼', size: '150m² 三室',
    budget: '¥60k–¥80k', source: '官网表单', desc: '看了竞品方案后决定暂时不做，等明年新房装修再考虑。',
    matchScore: 65, postedAt: '3 周前', status: 'lost', stage: 'lost', managedStage: 'Timing',
    tags: ['观望中'],
    activities: [
      { id: 'a22', type: 'status_change', text: '线索关闭 — 客户观望', author: '系统', timestamp: '3 周前' },
      { id: 'a23', type: 'note', text: '可设置 6 个月后自动回访提醒', author: 'Jun (A)', timestamp: '3 周前' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────

export function getLead(id: string): Lead | undefined {
  return CARDS.find(l => l.id === id);
}

export function getLeadsByStatus(status: LeadStatus): Lead[] {
  return CARDS.filter(l => l.status === status);
}

export function getActiveLeads(): Lead[] {
  return CARDS.filter(l => ACTIVE_STATUSES.includes(l.status as LeadStatus));
}
