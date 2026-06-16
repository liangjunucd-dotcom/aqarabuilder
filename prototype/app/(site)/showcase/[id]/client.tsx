'use client';

import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Bookmark, ChevronLeft, GitFork, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { BuilderFrontShell } from '@/components/layout/BuilderFrontShell';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import { ShowcaseCard } from '@/components/discover/ShowcaseCard';
import { getShowcase, Showcases, STYLE_DISCOVER_META, STYLE_LABELS } from '@/lib/mock/showcases';
import { ACBs } from '@/lib/mock/acbs';
import { formatNumber } from '@/lib/utils';

export default function ShowcaseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const showcase = getShowcase(params.id);
  if (!showcase) notFound();

  const author = ACBs.find(a => a.handle === showcase.authorHandle);
  const style = STYLE_LABELS[showcase.style];
  const discoverMeta = STYLE_DISCOVER_META[showcase.style];
  const related = Showcases.filter(
    item => (item.kind === 'showcase' || item.kind === 'persona-story') && item.style === showcase.style && item.id !== showcase.id,
  ).slice(0, 3);
  const canRemix = Boolean(showcase.linkedSolutionId);

  const handleRemix = () => {
    if (!canRemix) return;
    router.push(`/build?entry=personal&demo_as=builder&solution=${showcase.linkedSolutionId}`);
  };

  return (
    <BuilderFrontShell>
      <UserTopBar title={showcase.title} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/home/discover" className="mb-6 inline-flex items-center gap-1 text-xs text-text-muted hover:text-text">
          <ChevronLeft size={14} /> 返回发现
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div
              className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border"
              style={{ background: showcase.thumbnailGradient }}
            >
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="absolute inset-10">
                <FloorplanSVG pattern={showcase.thumbnailPattern} showPersona />
              </div>

              <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs backdrop-blur-md"
                  style={{ color: style.color }}
                >
                  {style.emoji} {style.zh}
                </span>
                <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs backdrop-blur-md">
                  {showcase.countryFlag} {showcase.size}
                </span>
                {showcase.verified && (
                  <span className="rounded-full border border-accent/35 bg-accent/15 px-2.5 py-1 text-xs text-accent-glow">
                    已验证
                  </span>
                )}
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center gap-2">
                {discoverMeta.highlights.map(item => (
                  <span key={item} className="rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-md">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{showcase.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{showcase.subtitle}</p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <SummaryTile label="适合空间" value={discoverMeta.fit} />
              <SummaryTile label="预算" value={showcase.budget} />
              <SummaryTile label="设备规模" value={`${showcase.devices} 台设备`} />
              <SummaryTile label="Persona" value={`${showcase.personas} 个`} />
            </div>

            <section className="mt-8 rounded-3xl border border-border bg-bg-elevated p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="text-sm font-semibold">如果你想继续使用这套案例</div>
                  <div className="mt-2 text-sm leading-relaxed text-text-muted">
                    {canRemix
                      ? '这套案例已经关联了可复用方案。先进入只读方案总览，查看空间规划、设备点位和自动化完成度；确认有新想法后，再 Remix 成自己的项目。'
                      : '这套案例更适合作为参考灵感。你可以先收藏，再交给远程专家或本地交付网络继续完成。'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canRemix ? (
                    <button onClick={handleRemix} className="btn-hero-primary">
                      <Sparkles size={14} />
                      查看方案并 Remix
                    </button>
                  ) : (
                    <Link href="/builders" className="btn-hero-primary">
                      找专业人继续
                      <ArrowRight size={14} />
                    </Link>
                  )}
                  <button className="btn-hero-secondary">
                    <Bookmark size={14} />
                    保存灵感
                  </button>
                </div>
              </div>

              {canRemix && (
                <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/[0.05] px-4 py-3">
                  <div className="text-[11px] text-text-subtle">关联方案</div>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <div className="text-sm font-medium text-text">{showcase.linkedSolutionName ?? showcase.title}</div>
                    <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] text-accent-glow">
                      只读预览后再创建
                    </span>
                  </div>
                </div>
              )}
            </section>

            <section className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">案例看点</h2>
                <div className="text-2xs text-text-muted">
                  {formatNumber(showcase.applies)} 次应用 · {formatNumber(showcase.forks)} 次 Remix · {formatNumber(showcase.hearts)} 次收藏
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {discoverMeta.highlights.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-border bg-bg-elevated p-4"
                  >
                    <div className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] text-accent-glow">
                      看点 {index + 1}
                    </div>
                    <div className="mt-3 text-sm font-semibold">{item}</div>
                    <div className="mt-1 text-xs leading-5 text-text-muted">{discoverMeta.remixHint}</div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 self-start">
            <div className="card p-5">
              <div className="text-sm font-semibold">案例摘要</div>
              <dl className="mt-4 space-y-3 text-sm">
                <SummaryRow label="空间" value={showcase.size} />
                <SummaryRow label="预算" value={showcase.budget} />
                <SummaryRow label="设备" value={`${showcase.devices} 台`} />
                <SummaryRow label="Persona" value={`${showcase.personas} 个`} />
                <SummaryRow
                  label="继续方式"
                  value={canRemix ? '先预览再 Remix' : showcase.hasACBService ? '需专业交付' : '先保存灵感'}
                  valueClassName={canRemix ? 'text-accent-glow' : showcase.hasACBService ? 'text-warning' : 'text-success'}
                />
              </dl>
            </div>

            {author && (
              <Link href={`/u/${author.handle}`} className="card card-hover p-5 block">
                <div className="flex items-center gap-3">
                  <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{author.name}</span>
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 text-2xs text-accent-glow border border-accent/20">
                        {author.level}
                      </span>
                    </div>
                    <div className="mt-0.5 text-2xs text-text-muted">
                      {author.countryFlag} {author.city.split(' · ')[0]}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-2xs leading-5 text-text-muted">{author.bio}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                  <div>
                    <div className="text-sm font-semibold num">{formatNumber(author.stats.applies)}</div>
                    <div className="text-2xs text-text-subtle">应用</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold num">{author.stats.projects}</div>
                    <div className="text-2xs text-text-subtle">项目</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold num">★ {author.stats.rating}</div>
                    <div className="text-2xs text-text-subtle">评分</div>
                  </div>
                </div>
              </Link>
            )}

            <div className="card p-5">
              <div className="text-sm font-semibold">你现在可以做什么</div>
              <div className="mt-4 space-y-3">
                <ActionLink
                  href={canRemix ? '#' : '/builders'}
                  title={canRemix ? '查看完整方案' : '找专业人继续落地'}
                  desc={canRemix ? '先看只读总览，再决定是否 Remix 到自己的项目。' : '适合需要勘测、安装、调试和交付的案例。'}
                  onClick={canRemix ? handleRemix : undefined}
                />
                <ActionLink href="/signin" title="保存到灵感本" desc="登录后把这套案例先保存起来，后续再决定是否使用。" />
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold">相关案例 · {style.zh}</h2>
              <Link href="/home/discover" className="inline-flex items-center gap-1 text-2xs text-text-muted hover:text-text">
                浏览更多 <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {related.map(item => (
                <ShowcaseCard key={item.id} showcase={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </BuilderFrontShell>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-4">
      <div className="text-[11px] text-text-subtle">{label}</div>
      <div className="mt-2 text-sm font-medium leading-5 text-text">{value}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-text-muted">{label}</dt>
      <dd className={valueClassName ?? 'text-text'}>{value}</dd>
    </div>
  );
}

function ActionLink({
  href,
  title,
  desc,
  onClick,
}: {
  href: string;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="block w-full rounded-2xl border border-border bg-white/[0.03] p-3 text-left transition hover:border-border-strong"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-text">
          <Sparkles size={13} className="text-accent-glow" />
          {title}
        </div>
        <div className="mt-1 text-2xs leading-5 text-text-muted">{desc}</div>
      </button>
    );
  }

  return (
    <Link href={href} className="block rounded-2xl border border-border bg-white/[0.03] p-3 transition hover:border-border-strong">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-text">{title}</div>
          <div className="mt-1 text-2xs leading-5 text-text-muted">{desc}</div>
        </div>
        <ArrowRight size={13} className="text-text-subtle" />
      </div>
    </Link>
  );
}
