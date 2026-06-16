/**
 * 国家/地区（用户可见） vs 数据中心/服务器（技术边界）
 *
 * - 国家/地区：中国大陆、美国、韩国、日本、荷兰…（Builder 前台 Studios 页按此分组/筛选）
 * - 数据中心：中国服务器、美国服务器、欧洲服务器…（同 DC 多国共享一份 Studio 数据）
 */

export type DcId = 'cn' | 'us' | 'eu' | 'sg' | 'kr' | 'ru';

export interface DataCenter {
  id: DcId;
  /** 如：中国服务器 */
  serverLabel: string;
}

export interface Country {
  code: string;
  label: string;
  flag: string;
  dcId: DcId;
}

export const DATA_CENTERS: Record<DcId, DataCenter> = {
  cn: { id: 'cn', serverLabel: '中国服务器' },
  us: { id: 'us', serverLabel: '美国服务器' },
  eu: { id: 'eu', serverLabel: '欧洲服务器' },
  sg: { id: 'sg', serverLabel: '新加坡服务器' },
  kr: { id: 'kr', serverLabel: '韩国服务器' },
  ru: { id: 'ru', serverLabel: '俄罗斯服务器' },
};

/** 常用国家列表（200+ 国家映射到 6 个 DC，此处为原型常用项） */
export const COUNTRIES: Country[] = [
  { code: 'cn', label: '中国大陆', flag: '🇨🇳', dcId: 'cn' },
  { code: 'us', label: '美国', flag: '🇺🇸', dcId: 'us' },
  { code: 'kr', label: '韩国', flag: '🇰🇷', dcId: 'kr' },
  { code: 'jp', label: '日本', flag: '🇯🇵', dcId: 'kr' },
  { code: 'sg', label: '新加坡', flag: '🇸🇬', dcId: 'sg' },
  { code: 'nl', label: '荷兰', flag: '🇳🇱', dcId: 'eu' },
  { code: 'de', label: '德国', flag: '🇩🇪', dcId: 'eu' },
  { code: 'fr', label: '法国', flag: '🇫🇷', dcId: 'eu' },
  { code: 'ar', label: '阿根廷', flag: '🇦🇷', dcId: 'us' },
  { code: 'ru', label: '俄罗斯', flag: '🇷🇺', dcId: 'ru' },
];

/** mock Workspace.region (CN/US/EU) → 默认展示国家 */
export const REGION_DEFAULT_COUNTRY: Record<string, Country> = {
  CN: COUNTRIES.find(c => c.code === 'cn')!,
  US: COUNTRIES.find(c => c.code === 'us')!,
  EU: COUNTRIES.find(c => c.code === 'nl')!,
};

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getServerLabel(dcId: DcId): string {
  return DATA_CENTERS[dcId]?.serverLabel ?? dcId;
}
