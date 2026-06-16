'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Lightweight access path shown after connecting — phone···globe···studio or phone···studio
function AccessPath({ isCloud }: { isCloud: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {/* Phone */}
      <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
        <rect x="1" y="1" width="14" height="20" rx="3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
        <rect x="5.5" y="17.5" width="5" height="1.5" rx="0.75" fill="rgba(255,255,255,0.2)"/>
      </svg>
      {/* Dots */}
      {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/20"/>)}
      {/* Globe (cloud only) */}
      {isCloud && (
        <>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
            <path d="M9 2v14M2 9h14" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <path d="M3 5.5 Q9 3.5 15 5.5 M3 12.5 Q9 14.5 15 12.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
          </svg>
          {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/20"/>)}
        </>
      )}
      {/* Studio */}
      <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
        <rect x="1" y="1" width="24" height="16" rx="3.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
        <circle cx="21.5" cy="4" r="1.8" fill="#10b981"/>
        {[5,8,11,14].map(x => (
          <line key={x} x1={x} y1="6" x2={x} y2="12"
            stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round"/>
        ))}
      </svg>
    </div>
  )
}

function ConnectingContent() {
  const params = useSearchParams()
  const router = useRouter()
  const mode = params?.get('mode') ?? 'remote'
  const name = params?.get('name') ?? 'M300 Studio'
  const isCloud = mode === 'remote'
  const [phase, setPhase] = useState<'connecting' | 'done'>('connecting')

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('done')
      // map connecting mode → home mode: local→local-unbound, remote→remote
      const homeMode = mode === 'local' ? 'local-unbound' : 'remote'
      setTimeout(() => router.push(`/life/home?mode=${homeMode}`), 700)
    }, 1600)
    return () => clearTimeout(t)
  }, [mode, router])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
      {/* Device pulse */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {phase === 'connecting' && [1,2,3].map(i => (
          <motion.div key={i}
            className="absolute rounded-full border border-success/30"
            style={{ width: 24 + i * 22, height: 24 + i * 22 }}
            animate={{ scale: [1, 1.15], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, delay: i * 0.35, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <div className="w-14 h-14 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center">
          <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
            <rect x="1" y="1" width="28" height="18" rx="4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4"/>
            <circle cx="24" cy="4.5" r="2" fill="#10b981"/>
            {[7,11,15].map(x => (
              <line key={x} x1={x} y1="7" x2={x} y2="13"
                stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeLinecap="round"/>
            ))}
          </svg>
        </div>
      </div>

      {/* Name + status */}
      <div className="text-center">
        <p className="text-base font-semibold text-text mb-1">{name}</p>
        <AnimatePresence mode="wait">
          {phase === 'connecting' ? (
            <motion.div key="dots" exit={{ opacity: 0 }} className="flex gap-1.5 justify-center mt-2">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-success"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}/>
              ))}
            </motion.div>
          ) : (
            <motion.p key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium mt-1 text-success">已连接</motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Access path — appears bottom after done */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-12 flex flex-col items-center gap-2">
            <AccessPath isCloud={isCloud}/>
            <p className="text-2xs text-text-subtle">
              {isCloud ? '通过 Builder Cloud 访问' : '局域网直连'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ConnectingPage() {
  return <Suspense><ConnectingContent/></Suspense>
}
