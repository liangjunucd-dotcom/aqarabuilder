'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { FormEvent, ReactNode } from 'react';
import { Crown, Plus, Search, Sparkles, Users, X } from 'lucide-react';
import { useRole, isProBuilderRole } from '@/lib/role';
import { BUSINESS_PLANS, PERSONAL_PLANS, planForRole, type Plan, type PlanScope } from '@/lib/plans';
import { BuilderAvatarMenu } from '@/components/layout/BuilderAvatarMenu';
import { UsageQuotaButton } from '@/components/usage/UsageQuotaButton';
import { cn } from '@/lib/utils';

export function UserTopBar({
  title,
  centerSlot,
  showUsage = true,
}: {
  title: string;
  centerSlot?: ReactNode;
  showUsage?: boolean;
}) {
  const { role, mounted } = useRole();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const plan = mounted ? planForRole(role) : planForRole('builder');
  const isPro = mounted && isProBuilderRole(role);
  const isAnonymous = mounted && role === 'anonymous';
  const createActive = pathname === '/home/build' || pathname.startsWith('/build');
  const [pricingOpen, setPricingOpen] = useState(false);
  const [pricingScope, setPricingScope] = useState<PlanScope>('personal');
  const [globalQuery, setGlobalQuery] = useState('');

  const runGlobalSearch = () => {
    const value = globalQuery.trim();
    router.push(value ? `/home?q=${encodeURIComponent(value)}` : '/home');
  };

  useEffect(() => {
    const syncPricingHash = () => setPricingOpen(window.location.hash === '#pricing');
    syncPricingHash();
    window.addEventListener('hashchange', syncPricingHash);
    return () => window.removeEventListener('hashchange', syncPricingHash);
  }, []);

  const openPricing = () => {
    setPricingOpen(true);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}#pricing`);
    }
  };

  const closePricing = () => {
    setPricingOpen(false);
    if (typeof window !== 'undefined' && window.location.hash === '#pricing') {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  };

  const submitGlobalSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runGlobalSearch();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-[linear-gradient(90deg,#0d1222_0%,#0d1222_48%,#17258f_100%)] px-6 text-white shadow-[0_10px_28px_rgba(2,6,23,0.18)]">
        <h1 className="sr-only">{title}</h1>

        {centerSlot ? (
          <div className="mx-auto flex min-w-[180px] max-w-3xl flex-1 items-center">
            {centerSlot}
          </div>
        ) : (
          <form onSubmit={submitGlobalSearch} className="mx-auto flex min-w-[180px] max-w-3xl flex-1 items-center">
            <div className="flex h-10 w-full items-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-sm shadow-black/20 transition focus-within:border-blue-300/80 focus-within:bg-white/20">
              <div className="pl-4">
                <Search size={16} className="text-white/60" />
              </div>
              <input
                value={globalQuery}
                onChange={event => setGlobalQuery(event.target.value)}
                onKeyDown={event => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  runGlobalSearch();
                }}
                placeholder="搜索案例、方案、插件、Builder、Studio"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                className="flex h-full w-12 items-center justify-center border-l border-white/10 bg-white/10 text-white/75 transition hover:bg-white hover:text-slate-950"
                aria-label="搜索"
              >
                <Search size={16} />
              </button>
            </div>
          </form>
        )}

        {isAnonymous ? (
          <>
            <Link
              href="/signin?redirect=%2Fhome"
              className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 sm:inline-flex"
            >
              登录
            </Link>
            <Link
              href="/signin?redirect=%2Fhome"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              开始创作
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/home/build"
              aria-current={createActive ? 'page' : undefined}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold shadow-sm transition sm:px-4',
                createActive
                  ? 'bg-white text-slate-950 shadow-black/20'
                  : 'border border-white/20 bg-white/10 text-white shadow-black/20 hover:-translate-y-0.5 hover:bg-white hover:text-slate-950'
              )}
            >
              <Plus size={17} strokeWidth={2.2} />
              <span className="hidden sm:inline">Create</span>
            </Link>
            {showUsage ? (
              <UsageQuotaButton
                showLabel
                planId={plan.id}
                professional={isPro}
                surface="dark"
              />
            ) : null}
            <BuilderAvatarMenu onOpenPricing={openPricing} />
          </>
        )}
      </header>

      {pricingOpen && (
        <PricingModal
          scope={pricingScope}
          setScope={setPricingScope}
          currentPlanId={plan.id}
          onClose={closePricing}
        />
      )}
    </>
  );
}

function PricingModal({
  scope,
  setScope,
  currentPlanId,
  onClose,
}: {
  scope: PlanScope;
  setScope: (scope: PlanScope) => void;
  currentPlanId: string;
  onClose: () => void;
}) {
  const plans = scope === 'personal' ? PERSONAL_PLANS : BUSINESS_PLANS;
  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#f7f7f7] text-slate-950">
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-[130] flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-950"
        title="关闭"
      >
        <X size={24} />
      </button>

      <main className="mx-auto max-w-7xl px-8 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">选择套餐</h2>
          <div className="mx-auto mt-8 inline-flex rounded-full bg-slate-200/70 p-1">
            <button
              onClick={() => setScope('personal')}
              className={cn('h-11 min-w-36 rounded-full px-6 text-sm font-semibold transition', scope === 'personal' ? 'bg-white shadow text-slate-950' : 'text-slate-500')}
            >
              Personal Plans
            </button>
            <button
              onClick={() => setScope('business')}
              className={cn('h-11 min-w-36 rounded-full px-6 text-sm font-semibold transition', scope === 'business' ? 'bg-white shadow text-slate-950' : 'text-slate-500')}
            >
              Business Plans
            </button>
          </div>
        </div>

        <div className={cn('mt-10 grid gap-6', plans.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3')}>
          {plans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} current={plan.id === currentPlanId} />
          ))}
        </div>
      </main>
    </div>
  );
}

function planCtaHref(plan: Plan, current: boolean) {
  if (plan.id === 'free') return '/home';
  if (plan.id === 'pro') {
    return current ? '/pro/personal/home?demo_as=pro' : '/onboarding?intent=professional_profile&plan=pro&from=%2Fhome';
  }
  if (plan.id === 'business' || plan.id === 'enterprise') {
    return `/pro/workspaces?new=1&plan=${plan.id}`;
  }
  return '/home';
}

function planCtaLabel(plan: Plan, current: boolean) {
  if (current && plan.id === 'pro') return '进入 Builder Pro';
  if (current) return '当前套餐';
  if (plan.id === 'pro') return 'Upgrade to Pro';
  return plan.ctaLabel;
}

function PlanCard({ plan, index, current }: { plan: Plan; index: number; current: boolean }) {
  const primary = plan.id === 'pro' || plan.id === 'enterprise';
  const features = plan.features.slice(0, 7);
  return (
    <article className="flex min-h-[520px] flex-col rounded-[22px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl font-semibold tracking-tight">{plan.name}</h3>
          <div className="mt-3 text-sm font-medium text-slate-500">{plan.tagline}</div>
        </div>
        {current ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">当前</span>
        ) : null}
      </div>

      <div className="mt-9">
        <div className="flex items-end gap-2">
          <span className="text-5xl font-semibold tracking-tight">{plan.monthly === 0 ? '$0' : plan.priceLabel}</span>
          {plan.monthly >= 0 ? <span className="pb-1 text-sm text-slate-500">/ 月</span> : null}
        </div>
        <div className="mt-5 text-base font-semibold">{plan.audience[0]}</div>
      </div>

      <Link
        href={planCtaHref(plan, current)}
        className={cn(
          'mt-8 flex h-12 items-center justify-center rounded-full border text-sm font-semibold transition',
          primary ? 'border-slate-950 bg-slate-950 text-white hover:bg-blue-700 hover:border-blue-700' : 'border-slate-300 text-slate-900 hover:border-slate-950'
        )}
      >
        {planCtaLabel(plan, current)}
      </Link>

      <div className="mt-8 space-y-4">
        {features.map(feature => (
          <div key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
            {index === 0 ? <Sparkles size={17} className="mt-1 shrink-0 text-slate-700" /> : index === 1 ? <Crown size={17} className="mt-1 shrink-0 text-slate-700" /> : <Users size={17} className="mt-1 shrink-0 text-slate-700" />}
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
