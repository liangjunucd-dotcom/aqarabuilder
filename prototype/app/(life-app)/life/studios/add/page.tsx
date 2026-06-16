'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, QrCode, Wifi, Keyboard, RotateCcw, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// LAN-discovered studios are always unbound with no LocalUser set
const lanStudios = [
  { name: 'M300 Studio', deviceId: 'lumi3.840c990f2a594986', ip: '10.11.44.94' },
  { name: 'M300 Studio', deviceId: 'lumi3.c7f2a1b3e9d04512', ip: '192.168.1.121' },
]

type ScanPhase = 'idle' | 'scanning' | 'done'

function M300Icon() {
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
      <rect x="1" y="1" width="22" height="14" rx="3" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2"/>
      <circle cx="19" cy="4" r="1.5" fill="#6366f1"/>
      {[6,9,12].map(x => (
        <line key={x} x1={x} y1="6" x2={x} y2="10"
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round"/>
      ))}
    </svg>
  )
}

export default function AddStudioPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<ScanPhase>('scanning')
  const [visible, setVisible] = useState<typeof lanStudios>([])

  useEffect(() => {
    const t1 = setTimeout(() => setVisible([lanStudios[0]]), 900)
    const t2 = setTimeout(() => setVisible(lanStudios), 1800)
    const t3 = setTimeout(() => setPhase('done'), 2200)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [])

  const handleRescan = () => {
    setPhase('scanning')
    setVisible([])
    const t1 = setTimeout(() => setVisible([lanStudios[0]]), 900)
    const t2 = setTimeout(() => setVisible(lanStudios), 1800)
    const t3 = setTimeout(() => setPhase('done'), 2200)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-bg-subtle transition-colors">
          <ChevronLeft size={20} className="text-text-muted"/>
        </button>
        <h1 className="text-base font-semibold text-text">添加 Studio</h1>
      </div>

      <div className="flex-1 flex flex-col px-5 pt-5 overflow-y-auto">

        {/* Scanning animation */}
        <div className="flex flex-col items-center py-6">
          <div className="relative w-28 h-28 mb-4">
            {[1,2,3].map(i => (
              <motion.div key={i}
                className="absolute inset-0 rounded-full border border-success/30"
                animate={phase === 'scanning'
                  ? { scale: [1, 1.7 + i * 0.35], opacity: [0.5, 0] }
                  : { scale: 1, opacity: 0 }}
                transition={phase === 'scanning'
                  ? { duration: 2, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }
                  : { duration: 0.4 }}
              />
            ))}
            {phase === 'done' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 rounded-full border-2 border-success/40"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={phase === 'scanning' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 1.5, repeat: phase === 'scanning' ? Infinity : 0 }}
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors duration-500 ${
                  phase === 'done' ? 'bg-success/15 border-success/40' : 'bg-success/12 border-success/30'
                }`}>
                <Wifi size={24} className="text-success"/>
              </motion.div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'scanning' ? (
              <motion.div key="scanning" exit={{ opacity: 0 }} className="text-center">
                <p className="text-sm font-medium text-text mb-0.5">正在扫描局域网...</p>
                <p className="text-2xs text-text-subtle">当前网络：HomeNet</p>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <p className="text-sm font-medium text-text mb-0.5">发现 {visible.length} 台 Studio</p>
                <p className="text-2xs text-text-subtle">当前网络：HomeNet</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Discovered studios */}
        <div className="space-y-2 mb-4 min-h-[80px]">
          <AnimatePresence>
            {visible.map((s, i) => (
              <motion.div key={s.deviceId}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => router.push(`/life/studios/add/setup?name=${encodeURIComponent(s.name)}&ip=${s.ip}`)}
                  className="w-full flex items-center gap-3 p-3.5 card card-hover text-left">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-bg-subtle border border-border flex items-center justify-center">
                      <M300Icon/>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-bg-elevated"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{s.name}</p>
                    <p className="text-2xs text-text-subtle num">{s.ip}</p>
                  </div>
                  <span className="text-2xs text-accent font-medium shrink-0 px-2.5 py-1 rounded-full border border-accent/30 bg-accent/8">
                    设置
                  </span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-border"/>
          <span className="text-2xs text-text-subtle">其他方式</span>
          <div className="flex-1 h-px bg-border"/>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3.5 card card-hover">
            <div className="w-8 h-8 rounded-lg bg-bg-subtle flex items-center justify-center">
              <QrCode size={16} className="text-text-muted"/>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-text">扫描二维码</p>
              <p className="text-2xs text-text-subtle">扫描 Studio 包装盒上的码</p>
            </div>
            <ChevronRight size={14} className="text-text-subtle"/>
          </button>
          <button className="w-full flex items-center gap-3 p-3.5 card card-hover">
            <div className="w-8 h-8 rounded-lg bg-bg-subtle flex items-center justify-center">
              <Keyboard size={16} className="text-text-muted"/>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-text">手动输入 IP</p>
              <p className="text-2xs text-text-subtle">输入局域网 IP 地址直连</p>
            </div>
            <ChevronRight size={14} className="text-text-subtle"/>
          </button>
        </div>

        <button onClick={handleRescan}
          className="flex items-center justify-center gap-1.5 mt-4 mb-6 text-sm text-text-subtle">
          <RotateCcw size={13}/>重新扫描
        </button>
      </div>
    </div>
  )
}
