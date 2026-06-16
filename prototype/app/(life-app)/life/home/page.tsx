'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, Bell, Zap, Sparkles, Phone,
  Home as HomeIcon, Cpu, User, ClipboardList, ChevronRight, X, ThumbsUp,
  Mic,
} from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '../../components/BottomNav'
import { ApplyReveal } from '../../components/ApplyReveal'
import { LIFE_CATEGORIES, LIFE_PLUGINS, HOT_PLAYS, type LifePlugin, type HotPlay } from '@/lib/mock/life-plugins'

type Persona = 'dad' | 'kid' | 'nanny' | 'elderly'
type HomeMode = 'empty' | 'remote' | 'local-unbound'
type ConfigState = 'none' | 'pending' | 'accepted'

type ServiceItem = { id: number; name: string; emoji: string; status: string; statusColor: string; desc: string }
type SceneItem  = { id: string; name: string; emoji: string; active?: boolean }
type DeviceItem = { id: string; name: string; emoji: string; location: string; status: string; on: boolean }

type PersonaConfig = {
  greeting: string
  services: ServiceItem[]
  scenes?: SceneItem[]
  devices?: DeviceItem[]
  tabs: { label: string; icon: any; href: string }[]
  previewTabs: string[]
  scale?: 'large'
}

// ── Installer-configured personas (Builder 下发，千人千面) ────────────────────
const installerConfigs: Record<Persona, PersonaConfig> = {
  dad: {
    greeting: '早上好，Jun',
    services: [
      { id: 1, name: '家庭安防', emoji: '🛡️', status: '已布防',      statusColor: 'text-success', desc: '门窗全部关闭，摄像头运行中' },
      { id: 2, name: '能耗管理', emoji: '⚡',  status: '本月 38 kWh', statusColor: 'text-accent',  desc: '比上月节省 12%' },
      { id: 3, name: '空气质量', emoji: '🌿',  status: '优 · 12 μg',  statusColor: 'text-success', desc: '净化器运行中' },
    ],
    scenes: [
      { id: 's1', name: '回家',  emoji: '🏠' },
      { id: 's2', name: '影院',  emoji: '🎬', active: true },
      { id: 's3', name: '睡眠',  emoji: '🌙' },
      { id: 's4', name: '离家',  emoji: '🚪' },
      { id: 's5', name: '早安',  emoji: '☀️' },
      { id: 's6', name: '派对',  emoji: '🎉' },
    ],
    devices: [
      { id: 'd1', name: '摄像头',   emoji: '📷', location: '客厅', status: '录制中',    on: true  },
      { id: 'd2', name: '门锁',     emoji: '🔒', location: '大门', status: '已上锁',    on: true  },
      { id: 'd3', name: '空调',     emoji: '❄️', location: '卧室', status: '制冷 26°C', on: true  },
      { id: 'd4', name: '客厅灯',   emoji: '💡', location: '客厅', status: '已关闭',    on: false },
      { id: 'd5', name: '净化器',   emoji: '🌬️', location: '书房', status: '自动模式',  on: true  },
      { id: 'd6', name: '扫地机器人', emoji: '🤖', location: '全屋', status: '充电中',    on: false },
    ],
    tabs: [
      { label: '首页', icon: HomeIcon, href: '/life/home?mode=remote&config=accepted&persona=dad' },
      { label: '设备', icon: Cpu,      href: '/life/devices' },
      { label: '场景', icon: Zap,      href: '/life/scenes' },
      { label: '我的', icon: User,     href: '/life/me' },
    ],
    previewTabs: ['首页', '设备', '场景', '我的'],
  },
  kid: {
    greeting: '嗨，小朋友 👋',
    services: [
      { id: 1, name: '学习照明', emoji: '💡', status: '护眼模式',   statusColor: 'text-accent',  desc: '色温 4000K，亮度 70%' },
      { id: 2, name: '空气质量', emoji: '🌿', status: '优',         statusColor: 'text-success', desc: 'PM2.5 · 12 μg/m³' },
      { id: 3, name: '作息提醒', emoji: '⏰', status: '22:30 睡觉', statusColor: 'text-warning', desc: '还有 2.5 小时' },
    ],
    tabs: [
      { label: '首页', icon: HomeIcon, href: '/life/home?mode=remote&config=accepted&persona=kid' },
      { label: '玩法', icon: Sparkles, href: '/life/home?mode=remote&config=accepted&persona=kid' },
      { label: '我的', icon: User,     href: '/life/me' },
    ],
    previewTabs: ['首页', '玩法', '我的'],
  },
  nanny: {
    greeting: '你好，小李',
    services: [
      { id: 1, name: '今日任务', emoji: '✅', status: '3 / 5 完成', statusColor: 'text-warning', desc: '还有 2 项待完成' },
      { id: 2, name: '门锁记录', emoji: '🔑', status: '09:12 进门', statusColor: 'text-text',    desc: '今日最后记录' },
      { id: 3, name: '购物清单', emoji: '🛒', status: '4 件待购',   statusColor: 'text-accent',  desc: '鸡蛋 / 牛奶 / 蔬菜...' },
    ],
    tabs: [
      { label: '首页', icon: HomeIcon,      href: '/life/home?mode=remote&config=accepted&persona=nanny' },
      { label: '任务', icon: ClipboardList, href: '/life/tasks' },
      { label: '我的', icon: User,          href: '/life/me' },
    ],
    previewTabs: ['首页', '任务', '我的'],
  },
  elderly: {
    greeting: '您好，奶奶 👋',
    services: [
      { id: 1, name: '紧急呼救', emoji: '🆘', status: '待机中',    statusColor: 'text-danger',  desc: '长按呼叫按钮立即联系家人' },
      { id: 2, name: '用药提醒', emoji: '💊', status: '今日已服',  statusColor: 'text-success', desc: '下次提醒：晚 7:00' },
      { id: 3, name: '健康睡眠', emoji: '🌙', status: '7.5 小时',  statusColor: 'text-success', desc: '昨晚睡眠质量：良好' },
    ],
    tabs: [
      { label: '首页', icon: HomeIcon, href: '/life/home?mode=remote&config=accepted&persona=elderly' },
      { label: '呼救', icon: Phone,    href: '#' },
      { label: '我的', icon: User,     href: '/life/me' },
    ],
    previewTabs: ['首页', '呼救', '我的'],
    scale: 'large',
  },
}

// ── Plugin marketplace ────────────────────────────────────────────────────────
function PluginCard({ p, hasStudio, studioName }: { p: LifePlugin; hasStudio: boolean; studioName?: string }) {
  const locked = p.studioOnly && !hasStudio
  const href = `/life/plugin/${p.id}${studioName ? `?studio=${encodeURIComponent(studioName)}` : ''}`
  return (
    <Link href={href} className="block">
      <div className={`relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br ${p.gradient} ring-1 ring-white/10`}>
        <span className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-lg select-none">
          {p.emoji}
        </span>
        {locked && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-2xl">
            <span className="text-3xl">🔒</span>
          </div>
        )}
        {p.studioOnly && (
          <span className="absolute top-2 left-2 text-2xs bg-black/60 backdrop-blur-sm text-white/90 px-1.5 py-0.5 rounded-md leading-none">
            需 Studio
          </span>
        )}
      </div>
      <div className="pt-2 pb-1 px-0.5">
        <p className="text-sm font-semibold text-text leading-tight line-clamp-1">{p.name}</p>
        <p className="text-2xs text-text-subtle mt-0.5 flex items-center gap-1">
          <ThumbsUp size={9} className="inline shrink-0" /> {p.rating}%
          <span className="text-border-strong">·</span>
          <span>{p.installs}</span>
        </p>
      </div>
    </Link>
  )
}

function HotPlayCard({ p, hasStudio }: { p: HotPlay; hasStudio: boolean }) {
  const locked = p.studioOnly && !hasStudio
  return (
    <div className="cursor-pointer">
      <div className={`relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br ${p.gradient} ring-1 ring-white/10`}>
        <span className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-lg select-none">
          {p.emoji}
        </span>
        {locked && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-2xl">
            <span className="text-3xl">🔒</span>
          </div>
        )}
        {p.studioOnly && (
          <span className="absolute top-2 left-2 text-2xs bg-black/60 backdrop-blur-sm text-white/90 px-1.5 py-0.5 rounded-md leading-none">
            需 Studio
          </span>
        )}
      </div>
      <div className="pt-2 pb-1 px-0.5">
        <p className="text-sm font-semibold text-text leading-tight">{p.name}</p>
        <p className="text-2xs text-text-subtle mt-0.5 flex items-center gap-1">
          <ThumbsUp size={9} className="inline shrink-0" /> {p.rating}%
          <span className="text-border-strong">·</span>
          <span>{p.installs}</span>
        </p>
      </div>
    </div>
  )
}

function PluginSection({ title, emoji, plugins, hasStudio, studioName }: {
  title: string; emoji: string; plugins: LifePlugin[]
  hasStudio: boolean; studioName?: string
}) {
  if (plugins.length === 0) return null
  return (
    <div className="px-4 mb-7">
      <div className="flex items-center justify-between mb-3">
        <p className="text-base font-bold text-text">{emoji} {title}</p>
        <button className="text-2xs text-accent">全部</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {plugins.map(p => <PluginCard key={p.id} p={p} hasStudio={hasStudio} studioName={studioName} />)}
      </div>
    </div>
  )
}

function PluginMarket({ hasStudio, compact, studioName }: { hasStudio: boolean; compact?: boolean; studioName?: string }) {
  if (compact) {
    const top = LIFE_PLUGINS.filter(p => !p.studioOnly || hasStudio).slice(0, 6)
    return (
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-text">插件市场</p>
          <Link href="#" className="text-2xs text-accent">全部 →</Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {top.map(p => (
            <Link key={p.id} href={`/life/plugin/${p.id}${studioName ? `?studio=${encodeURIComponent(studioName)}` : ''}`} className="block">
              <div className={`relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br ${p.gradient}`}>
                <span className="absolute inset-0 flex items-center justify-center text-3xl">{p.emoji}</span>
              </div>
              <p className="text-2xs font-medium text-text mt-1.5 line-clamp-1 px-0.5">{p.name}</p>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const recommended = LIFE_PLUGINS.filter(p => !p.studioOnly || hasStudio).slice(0, 4)

  return (
    <>
      {/* 为你推荐 */}
      <PluginSection
        title="为你推荐" emoji="✨"
        plugins={recommended}
        hasStudio={hasStudio} studioName={studioName}
      />

      {/* Per-category vertical sections */}
      {LIFE_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
        <PluginSection
          key={cat.id}
          title={cat.label} emoji={cat.emoji}
          plugins={LIFE_PLUGINS.filter(p => p.category === cat.id)}
          hasStudio={hasStudio} studioName={studioName}
        />
      ))}

      {/* Hot plays */}
      <div className="px-4 mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold text-text">🔥 热门玩法</p>
          <button className="text-2xs text-accent">全部</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {HOT_PLAYS.map(p => <HotPlayCard key={p.id} p={p} hasStudio={hasStudio} />)}
        </div>
      </div>
    </>
  )
}

// ── AI Agent button ────────────────────────────────────────────────────────────
function AIAgent() {
  return (
    <Link href="/life/credits"
      className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-bg-subtle transition-colors group">
      <div className="relative w-7 h-7">
        <motion.div
          className="absolute inset-0 rounded-full opacity-40 blur-md"
          style={{ background: 'conic-gradient(from 0deg, #f59e0b, #ec4899, #8b5cf6, #f59e0b)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'conic-gradient(from 0deg, #f59e0b, #ec4899, #8b5cf6, #f59e0b)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-1 rounded-full bg-bg flex items-center justify-center">
          <Sparkles size={11} className="text-white"/>
        </div>
      </div>
    </Link>
  )
}

function NotifBell() {
  return (
    <Link href="/life/notifications"
      className="relative p-2 rounded-xl hover:bg-bg-subtle transition-colors">
      <Bell size={18} className="text-text-muted"/>
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border border-bg"/>
    </Link>
  )
}

function StudioPillSmall({ name = 'M300 Studio' }: { name?: string }) {
  return (
    <Link href={`/life/studios?studio=${encodeURIComponent(name)}`}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-bg-subtle">
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60"/>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"/>
      </span>
      <span className="text-2xs font-medium text-text">{name}</span>
      <ChevronDown size={10} className="text-text-subtle"/>
    </Link>
  )
}

function AIAssistBar() {
  return (
    <div className="space-y-2">
      {/* Main AI chat entry */}
      <Link href="/life/ai" className="block relative group">
        <div
          className="absolute -inset-px rounded-2xl opacity-60 group-hover:opacity-90 transition-opacity blur-[1px]"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #3b82f6)' }}
        />
        <div className="relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 via-accent to-pink-500 flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-white"/>
          </div>
          <span className="text-sm text-text-subtle flex-1">告诉 AI 你想让家做什么…</span>
          <Mic size={16} className="text-text-subtle shrink-0"/>
        </div>
      </Link>
    </div>
  )
}

// ── MDNS bottom sheet ──────────────────────────────────────────────────────────
function MdnsSheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 z-20" onClick={onClose}/>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-3xl z-30 px-5 pb-8">
        <div className="w-10 h-1 bg-border-strong rounded-full mx-auto mt-3 mb-4"/>
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60"/>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"/>
          </span>
          <p className="text-sm font-semibold text-text">发现附近的 Studio</p>
        </div>
        <p className="text-2xs text-text-muted mb-4 leading-relaxed">在当前局域网中发现了 1 台未绑定的 M300 Studio，是否前往设置？</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-sm text-text-subtle font-medium">忽略</button>
          <Link href="/life/studios/add" onClick={onClose}
            className="flex-[2] py-3 rounded-xl bg-accent text-white text-sm font-semibold text-center">去设置</Link>
        </div>
      </motion.div>
    </>
  )
}

// ── Installer config confirmation sheet ───────────────────────────────────────
function InstallerConfigSheet({ persona, onAccept, onDecline }: {
  persona: Persona; onAccept: () => void; onDecline: () => void
}) {
  const cfg = installerConfigs[persona]
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 z-20" onClick={onDecline}/>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-3xl z-30 px-5 pb-8">
        <div className="w-10 h-1 bg-border-strong rounded-full mx-auto mt-3 mb-5"/>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-accent">王</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text">王工 为你定制了专属主页</p>
            <p className="text-2xs text-text-subtle">Aqara 授权服务商 · 上海</p>
          </div>
        </div>
        <p className="text-2xs text-text-muted mb-4 leading-relaxed">
          根据你的家庭情况，为您配置了个性化布局和服务。启用后 Tab 栏和首页内容将随之变更，你随时可以在「我的」中恢复默认。
        </p>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-subtle border border-border mb-5">
          <p className="text-2xs text-text-subtle shrink-0">新 Tab：</p>
          <div className="flex gap-1.5 flex-wrap">
            {cfg.previewTabs.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-2xs text-accent font-medium">{t}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onDecline} className="flex-1 py-3 rounded-xl border border-border text-sm text-text-subtle font-medium">保持默认</button>
          <button onClick={onAccept} className="flex-[2] py-3 rounded-xl bg-accent text-white text-sm font-semibold">启用专属配置</button>
        </div>
      </motion.div>
    </>
  )
}

// ── Scene row ─────────────────────────────────────────────────────────────────
function SceneRow({ scenes }: { scenes: SceneItem[] }) {
  const [active, setActive] = useState<string | null>(
    scenes.find(s => s.active)?.id ?? null
  )
  return (
    <div className="px-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-text">场景</p>
        <button className="text-2xs text-accent">全部</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {scenes.map(s => {
          const isOn = active === s.id
          return (
            <button
              key={s.id}
              onClick={() => setActive(isOn ? null : s.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border shrink-0 transition-all ${
                isOn
                  ? 'border-accent/40 bg-accent/12 text-accent'
                  : 'border-border bg-bg-subtle text-text-subtle hover:border-border-strong'
              }`}
            >
              <span className="text-base leading-none">{s.emoji}</span>
              <span className="text-2xs font-medium">{s.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Device grid ───────────────────────────────────────────────────────────────
function DeviceCard({ d }: { d: DeviceItem }) {
  const [on, setOn] = useState(d.on)
  return (
    <div className={`rounded-2xl border p-3.5 transition-all ${
      on ? 'border-border bg-bg-subtle' : 'border-border/60 bg-bg opacity-70'
    }`}>
      <div className="flex items-start justify-between mb-5">
        <span className={`text-3xl leading-none transition-all ${on ? '' : 'grayscale opacity-50'}`}>
          {d.emoji}
        </span>
        <button
          onClick={() => setOn(v => !v)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            on ? 'bg-accent/20 border border-accent/40' : 'bg-bg border border-border'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
            className={on ? 'text-accent' : 'text-text-subtle'}>
            <path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 22v-4M19.07 19.07l-2.83-2.83M22 12h-4M19.07 4.93l-2.83 2.83"/>
          </svg>
        </button>
      </div>
      <p className="text-sm font-semibold text-text leading-tight">{d.name}</p>
      <p className="text-2xs text-text-subtle mt-0.5">{d.location} · {d.status}</p>
    </div>
  )
}

function DeviceGrid({ devices }: { devices: DeviceItem[] }) {
  return (
    <div className="px-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-text">设备</p>
        <button className="text-2xs text-accent">全部</button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {devices.map(d => <DeviceCard key={d.id} d={d} />)}
      </div>
    </div>
  )
}

// ── Service card ──────────────────────────────────────────────────────────────
function ServiceCard({ svc, large }: { svc: ServiceItem; large?: boolean }) {
  return (
    <Link href={`/life/services/${svc.id}`}
      className={`flex items-center gap-3.5 ${large ? 'p-5' : 'p-4'} rounded-2xl border border-border bg-bg-subtle hover:bg-bg transition-colors`}>
      <div className={`${large ? 'w-14 h-14 text-3xl' : 'w-11 h-11 text-2xl'} rounded-xl bg-bg border border-border flex items-center justify-center shrink-0`}>
        {svc.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${large ? 'text-base' : 'text-sm'} font-medium text-text`}>{svc.name}</p>
        <p className={`${large ? 'text-xs' : 'text-2xs'} text-text-muted mt-0.5 truncate`}>{svc.desc}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`${large ? 'text-sm' : 'text-xs'} font-semibold ${svc.statusColor}`}>{svc.status}</p>
        <ChevronRight size={large ? 14 : 12} className="text-text-subtle mt-0.5 ml-auto"/>
      </div>
    </Link>
  )
}

// ── Studio discovery banner ────────────────────────────────────────────────────
function StudioDiscoveryBanner({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="px-4 mb-3 overflow-hidden">
      <Link href="/life/studios/add"
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-accent/30 bg-accent/8">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60"/>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"/>
        </span>
        <span className="text-2xs text-accent font-medium flex-1">发现附近 1 台未绑定 Studio</span>
        <span className="text-2xs text-accent">连接 →</span>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose() }} className="ml-1">
          <X size={12} className="text-accent/60"/>
        </button>
      </Link>
    </motion.div>
  )
}

// ── Unified Home (solo + Studio without installer config) ─────────────────────
// Tabs stay as solo (发现/设备/我的) — no tab change until installer config applied
function UnifiedHome({ hasStudio, studioName, appliedConfigId }: {
  hasStudio: boolean; studioName?: string; appliedConfigId?: string
}) {
  const [discovered, setDiscovered] = useState(true)

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-text">Home</p>
          {hasStudio && <StudioPillSmall name={studioName}/>}
        </div>
        <div className="flex items-center gap-1">
          <AIAgent/>
          <NotifBell/>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* AI bar */}
        <div className="px-4 pt-2 mb-4">
          <AIAssistBar/>
        </div>

        {/* Studio connected — empty state (no config applied yet) */}
        {hasStudio ? (
          <>
            {/* Section header */}
            <div className="flex items-center justify-between px-5 mb-1">
              <p className="text-base font-semibold text-text">常用</p>
            </div>

            {/* Centred empty-state — generous whitespace, no buttons */}
            <div className="flex flex-col items-center justify-center px-8 text-center"
              style={{ paddingTop: '15vw', paddingBottom: '12vw', minHeight: 200 }}>
              <motion.p
                className="text-2xl font-bold text-text mb-3 leading-snug"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                开始设计你的家
              </motion.p>
              <motion.p
                className="text-sm text-text-muted leading-relaxed"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.22 }}
              >
                向下探索插件市场，找到适合你家的玩法
              </motion.p>
              <motion.p
                className="text-xl mt-8 text-text-subtle/40 select-none"
                initial={{ opacity: 0 }} animate={{ opacity: [0, 0.4, 0] }}
                transition={{ delay: 0.8, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                ↓
              </motion.p>
            </div>
          </>
        ) : (
          /* MDNS discovery banner — solo only */
          discovered && (
            <StudioDiscoveryBanner onClose={() => setDiscovered(false)}/>
          )
        )}

        <PluginMarket hasStudio={hasStudio} studioName={studioName}/>
      </div>

      {/* Tab bar stays SOLO — no change just from entering Studio without config */}
      <BottomNav active="发现" mode="solo" studioName={studioName}
        studioExtra={appliedConfigId ? `applied=${appliedConfigId}` : undefined}/>
    </>
  )
}

// ── Installer Home (after persona config applied) ─────────────────────────────
function InstallerHome({ persona, studioName, studioExtra }: {
  persona: Persona; studioName?: string; studioExtra?: string
}) {
  const p = installerConfigs[persona]
  const isLarge = p.scale === 'large'

  function studioHref(base: string) {
    if (!studioName) return base
    const studioQ = `studio=${encodeURIComponent(studioName)}`
    const extraQ  = studioExtra ? `&${studioExtra}` : ''
    if (base.includes('config=accepted')) {
      const sep = base.includes('?') ? '&' : '?'
      return `${base}${sep}${studioQ}${extraQ}`
    }
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}${studioQ}&config=accepted&persona=${persona}${extraQ}`
  }

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <p className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-bold text-text`}>Home</p>
          <StudioPillSmall name={studioName}/>
        </div>
        <div className="flex items-center gap-1">
          <AIAgent/>
          <NotifBell/>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 mb-5">
          <AIAssistBar/>
        </div>

        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className={`${isLarge ? 'text-base' : 'text-sm'} font-semibold text-text`}>服务</p>
            <button className="text-2xs text-text-subtle">全部</button>
          </div>
          <div className="space-y-2.5">
            {p.services.map(svc => <ServiceCard key={svc.id} svc={svc} large={isLarge}/>)}
          </div>
        </div>

        {p.scenes && p.scenes.length > 0 && (
          <SceneRow scenes={p.scenes}/>
        )}

        {p.devices && p.devices.length > 0 && (
          <DeviceGrid devices={p.devices}/>
        )}

        <PluginMarket hasStudio compact studioName={studioName}/>
        <div className="h-4"/>
      </div>

      {/* Persona-configured floating tab bar */}
      <div className="pb-6 px-6 shrink-0">
        <div
          className="flex items-center justify-around rounded-full px-2 py-2"
          style={{
            background: 'rgba(20,20,24,0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {p.tabs.map(tab => {
            const isActive = tab.label === '首页'
            const iconSize = isLarge ? 24 : 20
            return (
              <Link key={tab.label} href={studioHref(tab.href)} className="flex flex-col items-center gap-0.5 flex-1 py-1">
                <div className={`flex items-center justify-center rounded-full transition-all duration-200 ${isActive ? 'bg-accent/15 px-4 py-1.5' : 'px-3 py-1.5'}`}>
                  <tab.icon size={iconSize} className={isActive ? 'text-accent' : 'text-text-subtle'} strokeWidth={isActive ? 2.2 : 1.8}/>
                </div>
                <span className={`${isLarge ? 'text-xs' : 'text-2xs'} font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-subtle'}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function HomeContent() {
  const params = useSearchParams()
  const router = useRouter()

  const mode       = (params?.get('mode')    ?? 'empty') as HomeMode
  const config     = (params?.get('config')  ?? 'none')  as ConfigState
  const persona    = (params?.get('persona') ?? 'dad')   as Persona
  const studioName = params?.get('studio') ?? undefined
  // configId of a just-applied Installer plugin — forward to me/page via studioExtra
  const applied    = params?.get('applied') ?? undefined

  const hasStudio       = mode === 'remote' || mode === 'local-unbound'
  const showConfigSheet = hasStudio && config === 'pending'
  const showInstaller   = hasStudio && config === 'accepted'

  const studioParam = studioName ? `&studio=${encodeURIComponent(studioName)}` : ''
  const [revealing, setRevealing] = useState(false)

  const handleAccept = () => setRevealing(true)
  const handleRevealDone = () => {
    setRevealing(false)
    router.replace(`/life/home?mode=remote&config=accepted&persona=${persona}${studioParam}`)
  }
  const handleDecline = () => router.replace(`/life/home?mode=remote${studioParam}`)

  // Forward applied= to InstallerHome so its me-tab link carries it once
  const extraForMe = [
    config === 'accepted' ? `config=accepted&persona=${persona}` : '',
    applied ? `applied=${applied}` : '',
  ].filter(Boolean).join('&') || undefined

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {showInstaller
        ? <InstallerHome persona={persona} studioName={studioName} studioExtra={extraForMe}/>
        : <UnifiedHome hasStudio={hasStudio} studioName={studioName} appliedConfigId={applied}/>
      }
      <AnimatePresence>
        {showConfigSheet && (
          <InstallerConfigSheet persona={persona} onAccept={handleAccept} onDecline={handleDecline}/>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {revealing && (
          <ApplyReveal persona={persona} onDone={handleRevealDone}/>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LifeHomePage() {
  return <Suspense><HomeContent/></Suspense>
}
