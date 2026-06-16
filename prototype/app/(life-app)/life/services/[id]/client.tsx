'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, Settings, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'

export default function ServiceDetailPage() {
  const router = useRouter()
  const [enabled, setEnabled] = useState(true)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-bg-subtle">
          <ChevronLeft size={20} className="text-text-muted"/>
        </button>
        <h1 className="text-base font-semibold text-text flex-1">服务详情</h1>
        <button className="p-1.5 rounded-lg hover:bg-bg-subtle">
          <Settings size={18} className="text-text-muted"/>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-bg-subtle">
          <div>
            <p className="text-sm font-medium text-text">服务状态</p>
            <p className="text-2xs text-text-subtle mt-0.5">开启后自动运行</p>
          </div>
          <button onClick={() => setEnabled(!enabled)}>
            {enabled
              ? <ToggleRight size={32} className="text-accent"/>
              : <ToggleLeft size={32} className="text-text-subtle"/>}
          </button>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-bg-subtle">
          <p className="text-sm font-semibold text-text mb-2">运行日志</p>
          {['今天 09:12 — 自动触发', '昨天 22:30 — 定时执行', '昨天 08:00 — 手动启动'].map((log, i) => (
            <p key={i} className="text-2xs text-text-muted py-2 border-b border-border last:border-0">{log}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
