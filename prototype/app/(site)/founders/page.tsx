'use client';

import Link from 'next/link';
import { TopNav } from '@/components/layout/TopNav';
import { Footer } from '@/components/layout/Footer';
import { Globe, Sparkles, Award, Mic, Camera, ArrowRight, Check, MapPin } from 'lucide-react';

const COUNTRIES = [
  { flag: '🇰🇷', name: '韩国', city: '首尔', slots: 10, applied: 47, status: '招募中', accent: '#6366f1' },
  { flag: '🇦🇪', name: '阿联酋', city: '迪拜', slots: 10, applied: 23, status: '招募中', accent: '#a855f7' },
  { flag: '🇮🇹', name: '意大利', city: '米兰', slots: 10, applied: 31, status: '招募中', accent: '#06b6d4' },
];

const BENEFITS = [
  { icon: Camera, title: 'Aqara 官方 Case Study 拍摄', desc: '专业摄影团队上门拍摄你的代表作，发布到全球官网' },
  { icon: Award, title: 'Academy 进阶课免费', desc: '所有 L4-L5 进阶课程 + 内测课程全部免费' },
  { icon: Globe, title: 'Aqara Space 优先权', desc: '区域伙伴扩张时，Founder Creator 优先成为 Aqara Space 门店主' },
  { icon: Mic, title: 'Aqara Academy Summit', desc: '每年一次跨国大会全程邀请 + 演讲席位' },
  { icon: Sparkles, title: 'Forge SDK 内测', desc: 'Plugin / Driver SDK 12 个月独家访问，可率先发布插件' },
];

const REQUIREMENTS = [
  '在所在国家有 1 年以上智能家居 / 系统集成 / 装修设计相关经验',
  '至少 1 个可展示的实施案例(住宅 / 商业 / 适老 / 极客 任一方向)',
  '通过 ACB Designer L2 或 Installer L3 任一认证(可在加入后 90 天内补)',
  '愿意在加入 6 个月内完成至少 3 个 Aqara 方案案例',
  '认同"创作者经济 + 服务订阅"长期商业模式',
];

const TIMELINE = [
  { date: '2026-04-15', step: '招募启动', desc: '官网 + 全球渠道开放申请', done: true },
  { date: '2026-05-31', step: '第一轮初审截止', desc: '基础资料 + 案例审核', done: false },
  { date: '2026-06-15', step: '终审 + 远程访谈', desc: 'Aqara 全球团队一对一访谈', done: false },
  { date: '2026-07-01', step: '名单公布 · 灯塔三国各 10 名', desc: '官网公告 + 颁授 Founder Badge', done: false },
];

export default function FoundersPage() {
  return (
    <>
      <TopNav />
      <main>
        {/* Hero */}
        <section className="relative border-b border-border overflow-hidden">
          <div className="absolute inset-0 hero-glow opacity-70 pointer-events-none" />
          <div className="absolute inset-0 grid-pattern opacity-40 mask-fade-b pointer-events-none" />
          <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
            <div className="inline-flex items-center gap-2 text-2xs px-2.5 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent-glow">
              🌟 Founder Creator Program · 限时招募 · 截止 2026-05-31
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight">
              成为 Aqara<br />
              <span className="text-gradient-brand">全球开局 30 人</span>
            </h1>
            <p className="mt-6 text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
              灯塔三国 — 韩国、迪拜、米兰 — 各招 10 位 Founder Creator。<br />
              你将与 Aqara 一起,从 0 把"AI 空间设计 + 持续服务"做成全球认知。
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              <a href="#apply" className="px-5 py-3 rounded-lg bg-gradient-to-br from-accent to-accent2 text-white font-medium hover:shadow-lg hover:shadow-accent/30 transition inline-flex items-center gap-2">
                申请 Founder Creator <ArrowRight size={14} />
              </a>
              <Link href="/academy" className="px-5 py-3 rounded-lg border border-border-strong bg-white/[0.03] hover:bg-white/[0.06] transition">
                了解 ACB 体系
              </Link>
            </div>
          </div>
        </section>

        {/* Lighthouse countries */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-2xl font-semibold mb-3">灯塔三国 · 各 10 名席位</h2>
          <p className="text-text-muted mb-10">不是按国家先后,而是同步开局 — 你将在所在国家成为本地第一批 Builder Founder。</p>
          <div className="grid md:grid-cols-3 gap-5">
            {COUNTRIES.map(c => (
              <div key={c.name} className="card card-hover p-6 relative overflow-hidden">
                <div
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30"
                  style={{ background: c.accent }}
                />
                <div className="relative">
                  <div className="text-4xl">{c.flag}</div>
                  <h3 className="mt-4 text-xl font-semibold">{c.name} · {c.city}</h3>
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <span className="num text-2xl font-semibold" style={{ color: c.accent }}>{c.slots}</span>
                    <span className="text-text-muted">席位</span>
                  </div>
                  <div className="mt-2 text-2xs text-text-muted">已收到 <span className="num text-text">{c.applied}</span> 份申请</div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-2xs px-2 py-0.5 rounded-full border border-success/30 bg-success/10 text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    {c.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-7xl px-6 py-20 border-t border-border">
          <h2 className="text-2xl font-semibold mb-10">Founder Creator 专属权益</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(b => (
              <div key={b.title} className="card p-6">
                <b.icon size={20} className="text-accent-glow mb-3" />
                <h3 className="font-medium">{b.title}</h3>
                <p className="mt-1 text-sm text-text-muted leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements + timeline */}
        <section className="mx-auto max-w-7xl px-6 py-20 border-t border-border">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-semibold mb-6">申请要求</h2>
              <ul className="space-y-3">
                {REQUIREMENTS.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={11} className="text-accent-glow" />
                    </div>
                    <span className="text-sm text-text-muted leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-6">招募时间表</h2>
              <ol className="relative border-l border-border ml-3 space-y-6">
                {TIMELINE.map((t, i) => (
                  <li key={i} className="ml-6">
                    <div className={`absolute -left-2 w-4 h-4 rounded-full border-2 ${t.done ? 'bg-success border-success' : 'bg-bg border-accent'}`} />
                    <div className="text-2xs num text-text-subtle">{t.date}</div>
                    <div className="text-sm font-medium mt-0.5">{t.step}</div>
                    <div className="text-2xs text-text-muted mt-0.5">{t.desc}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Apply form */}
        <section id="apply" className="mx-auto max-w-3xl px-6 py-20">
          <div className="card p-8">
            <div className="flex items-center gap-2 text-2xs text-accent-glow mb-3">
              <MapPin size={11} /> 在线申请表
            </div>
            <h2 className="text-2xl font-semibold">申请 Founder Creator</h2>
            <p className="mt-2 text-sm text-text-muted">填写后 Aqara 全球团队会在 5 个工作日内回复。</p>

            <form className="mt-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="姓名 / Handle">
                  <input className="input" placeholder="如 Jun / @kim_acb" />
                </Field>
                <Field label="邮箱">
                  <input className="input" type="email" placeholder="you@example.com" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="所在国家 / 城市">
                  <select className="input">
                    <option>韩国 · 首尔</option>
                    <option>阿联酋 · 迪拜</option>
                    <option>意大利 · 米兰</option>
                    <option>其他(请在申请理由中说明)</option>
                  </select>
                </Field>
                <Field label="主修方向">
                  <select className="input">
                    <option>Designer · 空间设计</option>
                    <option>Installer · 安装施工</option>
                    <option>Developer · 协议开发</option>
                    <option>Service · 长期服务运营</option>
                  </select>
                </Field>
              </div>
              <Field label="代表案例(链接 / 描述)">
                <textarea rows={3} className="input" placeholder="可贴 Behance / 小红书 / 个人网站链接,或简短描述项目规模 / 客户类型 / 涉及设备" />
              </Field>
              <Field label="为什么希望成为 Founder Creator">
                <textarea rows={4} className="input" placeholder="50–500 字" />
              </Field>
              <button
                type="button"
                className="w-full px-5 py-3 rounded-lg bg-gradient-to-br from-accent to-accent2 text-white font-medium hover:shadow-lg hover:shadow-accent/30 transition inline-flex items-center justify-center gap-2"
              >
                提交申请 <ArrowRight size={14} />
              </button>
              <p className="text-2xs text-text-subtle text-center">
                提交即表示同意 Aqara 处理上述信息用于评估,我们不会做商业营销外发。
              </p>
            </form>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgb(38,38,42);
          border-radius: 0.5rem;
          outline: none;
          color: inherit;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: rgb(58,58,64);
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-2xs text-text-muted block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
