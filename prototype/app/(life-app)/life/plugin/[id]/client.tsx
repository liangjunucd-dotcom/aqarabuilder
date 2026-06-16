'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft, Download, Trash2, Pause, Play, X, ImageIcon, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { getLifePlugin } from '@/lib/mock/life-plugins'
import { ApplyReveal } from '../../../components/ApplyReveal'

type Stage = 'idle' | 'downloading' | 'paused' | 'done'

const TAG_LABEL: Record<string, string> = {
  Official: '官方插件',
  ACB: 'ACB 认证',
  Developer: '开发者',
}

function PluginDetailContent() {
  const params = useParams<{ id?: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const id = params?.id ?? ''
  const studioName = searchParams?.get('studio') ?? undefined
  const installerPersona = searchParams?.get('installer') ?? undefined
  const configId         = searchParams?.get('configId') ?? undefined
  const plugin = getLifePlugin(id)

  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [applied, setApplied] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const pendingHref = installerPersona && studioName
    ? `/life/home?mode=remote&config=accepted&persona=${installerPersona}&studio=${encodeURIComponent(studioName)}`
    : null

  useEffect(() => {
    if (stage !== 'downloading') return
    if (progress >= 100) { setStage('done'); return }
    const t = setTimeout(() => setProgress(p => Math.min(p + Math.floor(6 + Math.random() * 8), 100)), 180)
    return () => clearTimeout(t)
  }, [stage, progress])

  const startDownload = () => { setStage('downloading'); setProgress(0) }
  const cancel = () => { setStage('idle'); setProgress(0) }

  const handleApply = () => {
    if (pendingHref) {
      setRevealing(true)
    } else {
      setApplied(true)
    }
  }

  const handleRevealDone = () => {
    if (pendingHref && studioName) {
      // Navigate to the newly configured home; also carry configId in a
      // separate visit to /life/me so the pending card disappears next time.
      // For the prototype we piggyback it on the home URL — me/page reads it.
      const extra = configId ? `&applied=${configId}` : ''
      router.replace(`${pendingHref}${extra}`)
    }
  }

  if (!plugin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-text-muted px-6 text-center">
        <p className="text-sm">插件不存在</p>
        <button onClick={() => router.back()} className="mt-4 text-accent text-sm">← 返回</button>
      </div>
    )
  }

  const needsStudio = plugin.studioOnly && !studioName

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Blind-box reveal overlay */}
      <AnimatePresence>
        {revealing && installerPersona && (
          <ApplyReveal persona={installerPersona} onDone={handleRevealDone} />
        )}
      </AnimatePresence>

      {/* Nav */}
      <div className="flex items-center px-3 py-2.5 border-b border-border shrink-0">
        <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-bg-subtle transition-colors">
          <ChevronLeft size={22} className="text-text" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className={`w-20 h-20 rounded-[22px] flex items-center justify-center mb-4 bg-gradient-to-br ${plugin.gradient}`}>
            <span className="text-4xl drop-shadow">{plugin.emoji}</span>
          </div>
          <h1 className="text-xl font-bold text-text leading-tight mb-1">{plugin.name}</h1>
          <p className="text-2xs text-text-subtle mb-3">v1.0.0</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs px-2 py-0.5 rounded-md bg-bg-subtle border border-border text-text-muted">
              {TAG_LABEL[plugin.tag] ?? plugin.tag}
            </span>
            <span className="text-2xs px-2 py-0.5 rounded-md bg-bg-subtle border border-border text-text-muted inline-flex items-center gap-1">
              <Download size={10} /> {plugin.installs}
            </span>
            {stage === 'done' && (
              <span className="text-2xs px-2 py-0.5 rounded-md bg-success/15 border border-success/30 text-success inline-flex items-center gap-1">
                ● 已下载
              </span>
            )}
          </div>
        </div>

        {/* Action area */}
        <div className="px-5 pb-5 border-b border-border">
          {stage === 'idle' && (
            <button onClick={startDownload} className="w-full py-3.5 rounded-2xl bg-accent text-white font-semibold text-base">
              获取
            </button>
          )}

          {stage === 'downloading' && (
            <div className="flex items-center gap-2">
              <div className="flex-1 relative h-12">
                <div className="absolute inset-0 rounded-2xl bg-accent overflow-hidden">
                  <div className="h-full bg-accent/50 transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                  下载中... ({progress}%)
                </span>
              </div>
              <button onClick={() => setStage('paused')} className="w-12 h-12 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center shrink-0">
                <Pause size={18} className="text-text" />
              </button>
              <button onClick={cancel} className="w-12 h-12 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center shrink-0">
                <X size={18} className="text-text" />
              </button>
            </div>
          )}

          {stage === 'paused' && (
            <div className="flex items-center gap-2">
              <div className="flex-1 relative h-12">
                <div className="absolute inset-0 rounded-2xl bg-bg-subtle border border-border overflow-hidden">
                  <div className="h-full bg-accent/30" style={{ width: `${progress}%` }} />
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-text-muted font-semibold text-sm">
                  下载暂停 ({progress}%)
                </span>
              </div>
              <button onClick={() => setStage('downloading')} className="w-12 h-12 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center shrink-0">
                <Play size={18} className="text-text" />
              </button>
              <button onClick={cancel} className="w-12 h-12 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center shrink-0">
                <X size={18} className="text-text" />
              </button>
            </div>
          )}

          {stage === 'done' && (
            <>
              {needsStudio && (
                <div className="mb-3 px-4 py-3 rounded-2xl bg-warning/10 border border-warning/25 flex items-start gap-2.5">
                  <AlertTriangle size={15} className="text-warning mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text mb-0.5">需要连接 M300 Studio</p>
                    <p className="text-2xs text-text-muted leading-relaxed">此插件运行在 Studio 上，请先连接一台 Studio 再应用。</p>
                  </div>
                  <Link href="/life/studios" className="text-2xs text-accent font-medium shrink-0 mt-0.5">去连接</Link>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApply}
                  disabled={needsStudio}
                  className={`flex-1 py-3.5 rounded-2xl font-semibold text-base border transition-colors ${
                    needsStudio
                      ? 'bg-bg-subtle border-border text-text-subtle cursor-not-allowed opacity-50'
                      : installerPersona
                      ? 'bg-accent border-accent text-white'
                      : 'bg-bg-subtle border-border-strong text-text hover:bg-bg active:bg-bg-subtle'
                  }`}
                >
                  {applied ? '✓ 已应用' : installerPersona ? '应用专属配置' : '应用'}
                </button>
                <button onClick={cancel} className="w-14 h-14 rounded-2xl bg-bg-subtle border border-border flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-text-muted" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Preview */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-text mb-3">预览</p>
          <div className="flex gap-3">
            {[0, 1].map(i => (
              <div key={i} className="flex-1 aspect-[9/16] rounded-2xl bg-bg-subtle border border-border flex items-center justify-center">
                <ImageIcon size={28} className="text-border-strong" />
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-text mb-2">插件简介</p>
          <p className="text-sm text-text-muted leading-relaxed">{plugin.desc}</p>
        </div>

        {/* Author */}
        <div className="px-5 py-4 pb-8">
          <p className="text-sm font-semibold text-text mb-3">创作者</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-accent2/30 border border-accent/20 flex items-center justify-center text-sm font-bold text-accent shrink-0">
              {plugin.author.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm text-text-muted">{plugin.author}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PluginDetailPage() {
  return <Suspense><PluginDetailContent /></Suspense>
}
