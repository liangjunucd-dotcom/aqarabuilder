'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BottomNav } from '../../components/BottomNav'
import { CheckCircle2, Circle, ClipboardList, Home, Lock, ShoppingBag } from 'lucide-react'

const initialTasks = [
  { id: 't1', title: '检查主卧窗户', meta: '门窗传感器未触发异常', icon: Lock, done: true },
  { id: 't2', title: '客厅空气质量巡检', meta: '净化器滤芯剩余 71%', icon: Home, done: false },
  { id: 't3', title: '补充购物清单', meta: '牛奶 / 鸡蛋 / 纸巾', icon: ShoppingBag, done: false },
]

function TasksContent() {
  const params = useSearchParams()
  const studioName = params?.get('studio') ?? 'M300 Studio'
  const [tasks, setTasks] = useState(initialTasks)
  const doneCount = tasks.filter(t => t.done).length

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-5 pt-3 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text">今日任务</h1>
          <p className="text-2xs text-text-subtle mt-0.5">{doneCount}/{tasks.length} 已完成 · {studioName}</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-border bg-bg-subtle flex items-center justify-center text-accent">
          <ClipboardList size={18} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
        {tasks.map(task => {
          const Icon = task.icon
          return (
            <button
              key={task.id}
              onClick={() => setTasks(prev => prev.map(item => item.id === task.id ? { ...item, done: !item.done } : item))}
              className="w-full rounded-2xl border border-border bg-bg-elevated/80 p-3.5 flex items-center gap-3 text-left"
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${task.done ? 'bg-success/15 text-success' : 'bg-bg-subtle text-text-subtle'}`}>
                <Icon size={17} />
              </span>
              <span className="flex-1 min-w-0">
                <span className={`block text-sm font-medium ${task.done ? 'text-text-subtle line-through' : 'text-text'}`}>{task.title}</span>
                <span className="block text-2xs text-text-muted mt-0.5 truncate">{task.meta}</span>
              </span>
              {task.done ? <CheckCircle2 size={20} className="text-success" /> : <Circle size={20} className="text-text-subtle" />}
            </button>
          )
        })}

        <Link
          href={`/life/home?mode=remote&config=accepted&persona=nanny&studio=${encodeURIComponent(studioName)}`}
          className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-border bg-bg-subtle px-4 py-3 text-sm font-medium text-text"
        >
          返回首页
        </Link>
      </div>

      <BottomNav active="我的" mode="solo" studioName={studioName} />
    </div>
  )
}

export default function TasksPage() {
  return <Suspense><TasksContent /></Suspense>
}
