/** 客户原始需求与 AI 提炼画像 — 留存于项目方案包，IDE 方案摘要可查阅 */

export interface CustomerBriefAttachment {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  url: string;
  caption?: string;
}

export interface CustomerBrief {
  capturedAt: string;
  channel: 'email' | 'chat' | 'form';
  subject?: string;
  rawText: string;
  locale: string;
  persona: {
    household: string;
    theme?: string;
    platform?: string;
    goals: string[];
    constraints: string[];
  };
  homeFacts: {
    sizeSqm?: number;
    layout?: string;
    renovationNotes?: string[];
  };
  attachments: CustomerBriefAttachment[];
  aiSummary: string;
  sensorPlan: Array<{ area: string; sensors: string; rationale: string }>;
  automationFocus: string;
}

const BTO_INQUIRY_RAW = `Hi All,

I'm planning to build a smart home using Apple HomeKit and will likely go with Aqara products. I would appreciate advice on what Aqara devices—especially sensors—would be suitable for different areas of my home.

Based on my lighting and switch layout plan, appliances, and intended setup, here are my details:

Home Information:
New 4-room BTO (93 sqm)
Design theme: Creamy Minimalism
Household: 2 adults + 1 infant (<1 year old)

Renovation Notes:
2 common bedrooms will not be renovated (only aircon, ceiling fan with LED lights installed)
Yellow areas in the plan indicate false ceiling
Green areas indicate boxed-up aircon and master bathroom piping

I have attached my layout/lighting plan for reference.

Would love your recommendations on:
Suitable Aqara sensors (motion, door/window, presence, temperature, etc.) for each area
Any suggested automations for convenience, comfort, or energy efficiency

Automation Goal:
I want to achieve a reliable "lights on when people enter, lights off when they leave" setup (presence-based automation) without false triggers or delays.

Thanks in advance!`;

export const CUSTOMER_BRIEFS: Record<string, CustomerBrief> = {
  'proj-eu-villa': {
    capturedAt: '2026-05-18T09:42:00+08:00',
    channel: 'email',
    subject: '4-room BTO · HomeKit + presence lighting advice',
    locale: 'en',
    rawText: BTO_INQUIRY_RAW,
    persona: {
      household: '2 adults + 1 infant (<1 year)',
      theme: 'Creamy Minimalism',
      platform: 'Apple HomeKit · Aqara',
      goals: [
        'Reliable presence-based lighting (on enter / off leave)',
        'Per-area sensor recommendations',
        'Convenience, comfort & energy automations',
      ],
      constraints: [
        '2 common bedrooms: no renovation — only AC + ceiling fan LED',
        'False ceiling zones (yellow) · boxed AC/piping (green)',
        'No false triggers or noticeable delays on presence',
      ],
    },
    homeFacts: {
      sizeSqm: 93,
      layout: '4-room BTO (Living, Kitchen, MBR, 2× common BR, baths)',
      renovationNotes: [
        'Yellow = false ceiling (LED strip zones)',
        'Green = boxed-up AC + master bath piping',
        'Attached layout/lighting plan',
      ],
    },
    attachments: [
      {
        id: 'att-floorplan',
        name: 'layout-lighting-plan.png',
        type: 'image',
        url: '/images/customer-bto-floorplan.png',
        caption: '客户附：户型 + 灯光点位图（黄=吊顶 · 绿=包管）',
      },
    ],
    aiSummary:
      '年轻家庭新房（93㎡ BTO），主诉求是 HomeKit 生态下稳定的人体存在照明，兼顾婴儿房舒适与公共区域节能。方案应优先 FP2/人体存在类传感器覆盖动线，玄关/走廊/客厅采用「进入亮灯、离开延时关灯」；未改造次卧仅保留风扇灯控，避免过度施工。',
    sensorPlan: [
      { area: '玄关 / 走廊', sensors: 'FP2 + 门窗传感器', rationale: '入户动线 · 夜间低照度补光' },
      { area: '客厅 / 餐厅', sensors: 'FP2 + 无线开关', rationale: '主活动区存在检测 · 场景联动' },
      { area: '主卧', sensors: 'FP2 + 温湿度', rationale: '睡眠区 · 起夜低亮不扰婴儿' },
      { area: '厨房 / 客卫', sensors: '人体传感器', rationale: '短停留区域 · 快速亮灭' },
      { area: '未改造次卧', sensors: '仅保留风扇灯回路', rationale: '客户明确不翻新 — 最小化改造' },
    ],
    automationFocus: 'Presence-based lighting — enter on, leave off (debounced, no false triggers)',
  },
  'proj-lixs': {
    capturedAt: '2026-05-08T14:20:00+08:00',
    channel: 'form',
    subject: '李先生家 · 适老化 + 老父同住',
    locale: 'zh',
    rawText:
      '客户咨询：140㎡ 三室两卫，老父 72 岁同住。核心诉求是夜间起夜照明、跌倒风险区域补传感和紧急呼叫。希望尽量用 Aqara 设备，后续由服务商上门实施。已提供简单手绘动线图（微信图片）。',
    persona: {
      household: '夫妻 + 72 岁父亲',
      theme: '实用适老',
      platform: 'Aqara · 可接 HomeKit',
      goals: ['起夜走廊常亮', '卫生间/主卧紧急呼叫', '减少跌倒盲区'],
      constraints: ['父亲抗拒复杂 App', '部分区域已有传统灯具'],
    },
    homeFacts: { sizeSqm: 140, layout: '三室两卫' },
    attachments: [
      {
        id: 'att-sketch',
        name: 'hand-drawn-path.png',
        type: 'image',
        url: '/images/customer-bto-floorplan.png',
        caption: '客户微信：手绘夜间动线草图',
      },
    ],
    aiSummary:
      '三代同堂适老改造：动线照明 + 紧急网络是优先级，设备选型偏大号按键、低学习成本，Life App Persona 需「老人模式」。',
    sensorPlan: [
      { area: '走廊 / 卫生间', sensors: 'FP2 + 夜灯', rationale: '起夜动线' },
      { area: '主卧 / 主卫', sensors: 'SOS + 人体', rationale: '紧急呼叫' },
    ],
    automationFocus: '夜间起夜 → 走廊渐进亮灯；SOS 联动子女通知',
  },
};

export function getCustomerBriefForProject(projectId: string): CustomerBrief | null {
  return CUSTOMER_BRIEFS[projectId] ?? null;
}

/** 从项目记录解析客户需求档案（优先 customerBriefId） */
export function getProjectCustomerBrief(
  project: { id: string; customerBriefId?: string | null } | null | undefined
): CustomerBrief | null {
  if (!project) return null;
  return getCustomerBriefForProject(project.customerBriefId ?? project.id);
}
