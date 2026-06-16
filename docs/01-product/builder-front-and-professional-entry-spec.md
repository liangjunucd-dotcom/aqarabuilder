# Builder 前台产品定位与 Professional 入口规约

> Version: v1.0  
> Status: Binding  
> Updated: 2026-06-08  
> Scope: Builder 前台、Professional 入口、Discover、Community、Marketplace、Forum、Credits 与 Builder Pro 跳转  
> Priority: 本文与旧版 Community、Builder Console 或用户旅程描述冲突时，以本文和 `builder-pro-workspace-and-plan-prd.md` 为准。

---

## 1. 产品定位

Builder 是面向普通用户、智能家居爱好者、贡献者、创作者、开发者和潜在 Professional 的用户平台。

产品心智：

```text
智能家居版 YouTube
+
MakerWorld
+
GPT Store
+
轻量远程服务平台
```

Builder MVP 的首要目标是建立长期留存和内容增长，不承担重订单、重履约和平台结算。

核心增长链路：

```text
内容
-> 贡献
-> Credits
-> Professional
-> Builder Pro
```

---

## 2. Builder 与 Builder Pro 边界

| 产品 | 定位 | 核心对象 | 核心动作 |
|---|---|---|---|
| Builder | 用户平台 | 内容、创作、Community、Marketplace、Professional Profile | 发现、创作、分享、Remix、学习、成长 |
| Builder Pro | Professional Workspace Experience | Workspace、Project、Customer、Asset、Service Record | 项目管理、协作、交付、资产与服务 |

强制规则：

1. Builder Pro 是专业工作台能力，不是订阅套餐、认证等级、用户角色或 Community 菜单。
2. Builder 前台不显式展示 Workspace。
3. Builder Pro 始终基于当前 Workspace 工作。
4. Builder 与 Builder Pro 使用同一 Aqara Account 和 Professional Identity。
5. Builder Pro 不进入 Builder 左侧主导航。

---

## 3. 用户状态与成长路径

```text
Builder User
-> Become Professional
-> Professional Free
-> Pro
-> Business
-> Enterprise
```

| 状态 | 身份与计划 | 能力 |
|---|---|---|
| Builder User | Aqara Account + Free Personal Plan | Discover、Create、Community、Marketplace、基础 Credits |
| Professional Free | Professional Identity + Free Personal Plan | Professional Profile、Builder Pro、Personal Workspace、基础专业能力 |
| Pro | Professional Identity + Pro Personal Plan | 更多 Credits、高级模板、高级服务包、商业插件与个人商业能力 |
| Business | Professional Identity + Business Workspace Subscription | Team Workspace、成员协作、共享 Credits、商业交付 |
| Enterprise | Professional Identity + Enterprise Workspace Subscription | 合同 Credits、企业权限、审计、私有能力与服务政策 |

`Professional Free` 是用户状态，不是新的 Plan。Personal Plans 仍只有 `Free / Pro`。

---

## 4. Builder 前台信息架构

### 4.1 主导航

一级入口固定为：

```text
Home
Create
Discover
Community
```

| 入口 | 定位 | MVP 内容 |
|---|---|---|
| Home | 用户首页与增长入口 | 推荐内容、Remix、社区求助与成长触发 |
| Create | 把灵感变成方案 | 空间设计、自动化设计、AI 生成、面板设计 |
| Discover | 统一内容发现与增长入口 | Case、Design、Automation、Plugin、Service、Professional |
| Community | 围绕可复用能力互动 | 分享、点赞、评论、关注、收藏 |

Logo 与 `Home` 菜单均返回 Builder 首页。

Home 负责发现与增长，不展示“继续创作”列表。用户已有方案的任务续接统一进入 `Create` 或 `我的方案`。

Home 不重复展示 Credits 余额或额度卡片；Credits 状态统一由顶部 Credits 入口承载。

Home 与 Discover 的职责必须分离：

| 页面 | 职责 | 交互 |
|---|---|---|
| Home | 编辑推荐与增长入口 | 共创 Hero、社区求助、最多 8 条今日精选、查看全部 |
| Discover | 完整内容浏览器 | 搜索、内容分类、风格筛选、排序、完整内容网格 |

Home 不展示完整分类筛选器。Home 搜索提交后进入 Discover，并携带搜索关键词。

### 4.2 辅助入口

| 入口 | 职责 |
|---|---|
| Marketplace | 获取 Plugin、Template、Agent、Service Package |
| Forum | 技术支持、故障排查、问答沉淀 |
| Find Professionals | 浏览 Professional Profile 和轻量服务能力 |
| My Assets | 查看已获取、兑换或被授予的资产 |

---

## 5. Professional 入口状态机

### 5.1 顶部右侧

登录态顶部右侧固定只展示：

```text
Credits
Avatar
```

不得额外展示：

```text
Become Professional
Builder Pro
Workspace
Notification
```

页面级操作应进入页面内容区，不与全局账号入口并列。

### 5.2 Avatar Menu 第一项

| 用户状态 | Professional 入口 | 说明 | 目标 |
|---|---|---|---|
| Builder User | 不展示 | 头像菜单不承担身份转化 | Home 成长触发或 Account Settings |
| Professional，只有一个 Workspace | Builder Pro | 进入 Professional Workspace | 当前 Workspace Home |
| Professional，拥有多个 Workspace | Workspace | 选择并进入 Professional Workspace | Workspace Picker |

其余账号项：

```text
View Profile
Account Settings
Plans & Credits
Theme
Sign out
```

### 5.3 入口约束

1. Builder 左侧导航、顶部导航和 Footer 不设置常驻 Builder Pro 入口。
2. Avatar Menu 只为已经激活 Professional Identity 的用户展示 Builder Pro / Workspace。
3. Builder User 通过 Home 成长触发或 Account Settings 进入 Professional Onboarding。
4. Credits 不足、导出限制、协作限制等场景可以出现上下文升级触发，但不得伪装成主导航。
5. Workspace Picker 从 Builder 进入时，返回目标为 Builder；从 Onboarding 进入时，返回上一步。

---

## 6. Discover 与 Community

### 6.1 Discover

Discover 是统一内容流，不按产品模块拆成多个互相隔离的首页。

Discover 固定支持：

1. 内容类型：推荐、案例、方案、自动化、插件、求助、专业人士。
2. 案例相关内容可按空间风格进一步筛选。
3. 支持推荐、互动量和发布时间排序。
4. 使用高密度视觉卡片网格，持续承接内容扩展。

内容类型：

| 类型 | 关键动作 |
|---|---|
| Case | 查看、收藏、关注创作者 |
| Design | Remix、保存到 Ideabook |
| Automation | 应用模板、继续编辑 |
| Plugin | 获取、兑换、安装 |
| Service | 查看服务包、发起轻量请求 |
| Professional | 查看档案、关注、联系 |

### 6.2 Community

Community 的核心对象是可复用能力，不是纯文本帖子。

```text
CommunityItem
-> Case | Design | Automation | Plugin | Service | Professional
```

每个 Community Item 必须至少包含：

```text
type
title
summary
creator
primaryAction
engagement
```

Forum 承担产品故障、售后和知识库问答；Community 不复制 Forum。

### 6.3 社区求助

MVP 不将用户建议包装为正式服务或订单。Home 的入口统一命名为 `社区求助`，Community 承接互动和关系建立。

标准流程：

```text
发起求助
-> 选择问题分类
-> 描述场景并上传图片
-> 进入 Community 求助流
-> 社区成员或 Professional 回复
-> 发起人标记有帮助
-> 发起人标记已解决
-> 关注或进入 Professional Profile
```

问题分类固定为：

```text
户型建议
自动化诊断
设备选型
Studio 调优
```

MVP 状态：

| 字段 | 定义 |
|---|---|
| status | `open` / `solved` |
| topic | 问题分类 |
| professionalReply | 带 Professional Identity 标识的建议 |
| helpful | 发起人确认建议有帮助 |
| bestReplyId | 后续用于最佳建议；MVP 可为空 |

连接机制：

1. 所有用户可以评论、收藏和关注。
2. Professional 回复显示身份标识，但不代表平台担保。
3. 发起人可以确认建议有帮助并关闭问题。
4. 回复者可进入 Professional Profile，后续再扩展私密咨询。
5. 求助不会自动创建 Lead、订单或项目。

冷启动规则：

1. 首页优先展示真实待解决问题，不制造虚假浏览量或回复数。
2. 官方与白名单 Professional 保障首批问题获得回复。
3. 优质回复可获得 Credits 激励。
4. 已解决问题可以沉淀为案例、自动化模板或可 Remix 方案。
5. 当某类求助形成稳定需求后，才升级为 Marketplace Service Package。

---

## 7. Credits 规约

Credits 初期是平台统一资源与生态激励单位，不是现金、证券或可提现资产。

来源：

```text
Plan grant
Contribution reward
Manual grant
Referral reward
Add-on
```

用途：

```text
AI
Design
Visualization
Marketplace
Service Package
```

Builder 前台只展示账号可理解的 Credits 余额。系统内部规则：

1. Builder 前台产生或消耗的 Credits 默认记入 Personal Workspace Credit Pool。
2. Builder Pro 内的消耗记入 activeWorkspace Credit Pool。
3. Credits 始终归属 Workspace，成员只有 Spending Limit。
4. MVP 不支持提现、分佣和全球支付。
5. 平台记录 Ledger，支持奖励、消耗、兑换和人工加量。

---

## 8. Professional Onboarding

采用 `Identity First`：

```text
Builder User
-> Become Professional
-> Professional Onboarding
-> Professional Profile
-> Builder Pro
-> Personal Workspace
-> Upgrade Trigger
-> Subscription
```

Professional Onboarding 不要求首次进入时购买计划。

完成后：

```text
professionalIdentity = active
builderProAccess = true
personalPlan = Free
activeWorkspace = Personal Workspace
```

---

## 9. MVP 范围

优先：

1. Discover 统一内容流。
2. Community 可复用能力模型。
3. Credits 贡献与消耗闭环。
4. Professional Onboarding。
5. Avatar Menu 中的 Builder Pro / Workspace 入口。

后置：

1. 项目报价。
2. 平台订单。
3. 支付结算。
4. 平台撮合订单。
5. 服务商团队运营体系。

Business / Enterprise 的数据模型和 Workspace 能力需要保留，但不作为 Builder 前台 MVP 的主叙事。

---

## 10. 验收标准

1. Builder 左侧导航不出现 Builder Pro。
2. 登录态顶部右侧只出现 Credits 和 Avatar。
3. Builder User 的头像菜单不展示 Become Professional、Builder Pro 或 Workspace。
4. Professional 单 Workspace 用户可直接进入 Builder Pro。
5. Professional 多 Workspace 用户先进入 Workspace Picker。
6. Workspace Picker 从 Builder 返回 Builder。
7. Home 首屏展示推荐入口、Remix 主场景与社区求助，Credits 仅在顶部入口展示。
8. Home 不展示“继续创作”和完整分类筛选，只展示最多 8 条今日精选。
9. Discover 展示完整分类、搜索、风格筛选、排序和统一内容流。
10. Community 保持现有互动页面，并支持求助发布、Professional 回复、有帮助和已解决状态。
11. Marketplace 与 Forum 保持独立职责。
12. Professional Identity、Subscription、Certification 和 Workspace 不互相替代。
