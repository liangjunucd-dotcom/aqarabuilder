'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, AtSign, Sparkles, Zap, Wand2,
  ChevronDown, ChevronRight, Check, CircleDot,
  RefreshCw, AlertTriangle, ShieldCheck, Eye, GitBranch,
  Crown, Clock, Plus, Minus, Edit2, ArrowRight, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  COPILOT_SESSION, PENDING_DEPLOY,
  type ChatMessage, type PlanStep, type ToolCall, type StepStatus,
} from '@/lib/mock/copilot-session';

export function CopilotChat({ onApproveDeploy }: { onApproveDeploy?: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setTimeout(() => { setBusy(false); setPrompt(''); }, 800);
  };

  return (
    <aside data-tour="chat-plan" className="w-[400px] flex-shrink-0 border-l border-border flex flex-col min-h-0 bg-bg-elevated/30">
      {/* Header */}
      <div className="h-10 border-b border-border flex items-center px-3 gap-2 flex-shrink-0">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
          <Sparkles size={11} className="text-white" />
        </div>
        <span className="text-xs font-semibold">Copilot</span>
        <span className="text-2xs text-text-muted">· 张奶奶家适老化</span>
        <div className="flex-1" />
        <span className="text-2xs num text-text-muted">{COPILOT_SESSION.length} turns</span>
        <button className="p-1 rounded text-text-muted hover:text-text" title="新会话">
          <Plus size={12} />
        </button>
      </div>

      {/* Session timeline */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {COPILOT_SESSION.map(m => <Message key={m.id} m={m} />)}

        {/* Pending approval card — pinned at end */}
        <ApprovalCard onApproveDeploy={onApproveDeploy} />
      </div>

      {/* Composer */}
      <div className="border-t border-border p-3 flex-shrink-0 bg-bg/40">
        {/* Active agents chip row */}
        <div className="mb-2 flex items-center gap-1 flex-wrap">
          <span className="text-2xs text-text-subtle inline-flex items-center gap-1">
            <AtSign size={9} /> 当前 Agent:
          </span>
          {['Space', 'Persona', 'Provisioning', 'Scene', 'Linkage', 'Review'].map(a => (
            <span key={a} className="text-[10px] px-1.5 py-0 rounded bg-accent/10 text-accent-glow border border-accent/30 num">
              {a}
            </span>
          ))}
          <button className="text-[10px] px-1.5 py-0 rounded border border-dashed border-border text-text-muted hover:text-text">
            +
          </button>
        </div>

        <div className="rounded-lg border border-border-strong bg-bg-elevated overflow-hidden focus-within:border-accent/50 transition">
          <textarea
            rows={2}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="继续对话 · @ 切 Agent · / 调命令"
            className="w-full px-3 py-2 bg-transparent outline-none resize-none text-xs leading-relaxed placeholder:text-text-subtle"
          />
          <div className="flex items-center gap-1 px-2 py-1.5 border-t border-border bg-bg/40">
            <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5" title="附件">
              <Paperclip size={11} />
            </button>
            <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5" title="增强">
              <Wand2 size={11} />
            </button>
            <button className="text-2xs px-2 py-1 rounded text-text-muted hover:text-text inline-flex items-center gap-1 border border-border hover:border-border-strong">
              <Crown size={9} className="text-amber-400" /> Architect · 5x
              <ChevronDown size={9} />
            </button>
            <div className="flex-1" />
            <span className="text-2xs text-text-subtle inline-flex items-center gap-0.5">
              <Zap size={9} className="text-warning" /> ~12A
            </span>
            <button
              onClick={submit}
              disabled={!prompt.trim() || busy}
              className={cn(
                'p-1.5 rounded transition flex items-center justify-center',
                prompt.trim() && !busy
                  ? 'bg-gradient-to-br from-accent to-accent2 text-white'
                  : 'bg-white/5 text-text-subtle cursor-not-allowed'
              )}
            >
              {busy ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
            </button>
          </div>
        </div>

        {/* Quick prompts */}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {['/ 检查冲突', '/ 生成手册', '/ 模拟夜间', '/ 客户演示'].map(p => (
            <button key={p} className="text-2xs px-2 py-0.5 rounded text-text-muted hover:text-text bg-white/[0.03] hover:bg-white/[0.06]">
              {p}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Message ───────────────────────────────────────

function Message({ m }: { m: ChatMessage }) {
  if (m.role === 'user') {
    return (
      <div className="flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">
          J
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-2xs font-medium">Jun</span>
            <span className="text-[10px] text-text-subtle">{m.timestamp}</span>
          </div>
          <div className="mt-0.5 text-xs leading-relaxed">{m.text}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 rounded bg-gradient-to-br from-accent/60 to-accent2/60 flex items-center justify-center flex-shrink-0">
        <Sparkles size={10} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-2xs font-medium text-accent-glow">Copilot</span>
          <span className="text-[10px] text-text-subtle">{m.timestamp}</span>
        </div>
        <div className="mt-0.5 text-xs leading-relaxed text-text-muted">{m.text}</div>
        {m.plan && <Plan steps={m.plan} />}
      </div>
    </div>
  );
}

// ─── Plan ───────────────────────────────────────

function Plan({ steps }: { steps: PlanStep[] }) {
  return (
    <div className="mt-2.5 card p-2.5 space-y-2 border-accent/20">
      <div className="flex items-center gap-1.5 text-2xs text-text-muted uppercase tracking-wider">
        <Sparkles size={9} className="text-accent-glow" />
        <span>Plan</span>
        <span className="text-text-subtle num">{steps.filter(s => s.status === 'success').length}/{steps.length}</span>
        <div className="flex-1" />
        <button className="text-2xs text-text-muted hover:text-text">展开全部</button>
      </div>
      {steps.map(s => <Step key={s.id} step={s} />)}
    </div>
  );
}

function Step({ step }: { step: PlanStep }) {
  const [open, setOpen] = useState(step.status === 'running' || step.status === 'waiting-approval');
  return (
    <div className={cn('rounded-md transition', step.status === 'waiting-approval' && 'ring-1 ring-warning/30 bg-warning/[0.04]')}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-white/[0.03] rounded-md transition"
      >
        <StatusIcon status={step.status} />
        <span className="text-2xs num text-text-subtle w-3 flex-shrink-0">{step.index}.</span>
        <span className="text-xs flex-1 truncate">{step.title}</span>
        {open ? <ChevronDown size={10} className="text-text-subtle flex-shrink-0" /> : <ChevronRight size={10} className="text-text-subtle flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-7 pr-2 pb-2 space-y-1.5">
              {step.toolCalls.map((t, i) => <ToolCallRow key={i} t={t} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolCallRow({ t }: { t: ToolCall }) {
  return (
    <div className="text-2xs">
      <div className="flex items-center gap-1.5">
        <StatusIcon status={t.status} size={9} />
        <span className="text-text font-medium">{t.agentName}</span>
        <span className="text-text-subtle">·</span>
        <span className="text-text-muted flex-1 truncate">{t.summary}</span>
        {t.durationMs && <span className="text-text-subtle num">{(t.durationMs / 1000).toFixed(1)}s</span>}
      </div>
      {t.detail && (
        <ul className="mt-1 ml-4 space-y-0.5">
          {t.detail.map((d, i) => (
            <li key={i} className="text-text-subtle leading-relaxed before:content-['·'] before:mr-1 before:text-text-subtle">
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusIcon({ status, size = 11 }: { status: StepStatus; size?: number }) {
  if (status === 'success') return <Check size={size} className="text-success" />;
  if (status === 'running') return <RefreshCw size={size} className="text-accent-glow animate-spin" />;
  if (status === 'fail')    return <AlertTriangle size={size} className="text-rose-500" />;
  if (status === 'waiting-approval') return <CircleDot size={size} className="text-warning" />;
  return <CircleDot size={size} className="text-text-subtle" />;
}

// ─── Approval Card ───────────────────────────────────────

function ApprovalCard({ onApproveDeploy }: { onApproveDeploy?: () => void }) {
  return (
    <motion.div
      initial={{ y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card border-warning/40 bg-warning/[0.04] overflow-hidden"
    >
      <div className="px-3 py-2.5 border-b border-warning/30 flex items-center gap-2 bg-warning/[0.05]">
        <ShieldCheck size={13} className="text-warning" />
        <span className="text-xs font-medium">需要确认 · 物理部署</span>
        <div className="flex-1" />
        <span className="text-2xs text-text-muted inline-flex items-center gap-1">
          <Clock size={9} /> {PENDING_DEPLOY.estimatedDuration}
        </span>
      </div>

      <div className="p-3 space-y-2.5">
        <div>
          <div className="text-2xs text-text-muted">目标 Studio</div>
          <div className="text-xs font-medium text-accent-glow">{PENDING_DEPLOY.targetLabel}</div>
        </div>

        {/* Compact diff */}
        <div className="space-y-1">
          {PENDING_DEPLOY.changes.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-2xs">
              {c.kind === 'add' && <Plus size={10} className="text-success flex-shrink-0" />}
              {c.kind === 'modify' && <Edit2 size={10} className="text-warning flex-shrink-0" />}
              {c.kind === 'remove' && <Minus size={10} className="text-rose-500 flex-shrink-0" />}
              <span className="num font-medium w-6 text-text">{c.count}</span>
              <span className="text-text-muted">{c.target}</span>
            </div>
          ))}
        </div>

        {/* Review flags */}
        <div className="space-y-1 pt-1 border-t border-warning/20">
          {PENDING_DEPLOY.reviewFlags.map((f, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px] text-text-muted leading-relaxed">
              <Info size={9} className="text-accent-glow flex-shrink-0 mt-0.5" />
              <span>{f.msg}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={onApproveDeploy}
            className="flex-1 px-2.5 py-1.5 rounded bg-gradient-to-br from-accent to-accent2 text-white text-2xs font-medium inline-flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-accent/30 transition"
          >
            <Check size={10} /> 审批并部署
          </button>
          <button className="px-2.5 py-1.5 rounded border border-border hover:border-border-strong text-2xs text-text-muted inline-flex items-center gap-1.5">
            <GitBranch size={10} /> 查看 Diff
          </button>
          <button className="px-2 py-1.5 rounded border border-border hover:border-border-strong text-2xs text-text-muted">
            稍后
          </button>
        </div>

        <div className="pt-1.5 border-t border-warning/20 text-[10px] text-text-subtle inline-flex items-center gap-1">
          <RefreshCw size={9} />
          {PENDING_DEPLOY.rollbackWindow} · Snapshot 已就绪
        </div>
      </div>
    </motion.div>
  );
}
