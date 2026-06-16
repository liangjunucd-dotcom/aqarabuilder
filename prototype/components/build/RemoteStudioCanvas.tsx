'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** 构建 iframe 地址（hash 路由，不向外展示原始 URL） */
export function buildStudioIframeSrc(baseUrl: string, studioPage: string): string {
  const origin = baseUrl.replace(/\/$/, '');
  if (!origin) return '';
  const page = studioPage.replace(/^\//, '') || 'overview';
  return `${origin}/#/${page}`;
}

export function RemoteStudioCanvas({
  baseUrl,
  studioPage,
  loading,
  onLoaded,
}: {
  baseUrl: string;
  studioPage: string;
  loading?: boolean;
  onLoaded?: () => void;
}) {
  const [iframeReady, setIframeReady] = useState(false);
  const iframeSrc = buildStudioIframeSrc(baseUrl, studioPage);
  const showSpinner = (loading ?? false) || !iframeReady;

  useEffect(() => {
    setIframeReady(false);
  }, [iframeSrc]);

  return (
    <div className="h-full w-full flex flex-col min-h-0 bg-[#e8eaef]">
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {showSpinner && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#e8eaef]">
            <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-[#2d6cdf] animate-spin mb-3" />
            <div className="text-xs text-[#5c6578]">正在加载 Aqara Studio…</div>
          </div>
        )}
        {iframeSrc && (
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title="Aqara Studio"
            className={cn('absolute inset-0 w-full h-full border-0', showSpinner && 'opacity-0')}
            allow="autoplay; clipboard-write"
            onLoad={() => {
              setIframeReady(true);
              onLoaded?.();
            }}
          />
        )}
      </div>
    </div>
  );
}
