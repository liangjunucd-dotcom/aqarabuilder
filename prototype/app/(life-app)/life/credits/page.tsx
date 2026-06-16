'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Check, Sparkles, Zap, Brain, Home, Shield, Leaf } from 'lucide-react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'monthly',
    name: 'Aqara AI · 月付',
    price: '¥28',
    period: '/月',
    highlight: null,
    badge: null,
    features: [
      '每月 500 空间灵感值',
      '无限 AI 场景建议',
      '家庭能耗每日分析',
      '单设备语境记忆',
    ],
  },
  {
    id: 'yearly',
    name: 'Aqara AI Pro · 年付',
    price: '¥19',
    period: '/月',
    highlight: '省 ¥108/年',
    badge: '最受欢迎',
    features: [
      '每年 6,000 + 赠送 1,200 灵感值',
      '全家成员行为学习',
      '跨空间场景联动',
      '家庭共享最多 5 人',
      '优先 AI 响应 · 离线推理',
    ],
  },
]

const abilities = [
  {
    icon: Brain,
    title: '越住越懂你',
    desc: '持续学习全家的生活节律——周一早晨和周末，灯光和温度自然不同',
    cost: '10 灵感值 / 次',
  },
  {
    icon: Home,
    title: '空间主动进化',
    desc: '无需手动配置，Aqara AI 会在合适的时机提议并执行最优场景',
    cost: '5 灵感值 / 次',
  },
  {
    icon: Shield,
    title: '24h 安防守护',
    desc: '实时感知异常，AI 判断真实威胁再提醒你，告别无效打扰',
    cost: '8 灵感值 / 次',
  },
  {
    icon: Leaf,
    title: '帮你省真实的钱',
    desc: '找出家里的电耗大户，自动制定节能策略，每月省下可见的费用',
    cost: '3 灵感值 / 次',
  },
]

export default function CreditsPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('yearly')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-bg-subtle">
          <ChevronLeft size={20} className="text-text-muted"/>
        </button>
        <h1 className="text-base font-semibold text-text">Aqara AI</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 mb-5 rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
        >
          {/* Ambient glow blobs */}
          <div className="absolute top-4 left-6 w-20 h-20 rounded-full bg-purple-500/20 blur-2xl"/>
          <div className="absolute bottom-4 right-8 w-24 h-24 rounded-full bg-blue-500/20 blur-2xl"/>

          <div className="relative px-5 py-7 text-center">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4 border border-white/15"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles size={28} className="text-purple-300"/>
            </motion.div>
            <p className="text-xl font-bold text-white mb-1.5">你的家，现在有了 Aqara AI</p>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">
              不只是控制开关——它感知你的节律、读懂家人的偏好，让空间持续进化，变成真正属于你的家
            </p>
            <div className="mt-4 flex items-center justify-center gap-4">
              {['学习你', '保护你', '帮助你'].map((t, i) => (
                <motion.div key={t}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-1 text-2xs text-white/60">
                  <span className="w-1 h-1 rounded-full bg-purple-400 shrink-0"/>
                  {t}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="px-4 mb-5 space-y-3">
          {plans.map((plan, i) => {
            const isSelected = selected === plan.id
            return (
              <motion.button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-accent bg-accent/8'
                    : 'border-border bg-bg-subtle'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-accent text-white text-2xs font-semibold">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <p className="text-sm font-semibold text-text">{plan.name}</p>
                    {plan.highlight && (
                      <p className="text-2xs text-success mt-0.5">{plan.highlight}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-text">{plan.price}</span>
                    <span className="text-2xs text-text-subtle">{plan.period}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={12} className={isSelected ? 'text-accent' : 'text-success'} />
                      <span className="text-2xs text-text-subtle">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.button>
            )
          })}

          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="w-full py-4 rounded-2xl bg-accent text-white text-sm font-semibold"
          >
            开始 7 天免费体验
          </motion.button>
          <p className="text-center text-2xs text-text-subtle">免费期结束后按所选方案收费 · 随时取消</p>
        </div>

        {/* AI abilities */}
        <div className="px-4 mb-6">
          <p className="text-base font-bold text-text mb-3">Aqara AI 能做什么</p>
          <div className="space-y-2.5">
            {abilities.map((a, i) => (
              <motion.div key={a.title}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-start gap-3.5 p-4 rounded-2xl border border-border bg-bg-subtle"
              >
                <div className="w-9 h-9 rounded-xl bg-accent/12 border border-accent/20 flex items-center justify-center shrink-0">
                  <a.icon size={16} className="text-accent"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text mb-0.5">{a.title}</p>
                  <p className="text-2xs text-text-muted leading-relaxed">{a.desc}</p>
                </div>
                <span className="text-2xs text-text-subtle shrink-0 mt-0.5 whitespace-nowrap">{a.cost}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social proof footer */}
        <div className="px-4 pb-8 text-center">
          <p className="text-2xs text-text-subtle leading-relaxed">
            已有 <span className="text-text font-medium">12,400+</span> 个家庭开启了 Aqara AI<br/>
            平均每月节省 <span className="text-success font-medium">¥38</span> 电费 · 安防误报减少 <span className="text-text font-medium">86%</span>
          </p>
        </div>
      </div>
    </div>
  )
}
