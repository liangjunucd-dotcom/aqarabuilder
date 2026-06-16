# Builder Pro Onboarding 产品需求文档

| 版本 | 修订说明 | 修订人 | 修订日期 | 备注 |
| --- | --- | --- | --- | --- |
| v1.1 | Workspace / Organization 模型更新 | Jun | 2026.06.04 | Onboarding 收敛为个人与企业/团队入口；服务商门店通过官方创建、迁移、认领或认证进入 |
| v1.2 | Pro 升级与团队创建规则 | Codex | 2026.06.07 | Pricing、Credits Upgrade 进入同一 Onboarding；创建团队需 Proof of Business，并创建 Company 默认 Workspace |
| v1.3 | Business Plans 命名更新 | Codex | 2026.06.07 | 创建 Team Workspace 时选择 Business / Enterprise，Team 仅保留为 Workspace Type |
| v1.4 | Identity First 更新 | Codex | 2026.06.07 | Onboarding 负责激活 Professional Profile 与 Builder Pro 访问权，不负责首次付费 |

---

## 一、需求背景

Aqara Builder 前台面向普通用户提供空间方案、灵感、Marketplace、Find Pros 和个人 Profile；Builder Pro 面向专业用户提供项目、设计服务、交付服务、远程服务、服务计划和组织协作能力。

随着 Builder 平台从「用户自助创作」扩展到「专业服务交付」，普通用户需要一条顺滑路径从 Builder 前台进阶为 Professional，并进入 Builder Pro。现有设计中如果直接把 Professional Profile 或 Builder Pro 入口放在普通用户侧边栏，会产生以下问题：

1. **身份切换割裂**：用户会误以为 Builder Pro 是另一个账号体系，而不是同一 Aqara Account 上的专业身份扩展；
2. **组织进入不清晰**：个人、普通团队、正式企业、服务商门店都可能进入 Builder Pro，但它们不应被建模成不同账号类型；
3. **服务商门店需要治理**：Aqara Space / 服务商门店代表官方认证、合同、补贴、服务责任和线索资格，不应在 onboarding 中被用户自由创建；
4. **加入组织需要低摩擦**：加入企业、团队或服务商门店时，用户只应输入 Team Code 发起搜索，找到 Organization 后提交申请理由，由管理员审核；
5. **Professional Profile 需要渐进完善**：进入 Builder Pro 不等于付费、不等于公开接单，也不等于认证通过。用户应先激活 Professional Profile，再按后续动作补齐认证、服务区域和组织归属。

因此，需要设计一套 Builder Pro onboarding，使用户从普通 Profile 中点击 `Convert to Professional` 后，可以自然完成 Professional Identity 激活、Personal Workspace 确认、Team Workspace 创建/加入意图收集，并直接进入本次 onboarding 已确定的 Builder Pro 工作上下文。

---

## 二、产品定位

Builder Pro Onboarding 是普通 Builder 用户升级为专业用户的初始化流程，定位为「同账号专业身份激活与工作上下文创建流程」。

它不是注册新账号，也不是认证审核全流程。它负责把用户带到正确的 Builder Pro 起点：

- **个人用户**：激活 Professional Profile，进入 Personal Workspace；
- **团队用户**：创建普通 Team Workspace，或申请加入已有 Organization 的默认 Team Workspace；
- **服务商 / Aqara Space 用户**：通过 Team Code 加入已创建或已认证的 Organization；负责人通过官方创建、迁移、认领或审核流程获得 Owner / Admin；
- **平台侧**：收集用户使用目的、项目类型、完成方式、来源和是否需要设置帮助，用于推荐后续模块。

目标用户：

- 普通 Builder 用户，准备提供设计、安装、远程服务、开发者或项目协作能力；
- 个人设计师、个人安装商、插件开发者；
- 设计工作室、安装团队、项目交付团队成员或 Owner；
- 已由官方创建、迁移或认领的 Aqara Space / 服务商组织老板、店长、员工；
- 从 Marketplace、Find Pros、Profile、Pricing 或 Pro 官网进入的潜在专业用户。

核心价值主张：

- **对用户**：不换账号、不丢作品、不强制认证，按自己场景一步步进入 Pro；
- **对团队/门店**：成员以个人账号加入 Organization / Team Workspace，避免共享账号，组织责任边界清晰；
- **对 Aqara**：把普通用户、专业人、团队和服务商网络纳入统一身份与服务体系。

---

## 三、设计原则

| 序号 | 原则 | 说明 |
| --- | --- | --- |
| 1 | **同账号升级** | Builder Pro 不创建新账号，只在同一 Aqara Account 上激活 Professional Profile。 |
| 2 | **入口不打扰普通用户** | 普通用户侧边栏不展示 Professional Profile；入口放在用户 Profile 中，文案为 `Convert to Professional`。 |
| 3 | **先个人/团队，后组织治理** | Onboarding 只区分个人使用和企业/团队；服务商、Aqara Space、企业认证和合同能力后置。 |
| 4 | **普通团队可自助创建** | 创建 Team Workspace 时，底层创建轻量 Organization 与默认 Team Workspace，用户成为 Owner。 |
| 5 | **服务商门店官方治理** | Aqara Space / 服务商门店由官方创建、迁移、认领或审核生成，不在 onboarding 中自由创建。 |
| 6 | **加入组织低摩擦** | 加入企业/团队或服务商门店时只输入 Team Code，搜索到 Organization 后填写申请理由并提交审核。 |
| 7 | **专业身份正式激活** | 完成 onboarding 后激活 Professional Profile；公开接单、认证 Badge、组织代表权和商业权限后置。 |
| 8 | **Identity First** | Onboarding 不要求首次付费；Free Professional 可以进入 Builder Pro 基础工作台。 |
| 9 | **升级在价值点触发** | 项目数量、Credits、导出、协作、Marketplace、Remote Service 等限制触发 Upgrade。 |
| 10 | **一屏完成当前任务** | 每一步只展示当前必须完成的内容，避免页面高度超出常见桌面屏幕。 |
| 11 | **业务视觉真实可信** | 右侧视觉使用真实施工/交付场景照片，体现专业安装、设计交付和服务信任感。 |

---

## 四、功能需求

### 4.1 入口与触发

**功能概述**：普通 Builder 用户从自己的 Profile、Pricing 或 Credits Upgrade 进入 Builder Pro onboarding。

**入口位置**：

- Builder 前台 → `我的 Profile`
- Profile 页面中展示 `Convert to Professional` 卡片
- 点击 `Convert to Professional` → 进入 `/onboarding`
- Builder 前台 Credits Usage 中，Free 用户点击 `Upgrade`：若未完成 Professional Onboarding，先进入 `/onboarding?intent=professional_profile&plan=pro`；若已完成，则进入 Upgrade Intent。
- Pricing / Plan 弹窗中，Free 用户点击 `Upgrade to Pro`：若未完成 Professional Onboarding，先进入同一 onboarding；完成后再在使用限制处或 Plan & Licenses 中处理升级。

**入口规则**：

| 用户状态 | 前台侧边栏 | Profile 页面 | 点击行为 |
| --- | --- | --- | --- |
| 普通 Builder 用户 | 不展示 Professional Profile | 展示 `Convert to Professional` | 进入 onboarding |
| Professional 用户 | 可展示 Builder Pro 工作台入口 | 展示 Professional Profile 管理入口 | 进入 `/pro/profile` 或 `/pro` |
| Certified 用户 | 展示 Certified 状态 | 展示认证资料和组织归属 | 进入 Pro 管理 |

---

### 4.2 Onboarding 页面框架

**功能概述**：Onboarding 使用左右分栏布局。左侧是当前步骤表单，右侧是 Builder Pro 业务视觉。

**页面结构**：

- 顶部：Aqara Builder Logo + `BUILDER PRO`
- 返回入口：`返回 Profile`
- 进度条：展示当前步骤进度，例如 `1/7`
- 主内容：当前问题、说明、选项或表单
- 底部操作：`Back` + 主按钮（`Next` / `Search` / `Submit request` / `Continue` / `Enter Builder Pro`）
- 右侧视觉：明亮真实的施工/智能布线/专业交付场景图

**适配要求**：

- 常见桌面高度（720px）下当前步骤应尽量一屏展示；
- 移动端隐藏右侧视觉，仅保留主流程；
- 底部不展示内部解释文案；
- 每一步只显示完成当前动作所需信息。

---

### 4.3 Step 1：欢迎与使用方式选择

**页面文案**：

- 标题：`欢迎来到 Builder Pro`
- 描述：`花 10 秒告诉我们，你这次来主要是为了什么。我们会据此为你准备好需要的功能。`

**选项**：

| 选项 | 说明 | 后续路径 |
| --- | --- | --- |
| 企业/团队 | 设计工作室、安装团队、项目交付团队、服务商门店成员 | 进入团队场景选择 |
| 个人使用 | 个人设计师、个人安装商、开发者或自己的项目 | 进入个人介绍 |

**交互规则**：

1. 未选择时 `Next` 不可点击；
2. 选择后卡片高亮，`Next` 可点击；
3. 切换选项时清空此前组织相关输入和搜索状态。

---

### 4.4 Step 2A：企业/团队场景选择

**触发条件**：Step 1 选择 `企业/团队`

**页面文案**：

- 标题：`请选择企业/团队场景`
- 描述：`你可以创建新的团队工作区，或通过 Team Code 申请加入已有企业、团队或服务商门店。`

**选项**：

| 选项 | 说明 |
| --- | --- |
| 创建团队工作区 | 用于设计工作室、安装团队、项目协作团队或普通公司团队 |
| 加入已有团队 | 企业、团队或服务商门店已经在使用，我要加入 |

#### 4.4.1 创建企业或团队

**功能概述**：用户作为 Owner 创建普通 Team Workspace。底层同时创建轻量 Organization 和默认 Team Workspace。

**字段**：

| 字段 | 是否必填 | 说明 |
| --- | --- | --- |
| 团队/企业名称 | 是 | 团队、公司或工作室名称 |
| Website | 否 | 公司官网或作品页 |
| Proof of Business | 是 | 营业执照、工商证明、门店证明、业务资质或等价材料 |

**交互规则**：

1. 用户选择 `创建团队工作区` 后填写团队/企业名称；
2. 必填字段未完成时 `Next` 不可点击；
3. Proof of Business 只记录文件名 / 附件引用，不在前台公开展示；
4. Onboarding 中仅收集团队资料，不跳转 Workspace Picker；
5. 用户点击完成页 `进入 Builder Pro` 后，系统创建 Company / Organization、默认 Team Workspace 和 Owner Membership；
6. Company 默认状态为 `pending_verification`，不影响 Owner 进入默认 Workspace；
7. 系统设置 activeWorkspace 为新 Team Workspace，并直接进入该工作区；
8. Business / Enterprise 计划在创建时可选择为目标计划；支付、续费、升级和合同确认在进入 Pro 后通过 `Plan & Licenses` 完成；

#### 4.4.2 加入企业或团队

**功能概述**：用户输入 Team Code，搜索对应 Organization，找到后提交加入申请。Team Code 是组织级入口，不直接指向 Workspace。MVP 审核通过后默认加入该 Organization 的默认 Team Workspace。

**字段**：

| 字段 | 是否必填 | 说明 |
| --- | --- | --- |
| Team Code | 是 | 由企业、团队或服务商门店管理员提供 |
| 申请理由 | 找到组织后必填 | 用于管理员判断是否批准加入 |

**交互流程**：

1. 用户选择 `加入已有团队`
2. 输入 `Team Code`
3. 点击主按钮 `Search`
4. 系统搜索 Organization
5. 若找到：展示 Organization 名称、标签和认证状态，说明「提交申请后需管理员审核」
6. 用户填写 `申请理由`
7. 点击 `Submit request`
8. 展示结果：`申请已提交，待管理员审核`
9. 辅助提示：`完善个人信息可以帮助管理员更快确认你的身份。`
10. 点击 `Continue` 进入后续步骤
11. 审核通过后，该 Organization 的默认 Team Workspace 出现在 My Workspaces

**加入规则**：

| 阶段 | 规则 |
| --- | --- |
| MVP | `Team Code -> Organization -> defaultWorkspaceId -> WorkspaceMembership` |
| 多 Workspace | `Team Code -> Organization` 不变，管理员审核时选择授予哪些 Workspace |
| Workspace 直达 | 未来使用 `Workspace Invite Link`，不复用 Team Code |
| 成员关系 | 用户可先成为 Organization Member，再获得一个或多个 Workspace Membership |

**找不到状态**：

- 展示提示：`没有找到对应的企业/团队。请检查 Team Code。`
- 用户可修改 Team Code 后再次点击 `Search`
- 用户可点击 `Back` 返回场景选择

---

### 4.5 Step 2B：个人 Professional Profile

**触发条件**：Step 1 选择 `个人使用`

**页面文案**：

- 标题：`先介绍一下你自己`
- 描述：`Introduce yourself and we will get you to the right tools or team.`

**问题 1：Which best describes you?**

| 选项 | descriptor 值 | 说明 |
| --- | --- | --- |
| 安装商 | `installer` | 负责安装、调试、交付或售后服务 |
| 设计师 | `designer` | 负责方案设计、空间规划或客户提案 |
| 集成商 | `system_integrator` | 负责系统集成、项目实施或多工种协作 |
| 开发者 | `developer` | 负责插件、自动化、API 或系统连接 |
| 业主 / 物业方 | `property_owner` | 为自己的空间、样板间或物业项目使用 |
| 其他专业身份 | `other` | 暂时无法归类，后续再完善 |

**问题 2：你的主要专业类别**

**交互形式**：下拉单选，下拉菜单固定向下展开。

| 选项 | category 值 |
| --- | --- |
| 智能家居 | `smart_home` |
| 照明与场景 | `lighting` |
| 安防与门锁 | `security` |
| 暖通 / 空调 | `hvac` |
| 室内设计 | `interior_design` |
| 电气施工 | `electrical` |
| 物业 / 地产 | `property_management` |
| 软件与系统集成 | `software_integration` |

**交互规则**：

- `Which best describes you?` 为单选；
- 专业类别为下拉单选，默认选中 `smart_home`；
- descriptor 和 category 是个人 Professional Profile 标签，不是 Team Workspace role；
- Team Workspace role 仅用于组织权限，例如 Owner、Admin、Member；
- Onboarding 不采集用户名称，名称沿用 Aqara Account / 普通 Profile；
- 一句话介绍不在 onboarding 中填写，后续在 Professional Profile 编辑页完善。

---

### 4.6 Step 3：使用目的与功能兴趣

**功能概述**：了解用户准备用 Builder Pro 做什么，以及进入工作台后最关心的功能模块。

**问题 1：你为什么要使用 Builder Pro？**

| 选项 | 说明 |
| --- | --- |
| Client projects | 为客户做设计、报价、交付、远程服务或持续服务 |
| Personal projects | 为自己的家、样板间、作品集或学习项目使用 |

**问题 2：你感兴趣的功能**

**交互形式**：下拉单选，下拉菜单固定向下展开。

| 选项 | interest 值 |
| --- | --- |
| 项目管理 | `project_management` |
| 项目规划 | `project_planning` |
| 设计工具 | `design_tools` |
| 客户线索 | `client_leads` |
| 报价与提案 | `quotes` |
| 服务计划 | `service_plans` |
| 团队协作 | `team_collaboration` |
| 远程服务 | `remote_service` |

**交互规则**：

- 使用目的必选一项；
- 功能兴趣为下拉单选，默认选中 `project_management`；
- 选择 Client projects 时，完成 onboarding 后优先进入项目创建；
- 选择 Personal projects 时，完成 onboarding 后进入 Pro 首页。

---

### 4.7 Step 4：项目情况

**问题 1：What are you working on?**

| 选项 | 说明 |
| --- | --- |
| My own home | 我正在规划自己的家或个人空间 |
| Residential buildings | 住宅、样板间、公寓、别墅或多套房源 |
| Something else | 商业空间、办公空间、门店或其他项目 |

**问题 2：How will you complete it?**

| 选项 | 说明 |
| --- | --- |
| Hire a professional | 需要专业人协助完成设计、安装或服务 |
| Do it myself | 先自己做，必要时再邀请专业人接手 |

---

### 4.8 Step 5：来源

**页面文案**：

- 标题：`你是怎么了解到我们的？`
- 描述：`你的反馈可以帮助我们了解专业用户是如何发现 Builder Pro 的。`

**交互形式**：

- 使用可换行的轻量标签；
- 单选；
- 不展示选项解释文案；
- 该字段仅用于获客来源分析，不影响后续工作区、计划或权限。

**选项**：

| 选项 | source 值 |
| --- | --- |
| 朋友或同事 | `friend_colleague` |
| 社交媒体 | `social_media` |
| 搜索引擎（如 Google） | `search_engines` |
| AI（如 ChatGPT） | `ai` |
| YouTube | `youtube` |
| 评测网站 | `review_site` |
| 展会或活动 | `trade_show_event` |
| 邮件 | `email` |
| 电视 / 流媒体 | `tv_streaming` |
| 其他 | `other` |

---

### 4.9 Step 6：设置帮助

**页面文案**：

- 标题：`Want help getting set up?`
- 描述：`需要的话，我们可以帮你完成第一次设置。`

**选项**：

| 选项 | 说明 |
| --- | --- |
| Yes, please. | 留下联系方式，安排 1 对 1 新人设置支持 |
| No, thanks. | 我先自己完成设置，之后再联系支持 |

**字段**：

| 字段 | 触发条件 | 是否必填 |
| --- | --- | --- |
| 手机号 | 选择 Yes | 手机号或邮箱二选一 |
| 邮箱 | 选择 Yes | 手机号或邮箱二选一 |

---

### 4.10 Step 7：完成页

**页面文案**：

| 路径 | 标题 | 描述 |
| --- | --- | --- |
| 个人使用 | `Professional Profile 已准备好` | `点击进入 Builder Pro 后，将进入 Personal Workspace。` |
| 创建团队 | `企业和默认工作区已准备好` | `点击进入 Builder Pro 后，系统会创建 Company、默认 Team Workspace 和 Owner Membership，并直接进入该工作区。` |
| 加入团队 | `已向企业/团队提交加入申请` | `管理员审核通过后，团队工作区会出现在 My Workspaces。现在先进入 Personal Workspace。` |

**展示内容**：

- `Professional Profile`
- `Personal Workspace`
- 若选择创建团队：`Organization + default Team Workspace`
- 若选择加入团队：`Join Request pending`
- 状态 Badge：`Active`

**完成行为**：

1. 点击 `Enter Builder Pro`
2. 系统激活 Professional Profile
3. 系统记录 onboarding payload
4. 系统记录 Professional Identity 已激活
5. 若选择个人使用：设置 activeWorkspace 为 Personal Workspace，跳转 `/pro/personal/home`
6. 若选择创建团队：创建 `Company / Organization + default Team Workspace + Owner Membership`，设置 activeWorkspace 为新 Team Workspace，跳转 `/pro/{organizationSlug}/{workspaceSlug}/home`
7. 若选择加入团队：创建 Join Request，设置 activeWorkspace 为 Personal Workspace，跳转 `/pro/personal/home?joinRequest=pending`
8. 从 Profile 的 `Convert to Professional` 进入 onboarding 时，同样适用以上规则；完成后进入 Builder Pro，不返回 Profile。

**后续管理入口**：

- Builder Pro 顶部 Workspace Switcher 支持切换当前 Workspace；
- Builder Pro 设置中提供 My Workspaces；团队/组织管理通过 Company，个人资料管理通过 Professional Profile / User Settings；
- Workspace Picker 仅作为直接访问 `/pro` 且没有 activeWorkspace 时的兜底入口，不作为 onboarding 固定最后一步。

---

## 五、数据模型

### 5.1 核心实体关系

```text
AqaraAccount
-> UserProfile
-> ProfessionalProfile
-> PersonalWorkspace
-> Organization?
   -> defaultTeamWorkspace
-> WorkspaceMembership
-> WorkspaceJoinRequest
-> OnboardingSession
```

### 5.2 OnboardingSession

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Onboarding 会话 ID |
| accountId | string | Aqara Account ID |
| entryMode | enum | `personal` / `team` |
| workScenario | enum | `team_create` / `team_join` |
| signupReason | enum | `client_projects` / `personal_projects` |
| projectType | enum | `my_home` / `residential_buildings` / `something_else` |
| completionMode | enum | `hire_professional` / `do_it_myself` |
| source | enum | 来源 |
| helpChoice | enum | `yes` / `no` |
| status | enum | `draft` / `completed` |

### 5.3 ProfessionalProfile

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Professional Profile ID |
| accountId | string | 所属 Aqara Account |
| displayName | string | 显示名称 |
| headline | string | 一句话介绍 |
| professionalDescriptor | enum | 个人专业身份描述 |
| professionalCategory | enum | 主要专业类别 |
| status | enum | `active` / `suspended` |
| publicAvailability | enum | `hidden` / `available` / `busy` |
| organizationAffiliations | array | 组织归属 |

### 5.4 Organization

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 组织 ID |
| kind | enum | `informal_team` / `company` / `service_provider` / `aqara_space` / `enterprise_customer` |
| name | string | 组织名称 |
| teamCode | string | Team Code |
| ownerAccountId | string | Owner 账号 |
| defaultWorkspaceId | string | 默认 Team Workspace |
| verificationStatus | enum | `none` / `pending` / `verified` |
| labels | array | 组织标签 |
| source | enum | `self_created` / `official_created` / `migration` / `claim_approved` |

### 5.5 Workspace

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | Workspace ID |
| type | enum | `personal` / `team` |
| ownerType | enum | `person` / `organization` |
| ownerId | string | Person 或 Organization |
| planId | string | 当前计划 |
| creditPoolId | string | Credits 池 |

### 5.6 JoinRequest

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 加入申请 ID |
| accountId | string | 申请人 |
| targetOrganizationId | string | Team Code 命中的 Organization |
| teamCode | string | 用户输入的 Team Code |
| targetWorkspaceIds | string[] | MVP 默认包含 Organization.defaultWorkspaceId；未来由管理员选择 |
| reason | string | 申请理由 |
| status | enum | `pending_admin_review` / `approved` / `rejected` / `cancelled` |

---

## 六、非功能需求

| 分类 | 要求 |
| --- | --- |
| 性能 | 页面首屏加载在常规网络下应小于 2s；步骤切换应无明显卡顿。 |
| 响应式 | 桌面端 720px 高度尽量一屏可完成当前步骤；移动端隐藏右侧视觉。 |
| 可恢复 | 用户中途退出后应可恢复已填写内容，至少保存本地进度。 |
| 可审计 | 创建 Organization、创建 Workspace、加入组织、提交申请理由等动作需要写审计日志。 |
| 安全 | 团队号搜索只返回必要组织摘要，不泄露成员、客户和项目数据。 |
| 隐私 | 电话、邮箱、申请理由、经营证明不得公开展示，仅用于审核和支持。 |
| 国际化 | 字段需支持 VAT / Proof of Business / Business License 等不同市场称呼。 |

---

## 七、埋点与指标

| 指标 | 说明 |
| --- | --- |
| onboarding_start | 用户进入 onboarding |
| entry_mode_selected | 选择个人/企业团队 |
| work_scenario_selected | 选择创建/加入场景 |
| team_number_search | 搜索团队号 |
| team_number_found | 搜索成功 |
| team_number_not_found | 搜索失败 |
| join_request_submitted | 提交加入申请 |
| onboarding_completed | 完成 onboarding |
| pro_direct_enter | onboarding 后直接进入 Pro 工作区 |
| pro_workspace_picker_fallback | 非 onboarding 场景展示 Workspace Picker |

---

## 八、边界与不展开内容

| 内容 | 说明 |
| --- | --- |
| 服务商系统主数据 | Builder Pro 不作为服务商 ERP，只接入服务商 Organization、成员和审核结果。 |
| Aqara Space / 服务商创建 | 不在 onboarding 主流程自助创建，由官方创建、迁移、认领或审核生成。 |
| 总部审核后台 | 本 PRD 不展开服务商认证、Aqara Space 认领和总部审核工作台。 |
| 文件上传安全扫描 | 本 PRD 只定义上传交互，不展开文件扫描、OCR 和反欺诈。 |
| 认证 Badge 流程 | Professional Profile 激活后，认证流程由 Academy / Certification PRD 展开。 |
| 收款与结算 | 进入 Builder Pro 不自动开通收款能力，结算能力由 Billing / Ledger PRD 展开。 |

---

## 九、待确认问题

1. Team Code 是否由 Organization 创建时自动生成，还是支持管理员自定义？
2. 普通 Team Workspace 创建时是否允许选择 Enterprise，还是需要销售/官方确认？
3. Team Join Request 是否需要短信、邮件或站内信通知管理员？
4. 管理员审核通过后，是否需要用户二次确认加入 Organization？
5. 服务商负责人认领 Aqara Space 的入口放在 Pro Settings、官网 Builders 页面，还是官方邀请邮件？
