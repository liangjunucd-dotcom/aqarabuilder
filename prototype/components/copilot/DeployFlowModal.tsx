'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, CircleDot, Loader2, AlertTriangle, Rocket, ShieldCheck,
  GitBranch, Activity, RefreshCw, ArrowRight, Camera, Wifi, Zap,
  Pause, Play, ChevronRight, ChevronDown, Clock, Cpu, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PENDING_DEPLOY } from '@/lib/mock/copilot-session';

type PhaseId = 'precheck' | 'snapshot' | 'devices' | 'rules' | 'verify' | 'success';
type PhaseStatus = 'pending' | 'running' | 'success' | 'paused' | 'fail';

interface Phase {
  id: PhaseId;
  title: string;
  desc: string;
  icon: any;
  color: string;
  durationMs: number; // 模拟耗时
  total?: number;     // 进度总数(如 13 设备)
  unit?: string;
}

const PHASES: Phase[] = [
  { id: 'precheck', title: '审阅 · 安全 / 隐私 / 合规', desc: 'Review Agent + Linkage Agent · 0 冲突 / 0 风险', icon: ShieldCheck, color: '#0ea5e9', durationMs: 3500 },
  { id: 'snapshot', title: '快照当前 Studio',           desc: '记录现状以便 72h 内回滚',                       icon: Camera,      color: '#06b6d4', durationMs: 2200 },
  { id: 'devices',  title: '配网 · 13 台新设备',         desc: 'Provisioning Agent · 按房间依次入网',          icon: Wifi,        color: '#10b981', durationMs: 8000, total: 13, unit: '设备' },
  { id: 'rules',    title: '下发 · 9 条自动化',          desc: 'Scene + Linkage Agent · 写规则到 Studio',      icon: Zap,         color: '#f59e0b', durationMs: 4500, total: 9, unit: '规则' },
  { id: 'verify',   title: '部署后验证',                 desc: '所有设备在线 + 规则可触发',                    icon: Activity,    color: '#a855f7', durationMs: 3000 },
  { id: 'success',  title: '部署完成',                  desc: '72h 内可一键回滚',                              icon: Check,       color: '#22c55e', durationMs: 0 },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DeployFlowModal({ open, onClose }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseStatus, setPhaseStatus] = useState<PhaseStatus>('pending');
  const [progress, setProgress] = useState(0); // 0..total for current phase
  const [logExpanded, setLogExpanded] = useState(false);
  const [logs, setLogs] = useState<{ t: string; msg: string; level: 'info' | 'success' | 'warn' }[]>([]);
  const [paused, setPaused] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const phase = PHASES[phaseIdx];

  // 启动 / 暂停时,推进
  useEffect(() => {
    if (!open) return;
    if (paused) return;
    if (phaseStatus === 'success') return;

    // 第一次进入或恢复 — 启动当前 phase
    if (phaseStatus === 'pending' && phaseIdx < PHASES.length) {
      setPhaseStatus('running');
      pushLog('info', `开始 · ${phase.title}`);

      // 总耗时按 phase.durationMs,进度按 total 推进
      const total = phase.total ?? 1;
      const stepMs = phase.durationMs / total;

      for (let i = 1; i <= total; i++) {
        const t = setTimeout(() => {
          setProgress(i);
          if (phase.unit) pushLog('info', `${phase.title.split(' · ')[0]} · ${i}/${total} ${phase.unit}`);
        }, stepMs * i);
        timersRef.current.push(t);
      }

      // phase 完成
      const t = setTimeout(() => {
        setPhaseStatus('success');
        pushLog('success', `完成 · ${phase.title}`);
        // 自动进入下一 phase
        setTimeout(() => {
          if (phaseIdx + 1 < PHASES.length) {
            setPhaseIdx(i => i + 1);
            setProgress(0);
            setPhaseStatus('pending');
          }
        }, 600);
      }, phase.durationMs);
      timersRef.current.push(t);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phaseIdx, paused, phaseStatus]);

  // open 状态切换时重置
  useEffect(() => {
    if (open) {
      setPhaseIdx(0);
      setPhaseStatus('pending');
      setProgress(0);
      setLogs([]);
      setPaused(false);
    } else {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    }
  }, [open]);

  const pushLog = (level: 'info' | 'success' | 'warn', msg: string) => {
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs(l => [...l, { t, msg, level }]);
  };

  const isDone = phaseIdx === PHASES.length - 1 && phaseStatus === 'success';

  // pause 时清掉计时器,并把当前 phase 标 paused
  const togglePause = () => {
    if (isDone) return;
    if (paused) {
      // resume — 重启当前 phase
      setPaused(false);
      setPhaseStatus('pending');
      setProgress(0);
    } else {
      setPaused(true);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhaseStatus('paused');
      pushLog('warn', `已暂停 · ${phase.title}`);
    }
  };

  const abort = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    pushLog('warn', '已取消 · 自动回滚至快照');
    setTimeout(onClose, 600);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={isDone ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="card bg-bg-elevated w-[min(720px,100%)] max-h-[88vh] flex flex-col pointer-events-auto overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-5 py-3 border-b border-border flex items-center gap-3 flex-shrink-0">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  isDone ? 'bg-success/15' : 'bg-accent/15'
                )}>
                  {isDone
                    ? <Check size={16} className="text-success" />
                    : <Rocket size={16} className="text-accent-glow" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">
                    {isDone ? '部署完成 ✓' : '部署中 · 物理操作'}
                  </div>
                  <div className="text-2xs text-text-muted mt-0.5 truncate">
                    目标:{PENDING_DEPLOY.targetLabel}
                  </div>
                </div>
                {!isDone && (
                  <div className="hidden sm:flex items-center gap-1.5 text-2xs text-text-muted">
                    <Clock size={10} />
                    <span className="num">{PENDING_DEPLOY.estimatedDuration}</span>
                  </div>
                )}
                <button
                  onClick={isDone ? onClose : abort}
                  className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5"
                  title={isDone ? '关闭' : '取消并回滚'}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body — phase timeline */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="px-5 py-4 space-y-1.5">
                  {PHASES.map((p, i) => {
                    const status: PhaseStatus =
                      i < phaseIdx ? 'success' :
                      i === phaseIdx ? (phaseStatus === 'pending' ? 'running' : phaseStatus) :
                      'pending';
                    return (
                      <PhaseRow
                        key={p.id}
                        phase={p}
                        status={status}
                        isCurrent={i === phaseIdx}
                        progress={i === phaseIdx ? progress : (i < phaseIdx ? (p.total ?? 1) : 0)}
                      />
                    );
                  })}
                </div>

                {/* Log */}
                <div className="border-t border-border bg-bg/30">
                  <button
                    onClick={() => setLogExpanded(o => !o)}
                    className="w-full px-5 py-2.5 flex items-center gap-2 text-2xs text-text-muted hover:text-text"
                  >
                    <Activity size={10} />
                    <span>执行日志</span>
                    <span className="num text-text-subtle">{logs.length}</span>
                    <div className="flex-1" />
                    {logExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  </button>
                  <AnimatePresence>
                    {logExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-3 font-mono text-2xs space-y-1 max-h-48 overflow-y-auto">
                          {logs.map((l, i) => (
                            <div key={i} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-text-subtle num">{l.t}</span>
                              <span className={cn(
                                'flex-shrink-0',
                                l.level === 'success' && 'text-success',
                                l.level === 'info' && 'text-accent-glow',
                                l.level === 'warn' && 'text-warning'
                              )}>
                                {l.level === 'success' ? '✓' : l.level === 'warn' ? '⚠' : '·'}
                              </span>
                              <span className="text-text-muted">{l.msg}</span>
                            </div>
                          ))}
                          {logs.length === 0 && (
                            <div className="text-text-subtle py-2 text-center">等待操作启动...</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border flex items-center gap-2 flex-shrink-0 bg-bg/20">
                {isDone ? (
                  <>
                    <div className="flex items-center gap-2 text-2xs text-success">
                      <Sparkles size={11} />
                      <span>所有变更已生效 · Snapshot 已保留</span>
                    </div>
                    <div className="flex-1" />
                    <button className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-border-strong inline-flex items-center gap-1.5">
                      <RefreshCw size={10} /> 72h 回滚
                    </button>
                    <button className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-border-strong inline-flex items-center gap-1.5">
                      <GitBranch size={10} /> 保存为 Solution
                    </button>
                    <button
                      onClick={onClose}
                      className="text-2xs px-3 py-1.5 rounded bg-gradient-to-br from-accent to-accent2 text-white font-medium inline-flex items-center gap-1.5"
                    >
                      返回 Copilot <ArrowRight size={10} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-2xs text-text-muted">
                      阶段 <span className="num text-text">{phaseIdx + 1}</span> / <span className="num">{PHASES.length}</span>
                      <span className="mx-1.5 text-text-subtle">·</span>
                      {phase.total ? `${progress}/${phase.total} ${phase.unit}` : phaseStatus === 'paused' ? '已暂停' : '进行中'}
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={togglePause}
                      className="text-2xs px-2.5 py-1.5 rounded border border-border hover:border-border-strong inline-flex items-center gap-1.5"
                    >
                      {paused
                        ? <><Play size={10} /> 继续</>
                        : <><Pause size={10} /> 暂停</>
                      }
                    </button>
                    <button
                      onClick={abort}
                      className="text-2xs px-2.5 py-1.5 rounded border border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 inline-flex items-center gap-1.5"
                    >
                      <X size={10} /> 中止 + 回滚
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Phase row ───────────────────────────────────────

function PhaseRow({ phase, status, isCurrent, progress }: {
  phase: Phase; status: PhaseStatus; isCurrent: boolean; progress: number;
}) {
  const total = phase.total ?? 1;
  const pct = Math.min(100, Math.round((progress / total) * 100));

  return (
    <div className={cn(
      'rounded-md transition px-3 py-2.5 flex items-start gap-3',
      isCurrent && status === 'running' && 'bg-accent/[0.06] ring-1 ring-accent/20',
      isCurrent && status === 'paused' && 'bg-warning/[0.06] ring-1 ring-warning/30',
      status === 'success' && !isCurrent && 'opacity-70',
      status === 'pending' && 'opacity-50'
    )}>
      {/* Status icon */}
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
        style={{
          background: status === 'success' ? '#10b98115' : status === 'running' ? `${phase.color}15` : status === 'paused' ? '#f59e0b15' : 'rgba(255,255,255,0.04)',
          color: status === 'success' ? '#10b981' : status === 'running' ? phase.color : status === 'paused' ? '#f59e0b' : 'rgba(255,255,255,0.4)',
        }}
      >
        {status === 'success' ? <Check size={14} /> :
         status === 'running' ? <Loader2 size={14} className="animate-spin" /> :
         status === 'paused'  ? <Pause size={14} /> :
         status === 'fail'    ? <AlertTriangle size={14} /> :
                                <phase.icon size={14} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{phase.title}</span>
          {isCurrent && status === 'running' && phase.total && (
            <span className="text-2xs num text-accent-glow">{progress}/{phase.total}</span>
          )}
          {status === 'success' && phase.total && (
            <span className="text-2xs num text-success">{phase.total}/{phase.total}</span>
          )}
        </div>
        <div className="text-2xs text-text-muted mt-0.5">{phase.desc}</div>

        {/* Progress bar — show only for current running with total */}
        {isCurrent && (status === 'running' || status === 'paused') && (
          <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: phase.color }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
