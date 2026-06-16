'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  Paperclip,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  Inbox,
  Cpu,
  ArrowRight,
  Phone,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  Reply,
  Archive,
  Star,
} from 'lucide-react';
import { ProConversations, proMessageStats, type ProConversation } from '@/lib/mock/messages';
import { cn } from '@/lib/utils';

const PRIORITY_LABEL = {
  urgent: { label: '紧急', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30', dot: 'bg-rose-400' },
  lead: { label: '新 Lead', color: 'text-warning bg-warning/15 border-warning/30', dot: 'bg-warning' },
  normal: { label: '常规', color: 'text-text-muted bg-white/5 border-border', dot: 'bg-text-subtle' },
};

const CONTEXT_ICON = {
  'lead-inquiry': Inbox,
  'project-update': Sparkles,
  'support': AlertTriangle,
  'service-renewal': CheckCircle2,
};

const FILTERS = ['全部', '紧急', 'Lead', '客户', '已读'];

export default function ProMessagesPage() {
  const stats = proMessageStats();
  const [activeId, setActiveId] = useState(ProConversations[0].id);
  const [filter, setFilter] = useState('全部');
  const [draft, setDraft] = useState('');
  const active = ProConversations.find(c => c.id === activeId)!;

  const filtered = ProConversations.filter(c => {
    if (filter === '紧急') return c.priority === 'urgent';
    if (filter === 'Lead') return c.priority === 'lead';
    if (filter === '客户') return c.priority === 'normal' || c.priority === 'urgent';
    if (filter === '已读') return c.unread === 0;
    return true;
  });

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-8 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare size={16} className="text-accent-glow" />
            Messages
          </h1>
          <div className="flex items-center gap-1.5 ml-3">
            <Mini label="未读" value={stats.unread} tone="accent" />
            <Mini label="紧急" value={stats.urgent} tone="critical" />
            <Mini label="新 Lead" value={stats.leads} tone="warning" />
          </div>
          <div className="flex-1" />
          <p className="text-2xs text-text-muted">
            和客户的所有对话 — 客户在 Builder 前台 (builder.aqara.com/home/messages) 看到的就是同一份对话
          </p>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="flex-1 grid grid-cols-[360px_1fr] min-h-0">
        {/* Conversation list */}
        <aside className="border-r border-border flex flex-col">
          <div className="px-4 py-3 border-b border-border space-y-2">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                placeholder="搜索客户名 / 内容..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-2.5 py-1 text-2xs rounded-full border whitespace-nowrap transition',
                    filter === f
                      ? 'border-accent/60 bg-accent/10 text-text'
                      : 'border-border text-text-muted hover:text-text'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(c => {
              const ContextIcon = c.context ? CONTEXT_ICON[c.context.type] : MessageSquare;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    'w-full px-4 py-3 border-b border-border hover:bg-white/[0.02] text-left transition',
                    activeId === c.id && 'bg-white/[0.04]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm font-semibold',
                          c.avatarGradient
                        )}
                      >
                        {c.customerAvatar}
                      </div>
                      <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg', PRIORITY_LABEL[c.priority].dot)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{c.customerName}</span>
                        {c.unread > 0 && (
                          <span className="text-2xs num px-1.5 py-0 rounded-full bg-accent text-bg font-medium">
                            {c.unread}
                          </span>
                        )}
                        <span className="text-2xs text-text-subtle ml-auto whitespace-nowrap">{c.lastTime}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-2xs text-text-muted truncate">
                        <ContextIcon size={9} />
                        <span className="truncate">{c.customerLabel}</span>
                      </div>
                      <div className={cn('mt-1 text-2xs line-clamp-2 leading-snug', c.unread > 0 ? 'text-text' : 'text-text-muted')}>
                        {c.lastMessage}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active conversation */}
        <section className="flex flex-col min-h-0">
          {/* Conversation header */}
          <div className="px-6 py-3.5 border-b border-border flex items-center gap-3">
            <div
              className={cn(
                'w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm font-semibold',
                active.avatarGradient
              )}
            >
              {active.customerAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/pro/customers/${active.customerId}`}
                  className="font-medium hover:text-accent-glow transition"
                >
                  {active.customerName}
                </Link>
                <span className={cn('text-2xs px-1.5 py-0.5 rounded border', PRIORITY_LABEL[active.priority].color)}>
                  {PRIORITY_LABEL[active.priority].label}
                </span>
              </div>
              <div className="text-2xs text-text-muted">{active.customerLabel}</div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-md hover:bg-white/5 text-text-muted hover:text-text" title="收藏">
                <Star size={13} />
              </button>
              <button className="p-2 rounded-md hover:bg-white/5 text-text-muted hover:text-text" title="拨号">
                <Phone size={13} />
              </button>
              <button className="p-2 rounded-md hover:bg-white/5 text-text-muted hover:text-text" title="归档">
                <Archive size={13} />
              </button>
            </div>
          </div>

          {/* Context bar */}
          {active.context && (
            <div className="px-6 py-2.5 border-b border-border bg-white/[0.02] flex items-center gap-2 text-2xs">
              {active.context.type === 'support' && active.context.studioId && (
                <>
                  <Cpu size={11} className="text-rose-400" />
                  <span className="text-text-muted">关联 Studio:</span>
                  <span className="font-mono text-text">{active.context.studioId}</span>
                  <span className="text-text-subtle">·</span>
                  <Link href="/pro/studios" className="text-accent-glow hover:underline inline-flex items-center gap-0.5">
                    打开 Studio 管理 <ExternalLink size={9} />
                  </Link>
                </>
              )}
              {active.context.type === 'lead-inquiry' && active.context.leadValue && (
                <>
                  <Inbox size={11} className="text-warning" />
                  <span className="text-text-muted">新 Lead 估值:</span>
                  <span className="num text-warning">¥{active.context.leadValue.toLocaleString()}</span>
                  <span className="text-text-subtle">·</span>
                  <Link href="/pro/leads" className="text-accent-glow hover:underline inline-flex items-center gap-0.5">
                    转为正式 Lead <ArrowRight size={9} />
                  </Link>
                </>
              )}
              {active.context.type === 'project-update' && active.context.projectTitle && (
                <>
                  <Sparkles size={11} className="text-accent-glow" />
                  <span className="text-text-muted">项目:</span>
                  <span className="text-text">{active.context.projectTitle}</span>
                  <span className="text-text-subtle">·</span>
                  <Link href="/pro/projects/proj-wang-villa/overview" className="text-accent-glow hover:underline inline-flex items-center gap-0.5">
                    打开项目工作台 <ExternalLink size={9} />
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
            {active.messages.map(m => (
              <motion.div
                key={m.id}
                initial={{ y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', m.sender === 'me' ? 'justify-end' : 'justify-start')}
              >
                {m.sender === 'system' ? (
                  <div className="text-2xs text-text-subtle italic mx-auto">{m.content}</div>
                ) : (
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2.5 whitespace-pre-line text-sm',
                      m.sender === 'me'
                        ? 'bg-gradient-to-br from-accent to-accent2 text-white rounded-br-sm'
                        : 'bg-white/5 border border-border rounded-bl-sm'
                    )}
                  >
                    {m.content}
                    {m.attachments?.map((a, i) => (
                      <div key={i} className="mt-2 px-2 py-1.5 rounded bg-black/20 text-2xs flex items-center gap-1.5">
                        <Lightbulb size={10} /> {a.label}
                      </div>
                    ))}
                    <div className="text-[10px] opacity-60 mt-1">{m.time}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Quick replies */}
          <div className="px-6 py-2.5 border-t border-border flex items-center gap-2 overflow-x-auto">
            <span className="text-2xs text-text-subtle whitespace-nowrap">快速回复:</span>
            {[
              '我马上远程接入',
              '本周可以约个时间',
              '已看到,正在确认',
              'AI 助手起草',
            ].map(q => (
              <button
                key={q}
                onClick={() => setDraft(q)}
                className="text-2xs px-2.5 py-1 rounded-full border border-border hover:border-border-strong text-text-muted hover:text-text whitespace-nowrap"
              >
                {q === 'AI 助手起草' && <Sparkles size={9} className="inline mr-1 text-accent-glow" />}
                {q}
              </button>
            ))}
          </div>

          {/* Composer */}
          <div className="border-t border-border px-6 py-3 flex items-end gap-2">
            <button className="p-2 rounded-md hover:bg-white/5 text-text-muted">
              <Paperclip size={14} />
            </button>
            <button className="p-2 rounded-md hover:bg-white/5 text-text-muted">
              <ImageIcon size={14} />
            </button>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={1}
              placeholder="给客户回复..."
              className="flex-1 bg-bg-elevated border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-border-strong resize-none"
            />
            <button
              disabled={!draft.trim()}
              className={cn(
                'px-3 py-2 rounded-md inline-flex items-center gap-1.5 text-sm transition',
                draft.trim()
                  ? 'bg-gradient-to-br from-accent to-accent2 text-white'
                  : 'bg-white/5 text-text-subtle cursor-not-allowed'
              )}
            >
              <Send size={12} /> 发送
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: number; tone: 'accent' | 'critical' | 'warning' }) {
  if (!value) return null;
  const c =
    tone === 'critical' ? 'text-rose-400 bg-rose-500/15 border-rose-500/30' :
    tone === 'warning' ? 'text-warning bg-warning/15 border-warning/30' :
    'text-accent-glow bg-accent/10 border-accent/30';
  return (
    <span className={cn('text-2xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1', c)}>
      {label}
      <span className="num font-medium">{value}</span>
    </span>
  );
}
