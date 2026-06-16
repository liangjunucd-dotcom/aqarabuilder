'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, QrCode, Sparkles, Download, Check,
  ShieldCheck, ThumbsUp, X, Zap, Cpu, ArrowRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Mock QR scanned plugin ───────────────────────────────────────────────────
const SCANNED_PLUGIN = {
  id: 'sunrise-alarm',
  name: '日出唤醒',
  author: 'Aqara Official',
  tag: 'Official',
  emoji: '🌅',
  gradient: 'from-orange-400/30 to-yellow-400/20',
  rating: 96,
  installs: '12.4k',
  desc: '根据当地真实日出时间，在日出前 20 分钟逐渐调亮卧室灯光，模拟自然日出，唤醒生理节律。支持色温从 2200K 渐变到 4000K。',
  permissions: ['读取设备状态', '控制灯光设备', '获取地理位置（日出计算）'],
  scenes: ['卧室灯渐亮', '色温渐变', '定时启动'],
  preview: [
    { icon: Zap, label: '5:40  色温 2200K · 亮度 5%' },
    { icon: Zap, label: '5:50  色温 2800K · 亮度 25%' },
    { icon: Zap, label: '6:00  色温 3500K · 亮度 60%' },
    { icon: Zap, label: '6:10  色温 4000K · 亮度 90%' },
  ],
}

type Stage = 'scanning' | 'preview' | 'installing' | 'done'

export default function PluginScanPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('scanning')
  const [progress, setProgress] = useState(0)
  const [scannerActive, setScannerActive] = useState(false)

  // Simulate scan
  const triggerScan = () => {
    setScannerActive(true)
    setTimeout(() => {
      setScannerActive(false)
      setStage('preview')
    }, 1800)
  }

  // Simulate install
  const triggerInstall = () => {
    setStage('installing')
    let p = 0
    const iv = setInterval(() => {
      p += Math.floor(8 + Math.random() * 12)
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setStage('done'), 300) }
      setProgress(p)
    }, 150)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090909]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-white/60" />
        </button>
        <span className="text-sm font-medium text-white/80">扫码安装插件</span>
        <div className="w-8" />
      </div>

      {/* ── Stage: Scanning ─────────────────────────────────────────────────── */}
      {stage === 'scanning' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Viewfinder */}
          <div className="relative w-64 h-64">
            {/* Corner marks */}
            {[
              'top-0 left-0 border-t-2 border-l-2 rounded-tl-xl',
              'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl',
              'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl',
              'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-8 h-8 border-white/60 ${cls}`} />
            ))}

            {/* Center area */}
            <div className="absolute inset-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex flex-col items-center justify-center gap-3">
              <QrCode size={48} className={scannerActive ? 'text-accent' : 'text-white/20'} />
              {!scannerActive ? (
                <p className="text-2xs text-white/30 text-center px-4">
                  将插件二维码对准框内
                </p>
              ) : (
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-accent"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }} />
                  ))}
                </div>
              )}
            </div>

            {/* Scanning line */}
            {scannerActive && (
              <motion.div
                className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"
                animate={{ top: ['20%', '80%', '20%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>

          <div className="text-center">
            <p className="text-white/60 text-sm">扫描插件卡片上的二维码</p>
            <p className="text-white/25 text-2xs mt-1">或从相册中选择二维码图片</p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2.5 w-full">
            <button onClick={triggerScan}
              className="w-full py-4 rounded-2xl bg-accent text-white text-sm font-semibold flex items-center justify-center gap-2">
              <QrCode size={16} />
              {scannerActive ? '正在识别…' : '模拟扫描（演示）'}
            </button>
            <button className="w-full py-3.5 rounded-2xl border border-white/10 text-white/50 text-sm">
              从相册选择
            </button>
          </div>

          {/* Example QR cards */}
          <div className="w-full">
            <p className="text-2xs text-white/25 mb-2">可扫描的插件来源</p>
            <div className="flex gap-2">
              {['Builder 分享卡', '插件市场', 'Design Platform 导出'].map(s => (
                <span key={s} className="text-2xs px-2.5 py-1.5 rounded-xl border border-white/[0.07] text-white/30 bg-white/[0.02]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Stage: Preview ──────────────────────────────────────────────────── */}
      {stage === 'preview' && (
        <div className="flex-1 overflow-y-auto pb-32">
          {/* Plugin hero */}
          <div className={`mx-4 mt-2 rounded-3xl bg-gradient-to-br ${SCANNED_PLUGIN.gradient} border border-white/10 p-6 mb-5`}>
            <div className="text-5xl mb-3">{SCANNED_PLUGIN.emoji}</div>
            <h2 className="text-xl font-bold text-white">{SCANNED_PLUGIN.name}</h2>
            <p className="text-white/50 text-sm mt-1">{SCANNED_PLUGIN.author}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                <ThumbsUp size={9} className="inline mr-1" />{SCANNED_PLUGIN.rating}%
              </span>
              <span className="text-2xs text-white/40">{SCANNED_PLUGIN.installs} 安装</span>
              <span className="text-2xs px-2 py-0.5 rounded-full border border-green-500/30 text-green-400 bg-green-500/10">
                官方插件
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="px-4 mb-5">
            <p className="text-sm text-white/65 leading-relaxed">{SCANNED_PLUGIN.desc}</p>
          </div>

          {/* Preview scenes */}
          <div className="px-4 mb-5">
            <p className="text-2xs text-white/30 uppercase tracking-wider mb-2.5">场景预览</p>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.05]">
              {SCANNED_PLUGIN.preview.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <p.icon size={13} className="text-accent shrink-0" />
                  <span className="text-sm text-white/65 font-mono">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className="px-4 mb-5">
            <p className="text-2xs text-white/30 uppercase tracking-wider mb-2.5">所需权限</p>
            <div className="space-y-1.5">
              {SCANNED_PLUGIN.permissions.map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-white/50">
                  <ShieldCheck size={12} className="text-success/60 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Sandbox badge */}
          <div className="mx-4 mb-5 flex items-center gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05]">
            <ShieldCheck size={14} className="text-amber-400 shrink-0" />
            <p className="text-2xs text-amber-300/70 leading-relaxed">
              此插件在沙箱中运行，无法访问你的网络或其他 App 数据
            </p>
          </div>
        </div>
      )}

      {/* ── Stage: Installing ───────────────────────────────────────────────── */}
      {stage === 'installing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400/20 to-yellow-400/15 border border-white/10 flex items-center justify-center">
            <span className="text-4xl">{SCANNED_PLUGIN.emoji}</span>
          </div>
          <div className="text-center">
            <p className="text-white/80 font-semibold">{SCANNED_PLUGIN.name}</p>
            <p className="text-white/35 text-sm mt-1">正在安装…</p>
          </div>
          <div className="w-full">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-pink-500"
                animate={{ width: `${progress}%` }} transition={{ ease: 'linear' }} />
            </div>
            <p className="text-2xs text-white/25 text-right mt-1.5">{progress}%</p>
          </div>
        </div>
      )}

      {/* ── Stage: Done ─────────────────────────────────────────────────────── */}
      {stage === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14 }}
            className="w-20 h-20 rounded-3xl bg-success/15 border border-success/30 flex items-center justify-center">
            <Check size={36} className="text-success" />
          </motion.div>
          <div className="text-center">
            <p className="text-white/85 font-semibold text-lg">安装成功</p>
            <p className="text-white/40 text-sm mt-1.5">
              「{SCANNED_PLUGIN.name}」已添加到你的插件库<br />场景已自动写入 Studio
            </p>
          </div>
          <div className="flex flex-col gap-2.5 w-full">
            <Link href="/life/home?mode=remote&config=accepted&persona=dad"
              className="w-full py-4 rounded-2xl bg-gradient-to-br from-orange-400 to-accent text-white text-sm font-semibold flex items-center justify-center gap-2">
              <Sparkles size={15} /> 立即体验场景
            </Link>
            <button onClick={() => router.back()}
              className="w-full py-3.5 rounded-2xl border border-white/10 text-white/50 text-sm">
              返回
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom CTA for preview stage ───────────────────────────────────── */}
      {stage === 'preview' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-8 pt-4 bg-gradient-to-t from-[#090909] via-[#090909]/90 to-transparent">
          <button onClick={triggerInstall}
            className="w-full py-4 rounded-2xl bg-gradient-to-br from-orange-400 to-accent text-white text-sm font-semibold flex items-center justify-center gap-2">
            <Download size={15} /> 安装此插件
          </button>
          <button onClick={() => setStage('scanning')}
            className="w-full mt-2 py-3 text-white/35 text-sm">
            取消
          </button>
        </div>
      )}
    </div>
  )
}
