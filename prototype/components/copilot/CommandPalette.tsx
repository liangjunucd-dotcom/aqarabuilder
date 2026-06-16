'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Command, ArrowRight, Sparkles,
  Bot, Package, Cpu, Hash, Send, Eye, GitBranch,
  Zap, ShieldCheck, FileText, RefreshCw, Globe, ChevronDown,
  Home, Users, Settings, Wifi, Layers, Clock, BarChart3,
  Stethoscope, Activity, Server, Code, Compass, Bolt,
  ShieldCheck as Shield, Map, Network, Crown, Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENTS } from '@/lib/mock/agents';
import { SOLUTIONS, STUDIO_CONNECTIONS, STUDIO_KIND_META } from '@/lib/mock/solutions';

// 命令面板的统一 Action 模型
type CmdGroup = 'slash' | 'agent' | 'solution' | 'studio' | 'navigate' | 'history';

interface CmdAction {
  id: string;
  group: CmdGroup;
  label: string;
  desc?: string;
  icon: any;
  iconColor?: string;
  shortcut?: string;
  keywords?: string[];
  // 执行
  run: (router: ReturnType<typeof useRouter>) => void;
  // 标识(给 UI 用 — 不影响功能)
  badge?: string;
}

const ICON_MAP: Record<string, any> = {
  home: Home, users: Users, cpu: Cpu, wifi: Wifi, layers: Layers,
  sparkles: Sparkles, zap: Zap, clock: Clock, bolt: Bolt,
  'bar-chart': BarChart3, stethoscope: Stethoscope, activity: Activity,
  server: Server, code: Code, compass: Compass, 'file-text': FileText,
  'shield-check': Shield, globe: Globe,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当 open 变化时复位
  useEffect(() => {
    if (open) {
      setQ('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 构建所有 actions
  const allActions: CmdAction[] = useMemo(() => {
    const actions: CmdAction[] = [];

    // ─── Slash 命令(高优先级,结构化任务)──────────
    actions.push(
      { id: 's-conflict', group: 'slash', label: '/ 检查冲突',         desc: 'Linkage Agent · 全方案规则冲突检查',  icon: ShieldCheck, iconColor: '#10b981', shortcut: '⌘ ⇧ C', run: () => { onClose(); } },
      { id: 's-handbook', group: 'slash', label: '/ 生成客户手册',     desc: 'Doc Agent · 自动写交付手册 + 操作说明', icon: FileText,    iconColor: '#06b6d4', run: () => { onClose(); } },
      { id: 's-night',    group: 'slash', label: '/ 模拟夜间场景',    desc: 'Scene Agent · 0-6 点行为路径模拟',       icon: Sparkles,    iconColor: '#a855f7', run: () => { onClose(); } },
      { id: 's-demo',     group: 'slash', label: '/ 客户演示模式',    desc: '隐藏配置 · 全屏 Persona 体验',           icon: Eye,         iconColor: '#f59e0b', run: () => { onClose(); } },
      { id: 's-deploy',   group: 'slash', label: '/ 立即部署',         desc: '推送当前变更到目标 Studio',              icon: Rocket,      iconColor: '#22c55e', shortcut: '⌘ ⇧ D', run: () => { onClose(); } },
      { id: 's-rollback', group: 'slash', label: '/ 回滚到 Snapshot', desc: '撤回上一次部署 (72h 内)',                icon: RefreshCw,   iconColor: '#f43f5e', run: () => { onClose(); } },
      { id: 's-i18n',     group: 'slash', label: '/ 一键翻译',         desc: 'Translate Agent · 方案多语言化',         icon: Globe,       iconColor: '#831843', run: () => { onClose(); } },
    );

    // ─── Agents ──────────
    AGENTS.forEach(a => {
      actions.push({
        id: `a-${a.id}`,
        group: 'agent',
        label: `@${a.name}`,
        desc: a.desc,
        icon: ICON_MAP[a.iconKey] ?? Sparkles,
        iconColor: a.color,
        keywords: [a.name.toLowerCase(), a.id, a.group],
        badge: a.unlocksFor === 'free' ? undefined : a.unlocksFor.toUpperCase(),
        run: () => { onClose(); },
      });
    });

    // ─── Solutions ──────────
    SOLUTIONS.forEach(s => {
      actions.push({
        id: `sol-${s.id}`,
        group: 'solution',
        label: s.name,
        desc: `v${s.version} · ${s.applicableArea} · ${s.devices} 设备 · ${s.deployedTo} 部署`,
        icon: Package,
        iconColor: '#10b981',
        keywords: [s.name.toLowerCase(), s.category],
        run: r => { onClose(); r.push(`/pro/build/solutions/${s.id}`); },
      });
    });

    // ─── Studios ──────────
    STUDIO_CONNECTIONS.forEach(s => {
      actions.push({
        id: `st-${s.id}`,
        group: 'studio',
        label: s.label,
        desc: `${STUDIO_KIND_META[s.kind].label} · ${s.online}/${s.devices} 设备`,
        icon: Cpu,
        iconColor: STUDIO_KIND_META[s.kind].color,
        keywords: [s.label.toLowerCase(), s.customer?.toLowerCase() ?? ''],
        run: () => { onClose(); },
      });
    });

    // ─── 跳转 ──────────
    actions.push(
      { id: 'g-build',     group: 'navigate', label: '跳转 · Design Platform 入口', icon: Sparkles, iconColor: '#6366f1', run: r => { onClose(); r.push('/build?entry=pro&demo_as=pro&workflow=space'); } },
      { id: 'g-copilot',   group: 'navigate', label: '跳转 · Design Platform',     icon: Network,   iconColor: '#a855f7', shortcut: '⌘ ⇧ K', run: r => { onClose(); r.push('/build?entry=pro&demo_as=pro&workflow=space'); } },
      { id: 'g-solutions', group: 'navigate', label: '跳转 · Solution Library', icon: Package,  iconColor: '#10b981', run: r => { onClose(); r.push('/pro/build/solutions'); } },
      { id: 'g-customers', group: 'navigate', label: '跳转 · Customers',         icon: Users,    iconColor: '#06b6d4', run: r => { onClose(); r.push('/pro/customers'); } },
      { id: 'g-projects',  group: 'navigate', label: '跳转 · Projects',          icon: Map,      iconColor: '#f59e0b', run: r => { onClose(); r.push('/pro/projects'); } },
      { id: 'g-academy',   group: 'navigate', label: '跳转 · Academy',           icon: Crown,    iconColor: '#eab308', run: r => { onClose(); r.push('/pro/academy'); } },
    );

    // ─── 最近会话 ──────────
    actions.push(
      { id: 'h-1', group: 'history', label: '张奶奶家 · 适老化方案',      desc: '今天 14:32 · 等审批',         icon: Clock, iconColor: '#a855f7', run: r => { onClose(); r.push('/pro/build/copilot'); } },
      { id: 'h-2', group: 'history', label: '李先生家 · 客厅观影优化',    desc: '今天 11:08',                  icon: Clock, iconColor: '#a855f7', run: () => { onClose(); } },
      { id: 'h-3', group: 'history', label: '别墅二楼 · Persona 重构',    desc: '昨天 18:42',                  icon: Clock, iconColor: '#a855f7', run: () => { onClose(); } },
      { id: 'h-4', group: 'history', label: 'Fork Kim 适老化模板',         desc: '周一 09:15',                  icon: Clock, iconColor: '#a855f7', run: () => { onClose(); } },
    );

    return actions;
  }, [onClose]);

  // 模糊筛选
  const filtered = useMemo(() => {
    if (!q.trim()) {
      // 默认显示前 3 个 slash + 前 4 个 agents + 前 3 个 solutions + 跳转
      return allActions.filter(a =>
        (a.group === 'slash' && allActions.filter(x => x.group === 'slash').slice(0, 4).includes(a)) ||
        (a.group === 'agent' && allActions.filter(x => x.group === 'agent').slice(0, 4).includes(a)) ||
        (a.group === 'solution' && allActions.filter(x => x.group === 'solution').slice(0, 3).includes(a)) ||
        a.group === 'navigate' ||
        (a.group === 'history' && allActions.filter(x => x.group === 'history').slice(0, 2).includes(a))
      );
    }
    const s = q.trim().toLowerCase();
    return allActions.filter(a =>
      a.label.toLowerCase().includes(s) ||
      a.desc?.toLowerCase().includes(s) ||
      a.keywords?.some(k => k.includes(s))
    );
  }, [q, allActions]);

  // 按 group 分组(保持顺序)
  const grouped = useMemo(() => {
    const order: CmdGroup[] = ['slash', 'agent', 'solution', 'studio', 'navigate', 'history'];
    const groups: { group: CmdGroup; items: CmdAction[] }[] = [];
    order.forEach(g => {
      const items = filtered.filter(a => a.group === g);
      if (items.length > 0) groups.push({ group: g, items });
    });
    return groups;
  }, [filtered]);

  // 扁平索引(用于键盘上下)
  const flatList = useMemo(() => grouped.flatMap(g => g.items), [grouped]);

  // 复位 activeIndex
  useEffect(() => { setActiveIndex(0); }, [q]);

  // 键盘
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const action = flatList[activeIndex];
        if (action) action.run(router);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flatList, activeIndex, onClose, router]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[14vh] -translate-x-1/2 w-[min(640px,calc(100vw-3rem))] z-[101]"
          >
            <div className="rounded-xl bg-bg-elevated border border-border-strong shadow-2xl overflow-hidden">
              {/* Search */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
                <Search size={15} className="text-text-muted" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="搜命令 / Agent / 方案 / Studio · 输 / 看斜杠命令"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-text-subtle"
                />
                <kbd className="text-2xs px-1.5 py-0.5 rounded bg-bg/60 border border-border text-text-muted">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[58vh] overflow-y-auto p-1.5">
                {grouped.length === 0 ? (
                  <div className="py-12 text-center text-2xs text-text-muted">
                    没找到匹配的命令
                  </div>
                ) : (
                  grouped.map(g => (
                    <div key={g.group} className="mb-1.5 last:mb-0">
                      <div className="px-2.5 py-1 text-2xs uppercase tracking-wider text-text-subtle font-semibold">
                        {GROUP_LABEL[g.group]}
                      </div>
                      {g.items.map(item => {
                        const idx = flatList.indexOf(item);
                        const active = idx === activeIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => item.run(router)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={cn(
                              'w-full text-left px-2.5 py-2 rounded flex items-center gap-2.5 transition',
                              active ? 'bg-accent/15' : 'hover:bg-white/[0.03]'
                            )}
                          >
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `${item.iconColor ?? '#6366f1'}15`,
                                color: item.iconColor ?? '#6366f1',
                              }}
                            >
                              <item.icon size={13} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={cn('text-sm truncate', active ? 'text-text font-medium' : 'text-text')}>
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="text-[9px] px-1 py-0 rounded uppercase tracking-wider font-bold bg-warning/15 text-warning">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.desc && (
                                <div className="text-2xs text-text-muted truncate mt-0.5">{item.desc}</div>
                              )}
                            </div>
                            {item.shortcut && (
                              <kbd className="text-2xs px-1.5 py-0.5 rounded bg-bg/60 border border-border text-text-muted num">
                                {item.shortcut}
                              </kbd>
                            )}
                            {active && (
                              <ArrowRight size={11} className="text-accent-glow flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-3 py-2 flex items-center gap-3 text-2xs text-text-subtle bg-bg/30">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0 rounded bg-bg-elevated border border-border">↑</kbd>
                  <kbd className="px-1 py-0 rounded bg-bg-elevated border border-border">↓</kbd>
                  导航
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0 rounded bg-bg-elevated border border-border">↵</kbd>
                  执行
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0 rounded bg-bg-elevated border border-border num">/</kbd>
                  斜杠命令
                </span>
                <div className="flex-1" />
                <span className="inline-flex items-center gap-1">
                  <Sparkles size={9} className="text-accent-glow" />
                  Builder Copilot · {flatList.length} 个候选
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const GROUP_LABEL: Record<CmdGroup, string> = {
  slash:    '斜杠命令',
  agent:    'Agents',
  solution: 'Solutions',
  studio:   'Studio 切换',
  navigate: '跳转',
  history:  '最近会话',
};

// ─── Hook: 全局键盘 ⌘K ───────────────────────────

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}
