'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleUserRound,
  Compass,
  FileUp,
  Home,
  Mail,
  Phone,
  Search,
  Sparkles,
  UserPlus,
  Users,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react';
import { AqaraLogo } from '@/components/brand/AqaraLogo';
import { getPlanBenefits, type PlanId } from '@/lib/plans';
import { setRole } from '@/lib/role';
import { cn } from '@/lib/utils';
import { getWorkspace, getWorkspaceHomeHref, saveOnboardingTeamWorkspace, setActiveWorkspace } from '@/lib/workspaces';

type EntryMode = 'team' | 'personal';
type WorkScenario = 'team_create' | 'team_join';
type JoinSearchStatus = 'idle' | 'found' | 'not_found' | 'submitted';
type OnboardingTeamPlan = 'business' | 'enterprise';
type SignupReason = 'client_projects' | 'personal_projects';
type FeatureInterest =
  | 'project_management'
  | 'project_planning'
  | 'design_tools'
  | 'client_leads'
  | 'quotes'
  | 'service_plans'
  | 'team_collaboration'
  | 'remote_service';
type ProfessionalDescriptor = 'installer' | 'designer' | 'system_integrator' | 'developer' | 'property_owner' | 'other';
type ProfessionalCategory =
  | 'smart_home'
  | 'lighting'
  | 'security'
  | 'hvac'
  | 'interior_design'
  | 'electrical'
  | 'property_management'
  | 'software_integration';
type ProjectType = 'my_home' | 'residential_buildings' | 'something_else';
type CompletionMode = 'hire_professional' | 'do_it_myself';
type Source =
  | 'friend_colleague'
  | 'social_media'
  | 'search_engines'
  | 'ai'
  | 'youtube'
  | 'review_site'
  | 'trade_show_event'
  | 'email'
  | 'tv_streaming'
  | 'other';
type HelpChoice = 'yes' | 'no';

type StepKey = 'welcome' | 'work_context' | 'reason' | 'project' | 'source' | 'help' | 'start';
type Choice<T extends string> = {
  id: T;
  icon: LucideIcon;
  title: string;
  desc: string;
  helper?: string;
};

type SourceChoice = {
  id: Source;
  title: string;
};

type FeatureInterestChoice = {
  id: FeatureInterest;
  title: string;
};

type ProfessionalCategoryChoice = {
  id: ProfessionalCategory;
  title: string;
};

const ENTRY_MODES: Choice<EntryMode>[] = [
  {
    id: 'team',
    icon: Users,
    title: '企业/团队',
    desc: '设计工作室、安装团队、项目交付团队或服务商门店成员',
  },
  {
    id: 'personal',
    icon: CircleUserRound,
    title: '个人使用',
    desc: '个人设计师、个人安装商、开发者或自己的项目',
  },
] as const;

const TEAM_SCENARIOS: Choice<WorkScenario>[] = [
  {
    id: 'team_create',
    icon: Building2,
    title: '创建团队工作区',
    desc: '用于设计工作室、安装团队、项目协作团队或普通公司团队',
  },
  {
    id: 'team_join',
    icon: UserPlus,
    title: '加入已有团队',
    desc: '企业、团队或服务商门店已经在使用，我要加入',
  },
] as const;

const SIGNUP_REASONS: Choice<SignupReason>[] = [
  {
    id: 'client_projects',
    icon: BriefcaseBusiness,
    title: '客户项目',
    desc: '为客户做设计、报价、交付、远程服务或持续服务',
  },
  {
    id: 'personal_projects',
    icon: Home,
    title: '个人项目',
    desc: '为自己的家、样板间、作品集或学习项目使用',
  },
] as const;

const FEATURE_INTERESTS: FeatureInterestChoice[] = [
  { id: 'project_management', title: '项目管理' },
  { id: 'project_planning', title: '项目规划' },
  { id: 'design_tools', title: '设计工具' },
  { id: 'client_leads', title: '客户线索' },
  { id: 'quotes', title: '报价与提案' },
  { id: 'service_plans', title: '服务计划' },
  { id: 'team_collaboration', title: '团队协作' },
  { id: 'remote_service', title: '远程服务' },
] as const;

const PROFESSIONAL_DESCRIPTORS: Choice<ProfessionalDescriptor>[] = [
  { id: 'installer', icon: WandSparkles, title: '安装商', desc: '负责安装、调试、交付或售后服务' },
  { id: 'designer', icon: Compass, title: '设计师', desc: '负责方案设计、空间规划或客户提案' },
  { id: 'system_integrator', icon: BriefcaseBusiness, title: '集成商', desc: '负责系统集成、项目实施或多工种协作' },
  { id: 'developer', icon: Sparkles, title: '开发者', desc: '负责插件、自动化、API 或系统连接' },
  { id: 'property_owner', icon: Home, title: '业主 / 物业方', desc: '为自己的空间、样板间或物业项目使用' },
  { id: 'other', icon: CircleUserRound, title: '其他专业身份', desc: '暂时无法归类，后续再完善' },
] as const;

const PROFESSIONAL_CATEGORIES: ProfessionalCategoryChoice[] = [
  { id: 'smart_home', title: '智能家居' },
  { id: 'lighting', title: '照明与场景' },
  { id: 'security', title: '安防与门锁' },
  { id: 'hvac', title: '暖通 / 空调' },
  { id: 'interior_design', title: '室内设计' },
  { id: 'electrical', title: '电气施工' },
  { id: 'property_management', title: '物业 / 地产' },
  { id: 'software_integration', title: '软件与系统集成' },
] as const;

const PROJECT_TYPES: Choice<ProjectType>[] = [
  {
    id: 'my_home',
    icon: Home,
    title: '自己的家',
    desc: '我正在规划自己的家或个人空间',
  },
  {
    id: 'residential_buildings',
    icon: Building2,
    title: '住宅项目',
    desc: '住宅、样板间、公寓、别墅或多套房源',
  },
  {
    id: 'something_else',
    icon: Compass,
    title: '其他空间',
    desc: '商业空间、办公空间、门店或其他项目',
  },
] as const;

const COMPLETION_MODES: Choice<CompletionMode>[] = [
  {
    id: 'hire_professional',
    icon: BadgeCheck,
    title: '需要专业协助',
    desc: '需要专业人协助完成设计、安装或服务',
  },
  {
    id: 'do_it_myself',
    icon: WandSparkles,
    title: '先自行完成',
    desc: '先自己做，必要时再邀请专业人接手',
  },
] as const;

const SOURCES: SourceChoice[] = [
  { id: 'friend_colleague', title: '朋友或同事' },
  { id: 'social_media', title: '社交媒体' },
  { id: 'search_engines', title: '搜索引擎（如 Google）' },
  { id: 'ai', title: 'AI（如 ChatGPT）' },
  { id: 'youtube', title: 'YouTube' },
  { id: 'review_site', title: '评测网站' },
  { id: 'trade_show_event', title: '展会或活动' },
  { id: 'email', title: '邮件' },
  { id: 'tv_streaming', title: '电视 / 流媒体' },
  { id: 'other', title: '其他' },
] as const;

const HELP_CHOICES: Choice<HelpChoice>[] = [
  {
    id: 'yes',
    icon: CalendarClock,
    title: '需要协助',
    desc: '留下联系方式，安排 1 对 1 新人设置支持',
  },
  {
    id: 'no',
    icon: Sparkles,
    title: '暂不需要',
    desc: '我先自己完成设置，之后再联系支持',
  },
] as const;

const STEP_ORDER: StepKey[] = ['welcome', 'work_context', 'reason', 'project', 'source', 'help', 'start'];

function normalizeReturnPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <BuilderProOnboarding />
    </Suspense>
  );
}

export default OnboardingPage;

function BuilderProOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProfileConversion = searchParams?.get('intent') === 'professional_profile';
  const returnTo = normalizeReturnPath(searchParams?.get('from') ?? null, '/home/profile');
  const initialStepIndex = 0;
  const [stepIndex, setStepIndex] = useState(() => initialStepIndex);
  const [entryMode, setEntryMode] = useState<EntryMode | null>(null);
  const [workScenario, setWorkScenario] = useState<WorkScenario | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [teamPlan, setTeamPlan] = useState<OnboardingTeamPlan>('business');
  const [businessProof, setBusinessProof] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [website, setWebsite] = useState('');
  const [joinSearchStatus, setJoinSearchStatus] = useState<JoinSearchStatus>('idle');
  const [joinResultName, setJoinResultName] = useState('');
  const [joinReason, setJoinReason] = useState('');
  const [professionalDescriptor, setProfessionalDescriptor] = useState<ProfessionalDescriptor | null>(null);
  const [professionalCategory, setProfessionalCategory] = useState<ProfessionalCategory>('smart_home');
  const [signupReason, setSignupReason] = useState<SignupReason | null>(null);
  const [featureInterest, setFeatureInterest] = useState<FeatureInterest>('project_management');
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [completionMode, setCompletionMode] = useState<CompletionMode | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [helpChoice, setHelpChoice] = useState<HelpChoice | null>('no');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const currentStep = STEP_ORDER[stepIndex];
  const isTeamPath = entryMode === 'team';
  const isJoinScenario = workScenario === 'team_join';
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;

  const contextLabel = useMemo(() => {
    if (entryMode === 'team') return '团队工作区';
    return '个人专业身份';
  }, [entryMode]);

  const completionCopy = useMemo(() => {
    if (workScenario === 'team_join') {
      return {
        contextTitle: '企业/团队加入申请',
        contextValue: '待管理员审核',
        contextDescription: '审核通过后，团队工作区会出现在 My Workspaces。',
      };
    }
    if (workScenario === 'team_create') {
      return {
        contextTitle: organizationName.trim() || 'Team Workspace',
        contextValue: teamPlan === 'enterprise' ? 'Enterprise' : 'Business',
        contextDescription: '进入后将创建 Company、默认 Team Workspace 和 Owner Membership。',
      };
    }
    return {
      contextTitle: '',
      contextValue: '',
      contextDescription: '',
    };
  }, [organizationName, teamPlan, workScenario]);

  const canContinue = useMemo(() => {
    if (currentStep === 'welcome') return Boolean(entryMode);
    if (currentStep === 'work_context') {
      if (isTeamPath) {
        if (!workScenario) return false;
        if (workScenario === 'team_create') {
          return organizationName.trim().length > 1 && businessProof.trim().length > 1;
        }
        if (isJoinScenario) {
          if (joinSearchStatus === 'idle' || joinSearchStatus === 'not_found') return inviteCode.trim().length > 1;
          if (joinSearchStatus === 'found') return joinReason.trim().length > 1;
          return joinSearchStatus === 'submitted';
        }
        return false;
      }
      return Boolean(professionalDescriptor && professionalCategory);
    }
    if (currentStep === 'reason') return Boolean(signupReason && featureInterest);
    if (currentStep === 'project') return Boolean(projectType && completionMode);
    if (currentStep === 'source') return Boolean(source);
    if (currentStep === 'help') {
      if (helpChoice === 'yes') return phone.trim().length > 5 || email.trim().length > 5;
      return Boolean(helpChoice);
    }
    return true;
  }, [
    completionMode,
    currentStep,
    entryMode,
    helpChoice,
    inviteCode,
    isTeamPath,
    isJoinScenario,
    joinReason,
    joinSearchStatus,
    organizationName,
    businessProof,
    phone,
    email,
    featureInterest,
    professionalCategory,
    professionalDescriptor,
    projectType,
    signupReason,
    source,
    teamPlan,
    workScenario,
  ]);

  const nextLabel = useMemo(() => {
    if (currentStep === 'work_context' && isJoinScenario) {
      if (joinSearchStatus === 'idle' || joinSearchStatus === 'not_found') return '查找';
      if (joinSearchStatus === 'found') return '提交申请';
      if (joinSearchStatus === 'submitted') return '继续';
    }
    if (currentStep === 'start') return '进入 Builder Pro';
    return '下一步';
  }, [currentStep, isJoinScenario, isProfileConversion, joinSearchStatus]);

  const goNext = () => {
    if (!canContinue) return;
    if (currentStep === 'work_context' && isJoinScenario) {
      if (joinSearchStatus === 'idle' || joinSearchStatus === 'not_found') {
        searchJoinTarget();
        return;
      }
      if (joinSearchStatus === 'found') {
        setJoinSearchStatus('submitted');
        return;
      }
    }
    if (currentStep === 'start') {
      finishOnboarding();
      return;
    }
    setStepIndex((value) => Math.min(value + 1, STEP_ORDER.length - 1));
  };

  const goBack = () => {
    if (currentStep === 'work_context' && isJoinScenario && joinSearchStatus !== 'idle') {
      setJoinSearchStatus(joinSearchStatus === 'submitted' ? 'found' : 'idle');
      return;
    }
    if (stepIndex <= initialStepIndex) {
      router.push(returnTo);
      return;
    }
    setStepIndex((value) => Math.max(value - 1, 0));
  };

  const resetJoinSearch = () => {
    setJoinSearchStatus('idle');
    setJoinResultName('');
    setJoinReason('');
  };

  const searchJoinTarget = () => {
    const normalized = inviteCode.trim().toLowerCase();
    const notFound = normalized.includes('404') || normalized.includes('notfound') || normalized.includes('none');
    if (notFound) {
      setJoinResultName('');
      setJoinSearchStatus('not_found');
      return;
    }
    setJoinResultName(normalized.includes('aqara') ? 'Aqara Space Shanghai' : 'Jun Design Studio');
    setJoinSearchStatus('found');
  };

  const finishOnboarding = () => {
    const payload = {
      entryMode,
      workScenario,
      profile: {
        professionalDescriptor,
        professionalCategory,
      },
      organization: {
        name: organizationName.trim(),
        plan: teamPlan,
        proofOfBusiness: businessProof,
        inviteCode: inviteCode.trim(),
        website: website.trim(),
        joinSearchStatus,
        joinResultName,
        joinReason: joinReason.trim(),
        contextLabel,
      },
      signupReason,
      featureInterest,
      project: {
        projectType,
        completionMode,
      },
      source,
      help: {
        helpChoice,
        phone: phone.trim(),
        email: email.trim(),
      },
      intent: isProfileConversion ? 'professional_profile' : 'builder_pro',
      returnTo,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('aqara:builder-pro:onboarding', JSON.stringify(payload));
    }

    setRole('pro');
    let targetWorkspaceId = 'personal';
    let targetUrl = '/pro/personal/home?demo_as=pro&welcome=1';

    if (workScenario === 'team_create') {
      targetWorkspaceId = saveOnboardingTeamWorkspace({
        name: organizationName.trim(),
        plan: teamPlan,
      }) ?? 'design-studio';
      const targetWorkspace = getWorkspace(targetWorkspaceId);
      targetUrl = `${targetWorkspace ? getWorkspaceHomeHref(targetWorkspace) : '/pro'}?demo_as=pro&welcome=1`;
    }

    if (workScenario === 'team_join') {
      targetUrl = '/pro/personal/home?demo_as=pro&welcome=1&joinRequest=pending';
    }

    setActiveWorkspace(targetWorkspaceId);
    router.push(targetUrl);
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:grid lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.72fr)]">
        <section className="flex min-h-screen flex-col px-5 py-5 sm:px-9 lg:min-h-screen lg:px-14 lg:py-7">
          <header className="shrink-0">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="inline-flex items-center gap-2">
                <AqaraLogo className="h-8 w-auto" />
                <span className="text-sm font-semibold tracking-[0.24em] text-slate-400">BUILDER PRO</span>
              </Link>
            </div>
            <div className="mt-5 h-1.5 w-full max-w-xs rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-slate-950 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 text-xs font-medium text-slate-400">
              {stepIndex + 1}/{STEP_ORDER.length}
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col justify-center py-5 lg:py-6">
            {currentStep === 'welcome' && (
              <StepShell
                eyebrow="Builder Pro setup"
                title="欢迎来到 Builder Pro"
                desc="花 10 秒告诉我们，你这次来主要是为了什么。我们会据此为你准备好需要的功能。"
              >
                <ChoiceGrid compact>
                  {ENTRY_MODES.map((item) => (
                    <ChoiceCard
                      key={item.id}
                      item={item}
                      selected={entryMode === item.id}
                      onClick={() => {
                        setEntryMode(item.id);
                        setWorkScenario(null);
                        setOrganizationName('');
                        setInviteCode('');
                        setWebsite('');
                        setBusinessProof('');
                        resetJoinSearch();
                      }}
                    />
                  ))}
                </ChoiceGrid>
              </StepShell>
            )}

            {currentStep === 'work_context' && isTeamPath && (
              <StepShell
                eyebrow="Team setup"
                title="请选择企业/团队场景"
                desc="创建团队或加入已有团队。"
              >
                <ChoiceGrid compact>
                  {TEAM_SCENARIOS.map((item) => (
                    <ChoiceCard
                      key={item.id}
                      item={item}
                      selected={workScenario === item.id}
                      onClick={() => {
                        setWorkScenario(item.id);
                        setInviteCode('');
                        setOrganizationName('');
                        setWebsite('');
                        setBusinessProof('');
                        setTeamPlan('business');
                        resetJoinSearch();
                      }}
                    />
                  ))}
                </ChoiceGrid>
                {workScenario === 'team_create' && (
                  <TeamWorkspaceForm
                    organizationName={organizationName}
                    setOrganizationName={setOrganizationName}
                    teamPlan={teamPlan}
                    setTeamPlan={setTeamPlan}
                    website={website}
                    setWebsite={setWebsite}
                    businessProof={businessProof}
                    setBusinessProof={setBusinessProof}
                  />
                )}
                {workScenario === 'team_join' && (
                  <JoinOrganizationFlow
                    teamNumber={inviteCode}
                    setTeamNumber={(value) => {
                      setInviteCode(value);
                      resetJoinSearch();
                    }}
                    status={joinSearchStatus}
                    resultName={joinResultName}
                    reason={joinReason}
                    setReason={setJoinReason}
                  />
                )}
              </StepShell>
            )}

            {currentStep === 'work_context' && !isTeamPath && (
              <StepShell
                eyebrow="个人资料"
                title="先介绍一下你自己"
                desc="Introduce yourself and we will get you to the right tools or team."
              >
                <QuestionBlock title="Which best describes you?">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {PROFESSIONAL_DESCRIPTORS.map((item) => (
                      <SegmentPill key={item.id} selected={professionalDescriptor === item.id} onClick={() => setProfessionalDescriptor(item.id)}>
                        {item.title}
                      </SegmentPill>
                    ))}
                  </div>
                </QuestionBlock>
                <QuestionBlock title="你的主要专业类别">
                  <DownwardSelect
                    label="你的主要专业类别"
                    options={PROFESSIONAL_CATEGORIES}
                    value={professionalCategory}
                    onChange={setProfessionalCategory}
                  />
                </QuestionBlock>
              </StepShell>
            )}

            {currentStep === 'reason' && (
              <StepShell
                eyebrow="使用目的"
                title="先做一点 Builder Pro 设置"
                desc="我们越了解你这次来的原因，就越能帮你准备好合适的功能。"
              >
                <QuestionBlock title="你为什么要使用 Builder Pro？">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SIGNUP_REASONS.map((item) => (
                      <SegmentPill key={item.id} selected={signupReason === item.id} onClick={() => setSignupReason(item.id)}>
                        {item.title}
                      </SegmentPill>
                    ))}
                  </div>
                </QuestionBlock>
                <QuestionBlock title="你感兴趣的功能">
                  <DownwardSelect
                    label="你感兴趣的功能"
                    options={FEATURE_INTERESTS}
                    value={featureInterest}
                    onChange={setFeatureInterest}
                  />
                </QuestionBlock>
              </StepShell>
            )}

            {currentStep === 'project' && (
              <StepShell
                eyebrow="项目类型"
                title="你准备从哪类项目开始？"
                desc=""
              >
                <QuestionBlock title="项目类型">
                  <div className="grid gap-3">
                    {PROJECT_TYPES.map((item) => (
                      <ChoicePill key={item.id} item={item} selected={projectType === item.id} onClick={() => setProjectType(item.id)} />
                    ))}
                  </div>
                </QuestionBlock>
                <QuestionBlock title="完成方式">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {COMPLETION_MODES.map((item) => (
                      <ChoicePill key={item.id} item={item} selected={completionMode === item.id} onClick={() => setCompletionMode(item.id)} />
                    ))}
                  </div>
                </QuestionBlock>
              </StepShell>
            )}

            {currentStep === 'source' && (
              <StepShell
                eyebrow="来源"
                title="你是怎么了解到我们的？"
                desc="你的反馈可以帮助我们了解专业用户是如何发现 Builder Pro 的。"
              >
                <div className="flex flex-wrap gap-2.5">
                  {SOURCES.map((item) => (
                    <SourcePill key={item.id} item={item} selected={source === item.id} onClick={() => setSource(item.id)} />
                  ))}
                </div>
              </StepShell>
            )}

            {currentStep === 'help' && (
              <StepShell
                eyebrow="设置协助"
                title="是否需要协助完成首次设置？"
                desc=""
              >
                <ChoiceGrid compact>
                  {HELP_CHOICES.map((item) => (
                    <ChoiceCard key={item.id} item={item} selected={helpChoice === item.id} onClick={() => setHelpChoice(item.id)} />
                  ))}
                </ChoiceGrid>
                {helpChoice === 'yes' && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Field icon={Phone} label="手机号" value={phone} onChange={setPhone} placeholder="+86 187 **** 0066" />
                    <Field icon={Mail} label="邮箱" value={email} onChange={setEmail} placeholder="name@example.com" />
                  </div>
                )}
              </StepShell>
            )}

            {currentStep === 'start' && (
              <StepShell
                eyebrow="Ready"
                title="欢迎加入 Builder Pro"
                desc="你的专业身份与个人工作区已经完成初始化。"
              >
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {[
                      { label: 'Professional Profile', value: '已激活' },
                      { label: 'Personal Workspace', value: '已创建' },
                      { label: 'Current Plan', value: 'Professional Free' },
                    ].map((item, index) => (
                      <div
                        key={item.label}
                        className={cn(
                          'flex items-center justify-between gap-4 px-4 py-3.5',
                          index > 0 && 'border-t border-slate-100',
                        )}
                      >
                        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                          {item.value !== 'Professional Free' ? <Check size={14} /> : null}
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {completionCopy.contextTitle ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {workScenario === 'team_join' ? joinResultName || completionCopy.contextTitle : completionCopy.contextTitle}
                        </div>
                        <div className="text-xs font-semibold text-blue-700">{completionCopy.contextValue}</div>
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">{completionCopy.contextDescription}</div>
                    </div>
                  ) : null}

                  <div>
                    <div className="text-sm font-semibold text-slate-950">可立即使用</div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {['方案设计', '项目交付', '增值服务', '专业档案'].map(item => (
                        <div key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
                          <Check size={14} className="text-emerald-600" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-slate-500">
                    随着项目增长，可在 Plans &amp; Credits 中获得更多 Credits、团队协作与商业交付能力。
                  </p>
                </div>
              </StepShell>
            )}
          </div>

          <footer className="sticky bottom-0 -mx-5 border-t border-slate-200 bg-[#f6f7fb]/95 px-5 py-3 backdrop-blur sm:-mx-9 sm:px-9 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                <ChevronLeft size={18} /> 返回
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {nextLabel}
                {currentStep !== 'start' && <ArrowRight size={16} />}
              </button>
            </div>
          </footer>
        </section>

        <aside className="sticky top-0 hidden h-screen overflow-hidden bg-white lg:block">
          <img
            src="/images/builder-pro-onboarding-hero-install.png"
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white/85 to-transparent" />
        </aside>
      </div>
    </main>
  );
}

function StepShell({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-3xl">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">{eyebrow}</div>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-[34px]">{title}</h1>
      {desc ? <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">{desc}</p> : null}
      <div className={desc ? 'mt-6' : 'mt-7'}>{children}</div>
    </div>
  );
}

function ChoiceGrid({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return <div className={cn('grid gap-3', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>{children}</div>;
}

function ChoiceCard<T extends string>({
  item,
  selected,
  onClick,
}: {
  item: Choice<T>;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex min-h-30 flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition',
        selected ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-200 hover:border-slate-300 hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <item.icon size={20} />
        </div>
        <span className={cn('flex h-6 w-6 items-center justify-center rounded-full border', selected ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 text-transparent')}>
          <Check size={14} />
        </span>
      </div>
      <div className="mt-4 text-[15px] font-semibold text-slate-950">{item.title}</div>
      <div className="mt-1.5 text-sm leading-5 text-slate-500">{item.desc}</div>
      {item.helper && <div className="mt-2 text-xs leading-5 text-slate-400">{item.helper}</div>}
    </button>
  );
}

function ChoicePill<T extends string>({
  item,
  selected,
  onClick,
  align = 'center',
}: {
  item: Choice<T>;
  selected: boolean;
  onClick: () => void;
  align?: 'left' | 'center';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-14 items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition',
        align === 'center' ? 'justify-center text-center' : 'justify-start text-left',
        selected ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-200 hover:border-slate-300',
      )}
    >
      <item.icon size={17} className={cn(selected ? 'text-blue-600' : 'text-slate-400')} />
      <span className="min-w-0">
        <span className="block">{item.title}</span>
        {align === 'left' && <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{item.desc}</span>}
      </span>
    </button>
  );
}

function SegmentPill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-11 rounded-full border px-5 py-2.5 text-center text-sm font-semibold transition',
        selected
          ? 'border-slate-950 bg-slate-100 text-slate-950 shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
  );
}

function DownwardSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; title: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((item) => item.id === value) ?? options[0];

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-left text-sm font-medium text-slate-800 shadow-sm outline-none transition',
          open ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-200 hover:border-slate-300',
        )}
      >
        <span className="min-w-0 truncate">{selectedOption?.title}</span>
        <ChevronDown size={18} className={cn('shrink-0 text-slate-400 transition', open && 'rotate-180 text-slate-950')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <div role="listbox" aria-label={label}>
            {options.map((item) => {
              const selected = item.id === value;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                    selected ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <span className="min-w-0 truncate">{item.title}</span>
                  {selected && <Check size={15} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SourcePill({
  item,
  selected,
  onClick,
}: {
  item: SourceChoice;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition',
        selected
          ? 'border-slate-950 bg-slate-100 text-slate-950 shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      {item.title}
    </button>
  );
}

function QuestionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="mb-3 text-sm font-semibold text-slate-800">{title}</div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: LucideIcon;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-2 flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-slate-950">
        {Icon && <Icon size={16} className="text-slate-400" />}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  );
}

function TeamWorkspaceForm({
  organizationName,
  setOrganizationName,
  teamPlan,
  setTeamPlan,
  website,
  setWebsite,
  businessProof,
  setBusinessProof,
}: {
  organizationName: string;
  setOrganizationName: (value: string) => void;
  teamPlan: OnboardingTeamPlan;
  setTeamPlan: (value: OnboardingTeamPlan) => void;
  website: string;
  setWebsite: (value: string) => void;
  businessProof: string;
  setBusinessProof: (value: string) => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Building2 size={16} className="text-blue-600" />
            团队工作区
          </div>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
          Owner
        </div>
      </div>

      <div className="grid gap-3">
        <Field
          label="团队/企业名称"
          value={organizationName}
          onChange={setOrganizationName}
          placeholder="例如 Jun Design Studio"
        />
      </div>

      <div className="mt-4">
        <Field label="Website" value={website} onChange={setWebsite} placeholder="可选，例如 https://..." />
      </div>

      <div className="mt-4">
        <ProofOfBusinessUpload value={businessProof} onChange={setBusinessProof} />
      </div>

      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-slate-800">Workspace Plan</div>
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200">
          {(['business', 'enterprise'] as const).map((plan) => (
            <button
              key={plan}
              type="button"
              onClick={() => setTeamPlan(plan)}
              className={cn(
                'h-11 text-sm font-semibold transition',
                teamPlan === plan ? 'bg-slate-950 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {plan === 'business' ? 'Business' : 'Enterprise'}
            </button>
          ))}
        </div>
        <PlanBenefitStrip planId={teamPlan} />
      </div>
    </div>
  );
}

function ProofOfBusinessUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">
        Proof of Business <span className="text-rose-500">*</span>
      </span>
      <span className="mt-2 flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 shadow-sm transition hover:border-slate-400 hover:bg-white">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <FileUp size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-sm font-semibold', value ? 'text-slate-950' : 'text-slate-500')}>
            {value || '上传营业执照、工商证明或业务资质文件'}
          </span>
          <span className="mt-0.5 block text-xs text-slate-400">PDF, JPG, PNG</span>
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          Browse
        </span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={(event) => onChange(event.target.files?.[0]?.name ?? '')}
        />
      </span>
    </label>
  );
}

function PlanBenefitStrip({ planId }: { planId: PlanId }) {
  const benefits = getPlanBenefits(planId);

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      <PlanMiniFact label="Plan Credits" value={benefits.planCredits} />
      <PlanMiniFact label="Add-on" value={benefits.addOnCredits} />
      <PlanMiniFact
        label="Credit owner"
        value={benefits.creditOwner === 'organization' ? '组织池' : benefits.creditOwner === 'contract' ? '合同池' : '个人账号'}
      />
    </div>
  );
}

function PlanMiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <div className="mt-1 truncate text-xs font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function JoinOrganizationFlow({
  teamNumber,
  setTeamNumber,
  status,
  resultName,
  reason,
  setReason,
}: {
  teamNumber: string;
  setTeamNumber: (value: string) => void;
  status: JoinSearchStatus;
  resultName: string;
  reason: string;
  setReason: (value: string) => void;
}) {
  return (
    <div className="mt-5 max-w-xl">
      <Field
        label="Team Code"
        value={teamNumber}
        onChange={setTeamNumber}
        placeholder="输入企业、团队或服务商门店的 Team Code"
        icon={Search}
      />

      {status === 'found' && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
              <Building2 size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-950">{resultName}</div>
              <div className="mt-1 text-xs leading-5 text-emerald-700">提交后等待管理员审核。</div>
            </div>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-800">申请理由</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="例如 我是团队成员，需要协作处理客户项目"
              className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-emerald-400"
            />
          </label>
        </div>
      )}

      {status === 'not_found' && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          没有找到对应的企业/团队。请检查 Team Code。
        </div>
      )}

      {status === 'submitted' && (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
              <Check size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-950">申请已提交，待管理员审核</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
