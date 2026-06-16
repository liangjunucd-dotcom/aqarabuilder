'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Eye,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Star,
  User,
  Users,
} from 'lucide-react';

const BADGES = [
  { label: 'Certified Installer', level: 'L3', color: '#f59e0b' },
  { label: 'Spatial Designer', level: 'L2', color: '#6366f1' },
];

const CHECKLIST = [
  { label: '服务区域与语言', done: true },
  { label: '作品集与交付案例', done: true },
  { label: '响应 SLA 与服务方式', done: false },
  { label: '公开接单开关', done: false },
];

export default function ProProfilePage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-bg-elevated mb-7">
          <div className="absolute inset-0 hero-glow opacity-35 pointer-events-none" />
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-2xl font-semibold text-white shrink-0">
                  J
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-2xs text-success">
                    <ShieldCheck size={12} />
                    Professional Profile
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight">Jun · Independent Pro</h1>
                  <p className="mt-2 text-sm text-text-muted max-w-2xl leading-relaxed">
                    Professional Profile 是已激活的专业身份；公开接单、Find Pros 展示、认证 Badge 和组织代表权按后续动作逐步开启。
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/u/jun" className="px-4 py-2 rounded-lg border border-border bg-black/20 text-sm text-text-muted hover:text-text inline-flex items-center gap-1.5">
                  <Eye size={13} /> Public View
                </Link>
                <Link href="/pro/academy" className="px-4 py-2 rounded-lg bg-gradient-to-br from-accent to-accent2 text-white text-sm font-medium inline-flex items-center gap-1.5">
                  认证进阶 <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <BadgeCheck size={14} className="text-accent-glow" />
                Certification Badges
              </h2>
              <div className="mt-4 grid md:grid-cols-3 gap-3">
                {BADGES.map(badge => (
                  <div key={badge.label} className="rounded-xl border border-border bg-white/[0.02] p-4">
                    <div className="w-10 h-10 rounded-xl border flex items-center justify-center" style={{ background: `${badge.color}16`, borderColor: `${badge.color}44` }}>
                      <ShieldCheck size={17} style={{ color: badge.color }} />
                    </div>
                    <div className="mt-3 text-sm font-semibold">{badge.label}</div>
                    <div className="mt-1 text-2xs text-text-muted">{badge.level}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoCard icon={MapPin} title="服务区域" value="上海 · 苏州 · 杭州" desc="用于 Lead 匹配和 Find Pros 排序。" />
              <InfoCard icon={Users} title="服务方式" value="远程设计 + 现场协作" desc="可与 Installer、团队或服务商工作区共同完成交付。" />
              <InfoCard icon={Building2} title="组织关系" value="Independent / 可加入 Team Workspace" desc="Builder 身份跟人走，项目责任归当前 Workspace。" />
              <InfoCard icon={Star} title="公开接单" value="Not Published" desc="资料未补齐前不会自动公开接单。" />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <User size={14} className="text-accent-glow" />
                Publish Readiness
              </h2>
              <div className="mt-4 space-y-3">
                {CHECKLIST.map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-2xs">
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${item.done ? 'border-success bg-success/15 text-success' : 'border-border text-text-subtle'}`}>
                      {item.done ? '✓' : ''}
                    </span>
                    <span className={item.done ? 'text-text-muted' : 'text-text-subtle'}>{item.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/pro/settings" className="mt-5 w-full px-3 py-2 rounded-md border border-border text-xs text-text-muted hover:text-text inline-flex items-center justify-center gap-1.5">
                编辑资料 <ArrowRight size={11} />
              </Link>
            </div>

            <div className="card p-5 border-amber-500/30 bg-amber-500/5">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-amber-300">
                <GraduationCap size={14} />
                认证边界
              </h2>
              <p className="mt-2 text-2xs text-text-muted leading-relaxed">
                Certified / Verified 是信任与能力标签，不应创造新的账号物种。项目权限、Studio 权限、商业授权仍按 Project / Studio / Workspace 资源关系判断。
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  value,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="card p-5">
      <Icon size={16} className="text-accent-glow" />
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-base">{value}</div>
      <p className="mt-2 text-2xs text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}
