'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Shield, Check, Globe2, User, Cloud } from 'lucide-react'
import Link from 'next/link'

// 当前会话的国家/地区由 App 登录时选定（见 life/signin），这里只展示
const SESSION_REGION = { code: 'cn', label: '中国大陆', flag: '🇨🇳', dc: 'CN' }
const SESSION_ACCOUNT = '18718670866'

export default function ConfirmStudioPage() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <Link href="/life/studios/add" className="p-1 rounded-lg hover:bg-bg-subtle">
          <ChevronLeft size={20} className="text-text-muted" />
        </Link>
        <h1 className="text-base font-semibold text-text">Edge2Cloud 连接</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {/* Cloud icon */}
          <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-4">
            <Cloud size={26} className="text-accent" />
          </div>
          <h2 className="text-base font-semibold text-text mb-1.5">连接到云端</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            将本地 Studio 连接到 Aqara 云，解锁远程访问、云端备份与多平台协作。
          </p>
        </motion.div>

        {/* 设备 */}
        <div className="flex items-center gap-3 p-3.5 card mb-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-bg-subtle border border-border flex items-center justify-center">
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                <rect x="1" y="1" width="22" height="14" rx="3" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"/>
                <circle cx="19" cy="4" r="1.5" fill="#10b981"/>
                {[6,9,12].map(x => (
                  <line key={x} x1={x} y1="6" x2={x} y2="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round"/>
                ))}
              </svg>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-bg-elevated" />
          </div>
          <div>
            <p className="text-sm font-medium text-text">M300 Studio</p>
            <p className="text-2xs text-text-subtle num">lumi3.840c · 192.168.1.100</p>
          </div>
        </div>

        {/* 绑定上下文 — 账号 + 国家/地区，只读 */}
        <p className="text-2xs text-text-subtle font-medium mb-2">绑定到</p>
        <div className="rounded-xl border border-border bg-bg-subtle overflow-hidden mb-3">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center shrink-0">
              <User size={13} className="text-text-muted"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xs text-text-subtle">账号</p>
              <p className="text-sm font-medium text-text num truncate">{SESSION_ACCOUNT}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center shrink-0">
              <Globe2 size={13} className="text-accent"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xs text-text-subtle">国家 / 地区</p>
              <p className="text-sm font-medium text-text">
                <span className="mr-1.5">{SESSION_REGION.flag}</span>
                {SESSION_REGION.label}
              </p>
            </div>
          </div>
        </div>

        {/* 安全说明 */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-start gap-2 w-full px-3.5 py-3 rounded-xl border border-border bg-bg-subtle mt-2 text-left"
        >
          <Shield size={14} className="text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-2xs font-medium text-text">本地优先 · 端到端加密</p>
            <p className="text-2xs text-text-subtle leading-relaxed mt-0.5">
              核心数据保留在本地 Studio。云连接仅用于安全的远程隧道与多平台访问。
            </p>
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-2 space-y-1">
                    {[
                      '在任何地方远程访问本地 Studio',
                      '通过 Builder / Design Platform / Developer 任一处管理',
                      '云端监控、备份与扩展服务',
                      '远程访问免费',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-2xs text-text-subtle">
                        <Check size={10} className="text-accent shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>
      </div>

      {/* CTA */}
      <div className="px-5 py-3 border-t border-border shrink-0 flex gap-3">
        <Link
          href="/life/studios/add"
          className="flex-1 py-3.5 rounded-xl border border-border text-sm text-text-muted text-center font-medium"
        >
          取消
        </Link>
        <Link
          href="/life/studios/add/binding"
          className="flex-[2] py-3.5 rounded-xl bg-accent text-white text-sm font-semibold text-center inline-flex items-center justify-center gap-2"
        >
          <Cloud size={15}/>
          连接到云端
        </Link>
      </div>
    </div>
  )
}
