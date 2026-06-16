'use client';

import { usePathname } from 'next/navigation';
import { ProSidebar } from '@/components/layout/ProSidebar';
import { ProGate } from '@/components/auth/RoleGate';

export default function ProLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const isWorkspacePicker = pathname.startsWith('/pro/workspaces');

  return (
    <ProGate>
      {isWorkspacePicker ? (
        <>{children}</>
      ) : (
        <div className="flex h-screen overflow-hidden bg-white">
          <ProSidebar />
          <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
        </div>
      )}
    </ProGate>
  );
}
