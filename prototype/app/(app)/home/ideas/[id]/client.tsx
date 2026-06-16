'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Share2,
  Users as UsersIcon,
  Lock,
  Globe2,
  MoreHorizontal,
  ArrowRight,
  Sparkles,
  Heart,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import { getIdeabook } from '@/lib/mock/ideabooks';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const FILTERS = ['全部', '作品', 'Builder', '设备', '插件', '备注'];

export default function IdeabookDetailPage() {
  const params = useParams<{ id?: string }>();
  const book = params?.id ? getIdeabook(params.id) : null;
  const [filter, setFilter] = useState('全部');

  if (!book) notFound();

  const items = book.items.filter(it => {
    if (filter === '全部') return true;
    const map: Record<string, string> = { '作品': 'showcase', 'Builder': 'builder', '设备': 'device', '插件': 'plugin', '备注': 'note' };
    return it.type === map[filter];
  });

  return (
    <div className="min-h-screen">
      <UserTopBar title="Ideabook · 详情" />

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0" style={{ background: book.gradient, opacity: 0.15 }} />
        <div className="relative mx-auto max-w-6xl px-6 py-10">
          <Link href="/home/ideas" className="inline-flex items-center gap-1 text-2xs text-text-muted hover:text-text mb-4">
            <ChevronLeft size={12} /> 所有灵感本
          </Link>
          <div className="flex items-start gap-5">
            <div
              className="w-20 h-20 rounded-2xl text-5xl flex items-center justify-center flex-shrink-0 shadow-xl"
              style={{ background: book.gradient }}
            >
              {book.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold">{book.title}</h1>
              <p className="mt-1 text-sm text-text-muted">{book.description}</p>
              <div className="mt-3 flex items-center gap-4 text-2xs text-text-muted">
                <span>
                  <span className="num text-text">{book.itemCount}</span> 项
                </span>
                <span>·</span>
                <span>{book.updatedAt}更新</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  {book.visibility === 'private' && <><Lock size={9} /> 仅自己可见</>}
                  {book.visibility === 'shared' && <><UsersIcon size={9} /> 家人可见</>}
                  {book.visibility === 'public' && <><Globe2 size={9} /> 公开</>}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-xs rounded-md border border-border hover:border-border-strong inline-flex items-center gap-1.5">
                <Share2 size={12} /> 分享
              </button>
              <button className="p-2 rounded-md border border-border hover:border-border-strong">
                <MoreHorizontal size={13} />
              </button>
            </div>
          </div>

          {/* Smart suggestion */}
          <div className="mt-6 flex items-center gap-3 p-4 rounded-lg border border-accent/30 bg-accent/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-white text-base flex-shrink-0">
              <Sparkles size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                <span className="font-medium">想真正落地这些灵感?</span>{' '}
                <span className="text-text-muted">我们发现你收藏了 3 位擅长此类方案的 Builder,可以一键把这本灵感分享给他们询价。</span>
              </div>
            </div>
            <Link
              href="/home/find-pro"
              className="px-3 py-1.5 text-xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white font-medium whitespace-nowrap inline-flex items-center gap-1"
            >
              <MessageSquare size={12} /> 一键询价
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 text-xs">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md transition',
                f === filter ? 'bg-white/10 text-text' : 'text-text-muted hover:text-text hover:bg-white/5'
              )}
            >
              {f}
              {f === '全部' && <span className="ml-1 num text-text-muted">{book.itemCount}</span>}
            </button>
          ))}
        </div>

        {/* Masonry-ish grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ItemCard item={it} />
            </motion.div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="card p-10 text-center">
            <Lightbulb size={28} className="mx-auto text-text-muted mb-3" />
            <p className="text-sm text-text-muted">这一类下暂无收藏</p>
          </div>
        )}
      </main>
    </div>
  );
}

function ItemCard({ item }: { item: any }) {
  if (item.type === 'showcase') {
    return (
      <Link href={`/showcase/${item.refId}`} className="card card-hover overflow-hidden group block">
        <div className="h-40 relative" style={{ background: item.gradient ?? 'linear-gradient(135deg,#64748b,#475569)' }}>
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-4 opacity-70">
            <FloorplanSVG pattern="open" showDevices={false} />
          </div>
          <span className="absolute top-2 left-2 text-2xs px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-md text-white">作品</span>
        </div>
        <div className="p-3">
          <div className="text-sm font-medium line-clamp-1 group-hover:text-accent-glow transition">{item.title}</div>
          <div className="mt-0.5 text-2xs text-text-muted line-clamp-1">{item.subtitle}</div>
          <div className="mt-2 text-2xs text-text-subtle">❤ 收藏于 {item.addedAt}</div>
        </div>
      </Link>
    );
  }

  if (item.type === 'builder') {
    return (
      <Link href={`/u/${item.refId}`} className="card card-hover overflow-hidden p-4 flex items-center gap-3 group">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-xl font-semibold text-white flex-shrink-0">
          {item.title[0]}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-2xs px-1.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent-glow">Builder</span>
          <div className="mt-1 font-medium line-clamp-1 group-hover:text-accent-glow transition">{item.title}</div>
          <div className="text-2xs text-text-muted line-clamp-1">{item.subtitle}</div>
        </div>
      </Link>
    );
  }

  if (item.type === 'plugin') {
    return (
      <div className="card card-hover p-4 block group cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-xl">
            🧩
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-2xs px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/40 text-purple-300">插件</span>
            <div className="mt-1 font-medium line-clamp-1">{item.title}</div>
            <div className="text-2xs text-text-muted line-clamp-1">{item.subtitle}</div>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'device') {
    return (
      <div className="card card-hover p-4 block group cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-xl">
            ⚡
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-2xs px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">设备</span>
            <div className="mt-1 font-medium line-clamp-1">{item.title}</div>
            <div className="text-2xs text-text-muted line-clamp-1">{item.subtitle}</div>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'note') {
    return (
      <div className="card p-4 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-2">
          <span className="text-xl">📝</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{item.title}</div>
            <div className="mt-1 text-2xs text-text-muted leading-relaxed">{item.note}</div>
            <div className="mt-2 text-2xs text-text-subtle">{item.addedAt}</div>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'automation') {
    return (
      <div className="card card-hover p-4 block cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-accent/15 border border-accent/40 flex items-center justify-center text-xl">
            🎯
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-2xs px-1.5 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent-glow">自动化</span>
            <div className="mt-1 font-medium line-clamp-1">{item.title}</div>
            <div className="text-2xs text-text-muted line-clamp-1">{item.subtitle}</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
