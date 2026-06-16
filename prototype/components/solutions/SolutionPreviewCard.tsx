'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, ExternalLink, LayoutDashboard, Map, MoreVertical, Radio, Trash2, UserCircle2 } from 'lucide-react';
import { SOLUTION_STATUS_META, resolveSolutionStatus, type Project } from '@/lib/mock/projects';
import { cn } from '@/lib/utils';

function getWorkType(project: Project) {
  if (project.customerName) return { label: '客户项目', icon: Briefcase };
  if (project.buildMode === 'life-dashboard') return { label: '生活看板', icon: LayoutDashboard };
  return { label: '空间智能', icon: Map };
}

function FloorPlanThumb({ project }: { project: Project }) {
  const isCustomer = Boolean(project.customerName);
  return (
    <div className="relative aspect-[1.58] overflow-hidden border-b border-slate-200 bg-[#f8f8f6]">
      <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute left-[10%] top-[18%] h-[58%] w-[72%] border-[5px] border-slate-700 bg-white/40 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.12)]" />
      <div className="absolute left-[36%] top-[18%] h-[58%] w-[4px] bg-slate-700" />
      <div className="absolute left-[36%] top-[48%] h-[4px] w-[46%] bg-slate-700" />
      <div className="absolute left-[56%] top-[18%] h-[30%] w-[4px] bg-slate-700" />
      <div className="absolute left-[14%] top-[23%] h-[18%] w-[17%] rounded-sm border-2 border-slate-400 bg-slate-200/70" />
      <div className="absolute left-[45%] top-[26%] h-[15%] w-[23%] rounded-sm border-2 border-slate-400 bg-slate-200/70" />
      <div className="absolute left-[45%] top-[56%] h-[14%] w-[16%] rounded-full border-2 border-slate-400 bg-slate-200/70" />
      <div className="absolute left-[67%] top-[57%] h-[13%] w-[10%] rounded-sm border-2 border-slate-400 bg-slate-200/70" />
      <div className="absolute bottom-[12%] left-[12%] h-[4px] w-[19%] bg-slate-700" />
      <div className="absolute right-[18%] top-[18%] h-[18%] w-[4px] bg-slate-700" />
      <div className="absolute bottom-[18%] right-[17%] h-[14%] w-[2px] origin-bottom rotate-[-34deg] bg-slate-400" />
      <div className="absolute left-[18%] top-[58%] h-7 w-12 rounded-full border border-slate-300 bg-white/55" />
      <div className="absolute bottom-3 right-3 rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm">
        {isCustomer ? 'Project' : 'Floor Plan'}
      </div>
    </div>
  );
}

function LifeDashboardThumb() {
  return (
    <div className="relative aspect-[1.58] overflow-hidden border-b border-slate-200 bg-[#f6f8fb]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(20,184,166,0.14),transparent_28%)]" />
      <div className="absolute left-[10%] top-[14%] h-[72%] w-[34%] rounded-[18px] border border-slate-300 bg-white shadow-sm">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200" />
        <div className="mx-4 mt-5 h-12 rounded-xl bg-slate-950" />
        <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
          <div className="h-10 rounded-lg bg-blue-100" />
          <div className="h-10 rounded-lg bg-teal-100" />
          <div className="h-10 rounded-lg bg-amber-100" />
          <div className="h-10 rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="absolute right-[10%] top-[19%] h-[54%] w-[42%] rounded-[14px] border border-slate-300 bg-white/90 p-3 shadow-sm">
        <div className="mb-3 h-2 w-16 rounded-full bg-slate-300" />
        <div className="space-y-2">
          <div className="h-8 rounded-lg bg-blue-50" />
          <div className="h-8 rounded-lg bg-teal-50" />
          <div className="h-8 rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="absolute bottom-3 right-3 rounded-full border border-white/80 bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-sm">
        Life Dashboard
      </div>
    </div>
  );
}

export function SolutionPreviewCard({
  project,
  href,
  index = 0,
  compact = false,
  showArrow = false,
  deployHref,
  deployDisabled = false,
  onDelete,
}: {
  project: Project;
  href: string;
  index?: number;
  compact?: boolean;
  showArrow?: boolean;
  deployHref?: string;
  deployDisabled?: boolean;
  onDelete?: (project: Project) => void;
}) {
  const solutionStatus = resolveSolutionStatus(project);
  const statusMeta = SOLUTION_STATUS_META[solutionStatus];
  const statusLabel = solutionStatus === 'finalized' && project.linkedStudioId ? '已部署' : statusMeta.label;
  const workType = getWorkType(project);
  const WorkTypeIcon = workType.icon;
  const isLifeDashboard = project.buildMode === 'life-dashboard';
  const sourceCount = isLifeDashboard
    ? `${project.lifeDashboardPluginCount ?? 0} 个页面`
    : project.customerName
      ? '1 project'
      : `${Math.max(1, project.devices ?? 1)} devices`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.24) }}
      className="h-full"
    >
      <article
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]',
          compact ? 'min-h-[238px]' : 'min-h-[260px]'
        )}
      >
        <Link href={href} className="absolute inset-0 rounded-[8px]" aria-label={`打开 ${project.title}`} />

        {isLifeDashboard ? <LifeDashboardThumb /> : <FloorPlanThumb project={project} />}

        <div className="relative z-10 flex items-start justify-between gap-3 px-4 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
            <WorkTypeIcon size={16} />
          </div>
          <button
            className="relative z-20 flex h-8 w-8 items-center justify-center rounded-full text-slate-500/75 transition hover:bg-slate-100 hover:text-slate-800"
            title="更多"
          >
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="relative z-10 mt-3 min-w-0 px-4">
          <Link href={href} className="line-clamp-1 text-[16px] font-semibold leading-6 tracking-normal text-slate-900 transition hover:text-blue-700">
            {project.title}
          </Link>
          <div className="mt-1 line-clamp-1 text-xs text-slate-500">{project.subtitle}</div>
        </div>

        <div className="relative z-10 mt-auto flex min-w-0 items-end justify-between gap-3 px-4 pb-4 pt-4">
          <div className="min-w-0 text-[12px] font-medium leading-5 text-slate-600/85">
            <div className="flex items-center gap-1.5 truncate">
              <UserCircle2 size={13} className="text-slate-400" />
              <span>{project.updatedAt} · {sourceCount}</span>
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
              <span className="truncate">{workType.label}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="truncate" style={{ color: statusMeta.color }}>{statusLabel}</span>
            </div>
          </div>

          <div className="relative z-20 flex translate-y-1 items-center gap-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            {deployHref && !deployDisabled ? (
              <Link href={deployHref} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-500 shadow-sm transition hover:bg-white hover:text-blue-600" title="部署到 Studio">
                <Radio size={13} />
              </Link>
            ) : null}
            {deployDisabled ? (
              <button
                disabled
                className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-white/45 text-slate-300"
                title="方案确认后可部署到 Studio"
              >
                <Radio size={13} />
              </button>
            ) : null}
            {onDelete ? (
              <button onClick={() => onDelete(project)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-500 shadow-sm transition hover:bg-white hover:text-rose-600" title="删除方案">
                <Trash2 size={13} />
              </button>
            ) : null}
            <Link href={href} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition hover:bg-blue-600" title={showArrow ? '打开' : '打开'}>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
