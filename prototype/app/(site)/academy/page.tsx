import { TopNav } from '@/components/layout/TopNav';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { GraduationCap, Award, Sparkles, Globe, ArrowRight } from 'lucide-react';

const PATHS = [
  { name: 'Installer', desc: '线下安装施工 · 面板 / 网关 / 传感器', level: 'L1 → L5', duration: '40 小时' },
  { name: 'Designer', desc: '空间方案 + Persona Composer 专业版', level: 'L1 → L5', duration: '60 小时' },
  { name: 'Developer', desc: 'Plugin / Driver / Forge SDK 开发', level: 'L1 → L5', duration: '80 小时' },
  { name: 'Service', desc: '长期 Persona 托管 + 持续服务运营', level: 'L1 → L5', duration: '30 小时' },
];

export default function AcademyPage() {
  return (
    <>
      <TopNav />
      <main>
        <section className="relative border-b border-border">
          <div className="absolute inset-0 hero-glow opacity-60 pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
            <p className="text-sm text-accent-glow font-medium inline-flex items-center gap-2">
              <GraduationCap size={14} />
              Aqara Academy
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight">
              从专业人士到<br />
              <span className="text-gradient-brand">认证 Builder</span>
            </h1>
            <p className="mt-6 text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Aqara 官方培训 + 在线考试 + 实操 + Badge 认证。
              <br />
              认证后全球通用,Badge 跟人走。
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/pro" className="px-5 py-3 rounded-lg bg-white text-bg font-medium hover:bg-white/90 transition">
                开始学习
              </Link>
              <Link href="/founders" className="px-5 py-3 rounded-lg border border-border-strong bg-white/[0.03] hover:bg-white/[0.06] transition">
                Founder Creator 招募
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-2xl font-semibold mb-10">4 条 Builder 子角色路径 · 可同时叠加多个</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PATHS.map(p => (
              <div key={p.name} className="card card-hover p-5">
                <Award size={18} className="text-accent-glow mb-3" />
                <h3 className="font-medium">Builder ({p.name})</h3>
                <p className="mt-1 text-2xs text-text-muted">{p.desc}</p>
                <div className="mt-4 pt-4 border-t border-border space-y-1 text-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">等级体系</span>
                    <span className="num">{p.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">时长</span>
                    <span className="num">{p.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="relative rounded-3xl border border-border overflow-hidden p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-accent2/10 to-pink-500/15 pointer-events-none" />
            <div className="relative max-w-2xl">
              <div className="inline-flex items-center gap-2 text-2xs px-2.5 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent-glow">
                🌟 Founder Creator Program · 限时招募
              </div>
              <h2 className="mt-4 text-3xl font-semibold">灯塔三国各 10 名 Founder Creator</h2>
              <p className="mt-3 text-text-muted">
                韩国 · 迪拜 · 米兰 — 每个灯塔国选 10 位 ACB 做 Founder Creator,获得:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-text-muted">
                <li className="flex items-center gap-2"><Sparkles size={14} className="text-accent"/> Aqara 官方 Case Study 拍摄</li>
                <li className="flex items-center gap-2"><Sparkles size={14} className="text-accent"/> Academy 进阶课免费</li>
                <li className="flex items-center gap-2"><Sparkles size={14} className="text-accent"/> 成为 Aqara Space 门店主的优先权</li>
                <li className="flex items-center gap-2"><Sparkles size={14} className="text-accent"/> Aqara Academy Summit 跨国大会邀请</li>
                <li className="flex items-center gap-2"><Sparkles size={14} className="text-accent"/> 早期 Forge SDK 内测资格</li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/founders"
                  className="inline-flex items-center gap-1 px-5 py-2.5 rounded-lg bg-gradient-to-br from-accent to-accent2 text-white text-sm font-medium hover:shadow-lg hover:shadow-accent/30 transition"
                >
                  <Globe size={14} />
                  申请 Founder Creator
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
