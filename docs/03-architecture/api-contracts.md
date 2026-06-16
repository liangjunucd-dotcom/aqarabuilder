# API Contracts

> 主要 API 划分、命名规则、版本策略。具体 schema 在实现阶段细化。

---

## 通用约定

- **Base URL**：`https://api.builder.aqara.com/v1`
- **风格**：REST 为主，复杂查询场景可选 GraphQL（Builder Console）
- **认证**：Bearer JWT；ACB 多 Affiliation 场景通过 `X-Acting-Profile` header 表达当前视角
- **错误格式**：`{ error: { code, message, details? } }`，HTTP 状态码语义化
- **分页**：Cursor-based（`?cursor=...&limit=...`）
- **国际化**：`Accept-Language` header；返回 i18n 字段
- **幂等性**：所有 POST 写操作支持 `Idempotency-Key`
- **版本**：URL 前缀 `v1/v2`；deprecated 给 12 月过渡期

---

## API 域划分

```
/v1/auth/...          → 登录 / token / SSO
/v1/identity/...      → ACBProfile / Badge / Affiliation
/v1/projects/...      → Project 全生命周期
/v1/leads/...         → Lead 派单与跟进
/v1/ontology/...      → 空间图谱 CRUD + 推理
/v1/families/...      → Family / Member / Persona
/v1/studios/...       → Studio 实例 / 健康度 / 远程运维授权
/v1/plugins/...       → Plugin 注册 / 版本 / 安装（App + Studio runtime）
/v1/marketplace/...   → 插件市场（消费侧）
/v1/community/...     → Showcase / Ideabook / 评论
/v1/feed/...          → Discover 推荐流
/v1/earnings/...      → 分佣 / 结算 / 账单（含 studio_recurring）
/v1/academy/...       → 课程 / 考核 / Badge 进度
/v1/copilot/...       → Builder Copilot（流式）
/v1/notifications/... → 站内信 / 偏好
/v1/admin/...         → 平台运营（受限）
```

---

## 关键 API 设计要点

### Identity / Badge

```http
GET    /v1/identity/me                       # 当前 ACB Profile
PATCH  /v1/identity/me                       # 更新档案
GET    /v1/identity/acbs/:id                 # 公开 Profile
GET    /v1/identity/me/badges                # 我的 Badge 列表
POST   /v1/identity/affiliation              # 切换/解除挂靠
```

> Lead 匹配 / Workshop 权限 / 分佣比例 / Studio 部署许可都基于 Badge 计算，**不要在前端做判断**。

---

### Projects

```http
GET    /v1/projects?stage=...&acb_id=...
POST   /v1/projects                          # 新建（含 ontology_graph_id 占位）
GET    /v1/projects/:id
PATCH  /v1/projects/:id                      # 阶段推进 / 字段更新
POST   /v1/projects/:id/transition           # 阶段流转（带校验）
POST   /v1/projects/:id/close                # 关闭并锁定 attribution（要求 studio_id 已激活 + ≥1 Persona delivered）
POST   /v1/projects/:id/bind-studio          # 绑定部署的 Studio 实例
```

---

### Leads

```http
GET    /v1/leads?status=new                  # ACB 视角
POST   /v1/leads                             # Community 用户发起咨询
POST   /v1/leads/:id/assign                  # 平台派单（运营）
POST   /v1/leads/:id/reply                   # ACB 回复
POST   /v1/leads/:id/quote                   # 提交报价（→ project draft）
```

---

### Ontology Graph

```http
GET    /v1/ontology/graphs/:id
POST   /v1/ontology/graphs                   # 新建（可基于模板）
PATCH  /v1/ontology/graphs/:id               # 增量更新（节点/边/属性）
POST   /v1/ontology/graphs/:id/deliver       # 发布到家庭 + 推送到 Studio（Layer 2 上线）
POST   /v1/ontology/graphs/:id/infer         # 推理（设备建议 / 异常）
GET    /v1/ontology/templates                # 模板库
```

> **乐观锁**：`If-Match: <version>`，避免并发编辑冲突。
> `deliver` 会触发 Studio Cloud 下发；Studio 离线时进入待下发队列。

---

### Families / Personas

```http
GET    /v1/families/:id                      # 家庭概览（含成员 / Persona / studios）
POST   /v1/families/:id/members              # 添加成员
GET    /v1/families/:id/members/:member_id/persona
PATCH  /v1/families/:id/members/:member_id/persona  # 三层覆盖更新
POST   /v1/families/:id/members/:member_id/persona/deliver  # ACB 推送（→ Aqara Life + Studio）
POST   /v1/families/:id/members/:member_id/persona/restore  # 用户恢复 ACB 配置
```

---

### Studios（新增）

```http
GET    /v1/studios?family_id=&acb_id=&status=
POST   /v1/studios/activate                  # 部署激活（写入 deployed_by_acb_id，不可变）
GET    /v1/studios/:id
GET    /v1/studios/:id/health                # 健康度时序
POST   /v1/studios/:id/remote-access/grant   # 客户给 ACB 授予远程运维窗口
POST   /v1/studios/:id/remote-access/revoke  # 客户撤销
POST   /v1/studios/:id/ota                   # 触发固件 / 插件 OTA（受限）
GET    /v1/studios/:id/audit                 # 审计日志（客户可查所有 ACB 操作）
```

> Studio 远程运维**严格依赖客户授权时间窗**；窗口外的访问请求一律 403。
> 详见 [`../01-product/studio-and-builder.md`](../01-product/studio-and-builder.md)。

---

### Plugins

```http
GET    /v1/plugins?category=...&q=...&runtime=app|studio  # Marketplace 浏览
GET    /v1/plugins/:id
POST   /v1/marketplace/install               # 用户安装（含 installed_to: app|studio）
GET    /v1/plugins/me                        # 我开发的插件（作者视角）
POST   /v1/plugins                           # 新建
POST   /v1/plugins/:id/versions              # 上传新版本
POST   /v1/plugins/:id/versions/:v/submit    # 提交审核
```

---

### Community

```http
GET    /v1/community/showcases?...
POST   /v1/community/showcases               # 新建（多数从 project 一键生成）
GET    /v1/community/showcases/:id
PATCH  /v1/community/showcases/:id
POST   /v1/community/showcases/:id/publish

GET    /v1/community/ideabooks/me
POST   /v1/community/ideabooks/:id/items     # 收藏
POST   /v1/community/ideabooks/:id/realize   # "落地到我家"工作流入口

GET    /v1/community/builders?region=&badges=  # 找 ACB（公开 Builder 目录）
```

---

### Feed (Discover)

```http
GET    /v1/feed/discover                     # 个性化流
GET    /v1/feed/visual-search                # 视觉搜索
```

---

### Earnings

```http
GET    /v1/earnings/summary?period=monthly
GET    /v1/earnings/items?status=&type=      # type 含 studio_recurring / regional_passive
GET    /v1/earnings/payouts                  # 结算批次
GET    /v1/earnings/forecast                 # 区域被动收入预估（区域伙伴 / ACB）
```

---

### Academy

```http
GET    /v1/academy/courses
GET    /v1/academy/me/progress
POST   /v1/academy/exams/:id/submit
GET    /v1/academy/me/badges                 # = identity 同源，便于学院侧入口
GET    /v1/academy/regional-sessions         # 区域线下集训
```

---

### Copilot（流式）

```http
POST   /v1/copilot/chat                      # SSE 流
POST   /v1/copilot/agents/:id/run            # Agentic 任务（多步）
GET    /v1/copilot/runs/:run_id              # 任务状态轮询
GET    /v1/copilot/usage                     # 配额
```

> 所有 Copilot 调用经 LLM Gateway，强制开启 Prompt Cache。详见 [`ai-system.md`](./ai-system.md)。

---

## 实时通道（WebSocket）

`wss://api.builder.aqara.com/v1/realtime`

| 频道 | 推送内容 |
|---|---|
| `acb:{acb_id}:leads` | 新 Lead 通知 |
| `acb:{acb_id}:earnings` | 分佣实时 |
| `family:{family_id}:graph` | 图谱协作编辑 |
| `studio:{studio_id}:status` | Studio 在线状态 / 告警 |
| `copilot:{run_id}` | Agentic 任务进度 |

---

## 速率限制

- 默认：每用户 600 req/min；按 IP 60 req/min（未登录）
- AI 调用：基础免费配额 + 超出按量
- 上传：最大单次 100 MB，分片支持 1 GB
- Studio 心跳：独立通道，不计入用户配额

---

## 落地原则

1. API 命名不出现"role"枚举，**全部用 Badge / 权限判断**。
2. 所有写操作支持 `Idempotency-Key`，避免重复扣费 / 重复派单 / 重复 Studio 激活。
3. 长任务（AI / 派单 / 大图渲染 / Studio OTA）走异步 + 轮询/订阅，**不阻塞 HTTP**。
4. ACB 多重 Affiliation 的复杂场景，用 `X-Acting-Profile` 显式表达视角。
5. 任何对外暴露的 API（Plugin SDK / 第三方）必须经过 OAuth + scope 审核。
6. **Studio 远程访问相关 API 必须强校验授权时间窗**——这是客户隐私的硬底线。
