'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, FolderPlus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LEAD_STAGE_META,
  LEAD_STAGE_ORDER,
  ACTIVE_LEAD_STAGES,
  MANAGED_LEAD_STAGES,
  resolveLeadStage,
  type Lead,
  type LeadStage,
} from '@/lib/mock/leads';
import { createProjectFromLead, saveCubixLocalProject } from '@/lib/mock/projects';

export type LeadTabId = 'overview' | 'notes' | 'tasks' | 'floorplans' | 'files' | 'estimates' | 'contracts';

const LEAD_TABS: { id: LeadTabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'notes', label: '笔记' },
  { id: 'tasks', label: '任务' },
  { id: 'floorplans', label: '户型图' },
  { id: 'files', label: '文件 & 图片' },
  { id: 'estimates', label: '报价' },
  { id: 'contracts', label: '合同' },
];

export function LeadLeftNav({
  lead,
  activeTab,
  onTabChange,
  onStageChange,
}: {
  lead: Lead;
  activeTab: LeadTabId;
  onTabChange: (tab: LeadTabId) => void;
  onStageChange?: (stage: LeadStage) => void;
}) {
  const router = useRouter();
  const stage = resolveLeadStage(lead);
  const stageMeta = LEAD_STAGE_META[stage];
  const isWon = stage === 'won';
  const isLost = stage === 'lost';
  const currentStageIdx = isLost ? -1 : LEAD_STAGE_ORDER.indexOf(stage);
  const managedOptions = MANAGED_LEAD_STAGES[stage] || [];
  const [managedOpen, setManagedOpen] = useState(false);

  const handleWonToProject = () => {
    const project = createProjectFromLead({
      customer: lead.customer,
      city: lead.city,
      budget: lead.budget,
      desc: lead.desc,
      tags: lead.tags,
    });
    project.title = `${lead.customer} · ${lead.size.split(' ')[0]} 项目`;
    project.notes = lead.notes;
    project.tasks = lead.tasks;
    project.files = lead.files;
    project.floorPlans = lead.floorPlans;
    saveCubixLocalProject(project);
    router.push(`/pro/projects/${project.id}/overview`);
  };

  return (
    <aside className="space-y-3">
      {/* Lead identity card */}
      <div className="card overflow-hidden">
        <div className="h-12 relative bg-gradient-to-br from-cyan-500/20 to-sky-500/20">
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>
        <div className="p-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 -mt-6 rounded-lg border-2 border-bg bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {lead.customer.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{lead.customer}</div>
              <div className="text-[10px] text-text-subtle truncate">{lead.city}</div>
            </div>
          </div>

          {/* Stage badge */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1"
              style={{ background: `${stageMeta.color}15`, borderColor: `${stageMeta.color}40`, color: stageMeta.color }}
            >
              <stageMeta.icon size={9} />
              <span>{stageMeta.label}</span>
            </span>
            {lead.matchScore != null && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-accent/10 text-accent-glow border border-accent/30">
                {lead.matchScore}% 匹配
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stage progression track */}
      <div className="card p-3">
        <div className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold mb-2.5">
          线索阶段
        </div>
        <div className="space-y-0">
          {LEAD_STAGE_ORDER.map((s, i) => {
            const sm = LEAD_STAGE_META[s];
            const isReached = !isLost && i <= currentStageIdx;
            const isCurrent = s === stage;
            return (
              <div key={s} className="flex items-stretch gap-2">
                {/* Dot + connector */}
                <div className="flex flex-col items-center w-5">
                  {i > 0 && (
                    <div
                      className="w-px flex-1 min-h-[4px]"
                      style={{ background: isReached ? sm.color + '40' : 'transparent' }}
                    />
                  )}
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full flex-shrink-0 transition border-2',
                      isCurrent
                        ? 'border-current shadow-[0_0_6px]'
                        : isReached
                        ? 'border-transparent'
                        : 'border-transparent bg-white/10'
                    )}
                    style={{
                      background: isCurrent || isReached ? sm.color : undefined,
                      borderColor: isCurrent ? sm.color + '60' : undefined,
                      boxShadow: isCurrent ? `0 0 6px ${sm.color}60` : undefined,
                    }}
                  />
                  {i < LEAD_STAGE_ORDER.length - 1 && (
                    <div
                      className="w-px flex-1 min-h-[4px]"
                      style={{ background: isReached ? sm.color + '40' : 'transparent' }}
                    />
                  )}
                </div>
                {/* Label */}
                <button
                  onClick={() => onStageChange?.(s)}
                  className={cn(
                    'flex-1 text-left py-0.5 text-[11px] rounded px-1.5 -ml-0.5 transition',
                    isCurrent
                      ? 'font-medium'
                      : isReached
                      ? 'text-text-muted'
                      : 'text-text-subtle'
                  )}
                  style={{ color: isCurrent ? sm.color : undefined }}
                >
                  {sm.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* Lost state */}
        {isLost && (
          <div className="mt-2 text-[10px] text-text-subtle italic px-2">
            {lead.managedStage || '已关闭'}
          </div>
        )}

        {/* Managed stage selector */}
        {managedOptions.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-border/50">
            <div className="relative">
              <button
                onClick={() => setManagedOpen(o => !o)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded border border-border/60 bg-bg-elevated/30 text-[10px] text-text-muted hover:text-text transition"
              >
                <span>{lead.managedStage || '选择子阶段...'}</span>
                <ChevronDown size={10} className={cn('transition', managedOpen && 'rotate-180')} />
              </button>
              {managedOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-border bg-bg-elevated shadow-lg z-20 overflow-hidden">
                  {managedOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        lead.managedStage = opt;
                        setManagedOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-2.5 py-1.5 text-[10px] hover:bg-white/5 transition',
                        lead.managedStage === opt ? 'text-accent-glow bg-accent/5' : 'text-text-muted'
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav tabs */}
      <div className="card p-1.5">
        {LEAD_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'w-full text-left px-3 py-1.5 rounded-md text-[11px] transition',
              activeTab === tab.id
                ? 'bg-accent/15 text-accent-glow font-medium'
                : 'text-text-muted hover:text-text hover:bg-white/5'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Convert to Project CTA */}
      {!isLost && (
        <button
          onClick={handleWonToProject}
          className={cn(
            'w-full card p-3 transition text-left',
            isWon
              ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
              : 'border-accent/20 bg-accent/[0.03] hover:bg-accent/[0.06]'
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                isWon ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-accent/10 border border-accent/20'
              )}
            >
              <FolderPlus size={13} className={isWon ? 'text-emerald-400' : 'text-accent-glow'} />
            </div>
            <div>
              <div className={cn('text-[11px] font-medium', isWon ? 'text-emerald-400' : 'text-accent-glow')}>
                转为交付项目
              </div>
              <div className="text-[9px] text-text-muted">
                {isWon ? '客户资料与附件自动带入' : '提前创建项目开始方案设计'}
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Stage-appropriate quick actions */}
      {!isWon && !isLost && (
        <div className="card p-3 space-y-1.5">
          {stage === 'new' && (
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] text-accent-glow hover:bg-accent/5 rounded transition">
              <stageMeta.icon size={12} className="flex-shrink-0" /> 联系客户
            </button>
          )}
          {(stage === 'follow_up' || stage === 'connected') && (
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] text-accent-glow hover:bg-accent/5 rounded transition">
              <CheckCircle2 size={12} className="flex-shrink-0" /> 安排会议
            </button>
          )}
          {(stage === 'meeting_scheduled' || stage === 'estimate_sent') && (
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] text-accent-glow hover:bg-accent/5 rounded transition">
              <FolderPlus size={12} className="flex-shrink-0" /> 发送报价
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
