import { motion } from 'framer-motion'

function Node({ label, children, color = 'border-border' }: {
  label: string; children: React.ReactNode; color?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-11 h-11 rounded-2xl border bg-bg-subtle flex items-center justify-center ${color}`}>
        {children}
      </div>
      <span className="text-2xs text-text-subtle">{label}</span>
    </div>
  )
}

export function ConnectionPath({ mode }: { mode: 'local' | 'remote' }) {
  return (
    <div className="flex items-center justify-center">
      {/* Phone */}
      <Node label="手机">
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
          <rect x="1" y="1" width="12" height="16" rx="2.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/>
          <rect x="4.5" y="14" width="5" height="1.2" rx="0.6" fill="rgba(255,255,255,0.25)"/>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1" fill="rgba(255,255,255,0.06)"/>
        </svg>
      </Node>

      {mode === 'local' ? (
        <>
          <div className="flex items-center mb-5 mx-1 gap-0.5">
            <motion.div
              className="h-px bg-success/70"
              initial={{ width: 0 }} animate={{ width: 36 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-success shrink-0"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            />
          </div>
          <Node label="Studio" color="border-success/40">
            <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
              <rect x="1" y="1" width="20" height="13" rx="3" stroke="rgba(16,185,129,0.5)" strokeWidth="1.2"/>
              <circle cx="18" cy="3.5" r="1.5" fill="#10b981"/>
              {[5,8,11].map(x => (
                <line key={x} x1={x} y1="5.5" x2={x} y2="9.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round"/>
              ))}
            </svg>
          </Node>
        </>
      ) : (
        <>
          <div className="flex items-center mb-5 mx-1">
            <motion.div className="h-px bg-warning/60" initial={{ width: 0 }} animate={{ width: 24 }} transition={{ duration: 0.4 }} />
          </div>
          <Node label="云端" color="border-warning/30">
            <svg width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="1.5">
              <path d="M18 10h-1.26A8 8 0 1 0 9 18h9a5 5 0 0 0 0-10z"/>
            </svg>
          </Node>
          <div className="flex items-center mb-5 mx-1">
            <motion.div className="h-px bg-warning/60" initial={{ width: 0 }} animate={{ width: 24 }} transition={{ duration: 0.4, delay: 0.35 }} />
          </div>
          <Node label="Studio" color="border-warning/25">
            <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
              <rect x="1" y="1" width="20" height="13" rx="3" stroke="rgba(245,158,11,0.4)" strokeWidth="1.2"/>
              <circle cx="18" cy="3.5" r="1.5" fill="rgba(245,158,11,0.8)"/>
              {[5,8,11].map(x => (
                <line key={x} x1={x} y1="5.5" x2={x} y2="9.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round"/>
              ))}
            </svg>
          </Node>
        </>
      )}
    </div>
  )
}
