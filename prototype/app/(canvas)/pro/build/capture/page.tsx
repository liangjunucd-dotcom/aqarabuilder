'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Camera,
  Image as ImageIcon,
  Film,
  Sun,
  Moon,
  Cloud,
  Sparkles as Stars,
  Wand2,
  Play,
  RefreshCw,
  Send,
  Save,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit3,
  Zap,
  Check,
  Maximize2,
  Layers3,
  Music,
  Type,
  Hash,
  Globe,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Capture modes ─────────────────────

const CAPTURE_MODES = [
  {
    id: 'multi-angle',
    label: '多机位重构',
    desc: '从一张照片生成俯视 / 平视 / 特写 3 张',
    icon: Camera,
    color: '#6366f1',
    cost: 8,
  },
  {
    id: 'time-shift',
    label: '时间轴',
    desc: '早晨 / 午后 / 黄昏 / 夜晚 4 个时刻',
    icon: Sun,
    color: '#f59e0b',
    cost: 12,
  },
  {
    id: 'seeddance',
    label: 'SeedDance 2.0',
    desc: '6 秒场景视频 · 灯光 / 人物 / 时间流',
    icon: Film,
    color: '#ec4899',
    cost: 30,
    featured: true,
  },
  {
    id: 'persona-story',
    label: 'Persona 故事',
    desc: '一个家人 / 一天 / 12 个镜头',
    icon: Stars,
    color: '#a855f7',
    cost: 50,
  },
  {
    id: 'style-transfer',
    label: '风格化',
    desc: '同一空间套不同风格 · 适老化 / 极简 / 繁奢',
    icon: Layers3,
    color: '#10b981',
    cost: 10,
  },
];

// SeedDance time moments
const TIME_MOMENTS = [
  { id: 'dawn', label: '清晨 6:00', emoji: '🌅', desc: '日出柔光,卧室渐亮,咖啡机预热' },
  { id: 'noon', label: '午后 14:00', emoji: '☀️', desc: '阳光充足,自然通风,Persona 切换' },
  { id: 'dusk', label: '黄昏 18:00', emoji: '🌇', desc: '欢聚时刻,氛围灯渐亮,音乐响起' },
  { id: 'night', label: '深夜 23:00', emoji: '🌙', desc: '调暗灯光,起夜模式待命,门窗布防' },
];

// Sample original photo (using gradient + emoji as placeholder)
const SAMPLE_ROOM = {
  emoji: '🛋️',
  caption: '李先生家客厅 · 原图',
  gradient: 'linear-gradient(135deg,#1e293b 0%,#475569 100%)',
};

export default function CaptureStudio() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'configure' | 'generating' | 'review'>('review');
  const [mode, setMode] = useState('seeddance');
  const [selectedMoments, setSelectedMoments] = useState<string[]>(['dawn', 'noon', 'dusk', 'night']);
  const [titleAI, setTitleAI] = useState('客厅一日 · 06:00 → 23:00 时间穿梭');
  const [descAI, setDescAI] = useState(
    '一个普通客户家的客厅,一天 4 个时刻的真实灯光变化。Aqara FP2 + 智能窗帘 + 氛围灯 T1 Pro 联动,跟着家人作息呼吸。'
  );

  const activeMode = CAPTURE_MODES.find(m => m.id === mode)!;

  const generate = () => {
    setStep('generating');
    setTimeout(() => setStep('review'), 1800);
  };

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Header */}
      <header className="h-12 border-b border-border bg-bg/85 backdrop-blur-xl flex items-center px-4 gap-3 flex-shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded text-text-muted hover:text-text hover:bg-white/5">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-accent-glow" />
          <h1 className="text-sm font-medium">Capture Studio</h1>
          <span className="text-2xs text-text-muted">· 把一张照片变成场景化内容</span>
        </div>
        <div className="flex-1" />
        <span className="text-2xs text-text-muted inline-flex items-center gap-1 mr-2">
          <Zap size={10} className="text-warning" />
          <span className="num">2,840 A</span>
        </span>
        <button className="text-2xs px-2.5 py-1 rounded text-text-muted hover:text-text inline-flex items-center gap-1">
          <Save size={11} /> 保存草稿
        </button>
        <button className="text-2xs px-3 py-1 rounded-md bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1 font-medium">
          <Send size={10} /> 发布到 Discover
        </button>
      </header>

      {/* Body — 3 columns: source/modes / preview / config */}
      <div className="flex-1 grid grid-cols-[280px_1fr_340px] min-h-0">
        {/* LEFT — original + capture modes */}
        <aside className="border-r border-border flex flex-col min-h-0 bg-bg-elevated/30">
          {/* Original source */}
          <div className="p-3 border-b border-border">
            <div className="text-2xs uppercase tracking-wider text-text-subtle mb-2">原始素材</div>
            <div
              className="aspect-[4/3] rounded-md border border-border relative overflow-hidden flex items-center justify-center"
              style={{ background: SAMPLE_ROOM.gradient }}
            >
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <span className="text-6xl opacity-80 relative">{SAMPLE_ROOM.emoji}</span>
              <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/80 truncate">
                {SAMPLE_ROOM.caption}
              </div>
            </div>
            <button className="mt-2 w-full px-2.5 py-1.5 text-2xs rounded border border-dashed border-border hover:border-accent/40 text-text-muted hover:text-accent-glow inline-flex items-center justify-center gap-1.5">
              <Upload size={10} /> 替换 / 加图(支持 1-12 张)
            </button>
          </div>

          {/* Capture modes */}
          <div className="px-3 pt-3 pb-2 text-2xs uppercase tracking-wider text-text-subtle">能力模式</div>
          <div className="flex-1 overflow-y-auto px-3 space-y-1.5">
            {CAPTURE_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  'w-full p-2.5 rounded-md flex items-start gap-2.5 text-left transition border relative',
                  mode === m.id
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-border hover:border-border-strong bg-bg-elevated/50'
                )}
              >
                {m.featured && (
                  <span className="absolute top-1.5 right-1.5 text-[8px] px-1 py-0 rounded bg-accent text-white font-bold tracking-wider">
                    HOT
                  </span>
                )}
                <div
                  className="w-7 h-7 rounded border flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${m.color}15`, borderColor: `${m.color}40` }}
                >
                  <m.icon size={13} style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{m.label}</span>
                    {mode === m.id && <Check size={11} className="text-accent" />}
                  </div>
                  <div className="text-2xs text-text-muted mt-0.5 leading-relaxed">{m.desc}</div>
                  <div className="text-2xs text-text-subtle mt-1 inline-flex items-center gap-0.5">
                    <Zap size={8} className="text-warning" />
                    <span className="num">{m.cost}</span>
                    <span>A</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Value strip */}
          <div className="border-t border-border p-3 text-2xs text-text-muted leading-relaxed">
            💡 用 Capture 生成的内容,在 Discover 平均 <span className="text-success">3.8×</span> 自然流量
          </div>
        </aside>

        {/* CENTER — preview / generation */}
        <main className="flex flex-col min-h-0 bg-white/[0.01] overflow-y-auto">
          {step === 'review' ? (
            <ReviewView mode={activeMode} moments={selectedMoments} />
          ) : step === 'generating' ? (
            <GeneratingView mode={activeMode} />
          ) : (
            <UploadView onGenerate={generate} />
          )}
        </main>

        {/* RIGHT — config + auto-generated content */}
        <aside className="border-l border-border flex flex-col min-h-0 bg-bg-elevated/30 overflow-y-auto">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-2xs uppercase tracking-wider text-text-subtle">配置</div>
          </div>

          {/* Mode-specific config */}
          {mode === 'seeddance' && (
            <div className="p-4 border-b border-border">
              <div className="text-2xs text-text-muted mb-2">时刻选择 (3-6 个)</div>
              <div className="space-y-1.5">
                {TIME_MOMENTS.map(m => {
                  const selected = selectedMoments.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMoments(s =>
                        selected ? s.filter(x => x !== m.id) : [...s, m.id]
                      )}
                      className={cn(
                        'w-full p-2 rounded border text-left flex items-center gap-2 transition',
                        selected
                          ? 'border-accent/40 bg-accent/5'
                          : 'border-border hover:border-border-strong'
                      )}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{m.label}</div>
                        <div className="text-2xs text-text-muted line-clamp-1">{m.desc}</div>
                      </div>
                      {selected && <Check size={11} className="text-accent flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Auto Caption */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-2xs uppercase tracking-wider text-text-subtle">AI 自动文案</div>
              <button className="text-2xs text-accent-glow hover:underline inline-flex items-center gap-1">
                <RefreshCw size={9} /> 重写
              </button>
            </div>
            <div>
              <div className="text-2xs text-text-muted mb-1">标题</div>
              <input
                value={titleAI}
                onChange={e => setTitleAI(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm rounded border border-border bg-bg-elevated outline-none focus:border-border-strong"
              />
            </div>
            <div>
              <div className="text-2xs text-text-muted mb-1">描述</div>
              <textarea
                value={descAI}
                onChange={e => setDescAI(e.target.value)}
                rows={3}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-bg-elevated outline-none focus:border-border-strong resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="p-4 border-b border-border">
            <div className="text-2xs uppercase tracking-wider text-text-subtle mb-2">标签 · AI 自动打</div>
            <div className="flex flex-wrap gap-1.5">
              {['#时间穿梭', '#适老化', '#FP2', '#氛围灯', '#客厅', '#李先生家', '#实拍'].map(t => (
                <span key={t} className="text-2xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-glow border border-accent/30">
                  {t}
                </span>
              ))}
              <button className="text-2xs px-2 py-0.5 rounded-full border border-dashed border-border text-text-muted hover:text-text">
                <Plus size={9} className="inline" /> 加标签
              </button>
            </div>
          </div>

          {/* Publish settings */}
          <div className="p-4 space-y-2">
            <div className="text-2xs uppercase tracking-wider text-text-subtle mb-2">发布设置</div>
            <Row label="可见性" value="公开 (Discover)" />
            <Row label="允许 Apply" value="是" />
            <Row label="允许 Fork" value="是 · CC BY-SA" />
            <Row label="语言" value="中文 + 自动翻译 EN/KR/IT" />
          </div>

          {/* Final stats */}
          <div className="mt-auto border-t border-border p-3 space-y-2">
            <div className="flex items-center justify-between text-2xs">
              <span className="text-text-muted">本次消耗</span>
              <span className="num text-warning">{activeMode.cost} A</span>
            </div>
            <div className="flex items-center justify-between text-2xs">
              <span className="text-text-muted">预估流量(7 天)</span>
              <span className="num text-success">2.4k - 8.6k</span>
            </div>
            <button className="w-full mt-1 px-3 py-2 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5">
              <Send size={11} /> 发布到 Discover
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Views ────────────────────────

function UploadView({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-accent2/20 border border-accent/30 flex items-center justify-center mb-4">
          <Upload size={24} className="text-accent-glow" />
        </div>
        <h2 className="text-lg font-semibold">上传一张项目原图</h2>
        <p className="mt-2 text-sm text-text-muted">
          AI 会自动:多机位重构 / 时间轴生成 / 6 秒场景视频 / 写文案 / 打标签
        </p>
        <button
          onClick={onGenerate}
          className="mt-6 px-5 py-2.5 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-sm font-medium inline-flex items-center gap-2"
        >
          <Sparkles size={13} /> 用样例素材试一试
        </button>
      </div>
    </div>
  );
}

function GeneratingView({ mode }: { mode: any }) {
  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-accent2/20 border border-accent/30 flex items-center justify-center mb-4">
          <RefreshCw size={24} className="text-accent-glow animate-spin" />
        </div>
        <h2 className="text-lg font-semibold">正在生成 · {mode.label}</h2>
        <p className="mt-2 text-sm text-text-muted">
          SeedDance 2.0 正在合成 4 个时刻的画面 · 平均 12 秒
        </p>
      </div>
    </div>
  );
}

function ReviewView({ mode, moments }: { mode: any; moments: string[] }) {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
      {/* Mode info */}
      <div className="card p-4 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-md border flex items-center justify-center flex-shrink-0"
          style={{ background: `${mode.color}15`, borderColor: `${mode.color}40` }}
        >
          <mode.icon size={16} style={{ color: mode.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{mode.label}</div>
          <div className="text-2xs text-text-muted">{mode.desc}</div>
        </div>
        <button className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-border-strong text-text-muted hover:text-text inline-flex items-center gap-1">
          <Wand2 size={10} /> AI 增强 (3 A)
        </button>
        <button className="text-2xs px-2.5 py-1.5 rounded bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1">
          <RefreshCw size={10} /> 重新生成
        </button>
      </div>

      {/* SeedDance result — 4 time-shift frames */}
      {mode.id === 'seeddance' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TIME_MOMENTS.filter(m => moments.includes(m.id)).map((m, i) => {
              const gradients = [
                'linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%)',
                'linear-gradient(135deg,#0ea5e9 0%,#60a5fa 100%)',
                'linear-gradient(135deg,#ec4899 0%,#f59e0b 100%)',
                'linear-gradient(135deg,#1e293b 0%,#6366f1 100%)',
              ];
              return (
                <motion.div
                  key={m.id}
                  initial={{ y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="aspect-[3/5] rounded-lg overflow-hidden relative group cursor-pointer"
                  style={{ background: gradients[i] }}
                >
                  <div className="absolute inset-0 grid-pattern opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl">{m.emoji}</span>
                  </div>
                  <div className="absolute top-2 left-2 text-[10px] text-white/90 font-medium bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded">
                    {m.label}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-2xs text-white/90 leading-relaxed">
                    {m.desc}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <button className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white inline-flex items-center justify-center">
                      <Edit3 size={11} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Combined preview */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Film size={14} className="text-accent-glow" />
                <span className="text-sm font-medium">合成 · 6 秒场景视频</span>
                <span className="text-2xs text-text-muted">SeedDance 2.0 · loop</span>
              </div>
              <button className="text-2xs text-accent-glow hover:underline inline-flex items-center gap-1">
                <Maximize2 size={10} /> 全屏预览
              </button>
            </div>
            <div className="aspect-video rounded-lg bg-gradient-to-br from-amber-500 via-purple-600 to-slate-900 relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <Play size={22} className="text-white ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1">
                {TIME_MOMENTS.filter(m => moments.includes(m.id)).map((m, i) => (
                  <div key={m.id} className="flex-1 h-1 rounded-full overflow-hidden bg-white/20">
                    <div className={cn('h-full bg-white', i === 0 && 'w-1/4', i === 1 && 'w-1/2', i === 2 && 'w-3/4', i === 3 && 'w-full')} />
                  </div>
                ))}
                <span className="text-[10px] text-white/80 num ml-1">6s</span>
              </div>
              <div className="absolute top-3 left-3 text-[10px] text-white/80 inline-flex items-center gap-1.5">
                <Music size={9} /> 自动配乐 · 渐进电子
              </div>
            </div>
          </div>

          {/* Sound track + effects */}
          <div className="grid sm:grid-cols-3 gap-3">
            <Option icon={Music} label="背景音乐" value="渐进电子 (默认)" />
            <Option icon={Sun} label="光照过渡" value="平滑 · 1.5s" />
            <Option icon={Globe} label="水印" value="左下 · @jun" />
          </div>
        </>
      )}

      {/* Multi-angle result */}
      {mode.id === 'multi-angle' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: '俯视', emoji: '🏠', g: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
            { label: '平视', emoji: '🛋️', g: 'linear-gradient(135deg,#06b6d4 0%,#0ea5e9 100%)' },
            { label: '特写', emoji: '💡', g: 'linear-gradient(135deg,#f59e0b 0%,#dc2626 100%)' },
          ].map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="aspect-[4/3] rounded-lg overflow-hidden relative"
              style={{ background: a.g }}
            >
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">{a.emoji}</span>
              </div>
              <div className="absolute top-2 left-2 text-[10px] text-white/90 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded">
                {a.label}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Time-shift result */}
      {mode.id === 'time-shift' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TIME_MOMENTS.map((m, i) => (
            <div key={m.id} className="aspect-square rounded-lg overflow-hidden relative" style={{
              background: ['linear-gradient(135deg,#f59e0b,#fbbf24)', 'linear-gradient(135deg,#0ea5e9,#60a5fa)', 'linear-gradient(135deg,#ec4899,#f59e0b)', 'linear-gradient(135deg,#1e293b,#6366f1)'][i]
            }}>
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center text-5xl">{m.emoji}</div>
              <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/90 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Style transfer */}
      {mode.id === 'style-transfer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: '适老化', emoji: '🌿', g: 'linear-gradient(135deg,#10b981,#06b6d4)' },
            { label: '极简', emoji: '◆', g: 'linear-gradient(135deg,#a8a29e,#44403c)' },
            { label: '繁奢', emoji: '✦', g: 'linear-gradient(135deg,#fbbf24,#dc2626)' },
          ].map((a, i) => (
            <div key={a.label} className="aspect-[4/3] rounded-lg overflow-hidden relative" style={{ background: a.g }}>
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center text-6xl">{a.emoji}</div>
              <div className="absolute top-2 left-2 text-[10px] text-white/90 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded">
                同空间 · {a.label}风格
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Persona story */}
      {mode.id === 'persona-story' && (
        <div className="card p-5">
          <div className="text-sm font-medium mb-3">12 个镜头 · 王奶奶的一天</div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const emojis = ['🌅', '🍵', '🚿', '👵', '📺', '☎️', '🍱', '😴', '🪟', '🌙', '💊', '✨'];
              return (
                <div key={i} className="aspect-square rounded bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-border flex items-center justify-center text-2xl">
                  {emojis[i]}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-2xs text-text-muted">
            12 个镜头组成一个 30 秒的 Persona 故事 · 自动配旁白 · 老人房 + 卫生间 + 客厅
          </div>
        </div>
      )}
    </div>
  );
}

function Option({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="card p-3 flex items-center gap-2.5">
      <Icon size={13} className="text-text-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-2xs text-text-muted">{label}</div>
        <div className="text-xs font-medium truncate">{value}</div>
      </div>
      <ChevronDown size={11} className="text-text-subtle" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-2xs py-1">
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
