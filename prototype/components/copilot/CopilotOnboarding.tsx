'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowLeft, ArrowRight, X, Check, Command,
  Cpu, Bot, Network, MessageSquare, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LS_KEY = 'copilot-tour-completed-v1';

type StepPlace = 'center' | 'bottom' | 'right' | 'left';

interface Step {
  id: string;
  /** querySelector — undefined 时为居中(welcome) */
  target?: string;
  icon: any;
  title: string;
  body: string;
  hint?: string;
  place: StepPlace;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: '欢迎进入 Design Platform',
    body: 'Aqara Design Platform · 你的 18 个 AI Agent 在这里协作设计空间。下面用 30 秒带你走一圈。',
    hint: '随时按 ESC 跳过 · 之后可在 Settings 重开',
    place: 'center',
  },
  {
    id: 'studio',
    target: '[data-tour="studio-switcher"]',
    icon: Cpu,
    title: '①  目标 Studio · MCP 切换',
    body: '通过 MCP 连接真实客户的 Aqara Studio,或用 Sandbox 沙箱设计。同时可挂多个,客户切换不离开创作上下文。',
    place: 'bottom',
  },
  {
    id: 'agents',
    target: '[data-tour="left-rail"]',
    icon: Bot,
    title: '②  Agents · 你的 AI 工作队',
    body: '按角色域分组的 Agent — Discover / Provision / Automate / Optimize / Operate / Build。@ 任意 Agent 协作设计。',
    place: 'right',
  },
  {
    id: 'workspace',
    target: '[data-tour="workspace"]',
    icon: Network,
    title: '③  Space · 空间的"代码"',
    body: '多视图 Space — Topology 图谱 / 户型 / 设备清单 / 自动化规则 / Diff 差量 / 实时事件流。',
    place: 'bottom',
  },
  {
    id: 'plan',
    target: '[data-tour="chat-plan"]',
    icon: ShieldCheck,
    title: '④  Plan & Approval · 安全网',
    body: 'AI 出方案 + 多步 Plan,你审批后才执行。物理部署需双重确认,72h 内可一键回滚。',
    place: 'left',
  },
  {
    id: 'cmd',
    target: '[data-tour="cmd-k"]',
    icon: Command,
    title: '⑤  ⌘K · 召唤一切',
    body: '任何时候按 ⌘K(Mac)/ Ctrl+K(Win)调出命令面板。搜命令 / Agent / 方案 / Studio · 是高频创作者的速度密码。',
    place: 'bottom',
  },
];

export function CopilotOnboarding() {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // 启动:首次访问且没设置 LS_KEY
  useEffect(() => {
    try {
      const done = localStorage.getItem(LS_KEY);
      if (!done) {
        // 延迟一点让页面布局稳定
        const t = setTimeout(() => setActive(true), 600);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  // 计算当前 step target 的位置
  useEffect(() => {
    if (!active) return;
    const step = STEPS[stepIdx];
    if (!step.target) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector(step.target!);
      if (el) setRect(el.getBoundingClientRect());
      else setRect(null);
    };
    measure();
    // 监听 resize 与短延迟 retry(部分元素惰性挂载)
    window.addEventListener('resize', measure);
    const retry = setTimeout(measure, 100);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(retry);
    };
  }, [active, stepIdx]);

  // 键盘
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIdx]);

  const close = () => {
    setActive(false);
    try { localStorage.setItem(LS_KEY, '1'); } catch {}
  };

  const next = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(i => i + 1);
    else close();
  };
  const prev = () => stepIdx > 0 && setStepIdx(i => i - 1);

  if (!active) return null;
  const step = STEPS[stepIdx];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[150] pointer-events-none">
          {/* Spotlight backdrop (SVG mask cuts hole over target) */}
          <Spotlight rect={rect} />

          {/* Tooltip card */}
          <TooltipCard
            step={step}
            stepIdx={stepIdx}
            total={STEPS.length}
            rect={rect}
            isFirst={isFirst}
            isLast={isLast}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Spotlight backdrop ─────────────────────────────────────

function Spotlight({ rect }: { rect: DOMRect | null }) {
  const PADDING = 6;
  const RADIUS = 8;
  if (!rect) {
    // 全暗(welcome)
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-auto"
      />
    );
  }
  // SVG mask 抠洞
  const w = (rect.width + PADDING * 2);
  const h = (rect.height + PADDING * 2);
  const x = (rect.left - PADDING);
  const y = (rect.top - PADDING);
  return (
    <motion.svg
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 w-full h-full pointer-events-auto"
    >
      <defs>
        <mask id="tour-mask">
          <rect width="100%" height="100%" fill="white" />
          <motion.rect
            initial={false}
            animate={{ x, y, width: w, height: h }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            rx={RADIUS}
            fill="black"
          />
        </mask>
        <linearGradient id="tour-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#tour-mask)" />
      {/* glowing ring */}
      <motion.rect
        initial={false}
        animate={{ x, y, width: w, height: h }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        rx={RADIUS}
        fill="none"
        stroke="url(#tour-ring)"
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.6))' }}
      />
    </motion.svg>
  );
}

// ─── Tooltip ─────────────────────────────────────

const CARD_W = 340;
const CARD_GAP = 14;

function TooltipCard({
  step, stepIdx, total, rect, isFirst, isLast, onClose, onPrev, onNext,
}: {
  step: Step;
  stepIdx: number;
  total: number;
  rect: DOMRect | null;
  isFirst: boolean;
  isLast: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // 计算位置
  const pos = computePosition(rect, step.place);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="absolute pointer-events-auto"
      style={{
        top: pos.top,
        left: pos.left,
        width: CARD_W,
      }}
    >
      <div className="rounded-xl bg-bg-elevated border border-border-strong shadow-2xl overflow-hidden relative">
        {/* gradient stripe */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent via-accent-glow to-accent2" />

        {/* Header */}
        <div className="px-4 pt-3.5 pb-2 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
            <step.icon size={13} className="text-white" />
          </div>
          <div className="flex-1 text-2xs">
            <div className="text-text-subtle font-mono">
              <span className="num">{stepIdx + 1}</span> / <span className="num">{total}</span> · Tour
            </div>
            <div className="text-text font-semibold">{step.title}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text hover:bg-white/5"
            title="跳过引导 (ESC)"
          >
            <X size={12} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-3 text-2xs text-text-muted leading-relaxed">
          {step.body}
        </div>

        {step.hint && (
          <div className="mx-4 mb-3 px-2.5 py-1.5 rounded bg-accent/5 border border-accent/20 text-[10px] text-accent-glow inline-flex items-start gap-1.5">
            <Sparkles size={9} className="flex-shrink-0 mt-0.5" />
            <span>{step.hint}</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
              animate={{ width: `${((stepIdx + 1) / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3.5 flex items-center gap-1.5">
          <button
            onClick={onClose}
            className="text-2xs text-text-muted hover:text-text"
          >
            跳过
          </button>
          <div className="flex-1" />
          {!isFirst && (
            <button
              onClick={onPrev}
              className="text-2xs px-2 py-1 rounded border border-border hover:border-border-strong text-text-muted inline-flex items-center gap-1"
            >
              <ArrowLeft size={10} /> 上一步
            </button>
          )}
          <button
            onClick={onNext}
            className="text-2xs px-3 py-1.5 rounded bg-gradient-to-br from-accent to-accent2 text-white font-medium inline-flex items-center gap-1.5"
          >
            {isLast
              ? <><Check size={11} /> 开始使用</>
              : <>下一步 <ArrowRight size={10} /></>
            }
          </button>
        </div>

        {/* Arrow pointer (only if anchored to target) */}
        {pos.arrow && <ArrowPointer side={pos.arrow.side} offset={pos.arrow.offset} />}
      </div>
    </motion.div>
  );
}

function ArrowPointer({ side, offset }: { side: 'top' | 'bottom' | 'left' | 'right'; offset: number }) {
  const base = 'absolute w-3 h-3 bg-bg-elevated border-border-strong';
  if (side === 'top') {
    return <div className={cn(base, 'border-l border-t -top-[6px] rotate-45')} style={{ left: offset, transform: 'translateX(-50%) rotate(45deg)' }} />;
  }
  if (side === 'bottom') {
    return <div className={cn(base, 'border-r border-b -bottom-[6px]')} style={{ left: offset, transform: 'translateX(-50%) rotate(45deg)' }} />;
  }
  if (side === 'left') {
    return <div className={cn(base, 'border-l border-b -left-[6px]')} style={{ top: offset, transform: 'translateY(-50%) rotate(45deg)' }} />;
  }
  return <div className={cn(base, 'border-r border-t -right-[6px]')} style={{ top: offset, transform: 'translateY(-50%) rotate(45deg)' }} />;
}

// ─── Position math ─────────────────────────────────────

function computePosition(rect: DOMRect | null, place: StepPlace): {
  top: number;
  left: number;
  arrow?: { side: 'top' | 'bottom' | 'left' | 'right'; offset: number };
} {
  if (!rect || place === 'center') {
    if (typeof window === 'undefined') return { top: 200, left: 200 };
    return {
      top: window.innerHeight / 2 - 130,
      left: window.innerWidth / 2 - CARD_W / 2,
    };
  }
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
  const targetCx = rect.left + rect.width / 2;
  const targetCy = rect.top + rect.height / 2;

  if (place === 'bottom') {
    const top = Math.min(rect.bottom + CARD_GAP, vh - 240);
    const left = clamp(targetCx - CARD_W / 2, 16, vw - CARD_W - 16);
    return {
      top, left,
      arrow: { side: 'top', offset: targetCx - left },
    };
  }
  if (place === 'right') {
    const top = clamp(targetCy - 90, 60, vh - 260);
    const left = Math.min(rect.right + CARD_GAP, vw - CARD_W - 16);
    return {
      top, left,
      arrow: { side: 'left', offset: targetCy - top },
    };
  }
  if (place === 'left') {
    const top = clamp(targetCy - 90, 60, vh - 260);
    const left = Math.max(rect.left - CARD_W - CARD_GAP, 16);
    return {
      top, left,
      arrow: { side: 'right', offset: targetCy - top },
    };
  }
  // top fallback (not used)
  return { top: rect.top - 200, left: clamp(targetCx - CARD_W / 2, 16, vw - CARD_W - 16) };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
