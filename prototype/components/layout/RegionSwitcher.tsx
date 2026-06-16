'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── 数据中心模型 ──────────────────────────────────────────────────────────────
// 真正的数据隔离边界是 DC（6 个）；国家/地区只是 UI 标签。
// 同 DC 多国之间切换 = 纯 UI filter，不重载数据。
// 跨 DC 切换 = 真切换，重新加载该 DC 的工作区/Studio 数据。
// ─────────────────────────────────────────────────────────────────────────────

export type DcId = 'cn' | 'us' | 'eu' | 'sg' | 'kr' | 'ru';

export interface DcEntry {
  id: DcId;
  primaryFlag: string;        // 代表国旗（用于切换器主标签）
  primaryLabel: string;       // 代表标签（如"欧洲"）
  dcLabel: string;            // DC 副标签（如"EU 数据中心"）
  servedCountries: string[];  // 已服务国家旗帜（仅"我有数据的地区"显示）
  studioCount: number;        // 0 = 暂无数据
}

export const DCS: DcEntry[] = [
  { id: 'cn', primaryFlag: '🇨🇳', primaryLabel: '中国大陆', dcLabel: '中国服务器', servedCountries: ['🇨🇳'], studioCount: 12 },
  { id: 'eu', primaryFlag: '🇪🇺', primaryLabel: '欧洲',    dcLabel: '欧洲服务器', servedCountries: ['🇩🇪', '🇫🇷', '🇮🇹'], studioCount: 8 },
  { id: 'sg', primaryFlag: '🇸🇬', primaryLabel: '东南亚',  dcLabel: '新加坡服务器', servedCountries: ['🇸🇬', '🇹🇭'], studioCount: 3 },
  { id: 'us', primaryFlag: '🇺🇸', primaryLabel: '美洲',    dcLabel: '美国服务器', servedCountries: [], studioCount: 0 },
  { id: 'kr', primaryFlag: '🇰🇷', primaryLabel: '韩国/日本', dcLabel: '韩国服务器', servedCountries: [], studioCount: 0 },
  { id: 'ru', primaryFlag: '🇷🇺', primaryLabel: '俄罗斯',  dcLabel: '俄罗斯服务器', servedCountries: [], studioCount: 0 },
];

// ─── 内存中的当前 DC（原型用） ───────────────────────────────────────────────
let _currentDc: DcId = 'cn';
const _listeners = new Set<(dc: DcId) => void>();

export function getCurrentDc(): DcId { return _currentDc; }
export function setCurrentDc(dc: DcId) {
  if (dc === _currentDc) return;
  _currentDc = dc;
  _listeners.forEach(fn => fn(dc));
}

export function useCurrentDc(): DcId {
  const [dc, setDc] = useState(_currentDc);
  useEffect(() => {
    const fn = (next: DcId) => setDc(next);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);
  return dc;
}

// ─── 组件 ─────────────────────────────────────────────────────────────────────

export function RegionSwitcher({ compact = false }: { compact?: boolean }) {
  const dc = useCurrentDc();
  const current = DCS.find(d => d.id === dc) ?? DCS[0];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const owned = DCS.filter(d => d.studioCount > 0);
  const others = DCS.filter(d => d.studioCount === 0);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border transition',
          open
            ? 'border-accent/40 bg-accent/10 text-text'
            : 'border-border hover:border-border-strong text-text-muted hover:text-text',
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs'
        )}
        title="切换工作地区（数据中心）"
      >
        <Globe2 size={13} className={cn('shrink-0', open && 'text-accent')}/>
        <span className="text-sm leading-none shrink-0">{current.primaryFlag}</span>
        <span className="hidden md:inline font-medium leading-none">{current.primaryLabel}</span>
        {!compact && (
          <span className="hidden lg:inline text-2xs text-text-subtle leading-none">· {current.dcLabel}</span>
        )}
        <ChevronDown size={12} className={cn('shrink-0 transition-transform', open && 'rotate-180')}/>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-[320px] rounded-lg border border-border bg-bg-elevated shadow-2xl shadow-slate-300/50 dark:shadow-black/40 z-50 overflow-hidden">
          {/* 头部说明 */}
          <div className="px-3.5 py-2.5 border-b border-border bg-bg-subtle">
            <div className="text-2xs text-text-subtle leading-snug">
              切换工作地区会切换所看的<span className="text-text-muted font-medium">数据中心</span>。
              同 DC 内多国 Studio 在列表内可二次筛选。
            </div>
          </div>

          {/* 我有数据的地区 */}
          {owned.length > 0 && (
            <>
              <div className="px-3.5 py-1.5 text-[10px] uppercase tracking-wider text-text-subtle">
                我有数据的地区
              </div>
              {owned.map(d => {
                const active = d.id === dc;
                return (
                  <button
                    key={d.id}
                    onClick={() => { setCurrentDc(d.id); setOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition',
                      active ? 'bg-accent/10' : 'hover:bg-bg-subtle'
                    )}
                  >
                    <span className="text-lg shrink-0">{d.primaryFlag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-medium truncate', active ? 'text-text' : 'text-text')}>
                          {d.primaryLabel}
                        </span>
                        <span className="text-2xs text-text-subtle shrink-0">{d.dcLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-2xs num text-text-muted">{d.studioCount} Studios</span>
                        {d.servedCountries.length > 1 && (
                          <>
                            <span className="text-text-subtle">·</span>
                            <span className="text-xs leading-none">
                              {d.servedCountries.join(' ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {active && <Check size={13} className="text-accent shrink-0"/>}
                  </button>
                );
              })}
            </>
          )}

          {/* 其他可访问地区 */}
          {others.length > 0 && (
            <>
              <div className="px-3.5 py-1.5 mt-1 text-[10px] uppercase tracking-wider text-text-subtle border-t border-border">
                其他可访问地区
              </div>
              {others.map(d => (
                <button
                  key={d.id}
                  onClick={() => { setCurrentDc(d.id); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-bg-subtle transition opacity-60 hover:opacity-100"
                >
                  <span className="text-base shrink-0">{d.primaryFlag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium truncate">{d.primaryLabel}</span>
                      <span className="text-2xs text-text-subtle shrink-0">{d.dcLabel}</span>
                    </div>
                    <div className="text-[10px] text-text-subtle mt-0.5">暂无数据</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* 底部 */}
          <div className="px-3.5 py-2 border-t border-border bg-bg-subtle text-[10px] text-text-subtle leading-relaxed">
            Aqara 共 6 个 DC，服务 200+ 国家。
            开发者请到 <span className="text-text-muted">Developer Portal</span> 用 Server 标签切换。
          </div>
        </div>
      )}
    </div>
  );
}
