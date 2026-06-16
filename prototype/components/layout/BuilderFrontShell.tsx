'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRole } from '@/lib/role';
import { GuestFrontSidebar } from '@/components/layout/GuestFrontSidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';

const PUBLIC_READABLE_PATHS = ['/home', '/home/discover', '/marketplace'];
const PUBLIC_READABLE_PREFIXES = ['/u/', '/showcase/', '/marketplace/skill'];

export function BuilderFrontShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { role, mounted } = useRole();
  const isPublicReadable =
    PUBLIC_READABLE_PATHS.includes(pathname) ||
    PUBLIC_READABLE_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const showGuestSidebar = mounted && role === 'anonymous' && isPublicReadable;
  const needsAuth = mounted && role === 'anonymous' && !isPublicReadable;

  useEffect(() => {
    if (!needsAuth) return;
    router.replace(`/signin?redirect=${encodeURIComponent(pathname || '/home')}`);
  }, [needsAuth, pathname, router]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#eef1f6]">
      {showGuestSidebar ? <GuestFrontSidebar /> : <UserSidebar />}
      <div className="relative z-30 h-screen min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
