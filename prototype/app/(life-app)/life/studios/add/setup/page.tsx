'use client'

import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Eye, EyeOff, Check, Lock, Shield, User, Cloud, Globe2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

type Step = 'set-password' | 'bind-account'

// 当前会话的国家/地区由 App 登录时选定（见 life/signin），这里只展示，不让选
const SESSION_REGION = { code: 'cn', label: '中国大陆', flag: '🇨🇳', dc: 'CN' }
const SESSION_ACCOUNT = '18718670866'

// Dot + line step indicator — dots only, no labels
function StepBar({ step }: { step: Step }) {
  const steps: Step[] = ['set-password', 'bind-account']
  const current = steps.indexOf(step)

  return (
    <div className="flex items-center px-5 py-3 border-b border-border shrink-0">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${
              done   ? 'bg-accent border-accent' :
              active ? 'bg-bg border-accent' :
                       'bg-bg border-border'
            }`}>
              {done
                ? <Check size={10} className="text-white"/>
                : <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${active ? 'bg-accent' : 'bg-border'}`}/>
              }
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-2 h-px relative overflow-hidden">
                <div className="absolute inset-0 bg-border"/>
                <motion.div
                  className="absolute inset-y-0 left-0 bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SetupContent() {
  const router = useRouter()
  const params = useSearchParams()
  const studioName = params?.get('name') ?? 'M300 Studio'

  const [step, setStep] = useState<Step>('set-password')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Password rules aligned with Studio Web
  const rules = [
    { label: '8–16 位字符', ok: password.length >= 8 && password.length <= 16 },
    { label: '包含大写、小写、数字或符号中的至少两种', ok: [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length >= 2 },
    { label: '两次密码一致', ok: confirm.length > 0 && password === confirm },
  ]
  const allOk = rules.every(r => r.ok)

  const handlePasswordNext = () => { if (allOk) setStep('bind-account') }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button onClick={() => step === 'set-password' ? router.back() : setStep('set-password')}
          className="p-1 rounded-lg hover:bg-bg-subtle">
          <ChevronLeft size={20} className="text-text-muted"/>
        </button>
        <h1 className="text-base font-semibold text-text">初始化 Studio</h1>
      </div>

      {/* Progress bar */}
      <StepBar step={step}/>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Set password ── */}
          {step === 'set-password' && (
            <motion.div key="set-password"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>

              <p className="text-sm text-text-muted mt-4 mb-5">
                为 <span className="text-text font-medium">{studioName}</span> 设置本地账号密码
              </p>

              {/* Username — read-only */}
              <div className="mb-3">
                <label className="text-2xs text-text-subtle font-medium mb-1.5 block">用户名</label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-border bg-bg-subtle/50">
                  <User size={14} className="text-text-subtle shrink-0"/>
                  <span className="flex-1 text-sm text-text font-mono">super</span>
                  <span className="text-2xs text-text-subtle px-1.5 py-0.5 rounded bg-bg border border-border">默认</span>
                </div>
              </div>

              {/* Password field */}
              <div className="mb-3">
                <label className="text-2xs text-text-subtle font-medium mb-1.5 block">密码</label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-border bg-bg-subtle focus-within:border-accent/50 transition-colors">
                  <Lock size={14} className="text-text-subtle shrink-0"/>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="设置密码"
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-text placeholder:text-text-subtle outline-none"
                  />
                  <button onClick={() => setShowPwd(!showPwd)} className="text-text-subtle shrink-0">
                    {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              {/* Confirm field */}
              <div className="mb-4">
                <label className="text-2xs text-text-subtle font-medium mb-1.5 block">确认密码</label>
                <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-border bg-bg-subtle focus-within:border-accent/50 transition-colors">
                  <Lock size={14} className="text-text-subtle shrink-0"/>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="再次输入"
                    className="flex-1 bg-transparent text-sm text-text placeholder:text-text-subtle outline-none"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    {confirm && password === confirm && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check size={14} className="text-success"/>
                      </motion.div>
                    )}
                    <button onClick={() => setShowConfirm(!showConfirm)} className="text-text-subtle">
                      {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline rules — only show once user starts typing */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5 mb-5 px-1">
                  {rules.map(r => (
                    <div key={r.label} className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                        r.ok ? 'bg-success/20' : 'bg-border'
                      }`}>
                        {r.ok && <Check size={8} className="text-success"/>}
                      </div>
                      <span className={`text-2xs transition-colors duration-200 ${r.ok ? 'text-text-subtle' : 'text-text-muted'}`}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              <button onClick={handlePasswordNext}
                disabled={!allOk}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  allOk ? 'bg-accent text-white' : 'bg-bg-subtle text-text-subtle cursor-not-allowed'
                }`}>
                下一步
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Connect to Cloud ── */}
          {step === 'bind-account' && (
            <motion.div key="bind-account"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>

              <p className="text-sm text-text-muted mt-4 mb-5">
                Studio 将连接到云端，绑定后你可以在任何地方安全访问本地 Studio。
              </p>

              {/* 绑定上下文卡片 — 账号 + 国家/地区，只读，不让用户选 Space */}
              <div className="rounded-xl border border-border bg-bg-subtle overflow-hidden mb-3">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center shrink-0">
                    <User size={15} className="text-text-muted"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xs text-text-subtle">账号</p>
                    <p className="text-sm font-medium text-text num truncate">{SESSION_ACCOUNT}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center shrink-0">
                    <Globe2 size={15} className="text-accent"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xs text-text-subtle">地区</p>
                    <p className="text-sm font-medium text-text">
                      <span className="mr-1.5">{SESSION_REGION.flag}</span>
                      {SESSION_REGION.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* 安全说明 */}
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border border-border bg-bg-subtle mb-3">
                <Shield size={14} className="text-accent shrink-0 mt-0.5"/>
                <p className="text-2xs text-text-subtle leading-relaxed">
                  数据保留在本地 Studio，云连接仅用于安全的远程隧道。
                  绑定后可在 Aqara Builder、Design Platform、Developer Portal 任一处远程访问。
                </p>
              </div>

              <button onClick={() => router.push('/life/studios/add/binding')}
                className="w-full py-3.5 rounded-xl bg-accent text-white text-sm font-semibold mb-2 inline-flex items-center justify-center gap-2">
                <Cloud size={15}/>
                连接到云端
              </button>
              <button onClick={() => router.push('/life/studios/connecting?mode=local&name=M300+Studio')}
                className="w-full py-2.5 text-2xs text-text-subtle">
                暂时跳过 · 仅本地使用
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

export default function SetupStudioPage() {
  return <Suspense><SetupContent/></Suspense>
}
