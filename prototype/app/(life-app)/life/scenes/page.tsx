'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BottomNav } from '../../components/BottomNav'
import {
  ChevronRight,
  DoorClosed,
  Film,
  Lightbulb,
  Moon,
  Shield,
  SlidersHorizontal,
  Zap,
} from 'lucide-react'

const sceneGroups = [
  {
    title: '常用',
    items: [
      { id: 'home', name: '回家', meta: '玄关灯 · 空调 · 安防撤防', icon: Lightbulb, enabled: true },
      { id: 'away', name: '离家', meta: '全屋关灯 · 门窗巡检 · 布防', icon: Shield, enabled: true },
      { id: 'night', name: '起夜', meta: '低亮灯带 · 走廊联动', icon: Moon, enabled: true },
    ],
  },
  {
    title: '空间',
    items: [
      { id: 'movie', name: '观影', meta: '客厅窗帘 · 灯光 · 电视', icon: Film, enabled: false },
      { id: 'door', name: '访客到达', meta: '门铃 · 摄像头 · 玄关灯', icon: DoorClosed, enabled: true },
    ],
  },
]

function ScenesContent() {
  const params = useSearchParams()
  const studioName = params?.get('studio') ?? undefined
  const config = params?.get('config') ?? undefined
  const persona = params?.get('persona') ?? undefined
  const configApplied = Boolean(studioName && config === 'accepted')
  const studioExtra = configApplied && persona ? `config=accepted&persona=${persona}` : undefined

  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => (
    Object.fromEntries(sceneGroups.flatMap(group => group.items.map(item => [item.id, item.enabled])))
  ))

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-3 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text">场景</h1>
          <p className="text-2xs text-text-subtle mt-0.5">{studioName ?? '我的家'}</p>
        </div>
        <button className="w-10 h-10 rounded-full border border-border bg-bg-subtle flex items-center justify-center text-text-muted">
          <SlidersHorizontal size={17} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-4">
        <div className="rounded-3xl border border-accent/20 bg-accent/[0.06] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-subtle">当前运行</p>
              <p className="text-base font-semibold text-text mt-0.5">回家</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-2xs font-medium text-success">
              <Zap size={11} /> Live
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {['灯光 6', '安防 2', '空调 1'].map(item => (
              <div key={item} className="rounded-2xl bg-bg-elevated/70 border border-border px-2 py-2 text-2xs text-text-muted">
                {item}
              </div>
            ))}
          </div>
        </div>

        {sceneGroups.map(group => (
          <section key={group.title} className="space-y-2">
            <p className="px-1 text-2xs font-medium uppercase tracking-wider text-text-subtle">{group.title}</p>
            <div className="space-y-2">
              {group.items.map(item => {
                const Icon = item.icon
                const isEnabled = enabled[item.id]
                return (
                  <button
                    key={item.id}
                    className="w-full rounded-2xl border border-border bg-bg-elevated/80 p-3.5 flex items-center gap-3 text-left"
                    onClick={() => setEnabled(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                  >
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isEnabled ? 'bg-accent/15 text-accent' : 'bg-bg-subtle text-text-subtle'}`}>
                      <Icon size={18} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-text">{item.name}</span>
                      <span className="block text-2xs text-text-muted mt-0.5 truncate">{item.meta}</span>
                    </span>
                    <span className={`w-10 h-6 rounded-full p-0.5 transition-colors ${isEnabled ? 'bg-accent' : 'bg-bg-subtle border border-border'}`}>
                      <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${isEnabled ? 'translate-x-4' : ''}`} />
                    </span>
                    <ChevronRight size={14} className="text-text-subtle" />
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <BottomNav
        active="场景"
        mode="studio"
        studioName={studioName}
        studioExtra={studioExtra}
      />
    </div>
  )
}

export default function ScenesPage() {
  return <Suspense><ScenesContent /></Suspense>
}
