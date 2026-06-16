'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  PackageCheck,
  Truck,
} from 'lucide-react';
import { ProWipPage } from '@/components/workshop/ProWipPage';

const STEPS = [
  { title: 'Installer Handoff', desc: '施工清单、点位图、设备清单和现场注意事项。', icon: ClipboardCheck },
  { title: 'Deployment Package', desc: '从 Design Package 生成可下发、可回滚、可验收的部署包。', icon: PackageCheck },
  { title: 'Site Evidence', desc: '现场照片、入网回执、点位映射和问题记录。', icon: FileCheck2 },
  { title: 'Acceptance Prep', desc: '把验收清单、签字确认和账本证据链准备好。', icon: CheckCircle2 },
];

export default function DeliveryPage() {
  return (
    <ProWipPage
      icon={Truck}
      title="Delivery"
      desc="客户交付的实施层：排期、现场 Handoff、部署回执和验收准备。"
      showBack={false}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="grid gap-3 md:grid-cols-2">
          {STEPS.map(step => (
            <div key={step.title} className="card p-5">
              <step.icon size={17} className="text-accent-glow" />
              <div className="mt-3 text-sm font-semibold">{step.title}</div>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">{step.desc}</p>
            </div>
          ))}
        </section>
        <aside className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays size={14} className="text-accent-glow" />
            交付边界
          </div>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            Delivery 不重新设计方案。若客户确认后发生范围变化，应回到 Project Passport 创建 Change Order，再更新 Design / Delivery Package。
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link href="/pro/projects?status=in_progress" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white">
              查看实施中项目 <ArrowRight size={11} />
            </Link>
            <Link href="/pro/projects" className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-text-muted hover:text-text">
              回到 Project Passport
            </Link>
          </div>
        </aside>
      </div>
    </ProWipPage>
  );
}
