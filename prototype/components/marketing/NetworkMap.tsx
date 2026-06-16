'use client';

import { motion } from 'framer-motion';
import { LighthouseCountries, GlobalStats } from '@/lib/mock/stats';
import { formatNumber } from '@/lib/utils';

export function NetworkMap() {
  return (
    <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-border bg-bg-elevated/40">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      {/* 简化世界轮廓 - SVG */}
      <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <radialGradient id="globe-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(99,102,241,0.15)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="25" rx="45" ry="22" fill="url(#globe-glow)" />
        {/* 大陆 ascii 化简 */}
        <path
          d="M 8 18 L 22 14 L 28 22 L 22 30 L 14 30 L 8 22 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.2"
        />
        <path
          d="M 30 16 L 36 12 L 44 14 L 50 18 L 48 28 L 38 28 L 30 22 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.2"
        />
        <path
          d="M 52 14 L 65 12 L 78 14 L 86 18 L 90 24 L 80 28 L 65 26 L 55 22 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.2"
        />
        <path
          d="M 22 32 L 28 34 L 30 40 L 24 44 L 18 40 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.2"
        />
      </svg>

      {/* 节点 */}
      {LighthouseCountries.map((c, i) => (
        <motion.div
          key={c.code}
          initial={{ scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
          className="absolute"
          style={{ left: `${c.coords.x}%`, top: `${c.coords.y}%` }}
        >
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            {c.status === 'live' && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: c.color, opacity: 0.4 }}
              />
            )}
            <div
              className="relative w-3 h-3 rounded-full ring-2 ring-bg shadow-lg"
              style={{
                backgroundColor: c.color,
                boxShadow: c.status === 'live' ? `0 0 16px ${c.color}` : 'none',
              }}
            />
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap">
              <div className="text-2xs font-medium flex items-center gap-1">
                <span>{c.flag}</span>
                <span className={c.status === 'planned' ? 'text-text-subtle' : 'text-text'}>
                  {c.name}
                </span>
              </div>
              {c.status !== 'planned' && (
                <div className="text-2xs text-text-muted num mt-0.5">
                  {formatNumber(c.acbs)} ACBs · {formatNumber(c.studios)} Studios
                </div>
              )}
              {c.status === 'pilot' && (
                <div className="text-2xs text-success mt-0.5">● Operator-Store 试点</div>
              )}
              {c.status === 'planned' && (
                <div className="text-2xs text-text-subtle mt-0.5">Phase 2 候选</div>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* 数字面板 */}
      <div className="absolute top-6 left-6 right-6 grid grid-cols-3 gap-4">
        <StatPill label="ACBs Worldwide" value={formatNumber(GlobalStats.acbs)} />
        <StatPill label="Studios Deployed" value={formatNumber(GlobalStats.studios)} />
        <StatPill label="Personas Configured" value={formatNumber(GlobalStats.personas)} />
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-lg px-3 py-2">
      <div className="text-2xs text-text-muted">{label}</div>
      <div className="num text-base font-semibold text-text">{value}</div>
    </div>
  );
}
