import Link from 'next/link';
import { AqaraLogo } from '@/components/brand/AqaraLogo';

const FOOTER_GROUPS = [
  {
    title: '平台',
    links: [
      { label: 'Home', href: '/' },
      { label: '发现', href: '/home/discover' },
      { label: '市场', href: '/marketplace' },
      { label: 'Community', href: '/home/community' },
      { label: '找专业人', href: '/builders' },
    ],
  },
  {
    title: '创作',
    links: [
      { label: 'Create', href: '/home/build' },
      { label: '可 Remix 方案', href: '/home' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Aqara Academy', href: '/academy' },
    ],
  },
  {
    title: '支持',
    links: [
      { label: 'Aqara Life App', href: '#' },
      { label: 'Forum', href: 'https://forum.aqara.com', external: true },
      { label: '帮助中心', href: '#' },
      { label: 'Aqara Studio', href: '#' },
    ],
  },
  {
    title: '灯塔国家',
    links: [
      { label: '🇨🇳 中国', href: '#' },
      { label: '🇰🇷 한국', href: '#' },
      { label: '🇦🇪 الإمارات', href: '#' },
      { label: '🇮🇹 Italia', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-bg-elevated/40">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <AqaraLogo size={22} />
            <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-xs">
              面向全球用户、创作者与服务商的空间智能平台。
              <br />
              连接发现、设计、交付与 Aqara Studio 本地运行。
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-text-subtle">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span>平台服务正常</span>
              </span>
            </div>
          </div>

          {FOOTER_GROUPS.map(g => (
            <div key={g.title}>
              <h4 className="text-xs font-medium text-text uppercase tracking-wider mb-3">{g.title}</h4>
              <ul className="space-y-2">
                {g.links.map(l => (
                  <li key={l.label}>
                    {'external' in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-text-muted hover:text-text transition-colors"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm text-text-muted hover:text-text transition-colors"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-text-subtle">
            © 2026 Aqara · Spatial Intelligence for Every Home
          </p>
          <div className="flex items-center gap-6 text-xs text-text-subtle">
            <span>隐私</span>
            <span>条款</span>
            <span>数据中心 · CN / KR / EU / ME</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
