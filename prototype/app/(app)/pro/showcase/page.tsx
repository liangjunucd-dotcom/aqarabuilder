'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  EyeOff,
  FileText,
  FolderOpen,
  Sparkles,
  Tags,
} from 'lucide-react';
import { getAllProjects, resolveProjectStatus } from '@/lib/mock/projects';

const STEPS = [
  {
    icon: FolderOpen,
    title: 'Import From Project',
    desc: '从 Project Passport 导入空间图谱、设备清单、Persona、服务记录和验收结果。',
  },
  {
    icon: Sparkles,
    title: 'AI Draft',
    desc: '生成设计亮点、方案解释、标签和标题，但不自动发布。',
  },
  {
    icon: EyeOff,
    title: 'Privacy Review',
    desc: '检查地址、人脸、家庭成员、敏感设备和客户身份信息。',
  },
  {
    icon: CheckCircle2,
    title: 'Builder Approval',
    desc: 'Builder 最终审阅，发布后进入 Showcase → Lead → Project 归因链。',
  },
];

export default function ProShowcaseComposerPage() {
  const projects = getAllProjects().filter(p => !!p.customerId);
  const delivered = projects.filter(p => resolveProjectStatus(p) === 'done');
  const candidates = delivered.length > 0 ? delivered.slice(0, 3) : projects.slice(0, 3);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-bg-elevated mb-7">
          <div className="absolute inset-0 hero-glow opacity-40 pointer-events-none" />
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          <div className="relative p-6 lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-2xs text-amber-300">
              <Camera size={12} />
              Showcase Composer
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Showcase Composer 从真实项目生长，不从空白营销开始。</h1>
            <p className="mt-3 max-w-3xl text-sm text-text-muted leading-relaxed">
              Showcase 应该来自已交付或正在交付的 Project：AI 可以起草内容、脱敏和打标签，但 Builder 必须最终审阅，保证内容真实并能回流到 Lead 与 Project Attribution。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/pro/projects" className="px-4 py-2 rounded-lg bg-gradient-to-br from-accent to-accent2 text-white text-sm font-medium inline-flex items-center gap-1.5">
                选择 Project <ArrowRight size={13} />
              </Link>
              <Link href="/pro/showcase?tab=attribution" className="px-4 py-2 rounded-lg border border-border bg-black/20 text-sm text-text-muted hover:text-text inline-flex items-center gap-1.5">
                查看归因看板
              </Link>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-4 gap-3 mb-7">
          {STEPS.map((step, index) => (
            <div key={step.title} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <step.icon size={17} className="text-accent-glow" />
                </div>
                <span className="text-2xs text-text-subtle num">0{index + 1}</span>
              </div>
              <h2 className="mt-4 text-sm font-semibold">{step.title}</h2>
              <p className="mt-1.5 text-2xs text-text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileText size={14} className="text-accent-glow" />
                可转 Showcase 的项目
              </h2>
              <Link href="/pro/projects" className="text-2xs text-text-muted hover:text-text inline-flex items-center gap-1">
                全部项目 <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-3">
              {candidates.map(project => (
                <Link key={project.id} href={`/pro/projects/${project.id}/overview`} className="card card-hover p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl border border-border bg-bg-subtle flex items-center justify-center shrink-0">
                    <Camera size={18} className="text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{project.title}</div>
                    <div className="mt-1 text-2xs text-text-muted truncate">{project.subtitle}</div>
                  </div>
                  <span className="text-2xs text-accent-glow">起草</span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="card p-5">
              <div className="flex items-center gap-2 text-2xs text-text-muted">
                <BarChart3 size={12} className="text-success" />
                Attribution
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Mini value="8" label="咨询" />
                <Mini value="3" label="成交" />
                <Mini value="¥2.4k" label="分佣" />
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 text-2xs text-text-muted">
                <Tags size={12} className="text-accent-glow" />
                Tagging Rules
              </div>
              <p className="mt-2 text-2xs text-text-muted leading-relaxed">
                标签优先来自 Project 的场景、空间类型、设备组合、Studio 运行结果和客户评价，不鼓励纯营销标签。
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function Mini({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-base font-semibold num">{value}</div>
      <div className="text-2xs text-text-subtle">{label}</div>
    </div>
  );
}
