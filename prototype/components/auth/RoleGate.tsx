'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole, setRole, getRole, Role, isProBuilderRole } from '@/lib/role';

// Synchronously seed role from URL on client mount
if (typeof window !== 'undefined') {
  try {
    const url = new URL(window.location.href);
    const seed = url.searchParams.get('demo_as') as Role | null;
    if (seed && (seed === 'user' || seed === 'builder' || seed === 'pro' || seed === 'verified' || seed === 'anonymous')) {
      localStorage.setItem('aqara_demo_role', seed === 'user' ? 'builder' : seed);
    }
  } catch {}
}

/**
 * Pro 路由门禁。
 * - SSR 阶段直接渲染 children（避免全屏 loader 闪烁）
 * - 客户端挂载后检查角色，未完成 onboarding 则重定向
 */
export function ProGate({ children }: { children: React.ReactNode }) {
  const { role, mounted } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;
    const urlRole = (() => {
      try {
        const seed = new URL(window.location.href).searchParams.get('demo_as') as Role | null;
        return seed === 'user' ? 'builder' : seed;
      } catch {
        return null;
      }
    })();
    const liveRole = urlRole && (urlRole === 'builder' || urlRole === 'pro' || urlRole === 'verified' || urlRole === 'anonymous')
      ? urlRole
      : getRole();
    if (liveRole !== role) setRole(liveRole);
    // Professional / Certified 身份可进入 Builder Pro；普通 Builder 需先 onboarding
    if (!isProBuilderRole(liveRole)) {
      const target = liveRole === 'anonymous' ? '/signin?redirect=%2Fpro%2Fworkspaces' : '/onboarding?from=/pro/workspaces';
      router.replace(target);
    }
  }, [role, mounted, router]);

  // Always render children — redirect happens client-side via useEffect
  return <>{children}</>;
}

/**
 * User 路由(/home/*)门禁 — 匿名跳 /signin
 */
export function UserGate({ children }: { children: React.ReactNode }) {
  const { role, mounted } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!mounted) return;
    if (role === 'anonymous') {
      router.replace('/signin?redirect=%2Fhome');
    }
  }, [role, mounted, router]);

  // Always render children — redirect happens client-side via useEffect
  return <>{children}</>;
}
