'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wifi, Send, CloudUpload, CheckCircle } from 'lucide-react'
import Link from 'next/link'

type Step = 'handshake' | 'sending' | 'registering' | 'done'

const steps = [
  { id: 'handshake',   icon: Wifi,        label: '建立本地连接',     desc: '与 Studio 局域网握手' },
  { id: 'sending',     icon: Send,        label: '传递账号信息',     desc: '将账号凭证 + 国家/地区交给 Studio' },
  { id: 'registering', icon: CloudUpload, label: 'Studio 连接云端', desc: 'Studio 正在注册到对应数据中心' },
]


export default function BindingProgressPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStep(1), 1400)
    const t2 = setTimeout(() => setCurrentStep(2), 2800)
    const t3 = setTimeout(() => setDone(true), 4400)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [])

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        >
          <CheckCircle size={60} className="text-success" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold text-text mb-1">云端连接已就绪</h2>
          <p className="text-sm text-text-muted mb-8">
            M300 Studio 已成功连接 Aqara 云
            <br/>
            <span className="text-2xs text-text-subtle">可通过 Aqara Builder / Design Platform / Developer Portal 远程访问</span>
          </p>

          <div className="w-full">
            <Link
              href="/life/home?mode=remote"
              className="block w-full py-3.5 rounded-xl bg-accent text-white text-sm font-semibold text-center"
            >
              进入 Studio
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col px-5 pt-8">
      <h1 className="text-lg font-bold text-text mb-1.5">正在连接...</h1>
      <p className="text-sm text-text-muted mb-8">请保持与 Studio 在同一 Wi-Fi 下</p>

      {/* Steps */}
      <div className="space-y-0 mb-8">
        {steps.map((step, i) => {
          const isDone = currentStep > i
          const isActive = currentStep === i
          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isDone   ? 'bg-success/20 border border-success/40' :
                  isActive ? 'bg-accent/20 border border-accent/40' :
                             'bg-bg-subtle border border-border'
                }`}>
                  {isDone ? (
                    <CheckCircle size={14} className="text-success" />
                  ) : isActive ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <step.icon size={14} className="text-accent" />
                    </motion.div>
                  ) : (
                    <step.icon size={14} className="text-text-subtle" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-px my-1 transition-all duration-700 ${isDone ? 'bg-success/30' : 'bg-border'}`}
                    style={{ height: 28 }} />
                )}
              </div>
              <div className="pb-7">
                <p className={`text-sm font-medium transition-colors ${
                  isDone ? 'text-text-muted' : isActive ? 'text-text' : 'text-text-subtle'
                }`}>
                  {step.label}
                </p>
                {isActive && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xs text-text-subtle mt-0.5">
                    {step.desc}
                  </motion.p>
                )}
                {isDone && <p className="text-2xs text-success mt-0.5">完成</p>}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
