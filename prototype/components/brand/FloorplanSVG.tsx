import { cn } from '@/lib/utils';

type Pattern = 'top' | 'rooms' | 'cross' | 'L' | 'open' | 'two-floor';

interface Props {
  pattern: Pattern;
  className?: string;
  showDevices?: boolean;
  showPersona?: boolean;
}

/**
 * Stylized 户型 SVG. Inline shapes,无外部资源。
 * 用 currentColor 接收外层颜色,加 device dots 增加可信度。
 */
export function FloorplanSVG({ pattern, className, showDevices = true, showPersona = false }: Props) {
  return (
    <svg viewBox="0 0 200 140" className={cn('w-full h-full', className)} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wall-gradient" x1="0" y1="0" x2="200" y2="140">
          <stop stopColor="rgba(255,255,255,0.25)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.1)" />
        </linearGradient>
        <radialGradient id="persona-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(99,102,241,0.4)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0)" />
        </radialGradient>
        <pattern id="floor-dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="rgba(255,255,255,0.15)" />
        </pattern>
      </defs>

      {pattern === 'rooms' && (
        <g>
          {/* 外墙 */}
          <rect x="10" y="20" width="180" height="100" fill="url(#floor-dots)" stroke="url(#wall-gradient)" strokeWidth="1.5" rx="2" />
          {/* 内墙 */}
          <line x1="80" y1="20" x2="80" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="80" y1="70" x2="190" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="130" y1="70" x2="130" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          {/* 门(缺口) */}
          <line x1="80" y1="40" x2="80" y2="50" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
          <line x1="100" y1="70" x2="115" y2="70" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
          <line x1="130" y1="90" x2="130" y2="100" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
          {/* 房间标签 */}
          <text x="45" y="45" fill="rgba(255,255,255,0.6)" fontSize="6">主卧</text>
          <text x="135" y="45" fill="rgba(255,255,255,0.6)" fontSize="6">客厅</text>
          <text x="40" y="95" fill="rgba(255,255,255,0.6)" fontSize="6">老人房</text>
          <text x="100" y="95" fill="rgba(255,255,255,0.6)" fontSize="6">儿童</text>
          <text x="155" y="95" fill="rgba(255,255,255,0.6)" fontSize="6">厨房</text>
          {showDevices && (
            <g>
              {[
                [40, 30], [60, 60], [110, 30], [150, 50], [170, 30],
                [40, 80], [70, 110], [110, 110], [160, 110], [180, 100]
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.6" fill="#a855f7" opacity="0.8" />
              ))}
            </g>
          )}
          {showPersona && (
            <>
              <circle cx="50" cy="95" r="22" fill="url(#persona-glow)" />
              <circle cx="120" cy="40" r="20" fill="url(#persona-glow)" />
            </>
          )}
        </g>
      )}

      {pattern === 'open' && (
        <g>
          <rect x="10" y="20" width="180" height="100" fill="url(#floor-dots)" stroke="url(#wall-gradient)" strokeWidth="1.5" rx="2" />
          {/* 半墙 */}
          <line x1="120" y1="20" x2="120" y2="55" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <line x1="60" y1="80" x2="60" y2="120" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <text x="55" y="50" fill="rgba(255,255,255,0.6)" fontSize="6">开放客厅</text>
          <text x="140" y="40" fill="rgba(255,255,255,0.6)" fontSize="6">卧室</text>
          <text x="20" y="105" fill="rgba(255,255,255,0.6)" fontSize="6">厨</text>
          <text x="90" y="105" fill="rgba(255,255,255,0.6)" fontSize="6">书房</text>
          {showDevices && (
            <g>
              {[
                [40, 35], [80, 45], [100, 65], [60, 60], [150, 35],
                [165, 65], [30, 100], [70, 95], [100, 100], [140, 105]
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.6" fill="#06b6d4" opacity="0.8" />
              ))}
            </g>
          )}
        </g>
      )}

      {pattern === 'top' && (
        <g>
          <rect x="10" y="20" width="180" height="100" fill="url(#floor-dots)" stroke="url(#wall-gradient)" strokeWidth="1.5" rx="2" />
          <line x1="60" y1="20" x2="60" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="140" y1="20" x2="140" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="60" y1="70" x2="140" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x="25" y="45" fill="rgba(255,255,255,0.6)" fontSize="6">主卧</text>
          <text x="85" y="45" fill="rgba(255,255,255,0.6)" fontSize="6">客厅</text>
          <text x="155" y="45" fill="rgba(255,255,255,0.6)" fontSize="6">儿童</text>
          <text x="80" y="95" fill="rgba(255,255,255,0.6)" fontSize="6">超大主卧 + 衣帽间</text>
          {showDevices && (
            <g>
              {[
                [30, 30], [50, 55], [80, 35], [110, 50], [150, 30], [170, 55],
                [60, 95], [120, 95], [80, 110], [140, 110]
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.6" fill="#a855f7" opacity="0.8" />
              ))}
            </g>
          )}
        </g>
      )}

      {pattern === 'cross' && (
        <g>
          <rect x="10" y="20" width="180" height="100" fill="url(#floor-dots)" stroke="url(#wall-gradient)" strokeWidth="1.5" rx="2" />
          <line x1="100" y1="20" x2="100" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="10" y1="70" x2="190" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x="40" y="45" fill="rgba(255,255,255,0.6)" fontSize="6">A</text>
          <text x="135" y="45" fill="rgba(255,255,255,0.6)" fontSize="6">B</text>
          <text x="40" y="95" fill="rgba(255,255,255,0.6)" fontSize="6">C</text>
          <text x="135" y="95" fill="rgba(255,255,255,0.6)" fontSize="6">D</text>
          {showDevices && (
            <g>
              {Array.from({ length: 14 }).map((_, i) => (
                <circle
                  key={i}
                  cx={20 + (i * 12) % 170}
                  cy={30 + Math.floor(i / 6) * 30}
                  r="1.6"
                  fill="#3b82f6"
                  opacity="0.8"
                />
              ))}
            </g>
          )}
        </g>
      )}

      {pattern === 'L' && (
        <g>
          <path
            d="M 10 20 L 130 20 L 130 70 L 190 70 L 190 120 L 10 120 Z"
            fill="url(#floor-dots)"
            stroke="url(#wall-gradient)"
            strokeWidth="1.5"
          />
          <line x1="70" y1="20" x2="70" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="10" y1="70" x2="130" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="100" y1="70" x2="100" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x="30" y="45" fill="rgba(255,255,255,0.6)" fontSize="6">院</text>
          <text x="90" y="45" fill="rgba(255,255,255,0.6)" fontSize="6">堂屋</text>
          <text x="40" y="100" fill="rgba(255,255,255,0.6)" fontSize="6">主厢</text>
          <text x="120" y="100" fill="rgba(255,255,255,0.6)" fontSize="6">客厅</text>
          <text x="160" y="100" fill="rgba(255,255,255,0.6)" fontSize="6">东厢</text>
          {showDevices && (
            <g>
              {[
                [40, 35], [80, 35], [100, 50], [120, 35], [165, 85],
                [30, 95], [70, 95], [115, 95], [150, 110], [180, 100]
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.6" fill="#10b981" opacity="0.8" />
              ))}
            </g>
          )}
        </g>
      )}

      {pattern === 'two-floor' && (
        <g>
          <rect x="10" y="15" width="180" height="50" fill="url(#floor-dots)" stroke="url(#wall-gradient)" strokeWidth="1.5" rx="2" />
          <rect x="10" y="75" width="180" height="50" fill="url(#floor-dots)" stroke="url(#wall-gradient)" strokeWidth="1.5" rx="2" />
          <line x1="80" y1="15" x2="80" y2="65" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="140" y1="15" x2="140" y2="65" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="80" y1="75" x2="80" y2="125" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="140" y1="75" x2="140" y2="125" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <text x="6" y="14" fill="rgba(255,255,255,0.4)" fontSize="5">2F</text>
          <text x="6" y="74" fill="rgba(255,255,255,0.4)" fontSize="5">1F</text>
          {showDevices && (
            <g>
              {[
                [30, 30], [60, 50], [100, 30], [120, 50], [160, 30], [180, 50],
                [30, 90], [55, 110], [110, 90], [125, 110], [160, 90], [180, 110]
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.6" fill="#f59e0b" opacity="0.8" />
              ))}
            </g>
          )}
        </g>
      )}
    </svg>
  );
}
