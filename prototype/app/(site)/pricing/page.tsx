'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Sparkles, Crown, Building2, Users, ShieldCheck, ArrowRight, Lock, Star,
  ChevronDown,
} from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Footer } from '@/components/layout/Footer';
import {
  PERSONAL_PLANS,
  BUSINESS_PLANS,
  planForRole,
  type Plan,
  type PlanScope,
} from '@/lib/plans';
import { useRole } from '@/lib/role';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const [scope, setScope] = useState<PlanScope>('personal');
  const { role, mounted } = useRole();

  const currentPlanId = planForRole(mounted ? role : 'builder').id;

  const plans = scope === 'personal' ? PERSONAL_PLANS : BUSINESS_PLANS;

  return (
    <>
      <TopNav />

      <main className="min-h-screen pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 hero-glow opacity-50 pointer-events-none" />
          <div className="absolute inset-0 grid-pattern opacity-20 mask-fade-b pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-2xs text-accent-glow mb-4">
              <Sparkles size={11} /> Aqara Builder · Plans
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              套餐不是身份，Builder Pro 是专业工作台
            </h1>
            <p className="mt-3 max-w-xl mx-auto text-sm text-text-muted leading-relaxed">
              前台个人体验和 Pro 工作台共用 Personal Workspace。团队、服务商门店和企业能力通过 Team Workspace 的计划、标签、认证和政策叠加。
            </p>
          </div>

          {/* Family Tabs */}
          <div className="relative max-w-3xl mx-auto px-6 pb-10">
            <div className="inline-flex w-full justify-center">
              <div className="inline-flex bg-bg-elevated/80 border border-border rounded-full p-1 backdrop-blur-xl">
                <FamilyTab
                  active={scope === 'personal'}
                  onClick={() => setScope('personal')}
                  icon={Crown}
                  label="Personal Plans"
                  hint="Free / Pro"
                />
                <FamilyTab
                  active={scope === 'business'}
                  onClick={() => setScope('business')}
                  icon={Building2}
                  label="Business Plans"
                  hint="Business / Enterprise"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="max-w-6xl mx-auto px-6 pt-10">
          <div
            className={cn(
              'grid gap-5',
              plans.length === 3
                ? 'md:grid-cols-3'
                : 'md:grid-cols-2 max-w-4xl mx-auto'
            )}
          >
            {plans.map((p, i) => (
              <PlanCard
                key={p.id}
                plan={p}
                index={i}
                isCurrent={scope === 'personal' && p.id === currentPlanId}
              />
            ))}
          </div>

          {/* Family-specific footer */}
          {scope === 'personal' ? (
            <PersonalPlansFooter />
          ) : (
            <BusinessPlansFooter />
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

// ─── Family Tab ───────────────────────────────────────────

function FamilyTab({
  active, onClick, icon: Icon, label, hint, badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  hint: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative px-5 py-2.5 rounded-full transition flex items-center gap-2',
        active
          ? 'bg-gradient-to-br from-accent to-accent2 text-white shadow-lg shadow-accent/20'
          : 'text-text-muted hover:text-text'
      )}
    >
      <Icon size={13} />
      <div className="text-left">
        <div className="text-sm font-medium leading-none">{label}</div>
        <div className={cn('text-2xs mt-0.5 leading-none', active ? 'text-white/80' : 'text-text-subtle')}>
          {hint}
        </div>
      </div>
      {badge && (
        <span className="ml-1 text-2xs px-1.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Plan Card ────────────────────────────────────────────

function PlanCard({ plan, index, isCurrent }: { plan: Plan; index: number; isCurrent: boolean }) {
  const isPrimary = plan.id === 'pro' || plan.id === 'enterprise';
  const isComingSoon = !plan.available;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'card relative overflow-hidden flex flex-col',
        isPrimary && 'border-accent/50 shadow-lg shadow-accent/10',
        isComingSoon && 'opacity-90'
      )}
    >
      {/* Gradient accent */}
      {isPrimary && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent2/10 pointer-events-none" />
      )}

      <div className="relative p-6 flex-1 flex flex-col">
        {/* Highlight badge */}
        {plan.highlight && (
          <span className="absolute top-4 right-4 text-2xs px-2 py-0.5 rounded-full font-medium border border-accent/40 bg-accent/15 text-accent-glow inline-flex items-center gap-1">
            {plan.highlight === 'recommended' ? (
              <>
                <Crown size={9} /> 推荐
              </>
            ) : (
              <>
                <Star size={9} /> 最受欢迎
              </>
            )}
          </span>
        )}

        {/* Name + tagline */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
          <p className="mt-1 text-2xs text-text-muted leading-relaxed">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className={cn('text-3xl font-semibold num', isComingSoon && 'text-text-muted')}>
            {plan.priceLabel}
          </div>
          {plan.monthly > 0 && (
            <div className="text-2xs text-text-subtle mt-1">按月订阅，可随时取消</div>
          )}
          {plan.monthly === 0 && (
            <div className="text-2xs text-text-subtle mt-1">登录即用，无需付费</div>
          )}
          {plan.monthly < 0 && (
            <div className="text-2xs text-text-subtle mt-1">按国家 / 渠道 / 合同配置价格</div>
          )}
        </div>

        {/* CTA */}
        {isCurrent ? (
          <div className="text-2xs text-success border border-success/40 bg-success/10 rounded-md py-2 text-center mb-5 inline-flex items-center justify-center gap-1.5">
            <Check size={11} /> 当前套餐
          </div>
        ) : isComingSoon ? (
          <button
            disabled
            className="text-xs border border-border bg-bg-elevated text-text-muted rounded-md py-2 mb-5 inline-flex items-center justify-center gap-1.5"
          >
            <Lock size={11} /> {plan.ctaLabel}
          </button>
        ) : (
          <Link
            href={pricingPlanCtaHref(plan)}
            className={cn(
              'text-xs rounded-md py-2 mb-5 inline-flex items-center justify-center gap-1.5 font-medium transition',
              isPrimary
                ? 'bg-gradient-to-br from-accent to-accent2 text-white hover:shadow-lg hover:shadow-accent/30'
                : 'border border-border hover:border-border-strong text-text'
            )}
          >
            {plan.ctaLabel} <ArrowRight size={11} />
          </Link>
        )}

        {/* Audience */}
        <div className="text-2xs text-text-subtle mb-2 uppercase tracking-wider font-medium">
          适合人群
        </div>
        <p className="text-2xs text-text-muted leading-relaxed mb-5">
          {plan.audience.join(' · ')}
        </p>

        <div className="mb-5 grid grid-cols-3 gap-2">
          <PlanFact label="Credits" value={plan.creditsLabel} />
          <PlanFact label="Scope" value={plan.scope === 'personal' ? 'Personal Workspace' : 'Team Workspace'} />
          <PlanFact
            label="Commercial"
            value={plan.commercialEntitlement === 'none' ? 'No' : plan.commercialEntitlement}
          />
        </div>

        {/* Features */}
        <div className="text-2xs text-text-subtle mb-2 uppercase tracking-wider font-medium">
          核心能力
        </div>
        <ul className="space-y-1.5 mb-5 flex-1">
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-2 text-2xs text-text-muted leading-relaxed">
              <Check size={11} className="text-success flex-shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Limits */}
        {plan.limits && plan.limits.length > 0 && (
          <div className="mt-auto pt-4 border-t border-border">
            <div className="text-2xs text-text-subtle mb-2 uppercase tracking-wider font-medium">
              当前边界
            </div>
            <ul className="space-y-1.5">
              {plan.limits.map(l => (
                <li key={l} className="text-2xs text-text-subtle leading-relaxed flex items-start gap-2">
                  <span className="text-text-subtle mt-0.5">·</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function pricingPlanCtaHref(plan: Plan) {
  if (plan.id === 'free') return '/home';
  if (plan.id === 'pro') return '/onboarding?intent=professional_profile&plan=pro&from=%2Fpricing';
  if (plan.id === 'business' || plan.id === 'enterprise') return `/pro/workspaces?new=1&plan=${plan.id}`;
  return '/pricing';
}

function PlanFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-elevated/50 px-2 py-2">
      <div className="text-[9px] uppercase tracking-wider text-text-subtle">{label}</div>
      <div className="mt-1 text-[11px] font-medium text-text truncate">{value}</div>
    </div>
  );
}

// ─── Footer Sections ──────────────────────────────────────

function PersonalPlansFooter() {
  return (
    <div className="mt-16 max-w-3xl mx-auto">
      <div className="card p-5 bg-gradient-to-br from-accent/[0.04] via-transparent to-accent2/[0.04] border-accent/20">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={16} className="text-accent-glow" />
          </div>
          <div className="flex-1 flex items-center justify-between gap-4 flex-wrap">
            <div>
                <h3 className="text-sm font-semibold">想把个人能力变成可交付服务？</h3>
                <p className="text-2xs text-text-muted mt-0.5">
                先完成 Professional Onboarding 进入 Builder Pro，再按国家政策申请 Certified Badge。发布 Professional Profile 后才会进入 Find Pros。
                </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/pro/academy?tab=verify"
                className="text-2xs px-3 py-1.5 rounded-md bg-accent/15 border border-accent/30 text-accent-glow hover:bg-accent/20 transition inline-flex items-center gap-1.5"
              >
                <ShieldCheck size={11} /> 了解认证
              </Link>
              <Link
                href="/onboarding?intent=professional_profile&plan=pro&from=%2Fpricing"
                className="text-2xs px-3 py-1.5 rounded-md border border-border hover:border-border-strong text-text-muted hover:text-text transition inline-flex items-center gap-1.5"
              >
                Become Professional
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FAQ Section ────────────────────────────────────── */}
      <div className="mt-14">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold tracking-tight">常见问题</h2>
        </div>

        <div className="divide-y divide-border rounded-lg border border-border bg-bg-base/50">
          <FaqAccordion
            q="开启 Builder Pro 和购买套餐是一回事吗？"
            a="不是。开启 Builder Pro 是激活 Professional Profile 并进入专业工作台；Free / Pro 是 Personal Plans，Business / Enterprise 是 Business Plans。Free Professional 也可以进入 Builder Pro，只是高级能力会在使用中触发升级。"
          />
          <FaqAccordion
            q="开启 Builder Pro 后会自动出现在 Find Pros 吗？"
            a="不会。Professional Profile 会被激活，但公开接单和 Find Pros 展示需要你主动发布，并补充服务区域与 Badge。"
          />
          <FaqAccordion
            q="Design Platform 是桌面 IDE 还是 Web 平台？"
            a="当前按 Web-first 的 Builder Design Platform 设计，承载户型、空间图谱、设备点位和方案包。未来可以为重度设计、离线场景提供桌面壳，但产品心智不再叫 IDE。"
          />
          <FaqAccordion
            q="商业项目的钱由谁收？"
            a="初期平台不强制代收款。团队、服务商或个人 Pro 可按当地方式向客户收费，Builder 平台主要记录项目生命周期、授权、服务费与交付状态。"
          />
          <FaqAccordion
            q="Credits 用来买插件吗？"
            a="可以。Credits 是统一资源单位，可用于 AI、设计、可视化和 Marketplace 兑换。复杂商业授权、服务合同和企业采购仍可走合同或当地支付。"
          />
          <FaqAccordion
            q="客户数据如何存储？"
            a="Studio 运行数据在用户本地。Builder 远程访问需要用户授权服务会话，平台记录授权窗口、审计和操作范围。"
          />
        </div>
      </div>

      {/* ─── Still have questions ──────────────────────────── */}
      <div className="mt-10 text-center">
        <p className="text-sm text-text-muted">
          还有其它问题？{' '}
          <Link href="/pro/help" className="text-accent-glow hover:underline inline-flex items-center gap-1">
            联系支持 <ArrowRight size={11} />
          </Link>
          {' '}或{' '}
          <Link href="/home/community" className="text-accent-glow hover:underline">
            加入社区
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── FAQ Accordion Item ─────────────────────────────────────

function FaqAccordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-bg-subtle/50 transition-colors"
      >
        <span className="text-sm font-medium text-text pr-4">{q}</span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-text-subtle transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-text-muted leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BusinessPlansFooter() {
  return (
    <div className="mt-12 max-w-3xl mx-auto card p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <Users size={18} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold mb-2">团队工作区计划以“项目可视化 + 本地经营”为核心</h3>
          <p className="text-2xs text-text-muted leading-relaxed">
            Business 解决团队协作，Enterprise 解决高级权限、审计、服务商门店和企业能力。服务商、Aqara Space 和补贴政策通过标签、认证和 Billing Policy 叠加。
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/founders"
              className="text-2xs px-3 py-1.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition inline-flex items-center gap-1.5"
            >
              联系 Aqara <ArrowRight size={11} />
            </Link>
            <Link
              href="/builders"
              className="text-2xs px-3 py-1.5 rounded-md border border-border hover:border-border-strong text-text-muted hover:text-text transition"
            >
              查看专业人网络
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
