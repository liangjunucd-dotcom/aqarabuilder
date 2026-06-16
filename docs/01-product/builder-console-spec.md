# Builder Pro 后台规格

> 面向 **Professional / Aqara Certified Builder（ACB）/ Team / Partner / Enterprise Operator** 的专业工作台。访问入口：`builder.aqara.com/pro`。
>
> **与个人侧物理隔离**：本文档所述全部为 Builder 专业控制台（ACB / Developer 身份激活时的视图），与个人侧 `builder.aqara.com`（Customer 身份）数据 / 界面分离。两者共用同一 Aqara 账号，按入口决定上下文。详见 `[../03-architecture/identity-model.md](../03-architecture/identity-model.md)`。
>
> 未认证账号访问 `/pro` 路径返回 404 或引导至 Aqara Academy 走 Badge 认证流程。

> **当前实现状态**：现有 Aqara Builder 已有雏形（Home / Build AI / Studios / Marketplace / Community），下文是**目标态规格**。
>
> **导航契约**：Builder Pro 默认一级导航必须遵守 [`builder-pro-menu-closed-loop-review.md`](./builder-pro-menu-closed-loop-review.md) 的四域模型：`Projects / Leads / Financials / Company`。本文中旧的 Dashboard、Studios、Workshop、Service、Ledger、Marketplace、Profile、Learn 等描述，只能作为子页面、能力集合或全局工具理解，不再作为默认一级菜单依据。

---

## 顶层导航（目标态）


| 入口                 | 用途                                    | 高频度   |
| ------------------ | ------------------------------------- | ----- |
| **Projects**       | Project Passport、Design Package、Work Orders、Studio 调试、验收与服务记录 | ⭐⭐⭐⭐⭐ |
| **Leads**          | 来自 Community、Life App、Marketplace、门店和平台派单的机会 | ⭐⭐⭐⭐  |
| **Financials**     | 报价、合同、发票、Credits、收款、结算和收益           | ⭐⭐⭐⭐  |
| **Company**        | Profile、组织、成员、认证、服务区域、Marketplace 供给和设置 | ⭐⭐⭐   |


---

## 产品心智与前台区分

Builder Pro 对标 Houzz Pro 的后台心智：它不是 Builder Community 的登录后版本，而是专业用户经营线索、项目、设计、服务和账本的工作台。

| 产品面 | 用户心智 | 主要对象 | 设计风格 |
|---|---|---|---|
| Builder Community | 看灵感、找方案、找专业人、建立信任 | Showcase、Solution、Builder Profile、Marketplace、Ideabook | 内容优先、公开展示、SEO 友好、转化路径清晰 |
| Builder Pro | 回线索、管项目、做设计、交付、服务、收款记录 | Lead、Project、DesignPlan、Studio、ServiceSession、Ledger | 工作流优先、信息密度高、状态明确、可操作 |

视觉和交互上应形成明显区分：

1. Community 使用公开内容站心智，强调案例、图片、Profile、评价、CTA 和跨端分享。
2. Builder Pro 使用专业 SaaS 后台心智，强调状态、任务、筛选、表格、看板、详情抽屉、批量操作和审计。
3. Community 的核心 CTA 是 `Save / Contact / Remix / Find Pro`；Builder Pro 的核心 CTA 是 `Reply / Assign / Quote / Design / Publish / Schedule / Accept / Follow up`。
4. Community 中的 Team / Partner 是公开主页和信任背书；Builder Pro 中的 Team / Partner 是 Work Context 和业务责任边界。

---

## Work Context 与全局布局

Builder Pro 顶部左侧必须有 **Context Switcher**。它决定当前后台正在以个人、团队、Partner 还是 Enterprise 上下文工作。

```text
[Aqara Space Shanghai · Partner] v    Projects  Leads  Financials  Company
```

展开结构：

```text
Personal
- Jun Personal                 Pro · Individual

Teams
- Liang Studio                 Team · Owner
- SmartHome Lab                Team · Member

Partner Organizations
- Aqara Space Shanghai         Partner · Admin
- Dubai Certified Hub          Partner · Member

Enterprise
- Hilton Pilot UAE             Enterprise · Operator
```

Context Switcher 展示字段：

| 字段 | 示例 | 用途 |
|---|---|---|
| Context name | Aqara Space Shanghai | 当前业务主体 |
| Type badge | Personal / Team / Partner / Enterprise | 判断数据和权限边界 |
| My role | Owner / Admin / Member / Operator | 判断可操作能力 |
| Market / Region | Shanghai / UAE / EU | 判断线索、服务和合规区域 |
| Plan / Seat | Individual / Team Seat / Partner Contract | 判断工具权限和额度 |
| Credits balance | 2,400 credits | 判断 AI 和授权消耗 |

切换 Context 后，左侧导航可以保持一致，但数据范围、默认筛选、可见模块和可执行动作必须变化。

| Context | Dashboard 重点 | 高频动作 | 默认隐藏或弱化 |
|---|---|---|---|
| Personal | 个人草稿、个人 Leads、远程服务、个人 Credits、Professional Profile 完整度 | 新建设计草稿、回复 Lead、编辑 Profile、升级 Pro | 成员管理、Partner 质量看板、企业审计 |
| Team | 团队 Inbox、成员任务、共享项目、团队 Credits、交付排期 | 分配项目、邀请成员、查看工作量、管理共享资产 | Partner 区域权益、Enterprise 私有目录 |
| Partner | 区域线索池、SLA、项目管线、服务质量、认证覆盖、Aqara Space 资源 | 派单、审批报价、看质量风险、管理服务区域和成员 | 个人草稿优先视图、无关团队试用入口 |
| Enterprise | Sites、Studio Groups、服务请求、私有方案、审计、合同额度 | 查看站点健康、发起服务请求、管理成员、查看审计 | 公开接单、个人 Profile 增长任务 |

全局布局建议：

| 区域 | 内容 | 设计要求 |
|---|---|---|
| Top Bar | Context Switcher、全局搜索、Create、通知、账号菜单 | Context 永远可见，避免用户误操作到错误组织 |
| Left Nav | Projects、Leads、Financials、Company | 一级导航稳定；子项根据 Context 变化 |
| Main | 看板、表格、画布、详情页 | 优先任务和状态，不做营销式大 Hero |
| Right Drawer | Lead / Project / Studio / Member 快速详情 | 支持快速处理，不频繁跳页 |
| Command Palette | 搜索项目、客户、Studio、动作、文档 | 支持专业用户高频操作 |

---

## `/pro` Operating Overview 设计哲学

> **每个数字都对应可执行动作 + AI 实时建议下一步。**

### 模块布局（自上而下）

1. **Today's Focus**（Builder Copilot 摘要）
  - 「你有 3 个新 Lead，其中 1 个匹配度 95%。要现在回复吗？」
  - 「项目 #128 客户昨天评价了，分数 4.7，建议你回访并邀请发布 Showcase」
  - 「Studio aqarastudio-b9c4 上有一条告警，建议远程检查」
2. **Delivery Flow 看板** — Lead → 报价 → 签约 → 交付 → 售后 五阶段卡片
3. **本月数据** — 项目数 / 收入 / 订阅累计 / 内容曝光 / Studio 数 / Badge 进度
4. **Quick Actions** — 新建项目 / 起草 Showcase / 上传户型图 / 生成客户效果图 / 召唤 Copilot / 连接 Studio

---

## Studios 模块（核心）

> 这是 Builder 工作的"舰桥"。所有图谱编辑、Persona 部署、设备调试都最终落到一台 Studio。
>
> **范围限定**：本模块只显示 **Service Provider 关系托管的客户 Spaces 下的 Studios**，按客户聚合。ACB 自己家的 Studio 永远在个人侧（Customer 身份），不在此处显示。详见 `[../03-architecture/identity-model.md](../03-architecture/identity-model.md)`。

### 列表视图（参考现状）


| 字段               | 内容                           |
| ---------------- | ---------------------------- |
| Device Name / ID | aqarastudio-xxxx / lumi3.xxx |
| IP / Last Seen   | 局域网 IP / 心跳时间                |
| Health           | 在线状态 / 异常告警                  |
| Owner            | 客户家庭                         |
| Project          | 关联项目                         |
| Action           | Connect（远程） / 详情 / 同步配置      |


### 详情视图（目标态）

- 健康监控（心跳 / CPU / 内存 / 离线设备数 / 异常自动化数）
- 远程操作（一键打开 Studio Web 控制台 / 单步推送配置）
- 备份历史 + 一键回滚
- Builder 协作（多 Builder 共同维护一台 Studio）
- 客户授权窗口（每次远程操作必须客户授权 + 时间窗 + 审计）
- 服务记录（每次访问 / 每次变更）

详见 `[studio-and-builder.md](./studio-and-builder.md)`。

---

## Workshop / Design 能力集合

> Workshop 不再是默认一级菜单。它代表 Builder Pro 里的创作能力集合：售前空间方案进入 `Projects -> Design`；客户已经接入 Studio 后的 Life Dashboard 调优进入 `Projects -> Studio / Service`；插件和服务包供给进入 `Company -> Catalog`。

### 1. Space Editor — 空间图谱编辑器

- 户型图导入（CAD / PDF / 图片 OCR）
- 节点（房间 / 区域 / 设备）+ 边（连接关系 / 控制关系 / 触发规则）可视化编辑
- 模板库（住宅 / 办公 / 适老化 / 商业空间…）
- AI 推荐节点补全 / 异常检测
- **业务阶段**：售前 / 方案设计，不要求客户已经部署 Studio
- **输出落点**：DesignPlan、QuoteDraft、ClientVisualization、DeploymentPackage 草案；正式部署仍需进入项目交付流程

### 2. Life Dashboard Builder — 家庭成员看板生成（专业版）

> 这是 Builder 现阶段**最高优先级**的新模块。
>
> **关键边界**：Life Dashboard 不属于售前 Space Design，也不是运行在 Studio 内的自动化逻辑。它在客户已经有 Studio / Home 数据后，读取家庭设备、场景、成员与权限，生成 Aqara Life 内的个性化看板。
>
> **双路径中的"专业版"**：Dashboard / Persona 配置有两条路径 —— ACB 在专业控制台为客户做交付（本模块），用户在 Aqara Life / Builder 个人侧自助 Compose。两条路径**数据结构互通**：用户自配的 Persona 可被 ACB 接管并继续优化；ACB 交付的 Persona 用户也可切回自助版微调。详见 `[aqara-life-app.md](./aqara-life-app.md)` "Persona Composer 双路径"。

- 为家庭每个成员（主人 / 伴侣 / 老人 / 儿童 / 客人 / 保姆）组装 Aqara Life 首页
- 数据来源：Home Snapshot / Studio 设备状态 / 场景 / 成员权限
- 三层覆盖配置：
  - Layer 1: Aqara 角色默认值
  - Layer 2: 配置者组装层（本模块 = ACB 专业版 Composer；自助版见 Aqara Life）
  - Layer 3: 用户自己的实时微调
- 专业版相对自助版的差异：全自由度、模板保存与跨 Space 复用、多 ACB 协作与版本管理、计入服务交付走分佣
- 沙箱预览（模拟不同时段 / 角色视角）
- 一键交付到客户家庭账号：二维码领取、推送到 Aqara ID / 手机号、或绑定到指定家庭成员
- 输出：LifeHomePlugin、PersonaDashboardConfig、PermissionScope、DataBinding
- Builder 前台也开放自助版：例如家庭里的父亲可以基于自己的 Studio / Home 数据，为孩子、老人或访客生成简化看板。专业版的差异在于多客户、多版本、服务计费、团队协作和审计。

详见 `[aqara-life-app.md](./aqara-life-app.md)`。

### 3. Client Visualization — 成交可视化

> 这是 Builder Pro 为了提升成交率必须补上的 AI 能力：把专业 DesignPlan 转成客户能理解的效果图、短视频或可走动预览。

核心原则：

- 它不是独立 AI 画图入口，必须挂在 Project / DesignPlan 下。
- 它不替代报价、施工图或运行配置，客户承诺仍以 QuoteDraft、InstallerHandoff 和 DeploymentPackage 为准。
- 它可以调用 Marble 类世界模型，但产品层通过 Visualization Service 接入，避免绑定单一供应商。
- 生成内容进入客户评审包前必须由 Builder 审阅。

推荐交互：

1. 在 Project 的 Design 阶段点击 `Visualize for Client`。
2. 选择房间、体验 Moment、预算档、风格参考和输出类型。
3. AI 从 DesignPlan 自动生成 Visualization Brief，Builder 可编辑提示词和约束。
4. 系统创建 RenderJob，消耗 Credits，并展示排队、生成、失败重试和取消状态。
5. 生成 `Option A / B / C`，支持图片、15 到 30 秒短视频、可走动预览和 before / after 对比。
6. Builder 选择可用版本加入 ClientReviewPackage。
7. 客户评论回流为 DesignChangeRequest，由 Builder 决定是否更新 DesignPlan 和 QuoteDraft。

界面结构：

| 区域 | 内容 |
|---|---|
| 左侧 | 房间、Moment、风格、设备亮点、预算档、输出类型 |
| 中间 | 当前 DesignPlan 画布、生成预览、版本对比 |
| 右侧 | AI Brief、提示词、真实约束、Credits 预估、审批状态 |
| 底部 | 加入评审包、重新生成、保存为模板、生成 Quote Revision |

内部 demo 参考：`http://10.11.50.116/preview?templateId=demo2`。该 demo 更接近客户可走动预览和场景切换形态，不能作为长期产品入口或数据模型依据。

### 4. Plugin Builder — 插件开发

- 项目脚手架（声明式 JSON Manifest + 受控 JS 沙箱）
- 可视化布局设计器
- 沙箱预览（模拟家庭 / 角色）
- 调试 / 打包 / 私有自用 / 团队共享 / 发布到 Marketplace
- **演进节奏**：先做声明式，6 个月后加 JS 沙箱

#### 4.1 Protocol Driver Agent — 协议驱动生成

协议驱动不是普通表单式插件开发，而是独立 Agent 工作流：

1. 选择协议类型：MQTT、HTTP、TCP、UDP，后续可扩展 Modbus、BACnet、KNX、Matter Bridge。
2. 上传协议文档、抓包或示例 payload。
3. AI 解析 Topic、字段、寄存器、命令、错误码和鉴权方式。
4. 生成标准 JSON Schema / Capability Mapping。
5. 生成受控 JS Driver 脚本。
6. 在沙箱或虚拟 Studio 中运行测试，输出 TestReport。
7. 选择项目中的授权 Studio 部署，支持回滚。

输出：DeviceDriver、DriverManifest、CapabilitySchema、TestReport、DeploymentRecord。

---

## Projects（项目管理）


| 阶段        | 字段                                 |
| --------- | ---------------------------------- |
| Lead      | 来源 / 匹配度 / 客户信息 / 预算 / 时间          |
| Design    | Requirement Brief / DesignPlan / Client Visualization / RiskAssessment |
| Quote     | 报价单（AI 起草） / 设备清单 / 工时 / Studio 选型 |
| Sign      | 合同 / 押金 / 排期                       |
| Deliver   | 现场任务清单 / 进度 / Studio 部署 / 客户签收     |
| Post-care | 工单 / 评价 / Showcase 发布 / Studio 复访  |


> **关键**：每个项目至少关联一台 Studio。项目关闭时 `attribution` 锁定（订阅分佣 / 插件分佣归属）。

---

## Leads（来自 Community 的派单）

- 派单引擎按 区域 + Badge + 评分 + 历史 Persona 风格 + Studio 健康度 综合匹配
- 每条 Lead 标记匹配度（AI 评分） + 推荐回复模板
- 超时机制：默认 30 min 区域伙伴关联 Builder 优先权（详见 `[../00-vision/china-transition.md](../00-vision/china-transition.md)`）

---

## Showcase Composer

> 让 Builder 发布 Showcase 从 4 小时压到 **15 分钟**。

- 从 Project + Studio 一键导入数据（图谱 / 设备 / 插件 / 角色 / 自动化）
- AI 自动生成"设计亮点"和"为什么这样设计"
- AI 自动打标签 + 隐私脱敏（人脸 / 地址 / 敏感物品）
- 必须 Builder 最终审阅，**不能直接发布**（保护内容真实性）
- 发布后看到**归因看板**：「这个 Showcase 带来 8 咨询 / 3 成交 / ¥2400 插件分佣」

命名原则：本模块不使用 `Studio` 后缀，避免和 Aqara Studio（本地运行端）混淆；它的业务对象是 Showcase，因此命名为 `Showcase Composer`。

详见 `[content-flywheel.md](./content-flywheel.md)`。

---

## Marketplace（插件作者视角）

- 我发布的插件列表 / 状态（草稿 / 审核 / 上架 / 下架）
- 用户量 / 评分 / 销量 / 营收
- 版本管理 / 灰度发布
- 用户工单 / 评论回复

---

## Earnings


| 收入项         | 来源                                     |
| ----------- | -------------------------------------- |
| 项目费         | 一次性                                    |
| 订阅分佣        | 用户订阅 Aqara AI，按 Studio + Builder 归属持续分 |
| 插件分佣        | Builder 交付时推荐的插件被用户购买，持续 10–15%        |
| Studio 部署激励 | 每部署一台正式 Studio 的奖励（M5 起）               |
| 区域被动分成      | 仅区域伙伴角色（详见 china-transition）           |
| Lead 转化奖励   | 通过 Community 内容带来的成交                   |
| **保险账户**    | 平台保险池给 Builder 的覆盖明细（M5 起）             |


---

## AI 在 Builder Console 的形态


| 形态               | 场景                                             |
| ---------------- | ---------------------------------------------- |
| **Ambient（环境式）** | Dashboard 上的 Copilot 建议；Composer 旁的"试试这个"      |
| **Invoked（召唤式）** | ⌘K / `/` 唤起："/帮我写 Showcase 介绍"、"/给个 80m² 图谱模板" |
| **Agentic（代理式）** | "把项目自动整理成 Showcase 发布" → 全流程草稿                 |
| **Visual（可视化式）** | "把这个客厅方案生成 3 个成交效果版本" → RenderJob + ClientReviewPackage |


**专门 AI 入口**：**Spatial IQ Studio** — Ask Anything / My Workflows / Agent Marketplace / Visualization Usage / Credits

---

## 现状 vs 目标态对照


| 现状                                                  | 目标态                                                                    |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| Home / Build AI / Studios / Marketplace / Community | 11 模块（见上文导航）                                                           |
| Build AI 是 chat 入口                                  | Build AI 收敛进 Workshop、Client Visualization 和 Spatial IQ Studio        |
| Studios 仅列表 + Connect                               | Studios 全功能（健康 / 远程 / 模板 / 协作 / 审计）                                    |
| Marketplace 混合（AI/官方/开发者）                           | Marketplace 分类清晰 + 评分 + Studio 兼容性                                     |
| Community 论坛形态                                      | Community 完整双面前台（Discover / Showcases / Builders / Plugins / Ideabook） |
| Academy / Forum / Aqara Shop / Official Site 外链     | Academy 内嵌 LMS；Forum 整合到 Community；Shop 内嵌                             |


---

## 落地原则

1. 当前 Builder 的所有功能按 **"Project Suite + Studios 雏形"** 重新审视，无关功能下放或暂时隐藏。
2. **Studios 模块在 M1 必须功能完整**——它是与所有竞品的根本差异。
3. Persona Composer 优先级最高（不是 Plugin Builder）。
4. 不要先做开发者工具——生态没起来就推开发工具会冷启动失败。
5. 设计任何 Builder Console 模块时考虑"是否同时服务多个角色"，能复用就复用。
6. 当前 Builder 左侧导航过于扁平，收敛改造时 **第一视图应为 Dashboard 或 Projects**，不是 Home。
