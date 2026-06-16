# Aqara Studio + Aqara Builder

> **Studio 是空间智能的"原子单位"。Aqara Builder 是云端控制面与协作平台。两者协同构成完整的空间智能交付与运营基础设施。**

---

## 一、Aqara Studio 是什么

> **Aqara Studio = 部署在客户场所的本地空间智能操作系统。**

| 形态 | 路由器/边缘设备形态，跑在 Aqara Edge Hub（M300 等）或类 PC 形态硬件上 |
|---|---|
| 网络 | 用户在**局域网**通过浏览器直接访问（如 `http://10.11.50.36/`），类比家用路由器后台 |
| 远程 | 通过 **Aqara Builder（云端）** 连接 Studio，实现远程协作、远程交付、远程维护 |
| 数据 | 本地优先（家庭数据不强制上云），可选择性同步到云做飞轮训练 |
| 能力 | 本体图谱 / 设备管理 / 自动化 / 能耗 / 告警 / 日志审计 / 用户管理 / 备份 / 插件 |

### 核心模块（参考现有界面）

```
Aqara Studio
├── 概览（Dashboard）
├── 构建
│   ├── 空间管理（Space Topology / 本体图谱可视化）
│   ├── 设备管理
│   └── 自动化
├── 运维
│   ├── 能耗管理
│   ├── 告警中心
│   └── 日志审计
├── 管理
│   ├── 用户管理
│   ├── 备份与还原
│   └── 设置
└── 扩展
    ├── 插件中心
    └── 开发者
```

> Studio 是 **本地完整可运行**的——即使断网，家庭依然正常工作。**Aqara Builder 不是 Studio 的"必需品"，而是 Studio 的"协作放大器"**。

---

## 二、Aqara Builder（平台）是什么

> **Aqara Builder = 云端协作 + 商业化 + 内容飞轮平台**，把分散的 Studio + Builder（人）+ End User + Aqara 串成一个完整的生态。

详见 [`builder-two-sided.md`](./builder-two-sided.md)。

### 与 Studio 的关系

```
                ┌────────────────────────────────┐
                │     Aqara Builder (云端)        │
                │  ─────────────────────────     │
                │  • Builder 工作台              │
                │  • Lead 派单 / CRM             │
                │  • Content / Showcase / 飞轮   │
                │  • Marketplace / 插件分发       │
                │  • Earnings / 分佣 / 保险池     │
                │  • Studio 健康/质量监控         │
                └────────────────┬───────────────┘
                                 │ secure connection
            ┌────────────────────┼─────────────────────┐
            ▼                    ▼                     ▼
   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
   │  Studio 实例 A │   │  Studio 实例 B │   │  Studio 实例 C │
   │  (家庭客户)    │   │  (商业空间)    │   │  (酒店项目)    │
   │  本地浏览器访问 │   │  本地浏览器访问 │   │  本地浏览器访问 │
   └────────┬───────┘   └────────┬───────┘   └────────┬───────┘
            │                    │                    │
   ┌────────▼───────────────────▼────────────────────▼────────┐
   │              Aqara Life App (终端用户使用)                │
   │             （插件化 + 千人千面 + Pro 交付的 Persona）    │
   └────────────────────────────────────────────────────────────┘
```

### 角色视角下的访问路径

| 角色 | 主要入口 |
|---|---|
| **End User** | Aqara Life App + 偶尔通过 ai.aqara.com / Community 浏览 |
| **ACB（Builder）** | Aqara Builder 云端工作台 → 远程连接客户 Studio 工作 |
| **End User 本地高级操作** | 浏览器访问本地 Studio（管理员场景） |
| **Aqara 平台运营** | Builder 后台 + Studio Cloud 监控 |

---

## 三、Studio 实例与 Builder 平台的协同

### 协同 1：远程交付

```
Builder 在 Aqara Builder 云端打开客户 Studio
   → 远程编辑空间图谱 / 配置自动化 / 调试设备
   → 一键 Push 到客户 Studio
   → Studio 应用变更，本地立即生效
   → 用户在 Aqara Life 看到 Persona 更新
```

### 协同 2：质量监控

```
每台 Studio → Aqara Cloud 上报心跳 / 异常 / 使用指标
   → Builder Console 显示该 Builder 部署的所有 Studio 健康度
   → 聚合到 Aqara 平台运营层
   → 服务质量打分 + Badge 影响 + 派单算法权重
```

### 协同 3：内容飞轮

```
Studio 上的真实项目（脱敏后）
   → 一键生成 Showcase 草稿（图谱 / 设备 / Persona / 自动化全部自动提取）
   → Builder 审阅发布到 Community
   → 用户浏览 → 加入 Ideabook → "落地到我家" → Lead 派给该 Builder
   → 新项目落地一台新 Studio → 闭环
```

### 协同 4：插件授权与运行

```
Marketplace 浏览插件
   → 用户 Get / Redeem，形成 Workspace Entitlement
   → Builder 将 Entitlement Assign 给目标 Studio / Project / Customer Space
   → Studio 拉取可用授权清单
   → Studio 本地下载 / 安装 / 启用 / 更新 / 卸载插件
   → Builder 只展示授权、分配、消耗和 Studio 回传的运行状态
```

> **边界原则**：Builder 是授权分发与商业记录平面，不是插件包管理器；Studio 是本地运行平面，负责下载、安装、运行、卸载和日志。Cloud 只同步授权关系和状态，不承载自动化执行。
> Marketplace / Assets 详细模型见 [`marketplace-assets-architecture.md`](./marketplace-assets-architecture.md)。

### 协同 5：跨 Studio 模板复用

```
Builder 在 Aqara Builder 维护"我的图谱模板库"
   → 新项目从模板初始化 → 部署到新 Studio
   → 节省 80% 现场配置时间
```

---

## 四、Studio 的部署形态（现状 + 目标态）

### 现状（2026 Q2）

- **形态**：Aqara Edge Hub（M300）作为 Studio 主机
- **访问**：局域网浏览器
- **远程**：Builder 平台 → Connect 按钮（截图所见）
- **规模**：内部测试 + 早期 Builder 试用

### 目标态（2027+）

- **多硬件支持**：Edge Hub / Mini PC / NAS 等都可跑 Studio
- **多场景部署**：住宅 / 商业空间 / 酒店多套房 / 办公楼层
- **集群协同**：大型项目多 Studio 集群，云端协调
- **冗余与备份**：双 Studio 热备份选项 / 云端配置快照
- **零信任远程**：Builder ↔ Studio 之间端到端加密 + 操作审计

---

## 五、数据归属与隐私

| 数据 | 归属 | 默认行为 |
|---|---|---|
| 设备拓扑 / 自动化配置 | 客户 + Aqara 共有（图谱归属客户家庭） | 本地存储；脱敏后可用于飞轮训练 |
| 实时设备状态 | 客户 | 本地，**不上云** |
| 用户行为日志 | 客户 | 本地审计；聚合脱敏后可用于服务质量评估 |
| Builder 操作日志 | Builder + 客户 + Aqara | 上云用于责任追溯 + 评分 |
| Studio 健康指标 | Aqara | 上云用于运营 + Builder 评分 |
| 客户隐私（人脸/语音/位置） | 客户 | **绝不上云**，本地处理 |

> Builder 远程访问 Studio 必须 **客户授权 + 时间窗口 + 操作审计** 三件套。详见 [`../03-architecture/data-model.md`](../03-architecture/data-model.md)。

---

## 六、Studio 与 Builder 的归属关系

```
Studio 实例
  ├── owner: <家庭账号>
  ├── deployed_by: <Builder 账号>            ← 主交付 Builder
  ├── collaborators: [<其他 Builder>...]      ← 协作 Builder
  ├── deployment_org: <区域伙伴/独立>          ← Affiliation 快照
  ├── attribution: <分佣归属规则>              ← 项目关闭后冻结
  └── lifecycle:
      • initial_delivery_at
      • last_modified_at
      • last_modified_by_builder
      • health_score
      • total_revisits
```

> **关键**：归属是 Builder 个人，不是区域伙伴。区域伙伴变更不影响 Studio ↔ Builder 的关系。

---

## 七、目标态 vs 现状的演进

| 维度 | 现状（2026 Q2） | 目标态 |
|---|---|---|
| Builder 平台模块 | Home / Build AI / Studios / Marketplace / Community + 外链 Academy/Forum/Shop | Builder frontstage + Builder Pro 四域：Projects / Leads / Financials / Company；Studio 能力主要进入 Project 内的 Studio / Commissioning / Service 子页面 |
| Studios Tab | 列表 + Connect 按钮 | 健康监控 + 远程操作 + 一键部署 + 跨 Studio 模板管理 |
| Build AI | 入口 chat | 多形态 Copilot（Ambient + Invoked + Agentic）+ 跨模块渗透 |
| Marketplace | 插件混合（AI/官方/开发者） | 分类清晰 + 评分体系 + Studio 兼容性 + Get / Redeem / Assign 授权链路 |
| Community | 论坛形态 | 灵感发现 / Showcases / Pros / Plugins / Ideabook（详见 community-spec） |
| Academy | 外链 | 内嵌 LMS + Badge 进度 + 区域集训日历 |
| Forum / Shop | 外链 | 与 Community 整合 |

详见 [`../04-roadmap/milestones.md`](../04-roadmap/milestones.md)。

---

## 八、落地原则

1. **Studio 是本地自治的**——Aqara Builder 是协作放大器，不是必需依赖。
2. **数据本地优先**——上云的只能是"健康指标 / 操作审计 / 飞轮训练所需脱敏数据"。
3. **Builder ↔ Studio 远程访问**强制：客户授权 + 时间窗口 + 操作审计。
4. **每台 Studio 必须有 deployed_by Builder**——这是质量追溯与分佣归属的基础。
5. **Builder 的所有工作流终点都落到一台 Studio**（图谱推送 / Persona 部署 / 插件授权分配）。
6. **健康指标 + 用户使用时长 + 订阅留存** 是 Builder 服务质量的客观度量，反向影响 Badge 和派单。
7. 现状界面是雏形，后续设计严格按 [`builder-console-spec.md`](./builder-console-spec.md) 演进。
