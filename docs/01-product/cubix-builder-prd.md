# Cubix Spatial IDE × Aqara Builder · PRD

> 版本：v0.1 · 草案
> 范围：Cubix Spatial IDE（桌面 / Web）、Builder 前台（Web Lite）、Studio 运行时（M300）
> 受众：产品 / 工程 / 商业 / 服务商运营 / 投资人

---

## 0. 文档说明

本 PRD 把"空间智能 IDE（Cubix）"、"Builder 前台 / 后台"、"Studio 运行时"作为三件套，形成一个完整的 **AI-Native × Spatial-Native × Builder Economy** 闭环。
本 PRD 用于：方向校准、需求分解、研发优先级、投资人沟通。

---

## 1. 产品愿景与北极星

### 1.1 一句话定义

> **Cubix 是世界上第一个 Spatial-Native AI IDE — 让人人能用一句话设计、实施、交付一个智能空间；Builder 是它的社区、协作与商业化平台。**

### 1.2 北极星指标（NSM）

**Weekly Active Vibe-Designed Spaces (WAVS)** —— 每周通过 Cubix 设计、部署或迭代过的活跃空间数。

子指标：
- Cubix Daily Active Builders (DAB)
- Solutions Published / Week
- "Open in Cubix" CTR（Marketplace → IDE）
- Studio Deployments / Solution
- Builder Earnings / Active Builder

### 1.3 战略三性（缺一不可）

| 性质 | 含义 | 与既有竞争对手的区别 |
|---|---|---|
| AI Native | 对话主导 + Plan / Agent 模式 | HA / SmartThings / Tuya 是 GUI 优先 |
| Spatial Native | 万物以"空间"为根 entity | Cursor / Replit 是文件系统 |
| Builder Economy | 方案 = 资产，可 Remix / 订阅 | Tuya Cube 是项目工厂模式，无社区飞轮 |

---

## 2. 竞品分析

| 维度 | Home Assistant | Tuya IoT Cube | SmartThings | Cursor / Replit | Roblox Studio | **Cubix + Builder** |
|---|---|---|---|---|---|---|
| 形态 | 开源中枢 | 厂商低代码工厂 | 厂商生态 | AI 代码 IDE | UGC 创作引擎 | AI Native + Spatial + 商业 |
| 主输入 | YAML / GUI | 拖拽 | 移动 App | 编辑器 + Chat | Studio + 模板 | 对话 + Agent |
| 空间感知 | 弱 | 弱 | 弱 | 无 | 3D 内置 | First-class（图谱） |
| Builder 经济 | 无 | 弱（项目交付） | 无 | 无 | 强 | 强（方案订阅 + Remix） |
| 商业模式 | 捐赠 | 项目软件费 | 硬件捆绑 | 订阅 | UGC 分润 | 订阅 + 分润 + 硬件合约 |
| 主要威胁度 | 低 | **高（最像）** | 中 | **中（有可能向下扩展）** | 低 | — |

**结论**：在"AI Native + Spatial + 商业飞轮"三角同时具备的厂商，目前业界尚无第二家。
**主要威胁**：
- Tuya —— 最像 Cubix；要靠 **空间运维（户型解析 / 现场实施 / Studio 远程隧道）** 拉开差异。
- Cursor / Replit —— 若推 IoT 插件市场，会从顶部往下打；要靠 **Studio 物理硬件 + Builder 经济** 守住下半盘。

---

## 3. 用户与场景

### 3.1 角色分层

| 角色 | 定义 | 核心价值 |
|---|---|---|
| Anonymous | 未登录访客 | Marketplace 浏览、Cubix 试用 |
| User（Free / Plus） | 普通注册用户（极客、家庭） | 日常控制、虚拟方案、私有保存 |
| Builder | 普通 Builder（注册 → 已实施过 ≥ 1 单） | 现场实施、方案复用 |
| Pro Builder（认证） | 通过认证的服务商 | Marketplace 上架、客户管理、分润 |
| Admin | Aqara 内部 / 区域代理 | 审核、培训、运营 |

### 3.2 三大典型旅程

#### A) 普通用户 → 极客 → Builder（需求孵化）
1. 安装 Aqara Life，使用日常控制
2. Builder 前台浏览方案 → "Open in Cubix" 试用
3. 在 Cubix 中虚拟创作做出第一个方案，保存到"我的方案"
4. 申请认证 Builder，开始服务客户

#### B) 服务商现场交付（核心生产力场景）
1. 上门勘测 → 上传户型图 → Cubix 解析生成空间图谱
2. 与客户对话生成方案 → 部署到客户 Studio → 现场调试
3. 远程通过 MCP 隧道维护（无需上门）
4. 方案沉淀到 Solution Library 复用 / 订阅 / 上架

#### C) 教育 / 学生 → 未来 Builder（战略储备）
1. 学生认证 → 免费 Sandbox + 教学方案库
2. 课程项目 → Marketplace 发布
3. 毕业转 Pro Builder 认证，3 个月免月费

---

## 4. 系统拓扑与数据契约

### 4.1 三件套关系

```
┌────────────────────────────────────────────────────────┐
│                Builder 前台 (Web)                       │
│  · Landing / Dashboard / My Studios / 方案库           │
│  · 商业化（订阅 / 上架 / 分润）                         │
└──────────┬──────────────────────────────────────────────┘
           │ Builder 账号 SSO
           ▼
┌────────────────────────────────────────────────────────┐
│           Cubix Spatial IDE (桌面 / Web)                │
│  · 对话主导 + Agent (Space / App / Protocol / ...)     │
│  · 画布: Topology / Studio / Diagnostic                │
└──────────┬──────────────────────────────────────────────┘
           │ MCP 远程免密隧道
           ▼
┌────────────────────────────────────────────────────────┐
│        Studio (M300 / Studio OS / 客户网关)             │
│  · 空间图谱、设备 / 场景 / 自动化运行时                 │
└────────────────────────────────────────────────────────┘
```

### 4.2 数据契约（v0.3 · 统一原语）

> **设计哲学：** Builder（Installer）和普通用户是同一种实体。系统只提供 4 个对所有用户对称的原语：
> **Bind / Workspace Move / Transfer / Operator Grant**。
> 任何"Builder 服务流"都是这 4 个原语 + Order 的组合。

| 实体 | 唯一来源 | DC 锚 | 同步方向 |
|---|---|---|---|
| DataCenter | Aqara IAM 元数据 | 自身 | 全局只读（CN/US/EU/SG/KR/RU 共 6 个） |
| Account | Aqara IAM | 注册国家决定，几乎不可变 | 所有端共享 |
| Workspace | 用户自建（无类型） | == ownerAccount.dc | 任何用户可有 N 个；App 不暴露概念 |
| Home（C 端心智） | App 侧映射 | == 当前账号 dc | App 内等价于一台 Studio / CloudHome |
| Studio | 物理硬件注册 | == 当前 owner.dc | Bind 后落 owner Personal WS；Transfer 时同 DC 原子 / 跨 DC 走 handoff |
| TransferToken | Studio.owner 签发 | == fromAccount.dc | 任何 owner 可签发；接收方任意账号 |
| OperatorGrant | Studio.owner 签发 | grantee 与 studio 可跨 DC | 跨 DC 鉴权 + 路由 |
| Space Topology | Studio 实时态 | == Studio dc | Studio → Cubix（跨 DC 路由） |
| Solution（方案） | Builder 方案库 | == 创建者 dc | Cubix → Builder（保存）；Builder → Cubix（Open in Cubix） |
| Plugin / Protocol | Builder 资产库 | 全局可分发 | Cubix → Builder（发布）；Studio ← Cubix（部署） |
| Session（对话） | Cubix 本地 + Builder 同步 | == 当前账号 dc | Cubix → Builder（云端归档） |
| Order / Project | Pro Console（Verified Builder 创建） | == 客户 dc | 商业层；关联 Bind + Transfer + 部署 + 验收 → 结算 |
| StudioOwnershipEvent | 后台事件流 | == Studio dc | bind / move / transfer / grant / revoke / reset 全量审计 |

> 关键约束：
> - **Workspace 没有类型** —— Personal / Service / Team 等区分不再存在；都是用户自建的"文件夹"。
> - **Bind 永远绑到 binder 自己的 Personal Workspace**；之后由 binder 自由 Move 或 Transfer。
> - **Builder 短暂持有客户 Studio 不影响隐私** —— 通过 `Studio.intent = service-pending-transfer` 与 App 默认过滤实现。
> - **跨 DC Transfer 是显式 4 步**（导出 Bundle → 复位 → 重绑 → 导入），永不静默迁移。
>
> 完整生命周期、4 个原语 API、跨区交付流程见：
> [`account-and-studio-lifecycle.md`](./account-and-studio-lifecycle.md)

### 4.3 角色边界（明确"谁能做什么"）

| 能力 | Anonymous | User | Builder | Pro Builder |
|---|---|---|---|---|
| 浏览 Marketplace | ✓ | ✓ | ✓ | ✓ |
| 试用 Cubix（Sandbox） | 受限 | ✓ | ✓ | ✓ |
| 连接 Studio（远程） | ✗ | ✓（自己的） | ✓（被授权） | ✓（被授权） |
| 保存方案（私有） | ✗ | ✓ | ✓ | ✓ |
| 上架 Solution Library | ✗ | ✗ | ✗ | ✓ |
| Marketplace 发布 / 分润 | ✗ | ✗ | ✗ | ✓ |
| 客户 / 工单管理 | ✗ | ✗ | ✗ | ✓ |

---

## 5. 功能需求

### 5.1 Cubix Spatial IDE

#### 5.1.1 对话主导 IDE

- **唯一主输入框**：所有意图都从这里发起。
- **Plan / Agent 模式**：
  - Plan 模式：输出可逐步审阅 / Skip / Accept 的步骤卡。
  - Agent 模式：直接执行（仅破坏性操作仍需确认）。
- **上下文**：当前 Workspace、Studio、SolutionDraft、Session ID。
- **会话历史**：左侧侧栏，按 Workspace · Studio 分组；可重放、可删除。

#### 5.1.2 Agents

| Agent | 职责 | 必需 Studio? | 主画布 | 关键交互 |
|---|---|---|---|---|
| **Space** | 设计空间方案 | 否（虚拟可创作） | Topology | 户型图上传、虚拟/真实模式切换、Remix |
| **App** | 生成 Aqara Life 主页 / 插件 | **是** | 移动预览 + 插件包 | 必须先选择 Studio，读取设备 / 场景 / 成员 |
| **Protocol** | 协议驱动开发 | 否（部署需 Studio） | 协议解析向导 | 用户上传协议 → AI 解析 → 测试 → 部署 |

> **未来可扩展（Plugin Architecture）**：诊断 Agent、运维 Agent、能效优化 Agent；按 plugin 注册到 IDE 的 Agent 列表。

#### 5.1.3 Solution Lifecycle

```
draft  →  deployed  →  saved  →  published（Marketplace）
       ↘            ↗
        floorplan / virtual / studio / remix（来源）
```

支持的入口：
- **虚拟创作**：未连 Studio 即可设计；连接后可一键部署。
- **Studio 现场**：连接 Studio → 基于实时数据生成方案 → 部署。
- **户型图导入**：对话内上传户型图（PNG / JPG / PDF / DWG / DXF），AI 解析合并到图谱。
- **Open in Cubix（Remix）**：从 Builder 方案库二创，保存时支持"另存为新方案"或"更新原方案（自增版本号）"。

#### 5.1.4 户型图与 @ 引用

- 输入框附件按钮（Paperclip）支持上传户型图 / 文档；hover 提示"支持上传参考户型图，上传后可在输入框用 @ 精确引用"。
- 上传后自动在输入框插入 `@<filename>`，并触发空间图谱解析。

#### 5.1.5 协作

- Workspace 级权限（Owner / Operator / Viewer）。
- Operator 远程访问 Studio 时需走"申请授权 → 通过"流程；Owner 直接 Connect。

---

### 5.2 Builder 前台（Web Lite）

| 模块 | 子页面 | 关键能力 |
|---|---|---|
| Landing | / | 价值主张、功能、定价、Get Started |
| Dashboard | /home | 入口聚合（待办、最近 Studio、收益） |
| My Studios | /home/studios | Workspace 切换、Studio 列表、远程 Connect |
| Solutions | /home/solutions | 我的方案、Open in Cubix、Remix |
| Marketplace | /home/marketplace | 公开方案、订阅、Remix |
| Pro Console（Pro 限定） | /pro/* | 客户管理、Solution Library、收益分润、团队 Workspace |

### 5.3 Studio（运行时）

- **空间图谱**：房间、家具、设备、人物（first-class entity）。
- **设备清单 / 场景 / 自动化**：可由 Cubix 远程下发或现场配置。
- **MCP 远程免密接入**：基于 Builder 账号短期 token，白名单网关。
- **本地优先**：所有自动化在 Studio 本地执行；云仅做协作与同步。

### 5.4 Marketplace 经济

- 方案订阅（按方案 / 月）：买家订阅后可 Open in Cubix 部署到自己 Studio。
- 插件订阅（协议驱动 / Persona 模板 / 自动化包）。
- 分润：**Builder 70% / 平台 30%**（行业有竞争力）。
- 订阅者免重复购买更新版本（自动更新）。

---

## 6. 非功能性需求 (NFR)

| 维度 | 指标 |
|---|---|
| 远程隧道 | RTT P95 < 200 ms（同区域） |
| 户型图解析 | < 30 s（≤ 5 MB） |
| 方案部署 | < 60 s（小型方案 < 30 节点） |
| 离线模式 | Cubix 可离线设计；不能部署 / 远程控制 |
| 安全 | MCP token 时长 ≤ 30 min；操作审计 ≥ 90 天 |
| 国际化 | 中 / 英；支持东南亚常用语 v1.5 |

---

## 7. 商业化与定价

### 7.1 订阅档位

| 档位 | 价格 | 包含 |
|---|---|---|
| Free | $0 | Sandbox（1 台）、Cubix 基础、私有方案 1 个 |
| Plus | $9.9 / 月 | 多 Studio、虚拟创作、户型图、私有方案不限 |
| Builder | $29 / 月 | Solution Library、订阅他人方案、客户管理（基础） |
| Pro Builder | $79 / 月 | Marketplace 上架、分润、Workspace 团队、Pro Console |
| Education | $0（学生认证） | Plus 等价 + 教学方案库 |

### 7.2 硬件 + 订阅合约（关键创新）

| 模式 | 起付 | 月费 | 24 月 TCO |
|---|---|---|---|
| 现金购买 M300 | $399 + 订阅 | — | $399 + 订阅 |
| **合约：M300 0 元 + Pro Builder $79 × 24** | **$0** | **$79** | **$1,896** |
| 教育合约：M300 0 元 + Edu | $0 | $0 + 数据回传协议 | $0 |

**为什么合约模式是主轴**：
1. 抹平 $399 启动门槛，转化率提升 3–5×；
2. 24 个月订阅锁定 ARPU；
3. 一个合约 Builder ≈ 一个会复用方案的人 → Marketplace 越活越大；
4. 用户已被 iPhone 24 期免息、网络运营商合约教育，无认知成本。

### 7.3 收入模型

```
ARR = 订阅 ARPU × 活跃 Builder 数
    + 方案订阅 GMV × 30% 抽成
    + 硬件分期回款
```

**飞轮**：
- Builder 用工具节省 50–70% 实施时间 → 项目利润 ↑ → 续约率 ↑
- 方案在 Marketplace 卖订阅 → 长尾被动收入
- 平台抽成 + 硬件锁定 → ARR 复利

---

## 8. 增长 / GTM

### 8.1 PMF 验证：Builder 50 计划（60 天）

| 周 | 动作 | 退出条件 |
|---|---|---|
| W1-W2 | 邀请 50 名候选 Builder（普通服务商 + 5 名 KOL 极客） | 50 人确认参与 |
| W3-W4 | 1:1 onboarding + 免费 M300 + 6 个月 Pro Builder（条件：每周 1 个 Solution） | 每人首次部署 |
| W5-W6 | 周更直播 "Build with Cubix" + Marketplace 头部 5 方案推流 | 视频累计 5 万播放 |
| W7-W8 | NPS / 留存测量 | NPS > 60 且月留 > 80% → 扩量 |

### 8.2 学生计划

- 与 IoT / 嵌入式专业 50 所院校合作。
- 免费 M300 + Edu 订阅 + 教学方案库（6 个标杆课程）。
- 毕业转 Pro Builder 认证，前 3 个月免月费。

### 8.3 内容 / 社区飞轮

- "Build with Cubix" 周更视频系列（B 端 + C 端各一档）。
- Marketplace 头部方案 = 内容素材。
- Builder Champions 排行榜（方案数、订阅数、部署数三榜）。

### 8.4 关键传播杠杆

- **Open in Cubix（一键 Remix）**：让 Marketplace 浏览即试穿；把"看"变成"用"。
- **客户分享链接**：客户家方案脱敏后生成分享卡，二度传播给朋友。
- **业内裂变**：方案上架后默认带"Built by [Builder]"署名，客户搜索流量回引。

---

## 9. 路线图

| 时段 | 里程碑 |
|---|---|
| **M0–M1（已在做）** | Builder 前台 + Cubix 桌面 alpha + 50 名种子 Builder 闭环 |
| **M2–M3** | App Agent / Protocol Agent + Solution 双向流转 + 户型图解析 |
| **M4–M6** | Marketplace + 分润 + 硬件合约 + 学生计划试点 |
| **M7–M9** | 多 Studio 同方案部署、能效 / 诊断 Agent、Plugin 商店开放第三方协议 |
| **M10–M12** | 国际化（东南亚 / 欧洲）、企业版（连锁酒店 / 适老化机构） |

---

## 10. 风险与应对

| 风险 | 概率 | 影响 | 应对 |
|---|---|---|---|
| Tuya 同向竞争 | 高 | 高 | 强化 AI Native + Spatial + 现场实施差异化 |
| 硬件补贴现金流压力 | 中 | 高 | 合约模式 + 押金 + 信用风控 + 早期严控配额 |
| Builder 留存差 | 中 | 高 | Builder Champions 深度运营，60 名标杆 |
| 方案抄袭 / 盗版 | 中 | 中 | 脱敏 + 版本溯源 + 订阅锁 + 水印追踪 |
| MCP 安全事故 | 低 | 极高 | 短期 token、审计、白名单、安全审计 |
| 监管（数据出境 / 隐私） | 中 | 高 | 本地优先架构、Studio 端边缘执行、合规分区部署 |

---

## 11. 验收 / 可观测

每个核心 Agent 必须可量化：
- Space Agent：方案生成成功率、户型图解析准确率、部署成功率。
- App Agent：生成 → 扫码 → 用户领取 → 7 日留存。
- Protocol Agent：协议解析准确率、测试通过率、部署成功率。

平台级：
- WAVS、DAB、Solution 复用率、Marketplace GMV、Builder NPS。

---

## 12. 开放问题（需要决策的）

1. **教育合约的"数据回传协议"** 边界在哪？是否只回传脱敏使用日志？
2. **Marketplace 抽成 30%** 是否对头部 Builder 阶梯递减（如 GMV > $50K / 月降到 20%）？
3. **Free 档位是否长期存在**，还是 14 天试用 → 必须升级到 Plus？
4. **Cubix Web 版** 是否做？还是只做桌面，Web 仅用于 Builder 前台？
5. **国际化首发地区**：东南亚（IoT 增长快、价格敏感）还是欧洲（适老化场景刚需）？

---

## 附录 A：术语表

- **Cubix**：Aqara Spatial IDE 产品名（IDE 桌面 / Web 应用）。
- **Builder**：使用 Cubix 创作 / 服务客户的人；分普通 Builder 与 Pro Builder。
- **Studio**：基于 M300 的空间运行时，是物理网关 + 软件运行环境。
- **Workspace**：一个 Builder 账号下的"空间集合"（如"我的家"、"客户 A"）。
- **Solution**：可保存、订阅、Remix 的设计资产。
- **MCP 隧道**：Cubix → Studio 的远程免密通道（基于 Aqara Builder 账号鉴权）。
- **Spatial Agent**：以"空间"为操作对象的 AI 代理（Space / App / Protocol / …）。

