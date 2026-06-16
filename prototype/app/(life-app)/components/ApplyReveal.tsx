'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type RevealPhase = 'box' | 'burst' | 'show'

const PERSONA_LABEL: Record<string, { label: string; emoji: string; color: string }> = {
  dad:     { label: '主人模式', emoji: '🏡', color: 'from-blue-600 to-indigo-700' },
  kid:     { label: '儿童模式', emoji: '🌈', color: 'from-orange-500 to-amber-500' },
  nanny:   { label: '管家模式', emoji: '📋', color: 'from-teal-600 to-cyan-600' },
  elderly: { label: '关爱模式', emoji: '🌿', color: 'from-green-600 to-emerald-700' },
}

export function ApplyReveal({ persona, onDone }: { persona: string; onDone: () => void }) {
  const [phase, setPhase] = useState<RevealPhase>('box')
  const info = PERSONA_LABEL[persona] ?? { label: '专属配置', emoji: '✨', color: 'from-accent to-accent2' }
  // Stabilise the callback so timers are set exactly once on mount
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('burst'), 700)
    const t2 = setTimeout(() => setPhase('show'),  1200)
    const t3 = setTimeout(() => onDoneRef.current(), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, []) // intentionally empty — timers run once on mount

  const particles = ['✨', '🌟', '💫', '⭐', '✦', '🎊']
  const angles = [0, 60, 120, 180, 240, 300]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg overflow-hidden"
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0`}
        animate={phase === 'burst' ? { opacity: [0, 0.3, 0] } : {}}
        transition={{ duration: 0.5 }}
      />

      <AnimatePresence mode="wait">
        {phase === 'box' && (
          <motion.div key="box"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: [0, -8, 8, -8, 0] }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, rotate: { repeat: Infinity, duration: 0.5 } }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-8xl drop-shadow-2xl select-none">📦</span>
            <p className="text-sm text-text-muted animate-pulse">正在应用配置…</p>
          </motion.div>
        )}

        {phase === 'burst' && (
          <motion.div key="burst" className="relative w-40 h-40 flex items-center justify-center">
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${info.color}`}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
            {particles.map((p, i) => {
              const rad = (angles[i] * Math.PI) / 180
              return (
                <motion.span key={i} className="absolute text-2xl"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(rad) * 90, y: Math.sin(rad) * 90, opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.03 }}
                >{p}</motion.span>
              )
            })}
            <motion.span className="text-6xl z-10"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >🎁</motion.span>
          </motion.div>
        )}

        {phase === 'show' && (
          <motion.div key="show"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-5 px-8 text-center"
          >
            <motion.div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${info.color} flex items-center justify-center shadow-2xl`}
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-5xl">{info.emoji}</span>
            </motion.div>
            <div>
              <motion.p className="text-2xl font-bold text-text mb-2"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                配置已激活 🎉
              </motion.p>
              <motion.p className="text-base text-text-muted"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {info.label}
              </motion.p>
            </div>
            <motion.div className="flex gap-1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  className={`w-2 h-2 rounded-full bg-gradient-to-br ${info.color}`}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
