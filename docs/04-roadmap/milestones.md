# Roadmap & Milestones

> 阶段性目标 + 关键依赖。日期以季度为颗粒度。
> 所有里程碑围绕 **平台直管 Builder Network 建设 + Studio 驱动的交付闭环 + 内容飞轮启动** 三条主线展开。
> 海外灯塔市场：**阿联酋（迪拜 / 阿布扎比）**。

---

## 顶层视图

```
2026 Q2  ──┬─ M0  规划文档冻结（current）
           │
2026 Q3  ──┼─ M1  Builder Console MVP（Project Suite + Studio 互联）
           │
2026 Q4  ──┼─ M2  Persona Composer + Aqara Life α + Studio 远程协议
           │
2027 Q1  ──┼─ M3  Community 前台 + Showcase Composer
           │
2027 Q2  ──┼─ M4  Aqara Academy + Badge 体系上线
           │
2027 Q3  ──┼─ M5  阿联酋灯塔市场启动 + 平台保险池 v1
           │
2027 Q4  ──┼─ M6  Plugin Builder + Marketplace 邀请制
           │
2028 Q1  ──┼─ M7  全球公测 + 开发者公开注册
           │
2028 Q2+ ──┴─ M8+ 北美 / 欧洲 / 日本 City Lead 制扩张
```

---

## M0 — 规划冻结（2026 Q2）

**目标**：所有产品 / 角色 / 架构决策固化进 `docs/`。

| 工作项 | 状态 |
|---|---|
| 品牌架构 / 战略 / 中国过渡 / **全球网络模型** | ✅ |
| Builder 双面平台规格 + **Studio 整合** | ✅ |
| 角色模型（**ACB**） + Badge 体系 | ✅ |
| 系统架构 + 数据模型 + API 划分 | ✅ |
| Roadmap | ✅ |
| 仓库初始化 + GitHub 同步 | ✅ |

**完成标志**：仓库 push 到 GitHub，团队可基于文档讨论实现细节。

---

## M1 — Builder Console MVP（2026 Q3）

**目标**：把当前 Aqara Builder 雏形收敛为 **Project Suite + Studio 互联**，跑通 ACB 单人闭环。

### Scope

- ✅ Auth + ACB Profile（Badge 字段先有，Badge 颁发逻辑可后置）
- ✅ Studio 连接（云端列表 + Connect → 远程操作）
- ✅ Projects 全生命周期（Lead → Quote → Sign → Deliver → Post-care）
- ✅ Space Editor v1（节点 / 边编辑 + 户型导入），数据 push 到 Studio
- ✅ 基础 Dashboard（无 Copilot 建议）
- ✅ Earnings v1（项目费记录，先不接订阅 / 插件分佣）

### 技术里程碑

- monorepo 落地（pnpm workspaces + turbo）
- 后端单体（NestJS / FastAPI 二选一决策）
- Postgres + Neo4j + Redis 基础设施
- **Builder ↔ Studio 端到端加密通道**（Phase 1 安全基线）
- CI/CD（GitHub Actions）跑通

### 不做（明确剔除）

- ❌ Persona Composer（M2）
- ❌ Showcase Composer（M3）
- ❌ Plugin Builder（M6）
- ❌ Community 前台（M3）
- ❌ AI Copilot（M3）

---

## M2 — Persona Composer + Aqara Life α + Studio 远程协议（2026 Q4）

**目标**：千人千面闭环跑通——Builder 在 Aqara Builder 组装 → 推送到客户 Studio → Aqara Life 显示。

### Scope

- ✅ Persona Composer v1（覆盖所有内置 Role）
- ✅ Aqara Life α（声明式插件运行时，10 个官方插件）
- ✅ 三层覆盖配置 + 推送 / 恢复 / 重交付
- ✅ Family / Member 数据模型
- ✅ **Studio 远程协议正式版**（Builder 远程编辑 + 客户授权 + 操作审计）
- ✅ 设备 → Persona → Studio 数据贯通

### 技术里程碑

- 声明式 Manifest schema 冻结
- Aqara Life iOS / Android 内测包
- Aqara Home 共账号过渡机制
- Studio 客户授权窗口 + 时间限制 + 审计日志

---

## M3 — Community 前台 + Showcase Composer（2027 Q1）

**目标**：内容飞轮启动期。

### Scope

- ✅ Community 前台（Discover / Showcases / Builders / Ideabook / My）
- ✅ Showcase Composer v1（AI 起草 + Builder 审阅 + 归因看板）
- ✅ Lead 派单引擎 v1（区域 + Badge 匹配）
- ✅ Builder Copilot v1（Ambient + Invoked，Agentic 后置）
- ✅ 种子内容 50–100 个 Showcase（Aqara 内部 + 头部服务商共创）

### 关键依赖

- LLM Gateway 上线 + Prompt Cache 开启
- AI 起草 prompt + RAG 知识库就绪
- 内容审核策略（自动 + 人工抽检）

### 关键 KPI

- Builder 发布一个 Showcase 的耗时 ≤ 30 min
- 月度活跃 Builder 发布率 ≥ 60%

---

## M4 — Aqara Academy + Badge（2027 Q2）

**目标**：标准化培训 + 认证体系正式上线。**这是 Builder 网络全球扩张的前置条件。**

### Scope

- ✅ Academy LMS（线上课程 + 测试，中文 + 英文 + 阿语）
- ✅ Badge 颁发 / 续证 / 吊销流程
- ✅ 区域线下集训日历 + 报名（中国 3 城市 + 阿联酋 1 城市起步）
- ✅ Identity 服务接入 Badge
- ✅ Badge 驱动的权限 / 分佣 / 派单生效

### 关键依赖

- 第一批课程内容（Installer L1 / Spatial Designer L1 / Plugin Developer L1）
- 区域基地建设（迪拜或阿布扎比 1 个海外基地）
- 讲师团队建设（含英语 / 阿语讲师）

---

## M5 — 阿联酋灯塔市场 + 平台保险池 v1（2027 Q3）

**目标**：海外**纯直管 Builder 网络**首次验证。这是检验 [`global-network-model.md`](../00-vision/global-network-model.md) 模型的关键节点。

### Scope

- ✅ **City Lead 雇员到岗**（迪拜 + 阿布扎比各 1 名）
- ✅ 阿联酋本地化（英语 + 阿拉伯语 / 当地法规 / 当地支付）
- ✅ **平台保险池 v1**（全球责任保险，从阿联酋 Builder 起保）
- ✅ 招募首批 30 – 50 名阿联酋 Certified Builder
- ✅ 中东本地体验中心（迪拜 1 个）
- ✅ Studio 中东版（电压 / 频段 / 区域监管适配）

### 关键 KPI

- 阿联酋 Phase 1 末月度活跃 Builder ≥ 25
- 阿联酋 Studio 部署量 ≥ 100 台
- 客户 NPS ≥ 60
- 模型可独立运转，无需服务商层

### 关键依赖

- 阿联酋公司主体 / 法律实体 / 保险经纪
- 海外英语客服团队
- Builder 平台支持非中文 UI 全流程

---

## M6 — Plugin Builder + Marketplace（2027 Q4）

**目标**：开发者生态进入邀请制 alpha。

### Scope

- ✅ Plugin Builder v1（声明式 + 沙箱预览 + 调试）
- ✅ Marketplace 上架 / 审核 / 销售
- ✅ 插件签名 + 版本管理 + 灰度发布
- ✅ 插件分成穿透到 Builder（推荐归属链）
- ✅ 邀请制开发者（首批 50 名）

### 不做

- ❌ JS 沙箱（推迟到 M7+6 月）
- ❌ Native 扩展

---

## M7 — 全球公测 + 开发者公开注册（2028 Q1）

**目标**：从邀请制走向公开生态。

### Scope

- ✅ 跨语言 AI（覆盖 EN / ZH / JA / DE / ES / AR）
- ✅ Aqara AI 订阅在 5 个海外市场上线（含阿联酋）
- ✅ 开发者注册自助化
- ✅ 插件审核流程规模化
- ✅ JS 沙箱运行时
- ✅ Plugin SDK 文档站（`developer.aqara.com`）
- ✅ Spatial IQ Engine 开放部分 API（Agent / Workflow）

---

## M8+ — 北美 / 欧洲 / 日本扩张（2028 Q2 起）

**目标**：基于阿联酋灯塔验证后的可复制模型，进入高端市场。

### 优先级

| 市场 | 起步城市 | City Lead 数 |
|---|---|---|
| 美国 | 洛杉矶 / 迈阿密 | 各 1 |
| 英国 | 伦敦 | 1 |
| 德国 | 柏林 | 1 |
| 日本 | 东京 | 1 |

### 中长期（2029+）

- 中国头部服务商作为 **海外 Master Franchise** 输出方
- 进入印度 / 东南亚 / 拉美等中等市场（Master Franchise 模式）

---

## 横向工作流（贯穿所有 M）

| 工作流 | 责任 |
|---|---|
| 安全 / 合规 | 每个 M 配安全 review + 合规检查（GDPR / 个保法 / CCPA / 阿联酋数据法） |
| 可观测 | OpenTelemetry / 日志 / 指标 / 错误追踪从 M1 起 |
| **Studio 健康监控** | 从 M1 起，所有 Studio 上报统一指标，反向影响 Builder 评分 |
| **平台保险池** | M5 起持续投入；任何 Builder 现场操作都覆盖责任保险 |
| 文档同步 | 任何决策变更先改 `docs/` 再写代码 |
| Memory 同步 | 重大策略变更同步到 Claude memory |

---

## 风险与依赖追踪

| 风险 | 缓解 |
|---|---|
| Aqara Life 端原生资源不足 → M2 延期 | 提早确认人力，必要时降级先做 PWA |
| AI 起草质量不达标 → 飞轮启动失败 | 早做 prompt 评估集，灰度发布 |
| 服务商抵触 → 中国 Builder 招募慢 | 区域伙伴转型机制 + 被动收入预估工具先上 + 海外 Master Franchise 输出激励 |
| LLM 成本失控 | Prompt Cache 强制 + 配额 + 监控 |
| 阿联酋灯塔失败 → 全球扩张推迟 | 失败先复盘是模型问题还是执行问题；模型问题回到 M0 调整，执行问题换 City Lead |
| 平台保险池亏损 | Phase 1 用第三方保险经纪兜底，Aqara 不直接承保；规模化后再自营 |
| 海外合规 | 法务前置审查，必要时分区部署 |
| **Studio 远程协议安全事件** | 端到端加密 + 客户授权窗口 + 操作审计 + 红队演练 |

---

## 落地原则

1. 每个 M 完成定义为 **"团队可基于此发布对外功能"**，不是内部 demo。
2. 优先级永远是：**Builder 工作流闭环 + Studio 交付链路 > 内容飞轮 > 生态开放 > 海外扩张**。
3. 任何 M 的 Scope 调整都要回到这份 Roadmap 更新，再调整代码。
4. 不做"开发者优先"，**生态没起来就推开发工具会冷启动失败**。
5. **海外扩张严格按灯塔（阿联酋）→ 高端市场 → 中等/新兴市场顺序**，不要跳级。
6. 阿联酋 M5 是关键检验节点——失败必须复盘模型，不要带病扩张。
