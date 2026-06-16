'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  ChevronDown,
  Cpu,
  Save,
  Settings,
  Command,
  Zap,
  Activity,
  Crown,
  Check,
  CircleDot,
  CirclePause,
  CircleSlash,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  STUDIO_CONNECTIONS,
  STUDIO_KIND_META,
  STUDIO_STATUS_META,
  type StudioConnection,
} from '@/lib/mock/solutions';

interface Props {
  projectName: string;
  activeStudioId: string;
  onStudioChange: (id: string) => void;
  onOpenCommandPalette?: () => void;
}

const STATUS_ICON = {
  connected:  CircleDot,
  connecting: CirclePause,
  offline:    CircleSlash,
  readonly:   Eye,
} as const;

export function CopilotHeader({ projectName, activeStudioId, onStudioChange, onOpenCommandPalette }: Props) {
  const router = useRouter();
  const [studioOpen, setStudioOpen] = useState(false);
  const active = STUDIO_CONNECTIONS.find(s => s.id === activeStudioId) ?? STUDIO_CONNECTIONS[0];

  return (
    <header className="h-12 border-b border-border bg-bg/95 backdrop-blur-xl flex items-center px-3 gap-2 flex-shrink-0 relative z-50">
      {/* Back */}
      <button
        onClick={() => router.push('/pro')}
        className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5"
      >
        <ArrowLeft size={15} />
      </button>

      {/* Brand + breadcrumb */}
      <Link href="/pro" className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded hover:bg-white/5 transition">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
          <Sparkles size={11} className="text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Builder Copilot</span>
        <span className="text-2xs px-1.5 py-0.5 rounded bg-accent/15 text-accent-glow border border-accent/30 font-medium tracking-wider uppercase">
          Studio
        </span>
      </Link>
      <ChevronDown size={11} className="text-text-subtle -rotate-90" />
      <span className="text-sm text-text-muted truncate max-w-[180px]">{projectName}</span>

      <div className="flex-1" />

      {/* Studio switcher */}
      <div className="relative" data-tour="studio-switcher">
        <button
          onClick={() => setStudioOpen(o => !o)}
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-bg-elevated/60 hover:border-border-strong text-xs transition"
        >
          <StatusDot status={active.status} />
          <Cpu size={11} className="text-text-muted" />
          <span className="font-medium truncate max-w-[200px]">{active.label}</span>
          <span
            className="text-[10px] px-1 py-0 rounded uppercase tracking-wider font-bold"
            style={{ background: `${STUDIO_KIND_META[active.kind].color}25`, color: STUDIO_KIND_META[active.kind].color }}
          >
            {STUDIO_KIND_META[active.kind].label}
          </span>
          <ChevronDown size={10} className={cn('text-text-subtle transition', studioOpen && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {studioOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setStudioOpen(false)} />
              <motion.div
                initial={{ y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full right-0 mt-1.5 w-[360px] card p-1 z-50 shadow-2xl"
              >
                <div className="px-2.5 py-1.5 text-2xs uppercase tracking-wider text-text-subtle border-b border-border">
                  连接的 Studio · {STUDIO_CONNECTIONS.length}
                </div>
                {STUDIO_CONNECTIONS.map(s => (
                  <StudioRow
                    key={s.id}
                    s={s}
                    active={s.id === active.id}
                    onPick={() => { onStudioChange(s.id); setStudioOpen(false); }}
                  />
                ))}
                <div className="border-t border-border mt-1 pt-1.5 px-2.5 py-1.5">
                  <button className="text-2xs text-accent-glow hover:underline inline-flex items-center gap-1">
                    + 连接新的 Studio (MCP)
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded text-2xs text-text-muted">
        <Zap size={10} className="text-warning" />
        <span className="num">2,840</span><span>A</span>
      </div>
      <div className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded text-2xs text-success">
        <Activity size={10} />
        <span className="num">17/19</span>
      </div>

      {/* Tier badge */}
      <span className="hidden md:inline-flex items-center gap-1 text-2xs px-2 py-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-400 font-medium">
        <Crown size={10} /> L4 Certified
      </span>

      {/* ⌘K */}
      <button
        onClick={onOpenCommandPalette}
        data-tour="cmd-k"
        className="inline-flex items-center gap-1 text-2xs px-2 py-1 rounded text-text-subtle hover:text-text border border-border hover:border-border-strong"
        title="命令面板"
      >
        <Command size={9} />
        <span className="num">K</span>
      </button>

      <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5" title="保存">
        <Save size={14} />
      </button>
      <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5" title="设置">
        <Settings size={14} />
      </button>
    </header>
  );
}

function StatusDot({ status }: { status: StudioConnection['status'] }) {
  const Icon = STATUS_ICON[status];
  const color = STUDIO_STATUS_META[status].color;
  return <Icon size={10} style={{ color }} className={status === 'connecting' ? 'animate-pulse' : ''} fill={status === 'connected' ? color : 'none'} />;
}

function StudioRow({ s, active, onPick }: { s: StudioConnection; active: boolean; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className={cn(
        'w-full text-left px-2.5 py-2 rounded flex items-start gap-2.5 transition',
        active ? 'bg-accent/10 ring-1 ring-accent/30' : 'hover:bg-white/5'
      )}
    >
      <StatusDot status={s.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium truncate">{s.label}</span>
          {active && <Check size={11} className="text-accent flex-shrink-0" />}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-2xs text-text-muted">
          <span
            className="text-[10px] px-1 py-0 rounded uppercase tracking-wider font-bold"
            style={{ background: `${STUDIO_KIND_META[s.kind].color}20`, color: STUDIO_KIND_META[s.kind].color }}
          >
            {STUDIO_KIND_META[s.kind].label}
          </span>
          <span className="num">{s.online}/{s.devices}</span>
          <span>设备</span>
          {s.rtt !== undefined && <span className="num">· {s.rtt}ms</span>}
        </div>
      </div>
    </button>
  );
}
