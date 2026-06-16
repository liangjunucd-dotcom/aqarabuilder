'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CheckCircle2, ArrowRight, Plus, Users, Sparkles,
  MessageSquare, FileText, ClipboardList, PenLine, Check, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  STATUS_META, STATUS_ORDER, MANAGED_STATUS_PRESETS,
  SOLUTION_STATUS_META, resolveSolutionStatus, resolveProjectStatus,
  advanceProject, rewindProject, saveCubixLocalProject,
  type Project, type ProjectStatus,
} from '@/lib/mock/projects';

const STATUS_ICONS: Record<ProjectStatus, any> = {
  open: FileText,
  in_progress: ClipboardList,
  done: CheckCircle2,
  closed: FileText,
};

const STATUS_SUBTITLES: Record<ProjectStatus, string> = {
  open: '需求确认 · 方案设计',
  in_progress: '设计深化 · 施工 · 验收',
  done: '已交付 · 维保期内',
  closed: '已归档 · 项目结束',
};

export function ProjectLeftNav({
  project,
  onLinkCustomer,
}: {
  project: Project;
  onLinkCustomer?: () => void;
}) {
  const currentStatus = resolveProjectStatus(project);
  const statusMeta = STATUS_META[currentStatus];
  const isSolution = !project.customerId;
  const ss = resolveSolutionStatus(project);
  const ssMeta = SOLUTION_STATUS_META[ss];
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const canAdvance = currentIdx >= 0 && currentIdx < STATUS_ORDER.length - 1;
  const canRewind = currentIdx > 0;
  const [, forceUpdate] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const handleAdvance = () => { advanceProject(project.id); forceUpdate(v => v + 1); };
  const handleRewind = () => { rewindProject(project.id); forceUpdate(v => v + 1); };

  return (
    <aside className="space-y-3">
      {/* Project identity card */}
      <div className="card overflow-hidden">
        <div className="h-12 relative" style={{ background: project.thumbnailGradient }}>
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>
        <div className="p-3">
          <div className="flex items-start gap-2.5">
            <div
              className="w-8 h-8 -mt-6 rounded-lg border-2 border-bg flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ background: project.thumbnailGradient }}
            >
              {project.title.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              {editingTitle ? (
                <div className="flex items-center gap-1">
                  <input
                    value={titleDraft}
                    onChange={e => setTitleDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        project.title = titleDraft.trim() || project.title;
                        saveCubixLocalProject(project);
                        setEditingTitle(false);
                        forceUpdate(v => v + 1);
                      }
                      if (e.key === 'Escape') { setEditingTitle(false); }
                    }}
                    className="px-1 py-0.5 rounded border border-accent/50 bg-bg text-xs outline-none w-full"
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                  <button onClick={e => { e.stopPropagation(); project.title = titleDraft.trim() || project.title; saveCubixLocalProject(project); setEditingTitle(false); forceUpdate(v => v + 1); }}
                    className="p-0.5 rounded text-success hover:bg-success/10 flex-shrink-0"><Check size={10} /></button>
                  <button onClick={e => { e.stopPropagation(); setEditingTitle(false); }}
                    className="p-0.5 rounded text-text-muted hover:text-text flex-shrink-0"><X size={10} /></button>
                </div>
              ) : (
                <button
                  onClick={() => { setTitleDraft(project.title); setEditingTitle(true); }}
                  className="text-xs font-semibold truncate hover:text-accent-glow transition inline-flex items-center gap-1 group w-full text-left"
                >
                  {project.title}
                  <PenLine size={9} className="opacity-0 group-hover:opacity-100 text-text-subtle flex-shrink-0" />
                </button>
              )}
              <div className="text-[10px] text-text-subtle truncate">
                {project.customerName
                  ? `${project.customerName}${project.customerId ? '' : ' · 待关联客户档案'}`
                  : (isSolution ? '未关联客户' : '未关联客户')}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {isSolution ? (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1"
                style={{ background: `${ssMeta.color}15`, borderColor: `${ssMeta.color}40`, color: ssMeta.color }}
              >
                <span>{ssMeta.emoji}</span>
                <span>{ssMeta.label}</span>
              </span>
            ) : (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1"
                style={{ background: `${statusMeta.color}15`, borderColor: `${statusMeta.color}40`, color: statusMeta.color }}
              >
                <span>{statusMeta.emoji}</span>
                <span>{statusMeta.label}</span>
              </span>
            )}
            {project.managedStatus && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-text-subtle border border-border">
                {project.managedStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status flow navigation */}
      <div className="card p-3">
        <div className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold mb-3">
          项目状态
        </div>

        <div className="space-y-0.5">
          {STATUS_ORDER.map(status => {
            const meta = STATUS_META[status];
            const Icon = STATUS_ICONS[status];
            const currentIdxForStatus = STATUS_ORDER.indexOf(status);
            const currentIdxForProject = STATUS_ORDER.indexOf(currentStatus);
            const reached = currentIdxForStatus <= currentIdxForProject;
            const active = status === currentStatus;
            const finished = currentIdxForStatus < currentIdxForProject;
            const presets = MANAGED_STATUS_PRESETS[status];

            return (
              <div
                key={status}
                className={cn(
                  'flex items-center gap-2.5 px-2 py-2 rounded-md transition',
                  active && 'bg-accent/10 border border-accent/20',
                  !active && 'border border-transparent'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition',
                    active && 'ring-1 ring-offset-1 ring-offset-bg'
                  )}
                  style={{
                    background: reached ? meta.color : 'rgba(255,255,255,0.04)',
                    borderColor: reached ? meta.color : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {finished ? (
                    <CheckCircle2 size={11} className="text-white" />
                  ) : (
                    <Icon size={11} style={{ color: reached ? '#fff' : 'var(--text-subtle)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn('text-[11px] font-medium', !reached && 'text-text-subtle')}
                    style={reached ? { color: meta.color } : undefined}
                  >
                    {meta.label}
                  </div>
                  {active && (
                    <div className="text-[9px] text-text-subtle mt-0.5">
                      {project.managedStatus || STATUS_SUBTITLES[status]}
                    </div>
                  )}
                  {active && presets.length > 0 && !project.managedStatus && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {presets.slice(0, 3).map(p => (
                        <span key={p} className="text-[8px] px-1 py-0.5 rounded bg-white/5 text-text-muted border border-border">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Advance / Rewind */}
        {(canAdvance || canRewind) && (
          <div className="mt-3 pt-3 border-t border-border flex gap-1.5">
            {canRewind && (
              <button
                onClick={handleRewind}
                className="flex-1 px-2 py-1.5 rounded text-[10px] border border-border hover:border-border-strong text-text-muted hover:text-text transition inline-flex items-center justify-center gap-1"
              >
                <ArrowRight size={10} className="rotate-180" /> 回退
              </button>
            )}
            {canAdvance && (
              <button
                onClick={handleAdvance}
                className="flex-1 px-2 py-1.5 rounded text-[10px] border border-accent/40 bg-accent/10 text-accent-glow hover:bg-accent/15 transition inline-flex items-center justify-center gap-1"
              >
                推进 <ArrowRight size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Customer action */}
      <div className="card p-3 space-y-1.5">
        {isSolution ? (
          <button
            onClick={onLinkCustomer}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] text-accent-glow hover:bg-accent/5 rounded transition"
          >
            <Plus size={12} className="flex-shrink-0" />
            关联客户 · 转为项目
          </button>
        ) : (
          <Link
            href="/pro/messages"
            className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-text-muted hover:text-text rounded transition"
          >
            <MessageSquare size={12} className="flex-shrink-0" />
            消息（{project.customerName ?? '客户'}）
          </Link>
        )}
        <Link
          href={`/build?entry=pro&demo_as=pro&workflow=space&project=${project.id}`}
          className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-text-muted hover:text-text rounded transition"
        >
          <Sparkles size={12} className="flex-shrink-0" />
          打开 Design Platform 设计
        </Link>
      </div>
    </aside>
  );
}
