'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Notification {
  id: number
  icon: string
  title: string
  body: string
  age: string
  type: 'acceptance' | 'system' | 'promo' | 'installer-plugin'
  actionHref?: string
  actionLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
  dismissed: boolean
}

const initialNotifications: Notification[] = [
  {
    id: 4,
    icon: '🎁',
    title: '王工 分享了专属配置给你',
    body: '「家庭安防套装」已推送到你的账号。安装后可在 M300 Studio 上运行。',
    age: '刚刚',
    type: 'installer-plugin',
    actionHref: '/life/plugin/lp-001?studio=M300%20Studio&installer=dad',
    actionLabel: '获取插件',
    dismissed: false,
  },
  {
    id: 1,
    icon: '🏠',
    title: 'M300 Studio 安装完成',
    body: '王工已完成全屋安装，请在 29 天内完成验收确认。',
    age: '1d',
    type: 'acceptance',
    actionHref: '/life/studios/accept',
    dismissed: false,
  },
  {
    id: 2,
    icon: '⚡',
    title: '本月能耗报告',
    body: '你的家本月用电 38.2 kWh，比上月降低 12%，节能表现优秀。',
    age: '3d',
    type: 'system',
    actionHref: '/life/home?mode=remote',
    dismissed: false,
  },
  {
    id: 3,
    icon: '✨',
    title: '新玩法插件上线',
    body: '「魔法点灯 Pro」现已上线，将你的房间变成沉浸式光影空间。',
    age: '7d',
    type: 'promo',
    actionHref: '/life/home',
    dismissed: false,
  },
]

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)

  const dismiss = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n))
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 300)
  }

  const visible = notifications.filter(n => !n.dismissed)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-bg-subtle">
          <ChevronLeft size={20} className="text-text-muted"/>
        </button>
        <h1 className="text-base font-semibold text-text flex-1">通知</h1>
        {visible.length > 0 && (
          <button onClick={() => setNotifications([])}
            className="text-2xs text-text-subtle">
            全部清除
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-3xl mb-3">🔔</p>
            <p className="text-sm font-medium text-text mb-1">暂无通知</p>
            <p className="text-2xs text-text-muted">新的通知会在这里显示</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {visible.map(n => (
                <motion.div key={n.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="card overflow-hidden">
                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-bg-subtle border border-border flex items-center justify-center text-xl shrink-0">
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text leading-tight">{n.title}</p>
                        <p className="text-2xs text-text-muted mt-1 leading-relaxed">{n.body}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-2xs text-text-subtle">{n.age}</span>
                        <button className="p-0.5 text-text-subtle hover:text-text transition-colors">
                          <MoreHorizontal size={14}/>
                        </button>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => dismiss(n.id)}
                        className="flex-1 py-2 rounded-lg border border-border text-sm text-text-subtle font-medium hover:bg-bg-subtle transition-colors">
                        忽略
                      </button>
                      {n.actionHref && (
                        <Link href={n.actionHref}
                          className={`flex-[2] py-2 rounded-lg text-sm font-semibold text-center hover:opacity-90 transition-opacity ${
                            n.type === 'installer-plugin'
                              ? 'bg-accent text-white'
                              : 'bg-text text-bg'
                          }`}>
                          {n.actionLabel ?? (n.type === 'acceptance' ? '去验收' : '查看')}
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
