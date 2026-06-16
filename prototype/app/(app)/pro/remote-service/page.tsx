'use client';

import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileText,
  Radio,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { ProWipPage } from '@/components/workshop/ProWipPage';

const SERVICE_SESSIONS = [
  {
    title: '吴先生别墅 · 夜间照护误报',
    plan: 'Care Plan · Active',
    status: '等待客户授权',
    scope: 'read_health, read_logs, tune_automation',
  },
  {
    title: '徐汇公寓 · Zigbee 弱连接',
    plan: 'Maintenance Plan · Quarterly',
    status: '服务窗口 2h',
    scope: 'read_health, restart_bridge, create_report',
  },
  {
    title: '民宿 302 · 门锁联动排查',
    plan: 'Rental Plan · Managed',
    status: '可远程操作',
    scope: 'read_logs, update_scene, notify_customer',
  },
];

const CONSOLE_BLOCKS = [
  { icon: ShieldCheck, title: '授权窗口', desc: '每次服务都生成 OperatorGrant，记录范围、时长、操作者和审计。' },
  { icon: Activity, title: '运行诊断', desc: '聚合 Studio 在线、设备健康、自动化日志和异常告警。' },
  { icon: Wrench, title: '远程调优', desc: '在授权范围内调整规则、场景、Dashboard 配置或生成变更建议。' },
  { icon: FileText, title: '服务报告', desc: '服务结束后生成客户可见摘要，写入 Project / ServicePlan Timeline。' },
];

export default function RemoteServicePage() {
  return (
    <ProWipPage
      icon={Wrench}
      title="Remote Service Console"
      desc="Builder Pro 授权后的远程诊断、调优、服务报告和审计界面。Life Dashboard 只是客户日常体验层。"
      showBack={false}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-text-subtle">Service Sessions</div>
                <h2 className="mt-1 text-lg font-semibold">授权服务队列</h2>
              </div>
              <Link href="/pro/service-plans" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-text-muted hover:text-text">
                查看服务计划 <ArrowRight size={12} />
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {SERVICE_SESSIONS.map(session => (
                <div key={session.title} className="rounded-xl border border-border bg-bg-elevated/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{session.title}</div>
                      <div className="mt-1 text-xs text-text-muted">{session.plan}</div>
                    </div>
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] text-accent-glow">
                      {session.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-text-subtle">
                    <Radio size={12} />
                    Scope: {session.scope}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {CONSOLE_BLOCKS.map(block => (
              <div key={block.title} className="card p-5">
                <block.icon size={16} className="text-accent-glow" />
                <div className="mt-3 text-sm font-semibold">{block.title}</div>
                <p className="mt-2 text-xs leading-relaxed text-text-muted">{block.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-5 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <AlertTriangle size={14} />
              访问边界
            </div>
            <p className="mt-2 text-xs leading-relaxed text-text-muted">
              Service Plan 不等于永久远程权限。每次实际操作仍需 OperatorGrant，并生成 ServiceSession 审计记录。
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList size={14} className="text-accent-glow" />
              下一步
            </div>
            <div className="mt-3 space-y-2 text-xs text-text-muted">
              <div>1. 从 Service Plan 发起授权窗口</div>
              <div>2. 在 Console 执行诊断和调优</div>
              <div>3. 生成报告并回写客户可见状态</div>
            </div>
          </div>
        </aside>
      </div>
    </ProWipPage>
  );
}
