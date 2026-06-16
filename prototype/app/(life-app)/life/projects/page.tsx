'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Crosshair,
  Hammer,
  Search,
} from 'lucide-react'
import {
  getAllProjects,
  PHASE_META,
  resolveProjectStatus,
  type Project,
} from '@/lib/mock/projects'

function primaryHref(project: Project) {
  if (project.phase === 'acceptance' || project.phase === 'completed' || project.phase === 'designing') {
    return `/life/projects/${project.id}/accept`
  }
  return `/life/projects/${project.id}/install`
}

function phaseIcon(project: Project) {
  if (project.phase === 'installing') return Hammer
  if (project.phase === 'acceptance' || project.phase === 'completed') return ClipboardCheck
  return CheckCircle2
}

export default function LifeProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const load = () => setProjects(getAllProjects().filter(project => project.customerId || project.phase))
    load()
    window.addEventListener('aqara:cubix-projects-change', load)
    return () => window.removeEventListener('aqara:cubix-projects-change', load)
  }, [])

  const visibleProjects = useMemo(
    () => projects.filter(project => resolveProjectStatus(project) !== 'closed').slice(0, 8),
    [projects]
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-3 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text">项目交付</h1>
            <p className="text-2xs text-text-subtle mt-0.5">施工 · 绑定 · 验收</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-border bg-bg-subtle flex items-center justify-center text-text-muted">
            <Search size={17} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {visibleProjects.map(project => {
          const meta = PHASE_META[project.phase ?? 'designing']
          const Icon = phaseIcon(project)
          const isInstalling = project.phase === 'installing'
          return (
            <div key={project.id} className="rounded-2xl border border-border bg-bg-elevated/80 p-3.5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}22`, color: meta.color }}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text truncate">{project.title}</p>
                    <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-2xs text-text-subtle">
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-2xs text-text-muted mt-1 truncate">{project.customerName ?? '个人项目'} · {project.devices} 设备</p>
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                    {[
                      ['Studio', project.linkedStudioId ? '已关联' : '待选择'],
                      ['映射', isInstalling ? '进行中' : '待确认'],
                      ['验收', project.phase === 'completed' ? '完成' : '待发起'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-border bg-bg-subtle px-2 py-1.5">
                        <p className="text-[10px] text-text-subtle">{label}</p>
                        <p className="text-2xs font-medium text-text mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  href={primaryHref(project)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-accent to-accent2 px-3 py-2.5 text-2xs font-semibold text-white"
                >
                  {isInstalling ? '继续施工' : '进入验收'} <ArrowRight size={12} />
                </Link>
                {isInstalling && (
                  <Link
                    href={`/life/projects/${project.id}/install?step=mapping`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-2xs font-medium text-text"
                  >
                    <Crosshair size={12} /> 映射
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
