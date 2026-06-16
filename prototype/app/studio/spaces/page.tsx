'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Camera,
  Building2,
  ChevronDown,
  Copy,
  Cpu,
  DoorOpen,
  Eye,
  EyeOff,
  Hand,
  Home,
  Layers,
  Link2,
  LayoutGrid,
  Lightbulb,
  Map as MapIcon,
  Maximize2,
  Menu,
  MoreHorizontal,
  Minus,
  Move,
  MousePointer2,
  PanelRight,
  PencilLine,
  Plus,
  Radar,
  RefreshCw,
  Ruler,
  Save,
  Search,
  Settings2,
  Trash2,
  Upload,
  Wifi,
  Workflow,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FloorId = 'ground' | 'upper';
type ToolId = 'select' | 'pan' | 'room' | 'wall' | 'door' | 'window' | 'connection' | 'align' | 'scale' | 'measure';
type LayerId = 'plan' | 'devices' | 'coverage' | 'automation';
type SpaceViewMode = 'floorplan' | 'graph';
type FloorPlanOverlayMode = 'wifi' | 'cameras' | 'radar' | 'zigbee' | 'off';
type DeviceKind = 'hub' | 'fp400' | 'camera' | 'switch' | 'curtain' | 'light';
type LabelSide = 'top' | 'right' | 'bottom' | 'left';
type Tone = 'neutral' | 'warm' | 'cool';
type CoverageType = 'circle' | 'sector';
type Orientation = '东' | '南' | '西' | '北' | '东南' | '东北' | '西南' | '西北';
type EnclosureType = '封闭' | '半封闭' | '开放';
type RelationPredicate = 'belongsTo' | 'isInstalledIn' | 'isInstalledOn' | 'serves' | 'covers' | 'connects' | 'connectedTo';
type FurnitureKind = 'sofa' | 'coffee' | 'tableRect' | 'tableRound' | 'bed' | 'desk' | 'cabinet' | 'island' | 'lounge';
type DeviceTreeAction = 'locate' | 'edit' | 'unassign';
type FloorPlanOrigin = 'empty' | 'builder' | 'upload' | 'custom' | 'template';
type DeviceBindingStatus = 'bound' | 'unboundPoint';

interface Point {
  x: number;
  y: number;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface FurnitureItem {
  id: string;
  name?: string;
  kind: FurnitureKind;
  x: number;
  y: number;
  w: number;
  h: number;
  localPosition?: Vector3;
  localEulerAngles?: Vector3;
}

interface RoomModel {
  id: string;
  name: string;
  enable?: boolean;
  area: number;
  orientation?: Orientation;
  enclosureType?: EnclosureType;
  tone: Tone;
  x: number;
  y: number;
  w: number;
  h: number;
  localPosition?: Vector3;
  localEulerAngles?: Vector3;
  anchors: Point[];
  automations: string[];
  furniture: FurnitureItem[];
}

interface CoverageModel {
  id: string;
  type: CoverageType;
  radius: number;
  angle?: number;
  rotation?: number;
}

interface DeviceModel {
  id: string;
  name: string;
  kind: DeviceKind;
  roomId: string;
  x: number;
  y: number;
  localPosition?: Vector3;
  localEulerAngles?: Vector3;
  status: 'online' | 'attention';
  install: string;
  automations: string[];
  coverage?: CoverageModel[];
  labelSide: LabelSide;
  bindingStatus?: DeviceBindingStatus;
}

interface WindowModel {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface DoorModel {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  arc: string;
}

interface FloorModel {
  id: FloorId;
  name: string;
  enable?: boolean;
  label: string;
  area: number;
  seq?: number;
  localPosition?: Vector3;
  localEulerAngles?: Vector3;
  rooms: RoomModel[];
  windows: WindowModel[];
  doors: DoorModel[];
}

interface LibraryItem {
  id: string;
  name: string;
  kind: DeviceKind;
  install: string;
}

interface FurnitureLibraryItem {
  kind: FurnitureKind;
  name: string;
  w: number;
  h: number;
}

interface WorkspaceState {
  floors: FloorModel[];
  devices: Record<FloorId, DeviceModel[]>;
  connections: Record<FloorId, DeviceConnection[]>;
  unassignedDevices: DeviceModel[];
}

interface DeviceConnection {
  id: string;
  sourceId: string;
  targetId: string;
}

interface GraphRelation {
  id: string;
  sourceId: string;
  sourceName: string;
  predicate: RelationPredicate;
  targetId: string;
  targetName: string;
}

interface DragState {
  kind: 'room' | 'device' | 'furniture';
  id: string;
  roomId?: string;
  offsetX: number;
  offsetY: number;
}

interface PanDragState {
  clientX: number;
  clientY: number;
  startX: number;
  startY: number;
}

interface ConnectionDraft {
  sourceId: string;
  current: Point;
}

interface FloorPlanOverlay {
  id: FloorId;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AlignmentDragState {
  kind: 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
}

interface CoverageDragState {
  deviceId: string;
  coverageId: string;
  kind: 'rotation' | 'radius';
}

interface ScaleDraft {
  start: Point;
  end: Point;
  committed: boolean;
}

interface EditingSnapshot {
  workspace: WorkspaceState;
  hasFloorPlan: boolean;
  scaleSet: boolean;
  scaleLength: string;
  floorOverlay: FloorPlanOverlay;
}

const VIEWBOX_W = 1600;
const VIEWBOX_H = 920;
const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.35;

const ROOM_STYLE: Record<Tone, { fill: string; selected: string; accent: string }> = {
  neutral: { fill: '#f7fbff', selected: '#eef6ff', accent: '#385f91' },
  warm: { fill: '#fffaf0', selected: '#fff3df', accent: '#b67817' },
  cool: { fill: '#eff8ff', selected: '#e7f3ff', accent: '#1680a7' },
};

const DEVICE_META: Record<DeviceKind, { label: string; icon: LucideIcon; color: string }> = {
  hub: { label: '网关', icon: Cpu, color: '#364152' },
  fp400: { label: '存在', icon: Radar, color: '#1768ff' },
  camera: { label: '摄像头', icon: Camera, color: '#1d4ed8' },
  switch: { label: '开关', icon: Lightbulb, color: '#d97706' },
  curtain: { label: '窗帘', icon: DoorOpen, color: '#6d5dd3' },
  light: { label: '灯光', icon: Lightbulb, color: '#f97316' },
};

const TOOL_OPTIONS: Array<{ id: ToolId; label: string; description: string; icon: LucideIcon }> = [
  { id: 'select', label: '选择', description: '选择、拖动房间/设备/设施', icon: MousePointer2 },
  { id: 'pan', label: '手掌', description: '拖动画布，空格可临时启用', icon: Hand },
  { id: 'room', label: '房间', description: '新增一个可拖动房间', icon: Home },
  { id: 'wall', label: '墙体', description: '显示墙体编辑控制点', icon: PencilLine },
  { id: 'door', label: '门', description: '在当前空间添加门', icon: DoorOpen },
  { id: 'window', label: '窗', description: '在当前空间添加窗', icon: PanelRight },
  { id: 'connection', label: 'Connection', description: '拖拽或点击连接设备，Esc/右键取消', icon: Link2 },
  { id: 'align', label: 'Align', description: '对齐不同楼层户型图', icon: Move },
  { id: 'scale', label: 'Scale', description: '绘制比例尺并输入长度', icon: Ruler },
  { id: 'measure', label: '测量', description: '显示空间尺寸', icon: Ruler },
];

const FLOORPLAN_OVERLAY_OPTIONS: Array<{ id: FloorPlanOverlayMode; label: string; icon: LucideIcon; layer: LayerId }> = [
  { id: 'wifi', label: 'WiFi', icon: Wifi, layer: 'devices' },
  { id: 'cameras', label: 'Cameras', icon: Camera, layer: 'coverage' },
  { id: 'radar', label: '雷达', icon: Radar, layer: 'coverage' },
  { id: 'zigbee', label: 'Zigbee', icon: Link2, layer: 'devices' },
  { id: 'off', label: 'Off', icon: EyeOff, layer: 'plan' },
];

const ORIENTATION_OPTIONS: Orientation[] = ['东', '南', '西', '北', '东南', '东北', '西南', '西北'];
const ENCLOSURE_OPTIONS: EnclosureType[] = ['封闭', '半封闭', '开放'];

const DEVICE_LIBRARY: LibraryItem[] = [
  { id: 'hub-m3', name: 'Hub M3', kind: 'hub', install: '弱电柜' },
  { id: 'fp400', name: 'FP400', kind: 'fp400', install: '顶装 2.8m' },
  { id: 'g5-pro', name: 'G5 Pro', kind: 'camera', install: '壁装 2.9m' },
  { id: 'switch-d1', name: '开关 D1', kind: 'switch', install: '门侧 1.2m' },
  { id: 'curtain-c3', name: '窗帘 C3', kind: 'curtain', install: '窗边顶装' },
  { id: 'light-t1', name: '灯带 T1', kind: 'light', install: '吊顶' },
];

const FURNITURE_META: Record<FurnitureKind, { label: string }> = {
  sofa: { label: '沙发' },
  coffee: { label: '茶几' },
  tableRect: { label: '餐桌' },
  tableRound: { label: '圆桌' },
  bed: { label: '床' },
  desk: { label: '书桌' },
  cabinet: { label: '柜体' },
  island: { label: '岛台' },
  lounge: { label: '休闲椅' },
};

const FURNITURE_LIBRARY: FurnitureLibraryItem[] = [
  { kind: 'sofa', name: '沙发', w: 150, h: 46 },
  { kind: 'tableRect', name: '餐桌', w: 168, h: 66 },
  { kind: 'coffee', name: '茶几', w: 84, h: 36 },
  { kind: 'bed', name: '床', w: 132, h: 168 },
  { kind: 'desk', name: '书桌', w: 150, h: 58 },
  { kind: 'cabinet', name: '柜体', w: 120, h: 22 },
];

function matchesOverlay(device: DeviceModel, overlay: FloorPlanOverlayMode) {
  if (overlay === 'off') return true;
  if (overlay === 'wifi') return device.kind === 'hub' || device.kind === 'camera';
  if (overlay === 'cameras') return device.kind === 'camera';
  if (overlay === 'radar') return device.kind === 'fp400';
  if (overlay === 'zigbee') return device.kind === 'switch' || device.kind === 'curtain' || device.kind === 'light';
  return true;
}

function anchors(x: number, y: number, w: number, h: number): Point[] {
  return [
    { x: x + w * 0.3, y: y + h * 0.35 },
    { x: x + w * 0.7, y: y + h * 0.35 },
    { x: x + w * 0.5, y: y + h * 0.68 },
  ];
}

const INITIAL_WORKSPACE: WorkspaceState = {
  floors: [
    {
      id: 'ground',
      name: '示范别墅',
      label: '1F',
      area: 238,
      rooms: [
        {
          id: 'foyer',
          name: '玄关',
          area: 12,
          tone: 'neutral',
          x: 72,
          y: 92,
          w: 170,
          h: 120,
          anchors: anchors(72, 92, 170, 120),
          automations: ['离家布防'],
          furniture: [{ id: 'foyer-cabinet', kind: 'cabinet', x: 104, y: 128, w: 84, h: 18 }],
        },
        {
          id: 'living',
          name: '客厅',
          area: 42,
          tone: 'cool',
          x: 242,
          y: 92,
          w: 344,
          h: 216,
          anchors: anchors(242, 92, 344, 216),
          automations: ['回家欢迎', '观影模式'],
          furniture: [
            { id: 'living-sofa', kind: 'sofa', x: 314, y: 156, w: 132, h: 44 },
            { id: 'living-coffee', kind: 'coffee', x: 454, y: 172, w: 76, h: 34 },
          ],
        },
        {
          id: 'dining',
          name: '餐厅',
          area: 34,
          tone: 'warm',
          x: 586,
          y: 92,
          w: 364,
          h: 216,
          anchors: anchors(586, 92, 364, 216),
          automations: ['宴会模式'],
          furniture: [{ id: 'dining-table', kind: 'tableRect', x: 664, y: 144, w: 208, h: 76 }],
        },
        {
          id: 'gallery',
          name: '廊厅',
          area: 28,
          tone: 'neutral',
          x: 950,
          y: 92,
          w: 322,
          h: 286,
          anchors: anchors(950, 92, 322, 286),
          automations: ['安防巡航'],
          furniture: [{ id: 'gallery-cabinet', kind: 'cabinet', x: 1068, y: 228, w: 122, h: 18 }],
        },
        {
          id: 'tea',
          name: '茶室',
          area: 21,
          tone: 'warm',
          x: 1272,
          y: 92,
          w: 248,
          h: 226,
          anchors: anchors(1272, 92, 248, 226),
          automations: ['访客模式'],
          furniture: [{ id: 'tea-table', kind: 'tableRound', x: 1348, y: 136, w: 110, h: 110 }],
        },
        {
          id: 'family',
          name: '家庭厅',
          area: 64,
          tone: 'cool',
          x: 242,
          y: 308,
          w: 540,
          h: 306,
          anchors: anchors(242, 308, 540, 306),
          automations: ['伴随灯', '影院切换'],
          furniture: [
            { id: 'family-sofa', kind: 'sofa', x: 344, y: 408, w: 152, h: 44 },
            { id: 'family-coffee', kind: 'coffee', x: 528, y: 424, w: 88, h: 34 },
            { id: 'family-desk', kind: 'desk', x: 360, y: 530, w: 176, h: 62 },
          ],
        },
        {
          id: 'kitchen',
          name: '厨房',
          area: 20,
          tone: 'warm',
          x: 782,
          y: 308,
          w: 210,
          h: 198,
          anchors: anchors(782, 308, 210, 198),
          automations: ['烹饪联动'],
          furniture: [{ id: 'kitchen-island', kind: 'island', x: 834, y: 362, w: 116, h: 52 }],
        },
        {
          id: 'media',
          name: '会客区',
          area: 24,
          tone: 'neutral',
          x: 992,
          y: 378,
          w: 280,
          h: 236,
          anchors: anchors(992, 378, 280, 236),
          automations: ['会客灯光'],
          furniture: [{ id: 'media-lounge', kind: 'lounge', x: 1048, y: 468, w: 164, h: 72 }],
        },
        {
          id: 'suite',
          name: '客卧',
          area: 29,
          tone: 'neutral',
          x: 1272,
          y: 318,
          w: 248,
          h: 296,
          anchors: anchors(1272, 318, 248, 296),
          automations: ['客房欢迎'],
          furniture: [{ id: 'suite-bed', kind: 'bed', x: 1330, y: 404, w: 132, h: 162 }],
        },
        {
          id: 'study',
          name: '书房',
          area: 24,
          tone: 'cool',
          x: 666,
          y: 614,
          w: 340,
          h: 182,
          anchors: anchors(666, 614, 340, 182),
          automations: ['阅读场景'],
          furniture: [{ id: 'study-desk', kind: 'desk', x: 744, y: 676, w: 178, h: 64 }],
        },
        {
          id: 'terrace',
          name: '露台',
          area: 52,
          tone: 'warm',
          x: 1006,
          y: 614,
          w: 514,
          h: 182,
          anchors: anchors(1006, 614, 514, 182),
          automations: ['夜景灯光'],
          furniture: [
            { id: 'terrace-seat-1', kind: 'lounge', x: 1128, y: 668, w: 96, h: 52 },
            { id: 'terrace-seat-2', kind: 'lounge', x: 1286, y: 668, w: 96, h: 52 },
          ],
        },
      ],
      windows: [
        { id: 'w1', x1: 294, y1: 92, x2: 386, y2: 92 },
        { id: 'w2', x1: 452, y1: 92, x2: 542, y2: 92 },
        { id: 'w3', x1: 646, y1: 92, x2: 760, y2: 92 },
        { id: 'w4', x1: 1082, y1: 92, x2: 1182, y2: 92 },
        { id: 'w5', x1: 1272, y1: 148, x2: 1272, y2: 252 },
        { id: 'w6', x1: 1520, y1: 388, x2: 1520, y2: 534 },
        { id: 'w7', x1: 1168, y1: 796, x2: 1296, y2: 796 },
      ],
      doors: [
        { id: 'd1', x1: 242, y1: 172, x2: 242, y2: 218, arc: 'M242 172 A46 46 0 0 1 288 218' },
        { id: 'd2', x1: 586, y1: 236, x2: 586, y2: 282, arc: 'M586 236 A46 46 0 0 1 632 282' },
        { id: 'd3', x1: 950, y1: 332, x2: 950, y2: 378, arc: 'M950 332 A46 46 0 0 1 904 378' },
        { id: 'd4', x1: 1272, y1: 258, x2: 1272, y2: 302, arc: 'M1272 258 A44 44 0 0 1 1316 302' },
        { id: 'd5', x1: 782, y1: 438, x2: 782, y2: 482, arc: 'M782 438 A44 44 0 0 0 738 482' },
      ],
    },
    {
      id: 'upper',
      name: '示范别墅',
      label: '2F',
      area: 126,
      rooms: [
        {
          id: 'upper-landing',
          name: '楼厅',
          area: 18,
          tone: 'neutral',
          x: 340,
          y: 132,
          w: 280,
          h: 182,
          anchors: anchors(340, 132, 280, 182),
          automations: ['夜间导光'],
          furniture: [{ id: 'upper-landing-cabinet', kind: 'cabinet', x: 416, y: 224, w: 132, h: 18 }],
        },
        {
          id: 'upper-master',
          name: '主卧',
          area: 30,
          tone: 'warm',
          x: 620,
          y: 132,
          w: 324,
          h: 236,
          anchors: anchors(620, 132, 324, 236),
          automations: ['晨起模式', '睡眠模式'],
          furniture: [{ id: 'upper-master-bed', kind: 'bed', x: 708, y: 188, w: 152, h: 180 }],
        },
        {
          id: 'upper-lounge',
          name: '起居厅',
          area: 22,
          tone: 'cool',
          x: 340,
          y: 314,
          w: 388,
          h: 222,
          anchors: anchors(340, 314, 388, 222),
          automations: ['伴随灯'],
          furniture: [{ id: 'upper-lounge-sofa', kind: 'sofa', x: 418, y: 396, w: 148, h: 44 }],
        },
        {
          id: 'upper-study',
          name: '二层书房',
          area: 24,
          tone: 'cool',
          x: 1120,
          y: 132,
          w: 250,
          h: 462,
          anchors: anchors(1120, 132, 250, 462),
          automations: ['阅读场景'],
          furniture: [{ id: 'upper-study-desk', kind: 'desk', x: 1172, y: 234, w: 154, h: 58 }],
        },
      ],
      windows: [
        { id: 'uw1', x1: 728, y1: 132, x2: 840, y2: 132 },
        { id: 'uw2', x1: 1180, y1: 132, x2: 1298, y2: 132 },
        { id: 'uw3', x1: 1370, y1: 252, x2: 1370, y2: 382 },
      ],
      doors: [
        { id: 'ud1', x1: 620, y1: 236, x2: 620, y2: 280, arc: 'M620 236 A44 44 0 0 1 664 280' },
        { id: 'ud2', x1: 944, y1: 236, x2: 944, y2: 280, arc: 'M944 236 A44 44 0 0 1 900 280' },
      ],
    },
  ],
  devices: {
    ground: [
      {
        id: 'ground-hub-1',
        name: 'Hub M3',
        kind: 'hub',
        roomId: 'family',
        x: 462,
        y: 472,
        status: 'online',
        install: '弱电柜',
        automations: ['回家欢迎', '影院模式'],
        labelSide: 'bottom',
      },
      {
        id: 'ground-fp400-1',
        name: 'FP400 客厅',
        kind: 'fp400',
        roomId: 'living',
        x: 384,
        y: 212,
        status: 'online',
        install: '顶装 2.8m',
        automations: ['回家欢迎', '观影模式'],
        coverage: [{ id: 'cov-living', type: 'sector', radius: 170, angle: 120, rotation: 30 }],
        labelSide: 'bottom',
      },
      {
        id: 'ground-fp400-2',
        name: 'FP400 家庭厅',
        kind: 'fp400',
        roomId: 'family',
        x: 642,
        y: 436,
        status: 'online',
        install: '顶装 2.8m',
        automations: ['伴随灯'],
        coverage: [{ id: 'cov-family', type: 'sector', radius: 185, angle: 110, rotation: 210 }],
        labelSide: 'right',
      },
      {
        id: 'ground-camera-1',
        name: 'G5 Gallery',
        kind: 'camera',
        roomId: 'gallery',
        x: 1012,
        y: 216,
        status: 'online',
        install: '壁装 2.9m',
        automations: ['安防巡航'],
        coverage: [{ id: 'cov-gallery', type: 'sector', radius: 196, angle: 68, rotation: 105 }],
        labelSide: 'bottom',
      },
      {
        id: 'ground-switch-1',
        name: 'Switch D1',
        kind: 'switch',
        roomId: 'foyer',
        x: 162,
        y: 184,
        status: 'online',
        install: '门侧 1.2m',
        automations: ['离家布防'],
        labelSide: 'right',
      },
      {
        id: 'point-tea-light-spare',
        name: '茶室灯带预留点位',
        kind: 'light',
        roomId: 'tea',
        x: 1432,
        y: 202,
        status: 'attention',
        install: '点位保留 · 待绑定',
        automations: [],
        labelSide: 'bottom',
        bindingStatus: 'unboundPoint',
      },
    ],
    upper: [
      {
        id: 'upper-hub-1',
        name: 'Upper Hub',
        kind: 'hub',
        roomId: 'upper-landing',
        x: 476,
        y: 224,
        status: 'online',
        install: '吊顶检修口',
        automations: ['夜间导光'],
        labelSide: 'bottom',
      },
      {
        id: 'upper-fp400-1',
        name: 'FP400 主卧',
        kind: 'fp400',
        roomId: 'upper-master',
        x: 764,
        y: 212,
        status: 'online',
        install: '顶装 2.8m',
        automations: ['晨起模式', '睡眠模式'],
        coverage: [{ id: 'cov-upper-master', type: 'sector', radius: 160, angle: 120, rotation: 35 }],
        labelSide: 'bottom',
      },
    ],
  },
  connections: {
    ground: [
      { id: 'conn-ground-hub-fp400', sourceId: 'ground-hub-1', targetId: 'ground-fp400-2' },
      { id: 'conn-ground-hub-camera', sourceId: 'ground-hub-1', targetId: 'ground-camera-1' },
    ],
    upper: [
      { id: 'conn-upper-hub-fp400', sourceId: 'upper-hub-1', targetId: 'upper-fp400-1' },
    ],
  },
  unassignedDevices: [
    {
      id: 'new-fp400-entrance',
      name: 'FP400 新设备',
      kind: 'fp400',
      roomId: '',
      x: 0,
      y: 0,
      status: 'attention',
      install: '待设置',
      automations: [],
      coverage: [{ id: 'cov-new-fp400', type: 'sector', radius: 168, angle: 118, rotation: 45 }],
      labelSide: 'bottom',
    },
    {
      id: 'new-switch-d1',
      name: '开关 D1 新设备',
      kind: 'switch',
      roomId: '',
      x: 0,
      y: 0,
      status: 'attention',
      install: '待设置',
      automations: [],
      labelSide: 'right',
    },
  ],
};

const EMPTY_WORKSPACE: WorkspaceState = {
  floors: [
    {
      id: 'ground',
      name: '新建项目',
      label: '1F',
      area: 0,
      rooms: [],
      windows: [],
      doors: [],
    },
    {
      id: 'upper',
      name: '新建项目',
      label: '2F',
      area: 0,
      rooms: [],
      windows: [],
      doors: [],
    },
  ],
  devices: { ground: [], upper: [] },
  connections: { ground: [], upper: [] },
  unassignedDevices: INITIAL_WORKSPACE.unassignedDevices,
};

function cloneWorkspace(workspace: WorkspaceState): WorkspaceState {
  return JSON.parse(JSON.stringify(workspace)) as WorkspaceState;
}

function serializeEditingSnapshot(snapshot: EditingSnapshot) {
  return JSON.stringify(snapshot);
}

export default function SpacesPage() {
  const planRef = useRef<HTMLDivElement | null>(null);
  const skipNextConnectionClickRef = useRef(false);
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => cloneWorkspace(INITIAL_WORKSPACE));
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [hasFloorPlan, setHasFloorPlan] = useState(false);
  const [viewMode, setViewMode] = useState<SpaceViewMode>('floorplan');
  const [selectedFloorId, setSelectedFloorId] = useState<FloorId>('ground');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolId>('select');
  const [activeLayer, setActiveLayer] = useState<LayerId>('plan');
  const [activeOverlay, setActiveOverlay] = useState<FloorPlanOverlayMode>('off');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [iconScale, setIconScale] = useState(0.62);
  const [labelDensity, setLabelDensity] = useState(1);
  const [showDeviceName, setShowDeviceName] = useState(true);
  const [showDeviceModel, setShowDeviceModel] = useState(false);
  const [showConnectivity, setShowConnectivity] = useState(true);
  const [coverageOpacity, setCoverageOpacity] = useState(0.7);
  const [wallsOpacity, setWallsOpacity] = useState(1);
  const [furnitureOpacity, setFurnitureOpacity] = useState(0.82);
  const [selectedBuilding, setSelectedBuilding] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>('family');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [selectedUnassignedDeviceId, setSelectedUnassignedDeviceId] = useState<string | null>(null);
  const [spaceSearch, setSpaceSearch] = useState('');
  const [floorMenuOpen, setFloorMenuOpen] = useState(false);
  const [manageFloorPlansOpen, setManageFloorPlansOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [spaceTreeCollapsed, setSpaceTreeCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    ground: true,
    upper: true,
    living: true,
    family: true,
    dining: true,
  });
  const [activeDeviceMenuId, setActiveDeviceMenuId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [panDragState, setPanDragState] = useState<PanDragState | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [connectionDraft, setConnectionDraft] = useState<ConnectionDraft | null>(null);
  const [scaleSet, setScaleSet] = useState(false);
  const [scaleDraft, setScaleDraft] = useState<ScaleDraft | null>(null);
  const [scaleLength, setScaleLength] = useState('10');
  const [editSnapshot, setEditSnapshot] = useState<EditingSnapshot | null>(null);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [floorOverlay, setFloorOverlay] = useState<FloorPlanOverlay>({
    id: 'upper',
    label: 'Floor 2',
    x: 1128,
    y: 116,
    w: 252,
    h: 196,
  });
  const [alignmentDragState, setAlignmentDragState] = useState<AlignmentDragState | null>(null);
  const [coverageDragState, setCoverageDragState] = useState<CoverageDragState | null>(null);

  const activeFloor = workspace.floors.find(floor => floor.id === selectedFloorId) ?? workspace.floors[0];
  const activeDevices = workspace.devices[selectedFloorId];
  const activeConnections = workspace.connections[selectedFloorId];
  const selectedRoom = activeFloor.rooms.find(room => room.id === selectedRoomId) ?? null;
  const selectedDevice = activeDevices.find(device => device.id === selectedDeviceId) ?? null;
  const selectedFurnitureMatch = useMemo(() => {
    if (!selectedFurnitureId) return null;
    for (const room of activeFloor.rooms) {
      const item = room.furniture.find(candidate => candidate.id === selectedFurnitureId);
      if (item) return { room, item };
    }
    return null;
  }, [activeFloor.rooms, selectedFurnitureId]);
  const selectedFurniture = selectedFurnitureMatch?.item ?? null;
  const selectedFurnitureRoom = selectedFurnitureMatch?.room ?? null;
  const selectedUnassignedDevice = workspace.unassignedDevices.find(device => device.id === selectedUnassignedDeviceId) ?? null;
  const selectedRoomDevices = selectedRoom ? activeDevices.filter(device => device.roomId === selectedRoom.id) : [];
  const hasInspectorTarget = Boolean(selectedDevice || selectedUnassignedDevice || selectedFurniture || selectedRoom);
  const showInspectorPanel = !inspectorCollapsed && hasInspectorTarget;

  useEffect(() => {
    if (selectedRoom || selectedDevice || selectedFurniture || selectedUnassignedDevice) {
      setInspectorCollapsed(false);
      setSelectedBuilding(false);
    }
  }, [selectedRoom, selectedDevice, selectedFurniture, selectedUnassignedDevice]);

  const normalizedSpaceSearch = spaceSearch.trim().toLowerCase();
  const isFloorExpanded = expandedNodes[activeFloor.id] ?? true;
  const visibleRooms = activeFloor.rooms.filter(room => {
    if (!normalizedSpaceSearch) return true;
    const roomDevices = activeDevices.filter(device => device.roomId === room.id);
    return (
      room.name.toLowerCase().includes(normalizedSpaceSearch) ||
      roomDevices.some(device => device.name.toLowerCase().includes(normalizedSpaceSearch)) ||
      room.furniture.some(item => (item.name ?? FURNITURE_META[item.kind].label).toLowerCase().includes(normalizedSpaceSearch))
    );
  });
  const buildingTypeName = workspace.floors.length > 1 ? '两层住宅' : '一层住宅';
  const graphRelations = useMemo(() => buildGraphRelations(activeFloor, activeDevices, activeConnections), [activeFloor, activeConnections, activeDevices]);
  const selectedRelations = useMemo(
    () => filterGraphRelations(
      graphRelations,
      selectedFurnitureRoom?.id ?? selectedRoom?.id ?? null,
      selectedDevice?.id ?? selectedFurniture?.id ?? null
    ),
    [graphRelations, selectedFurnitureRoom?.id, selectedRoom?.id, selectedDevice?.id, selectedFurniture?.id]
  );
  const visibleDevices = activeDevices.filter(device => matchesOverlay(device, activeOverlay));
  const devicesWithCoverage = activeOverlay === 'off' || activeOverlay === 'zigbee'
    ? []
    : visibleDevices.filter(device => device.coverage?.length);
  const placementRoom = selectedRoom ?? activeFloor.rooms[0];
  const effectiveTool = spacePressed ? 'pan' : selectedTool;
  const isCanvasPanMode = effectiveTool === 'pan';
  const canEditObjects = isEditing && !spacePressed && selectedTool === 'select';
  const canAdjustCoverage = isEditing && !spacePressed && selectedTool === 'select';
  const clearEntitySelection = () => {
    setSelectedRoomId(null);
    setSelectedDeviceId(null);
    setSelectedFurnitureId(null);
    setSelectedUnassignedDeviceId(null);
    setActiveDeviceMenuId(null);
  };
  const openAllSpaces = () => {
    clearEntitySelection();
    setSelectedBuilding(true);
    setViewMode('graph');
    setInspectorCollapsed(true);
  };
  const currentEditingSignature = useMemo(
    () => serializeEditingSnapshot({ workspace, hasFloorPlan, scaleSet, scaleLength, floorOverlay }),
    [floorOverlay, hasFloorPlan, scaleLength, scaleSet, workspace]
  );
  const editSnapshotSignature = useMemo(
    () => editSnapshot ? serializeEditingSnapshot(editSnapshot) : '',
    [editSnapshot]
  );
  const hasUnsavedEdits = Boolean(editSnapshot && currentEditingSignature !== editSnapshotSignature);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setShiftPressed(true);
      }

      if (event.key === 'Escape') {
        setConnectionDraft(null);
        setScaleDraft(null);
        setAlignmentDragState(null);
        setCoverageDragState(null);
        if (selectedTool === 'connection' || selectedTool === 'align' || selectedTool === 'scale') {
          setSelectedTool('select');
        }
      }

      if (event.code !== 'Space' || isEditableTarget(event.target)) return;
      event.preventDefault();
      setSpacePressed(true);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setShiftPressed(false);
      }

      if (event.code !== 'Space') return;
      event.preventDefault();
      setSpacePressed(false);
      setPanDragState(null);
    };

    const handleBlur = () => {
      setSpacePressed(false);
      setPanDragState(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [selectedTool]);

  const createEditingSnapshot = (): EditingSnapshot => ({
    workspace: cloneWorkspace(workspace),
    hasFloorPlan,
    scaleSet,
    scaleLength,
    floorOverlay: { ...floorOverlay },
  });

  const startEditing = () => {
    if (!isEditing) {
      setEditSnapshot(current => current ?? createEditingSnapshot());
    }
    setIsEditing(true);
  };

  const commitWorkspace = (next: WorkspaceState) => {
    setWorkspace(next);
  };

  const updateActiveFloor = (updater: (floor: FloorModel) => FloorModel) => {
    commitWorkspace({
      ...workspace,
      floors: workspace.floors.map(floor => (floor.id === selectedFloorId ? updater(floor) : floor)),
    });
  };

  const updateRoom = (roomId: string, patch: Partial<RoomModel>) => {
    updateActiveFloor(floor => ({
      ...floor,
      rooms: floor.rooms.map(room => {
        if (room.id !== roomId) return room;
        const next = { ...room, ...patch };
        return { ...next, anchors: anchors(next.x, next.y, next.w, next.h) };
      }),
    }));
  };

  const updateDevice = (deviceId: string, patch: Partial<DeviceModel>) => {
    commitWorkspace({
      ...workspace,
      devices: {
        ...workspace.devices,
        [selectedFloorId]: activeDevices.map(device => (device.id === deviceId ? { ...device, ...patch } : device)),
      },
    });
  };

  const updateDeviceCoverage = (deviceId: string, coverageId: string, patch: Partial<CoverageModel>) => {
    setWorkspace(current => ({
      ...current,
      devices: {
        ...current.devices,
        [selectedFloorId]: current.devices[selectedFloorId].map(device => {
          if (device.id !== deviceId) return device;
          const nextCoverage = device.coverage?.map(coverage => (
            coverage.id === coverageId ? { ...coverage, ...patch } : coverage
          ));
          return {
            ...device,
            coverage: nextCoverage,
            localEulerAngles: patch.rotation === undefined
              ? device.localEulerAngles
              : { ...(device.localEulerAngles ?? { x: 0, y: 0, z: 0 }), z: patch.rotation },
          };
        }),
      },
    }));
  };

  const updateFurniture = (furnitureId: string, patch: Partial<FurnitureItem>) => {
    updateActiveFloor(floor => ({
      ...floor,
      rooms: floor.rooms.map(room => ({
        ...room,
        furniture: room.furniture.map(item => {
          if (item.id !== furnitureId) return item;
          const next = { ...item, ...patch };
          return {
            ...next,
            localPosition: toLocalPosition(next.x, next.y),
          };
        }),
      })),
    }));
  };

  const pointFromEvent = (event: ReactPointerEvent): Point | null => {
    const rect = planRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;

    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * VIEWBOX_W, 0, VIEWBOX_W),
      y: clamp(((event.clientY - rect.top) / rect.height) * VIEWBOX_H, 0, VIEWBOX_H),
    };
  };

  const capturePlanPointer = (event: ReactPointerEvent) => {
    planRef.current?.setPointerCapture(event.pointerId);
  };

  const moveRoomTo = (roomId: string, nextX: number, nextY: number) => {
    setWorkspace(current => {
      const floor = current.floors.find(item => item.id === selectedFloorId);
      const room = floor?.rooms.find(item => item.id === roomId);
      if (!floor || !room) return current;

      const x = clamp(nextX, 0, VIEWBOX_W - room.w);
      const y = clamp(nextY, 0, VIEWBOX_H - room.h);
      const dx = x - room.x;
      const dy = y - room.y;

      return {
        ...current,
        floors: current.floors.map(item => {
          if (item.id !== selectedFloorId) return item;
          return {
            ...item,
            rooms: item.rooms.map(candidate => {
              if (candidate.id !== roomId) return candidate;
              return {
                ...candidate,
                x,
                y,
                localPosition: toLocalPosition(x, y),
                anchors: anchors(x, y, candidate.w, candidate.h),
                furniture: candidate.furniture.map(furniture => ({
                  ...furniture,
                  x: furniture.x + dx,
                  y: furniture.y + dy,
                })),
              };
            }),
          };
        }),
        devices: {
          ...current.devices,
          [selectedFloorId]: current.devices[selectedFloorId].map(device => (
            device.roomId === roomId
              ? {
                  ...device,
                  x: clamp(device.x + dx, 0, VIEWBOX_W),
                  y: clamp(device.y + dy, 0, VIEWBOX_H),
                  localPosition: toLocalPosition(device.x + dx, device.y + dy),
                }
              : device
          )),
        },
      };
    });
  };

  const moveDeviceTo = (deviceId: string, nextX: number, nextY: number) => {
    let nextRoomId: string | null = null;

    setWorkspace(current => {
      const floor = current.floors.find(item => item.id === selectedFloorId);
      const devices = current.devices[selectedFloorId];
      const device = devices.find(item => item.id === deviceId);
      if (!floor || !device) return current;

      const x = clamp(nextX, 0, VIEWBOX_W);
      const y = clamp(nextY, 0, VIEWBOX_H);
      const targetRoom = findRoomAtPoint(floor.rooms, x, y)
        ?? floor.rooms.find(room => room.id === device.roomId)
        ?? floor.rooms[0];
      nextRoomId = targetRoom?.id ?? device.roomId;

      return {
        ...current,
        devices: {
          ...current.devices,
          [selectedFloorId]: devices.map(candidate => {
            if (candidate.id !== deviceId) return candidate;
            return {
              ...candidate,
              x,
              y,
              roomId: nextRoomId ?? candidate.roomId,
              localPosition: toLocalPosition(x, y),
              automations: nextRoomId !== candidate.roomId && targetRoom
                ? targetRoom.automations.slice(0, 2)
                : candidate.automations,
            };
          }),
        },
      };
    });

    if (nextRoomId) {
      setSelectedRoomId(nextRoomId);
    }
  };

  const moveDeviceToRoom = (deviceId: string, roomId: string) => {
    const targetRoom = activeFloor.rooms.find(room => room.id === roomId);
    if (!targetRoom) return;

    const existingCount = activeDevices.filter(device => device.roomId === roomId && device.id !== deviceId).length;
    const anchor = targetRoom.anchors[existingCount % targetRoom.anchors.length]
      ?? { x: targetRoom.x + targetRoom.w / 2, y: targetRoom.y + targetRoom.h / 2 };

    moveDeviceTo(
      deviceId,
      clamp(anchor.x, targetRoom.x + 18, targetRoom.x + targetRoom.w - 18),
      clamp(anchor.y, targetRoom.y + 18, targetRoom.y + targetRoom.h - 18)
    );
  };

  const moveFurnitureTo = (furnitureId: string, nextX: number, nextY: number) => {
    let nextRoomId: string | null = null;

    setWorkspace(current => {
      const floor = current.floors.find(item => item.id === selectedFloorId);
      if (!floor) return current;

      const sourceRoom = floor.rooms.find(room => room.furniture.some(item => item.id === furnitureId));
      const furniture = sourceRoom?.furniture.find(item => item.id === furnitureId);
      if (!sourceRoom || !furniture) return current;

      const centerX = nextX + furniture.w / 2;
      const centerY = nextY + furniture.h / 2;
      const targetRoom = findRoomAtPoint(floor.rooms, centerX, centerY) ?? sourceRoom;
      const x = clamp(nextX, targetRoom.x + 8, Math.max(targetRoom.x + 8, targetRoom.x + targetRoom.w - furniture.w - 8));
      const y = clamp(nextY, targetRoom.y + 8, Math.max(targetRoom.y + 8, targetRoom.y + targetRoom.h - furniture.h - 8));
      const nextFurniture = {
        ...furniture,
        x,
        y,
        localPosition: toLocalPosition(x, y),
      };

      nextRoomId = targetRoom.id;

      return {
        ...current,
        floors: current.floors.map(item => {
          if (item.id !== selectedFloorId) return item;
          return {
            ...item,
            rooms: item.rooms.map(room => {
              if (room.id === sourceRoom.id && room.id !== targetRoom.id) {
                return { ...room, furniture: room.furniture.filter(candidate => candidate.id !== furnitureId) };
              }
              if (room.id === targetRoom.id) {
                const exists = room.furniture.some(candidate => candidate.id === furnitureId);
                return {
                  ...room,
                  furniture: exists
                    ? room.furniture.map(candidate => (candidate.id === furnitureId ? nextFurniture : candidate))
                    : [...room.furniture, nextFurniture],
                };
              }
              return room;
            }),
          };
        }),
      };
    });

    if (nextRoomId) {
      setSelectedRoomId(nextRoomId);
    }
  };

  const createDeviceConnection = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const exists = activeConnections.some(connection => (
      (connection.sourceId === sourceId && connection.targetId === targetId) ||
      (connection.sourceId === targetId && connection.targetId === sourceId)
    ));
    if (exists) return;

    commitWorkspace({
      ...workspace,
      connections: {
        ...workspace.connections,
        [selectedFloorId]: [
          ...activeConnections,
          { id: `conn-${sourceId}-${targetId}-${Date.now()}`, sourceId, targetId },
        ],
      },
    });
  };

  const beginConnectionDrag = (event: ReactPointerEvent<HTMLButtonElement>, device: DeviceModel) => {
    if (!isEditing || selectedTool !== 'connection') return;
    const point = pointFromEvent(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    capturePlanPointer(event);
    skipNextConnectionClickRef.current = true;
    setConnectionDraft({ sourceId: device.id, current: point });
    setSelectedDeviceId(device.id);
    setSelectedRoomId(device.roomId);
    setActiveLayer('devices');
  };

  const handleDeviceConnectionClick = (device: DeviceModel) => {
    if (skipNextConnectionClickRef.current) {
      skipNextConnectionClickRef.current = false;
      return;
    }

    if (!connectionDraft) {
      setConnectionDraft({ sourceId: device.id, current: { x: device.x, y: device.y } });
      setSelectedDeviceId(device.id);
      setSelectedRoomId(device.roomId);
      return;
    }

    createDeviceConnection(connectionDraft.sourceId, device.id);
    setConnectionDraft(null);
    setSelectedDeviceId(device.id);
    setSelectedRoomId(device.roomId);
  };

  const beginFloorOverlayDrag = (event: ReactPointerEvent<SVGGElement | SVGCircleElement>, kind: AlignmentDragState['kind']) => {
    if (!isEditing || selectedTool !== 'align') return;
    const point = pointFromEvent(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    capturePlanPointer(event);
    setAlignmentDragState({
      kind,
      offsetX: point.x - floorOverlay.x,
      offsetY: point.y - floorOverlay.y,
      startX: floorOverlay.x,
      startY: floorOverlay.y,
      startW: floorOverlay.w,
      startH: floorOverlay.h,
    });
  };

  const beginCoverageAdjustment = (
    event: ReactPointerEvent<SVGCircleElement>,
    device: DeviceModel,
    coverage: CoverageModel,
    kind: CoverageDragState['kind']
  ) => {
    if (!canAdjustCoverage) return;
    event.preventDefault();
    event.stopPropagation();
    capturePlanPointer(event);
    setSelectedDeviceId(device.id);
    setSelectedRoomId(device.roomId);
    setSelectedFurnitureId(null);
    setSelectedUnassignedDeviceId(null);
    setActiveLayer('coverage');
    setCoverageDragState({ deviceId: device.id, coverageId: coverage.id, kind });
  };

  const beginScaleDraft = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isEditing || selectedTool !== 'scale') return false;
    const point = pointFromEvent(event);
    if (!point) return false;
    event.preventDefault();
    setScaleDraft({ start: point, end: point, committed: false });
    return true;
  };

  const beginRoomDrag = (event: ReactPointerEvent<SVGGElement>, room: RoomModel) => {
    if (!isEditing) return;
    if (selectedTool !== 'select' || spacePressed) return;
    const point = pointFromEvent(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    capturePlanPointer(event);
    setSelectedRoomId(room.id);
    setSelectedDeviceId(null);
    setSelectedFurnitureId(null);
    setDragState({ kind: 'room', id: room.id, offsetX: point.x - room.x, offsetY: point.y - room.y });
  };

  const beginDeviceDrag = (event: ReactPointerEvent<HTMLButtonElement>, device: DeviceModel) => {
    if (!isEditing) return;
    if (selectedTool !== 'select' || spacePressed) return;
    const point = pointFromEvent(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    capturePlanPointer(event);
    setSelectedDeviceId(device.id);
    setSelectedRoomId(device.roomId);
    setSelectedFurnitureId(null);
    setSelectedUnassignedDeviceId(null);
    setActiveLayer(layer => (layer === 'coverage' ? layer : 'devices'));
    setDragState({ kind: 'device', id: device.id, offsetX: point.x - device.x, offsetY: point.y - device.y });
  };

  const beginFurnitureDrag = (event: ReactPointerEvent<SVGGElement>, room: RoomModel, item: FurnitureItem) => {
    if (!isEditing) return;
    if (selectedTool !== 'select' || spacePressed) return;
    const point = pointFromEvent(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    capturePlanPointer(event);
    setSelectedRoomId(room.id);
    setSelectedFurnitureId(item.id);
    setSelectedDeviceId(null);
    setSelectedUnassignedDeviceId(null);
    setActiveLayer('plan');
    setDragState({ kind: 'furniture', id: item.id, roomId: room.id, offsetX: point.x - item.x, offsetY: point.y - item.y });
  };

  const beginPlanPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (beginScaleDraft(event)) return;

    if (!isCanvasPanMode || selectedUnassignedDevice) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setPanDragState({
      clientX: event.clientX,
      clientY: event.clientY,
      startX: panOffset.x,
      startY: panOffset.y,
    });
  };

  const handlePlanPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = pointFromEvent(event);

    if (coverageDragState && point) {
      const device = activeDevices.find(item => item.id === coverageDragState.deviceId);
      const coverage = device?.coverage?.find(item => item.id === coverageDragState.coverageId);
      if (!device || !coverage) return;

      event.preventDefault();
      const dx = point.x - device.x;
      const dy = point.y - device.y;
      if (coverageDragState.kind === 'rotation') {
        updateDeviceCoverage(device.id, coverage.id, {
          rotation: normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI),
        });
        return;
      }

      updateDeviceCoverage(device.id, coverage.id, {
        radius: clamp(Math.hypot(dx, dy), 48, 320),
      });
      return;
    }

    if (selectedTool === 'connection' && connectionDraft && point) {
      event.preventDefault();
      const snappedDevice = shiftPressed ? null : findNearestDevice(activeDevices, point, connectionDraft.sourceId, 44);
      setConnectionDraft({
        ...connectionDraft,
        current: snappedDevice ? { x: snappedDevice.x, y: snappedDevice.y } : point,
      });
      return;
    }

    if (selectedTool === 'align' && alignmentDragState && point) {
      event.preventDefault();
      setFloorOverlay(current => {
        if (alignmentDragState.kind === 'resize-se') {
          return {
            ...current,
            w: clamp(point.x - alignmentDragState.startX, 120, 620),
            h: clamp(point.y - alignmentDragState.startY, 90, 460),
          };
        }

        if (alignmentDragState.kind === 'resize-nw') {
          const right = alignmentDragState.startX + alignmentDragState.startW;
          const bottom = alignmentDragState.startY + alignmentDragState.startH;
          const x = clamp(point.x, 0, right - 120);
          const y = clamp(point.y, 0, bottom - 90);
          return {
            ...current,
            x,
            y,
            w: right - x,
            h: bottom - y,
          };
        }

        if (alignmentDragState.kind === 'resize-ne') {
          const bottom = alignmentDragState.startY + alignmentDragState.startH;
          const y = clamp(point.y, 0, bottom - 90);
          return {
            ...current,
            y,
            w: clamp(point.x - alignmentDragState.startX, 120, 620),
            h: bottom - y,
          };
        }

        if (alignmentDragState.kind === 'resize-sw') {
          const right = alignmentDragState.startX + alignmentDragState.startW;
          const x = clamp(point.x, 0, right - 120);
          return {
            ...current,
            x,
            w: right - x,
            h: clamp(point.y - alignmentDragState.startY, 90, 460),
          };
        }

        return {
          ...current,
          x: clamp(point.x - alignmentDragState.offsetX, 0, VIEWBOX_W - current.w),
          y: clamp(point.y - alignmentDragState.offsetY, 0, VIEWBOX_H - current.h),
        };
      });
      return;
    }

    if (selectedTool === 'scale' && scaleDraft && !scaleDraft.committed && point) {
      event.preventDefault();
      setScaleDraft({ ...scaleDraft, end: point });
      return;
    }

    if (panDragState) {
      event.preventDefault();
      setPanOffset({
        x: panDragState.startX + event.clientX - panDragState.clientX,
        y: panDragState.startY + event.clientY - panDragState.clientY,
      });
      return;
    }

    if (!isEditing || !dragState) return;
    if (!point) return;
    event.preventDefault();

    if (dragState.kind === 'room') {
      moveRoomTo(dragState.id, point.x - dragState.offsetX, point.y - dragState.offsetY);
    } else if (dragState.kind === 'device') {
      moveDeviceTo(dragState.id, point.x - dragState.offsetX, point.y - dragState.offsetY);
    } else {
      moveFurnitureTo(dragState.id, point.x - dragState.offsetX, point.y - dragState.offsetY);
    }
  };

  const finishDrag = () => {
    setDragState(null);
    setPanDragState(null);
    setAlignmentDragState(null);
    setCoverageDragState(null);
  };

  const handlePlanPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = pointFromEvent(event);

    if (selectedTool === 'connection' && connectionDraft && point) {
      const target = shiftPressed ? null : findNearestDevice(activeDevices, point, connectionDraft.sourceId, 52);
      if (target) {
        createDeviceConnection(connectionDraft.sourceId, target.id);
        setSelectedDeviceId(target.id);
        setSelectedRoomId(target.roomId);
      }
      setConnectionDraft(null);
      finishDrag();
      return;
    }

    if (selectedTool === 'scale' && scaleDraft && !scaleDraft.committed) {
      setScaleDraft({ ...scaleDraft, committed: true });
      finishDrag();
      return;
    }

    finishDrag();
  };

  const placeUnassignedDevice = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isEditing || !selectedUnassignedDevice || dragState || isCanvasPanMode || selectedTool === 'scale' || selectedTool === 'connection') return;
    const point = pointFromEvent(event);
    if (!point) return;
    const targetRoom = findRoomAtPoint(activeFloor.rooms, point.x, point.y) ?? placementRoom;
    if (!targetRoom) return;

    const device: DeviceModel = {
      ...selectedUnassignedDevice,
      roomId: targetRoom.id,
      x: point.x,
      y: point.y,
      localPosition: toLocalPosition(point.x, point.y),
      install: selectedUnassignedDevice.install === '待设置' ? inferInstallText(selectedUnassignedDevice.kind) : selectedUnassignedDevice.install,
      status: 'online',
      automations: targetRoom.automations.slice(0, 2),
    };

    commitWorkspace({
      ...workspace,
      devices: {
        ...workspace.devices,
        [selectedFloorId]: [...activeDevices, device],
      },
      unassignedDevices: workspace.unassignedDevices.filter(item => item.id !== selectedUnassignedDevice.id),
    });
    setSelectedUnassignedDeviceId(null);
    setSelectedDeviceId(device.id);
    setSelectedRoomId(targetRoom.id);
    setSelectedFurnitureId(null);
    setActiveLayer(device.coverage?.length ? 'coverage' : 'devices');
  };

  const addRoom = () => {
    if (!isEditing) {
      startEditing();
    }
    const index = activeFloor.rooms.length + 1;
    const x = 130 + (index % 5) * 90;
    const y = 130 + (index % 4) * 72;
    const room: RoomModel = {
      id: `room-${Date.now()}`,
      name: `房间 ${index}`,
      enable: true,
      area: 18,
      orientation: '南',
      enclosureType: '封闭',
      tone: 'neutral',
      x,
      y,
      w: 220,
      h: 160,
      localPosition: toLocalPosition(x, y),
      localEulerAngles: { x: 0, y: 0, z: 0 },
      anchors: anchors(x, y, 220, 160),
      automations: [],
      furniture: [],
    };

    updateActiveFloor(floor => ({ ...floor, rooms: [...floor.rooms, room] }));
    setSelectedRoomId(room.id);
    setSelectedDeviceId(null);
    setSelectedFurnitureId(null);
    setSelectedUnassignedDeviceId(null);
    setSelectedTool('select');
  };

  const duplicateRoom = () => {
    if (!selectedRoom) return;
    const copy: RoomModel = {
      ...selectedRoom,
      id: `room-${Date.now()}`,
      name: `${selectedRoom.name} 副本`,
      x: selectedRoom.x + 32,
      y: selectedRoom.y + 32,
      localPosition: toLocalPosition(selectedRoom.x + 32, selectedRoom.y + 32),
      furniture: selectedRoom.furniture.map(item => ({ ...item, id: `${item.id}-copy` })),
    };
    copy.anchors = anchors(copy.x, copy.y, copy.w, copy.h);
    updateActiveFloor(floor => ({ ...floor, rooms: [...floor.rooms, copy] }));
    setSelectedRoomId(copy.id);
    setSelectedDeviceId(null);
    setSelectedFurnitureId(null);
    setSelectedUnassignedDeviceId(null);
  };

  const removeRoom = () => {
    if (!selectedRoom) return;
    updateActiveFloor(floor => ({ ...floor, rooms: floor.rooms.filter(room => room.id !== selectedRoom.id) }));
    commitWorkspace({
      ...workspace,
      floors: workspace.floors.map(floor => (
        floor.id === selectedFloorId
          ? { ...floor, rooms: floor.rooms.filter(room => room.id !== selectedRoom.id) }
          : floor
      )),
      devices: {
        ...workspace.devices,
        [selectedFloorId]: activeDevices.filter(device => device.roomId !== selectedRoom.id),
      },
    });
    setSelectedRoomId(null);
    setSelectedDeviceId(null);
    setSelectedFurnitureId(null);
  };

  const addDoor = () => {
    if (!isEditing) {
      startEditing();
    }
    const room = selectedRoom ?? activeFloor.rooms[0];
    if (!room) return;
    const x1 = room.x + room.w * 0.42;
    const y = room.y + room.h;
    const x2 = x1 + 56;
    const door: DoorModel = {
      id: `door-${Date.now()}`,
      x1,
      y1: y,
      x2,
      y2: y,
      arc: `M${x1} ${y} A56 56 0 0 0 ${x2} ${y + 56}`,
    };
    updateActiveFloor(floor => ({ ...floor, doors: [...floor.doors, door] }));
    setSelectedTool('select');
  };

  const addWindow = () => {
    if (!isEditing) {
      startEditing();
    }
    const room = selectedRoom ?? activeFloor.rooms[0];
    if (!room) return;
    const windowModel: WindowModel = {
      id: `window-${Date.now()}`,
      x1: room.x + room.w * 0.25,
      y1: room.y,
      x2: room.x + room.w * 0.62,
      y2: room.y,
    };
    updateActiveFloor(floor => ({ ...floor, windows: [...floor.windows, windowModel] }));
    setSelectedTool('select');
  };

  const addDevice = (item: LibraryItem = DEVICE_LIBRARY[0]) => {
    if (!isEditing) {
      startEditing();
    }
    const room = selectedRoom ?? activeFloor.rooms[0];
    if (!room) return;
    const count = activeDevices.filter(device => device.kind === item.kind).length + 1;
    const anchor = room.anchors[count % room.anchors.length] ?? { x: room.x + room.w / 2, y: room.y + room.h / 2 };
    const device: DeviceModel = {
      id: `${selectedFloorId}-${item.kind}-${Date.now()}`,
      name: buildDeviceName(item, count),
      kind: item.kind,
      roomId: room.id,
      x: anchor.x,
      y: anchor.y,
      localPosition: toLocalPosition(anchor.x, anchor.y),
      localEulerAngles: { x: 0, y: 0, z: 0 },
      status: 'online',
      install: item.install,
      automations: room.automations.slice(0, 2),
      coverage: buildDefaultCoverage(item.kind, count),
      labelSide: count % 2 === 0 ? 'right' : 'bottom',
    };
    commitWorkspace({
      ...workspace,
      devices: {
        ...workspace.devices,
        [selectedFloorId]: [...activeDevices, device],
      },
    });
    setSelectedRoomId(room.id);
    setSelectedDeviceId(device.id);
    setSelectedFurnitureId(null);
    setSelectedUnassignedDeviceId(null);
    setSelectedTool('select');
  };

  const addFurniture = (item: FurnitureLibraryItem = FURNITURE_LIBRARY[0]) => {
    if (!isEditing) {
      startEditing();
    }
    const room = selectedRoom ?? activeFloor.rooms[0];
    if (!room) return;
    const furniture: FurnitureItem = {
      id: `${room.id}-${item.kind}-${Date.now()}`,
      name: item.name,
      kind: item.kind,
      x: room.x + Math.max(18, (room.w - item.w) / 2),
      y: room.y + Math.max(18, (room.h - item.h) / 2),
      w: item.w,
      h: item.h,
      localPosition: toLocalPosition(room.x + Math.max(18, (room.w - item.w) / 2), room.y + Math.max(18, (room.h - item.h) / 2)),
      localEulerAngles: { x: 0, y: 0, z: 0 },
    };

    updateActiveFloor(floor => ({
      ...floor,
      rooms: floor.rooms.map(candidate => (
        candidate.id === room.id
          ? { ...candidate, furniture: [...candidate.furniture, furniture] }
          : candidate
      )),
    }));
    setShowFurniture(true);
    setSelectedRoomId(room.id);
    setSelectedFurnitureId(furniture.id);
    setSelectedDeviceId(null);
    setSelectedUnassignedDeviceId(null);
    setSelectedTool('select');
  };

  const duplicateFurniture = () => {
    if (!selectedFurniture || !selectedFurnitureRoom) return;
    const copy: FurnitureItem = {
      ...selectedFurniture,
      id: `${selectedFurniture.id}-copy-${Date.now()}`,
      name: `${selectedFurniture.name ?? FURNITURE_META[selectedFurniture.kind].label} 副本`,
      x: selectedFurniture.x + 24,
      y: selectedFurniture.y + 24,
      localPosition: toLocalPosition(selectedFurniture.x + 24, selectedFurniture.y + 24),
    };
    updateActiveFloor(floor => ({
      ...floor,
      rooms: floor.rooms.map(room => (
        room.id === selectedFurnitureRoom.id
          ? { ...room, furniture: [...room.furniture, copy] }
          : room
      )),
    }));
    setSelectedFurnitureId(copy.id);
  };

  const removeFurniture = () => {
    if (!selectedFurniture) return;
    updateActiveFloor(floor => ({
      ...floor,
      rooms: floor.rooms.map(room => ({
        ...room,
        furniture: room.furniture.filter(item => item.id !== selectedFurniture.id),
      })),
    }));
    setSelectedFurnitureId(null);
  };

  const removeDevice = () => {
    if (!selectedDevice) return;
    if (selectedDevice.bindingStatus === 'unboundPoint') {
      commitWorkspace({
        ...workspace,
        devices: {
          ...workspace.devices,
          [selectedFloorId]: activeDevices.filter(device => device.id !== selectedDevice.id),
        },
      });
      setSelectedDeviceId(null);
      return;
    }

    commitWorkspace({
      ...workspace,
      devices: {
        ...workspace.devices,
        [selectedFloorId]: activeDevices.map(device => (
          device.id === selectedDevice.id
            ? {
                ...device,
                name: `${device.name} 点位`,
                status: 'attention',
                install: '点位保留 · 待绑定',
                automations: [],
                bindingStatus: 'unboundPoint',
              }
            : device
        )),
      },
    });
  };

  const unassignDevice = (deviceId: string) => {
    const device = activeDevices.find(item => item.id === deviceId);
    if (!device) return;
    commitWorkspace({
      ...workspace,
      devices: {
        ...workspace.devices,
        [selectedFloorId]: activeDevices.filter(item => item.id !== deviceId),
      },
      unassignedDevices: [
        ...workspace.unassignedDevices,
        {
          ...device,
          roomId: '',
          x: 0,
          y: 0,
          status: 'attention',
          install: '待设置',
          automations: [],
        },
      ],
    });
    setSelectedDeviceId(null);
    setSelectedUnassignedDeviceId(deviceId);
    setActiveDeviceMenuId(null);
  };

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(current => ({ ...current, [nodeId]: !(current[nodeId] ?? true) }));
  };

  const cancelActiveToolDraft = () => {
    setConnectionDraft(null);
    setScaleDraft(null);
    setAlignmentDragState(null);
    setCoverageDragState(null);
  };

  const finishEditingSession = () => {
    cancelActiveToolDraft();
    setDragState(null);
    setPanDragState(null);
    setSelectedTool('select');
    setActiveDeviceMenuId(null);
    setIsEditing(false);
  };

  const saveEditingSession = () => {
    finishEditingSession();
    setEditSnapshot(null);
    setUnsavedDialogOpen(false);
  };

  const restoreEditingSnapshot = () => {
    if (!editSnapshot) return;
    setWorkspace(cloneWorkspace(editSnapshot.workspace));
    setHasFloorPlan(editSnapshot.hasFloorPlan);
    setScaleSet(editSnapshot.scaleSet);
    setScaleLength(editSnapshot.scaleLength);
    setFloorOverlay({ ...editSnapshot.floorOverlay });
    setScaleDraft(null);
  };

  const discardEditingSession = () => {
    restoreEditingSnapshot();
    finishEditingSession();
    setEditSnapshot(null);
    setUnsavedDialogOpen(false);
  };

  const requestCancelEditing = () => {
    if (!isEditing) return;
    if (hasUnsavedEdits) {
      setUnsavedDialogOpen(true);
      return;
    }
    finishEditingSession();
    setEditSnapshot(null);
  };

  const handleTool = (tool: ToolId) => {
    if (!isEditing && !['select', 'pan', 'measure'].includes(tool)) {
      startEditing();
    }
    cancelActiveToolDraft();
    setSelectedTool(tool);
    if (tool === 'connection') setActiveLayer('devices');
    if (tool === 'scale') setActiveLayer('plan');
    if (tool === 'align') {
      const peerFloor = workspace.floors.find(floor => floor.id !== selectedFloorId);
      if (peerFloor && floorOverlay.id === selectedFloorId) {
        setFloorOverlay(current => ({ ...current, id: peerFloor.id, label: peerFloor.label }));
      }
    }
    if (tool === 'room') addRoom();
    if (tool === 'door') addDoor();
    if (tool === 'window') addWindow();
  };

  const selectFloor = (floorId: FloorId) => {
    const peerFloor = workspace.floors.find(floor => floor.id !== floorId);
    setSelectedBuilding(false);
    setSelectedFloorId(floorId);
    setSelectedRoomId(null);
    setSelectedDeviceId(null);
    setSelectedFurnitureId(null);
    setSelectedUnassignedDeviceId(null);
    setActiveDeviceMenuId(null);
    setFloorMenuOpen(false);
    if (peerFloor) {
      setFloorOverlay(current => ({
        ...current,
        id: peerFloor.id,
        label: peerFloor.label,
      }));
    }
  };

  const clearInspectorSelection = () => {
    setSelectedBuilding(false);
    setSelectedRoomId(null);
    setSelectedDeviceId(null);
    setSelectedFurnitureId(null);
    setSelectedUnassignedDeviceId(null);
    setActiveDeviceMenuId(null);
    setInspectorCollapsed(true);
  };

  const collapseStudioNavigation = () => {
    window.dispatchEvent(new CustomEvent('studio-sidebar-collapse', { detail: true }));
  };

  const createLocalFloorPlan = () => {
    startEditing();
    setHasFloorPlan(true);
    setViewMode('floorplan');
    setSelectedTool('scale');
    setScaleSet(false);
    setScaleDraft(null);
  };

  const startFloorPlan = (origin: Exclude<FloorPlanOrigin, 'empty'>) => {
    const graphOnly = origin === 'custom' || origin === 'template';
    const nextWorkspace = origin === 'custom'
      ? cloneWorkspace(EMPTY_WORKSPACE)
      : cloneWorkspace(INITIAL_WORKSPACE);

    setWorkspace(nextWorkspace);
    setWorkspaceReady(true);
    setHasFloorPlan(!graphOnly);
    setViewMode(graphOnly ? 'graph' : 'floorplan');
    setSelectedFloorId('ground');
    setSelectedBuilding(false);
    setSelectedRoomId(null);
    setSelectedDeviceId(null);
    setSelectedFurnitureId(null);
    setSelectedUnassignedDeviceId(null);
    setActiveDeviceMenuId(null);
    setInspectorCollapsed(true);
    setActiveLayer('plan');
    setIsEditing(origin === 'upload');
    setEditSnapshot(origin === 'upload'
      ? {
          workspace: cloneWorkspace(nextWorkspace),
          hasFloorPlan: !graphOnly,
          scaleSet: false,
          scaleLength,
          floorOverlay: { ...floorOverlay },
        }
      : null
    );
    setSelectedTool('select');
    setScaleSet(origin === 'builder');
    setScaleDraft(null);
    setPanOffset({ x: 0, y: 0 });
    setZoom(1);
    if (origin === 'builder') {
      setSpaceTreeCollapsed(true);
      collapseStudioNavigation();
    }
  };

  if (!workspaceReady) {
    return <InitialFloorPlanGuide onStart={startFloorPlan} />;
  }

  return (
    <div className="h-[calc(100vh-64px)] min-h-[760px] p-3">
      <div
        className={cn(
          'grid h-full min-h-0 gap-3 transition-[grid-template-columns] duration-200',
          !showInspectorPanel
            ? (spaceTreeCollapsed ? 'grid-cols-[minmax(0,1fr)]' : 'grid-cols-[280px_minmax(0,1fr)]')
            : (spaceTreeCollapsed ? 'grid-cols-[minmax(0,1fr)_320px]' : 'grid-cols-[280px_minmax(0,1fr)_320px]')
        )}
      >
        {!spaceTreeCollapsed && (
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#d8dee8] bg-white">
          <div className="flex h-12 items-center justify-between px-4">
            <div className="text-[18px] font-semibold text-[#111827]">空间树</div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSpaceTreeCollapsed(true)}
                title="折叠空间树"
                className="inline-flex h-9 w-11 items-center justify-center rounded-full border border-[#e1e7f0] bg-[#f8fafc] text-[#4b5565] transition hover:bg-white"
              >
                <Menu size={18} />
              </button>
              <IconButton icon={Plus} label="新增房间" onClick={addRoom} />
              <IconButton icon={RefreshCw} label="刷新" />
            </div>
          </div>

          <div className="border-b border-[#e8edf3] px-3 pb-3">
            <div className="relative mb-2">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa3b2]" />
              <input
                value={spaceSearch}
                onChange={event => setSpaceSearch(event.target.value)}
                placeholder="输入搜索"
                className="h-9 w-full rounded-md border border-[#d6dbe3] bg-white pl-9 pr-3 text-[13px] text-[#202938] outline-none focus:border-[#165dff]"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setFloorMenuOpen(open => !open)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-[#e1e8f2] bg-white px-2.5 text-left transition hover:border-[#bfd5ff] hover:bg-[#f8fbff]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 min-w-6 items-center justify-center rounded bg-[#edf4ff] px-1.5 text-[11px] font-semibold text-[#165dff]">{activeFloor.label}</span>
                  <span className="truncate text-[13px] font-semibold text-[#202938]">{activeFloor.name}</span>
                  <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-medium text-[#64748b]">{activeFloor.rooms.length}</span>
                </span>
                <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#697386]">
                  <ChevronDown size={15} className={cn('transition', floorMenuOpen && 'rotate-180')} />
                </span>
              </button>

              {floorMenuOpen && (
                <div className="absolute left-0 right-0 top-10 z-30 overflow-hidden rounded-xl border border-[#d8dee8] bg-white py-1 shadow-[0_18px_42px_rgba(15,23,42,0.14)]">
                  {workspace.floors.map(floor => (
                    <button
                      key={floor.id}
                      type="button"
                      onClick={() => selectFloor(floor.id)}
                      className={cn(
                        'flex h-9 w-full items-center justify-between gap-3 px-3 text-left transition',
                        floor.id === selectedFloorId ? 'bg-[#edf4ff] text-[#165dff]' : 'text-[#202938] hover:bg-[#f7f9fc]'
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex h-5 min-w-6 items-center justify-center rounded bg-[#edf4ff] px-1.5 text-[11px] font-semibold text-[#165dff]">{floor.label}</span>
                        <span className="truncate text-[13px] font-semibold">{floor.name}</span>
                      </span>
                      <span className="shrink-0 text-[12px] text-[#8a94a5]">{floor.rooms.length}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFloorMenuOpen(false);
                      setManageFloorPlansOpen(true);
                    }}
                    className="flex h-9 w-full items-center justify-center gap-2 border-t border-[#eef2f7] bg-[#fbfcff] text-[13px] font-semibold text-[#165dff] transition hover:bg-[#f4f8ff]"
                  >
                    <MapIcon size={14} />
                    Manage Floor Plans
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            <div className="px-1 pb-1.5">
              <BuildingTreeRoot
                name={buildingTypeName}
                floorCount={workspace.floors.length}
                roomCount={workspace.floors.reduce((sum, floor) => sum + floor.rooms.length, 0)}
                selected={selectedBuilding}
                onSelect={openAllSpaces}
              />
              <TreeRoot
                floor={activeFloor}
                deviceCount={activeDevices.length}
                selected={Boolean(!selectedBuilding && !selectedRoom && !selectedDevice && !selectedFurniture && !selectedUnassignedDevice)}
                expanded={isFloorExpanded}
                onToggle={() => toggleExpanded(activeFloor.id)}
                onSelect={() => {
                  setSelectedBuilding(false);
                  setSelectedRoomId(null);
                  setSelectedDeviceId(null);
                  setSelectedFurnitureId(null);
                  setSelectedUnassignedDeviceId(null);
                  if (hasFloorPlan) setViewMode('floorplan');
                }}
              />
            </div>

            <div className={cn('relative ml-4 pl-4', (isFloorExpanded || normalizedSpaceSearch) && visibleRooms.length > 0 && 'before:absolute before:left-[8px] before:top-0 before:bottom-3 before:w-px before:bg-[#dbe3ee]')}>
            {(isFloorExpanded || normalizedSpaceSearch) && visibleRooms.map(room => {
              const roomDevices = activeDevices.filter(device => device.roomId === room.id);
              const isRoomExpanded = normalizedSpaceSearch ? true : (expandedNodes[room.id] ?? ['family', 'living', 'dining'].includes(room.id));
              return (
                <SpaceTreeRoom
                  key={room.id}
                  room={room}
                  devices={roomDevices}
                  expanded={isRoomExpanded}
                  selected={room.id === selectedRoom?.id && !selectedDevice && !selectedFurniture}
                  selectedDeviceId={selectedDevice?.id ?? null}
                  selectedFurnitureId={selectedFurniture?.id ?? null}
                  activeDeviceMenuId={activeDeviceMenuId}
                  onToggle={() => toggleExpanded(room.id)}
                  onSelectRoom={() => {
                    setSelectedRoomId(room.id);
                    setSelectedDeviceId(null);
                    setSelectedFurnitureId(null);
                    setSelectedUnassignedDeviceId(null);
                    setActiveDeviceMenuId(null);
                  }}
                  onSelectDevice={device => {
                    setSelectedRoomId(device.roomId);
                    setSelectedDeviceId(device.id);
                    setSelectedFurnitureId(null);
                    setSelectedUnassignedDeviceId(null);
                    setActiveDeviceMenuId(null);
                  }}
                  onSelectFurniture={item => {
                    setSelectedRoomId(room.id);
                    setSelectedFurnitureId(item.id);
                    setSelectedDeviceId(null);
                    setSelectedUnassignedDeviceId(null);
                    setActiveDeviceMenuId(null);
                  }}
                  onToggleDeviceMenu={deviceId => setActiveDeviceMenuId(current => (current === deviceId ? null : deviceId))}
                  onDeviceAction={(action, device) => {
                    if (action === 'locate') {
                      setSelectedRoomId(device.roomId);
                      setSelectedDeviceId(device.id);
                      setSelectedFurnitureId(null);
                      setSelectedUnassignedDeviceId(null);
                      setActiveLayer(device.coverage?.length ? 'coverage' : 'devices');
                    }
                    if (action === 'edit') {
                      startEditing();
                      setSelectedRoomId(device.roomId);
                      setSelectedDeviceId(device.id);
                      setSelectedFurnitureId(null);
                      setSelectedUnassignedDeviceId(null);
                      setActiveLayer(device.coverage?.length ? 'coverage' : 'devices');
                    }
                    if (action === 'unassign') {
                      startEditing();
                      unassignDevice(device.id);
                    }
                    setActiveDeviceMenuId(null);
                  }}
                />
              );
            })}
            </div>

            {workspace.unassignedDevices.length > 0 && (
              <div className="mt-3 border-t border-[#eef2f7] px-2 pt-3">
                <div className="mb-2 px-2 text-[12px] font-medium text-[#8a94a5]">未分配设备</div>
                {workspace.unassignedDevices.map(device => {
                  const meta = DEVICE_META[device.kind];
                  return (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnassignedDeviceId(device.id);
                        setSelectedDeviceId(null);
                        setSelectedFurnitureId(null);
                        setActiveLayer(device.coverage?.length ? 'coverage' : 'devices');
                        if (!selectedRoomId) setSelectedRoomId(activeFloor.rooms[0]?.id ?? null);
                      }}
                      className={cn(
                        'mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition',
                        selectedUnassignedDeviceId === device.id ? 'bg-[#fff7ed] text-[#b45309]' : 'text-[#2f3948] hover:bg-[#f6f8fb]'
                      )}
                    >
                      <meta.icon size={17} className="text-[#f97316]" />
                      <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{device.name}</span>
                      <span className="text-[12px] text-[#9aa3b2]">待定位</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
        )}

        <main className="relative min-w-0 overflow-hidden rounded-lg border border-[#d8dee8] bg-[#f7f9fc]">
          <div className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {spaceTreeCollapsed && (
                <button
                  type="button"
                  onClick={() => setSpaceTreeCollapsed(false)}
                  className="flex h-11 items-center gap-3 rounded-full border border-[#d8dee8] bg-white px-4 text-[18px] font-semibold text-[#111827] shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition hover:bg-[#f8fafc]"
                >
                  空间管理
                  <span className="flex h-8 w-11 items-center justify-center rounded-full bg-[#f1f4f8] text-[#4b5565]">
                    <Menu size={19} />
                  </span>
                </button>
              )}
              <div className="flex items-center overflow-hidden rounded-lg border border-[#d8dee8] bg-white p-1 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                {[
                  { id: 'floorplan' as SpaceViewMode, label: '户型图', icon: MapIcon },
                  { id: 'graph' as SpaceViewMode, label: '图谱', icon: Workflow },
                ].map(view => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setViewMode(view.id)}
                    className={cn(
                      'flex h-9 items-center gap-2 rounded-md px-3 text-[13px] font-medium transition',
                      viewMode === view.id ? 'bg-[#165dff] text-white' : 'text-[#596579] hover:bg-[#f3f6fa]'
                    )}
                  >
                    <view.icon size={15} />
                    {view.label}
                  </button>
                ))}
              </div>
              {viewMode === 'floorplan' && hasFloorPlan && (
                <div className="flex items-center overflow-hidden rounded-lg border border-[#d8dee8] bg-white p-1 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                  {FLOORPLAN_OVERLAY_OPTIONS.map(overlay => (
                    <button
                      key={overlay.id}
                      type="button"
                      onClick={() => {
                        setActiveOverlay(overlay.id);
                        setActiveLayer(overlay.layer);
                      }}
                      className={cn(
                        'flex h-9 items-center gap-2 rounded-md px-3 text-[13px] font-medium transition',
                        activeOverlay === overlay.id ? 'bg-[#165dff] text-white' : 'text-[#596579] hover:bg-[#f3f6fa]'
                      )}
                      title={overlay.label}
                    >
                      <overlay.icon size={15} />
                      {overlay.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {viewMode === 'floorplan' && hasFloorPlan && (
                <>
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={requestCancelEditing}
                        className="flex h-9 items-center gap-2 rounded-md border border-[#dfe6ef] bg-white px-3 text-[13px] font-medium text-[#596579] transition hover:bg-[#f6f8fb]"
                      >
                        <X size={15} />
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={saveEditingSession}
                        className="flex h-9 items-center gap-2 rounded-md bg-[#165dff] px-3 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(22,93,255,0.18)] transition hover:brightness-110"
                      >
                        <Save size={15} />
                        保存
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={startEditing}
                      className="flex h-9 items-center gap-2 rounded-md border border-[#dfe6ef] bg-white px-3 text-[13px] font-medium text-[#2f3948] transition hover:bg-[#f6f8fb]"
                    >
                      <PencilLine size={15} />
                      编辑
                    </button>
                  )}
                  {isEditing && hasUnsavedEdits && (
                    <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[12px] font-medium text-[#d97706]">未保存</span>
                  )}
                  <IconButton icon={Settings2} label="设置" onClick={() => setSettingsOpen(open => !open)} />
                </>
              )}
            </div>
          </div>

          {settingsOpen && viewMode === 'floorplan' && hasFloorPlan && (
            <SettingsPanel
              iconScale={iconScale}
              labelDensity={labelDensity}
              showDeviceName={showDeviceName}
              showDeviceModel={showDeviceModel}
              showConnectivity={showConnectivity}
              coverageOpacity={coverageOpacity}
              wallsOpacity={wallsOpacity}
              furnitureOpacity={furnitureOpacity}
              onIconScale={setIconScale}
              onLabelDensity={setLabelDensity}
              onShowDeviceName={setShowDeviceName}
              onShowDeviceModel={setShowDeviceModel}
              onShowConnectivity={setShowConnectivity}
              onCoverageOpacity={setCoverageOpacity}
              onWallsOpacity={setWallsOpacity}
              onFurnitureOpacity={setFurnitureOpacity}
              onRestore={() => {
                setIconScale(0.62);
                setLabelDensity(1);
                setShowDeviceName(true);
                setShowDeviceModel(false);
                setShowConnectivity(true);
                setCoverageOpacity(0.7);
                setWallsOpacity(1);
                setFurnitureOpacity(0.82);
              }}
            />
          )}

          {viewMode === 'floorplan' && hasFloorPlan && !scaleSet && selectedTool !== 'scale' && (
            <div className="absolute left-1/2 top-14 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#34383f] px-4 py-2 text-[13px] text-white shadow-[0_14px_34px_rgba(15,23,42,0.22)]">
              <Upload size={14} className="text-white/80" />
              <span>Set your <strong>Floor Plan Scale</strong> for accurate coverage depiction.</span>
              <button
                type="button"
                onClick={() => {
                  startEditing();
                  setSelectedTool('scale');
                  setScaleDraft(null);
                }}
                className="rounded-full bg-[#3d8bff] px-3 py-1 text-[12px] font-semibold text-white"
              >
                Set Scale
              </button>
            </div>
          )}

          {viewMode === 'floorplan' && hasFloorPlan && selectedTool === 'connection' && (
            <ToolNotice
              text="Drag or Left Click to manually connect devices. Esc or Right Click to cancel, hold Shift to disable snapping."
              action="Cancel"
              onAction={() => {
                setConnectionDraft(null);
                setSelectedTool('select');
              }}
            />
          )}

          {viewMode === 'floorplan' && hasFloorPlan && selectedTool === 'align' && (
            <ToolNotice
              text="Current floor plan is locked. Drag the projected floor plan and resize its corners to align. Esc to cancel."
              action="Done"
              onAction={() => setSelectedTool('select')}
            />
          )}

          {viewMode === 'floorplan' && hasFloorPlan && selectedTool === 'scale' && (
            <ToolNotice
              text="Drag or Left Mouse Click to draw a line, then enter the length it represents."
              action="Cancel"
              onAction={() => {
                setScaleDraft(null);
                setSelectedTool('select');
              }}
            />
          )}

          {viewMode === 'floorplan' && hasFloorPlan && selectedTool === 'align' && (
            <AlignFloorPlansPanel
              activeFloor={activeFloor}
              floors={workspace.floors}
              overlay={floorOverlay}
              onSelect={floorId => {
                const floor = workspace.floors.find(item => item.id === floorId);
                setFloorOverlay(current => ({
                  ...current,
                  id: floorId,
                  label: floor?.label ?? current.label,
                }));
              }}
            />
          )}

          {viewMode === 'floorplan' && hasFloorPlan && (
          <div className="absolute left-3 top-16 z-20 flex flex-col gap-2">
            <IconToggle icon={LayoutGrid} label="网格" active={showGrid} onClick={() => setShowGrid(value => !value)} />
            <IconToggle icon={showLabels ? Eye : EyeOff} label="标签" active={showLabels} onClick={() => setShowLabels(value => !value)} />
            <IconToggle icon={Layers} label="家具" active={showFurniture} onClick={() => setShowFurniture(value => !value)} />
            <div className="overflow-hidden rounded-lg border border-[#d8dee8] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
              <IconButton icon={Plus} label="放大" bare onClick={() => setZoom(value => Math.min(ZOOM_MAX, +(value + 0.08).toFixed(2)))} />
              <IconButton
                icon={Maximize2}
                label="适配"
                bare
                onClick={() => {
                  setZoom(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
              />
              <IconButton icon={Minus} label="缩小" bare onClick={() => setZoom(value => Math.max(ZOOM_MIN, +(value - 0.08).toFixed(2)))} />
            </div>
          </div>
          )}

          <div
            className={cn(
              'absolute inset-0',
              showGrid &&
                'bg-[linear-gradient(to_right,rgba(123,135,153,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(123,135,153,0.12)_1px,transparent_1px)] [background-size:32px_32px]'
            )}
          />

          {viewMode === 'floorplan' && hasFloorPlan ? (
          <div className="relative flex h-full items-center justify-center overflow-auto px-20 pb-24 pt-20">
            <div
              ref={planRef}
              onPointerDown={beginPlanPan}
              onPointerMove={handlePlanPointerMove}
              onPointerUp={handlePlanPointerUp}
              onPointerCancel={finishDrag}
              onContextMenu={event => {
                event.preventDefault();
                cancelActiveToolDraft();
                if (selectedTool === 'connection' || selectedTool === 'align' || selectedTool === 'scale') setSelectedTool('select');
              }}
              onClick={placeUnassignedDevice}
              className={cn(
                'relative aspect-[1600/920] w-full max-w-[1480px] transform-gpu',
                !panDragState && 'transition-transform duration-200',
                (dragState || panDragState) && 'cursor-grabbing',
                isCanvasPanMode && !panDragState && 'cursor-grab',
                isEditing && selectedUnassignedDevice && !isCanvasPanMode && 'cursor-crosshair'
              )}
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className="h-full w-full">
                <rect x="0" y="0" width={VIEWBOX_W} height={VIEWBOX_H} fill="#fbfcfe" />

                <g opacity={showFurniture ? 1 : 0.46}>
                  {activeFloor.rooms.map(room => (
                    <g key={room.id}>
                      <RoomShape
                        room={room}
                        selected={room.id === selectedRoom?.id && !selectedDevice && !selectedFurniture}
                        layer={activeLayer}
                        showLabels={showLabels}
                        showMeasurements={selectedTool === 'measure'}
                        wallsOpacity={wallsOpacity}
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setSelectedDeviceId(null);
                          setSelectedFurnitureId(null);
                          setSelectedUnassignedDeviceId(null);
                          setActiveDeviceMenuId(null);
                        }}
                        onPointerDown={event => beginRoomDrag(event, room)}
                        draggable={canEditObjects}
                        panMode={isCanvasPanMode}
                      />
                      {showFurniture && room.furniture.map(item => (
                        <Furniture
                          key={item.id}
                          item={item}
                          selected={item.id === selectedFurniture?.id}
                          draggable={canEditObjects}
                          opacity={furnitureOpacity}
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setSelectedFurnitureId(item.id);
                            setSelectedDeviceId(null);
                            setSelectedUnassignedDeviceId(null);
                            setActiveDeviceMenuId(null);
                          }}
                          onPointerDown={event => beginFurnitureDrag(event, room, item)}
                          panMode={isCanvasPanMode}
                        />
                      ))}
                    </g>
                  ))}
                </g>

                <g>
                  {activeFloor.doors.map(door => (
                    <g key={door.id}>
                      <line x1={door.x1} y1={door.y1} x2={door.x2} y2={door.y2} stroke="#c7811d" strokeWidth="5" strokeLinecap="round" />
                      <path d={door.arc} fill="none" stroke="#cfd7e3" strokeWidth="2" />
                    </g>
                  ))}
                </g>

                <g>
                  {activeFloor.windows.map(item => (
                    <line key={item.id} x1={item.x1} y1={item.y1} x2={item.x2} y2={item.y2} stroke="#75c7e8" strokeWidth="6" strokeLinecap="round" />
                  ))}
                </g>

                <g>
                  {activeConnections.map(connection => {
                    const source = activeDevices.find(device => device.id === connection.sourceId);
                    const target = activeDevices.find(device => device.id === connection.targetId);
                    if (!source || !target) return null;
                    return (
                      <ConnectionLine
                        key={connection.id}
                        source={source}
                        target={target}
                        active={selectedTool === 'connection' || selectedDevice?.id === source.id || selectedDevice?.id === target.id}
                      />
                    );
                  })}
                  {connectionDraft && (() => {
                    const source = activeDevices.find(device => device.id === connectionDraft.sourceId);
                    if (!source) return null;
                    return <DraftLine source={{ x: source.x, y: source.y }} target={connectionDraft.current} />;
                  })()}
                </g>

                {(activeLayer === 'coverage' || selectedDevice?.coverage?.length) && (
                  <g>
                    {devicesWithCoverage.map(device => (
                      <g key={`${device.id}-coverage`}>
                        {device.coverage?.map(coverage => (
                          <CoverageShape
                            key={coverage.id}
                            x={device.x}
                            y={device.y}
                            coverage={coverage}
                            color={DEVICE_META[device.kind].color}
                            highlight={activeLayer === 'coverage' || selectedDevice?.id === device.id}
                            editable={canAdjustCoverage && selectedDevice?.id === device.id}
                            opacity={coverageOpacity}
                            onRotationPointerDown={event => beginCoverageAdjustment(event, device, coverage, 'rotation')}
                            onRadiusPointerDown={event => beginCoverageAdjustment(event, device, coverage, 'radius')}
                          />
                        ))}
                      </g>
                    ))}
                  </g>
                )}

                {selectedTool === 'scale' && scaleDraft && (
                  <ScaleLine draft={scaleDraft} length={scaleLength} />
                )}

                {selectedTool === 'align' && (
                  <FloorOverlayShape
                    overlay={floorOverlay}
                    onPointerDown={event => beginFloorOverlayDrag(event, 'move')}
                    onResizePointerDown={(event, corner) => beginFloorOverlayDrag(event, corner)}
                  />
                )}

                {selectedTool === 'wall' && (
                  <g>
                    {activeFloor.rooms.map(room => (
                      <g key={`${room.id}-handles`}>
                        {[
                          { x: room.x, y: room.y },
                          { x: room.x + room.w, y: room.y },
                          { x: room.x, y: room.y + room.h },
                          { x: room.x + room.w, y: room.y + room.h },
                        ].map((point, index) => (
                          <circle key={index} cx={point.x} cy={point.y} r={7} fill="#ffffff" stroke="#165dff" strokeWidth="3" />
                        ))}
                      </g>
                    ))}
                  </g>
                )}
              </svg>

              <div className="pointer-events-none absolute inset-0">
                {visibleDevices.map(device => (
                  <DeviceMarker
                    key={device.id}
                    device={device}
                    selected={device.id === selectedDevice?.id}
                    showLabel={showLabels && showDeviceName && labelDensity > 0}
                    showModel={showLabels && showDeviceModel && labelDensity > 1}
                    showConnectivity={showConnectivity}
                    iconScale={iconScale}
                    onClick={() => {
                      if (selectedTool === 'connection') {
                        handleDeviceConnectionClick(device);
                        return;
                      }
                      setSelectedDeviceId(device.id);
                      setSelectedRoomId(device.roomId);
                      setSelectedFurnitureId(null);
                      setSelectedUnassignedDeviceId(null);
                      setActiveDeviceMenuId(null);
                    }}
                    onPointerDown={event => (
                      selectedTool === 'connection'
                        ? beginConnectionDrag(event, device)
                        : beginDeviceDrag(event, device)
                    )}
                    draggable={canEditObjects}
                    panMode={isCanvasPanMode}
                  />
                ))}
              </div>
            </div>
          </div>
          ) : viewMode === 'floorplan' ? (
            <FloorPlanEmptyState onOpenGraph={() => setViewMode('graph')} onCreateFloorPlan={createLocalFloorPlan} />
          ) : (
            <SpaceGraphCanvas
              buildingName={buildingTypeName}
              floors={workspace.floors}
              devices={workspace.devices}
              selectedBuilding={selectedBuilding}
              selectedFloorId={selectedFloorId}
              selectedRoomId={selectedRoom?.id ?? null}
              selectedDeviceId={selectedDevice?.id ?? null}
              selectedFurnitureId={selectedFurniture?.id ?? null}
              onSelectBuilding={openAllSpaces}
              onSelectFloor={selectFloor}
              onSelectRoom={(floorId, roomId) => {
                if (floorId !== selectedFloorId) selectFloor(floorId);
                setSelectedRoomId(roomId);
                setSelectedDeviceId(null);
                setSelectedFurnitureId(null);
                setSelectedUnassignedDeviceId(null);
                setActiveDeviceMenuId(null);
              }}
              onSelectDevice={(floorId, device) => {
                if (floorId !== selectedFloorId) selectFloor(floorId);
                setSelectedRoomId(device.roomId);
                setSelectedDeviceId(device.id);
                setSelectedFurnitureId(null);
                setSelectedUnassignedDeviceId(null);
                setActiveDeviceMenuId(null);
              }}
              onSelectFurniture={(floorId, roomId, item) => {
                if (floorId !== selectedFloorId) selectFloor(floorId);
                setSelectedRoomId(roomId);
                setSelectedFurnitureId(item.id);
                setSelectedDeviceId(null);
                setSelectedUnassignedDeviceId(null);
                setActiveDeviceMenuId(null);
              }}
            />
          )}

          {viewMode === 'floorplan' && hasFloorPlan && isEditing && (
            <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
            <div className="flex items-center gap-1 rounded-lg border border-[#d8dee8] bg-white p-1 shadow-[0_14px_36px_rgba(15,23,42,0.12)]">
              {TOOL_OPTIONS.map(tool => (
                <ToolButton
                  key={tool.id}
                  active={effectiveTool === tool.id}
                  icon={tool.icon}
                  label={tool.label}
                  description={tool.description}
                  onClick={() => handleTool(tool.id)}
                />
              ))}
            </div>
            </div>
          )}

          {viewMode === 'floorplan' && hasFloorPlan && (
          <div className="absolute bottom-3 right-3 z-20 rounded-md border border-[#d8dee8] bg-white px-3 py-2 text-[12px] text-[#697386] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
            {Math.round(zoom * 100)}%
          </div>
          )}

          {viewMode === 'floorplan' && hasFloorPlan && selectedTool === 'scale' && scaleDraft?.committed && (
            <ScaleInputPanel
              value={scaleLength}
              onChange={setScaleLength}
              onRedraw={() => setScaleDraft(null)}
              onSave={() => {
                setScaleSet(true);
                setSelectedTool('select');
              }}
            />
          )}
        </main>

        {showInspectorPanel && (
        <aside className="min-h-0 overflow-hidden rounded-lg border border-[#d8dee8] bg-white">
          <div className="flex h-12 items-center justify-between border-b border-[#e8edf3] px-4">
            <div className="text-[15px] font-semibold text-[#1d2430]">属性</div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[#8a94a5]">{activeFloor.label}</span>
              <button
                type="button"
                onClick={clearInspectorSelection}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dfe6ef] bg-white px-2.5 text-[12px] font-medium text-[#596579] transition hover:bg-[#f6f8fb]"
              >
                <X size={13} />
                取消
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-48px)] overflow-y-auto p-4">
            {selectedDevice ? (
              <DeviceInspector
                device={selectedDevice}
                rooms={activeFloor.rooms}
                isEditing={isEditing}
                onPatch={patch => updateDevice(selectedDevice.id, patch)}
                onPatchCoverage={(coverageId, patch) => updateDeviceCoverage(selectedDevice.id, coverageId, patch)}
                onMoveToRoom={roomId => moveDeviceToRoom(selectedDevice.id, roomId)}
                onMoveToPoint={(x, y) => moveDeviceTo(selectedDevice.id, x, y)}
                onDelete={removeDevice}
              />
            ) : selectedUnassignedDevice ? (
              <UnassignedDeviceInspector
                device={selectedUnassignedDevice}
                targetRoom={placementRoom}
                isEditing={isEditing}
                onStartEdit={startEditing}
                onAssignToRoom={() => {
                  startEditing();
                  if (!placementRoom) return;
                  const anchor = placementRoom.anchors[0] ?? { x: placementRoom.x + placementRoom.w / 2, y: placementRoom.y + placementRoom.h / 2 };
                  const device: DeviceModel = {
                    ...selectedUnassignedDevice,
                    roomId: placementRoom.id,
                    x: anchor.x,
                    y: anchor.y,
                    localPosition: toLocalPosition(anchor.x, anchor.y),
                    install: inferInstallText(selectedUnassignedDevice.kind),
                    status: 'online',
                    automations: placementRoom.automations.slice(0, 2),
                  };
                  commitWorkspace({
                    ...workspace,
                    devices: {
                      ...workspace.devices,
                      [selectedFloorId]: [...activeDevices, device],
                    },
                    unassignedDevices: workspace.unassignedDevices.filter(item => item.id !== selectedUnassignedDevice.id),
                  });
                  setSelectedUnassignedDeviceId(null);
                  setSelectedDeviceId(device.id);
                  setSelectedRoomId(placementRoom.id);
                  setSelectedFurnitureId(null);
                }}
              />
            ) : selectedFurniture && selectedFurnitureRoom ? (
              <FurnitureInspector
                item={selectedFurniture}
                room={selectedFurnitureRoom}
                isEditing={isEditing}
                onPatch={patch => updateFurniture(selectedFurniture.id, patch)}
                onDuplicate={duplicateFurniture}
                onDelete={removeFurniture}
              />
            ) : selectedRoom ? (
              <RoomInspector
                room={selectedRoom}
                deviceCount={selectedRoomDevices.length}
                isEditing={isEditing}
                onPatch={patch => updateRoom(selectedRoom.id, patch)}
                onDuplicate={duplicateRoom}
                onDelete={removeRoom}
                onAddFurniture={addFurniture}
              />
            ) : (
              <FloorInspector
                floor={activeFloor}
                deviceCount={activeDevices.length}
                unassignedCount={workspace.unassignedDevices.length}
                isEditing={isEditing}
                onAddRoom={addRoom}
              />
            )}

            {!isEditing && (
              <GraphRelationsPanel
                relations={selectedRelations.length > 0 ? selectedRelations : graphRelations.slice(0, 8)}
              />
            )}

          </div>
        </aside>
        )}
      </div>

      {unsavedDialogOpen && (
        <UnsavedEditDialog
          onDiscard={discardEditingSession}
          onContinue={() => setUnsavedDialogOpen(false)}
        />
      )}

      {manageFloorPlansOpen && (
        <ManageFloorPlansDialog
          buildingName={buildingTypeName}
          floors={workspace.floors}
          selectedFloorId={selectedFloorId}
          onSelectFloor={selectFloor}
          onClose={() => setManageFloorPlansOpen(false)}
        />
      )}
    </div>
  );
}

function ManageFloorPlansDialog({
  buildingName,
  floors,
  selectedFloorId,
  onSelectFloor,
  onClose,
}: {
  buildingName: string;
  floors: FloorModel[];
  selectedFloorId: FloorId;
  onSelectFloor: (floorId: FloorId) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-[#0b1220]/18 px-4 backdrop-blur-[1px]">
      <div className="w-full max-w-[390px] rounded-2xl border border-[#d8dee8] bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="flex h-8 items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Building2 size={16} className="text-[#64748b]" />
            <span className="truncate text-[14px] font-semibold text-[#111827]">Manage Floor Plans</span>
            <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-[11px] font-medium text-[#165dff]">{buildingName}</span>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-[#64748b] transition hover:bg-[#f6f8fb]">
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 rounded-xl bg-[#f8fafc] p-3">
          <div className="flex items-center justify-between text-[12px] text-[#64748b]">
            <span>Units of measurement</span>
            <span><span className="font-semibold text-[#165dff]">m</span> / ft</span>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_82px_70px_22px] gap-2 text-[12px] font-semibold text-[#202938]">
            <span>Floor Plans</span>
            <span>Attenuation</span>
            <span>Height</span>
            <span />
          </div>

          <div className="mt-2 divide-y divide-[#e5ebf3]">
            {floors.map((floor, index) => (
              <button
                key={floor.id}
                type="button"
                onClick={() => onSelectFloor(floor.id)}
                className={cn(
                  'grid h-9 w-full grid-cols-[1fr_82px_70px_22px] items-center gap-2 text-left text-[12px] transition',
                  floor.id === selectedFloorId ? 'text-[#165dff]' : 'text-[#4b5565] hover:text-[#202938]'
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <MapIcon size={14} className="shrink-0 text-[#64748b]" />
                  <span className="truncate">{floor.label} {floor.name}</span>
                </span>
                <span className="text-[#64748b]">{index === 0 ? '20 dB' : '18 dB'}</span>
                <span className="text-[#64748b]">{index === 0 ? '2.7 m' : '5.7 m'}</span>
                <MoreHorizontal size={15} className="text-[#94a3b8]" />
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2 text-[13px] font-medium text-[#165dff]">
            <button type="button" className="block transition hover:underline">Upload Floor Plan</button>
            <button type="button" className="block transition hover:underline">Add Location</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnsavedEditDialog({
  onDiscard,
  onContinue,
}: {
  onDiscard: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0b1220]/38 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#d8dee8] bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
        <div className="text-[18px] font-semibold text-[#111827]">修改尚未保存，确定退出？</div>
        <div className="mt-2 text-[13px] leading-6 text-[#64748b]">
          退出后，本次编辑的户型图点位与空间关系将不会保留。
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onContinue}
            className="flex h-10 items-center justify-center rounded-md border border-[#dfe6ef] bg-white text-[13px] font-semibold text-[#4b5565] transition hover:bg-[#f6f8fb]"
          >
            继续编辑
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="flex h-10 items-center justify-center rounded-md bg-[#165dff] text-[13px] font-semibold text-white transition hover:brightness-110"
          >
            退出
          </button>
        </div>
      </div>
    </div>
  );
}

function InitialFloorPlanGuide({ onStart }: { onStart: (origin: Exclude<FloorPlanOrigin, 'empty'>) => void }) {
  const [pendingOrigin, setPendingOrigin] = useState<Exclude<FloorPlanOrigin, 'empty'> | null>(null);
  const loadingTimerRef = useRef<number | null>(null);
  const templates: Array<{ id: Exclude<FloorPlanOrigin, 'empty'>; title: string; detail: string; icon: LucideIcon }> = [
    { id: 'template', title: '一层公寓', detail: '标准房间结构', icon: Home },
    { id: 'template', title: '一层住宅', detail: '庭院与居住空间', icon: Building2 },
    { id: 'template', title: '两层住宅', detail: '上下楼层图谱', icon: Layers },
    { id: 'template', title: '民宿', detail: '公共区与客房', icon: DoorOpen },
  ];
  const loadingCopy: Record<Exclude<FloorPlanOrigin, 'empty'>, { title: string; steps: string[] }> = {
    builder: {
      title: '正在导入云端方案',
      steps: ['连接 Studio Cloud', '读取 Builder 方案', '初始化运行图'],
    },
    upload: {
      title: '正在创建本地户型图',
      steps: ['读取户型底图', '准备墙体描绘', '等待设置比例尺'],
    },
    custom: {
      title: '正在创建空间图谱',
      steps: ['初始化楼层', '创建空间树', '进入图谱视图'],
    },
    template: {
      title: '正在生成空间结构',
      steps: ['创建楼层', '生成房间层级', '进入图谱视图'],
    },
  };
  const pendingCopy = pendingOrigin ? loadingCopy[pendingOrigin] : null;

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
    };
  }, []);

  const beginCreate = (origin: Exclude<FloorPlanOrigin, 'empty'>) => {
    if (pendingOrigin) return;
    setPendingOrigin(origin);
    loadingTimerRef.current = window.setTimeout(() => {
      onStart(origin);
    }, 980);
  };

  return (
    <div className="h-[calc(100vh-64px)] min-h-[760px] p-3">
      <div className="relative h-full overflow-hidden rounded-xl border border-[#d8dee8] bg-white">
        <div className={cn('h-full transition duration-200', pendingOrigin && 'pointer-events-none select-none opacity-35')}>
          <div className="px-7 py-6">
            <div className="text-[22px] font-semibold text-[#111827]">空间管理</div>
          </div>

          <div className="px-7 pb-7">
            <div className="rounded-xl border border-[#e3e8ef] bg-white p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="relative overflow-hidden rounded-xl border border-[#b9ccff] bg-[#f8fbff] p-5">
                  <span className="absolute right-5 top-5 rounded-full bg-[#165dff] px-2.5 py-1 text-[11px] font-semibold text-white">推荐</span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eaf1ff] text-[#165dff]">
                    <MapIcon size={22} />
                  </div>
                  <div className="mt-4 text-[17px] font-semibold text-[#1d2430]">Builder 创作</div>
                  <div className="mt-2 text-[13px] text-[#7d8795]">云端设计户型方案，部署到本地 Studio。</div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href="/build?entry=pro"
                      className="inline-flex h-10 items-center rounded-md bg-[#165dff] px-4 text-[14px] font-semibold text-white shadow-[0_12px_24px_rgba(22,93,255,0.22)] transition hover:brightness-110"
                    >
                      前往 Builder
                    </Link>
                    <button
                      type="button"
                      onClick={() => beginCreate('builder')}
                      className="inline-flex h-10 items-center rounded-md border border-[#dbe3ef] bg-white px-4 text-[14px] font-semibold text-[#202938] transition hover:border-[#bfd5ff] hover:bg-[#f7faff]"
                    >
                      导入方案
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => beginCreate('custom')}
                  className="group rounded-xl border border-[#d8dee8] bg-white p-5 text-left transition hover:border-[#165dff] hover:bg-[#f8fbff]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#edf3ff] text-[#315dff] transition group-hover:bg-[#165dff] group-hover:text-white">
                    <LayoutGrid size={22} />
                  </div>
                  <div className="mt-4 text-[17px] font-semibold text-[#1d2430]">本地创作</div>
                  <div className="mt-2 text-[13px] text-[#7d8795]">离线创建空间图谱，不展示户型图。</div>
                </button>
              </div>

              <div className="mt-7 text-[15px] font-semibold text-[#1d2430]">空间模板</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {templates.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`${item.title}-${index}`}
                      type="button"
                      onClick={() => beginCreate(item.id)}
                      className="group flex h-[96px] items-center gap-4 rounded-lg border border-[#d8dee8] bg-white px-4 text-left transition hover:border-[#165dff] hover:bg-[#f8fbff]"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[#edf3ff] text-[#315dff] transition group-hover:bg-[#165dff] group-hover:text-white">
                        <Icon size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold text-[#1d2430]">{item.title}</span>
                        <span className="mt-1 block text-[12px] leading-5 text-[#7d8795]">{item.detail}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {pendingCopy && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/82 backdrop-blur-[2px]">
            <div className="w-[360px] rounded-2xl border border-[#d8dee8] bg-white p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf3ff]">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#bfd5ff] border-t-[#165dff]" />
              </div>
              <div className="mt-4 text-[17px] font-semibold text-[#111827]">{pendingCopy.title}</div>
              <div className="mt-4 space-y-2 text-left">
                {pendingCopy.steps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-lg bg-[#f7f9fc] px-3 py-2">
                    <span className={cn('h-2 w-2 rounded-full', index === 0 ? 'bg-[#165dff]' : 'bg-[#cbd5e1]')} />
                    <span className="text-[13px] text-[#4b5565]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FloorPlanEmptyState({
  onOpenGraph,
  onCreateFloorPlan,
}: {
  onOpenGraph: () => void;
  onCreateFloorPlan: () => void;
}) {
  return (
    <div className="relative flex h-full items-center justify-center px-8 pt-16">
      <div className="w-full max-w-[520px] rounded-2xl border border-[#d8dee8] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#edf3ff] text-[#165dff]">
          <MapIcon size={26} />
        </div>
        <div className="mt-5 text-[22px] font-semibold text-[#111827]">暂无户型图</div>
        <div className="mt-2 text-[13px] leading-6 text-[#7d8795]">
          当前项目只有空间图谱。可从 Builder 部署户型方案，或在本地上传底图后补充户型图。
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/build?entry=pro" className="inline-flex h-10 items-center rounded-md bg-[#165dff] px-4 text-[14px] font-semibold text-white">
            前往 Builder
          </Link>
          <button
            type="button"
            onClick={onCreateFloorPlan}
            className="inline-flex h-10 items-center rounded-md border border-[#dbe3ef] bg-white px-4 text-[14px] font-semibold text-[#202938] transition hover:bg-[#f7faff]"
          >
            本地添加户型图
          </button>
          <button
            type="button"
            onClick={onOpenGraph}
            className="inline-flex h-10 items-center rounded-md border border-[#dbe3ef] bg-[#f8fafc] px-4 text-[14px] font-semibold text-[#596579] transition hover:bg-white"
          >
            查看图谱
          </button>
        </div>
      </div>
    </div>
  );
}

function SpaceGraphCanvas({
  buildingName,
  floors,
  devices,
  selectedBuilding,
  selectedFloorId,
  selectedRoomId,
  selectedDeviceId,
  selectedFurnitureId,
  onSelectBuilding,
  onSelectFloor,
  onSelectRoom,
  onSelectDevice,
  onSelectFurniture,
}: {
  buildingName: string;
  floors: FloorModel[];
  devices: Record<FloorId, DeviceModel[]>;
  selectedBuilding: boolean;
  selectedFloorId: FloorId;
  selectedRoomId: string | null;
  selectedDeviceId: string | null;
  selectedFurnitureId: string | null;
  onSelectBuilding: () => void;
  onSelectFloor: (floorId: FloorId) => void;
  onSelectRoom: (floorId: FloorId, roomId: string) => void;
  onSelectDevice: (floorId: FloorId, device: DeviceModel) => void;
  onSelectFurniture: (floorId: FloorId, roomId: string, item: FurnitureItem) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, Point>>({});
  const [graphDrag, setGraphDrag] = useState<{ id: string; start: Point; offset: Point } | null>(null);
  const [graphPan, setGraphPan] = useState<Point>({ x: 0, y: 0 });
  const [graphPanDrag, setGraphPanDrag] = useState<{ start: Point; offset: Point } | null>(null);
  const graphWidth = 960;
  const graphHeight = 620;
  const hasRooms = floors.some(floor => floor.rooms.length > 0);
  const floorCenters = floors.map((floor, index) => ({
    floor,
    offsetX: floors.length === 1 ? 0 : -130 + index * 260,
    offsetY: 160 + index * 130,
  }));

  const toGraphPoint = (event: ReactPointerEvent<SVGSVGElement | SVGGElement>): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const transformed = point.matrixTransform(matrix.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const resolvePoint = (id: string, x: number, y: number) => {
    const offset = nodeOffsets[id] ?? { x: 0, y: 0 };
    return { id, x: x + offset.x, y: y + offset.y };
  };

  const beginGraphDrag = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setGraphDrag({ id, start: toGraphPoint(event), offset: nodeOffsets[id] ?? { x: 0, y: 0 } });
  };

  const beginGraphPan = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 || graphDrag) return;
    const target = event.target as Element;
    if (target.closest?.('[data-graph-node="true"]')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setGraphPanDrag({ start: toGraphPoint(event), offset: graphPan });
  };

  const handleGraphMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const point = toGraphPoint(event);
    if (graphDrag) {
      setNodeOffsets(current => ({
        ...current,
        [graphDrag.id]: {
          x: graphDrag.offset.x + point.x - graphDrag.start.x,
          y: graphDrag.offset.y + point.y - graphDrag.start.y,
        },
      }));
      return;
    }
    if (graphPanDrag) {
      setGraphPan({
        x: graphPanDrag.offset.x + point.x - graphPanDrag.start.x,
        y: graphPanDrag.offset.y + point.y - graphPanDrag.start.y,
      });
    }
  };

  const finishGraphDrag = () => {
    setGraphDrag(null);
    setGraphPanDrag(null);
  };

  if (!hasRooms) {
    return (
      <div className="relative flex h-full items-center justify-center px-8 pt-16">
        <div className="w-full max-w-[460px] rounded-2xl border border-[#d8dee8] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#edf3ff] text-[#165dff]">
            <Workflow size={26} />
          </div>
          <div className="mt-5 text-[22px] font-semibold text-[#111827]">空间图谱已创建</div>
          <div className="mt-2 text-[13px] leading-6 text-[#7d8795]">
            通过左侧空间树新增房间、楼层和设备归属关系；需要真实户型时再切换到户型图补充底图。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden px-12 pt-16">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${graphWidth} ${graphHeight}`}
        className={cn('h-full w-full max-w-[1040px]', graphPanDrag ? 'cursor-grabbing' : 'cursor-grab')}
        onPointerDown={beginGraphPan}
        onPointerMove={handleGraphMove}
        onPointerUp={finishGraphDrag}
        onPointerLeave={finishGraphDrag}
      >
        <defs>
          <marker id="space-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#cbd5e1" />
          </marker>
        </defs>
        <g transform={`translate(${graphPan.x} ${graphPan.y})`}>
        {(() => {
          const buildingNode = resolvePoint('building:root', graphWidth / 2, 92);
          return (
            <g>
              <GraphNode
                x={buildingNode.x}
                y={buildingNode.y}
                label={buildingName}
                selected={selectedBuilding}
                color="#0f172a"
                large
                onClick={onSelectBuilding}
                onPointerDown={event => beginGraphDrag(event, buildingNode.id)}
              />
              {floorCenters.map(({ floor, offsetX, offsetY }) => {
          const rooms = floor.rooms;
          const radius = rooms.length > 5 ? 168 : 132;
          const floorNode = resolvePoint(`floor:${floor.id}`, buildingNode.x + offsetX, buildingNode.y + offsetY);
          return (
            <g key={floor.id}>
              <GraphEdge from={floorNode} to={buildingNode} label="belongsTo" />
              {rooms.map((room, index) => {
                const angle = (Math.PI * 2 * index) / Math.max(rooms.length, 1) - Math.PI / 2;
                const roomNode = resolvePoint(
                  `room:${floor.id}:${room.id}`,
                  floorNode.x + Math.cos(angle) * radius,
                  floorNode.y + Math.sin(angle) * radius
                );
                const roomDevices = (devices[floor.id] ?? []).filter(device => device.roomId === room.id);
                const roomEntities = room.furniture;
                const orbitCount = Math.max(roomDevices.length + roomEntities.length, 1);
                return (
                  <g key={room.id}>
                    <GraphEdge from={roomNode} to={floorNode} label="belongsTo" />
                    <GraphNode
                      x={roomNode.x}
                      y={roomNode.y}
                      label={room.name}
                      selected={room.id === selectedRoomId}
                      color="#315dff"
                      onClick={() => onSelectRoom(floor.id, room.id)}
                      onPointerDown={event => beginGraphDrag(event, roomNode.id)}
                    />
                    {roomEntities.map((item, entityIndex) => {
                      const entityAngle = angle + ((entityIndex + 1) / (orbitCount + 1) - 0.5) * 1.05;
                      const entityNode = resolvePoint(
                        `furniture:${item.id}`,
                        roomNode.x + Math.cos(entityAngle) * 64,
                        roomNode.y + Math.sin(entityAngle) * 64
                      );
                      return (
                        <g key={item.id}>
                          <GraphEdge from={entityNode} to={roomNode} label={entityIndex === 0 ? 'belongsTo' : undefined} subtle />
                          <GraphNode
                            x={entityNode.x}
                            y={entityNode.y}
                            label={item.name ?? FURNITURE_META[item.kind].label}
                            selected={item.id === selectedFurnitureId}
                            color="#2fbf65"
                            compact
                            onClick={() => onSelectFurniture(floor.id, room.id, item)}
                            onPointerDown={event => beginGraphDrag(event, entityNode.id)}
                          />
                        </g>
                      );
                    })}
                    {roomDevices.map((device, deviceIndex) => {
                      const deviceAngle = angle + ((deviceIndex + roomEntities.length + 1) / (orbitCount + 1) - 0.5) * 1.05;
                      const deviceNode = resolvePoint(
                        `device:${device.id}`,
                        roomNode.x + Math.cos(deviceAngle) * 76,
                        roomNode.y + Math.sin(deviceAngle) * 76
                      );
                      return (
                        <g key={device.id}>
                          <GraphEdge from={deviceNode} to={roomNode} label={deviceIndex === 0 ? 'isInstalledIn' : undefined} subtle />
                          <GraphNode
                            x={deviceNode.x}
                            y={deviceNode.y}
                            label={device.name}
                            selected={device.id === selectedDeviceId}
                            color={device.bindingStatus === 'unboundPoint' ? '#f97316' : '#f59e0b'}
                            compact
                            muted={device.bindingStatus === 'unboundPoint'}
                            onClick={() => onSelectDevice(floor.id, device)}
                            onPointerDown={event => beginGraphDrag(event, deviceNode.id)}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })}
              <GraphNode
                x={floorNode.x}
                y={floorNode.y}
                label={`${floor.label} ${floor.name}`}
                selected={!selectedBuilding && floor.id === selectedFloorId && !selectedRoomId}
                color="#315dff"
                large
                onClick={() => onSelectFloor(floor.id)}
                onPointerDown={event => beginGraphDrag(event, floorNode.id)}
              />
            </g>
          );
              })}
            </g>
          );
        })()}
        </g>
      </svg>
      <div className="pointer-events-none absolute right-5 top-16 rounded-full border border-[#d8dee8] bg-white/92 px-3 py-1.5 text-[12px] font-medium text-[#64748b] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
        拖动楼层/房间整理子图，拖动画布平移
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-5 rounded-xl border border-[#e4eaf1] bg-white px-5 py-3 text-[14px] text-[#64748b] shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <LegendDot color="#315dff" label="空间" />
        <LegendDot color="#2fbf65" label="实体" />
        <LegendDot color="#f59e0b" label="设备" />
      </div>
    </div>
  );
}

function GraphEdge({
  from,
  to,
  label,
  subtle,
}: {
  from: Point;
  to: Point;
  label?: string;
  subtle?: boolean;
}) {
  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={subtle ? '#e2e8f0' : '#d8dee8'}
        strokeWidth={subtle ? 1.4 : 2}
        markerEnd="url(#space-arrow)"
      />
      {label && (
        <text x={(from.x + to.x) / 2 - 34} y={(from.y + to.y) / 2 - 8} fontSize="12" fill="#a5afbf">
          {label}
        </text>
      )}
    </g>
  );
}

function GraphNode({
  x,
  y,
  label,
  color,
  selected,
  large,
  compact,
  muted,
  onClick,
  onPointerDown,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
  selected?: boolean;
  large?: boolean;
  compact?: boolean;
  muted?: boolean;
  onClick: () => void;
  onPointerDown: (event: ReactPointerEvent<SVGGElement>) => void;
}) {
  const radius = large ? 24 : compact ? 12 : 21;
  const fontSize = large ? 18 : compact ? 12 : 16;
  const labelOffset = radius + 8;
  return (
    <g
      data-graph-node="true"
      onClick={onClick}
      onPointerDown={onPointerDown}
      className="cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      {selected && <circle cx={x} cy={y} r={radius + 8} fill="none" stroke="#165dff" strokeWidth="3" strokeDasharray="6 5" />}
      <circle cx={x} cy={y} r={radius} fill={color} opacity={muted ? 0.62 : 1} />
      {muted && <circle cx={x} cy={y} r={radius - 4} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />}
      {label && (
        <text x={x + labelOffset} y={y + 5} fontSize={fontSize} fill="#202938" fontWeight={compact ? 600 : 700}>
          {label}
        </text>
      )}
    </g>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-3.5 w-3.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function RoomShape({
  room,
  selected,
  layer,
  showLabels,
  showMeasurements,
  wallsOpacity,
  onClick,
  onPointerDown,
  draggable,
  panMode,
}: {
  room: RoomModel;
  selected: boolean;
  layer: LayerId;
  showLabels: boolean;
  showMeasurements: boolean;
  wallsOpacity: number;
  onClick: () => void;
  onPointerDown: (event: ReactPointerEvent<SVGGElement>) => void;
  draggable: boolean;
  panMode: boolean;
}) {
  const style = ROOM_STYLE[room.tone];
  const automationHighlight = layer === 'automation' && room.automations.length > 0;

  return (
    <g onClick={onClick} onPointerDown={onPointerDown} style={{ cursor: panMode ? 'grab' : draggable ? 'grab' : 'pointer', touchAction: 'none' }}>
      <rect
        x={room.x}
        y={room.y}
        width={room.w}
        height={room.h}
        rx={3}
        fill={selected ? style.selected : automationHighlight ? '#f3f7ff' : style.fill}
        stroke={selected ? '#1f6feb' : '#3d4248'}
        strokeWidth={selected ? 8 : 7}
        strokeOpacity={wallsOpacity}
      />
      <rect
        x={room.x + 9}
        y={room.y + 9}
        width={Math.max(0, room.w - 18)}
        height={Math.max(0, room.h - 18)}
        rx={2}
        fill="none"
        stroke="rgba(120, 146, 178, 0.22)"
        strokeWidth="1.5"
        opacity={wallsOpacity}
      />
      {selected && (
        <rect
          x={room.x - 12}
          y={room.y - 12}
          width={room.w + 24}
          height={room.h + 24}
          rx={8}
          fill="none"
          stroke="#165dff"
          strokeDasharray="12 8"
          strokeWidth="3"
        />
      )}
      {showLabels && (
        <>
          <text x={room.x + 22} y={room.y + 36} fontSize="18" fill="#1d2430" fontWeight={700}>
            {room.name}
          </text>
          <text x={room.x + 22} y={room.y + 60} fontSize="13" fill="#7d8795">
            {room.area}㎡
          </text>
          {showMeasurements && (
            <text x={room.x + room.w - 20} y={room.y + room.h - 22} textAnchor="end" fontSize="13" fill={style.accent}>
              {(room.w / 68).toFixed(1)}m × {(room.h / 68).toFixed(1)}m
            </text>
          )}
        </>
      )}
    </g>
  );
}

function Furniture({
  item,
  selected,
  draggable,
  opacity,
  onClick,
  onPointerDown,
  panMode,
}: {
  item: FurnitureItem;
  selected: boolean;
  draggable: boolean;
  opacity: number;
  onClick: () => void;
  onPointerDown: (event: ReactPointerEvent<SVGGElement>) => void;
  panMode: boolean;
}) {
  const stroke = selected ? '#111827' : '#202938';
  const fill = selected ? '#f8fbff' : '#ffffff';
  const common = { fill, stroke, strokeWidth: 2.5 } as const;

  const content = (() => {
    if (item.kind === 'sofa') {
      return (
        <>
          <rect x={item.x} y={item.y} width={item.w} height={item.h} rx={10} {...common} />
          <line x1={item.x + 16} y1={item.y + item.h * 0.28} x2={item.x + item.w - 16} y2={item.y + item.h * 0.28} stroke={stroke} strokeWidth="2.5" />
          <line x1={item.x + 22} y1={item.y + item.h * 0.62} x2={item.x + item.w - 22} y2={item.y + item.h * 0.62} stroke="#c5cdd8" strokeWidth="2" />
        </>
      );
    }

    if (item.kind === 'coffee' || item.kind === 'cabinet' || item.kind === 'island') {
      return (
        <>
          <rect x={item.x} y={item.y} width={item.w} height={item.h} rx={8} {...common} />
          <line x1={item.x + 10} y1={item.y + item.h / 2} x2={item.x + item.w - 10} y2={item.y + item.h / 2} stroke="#c5cdd8" strokeWidth="2" />
        </>
      );
    }

    if (item.kind === 'tableRect') {
      return (
        <>
          <rect x={item.x} y={item.y} width={item.w} height={item.h} rx={8} {...common} />
          {[
            [item.x - 18, item.y + 16],
            [item.x - 18, item.y + item.h - 16],
            [item.x + item.w + 18, item.y + 16],
            [item.x + item.w + 18, item.y + item.h - 16],
            [item.x + 24, item.y - 18],
            [item.x + item.w - 24, item.y - 18],
            [item.x + 24, item.y + item.h + 18],
            [item.x + item.w - 24, item.y + item.h + 18],
          ].map(([cx, cy], index) => (
            <rect key={index} x={cx - 10} y={cy - 10} width={20} height={20} rx={4} fill="#ffffff" stroke={stroke} strokeWidth="2" />
          ))}
        </>
      );
    }

    if (item.kind === 'tableRound') {
      return (
        <>
          <circle cx={item.x + item.w / 2} cy={item.y + item.h / 2} r={Math.max(12, item.w / 2 - 8)} {...common} />
          <circle cx={item.x + item.w / 2} cy={item.y + item.h / 2} r={Math.max(6, item.w / 4)} fill="none" stroke="#c5cdd8" strokeWidth="2" />
        </>
      );
    }

    if (item.kind === 'bed') {
      return (
        <>
          <rect x={item.x} y={item.y} width={item.w} height={item.h} rx={12} {...common} />
          <rect x={item.x + 18} y={item.y + 14} width={item.w - 36} height={30} rx={8} fill="#ffffff" stroke={stroke} strokeWidth="2" />
          <line x1={item.x + 18} y1={item.y + 58} x2={item.x + item.w - 18} y2={item.y + 58} stroke="#c5cdd8" strokeWidth="2" />
        </>
      );
    }

    if (item.kind === 'desk') {
      return (
        <>
          <rect x={item.x} y={item.y} width={item.w} height={item.h} rx={8} {...common} />
          <circle cx={item.x + item.w / 2} cy={item.y + item.h + 18} r={14} fill="#ffffff" stroke={stroke} strokeWidth="2" />
        </>
      );
    }

    return (
      <>
        <rect x={item.x} y={item.y} width={item.w} height={item.h} rx={10} {...common} />
        <rect x={item.x + 12} y={item.y + 12} width={Math.max(4, item.w - 24)} height={Math.max(4, item.h - 24)} rx={8} fill="none" stroke="#c5cdd8" strokeWidth="2" />
      </>
    );
  })();

  return (
    <g
      onClick={event => {
        event.stopPropagation();
        onClick();
      }}
      onPointerDown={onPointerDown}
      style={{ cursor: panMode ? 'grab' : draggable ? 'grab' : 'pointer', touchAction: 'none' }}
      opacity={opacity}
    >
      <rect
        x={item.x - 14}
        y={item.y - 14}
        width={item.w + 28}
        height={item.h + 28}
        fill="transparent"
        pointerEvents="all"
      />
      {content}
      {selected && (
        <rect
          x={item.x - 12}
          y={item.y - 12}
          width={item.w + 24}
          height={item.h + 24}
          rx={8}
          fill="none"
          stroke="#165dff"
          strokeDasharray="10 8"
          strokeWidth="3"
        />
      )}
    </g>
  );
}

function CoverageShape({
  x,
  y,
  coverage,
  color,
  highlight,
  editable,
  opacity,
  onRotationPointerDown,
  onRadiusPointerDown,
}: {
  x: number;
  y: number;
  coverage: CoverageModel;
  color: string;
  highlight: boolean;
  editable: boolean;
  opacity: number;
  onRotationPointerDown: (event: ReactPointerEvent<SVGCircleElement>) => void;
  onRadiusPointerDown: (event: ReactPointerEvent<SVGCircleElement>) => void;
}) {
  if (coverage.type === 'circle') {
    return (
      <g>
        <circle
          cx={x}
          cy={y}
          r={coverage.radius}
          fill={hexToRgba(color, (highlight ? 0.14 : 0.07) * opacity)}
          stroke={hexToRgba(color, highlight ? 0.46 : 0.2)}
          strokeWidth={highlight ? 2.5 : 1.5}
        />
        {highlight && editable && (
          <circle
            cx={x + coverage.radius}
            cy={y}
            r={8}
            fill="#ffffff"
            stroke={color}
            strokeWidth="3"
            onPointerDown={onRadiusPointerDown}
            style={{ cursor: 'ew-resize', touchAction: 'none' }}
          />
        )}
      </g>
    );
  }

  const rotation = coverage.rotation ?? 0;
  const halfAngle = (coverage.angle ?? 90) / 2;
  const directionX = x + Math.cos((rotation * Math.PI) / 180) * coverage.radius;
  const directionY = y + Math.sin((rotation * Math.PI) / 180) * coverage.radius;
  const radiusHandleX = x + Math.cos(((rotation + halfAngle) * Math.PI) / 180) * coverage.radius;
  const radiusHandleY = y + Math.sin(((rotation + halfAngle) * Math.PI) / 180) * coverage.radius;

  return (
    <g>
      <path
        d={buildSectorPath(x, y, coverage.radius, coverage.angle ?? 90, coverage.rotation ?? 0)}
        fill={hexToRgba(color, (highlight ? 0.14 : 0.07) * opacity)}
        stroke={hexToRgba(color, highlight ? 0.46 : 0.2)}
        strokeWidth={highlight ? 2.5 : 1.5}
      />
      {highlight && (
        <>
          <line x1={x} y1={y} x2={directionX} y2={directionY} stroke={hexToRgba(color, 0.75)} strokeWidth="3" strokeLinecap="round" />
          <circle
            cx={directionX}
            cy={directionY}
            r={editable ? 10 : 7}
            fill="#ffffff"
            stroke={color}
            strokeWidth="3"
            onPointerDown={editable ? onRotationPointerDown : undefined}
            style={{ cursor: editable ? 'grab' : 'default', touchAction: 'none' }}
          />
          {editable && (
            <circle
              cx={radiusHandleX}
              cy={radiusHandleY}
              r={8}
              fill="#ffffff"
              stroke={hexToRgba(color, 0.76)}
              strokeDasharray="3 3"
              strokeWidth="3"
              onPointerDown={onRadiusPointerDown}
              style={{ cursor: 'nwse-resize', touchAction: 'none' }}
            />
          )}
          <text x={directionX + 12} y={directionY - 10} fontSize="14" fontWeight={700} fill={color}>
            {Math.round(rotation)}°
          </text>
        </>
      )}
    </g>
  );
}

function DeviceMarker({
  device,
  selected,
  showLabel,
  showModel,
  showConnectivity,
  iconScale,
  onClick,
  onPointerDown,
  draggable,
  panMode,
}: {
  device: DeviceModel;
  selected: boolean;
  showLabel: boolean;
  showModel: boolean;
  showConnectivity: boolean;
  iconScale: number;
  onClick: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  draggable: boolean;
  panMode: boolean;
}) {
  const meta = DEVICE_META[device.kind];
  const Icon = meta.icon;
  const markerSize = clamp(44 * iconScale, 24, 48);
  const iconSize = clamp(18 * iconScale, 12, 18);
  const isUnboundPoint = device.bindingStatus === 'unboundPoint';
  const style = {
    left: `${(device.x / VIEWBOX_W) * 100}%`,
    top: `${(device.y / VIEWBOX_H) * 100}%`,
  } satisfies CSSProperties;

  return (
    <button
      type="button"
      onClick={event => {
        event.stopPropagation();
        onClick();
      }}
      onPointerDown={onPointerDown}
      className={cn(
        'pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 touch-none',
        panMode || draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      )}
      style={style}
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-full border-[2px] bg-[#27303b] text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)] transition',
          isUnboundPoint && 'border-dashed bg-white text-[#c26a00]',
          selected && 'scale-110 ring-4 ring-[#d9e8ff]'
        )}
        style={{ borderColor: isUnboundPoint ? '#f59e0b' : meta.color, width: markerSize, height: markerSize }}
      >
        <Icon size={iconSize} />
      </span>
      {showConnectivity && (
        <span
          className={cn(
            'absolute right-0 top-0 rounded-full border-2 border-white',
            isUnboundPoint ? 'bg-white ring-1 ring-[#f59e0b]' : device.status === 'online' ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'
          )}
          style={{ width: Math.max(8, markerSize * 0.24), height: Math.max(8, markerSize * 0.24) }}
        />
      )}
      {showLabel && (
        <span className={cn('absolute whitespace-nowrap rounded-md bg-[#171b22] px-2 py-0.5 text-[11px] font-medium leading-tight text-white shadow-[0_8px_18px_rgba(15,23,42,0.16)]', labelPositionClass(device.labelSide))}>
          <span className="block">{device.name}</span>
          {showModel && <span className="block text-[10px] font-normal text-[#c9d1dc]">{isUnboundPoint ? '未绑定点位' : meta.label}</span>}
        </span>
      )}
    </button>
  );
}

function ConnectionLine({ source, target, active }: { source: DeviceModel; target: DeviceModel; active: boolean }) {
  return (
    <g opacity={active ? 1 : 0.42}>
      <line
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        stroke={active ? '#165dff' : '#94a3b8'}
        strokeWidth={active ? 3 : 2}
        strokeDasharray={active ? '0' : '8 8'}
        strokeLinecap="round"
      />
      <circle cx={source.x} cy={source.y} r={5} fill="#ffffff" stroke="#165dff" strokeWidth="2" />
      <circle cx={target.x} cy={target.y} r={5} fill="#ffffff" stroke="#165dff" strokeWidth="2" />
    </g>
  );
}

function DraftLine({ source, target }: { source: Point; target: Point }) {
  return (
    <g>
      <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#165dff" strokeWidth="3" strokeDasharray="10 8" strokeLinecap="round" />
      <circle cx={source.x} cy={source.y} r={6} fill="#165dff" />
      <circle cx={target.x} cy={target.y} r={6} fill="#ffffff" stroke="#165dff" strokeWidth="3" />
    </g>
  );
}

function ScaleLine({ draft, length }: { draft: ScaleDraft; length: string }) {
  const midX = (draft.start.x + draft.end.x) / 2;
  const midY = (draft.start.y + draft.end.y) / 2 - 12;

  return (
    <g>
      <line x1={draft.start.x} y1={draft.start.y} x2={draft.end.x} y2={draft.end.y} stroke="#d92d20" strokeWidth="4" strokeLinecap="round" />
      <circle cx={draft.start.x} cy={draft.start.y} r={5} fill="#ffffff" stroke="#d92d20" strokeWidth="3" />
      <circle cx={draft.end.x} cy={draft.end.y} r={5} fill="#ffffff" stroke="#d92d20" strokeWidth="3" />
      {draft.committed && (
        <text x={midX} y={midY} textAnchor="middle" fontSize="16" fontWeight={700} fill="#d92d20">
          {length || '-'} m
        </text>
      )}
    </g>
  );
}

function FloorOverlayShape({
  overlay,
  onPointerDown,
  onResizePointerDown,
}: {
  overlay: FloorPlanOverlay;
  onPointerDown: (event: ReactPointerEvent<SVGGElement>) => void;
  onResizePointerDown: (event: ReactPointerEvent<SVGCircleElement>, corner: Exclude<AlignmentDragState['kind'], 'move'>) => void;
}) {
  const corners: Array<{ x: number; y: number; kind: Exclude<AlignmentDragState['kind'], 'move'>; cursor: string }> = [
    { x: overlay.x, y: overlay.y, kind: 'resize-nw', cursor: 'nwse-resize' },
    { x: overlay.x + overlay.w, y: overlay.y, kind: 'resize-ne', cursor: 'nesw-resize' },
    { x: overlay.x, y: overlay.y + overlay.h, kind: 'resize-sw', cursor: 'nesw-resize' },
    { x: overlay.x + overlay.w, y: overlay.y + overlay.h, kind: 'resize-se', cursor: 'nwse-resize' },
  ];

  return (
    <g onPointerDown={onPointerDown} style={{ cursor: 'move', touchAction: 'none' }}>
      <rect x={overlay.x} y={overlay.y} width={overlay.w} height={overlay.h} fill="rgba(61,139,255,0.12)" stroke="#3d8bff" strokeWidth="3" />
      <rect x={overlay.x + 8} y={overlay.y + 8} width={72} height={28} rx={4} fill="#3d8bff" />
      <text x={overlay.x + 44} y={overlay.y + 27} textAnchor="middle" fontSize="14" fontWeight={700} fill="#ffffff">{overlay.label}</text>
      <g opacity={0.35}>
        <rect x={overlay.x + 38} y={overlay.y + 56} width={overlay.w - 76} height={overlay.h - 88} rx={8} fill="#ffffff" stroke="#3d8bff" strokeWidth="2" />
        <line x1={overlay.x + overlay.w * 0.32} y1={overlay.y + 56} x2={overlay.x + overlay.w * 0.32} y2={overlay.y + overlay.h - 32} stroke="#3d8bff" strokeWidth="2" />
        <line x1={overlay.x + overlay.w * 0.62} y1={overlay.y + 56} x2={overlay.x + overlay.w * 0.62} y2={overlay.y + overlay.h - 32} stroke="#3d8bff" strokeWidth="2" />
        <line x1={overlay.x + 38} y1={overlay.y + overlay.h * 0.54} x2={overlay.x + overlay.w - 38} y2={overlay.y + overlay.h * 0.54} stroke="#3d8bff" strokeWidth="2" />
      </g>
      {corners.map(corner => (
        <circle
          key={corner.kind}
          cx={corner.x}
          cy={corner.y}
          r={7}
          fill="#ffffff"
          stroke="#3d8bff"
          strokeWidth="3"
          onPointerDown={event => onResizePointerDown(event, corner.kind)}
          style={{ cursor: corner.cursor, touchAction: 'none' }}
        />
      ))}
    </g>
  );
}

function SettingsPanel({
  iconScale,
  labelDensity,
  showDeviceName,
  showDeviceModel,
  showConnectivity,
  coverageOpacity,
  wallsOpacity,
  furnitureOpacity,
  onIconScale,
  onLabelDensity,
  onShowDeviceName,
  onShowDeviceModel,
  onShowConnectivity,
  onCoverageOpacity,
  onWallsOpacity,
  onFurnitureOpacity,
  onRestore,
}: {
  iconScale: number;
  labelDensity: number;
  showDeviceName: boolean;
  showDeviceModel: boolean;
  showConnectivity: boolean;
  coverageOpacity: number;
  wallsOpacity: number;
  furnitureOpacity: number;
  onIconScale: (value: number) => void;
  onLabelDensity: (value: number) => void;
  onShowDeviceName: (value: boolean) => void;
  onShowDeviceModel: (value: boolean) => void;
  onShowConnectivity: (value: boolean) => void;
  onCoverageOpacity: (value: number) => void;
  onWallsOpacity: (value: number) => void;
  onFurnitureOpacity: (value: number) => void;
  onRestore: () => void;
}) {
  return (
    <div className="absolute right-3 top-14 z-30 w-[300px] rounded-xl border border-[#e3e8ef] bg-white/95 p-5 shadow-[0_22px_56px_rgba(15,23,42,0.16)] backdrop-blur">
      <SliderSetting label="Icons Size" value={iconScale} min={0.45} max={1} step={0.01} suffix="%" onChange={onIconScale} />

      <div className="mt-4">
        <div className="mb-2 text-[14px] font-medium text-[#4b5563]">Icons & Labels Visibility</div>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={labelDensity}
          onChange={event => onLabelDensity(Number(event.target.value))}
          className="w-full accent-[#0f72ff]"
        />
        <div className="mt-1 flex justify-between text-[12px] text-[#7d8795]">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>

      <div className="mt-4 space-y-3 border-t border-[#edf1f5] pt-4">
        <SwitchSetting label="Device Name" checked={showDeviceName} onChange={onShowDeviceName} />
        <SwitchSetting label="Device Model" checked={showDeviceModel} onChange={onShowDeviceModel} />
        <SwitchSetting label="Connectivity" checked={showConnectivity} onChange={onShowConnectivity} />
      </div>

      <div className="mt-4 space-y-4 border-t border-[#edf1f5] pt-4">
        <SliderSetting label="Coverage Opacity" value={coverageOpacity} min={0.1} max={1} step={0.01} suffix="%" onChange={onCoverageOpacity} />
        <SliderSetting label="Walls Opacity" value={wallsOpacity} min={0.25} max={1} step={0.01} suffix="%" onChange={onWallsOpacity} />
        <SliderSetting label="Objects Opacity" value={furnitureOpacity} min={0.2} max={1} step={0.01} suffix="%" onChange={onFurnitureOpacity} />
      </div>

      <button type="button" onClick={onRestore} className="mt-4 text-[14px] font-medium text-[#0f72ff]">
        Restore Default
      </button>
    </div>
  );
}

function ToolNotice({
  text,
  action,
  onAction,
}: {
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="absolute left-1/2 top-3 z-40 flex max-w-[760px] -translate-x-1/2 items-center gap-3 rounded-full bg-[#34383f] px-4 py-2 text-[13px] text-white shadow-[0_14px_34px_rgba(15,23,42,0.24)]">
      <span>{text}</span>
      <button type="button" onClick={onAction} className="rounded-full bg-[#3d8bff] px-3 py-1 text-[12px] font-semibold text-white">
        {action}
      </button>
    </div>
  );
}

function AlignFloorPlansPanel({
  activeFloor,
  floors,
  overlay,
  onSelect,
}: {
  activeFloor: FloorModel;
  floors: FloorModel[];
  overlay: FloorPlanOverlay;
  onSelect: (floorId: FloorId) => void;
}) {
  const otherFloors = floors.filter(floor => floor.id !== activeFloor.id);

  return (
    <div className="absolute right-3 top-14 z-30 w-[260px] rounded-xl border border-[#e3e8ef] bg-white/95 p-3 shadow-[0_22px_56px_rgba(15,23,42,0.14)] backdrop-blur">
      <div className="mb-2 text-[12px] font-semibold text-[#64748b]">Align Floor Plans</div>
      <div className="mb-2 rounded-md border border-[#e5ebf3] bg-[#f8fafc] px-3 py-2">
        <div className="text-[11px] text-[#94a3b8]">Current</div>
        <div className="mt-0.5 text-[13px] font-semibold text-[#202938]">{activeFloor.label} {activeFloor.name}</div>
      </div>
      <div className="space-y-1">
        {otherFloors.map(floor => (
          <button
            key={floor.id}
            type="button"
            onClick={() => onSelect(floor.id)}
            className={cn(
              'flex h-9 w-full items-center justify-between rounded-md px-2 text-left text-[12px]',
              overlay.id === floor.id ? 'border border-[#3d8bff] bg-[#edf4ff] text-[#165dff]' : 'text-[#475569] hover:bg-[#f6f8fb]'
            )}
          >
            <span>{floor.label} {floor.name}</span>
            {overlay.id === floor.id && <span className="h-2 w-2 rounded-full bg-[#165dff]" />}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-dashed border-[#dbe2ec] bg-[#f8fafc] px-3 py-2 text-[11px] leading-5 text-[#7d8795]">
        移动叠加户型图对齐当前楼层；拖动右下角控制点调整尺寸。
      </div>
    </div>
  );
}

function ScaleInputPanel({
  value,
  onChange,
  onRedraw,
  onSave,
}: {
  value: string;
  onChange: (value: string) => void;
  onRedraw: () => void;
  onSave: () => void;
}) {
  return (
    <div className="absolute right-12 top-1/2 z-30 w-[230px] -translate-y-1/2 rounded-lg border border-[#e3e8ef] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
      <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#202938]">
        <Ruler size={15} />
        Set Length
      </div>
      <label className="block">
        <input
          value={value}
          onChange={event => onChange(event.target.value)}
          autoFocus
          className="h-9 w-full rounded-md border border-[#165dff] px-3 text-[14px] outline-none"
          placeholder="10"
        />
        <span className="mt-1 block text-right text-[12px] text-[#165dff]">m / ft</span>
      </label>
      <div className="mt-4 flex items-center justify-end gap-3">
        <button type="button" onClick={onRedraw} className="text-[13px] font-medium text-[#64748b]">Redraw</button>
        <button type="button" onClick={onSave} className="rounded-md bg-[#3d8bff] px-4 py-2 text-[13px] font-semibold text-white">Save</button>
      </div>
    </div>
  );
}

function SliderSetting({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  const display = suffix === '%' ? `${Math.round(value * 100)}%` : `${value}`;

  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-[14px] font-medium text-[#4b5563]">
        <span>{label}</span>
        <span>{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="w-full accent-[#0f72ff]"
      />
    </label>
  );
}

function SwitchSetting({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 text-[14px] font-medium text-[#4b5563]">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 rounded-full transition',
          checked ? 'bg-[#0f72ff]' : 'bg-[#d9dee6]'
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition',
            checked ? 'left-6' : 'left-1'
          )}
        />
      </button>
    </label>
  );
}

function FloorInspector({
  floor,
  deviceCount,
  unassignedCount,
  isEditing,
  onAddRoom,
}: {
  floor: FloorModel;
  deviceCount: number;
  unassignedCount: number;
  isEditing: boolean;
  onAddRoom: () => void;
}) {
  return (
    <div>
      <InspectorTitle title={floor.name} meta={floor.label} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="面积" value={`${floor.area}㎡`} />
        <Metric label="房间" value={`${floor.rooms.length}`} />
        <Metric label="设备" value={`${deviceCount}`} />
        <Metric label="待分配" value={`${unassignedCount}`} />
      </div>
      {isEditing && (
      <button type="button" onClick={onAddRoom} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#165dff] text-[14px] font-medium text-white">
        <Plus size={16} />
        新增房间
      </button>
      )}
    </div>
  );
}

function RoomInspector({
  room,
  deviceCount,
  isEditing,
  onPatch,
  onDuplicate,
  onDelete,
  onAddFurniture,
}: {
  room: RoomModel;
  deviceCount: number;
  isEditing: boolean;
  onPatch: (patch: Partial<RoomModel>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddFurniture: (item?: FurnitureLibraryItem) => void;
}) {
  return (
    <div>
      <InspectorTitle title={room.name} meta="房间" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="面积" value={`${room.area}㎡`} />
        <Metric label="设备" value={`${deviceCount}`} />
      </div>

      {isEditing ? (
        <>
          <div className="mt-4 space-y-3">
            <TextField label="名称" value={room.name} onChange={value => onPatch({ name: value })} />
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="朝向"
                value={room.orientation ?? '南'}
                options={ORIENTATION_OPTIONS}
                onChange={value => onPatch({ orientation: value as Orientation })}
              />
              <SelectField
                label="封闭性"
                value={room.enclosureType ?? '封闭'}
                options={ENCLOSURE_OPTIONS}
                onChange={value => onPatch({ enclosureType: value as EnclosureType })}
              />
            </div>
            <NumberGrid
              items={[
                { label: 'X', value: room.x, onChange: value => onPatch({ x: value }) },
                { label: 'Y', value: room.y, onChange: value => onPatch({ y: value }) },
                { label: 'W', value: room.w, onChange: value => onPatch({ w: Math.max(80, value) }) },
                { label: 'H', value: room.h, onChange: value => onPatch({ h: Math.max(80, value) }) },
                { label: '面积', value: room.area, onChange: value => onPatch({ area: Math.max(1, value) }) },
              ]}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <ActionButton icon={Copy} label="复制" onClick={onDuplicate} />
            <ActionButton icon={Trash2} label="删除" danger onClick={onDelete} />
          </div>

          <FurniturePalette onAdd={onAddFurniture} />
        </>
      ) : (
        <ReadOnlyRows
          rows={[
            ['朝向', room.orientation ?? '南'],
            ['封闭性', room.enclosureType ?? '封闭'],
            ['坐标', formatLocalPosition(room.x, room.y)],
            ['尺寸', `${(room.w / 68).toFixed(1)}m × ${(room.h / 68).toFixed(1)}m`],
          ]}
        />
      )}
    </div>
  );
}

function DeviceInspector({
  device,
  rooms,
  isEditing,
  onPatch,
  onPatchCoverage,
  onMoveToRoom,
  onMoveToPoint,
  onDelete,
}: {
  device: DeviceModel;
  rooms: RoomModel[];
  isEditing: boolean;
  onPatch: (patch: Partial<DeviceModel>) => void;
  onPatchCoverage: (coverageId: string, patch: Partial<CoverageModel>) => void;
  onMoveToRoom: (roomId: string) => void;
  onMoveToPoint: (x: number, y: number) => void;
  onDelete: () => void;
}) {
  const meta = DEVICE_META[device.kind];
  const coverage = device.coverage?.[0] ?? null;
  const isUnboundPoint = device.bindingStatus === 'unboundPoint';

  return (
    <div>
      <InspectorTitle title={device.name} meta={isUnboundPoint ? `${meta.label} · 未绑定点位` : meta.label} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="状态" value={isUnboundPoint ? '待绑定' : device.status === 'online' ? '在线' : '需处理'} />
        <Metric label="覆盖" value={`${device.coverage?.length ?? 0}`} />
        <Metric label="坐标" value={formatLocalPosition(device.x, device.y)} />
        <Metric label="角度" value={`${Math.round(coverage?.rotation ?? device.localEulerAngles?.z ?? 0)}°`} />
      </div>

      {isEditing ? (
        <>
          <div className="mt-4 space-y-3">
            <TextField label="名称" value={device.name} onChange={value => onPatch({ name: value })} />
            <TextField label="安装" value={device.install} onChange={value => onPatch({ install: value })} />
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-[#7d8795]">空间</span>
              <select
                value={device.roomId}
                onChange={event => onMoveToRoom(event.target.value)}
                className="h-9 w-full rounded-md border border-[#dfe6ef] bg-white px-2 text-[13px] text-[#202938] outline-none focus:border-[#165dff]"
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </label>
            <NumberGrid
              items={[
                { label: 'X', value: device.x, onChange: value => onMoveToPoint(value, device.y) },
                { label: 'Y', value: device.y, onChange: value => onMoveToPoint(device.x, value) },
              ]}
            />
            {coverage && (
              <div className="rounded-lg border border-[#e4eaf1] bg-[#f8fafc] p-3">
                <div className="mb-3 text-[12px] font-medium text-[#7d8795]">覆盖与安装角度</div>
                <NumberGrid
                  items={[
                    {
                      label: '方向°',
                      value: coverage.rotation ?? 0,
                      onChange: value => onPatchCoverage(coverage.id, { rotation: normalizeAngle(value) }),
                    },
                    {
                      label: '视角°',
                      value: coverage.angle ?? 90,
                      onChange: value => onPatchCoverage(coverage.id, { angle: clamp(value, 20, 180) }),
                    },
                    {
                      label: '半径',
                      value: coverage.radius,
                      onChange: value => onPatchCoverage(coverage.id, { radius: clamp(value, 40, 320) }),
                    },
                  ]}
                />
              </div>
            )}
          </div>

          <button type="button" onClick={onDelete} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#f1c7c7] bg-[#fff5f5] text-[14px] font-medium text-[#c0392b]">
            <Trash2 size={16} />
            {isUnboundPoint ? '移除点位' : '删除设备并保留点位'}
          </button>
        </>
      ) : (
        <ReadOnlyRows
          rows={[
            ['安装', device.install],
            ['空间', rooms.find(room => room.id === device.roomId)?.name ?? '-'],
            ['坐标', formatLocalPosition(device.x, device.y)],
            ['安装角度', `${Math.round(coverage?.rotation ?? device.localEulerAngles?.z ?? 0)}°`],
            ['联动', `${device.automations.length}`],
          ]}
        />
      )}
    </div>
  );
}

function FurnitureInspector({
  item,
  room,
  isEditing,
  onPatch,
  onDuplicate,
  onDelete,
}: {
  item: FurnitureItem;
  room: RoomModel;
  isEditing: boolean;
  onPatch: (patch: Partial<FurnitureItem>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const label = FURNITURE_META[item.kind].label;

  return (
    <div>
      <InspectorTitle title={item.name ?? label} meta={`${label} · ${room.name}`} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="空间" value={room.name} />
        <Metric label="尺寸" value={`${(item.w / 68).toFixed(1)}m × ${(item.h / 68).toFixed(1)}m`} />
      </div>

      {isEditing ? (
        <>
          <div className="mt-4 space-y-3">
            <TextField label="名称" value={item.name ?? label} onChange={value => onPatch({ name: value })} />
            <SelectField
              label="类型"
              value={item.kind}
              options={Object.keys(FURNITURE_META)}
              onChange={value => onPatch({ kind: value as FurnitureKind })}
            />
            <NumberGrid
              items={[
                { label: 'X', value: item.x, onChange: value => onPatch({ x: value }) },
                { label: 'Y', value: item.y, onChange: value => onPatch({ y: value }) },
                { label: 'W', value: item.w, onChange: value => onPatch({ w: Math.max(18, value) }) },
                { label: 'H', value: item.h, onChange: value => onPatch({ h: Math.max(18, value) }) },
              ]}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <ActionButton icon={Copy} label="复制" onClick={onDuplicate} />
            <ActionButton icon={Trash2} label="删除" danger onClick={onDelete} />
          </div>
        </>
      ) : (
        <ReadOnlyRows
          rows={[
            ['类型', label],
            ['空间', room.name],
            ['坐标', formatLocalPosition(item.x, item.y)],
            ['关系', 'belongsTo'],
          ]}
        />
      )}
    </div>
  );
}

function FurniturePalette({ onAdd }: { onAdd: (item: FurnitureLibraryItem) => void }) {
  return (
    <div className="mt-4 border-t border-[#e8edf3] pt-4">
      <div className="mb-2 text-[12px] font-medium text-[#8a94a5]">添加设施</div>
      <div className="grid grid-cols-3 gap-2">
        {FURNITURE_LIBRARY.map(item => (
          <button
            key={item.kind}
            type="button"
            onClick={() => onAdd(item)}
            className="flex h-9 items-center justify-center rounded-md border border-[#dfe6ef] bg-[#f8fafc] text-[12px] font-medium text-[#2f3948] transition hover:border-[#cbd6e5] hover:bg-white"
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function UnassignedDeviceInspector({
  device,
  targetRoom,
  isEditing,
  onStartEdit,
  onAssignToRoom,
}: {
  device: DeviceModel;
  targetRoom: RoomModel | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onAssignToRoom: () => void;
}) {
  const meta = DEVICE_META[device.kind];

  return (
    <div>
      <InspectorTitle title={device.name} meta={`${meta.label} · 未分配`} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="状态" value="待定位" />
        <Metric label="目标空间" value={targetRoom?.name ?? '-'} />
      </div>
      <ReadOnlyRows
        rows={[
          ['安装', device.install],
          ['点位', '未设置'],
          ['关系', '待生成'],
        ]}
      />
      <button
        type="button"
        onClick={isEditing ? onAssignToRoom : onStartEdit}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#165dff] text-[14px] font-medium text-white"
      >
        <MapIcon size={16} />
        {isEditing ? '放入当前空间' : '进入编辑'}
      </button>
    </div>
  );
}

function GraphRelationsPanel({ relations }: { relations: GraphRelation[] }) {
  return (
    <div className="mt-5 border-t border-[#e8edf3] pt-4">
      <div className="mb-2 text-[12px] font-medium text-[#8a94a5]">图谱关系</div>
      <div className="space-y-1.5">
        {relations.map(relation => (
          <div key={relation.id} className="rounded-md border border-[#e4eaf1] bg-[#f8fafc] px-3 py-2">
            <div className="truncate text-[13px] font-medium text-[#202938]">{relation.sourceName}</div>
            <div className="mt-1 flex items-center gap-2 text-[12px] text-[#697386]">
              <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#165dff]">{relation.predicate}</span>
              <span className="min-w-0 truncate">{relation.targetName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InspectorTitle({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-[20px] font-semibold text-[#1d2430]">{title}</div>
        <div className="mt-1 text-[12px] text-[#8a94a5]">{meta}</div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-[#7d8795]">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-[#dfe6ef] bg-white px-2 text-[13px] text-[#202938] outline-none focus:border-[#165dff]"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ReadOnlyRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="mt-4 space-y-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3 rounded-md border border-[#e4eaf1] bg-[#f8fafc] px-3 py-2">
          <span className="text-[12px] text-[#7d8795]">{label}</span>
          <span className="truncate text-[13px] font-medium text-[#202938]">{value}</span>
        </div>
      ))}
    </div>
  );
}

function NumberGrid({
  items,
}: {
  items: Array<{ label: string; value: number; onChange: (value: number) => void }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(item => (
        <label key={item.label} className="block">
          <span className="mb-1 block text-[12px] font-medium text-[#7d8795]">{item.label}</span>
          <input
            type="number"
            value={Math.round(item.value)}
            onChange={event => item.onChange(Number(event.target.value))}
            className="h-9 w-full rounded-md border border-[#dfe6ef] bg-white px-2 text-[13px] text-[#202938] outline-none focus:border-[#165dff]"
          />
        </label>
      ))}
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-[#7d8795]">{label}</span>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-[#dfe6ef] bg-white px-2 text-[13px] text-[#202938] outline-none focus:border-[#165dff]"
      />
    </label>
  );
}

function BuildingTreeRoot({
  name,
  floorCount,
  roomCount,
  selected,
  onSelect,
}: {
  name: string;
  floorCount: number;
  roomCount: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'mb-1 flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left transition',
        selected ? 'bg-[#edf4ff] text-[#165dff]' : 'text-[#64748b] hover:bg-[#f6f8fb]'
      )}
      title="查看所有空间"
    >
      <Building2 size={15} className="text-[#94a3b8]" />
      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#475569]">{name}</span>
      <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#64748b]">全局</span>
      <span className="rounded-full bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-medium">{floorCount}F</span>
      <span className="text-[11px]">{roomCount}</span>
    </button>
  );
}

function TreeRoot({
  floor,
  deviceCount,
  selected,
  expanded,
  onToggle,
  onSelect,
}: {
  floor: FloorModel;
  deviceCount: number;
  selected: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'mb-0.5 flex w-full items-center rounded-lg px-1.5 py-1 text-left transition',
        selected ? 'bg-[#edf4ff] text-[#165dff]' : 'text-[#2f3948] hover:bg-[#f6f8fb]'
      )}
    >
      <span
        role="button"
        tabIndex={0}
        onClick={event => {
          event.stopPropagation();
          onToggle();
        }}
        onKeyDown={event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          event.stopPropagation();
          onToggle();
        }}
        className="mr-1 flex h-6 w-6 items-center justify-center rounded-md text-[#718198] hover:bg-white"
      >
        <ChevronDown size={14} className={cn('transition', !expanded && '-rotate-90')} />
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2.5 py-0.5">
        <Home size={16} className="text-[#315dff]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold">{floor.label} {floor.name}</span>
          <span className="block text-[10px] font-medium text-[#8a94a5]">{floor.rooms.length} 空间 · {deviceCount} 设备</span>
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-[#8a94a5]">{floor.rooms.length}</span>
      </span>
    </button>
  );
}

function SpaceTreeRoom({
  room,
  devices,
  expanded,
  selected,
  selectedDeviceId,
  selectedFurnitureId,
  activeDeviceMenuId,
  onToggle,
  onSelectRoom,
  onSelectDevice,
  onSelectFurniture,
  onToggleDeviceMenu,
  onDeviceAction,
}: {
  room: RoomModel;
  devices: DeviceModel[];
  expanded: boolean;
  selected: boolean;
  selectedDeviceId: string | null;
  selectedFurnitureId: string | null;
  activeDeviceMenuId: string | null;
  onToggle: () => void;
  onSelectRoom: () => void;
  onSelectDevice: (device: DeviceModel) => void;
  onSelectFurniture: (item: FurnitureItem) => void;
  onToggleDeviceMenu: (deviceId: string) => void;
  onDeviceAction: (action: DeviceTreeAction, device: DeviceModel) => void;
}) {
  return (
    <div className="relative mb-0.5">
      <span className="absolute left-[-13px] top-[16px] h-px w-3.5 bg-[#dbe3ee]" />
      <div
        className={cn(
          'flex w-full items-center rounded-md px-1 py-1 transition',
          selected ? 'bg-[#edf4ff] text-[#165dff]' : 'text-[#2f3948] hover:bg-[#f6f8fb]'
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="mr-1 flex h-6 w-6 items-center justify-center rounded-md text-[#718198] hover:bg-white"
        >
          <ChevronDown size={14} className={cn('transition', !expanded && '-rotate-90')} />
        </button>
        <button type="button" onClick={onSelectRoom} className="flex min-w-0 flex-1 items-center gap-2.5 py-0.5 text-left">
          <Home size={16} className="text-[#315dff]" />
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{room.name}</span>
          <span className="text-[11px] text-[#8a94a5]">{devices.length + room.furniture.length}</span>
        </button>
      </div>

      {expanded && (
        <div className="ml-7 border-l border-[#e5ebf3] py-0.5 pl-2.5">
          {room.furniture.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectFurniture(item)}
              className={cn(
                'mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition',
                selectedFurnitureId === item.id ? 'bg-[#ecfdf5] text-[#047857]' : 'text-[#3b4658] hover:bg-[#f6f8fb]'
              )}
            >
              <Layers size={14} className="text-[#2f9b63]" />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{item.name ?? FURNITURE_META[item.kind].label}</span>
            </button>
          ))}

          {devices.map(device => {
            const meta = DEVICE_META[device.kind];
            const Icon = meta.icon;
            return (
              <div key={device.id} className="relative mb-0.5">
                <div
                  className={cn(
                    'flex items-center rounded-md transition',
                    selectedDeviceId === device.id ? 'bg-[#fff7ed] text-[#b45309]' : 'text-[#3b4658] hover:bg-[#f6f8fb]'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectDevice(device)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1.5 text-left"
                  >
                    <Icon size={14} className={device.kind === 'hub' ? 'text-[#f97316]' : 'text-[#2f9b63]'} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{device.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      onToggleDeviceMenu(device.id);
                    }}
                    className="mr-1 flex h-7 w-7 items-center justify-center rounded-md text-[#7d8795] hover:bg-white hover:text-[#202938]"
                    title="更多"
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </div>

                {activeDeviceMenuId === device.id && (
                  <div className="absolute right-1 top-8 z-40 w-28 overflow-hidden rounded-md border border-[#d8dee8] bg-white py-1 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
                    <TreeAction label="定位" onClick={() => onDeviceAction('locate', device)} />
                    <TreeAction label="编辑点位" onClick={() => onDeviceAction('edit', device)} />
                    <TreeAction label="移出空间" danger onClick={() => onDeviceAction('unassign', device)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TreeAction({ label, danger, onClick }: { label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full px-3 py-2 text-left text-[13px] transition hover:bg-[#f6f8fb]',
        danger ? 'text-[#c0392b]' : 'text-[#2f3948]'
      )}
    >
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#e4eaf1] bg-[#f8fafc] px-3 py-3">
      <div className="text-[11px] text-[#8a94a5]">{label}</div>
      <div className="mt-1 text-[15px] font-semibold text-[#202938]">{value}</div>
    </div>
  );
}

function ToolButton({
  active,
  icon: Icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        'group relative flex h-10 w-10 items-center justify-center rounded-md transition',
        active ? 'bg-[#165dff] text-white' : 'text-[#596579] hover:bg-[#f3f6fa]'
      )}
    >
      <Icon size={17} />
      <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 hidden w-max max-w-[180px] -translate-x-1/2 rounded-md bg-[#171b22] px-3 py-2 text-center text-[12px] font-medium leading-snug text-white shadow-[0_12px_26px_rgba(15,23,42,0.2)] group-hover:block">
        <span className="block text-[13px]">{label}</span>
        <span className="mt-0.5 block font-normal text-[#c9d1dc]">{description}</span>
      </span>
    </button>
  );
}

function IconButton({
  icon: Icon,
  label,
  solid,
  bare,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  solid?: boolean;
  bare?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md transition',
        solid ? 'bg-[#165dff] text-white' : 'border border-[#dfe6ef] bg-white text-[#596579] hover:bg-[#f6f8fb]',
        bare && 'rounded-none border-0 bg-transparent'
      )}
    >
      <Icon size={16} />
    </button>
  );
}

function IconToggle({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8dee8] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition',
        active ? 'text-[#165dff]' : 'text-[#596579] hover:bg-[#f6f8fb]'
      )}
    >
      <Icon size={16} />
    </button>
  );
}

function ActionButton({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-10 items-center justify-center gap-1.5 rounded-md border text-[13px] font-medium',
        danger
          ? 'border-[#f1c7c7] bg-[#fff5f5] text-[#c0392b]'
          : 'border-[#dfe6ef] bg-[#f8fafc] text-[#2f3948] hover:bg-white'
      )}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

function pxToMeters(value: number) {
  return +(value / 68).toFixed(2);
}

function toLocalPosition(x: number, y: number): Vector3 {
  return { x: pxToMeters(x), y: pxToMeters(y), z: 0 };
}

function formatLocalPosition(x: number, y: number) {
  const position = toLocalPosition(x, y);
  return `${position.x}, ${position.y}, ${position.z}`;
}

function findRoomAtPoint(rooms: RoomModel[], x: number, y: number) {
  return rooms
    .filter(room => x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h)
    .sort((a, b) => a.w * a.h - b.w * b.h)[0];
}

function findNearestDevice(devices: DeviceModel[], point: Point, excludeId?: string, threshold = 48) {
  return devices
    .filter(device => device.id !== excludeId)
    .map(device => ({ device, distance: Math.hypot(device.x - point.x, device.y - point.y) }))
    .filter(item => item.distance <= threshold)
    .sort((a, b) => a.distance - b.distance)[0]?.device ?? null;
}

function normalizeAngle(value: number) {
  return ((Math.round(value) % 360) + 360) % 360;
}

function buildGraphRelations(floor: FloorModel, devices: DeviceModel[], connections: DeviceConnection[]): GraphRelation[] {
  const relations: GraphRelation[] = floor.rooms.map(room => ({
    id: `${room.id}-belongsTo-${floor.id}`,
    sourceId: room.id,
    sourceName: room.name,
    predicate: 'belongsTo',
    targetId: floor.id,
    targetName: floor.label,
  }));

  floor.rooms.forEach(room => {
    room.furniture.forEach(item => {
      const name = item.name ?? FURNITURE_META[item.kind].label;
      relations.push(
        {
          id: `${item.id}-belongsTo-${room.id}`,
          sourceId: item.id,
          sourceName: name,
          predicate: 'belongsTo',
          targetId: room.id,
          targetName: room.name,
        },
        {
          id: `${item.id}-isInstalledIn-${room.id}`,
          sourceId: item.id,
          sourceName: name,
          predicate: 'isInstalledIn',
          targetId: room.id,
          targetName: room.name,
        }
      );
    });
  });

  devices.forEach(device => {
    const room = floor.rooms.find(item => item.id === device.roomId);
    if (!room) return;

    relations.push(
      {
        id: `${device.id}-belongsTo-${room.id}`,
        sourceId: device.id,
        sourceName: device.name,
        predicate: 'belongsTo',
        targetId: room.id,
        targetName: room.name,
      },
      {
        id: `${device.id}-isInstalledIn-${room.id}`,
        sourceId: device.id,
        sourceName: device.name,
        predicate: 'isInstalledIn',
        targetId: room.id,
        targetName: room.name,
      },
      {
        id: `${device.id}-serves-${room.id}`,
        sourceId: device.id,
        sourceName: device.name,
        predicate: 'serves',
        targetId: room.id,
        targetName: room.name,
      }
    );

    if (device.coverage?.length) {
      relations.push({
        id: `${device.id}-covers-${room.id}`,
        sourceId: device.id,
        sourceName: device.name,
        predicate: 'covers',
        targetId: room.id,
        targetName: room.name,
      });
    }
  });

  connections.forEach(connection => {
    const source = devices.find(device => device.id === connection.sourceId);
    const target = devices.find(device => device.id === connection.targetId);
    if (!source || !target) return;

    relations.push({
      id: `${connection.id}-connectedTo`,
      sourceId: source.id,
      sourceName: source.name,
      predicate: 'connectedTo',
      targetId: target.id,
      targetName: target.name,
    });
  });

  floor.doors.forEach((door, index) => {
    const roomsByDistance = floor.rooms
      .map(room => ({
        room,
        distance: distanceToRectCenter((door.x1 + door.x2) / 2, (door.y1 + door.y2) / 2, room),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);

    if (roomsByDistance.length === 2) {
      relations.push({
        id: `${door.id}-connects-${index}`,
        sourceId: door.id,
        sourceName: `门 ${index + 1}`,
        predicate: 'connects',
        targetId: `${roomsByDistance[0].room.id},${roomsByDistance[1].room.id}`,
        targetName: `${roomsByDistance[0].room.name} / ${roomsByDistance[1].room.name}`,
      });
    }
  });

  return relations;
}

function distanceToRectCenter(x: number, y: number, room: RoomModel) {
  const cx = room.x + room.w / 2;
  const cy = room.y + room.h / 2;
  return Math.hypot(x - cx, y - cy);
}

function filterGraphRelations(relations: GraphRelation[], roomId: string | null, deviceId: string | null) {
  if (deviceId) {
    return relations.filter(relation => relation.sourceId === deviceId || relation.targetId === deviceId);
  }

  if (roomId) {
    return relations.filter(relation => (
      relation.sourceId === roomId ||
      relation.targetId === roomId ||
      relation.targetId.split(',').includes(roomId)
    ));
  }

  return [];
}

function buildSectorPath(x: number, y: number, radius: number, angle: number, rotation: number) {
  const start = ((rotation - angle / 2) * Math.PI) / 180;
  const end = ((rotation + angle / 2) * Math.PI) / 180;
  const startX = x + Math.cos(start) * radius;
  const startY = y + Math.sin(start) * radius;
  const endX = x + Math.cos(end) * radius;
  const endY = y + Math.sin(end) * radius;
  const largeArc = angle > 180 ? 1 : 0;

  return `M ${x} ${y} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;
}

function hexToRgba(hex: string, alpha: number) {
  const cleaned = hex.replace('#', '');
  const numeric = Number.parseInt(cleaned, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildDeviceName(item: LibraryItem, count: number) {
  if (item.kind === 'fp400') return `FP400 ${count}`;
  if (item.kind === 'camera') return `G5 Camera ${count}`;
  if (item.kind === 'hub') return `Hub ${count}`;
  if (item.kind === 'switch') return `Switch ${count}`;
  if (item.kind === 'curtain') return `Curtain ${count}`;
  return `Light ${count}`;
}

function buildDefaultCoverage(kind: DeviceKind, count: number) {
  if (kind === 'fp400') {
    return [
      {
        id: `coverage-${kind}-${count}`,
        type: 'sector' as const,
        radius: 168,
        angle: 118,
        rotation: 35 + (count % 3) * 70,
      },
    ];
  }

  if (kind === 'camera') {
    return [
      {
        id: `coverage-${kind}-${count}`,
        type: 'sector' as const,
        radius: 178,
        angle: 72,
        rotation: 90 + (count % 2) * 120,
      },
    ];
  }

  return undefined;
}

function inferInstallText(kind: DeviceKind) {
  if (kind === 'fp400') return '顶装 2.8m';
  if (kind === 'camera') return '壁装 2.9m';
  if (kind === 'switch') return '门侧 1.2m';
  if (kind === 'curtain') return '窗边顶装';
  if (kind === 'light') return '吊顶';
  return '弱电柜';
}

function labelPositionClass(side: LabelSide) {
  if (side === 'top') return 'left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+9px)]';
  if (side === 'right') return 'left-[calc(100%+9px)] top-1/2 -translate-y-1/2';
  if (side === 'left') return 'right-[calc(100%+9px)] top-1/2 -translate-y-1/2';
  return 'left-1/2 top-[calc(100%+9px)] -translate-x-1/2';
}
