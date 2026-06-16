'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Heart,
  GitFork,
  Sparkles,
  ShieldCheck,
  Play,
  Bookmark,
  Clock,
  Radio,
  BookOpen,
  Eye,
} from 'lucide-react';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import { Showcase, STYLE_LABELS, KIND_LABELS } from '@/lib/mock/showcases';
import { ACBs } from '@/lib/mock/acbs';
import { formatNumber, cn } from '@/lib/utils';

export function ShowcaseCard({ showcase, index = 0 }: { showcase: Showcase; index?: number }) {
  const router = useRouter();
  const author = ACBs.find(a => a.handle === showcase.authorHandle);
  const style = STYLE_LABELS[showcase.style];
  const kind = KIND_LABELS[showcase.kind];
  const canRemix = Boolean(showcase.linkedSolutionId);

  // Height varies by aspect (masonry feel)
  const aspect = showcase.aspect ?? 'square';
  const thumbHeight =
    aspect === 'landscape' ? 'aspect-[16/10]' :
    aspect === 'portrait' ? 'aspect-[3/4]' :
    aspect === 'tall' ? 'aspect-[3/5]' :
    'aspect-square';

  const handleRemix = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canRemix) return;
    router.push(`/build?entry=personal&demo_as=builder&solution=${showcase.linkedSolutionId}`);
  };

  return (
    <motion.div
      initial={{ y: 12 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.4) }}
      className="group relative card card-hover overflow-hidden break-inside-avoid mb-4"
    >
      {/* Thumbnail */}
      <div
        className={cn('relative overflow-hidden', thumbHeight)}
        style={{ background: showcase.thumbnailGradient }}
      >
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 p-4">
          <FloorplanSVG pattern={showcase.thumbnailPattern} />
        </div>

        {/* SeedDance / video play overlay */}
        {showcase.kind === 'shorts' && showcase.videoMeta && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition">
                <Play size={18} className="text-white ml-0.5" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md bg-black/50 text-white num inline-flex items-center gap-1">
              <Clock size={8} /> {showcase.videoMeta.duration}s
            </div>
            {/* Time moments strip for SeedDance shorts */}
            {showcase.videoMeta.moments.length > 0 && (
              <div className="absolute bottom-2 left-2 right-12 flex gap-1 opacity-70">
                {showcase.videoMeta.moments.slice(0, 4).map((m, i) => (
                  <div key={i} className="flex-1 h-0.5 bg-white/60 rounded-full" />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tutorial play overlay */}
        {showcase.kind === 'tutorial' && showcase.tutorialMeta && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition">
                <BookOpen size={18} className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md bg-black/50 text-white inline-flex items-center gap-1">
              <Clock size={8} /> {showcase.tutorialMeta.minutes}min · {showcase.tutorialMeta.chapters} 章
            </div>
          </>
        )}

        {/* Live indicator */}
        {showcase.kind === 'live' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-rose-500/80 backdrop-blur-md border border-white/40 flex items-center justify-center animate-pulse">
                <Radio size={18} className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md bg-rose-500/80 text-white inline-flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          </>
        )}

        {/* Persona story sparkle */}
        {showcase.kind === 'persona-story' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-purple-500/40 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition">
              <Sparkles size={18} className="text-white" />
            </div>
          </div>
        )}

        {/* Top-left: kind badge + style */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider backdrop-blur-md bg-black/50 border border-white/20"
            style={{ color: kind.color }}
          >
            <span>{kind.icon}</span>
            <span>{kind.en.toUpperCase()}</span>
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs backdrop-blur-md bg-black/40 border border-white/20"
            style={{ color: style.color }}
          >
            <span>{style.emoji}</span>
            <span>{style.zh}</span>
          </span>
        </div>

        {/* Top-right: bookmark + flag */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={e => e.preventDefault()}
            className="p-1 rounded-full backdrop-blur-md bg-black/40 border border-white/20 text-white hover:bg-white hover:text-bg transition opacity-0 group-hover:opacity-100"
            title="Save to Ideabook"
          >
            <Bookmark size={11} />
          </button>
          <span className="text-2xs px-2 py-0.5 rounded-full backdrop-blur-md bg-black/40 border border-white/20 text-white">
            {showcase.countryFlag}
          </span>
        </div>

        {/* Hover quick actions */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/showcase/${showcase.id}`}
            className="flex-1 rounded-xl border border-white/80 bg-white/95 px-3 py-2 text-center text-xs font-semibold text-slate-950 shadow-lg shadow-black/15 backdrop-blur-md transition hover:bg-white"
          >
            查看案例
          </Link>
          {canRemix ? (
            <button
              onClick={handleRemix}
              className="rounded-xl border border-slate-900/10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-900/25 backdrop-blur-md transition hover:from-slate-900 hover:to-blue-600"
            >
              查看并 Remix
            </button>
          ) : (
            <button className="rounded-xl border border-white/50 bg-black/45 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-black/20 backdrop-blur-md transition hover:bg-black/60">
              <Bookmark size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <Link href={`/showcase/${showcase.id}`} className="block">
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-accent-glow transition-colors">
            {showcase.title}
          </h3>
          <p className="mt-1.5 text-xs text-text-muted line-clamp-1">{showcase.subtitle}</p>
        </Link>

        {(showcase.kind === 'showcase' || showcase.kind === 'persona-story') && (
          <div className="mt-3 flex flex-wrap gap-2 text-2xs">
            <span className="rounded-full border border-border bg-white/[0.03] px-2.5 py-1 text-text-muted">
              {showcase.size}
            </span>
            <span className="rounded-full border border-border bg-white/[0.03] px-2.5 py-1 text-text-muted">
              {showcase.devices} 台设备
            </span>
            <span className="rounded-full border border-border bg-white/[0.03] px-2.5 py-1 text-text-muted">
              {showcase.budget}
            </span>
          </div>
        )}

        {/* Author */}
        <div className="mt-3 flex items-center justify-between">
          <Link
            href={`/u/${showcase.authorHandle}`}
            className="flex items-center gap-2 group/author min-w-0"
          >
            <img
              src={author?.avatar}
              alt={author?.name}
              className="w-5 h-5 rounded-full ring-1 ring-border flex-shrink-0"
            />
            <span className="text-xs text-text-muted group-hover/author:text-text transition-colors truncate">
              {author?.name}
            </span>
            {showcase.verified && (
              <ShieldCheck size={10} className="text-accent-glow flex-shrink-0" />
            )}
          </Link>
          <span className="text-2xs text-text-subtle">{showcase.publishedAt}</span>
        </div>

        {canRemix && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/[0.05] px-3 py-2 text-2xs text-text-muted">
            <div className="min-w-0 truncate">
              关联方案 · <span className="text-text">{showcase.linkedSolutionName ?? showcase.title}</span>
            </div>
            <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] text-accent-glow">
              先预览
            </span>
          </div>
        )}

        {/* Stats — context-aware */}
        <div className="mt-3 flex items-center gap-3 text-2xs text-text-muted">
          {(showcase.kind === 'showcase' || showcase.kind === 'persona-story') && (
            <>
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-accent" />
                <span className="num">{formatNumber(showcase.applies)}</span>
                <span>应用</span>
              </span>
              <span className="flex items-center gap-1">
                <GitFork size={11} />
                <span className="num">{formatNumber(showcase.forks)}</span>
                <span>Remix</span>
              </span>
            </>
          )}
          {(showcase.kind === 'shorts' || showcase.kind === 'tutorial' || showcase.kind === 'live') && (
            <span className="flex items-center gap-1">
              <Eye size={11} />
              <span className="num">{formatNumber(showcase.hearts + showcase.applies * 3)}</span>
              <span>观看</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Heart size={11} />
            <span className="num">{formatNumber(showcase.hearts)}</span>
          </span>
          {showcase.kind === 'showcase' && (
            <span className="ml-auto flex items-center gap-1">
              {canRemix ? (
                <span className="text-accent-glow">可 Remix</span>
              ) : !showcase.hasACBService ? (
                <span className="text-success">⚡ 可自助</span>
              ) : (
                <span className="text-warning">需 Builder</span>
              )}
            </span>
          )}
        </div>

        {(showcase.kind === 'showcase' || showcase.kind === 'persona-story') && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="flex gap-2">
              <Link
                href={`/showcase/${showcase.id}`}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-2xs font-semibold text-slate-950 shadow-sm shadow-slate-300/60 transition hover:border-slate-400 hover:shadow-md"
              >
                了解案例
              </Link>
              {canRemix ? (
                <button
                  onClick={handleRemix}
                  className="flex-1 rounded-xl border border-slate-900/10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-700 px-3 py-2 text-center text-2xs font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:from-slate-900 hover:to-blue-600 hover:shadow-md"
                >
                  查看并 Remix
                </button>
              ) : (
                <Link
                  href="/builders"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-2xs font-semibold text-slate-900 shadow-sm shadow-slate-300/60 transition hover:border-slate-400 hover:shadow-md"
                >
                  找专业人
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
