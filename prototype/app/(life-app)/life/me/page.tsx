'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, User, Globe, Puzzle, HelpCircle, Shield, Info, LogOut, ChevronDown, Code2, Package, Clock, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from '../../components/BottomNav'

const regions = [
  { code: 'cn', label: '中国大陆', flag: '🇨🇳' },
  { code: 'sg', label: '新加坡', flag: '🇸🇬' },
  { code: 'us', label: '美国', flag: '🇺🇸' },
  { code: 'eu', label: '欧洲', flag: '🇪🇺' },
]

// All Installer-pushed configs for this account
const ALL_PENDING_CONFIGS = [
  {
    id: 'pc-001',
    pluginId: 'lp-001',
    name: '家庭安防套装',
    installer: '王工',
    persona: 'dad',
    studio: 'M300 Studio',
    emoji: '🛡️',
    gradient: 'from-slate-800 to-blue-900',
    pushedAt: '5 分钟前',
  },
]

const menuItems = [
  { icon: Puzzle,       label: '插件管理',           value: '5 个插件', href: '#' },
  { icon: Code2,        label: 'Aqara Builder 工作台', value: null,       href: '/home',    external: true },
  { icon: Globe,        label: '地区',                value: null,       href: '#',        isRegion: true },
  { icon: HelpCircle,   label: '帮助与支持',          value: null,       href: '#' },
  { icon: Shield,       label: '用户协议与隐私',      value: null,       href: '#' },
  { icon: Info,         label: '关于',                value: null,       href: '#' },
]

export default function MePage() {
  return <Suspense><MeContent/></Suspense>
}

function MeContent() {
  const params = useSearchParams()
  const studioName = params?.get('studio') ?? undefined
  const config     = params?.get('config') ?? undefined
  const persona    = params?.get('persona') ?? undefined
  // When returning from plugin detail after apply, ?applied=<id> marks it done
  const appliedParam = params?.get('applied') ?? undefined

  const configApplied = studioName && config === 'accepted'
  const studioExtra   = configApplied && persona ? `config=accepted&persona=${persona}` : undefined

  const [appliedIds, setAppliedIds] = useState<Set<string>>(() => {
    const init = new Set<string>()
    if (appliedParam) init.add(appliedParam)
    return init
  })

  const pendingConfigs = ALL_PENDING_CONFIGS.filter(c => !appliedIds.has(c.id))
  const appliedConfigs = ALL_PENDING_CONFIGS.filter(c => appliedIds.has(c.id))
  const [region, setRegion] = useState(regions[0])
  const [showRegionPicker, setShowRegionPicker] = useState(false)
  const [proTapCount, setProTapCount] = useState(0)
  const [showProUnlock, setShowProUnlock] = useState(false)

  const handleVersionTap = () => {
    const next = proTapCount + 1
    setProTapCount(next)
    if (next >= 7) {
      setShowProUnlock(true)
      setProTapCount(0)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="flex-1 overflow-y-auto">
        {/* Profile section */}
        <div className="px-5 pt-6 pb-5 border-b border-border">
          <button className="flex items-center gap-4 w-full text-left hover:opacity-80 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/40 to-accent2/40 border border-accent/20 flex items-center justify-center shrink-0">
              <User size={24} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-text">Jun</p>
              <p className="text-2xs text-text-subtle">@liangjunucd</p>
            </div>
            <ChevronRight size={16} className="text-text-subtle shrink-0"/>
          </button>
        </div>

        {/* Pending configs from Installer */}
        <AnimatePresence>
          {pendingConfigs.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
            >
              <div className="px-4 pt-3 pb-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xs font-medium text-text-subtle uppercase tracking-wider flex items-center gap-1.5">
                    <Package size={11}/> 待应用配置
                  </p>
                  <span className="text-2xs text-text-subtle">{pendingConfigs.length} 个</span>
                </div>
                <div className="space-y-2">
                  {pendingConfigs.map(cfg => {
                    const applyHref = `/life/plugin/${cfg.pluginId}?studio=${encodeURIComponent(cfg.studio)}&installer=${cfg.persona}&configId=${cfg.id}`
                    return (
                      <Link key={cfg.id} href={applyHref}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border border-accent/20 bg-accent/5 hover:bg-accent/8 transition-colors">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0`}>
                          <span className="text-xl">{cfg.emoji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text leading-tight">{cfg.name}</p>
                          <p className="text-2xs text-text-muted mt-0.5">{cfg.installer} 推送 · {cfg.studio}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-2xs px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">获取</span>
                          <span className="text-2xs text-text-subtle flex items-center gap-0.5">
                            <Clock size={9}/>{cfg.pushedAt}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Applied configs — reset to default */}
        <AnimatePresence>
          {appliedConfigs.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
            >
              <div className="px-4 pt-3 pb-1">
                <p className="text-2xs font-medium text-text-subtle uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Package size={11}/> 已应用配置
                </p>
                <div className="space-y-2">
                  {appliedConfigs.map(cfg => (
                    <div key={cfg.id} className="flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-bg-subtle">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0`}>
                        <span className="text-xl">{cfg.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text leading-tight">{cfg.name}</p>
                        <p className="text-2xs text-text-muted mt-0.5">{cfg.installer} · {cfg.studio}</p>
                      </div>
                      <button
                        onClick={() => {
                          setAppliedIds(prev => { const s = new Set(prev); s.delete(cfg.id); return s })
                        }}
                        className="flex items-center gap-1 text-2xs text-text-subtle border border-border rounded-lg px-2 py-1 hover:border-border-strong hover:text-text transition-colors shrink-0"
                      >
                        <RotateCcw size={10}/> 恢复默认
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu items */}
        <div className="px-4 py-3">
          <div className="card divide-y divide-border overflow-hidden">
            {menuItems.map((item) => {
              const inner = (
                <>
                  <item.icon size={17} className="text-text-muted shrink-0" />
                  <span className="flex-1 text-sm text-text">{item.label}</span>
                  {item.isRegion ? (
                    <span className="text-sm text-text-muted flex items-center gap-1">
                      {region.flag} {region.label}
                      <ChevronRight size={14} className="text-text-subtle" />
                    </span>
                  ) : item.value ? (
                    <span className="text-sm text-text-muted">{item.value}</span>
                  ) : (
                    <ChevronRight size={14} className="text-text-subtle" />
                  )}
                </>
              )
              if (item.isRegion) {
                return (
                  <button key={item.label} onClick={() => setShowRegionPicker(true)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg-subtle transition-colors text-left">
                    {inner}
                  </button>
                )
              }
              if (item.href && item.href !== '#') {
                return (
                  <Link key={item.label} href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg-subtle transition-colors">
                    {inner}
                  </Link>
                )
              }
              return (
                <button key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg-subtle transition-colors text-left">
                  {inner}
                </button>
              )
            })}
          </div>
        </div>

        {/* Pro toolbox entry (hidden until unlocked) */}
        <AnimatePresence>
          {showProUnlock && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-2"
            >
              <Link
                href="/life/me/pro-toolbox"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-accent/25 bg-accent/8"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                  <span className="text-sm">⚙️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">Pro 工具箱</p>
                  <p className="text-2xs text-text-subtle">批量配网 · Workspace 管理</p>
                </div>
                <ChevronRight size={14} className="text-text-subtle" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <div className="px-4 pt-2 pb-4">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-danger/20 bg-danger/5 hover:bg-danger/8 transition-colors">
            <LogOut size={16} className="text-danger" />
            <span className="text-sm text-danger font-medium">退出登录</span>
          </button>
        </div>

        {/* Version (hidden tap target for Pro unlock) */}
        <button onClick={handleVersionTap} className="w-full py-4 text-center">
          <p className="text-2xs text-text-subtle">
            Aqara Life v0.1.0 · {proTapCount > 0 ? `再点 ${7 - proTapCount} 次解锁 Pro 工具箱` : '版本信息'}
          </p>
        </button>
      </div>

      <BottomNav active="我的" mode={configApplied ? 'studio' : 'solo'} studioName={studioName} studioExtra={studioExtra}/>

      {/* Region picker sheet */}
      <AnimatePresence>
        {showRegionPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-10"
              onClick={() => setShowRegionPicker(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-3xl z-20 pb-8"
            >
              <div className="w-10 h-1 bg-border-strong rounded-full mx-auto mt-3 mb-5" />
              <p className="text-sm font-semibold text-text px-5 mb-1">切换地区</p>
              <p className="text-2xs text-text-subtle px-5 mb-4 leading-relaxed">
                切换地区后，将显示该地区下绑定的 Studio 和数据。局域网内发现的 Studio 不受此限制。
              </p>
              {regions.map((r) => (
                <button
                  key={r.code}
                  onClick={() => { setRegion(r); setShowRegionPicker(false) }}
                  className={`flex items-center justify-between w-full px-5 py-3.5 hover:bg-bg-subtle transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{r.flag}</span>
                    <span className="text-sm text-text">{r.label}</span>
                  </div>
                  {region.code === r.code && (
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
