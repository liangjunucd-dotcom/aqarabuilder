'use client';

import { MapPin, Clock, DollarSign, TrendingUp, Plus, Phone, Mail, MessageSquare, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LEAD_STAGE_META,
  MANAGED_LEAD_STAGES,
  resolveLeadStage,
  type Lead,
  type LeadStage,
} from '@/lib/mock/leads';

const SOURCE_LABEL: Record<string, string> = {
  '门店转介': '门店转介',
  '官网表单': '官网表单',
  '社交媒体': '社交媒体',
  'Life App 询单': 'Life App 询单',
  '客户推荐': '客户推荐',
  'EU Builder Network': 'EU Builder Network',
  '社区话题转介': '社区话题转介',
};

export function LeadRightPanel({
  lead,
  onStageChange,
}: {
  lead: Lead;
  onStageChange?: (stage: LeadStage) => void;
}) {
  const stage = resolveLeadStage(lead);
  const stageMeta = LEAD_STAGE_META[stage];
  const managedOptions = MANAGED_LEAD_STAGES[stage] || [];
  const isClosed = stage === 'won' || stage === 'lost';

  return (
    <aside className="space-y-3">
      {/* Customer info */}
      <div className="card p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
            客户信息
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            {lead.customer.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-text truncate">{lead.customer}</div>
            <div className="text-[10px] text-text-muted">{lead.city}</div>
          </div>
        </div>
        {lead.email && (
          <div className="flex items-center gap-2 text-[11px]">
            <Mail size={11} className="text-text-subtle flex-shrink-0" />
            <span className="text-text truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-[11px]">
            <Phone size={11} className="text-text-subtle flex-shrink-0" />
            <span className="text-text">{lead.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-1">
          <button className="flex-1 px-2 py-1.5 rounded border border-border text-[10px] text-text-muted hover:text-text text-center transition inline-flex items-center justify-center gap-1">
            <Phone size={9} /> 联系
          </button>
          <button className="flex-1 px-2 py-1.5 rounded border border-border text-[10px] text-text-muted hover:text-text text-center transition inline-flex items-center justify-center gap-1">
            <MessageSquare size={9} /> 消息
          </button>
        </div>
      </div>

      {/* Lead info */}
      <div className="card p-3 space-y-2.5">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
          线索信息
        </span>
        <div className="flex items-center gap-2 text-[11px]">
          <MapPin size={11} className="text-text-subtle flex-shrink-0" />
          <span className="text-text">{lead.city}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <Building2 size={11} className="text-text-subtle flex-shrink-0" />
          <span className="text-text">{lead.size}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <DollarSign size={11} className="text-text-subtle flex-shrink-0" />
          <span className="text-text">{lead.budget}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <TrendingUp size={11} className="text-text-subtle flex-shrink-0" />
          <span className="text-text-muted">来源: {SOURCE_LABEL[lead.source] || lead.source}</span>
        </div>
        {lead.matchScore != null && (
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-text-subtle flex-shrink-0 text-[10px]">匹配度</span>
            <span className="text-accent-glow font-medium">{lead.matchScore}%</span>
          </div>
        )}
        {lead.responseHours != null && lead.responseSla != null && (
          <div className="flex items-center gap-2 text-[11px]">
            <Clock size={11} className="text-text-subtle flex-shrink-0" />
            <span
              className={cn(
                lead.responseHours > lead.responseSla * 0.8 ? 'text-warning' : 'text-text'
              )}
            >
              {lead.responseHours}h / {lead.responseSla}h SLA
            </span>
          </div>
        )}
      </div>

      {/* Stage */}
      <div className="card p-3 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
          阶段
        </span>
        <select
          value={stage}
          onChange={e => onStageChange?.(e.target.value as LeadStage)}
          className="w-full px-2.5 py-1.5 rounded border border-border bg-bg text-[11px] text-text outline-none focus:border-accent/50"
        >
          {Object.entries(LEAD_STAGE_META).map(([key, m]) => (
            <option key={key} value={key}>{m.label}</option>
          ))}
        </select>

        {/* Managed stage */}
        {managedOptions.length > 0 && (
          <>
            <div className="text-[10px] text-text-subtle mt-2">子阶段</div>
            <select
              value={lead.managedStage || ''}
              onChange={e => { lead.managedStage = e.target.value || undefined; }}
              className="w-full px-2.5 py-1.5 rounded border border-border bg-bg text-[11px] text-text outline-none focus:border-accent/50"
            >
              <option value="">-- 选择子阶段 --</option>
              {managedOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </>
        )}

        {lead.orderId && (
          <div className="text-[10px] text-text-muted">订单: {lead.orderId}</div>
        )}
      </div>

      {/* Tags */}
      <div className="card p-3 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
          标签
        </span>
        <div className="flex flex-wrap gap-1">
          {lead.tags.length > 0 ? (
            lead.tags.map((tag, i) => {
              const colors = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];
              const c = colors[i % colors.length];
              return (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded text-[9px] border"
                  style={{ background: `${c}15`, borderColor: `${c}30`, color: c }}
                >
                  {tag}
                </span>
              );
            })
          ) : (
            <span className="text-[10px] text-text-muted">无标签</span>
          )}
        </div>
      </div>

      {/* Collaborators */}
      <div className="card p-3 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
          协作者
        </span>
        <p className="text-[10px] text-text-muted">暂无协作者</p>
        <button className="text-[10px] text-accent-glow hover:underline inline-flex items-center gap-1">
          <Plus size={10} /> 邀请
        </button>
      </div>

      {/* SLA reminder */}
      {!isClosed && lead.responseSla != null && (
        <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-[10px] text-amber-400">
          <Clock size={10} className="inline mr-1" />
          请在 {lead.responseSla}h 内响应线索以最大化转化率
        </div>
      )}
    </aside>
  );
}
