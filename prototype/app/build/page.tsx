'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type CSSProperties, type DragEvent as ReactDragEvent, type MouseEvent, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import {
  AlignHorizontalSpaceAround,
  ArrowLeft,
  Bot,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  CircleDollarSign,
  Cpu,
  Download,
  DoorOpen,
  FilePlus2,
  FileCheck2,
  FolderOpen,
  Fullscreen,
  Home,
  Hand,
  Eye,
  Grid2X2,
  Image,
  Layers2,
  Layers3,
  Lightbulb,
  Link2,
  ListTree,
  Loader2,
  Maximize2,
  Minus,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  MoreVertical,
  MousePointer2,
  Pencil,
  Plus,
  Radar,
  Radio,
  Redo,
  RotateCcw,
  Save,
  Search,
  SendHorizontal,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Square,
  Share2,
  SlidersVertical,
  PersonStanding,
  Printer,
  Undo,
  UploadCloud,
  Trash2,
  User,
  Users,
  Wand2,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AqaraLogo, AqaraMark } from '@/components/brand/AqaraLogo';
import { cn } from '@/lib/utils';
import { createCubixProject, getProject, linkProjectToStudio, saveCubixLocalProject, type DesignStage, type Project } from '@/lib/mock/projects';
import { isBuilderRole, isProBuilderRole, useRole } from '@/lib/role';
import { SAMPLE_PERSONAL_POOL } from '@/lib/ai-pool';
import {
  SAMPLE_VISUALIZATION_ASSETS,
  SAMPLE_VISUALIZATION_BRIEF,
  outputTypeLabel,
  reviewStatusLabel,
  type GeneratedMediaAsset,
} from '@/lib/mock/visualization';
import {
  HEALTH_META,
  getFrontendWorkspaces,
  getProServiceWorkspaces,
  getStudiosForWorkspace,
  type Studio,
  type Workspace,
} from '@/lib/mock/studios';
import {
  MOCK_PLAN_POINTS,
  MOCK_STUDIO_DEVICES,
  allPointsConfirmed,
  autoMatch,
  deploymentAuditRows,
  mappingIssueText,
  type PlanPoint,
} from '@/lib/device-mapping';

type StageId = 'floor' | 'points' | 'logic' | 'visualize' | 'review' | 'deploy';
type SolutionModuleId = 'planning' | 'space' | 'scene' | 'confirm';
type ToolId = 'select' | 'pan' | 'comment' | 'walls' | 'room' | 'person' | 'devices' | 'coverage' | 'logic' | 'visualize' | 'agent';
type LayerId = 'walls' | 'furniture' | 'devices' | 'coverage' | 'links';
type WorkflowId = 'space' | 'persona' | 'visualization' | 'life';
type RenderJobState = 'idle' | 'queued' | 'rendering' | 'ready';
type OverlayMode = 'wifi' | 'cameras' | 'radar' | 'zigbee' | 'off';
type SpaceSetupState = 'guide' | 'landing' | 'uploading' | 'ready';
type FloorPlanMode = 'uploaded' | 'existing' | 'demo';
type DeviceCategory = 'hub' | 'sensor' | 'camera' | 'switch' | 'light' | 'curtain' | 'lock';
type PublishVisibility = 'public-remixable' | 'public-view-only' | 'private';
type DeploymentWorkflowStep = 'select' | 'mapping' | 'verify' | 'done';
type DeploymentLogTone = 'info' | 'success' | 'warn' | 'pending';

type DeploymentLogItem = {
  time: string;
  title: string;
  detail: string;
  tone: DeploymentLogTone;
};

type SpaceBuilding = {
  id: string;
  name: string;
  floors: string[];
  plannedFloors: string[];
};

type DevicePoint = {
  pointCode: string;
  name: string;
  model: string;
  type: 'hub' | 'presence' | 'camera' | 'switch' | 'sensor' | 'lock';
  room: string;
  x: number;
  y: number;
  status: 'owned' | 'suggested' | 'pending';
  did?: string;
  rssi?: number;
  channel?: string;
  power?: string;
  automations?: number;
  coverage?: string;
  note?: string;
  online?: boolean;
};

type AgentMessage = {
  role: 'agent' | 'user' | 'tool';
  text: string;
  title?: string;
};

type DeviceTemplate = {
  id: string;
  name: string;
  model: string;
  category: DeviceCategory;
  type: DevicePoint['type'];
  price: string;
  channel: string;
  install: string;
};

type DevicePlacementBatch = {
  device: DeviceTemplate;
  remaining: number;
};

type AutomationScene = {
  id: string;
  name: string;
  description: string;
  spaces: string[];
  enabled: boolean;
  type: 'Advanced Flow';
  status: 'Draft' | 'Ready' | 'Review';
  trigger: string;
  condition: string;
  action: string;
};

type CompletionCriterion = {
  label: string;
  detail: string;
  done: boolean;
  weight: number;
  score?: number;
};

type DeliveryAsset = {
  title: string;
  desc: string;
  meta: string;
  filename: string;
  href: string;
  ready: boolean;
  status: string;
  icon: LucideIcon;
};

type FurnitureProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  type: string;
  room: string;
  x: number;
  y: number;
  w: number;
  h: number;
  price: string;
};

type VisualizationCanvasProps = {
  project: ProjectModel;
  renderJob: RenderJobState;
  returnHref: string;
  onRunRender: () => void;
  onOpenReview: () => void;
};

type CanvasConfig = {
  iconSize: number;
  labelVisibility: number;
  showDeviceName: boolean;
  showDeviceModel: boolean;
  showConnectivity: boolean;
  coverageOpacity: number;
  wallsOpacity: number;
  objectsOpacity: number;
};

type BuildEditSnapshot = {
  deviceOverrides: Record<string, { x: number; y: number }>;
};

type ProjectModel = {
  title: string;
  context: string;
  roleBadge: string;
  status: string;
  area: string;
  rooms: number;
  devices: number;
  source: string;
  studio: string;
  facts: string[];
  outputs: string[];
  devicesList: DevicePoint[];
};

type NavigationModel = {
  source: string;
  backHref: string;
  backLabel: string;
  manageHref: string;
  manageLabel: string;
  createHref: string;
  createLabel: string;
};

const USER_STAGES: Array<{ id: StageId; label: string }> = [
  { id: 'floor', label: '空间设计' },
  { id: 'logic', label: '场景方案' },
  { id: 'review', label: '方案确认' },
];

const PRO_STAGES: Array<{ id: StageId; label: string }> = [...USER_STAGES];

const DEVICE_LIBRARY: DeviceTemplate[] = [
  { id: 'hub-m3', name: 'Hub M3', model: 'lumi.gateway.mgl03', category: 'hub', type: 'hub', price: '$129', channel: 'Matter + Zigbee + Thread', install: '弱电柜 / 客厅中位' },
  { id: 'edge-m300', name: 'Edge Hub M300', model: 'AG048 / AG054', category: 'hub', type: 'hub', price: '$299', channel: 'Ethernet + Zigbee', install: '项目主机 / 弱电柜' },
  { id: 'fp2', name: 'Presence Sensor FP2', model: 'lumi.motion.agl001', category: 'sensor', type: 'presence', price: '$82', channel: 'Wi-Fi', install: '客厅 / 卧室墙面' },
  { id: 'pr130p', name: 'AI Presence PR130P', model: 'lumi.motion.acn006', category: 'sensor', type: 'presence', price: '$69', channel: 'Zigbee', install: '走廊 / 房间顶装' },
  { id: 'p1-motion', name: 'Motion Sensor P1', model: 'lumi.motion.ac02', category: 'sensor', type: 'sensor', price: '$24', channel: 'Zigbee', install: '玄关 / 过道' },
  { id: 'p1-door', name: 'Door and Window P1', model: 'spu.AS039', category: 'sensor', type: 'sensor', price: '$22', channel: 'Zigbee', install: '门窗磁吸' },
  { id: 'g5-pro-poe', name: 'Camera Hub G5 Pro', model: 'spu.AC019', category: 'camera', type: 'camera', price: '$179', channel: 'PoE + Zigbee', install: '玄关 / 阳台 / 车库' },
  { id: 'g410-doorbell', name: 'Video Doorbell G410', model: 'lumi.camera.gwpgl1', category: 'camera', type: 'camera', price: '$139', channel: 'Wi-Fi', install: '入户门侧' },
  { id: 'u100-lock', name: 'Smart Lock U100', model: 'spu.AD028', category: 'lock', type: 'lock', price: '$189', channel: 'Bluetooth + Matter', install: '入户门' },
  { id: 'h1-switch', name: 'Wall Switch H1', model: 'spu.AK057', category: 'switch', type: 'switch', price: '$39', channel: 'Zigbee', install: '86 盒 / 零火优先' },
  { id: 'z1-pro-switch', name: 'Wall Switch Z1 Pro', model: 'spu.AK148', category: 'switch', type: 'switch', price: '$69', channel: 'Zigbee', install: '多路灯控位' },
  { id: 'ceiling-t1', name: 'Ceiling Light T1', model: '智能灯具 101', category: 'light', type: 'switch', price: '$99', channel: 'Zigbee', install: '客厅 / 卧室主灯' },
  { id: 'c3-curtain', name: 'Curtain Motor C3', model: 'spu.AM044', category: 'curtain', type: 'switch', price: '$159', channel: 'Zigbee', install: '窗帘轨道' },
];

const GUIDE_RECOMMENDED_QUANTITIES: Record<string, number> = {
  'hub-m3': 1,
  fp2: 2,
  'p1-motion': 3,
  'p1-door': 4,
  'g5-pro-poe': 1,
  'u100-lock': 1,
  'h1-switch': 4,
  'ceiling-t1': 3,
  'c3-curtain': 2,
};

const PUBLIC_SOLUTION_DEVICE_COUNTS: Record<string, number> = {
  'sol-eldercare-90m': 11,
  'sol-geek-apartment-matter': 41,
  'sol-family-three-room': 38,
  'sol-rental-landlord-pack': 12,
  'sol-eldercare-story-kit': 11,
  'sol-family-multi-persona': 38,
  'sol-minimal-japanese-flat': 18,
  'proj-eldercare': 11,
  'proj-family': 38,
};

const GUIDE_PLANNING_BRANCHES: Array<{
  label: string;
  desc: string;
  category: DeviceCategory;
  icon: LucideIcon;
}> = [
  { label: '中枢网络', desc: 'M3 / M300', category: 'hub', icon: Wifi },
  { label: '安防', desc: '门锁 / 摄像机 / 门窗', category: 'lock', icon: ShieldCheck },
  { label: '人体感知', desc: 'Presence / 光照 / 门窗', category: 'sensor', icon: Radar },
  { label: '灯光窗帘', desc: '开关 / 灯具 / 窗帘', category: 'switch', icon: Lightbulb },
];

const AI_GENERATED_AUTOMATIONS: AutomationScene[] = [
  {
    id: 'presence-lighting',
    name: '全屋 Presence 灯光',
    description: '无人持续一段时间后关闭主照明，有人进入则恢复柔和照明。',
    spaces: ['Living Room', 'Dining Area', 'Foyer', 'Master Bedroom'],
    enabled: true,
    type: 'Advanced Flow',
    status: 'Ready',
    trigger: 'FP2 / PR130P 检测到有人进入 Zone',
    condition: '环境光低于阈值，且当前空间有人停留',
    action: '开启对应空间灯光，长时间无人后自动关闭',
  },
  {
    id: 'entry-security',
    name: '玄关与门窗安防',
    description: '门锁、门窗磁和摄像机联动，离家后自动进入布防。',
    spaces: ['Foyer', 'Main Door', 'Service Yard'],
    enabled: true,
    type: 'Advanced Flow',
    status: 'Ready',
    trigger: 'U100 上锁且全屋无 Presence',
    condition: 'HomeKit / Aqara Home 处于 Away',
    action: '打开摄像机布防，门窗异常时推送告警',
  },
  {
    id: 'night-comfort',
    name: '婴儿房舒适环境',
    description: '夜间根据温湿度和活动状态微调灯光与提醒。',
    spaces: ['Common Bedroom', 'Master Bedroom'],
    enabled: true,
    type: 'Advanced Flow',
    status: 'Review',
    trigger: '温湿度或夜间活动状态变化',
    condition: '22:00 - 07:00，房间有人',
    action: '降低灯光亮度，必要时提醒检查环境',
  },
];

const PERSONA_REQUIREMENTS = [
  { label: '使用人群', value: '两位成人 + 儿童', icon: Users },
  { label: '场景需求', value: '安防 / 起夜 / 观影', icon: Sparkles },
  { label: '智能化要求', value: '自动推荐 + 可手动布点', icon: Wand2 },
  { label: '预算档位', value: '$1,500 - $2,000', icon: CircleDollarSign },
];

const TOOL_COPY: Record<ToolId, { title: string; hint: string }> = {
  select: { title: '选择', hint: '选择空间、实体或设备点位。' },
  pan: { title: '平移', hint: '移动画布视口。' },
  comment: { title: '评论', hint: '在户型图上标注待确认问题。' },
  walls: { title: '户型', hint: '编辑墙体、门窗与房间边界。' },
  room: { title: 'Room', hint: '绘制或识别房间区域。' },
  person: { title: '生活模拟', hint: '拖动人物位置，模拟人在空间中的活动与自动化触发。' },
  devices: { title: '点位', hint: '布置、绑定并校验设备点位。' },
  coverage: { title: '覆盖', hint: '查看 Wi-Fi、摄像头、雷达与传感覆盖。' },
  logic: { title: '场景', hint: '连接触发、条件、动作和兜底策略。' },
  visualize: { title: '3D 世界', hint: '上传户型图并调用 Marble 生成可打开的 3D 作品。' },
  agent: { title: 'Agent', hint: '让设计 Agent 调整当前方案。' },
};

const DEVICE_STATUS_META: Record<DevicePoint['status'], { dotClassName: string }> = {
  owned: {
    dotClassName: 'bg-emerald-500',
  },
  suggested: {
    dotClassName: 'bg-amber-500',
  },
  pending: {
    dotClassName: 'bg-rose-500',
  },
};

const STUDIO_ROOMS = [
  { id: 'entry', label: '玄关', area: '12m²', x: 4, y: 10, w: 12, h: 15, tone: 'bg-slate-50' },
  { id: 'living', label: '客厅', area: '42m²', x: 16, y: 10, w: 26, h: 28, tone: 'bg-sky-50/75' },
  { id: 'dining', label: '餐厅', area: '34m²', x: 42, y: 10, w: 27, h: 28, tone: 'bg-amber-50/55' },
  { id: 'bath', label: '廊厅', area: '28m²', x: 69, y: 10, w: 20, h: 37, tone: 'bg-sky-50/45' },
  { id: 'tea', label: '茶室', area: '21m²', x: 89, y: 10, w: 11, h: 28, tone: 'bg-amber-50/55' },
  { id: 'family', label: '家庭厅', area: '64m²', x: 16, y: 38, w: 37, h: 35, tone: 'bg-sky-50/70' },
  { id: 'kitchen', label: '厨房', area: '20m²', x: 53, y: 38, w: 15, h: 23, tone: 'bg-amber-50/45' },
  { id: 'guest', label: '客卧', area: '29m²', x: 89, y: 38, w: 11, h: 35, tone: 'bg-sky-50/45' },
  { id: 'meeting', label: '会客区', area: '24m²', x: 68, y: 47, w: 21, h: 26, tone: 'bg-sky-50/35' },
  { id: 'study', label: '书房', area: '24m²', x: 45, y: 73, w: 24, h: 20, tone: 'bg-sky-50/65' },
  { id: 'balcony', label: '露台', area: '52m²', x: 69, y: 73, w: 31, h: 20, tone: 'bg-amber-50/50' },
];

const STUDIO_FURNITURE = [
  { x: 21, y: 20, w: 10, h: 6, type: 'sofa' },
  { x: 32, y: 23, w: 6, h: 5, type: 'table' },
  { x: 45, y: 17, w: 14, h: 10, type: 'dining' },
  { x: 71, y: 28, w: 9, h: 3, type: 'bar' },
  { x: 23, y: 52, w: 12, h: 5, type: 'sofa' },
  { x: 36, y: 55, w: 7, h: 4, type: 'table' },
  { x: 24, y: 66, w: 13, h: 8, type: 'screen' },
  { x: 57, y: 44, w: 9, h: 8, type: 'kitchen' },
  { x: 73, y: 57, w: 12, h: 11, type: 'screen' },
  { x: 92, y: 19, w: 5, h: 10, type: 'round' },
  { x: 92, y: 49, w: 8, h: 17, type: 'bed' },
  { x: 50, y: 80, w: 12, h: 8, type: 'desk' },
  { x: 77, y: 81, w: 7, h: 7, type: 'seat' },
  { x: 88, y: 81, w: 7, h: 7, type: 'seat' },
];

const STUDIO_SECOND_FLOOR_ROOMS = [
  { id: 'stairs', label: '楼厅', area: '14m²', x: 7, y: 13, w: 15, h: 22, tone: 'bg-slate-50' },
  { id: 'master', label: '主卧', area: '38m²', x: 22, y: 13, w: 30, h: 34, tone: 'bg-sky-50/70' },
  { id: 'closet', label: '衣帽间', area: '12m²', x: 52, y: 13, w: 14, h: 18, tone: 'bg-amber-50/50' },
  { id: 'bath2', label: '主卫', area: '14m²', x: 66, y: 13, w: 17, h: 18, tone: 'bg-sky-50/45' },
  { id: 'child', label: '儿童房', area: '26m²', x: 7, y: 35, w: 30, h: 31, tone: 'bg-sky-50/60' },
  { id: 'study2', label: '学习区', area: '18m²', x: 37, y: 47, w: 22, h: 19, tone: 'bg-amber-50/45' },
  { id: 'guest2', label: '客房', area: '24m²', x: 59, y: 31, w: 24, h: 35, tone: 'bg-sky-50/50' },
  { id: 'terrace2', label: '露台', area: '34m²', x: 18, y: 66, w: 65, h: 19, tone: 'bg-amber-50/55' },
];

const STUDIO_SECOND_FLOOR_FURNITURE = [
  { x: 28, y: 24, w: 14, h: 10, type: 'bed' },
  { x: 44, y: 25, w: 5, h: 5, type: 'table' },
  { x: 12, y: 46, w: 12, h: 9, type: 'bed' },
  { x: 28, y: 55, w: 6, h: 5, type: 'desk' },
  { x: 41, y: 54, w: 12, h: 5, type: 'desk' },
  { x: 64, y: 43, w: 13, h: 10, type: 'bed' },
  { x: 34, y: 73, w: 7, h: 7, type: 'seat' },
  { x: 57, y: 73, w: 7, h: 7, type: 'seat' },
];

const FURNITURE_META: Record<string, { name: string; brand: string; category: string; price: string }> = {
  sofa: { name: 'Modular Sofa', brand: 'Generic Products', category: 'Seating', price: '$680' },
  table: { name: 'Round Side Table', brand: 'Generic Products', category: 'Tables', price: '$120' },
  dining: { name: 'Dining Set', brand: 'Generic Products', category: 'Dining', price: '$940' },
  bar: { name: 'Console Table', brand: 'Generic Products', category: 'Storage', price: '$260' },
  screen: { name: 'Media Console', brand: 'Generic Products', category: 'Living', price: '$420' },
  kitchen: { name: 'Kitchen Island', brand: 'Structures', category: 'Built-in', price: '$1,200' },
  round: { name: 'Round Rug', brand: 'Generic Products', category: 'Decor', price: '$190' },
  bed: { name: 'Queen Bed', brand: 'Generic Products', category: 'Bedroom', price: '$760' },
  desk: { name: 'Study Desk', brand: 'Generic Products', category: 'Office', price: '$320' },
  seat: { name: 'INK+IVY Novak Lounge Chair', brand: 'Olliix', category: 'Chair', price: '$249' },
};

function roomsForFloor(activeFloor: string) {
  if (activeFloor === '2F') return STUDIO_SECOND_FLOOR_ROOMS;
  return STUDIO_ROOMS;
}

type StudioRoom = ReturnType<typeof roomsForFloor>[number];

function placementPointForRoom(room: StudioRoom, slotIndex: number) {
  const slotMap = [
    { x: 0.5, y: 0.5 },
    { x: 0.28, y: 0.34 },
    { x: 0.72, y: 0.34 },
    { x: 0.28, y: 0.66 },
    { x: 0.72, y: 0.66 },
    { x: 0.5, y: 0.26 },
    { x: 0.5, y: 0.74 },
    { x: 0.36, y: 0.5 },
    { x: 0.64, y: 0.5 },
  ];
  const slot = slotMap[slotIndex % slotMap.length];
  const pass = Math.floor(slotIndex / slotMap.length);
  const jitterX = ((pass % 3) - 1) * 1.2;
  const jitterY = (pass % 2 ? 1 : -1) * 1.2;
  const minX = room.x + Math.min(2.5, room.w * 0.22);
  const maxX = room.x + room.w - Math.min(2.5, room.w * 0.22);
  const minY = room.y + Math.min(2.5, room.h * 0.18);
  const maxY = room.y + room.h - Math.min(2.5, room.h * 0.18);
  return {
    x: Math.max(minX, Math.min(maxX, room.x + room.w * slot.x + jitterX)),
    y: Math.max(minY, Math.min(maxY, room.y + room.h * slot.y + jitterY)),
  };
}

function floorDisplayName(floor: string) {
  if (floor === '1F') return '一楼';
  if (floor === '2F') return '二楼';
  return floor.replace(/F$/i, '楼');
}

function furnitureForFloor(activeFloor: string) {
  if (activeFloor === '2F') return STUDIO_SECOND_FLOOR_FURNITURE;
  return STUDIO_FURNITURE;
}

function roomAtPoint(activeFloor: string, x: number, y: number) {
  return roomsForFloor(activeFloor).find(room => x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h)?.label ?? '未分配';
}

function furnitureProductsForFloor(activeFloor: string): FurnitureProduct[] {
  return furnitureForFloor(activeFloor).map((item, index) => {
    const meta = FURNITURE_META[item.type] ?? FURNITURE_META.sofa;
    return {
      id: `${activeFloor}-${item.type}-${index}`,
      name: meta.name,
      brand: meta.brand,
      category: meta.category,
      type: item.type,
      room: roomAtPoint(activeFloor, item.x, item.y),
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      price: meta.price,
    };
  });
}

const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  iconSize: 62,
  labelVisibility: 70,
  showDeviceName: true,
  showDeviceModel: false,
  showConnectivity: true,
  coverageOpacity: 70,
  wallsOpacity: 100,
  objectsOpacity: 82,
};

const DEFAULT_BUILDING_NAME = 'Building 1';

const MARBLE_PREVIEW_URL = 'http://10.11.50.116/preview?templateId=demo1';

const ROOM_LABELS: Record<string, string> = {
  Living: '客厅',
  Entry: '玄关',
  Hall: '茶室',
  Master: '家庭厅',
  Bedroom: '茶室',
  Tea: '茶室',
  Shelter: '廊厅',
};

function roomLabelFor(room: string) {
  return ROOM_LABELS[room] ?? room;
}

const PRO_PROJECT: ProjectModel = {
  title: '4-Room BTO HomeKit',
  context: '客户项目',
  roleBadge: '专业交付',
  status: 'Lead',
  area: '93 m²',
  rooms: 8,
  devices: 22,
  source: '专业工作台',
  studio: '待关联',
  facts: ['r/Aqara Lead', 'HomeKit', 'M3', 'Presence lighting'],
  outputs: ['户型图', '设备点位', '空间图谱', '预览稿', '部署包'],
  devicesList: [
    { pointCode: 'LIV-HB-01', name: 'Hub M3', model: 'Matter Hub', type: 'hub', room: 'Living', x: 31, y: 57, status: 'owned', did: 'lumi.gateway.m3.8124', rssi: -39, channel: 'Matter + Zigbee', power: 'USB-C', automations: 8, coverage: 'Whole home', online: true },
    { pointCode: 'LIV-FP-01', name: 'FP2', model: 'Presence', type: 'presence', room: 'Living', x: 25, y: 25, status: 'suggested', did: 'lumi.motion.fp2.2207', rssi: -47, channel: 'Wi-Fi', power: 'USB', automations: 5, coverage: 'Living / Dining', note: 'Aim away from corridor glare.', online: true },
    { pointCode: 'MBR-FP-01', name: 'FP300', model: 'Presence', type: 'presence', room: 'Master', x: 35, y: 53, status: 'suggested', did: 'lumi.motion.fp300.1138', rssi: -51, channel: 'Thread', power: 'Battery', automations: 3, coverage: 'Family hall', online: true },
    { pointCode: 'ENT-CAM-01', name: 'G410', model: 'Doorbell', type: 'camera', room: 'Entry', x: 9, y: 23, status: 'owned', did: 'lumi.camera.g410.9812', rssi: -44, channel: 'Wi-Fi', power: 'Battery', automations: 4, coverage: 'Entry', online: true },
    { pointCode: 'HAL-SW-01', name: 'H1', model: 'Switch', type: 'switch', room: 'Hall', x: 91, y: 24, status: 'owned', did: 'lumi.switch.h1.7721', rssi: -42, channel: 'Zigbee', power: 'Neutral', automations: 6, coverage: 'Tea room', online: true },
    { pointCode: 'STO-DW-01', name: 'T1', model: 'Door', type: 'sensor', room: 'Shelter', x: 71, y: 27, status: 'pending', channel: 'Zigbee', power: 'Battery', automations: 1, coverage: 'Gallery', note: 'Needs pairing after site survey.', online: false },
  ],
};

const USER_PROJECT: ProjectModel = {
  title: 'My Apartment',
  context: '个人方案',
  roleBadge: '个人创作',
  status: 'Draft',
  area: '94 m²',
  rooms: 6,
  devices: 18,
  source: 'Builder 社区',
  studio: '我的 Studio',
  facts: ['Security', 'Night path', 'Low wiring', 'Family'],
  outputs: ['户型图', '设备点位', '空间图谱', '预览稿', '专业支持'],
  devicesList: [
    { pointCode: 'LIV-HB-01', name: 'Hub M3', model: 'Matter Hub', type: 'hub', room: 'Living', x: 31, y: 57, status: 'owned', did: 'lumi.gateway.m3.4028', rssi: -37, channel: 'Matter + Zigbee', power: 'USB-C', automations: 5, coverage: 'Whole home', online: true },
    { pointCode: 'LIV-FP-01', name: 'FP400', model: 'Presence', type: 'presence', room: 'Living', x: 25, y: 25, status: 'owned', did: 'lumi.motion.fp400.1186', rssi: -46, channel: 'Thread', power: 'Battery', automations: 4, coverage: 'Living / Dining', note: 'Good for night path trigger.', online: true },
    { pointCode: 'BED-CM-01', name: 'C3', model: 'Curtain', type: 'switch', room: 'Bedroom', x: 92, y: 24, status: 'pending', channel: 'Zigbee', power: 'AC', automations: 2, coverage: 'Bedroom curtain', note: 'Optional item, confirm budget before purchase.', online: false },
  ],
};

function ClientVisualizationCanvas(props: VisualizationCanvasProps) {
  return <VisualizationCanvasImpl {...props} />;
}

function resolveNavigation(params: URLSearchParams | null | undefined, isPersonal: boolean, workflow: WorkflowId): NavigationModel {
  const projectId = params?.get('project');
  const solutionId = params?.get('solution') || params?.get('remix');

  if (isPersonal) {
    if (workflow === 'persona') {
      return {
        source: 'Builder 社区',
        backHref: '/home/build',
        backLabel: '创作台',
        manageHref: '/home/build',
        manageLabel: '创作台',
        createHref: '/home/build',
        createLabel: '创作台',
      };
    }

    return {
      source: 'Builder 社区',
      backHref: '/home/solutions',
      backLabel: solutionId ? '方案' : 'Builder 社区',
      manageHref: '/home/solutions',
      manageLabel: '管理方案',
      createHref: '/build?entry=personal&demo_as=builder&solution=new',
      createLabel: '新建方案',
    };
  }

  return {
    source: '专业工作台',
    backHref: projectId ? `/pro/projects/${projectId}/overview` : '/pro/projects',
    backLabel: projectId ? '项目' : '专业工作台',
    manageHref: '/pro/projects',
    manageLabel: '管理项目',
    createHref: '/pro/projects?new=1',
    createLabel: '新建项目',
  };
}

function resolveWorkflow(value: string | null | undefined): WorkflowId {
  if (value === 'life' || value === 'dashboard') return 'life';
  if (value === 'persona') return 'persona';
  if (value === 'visualization') return 'visualization';
  return 'space';
}

type StudioOption = {
  studio: Studio;
  workspace: Workspace;
};

function studioOptionsForCanvas(isPro: boolean): StudioOption[] {
  const workspaces = isPro ? [...getFrontendWorkspaces(), ...getProServiceWorkspaces()] : getFrontendWorkspaces();
  return workspaces.flatMap(workspace => (
    getStudiosForWorkspace(workspace.id).map(studio => ({ studio, workspace }))
  ));
}

function resolveStage(value: string | null | undefined): StageId | null {
  if (value === 'floor' || value === 'points' || value === 'logic' || value === 'visualize' || value === 'review' || value === 'deploy') return value;
  return null;
}

const DESIGN_STAGE_RANK: Record<StageId, number> = {
  floor: 1,
  points: 2,
  logic: 3,
  visualize: 4,
  review: 5,
  deploy: 6,
};

function resolveProjectDesignStage(project?: Project): StageId | null {
  const explicit = resolveStage(project?.designStage);
  if (explicit) return explicit;
  if (project?.solutionStatus === 'finalized') return 'review';
  if ((project?.personas ?? 0) > 0) return 'review';
  if ((project?.devices ?? 0) > 0 || (project?.floorPlans?.length ?? 0) > 0) return 'logic';
  return null;
}

function completedStagesForStage(stage: StageId, finalized = false): StageId[] {
  if (stage === 'floor') return finalized ? ['floor'] : [];
  if (stage === 'points') return ['floor'];
  if (stage === 'logic') return ['floor', 'points'];
  if (stage === 'visualize') return ['floor', 'points', 'logic'];
  if (stage === 'review') return finalized ? ['floor', 'points', 'logic', 'review'] : ['floor', 'points', 'logic'];
  return ['floor', 'points', 'logic', 'review'];
}

function toolForStage(stage: StageId): ToolId {
  if (stage === 'logic' || stage === 'review') return 'agent';
  if (stage === 'visualize') return 'visualize';
  if (stage === 'points' || stage === 'deploy') return 'devices';
  return 'select';
}

function projectModelFromBuilder(record: Project | undefined, fallback: ProjectModel, isPersonal: boolean): ProjectModel {
  if (!record) return fallback;
  const studioState = record.linkedStudioId ? '已关联 Studio' : '待关联 Studio';
  return {
    ...fallback,
    title: record.title,
    context: isPersonal ? '个人方案' : '客户项目',
    roleBadge: isPersonal ? '个人创作' : '专业交付',
    status: isPersonal ? record.status : record.phase ?? record.status,
    devices: record.devices || fallback.devices,
    source: isPersonal ? 'Builder 社区' : '专业工作台',
    studio: studioState,
    facts: [
      record.subtitle,
      record.solutionVersion ?? 'v0.1',
      studioState,
      record.customerName ?? (isPersonal ? '个人方案' : '待补充客户'),
    ].filter(Boolean).slice(0, 4),
    outputs: isPersonal
      ? ['户型图', '设备点位', '空间图谱', '预览稿']
      : ['项目档案', '户型图', '空间图谱', '交付包', '部署包'],
  };
}

function stageForTool(tool: ToolId): StageId {
  if (tool === 'walls') return 'floor';
  if (tool === 'devices' || tool === 'coverage') return 'points';
  if (tool === 'logic' || tool === 'agent') return 'logic';
  if (tool === 'visualize') return 'visualize';
  return 'floor';
}

function agentRun(stage: StageId, isPro: boolean) {
  if (!isPro) {
    return [
      ['空间结构', stage === 'floor' ? 'run' : 'done'],
      ['设备点位', stage === 'points' ? 'run' : 'done'],
      ['空间图谱', stage === 'logic' ? 'run' : 'idle'],
      ['生成预览', stage === 'visualize' ? 'run' : 'idle'],
      ['请求专业支持', 'idle'],
    ] as const;
  }
  return [
    ['空间结构', stage === 'floor' ? 'run' : 'done'],
    ['设备点位', stage === 'points' ? 'run' : 'done'],
    ['空间图谱', stage === 'logic' ? 'run' : 'idle'],
    ['Studio 部署', stage === 'deploy' ? 'run' : 'idle'],
  ] as const;
}

function BuildPageContent() {
  const params = useSearchParams();
  const { role, mounted } = useRole();
  const isSignedIn = mounted && isBuilderRole(role);
  const isPro = mounted && isProBuilderRole(role);
  const requestedPro = params?.get('entry') === 'pro';
  const isPersonal = !isPro;
  const workflow = resolveWorkflow(params?.get('workflow'));
  const sourceProjectId = params?.get('project') || params?.get('solution') || params?.get('remix') || undefined;
  const sourceProject = sourceProjectId ? getProject(sourceProjectId) : undefined;
  const editorRequested = params?.get('editor') === '1';
  const isSharedSolutionView = workflow === 'space'
    && Boolean(sourceProject)
    && Boolean(params?.get('solution'))
    && params?.get('ready') !== '1'
    && params?.get('remix') !== '1'
    && sourceProject?.visibility !== 'private';
  const sourceHasAutomationScenes = Boolean(sourceProject)
    && (sourceProject?.solutionStatus === 'finalized' || sourceProject?.visibility !== 'private' || (sourceProject?.personas ?? 0) > 0);
  const studioOptions = studioOptionsForCanvas(isPro);
  const requestedStudioId = params?.get('studioId') || sourceProject?.linkedStudioId || undefined;
  const resolvedStudioId = requestedStudioId && studioOptions.some(option => option.studio.id === requestedStudioId)
    ? requestedStudioId
    : studioOptions[0]?.studio.id ?? '';
  const baseProject = projectModelFromBuilder(sourceProject, isPersonal ? USER_PROJECT : PRO_PROJECT, isPersonal);
  const navigation = resolveNavigation(params, isPersonal, workflow);
  const stages = isPersonal ? USER_STAGES : PRO_STAGES;
  const requestedStage = resolveStage(params?.get('stage'));
  const persistedDesignStage = resolveProjectDesignStage(sourceProject);
  const sourceHasSpacePlan = Boolean(sourceProject?.floorPlans?.length || sourceProject?.solutionStatus === 'finalized');
  const stageRouteKey = `${workflow}:${isPersonal ? 'personal' : 'pro'}:${sourceProjectId ?? 'new'}`;
  const stageNavigationRef = useRef<{ key: string; stage: StageId } | null>(null);
  const preservePlanningDevicesRef = useRef(false);
  const initialFloorPlanName = sourceProject?.floorPlans?.[0]?.name ?? '';
  const initialSpaceStage = isSharedSolutionView ? 'review' : requestedStage ?? persistedDesignStage ?? 'floor';
  const readyRequested = params?.get('ready') === '1';
  const setupRequested = workflow === 'space' && !readyRequested && (
    !isSharedSolutionView && (
    params?.get('setup') === '1' ||
    params?.get('guide') === '1' ||
    !sourceProject ||
    (!requestedStage && !persistedDesignStage && sourceProject?.solutionStatus !== 'finalized')
    )
  );
  const [stage, setStage] = useState<StageId>(() => workflow === 'visualization' ? 'visualize' : (workflow === 'persona' || workflow === 'life') ? 'review' : initialSpaceStage);
  const [tool, setTool] = useState<ToolId>(() => workflow === 'visualization' ? 'visualize' : (workflow === 'persona' || workflow === 'life') ? 'logic' : toolForStage(initialSpaceStage));
  const [spaceSetupState, setSpaceSetupState] = useState<SpaceSetupState>(() => setupRequested ? 'guide' : 'ready');
  const [floorPlanMode, setFloorPlanMode] = useState<FloorPlanMode>(() => initialFloorPlanName ? 'existing' : 'demo');
  const [uploadedPlanName, setUploadedPlanName] = useState(initialFloorPlanName);
  const [floors, setFloors] = useState(['1F', '2F']);
  const [activeFloor, setActiveFloor] = useState('1F');
  const [buildingName, setBuildingName] = useState(sourceProject?.buildingName ?? DEFAULT_BUILDING_NAME);
  const [buildings, setBuildings] = useState<SpaceBuilding[]>(() => [
    { id: 'building-1', name: sourceProject?.buildingName ?? DEFAULT_BUILDING_NAME, floors: ['1F', '2F'], plannedFloors: ['1F', '2F'] },
  ]);
  const [activeBuildingId, setActiveBuildingId] = useState('building-1');
  const [selectedStudioId, setSelectedStudioId] = useState(resolvedStudioId);
  const [buildingSequence, setBuildingSequence] = useState(1);
  const [buildingComposed, setBuildingComposed] = useState(true);
  const [alignFloorplansOpen, setAlignFloorplansOpen] = useState(false);
  const [renderJob, setRenderJob] = useState<RenderJobState>('idle');
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [exitEditDialogOpen, setExitEditDialogOpen] = useState(false);
  const [exitSolutionDialogOpen, setExitSolutionDialogOpen] = useState(false);
  const [spaceEditorOpen, setSpaceEditorOpen] = useState(() => params?.get('editor') === '1');
  const [configOpen, setConfigOpen] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [deviceLibraryOpen, setDeviceLibraryOpen] = useState(false);
  const [floorPlanUploadOpen, setFloorPlanUploadOpen] = useState(false);
  const [floorPlanDraftName, setFloorPlanDraftName] = useState('');
  const [floorPlanDraftFile, setFloorPlanDraftFile] = useState('');
  const [floorPlanDraftPreviewUrl, setFloorPlanDraftPreviewUrl] = useState('');
  const [floorPlanPreviewUrl, setFloorPlanPreviewUrl] = useState('');
  const [uploadingFloorPlanPreviewUrl, setUploadingFloorPlanPreviewUrl] = useState('');
  const [floorPlanImportOpen, setFloorPlanImportOpen] = useState(false);
  const [floorPlanParsing, setFloorPlanParsing] = useState(false);
  const [scaleGuideOpen, setScaleGuideOpen] = useState(false);
  const [selectedDeviceQuantities, setSelectedDeviceQuantities] = useState<Record<string, number>>({});
  const [placementBatch, setPlacementBatch] = useState<DevicePlacementBatch | null>(null);
  const [automationScenes, setAutomationScenes] = useState<AutomationScene[]>(() => (
    sourceHasAutomationScenes
      ? AI_GENERATED_AUTOMATIONS
      : []
  ));
  const [activeAutomationId, setActiveAutomationId] = useState<string | null>(null);
  const [remixDialogOpen, setRemixDialogOpen] = useState(false);
  const [remixBrief, setRemixBrief] = useState('');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState(baseProject.title);
  const [publishVisibility, setPublishVisibility] = useState<PublishVisibility>('public-remixable');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [deviceOverrides, setDeviceOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const [recommendedDevices, setRecommendedDevices] = useState<DevicePoint[]>(() => sourceProject ? baseProject.devicesList : []);
  const [customDevices, setCustomDevices] = useState<DevicePoint[]>([]);
  const [completedStages, setCompletedStages] = useState<StageId[]>([]);
  const [editSnapshot, setEditSnapshot] = useState<BuildEditSnapshot | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('off');
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(DEFAULT_CANVAS_CONFIG);
  const [layers, setLayers] = useState<Record<LayerId, boolean>>({
    walls: true,
    furniture: true,
    devices: true,
    coverage: true,
    links: false,
  });
  const designDevices = [...recommendedDevices, ...customDevices].map(device => ({
    ...device,
    ...(deviceOverrides[device.name] ?? {}),
  }));
  const sourceDeviceCount = (sourceProjectId ? PUBLIC_SOLUTION_DEVICE_COUNTS[sourceProjectId] : undefined) ?? sourceProject?.devices;
  const effectiveProjectDeviceCount = sourceDeviceCount
    ? Math.max(sourceDeviceCount, designDevices.length)
    : designDevices.length;
  const project: ProjectModel = {
    ...baseProject,
    studio: selectedStudioId
      ? (() => {
          const option = studioOptions.find(item => item.studio.id === selectedStudioId);
          return option ? `${option.workspace.name} / ${option.studio.spaceName}` : baseProject.studio;
        })()
      : baseProject.studio,
    devices: effectiveProjectDeviceCount,
    devicesList: designDevices,
  };
  const activeBuilding = buildings.find(building => building.id === activeBuildingId) ?? buildings[0];
  const selectedStudioOption = studioOptions.find(option => option.studio.id === selectedStudioId) ?? studioOptions[0] ?? null;
  const activeFloorPlanned = Boolean(activeFloor && activeBuilding?.plannedFloors.includes(activeFloor));
  const selectedDeviceItems = DEVICE_LIBRARY
    .map(device => ({ device, quantity: selectedDeviceQuantities[device.id] ?? 0 }))
    .filter(item => item.quantity > 0);
  const hasImportedFloorPlan = Boolean(uploadedPlanName || floorPlanPreviewUrl || sourceProject?.floorPlans?.length);
  const hasSpacePlan = Boolean(completedStages.includes('floor') || completedStages.includes('points') || sourceProject?.floorPlans?.length || sourceProject?.solutionStatus === 'finalized');
  const spacePlanName = uploadedPlanName || sourceProject?.floorPlans?.[0]?.name || `${floorDisplayName(activeFloor || '1F')} space plan`;

  useEffect(() => {
    return () => {
      if (floorPlanPreviewUrl) URL.revokeObjectURL(floorPlanPreviewUrl);
    };
  }, [floorPlanPreviewUrl]);

  useEffect(() => {
    setSelectedStudioId(resolvedStudioId);
  }, [resolvedStudioId, sourceProjectId, workflow]);

  const handleStudioChange = (studioId: string) => {
    setSelectedStudioId(studioId);
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set('studioId', studioId);
    window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`);
    if (sourceProjectId) linkProjectToStudio(sourceProjectId, studioId);
    setDirty(true);
  };

  const updateSelectedDeviceQuantity = (deviceId: string, delta: number) => {
    setSelectedDeviceQuantities(prev => {
      const nextValue = Math.max(0, (prev[deviceId] ?? 0) + delta);
      const next = { ...prev };
      if (nextValue === 0) delete next[deviceId];
      else next[deviceId] = nextValue;
      return next;
    });
  };

  const handleUseGuideRecommendation = () => {
    setSelectedDeviceQuantities(GUIDE_RECOMMENDED_QUANTITIES);
  };

  const handleContinueFromGuide = () => {
    preservePlanningDevicesRef.current = true;
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set('ready', '1');
    nextParams.set('stage', 'floor');
    nextParams.set('editor', '1');
    nextParams.delete('setup');
    nextParams.delete('guide');
    window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`);
    stageNavigationRef.current = { key: stageRouteKey, stage: 'floor' };
    setSpaceSetupState('ready');
    setSpaceEditorOpen(true);
    setFloorPlanImportOpen(!hasImportedFloorPlan);
    setFloorPlanParsing(false);
    setStage('floor');
    setTool('select');
    setSelected(null);
    setSelectedFurniture(null);
  };

  const handleSkipGuide = () => {
    preservePlanningDevicesRef.current = false;
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set('ready', '1');
    nextParams.set('stage', 'floor');
    nextParams.set('editor', '1');
    nextParams.delete('setup');
    nextParams.delete('guide');
    window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`);
    stageNavigationRef.current = { key: stageRouteKey, stage: 'floor' };
    setSelectedDeviceQuantities({});
    setPlacementBatch(null);
    setSpaceSetupState('ready');
    setSpaceEditorOpen(true);
    setFloorPlanImportOpen(!hasImportedFloorPlan);
    setFloorPlanParsing(false);
    setStage('floor');
    setTool('select');
    setSelected(null);
    setSelectedFurniture(null);
  };

  const persistDesignStage = (nextStage: StageId) => {
    if (!sourceProject) return;
    const normalizedStage: DesignStage = nextStage;
    const currentStage = resolveProjectDesignStage(sourceProject);
    const stageToSave = currentStage && DESIGN_STAGE_RANK[currentStage] > DESIGN_STAGE_RANK[normalizedStage]
      ? currentStage
      : normalizedStage;
    const selectedPlanningDeviceCount = selectedDeviceItems.reduce((sum, item) => sum + item.quantity, 0);
    const savedDeviceCount = project.devicesList.length || selectedPlanningDeviceCount || sourceProject.devices;
    const shouldSnapshotSpacePlan = normalizedStage === 'floor' || normalizedStage === 'points';
    const savedFloorPlans = shouldSnapshotSpacePlan
      ? (sourceProject.floorPlans?.length
          ? sourceProject.floorPlans.map((plan, index) => index === 0 ? {
              ...plan,
              name: uploadedPlanName || plan.name,
              devices: savedDeviceCount,
              updatedAt: 'just now',
              status: 'finalized' as const,
            } : plan)
          : [{
              id: `${sourceProject.id}-floor-1`,
              name: uploadedPlanName || `${floorDisplayName(activeFloor || '1F')} space plan`,
              thumbnailPattern: 'top' as const,
              rooms: project.rooms,
              devices: savedDeviceCount,
              createdAt: sourceProject.createdAt,
              updatedAt: 'just now',
              status: 'finalized' as const,
            }])
      : sourceProject.floorPlans;
    saveCubixLocalProject({
      ...sourceProject,
      designStage: stageToSave,
      solutionStatus: sourceProject.solutionStatus === 'finalized' ? 'finalized' : 'editing',
      devices: savedDeviceCount,
      floorPlans: savedFloorPlans,
      updatedAt: 'just now',
    });
  };

  useEffect(() => {
    const stageOverride = stageNavigationRef.current?.key === stageRouteKey ? stageNavigationRef.current.stage : null;
    const resetStage = workflow === 'visualization'
      ? 'visualize'
      : (workflow === 'persona' || workflow === 'life')
        ? 'review'
        : stageOverride ?? initialSpaceStage;
    setStage(resetStage);
    setTool(workflow === 'visualization'
      ? 'visualize'
      : (workflow === 'persona' || workflow === 'life')
        ? 'logic'
        : toolForStage(resetStage));
    setSelected(null);
    setSelectedFurniture(null);
    setDeviceOverrides({});
    setCustomDevices([]);
    setDirty(false);
    setEditMode(false);
    setExitEditDialogOpen(false);
    setExitSolutionDialogOpen(false);
    setSpaceEditorOpen(workflow === 'space' && editorRequested && (resetStage === 'floor' || resetStage === 'points') && !setupRequested);
    setConfigOpen(false);
    setDeviceLibraryOpen(false);
    setFloorPlanUploadOpen(false);
    setFloorPlanDraftName('');
    setFloorPlanDraftFile('');
    setFloorPlanDraftPreviewUrl('');
    setFloorPlanMode(sourceProject?.floorPlans?.[0]?.name ? 'existing' : 'demo');
    setUploadedPlanName(sourceProject?.floorPlans?.[0]?.name ?? '');
    setFloorPlanPreviewUrl('');
    setUploadingFloorPlanPreviewUrl('');
    setFloorPlanImportOpen(false);
    setFloorPlanParsing(false);
    setScaleGuideOpen(false);
    setEditSnapshot(null);
    if (preservePlanningDevicesRef.current) {
      preservePlanningDevicesRef.current = false;
    } else {
      setSelectedDeviceQuantities({});
    }
    setPlacementBatch(null);
    setAutomationScenes(sourceHasAutomationScenes
      ? AI_GENERATED_AUTOMATIONS
      : []);
    setActiveAutomationId(null);
    setRemixDialogOpen(false);
    setRemixBrief('');
    setPublishDialogOpen(false);
    setPublishTitle(baseProject.title);
    setPublishVisibility(sourceProject?.visibility === 'private' ? 'private' : 'public-remixable');
    setRecommendedDevices(sourceProject ? baseProject.devicesList : []);
    setCompletedStages(workflow === 'visualization'
      ? ['floor', 'points', 'logic']
      : persistedDesignStage
        ? completedStagesForStage(persistedDesignStage, sourceProject?.solutionStatus === 'finalized')
        : sourceHasSpacePlan
          ? ['floor', 'points']
          : []);
    setOverlayMode('off');
    const nextFloors = setupRequested ? ['1F'] : ['1F', '2F'];
    const nextBuildingName = sourceProject?.buildingName ?? DEFAULT_BUILDING_NAME;
    setBuildings([{ id: 'building-1', name: nextBuildingName, floors: nextFloors, plannedFloors: nextFloors }]);
    setActiveBuildingId('building-1');
    setFloors(nextFloors);
    setActiveFloor('1F');
    setBuildingName(nextBuildingName);
    setBuildingSequence(1);
    setBuildingComposed(true);
    setAlignFloorplansOpen(false);
    setSpaceSetupState(setupRequested ? 'guide' : 'ready');
  }, [isPersonal, sourceProjectId, workflow, requestedStage, persistedDesignStage, sourceProject?.solutionStatus, sourceProject?.buildingName, sourceProject?.visibility, sourceProject?.personas, sourceHasAutomationScenes, sourceHasSpacePlan, setupRequested, initialSpaceStage, stageRouteKey, editorRequested]);

  useEffect(() => {
    if (workflow === 'space') {
      const stageOverride = stageNavigationRef.current?.key === stageRouteKey ? stageNavigationRef.current.stage : null;
      const nextStage = isSharedSolutionView ? 'review' : stageOverride ?? requestedStage ?? persistedDesignStage;
      if (nextStage) {
        setStage(nextStage);
        setTool(toolForStage(nextStage));
        setCompletedStages(completedStagesForStage(nextStage, sourceProject?.solutionStatus === 'finalized'));
        if (nextStage === 'review' || nextStage === 'deploy') persistDesignStage(nextStage);
        return;
      }
      setStage(prev => prev === 'visualize' ? 'floor' : prev);
      return;
    }
    if (workflow === 'visualization') {
      setStage('visualize');
      setTool('visualize');
      setCompletedStages(prev => prev.length ? prev : ['floor', 'points', 'logic']);
      return;
    }
    if (workflow === 'persona' || workflow === 'life') {
      setStage('review');
      setTool('logic');
      return;
    }
  }, [workflow, requestedStage, persistedDesignStage, sourceProject?.solutionStatus, isSharedSolutionView, stageRouteKey]);

  const selectedDevice = selected ? project.devicesList.find(device => device.name === selected) ?? null : null;
  const selectedFurnitureProduct = selectedFurniture ? furnitureProductsForFloor(activeFloor).find(item => item.id === selectedFurniture) ?? null : null;
  const hasInspector = Boolean(selectedDevice || selectedFurnitureProduct);
  const requiredStages = stages.filter(stageItem => stageItem.id !== 'visualize');
  const completion = Math.round((requiredStages.filter(item => completedStages.includes(item.id)).length / requiredStages.length) * 100);
  const isVisualizationMode = workflow === 'visualization' || stage === 'visualize' || tool === 'visualize';
  const isLifeMode = workflow === 'life' && !isVisualizationMode;
  const isPersonaMode = (workflow === 'persona' || workflow === 'life') && !isVisualizationMode;
  const isSpaceSetupMode = workflow === 'space' && spaceSetupState !== 'ready';
  const isSolutionOverviewMode = workflow === 'space' && stage === 'review' && !isVisualizationMode;
  const isDeploymentMode = workflow === 'space' && stage === 'deploy' && !isVisualizationMode;
  const isAutomationEditorMode = workflow === 'space' && stage === 'logic' && !isVisualizationMode;
  const isSpaceDesignModuleMode = workflow === 'space' && (stage === 'floor' || stage === 'points') && !isVisualizationMode && !isSpaceSetupMode;
  const isSpaceDesignStatementMode = isSpaceDesignModuleMode && !spaceEditorOpen;
  const isImmersiveSpaceEditorMode = isSpaceDesignModuleMode && spaceEditorOpen;
  const isImmersiveAutomationEditorMode = isAutomationEditorMode && Boolean(activeAutomationId);
  const isImmersiveEditorMode = isImmersiveSpaceEditorMode || isImmersiveAutomationEditorMode;
  const activeSolutionModule: SolutionModuleId = isSpaceSetupMode
    ? 'planning'
    : isSolutionOverviewMode
        ? 'confirm'
        : isAutomationEditorMode
          ? 'scene'
          : 'space';
  const usesSolutionLibrary = !isPersonaMode;
  const headerTitle = isLifeMode ? project.title : isPersonaMode ? '成员看板' : project.title;
  const headerMeta = isPersonaMode
    ? [selectedStudioOption ? `${selectedStudioOption.workspace.name} / ${selectedStudioOption.studio.name}` : '选择 Studio', isLifeMode ? 'App 插件创作' : '家庭成员输出']
    : [project.context, project.area, `${project.rooms} 空间`, `${project.devices} 设备`];
  const visibleStepperStage = stage === 'points' ? 'floor' : stage;
  const primaryActionLabel = (() => {
    if (isPersonaMode) return '生成';
    if (isSpaceSetupMode) return '';
    if (isSharedSolutionView) return 'Remix';
    if (stage === 'floor' || stage === 'points') return '保存空间设计';
    if (stage === 'logic' || stage === 'review') return '';
    if (stage === 'deploy') return '部署检查';
    return '保存';
  })();

  const handleSave = () => {
    if (isSharedSolutionView) {
      setRemixDialogOpen(true);
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setDirty(false);
      setEditSnapshot({ deviceOverrides });
      if (workflow !== 'space') return;
      if (stage === 'floor' || stage === 'points') {
        if (activeFloor) {
          setBuildings(prev => prev.map(building => {
            if (building.id !== activeBuildingId || building.plannedFloors.includes(activeFloor)) return building;
            return { ...building, plannedFloors: [...building.plannedFloors, activeFloor] };
          }));
        }
        setCompletedStages(prev => Array.from(new Set([...prev, 'floor', 'points'])));
        stageNavigationRef.current = { key: stageRouteKey, stage: 'floor' };
        const nextParams = new URLSearchParams(window.location.search);
        nextParams.set('stage', 'floor');
        nextParams.set('ready', '1');
        nextParams.delete('editor');
        window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`);
        setStage('floor');
        setTool('select');
        setSpaceEditorOpen(false);
        persistDesignStage('floor');
        return;
      }
      if (stage === 'logic') {
        setCompletedStages(prev => Array.from(new Set([...prev, 'floor', 'points', 'logic'])));
        applyStage('review');
        return;
      }
      if (stage === 'review') {
        setCompletedStages(prev => Array.from(new Set([...prev, 'floor', 'points', 'logic', 'review'])));
        persistDesignStage('review');
      }
    }, 700);
  };

  const handleCreateProject = () => {
    if (creatingProject) return;
    setCreatingProject(true);
    const nextProject = createCubixProject('Untitled');
    const nextParams = new URLSearchParams();
    nextParams.set('entry', isPersonal ? 'personal' : 'pro');
    nextParams.set('demo_as', isPersonal ? 'builder' : 'pro');
    nextParams.set('workflow', 'space');
    nextParams.set(isPersonal ? 'solution' : 'project', nextProject.id);
    nextParams.set('stage', 'floor');
    nextParams.set('guide', '1');
    window.setTimeout(() => {
      window.location.assign(`/build?${nextParams.toString()}`);
    }, 500);
  };

  const handleCreateRemix = () => {
    const sourceTitle = sourceProject?.title ?? project.title;
    const remixTitle = `${sourceTitle} Remix`;
    const nextProject = createCubixProject(remixTitle, {
      country: sourceProject?.country,
      countryLabel: sourceProject?.countryLabel,
      buildingType: sourceProject?.buildingType,
    });
    const sourceChain = sourceProject?.remixChain?.length
      ? sourceProject.remixChain
      : sourceProject?.id
        ? [sourceProject.id]
        : [];
    saveCubixLocalProject({
      ...nextProject,
      subtitle: remixBrief.trim() || `Remixed from ${sourceTitle}`,
      devices: Math.max(sourceDeviceCount ?? 0, project.devicesList.length),
      personas: Math.max(automationScenes.length, sourceProject?.personas ?? 0),
      designStage: 'review',
      solutionStatus: 'editing',
      remixSourceId: sourceProject?.id ?? null,
      remixChain: [...sourceChain, nextProject.id],
      linkedSolutionId: nextProject.id,
      linkedSolutionName: remixTitle,
      floorPlans: sourceProject?.floorPlans,
      buildingName: sourceProject?.buildingName ?? buildingName,
      updatedAt: 'just now',
    });
    setRemixDialogOpen(false);
    const nextParams = new URLSearchParams();
    nextParams.set('entry', 'personal');
    nextParams.set('demo_as', 'builder');
    nextParams.set('solution', nextProject.id);
    nextParams.set('ready', '1');
    nextParams.set('stage', 'review');
    window.location.assign(`/build?${nextParams.toString()}`);
  };

  const handleOpenPublishSettings = () => {
    setPublishTitle(project.title);
    setPublishVisibility(sourceProject?.visibility === 'private' ? 'private' : 'public-remixable');
    setPublishDialogOpen(true);
  };

  const handlePostSolution = () => {
    setCompletedStages(prev => Array.from(new Set([...prev, 'floor', 'points', 'logic', 'review'])));
    if (sourceProject) {
      saveCubixLocalProject({
        ...sourceProject,
        title: publishTitle.trim() || project.title,
        status: 'active',
        visibility: publishVisibility === 'private' ? 'private' : 'published',
        solutionStatus: 'finalized',
        designStage: 'review',
        devices: project.devicesList.length || sourceProject.devices,
        personas: Math.max(automationScenes.length, sourceProject.personas ?? 0),
        updatedAt: 'just now',
      });
    }
    setPublishDialogOpen(false);
  };

  const finishFloorPlanSetup = (mode: FloorPlanMode, fileName?: string, previewUrl?: string) => {
    const readyParams = new URLSearchParams(window.location.search);
    readyParams.set('ready', '1');
    readyParams.set('editor', '1');
    readyParams.set('stage', 'floor');
    readyParams.delete('setup');
    readyParams.delete('guide');
    window.history.replaceState(null, '', `${window.location.pathname}?${readyParams.toString()}`);
    stageNavigationRef.current = { key: stageRouteKey, stage: 'floor' };
    setFloorPlanMode(mode);
    if (fileName) setUploadedPlanName(fileName);
    if (previewUrl) setFloorPlanPreviewUrl(previewUrl);
    if (mode !== 'uploaded') setFloorPlanPreviewUrl('');
    setUploadingFloorPlanPreviewUrl('');
    setFloorPlanImportOpen(false);
    setFloorPlanParsing(false);
    setScaleGuideOpen(true);
    setSpaceSetupState('ready');
    setSpaceEditorOpen(true);
    setStage('floor');
    setTool('select');
    setSelected(null);
    setSelectedFurniture(null);
    setRecommendedDevices([]);
    setCustomDevices([]);
    setDeviceOverrides({});
    const nextFloors = ['1F'];
    setFloors(nextFloors);
    setBuildings(prev => prev.map(building => (
      building.id === activeBuildingId ? { ...building, floors: nextFloors, plannedFloors: nextFloors } : building
    )));
    setActiveFloor('1F');
    setBuildingComposed(true);
    setCompletedStages([]);
    setLayers(prev => ({ ...prev, walls: true, furniture: true, devices: false, coverage: false, links: false }));
  };

  const handleUploadFloorPlan = (fileName: string, previewUrl?: string) => {
    setUploadedPlanName(fileName || 'Uploaded floor plan');
    setUploadingFloorPlanPreviewUrl(previewUrl ?? '');
    setSpaceSetupState('ready');
    setSpaceEditorOpen(true);
    setFloorPlanImportOpen(true);
    setFloorPlanParsing(true);
    window.setTimeout(() => finishFloorPlanSetup('uploaded', fileName || 'Uploaded floor plan', previewUrl), 1500);
  };

  const handleAddFloor = () => {
    const nextLabel = floors.length === 0
      ? 'Floor Plan 1'
      : floors.some(floor => floor.startsWith('Floor Plan'))
        ? `Floor Plan ${floors.length + 1}`
        : `${floors.length + 1}F`;
    setFloorPlanDraftName(nextLabel);
    setFloorPlanDraftFile('');
    setFloorPlanDraftPreviewUrl('');
    setFloorPlanUploadOpen(true);
  };

  const handleConfirmFloorPlanUpload = () => {
    const nextLabel = floorPlanDraftName.trim() || (floors.length === 0 ? 'Floor Plan 1' : `Floor Plan ${floors.length + 1}`);
    setFloors(prev => {
      const nextFloors = [...prev, nextLabel];
      setActiveFloor(nextLabel);
      setBuildings(current => current.map(building => (
        building.id === activeBuildingId ? { ...building, floors: nextFloors } : building
      )));
      return nextFloors;
    });
    setCompletedStages(prev => prev.filter(stageId => stageId !== 'floor'));
    setStage('floor');
    setTool('select');
    setUploadedPlanName(floorPlanDraftFile || nextLabel);
    setFloorPlanMode(floorPlanDraftFile ? 'uploaded' : 'demo');
    if (floorPlanDraftPreviewUrl) setFloorPlanPreviewUrl(floorPlanDraftPreviewUrl);
    setScaleGuideOpen(true);
    setSpaceEditorOpen(true);
    setFloorPlanUploadOpen(false);
  };

  const handleOpenFloorAlignment = () => {
    setAlignFloorplansOpen(true);
  };

  const handleFinishFloorAlignment = () => {
    if (!floors.length) return;
    setAlignFloorplansOpen(false);
    setActiveFloor(prev => prev || floors[0] || '1F');
  };

  const persistBuildingName = (buildingId: string, nextName: string) => {
    const normalized = nextName.trim() || DEFAULT_BUILDING_NAME;
    setBuildings(prev => prev.map(building => (
      building.id === buildingId ? { ...building, name: normalized } : building
    )));
    if (buildingId === activeBuildingId) setBuildingName(normalized);
    if (!sourceProject) return;
    saveCubixLocalProject({
      ...sourceProject,
      buildingName: normalized,
      updatedAt: 'just now',
    });
  };

  const handleCreateBuilding = () => {
    const existingSequences = buildings.map(building => {
      const fromId = Number(building.id.replace(/^building-/, ''));
      const fromName = Number((building.name.match(/Building\s+(\d+)/)?.[1]) ?? 0);
      return Math.max(Number.isFinite(fromId) ? fromId : 0, Number.isFinite(fromName) ? fromName : 0);
    });
    const nextSequence = Math.max(buildingSequence, 1, ...existingSequences) + 1;
    const nextName = `Building ${nextSequence}`;
    const nextId = `building-${nextSequence}`;
    const nextFloors: string[] = [];
    setBuildingSequence(nextSequence);
    setBuildings(prev => [...prev, { id: nextId, name: nextName, floors: nextFloors, plannedFloors: [] }]);
    setActiveBuildingId(nextId);
    setBuildingName(nextName);
    setFloors(nextFloors);
    setActiveFloor('');
    setSelected(null);
    setSelectedFurniture(null);
    setRecommendedDevices([]);
    setCustomDevices([]);
    setDeviceOverrides({});
    setCompletedStages([]);
    setTool('select');
    setStage('floor');
    setLayers(prev => ({ ...prev, walls: true, furniture: true, devices: false, coverage: false, links: false }));
    if (sourceProject) {
      saveCubixLocalProject({
        ...sourceProject,
        buildingName: nextName,
        designStage: 'floor',
        solutionStatus: 'editing',
        devices: 0,
        updatedAt: 'just now',
      });
    }
  };

  const handleSelectBuilding = (buildingId: string) => {
    const nextBuilding = buildings.find(building => building.id === buildingId);
    if (!nextBuilding) return;
    setActiveBuildingId(buildingId);
    setBuildingName(nextBuilding.name);
    setFloors(nextBuilding.floors);
    setActiveFloor(nextBuilding.floors[0] ?? '');
    setSelected(null);
    setSelectedFurniture(null);
  };

  const handlePlaceDevice = (template: DeviceTemplate, x = 58, y = 48, options?: { select?: boolean }) => {
    const nextIndex = customDevices.length + 1;
    const nextName = `${template.name} ${nextIndex}`;
    const nextDevice: DevicePoint = {
      pointCode: `${template.category.toUpperCase()}-${nextIndex.toString().padStart(2, '0')}`,
      name: nextName,
      model: template.model,
      type: template.type,
      room: roomAtPoint(activeFloor, x, y),
      x,
      y,
      status: 'suggested',
      channel: template.channel,
      power: template.install,
      automations: 0,
      coverage: '待 AI 推理',
      online: false,
    };
    setCustomDevices(prev => [...prev, nextDevice]);
    if (options?.select !== false) setSelected(nextName);
    setSelectedFurniture(null);
    setDeviceLibraryOpen(false);
    setTool('devices');
    setStage('points');
    setDirty(true);
  };

  const startDevicePlacement = (device: DeviceTemplate, quantity = 1) => {
    setPlacementBatch({ device, remaining: Math.max(1, quantity) });
    setDeviceLibraryOpen(false);
    setSelected(null);
    setSelectedFurniture(null);
    setTool('devices');
    setStage('points');
    setLayers(prev => ({ ...prev, devices: true, coverage: false, links: false }));
  };

  const placePlacementDevice = (x: number, y: number) => {
    if (!placementBatch) return;
    const isLast = placementBatch.remaining <= 1;
    handlePlaceDevice(placementBatch.device, x, y, { select: isLast });
    setPlacementBatch(prev => {
      if (!prev) return null;
      if (prev.remaining <= 1) return null;
      return { ...prev, remaining: prev.remaining - 1 };
    });
  };

  const handlePlaceSelectedDevices = () => {
    const rooms = roomsForFloor(activeFloor);
    const selectedTemplates = selectedDeviceItems.flatMap(({ device, quantity }) => (
      Array.from({ length: quantity }).map(() => device)
    ));
    if (!selectedTemplates.length || !rooms.length) return;
    const roomSlotCounts = new Map<string, number>();
    const startIndex = customDevices.length;
    const nextDevices = selectedTemplates.map((device, placementIndex) => {
      const room = rooms[placementIndex % rooms.length];
      const roomSlotIndex = roomSlotCounts.get(room.id) ?? 0;
      roomSlotCounts.set(room.id, roomSlotIndex + 1);
      const point = placementPointForRoom(room, roomSlotIndex);
      const nextIndex = startIndex + placementIndex + 1;
      return {
        pointCode: `${device.category.toUpperCase()}-${nextIndex.toString().padStart(2, '0')}`,
        name: `${device.name} ${nextIndex}`,
        model: device.model,
        type: device.type,
        room: room.label,
        x: point.x,
        y: point.y,
        status: 'suggested' as const,
        channel: device.channel,
        power: device.install,
        automations: 0,
        coverage: '待 AI 推理',
        online: false,
      };
    });
    setCustomDevices(prev => [...prev, ...nextDevices]);
    setSelected(nextDevices[nextDevices.length - 1]?.name ?? null);
    setSelectedFurniture(null);
    setDeviceLibraryOpen(false);
    setTool('devices');
    setStage('points');
    setLayers(prev => ({ ...prev, devices: true, coverage: false, links: false }));
    setDirty(true);
  };

  const openDeviceLibrary = () => {
    setSelected(null);
    setSelectedFurniture(null);
    setTool('devices');
    setDeviceLibraryOpen(true);
  };

  const toggleDeviceLibrary = () => {
    setSelected(null);
    setSelectedFurniture(null);
    setDeviceLibraryOpen(prev => {
      const nextOpen = !prev;
      setTool(nextOpen ? 'devices' : 'select');
      return nextOpen;
    });
  };

  const deriveAgentDeviceQuantities = (prompt = '') => {
    const lowerPrompt = prompt.toLowerCase();
    const next: Record<string, number> = {
      ...GUIDE_RECOMMENDED_QUANTITIES,
      ...selectedDeviceQuantities,
    };
    if (prompt.includes('安防') || prompt.includes('门窗') || lowerPrompt.includes('security')) {
      next['p1-door'] = Math.max(next['p1-door'] ?? 0, 5);
      next['g5-pro-poe'] = Math.max(next['g5-pro-poe'] ?? 0, 2);
      next['u100-lock'] = Math.max(next['u100-lock'] ?? 0, 1);
    }
    if (prompt.includes('起夜') || prompt.includes('老人') || prompt.includes('夜间') || lowerPrompt.includes('elder')) {
      next.fp2 = Math.max(next.fp2 ?? 0, 3);
      next['p1-motion'] = Math.max(next['p1-motion'] ?? 0, 4);
      next['ceiling-t1'] = Math.max(next['ceiling-t1'] ?? 0, 4);
    }
    if (prompt.includes('观影') || prompt.includes('窗帘') || lowerPrompt.includes('movie')) {
      next['c3-curtain'] = Math.max(next['c3-curtain'] ?? 0, 2);
      next['z1-pro-switch'] = Math.max(next['z1-pro-switch'] ?? 0, 2);
    }
    if (prompt.includes('低预算') || prompt.includes('更低预算') || lowerPrompt.includes('budget')) {
      next.fp2 = Math.min(next.fp2 ?? 0, 2);
      next['g5-pro-poe'] = Math.min(next['g5-pro-poe'] ?? 0, 1);
      next['ceiling-t1'] = Math.min(next['ceiling-t1'] ?? 0, 2);
      delete next['z1-pro-switch'];
    }
    return Object.fromEntries(Object.entries(next).filter(([, quantity]) => quantity > 0));
  };

  const virtualDevicesFromQuantities = (quantities: Record<string, number>, prompt = ''): DevicePoint[] => {
    const rooms = ['Living', 'Bedroom', 'Foyer', 'Kitchen', 'Balcony', 'Study'];
    return DEVICE_LIBRARY.flatMap(template => {
      const quantity = quantities[template.id] ?? 0;
      return Array.from({ length: quantity }).map((_, index) => {
        const globalIndex = DEVICE_LIBRARY.findIndex(item => item.id === template.id) + index;
        return {
          pointCode: `AI-${template.category.toUpperCase()}-${(index + 1).toString().padStart(2, '0')}`,
          name: `${template.name} · Virtual ${index + 1}`,
          model: template.model,
          type: template.type,
          room: rooms[(globalIndex + index) % rooms.length] ?? 'Living',
          x: 22 + ((globalIndex * 11 + index * 9) % 60),
          y: 20 + ((globalIndex * 13 + index * 7) % 58),
          status: 'pending' as const,
          channel: template.channel,
          power: template.install,
          automations: 0,
          coverage: 'AI 预布点',
          online: false,
          note: prompt ? `由 Agent 根据「${prompt.slice(0, 24)}」生成` : '由 Agent 根据户型与 Selected Devices 生成',
        };
      });
    });
  };

  const handleRecommendDevices = (prompt = '') => {
    const nextQuantities = deriveAgentDeviceQuantities(prompt);
    setSelectedDeviceQuantities(nextQuantities);
    setRecommendedDevices(virtualDevicesFromQuantities(nextQuantities, prompt));
    setSelected(null);
    setSelectedFurniture(null);
    setDeviceLibraryOpen(false);
    setTool('devices');
    setStage('points');
    setLayers(prev => ({ ...prev, devices: true, coverage: true, links: false }));
    setDirty(true);
  };

  const handleGenerateAutomations = () => {
    setAutomationScenes(prev => prev.length ? prev : AI_GENERATED_AUTOMATIONS);
    setActiveAutomationId(null);
    setTool('agent');
    setDirty(true);
  };

  const runVisualization = () => {
    setRenderJob('queued');
    window.setTimeout(() => setRenderJob('rendering'), 500);
    window.setTimeout(() => {
      setRenderJob('ready');
      setCompletedStages(prev => prev.includes('visualize') ? prev : [...prev, 'visualize']);
    }, 1400);
  };

  const handleConfirmSolution = () => {
    setCompletedStages(prev => Array.from(new Set([...prev, 'floor', 'points', 'logic', 'review'])));
    if (sourceProject) {
      saveCubixLocalProject({
        ...sourceProject,
        status: 'active',
        solutionStatus: 'finalized',
        designStage: 'review',
        subtitle: '方案已确认 · 可部署到 Studio',
        devices: project.devicesList.length || sourceProject.devices,
        updatedAt: 'just now',
      });
    }
    window.setTimeout(() => {
      window.location.assign(navigation.manageHref);
    }, 450);
  };

  const updateConfig = (nextConfig: Partial<CanvasConfig>) => {
    setCanvasConfig(prev => ({ ...prev, ...nextConfig }));
  };

  const beginEdit = () => {
    setEditSnapshot({ deviceOverrides });
    setEditMode(true);
  };

  const requestExitEdit = () => {
    if (dirty) {
      setExitEditDialogOpen(true);
      return;
    }
    setEditMode(false);
    setEditSnapshot(null);
  };

  const confirmExitEdit = () => {
    if (editSnapshot) {
      setDeviceOverrides(editSnapshot.deviceOverrides);
    }
    setDirty(false);
    setEditMode(false);
    setExitEditDialogOpen(false);
    setSelected(null);
    setEditSnapshot(null);
  };

  const handleToggleEdit = () => {
    if (editMode) {
      requestExitEdit();
      return;
    }
    beginEdit();
  };

  const handleToolChange = (nextTool: ToolId) => {
    if (nextTool === 'logic') setConfigOpen(false);
    setTool(nextTool);
    setLayers(prev => {
      if (nextTool === 'walls') {
        return { ...prev, walls: true, furniture: true, coverage: false, links: false };
      }
      if (nextTool === 'room') {
        return { ...prev, walls: true, furniture: true, coverage: false, links: false };
      }
      if (nextTool === 'devices') {
        return { ...prev, devices: true, coverage: false, links: false };
      }
      if (nextTool === 'coverage') {
        return { ...prev, devices: true, coverage: true, links: false };
      }
      if (nextTool === 'logic') {
        return { ...prev, devices: true, coverage: true, links: true };
      }
      if (nextTool === 'select') {
        return { ...prev, links: false };
      }
      if (nextTool === 'pan' || nextTool === 'comment') {
        return { ...prev, links: false };
      }
      return prev;
    });
  };

  const applyStage = (nextStage: StageId) => {
    stageNavigationRef.current = { key: stageRouteKey, stage: nextStage };
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set('stage', nextStage);
    nextParams.set('ready', '1');
    nextParams.delete('setup');
    nextParams.delete('guide');
    if (nextStage !== 'floor' && nextStage !== 'points') nextParams.delete('editor');
    window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`);
    setStage(nextStage);
    if (nextStage !== 'logic') setActiveAutomationId(null);
    if (nextStage !== 'floor' && nextStage !== 'points') setSpaceEditorOpen(false);
    persistDesignStage(nextStage);
    if (nextStage === 'floor') {
      setTool('select');
      setLayers(prev => ({ ...prev, walls: true, furniture: true, coverage: false, links: false }));
      return;
    }
    if (nextStage === 'points') {
      setTool('devices');
      setLayers(prev => ({ ...prev, devices: true, coverage: false, links: false }));
      return;
    }
    if (nextStage === 'logic') {
      setTool('agent');
      setLayers(prev => ({ ...prev, devices: true, coverage: true, links: false }));
      return;
    }
    if (nextStage === 'visualize') {
      setTool('visualize');
      return;
    }
    if (nextStage === 'review') {
      setTool('agent');
      setLayers(prev => ({ ...prev, devices: true, coverage: true, links: true }));
      return;
    }
    if (nextStage === 'deploy') {
      setTool('devices');
      setLayers(prev => ({ ...prev, devices: true, coverage: false, links: true }));
      return;
    }
    handleToolChange('select');
  };

  const canSelectStage = (nextStage: StageId) => {
    const nextIndex = stages.findIndex(item => item.id === nextStage);
    const currentIndex = stages.findIndex(item => item.id === stage);
    if (nextIndex <= currentIndex || nextIndex <= 0) return true;
    const previousStage = stages[nextIndex - 1];
    if (nextStage === 'review') return completedStages.includes('logic') || completedStages.includes('visualize');
    return Boolean(previousStage && completedStages.includes(previousStage.id));
  };

  const handleStageChange = (nextStage: StageId) => {
    if (!canSelectStage(nextStage)) return;
    applyStage(nextStage);
  };

  const handleSolutionModuleChange = (moduleId: SolutionModuleId) => {
    setSelected(null);
    setSelectedFurniture(null);
    setActiveAutomationId(null);
    setDeviceLibraryOpen(false);
    setConfigOpen(false);
    setFloorPlanImportOpen(false);
    setFloorPlanParsing(false);
    setSpaceEditorOpen(false);
    if (moduleId === 'planning') {
      stageNavigationRef.current = { key: stageRouteKey, stage: 'floor' };
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.set('stage', 'floor');
      nextParams.delete('ready');
      nextParams.set('guide', '1');
      window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`);
      setStage('floor');
      setTool('select');
      setSpaceSetupState('guide');
      return;
    }
    setSpaceSetupState('ready');
    if (moduleId === 'space') {
      applyStage('floor');
      return;
    }
    if (moduleId === 'scene') {
      applyStage('logic');
      return;
    }
    if (moduleId === 'confirm') {
      applyStage('review');
      return;
    }
  };

  const handleWorkflowBack = () => {
    if (workflow === 'space' && !isVisualizationMode) {
      setExitSolutionDialogOpen(true);
      return;
    }
    window.location.assign(navigation.backHref);
  };

  const confirmExitSolution = () => {
    setExitSolutionDialogOpen(false);
    window.location.assign(navigation.manageHref);
  };

  const handleEnterSpaceEditor = () => {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set('ready', '1');
    nextParams.set('stage', 'floor');
    nextParams.set('editor', '1');
    nextParams.delete('setup');
    nextParams.delete('guide');
    window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`);
    stageNavigationRef.current = { key: stageRouteKey, stage: 'floor' };
    setSpaceEditorOpen(true);
    setFloorPlanImportOpen(!hasImportedFloorPlan);
    setFloorPlanParsing(false);
    setTool('select');
    setSelected(null);
    setSelectedFurniture(null);
  };

  const handleExitSpaceEditor = () => {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.delete('editor');
    window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`);
    setSpaceEditorOpen(false);
    setSelected(null);
    setSelectedFurniture(null);
    setDeviceLibraryOpen(false);
    setConfigOpen(false);
    if (tool === 'devices' || tool === 'coverage' || tool === 'walls' || tool === 'room') setTool('select');
  };

  const handleContinueFromSpaceDesign = () => {
    if (activeFloor) {
      setBuildings(prev => prev.map(building => {
        if (building.id !== activeBuildingId || building.plannedFloors.includes(activeFloor)) return building;
        return { ...building, plannedFloors: [...building.plannedFloors, activeFloor] };
      }));
    }
    setCompletedStages(prev => Array.from(new Set([...prev, 'floor', 'points'])));
    applyStage('logic');
  };

  const completeStage = (stageId: StageId, nextStage?: StageId) => {
    if (stageId === 'floor' && activeFloor) {
      setBuildings(prev => prev.map(building => {
        if (building.id !== activeBuildingId || building.plannedFloors.includes(activeFloor)) return building;
        return { ...building, plannedFloors: [...building.plannedFloors, activeFloor] };
      }));
    }
    setCompletedStages(prev => prev.includes(stageId) ? prev : [...prev, stageId]);
    if (nextStage) applyStage(nextStage);
  };

  const handleDeviceSelect = (name: string) => {
    setSelected(name);
    setSelectedFurniture(null);
    if (tool === 'select' || tool === 'walls') {
      setTool('devices');
      setStage('points');
    }
  };

  const handleFurnitureSelect = (id: string) => {
    setSelected(null);
    setSelectedFurniture(id);
  };

  const handleSelectFloor = (floor: string) => {
    setActiveFloor(floor);
    setSelected(null);
    setSelectedFurniture(null);
  };

  const handleNudgeDevice = (name: string, dx: number, dy: number) => {
    if (!editMode) return;
    const current = project.devicesList.find(device => device.name === name);
    if (!current) return;
    setDeviceOverrides(prev => {
      const existing = prev[name] ?? { x: current.x, y: current.y };
      return {
        ...prev,
        [name]: {
          x: Math.min(98, Math.max(2, existing.x + dx)),
          y: Math.min(96, Math.max(4, existing.y + dy)),
        },
      };
    });
    setDirty(true);
  };

  const handleMoveDevice = (name: string, x: number, y: number) => {
    setDeviceOverrides(prev => ({
      ...prev,
      [name]: {
        x: Math.min(98, Math.max(2, x)),
        y: Math.min(96, Math.max(4, y)),
      },
    }));
    setDirty(true);
  };

  if (!mounted) return <BuildFallback />;
  if (!isSignedIn) return <Launcher />;

  return (
    <main className="h-screen overflow-hidden bg-bg text-text">
      {!isVisualizationMode && !isImmersiveEditorMode ? (
      <header className="grid h-14 grid-cols-[420px_minmax(0,1fr)_300px] items-center border-b border-border bg-bg-elevated/95 px-3 shadow-sm shadow-slate-300/60 dark:shadow-black/30">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href={navigation.manageHref}
            className="group flex h-9 shrink-0 items-center gap-2 rounded-lg border border-transparent px-2 transition hover:border-border hover:bg-bg-subtle"
            title={usesSolutionLibrary ? (isPersonal ? 'Design Platform · 我的方案' : 'Design Platform · 项目') : 'Design Platform'}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 shadow-sm shadow-blue-200">
              <AqaraMark size={16} />
            </span>
            <span className="text-[13px] font-semibold leading-tight text-text">
              Design Platform
            </span>
          </Link>
          <span className="h-5 w-px bg-border" />
          <button onClick={handleWorkflowBack} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-muted transition hover:border-border-strong hover:text-text" title={workflow === 'space' ? 'Back to Solutions' : `返回${navigation.backLabel}`}>
            <ArrowLeft size={13} />
          </button>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-text">{headerTitle}</span>
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[10px] font-medium text-text-subtle">
              {headerMeta.map(item => <span key={item}>{item}</span>)}
            </div>
          </div>
        </div>

        {isPersonaMode && !isLifeMode ? (
          <div className="mx-auto flex h-8 items-center rounded-lg border border-border bg-bg-subtle px-3 text-[11px] font-semibold text-text-muted">
            成员看板
          </div>
        ) : workflow === 'space' && !isDeploymentMode ? (
          <SolutionModuleTabs activeModule={activeSolutionModule} onModuleChange={handleSolutionModuleChange} />
        ) : isLifeMode ? (
          <div />
        ) : (
          <BuildStepper
            stages={stages}
            activeStage={visibleStepperStage}
            completion={completion}
            completedStages={completedStages}
            onStageChange={handleStageChange}
          />
	        )}

        <div className="flex items-center justify-end gap-2">
          {isPersonaMode && studioOptions.length ? (
            <label className="relative flex h-8 min-w-[230px] items-center rounded-lg border border-border bg-bg-elevated pl-2 pr-7 text-xs font-semibold text-text-muted">
              <Wifi size={13} className="mr-2 shrink-0 text-blue-600" />
              <select
                value={selectedStudioId}
                onChange={event => handleStudioChange(event.target.value)}
                className="min-w-0 flex-1 appearance-none truncate bg-transparent outline-none"
                title="切换 Studio"
              >
                {studioOptions.map(({ studio, workspace }) => {
                  const health = HEALTH_META[studio.health];
                  return (
                    <option key={studio.id} value={studio.id}>
                      {workspace.name} / {studio.name} · {studio.online}/{studio.devices} 在线 · {health.label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2 text-text-subtle" />
            </label>
          ) : null}
          {usesSolutionLibrary ? (
            <>
              <Link href={navigation.manageHref} className="flex h-8 items-center rounded-lg border border-border bg-bg-elevated px-3 text-xs font-semibold text-text-muted transition hover:border-border-strong hover:text-text">
                {isPersonal ? '我的方案' : '项目'}
              </Link>
              <button
                onClick={handleCreateProject}
                disabled={creatingProject}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-3 text-xs font-semibold text-text-muted transition hover:border-border-strong hover:text-text disabled:cursor-wait disabled:opacity-70"
              >
                {creatingProject ? <Loader2 size={12} className="animate-spin text-blue-600" /> : null}
                {creatingProject ? 'Loading' : '新建'}
              </button>
            </>
          ) : !isLifeMode ? (
            <Link href="/home/build" className="flex h-8 items-center rounded-lg border border-border bg-bg-elevated px-3 text-xs font-semibold text-text-muted transition hover:border-border-strong hover:text-text">
              创作台
            </Link>
          ) : null}
          {primaryActionLabel && !isLifeMode && !isSpaceSetupMode && !isDeploymentMode && !isSpaceDesignModuleMode ? (
            <button
              onClick={isPersonaMode ? undefined : handleSave}
              disabled={saving || stage === 'deploy'}
              className={cn(
                'flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700',
                (saving || stage === 'deploy') && 'cursor-not-allowed bg-blue-300 hover:bg-blue-300'
              )}
              title={primaryActionLabel}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : stage === 'review' || stage === 'deploy' ? <Radio size={14} /> : <Save size={14} />}
              {primaryActionLabel}
            </button>
          ) : null}
        </div>
      </header>
      ) : null}

      <div className={cn('grid', isVisualizationMode || isImmersiveEditorMode ? 'h-screen' : 'h-[calc(100vh-56px)]', hasInspector ? 'grid-cols-[minmax(0,1fr)_360px]' : 'grid-cols-[minmax(0,1fr)]')}>
        <section className="relative min-w-0 overflow-hidden bg-bg-subtle">
          {requestedPro && isPersonal ? (
            <div className="absolute left-4 top-4 z-20 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700 shadow-sm">
              当前为个人方案
            </div>
          ) : null}
          {isSpaceSetupMode ? (
            <SpaceSetupCanvas
              state={spaceSetupState}
              uploadedPlanName={uploadedPlanName}
              uploadingPreviewUrl={uploadingFloorPlanPreviewUrl}
              selectedQuantities={selectedDeviceQuantities}
              onQuantityChange={updateSelectedDeviceQuantity}
              onUseRecommendation={handleUseGuideRecommendation}
              onContinuePlanning={handleContinueFromGuide}
              onSkipPlanning={handleSkipGuide}
              onUpload={handleUploadFloorPlan}
              onUseExisting={() => finishFloorPlanSetup('existing', 'Existing floor plan')}
              onTryDemo={() => finishFloorPlanSetup('demo', 'Demo floor plan')}
            />
          ) : isVisualizationMode ? (
            <ClientVisualizationCanvas
              project={project}
              renderJob={renderJob}
              returnHref={isPersonal ? '/home/build?demo_as=builder' : '/pro/workshop'}
              onRunRender={runVisualization}
              onOpenReview={() => completeStage('logic', 'review')}
            />
          ) : isLifeMode ? (
            <LifeDashboardCanvas project={project} sourceProject={sourceProject} />
          ) : isPersonaMode ? (
            <PersonaReviewCanvas project={project} isPro={isPro} />
          ) : isAutomationEditorMode ? (
            <AutomationEditorCanvas
              project={project}
              activeFloor={activeFloor}
              floorPlanPreviewUrl={floorPlanPreviewUrl}
              scenes={automationScenes}
              activeSceneId={activeAutomationId}
              onOpenScene={setActiveAutomationId}
              onBackToList={() => setActiveAutomationId(null)}
              onEditSpace={() => {
                applyStage('floor');
                setSpaceEditorOpen(true);
              }}
              onSaveScene={() => setActiveAutomationId(null)}
              onGenerateAutomation={handleGenerateAutomations}
            />
          ) : isSolutionOverviewMode ? (
            <SolutionOverviewCanvas
              project={project}
              automationScenes={automationScenes}
              floorPlanPreviewUrl={floorPlanPreviewUrl}
              completedStages={completedStages}
              readOnly={isSharedSolutionView}
              onPost={handleOpenPublishSettings}
              onEditSpace={() => {
                applyStage('floor');
                setSpaceEditorOpen(false);
              }}
              onEditAutomation={() => applyStage('logic')}
              onRemix={() => setRemixDialogOpen(true)}
            />
          ) : isDeploymentMode ? (
            <DeploymentMatchingCanvas project={project} isPro={isPro} floorPlanPreviewUrl={floorPlanPreviewUrl} />
          ) : isSpaceDesignStatementMode ? (
            <SpaceDesignStatementCanvas
              project={project}
              activeFloor={activeFloor}
              uploadedPlanName={uploadedPlanName}
              floorPlanPreviewUrl={floorPlanPreviewUrl}
              hasSpacePlan={hasSpacePlan}
              spacePlanName={spacePlanName}
              selectedDeviceCount={selectedDeviceItems.reduce((sum, item) => sum + item.quantity, 0)}
              onEnterEditor={handleEnterSpaceEditor}
              onNext={handleContinueFromSpaceDesign}
            />
          ) : (
            <>
              <DesignCanvas
                project={project}
                stage={stage}
                selected={selected}
                editMode={editMode}
                dirty={dirty}
                saving={saving}
                deviceLibraryOpen={deviceLibraryOpen}
                configOpen={configOpen}
                config={canvasConfig}
                activeTool={tool}
                overlayMode={overlayMode}
                floorPlanMode={floorPlanMode}
                uploadedPlanName={uploadedPlanName}
                floorPlanPreviewUrl={floorPlanPreviewUrl}
                scaleGuideOpen={scaleGuideOpen}
                floors={floors}
                activeFloor={activeFloor}
                activeFloorPlanned={activeFloorPlanned}
                buildingName={buildingName}
                buildings={buildings}
                activeBuildingId={activeBuildingId}
                buildingComposed={buildingComposed}
                alignFloorplansOpen={alignFloorplansOpen}
                layers={layers}
                onSelect={handleDeviceSelect}
                onToolChange={handleToolChange}
                onStageChange={handleStageChange}
                onOverlayChange={setOverlayMode}
                onAddFloor={handleAddFloor}
                onOpenFloorAlignment={handleOpenFloorAlignment}
                onFinishFloorAlignment={handleFinishFloorAlignment}
                onCancelFloorAlignment={() => setAlignFloorplansOpen(false)}
                onSelectFloor={handleSelectFloor}
                onSelectBuilding={handleSelectBuilding}
                onRenameBuilding={persistBuildingName}
                onCreateBuilding={handleCreateBuilding}
                onToggleLayer={(id) => setLayers(prev => ({ ...prev, [id]: !prev[id] }))}
                onToggleEdit={handleToggleEdit}
                onSaveDesign={handleSave}
                onExitEditor={handleExitSpaceEditor}
                onToggleConfig={() => setConfigOpen(prev => !prev)}
                onCloseDeviceLibrary={() => {
                  setDeviceLibraryOpen(false);
                  if (tool === 'devices' || tool === 'coverage') setTool('select');
                }}
                onOpenDeviceLibrary={toggleDeviceLibrary}
                onConfigChange={updateConfig}
                onResetConfig={() => {
                  setCanvasConfig(DEFAULT_CANVAS_CONFIG);
                }}
                completedStages={completedStages}
                onCompleteStage={completeStage}
                onRecommendDevices={handleRecommendDevices}
                selectedFurniture={selectedFurniture}
                onSelectFurniture={handleFurnitureSelect}
                onMoveDevice={handleMoveDevice}
                onPlaceDevice={handlePlaceDevice}
                placementBatch={placementBatch}
                onPlacePlacementDevice={placePlacementDevice}
                onCancelPlacement={() => setPlacementBatch(null)}
                onConfirmScale={() => setScaleGuideOpen(false)}
              />
            </>
          )}

          {!isSpaceSetupMode && !isLifeMode && !isVisualizationMode && !isSolutionOverviewMode && !isDeploymentMode && !isSpaceDesignStatementMode && !activeAutomationId ? (
            <AgentThread
              isPro={isPro}
              selectedDevice={selectedDevice}
              project={project}
              activeTool={tool}
              workflow={isVisualizationMode ? 'visualization' : workflow}
              stage={stage}
              renderJob={renderJob}
              onClearSelection={() => {
                setSelected(null);
                setSelectedFurniture(null);
              }}
              onRecommendDevices={handleRecommendDevices}
              onOpenDeviceLibrary={openDeviceLibrary}
              onToolChange={handleToolChange}
              onCompleteStage={completeStage}
              onConfirmSolution={handleConfirmSolution}
              onRunRender={runVisualization}
              onGenerateAutomation={handleGenerateAutomations}
            />
          ) : null}

          {deviceLibraryOpen && !isSpaceSetupMode && !isSpaceDesignStatementMode ? (
            <DeviceLibraryDrawer
              onClose={() => setDeviceLibraryOpen(false)}
              selectedQuantities={selectedDeviceQuantities}
              onQuantityChange={updateSelectedDeviceQuantity}
              onPlaceSelected={handlePlaceSelectedDevices}
              onStartPlacement={startDevicePlacement}
              onClearSelected={() => setSelectedDeviceQuantities({})}
            />
          ) : null}
          {floorPlanImportOpen && isImmersiveSpaceEditorMode ? (
            <FloorPlanImportOverlay
              parsing={floorPlanParsing}
              uploadedPlanName={uploadedPlanName}
              uploadingPreviewUrl={uploadingFloorPlanPreviewUrl}
              onUpload={handleUploadFloorPlan}
              onUseExisting={() => finishFloorPlanSetup('existing', 'Existing floor plan')}
              onTryDemo={() => finishFloorPlanSetup('demo', 'Demo floor plan')}
              onClose={() => {
                if (floorPlanParsing) return;
                setFloorPlanImportOpen(false);
              }}
            />
          ) : null}
          {selectedDeviceItems.length > 0 && !deviceLibraryOpen && !hasInspector && !isSpaceSetupMode && !isSpaceDesignStatementMode && (stage === 'floor' || stage === 'points') ? (
            <SelectedDevicesPanel
              items={selectedDeviceItems}
              onPlaceSelected={handlePlaceSelectedDevices}
              onStartPlacement={startDevicePlacement}
              onClear={() => setSelectedDeviceQuantities({})}
            />
          ) : null}
        </section>

        {hasInspector && !isSpaceSetupMode && !isSpaceDesignStatementMode && !isSolutionOverviewMode && !isDeploymentMode ? (
          <PropertyPanel
            selectedDevice={selectedDevice}
            selectedFurniture={selectedFurnitureProduct}
            activeTool={tool}
            editMode={editMode}
            activeFloor={activeFloor}
            onClose={() => {
              setSelected(null);
              setSelectedFurniture(null);
            }}
            onNudge={(dx, dy) => {
              if (selectedDevice) handleNudgeDevice(selectedDevice.name, dx, dy);
            }}
          />
        ) : null}
      </div>
      {exitEditDialogOpen ? (
        <UnsavedEditDialog
          onContinue={() => setExitEditDialogOpen(false)}
          onExit={confirmExitEdit}
        />
      ) : null}
      {exitSolutionDialogOpen ? (
        <BackToSolutionsDialog
          projectTitle={project.title}
          dirty={dirty}
          onCancel={() => setExitSolutionDialogOpen(false)}
          onConfirm={confirmExitSolution}
        />
      ) : null}
      {floorPlanUploadOpen ? (
        <UploadFloorPlanDialog
          name={floorPlanDraftName}
          fileName={floorPlanDraftFile}
          onNameChange={setFloorPlanDraftName}
          onFileChange={(file) => {
            setFloorPlanDraftFile(file.name);
            setFloorPlanDraftPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
          }}
          onCancel={() => setFloorPlanUploadOpen(false)}
          onConfirm={handleConfirmFloorPlanUpload}
        />
      ) : null}
      {creatingProject ? <SolutionCreatingOverlay /> : null}
      {remixDialogOpen ? (
        <RemixSolutionDialog
          sourceTitle={sourceProject?.title ?? project.title}
          brief={remixBrief}
          onBriefChange={setRemixBrief}
          onCancel={() => setRemixDialogOpen(false)}
          onCreate={handleCreateRemix}
        />
      ) : null}
      {publishDialogOpen ? (
        <PostSolutionSettingsDialog
          project={project}
          title={publishTitle}
          visibility={publishVisibility}
          floorPlanPreviewUrl={floorPlanPreviewUrl}
          automationSceneCount={automationScenes.length}
          onTitleChange={setPublishTitle}
          onVisibilityChange={setPublishVisibility}
          onCancel={() => setPublishDialogOpen(false)}
          onPost={handlePostSolution}
        />
      ) : null}
    </main>
  );
}

function BuildStepper({
  stages,
  activeStage,
  completion,
  completedStages,
  onStageChange,
}: {
  stages: Array<{ id: StageId; label: string }>;
  activeStage: StageId;
  completion: number;
  completedStages: StageId[];
  onStageChange: (stage: StageId) => void;
}) {
  const activeIndex = Math.max(0, stages.findIndex(item => item.id === activeStage));

  return (
    <div className="mx-auto flex h-10 min-w-0 items-center rounded-full border border-border bg-bg-subtle px-3">
      {stages.map((item, index) => {
        const active = activeStage === item.id;
        const done = completedStages.includes(item.id);
        const previousDone = index === 0 || completedStages.includes(stages[index - 1]!.id);
        const locked = !active && !done && index > activeIndex && !previousDone;
        return (
          <div key={item.id} className="flex items-center">
            {index > 0 ? <span className={cn('mx-1 h-px w-6', done || active ? 'bg-slate-900/70' : 'bg-border')} /> : null}
            <button
              onClick={() => onStageChange(item.id)}
              disabled={locked}
              className={cn(
                'group flex h-8 min-w-0 items-center gap-2 rounded-full px-2 text-left transition',
                active ? 'bg-bg-elevated text-text shadow-sm' : done ? 'text-text hover:bg-bg-elevated/70' : 'text-text-muted hover:bg-bg-elevated/70 hover:text-text',
                locked && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-text-muted'
              )}
              title={`Step ${index + 1} · ${item.label}`}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : done
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-border bg-bg text-text-subtle'
                )}
              >
                {done ? <CheckCircle2 size={13} /> : index + 1}
              </span>
              <span className="max-w-[72px] truncate text-[10px] font-semibold lg:max-w-[96px] lg:text-[11px]">{item.label}</span>
            </button>
          </div>
        );
      })}
      <div className="mx-2 h-5 w-px bg-border" />
      <span className="shrink-0 px-1 text-[11px] font-semibold text-text-muted">{completion}%</span>
    </div>
  );
}

function SolutionModuleTabs({
  activeModule,
  onModuleChange,
}: {
  activeModule: SolutionModuleId;
  onModuleChange: (moduleId: SolutionModuleId) => void;
}) {
  const modules: Array<{ id: SolutionModuleId; label: string; icon: LucideIcon }> = [
    { id: 'planning', label: 'Planning', icon: Wand2 },
    { id: 'space', label: '空间设计', icon: Grid2X2 },
    { id: 'scene', label: '场景方案', icon: Zap },
    { id: 'confirm', label: '方案确认', icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto flex h-9 min-w-0 items-center rounded-xl border border-border bg-bg-subtle p-1">
      {modules.map(item => {
        const Icon = item.icon;
        const active = activeModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onModuleChange(item.id)}
            className={cn(
              'flex h-7 min-w-0 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition',
              active ? 'bg-bg-elevated text-blue-700 shadow-sm' : 'text-text-muted hover:bg-bg-elevated/70 hover:text-text'
            )}
            title={item.label}
          >
            <Icon size={13} />
            <span className="max-w-[76px] truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SolutionCreatingOverlay() {
  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-slate-950/20 p-4 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 shadow-2xl shadow-slate-950/15">
        <Loader2 size={17} className="animate-spin text-blue-600" />
        Loading
      </div>
    </div>
  );
}

function RemixSolutionDialog({
  sourceTitle,
  brief,
  onBriefChange,
  onCancel,
  onCreate,
}: {
  sourceTitle: string;
  brief: string;
  onBriefChange: (value: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/35 p-5 backdrop-blur-sm">
      <section className="w-full max-w-lg overflow-hidden rounded-[24px] border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/20">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles size={13} />
            Remix
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Got new ideas on this project? Remix it!</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            复制 “{sourceTitle}” 为你的可编辑项目。新项目会从方案确认页开始，方便先整体检查；如果要调整设备，进入空间规划卡片里的 Planning 即可重新规划。
          </p>
        </div>
        <div className="px-6 py-5">
          <label className="block text-sm font-semibold text-slate-700">你的改造想法</label>
          <textarea
            value={brief}
            onChange={event => onBriefChange(event.target.value)}
            placeholder="例如：降低预算、换成更少传感器、增加老人起夜场景..."
            className="mt-2 h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-300 focus:bg-white"
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {['从方案确认开始', '可调整 Planning', '可重做自动化'].map(item => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button onClick={onCancel} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700">
            取消
          </button>
          <button onClick={onCreate} className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700">
            Create Remix
          </button>
        </div>
      </section>
    </div>
  );
}

function PostSolutionSettingsDialog({
  project,
  title,
  visibility,
  floorPlanPreviewUrl,
  automationSceneCount,
  onTitleChange,
  onVisibilityChange,
  onCancel,
  onPost,
}: {
  project: ProjectModel;
  title: string;
  visibility: PublishVisibility;
  floorPlanPreviewUrl: string;
  automationSceneCount: number;
  onTitleChange: (value: string) => void;
  onVisibilityChange: (value: PublishVisibility) => void;
  onCancel: () => void;
  onPost: () => void;
}) {
  const visibilityOptions: Array<{ value: PublishVisibility; title: string; description: string }> = [
    { value: 'public-remixable', title: 'Public & Remixable', description: 'Anyone can view and remix.' },
    { value: 'public-view-only', title: 'Public & View Only', description: 'Anyone can view, no remix.' },
    { value: 'private', title: 'Private', description: 'Only friends with link you share can view.' },
  ];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]">
      <section className="relative flex max-h-[86vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/20 sm:max-h-[560px]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-lg font-semibold tracking-tight">Post Settings</h2>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <MiniFloorPlanPreview previewUrl={floorPlanPreviewUrl} label={`${title || project.title} thumbnail`} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-2.5 pb-2.5 pt-8 text-left">
                <div className="truncate text-xs font-semibold text-white">{title || project.title}</div>
                <div className="mt-0.5 text-[10px] text-white/75">{project.rooms} rooms · {project.devices} devices · {automationSceneCount} scenes</div>
              </div>
              <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/82 text-slate-800 shadow-sm backdrop-blur">
                <Maximize2 size={14} />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Solution thumbnail</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">Upload .jpg, .png, or .gif, max 2MB.</p>
              <button className="mt-2 h-7 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-600">
                Change thumbnail
              </button>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-700">Solution Name</span>
            <input
              value={title}
              onChange={event => onTitleChange(event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Name your solution"
            />
          </label>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">Visibility</h3>

            <div className="mt-2.5 grid gap-2">
              {visibilityOptions.map(option => {
                const active = visibility === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => onVisibilityChange(option.value)}
                    className={cn(
                      'group flex items-start gap-3 rounded-xl border p-2.5 text-left transition',
                      active ? 'border-blue-200 bg-blue-50/70' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition', active ? 'border-blue-600' : 'border-slate-300 group-hover:border-slate-400')}>
                      {active ? <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold leading-5 text-slate-900">{option.title}</span>
                      <span className="block text-xs leading-5 text-slate-500">{option.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
          <button onClick={onCancel} className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
            Cancel
          </button>
          <button onClick={onPost} className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700">
            Post Solution
          </button>
        </div>
      </section>
    </div>
  );
}

function BackToSolutionsDialog({
  projectTitle,
  dirty,
  onCancel,
  onConfirm,
}: {
  projectTitle: string;
  dirty: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/35 p-5 backdrop-blur-sm">
      <section className="w-full max-w-md overflow-hidden rounded-[22px] border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/20">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            <ArrowLeft size={13} />
            Back to Solutions
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">退出当前方案？</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            你将离开 “{projectTitle}” 并返回方案列表。之后可以从 My Solutions 再次进入空间设计、场景方案或方案确认。
          </p>
          {dirty ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-700">
              当前有未保存的编辑，退出前建议先保存方案。
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-2 bg-slate-50 px-6 py-4">
          <button onClick={onCancel} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700">
            取消
          </button>
          <button onClick={onConfirm} className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
            Back to Solutions
          </button>
        </div>
      </section>
    </div>
  );
}

function guideCategoryMatches(branchCategory: DeviceCategory, deviceCategory: DeviceCategory) {
  if (branchCategory === 'lock') return deviceCategory === 'lock' || deviceCategory === 'camera';
  if (branchCategory === 'switch') return deviceCategory === 'switch' || deviceCategory === 'light' || deviceCategory === 'curtain';
  return branchCategory === deviceCategory;
}

function CartoonGuideHouse({ selectedCount }: { selectedCount: number }) {
  return (
    <div className="relative h-[260px] w-[260px]">
      <div className="absolute inset-x-8 bottom-8 h-28 rounded-[18px] border border-blue-100 bg-blue-50 shadow-sm" />
      <div className="absolute left-10 top-16 h-28 w-44 rotate-45 rounded-[18px] border border-blue-100 bg-white shadow-sm" />
      <div className="absolute left-10 right-10 bottom-8 h-32 rounded-[18px] border border-slate-200 bg-white shadow-lg shadow-blue-100/60" />
      <div className="absolute left-20 bottom-8 h-20 w-12 rounded-t-[16px] border border-blue-200 bg-blue-600" />
      <div className="absolute right-20 bottom-24 h-11 w-11 rounded-[12px] border border-slate-200 bg-sky-50">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-200" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-slate-200" />
      </div>
      <div className="absolute left-8 top-7 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
        {selectedCount ? `已选 ${selectedCount}` : '待选择'}
      </div>
      <div className="absolute right-12 top-24 flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm">
        <Sparkles size={18} />
      </div>
      <div className="absolute bottom-2 left-16 h-4 w-32 rounded-full bg-blue-200/55 blur-md" />
    </div>
  );
}

function GuideConnectionLines({
  groups,
}: {
  groups: Array<{ items: Array<{ device: DeviceTemplate; quantity: number }> }>;
}) {
  const yPositions = [19, 38, 57, 76];
  return (
    <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M0 50 C10 50 10 19 18 19" fill="none" stroke="#bfdbfe" strokeWidth="0.4" />
      {groups.map((group, index) => {
        const y = yPositions[index] ?? 76;
        const active = group.items.length > 0;
        return (
          <g key={index}>
            <path
              d={`M0 50 C8 50 8 ${y} 18 ${y}`}
              fill="none"
              stroke={active ? '#2563eb' : '#cbd5e1'}
              strokeWidth={active ? '0.55' : '0.35'}
              strokeDasharray={active ? '0' : '2 2'}
            />
            <circle cx="18" cy={y} r="0.7" fill={active ? '#2563eb' : '#cbd5e1'} />
            {active ? <circle cx="18" cy={y} r="1.45" fill="rgba(37,99,235,0.12)" /> : null}
          </g>
        );
      })}
    </svg>
  );
}

function SpaceSetupCanvas({
  state,
  uploadedPlanName,
  uploadingPreviewUrl,
  selectedQuantities,
  onQuantityChange,
  onUseRecommendation,
  onContinuePlanning,
  onSkipPlanning,
  onUpload,
  onUseExisting,
  onTryDemo,
}: {
  state: SpaceSetupState;
  uploadedPlanName: string;
  uploadingPreviewUrl: string;
  selectedQuantities: Record<string, number>;
  onQuantityChange: (deviceId: string, delta: number) => void;
  onUseRecommendation: () => void;
  onContinuePlanning: () => void;
  onSkipPlanning: () => void;
  onUpload: (fileName: string, previewUrl?: string) => void;
  onUseExisting: () => void;
  onTryDemo: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [guideCategory, setGuideCategory] = useState<DeviceCategory | 'all'>('hub');
  const [guideSearch, setGuideSearch] = useState('');
  const selectedDevices = DEVICE_LIBRARY
    .map(device => ({ device, quantity: selectedQuantities[device.id] ?? 0 }))
    .filter(item => item.quantity > 0);
  const selectedCount = selectedDevices.reduce((sum, item) => sum + item.quantity, 0);
  const selectedGroups = GUIDE_PLANNING_BRANCHES.map(branch => ({
    ...branch,
    items: selectedDevices.filter(item => guideCategoryMatches(branch.category, item.device.category)),
  }));
  const filteredGuideDevices = DEVICE_LIBRARY.filter(device => {
    const categoryMatch = guideCategory === 'all' || device.category === guideCategory;
    const keyword = `${device.name} ${device.model} ${device.channel}`.toLowerCase();
    return categoryMatch && keyword.includes(guideSearch.toLowerCase());
  });
  const guideCategoryTabs: Array<{ id: DeviceCategory | 'all'; label: string; icon: LucideIcon }> = [
    { id: 'all', label: '全部', icon: Layers3 },
    { id: 'hub', label: '网关', icon: Wifi },
    { id: 'sensor', label: '传感', icon: Radar },
    { id: 'camera', label: '摄像机', icon: Camera },
    { id: 'lock', label: '门锁', icon: DoorOpen },
    { id: 'switch', label: '开关', icon: Zap },
    { id: 'light', label: '灯光', icon: Lightbulb },
    { id: 'curtain', label: '窗帘', icon: DoorOpen },
  ];
  const removeAllSelectedDevices = () => {
    selectedDevices.forEach(item => onQuantityChange(item.device.id, -item.quantity));
  };

  if (state === 'guide') {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#f4f7fb] text-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:38px_38px]" />
        <div className="relative z-10 grid h-full grid-cols-[340px_minmax(460px,1fr)_390px] gap-5 p-6">
          <aside className="relative flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
            <div className="relative z-10">
              <div className="text-base font-semibold tracking-tight text-slate-950">设备预选</div>
            </div>

            <div className="relative z-10 mt-10 flex flex-1 items-center justify-center">
              <CartoonGuideHouse selectedCount={selectedCount} />
            </div>

            <div className="relative z-10 mt-auto space-y-3">
              <div className="rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase text-slate-400">已选</div>
                <div className="mt-1 text-2xl font-semibold text-slate-950">{selectedCount}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onUseRecommendation}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  <Wand2 size={14} />
                  推荐
                </button>
                <button
                  onClick={onSkipPlanning}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                >
                  跳过
                </button>
              </div>
              <button
                onClick={onContinuePlanning}
                disabled={!selectedCount}
                className={cn(
                  'flex h-10 w-full items-center justify-center gap-2 rounded-md text-xs font-semibold transition',
                  selectedCount ? 'bg-slate-950 text-white hover:bg-slate-800' : 'cursor-not-allowed bg-slate-100 text-slate-400'
                )}
              >
                进入空间设计
                <ArrowLeft size={13} className="rotate-180" />
              </button>
            </div>

            <div className="pointer-events-none absolute -right-12 top-1/2 z-20 h-px w-20 bg-blue-500/80">
              <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_0_6px_rgba(37,99,235,0.12)]" />
              <span className="absolute left-2 top-0 h-px w-8 animate-pulse bg-blue-300" />
            </div>
          </aside>

          <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
            <GuideConnectionLines groups={selectedGroups} />
            <div className="relative z-10 mb-5 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-500">点位草案</div>
              <button
                onClick={onContinuePlanning}
                disabled={!selectedCount}
                className={cn(
                  'flex h-10 items-center gap-2 rounded-md px-4 text-xs font-semibold transition',
                  selectedCount ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700' : 'cursor-not-allowed bg-slate-100 text-slate-400'
                )}
              >
                上传户型
                <UploadCloud size={14} />
              </button>
            </div>

            <div className="relative z-10 min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto pb-2 pr-2">
              {selectedGroups.map((branch, index) => {
                const Icon = branch.icon;
                const active = guideCategory === branch.category;
                const count = branch.items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <div
                    key={branch.label}
                    className={cn(
                      'relative ml-8 w-[calc(100%_-_2rem)] rounded-[7px] border bg-white text-left transition',
                      active ? 'border-blue-500 shadow-sm shadow-blue-100' : 'border-slate-100 shadow-sm'
                    )}
                  >
                    <span className={cn('absolute -left-[37px] top-7 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-white', active ? 'bg-blue-600 ring-4 ring-blue-100' : count ? 'bg-slate-400' : 'bg-slate-300')} />
                    <button
                      onClick={() => setGuideCategory(branch.category)}
                      className="flex w-full items-center gap-4 border-b border-slate-100 px-4 py-3 text-left"
                    >
                      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md border', active ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-500')}>
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-sm font-semibold', count ? 'text-slate-900' : 'text-blue-600')}>{branch.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{branch.desc}</span>
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 text-blue-600">
                        <Plus size={14} />
                      </span>
                    </button>
                    {branch.items.length ? (
                      <div className="space-y-1 px-4 py-3">
                        {branch.items.map(({ device, quantity }) => (
                          <div key={device.id} className="flex h-9 items-center gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                              <DeviceIcon type={device.type} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{device.name}</span>
                            <span className="flex shrink-0 items-center rounded-md bg-slate-50">
                              <button
                                onClick={() => onQuantityChange(device.id, -1)}
                                className="flex h-7 w-8 items-center justify-center rounded-l-md text-slate-400 transition hover:bg-white hover:text-slate-700"
                                title={`Remove ${device.name}`}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="flex h-7 min-w-8 items-center justify-center px-1 text-xs font-semibold text-slate-800">{quantity}</span>
                              <button
                                onClick={() => onQuantityChange(device.id, 1)}
                                className="flex h-7 w-8 items-center justify-center rounded-r-md text-slate-400 transition hover:bg-white hover:text-blue-700"
                                title={`Add ${device.name}`}
                              >
                                <Plus size={12} />
                              </button>
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="relative z-10 mt-3 flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
              {selectedCount ? (
                <button onClick={removeAllSelectedDevices} className="text-sm font-semibold text-red-500 transition hover:text-red-600">
                  清空
                </button>
              ) : (
                <button onClick={onUseRecommendation} className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                  恢复推荐
                </button>
              )}
            </div>
          </section>

          <aside className="flex min-h-0 flex-col rounded-[8px] border border-blue-300 bg-white shadow-sm shadow-blue-100">
            <div className="border-b border-slate-200 p-3">
              <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
                <Search size={14} className="text-slate-400" />
                <input
                  value={guideSearch}
                  onChange={event => setGuideSearch(event.target.value)}
                  placeholder="搜索设备"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">分类</div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{DEVICE_LIBRARY.length}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {guideCategoryTabs.map(tab => {
                  const Icon = tab.icon;
                  const active = guideCategory === tab.id;
                  const count = tab.id === 'all' ? DEVICE_LIBRARY.length : DEVICE_LIBRARY.filter(device => device.category === tab.id).length;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setGuideCategory(tab.id)}
                      className={cn(
                        'flex h-[46px] items-center gap-2 rounded-md border px-2.5 text-left transition',
                        active ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'
                      )}
                      title={tab.label}
                    >
                      <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', active ? 'bg-white text-blue-600' : 'bg-slate-50 text-slate-500')}>
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{tab.label}</span>
                        <span className="mt-0.5 block text-[10px] text-slate-400">{count} 款</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
              {filteredGuideDevices.map(device => {
                const quantity = selectedQuantities[device.id] ?? 0;
                return (
                  <div key={device.id} className="flex items-center gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md border', quantity ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-400')}>
                      <DeviceIcon type={device.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-800">{device.name}</div>
                      <div className="mt-0.5 truncate text-xs text-slate-400">{device.model}</div>
                      <div className="mt-1 truncate text-[10px] text-slate-400">{device.channel} · {device.install}</div>
                    </div>
                    <div className="flex shrink-0 items-center rounded-md bg-slate-50">
                      <button
                        onClick={() => onQuantityChange(device.id, -1)}
                        disabled={!quantity}
                        className="flex h-8 w-8 items-center justify-center rounded-l-md text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-30"
                        title={`Remove ${device.name}`}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="flex h-8 min-w-8 items-center justify-center px-1 text-xs font-semibold text-slate-800">{quantity}</span>
                      <button
                        onClick={() => onQuantityChange(device.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-r-md text-slate-400 transition hover:bg-white hover:text-blue-700"
                        title={`Add ${device.name}`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {!filteredGuideDevices.length ? (
                <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs font-semibold text-slate-400">
                  无匹配设备
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (state === 'uploading') {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[#eef4fb] p-6 text-slate-900">
        <section className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-300/60">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <div className="text-xs font-semibold text-blue-600">Floor Plan Parsing</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">正在解析户型图</h1>
              <p className="mt-1 text-sm text-slate-500">{uploadedPlanName || 'Floor plan'}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Loader2 size={22} className="animate-spin" />
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-2">
            <div className="border-b border-slate-200 p-5 md:border-b-0 md:border-r">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Uploaded Plan</div>
              <div className="relative h-[320px] overflow-hidden rounded-[8px] border border-slate-200 bg-slate-50">
                {uploadingPreviewUrl ? (
                  <img src={uploadingPreviewUrl} alt={uploadedPlanName || 'Uploaded floor plan'} className="h-full w-full object-contain" />
                ) : (
                  <MiniFloorPlanPreview />
                )}
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-slate-600 shadow-sm">
                  原始底图
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Vectorized Draft</div>
              <div className="relative h-[320px] overflow-hidden rounded-[8px] border border-blue-200 bg-blue-50/30">
                <div className="absolute inset-5 rounded-md border border-blue-200 bg-white/80">
                  <div className="absolute left-[10%] top-[12%] h-[30%] w-[36%] rounded-sm border-2 border-blue-500/80 bg-blue-100/35" />
                  <div className="absolute left-[46%] top-[12%] h-[30%] w-[42%] rounded-sm border-2 border-blue-500/80 bg-amber-100/35" />
                  <div className="absolute left-[10%] top-[42%] h-[42%] w-[54%] rounded-sm border-2 border-blue-500/80 bg-blue-100/25" />
                  <div className="absolute left-[64%] top-[42%] h-[42%] w-[24%] rounded-sm border-2 border-blue-500/80 bg-emerald-100/35" />
                  <div className="absolute left-[28%] top-[41%] h-3 w-14 rounded-full bg-white" />
                  <div className="absolute left-[63%] top-[52%] h-14 w-3 rounded-full bg-white" />
                  <span className="absolute left-[15%] top-[16%] rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-blue-700">Bedroom</span>
                  <span className="absolute left-[52%] top-[16%] rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-blue-700">Dining</span>
                  <span className="absolute left-[16%] top-[50%] rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-blue-700">Living</span>
                </div>
                <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-semibold text-white shadow-sm">
                  矢量化中
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 text-left md:grid-cols-4">
            {[
              ['1', '上传底图', '已完成'],
              ['2', '解析墙体', '进行中'],
              ['3', '生成房间语义', '进行中'],
              ['4', '设置比例尺', '下一步'],
            ].map(([step, label, status], index) => (
              <div key={label} className="flex items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-3">
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold', index === 0 ? 'bg-emerald-500 text-white' : index < 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400')}>
                  {index === 0 ? <Check size={14} /> : step}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-slate-900">{label}</span>
                  <span className="mt-0.5 block text-[10px] text-slate-400">{status}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#eef4fb] p-6">
      <div className="mx-auto flex min-h-full max-w-6xl items-center">
        <section className="grid w-full gap-5 lg:grid-cols-[minmax(0,1fr)_430px]">
          <div className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-300/60">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles size={13} />
              空间智能
            </div>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-slate-950">从户型底稿开始</h1>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-100/70"
              >
                <UploadCloud size={20} className="text-blue-600" />
                <div className="mt-4 text-sm font-semibold text-slate-950">上传底稿</div>
                <div className="mt-1 text-xs text-slate-500">PNG / JPG / PDF</div>
              </button>
              <button
                onClick={onUseExisting}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-white"
              >
                <FileCheck2 size={20} className="text-blue-600" />
                <div className="mt-4 text-sm font-semibold text-slate-950">已有户型</div>
                <div className="mt-1 text-xs text-slate-500">从方案导入</div>
              </button>
              <button
                onClick={onTryDemo}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-white"
              >
                <Image size={20} className="text-blue-600" />
                <div className="mt-4 text-sm font-semibold text-slate-950">示例底稿</div>
                <div className="mt-1 text-xs text-slate-500">进入画布</div>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) {
                  const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
                  onUpload(file.name, previewUrl);
                  event.currentTarget.value = '';
                }
              }}
            />
          </div>

          <aside className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-300/50">
            <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50 p-4">
              <div className="h-[300px] rounded-2xl border border-slate-200 bg-white">
                <div className="relative h-full">
                  <div className="absolute left-[12%] top-[14%] h-[30%] w-[38%] border-[3px] border-slate-800 bg-sky-50" />
                  <div className="absolute left-[50%] top-[14%] h-[30%] w-[38%] border-[3px] border-slate-800 bg-amber-50" />
                  <div className="absolute left-[12%] top-[44%] h-[38%] w-[52%] border-[3px] border-slate-800 bg-sky-50" />
                  <div className="absolute left-[64%] top-[44%] h-[38%] w-[24%] border-[3px] border-slate-800 bg-sky-50" />
                  <div className="absolute left-[18%] top-[24%] h-2 w-16 rounded-full border-2 border-slate-500" />
                  <div className="absolute left-[56%] top-[24%] h-14 w-28 rounded-xl border-2 border-slate-500" />
                  <div className="absolute left-[25%] top-[62%] h-12 w-32 rounded-xl border-2 border-slate-500" />
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['比例尺', '墙体', '点位'].map(item => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-900">{item}</div>
                  <div className="mt-1 text-[11px] text-slate-400">待开始</div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function MiniFloorPlanPreview({ previewUrl, label = 'Space Plan' }: { previewUrl?: string; label?: string }) {
  if (previewUrl) {
    return (
      <div className="relative h-full w-full bg-white">
        <img src={previewUrl} alt={label} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-white">
      <div className="absolute left-[12%] top-[14%] h-[30%] w-[38%] border-[3px] border-slate-800 bg-sky-50" />
      <div className="absolute left-[50%] top-[14%] h-[30%] w-[38%] border-[3px] border-slate-800 bg-amber-50" />
      <div className="absolute left-[12%] top-[44%] h-[38%] w-[52%] border-[3px] border-slate-800 bg-sky-50" />
      <div className="absolute left-[64%] top-[44%] h-[38%] w-[24%] border-[3px] border-slate-800 bg-emerald-50" />
      <div className="absolute left-[18%] top-[24%] h-2 w-16 rounded-full border-2 border-slate-500" />
      <div className="absolute left-[56%] top-[24%] h-14 w-28 rounded-xl border-2 border-slate-500" />
      <div className="absolute left-[25%] top-[62%] h-12 w-32 rounded-xl border-2 border-slate-500" />
    </div>
  );
}

function FloorPlanImportOverlay({
  parsing,
  uploadedPlanName,
  uploadingPreviewUrl,
  onUpload,
  onUseExisting,
  onTryDemo,
  onClose,
}: {
  parsing: boolean;
  uploadedPlanName: string;
  uploadingPreviewUrl: string;
  onUpload: (fileName: string, previewUrl?: string) => void;
  onUseExisting: () => void;
  onTryDemo: () => void;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFile = (file?: File | null) => {
    if (!file) return;
    onUpload(file.name, file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
  };
  const startCards: Array<{
    title: string;
    subtitle: string;
    button: string;
    icon: LucideIcon;
    active?: boolean;
    onClick: () => void;
  }> = [
    { title: '基于户型图', subtitle: '上传 PNG/JPG/PDF', button: '开始', icon: UploadCloud, active: true, onClick: () => fileInputRef.current?.click() },
    { title: '基于已有构建', subtitle: '上传构建文件', button: '上传', icon: FileCheck2, onClick: onUseExisting },
    { title: '基于示例开始构建', subtitle: '进入画布', button: '开始', icon: Image, onClick: onTryDemo },
  ];

  return (
    <div className="absolute inset-0 z-[120] grid place-items-center bg-slate-950/48 p-6 backdrop-blur-md">
      <section className="w-full max-w-[900px] overflow-hidden rounded-[8px] border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl shadow-slate-950/20">
        <div className="flex h-10 items-center justify-between px-1">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">
            {parsing ? '正在解析户型图' : '快速开始'}
          </h2>
          <button
            onClick={onClose}
            disabled={parsing}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {parsing ? (
          <div className="grid gap-4 px-1 pb-3 pt-4 md:grid-cols-[1.05fr_0.95fr]">
            <div className="relative h-[260px] overflow-hidden rounded-[8px] border border-slate-200 bg-[#f5f9ff]">
              {uploadingPreviewUrl ? (
                <img src={uploadingPreviewUrl} alt={uploadedPlanName || 'Uploaded floor plan'} className="h-full w-full object-contain opacity-75" />
              ) : (
                <MiniFloorPlanPreview />
              )}
              <div className="absolute inset-0 bg-white/50">
                <div className="absolute left-[12%] top-[14%] h-[30%] w-[38%] animate-pulse border-2 border-blue-500 bg-blue-100/30" />
                <div className="absolute left-[50%] top-[14%] h-[30%] w-[38%] animate-pulse border-2 border-blue-500 bg-amber-100/30" />
                <div className="absolute left-[12%] top-[44%] h-[38%] w-[52%] animate-pulse border-2 border-blue-500 bg-blue-100/25" />
                <div className="absolute left-[64%] top-[44%] h-[38%] w-[24%] animate-pulse border-2 border-blue-500 bg-emerald-100/30" />
              </div>
              <div className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                矢量化中
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">{uploadedPlanName || 'Floor plan'}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">结构解析中</p>
              <div className="mt-5 space-y-2">
                {[
                  { label: '上传底稿', value: '已完成', done: true },
                  { label: '结构解析', value: '识别墙体与门窗', done: true },
                  { label: '矢量化', value: '生成可编辑空间', done: false },
                ].map(({ label, value, done }) => (
                  <div key={label} className="flex items-center gap-3 rounded-md bg-white px-3 py-2">
                    {done ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Loader2 size={15} className="animate-spin text-blue-600" />}
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-900">{label}</span>
                      <span className="block truncate text-[11px] text-slate-400">{value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 px-1 pb-3 pt-4 md:grid-cols-3">
            {startCards.map(card => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={card.onClick}
                  className="group overflow-hidden rounded-[8px] border border-slate-200 bg-white text-left transition hover:border-blue-300 hover:shadow-sm"
                >
                  <div className={cn('relative h-[250px] overflow-hidden bg-[#f0f7ff]', card.active && 'bg-[#eaf4ff]')}>
                    <div className="absolute -right-28 -top-20 h-80 w-80 rounded-full border border-blue-200/70" />
                    <div className="absolute -right-20 -top-12 h-64 w-64 rounded-full border border-blue-200/70" />
                    <div className="absolute -right-12 top-0 h-48 w-48 rounded-full border border-blue-200/70" />
                    <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/75 text-blue-600 shadow-sm">
                      <Icon size={18} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/92 to-transparent" />
                  </div>
                  <div className="px-5 pb-5 pt-4">
                    <div className="text-sm font-semibold text-slate-950">{card.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{card.subtitle}</div>
                    <span className="mt-4 inline-flex h-9 min-w-20 items-center justify-center rounded-md bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition group-hover:bg-blue-700">
                      {card.button}
                    </span>
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hidden"
              aria-hidden="true"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={event => {
                handleFile(event.target.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function SpaceDesignStatementCanvas({
  project,
  activeFloor,
  uploadedPlanName,
  floorPlanPreviewUrl,
  hasSpacePlan,
  spacePlanName,
  selectedDeviceCount,
  onEnterEditor,
  onNext,
}: {
  project: ProjectModel;
  activeFloor: string;
  uploadedPlanName: string;
  floorPlanPreviewUrl: string;
  hasSpacePlan: boolean;
  spacePlanName: string;
  selectedDeviceCount: number;
  onEnterEditor: () => void;
  onNext: () => void;
}) {
  void onNext;
  const previewLabel = uploadedPlanName || spacePlanName || 'Space plan preview';

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f4f6fa] text-slate-900">
      {!hasSpacePlan ? (
        <section className="grid h-full place-items-center px-6">
          <div className="flex max-w-[360px] flex-col items-center text-center">
            <div className="relative h-20 w-24 text-slate-300">
              <div className="absolute left-3 top-2 h-14 w-[72px] rounded-sm bg-slate-300/65 shadow-sm" />
              <div className="absolute left-1 top-0 h-14 w-[72px] rounded-sm border border-slate-300 bg-slate-100">
                <div className="flex h-2 items-center gap-1 border-b border-slate-300 px-1.5">
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                </div>
                <div className="grid h-12 place-items-center">
                  <Home size={20} className="text-white" />
                </div>
              </div>
            </div>
            <h1 className="mt-5 text-base font-semibold text-slate-950">暂无户型与点位方案</h1>
            <p className="mt-3 text-xs leading-6 text-slate-500">点击下方按钮创建户型图</p>
            <button
              onClick={onEnterEditor}
              className="mt-6 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
            >
              <FilePlus2 size={14} />
              快速开始
            </button>
          </div>
        </section>
      ) : (
        <section className="mx-auto flex h-full max-w-[940px] flex-col justify-center px-8 py-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">户型点位方案</h1>
              <div className="mt-1 text-xs text-slate-400">2026-06-15 17:56:55 保存</div>
            </div>
            <button
              onClick={onEnterEditor}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
            >
              <Pencil size={14} />
              编辑方案
            </button>
          </div>

          <button
            type="button"
            onClick={onEnterEditor}
            className="group relative aspect-[16/9] min-h-[360px] overflow-hidden rounded-[10px] border border-slate-200 bg-slate-200 text-left shadow-sm transition hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-100 to-slate-300" />
            <div className={cn('absolute inset-[8%] overflow-hidden rounded-[8px] bg-white shadow-sm', !floorPlanPreviewUrl && 'grayscale opacity-55')}>
              <MiniFloorPlanPreview previewUrl={floorPlanPreviewUrl} label={previewLabel} />
            </div>
            <div className="absolute inset-0 bg-white/18 transition group-hover:bg-blue-50/10" />
            <div className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white/88 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              {spacePlanName}
            </div>
            <div className="absolute bottom-4 left-4 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
              {floorDisplayName(activeFloor || '1F')} · {project.area} · {selectedDeviceCount} 设备
            </div>
          </button>
        </section>
      )}
    </div>
  );
}

function DesignCanvas({
  project,
  stage,
  selected,
  editMode,
  dirty,
  saving,
  deviceLibraryOpen,
  configOpen,
  config,
  activeTool,
  overlayMode,
  floorPlanMode,
  uploadedPlanName,
  floorPlanPreviewUrl,
  scaleGuideOpen,
  floors,
  activeFloor,
  activeFloorPlanned,
  buildingName,
  buildings,
  activeBuildingId,
  buildingComposed,
  alignFloorplansOpen,
  layers,
  onSelect,
  onToolChange,
  onStageChange,
  onOverlayChange,
  onAddFloor,
  onOpenFloorAlignment,
  onFinishFloorAlignment,
  onCancelFloorAlignment,
  onSelectFloor,
  onSelectBuilding,
  onRenameBuilding,
  onCreateBuilding,
  onToggleLayer,
  onToggleEdit,
  onSaveDesign,
  onExitEditor,
  onToggleConfig,
  onCloseDeviceLibrary,
  onOpenDeviceLibrary,
  onConfigChange,
  onResetConfig,
  completedStages,
  onCompleteStage,
  onRecommendDevices,
  selectedFurniture,
  onSelectFurniture,
  onMoveDevice,
  onPlaceDevice,
  placementBatch,
  onPlacePlacementDevice,
  onCancelPlacement,
  onConfirmScale,
}: {
  project: ProjectModel;
  stage: StageId;
  selected: string | null;
  editMode: boolean;
  dirty: boolean;
  saving: boolean;
  deviceLibraryOpen: boolean;
  configOpen: boolean;
  config: CanvasConfig;
  activeTool: ToolId;
  overlayMode: OverlayMode;
  floorPlanMode: FloorPlanMode;
  uploadedPlanName: string;
  floorPlanPreviewUrl: string;
  scaleGuideOpen: boolean;
  floors: string[];
  activeFloor: string;
  activeFloorPlanned: boolean;
  buildingName: string;
  buildings: SpaceBuilding[];
  activeBuildingId: string;
  buildingComposed: boolean;
  alignFloorplansOpen: boolean;
  layers: Record<LayerId, boolean>;
  onSelect: (name: string) => void;
  onToolChange: (tool: ToolId) => void;
  onStageChange: (stage: StageId) => void;
  onOverlayChange: (mode: OverlayMode) => void;
  onAddFloor: () => void;
  onOpenFloorAlignment: () => void;
  onFinishFloorAlignment: () => void;
  onCancelFloorAlignment: () => void;
  onSelectFloor: (floor: string) => void;
  onSelectBuilding: (buildingId: string) => void;
  onRenameBuilding: (buildingId: string, name: string) => void;
  onCreateBuilding: () => void;
  onToggleLayer: (id: LayerId) => void;
  onToggleEdit: () => void;
  onSaveDesign: () => void;
  onExitEditor: () => void;
  onToggleConfig: () => void;
  onCloseDeviceLibrary: () => void;
  onOpenDeviceLibrary: () => void;
  onConfigChange: (nextConfig: Partial<CanvasConfig>) => void;
  onResetConfig: () => void;
  completedStages: StageId[];
  onCompleteStage: (stage: StageId, nextStage?: StageId) => void;
  onRecommendDevices: (prompt?: string) => void;
  selectedFurniture: string | null;
  onSelectFurniture: (id: string) => void;
  onMoveDevice: (name: string, x: number, y: number) => void;
  onPlaceDevice: (template: DeviceTemplate, x?: number, y?: number) => void;
  placementBatch: DevicePlacementBatch | null;
  onPlacePlacementDevice: (x: number, y: number) => void;
  onCancelPlacement: () => void;
  onConfirmScale: () => void;
}) {
  const selectedDevice = selected ? project.devicesList.find(device => device.name === selected) ?? null : project.devicesList[0] ?? null;
  const graphMode = activeTool === 'logic';
  const sceneMode = stage === 'logic' && !graphMode;
  const [resourceOpen, setResourceOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [drawingPanelOpen, setDrawingPanelOpen] = useState(activeTool === 'walls' || activeTool === 'room');
  const [placementCursor, setPlacementCursor] = useState({ x: 50, y: 50 });
  const [canvasViewMode, setCanvasViewMode] = useState<'2d' | '3d'>('2d');
  const [personPosition, setPersonPosition] = useState({ x: 42, y: 58 });
  const [personVisible, setPersonVisible] = useState(false);
  const [toolControlEngaged, setToolControlEngaged] = useState(false);
  const [roomPositionOverrides, setRoomPositionOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const [furniturePositionOverrides, setFurniturePositionOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const personDragRef = useRef<{ pointerId: number } | null>(null);
  const reserveResourceSpace = !graphMode && resourceOpen;
  const reserveOutlineSpace = outlineOpen;
  const immersive3D = canvasViewMode === '3d' && !graphMode && !sceneMode;
  const openDeviceLibrary = () => {
    if (deviceLibraryOpen) {
      setResourceOpen(false);
      onCloseDeviceLibrary();
      return;
    }
    setResourceOpen(false);
    onToolChange('devices');
    onOpenDeviceLibrary();
  };
  const handleCanvasDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    const templateId = event.dataTransfer.getData('application/aqara-device');
    if (!templateId) return;
    event.preventDefault();
    const template = DEVICE_LIBRARY.find(device => device.id === templateId);
    if (!template) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onPlaceDevice(template, x, y);
  };
  const isCanvasUiTarget = (target: EventTarget | null) => (
    target instanceof HTMLElement && Boolean(target.closest('button, a, input, select, textarea, aside, [data-canvas-ui="true"]'))
  );
  const handleCanvasPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!placementBatch) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPlacementCursor({
      x: Math.min(98, Math.max(2, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(96, Math.max(4, ((event.clientY - rect.top) / rect.height) * 100)),
    });
  };
  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!placementBatch || isCanvasUiTarget(event.target)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onPlacePlacementDevice(
      Math.min(98, Math.max(2, ((event.clientX - rect.left) / rect.width) * 100)),
      Math.min(96, Math.max(4, ((event.clientY - rect.top) / rect.height) * 100))
    );
  };

  useEffect(() => {
    if (!placementBatch) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancelPlacement();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placementBatch, onCancelPlacement]);

  useEffect(() => {
    if (activeTool === 'walls' || activeTool === 'room') setDrawingPanelOpen(true);
  }, [activeTool]);

  const updatePersonPosition = (event: ReactPointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    setPersonPosition({
      x: Math.min(97, Math.max(3, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(95, Math.max(5, ((event.clientY - rect.top) / rect.height) * 100)),
    });
  };

  const handlePersonPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    personDragRef.current = { pointerId: event.pointerId };
    setPersonVisible(true);
    setToolControlEngaged(true);
    onToolChange('person');
    updatePersonPosition(event);
  };

  const handlePersonPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (personDragRef.current?.pointerId !== event.pointerId) return;
    updatePersonPosition(event);
  };

  const handlePersonPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (personDragRef.current?.pointerId !== event.pointerId) return;
    updatePersonPosition(event);
    personDragRef.current = null;
  };

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden bg-[#f5f8fc]', placementBatch ? 'cursor-crosshair' : '')}
      onDragOver={event => event.preventDefault()}
      onDrop={handleCanvasDrop}
      onPointerMove={handleCanvasPointerMove}
      onClick={handleCanvasClick}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(51,65,85,0.08)_1px,transparent_1px),linear-gradient(rgba(51,65,85,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <StudioCanvasTopbar
        project={project}
        activeTool={activeTool}
        saving={saving}
        canvasViewMode={canvasViewMode}
        overlayMode={overlayMode}
        floors={floors}
        activeFloor={activeFloor}
        activeFloorPlanned={activeFloorPlanned}
        buildingName={buildingName}
        layers={layers}
        onToolChange={(nextTool) => {
          if (nextTool === 'person') {
            const nextVisible = !(activeTool === 'person' && personVisible);
            setPersonVisible(nextVisible);
            setToolControlEngaged(nextVisible);
            onToolChange(nextVisible ? 'person' : 'select');
            return;
          }
          if (nextTool === activeTool && nextTool !== 'select') {
            setPersonVisible(false);
            setToolControlEngaged(false);
            setDrawingPanelOpen(false);
            if (nextTool === 'coverage') onOverlayChange('off');
            onToolChange('select');
            return;
          }
          setPersonVisible(false);
          onToolChange(nextTool);
          setToolControlEngaged(!['select', 'pan'].includes(nextTool));
          if (nextTool === 'walls' || nextTool === 'room') setDrawingPanelOpen(true);
        }}
        onOverlayChange={onOverlayChange}
        onAddFloor={onAddFloor}
        onOpenFloorAlignment={onOpenFloorAlignment}
        onOpenDeviceLibrary={openDeviceLibrary}
        onExitEditor={onExitEditor}
        onSave={onSaveDesign}
        onSelectFloor={onSelectFloor}
        onToggleLayer={onToggleLayer}
      />
      <DesignOutlinePanel
        project={project}
        activeTool={activeTool}
        activeFloor={activeFloor}
        activeFloorPlanned={activeFloorPlanned}
        floors={floors}
        buildingName={buildingName}
        buildings={buildings}
        activeBuildingId={activeBuildingId}
        buildingComposed={buildingComposed}
        open={outlineOpen}
        onToggle={() => setOutlineOpen(value => !value)}
        onClose={() => setOutlineOpen(false)}
        onAddFloor={onAddFloor}
        onComposeBuilding={onOpenFloorAlignment}
        onSelectBuilding={onSelectBuilding}
        onRenameBuilding={onRenameBuilding}
        onCreateBuilding={onCreateBuilding}
        onSelectFloor={onSelectFloor}
        onToolChange={onToolChange}
        onSelectFurniture={onSelectFurniture}
      />

      <div className={cn('absolute top-20 z-40 flex items-center gap-2', immersive3D ? 'hidden' : reserveResourceSpace ? 'right-[340px]' : 'right-[128px]')}>
        {editMode ? (
          <span className="flex h-10 items-center rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-blue-700 shadow-sm">
            编辑中{dirty ? ' · 未保存' : ''}
          </span>
        ) : null}
        <button
          onClick={onToggleEdit}
          className={cn(
            'flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold shadow-sm transition',
            editMode ? 'border-blue-200 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200'
          )}
        >
          <Pencil size={14} />
          {editMode ? '退出编辑' : '进入编辑'}
        </button>
      </div>

      <div
        className={cn(
          'absolute top-24 bottom-28 flex items-center justify-center transition-[left,right] duration-200',
          reserveOutlineSpace ? 'left-[390px]' : 'left-20',
          reserveResourceSpace ? 'right-[340px]' : 'right-10'
        )}
      >
        <div className={cn('relative h-full min-h-[560px] w-full', graphMode ? 'max-w-[1280px]' : 'max-h-[720px] max-w-[1180px]')}>
          {graphMode ? (
            <SpaceKnowledgeGraph project={project} activeFloor={activeFloor} />
          ) : sceneMode ? (
            <SceneAutomationCanvas project={project} activeFloor={activeFloor} />
          ) : immersive3D ? (
            <StudioThreeDView
              activeFloor={activeFloor}
              project={project}
              personPosition={personPosition}
              personVisible={personVisible}
            />
          ) : !activeFloor ? (
            <EmptyBuildingCanvas buildingName={buildingName} onAddFloor={onAddFloor} />
          ) : !activeFloorPlanned ? (
            <UnplannedFloorCanvas floorName={floorDisplayName(activeFloor)} buildingName={buildingName} />
          ) : (
            <>
              <div className="absolute inset-x-10 top-10 bottom-8 rounded-[2px] bg-white/45" />
              <div className="absolute left-0 right-0 top-0 bottom-0">
                <FloorPlanUnderlay mode={floorPlanMode} fileName={uploadedPlanName} previewUrl={floorPlanPreviewUrl} />
                {layers.walls && (
                  <StudioFloorPlan
                    activeFloor={activeFloor}
                    opacity={config.wallsOpacity}
                    editMode={editMode}
                    positionOverrides={roomPositionOverrides}
                    onMoveRoom={(roomId, x, y) => {
                      setRoomPositionOverrides(prev => ({
                        ...prev,
                        [`${activeFloor}:${roomId}`]: { x, y },
                      }));
                    }}
                  />
                )}
                {layers.furniture && (
                  <StudioFurniture
                    activeFloor={activeFloor}
                    opacity={config.objectsOpacity}
                    selectedFurniture={selectedFurniture}
                    editMode={editMode}
                    positionOverrides={furniturePositionOverrides}
                    onSelectFurniture={onSelectFurniture}
                    onMoveFurniture={(id, x, y) => {
                      setFurniturePositionOverrides(prev => ({
                        ...prev,
                        [id]: { x, y },
                      }));
                    }}
                  />
                )}
                {layers.coverage && selectedDevice ? <StudioCoverage selectedDevice={selectedDevice} opacity={config.coverageOpacity} overlayMode={overlayMode} /> : null}
                {layers.links && <StudioLogicLinks />}
                {layers.devices && (
                  <StudioDeviceLayer
                    devices={project.devicesList}
                    selected={selected}
                    config={config}
                    editMode={editMode}
                    onSelect={onSelect}
                    onMove={onMoveDevice}
                  />
                )}
                {personVisible ? (
                <PersonPresenceMarker
                  position={personPosition}
                  active={activeTool === 'person'}
                  onPointerDown={handlePersonPointerDown}
                  onPointerMove={handlePersonPointerMove}
                  onPointerUp={handlePersonPointerUp}
                />
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {!graphMode && !sceneMode ? (
        <CanvasViewControls
          mode={canvasViewMode}
          configOpen={configOpen}
          onToggleConfig={onToggleConfig}
          onSetMode={(mode) => {
            setCanvasViewMode(mode);
            if (mode === '3d') {
              setToolControlEngaged(false);
              setPersonVisible(false);
              setDrawingPanelOpen(false);
              setResourceOpen(false);
              onToolChange('select');
            }
          }}
          hide3DButton={toolControlEngaged}
        />
      ) : null}

      {!graphMode && !immersive3D && !resourceOpen ? (
        <button
          onClick={() => setResourceOpen(true)}
          className="absolute right-5 top-20 z-40 flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          title="打开资源库"
        >
          <Layers3 size={15} />
          资源库
        </button>
      ) : null}

      {!graphMode && resourceOpen ? (
        <ResourceSidebar
          stage={stage}
          activeFloor={activeFloor}
          project={project}
          onOpenDeviceLibrary={openDeviceLibrary}
          onRecommendDevices={onRecommendDevices}
          onSelectFurniture={onSelectFurniture}
          onClose={() => setResourceOpen(false)}
        />
      ) : null}
      {configOpen ? (
        <CanvasConfigPanel
          config={config}
          onChange={onConfigChange}
          onReset={onResetConfig}
        />
      ) : null}

      {!graphMode && drawingPanelOpen && (activeTool === 'walls' || activeTool === 'room') ? (
        <WallRoomToolPanel
          activeTool={activeTool}
          onToolChange={onToolChange}
          onClose={() => setDrawingPanelOpen(false)}
        />
      ) : null}

      {placementBatch ? (
        <div
          className="pointer-events-none absolute z-[90] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-xl border border-blue-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 shadow-xl shadow-blue-200/50"
          style={{ left: `${placementCursor.x}%`, top: `${placementCursor.y}%` }}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <DeviceIcon type={placementBatch.device.type} />
          </span>
          <span className="max-w-[130px] truncate">{placementBatch.device.name}</span>
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">x{placementBatch.remaining}</span>
          <span className="text-[10px] text-slate-400">Esc</span>
        </div>
      ) : null}

      {alignFloorplansOpen ? (
        <AlignFloorplansOverlay
          floors={floors}
          activeFloor={activeFloor}
          onSelectFloor={onSelectFloor}
          onAddFloor={onAddFloor}
          onDone={onFinishFloorAlignment}
          onCancel={onCancelFloorAlignment}
        />
      ) : null}

      {scaleGuideOpen ? (
        <ScaleSetupGuide
          fileName={uploadedPlanName}
          mode={floorPlanMode}
          onConfirm={onConfirmScale}
        />
      ) : null}
    </div>
  );
}

function ScaleSetupGuide({
  fileName,
  mode,
  onConfirm,
}: {
  fileName: string;
  mode: FloorPlanMode;
  onConfirm: () => void;
}) {
  type ScalePoint = { x: number; y: number };
  const [interaction, setInteraction] = useState<'prompt' | 'draw' | 'length'>('prompt');
  const [length, setLength] = useState('2.00');
  const [unit, setUnit] = useState<'m' | 'ft'>('m');
  const [startPoint, setStartPoint] = useState<ScalePoint | null>(null);
  const [endPoint, setEndPoint] = useState<ScalePoint | null>(null);
  const [pendingClickStart, setPendingClickStart] = useState<ScalePoint | null>(null);
  const pointerStartRef = useRef<ScalePoint | null>(null);
  const draggedRef = useRef(false);

  const pointFromEvent = (event: ReactPointerEvent<HTMLDivElement>): ScalePoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const distance = (a: ScalePoint, b: ScalePoint) => Math.hypot(a.x - b.x, a.y - b.y);

  const resetLine = () => {
    setInteraction('draw');
    setStartPoint(null);
    setEndPoint(null);
    setPendingClickStart(null);
    pointerStartRef.current = null;
    draggedRef.current = false;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (interaction !== 'draw') return;
    if (event.button !== 0) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    pointerStartRef.current = point;
    draggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (interaction !== 'draw' || !pointerStartRef.current) return;
    const point = pointFromEvent(event);
    if (distance(pointerStartRef.current, point) < 1) return;
    draggedRef.current = true;
    setStartPoint(pointerStartRef.current);
    setEndPoint(point);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (interaction !== 'draw' || !pointerStartRef.current) return;
    const point = pointFromEvent(event);
    const startedAt = pointerStartRef.current;
    pointerStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (draggedRef.current || distance(startedAt, point) >= 1.5) {
      setStartPoint(startedAt);
      setEndPoint(point);
      setPendingClickStart(null);
      setInteraction('length');
      return;
    }

    if (!pendingClickStart) {
      setPendingClickStart(point);
      setStartPoint(point);
      setEndPoint(null);
      return;
    }

    setStartPoint(pendingClickStart);
    setEndPoint(point);
    setPendingClickStart(null);
    setInteraction('length');
  };

  const canSave = Number.parseFloat(length) > 0 && Boolean(startPoint && endPoint);
  const lineReady = Boolean(startPoint && endPoint);
  const panelPosition = startPoint && endPoint
    ? {
        left: `${Math.min(78, Math.max(12, Math.max(startPoint.x, endPoint.x) + 4))}%`,
        top: `${Math.min(70, Math.max(12, Math.min(startPoint.y, endPoint.y) + 5))}%`,
      }
    : { left: '58%', top: '22%' };

  return (
    <div
      data-canvas-ui="true"
      className={cn(
        'absolute inset-0 z-[95]',
        interaction === 'prompt' ? 'pointer-events-none' : 'cursor-crosshair bg-white/12 backdrop-blur-[0.5px]'
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStartRef.current = null;
        draggedRef.current = false;
      }}
    >
      <div className="pointer-events-auto absolute left-1/2 top-4 z-30 -translate-x-1/2">
        <div className="flex min-h-10 items-center gap-3 rounded-full border border-black/40 bg-[#2f3136] py-1.5 pl-4 pr-1.5 text-sm font-medium text-white shadow-lg shadow-slate-500/45">
          {interaction === 'prompt' ? (
            <>
              <span className="text-white/95">
                Set your <strong className="font-semibold text-white">Floor Plan Scale</strong> for accurate coverage depiction.
              </span>
              <button
                onClick={() => setInteraction('draw')}
                className="h-8 rounded-full bg-blue-500 px-4 text-sm font-semibold text-white shadow-sm shadow-black/20 transition hover:bg-blue-400"
              >
                Set Scale
              </button>
            </>
          ) : (
            <>
              <span className="text-white/95">
                <strong className="font-semibold text-white">Drag</strong> or <strong className="font-semibold text-white">Left Mouse Click</strong> to draw a line, then enter the length it represents.
              </span>
              <button
                onClick={onConfirm}
                className="h-8 rounded-full bg-blue-500 px-4 text-sm font-semibold text-white shadow-sm shadow-black/20 transition hover:bg-blue-400"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {startPoint ? (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {endPoint ? (
            <line
              x1={`${startPoint.x}%`}
              y1={`${startPoint.y}%`}
              x2={`${endPoint.x}%`}
              y2={`${endPoint.y}%`}
              stroke="#dc2626"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ) : null}
          <circle cx={`${startPoint.x}%`} cy={`${startPoint.y}%`} r="4" fill="#dc2626" stroke="white" strokeWidth="2" />
          {endPoint ? <circle cx={`${endPoint.x}%`} cy={`${endPoint.y}%`} r="4" fill="#dc2626" stroke="white" strokeWidth="2" /> : null}
        </svg>
      ) : null}

      {pendingClickStart && interaction === 'draw' && !endPoint ? (
        <div
          className="pointer-events-none absolute rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-lg"
          style={{ left: `${pendingClickStart.x}%`, top: `${pendingClickStart.y}%`, transform: 'translate(10px, 10px)' }}
        >
          Click the second point
        </div>
      ) : null}

      {interaction === 'length' && lineReady ? (
        <section
          className="pointer-events-auto absolute z-30 w-[230px] rounded-[6px] bg-white p-4 text-slate-900 shadow-2xl shadow-slate-300/80"
          style={panelPosition}
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <AlignHorizontalSpaceAround size={15} className="text-slate-500" />
            Set Length
          </div>
          <div className="flex h-10 items-center overflow-hidden rounded-[4px] bg-slate-50">
            <input
              value={length}
              onChange={event => setLength(event.target.value)}
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none"
              autoFocus
            />
            <button
              onClick={() => setUnit('m')}
              className={cn('px-1 text-sm font-semibold', unit === 'm' ? 'text-blue-600' : 'text-slate-400')}
            >
              m
            </button>
            <span className="px-1 text-sm text-slate-300">/</span>
            <button
              onClick={() => setUnit('ft')}
              className={cn('pr-3 text-sm font-semibold', unit === 'ft' ? 'text-blue-600' : 'text-slate-400')}
            >
              ft
            </button>
          </div>
          <div className="mt-4 flex items-center justify-end gap-3">
            <button onClick={resetLine} className="h-10 px-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800">
              Redraw
            </button>
            <button
              onClick={onConfirm}
              disabled={!canSave}
              className={cn(
                'h-10 rounded-[4px] px-5 text-sm font-semibold text-white transition',
                canSave ? 'bg-blue-500 hover:bg-blue-600' : 'cursor-not-allowed bg-blue-300'
              )}
            >
              Save
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function WallRoomToolPanel({
  activeTool,
  onToolChange,
  onClose,
}: {
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
  onClose: () => void;
}) {
  const materials = [
    { name: 'Concrete', value: '15 dB', color: 'bg-slate-500' },
    { name: 'Drywall (Standard)', value: '3 dB', color: 'bg-cyan-300' },
    { name: 'Drywall (Heavy Duty)', value: '4 dB', color: 'bg-cyan-700' },
    { name: 'Glass (Standard)', value: '2 dB', color: 'bg-blue-400' },
    { name: 'Glass (Thin)', value: '1 dB', color: 'bg-blue-100' },
    { name: 'Brick', value: '5 dB', color: 'bg-red-800' },
    { name: 'Metal', value: '10 dB', color: 'bg-stone-500' },
    { name: 'Wood', value: '5 dB', color: 'bg-amber-500' },
    { name: 'Door (Wood)', value: '5 dB', color: 'bg-amber-600' },
    { name: 'Door (Metal)', value: '10 dB', color: 'bg-neutral-500' },
    { name: 'Door (Glass)', value: '2 dB', color: 'bg-slate-300' },
    { name: 'Window (Single Pane)', value: '4 dB', color: 'bg-blue-400' },
    { name: 'Window (Double Pane)', value: '7 dB', color: 'bg-blue-600' },
    { name: 'Window (Triple Pane)', value: '10 dB', color: 'bg-blue-700' },
  ];

  return (
    <aside data-canvas-ui="true" className="absolute right-5 top-20 z-[68] w-[232px] rounded-[6px] border border-slate-200 bg-white/96 p-1 text-slate-900 shadow-xl shadow-slate-300/50 backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-1 rounded-[5px] border border-slate-100 bg-slate-50 p-1">
        {[
          { id: 'walls' as ToolId, label: 'Wall', icon: Pencil },
          { id: 'room' as ToolId, label: 'Room', icon: Grid2X2 },
        ].map(item => {
          const Icon = item.icon;
          const active = activeTool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onToolChange(item.id)}
              className={cn(
                'flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[4px] text-sm font-medium transition',
                active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
              )}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-400 transition hover:bg-white hover:text-slate-700" title="Close">
          <X size={14} />
        </button>
      </div>

      {activeTool === 'walls' ? (
        <div className="space-y-0.5">
          {materials.map((material, index) => (
            <button
              key={material.name}
              className={cn(
                'flex h-6 w-full items-center gap-2 rounded-[3px] px-2 text-left text-sm transition hover:bg-slate-50',
                index === 0 ? 'bg-blue-50 text-slate-700' : 'text-slate-600'
              )}
            >
              <span className="min-w-0 flex-1 truncate">{material.name}</span>
              <span className="text-[11px] text-slate-400">{material.value}</span>
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', material.color)} />
            </button>
          ))}
          <button className="mt-1 h-7 px-2 text-left text-sm font-medium text-blue-600 transition hover:text-blue-700">Add or Modify</button>
        </div>
      ) : (
        <div className="space-y-1 p-1">
          {['Draw Room', 'Split Room', 'Room Label', 'Room Boundary'].map((item, index) => (
            <button
              key={item}
              className={cn(
                'flex h-8 w-full items-center rounded-[4px] px-2 text-left text-sm font-medium transition hover:bg-slate-50',
                index === 0 ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
              )}
            >
              {item}
            </button>
          ))}
          <button className="mt-1 h-7 px-2 text-left text-sm font-medium text-blue-600 transition hover:text-blue-700">Add or Modify</button>
        </div>
      )}
    </aside>
  );
}

function CanvasViewControls({
  mode,
  configOpen,
  onToggleConfig,
  onSetMode,
  hide3DButton,
}: {
  mode: '2d' | '3d';
  configOpen: boolean;
  onToggleConfig: () => void;
  onSetMode: (mode: '2d' | '3d') => void;
  hide3DButton: boolean;
}) {
  return (
    <div data-canvas-ui="true" className="absolute bottom-7 left-7 z-[55] flex items-end gap-4">
      <div className="flex flex-col gap-2">
        {!hide3DButton || mode === '3d' ? (
          <button
            onClick={() => onSetMode(mode === '3d' ? '2d' : '3d')}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-sm font-semibold shadow-sm transition hover:border-blue-200 hover:text-blue-700',
              mode === '3d' ? 'bg-blue-600 text-white hover:text-white' : 'text-slate-700'
            )}
            title={mode === '3d' ? 'Back to 2D' : '3D'}
          >
            {mode === '3d' ? '2D' : '3D'}
          </button>
        ) : null}
        <button
          onClick={onToggleConfig}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border bg-white/95 shadow-sm transition hover:border-blue-200 hover:text-blue-700',
            configOpen ? 'border-blue-200 text-blue-600' : 'border-slate-200 text-slate-600'
          )}
          title="View settings"
        >
          <SlidersVertical size={16} />
        </button>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-sm">
          <button className="flex h-9 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-blue-700" title="Undo">
            <Undo size={15} />
          </button>
          <button className="flex h-9 w-10 items-center justify-center border-t border-slate-100 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700" title="Redo">
            <Redo size={15} />
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-sm">
          <button className="flex h-9 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-50 hover:text-blue-700" title="Fit view">
            <Fullscreen size={15} />
          </button>
          <button className="flex h-9 w-10 items-center justify-center border-t border-slate-100 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700" title="Zoom in">
            <Plus size={17} />
          </button>
          <button className="flex h-9 w-10 items-center justify-center border-t border-slate-100 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700" title="Zoom out">
            <Minus size={17} />
          </button>
        </div>
      </div>
      <div className="mb-1 flex items-end gap-2 text-sm font-medium text-slate-700">
        <span className="h-3 w-px bg-slate-900" />
        <span className="h-px w-24 bg-slate-900" />
        <span className="h-3 w-px bg-slate-900" />
        <span className="ml-1">2m</span>
      </div>
    </div>
  );
}

function PersonPresenceMarker({
  position,
  active,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  position: { x: number; y: number };
  active: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      data-canvas-ui="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        'absolute z-30 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border-2 bg-white shadow-xl transition',
        active ? 'border-blue-600 text-blue-600 ring-4 ring-blue-500/20' : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
      )}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      title="Person location"
    >
      <span className="absolute -bottom-1.5 h-3 w-7 rounded-full bg-blue-500/25 blur-[2px]" />
      <PersonStanding size={22} />
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
    </button>
  );
}

function StudioThreeDView({
  activeFloor,
  project,
  personPosition,
  personVisible,
}: {
  activeFloor: string;
  project: ProjectModel;
  personPosition: { x: number; y: number };
  personVisible: boolean;
}) {
  const rooms = roomsForFloor(activeFloor);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-slate-200 bg-[#edf2f8] shadow-sm [perspective:1100px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.95),rgba(226,232,240,0.55)_42%,rgba(203,213,225,0.45)_100%)]" />
      <div className="absolute left-5 top-5 z-20 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
        3D · {floorDisplayName(activeFloor)}
      </div>
      <div className="absolute inset-x-[8%] bottom-[4%] top-[12%] [transform:rotateX(58deg)_rotateZ(-36deg)] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-[18px] border border-slate-300 bg-white shadow-2xl shadow-slate-400/50" />
        {rooms.map(room => (
          <div
            key={room.id}
            className={cn('absolute border border-slate-400/70 shadow-sm', room.tone)}
            style={{
              left: `${room.x}%`,
              top: `${room.y}%`,
              width: `${room.w}%`,
              height: `${room.h}%`,
              transform: 'translateZ(4px)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-2 bg-slate-700/35" />
            <div className="absolute left-2 top-2 rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 [transform:rotateZ(36deg)_rotateX(-58deg)]">
              {room.label}
            </div>
          </div>
        ))}
        {project.devicesList.slice(0, 5).map(device => (
          <div
            key={device.pointCode}
            className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-lg [transform:translateZ(42px)]"
            style={{ left: `${device.x}%`, top: `${device.y}%` }}
            title={device.name}
          >
            <DeviceIcon type={device.type} />
          </div>
        ))}
        {personVisible ? (
        <div
          className="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-blue-600 bg-white text-blue-600 shadow-2xl [transform:translateZ(64px)]"
          style={{ left: `${personPosition.x}%`, top: `${personPosition.y}%` }}
        >
          <PersonStanding size={22} />
        </div>
        ) : null}
      </div>
      <div className="absolute bottom-5 right-5 rounded-2xl border border-white/80 bg-white/88 px-4 py-3 text-xs text-slate-500 shadow-sm">
        <div className="font-semibold text-slate-800">Life Simulation</div>
        <div className="mt-1">Person movement can trigger scenes and coverage checks.</div>
      </div>
    </div>
  );
}

function FloorPlanUnderlay({ mode, fileName, previewUrl }: { mode: FloorPlanMode; fileName: string; previewUrl: string }) {
  if (mode === 'demo') return null;
  return (
    <div className="pointer-events-none absolute inset-[4%] z-0 rounded-[3px] border border-blue-200/70 bg-white/70 opacity-80">
      {previewUrl ? (
        <img src={previewUrl} alt={fileName || 'Uploaded floor plan'} className="h-full w-full object-contain" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.14)_1px,transparent_1px),linear-gradient(rgba(37,99,235,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />
      )}
      <div className="absolute left-4 top-4 rounded-xl border border-blue-100 bg-white/90 px-3 py-2 text-[10px] font-semibold text-blue-700 shadow-sm">
        {mode === 'uploaded' ? fileName || 'Uploaded floor plan' : 'Existing floor plan'}
      </div>
    </div>
  );
}

function EmptyBuildingCanvas({ buildingName, onAddFloor }: { buildingName: string; onAddFloor: () => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <section className="w-[320px] rounded-[24px] border border-dashed border-slate-200 bg-white/86 p-5 text-center shadow-sm">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Grid2X2 size={18} />
        </div>
        <div className="mt-3 truncate text-sm font-semibold text-slate-900" title={buildingName}>{buildingName}</div>
        <div className="mt-1 text-xs text-slate-400">No floor plan yet</div>
        <button
          onClick={onAddFloor}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
        >
          <Plus size={13} />
          Create Floor Plan 1
        </button>
      </section>
    </div>
  );
}

function UnplannedFloorCanvas({ floorName, buildingName }: { floorName: string; buildingName: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <section className="relative h-[68%] min-h-[420px] w-[72%] min-w-[560px] overflow-hidden rounded-[2px] border border-blue-200 bg-white/72 shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.10)_1px,transparent_1px),linear-gradient(rgba(37,99,235,0.10)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute left-4 top-4 rounded-xl border border-blue-100 bg-white/90 px-3 py-2 shadow-sm">
          <div className="text-xs font-semibold text-slate-900">{floorName}</div>
          <div className="mt-0.5 max-w-[220px] truncate text-[10px] font-medium text-slate-400">{buildingName}</div>
        </div>
        <div className="absolute left-1/2 top-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-dashed border-slate-200 bg-white/88 p-5 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Square size={16} />
          </div>
          <div className="mt-3 text-sm font-semibold text-slate-900">未规划</div>
        </div>
      </section>
    </div>
  );
}

function AlignFloorplansOverlay({
  floors,
  activeFloor,
  onSelectFloor,
  onAddFloor,
  onDone,
  onCancel,
}: {
  floors: string[];
  activeFloor: string;
  onSelectFloor: (floor: string) => void;
  onAddFloor: () => void;
  onDone: () => void;
  onCancel: () => void;
}) {
  const canAlign = floors.length >= 1;
  const previewFloors = floors.length ? floors : ['1F'];

  return (
    <div className="absolute inset-0 z-[70] bg-white/72 backdrop-blur-[2px]">
      <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-950/90 px-4 py-2 text-xs font-semibold text-white shadow-xl">
        <span>Align floor plans in the current Building. Use corners to resize. Esc to cancel.</span>
        <button
          onClick={canAlign ? onDone : undefined}
          disabled={!canAlign}
          className={cn(
            'h-7 rounded-full px-3 text-xs font-semibold transition',
            canAlign ? 'bg-blue-500 text-white hover:bg-blue-400' : 'cursor-not-allowed bg-slate-700 text-slate-400'
          )}
        >
          Done
        </button>
        <button onClick={onCancel} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white" title="取消">
          <X size={14} />
        </button>
      </div>

      <div className="absolute left-10 right-[340px] top-16 bottom-10">
        <div className="absolute inset-0 rounded-[2px] border border-blue-400 bg-white shadow-inner">
          <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border border-blue-500 bg-white" />
          <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border border-blue-500 bg-white" />
          <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full border border-blue-500 bg-white" />
          <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full border border-blue-500 bg-white" />
          <span className="absolute left-2 top-2 rounded bg-blue-500 px-2 py-1 text-xs font-semibold text-white">{floorDisplayName(activeFloor)}</span>

          {previewFloors.map((floor, index) => {
            const active = floor === activeFloor;
            const offset = index * 26;
            return (
              <button
                key={floor}
                onClick={() => onSelectFloor(floor)}
                className={cn(
                  'absolute left-[15%] top-[20%] h-[54%] w-[68%] rounded border text-left transition',
                  active ? 'z-20 border-blue-500 bg-blue-200/35 shadow-lg shadow-blue-200/60' : 'z-10 border-sky-300 bg-sky-100/25 hover:bg-sky-100/40'
                )}
                style={{ transform: `translate(${offset}px, ${offset * 0.45}px)` }}
              >
                <div className="absolute inset-8 rounded border-[6px] border-slate-700/35 bg-white/35">
                  <div className="absolute left-0 top-1/2 h-[6px] w-full -translate-y-1/2 bg-blue-400/30" />
                  <div className="absolute left-1/2 top-0 h-full w-[6px] -translate-x-1/2 bg-blue-400/30" />
                  <div className="absolute left-[12%] top-[15%] h-[22%] w-[30%] rounded-lg border border-slate-500/30" />
                  <div className="absolute right-[12%] top-[15%] h-[22%] w-[30%] rounded-lg border border-slate-500/30" />
                  <div className="absolute left-[20%] bottom-[16%] h-[24%] w-[56%] rounded-lg border border-slate-500/30" />
                </div>
                <span className={cn('absolute left-3 top-3 rounded px-2 py-1 text-xs font-semibold', active ? 'bg-blue-600 text-white' : 'bg-white/80 text-blue-700')}>
                  {floorDisplayName(floor)}
                </span>
              </button>
            );
          })}

          <div className="absolute bottom-5 left-8 text-[10px] leading-5 text-blue-500/80">
            <div>单位：米 · 对齐当前 Building 下的 Floor Plans。</div>
            <div>部署到 Studio 时将生成：我的家 / Building / Floor Plan / Room。</div>
          </div>
        </div>
      </div>

      <aside className="absolute right-5 top-20 z-20 w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-300/40">
        {!canAlign ? (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            Add a floor plan to the current Building first.
          </div>
        ) : null}
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">Current Building</div>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{floors.length}</span>
        </div>
        <div className="space-y-1">
          {floors.map(floor => (
            <button
              key={floor}
              onClick={() => onSelectFloor(floor)}
              className={cn(
                'flex h-9 w-full items-center gap-2 rounded-lg border px-2 text-left text-xs font-semibold transition',
                activeFloor === floor ? 'border-blue-400 bg-blue-50 text-slate-900' : 'border-transparent text-slate-600 hover:bg-slate-50'
              )}
            >
              <Grid2X2 size={12} className="text-slate-400" />
              <span className="min-w-0 flex-1 truncate">{floorDisplayName(floor)}</span>
              <span className={cn('h-2 w-2 rounded-full', activeFloor === floor ? 'bg-blue-600' : 'bg-slate-300')} />
            </button>
          ))}
        </div>
        <div className="mt-4 text-xs font-semibold text-slate-500">Reference</div>
        <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-[11px] font-medium text-slate-400">
          Drag imported floor plans here as alignment references
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={onAddFloor} className="flex h-9 flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700">
            <Plus size={12} />
            Add Floor
          </button>
          <button
            onClick={canAlign ? onDone : undefined}
            disabled={!canAlign}
            className={cn(
              'h-9 flex-1 rounded-xl text-xs font-semibold transition',
              canAlign ? 'bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-slate-100 text-slate-400'
            )}
          >
            Apply
          </button>
        </div>
      </aside>
    </div>
  );
}

function ResourceSidebar({
  stage,
  activeFloor,
  project,
  onOpenDeviceLibrary,
  onRecommendDevices,
  onSelectFurniture,
  onClose,
}: {
  stage: StageId;
  activeFloor: string;
  project: ProjectModel;
  onOpenDeviceLibrary: () => void;
  onRecommendDevices: () => void;
  onSelectFurniture: (id: string) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'structures' | 'products' | 'source'>('structures');
  const furniture = furnitureProductsForFloor(activeFloor);
  const tabs = [
    { id: 'structures' as const, label: 'Structures', icon: Square },
    { id: 'products' as const, label: 'Generic Products', icon: Layers3 },
    { id: 'source' as const, label: 'Source', icon: Cpu },
  ];
  const sourceCount = project.devicesList.length;

  return (
    <aside className="absolute bottom-28 right-5 top-[70px] z-40 flex w-[300px] overflow-hidden rounded-[24px] border border-slate-200 bg-white/96 text-slate-900 shadow-xl shadow-slate-300/60 backdrop-blur-xl">
      <div className="w-[74px] border-r border-slate-200 bg-slate-50/80 p-2">
        <div className="space-y-1">
          {tabs.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-3 text-center text-[10px] font-semibold leading-tight transition',
                  active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto p-3">
        {activeTab === 'structures' ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Structures</div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">{stage === 'floor' ? 'Active' : 'Ready'}</span>
                <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="收起资源库">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Draw Wall', icon: Square },
                { label: 'Door', icon: DoorOpen },
                { label: 'Window', icon: Grid2X2 },
                { label: 'Measure', icon: Radio },
              ].map(item => (
                <button key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50">
                  <item.icon size={16} className="text-slate-600" />
                  <div className="mt-3 text-xs font-semibold text-slate-800">{item.label}</div>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="text-xs font-semibold text-slate-900">Floor Plan</div>
              <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>{activeFloor}</span>
                <span>{project.area}</span>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'products' ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Generic Products</div>
              <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="收起资源库">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {furniture.slice(0, 6).map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelectFurniture(item.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <ProductPreview kind="furniture" type={item.type} compact />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-slate-900">{item.name}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-500">{item.brand} · {item.price}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === 'source' ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Source</div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">{sourceCount}</span>
                <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="收起资源库">
                  <X size={14} />
                </button>
              </div>
            </div>
            <button
              onClick={onOpenDeviceLibrary}
              className="mb-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
            >
              <Plus size={14} />
              设备库
            </button>
            <button
              onClick={onRecommendDevices}
              className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <Wand2 size={14} />
              AI 自动布点
            </button>
            <div className="space-y-2">
              {DEVICE_LIBRARY.slice(0, 5).map(device => (
                <button
                  key={device.id}
                  draggable
                  onDragStart={event => event.dataTransfer.setData('application/aqara-device', device.id)}
                  onClick={onOpenDeviceLibrary}
                  className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <DeviceIcon type={device.type} />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700">{device.name}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{device.price}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function PointDesignPanel({
  deviceCount,
  onOpenDeviceLibrary,
  onRecommendDevices,
}: {
  deviceCount: number;
  onOpenDeviceLibrary: () => void;
  onRecommendDevices: () => void;
}) {
  return (
    <section className="absolute right-5 top-20 z-30 w-[340px] rounded-[24px] border border-slate-200 bg-white/96 p-4 text-slate-900 shadow-2xl shadow-slate-300/60 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">点位设计</div>
          <div className="mt-0.5 text-[11px] font-medium text-slate-400">{deviceCount ? `${deviceCount} 个推荐点位` : '画像设定后开始布点'}</div>
        </div>
        <button onClick={onOpenDeviceLibrary} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
          设备库
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PERSONA_REQUIREMENTS.map(item => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <item.icon size={15} className="text-blue-600" />
            <div className="mt-2 text-[10px] font-medium text-slate-400">{item.label}</div>
            <div className="mt-1 text-xs font-semibold leading-5 text-slate-800">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-slate-600">
        这是我的户型图，我想要预算 $1,800，请基于该户型图帮我推荐设备。
      </div>
      <button
        onClick={onRecommendDevices}
        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
      >
        <Wand2 size={14} />
        AI 自动布点
      </button>
    </section>
  );
}

function StageActionBar({
  stage,
  completedStages,
  onStageChange,
  onCompleteStage,
  onOpenDeviceLibrary,
  onRecommendDevices,
}: {
  stage: StageId;
  completedStages: StageId[];
  onStageChange: (stage: StageId) => void;
  onCompleteStage: (stage: StageId, nextStage?: StageId) => void;
  onOpenDeviceLibrary: () => void;
  onRecommendDevices: () => void;
}) {
  const actions =
    stage === 'floor'
      ? [
          { label: '比例尺 1:100', icon: Radio },
          { label: 'Draw Wall', icon: Square },
          { label: '门窗', icon: DoorOpen },
          { label: 'Measurements', icon: Radio },
          { label: 'Annotate', icon: Pencil },
        ]
      : stage === 'points'
        ? [
            { label: 'Agent 推荐', icon: Wand2, action: onRecommendDevices },
            { label: 'Source', icon: Cpu, action: onOpenDeviceLibrary },
            { label: '覆盖校验', icon: Radar },
          ]
        : [
            { label: '生成场景', icon: Sparkles },
            { label: '更新图谱', icon: ListTree, action: () => onCompleteStage('logic') },
            { label: '方案确认', icon: FileCheck2, action: () => onCompleteStage('logic', 'review') },
          ];
  const isDone = completedStages.includes(stage);

  return (
    <div className="absolute bottom-28 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-slate-200 bg-white/96 p-1 shadow-xl shadow-slate-300/60 backdrop-blur-xl">
      <span className={cn(
        'ml-1 flex h-8 items-center rounded-xl px-2.5 text-[11px] font-semibold',
        isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      )}>
        {isDone ? '已完成' : '进行中'}
      </span>
      {actions.map(item => (
        <button
          key={item.label}
          onClick={item.action}
          className="flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <item.icon size={14} />
          {item.label}
        </button>
      ))}
      {stage === 'floor' ? (
        <button onClick={() => onCompleteStage('floor', 'logic')} className="ml-1 flex h-9 items-center rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white">
          保存空间设计
        </button>
      ) : null}
      {stage === 'points' ? (
        <button onClick={() => onCompleteStage('points', 'logic')} className="ml-1 flex h-9 items-center rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white">
          保存点位
        </button>
      ) : null}
    </div>
  );
}

function AutomationScenePanel({ project, onReview }: { project: ProjectModel; onReview: () => void }) {
  const scenes = [
    { title: '起夜路径', trigger: 'FP400 detects motion', action: '走廊灯 18% · 窗帘保持关闭' },
    { title: '离家安防', trigger: '全员离家 + 门锁上锁', action: '摄像头布防 · 非必要插座断电' },
    { title: '观影模式', trigger: '客厅 TV on', action: '主灯关闭 · 氛围灯 32%' },
  ];
  return (
    <section className="absolute right-5 top-20 z-30 w-[360px] rounded-[24px] border border-slate-200 bg-white/96 p-4 text-slate-900 shadow-2xl shadow-slate-300/60 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">自动化场景</div>
          <div className="mt-0.5 text-[11px] font-medium text-slate-400">基于空间语义与 {project.devicesList.length} 个点位生成</div>
        </div>
        <button onClick={onReview} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Overview</button>
      </div>
      <div className="space-y-2">
        {scenes.map(scene => (
          <div key={scene.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Zap size={14} className="text-blue-600" />
              {scene.title}
            </div>
            <div className="mt-2 grid gap-1 text-[11px] text-slate-500">
              <div><span className="font-semibold text-slate-700">If</span> {scene.trigger}</div>
              <div><span className="font-semibold text-slate-700">Then</span> {scene.action}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SelectedDevicesPanel({
  items,
  onPlaceSelected,
  onStartPlacement,
  onClear,
}: {
  items: Array<{ device: DeviceTemplate; quantity: number }>;
  onPlaceSelected: () => void;
  onStartPlacement: (template: DeviceTemplate, quantity: number) => void;
  onClear: () => void;
}) {
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const selectedCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="absolute right-5 top-20 z-[72] w-[260px] rounded-2xl border border-slate-200 bg-white/96 p-3 text-slate-900 shadow-xl shadow-slate-300/50 backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-2">
        <div className="min-w-0 flex-1 text-sm font-semibold text-slate-500">Selected Devices</div>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{selectedCount}</span>
        <button
          onClick={() => setRemoveConfirmOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          title="Remove selected devices"
        >
          <X size={14} />
        </button>
      </div>
      <div className="max-h-[150px] space-y-1 overflow-y-auto pr-1">
        {items.map(({ device, quantity }) => (
          <button
            key={device.id}
            draggable
            onDragStart={event => event.dataTransfer.setData('application/aqara-device', device.id)}
            onClick={() => onStartPlacement(device, quantity)}
            className="flex h-8 w-full items-center gap-2 rounded-xl px-1 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            title={`Place ${device.name} on canvas`}
          >
            <DeviceIcon type={device.type} />
            <span className="min-w-0 flex-1 truncate">{device.name}</span>
            <span className="text-xs font-semibold text-slate-400">x{quantity}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onPlaceSelected}
        className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
      >
        <MapPin size={13} />
        Place Selected
      </button>

      {removeConfirmOpen ? (
        <div className="absolute right-0 top-10 z-20 w-[340px] rounded-[4px] bg-[#2b2b2b] p-5 text-white shadow-2xl">
          <div className="mb-3 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Remove Recommended Devices</div>
              <div className="mt-3 text-sm leading-5 text-slate-200">Are you sure you want to remove all recommended devices?</div>
            </div>
            <button onClick={() => setRemoveConfirmOpen(false)} className="text-slate-300 transition hover:text-white" title="Cancel">
              <X size={18} />
            </button>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setRemoveConfirmOpen(false)} className="h-10 px-4 text-sm font-medium text-slate-300 transition hover:text-white">
              Cancel
            </button>
            <button
              onClick={() => {
                onClear();
                setRemoveConfirmOpen(false);
              }}
              className="h-10 rounded-[4px] bg-rose-500 px-5 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DeviceLibraryDrawer({
  onClose,
  selectedQuantities,
  onQuantityChange,
  onPlaceSelected,
  onStartPlacement,
  onClearSelected,
}: {
  onClose: () => void;
  selectedQuantities: Record<string, number>;
  onQuantityChange: (deviceId: string, delta: number) => void;
  onPlaceSelected: () => void;
  onStartPlacement: (template: DeviceTemplate, quantity: number) => void;
  onClearSelected: () => void;
}) {
  const [category, setCategory] = useState<DeviceCategory | null>(null);
  const [search, setSearch] = useState('');
  const categories: Array<{ id: DeviceCategory; label: string; icon: LucideIcon }> = [
    { id: 'hub', label: 'Cloud Gateways', icon: Cpu },
    { id: 'lock', label: 'Door Access', icon: DoorOpen },
    { id: 'switch', label: 'Switching', icon: Zap },
    { id: 'light', label: 'Lighting', icon: Lightbulb },
    { id: 'sensor', label: 'WiFi & Sensors', icon: Wifi },
    { id: 'camera', label: 'Camera Security', icon: Camera },
    { id: 'curtain', label: 'Curtains & Access', icon: DoorOpen },
  ];
  const filtered = DEVICE_LIBRARY.filter(device => {
    const categoryMatch = !category || device.category === category;
    const keyword = `${device.name} ${device.model}`.toLowerCase();
    return categoryMatch && keyword.includes(search.toLowerCase());
  });
  const showDevices = Boolean(category || search);
  const activeCategory = category ? categories.find(item => item.id === category) : null;
  const selectedDevices = DEVICE_LIBRARY
    .map(device => ({ device, quantity: selectedQuantities[device.id] ?? 0 }))
    .filter(item => item.quantity > 0);
  const selectedCount = selectedDevices.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="absolute right-0 top-0 z-[70] h-full w-[380px] border-l border-slate-200 bg-white p-4 text-slate-900 shadow-2xl shadow-slate-400/40">
      <div className="mb-4 flex items-center gap-2">
        <div>
          <div className="text-sm font-semibold">{activeCategory?.label ?? 'Devices'}</div>
          <div className="mt-0.5 text-[11px] text-slate-400">拖拽到户型图，或点击放置</div>
        </div>
        <button onClick={onClose} className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500">
          <X size={15} />
        </button>
      </div>
      {selectedDevices.length ? (
        <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="min-w-0 flex-1 text-sm font-semibold text-slate-500">Selected Devices</div>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{selectedCount}</span>
            <button
              onClick={onClearSelected}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Clear selected devices"
            >
              <X size={14} />
            </button>
          </div>
          <div className="max-h-[118px] space-y-1 overflow-y-auto pr-1">
            {selectedDevices.map(({ device, quantity }) => (
              <button
                key={device.id}
                draggable
                onDragStart={event => event.dataTransfer.setData('application/aqara-device', device.id)}
                onClick={() => onStartPlacement(device, quantity)}
                className="flex h-8 w-full items-center gap-2 rounded-xl px-1 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                title={`Place ${device.name} on canvas`}
              >
                <DeviceIcon type={device.type} />
                <span className="min-w-0 flex-1 truncate">{device.name}</span>
                <span className="text-xs font-semibold text-slate-400">x{quantity}</span>
              </button>
            ))}
          </div>
          <button
            onClick={onPlaceSelected}
            className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
          >
            <MapPin size={13} />
            Place Selected
          </button>
        </section>
      ) : null}
      <label className="mb-3 flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3">
        <Search size={14} className="text-slate-400" />
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search devices" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
      </label>
      {!showDevices ? (
        <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-2">
          {categories.map(item => {
            const Icon = item.icon;
            const count = DEVICE_LIBRARY.filter(device => device.category === item.id).length;
            return (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className="flex h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950"
              >
                <Icon size={15} className="text-slate-500" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className="text-[11px] text-slate-400">{count}</span>
                <ChevronDown size={14} className="-rotate-90 text-slate-400" />
              </button>
            );
          })}
        </div>
      ) : null}
      {showDevices ? (
        <div className="space-y-2 overflow-y-auto pb-24">
          {category ? (
            <button onClick={() => setCategory(null)} className="mb-2 flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-700">
              <ArrowLeft size={13} />
              Categories
            </button>
          ) : null}
          {filtered.map(device => {
            const quantity = selectedQuantities[device.id] ?? 0;
            return (
            <div
              key={device.id}
              draggable
              onDragStart={event => event.dataTransfer.setData('application/aqara-device', device.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition',
                quantity > 0 ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/40'
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600">
                <DeviceIcon type={device.type} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">{device.name}</div>
                <div className="mt-0.5 truncate text-[11px] text-slate-500">{device.model} · {device.channel}</div>
                <div className="mt-1 text-[10px] text-slate-400">{device.install}</div>
              </div>
              <div className="flex shrink-0 items-center rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => onQuantityChange(device.id, -1)}
                  disabled={quantity === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-l-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                  title={`Remove ${device.name}`}
                >
                  <Minus size={13} />
                </button>
                <span className="flex h-8 min-w-8 items-center justify-center px-1 text-xs font-semibold text-slate-800">{quantity}</span>
                <button
                  onClick={() => onQuantityChange(device.id, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-r-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                  title={`Add ${device.name}`}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
            );
          })}
          {!filtered.length ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-xs font-semibold text-slate-400">
              No devices found
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}

function StudioCanvasTopbar({
  project,
  activeTool,
  saving,
  canvasViewMode,
  overlayMode,
  floors,
  activeFloor,
  activeFloorPlanned,
  buildingName,
  layers,
  onToolChange,
  onOverlayChange,
  onAddFloor,
  onOpenFloorAlignment,
  onOpenDeviceLibrary,
  onExitEditor,
  onSave,
  onSelectFloor,
  onToggleLayer,
}: {
  project: ProjectModel;
  activeTool: ToolId;
  saving: boolean;
  canvasViewMode: '2d' | '3d';
  overlayMode: OverlayMode;
  floors: string[];
  activeFloor: string;
  activeFloorPlanned: boolean;
  buildingName: string;
  layers: Record<LayerId, boolean>;
  onToolChange: (tool: ToolId) => void;
  onOverlayChange: (mode: OverlayMode) => void;
  onAddFloor: () => void;
  onOpenFloorAlignment: () => void;
  onOpenDeviceLibrary: () => void;
  onExitEditor: () => void;
  onSave: () => void;
  onSelectFloor: (floor: string) => void;
  onToggleLayer: (id: LayerId) => void;
}) {
  const primaryTools = canvasViewMode === '3d'
    ? [
        { id: 'select' as ToolId, icon: MousePointer2, title: 'Select' },
        { id: 'pan' as ToolId, icon: Hand, title: 'Pan' },
      ]
    : [
        { id: 'select' as ToolId, icon: MousePointer2, title: 'Select' },
        { id: 'pan' as ToolId, icon: Hand, title: 'Pan' },
        { id: 'comment' as ToolId, icon: MessageCircle, title: 'Comment' },
        { id: 'walls' as ToolId, icon: Square, title: 'Draw Wall' },
        { id: 'room' as ToolId, icon: Grid2X2, title: 'Room' },
        { id: 'person' as ToolId, icon: PersonStanding, title: 'Person Simulation' },
      ];
  return (
    <div className="pointer-events-none absolute left-5 right-5 top-4 z-[82] flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pointer-events-auto flex h-11 shrink-0 items-center rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm">
        <button
          onClick={onExitEditor}
          className="flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
          title="退出编辑器"
        >
          <ArrowLeft size={14} />
          退出编辑器
        </button>
      </div>
      {canvasViewMode === '2d' ? (
      <div className="pointer-events-auto flex h-11 shrink-0 items-center gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm">
        <label className="relative flex h-9 min-w-[132px] items-center rounded-xl bg-white pl-2 pr-7 text-xs font-semibold text-slate-700">
          <Grid2X2 size={13} className="mr-2 shrink-0 text-slate-500" />
          <select
            value={activeFloor}
            onChange={event => onSelectFloor(event.target.value)}
            disabled={!floors.length}
            className="min-w-0 flex-1 appearance-none truncate bg-transparent outline-none disabled:text-slate-400"
            title={buildingName}
          >
            {floors.length ? floors.map(floor => (
              <option key={floor} value={floor}>{floorDisplayName(floor)}</option>
            )) : (
              <option value="">No Floor Plan</option>
            )}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2 text-slate-400" />
        </label>
        <button onClick={onAddFloor} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-700" title="创建 Floor Plan">
          <Plus size={15} />
        </button>
      </div>
      ) : null}

      <div className="pointer-events-auto flex h-11 shrink-0 items-center rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm">
        {primaryTools.map(item => {
          const Icon = item.icon;
          const active = activeTool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onToolChange(item.id)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl transition',
                active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              )}
              title={item.title}
            >
              <Icon size={15} />
            </button>
          );
        })}
        {canvasViewMode === '2d' ? (
          <>
            <span className="mx-1 h-5 w-px bg-slate-200" />
            <button
              onClick={onOpenFloorAlignment}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
              title="Align Floor Plan"
            >
              <Layers2 size={17} strokeWidth={1.8} />
              <AlignHorizontalSpaceAround size={11} strokeWidth={2.4} className="absolute right-1.5 top-1.5 rounded-[3px] bg-white text-blue-600" />
            </button>
          </>
        ) : null}
        {canvasViewMode === '2d' ? (
        <button
          onClick={() => onToggleLayer('furniture')}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl transition',
            layers.furniture ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-300 hover:bg-slate-50'
          )}
          title="Objects"
        >
          <Layers3 size={15} />
        </button>
        ) : null}
        <button
          onClick={(event) => {
            event.stopPropagation();
            onOpenDeviceLibrary();
          }}
          className={cn(
            'flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-xs font-semibold transition',
            activeTool === 'devices' || activeTool === 'coverage' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <Cpu size={14} />
          Add Devices
        </button>
        {canvasViewMode === '2d' ? (
        <button
          onClick={() => onToolChange('logic')}
          className={cn(
            'flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-xs font-semibold transition',
            activeTool === 'logic' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <Link2 size={14} />
          图谱
        </button>
        ) : null}
      </div>

      {canvasViewMode === '2d' ? (
      <div className="pointer-events-auto flex h-11 shrink-0 items-center rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm">
        {[
          { id: 'wifi' as OverlayMode, label: 'Wi-Fi', icon: Wifi },
          { id: 'cameras' as OverlayMode, label: '摄像头', icon: Camera },
          { id: 'radar' as OverlayMode, label: '雷达', icon: Radar },
          { id: 'zigbee' as OverlayMode, label: 'Zigbee', icon: Link2 },
        ].map(item => {
          const Icon = item.icon;
          const active = overlayMode === item.id;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (active) {
                  onOverlayChange('off');
                  if (activeTool === 'coverage') onToolChange('select');
                  return;
                }
                onOverlayChange(item.id);
                if (activeTool !== 'coverage') onToolChange('coverage');
              }}
              className={cn(
                'flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-xs font-semibold transition',
                active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon size={13} />
              {item.label}
            </button>
          );
        })}
        <button
          onClick={() => onOverlayChange('off')}
          className={cn(
            'ml-1 flex h-9 items-center rounded-xl px-3 text-xs font-semibold transition',
            overlayMode === 'off' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
          )}
        >
          关闭
        </button>
      </div>
      ) : null}
      <div className="pointer-events-auto ml-auto flex h-11 shrink-0 items-center rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm">
        <button
          onClick={onSave}
          disabled={saving}
          className={cn(
            'flex h-9 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700',
            saving && 'cursor-not-allowed bg-blue-300 hover:bg-blue-300'
          )}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          保存
        </button>
      </div>
    </div>
  );
}

function StudioSideControls({
  activeTool,
  onToolChange,
  onToggleLayer,
}: {
  activeTool: ToolId;
  onToolChange: (tool: ToolId) => void;
  onToggleLayer: (id: LayerId) => void;
}) {
  return (
    <div className="absolute left-5 top-20 z-40 flex flex-col gap-3">
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm">
        {[
          { id: 'select' as ToolId, icon: Grid2X2, title: '选择' },
          { id: 'coverage' as ToolId, icon: Eye, title: '覆盖' },
          { id: 'logic' as ToolId, icon: Layers3, title: '联动' },
        ].map(item => {
          const Icon = item.icon;
          const active = activeTool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onToolChange(item.id)}
              title={item.title}
              className={cn(
                'mb-1 flex h-9 w-9 items-center justify-center rounded-xl transition last:mb-0',
                active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm">
        <button onClick={() => onToggleLayer('devices')} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50" title="显示设备">
          <Plus size={16} />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50" title="适配视图">
          <Maximize2 size={15} />
        </button>
        <button onClick={() => onToggleLayer('coverage')} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50" title="切换覆盖">
          <Minus size={16} />
        </button>
      </div>
    </div>
  );
}

function DesignOutlinePanel({
  project,
  activeTool,
  activeFloor,
  activeFloorPlanned,
  floors,
  buildingName,
  buildings,
  activeBuildingId,
  buildingComposed,
  open,
  onToggle,
  onClose,
  onAddFloor,
  onComposeBuilding,
  onSelectBuilding,
  onRenameBuilding,
  onCreateBuilding,
  onSelectFloor,
  onToolChange,
  onSelectFurniture,
}: {
  project: ProjectModel;
  activeTool: ToolId;
  activeFloor: string;
  activeFloorPlanned: boolean;
  floors: string[];
  buildingName: string;
  buildings: SpaceBuilding[];
  activeBuildingId: string;
  buildingComposed: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onAddFloor: () => void;
  onComposeBuilding: () => void;
  onSelectBuilding: (buildingId: string) => void;
  onRenameBuilding: (buildingId: string, name: string) => void;
  onCreateBuilding: () => void;
  onSelectFloor: (floor: string) => void;
  onToolChange: (tool: ToolId) => void;
  onSelectFurniture: (id: string) => void;
}) {
  const graphActive = activeTool === 'logic';
  const totalDevices = project.devicesList.length;
  const activeFloorLabel = activeFloor ? floorDisplayName(activeFloor) : 'No Floor Plan';
  const [homeExpanded, setHomeExpanded] = useState(true);
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>({ [activeBuildingId]: true });
  const [expandedFloor, setExpandedFloor] = useState(activeFloor);
  const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
  const [draftBuildingName, setDraftBuildingName] = useState(buildingName);
  const lastBuildingClickRef = useRef<{ id: string; at: number } | null>(null);

  useEffect(() => {
    setExpandedFloor(activeFloor);
  }, [activeFloor]);

  useEffect(() => {
    setDraftBuildingName(buildingName);
  }, [buildingName]);

  useEffect(() => {
    setExpandedBuildings(prev => ({ ...prev, [activeBuildingId]: true }));
  }, [activeBuildingId]);

  const commitBuildingName = (buildingId: string) => {
    onRenameBuilding(buildingId, draftBuildingName);
    setEditingBuildingId(null);
  };

  const renderFloorNode = (item: { floor: string; label: string; roomCount: number }, buildingId = activeBuildingId) => {
    const activeBuilding = buildingId === activeBuildingId;
    const floorExpanded = expandedFloor === item.floor;
    const building = buildings.find(spaceBuilding => spaceBuilding.id === buildingId);
    const floorPlanned = Boolean(building?.plannedFloors.includes(item.floor));
    const floorRooms = roomsForFloor(item.floor).map(room => {
      const deviceCount = project.devicesList.filter(device => roomLabelFor(device.room) === room.label).length;
      return { ...room, deviceCount };
    });

    return (
      <div key={item.floor} className="relative">
        <button
          onClick={() => {
            if (!activeBuilding) {
              onSelectBuilding(buildingId);
              setExpandedFloor(item.floor);
              return;
            }
            if (activeFloor === item.floor) {
              setExpandedFloor(floorExpanded ? '' : item.floor);
            } else {
              onSelectFloor(item.floor);
              setExpandedFloor(item.floor);
            }
          }}
          className={cn(
            'group relative flex h-9 w-full items-center gap-2 rounded-xl px-2 text-left transition',
            activeBuilding && activeFloor === item.floor ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          <span className="absolute -left-[17px] top-1/2 h-px w-3 bg-slate-200" />
          <ChevronDown size={12} className={cn('shrink-0 transition-transform', activeBuilding && activeFloor === item.floor ? 'text-blue-100' : 'text-slate-400', floorExpanded ? '' : '-rotate-90')} />
          <span className={cn('h-1.5 w-1.5 rounded-full', activeBuilding && activeFloor === item.floor ? 'bg-white' : 'bg-blue-500')} />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.label}</span>
          <span className={cn('text-[10px] font-semibold', activeBuilding && activeFloor === item.floor ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-600')}>
            Floor
          </span>
        </button>

        {floorExpanded && floorPlanned ? (
          <div className="ml-[18px] mt-1 space-y-1 border-l border-slate-200 pl-3">
            {floorRooms.map(room => (
              <button
                key={room.id}
                onClick={() => onToolChange('devices')}
                className="group relative flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="absolute -left-[17px] top-1/2 h-px w-3 bg-slate-200" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500" />
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{room.label}</span>
                <span className="text-[10px] font-semibold text-slate-400">{room.deviceCount}</span>
              </button>
            ))}
          </div>
        ) : null}
        {floorExpanded && !floorPlanned ? (
          <div className="ml-[18px] mt-1 border-l border-slate-200 pl-3">
            <div className="relative rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-400">
              <span className="absolute -left-[16px] top-1/2 h-px w-3 bg-slate-200" />
              户型规划后显示房间信息
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderBuildingNode = (building: SpaceBuilding) => {
    const activeBuilding = building.id === activeBuildingId;
    const buildingExpanded = expandedBuildings[building.id] ?? activeBuilding;
    const buildingFloorSummaries = building.floors.map(floor => ({
      floor,
      label: floorDisplayName(floor),
      roomCount: roomsForFloor(floor).length,
    }));

    return (
      <div key={building.id} className="relative">
        <button
          onClick={() => {
            const now = Date.now();
            const lastBuildingClick = lastBuildingClickRef.current;
            if (lastBuildingClick?.id === building.id && now - lastBuildingClick.at < 520) {
              onSelectBuilding(building.id);
              setDraftBuildingName(building.name);
              setEditingBuildingId(building.id);
              lastBuildingClickRef.current = null;
              return;
            }
            lastBuildingClickRef.current = { id: building.id, at: now };
            onSelectBuilding(building.id);
            setExpandedBuildings(prev => ({ ...prev, [building.id]: !buildingExpanded }));
          }}
          onDoubleClick={event => {
            event.stopPropagation();
            onSelectBuilding(building.id);
            setDraftBuildingName(building.name);
            setEditingBuildingId(building.id);
          }}
          className={cn(
            'group relative flex h-9 w-full items-center gap-2 rounded-xl px-2 text-left transition',
            activeBuilding ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          <span className="absolute -left-[17px] top-1/2 h-px w-3 bg-slate-200" />
          <ChevronDown size={12} className={cn('shrink-0 text-slate-400 transition-transform', buildingExpanded ? '' : '-rotate-90')} />
          <span className={cn('h-2 w-2 rounded-full', activeBuilding ? 'bg-blue-600' : 'bg-slate-800')} />
          {editingBuildingId === building.id ? (
            <input
              value={draftBuildingName}
              onChange={event => setDraftBuildingName(event.target.value)}
              onBlur={() => commitBuildingName(building.id)}
              onKeyDown={event => {
                if (event.key === 'Enter') commitBuildingName(building.id);
                if (event.key === 'Escape') {
                  setDraftBuildingName(building.name);
                  setEditingBuildingId(null);
                }
              }}
              onClick={event => event.stopPropagation()}
              className="min-w-0 flex-1 rounded-lg border border-blue-200 bg-white px-2 py-1 text-xs font-semibold text-slate-900 outline-none"
              autoFocus
            />
          ) : (
            <span
              onDoubleClick={event => {
                event.stopPropagation();
                onSelectBuilding(building.id);
                setDraftBuildingName(building.name);
                setEditingBuildingId(building.id);
              }}
              className="min-w-0 flex-1 truncate text-xs font-semibold"
              title="双击修改 Building 名称"
            >
              {building.name}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Space</span>
        </button>

        {buildingExpanded ? (
          <div className="ml-[18px] space-y-1 border-l border-slate-200 pl-3">
            {buildingFloorSummaries.length ? buildingFloorSummaries.map(item => renderFloorNode(item, building.id)) : (
              <div className="relative rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-[11px] font-medium text-slate-400">
                <span className="absolute -left-[17px] top-1/2 h-px w-3 bg-slate-200" />
                未创建 Floor Plan
              </div>
            )}
            {activeBuilding ? (
              <button
                onClick={onAddFloor}
                className="group relative flex h-9 w-full items-center gap-2 rounded-xl border border-dashed border-slate-200 px-2 text-left text-slate-500 transition hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-700"
              >
                <span className="absolute -left-[17px] top-1/2 h-px w-3 bg-slate-200" />
                <Plus size={12} />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold">{building.floors.length ? '创建 Floor Plan' : '创建 Floor Plan 1'}</span>
                <span className="text-[10px] font-medium text-slate-400 group-hover:text-blue-600">Floor</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  if (!open) {
    return (
      <div className="absolute left-20 top-20 z-40">
        <button
          onClick={onToggle}
          className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 text-xs font-semibold text-slate-800 shadow-sm shadow-slate-300/40 backdrop-blur-xl transition hover:border-blue-200 hover:text-blue-700"
          title="展开空间树"
        >
          <ListTree size={15} className="text-blue-600" />
          <span>我的家</span>
          <span className="text-slate-300">/</span>
          <span className="max-w-[150px] truncate">{buildingName}</span>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-700">{activeFloorLabel}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute bottom-28 left-20 top-24 z-40 w-[292px] overflow-hidden rounded-[24px] border border-slate-200 bg-white/96 text-slate-900 shadow-xl shadow-slate-300/50 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-3">
        <button
          onClick={onClose}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1 py-1 text-left transition hover:bg-slate-50"
          title="收起空间树"
        >
          <ListTree size={16} className="shrink-0 text-blue-600" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">空间树</span>
            <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-400">Space / {buildingName}</span>
          </span>
          <ChevronUp size={14} className="ml-auto shrink-0 text-slate-400" />
        </button>
        <button
          onClick={() => onToolChange(graphActive ? 'devices' : 'logic')}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 transition',
            graphActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
          )}
          title="空间图谱"
        >
          <Share2 size={14} />
        </button>
      </div>

      <div className="max-h-[calc(100vh-170px)] overflow-y-auto p-3 pr-2">
        <div className="space-y-1">
          <button
            onClick={() => setHomeExpanded(value => !value)}
            className="group flex h-10 w-full items-center gap-2 rounded-xl px-2 text-left transition hover:bg-slate-50"
          >
            <ChevronDown size={13} className={cn('shrink-0 text-slate-400 transition-transform', homeExpanded ? '' : '-rotate-90')} />
            <Home size={15} className="shrink-0 text-blue-600" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950">我的家</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Space</span>
          </button>

          {homeExpanded ? (
            <div className="ml-[18px] space-y-1 border-l border-slate-200 pl-3">
              {buildings.map(renderBuildingNode)}
              <button
                onClick={onCreateBuilding}
                className="group relative flex h-9 w-full items-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/40 px-2 text-left text-blue-700 transition hover:bg-blue-50"
              >
                <span className="absolute -left-[17px] top-1/2 h-px w-3 bg-slate-200" />
                <Plus size={12} />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold">新建 Building</span>
                <span className="text-[10px] font-medium text-blue-500">Space</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function DesignPackagePanel({
  project,
  editMode,
  dirty,
  completedStages,
}: {
  project: ProjectModel;
  editMode: boolean;
  dirty: boolean;
  completedStages: StageId[];
}) {
  const linked = project.studio !== 'Not Bound' && !project.studio.includes('Pending');
  const rows = [
    { label: '空间', value: completedStages.includes('floor') ? '已确认' : '定标中', done: completedStages.includes('floor') },
    { label: '点位', value: `${project.devicesList.length} 点位`, done: completedStages.includes('points') },
    { label: '图谱', value: completedStages.includes('logic') ? '已更新' : '待推理', done: completedStages.includes('logic') },
    { label: 'Studio', value: linked ? '已关联' : '待关联', done: linked },
  ];

  return (
    <section className="absolute bottom-24 right-5 z-30 w-[308px] rounded-[24px] border border-slate-200 bg-white/95 p-4 text-slate-900 shadow-xl shadow-slate-300/50 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">方案包</div>
          <div className="mt-0.5 text-[11px] font-medium text-slate-400">{editMode ? '编辑中' : '可部署检查'}</div>
        </div>
        {dirty ? (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">未保存</span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">已同步</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {rows.map(row => (
          <div key={row.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium text-slate-400">{row.label}</span>
              <CheckCircle2 size={12} className={row.done ? 'text-emerald-500' : 'text-slate-300'} />
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-900">{row.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CanvasConfigPanel({
  config,
  onChange,
  onReset,
}: {
  config: CanvasConfig;
  onChange: (nextConfig: Partial<CanvasConfig>) => void;
  onReset: () => void;
}) {
  return (
    <section className="absolute right-5 top-20 z-50 w-[340px] rounded-[24px] border border-slate-200 bg-white/98 px-5 py-5 text-slate-900 shadow-2xl shadow-slate-300/70 backdrop-blur-xl">
      <ConfigSlider label="图标大小" value={config.iconSize} onChange={(value) => onChange({ iconSize: value })} />
      <ConfigSlider label="图标与标签显示" value={config.labelVisibility} onChange={(value) => onChange({ labelVisibility: value })} />
      <div className="my-4 h-px bg-slate-200" />
      <ConfigSwitch label="设备名称" checked={config.showDeviceName} onChange={(value) => onChange({ showDeviceName: value })} />
      <ConfigSwitch label="设备型号" checked={config.showDeviceModel} onChange={(value) => onChange({ showDeviceModel: value })} />
      <ConfigSwitch label="连接状态" checked={config.showConnectivity} onChange={(value) => onChange({ showConnectivity: value })} />
      <div className="my-4 h-px bg-slate-200" />
      <ConfigSlider label="覆盖透明度" value={config.coverageOpacity} onChange={(value) => onChange({ coverageOpacity: value })} />
      <ConfigSlider label="墙体透明度" value={config.wallsOpacity} onChange={(value) => onChange({ wallsOpacity: value })} />
      <ConfigSlider label="家具透明度" value={config.objectsOpacity} onChange={(value) => onChange({ objectsOpacity: value })} />
      <button onClick={onReset} className="mt-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700">
        恢复默认
      </button>
    </section>
  );
}

function ConfigSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-5 block last:mb-0">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="w-full accent-blue-600"
      />
    </label>
  );
}

function ConfigSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button onClick={() => onChange(!checked)} className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-slate-600 last:mb-0">
      <span>{label}</span>
      <span className={cn('relative h-8 w-14 rounded-full transition', checked ? 'bg-blue-600' : 'bg-slate-300')}>
        <span className={cn('absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition', checked ? 'left-7' : 'left-1')} />
      </span>
    </button>
  );
}

function AutomationEditorCanvas({
  project,
  activeFloor,
  floorPlanPreviewUrl,
  scenes,
  activeSceneId,
  onOpenScene,
  onBackToList,
  onEditSpace,
  onSaveScene,
  onGenerateAutomation,
}: {
  project: ProjectModel;
  activeFloor: string;
  floorPlanPreviewUrl: string;
  scenes: AutomationScene[];
  activeSceneId: string | null;
  onOpenScene: (sceneId: string) => void;
  onBackToList: () => void;
  onEditSpace: () => void;
  onSaveScene: () => void;
  onGenerateAutomation: () => void;
}) {
  const activeScene = scenes.find(scene => scene.id === activeSceneId) ?? null;
  if (activeScene) {
    return (
      <AutomationFlowEditorCanvas
        project={project}
        activeFloor={activeFloor}
        scenes={scenes}
        scene={activeScene}
        onBack={onBackToList}
        onEditSpace={onEditSpace}
        onSave={onSaveScene}
        onOpenScene={onOpenScene}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f5f8fc] p-4 text-slate-900">
      <section className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(420px,0.78fr)_minmax(560px,1.22fr)]">
        <main className="min-h-0 overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Space Preview</div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-950">空间预览</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEditSpace}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
              >
                <Layers3 size={13} />
                进入空间编辑器
              </button>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <Layers3 size={13} className="text-blue-600" />
                {activeFloor || '1F'} · {project.devicesList.length} devices
              </div>
            </div>
          </header>
          <button
            type="button"
            onClick={onEditSpace}
            className="block h-[calc(100%-64px)] w-full p-5 text-left outline-none transition hover:bg-blue-50/20 focus-visible:ring-4 focus-visible:ring-blue-100"
            title="进入空间设计编辑器"
          >
            <SpaceThreeDPlanPreview
              project={project}
              activeFloor={activeFloor}
              previewUrl={floorPlanPreviewUrl}
              sceneCount={scenes.length}
            />
          </button>
        </main>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Automation List</div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">自动化列表</h2>
            </div>
            <button
              onClick={onGenerateAutomation}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
            >
              <Sparkles size={14} />
              AI 生成
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {scenes.length ? (
              <div className="space-y-2">
                {scenes.map((scene, index) => (
                  <button
                    key={scene.id}
                    onClick={() => onOpenScene(scene.id)}
                    className="group grid w-full grid-cols-[32px_minmax(0,1fr)_34px] items-center gap-3 rounded-[10px] border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/30"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700">{index + 1}</span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900">{scene.name}</span>
                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', scene.status === 'Ready' ? 'bg-emerald-50 text-emerald-600' : scene.status === 'Review' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500')}>
                          {scene.status}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">{scene.spaces.join(' / ')}</span>
                      <span className="mt-1 block truncate text-[11px] text-slate-400">{scene.description}</span>
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-hover:border-blue-200 group-hover:bg-white group-hover:text-blue-600">
                      <ArrowLeft size={14} className="rotate-180" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[12px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  <Bot size={22} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">还没有自动化</h3>
                <button
                  onClick={onGenerateAutomation}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
                >
                  <Sparkles size={15} />
                  Generate automations
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            空间输入 · 户型 / 房间 / 点位
          </div>
        </aside>
      </section>
    </div>
  );
}

function SpaceThreeDPlanPreview({
  project,
  activeFloor,
  previewUrl,
  sceneCount,
}: {
  project: ProjectModel;
  activeFloor: string;
  previewUrl: string;
  sceneCount: number;
}) {
  const rooms = roomsForFloor(activeFloor);

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-[14px] border border-slate-200 bg-[#edf2f8] [perspective:1100px]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(51,65,85,0.06)_1px,transparent_1px),linear-gradient(rgba(51,65,85,0.06)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute left-5 top-5 z-20 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
        3D Preview · {floorDisplayName(activeFloor)}
      </div>
      <div className="absolute right-5 top-5 z-20 flex gap-2">
        <PropertyTile label="Scenes" value={`${sceneCount}`} />
        <PropertyTile label="Devices" value={`${project.devicesList.length}`} />
      </div>
      <div className="absolute inset-x-[7%] bottom-[3%] top-[12%] [transform:rotateX(58deg)_rotateZ(-35deg)] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-[18px] border border-slate-300 bg-white shadow-2xl shadow-slate-400/50" />
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Uploaded floor plan"
            className="absolute inset-[2%] h-[96%] w-[96%] rounded-[12px] object-contain opacity-55"
            style={{ transform: 'translateZ(2px)' }}
          />
        ) : null}
        {rooms.map(room => (
          <div
            key={room.id}
            className={cn('absolute border border-slate-400/70 shadow-sm', room.tone)}
            style={{
              left: `${room.x}%`,
              top: `${room.y}%`,
              width: `${room.w}%`,
              height: `${room.h}%`,
              transform: 'translateZ(10px)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-2 bg-slate-700/25" />
            <div className="absolute left-2 top-2 rounded bg-white/75 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 [transform:rotateZ(35deg)_rotateX(-58deg)]">
              {room.label}
            </div>
          </div>
        ))}
        {project.devicesList.slice(0, 12).map(device => (
          <div
            key={device.pointCode}
            className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-lg [transform:translateZ(58px)]"
            style={{ left: `${device.x}%`, top: `${device.y}%` }}
            title={device.name}
          >
            <DeviceIcon type={device.type} />
          </div>
        ))}
      </div>
      <div className="absolute bottom-5 left-5 z-20 max-w-[360px] rounded-2xl border border-white/80 bg-white/88 px-4 py-3 text-xs leading-5 text-slate-500 shadow-sm">
        <div className="font-semibold text-slate-800">空间规划已锁定为场景输入</div>
        <div className="mt-1">户型 / 比例尺 / 点位</div>
      </div>
    </div>
  );
}

function AutomationFlowEditorCanvas({
  project,
  activeFloor,
  scenes,
  scene,
  onBack,
  onEditSpace,
  onSave,
  onOpenScene,
}: {
  project: ProjectModel;
  activeFloor: string;
  scenes: AutomationScene[];
  scene: AutomationScene;
  onBack: () => void;
  onEditSpace: () => void;
  onSave: () => void;
  onOpenScene: (sceneId: string) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f4f7fb] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(51,65,85,0.08)_1px,transparent_1px),linear-gradient(rgba(51,65,85,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <header className="absolute left-4 right-4 top-4 z-20 flex h-11 items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
            <ArrowLeft size={14} />
            退出编辑器
          </button>
          <button onClick={onEditSpace} className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
            <Layers3 size={14} />
            空间设计
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm">
          <span className="pl-3 text-xs font-semibold text-slate-600">调试模式</span>
          <button className="relative h-7 w-12 rounded-full bg-slate-200" title="调试模式">
            <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm" />
          </button>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-blue-200 hover:text-blue-700" title="运行">
            <Radio size={15} />
          </button>
          <button onClick={onSave} className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700">
            <Save size={15} />
            保存
          </button>
        </div>
      </header>

      <section className="absolute left-8 top-20 z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
          <Zap size={12} />
          Scene Design
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">自动化场景方案</h1>
        <div className="mt-1 text-xs font-medium text-slate-500">{activeFloor} · {project.devicesList.length} 个设备与空间语义</div>
      </section>

      <div className="absolute inset-y-28 left-16 right-[360px]">
        <FlowNode className="left-[3%] top-[40%] border-blue-200 bg-blue-50" icon={Radar} label="WHEN" text={scene.trigger} />
        <FlowNode className="left-[32%] top-[26%] border-amber-200 bg-amber-50" icon={ShieldCheck} label="AND" text={scene.condition} />
        <FlowNode className="left-[32%] top-[58%] border-slate-200 bg-white" icon={Home} label="AND" text={scene.spaces.join(' / ')} />
        <FlowNode className="left-[70%] top-[42%] border-emerald-200 bg-emerald-50" icon={Zap} label="THEN" text={scene.action} />
        <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <path d="M 210 308 C 350 308 345 200 470 205" fill="none" stroke="#94a3b8" strokeWidth="6" strokeDasharray="16 14" strokeLinecap="round" opacity="0.75" />
          <path d="M 210 308 C 350 308 345 430 470 435" fill="none" stroke="#94a3b8" strokeWidth="6" strokeDasharray="16 14" strokeLinecap="round" opacity="0.75" />
          <path d="M 620 205 C 760 215 760 300 900 318" fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
          <path d="M 620 435 C 760 425 760 335 900 318" fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        </svg>
        <button className="absolute bottom-[8%] left-[34%] rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-500">
          + Add condition
        </button>
        <button className="absolute bottom-[24%] right-[18%] rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-500">
          + Add action
        </button>
      </div>

      <aside className="absolute bottom-5 right-5 top-20 z-20 w-[320px] overflow-hidden rounded-[18px] border border-slate-200 bg-white/94 shadow-xl shadow-slate-300/50 backdrop-blur-xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-900">场景清单</div>
          <div className="mt-0.5 text-[11px] text-slate-400">{scenes.length} scenes</div>
        </div>
        <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-3">
          <div className="space-y-2">
            {scenes.map(item => (
              <button
                key={item.id}
                onClick={() => onOpenScene(item.id)}
                className={cn(
                  'w-full rounded-[12px] border p-3 text-left transition',
                  item.id === scene.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
                    <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">{item.spaces.join(' / ')}</div>
                  </div>
                  <span className={cn('rounded-full px-2 py-1 text-[10px] font-semibold', item.status === 'Ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                    {item.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-[12px] border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] leading-5 text-slate-600">
            Agent 可以继续把场景拆成 HomeKit / Aqara Home 的触发、条件、动作和兜底策略。
          </div>
        </div>
      </aside>
    </div>
  );
}

function FlowNode({
  className,
  icon: Icon,
  label,
  text,
}: {
  className: string;
  icon: LucideIcon;
  label: string;
  text: string;
}) {
  return (
    <div className={cn('absolute z-10 w-[210px] rounded-[18px] border px-4 py-4 shadow-sm', className)}>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-slate-500">
        <Icon size={13} className="text-blue-600" />
        {label}
      </div>
      <div className="text-sm font-semibold leading-6 text-slate-800">{text}</div>
    </div>
  );
}

function SceneAutomationCanvas({ project, activeFloor }: { project: ProjectModel; activeFloor: string }) {
  const scenes = [
    {
      name: '起夜路径',
      trigger: 'FP400 detects presence',
      condition: '22:30 - 06:30 · family home',
      action: '走廊灯 18% · 卧室窗帘保持关闭',
      room: '客厅 / 廊厅',
      status: 'ready',
    },
    {
      name: '离家安防',
      trigger: 'All members away + door locked',
      condition: 'No presence for 12 min',
      action: '摄像头布防 · 门窗异常推送',
      room: '全屋',
      status: 'review',
    },
    {
      name: '观影模式',
      trigger: 'Living TV on',
      condition: '客厅有人 · 环境光 < 120 lux',
      action: '主灯关闭 · 氛围灯 32%',
      room: '客厅',
      status: 'ready',
    },
  ];
  const columns = [
    { label: 'Trigger', icon: Radar, rows: scenes.map(scene => scene.trigger) },
    { label: 'Condition', icon: ShieldCheck, rows: scenes.map(scene => scene.condition) },
    { label: 'Action', icon: Zap, rows: scenes.map(scene => scene.action) },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white/70 shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(51,65,85,0.07)_1px,transparent_1px),linear-gradient(rgba(51,65,85,0.07)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
              <Sparkles size={12} />
              Scene Design
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">自动化场景方案</h2>
            <div className="mt-1 text-xs font-medium text-slate-500">{activeFloor} · {project.devicesList.length} 个点位参与推理</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Scenes</div>
            <div className="mt-1 text-xl font-semibold text-slate-950">{scenes.length}</div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid gap-3 md:grid-cols-3">
            {columns.map((column, columnIndex) => (
              <section key={column.label} className="rounded-[22px] border border-slate-200 bg-white/92 p-3 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <column.icon size={15} />
                  </span>
                  {column.label}
                </div>
                <div className="space-y-3">
                  {column.rows.map((row, index) => (
                    <div key={`${column.label}-${row}`} className="relative rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium leading-5 text-slate-700">
                      {columnIndex < columns.length - 1 ? (
                        <span className="absolute -right-4 top-1/2 h-px w-4 bg-slate-300" />
                      ) : null}
                      <span className="mb-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400">Scene {index + 1}</span>
                      <div>{row}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="rounded-[22px] border border-slate-200 bg-white/92 p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-slate-900">场景清单</div>
            <div className="space-y-2">
              {scenes.map(scene => (
                <div key={scene.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{scene.name}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{scene.room}</div>
                    </div>
                    <span className={cn(
                      'rounded-full px-2 py-1 text-[10px] font-semibold',
                      scene.status === 'ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'
                    )}>
                      {scene.status === 'ready' ? 'Ready' : 'Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-slate-600">
              Agent 可以继续把场景拆成 HomeKit / Aqara Home 的触发、条件、动作和兜底策略。
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SpaceKnowledgeGraph({ project, activeFloor }: { project: ProjectModel; activeFloor: string }) {
  const rooms = roomsForFloor(activeFloor).slice(0, 9);
  const center = { id: 'home', label: '我的家', type: 'home', x: 50, y: 50, size: 72 };
  const building = { id: 'building', label: '住宅', type: 'building', x: 50, y: 30, size: 56 };
  const floor = { id: 'floor', label: `${activeFloor} Floor`, type: 'floor', x: 50, y: 68, size: 54 };
  const roomNodes = rooms.map((room, index) => {
    const angle = (Math.PI * 2 * index) / rooms.length - Math.PI / 2;
    return {
      id: room.id,
      label: room.label,
      type: 'room',
      x: 50 + Math.cos(angle) * 27,
      y: 50 + Math.sin(angle) * 27,
      size: 42,
    };
  });
  const zoneNodes = rooms.slice(0, 6).map((room, index) => {
    const base = roomNodes[index];
    const dx = index % 2 === 0 ? -7 : 7;
    const dy = index < 3 ? -8 : 8;
    return {
      id: `${room.id}-zone`,
      label: index % 2 === 0 ? '活动区' : '静区',
      type: 'zone',
      x: Math.max(6, Math.min(94, base.x + dx)),
      y: Math.max(8, Math.min(92, base.y + dy)),
      size: 26,
    };
  });
  const deviceNodes = project.devicesList.slice(0, 6).map((device, index) => {
    const room = roomNodes[index % roomNodes.length] ?? roomNodes[0];
    return {
      id: device.pointCode,
      label: device.name,
      type: 'device',
      x: Math.max(5, Math.min(95, room.x + (index % 2 ? 8 : -8))),
      y: Math.max(7, Math.min(93, room.y + (index % 3 ? 6 : -6))),
      size: 28,
    };
  });
  const nodes = [center, building, floor, ...roomNodes, ...zoneNodes, ...deviceNodes];
  const edges = [
    { from: 'home', to: 'building', label: 'contains' },
    { from: 'building', to: 'floor', label: 'hasFloor' },
    ...roomNodes.map(node => ({ from: 'floor', to: node.id, label: 'contains' })),
    ...zoneNodes.map((node, index) => ({ from: roomNodes[index]?.id ?? 'floor', to: node.id, label: 'hasZone' })),
    ...deviceNodes.map((node, index) => ({ from: roomNodes[index % roomNodes.length]?.id ?? 'floor', to: node.id, label: 'isInstalledIn' })),
  ];
  const nodeById = Object.fromEntries(nodes.map(node => [node.id, node]));

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white/55 shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(51,65,85,0.08)_1px,transparent_1px),linear-gradient(rgba(51,65,85,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute left-5 top-5 z-20 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
        Space · Building · Floor · Room · Zone
      </div>
      <div className="absolute right-5 top-5 z-20 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
        {activeFloor} · {rooms.length} rooms · {project.devicesList.length} devices
      </div>
      <svg className="absolute inset-0 h-full w-full">
        {edges.map(edge => {
          const from = nodeById[edge.from];
          const to = nodeById[edge.to];
          if (!from || !to) return null;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke="#cbd5e1"
                strokeWidth="1.6"
                strokeDasharray={edge.label === 'contains' ? '0' : '6 5'}
              />
              <text x={`${midX}%`} y={`${midY}%`} textAnchor="middle" className="fill-slate-400 text-[10px]">
                {edge.label}
              </text>
            </g>
          );
        })}
      </svg>
      {nodes.map(node => <GraphNode key={node.id} node={node} />)}
    </div>
  );
}

function GraphNode({
  node,
}: {
  node: { label: string; type: string; x: number; y: number; size: number };
}) {
  const tone =
    node.type === 'home'
      ? 'bg-blue-600 text-white ring-blue-200'
      : node.type === 'building'
        ? 'bg-indigo-600 text-white ring-indigo-200'
        : node.type === 'floor'
          ? 'bg-sky-600 text-white ring-sky-200'
          : node.type === 'room'
            ? 'bg-white text-slate-900 ring-blue-100'
            : node.type === 'zone'
              ? 'bg-emerald-500 text-white ring-emerald-100'
              : 'bg-amber-500 text-white ring-amber-100';

  return (
    <div
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full text-xs font-semibold shadow-lg ring-4 transition duration-500 hover:scale-110',
          node.type === 'home' && 'animate-pulse',
          tone
        )}
        style={{ width: node.size, height: node.size }}
      >
        {node.type === 'device' ? <DeviceIcon type="sensor" /> : node.type === 'zone' ? 'Z' : node.type === 'floor' ? 'F' : node.type === 'building' ? 'B' : node.type === 'home' ? 'S' : ''}
      </div>
      <div className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">
        {node.label}
      </div>
    </div>
  );
}

function StudioFloorPlan({
  activeFloor,
  opacity,
  editMode,
  positionOverrides,
  onMoveRoom,
}: {
  activeFloor: string;
  opacity: number;
  editMode: boolean;
  positionOverrides: Record<string, { x: number; y: number }>;
  onMoveRoom: (roomId: string, x: number, y: number) => void;
}) {
  const rooms = roomsForFloor(activeFloor);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; pointerId: number } | null>(null);

  const updateRoomPosition = (room: (typeof rooms)[number], event: ReactPointerEvent<HTMLElement>) => {
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nextX = Math.min(96 - room.w, Math.max(2, ((event.clientX - rect.left) / rect.width) * 100));
    const nextY = Math.min(94 - room.h, Math.max(3, ((event.clientY - rect.top) / rect.height) * 100));
    onMoveRoom(room.id, nextX, nextY);
  };

  return (
    <div ref={layerRef} className="absolute inset-0" style={{ opacity: opacity / 100 }}>
      {rooms.map(room => {
        const override = positionOverrides[`${activeFloor}:${room.id}`];
        const x = override?.x ?? room.x;
        const y = override?.y ?? room.y;
        return (
        <button
          key={room.id}
          onPointerDown={event => {
            if (!editMode) return;
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = { id: room.id, pointerId: event.pointerId };
            updateRoomPosition(room, event);
          }}
          onPointerMove={event => {
            if (dragRef.current?.id !== room.id || dragRef.current.pointerId !== event.pointerId) return;
            updateRoomPosition(room, event);
          }}
          onPointerUp={event => {
            if (dragRef.current?.id !== room.id || dragRef.current.pointerId !== event.pointerId) return;
            updateRoomPosition(room, event);
            dragRef.current = null;
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          className={cn(
            'absolute border-[3px] border-slate-800 text-left',
            room.tone,
            editMode && 'cursor-move transition hover:ring-4 hover:ring-blue-500/15'
          )}
          style={{ left: `${x}%`, top: `${y}%`, width: `${room.w}%`, height: `${room.h}%` }}
        >
          <div className="absolute left-3 top-2">
            <div className="text-sm font-semibold text-slate-800">{room.label}</div>
            <div className="mt-0.5 text-[10px] font-medium text-slate-400">{room.area}</div>
          </div>
          <div className="absolute left-1/2 top-[-4px] h-1 w-16 -translate-x-1/2 rounded-full bg-sky-400/75" />
        </button>
        );
      })}
      {activeFloor === '2F' ? (
        <>
          <div className="absolute left-[21%] top-[35%] h-12 w-10 rounded-br-[42px] border-b-2 border-r-2 border-slate-300" />
          <div className="absolute left-[58%] top-[30%] h-10 w-8 rounded-bl-[38px] border-b-2 border-l-2 border-slate-300" />
          <div className="absolute left-[36%] top-[66%] h-1 w-[18%] bg-sky-400/80" />
          <div className="absolute left-[52%] top-[31%] h-[16%] w-1 bg-amber-500" />
        </>
      ) : (
        <>
          <div className="absolute left-[16%] top-[24%] h-12 w-10 rounded-br-[42px] border-b-2 border-r-2 border-slate-300" />
          <div className="absolute left-[51%] top-[56%] h-16 w-10 rounded-tr-[42px] border-r-2 border-t-2 border-slate-300" />
          <div className="absolute left-[87%] top-[28%] h-12 w-8 rounded-bl-[38px] border-b-2 border-l-2 border-slate-300" />
          <div className="absolute left-[4%] top-[25%] h-1 w-[12%] bg-amber-500" />
          <div className="absolute left-[51%] top-[38%] h-[35%] w-1 bg-amber-500" />
          <div className="absolute left-[89%] top-[28%] h-[13%] w-1 bg-amber-500" />
        </>
      )}
    </div>
  );
}

function StudioFurniture({
  activeFloor,
  opacity,
  selectedFurniture,
  editMode,
  positionOverrides,
  onSelectFurniture,
  onMoveFurniture,
}: {
  activeFloor: string;
  opacity: number;
  selectedFurniture: string | null;
  editMode: boolean;
  positionOverrides: Record<string, { x: number; y: number }>;
  onSelectFurniture: (id: string) => void;
  onMoveFurniture: (id: string, x: number, y: number) => void;
}) {
  const furniture = furnitureProductsForFloor(activeFloor);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; pointerId: number; moved: boolean } | null>(null);

  const updateFurniturePosition = (item: FurnitureProduct, event: ReactPointerEvent<HTMLElement>) => {
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;
    onMoveFurniture(
      item.id,
      Math.min(98 - item.w, Math.max(2, ((event.clientX - rect.left) / rect.width) * 100)),
      Math.min(96 - item.h, Math.max(4, ((event.clientY - rect.top) / rect.height) * 100))
    );
  };

  return (
    <div ref={layerRef} className="absolute inset-0" style={{ opacity: opacity / 100 }}>
      {furniture.map(item => {
        const override = positionOverrides[item.id];
        const x = override?.x ?? item.x;
        const y = override?.y ?? item.y;
        return (
        <button
          key={item.id}
          onClick={() => {
            if (dragRef.current?.moved) return;
            onSelectFurniture(item.id);
          }}
          onPointerDown={event => {
            onSelectFurniture(item.id);
            if (!editMode) return;
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = { id: item.id, pointerId: event.pointerId, moved: false };
          }}
          onPointerMove={event => {
            if (dragRef.current?.id !== item.id || dragRef.current.pointerId !== event.pointerId) return;
            dragRef.current.moved = true;
            updateFurniturePosition(item, event);
          }}
          onPointerUp={event => {
            if (dragRef.current?.id !== item.id || dragRef.current.pointerId !== event.pointerId) return;
            if (dragRef.current.moved) updateFurniturePosition(item, event);
            window.setTimeout(() => {
              dragRef.current = null;
            }, 0);
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          className={cn(
            'absolute border-2 border-slate-500/90 bg-white/50 text-left shadow-sm transition hover:border-blue-500 hover:bg-blue-50/40',
            item.type === 'round' && 'rounded-full',
            item.type !== 'round' && 'rounded-lg',
            editMode && 'cursor-move',
            selectedFurniture === item.id && 'border-blue-600 bg-blue-50/60 ring-4 ring-blue-500/15'
          )}
          style={{ left: `${x}%`, top: `${y}%`, width: `${item.w}%`, height: `${item.h}%` }}
          title={`${item.name} · ${item.room}`}
        >
          {item.type === 'round' ? (
            <div className="absolute inset-[18%] rounded-full border border-slate-300" />
          ) : (
            <div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-slate-300" />
          )}
        </button>
        );
      })}
    </div>
  );
}

function StudioCoverage({
  selectedDevice,
  opacity,
  overlayMode,
}: {
  selectedDevice: DevicePoint;
  opacity: number;
  overlayMode: OverlayMode;
}) {
  if (overlayMode === 'off') return null;
  const toneClass =
    overlayMode === 'wifi'
      ? 'border-blue-400/40 bg-blue-400/10'
      : overlayMode === 'cameras'
        ? 'border-indigo-400/40 bg-indigo-400/10'
        : overlayMode === 'radar'
          ? 'border-emerald-400/40 bg-emerald-400/12'
          : 'border-amber-400/40 bg-amber-300/10';
  return (
    <div className="pointer-events-none absolute inset-0" style={{ opacity: opacity / 100 }}>
      <div
        className={cn('absolute -translate-x-1/2 -translate-y-1/2 rounded-full border', toneClass)}
        style={{ left: `${selectedDevice.x}%`, top: `${selectedDevice.y}%`, width: 210, height: 210 }}
      />
      <div className={cn('absolute left-[79%] top-[53%] h-[185px] w-[185px] -translate-x-1/2 -translate-y-1/2 rounded-full border', toneClass)} />
      <div className={cn('absolute left-[10%] top-[24%] h-16 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border', toneClass)} />
    </div>
  );
}

function StudioLogicLinks() {
  return (
    <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M25 25 C44 28 57 32 71 27" fill="none" stroke="#94a3b8" strokeDasharray="1.4 1.4" strokeWidth="0.35" />
      <path d="M31 57 C46 52 63 45 92 24" fill="none" stroke="#94a3b8" strokeDasharray="1.4 1.4" strokeWidth="0.35" />
      <path d="M25 25 C28 44 30 53 31 57" fill="none" stroke="#2563eb" strokeDasharray="1.2 1.2" strokeWidth="0.35" />
    </svg>
  );
}

function StudioDeviceLayer({
  devices,
  selected,
  config,
  editMode,
  onSelect,
  onMove,
}: {
  devices: DevicePoint[];
  selected: string | null;
  config: CanvasConfig;
  editMode: boolean;
  onSelect: (name: string) => void;
  onMove: (name: string, x: number, y: number) => void;
}) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ name: string; pointerId: number; moved: boolean } | null>(null);

  const updatePosition = (name: string, event: ReactPointerEvent<HTMLElement>) => {
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nextX = ((event.clientX - rect.left) / rect.width) * 100;
    const nextY = ((event.clientY - rect.top) / rect.height) * 100;
    onMove(name, nextX, nextY);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, device: DevicePoint) => {
    onSelect(device.name);
    if (!editMode) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { name: device.name, pointerId: event.pointerId, moved: false };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!editMode || !drag || drag.pointerId !== event.pointerId) return;
    drag.moved = true;
    updatePosition(drag.name, event);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  return (
    <div ref={layerRef} className="absolute inset-0">
      {devices.map(device => {
        const active = selected === device.name;
        const statusMeta = DEVICE_STATUS_META[device.status];
        return (
          <button
            key={device.name}
            onPointerDown={(event) => handlePointerDown(event, device)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={() => {
              if (dragRef.current?.moved) return;
              onSelect(device.name);
            }}
            className={cn(
              'absolute z-20 -translate-x-1/2 -translate-y-1/2 touch-none',
              editMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
            )}
            style={{ left: `${device.x}%`, top: `${device.y}%` }}
            title={`${device.pointCode} · ${device.name} · ${device.room}`}
          >
            <span className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-slate-900 text-white shadow-lg transition',
              active ? 'scale-110 border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-700 hover:scale-105'
            )} style={{ transform: `scale(${config.iconSize / 62})` }}>
              <DeviceIcon type={device.type} />
              {config.showConnectivity ? (
                <span className={cn('absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white', statusMeta.dotClassName)} />
              ) : null}
            </span>
          {config.showDeviceName ? (
            <span className={cn(
              'absolute left-7 top-5 whitespace-nowrap rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-sm',
              active && 'bg-slate-950'
            )} style={{ opacity: config.labelVisibility / 100 }}>
              {device.name} {config.showDeviceModel ? device.model : roomLabelFor(device.room)}
            </span>
          ) : null}
          </button>
        );
      })}
    </div>
  );
}

function MarbleBuildMascot({ state }: { state: 'idle' | 'loading' }) {
  const loading = state === 'loading';

  return (
    <div className="relative mx-auto h-36 w-36">
      {loading ? (
        <>
          <span className="absolute left-2 top-16 h-0.5 w-9 -rotate-[24deg] rounded-full bg-emerald-400 animate-pulse" />
          <span className="absolute bottom-9 left-5 h-0.5 w-12 -rotate-[22deg] rounded-full bg-emerald-400 animate-pulse" />
          <span className="absolute right-7 top-20 h-0.5 w-7 -rotate-[24deg] rounded-full bg-emerald-400 animate-pulse" />
        </>
      ) : null}
      <span className={cn('absolute left-[64px] top-3 h-6 w-6 rounded-full bg-emerald-400', loading && 'animate-bounce')} />
      {!loading ? (
        <span className="absolute right-5 top-6 rotate-[-12deg] rounded-full bg-white/20 px-2 py-1 text-xs font-black text-black">
          Hi
        </span>
      ) : null}
      <div
        className={cn('absolute left-7 top-12 h-20 w-24 bg-white shadow-2xl shadow-black/40', loading && 'animate-pulse')}
        style={{
          borderRadius: '58% 54% 43% 48% / 48% 58% 44% 50%',
          transform: 'rotate(-13deg)',
        }}
      >
        <span className="absolute -bottom-2 left-6 h-8 w-9 rounded-full bg-[#070707]" />
        <span className="absolute -bottom-3 right-4 h-9 w-8 rounded-full bg-[#070707]" />
        <span className="absolute right-3 top-5 h-9 w-12 rounded-full bg-[#070707]">
          <span className="absolute left-3 top-4 h-2 w-4 rounded-full border-b-4 border-emerald-400" />
          <span className="absolute right-2 top-4 h-2 w-4 rounded-full border-b-4 border-emerald-400" />
        </span>
      </div>
    </div>
  );
}

function VisualizationCanvasImpl({
  project,
  renderJob,
  returnHref,
  onRunRender,
}: VisualizationCanvasProps) {
  const primaryAsset = SAMPLE_VISUALIZATION_ASSETS[0]!;
  const isGenerating = renderJob === 'queued' || renderJob === 'rendering';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const parseTimerRef = useRef<number | null>(null);
  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const [uploadedPlanName, setUploadedPlanName] = useState('');
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
  const [parseState, setParseState] = useState<'empty' | 'parsing' | 'ready'>('empty');
  const [generatedPlanName, setGeneratedPlanName] = useState('');
  const [selectedWorkId, setSelectedWorkId] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [makesOpen, setMakesOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [detailMenuOpen, setDetailMenuOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('marble-1-1');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [prompt, setPrompt] = useState('');
  const hasGeneratedWork = renderJob === 'ready' && Boolean(generatedPlanName);
  const parseSteps = [
    { label: '户型图', value: uploadedPlanName ? '已上传' : '等待上传', done: Boolean(uploadedPlanName), running: false },
    { label: '结构解析', value: parseState === 'parsing' ? '解析中' : parseState === 'ready' ? '已完成' : '未开始', done: parseState === 'ready', running: parseState === 'parsing' },
    { label: 'Marble World', value: hasGeneratedWork ? '已生成' : isGenerating ? '生成中' : '未生成', done: hasGeneratedWork, running: isGenerating },
  ];
  const marbleModels = [
    { id: 'marble-1-1-plus', label: 'Marble 1.1 Plus', badge: 'New', desc: 'Best for large scenes' },
    { id: 'marble-1-1', label: 'Marble 1.1', badge: 'New', desc: 'Improved quality' },
    { id: 'marble-1-0', label: 'Marble 1.0', desc: 'legacy' },
    { id: 'marble-1-0-draft', label: 'Marble 1.0 Draft', desc: 'Quickly explore ideas' },
  ];
  const selectedModel = marbleModels.find(model => model.id === selectedModelId) ?? marbleModels[1]!;

  useEffect(() => {
    return () => {
      if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    };
  }, [uploadedPreviewUrl]);

  useEffect(() => {
    return () => {
      if (parseTimerRef.current) window.clearTimeout(parseTimerRef.current);
    };
  }, []);

  const handleFileChange = (file?: File | null) => {
    if (!file) return;
    if (uploadedPreviewUrl) URL.revokeObjectURL(uploadedPreviewUrl);
    if (parseTimerRef.current) window.clearTimeout(parseTimerRef.current);
    setUploadedPlanName(file.name);
    setUploadedPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
    setParseState('parsing');
    setGeneratedPlanName('');
    setSelectedWorkId('');
    setPreviewOpen(false);
    setMakesOpen(false);
    parseTimerRef.current = window.setTimeout(() => {
      setParseState('ready');
      parseTimerRef.current = null;
    }, 950);
  };

  const handleRunWorldGeneration = () => {
    if (!uploadedPlanName || parseState === 'parsing' || isGenerating) return;
    setGeneratedPlanName(uploadedPlanName);
    setSelectedWorkId('marble-world-main');
    setPreviewOpen(false);
    setMakesOpen(false);
    onRunRender();
  };
  const handleClosePreview = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
    setPreviewOpen(false);
  };
  const handleOpenPreview = () => {
    setSelectedWorkId('marble-world-main');
    setPreviewOpen(true);
  };
  const previewName = (generatedPlanName || uploadedPlanName || 'My Apartment').replace(/\.[^.]+$/, '');
  const chatTitle = 'Image to 3D World';
  const marbleWorkSelected = selectedWorkId === '' || selectedWorkId === 'marble-world-main';
  const showUploadEmpty = !makesOpen && !uploadedPlanName && !isGenerating && !hasGeneratedWork;
  const showParsingState = !makesOpen && Boolean(uploadedPlanName) && parseState === 'parsing' && !isGenerating && !hasGeneratedWork;
  const showReadyToGenerate = !makesOpen && Boolean(uploadedPlanName) && parseState === 'ready' && !isGenerating && !hasGeneratedWork;
  const showGeneratedReady = !makesOpen && hasGeneratedWork && !isGenerating;
  const canSubmitComposer = Boolean(prompt.trim()) || (Boolean(uploadedPlanName) && parseState === 'ready');
  const handleComposerSubmit = () => {
    const text = prompt.trim();
    if (text) {
      setSubmittedPrompt(text);
      setPrompt('');
    }
    if (uploadedPlanName && parseState === 'ready' && !isGenerating) {
      handleRunWorldGeneration();
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070707] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:52px_52px]" />
      <div className="relative z-10 flex h-full flex-col">
        <header className="relative z-40 flex h-16 shrink-0 items-center gap-4 border-b border-white/10 bg-[#0b0b0d]/95 px-5 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setChatCollapsed(prev => !prev);
              setDetailMenuOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/78 transition hover:bg-white/10 hover:text-white"
            title={chatCollapsed ? '展开对话' : '收起对话'}
          >
            <ListTree size={20} />
          </button>
          <div className="h-7 w-px bg-white/12" />
          <div className="flex min-w-0 items-center gap-2 rounded-[16px] bg-white/[0.075] px-4 py-2 shadow-lg shadow-black/20">
            <span className="max-w-[420px] truncate text-sm font-semibold text-white">{chatTitle}</span>
            <button
              type="button"
              onClick={() => setDetailMenuOpen(prev => !prev)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
              title="更多"
            >
              <MoreVertical size={17} />
            </button>
          </div>
          <div className="ml-auto rounded-full border border-amber-300/18 bg-amber-300/8 px-3.5 py-1.5 text-xs font-semibold text-amber-200">
            5 chances today
          </div>
          {detailMenuOpen ? (
            <div className="absolute left-[86px] top-[72px] z-50 w-[260px] rounded-[22px] border border-white/10 bg-[#191a20] p-2 shadow-2xl shadow-black/45">
              <Link
                href={returnHref}
                className="flex h-14 items-center gap-3 rounded-[18px] px-4 text-sm font-semibold text-white/88 transition hover:bg-white/8 hover:text-white"
              >
                <ArrowLeft size={18} />
                Back to Build AI
              </Link>
            </div>
          ) : null}
        </header>
        <div className={cn('grid min-h-0 flex-1', chatCollapsed ? 'grid-cols-[minmax(0,1fr)]' : 'xl:grid-cols-[420px_minmax(0,1fr)]')}>
	          {!chatCollapsed ? (
	            <aside className="relative min-h-0 overflow-hidden border-r border-white/10 bg-[#070707] shadow-2xl shadow-black/25">
		            <div className="absolute inset-x-0 bottom-[188px] top-0 overflow-y-auto px-4 py-5">
	              {submittedPrompt ? (
	                <div className="ml-auto max-w-[300px] rounded-[14px] bg-white/10 px-4 py-3 text-sm leading-6 text-white">
	                  {submittedPrompt}
	                </div>
	              ) : null}
	              {uploadedPlanName ? (
	                <button
	                  type="button"
	                  onClick={() => fileInputRef.current?.click()}
	                  className="mt-4 flex w-full items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.07]"
	                >
	                  <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-[10px] bg-black/35">
	                    {uploadedPreviewUrl ? <img src={uploadedPreviewUrl} alt={uploadedPlanName} className="h-full w-full object-cover opacity-80" /> : null}
	                  </span>
	                  <span className="min-w-0 flex-1">
	                    <span className="block truncate text-xs font-semibold text-white">{uploadedPlanName}</span>
	                    <span className="mt-1 block text-[11px] text-white/42">{parseState === 'ready' ? 'Parsed floor plan' : 'Parsing floor plan'}</span>
	                  </span>
	                  {parseState === 'parsing' ? <Loader2 size={15} className="animate-spin text-blue-300" /> : <Check size={15} className="text-emerald-300" />}
	                </button>
	              ) : null}
	              {(uploadedPlanName || isGenerating || hasGeneratedWork) ? (
	                <div className="mt-4 space-y-2">
	                  {parseSteps.map(step => (
	                    <div key={step.label} className="flex items-center gap-3 rounded-[12px] bg-black/20 px-3 py-2">
	                      <span className={cn(
	                        'flex h-5 w-5 items-center justify-center rounded-full',
	                        step.done ? 'bg-emerald-400 text-slate-950' : step.running ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/35'
	                      )}>
	                        {step.running ? <Loader2 size={11} className="animate-spin" /> : step.done ? <Check size={11} /> : null}
	                      </span>
	                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white/70">{step.label}</span>
	                      <span className="truncate text-[11px] text-white/35">{step.value}</span>
	                    </div>
	                  ))}
	                </div>
	              ) : null}
	            </div>

		            <div className="absolute inset-x-4 bottom-4 overflow-hidden rounded-[22px] border border-white/16 bg-[#0a0a0b] p-4 shadow-[0_0_36px_rgba(99,102,241,0.16)]">
		              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_78%_58%,rgba(244,114,182,0.1),transparent_30%)]" />
		              <div className="relative z-10">
		              <textarea
		                value={prompt}
		                onChange={event => setPrompt(event.target.value)}
		                maxLength={220}
		                placeholder="Imagine a world."
		                className="h-28 w-full resize-none bg-transparent text-sm leading-6 text-white/82 outline-none placeholder:text-white/35"
		              />
		              {uploadedPlanName ? (
		                <button
		                  type="button"
		                  onClick={() => fileInputRef.current?.click()}
		                  className="mb-3 flex h-16 w-24 items-center justify-center overflow-hidden rounded-[10px] border border-white/15 bg-white/8"
		                >
		                  {uploadedPreviewUrl ? (
		                    <img src={uploadedPreviewUrl} alt={uploadedPlanName} className="h-full w-full object-cover opacity-85" />
		                  ) : (
		                    <Image size={18} className="text-white/55" />
		                  )}
		                </button>
		              ) : null}
		              <div className="mt-3 flex items-center justify-between gap-2">
		                <button
		                  type="button"
		                  onClick={() => fileInputRef.current?.click()}
		                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/75 transition hover:bg-white/15 hover:text-white"
		                  title="上传户型图"
		                >
		                  <Plus size={22} />
		                </button>
		                <div className="relative min-w-0 flex-1">
		                  <button
		                    type="button"
		                    onClick={() => setModelMenuOpen(prev => !prev)}
		                    className="ml-auto flex h-11 max-w-full items-center gap-2 rounded-l-[14px] bg-white/8 px-3 text-xs font-semibold text-white/86 transition hover:bg-white/12 hover:text-white"
		                  >
		                    <span className="truncate">{selectedModel.label}</span>
		                    <ChevronDown size={13} className="shrink-0 text-white/50" />
		                  </button>
		                  {modelMenuOpen ? (
		                    <div className="absolute bottom-12 right-0 z-30 w-52 overflow-hidden rounded-[14px] border border-white/10 bg-[#191919] p-1 shadow-2xl shadow-black/50">
		                      {marbleModels.map(model => (
	                        <button
	                          key={model.id}
	                          type="button"
	                          onClick={() => {
	                            setSelectedModelId(model.id);
	                            setModelMenuOpen(false);
	                          }}
	                          className={cn(
	                            'flex w-full items-start justify-between gap-2 rounded-[10px] px-3 py-2 text-left transition',
	                            selectedModelId === model.id ? 'bg-white/10 text-white' : 'text-white/82 hover:bg-white/8'
	                          )}
	                        >
	                          <span className="min-w-0">
	                            <span className="flex items-center gap-2 text-xs font-semibold">
	                              {model.label}
	                              {model.badge ? <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white">{model.badge}</span> : null}
	                            </span>
	                            <span className="mt-0.5 block text-[11px] text-white/52">{model.desc}</span>
	                          </span>
	                          {selectedModelId === model.id ? <Check size={15} className="mt-1 shrink-0 text-white" /> : null}
	                        </button>
	                      ))}
	                    </div>
		                  ) : null}
		                </div>
		                <button
		                  type="button"
		                  onClick={handleComposerSubmit}
		                  disabled={isGenerating || !canSubmitComposer}
		                  title="Create"
		                  className="flex h-11 shrink-0 items-center gap-2 rounded-r-[14px] bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-600/45"
		                >
		                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
		                  Create
		                </button>
		              </div>
	              <input
	                ref={fileInputRef}
	                type="file"
	                accept="image/png,image/jpeg"
	                className="hidden"
	                onChange={event => handleFileChange(event.target.files?.[0])}
	              />
	              </div>
	            </div>
	          </aside>
	          ) : null}

	          <section className="relative min-h-0 overflow-hidden bg-[#070707] p-0">
	            {previewOpen && marbleWorkSelected && hasGeneratedWork ? (
	              <>
	                <div className="fixed inset-0 z-40 bg-black/85" />
	                <div
	                  ref={previewFrameRef}
	                  className="fixed inset-4 z-50 overflow-hidden rounded-[22px] border border-white/10 bg-black shadow-2xl shadow-black"
	                >
	                  <iframe
	                    src={MARBLE_PREVIEW_URL}
	                    title={`${previewName} Marble preview`}
	                    className="absolute inset-0 h-full w-full border-0 bg-black"
	                  />
	                  <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/65 px-4 py-2 text-sm font-semibold backdrop-blur">
	                    Global preview
	                  </div>
	                  <div className="absolute right-4 top-4 flex items-center gap-2">
	                    <a
	                      href={MARBLE_PREVIEW_URL}
	                      target="_blank"
	                      rel="noreferrer"
	                      className="flex h-9 items-center justify-center rounded-full bg-black/65 px-4 text-xs font-semibold text-white/80 backdrop-blur transition hover:bg-white hover:text-slate-950"
	                    >
	                      Open in Marble
	                    </a>
	                    <button
	                      type="button"
	                      onClick={handleClosePreview}
	                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white/80 backdrop-blur transition hover:bg-white hover:text-slate-950"
	                      title="关闭预览"
	                    >
	                      <X size={16} />
	                    </button>
	                  </div>
	                </div>
	              </>
	            ) : null}

	            <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
	              <button
	                type="button"
	                onClick={() => setMakesOpen(prev => !prev)}
	                className={cn(
	                  'flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold shadow-lg shadow-black/20 transition',
	                  makesOpen
	                    ? 'border-white bg-white text-slate-950'
	                    : 'border-white/12 bg-black/55 text-white/75 backdrop-blur hover:border-white/24 hover:bg-white/10 hover:text-white'
	                )}
	              >
	                <FolderOpen size={16} />
	                My Makes
	              </button>
	            </div>

	            {showUploadEmpty ? (
              <div className="grid h-full min-h-[520px] place-items-center bg-[#070707]">
                <div className="text-center">
                  <MarbleBuildMascot state="idle" />
                  <div className="mt-7 text-2xl font-semibold tracking-normal">Let's Get Started</div>
                  <div className="mt-5 text-lg leading-8 text-white/65">
                    There's nothing to preview yet.<br />
                    Once your first build is ready, you'll see it here.
                  </div>
                </div>
              </div>
            ) : null}

            {showParsingState ? (
              <div className="grid h-full min-h-[520px] gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.04]">
                  {uploadedPreviewUrl ? (
                    <img src={uploadedPreviewUrl} alt={uploadedPlanName} className="absolute inset-0 h-full w-full object-contain opacity-80" />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />
                  )}
                  <div className="absolute left-5 top-5 rounded-full bg-black/55 px-4 py-2 text-sm font-semibold backdrop-blur">
                    Parsing floor plan
                  </div>
                </div>
                <aside className="rounded-[16px] border border-white/10 bg-white/[0.06] p-4">
                  <div className="text-sm font-semibold text-white/70">Parser</div>
                  <div className="mt-4 space-y-2">
                    {['Rooms', 'Walls', 'Doors', 'Furniture'].map((item, index) => (
                      <div key={item} className="flex items-center justify-between rounded-[12px] bg-black/20 px-3 py-2 text-sm">
                        <span className="text-white/55">{item}</span>
                        <span className={cn('h-2 w-16 overflow-hidden rounded-full bg-white/10', index === 0 && 'w-20')}>
                          <span className="block h-full rounded-full bg-blue-500" style={{ width: `${45 + index * 12}%` }} />
                        </span>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            ) : null}

            {showReadyToGenerate ? (
              <div className="grid h-full min-h-[520px] gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.04]">
                  {uploadedPreviewUrl ? (
                    <img src={uploadedPreviewUrl} alt={uploadedPlanName} className="absolute inset-0 h-full w-full object-contain opacity-90" />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />
                  )}
                  <div className="absolute bottom-5 left-5 rounded-[16px] bg-black/55 px-4 py-3 text-sm font-semibold backdrop-blur">
                    <div className="text-white">{previewName}</div>
                    <div className="mt-1 text-xs text-white/45">Parsed · 8 rooms · 12 openings</div>
                  </div>
                </div>
                <aside className="flex flex-col rounded-[16px] border border-white/10 bg-white/[0.06] p-4">
                  <div className="text-sm font-semibold text-white/70">Ready</div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {[
                      ['Rooms', '8'],
                      ['Doors', '9'],
                      ['Windows', '12'],
                      ['Objects', '16'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[12px] bg-black/20 p-3">
                        <div className="text-lg font-semibold text-white">{value}</div>
                        <div className="mt-1 text-xs text-white/40">{label}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleRunWorldGeneration}
                    className="mt-auto flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    <Wand2 size={16} />
                    Generate Marble world
                  </button>
                </aside>
              </div>
            ) : null}

            {isGenerating && !makesOpen ? (
              <div className="grid h-full min-h-[520px] place-items-center bg-[#070707]">
                <div className="text-center">
                  <MarbleBuildMascot state="loading" />
                  <div className="mt-7 text-2xl font-semibold tracking-normal">Your Project Is Coming Together</div>
                  <div className="mt-5 text-lg leading-8 text-white/65">
                    We're generating your project now.<br />
                    This will just take a few moments.
                  </div>
                </div>
              </div>
            ) : null}

            {showGeneratedReady ? (
              <div className="grid h-full min-h-[520px] place-items-center bg-[#070707]">
                <div className="text-center">
                  <MarbleBuildMascot state="idle" />
                  <div className="mt-7 text-2xl font-semibold tracking-normal">World Ready</div>
                  <div className="mt-3 text-sm text-white/48">{previewName} · {selectedModel.label}</div>
                  <div className="mt-7 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenPreview}
                      className="rounded-full bg-indigo-50 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-600 hover:text-white"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => setMakesOpen(true)}
                      className="rounded-full border border-white/12 bg-white/8 px-6 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/12 hover:text-white"
                    >
                      My Makes
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {makesOpen ? (
              <div className="relative h-full min-h-[520px] overflow-hidden bg-[#070707] px-8 py-7">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:52px_52px]" />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mx-auto rounded-[18px] bg-white/10 p-1">
                    <div className="rounded-[13px] bg-white px-5 py-2 text-sm font-semibold text-slate-950">
                      My worlds
                    </div>
                  </div>

                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-normal">My Makes</h2>
                      <div className="mt-1 text-sm text-white/45">{hasGeneratedWork ? '1 world' : 'No worlds yet'}</div>
                    </div>
                    <div className="mr-16 flex items-center gap-2">
                      <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950">
                        <ListTree size={18} />
                      </button>
                      <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/65 transition hover:bg-white/15 hover:text-white">
                        <Grid2X2 size={17} />
                      </button>
                      <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/65 transition hover:bg-white/15 hover:text-white">
                        <SlidersVertical size={17} />
                      </button>
                    </div>
                  </div>

                  {hasGeneratedWork ? (
                    <>
                      <div className="mt-8 text-sm font-semibold text-white/85">Earlier</div>
                      <div className="mt-3 rounded-[18px] bg-white/[0.045] p-3">
                        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)_96px]">
                          <button
                            type="button"
                            onClick={handleOpenPreview}
                            className="group relative h-[230px] overflow-hidden rounded-[16px] bg-[#252525] text-left"
                          >
                            <div className={cn('absolute inset-0 bg-gradient-to-br', primaryAsset.gradient)} />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_22%,rgba(255,255,255,0.35),transparent_25%),linear-gradient(115deg,rgba(255,255,255,0.1),rgba(0,0,0,0.64))]" />
                            <div className="absolute left-[14%] top-[18%] h-[64%] w-[72%] rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-black/25 backdrop-blur-sm">
                              <div className="absolute left-[8%] top-[12%] h-[34%] w-[32%] rounded-2xl border border-white/20 bg-white/15" />
                              <div className="absolute right-[8%] top-[13%] h-[34%] w-[34%] rounded-2xl border border-white/20 bg-white/12" />
                              <div className="absolute bottom-[14%] left-[16%] h-[24%] w-[68%] rounded-[1.5rem] border border-white/20 bg-black/22" />
                            </div>
                            <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white/75 backdrop-blur transition group-hover:bg-white group-hover:text-slate-950">
                              <Fullscreen size={15} />
                            </span>
                          </button>
                          <div className="min-w-0 py-3">
                            <div className="flex items-center gap-3">
                              <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">World</span>
                              <h3 className="truncate text-lg font-semibold tracking-normal text-white">{previewName} World</h3>
                            </div>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
                              Generated from the uploaded floor plan with room hierarchy, openings and furniture anchors preserved for Marble preview.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-white/55">
                              <span className="rounded-full bg-white/10 px-3 py-1">{selectedModel.label}</span>
                              <span className="rounded-full bg-white/10 px-3 py-1">{primaryAsset.promptHash}</span>
                              <span className="rounded-full bg-white/10 px-3 py-1">seed {primaryAsset.seed}</span>
                            </div>
                            <div className="mt-8 flex items-center gap-4 text-white/55">
                              <button className="transition hover:text-white" title="History">
                                <RotateCcw size={18} />
                              </button>
                              <button className="transition hover:text-white" title="Style">
                                <SlidersVertical size={18} />
                              </button>
                              <a href={MARBLE_PREVIEW_URL} target="_blank" rel="noreferrer" className="transition hover:text-white" title="Download">
                                <UploadCloud size={18} className="rotate-180" />
                              </a>
                              <button className="transition hover:text-white" title="More">
                                <MoreHorizontal size={18} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-end justify-end pb-3 pr-1">
                            <button
                              type="button"
                              onClick={handleOpenPreview}
                              className="rounded-full bg-indigo-50 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-600 hover:text-white"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleRunWorldGeneration}
                        className="mt-auto flex h-10 w-fit items-center justify-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 text-xs font-semibold text-white/70 transition hover:bg-white/12 hover:text-white"
                      >
                        <RotateCcw size={14} />
                        Regenerate
                      </button>
                    </>
                  ) : (
                    <div className="grid flex-1 place-items-center text-center">
                      <div>
                        <MarbleBuildMascot state="idle" />
                        <div className="mt-6 text-xl font-semibold">No makes yet</div>
                        <div className="mt-2 text-sm text-white/45">Create a world from the composer.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

type LifePluginNode = {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  accent: 'blue' | 'violet' | 'emerald';
  kind?: 'plugin' | 'placeholder';
  parentId?: string;
};

type LifePackageState = {
  node: LifePluginNode;
  step: number;
  ready: boolean;
};

type LifeVariantJob = {
  source: LifePluginNode;
  x: number;
  y: number;
  prompt: string;
};

type LifeCanvasPanel = 'assets' | 'workflow' | null;
type LifeComposerMode = 'bottom' | 'center';
type LifeCanvasTab = {
  id: string;
  name: string;
};

type LifeWorkflowTemplate = {
  id: string;
  title: string;
  size: string;
  count: number;
};

const LIFE_PLUGIN_PRESETS: Omit<LifePluginNode, 'id' | 'x' | 'y'>[] = [
  { title: '我的家', subtitle: '回家 · 影院 · 睡眠', accent: 'blue' },
  { title: '长辈安心', subtitle: '紧急呼叫 · 起夜 · 离家', accent: 'emerald' },
  { title: '孩子放学', subtitle: '到家提醒 · 作业灯 · 空调', accent: 'violet' },
];

const LIFE_CANVAS_CENTER = { x: 520, y: 36 };
const LIFE_TEMPLATE_PROMPTS = [
  { label: '老人版', prompt: '为老人设计生活看板：大字体、高对比度、紧急呼叫置顶、起夜照明、久坐提醒、门磁异常提醒。' },
  { label: '儿童版', prompt: '为儿童设计生活看板：放学到家提醒、作业灯光、睡前场景、空气质量和安全区域提醒。' },
  { label: '男主人版', prompt: '为男主人设计生活看板：回家模式、影音场景、安防摘要、能耗概览和常用设备快捷控制。' },
  { label: '保姆版', prompt: '为保姆设计生活看板：今日任务、儿童/老人状态、门锁权限、异常提醒和一键联系家人。' },
];
const LIFE_STYLE_PROMPTS = [
  { label: '可爱风格', prompt: '视觉风格使用可爱、柔和、圆润的卡片，颜色明亮但不刺眼。' },
  { label: '科技风格', prompt: '视觉风格使用科技感、清晰信息层级、冷静蓝色点缀和数据化组件。' },
  { label: '逗比风格', prompt: '视觉风格轻松幽默，文案更活泼，但核心提醒保持清晰可靠。' },
  { label: '极简风格', prompt: '视觉风格极简，只保留关键卡片和高频操作，减少装饰。' },
];
const LIFE_PACKAGE_STEPS = ['分析当前布局变更', '打包 Aqara Life 控件资源', '签名 + 生成插件包 .aqplug', '上传到 Aqara CDN', '生成扫码地址 / 推送通道'];
const LIFE_WORKFLOW_PRESETS: LifeWorkflowTemplate[] = [
  { id: 'home-plugin', title: 'Home 首页插件', size: '状态摘要 + 快捷场景', count: 3 },
  { id: 'device-control', title: '设备控制面板', size: '设备列表 + 控制详情', count: 4 },
  { id: 'scene-launcher', title: '场景快捷入口', size: '常用场景 + 一键执行', count: 3 },
  { id: 'security-alerts', title: '安防告警中心', size: '告警流 + 处理动作', count: 4 },
  { id: 'energy-env', title: '能耗环境看板', size: '温湿度 + 能耗趋势', count: 4 },
  { id: 'family-care', title: '家庭成员关怀', size: '老人/儿童 + 异常提醒', count: 5 },
  { id: 'automation-flow', title: '自动化流程插件', size: '触发器 + 条件 + 动作', count: 5 },
  { id: 'installation-guide', title: '安装交付插件', size: '扫码安装 + 推送业主', count: 3 },
];

function LifeDashboardCanvas({
  project,
  sourceProject,
}: {
  project: ProjectModel;
  sourceProject?: Project;
}) {
  const [prompt, setPrompt] = useState('');
  const [zoom, setZoom] = useState(100);
  const [plugins, setPlugins] = useState<LifePluginNode[]>(() => (
    Array.from({ length: sourceProject?.lifeDashboardPluginCount ?? 0 }, (_, index) => {
      const preset = LIFE_PLUGIN_PRESETS[index % LIFE_PLUGIN_PRESETS.length];
      const nextIndex = index + 1;
      return {
        ...preset,
        id: `saved-life-plugin-${sourceProject?.id ?? 'local'}-${nextIndex}`,
        title: index === 0 ? preset.title : `${preset.title} v${nextIndex}`,
        x: LIFE_CANVAS_CENTER.x + index * 380,
        y: index % 2 === 0 ? LIFE_CANVAS_CENTER.y : LIFE_CANVAS_CENTER.y + 64,
      };
    })
  ));
  const [isGenerating, setIsGenerating] = useState(false);
  const [variantOpen, setVariantOpen] = useState(false);
  const [packageState, setPackageState] = useState<LifePackageState | null>(null);
  const [variantJob, setVariantJob] = useState<LifeVariantJob | null>(null);
  const [variantSource, setVariantSource] = useState<LifePluginNode | null>(null);
  const [activePanel, setActivePanel] = useState<LifeCanvasPanel>(null);
  const [composerMode, setComposerMode] = useState<LifeComposerMode>('bottom');
  const [emptyHintHidden, setEmptyHintHidden] = useState(false);
  const [canvasTabs, setCanvasTabs] = useState<LifeCanvasTab[]>([{ id: 'canvas-1', name: '画布 1' }]);
  const [activeCanvasId, setActiveCanvasId] = useState('canvas-1');
  const [savedWorkflowTemplates, setSavedWorkflowTemplates] = useState<LifeWorkflowTemplate[]>([]);
  const [promptPanel, setPromptPanel] = useState<'template' | 'style' | null>(null);
  const [spaceDragActive, setSpaceDragActive] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);
  const canvasDragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const nodeDragRef = useRef<{ id: string; startX: number; startY: number; x: number; y: number } | null>(null);
  const variantTimerRef = useRef<number | null>(null);
  const canGenerate = !isGenerating;
  const activeCanvasName = canvasTabs.find(tab => tab.id === activeCanvasId)?.name ?? '画布';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT' || target?.isContentEditable;
      if (event.code === 'Space' && !isTyping) {
        event.preventDefault();
        setSpaceDragActive(true);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setSpaceDragActive(false);
        canvasDragRef.current = null;
        nodeDragRef.current = null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!packageState || packageState.ready) return undefined;
    const timers = LIFE_PACKAGE_STEPS.map((_, index) => (
      window.setTimeout(() => {
        setPackageState(current => {
          if (!current) return current;
          const nextStep = Math.max(current.step, index);
          return { ...current, step: nextStep, ready: index === LIFE_PACKAGE_STEPS.length - 1 };
        });
      }, 520 + index * 640)
    ));
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [packageState?.node.id, packageState?.ready]);

  useEffect(() => () => {
    if (variantTimerRef.current) window.clearTimeout(variantTimerRef.current);
  }, []);

  const pluginPositionForIndex = (index: number) => {
    if (index > 0) {
      return {
        x: LIFE_CANVAS_CENTER.x + index * 380,
        y: index % 2 === 0 ? LIFE_CANVAS_CENTER.y : LIFE_CANVAS_CENTER.y + 64,
      };
    }
    const viewportWidth = canvasViewportRef.current?.clientWidth ?? 1180;
    const scale = zoom / 100;
    return {
      x: Math.max(260, Math.round(((viewportWidth / scale) - 250) / 2 - (pan.x / scale))),
      y: LIFE_CANVAS_CENTER.y,
    };
  };

  const persistLifePlugins = (nextPlugins: LifePluginNode[], promptToSave?: string, status: Project['solutionStatus'] = 'editing') => {
    if (!sourceProject) return;
    saveCubixLocalProject({
      ...sourceProject,
      buildMode: 'life-dashboard',
      designStage: 'review',
      solutionStatus: sourceProject.solutionStatus === 'finalized' ? 'finalized' : status,
      lifeDashboardPluginCount: nextPlugins.length,
      lifeDashboardLastPrompt: promptToSave || sourceProject.lifeDashboardLastPrompt,
      updatedAt: 'just now',
    });
  };

  const buildPluginNode = (index: number, variant: boolean, position: { x: number; y: number }, parentId?: string): LifePluginNode => {
    const preset = LIFE_PLUGIN_PRESETS[index % LIFE_PLUGIN_PRESETS.length];
    const nextIndex = index + 1;
    return {
      ...preset,
      id: `life-plugin-${Date.now()}-${nextIndex}`,
      title: variant ? `${preset.title} v${nextIndex}` : preset.title,
      x: position.x,
      y: position.y,
      parentId,
    };
  };

  const addPlugin = (variant = false, promptOverride?: string) => {
    if (!canGenerate) return;
    const promptToSave = promptOverride?.trim() || prompt.trim();
    setIsGenerating(true);
    window.setTimeout(() => {
      setPlugins(prev => {
        const position = pluginPositionForIndex(prev.length);
        const parentId = variant ? prev[prev.length - 1]?.id : undefined;
        const nextPlugins = [...prev, buildPluginNode(prev.length, variant, position, parentId)];
        persistLifePlugins(nextPlugins, promptToSave);
        return nextPlugins;
      });
      setIsGenerating(false);
      setPrompt('');
      setVariantOpen(false);
      setComposerMode('bottom');
    }, 1150);
  };

  const nudgeZoom = (delta: number) => {
    setZoom(prev => Math.min(180, Math.max(60, prev + delta)));
  };

  const appendPrompt = (value: string) => {
    setPrompt(prev => {
      const separator = prev.trim() ? '\n' : '';
      return `${prev}${separator}${value}`;
    });
  };

  const closeFloatingPanels = () => {
    setPromptPanel(null);
    setVariantOpen(false);
  };

  const generateVariantWithPrompt = (value: string) => {
    const variantPrompt = value.trim() || '基于当前插件生成一个新的可用变体。';
    const nextPrompt = `${prompt.trim() ? `${prompt.trim()}\n` : ''}基于当前版本生成变体：${variantPrompt}`;
    setPrompt(nextPrompt);
    if (variantSource) {
      startVariantBuild(variantSource, nextPrompt);
    } else {
      addPlugin(true, nextPrompt);
    }
  };

  const startVariantBuild = (source: LifePluginNode, promptOverride?: string) => {
    if (variantTimerRef.current) window.clearTimeout(variantTimerRef.current);
    const nextPrompt = promptOverride?.trim() || prompt.trim() || `基于 ${source.title} 生成一个新的生活看板变体。`;
    const nextJob = {
      source,
      x: source.x + 380,
      y: source.y + 46,
      prompt: nextPrompt,
    };
    setVariantJob(nextJob);
    setVariantOpen(false);
    setVariantSource(null);
    setPrompt(nextPrompt);
    variantTimerRef.current = window.setTimeout(() => {
      setPlugins(prev => {
        const nextPlugins = [...prev, buildPluginNode(prev.length, true, { x: nextJob.x, y: nextJob.y }, source.id)];
        persistLifePlugins(nextPlugins, nextPrompt);
        return nextPlugins;
      });
      setVariantJob(null);
      setPrompt('');
      setComposerMode('bottom');
      variantTimerRef.current = null;
    }, 1600);
  };

  const cancelVariantBuild = () => {
    if (variantTimerRef.current) window.clearTimeout(variantTimerRef.current);
    variantTimerRef.current = null;
    setVariantJob(null);
  };

  const resetCanvas = () => {
    if (variantTimerRef.current) window.clearTimeout(variantTimerRef.current);
    variantTimerRef.current = null;
    setPlugins([]);
    setPrompt('');
    setVariantJob(null);
    setPackageState(null);
    setEmptyHintHidden(false);
    setComposerMode('center');
    persistLifePlugins([], undefined, 'draft');
  };

  const createCanvasTab = () => {
    const nextIndex = canvasTabs.length + 1;
    const nextTab = { id: `canvas-${Date.now()}`, name: `画布 ${nextIndex}` };
    setCanvasTabs(prev => [...prev, nextTab]);
    setActiveCanvasId(nextTab.id);
    resetCanvas();
  };

  const closeCanvasTab = (id: string) => {
    setCanvasTabs(prev => {
      if (prev.length === 1) return prev;
      const next = prev.filter(tab => tab.id !== id);
      if (activeCanvasId === id) {
        setActiveCanvasId(next[0]?.id ?? 'canvas-1');
        resetCanvas();
      }
      return next;
    });
  };

  const openVariantDialog = (node: LifePluginNode) => {
    setVariantSource(node);
    setVariantOpen(true);
  };

  const applyWorkflowTemplate = (template: LifeWorkflowTemplate) => {
    const nextTab = { id: `canvas-${Date.now()}`, name: template.title };
    const placeholderBaseId = `life-placeholder-${Date.now()}`;
    const nextNodes = Array.from({ length: Math.max(1, template.count) }, (_, index): LifePluginNode => ({
      id: `${placeholderBaseId}-${index}`,
      title: `${template.title} ${index + 1}`,
      subtitle: '待生成 · placeholder',
      accent: (['blue', 'violet', 'emerald'] as const)[index % 3],
      kind: 'placeholder',
      parentId: index > 0 ? `${placeholderBaseId}-${index - 1}` : undefined,
      x: LIFE_CANVAS_CENTER.x + index * 340,
      y: index % 2 === 0 ? LIFE_CANVAS_CENTER.y + 30 : LIFE_CANVAS_CENTER.y + 100,
    }));
    setCanvasTabs(prev => [...prev, nextTab]);
    setActiveCanvasId(nextTab.id);
    setPlugins(nextNodes);
    setEmptyHintHidden(true);
    setComposerMode('bottom');
    setActivePanel(null);
  };

  const saveWorkflowTemplate = () => {
    if (!plugins.length) return;
    const nextTemplate: LifeWorkflowTemplate = {
      id: `my-template-${Date.now()}`,
      title: `我的模板 ${savedWorkflowTemplates.length + 1}`,
      size: '当前画布结构',
      count: plugins.length,
    };
    setSavedWorkflowTemplates(prev => [nextTemplate, ...prev]);
  };

  const startPackageBuild = (node: LifePluginNode) => {
    setPackageState({ node, step: 0, ready: false });
    if (sourceProject) {
      saveCubixLocalProject({
        ...sourceProject,
        buildMode: 'life-dashboard',
        designStage: 'review',
        solutionStatus: 'finalized',
        lifeDashboardPluginCount: Math.max(sourceProject.lifeDashboardPluginCount ?? 0, plugins.length),
        updatedAt: 'just now',
      });
    }
  };

  const handleCanvasWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setZoom(prev => Math.min(180, Math.max(60, prev + (event.deltaY > 0 ? -6 : 6))));
  };

  const handleCanvasPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!spaceDragActive) return;
    canvasDragRef.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y };
  };

  const handleCanvasPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (nodeDragRef.current) {
      const drag = nodeDragRef.current;
      const scale = zoom / 100;
      setPlugins(prev => prev.map(node => (
        node.id === drag.id
          ? { ...node, x: drag.x + (event.clientX - drag.startX) / scale, y: drag.y + (event.clientY - drag.startY) / scale }
          : node
      )));
      return;
    }
    if (!canvasDragRef.current) return;
    const drag = canvasDragRef.current;
    setPan({ x: drag.panX + event.clientX - drag.startX, y: drag.panY + event.clientY - drag.startY });
  };

  const handleCanvasPointerUp = () => {
    canvasDragRef.current = null;
    nodeDragRef.current = null;
  };

  const handleNodeDragStart = (node: LifePluginNode, event: ReactPointerEvent<HTMLDivElement>) => {
    if (!spaceDragActive) return;
    event.preventDefault();
    event.stopPropagation();
    nodeDragRef.current = { id: node.id, startX: event.clientX, startY: event.clientY, x: node.x, y: node.y };
  };

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden bg-[#f3f7fb] text-slate-900', spaceDragActive ? 'cursor-grab' : '')}
      onWheel={handleCanvasWheel}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onPointerLeave={handleCanvasPointerUp}
    >
      <div
        className="absolute inset-0"
        onPointerDown={closeFloatingPanels}
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.22) 1px, transparent 0)',
          backgroundSize: `${34 * zoom / 100}px ${34 * zoom / 100}px`,
        }}
      />

      <div className="absolute left-5 top-5 z-20 flex items-center gap-2">
        <Link href="/home/build" className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200">
          <ArrowLeft size={14} />
          创作台
        </Link>
        <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 text-xs font-semibold text-slate-700 shadow-sm">
          <LifeDashboardMark />
          <span className="max-w-[180px] truncate">{project.title}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="max-w-[100px] truncate text-slate-500">{activeCanvasName}</span>
        </div>
      </div>

      <div className="absolute left-[300px] top-5 z-20 flex max-w-[520px] items-center gap-1 overflow-hidden rounded-xl border border-slate-200 bg-white/92 p-1 shadow-sm shadow-slate-200/70">
        {canvasTabs.map(tab => {
          const active = tab.id === activeCanvasId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCanvasId(tab.id)}
              className={cn(
                'group flex h-8 min-w-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition',
                active ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <span className="max-w-[92px] truncate">{tab.name}</span>
              {canvasTabs.length > 1 ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={event => {
                    event.stopPropagation();
                    closeCanvasTab(tab.id);
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      closeCanvasTab(tab.id);
                    }
                  }}
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full transition',
                    active ? 'text-white/75 hover:bg-white/15 hover:text-white' : 'text-slate-300 hover:bg-slate-200 hover:text-slate-700'
                  )}
                >
                  <X size={10} />
                </span>
              ) : null}
            </button>
          );
        })}
        <button onClick={createCanvasTab} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600" title="新建画布">
          <Plus size={14} />
        </button>
      </div>

      <div className="absolute left-1/2 top-5 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-2 py-1.5 shadow-lg shadow-slate-200/70">
        <button className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-500">
          <Image size={14} />
          插件画布
        </button>
        <button onClick={() => nudgeZoom(-10)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100" title="缩小">
          <Minus size={14} />
        </button>
        <div className="w-14 text-center text-xs font-semibold text-slate-700">{zoom}%</div>
        <button onClick={() => nudgeZoom(10)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100" title="放大">
          <Plus size={14} />
        </button>
        <span className="h-5 w-px bg-slate-200" />
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100" title="适配画布">
          <Maximize2 size={14} />
        </button>
      </div>

      <div className="absolute left-5 top-28 z-20 flex w-[74px] flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/94 p-2 shadow-lg shadow-slate-200/60">
        {[
          { label: '新建', icon: FilePlus2, action: createCanvasTab, active: false, badge: null },
          { label: '资产', icon: FolderOpen, action: () => setActivePanel(prev => prev === 'assets' ? null : 'assets'), active: activePanel === 'assets', badge: plugins.length || null },
          { label: '工作流', icon: ListTree, action: () => setActivePanel(prev => prev === 'workflow' ? null : 'workflow'), active: activePanel === 'workflow', badge: null },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className={cn(
              'relative flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition',
              item.active ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
            )}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
            {item.badge ? (
              <span className="absolute right-1.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] text-white">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
        <span className="my-1 h-px w-9 bg-slate-200" />
        {[
          { label: '模板', icon: BookOpen, action: () => setPromptPanel(prev => prev === 'template' ? null : 'template'), active: promptPanel === 'template' },
          { label: '风格', icon: SlidersVertical, action: () => setPromptPanel(prev => prev === 'style' ? null : 'style'), active: promptPanel === 'style' },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className={cn(
              'flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition',
              item.active ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
            )}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {activePanel === 'assets' ? (
        <LifeAssetsPanel
          plugins={plugins}
          onTune={openVariantDialog}
          onClose={() => setActivePanel(null)}
        />
      ) : null}

      {activePanel === 'workflow' ? (
        <LifeWorkflowPanel
          presets={LIFE_WORKFLOW_PRESETS}
          savedTemplates={savedWorkflowTemplates}
          canSave={plugins.length > 0}
          onApply={applyWorkflowTemplate}
          onSave={saveWorkflowTemplate}
          onClose={() => setActivePanel(null)}
        />
      ) : null}

      <div ref={canvasViewportRef} className="absolute inset-0 overflow-auto pb-44 pt-24">
        <div
          className="relative h-[980px] min-w-[1680px]"
          onDoubleClick={() => {
            if (plugins.length === 0) {
              setEmptyHintHidden(true);
              setComposerMode('center');
            }
          }}
          onPointerDown={event => {
            if (event.target === event.currentTarget && !spaceDragActive) closeFloatingPanels();
          }}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            transformOrigin: 'center top',
          }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {plugins.filter(node => node.parentId).map(node => {
              const previous = plugins.find(item => item.id === node.parentId);
              if (!previous) return null;
              return (
                <path
                  key={`${previous.id}-${node.id}`}
                  d={`M ${previous.x + 242} ${previous.y + 176} C ${previous.x + 310} ${previous.y + 176}, ${node.x - 72} ${node.y + 176}, ${node.x} ${node.y + 176}`}
                  fill="none"
                  stroke="rgba(37, 99, 235, 0.45)"
                  strokeWidth="2"
                  strokeDasharray="6 7"
                />
              );
            })}
          {packageState ? (
            <path
                d={`M ${packageState.node.x + 126} ${packageState.node.y + 430} C ${packageState.node.x + 126} ${packageState.node.y + 500}, ${packageState.node.x + 318} ${packageState.node.y + 510}, ${packageState.node.x + 318} ${packageState.node.y + 550}`}
                fill="none"
                stroke="rgba(16, 185, 129, 0.55)"
                strokeWidth="2"
                strokeDasharray="6 7"
              />
            ) : null}
            {variantJob ? (
              <path
                d={`M ${variantJob.source.x + 242} ${variantJob.source.y + 176} C ${variantJob.source.x + 310} ${variantJob.source.y + 176}, ${variantJob.x - 82} ${variantJob.y + 150}, ${variantJob.x} ${variantJob.y + 150}`}
                fill="none"
                stroke="rgba(37, 99, 235, 0.62)"
                strokeWidth="2"
                strokeDasharray="6 7"
              />
            ) : null}
          </svg>

          {plugins.map((node, index) => (
            <LifePluginCard
              key={node.id}
              node={node}
              index={index}
              onVariant={() => openVariantDialog(node)}
              onQuickVariant={() => startVariantBuild(node)}
              onPackage={() => startPackageBuild(node)}
              onDragStart={handleNodeDragStart}
              draggableActive={spaceDragActive}
            />
          ))}

          {variantJob ? (
            <LifeVariantGeneratingNode
              job={variantJob}
              onCancel={cancelVariantBuild}
            />
          ) : null}

          {packageState ? (
            <LifePluginPackageNode
              state={packageState}
              x={packageState.node.x + 98}
              y={packageState.node.y + 550}
              onClose={() => setPackageState(null)}
            />
          ) : null}

        </div>
      </div>

      {plugins.length === 0 && !isGenerating && !emptyHintHidden ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-40 top-24 z-10 flex items-center justify-center px-24">
          <LifeEmptyCanvasHint onActivate={() => {
            setEmptyHintHidden(true);
            setComposerMode('center');
          }} />
        </div>
      ) : null}

      <div className={cn(
        'absolute z-30 w-[min(760px,calc(100vw-48px))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl shadow-slate-300/70 transition-all duration-300',
        composerMode === 'center' ? 'left-1/2 top-1/2 -translate-y-1/2' : 'bottom-5 left-1/2'
      )}>
        {isGenerating ? (
          <div className="absolute bottom-[calc(100%+10px)] left-0 flex h-12 min-w-[260px] items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 text-sm font-semibold text-slate-700 shadow-xl shadow-blue-100/80">
            <Loader2 size={18} className="animate-spin text-blue-600" />
            正在生成 App 插件...
          </div>
        ) : null}
        {promptPanel ? (
          <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600">{promptPanel === 'template' ? '模板' : '风格'}</div>
              <button onClick={() => setPromptPanel(null)} className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700">
                <X size={13} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(promptPanel === 'template' ? LIFE_TEMPLATE_PROMPTS : LIFE_STYLE_PROMPTS).map(item => (
                <button
                  key={item.label}
                  onClick={() => appendPrompt(item.prompt)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100">
              <MessageCircle size={14} />
              历史
            </button>
            <button className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100">
              <UploadCloud size={14} />
              附件
            </button>
            <button
              onClick={() => setPromptPanel(prev => prev === 'template' ? null : 'template')}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition',
                promptPanel === 'template' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              )}
            >
              <BookOpen size={14} />
              模板
            </button>
            <button
              onClick={() => setPromptPanel(prev => prev === 'style' ? null : 'style')}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition',
                promptPanel === 'style' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
              )}
            >
              <SlidersVertical size={14} />
              风格
            </button>
            <button className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100">
              <Sparkles size={14} />
              小技巧
            </button>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1 text-[10px] font-semibold text-slate-500">
            {['快', '中', '精'].map(label => (
              <button key={label} className={cn('h-6 w-8 rounded-md', label === '中' ? 'bg-white text-blue-600 shadow-sm' : '')}>{label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <textarea
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                addPlugin(Boolean(plugins.length));
              }
            }}
            rows={2}
            placeholder="描述一个生活看板，按 Enter 生成..."
            className="min-h-12 flex-1 resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            onClick={() => addPlugin(Boolean(plugins.length))}
            disabled={!canGenerate}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
            title="生成"
          >
            {isGenerating ? <Loader2 size={17} className="animate-spin" /> : <SendHorizontal size={17} />}
          </button>
        </div>
      </div>

      {variantOpen ? (
        <LifeVariantDialog
          onClose={() => setVariantOpen(false)}
          onGenerate={generateVariantWithPrompt}
        />
      ) : null}
    </div>
  );
}

function LifeDashboardMark() {
  return (
    <span className="grid h-5 w-5 grid-cols-2 gap-0.5 rounded-md bg-blue-50 p-1 text-blue-600">
      <span className="rounded-sm bg-current opacity-80" />
      <span className="rounded-sm bg-current opacity-40" />
      <span className="rounded-sm bg-current opacity-40" />
      <span className="rounded-sm bg-current opacity-80" />
    </span>
  );
}

function LifeEmptyCanvasHint({ onActivate }: { onActivate: () => void }) {
  return (
    <button
      onDoubleClick={onActivate}
      onClick={event => event.stopPropagation()}
      className="pointer-events-auto flex w-[330px] flex-col items-center px-7 py-8 text-center transition"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
        <SendHorizontal size={22} />
      </span>
      <span className="mt-4 text-base font-semibold text-slate-950">双击开始创作</span>
      <span className="mt-2 text-xs leading-5 text-slate-500">
        画布由 AI 生成，也可以从左侧资产和工作流继续组织节点。
      </span>
      <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/78 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
        <MessageCircle size={13} />
        双击后打开对话框
      </span>
    </button>
  );
}

function LifeAssetsPanel({
  plugins,
  onTune,
  onClose,
}: {
  plugins: LifePluginNode[];
  onTune: (node: LifePluginNode) => void;
  onClose: () => void;
}) {
  return (
    <aside className="absolute left-[98px] top-28 z-30 w-[360px] rounded-2xl border border-slate-200 bg-white/96 p-3 text-slate-900 shadow-2xl shadow-slate-300/60">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">资产 ({plugins.length})</div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X size={14} />
        </button>
      </div>
      <div className="mb-3 flex gap-2">
        <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400">
          <Search size={13} />
          搜索...
        </div>
        <button className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600">
          全部画布
          <ChevronDown size={13} />
        </button>
      </div>
      {plugins.length ? (
        <div className="grid grid-cols-2 gap-2">
          {plugins.map((node, index) => (
            <article key={node.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <button onClick={() => onTune(node)} className="block h-24 w-full bg-gradient-to-br from-blue-50 via-white to-violet-50 p-3 text-left">
                <div className="flex h-full flex-col justify-between rounded-lg bg-white/75 p-2 shadow-sm">
                  <LifeDashboardMark />
                  <div>
                    <div className="truncate text-xs font-semibold text-slate-900">{node.title}</div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-500">v{index + 1} · {node.kind === 'placeholder' ? '占位节点' : 'App 插件'}</div>
                  </div>
                </div>
              </button>
              <div className="flex items-center justify-between gap-1 px-2 py-2">
                <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold', node.kind === 'placeholder' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600')}>
                  {node.kind === 'placeholder' ? '结构' : '生成'}
                </span>
                <button onClick={() => onTune(node)} className="h-6 rounded-md bg-white px-2 text-[10px] font-semibold text-slate-600 transition hover:text-blue-600" title="微调">
                  微调
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
          <div className="text-sm font-semibold text-slate-700">还没有生成作品</div>
          <div className="mt-1 text-xs text-slate-400">双击画布或使用底部对话框生成后，会自动进入资产。</div>
        </div>
      )}
    </aside>
  );
}

function LifeWorkflowPanel({
  presets,
  savedTemplates,
  canSave,
  onApply,
  onSave,
  onClose,
}: {
  presets: LifeWorkflowTemplate[];
  savedTemplates: LifeWorkflowTemplate[];
  canSave: boolean;
  onApply: (template: LifeWorkflowTemplate) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'presets' | 'mine'>('presets');
  const currentTemplates = tab === 'presets' ? presets : savedTemplates;

  return (
    <aside className="absolute left-[98px] top-28 z-30 w-[420px] rounded-2xl border border-slate-200 bg-white/96 text-slate-900 shadow-2xl shadow-slate-300/60">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="text-sm font-semibold">工作流模板</div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X size={14} />
        </button>
      </div>
      <div className="flex border-b border-slate-200 px-4 pt-2 text-xs font-semibold text-slate-500">
        <button onClick={() => setTab('presets')} className={cn('border-b-2 px-2 pb-2 transition', tab === 'presets' ? 'border-blue-600 text-blue-700' : 'border-transparent hover:text-slate-900')}>
          画布预设 <span className="ml-1 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">{presets.length}</span>
        </button>
        <button onClick={() => setTab('mine')} className={cn('border-b-2 px-2 pb-2 transition', tab === 'mine' ? 'border-blue-600 text-blue-700' : 'border-transparent hover:text-slate-900')}>
          我的模板 <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{savedTemplates.length}</span>
        </button>
        <button
          onClick={onSave}
          disabled={!canSave}
          className="ml-auto mb-2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          保存当前结构
        </button>
      </div>
      <div className="max-h-[520px] overflow-y-auto p-4">
        {currentTemplates.length ? (
          <div className="grid grid-cols-2 gap-3">
            {currentTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => onApply(template)}
                className="group rounded-xl border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="h-24 rounded-lg border border-slate-200 bg-white/70 p-3">
                  <div className="flex h-full items-center justify-center gap-2">
                    {Array.from({ length: Math.min(template.count, 4) }, (_, index) => (
                      <span key={index} className="h-8 w-8 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-800">{template.title}</div>
                <div className="mt-1 text-[11px] text-slate-500">{template.size}</div>
                <div className="mt-2 text-[10px] font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">应用为空节点结构</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <div className="text-sm font-semibold text-slate-700">还没有我的模板</div>
            <div className="mt-1 text-xs text-slate-400">把当前画布的节点和连线保存为模板，不包含具体 App 插件内容。</div>
          </div>
        )}
      </div>
    </aside>
  );
}

function LifeVariantGeneratingNode({
  job,
  onCancel,
}: {
  job: LifeVariantJob;
  onCancel: () => void;
}) {
  return (
    <section
      className="absolute w-[300px] rounded-2xl border border-blue-200 bg-white/96 p-4 text-slate-900 shadow-2xl shadow-blue-100/80"
      style={{ left: job.x, top: job.y }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">正在创建插件</div>
          <div className="mt-1 text-xs text-slate-500">基于 {job.source.title} 生成右侧变体</div>
        </div>
        <button onClick={onCancel} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X size={14} />
        </button>
      </div>
      <div className="mt-4 h-36 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
          <Loader2 size={14} className="animate-spin" />
          AI 正在排版 App 插件...
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map(item => (
              <div key={item} className="h-10 animate-pulse rounded-lg bg-white" />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-[11px] leading-4 text-slate-500">{job.prompt}</p>
    </section>
  );
}

function LifePluginPreviewNode({
  node,
  index,
  onClose,
  onChat,
}: {
  node: LifePluginNode;
  index: number;
  onClose: () => void;
  onChat: () => void;
}) {
  const accentClass = {
    blue: 'from-blue-500 to-indigo-500 shadow-blue-200',
    violet: 'from-violet-500 to-fuchsia-500 shadow-violet-200',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-200',
  }[node.accent];

  return (
    <section className="absolute left-[760px] top-[86px] z-30 w-[342px] rounded-[28px] border border-blue-200 bg-white p-4 text-slate-900 shadow-2xl shadow-blue-200/70">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{node.title}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">放大查看 · v{index + 1}</div>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X size={15} />
        </button>
      </div>
      <div className="origin-top scale-[1.18]">
        <LifePhoneMock node={node} index={index} accentClass={accentClass} />
      </div>
      <div className="mt-[78px] flex gap-2">
        <button onClick={onChat} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white transition hover:bg-blue-700">
          <MessageCircle size={14} />
          Chat 调整
        </button>
        <button onClick={onClose} className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
          关闭
        </button>
      </div>
    </section>
  );
}

function LifePluginCard({
  node,
  index,
  onVariant,
  onQuickVariant,
  onPackage,
  onDragStart,
  draggableActive,
}: {
  node: LifePluginNode;
  index: number;
  onVariant: () => void;
  onQuickVariant: () => void;
  onPackage: () => void;
  onDragStart: (node: LifePluginNode, event: ReactPointerEvent<HTMLDivElement>) => void;
  draggableActive: boolean;
}) {
  const accentClass = {
    blue: 'from-blue-500 to-indigo-500 shadow-blue-200',
    violet: 'from-violet-500 to-fuchsia-500 shadow-violet-200',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-200',
  }[node.accent];

  return (
    <div
      className={cn('absolute w-[250px]', draggableActive ? 'cursor-grab' : '')}
      style={{ left: node.x, top: node.y }}
      onPointerDown={event => onDragStart(node, event)}
    >
      <LifePhoneMock node={node} index={index} accentClass={accentClass} />
      <div className="mt-2 flex items-center justify-center gap-1.5">
        <button onClick={onQuickVariant} className="flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
          <RotateCcw size={13} />
          重新生成
        </button>
        <button onClick={onVariant} className="flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600">
          <Pencil size={13} />
          微调
        </button>
        <button onClick={onQuickVariant} className="flex h-8 items-center gap-1 rounded-full bg-blue-600 px-2.5 text-[11px] font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700">
          <Wand2 size={13} />
          生成变体
        </button>
      </div>
      <button onClick={onPackage} className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 text-xs font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5">
        <Grid2X2 size={13} />
        生成插件包
      </button>
    </div>
  );
}

function LifePhoneMock({ node, index, accentClass }: { node: LifePluginNode; index: number; accentClass: string }) {
  return (
    <div className="rounded-[34px] bg-slate-950 p-2.5 shadow-2xl shadow-slate-400/60">
      <div className="relative h-[400px] overflow-hidden rounded-[27px] bg-[#f7fbff] px-4 pb-4 pt-7">
        <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-950" />
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
          <span>9:41</span>
          <span>▥ 100%</span>
        </div>
        <div className="mt-5 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-semibold text-slate-400">v{index + 1}</div>
            <h3 className="mt-1 text-xl font-bold text-slate-950">{node.title}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">24°C · 多云 · 空气优</p>
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-base shadow-lg', accentClass)}>
            🏠
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-hidden">
          {node.subtitle.split(' · ').map(item => (
            <span key={item} className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">{item}</span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {[
            ['🎬', '场景', '影院 · 起夜'],
            ['💡', '客厅主灯', '已开 · 80%'],
            ['🌡️', '温湿度', '24°C · 56%'],
            ['🚪', '门锁', '已锁'],
            ['📡', 'FP2 客厅', '有人'],
            ['🎙️', 'AI 助手', '说“我回家了”'],
          ].map(([icon, title, desc], cardIndex) => (
            <div key={title} className={cn(
              'min-h-[58px] rounded-2xl bg-white p-2.5 shadow-sm',
              cardIndex === 0 || cardIndex === 5 ? 'bg-gradient-to-br from-blue-50 to-violet-50' : ''
            )}>
              <div className="text-base">{icon}</div>
              <div className="mt-1 text-xs font-bold text-slate-900">{title}</div>
              <div className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LifePluginPackageNode({
  state,
  x,
  y,
  onClose,
}: {
  state: LifePackageState;
  x: number;
  y: number;
  onClose: () => void;
}) {
  return (
    <section
      className="absolute w-[420px] rounded-[26px] border border-emerald-200 bg-white p-4 text-slate-950 shadow-2xl shadow-emerald-100/80"
      style={{ left: x, top: y }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <Grid2X2 size={16} />
          {state.node.title} · 插件包 v1.0.0
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X size={15} />
        </button>
      </div>

      {!state.ready ? (
        <div>
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-violet-50 px-3 py-3 text-sm font-semibold text-violet-700">
            <Loader2 size={16} className="animate-spin" />
            生成插件包中...
          </div>
          <div className="space-y-2">
            {LIFE_PACKAGE_STEPS.map((step, index) => {
              const done = index < state.step;
              const active = index === state.step;
              return (
                <div key={step} className={cn(
                  'flex h-8 items-center gap-2 rounded-xl px-3 text-xs font-semibold',
                  active ? 'bg-blue-50 text-blue-700' : done ? 'text-emerald-600' : 'text-slate-300'
                )}>
                  {done ? <CheckCircle2 size={13} /> : active ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                  {step}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
          <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-slate-50 p-3">
            <FakeQrCode />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">扫码安装到 Aqara Life</h3>
            <div className="mt-2 space-y-1.5 text-xs leading-5 text-slate-500">
              <div>1. 打开 Aqara Life App</div>
              <div>2. 首页 → 扫一扫</div>
              <div>3. 自动作为 Home 页插件</div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <SmartphoneIcon />
                推送到业主账号
              </div>
              <div className="flex gap-2">
                <input placeholder="手机号 / Aqara 账号" className="h-9 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-300" />
                <button className="h-9 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white">推送</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FakeQrCode() {
  return (
    <div className="grid h-full w-full grid-cols-9 grid-rows-9 gap-1">
      {Array.from({ length: 81 }, (_, index) => {
        const x = index % 9;
        const y = Math.floor(index / 9);
        const corner = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
        const filled = corner || (index * 7 + x * 3 + y * 5) % 4 !== 0;
        return <span key={index} className={cn('rounded-[2px]', filled ? 'bg-slate-950' : 'bg-transparent')} />;
      })}
    </div>
  );
}

function SmartphoneIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded border border-violet-300/50 text-[10px] text-violet-200">
      ▯
    </span>
  );
}

function LifeVariantDialog({ onClose, onGenerate }: { onClose: () => void; onGenerate: (prompt: string) => void }) {
  const options = ['字体再大一些', '加一个语音入口', '简化卡片，只留 4 个', '主色调换成暖色', '增加紧急呼叫块', '常用场景置顶'];
  const [value, setValue] = useState('');

  const appendValue = (option: string) => {
    setValue(prev => {
      const separator = prev.trim() ? '，' : '';
      return `${prev}${separator}${option}`;
    });
  };

  return (
    <div onPointerDown={onClose} className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/25 backdrop-blur-sm">
      <div onPointerDown={event => event.stopPropagation()} className="w-[min(720px,calc(100vw-40px))] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-500/40">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-950">
            <SlidersVertical size={18} className="text-blue-600" />
            微调 · 生成变体
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>
        <div className="mt-5">
          <div className="text-xs font-semibold text-slate-500">常用调整 · 可多选叠加</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {options.map(option => (
              <button
                key={option}
                onClick={() => appendValue(option)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {option}
              </button>
            ))}
          </div>
          <textarea
            value={value}
            onChange={event => setValue(event.target.value)}
            rows={3}
            placeholder="如：把紧急呼叫做成红色大按钮放在最上方"
            className="mt-5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-blue-300"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">取消</button>
          <button onClick={() => onGenerate(value)} className="h-10 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700">生成变体</button>
        </div>
      </div>
    </div>
  );
}

function PersonaReviewCanvas({ project, isPro }: { project: ProjectModel; isPro: boolean }) {
  const homes = isPro ? ['客户家庭', project.title, '示范 Studio'] : [project.title, '父母家', '周末住所'];
  const members = isPro ? ['所有者', '儿童', '老人'] : ['家主人', '儿童', '老人'];
  const outputs = ['首页看板', '场景卡片', '扫码领取'];
  const [selectedHome, setSelectedHome] = useState(homes[0]);
  const [selectedMember, setSelectedMember] = useState(members[0]);
  const [selectedOutput, setSelectedOutput] = useState(outputs[0]);

  return (
    <div className="absolute inset-0 overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated px-3 py-1 text-2xs font-semibold text-text-muted">
            <Users size={11} className="text-accent" />
            成员看板
          </div>
          <Link href="/home/build" className="rounded-lg border border-border bg-bg-elevated px-3 py-2 text-2xs font-semibold text-text-muted transition hover:text-text">
            返回创作台
          </Link>
        </div>

        <div className="rounded-[28px] border border-border bg-bg-elevated p-5 shadow-sm shadow-slate-300/60 dark:shadow-black/30">
          <h2 className="text-xl font-semibold">选择家庭与成员</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SelectorGroup
              title="家庭"
              items={homes}
              selected={selectedHome}
              onSelect={setSelectedHome}
            />
            <SelectorGroup
              title="成员"
              items={members}
              selected={selectedMember}
              onSelect={setSelectedMember}
            />
            <SelectorGroup
              title="输出"
              items={outputs}
              selected={selectedOutput}
              onSelect={setSelectedOutput}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-bg/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-text-subtle">已选择</div>
              <div className="mt-1 truncate text-sm font-semibold text-text">
                {selectedHome} · {selectedMember} · {selectedOutput}
              </div>
            </div>
            <button className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700">
              生成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectorGroup({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-bg/70 p-3">
      <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-text-subtle">{title}</div>
      <div className="space-y-2">
        {items.map(item => {
          const active = selected === item;
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={cn(
                'flex h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-xs font-semibold transition',
                active ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-border bg-bg-elevated text-text-muted hover:text-text'
              )}
            >
              <span className="truncate">{item}</span>
              {active ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BriefLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg px-3 py-2">
      <div className="text-[10px] text-text-subtle">{label}</div>
      <div className="mt-0.5 text-xs font-semibold text-text">{value}</div>
    </div>
  );
}

function VisualizationAssetCard({ asset }: { asset: GeneratedMediaAsset }) {
  return (
    <a href={MARBLE_PREVIEW_URL} className="block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200">
      <div className={cn('h-28 bg-gradient-to-br', asset.gradient)}>
        <div className="flex h-full items-end justify-between bg-black/20 p-4 text-white">
          <span className="text-sm font-semibold">{asset.room}</span>
          <span className="rounded-full bg-black/30 px-2 py-1 text-[10px] font-semibold">{outputTypeLabel(asset.outputType)}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-950">{asset.title}</div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-500">{reviewStatusLabel(asset.reviewStatus)}</span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-500">{asset.creditsCost} Credits</span>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Open</span>
        </div>
        <div className="mt-3 text-[11px] leading-4 text-slate-400">
          {asset.providerLabel} · Marble 1.0 · {asset.promptHash} · seed {asset.seed}
        </div>
      </div>
    </a>
  );
}

function SolutionOverviewCanvas({
  project,
  automationScenes,
  completedStages,
  readOnly,
  onPost,
  onRemix,
}: {
  project: ProjectModel;
  automationScenes: AutomationScene[];
  floorPlanPreviewUrl: string;
  completedStages: StageId[];
  readOnly: boolean;
  onPost: () => void;
  onEditSpace: () => void;
  onEditAutomation: () => void;
  onRemix: () => void;
}) {
  const effectiveDeviceCount = Math.max(project.devices, project.devicesList.length);
  const spaceCompletionItems: CompletionCriterion[] = [
    {
      label: '户型图已解析并矢量化',
      detail: readOnly ? '共享方案已完成' : '上传户型图后生成可编辑空间底图',
      done: readOnly || completedStages.includes('floor'),
      weight: 35,
    },
    {
      label: '比例尺已设置',
      detail: '用于覆盖范围、距离和点位密度计算',
      done: readOnly || completedStages.includes('floor'),
      weight: 20,
    },
    {
      label: '房间语义已确认',
      detail: `${project.rooms} 个空间可被自动化引用`,
      done: readOnly || completedStages.includes('floor') || project.rooms > 0,
      weight: 20,
    },
    {
      label: '设备点位已规划',
      detail: `${effectiveDeviceCount} 个点位进入空间模型`,
      done: readOnly || completedStages.includes('points') || effectiveDeviceCount > 0,
      weight: 25,
    },
  ];
  const readySceneCount = automationScenes.filter(scene => scene.status === 'Ready').length;
  const automationReadyRatio = automationScenes.length ? readySceneCount / automationScenes.length : 0;
  const automationCompletionItems: CompletionCriterion[] = [
    {
      label: '自动化清单已生成',
      detail: `${automationScenes.length} 条场景规则`,
      done: automationScenes.length > 0,
      weight: 20,
    },
    {
      label: '触发 / 条件 / 动作已结构化',
      detail: '规则可进入自动化编辑器继续细化',
      done: automationScenes.length > 0 && automationScenes.every(scene => scene.trigger && scene.condition && scene.action),
      weight: 30,
    },
    {
      label: '已绑定空间范围',
      detail: '每条规则都能回到户型空间',
      done: automationScenes.length > 0 && automationScenes.every(scene => scene.spaces.length > 0),
      weight: 20,
    },
    {
      label: `${readySceneCount}/${automationScenes.length || 0} 条 Ready`,
      detail: 'Review 状态代表还需要用户确认',
      done: automationScenes.length > 0 && readySceneCount === automationScenes.length,
      weight: 30,
      score: Math.round(30 * automationReadyRatio),
    },
  ];
  const spaceCompletion = weightedCompletion(spaceCompletionItems);
  const automationCompletion = automationScenes.length ? weightedCompletion(automationCompletionItems) : 0;
  const sections = [
    { label: '空间', value: `${project.rooms} rooms`, icon: Home },
    { label: '设备', value: `${effectiveDeviceCount} points`, icon: Radar },
    { label: '自动化', value: `${automationScenes.length} scenes`, icon: Zap },
    { label: '预算', value: '$1,860', icon: CircleDollarSign },
  ];
  const solutionSlug = (project.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'solution';
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char));
  const csvCell = (value: string | number | boolean) => `"${String(value).replace(/"/g, '""')}"`;
  const toDownloadHref = (mime: string, content: string) => `data:${mime};charset=utf-8,${encodeURIComponent(content)}`;
  const deviceRows = project.devicesList.length
    ? project.devicesList.map(device => [device.room, device.name, device.model, device.type, device.status].map(csvCell).join(',')).join('\n')
    : ['未规划', 'Selected Devices', `${effectiveDeviceCount} points`, 'planning', 'pending'].map(csvCell).join(',');
  const sceneRows = automationScenes.length
    ? automationScenes.map(scene => [scene.name, scene.spaces.join(' / '), scene.trigger, scene.condition, scene.action, scene.status].map(csvCell).join(',')).join('\n')
    : ['待生成', '-', '-', '-', '-', 'Draft'].map(csvCell).join(',');
  const briefingHtml = [
    '<!doctype html><html><head><meta charset="utf-8" />',
    `<title>${escapeHtml(project.title)} Handover</title>`,
    '<style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#0f172a}h1{font-size:28px}section{margin-top:24px}li{margin:8px 0}</style>',
    '</head><body>',
    `<h1>${escapeHtml(project.title)} 方案交底单</h1>`,
    `<p>空间 ${project.rooms} rooms · 点位 ${effectiveDeviceCount} points · 自动化 ${automationScenes.length} scenes · 预算 $1,860</p>`,
    '<section><h2>交付范围</h2><ul>',
    '<li>户型与空间语义确认</li>',
    '<li>设备点位与虚拟设备节点</li>',
    '<li>自动化场景规则与 Ready 状态</li>',
    '<li>后续部署目标可在我的方案中独立选择 Studio</li>',
    '</ul></section></body></html>',
  ].join('');
  const quoteCsv = [
    ['Room', 'Device', 'Model', 'Type', 'Status'].map(csvCell).join(','),
    deviceRows,
  ].join('\n');
  const automationCsv = [
    ['Name', 'Spaces', 'Trigger', 'Condition', 'Action', 'Status'].map(csvCell).join(','),
    sceneRows,
  ].join('\n');
  const drawingSvg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="560" viewBox="0 0 960 560">',
    '<rect width="960" height="560" rx="24" fill="#f8fbff"/>',
    '<rect x="190" y="110" width="580" height="340" fill="#fff" stroke="#0f172a" stroke-width="8"/>',
    '<path d="M190 220H770M430 110V220M500 220V450M190 330H500" stroke="#0f172a" stroke-width="7"/>',
    '<rect x="245" y="145" width="100" height="14" rx="7" fill="#e0f2fe" stroke="#64748b" stroke-width="3"/>',
    '<rect x="515" y="145" width="150" height="74" rx="28" fill="#fff7ed" stroke="#64748b" stroke-width="4"/>',
    '<rect x="275" y="375" width="170" height="58" rx="24" fill="#eff6ff" stroke="#64748b" stroke-width="4"/>',
    '<text x="190" y="500" fill="#475569" font-family="Arial" font-size="22">Space drawings · rooms, scale, device points</text>',
    '</svg>',
  ].join('');
  const deliveryAssets: DeliveryAsset[] = [
    {
      title: '方案交底单',
      desc: '空间范围、设备点位、场景意图与部署边界',
      meta: 'HTML · 可打印为 PDF',
      filename: `${solutionSlug}-handover.html`,
      href: toDownloadHref('text/html', briefingHtml),
      ready: spaceCompletion > 0,
      status: spaceCompletion >= 100 ? 'Ready' : 'Draft',
      icon: FileCheck2,
    },
    {
      title: '设备报价单',
      desc: `${effectiveDeviceCount} 个点位的设备、房间与状态明细`,
      meta: 'CSV · 可导入表格',
      filename: `${solutionSlug}-quotation.csv`,
      href: toDownloadHref('text/csv', quoteCsv),
      ready: effectiveDeviceCount > 0,
      status: effectiveDeviceCount > 0 ? 'Ready' : 'Draft',
      icon: CircleDollarSign,
    },
    {
      title: '空间图纸包',
      desc: '户型、房间边界、比例尺和点位示意图',
      meta: 'SVG · 可继续标注',
      filename: `${solutionSlug}-drawings.svg`,
      href: toDownloadHref('image/svg+xml', drawingSvg),
      ready: spaceCompletion > 0,
      status: spaceCompletion >= 100 ? 'Ready' : 'Draft',
      icon: Layers2,
    },
    {
      title: '自动化清单',
      desc: '触发、条件、动作、空间范围和 Ready 状态',
      meta: 'CSV · 规则列表',
      filename: `${solutionSlug}-automation.csv`,
      href: toDownloadHref('text/csv', automationCsv),
      ready: automationScenes.length > 0,
      status: automationScenes.length ? `${readySceneCount}/${automationScenes.length} Ready` : '待生成',
      icon: Zap,
    },
  ];
  const readyAssetCount = deliveryAssets.filter(asset => asset.ready).length;
  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#eef4fb] p-5 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-300/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <FileCheck2 size={13} />
                {readOnly ? 'Shared Solution Preview' : 'Solution Overview'}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{project.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {readOnly
                  ? '这是别人发布的只读空间方案。先查看空间价值、设备逻辑、完成度和自动化清单；有新想法时可以 Remix 成自己的项目。Remix 后默认回到方案确认页，再按模块进入 Planning、空间设计或自动化编辑器。'
                  : '确认空间规划和场景方案后，会沉淀为可复用的方案包；部署会在我的方案中作为独立操作进入。'}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-blue-200">
                <Printer size={14} />
                打印
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-blue-200">
                <Share2 size={14} />
                分享
              </button>
              {readOnly ? (
                <button onClick={onRemix} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200">
                  <Sparkles size={14} />
                  Remix
                </button>
              ) : (
                <button onClick={onPost} className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
                  <SendHorizontal size={14} />
                  Post
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {sections.map(item => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <item.icon size={17} className="text-blue-600" />
                <div className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">{item.value}</div>
              </div>
            ))}
          </div>

          {readOnly ? (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <ReadOnlyValueTile
                icon={Eye}
                title="先看完整方案"
                desc="共享方案保持只读，适合先判断空间、设备和自动化是否值得复用。"
              />
              <ReadOnlyValueTile
                icon={Sparkles}
                title="Remix 后归你所有"
                desc="创建独立个人项目，不影响原作者方案，可继续改预算、设备和场景。"
              />
              <ReadOnlyValueTile
                icon={Wand2}
                title="从总览选择入口"
                desc="新项目默认停在方案确认页，想调设备时可回 Planning，想调规则时进自动化编辑器。"
              />
            </div>
          ) : null}

          <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-[11px] font-semibold text-blue-700 shadow-sm">
                  <FolderOpen size={13} />
                  Delivery Package
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">交付资料</h2>
                <div className="mt-1 text-xs text-slate-500">交底单、报价单、图纸和规则清单</div>
              </div>
              <div className="flex items-center gap-3">
                <CompletionPill value={Math.round((spaceCompletion + automationCompletion) / 2)} />
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                  {readyAssetCount}/{deliveryAssets.length} Ready
                </span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {deliveryAssets.map(asset => (
                <DeliveryAssetCard key={asset.title} asset={asset} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function weightedCompletion(items: CompletionCriterion[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (!total) return 0;
  const score = items.reduce((sum, item) => sum + (item.score ?? (item.done ? item.weight : 0)), 0);
  return Math.max(0, Math.min(100, Math.round((score / total) * 100)));
}

function ReadOnlyValueTile({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
      <Icon size={16} className="text-blue-600" />
      <div className="mt-2 text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-1 text-[11px] leading-5 text-slate-500">{desc}</div>
    </div>
  );
}

function DeliveryAssetCard({ asset }: { asset: DeliveryAsset }) {
  const Icon = asset.icon;
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-2xl',
          asset.ready ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-300'
        )}>
          <Icon size={19} />
        </span>
        <span className={cn(
          'rounded-full px-2.5 py-1 text-[10px] font-semibold',
          asset.ready ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
        )}>
          {asset.status}
        </span>
      </div>
      <div className="mt-5 text-base font-semibold tracking-tight text-slate-950">{asset.title}</div>
      <div className="mt-2 min-h-[40px] text-xs leading-5 text-slate-500">{asset.desc}</div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-[11px] font-semibold text-slate-400">{asset.meta}</span>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm shadow-blue-200">
          <Download size={13} />
          下载
        </span>
      </div>
    </>
  );

  const className = cn(
    'block min-h-[210px] rounded-[20px] border bg-white p-4 text-left shadow-sm transition',
    asset.ready
      ? 'border-slate-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100'
      : 'border-dashed border-slate-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100'
  );

  return (
    <a href={asset.href} download={asset.filename} className={className}>
      {content}
    </a>
  );
}

function CompletionDefinition({ items }: { items: CompletionCriterion[] }) {
  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">完成度口径</div>
      <div className="mt-2 grid gap-2">
        {items.map(item => {
          const partial = item.score !== undefined && item.score > 0 && item.score < item.weight;
          return (
            <div key={item.label} className="flex items-start gap-2">
              <span
                className={cn(
                  'mt-1 h-2 w-2 shrink-0 rounded-full',
                  item.done ? 'bg-emerald-500' : partial ? 'bg-blue-500' : 'bg-slate-300'
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-semibold text-slate-700">{item.label}</span>
                  <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                    {item.score !== undefined ? `${item.score}/${item.weight}` : `${item.done ? item.weight : 0}/${item.weight}`}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] leading-4 text-slate-400">{item.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompletionPill({ value }: { value: number }) {
  const done = value >= 100;
  return (
    <div className="flex items-center gap-2">
      <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', done ? 'bg-emerald-50 text-emerald-600' : value ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500')}>
        {value}%
      </span>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
        <div className={cn('h-full rounded-full', done ? 'bg-emerald-500' : 'bg-blue-600')} style={{ width: `${value ? Math.max(6, value) : 0}%` }} />
      </div>
    </div>
  );
}

function FlowThumbnail() {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-[10%] top-[42%] h-10 w-16 rounded-xl border border-blue-200 bg-blue-50" />
      <div className="absolute left-[42%] top-[24%] h-10 w-16 rounded-xl border border-amber-200 bg-amber-50" />
      <div className="absolute left-[42%] top-[58%] h-10 w-16 rounded-xl border border-slate-200 bg-slate-50" />
      <div className="absolute right-[10%] top-[42%] h-10 w-16 rounded-xl border border-emerald-200 bg-emerald-50" />
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M64 88 C105 88 100 52 136 52" stroke="#94a3b8" strokeWidth="3" fill="none" strokeDasharray="7 6" />
        <path d="M64 88 C105 88 100 124 136 124" stroke="#94a3b8" strokeWidth="3" fill="none" strokeDasharray="7 6" />
        <path d="M198 52 C240 64 236 88 284 88" stroke="#2563eb" strokeWidth="4" fill="none" />
        <path d="M198 124 C240 112 236 88 284 88" stroke="#2563eb" strokeWidth="4" fill="none" />
      </svg>
    </div>
  );
}

function DeploySelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; meta?: string }>;
}) {
  const selectedOption = options.find(option => option.value === value);

  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        disabled={!options.length}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition hover:border-blue-200 focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {options.length ? (
          options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          <option value="">暂无可选项</option>
        )}
      </select>
      {selectedOption?.meta ? (
        <span className="mt-1 block truncate text-[11px] font-medium text-slate-400">{selectedOption.meta}</span>
      ) : null}
    </label>
  );
}

function DeploymentMatchingCanvas({ project, isPro, floorPlanPreviewUrl }: { project: ProjectModel; isPro: boolean; floorPlanPreviewUrl: string }) {
  const [step, setStep] = useState<DeploymentWorkflowStep>('select');
  const [mappingPoints, setMappingPoints] = useState<PlanPoint[]>([]);
  const [deployConfirmOpen, setDeployConfirmOpen] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [deployedAt, setDeployedAt] = useState('');
  const deployTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const mobileBindingHref = '/life/projects/proj-lixs/install?step=mapping';
  const workspacePool = isPro ? [...getFrontendWorkspaces(), ...getProServiceWorkspaces()] : getFrontendWorkspaces();
  const regionLabel: Record<Workspace['region'], string> = { CN: '中国大陆', US: 'United States', EU: 'Europe' };
  const regionOptions = Array.from(new Set(workspacePool.map(workspace => workspace.region)));
  const [selectedRegion, setSelectedRegion] = useState<Workspace['region']>(regionOptions[0] ?? 'CN');
  const regionWorkspaces = workspacePool.filter(workspace => workspace.region === selectedRegion);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(regionWorkspaces[0]?.id ?? '');
  const selectedWorkspace = regionWorkspaces.find(workspace => workspace.id === selectedWorkspaceId) ?? regionWorkspaces[0] ?? workspacePool[0];
  const availableStudios = selectedWorkspace ? getStudiosForWorkspace(selectedWorkspace.id) : [];
  const [selectedStudioId, setSelectedStudioId] = useState(availableStudios[0]?.id ?? '');
  const selectedStudioMeta = availableStudios.find(studio => studio.id === selectedStudioId) ?? availableStudios[0];
  const selectedHealth = selectedStudioMeta ? HEALTH_META[selectedStudioMeta.health] : null;
  const selectedStudioName = selectedStudioMeta?.name ?? '当前 Studio';
  const rows = deploymentAuditRows(mappingPoints, MOCK_STUDIO_DEVICES);
  const hasPulled = mappingPoints.length > 0;
  const autoCount = mappingPoints.filter(point => point.confidence === 'high').length;
  const compatibleCount = mappingPoints.filter(point => point.confidence === 'medium').length;
  const manualCount = mappingPoints.filter(point => point.confidence === 'manual').length;
  const confirmedCount = mappingPoints.filter(point => point.status === 'confirmed').length;
  const readyToDeploy = allPointsConfirmed(mappingPoints);
  const totalDesignDevices = MOCK_PLAN_POINTS.length;
  const deploymentTimeLabel = deployedAt || '2026/06/15 15:42';

  const resetDeploymentTarget = () => {
    setStep('select');
    setMappingPoints([]);
    setDeployedAt('');
  };

  const changeRegion = (value: string) => {
    setSelectedRegion(value as Workspace['region']);
    resetDeploymentTarget();
  };

  const changeWorkspace = (value: string) => {
    setSelectedWorkspaceId(value);
    resetDeploymentTarget();
  };

  const changeStudio = (value: string) => {
    setSelectedStudioId(value);
    resetDeploymentTarget();
  };

  const currentDeploymentLogs: DeploymentLogItem[] = [
    {
      time: '15:36',
      title: '目标已选',
      detail: `${selectedWorkspace?.name ?? 'Space'} / ${selectedStudioName}`,
      tone: 'success',
    },
    {
      time: '15:38',
      title: '设备拉取',
      detail: hasPulled ? `${MOCK_STUDIO_DEVICES.length} 台设备` : '等待',
      tone: hasPulled ? 'success' : 'pending',
    },
    {
      time: '15:40',
      title: '匹配校验',
      detail: hasPulled ? `${autoCount} 自动 · ${compatibleCount} 兼容 · ${manualCount} 人工` : '等待',
      tone: step === 'select' ? 'pending' : readyToDeploy ? 'success' : 'info',
    },
    {
      time: deploymentTimeLabel.slice(-5),
      title: '方案下发',
      detail: step === 'done' ? '完成' : readyToDeploy ? '待确认' : '等待',
      tone: step === 'done' ? 'success' : readyToDeploy ? 'info' : 'pending',
    },
  ];

  useEffect(() => () => {
    if (deployTimerRef.current) window.clearTimeout(deployTimerRef.current);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    if (!regionOptions.includes(selectedRegion) && regionOptions[0]) setSelectedRegion(regionOptions[0]);
  }, [isPro, selectedRegion, regionOptions]);

  useEffect(() => {
    if (!selectedWorkspace || !regionWorkspaces.some(workspace => workspace.id === selectedWorkspaceId)) {
      setSelectedWorkspaceId(regionWorkspaces[0]?.id ?? '');
    }
  }, [selectedRegion, selectedWorkspaceId, regionWorkspaces, selectedWorkspace]);

  useEffect(() => {
    if (!availableStudios.some(studio => studio.id === selectedStudioId)) {
      setSelectedStudioId(availableStudios[0]?.id ?? '');
    }
  }, [selectedWorkspaceId, selectedStudioId, availableStudios]);

  const runAction = () => {
    if (deploying) return;
    if (step === 'select') {
      setMappingPoints(autoMatch(MOCK_PLAN_POINTS, MOCK_STUDIO_DEVICES));
      setStep('mapping');
      return;
    }
    if (step === 'mapping') {
      setMappingPoints(prev => prev.map(point => point.matchedDid ? { ...point, status: 'confirmed' as const } : point));
      setStep('verify');
      return;
    }
    if (step === 'verify') {
      if (!readyToDeploy) return;
      setDeployConfirmOpen(true);
      return;
    }
    setStep('select');
    setMappingPoints([]);
  };

  const handleConfirmDeploy = () => {
    if (!readyToDeploy || deploying) return;
    setDeploying(true);
    deployTimerRef.current = window.setTimeout(() => {
      setDeploying(false);
      setDeployConfirmOpen(false);
      setStep('done');
      setToastVisible(true);
      setDeployedAt(new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }));
      toastTimerRef.current = window.setTimeout(() => setToastVisible(false), 2600);
    }, 1250);
  };

  const action = step === 'select'
    ? { label: '拉取 Studio 设备', icon: Wifi, disabled: false }
    : step === 'mapping'
      ? { label: '同步现场绑定', icon: Smartphone, disabled: false }
      : step === 'verify'
        ? { label: 'Deploy Solution', icon: UploadCloud, disabled: !readyToDeploy || deploying }
        : { label: '重新检查', icon: RotateCcw, disabled: false };
  const HeaderIcon = action.icon;

  const deploymentSteps = [
    { label: '选择 Studio', detail: selectedStudioName, done: true },
    { label: '拉取设备', detail: hasPulled ? `${MOCK_STUDIO_DEVICES.length} 台` : '等待', done: hasPulled },
    { label: '匹配校验', detail: hasPulled ? `${autoCount}/${totalDesignDevices} 自动` : '等待', done: step === 'verify' || step === 'done' },
    { label: '下发 Studio', detail: step === 'done' ? '完成' : '等待', done: step === 'done' },
  ];

  if (step === 'done') {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#f4f6fa] p-3 text-slate-900">
        {toastVisible ? <DeploymentSucceededToast /> : null}
        <SolutionDeploymentDetail
          project={project}
          workspace={selectedWorkspace}
          studio={selectedStudioMeta}
          studioHealth={selectedHealth}
          deployedAt={deployedAt}
          rows={rows}
          logs={currentDeploymentLogs}
          confirmedCount={confirmedCount}
          totalDesignDevices={totalDesignDevices}
          floorPlanPreviewUrl={floorPlanPreviewUrl}
          onUpdate={() => setStep('verify')}
          onDeployAnotherStudio={() => {
            setStep('select');
            setMappingPoints([]);
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#eef4fb] p-4">
      {toastVisible ? <DeploymentSucceededToast /> : null}
      <section className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-300/50">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Radio size={15} className="text-blue-600" />
              <h1 className="text-lg font-semibold text-slate-950">方案部署</h1>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{project.title}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-[11px] font-semibold text-slate-400">
              <span>点位 {totalDesignDevices}</span>
              <span>Studio {hasPulled ? MOCK_STUDIO_DEVICES.length : selectedStudioMeta?.online ?? 0}</span>
              <span>已确认 {confirmedCount}</span>
            </div>
          </div>
          <button
            onClick={runAction}
            disabled={action.disabled}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition',
              action.disabled
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
            )}
          >
            {deploying ? <Loader2 size={15} className="animate-spin" /> : <HeaderIcon size={15} />}
            {deploying ? 'Deploying...' : action.label}
          </button>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)_360px]">
          <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">部署目标</div>
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">{isPro ? 'Pro 可选客户 Space' : '个人 Space'}</span>
            </div>
            <div className="space-y-3">
              <DeploySelect label="地区" value={selectedRegion} onChange={changeRegion} options={regionOptions.map(region => ({ value: region, label: `${regionLabel[region]} · ${region}` }))} />
              <DeploySelect
                label="空间"
                value={selectedWorkspace?.id ?? ''}
                onChange={changeWorkspace}
                options={regionWorkspaces.map(workspace => ({
                  value: workspace.id,
                  label: `${workspace.emoji} ${workspace.name}`,
                  meta: `${workspace.flag} · ${workspace.currentRole} · ${workspace.studioIds.length} Studio`,
                }))}
              />
              <DeploySelect
                label="Studio"
                value={selectedStudioMeta?.id ?? ''}
                onChange={changeStudio}
                options={availableStudios.map(studio => ({
                  value: studio.id,
                  label: studio.name,
                  meta: `${studio.online}/${studio.devices} 在线 · ${studio.spaceName}`,
                }))}
              />
            </div>

            {selectedStudioMeta ? (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-950">{selectedStudioMeta.name}</div>
                    <div className="mt-1 truncate text-[11px] text-slate-500">{selectedWorkspace?.emoji} {selectedWorkspace?.name} / {selectedStudioMeta.spaceName}</div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold" style={{ color: selectedHealth?.color }}>
                    {selectedHealth?.label ?? '未知'}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <PropertyTile label="设备" value={`${selectedStudioMeta.devices}`} />
                  <PropertyTile label="在线" value={`${selectedStudioMeta.online}`} />
                  <PropertyTile label="IP" value={selectedStudioMeta.ipLocal} />
                </div>
              </div>
            ) : null}

            <Link
              href={mobileBindingHref}
              className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-3 text-xs font-semibold text-slate-900 transition hover:border-blue-200 hover:shadow-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Smartphone size={14} className="shrink-0 text-blue-600" />
                <span className="truncate">移动端绑定</span>
              </span>
              <span className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] text-white">打开</span>
            </Link>

            <div className="mt-4 space-y-2">
              {deploymentSteps.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs">
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-lg', item.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400')}>
                    {item.done ? <CheckCircle2 size={12} /> : <span className="text-[10px] font-semibold">{index + 1}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-800">{item.label}</span>
                    <span className="block truncate text-[10px] text-slate-400">{item.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </aside>

          <main className="min-h-0 overflow-hidden p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">虚实绑定</div>
              </div>
              <div className="flex gap-1.5 text-[10px] font-semibold">
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">{autoCount} 自动</span>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">{compatibleCount} 兼容</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">{manualCount} 人工</span>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="grid grid-cols-[minmax(0,1.05fr)_104px_minmax(0,1fr)_minmax(0,0.85fr)] border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <span>方案设备</span>
                <span>状态</span>
                <span>Studio 设备</span>
                <span>依据</span>
              </div>
              <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
                {!hasPulled ? (
                  <div className="flex h-72 flex-col items-center justify-center text-center">
                    <Wifi size={24} className="text-slate-300" />
                    <div className="mt-3 text-sm font-semibold text-slate-800">等待拉取设备</div>
                  </div>
                ) : rows.map(row => (
                  <div key={row.point.pointCode} className="grid grid-cols-[minmax(0,1.05fr)_104px_minmax(0,1fr)_minmax(0,0.85fr)] items-center border-b border-slate-100 px-3 py-2 text-xs last:border-b-0">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{row.title}</div>
                      <div className="mt-0.5 truncate text-[11px] text-slate-400">{row.point.pointCode} · {row.point.modelLabel}</div>
                    </div>
                    <span className={cn(
                      'w-fit rounded-full px-2 py-1 text-[10px] font-semibold',
                      row.point.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                      row.point.confidence === 'high' ? 'bg-blue-50 text-blue-700' :
                      row.point.confidence === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    )}>
                      {row.status}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-700">{row.target}</div>
                      <div className="mt-0.5 truncate text-[11px] text-slate-400">{row.device ? `${row.device.modelLabel} · ${row.device.did.slice(-8)}` : '等待人工绑定'}</div>
                    </div>
                    <div className="min-w-0 text-[11px] text-slate-500">
                      <div className="truncate font-medium">{row.reasons[0]}</div>
                      <div className="mt-0.5 truncate text-slate-400">{row.reasons[1] ?? mappingIssueText(row.point)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <DeployAgentPanel
            step={step}
            logs={currentDeploymentLogs}
            studioName={selectedStudioName}
            hasPulled={hasPulled}
            readyToDeploy={readyToDeploy}
            confirmedCount={confirmedCount}
            totalDesignDevices={totalDesignDevices}
            autoCount={autoCount}
            compatibleCount={compatibleCount}
            manualCount={manualCount}
          />
        </div>
      </section>
      {deployConfirmOpen ? (
        <DeployConfirmDialog
          deploying={deploying}
          targetName={selectedStudioName}
          onCancel={() => {
            if (!deploying) setDeployConfirmOpen(false);
          }}
          onConfirm={handleConfirmDeploy}
        />
      ) : null}
    </div>
  );
}

function DeployAgentPanel({
  step,
  logs,
  studioName,
  hasPulled,
  readyToDeploy,
  confirmedCount,
  totalDesignDevices,
  autoCount,
  compatibleCount,
  manualCount,
}: {
  step: DeploymentWorkflowStep;
  logs: DeploymentLogItem[];
  studioName: string;
  hasPulled: boolean;
  readyToDeploy: boolean;
  confirmedCount: number;
  totalDesignDevices: number;
  autoCount: number;
  compatibleCount: number;
  manualCount: number;
}) {
  const agentCopy: Record<DeploymentWorkflowStep, { title: string; meta: string }> = {
    select: {
      title: '等待拉取',
      meta: studioName,
    },
    mapping: {
      title: '匹配完成',
      meta: `${autoCount} 自动 · ${compatibleCount} 兼容 · ${manualCount} 人工`,
    },
    verify: {
      title: readyToDeploy ? 'Ready' : '待确认',
      meta: `${confirmedCount}/${totalDesignDevices}`,
    },
    done: {
      title: '已部署',
      meta: 'Record saved',
    },
  };
  const copy = agentCopy[step];
  const conversation: Array<{ role: 'user' | 'assistant'; body: string; meta?: string }> = [
    {
      role: 'assistant',
      body: `已选择 ${studioName} 作为部署目标。`,
      meta: logs[0]?.time,
    },
    {
      role: 'user',
      body: '检查当前方案能不能部署。',
      meta: 'Current Chat',
    },
    {
      role: 'assistant',
      body: hasPulled
        ? `已拉取 Studio 设备，当前有 ${autoCount} 个点位可自动匹配，${compatibleCount} 个需要兼容校验，${manualCount} 个建议人工确认。`
        : '等待拉取 Studio 设备。拉取后我会按房间、设备类型和绑定状态做匹配校验。',
      meta: logs[1]?.time,
    },
    {
      role: 'assistant',
      body: readyToDeploy
        ? `已确认 ${confirmedCount}/${totalDesignDevices} 个点位，可以下发方案。`
        : `当前确认 ${confirmedCount}/${totalDesignDevices} 个点位，完成匹配校验后再下发。`,
      meta: logs[2]?.time,
    },
  ];

  return (
    <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-slate-50/70">
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white">
            <Bot size={15} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-950">Deploy Agent</div>
            <div className="truncate text-[11px] font-medium text-slate-400">{studioName}</div>
          </div>
          <span className={cn(
            'ml-auto rounded-full px-2 py-1 text-[10px] font-semibold',
            readyToDeploy ? 'bg-emerald-50 text-emerald-600' : hasPulled ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
          )}>
            {readyToDeploy ? 'Ready' : hasPulled ? 'Checking' : 'Waiting'}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex justify-center">
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-400 shadow-sm">
            Deployment Chat
          </span>
        </div>
        <div className="space-y-4">
          {conversation.map((message, index) => (
            <div key={`${message.role}-${index}`} className={cn('flex gap-3', message.role === 'user' && 'justify-end')}>
              {message.role === 'assistant' ? (
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Bot size={14} />
                </span>
              ) : null}
              <div className={cn('max-w-[82%]', message.role === 'user' && 'order-first')}>
                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
                  message.role === 'user'
                    ? 'rounded-tr-md bg-blue-600 text-white shadow-blue-100'
                    : 'rounded-tl-md border border-slate-200 bg-white text-slate-700'
                )}>
                  {message.body}
                </div>
                {message.meta ? (
                  <div className={cn('mt-1 text-[10px] font-semibold text-slate-400', message.role === 'user' ? 'text-right' : 'text-left')}>
                    {message.meta}
                  </div>
                ) : null}
              </div>
              {message.role === 'user' ? (
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <User size={14} />
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-900">{copy.title}</span>
            <span className="text-slate-400">{copy.meta}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-3">
        <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400">
          <span className="min-w-0 flex-1 truncate">Ask Deploy Agent...</span>
          <SendHorizontal size={14} className="text-blue-600" />
        </div>
      </div>
    </aside>
  );
}

function DeploymentLogTimeline({ logs, compact = false }: { logs: DeploymentLogItem[]; compact?: boolean }) {
  const toneClass: Record<DeploymentLogTone, string> = {
    success: 'bg-emerald-100 text-emerald-600',
    info: 'bg-blue-100 text-blue-700',
    warn: 'bg-amber-100 text-amber-700',
    pending: 'bg-slate-100 text-slate-400',
  };

  return (
    <div className={cn('space-y-3', compact ? 'mt-3' : 'mt-5')}>
      {logs.map(item => (
        <div key={`${item.time}-${item.title}`} className={cn('flex gap-3', compact ? 'text-xs' : 'rounded-2xl border border-slate-100 bg-slate-50/70 p-4')}>
          <span className={cn('mt-0.5 flex shrink-0 items-center justify-center rounded-full', compact ? 'h-6 w-6' : 'h-7 w-7', toneClass[item.tone])}>
            {item.tone === 'success' ? <Check size={compact ? 12 : 14} /> : item.tone === 'pending' ? <CircleDashed size={compact ? 12 : 14} /> : <Zap size={compact ? 12 : 14} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className={cn('truncate font-semibold text-slate-900', compact ? 'text-xs' : 'text-sm')}>{item.title}</h3>
              <span className="shrink-0 text-[11px] font-medium text-slate-400">{item.time}</span>
            </div>
            <p className={cn('mt-1 leading-5 text-slate-500', compact ? 'text-[11px]' : 'text-xs')}>{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeploymentSucceededToast() {
  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-[140] -translate-x-1/2">
      <div className="flex min-w-[300px] items-center gap-3 rounded-xl border border-emerald-100 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-xl shadow-slate-300/60">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check size={15} />
        </span>
        Deployment succeeded
      </div>
    </div>
  );
}

function DeployConfirmDialog({
  deploying,
  targetName,
  onCancel,
  onConfirm,
}: {
  deploying: boolean;
  targetName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/35 p-5 backdrop-blur-[1px]">
      <section className="w-full max-w-[392px] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/25">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold">Warning</h2>
        </div>
        <div className="px-9 py-7 text-center">
          <p className="text-sm text-slate-700">Are you sure you want to deploy the solution?</p>
          <p className="mt-2 text-xs text-slate-400">Target Studio: {targetName}</p>
          <div className="mt-7 flex justify-center gap-3">
            <button
              onClick={onCancel}
              disabled={deploying}
              className="h-9 min-w-[88px] rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deploying}
              className="inline-flex h-9 min-w-[88px] items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-700"
            >
              {deploying ? <Loader2 size={14} className="animate-spin" /> : null}
              {deploying ? 'Deploying' : 'Yes'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SolutionDeploymentDetail({
  project,
  workspace,
  studio,
  deployedAt,
  rows,
  logs,
  confirmedCount,
  totalDesignDevices,
  floorPlanPreviewUrl,
  onUpdate,
  onDeployAnotherStudio,
}: {
  project: ProjectModel;
  workspace?: Workspace;
  studio?: Studio;
  studioHealth: { label: string; color: string } | null;
  deployedAt: string;
  rows: ReturnType<typeof deploymentAuditRows>;
  logs: DeploymentLogItem[];
  confirmedCount: number;
  totalDesignDevices: number;
  floorPlanPreviewUrl: string;
  onUpdate: () => void;
  onDeployAnotherStudio: () => void;
}) {
  const deployedTime = deployedAt || '2026/06/15 03:53';
  const targetName = studio?.name ?? 'Selected Studio';
  const workspaceName = workspace?.name ?? 'My Space';
  const readyRules = 6;
  const detailRows = rows.length ? rows : deploymentAuditRows(autoMatch(MOCK_PLAN_POINTS, MOCK_STUDIO_DEVICES), MOCK_STUDIO_DEVICES);
  const logItems = logs.length ? logs : [
    { time: deployedTime, title: 'Deployment record created', detail: `Solution deployed to ${targetName} for this run.`, tone: 'success' as DeploymentLogTone },
    { time: deployedTime, title: 'Space structure snapshot saved', detail: `${project.rooms} rooms and floor-plan metadata were attached to this record.`, tone: 'success' as DeploymentLogTone },
    { time: deployedTime, title: 'Device mapping snapshot saved', detail: `${confirmedCount}/${totalDesignDevices} plan points were recorded with Studio device references.`, tone: 'success' as DeploymentLogTone },
    { time: deployedTime, title: 'Automation package logged', detail: `${readyRules} automation scenes were included in this deployment record.`, tone: 'success' as DeploymentLogTone },
  ];

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-xl shadow-slate-300/50">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-blue-700">
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
              Deployment Record
            </div>
            <h1 className="mt-2 truncate text-xl font-semibold tracking-tight text-slate-950">{project.title}</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={onUpdate} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
            <UploadCloud size={12} />
            Update Record
          </button>
          <button onClick={onDeployAnotherStudio} className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
            <Plus size={12} />
            Deploy to Another Studio
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-5">
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Record Summary</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="h-44">
                <MiniFloorPlanPreview previewUrl={floorPlanPreviewUrl} label={`${project.title} deployed snapshot`} />
              </div>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <DeploymentInfoRow label="Created At" value={deployedTime} />
              <DeploymentInfoRow label="Solution" value={project.title} />
              <DeploymentInfoRow label="Studio" value={targetName} />
              <DeploymentInfoRow label="Workspace" value={workspaceName} />
              <DeploymentInfoRow label="Result" value="Succeeded" valueStyle={{ color: '#16a34a' }} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <PropertyTile label="Rooms" value={`${project.rooms}`} />
              <PropertyTile label="Devices" value={`${Math.max(project.devices, totalDesignDevices)}`} />
              <PropertyTile label="Automations" value={`${readyRules}`} />
              <PropertyTile label="Mappings" value={`${confirmedCount}/${totalDesignDevices}`} />
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Deployment Logs</h2>
              </div>
              <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700">
                <BookOpen size={13} />
                Export Log
              </button>
            </div>
            <DeploymentLogTimeline logs={logItems} />
          </section>
        </div>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recorded Mapping Snapshot</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{detailRows.length} records</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_120px_minmax(0,0.85fr)] bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <span>Plan Point</span>
              <span>Studio Device This Run</span>
              <span>Result</span>
              <span>Room</span>
            </div>
            {detailRows.map(row => (
              <div key={row.point.pointCode} className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_120px_minmax(0,0.85fr)] items-center border-t border-slate-100 px-4 py-4 text-xs">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-800">{row.point.pointCode}</div>
                  <div className="mt-1 truncate text-slate-400">{row.title}</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-700">{row.target}</div>
                  <div className="mt-1 truncate text-slate-400">{row.device?.did ?? 'manual binding required'}</div>
                </div>
                <span className="w-fit rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">Logged</span>
                <span className="truncate text-slate-500">{row.point.room}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </section>
  );
}

function DeploymentInfoRow({ label, value, valueStyle }: { label: string; value: string; valueStyle?: CSSProperties }) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className="truncate font-semibold text-slate-600" style={valueStyle}>{value}</span>
    </div>
  );
}

function MetricLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <div className="mb-8 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-0.5 rounded-full bg-slate-200">
        <div className={cn('h-0.5 rounded-full', color)} style={{ width: value.includes('99') ? '99%' : value }} />
      </div>
    </div>
  );
}

function DeploymentStat({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'emerald' | 'violet' }) {
  const toneClass = tone === 'emerald' ? 'text-emerald-600 bg-emerald-50' : tone === 'violet' ? 'text-violet-600 bg-violet-50' : 'text-blue-600 bg-blue-50';
  return (
    <div className="rounded-md border border-slate-100 bg-white p-4">
      <div className="text-[11px] font-semibold text-slate-400">{label}</div>
      <div className={cn('mt-2 inline-flex rounded-full px-2.5 py-1 text-sm font-semibold', toneClass)}>{value}</div>
    </div>
  );
}

function PropertyPanel({
  selectedDevice,
  selectedFurniture,
  activeTool,
  editMode,
  activeFloor,
  onClose,
  onNudge,
}: {
  selectedDevice: DevicePoint | null;
  selectedFurniture: FurnitureProduct | null;
  activeTool: ToolId;
  editMode: boolean;
  activeFloor: string;
  onClose: () => void;
  onNudge: (dx: number, dy: number) => void;
}) {
  if (!selectedDevice && !selectedFurniture) return null;
  const isDevice = Boolean(selectedDevice);
  const title = selectedDevice?.name ?? selectedFurniture?.name ?? '';
  const subtitle = selectedDevice ? roomLabelFor(selectedDevice.room) : selectedFurniture?.brand ?? '';
  const roomLabel = selectedDevice ? roomLabelFor(selectedDevice.room) : selectedFurniture?.room ?? '';
  const relationRows = [
    ['belongsTo', roomLabel],
    ['isInstalledIn', roomLabel],
    [isDevice ? 'serves' : 'placedIn', roomLabel],
    [isDevice ? 'covers' : 'blocks', selectedDevice?.coverage ?? selectedFurniture?.category ?? roomLabel],
  ];

  return (
    <aside className="min-w-0 overflow-y-auto border-l border-slate-200 bg-white px-4 py-4 text-slate-900">
      <div className="mb-5 flex items-center gap-2">
        <div className="text-sm font-semibold">属性</div>
        <div className="ml-auto text-[11px] font-medium text-slate-400">1F</div>
        <button onClick={onClose} className="flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 px-2 text-xs font-semibold text-slate-500">
          <X size={13} />
          取消
        </button>
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex h-44 items-center justify-center bg-white">
          <ProductPreview kind={isDevice ? 'device' : 'furniture'} type={selectedDevice?.type ?? selectedFurniture?.type ?? 'seat'} />
        </div>
        <div className="border-t border-slate-200 px-3 py-2 text-center">
          <div className="truncate text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-0.5 truncate text-xs text-slate-400">{selectedDevice?.model ?? selectedFurniture?.brand}</div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">{title} {subtitle && isDevice ? subtitle : ''}</h2>
        <div className="mt-2 text-xs text-slate-400">{selectedDevice ? (selectedDevice.online === false ? '待绑定' : '存在') : `${activeFloor} · ${roomLabel}`}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PropertyTile label="类型" value={selectedDevice ? (selectedDevice.online === false ? '待绑定' : '设备') : selectedFurniture?.category ?? '产品'} valueClassName={selectedDevice?.online === false ? 'text-amber-600' : 'text-slate-900'} />
        <PropertyTile label={selectedDevice ? '覆盖' : '价格'} value={selectedDevice ? (selectedDevice.status === 'pending' ? '0' : '1') : selectedFurniture?.price ?? '-'} />
        <PropertyTile label="坐标" value={`${((selectedDevice?.x ?? selectedFurniture?.x ?? 0) / 9).toFixed(2)}, ${((selectedDevice?.y ?? selectedFurniture?.y ?? 0) / 8).toFixed(2)}, 0`} />
        <PropertyTile label="角度" value={activeTool === 'coverage' ? '30°' : '0°'} />
      </div>

      <div className="mt-4 space-y-2 border-b border-slate-200 pb-5">
        <PropertyRow label="名称" value={title} />
        <PropertyRow label={selectedDevice ? '模型' : '品牌'} value={selectedDevice?.model ?? selectedFurniture?.brand ?? '-'} />
        <PropertyRow label={selectedDevice ? '安装' : '类型'} value={selectedDevice ? (selectedDevice.power === 'AC' ? '顶装 2.8m' : selectedDevice.power ?? '顶装 2.8m') : selectedFurniture?.category ?? '-'} />
        <PropertyRow label="空间" value={roomLabel} />
        <PropertyRow label="坐标" value={`${((selectedDevice?.x ?? selectedFurniture?.x ?? 0) / 9).toFixed(2)}, ${((selectedDevice?.y ?? selectedFurniture?.y ?? 0) / 8).toFixed(2)}, 0`} />
        <PropertyRow label="安装角度" value={activeTool === 'coverage' ? '30°' : '0°'} />
        <PropertyRow label={selectedDevice ? '联动' : '占位'} value={selectedDevice ? `${selectedDevice.automations ?? 0}` : `${selectedFurniture?.w ?? 0} x ${selectedFurniture?.h ?? 0}`} />
      </div>

      {editMode && selectedDevice ? (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
          <div className="mb-3 text-xs font-semibold text-blue-700">点位微调</div>
          <div className="grid grid-cols-3 gap-2">
            <span />
            <button onClick={() => onNudge(0, -1)} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">↑</button>
            <span />
            <button onClick={() => onNudge(-1, 0)} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">←</button>
            <button onClick={() => onNudge(0, 1)} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">↓</button>
            <button onClick={() => onNudge(1, 0)} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">→</button>
          </div>
        </div>
      ) : null}

      {!editMode ? (
      <div className="mt-5">
        <div className="mb-3 text-xs font-medium text-slate-400">图谱关系</div>
        <div className="space-y-2">
          {relationRows.map(([relation, value]) => (
            <div key={relation} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="text-sm font-semibold text-slate-800">{title} {roomLabel}</div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-blue-600">{relation}</code>
                <span className="text-slate-500">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      ) : null}
    </aside>
  );
}

function PropertyTile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-[11px] font-medium text-slate-400">{label}</div>
      <div className={cn('mt-2 text-sm font-semibold text-slate-900', valueClassName)}>{value}</div>
    </div>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="ml-auto font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function ProductPreview({
  kind,
  type,
  compact = false,
}: {
  kind: 'device' | 'furniture';
  type: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600">
        {kind === 'device' ? <DeviceIcon type={type as DevicePoint['type']} /> : <Layers3 size={16} />}
      </span>
    );
  }

  if (kind === 'device') {
    return (
      <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-blue-100 bg-blue-50 text-blue-600 shadow-inner">
        <div className="absolute inset-4 rounded-[1.5rem] border border-blue-200 bg-white/70" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <DeviceIcon type={type as DevicePoint['type']} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-32 w-44">
      <div className="absolute left-10 top-10 h-16 w-24 rounded-2xl border border-stone-300 bg-stone-100 shadow-sm" />
      <div className="absolute left-7 top-6 h-14 w-28 rounded-t-2xl border border-stone-300 bg-stone-200" />
      <div className="absolute left-7 top-24 h-8 w-2 origin-top rotate-[16deg] rounded-full bg-amber-800/70" />
      <div className="absolute right-8 top-24 h-8 w-2 origin-top -rotate-[16deg] rounded-full bg-amber-800/70" />
      <div className="absolute left-4 top-12 h-12 w-4 rounded-full border border-amber-900/30 bg-amber-800/60" />
      <div className="absolute right-3 top-12 h-12 w-4 rounded-full border border-amber-900/30 bg-amber-800/60" />
    </div>
  );
}

function AgentThread({
  isPro,
  selectedDevice,
  project,
  activeTool,
  workflow,
  stage,
  renderJob,
  onClearSelection,
  onRecommendDevices,
  onOpenDeviceLibrary,
  onToolChange,
  onCompleteStage,
  onConfirmSolution,
  onRunRender,
  onGenerateAutomation,
}: {
  isPro: boolean;
  selectedDevice: DevicePoint | null;
  project: ProjectModel;
  activeTool: ToolId;
  workflow: WorkflowId;
  stage: StageId;
  renderJob: RenderJobState;
  onClearSelection: () => void;
  onRecommendDevices?: (prompt?: string) => void;
  onOpenDeviceLibrary: () => void;
  onToolChange: (tool: ToolId) => void;
  onCompleteStage: (stage: StageId, nextStage?: StageId) => void;
  onConfirmSolution: () => void;
  onRunRender: () => void;
  onGenerateAutomation?: () => void;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [contextEnabled, setContextEnabled] = useState(true);
  const isVisualization = workflow === 'visualization';
  const isPersona = workflow === 'persona' || workflow === 'life';
  const roomLabel = selectedDevice ? roomLabelFor(selectedDevice.room) : '';
  const contextLabel = isVisualization ? `${project.title} · Preview` : selectedDevice ? `${selectedDevice.name} · ${roomLabel}` : project.title;
  const hasPinnedContext = !isPersona && contextEnabled;
  const activeContextLabel = hasPinnedContext ? contextLabel : '';
  const initialThread: AgentMessage[] = [
    {
      role: 'agent',
      title: 'Aqara Agent',
      text: isPersona
        ? '选择成员后生成看板。'
        : isPro
        ? '选择点位，或直接描述要调整的结果。'
        : '描述目标，我会把调整落到方案里。',
    },
  ];
  const [messages, setMessages] = useState<AgentMessage[]>([
    ...initialThread,
  ]);
  const toolCopy = TOOL_COPY[activeTool];
  const quickPrompts = isPersona
    ? ['生成成员看板', '生成二维码', '推送给成员']
    : isVisualization
    ? ['预览说明', '估算 Credits', '检查输出包']
    : isPro
    ? ['检查遗漏', '生成联动草稿', '整理客户说明']
    : activeTool === 'devices'
    ? ['基于预算推荐设备', 'AI 自动布点', '打开设备库']
    : ['解释方案', '简化点位', '请求专业支持'];
  const contextActions: Array<{ label: string; icon: LucideIcon; action: () => void; disabled?: boolean }> = isPersona || isVisualization
    ? []
    : stage === 'floor' || stage === 'points'
      ? [
          { label: 'Agent 推荐', icon: Wand2, action: () => onRecommendDevices?.('根据当前户型、Selected Devices 和生活场景推荐设备') },
          { label: 'Source', icon: Cpu, action: onOpenDeviceLibrary },
          { label: '覆盖校验', icon: Radar, action: () => onToolChange('coverage') },
        ]
      : stage === 'logic'
          ? [
              { label: '生成场景', icon: Sparkles, action: () => sendMessage('生成场景方案') },
              { label: '查看空间图谱', icon: ListTree, action: () => onToolChange('logic') },
            ]
          : stage === 'visualize'
            ? [
                { label: renderJob === 'ready' ? '重新生成' : '生成预览', icon: Wand2, action: onRunRender },
              ]
            : stage === 'review'
              ? []
              : [];
  const visibleMessages = messages.slice(-6);

  useEffect(() => {
    if (!expanded) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [expanded]);

  useEffect(() => {
    if (selectedDevice) setContextEnabled(true);
  }, [selectedDevice?.name, selectedDevice]);

  useEffect(() => {
    setContextEnabled(workflow !== 'persona');
  }, [project.title, workflow]);

  const clearContext = (event?: MouseEvent) => {
    event?.stopPropagation();
    setContextEnabled(false);
    if (selectedDevice) onClearSelection();
  };

  const buildReply = (text: string) => {
    const normalized = text.toLowerCase();
    const shouldRecommendDevices = text.includes('布点')
      || text.includes('推荐设备')
      || text.includes('预算')
      || text.includes('场景意图')
      || text.includes('起夜')
      || text.includes('安防')
      || text.includes('观影')
      || text.includes('老人')
      || normalized.includes('device')
      || normalized.includes('security');
    if (shouldRecommendDevices) {
      return '已根据户型、Selected Devices 和场景意图更新设备清单，并把推荐项作为未安装的虚拟设备节点写回户型图。你可以继续说“更低预算”或“增加安防覆盖”，我会重新调整。';
    }
    if (normalized.includes('ask pro')) {
      return '已整理 Pro Review：当前点位、可选设备和待确认问题都会带上。';
    }
    if (isPersona) {
      return '已准备生成看板。确认选择后点击生成。';
    }
    if (!hasPinnedContext) {
      return '已取消上下文。我会先按开放问题处理，必要时再让你选择家庭或设备。';
    }
    if (stage === 'logic' && (text.includes('生成') || text.includes('自动化') || text.includes('场景'))) {
      return '已生成自动化列表。点击任意自动化，可以进入独立自动化编辑器继续调整触发、条件和动作。';
    }
    if (!selectedDevice) {
      return activeTool === 'devices'
        ? '请描述预算、使用人群和重点场景，我会把推荐设备直接布到户型图上。'
        : '我会基于当前家庭方案生成调整建议。点击具体设备后，可以直接改点位和覆盖。';
    }
    if (activeTool === 'coverage') {
      return `${selectedDevice.pointCode} 覆盖可用，建议保留在${roomLabel}，再复核门口盲区。`;
    }
    if (activeTool === 'logic') {
      return `已围绕 ${selectedDevice.name} 更新图谱关系。场景方案会单独沉淀为自动化触发、条件和动作。`;
    }
    if (activeTool === 'agent' && stage === 'logic') {
      return '已生成场景方案：起夜路径、离家安防和观影模式会进入确认清单。';
    }
    if (activeTool === 'walls') {
      return '户型边界已作为主数据源，点位会随平面调整保持锚定。';
    }
    return `已选中 ${selectedDevice.pointCode}。可以解释点位、简化方案，或转成 Pro Review。`;
  };

  const sendMessage = (text = chatInput) => {
    const next = text.trim();
    if (!next) return;
    setExpanded(true);
    const shouldRecommendDevices = next.includes('布点')
      || next.includes('推荐设备')
      || next.includes('预算')
      || next.includes('场景意图')
      || next.includes('起夜')
      || next.includes('安防')
      || next.includes('观影')
      || next.includes('老人')
      || next.toLowerCase().includes('device')
      || next.toLowerCase().includes('security');
    if (!isVisualization && !isPersona && shouldRecommendDevices) {
      onRecommendDevices?.(next);
    }
    if (!isVisualization && !isPersona && stage === 'logic' && (next.includes('生成') || next.includes('自动化') || next.includes('场景'))) {
      onGenerateAutomation?.();
    }
    setMessages(prev => {
      const contextualMessage: AgentMessage[] = hasPinnedContext
        ? [{ role: 'tool', title: toolCopy.title, text: selectedDevice ? `${selectedDevice.pointCode} · ${contextLabel}` : contextLabel }]
        : [];
      return [
        ...prev,
        { role: 'user', title: '你', text: next },
        ...contextualMessage,
        {
          role: 'agent',
          title: 'Agent',
          text: buildReply(next),
        },
      ];
    });
    setChatInput('');
  };

  const runAgent = () => {
    setExpanded(true);
    if (isVisualization) {
      onRunRender();
      setMessages(prev => [
        ...prev,
        { role: 'tool', title: 'Render', text: 'Creating client preview from current DesignPlan.' },
        { role: 'tool', title: '预览任务', text: '正在根据当前方案生成客户预览。' },
      ]);
      return;
    }
    if (!isPersona && activeTool === 'devices') {
      onRecommendDevices?.(toolCopy.title);
    }
    if (!isPersona && stage === 'logic') {
      onGenerateAutomation?.();
    }
    setRunning(true);
    setMessages(prev => [
      ...prev,
      { role: 'tool', title: '执行中', text: isPersona ? '成员看板 Agent 正在等待已选家庭与成员。' : hasPinnedContext ? (selectedDevice ? `${toolCopy.title} Agent 正在检查 ${selectedDevice.pointCode}。` : `${toolCopy.title} Agent 正在读取当前方案。`) : `${toolCopy.title} Agent 正在按全局上下文运行。` },
    ]);
    window.setTimeout(() => {
      setRunning(false);
      setMessages(prev => [
        ...prev,
        { role: 'agent', title: 'Agent', text: buildReply(toolCopy.title) },
      ]);
    }, 850);
  };

  return (
    <section ref={rootRef} className="absolute bottom-4 left-1/2 z-50 w-[min(720px,calc(100%-112px))] -translate-x-1/2">
      {expanded ? (
        <div className="mb-3 overflow-hidden rounded-[26px] border border-slate-200 bg-white/98 shadow-2xl shadow-slate-300/70 backdrop-blur-xl">
          <div className="flex h-12 items-center gap-3 border-b border-slate-200 px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Bot size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-950">Aqara Agent</div>
              {activeContextLabel ? (
                <button
                  onClick={clearContext}
                  className="mt-0.5 inline-flex max-w-[260px] items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  title="Remove context"
                >
                  <span className="truncate">{activeContextLabel}</span>
                  <X size={11} />
                </button>
              ) : (
                <div className="text-[11px] text-slate-400">No pinned context</div>
              )}
            </div>
            <button
              onClick={() => setMessages(initialThread)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Clear conversation"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Close conversation"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[320px] space-y-3 overflow-y-auto px-4 py-4">
            {isVisualization ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-slate-600">
                {SAMPLE_VISUALIZATION_BRIEF.rooms.join(' / ')} · {SAMPLE_VISUALIZATION_BRIEF.estimatedCredits} Credits
              </div>
            ) : null}
            {visibleMessages.map((message, index) => {
              const isUser = message.role === 'user';
              const isTool = message.role === 'tool';
              return (
                <div
                  key={`${message.role}-${index}-${message.text}`}
                  className={cn(
                    'flex',
                    isUser ? 'justify-end' : 'justify-start',
                    isTool && 'justify-center'
                  )}
                >
                  {isTool ? (
                    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                      <Wand2 size={11} />
                      <span className="truncate">{message.text}</span>
                    </div>
                  ) : (
                    <div className={cn(
                      'max-w-[78%] rounded-2xl border px-3 py-2 text-xs leading-5 shadow-sm',
                      isUser
                        ? 'border-slate-200 bg-slate-950 text-white'
                        : 'border-blue-100 bg-blue-50 text-slate-700'
                    )}>
                      {!isUser ? (
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-blue-600">
                          <Bot size={11} />
                          {message.title ?? 'Agent'}
                        </div>
                      ) : null}
                      {message.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-slate-200 px-4 py-2.5">
            {quickPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-[24px] border border-slate-200 bg-white/96 shadow-2xl shadow-slate-300/70 backdrop-blur-xl">
        {contextActions.length ? (
          <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 px-3 py-2">
          {contextActions.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              disabled={item.disabled}
              className={cn(
                'flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold transition',
                item.disabled
                  ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              )}
            >
              <item.icon size={13} />
              {item.label}
            </button>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={() => setExpanded(prev => !prev)}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition',
              expanded ? 'bg-blue-600 text-white' : 'bg-slate-950 text-white hover:bg-blue-600'
            )}
            title={expanded ? 'Hide conversation' : 'Open conversation'}
          >
            {expanded ? <ChevronUp size={16} /> : <Bot size={16} />}
          </button>
          {activeContextLabel ? (
            <div
              className="hidden h-9 max-w-[220px] shrink-0 items-center rounded-2xl bg-slate-50 pl-3 pr-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 md:flex"
              title={activeContextLabel}
            >
              {selectedDevice ? <MapPin size={12} /> : <Home size={12} />}
              <button onClick={() => setExpanded(true)} className="mx-1.5 min-w-0 truncate text-left">
                {activeContextLabel}
              </button>
              <button
                onClick={clearContext}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                title="Remove context"
              >
                <X size={12} />
              </button>
            </div>
          ) : null}
          <input
            value={chatInput}
            onFocus={() => setExpanded(true)}
            onClick={() => setExpanded(true)}
            onChange={event => setChatInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') sendMessage();
            }}
            placeholder={activeContextLabel ? `Ask Agent · ${activeContextLabel}` : 'Ask Agent...'}
            className="h-9 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            onClick={runAgent}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            title={isVisualization ? 'Render preview' : 'Run current context'}
          >
            {(running || (isVisualization && (renderJob === 'queued' || renderJob === 'rendering'))) ? (
              <Loader2 size={15} className="animate-spin text-blue-600" />
            ) : (
              <Wand2 size={15} />
            )}
          </button>
          <button
            onClick={() => sendMessage()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
            title="Send"
          >
            <SendHorizontal size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

function UploadFloorPlanDialog({
  name,
  fileName,
  onNameChange,
  onFileChange,
  onCancel,
  onConfirm,
}: {
  name: string;
  fileName: string;
  onNameChange: (name: string) => void;
  onFileChange: (file: File) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canConfirm = Boolean(name.trim() && fileName);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/28 backdrop-blur-[1px]">
      <section className="w-[400px] rounded-[6px] border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="min-w-0 flex-1 text-sm font-semibold">Upload Floor Plan</h2>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="Cancel">
            <X size={16} />
          </button>
        </div>
        <label className="mb-4 block">
          <span className="mb-2 block text-[11px] font-medium text-slate-500">Name</span>
          <input
            value={name}
            onChange={event => onNameChange(event.target.value)}
            className="h-10 w-full rounded-[4px] border border-transparent bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-200 focus:bg-white"
          />
        </label>
        <button
          onClick={() => fileInputRef.current?.click()}
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            if (file) onFileChange(file);
          }}
          className="flex h-[140px] w-full flex-col items-center justify-center rounded-[4px] border border-dashed border-blue-300 bg-white text-center transition hover:bg-blue-50/30"
        >
          <div className="text-sm text-slate-600">
            Drag & Drop Floor Plans or <span className="font-medium text-blue-600">Browse Files</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">PNG, JPEG or PDF file (Max 5MB)</div>
          {fileName ? (
            <div className="mt-3 max-w-[300px] truncate rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{fileName}</div>
          ) : null}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={event => {
            const file = event.target.files?.[0];
            if (file) onFileChange(file);
          }}
        />
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="h-9 rounded-[4px] px-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="h-9 rounded-[4px] bg-blue-500 px-5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:text-white/70"
          >
            Confirm
          </button>
        </div>
      </section>
    </div>
  );
}

function UnsavedEditDialog({
  onContinue,
  onExit,
}: {
  onContinue: () => void;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/35 p-6 backdrop-blur-sm">
      <section className="w-full max-w-[420px] rounded-[28px] border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/20">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <RotateCcw size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold">修改尚未保存，确定退出？</div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              退出后，本次编辑的点位调整不会保留。
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onContinue}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          >
            继续编辑
          </button>
          <button
            onClick={onExit}
            className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            退出
          </button>
        </div>
      </section>
    </div>
  );
}

function DeviceIcon({ type }: { type: DevicePoint['type'] }) {
  if (type === 'camera') return <Camera size={15} />;
  if (type === 'presence') return <Radar size={15} />;
  if (type === 'hub') return <Wifi size={15} />;
  if (type === 'lock') return <DoorOpen size={15} />;
  if (type === 'switch') return <Lightbulb size={15} />;
  return <Cpu size={15} />;
}

function Launcher() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6 text-text">
      <section className="w-full max-w-xl border border-border bg-bg-elevated p-6 shadow-sm">
        <AqaraLogo size={26} />
        <h1 className="mt-5 text-2xl font-semibold">Aqara Build</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/signin" className="rounded-lg border border-border p-4 hover:border-blue-200">
            <Home size={18} />
            <div className="mt-3 text-sm font-semibold">User Draft</div>
          </Link>
          <Link href="/onboarding" className="rounded-lg border border-blue-600 bg-blue-600 p-4 text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700">
            <ShieldCheck size={18} />
            <div className="mt-3 text-sm font-semibold">Builder Pro</div>
          </Link>
        </div>
      </section>
    </main>
  );
}

function BuildFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg text-text">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated px-4 py-3 shadow-sm">
        <Loader2 size={16} className="animate-spin text-blue-600" />
        <span className="text-sm font-semibold">Loading</span>
      </div>
    </div>
  );
}

export default function BuildPage() {
  return (
    <Suspense fallback={<BuildFallback />}>
      <BuildPageContent />
    </Suspense>
  );
}
