'use client'

import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, CheckCircle, AlertCircle, ChevronDown, ChevronUp, MapPin, Clock, Wrench, MessageSquare, Star, Wifi } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const deliveryInfo = {
  studioName: 'M300 Studio',
  installer: {
    name: '王工',
    company: 'Aqara 授权服务商 · 上海',
    avatar: 'W',
  },
  completedAt: '2026年5月13日 14:32',
  location: '上海市静安区某小区 3 栋 2201',
  items: [
    '安装并配置 M300 Studio',
    '完成全屋 Zigbee 设备配对（28 台）',
    '设置常用自动化场景（20条）',
    '2026年5月13日转移完成',
  ],
}

const issues = ['设备无响应', '自动化未生效', '部分设备未配对', '其他问题']

function AcceptContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // studio=<name> present → already connected, skip connect prompt
  const connectedStudio = searchParams?.get('studio') ?? undefined

  const [showItems, setShowItems] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [showIssues, setShowIssues] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleConfirm = () => {
    setConfirmed(true)
    if (!connectedStudio) {
      setTimeout(() => {
        router.push(`/life/studios/connecting?mode=remote&name=${encodeURIComponent(deliveryInfo.studioName)}`)
      }, 1800)
    }
  }

  if (confirmed && connectedStudio) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}>
          <CheckCircle size={60} className="text-success"/>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="text-center">
          <h2 className="text-xl font-bold text-text mb-1">验收完成 🎉</h2>
          <p className="text-sm text-text-muted">感谢你的反馈，工单已关闭</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}>
          <Link
            href={`/life/home?mode=remote&studio=${encodeURIComponent(connectedStudio)}`}
            className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold"
          >
            返回首页
          </Link>
        </motion.div>
      </div>
    )
  }

  if (confirmed && !connectedStudio) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}>
          <CheckCircle size={60} className="text-success"/>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="text-center">
          <h2 className="text-xl font-bold text-text mb-1">验收完成</h2>
          <p className="text-sm text-text-muted">正在连接到 {deliveryInfo.studioName}…</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-bg-subtle">
          <ChevronLeft size={20} className="text-text-muted"/>
        </button>
        <div>
          <h1 className="text-base font-semibold text-text">安装验收</h1>
          <p className="text-2xs text-text-subtle">{deliveryInfo.studioName}</p>
        </div>
        {connectedStudio && (
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/12 border border-success/25">
            <Wifi size={10} className="text-success"/>
            <span className="text-2xs text-success font-medium">已连接</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

        {/* Installer card */}
        <div className="flex items-center gap-3 p-4 card">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-accent">{deliveryInfo.installer.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text">{deliveryInfo.installer.name}</p>
            <p className="text-2xs text-text-subtle mt-0.5">{deliveryInfo.installer.company}</p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/15 border border-success/30">
            <CheckCircle size={10} className="text-success"/>
            <span className="text-2xs text-success font-medium">已完成安装</span>
          </div>
        </div>

        {/* Meta info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-bg-subtle">
            <Clock size={13} className="text-text-subtle shrink-0"/>
            <span className="text-2xs text-text-subtle">{deliveryInfo.completedAt}</span>
          </div>
          <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl bg-bg-subtle">
            <MapPin size={13} className="text-text-subtle shrink-0 mt-0.5"/>
            <span className="text-2xs text-text-subtle">{deliveryInfo.location}</span>
          </div>
        </div>

        {/* Installation items — collapsible */}
        <button onClick={() => setShowItems(!showItems)}
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-bg-subtle text-left">
          <Wrench size={13} className="text-text-subtle shrink-0"/>
          <span className="flex-1 text-2xs text-text-subtle">查看安装清单（{deliveryInfo.items.length} 项）</span>
          {showItems ? <ChevronUp size={13} className="text-text-subtle"/> : <ChevronDown size={13} className="text-text-subtle"/>}
        </button>

        <AnimatePresence>
          {showItems && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden">
              <div className="px-4 py-3 rounded-xl border border-border space-y-2.5">
                {deliveryInfo.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={12} className="text-success shrink-0 mt-0.5"/>
                    <span className="text-2xs text-text-subtle leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Star rating */}
        <div className="px-4 py-4 rounded-xl border border-border bg-bg-subtle">
          <p className="text-2xs font-medium text-text mb-3">对本次安装服务评价</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform active:scale-90"
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    n <= (hoverRating || rating) ? 'text-warning' : 'text-border-strong'
                  }`}
                  fill={n <= (hoverRating || rating) ? 'currentColor' : 'none'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-1 text-xs text-text-subtle">
                {['', '很差', '较差', '一般', '不错', '非常满意'][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Issue report */}
        <button onClick={() => setShowIssues(!showIssues)}
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-bg-subtle text-left">
          <MessageSquare size={13} className="text-text-subtle shrink-0"/>
          <span className="flex-1 text-2xs text-text-subtle">
            {selectedIssue ? `已标记：${selectedIssue}` : '发现问题？告诉我们'}
          </span>
          {showIssues ? <ChevronUp size={13} className="text-text-subtle"/> : <ChevronDown size={13} className="text-text-subtle"/>}
        </button>

        <AnimatePresence>
          {showIssues && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden">
              <div className="grid grid-cols-2 gap-2 pb-1">
                {issues.map(issue => (
                  <button key={issue} onClick={() => { setSelectedIssue(selectedIssue === issue ? null : issue); setShowIssues(false) }}
                    className={`px-3 py-2.5 rounded-xl border text-2xs text-left transition-all ${
                      selectedIssue === issue
                        ? 'border-warning/40 bg-warning/10 text-warning'
                        : 'border-border bg-bg-subtle text-text-subtle hover:border-border-strong'
                    }`}>
                    {issue}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedIssue && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-warning/30 bg-warning/8">
            <AlertCircle size={13} className="text-warning shrink-0"/>
            <p className="text-2xs text-warning leading-relaxed">
              已记录「{selectedIssue}」，验收后 Installer 将在 48 小时内跟进处理。
            </p>
          </motion.div>
        )}

        {/* If not connected, suggest connecting after acceptance */}
        {!connectedStudio && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-accent/25 bg-accent/6">
            <Wifi size={13} className="text-accent shrink-0 mt-0.5"/>
            <p className="text-2xs text-text-muted leading-relaxed">
              验收完成后，可以立即连接到 M300 Studio 查看配置。
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 py-3 border-t border-border shrink-0">
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-xl bg-accent text-white text-sm font-semibold"
        >
          确认验收{rating > 0 ? '并提交评价' : ''}
        </button>
        <p className="text-center text-2xs text-text-subtle mt-2">
          {connectedStudio ? '验收完成后将关闭服务工单' : '验收完成后可连接 Studio 查看配置'}
        </p>
      </div>
    </div>
  )
}

export default function AcceptStudioPage() {
  return <Suspense><AcceptContent /></Suspense>
}
