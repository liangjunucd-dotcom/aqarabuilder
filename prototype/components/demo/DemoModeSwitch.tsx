'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Beaker, Check, ChevronDown, Plus, User, Rocket, Hammer, ShieldCheck } from 'lucide-react';
import { useRole, setRole, ROLE_LABEL, ROLE_DESC, Role } from '@/lib/role';
import {
  getActiveWorkspace,
  getWorkspaces,
  setActiveWorkspace,
  subscribeWorkspaceChange,
  WORKSPACE_ROLE_LABEL,
  WORKSPACE_TYPE_LABEL,
  type BuilderWorkspace,
} from '@/lib/workspaces';
import { cn } from '@/lib/utils';

const OPTIONS: { id: Role; icon: any; routeOnSwitch: string; planTag: string }[] = [
  { id: 'anonymous', icon: User,        routeOnSwitch: '/?demo_as=anonymous',         planTag: 'Visitor' },
  { id: 'builder',   icon: Hammer,      routeOnSwitch: '/home?demo_as=builder',       planTag: 'User' },
  { id: 'pro',       icon: Rocket,      routeOnSwitch: '/pro/personal/home?demo_as=pro',      planTag: 'Professional' },
  { id: 'verified',  icon: ShieldCheck, routeOnSwitch: '/pro/personal/home?demo_as=verified', planTag: 'Certified' },
];

// Pages where role switch should NOT navigate away (the page works for all roles)
const NO_NAVIGATE_PATHS = ['/build', '/spider'];
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function removeBasePath(pathname: string) {
  if (!BASE_PATH) return pathname;
  if (pathname === BASE_PATH) return '/';
  if (pathname.startsWith(`${BASE_PATH}/`)) return pathname.slice(BASE_PATH.length) || '/';
  return pathname;
}

function withBasePath(href: string) {
  if (!BASE_PATH || !href.startsWith('/')) return href;
  if (href === BASE_PATH || href.startsWith(`${BASE_PATH}/`)) return href;
  return `${BASE_PATH}${href}`;
}

function normalizeDemoRole(value: string | null): Role | null {
  if (value === 'user') return 'builder';
  if (value === 'anonymous' || value === 'builder' || value === 'pro' || value === 'verified') return value;
  return null;
}

function currentPathWithRole(role: Role) {
  if (typeof window === 'undefined') return OPTIONS.find(o => o.id === role)?.routeOnSwitch ?? '/';
  const url = new URL(window.location.href);
  url.searchParams.set('demo_as', role);
  return `${url.pathname}${url.search}${url.hash}`;
}


export function DemoModeSwitch() {
  const { role, mounted } = useRole();
  const [open, setOpen] = useState(false);
  const [urlRole, setUrlRole] = useState<Role | null>(null);
  const [activeWorkspace, setActiveWorkspaceState] = useState<BuilderWorkspace | null>(null);
  const rawPathname = usePathname() ?? '';
  const pathname = removeBasePath(rawPathname);
  const displayRole = urlRole ?? role;
  const isProPath = pathname.startsWith('/pro');

  useEffect(() => {
    const syncUrlRole = () => {
      const nextRole = normalizeDemoRole(new URLSearchParams(window.location.search).get('demo_as'));
      setUrlRole(nextRole);
      if (nextRole) setRole(nextRole);
    };
    syncUrlRole();
    window.addEventListener('popstate', syncUrlRole);
    return () => window.removeEventListener('popstate', syncUrlRole);
  }, [pathname]);

  useEffect(() => {
    if (!isProPath) return;
    setActiveWorkspaceState(getActiveWorkspace());
    return subscribeWorkspaceChange(setActiveWorkspaceState);
  }, [isProPath, pathname]);

  if (!mounted) return null;

  // Hide on full-screen IDE / canvas pages (avoid covering tools)
  const HIDDEN_PATHS = [
    '/signin',
    '/life/signin',
    '/onboarding',
    '/build',
    '/pro/build/copilot',
    '/pro/build/capture',
    '/pro/build/driver',
    '/pro/build/dashboard',
    '/pro/build/app-plugin',
    '/pro/build/service',
  ];
  if (pathname && HIDDEN_PATHS.some(p => pathname.startsWith(p))) {
    return null;
  }

  const handleSwitch = (r: Role) => {
    const nextRole = normalizeDemoRole(r) ?? 'anonymous';
    setRole(nextRole);
    setUrlRole(nextRole);
    setOpen(false);
    const navigate = (target: string) => {
      window.location.assign(withBasePath(target));
    };

    if (pathname && NO_NAVIGATE_PATHS.some(p => pathname.startsWith(p))) {
      navigate(currentPathWithRole(nextRole));
      return;
    }

    if (pathname.startsWith('/pro') && (nextRole === 'pro' || nextRole === 'verified')) {
      navigate(currentPathWithRole(nextRole));
      return;
    }

    if (pathname.startsWith('/home') && nextRole === 'builder') {
      navigate(currentPathWithRole(nextRole));
      return;
    }

    const target = OPTIONS.find(o => o.id === nextRole)!.routeOnSwitch;
    navigate(target);
  };

  const handleWorkspaceSwitch = (workspace: BuilderWorkspace) => {
    setActiveWorkspace(workspace.id);
    setActiveWorkspaceState(workspace);
    setOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('workspace', workspace.id);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const proWorkspaces = isProPath ? getWorkspaces() : [];
  const recentWorkspaces = proWorkspaces.slice(0, 5);

  const roleOptions = (
    <div className="p-1.5">
      {OPTIONS.map(o => {
        const active = displayRole === o.id;
        return (
          <button
            key={o.id}
            onClick={() => handleSwitch(o.id)}
            className={cn(
              'w-full px-3 py-2.5 rounded-md text-left flex items-start gap-3 transition',
              active ? 'bg-accent/10' : 'hover:bg-white/5'
            )}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0',
                active
                  ? 'bg-gradient-to-br from-accent to-accent2 text-white'
                  : 'bg-white/5 text-text-muted'
              )}
            >
              <o.icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-1.5">
                {ROLE_LABEL[o.id]}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border bg-bg-elevated text-text-muted">
                  {o.planTag}
                </span>
                {active && <Check size={11} className="text-accent-glow ml-auto" />}
              </div>
              <div className="text-2xs text-text-muted leading-relaxed mt-0.5">
                {ROLE_DESC[o.id]}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {open && (
        <div className="mb-2 w-72 rounded-xl border border-border-strong bg-bg-elevated/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Beaker size={13} className="text-accent-glow" />
            <span className="text-xs font-medium">{isProPath ? 'Demo Mode · 身份与 Workspace' : 'Demo Mode · 身份阶段'}</span>
            <span className="ml-auto text-2xs text-text-subtle">原型演示</span>
          </div>
          {isProPath ? (
            <>
            <div className="p-1.5">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-subtle">
                Most recent
              </div>
              {recentWorkspaces.map(workspace => {
                const active = activeWorkspace?.id === workspace.id;
                const initials = workspace.name
                  .split(/\s+/)
                  .map(part => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <button
                    key={workspace.id}
                    onClick={() => handleWorkspaceSwitch(workspace)}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-md text-left flex items-center gap-3 transition',
                      active ? 'bg-success/10' : 'hover:bg-white/5'
                    )}
                  >
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold', active ? 'bg-success text-white' : 'bg-success/20 text-success')}>
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <span className="truncate">{workspace.name}</span>
                        {active && <Check size={11} className="text-success ml-auto" />}
                      </span>
                      <span className="mt-0.5 block truncate text-2xs text-text-muted">
                        {WORKSPACE_TYPE_LABEL[workspace.type]} · {WORKSPACE_ROLE_LABEL[workspace.role]}
                      </span>
                    </span>
                  </button>
                );
              })}
              <div className="mt-1 border-t border-border p-1.5">
                <a href={withBasePath('/pro/workspaces')} className="block rounded-md px-3 py-2 text-sm text-text-muted transition hover:bg-white/5 hover:text-text">
                  More...
                </a>
                <a href={withBasePath('/pro/workspaces?new=1')} className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted transition hover:bg-white/5 hover:text-text">
                  <Plus size={13} />
                  Create workspace
                </a>
              </div>
            </div>
            <div className="border-t border-border">
              <div className="px-4 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-subtle">
                身份阶段
              </div>
              {roleOptions}
            </div>
            </>
          ) : (
            roleOptions
          )}
          <div className="px-4 py-2.5 border-t border-border bg-white/[0.02] text-2xs text-text-subtle leading-relaxed">
            ⓘ 仅原型演示用 — 真实环境通过登录、Onboarding、认证逐步进阶。
            <br />
            Free / Pro / Business / Enterprise 可在
            {' '}<a href={withBasePath('/pricing')} className="text-accent-glow hover:underline">套餐页</a>{' '}
            查看升级路径。
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg transition',
          open
            ? 'border-accent/50 bg-accent/15 text-text'
            : 'border-border-strong bg-bg-elevated/90 backdrop-blur-xl text-text-muted hover:text-text hover:border-accent/30'
        )}
      >
        <Beaker size={13} className="text-accent-glow" />
        <span className="text-xs">
          Demo · <span className="text-text">{ROLE_LABEL[displayRole]}</span>
        </span>
        <ChevronDown size={11} className={cn('transition', open && 'rotate-180')} />
      </button>
    </div>
  );
}
