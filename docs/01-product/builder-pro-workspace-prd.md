# Builder Pro Workspace 产品需求文档

| 版本 | 修订说明 | 修订人 | 修订日期 | 备注 |
| --- | --- | --- | --- | --- |
| v1.0 | 初稿 | Jun | 2026.06.04 | 覆盖 Profile、Organization、Workspace、Plan、Credits 与进入 Builder Pro 的工作区选择 |
| v1.1 | 计划命名定版 | Codex | 2026.06.07 | Workspace Type 为 Personal / Team；Plan 为 Free / Pro / Business / Enterprise；用户侧展示 Personal Plans / Business Plans |
| v1.2 | Identity First 更新 | Codex | 2026.06.07 | Builder Pro 是能力层；Professional Profile 与 Subscription / Certification / Workspace 解耦；Free Professional 可进入 Builder Pro |
| v1.3 | Workspace 协作与交付闭环更新 | Codex | 2026.06.14 | 补充 Members 权限与专业标签、线索管理、Marble 3D 预览边界、项目交付、Provisioning Code、Temporary Aqara ID 与客户转移 |

---

## 一、需求背景

Aqara Builder 前台包含社区、个人主页、灵感收藏、Marketplace、个人 Credits 和自有 Studio 体验；Builder Pro 面向专业用户提供项目、客户、Studio 授权、远程服务、团队协作、账本和交付能力。

用户进入 Builder Pro 后，可能只以个人身份工作，也可能加入普通团队、设计工作室、安装团队或 Aqara Space 服务商门店。若把身份、团队、计划、认证和公开主页混在一起，会带来三个问题：

1. 个人订阅和团队订阅边界不清，Credits、账本和项目成本归属容易混乱；
2. 服务商门店容易被建模成特殊账号或特殊工作区类型，后续扩展复杂；
3. 社区前台的 Profile 和 Pro 后台的 Workspace 容易互相污染，普通用户理解成本变高。

因此，Builder Pro 需要建立一套 Workspace-first 的工作台模型：用户仍然是个人，Profile 承担公开身份，Workspace 承担私有工作和计费容器，Plan 作用于 Workspace。Team Workspace 背后必须有 Organization 作为团队、企业或服务商主体；普通团队可以是轻量 Organization，正式企业和服务商在需要认证、合同、补贴、发票时再显性化。

---

## 二、产品定位

Builder Pro Workspace 是专业工作台中的工作空间与计费容器，用于决定当前项目、成员、Credits、Plan、账本、权限和责任归属。

它不是公开主页，也不是组织本身。公开身份由 Person Profile 或未来的 Organization Profile 承担；Workspace 是进入 Builder Pro 后进行项目和服务操作的私有容器。

核心价值：

| 对象 | 价值 |
| --- | --- |
| 个人用户 | 前台个人资产和 Pro 个人工作区自然衔接，个人 Plan 与 Credits 持续有效 |
| Professional 用户 | 可清楚选择以个人还是团队名义工作，避免项目、Credits 和账本归属混乱 |
| 团队 / 服务商 | 通过 Team Workspace 管理成员、计划、项目、共享 Credits 和服务责任 |
| Aqara | 用统一模型承载普通团队、服务商门店、Aqara Space 和未来企业客户 |

---

## 三、设计原则

| 序号 | 原则 | 说明 |
| --- | --- | --- |
| 1 | **用户永远是个人** | Aqara Account 对应 Person；用户可拥有个人工作区，也可加入团队工作区。 |
| 2 | **Profile 与 Workspace 分离** | Profile 用于公开展示和信任，Workspace 用于私有工作、计费和协作。 |
| 3 | **Workspace Type 只保留 Personal / Team** | Personal 表示个人工作区，Team 表示多人协作工作区；服务商、Aqara Space、设计团队等通过 Organization 标签、认证和政策表达。 |
| 4 | **Builder Pro 是能力层** | Builder Pro 不等于套餐、认证等级或用户角色；Professional Identity 与 Subscription 解耦。 |
| 5 | **Plan 作用在 Workspace 上** | Personal Workspace 使用 Personal Plans；Team Workspace 使用 Business Plans。 |
| 6 | **Credits 按 Workspace 分池** | 当前 Workspace 发起的操作默认消耗该 Workspace 的 Credits。 |
| 7 | **Role 管权限，Label 管能力** | Owner / Admin / Member 是 Workspace 权限；Installer / Designer 是人的专业标签或认证。 |
| 8 | **前台降噪，Pro 显性化** | Builder 前台不暴露 Workspace 心智；进入 Builder Pro 后按上下文进入或切换 Workspace。 |
| 9 | **Organization 按需显性化** | 普通 Team Workspace 可只展示团队设置；企业、服务商、Aqara Space、合同、补贴和发票场景展示 Organization Settings。 |
| 10 | **Project 是交付真相源** | 客户、方案、采购、工单、Studio 绑定、验收、Transfer 与售后都沉淀在 Project 下。 |
| 11 | **售前预览与交付设计分离** | Marble 3D 预览用于客户展示、运营和推广；最终落地以方案设计平台的正式设计稿和交付方案包为准。 |
| 12 | **临时身份只服务实施** | Temporary Aqara ID 用于现场实施、调试和验收前托管；服务开通与客户 Claiming 后必须进入转移和清理流程。 |

---

## 四、功能需求

### 4.1 Profile、Organization 与 Workspace 关系

**功能概述**：明确公开身份和私有工作容器的关系。

| 对象 | 说明 | 当前 MVP |
| --- | --- | --- |
| Person | Aqara Account 背后的个人 | 已启用 |
| Person Profile | 个人公开主页，展示作品、简介、专业身份和未来服务信任 | 已启用 |
| Professional Profile | 个人激活 Builder Pro 后的专业身份 | 已启用 |
| Organization | Team Workspace 背后的团队、公司、服务商门店等主体 | 已启用 |
| Organization Profile | 团队或服务商的公开主页 | 未来扩展 |
| Workspace | Builder Pro 私有工作空间 | 已启用 |

**关系定义**：

```text
Person
├─ Person Profile
├─ Professional Profile
└─ Personal Workspace

Organization
├─ Organization Profile
└─ Team Workspace
```

MVP 阶段社区前台只展示 Person Profile。Organization Profile 作为扩展能力预留。Team Workspace 创建时必须同时创建一个轻量 Organization；用户界面可先只展示 Workspace，待企业资料、服务商认证、Aqara Space 标签、合同、补贴或发票能力启用时再显性展示 Organization。

### 4.1.1 Company 标签与显性化规则

**功能概述**：Team Workspace 背后的 Organization 统一建模为 Company。Design Studio、Seven Mi Co., Ltd、Shenzhen Aqara Space 本质都是 Company，不再拆成多套 Organization Kind。业务差异通过资料完整度、认证状态、标签、项目资质和计费政策表达。

| 字段 | 说明 | 示例 |
| --- | --- | --- |
| `type` | 固定为 `company` | `company` |
| `profileStatus` | 公司资料完整度 | `basic` / `complete` |
| `verificationStatus` | 平台认证状态 | `none` / `pending` / `verified` |
| `labels` | 业务标签，可多选 | `design` / `installation` / `service_provider` |
| `programs` | Aqara 官方项目资格 | `aqara_space` / `enterprise_partner` |
| `billingPolicy` | 合同、补贴、账期和区域政策 | `aqara_subsidized` |

展示规则：

| 当前 Workspace | 设置入口 |
| --- | --- |
| Personal Workspace | User Settings、My Workspaces |
| 个人创建的 Team Workspace | User Settings、My Workspaces、Workspace Settings、Company |
| 已认证公司 / 服务商 / Aqara Space / Enterprise | User Settings、My Workspaces、Workspace Settings、Company |

Company 页面管理组织资料、成员、认证、服务区域、公司主页、合同和政策；Workspace 页面只管理当前工作区内的项目、Plan、Credits、账本以及通过项目或服务授权关联的客户 Space / Studio。

**MVP 成员与访问范围规则**：

| 层级 | 作用 | 是否邀请成员 | 说明 |
| --- | --- | --- | --- |
| Company Membership | 定义一个人是否属于该公司 / 团队 / 服务商 | 系统内部创建 | MVP 用户不感知这层，邀请工作区时自动创建 |
| Workspace Access | 定义 Company 成员能访问哪些 Workspace | 是，用户侧入口 | MVP 文案为 Invite to Workspace，授予当前 Team Workspace |
| Project Role | 定义成员在具体项目里的职责 | 否 | 例如 Designer、Installer、Project Manager，只作用于项目 |

规则：

1. MVP 用户侧邀请入口基于 Workspace，文案使用 `Invite to Workspace`；
2. 邀请成功后，系统内部自动创建 Company Membership，并授予该 Workspace 的 WorkspaceAccess；
3. 对普通团队、单门店服务商，Company 与 Team Workspace 在用户感知上等同，不展示 `defaultWorkspace`；
4. Company 页面保留成员治理、Company Role、Join Requests 审核和认证 / 项目资格管理；
5. Team Code 命中 Company，审核通过后授予该 Company 的 Team Workspace；高级场景再允许 Owner / Admin 选择多个 Workspace；
6. User Settings 从当前用户视角展示 My Workspaces，并可对自己拥有 / 管理的 Team Workspace 发起邀请。

### 4.1.2 Workspace Members、Role 与专业标签

**功能概述**：Team Workspace 下可管理 Members。Member 权限由 Workspace Role 决定，专业能力由 Labels / Badges 表达。Role 与 Label 必须正交，避免把 Designer、SE、Developer 建模成权限角色。

| 类型 | 作用 | 示例 | 是否可多选 |
| --- | --- | --- | --- |
| Workspace Role | 决定当前 Workspace 内的管理和访问权限 | Owner / Admin / Project Manager / Member / Viewer | 否 |
| Professional Label | 描述成员在项目中的专业分工 | Designer / SE (Installer) / Developer / Sales / Support | 是 |
| Badge / Credential | 描述平台认证或可信资格 | Aqara Certified / Installer Level 2 / Automation Specialist | 是 |
| Project Role | 描述成员在某个项目里的职责 | Project Manager / Lead Designer / Assigned SE / QA Reviewer | 是 |

**默认权限建议**：

| Role | Members 管理 | Project 管理 | Lead 管理 | Financials | Company Settings |
| --- | --- | --- | --- | --- | --- |
| Owner | 全部 | 全部 | 全部 | 全部 | 全部 |
| Admin | 邀请、编辑、移除 | 全部 | 全部 | 查看 / 操作授权范围内 | 编辑 |
| Project Manager | 指派项目成员与工单 | 全部 | 可转项目 | 查看项目相关 | 只读 |
| Member | 不可管理成员 | 参与被授权项目 | 只读或无 | 无 | 只读 |
| Viewer | 不可管理成员 | 只读 | 只读或无 | 无 | 只读 |

**专业标签规则**：

1. `Designer` 可负责方案设计、3D Floor Plan Design、自动化场景设计、BOM 输出和方案包确认；
2. `SE (Installer)` 可被派发安装工单，进入现场实施模式，生成 Provisioning Code，并提交验收；
3. `Developer` 可负责 Driver、Plugin、Automation Script、系统集成和高级调试；
4. 同一成员可同时拥有多个标签，例如 `Designer + Project Manager`；
5. 标签不自动授予敏感权限；敏感操作仍由 Role、Project Role 和认证状态共同决定；
6. 成员标签可用于筛选、派单、项目看板展示和 KPI 统计。

### 4.1.3 Company 与 User Settings 边界

**功能概述**：Company 与 User Settings 不重叠。User Settings 管个人账号和个人偏好；Company 管团队、公司或服务商主体。Personal Workspace 下没有 Company 主体。

| 页面 | 管理对象 | 典型内容 | 可见范围 |
| --- | --- | --- | --- |
| User Settings | Person / Aqara Account | 个人资料、登录安全、通知偏好、语言、个人用量入口、My Workspaces、My Invites | 所有登录用户 |
| Company | Team Workspace 背后的 Company | 公司资料、成员、认证、服务区域、官方项目资格、服务目录、合同 / 补贴政策 | Team Workspace 成员 |

**不同上下文显示规则**：

| 当前上下文 | Company 入口 | Company 页效果 | User Settings 效果 |
| --- | --- | --- | --- |
| Personal Workspace | 不在主导航展示 | 直接访问时显示 No Company Attached，引导创建或加入 Team Workspace | 展示完整个人账号、个人用量、My Workspaces |
| 个人创建的 Team Workspace Owner | 展示 Company | 可编辑基础公司资料、管理成员角色和服务标签；认证和官方项目为空或 pending | 仍从个人账号视角展示 My Workspaces，可对自己拥有的 Workspace 发起邀请 |
| 普通 Team Workspace Member | 展示 Company | 只读查看公司资料、成员、认证；不能邀请成员或修改公司资料 | 管理自己的账号、通知、个人工作区 |
| 服务商 / Aqara Space Owner 或 Admin | 展示 Company | 可管理公司资料、成员、服务区域、认证、官方项目资格、合同 / 补贴政策 | 管理个人账号和个人设置 |
| 服务商 / Aqara Space Member | 展示 Company | 只读查看门店 / 公司资料、项目资格、成员；不能改认证或政策 | 管理个人账号和个人设置 |

**权限规则**：

1. Company 的编辑权只给 Company 的 `owner`、`admin`、`billing_admin`；
2. `member`、`project_manager`、`viewer` 默认只读 Company；
3. User Settings 永远只作用于当前 Person，不修改 Company；
4. Company 不作为 Workspace Switcher 的管理入口；
5. Personal Workspace 不创建 Company 对象。

### 4.2 Workspace 类型

**功能概述**：Workspace Type 只回答“个人还是多人协作”。

| Workspace Type | 说明 | 创建规则 |
| --- | --- | --- |
| Personal | 每个 Person 默认拥有的个人工作区 | 系统自动创建 |
| Team | Organization 下的团队工作区，可承载普通团队、公司、服务商门店、Aqara Space 或企业客户 | 用户创建普通团队、成员加入、官方创建/迁移或审核生成 |

Team Workspace 的业务差异通过标签、认证和政策表达。

| 示例 | Type | Labels | Verification | Plan |
| --- | --- | --- | --- | --- |
| Design Studio | Team | Design, Installation | Unverified | Team |
| Seven Mi Co., Ltd | Team | Service Provider, Design, Installation | Verified | Enterprise |
| Shenzhen Aqara Space | Team | Service Provider, Aqara Space, Installation | Verified | Enterprise |

MVP 阶段用户感知为一个 Company 对应一个 Team Workspace：

```text
Organization
└─ Team Workspace
```

系统内部可保留 `defaultWorkspaceId` 作为 Team Code、首次进入和兼容多 Workspace 的映射字段，但 MVP UI 不展示该概念。未来可扩展为一个 Organization 对应多个 Workspace，例如 Delivery Workspace、Training Workspace、Enterprise Pilot Workspace。多 Workspace 仍然属于同一个 Organization，不创建新的公司主体。

**Organization 多 Workspace 规则**：

| 场景 | 规则 |
| --- | --- |
| 内部映射 | 每个 Organization 保留 `defaultWorkspaceId`，用于 Team Code 默认加入和首次进入；MVP UI 不展示 |
| 多工作区 | 一个 Organization 可拥有多个 Team Workspace，用于不同门店、项目组、区域、试点或运营单元 |
| 团队管理 | Organization 资料、成员、认证、服务区域和 Company Profile 统一通过 `Company` 管理 |
| 工作区管理 | Workspace 只管理当前工作容器内的项目、Credits、Plan、账本和对客户 Space / Studio 的服务关系 |
| 切换行为 | Workspace Switcher 只切换当前工作区，不进入团队/组织管理 |
| 加入组织 | Team Code 命中 Organization；MVP 审核通过后授予该 Company 的 Team Workspace；多 Workspace 场景由管理员选择授权范围 |

### 4.2.1 Workspace、Space 与 Studio

**功能概述**：Studio 是物理/本地运行时，挂在 Aqara Life / Studio Cloud 的 Space 下。Workspace 不拥有 Studio，也不创建 Studio 槽位；Workspace 只是 Builder Pro 的业务容器，通过 Project、服务授权、Operator Grant 或交付记录看到相关 Space / Studio。

| 对象 | 说明 |
| --- | --- |
| Workspace | Builder Pro 私有业务容器，决定项目、成员、Credits、Plan、账本和操作范围 |
| Space | Aqara Life / Studio Cloud 里的家庭或项目运行空间，承载 Studio 与设备 |
| Studio | 具体运行时设备或云端运行环境，归属于某个 Space |
| Project | Builder Pro 中连接 Workspace 与客户 Space / Studio 的业务对象 |

**可见规则**：

1. 新建 Team Workspace 不创建 Studio，也不初始化 Studio 槽位；
2. Studio 必须挂在 Space 下，Space 可以是用户自己的家、客户的家、项目临时 Space 或企业/门店 Space；
3. Builder Pro Workspace 通过 Project、服务授权、验收转移或 Operator Grant 看到相关 Studio；
4. 同一个 Workspace 可服务多个客户 Space / Studio，但这不是“Workspace 拥有多个 Studio”；
5. Settings 中不使用 `Studios in Workspace`，应使用 `Project Studios`、`Service Access` 或 `Customer Spaces`；
6. Studio License、SMS Alert License 等应按 Studio / Space / 合同归属计费，在 Builder Pro 中按当前 Workspace 的项目或服务关系汇总展示。

### 4.2.2 项目交付中的 Studio 与临时 Space

**功能概述**：Studio 在 Builder Pro 中主要围绕客户项目发生。安装交付阶段，平台为项目创建临时虚拟 Space，安装工把现场 Studio 和设备先绑定到临时 Space，验收后再转移到客户的 Aqara Life Space。

| 对象 | 说明 |
| --- | --- |
| Project | 客户项目，承载方案、图纸、设备清单、施工状态、验收和转移记录 |
| Implementation Session | 安装工在移动端点击“开始施工”后产生的现场实施会话 |
| Temporary Space | Studio Cloud 为项目创建的临时虚拟 Space，用于施工、调试和验收前托管 |
| Studio | M300 Studio 或云端 Studio，施工期间绑定到 Temporary Space |
| Deployment Package | 从方案设计生成的可下发包，包含房间、设备点位、自动化、场景和校验 Hash |
| Virtual-Physical Binding | 虚实绑定，把方案中的虚拟点位与现场真实设备进行映射 |
| Acceptance Request | 安装完成后发起的验收请求和证据链 |
| Transfer | 验收后把 Temporary Space 及其 Studio 转移给客户 Space |
| Operator Grant | 客户确认后，授予设计者或服务商后续服务权限 |

**交付流程**：

| 步骤 | 触发方 | 平台动作 | 项目状态 |
| --- | --- | --- | --- |
| 1. 开始施工 | 安装工移动端选择项目并点击开始施工 | 创建 Implementation Session，请求 Studio Cloud 创建 Temporary Space | `installing` |
| 2. 现场准备 | 安装工查看图纸并按房间分拣设备 | 记录房间、设备包和施工检查项 | `installing` |
| 3. Studio 上电入网 | 安装工给 M300 Studio 上电并检查设备健康 | 绑定 Studio 到 Temporary Space，记录健康检查 | `installing` |
| 4. 批量入网 | 安装工通过移动端实施工具批量接入设备 | 设备进入 Temporary Space 下的 Studio | `device_onboarding` |
| 5. 部署方案 | 项目方案页点击 Deploy | 选择 Studio、拉取设备、自动匹配方案点位、现场验证、人工确认映射、下发方案到 Studio | `deploying` |
| 6. 发起验收 | 安装工或项目负责人 | 汇总部署 Hash、设备清单、绑定映射、现场照片和测试结果 | `acceptance_pending` |
| 7. 转移给客户 | 平台 / 客户确认 | Temporary Space 转移为客户 Aqara Life Space；Studio 跟随 Space 转移 | `delivered` |
| 8. 后续服务授权 | 客户在 Aqara Life App 确认 | 授予设计者、安装团队或服务商 admin/member/operator 权限 | `service_active` |

**部署方案子流程**：

```text
选择 Studio
→ 拉取 Studio 设备
→ 虚实绑定：自动匹配方案点位 → 现场验证
→ 校验：人工确认映射
→ 下发方案到 Studio
```

**业务规则**：

1. 施工期间的 Studio 不直接进入客户正式 Space，避免客户提前看到未验收的半成品；
2. Temporary Space 归属项目，由当前 Workspace 可见和操作；
3. 验收完成前，Studio 与设备仍处于服务交付态；
4. 转移完成后，客户登录 Aqara Life App 自动获得新的 Space 以及 Space 下的 Studio；
5. 设计者或服务商希望继续服务客户时，必须通过客户确认获得 Space 管理员、成员或 Operator 权限；
6. Builder Pro 的 Project 页面展示部署、验收、转移和后续服务状态；Workspace Settings 只汇总当前工作区通过项目或服务授权关联的客户 Space / Studio 和许可证。

### 4.2.3 线索管理、Marble 3D 预览与项目转化

**功能概述**：Workspace 下统一管理线索。线索可以来自官网表单、Life App 询单、门店转介、社区内容、运营活动、客户推荐或手动录入。线索转化后创建 Project，并关联客户 Aqara Account。

| 阶段 | 对象 | 主要内容 | 输出 |
| --- | --- | --- | --- |
| 线索收集 | Lead | 客户姓名、联系方式、城市、户型、预算、需求标签、来源、响应 SLA | Lead Profile |
| 客户沟通 | Lead Activity | 电话、消息、上门勘测、需求附件、预算确认 | Qualification |
| 售前呈现 | Marble 3D Preview | 基于 Marble 的 3D 效果展示，用于客户演示、运营和推广 | Preview Link / Media Asset |
| 成交转化 | Project | 关联客户 Aqara Account，生成项目、报价、合同、排期 | Project Passport |
| 正式设计 | Design Platform | 创建 3D Floor Plan Design、自动化场景、设备清单和价格 | Delivery Package |

**Marble 3D 预览边界**：

1. Marble 3D 预览仅用于售前演示参考、运营推广和激发客户兴趣；
2. Marble 3D 预览不作为施工交付依据；
3. Marble 3D 预览不作为设备点位、物料清单、网络部署和现场安装的最终基准；
4. 最终落地方案以「方案设计平台」的正式设计稿为准；
5. 方案设计平台输出的正式交付方案包应包含 3D Floor Plan Design、自动化场景、设备清单、价格、部署包版本和校验 Hash；
6. 从 Lead 转 Project 时，Marble 预览可以作为客户沟通资产沉淀在 Project 下，但不能直接变成 Deployment Package。

### 4.2.4 项目全生命周期与 Workspace 工作台

**功能概述**：项目关联客户 Aqara Account 后，Workspace 需要覆盖从方案规划、采购、实施、诊断验收、服务开通到客户转移的全流程。Builder Pro 工作台应优先展示跨项目的状态、风险和待办，而不是通用任务列表。

| 阶段 | 主要负责人 | 核心动作 | Builder Pro 工作台展示 |
| --- | --- | --- | --- |
| 方案规划 | Designer / Project Manager | 创建 3D Floor Plan Design、自动化场景、设备清单和价格 | 待设计、待确认、设计包版本 |
| 设备采购 | Project Manager / Admin | 订单、备货、提货、发货、到货核验 | 采购状态、缺货风险、到货时间 |
| 方案实施 | Project Manager / SE (Installer) | 派发安装工单、现场准备、Studio 上电、设备入网 | Installer Work Orders、现场状态、绑定进度 |
| 方案同步 | SE (Installer) / Designer | 现场 Studio 设备与设计方案进行逻辑映射，解决 Diff 并下发方案 | Mapping Diff、待确认冲突、部署包 Hash |
| 诊断验收 | SE (Installer) / Project Manager | 诊断、测试、上传凭证、提交验收 | Pass/Fail、证据链、验收请求 |
| 服务开通 | Project Manager / Admin | 审核 SE 实施结果，决定是否开通插件服务 | 待审核、服务开通建议 |
| 客户转移 | Customer / Aqara Cloud | 客户 Claiming 后将 Studio 转移到客户 Aqara Account | Ready for transfer、Transferred、待评价 |

**工作台设计要求**：

1. 首页顶部应展示当前 Workspace 的交付阶段概览：Leads / Design / Procurement / Install / Acceptance / Transfer；
2. Team Workspace 应显示 Members 与其 Role / Labels，便于派单；
3. 安装工单必须突出 Assigned SE、现场日期、Provisioning Code 状态、Studio 绑定状态和验收状态；
4. 项目卡片除客户、状态外，应展示下一步动作，例如“现场实施进行中”“待服务开通”“已转移 / 待评价”；
5. 线索模块应支持快速发送 Marble 3D 预览；
6. 工作台不应把 Workspace 设置、Company 设置和 Project 执行混成一个入口；Workspace 是作用域，Project 是执行容器。

### 4.2.5 Provisioning Code、Temporary Aqara ID 与账号转移

**功能概述**：SE (Installer) 到达现场后，通过 Aqara Life App 工程师隐藏菜单或独立 SE/Installer App 登录个人 Aqara Account，选择被指派项目并开始实施。系统生成唯一 Provisioning Code，并同步创建 Temporary Aqara ID，用于现场 Studio 绑定、设备入网、方案同步和验收前托管。

| 对象 | 说明 | 记录方 |
| --- | --- | --- |
| Provisioning Code | 单次实施授权码，写入 Studio 完成授权绑定 | Builder + Studio Cloud |
| Temporary Aqara ID | 施工期间用于承载 Studio 的临时账号 | Studio Cloud |
| Implementation Session | SE 点击开始实施后的现场会话 | Builder |
| Transfer Backlog | Temporary ID 到客户账号的待转移记录 | Aqara Cloud |
| Customer Aqara ID | 客户最终拥有 Studio 的账号 | Aqara Cloud / Builder 关联 |

**现场实施流程**：

| 步骤 | 操作 | 系统动作 | 状态 |
| --- | --- | --- | --- |
| 1. 指派工单 | Project Manager 指派给已加入 Workspace 的 SE | 写入 Project Role 与 Work Order | `assigned` |
| 2. 开始实施 | SE 登录个人 Aqara Account 并选择项目 | 创建 Implementation Session | `started` |
| 3. 生成授权 | SE 点击开始实施 | 生成唯一 Provisioning Code；创建 Temporary Aqara ID；记录 `issued_at` | `provisioning_issued` |
| 4. Studio 初始化 | SE 通过 MagicPair 发现 Studio，配置 Wi-Fi，写入 Provisioning Code | Studio 接入 Aqara Cloud，绑定到 Temporary Aqara ID | `studio_bound` |
| 5. 现场入网 | SE 按房间安装设备并入网到 Studio | 记录已入网设备清单和房间进度 | `device_onboarding` |
| 6. 方案同步 | SE 点击方案同步 | 现场设备与设计方案逻辑映射，自动替换设备 ID；冲突进入 Diff 处理 | `mapping` |
| 7. 方案下发 | SE 确认映射后下发方案 | 更新本地 Studio 主机方案 | `deployed` |
| 8. 诊断验收 | SE 执行诊断、上传凭证、提交验收 | Temporary Aqara ID 进入 `expired`，记录 `expire_at` | `acceptance_submitted` |
| 9. 审核开通 | Project Manager 审核并开通插件服务 | Studio 进入 `ready_for_transfer` | `service_pending` |
| 10. 客户 Claiming | 客户 30 天内用 Customer ID 登录 App | Studio 从 Temporary Aqara ID 转移到 Customer Aqara ID | `transferred` |
| 11. 临时账号删除 | 转移完成或超时清理 | Temporary Aqara ID 进入 `deleted`，记录删除时间 | `deleted` |

**关系表要求**：

| 系统 | 必须记录 |
| --- | --- |
| Studio Cloud / IoT 表 | Temporary Aqara ID、SE Aqara ID、Customer Aqara ID、Studio SN、issued_at、expire_at、transfer status |
| Builder 表 | Workspace ID、Project ID、Customer Aqara ID、Assigned SE、Provisioning Code 摘要、Implementation Session、Project Studio 状态 |
| Transfer Backlog | SE Aqara ID、Temporary Aqara ID、Customer Aqara ID、temporary ID creation time、transfer time、temporary ID deletion time、is_transferred |

**Temporary Aqara ID 生命周期**：

```text
issued → expired → ready_for_transfer → transferred / not_transferred → deleted
```

**Builder Pro 项目侧状态映射**：

| Studio / 账号状态 | Builder Pro 展示 |
| --- | --- |
| Studio 绑定到 Temporary Aqara ID，设备入网中 | 实施交付中 / 未完成 |
| SE 提交验收，Temporary Aqara ID 已 expired | 实施完成 / 待开通服务 |
| Project Manager 审核确认，Studio ready for transfer | 待客户 Claiming |
| 客户 Claiming 并完成转移 | 已转移 / 待评价 |
| Temporary Aqara ID 超期未转移 | 转移超时 / 待处理 |

**安全与合规规则**：

1. Provisioning Code 必须唯一、短期有效、只绑定一个 Project 和一次 Implementation Session；
2. SE 只能看到指派给自己的项目；
3. Temporary Aqara ID 不应作为用户可登录账号暴露给客户或 SE；
4. 退出实施模式后，SE 不再拥有 Temporary Aqara ID 下 Studio 的操作入口；
5. 客户转移成功后，Temporary Aqara ID 必须进入 `deleted` 待清理状态；
6. Builder Pro 只展示必要状态和审计链，不暴露可复用的完整授权码明文；
7. 客户最终进入 Aqara Life 的“我的家 / Space”后，引导开启空间智能体验，Studio 显示为已就绪。

### 4.2.6 B 端 Site Management 与项目维度托管

**功能概述**：在 B 端项目中，新建 Project 不一定先关联家庭客户，也不一定最终转移到某个个人 Customer Aqara ID。项目可能是酒店、公寓、学校、办公室、门店、展厅或大型园区。此时需要引入 `Site` 作为运行托管容器，统一管理本地 Studio、设备、网络、楼栋、楼层、区域、服务权限和运维状态。

**核心判断**：Customer Space 解决“家庭用户最终拥有”的问题；Site 解决“B 端项目长期托管和运维”的问题。二者都可以由 Project 创建和管理，但不能互相替代。

| 对象 | 适用场景 | 是否必须关联客户 | Studio 最终归属 |
| --- | --- | --- | --- |
| Customer Space | 家庭用户、别墅、公寓业主项目 | 通常需要 | Customer Aqara ID / Customer Space |
| Project Site | 酒店、办公楼、学校、门店、园区、公寓运营方 | 不一定 | Organization / Enterprise / Site Owner |
| Temporary Aqara ID | 现场实施、调试、验收前托管 | 间接关联 | 临时托管，必须转移或清理 |

**Site 与 Project 的关系**：

```text
Workspace
└─ Project
   ├─ Customer?（可选）
   ├─ Site?（B 端项目可先创建）
   ├─ Design Package
   ├─ Implementation Sessions
   └─ Service / Operations Records
```

**Site 信息结构**：

| 模块 | 内容 |
| --- | --- |
| Site Profile | 名称、类型、地址、业主 / 运营方、服务等级、所属 Workspace |
| Site Topology | 楼栋、楼层、区域、房间、机房、弱电间、网络分区 |
| Studio Fleet | 本地 Studio 主机、序列号、在线状态、固件、License、绑定关系 |
| Device Inventory | 设备清单、房间归属、入网状态、健康状态、替换记录 |
| Access Control | Site Owner、Workspace Operator、SE 现场权限、运维权限 |
| Operations | 告警、巡检、远程诊断、服务工单、变更记录 |
| Transfer / Handover | 是否转移给客户组织、是否保留 Operator Grant、交接凭证 |

**B 端项目规则**：

1. Project 可以先创建 Site，再补充客户、业主、运营方或合同主体；
2. Site 不是 Workspace。Workspace 是团队工作容器，Site 是项目运行对象；
3. Site 不是 Customer Space。Site 可映射到企业 / 组织级 Space，但不默认属于个人客户账号；
4. Studio 在 B 端项目中应优先挂到 Site 下，再按楼栋、楼层、区域组织；
5. Temporary Aqara ID 仍可用于现场实施，但验收后可转移到 Customer Aqara ID、Organization Aqara ID 或 Site Owner 账号；
6. B 端项目的售后运维不是“待评价”结束，而是进入 Site Operations，包括健康监控、巡检、告警、插件服务和 SLA；
7. Builder Pro 工作台应显示 Site Management 入口，用于查看 Project Sites、Studio Fleet 和 Operations，而不是只显示客户 Transfer。

**工作台优化要求**：

| 页面区域 | C 端项目重点 | B 端项目重点 |
| --- | --- | --- |
| 顶部阶段 | Leads / Design / Install / Acceptance / Transfer | Project / Site / Design / Procurement / Install / Operations |
| 项目卡片 | 客户、家庭、转移状态 | Site、楼栋 / 区域、Studio Fleet、SLA |
| 实施面板 | SE 工单、Temporary ID、客户 Claiming | SE 工单、Site Studio 绑定、组织交接、运维状态 |
| 右侧快捷入口 | Lead、Customer、Marble Preview | Site、Studio Fleet、Service Ticket |
| 完成态 | 已转移 / 待评价 | 已交接 / 运维中 |

### 4.3 Workspace Plan

**功能概述**：Plan 作用在 Workspace 上。用户侧按 Personal Plans 和 Business Plans 展示；系统内部按 `scope: personal | business` 管理。`Personal` 和 `Team` 是 Workspace Type，不作为 Plan 名称。

**命名定版**：

| 层级 | 用户看到 | 系统内部 | 说明 |
| --- | --- | --- | --- |
| 产品层 | Aqara Builder / Aqara Builder Pro | `product = builder / builder_pro` | Builder Pro 是能力层，不是 Plan 名称 |
| Workspace Type | Personal / Team | `workspace.type = personal / team` | 决定个人还是多人协作容器 |
| Personal Plans | Free / Pro | `plan.scope = personal`，`plan.id = free / pro` | 绑定 Personal Workspace |
| Business Plans | Business / Enterprise | `plan.scope = business`，`plan.id = business / enterprise` | 绑定 Team Workspace |

**计划目录**：

| Workspace | 可选 Plan | 用户入口 | 说明 |
| --- | --- | --- | --- |
| Personal Workspace | Free / Pro | Pricing、Builder 前台头像菜单、User Settings、Credits 中心 | 面向个人前台、个人 Credits、自有 Studio、个人 Pro 工作台 |
| Team Workspace | Business / Enterprise | Workspace Picker、My Workspaces、Workspace Settings | 面向多人协作、共享 Credits、成员权限、项目账本、服务商或企业能力 |

**命名禁用规则**：

1. 不使用 `Individual Plans` 作为用户侧文案；
2. `Team` 只作为 Workspace Type，不作为计费计划名称；
3. 不使用 `Personal` 作为 Plan 名称；
4. `Pro` 是 Personal Plan 名称，不等于 Builder Pro 产品，也不等于 Certified 认证；
5. Team Workspace 默认可使用 Business Plan，Enterprise 作为升级、服务商或合同计划。

服务商补贴、渠道合同和区域政策不创建新 Plan，通过 Billing Policy 叠加。

| 字段 | 示例 |
| --- | --- |
| plan | Enterprise |
| billingPolicy.type | aqara_subsidized |
| subsidyRate | 70% |
| reason | service_provider_enablement |

### 4.3.1 统一会员中心与 AI 用量

**功能概述**：Life App、Builder 前台、Builder Pro、Design Platform 都可以登录同一个 Aqara Account，并通过模型网关消耗 AI Credits。现场实施工具属于 Builder Pro 的移动端工具，不作为独立产品线。Plan 仍然作用在 Workspace 上，但不同端的用户心智不同：Life App 只展示账号与 Space（家），不展示 Workspace；Builder Pro 才显性展示 Workspace。

**核心结论**：

| 问题 | 规则 |
| --- | --- |
| 会员是否跨端可用 | 是。用户在任意端订阅后，权益写入对应 Workspace 的 Credit Pool，各端通过同一模型网关消费 |
| Life App 用户感知 | 只感知 Aqara Account 与 Space（家），不展示 Personal Workspace |
| Life App 系统归属 | 模型网关内部将该账号解析到默认 Personal Workspace 的 Credit Pool |
| Builder 前台默认消耗哪里 | 默认消耗 Personal Workspace；进入 Pro 后按当前 Workspace 消耗 |
| Team Workspace 如何消耗 | 当前 Workspace 是 Team 时，消耗 Business / Enterprise 的共享池或合同额度 |
| 服务商如何加量 | Owner / Billing Admin 可在用量中心申请加量；Aqara 运营后台审批并发放 Grant / Contract Quota |
| 模型网关如何限流 | 每次 AI 请求必须带 Account、Client App、Resolved Workspace、Feature Key、Token Cost 和 Idempotency Key |

**端侧心智边界**：

| 端 / 工具 | 用户心智 | 用户看到 | 系统内部归属 |
| --- | --- | --- | --- |
| Aqara Life App | 我账号下的家 | Account、Space / Home、设备、自动化、AI 对话 | Account -> Personal Workspace -> Credit Pool |
| Builder 前台 | 我的个人内容与用量 | 个人主页、社区、Marketplace、个人用量 | Account -> Personal Workspace -> Credit Pool |
| Builder Pro | 当前工作区里的业务 | Workspace、项目、客户、团队、账本、用量 | activeWorkspace -> Credit Pool |
| Builder Pro 实施工具 | 当前项目的现场交付 | 项目、施工任务、客户 Space、Studio | Project -> Workspace -> Credit Pool |

**展示边界**：

| 端 / 工具 | 不展示 | 说明 |
| --- | --- | --- |
| Aqara Life App | Workspace、Personal Workspace、Team Workspace | Life App 只使用 Account 与 Space / Home 心智 |
| Builder 前台 | Workspace Switcher | 前台可展示个人用量，但不展示 Workspace 概念 |
| Builder Pro | Life App 的“家”作为计费主体 | Pro 中计费和协作主体是 Workspace |
| Builder Pro 实施工具 | Workspace 管理、Company 管理、Plan 管理 | 实施工具只服务当前 Project 的现场交付 |

**模型网关消费解析**：

| Client App | 场景 | Resolved Credit Pool |
| --- | --- | --- |
| Aqara Life App | 家庭 AI 对话、设备解释、自动化建议 | Account 默认 Personal Workspace Credit Pool（仅系统内部） |
| Builder 前台 | 社区创作、Marketplace 辅助、个人内容生成 | Personal Workspace Credit Pool |
| Builder Pro | 项目、客户、Studio 交付、方案生成 | 当前 activeWorkspace 的 Credit Pool |
| Design Platform | 带 Project 上下文 | Project 所属 Workspace Credit Pool |
| Builder Pro 实施工具 | 现场交付、虚实绑定、验收报告 | Project 所属 Workspace Credit Pool |

**早期策略**：

1. Life App 初期不在入口处强提示次数；
2. 模型网关仍必须记录并扣减用量；
3. 当额度不足时，在 AI 对话内展示“本周期用量不足”，并提供跳转到 Builder 用量中心或联系客服的入口；
4. Builder 顶部展示圆形用量入口：Free 展示 Pro 升级入口；Pro 展示申请加量；Business / Enterprise 展示 Workspace 额度管理；
5. 服务商早期可提交人工加量申请，运营确认后发放临时 Grant；
6. 所有加量都必须写入 CreditGrant / CreditPool 事件，不能只改 UI 数字。

**Personal Free 前台额度**：

| 项目 | 额度 |
| --- | --- |
| 周期 | 每周额度 |
| Welcome Credits | 100，一次性 |
| AI 助手 | 30 次 / week |
| 空间理解 | 5 次 / week |
| 方案生成 | 3 次 / week |
| 3D / 视觉生成 | 1 次 / week |

规则：

1. Free 额度用于 Builder 前台和 Life App 的轻量 AI 体验；
2. Free 不支持完成完整商业项目或批量生成；
3. Builder 前台展示 Personal Credit Pool，但不暴露 Personal Workspace；
4. 升级 Pro 后，Personal Workspace 进入 Pro 月度额度；
5. Business / Enterprise 使用 Team Workspace 的共享额度或合同额度。

**MVP 付费 / 开通规则**：

| 场景 | 当前 MVP 行为 | 未来支付接入 |
| --- | --- | --- |
| Free -> Pro | 进入 Professional Onboarding，完成后提交/获得 Pro entitlement | Onboarding 后进入 Checkout，支付成功后激活 Pro entitlement |
| Pro 个人加量 | 不展示 Upgrade；展示申请加量入口，由运营发放 `manual_grant` | 支持购买 Personal Add-on Credits |
| 创建 Team Workspace | 选择 Business / Enterprise，创建后进入 Workspace | 在 Plan & Licenses 中完成组织支付、续费、升级或合同确认 |
| Business / Enterprise 加量 | Owner / Admin / Billing Admin 申请加量 | 支持 Shared Add-on Credits、自助续费或合同额度 |

**用量中心展示**：

| 信息 | 说明 |
| --- | --- |
| 本周期额度 | 当前计费周期和总用量 |
| 分类用量 | AI 助手、空间理解、方案生成、3D / 视觉生成 |
| 剩余额度 | 每个功能的剩余次数或 Token |
| 申请加量 | 用户填写希望增加的次数 / Token；Owner 或 Billing Admin 可提交 |
| 审批结果 | Pending / Approved / Rejected / Granted |

**Credit Pool 分类**：

| 分类 | 覆盖场景 | 端侧示例 |
| --- | --- | --- |
| AI 助手 | 对话、问答、设备意图理解、场景 / 自动化草稿生成 | Life App AI 对话、设备查询、控制建议；Builder / Pro Copilot |
| 空间理解 | 户型图解析、房间识别、点位抽取、图片 / 文档理解 | Builder 解析户型图、项目资料、现场照片 |
| 方案生成 | 设备方案、自动化方案、场景方案、项目设计包生成 | Builder 做全屋方案、Pro 生成客户方案、Design Platform 生成点位和规则 |
| 3D / 视觉生成 | 3D Marble、空间预览、渲染、视觉方案图 | Builder 3D Marble、方案视觉预览、客户展示图 |

**分类规则**：

1. 直接设备控制命令本身不消耗 Credits；只有调用 AI 模型进行理解、规划、生成时才消耗；
2. Life App 中“创建自动化 / 创建场景”的 AI 过程归入 `AI 助手`，不单独拆分自动化额度；
3. Builder 中完整方案、规则包、设备清单、点位建议归入 `方案生成`；
4. 户型图、现场照片、图纸和项目资料解析归入 `空间理解`；
5. Marble、3D、渲染和视觉输出归入 `3D / 视觉生成`；
6. 具体功能可在 UsageEvent 中记录 `featureKey`，但用量中心不展示过细 feature。

### 4.4 Workspace Picker

**功能概述**：Workspace Picker 是多工作区兜底入口，不是 Onboarding 的固定最后一步。用户刚在 Onboarding 中确定个人、创建团队或提交加入申请时，应直接进入对应上下文。

**入口**：

- Builder 前台点击 `进入 Builder Pro`
- 直接访问 `/pro` 且没有 activeWorkspace
- Pro 顶部 Workspace Switcher 中点击 `All Workspaces`

**展示内容**：

| 信息 | 说明 |
| --- | --- |
| Workspace Name | Personal、Design Studio、Seven Mi Co., Ltd 等 |
| Type | Personal / Team |
| My Role | Owner / Admin / Member |
| Plan | Free / Pro / Business / Enterprise |
| Labels | Aqara Space、Service Provider、Design 等 |
| Credits | 当前可用 Credits 或 Contract |

**交互规则**：

1. 只有一个 Personal Workspace 时可直接进入 Pro 首页；
2. 直接访问 `/pro`、没有 activeWorkspace、且拥有多个 Workspace 时展示 Workspace Picker；
3. 选择 Workspace 后进入对应 Pro 工作台，并记录为 lastActiveWorkspace；
4. Pro 顶部始终提供 Workspace Switcher；
5. `New Workspace` 只创建 Team Workspace。
6. Onboarding 创建团队后直接进入新 Team Workspace；
7. Onboarding 加入团队待审核时直接进入 Personal Workspace，并展示 pending 状态。

### 4.5 New Workspace

**功能概述**：用户可以创建新的普通 Team Workspace。产品入口叫 New Workspace，底层同时创建轻量 Company 和一个 Team Workspace。MVP 不在界面展示 Company 与 Workspace 的双层结构，用户感知为“创建一个团队工作区”。

**字段**：

| 字段 | 是否必填 | 说明 |
| --- | --- | --- |
| Workspace / Team Name | 是 | 团队、公司或工作室名称 |
| Subscription Plan | 是 | Business / Enterprise |
| Proof of Business | 是 | 营业执照、工商证明、门店证明、业务资质或等价材料 |
| Labels | 否 | Design、Installation、Development、Remote Service 等 |

**交互流程**：

1. 用户点击 `New Workspace`；
2. 输入团队或企业名称；
3. 上传 Proof of Business；
4. 选择 Business 或 Enterprise；
5. 可选择普通业务标签；
6. 点击 Create；
7. 系统创建轻量 Company，默认状态为 `pending_verification`；
8. 系统创建 Team Workspace；
9. 系统创建 Owner 的 Company Membership 与 WorkspaceAccess；
10. 进入新 Workspace 的 Pro 工作台。

创建结果：

```text
Organization
- type: company
- profileStatus: basic
- verificationStatus: none
- labels
- programs: []
- defaultWorkspaceId（系统内部，不在 MVP UI 展示）

Workspace
- type: team
- organizationId
- plan

WorkspaceAccess
- role: owner
- source: created
```

Aqara Space、Service Provider、企业合同和补贴政策不在 New Workspace 中直接创建，需通过官方创建、迁移、审核或后续认证获得。

### 4.5.1 Team Code 加入规则

**功能概述**：MVP 中，Team Code 搜索的是 Company，但用户感知是申请加入这个团队工作区。用户提交申请后，由 Owner / Admin 审核。审核通过后，系统创建 Company Membership，并授予对应 Team Workspace 的 WorkspaceAccess。

**交互流程**：

1. 用户输入 Team Code；
2. 系统搜索 Organization；
3. 展示 Organization 摘要、标签和认证状态；
4. 用户提交加入申请；
5. Owner / Admin 在 Company > Join Requests 或 Workspace > Join Requests 审核；
6. 审核通过后，系统创建 Company Membership；
7. 系统授予 Team Workspace 的 WorkspaceAccess；
8. 该 Workspace 出现在用户的 My Workspaces。

**规则**：

| 场景 | 规则 |
| --- | --- |
| MVP | `Team Code -> Company -> Team Workspace -> WorkspaceAccess` |
| 用户文案 | 搜索和申请时展示为加入团队工作区，不展示 defaultWorkspace 概念 |
| 多 Workspace | `Team Code -> Company` 不变，高级场景管理员审核时选择授予哪些 Workspace |
| 默认分配 | MVP 只有一个主要 Team Workspace；系统可使用 `Organization.defaultWorkspaceId` 作为内部映射 |
| 直达 Workspace | 未来使用 `Workspace Invite Link`，不复用 Team Code |
| 权限边界 | Company Membership 不等于所有 Workspace 权限 |
| 审核入口 | MVP 可在 Workspace / Company 的 Join Requests 处理，只有 Owner / Admin / Billing Admin 可处理 |

### 4.6 Workspace Switcher

**功能概述**：Pro 工作台顶部展示当前 Workspace，并允许切换。Workspace Switcher 只承担“切换当前工作容器”的职责，不承担团队、组织、成员或认证管理。

**界面构成**：

- 当前 Workspace 名称；
- Workspace 列表；
- All Workspaces。

**边界规则**：

- 切换 Workspace 后，项目、客户、Credits 消耗和账本归属跟随当前 Workspace；
- Team Workspace 背后的团队/组织资料、成员、认证、服务区域和 Company Profile 通过 `Company` 管理；
- Personal Workspace 的个人资料通过 `Professional Profile` / `User Settings` 管理；
- Workspace Switcher 不展示团队管理、成员管理或 Company Settings 操作。

**状态规则**：

| 状态 | 说明 |
| --- | --- |
| Active | 当前正在工作的 Workspace |
| Personal | 默认个人工作区 |
| Team | 团队工作区 |
| Verified | 通过 Aqara 或平台审核的团队标签 |
| Sponsored | 存在 Aqara 补贴政策 |

### 4.7 Role、Label 与 Badge

**功能概述**：区分权限、能力和可信资格。

| 类型 | 对象 | 示例 | 用途 |
| --- | --- | --- | --- |
| Workspace Role | Membership | Owner、Admin、Billing Admin、Member、Viewer | 决定管理权限 |
| Person Label | Person / Professional Profile | Designer、Installer、Developer、Remote Service | 描述个人能力 |
| Certification / Badge | Person | Certified Installer、Certified Designer | 表示通过认证的可信资格 |
| Workspace Label | Workspace / Organization | Aqara Space、Service Provider、Design Studio | 描述组织业务属性 |

---

## 五、数据模型

### 5.1 Person

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 个人 ID |
| accountId | string | Aqara Account ID |
| displayName | string | 显示名称 |
| personalWorkspaceId | string | 默认 Personal Workspace |
| professionalProfileId | string? | 专业身份 |

### 5.2 Profile

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Profile ID |
| type | enum | `person` / `organization` |
| ownerId | string | Person 或 Organization ID |
| handle | string | 公开主页地址 |
| visibility | enum | `private` / `public` |
| verificationStatus | enum | `none` / `pending` / `verified` |

### 5.3 Workspace

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Workspace ID |
| type | enum | `personal` / `team` |
| name | string | 工作区名称 |
| ownerType | enum | `person` / `organization` |
| ownerId | string | 所属 Person 或 Organization |
| planId | string | 当前订阅计划 |
| labels | string[] | Workspace 标签 |
| verificationStatus | enum | `none` / `pending` / `verified` |
| billingPolicyId | string? | 补贴、合同或区域政策 |

### 5.3.1 Organization

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Organization ID |
| type | enum | 固定为 `company` |
| name | string | 团队、企业或门店名称 |
| teamCode | string | 用于邀请或申请加入的团队码 |
| profileStatus | enum | `basic` / `complete` |
| defaultWorkspaceId | string | 内部默认 Team Workspace，用于 Team Code 和首次进入分配；MVP UI 不展示 |
| workspaceIds | string[] | 该 Organization 下的 Workspace 列表 |
| labels | string[] | Design、Installation、Service Provider、Aqara Space 等业务标签 |
| programs | array | Aqara 官方项目资格，例如 `{ code: 'aqara_space', status: 'active', storeId }` |
| verificationStatus | enum | `none` / `pending` / `verified` |
| billingPolicyId | string? | 补贴、合同或区域政策 |
| source | enum | `self_created` / `official_created` / `migration` / `claim_approved` |

### 5.3.2 OrganizationMembership

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 组织成员关系 ID |
| organizationId | string | Organization ID |
| personId | string | 成员 |
| role | enum | `owner` / `admin` / `billing_admin` / `member` |
| status | enum | `active` / `pending` / `disabled` |

### 5.4 WorkspaceAccess

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 工作区访问关系 ID |
| personId | string | 成员 |
| workspaceId | string | 工作区 |
| role | enum | `owner` / `admin` / `billing_admin` / `project_manager` / `member` / `viewer` |
| status | enum | `active` / `pending` / `disabled` |
| source | enum | `created` / `company_membership` / `join_request` / `official_grant` / `migration` |

WorkspaceAccess 是用户侧邀请和访问控制入口。邀请外部账号加入 Team Workspace 时，系统内部同时创建或确认 Company Membership，再授予该 Workspace 的访问范围。

### 5.4.1 WorkspaceJoinRequest

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 加入申请 ID |
| organizationId | string | Team Code 命中的 Organization |
| requesterPersonId | string | 申请人 |
| teamCode | string | 用户输入的 Team Code |
| reason | string | 申请理由 |
| targetWorkspaceIds | string[] | MVP 默认包含当前 Team Workspace；未来由管理员选择多个 Workspace |
| status | enum | `pending_admin_review` / `approved` / `rejected` / `cancelled` |
| reviewedByPersonId | string? | 审核人 |
| reviewedAt | datetime? | 审核时间 |

### 5.4.2 ProfessionalLabel

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 标签 ID |
| code | string | `designer` / `se_installer` / `developer` / `sales` / `support` |
| label | string | Designer / SE (Installer) / Developer 等用户侧文案 |
| scope | enum | `person` / `workspace` / `project` |
| requiresCertification | boolean | 是否需要认证后才可使用 |

### 5.4.3 Lead

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 线索 ID |
| workspaceId | string | 所属 Workspace |
| customerName | string | 客户姓名 |
| customerAqaraId | string? | 已识别客户 Aqara Account |
| contact | object | 电话、邮箱、微信等联系方式 |
| source | enum | `life_app` / `website` / `store_referral` / `community` / `campaign` / `manual` |
| stage | enum | `new` / `follow_up` / `connected` / `meeting_scheduled` / `estimate_sent` / `won` / `lost` |
| tags | string[] | 适老化、别墅、全屋智能等 |
| marblePreviewIds | string[] | 已发送或生成的 Marble 3D 预览 |
| convertedProjectId | string? | 成交后关联 Project |

### 5.4.4 ProjectDeliveryContext

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 项目交付上下文 ID |
| workspaceId | string | 所属 Workspace |
| projectId | string | Project ID |
| customerAqaraId | string | 客户 Aqara Account |
| designPackageId | string? | 方案设计平台正式方案包 |
| marblePreviewIds | string[] | 售前预览资产，仅作参考 |
| assignedDesignerIds | string[] | Designer 成员 |
| assignedInstallerIds | string[] | SE (Installer) 成员 |
| procurementStatus | enum | `not_started` / `ordering` / `reserved` / `picked_up` / `shipped` / `delivered` |
| studioDeliveryStatus | enum | `not_started` / `implementing` / `acceptance_pending` / `ready_for_transfer` / `transferred` / `transfer_timeout` |

### 5.4.5 ImplementationSession

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 现场实施会话 ID |
| workspaceId | string | Workspace ID |
| projectId | string | Project ID |
| workOrderId | string? | 安装工单 ID |
| installerAqaraId | string | SE 个人 Aqara Account |
| customerAqaraId | string | 客户 Aqara Account |
| temporaryAqaraId | string? | 施工期间临时账号 |
| provisioningCodeId | string? | 授权码记录 ID |
| status | enum | `assigned` / `started` / `studio_bound` / `device_onboarding` / `mapping` / `deployed` / `acceptance_submitted` / `closed` |
| startedAt | datetime? | 开始实施时间 |
| submittedAt | datetime? | 提交验收时间 |

### 5.4.6 ProjectSite

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Site ID |
| workspaceId | string | 所属 Workspace |
| projectId | string | 所属 Project |
| name | string | 站点名称 |
| siteType | enum | `home` / `apartment` / `hotel` / `office` / `school` / `store` / `campus` / `other` |
| ownerAqaraId | string? | Site Owner 或企业账号 |
| customerAqaraId | string? | 若为家庭客户项目，可关联 Customer Aqara ID |
| address | object | 国家、城市、详细地址 |
| topology | object | 楼栋、楼层、区域、房间、网络分区 |
| studioIds | string[] | 托管在该 Site 下的 Studio |
| serviceLevel | enum | `none` / `standard` / `premium` / `enterprise_sla` |
| operationsStatus | enum | `planning` / `installing` / `handover_pending` / `active` / `maintenance` / `archived` |

### 5.4.7 ProvisioningCode

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 授权码记录 ID |
| codeHash | string | 授权码摘要，不保存可复用明文 |
| workspaceId | string | Workspace ID |
| projectId | string | Project ID |
| implementationSessionId | string | Implementation Session |
| installerAqaraId | string | 发起 SE |
| temporaryAqaraId | string | 对应 Temporary Aqara ID |
| issuedAt | datetime | 签发时间 |
| expiresAt | datetime | 过期时间 |
| usedAt | datetime? | Studio 写入并完成绑定时间 |
| status | enum | `issued` / `used` / `expired` / `revoked` |

### 5.4.8 TemporaryAqaraIdLifecycle

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| temporaryAqaraId | string | Temporary Aqara ID |
| installerAqaraId | string | SE Aqara ID |
| customerAqaraId | string | Customer Aqara ID |
| workspaceId | string | Workspace ID |
| projectId | string | Project ID |
| studioSn | string? | 绑定 Studio SN |
| issuedAt | datetime | 创建时间 |
| expiredAt | datetime? | 退出实施模式或提交验收时间 |
| readyForTransferAt | datetime? | 管理员审核确认时间 |
| transferredAt | datetime? | 转移给客户时间 |
| deletedAt | datetime? | 临时账号删除时间 |
| status | enum | `issued` / `expired` / `ready_for_transfer` / `transferred` / `not_transferred` / `deleted` |

### 5.4.9 TransferBacklog

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 转移积压记录 ID |
| temporaryAqaraId | string | Temporary Aqara ID |
| installerAqaraId | string | SE Aqara ID |
| customerAqaraId | string | Customer Aqara ID |
| studioSn | string | Studio SN |
| temporaryIdCreatedAt | datetime | Temporary Aqara ID 创建时间 |
| transferDueAt | datetime | 例如客户 30 天 Claiming 窗口 |
| transferredAt | datetime? | 实际转移时间 |
| temporaryIdDeletedAt | datetime? | Temporary Aqara ID 删除时间 |
| isTransferred | boolean | 是否已转移 |
| status | enum | `pending_claim` / `transferred` / `overdue` / `deleted` |

### 5.5 Plan

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | `personal_free` / `personal_pro` / `business` / `enterprise` |
| scope | enum | `personal` / `business` |
| name | string | Free / Pro / Business / Enterprise |
| monthlyCredits | number | 月度 Credits |
| seatsIncluded | number | 包含席位 |
| features | array | 功能权益 |

### 5.6 CreditPool

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Credits 池 ID |
| ownerType | enum | `workspace` |
| ownerId | string | Workspace ID |
| source | enum | `subscription` / `grant` / `contract` / `promo` / `refund` |
| balance | number | 当前余额 |
| monthlyRefill | number | 月度发放 |
| periodStart | datetime | 当前周期开始 |
| periodEnd | datetime | 当前周期结束 |
| expiresAt | datetime? | 过期时间 |

### 5.6.1 UsageMeter

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 用量项 ID |
| creditPoolId | string | 所属 CreditPool |
| featureKey | string | `ai_assistant` / `space_analysis` / `solution_generate` / `visualization` |
| clientApp | enum | `life_app` / `builder_home` / `builder_pro` / `builder_pro_mobile` / `design_platform` |
| unit | enum | `token` / `request` / `second` / `image` |
| used | number | 当前周期已用 |
| limit | number | 当前周期额度，`0` 表示不单独限制但仍记录 |

### 5.6.2 AIUsageEvent

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 用量事件 ID |
| accountId | string | 发起请求的用户 |
| workspaceId | string | 解析后的 Workspace |
| projectId | string? | 项目上下文 |
| clientApp | enum | 请求来源 |
| featureKey | string | 功能键 |
| model | string | 实际调用模型 |
| tokenCost | number | Token 成本 |
| creditCost | number | 折算 Credits |
| status | enum | `accepted` / `rejected_quota` / `refunded` |
| idempotencyKey | string | 防重复扣费 |

### 5.6.3 CreditGrantRequest

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 加量申请 ID |
| requesterPersonId | string | 申请人 |
| workspaceId | string | 申请加量的 Workspace |
| featureKey | string | 申请加量的功能 |
| requestedAmount | number | 申请额度 |
| reason | string? | 申请理由 |
| status | enum | `pending` / `approved` / `rejected` / `granted` |
| reviewedBy | string? | 审核人 |
| grantCreditPoolEventId | string? | 发放事件 |

---

## 六、非功能需求

| 分类 | 要求 |
| --- | --- |
| 可理解性 | 前台不暴露 Workspace 复杂概念；Pro 中统一使用 Workspace。 |
| 可扩展性 | MVP 只做 Person Profile，保留 Organization Profile 扩展能力。 |
| 组织扩展 | MVP 支持 Organization 与默认 Team Workspace 一对一，数据模型保留一对多扩展。 |
| 权限安全 | Workspace 切换必须校验 Membership；成员只能访问所属 Workspace 数据。 |
| 计费准确 | Credits、账本、Plan 必须绑定 Workspace，不使用全局单余额。 |
| 网关限制 | 所有 AI 请求必须经过模型网关解析 Workspace、校验额度、记录 UsageEvent。 |
| 可恢复 | 记录 lastActiveWorkspace，用户再次进入 Pro 时可回到上次工作区。 |
| 审计 | Workspace 创建、成员变更、Plan 修改、补贴政策变更需留审计日志。 |

---

## 七、埋点与指标

| 指标 | 说明 |
| --- | --- |
| pro_workspace_picker_view | 展示 Workspace Picker |
| pro_workspace_selected | 用户选择 Workspace |
| pro_workspace_created | 创建 Team Workspace |
| pro_workspace_switched | 在 Pro 内切换 Workspace |
| pro_workspace_plan_selected | 创建或升级时选择 Plan |
| pro_workspace_label_added | 为 Workspace 添加标签 |
| pro_last_workspace_restored | 自动恢复上次 Workspace |
| usage_quota_menu_opened | 用户打开用量中心 |
| ai_usage_rejected_quota | 模型网关因额度不足拒绝请求 |
| credit_grant_requested | 用户提交加量申请 |
| credit_grant_approved | 运营审批通过加量 |

---

## 八、边界与不展开内容

| 内容 | 说明 |
| --- | --- |
| Organization Profile | MVP 只保留模型扩展，不做团队或服务商公开主页。 |
| 服务商审核后台 | 本 PRD 只定义 Workspace 标签与认证状态，不展开总部审核工作台。 |
| 在线支付与分账 | Plan 与 Billing Policy 只定义产品归属，不展开支付、发票、税务和结算。 |
| 复杂组织层级 | Team Workspace 不展开多级部门和集团树，Enterprise 计划中再扩展。 |
| Badge 认证流程 | 个人能力标签和认证路径由 Academy / Certification PRD 展开。 |

---

## 九、待确认问题

1. Team Workspace 是否允许 Free 试用，还是创建时必须选择 Business / Enterprise？
2. Aqara Space 标签在 MVP 中是否只由总部后台授予，还是允许用户先申请后进入 pending 状态？
3. 多 Workspace 用户进入 `/pro` 时，是否每次展示 Picker，还是默认恢复 lastActiveWorkspace？
4. 服务商补贴政策是否需要在 Workspace Settings 中对 Owner 可见？
