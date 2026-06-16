'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass,
  Heart,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  Store,
  Users2,
} from 'lucide-react';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';

export type DiscoveryItemMode = 'plan' | 'professional' | 'plugin' | 'help';
export type DiscoveryItemKind = 'case' | 'design' | 'automation' | 'plugin' | 'help' | 'professional';
export type DiscoveryPattern = 'top' | 'rooms' | 'cross' | 'L' | 'open' | 'two-floor';

export type DiscoveryItem = {
  id: string;
  href: string;
  kind: DiscoveryItemKind;
  title: string;
  subtitle: string;
  author: string;
  metaLine: string;
  badge: string;
  verified?: boolean;
  avatar?: string;
  avatarFallback?: string;
  gradient: string;
  pattern?: DiscoveryPattern;
  mode: DiscoveryItemMode;
  emoji?: string;
  engagement: string;
  engagementScore: number;
};

export function DiscoveryFeedCard({
  item,
  index = 0,
}: {
  item: DiscoveryItem;
  index?: number;
}) {
  const Icon = iconForItem(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.025, 0.16) }}
      className="min-w-0"
    >
      <Link href={item.href} className="group block">
        <article className="min-w-0">
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm shadow-slate-200/50 transition group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-[0_14px_32px_rgba(15,23,42,0.1)]"
            style={{ background: item.gradient || undefined }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/28 via-transparent to-white/5" />
            <div className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-slate-950/45 text-white backdrop-blur">
              <Icon size={17} />
            </div>
            <span className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
              {item.badge}
            </span>
            <DiscoveryThumbnail item={item} />
          </div>

          <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-5 text-slate-950 transition group-hover:text-blue-700">
            {item.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs leading-5 text-slate-500">
            {item.subtitle}
          </p>

          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex min-w-0 items-center gap-1.5 truncate">
              {item.avatar ? (
                <img src={item.avatar} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-semibold text-slate-600">
                  {item.avatarFallback ?? item.author.slice(0, 1)}
                </span>
              )}
              <span className="truncate">{item.author}</span>
              {item.verified ? <ShieldCheck size={11} className="shrink-0 text-blue-600" /> : null}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1">
              <Heart size={12} />
              {item.engagement}
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function DiscoveryThumbnail({ item }: { item: DiscoveryItem }) {
  if (item.mode === 'professional' && item.avatar) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600/40 to-slate-950/50">
        <img src={item.avatar} alt="" className="h-24 w-24 rounded-full border-4 border-white/60 object-cover shadow-xl" />
      </div>
    );
  }

  if (item.mode === 'plugin') {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[24px] border border-white/35 bg-white/20 text-5xl shadow-xl backdrop-blur">
          {item.emoji ?? '⚙️'}
        </div>
      </div>
    );
  }

  if (item.mode === 'help') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-400">
        <MessageCircleQuestion size={54} strokeWidth={1.4} className="text-white/90" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 p-5">
      <FloorplanSVG pattern={item.pattern ?? 'rooms'} />
    </div>
  );
}

function iconForItem(item: DiscoveryItem) {
  if (item.mode === 'plugin') return Store;
  if (item.mode === 'professional') return Users2;
  if (item.mode === 'help') return MessageCircleQuestion;
  if (item.kind === 'automation' || item.kind === 'design') return Sparkles;
  return Compass;
}
