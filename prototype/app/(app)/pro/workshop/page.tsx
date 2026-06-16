'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Cable,
  Database,
  FolderOpen,
  LayoutDashboard,
  Layers,
  Sparkles,
  Store,
} from 'lucide-react';

const WORKFLOWS = [
  {
    icon: Layers,
    title: 'Spatial Intelligence',
    stage: '售前',
    desc: '空间语义、点位、场景',
    output: 'DesignPlan',
    href: '/build?entry=pro&demo_as=pro&workflow=space',
    color: '#6366f1',
  },
  {
    icon: LayoutDashboard,
    title: 'Life Dashboard',
    stage: '家庭数据',
    desc: '成员看板、扫码领取',
    output: 'LifeHomePlugin',
    href: '/pro/build/dashboard',
    color: '#10b981',
  },
  {
    icon: Cable,
    title: 'Protocol Driver',
    stage: '设备接入',
    desc: '协议文档到驱动',
    output: 'DeviceDriver',
    href: '/pro/build/driver',
    color: '#06b6d4',
  },
];

const CONTEXTS = [
  { icon: FolderOpen, label: 'Projects', value: '12 active', href: '/pro/projects' },
  { icon: Database, label: 'Studios', value: '8 online', href: '/pro/studios' },
  { icon: Store, label: 'Assets', value: 'Marketplace', href: '/marketplace' },
];

const QUICK_ACTIONS = [
  { label: '新空间智能', href: '/build?entry=pro&demo_as=pro&workflow=space' },
  { label: '儿童看板', href: '/pro/build/dashboard' },
  { label: 'MQTT 设备', href: '/pro/build/driver' },
];

export default function ProWorkshopPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-7">
        <section className="relative overflow-hidden rounded-[28px] border border-border bg-bg-elevated mb-5 shadow-sm shadow-slate-200/70 dark:shadow-black/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_85%_0%,rgba(20,184,166,0.16),transparent_30%)] pointer-events-none" />
          <div className="relative p-5 lg:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/75 px-3 py-1 text-2xs text-text-muted">
                  <Sparkles size={12} />
                  Build Workshop
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight">今天要做什么？</h1>
              </div>
              <div className="w-full max-w-xl">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-bg px-3 py-2 shadow-sm">
                  <Sparkles size={15} className="text-accent" />
                  <span className="flex-1 text-sm text-text-muted">Ask Build Agent...</span>
                  <Link href="/build?entry=pro&demo_as=pro&workflow=space" className="rounded-xl bg-accent px-3 py-2 text-xs font-medium text-white">Run</Link>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map(item => (
                    <Link key={item.label} href={item.href} className="rounded-full border border-border bg-bg-elevated px-3 py-1 text-2xs text-text-muted hover:text-text">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4 mb-5">
          {WORKFLOWS.map(flow => (
            <Link key={flow.title} href={flow.href} className="group rounded-[24px] border border-border bg-bg-elevated p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-black/30">
              <div className="flex items-start justify-between gap-3">
                <div className="w-11 h-11 rounded-2xl border flex items-center justify-center" style={{ background: `${flow.color}16`, borderColor: `${flow.color}44` }}>
                  <flow.icon size={19} style={{ color: flow.color }} />
                </div>
                <span className="rounded-full border border-border bg-bg px-2 py-1 text-[10px] text-text-subtle">{flow.stage}</span>
              </div>
              <h2 className="mt-5 text-base font-semibold group-hover:text-accent-glow transition">{flow.title}</h2>
              <p className="mt-1 text-xs text-text-muted">{flow.desc}</p>
              <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-white/[0.02] px-3 py-2 text-2xs">
                <span className="text-text-subtle">{flow.output}</span>
                <ArrowRight size={12} className="text-text-subtle transition group-hover:translate-x-0.5 group-hover:text-text" />
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {CONTEXTS.map(item => (
            <Link key={item.label} href={item.href} className="rounded-2xl border border-border bg-bg-elevated p-4 transition hover:border-border-strong hover:bg-bg-subtle">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
                  <item.icon size={16} className="text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-2xs text-text-muted">{item.value}</div>
                </div>
                <ArrowRight size={13} className="ml-auto text-text-subtle" />
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
