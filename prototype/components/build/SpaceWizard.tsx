'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Check, Sparkles,
  Home, Building2, Hotel, Key, Ruler, Layers,
  Cpu, Wifi, Lightbulb, Camera, Thermometer, Bell, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';

export interface SpaceConfig {
  name: string;
  type: SpaceType;
  area: number;
  floors: 1 | 2;
  layoutId: string;
  devices: string[];
  roomCount: number;
}

type SpaceType = 'home' | 'office' | 'hotel' | 'rental';

const SPACE_TYPES = [
  { id: 'home',   icon: Home,      label: '住宅',     desc: '自住 · 家庭成员居住', color: '#6366f1' },
  { id: 'office', icon: Building2, label: '办公',     desc: '工作室 · 小型办公',   color: '#06b6d4' },
  { id: 'hotel',  icon: Hotel,     label: '短租/酒店', desc: '出租 · 民宿 · 酒店房', color: '#f59e0b' },
  { id: 'rental', icon: Key,       label: '出租公寓', desc: '长租 · 合租 · 公寓',   color: '#10b981' },
] as const;

interface Layout {
  id: string;
  label: string;
  rooms: number;
  pattern: 'top' | 'rooms' | 'L' | 'open' | 'cross';
  area: string;
}

const LAYOUTS: Layout[] = [
  { id: 'l1', label: '两室一厅',   rooms: 4, pattern: 'open',  area: '60-90m²' },
  { id: 'l2', label: '三室两厅',   rooms: 5, pattern: 'rooms', area: '90-130m²' },
  { id: 'l3', label: '一居套间',   rooms: 3, pattern: 'top',   area: '30-60m²' },
  { id: 'l4', label: '自定义户型', rooms: 0, pattern: 'cross', area: '任意' },
];

const DEVICE_PRESETS: { id: string; icon: any; label: string; desc: string; recommended: SpaceType[] }[] = [
  { id: 'entry', icon: Lock,        label: '出入口安全',   desc: '门锁 + 门窗传感器', recommended: ['home', 'rental', 'hotel'] },
  { id: 'motion',icon: Layers,      label: '人体感应覆盖', desc: 'FP2 雷达 · 全房间', recommended: ['home', 'office'] },
  { id: 'light', icon: Lightbulb,   label: '智能照明',     desc: '场景灯 + 氛围灯',    recommended: ['home', 'hotel', 'office'] },
  { id: 'env',   icon: Thermometer, label: '环境监控',     desc: 'TVOC + 温湿度传感器', recommended: ['home', 'office'] },
  { id: 'camera',icon: Camera,      label: '安防摄像',     desc: '室内 · 隐私优先模式', recommended: ['rental', 'hotel'] },
  { id: 'notice',icon: Bell,        label: '紧急告警',     desc: '紧急按钮 + 推送通知', recommended: ['home'] },
  { id: 'wifi',  icon: Wifi,        label: '网关 Hub',     desc: 'M3 Pro · 信号覆盖',   recommended: ['home', 'office', 'hotel', 'rental'] },
  { id: 'meter', icon: Cpu,         label: '能耗监控',     desc: '插座 + 电量统计',     recommended: ['rental', 'hotel'] },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onDone: (config: SpaceConfig) => void;
}

export function SpaceWizard({ open, onClose, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [type, setType]     = useState<SpaceType>('home');
  const [name, setName]     = useState('');
  const [area, setArea]     = useState(90);
  const [floors, setFloors] = useState<1 | 2>(1);
  const [layoutId, setLayoutId] = useState('l2');
  const [devices, setDevices]   = useState<string[]>(['entry', 'motion', 'light', 'wifi']);

  const STEPS = ['空间类型', '基本信息', '户型选择', '基础设备'];

  const canNext = (() => {
    if (step === 0) return !!type;
    if (step === 1) return name.trim().length >= 2 && area >= 20;
    if (step === 2) return !!layoutId;
    return true;
  })();

  const layout = LAYOUTS.find(l => l.id === layoutId)!;

  const finish = () => {
    onDone({
      name: name.trim() || `我的${SPACE_TYPES.find(t => t.id === type)!.label}`,
      type, area, floors, layoutId, devices,
      roomCount: layoutId === 'l4' ? 4 : layout.rooms,
    });
    // reset
    setStep(0); setType('home'); setName(''); setArea(90); setFloors(1);
    setLayoutId('l2'); setDevices(['entry', 'motion', 'light', 'wifi']);
    onClose();
  };

  const toggleDevice = (id: string) =>
    setDevices(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="card bg-bg-elevated w-[min(640px,100%)] max-h-[88vh] flex flex-col pointer-events-auto overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">创建空间</div>
                  <div className="text-2xs text-text-muted">步骤 {step + 1} / {STEPS.length} · {STEPS[step]}</div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5">
                  <X size={13} />
                </button>
              </div>

              {/* Progress */}
              <div className="flex border-b border-border flex-shrink-0">
                {STEPS.map((s, i) => (
                  <div key={i} className={cn(
                    'flex-1 py-2 text-center text-2xs transition relative',
                    i === step ? 'text-accent-glow font-medium' : i < step ? 'text-text-muted' : 'text-text-subtle'
                  )}>
                    {i < step && <span className="mr-1 text-success">✓</span>}
                    {s}
                    {i === step && (
                      <motion.div layoutId="wizard-tab" className="absolute bottom-0 left-2 right-2 h-px bg-accent" />
                    )}
                  </div>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* Step 0: Space type */}
                    {step === 0 && (
                      <div>
                        <h2 className="text-base font-semibold mb-1">这是什么类型的空间?</h2>
                        <p className="text-2xs text-text-muted mb-5 leading-relaxed">
                          类型决定 AI 推荐的设备方案和 Persona 模板
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {SPACE_TYPES.map(t => {
                            const Icon = t.icon;
                            const active = type === t.id;
                            return (
                              <button
                                key={t.id}
                                onClick={() => setType(t.id)}
                                className={cn(
                                  'card p-4 text-left transition flex items-start gap-3',
                                  active ? 'border-accent/50 bg-accent/[0.04] ring-1 ring-accent/20' : 'hover:border-border-strong'
                                )}
                              >
                                <div className="w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0"
                                  style={{ background: `${t.color}15`, borderColor: `${t.color}40`, color: t.color }}
                                >
                                  <Icon size={18} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium">{t.label}</span>
                                    {active && <Check size={12} className="text-accent-glow" />}
                                  </div>
                                  <p className="mt-0.5 text-2xs text-text-muted">{t.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 1: Basic info */}
                    {step === 1 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-semibold mb-1">基本信息</h2>
                        <div>
                          <label className="text-2xs text-text-muted block mb-1.5">空间名称</label>
                          <input
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={`如：${type === 'home' ? '张奶奶家 · 主屋' : type === 'office' ? '我的工作室' : type === 'hotel' ? '201 房' : '出租 #1'}`}
                            className="w-full px-3 py-2.5 text-sm rounded-md bg-bg/60 border border-border outline-none focus:border-accent/50 transition"
                          />
                        </div>
                        <div>
                          <label className="text-2xs text-text-muted block mb-1.5">
                            建筑面积 · <span className="num text-text">{area}m²</span>
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range" min={20} max={500} step={10}
                              value={area}
                              onChange={e => setArea(+e.target.value)}
                              className="flex-1 accent-indigo-500"
                            />
                            <input
                              type="number" min={20} max={999}
                              value={area}
                              onChange={e => setArea(+e.target.value)}
                              className="w-20 px-2 py-1.5 text-sm num rounded-md bg-bg/60 border border-border outline-none focus:border-accent/50 text-center"
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-text-subtle mt-1">
                            <span>20m²</span><span>500m²</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-2xs text-text-muted block mb-1.5">楼层数</label>
                          <div className="inline-flex bg-bg/40 rounded p-0.5 border border-border gap-0.5">
                            {([1, 2] as const).map(f => (
                              <button
                                key={f}
                                onClick={() => setFloors(f)}
                                className={cn(
                                  'px-4 py-1.5 text-xs rounded transition',
                                  floors === f ? 'bg-accent/15 text-accent-glow' : 'text-text-muted hover:text-text'
                                )}
                              >
                                {f === 1 ? '单层' : '双层 / 复式'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Layout */}
                    {step === 2 && (
                      <div>
                        <h2 className="text-base font-semibold mb-1">选择户型模板</h2>
                        <p className="text-2xs text-text-muted mb-4 leading-relaxed">
                          AI 会根据户型自动生成空间图谱和设备点位建议
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {LAYOUTS.map(l => {
                            const active = layoutId === l.id;
                            return (
                              <button
                                key={l.id}
                                onClick={() => setLayoutId(l.id)}
                                className={cn(
                                  'card p-3 text-left transition',
                                  active ? 'border-accent/50 bg-accent/[0.04] ring-1 ring-accent/20' : 'hover:border-border-strong'
                                )}
                              >
                                <div className={cn(
                                  'h-28 rounded-md mb-2.5 overflow-hidden relative',
                                  active ? 'ring-1 ring-accent/30' : 'bg-white/[0.03]'
                                )}>
                                  <FloorplanSVG pattern={l.pattern} showDevices={false} className="text-text-subtle" />
                                  {active && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                                      <Check size={10} className="text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs font-medium">{l.label}</div>
                                <div className="text-2xs text-text-muted mt-0.5">
                                  {l.rooms > 0 ? `${l.rooms} 个房间 · ` : ''}{l.area}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Devices */}
                    {step === 3 && (
                      <div>
                        <h2 className="text-base font-semibold mb-1">基础设备配置</h2>
                        <p className="text-2xs text-text-muted mb-4 leading-relaxed">
                          选择要纳入方案的设备类别，AI 会根据空间布局自动推荐数量和位置
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {DEVICE_PRESETS.map(d => {
                            const Icon = d.icon;
                            const active = devices.includes(d.id);
                            const recommended = d.recommended.includes(type);
                            return (
                              <button
                                key={d.id}
                                onClick={() => toggleDevice(d.id)}
                                className={cn(
                                  'card p-3 text-left flex items-start gap-2.5 transition',
                                  active ? 'border-accent/50 bg-accent/[0.04]' : 'hover:border-border-strong'
                                )}
                              >
                                <div className={cn(
                                  'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 border',
                                  active
                                    ? 'border-accent/40 bg-accent/10 text-accent-glow'
                                    : 'border-border bg-bg/60 text-text-muted'
                                )}>
                                  <Icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium">{d.label}</span>
                                    {recommended && !active && (
                                      <span className="text-[9px] px-1 py-0 rounded bg-accent/10 text-accent-glow border border-accent/20 font-medium">推荐</span>
                                    )}
                                    {active && <Check size={10} className="text-accent ml-auto" />}
                                  </div>
                                  <div className="text-[10px] text-text-muted mt-0.5">{d.desc}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Summary */}
                        <div className="mt-4 card p-3 bg-bg/20">
                          <div className="text-2xs text-text-muted">
                            已选 <span className="num text-text font-medium">{devices.length}</span> 类设备 ·
                            AI 将根据 <span className="font-medium text-text">{area}m²</span> 面积预估数量和点位 ·
                            空间创建后可在图谱和点位图中调整
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-border px-5 py-3 flex items-center gap-2 flex-shrink-0 bg-bg/20">
                <button
                  onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
                  className="text-2xs px-3 py-1.5 rounded border border-border hover:border-border-strong text-text-muted inline-flex items-center gap-1"
                >
                  <ChevronLeft size={12} /> {step === 0 ? '取消' : '上一步'}
                </button>
                <div className="flex-1" />
                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <div key={i} className={cn(
                      'w-1.5 h-1.5 rounded-full transition',
                      i === step ? 'bg-accent' : i < step ? 'bg-accent/40' : 'bg-white/10'
                    )} />
                  ))}
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : finish()}
                  disabled={!canNext}
                  className={cn(
                    'text-2xs px-4 py-1.5 rounded font-medium inline-flex items-center gap-1 transition',
                    canNext
                      ? 'bg-gradient-to-br from-accent to-accent2 text-white hover:shadow-lg hover:shadow-accent/30'
                      : 'bg-white/5 text-text-subtle cursor-not-allowed'
                  )}
                >
                  {step === STEPS.length - 1 ? (
                    <><Sparkles size={11} /> 创建空间 · AI 生成方案</>
                  ) : (
                    <>下一步 <ChevronRight size={11} /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
