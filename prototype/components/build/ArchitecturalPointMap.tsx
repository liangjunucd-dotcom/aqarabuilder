'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2, Hand, ZoomIn, ZoomOut, RotateCcw, Plus,
  Video, Radio, Lightbulb, Cpu, DoorOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeviceKind = 'camera' | 'presence' | 'sensor' | 'switch' | 'light' | 'hub';

export type BlueprintDevice = {
  id: string;
  /** 0–100，相对户型图容器 */
  x: number;
  y: number;
  label: string;
  model: string;
  kind: DeviceKind;
  room: string;
};

/** AI 结构化户型点位（4-room BTO 93㎡ · 非客户扫描件） */
export const BTO_BLUEPRINT_DEVICES: BlueprintDevice[] = [
  { id: 'pt-01', x: 50, y: 84, label: '玄关', model: 'FP2E', kind: 'presence', room: 'Foyer' },
  { id: 'pt-02', x: 38, y: 58, label: '客厅主区', model: 'FP2E', kind: 'presence', room: 'Living' },
  { id: 'pt-03', x: 58, y: 52, label: '餐厅灯带', model: 'LED Strip', kind: 'light', room: 'Dining' },
  { id: 'pt-04', x: 72, y: 38, label: '厨房操作台', model: 'P2', kind: 'sensor', room: 'Kitchen' },
  { id: 'pt-05', x: 26, y: 42, label: '主卧', model: 'FP2E', kind: 'presence', room: 'MBR' },
  { id: 'pt-06', x: 18, y: 62, label: '主卫', model: 'T1', kind: 'switch', room: 'Bath' },
  { id: 'pt-07', x: 78, y: 68, label: '次卧 A', model: 'M2', kind: 'sensor', room: 'BR2' },
  { id: 'pt-08', x: 88, y: 48, label: '走廊', model: 'FP2E', kind: 'presence', room: 'Corridor' },
];

export const DEFAULT_BLUEPRINT_DEVICES: BlueprintDevice[] = [
  { id: 'pt-01', x: 48, y: 75, label: '玄关', model: 'M3 Hub', kind: 'hub', room: '玄关' },
  { id: 'pt-02', x: 55, y: 45, label: '客厅', model: 'FP2', kind: 'presence', room: '客厅' },
  { id: 'pt-03', x: 28, y: 38, label: '主卧', model: 'FP2', kind: 'presence', room: '主卧' },
  { id: 'pt-04', x: 72, y: 55, label: '走廊', model: '夜灯', kind: 'light', room: '走廊' },
  { id: 'pt-05', x: 40, y: 82, label: '老人房', model: 'SOS', kind: 'sensor', room: '老人房' },
  { id: 'pt-06', x: 82, y: 35, label: '厨房', model: '人体', kind: 'sensor', room: '厨房' },
];

const KIND_ICON: Record<DeviceKind, typeof Video> = {
  camera: Video,
  presence: Radio,
  sensor: Cpu,
  switch: DoorOpen,
  light: Lightbulb,
  hub: Cpu,
};

const KIND_COLOR: Record<DeviceKind, string> = {
  camera: '#3b82f6',
  presence: '#6366f1',
  sensor: '#06b6d4',
  switch: '#f59e0b',
  light: '#eab308',
  hub: '#8b5cf6',
};

/** 4-room BTO 专业户型（CAD 风格墙体） */
function BtoFloorplanSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 700"
      className={cn('w-full h-full', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid-fine" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="floor-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
      </defs>
      <rect width="1000" height="700" fill="url(#grid-fine)" />
      <rect x="80" y="60" width="840" height="580" fill="url(#floor-fill)" stroke="#1e40af" strokeWidth="8" rx="4" />

      {/* 内墙 */}
      <line x1="80" y1="320" x2="520" y2="320" stroke="#1e40af" strokeWidth="5" />
      <line x1="520" y1="60" x2="520" y2="640" stroke="#1e40af" strokeWidth="5" />
      <line x1="520" y1="480" x2="920" y2="480" stroke="#1e40af" strokeWidth="5" />
      <line x1="720" y1="480" x2="720" y2="640" stroke="#1e40af" strokeWidth="4" />
      <line x1="380" y1="320" x2="380" y2="640" stroke="#1e40af" strokeWidth="4" />

      {/* 玻璃隔断示意 */}
      <line x1="520" y1="200" x2="720" y2="200" stroke="#93c5fd" strokeWidth="3" strokeDasharray="8 6" opacity="0.8" />

      {/* 门洞 + 开门弧 */}
      {[
        [520, 380, 540, 400],
        [380, 320, 400, 340],
        [720, 520, 740, 540],
        [200, 320, 220, 340],
      ].map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fef3c7" strokeWidth="14" />
          <path
            d={`M ${x2} ${y2} A 28 28 0 0 1 ${x2 + 22} ${y2 - 18}`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
          />
        </g>
      ))}

      {/* 家具示意（浅灰） */}
      <rect x="120" y="380" width="220" height="120" rx="6" fill="#e2e8f0" opacity="0.7" />
      <rect x="560" y="100" width="140" height="70" rx="4" fill="#e2e8f0" opacity="0.6" />
      <ellipse cx="620" cy="400" rx="90" ry="55" fill="#e2e8f0" opacity="0.5" />
      <rect x="760" y="520" width="120" height="90" rx="4" fill="#e2e8f0" opacity="0.55" />
      <rect x="820" y="120" width="80" height="50" rx="3" fill="#cbd5e1" opacity="0.5" />

      {/* 房间标注 */}
      {[
        ['Living · 客厅', 300, 200],
        ['Dining · 餐厅', 600, 260],
        ['Kitchen · 厨房', 800, 150],
        ['MBR · 主卧', 220, 480],
        ['BR2 · 次卧', 820, 560],
        ['Foyer · 玄关', 480, 600],
        ['Bath · 卫', 140, 580],
      ].map(([t, x, y]) => (
        <text key={t} x={x} y={y} fill="#64748b" fontSize="18" fontWeight="500" fontFamily="system-ui,sans-serif">
          {t}
        </text>
      ))}

      {/* 比例尺 */}
      <g transform="translate(820, 620)">
        <line x1="0" y1="0" x2="120" y2="0" stroke="#334155" strokeWidth="3" />
        <text x="0" y="22" fill="#64748b" fontSize="14" fontFamily="system-ui">10 m</text>
        <text x="0" y="40" fill="#94a3b8" fontSize="12" fontFamily="system-ui">Scale · Meters</text>
      </g>
    </svg>
  );
}

function DeviceMarker({
  device,
  selected,
  bound,
  pulse,
  onClick,
  variant,
}: {
  device: BlueprintDevice;
  selected: boolean;
  bound?: boolean;
  pulse?: boolean;
  onClick?: () => void;
  variant: '2d' | '3d' | 'mapping';
}) {
  const Icon = KIND_ICON[device.kind];
  const color = KIND_COLOR[device.kind];
  const is3d = variant === '3d';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute z-20 flex flex-col items-center -translate-x-1/2 group',
        is3d ? '-translate-y-[85%]' : '-translate-y-1/2',
        pulse && 'z-30'
      )}
      style={{ left: `${device.x}%`, top: `${device.y}%` }}
    >
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            'rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform',
            selected && 'scale-110 ring-2 ring-blue-400',
            pulse && 'animate-pulse ring-4 ring-amber-300/40',
            bound && 'ring-2 ring-emerald-400',
            is3d ? 'w-9 h-9' : 'w-8 h-8'
          )}
          style={{
            background: `linear-gradient(145deg, ${color}, ${color}cc)`,
            boxShadow: `0 4px 14px ${color}55, 0 0 0 4px ${color}22`,
          }}
        >
          <Icon size={is3d ? 14 : 12} className="text-white" strokeWidth={2.2} />
        </div>
        {is3d && (
          <div
            className="w-1 h-3 rounded-full opacity-60 -mt-0.5"
            style={{ background: color }}
          />
        )}
        <div
          className={cn(
            'mt-1 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap shadow-md border',
            'bg-[#0f172a] text-white border-slate-700/80',
            selected && 'border-blue-400'
          )}
        >
          {device.model}
        </div>
        {variant === '2d' && (
          <span className="text-[9px] text-slate-500 mt-0.5 opacity-0 group-hover:opacity-100 transition">
            {device.room}
          </span>
        )}
      </div>
    </button>
  );
}

function CanvasToolbar() {
  const [tool, setTool] = useState<'select' | 'pan'>('select');
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 px-1.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-lg">
      <button
        type="button"
        onClick={() => setTool('select')}
        className={cn(
          'p-2 rounded-lg transition',
          tool === 'select' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-slate-100'
        )}
        title="选择"
      >
        <MousePointer2 size={14} />
      </button>
      <button
        type="button"
        onClick={() => setTool('pan')}
        className={cn(
          'p-2 rounded-lg transition',
          tool === 'pan' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:bg-slate-100'
        )}
        title="平移"
      >
        <Hand size={14} />
      </button>
      <div className="w-px h-6 bg-slate-200 mx-0.5" />
      <button type="button" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" title="放大">
        <ZoomIn size={14} />
      </button>
      <button type="button" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" title="缩小">
        <ZoomOut size={14} />
      </button>
      <button type="button" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" title="复位">
        <RotateCcw size={14} />
      </button>
      <div className="w-px h-6 bg-slate-200 mx-0.5" />
      <button
        type="button"
        className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 inline-flex items-center gap-1.5"
      >
        <Plus size={12} /> Add Devices
      </button>
    </div>
  );
}

export function ArchitecturalPointMap({
  variant,
  devices,
  selectedId,
  onSelect,
  boundDeviceIds,
  pulseDeviceId,
  title,
  subtitle,
}: {
  variant: '2d' | '3d' | 'mapping';
  devices: BlueprintDevice[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  boundDeviceIds?: Set<string>;
  pulseDeviceId?: string | null;
  title?: string;
  subtitle?: string;
}) {
  const [zoom, setZoom] = useState(1);
  const is3d = variant === '3d';

  return (
    <div className="relative w-full h-full min-h-[320px] overflow-hidden bg-[#e8ecf1]">
      {/* 顶栏说明 */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-start justify-between gap-2 pointer-events-none">
        <div className="rounded-lg bg-white/95 border border-slate-200 px-3 py-2 shadow-sm max-w-[320px]">
          <div className="text-xs font-semibold text-slate-800">{title ?? (is3d ? '3D 空间预览' : '2D 户型点位图')}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
            {subtitle ?? 'AI 结构化户型 · 设备点位可拖拽调整（客户附件仅作需求参考，不作为底图）'}
          </div>
        </div>
        <div className="text-[10px] text-slate-500 bg-white/90 px-2 py-1 rounded border border-slate-200">
          {devices.length} 点位 · 93㎡ 4-Room
        </div>
      </div>

      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-transform duration-200',
          is3d && 'perspective-[1200px]'
        )}
        style={{ transform: is3d ? undefined : `scale(${zoom})` }}
      >
        <div
          className={cn(
            'relative w-[92%] max-w-4xl aspect-[10/7] bg-white rounded-sm shadow-xl border border-slate-200/80',
            is3d && 'origin-bottom',
          )}
          style={
            is3d
              ? {
                  transform: 'rotateX(52deg) rotateZ(-8deg)',
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 40px 80px rgba(15,23,42,0.25), 0 0 0 1px rgba(148,163,184,0.3)',
                }
              : undefined
          }
        >
          <BtoFloorplanSvg />
          {is3d && (
            <>
              <div
                className="absolute inset-0 pointer-events-none rounded-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%)',
                }}
              />
              <div className="absolute -bottom-8 left-[10%] right-[10%] h-16 bg-gradient-to-t from-slate-400/30 to-transparent blur-md pointer-events-none" />
            </>
          )}
          {devices.map(d => (
            <DeviceMarker
              key={d.id}
              device={d}
              variant={variant}
              selected={selectedId === d.id}
              bound={boundDeviceIds?.has(d.id)}
              pulse={pulseDeviceId === d.id}
              onClick={() => onSelect?.(d.id)}
            />
          ))}
        </div>
      </div>

      {variant !== 'mapping' && <CanvasToolbar />}

      {/* 3D 导航罗盘示意 */}
      {is3d && (
        <div className="absolute bottom-16 left-4 z-30 w-12 h-12 rounded-full bg-white/90 border border-slate-200 shadow flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-slate-300 relative">
            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] text-slate-500">N</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 right-4 z-30 card p-3 max-w-[200px] bg-white border-slate-200 shadow-lg"
          >
            {(() => {
              const d = devices.find(x => x.id === selectedId);
              if (!d) return null;
              return (
                <>
                  <div className="text-xs font-semibold text-slate-800">{d.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{d.model} · {d.room}</div>
                  <div className="text-[10px] text-slate-400 mt-1 num">
                    X {d.x.toFixed(1)}% · Y {d.y.toFixed(1)}%
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
