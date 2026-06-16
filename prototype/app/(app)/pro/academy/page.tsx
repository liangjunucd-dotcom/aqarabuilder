import Link from 'next/link';
import { GraduationCap, Award, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { ProWipPage } from '@/components/workshop/ProWipPage';
import { cn } from '@/lib/utils';

const BADGES = [
  { name: 'Certified Installer L3', status: 'earned', date: '2025-08-12', desc: '已通过电工资质 + 实操考核' },
  { name: 'Spatial Designer L2', status: 'earned', date: '2025-11-04', desc: '空间点图与 Persona 进阶' },
  { name: 'Spatial Designer L3', status: 'in-progress', progress: 64, desc: '剩 14 学时 + 1 实操' },
  { name: 'Plugin Developer L1', status: 'available', desc: 'Forge SDK 入门' },
  { name: 'Solution Architect L1', status: 'locked', desc: '需先获 Spatial Designer L3' },
];

export default function ProAcademyPage() {
  return (
    <ProWipPage icon={GraduationCap} title="Academy 学习中心" desc="Badge 认证 · 学习进度 · 公开课">
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-xl font-bold">
            J
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium">Jun · Pro Level 4</h2>
            <p className="text-sm text-text-muted">2 Badges · 在学 1 · 累计学时 87h</p>
            <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-accent2" style={{ width: '64%' }} />
            </div>
            <div className="text-2xs text-text-muted mt-1">距 Level 5 · Spatial Designer L3 还需 14 学时 + 1 实操</div>
          </div>
          <Link href="/academy" className="text-xs px-3 py-1.5 rounded-md border border-border hover:border-border-strong inline-flex items-center gap-1">
            浏览课程 <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <h3 className="text-sm font-medium mb-3">Badge 进度</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BADGES.map(b => (
          <div
            key={b.name}
            className={cn(
              'card p-5',
              b.status === 'locked' && 'opacity-60'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {b.status === 'earned' && <CheckCircle2 size={16} className="text-success" />}
              {b.status === 'in-progress' && <Award size={16} className="text-accent-glow" />}
              {b.status === 'available' && <Award size={16} className="text-text-muted" />}
              {b.status === 'locked' && <Lock size={16} className="text-text-subtle" />}
              <span className="font-medium text-sm">{b.name}</span>
            </div>
            <p className="text-2xs text-text-muted">{b.desc}</p>
            {b.status === 'in-progress' && (
              <div className="mt-3">
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${b.progress}%` }} />
                </div>
                <div className="text-2xs text-text-subtle mt-1 num">{b.progress}%</div>
              </div>
            )}
            {b.status === 'earned' && (
              <div className="text-2xs text-success mt-3">已认证 · {b.date}</div>
            )}
            {b.status === 'available' && (
              <button className="mt-3 text-2xs text-accent-glow hover:underline">开始学习 →</button>
            )}
          </div>
        ))}
      </div>
    </ProWipPage>
  );
}
