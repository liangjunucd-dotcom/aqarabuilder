'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarClock,
  ClipboardCheck,
  Repeat,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { ProWipPage } from '@/components/workshop/ProWipPage';

const PLANS = [
  {
    name: 'Security Care',
    customer: '吴先生别墅',
    provider: 'Aqara Space Shanghai Xuhui',
    price: '500 Credits / month',
    status: 'Active',
    scope: 'Studio + 18 sensors · alert-triggered window',
  },
  {
    name: 'Quarterly Maintenance',
    customer: '徐汇公寓',
    provider: 'Jun Personal',
    price: '900 Credits / quarter',
    status: 'Renewal due',
    scope: '2 Studios · scheduled window',
  },
  {
    name: 'Rental Operation',
    customer: '民宿 302',
    provider: 'Liang Studio',
    price: 'Quote required',
    status: 'Proposed',
    scope: 'Lock, guest scenes, monthly report',
  },
];

const PACKAGE_RULES = [
  { title: 'Marketplace Service Package', desc: '可售模板，定义范围、价格、地区、Provider、SLA 和授权策略。' },
  { title: 'ServicePlan', desc: '客户名下实例，绑定 Space / Studio / 项目和商业责任方。' },
  { title: 'ServiceSession', desc: '一次实际服务动作，来自授权窗口和 Remote Service Console。' },
];

export default function ServicePlansPage() {
  return (
    <ProWipPage
      icon={Repeat}
      title="Service Plans"
      desc="持续服务的商业对象：服务包购买或报价确认后，实例化为客户名下的服务计划。"
      showBack={false}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-text-subtle">Active / Proposed</div>
              <h2 className="mt-1 text-lg font-semibold">客户服务计划</h2>
            </div>
            <Link href="/marketplace?category=service" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white">
              <Store size={13} />
              浏览服务包
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {PLANS.map(plan => (
              <article key={plan.name} className="rounded-xl border border-border bg-bg-elevated/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{plan.name}</div>
                    <div className="mt-1 text-xs text-text-muted">{plan.customer} · {plan.provider}</div>
                  </div>
                  <span className="rounded-full border border-success/30 bg-success/10 px-2 py-1 text-[10px] text-success">
                    {plan.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-text-muted sm:grid-cols-2">
                  <div className="inline-flex items-center gap-2">
                    <BadgeDollarSign size={13} className="text-accent-glow" />
                    {plan.price}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <ShieldCheck size={13} className="text-accent-glow" />
                    {plan.scope}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardCheck size={14} className="text-accent-glow" />
              三层对象
            </div>
            <div className="mt-4 space-y-3">
              {PACKAGE_RULES.map(rule => (
                <div key={rule.title} className="rounded-lg border border-border bg-bg/50 p-3">
                  <div className="text-xs font-semibold">{rule.title}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock size={14} className="text-accent-glow" />
              生命周期
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              draft → proposed → active → renewal_due → renewed / cancelled / expired。范围变化生成新版本，不静默覆盖历史。
            </p>
            <Link href="/pro/remote-service" className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent-glow hover:underline">
              进入 Remote Service Console <ArrowRight size={11} />
            </Link>
          </div>
        </aside>
      </div>
    </ProWipPage>
  );
}
