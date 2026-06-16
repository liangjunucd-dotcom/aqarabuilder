'use client';

import { UserGate } from '@/components/auth/RoleGate';
import { UserSidebar } from '@/components/layout/UserSidebar';

export function UserShell({ children }: { children: React.ReactNode }) {
  return (
    <UserGate>
      <div className="relative flex min-h-screen overflow-hidden bg-[#f4f7fb]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(37,99,235,0.12),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(20,184,166,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(244,247,251,0.92))]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.42] [background-image:radial-gradient(circle_at_1px_1px,rgba(37,99,235,0.18)_1px,transparent_0)] [background-size:28px_28px]" />
        <UserSidebar />
        <div className="relative z-30 flex-1 min-w-0">{children}</div>
      </div>
    </UserGate>
  );
}
