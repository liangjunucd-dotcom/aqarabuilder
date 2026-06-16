'use client'

import Link from 'next/link'

// Life App 原型快捷导航 — 按用户旅程分组
const flowGroups = [
  {
    label: '首次体验',
    links: [
      { label: '登录', href: '/life/signin' },
      { label: '单品首页', href: '/life/home' },
      { label: '通知', href: '/life/notifications' },
      { label: 'AI 助手', href: '/life/ai' },
    ],
  },
  {
    label: '项目交付',
    links: [
      { label: '交付总览', href: '/life/projects' },
      { label: '现场施工·Builder B', href: '/life/projects/proj-lixs/install' },
      { label: '虚实映射', href: '/life/projects/proj-lixs/install?step=mapping' },
      { label: '项目接收·待移交', href: '/life/projects/proj-wu-garden/accept' },
      { label: '方案预览签字', href: '/life/projects/proj-geek/accept' },
      { label: '方案已签字', href: '/life/projects/proj-eu-villa/accept' },
    ],
  },
  {
    label: '连接 Studio',
    links: [
      { label: '选择 Studio', href: '/life/studios' },
      { label: '添加 Studio', href: '/life/studios/add' },
      { label: '绑定确认', href: '/life/studios/add/confirm' },
      { label: '设备绑定', href: '/life/studios/add/binding' },
      { label: '已连接·无配置', href: '/life/home?mode=remote&studio=M300+Studio' },
      { label: 'Studio 安装验收', href: '/life/studios/accept?studio=M300+Studio' },
      { label: '连接中', href: '/life/studios/connecting?mode=remote&name=M300+Studio' },
      { label: '本地认证', href: '/life/studios/local-auth' },
    ],
  },
  {
    label: 'Installer 配置',
    links: [
      { label: '配置弹窗 (男主人)', href: '/life/home?mode=remote&config=pending&persona=dad&studio=M300+Studio' },
      { label: '男主人首页', href: '/life/home?mode=remote&config=accepted&persona=dad&studio=M300+Studio' },
      { label: '小孩首页', href: '/life/home?mode=remote&config=accepted&persona=kid&studio=M300+Studio' },
      { label: '老人首页', href: '/life/home?mode=remote&config=accepted&persona=elderly&studio=M300+Studio' },
      { label: '保姆首页', href: '/life/home?mode=remote&config=accepted&persona=nanny&studio=M300+Studio' },
      { label: '设备', href: '/life/devices?mode=remote&config=accepted&persona=dad&studio=M300+Studio' },
    ],
  },
  {
    label: '插件',
    links: [
      { label: '插件详情 (安全)', href: '/life/plugin/lp-001' },
      { label: 'Installer 分享', href: '/life/plugin/lp-001?studio=M300+Studio&installer=dad' },
      { label: '扫描添加插件', href: '/life/plugins/scan' },
    ],
  },
  {
    label: '我的 / Pro',
    links: [
      { label: '我的', href: '/life/me' },
      { label: 'Pro 工具箱', href: '/life/me/pro-toolbox' },
      { label: 'A 币', href: '/life/credits' },
      { label: '服务详情', href: '/life/services/svc-001' },
    ],
  },
]

export function PrototypeSwitcher() {
  return (
    <div className="flex flex-col gap-2.5 max-w-[720px] px-4 w-full">
      {flowGroups.map(group => (
        <div key={group.label} className="flex items-start gap-2 flex-wrap">
          <span className="text-2xs text-text-subtle font-medium min-w-[80px] pt-1 shrink-0">{group.label}</span>
          <div className="flex flex-wrap gap-1.5">
            {group.links.map(s => (
              <Link
                key={s.href}
                href={s.href}
                className="px-2.5 py-1 rounded-full border border-border bg-bg-elevated text-2xs text-text-muted hover:border-border-strong hover:text-text transition-colors"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
