'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MapPin, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

const regions = [
  { code: 'cn', label: '中国大陆', flag: '🇨🇳' },
  { code: 'sg', label: '新加坡', flag: '🇸🇬' },
  { code: 'us', label: '美国', flag: '🇺🇸' },
  { code: 'eu', label: '欧洲', flag: '🇪🇺' },
]

// ── Home loading screen ───────────────────────────────────────────────────────
function HomeLoading({ onDone }: { onDone: () => void }) {
  // Three phases: fade-in logo → pulse → fade-out to home
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onAnimationComplete={() => {
        // Start the 1.8s hold then call onDone
        setTimeout(onDone, 1800)
      }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo orb */}
      <div className="relative mb-8">
        <motion.div
          className="w-20 h-20 rounded-[26px] bg-gradient-to-br from-accent/30 to-accent2/30 border border-accent/20 flex items-center justify-center"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-0 rounded-[26px]"
            style={{
              background: 'conic-gradient(from 0deg, #6366f1, #ec4899, #8b5cf6, #6366f1)',
              opacity: 0.25,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          <Sparkles size={32} className="text-accent relative z-10" />
        </motion.div>
        {/* Ping ring */}
        <motion.div
          className="absolute inset-0 rounded-[26px] border border-accent/30"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </div>

      <motion.p
        className="text-lg font-bold text-text mb-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Aqara Life
      </motion.p>
      <motion.p
        className="text-2xs text-text-subtle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        正在加载你的家…
      </motion.p>

      {/* Progress dots */}
      <motion.div
        className="flex gap-1.5 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

// ── Signin page ───────────────────────────────────────────────────────────────
export default function LifeSigninPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'password' | 'code'>('password')
  const [region, setRegion] = useState(regions[0])
  const [showRegionPicker, setShowRegionPicker] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [phone, setPhone] = useState('18718670866')
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)

  const canLogin = tab === 'password' ? pwd.length >= 1 : phone.length >= 6

  const handleLogin = () => {
    if (!canLogin || loading) return
    setLoading(true)
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-4 pb-6 relative">
      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <HomeLoading onDone={() => router.push('/life/home')} />
        )}
      </AnimatePresence>

      {/* Region chip */}
      <div className="flex justify-end mb-10">
        <button
          onClick={() => setShowRegionPicker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-bg-subtle text-2xs text-text-muted hover:border-border-strong transition-colors"
        >
          <MapPin size={11} className="text-accent" />
          <span>{region.flag} {region.label}</span>
          <ChevronDown size={10} />
        </button>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">欢迎回来</h1>
        <p className="text-sm text-text-muted">登录 Aqara Life</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-6 mb-6 border-b border-border">
        {(['password', 'code'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2.5 text-sm font-medium transition-colors relative ${
              tab === t ? 'text-text' : 'text-text-subtle'
            }`}
          >
            {t === 'password' ? '密码登录' : '验证码登录'}
            {tab === t && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3 flex-1">
        {/* Phone */}
        <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-border bg-bg-subtle focus-within:border-accent/50 transition-colors">
          <span className="text-sm text-text-muted num shrink-0">+86</span>
          <div className="w-px h-4 bg-border" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="手机号"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-subtle outline-none num"
          />
        </div>

        <AnimatePresence mode="wait">
          {tab === 'password' ? (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-border bg-bg-subtle focus-within:border-accent/50 transition-colors"
            >
              <input
                type={showPwd ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="请输入密码"
                className="flex-1 bg-transparent text-sm text-text placeholder:text-text-subtle outline-none"
              />
              <button onClick={() => setShowPwd(!showPwd)} className="text-text-subtle">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center px-4 py-3.5 rounded-xl border border-border bg-bg-subtle focus-within:border-accent/50 transition-colors">
                <input
                  type="text"
                  placeholder="验证码"
                  maxLength={6}
                  className="flex-1 bg-transparent text-sm text-text placeholder:text-text-subtle outline-none num"
                />
              </div>
              <button className="shrink-0 px-4 py-3.5 rounded-xl border border-accent/40 text-accent text-sm font-medium">
                获取验证码
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'password' && (
          <div className="flex justify-between text-2xs text-text-subtle">
            <span>没有账号，<span className="text-accent cursor-pointer">去注册</span></span>
            <span className="text-accent cursor-pointer">忘记密码</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Login button — disabled until password entered */}
        <button
          onClick={handleLogin}
          disabled={!canLogin}
          className={`flex items-center justify-center py-3.5 rounded-xl text-sm font-semibold transition-all ${
            canLogin
              ? 'bg-accent text-white active:scale-[0.98]'
              : 'bg-accent/30 text-white/50 cursor-not-allowed'
          }`}
        >
          登录
        </button>

        <p className="text-center text-2xs text-text-subtle mt-1">
          登录即同意{' '}
          <span className="text-accent/80">《使用条款》</span>
          {' '}和{' '}
          <span className="text-accent/80">《隐私政策》</span>
        </p>
      </div>

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
              <p className="text-sm font-semibold text-text px-5 mb-3">选择地区 / 数据中心</p>
              <p className="text-2xs text-text-subtle px-5 mb-4">
                地区决定你的数据存储位置，请选择登录地区
              </p>
              {regions.map((r) => (
                <button
                  key={r.code}
                  onClick={() => { setRegion(r); setShowRegionPicker(false) }}
                  className={`flex items-center justify-between w-full px-5 py-3.5 hover:bg-bg-subtle transition-colors ${
                    region.code === r.code ? 'text-text' : 'text-text-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{r.flag}</span>
                    <span className="text-sm">{r.label}</span>
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
