'use client';

import Link from 'next/link';
import { Suspense, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowRight, Download, Sparkles, Cpu, Network, Zap,
  KeyRound, Users, BarChart3, Repeat, Rocket, Crown,
  Target, Wand2, ShieldCheck, Layers, Spline,
} from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Footer } from '@/components/layout/Footer';
import { useRole, isBuilderRole } from '@/lib/role';

function SpiderContent() {
  const { role, mounted } = useRole();
  const searchParams = useSearchParams();
  const router = useRouter();

  const nextPath = searchParams?.get('next') ?? '/build?entry=personal';
  const installed = searchParams?.get('installed') === '1';

  // Auto-redirect logged-in users directly to the requested design context.
  useEffect(() => {
    if (mounted && isBuilderRole(role)) {
      router.replace(nextPath);
    }
  }, [mounted, role, nextPath, router]);

  const launchHref = useMemo(() => {
    if (!mounted || role === 'anonymous') {
      return `/signin?redirect=${encodeURIComponent(`/spider?next=${encodeURIComponent(nextPath)}`)}`;
    }
    return nextPath;
  }, [mounted, role, nextPath]);

  return (
    <>
      <TopNav />
      <main className="relative">
        {/* ─── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 hero-glow opacity-50 pointer-events-none" />
          <div className="absolute inset-0 grid-pattern opacity-25 pointer-events-none mask-fade-b" />

          <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-white/[0.03] text-2xs text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <Spline size={11} />
              Design Platform · AI-Native Workspace for Smart Space Builders
            </div>

            <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
              <span className="text-gradient-brand">Design Platform</span>
              <br />
              你说一句，
              <br />
              整个空间就被做完了
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-text-muted leading-relaxed">
              用对话取代手工配置 —— 方案、点位、自动化、交付，一句话完成。
              像 Cursor 改写编程，<span className="text-text">Design Platform 改写空间交付。</span>
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href={`/spider?installed=1&next=${encodeURIComponent(nextPath)}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-bg font-medium hover:bg-white/90 transition"
              >
                <Download size={15} />
                下载 Design Platform · macOS（模拟）
              </Link>
              <Link
                href={launchHref}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-br from-accent to-accent2 text-white font-medium hover:shadow-lg hover:shadow-accent/30 transition"
              >
                <Sparkles size={15} />
                进入 Design Platform
                <ArrowRight size={14} />
              </Link>
              <Link
                href="#flywheel"
                className="text-sm text-text-muted hover:text-text transition ml-2"
              >
                看商业飞轮 →
              </Link>
            </div>

            {installed && <DesktopLoginCard launchHref={launchHref} />}

            {/* 角色快捷入口 — 把"我是谁，我从哪里来"显式化 */}
            <div className="mt-14 grid sm:grid-cols-3 gap-3 max-w-4xl">
              <RoleEntry
                icon={Users}
                title="服务商 / 装企"
                desc="一键迁移历史客户与设备到 Builder 体系"
                cta="升级 Builder"
                href="/onboarding"
                accent="#a855f7"
              />
              <RoleEntry
                icon={Wand2}
                title="独立设计师"
                desc="无代码，只用对话设计完整空间方案"
                cta="开始 Design Platform"
                href={launchHref}
                accent="#6366f1"
                highlight
              />
              <RoleEntry
                icon={Cpu}
                title="开发者 / 集成商"
                desc="Protocol Driver · 与 Studio 直连"
                cta="创建 Driver"
                href="/pro/build/driver"
                accent="#06b6d4"
              />
            </div>
          </div>
        </section>

        {/* ─── Why Design Platform ───────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-sm text-accent-glow font-medium">Why Design Platform</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
              用一次，就回不去手工配置
            </h2>
            <p className="mt-3 text-text-muted leading-relaxed max-w-xl">
              一段对话同时调度 Studio、Life、钱包与社区 —— 把空间交付的完整链路重写了一遍。
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Capability
              icon={Wand2}
              accent="#a855f7"
              title="一句话生成方案"
              desc="描述意图，同步生成空间图谱、设备点位与自动化。"
            />
            <Capability
              icon={Cpu}
              accent="#06b6d4"
              title="实时连 Studio"
              desc="本地 Agent 直连客户家中的 Aqara Studio，断网仍可工作，不绕云。"
            />
            <Capability
              icon={Layers}
              accent="#10b981"
              title="一键推 Life App"
              desc="Persona 插件自动同步到 Aqara Life，千人千面。"
            />
            <Capability
              icon={ShieldCheck}
              accent="#f59e0b"
              title="可审 · 可回滚"
              desc="AI 改动可审批可回滚，每次交付沉淀为信任凭证。"
            />
          </div>
        </section>

        {/* ─── Flywheel ─────────────────────────────────────────── */}
        <section id="flywheel" className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-sm text-accent-glow font-medium flex items-center gap-1.5">
              <Repeat size={13} />
              Commercial Flywheel
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
              Design Platform 是飞轮的引擎
            </h2>
            <p className="mt-3 text-text-muted leading-relaxed max-w-xl">
              更多 Builder → 更聪明的设计平台 → 更高的 Builder 收益。把"卖设备一次"重写为"持续服务无限次"。
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-3">
            <FlywheelStep
              n={1}
              title="Builder × Design Platform"
              desc="一段对话设计完整方案"
              icon={Wand2}
              accent="#6366f1"
            />
            <FlywheelStep
              n={2}
              title="Studio 部署"
              desc="一键推送至客户家 Studio，本地运行"
              icon={Cpu}
              accent="#06b6d4"
            />
            <FlywheelStep
              n={3}
              title="Aqara Life"
              desc="每个家人看到定制的 Persona"
              icon={Users}
              accent="#10b981"
            />
            <FlywheelStep
              n={4}
              title="评分 · 续费"
              desc="使用数据反哺评级，触发复购"
              icon={BarChart3}
              accent="#f59e0b"
            />
            <FlywheelStep
              n={5}
              title="Lead 引擎"
              desc="高评 Builder 优先派单，收益反哺训练"
              icon={Target}
              accent="#ec4899"
            />
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-3">
            <FlywheelHook
              title="Aqara 的 Take Rate"
              points={[
                '每次方案即采购订单',
                '订阅由钱包按月清算',
              ]}
            />
            <FlywheelHook
              title="Builder 的复购引擎"
              points={[
                '一户家庭终身可加项',
                'T+3 结算 vs 行业 T+15',
              ]}
            />
            <FlywheelHook
              title="客户的本地权威"
              points={[
                '数据本地优先，云端不替代',
                '远程访问需授权 + 时效',
              ]}
            />
          </div>
        </section>

        {/* ─── Service Provider → Builder ───────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-sm text-accent-glow font-medium flex items-center gap-1.5">
              <Crown size={13} />
              For Existing Service Providers
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
              已经是 Aqara 服务商? <br />
              一条直通车，升级 Builder
            </h2>
            <p className="mt-3 text-text-muted leading-relaxed max-w-xl">
              历史客户、设备、维保记录一键迁入 Builder 体系，跟着你的 Builder ID 走。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <UpgradeStep
              n={1}
              title="导入历史客户"
              desc="拉取设备 / 客户 / 服务记录，自动建档到 Builder Console"
            />
            <UpgradeStep
              n={2}
              title="开通 Design Platform 凭证"
              desc="桌面端登录即绑定 Pro 30 天试用，Lead 派单同步开放"
            />
            <UpgradeStep
              n={3}
              title="迁移服务订阅"
              desc="维保 / 售后转入钱包，按月透明结算"
            />
          </div>

          <div className="mt-6 card p-4 bg-bg-elevated/60 text-2xs text-text-muted leading-relaxed flex flex-wrap gap-x-6 gap-y-1">
            <span><span className="text-text font-medium">客户所有权</span> 属客户本人，Builder 获服务权</span>
            <span><span className="text-text font-medium">分级初值</span> 按在网设备数折算</span>
            <span><span className="text-text font-medium">6 周</span> 内完成迁移，免试用门槛</span>
          </div>
        </section>

        {/* ─── Pricing ──────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-sm text-accent-glow font-medium">Pricing</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
              定价透明，门槛低，规模有溢价
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Plan
              tier="Free"
              price="¥0 / 月"
              tagline="个人爱好者 / 体验"
              perks={['每月 50 次 AI 任务', '只读 Studio 连接', '社区方案 Fork']}
              cta="开始使用"
              ctaHref={launchHref}
            />
            <Plan
              tier="Builder Pro"
              price="¥99 / 月"
              tagline="独立 Builder / 个人服务商"
              perks={[
                '无限 AI 任务',
                'Studio 写入 + 部署',
                'Life App Persona 推送',
                'Lead 派单优先级',
                'T+3 钱包结算',
              ]}
              highlight
              cta="升级 Builder Pro"
              ctaHref={launchHref}
            />
            <Plan
              tier="Studio Team"
              price="按席位计费"
              tagline="装企 / 集成商团队"
              perks={[
                '多 Builder 协作',
                'Solution Library 共享',
                '客户 / 钱包多账号管理',
                'SLA 与国家代理对接',
              ]}
              cta="联系我们"
              ctaHref="#"
            />
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-6xl px-6 pb-24">
          <div className="card p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 hero-glow opacity-60 pointer-events-none" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
                让你下一次交付，
                <br />
                <span className="text-gradient">用一段对话完成</span>
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/spider?installed=1&next=${encodeURIComponent(nextPath)}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-bg font-medium hover:bg-white/90 transition"
                >
                  <Download size={15} /> 下载 Design Platform · macOS
                </Link>
                <Link
                  href={launchHref}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-br from-accent to-accent2 text-white font-medium hover:shadow-lg hover:shadow-accent/30 transition"
                >
                  <Sparkles size={15} /> 直接进入 Design Platform
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

function RoleEntry({
  icon: Icon, title, desc, cta, href, accent, highlight,
}: {
  icon: any; title: string; desc: string; cta: string;
  href: string; accent: string; highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card p-5 hover:border-border-strong transition group relative overflow-hidden ${
        highlight ? 'border-accent/40' : ''
      }`}
    >
      <div
        className="absolute -inset-x-12 -top-12 h-24 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: accent }}
      />
      <div
        className="relative inline-flex w-9 h-9 rounded-lg border items-center justify-center mb-3"
        style={{ background: `${accent}15`, borderColor: `${accent}40` }}
      >
        <Icon size={16} style={{ color: accent }} />
      </div>
      <div className="relative text-base font-semibold">{title}</div>
      <p className="relative mt-1 text-2xs text-text-muted leading-relaxed">{desc}</p>
      <div className="relative mt-3 inline-flex items-center gap-1 text-2xs text-accent-glow">
        {cta} <ArrowRight size={11} />
      </div>
    </Link>
  );
}

function Capability({ icon: Icon, accent, title, desc }: {
  icon: any; accent: string; title: string; desc: string;
}) {
  return (
    <div className="card p-5 relative overflow-hidden group">
      <div
        className="absolute -inset-x-12 -top-12 h-24 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: accent }}
      />
      <div
        className="relative inline-flex w-9 h-9 rounded-lg border items-center justify-center mb-3"
        style={{ background: `${accent}15`, borderColor: `${accent}40` }}
      >
        <Icon size={16} style={{ color: accent }} />
      </div>
      <h3 className="relative text-base font-semibold">{title}</h3>
      <p className="relative mt-1.5 text-2xs text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function FlywheelStep({ n, title, desc, icon: Icon, accent }: {
  n: number; title: string; desc: string; icon: any; accent: string;
}) {
  return (
    <div className="card p-4 relative">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-2xs font-semibold text-white"
          style={{ background: accent }}
        >
          {n}
        </div>
        <Icon size={13} style={{ color: accent }} />
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-1 text-2xs text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function FlywheelHook({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="card p-4 bg-bg-elevated/60">
      <div className="text-2xs uppercase tracking-wider text-text-subtle font-semibold mb-2">{title}</div>
      <ul className="space-y-1.5 text-2xs text-text-muted">
        {points.map(p => (
          <li key={p} className="flex items-start gap-1.5">
            <span className="text-accent-glow mt-0.5">·</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UpgradeStep({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="card p-5">
      <div className="text-2xs text-accent-glow font-medium">Step {n}</div>
      <h4 className="mt-2 text-base font-semibold">{title}</h4>
      <p className="mt-1.5 text-2xs text-text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function Plan({
  tier, price, tagline, perks, cta, ctaHref, highlight,
}: {
  tier: string; price: string; tagline: string; perks: string[];
  cta: string; ctaHref: string; highlight?: boolean;
}) {
  return (
    <div className={`card p-6 relative overflow-hidden ${highlight ? 'border-accent/40' : ''}`}>
      {highlight && (
        <div className="absolute top-3 right-3 text-2xs px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-accent-glow">
          推荐
        </div>
      )}
      <div className="text-2xs uppercase tracking-wider text-text-muted">{tier}</div>
      <div className="mt-2 text-2xl font-semibold num">{price}</div>
      <div className="text-2xs text-text-muted mt-1">{tagline}</div>
      <ul className="mt-5 space-y-1.5 text-sm">
        {perks.map(p => (
          <li key={p} className="flex items-start gap-1.5 text-text-muted">
            <span className="text-accent mt-0.5">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`mt-6 inline-flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition ${
          highlight
            ? 'bg-gradient-to-br from-accent to-accent2 text-white hover:shadow-lg hover:shadow-accent/20'
            : 'border border-border hover:border-border-strong'
        }`}
      >
        {cta} <ArrowRight size={13} />
      </Link>
    </div>
  );
}

function DesktopLoginCard({ launchHref }: { launchHref: string }) {
  return (
    <div className="mt-8 card p-6 max-w-xl bg-bg-elevated/80">
      <div className="inline-flex items-center gap-1.5 text-2xs text-accent-glow mb-3">
        <KeyRound size={11} />
        Design Platform Desktop · 登录
      </div>
      <h3 className="text-2xl font-semibold">欢迎使用 Design Platform</h3>
      <p className="mt-2 text-sm text-text-muted">
        下载完成后，请在桌面端登录 Builder 账号。以下是原型中的登录入口（模拟）。
      </p>
      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <Link
          href={launchHref}
          className="px-4 py-3 rounded-xl bg-white text-bg font-medium text-center hover:bg-white/90 transition"
        >
          使用 Builder 账户继续
        </Link>
        <Link
          href={launchHref}
          className="px-4 py-3 rounded-xl border border-border bg-white/[0.03] text-text-muted text-center hover:border-border-strong hover:text-text transition"
        >
          输入 API 密钥
        </Link>
      </div>
    </div>
  );
}

export default function SpiderPage() {
  return (
    <Suspense>
      <SpiderContent />
    </Suspense>
  );
}
