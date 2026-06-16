# Community 前台规格

> Aqara Builder 平台的 C 端 + ACB 引流站点。访问入口：`builder.aqara.com`（未登录或 User 角色看到的视图）。
>
> 2026-06-08 更新：Builder 前台导航、Professional 入口、Community 内容类型与 MVP 优先级以 [`builder-front-and-professional-entry-spec.md`](./builder-front-and-professional-entry-spec.md) 为准。本文保留案例、Profile 和内容详情的扩展规格，不再定义顶层导航。

> 社区求助的分类、状态、Professional 回复与冷启动规则，以该规约的“社区求助”章节为准。MVP 求助不创建订单或正式服务关系。

---

## 顶层导航

| 入口 | 内容 |
|---|---|
| **Discover** | 灵感流（混合 Showcases / 文章 / 短视频 / Persona 案例）|
| **Showcases** | 完整项目案例库，可按风格 / 户型 / Persona / 设备 / 区域筛选 |
| **Builders** | 认证 Builder 目录（Aqara Certified Builders），按 Badge / 区域 / 评分 / 服务范围筛 |
| **Plugins** | Aqara Life 插件市场，可预览、安装到家庭 |
| **Learn** | 内容学习区：用户教育 + Builder 培训预告（深入培训在 Aqara Academy）|
| **My** | Ideabook / 订阅 / 家庭 / 联系过的 Builder / 已购插件 |

---

## 核心用户旅程

### Journey A — 找灵感 → 落地到我家

```
Discover 浏览 → 收藏到 Ideabook → 打开 "落地到我家"
   → AI 询问户型 / 家庭成员 / 预算 → 生成"我家版本预案"
   → 推荐匹配 Certified Builder（按区域 + Badge + 评分）→ 联系 → Lead 进入 Builder Console
```

### Journey B — 直接找 Builder

```
Builders 目录 → 筛选条件（区域 / Badge / 风格）→ Builder Profile
   → 看作品集 / 评价 / 价格区间 / Aqara Certified 徽章 → 发起咨询 → Lead 派单
```

### Journey C — 浏览插件 → 安装

```
Plugins 市场 → 详情页（带 Persona 演示 / 评分 / 兼容设备 / Studio 兼容性）
   → 安装到 Aqara Life（通过 Studio 同步）
   → （可选）联系交付该插件的 Builder 上门优化
```

---

## 关键页面

### 1. Showcase 详情页

| 模块 | 内容 |
|---|---|
| 头图 + 标题 + 风格标签 | — |
| **Spatial Ontology Badge** | 显示该项目使用的本体复杂度（节点数 / 关系数 / 推理规则数）|
| **Personas Used** | 该项目为家庭成员组装的 Persona 列表 |
| **Devices & Plugins** | 设备清单（可点击买） + 插件清单（可点击安装） |
| **Studio Setup** | 该项目部署的 Studio 配置（脱敏） |
| Builder 卡片 | 头像 / **Aqara Certified 徽章** / Badge / 联系按钮 |
| 设计亮点（AI 起草 + Builder 审阅） | 故事化描述 |
| 评论 / 评分 / Ideabook 收藏 | 社交互动 |

### 2. Builder Profile（Aqara Certified Builder 公开档案）

| 模块 | 内容 |
|---|---|
| 头像 / 简介 / 区域 | — |
| **Aqara Certified 徽章** | 平台公信力的核心展示 |
| **Badge 墙** | 所有获得的 Aqara Academy Badge（详见 [`../02-roles/badge-catalog.md`](../02-roles/badge-catalog.md)） |
| **Personas Designed** | 累计设计的 Persona 数 |
| **Spatial Ontology Coverage** | 本体类型覆盖广度（住宅 / 办公 / 商业 / 适老化 ...） |
| **Studios Deployed** | 累计部署 Studio 数 |
| **Plugins Authored** | 发布过的插件 |
| 作品集 | Showcases 网格 |
| 评价 / 案例数 / 响应速度 | 量化指标 |
| 联系 / 预约 | 主 CTA |

### 3. Ideabook

- 收藏的 Showcase / 单图 / 设备 / 插件混合
- "落地到我家" AI 工作流入口
- 私密 / 公开 / 邀请协作三种模式

### 4. Discover

- 个性化推荐流（首页未登录显示热门）
- 维度：风格 / 户型 / 区域 / Persona / 季节 / 节日
- 视觉搜索：上传图片找类似空间

---

## AI 在前台的形态

| 形态 | 场景 |
|---|---|
| **Ambient（环境式）** | Discover 个性化排序、Ideabook 自动归类 |
| **Invoked（召唤式）** | "落地到我家"、视觉搜索、跨语言翻译 |
| **Agentic（代理式）** | "帮我筛选并联系 3 位 Certified Builder 报价" |

详见 [`../03-architecture/ai-system.md`](../03-architecture/ai-system.md)。

---

## 与 Builder Console 的关系

- **同一账号体系**，登录后可切换"普通用户视图 / Builder 视图"
- 用户在 Community 发起的咨询 / 收藏 / 评论 → 实时进入对应 Builder 的 **Leads** / **Content Analytics**
- 详见 [`content-flywheel.md`](./content-flywheel.md) 的归因机制

---

## 全球化原则

- **单一站点 + 智能本地化**，不分语言版本域名
- Builder 推荐区域化（默认匹配用户所在城市），但**全球可见**——支持跨国流动 Builder
- 内容多语言由 AI 翻译 + Builder 可手动覆盖
- 阿联酋灯塔市场上线时，UI 支持英语 + 阿拉伯语首发
