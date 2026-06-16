# Role Model: Badge-based ACB Identity

> Aqara 平台四方角色定位 + **Aqara Certified Builder（ACB）** 身份用 **Badge 组合**而非固定标签建模。
> 培训权全部在 Aqara Academy。Builder 是平台直管对象，区域伙伴不"拥有" Builder。
> Professional Profile、组织进入、Aqara Space / 服务商组织成员和 Service Plan 架构见 [`../03-architecture/professional-network-architecture.md`](../03-architecture/professional-network-architecture.md)。

---

## 术语精确定义

| 术语 | 含义 |
|---|---|
| **Aqara Builder** | 平台名（`builder.aqara.com`） |
| **Professional Profile** | 普通用户在同一 Aqara Account 上激活的专业身份展示和工作入口；不是新账号 |
| **Aqara Certified Builder（ACB / Builder）** | **被 Aqara Academy 认证的专业人士个人** |
| **Affiliation** | Builder 的挂靠关系（独立 / 挂靠区域伙伴 / 内部雇员），可变 |
| **Organization Membership** | 个人专业身份与 Team、Aqara Space 或服务组织的成员关系 |

> 本文档以下"Builder"特指 **ACB（人）**，与"平台 Aqara Builder"严格区分。

---

## 四方角色

### 🏢 Aqara（平台方）

- 制定本体标准、培训课程、认证体系
- **直接培训 + 直接认证 Builder**（招募 / 培训 / 认证 / 分级 / 评级），不经过区域伙伴
- 通过 **Aqara Academy** 统一交付培训：线上课程 + 区域线下集训 + 考核 → 颁发 Badge
- **运营全球 Builder Network**：质量监控、Studio 健康度、客户评价、保险池
- 运营 Builder 平台 + 订阅分佣清算
- 目标：保证 Builder 质量和**全球标准统一**

详见 [`global-network-model.md`](./global-network-model.md)。

### 🏬 区域运营伙伴（中国服务商 / 海外 Master Franchise / City Lead）

> 关键转型：从 **"渠道分销 / Installer 雇主"** 转为 **"区域基础设施提供者"**。

- 新职能：体验中心 / 前置仓 / Builder 招募协助 / 物流 / 售后协调 / 享受区域被动分成
- **不承担培训职能**（培训彻底剥离到 Aqara Academy）
- **不"拥有" Builder**——Builder 是 Aqara 平台直管对象；区域伙伴只是 Builder 的 Affiliation 选项之一
- 区域伙伴自己的员工 = **内部雇员 ACB**，与独立 ACB 走同一套 Badge 认证体系

详见 [`china-transition.md`](./china-transition.md) 和 [`global-network-model.md`](./global-network-model.md)。

### 🔧 Aqara Certified Builder（ACB）

- 由 Aqara Academy 直接培训和认证
- 身份不是固定标签，而是 **Badge 组合**（详见下方）
- **Affiliation 可变**：独立 / 挂靠区域伙伴 / 区域伙伴雇员 / 跨国流动均可，Badge 跟人走
- 一个 Builder 可同时持有 Installer + Designer + Developer 等多个 Badge

### 👤 End User

- 通过 Aqara Life / Aqara AI 下单 → 平台派单 → Builder 上门
- 客户家由 Builder 部署 **Aqara Studio**（本地空间智能操作系统）
- 订阅 Aqara AI → 自动分佣给 Builder + 区域伙伴 + Aqara
- 客户评价的对象是 **Builder + Aqara**，不是区域伙伴

详见 [`../01-product/studio-and-builder.md`](../01-product/studio-and-builder.md)。

---

## Badge-based Identity（核心设计原则）

> **一个账号 = 一个 ACB Profile + N 个 Badge**，而非"你是 Installer 还是 Designer"。

### 模型

```
┌──────────────────────────────────────────────┐
│              ACB Profile                      │
│  ──────────────────────────────────────────  │
│  identity_id                                  │
│  display_name                                 │
│  region: { country, city }                    │
│  affiliation: {                               │
│    organization_id?    ← 区域伙伴 / null      │
│    employment: 'internal' | 'contracted' | 'none'
│    since: date                                │
│  }                                            │
│  badges: [...]      ← 决定权限/匹配/分佣       │
│  reviews, portfolio, metrics                  │
│  delivered_studios: [...]                     │
└──────────────────────────────────────────────┘
```

### Badge 决定什么

| 维度 | 由 Badge 控制 |
|---|---|
| Lead 匹配范围 | ✅ |
| 接单权限 | ✅ |
| 分佣比例 | ✅ |
| Profile 展示模块 | ✅ |
| Workshop 高级功能解锁 | ✅ |
| Studio 远程操作权限层级 | ✅ |

### Affiliation 与 Badge 解耦

- `affiliation: { organization_id?, employment }` 表达挂靠
- `independent ACB` 与 `internal ACB` 在平台上是**同一种"人"**，Badge 体系完全一致
- 区别仅在：
  - 收入清算路径（内部雇员走区域伙伴对公）
  - Lead 派单优先级（本区域伙伴优先，详见 china-transition）
- **Affiliation 可变，Badge 跟人走，跨区域伙伴 / 跨国流动不损失资历**

### 个人能力与组织角色解耦

现有 Aqara Space / 服务商组织进入 Builder 时，老板和员工都必须以个人 Aqara Account 进入，再通过 `Organization Membership` 获得代表组织工作的权限。

| 层级 | 归属 | 示例 |
|---|---|---|
| 个人能力 | 人 | Designer Badge、Installer Badge、Remote Service Badge、作品、评分 |
| 组织角色 | 组织成员关系 | Owner、Admin、Store Manager、Project Manager、Designer、Installer、Remote Operator、Sales、Finance Viewer |

规则：

1. 禁止共享“门店账号”；每个员工都有自己的 Professional Profile。
2. Badge、评分、作品集跟人走。
3. Lead 池、项目商业责任、账本、Service Plan 和服务质量可归个人、Team、Aqara Space 或服务组织。
4. Aqara Space / 服务商组织在 Builder 中是认证服务组织和本地信任节点，不是门店 ERP。

### 重叠角色自然消解

> 一个人可同时持有多个 Badge：今天是 Installer，明天考了 Designer Badge，后天发布了插件成为 Developer。

**Profile 自然演化**，不需要"切换角色"模式。Houzz Pro 同思路（一个人可同时是 Architect + Builder + Designer）。

---

## 为什么这样

- **培训直管**保证全球服务质量一致性，Badge 才有公信力
- **平台直管 Builder** 是 Aqara 区别于一切 Installer 网络（Lutron / Crestron / Control4 等）的根本差异
- **Badge-based 建模**让"重叠角色"问题自然消解
- **区域伙伴员工和独立 Builder 用同一套体系**，避免双轨制带来的标准分裂
- **Affiliation 与 Badge 解耦**，让人才在独立/挂靠/跨国之间流动不损失资历——海外扩张需要

---

## 落地原则

1. 任何"Builder 归区域伙伴培训 / 雇佣 / 拥有"的假设都要立刻反思——**Aqara 平台直管，Aqara Academy 直接培训**。
2. 不要在数据模型里设计"角色"枚举字段；用 `badges: [...]` + `affiliation` 表达。详见 [`../03-architecture/data-model.md`](../03-architecture/data-model.md)。
3. Profile 页、Lead 匹配、Workshop 权限、Builder 分级都应基于 **Badge 组合** 查询，而不是单一身份。
4. 区域伙伴后台设计时，"内部雇员管理界面" = ACB 管理界面 + Affiliation 字段，**不是另一套系统**。
5. 涉及 Builder 数据 / 信用时，数据主体是 ACB 个人；affiliation 可变，**Badge 跟人走，跨国跟人走**。
6. 海外市场没有服务商包袱，**直接跑纯独立 Builder 网络**（Badge 体系完全通用）。
7. Studio 部署归属（`deployed_by`）始终是 ACB 个人，不是区域伙伴。
