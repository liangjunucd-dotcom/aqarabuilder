'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Zap,
  Heart,
  Cpu,
  Plus,
  Trash2,
  Save,
  Send,
  Play,
  Square,
  Settings,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Users,
  Globe,
  ToggleRight,
  Activity,
  Bell,
  Camera,
  Radio,
  DoorOpen,
  Thermometer,
  Lightbulb,
  Lock,
  MessageSquare,
  Sparkles,
  X,
  ArrowUp,
  Paperclip,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Service type catalog ─────────────

const SERVICE_TYPES = [
  { id: 'security', label: '安防守护', icon: Shield, color: '#ef4444', desc: '摄像头 + 传感器联动告警' },
  { id: 'energy', label: '节能管理', icon: Zap, color: '#f59e0b', desc: '按时段/行为节省用电' },
  { id: 'health', label: '健康关怀', icon: Heart, color: '#ec4899', desc: '老人/儿童行为监测与告警' },
  { id: 'automation', label: '场景自动化', icon: Cpu, color: '#a855f7', desc: '多设备联动的复合场景包' },
  { id: 'custom', label: '自定义服务', icon: Settings, color: '#64748b', desc: '完全自定义名称与逻辑' },
];

// ─── Device catalog ───────────────────

const DEVICE_CATALOG = [
  { id: 'cam', name: '摄像头 G3', icon: Camera, color: '#ef4444', category: 'visual' },
  { id: 'motion', name: '人体传感器 FP2', icon: Radio, color: '#f59e0b', category: 'sensor' },
  { id: 'door', name: '门窗传感器 P2', icon: DoorOpen, color: '#06b6d4', category: 'sensor' },
  { id: 'lock', name: '智能门锁 D100', icon: Lock, color: '#a855f7', category: 'smart' },
  { id: 'temp', name: '温湿度传感器 T1', icon: Thermometer, color: '#10b981', category: 'sensor' },
  { id: 'light', name: '智能灯 T1 Pro', icon: Lightbulb, color: '#f59e0b', category: 'smart' },
  { id: 'bell', name: '警报器 Siren', icon: Bell, color: '#ef4444', category: 'output' },
];

// ─── Rule template ────────────────────

interface ServiceRule {
  id: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

const DEFAULT_RULES: ServiceRule[] = [
  { id: 'r1', trigger: '服务开启时', action: '摄像头推送通知：开', enabled: true },
  { id: 'r2', trigger: '服务开启时', action: '侦测模式：人形侦测', enabled: true },
  { id: 'r3', trigger: '摄像头检测到人', action: '推送服务告警通知', enabled: true },
  { id: 'r4', trigger: '门窗传感器打开', action: '推送服务告警通知', enabled: true },
  { id: 'r5', trigger: '服务停止时', action: '摄像头推送通知：关', enabled: true },
];

type Tab = 'devices' | 'rules' | 'card' | 'publish';

// ─── AI Dialogue overlay ──────────────

function AIDialogue({
  open,
  onClose,
  context,
}: {
  open: boolean;
  onClose: () => void;
  context: string;
}) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [variants, setVariants] = useState<string[]>([]);

  const submit = () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setVariants([]);
    setTimeout(() => {
      setGenerating(false);
      setResult(`已根据你的描述「${prompt}」生成服务配置：添加了 3 条触发规则、绑定 2 个设备、设定了默认通知策略。`);
    }, 1400);
  };

  const genVariants = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setVariants([
        '变体 A：仅摄像头告警，无传感器联动，适合预算较低场景',
        '变体 B：摄像头 + 门窗 + 人体三重联动，高灵敏，适合空置房',
        '变体 C：加入警报器，告警时同步鸣响，适合安防要求高的场景',
      ]);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-8 right-8 w-[440px] z-50 rounded-2xl border border-border bg-bg-elevated shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">AI 对话</div>
                <div className="text-2xs text-text-muted truncate">{context}</div>
              </div>
              <div className="flex items-center gap-1">
                {result && (
                  <button
                    onClick={genVariants}
                    disabled={generating}
                    className="text-2xs px-2.5 py-1 rounded-md border border-accent/40 bg-accent/10 text-accent-glow hover:bg-accent/15 transition inline-flex items-center gap-1"
                  >
                    <GitBranch size={10} /> 生成变体
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/5 text-text-muted">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {!result && !generating && (
                <div className="text-center text-2xs text-text-subtle py-4">
                  <p>用自然语言描述你想要的服务，AI 自动生成配置</p>
                  <p className="mt-1">或「生成变体」→ 画布上生成多个方案供对比</p>
                </div>
              )}
              {generating && (
                <div className="flex items-center gap-2 text-2xs text-text-muted py-2">
                  <RefreshCw size={12} className="animate-spin text-accent-glow" />
                  正在生成中...
                </div>
              )}
              {result && !generating && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-2xs leading-relaxed">
                  <div className="text-accent-glow font-medium mb-1">AI 已生成</div>
                  <p className="text-text-muted">{result}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1.5 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-2xs">应用到服务</button>
                    <button className="px-3 py-1.5 rounded-md border border-border text-text-muted text-2xs">不用</button>
                  </div>
                </div>
              )}
              {variants.length > 0 && (
                <div className="space-y-2">
                  <div className="text-2xs text-text-subtle uppercase tracking-wider">生成变体</div>
                  {variants.map((v, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border hover:border-border-strong bg-bg-elevated/50 cursor-pointer group">
                      <div className="flex items-start gap-2">
                        <GitBranch size={11} className="text-accent-glow mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-2xs text-text-muted group-hover:text-text leading-relaxed">{v}</div>
                        <button className="text-2xs text-accent-glow opacity-0 group-hover:opacity-100 transition">应用</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-bg-elevated px-3 py-2 focus-within:border-border-strong transition">
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(); }}
                  placeholder="描述想要的服务... @引用设备 / 上传文档"
                  className="flex-1 bg-transparent outline-none resize-none text-xs text-text placeholder:text-text-subtle leading-relaxed"
                />
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button className="p-1 text-text-muted hover:text-text">
                    <Paperclip size={13} />
                  </button>
                  <button
                    onClick={submit}
                    disabled={!prompt.trim() || generating}
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center transition',
                      prompt.trim() && !generating
                        ? 'bg-gradient-to-br from-accent to-accent2 text-white'
                        : 'bg-white/5 text-text-subtle cursor-not-allowed'
                    )}
                  >
                    {generating ? <RefreshCw size={11} className="animate-spin" /> : <ArrowUp size={11} />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-text-subtle mt-1.5 px-1">⌘ + Enter 发送 · 每次约 30 A</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main page ────────────────────────

export default function ServiceStudio() {
  const router = useRouter();
  const [serviceType, setServiceType] = useState('security');
  const [serviceName, setServiceName] = useState('安防守护服务');
  const [tab, setTab] = useState<Tab>('devices');
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['cam', 'motion', 'door']);
  const [rules, setRules] = useState<ServiceRule[]>(DEFAULT_RULES);
  const [running, setRunning] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const activeType = SERVICE_TYPES.find(s => s.id === serviceType)!;

  const toggleDevice = (id: string) => {
    setSelectedDevices(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const addRule = () => {
    setRules(prev => [...prev, {
      id: `r${Date.now()}`,
      trigger: '新触发条件',
      action: '新动作',
      enabled: true,
    }]);
  };

  const addedDevices = DEVICE_CATALOG.filter(d => selectedDevices.includes(d.id));

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Header */}
      <header className="h-12 border-b border-border bg-bg/85 backdrop-blur-xl flex items-center px-4 gap-3 flex-shrink-0">
        <button onClick={() => router.back()} className="p-1 rounded text-text-muted hover:text-text hover:bg-white/5">
          <ArrowLeft size={16} />
        </button>

        {/* Service type selector */}
        <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-bg-elevated/50">
          {SERVICE_TYPES.map(s => (
            <button
              key={s.id}
              onClick={() => { setServiceType(s.id); setServiceName(s.label + '服务'); }}
              className={cn(
                'text-2xs px-2.5 py-1 rounded-md transition inline-flex items-center gap-1.5',
                serviceType === s.id ? 'bg-bg text-text shadow-sm' : 'text-text-muted hover:text-text'
              )}
            >
              <s.icon size={10} style={{ color: s.color }} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        <input
          value={serviceName}
          onChange={e => setServiceName(e.target.value)}
          className="text-sm font-medium bg-transparent outline-none border-b border-transparent hover:border-border focus:border-accent transition w-40"
        />

        {/* Tab bar */}
        <div className="flex items-center gap-0.5 ml-2 border border-border rounded-lg p-0.5 bg-bg-elevated/50">
          {([
            { id: 'devices', label: `选品 (${addedDevices.length})` },
            { id: 'rules', label: `规则 (${rules.filter(r => r.enabled).length})` },
            { id: 'card', label: '服务卡片' },
            { id: 'publish', label: '发布' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'text-2xs px-3 py-1 rounded-md transition',
                tab === t.id ? 'bg-bg text-text shadow-sm' : 'text-text-muted hover:text-text'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* AI entry */}
        <button
          onClick={() => setAiOpen(true)}
          className="text-2xs px-3 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent-glow hover:bg-accent/15 transition inline-flex items-center gap-1.5"
        >
          <Sparkles size={11} /> AI 对话
        </button>

        <button className="text-2xs px-2.5 py-1 rounded text-text-muted hover:text-text inline-flex items-center gap-1">
          <Save size={11} /> 保存草稿
        </button>
        <Link
          href="/pro/build/marketplace"
          className="text-2xs px-3 py-1 rounded-md bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1 font-medium"
        >
          <Send size={10} /> 发布
        </Link>
      </header>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="h-full"
          >
            {tab === 'devices' && (
              <DevicesTab
                catalog={DEVICE_CATALOG}
                selected={selectedDevices}
                onToggle={toggleDevice}
                serviceType={activeType}
                rules={rules}
              />
            )}
            {tab === 'rules' && (
              <RulesTab rules={rules} onToggle={toggleRule} onAdd={addRule} serviceType={activeType} />
            )}
            {tab === 'card' && (
              <CardTab
                serviceName={serviceName}
                serviceType={activeType}
                running={running}
                onToggle={() => setRunning(r => !r)}
                addedDevices={addedDevices}
              />
            )}
            {tab === 'publish' && <PublishTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI dialogue overlay */}
      <AIDialogue
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        context={`${serviceName} · ${tab === 'devices' ? '选品' : tab === 'rules' ? '规则配置' : tab === 'card' ? '服务卡片' : '发布'}`}
      />
    </div>
  );
}

// ─── Tab: 选品 ────────────────────────

function DevicesTab({
  catalog,
  selected,
  onToggle,
  serviceType,
  rules,
}: {
  catalog: typeof DEVICE_CATALOG;
  selected: string[];
  onToggle: (id: string) => void;
  serviceType: typeof SERVICE_TYPES[0];
  rules: ServiceRule[];
}) {
  return (
    <div className="h-full grid grid-cols-[1fr_320px] min-h-0">
      <div className="p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-5">
          <div>
            <h2 className="text-base font-semibold">选择服务关联设备</h2>
            <p className="mt-1 text-sm text-text-muted">
              选好的设备会出现在服务卡片上，并自动作为触发器/执行对象的候选。
            </p>
          </div>

          <div className="space-y-2">
            {catalog.map(d => {
              const isSelected = selected.includes(d.id);
              return (
                <div
                  key={d.id}
                  className={cn(
                    'p-4 rounded-xl border flex items-center gap-4 transition cursor-pointer',
                    isSelected ? 'border-border-strong bg-bg-elevated/50' : 'border-border hover:border-border-strong opacity-70 hover:opacity-100'
                  )}
                  onClick={() => onToggle(d.id)}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${d.color}18`, border: `1px solid ${d.color}40` }}
                  >
                    <d.icon size={18} style={{ color: d.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-2xs text-text-muted mt-0.5 capitalize">{d.category}</div>
                  </div>
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition',
                    isSelected ? 'border-accent bg-accent' : 'border-border'
                  )}>
                    {isSelected && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                </div>
              );
            })}
            <button className="w-full p-4 rounded-xl border border-dashed border-border hover:border-accent/40 text-sm text-text-muted hover:text-accent-glow inline-flex items-center justify-center gap-2 transition">
              <Plus size={14} /> 添加其他设备类型
            </button>
          </div>
        </div>
      </div>

      <div className="border-l border-border bg-bg-elevated/30 p-5 overflow-y-auto">
        <div className="text-2xs uppercase tracking-wider text-text-subtle mb-3">自动生成的规则（预览）</div>
        <div className="space-y-2">
          {rules.slice(0, 4).map((r, i) => (
            <div key={i} className="p-2.5 rounded-lg border border-border bg-bg-elevated/50 text-2xs">
              <div className="text-text-subtle">触发：{r.trigger}</div>
              <div className="text-text mt-0.5">→ {r.action}</div>
            </div>
          ))}
          {rules.length > 4 && (
            <div className="text-2xs text-text-muted text-center py-1">…共 {rules.length} 条规则</div>
          )}
        </div>

        <div className="mt-5 p-3 rounded-lg border border-border bg-bg-elevated/50 text-2xs text-text-muted leading-relaxed">
          <p className="text-text font-medium mb-1">
            <serviceType.icon size={11} style={{ color: serviceType.color }} className="inline mr-1" />
            {serviceType.label}
          </p>
          <p>{serviceType.desc}</p>
          <p className="mt-1.5 opacity-70">可在「规则」Tab 自由增删、调整每条逻辑。</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: 规则 ────────────────────────

function RulesTab({
  rules,
  onToggle,
  onAdd,
  serviceType,
}: {
  rules: ServiceRule[];
  onToggle: (id: string) => void;
  onAdd: () => void;
  serviceType: typeof SERVICE_TYPES[0];
}) {
  const lifecycle = rules.filter(r => r.trigger.includes('服务'));
  const others = rules.filter(r => !r.trigger.includes('服务'));

  return (
    <div className="h-full grid grid-cols-[1fr_280px] min-h-0">
      <div className="p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">自动化规则</h2>
              <p className="mt-1 text-sm text-text-muted">定义服务生命周期联动与告警触发逻辑</p>
            </div>
            <button onClick={onAdd} className="text-2xs px-3 py-1.5 rounded-md bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1.5">
              <Plus size={10} /> 添加规则
            </button>
          </div>

          {lifecycle.length > 0 && (
            <div>
              <div className="text-2xs uppercase tracking-wider text-text-subtle mb-2">服务生命周期</div>
              <div className="space-y-2">
                {lifecycle.map(r => <RuleRow key={r.id} rule={r} onToggle={onToggle} />)}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div>
              <div className="text-2xs uppercase tracking-wider text-text-subtle mb-2">告警 & 联动</div>
              <div className="space-y-2">
                {others.map(r => <RuleRow key={r.id} rule={r} onToggle={onToggle} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-l border-border bg-bg-elevated/30 p-5 space-y-4 overflow-y-auto">
        <div className="text-2xs uppercase tracking-wider text-text-subtle">规则摘要</div>
        <div className="grid grid-cols-2 gap-2 text-center text-2xs">
          <div className="p-3 rounded-lg bg-bg-elevated border border-border">
            <div className="num text-xl font-semibold text-success">{rules.filter(r => r.enabled).length}</div>
            <div className="text-text-muted mt-0.5">已启用</div>
          </div>
          <div className="p-3 rounded-lg bg-bg-elevated border border-border">
            <div className="num text-xl font-semibold">{rules.filter(r => !r.enabled).length}</div>
            <div className="text-text-muted mt-0.5">已禁用</div>
          </div>
        </div>
        <div className="p-3 rounded-lg border border-border text-2xs text-text-muted leading-relaxed space-y-1.5">
          <p>规则支持：</p>
          <p>· 传感器状态触发</p>
          <p>· 时间/计划触发</p>
          <p>· 设备状态变化</p>
          <p>· 手动调用</p>
          <p>· 其他服务联动</p>
        </div>
      </div>
    </div>
  );
}

function RuleRow({ rule, onToggle }: { rule: ServiceRule; onToggle: (id: string) => void }) {
  return (
    <div className={cn(
      'p-3.5 rounded-lg border flex items-start gap-3 transition',
      rule.enabled ? 'border-border bg-bg-elevated/50' : 'border-border/40 opacity-50'
    )}>
      <div className="flex-1 min-w-0">
        <div className="text-2xs text-text-muted">触发：<span className="text-text">{rule.trigger}</span></div>
        <div className="text-sm mt-0.5">→ {rule.action}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="text-text-muted hover:text-text"><Settings size={12} /></button>
        <button
          onClick={() => onToggle(rule.id)}
          className={cn('w-8 h-4 rounded-full relative transition', rule.enabled ? 'bg-accent' : 'bg-white/10')}
        >
          <div className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all', rule.enabled ? 'right-0.5' : 'left-0.5')} />
        </button>
      </div>
    </div>
  );
}

// ─── Tab: 服务卡片 ─────────────────────

function CardTab({
  serviceName,
  serviceType,
  running,
  onToggle,
  addedDevices,
}: {
  serviceName: string;
  serviceType: typeof SERVICE_TYPES[0];
  running: boolean;
  onToggle: () => void;
  addedDevices: typeof DEVICE_CATALOG;
}) {
  return (
    <div className="h-full grid grid-cols-[1fr_360px] min-h-0">
      <div className="p-6 overflow-y-auto">
        <div className="max-w-lg space-y-5">
          <div>
            <h2 className="text-base font-semibold">服务卡片预览</h2>
            <p className="mt-1 text-sm text-text-muted">用户在 Aqara Life App 中看到的服务卡片，一个开关控制整个服务。</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-2xs text-text-muted mb-1">服务名称</div>
              <input defaultValue={serviceName} className="w-full px-3 py-2 text-sm rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none" />
            </div>
            <div>
              <div className="text-2xs text-text-muted mb-1">描述</div>
              <textarea defaultValue={`${serviceType.desc}，一键开启/停止`} className="w-full px-3 py-2 text-sm rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none resize-none h-20" />
            </div>
            <div>
              <div className="text-2xs text-text-muted mb-1">服务图标</div>
              <div className="flex gap-2">
                {['🛡️', '⚡', '❤️', '🔒', '🏠', '🌙'].map(e => (
                  <button key={e} className="w-10 h-10 text-xl rounded-lg border border-border hover:border-border-strong bg-bg-elevated flex items-center justify-center">
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-2xs text-text-muted mb-2">关联设备</div>
            <div className="flex flex-wrap gap-2">
              {addedDevices.map(d => (
                <div key={d.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-bg-elevated text-2xs">
                  <d.icon size={12} style={{ color: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border space-y-2.5">
            <div className="text-sm font-medium">发布设置</div>
            <div className="space-y-2 text-2xs">
              {[
                { label: '定价模式', value: '订阅 ¥29/月' },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between py-1">
                  <span className="text-text-muted">{f.label}</span>
                  <div className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-bg-elevated text-xs">
                    {f.value} <ChevronDown size={10} className="text-text-muted" />
                  </div>
                </div>
              ))}
              {[
                { label: '对外可见', on: true },
                { label: '允许扫码安装', on: true },
                { label: '发布到 Marketplace', on: false },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between py-1">
                  <span className="text-text-muted">{f.label}</span>
                  <SimpleToggle on={f.on} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phone preview */}
      <div className="border-l border-border bg-bg-elevated/30 flex flex-col items-center justify-center py-8 overflow-y-auto">
        <div className="text-2xs text-text-subtle mb-4 text-center">用户端预览</div>
        <div className="w-[280px] h-[580px] rounded-[36px] border-8 border-zinc-900 bg-zinc-950 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 rounded-b-2xl bg-zinc-900 z-10" />
          <div className="pt-3 px-5 flex items-center justify-between text-[10px] text-white/70">
            <span>21:45</span><span>● ● ●</span>
          </div>
          <div className="px-4 pt-4 space-y-3">
            <div className="text-[10px] text-zinc-400">我的服务</div>
            <div className={cn(
              'rounded-2xl p-4 transition',
              running
                ? `bg-gradient-to-br from-${serviceType.id === 'security' ? 'red' : serviceType.id === 'energy' ? 'amber' : serviceType.id === 'health' ? 'pink' : 'purple'}-700 to-${serviceType.id}-900`
                : 'bg-zinc-800'
            )}
              style={running ? { background: `linear-gradient(135deg, ${serviceType.color}cc, ${serviceType.color}44)` } : {}}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{serviceType.id === 'security' ? '🛡️' : serviceType.id === 'energy' ? '⚡' : serviceType.id === 'health' ? '❤️' : '🔒'}</span>
                  <div>
                    <div className="text-white text-sm font-semibold">{serviceName}</div>
                    <div className={cn('text-[10px] mt-0.5', running ? 'text-white/80' : 'text-zinc-400')}>
                      {running ? `运行中 · ${addedDevices.length} 设备在线` : '已停止 · 点击开启'}
                    </div>
                  </div>
                </div>
                <button onClick={onToggle} className={cn('w-10 h-5 rounded-full relative transition', running ? 'bg-white' : 'bg-zinc-600')}>
                  <div className={cn('absolute top-0.5 w-4 h-4 rounded-full transition-all', running ? 'right-0.5 bg-zinc-800' : 'left-0.5 bg-white')} />
                </button>
              </div>
              {running && addedDevices.length > 0 && (
                <div className="mt-3 flex gap-3 flex-wrap">
                  {addedDevices.slice(0, 3).map(d => (
                    <div key={d.id} className="text-center">
                      <d.icon size={14} style={{ color: d.color }} className="mx-auto mb-0.5" />
                      <div className="text-[9px] text-white/70">{d.name.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 text-2xs text-text-muted text-center">点击预览开关测试服务状态</div>
      </div>
    </div>
  );
}

// ─── Tab: 发布 ────────────────────────

function PublishTab() {
  return (
    <div className="h-full grid grid-cols-[1fr_300px] min-h-0">
      <div className="p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-5">
          <h2 className="text-base font-semibold">测试 & 发布</h2>
          <div className="space-y-2">
            {[
              { label: '服务开启 → 设备联动激活', pass: true },
              { label: '触发器响应延迟 < 500ms', pass: true },
              { label: '推送告警送达率', pass: true },
              { label: '服务停止 → 所有联动停止', pass: true },
              { label: '设备离线降级处理', pass: false },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                {t.pass ? <CheckCircle2 size={14} className="text-success flex-shrink-0" /> : <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />}
                <span className="text-sm flex-1">{t.label}</span>
                <span className={cn('text-2xs', t.pass ? 'text-success' : 'text-amber-400')}>{t.pass ? 'PASS' : '待处理'}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">部署方式</div>
            {[
              { icon: Zap, color: '#10b981', title: '部署到我的 Aqara Studio', desc: '自用，不公开', action: '立即部署', primary: true },
              { icon: Globe, color: '#06b6d4', title: '生成二维码分享', desc: '私有二维码，扫码安装，不经审核', action: '生成二维码', primary: false },
              { icon: Send, color: '#a855f7', title: '发布到 Marketplace', desc: '经审核后上架，开发者拿 70% 分成', action: '提交审核', primary: false },
            ].map(opt => (
              <div key={opt.title} className="p-4 rounded-xl border border-border flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${opt.color}18`, border: `1px solid ${opt.color}40` }}>
                  <opt.icon size={18} style={{ color: opt.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{opt.title}</div>
                  <div className="text-2xs text-text-muted mt-0.5">{opt.desc}</div>
                </div>
                <button className={cn('text-2xs px-3 py-1.5 rounded-md flex-shrink-0', opt.primary ? 'bg-gradient-to-br from-accent to-accent2 text-white' : 'border border-border text-text-muted hover:text-text')}>
                  {opt.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-l border-border bg-bg-elevated/30 p-5 space-y-4 overflow-y-auto">
        <div className="text-2xs uppercase tracking-wider text-text-subtle">收益预估 (¥29/月)</div>
        {[{ n: 10, m: 203 }, { n: 50, m: 1015 }, { n: 200, m: 4060 }].map(s => (
          <div key={s.n} className="p-3 rounded-lg border border-border bg-bg-elevated/50">
            <div className="text-2xs text-text-muted">{s.n} 位用户订阅</div>
            <div className="num font-semibold text-success text-lg mt-0.5">¥{s.m.toLocaleString()}<span className="text-xs text-text-muted">/月</span></div>
          </div>
        ))}
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-2xs text-text-muted leading-relaxed">
          平台抽成 30%，你得 70%。满 100 元自动结算。
        </div>
      </div>
    </div>
  );
}

function SimpleToggle({ on }: { on: boolean }) {
  const [enabled, setEnabled] = useState(on);
  return (
    <button onClick={() => setEnabled(e => !e)} className={cn('w-8 h-4 rounded-full relative transition', enabled ? 'bg-accent' : 'bg-white/10')}>
      <div className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all', enabled ? 'right-0.5' : 'left-0.5')} />
    </button>
  );
}
