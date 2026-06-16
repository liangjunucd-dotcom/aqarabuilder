// Aqara Builder — Virtual / Physical Device Mapping
//
// The design canvas shows devices because that is what designers, users, and
// installers can reason about. During deployment, each design device also carries
// capability tags so Studio devices with a different SKU can still be manually
// bound when their capabilities are compatible.
//
// Used by:
//   - Life App install page   (/life/projects/[id]/install)
//   - IDE project overview    (/pro/projects/[id]/overview)
//   - Design Platform             (/build)

// ─── Types ───────────────────────────────────────────────────────────────

export type InstallStatus = 'pending' | 'installed' | 'verified';

export interface PointMapPosition {
  /** Unique position ID — printed on the device label at the warehouse */
  positionId: string;
  room: string;
  slot: string;
  model: string;
  modelLabel: string;
  /** Position on floor plan (percentage) */
  x: number;
  y: number;
  /** Installation instructions */
  notes?: string;
  /** Installation status */
  status: InstallStatus;
  /** Device serial number (from QR scan) */
  scannedSerial?: string;
  /** Timestamp when installed */
  installedAt?: string;
  /** Photo URL of installed device */
  photoUrl?: string;
}

export interface InstallationChecklist {
  projectId: string;
  points: PointMapPosition[];
}

export interface ChecklistSummary {
  pending: number;
  installed: number;
  verified: number;
  total: number;
}

// ─── Mock Data — Standardized Point Map ──────────────────────────────────

export const MOCK_POINT_MAP: PointMapPosition[] = [
  { positionId: 'LIV-SW-01', room: '客厅', slot: '主灯开关',   model: 'WS-EUK02', modelLabel: '智能开关',   x: 68, y: 31, notes: '离地 120cm，替换原有开关', status: 'pending' },
  { positionId: 'LIV-SW-02', room: '客厅', slot: '射灯开关',   model: 'WS-EUK02', modelLabel: '智能开关',   x: 83, y: 41, notes: '离地 120cm', status: 'pending' },
  { positionId: 'LIV-CM-01', room: '客厅', slot: '窗帘电机',   model: 'CM-EU01',  modelLabel: '窗帘电机',   x: 80, y: 18, notes: '需预留插座', status: 'pending' },
  { positionId: 'LIV-TS-01', room: '客厅', slot: '温度传感器', model: 'TS-S01',   modelLabel: '温度传感器', x: 73, y: 48, notes: '避开阳光直射', status: 'pending' },
  { positionId: 'LIV-AL-01', room: '客厅', slot: '蜂鸣报警',   model: 'BHFC-01',  modelLabel: '蜂鸣报警器', x: 78, y: 52, status: 'pending' },
  { positionId: 'BED-SW-01', room: '主卧', slot: '主灯开关',   model: 'WS-EUK02', modelLabel: '智能开关',   x: 28, y: 33, notes: '离地 120cm', status: 'pending' },
  { positionId: 'BED-MS-01', room: '主卧', slot: '人体传感器', model: 'MS-S02',   modelLabel: '人体传感器', x: 36, y: 45, notes: '覆盖床区和门口', status: 'pending' },
  { positionId: 'BED2-SW-01',room: '次卧', slot: '主灯开关',   model: 'WS-EUK02', modelLabel: '智能开关',   x: 55, y: 70, notes: '离地 120cm', status: 'pending' },
  { positionId: 'BED2-MS-01',room: '次卧', slot: '人体传感器', model: 'MS-S02',   modelLabel: '人体传感器', x: 48, y: 62, status: 'pending' },
  { positionId: 'KIT-TS-01', room: '厨房', slot: '温度传感器', model: 'TS-S01',   modelLabel: '温度传感器', x: 75, y: 68, notes: '远离灶台', status: 'pending' },
  { positionId: 'KIT-GS-01', room: '厨房', slot: '燃气报警',   model: 'GS-EU01',  modelLabel: '燃气报警器', x: 82, y: 72, notes: '距燃气灶 1.5m 内', status: 'pending' },
  { positionId: 'COR-MS-01', room: '走廊', slot: '人体传感器', model: 'MS-S02',   modelLabel: '人体传感器', x: 53, y: 55, status: 'pending' },
  { positionId: 'ENT-DW-01', room: '入户', slot: '门窗传感器', model: 'DW-S02',   modelLabel: '门窗传感器', x: 49, y: 83, status: 'pending' },
  { positionId: 'BTH-SOS-01',room: '主卫', slot: 'SOS按钮',    model: 'SOS-EU01', modelLabel: 'SOS按钮',    x: 64, y: 80, notes: '马桶旁，离地 60cm', status: 'pending' },
];

export const ROOM_ORDER = ['入户', '客厅', '走廊', '主卧', '次卧', '厨房', '主卫'];

// ─── BOM — Bill of Materials (from point map) ───────────────────────────

export interface BOMItem {
  sku: string;
  modelLabel: string;
  quantity: number;
  positions: string[];
}

export function generateBOM(points: PointMapPosition[]): BOMItem[] {
  const map = new Map<string, { modelLabel: string; positions: string[] }>();
  for (const p of points) {
    if (!map.has(p.model)) {
      map.set(p.model, { modelLabel: p.modelLabel, positions: [] });
    }
    map.get(p.model)!.positions.push(p.positionId);
  }
  return Array.from(map.entries()).map(([sku, info]) => ({
    sku,
    modelLabel: info.modelLabel,
    quantity: info.positions.length,
    positions: info.positions,
  }));
}

// ─── Summary ────────────────────────────────────────────────────────────

export function computeChecklistSummary(points: PointMapPosition[]): ChecklistSummary {
  return {
    pending: points.filter(p => p.status === 'pending').length,
    installed: points.filter(p => p.status === 'installed').length,
    verified: points.filter(p => p.status === 'verified').length,
    total: points.length,
  };
}

// ─── Project Lifecycle ──────────────────────────────────────────────────

export type ProjectPhase =
  | 'discover'
  | 'design'
  | 'procurement'
  | 'installation'
  | 'deployment'
  | 'diagnostics'
  | 'completed';

export const PHASE_LABEL: Record<ProjectPhase, string> = {
  discover: '需求匹配',
  design: '方案设计',
  procurement: '采购发货',
  installation: '上门安装',
  deployment: '远程部署',
  diagnostics: '运行诊断',
  completed: '已交付',
};

export const PHASE_ORDER: ProjectPhase[] = [
  'discover', 'design', 'procurement', 'installation', 'deployment', 'diagnostics', 'completed',
];

export function phaseIndex(phase: ProjectPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

// ─── Backward-compat re-exports (for legacy usage) ──────────────────────

import type { LucideIcon } from 'lucide-react';
import { Lightbulb, Volume2, Target, Activity, Eye, Shuffle } from 'lucide-react';

export type FeedbackKind = 'light' | 'beep' | 'key' | 'led' | 'sensor' | 'motor';
export type Confidence = 'high' | 'medium' | 'manual';
export type PointStatus = 'pending' | 'confirmed';

export interface PlanPoint {
  pointCode: string;
  room: string;
  slot: string;
  model: string;
  modelLabel: string;
  x: number;
  y: number;
  feedback: FeedbackKind;
  matchedDid?: string;
  matchedModel?: string;
  matchedRssi?: number;
  matchScore?: number;
  matchReasons?: string[];
  matchIssues?: string[];
  semanticTags?: string[];
  capabilities?: string[];
  spacePath?: string;
  confidence: Confidence;
  status: PointStatus;
  feedbackActive?: boolean;
}

export interface StudioDevice {
  id: string;
  did: string;
  model: string;
  modelLabel: string;
  rssi: number;
  online: boolean;
  name?: string;
  roomHint?: string;
  semanticTags?: string[];
  capabilities?: string[];
  lastEvent?: string;
  temporarySpaceId?: string;
  pairedTo?: string;
}

export interface MappingSummary {
  high: number;
  medium: number;
  manual: number;
  total: number;
  confirmed: number;
}

export const MOCK_PLAN_POINTS: PlanPoint[] = [
  { pointCode: 'L-01', room: '客厅', slot: '主灯开关',   model: 'WS-EUK02', modelLabel: '智能开关',   x: 68, y: 31, feedback: 'light',  confidence: 'high',   status: 'pending' },
  { pointCode: 'L-02', room: '客厅', slot: '射灯开关',   model: 'WS-EUK02', modelLabel: '智能开关',   x: 83, y: 41, feedback: 'light',  confidence: 'medium', status: 'pending' },
  { pointCode: 'L-03', room: '客厅', slot: '窗帘电机',   model: 'CM-EU01',  modelLabel: '窗帘电机',   x: 80, y: 18, feedback: 'motor',  confidence: 'high',   status: 'pending' },
  { pointCode: 'L-04', room: '客厅', slot: '温度传感器', model: 'TS-S01',   modelLabel: '温度传感器', x: 73, y: 48, feedback: 'led',    confidence: 'high',   status: 'pending' },
  { pointCode: 'B-01', room: '主卧', slot: '主灯开关',   model: 'WS-EUK02', modelLabel: '智能开关',   x: 28, y: 33, feedback: 'light',  confidence: 'medium', status: 'pending' },
  { pointCode: 'B-02', room: '主卧', slot: '人体传感器', model: 'MS-S02',   modelLabel: '人体传感器', x: 36, y: 45, feedback: 'sensor', confidence: 'high',   status: 'pending' },
  { pointCode: 'C-01', room: '次卧', slot: '主灯开关',   model: 'WS-EUK02', modelLabel: '智能开关',   x: 55, y: 70, feedback: 'light',  confidence: 'medium', status: 'pending' },
  { pointCode: 'C-02', room: '次卧', slot: '人体传感器', model: 'MS-S02',   modelLabel: '人体传感器', x: 48, y: 62, feedback: 'sensor', confidence: 'high',   status: 'pending' },
  { pointCode: 'K-01', room: '厨房', slot: '温度传感器', model: 'TS-S01',   modelLabel: '温度传感器', x: 75, y: 68, feedback: 'led',    confidence: 'high',   status: 'pending' },
  { pointCode: 'K-02', room: '厨房', slot: '燃气报警',   model: 'GS-EU01',  modelLabel: '燃气报警器', x: 82, y: 72, feedback: 'beep',   confidence: 'high',   status: 'pending' },
  { pointCode: 'H-01', room: '走廊', slot: '人体传感器', model: 'MS-S02',   modelLabel: '人体传感器', x: 53, y: 55, feedback: 'sensor', confidence: 'high',   status: 'pending' },
  { pointCode: 'D-01', room: '入户', slot: '门窗传感器', model: 'DW-S02',   modelLabel: '门窗传感器', x: 49, y: 83, feedback: 'led',    confidence: 'high',   status: 'pending' },
  { pointCode: 'S-01', room: '主卫', slot: 'SOS按钮',    model: 'SOS-EU01', modelLabel: 'SOS按钮',    x: 64, y: 80, feedback: 'key',    confidence: 'high',   status: 'pending' },
  { pointCode: 'A-01', room: '客厅', slot: '蜂鸣报警',   model: 'BHFC-01',  modelLabel: '蜂鸣报警器', x: 78, y: 52, feedback: 'beep',   confidence: 'high',   status: 'pending' },
];

export const MOCK_STUDIO_DEVICES: StudioDevice[] = [
  { id: 'sd1', did: 'lumi.switch.4caf0001', name: '客厅主灯开关', roomHint: '客厅', model: 'WS-EUK02', modelLabel: '智能开关', rssi: -38, online: true, capabilities: ['switch', 'light'], semanticTags: ['equip', 'cmd', 'switch', 'light', 'room:living'], lastEvent: '按键 1 路触发', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd2', did: 'lumi.switch.4caf0002', name: '客厅射灯开关', roomHint: '客厅', model: 'WS-EUK02', modelLabel: '智能开关', rssi: -45, online: true, capabilities: ['switch', 'light'], semanticTags: ['equip', 'cmd', 'switch', 'light', 'room:living'], lastEvent: '按键 2 路触发', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd3', did: 'lumi.switch.4caf0003', name: '主卧主灯开关', roomHint: '主卧', model: 'WS-EUK02', modelLabel: '智能开关', rssi: -52, online: true, capabilities: ['switch', 'light'], semanticTags: ['equip', 'cmd', 'switch', 'light', 'room:master-bed'], lastEvent: '按键 1 路触发', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd4', did: 'lumi.switch.4caf0004', name: '次卧主灯开关', roomHint: '次卧', model: 'WS-EUK02', modelLabel: '智能开关', rssi: -60, online: true, capabilities: ['switch', 'light'], semanticTags: ['equip', 'cmd', 'switch', 'light', 'room:kid-bed'], lastEvent: '按键 1 路触发', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd5', did: 'lumi.sensor.4caf0005', name: '主卧人体传感器', roomHint: '主卧', model: 'MS-S02', modelLabel: '人体传感器', rssi: -41, online: true, capabilities: ['presence', 'motion'], semanticTags: ['point', 'sensor', 'presence', 'room:master-bed'], lastEvent: '有人移动', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd6', did: 'lumi.sensor.4caf0006', name: '次卧人体传感器', roomHint: '次卧', model: 'MS-S02', modelLabel: '人体传感器', rssi: -50, online: true, capabilities: ['presence', 'motion'], semanticTags: ['point', 'sensor', 'presence', 'room:kid-bed'], lastEvent: '有人移动', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd7', did: 'lumi.sensor.4caf0007', name: '走廊人体传感器', roomHint: '走廊', model: 'MS-S02', modelLabel: '人体传感器', rssi: -58, online: true, capabilities: ['presence', 'motion'], semanticTags: ['point', 'sensor', 'presence', 'room:hallway'], lastEvent: '有人移动', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd8', did: 'lumi.sensor.4caf0008', name: '入户门窗传感器', roomHint: '入户', model: 'DW-S02', modelLabel: '门窗传感器', rssi: -36, online: true, capabilities: ['contact', 'security'], semanticTags: ['point', 'sensor', 'contact', 'door', 'room:entry'], lastEvent: '开合触发', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd9', did: 'lumi.sensor.4caf0009', name: '客厅温度传感器', roomHint: '客厅', model: 'TS-S01', modelLabel: '温度传感器', rssi: -42, online: true, capabilities: ['temp', 'humidity'], semanticTags: ['point', 'sensor', 'temp', 'air', 'room:living'], lastEvent: '温度上报', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd10', did: 'lumi.sensor.4caf0010', name: '厨房温度传感器', roomHint: '厨房', model: 'TS-S01', modelLabel: '温度传感器', rssi: -55, online: true, capabilities: ['temp', 'humidity'], semanticTags: ['point', 'sensor', 'temp', 'air', 'room:kitchen'], lastEvent: '温度上报', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd11', did: 'lumi.curtain.4caf0011', name: '客厅窗帘电机', roomHint: '客厅', model: 'CM-EU01', modelLabel: '窗帘电机', rssi: -40, online: true, capabilities: ['curtain', 'motor'], semanticTags: ['equip', 'cmd', 'curtain', 'motor', 'room:living'], lastEvent: '电机微动', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd12', did: 'lumi.safety.4caf0012', name: '厨房燃气报警器', roomHint: '厨房', model: 'GS-EU01', modelLabel: '燃气报警器', rssi: -48, online: true, capabilities: ['gas', 'alarm'], semanticTags: ['point', 'sensor', 'gas', 'alarm', 'room:kitchen'], lastEvent: '蜂鸣测试', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd13', did: 'lumi.safety.4caf0013', name: '主卫 SOS 按钮', roomHint: '主卫', model: 'SOS-EU01', modelLabel: 'SOS按钮', rssi: -47, online: true, capabilities: ['sos', 'button'], semanticTags: ['point', 'cmd', 'sos', 'button', 'room:bath'], lastEvent: '按钮触发', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd14', did: 'lumi.alarm.4caf0014', name: '客厅蜂鸣报警器', roomHint: '客厅', model: 'BHFC-01', modelLabel: '蜂鸣报警器', rssi: -44, online: true, capabilities: ['beep', 'alarm'], semanticTags: ['equip', 'cmd', 'beep', 'alarm', 'room:living'], lastEvent: '蜂鸣测试', temporarySpaceId: 'tmp-lixs-2406' },
  { id: 'sd15', did: 'lumi.switch.4caf0015', name: '备用智能开关', roomHint: '客厅', model: 'WS-EUK03', modelLabel: '智能开关 Pro', rssi: -43, online: true, capabilities: ['switch', 'light'], semanticTags: ['equip', 'cmd', 'switch', 'light', 'room:living'], lastEvent: '按键测试', temporarySpaceId: 'tmp-lixs-2406' },
];

export const FB_LABEL: Record<FeedbackKind, string> = {
  light:  '闪灯', beep: '蜂鸣', key: '按键', led: '指示灯', sensor: '挥手指', motor: '微动',
};

export const FB_DESC: Record<FeedbackKind, string> = {
  light:  '灯会闪烁 3 次', beep: '设备会发出蜂鸣声', key: '设备指示灯会亮',
  led:    '指示灯会闪烁', sensor: '靠近挥挥手，触发传感', motor: '窗帘会微动一下',
};

export const FB_ICON: Record<FeedbackKind, LucideIcon> = {
  light: Lightbulb, beep: Volume2, key: Target, led: Activity, sensor: Eye, motor: Shuffle,
};

export const CONFIDENCE_CFG: Record<Confidence, { label: string; color: string; bg: string; border: string }> = {
  high:   { label: '自动匹配', color: '#10b981', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/30' },
  medium: { label: '待验证', color: '#f59e0b', bg: 'bg-amber-500/10',    border: 'border-amber-500/30' },
  manual: { label: '需人工', color: '#ef4444', bg: 'bg-red-500/10',      border: 'border-red-500/30' },
};

const CAPABILITY_BY_MODEL: Record<string, string[]> = {
  'WS-EUK02': ['switch', 'light'],
  'WS-EUK03': ['switch', 'light'],
  'CM-EU01': ['curtain', 'motor'],
  'TS-S01': ['temp', 'humidity'],
  'MS-S02': ['presence', 'motion'],
  'DW-S02': ['contact', 'security'],
  'GS-EU01': ['gas', 'alarm'],
  'SOS-EU01': ['sos', 'button'],
  'BHFC-01': ['beep', 'alarm'],
};

const ROOM_TAG: Record<string, string> = {
  入户: 'room:entry',
  客厅: 'room:living',
  走廊: 'room:hallway',
  主卧: 'room:master-bed',
  次卧: 'room:kid-bed',
  厨房: 'room:kitchen',
  主卫: 'room:bath',
};

export function roomSemanticTag(room: string) {
  return ROOM_TAG[room] ?? `room:${room}`;
}

export function pointCapabilityTags(point: PlanPoint): string[] {
  return point.capabilities ?? CAPABILITY_BY_MODEL[point.model] ?? [point.modelLabel];
}

export function pointSemanticTags(point: PlanPoint): string[] {
  return point.semanticTags ?? [
    'designDevice',
    roomSemanticTag(point.room),
    point.model,
    point.modelLabel,
    ...pointCapabilityTags(point),
  ];
}

export function pointSpacePath(point: PlanPoint): string {
  return point.spacePath ?? `我的家 / 住宅 / 1F / ${point.room}`;
}

export function scoreDeviceForPoint(point: PlanPoint, device: StudioDevice) {
  const pointTags = new Set(pointSemanticTags(point));
  const deviceTags = new Set([
    ...(device.semanticTags ?? []),
    ...(device.capabilities ?? []),
    device.model,
    device.modelLabel,
    device.roomHint ? roomSemanticTag(device.roomHint) : '',
  ].filter(Boolean));
  const capabilityOverlap = pointCapabilityTags(point).filter(tag => (device.capabilities ?? []).includes(tag));
  const semanticOverlap = [...pointTags].filter(tag => deviceTags.has(tag));
  const reasons: string[] = [];
  const issues: string[] = [];
  let score = 0;

  if (device.model === point.model) {
    score += 36;
    reasons.push('型号一致');
  } else if (capabilityOverlap.length) {
    score += 18;
    reasons.push('能力兼容');
    issues.push('型号不同，需人工确认');
  } else {
    issues.push('型号与能力不一致');
  }

  if (device.roomHint === point.room) {
    score += 26;
    reasons.push('空间一致');
  } else if (device.name?.includes(point.room)) {
    score += 16;
    reasons.push('名称包含空间');
  } else if (device.roomHint) {
    issues.push(`疑似在${device.roomHint}`);
  }

  if (capabilityOverlap.length) {
    score += Math.min(20, capabilityOverlap.length * 10);
  }
  if (semanticOverlap.length) {
    score += Math.min(10, semanticOverlap.length * 2);
  }
  if (device.name && (device.name.includes(point.slot) || point.slot.includes(device.name.replace(point.room, '')))) {
    score += 8;
    reasons.push('名称接近');
  }
  if (device.online) score += 4;
  else issues.push('设备离线');
  if (device.rssi > -50) score += 4;

  return { score: Math.min(100, score), reasons, issues, capabilityOverlap };
}

export function autoMatch(points: PlanPoint[], devices: StudioDevice[]): PlanPoint[] {
  const used = new Set<string>();
  return points.map(point => {
    const unpaired = devices.filter(d => !used.has(d.id));
    const ranked = unpaired
      .map(device => ({ device, ...scoreDeviceForPoint(point, device) }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];

    if (!best || best.score < 42) {
      return {
        ...point,
        capabilities: pointCapabilityTags(point),
        semanticTags: pointSemanticTags(point),
        spacePath: pointSpacePath(point),
        matchScore: best?.score ?? 0,
        matchReasons: best?.reasons ?? [],
        matchIssues: ['未找到可自动绑定的 Studio 设备'],
        confidence: 'manual' as Confidence,
      };
    }

    const secondScore = ranked[1]?.score ?? 0;
    const ambiguous = best.score - secondScore < 8;
    const sameModel = best.device.model === point.model;
    const confidence: Confidence = best.score >= 78 && sameModel && !ambiguous
      ? 'high'
      : best.score >= 55
        ? 'medium'
        : 'manual';

    used.add(best.device.id);
    return {
      ...point,
      capabilities: pointCapabilityTags(point),
      semanticTags: pointSemanticTags(point),
      spacePath: pointSpacePath(point),
      matchedDid: best.device.did,
      matchedModel: best.device.model,
      matchedRssi: best.device.rssi,
      matchScore: best.score,
      matchReasons: best.reasons,
      matchIssues: ambiguous ? [...best.issues, '存在相近候选'] : best.issues,
      confidence,
    };
  });
}

export function confirmPointMapping(points: PlanPoint[], pointCode: string): PlanPoint[] {
  return points.map(point => point.pointCode === pointCode ? { ...point, status: 'confirmed' as const } : point);
}

export function confirmAllAutoMatched(points: PlanPoint[]): PlanPoint[] {
  return points.map(point => (
    point.confidence === 'high' && point.matchedDid
      ? { ...point, status: 'confirmed' as const }
      : point
  ));
}

export function assignStudioDeviceToPoint(points: PlanPoint[], devices: StudioDevice[], pointCode: string, deviceId: string): PlanPoint[] {
  const device = devices.find(item => item.id === deviceId);
  const point = points.find(item => item.pointCode === pointCode);
  if (!device || !point) return points;
  const scored = scoreDeviceForPoint(point, device);
  return points.map(item => item.pointCode === pointCode ? {
    ...item,
    matchedDid: device.did,
    matchedModel: device.model,
    matchedRssi: device.rssi,
    matchScore: scored.score,
    matchReasons: scored.reasons.length ? scored.reasons : ['人工指定'],
    matchIssues: scored.issues,
    confidence: scored.score >= 78 && device.model === item.model ? 'high' : 'medium',
  } : item);
}

export function clearPointAssignment(points: PlanPoint[], pointCode: string): PlanPoint[] {
  return points.map(point => point.pointCode === pointCode ? {
    ...point,
    matchedDid: undefined,
    matchedModel: undefined,
    matchedRssi: undefined,
    matchScore: undefined,
    matchReasons: [],
    matchIssues: ['等待现场重新绑定'],
    confidence: 'manual' as Confidence,
    status: 'pending' as PointStatus,
  } : point);
}

export function activatePointFeedback(points: PlanPoint[], pointCode: string, active: boolean): PlanPoint[] {
  return points.map(point => point.pointCode === pointCode ? { ...point, feedbackActive: active } : point);
}

export function deviceDisplayName(device?: StudioDevice) {
  if (!device) return '待绑定';
  return device.name ?? `${device.modelLabel} ${device.did.slice(-8)}`;
}

export function mappingReasonText(point: PlanPoint) {
  return point.matchReasons?.slice(0, 2).join(' · ') || '标签匹配';
}

export function mappingIssueText(point: PlanPoint) {
  return point.matchIssues?.[0] ?? (point.matchedDid ? '等待现场验证' : '需要人工绑定');
}

export function allPointsConfirmed(points: PlanPoint[]) {
  return points.length > 0 && points.every(point => point.status === 'confirmed');
}

export function deploymentAuditRows(points: PlanPoint[], devices: StudioDevice[]) {
  return points.map(point => {
    const device = devices.find(item => item.did === point.matchedDid);
    return {
      point,
      device,
      title: `${point.room} · ${point.slot}`,
      target: deviceDisplayName(device),
      status: point.status === 'confirmed' ? '已确认' : CONFIDENCE_CFG[point.confidence].label,
      reasons: [
        mappingReasonText(point),
        ...(point.matchIssues ?? []).slice(0, 1),
      ].filter(Boolean),
    };
  });
}

export function computeSummary(points: PlanPoint[]): MappingSummary {
  const high = points.filter(p => p.confidence === 'high' && p.status === 'pending').length;
  const medium = points.filter(p => p.confidence === 'medium' && p.status === 'pending').length;
  const manual = points.filter(p => p.confidence === 'manual' && p.status === 'pending').length;
  const confirmed = points.filter(p => p.status === 'confirmed').length;
  return { high, medium, manual, total: points.length, confirmed };
}
