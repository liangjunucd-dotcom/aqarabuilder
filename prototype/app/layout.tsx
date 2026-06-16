import type { Metadata } from 'next';
import './globals.css';
import { DemoModeSwitch } from '@/components/demo/DemoModeSwitch';
import { RouteProgress } from '@/components/navigation/RouteProgress';

export const metadata: Metadata = {
  title: 'Aqara Builder · 空间智能供给网络 — 连接全球 Pro',
  description:
    'Aqara 全球 Pro 供给网络 — 连接认证设计师、Certified Installer、插件开发者。标准化空间智能交付，从方案设计到上门安装闭环。',
  keywords: ['Aqara', 'Builder', 'Smart Home', 'Spatial Intelligence', 'Certified Installer', 'Pro Network'],
};

const themeInitScript = `
(() => {
  try {
    const theme = localStorage.getItem('aqara_builder_theme') === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
  } catch (_) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-text antialiased">
        {children}
        <RouteProgress />
        <DemoModeSwitch />
      </body>
    </html>
  );
}
