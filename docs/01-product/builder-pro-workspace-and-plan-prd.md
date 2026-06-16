# Builder Pro Workspace 与 Plan 产品需求文档

| 版本 | 修订说明 | 修订人 | 修订日期 | 备注 |
| --- | --- | --- | --- | --- |
| v1.0 | 初稿 | Jun | 2026.06.04 | 覆盖 Builder Pro Workspace、个人/团队计划、Credits、Profile 与进入工作台流程 |
| v1.1 | 计划命名定版 | Codex | 2026.06.07 | 用户侧展示 Personal Plans / Business Plans；系统内部按 Workspace Plan scope 管理 |
| v1.2 | Points 与插件兑换探索 | Codex | 2026.06.07 | 曾拆分 Credits 与 Points；后续 v1.4 收敛为统一 Credits |
| v1.3 | 商业闭环探索 | Codex | 2026.06.07 | 曾按账号 Points 与 Workspace Credits 分视角展示 |
| v1.4 | 统一 Credits 定版 | Codex | 2026.06.07 | 用户侧只展示 Credits；套餐赠送 Plan Credits，额外购买 Add-on Credits，Marketplace 保留 Credits 兑换 |
| v1.5 | MVP 付费与升级入口 | Codex | 2026.06.07 | Free 升级 Pro 先进入 Onboarding 和开通申请；未来支付接入同一 Upgrade Intent |
| v1.6 | 产品 / 能力 / 容器 / 计费分层 | Codex | 2026.06.07 | Builder Pro 是能力层；Workspace 是工作容器；Plans 分为 Personal Plans 与 Business Plans |
| v1.7 | Identity First 架构原则 | Codex | 2026.06.07 | Professional Identity 与 Subscription / Certification / Workspace 解耦；Free Professional 可进入 Builder Pro 基础工作台 |

---

## 一、需求背景

Aqara Builder 前台面向普通用户提供社区、灵感、Marketplace、个人内容、个人 Credits 和个人 Profile；Builder Pro 面向专业用户提供项目、设计、远程服务、交付、账本和团队协作能力。

用户进入 Builder Pro 后仍然是同一个个人 Aqara Account。这个人可以只使用自己的个人工作区，也可以加入普通团队、设计工作室、安装团队或 Aqara Space 服务商门店。平台需要支持以下场景：

1. 个人用户在 Builder 前台订阅个人计划，每月获得 Credits；
2. 同一个用户完成 Professional Onboarding 后，可进入 Builder Pro，并在个人工作区继续使用自己的个人 Credits；
3. 用户加入团队或服务商门店后，在 Team Workspace 中使用 Business / Enterprise 计划、组织 Credits、团队项目和团队账本；
4. 普通团队、服务商门店和未来企业客户在协作结构上都属于 Team Workspace，只是业务标签、认证状态、合同和补贴政策不同；
5. 社区前台前期只展示个人主页，未来可扩展组织主页，但 Profile 不直接等同于 Workspace。

因此，Builder Pro 需要建立一套 Workspace-first 模型：**人是入口，Profile 是公开身份，Workspace 是私有工作容器，Plan 与 Credits 作用在 Workspace 上。**

---

## 二、产品定位

Builder Pro Workspace 是专业工作台里的工作与计费容器，用于决定当前项目、成员、Credits、Plan、账本、权限和责任归属。

它不是社区前台的信息架构，也不是公开主页。Builder 前台不需要向普通用户暴露 Workspace 概念；Builder Pro 中需要显式展示和切换 Workspace。

目标用户：

- 已登录 Builder 用户；
- 已激活 Professional Profile 的个人专业用户；
- 普通团队 Owner、Admin、Member；
- Aqara Space / 服务商门店成员；
- 未来企业客户、系统集成商或大型项目运营成员。

核心价值：

| 对象 | 价值 |
| --- | --- |
| 个人用户 | 个人计划、个人 Credits、个人内容和个人 Pro 工作保持连续 |
| 团队 / 服务商 | 项目、成员、Credits、账本和订阅计划归属清晰 |
| Aqara | 可通过认证、合同、补贴和线索资格叠加服务商能力 |
| 平台 | 前台简单，Pro 清楚，未来可扩展组织主页和企业计划 |

---

## 三、设计原则

| 序号 | 原则 | 说明 |
| --- | --- | --- |
| 1 | **用户始终是个人** | Aqara Account 对应个人；团队和服务商通过组织与成员关系连接个人。 |
| 2 | **Profile 与 Workspace 分离** | Profile 是公开身份；Workspace 是私有工作容器。 |
| 3 | **Workspace Type 只保留 Personal / Team** | Personal 表示个人默认工作区；Team 表示多人协作工作区。 |
| 4 | **Builder Pro 是能力层，不是套餐** | Builder Pro 不等于 Pro Plan、认证等级或用户角色；Professional Identity 与订阅解耦。 |
| 5 | **Identity First，不 Payment First** | 用户先完成 Professional Onboarding 获得 Professional Profile 和 Builder Pro 访问权，再在使用限制处触发升级。 |
| 6 | **计划由账号购买，权益落到账号或组织** | Personal Plan 由个人账号购买；Business Plan 由账号为组织购买。 |
| 7 | **Credits 是唯一可见资源单位** | AI 对话、户型解析、3D 生成和 Marketplace 兑换都使用 Credits。 |
| 8 | **使用按当前 Workspace 归集** | 当前 Workspace 决定项目、成员、账本和默认 Credit Pool。 |
| 9 | **权益归属清晰** | 插件、模板、服务包兑换后形成 Entitlement；Builder 前台归个人资产，Builder Pro 归当前 Workspace。 |
| 10 | **账号视角和工作区视角分离** | User Settings 看账号订阅；Workspace / Company Settings 看当前 Workspace。 |
| 11 | **Role / Label / Badge 分离** | Role 管权限；Label 管能力或业务属性；Badge 管可信资格。 |
| 12 | **前台降噪，Pro 显性化** | Builder 前台展示“我的内容 / Credits Usage / 我的 Profile”；Builder Pro 展示 Workspace。 |
| 13 | **服务商能力用标签、认证和政策叠加** | Aqara Space 服务商门店是 Team Workspace 的业务标签或认证状态，不是独立 Workspace Type。 |

---

## 四、功能需求

### 4.1 Builder 前台与 Personal Workspace

**功能概述**：每个已登录用户默认拥有一个 Personal Workspace。Builder 前台不展示 Workspace 名称，但所有个人内容、个人 Credits 和个人计划在底层归属该 Personal Workspace。

**前台展示对象**：

| 前台模块 | 用户看到 | 底层归属 |
| --- | --- | --- |
| Profile | 个人主页 | Person Profile |
| Credits | 我的 Credits | Personal Workspace Credit Pool |
| Designs / Ideabook | 我的设计与收藏 | Personal Workspace |
| Marketplace | 插件兑换、礼品兑换、我的授权与分配记录 | Credits + Personal Entitlement |
| Community | 评论、收藏、发布内容 | Person / Personal Workspace |

**交互规则**：

1. 普通用户不需要选择 Workspace；
2. 普通用户购买个人计划后，Credits 发放到 Personal Workspace；
3. 用户完成 Professional Onboarding 后，Personal Workspace 在 Builder Pro 工作台中显性展示；
4. 用户在 Personal Workspace 中发起的个人项目默认消耗 Personal Credits。
5. Builder 前台 Marketplace 兑换消耗个人 Credits，插件权益进入个人资产；用户再选择 Space 和 Studio 分配授权。

---

### 4.2 Builder Pro 进入 Workspace

**功能概述**：用户进入 Builder Pro 时，需要进入某个 Workspace。只有一个 Workspace 时可直接进入；有多个 Workspace 时展示 Workspace Picker。

**触发入口**：

- 顶部导航 `Builder Pro`
- Onboarding 完成后的跳转
- Pro 顶部 Workspace Switcher 中的 `My Workspaces`

**页面构成**：

| 区域 | 内容 |
| --- | --- |
| 顶部 | 搜索框、`New Workspace` 按钮 |
| Workspace 卡片 | Workspace 名称、类型、当前角色、计划、Credits、业务标签 |
| 空状态 | 引导创建 Team Workspace |
| 底部 | 返回 Builder 前台、退出登录、语言入口 |

**Workspace 卡片信息**：

| 字段 | 示例 |
| --- | --- |
| Name | Personal / Design Studio / Seven Mi Co., Ltd |
| Type | Personal / Team |
| Role | Owner / Admin / Member |
| Plan | Free / Pro / Business / Enterprise |
| Credits | 1,280 / 8,500 / Contract |
| Labels | Design Studio / Aqara Space / Service Provider |

**交互流程**：

1. 用户点击进入 Builder Pro；
2. 系统读取用户可访问的 Workspace 列表；
3. 若只有 Personal Workspace，直接进入 Pro 首页；
4. 若有多个 Workspace，展示 Workspace Picker；
5. 用户选择 Workspace；
6. 系统记录 `lastActiveWorkspaceId`；
7. 进入该 Workspace 的 Builder Pro 首页。

---

### 4.3 Workspace Switcher

**功能概述**：Builder Pro 顶部展示当前 Workspace，并允许用户切换到其他 Workspace。

**界面构成**：

| 元素 | 内容 |
| --- | --- |
| 当前 Workspace | 名称、类型、角色、计划 |
| 下拉列表 | Personal 分组、Team 分组 |
| 快捷入口 | My Workspaces、Manage members、Go to Community |

**交互规则**：

1. 切换 Workspace 后，项目、Credits、账本、成员、设置和默认操作范围随之切换；
2. 切换 Workspace 不是切换账号；
3. 切换 Workspace 不影响用户个人 Profile 和 Professional Profile；
4. Team Workspace 下的项目默认进入团队账本；
5. Personal Workspace 下的项目默认进入个人账本。

---

### 4.4 New Workspace

**功能概述**：用户可以创建 Team Workspace，用于团队、设计工作室、安装团队、服务商门店或其他协作组织。

**入口**：

- Workspace Picker → `New Workspace`
- Workspace Switcher → `My Workspaces` → `New Workspace`

**字段**：

| 字段 | 是否必填 | 说明 |
| --- | --- | --- |
| Workspace Name | 是 | 团队、公司或门店名称 |
| Plan | 是 | Business / Enterprise |
| Proof of Business | 是 | 营业执照、工商证明、门店证明、业务资质或等价材料 |
| Labels | 否 | Design、Installation、Service Provider、Aqara Space 等 |

**交互规则**：

1. Personal Workspace 由系统默认创建，用户不能手动创建第二个 Personal Workspace；
2. New Workspace 创建的是 Company / Organization 和默认 Team Workspace；
3. Proof of Business 只用于验证和风控，不在前台公开展示；
4. 选择 Service Provider 或 Aqara Space 标签后，可进入后续认证或资料补充流程；
5. Team Workspace 创建后，创建者成为 Owner；
6. Company 默认状态为 `pending_verification`，不影响进入默认 Workspace；
7. 创建完成后默认进入新 Workspace。

---

### 4.5 Plan 与 Credits

**功能概述**：Plan 由账号购买，按照适用对象分为 Personal Plans 和 Business Plans。Plan 负责发放 Plan Credits、功能权限和席位；实际使用时，当前 Workspace 决定项目、账本、成员和默认 Credit Pool。用户侧不再拆分 Points 和 AI 用量，统一使用 Credits。

**分层定版**：

| 层级 | 用户看到 | 说明 |
| --- | --- | --- |
| 产品层 | Aqara Builder / Aqara Builder Pro | Builder 是前台体验；Builder Pro 是专业能力层 |
| 工作容器层 | Personal Workspace / Team Workspace | Workspace 承载项目、成员、账本、权限和 Credit Pool |
| 计费层 | Personal Plans / Business Plans | Personal Plans 面向个人账号；Business Plans 面向组织 / Team Workspace |
| 身份层 | Profile / Professional Profile / Badge | Profile 是公开身份；Badge 是可信资格；不等同 Workspace 或 Plan |

**命名定版**：

| 层级 | 用户看到 | 系统内部 | 说明 |
| --- | --- | --- | --- |
| Account Plan | Free / Pro | `plan.scope = personal`，`plan.id = free / pro` | 个人账号订阅，默认作用于 Personal Workspace |
| Organization Plan | Business / Enterprise | `plan.scope = business`，`plan.id = business / enterprise` | 账号为组织购买，默认作用于 Team Workspace |
| Workspace Type | Personal / Team | `workspace.type = personal / team` | 决定使用场景和 Credit Pool |

**计划目录**：

| 对象 | 可选计划 | 说明 |
| --- | --- | --- |
| 个人账号 | Free / Pro | 面向个人账号、自有 Studio、个人 Pro 工作台和 Personal Credits |
| 组织 / 团队 | Business / Enterprise | 面向多人协作、共享 Credits、成员、账本、服务商或企业能力 |

**命名禁用规则**：

1. 用户侧不使用 `Individual Plans`；
2. 不把 `Team` 用作 Plan 名称；
3. `Personal` 和 `Team` 是 Workspace Type，不是 Plan 名；
4. `Pro` 是 Personal Plan 名称，不等于 Builder Pro 产品，也不等于 Certified 认证。

**Builder Pro Free 规则**：

| 状态 | 说明 |
| --- | --- |
| Builder User | 只有 Builder 前台体验；访问 `/pro` 时引导 Become a Professional |
| Free Professional | 已完成 Professional Onboarding，可进入 Builder Pro、使用 Personal Workspace、创建基础项目和体验基础专业功能 |
| Pro Subscriber | 在 Free Professional 基础上获得更多 Credits、高级导出、Remote Service、Marketplace 权益和个人商业项目能力 |
| Business / Enterprise Member | 在 Team Workspace 中使用组织席位、共享 Credits、成员权限、项目账本和服务交付能力 |

**Credits 规则**：

| 当前 Workspace | 默认消耗 |
| --- | --- |
| Personal Workspace | 个人账号的 Plan Credits + Personal Add-on Credits |
| Team Workspace | 组织的 Plan Credits + Shared Add-on Credits / Contract Credits |

**Personal Free 前台额度**：

| 项目 | 额度 |
| --- | --- |
| 周期 | 每周额度 |
| Basic Credits | 100 Credits / week |
| AI Chat | 按请求复杂度消耗 Credits |
| Floor Plan Analysis | 按图纸复杂度消耗 Credits |
| Solution / Automation | 按生成复杂度消耗 Credits |
| 3D / Visual | 按生成复杂度消耗 Credits |

Free 额度用于 Builder 前台和 Life App 的轻量 AI 体验。Builder 前台可展示 Credits Usage，但不暴露 Personal Workspace 概念。

**计划权益发放规则**：

| Plan | 购买方 | Credit Pool | Plan Credits | Add-on Credits |
| --- | --- | --- | --- | --- |
| Free | 个人账号 | Personal | 每周基础 Credits | 不支持或受限 |
| Pro | 个人账号 | Personal | 每月 Plan Credits | Personal Add-on Credits |
| Business | 账号为组织购买 | Organization | 每席位每月 Plan Credits | Shared Add-on Credits |
| Enterprise | 账号为组织购买 / 合同 | Contract | 合同 Credits | 合同资源包 / 补贴额度 |

1. Credits 有来源：`plan_grant` / `add_on_purchase` / `contract` / `promo` / `manual_grant`；
2. Plan Credits 按周期刷新；Add-on Credits 可设置有效期；
3. 使用时优先消耗最早过期的 Credits；
4. Business / Enterprise 的 Shared Add-on Credits 归组织池，成员离开不转移；
5. Enterprise 补贴可增加 Contract Credits，但必须保留来源和审批记录。

**MVP 付费 / 开通规则**：

| 场景 | 当前 MVP 行为 | 未来支付接入 |
| --- | --- | --- |
| Become a Professional | 完成 Professional Onboarding，获得 Professional Profile 与 Builder Pro 基础访问权 | 不经过 Checkout |
| Free -> Pro | 在项目数、Credits、导出、Remote Service 或 Marketplace 权益限制处触发 Upgrade Intent；MVP 可提交申请或获得白名单 grant | 触发 Upgrade Intent 后进入 Checkout，支付成功后激活 Pro entitlement |
| Pro Subscriber 个人加量 | 不展示 Upgrade；展示申请加量入口，由运营发放 `manual_grant` | 支持购买 Personal Add-on Credits |
| 创建 Team Workspace | 只能选择 Business / Enterprise，创建后进入 Workspace | 在 Plan & Licenses 中完成组织支付、续费、升级或合同确认 |
| Business / Enterprise 加量 | Owner / Admin / Billing Admin 在当前 Workspace 申请加量 | 支持 Shared Add-on Credits、自助续费或合同额度 |

1. `Upgrade` 是用户意图，不等于立即支付；
2. MVP 白名单用户的 Upgrade 可直接转为 entitlement grant；
3. 所有付费、试用、白名单、补贴和人工加量都必须写入 `Entitlement`、`CreditGrant` 和 `CreditLedger`；
4. 未来接入 Stripe、区域支付或合同账单时，不改变 Onboarding、Workspace 和 Credit Pool 模型。

**Marketplace / 授权中心规则**：

| 对象 | 归属 | 用途 |
| --- | --- | --- |
| Credits | Personal / Organization / Contract Credit Pool | AI 对话、户型解析、方案生成、3D/视觉生成、Marketplace 兑换 |
| Personal Entitlement | Account / Personal Asset Library | Builder 前台用户获得的插件、模板或服务权益 |
| Workspace Entitlement | 当前 Pro Workspace | Pro 工作区获得的插件、模板、商业连接器或服务权益 |
| Studio Assignment | Studio | Entitlement 被分配给某台 Studio 的授权关系 |
| Studio Runtime State | Studio 本地 | 插件下载、安装、启用、停用、更新、卸载和运行日志 |

1. 公开 Marketplace 用于浏览能力目录；列表页只承担发现、筛选和进入详情，不直接部署。
2. 插件详情页承担 Get / Redeem 决策，可继续进入 Assign to Studio。
3. Builder 前台的 Get / Redeem 默认进入个人资产；用户在“我的插件”中选择 Space 和 Studio 进行授权分配。
4. Builder 前台不暴露 Personal Workspace / Team Workspace 概念；普通用户只看到“我的空间 / 我的插件 / Credits”。
5. Builder Pro 工作台始终处于当前 Workspace 上下文；授权中心中的兑换、申请、账本和资产默认归当前 Workspace。
6. Pro 的 Personal Workspace 可以把专业人士自己当客户，用个人 Pro 工作区 Credits 兑换高级插件，再分配到自己的 Studio。
7. Pro 的 Team Workspace 由 Owner / Admin / Billing Admin 使用团队 Credits 兑换，资产归 Team Workspace，不随操作者离开而转移。
8. 普通成员或权限不足者只能发起授权申请，由 Owner / Admin / Billing Admin 审批后扣减当前 Workspace Credits。
9. Builder 只管理 Entitlement、Assignment、Credit Ledger、审批和消耗；不管理插件包下载、安装、启用、停用、更新和卸载。
10. Studio 本地负责插件包下载、安装、启用、停用、更新、卸载、运行状态、日志和沙箱权限；Builder 只展示 Studio 回传的运行状态。

**前台个人插件闭环**：

```text
Marketplace
-> 插件详情
-> Get / Redeem 到个人资产
-> 我的插件
-> 选择 Space
-> 选择 Studio
-> Assign 授权给 Studio
-> Studio 本地下载 / 安装 / 运行 / 卸载
```

**Pro 工作区插件闭环**：

```text
进入 Builder Pro 当前 Workspace
-> 授权中心
-> Redeem with Workspace Credits / Request Approval
-> Workspace Assets
-> Assign to Project / Client Space / Studio
-> Studio 本地下载 / 安装 / 运行 / 卸载
-> Builder 记录消耗、项目归属、审批和审计
```

**服务包闭环**：

```text
Marketplace / 授权中心
-> Redeem / Quote / Contract
-> Generate Service Plan
-> 绑定服务对象
-> 创建 Service Session
-> 履约记录 / 报告 / 审计
```

**顶部展示规则**：

| 入口 | 展示对象 | 点击后 |
| --- | --- | --- |
| Credits Usage 图标 | 当前 activeWorkspace 的 Credit Pool | Free 展示 Pro 升级入口；Pro 展示申请加量；Business / Enterprise 展示 Workspace 额度管理 |
| Workspace Switcher | 当前 activeWorkspace | 切换 Workspace，不管理账号 |
| Avatar Menu | 当前 Account | User Settings、My Workspaces、Sign out |

**设置页视角**：

| 页面 | 视角 | 内容 |
| --- | --- | --- |
| User Settings | Account | 个人资料、安全、通知、账号订阅、可访问 Workspace、邀请 |
| My Workspaces | Account -> Workspace list | 用户可进入或创建的 Workspace；展示每个 Workspace 的计划和本人角色 |
| Workspace Settings | activeWorkspace | 当前 Workspace 的计划、AI Credit Pool、成员、权限、已安装权益 |
| Company | activeWorkspace 所属组织 | 组织资料、认证、Team Code、成员申请、服务商标识 |

User Settings 可以展示账号购买的 Personal Plan 与可访问的 Business Plan，但不把 Business Plan 解释为个人订阅。组织套餐在 Workspace Settings / Company 中管理。

**Onboarding 计划选择规则**：

1. Convert to Professional 后先收集专业身份和使用目的；
2. 进入 Pro 前必须确定目标 Workspace；
3. 选择 Personal 时，进入 Personal Workspace，默认保留 Free Plan；Pro 升级由后续使用限制触发；
4. 选择创建团队时，上传 Proof of Business，创建 Company 和默认 Team Workspace，并选择 Business / Enterprise；
5. 创建团队后直接进入新 Team Workspace，不再展示 Workspace Picker；
6. 选择加入团队时，提交 Team Code / 邀请链接，加入成功后直接进入对应 Team Workspace；
7. 只有用户已拥有多个可进入 Workspace，且本次 Onboarding 没有明确创建或加入目标时，才展示 Workspace Picker。

**服务商补贴**：

服务商门店可订阅 Enterprise 计划，并通过 Billing Policy 记录 Aqara 补贴、区域政策或合同优惠。

| 字段 | 示例 |
| --- | --- |
| plan | Enterprise |
| subsidyBy | Aqara |
| subsidyRate | 70% |
| reason | service_provider_enablement |

---

### 4.6 Role、Label 与 Badge

**功能概述**：Workspace Role、人的专业标签和认证 Badge 分离。

**Workspace Role**：

| Role | 说明 |
| --- | --- |
| Owner | 拥有 Workspace、Billing 和成员管理权限 |
| Admin | 管理项目、成员和设置 |
| Billing Admin | 管理计划、发票和 Credits |
| Project Manager | 管理项目和客户交付 |
| Member | 参与项目和任务 |
| Viewer | 只读查看 |

**Person Labels / Badges**：

| 类型 | 示例 | 说明 |
| --- | --- | --- |
| Person Label | Designer / Installer / Developer / Remote Service | 表达人的专业能力 |
| Certification Badge | Certified Installer / Certified Designer | 表达经过 Aqara 或授权体系认证的可信资格 |
| Workspace Label | Design Studio / Service Provider / Aqara Space | 表达团队或组织的业务属性 |

---

### 4.7 Profile 与社区前台

**功能概述**：MVP 阶段社区前台只展示个人主页。未来可扩展 Organization Profile。

**MVP**：

```text
Person
-> Person Profile
```

**未来扩展**：

```text
Organization
-> Organization Profile
-> Team Workspace
```

**内容归属字段**：

| 字段 | 说明 |
| --- | --- |
| createdByPersonId | 实际创作者 |
| publishedByProfileId | 对外发布身份，MVP 默认为个人主页 |
| workspaceId | 内部项目、账本或权限归属，可为空 |

---

## 五、数据模型

### 5.1 Person

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 个人 ID |
| accountId | string | Aqara Account ID |
| personProfileId | string | 个人公开主页 |
| professionalProfileId | string | Professional Profile |
| defaultWorkspaceId | string | Personal Workspace |
| personalCreditPoolId | string | 个人 Credit Pool |

### 5.2 Organization

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 组织 ID |
| name | string | 团队、公司或门店名称 |
| organizationProfileId | string? | 未来组织公开主页 |
| verificationStatus | enum | `unverified` / `pending` / `verified` |

### 5.3 Workspace

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Workspace ID |
| type | enum | `personal` / `team` |
| name | string | 工作区名称 |
| ownerType | enum | `person` / `organization` |
| ownerId | string | Person 或 Organization ID |
| planId | string | 当前订阅计划 |
| creditPoolId | string | Credits 池 |
| labels | array | Workspace 业务标签 |
| billingPolicyId | string? | 补贴、合同或区域政策 |
| status | enum | `active` / `suspended` / `archived` |

### 5.4 WorkspaceMembership

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 成员关系 ID |
| workspaceId | string | 所属 Workspace |
| personId | string | 成员 |
| role | enum | `owner` / `admin` / `billing_admin` / `project_manager` / `member` / `viewer` |
| status | enum | `active` / `invited` / `removed` |

### 5.5 Plan

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `personal_free` / `personal_pro` / `business` / `enterprise` |
| scope | enum | `personal` / `business` |
| name | string | Free / Pro / Business / Enterprise |
| monthlyCredits | number | 每月发放 Credits |
| addOnCreditPackEnabled | boolean | 是否支持购买 Add-on Credits |
| seatsIncluded | number | 包含席位 |
| features | array | 功能权益 |

### 5.6 CreditPool

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Credits 池 ID |
| workspaceId | string | 所属 Workspace |
| balance | number | 当前余额 |
| source | enum | `plan_grant` / `add_on_purchase` / `contract` / `promo` / `manual_grant` / `refund` |
| renewsAt | datetime | 下次发放时间 |
| expiresAt | datetime? | Add-on 或赠送 Credits 到期时间 |

### 5.7 WorkspaceEntitlement

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 权益 ID |
| workspaceId | string | 安装目标 Workspace |
| entitlementType | enum | `plugin` / `template` / `service_package` / `ai_addon` |
| sourceAccountId | string | 支付或领取权益的 Account |
| source | enum | `free` / `credits_redeem` / `plan_included` / `contract` / `manual_grant` |
| status | enum | `active` / `expired` / `revoked` |

---

## 六、非功能需求

| 分类 | 要求 |
| --- | --- |
| 易用性 | 只有一个 Workspace 时不增加进入成本；多个 Workspace 时明确选择 |
| 一致性 | Pro 顶部、项目、Credits、账本、设置均使用当前 Workspace |
| 可恢复 | 记住上次进入的 Workspace |
| 权限 | Workspace Role 决定成员管理、Billing、项目和账本权限 |
| 隐私 | Personal Workspace 与 Team Workspace 的项目、账本和客户资料隔离 |
| 扩展性 | 支持未来 Organization Profile、服务商认证、企业合同和补贴政策 |

---

## 七、埋点与指标

| 指标 | 说明 |
| --- | --- |
| pro_workspace_picker_view | 用户进入 Workspace Picker |
| pro_workspace_selected | 用户选择 Workspace |
| pro_workspace_switched | 用户在 Pro 顶部切换 Workspace |
| pro_workspace_created | 创建 Team Workspace |
| pro_workspace_plan_selected | 创建或升级时选择计划 |
| pro_workspace_label_added | 添加业务标签 |
| pro_workspace_credits_consumed | 当前 Workspace 下 Credits 消耗 |

---

## 八、边界与不展开内容

| 内容 | 说明 |
| --- | --- |
| 组织公开主页 | MVP 只做个人主页，组织主页仅保留模型扩展 |
| 服务商认证后台 | 本 PRD 只定义标签和认证状态，不展开审核工作台 |
| 完整 Billing | 补贴、合同、发票、税务和收款托管由 Billing PRD 展开 |
| 复杂 RBAC | MVP 可先使用 Owner / Admin / Member，后续扩展细粒度权限 |
| 多 Workspace 一组织 | MVP 可一组织一 Workspace，模型保留未来多 Workspace 扩展 |

---

## 九、待确认问题

1. Personal Workspace 的付费计划是否命名为 `Pro`，还是使用 `Plus / Professional` 以避免与 Builder Pro 产品名混淆？
2. Team Workspace 是否提供免费试用期，还是创建时必须选择 Business / Enterprise？
3. Aqara Space 标签是用户申请后人工审核，还是由现有服务商系统同步？
4. 服务商 Enterprise 补贴是否在前台展示，还是仅在内部账务和合同中展示？
5. Workspace Picker 是否每次进入 Pro 都展示，还是仅首次和多 Workspace 用户展示？
