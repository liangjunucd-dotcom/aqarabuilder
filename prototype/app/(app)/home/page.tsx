'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import {
  ArrowRight,
  BookOpen,
  Box,
  ChevronRight,
  Compass,
  Cpu,
  FileText,
  GraduationCap,
  Home,
  Layers3,
  Play,
  PlugZap,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { publicPlugins } from '@/lib/mock/plugins';
import { featuredShowcases, KIND_LABELS, type Showcase } from '@/lib/mock/showcases';
import { useRole } from '@/lib/role';
import { cn, formatNumber } from '@/lib/utils';

type StartCard = {
  title: string;
  desc: string;
  href: string;
  icon: ElementType;
  tone: string;
};

const START_CARDS: StartCard[] = [
  {
    title: 'Try Online Demo',
    desc: 'Explore a virtual space with devices, rooms, and automations.',
    href: '/build?entry=personal&demo_as=builder&workflow=space',
    icon: Cpu,
    tone: 'from-blue-600/12 via-slate-950/0 to-cyan-500/14',
  },
  {
    title: 'Create a Space',
    desc: 'Start from a floor plan, a template, or a blank canvas.',
    href: '/home/build',
    icon: Home,
    tone: 'from-emerald-500/14 via-slate-950/0 to-blue-600/12',
  },
  {
    title: 'Browse Resources',
    desc: 'Find plugins, templates, connectors, and reusable automations.',
    href: '/marketplace',
    icon: PlugZap,
    tone: 'from-violet-500/14 via-slate-950/0 to-rose-500/10',
  },
];

const LEARNING = [
  {
    title: 'Aqara Studio Introduction',
    desc: 'Understand how Studio connects spaces, devices, scenes, and local execution.',
    href: '/home/discover?kind=tutorial',
    image: '/images/studio-remote-overview.png',
    duration: '05:07',
  },
  {
    title: 'Build a Floor Plan',
    desc: 'Turn a real apartment layout into rooms, devices, and automations.',
    href: '/home/build',
    image: '/images/customer-bto-floorplan.png',
    duration: '08:24',
  },
  {
    title: 'Remote Studio Basics',
    desc: 'Learn how spaces stay manageable after deployment.',
    href: '/home/studios',
    image: '/images/aqara-home-spatial-hero.png',
    duration: '06:12',
  },
];

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f7fb]" />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get('q') ?? '';
  const router = useRouter();
  const { role, mounted } = useRole();
  const [query, setQuery] = useState(urlQuery);

  const showcases = useMemo(() => featuredShowcases().slice(0, 5), []);
  const heroCase = showcases[0];
  const sideCases = showcases.slice(1, 3);
  const marketplacePicks = useMemo(() => publicPlugins().filter(plugin => plugin.featured).slice(0, 4), []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/home/discover?q=${encodeURIComponent(trimmed)}` : '/home/discover');
  };

  useEffect(() => {
    if (mounted && role === 'anonymous') {
      router.replace('/');
    }
  }, [mounted, role, router]);

  if (mounted && role === 'anonymous') {
    return <div className="min-h-screen bg-[#f6f7fb]" />;
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <UserTopBar
        title="Home"
          centerSlot={(
            <form onSubmit={handleSearch} className="w-full">
            <label className="flex h-10 w-full items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 shadow-sm shadow-black/20 transition focus-within:border-blue-300/80 focus-within:bg-white/20">
              <Search size={16} className="text-white/60" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search cases, templates, plugins, tutorials"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
            </label>
          </form>
        )}
      />

      <main className="mx-auto max-w-[1500px] px-5 py-5 lg:px-6">
        <SpotlightSection heroCase={heroCase} sideCases={sideCases} />
        <StartBuildingSection />
        <MarketplaceSection items={marketplacePicks} />
        <LearningSection />
      </main>
    </div>
  );
}

function SpotlightSection({ heroCase, sideCases }: { heroCase?: Showcase; sideCases: Showcase[] }) {
  if (!heroCase) return null;

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
      <Link href={`/showcase/${heroCase.id}`} className="group block">
        <article className="relative min-h-[430px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm shadow-slate-200/70">
          <div className="absolute inset-0" style={{ background: heroCase.thumbnailGradient }} />
          <div className="absolute inset-0 opacity-80">
            <FloorplanSVG pattern={heroCase.thumbnailPattern} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/84 via-slate-950/20 to-white/8" />
          <div className="absolute left-5 top-5 rounded-full border border-white/24 bg-slate-950/35 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
            Featured Case
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold text-white/72">{heroCase.countryFlag} {heroCase.size} · {heroCase.devices} devices</div>
              <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                {heroCase.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">{heroCase.subtitle}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/15 transition group-hover:-translate-y-0.5">
                  View Case <ArrowRight size={14} />
                </span>
                {heroCase.linkedSolutionId ? (
                  <span className="inline-flex h-10 items-center rounded-lg border border-white/24 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur">
                    Remix available
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      </Link>

      <div className="grid gap-4">
        {sideCases.map(item => (
          <ContentStrip key={item.id} item={item} />
        ))}
        <Link
          href="/home/discover"
          className="flex min-h-[118px] items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
        >
          <span>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Compass size={19} />
            </span>
            <span className="mt-3 block text-base font-semibold text-slate-950">Explore more spaces</span>
            <span className="mt-1 block text-sm text-slate-500">Find real homes, templates, and ready-to-remix ideas.</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-slate-400" />
        </Link>
      </div>
    </section>
  );
}

function ContentStrip({ item }: { item: Showcase }) {
  const kind = KIND_LABELS[item.kind];
  return (
    <Link href={`/showcase/${item.id}`} className="group block">
      <article className="grid min-h-[148px] grid-cols-[150px_minmax(0,1fr)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
        <div className="relative bg-slate-100" style={{ background: item.thumbnailGradient }}>
          <div className="absolute inset-0 p-3">
            <FloorplanSVG pattern={item.thumbnailPattern} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/28 to-white/8" />
        </div>
        <div className="min-w-0 p-4">
          <div className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{kind.en}</div>
          <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-5 text-slate-950">{item.title}</h3>
          <p className="mt-2 line-clamp-1 text-xs text-slate-500">{item.subtitle}</p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>{formatNumber(item.applies)} applied</span>
            <span>{item.publishedAt}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function StartBuildingSection() {
  return (
    <section className="mt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Start Building</h2>
          <p className="mt-1 text-sm text-slate-500">Lightweight entry points for trying, creating, or adding resources.</p>
        </div>
      </div>
      <div className="mt-4 grid items-stretch gap-4 md:auto-rows-fr md:grid-cols-3">
        {START_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href} className="group flex h-full">
              <article className={cn('relative flex min-h-[172px] w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md', 'bg-gradient-to-br', card.tone)}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-slate-800 shadow-sm">
                  <Icon size={20} />
                </span>
                <div className="mt-auto pt-6">
                  <h3 className="text-base font-semibold text-slate-950">{card.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{card.desc}</p>
                </div>
                <span className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-400 transition group-hover:bg-blue-600 group-hover:text-white">
                  <ArrowRight size={14} />
                </span>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function MarketplaceSection({ items }: { items: ReturnType<typeof publicPlugins> }) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Marketplace Picks</h2>
          <p className="mt-1 text-sm text-slate-500">Useful plugins and automation packs for everyday spaces.</p>
        </div>
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-800">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map(plugin => (
          <Link key={plugin.id} href={`/marketplace?highlight=${plugin.id}`} className="group block">
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
              <div className="relative aspect-[4/3]" style={{ background: plugin.gradient }}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-white/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-white/35 bg-white/24 text-4xl shadow-xl backdrop-blur">
                    {plugin.icon}
                  </div>
                </div>
                <span className="absolute left-3 top-3 rounded-md bg-slate-950/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">{plugin.tag}</span>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-950">{plugin.name}</h3>
                <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{plugin.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="font-semibold text-emerald-600">{plugin.price}</span>
                  <span className="text-slate-400">{formatNumber(plugin.installs)} installs</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LearningSection() {
  return (
    <section className="mt-8 pb-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">Learning</h2>
          <p className="mt-1 text-sm text-slate-500">Short guides for understanding Studio, spaces, and automations.</p>
        </div>
        <Link href="/home/discover?kind=tutorial" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-800">
          More guides <ArrowRight size={14} />
        </Link>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {LEARNING.map(item => (
          <LearningCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

function LearningCard({ item }: { item: typeof LEARNING[number] }) {
  return (
    <Link href={item.href} className="group block">
      <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
        <div className="relative aspect-video bg-slate-100">
          <img src={item.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/48 text-white backdrop-blur">
            <Play size={16} fill="currentColor" />
          </span>
          <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/56 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">{item.duration}</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600">
            <GraduationCap size={13} />
            Guide
          </div>
          <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-slate-950">{item.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.desc}</p>
        </div>
      </article>
    </Link>
  );
}
