'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BriefcaseBusiness,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react';
import { ThemeMenuItem } from '@/components/theme/ThemeMenuItem';
import { isProBuilderRole, isVerifiedInstallerRole, setRole, useRole } from '@/lib/role';
import { getWorkspaceHomeHref, getWorkspaces } from '@/lib/workspaces';
import { cn } from '@/lib/utils';

export function BuilderAvatarMenu({
  onOpenPricing,
  className,
}: {
  onOpenPricing?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { role, mounted } = useRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const professional = mounted && isProBuilderRole(role);
  const certified = mounted && isVerifiedInstallerRole(role);
  const demoRole = certified ? 'verified' : professional ? 'pro' : 'builder';
  const workspaces = professional ? getWorkspaces() : [];
  const hasMultipleWorkspaces = workspaces.length > 1;
  const onlyWorkspace = workspaces[0];
  const professionalHref = hasMultipleWorkspaces
    ? `/pro/workspaces?demo_as=${demoRole}&from=builder`
    : `${onlyWorkspace ? getWorkspaceHomeHref(onlyWorkspace) : '/pro/personal/home'}?demo_as=${demoRole}`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setMenuOpen(open => !open)}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-sm font-semibold text-white shadow-sm shadow-blue-200/70 transition hover:ring-2 hover:ring-blue-300"
        aria-label="打开账号菜单"
        aria-expanded={menuOpen}
      >
        J
        {certified ? (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white bg-amber-400" />
        ) : null}
      </button>

      {menuOpen ? (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/70">
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                  J
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-950">Jun</div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">
                    {certified ? 'Certified Professional' : professional ? 'Professional' : 'Community User'}
                  </div>
                </div>
              </div>

              <Link
                href="/u/jun?profile=personal&demo_as=builder"
                onClick={closeMenu}
                className="mt-3 flex h-9 w-full items-center justify-center rounded-md border border-slate-900 bg-white text-sm font-semibold text-slate-950 transition hover:bg-slate-950 hover:text-white"
              >
                View Profile
              </Link>

              {professional ? (
                <Link
                  href={professionalHref}
                  onClick={closeMenu}
                  className="group mt-2 flex min-h-14 items-center gap-3 rounded-lg bg-slate-950 px-3 py-2.5 text-white shadow-sm transition hover:bg-blue-700"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <BriefcaseBusiness size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">
                      Builder Pro
                    </div>
                    <div className="truncate text-[11px] text-white/60 group-hover:text-white/75">
                      {hasMultipleWorkspaces ? '选择工作区进入后台' : '进入专业工作台'}
                    </div>
                  </div>
                  <ArrowRight size={15} className="shrink-0 text-white/55 transition group-hover:translate-x-0.5 group-hover:text-white" />
                </Link>
              ) : null}
            </div>

            <div className="border-t border-slate-200 py-1">
              <Link
                href={`/home/profile?demo_as=${demoRole}`}
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Settings size={15} className="text-slate-400" />
                Account Settings
              </Link>
              {onOpenPricing ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onOpenPricing();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <Sparkles size={15} className="text-slate-400" />
                  Plans &amp; Credits
                </button>
              ) : (
                <Link
                  href={`/pricing?demo_as=${demoRole}`}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <Sparkles size={15} className="text-slate-400" />
                  Plans &amp; Credits
                </Link>
              )}
              <ThemeMenuItem onDone={closeMenu} />
            </div>

            <div className="border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  setRole('anonymous');
                  router.push('/home');
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <LogOut size={15} />
                退出登录
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
