'use client'

import Link from 'next/link'
import { Compass, Cpu, User, Home, Zap } from 'lucide-react'

function appendStudio(href: string, studioName?: string, extra?: string) {
  if (!studioName) return href
  const sep = href.includes('?') ? '&' : '?'
  let result = `${href}${sep}studio=${encodeURIComponent(studioName)}`
  if (extra) result += `&${extra}`
  return result
}

const studioTabs = [
  { label: '首页', icon: Home, href: '/life/home?mode=remote' },
  { label: '设备', icon: Cpu,  href: '/life/devices' },
  { label: '场景', icon: Zap,  href: '/life/scenes' },
  { label: '我的', icon: User, href: '/life/me' },
]

export function BottomNav({ active, mode = 'solo', studioName, studioExtra }: {
  active: string
  mode?: 'solo' | 'studio'
  studioName?: string
  studioExtra?: string
}) {
  const soloTabs = [
    { label: '发现', icon: Compass, href: studioName ? '/life/home?mode=remote' : '/life/home' },
    { label: '设备', icon: Cpu,     href: '/life/devices' },
    { label: '我的', icon: User,    href: '/life/me' },
  ]

  const tabs = mode === 'studio' ? studioTabs : soloTabs

  return (
    <div className="pb-6 px-6 shrink-0">
      <div
        className="flex items-center justify-around rounded-full px-2 py-2"
        style={{
          background: 'rgba(20,20,24,0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {tabs.map(tab => {
          const isActive = active === tab.label
          const href = appendStudio(tab.href, studioName, studioExtra)
          return (
            <Link key={tab.label} href={href} className="flex flex-col items-center gap-0.5 flex-1 py-1">
              <div
                className={`flex items-center justify-center rounded-full transition-all duration-200 ${
                  isActive ? 'bg-accent/15 px-4 py-1.5' : 'px-3 py-1.5'
                }`}
              >
                <tab.icon
                  size={20}
                  className={isActive ? 'text-accent' : 'text-text-subtle'}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>
              <span
                className={`text-2xs font-medium transition-colors ${
                  isActive ? 'text-accent' : 'text-text-subtle'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
