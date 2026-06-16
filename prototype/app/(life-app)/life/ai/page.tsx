'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Mic, Sparkles, AlignJustify, Check,
  RefreshCw, Zap, Cpu, Bell, SkipForward, Rocket,
  Moon, Sun, ShieldCheck, Activity, Thermometer, Clock,
  AlertTriangle, MicOff,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// ─── Plan step types (mirrors Design Platform) ────────────────────────────────────
type StepStatus = 'pending' | 'running' | 'done' | 'skipped'

interface ScenePlanStep {
  id: string
  label: string
  sub?: string
  icon: any
  color: string
  trigger?: string     // optional: sensor/event trigger description
}

interface AiMsg {
  id: number
  role: 'user' | 'ai'
  text: string
  plan?: ScenePlanStep[]
  sceneWidget?: SceneWidget  // rendered scene control widget
}

interface SceneWidget {
  name: string
  emoji: string
  active: boolean
  desc: string
}

// ─── Demo suggestions ────────────────────────────────────────────────────────
const suggestions = [
  { emoji: '🌙', text: '帮我生成一个适合睡前的灯光场景', tag: '场景生成' },
  { emoji: '👴', text: '奶奶今晚起夜时自动开走廊灯', tag: '传感器触发' },
  { emoji: '🏠', text: '每天 18:30 我到家前 10 分钟自动准备', tag: '定时触发' },
  { emoji: '🔒', text: '离家后检查门窗并锁定安防', tag: '场景生成' },
]

const quickChips = [
  { emoji: '🌙', text: '睡眠场景' },
  { emoji: '🌅', text: '早安唤醒' },
  { emoji: '🚨', text: '紧急呼叫' },
  { emoji: '🏠', text: '回家模式' },
  { emoji: '🎬', text: '影院模式' },
]

// ─── Pre-built AI replies with plan cards ────────────────────────────────────
const buildReply = (text: string): AiMsg => {
  const t = text.toLowerCase()

  if (t.includes('睡') || t.includes('睡前')) {
    return {
      id: Date.now() + 1, role: 'ai',
      text: '好的，帮你生成"睡眠准备"场景。这些步骤可以逐一接受：',
      plan: [
        { id: `sp1-${Date.now()}`, label: '卧室灯渐暗至 15%', sub: '色温 2700K · 3 分钟渐变', icon: Moon, color: '#8b5cf6' },
        { id: `sp2-${Date.now()}`, label: '空调切换睡眠模式', sub: '27°C · 静音 · 2 小时后关', icon: Thermometer, color: '#06b6d4' },
        { id: `sp3-${Date.now()}`, label: '启用"入睡检测"自动化', sub: 'FP2 检测到入睡 → 关所有灯', icon: Activity, color: '#10b981', trigger: '传感器触发' },
        { id: `sp4-${Date.now()}`, label: '勿扰模式 · 静音通知', sub: '22:30 → 7:00', icon: Bell, color: '#f59e0b' },
      ],
    }
  }

  if (t.includes('奶奶') || t.includes('起夜') || t.includes('走廊')) {
    return {
      id: Date.now() + 1, role: 'ai',
      text: '检测到适老化需求。我会基于 FP2 毫米波传感器生成夜间守护场景：',
      plan: [
        { id: `ep1-${Date.now()}`, label: '主卧 FP2 · 离床检测触发', sub: '凌晨 22:00–6:00 激活', icon: Activity, color: '#f59e0b', trigger: '传感器触发' },
        { id: `ep2-${Date.now()}`, label: '走廊灯渐亮至 20%', sub: '暖白 2700K · 防炫光', icon: Moon, color: '#8b5cf6' },
        { id: `ep3-${Date.now()}`, label: '卫生间感应灯联动', sub: '人离 → 30 秒后关', icon: Zap, color: '#10b981', trigger: '传感器触发' },
        { id: `ep4-${Date.now()}`, label: '静默推送给家人', sub: '凌晨起夜次数 > 3 · 发日报', icon: Bell, color: '#ec4899' },
      ],
    }
  }

  if (t.includes('到家') || t.includes('回家')) {
    return {
      id: Date.now() + 1, role: 'ai',
      text: '设定回家迎接场景，支持 GPS 或定时双触发：',
      plan: [
        { id: `hm1-${Date.now()}`, label: '到家前 10 分钟预热空调', sub: 'GPS 围栏触发 · 半径 500m', icon: Clock, color: '#06b6d4', trigger: '位置触发' },
        { id: `hm2-${Date.now()}`, label: '玄关灯 + 客厅灯亮起', sub: '色温 4000K · 70%', icon: Sun, color: '#f59e0b' },
        { id: `hm3-${Date.now()}`, label: '安防解除布防', sub: '门锁开启时触发', icon: ShieldCheck, color: '#10b981', trigger: '事件触发' },
      ],
    }
  }

  if (t.includes('离家') || t.includes('门窗') || t.includes('安防')) {
    return {
      id: Date.now() + 1, role: 'ai',
      text: '帮你创建"离家一键"场景，包含安全检查和自动化：',
      plan: [
        { id: `lj1-${Date.now()}`, label: '检查所有门窗传感器状态', sub: '如有未关 → 推送提醒', icon: ShieldCheck, color: '#10b981', trigger: '事件触发' },
        { id: `lj2-${Date.now()}`, label: '关闭全屋非必要电器', sub: '灯光 / 电视 / 插座', icon: Zap, color: '#f59e0b' },
        { id: `lj3-${Date.now()}`, label: '安防全面布防', sub: '摄像头开始录制', icon: ShieldCheck, color: '#ef4444' },
        { id: `lj4-${Date.now()}`, label: '宠物摄像头激活', sub: '每 2 小时截图发你', icon: Bell, color: '#a855f7' },
      ],
    }
  }

  // generic
  return {
    id: Date.now() + 1, role: 'ai',
    text: `好的，我来处理"${text.slice(0, 20)}${text.length > 20 ? '…' : ''}"。`,
    plan: [
      { id: `g1-${Date.now()}`, label: '分析当前设备状态', sub: '读取 Studio 实时数据', icon: Cpu, color: '#6366f1' },
      { id: `g2-${Date.now()}`, label: '生成场景配置', sub: 'AI 根据你的偏好自定义', icon: Sparkles, color: '#8b5cf6' },
    ],
  }
}

// ─── Voice mode ──────────────────────────────────────────────────────────────
function VoiceWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-1 h-10">
      {[3, 7, 5, 9, 4, 8, 3, 6, 5, 7, 4].map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-accent"
          animate={active ? { height: [h * 2, h * 4, h * 2] } : { height: 4 }}
          transition={{ duration: 0.6 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }}
        />
      ))}
    </div>
  )
}

// ─── PlanCard — the core interaction unit ────────────────────────────────────
function PlanCard({ step, status, onAccept, onSkip }: {
  step: ScenePlanStep; status: StepStatus
  onAccept: () => void; onSkip: () => void
}) {
  const Icon = step.icon
  return (
    <motion.div layout
      className={`rounded-2xl border text-sm overflow-hidden transition-all ${
        status === 'done'    ? 'border-success/30 bg-success/[0.04]' :
        status === 'running' ? 'border-accent/30 bg-accent/[0.05] animate-pulse' :
        status === 'skipped' ? 'border-border opacity-40' :
        'border-white/10 bg-white/[0.03]'
      }`}>
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Status / icon */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border`}
          style={{ background: `${step.color}18`, borderColor: `${step.color}35` }}>
          {status === 'running' ? (
            <RefreshCw size={13} className="animate-spin" style={{ color: step.color }} />
          ) : status === 'done' ? (
            <Check size={13} className="text-success" />
          ) : status === 'skipped' ? (
            <SkipForward size={13} className="text-text-subtle" />
          ) : (
            <Icon size={13} style={{ color: step.color }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium leading-tight ${status === 'skipped' ? 'line-through text-text-subtle' : 'text-white/85'}`}>
            {step.label}
          </div>
          {step.sub && status !== 'skipped' && (
            <div className="text-2xs text-white/40 mt-0.5">{step.sub}</div>
          )}
        </div>

        {/* Trigger badge */}
        {step.trigger && status === 'pending' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 shrink-0 whitespace-nowrap">
            {step.trigger}
          </span>
        )}

        {/* Accept / Skip */}
        {status === 'pending' && (
          <div className="flex gap-1.5 shrink-0">
            <button onClick={onAccept}
              className="px-2 py-1 rounded-lg border border-success/40 bg-success/10 text-success text-2xs font-medium hover:bg-success/20 transition">
              接受
            </button>
            <button onClick={onSkip}
              className="px-2 py-1 rounded-lg border border-white/10 text-white/30 text-2xs hover:border-white/20 hover:text-white/50 transition">
              跳过
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Scene widget (rendered after all steps done) ─────────────────────────────
function SceneActivatedCard({ plan }: { plan: ScenePlanStep[] }) {
  const donePlan = plan.filter(s => true) // mock: all activated
  const name = plan[0]?.label.split('·')[0].trim() ?? '新场景'
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-success/30 bg-success/[0.06] p-3.5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center">
          <Check size={16} className="text-success" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white/90">场景已生成</div>
          <div className="text-2xs text-white/40">已写入 Studio · 下次触发时自动执行</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 rounded-xl bg-white text-[#0a0a0a] text-sm font-semibold">
          <Rocket size={13} className="inline mr-1.5" />立即测试
        </button>
        <button className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm">
          编辑场景
        </button>
      </div>
    </motion.div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MsgBubble({ msg, stepStates, onAccept, onSkip, onAcceptAll }: {
  msg: AiMsg
  stepStates: Record<string, StepStatus>
  onAccept: (step: ScenePlanStep) => void
  onSkip: (id: string) => void
  onAcceptAll: (plan: ScenePlanStep[]) => void
}) {
  const isUser = msg.role === 'user'
  const allDone = msg.plan?.every(s => stepStates[s.id] === 'done' || stepStates[s.id] === 'skipped')
  const hasPending = msg.plan?.some(s => !stepStates[s.id] || stepStates[s.id] === 'pending')

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 via-accent to-pink-500 shrink-0 mt-0.5 flex items-center justify-center">
          <Sparkles size={12} className="text-white" />
        </div>
      )}
      <div className={`flex-1 max-w-[88%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-accent text-white rounded-br-sm'
            : 'bg-white/[0.07] text-white/85 rounded-bl-sm'
        }`}>
          {msg.text}
        </div>

        {/* Plan steps */}
        {msg.plan && msg.plan.length > 0 && (
          <div className="w-full mt-2.5 space-y-1.5">
            {hasPending && (
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">场景计划</span>
                <button onClick={() => onAcceptAll(msg.plan!)}
                  className="text-2xs px-2 py-0.5 rounded-lg border border-success/30 bg-success/10 text-success font-medium">
                  全部接受
                </button>
              </div>
            )}
            {msg.plan.map(step => (
              <PlanCard key={step.id} step={step}
                status={stepStates[step.id] ?? 'pending'}
                onAccept={() => onAccept(step)}
                onSkip={() => onSkip(step.id)} />
            ))}
            {allDone && (
              <div className="mt-2">
                <SceneActivatedCard plan={msg.plan} />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AIPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<AiMsg[]>([])
  const [thinking, setThinking] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const [stepStates, setStepStates] = useState<Record<string, StepStatus>>({})
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking, stepStates])

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      const reply = buildReply(text)
      // init plan steps as pending
      if (reply.plan) {
        setStepStates(prev => {
          const next = { ...prev }
          reply.plan!.forEach(s => { next[s.id] = 'pending' })
          return next
        })
      }
      setMessages(prev => [...prev, reply])
    }, 1100)
  }

  const acceptStep = (step: ScenePlanStep) => {
    setStepStates(prev => ({ ...prev, [step.id]: 'running' }))
    setTimeout(() => {
      setStepStates(prev => ({ ...prev, [step.id]: 'done' }))
    }, 1200)
  }

  const skipStep = (id: string) => {
    setStepStates(prev => ({ ...prev, [id]: 'skipped' }))
  }

  const acceptAll = (plan: ScenePlanStep[]) => {
    const pending = plan.filter(s => !stepStates[s.id] || stepStates[s.id] === 'pending')
    pending.forEach((step, i) => {
      setTimeout(() => {
        setStepStates(prev => ({ ...prev, [step.id]: 'running' }))
        setTimeout(() => {
          setStepStates(prev => ({ ...prev, [step.id]: 'done' }))
        }, 1000)
      }, i * 1200)
    })
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090909]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <button onClick={() => router.back()} className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-6 h-6 rounded-full"
            style={{ background: 'conic-gradient(from 0deg, #f59e0b, #ec4899, #8b5cf6, #f59e0b)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-sm font-medium text-white">Aqara AI · 场景助手</span>
        </div>
        <button className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
          <AlignJustify size={18} className="text-white/50" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        {isEmpty ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full pb-6 gap-5">
            <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 via-accent to-pink-500 flex items-center justify-center mb-1">
              <Sparkles size={28} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-white/80 text-base font-semibold">告诉我，你想让家做什么</p>
              <p className="text-white/35 text-2xs mt-1">AI 会生成场景计划，每一步都可以接受或跳过</p>
            </div>
            <div className="w-full space-y-2">
              {suggestions.map((s, i) => (
                <motion.button key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => send(s.text)}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.07] text-left hover:bg-white/[0.08] transition-colors">
                  <span className="text-xl shrink-0">{s.emoji}</span>
                  <div className="flex-1">
                    <span className="text-white/75 text-sm">{s.text}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/30 shrink-0 whitespace-nowrap">
                    {s.tag}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="py-4 space-y-5">
            {messages.map(msg => (
              <MsgBubble key={msg.id} msg={msg}
                stepStates={stepStates}
                onAccept={acceptStep} onSkip={skipStep} onAcceptAll={acceptAll} />
            ))}
            {thinking && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 via-accent to-pink-500 shrink-0" />
                <div className="bg-white/[0.07] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Voice mode overlay */}
      <AnimatePresence>
        {voiceMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#090909] flex flex-col items-center justify-center z-20 gap-6">
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-accent to-pink-500 flex items-center justify-center"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}>
              <Mic size={36} className="text-white" />
            </motion.div>
            <VoiceWave active />
            <p className="text-white/60 text-sm">正在聆听…说出你想要的场景</p>
            <div className="flex gap-4">
              <button onClick={() => {
                setVoiceMode(false)
                send('帮我生成一个舒适的阅读场景')
              }} className="px-6 py-3 rounded-2xl bg-white text-[#0a0a0a] text-sm font-semibold">
                完成
              </button>
              <button onClick={() => setVoiceMode(false)}
                className="px-6 py-3 rounded-2xl border border-white/15 text-white/60 text-sm">
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick chips */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar shrink-0">
        {quickChips.map(chip => (
          <button key={chip.text} onClick={() => send(chip.text)}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/65 text-2xs font-medium whitespace-nowrap hover:bg-white/10 transition-colors">
            <span>{chip.emoji}</span>
            <span>{chip.text}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-8 pt-1 shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.07] border border-white/[0.09] focus-within:border-accent/40 transition-colors">
          <button onClick={() => setVoiceMode(true)}
            className="text-white/40 hover:text-accent transition-colors shrink-0">
            <Mic size={20} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="描述你想要的场景或自动化…"
            className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none"
          />
          <button onClick={() => send(input)} disabled={!input.trim()}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              input.trim()
                ? 'bg-gradient-to-br from-orange-400 to-accent scale-100'
                : 'bg-white/10 scale-90'
            }`}>
            <Sparkles size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
