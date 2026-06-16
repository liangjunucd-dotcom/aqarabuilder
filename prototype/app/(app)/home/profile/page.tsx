'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Camera,
  Check,
  Circle,
  Eye,
  Globe2,
  ImagePlus,
  Lock,
  Mail,
  MapPin,
  PenLine,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { UserTopBar } from '@/components/layout/UserTopBar';
import { isProBuilderRole, isVerifiedProRole, setRole as setDemoRole, useRole, type Role } from '@/lib/role';
import { cn } from '@/lib/utils';

const ACCOUNT_NAV = [
  'Account Info',
  'Profile Info',
  'Contact Info',
  'Password',
  'Social Media Settings',
  'Privacy Settings',
];

const PRO_TABS = ['Your Aqara', 'Projects', 'Ideabooks', 'Reviews', 'Questions', 'Activity', 'Messages'];
const PERSONAL_TABS = ['Ideabooks', 'Messages', 'Activity'];
const PROFESSIONAL_ONBOARDING_HREF = '/onboarding?intent=professional_profile&from=%2Fhome%2Fprofile';

type ChecklistItem = {
  label: string;
  done: boolean;
  premium?: boolean;
};

const PROFESSIONAL_CHECKLIST: ChecklistItem[] = [
  { label: 'Upload Profile Photo', done: true },
  { label: 'Add Business Description', done: false },
  { label: 'Create Your First Project', done: true },
  { label: 'Request Reviews', done: false },
  { label: 'Add Highlights', done: false, premium: true },
  { label: 'Add Highlight Video', done: false, premium: true },
];

const PERSONAL_CHECKLIST: ChecklistItem[] = [
  { label: 'Add Profile Photo', done: false },
  { label: 'Add About Me', done: false },
  { label: 'Create First Ideabook', done: true },
  { label: 'Save First Showcase', done: true },
];

function normalizeProfileRole(value: string | null): Role | null {
  if (value === 'user') return 'builder';
  if (value === 'anonymous' || value === 'builder' || value === 'pro' || value === 'verified') return value;
  return null;
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f8fb]" />}>
      <AccountSettingsContent />
    </Suspense>
  );
}

function AccountSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, mounted } = useRole();
  const [removeOpen, setRemoveOpen] = useState(false);
  const urlRole = normalizeProfileRole(searchParams?.get('demo_as') ?? null);
  const activeRole = urlRole ?? role;
  const hasResolvedRole = mounted || Boolean(urlRole);
  const isProfessional = hasResolvedRole && isProBuilderRole(activeRole);
  const isCertified = hasResolvedRole && isVerifiedProRole(activeRole);

  useEffect(() => {
    if (!isProfessional) {
      router.prefetch(PROFESSIONAL_ONBOARDING_HREF);
    }
  }, [isProfessional, router]);

  const checklist = isProfessional ? PROFESSIONAL_CHECKLIST : PERSONAL_CHECKLIST;
  const completed = checklist.filter(item => item.done).length;
  const progress = Math.round((completed / checklist.length) * 100);

  const profileName = isProfessional ? 'Jun Liang' : 'Jun';
  const profileSubtitle = isProfessional ? 'Spatial Designer · Certified Installer' : 'Community User';
  const publicHandle = '@jun';
  const previewProfileHref = isProfessional ? '/u/jun' : '/u/jun?profile=personal';
  const professionalBio = 'Aqara Builder 原型主 Builder · 全屋智能方案与 Studio 交付。专注虚实映射与 Builder Pro 交付闭环。';

  const fields = useMemo(() => {
    const base = [
      { label: 'User Name', value: 'webuser_645357367', readOnly: true },
      { label: 'Email', value: 'jun@example.com', hint: 'private', readOnly: true },
      { label: 'First name', value: 'Jun', hint: 'publicly displayed' },
      { label: 'Last name', value: 'Liang', hint: 'publicly displayed' },
    ];
    if (!isProfessional) {
      return [
        ...base,
        { label: 'About me', value: '喜欢空间智能、自动化和真实家庭场景。', multi: true },
        { label: 'Favorite style', value: '极简、亲子、科技感' },
        { label: 'Next home project', value: '把儿童房和客厅的照明体验做得更自然。', multi: true },
      ];
    }
    return [
      ...base,
      { label: 'Professional display name', value: 'Jun Liang' },
      { label: 'Business name', value: 'Jun Liang Studio' },
      { label: 'Business category', value: 'Spatial Design / Smart Home Delivery' },
      { label: 'Areas served', value: 'Shanghai, Suzhou, Hangzhou, Remote' },
      { label: 'Typical project cost', value: '¥30,000 - ¥180,000' },
      { label: 'Business description', value: professionalBio, multi: true },
    ];
  }, [isProfessional]);

  const removeProfessional = () => {
    setDemoRole('builder');
    setRemoveOpen(false);
    router.push('/home/profile?demo_as=builder');
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <UserTopBar title="Account Settings" />

      <main className="mx-auto max-w-7xl px-6 py-6">
        <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          <div className={cn('relative h-40 overflow-hidden rounded-t-[26px]', isProfessional ? 'bg-slate-900' : 'bg-white')}>
            {isProfessional ? (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.22),rgba(15,23,42,0.78)),radial-gradient(circle_at_70%_12%,rgba(59,130,246,0.36),transparent_26%)]" />
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:36px_36px]" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(37,99,235,0.12),transparent_32%),linear-gradient(180deg,#ffffff,#f8fafc)]" />
            )}
            <button className="absolute right-6 top-6 inline-flex h-10 items-center gap-2 rounded-md bg-white/90 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white">
              <PenLine size={14} />
              Done Editing
            </button>
          </div>

          <div className="relative px-7 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-28 w-28 rounded-md border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/80">
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-5xl font-semibold text-slate-400">
                    {isProfessional ? 'JL' : 'J'}
                  </div>
                  <button className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg">
                    <Camera size={15} />
                  </button>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{profileName}</h1>
                    {isProfessional ? <Badge label={isCertified ? 'Certified' : 'PRO'} /> : null}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">{profileSubtitle}</div>
                  <div className="mt-1 text-xs text-slate-500">{publicHandle} · {isProfessional ? 'Professional Profile' : 'Personal Profile'}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={previewProfileHref} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-950">
                  <Eye size={15} />
                  Preview Profile
                </Link>
                {isProfessional ? (
                  <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-950">
                    <Star size={15} />
                    Get Reviews
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex gap-7 overflow-x-auto border-t border-slate-100 pt-4">
              {(isProfessional ? PRO_TABS : PERSONAL_TABS).map((tab, index) => (
                <button
                  key={tab}
                  className={cn(
                    'h-9 whitespace-nowrap border-b-2 text-sm font-semibold transition',
                    index === 0 ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[160px_minmax(0,1fr)_360px]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-1 text-sm">
              <div className="mb-3 font-semibold text-slate-950">Account</div>
              {ACCOUNT_NAV.map((item, index) => (
                <button
                  key={item}
                  className={cn(
                    'block w-full rounded-lg px-3 py-2 text-left transition',
                    index === 0 ? 'bg-white font-semibold text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {isProfessional ? 'Account Info' : 'Account Information'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isProfessional ? 'Manage account and professional listing details.' : 'Manage your account and personal profile details.'}
                  </p>
                </div>
                {isProfessional ? (
                  <button
                    onClick={() => setRemoveOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-rose-300 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                    Remove Professional Profile
                  </button>
                ) : (
                  <Link
                    href={PROFESSIONAL_ONBOARDING_HREF}
                    prefetch
                    data-testid="convert-professional-main"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-950 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-950 hover:text-white"
                  >
                    <BriefcaseBusiness size={15} />
                    Convert to Professional Profile
                  </Link>
                )}
              </div>

              <div className="mt-7 space-y-4">
                {fields.map(field => (
                  <EditableField key={field.label} {...field} />
                ))}
              </div>

              <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-blue-700">
                  Update
                </button>
              </div>
            </section>

            {isProfessional ? (
              <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">Projects</h2>
                  <button className="rounded-md border border-slate-300 p-2 text-slate-600 transition hover:border-slate-950 hover:text-slate-950">
                    <PenLine size={15} />
                  </button>
                </div>
                <div className="mt-4 rounded-md bg-slate-100 px-4 py-4 text-sm text-slate-700">
                  Showcase your projects with floor plans, device placement and deployment records.
                  <Link href="/home/solutions" className="ml-3 font-semibold text-slate-950 underline underline-offset-4">Manage projects</Link>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-5">
            <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Lock size={15} className="text-slate-500" />
                {isProfessional ? 'Private Profile' : 'Personal Profile'}
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {isProfessional ? 'Only you can see this editing view.' : 'Your public page stays personal until you convert.'}
              </p>
              <Link href={previewProfileHref} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white transition hover:bg-blue-700">
                Preview Profile
              </Link>
            </section>

            <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
              <div className="text-sm font-semibold text-slate-950">Profile Checklist</div>
              <p className="mt-2 text-sm leading-5 text-slate-500">
                {isProfessional ? 'Complete these items to strengthen your professional presence.' : 'Complete these items to make your profile more useful.'}
              </p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span>{completed} of {checklist.length} Completed</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 space-y-4">
                {checklist.map(item => (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-slate-700">
                    {item.done ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check size={12} />
                      </span>
                    ) : (
                      <Circle size={20} className="text-slate-300" />
                    )}
                    <span className="min-w-0 flex-1">{item.label}</span>
                    {item.premium ? <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">PREMIUM</span> : null}
                  </div>
                ))}
              </div>
            </section>

            {isProfessional ? (
              <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">Let Clients Pay Online</div>
                    <div className="mt-2 text-sm text-slate-500">Not set</div>
                  </div>
                  <PenLine size={15} className="text-slate-500" />
                </div>
              </section>
            ) : (
              <section className="rounded-[22px] border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                  <Sparkles size={15} />
                  Professional Profile
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  转换后会新增服务资料、项目展示、评价和 Professional Profile 管理，不会删除你的个人内容。
                </p>
                <Link
                  href={PROFESSIONAL_ONBOARDING_HREF}
                  prefetch
                  data-testid="convert-professional-rail"
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Convert to Professional Profile
                </Link>
              </section>
            )}
          </aside>
        </section>
      </main>

      {removeOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <section className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl shadow-slate-950/30">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-semibold">Delete professional profile</h2>
              <button onClick={() => setRemoveOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-950">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5 text-sm leading-6 text-slate-600">
              <p>This will remove your professional listing on Aqara Builder.</p>
              <p>Your projects, ideabooks, assets and activities will not be removed, and will appear under your personal account.</p>
              <p>Are you sure?</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button onClick={() => setRemoveOpen(false)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-950">
                Cancel
              </button>
              <button onClick={removeProfessional} className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                Delete professional profile
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded border border-slate-300 px-2 text-xs font-semibold text-slate-700">
      {label}
    </span>
  );
}

function EditableField({
  label,
  value,
  hint,
  readOnly,
  multi,
}: {
  label: string;
  value: string;
  hint?: string;
  readOnly?: boolean;
  multi?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm text-slate-700">
        {label}
        {hint ? <span className="ml-1 text-xs text-slate-400">({hint})</span> : null}
      </div>
      <div className="flex gap-3">
        {multi ? (
          <textarea
            defaultValue={value}
            rows={3}
            className="min-h-24 flex-1 resize-none rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        ) : (
          <input
            defaultValue={value}
            readOnly={readOnly}
            className={cn(
              'h-10 flex-1 rounded-md border border-slate-300 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100',
              readOnly ? 'bg-slate-100 text-slate-500' : 'bg-white'
            )}
          />
        )}
        {readOnly ? (
          <button type="button" className="h-10 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-950">
            Edit
          </button>
        ) : null}
      </div>
    </label>
  );
}
