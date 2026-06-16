'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Video as VideoIcon,
  MoreVertical,
  Image as ImageIcon,
  Paperclip,
  Send,
  ChevronLeft,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { MyConversations, Conversation, Message } from '@/lib/mock/messages';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const [activeId, setActiveId] = useState<string>(MyConversations[0].id);
  const active = MyConversations.find(c => c.id === activeId)!;

  return (
    <div className="h-screen flex flex-col">
      <UserTopBar title="Messages" />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] overflow-hidden border-t border-border">
        {/* List */}
        <aside className="border-r border-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                placeholder="搜索对话..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MyConversations.map(c => {
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    'w-full p-4 flex items-start gap-3 text-left transition border-b border-border',
                    isActive ? 'bg-accent/10' : 'hover:bg-white/[0.02]'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-sm font-semibold text-white',
                      c.avatarGradient
                    )}
                  >
                    {c.peerAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm truncate">{c.peerName}</span>
                      {c.unread > 0 && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                      )}
                    </div>
                    {c.peerLabel && (
                      <div className="text-2xs text-text-subtle truncate">{c.peerLabel}</div>
                    )}
                    <div className="mt-1 text-xs text-text-muted line-clamp-1">{c.lastMessage}</div>
                    <div className="mt-1 text-2xs text-text-subtle">{c.lastTime}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Conversation */}
        <main className="flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-14 border-b border-border flex items-center px-5 gap-3 flex-shrink-0">
            <div
              className={cn(
                'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-semibold text-white',
                active.avatarGradient
              )}
            >
              {active.peerAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium leading-tight truncate">{active.peerName}</div>
              {active.peerLabel && (
                <div className="text-2xs text-text-muted truncate">{active.peerLabel}</div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-md hover:bg-white/5 text-text-muted">
                <Phone size={14} />
              </button>
              <button className="p-2 rounded-md hover:bg-white/5 text-text-muted">
                <VideoIcon size={14} />
              </button>
              <button className="p-2 rounded-md hover:bg-white/5 text-text-muted">
                <MoreVertical size={14} />
              </button>
            </div>
          </header>

          {/* Context bar */}
          {active.context?.type === 'quote' && (
            <div className="px-5 py-2.5 bg-accent/5 border-b border-accent/20 flex items-center gap-2 text-2xs">
              <Sparkles size={11} className="text-accent-glow" />
              <span className="text-text-muted">询价对话:</span>
              <span className="text-text">{active.context.projectTitle}</span>
              <span className="text-text-muted">·</span>
              {active.context.quoteStatus === 'scheduled' ? (
                <span className="text-success inline-flex items-center gap-1">
                  <CheckCircle2 size={10} /> 已约 — 周四 14:00 上门勘察
                </span>
              ) : (
                <span>等待 Builder 回复</span>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {active.messages.map(m => (
              <MessageBubble key={m.id} m={m} avatarGradient={active.avatarGradient} avatarChar={active.peerAvatar} />
            ))}
          </div>

          {/* Composer */}
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-2">
              <button className="p-2 rounded-md hover:bg-white/5 text-text-muted">
                <Paperclip size={14} />
              </button>
              <button className="p-2 rounded-md hover:bg-white/5 text-text-muted">
                <ImageIcon size={14} />
              </button>
              <button className="p-2 rounded-md hover:bg-white/5 text-text-muted" title="附 Ideabook">
                <Lightbulb size={14} />
              </button>
              <textarea
                placeholder="输入消息..."
                rows={1}
                className="flex-1 px-3 py-2 text-sm rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none resize-none max-h-32"
              />
              <button className="p-2.5 rounded-md bg-gradient-to-br from-accent to-accent2 text-white">
                <Send size={14} />
              </button>
            </div>
            <div className="mt-2 text-2xs text-text-subtle text-center">
              ⌘ Enter 发送 · 你的消息会在 Builder 端 Builder Pro 同步出现
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MessageBubble({ m, avatarGradient, avatarChar }: { m: Message; avatarGradient: string; avatarChar: string }) {
  if (m.sender === 'system') {
    return (
      <div className="text-center text-2xs text-text-subtle py-2">
        <span className="px-3 py-1 rounded-full bg-white/5">{m.content}</span>
      </div>
    );
  }

  const isMe = m.sender === 'me';

  return (
    <div className={cn('flex items-start gap-2.5', isMe && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-2xs font-semibold flex-shrink-0',
          isMe
            ? 'bg-gradient-to-br from-accent to-accent2 text-white'
            : `bg-gradient-to-br ${avatarGradient} text-white`
        )}
      >
        {isMe ? '我' : avatarChar}
      </div>
      <div className={cn('max-w-md', isMe && 'text-right')}>
        <div
          className={cn(
            'inline-block px-3.5 py-2 rounded-2xl text-sm whitespace-pre-line text-left',
            isMe ? 'bg-accent/15 border border-accent/30' : 'bg-white/5 border border-border'
          )}
        >
          {m.content}
        </div>
        {m.attachments && m.attachments.length > 0 && (
          <div className={cn('mt-1.5 flex gap-1.5', isMe && 'justify-end')}>
            {m.attachments.map((att, i) => (
              <span
                key={i}
                className="text-2xs px-2 py-1 rounded-md bg-accent/10 border border-accent/30 text-accent-glow inline-flex items-center gap-1"
              >
                {att.type === 'ideabook' && '💡'}
                {att.type === 'image' && '🖼'}
                {att.type === 'floorplan' && '📐'}
                {att.label}
              </span>
            ))}
          </div>
        )}
        <div className={cn('mt-1 text-2xs text-text-subtle', isMe && 'text-right')}>{m.time}</div>
      </div>
    </div>
  );
}
