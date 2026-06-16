'use client';

import Link from 'next/link';
import {
  Sparkles, Cpu, Users, DollarSign, MapPin, Layers, GitCommit,
  ArrowRight, Plus, Zap, ExternalLink, MessageSquare, EyeOff, Shield,
  CheckCircle2, Calendar, ClipboardList, ImageIcon, FileText, Receipt,
  Circle, ChevronRight, Briefcase,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { FloorplanSVG } from '@/components/brand/FloorplanSVG';
import { CustomerBriefCard } from './CustomerBriefCard';
import type { Project } from '@/lib/mock/projects';
import type { Customer } from '@/lib/mock/customers';
import type { CustomerBrief } from '@/lib/mock/customer-briefs';

// ─── helpers ──────────────────────────────────────────────────────────────

function Metric({ icon: Icon, label, value, color = '#a855f7' }: {
  icon: any; label: string; value: string | number; color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-bg border border-border">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div>
        <div className="text-base font-semibold num" style={{ color }}>{value}</div>
        <div className="text-[10px] text-text-subtle">{label}</div>
      </div>
    </div>
  );
}

function getHighlights(project: Project) {
  const items: { icon: any; label: string; value: string | number; color: string }[] = [];
  if (project.devices > 0) items.push({ icon: Cpu, label: '设备清单', value: project.devices, color: '#a855f7' });
  if (project.personas > 0) items.push({ icon: Users, label: 'Persona', value: project.personas, color: '#06b6d4' });
  const automations = Math.max(0, (project.personas || 0) * 2 + (project.devices > 10 ? 3 : 0));
  if (automations > 0) items.push({ icon: Zap, label: '自动化规则', value: automations, color: '#f59e0b' });
  if (project.quotedAmount) items.push({ icon: DollarSign, label: '预估报价', value: `¥${formatNumber(project.quotedAmount)}`, color: '#10b981' });
  if (items.length === 0) {
    items.push({ icon: Sparkles, label: '待设计', value: '—', color: '#64748b' });
  }
  return items;
}

function maskName(name: string) {
  if (!name) return '';
  if (name.length <= 2) return name.charAt(0) + '*';
  return name.charAt(0) + '**';
}

// ─── sub-cards ────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: { id: string; title: string; done: boolean; due?: string; owner?: string; priority?: string } }) {
  return (
    <div className={cn('flex items-center gap-2.5 py-2', task.done && 'opacity-50')}>
      <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
        task.done ? 'bg-success border-success' : 'border-border-strong')}>
        {task.done && <CheckCircle2 size={10} className="text-white" />}
      </div>
      <span className={cn('text-xs flex-1 truncate', task.done ? 'line-through text-text-muted' : 'text-text')}>
        {task.title}
      </span>
      {task.owner && (
        <span className="text-[10px] text-text-subtle w-5 h-5 rounded-full bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0">
          {task.owner.charAt(0)}
        </span>
      )}
      {task.due && <span className="text-[10px] text-text-subtle w-10 text-right">{task.due}</span>}
    </div>
  );
}

function FileIcon({ kind }: { kind: string }) {
  if (kind === 'photos') return <ImageIcon size={13} className="text-cyan-400" />;
  if (kind === 'video') return <ImageIcon size={13} className="text-rose-400" />;
  if (kind === 'pdf') return <FileText size={13} className="text-red-400" />;
  if (kind === 'dwg') return <Layers size={13} className="text-amber-400" />;
  if (kind === 'json' || kind === 'js') return <Cpu size={13} className="text-purple-400" />;
  return <FileText size={13} className="text-text-subtle" />;
}

// ─── main ──────────────────────────────────────────────────────────────────

export function SolutionOverviewContent({
  project, customer, customerBrief, onLinkCustomer,
}: {
  project: Project;
  customer: Customer | null;
  customerBrief: CustomerBrief | null;
  onLinkCustomer?: () => void;
}) {
  const highlights = getHighlights(project);
  const hasLinkedCustomer = !!customer;
  const hasCustomerName = !!project.customerName;
  const hasBrief = !!customerBrief;
  const displayName = project.customerName || customer?.name || '';
  const tasks = project.tasks ?? [];
  const files = project.files ?? [];
  const financials = project.financials;
  const schedule = project.schedule ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* ═══ Column 1: Main content (spans 2) ═══ */}
      <div className="lg:col-span-2 space-y-4">

        {/* ── 最近任务 ── */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={14} className="text-accent-glow" />
            <h2 className="text-sm font-semibold">最近任务</h2>
            {tasks.length > 0 && (
              <span className="text-2xs text-text-muted num">{tasks.filter(t => t.done).length}/{tasks.length}</span>
            )}
          </div>
          {tasks.length === 0 ? (
            <p className="text-2xs text-text-muted py-3 text-center">
              {hasLinkedCustomer ? '暂无任务' : '关联客户后开始项目任务管理'}
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {tasks.slice(0, 5).map(task => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
          {tasks.length > 5 && (
            <Link href={`/pro/projects/${project.id}/overview?tab=tasks`}
              className="mt-2 text-2xs text-accent-glow hover:underline inline-flex items-center gap-1">
              查看全部任务 <ArrowRight size={9} />
            </Link>
          )}
        </div>

        {/* ── 户型与点位 ── */}
        {project.devices > 0 && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-accent-glow" />
              <h2 className="text-sm font-semibold">户型与点位</h2>
              <span className="text-2xs text-text-muted num">{project.devices} 点位</span>
            </div>
            <div className="h-36 rounded-lg border border-border relative overflow-hidden" style={{ background: project.thumbnailGradient }}>
              <div className="absolute inset-0 grid-pattern opacity-20" />
              <div className="absolute inset-4 opacity-60">
                <FloorplanSVG pattern="rooms" showDevices={false} />
              </div>
              <div className="absolute bottom-2 right-2 text-2xs text-white/70 px-1.5 py-0.5 rounded backdrop-blur-sm bg-black/30">
                户型图预览
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-3 text-2xs text-text-muted">
              <span className="flex items-center gap-1"><Cpu size={10} /> {project.devices} 设备</span>
              {project.appliedTo > 0 && <span className="flex items-center gap-1"><Layers size={10} /> {project.appliedTo} Studio</span>}
              <Link href={`/pro/projects/${project.id}/overview?tab=devices`} className="ml-auto text-accent-glow hover:underline inline-flex items-center gap-1">
                查看点位布局 <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        )}

        {/* ── 设计摘要 ── */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-accent-glow" />
            <h2 className="text-sm font-semibold">方案摘要</h2>
            {project.solutionVersion && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent-glow border border-accent/20">
                {project.solutionVersion}
              </span>
            )}
            {hasLinkedCustomer && (
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20 inline-flex items-center gap-1">
                <Shield size={9} /> 已关联客户
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {highlights.map((h, i) => (
              <Metric key={i} icon={h.icon} label={h.label} value={h.value} color={h.color} />
            ))}
          </div>
          <p className="mt-3 text-2xs text-text-muted leading-relaxed">{project.subtitle}</p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/build?entry=pro&demo_as=pro&workflow=space&project=${project.id}`}
              className="px-3 py-1.5 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Sparkles size={11} /> 在 Design Platform 中深度设计
            </Link>
            {project.linkedSolutionId && (
              <Link
                href={`/home/solutions?focus=${project.linkedSolutionId}`}
                className="px-3 py-1.5 rounded-md border border-border hover:border-border-strong text-xs text-text-muted inline-flex items-center gap-1.5"
              >
                <ExternalLink size={11} /> 前台方案页
              </Link>
            )}
          </div>
        </div>

        {/* ── 客户信息 / 关联 CTA ── */}
        {hasLinkedCustomer && customer && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-success" />
              <h2 className="text-sm font-semibold">关联客户</h2>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                <EyeOff size={9} /> 分享时需脱敏
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-semibold flex-shrink-0"
                style={{ background: customer.avatarGradient }}
              >
                {customer.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{displayName}</h3>
                  <span className="text-[10px] text-text-subtle">（分享时显示「{maskName(displayName)}」）</span>
                </div>
                <p className="text-2xs text-text-muted">{customer.city} · {customer.spaceName}</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-text-muted">
                {customer.tag}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3 text-2xs">
              <div><span className="text-text-subtle">Studios</span><p className="text-text mt-0.5">{customer.studios.length} 台</p></div>
              <div><span className="text-text-subtle">累计项目</span><p className="text-text mt-0.5">{customer.projects} 个</p></div>
              <div><span className="text-text-subtle">来源渠道</span><p className="text-text mt-0.5">{customer.acquiredVia === 'lead' ? '线索转化' : customer.acquiredVia === 'referral' ? '客户推荐' : customer.acquiredVia === 'community' ? '社区来源' : '主动上门'}</p></div>
              <div><span className="text-text-subtle">最近联系</span><p className="text-text mt-0.5">{customer.lastContact}</p></div>
            </div>
          </div>
        )}

        {/* ── 客户需求档案 ── */}
        {hasBrief && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-accent-glow" />
              <h2 className="text-sm font-semibold">客户需求档案</h2>
              <span className="text-2xs text-text-subtle">{hasLinkedCustomer ? '' : '已关联需求 · 待关联客户'}</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                <EyeOff size={9} /> 分享时需脱敏
              </span>
            </div>
            <CustomerBriefCard brief={customerBrief} />
          </div>
        )}

        {/* ── Empty: no customer linkage, no brief ── */}
        {!hasLinkedCustomer && !hasBrief && (
          <div className="card p-6 text-center border-dashed space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
              <Users size={18} className="text-accent-glow" />
            </div>
            <div>
              <p className="text-sm text-text-muted">
                {hasCustomerName ? `已命名项目 · ${displayName}` : '这是一个方案草稿'}
              </p>
              <p className="text-2xs text-text-muted mt-1 max-w-md mx-auto">
                {hasCustomerName
                  ? '已关联客户姓名，完善客户档案以启动五阶段交付流程'
                  : '关联客户以启动五阶段交付流程，或在 Design Platform 中继续完善设计。'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {onLinkCustomer && (
                <button
                  onClick={onLinkCustomer}
                  className="px-4 py-2 rounded-md bg-gradient-to-br from-accent to-accent2 text-white text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Plus size={11} /> {hasCustomerName ? '完善客户档案' : '关联客户'}
                </button>
              )}
              <Link
                href={`/build?entry=pro&demo_as=pro&workflow=space&project=${project.id}`}
                className="px-4 py-2 rounded-md border border-border hover:border-border-strong text-xs text-text-muted inline-flex items-center gap-1.5"
              >
                <Sparkles size={11} /> 继续设计
              </Link>
            </div>
          </div>
        )}

        {/* ── 客户需求档案为空但有关联客户 ── */}
        {hasLinkedCustomer && !hasBrief && (
          <div className="card p-5 text-center border-dashed space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
              <MessageSquare size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-text-muted">暂无客户需求档案</p>
              <p className="text-2xs text-text-muted mt-1">在 Design Platform 中上传客户需求或在项目设置中补充</p>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Column 2: Sidebar (spans 1) ═══ */}
      <div className="space-y-4">

        {/* ── 财务摘要 ── */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={14} className="text-accent-glow" />
            <h2 className="text-sm font-semibold">财务摘要</h2>
          </div>
          {financials ? (
            <div className="space-y-2.5">
              <div className="flex justify-between text-2xs">
                <span className="text-text-subtle">报价金额</span>
                <span className="text-text num">¥{formatNumber(financials.quotedAmount)}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-text-subtle">已开票</span>
                <span className="text-text num">¥{formatNumber(financials.invoicedAmount)}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-text-subtle">已收款</span>
                <span className="text-success num">¥{formatNumber(financials.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-2xs">
                <span className="text-text-subtle">待收</span>
                <span className={cn('num', financials.pendingAmount > 0 ? 'text-warning' : 'text-text-muted')}>
                  ¥{formatNumber(financials.pendingAmount)}
                </span>
              </div>
              {/* progress bar */}
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-success transition" style={{
                  width: `${financials.quotedAmount > 0 ? Math.round((financials.paidAmount / financials.quotedAmount) * 100) : 0}%`
                }} />
              </div>
              <p className="text-[10px] text-text-subtle text-right">
                {financials.quotedAmount > 0 ? Math.round((financials.paidAmount / financials.quotedAmount) * 100) : 0}% 已收款
                {financials.nextInvoiceDue && ` · 下次开票: ${financials.nextInvoiceDue}`}
              </p>
            </div>
          ) : (
            <p className="text-2xs text-text-muted py-4 text-center">
              {hasLinkedCustomer ? '暂无财务数据' : '关联客户后生成财务数据'}
            </p>
          )}
          <Link href={`/pro/projects/${project.id}/overview?tab=invoices`}
            className="mt-2 text-2xs text-accent-glow hover:underline inline-flex items-center gap-1">
            查看发票 <ArrowRight size={9} />
          </Link>
        </div>

        {/* ── 日程概览 ── */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-accent-glow" />
            <h2 className="text-sm font-semibold">日程概览</h2>
          </div>
          {schedule.length === 0 ? (
            <p className="text-2xs text-text-muted py-4 text-center">
              {hasLinkedCustomer ? '暂无日程' : '关联客户后排期'}
            </p>
          ) : (
            <div className="space-y-0">
              {schedule.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-stretch gap-2.5 py-2">
                  <div className="w-0.5 rounded-full flex-shrink-0" style={{
                    background: s.tone === 'critical' ? '#f59e0b' : s.tone === 'planning' ? '#6366f1' : '#64748b'
                  }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-text-subtle w-12">{s.date} {s.day}</span>
                      <span className="text-xs text-text truncate">{s.title}</span>
                    </div>
                    {s.detail && <p className="text-[10px] text-text-muted mt-0.5">{s.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href={`/pro/projects/${project.id}/overview?tab=schedule`}
            className="mt-2 text-2xs text-accent-glow hover:underline inline-flex items-center gap-1">
            查看完整日程 <ArrowRight size={9} />
          </Link>
        </div>

        {/* ── 最近文件 ── */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={14} className="text-accent-glow" />
            <h2 className="text-sm font-semibold">最近文件</h2>
          </div>
          {files.length === 0 ? (
            <p className="text-2xs text-text-muted py-4 text-center">
              {hasLinkedCustomer ? '暂无文件' : '关联客户后上传项目文件'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {files.slice(0, 5).map((f, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <FileIcon kind={f.kind} />
                  <div className="flex-1 min-w-0">
                    <p className="text-2xs text-text truncate">{f.name}</p>
                    <p className="text-[9px] text-text-subtle">
                      {f.size}{f.count ? ` · ${f.count} 张` : ''}{f.uploadedAt ? ` · ${f.uploadedAt}` : ''}
                    </p>
                  </div>
                  <span className="text-[9px] px-1 py-0.5 rounded border border-border text-text-subtle">
                    {f.tag === 'planning' ? '规划' : f.tag === 'delivery' ? '交付' : '财务'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link href={`/pro/projects/${project.id}/overview?tab=files`}
            className="mt-2 text-2xs text-accent-glow hover:underline inline-flex items-center gap-1">
            查看全部文件 <ArrowRight size={9} />
          </Link>
        </div>

        {/* ── 快捷操作 ── */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={14} className="text-accent-glow" />
            <h2 className="text-sm font-semibold">快捷操作</h2>
          </div>
          <div className="space-y-1.5">
            <Link
              href={`/build?entry=pro&demo_as=pro&workflow=space&project=${project.id}`}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-text-muted hover:text-text transition"
            >
              <Sparkles size={12} className="text-accent-glow" />
              在 Design Platform 中编辑
              <ChevronRight size={10} className="ml-auto" />
            </Link>
            {hasLinkedCustomer ? (
              <>
                <Link
                  href={`/pro/projects/${project.id}/overview?tab=estimates`}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-text-muted hover:text-text transition"
                >
                  <Receipt size={12} className="text-text-subtle" />
                  发送报价
                  <ChevronRight size={10} className="ml-auto" />
                </Link>
                <Link
                  href={`/pro/projects/${project.id}/overview?tab=site`}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-text-muted hover:text-text transition"
                >
                  <MapPin size={12} className="text-text-subtle" />
                  查看施工状态
                  <ChevronRight size={10} className="ml-auto" />
                </Link>
              </>
            ) : (
              <>
                {onLinkCustomer && (
                  <button
                    onClick={onLinkCustomer}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent/5 text-xs text-accent-glow transition"
                  >
                    <Plus size={12} />
                    关联客户
                    <ChevronRight size={10} className="ml-auto" />
                  </button>
                )}
                <Link
                  href={`/pro/projects/${project.id}/overview?tab=cubix`}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-xs text-text-muted hover:text-text transition"
                >
                  <Layers size={12} className="text-text-subtle" />
                  查看方案包
                  <ChevronRight size={10} className="ml-auto" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Full width: Version Info ═══ */}
      <div className="lg:col-span-3 card px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <GitCommit size={12} className="text-text-muted" />
          <h2 className="text-xs font-semibold text-text-muted">版本信息</h2>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-accent/5 text-text-subtle border border-border inline-flex items-center gap-1">
            <EyeOff size={9} /> 分享时不暴露客户身份
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-2xs">
          <div>
            <span className="text-text-subtle">方案版本</span>
            <p className="text-text mt-0.5">{project.solutionVersion ?? 'v0.1'}</p>
          </div>
          <div>
            <span className="text-text-subtle">创建方式</span>
            <p className="text-text mt-0.5">{project.source === 'build-ai' ? 'Design Platform · AI' : project.source === 'fork' ? 'Remix' : '手动创建'}</p>
          </div>
          <div>
            <span className="text-text-subtle">建筑类型</span>
            <p className="text-text mt-0.5">{project.buildingType ? { apartment: '公寓', villa: '别墅', office: '办公', store: '商铺', stadium: '场馆', hotel: '酒店', school: '学校', other: '其他' }[project.buildingType] : '—'}</p>
          </div>
          <div>
            <span className="text-text-subtle">最后更新</span>
            <p className="text-text mt-0.5">{project.updatedAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
