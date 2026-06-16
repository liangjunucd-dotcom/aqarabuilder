'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, User as UserIcon } from 'lucide-react';
import { AqaraLogo } from '@/components/brand/AqaraLogo';
import { setRole, type Role } from '@/lib/role';
import { cn } from '@/lib/utils';

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirect(searchParams?.get('redirect') ?? null);
  const [step, setStep] = useState<'account' | 'code' | 'password'>('account');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [code, setCode] = useState('');

  const handleContinue = () => {
    if (!account || !agreed) return;
    setStep('code');
  };

  const handlePasswordSignIn = () => {
    if (!account || !agreed) return;
    setStep('password');
  };

  const handleGoogleSignIn = () => {
    if (!agreed) return;
    finishSignIn();
  };

  const finishSignIn = () => {
    const nextRole: Role = redirect.startsWith('/pro') ? 'pro' : 'builder';
    setRole(nextRole);
    router.push(withWelcome(redirect, nextRole));
  };

  return (
    <div className="min-h-screen bg-[#17181f] text-white">
      <header className="flex h-12 items-center border-b border-white/10 px-4">
        <Link href="/" className="flex items-center gap-2 text-white">
          <AqaraLogo size={23} />
          <span className="rounded-[4px] border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/70">Beta</span>
        </Link>
      </header>

      <main className="flex min-h-[calc(100vh-48px)] justify-center px-6 pt-[10vh]">
        <section className="w-full max-w-[430px]">
          <AnimatePresence mode="wait">
            {step === 'account' ? (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <h1 className="text-center text-2xl font-semibold tracking-tight text-white">Sign in to Aqara Builder</h1>

                <div className="mt-12 space-y-5">
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        value={account}
                        onChange={e => setAccount(e.target.value)}
                        placeholder="Enter your Aqara account"
                        className="h-12 w-full rounded-[6px] border border-white/20 bg-transparent px-4 text-sm font-medium text-white outline-none transition placeholder:text-white/40 focus:border-[#2f6dff] focus:ring-4 focus:ring-[#2f6dff]/10"
                        autoFocus
                      />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#2f6dff]"
                    />
                    <span className="text-xs leading-relaxed text-white/50">
                      I agree to the{' '}
                      <a className="font-semibold text-[#2f6dff] hover:underline" href="#">Terms of Service</a> and{' '}
                      <a className="font-semibold text-[#2f6dff] hover:underline" href="#">Privacy Policy</a>.
                    </span>
                  </label>

                  <button
                    onClick={handleContinue}
                    disabled={!account || !agreed}
                    className={cn(
                      'mt-6 inline-flex h-12 w-full items-center justify-center rounded-[6px] text-sm font-semibold transition',
                      account && agreed
                        ? 'bg-[#2558d8] text-white hover:bg-[#2f6dff]'
                        : 'cursor-not-allowed bg-[#244aa8] text-white/40'
                    )}
                  >
                    Continue
                  </button>

                  <div className="flex items-center gap-8 py-7 text-xs font-semibold text-white/40">
                    <span className="h-px flex-1 bg-white/10" />
                    OR
                    <span className="h-px flex-1 bg-white/10" />
                  </div>

                  <button
                    type="button"
                    onClick={handlePasswordSignIn}
                    disabled={!account || !agreed}
                    className={cn(
                      'flex h-12 w-full items-center justify-center gap-3 rounded-[6px] border text-sm font-semibold transition',
                      account && agreed
                        ? 'border-white/20 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'
                        : 'cursor-not-allowed border-white/10 text-white/30'
                    )}
                  >
                    <UserIcon size={15} />
                    Sign in with password
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={!agreed}
                    className={cn(
                      'flex h-12 w-full items-center justify-center gap-3 rounded-[6px] border text-sm font-semibold transition',
                      agreed
                        ? 'border-white/20 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white'
                        : 'cursor-not-allowed border-white/10 text-white/30'
                    )}
                  >
                    <span className="text-base font-bold text-[#4285f4]">G</span>
                    Sign in with Google
                  </button>

                  <div className="pt-8 text-center text-xs text-white/40">
                    Don&apos;t have an account?{' '}
                    <Link href="/signin?mode=signup" className="font-semibold text-white hover:underline">
                      Sign up
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : step === 'code' ? (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <h1 className="text-center text-2xl font-semibold tracking-tight text-white">Enter verification code</h1>
                <p className="mt-3 text-center text-sm leading-6 text-white/50">
                  Sent to <span className="font-semibold text-white">{account}</span>
                </p>

                <div className="mt-8">
                  <div className="mb-6 flex justify-center gap-1.5 sm:gap-2">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <input
                        key={i}
                        maxLength={1}
                        value={code[i] ?? ''}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '');
                          const arr = code.split('');
                          arr[i] = v;
                          setCode(arr.join(''));
                          if (v && i < 5) {
                            const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                            next?.focus();
                          }
                        }}
                        className="h-14 min-w-0 flex-1 rounded-[6px] border border-white/20 bg-transparent text-center text-xl font-semibold text-white outline-none transition focus:border-[#2f6dff] focus:ring-4 focus:ring-[#2f6dff]/10 sm:h-16 sm:max-w-14 sm:text-2xl"
                      />
                    ))}
                  </div>

                  <div className="mb-6 rounded-[6px] border border-white/10 px-4 py-3 text-center text-xs text-white/50">
                    Didn&apos;t receive it? <button className="font-semibold text-[#2f6dff] hover:underline">Resend in 60s</button>
                  </div>

                  <button
                    onClick={finishSignIn}
                    disabled={code.length !== 6}
                    className={cn(
                      'inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-[6px] text-sm font-semibold transition',
                      code.length === 6
                        ? 'bg-[#2558d8] text-white hover:bg-[#2f6dff]'
                        : 'cursor-not-allowed bg-[#244aa8] text-white/40'
                    )}
                  >
                    Sign in <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => setStep('account')}
                    className="mt-4 w-full text-xs font-semibold text-white/50 hover:text-white"
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <h1 className="text-center text-2xl font-semibold tracking-tight text-white">Sign in with password</h1>
                <p className="mt-3 text-center text-sm leading-6 text-white/50">
                  Aqara account <span className="font-semibold text-white">{account}</span>
                </p>

                <div className="mt-8 space-y-5">
                  <div>
                    <div className="relative">
                      <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className="h-12 w-full rounded-[6px] border border-white/20 bg-transparent pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-white/40 focus:border-[#2f6dff] focus:ring-4 focus:ring-[#2f6dff]/10"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    onClick={finishSignIn}
                    disabled={password.length < 4}
                    className={cn(
                      'inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-[6px] text-sm font-semibold transition',
                      password.length >= 4
                        ? 'bg-[#2558d8] text-white hover:bg-[#2f6dff]'
                        : 'cursor-not-allowed bg-[#244aa8] text-white/40'
                    )}
                  >
                    Sign in <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => setStep('account')}
                    className="w-full text-xs font-semibold text-white/50 hover:text-white"
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function safeRedirect(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/home';
  return value;
}

function withWelcome(path: string, role: Role) {
  const [pathnameAndSearch, hash = ''] = path.split('#');
  const [pathname, search = ''] = pathnameAndSearch.split('?');
  const params = new URLSearchParams(search);
  params.set('welcome', '1');
  if (pathname.startsWith('/pro')) params.set('demo_as', role === 'verified' ? 'verified' : 'pro');
  return `${pathname}${params.toString() ? `?${params.toString()}` : ''}${hash ? `#${hash}` : ''}`;
}
