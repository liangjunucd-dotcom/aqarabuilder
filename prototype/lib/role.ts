'use client';

import { useEffect, useState } from 'react';

/**
 * Pro 身份模型 — 三维分离
 *
 *   1. 平台访问层级（Role）— 你能走多远
 *      anonymous → 未登录游客
 *      builder   → 注册用户：Community + Design Platform 自用设计
 *      pro       → Professional：完成 onboarding，可进 Builder Pro（高级能力取决于 Plan / Badge）
 *      verified  → Certified Professional：经 Aqara 或区域伙伴认证通过
 *
 *   2. Badge（技能认证）— 你能做什么
 *      Spatial Designer   → 方案设计 / 点图 / BOM / 报价 / 合同
 *      Certified Installer → 安装工单承接 / 现场施工（需所在国电工资质）
 *      Plugin Developer   → Driver / Connector / 上架 Marketplace
 *      Solution Architect → 复杂系统 / 协议驱动 / 架构咨询
 *
 *   3. Level（经验声誉）— 你有多好
 *      Level 1–5，基于项目数、评价分、完成率，影响排名与信任排序
 *
 *   关键原则：
 *   - Professional 可进 Builder Pro，但不一定有全功能（线索、协作等需 Plan / certified + 对应 Badge）
 *   - 一个人可持有多个 Badge（安装商也可以学设计、接方案单）
 *   - verified 是 Aqara 总部认证的信任背书，不是技能认证
 *   - 服务商及其编内员工默认 verified；独立 Pro 可申请认证
 *
 *   user 为旧 demo 兼容角色；新登录默认直接进入 builder。
 */
export type Role = 'anonymous' | 'user' | 'builder' | 'pro' | 'verified';

// ─── Badge 类型 ──────────────────────────────────────────────────────────

export type BadgeType =
  | 'spatial-designer'
  | 'verified-installer'
  | 'plugin-developer'
  | 'solution-architect';

export const BADGE_LABEL: Record<BadgeType, string> = {
  'spatial-designer': 'Spatial Designer',
  'verified-installer': 'Certified Installer',
  'plugin-developer': 'Plugin Developer',
  'solution-architect': 'Solution Architect',
};

export const BADGE_DESC: Record<BadgeType, string> = {
  'spatial-designer': '空间方案设计 · 点图绘制 · BOM 编制 · 报价合同',
  'verified-installer': '安装工单承接 · 现场施工交付 · 需电工资质',
  'plugin-developer': 'Driver / Connector · Marketplace 上架',
  'solution-architect': '复杂系统架构 · 协议驱动 · 技术咨询',
};

/** Demo 用：当前模拟持有的 Badge 列表 */
export function getDemoBadges(role: Role): BadgeType[] {
  if (role === 'verified') return ['verified-installer', 'spatial-designer'];
  if (role === 'pro') return ['spatial-designer'];
  return [];
}

// ─── Role Storage ────────────────────────────────────────────────────────

const KEY = 'aqara_demo_role';
const ROLE_VALUES = ['anonymous', 'user', 'builder', 'pro', 'verified'] as const;

function normalizeRoleValue(value: string | null): Role | null {
  if (!value || !ROLE_VALUES.includes(value as Role)) return null;
  return value === 'user' ? 'builder' : (value as Role);
}

export function getRole(): Role {
  if (typeof window === 'undefined') return 'anonymous';
  const seed = normalizeRoleValue(new URLSearchParams(window.location.search).get('demo_as'));
  if (seed) {
    try {
      localStorage.setItem(KEY, seed);
    } catch {
      // Storage can be blocked in private/embedded browser contexts.
    }
    return seed;
  }
  if (window.location.pathname === '/') {
    try {
      localStorage.setItem(KEY, 'anonymous');
    } catch {
      // Keep the public entry as visitor even when storage is blocked.
    }
    return 'anonymous';
  }
  let storedRole: Role | null = null;
  try {
    storedRole = normalizeRoleValue(localStorage.getItem(KEY));
  } catch {
    return 'anonymous';
  }
  if (storedRole) {
    try {
      localStorage.setItem(KEY, storedRole);
    } catch {
      // Reading succeeded, so keep using the resolved role for this session.
    }
    return storedRole;
  }
  return 'anonymous';
}

export function setRole(r: Role) {
  if (typeof window === 'undefined') return;
  const normalized = normalizeRoleValue(r) ?? 'anonymous';
  try {
    localStorage.setItem(KEY, normalized);
  } catch {
    // The in-memory event still lets the current tab update its role.
  }
  window.dispatchEvent(new CustomEvent<Role>('aqara:role-change', { detail: normalized }));
}

export function useRole(): { role: Role; mounted: boolean } {
  const [role, setRoleState] = useState<Role>('anonymous');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setRoleState(getRole());
    } finally {
      setMounted(true);
    }
    const onChange = (event: Event) => {
      const eventRole = event instanceof CustomEvent ? normalizeRoleValue(event.detail) : null;
      setRoleState(eventRole ?? getRole());
    };
    window.addEventListener('aqara:role-change', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('aqara:role-change', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  return { role, mounted };
}

// ─── Labels ──────────────────────────────────────────────────────────────

export const ROLE_LABEL: Record<Role, string> = {
  anonymous: '游客',
  user: '普通用户（旧）',
  builder: '用户',
  pro: 'Professional',
  verified: 'Certified',
};

export const ROLE_DESC: Record<Role, string> = {
  anonymous: '未登录，仅可浏览公开内容',
  user: '旧角色（将迁移为 Builder）',
  builder: '已登录用户 · 使用 Community、Marketplace、个人 Studio 与个人创作',
  pro: '已激活 Professional Profile · 可进入 Builder Pro 基础工作台',
  verified: 'Aqara 认证专业人 · 可接线索、协作交付与获得可信背书',
};

// ─── Access Checks ───────────────────────────────────────────────────────

export function isBuilderRole(role: Role): boolean {
  return role === 'builder' || role === 'pro' || role === 'verified';
}

export function isProBuilderRole(role: Role): boolean {
  return role === 'pro' || role === 'verified';
}

/** 是否为 Aqara 总部认证的 Pro */
export function isVerifiedProRole(role: Role): boolean {
  return role === 'verified';
}

// 向后兼容别名
export const isVerifiedInstallerRole = isVerifiedProRole;

// ─── Capability Matrix ───────────────────────────────────────────────────
//
//  三层门控：
//   · 基础层 — 由 Role 决定（访问权限）
//   · 信任层 — verified 角色解锁（线索、财务、外部协作）
//   · Badge 层 — 由具体 Badge 决定（工具使用权）
//
//  pro 进 Builder Pro 但无 Badge 时只有基础查看权限；
//  verified 解锁信任层，但工具仍取决于 Badge。
// ───────────────────────────────────────────────────────────────────────────

export type Capability =
  // ─── Design Platform ──────────────────────────
  | 'cubix.open'
  | 'cubix.design.self'
  | 'cubix.design.client'
  | 'cubix.studio.bind.self'
  | 'cubix.studio.bind.client'
  | 'cubix.solution.publish'
  | 'cubix.plugin.develop'
  | 'cubix.protocol.driver'
  // ─── Builder Pro ──────────────────────────────
  | 'pro.console.open'
  | 'pro.project.create.self'
  | 'pro.project.create.client'
  | 'pro.project.transfer'
  | 'pro.leads.receive'
  | 'pro.client.manage'
  | 'pro.spaces.customer'
  | 'pro.contracts'
  | 'pro.estimates.send'
  | 'pro.purchase.order'
  | 'pro.invoice.issue'
  | 'pro.settlement.receive'
  | 'pro.marketplace.publish'
  | 'pro.company.team'
  | 'pro.company.collaborators'
  | 'pro.company.affiliated.store'
  // ─── 现场 / Life App ────────────────────────
  | 'life.builder.mode'
  | 'life.installer.dispatch';

// ── 基础能力（按访问层级） ──────────────────────────────────────────────

const BASE_CAPABILITIES: Record<Role, Capability[]> = {
  anonymous: [],
  user: ['cubix.open', 'cubix.design.self'],
  builder: [
    'cubix.open',
    'cubix.design.self',
    'cubix.studio.bind.self',
    'cubix.plugin.develop',
  ],
  pro: [
    // Design Platform
    'cubix.open',
    'cubix.design.self',
    'cubix.studio.bind.self',
    'cubix.plugin.develop',
    // Builder Pro 基础
    'pro.console.open',
    'pro.project.create.self',
    'pro.company.team',
  ],
  verified: [
    // 继承 pro 全部基础能力
    'cubix.open',
    'cubix.design.self',
    'cubix.studio.bind.self',
    'cubix.plugin.develop',
    'pro.console.open',
    'pro.project.create.self',
    'pro.company.team',
    // verified 信任层解锁
    'pro.leads.receive',
    'pro.settlement.receive',
    'pro.company.collaborators',
    'pro.company.affiliated.store',
  ],
};

// ── Badge 层能力 ────────────────────────────────────────────────────────

const BADGE_CAPABILITIES: Record<BadgeType, Capability[]> = {
  'spatial-designer': [
    'cubix.design.client',
    'cubix.solution.publish',
    'pro.project.create.client',
    'pro.client.manage',
    'pro.contracts',
    'pro.estimates.send',
    'pro.project.transfer',
  ],
  'verified-installer': [
    'cubix.studio.bind.client',
    'pro.purchase.order',
    'pro.invoice.issue',
    'pro.marketplace.publish',
    'life.builder.mode',
    'life.installer.dispatch',
  ],
  'plugin-developer': [
    'cubix.plugin.develop',
    'pro.marketplace.publish',
  ],
  'solution-architect': [
    'cubix.protocol.driver',
    'pro.spaces.customer',
    'pro.project.transfer',
    'cubix.solution.publish',
  ],
};

// ── 组合：某 role + 其 Badge 的全部能力 ─────────────────────────────────

function resolveCapabilities(role: Role): Capability[] {
  const base = BASE_CAPABILITIES[role] ?? [];
  const badges = getDemoBadges(role);
  const badgeCaps = badges.flatMap(b => BADGE_CAPABILITIES[b] ?? []);
  return [...new Set([...base, ...badgeCaps])];
}

// 兼容旧的 CAP_MATRIX 导出（部分代码直接引用）
export const CAP_MATRIX: Record<Role, Capability[]> = {
  anonymous: resolveCapabilities('anonymous'),
  user: resolveCapabilities('user'),
  builder: resolveCapabilities('builder'),
  pro: resolveCapabilities('pro'),
  verified: resolveCapabilities('verified'),
};

export function can(role: Role, cap: Capability): boolean {
  return CAP_MATRIX[role]?.includes(cap) ?? false;
}

/** 一组能力中只要有任一不满足就算锁定 */
export function locked(role: Role, ...caps: Capability[]): boolean {
  return caps.some(c => !can(role, c));
}

// ── 升级提示 ────────────────────────────────────────────────────────────

export function upgradeHint(role: Role, cap: Capability): string {
  if (can(role, cap)) return '';
  if (role === 'anonymous') return '请先登录';
  if (role === 'user') {
    if (cap.startsWith('cubix.')) return '需要切换到 Builder 角色';
    return 'Builder 专属';
  }
  if (role === 'builder') {
    if (cap.startsWith('pro.')) return '开启 Builder Pro 后可使用';
    return '完成 onboarding 后可使用';
  }
  // pro → verified（HQ 认证）+ Badge 获取
  if (role === 'pro') {
    switch (cap) {
      case 'pro.leads.receive':        return 'Certified Professional 专属：认证后可接入线索池';
      case 'pro.settlement.receive':   return 'Certified Professional 专属：按项目或合同记录结算';
      case 'pro.company.collaborators':return 'Certified Professional 专属：认证后可管理外部协作者';
      case 'pro.company.affiliated.store':return 'Certified Professional 专属：认证后可关联门店';
      case 'pro.purchase.order':       return '需持有 Certified Installer Badge 并通过电工资质审核';
      case 'pro.invoice.issue':        return '需持有 Certified Installer Badge';
      case 'pro.project.transfer':     return '需持有 Spatial Designer 或 Solution Architect Badge';
      case 'pro.spaces.customer':      return '需持有 Solution Architect Badge';
      case 'cubix.studio.bind.client': return '需持有 Certified Installer Badge';
      case 'cubix.solution.publish':   return '需持有 Spatial Designer 或 Solution Architect Badge';
      case 'cubix.protocol.driver':    return '需持有 Solution Architect Badge';
      case 'life.builder.mode':        return '需持有 Certified Installer Badge';
      case 'life.installer.dispatch':  return '需持有 Certified Installer Badge';
      case 'pro.marketplace.publish':  return '需持有 Plugin Developer 或 Certified Installer Badge';
      case 'cubix.design.client':      return '需持有 Spatial Designer Badge';
      case 'pro.client.manage':        return '需持有 Spatial Designer Badge';
      case 'pro.contracts':            return '需持有 Spatial Designer Badge';
      case 'pro.estimates.send':       return '需持有 Spatial Designer Badge';
      default:                         return '需获得对应 Badge 认证或 Aqara 总部审核';
    }
  }
  return '';
}
