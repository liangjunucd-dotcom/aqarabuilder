export type DeviceType =
  | 'sensor-motion'
  | 'sensor-door'
  | 'sensor-th'
  | 'sensor-fall'
  | 'switch-h1'
  | 'switch-panel'
  | 'light-led'
  | 'light-night'
  | 'curtain-motor'
  | 'lock-smart'
  | 'camera-g5'
  | 'plug-smart'
  | 'gateway-hub'
  | 'studio-host'
  | 'speaker'
  | 'emergency-btn';

export interface CanvasDevice {
  id: string;
  type: DeviceType;
  label: string;
  x: number; // 0-100 (% of viewBox W)
  y: number; // 0-100 (% of viewBox H)
  room: string;
  protocol: 'Zigbee 3.0' | 'Thread' | 'Matter' | 'Wi-Fi' | 'Aqara LAN' | 'Bluetooth';
  power: 'Battery' | 'Wired' | '电池+市电';
  batteryPct?: number;
  status: 'online' | 'offline' | 'low-battery';
  bindPersona?: string[];
  rssi?: number; // -dB
  coverageRadius?: number;
}

export interface CanvasScene {
  id: string;
  time: string;
  label: string;
  desc: string;
  personaActive: string[];
  personaPositions: Record<string, { x: number; y: number; intensity: number }>;
  deviceStates: Record<string, 'on' | 'off' | 'dim' | 'alert' | 'idle'>;
  emoji: string;
}

// 李先生家 户型 (rooms 模式) — 28 设备
export const LI_DEVICES: CanvasDevice[] = [
  // 入户 + 公共
  { id: 'd-01', type: 'studio-host', label: 'Aqara Studio (主机)', x: 50, y: 75, room: '客厅', protocol: 'Aqara LAN', power: 'Wired', status: 'online' },
  { id: 'd-02', type: 'gateway-hub', label: 'Hub E1 (Zigbee 网关)', x: 55, y: 70, room: '客厅', protocol: 'Wi-Fi', power: 'Wired', status: 'online' },
  { id: 'd-03', type: 'lock-smart', label: '智能门锁 N200', x: 12, y: 56, room: '入户', protocol: 'Aqara LAN', power: 'Battery', batteryPct: 84, status: 'online' },
  { id: 'd-04', type: 'sensor-door', label: '入户门窗传感器', x: 14, y: 52, room: '入户', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 91, status: 'online' },
  { id: 'd-05', type: 'speaker', label: '客厅音箱 V2', x: 60, y: 78, room: '客厅', protocol: 'Wi-Fi', power: 'Wired', status: 'online' },
  { id: 'd-06', type: 'camera-g5', label: '客厅摄像头 G5', x: 75, y: 70, room: '客厅', protocol: 'Wi-Fi', power: 'Wired', status: 'online' },

  // 主卧 (左上区)
  { id: 'd-07', type: 'sensor-motion', label: '主卧人体传感器', x: 30, y: 25, room: '主卧', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 67, status: 'online', coverageRadius: 12 },
  { id: 'd-08', type: 'sensor-th', label: '主卧温湿度', x: 22, y: 35, room: '主卧', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 78, status: 'online' },
  { id: 'd-09', type: 'switch-h1', label: '主卧开关 H1', x: 38, y: 30, room: '主卧', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },
  { id: 'd-10', type: 'curtain-motor', label: '主卧窗帘电机', x: 14, y: 22, room: '主卧', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },
  { id: 'd-11', type: 'light-led', label: '主卧主灯', x: 35, y: 35, room: '主卧', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },

  // 客厅 (右上)
  { id: 'd-12', type: 'sensor-motion', label: '客厅人体', x: 65, y: 30, room: '客厅', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 88, status: 'online', coverageRadius: 14 },
  { id: 'd-13', type: 'switch-panel', label: '客厅 6 键面板', x: 78, y: 28, room: '客厅', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },
  { id: 'd-14', type: 'curtain-motor', label: '客厅大窗电机', x: 90, y: 25, room: '客厅', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },
  { id: 'd-15', type: 'light-led', label: '客厅吊灯', x: 70, y: 38, room: '客厅', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },

  // 老人房 (左下)
  { id: 'd-16', type: 'sensor-motion', label: '老人房人体', x: 25, y: 80, room: '老人房', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 18, status: 'low-battery', coverageRadius: 12, bindPersona: ['p-elder'] },
  { id: 'd-17', type: 'sensor-fall', label: '雷达防跌倒 FP2', x: 35, y: 85, room: '老人房', protocol: 'Wi-Fi', power: 'Wired', status: 'online', bindPersona: ['p-elder'] },
  { id: 'd-18', type: 'light-night', label: '床下夜灯', x: 18, y: 85, room: '老人房', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online', bindPersona: ['p-elder'] },
  { id: 'd-19', type: 'emergency-btn', label: '紧急呼叫按钮', x: 22, y: 92, room: '老人房', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 95, status: 'online', bindPersona: ['p-elder'] },
  { id: 'd-20', type: 'switch-h1', label: '老人房开关', x: 38, y: 92, room: '老人房', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },

  // 儿童房 (中下)
  { id: 'd-21', type: 'sensor-motion', label: '儿童房人体', x: 55, y: 82, room: '儿童房', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 72, status: 'online', coverageRadius: 11 },
  { id: 'd-22', type: 'sensor-th', label: '儿童房温湿度', x: 50, y: 90, room: '儿童房', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 64, status: 'online' },
  { id: 'd-23', type: 'light-led', label: '儿童房主灯', x: 60, y: 88, room: '儿童房', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },

  // 厨房 (右下)
  { id: 'd-24', type: 'sensor-th', label: '厨房温湿度 + 烟感', x: 82, y: 82, room: '厨房', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 81, status: 'online' },
  { id: 'd-25', type: 'plug-smart', label: '智能插座 (烤箱)', x: 90, y: 88, room: '厨房', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },
  { id: 'd-26', type: 'switch-panel', label: '厨房 4 键面板', x: 75, y: 90, room: '厨房', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },

  // 卫生间 / 走廊
  { id: 'd-27', type: 'sensor-motion', label: '卫生间人体', x: 88, y: 55, room: '卫生间', protocol: 'Zigbee 3.0', power: 'Battery', batteryPct: 56, status: 'online', coverageRadius: 8 },
  { id: 'd-28', type: 'light-night', label: '走廊夜灯', x: 50, y: 55, room: '走廊', protocol: 'Zigbee 3.0', power: 'Wired', status: 'online' },
];

export const LI_PERSONAS = [
  { id: 'p-host', label: '李先生 · 家主', emoji: '👨', color: '#6366f1' },
  { id: 'p-wife', label: '李太太 · 家主', emoji: '👩', color: '#ec4899' },
  { id: 'p-elder', label: '老父 · 同住', emoji: '👴', color: '#f59e0b' },
  { id: 'p-child', label: '小孩 · 8 岁', emoji: '🧒', color: '#06b6d4' },
];

export const LI_SCENES: CanvasScene[] = [
  {
    id: 'scene-elder-night',
    time: '02:30',
    label: '老父起夜',
    desc: '雷达检测下床 → 走廊夜灯渐亮 (10%) → 卫生间镜前灯打开 → 防跌倒待命',
    personaActive: ['p-elder'],
    personaPositions: {
      'p-elder': { x: 25, y: 85, intensity: 0.9 },
    },
    deviceStates: {
      'd-17': 'alert',
      'd-18': 'dim',
      'd-28': 'dim',
      'd-27': 'on',
      'd-11': 'off',
      'd-15': 'off',
      'd-23': 'off',
    },
    emoji: '🌙',
  },
  {
    id: 'scene-morning',
    time: '06:30',
    label: '主人晨起',
    desc: '主卧雷达检测起床 → 窗帘自动开 30% → 厨房咖啡机预热 → 客厅 News 播报',
    personaActive: ['p-host', 'p-wife'],
    personaPositions: {
      'p-host': { x: 30, y: 28, intensity: 0.8 },
      'p-wife': { x: 32, y: 32, intensity: 0.6 },
    },
    deviceStates: {
      'd-10': 'on',
      'd-11': 'on',
      'd-15': 'dim',
      'd-25': 'on',
      'd-05': 'on',
    },
    emoji: '☀️',
  },
  {
    id: 'scene-afterschool',
    time: '15:30',
    label: '小孩放学',
    desc: '门锁识别小孩指纹 → 客厅灯打开 → 摄像头静音录像 → 推送家长',
    personaActive: ['p-child'],
    personaPositions: {
      'p-child': { x: 18, y: 55, intensity: 0.9 },
    },
    deviceStates: {
      'd-03': 'alert',
      'd-04': 'on',
      'd-15': 'on',
      'd-06': 'on',
    },
    emoji: '🎒',
  },
  {
    id: 'scene-gathering',
    time: '19:00',
    label: '欢聚晚餐',
    desc: '客厅暖光 + 音乐 → 厨房辅助灯全开 → 摄像头进入隐私模式 → 老人房 / 儿童房保留独立场景',
    personaActive: ['p-host', 'p-wife', 'p-elder', 'p-child'],
    personaPositions: {
      'p-host': { x: 65, y: 78, intensity: 0.6 },
      'p-wife': { x: 82, y: 85, intensity: 0.6 },
      'p-elder': { x: 70, y: 75, intensity: 0.5 },
      'p-child': { x: 60, y: 78, intensity: 0.7 },
    },
    deviceStates: {
      'd-15': 'dim',
      'd-23': 'on',
      'd-26': 'on',
      'd-25': 'on',
      'd-05': 'on',
      'd-06': 'off',
      'd-11': 'on',
    },
    emoji: '🍽',
  },
  {
    id: 'scene-night-watch',
    time: '23:30',
    label: '夜间安防',
    desc: '门窗 / 烟感全程值守 → 雷达检测异常活动 → 通知主人手机 → 摄像头本地录像',
    personaActive: ['p-elder'],
    personaPositions: {
      'p-elder': { x: 25, y: 78, intensity: 0.5 },
    },
    deviceStates: {
      'd-04': 'on',
      'd-06': 'on',
      'd-12': 'on',
      'd-17': 'on',
      'd-24': 'on',
      'd-11': 'off',
      'd-15': 'off',
      'd-23': 'off',
    },
    emoji: '🛡',
  },
];

export const TYPE_META: Record<DeviceType, { emoji: string; color: string; family: string }> = {
  'sensor-motion': { emoji: '◉', color: '#6366f1', family: '传感' },
  'sensor-door': { emoji: '⚏', color: '#6366f1', family: '传感' },
  'sensor-th': { emoji: '🌡', color: '#06b6d4', family: '传感' },
  'sensor-fall': { emoji: '⚡', color: '#ef4444', family: '安防' },
  'switch-h1': { emoji: '◐', color: '#a855f7', family: '控制' },
  'switch-panel': { emoji: '▦', color: '#a855f7', family: '控制' },
  'light-led': { emoji: '☀', color: '#f59e0b', family: '照明' },
  'light-night': { emoji: '✦', color: '#f59e0b', family: '照明' },
  'curtain-motor': { emoji: '∥', color: '#10b981', family: '电机' },
  'lock-smart': { emoji: '🔒', color: '#ec4899', family: '安防' },
  'camera-g5': { emoji: '◎', color: '#ef4444', family: '安防' },
  'plug-smart': { emoji: '⏚', color: '#64748b', family: '插座' },
  'gateway-hub': { emoji: '◇', color: '#06b6d4', family: '中枢' },
  'studio-host': { emoji: '✦', color: '#a855f7', family: '中枢' },
  'speaker': { emoji: '◍', color: '#06b6d4', family: '影音' },
  'emergency-btn': { emoji: '!', color: '#ef4444', family: '安防' },
};
