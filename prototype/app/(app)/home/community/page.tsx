'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Settings as SettingsIcon,
  Sparkles,
  Flame,
  MessageSquare,
  UserPlus,
  Search,
  Image as ImageIcon,
  Video,
  Hash,
  Send,
  Heart,
  MessageCircle,
  Star,
  Share2,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Paperclip,
  ShieldCheck,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'recommended', label: '推荐', icon: SettingsIcon },
  { id: 'help', label: '求助', icon: HelpCircle },
  { id: 'spaces', label: '空间', icon: Sparkles },
  { id: 'plugins', label: '插件', icon: Flame },
  { id: 'projects', label: '项目', icon: MessageSquare },
  { id: 'following', label: '关注', icon: UserPlus },
];

type HelpStatus = 'open' | 'solved';

type CommunityPost = {
  id: number;
  author: string;
  avatar: string;
  avatarBg: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  stars: number;
  shares: number;
  type?: 'post' | 'help';
  topic?: string;
  status?: HelpStatus;
  professionalReply?: {
    author: string;
    content: string;
    helpful: boolean;
  };
  communityReply?: {
    author: string;
    content: string;
  };
};

const POSTS: CommunityPost[] = [
  {
    id: 101,
    author: 'Jun',
    avatar: 'J',
    avatarBg: 'from-blue-600 to-cyan-500',
    time: '18 分钟前',
    type: 'help',
    topic: '户型建议',
    status: 'open',
    content: '客餐厅是开放空间，FP2 和门窗传感器应该怎么布置，才能兼顾夜间照明和离家安防？户型图已经整理好了。',
    likes: 12,
    comments: 8,
    stars: 6,
    shares: 2,
    professionalReply: {
      author: 'sonja.design',
      content: '建议把 FP2 放在客餐厅交界、避开窗帘摆动区域；玄关门磁作为离家状态的确认条件，再配合 5 分钟无人作为二次判断。',
      helpful: false,
    },
  },
  {
    id: 102,
    author: 'LilyHome',
    avatar: 'L',
    avatarBg: 'from-violet-500 to-fuchsia-500',
    time: '1 小时前',
    type: 'help',
    topic: '自动化诊断',
    status: 'solved',
    content: '离家模式偶尔没有关闭餐厅灯。条件是门锁反锁并且全屋无人，应该怎样排查？',
    likes: 20,
    comments: 11,
    stars: 18,
    shares: 3,
    professionalReply: {
      author: 'Kim Min-jun',
      content: '问题是餐厅区域的无人状态更新晚于门锁事件。把执行延迟设为 30 秒，并在执行前再次判断区域无人即可。',
      helpful: true,
    },
  },
  {
    id: 1,
    author: 'Aqara Official',
    avatar: 'A',
    avatarBg: 'from-accent to-accent2',
    time: '今天',
    content: 'Builder Pro 的远程服务会话已开放内测：用户授权后，专业人可进入 Studio Service Console 做诊断、协议调试和方案复核。',
    likes: 128,
    comments: 24,
    stars: 36,
    shares: 12,
    type: 'post',
  },
  {
    id: 2,
    author: 'sonja.design',
    avatar: 'S',
    avatarBg: 'from-pink-500 to-orange-500',
    time: '2 小时前',
    content: '把一个 82m2 公寓拆成“工作日 / 周末 / 旅行”三套 Persona，Studio 本地运行，Life App 只保留 6 个高频入口。附户型图和设备点位。',
    likes: 86,
    comments: 19,
    stars: 42,
    shares: 7,
    type: 'post',
  },
  {
    id: 3,
    author: 'kim.spatial',
    avatar: 'K',
    avatarBg: 'from-purple-500 to-pink-500',
    time: '3 天前',
    content: '首尔江南第 3 套适老化项目完成。FP400、床垫传感器和夜间照明联动效果不错，项目账本里把设计费、安装费、维护费拆得很清楚。',
    likes: 47,
    comments: 8,
    stars: 12,
    shares: 4,
    type: 'post',
  },
];

const HOT_TOPICS = [
  { rank: 1, name: 'StudioOS', heat: '1.8k' },
  { rank: 2, name: 'FloorPlan', heat: '1.5k' },
  { rank: 3, name: 'RemoteService', heat: '1.4k' },
  { rank: 4, name: 'PluginDev', heat: '1.1k' },
];

const HELP_TOPICS = ['户型建议', '自动化诊断', '设备选型', 'Studio 调优'];

export default function HomeCommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <HomeCommunityContent />
    </Suspense>
  );
}

function HomeCommunityContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const topicParam = searchParams?.get('topic');
  const composeParam = searchParams?.get('compose');
  const statusParam = searchParams?.get('status');
  const initialTab = tabParam === 'help' ? 'help' : 'recommended';
  const [tab, setTab] = useState(initialTab);
  const [posts, setPosts] = useState<CommunityPost[]>(POSTS);
  const [composerOpen, setComposerOpen] = useState(composeParam === '1');
  const [helpTopic, setHelpTopic] = useState(
    topicParam === 'automation' ? '自动化诊断' : topicParam === 'floorplan' ? '户型建议' : HELP_TOPICS[0]
  );
  const [helpTitle, setHelpTitle] = useState('');
  const [helpDescription, setHelpDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [replyingPostId, setReplyingPostId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (tabParam === 'help') setTab('help');
    if (composeParam === '1') setComposerOpen(true);
  }, [composeParam, tabParam]);

  const visiblePosts = useMemo(() => {
    if (tab !== 'help') return posts.filter(post => post.type !== 'help');
    const helpPosts = posts.filter(post => post.type === 'help');
    if (statusParam === 'open') {
      return helpPosts.filter(post => post.status === 'open');
    }
    return helpPosts;
  }, [posts, statusParam, tab]);

  const publishHelp = () => {
    if (!helpTitle.trim() || !helpDescription.trim()) return;
    setPosts(current => [
      {
        id: Date.now(),
        author: 'Jun',
        avatar: 'J',
        avatarBg: 'from-blue-600 to-cyan-500',
        time: '刚刚',
        type: 'help',
        topic: helpTopic,
        status: 'open',
        content: `${helpTitle.trim()} — ${helpDescription.trim()}`,
        likes: 0,
        comments: 0,
        stars: 0,
        shares: 0,
      },
      ...current,
    ]);
    setHelpTitle('');
    setHelpDescription('');
    setComposerOpen(false);
    setPublished(true);
    setTab('help');
  };

  const markHelpful = (postId: number) => {
    setPosts(current => current.map(post => (
      post.id === postId && post.professionalReply
        ? {
            ...post,
            professionalReply: { ...post.professionalReply, helpful: true },
          }
        : post
    )));
  };

  const markSolved = (postId: number) => {
    setPosts(current => current.map(post => (
      post.id === postId ? { ...post, status: 'solved' as const } : post
    )));
  };

  const submitReply = (postId: number) => {
    if (!replyText.trim()) return;
    setPosts(current => current.map(post => (
      post.id === postId
        ? {
            ...post,
            comments: post.comments + 1,
            communityReply: {
              author: 'Jun',
              content: replyText.trim(),
            },
          }
        : post
    )));
    setReplyText('');
    setReplyingPostId(null);
  };

  return (
    <div className="min-h-screen">
      <UserTopBar title="Community" />

      <main className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div>
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            {TABS.map(t => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setPublished(false);
                  }}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm inline-flex items-center gap-2 transition border whitespace-nowrap',
                    active
                      ? 'bg-accent/10 border-accent/40 text-text'
                      : 'border-border text-text-muted hover:text-text hover:bg-white/5'
                  )}
                >
                  <t.icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="card p-5 mb-5 bg-gradient-to-br from-accent/10 via-transparent to-accent2/10 border-accent/20">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {tab === 'help' ? '向社区发起求助' : 'Community 用于分享，Forum 用于支持'}
                </div>
                <p className="mt-1 text-2xs text-text-muted leading-relaxed">
                  {tab === 'help'
                    ? '描述空间、自动化或设备问题，让玩家和 Professional 提供建议；产品故障与售后问题仍进入官方 Forum。'
                    : '在这里发布空间方案、插件体验、项目复盘和服务案例。产品问题、售后排查和 Q&A 请进入官方 Forum。'}
                </p>
              </div>
              <div className="flex gap-2">
                {tab === 'help' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setComposerOpen(true)}
                      className="px-3 py-2 rounded-md bg-accent/15 border border-accent/30 text-2xs text-accent-glow hover:bg-accent/20 transition"
                    >
                      发起求助
                    </button>
                    <Link href="/home/community?tab=help&status=open" className="px-3 py-2 rounded-md border border-border text-2xs text-text-muted hover:text-text hover:border-border-strong transition">
                      查看待解决
                    </Link>
                  </>
                ) : (
                  <>
                    <a href="/marketplace" className="px-3 py-2 rounded-md border border-border text-2xs text-text-muted hover:text-text hover:border-border-strong transition">
                      进入市场
                    </a>
                    <a href="/builders" className="px-3 py-2 rounded-md bg-accent/15 border border-accent/30 text-2xs text-accent-glow hover:bg-accent/20 transition">
                      找专业人
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {published ? (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={15} />
              求助已发布，社区成员现在可以回复。
            </div>
          ) : null}

          {/* Search */}
          <div className="relative mb-5">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              placeholder={tab === 'help' ? '搜索待解决问题、分类或建议...' : '搜索空间方案、插件、专业人、项目经验...'}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md bg-bg-elevated border border-border focus:border-border-strong outline-none transition"
            />
          </div>

          {/* Composer */}
          {tab === 'help' ? (
            composerOpen ? (
              <div className="card p-5 mb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">发起社区求助</div>
                    <div className="mt-1 text-2xs text-text-muted">一个问题只描述一个场景，更容易得到有效建议。</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setComposerOpen(false)}
                    className="text-2xs text-text-muted hover:text-text"
                  >
                    收起
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  <label className="relative">
                    <span className="mb-1.5 block text-2xs font-medium text-text-muted">问题分类</span>
                    <select
                      value={helpTopic}
                      onChange={event => setHelpTopic(event.target.value)}
                      className="h-10 w-full appearance-none rounded-md border border-border bg-bg-elevated px-3 pr-9 text-sm outline-none transition focus:border-accent/50"
                    >
                      {HELP_TOPICS.map(topic => <option key={topic}>{topic}</option>)}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute bottom-3 right-3 text-text-muted" />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-2xs font-medium text-text-muted">一句话描述问题</span>
                    <input
                      value={helpTitle}
                      onChange={event => setHelpTitle(event.target.value)}
                      placeholder="例如：离家模式偶尔没有关闭餐厅灯"
                      className="h-10 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm outline-none transition focus:border-accent/50"
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-2xs font-medium text-text-muted">补充场景与已尝试的方法</span>
                    <textarea
                      value={helpDescription}
                      onChange={event => setHelpDescription(event.target.value)}
                      placeholder="说明设备、触发条件、期望结果，以及问题发生的频率。"
                      rows={4}
                      className="w-full resize-none rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-accent/50"
                    />
                  </label>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button type="button" className="inline-flex items-center gap-1.5 text-2xs text-text-muted hover:text-text">
                    <Paperclip size={13} />
                    添加图片或截图
                  </button>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={publishHelp}
                    disabled={!helpTitle.trim() || !helpDescription.trim()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-4 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Send size={12} />
                    发布求助
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="card mb-5 flex w-full items-center gap-3 p-4 text-left transition hover:border-accent/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent2 text-sm font-medium">J</div>
                <span className="text-sm text-text-muted">描述你的空间、自动化或设备问题...</span>
                <span className="ml-auto rounded-md bg-accent/15 px-3 py-1.5 text-2xs font-medium text-accent-glow">发起求助</span>
              </button>
            )
          ) : (
            <div className="card p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  J
                </div>
                <div className="flex-1">
                  <input
                    placeholder="分享空间方案、插件体验、项目复盘..."
                    className="w-full px-3 py-2 text-sm rounded-md bg-white/[0.03] border border-border focus:border-accent/40 outline-none transition"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <button className="text-2xs text-text-muted hover:text-text inline-flex items-center gap-1.5">
                      <ImageIcon size={13} /> 图片
                    </button>
                    <button className="text-2xs text-text-muted hover:text-text inline-flex items-center gap-1.5">
                      <Video size={13} /> 视频
                    </button>
                    <button className="text-2xs text-text-muted hover:text-text inline-flex items-center gap-1.5">
                      <Hash size={13} /> 话题
                    </button>
                    <div className="flex-1" />
                    <button className="px-3 py-1.5 text-xs rounded-md bg-white/5 hover:bg-white/10 text-text-muted inline-flex items-center gap-1.5">
                      <Send size={12} /> 发布
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts */}
          <div className="space-y-4">
            {visiblePosts.map(p => (
              <article key={p.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-medium flex-shrink-0', p.avatarBg)}>
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{p.author}</span>
                      <span className="text-2xs text-text-subtle">·</span>
                      <span className="text-2xs text-text-muted">{p.time}</span>
                      {p.type === 'help' ? (
                        <>
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            {p.topic}
                          </span>
                          <span className={cn(
                            'rounded px-2 py-0.5 text-[10px] font-medium',
                            p.status === 'solved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          )}>
                            {p.status === 'solved' ? '已解决' : '待解决'}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-text leading-relaxed">{p.content}</p>

                    {p.type === 'help' && p.professionalReply ? (
                      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/70 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                          <ShieldCheck size={14} className="text-blue-600" />
                          {p.professionalReply.author}
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            Professional 回复
                          </span>
                          {p.professionalReply.helpful ? (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                              <Check size={12} />
                              有帮助
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-600">{p.professionalReply.content}</p>
                        {!p.professionalReply.helpful ? (
                          <button
                            type="button"
                            onClick={() => markHelpful(p.id)}
                            className="mt-3 inline-flex items-center gap-1.5 text-2xs font-medium text-blue-700 hover:text-blue-900"
                          >
                            <Lightbulb size={12} />
                            这条建议有帮助
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    {p.type === 'help' && p.communityReply ? (
                      <div className="mt-3 rounded-lg border border-border bg-white/[0.03] p-3">
                        <div className="text-2xs font-medium text-text">{p.communityReply.author} · 社区建议</div>
                        <p className="mt-1.5 text-xs leading-5 text-text-muted">{p.communityReply.content}</p>
                      </div>
                    ) : null}

                    {p.type === 'help' && replyingPostId === p.id ? (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          value={replyText}
                          onChange={event => setReplyText(event.target.value)}
                          placeholder="写下你的建议..."
                          className="h-9 min-w-0 flex-1 rounded-md border border-border bg-bg-elevated px-3 text-xs outline-none transition focus:border-accent/50"
                        />
                        <button
                          type="button"
                          onClick={() => submitReply(p.id)}
                          disabled={!replyText.trim()}
                          className="h-9 rounded-md bg-accent px-3 text-2xs font-semibold text-white transition hover:opacity-90 disabled:opacity-35"
                        >
                          回复
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingPostId(null);
                            setReplyText('');
                          }}
                          className="h-9 px-2 text-2xs text-text-muted hover:text-text"
                        >
                          取消
                        </button>
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center gap-5 text-2xs text-text-muted">
                      <button className="inline-flex items-center gap-1.5 hover:text-rose-400">
                        <Heart size={12} /> <span className="num">{p.likes}</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 hover:text-text">
                        <MessageCircle size={12} /> <span className="num">{p.comments}</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 hover:text-warning">
                        <Star size={12} /> <span className="num">{p.stars}</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 hover:text-accent-glow">
                        <Share2 size={12} /> <span className="num">{p.shares}</span>
                      </button>
                      {p.type === 'help' && replyingPostId !== p.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingPostId(p.id);
                            setReplyText('');
                          }}
                          className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800"
                        >
                          <MessageSquare size={12} />
                          提供建议
                        </button>
                      ) : null}
                      {p.type === 'help' && p.status === 'open' ? (
                        <button
                          type="button"
                          onClick={() => markSolved(p.id)}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-text-muted transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <CheckCircle2 size={12} />
                          标记已解决
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {p.type !== 'help' ? (
                    <button className="text-2xs px-3 py-1 rounded-full border border-border hover:border-accent/50 hover:bg-accent/10 text-text-muted hover:text-accent-glow transition">
                      关注
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Profile */}
          <div className="card p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-accent2/15 pointer-events-none" />
            <div className="relative flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-base font-semibold">
                J
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">Jun</div>
                <div className="text-2xs text-text-muted">No personal bio</div>
              </div>
              <button className="p-1.5 rounded text-text-muted hover:text-text hover:bg-white/5">
                <Share2 size={13} />
              </button>
            </div>
            <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat n={0} l="关注" />
              <Stat n={0} l="粉丝" />
              <Stat n={0} l="获赞" />
            </div>
          </div>

          {/* My */}
          <div className="card divide-y divide-border">
            {[
              { label: '我的发布', count: 0 },
              { label: '我的点赞', count: 3 },
              { label: '我的评论', count: 3 },
              { label: '我的收藏', count: 2 },
            ].map(i => (
              <div key={i.label} className="px-5 py-3 flex items-center justify-between text-sm hover:bg-white/[0.02] cursor-pointer">
                <span>{i.label}</span>
                <span className="text-text-muted num">{i.count}</span>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-medium mb-3">快捷入口</h3>
            <div className="space-y-2">
              {[
                { label: '发起社区求助', href: '/home/community?tab=help&compose=1' },
                { label: '发布 Professional Profile', href: '/onboarding' },
                { label: '浏览免费插件', href: '/marketplace' },
                { label: '打开官方 Forum', href: 'https://forum.aqara.com' },
              ].map(item => (
                <a key={item.label} href={item.href} target={item.href.startsWith('https://') ? '_blank' : undefined} rel={item.href.startsWith('https://') ? 'noreferrer' : undefined} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-2xs text-text-muted hover:text-text hover:border-border-strong transition">
                  {item.label}
                  <ExternalLink size={10} />
                </a>
              ))}
            </div>
          </div>

          {/* Hot Topics */}
          <div className="card p-5">
            <h3 className="text-sm font-medium mb-3 inline-flex items-center gap-1.5">
              <Flame size={13} className="text-rose-400" /> 热门话题
            </h3>
            <div className="space-y-2">
              {HOT_TOPICS.map(t => (
                <div key={t.rank} className="flex items-center gap-3">
                  <span className={cn('num text-sm w-4', t.rank <= 3 ? 'text-rose-400' : 'text-text-muted')}>
                    {t.rank}
                  </span>
                  <span className="text-sm flex-1">#{t.name}</span>
                  <span className="text-2xs text-text-muted inline-flex items-center gap-1">
                    <Flame size={9} className="text-rose-400" /> {t.heat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div>
      <div className="text-lg font-semibold num">{n}</div>
      <div className="text-2xs text-text-muted">{l}</div>
    </div>
  );
}
