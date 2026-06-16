'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ArrowRight,
  Blocks,
  Building2,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Home,
  Layers3,
  Network,
  Puzzle,
  Search,
  ScanLine,
  Store,
  Users2,
  UserCircle2,
  WandSparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AqaraLogo } from '@/components/brand/AqaraLogo';
import { isBuilderRole, useRole } from '@/lib/role';
import { cn } from '@/lib/utils';

const ORCHESTRATION = [
  {
    title: '空间感知',
    desc: '人在场、光照、温度与设备状态，在同一张空间图谱中被理解。',
    icon: ScanLine,
  },
  {
    title: '系统协同',
    desc: '房间、家具、设备、自动化和插件能力，不再各自孤立。',
    icon: Network,
  },
  {
    title: '能力生长',
    desc: '方案、插件与模板可以被获取、复用，并部署到真实空间。',
    icon: Blocks,
  },
];

const STUDIO_OS = [
  { title: '空间本体', desc: '房间、区域、构件、实体与设备', icon: Layers3 },
  { title: '关系图谱', desc: '归属、安装、覆盖、连接与服务关系', icon: Network },
  { title: '本地闭环', desc: '感知、推理与动作在现场可靠运行', icon: Cpu },
  { title: '能力扩展', desc: '协议插件、模板与空间能力持续接入', icon: Puzzle },
];

const PLATFORM_CAPABILITIES = [
  { title: 'Aqara Studio', desc: '空间智能 OS，本地运行。', tag: 'Local Runtime', icon: Cpu },
  { title: '设计平台', desc: '户型、点位与自动化设计。', tag: 'Design', icon: WandSparkles },
  { title: '能力市场', desc: '插件、模板与空间能力获取。', tag: 'Marketplace', icon: Store },
  { title: 'Builder 社区', desc: '案例、灵感与 Remix 网络。', tag: 'Network', icon: Users2 },
];

const AQARA_HERO_POSTER = '/images/aqara-home-spatial-hero.png';

const HERO_SCENES = [
  {
    id: 'aqara',
    label: 'This is Aqara',
    title: '空间感知，智能执行。',
    subtitle: '人在场、光照、温度与设备状态被理解，空间自动进入正确的运行状态。',
    image: AQARA_HERO_POSTER,
    video: '',
    tags: ['Presence', 'Lighting'],
    status: ['Presence detected', 'Warm light scene', 'Energy adaptive'],
  },
  {
    id: 'presence',
    label: 'Presence',
    title: '人在场，空间有回应。',
    subtitle: '感知不是一个设备的事件，而是整张空间图谱的实时理解。',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=82',
    video: '',
    tags: ['Motion', 'Climate'],
    status: ['Presence graph updated', 'Comfort mode on', 'Shades adjusted'],
  },
  {
    id: 'studio',
    label: 'Studio OS',
    title: '本地闭环，稳定运行。',
    subtitle: '设计方案、自动化和插件能力下发到 Aqara Studio，在现场持续执行。',
    image: '/images/builder-pro-onboarding-hero-install.png',
    video: '',
    tags: ['Local', 'Automation'],
    status: ['Scene synced', 'Devices online', 'Local rules running'],
  },
];

const NAV_GROUPS = [
  {
    label: 'In Action',
    href: '#references',
    columns: [
      {
        title: 'Aqara Specialties',
        items: [
          { label: 'Matter-ready Spaces', desc: '跨生态设备与空间能力协同。', href: '#capabilities', icon: Network },
          { label: 'Apple Home Experience', desc: 'Apple Home 兼容体验与家庭场景。', href: '#capabilities', icon: Home },
          { label: 'Aqara Studio OS', desc: '本地运行、稳定执行。', href: '#studio', icon: Cpu },
          { label: 'Spatial Intelligence', desc: '空间感知、图谱理解与自动执行。', href: '#orchestration', icon: ScanLine },
        ],
      },
      {
        title: 'Areas of Application',
        items: [
          { label: 'Smart Home', desc: '住宅空间智能体验。', href: '#references', icon: Home },
          { label: 'Smart Office', desc: '办公室、会议室与共享空间。', href: '#references', icon: Building2 },
          { label: 'Hospitality', desc: '酒店、公寓与高端会所。', href: '#references', icon: Store },
          { label: 'Apartments & MDUs', desc: '多户住宅与集中部署。', href: '#references', icon: Blocks },
        ],
      },
    ],
  },
  {
    label: 'Aqara Studio',
    href: '#studio',
    columns: [
      {
        title: 'Studio OS',
        items: [
          { label: '空间本体', desc: '房间、区域、实体与设备。', href: '#studio', icon: Layers3 },
          { label: '关系图谱', desc: '归属、覆盖、连接与服务关系。', href: '#studio', icon: Network },
          { label: '本地闭环', desc: '感知、推理、动作现场运行。', href: '#studio', icon: Cpu },
        ],
      },
      {
        title: 'Connected Capabilities',
        items: [
          { label: 'Automation', desc: '自动化场景与空间策略。', href: '#capabilities', icon: Zap },
          { label: 'Plugins', desc: '协议插件与扩展能力。', href: '#capabilities', icon: Puzzle },
          { label: 'Templates', desc: '可复用空间方案模板。', href: '#capabilities', icon: WandSparkles },
        ],
      },
    ],
  },
  {
    label: 'Platform',
    href: '#capabilities',
    columns: [
      {
        title: 'Builder Platform',
        items: [
          { label: 'Design Platform', desc: 'Floor Plan、设备点位与自动化设计。', href: '#journey', icon: ScanLine },
          { label: 'Marketplace', desc: '插件、模板与空间能力获取。', href: '#capabilities', icon: Store },
          { label: 'Community', desc: '案例、灵感与 Remix 网络。', href: '#references', icon: Users2 },
        ],
      },
      {
        title: 'For Professionals',
        items: [
          { label: 'Workspace', desc: '团队协作、成员与权限管理。', href: '/signin?redirect=%2Fpro', icon: Blocks },
          { label: 'Project Delivery', desc: '设计、采购、实施、验收与运维。', href: '/signin?redirect=%2Fpro', icon: Building2 },
          { label: 'Installer Workflow', desc: '工单、Provisioning 与现场交付。', href: '/signin?redirect=%2Fpro', icon: Zap },
        ],
      },
    ],
  },
  {
    label: 'Academy',
    href: '#academy',
    columns: [
      {
        title: 'Learning Paths',
        items: [
          { label: 'Designer Training', desc: '空间方案、点位和自动化设计。', href: '#academy', icon: WandSparkles },
          { label: 'Installer Training', desc: '现场实施、诊断与验收流程。', href: '#academy', icon: Zap },
          { label: 'Developer Training', desc: '插件、协议与 Studio 能力开发。', href: '#academy', icon: CircuitBoard },
        ],
      },
      {
        title: 'Certification',
        items: [
          { label: 'Spatial Designer', desc: '方案设计技能认证。', href: '#academy', icon: ScanLine },
          { label: 'Certified Installer', desc: '安装交付认证路径。', href: '#academy', icon: Users2 },
          { label: 'Solution Architect', desc: '复杂项目架构能力。', href: '#academy', icon: Network },
        ],
      },
    ],
  },
  {
    label: 'Resources & Support',
    href: '#support',
    columns: [
      {
        title: 'Resources',
        items: [
          { label: 'Project References', desc: '全球空间智能案例。', href: '#references', icon: Building2 },
          { label: 'Documentation', desc: '平台、Studio 与插件文档。', href: '#support', icon: Puzzle },
          { label: 'Design Guides', desc: '空间设计与交付规范。', href: '#support', icon: Layers3 },
        ],
      },
      {
        title: 'Support',
        items: [
          { label: 'Partner Support', desc: '认证伙伴支持入口。', href: '/signin?redirect=%2Fpro', icon: Users2 },
          { label: 'Help Center', desc: '账号、Studio 与项目帮助。', href: '#support', icon: Store },
          { label: 'Contact Aqara', desc: '商务与生态合作咨询。', href: '#support', icon: ArrowRight },
        ],
      },
    ],
  },
];

const ECOSYSTEM_ROLES = [
  {
    title: 'Homeowners',
    desc: '从真实空间案例开始，Remix 适合自己的方案，让家真正理解日常生活。',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=82',
    icon: Home,
  },
  {
    title: 'Business Owners',
    desc: '用可复用的空间模板与 Site 运营能力，管理门店、办公与 hospitality 场景。',
    image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=900&q=82',
    icon: Building2,
  },
  {
    title: 'Creators',
    desc: '发布模板、插件和空间能力，让创意被更多项目获取、复用并持续生长。',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=82',
    icon: WandSparkles,
  },
  {
    title: 'Designers',
    desc: '完成 3D Floor Plan、设备点位、自动化场景与价格清单，让方案从表达走向交付。',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=82',
    icon: ScanLine,
  },
  {
    title: 'Installers',
    desc: '按工单、房间和设备清单推进现场实施，从初始化、入网、同步到验收更可靠。',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=82',
    icon: Zap,
  },
  {
    title: 'Developers',
    desc: '为空间智能创造可运行的能力，把协议插件、自动化逻辑和 AI 能力部署到真实空间。',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=82',
    icon: CircuitBoard,
  },
];

const REFERENCES = [
  {
    country: 'CR',
    title: 'Corazón de Selva',
    type: 'Smart Home',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=82',
    large: true,
  },
  {
    country: 'US',
    title: 'Drai’s Supper Club',
    type: 'Hospitality',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1100&q=82',
  },
  {
    country: 'US',
    title: 'Cubic Cowork',
    type: 'Office',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1100&q=82',
  },
  {
    country: 'US',
    title: 'LeBaron Estate',
    type: 'Smart Home',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=82',
  },
  {
    country: 'US',
    title: 'Lake Michigan Luxury',
    type: 'Smart Home',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1100&q=82',
  },
];

const JOURNEY_MODES = [
  {
    id: 'diy',
    title: 'Do It Yourself',
    eyebrow: 'For Space Owners',
    headline: 'Make the Most of Your Space',
    desc: '浏览案例，Remix 方案，再部署到自己的 Aqara Studio，让一个真实空间先运行起来。',
    image: '/images/aqara-home-spatial-hero.png',
    imagePosition: 'center',
    cta: '进入 Builder',
    href: '/signin?redirect=%2Fhome%2Fbuild',
    steps: [
      ['01', '发现', '从真实空间案例、模板和插件开始。'],
      ['02', 'Remix', '按自己的户型、设备和生活习惯调整方案。'],
      ['03', '运行', '部署到 Aqara Studio，让空间智能在本地运行。'],
    ],
  },
  {
    id: 'dip',
    title: 'Do It Professionally',
    eyebrow: 'For Certified Builders',
    headline: 'Start Your Journey as a Partner',
    desc: '以 Workspace 协作方式服务客户，从线索、设计、采购、安装到运维持续交付空间智能项目。',
    image: '/images/builder-pro-onboarding-hero-install.png',
    imagePosition: 'center',
    cta: '进入 Pro 工作台',
    href: '/pro',
    steps: [
      ['01', '获客', '管理客户线索，用 3D 方案呈现提升售前转化。'],
      ['02', '设计', '完成 Floor Plan、设备点位、自动化和报价清单。'],
      ['03', '交付', '派发安装工单，完成入网、同步、验收和账号转移。'],
    ],
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f4f4f1] text-[#141414]">
      <HeroSection />
      <OrchestrationSection />
      <StudioSection />
      <EcosystemSection />
      <JourneySection />
      <CapabilitiesSection />
      <ReferencesSection />
      <AcademySupportSection />
      <FinalCTA />
    </main>
  );
}

function HeroSection() {
  const { role, mounted } = useRole();
  const signedIn = mounted && isBuilderRole(role);
  const [activeScene, setActiveScene] = useState(0);
  const scene = HERO_SCENES[activeScene]!;

  return (
    <section className="relative min-h-[880px] overflow-hidden bg-[#101417] text-white md:min-h-screen">
      <HeroMedia scene={scene} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/26 via-black/10 to-black/70" />
      <div className="absolute inset-x-0 top-0 z-30 flex h-20 items-center justify-between bg-white px-5 text-[#141414] shadow-sm md:px-9">
        <Link href="/" className="flex items-center gap-2 text-[#141414]">
          <AqaraLogo size={25} />
        </Link>
        <nav className="hidden h-full items-center gap-6 text-sm font-medium text-[#454545] lg:flex">
          {NAV_GROUPS.map(item => (
            <NavDropdown key={item.label} item={item} />
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={signedIn ? '/pro' : '/signin?redirect=%2Fpro'}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#0f6bff] px-5 text-sm font-semibold text-white transition hover:bg-[#095de0]"
          >
            Become A Partner
          </Link>
          <button type="button" aria-label="Search" className="hidden h-10 w-10 items-center justify-center rounded-full text-[#242424] transition hover:bg-[#f1f4f8] sm:inline-flex">
            <Search size={22} />
          </button>
          <Link
            href={signedIn ? '/home' : '/signin?redirect=%2Fhome'}
            aria-label={signedIn ? 'Open account' : 'Login'}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#d7dce4] bg-white text-[#242424] transition hover:bg-[#f1f4f8]"
          >
            {signedIn ? (
              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0f6bff] to-[#16c7c7] text-sm font-semibold text-white">J</span>
            ) : (
              <UserCircle2 size={24} />
            )}
          </Link>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[880px] max-w-7xl flex-col items-center justify-center px-6 pb-28 pt-28 text-center md:min-h-screen">
        <motion.h1
          key={scene.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="max-w-5xl text-5xl font-semibold leading-[1.05] md:text-7xl"
        >
          {scene.title}
        </motion.h1>
        <motion.p
          key={scene.subtitle}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="mt-5 max-w-2xl text-lg leading-8 text-white/82 md:text-xl"
        >
          {scene.subtitle}
        </motion.p>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/18 bg-black/32 p-1.5 text-xs text-white/76 backdrop-blur">
        {HERO_SCENES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveScene(index)}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-full px-4 font-semibold transition',
              activeScene === index ? 'bg-[#0f6bff] text-white' : 'hover:bg-white/10 hover:text-white'
            )}
          >
            <span className={cn('h-2.5 w-2.5 rounded-full border', activeScene === index ? 'border-white bg-white/20' : 'border-white/60')} />
            {item.label}
          </button>
        ))}
      </div>
      <style>{`
        @keyframes aqara-hero-pan {
          0% { transform: scale(1.02) translate3d(0, 0, 0); filter: brightness(.9) saturate(1.02); }
          45% { transform: scale(1.08) translate3d(-1.6%, -1%, 0); filter: brightness(1.08) saturate(1.12); }
          100% { transform: scale(1.04) translate3d(1.2%, .6%, 0); filter: brightness(.96) saturate(1.04); }
        }
        @keyframes aqara-light-sweep {
          0% { transform: translateX(-115%) skewX(-12deg); opacity: 0; }
          18% { opacity: .42; }
          76% { opacity: .34; }
          100% { transform: translateX(115%) skewX(-12deg); opacity: 0; }
        }
        @keyframes aqara-pulse-ring {
          0% { transform: scale(.74); opacity: .75; }
          72% { opacity: .18; }
          100% { transform: scale(1.48); opacity: 0; }
        }
        @keyframes aqara-status-rise {
          0%, 100% { transform: translateY(10px); opacity: .38; }
          44%, 72% { transform: translateY(0); opacity: .94; }
        }
        .aqara-hero-pan { animation: aqara-hero-pan 14s ease-in-out infinite alternate; }
        .aqara-light-sweep { animation: aqara-light-sweep 8s ease-in-out infinite; }
        .aqara-pulse-ring { animation: aqara-pulse-ring 2.8s ease-out infinite; }
        .aqara-status-card:nth-child(2) { animation-delay: 1.1s; }
        .aqara-status-card:nth-child(3) { animation-delay: 2.2s; }
      `}</style>
    </section>
  );
}

function NavDropdown({ item }: { item: typeof NAV_GROUPS[number] }) {
  return (
    <div className="group flex h-full items-center">
      <Link href={item.href} className="relative flex h-full items-center transition hover:text-[#141414]">
        {item.label}
        <span className="absolute inset-x-0 bottom-[18px] h-0.5 origin-left scale-x-0 rounded-full bg-[#0f6bff] transition group-hover:scale-x-100 group-focus-within:scale-x-100" />
      </Link>
      <div className="pointer-events-none absolute left-0 top-20 z-40 w-full translate-y-2 border-t border-[#eceff3] bg-white opacity-0 shadow-[0_28px_70px_rgba(15,23,42,0.14)] transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="mx-auto grid max-w-5xl gap-16 px-8 py-10 md:grid-cols-2">
          {item.columns.map(column => (
            <div key={column.title}>
              <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.42em] text-[#9aa3ae]">{column.title}</div>
              <div className="grid gap-2">
                {column.items.map(entry => {
                  const Icon = entry.icon;
                  return (
                    <Link key={entry.label} href={entry.href} className="group/item flex items-start gap-4 rounded-md px-2 py-3 text-[#333] transition hover:bg-[#f4f7fb]">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#dbe3ee] text-[#3b4654] transition group-hover/item:border-[#0f6bff]/28 group-hover/item:text-[#0f6bff]">
                        <Icon size={17} strokeWidth={1.8} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{entry.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#717b86]">{entry.desc}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroMedia({ scene }: { scene: typeof HERO_SCENES[number] }) {
  return (
    <div className="absolute inset-0" aria-label="Aqara spatial intelligence hero video">
      {scene.video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={scene.video}
          poster={scene.image}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img key={scene.image} src={scene.image} alt="" className="aqara-hero-pan absolute inset-0 h-full w-full object-cover transition duration-500" />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,rgba(15,107,255,.16),transparent_34%),linear-gradient(90deg,rgba(0,0,0,.52),transparent_28%,transparent_72%,rgba(0,0,0,.38))]" />
      <span className="aqara-light-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#9fd7ff]/32 to-transparent blur-sm" />
      <span className="absolute left-[17%] top-[25%] h-16 w-16 rounded-full border-[6px] border-white/82 border-r-transparent border-b-transparent" />
      <span className="aqara-pulse-ring absolute left-[17%] top-[25%] h-16 w-16 rounded-full border-2 border-[#16c7c7]/80" />
      <span className="absolute right-[18%] top-[35%] h-16 w-16 rounded-full border-[6px] border-white/82 border-l-transparent border-t-transparent" />
      <span className="aqara-pulse-ring absolute right-[18%] top-[35%] h-16 w-16 rounded-full border-2 border-[#0f6bff]/80 [animation-delay:.7s]" />
      <span className="absolute left-[52%] top-[49%] h-14 w-14 rounded-full border-[5px] border-white/76 border-r-transparent" />
      <span className="absolute left-[49%] top-[34%] text-sm font-semibold text-white/86">{scene.tags[0]}</span>
      <span className="absolute right-[23%] bottom-[31%] text-sm font-semibold text-white/86">{scene.tags[1]}</span>
      <div className="absolute bottom-[18%] left-[7%] hidden w-[250px] space-y-2 md:block">
        {scene.status.map(item => (
          <div key={item} className="aqara-status-card rounded-md border border-white/14 bg-black/28 px-4 py-3 text-xs font-semibold text-white/82 shadow-2xl backdrop-blur" style={{ animation: 'aqara-status-rise 5.8s ease-in-out infinite' }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrchestrationSection() {
  return (
    <section id="orchestration" className="bg-[#f4f4f1] px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Your Space, Perfectly Orchestrated.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ORCHESTRATION.map(item => <ValueCard key={item.title} {...item} />)}
        </div>
      </div>
    </section>
  );
}

function StudioSection() {
  return (
    <section id="studio" className="bg-[#101417] px-6 py-28 text-white">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[.86fr_1.14fr] lg:items-center">
        <div>
          <div className="text-xs font-semibold tracking-[0.48em] text-[#16c7c7]">AQARA STUDIO</div>
          <h2 className="mt-6 text-5xl font-semibold tracking-tight md:text-6xl">空间智能 OS.</h2>
          <p className="mt-7 max-w-xl text-base leading-8 text-white/62">
            空间本体、关系图谱、本地闭环与云端协作，在真实空间中稳定运行。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {STUDIO_OS.map(item => <DarkFeature key={item.title} {...item} />)}
        </div>
      </div>
    </section>
  );
}

function EcosystemSection() {
  const [activeRole, setActiveRole] = useState<number | null>(null);
  const expanded = activeRole !== null;

  return (
    <section id="ecosystem" className="bg-white py-24">
      <div className="w-full">
        <h2 className="text-center text-4xl font-semibold tracking-tight md:text-5xl">为全球空间智能生态而生。</h2>
        <div
          className="mt-12 flex w-full flex-col overflow-hidden bg-[#101417] md:h-[560px] md:flex-row"
          onMouseLeave={() => setActiveRole(null)}
        >
          {ECOSYSTEM_ROLES.map((item, index) => (
            <RolePanel
              key={item.title}
              item={item}
              active={activeRole === index}
              expanded={expanded}
              onActivate={() => setActiveRole(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  const [activeJourney, setActiveJourney] = useState(0);
  const selected = JOURNEY_MODES[activeJourney]!;

  return (
    <section id="journey" className="bg-[#f4f4f1] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-5xl font-semibold tracking-tight md:text-6xl">从灵感，到运行。</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {JOURNEY_MODES.map((item, index) => (
            <JourneyModeCard
              key={item.id}
              item={item}
              active={activeJourney === index}
              onSelect={() => setActiveJourney(index)}
            />
          ))}
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
            <div className="relative aspect-[4/3] min-h-[420px] w-full">
              <img
                src={selected.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: selected.imagePosition }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 rounded-md border border-white/20 bg-black/28 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
                {selected.eyebrow}
              </div>
            </div>
          </div>
          <div className="grid min-h-[420px] gap-4">
            {selected.steps.map(([num, title, desc]) => (
              <div key={num} className="flex flex-col justify-center bg-white p-8">
                <div className="text-sm font-semibold text-[#0f6bff]">{num}</div>
                <div className="mt-3 text-2xl font-semibold">{title}</div>
                <p className="mt-3 text-sm leading-6 text-[#606060]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section id="capabilities" className="bg-[#f4f4f1] px-6 pb-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-5xl font-semibold tracking-tight">平台能力</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PLATFORM_CAPABILITIES.map(item => <CapabilityCard key={item.title} {...item} />)}
        </div>
      </div>
    </section>
  );
}

function ReferencesSection() {
  return (
    <section id="references" className="bg-[#161817] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">空间被点亮的地方</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {REFERENCES.map(item => (
            <ReferenceCard key={item.title} item={item} />
          ))}
        </div>
        <Link href="/signin?redirect=%2Fhome%2Fdiscover" className="mt-8 inline-flex h-14 items-center justify-center rounded-md border border-white/70 px-7 text-sm font-semibold text-white transition hover:bg-white hover:text-[#161817]">
          Show all References
        </Link>
      </div>
    </section>
  );
}

function AcademySupportSection() {
  return (
    <section className="bg-[#f4f4f1] px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
        <div id="academy" className="min-h-[260px] rounded-[28px] bg-white p-8 shadow-sm">
          <div className="text-sm font-semibold text-[#0f6bff]">Academy</div>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight">让生态角色持续成长。</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#626a73]">
            面向 Designers、Installers、Creators 与 Developers 的学习路径、项目方法与认证能力。
          </p>
          <Link href="/signin?redirect=%2Fhome" className="mt-8 inline-flex h-11 items-center rounded-md bg-[#0f6bff] px-5 text-sm font-semibold text-white">
            Explore Academy
          </Link>
        </div>
        <div id="support" className="min-h-[260px] rounded-[28px] bg-[#101417] p-8 text-white shadow-sm">
          <div className="text-sm font-semibold text-[#16c7c7]">Resources & Support</div>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight">从资料到交付支持。</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/62">
            项目案例、设计指南、Studio 文档、插件资源与伙伴支持入口集中在一起。
          </p>
          <Link href="/signin?redirect=%2Fpro" className="mt-8 inline-flex h-11 items-center rounded-md bg-white px-5 text-sm font-semibold text-[#101417]">
            Get Support
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[#f4f4f1] px-6 py-28 text-center">
      <h2 className="text-5xl font-semibold tracking-tight md:text-6xl">从一个空间开始。</h2>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/signin?redirect=%2Fhome" className="inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-semibold text-white">
          进入 Builder
        </Link>
        <Link href="/signin?redirect=%2Fhome%2Fmarketplace" className="inline-flex h-12 items-center justify-center rounded-full border border-[#d8d8d4] bg-white px-7 text-sm font-semibold text-[#141414]">
          浏览市场
        </Link>
      </div>
    </section>
  );
}

function ValueCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: LucideIcon }) {
  return (
    <div className="bg-[#e9f3ff] p-8 text-left text-[#10233f]">
      <Icon size={32} strokeWidth={1.8} className="text-[#0f6bff]" />
      <h3 className="mt-8 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#29425f]">{desc}</p>
    </div>
  );
}

function DarkFeature({ title, desc, icon: Icon }: { title: string; desc: string; icon: LucideIcon }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.075] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#16c7c7]">
        <Icon size={19} />
      </span>
      <h3 className="mt-8 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/52">{desc}</p>
    </div>
  );
}

function RolePanel({
  item,
  active,
  expanded,
  onActivate,
}: {
  item: typeof ECOSYSTEM_ROLES[number];
  active: boolean;
  expanded: boolean;
  onActivate: () => void;
}) {
  const Icon = item.icon;

  return (
    <article
      className={cn(
        'group relative min-h-[260px] overflow-hidden border-t border-white/10 text-white transition-all duration-500 md:min-h-0 md:border-l md:border-t-0',
        expanded ? (active ? 'md:basis-[44%]' : 'md:basis-[11.2%]') : 'md:flex-1'
      )}
      onMouseEnter={onActivate}
    >
      <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className={cn('absolute inset-0 transition duration-500', active ? 'bg-black/34' : 'bg-black/42')} />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/86 via-black/30 to-transparent" />
      <button
        type="button"
        aria-pressed={active}
        onClick={onActivate}
        onFocus={onActivate}
        className="absolute inset-0 z-10 cursor-pointer text-left"
      >
        <span className="sr-only">查看 {item.title}</span>
      </button>
      <div className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 transition-all duration-500 md:p-8',
        active ? 'md:translate-y-0 md:opacity-100' : 'md:translate-y-20 md:opacity-100'
      )}>
        <div className={cn('flex items-center gap-3 transition-all duration-500', active ? 'md:justify-center' : 'md:justify-center')}>
          <span className={cn(
            'hidden h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 backdrop-blur md:flex',
            active && 'bg-[#0f6bff]/85'
          )}>
            <Icon size={18} />
          </span>
          <h3 className={cn('text-2xl font-semibold transition-all duration-500', !active && 'md:text-xl')}>
            {item.title}
          </h3>
        </div>
        <p className={cn(
          'mx-auto mt-4 max-w-2xl text-center text-sm leading-6 text-white/72 transition-all duration-500',
          active ? 'opacity-100' : 'md:max-h-0 md:overflow-hidden md:opacity-0'
        )}>
          {item.desc}
        </p>
        <Link
          href="/signin?redirect=%2Fpro"
          className={cn(
            'pointer-events-auto mx-auto mt-7 hidden h-12 w-fit items-center justify-center rounded-md bg-[#0f6bff] px-7 text-sm font-semibold text-white transition hover:bg-[#095de0]',
            active && 'md:inline-flex'
          )}
        >
          Learn more
        </Link>
      </div>
    </article>
  );
}

function JourneyModeCard({
  item,
  active,
  onSelect,
}: {
  item: typeof JOURNEY_MODES[number];
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        'min-h-[250px] rounded-[28px] border p-8 text-left transition hover:-translate-y-0.5',
        active ? 'border-black bg-black text-white shadow-xl shadow-black/10' : 'border-[#b9b9b4] bg-[#fdfdfb] text-[#141414]'
      )}
    >
      {item.id === 'diy' ? <Home size={34} /> : <Zap size={34} />}
      <div className={cn('mt-9 text-sm font-semibold', active ? 'text-[#16c7c7]' : 'text-[#0f6bff]')}>{item.title}</div>
      <h3 className="mt-3 text-3xl font-semibold">{item.headline}</h3>
      <p className={cn('mt-4 text-sm leading-6', active ? 'text-white/58' : 'text-[#5f5f5a]')}>{item.desc}</p>
      <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
        {active ? '正在查看' : '切换查看'} <ChevronRight size={15} />
      </span>
    </button>
  );
}

function CapabilityCard({ title, desc, tag, icon: Icon }: { title: string; desc: string; tag: string; icon: LucideIcon }) {
  return (
    <Link href="/signin?redirect=%2Fhome%2Fdiscover" className="group relative min-h-[330px] overflow-hidden rounded-[28px] bg-white p-7 shadow-sm transition hover:-translate-y-0.5">
      <span className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-white">NEW</span>
      <Icon size={30} className="mt-8 text-[#141414]" />
      <h3 className="mt-7 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#656560]">{desc}</p>
      <span className="absolute bottom-0 right-0 flex h-32 w-36 items-end justify-end rounded-tl-[32px] bg-[#dff3ff] p-7 text-xs font-semibold text-[#17456a]">
        {tag}
      </span>
      <span className="absolute left-7 bottom-7 inline-flex items-center gap-2 text-sm font-semibold">
        查看 <ArrowRight size={14} />
      </span>
    </Link>
  );
}

function ReferenceCard({ item }: { item: typeof REFERENCES[number] }) {
  return (
    <Link href="/signin?redirect=%2Fhome%2Fdiscover" className={cn('group relative min-h-[280px] overflow-hidden rounded-lg md:col-span-1', item.large && 'md:col-span-2')}>
      <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/16 to-transparent" />
      <span className="absolute left-5 top-5 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#141414]">
        {item.country}
      </span>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
        <div>
          <div className="text-2xl font-semibold">{item.title}</div>
          <div className="mt-1 text-sm text-white/78">{item.type}</div>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-[#141414] transition group-hover:bg-[#dff3ff]">
          <ArrowRight size={18} />
        </span>
      </div>
    </Link>
  );
}
