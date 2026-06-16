'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Wifi, Cloud, Plus,
  CheckSquare, Square, Server, RefreshCw,
  BookOpen, Package, LayoutGrid, ArrowRight, Check,
  Activity, AlertTriangle, Cpu, Zap, ShieldCheck, Sparkles, MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

// ── Data ──────────────────────────────────────────────────────────────────────
const workspaces = [
  { id: 'personal', name: 'Personal',      dc: 'cn', dcLabel: '中国大陆', flag: '🇨🇳', studioCount: 1, isDefault: true },
  { id: 'proj-a',   name: 'Project Alpha', dc: 'sg', dcLabel: '新加坡',   flag: '🇸🇬', studioCount: 3 },
  { id: 'proj-b',   name: 'Project Beta',  dc: 'us', dcLabel: '美国',     flag: '🇺🇸', studioCount: 0 },
]

const connectedStudios = [
  { id: 's1', name: 'M300 Studio',   online: true  },
  { id: 's2', name: 'Jun Studio',    online: true  },
  { id: 's3', name: 'Bella Studio',  online: false },
]

type DeviceTypeId = 'aqara' | 'matter' | 'zigbee'
const deviceTypes: { id: DeviceTypeId; icon: string; name: string; desc: string }[] = [
  { id: 'aqara',  icon: '🔵', name: 'Aqara 设备',  desc: 'Zigbee/BLE/Wi-Fi 子协议，扫码或导入文件批量激活' },
  { id: 'matter', icon: '⚫', name: 'Matter 设备', desc: '需要 Matter 控制器，扫描二维码完成配对' },
  { id: 'zigbee', icon: '🔴', name: 'Zigbee 设备', desc: '需要 Zigbee 网关，大规模 Mesh 组网' },
]

const quickLinks = [
  { icon: BookOpen,   label: 'Developer 文档', desc: 'API 参考 · SDK · 插件开发指南', href: '#' },
  { icon: Package,    label: '我的插件',        desc: '管理已发布的插件版本',           href: '/home/assets' },
  { icon: LayoutGrid, label: 'Builder 工作台',  desc: '回到 Pro 工作台',               href: '/home' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProToolboxPage() {
  const [tab, setTab]               = useState<'batch' | 'diagnose' | 'quick'>('batch')
  const [selectedStudio, setSelectedStudio] = useState(connectedStudios[0])
  const [selectedType, setSelectedType]     = useState<DeviceTypeId | null>(null)
  const [step, setStep]             = useState<1 | 2>(1)
  const [showStudioPicker, setShowStudioPicker] = useState(false)

  const reset = () => { setStep(1); setSelectedType(null) }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
        <Link href="/life/me" className="p-1 rounded-lg hover:bg-bg-subtle transition-colors">
          <ChevronLeft size={20} className="text-text-muted" />
        </Link>
        <div>
          <h1 className="text-base font-semibold text-text">Pro 工具箱</h1>
          <p className="text-2xs text-text-subtle">Installer / 开发者专用</p>
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex px-4 pt-3 pb-0 gap-2 shrink-0 overflow-x-auto">
        {([
          { id: 'batch'     as const, label: '批量配网', icon: Wifi },
          { id: 'diagnose'  as const, label: 'AI 排障',   icon: Activity },
          { id: 'quick'     as const, label: '快捷入口', icon: ArrowRight },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-2xs font-medium border transition-all ${
              tab === t.id
                ? 'bg-accent/12 border-accent/30 text-accent'
                : 'border-border text-text-subtle hover:border-border-strong'
            }`}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BATCH TAB ──────────────────────────────────────────────────────── */}
      {tab === 'batch' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Step indicator */}
          <div className="flex items-center gap-2 px-5 py-3 shrink-0">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold transition-colors ${
                  step === n ? 'bg-accent text-white' : step > n ? 'bg-success text-white' : 'bg-bg-subtle border border-border text-text-subtle'
                }`}>
                  {step > n ? <Check size={10}/> : n}
                </div>
                <span className={`text-2xs ${step === n ? 'text-text font-medium' : 'text-text-subtle'}`}>
                  {n === 1 ? '选择 Studio' : '选择设备类型'}
                </span>
                {n < 2 && <ChevronRight size={12} className="text-border-strong"/>}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-3 pt-2"
              >
                <p className="text-2xs text-text-muted mb-2">选择要在哪台 M300 Studio 下批量配置子设备</p>
                {connectedStudios.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    onClick={() => setSelectedStudio(s)}
                    disabled={!s.online}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left ${
                      !s.online
                        ? 'border-border bg-bg opacity-40 cursor-not-allowed'
                        : selectedStudio.id === s.id
                        ? 'border-accent/40 bg-accent/8'
                        : 'card hover:border-border-strong'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                      s.online ? 'bg-bg border-border' : 'bg-bg-subtle border-border'
                    }`}>
                      <span className="text-lg">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text">{s.name}</p>
                      <p className={`text-2xs mt-0.5 ${s.online ? 'text-success' : 'text-text-subtle'}`}>
                        {s.online ? '● 在线' : '○ 离线'}
                      </p>
                    </div>
                    {selectedStudio.id === s.id && s.online && (
                      <Check size={16} className="text-accent shrink-0"/>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-3 pt-2"
              >
                <p className="text-2xs text-text-muted mb-2">
                  为 <span className="text-text font-medium">{selectedStudio.name}</span> 选择一种设备类型进行批量入网
                </p>
                {deviceTypes.map((dt, i) => (
                  <motion.button
                    key={dt.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    onClick={() => setSelectedType(dt.id)}
                    className={`w-full flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
                      selectedType === dt.id
                        ? 'border-accent/40 bg-accent/8'
                        : 'card hover:border-border-strong'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-bg-subtle border border-border flex items-center justify-center shrink-0 text-xl">
                      {dt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text mb-0.5">{dt.name}</p>
                      <p className="text-2xs text-text-muted leading-relaxed">{dt.desc}</p>
                    </div>
                    {selectedType === dt.id && (
                      <Check size={16} className="text-accent shrink-0 mt-0.5"/>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Bottom CTA */}
          <div className="px-4 py-3 border-t border-border shrink-0">
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-2xl bg-accent text-white text-sm font-semibold"
              >
                下一步
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 py-3.5 rounded-2xl border border-border text-sm text-text-subtle font-medium"
                >
                  上一步
                </button>
                <Link
                  href="/life/studios/add/binding"
                  className={`flex-[2] py-3.5 rounded-2xl text-sm font-semibold text-center transition-colors ${
                    selectedType
                      ? 'bg-accent text-white'
                      : 'bg-bg-subtle border border-border text-text-subtle pointer-events-none opacity-50'
                  }`}
                >
                  开始批量配网
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DIAGNOSE TAB ────────────────────────────────────────────────────── */}
      {tab === 'diagnose' && <AIDiagnoseTab />}

      {/* ── QUICK TAB ──────────────────────────────────────────────────────── */}
      {tab === 'quick' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <p className="text-2xs text-text-subtle">从 Life App 直达 Builder / 文档 / 插件管理</p>
          {quickLinks.map((l, i) => (
            <motion.div
              key={l.href}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            >
              <Link href={l.href} className="flex items-center gap-3 p-4 card card-hover">
                <div className="w-9 h-9 rounded-xl bg-accent/12 border border-accent/20 flex items-center justify-center shrink-0">
                  <l.icon size={16} className="text-accent"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{l.label}</p>
                  <p className="text-2xs text-text-subtle mt-0.5">{l.desc}</p>
                </div>
                <ChevronRight size={14} className="text-text-subtle shrink-0"/>
              </Link>
            </motion.div>
          ))}

          {/* Workspaces overview */}
          <div className="mt-2">
            <p className="text-2xs text-text-subtle font-medium uppercase tracking-wider mb-2">我的 Workspace</p>
            <div className="space-y-2">
              {workspaces.map(ws => (
                <div key={ws.id} className="flex items-center gap-3 p-3.5 card">
                  <span className="text-xl">{ws.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{ws.name}</p>
                    <p className="text-2xs text-text-subtle">{ws.dcLabel} · {ws.studioCount} 台</p>
                  </div>
                  {ws.isDefault && (
                    <span className="text-2xs px-2 py-0.5 rounded-full bg-accent/12 border border-accent/25 text-accent">默认</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AI 排障 Tab ──────────────────────────────────────────────────────────────

type DiagnoseStage = 'pick' | 'analyzing' | 'result'
type DiagnoseStep = { id: string; label: string; detail: string; status: 'pass' | 'warn' | 'fail' }

const PROBLEM_DEVICES = [
  { id: 'd1', name: '客厅窗帘电机', icon: '🪟', issue: '无法正常开合' },
  { id: 'd2', name: '卧室 FP2 传感器', icon: '📡', issue: '检测延迟过高' },
  { id: 'd3', name: '入户门锁', icon: '🔒', issue: '偶发无法响应' },
]

const DIAGNOSE_RESULT: DiagnoseStep[] = [
  { id: 'r1', label: 'Zigbee 信号强度',    detail: '-68 dBm · 正常范围内',   status: 'pass' },
  { id: 'r2', label: '电机固件版本',        detail: 'v2.1.3 · 有新版 v2.2.0', status: 'warn' },
  { id: 'r3', label: '供电电压检测',        detail: '12.1V · 低于推荐 12.5V', status: 'warn' },
  { id: 'r4', label: '近 24h 错误日志',     detail: '发现 7 条 E_STALL 错误',  status: 'fail' },
  { id: 'r5', label: '轨道障碍物检测',      detail: '未检测到物理阻挡',         status: 'pass' },
]

function AIDiagnoseTab() {
  const [stage, setStage] = useState<DiagnoseStage>('pick')
  const [selectedDevice, setSelectedDevice] = useState<typeof PROBLEM_DEVICES[0] | null>(null)
  const [analyzeStep, setAnalyzeStep] = useState(0)
  const [fixApplied, setFixApplied] = useState(false)

  const startAnalysis = (device: typeof PROBLEM_DEVICES[0]) => {
    setSelectedDevice(device)
    setStage('analyzing')
    let i = 0
    const iv = setInterval(() => {
      i++
      setAnalyzeStep(i)
      if (i >= DIAGNOSE_RESULT.length) { clearInterval(iv); setTimeout(() => setStage('result'), 400) }
    }, 700)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === 'pick' && (
          <motion.div key="pick" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }} className="flex-1 overflow-y-auto px-4 py-3">
            <p className="text-2xs text-text-muted mb-3 leading-relaxed">
              选择有问题的设备，AI 将读取 Studio 日志 + 设备诊断数据，输出排障报告并提供一键修复。
            </p>
            <div className="space-y-2.5">
              {PROBLEM_DEVICES.map((d, i) => (
                <motion.button key={d.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => startAnalysis(d)}
                  className="w-full flex items-center gap-3.5 p-4 card card-hover text-left">
                  <div className="w-11 h-11 rounded-xl bg-bg-subtle border border-border flex items-center justify-center text-2xl shrink-0">
                    {d.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{d.name}</p>
                    <p className="text-2xs text-warning mt-0.5 flex items-center gap-1">
                      <AlertTriangle size={10} /> {d.issue}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-2xs font-medium shrink-0">
                    <Sparkles size={10} /> AI 排障
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {stage === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} className="flex-1 overflow-y-auto px-4 py-3">
            <div className="flex items-center gap-3 mb-4 p-3 card">
              <div className="w-9 h-9 rounded-xl bg-bg-subtle border border-border flex items-center justify-center text-xl shrink-0">
                {selectedDevice?.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-text">{selectedDevice?.name}</p>
                <p className="text-2xs text-accent flex items-center gap-1">
                  <RefreshCw size={9} className="animate-spin" /> AI 正在分析…
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {DIAGNOSE_RESULT.map((s, i) => {
                const ran = analyzeStep > i
                const running = analyzeStep === i
                return (
                  <div key={s.id} className={`card p-3 flex items-center gap-3 transition-all ${
                    running ? 'border-accent/30 bg-accent/[0.03]' : !ran ? 'opacity-30' : ''
                  }`}>
                    <div className="w-6 h-6 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
                      {running ? <RefreshCw size={11} className="animate-spin text-accent" />
                        : ran ? (
                          s.status === 'pass' ? <Check size={11} className="text-success" />
                          : s.status === 'warn' ? <AlertTriangle size={11} className="text-warning" />
                          : <AlertTriangle size={11} className="text-danger" />
                        ) : <span className="text-2xs text-text-subtle">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text">{s.label}</p>
                      {ran && <p className="text-2xs text-text-muted mt-0.5">{s.detail}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {stage === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }} className="flex-1 overflow-y-auto px-4 py-3 pb-24">
            {/* Summary */}
            <div className="card p-4 border-warning/30 bg-warning/[0.04] mb-4">
              <div className="flex items-center gap-2.5 mb-2">
                <AlertTriangle size={16} className="text-warning" />
                <p className="text-sm font-semibold text-text">发现 2 个问题，1 个严重</p>
              </div>
              <p className="text-2xs text-text-muted leading-relaxed">
                电机固件过旧（E_STALL 错误频发）+ 供电略低，建议先升级固件后检查电源适配器。
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-2 mb-4">
              {DIAGNOSE_RESULT.map(s => (
                <div key={s.id} className={`card p-3 flex items-center gap-3 ${
                  s.status === 'fail' ? 'border-danger/30 bg-danger/[0.03]' :
                  s.status === 'warn' ? 'border-warning/20' : ''
                }`}>
                  <div className="w-6 h-6 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
                    {s.status === 'pass' ? <Check size={11} className="text-success" />
                      : s.status === 'warn' ? <AlertTriangle size={11} className="text-warning" />
                      : <AlertTriangle size={11} className="text-danger" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text">{s.label}</p>
                    <p className="text-2xs text-text-muted mt-0.5">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI fix recommendation */}
            <div className="card p-4 bg-bg-elevated/60 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-accent-glow" />
                <p className="text-xs font-semibold text-text">AI 修复建议</p>
              </div>
              <div className="space-y-2 text-2xs text-text-muted">
                <p>1. 固件升级：v2.1.3 → v2.2.0（修复 E_STALL 错误，约 2 分钟）</p>
                <p>2. 供电检查：测量电源适配器输出电压，目标 12.5V</p>
                <p>3. 若升级后仍报错，检查轨道润滑（物理维护）</p>
              </div>
            </div>

            {/* One-tap fix */}
            {!fixApplied ? (
              <button onClick={() => setFixApplied(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-br from-accent to-accent2 text-white text-sm font-semibold flex items-center justify-center gap-2">
                <Zap size={14} /> 一键升级固件
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="card p-4 border-success/30 bg-success/[0.04] flex items-center gap-3">
                <Check size={16} className="text-success" />
                <div>
                  <p className="text-sm font-medium text-text">固件升级指令已下发</p>
                  <p className="text-2xs text-text-muted mt-0.5">设备约 2 分钟后自动重启完成升级</p>
                </div>
              </motion.div>
            )}

            <button onClick={() => { setStage('pick'); setAnalyzeStep(0); setFixApplied(false) }}
              className="w-full mt-2.5 py-3 text-text-subtle text-sm text-center">
              诊断其他设备
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
