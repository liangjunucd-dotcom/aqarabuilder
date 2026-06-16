'use client';

import Link from 'next/link';
import { notFound, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Calendar,
  Grid2x2,
  Mail,
  MapPin,
  MessageCircle,
  PlaySquare,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Users,
} from 'lucide-react';
import { HomeShell } from '@/components/layout/HomeShell';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import { getACB, ACBs } from '@/lib/mock/acbs';
import { MyIdeabooks } from '@/lib/mock/ideabooks';
import { Showcases } from '@/lib/mock/showcases';
import { MARKET_ASSETS } from '@/lib/mock/commerce';
import { setRole as setDemoRole } from '@/lib/role';
import { cn, formatNumber } from '@/lib/utils';

interface Props {
  params: { handle: string };
}

type ProfileTab = 'home' | 'works' | 'services' | 'plugins' | 'about';

const TABS: Array<{ id: ProfileTab; label: string }> = [
  { id: 'home', label: '首页' },
  { id: 'works', label: '方案' },
  { id: 'services', label: '服务' },
  { id: 'plugins', label: '插件' },
  { id: 'about', label: '关于' },
];

export default function ACBProfilePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f8fb]" />}>
      <ACBProfilePageContent params={params} />
    </Suspense>
  );
}

function ACBProfilePageContent({ params }: Props) {
  const acb = getACB(params.handle);
  if (!acb) notFound();

  const searchParams = useSearchParams();
  const isPersonalProfile = searchParams?.get('profile') === 'personal';
  const [tab, setTab] = useState<ProfileTab>('home');
  const [query, setQuery] = useState('');
  const works = useMemo(() => Showcases.filter(item => item.authorHandle === acb.handle), [acb.handle]);
  const recommended = useMemo(() => ACBs.filter(item => item.handle !== acb.handle && item.acceptingClients).slice(0, 4), [acb.handle]);
  const creatorAssets = useMemo(() => {
    const direct = MARKET_ASSETS.filter(item => item.publisher.includes(acb.name.split(' ')[0]) || item.provider?.includes(acb.name.split(' ')[0]));
    return direct.length ? direct.slice(0, 4) : MARKET_ASSETS.filter(item => item.featured).slice(0, 4);
  }, [acb.name]);

  const normalized = query.trim().toLowerCase();
  const visibleWorks = works.filter(item => {
    if (!normalized) return true;
    return [item.title, item.subtitle, item.size, item.budget].join(' ').toLowerCase().includes(normalized);
  });

  if (isPersonalProfile) {
    return <PersonalUserProfile />;
  }

  return (
    <HomeShell>
      <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
        <UserTopBar
          title={`${acb.name} 的主页`}
          centerSlot={(
            <label className="flex h-10 w-full items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 shadow-sm shadow-black/20 transition focus-within:border-blue-300/80 focus-within:bg-white/20">
              <Search size={16} className="text-white/60" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="搜索这个主页的方案、服务与插件"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
            </label>
          )}
        />

        <main className="mx-auto max-w-[1440px] px-6 py-6">
          <section className="rounded-[30px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
            <div className="relative h-52 overflow-hidden rounded-t-[30px]" style={{ background: acb.cover }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.25),transparent_26%),linear-gradient(90deg,rgba(15,23,42,0.12),rgba(15,23,42,0.46))]" />
              <div className="absolute left-8 top-8 rounded-full border border-white/22 bg-black/28 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                Aqara Builder Channel
              </div>
            </div>

            <div className="px-7 py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={acb.avatar}
                    alt={acb.name}
                    className="h-28 w-28 rounded-full border border-slate-200 bg-white shadow-lg shadow-slate-200/80"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{acb.name}</h1>
                      {acb.nameLocal ? <span className="text-xl text-slate-400">{acb.nameLocal}</span> : null}
                      <BadgeCheck size={22} className="text-blue-600" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>@{acb.handle}</span>
                      <span>{formatNumber(acb.stats.applies)} 次方案应用</span>
                      <span>{formatNumber(acb.stats.clients)} 位客户</span>
                      <span>{acb.stats.rating.toFixed(2)} 评分</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Pill icon={ShieldCheck}>{acb.level} Certified Builder</Pill>
                      {acb.subRoles.map(role => <Pill key={role}>{role}</Pill>)}
                      <Pill icon={MapPin}>{acb.countryFlag} {acb.city}</Pill>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {acb.acceptingClients ? (
                    <button className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-blue-700">
                      <Sparkles size={15} />
                      请求协助
                    </button>
                  ) : null}
                  <button className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-slate-300">
                    <Mail size={15} />
                    联系
                  </button>
                  <button className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-slate-300">
                    <Star size={15} />
                    关注
                  </button>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="max-w-3xl text-sm leading-6 text-slate-600">{acb.bio}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="项目" value={formatNumber(acb.stats.projects)} icon={BriefcaseBusiness} />
                <StatCard label="Studio" value={formatNumber(acb.stats.studiosDeployed)} icon={Grid2x2} />
                <StatCard label="应用" value={formatNumber(acb.stats.applies)} icon={PlaySquare} />
                <StatCard label="客户" value={formatNumber(acb.stats.clients)} icon={Users} />
                <StatCard label="评分" value={acb.stats.rating.toFixed(1)} icon={Star} />
              </div>
            </div>
          </section>

          <section className="sticky top-14 z-20 mt-5 border-b border-slate-200 bg-[#f7f8fb]/92 backdrop-blur-xl">
            <div className="flex items-center gap-6 overflow-x-auto">
              {TABS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'h-12 whitespace-nowrap border-b-2 px-1 text-sm font-semibold transition',
                    tab === item.id ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
              {(tab === 'home' || tab === 'works') && (
                <Panel title="精选方案" action={<Link href="/home/discover" className="text-xs font-semibold text-blue-700">更多案例</Link>}>
                  {visibleWorks.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {visibleWorks.map(item => (
                        <WorkCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="暂无匹配方案" text="换一个关键词，或查看这位 Builder 的服务与插件。" />
                  )}
                </Panel>
              )}

              {(tab === 'home' || tab === 'services') && (
                <Panel title="可预约服务">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ServiceCard title="远程诊断与调优" meta="授权会话 · 1-2 小时" desc="检查 Studio 运行、协议连接、自动化日志与关键点位映射。" />
                    <ServiceCard title="户型与点位复核" meta="Design Platform · 方案复核" desc="基于户型图、设备清单和预算，复核设备点位与覆盖范围。" />
                    <ServiceCard title="现场交付协同" meta={`${acb.city} · Aqara Space`} desc="结合本地 Installer 或门店服务，完成安装、调试和交付确认。" />
                    <ServiceCard title="季度健康巡检" meta="服务包 · 可续约" desc="定期检查设备健康、场景命中率与用户体验，形成可追踪报告。" />
                  </div>
                </Panel>
              )}

              {(tab === 'home' || tab === 'plugins') && (
                <Panel title="插件与模板">
                  <div className="grid gap-4 md:grid-cols-2">
                    {creatorAssets.map(asset => (
                      <Link
                        key={asset.id}
                        href={`/marketplace?highlight=${asset.id}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-slate-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-950">{asset.name}</div>
                            <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{asset.summary}</div>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {asset.creditCost > 0 ? `${asset.creditCost}` : 'Free'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Panel>
              )}

              {tab === 'about' && (
                <Panel title="关于">
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoRow icon={Store} label="服务组织" value={acb.affiliatedStore} />
                    <InfoRow icon={MapPin} label="服务区域" value={`${acb.countryFlag} ${acb.city}`} />
                    <InfoRow icon={Calendar} label="加入时间" value={`${acb.joinedYear}`} />
                    <InfoRow icon={Award} label="认证等级" value={`${acb.level} · ${acb.subRoles.join(' / ')}`} />
                  </div>
                </Panel>
              )}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-[128px] lg:self-start">
              <Panel title="认证">
                <div className="space-y-2">
                  {acb.badges.map(badge => (
                    <div key={`${badge.name}-${badge.year}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="text-sm font-semibold text-slate-900">{badge.name}</div>
                      <div className="text-xs text-slate-500">{badge.level ?? badge.year}</div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="推荐 Builder">
                <div className="space-y-3">
                  {recommended.map(item => (
                    <Link key={item.id} href={`/u/${item.handle}`} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-50">
                      <img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-full bg-slate-100" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-950">{item.name}</div>
                        <div className="truncate text-xs text-slate-500">{item.countryFlag} {item.city}</div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400" />
                    </Link>
                  ))}
                </div>
              </Panel>
            </aside>
          </section>
        </main>
      </div>
    </HomeShell>
  );
}

function PersonalUserProfile() {
  const publicIdeabooks = MyIdeabooks.slice(0, 3);
  const recentSaves = Showcases.slice(0, 3);

  useEffect(() => {
    setDemoRole('builder');
  }, []);

  return (
    <HomeShell>
      <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
        <UserTopBar title="Jun 的用户档案" />

        <main className="mx-auto max-w-[1180px] px-6 py-6">
          <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
            <div className="relative h-44 bg-[radial-gradient(circle_at_18%_22%,rgba(37,99,235,0.16),transparent_32%),linear-gradient(135deg,#ffffff,#eef6ff)]">
              <div className="absolute left-8 top-8 rounded-full border border-blue-100 bg-white/82 px-3 py-1 text-xs font-semibold text-blue-700 backdrop-blur-md">
                Personal Profile
              </div>
            </div>

            <div className="px-7 py-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="-mt-16 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-teal-500 text-4xl font-semibold text-white shadow-lg shadow-slate-200/80">
                    J
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Jun</h1>
                    <div className="mt-2 text-sm text-slate-500">@jun · Community User</div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      喜欢空间智能、自动化和真实家庭场景。这里是个人用户档案，用于展示灵感本、收藏和社区活动。
                    </p>
                  </div>
                </div>

                <Link
                  href="/home/profile"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-200/70 transition hover:border-slate-300"
                >
                  Account Settings
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <StatCard label="灵感本" value={publicIdeabooks.length.toString()} icon={Sparkles} />
                <StatCard label="收藏案例" value={recentSaves.length.toString()} icon={Grid2x2} />
                <StatCard label="社区活动" value="12" icon={MessageCircle} />
              </div>
            </div>
          </section>

          <section className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <Panel title="灵感本">
                <div className="grid gap-4 md:grid-cols-3">
                  {publicIdeabooks.map(book => (
                    <Link key={book.id} href={`/home/ideas/${book.id}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-slate-300">
                      <div className="flex h-28 items-end rounded-2xl p-4 text-3xl" style={{ background: book.gradient }}>
                        {book.emoji}
                      </div>
                      <div className="mt-4 text-sm font-semibold text-slate-950">{book.title}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">{book.description}</div>
                    </Link>
                  ))}
                </div>
              </Panel>

              <Panel title="最近收藏">
                <div className="grid gap-5 md:grid-cols-3">
                  {recentSaves.map(item => (
                    <WorkCard key={item.id} item={item} />
                  ))}
                </div>
              </Panel>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-[88px] lg:self-start">
              <Panel title="关于">
                <div className="space-y-3">
                  <InfoRow icon={MapPin} label="地区" value="中国 · 上海" />
                  <InfoRow icon={Calendar} label="加入时间" value="2026" />
                  <InfoRow icon={Store} label="账号类型" value="Aqara Builder User" />
                </div>
              </Panel>

              <section className="rounded-[26px] border border-blue-200 bg-blue-50 p-5">
                <div className="text-sm font-semibold text-blue-800">成为专业人</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  转换后会进入 Builder Pro Onboarding，并新增 Professional Profile。
                </p>
                <Link
                  href="/home/profile"
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Go to Account Settings
                </Link>
              </section>
            </aside>
          </section>
        </main>
      </div>
    </HomeShell>
  );
}

function Pill({ children, icon: Icon }: { children: React.ReactNode; icon?: typeof ShieldCheck }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
      {Icon ? <Icon size={12} className="text-blue-600" /> : null}
      {children}
    </span>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Star }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Icon size={13} className="text-blue-600" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function WorkCard({ item }: { item: (typeof Showcases)[number] }) {
  return (
    <Link href={`/showcase/${item.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60 transition group-hover:-translate-y-0.5 group-hover:border-slate-300">
        <div className="relative aspect-[16/10] bg-slate-950" style={{ background: item.thumbnailGradient }}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.42))]" />
          <div className="absolute inset-0 p-4">
            <FloorplanSVG pattern={item.thumbnailPattern} />
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            {item.linkedSolutionId ? '可 Remix' : '案例'}
          </span>
        </div>
        <div className="p-4">
          <div className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950 group-hover:text-blue-700">{item.title}</div>
          <div className="mt-2 text-xs text-slate-500">{item.size} · {item.devices} 台设备</div>
        </div>
      </div>
    </Link>
  );
}

function ServiceCard({ title, meta, desc }: { title: string; meta: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-950">{title}</div>
          <div className="mt-1 text-xs text-blue-700">{meta}</div>
        </div>
        <MessageCircle size={16} className="text-slate-400" />
      </div>
      <div className="mt-3 text-xs leading-5 text-slate-500">{desc}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Store; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="mt-0.5 truncate text-sm font-semibold text-slate-950">{value}</div>
      </div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{text}</div>
    </div>
  );
}
