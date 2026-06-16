'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  MapPin,
  Star,
  Filter,
  CheckCircle2,
  Heart,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  Globe2,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { ACBs } from '@/lib/mock/acbs';
import { cn, formatNumber } from '@/lib/utils';

const SPECIALTIES = ['全部', '适老化', '亲子', '极客', '租房', '别墅', '极简', '繁奢'];

export default function FindProPage() {
  const [specialty, setSpecialty] = useState('全部');
  const [city, setCity] = useState('上海');

  return (
    <div className="min-h-screen">
      <UserTopBar title="Find Pros" />

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 hero-glow opacity-50 pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 text-2xs px-2.5 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent-glow mb-4">
            <CheckCircle2 size={11} /> 全球 5,247 位 Aqara Certified Installer
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            找一位专业人士帮你<br />
            <span className="text-gradient-brand">把家变成你想要的样子</span>
          </h1>
          <p className="mt-4 text-text-muted max-w-xl mx-auto">
            填一份需求 → 5 位匹配的本地 Builder 报价 → 选最合适的合作。<br />
            所有 Builder 经 Aqara 认证 + 用户评分约束。
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Quick Quote CTA */}
        <div className="card p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent2/10 pointer-events-none" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-accent-glow" />
                <span className="text-2xs text-accent-glow font-medium">智能匹配 · 推荐方式</span>
              </div>
              <h2 className="text-xl font-semibold">把灵感本一键发给 Builder,免填问卷</h2>
              <p className="mt-2 text-sm text-text-muted">
                选一个你已经在收藏的 Ideabook,我们会自动提取需求(户型 / 风格 / 预算),分发给 3–5 位匹配的本地 Builder。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="px-4 py-2.5 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-sm font-medium inline-flex items-center justify-center gap-1.5">
                <Lightbulb size={14} /> 用 Ideabook 询价
              </button>
              <button className="px-4 py-2.5 rounded-md border border-border hover:border-border-strong text-sm inline-flex items-center justify-center gap-1.5">
                <MessageSquare size={14} /> 填表单询价
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              placeholder="搜索 Builder 名 / Handle / 作品..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none"
            />
          </div>
          <button className="px-3 py-2.5 text-sm rounded-md border border-border hover:border-border-strong inline-flex items-center gap-1.5">
            <MapPin size={13} /> {city}
          </button>
          <button className="px-3 py-2.5 text-sm rounded-md border border-border hover:border-border-strong inline-flex items-center gap-1.5">
            <Filter size={13} /> 筛选
          </button>
        </div>

        {/* Specialty pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-full border transition whitespace-nowrap',
                s === specialty
                  ? 'border-accent/60 bg-accent/10 text-text'
                  : 'border-border bg-bg-elevated/50 text-text-muted hover:border-border-strong hover:text-text'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="text-2xs text-text-muted mb-3">
          找到 <span className="num text-text">{ACBs.length}</span> 位 Builder
          <span className="text-text-subtle ml-2">· 按"匹配度"排序</span>
        </div>

        {/* Builder list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACBs.map((b, i) => (
            <motion.div
              key={b.handle}
              initial={{ y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <BuilderCard b={b} />
            </motion.div>
          ))}
        </div>

        {/* Become a builder */}
        <div className="mt-12 card p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-accent/10 pointer-events-none" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className="text-2xs text-success font-medium mb-2 inline-flex items-center gap-1">
                🌟 Creator Path
              </div>
              <h3 className="text-lg font-semibold">你也是装修 / 智能家居从业者?</h3>
              <p className="mt-1 text-sm text-text-muted">
                成为 Aqara Certified Installer,接 Lead、做项目、获得 Aqara 全球网络曝光。
              </p>
            </div>
            <Link
              href="/onboarding"
              className="px-4 py-2.5 rounded-md border border-success/40 bg-success/10 text-success text-sm font-medium hover:bg-success/15 transition inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Globe2 size={13} /> 7 步申请 Verified
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function BuilderCard({ b }: { b: typeof ACBs[0] }) {
  return (
    <div className="card card-hover overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <img src={b.avatar} alt={b.name} className="w-14 h-14 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium leading-tight truncate">{b.name}</h3>
              <span className="text-2xs text-accent-glow inline-flex items-center" title="Verified">
                <CheckCircle2 size={11} />
              </span>
            </div>
            <div className="text-2xs text-text-muted mt-0.5 truncate">@{b.handle}</div>
            <div className="text-2xs text-text-muted mt-0.5 truncate">
              {b.countryFlag} {b.city}
            </div>
          </div>
          <button className="p-1.5 rounded text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition">
            <Heart size={13} />
          </button>
        </div>

        <p className="mt-3 text-2xs text-text-muted leading-relaxed line-clamp-2">{b.bio}</p>

        <div className="mt-3 flex flex-wrap gap-1">
          {b.subRoles.slice(0, 3).map(t => (
            <span key={t} className="text-2xs px-1.5 py-0.5 rounded bg-white/5 border border-border text-text-muted">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
          <Stat n={`L${b.level}`} l="等级" />
          <Stat n={`★ ${b.stats.rating}`} l="评分" />
          <Stat n={formatNumber(b.stats.applies)} l="Applies" />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/u/${b.handle}`}
            className="flex-1 px-3 py-2 text-xs rounded-md border border-border hover:border-border-strong text-center"
          >
            看作品
          </Link>
          <button className="flex-1 px-3 py-2 text-xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white font-medium inline-flex items-center justify-center gap-1.5">
            <MessageSquare size={11} /> 联系
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-sm font-medium num">{n}</div>
      <div className="text-2xs text-text-subtle">{l}</div>
    </div>
  );
}
