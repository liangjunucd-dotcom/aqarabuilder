import Link from 'next/link';
import { ArrowRight, Construction } from 'lucide-react';

export function ProWipPage({
  icon: Icon,
  title,
  desc,
  children,
  showBack = true,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  children?: React.ReactNode;
  showBack?: boolean;
}) {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-bg-elevated/30">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border border-border bg-gradient-to-br from-accent/20 to-accent2/20 flex items-center justify-center">
              <Icon size={22} className="text-accent-glow" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="text-sm text-text-muted mt-1">{desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-10">{children}</div>
    </div>
  );
}

export function WipPanel({ title, note }: { title: string; note?: string }) {
  return (
    <div className="card p-10 text-center">
      <Construction size={28} className="mx-auto text-text-muted mb-3" />
      <div className="font-medium">{title}</div>
      {note && <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">{note}</p>}
      <Link
        href="/pro/workshop"
        className="mt-5 inline-flex items-center gap-1 text-xs text-accent-glow hover:underline"
      >
        返回 Builder Pro <ArrowRight size={11} />
      </Link>
    </div>
  );
}
