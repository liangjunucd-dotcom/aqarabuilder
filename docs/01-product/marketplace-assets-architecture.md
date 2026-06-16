# Marketplace 与 Assets 产品架构

> 本文是 Aqara Builder Marketplace / Assets 的产品与数据契约。后续涉及 Marketplace、Assets、Credits、Entitlement、Assignment、Service Package、Plugin、Connector、Agent、Template 和 Solution Pack 的设计与开发，应以本文为准。

---

## 1. 产品定位

Marketplace 是 Aqara Builder 的 Capability Marketplace。

它负责能力资产的发现、获取、兑换、授权和生命周期管理，不负责资产运行。

运行时能力由 Studio Runtime 负责。

```text
Marketplace Product
↓
Redeem
↓
Entitlement
↓
Assets
↓
Assignment
↓
Studio Runtime
```

### Marketplace Product 类型

| 类型 | 说明 | 示例 |
|---|---|---|
| Plugin | 可运行插件或界面能力 | Persona、Matter Bridge |
| Template | 可复用空间、项目或配置模板 | 两层住宅模板、公寓模板、酒店模板 |
| Service Package | 可购买或兑换的服务包 | 季度巡检、远程调试、托管运维 |
| Agent | 可调用的智能体能力 | Home Copilot、Service Agent、Maintenance Agent |
| Connector | 协议或系统连接器 | BACnet、KNX、Modbus、PMS |
| Solution Pack | 行业解决方案包 | 酒店、养老、办公、地产样板间 |

---

## 2. 核心原则

### 2.1 Workspace 是资产归属主体

Marketplace 兑换后的资产归属于 Workspace，不归属于用户个人。

```text
Account
↓
Workspace
↓
Entitlement
```

适用于：

- Personal Workspace
- Team Workspace

所有 Workspace 使用同一套资产模型。

### 2.2 Credits 归属于 Workspace

Credits 永远归属于 Workspace。

| Workspace | Credit Pool |
|---|---|
| Personal Workspace | Personal Credit Pool |
| Team Workspace | Workspace Credit Pool |

兑换行为：

```text
Credits
↓
Redeem
↓
Entitlement
```

成员离开 Workspace 时：

- Credits 不转移
- Entitlement 不转移
- Assets 不转移

### 2.3 Marketplace 不负责运行

Marketplace 只创建商业与授权记录。

Studio Runtime 负责：

- 下载
- 安装
- 启用
- 运行
- 更新
- 卸载
- 本地日志

Builder / Builder Pro 只展示授权、分配、消耗和 Studio 回传的运行状态。

---

## 3. 获取方式

Marketplace Product 支持以下获取方式：

| 获取方式 | 说明 | 示例 |
|---|---|---|
| Free | 免费获取 | Matter 基础接入包 |
| Credits | 使用 Workspace Credits 兑换 | Persona，40 Credits |
| Included | 订阅计划包含 | Included in Pro / Business / Enterprise |
| Quote | 联系销售或服务商报价 | Enterprise Connector、行业方案、企业服务包 |

MVP 中用户侧展示应使用清晰商业语言：

- Free
- 40 Credits
- Included in Pro
- Contact Sales

不要向用户展示内部 Access Policy。

### Marketplace UI 展示规范

Marketplace 卡片必须展示用户能理解的商业层级，不展示内部授权词。

| 内部权限 | 用户侧 Badge |
|---|---|
| `free` | Free |
| `pro` | Pro |
| `commercial` | Business |
| `enterprise` | Enterprise |

卡片信息层级：

1. 左上展示 Product Type icon；
2. 右上展示计划 Badge；
3. 中部展示名称和一句能力说明；
4. 底部展示 Publisher、Product Type、获取方式和采用热度；
5. 采用热度是平台综合信号，不直接命名为下载数。

禁止在卡片上同时堆叠 `Commercial`、`Business`、`Credits`、`Access Policy` 等多套内部术语。

---

## 4. Access Policy

Marketplace Product 通过 Access Policy 控制可见性和可兑换性。

MVP 仅支持：

```ts
{
  requiresProfessional: boolean
  allowedWorkspaceTypes: Array<'personal' | 'team'>
  allowedPlans: Array<'free' | 'pro' | 'business' | 'enterprise'>
}
```

示例：

```text
BACnet Connector
= Professional Identity
+ Team Workspace
+ Business Plan
```

```text
Remote Operations Service Package
= Professional Identity
+ Personal Workspace
+ Pro Plan
```

Access Policy 不直接面向用户展示。用户只看到可执行动作：

- Get
- Redeem
- Request Purchase
- Included
- Contact Sales

---

## 5. Builder Marketplace

Builder Marketplace 默认运行于用户 Personal Workspace。

用户无需感知 Workspace 概念。

兑换流程：

```text
Marketplace
↓
Redeem
↓
Personal Workspace Entitlement
↓
My Assets
```

### Builder Marketplace 分类

分类采用业务能力分类，不采用技术实现分类。

MVP 默认分类：

- 自动化
- AI
- 设计
- 集成
- 运维
- 服务

分类体系必须可配置，支持平台后续动态扩展。

---

## 6. Builder Pro Marketplace

Builder Pro Marketplace 运行于当前 Active Workspace。

页面顶部必须展示当前上下文：

```text
Current Workspace
Design Studio
```

所有兑换行为默认归属于当前 Workspace。

兑换流程：

```text
Marketplace
↓
Redeem / Request Purchase
↓
Workspace Entitlement
↓
Workspace Assets
```

### Team Workspace 成员行为

Member 默认不可直接消耗 Workspace Credits。

```text
Marketplace
↓
Request Purchase
↓
Owner/Admin Approval
↓
Redeem
↓
Workspace Entitlement
```

---

## 7. Assets

Assets 是 Workspace 已拥有能力资产的管理中心。

| 入口 | 展示范围 | 用户可见名称 |
|---|---|---|
| Builder | Personal Workspace Assets | My Assets |
| Builder Pro | Current Workspace Assets | Workspace Assets |

Assets 支持管理：

- Plugins
- Templates
- Service Packages
- Connectors
- Agents
- Solution Packs

Assets 只管理 Entitlement 和 Assignment，不管理 Runtime 安装包本身。

---

## 8. Assignment

Entitlement 获取后可进行授权分配。

Assignment 与 Entitlement 解耦。

同一个 Entitlement 可产生多个 Assignment。

支持：

| Assignment Target | 说明 |
|---|---|
| Studio | 授权给 Studio Runtime |
| Project | 授权给项目、报价或交付包 |
| Customer Space | 授权给客户空间或 Life Dashboard |

```text
Entitlement
├─ Assignment -> Studio
├─ Assignment -> Project
└─ Assignment -> Customer Space
```

---

## 9. 权限模型

| Role | 权限 |
|---|---|
| Owner | Redeem、Assign、Revoke、Manage Assets |
| Admin | Redeem、Assign、Manage Assets |
| Member | Request Purchase、Request Assignment |
| Viewer | Read Only |

权限按 Workspace 计算，不按账号全局计算。

---

## 10. 数据模型

### `MarketplaceProduct`

```ts
{
  id: string
  type: 'plugin' | 'template' | 'service_package' | 'agent' | 'connector' | 'solution_pack'
  category: 'automation' | 'ai' | 'design' | 'integration' | 'operations' | 'service'
  name: string
  publisherId: string
  summary: string
  acquisition: {
    method: 'free' | 'credits' | 'included' | 'quote'
    credits?: number
    includedPlans?: string[]
  }
  accessPolicy: {
    requiresProfessional: boolean
    allowedWorkspaceTypes: Array<'personal' | 'team'>
    allowedPlans: Array<'free' | 'pro' | 'business' | 'enterprise'>
  }
  runtimeTarget: 'studio' | 'life' | 'both' | 'none'
}
```

### `Entitlement`

```ts
{
  id: string
  productId: string
  workspaceId: string
  source: 'free' | 'credits' | 'included' | 'quote' | 'manual_grant'
  status: 'active' | 'pending_binding' | 'pending_approval' | 'expired'
  creditsSpent?: number
  createdByAccountId?: string
  approvedByAccountId?: string
  expiresAt?: string
}
```

### `Assignment`

```ts
{
  id: string
  entitlementId: string
  targetType: 'studio' | 'project' | 'customer_space'
  targetId: string
  status: 'active' | 'revoked'
  assignedByAccountId: string
  assignedAt: string
}
```

### `PurchaseRequest`

```ts
{
  id: string
  productId: string
  workspaceId: string
  requestedByAccountId: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requestedCredits?: number
  reason?: string
}
```

---

## 11. 未来扩展

Marketplace 模型统一支持：

- Personal Workspace
- Team Workspace
- Business Workspace
- Enterprise Workspace
- Aqara Space
- Service Provider

无需新增资产模型。

统一采用：

```text
Product
↓
Entitlement
↓
Assets
↓
Assignment
↓
Runtime
```
