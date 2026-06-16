'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowRight,
  Bot,
  Cable,
  CheckCircle2,
  Crown,
  Database,
  Image,
  LayoutDashboard,
  Layers3,
  Loader2,
  Lock,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { createCubixProject, saveCubixLocalProject } from '@/lib/mock/projects';
import { getFrontendWorkspaces, getStudiosForWorkspace, HEALTH_META, type Studio, type Workspace } from '@/lib/mock/studios';
import { isProBuilderRole, useRole } from '@/lib/role';
import { cn } from '@/lib/utils';

const SPACE_AGENT_HREF = '/build?entry=personal&demo_as=builder&workflow=space';
const LIFE_DASHBOARD_HREF = '/build?entry=personal&demo_as=builder&workflow=life';
const MARBLE_WORLD_HREF = '/build?entry=personal&demo_as=builder&workflow=visualization&ready=1';
const SOLUTIONS_HREF = '/home/solutions';

const WORKSHOP_TOOLS = [
  {
    title: '空间方案',
    desc: '户型、空间语义、设备点位与自动化编排。',
    href: SPACE_AGENT_HREF,
    icon: Layers3,
    accent: 'cyan',
    primary: true,
    group: 'space',
  },
  {
    title: '生活看板',
    desc: '为 Aqara Life 生成家庭成员看板和控制体验。',
    href: LIFE_DASHBOARD_HREF,
    icon: LayoutDashboard,
    accent: 'violet',
    group: 'interface',
  },
  {
    title: '3D 世界生成',
    desc: '上传户型图，调用 Marble 生成可打开的 3D 世界预览。',
    href: MARBLE_WORLD_HREF,
    icon: Image,
    accent: 'blue',
    group: 'space',
  },
  {
    title: '童趣造梦间',
    desc: '创作轻量互动页面、HTML 小游戏和家庭趣味体验。',
    href: 'http://10.11.45.201:8766/dreamyKids',
    icon: Sparkles,
    accent: 'rose',
    group: 'interface',
  },
  {
    title: '流程智造工坊',
    desc: '把设备数据、规则和动作编排成可运行流程。',
    href: '/build?entry=personal&demo_as=builder&workflow=space&stage=logic&ready=1',
    icon: Cable,
    accent: 'sky',
    group: 'automation',
  },
  {
    title: '数据洞察工厂',
    desc: '生成设备运行、空间状态和用能数据视图。',
    href: '/home/devices',
    icon: Database,
    accent: 'amber',
    group: 'automation',
  },
  {
    title: 'Aqara Studio 协议解析生成',
    desc: '管理协议文件，生成 Aqara Studio 协议解析库和测试报告。',
    href: '/pro/build/driver',
    icon: Cable,
    proOnly: true,
    accent: 'blue',
    group: 'developer',
  },
  {
    title: 'Plugin Builder',
    desc: '制作自用插件，或发布到插件市场。',
    href: '/marketplace',
    icon: Store,
    proOnly: true,
    accent: 'slate',
    group: 'developer',
  },
];

const TOOL_TONES: Record<string, { icon: string; glow: string; pro?: string }> = {
  cyan: { icon: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-500', glow: 'from-cyan-500/10' },
  emerald: { icon: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500', glow: 'from-emerald-500/10' },
  violet: { icon: 'border-violet-500/25 bg-violet-500/10 text-violet-500', glow: 'from-violet-500/10' },
  rose: { icon: 'border-rose-500/25 bg-rose-500/10 text-rose-500', glow: 'from-rose-500/10' },
  sky: { icon: 'border-sky-500/25 bg-sky-500/10 text-sky-500', glow: 'from-sky-500/10' },
  amber: { icon: 'border-amber-500/25 bg-amber-500/10 text-amber-500', glow: 'from-amber-500/10' },
  blue: { icon: 'border-blue-500/25 bg-blue-500/10 text-blue-500', glow: 'from-blue-500/10' },
  slate: { icon: 'border-slate-500/25 bg-slate-500/10 text-slate-500', glow: 'from-slate-500/10' },
};

const TOOL_GROUP_LABELS: Record<string, string> = {
  space: '空间',
  interface: '界面',
  automation: '自动化',
  developer: '开发',
};

const PRIMARY_SPACE_TOOL = WORKSHOP_TOOLS.find(tool => tool.primary)!;
const LAB_TOOLS = WORKSHOP_TOOLS.filter(tool => !tool.primary);

const SPACE_FLOW = [
  { label: '户型与房间', icon: Layers3 },
  { label: '设备点位', icon: Cable },
  { label: '自动化场景', icon: Bot },
  { label: '清单与部署', icon: CheckCircle2 },
];

type AccountStudioOption = {
  studio: Studio;
  workspace: Workspace;
};

function accountStudioOptions(): AccountStudioOption[] {
  return getFrontendWorkspaces().flatMap(workspace => (
    getStudiosForWorkspace(workspace.id).map(studio => ({ studio, workspace }))
  ));
}

export default function HomeBuildPage() {
  const router = useRouter();
  const { role, mounted } = useRole();
  const isPro = mounted && isProBuilderRole(role);
  const [lifeDashboardModalOpen, setLifeDashboardModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateProject = () => {
    if (creating) return;
    setCreating(true);
    const project = createCubixProject('Untitled');
    window.setTimeout(() => {
      setCreating(false);
      router.push(`/build?entry=personal&demo_as=builder&solution=${project.id}&workflow=space&stage=floor&guide=1`);
    }, 500);
  };

  const openTool = (tool: (typeof WORKSHOP_TOOLS)[number]) => {
    if (tool.title === '空间方案') {
      handleCreateProject();
      return;
    }
    if (tool.title === '生活看板') {
      setLifeDashboardModalOpen(true);
      return;
    }
    if (tool.proOnly && !isPro) {
      router.push('/home/build#pricing');
      return;
    }
    if (/^https?:\/\//.test(tool.href)) {
      window.location.href = tool.href;
      return;
    }
    router.push(tool.href);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-text">
      <UserTopBar title="Create" />

      <main className="relative mx-auto max-w-7xl px-6 py-7">
        <section className="relative mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Create</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">空间方案设计</h1>
          </div>
          <Link href={SOLUTIONS_HREF} className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
            我的方案 <ArrowRight size={12} />
          </Link>
        </section>

        <div className="relative space-y-5">
          <section className="relative overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
            <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(37,99,235,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.045)_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(23,104,255,0.08),transparent_38%,rgba(14,165,233,0.08))]" />

            <div className="relative grid min-h-[420px] lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.86fr)]">
              <div className="flex flex-col justify-between p-6 sm:p-7 lg:p-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-[8px] border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                    <Layers3 size={13} />
                    空间方案
                  </div>
                  <h2 className="mt-5 max-w-[420px] text-4xl font-semibold leading-tight tracking-tight text-slate-950">
                    从户型开始
                  </h2>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {SPACE_FLOW.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={handleCreateProject}
                      disabled={creating}
                      className="group flex min-h-[92px] items-center gap-3 rounded-[8px] border border-slate-200 bg-white/90 p-4 text-left shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:shadow-[0_16px_34px_rgba(37,99,235,0.10)]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-blue-100 bg-blue-50 text-blue-600 transition group-hover:border-blue-200 group-hover:bg-white">
                        <item.icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                        <span className="mt-1 block text-base font-semibold text-slate-950">{item.label}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleCreateProject}
                    disabled={creating}
                    className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#1768ff] px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#0f5de8]"
                  >
                    {creating ? <Loader2 size={15} className="animate-spin" /> : null}
                    {creating ? 'Loading' : '开始设计'} {!creating ? <ArrowRight size={15} /> : null}
                  </button>
                </div>
              </div>

              <div className="relative min-h-[340px] overflow-hidden border-t border-slate-200 bg-[#f6f9ff]/80 p-6 lg:border-l lg:border-t-0 lg:p-8">
                <div className="relative flex h-full items-center justify-center">
                  <div className="relative aspect-[1.18/1] w-full max-w-[540px] rounded-[8px] border border-blue-100 bg-white/80 shadow-[0_22px_58px_rgba(37,99,235,0.13)] backdrop-blur">
                    <div className="absolute inset-4 rounded-[8px] border border-blue-100/80 bg-[radial-gradient(circle_at_1px_1px,rgba(37,99,235,0.12)_1px,transparent_0)] [background-size:18px_18px]" />
                    <div className="absolute left-[9%] top-[13%] h-[42%] w-[43%] rounded-[6px] border-2 border-blue-300/70 bg-cyan-50/30" />
                    <div className="absolute left-[52%] top-[13%] h-[42%] w-[39%] rounded-[6px] border-2 border-blue-300/70 bg-white/40" />
                    <div className="absolute left-[9%] top-[55%] h-[31%] w-[29%] rounded-[6px] border-2 border-blue-300/70 bg-white/40" />
                    <div className="absolute left-[38%] top-[55%] h-[31%] w-[31%] rounded-[6px] border-2 border-blue-300/70 bg-blue-50/40" />
                    <div className="absolute left-[69%] top-[55%] h-[31%] w-[22%] rounded-[6px] border-2 border-blue-300/70 bg-white/40" />
                    <div className="absolute left-[50%] top-[32%] h-9 w-1.5 rounded-full bg-slate-800/60" />
                    <div className="absolute left-[58%] top-[53%] h-1.5 w-14 rounded-full bg-slate-800/55" />
                    <div className="absolute left-[67%] top-[63%] h-10 w-1.5 rounded-full bg-slate-800/55" />

                    {[
                      'left-[22%] top-[25%]',
                      'left-[63%] top-[27%]',
                      'left-[31%] top-[47%]',
                      'left-[46%] top-[71%]',
                      'left-[80%] top-[71%]',
                    ].map(position => (
                      <span key={position} className={cn('absolute h-2.5 w-2.5 rounded-full bg-[#1768ff] shadow-[0_0_0_6px_rgba(23,104,255,0.10)]', position)} />
                    ))}

                    <div className="absolute -bottom-4 left-6 right-6 grid grid-cols-3 gap-2">
                      {[
                        ['8', '房间'],
                        ['24', '设备'],
                        ['12', '场景'],
                      ].map(([value, label]) => (
                        <div key={label} className="rounded-[8px] border border-slate-200 bg-white/95 px-3 py-2 shadow-sm shadow-blue-100/70">
                          <div className="text-xl font-semibold text-slate-950">{value}</div>
                          <div className="text-[10px] font-medium text-slate-400">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">工具</div>
                <h2 className="mt-1 text-sm font-semibold text-slate-900">常用工具</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {LAB_TOOLS.map(agent => {
                const locked = Boolean(agent.proOnly && !isPro);
                const tone = TOOL_TONES[agent.accent] ?? TOOL_TONES.cyan;
                return (
                  <article
                    key={agent.title}
                    className={cn(
                      'group relative overflow-hidden rounded-[8px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition',
                      locked ? 'opacity-75' : 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]'
                    )}
                  >
                    <button type="button" onClick={() => openTool(agent)} className="flex h-full w-full items-start gap-3 text-left">
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border', tone.icon)}>
                        <agent.icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-slate-950 group-hover:text-blue-700">{agent.title}</h3>
                          {agent.proOnly ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-600">
                              {locked ? <Lock size={9} /> : <Crown size={9} />}
                              Pro
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-[11px] font-medium text-slate-400">{TOOL_GROUP_LABELS[agent.group] ?? '工具'}</div>
                      </div>
                      <ArrowRight size={14} className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

        </div>

      </main>

      {creating ? <SolutionCreatingOverlay /> : null}
      {lifeDashboardModalOpen ? (
        <LifeDashboardProjectDialog
          onCancel={() => setLifeDashboardModalOpen(false)}
          onCreate={({ name, studio }) => {
            setCreating(true);
            const project = createCubixProject(name, { buildingType: 'apartment' });
            const nextProject = {
              ...project,
              subtitle: `${studio.spaceName} · 生活看板创作中`,
              buildMode: 'life-dashboard',
              linkedStudioId: studio.id,
              designStage: 'review' as const,
              solutionStatus: 'editing' as const,
              lifeDashboardPluginCount: 0,
            };
            saveCubixLocalProject(nextProject);
            window.setTimeout(() => {
              setCreating(false);
              setLifeDashboardModalOpen(false);
              router.push(`/build?entry=personal&demo_as=builder&workflow=life&solution=${project.id}&studioId=${studio.id}&ready=1`);
            }, 450);
          }}
        />
      ) : null}
    </div>
  );
}

function SolutionCreatingOverlay() {
  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/20 p-4 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 shadow-2xl shadow-slate-950/15">
        <Loader2 size={17} className="animate-spin text-blue-600" />
        Loading
      </div>
    </div>
  );
}

function LifeDashboardProjectDialog({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (payload: { name: string; studio: Studio }) => void;
}) {
  const studios = accountStudioOptions();
  const [name, setName] = useState('');
  const [studioId, setStudioId] = useState(studios[0]?.studio.id ?? '');
  const selectedStudio = studios.find(item => item.studio.id === studioId)?.studio ?? studios[0]?.studio;
  const canCreate = Boolean(name.trim() && selectedStudio);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/20 p-4">
      <section className="w-full max-w-[430px] rounded-[6px] border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl shadow-slate-900/10">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="min-w-0 flex-1 text-sm font-semibold">Create Life Board</h2>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="Cancel">
            <X size={16} />
          </button>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-[11px] font-medium text-slate-500">Project Name</span>
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            className="h-10 w-full rounded-[4px] border border-transparent bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-200 focus:bg-white"
            autoFocus
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-2 block text-[11px] font-medium text-slate-500">Studio</span>
          <select
            value={studioId}
            onChange={event => setStudioId(event.target.value)}
            className="h-10 w-full rounded-[4px] border border-transparent bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-200 focus:bg-white"
          >
            {studios.map(({ studio, workspace }) => {
              const health = HEALTH_META[studio.health];
              return (
                <option key={studio.id} value={studio.id}>
                  {workspace.emoji} {workspace.name} / {studio.name} · {studio.online}/{studio.devices} online · {health.label}
                </option>
              );
            })}
          </select>
        </label>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="h-9 rounded-[4px] px-4 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
            Cancel
          </button>
          <button
            onClick={() => selectedStudio && onCreate({ name: name.trim(), studio: selectedStudio })}
            disabled={!canCreate}
            className="h-9 rounded-[4px] bg-blue-500 px-5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:text-white/70"
          >
            Confirm
          </button>
        </div>
      </section>
    </div>
  );
}
