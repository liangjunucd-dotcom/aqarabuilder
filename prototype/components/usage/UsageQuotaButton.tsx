'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BriefcaseBusiness, RefreshCw } from 'lucide-react';
import { getUsageCenterPool, type UsageCenterPool } from '@/lib/ai-pool';
import { getPlan, type PlanId } from '@/lib/plans';
import type { WorkspaceRole, WorkspaceType } from '@/lib/workspaces';
import { cn } from '@/lib/utils';

type UsageQuotaButtonProps = {
  align?: 'left' | 'right';
  compact?: boolean;
  showLabel?: boolean;
  planId?: PlanId;
  workspaceId?: string;
  workspaceName?: string;
  workspaceType?: WorkspaceType;
  workspaceRole?: WorkspaceRole;
  professional?: boolean;
  pool?: UsageCenterPool;
  surface?: 'light' | 'dark';
};

export function UsageQuotaButton({
  align = 'right',
  compact = false,
  showLabel = false,
  planId = 'free',
  workspaceId,
  workspaceName,
  workspaceType,
  workspaceRole,
  professional = false,
  pool,
  surface = 'light',
}: UsageQuotaButtonProps) {
  const [open, setOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const resolvedPool = pool ?? getUsageCenterPool({ planId, workspaceId, workspaceName, professional });
  const quotaItems = resolvedPool.buckets.map(item => ({ ...item, key: item.category }));
  const totalUsed = quotaItems.reduce((sum, item) => sum + item.used, 0);
  const totalLimit = quotaItems.reduce((sum, item) => sum + item.limit, 0);
  const usageRatio = totalLimit > 0 ? totalUsed / totalLimit : 0;
  const remainingRatio = Math.max(0, 1 - usageRatio);
  const usedPercent = Math.round(Math.min(usageRatio, 1) * 100);
  const remainingPercent = Math.round(remainingRatio * 100);
  const remainingDasharray = `${remainingPercent} 100`;
  const resolvedPlanId = resolvedPool.planId;
  const planBadge = resolvedPool.planName;
  const plan = getPlan(resolvedPlanId);
  const planPrice = plan?.priceLabel ?? (resolvedPlanId === 'free' ? '$0' : 'Region-based');
  const planSource = planSourceLabel({ planId: resolvedPlanId, workspaceType });
  const creditsUsed = totalUsed;
  const creditsLimit = totalLimit;
  const settingsHref = workspaceId ? `/pro/settings?tab=plan&workspace=${workspaceId}` : '/pro/settings?tab=plan';
  const usageDetailsHref = workspaceId ? `/pro/settings?tab=usage&workspace=${workspaceId}` : '/home/credits';
  const action = usageActionForPlan({
    planId: resolvedPlanId,
    settingsHref,
    inWorkspaceContext: Boolean(workspaceId),
    professional,
    workspaceType,
    workspaceRole,
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className={cn(
          'relative flex items-center justify-center rounded-full border shadow-sm transition',
          surface === 'dark'
            ? 'border-white/20 bg-white/10 text-white shadow-black/20 hover:bg-white/20'
            : 'border-slate-200 bg-white text-slate-600 shadow-slate-200/60 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950',
          compact ? 'h-7 gap-1.5 px-2.5' : showLabel ? 'h-9 gap-2 px-3' : 'h-9 w-9'
        )}
        aria-label={`Current plan: ${planBadge}`}
        title={`Current plan: ${planBadge}`}
      >
        <svg viewBox="0 0 36 36" className={cn(compact ? 'h-4 w-4' : 'h-6 w-6', showLabel || compact ? 'shrink-0' : '')} aria-hidden="true">
          <path
            d="M18 2.8a15.2 15.2 0 1 1 0 30.4 15.2 15.2 0 0 1 0-30.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={surface === 'dark' ? 'text-white/20' : 'text-slate-200'}
          />
          <path
            d="M18 2.8a15.2 15.2 0 1 1 0 30.4 15.2 15.2 0 0 1 0-30.4"
            fill="none"
            pathLength="100"
            strokeDasharray={remainingDasharray}
            strokeLinecap="round"
            strokeWidth="3"
            className={remainingPercent <= 20 ? 'text-amber-500' : 'text-blue-500'}
          />
        </svg>
        <span
          className={cn(
            'absolute rounded-full border shadow-sm',
            surface === 'dark' ? 'border-[#0d1222]' : 'border-white',
            compact ? 'left-5 top-1.5 h-1.5 w-1.5' : showLabel ? 'left-7 top-2 h-2 w-2' : 'right-2 top-2 h-2 w-2',
            remainingPercent <= 20 ? 'bg-amber-400' : 'bg-blue-500'
          )}
        />
        {showLabel || compact ? (
          <span className="hidden text-xs font-semibold sm:inline">
            {planBadge}
          </span>
        ) : null}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute top-full z-50 mt-2 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-slate-300/70',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Current Plan</div>
                  {workspaceId ? <div className="mt-0.5 text-xs text-slate-400">Current Workspace · {resolvedPool.workspaceName}</div> : null}
                </div>
                <button className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-slate-900" title="刷新">
                  <RefreshCw size={13} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-slate-950">
                    {planBadge}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{planSource}</div>
                </div>
                <span className="text-sm font-semibold text-slate-800">{planPrice}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4">
              <div>
                <div className="flex items-end justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-800">Credits</div>
                  <span className="text-sm font-semibold text-slate-700 tabular-nums">
                    {creditsUsed} <span className="font-medium text-slate-400">/ {creditsLimit}</span>
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full', usedPercent >= 85 ? 'bg-amber-500' : 'bg-emerald-500')}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <Link href={usageDetailsHref} onClick={() => setOpen(false)} className="font-medium text-sky-600 transition hover:text-sky-700">
                    Usage Details
                  </Link>
                </div>
              </div>
            </div>

            {action ? (
              <div className="border-t border-slate-100 p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-600"
                      title={action.iconHint}
                    >
                      <BriefcaseBusiness size={14} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-slate-800">
                        {requestSubmitted && action.kind === 'request' ? 'Request submitted' : action.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{action.description}</span>
                    </span>
                  </div>
                  {action.kind === 'request' ? (
                    <button
                      type="button"
                      disabled={requestSubmitted}
                      onClick={() => setRequestSubmitted(true)}
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition',
                        requestSubmitted
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                          : 'bg-slate-900 text-white hover:bg-blue-700'
                      )}
                    >
                      {requestSubmitted ? 'Requested' : action.label}
                    </button>
                  ) : (
                    <Link
                      href={action.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition',
                        action.primary
                          ? 'bg-slate-900 text-white hover:bg-blue-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {action.label}
                      {action.external ? <ArrowUpRight size={12} /> : null}
                    </Link>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                  <span className="whitespace-nowrap text-slate-400">Earn Credits through partner activity</span>
                  <Link href="/home/profile" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200">
                    Go <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

function planSourceLabel({
  planId,
  workspaceType,
}: {
  planId: PlanId;
  workspaceType?: WorkspaceType;
}) {
  if (planId === 'free') return 'Included with your Aqara Account';
  if (workspaceType === 'team') return 'Assigned to this Workspace';
  if (planId === 'enterprise') return 'Managed by contract';
  return 'Personal plan on your Aqara Account';
}

function usageActionForPlan({
  planId,
  settingsHref,
  inWorkspaceContext,
  professional,
  workspaceType,
  workspaceRole,
}: {
  planId: PlanId;
  settingsHref: string;
  inWorkspaceContext: boolean;
  professional: boolean;
  workspaceType?: WorkspaceType;
  workspaceRole?: WorkspaceRole;
}) {
  const canManageWorkspaceCredits = workspaceRole === 'owner' || workspaceRole === 'billing_admin' || workspaceRole === 'admin';

  if (planId === 'free') {
    if (professional) {
      return inWorkspaceContext
        ? {
          title: 'Workspace Plan',
          description: 'Professional Free is active for this Workspace.',
          iconHint: 'Professional identity is already active',
          label: 'Manage',
          href: settingsHref,
          primary: false,
          external: false,
          kind: 'link' as const,
        }
        : null;
    }
  }

  if (!inWorkspaceContext && !professional) {
    return {
      title: 'Become a Partner',
      description: 'Enter Builder Pro',
      iconHint: 'Professional 是免费激活的专业身份',
      label: 'Apply',
      href: '/onboarding?intent=professional_profile&from=%2Fhome',
      primary: true,
      external: false,
      kind: 'link' as const,
    };
  }

  if (planId === 'pro') {
    return {
      title: 'Need More Credits?',
      description: '购买加量包，或升级到更高额度。',
      iconHint: 'Pro 可购买 Add-on Credits',
      label: 'Buy',
      href: '/home/credits?request=1',
      primary: true,
      external: false,
      kind: 'request' as const,
    };
  }

  if (workspaceType === 'team' && !canManageWorkspaceCredits) {
    return {
      title: 'Need More Credits?',
      description: '请联系 Workspace Owner 或 Billing Admin 调整共享额度。',
      iconHint: '团队 Credits 由 Workspace 管理员管理',
      label: 'Plans & Credits',
      href: settingsHref,
      primary: false,
      external: false,
      kind: 'link' as const,
    };
  }

  return {
    title: 'Need More Credits?',
    description: planId === 'enterprise' ? '联系 Aqara 调整合同 Credits 或企业额度。' : '增加组织共享 Credits 额度。',
    iconHint: '团队 Credits 归属于当前 Workspace',
    label: planId === 'enterprise' ? 'Contact Aqara' : 'Request',
    href: settingsHref,
    primary: false,
    external: false,
    kind: planId === 'enterprise' ? 'link' as const : 'request' as const,
  };
}
