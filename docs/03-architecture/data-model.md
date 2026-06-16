# Data Model

> Aqara Builder 平台的核心数据实体与关系。
> 这是单一事实来源（Single Source of Truth）；任何 Schema 变更先改这里。

---

## 实体总览

```
                ┌──────────────────┐
                │   Organization    │  (Aqara / 区域伙伴)
                └─────────┬────────┘
                          │ partners-with / employs
            ┌─────────────┴───────────────┐
            ▼                             ▼
     ┌─────────────┐              ┌──────────────┐
     │ ACBProfile  │◄─── owns ────│   Project    │
     │ (identity)  │              └──────┬───────┘
     └──────┬──────┘                     │
            │ holds                      │ has
     ┌──────▼──────┐                     ▼
     │    Badge    │              ┌──────────────┐
     └─────────────┘              │  WorkOrder   │
                                  │  (fulfill)   │
                                  └──────┬───────┘
                                         │ uses
                                         ▼
                                  ┌──────────────┐
                                  │  Ontology    │
                                  │  Graph       │
                                  └──────┬───────┘
                                         │ scoped to
                                         ▼
                                  ┌──────────────┐
                                  │   Family     │
                                  └──────┬───────┘
                                         │ contains
                          ┌──────────────┼──────────────┐
                          ▼              ▼              ▼
                  ┌──────────────┐ ┌──────────┐ ┌─────────────┐
                  │   Member      │ │  Device  │ │   Studio    │
                  │  + Persona   │ └──────────┘ │  (设备实例) │
                  └──────────────┘              └─────────────┘
                                                ┌──────────────┐
                                                │   Plugin     │
                                                └──────────────┘
                                                ┌──────────────┐
                                                │   Showcase   │
                                                └──────────────┘
```

> **核心**：`Project` 是商业责任容器；`WorkOrder` 是可派发、可接单、可履约、可结算的工作单元；每个 `Family` 关联一台（或多台）`Studio`；每个正式交付项目的完成必须有 Studio / 设备运行证据和客户验收记录。

---

## Builder Pro 商业模型补充

> 本节用于覆盖 Builder Pro、Workspace、Pricing 和 Credits 的长期模型。Builder Pro 是专业工作台能力，不是套餐、认证等级或用户角色。

```text
AqaraAccount
├─ PersonalProfile
├─ ProfessionalProfile?
└─ PersonalWorkspace

Company
├─ CompanyProfile
├─ TeamCode
├─ Verification / Programs / Contracts
└─ TeamWorkspace[]

Workspace
├─ Projects
├─ Members / Permissions
├─ Billing
├─ CreditPool
├─ MarketplaceEntitlements
└─ ServiceRecords
```

> Marketplace / Assets 的完整契约见 [`../01-product/marketplace-assets-architecture.md`](../01-product/marketplace-assets-architecture.md)。Marketplace Product 获取后必须形成 Workspace Entitlement，再进入 Assets 和 Assignment；资产不归属于 Account。

### `AqaraAccount`

```ts
{
  id: string
  email: string
  personalProfileId: string
  professionalProfileId?: string
  personalWorkspaceId: string
}
```

规则：

1. 所有用户都是 Aqara Account；
2. 所有用户默认拥有 Personal Profile 和 Personal Workspace；
3. Professional Profile 由 Professional Onboarding 激活；
4. Professional Profile 与 Subscription、Certification、Workspace 解耦。

### `Workspace`

```ts
{
  id: string
  type: 'personal' | 'team'
  name: string
  companyId?: string
  planId: 'free' | 'pro' | 'business' | 'enterprise'
  creditPoolId: string
  createdByAccountId: string
}
```

规则：

1. Workspace 是工作容器，决定 Projects、Credits、Billing、Members、Permissions、Marketplace Assets 和 Service Records；
2. Workspace 不等于 Company，也不等于 Profile；
3. Workspace Type 只允许 `personal` 和 `team`；
4. 业务差异通过 Company、Labels、Programs、Certifications、Billing Policy 表达。

### `Company`

```ts
{
  id: string
  name: string
  profileStatus: 'basic' | 'complete'
  verificationStatus: 'none' | 'pending' | 'verified'
  labels: string[]
  programs: string[]
  teamCode: string
  billingPolicyId?: string
}
```

Company 管理 Company Profile、Verification、Service Area、Programs、Team Code、Certifications 和 Contracts。Workspace 管理 Projects、Credits、Members、Permissions 和 Billing。

### `Plan`

```ts
{
  id: 'free' | 'pro' | 'business' | 'enterprise'
  scope: 'personal' | 'business'
  creditGrantPolicy: CreditGrantPolicy
  seatPolicy?: SeatPolicy
}
```

命名规则：

| 计划族 | 计划 |
| --- | --- |
| Personal Plans | Free / Pro |
| Business Plans | Business / Enterprise |

禁止使用 `Individual Plan` 和 `Team Plan` 作为用户侧计划名称。

### `CreditPool`

```ts
{
  id: string
  workspaceId: string
  balance: number
  grants: CreditGrant[]
  ledger: CreditLedgerEntry[]
}
```

Credits 永远归属 Workspace，不归属成员。成员只拥有 Spending Limit。成员离开 Team Workspace 时，Credits 不转移。

### `MarketplaceProduct / Entitlement / Assignment`

```ts
MarketplaceProduct {
  id: string
  type: 'plugin' | 'template' | 'service_package' | 'agent' | 'connector' | 'solution_pack'
  category: 'automation' | 'ai' | 'design' | 'integration' | 'operations' | 'service'
  acquisition: { method: 'free' | 'credits' | 'included' | 'quote', credits?: number }
  accessPolicy: {
    requiresProfessional: boolean
    allowedWorkspaceTypes: Array<'personal' | 'team'>
    allowedPlans: Array<'free' | 'pro' | 'business' | 'enterprise'>
  }
}

Entitlement {
  id: string
  productId: string
  workspaceId: string
  source: 'free' | 'credits' | 'included' | 'quote' | 'manual_grant'
  status: 'active' | 'pending_binding' | 'pending_approval' | 'expired'
}

Assignment {
  id: string
  entitlementId: string
  targetType: 'studio' | 'project' | 'customer_space'
  targetId: string
  status: 'active' | 'revoked'
}
```

规则：

1. Marketplace 负责 Product、Redeem、Entitlement、Assets 和 Assignment 生命周期；
2. Studio Runtime 负责资产运行；
3. Builder Marketplace 默认写入 Personal Workspace Entitlement；
4. Builder Pro Marketplace 默认写入当前 Active Workspace Entitlement；
5. Member 在 Team Workspace 中默认发起 Purchase Request，不直接消耗 Workspace Credits。

---

## 核心实体

### `Organization`

```ts
{
  id: string
  type: 'aqara' | 'regional_partner'   // 中国过渡期 partner = 服务商
  name: string
  region: { country: string, city?: string }
  switches?: ChinaTransitionSwitches    // 仅 regional_partner
  created_at, updated_at
}
```

> 区域伙伴相关开关详见 [`../00-vision/china-transition.md`](../00-vision/china-transition.md)。
> Aqara 平台**直管 ACB（人）**，区域伙伴只是 ACB 的 Affiliation 选项之一，不"拥有" ACB。

---

### `ACBProfile`

```ts
{
  id: string
  user_id: string                       // 关联 Auth 账号
  display_name: string
  bio?: string
  region: { country, city }
  affiliation: {
    organization_id?: string            // 区域伙伴 ID（独立则 null）
    employment: 'internal' | 'contracted' | 'none'
    since: date
  }
  badges: BadgeAward[]                  // 见下；ACB 资质完全由 Badge 表达
  metrics: {
    projects_completed: number
    avg_rating: number
    response_time_p50_min: number
    personas_designed: number
    plugins_authored: number
    studios_deployed: number            // 累计部署激活的 Studio 数
  }
  portfolio: ShowcaseRef[]
  contact: { phone?, email?, im? }
  privacy: { ... }
  created_at, updated_at
}
```

> **不要** 用枚举 `role: 'installer' | 'designer'`，用 `badges` 表达。详见 [`../02-roles/role-model.md`](../02-roles/role-model.md)。
> `acting_profile` / `X-Acting-Profile` 在 API 层表达"当前以哪种身份行动"（多 Affiliation 场景）。

---

### `Badge` / `BadgeAward`

```ts
// Badge 元数据（系统配置）
{
  id: 'installer_certified' | 'spatial_designer' | ...
  category: 'installation' | 'design' | 'development' | 'specialty' | 'honor'
  level: 1 | 2 | 3
  name_i18n: { en, zh, ja, ... }
  permissions: string[]                 // 解锁的权限 bundle，含 studio_deploy_scope
  prerequisites: string[]               // 前置 Badge / 条件
  validity_months: number               // 默认 12
}

// ACB 持有的 Badge
{
  id: string
  acb_id: string
  badge_id: string
  awarded_at: date
  expires_at?: date
  awarded_by: 'aqara_academy' | 'system'
  evidence: { course_id?, exam_score?, achievement_ref? }
  status: 'active' | 'expired' | 'revoked' | 'under_review'
}
```

> Badge 跟 ACB（人）走，与 Affiliation 解耦——挂靠关系变更不影响 Badge。

---

### `Project`

```ts
{
  id: string
  acb_id: string                        // 主负责 ACB
  collaborators?: ACBCollab[]           // 协作者
  organization_id?: string              // 接单时的 affiliation 快照
  project_type?: 'hotel' | 'homestay' | 'real_estate' | 'restaurant' | 'community_property' | 'office' | 'agriculture' | 'healthcare' | 'education' | 'residential' | 'other'
  name: string
  address: {
    country: string
    region_path?: string[]              // 例如 ['Asia', 'China']
    city?: string
    district?: string
    detail?: string
  }
  client: ClientInfo
  contact?: {
    name: string
    phone: string
  }
  background_description?: string
  stage: 'draft' | 'qualified' | 'quoted' | 'design-confirmed' | 'scheduled' | 'in-progress' | 'pending-acceptance' | 'accepted' | 'service-active' | 'closed'
  requirement_brief_id?: string
  design_package_id?: string
  work_order_ids?: string[]
  ontology_graph_id?: string
  family_id?: string                    // 交付到的家庭 / 客户 Space
  studio_id?: string                    // 部署的 Studio 实例（交付完成后必填）
  devices: DeviceRef[]
  plugins_recommended: PluginRef[]
  service_plan_ids?: string[]           // 项目交付后或报价中绑定的持续服务
  acceptance_record_ids?: string[]
  showcase_id?: string
  earnings_attribution: AttributionConfig
  created_at, updated_at, closed_at
}
```

`AttributionConfig`：定义这个项目的订阅分佣 / 插件分佣 / 区域分成的归属规则。**项目关闭后规则锁定**。
**交付完成的硬性条件**：关联的安装 / 调试类 `WorkOrder` 已 approved + `studio_id` 已激活或运行证据已记录 + 客户 `AcceptanceRecord` 已完成。

---

### `MarketplaceAsset` / `Entitlement` / `StudioAssignment`

插件、模板、连接器、自动化包和服务包必须拆成三层事实：

1. `MarketplaceAsset`：市场中可浏览、可 Get、可 Redeem 的商品或能力条目。
2. `Entitlement`：某个个人账号、前台个人资产库、Pro Workspace、Project 或客户对象拥有的使用权。
3. `StudioAssignment`：某个 Entitlement 被分配给具体 Studio 的授权关系。

Studio 的下载安装、启停、更新、卸载和运行日志不属于 Builder 的 Entitlement 事实，而属于 Studio 本地运行事实。

```ts
{
  // MarketplaceAsset
  id: string
  type: 'studio_plugin' | 'device_connector' | 'automation_pack' | 'widget' | 'scene_pack' | 'solution_template' | 'service_pack' | 'private_solution'
  name: string
  publisher_id: string
  permission: 'free' | 'pro' | 'commercial' | 'enterprise'
  runtime_target: 'studio' | 'life' | 'both'
  credit_cost: number
  fulfillment: 'self_service' | 'builder_assisted' | 'project_binding' | 'private_distribution'
  status: 'draft' | 'listed' | 'delisted'
  created_at, updated_at
}

{
  // Entitlement
  id: string
  asset_id: string
  owner_type: 'account' | 'personal_asset_library' | 'workspace' | 'project' | 'studio_group'
  owner_id: string
  source: 'free' | 'credits_redeem' | 'plan_included' | 'contract' | 'manual_grant'
  paid_by?: {
    account_id: string
    workspace_id?: string
    credit_pool_id?: string
  }
  credit_spent?: number
  status: 'active' | 'pending_binding' | 'pending_approval' | 'expired' | 'revoked'
  created_by: string
  created_at, expires_at?
}

{
  // StudioAssignment
  id: string
  entitlement_id: string
  studio_id: string
  space_id?: string
  project_id?: string
  assigned_by: string
  status: 'assigned' | 'unassigned' | 'revoked'
  assigned_at, revoked_at?
}

{
  // StudioRuntimePluginState，来自 Studio 回传，只读展示
  studio_id: string
  asset_id: string
  version?: string
  state: 'not_downloaded' | 'downloaded' | 'installed' | 'active' | 'inactive' | 'failed' | 'uninstalled'
  last_seen_at: string
  health?: 'healthy' | 'warning' | 'error'
}
```

关键规则：

1. Builder 前台 Get / Redeem 形成个人资产库里的 Entitlement；Assign 到 Studio 后形成 `StudioAssignment`。
2. Builder Pro 始终在当前 Workspace 上下文下操作；Redeem 默认扣当前 Workspace Credit Pool，并形成 Workspace Entitlement。
3. 权限不足成员不能直接扣 Credits，只能发起 `pending_approval` 的 Entitlement 请求。
4. 服务包不进入 Studio 插件运行生命周期；它形成 `ServicePlan`，再绑定服务对象并创建 `ServiceSession`。
5. Builder 不管理插件包下载、安装、卸载；这些动作由 Studio 本地根据授权清单完成。

---

### `WorkOrder`

`WorkOrder` 是 Builder Pro 中支持远程设计、本地安装、Studio 调试、远程服务和维护的履约单元。它属于 Project，但可以被平台匹配、派发、接单、执行、验收和结算。

```ts
{
  id: string
  project_id: string
  type: 'remote_design' | 'site_survey' | 'installation' | 'commissioning' | 'remote_service' | 'maintenance'
  title: string
  status: 'draft' | 'open' | 'matched' | 'assigned' | 'accepted' | 'scheduled' | 'in-progress' | 'submitted' | 'approved' | 'rejected' | 'cancelled'
  commercial_owner: {
    type: 'individual_pro' | 'team' | 'aqara_space' | 'service_org'
    id: string
  }
  assignee?: {
    account_id: string
    organization_id?: string
    role: 'designer' | 'installer' | 'remote_operator' | 'project_manager'
  }
  service_market: {
    country: string
    region_path?: string[]
    city?: string
    remote: boolean
    local_delivery: boolean
  }
  schedule?: {
    start_at?: string
    end_at?: string
    timezone?: string
  }
  input_refs: {
    requirement_brief_id?: string
    design_package_id?: string
    installer_handoff_id?: string
    studio_id?: string
    service_plan_id?: string
  }
  output_refs: {
    design_package_id?: string
    survey_report_id?: string
    commissioning_session_id?: string
    service_session_id?: string
    acceptance_record_id?: string
    evidence_asset_ids?: string[]
  }
  settlement_ref?: string
  created_at, updated_at, submitted_at?, approved_at?
}
```

`WorkOrder` 设计原则：

1. `Project` 是业务容器，`WorkOrder` 是履约和派单单位。
2. 远程设计和本地安装可以由不同人 / 组织完成，但必须回到同一个 Project Passport。
3. 现场安装、调试、验收证据必须进入 `output_refs`，不能只存在聊天或备注里。
4. 结算、评分、纠纷和质量追溯以 `WorkOrder` 为最小责任单元。

---

### `Lead`

```ts
{
  id: string
  source: 'builder_frontstage' | 'aqara_life' | 'marketplace' | 'aqara_space_referral' | 'platform_dispatch' | 'manual' | 'community_inquiry' | 'showcase' | 'acb_directory' | 'acb_profile' | 'referral'
  source_ref?: string                   // Showcase ID / ACB ID 等
  user_id: string
  service_intent: {
    type: 'remote_design' | 'local_installation' | 'full_delivery' | 'remote_diagnosis' | 'maintenance' | 'service_plan' | 'other'
    project_type?: string
    completion_mode?: 'hire_professional' | 'do_it_myself' | 'not_sure'
  }
  client_intent: { ... }
  region: { country, city }
  matched_acbs: { acb_id, score, reason }[]
  status: 'new' | 'contacted' | 'qualified' | 'proposal-sent' | 'won' | 'lost' | 'archived' | 'expired'
  converted_project_id?: string
  converted_work_order_id?: string
  attribution_chain: AttributionLink[]
  expires_at: date
}
```

---

### `Studio`（新增 — 客户家本地空间智能 OS 实例）

```ts
{
  id: string
  family_id: string
  hardware_serial: string
  firmware_version: string
  region: { country, city }
  deployed_by_acb_id: string            // 谁部署的 — 不可变（首次激活后冻结）
  affiliation_at_deploy?: string        // 部署时的 organization_id 快照
  status: 'shipped' | 'activated' | 'online' | 'offline' | 'decommissioned'
  health: { last_seen_at, uptime_pct_30d, alerts_open }
  remote_access_window?: {
    granted_to_acb_id: string
    grant_scope: string[]
    expires_at: date
  }
  ontology_graph_id?: string            // 本机加载的图谱
  installed_plugins: PluginInstallRef[] // Studio 端运行的插件
  created_at, activated_at?
}
```

> Studio 是"交付价值"的物理载体，详见 [`../01-product/studio-and-builder.md`](../01-product/studio-and-builder.md)。
> 远程访问严格通过 `remote_access_window` 时间窗 + 客户授权控制。

---

### `Ontology Graph`

> 空间本体实例。用图数据库（Neo4j）或 Postgres + 边表实现。
> 在 Studio 上**本地保留一份运行时拷贝**，云端为协同 / 备份 / Showcase 提取的源。

```ts
// 节点
{
  id, graph_id, type: 'space' | 'zone' | 'device' | 'person' | 'service'
  label, attributes
}

// 边
{
  id, graph_id, from, to,
  relation: 'contains' | 'connects' | 'controls' | 'triggers' | ...,
  attributes
}

// 图元数据
{
  id
  family_id
  studio_id?                      // 部署目标 Studio
  acb_id                          // 创建者，用于归属
  template_id?                    // 起始模板
  version: number
  status: 'draft' | 'delivered' | 'live'
  last_modified_at
}
```

详见 [`api-contracts.md`](./api-contracts.md) 的 Ontology API。

---

### `Family` / `Member` / `Persona`

```ts
// 家庭
{
  id
  primary_user_id
  members: Member[]
  ontology_graph_id?
  studio_ids: string[]                  // 一个家庭可能有多台 Studio（别墅 / 多区域）
  region
}

// 成员
{
  id, family_id, user_id?,            // 子账号可能没有独立 user_id
  display_name
  role: 'owner' | 'partner' | 'elder' | 'child' | 'guest' | 'helper' | 'custom'
  age_band?
  account_type: 'primary' | 'sub' | 'temporary'
  active_window?: { start, end }      // 临时账号
}

// Persona = 为某个 Member 组装的 Aqara Life 首页 + Studio 端联动配置
{
  id
  member_id
  family_id
  composed_by_acb_id
  layers: {
    aqara_default_id: string
    acb_overlay: PersonaOverlay         // 由 ACB 在 Builder Console 组装
    user_tweaks: PersonaTweaks
  }
  plugins: PluginInstall[]
  delivered_at?                         // 推送到 Studio + Aqara Life 的时间
  delivered_to_studio_id?
  version: number
}
```

详见 [`../01-product/aqara-life-app.md`](../01-product/aqara-life-app.md)。

---

### `Plugin` / `PluginVersion` / `PluginInstall`

```ts
// Plugin（市场对象）
{
  id
  author_id                            // ACBProfile 或 Aqara 官方
  name_i18n
  category
  pricing: 'free' | 'one_time' | 'subscription'
  runtime: 'app' | 'studio' | 'hybrid' // 在哪里执行
  current_version_id
  status: 'draft' | 'review' | 'live' | 'taken_down'
}

// 版本
{
  id, plugin_id, version, manifest, changelog,
  signed_bundle_url, sandbox_passed: boolean
  released_at
}

// 用户安装（家庭维度）
{
  id, family_id, plugin_version_id,
  installed_via: 'acb_delivery' | 'user_market' | 'auto',
  installed_to: 'app' | 'studio'
  studio_id?                            // runtime = studio 时必填
  attribution: { recommending_acb_id?, source_showcase_id? }
}
```

---

### `MarketplaceItem`

Marketplace 同时承载插件和服务包。两者都可以免费或用 Credits 定价，但交付方式不同：插件是数字资产授权，服务包会实例化为客户名下的 `ServicePlan`。

```ts
{
  id: string
  type: 'plugin' | 'service_package'
  author_type: 'aqara' | 'professional' | 'team' | 'aqara_space' | 'service_org'
  author_id: string
  name_i18n: Record<string, string>
  description_i18n: Record<string, string>
  pricing: {
    model: 'free' | 'fixed_credits' | 'subscription_credits' | 'quote_required' | 'bundled'
    credits?: number
    currency_amount?: { amount: number, currency: string }
  }
  availability: {
    regions?: string[]
    languages?: string[]
    remote: boolean
    local_delivery: boolean
  }
  target_ref: {
    plugin_id?: string                  // type = plugin
    service_package_id?: string         // type = service_package
  }
  status: 'draft' | 'review' | 'live' | 'taken_down'
  created_at, updated_at
}
```

---

### `ServicePackage` / `ServicePlan` / `ServiceSession`

```ts
// Marketplace 或 Pro 报价中可售的服务包模板
{
  id: string
  provider_type: 'professional' | 'team' | 'aqara_space' | 'service_org' | 'aqara'
  provider_id: string
  type: 'care' | 'security' | 'energy' | 'rental' | 'maintenance' | 'optimization' | 'integration'
  scope_template: {
    covered_tasks: string[]
    excluded_tasks: string[]
    included_sessions?: number
    response_sla_hours?: number
    report_cadence?: 'monthly' | 'quarterly' | 'on_demand'
  }
  authorization_policy_template: {
    mode: 'customer_approved_each_time' | 'scheduled_window' | 'alert_triggered_window' | 'read_only_monitoring' | 'managed_operation'
    default_scopes: string[]
    max_window_hours?: number
  }
  pricing: {
    model: 'free' | 'fixed_credits' | 'subscription_credits' | 'quote_required' | 'bundled'
    credits?: number
  }
  status: 'draft' | 'review' | 'live' | 'retired'
}

// 客户名下的服务合约 / 订阅实例
{
  id: string
  customer_id: string
  project_id?: string
  marketplace_item_id?: string
  service_package_id?: string
  commercial_owner: {
    type: 'individual_pro' | 'team' | 'aqara_space' | 'service_org'
    id: string
  }
  responsible_operators: {
    account_id: string
    role: 'remote_operator' | 'designer' | 'installer' | 'project_manager'
  }[]
  status: 'draft' | 'proposed' | 'active' | 'paused' | 'renewal_due' | 'renewed' | 'cancelled' | 'expired'
  covered_assets: {
    space_ids: string[]
    studio_ids: string[]
    device_ids?: string[]
    persona_ids?: string[]
  }
  scope: {
    included_sessions?: number
    response_sla_hours?: number
    report_cadence?: 'monthly' | 'quarterly' | 'on_demand'
    covered_tasks: string[]
    excluded_tasks: string[]
  }
  authorization_policy: {
    mode: 'customer_approved_each_time' | 'scheduled_window' | 'alert_triggered_window' | 'read_only_monitoring' | 'managed_operation'
    default_scopes: string[]
    max_window_hours?: number
  }
  billing: {
    price_model: 'one_time' | 'monthly' | 'quarterly' | 'annual'
    credits?: number
    amount?: number
    currency?: string
    renewal_at?: string
  }
  version: number
  created_at, updated_at
}

// 一次实际远程或现场服务动作
{
  id: string
  service_plan_id?: string
  operator_grant_id?: string
  project_id?: string
  actor_account_id: string
  actions: string[]
  report_asset_id?: string
  started_at
  ended_at?
  audit_hash?: string
}
```

> `ServicePackage` 是可售模板；`ServicePlan` 是客户名下的服务实例；`ServiceSession` 是一次具体履约记录。Life Dashboard 只是客户日常体验层，不是 ServicePlan 或 Remote Service Console。

---

### `Showcase`

```ts
{
  id
  acb_id
  project_id
  studio_id?                            // 关联的真实部署
  title_i18n, story_i18n
  tags
  ontology_summary: { node_count, relation_count, complexity_score }
  personas_summary: PersonaSummaryRef[]
  devices_summary, plugins_summary
  cover, gallery
  status: 'draft' | 'published' | 'editor_pick' | 'taken_down'
  metrics: {
    impressions, ideabook_saves, leads_generated,
    deals_closed, plugin_revenue_attributed,
    studios_attributed                  // 因此 Showcase 引出的新 Studio 部署
  }
  published_at
}
```

---

### `Earnings` / `Commission`

```ts
// 分佣条目（事件流）
{
  id
  acb_id
  organization_id?
  source_type: 'project_fee' | 'subscription' | 'plugin_sale' | 'service_package' | 'service_plan_renewal' | 'regional_passive' | 'lead_bonus' | 'studio_recurring'
  source_ref
  amount, currency
  rate, basis
  status: 'pending' | 'cleared' | 'paid'
  cleared_at?, paid_at?
}
```

> 区域伙伴的 region passive 收入也走这张表，区分 `organization_id` 即可。
> `studio_recurring` = Studio 关联的 Aqara AI 月费分佣（ACB 持续受益）。

---

## 关键索引与查询模式

| 查询 | 索引建议 |
|---|---|
| 按 Badge 找 ACB | `acb_profiles.badges` GIN |
| 区域 + Badge 派单 | `acb_profiles (region.city, badges)` 复合 |
| ACB 项目时间线 | `projects (acb_id, created_at desc)` |
| ACB 已部署 Studio 列表 | `studios (deployed_by_acb_id, status)` |
| 家庭关联的 Studio | `studios (family_id, status)` |
| Showcase 推荐流 | 向量索引 + `showcases.tags` GIN |
| 分佣月度结算 | `earnings (acb_id, status, cleared_at)` |
| Studio 健康度告警 | `studios (status, health.last_seen_at)` 部分索引 |

---

## 设计原则

1. **不要把"角色"做成枚举字段**——永远用 `badges`。
2. **Affiliation 与 Badge 解耦**——挂靠关系变更不影响 Badge / 数据归属。
3. **AttributionConfig 在项目关闭后冻结**——避免历史分佣规则被改写。
4. **家庭 / Persona / Plugin 三层覆盖配置必须可审计、可回滚**。
5. **多区域字段从一开始就有**，避免后期改 Schema。
6. **Studio 是项目交付的物理锚点**——`Project.closed` 必须有 `studio_id` + 至少一份 delivered Persona。
7. **Studio 部署归属（`deployed_by_acb_id`）首次激活后不可变**——保证 ACB 长期分佣权益绑定到部署人。
