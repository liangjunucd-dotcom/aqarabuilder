import type { Metadata } from 'next'
import { PrototypeSwitcher } from './components/PrototypeSwitcher'

export const metadata: Metadata = {
  title: 'Aqara Life App — Prototype',
}

export default function LifeAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center py-10 gap-5">
      {/* Prototype switcher — external, outside phone frame */}
      <PrototypeSwitcher />

      {/* Mobile frame */}
      <div
        className="relative w-[390px] bg-bg-elevated rounded-[44px] overflow-hidden"
        style={{
          height: '844px',
          boxShadow: '0 0 0 10px #1a1a1d, 0 0 0 11px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-7 pt-3 pb-1 h-12">
          <span className="text-2xs font-semibold text-text num">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="3" width="3" height="9" rx="1" fill="white" opacity="0.4"/>
              <rect x="4.5" y="2" width="3" height="10" rx="1" fill="white" opacity="0.6"/>
              <rect x="9" y="0" width="3" height="12" rx="1" fill="white" opacity="0.8"/>
              <rect x="13.5" y="0" width="3" height="12" rx="1" fill="white"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
              <path d="M8 2.4C5.6 2.4 3.5 3.4 2 5.1L0 3C2.1 1.1 4.9 0 8 0s5.9 1.1 8 3l-2 2.1C12.5 3.4 10.4 2.4 8 2.4z" opacity="0.4"/>
              <path d="M8 6C6.3 6 4.8 6.7 3.7 7.8L2 6C3.6 4.3 5.7 3.2 8 3.2s4.4 1.1 6 2.8l-1.7 1.8C11.2 6.7 9.7 6 8 6z" opacity="0.7"/>
              <circle cx="8" cy="11" r="1.5"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.35"/>
              <rect x="2" y="2" width="18" height="8" rx="2" fill="white"/>
              <path d="M23 4v4a2 2 0 000-4z" fill="white" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* Page content */}
        <div className="flex flex-col" style={{ height: 'calc(844px - 48px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
