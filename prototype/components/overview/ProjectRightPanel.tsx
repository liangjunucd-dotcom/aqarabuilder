'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Users, MapPin, Building2, Calendar, ExternalLink, Cpu, Sparkles, Plus, Tag, Shield, Phone, MessageSquare, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  STATUS_META, STATUS_ORDER, MANAGED_STATUS_PRESETS,
  SOLUTION_STATUS_META, resolveSolutionStatus, resolveProjectStatus,
  setProjectStatus,
  type Project, type ProjectStatus,
} from '@/lib/mock/projects';
import { getCustomer, TAG_LABEL, TAG_COLOR } from '@/lib/mock/customers';

export function ProjectRightPanel({
  project,
  onLinkCustomer,
}: {
  project: Project;
  onLinkCustomer?: () => void;
}) {
  const isSolution = !project.customerId;
  const ss = resolveSolutionStatus(project);
  const ssMeta = SOLUTION_STATUS_META[ss];
  const status = resolveProjectStatus(project);
  const statusMeta = STATUS_META[status];
  const customer = project.customerId ? getCustomer(project.customerId) : null;
  const schedule = project.schedule ?? [];
  const managers = project.managers ?? [];
  const tags = project.tags ?? (customer ? [TAG_LABEL[customer.tag]] : []);
  const [, forceUpdate] = useState(0);
  const [managedOpen, setManagedOpen] = useState(false);
  const managedPresets = isSolution ? [] : MANAGED_STATUS_PRESETS[status] || [];
  const currentIdx = STATUS_ORDER.indexOf(status);

  const buildingLabel = project.buildingType
    ? { apartment: '公寓', villa: '别墅', office: '办公', store: '商铺', stadium: '场馆', hotel: '酒店', school: '学校', other: '其他' }[project.buildingType]
    : null;

  return (
    <aside className="space-y-3">
      {/* Location & Building type */}
      <div className="card p-3 space-y-2.5">
        <div className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
          项目信息
        </div>

        {project.city && (
          <div className="flex items-center gap-2 text-[11px]">
            <MapPin size={12} className="text-text-subtle flex-shrink-0" />
            <span className="text-text">{project.city}</span>
            {project.countryLabel && (
              <span className="text-text-muted">{project.countryLabel}</span>
            )}
          </div>
        )}

        {buildingLabel && (
          <div className="flex items-center gap-2 text-[11px]">
            <Building2 size={12} className="text-text-subtle flex-shrink-0" />
            <span className="text-text">{buildingLabel}</span>
          </div>
        )}

        {project.devices > 0 && (
          <div className="flex items-center gap-2 text-[11px]">
            <Cpu size={12} className="text-text-subtle flex-shrink-0" />
            <span className="text-text">设备 {project.devices} 台</span>
            {project.personas > 0 && (
              <span className="text-text-muted">· {project.personas} Persona</span>
            )}
          </div>
        )}

        {!project.city && !buildingLabel && (
          <p className="text-[10px] text-text-muted">暂无信息</p>
        )}
      </div>

      {/* Status change */}
      <div className="card p-3 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
          项目状态
        </span>
        {isSolution ? (
          <p className="text-[10px] text-text-muted">
            关联客户后转为交付项目，即可切换状态
          </p>
        ) : (
          <>
            <select
              value={status}
              onChange={e => {
                setProjectStatus(project.id, e.target.value as ProjectStatus);
                forceUpdate(v => v + 1);
              }}
              className="w-full px-2.5 py-1.5 rounded border border-border bg-bg text-[11px] text-text outline-none focus:border-accent/50"
            >
              {STATUS_ORDER.map(s => (
                <option key={s} value={s}>{STATUS_META[s].emoji} {STATUS_META[s].label}</option>
              ))}
            </select>

            {/* Managed status */}
            {managedPresets.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setManagedOpen(o => !o)}
                  className="w-full mt-1.5 flex items-center justify-between px-2.5 py-1.5 rounded border border-border/60 bg-bg-elevated/30 text-[10px] text-text-muted hover:text-text transition"
                >
                  <span>{project.managedStatus || '选择子状态...'}</span>
                  <ChevronDown size={10} className={cn('transition', managedOpen && 'rotate-180')} />
                </button>
                {managedOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-border bg-bg-elevated shadow-lg z-20 overflow-hidden">
                    {managedPresets.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          project.managedStatus = opt;
                          setManagedOpen(false);
                          forceUpdate(v => v + 1);
                        }}
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 text-[10px] hover:bg-white/5 transition',
                          project.managedStatus === opt ? 'text-accent-glow bg-accent/5' : 'text-text-muted'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer info */}
      <div className="card p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
            客户
          </span>
          {!customer && (
            <button
              onClick={onLinkCustomer}
              className="text-[10px] text-accent-glow hover:underline inline-flex items-center gap-1"
            >
              <Plus size={10} /> 关联
            </button>
          )}
        </div>

        {customer ? (
          <>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ background: customer.avatarGradient }}
              >
                {customer.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-text truncate">
                  {project.customerName || customer.name}
                </div>
                <div className="text-[10px] text-text-muted">
                  {customer.city} · {customer.spaceName}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <Link
                href={`/pro/customers?focus=${customer.id}`}
                className="flex-1 px-2 py-1.5 rounded border border-border text-[10px] text-text-muted hover:text-text text-center transition"
              >
                查看档案
              </Link>
              <button className="px-2 py-1.5 rounded border border-border text-[10px] text-text-muted hover:text-text inline-flex items-center gap-1">
                <Phone size={10} /> 联系
              </button>
              <button className="px-2 py-1.5 rounded border border-border text-[10px] text-text-muted hover:text-text inline-flex items-center gap-1">
                <MessageSquare size={10} /> 消息
              </button>
            </div>
          </>
        ) : project.customerName ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs text-text-muted flex-shrink-0">
                {project.customerName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-text truncate">{project.customerName}</div>
                <div className="text-[10px] text-text-muted">待关联客户档案</div>
              </div>
            </div>
            <button
              onClick={onLinkCustomer}
              className="w-full px-2 py-1.5 rounded border border-accent/30 bg-accent/5 text-[10px] text-accent-glow hover:bg-accent/10 transition"
            >
              完善客户档案
            </button>
          </div>
        ) : (
          <button
            onClick={onLinkCustomer}
            className="w-full px-3 py-2 rounded border border-dashed border-border hover:border-accent/40 hover:bg-accent/[0.02] text-[10px] text-text-muted hover:text-accent-glow transition"
          >
            <Plus size={11} className="inline mr-1" />
            关联客户
          </button>
        )}
      </div>

      {/* Collaborators */}
      <div className="card p-3 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
          协作者
        </span>
        {managers.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {managers.map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-bg border border-border text-[10px]"
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-accent/60 to-accent2/60 flex items-center justify-center text-[7px] font-semibold text-white">
                  {name.charAt(0)}
                </div>
                {name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-text-muted">暂无协作者</p>
        )}
        <button className="text-[10px] text-accent-glow hover:underline inline-flex items-center gap-1">
          <Plus size={10} /> 邀请
        </button>
      </div>

      {/* Tags */}
      <div className="card p-3 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
          标签
        </span>
        <div className="flex flex-wrap gap-1">
          {tags.length > 0 ? (
            tags.slice(0, 5).map((tag, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded text-[9px] border"
                style={{
                  background: `${Object.values(TAG_COLOR)[i % Object.keys(TAG_COLOR).length]}10`,
                  borderColor: `${Object.values(TAG_COLOR)[i % Object.keys(TAG_COLOR).length]}30`,
                  color: Object.values(TAG_COLOR)[i % Object.keys(TAG_COLOR).length],
                }}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-text-muted">无标签</span>
          )}
        </div>
      </div>

      {/* Key schedule */}
      {schedule.length > 0 && (
        <div className="card p-3 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
            关键日程
          </span>
          <div className="space-y-1.5">
            {schedule.slice(0, 3).map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px]">
                <Calendar size={10} className="text-text-subtle flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-text truncate">{m.title}</div>
                  <div className="text-text-muted">{m.date} ({m.day})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked resources */}
      <div className="card p-3 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-text-subtle font-semibold">
          关联资源
        </span>
        <div className="space-y-1">
          {project.linkedStudioId ? (
            <Link
              href={`/pro/studios/${project.linkedStudioId}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-text-muted hover:text-text hover:bg-white/5 transition"
            >
              <Building2 size={11} className="flex-shrink-0 text-accent-glow" />
              Studio 已关联
              <ExternalLink size={9} className="ml-auto text-text-subtle" />
            </Link>
          ) : (
            <span className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-text-subtle">
              <Building2 size={11} className="flex-shrink-0" />
              Studio · 待关联
            </span>
          )}

          <Link
            href={`/build?entry=pro&demo_as=pro&workflow=space&project=${project.id}`}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-text-muted hover:text-text hover:bg-white/5 transition"
          >
            <Sparkles size={11} className="flex-shrink-0" />
            户型图 · 点位设计
            <ExternalLink size={9} className="ml-auto text-text-subtle" />
          </Link>

          <Link
            href={`/pro/company?tab=contacts`}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-text-muted hover:text-text hover:bg-white/5 transition"
          >
            <Users size={11} className="flex-shrink-0" />
            Contacts
            <ExternalLink size={9} className="ml-auto text-text-subtle" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
