'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowUp,
  Paperclip,
  Image as ImageIcon,
  ChevronDown,
  Wand2,
  RefreshCw,
  Lock,
  Check,
  ArrowRight,
  Zap,
  Info,
  Bookmark,
  Crown,
} from 'lucide-react';
import {
  AI_TIERS,
  BUILD_SOURCES,
  BUILD_TEMPLATES,
  INSPIRATION_PROMPTS,
  sourcesForTier,
  tiersForTier,
  templatesForTier,
  type BuildTier,
  type AITier,
  type SourceId,
  type BuildTemplate,
} from '@/lib/mock/build-modes';
import { cn } from '@/lib/utils';

interface Props {
  tier: BuildTier;
  brandPill: string;
  heroTitle: [string, string];
  heroSub: string;
}

export function BuildAIComposer({ tier, brandPill, heroTitle, heroSub }: Props) {
  const router = useRouter();
  const tiers = useMemo(() => tiersForTier(tier), [tier]);
  const sources = useMemo(() => sourcesForTier(tier), [tier]);
  const templates = useMemo(() => templatesForTier(tier), [tier]);
  const inspirations = INSPIRATION_PROMPTS[tier];

  const [prompt, setPrompt] = useState('');
  const [sourceId, setSourceId] = useState<SourceId>('studio');
  const [aiTier, setAiTier] = useState<AITier>(tier === 'pro' ? 'architect' : 'pro');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [inspirationSeed, setInspirationSeed] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<null | { prompt: string; sourceId: SourceId; aiTier: AITier; toProjectId?: string }>(null);
  // pro: auto-navigate to Design Platform after "generating" animation; user: show result panel

  const activeSource = sources.find(s => s.id === sourceId)!;
  const activeTier = tiers.find(t => t.id === aiTier)!;

  const sourceLocked = activeSource.unlocksFor === 'pro' && tier === 'user';
  const tierLocked = activeTier.unlocksFor === 'pro' && tier === 'user';
  const locked = sourceLocked || tierLocked;

  const shownInspirations = useMemo(() => {
    const start = inspirationSeed % inspirations.length;
    return [
      inspirations[start],
      inspirations[(start + 1) % inspirations.length],
      inspirations[(start + 2) % inspirations.length],
      inspirations[(start + 3) % inspirations.length],
    ];
  }, [inspirationSeed, inspirations]);

  const submit = () => {
    if (!prompt.trim() || locked || generating) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      if (tier === 'pro') {
        // Pro: navigate to Aqara Design.
        const encodedPrompt = encodeURIComponent(prompt);
        router.push(`/build?entry=pro&demo_as=pro&workflow=space&q=${encodedPrompt}`);
      } else {
        // User: show inline result panel for activation
        setResult({ prompt, sourceId, aiTier });
      }
    }, 1200);
  };

  const useTemplate = (t: BuildTemplate) => {
    if (t.prompt) setPrompt(t.prompt);
    setSourceId(t.recommendedSource);
    // Only auto-pick tier if user can use it
    const canUseTier = !(AI_TIERS.find(x => x.id === t.recommendedTier)?.unlocksFor === 'pro' && tier === 'user');
    if (canUseTier) setAiTier(t.recommendedTier);
    setResult(null);
  };

  const useInspiration = (s: string) => {
    setPrompt(s);
    setResult(null);
  };

  // Source-specific helper text under composer
  const sourceHelper = {
    studio: '将基于你 Studio 上的真实设备 + 房间生成,可直接部署运行',
    floorplan: '上传 PDF / 照片 / 手画图,AI 会识别房间布局后再创作',
    inspiration: '不需要任何前置素材,从你的描述纯粹想象',
    fork: '从 Discover 上选一个作品作为起点,在它基础上改造',
  }[sourceId];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 w-full">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-accent-glow text-2xs">
          <Sparkles size={10} />
          {brandPill}
          {tier === 'pro' && (
            <span className="ml-1 px-1.5 py-0 rounded text-[9px] font-bold bg-gradient-to-br from-accent to-accent2 text-white tracking-wider">
              PRO
            </span>
          )}
        </div>
        <h1 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight">
          {heroTitle[0]}
          <br />
          <span className="text-gradient-brand">{heroTitle[1]}</span>
        </h1>
        <p className="mt-3 text-sm text-text-muted max-w-xl mx-auto">{heroSub}</p>
      </div>

      {/* Composer */}
      <div className="relative z-40">
        <div className="rounded-2xl bg-bg-elevated/80 backdrop-blur-xl border border-border-strong transition relative">
          {/* Top — source picker (Pinterest-style 起点选择) */}
          <div className="px-5 pt-3.5 flex items-center gap-2 flex-wrap">
            <span className="text-2xs text-text-subtle">从哪开始:</span>
            {sources.map(s => {
              const isLocked = s.unlocksFor === 'pro' && tier === 'user';
              const active = sourceId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => !isLocked && setSourceId(s.id)}
                  disabled={isLocked}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition',
                    active
                      ? 'border-accent/60 bg-accent/10 text-accent-glow'
                      : isLocked
                      ? 'border-warning/30 bg-warning/5 text-warning/70 cursor-not-allowed'
                      : 'border-border bg-bg-elevated text-text-muted hover:border-border-strong hover:text-text'
                  )}
                >
                  <span className="text-sm leading-none">{s.emoji}</span>
                  <span>{s.label}</span>
                  {isLocked && <Lock size={9} />}
                </button>
              );
            })}
          </div>

          <textarea
            rows={3}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={
              sourceId === 'studio'
                ? '描述你想要的场景,比如 "晚上看电影时,主灯关、氛围灯紫色、投影开"'
                : sourceId === 'floorplan'
                ? '描述这户型主要要解决什么 — "三居 90m²,老人同住,要适老化"'
                : sourceId === 'fork'
                ? '描述你想在这份方案上做什么改造'
                : '试试 — "父母即将搬来同住,夜间起夜希望走廊灯渐亮..."'
            }
            className="w-full bg-transparent outline-none resize-none px-5 pt-3 pb-2 text-base placeholder:text-text-subtle leading-relaxed"
          />

          {/* Source helper line */}
          <div className="px-5 pb-2 text-2xs text-text-subtle inline-flex items-center gap-1.5">
            <Info size={10} />
            {sourceHelper}
          </div>

          {/* Toolbar */}
          <div className="px-3 pb-3 flex items-center gap-1.5 flex-wrap border-t border-border pt-2.5">
            <button className="p-2 rounded-md hover:bg-white/5 text-text-muted" title="附件">
              <Paperclip size={14} />
            </button>
            <button className="p-2 rounded-md hover:bg-white/5 text-text-muted" title="图片">
              <ImageIcon size={14} />
            </button>

            {/* AI Tier chip — 算力档 */}
            <div className="relative">
              <button
                onClick={() => setTierOpen(o => !o)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full border transition',
                  tierLocked
                    ? 'border-warning/40 bg-warning/10 text-warning'
                    : 'border-accent/40 bg-accent/10 text-accent-glow hover:bg-accent/15'
                )}
              >
                <activeTier.icon size={12} />
                <span className="font-medium">{activeTier.label}</span>
                <span className="text-2xs num opacity-70">{activeTier.factor}</span>
                {tierLocked && <Lock size={10} />}
                <ChevronDown size={10} className={cn('transition', tierOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {tierOpen && (
                  <TierDropdown
                    tiers={tiers}
                    activeId={aiTier}
                    userTier={tier}
                    onPick={id => {
                      setAiTier(id);
                      setTierOpen(false);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1" />

            {tier === 'pro' && (
              <div className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-2xs text-text-muted">
                <Zap size={10} className="text-warning" />
                <span className="num">2,840</span>
                <span>A</span>
              </div>
            )}

            <button className="p-2 rounded-md hover:bg-white/5 text-text-muted" title="增强提示词">
              <Wand2 size={14} />
            </button>
            <button
              onClick={submit}
              disabled={!prompt.trim() || locked || generating}
              className={cn(
                'p-2 rounded-md transition',
                prompt.trim() && !locked && !generating
                  ? 'bg-gradient-to-br from-accent to-accent2 text-white hover:shadow-lg hover:shadow-accent/30'
                  : 'bg-white/5 text-text-subtle cursor-not-allowed'
              )}
              title="发送 (⌘ + Enter)"
            >
              {generating ? <RefreshCw size={14} className="animate-spin" /> : <ArrowUp size={14} />}
            </button>
          </div>

          {/* Locked banner */}
          {locked && (
            <div className="border-t border-warning/30 bg-warning/5 px-5 py-2.5 flex items-center gap-2 text-2xs">
              <Lock size={11} className="text-warning flex-shrink-0" />
              <span className="text-text-muted">
                <span className="text-warning font-medium">{tierLocked ? activeTier.label : activeSource.label}</span> 是 Pro 功能 ·
                单次约 <span className="num text-text">{activeTier.approxCost}</span>
              </span>
              <Link
                href="/onboarding"
                className="ml-auto text-accent-glow hover:underline inline-flex items-center gap-0.5"
              >
                成为 Certified Installer 解锁 <ArrowRight size={9} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Result panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-5"
          >
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-2xs text-accent-glow font-medium">
                      {activeTier.label} {activeTier.factor} · 生成完成
                    </span>
                    <span className="text-2xs text-text-subtle">· 用了 {activeTier.approxCost.split('-')[0]} A</span>
                    <span className="text-2xs text-text-subtle">· 来源:{activeSource.emoji} {activeSource.label}</span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    {result.aiTier === 'architect'
                      ? '已生成完整项目方案(户型 → Persona → 设备 → 自动化 → App 面板 → 部署计划),共 22 设备 / 4 Persona / 8 个自动化场景。'
                      : result.aiTier === 'pro'
                      ? '已生成方案优化建议(3 个场景 + 1 个 Persona 调整 + 设备 BOM)'
                      : '已生成 1 条新自动化(4 个动作),可激活到 Studio 测试'}
                  </div>
                  <p className="mt-1 text-2xs text-text-muted">
                    基于:"{result.prompt.length > 60 ? result.prompt.slice(0, 60) + '…' : result.prompt}"
                  </p>

                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {result.toProjectId ? (
                      <Link
                        href={`/build?project=${result.toProjectId}`}
                        className="px-3 py-2 text-xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white font-medium inline-flex items-center gap-1.5"
                      >
                        <ArrowRight size={11} /> 进入项目画布
                      </Link>
                    ) : (
                      <button className="px-3 py-2 text-xs rounded-md bg-gradient-to-br from-accent to-accent2 text-white font-medium inline-flex items-center gap-1.5">
                        <Zap size={11} /> 激活到我的 Studio
                      </button>
                    )}
                    <button className="px-3 py-2 text-xs rounded-md border border-border hover:border-border-strong inline-flex items-center gap-1.5">
                      <Bookmark size={11} /> 保存
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="px-3 py-2 text-xs rounded-md border border-border hover:border-border-strong inline-flex items-center gap-1.5"
                    >
                      <RefreshCw size={11} /> 重新生成
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inspiration directory */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-glow border border-accent/30 inline-flex items-center gap-1">
            <Sparkles size={9} /> 灵感目录
          </span>
          <button
            onClick={() => setInspirationSeed(s => s + 1)}
            className="text-2xs text-text-muted hover:text-text inline-flex items-center gap-1"
          >
            <RefreshCw size={9} /> 换一批
          </button>
        </div>
        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
          {shownInspirations.map(s => (
            <button
              key={s}
              onClick={() => useInspiration(s)}
              className="text-xs text-text-muted hover:text-text"
            >
              · {s}
            </button>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-glow border border-accent/30 inline-flex items-center gap-1">
            <Sparkles size={9} /> 常用模板
          </span>
          <span className="text-2xs text-text-muted">点击即用</span>
        </div>
        {/* Uniform 2-col grid, max 2 rows (4 cards) */}
        <div className="grid grid-cols-2 gap-3">
          {templates.slice(0, 4).map(t => (
            <button
              key={t.id}
              onClick={() => useTemplate(t)}
              className="relative h-36 rounded-2xl overflow-hidden text-left group"
              style={{ background: t.gradient }}
            >
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition" />
              {t.badge && (
                <span className={cn(
                  'absolute top-3 left-3 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded',
                  t.badge === 'PRO' && 'bg-white/20 backdrop-blur text-white border border-white/30',
                  t.badge === 'NEW' && 'bg-warning text-bg',
                  t.badge === 'HOT' && 'bg-rose-500 text-white',
                  t.badge === 'QUICK' && 'bg-success text-bg',
                )}>
                  {t.badge}
                </span>
              )}
              <div className="absolute bottom-3 left-4 right-4">
                <div className="text-white text-sm font-semibold leading-tight">{t.title}</div>
                <div className="text-white/75 text-2xs mt-0.5 line-clamp-1">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pro upsell */}
      {tier === 'user' && (
        <div className="mt-10 card p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent2/10 pointer-events-none" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className="mt-1.5 text-2xs text-accent-glow font-medium mb-1.5 inline-flex items-center gap-1">
                <Crown size={11} /> 解锁 总设计师 5x + Fork 起点
              </div>
              <h3 className="text-base font-semibold">
                做完整客户项目,而不只是单条自动化
              </h3>
              <p className="mt-1.5 text-2xs text-text-muted leading-relaxed">
                Certified Installer 可使用总设计师档:一次性生成户型方案 + Persona + 设备清单 + 自动化场景 + App 面板 + 漫游视频。
                整个项目生命周期都在 Design Platform 闭环。
              </p>
            </div>
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-md border border-accent/40 bg-accent/10 text-accent-glow text-sm font-medium hover:bg-accent/15 transition inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              成为 Certified Installer <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

// ─── AI Tier dropdown — focused, 3 tiers max ──────────────────────────

function TierDropdown({
  tiers,
  activeId,
  userTier,
  onPick,
}: {
  tiers: typeof AI_TIERS;
  activeId: AITier;
  userTier: BuildTier;
  onPick: (id: AITier) => void;
}) {
  return (
    <motion.div
      initial={{ y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="absolute top-full left-0 mt-2 w-96 card p-1.5 z-50 shadow-2xl"
    >
      <div className="px-2 py-1.5 text-2xs text-text-subtle">AI 算力档 · 空间设计职业层级</div>
      {tiers.map(t => {
        const locked = t.unlocksFor === 'pro' && userTier === 'user';
        const active = t.id === activeId;
        return (
          <button
            key={t.id}
            disabled={locked}
            onClick={() => !locked && onPick(t.id)}
            className={cn(
              'w-full text-left p-3 rounded-md flex items-start gap-3 transition',
              active && 'bg-accent/10 ring-1 ring-accent/30',
              !active && !locked && 'hover:bg-white/5',
              locked && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div
              className={cn(
                'w-9 h-9 rounded-md border bg-bg-elevated flex items-center justify-center flex-shrink-0 mt-0.5',
                t.id === 'architect' && 'border-amber-500/40 bg-amber-500/10',
                t.id === 'pro' && 'border-accent/40 bg-accent/10',
                t.id === 'assistant' && 'border-border'
              )}
            >
              <t.icon
                size={15}
                className={cn(
                  t.id === 'architect' && 'text-amber-400',
                  t.id === 'pro' && 'text-accent-glow',
                  t.id === 'assistant' && 'text-text-muted'
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-2xs num text-text-muted px-1 py-0 rounded bg-white/5 border border-border">
                  {t.factor}
                </span>
                {active && <Check size={11} className="text-accent" />}
                {locked && (
                  <span className="text-[10px] text-warning inline-flex items-center gap-0.5">
                    <Lock size={9} /> Pro
                  </span>
                )}
                <span className="ml-auto text-2xs text-text-subtle inline-flex items-center gap-0.5">
                  <Zap size={9} className="text-warning" />
                  {t.approxCost}
                </span>
              </div>
              <div className="text-2xs text-text font-medium mt-0.5">{t.desc}</div>
              <div className="text-2xs text-text-muted mt-1 leading-relaxed">{t.detail}</div>
            </div>
          </button>
        );
      })}
      {userTier === 'user' && (
        <div className="mt-1 pt-1 border-t border-border px-2 py-1 text-2xs text-text-subtle">
          总设计师档需要 Certified Installer ·
          <Link href="/onboarding" className="text-accent-glow hover:underline ml-1">
            解锁 →
          </Link>
        </div>
      )}
    </motion.div>
  );
}
