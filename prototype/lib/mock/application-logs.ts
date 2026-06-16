import { userEntitledAssets } from '@/lib/mock/commerce';
import { getAllFrontendStudioInstances } from '@/lib/studios-view';

export interface ApplicationLogEntry {
  id: string;
  pluginName: string;
  pluginVersion: string;
  applicationObject: string;
  applicationStatus: '已应用' | '待应用' | '应用失败';
  time: string;
  spaceName: string;
  countryLabel: string;
}

const LOG_TIME_SEED = [
  '2026-04-28 23:48:33',
  '2026-05-29 19:20:18',
  '2026-05-23 10:15:42',
  '2026-05-18 08:40:09',
  '2026-05-11 14:05:55',
  '2026-06-03 09:12:21',
  '2026-06-03 10:36:04',
  '2026-06-03 12:03:37',
];

const VERSION_SEED = ['1.0.0', '1.2.3', '2.0.1', '2.1.0', '3.0.0'];

function timestampFromEntitlementId(id: string) {
  const timestamp = id.match(/-(\d{13})-/)?.[1];
  if (!timestamp) return null;
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(Number(timestamp));
}

export function getApplicationLogs(): ApplicationLogEntry[] {
  const studios = getAllFrontendStudioInstances();

  return userEntitledAssets()
    .filter(row => row.entitlement.status === 'active')
    .map((row, index) => {
      const matchedStudio = studios.find(studio => studio.name === row.entitlement.runtimeTarget || studio.id === row.entitlement.runtimeTarget);
      const fallbackStudio = row.asset.target === 'life' ? null : studios[index % Math.max(studios.length, 1)];
      const studio = matchedStudio ?? fallbackStudio;

      return {
        id: `app-log-${row.entitlement.id}`,
        pluginName: row.asset.name,
        pluginVersion: VERSION_SEED[index % VERSION_SEED.length],
        applicationObject: studio?.id ?? 'Aqara Life',
        applicationStatus: '已应用' as const,
        time: timestampFromEntitlementId(row.entitlement.id) ?? LOG_TIME_SEED[index % LOG_TIME_SEED.length],
        spaceName: studio?.spaceName ?? 'Aqara Life',
        countryLabel: studio?.country.label ?? 'Aqara Life',
      };
    })
    .sort((a, b) => b.time.localeCompare(a.time));
}
