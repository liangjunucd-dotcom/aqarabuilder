'use client';

import { useState } from 'react';
import { Send, Paperclip, MessageCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Quality = 'fast' | 'mid' | 'high';
type Count = 1 | 2 | 4;

interface Props {
  /** 主题色（与画布风格一致），默认 indigo */
  accent?: string;
  /** 输入框 placeholder */
  placeholder?: string;
  /** "小技巧" 按钮的提示气泡内容 */
  tips?: string[];
  /** 提交回调 */
  onSubmit?: (input: { prompt: string; quality: Quality; count: Count }) => void;
  /** 默认是否展开历史对话区（点击 💬 图标） */
  showHistoryDot?: boolean;
}

/**
 * 通用画布 Prompt 输入条（持续可见的浮层）
 * 参考 Lovart / Midjourney 风格 — 固定底部中央，画布上方悬浮
 */
export function CanvasPromptBar({
  accent = '#6366f1',
  placeholder = '描述你想要的内容，按 Enter 生成…',
  tips,
  onSubmit,
  showHistoryDot = true,
}: Props) {
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState<Quality>('mid');
  const [count, setCount] = useState<Count>(1);
  const [tipOpen, setTipOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    onSubmit?.({ prompt, quality, count });
    setTimeout(() => {
      setBusy(false);
      setPrompt('');
    }, 1200);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(720px,calc(100%-3rem))] pointer-events-none">
      <div className="relative pointer-events-auto rounded-2xl border border-border-strong bg-bg-elevated/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Toolbar row */}
        <div className="flex items-center gap-1 px-3 pt-2.5 pb-2">
          {/* History toggle */}
          <button
            className="relative p-1.5 rounded-md text-text-muted hover:text-text hover:bg-white/5 transition"
            title="历史对话"
          >
            <MessageCircle size={14} />
            {showHistoryDot && (
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{ background: accent }}
              />
            )}
          </button>

          {/* Attachment */}
          <button
            className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-white/5 transition"
            title="附件"
          >
            <Paperclip size={13} />
          </button>

          <span className="w-px h-4 bg-border mx-1" />

          {/* Quality */}
          <div className="flex items-center gap-0.5 rounded-md bg-bg/40 p-0.5">
            {(['fast', 'mid', 'high'] as Quality[]).map(q => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={cn(
                  'px-2 py-0.5 text-2xs rounded transition',
                  quality === q ? 'bg-white/10 text-text' : 'text-text-muted hover:text-text'
                )}
              >
                {q === 'fast' ? '快' : q === 'mid' ? '中' : '精'}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="flex items-center gap-0.5 rounded-md bg-bg/40 p-0.5">
            {([1, 2, 4] as Count[]).map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={cn(
                  'px-2 py-0.5 text-2xs rounded num transition',
                  count === n ? 'bg-white/10 text-text' : 'text-text-muted hover:text-text'
                )}
              >
                ×{n}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Tips */}
          {tips && tips.length > 0 && (
            <div className="relative">
              <button
                onMouseEnter={() => setTipOpen(true)}
                onMouseLeave={() => setTipOpen(false)}
                onClick={() => setTipOpen(o => !o)}
                className="px-2 py-1 rounded-md text-2xs inline-flex items-center gap-1 text-text-muted hover:text-text hover:bg-white/5 transition"
              >
                <Lightbulb size={11} className="text-warning" />
                小技巧
              </button>
              <AnimatePresence>
                {tipOpen && (
                  <motion.div
                    initial={{ y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 bottom-[calc(100%+8px)] w-72 card p-3 shadow-xl"
                  >
                    <div className="text-2xs text-text-subtle uppercase tracking-wider mb-2">
                      Prompt 提示
                    </div>
                    <ul className="space-y-1.5 text-2xs text-text-muted leading-relaxed">
                      {tips.map((t, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-text-subtle">·</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Input row */}
        <div className="px-3 pb-3">
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none resize-none text-sm text-text placeholder:text-text-subtle leading-relaxed py-2 max-h-32"
            />
            <button
              onClick={submit}
              disabled={!prompt.trim() || busy}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition flex-shrink-0',
                prompt.trim() && !busy ? 'text-white' : 'bg-white/5 text-text-subtle cursor-not-allowed'
              )}
              style={
                prompt.trim() && !busy
                  ? { background: accent }
                  : undefined
              }
              title="发送 (Enter)"
            >
              {busy ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
