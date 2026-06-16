# System Overview

> Aqara Builder 平台的整体技术架构概览。
> 详细的数据模型、AI 架构、API 契约见同目录其他文档。

---

## 顶层架构

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Clients                                      │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│   │  Community Web   │  │ Builder Console  │  │  Aqara Life App  │  │
│   │  (Next.js SSR)   │  │  (Next.js SPA)   │  │  (iOS/Android)   │  │
│   │   C 端 + ACB     │  │   ACB 工作台     │  │     C 端         │  │
│   └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└────────────┼─────────────────────┼─────────────────────┼─────────────┘
             │                     │                     │
             ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        API Gateway / BFF                              │
│           (auth, rate limit, request shaping, websocket)             │
└────────────┬─────────────────────────────────────────────────────────┘
             │
   ┌─────────┼─────────┬──────────┬──────────┬──────────┬──────────────┐
   ▼         ▼         ▼          ▼          ▼          ▼              ▼
┌──────┐┌────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌──────────────┐
│ Auth ││Identity││ Project ││Ontology ││ Plugin  ││ Content ││ Studio Cloud │
│ /SSO ││ /Badge ││  /CRM   ││  Graph  ││Registry ││  /Feed  ││ /Earnings    │
└──────┘└────────┘└─────────┘└─────────┘└─────────┘└─────────┘└──────────────┘
   │         │         │          │          │          │              │
   └─────────┴─────────┴──────────┴────┬─────┴──────────┴──────────────┘
                                       ▼
              ┌─────────────────────────────────────────┐
              │     Spatial AI / Builder Copilot         │
              │   (LLM gateway, retrieval, agents)       │
              └─────────────────────────────────────────┘
                                       │
              ┌─────────────────────────────────────────┐
              │  Storage: Postgres / Neo4j / Object /    │
              │  Search (Meili/Elastic) / Cache (Redis)  │
              └─────────────────────────────────────────┘

         ┌──────────────────────────────────────────────────┐
         │   Edge: Aqara Studio (客户家本地空间智能 OS)       │
         │   ↕ Studio Cloud（双向同步：图谱 / Personas /      │
         │   插件下发 / 健康度回传 / 远程运维授权窗）         │
         └──────────────────────────────────────────────────┘
```

> **关键边界**：客户家中的 **Aqara Studio** 是边缘节点（本地优先执行），通过 **Studio Cloud** 服务与平台双向同步。ACB 在 Builder Console 上的所有"交付"动作最终落到客户家某台 Studio 实例。

---

## 核心服务

| 服务 | 职责 | 主要存储 |
|---|---|---|
| **Auth / SSO** | 登录、token、SSO、第三方账号 | Postgres + Redis |
| **Identity / Badge** | ACB Profile / Badge / Affiliation | Postgres |
| **Project / CRM** | Project 全生命周期 + Lead | Postgres |
| **Ontology Graph** | 空间本体 / 节点 / 边 / 推理 | Neo4j (or Postgres + ltree) |
| **Plugin Registry** | 插件 manifest / 版本 / 签名 / 分发（App + Studio 双 runtime） | Postgres + Object Storage |
| **Content / Feed** | Showcase / Ideabook / 评论 / 推荐 | Postgres + Search + Object |
| **Studio Cloud** | Studio 注册 / 心跳 / 配置下发 / 远程运维 / OTA / 健康度 | Postgres + 时序 + MQTT/WS |
| **Earnings / Billing** | 分佣计算（设备 + 订阅 + 插件三流）/ 结算 | Postgres（事务隔离） |
| **Spatial AI** | LLM gateway / RAG / Agents | 自有 + 外部模型 |
| **Notification** | 站内信 / Push / Email / SMS | Redis Streams + 第三方 |
| **Search** | 全文 / 向量 / 多语言 | Meilisearch / Elastic |

---

## 技术栈倾向

> 第一版以**速度 + 可维护性**为核心，避免过度工程。

### 前端

| | 选型 |
|---|---|
| 框架 | **Next.js 14+**（App Router，SSR + RSC） |
| UI | **Tailwind CSS** + **shadcn/ui** |
| 状态 | TanStack Query + Zustand（轻量） |
| 表单 | React Hook Form + Zod |
| 国际化 | next-intl |
| 编辑器 | TipTap（富文本） / React Flow（图谱） |

### 后端

| | 选型 |
|---|---|
| 主语言 | **TypeScript（NestJS）** 或 **Python（FastAPI）** — 待 Roadmap 阶段二决定 |
| API 风格 | REST + 选择性 GraphQL（Builder Console 复杂查询） |
| 实时 | WebSocket（Lead 派单、Copilot 流式、Studio 心跳/远程运维） |
| 队列 | Redis Streams / NATS |
| 边缘协议 | MQTT / WebSocket（Studio ↔ Studio Cloud），HTTPS（管控面） |

### 数据

| | 选型 |
|---|---|
| 主库 | **PostgreSQL 16+** |
| 图库 | **Neo4j**（Ontology Graph，量大时切到 PG + extension） |
| 搜索 | **Meilisearch**（早期）→ Elasticsearch（规模化） |
| 缓存 | Redis |
| 时序 | TimescaleDB（Studio 健康度 / 设备遥测，规模化前用 PG 分区） |
| 对象存储 | S3 兼容（AWS S3 / Cloudflare R2 / 阿里 OSS） |

### AI / LLM

| | 选型 |
|---|---|
| 主模型 | Claude（Sonnet/Opus）+ 自训空间专用模型 |
| 向量库 | pgvector（早期）→ 专用（规模化） |
| 框架 | 自研薄封装 + Anthropic SDK |
| 边缘推理 | Studio 本地小模型（自动化 / 隐私敏感场景） |

### 基础设施

- 容器：Docker + Kubernetes（云上）/ Docker Compose（本地）
- CI/CD：GitHub Actions
- 可观测：OpenTelemetry + Grafana / Sentry
- 多区域：中国（合规）+ 海外（独立）双活
- 边缘 OTA：Studio 固件 / 插件包灰度发布

---

## 仓库结构（规划）

```
aqara-builder-by-claude/
├── apps/
│   ├── web-community/        # Community 前台 (Next.js)
│   ├── web-console/          # Builder Console 后台 (Next.js)
│   └── api/                  # 后端 (monolith first → split)
├── packages/
│   ├── ui/                   # 共享组件库
│   ├── types/                # 共享类型 / Zod schema
│   ├── sdk/                  # API SDK（前端 + 第三方）
│   ├── studio-protocol/      # Studio ↔ Cloud 协议定义
│   └── ontology/             # 本体定义与工具
├── services/                 # 后续拆分后的微服务
├── docs/                     # 当前阶段文档
└── infra/                    # IaC / k8s / docker
```

> **第一版 monorepo**（pnpm workspaces 或 turbo），后端**先单体**，按 bounded context 切分模块，规模化后再拆服务。
> Studio 固件代码不在本仓库，但协议定义共享。

---

## 安全与合规

- 数据分区：中国数据不出境；Studio 设备数据**默认本地优先**，仅同步必要元数据上云
- 隐私：客户家庭数据 default-encrypted；ACB 仅在客户授权的"远程运维窗口"内可访问 Studio
- 审计：所有 ACB 操作（图谱编辑 / Persona 推送 / Studio 远程登录）写审计日志，客户可查
- 合规：GDPR / 中国《个人信息保护法》/ CCPA

---

## 落地原则

1. **第一版单体后端 + monorepo**，不要一开始就做微服务。
2. 任何能"通过 Postgres 解决"的需求都先用 Postgres，避免过早引入专用存储。
3. AI 模块默认通过 LLM Gateway 调用，**不要在业务代码里硬编码模型/Provider**。
4. **多区域从一开始就考虑**，但不做代码分叉，参数化即可。
5. 海外/中国差异通过策略参数解决，详见 [`../00-vision/china-transition.md`](../00-vision/china-transition.md)。
6. **Studio 是平台的边缘第一公民**——任何"交付 / 个性化 / 自动化"业务流必须能落到具体 Studio 实例。Studio 离线时平台动作必须可排队、Studio 上线后再下发。
