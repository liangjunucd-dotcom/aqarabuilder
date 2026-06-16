'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Globe, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Studio {
  name: string
  // cloud = bound to Builder (remote tunnel); local = seen on LAN, not yet bound
  accessType: 'cloud' | 'local' | 'offline'
  isCurrent?: boolean
  // Installer 转移过来的、带专属配置，进入时弹确认 sheet
  hasInstallerConfig?: boolean
  persona?: 'dad' | 'kid' | 'nanny' | 'elderly'
}

const myStudios: Studio[] = [
  { name: 'M300 Studio',    accessType: 'cloud', isCurrent: true },
  { name: 'Jun Studio',     accessType: 'cloud', hasInstallerConfig: true, persona: 'dad' },
  { name: '老人房 Studio',  accessType: 'cloud', hasInstallerConfig: true, persona: 'elderly' },
  { name: 'Bella Studio',   accessType: 'local' },
  { name: '出租屋 Studio',  accessType: 'offline' },
]

function AccessBadge({ type }: { type: Studio['accessType'] }) {
  if (type === 'cloud') return (
    <svg width="42" height="14" viewBox="0 0 42 14" fill="none" className="shrink-0">
      {/* phone */}
      <rect x="0" y="3" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" className="text-text-subtle"/>
      {/* line */}
      <line x1="7" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" className="text-border-strong"/>
      {/* globe */}
      <circle cx="19" cy="8" r="4" stroke="currentColor" strokeWidth="1.2" className="text-text-subtle"/>
      <line x1="19" y1="4" x2="19" y2="12" stroke="currentColor" strokeWidth="0.8" className="text-text-subtle"/>
      <path d="M15.5 6.5 Q19 5 22.5 6.5M15.5 9.5 Q19 11 22.5 9.5" stroke="currentColor" strokeWidth="0.8" className="text-text-subtle"/>
      {/* line */}
      <line x1="23" y1="8" x2="30" y2="8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" className="text-border-strong"/>
      {/* studio box */}
      <rect x="30" y="2" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" className="text-text-subtle"/>
      <circle cx="39" cy="4.5" r="1.2" fill="#10b981"/>
    </svg>
  )
  if (type === 'local') return (
    <svg width="28" height="14" viewBox="0 0 28 14" fill="none" className="shrink-0">
      {/* phone */}
      <rect x="0" y="3" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" className="text-text-subtle"/>
      {/* wifi arc */}
      <path d="M12 8 Q14 5 16 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-accent"/>
      <line x1="7" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" className="text-border-strong"/>
      {/* studio box */}
      <rect x="16" y="2" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" className="text-text-subtle"/>
      <circle cx="25" cy="4.5" r="1.2" fill="#6366f1"/>
    </svg>
  )
  return null
}

function StudioCard({ studio, delay = 0, connectedName }: { studio: Studio; delay?: number; connectedName?: string }) {
  const href = studio.accessType === 'offline'
    ? '#'
    : studio.accessType === 'cloud'
    ? (studio.hasInstallerConfig
        ? `/life/home?mode=remote&config=pending&persona=${studio.persona ?? 'dad'}&studio=${encodeURIComponent(studio.name)}`
        : `/life/home?mode=remote&studio=${encodeURIComponent(studio.name)}`)
    : `/life/studios/connecting?mode=local&name=${encodeURIComponent(studio.name)}&studio=${encodeURIComponent(studio.name)}`

  const ledFill =
    studio.accessType === 'cloud'  ? '#10b981' :
    studio.accessType === 'local'  ? '#6366f1' :
    'rgba(255,255,255,0.15)'

  const dotClass =
    studio.accessType === 'cloud'  ? 'bg-success' :
    studio.accessType === 'local'  ? 'bg-accent' :
    'bg-border-strong'

  const isConnected = connectedName && studio.name === connectedName

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Link href={href}>
        <div className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all ${
          isConnected ? 'border-accent/30 bg-accent/8' : 'card card-hover'
        }`}>
          {/* M300 icon */}
          <div className="relative w-11 h-11 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center shrink-0">
            <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
              <rect x="1" y="1" width="28" height="18" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2"/>
              <rect x="3" y="3" width="24" height="14" rx="2.5" fill="rgba(255,255,255,0.03)"/>
              <circle cx="25" cy="4.5" r="2" fill={ledFill}/>
              {[6,9,12,15].map(x => (
                <line key={x} x1={x} y1="7" x2={x} y2="13"
                  stroke="rgba(255,255,255,0.08)" strokeWidth="1.1" strokeLinecap="round"/>
              ))}
            </svg>
            <span className={`absolute -bottom-1 -right-1 inline-flex rounded-full h-2.5 w-2.5 border-2 border-bg-elevated ${dotClass}`}/>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-text truncate">{studio.name}</span>
              {isConnected && <Check size={13} className="text-accent shrink-0"/>}
              {studio.hasInstallerConfig && (
                <span className="text-2xs px-1.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent shrink-0">
                  专属配置
                </span>
              )}
            </div>
            <p className="text-2xs text-text-subtle mt-0.5">
              {studio.accessType === 'offline' ? '离线' :
               studio.accessType === 'local'  ? '192.168.1.107' : '在线'}
            </p>
          </div>

          {studio.accessType !== 'offline' && (
            <AccessBadge type={studio.accessType}/>
          )}

          <ChevronRight size={14} className="text-text-subtle shrink-0"/>
        </div>
      </Link>
    </motion.div>
  )
}

function StudiosContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const connectedName = searchParams?.get('studio') ?? undefined

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-bg-subtle transition-colors">
          <ChevronLeft size={20} className="text-text-muted"/>
        </button>
        <h1 className="text-base font-semibold text-text">选择 Studio</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          {myStudios.map((s, i) => (
            <StudioCard key={i} studio={s} delay={i * 0.05} connectedName={connectedName}/>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border flex gap-2">
        <Link href="/life/studios/add"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-accent/30 text-accent text-sm font-medium">
          <Plus size={15}/>添加 Studio
        </Link>
      </div>
    </div>
  )
}

export default function LifeStudiosPage() {
  return <Suspense><StudiosContent /></Suspense>
}
