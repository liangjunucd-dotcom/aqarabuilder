import { ProGate } from '@/components/auth/RoleGate';

export default function CanvasGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProGate>
      <div className="min-h-screen bg-bg">{children}</div>
    </ProGate>
  );
}
