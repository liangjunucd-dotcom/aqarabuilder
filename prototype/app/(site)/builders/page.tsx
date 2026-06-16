'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Building2, MapPin, Search, ShieldCheck, Users2, Wrench } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Footer } from '@/components/layout/Footer';
import { ACBs, type ACB, type CountryCode } from '@/lib/mock/acbs';
import { cn } from '@/lib/utils';

type FinderMode = 'remote' | 'local';
type CapabilityFilter = 'all' | 'design' | 'support' | 'integration' | 'installation' | 'service';
type SortMode = 'recommended' | 'rating' | 'projects' | 'deployments';

const COUNTRY_META: Record<CountryCode, { label: string; flag: string }> = {
  CN: { label: '中国', flag: '🇨🇳' },
  KR: { label: '韩国', flag: '🇰🇷' },
  AE: { label: '阿联酋', flag: '🇦🇪' },
  IT: { label: '意大利', flag: '🇮🇹' },
  US: { label: '美国', flag: '🇺🇸' },
  JP: { label: '日本', flag: '🇯🇵' },
  DE: { label: '德国', flag: '🇩🇪' },
};

const MODE_COPY = {
  remote: {
    title: '远程专家',
    eyebrow: 'Remote Expert',
    description: '适合方案设计、审图、自动化建议、插件集成和授权远程诊断。可以跨市场协作，但会受语言、时区和数据授权限制。',
    cta: '请求远程协助',
  },
  local: {
    title: '本地交付',
    eyebrow: 'Local Delivery',
    description: '适合上门勘测、布线、安装、调试、验收和售后维护。真正的现场实施必须落回项目所在地。',
    cta: '请求本地交付',
  },
} as const;

const CAPABILITY_OPTIONS: { id: CapabilityFilter; label: string }[] = [
  { id: 'all', label: '全部能力' },
  { id: 'design', label: '方案设计' },
  { id: 'support', label: '远程调优' },
  { id: 'integration', label: '插件集成' },
  { id: 'installation', label: '安装调试' },
  { id: 'service', label: '售后维护' },
];

function supportsRemote(acb: ACB) {
  return acb.subRoles.includes('Designer') || acb.subRoles.includes('Developer') || acb.subRoles.includes('Service');
}

function supportsLocal(acb: ACB) {
  return acb.subRoles.includes('Certified Installer') || acb.subRoles.includes('Service');
}

function matchCapability(acb: ACB, capability: CapabilityFilter, mode: FinderMode) {
  if (capability === 'all') return true;
  if (capability === 'design') return acb.subRoles.includes('Designer');
  if (capability === 'support') return mode === 'remote' && acb.subRoles.includes('Service');
  if (capability === 'integration') return mode === 'remote' && acb.subRoles.includes('Developer');
  if (capability === 'installation') return mode === 'local' && acb.subRoles.includes('Certified Installer');
  if (capability === 'service') return acb.subRoles.includes('Service');
  return true;
}

function languagesFor(country: CountryCode) {
  if (country === 'CN') return ['中文', 'English'];
  if (country === 'KR') return ['한국어', 'English'];
  if (country === 'AE') return ['العربية', 'English'];
  if (country === 'IT') return ['Italiano', 'English'];
  if (country === 'JP') return ['日本語', 'English'];
  if (country === 'DE') return ['Deutsch', 'English'];
  return ['English'];
}

function remoteServicesFor(acb: ACB) {
  const items: string[] = [];
  if (acb.subRoles.includes('Designer')) items.push('方案设计');
  if (acb.subRoles.includes('Developer')) items.push('插件集成');
  if (acb.subRoles.includes('Service')) items.push('远程调优');
  return items;
}

function localServicesFor(acb: ACB) {
  const items: string[] = [];
  if (acb.subRoles.includes('Certified Installer')) items.push('安装调试');
  if (acb.subRoles.includes('Service')) items.push('售后维护');
  if (acb.subRoles.includes('Designer')) items.push('现场勘测');
  return items;
}

export default function BuildersPage() {
  const [mode, setMode] = useState<FinderMode>('remote');
  const [country, setCountry] = useState<'all' | CountryCode>('all');
  const [capability, setCapability] = useState<CapabilityFilter>('all');
  const [acceptingOnly, setAcceptingOnly] = useState(true);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortMode>('recommended');

  const filtered = useMemo(() => {
    const matched = ACBs.filter(acb => {
      if (mode === 'remote' && !supportsRemote(acb)) return false;
      if (mode === 'local' && !supportsLocal(acb)) return false;
      if (country !== 'all' && acb.country !== country) return false;
      if (acceptingOnly && !acb.acceptingClients) return false;
      if (!matchCapability(acb, capability, mode)) return false;
      if (query.trim()) {
        const haystack = [acb.name, acb.nameLocal, acb.city, acb.affiliatedStore, acb.bio, ...acb.subRoles].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(query.trim().toLowerCase())) return false;
      }
      return true;
    });

    return matched.sort((a, b) => {
      if (sortBy === 'rating') return b.stats.rating - a.stats.rating;
      if (sortBy === 'projects') return b.stats.projects - a.stats.projects;
      if (sortBy === 'deployments') return b.stats.studiosDeployed - a.stats.studiosDeployed;

      const score = (item: ACB) => {
        const availability = item.acceptingClients ? 120 : 0;
        const capabilityFit = matchCapability(item, capability, mode) ? 60 : 0;
        const locality = country !== 'all' && item.country === country ? 80 : 0;
        const serviceDepth = item.subRoles.length * 14;
        return availability + capabilityFit + locality + item.stats.rating * 20 + item.stats.projects + serviceDepth;
      };

      return score(b) - score(a);
    });
  }, [acceptingOnly, capability, country, mode, query, sortBy]);

  const remoteCount = ACBs.filter(supportsRemote).length;
  const localCount = ACBs.filter(supportsLocal).length;
  const marketCount = new Set(ACBs.map(item => item.country)).size;

  return (
    <>
      <TopNav />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 hero-glow opacity-45 pointer-events-none" />
          <div className="absolute inset-0 grid-pattern opacity-20 mask-fade-b pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-6 py-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-2xs text-accent-glow">
                  <Users2 size={12} />
                  Find Professionals
                </div>
                <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
                  远程专家与本地交付，
                  <br />
                  用同一张网络来完成。
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
                  你可以先找远程专家完成方案、审图和调优，再把项目交给本地 Installer、Partner 或 Aqara Space 执行。
                  对外只展示公开服务能力，不暴露复杂后台上下文。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <MetricCard label="远程专家" value={`${remoteCount}`} hint="跨市场提供设计与调优" />
                <MetricCard label="本地交付" value={`${localCount}`} hint="面向实施、验收与售后" />
                <MetricCard label="覆盖市场" value={`${marketCount}`} hint="按项目所在地继续匹配" />
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <ModeCard
                active={mode === 'remote'}
                eyebrow="Remote Expert"
                title="远程专家"
                desc="跨区域完成方案设计、审图、插件集成和远程诊断。"
                onClick={() => setMode('remote')}
              />
              <ModeCard
                active={mode === 'local'}
                eyebrow="Local Delivery"
                title="本地交付"
                desc="按项目所在地匹配安装、调试、验收与售后能力。"
                onClick={() => setMode('local')}
              />
              <ModeCard
                active={false}
                eyebrow="Handoff"
                title="交付接力"
                desc="远程专家完成方案后，可继续衔接本地实施和维护。"
                onClick={() => setMode('local')}
              />
            </div>
          </div>
        </section>

        <section className="sticky top-14 z-40 border-b border-border bg-bg/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3">
            <div className="relative min-w-[220px] flex-1 md:max-w-[280px]">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={mode === 'remote' ? '搜索专家、城市、能力' : '搜索交付方、门店、城市'}
                className="w-full rounded-lg border border-border bg-bg-elevated/40 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-border-strong"
              />
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg-elevated/40 p-1">
              {(['remote', 'local'] as FinderMode[]).map(item => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs transition',
                    mode === item ? 'bg-white/10 text-text' : 'text-text-muted hover:text-text'
                  )}
                >
                  {MODE_COPY[item].title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-elevated/40 p-1 overflow-x-auto">
              <button
                onClick={() => setCountry('all')}
                className={cn(
                  'whitespace-nowrap rounded-md px-2.5 py-1 text-xs transition',
                  country === 'all' ? 'bg-white/10 text-text' : 'text-text-muted hover:text-text'
                )}
              >
                🌐 全球
              </button>
              {Object.entries(COUNTRY_META).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setCountry(key as CountryCode)}
                  className={cn(
                    'whitespace-nowrap rounded-md px-2.5 py-1 text-xs transition',
                    country === key ? 'bg-white/10 text-text' : 'text-text-muted hover:text-text'
                  )}
                >
                  {value.flag} {value.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {CAPABILITY_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => setCapability(option.id)}
                  className={cn(
                    'whitespace-nowrap rounded-full border px-2.5 py-1 text-2xs transition',
                    capability === option.id
                      ? 'border-accent/30 bg-accent/10 text-accent-glow'
                      : 'border-border text-text-muted hover:text-text'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAcceptingOnly(value => !value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs transition',
                acceptingOnly
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-border text-text-muted hover:text-text'
              )}
            >
              {acceptingOnly ? '仅看可接单' : '显示全部'}
            </button>

            <div className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border bg-bg-elevated/40 p-1">
              {[
                { id: 'recommended', label: '综合推荐' },
                { id: 'rating', label: '评分' },
                { id: 'projects', label: '项目经验' },
                { id: 'deployments', label: '部署量' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSortBy(item.id as SortMode)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-2xs transition',
                    sortBy === item.id ? 'bg-white/10 text-text' : 'text-text-muted hover:text-text'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">{MODE_COPY[mode].title}</div>
                <div className="mt-1 max-w-2xl text-sm leading-relaxed text-text-muted">
                  {MODE_COPY[mode].description}
                </div>
              </div>
              <div className="text-right text-2xs text-text-subtle">
                <div>
                  当前匹配 <span className="num text-text">{filtered.length}</span> 位
                </div>
                <div className="mt-1">
                  排序方式：<span className="text-text">{sortBy === 'recommended' ? '综合推荐' : sortBy === 'rating' ? '评分优先' : sortBy === 'projects' ? '项目经验优先' : '部署量优先'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((acb, index) => (
                <motion.div
                  key={acb.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <ProCard acb={acb} mode={mode} />
                </motion.div>
              ))}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 self-start">
            <SideBlock title="匹配原则" icon={BadgeCheck}>
              <div className="space-y-3 text-sm text-text-muted">
                <p>远程专家优先看语言、能力标签、作品与评分。</p>
                <p>本地交付优先看项目所在地、认证能力、服务责任与可实施性。</p>
                <p>大型项目可以先找远程专家，再把交付包交给本地团队接力。</p>
              </div>
            </SideBlock>

            <SideBlock title="适合当前模式的需求" icon={mode === 'remote' ? Users2 : Wrench}>
              <div className="space-y-3">
                {(mode === 'remote'
                  ? [
                      '方案设计与空间布局',
                      '自动化建议与审图',
                      '插件集成与远程调试',
                    ]
                  : [
                      '现场勘测与布线',
                      '设备安装、点位绑定与验收',
                      '售后维护与长期服务',
                    ]
                ).map(item => (
                  <div key={item} className="rounded-2xl border border-border bg-white/[0.03] px-3 py-2 text-sm text-text-muted">
                    {item}
                  </div>
                ))}
              </div>
            </SideBlock>

            <SideBlock title="继续下一步" icon={ShieldCheck}>
              <div className="space-y-3">
                <NextStep href="/home/discover" title="先看案例" desc="先浏览真实空间，判断是否需要专业人继续介入。" />
                <NextStep href="/marketplace" title="看能力目录" desc="继续了解插件、模板与授权边界。" />
                <NextStep href="/academy" title="了解认证体系" desc="查看 Builder、Installer、Developer 的能力路径。" />
              </div>
            </SideBlock>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ProCard({ acb, mode }: { acb: ACB; mode: FinderMode }) {
  const services = mode === 'remote' ? remoteServicesFor(acb) : localServicesFor(acb);
  return (
    <Link href={`/u/${acb.handle}`} className="block card overflow-hidden transition hover:border-border-strong">
      <div className="h-24" style={{ background: acb.cover }}>
        <div className="h-full grid-pattern opacity-30" />
      </div>

      <div className="px-5 pb-5 -mt-8">
        <img src={acb.avatar} alt={acb.name} className="h-14 w-14 rounded-xl ring-4 ring-bg-elevated" />

        <div className="mt-3 flex items-center gap-2">
          <h3 className="text-base font-semibold">{acb.name}</h3>
          <span className="rounded-full border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-2xs text-accent-glow">
            {acb.level}
          </span>
          <span
            className={cn(
              'rounded-full border px-1.5 py-0.5 text-2xs',
              acb.acceptingClients
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-border text-text-subtle'
            )}
          >
            {acb.acceptingClients ? '可接单' : '需预约'}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1 text-2xs text-text-muted">
          <MapPin size={11} />
          {acb.countryFlag} {acb.city}
        </div>

        <div className="mt-1 flex items-center gap-1 text-2xs text-text-subtle">
          <Building2 size={11} />
          {acb.affiliatedStore}
        </div>

        {mode === 'remote' && (
          <div className="mt-3 flex flex-wrap gap-1">
            {languagesFor(acb.country).map(item => (
              <span key={item} className="rounded-full border border-border bg-white/[0.03] px-2 py-0.5 text-2xs text-text-muted">
                {item}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {services.map(item => (
            <span key={item} className="rounded-full border border-border bg-white/[0.03] px-2 py-0.5 text-2xs text-text-muted">
              {item}
            </span>
          ))}
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-muted">{acb.bio}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-white/[0.03] p-3 text-center">
          <Stat label="项目" value={`${acb.stats.projects}`} />
          <Stat label="部署" value={`${acb.stats.studiosDeployed}`} />
          <Stat label="评分" value={`★ ${acb.stats.rating}`} />
        </div>

        <div className="mt-3 rounded-2xl border border-border bg-white/[0.03] px-3 py-2 text-2xs text-text-muted">
          {mode === 'remote'
            ? `支持 ${languagesFor(acb.country).join(' / ')} · 通常 24 小时内响应`
            : `适合 ${COUNTRY_META[acb.country].label} 本地实施 · 可衔接验收与售后`}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={event => event.preventDefault()}
            className="rounded-md border border-border bg-white/[0.03] px-3 py-2 text-2xs text-text-muted transition hover:border-border-strong hover:text-text"
          >
            查看资料
          </button>
          <button
            onClick={event => event.preventDefault()}
            className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-2xs text-accent-glow transition hover:bg-accent/15"
          >
            {MODE_COPY[mode].cta}
          </button>
        </div>
      </div>
    </Link>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card p-4">
      <div className="text-2xs text-text-subtle">{label}</div>
      <div className="mt-2 text-2xl font-semibold num">{value}</div>
      <div className="mt-1 text-2xs text-text-muted">{hint}</div>
    </div>
  );
}

function ModeCard({
  active,
  eyebrow,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  eyebrow: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'card text-left p-4 transition',
        active && 'border-accent/40 bg-accent/[0.06]'
      )}
    >
      <div className="text-2xs uppercase tracking-[0.16em] text-text-subtle">{eyebrow}</div>
      <div className="mt-2 text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-text-muted">{desc}</div>
    </button>
  );
}

function SideBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof BadgeCheck;
  children: ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon size={14} className="text-accent-glow" />
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function NextStep({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block rounded-2xl border border-border bg-white/[0.03] p-3 transition hover:border-border-strong">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-2xs leading-relaxed text-text-muted">{desc}</div>
      <div className="mt-3 inline-flex items-center gap-1 text-2xs text-accent-glow">
        继续前往
        <ArrowRight size={10} />
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xs text-text-subtle">{label}</div>
      <div className="mt-1 text-sm font-semibold num">{value}</div>
    </div>
  );
}
