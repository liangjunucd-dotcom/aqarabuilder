'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Boxes,
  Cable,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  ListTree,
  LocateFixed,
  MapPin,
  Network,
  Pencil,
  Plus,
  Radar,
  Router,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlink,
  Wifi,
  Workflow,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProtocolId = 'all' | 'matter' | 'aqaraHub' | 'zigbee' | 'wifi';
type TabId = 'detail' | 'add' | 'list';
type DeviceStatus = 'online' | 'attention';
type FloorLabel = '1F' | '2F';

interface ProtocolDefinition {
  id: Exclude<ProtocolId, 'all'>;
  name: string;
  nodeId: string;
  summary: string;
  runtimeRole: string;
  solutionSource: string;
  icon: LucideIcon;
  tags: string[];
  children: string[];
}

interface DeviceRecord {
  id: string;
  protocolId: Exclude<ProtocolId, 'all'>;
  name: string;
  category: string;
  room: string;
  install: string;
  signal: string;
  status: DeviceStatus;
  lastSeen: string;
  position: '已定位' | '待定位';
  mountedBy: 'Builder Pro' | 'Installer' | 'Studio';
}

interface CandidateDevice {
  id: string;
  protocolId: Exclude<ProtocolId, 'all'>;
  name: string;
  suggestedRoom: string;
  install: string;
  note: string;
}

interface FloorPlanPoint {
  id: string;
  protocolId: Exclude<ProtocolId, 'all'>;
  floor: FloorLabel;
  room: string;
  label: string;
  install: string;
  source: 'Builder Pro' | 'Installer' | 'Studio';
  x: number;
  y: number;
  boundDeviceId?: string;
  retainedDeviceName?: string;
}

const PROTOCOLS: ProtocolDefinition[] = [
  {
    id: 'matter',
    name: 'Matter',
    nodeId: '154fae6',
    summary: '跨品牌设备接入与本地自动化编排。',
    runtimeRole: '运行编排主链路',
    solutionSource: 'Builder Pro 方案包 v3',
    icon: Network,
    tags: ['网络', '连接', 'Builder Pro', '已部署'],
    children: ['Fabric 01', 'AqaraHub Bridge'],
  },
  {
    id: 'aqaraHub',
    name: 'AqaraHub',
    nodeId: 'aqh-230c',
    summary: '本地网关、子设备接入与离线控制。',
    runtimeRole: '本地控制中枢',
    solutionSource: 'Installer 现场部署',
    icon: Router,
    tags: ['网关', '本地', '运行中'],
    children: ['Hub M3 · 一层', 'Hub E1 · 二层'],
  },
  {
    id: 'zigbee',
    name: 'Zigbee',
    nodeId: 'zgb-88d2',
    summary: '末端感知与执行设备的稳定接入层。',
    runtimeRole: '感知与执行网络',
    solutionSource: 'Builder Pro + Installer',
    icon: Radar,
    tags: ['传感', '执行', '已部署'],
    children: ['传感器集群', '执行器集群'],
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    nodeId: 'wifi-17af',
    summary: '高带宽设备与可视化终端接入层。',
    runtimeRole: '可视化与音视频终端',
    solutionSource: 'Installer 现场接入',
    icon: Wifi,
    tags: ['高带宽', '音视频', '运行中'],
    children: ['Cameras', 'Panels', 'Speakers'],
  },
];

const DEVICES: DeviceRecord[] = [
  {
    id: 'matter-1',
    protocolId: 'matter',
    name: '客厅面板 S1 Pro',
    category: '中控面板',
    room: '客厅',
    install: '电视墙 1.4m',
    signal: '稳定',
    status: 'online',
    lastSeen: '刚刚',
    position: '已定位',
    mountedBy: 'Builder Pro',
  },
  {
    id: 'matter-2',
    protocolId: 'matter',
    name: '餐厅调光模块 H1',
    category: '调光模块',
    room: '餐厅',
    install: '吊顶检修口',
    signal: '稳定',
    status: 'online',
    lastSeen: '2 分钟前',
    position: '已定位',
    mountedBy: 'Installer',
  },
  {
    id: 'matter-3',
    protocolId: 'matter',
    name: '书房灯带 T1',
    category: '灯光',
    room: '书房',
    install: '书墙洗墙位',
    signal: '一般',
    status: 'attention',
    lastSeen: '18 分钟前',
    position: '待定位',
    mountedBy: 'Studio',
  },
  {
    id: 'aqh-1',
    protocolId: 'aqaraHub',
    name: 'Hub M3 主网关',
    category: '网关',
    room: '家庭厅',
    install: '弱电柜',
    signal: '优秀',
    status: 'online',
    lastSeen: '刚刚',
    position: '已定位',
    mountedBy: 'Installer',
  },
  {
    id: 'aqh-2',
    protocolId: 'aqaraHub',
    name: 'Hub E1 二层扩展',
    category: '网关扩展',
    room: '楼厅',
    install: '吊顶检修口',
    signal: '稳定',
    status: 'online',
    lastSeen: '1 分钟前',
    position: '已定位',
    mountedBy: 'Installer',
  },
  {
    id: 'zigbee-1',
    protocolId: 'zigbee',
    name: 'FP400 客厅',
    category: '存在传感器',
    room: '客厅',
    install: '顶装 2.8m',
    signal: '优秀',
    status: 'online',
    lastSeen: '刚刚',
    position: '已定位',
    mountedBy: 'Builder Pro',
  },
  {
    id: 'zigbee-2',
    protocolId: 'zigbee',
    name: 'FP400 家庭厅',
    category: '存在传感器',
    room: '家庭厅',
    install: '顶装 2.8m',
    signal: '优秀',
    status: 'online',
    lastSeen: '刚刚',
    position: '已定位',
    mountedBy: 'Builder Pro',
  },
  {
    id: 'zigbee-3',
    protocolId: 'zigbee',
    name: '玄关开关 D1',
    category: '开关',
    room: '玄关',
    install: '门侧 1.2m',
    signal: '稳定',
    status: 'online',
    lastSeen: '8 分钟前',
    position: '已定位',
    mountedBy: 'Installer',
  },
  {
    id: 'zigbee-4',
    protocolId: 'zigbee',
    name: '主卧窗帘 C3',
    category: '窗帘',
    room: '主卧',
    install: '窗边顶装',
    signal: '稳定',
    status: 'online',
    lastSeen: '22 分钟前',
    position: '已定位',
    mountedBy: 'Builder Pro',
  },
  {
    id: 'zigbee-5',
    protocolId: 'zigbee',
    name: '厨房温湿度 T1',
    category: '环境传感器',
    room: '厨房',
    install: '高柜内侧',
    signal: '一般',
    status: 'attention',
    lastSeen: '43 分钟前',
    position: '已定位',
    mountedBy: 'Studio',
  },
  {
    id: 'wifi-1',
    protocolId: 'wifi',
    name: 'G5 Gallery',
    category: '摄像头',
    room: '廊厅',
    install: '墙角 2.9m',
    signal: '优秀',
    status: 'online',
    lastSeen: '刚刚',
    position: '已定位',
    mountedBy: 'Builder Pro',
  },
  {
    id: 'wifi-2',
    protocolId: 'wifi',
    name: '门厅 G5 Pro',
    category: '摄像头',
    room: '玄关',
    install: '门楣 2.7m',
    signal: '优秀',
    status: 'online',
    lastSeen: '3 分钟前',
    position: '已定位',
    mountedBy: 'Installer',
  },
  {
    id: 'wifi-3',
    protocolId: 'wifi',
    name: 'E7 Audience',
    category: '音视频终端',
    room: '会客区',
    install: '侧墙机柜',
    signal: '稳定',
    status: 'online',
    lastSeen: '6 分钟前',
    position: '已定位',
    mountedBy: 'Installer',
  },
  {
    id: 'wifi-4',
    protocolId: 'wifi',
    name: '茶室中控屏 C2',
    category: '中控面板',
    room: '茶室',
    install: '矮柜上方',
    signal: '稳定',
    status: 'online',
    lastSeen: '10 分钟前',
    position: '待定位',
    mountedBy: 'Studio',
  },
];

const FLOOR_PLAN_POINTS: FloorPlanPoint[] = [
  { id: 'pt-living-panel', protocolId: 'matter', floor: '1F', room: '客厅', label: '电视墙面板点位', install: '电视墙 1.4m', source: 'Builder Pro', x: 31, y: 24, boundDeviceId: 'matter-1' },
  { id: 'pt-dining-dimmer', protocolId: 'matter', floor: '1F', room: '餐厅', label: '餐厅调光点位', install: '吊顶检修口', source: 'Installer', x: 49, y: 25, boundDeviceId: 'matter-2' },
  { id: 'pt-study-strip', protocolId: 'matter', floor: '1F', room: '书房', label: '书墙灯带点位', install: '书墙洗墙位', source: 'Studio', x: 47, y: 75, boundDeviceId: 'matter-3' },
  { id: 'pt-family-hub', protocolId: 'aqaraHub', floor: '1F', room: '家庭厅', label: '主网关点位', install: '弱电柜', source: 'Installer', x: 32, y: 55, boundDeviceId: 'aqh-1' },
  { id: 'pt-upper-hub', protocolId: 'aqaraHub', floor: '2F', room: '楼厅', label: '二层扩展点位', install: '吊顶检修口', source: 'Installer', x: 31, y: 29, boundDeviceId: 'aqh-2' },
  { id: 'pt-living-fp400', protocolId: 'zigbee', floor: '1F', room: '客厅', label: '客厅存在点位', install: '顶装 2.8m', source: 'Builder Pro', x: 27, y: 25, boundDeviceId: 'zigbee-1' },
  { id: 'pt-family-fp400', protocolId: 'zigbee', floor: '1F', room: '家庭厅', label: '家庭厅存在点位', install: '顶装 2.8m', source: 'Builder Pro', x: 43, y: 48, boundDeviceId: 'zigbee-2' },
  { id: 'pt-foyer-switch', protocolId: 'zigbee', floor: '1F', room: '玄关', label: '玄关开关点位', install: '门侧 1.2m', source: 'Installer', x: 12, y: 24, boundDeviceId: 'zigbee-3' },
  { id: 'pt-master-curtain', protocolId: 'zigbee', floor: '2F', room: '主卧', label: '主卧窗帘点位', install: '窗边顶装', source: 'Builder Pro', x: 53, y: 24, boundDeviceId: 'zigbee-4' },
  { id: 'pt-kitchen-env', protocolId: 'zigbee', floor: '1F', room: '厨房', label: '厨房环境点位', install: '高柜内侧', source: 'Studio', x: 56, y: 51, boundDeviceId: 'zigbee-5' },
  { id: 'pt-gallery-camera', protocolId: 'wifi', floor: '1F', room: '廊厅', label: '廊厅摄像头点位', install: '墙角 2.9m', source: 'Builder Pro', x: 63, y: 25, boundDeviceId: 'wifi-1' },
  { id: 'pt-foyer-camera', protocolId: 'wifi', floor: '1F', room: '玄关', label: '门厅摄像头点位', install: '门楣 2.7m', source: 'Installer', x: 15, y: 20, boundDeviceId: 'wifi-2' },
  { id: 'pt-media-audience', protocolId: 'wifi', floor: '1F', room: '会客区', label: '音视频终端点位', install: '侧墙机柜', source: 'Installer', x: 70, y: 54, boundDeviceId: 'wifi-3' },
  { id: 'pt-tea-panel', protocolId: 'wifi', floor: '1F', room: '茶室', label: '茶室中控屏点位', install: '矮柜上方', source: 'Studio', x: 88, y: 27, boundDeviceId: 'wifi-4' },
  { id: 'pt-tea-light-spare', protocolId: 'matter', floor: '1F', room: '茶室', label: '茶室灯带预留点位', install: '吊顶模块盒', source: 'Builder Pro', x: 86, y: 34, retainedDeviceName: 'Matter 调光模块 T2' },
  { id: 'pt-terrace-camera-spare', protocolId: 'wifi', floor: '1F', room: '露台', label: '露台摄像头预留点位', install: '檐下 2.8m', source: 'Builder Pro', x: 76, y: 78, retainedDeviceName: 'G100 Terrace' },
];

const CANDIDATES: CandidateDevice[] = [
  {
    id: 'candidate-1',
    protocolId: 'matter',
    name: 'Matter 调光模块 T2',
    suggestedRoom: '茶室',
    install: '吊顶模块盒',
    note: '建议先挂到茶室，再到户型图校正灯带位置。',
  },
  {
    id: 'candidate-2',
    protocolId: 'aqaraHub',
    name: 'Hub M100 扩展网关',
    suggestedRoom: '书房',
    install: '书柜检修位',
    note: '二层弱覆盖区域补点。',
  },
  {
    id: 'candidate-3',
    protocolId: 'zigbee',
    name: '门磁 P2',
    suggestedRoom: '客卧',
    install: '门框侧边',
    note: '与客房欢迎场景联动。',
  },
  {
    id: 'candidate-4',
    protocolId: 'wifi',
    name: 'G100 Terrace',
    suggestedRoom: '露台',
    install: '檐下 2.8m',
    note: '建议同步加入户型图巡检视图。',
  },
];

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'detail', label: '协议详情' },
  { id: 'add', label: '添加设备' },
  { id: 'list', label: '设备列表' },
];

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceRecord[]>(DEVICES);
  const [floorPlanPoints, setFloorPlanPoints] = useState<FloorPlanPoint[]>(FLOOR_PLAN_POINTS);
  const [selectedProtocolId, setSelectedProtocolId] = useState<ProtocolId>('matter');
  const [activeTab, setActiveTab] = useState<TabId>('detail');
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    matter: true,
    aqaraHub: true,
    zigbee: false,
    wifi: false,
  });

  const selectedProtocol = PROTOCOLS.find(protocol => protocol.id === selectedProtocolId) ?? null;
  const scopedProtocolIds = selectedProtocolId === 'all' ? PROTOCOLS.map(protocol => protocol.id) : [selectedProtocolId];
  const scopedDevices = devices.filter(device => scopedProtocolIds.includes(device.protocolId));
  const scopedPoints = floorPlanPoints.filter(point => scopedProtocolIds.includes(point.protocolId));
  const visibleDevices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return scopedDevices;
    return scopedDevices.filter(device =>
      [device.name, device.room, device.install, device.category].some(value => value.toLowerCase().includes(query))
    );
  }, [scopedDevices, search]);
  const visibleCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return CANDIDATES.filter(candidate => scopedProtocolIds.includes(candidate.protocolId)).filter(candidate => {
      if (!query) return true;
      return [candidate.name, candidate.suggestedRoom, candidate.install].some(value => value.toLowerCase().includes(query));
    });
  }, [scopedProtocolIds, search]);

  const positionedCount = scopedDevices.filter(device => device.position === '已定位').length;
  const attentionCount = scopedDevices.filter(device => device.status === 'attention').length;
  const overallAttentionCount = devices.filter(device => device.status === 'attention').length;

  const detailTags = selectedProtocol ? selectedProtocol.tags : ['运行总览', '已部署', '协议网络'];
  const detailTitle = selectedProtocol ? selectedProtocol.name : '全部设备';
  const detailId = selectedProtocol ? selectedProtocol.nodeId : 'studio-runtime';
  const detailSummary = selectedProtocol ? selectedProtocol.summary : '聚合查看当前 Studio 已接入协议与设备运行状态。';
  const detailRole = selectedProtocol ? selectedProtocol.runtimeRole : 'Studio 运行总览';
  const detailSource = selectedProtocol ? selectedProtocol.solutionSource : 'Builder Pro 方案包 + Installer 部署';
  const detailStatus = attentionCount > 0 ? '需处理' : '正常';
  const DetailIcon = selectedProtocol?.icon ?? Boxes;

  const toggleGroup = (id: string) => {
    setExpandedGroups(current => ({ ...current, [id]: !current[id] }));
  };

  const handleScopeChange = (next: ProtocolId) => {
    setSelectedProtocolId(next);
    setActiveTab(next === 'all' ? 'list' : 'detail');
    setSearch('');
  };

  const removeRuntimeDevice = (device: DeviceRecord) => {
    setDevices(current => current.filter(item => item.id !== device.id));
    setFloorPlanPoints(current => current.map(point => (
      point.boundDeviceId === device.id
        ? { ...point, boundDeviceId: undefined, retainedDeviceName: device.name }
        : point
    )));
  };

  return (
    <div className="p-3 sm:p-4 xl:p-5">
      <div className="overflow-hidden rounded-[30px] border border-[#dbe3ef] bg-[#f4f7fb] shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-4 p-3 xl:grid-cols-[258px_minmax(0,1fr)] xl:p-4">
          <aside className="rounded-[24px] border border-[#dde4ef] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between border-b border-[#edf2f7] px-4 py-4">
              <div className="text-[15px] font-semibold text-[#1b2230]">设备树</div>
              <div className="flex items-center gap-1">
                <IconGhostButton icon={Plus} label="添加协议" />
                <IconGhostButton icon={ListTree} label="切换视图" />
              </div>
            </div>

            <div className="px-3 py-3">
              <button
                type="button"
                onClick={() => handleScopeChange('all')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left transition',
                  selectedProtocolId === 'all' ? 'bg-[#eef4ff] text-[#245fd1]' : 'text-[#202530] hover:bg-[#f6f8fb]'
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#f4f7fb] text-[#5f6675]">
                  <Boxes size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium">查看全部设备</span>
                  <span className="mt-0.5 block text-[12px] text-[#8a94a5]">{devices.length} 台设备 · {overallAttentionCount} 台需处理</span>
                </span>
              </button>
            </div>

            <div className="space-y-1 px-3 pb-4">
              {PROTOCOLS.map(protocol => {
                const protocolDevices = devices.filter(device => device.protocolId === protocol.id);
                const isExpanded = expandedGroups[protocol.id];
                const isActive = selectedProtocolId === protocol.id;
                const hasAttention = protocolDevices.some(device => device.status === 'attention');
                return (
                  <div key={protocol.id} className="rounded-[18px]">
                    <button
                      type="button"
                      onClick={() => {
                        toggleGroup(protocol.id);
                        handleScopeChange(protocol.id);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-[16px] px-3 py-3 text-left transition',
                        isActive ? 'bg-[#eef4ff] text-[#245fd1]' : 'text-[#202530] hover:bg-[#f6f8fb]'
                      )}
                    >
                      <span className="text-[#98a1b0]">{isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#f4f7fb] text-[#5f6675]">
                        <protocol.icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-medium">{protocol.name}</span>
                        <span className="mt-0.5 block text-[12px] text-[#8a94a5]">{protocolDevices.length} 台设备</span>
                      </span>
                      {hasAttention && <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />}
                    </button>

                    {isExpanded && (
                      <div className="ml-12 mt-1 space-y-1 border-l border-[#edf2f7] pl-4">
                        {protocol.children.map(child => (
                          <button
                            key={child}
                            type="button"
                            onClick={() => handleScopeChange(protocol.id)}
                            className="flex w-full items-center gap-2 rounded-[12px] px-2 py-2 text-left text-[13px] text-[#5f6675] transition hover:bg-[#f6f8fb]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#c8d0dd]" />
                            <span className="truncate">{child}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0 space-y-4">
            <div className="rounded-[24px] border border-[#dde4ef] bg-white px-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-center gap-6">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'border-b-2 px-1 py-4 text-[15px] font-medium transition',
                      activeTab === tab.id
                        ? 'border-[#4c67ff] text-[#315dff]'
                        : 'border-transparent text-[#667085] hover:text-[#202530]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'detail' && (
              <>
                <div className="rounded-[24px] border border-[#dde4ef] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                    <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-[20px] bg-[#0f1116] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                      <DetailIcon size={40} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-[30px] font-semibold tracking-[-0.05em] text-[#1b2230]">{detailTitle}</div>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e3e9f2] bg-white text-[#7d8595] transition hover:bg-[#f7faff]"
                          aria-label="编辑协议"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <StatusChip status={detailStatus} />
                        <span className="text-[14px] text-[#667085]">{detailSummary}</span>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <InlineMetric label="协议 ID" value={detailId} />
                        <InlineMetric label="设备数" value={`${scopedDevices.length}`} />
                        <InlineMetric label="运行状态" value={detailStatus} />
                      </div>
                    </div>
                  </div>
                </div>

                <SectionShell
                  title="标记标签"
                  actionLabel="+ 添加"
                  icon={Sparkles}
                >
                  <div className="flex flex-wrap gap-3">
                    {detailTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-[#dde4ef] bg-[#fafcff] px-3 py-2 text-[13px] font-medium text-[#394150]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </SectionShell>

                <SectionShell
                  title="值标签"
                  actionLabel="+ 添加"
                  icon={Cable}
                >
                  <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    <FieldCard label="ID" value={detailId} />
                    <FieldCard label="显示名称" value={detailTitle} />
                    <FieldCard label="设备数" value={`${scopedDevices.length} 台`} />
                    <FieldCard label="方案来源" value={detailSource} />
                    <FieldCard label="运行角色" value={detailRole} />
                    <FieldCard label="网络健康" value={detailStatus} />
                  </div>
                </SectionShell>
              </>
            )}

            {activeTab === 'add' && (
              <>
                <SectionShell title="接入流程" icon={ShieldCheck}>
                  <div className="grid gap-3 xl:grid-cols-3">
                    <FlowCard
                      index="01"
                      title="选择接入协议"
                      detail={selectedProtocol ? `当前选择 ${selectedProtocol.name}` : '先在左侧设备树选择协议范围。'}
                    />
                    <FlowCard
                      index="02"
                      title="挂载空间"
                      detail="设备接入后立即绑定到房间，避免成为孤立设备。"
                    />
                    <FlowCard
                      index="03"
                      title="校正户型图点位"
                      detail="完成接入后去空间管理微调安装位置和覆盖范围。"
                    />
                  </div>
                </SectionShell>

                <SectionShell title="待添加设备" icon={Plus}>
                  <ToolbarSearch
                    value={search}
                    onChange={setSearch}
                    placeholder="搜索待添加设备、建议空间或安装位置"
                  />

                  <div className="mt-4 space-y-3">
                    {visibleCandidates.map(candidate => {
                      const protocol = PROTOCOLS.find(item => item.id === candidate.protocolId)!;
                      return (
                        <div
                          key={candidate.id}
                          className="flex flex-col gap-4 rounded-[20px] border border-[#edf2f7] bg-[#fafcff] p-4 xl:flex-row xl:items-center xl:justify-between"
                        >
                          <div className="min-w-0 flex items-start gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#0f1116] text-white">
                              <protocol.icon size={18} />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[16px] font-semibold text-[#1b2230]">{candidate.name}</span>
                                <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[12px] font-medium text-[#245fd1]">{protocol.name}</span>
                              </div>
                              <div className="mt-1 text-[13px] text-[#667085]">建议挂载到 {candidate.suggestedRoom} · {candidate.install}</div>
                              <div className="mt-2 text-[13px] text-[#8a94a5]">{candidate.note}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex h-10 items-center rounded-[15px] bg-[#1768ff] px-4 text-[14px] font-medium text-white shadow-[0_12px_24px_rgba(23,104,255,0.22)] transition hover:brightness-110"
                            >
                              添加并挂载
                            </button>
                            <Link
                              href="/studio/spaces"
                              className="inline-flex h-10 items-center rounded-[15px] border border-[#dbe3ef] bg-white px-4 text-[14px] font-medium text-[#202530] transition hover:border-[#bfd5ff] hover:bg-[#f7faff]"
                            >
                              打开户型图
                            </Link>
                          </div>
                        </div>
                      );
                    })}

                    {visibleCandidates.length === 0 && (
                      <EmptyState
                        title="没有匹配的待添加设备"
                        detail="切换协议范围或清空搜索后再试。"
                      />
                    )}
                  </div>
                </SectionShell>
              </>
            )}

            {activeTab === 'list' && (
              <SectionShell title="设备列表" icon={Cpu}>
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <ToolbarSearch
                    value={search}
                    onChange={setSearch}
                    placeholder="搜索设备名称、空间或安装位置"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#7d8595]">
                    <MiniPill icon={CheckCircle2} label={`已定位 ${positionedCount}`} success />
                    <MiniPill icon={AlertTriangle} label={`需处理 ${attentionCount}`} warning={attentionCount > 0} />
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-[20px] border border-[#edf2f7]">
                  <table className="min-w-full bg-white">
                    <thead className="bg-[#fafcff]">
                      <tr className="text-left text-[12px] font-medium text-[#8a94a5]">
                        <th className="px-4 py-3">设备</th>
                        <th className="px-4 py-3">空间</th>
                        <th className="px-4 py-3">安装位置</th>
                        <th className="px-4 py-3">信号</th>
                        <th className="px-4 py-3">状态</th>
                        <th className="px-4 py-3">点位</th>
                        <th className="px-4 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDevices.map(device => {
                        const protocol = PROTOCOLS.find(item => item.id === device.protocolId)!;
                        const point = floorPlanPoints.find(item => item.boundDeviceId === device.id);
                        return (
                          <tr key={device.id} className="border-t border-[#edf2f7] text-[14px] text-[#202530]">
                            <td className="px-4 py-4">
                              <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#0f1116] text-white">
                                  <protocol.icon size={16} />
                                </span>
                                <div className="min-w-0">
                                  <div className="font-medium text-[#1b2230]">{device.name}</div>
                                  <div className="mt-1 text-[12px] text-[#8a94a5]">{device.category} · {protocol.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">{device.room}</td>
                            <td className="px-4 py-4">
                              <div className="text-[#202530]">{device.install}</div>
                              <div className="mt-1 text-[12px] text-[#8a94a5]">{device.mountedBy} 挂载 · {device.lastSeen}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="rounded-full bg-[#f4f7fb] px-2.5 py-1 text-[12px] font-medium text-[#4a5567]">{device.signal}</span>
                            </td>
                            <td className="px-4 py-4">
                              <StatusChip status={device.status === 'online' ? '正常' : '需处理'} compact />
                            </td>
                            <td className="px-4 py-4">
                              <Link
                                href={`/studio/spaces?point=${point?.id ?? device.id}`}
                                className={cn(
                                  'inline-flex h-9 items-center gap-2 rounded-[14px] border px-3 text-[13px] font-medium transition hover:border-[#bfd5ff] hover:bg-[#f7faff]',
                                  point ? 'border-[#dbe3ef] bg-white text-[#202530]' : 'border-[#ffd7a8] bg-[#fff6ea] text-[#cb7a14]'
                                )}
                              >
                                <LocateFixed size={14} />
                                {point ? (device.position === '已定位' ? '查看点位' : '校正点位') : '创建点位'}
                              </Link>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() => removeRuntimeDevice(device)}
                                className="inline-flex h-9 items-center gap-2 rounded-[14px] border border-[#f2d5d5] bg-white px-3 text-[13px] font-medium text-[#c0392b] transition hover:bg-[#fff5f5]"
                                title="删除真实设备，保留户型图点位"
                              >
                                <Trash2 size={14} />
                                删除设备
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {visibleDevices.length === 0 && (
                    <EmptyState
                      title="没有匹配的设备"
                      detail="尝试切换协议范围，或者清空搜索条件。"
                      bordered
                    />
                  )}
                </div>

                <div className="mt-4">
                  <SpaceMountTopology
                    devices={visibleDevices}
                    points={scopedPoints}
                    allDevices={devices}
                  />
                </div>
              </SectionShell>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function IconGhostButton({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#7d8595] transition hover:bg-[#f5f7fb] hover:text-[#202530]"
      aria-label={label}
    >
      <Icon size={15} />
    </button>
  );
}

function StatusChip({
  status,
  compact,
}: {
  status: string;
  compact?: boolean;
}) {
  const positive = status === '正常';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium',
        positive
          ? 'border-[#b9e3c5] bg-[#eafaf0] text-[#159947]'
          : 'border-[#ffd7a8] bg-[#fff6ea] text-[#cb7a14]',
        compact && 'px-2.5'
      )}
    >
      {status}
    </span>
  );
}

function InlineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[13px] text-[#8a94a5]">{label}</div>
      <div className="mt-1 text-[16px] font-semibold text-[#1b2230]">{value}</div>
    </div>
  );
}

function SectionShell({
  title,
  icon: Icon,
  actionLabel,
  actionHref,
  children,
}: {
  title: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
}) {
  const action = actionLabel
    ? actionHref
      ? (
        <Link
          href={actionHref}
          className="inline-flex h-8 items-center rounded-[12px] border border-[#dbe3ef] bg-white px-3 text-[13px] font-medium text-[#4a5567] transition hover:border-[#bfd5ff] hover:bg-[#f7faff]"
        >
          {actionLabel}
        </Link>
      )
      : (
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-[12px] border border-[#dbe3ef] bg-white px-3 text-[13px] font-medium text-[#4a5567] transition hover:border-[#bfd5ff] hover:bg-[#f7faff]"
        >
          {actionLabel}
        </button>
      )
    : null;

  return (
    <div className="rounded-[24px] border border-[#dde4ef] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[15px] font-semibold text-[#1b2230]">
          <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#eef4ff] text-[#245fd1]">
            <Icon size={15} />
          </span>
          {title}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FieldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#edf2f7] bg-[#fafcff] p-4">
      <div className="flex items-center gap-2 text-[13px] text-[#4a5567]">
        <Network size={14} className="text-[#98a1b0]" />
        {label}
      </div>
      <div className="mt-3 rounded-[14px] border border-[#e6ebf3] bg-[#f4f7fb] px-3 py-3 text-[15px] font-medium text-[#7d8595]">
        {value}
      </div>
    </div>
  );
}

function MiniPill({
  icon: Icon,
  label,
  success,
  warning,
}: {
  icon: LucideIcon;
  label: string;
  success?: boolean;
  warning?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium',
        success && 'bg-[#eafaf0] text-[#159947]',
        warning && 'bg-[#fff6ea] text-[#cb7a14]',
        !success && !warning && 'bg-[#f4f7fb] text-[#4a5567]'
      )}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}

function SpaceMountTopology({
  devices,
  points,
  allDevices,
}: {
  devices: DeviceRecord[];
  points: FloorPlanPoint[];
  allDevices: DeviceRecord[];
}) {
  const deviceById = new Map(allDevices.map(device => [device.id, device]));
  const visibleDeviceIds = new Set(devices.map(device => device.id));
  const visiblePoints = points.filter(point => !point.boundDeviceId || visibleDeviceIds.has(point.boundDeviceId));
  const boundCount = visiblePoints.filter(point => point.boundDeviceId && deviceById.has(point.boundDeviceId)).length;
  const vacantCount = visiblePoints.length - boundCount;
  const pendingCount = visiblePoints.filter(point => {
    const device = point.boundDeviceId ? deviceById.get(point.boundDeviceId) : null;
    return !device || device.position === '待定位' || device.status === 'attention';
  }).length;
  const rooms = Array.from(new Set(visiblePoints.map(point => point.room)));

  return (
    <div className="rounded-[20px] border border-[#edf2f7] bg-[#fafcff] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[16px] font-semibold text-[#1b2230]">空间分配与点位</div>
          <div className="mt-1 text-[13px] text-[#7d8595]">仅表达设备归属空间和户型图点位绑定，不参与协议网络拓扑。</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <MiniPill icon={CheckCircle2} label={`已绑定 ${boundCount}`} success />
          <MiniPill icon={Unlink} label={`未绑定 ${vacantCount}`} warning={vacantCount > 0} />
          <MiniPill icon={AlertTriangle} label={`需校正 ${pendingCount}`} warning={pendingCount > 0} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {rooms.map(room => {
          const roomPoints = visiblePoints.filter(point => point.room === room);
          const roomBound = roomPoints.filter(point => point.boundDeviceId && deviceById.has(point.boundDeviceId)).length;
          return (
            <div key={room} className="rounded-[18px] border border-[#e6ebf3] bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-[#1b2230]">{room}</div>
                <div className="text-[12px] text-[#8a94a5]">{roomBound}/{roomPoints.length} 已绑定</div>
              </div>
              <div className="mt-3 space-y-2">
                {roomPoints.map(point => {
                  const device = point.boundDeviceId ? deviceById.get(point.boundDeviceId) : null;
                  const empty = !device;
                  const needsAttention = device?.status === 'attention' || device?.position === '待定位';
                  return (
                    <Link
                      key={point.id}
                      href={`/studio/spaces?point=${point.id}`}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-[14px] border px-3 py-2 transition hover:border-[#bfd5ff] hover:bg-[#f7faff]',
                        empty ? 'border-dashed border-[#f4c27a] bg-[#fffaf0]' : needsAttention ? 'border-[#ffd7a8] bg-[#fffaf5]' : 'border-[#edf2f7] bg-[#fbfcff]'
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-[#202530]">{device?.name ?? point.retainedDeviceName ?? point.label}</span>
                        <span className="mt-0.5 block truncate text-[12px] text-[#8a94a5]">{point.floor} · {point.install}</span>
                      </span>
                      <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium', empty ? 'bg-[#fff1d6] text-[#c26a00]' : needsAttention ? 'bg-[#fff1d6] text-[#c26a00]' : 'bg-[#eafaf0] text-[#159947]')}>
                        {empty ? '未绑定' : needsAttention ? '待校正' : '已绑定'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
        {rooms.length === 0 && (
          <EmptyState title="暂无空间分配" detail="当前筛选范围内没有设备点位。" bordered />
        )}
      </div>
    </div>
  );
}

function FlowCard({
  index,
  title,
  detail,
}: {
  index: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#edf2f7] bg-[#fafcff] p-4">
      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#98a1b0]">{index}</div>
      <div className="mt-3 text-[16px] font-semibold text-[#1b2230]">{title}</div>
      <div className="mt-2 text-[13px] leading-6 text-[#7d8595]">{detail}</div>
    </div>
  );
}

function ToolbarSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full xl:max-w-[360px]">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98a1b0]" />
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[16px] border border-[#e3e9f2] bg-[#fafcff] pl-11 pr-4 text-[14px] text-[#1b2230] outline-none transition focus:border-[#bfd5ff] focus:bg-white"
      />
    </div>
  );
}

function EmptyState({
  title,
  detail,
  bordered,
}: {
  title: string;
  detail: string;
  bordered?: boolean;
}) {
  return (
    <div className={cn('rounded-[20px] bg-[#fafcff] px-4 py-10 text-center', bordered && 'border-t border-[#edf2f7]')}>
      <div className="text-[16px] font-semibold text-[#1b2230]">{title}</div>
      <div className="mt-2 text-[13px] text-[#7d8595]">{detail}</div>
    </div>
  );
}
