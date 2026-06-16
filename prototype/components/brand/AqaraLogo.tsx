import { cn } from '@/lib/utils';

export function AqaraLogo({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aq-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="0.5" stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#aq-grad)" />
        <path
          d="M9 22 L16 9 L23 22 M11.5 17.5 H20.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="font-semibold tracking-tight" style={{ fontSize: size * 0.66 }}>
        Aqara <span className="font-normal text-current opacity-60">Builder</span>
      </span>
    </div>
  );
}

export function AqaraMark({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`mk-${size}`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill={`url(#mk-${size})`} />
      <path
        d="M9 22 L16 9 L23 22 M11.5 17.5 H20.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
