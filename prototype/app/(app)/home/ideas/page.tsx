'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Lightbulb,
  Users as UsersIcon,
  Search,
  ArrowRight,
  Share2,
  Lock,
  Globe2,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { MyIdeabooks } from '@/lib/mock/ideabooks';
import { cn } from '@/lib/utils';

export default function IdeasPage() {
  return (
    <div className="min-h-screen">
      <UserTopBar title="Ideabooks" />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-2xs px-2.5 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent-glow mb-3">
              <Lightbulb size={11} /> Ideabook · 把喜欢的保存起来
            </div>
            <h1 className="text-2xl font-semibold">我的灵感本</h1>
            <p className="mt-1.5 text-sm text-text-muted">
              <span className="num">{MyIdeabooks.length}</span> 本 · <span className="num">{MyIdeabooks.reduce((a, b) => a + b.itemCount, 0)}</span> 个收藏 · 按主题整理你喜欢的方案、Builder、设备
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                placeholder="搜索灵感本..."
                className="pl-9 pr-3 py-2 text-sm rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none w-56"
              />
            </div>
            <button className="px-3 py-2 text-sm rounded-md bg-gradient-to-br from-accent to-accent2 text-white inline-flex items-center gap-1.5">
              <Plus size={13} /> 新建灵感本
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MyIdeabooks.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/home/ideas/${b.id}`} className="card card-hover overflow-hidden block group">
                <div className="h-44 relative flex items-center justify-center" style={{ background: b.gradient }}>
                  <div className="absolute inset-0 grid-pattern opacity-20" />
                  <div className="relative text-7xl drop-shadow-lg">{b.emoji}</div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {b.visibility === 'private' && (
                      <span className="text-2xs px-1.5 py-0.5 rounded backdrop-blur-md bg-black/40 border border-white/10 text-white inline-flex items-center gap-1">
                        <Lock size={9} /> 仅自己
                      </span>
                    )}
                    {b.visibility === 'shared' && (
                      <span className="text-2xs px-1.5 py-0.5 rounded backdrop-blur-md bg-black/40 border border-white/10 text-white inline-flex items-center gap-1">
                        <UsersIcon size={9} /> 家人可见
                      </span>
                    )}
                    {b.visibility === 'public' && (
                      <span className="text-2xs px-1.5 py-0.5 rounded backdrop-blur-md bg-black/40 border border-white/10 text-white inline-flex items-center gap-1">
                        <Globe2 size={9} /> 公开
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-2xs text-white/90">
                    <span className="num bg-black/30 px-2 py-0.5 rounded backdrop-blur-md">{b.itemCount} 项</span>
                    <span className="bg-black/30 px-2 py-0.5 rounded backdrop-blur-md">{b.updatedAt}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium leading-tight group-hover:text-accent-glow transition">{b.title}</h3>
                  <p className="mt-1 text-2xs text-text-muted line-clamp-1">{b.description}</p>
                  <div className="mt-3 flex items-center -space-x-2">
                    {b.items.slice(0, 4).map((it, idx) => (
                      <div
                        key={it.id}
                        className="w-6 h-6 rounded-full border-2 border-bg-elevated flex items-center justify-center text-2xs flex-shrink-0"
                        style={{ background: it.gradient ?? 'linear-gradient(135deg,#64748b,#475569)', zIndex: 10 - idx }}
                      >
                        {it.type === 'builder' && '👤'}
                        {it.type === 'plugin' && '🧩'}
                        {it.type === 'device' && '⚡'}
                        {it.type === 'note' && '📝'}
                      </div>
                    ))}
                    {b.itemCount > 4 && (
                      <span className="text-2xs text-text-subtle ml-3">+{b.itemCount - 4}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* New ideabook card */}
          <button className="card border-dashed hover:border-accent/50 hover:bg-accent/5 transition flex flex-col items-center justify-center gap-2 p-10 min-h-[340px] group">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-border group-hover:border-accent/50 flex items-center justify-center transition">
              <Plus size={18} className="text-text-muted group-hover:text-accent-glow" />
            </div>
            <div className="text-sm font-medium">新建一个灵感本</div>
            <div className="text-2xs text-text-muted max-w-[180px] text-center">
              例如"客厅改造" / "Wedding Gift ideas" / "Emma 的房间"
            </div>
          </button>
        </div>

        {/* Tip */}
        <div className="mt-10 card p-5 border-accent/30 bg-accent/5 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-accent-glow">你收藏的越多,推荐越准</div>
              <p className="mt-1 text-2xs text-text-muted leading-relaxed">
                收藏 10+ 个方案后,我们会自动为你推荐匹配的本地 Builder 和设备。收藏 30+ 后,解锁"直接分享灵感本给 Builder"的快速询价能力。
              </p>
            </div>
            <Link href="/home/discover" className="text-2xs px-3 py-1.5 rounded-md bg-white text-bg font-medium inline-flex items-center gap-1 whitespace-nowrap">
              去 Discover 找更多
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
