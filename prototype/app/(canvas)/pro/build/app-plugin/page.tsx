'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Smartphone,
  Plus,
  Send,
  Save,
  ChevronDown,
  Eye,
  Camera,
  Thermometer,
  Lightbulb,
  Lock,
  Wind,
  ToggleRight,
  Sliders,
  Bell,
  Activity,
  CheckCircle2,
  Globe,
  Trash2,
  Sparkles,
  Sun,
  Palette,
  Zap,
  Settings,
  X,
  ArrowUp,
  Paperclip,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Device types ─────────────────────

const DEVICE_TYPES = [
  { id: 'light', name: '智能灯', model: 'T1 Pro / Bulb', icon: Lightbulb, color: '#f59e0b', default: true },
  { id: 'camera', name: '摄像头', model: 'G3 / E1', icon: Camera, color: '#ef4444', default: false },
  { id: 'thermostat', name: '温控器', model: 'E1 系列', icon: Thermometer, color: '#06b6d4', default: false },
  { id: 'lock', name: '智能门锁', model: 'D100 / N200', icon: Lock, color: '#a855f7', default: false },
  { id: 'ac', name: '空调伴侣', model: 'P3', icon: Wind, color: '#06b6d4', default: false },
];

// ─── Component palette (light-first) ─

const PALETTE_LIGHT = [
  { id: 'brightness', label: '亮度调节', icon: Sun, color: '#f59e0b' },
  { id: 'color-temp', label: '色温调节', icon: Sliders, color: '#f59e0b' },
  { id: 'color-picker', label: '彩色选择', icon: Palette, color: '#a855f7' },
  { id: 'scene-mode', label: '场景模式', icon: Sparkles, color: '#10b981' },
  { id: 'timer', label: '定时开关', icon: Activity, color: '#06b6d4' },
  { id: 'group-ctrl', label: '分组控制', icon: Zap, color: '#6366f1' },
  { id: 'toggle', label: '开关', icon: ToggleRight, color: '#10b981' },
  { id: 'alert-feed', label: '告警记录', icon: Bell, color: '#ef4444' },
];

const PALETTE_CAMERA = [
  { id: 'live-feed', label: '实时画面', icon: Camera, color: '#ef4444' },
  { id: 'detection', label: '侦测区域', icon: Activity, color: '#f59e0b' },
  { id: 'toggle', label: '开关', icon: ToggleRight, color: '#10b981' },
  { id: 'alert-feed', label: '告警记录', icon: Bell, color: '#ef4444' },
  { id: 'status-bar', label: '设备状态栏', icon: Activity, color: '#6366f1' },
  { id: 'timer', label: '定时计划', icon: Activity, color: '#06b6d4' },
];

const PALETTE_OTHER = [
  { id: 'toggle', label: '开关', icon: ToggleRight, color: '#10b981' },
  { id: 'slider', label: '滑块调节', icon: Sliders, color: '#06b6d4' },
  { id: 'status-bar', label: '状态栏', icon: Activity, color: '#6366f1' },
  { id: 'timer', label: '定时计划', icon: Activity, color: '#06b6d4' },
  { id: 'alert-feed', label: '告警记录', icon: Bell, color: '#ef4444' },
];

function getPalette(deviceId: string) {
  if (deviceId === 'light') return PALETTE_LIGHT;
  if (deviceId === 'camera') return PALETTE_CAMERA;
  return PALETTE_OTHER;
}

// ─── Canvas sections ──────────────────

const LIGHT_SECTIONS = [
  { id: 's1', label: '亮度 & 色温', selected: true },
  { id: 's2', label: '彩色模式', selected: false },
  { id: 's3', label: '场景模式', selected: false },
  { id: 's4', label: '定时 & 日出日落', selected: false },
];

// ─── AI Dialogue overlay ──────────────

function AIDialogue({ open, onClose, context }: { open: boolean; onClose: () => void; context: string }) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [variants, setVariants] = useState<string[]>([]);

  const submit = () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setVariants([]);
    setTimeout(() => {
      setGenerating(false);
      setResult(`已根据「${prompt}」生成灯类详情页：亮度滑块 + 色温调节 + 4 个场景模式快捷，已适配深浅色主题。`);
    }, 1400);
  };

  const genVariants = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setVariants([
        '变体 A：极简风格，仅亮度 + 开关，适合客厅氛围灯',
        '变体 B：完整控制，色温 + 彩色 + 场景 + 分组，适合主卧主灯',
        '变体 C：节能看板风格，显示今日能耗 + 自动时间表',
      ]);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-8 right-8 w-[440px] z-50 rounded-2xl border border-border bg-bg-elevated shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">AI 对话</div>
                <div className="text-2xs text-text-muted truncate">{context}</div>
              </div>
              <div className="flex items-center gap-1">
                {result && (
                  <button onClick={genVariants} disabled={generating} className="text-2xs px-2.5 py-1 rounded-md border border-accent/40 bg-accent/10 text-accent-glow hover:bg-accent/15 transition inline-flex items-center gap-1">
                    <GitBranch size={10} /> 生成变体
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5 text-text-muted"><X size={14} /></button>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
              {!result && !generating && (
                <div className="text-center text-2xs text-text-subtle py-4">
                  <p>描述你想要的设备详情页样式，AI 自动生成布局</p>
                  <p className="mt-1">生成后可「生成变体」对比多种方案</p>
                </div>
              )}
              {generating && <div className="flex items-center gap-2 text-2xs text-text-muted py-2"><RefreshCw size={12} className="animate-spin text-accent-glow" />正在生成...</div>}
              {result && !generating && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-2xs leading-relaxed">
                  <div className="text-accent-glow font-medium mb-1">AI 已生成</div>
                  <p className="text-text-muted">{result}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1.5 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-2xs">应用到画布</button>
                    <button className="px-3 py-1.5 rounded-md border border-border text-text-muted text-2xs">不用</button>
                  </div>
                </div>
              )}
              {variants.length > 0 && (
                <div className="space-y-2">
                  <div className="text-2xs text-text-subtle uppercase tracking-wider">生成变体</div>
                  {variants.map((v, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border hover:border-border-strong bg-bg-elevated/50 cursor-pointer group">
                      <div className="flex items-start gap-2">
                        <GitBranch size={11} className="text-accent-glow mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-2xs text-text-muted group-hover:text-text leading-relaxed">{v}</div>
                        <button className="text-2xs text-accent-glow opacity-0 group-hover:opacity-100 transition">应用</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-bg-elevated px-3 py-2 focus-within:border-border-strong transition">
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(); }}
                  placeholder="描述想要的详情页... 例如「简洁风格，只有亮度和色温」"
                  className="flex-1 bg-transparent outline-none resize-none text-xs text-text placeholder:text-text-subtle leading-relaxed"
                />
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="p-1 text-text-muted hover:text-text"><Paperclip size={13} /></button>
                  <button
                    onClick={submit}
                    disabled={!prompt.trim() || generating}
                    className={cn('w-7 h-7 rounded-lg flex items-center justify-center transition', prompt.trim() && !generating ? 'bg-gradient-to-br from-accent to-accent2 text-white' : 'bg-white/5 text-text-subtle cursor-not-allowed')}
                  >
                    {generating ? <RefreshCw size={11} className="animate-spin" /> : <ArrowUp size={11} />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-text-subtle mt-1.5 px-1">⌘ + Enter 发送 · 每次约 8 A</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main page ────────────────────────

export default function AppPluginStudio() {
  const router = useRouter();
  const [deviceType, setDeviceType] = useState('light');
  const [selectedSection, setSelectedSection] = useState('s1');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [brightness, setBrightness] = useState(70);
  const [colorTemp, setColorTemp] = useState(40);
  const [aiOpen, setAiOpen] = useState(false);

  const activeDevice = DEVICE_TYPES.find(d => d.id === deviceType)!;
  const palette = getPalette(deviceType);

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Header */}
      <header className="h-12 border-b border-border bg-bg/85 backdrop-blur-xl flex items-center px-4 gap-3 flex-shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded text-text-muted hover:text-text hover:bg-white/5">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Smartphone size={14} className="text-cyan-400" />
          <h1 className="text-sm font-medium">设备详情页插件</h1>
          <span className="text-2xs text-text-muted">· App Plugin Forge</span>
        </div>

        {/* Device type selector */}
        <div className="flex items-center gap-1 ml-2 border border-border rounded-lg p-0.5 bg-bg-elevated/50">
          {DEVICE_TYPES.map(d => (
            <button
              key={d.id}
              onClick={() => setDeviceType(d.id)}
              className={cn(
                'text-2xs px-2.5 py-1 rounded-md transition inline-flex items-center gap-1.5',
                deviceType === d.id ? 'bg-bg text-text shadow-sm' : 'text-text-muted hover:text-text'
              )}
            >
              <d.icon size={10} style={{ color: d.color }} />
              {d.name}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <button onClick={() => setAiOpen(true)} className="text-2xs px-3 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent-glow hover:bg-accent/15 transition inline-flex items-center gap-1.5">
          <Sparkles size={11} /> AI 对话
        </button>
        <button className="text-2xs px-2.5 py-1 rounded text-text-muted hover:text-text inline-flex items-center gap-1">
          <Save size={11} /> 保存草稿
        </button>
        <button className="text-2xs px-2.5 py-1 rounded text-text-muted hover:text-text inline-flex items-center gap-1">
          <Eye size={11} /> 真机预览
        </button>
        <Link href="/pro/build/marketplace" className="text-2xs px-3 py-1 rounded-md bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1 font-medium">
          <Send size={10} /> 发布
        </Link>
      </header>

      {/* Body */}
      <div className="flex-1 grid grid-cols-[220px_1fr_280px] min-h-0">

        {/* LEFT — palette */}
        <aside className="border-r border-border flex flex-col min-h-0 bg-bg-elevated/30">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-2xs uppercase tracking-wider text-text-subtle">组件 · {activeDevice.name}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {palette.map(p => (
              <button
                key={p.id}
                className="w-full px-3 py-2.5 rounded-md border border-border hover:border-border-strong bg-bg-elevated/50 text-left flex items-center gap-2.5 group transition"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}18`, border: `1px solid ${p.color}40` }}>
                  <p.icon size={11} style={{ color: p.color }} />
                </div>
                <span className="text-xs text-text-muted group-hover:text-text">{p.label}</span>
                <Plus size={10} className="ml-auto text-text-subtle opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>

          {/* Edit mode tabs */}
          <div className="border-t border-border">
            {([
              { id: 'layout', label: '布局', icon: Smartphone },
              { id: 'style', label: '样式', icon: Palette },
              { id: 'logic', label: '交互逻辑', icon: Activity },
            ] as const).map(t => (
              <button
                key={t.id}
                className="w-full px-4 py-2.5 text-xs text-left flex items-center gap-2 text-text-muted hover:text-text hover:bg-white/[0.03] border-l-2 border-transparent transition"
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER — phone canvas */}
        <main className="flex flex-col min-h-0 items-center bg-white/[0.01] py-6 relative overflow-y-auto">
          <div className="absolute top-3 inset-x-0 flex items-center justify-center gap-2">
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="text-2xs px-2.5 py-1 rounded-md border border-border text-text-muted hover:text-text inline-flex items-center gap-1.5"
            >
              <Palette size={10} /> {theme === 'dark' ? '深色' : '浅色'}
            </button>
            <button className="text-2xs px-2.5 py-1 rounded-md border border-border text-text-muted hover:text-text inline-flex items-center gap-1.5">
              iPhone 15 <ChevronDown size={10} />
            </button>
          </div>

          <div className="mt-4">
            <div className={cn(
              'w-[300px] h-[640px] rounded-[38px] border-8 shadow-2xl overflow-hidden relative',
              theme === 'dark' ? 'border-zinc-900 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'
            )}>
              <div className={cn('absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 rounded-b-2xl z-10', theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-200')} />
              <div className={cn('pt-3 px-5 flex items-center justify-between text-[10px]', theme === 'dark' ? 'text-white/70' : 'text-zinc-600')}>
                <span>21:45</span><span>● ● ●</span>
              </div>

              {/* Detail page — light focused */}
              <div className="px-4 py-2 flex items-center gap-2">
                <span className={cn('text-xs', theme === 'dark' ? 'text-white/60' : 'text-zinc-500')}>←</span>
                <span className={cn('text-sm font-semibold flex-1', theme === 'dark' ? 'text-white' : 'text-zinc-900')}>客厅主灯 · T1 Pro</span>
                <Settings size={14} className={theme === 'dark' ? 'text-white/40' : 'text-zinc-400'} />
              </div>

              <div className="overflow-y-auto px-3 space-y-2.5 pb-4" style={{ height: 'calc(100% - 80px)' }}>
                {/* Power + brightness hero */}
                <button
                  onClick={() => setSelectedSection('s1')}
                  className={cn(
                    'w-full rounded-2xl p-4 transition',
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-zinc-200',
                    selectedSection === 's1' && 'ring-2 ring-accent'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={16} style={{ color: brightness > 0 ? '#f59e0b' : '#6b7280' }} />
                      <span className={cn('text-sm font-semibold', theme === 'dark' ? 'text-white' : 'text-zinc-900')}>
                        {brightness > 0 ? '已开启' : '已关闭'}
                      </span>
                    </div>
                    {/* Toggle */}
                    <button
                      onClick={e => { e.stopPropagation(); setBrightness(b => b > 0 ? 0 : 70); }}
                      className={cn('w-10 h-5 rounded-full relative transition', brightness > 0 ? 'bg-amber-400' : theme === 'dark' ? 'bg-zinc-600' : 'bg-zinc-300')}
                    >
                      <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', brightness > 0 ? 'right-0.5' : 'left-0.5')} />
                    </button>
                  </div>
                  {/* Brightness slider */}
                  <div>
                    <div className={cn('text-[10px] mb-1.5 flex justify-between', theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500')}>
                      <span>亮度</span><span className="num">{brightness}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${brightness}%` }} />
                    </div>
                    <input type="range" min={0} max={100} value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full opacity-0 absolute" onClick={e => e.stopPropagation()} />
                  </div>
                </button>

                {/* Color temp slider */}
                <button
                  onClick={() => setSelectedSection('s2')}
                  className={cn(
                    'w-full rounded-2xl p-4 transition',
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-zinc-200',
                    selectedSection === 's2' && 'ring-2 ring-accent'
                  )}
                >
                  <div className={cn('text-[10px] mb-2 flex justify-between', theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500')}>
                    <span>色温</span>
                    <span>{colorTemp < 33 ? '暖白 2700K' : colorTemp < 66 ? '自然白 4000K' : '冷白 6500K'}</span>
                  </div>
                  <div className="h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #ffd700, #ffffff, #cce6ff)' }} />
                  <div className="mt-2 flex justify-between text-[9px] text-zinc-500">
                    <span>暖</span><span>冷</span>
                  </div>
                </button>

                {/* Scene modes */}
                <button
                  onClick={() => setSelectedSection('s3')}
                  className={cn(
                    'w-full rounded-2xl p-3 transition',
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-zinc-200',
                    selectedSection === 's3' && 'ring-2 ring-accent'
                  )}
                >
                  <div className={cn('text-[10px] mb-2 text-left', theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500')}>场景模式</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { name: '阅读', temp: '#fff5e0', active: false },
                      { name: '影院', temp: '#1a0a2e', active: true },
                      { name: '专注', temp: '#e8f4ff', active: false },
                      { name: '晚安', temp: '#2d1a00', active: false },
                    ].map(s => (
                      <div
                        key={s.name}
                        className={cn(
                          'aspect-square rounded-xl flex flex-col items-center justify-center text-[9px] transition border',
                          s.active ? 'border-amber-400' : theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
                        )}
                        style={{ background: s.temp }}
                      >
                        <span className={s.temp === '#1a0a2e' || s.temp === '#2d1a00' ? 'text-white/80' : 'text-zinc-600'}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </button>

                {/* Schedule */}
                <button
                  onClick={() => setSelectedSection('s4')}
                  className={cn(
                    'w-full rounded-2xl p-3 transition',
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-zinc-200',
                    selectedSection === 's4' && 'ring-2 ring-accent'
                  )}
                >
                  <div className={cn('text-[10px] mb-2 text-left flex justify-between', theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500')}>
                    <span>日出日落自适应</span>
                    <span className="text-success">已开启</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <Sun size={12} className="text-amber-400" />
                    <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-amber-400/30 via-amber-400 to-blue-400/30" />
                    <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}>06:20 → 19:45</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 text-2xs text-text-subtle text-center">点选组件 → 右侧编辑 · 调节滑块实时预览</div>
        </main>

        {/* RIGHT — inspector */}
        <aside className="border-l border-border flex flex-col min-h-0 bg-bg-elevated/30">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-2xs uppercase tracking-wider text-text-subtle">属性面板</span>
            <button className="text-2xs text-rose-400 hover:underline">删除</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {selectedSection === 's1' && <BrightnessInspector />}
            {selectedSection === 's2' && <ColorTempInspector />}
            {selectedSection === 's3' && <SceneInspector />}
            {selectedSection === 's4' && <ScheduleInspector />}
          </div>

          <div className="border-t border-border p-3 space-y-2 text-2xs text-text-muted">
            <div className="flex items-center gap-2"><CheckCircle2 size={11} className="text-success" /> 适配 iOS / Android / 深浅色</div>
            <div className="flex items-center gap-2"><Globe size={11} /> 支持 5 语言本地化</div>
            <div className="pt-2 border-t border-border">发布后：¥18/月/客户 分润给你</div>
          </div>
        </aside>
      </div>

      {/* AI Dialogue */}
      <AIDialogue
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        context={`设备详情页 · ${activeDevice.name}`}
      />
    </div>
  );
}

// ─── Inspector panels ─────────────────

function BrightnessInspector() {
  return (
    <div className="space-y-4">
      <div className="text-xs font-medium">亮度 & 开关组件</div>
      <Field label="默认亮度" value="70%" />
      <div>
        <div className="text-2xs text-text-muted mb-1.5">允许用户操作</div>
        <div className="space-y-1.5">
          {['滑块调节亮度', '点击切换开关', '长按进入场景'].map(a => <Toggle key={a} label={a} on />)}
        </div>
      </div>
      <div>
        <div className="text-2xs text-text-muted mb-1.5">最低亮度限制</div>
        <input type="range" min={0} max={30} defaultValue={5} className="w-full accent-accent" />
        <div className="text-2xs text-text-muted num">5%（防止完全黑屏）</div>
      </div>
    </div>
  );
}

function ColorTempInspector() {
  return (
    <div className="space-y-4">
      <div className="text-xs font-medium">色温滑块组件</div>
      <div>
        <div className="text-2xs text-text-muted mb-1.5">色温范围</div>
        <div className="flex gap-2">
          <div><div className="text-2xs text-text-muted">最暖</div><input defaultValue="2700" className="w-20 px-2 py-1 text-xs rounded border border-border bg-bg-elevated" /></div>
          <div><div className="text-2xs text-text-muted">最冷</div><input defaultValue="6500" className="w-20 px-2 py-1 text-xs rounded border border-border bg-bg-elevated" /></div>
        </div>
      </div>
      <Toggle label="显示色温标签（暖/冷）" on />
      <Toggle label="随日出日落自动调节" on={false} />
    </div>
  );
}

function SceneInspector() {
  return (
    <div className="space-y-4">
      <div className="text-xs font-medium">场景模式组件</div>
      <div className="text-2xs text-text-muted">已配置 4 个场景</div>
      <div className="space-y-2">
        {[
          { name: '阅读', brightness: '80%', temp: '4000K' },
          { name: '影院', brightness: '20%', temp: '2700K' },
          { name: '专注', brightness: '100%', temp: '6500K' },
          { name: '晚安', brightness: '5%', temp: '2200K' },
        ].map(s => (
          <div key={s.name} className="flex items-center gap-2 p-2 rounded border border-border text-2xs">
            <span className="font-medium flex-1">{s.name}</span>
            <span className="text-text-muted num">{s.brightness}</span>
            <span className="text-text-muted num">{s.temp}</span>
            <button className="text-text-muted hover:text-text"><Settings size={10} /></button>
          </div>
        ))}
      </div>
      <button className="w-full py-1.5 text-2xs rounded border border-dashed border-border hover:border-accent/40 text-text-muted hover:text-accent-glow inline-flex items-center justify-center gap-1">
        <Plus size={10} /> 添加场景
      </button>
    </div>
  );
}

function ScheduleInspector() {
  return (
    <div className="space-y-4">
      <div className="text-xs font-medium">日出日落调节组件</div>
      <Toggle label="启用日出日落自适应" on />
      <Field label="位置（用于计算日出日落）" value="上海 · 自动获取" />
      <div className="space-y-1.5">
        <Toggle label="日出时渐亮到 80%" on />
        <Toggle label="日落时渐暗到 40%" on />
        <Toggle label="晚上 10 点后进入晚安模式" on={false} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xs text-text-muted mb-1">{label}</div>
      <input defaultValue={value} className="w-full px-3 py-1.5 text-sm rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none" />
    </div>
  );
}

function Toggle({ label, on }: { label: string; on: boolean }) {
  const [enabled, setEnabled] = useState(on);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-2xs text-text-muted">{label}</span>
      <button onClick={() => setEnabled(e => !e)} className={cn('w-7 h-3.5 rounded-full relative transition', enabled ? 'bg-accent' : 'bg-white/10')}>
        <div className={cn('absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all', enabled ? 'right-0.5' : 'left-0.5')} />
      </button>
    </div>
  );
}
