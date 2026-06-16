'use client'

import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { useClientProject } from '@/lib/hooks/use-client-project'
import { PHASE_META, type Project } from '@/lib/mock/projects'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Crosshair,
  Hammer,
  Layers3,
  Smartphone,
} from 'lucide-react'

function nextAction(project: Project) {
  if (project.phase === 'installing') {
    return {
      label: '继续施工',
      sub: 'Studio 入网、设备绑定、方案下发',
      href: `/life/projects/${project.id}/install`,
      icon: Hammer,
    }
  }
  if (project.phase === 'acceptance' || project.phase === 'completed') {
    return {
      label: '客户验收',
      sub: '接收 Space、确认服务权限',
      href: `/life/projects/${project.id}/accept`,
      icon: ClipboardCheck,
    }
  }
  return {
    label: '方案确认',
    sub: '预览方案并签字确认',
    href: `/life/projects/${project.id}/accept`,
    icon: CheckCircle2,
  }
}

export default function LifeProjectEntryPage() {
  const params = useParams<{ id?: string }>()
  const project = useClientProject(params?.id ?? '')

  if (project === undefined) {
    return <div className="flex-1 flex items-center justify-center text-2xs text-text-muted">加载中…</div>
  }
  if (project === null) return notFound()

  const meta = PHASE_META[project.phase ?? 'designing']
  const action = nextAction(project)
  const ActionIcon = action.icon
  const showMapping = project.phase === 'installing'

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-3 pb-4 flex items-center gap-3">
        <Link href="/life/projects" className="w-9 h-9 rounded-full border border-border bg-bg-subtle flex items-center justify-center text-text-muted">
          <ChevronLeft size={17} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-text truncate">{project.title}</h1>
          <p className="text-2xs text-text-subtle mt-0.5">{project.customerName ?? '个人项目'} · {project.devices} 设备</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        <div className="rounded-3xl border border-border bg-bg-elevated/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xs text-text-subtle">项目阶段</p>
              <p className="text-base font-semibold text-text mt-0.5">{meta.label}</p>
            </div>
            <span className="rounded-full px-2.5 py-1 text-2xs font-medium" style={{ color: meta.color, background: `${meta.color}1f` }}>
              {project.solutionVersion ?? 'v1.0'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Studio', value: project.linkedStudioId ? '已关联' : '待选择', icon: Smartphone },
              { label: '方案', value: project.solutionStatus === 'finalized' ? '已确认' : '设计中', icon: Layers3 },
              { label: '交付', value: project.phase === 'completed' ? '完成' : '进行中', icon: ClipboardCheck },
            ].map(item => (
              <div key={item.label} className="rounded-2xl border border-border bg-bg-subtle px-2.5 py-2">
                <item.icon size={14} className="text-text-subtle mb-1" />
                <p className="text-[10px] text-text-subtle">{item.label}</p>
                <p className="text-2xs font-semibold text-text mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <Link
          href={action.href}
          className="rounded-2xl border border-accent/35 bg-accent/[0.07] p-4 flex items-center gap-3"
        >
          <span className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <ActionIcon size={19} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-text">{action.label}</span>
            <span className="block text-2xs text-text-muted mt-0.5">{action.sub}</span>
          </span>
          <ArrowRight size={14} className="text-text-subtle" />
        </Link>

        {showMapping && (
          <Link
            href={`/life/projects/${project.id}/install?step=mapping`}
            className="rounded-2xl border border-border bg-bg-elevated/80 p-4 flex items-center gap-3"
          >
            <span className="w-11 h-11 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
              <Crosshair size={19} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-text">虚实映射</span>
              <span className="block text-2xs text-text-muted mt-0.5">自动匹配方案设备，现场触发验证</span>
            </span>
            <ArrowRight size={14} className="text-text-subtle" />
          </Link>
        )}
      </div>
    </div>
  )
}
