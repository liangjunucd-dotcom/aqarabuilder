'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const PREFETCH_TARGETS = [
  '/signin',
  '/signin?redirect=%2Fhome',
  '/signin?redirect=%2Fpro',
];

function findNavigableAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest('a[href]') as HTMLAnchorElement | null;
}

function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function shouldTrackNavigation(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  const next = new URL(anchor.href, window.location.href);
  if (next.origin !== window.location.origin) return false;
  if (next.href === window.location.href) return false;
  return true;
}

export function RouteProgress() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const settleRef = useRef<number | null>(null);

  useEffect(() => {
    const prefetch = () => {
      PREFETCH_TARGETS.forEach(target => {
        try {
          router.prefetch(target);
        } catch {
          // Prefetch is best-effort only.
        }
      });
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(prefetch, { timeout: 1800 });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const id = window.setTimeout(prefetch, 300);
    return () => window.clearTimeout(id);
  }, [router]);

  useEffect(() => {
    if (!pending) return;
    if (settleRef.current) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => setPending(false), 260);
    return () => {
      if (settleRef.current) window.clearTimeout(settleRef.current);
    };
  }, [pathname, pending]);

  useEffect(() => {
    const start = () => {
      setPending(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setPending(false), 8000);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !isPlainLeftClick(event)) return;
      const anchor = findNavigableAnchor(event.target);
      if (!anchor || !shouldTrackNavigation(anchor)) return;
      const sourceHref = window.location.href;
      const targetHref = anchor.href;
      start();

      window.setTimeout(() => {
        if (event.defaultPrevented) return;
        if (window.location.href !== sourceHref) return;
        window.location.assign(targetHref);
      }, 650);
    };

    const onPageShow = () => setPending(false);

    document.addEventListener('click', onClick, true);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('popstate', onPageShow);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('popstate', onPageShow);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (settleRef.current) window.clearTimeout(settleRef.current);
    };
  }, []);

  if (!pending) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999]">
      <div className="h-0.5 w-full overflow-hidden bg-transparent">
        <div className="h-full w-1/2 animate-[route-progress_1.05s_ease-in-out_infinite] rounded-r-full bg-[#0f6bff] shadow-[0_0_16px_rgba(15,107,255,0.5)]" />
      </div>
      <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#0f6bff]" />
        打开中...
      </div>
      <style jsx global>{`
        @keyframes route-progress {
          0% {
            transform: translateX(-100%);
          }
          55% {
            transform: translateX(120%);
          }
          100% {
            transform: translateX(220%);
          }
        }
      `}</style>
    </div>
  );
}
