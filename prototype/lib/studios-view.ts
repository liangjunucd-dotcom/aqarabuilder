/**
 * Builder 前台 · My Studios 列表视图（无 Workspace 概念）
 */
import {
  MyStudios,
  type Studio,
  type StudioHealth,
  type Workspace,
  type WorkspaceRole,
  getFrontendInvitedWorkspaces,
  getFrontendOwnerWorkspaces,
  getFrontendWorkspaces,
} from '@/lib/mock/studios';
import {
  COUNTRIES,
  REGION_DEFAULT_COUNTRY,
  getServerLabel,
  type Country,
  type DcId,
} from '@/lib/regions';

export interface StudioInstanceRow {
  id: string;
  deviceId: string;
  name: string;
  spaceName: string;
  spaceEmoji: string;
  ipLocal: string;
  lastSeen: string;
  lastSeenIso: string;
  health: StudioHealth;
  country: Country;
  serverLabel: string;
  role: WorkspaceRole;
  /** 我是否拥有该 Studio（Owner） */
  isOwner: boolean;
}

export interface FrontendStudioSpaceGroup {
  workspace: Workspace;
  country: Country;
  items: StudioInstanceRow[];
}

function studioToRow(studio: Studio, country: Country, role: WorkspaceRole, isOwner: boolean): StudioInstanceRow {
  return {
    id: studio.id,
    deviceId: studio.deviceId,
    name: studio.name,
    spaceName: studio.spaceName,
    spaceEmoji: studio.spaceEmoji,
    ipLocal: studio.ipLocal,
    lastSeen: studio.lastSeen,
    lastSeenIso: formatLastSeenIso(studio.lastSeen, studio.installedAt),
    health: studio.health,
    country,
    serverLabel: getServerLabel(country.dcId),
    role,
    isOwner,
  };
}

function formatLastSeenIso(lastSeen: string, installedAt: string): string {
  if (lastSeen === '刚刚') return '2026-05-19 10:16:01';
  return `${installedAt} 10:16:01`;
}

/** 我拥有的 Studio（Owner）— 来自各 Workspace 下的设备，前台不展示 Workspace 名称 */
export function getOwnedStudioInstances(): StudioInstanceRow[] {
  const rows: StudioInstanceRow[] = [];
  for (const ws of getFrontendOwnerWorkspaces()) {
    const country = REGION_DEFAULT_COUNTRY[ws.region] ?? COUNTRIES[0];
    for (const studioId of ws.studioIds) {
      const studio = MyStudios.find(s => s.id === studioId);
      if (studio) rows.push(studioToRow(studio, country, ws.currentRole, true));
    }
  }
  return rows;
}

/** 受邀访问的 Studio（非 Owner） */
export function getInvitedStudioInstances(): StudioInstanceRow[] {
  const rows: StudioInstanceRow[] = [];
  for (const ws of getFrontendInvitedWorkspaces()) {
    const country = REGION_DEFAULT_COUNTRY[ws.region] ?? COUNTRIES[0];
    for (const studioId of ws.studioIds) {
      const studio = MyStudios.find(s => s.id === studioId);
      if (studio) rows.push(studioToRow(studio, country, ws.currentRole, false));
    }
  }
  return rows;
}

export function getAllFrontendStudioInstances(): StudioInstanceRow[] {
  return [...getOwnedStudioInstances(), ...getInvitedStudioInstances()];
}

export function getFrontendStudioSpaceGroups(): FrontendStudioSpaceGroup[] {
  const rows = getAllFrontendStudioInstances();
  return getFrontendWorkspaces()
    .map(workspace => {
      const items = rows.filter(row => workspace.studioIds.includes(row.id));
      const country = items[0]?.country ?? REGION_DEFAULT_COUNTRY[workspace.region] ?? COUNTRIES[0];
      return { workspace, country, items };
    })
    .filter(group => group.items.length > 0);
}

/** 按国家分组（同国家 = 同展示组；底层可能同 DC） */
export function groupByCountry(rows: StudioInstanceRow[]): Array<{ country: Country; items: StudioInstanceRow[] }> {
  const map = new Map<string, StudioInstanceRow[]>();
  for (const row of rows) {
    const key = row.country.code;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return COUNTRIES.filter(c => map.has(c.code)).map(c => ({
    country: c,
    items: map.get(c.code)!,
  }));
}

/** 按数据中心分组（仅当需要展示「服务器」维度时使用） */
export function groupByDc(rows: StudioInstanceRow[]): Array<{ dcId: DcId; serverLabel: string; items: StudioInstanceRow[] }> {
  const map = new Map<DcId, StudioInstanceRow[]>();
  for (const row of rows) {
    const dc = row.country.dcId;
    if (!map.has(dc)) map.set(dc, []);
    map.get(dc)!.push(row);
  }
  const order: DcId[] = ['cn', 'us', 'eu', 'sg', 'kr', 'ru'];
  return order
    .filter(dc => map.has(dc))
    .map(dc => ({
      dcId: dc,
      serverLabel: getServerLabel(dc),
      items: map.get(dc)!,
    }));
}
