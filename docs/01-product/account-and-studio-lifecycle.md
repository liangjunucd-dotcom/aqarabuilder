# 账号 · 家 · Workspace · Studio · Order — 全生命周期设计

> 范围：Aqara Life App、Builder 前台、Pro Console、Studio 运行时、Cubix IDE
> 目标：一个账号体系同时服务 C 端"家"心智 与 B 端"Workspace + Order"心智，且彼此完全隔离呈现。
> 版本：**v0.3**（去除 Builder 专属路径，统一为 4 个原语）

---

## 0. 设计哲学（v0.3 基准）

> **Builder（Installer）和普通用户是同一种实体，只是有些用户拥有 Verified 资质并高频使用 Order。** 系统不应为 Builder 设立独立的绑定 / 持有 / 鉴权路径。

由此推出 **唯一的架构原则**：

> 所有"Builder 服务流"都必须能由 4 个对所有用户对称的原语 + Order 业务层组合出来。
>
> 4 原语：**Bind / Workspace Move / Transfer / Operator Grant**

任何带"Builder 专属"色彩的 API、状态、Workspace 类型，都视为反模式。

---

## 1. 核心概念

| 概念 | 性质 | App 可见 | Builder 前台 | Pro Console |
|---|---|---|---|---|
| **DataCenter (DC)** | 物理 / 法务边界（CN / US / EU / SG / KR / RU 共 6 个） | ✗（隐式由账号国家决定） | ✓ | ✓ |
| **Aqara Account** | 唯一身份；DC = 注册国家决定，几乎不可变 | ✓ | ✓ | ✓ |
| **Home** | C 端心智单位（每台 Studio / Cloud 表示一个家） | ✓（核心） | 间接 | ✗ |
| **Workspace** | **任何用户都可拥有的文件夹**；DC == 拥有者账号 DC | ✗（屏蔽） | ✓ | ✓ |
| **Studio** | 物理运行时（M300 / Cloud），DC == 当前 owner DC | 等价于"家" | ✓ | ✓ |
| **Order / Project** | 服务交付契约（绑定 Bind / Transfer / 结算） | ✗（仅状态可见） | ✗ | ✓ |
| **TransferToken** | Studio owner 让渡所有权时签发的一次性凭证 | 接收方可见 | ✓ | ✓ |
| **OperatorGrant** | owner 授予他人对某 Studio 的临时操作权限 | 间接（"权限到期"提示） | ✓ | ✓ |

**四条铁律：**

1. **每个 Aqara 账号 = 自动有一个 Personal Workspace**；用户**也可以创建任意多个其他 Workspace**（都是用户自己的"文件夹"，无类型区别）。
2. **Studio 的 DC = 当前 owner 账号 DC**。同 DC 内 Transfer = 原子搬迁；跨 DC Transfer ≡ 工厂复位 + 重绑（管理化的"跨区交付"）。
3. **Bind 永远绑到 binder 自己的 Personal Workspace**。binder 之后可自由 Workspace Move 到自己的其他 Workspace。
4. **Builder 不是特殊用户**。它在数据层和普通用户完全相同，只是 Verified 资质允许使用 Order + 结算 + 跨 DC 交付能力。

---

## 2. 四个原语

### 2.1 Bind（绑定）—— 谁绑谁拥有

```
任意账号 → mDNS 发现 + 凭据校验 → Studio 进入 binder.PersonalWorkspace
```

- 入参：`{ sn, pin, workspaceId?, intent?, metadata? }`
- 默认 `workspaceId` = binder 的 Personal Workspace
- 默认 `intent` = `personal`
- Studio.dc = binder.dc

**只有这一个绑定 API。** App 与 Cubix Pro Console 都调它，只是默认值不同。

### 2.2 Workspace Move（跨自己的 Workspace 挪动）

```
Studio.owner → 把 Studio 从自己的 WS A 挪到自己的 WS B
```

- 不改 owner、不改 DC、不改设备状态
- 纯组织 / 视图行为
- 一个用户可任意创建 / 删除 / 重命名自己的 Workspace

### 2.3 Transfer（让渡所有权）—— 核心新原语

```
Source Owner → 签发 TransferToken → 目标账号接收 → 原子转移
```

- 入参：`{ studioId, targetAccountId | targetPhone+country, orderId?, message?, validityHours? }`
- 同 DC（`studio.dc == target.dc`）：原子更新 owner + workspace（移入 target 的 Personal WS）
- 跨 DC：进入"跨区交付"子流程（§4.4）
- 转移成功的同时，可选**自动给 Source 颁发 OperatorGrant**（参数随 Order 决定，没 Order 时不自动颁发）

```ts
interface TransferToken {
  id: string;
  studioId: string;
  fromAccountId: string;
  fromDc: DcId;
  // 任一组：直接指定账号；或用手机号 + 国家创建/查找
  targetAccountId?: string;
  targetPhone?: string;
  targetCountry?: string;        // 决定 ghost 账号 DC
  orderId?: string;
  expiresAt: string;
  consumed: boolean;
  // 可携带建议的 post-transfer Operator 配置
  suggestedOperatorScope?: 'warranty' | 'service';
  suggestedOperatorDays?: number;
}
```

### 2.4 Operator Grant（授权操作权）

```
Studio.owner → 给另一个账号颁发临时操作权限
```

- 不改 owner
- 可选 scope：`'install' | 'warranty' | 'service' | 'household'`
- 可跨 DC：grantee.dc 与 studio.dc 不同时，云端跨 DC 路由 + IAM 鉴权
- 默认 90 天（订单类型可改）；owner 可随时撤销

```ts
interface OperatorGrant {
  id: string;
  studioId: string;
  granteeAccountId: string;
  granteeDc: DcId;
  scope: 'install' | 'warranty' | 'service' | 'household';
  orderId?: string;
  startedAt: string;
  expiresAt: string;
  revokedAt?: string;
}
```

---

## 3. 数据模型

```ts
type DcId = 'cn' | 'us' | 'eu' | 'sg' | 'kr' | 'ru';

interface Account {
  id: string;
  dc: DcId;                    // 注册国家决定，几乎不可变
  phone?: string;
  country: string;
  verifiedBuilder?: {           // 仅资质标记，不影响数据路径
    level: 'individual' | 'team' | 'org';
    since: string;
  };
}

interface Workspace {
  id: string;
  ownerAccountId: string;
  dc: DcId;                    // == ownerAccount.dc
  name: string;                 // "Personal" / "项目-张老师家" / "万豪 12-15F" 等用户自定义
  isDefault: boolean;           // Personal 为 true，且每账号唯一
  // 没有 type 字段 —— Workspace 没有"种类"，只有名字
}

interface Studio {
  id: string;
  sn: string;
  ownerAccountId: string;       // 仅一个，Transfer 时原子更新
  workspaceId: string;          // 当前归属的 Workspace（owner 的某个 WS）
  dc: DcId;                     // == ownerAccount.dc
  intent: 'personal' | 'service-pending-transfer' | 'service-warranty';
  metadata: {
    orderId?: string;
    transferTo?: string;        // PendingTransfer 时的目标提示
    tags?: string[];            // 用户自定义
  };
}

interface StudioOwnershipEvent {
  id: string;
  studioId: string;
  kind: 'bind' | 'workspace-move' | 'transfer' | 'grant-operator' | 'revoke-operator' | 'reset';
  fromAccountId?: string;
  toAccountId?: string;
  fromWorkspaceId?: string;
  toWorkspaceId?: string;
  fromDc?: DcId;
  toDc?: DcId;
  orderId?: string;
  actorAccountId: string;
  ts: string;
  evidence?: {
    transferTokenId?: string;
    operatorGrantId?: string;
    customerAcceptanceSig?: string;
    deploymentHash?: string;
    bundleHash?: string;        // 跨 DC 交付的 Bundle 哈希
    sessionRecordingUrl?: string;
  };
}
```

---

## 4. 四类典型场景（全部用同一套原语）

### 4.1 自装（DIY，70% 用户）

```
User → Bind → User Personal WS（User DC）
```

> 只用到原语 1。

### 4.2 朋友 / 家人帮装（非商业）

```
朋友 → Bind → 朋友 Personal WS
朋友 → Operator Grant（household, 长期）→ 给我（避免马上 Transfer）
…未来某天…
朋友 → Transfer → 我（同 DC，原子）
```

> 只用到原语 1+3+4，没有 Order。

### 4.3 Verified Builder · 项目交付（最高频，95% B 端）

```
[订单阶段]
  客户在 Marketplace 下单 → Order 创建
    payload: { customerAccountId, builderAccountId, snRange, scope, settlement }

[施工阶段]
  安装工在移动端选择 Project → 开始施工
    ↓ Project.status = installing
    ↓ 创建 ImplementationSession
    ↓ Studio Cloud 为 Project 创建 Temporary Space

  安装工查看图纸 → 按房间分拣设备
  M300 Studio 上电 → 健康检查
  Studio → Bind → Temporary Space
    metadata: { projectId, orderId, intent: 'service-pending-transfer' }
    → 客户 App 默认不可见（§5.1 隐私规则）

  安装工通过移动端实施工具批量入网设备

[部署阶段]
  Project Solution → Deploy
    1. 选择 Studio
    2. 拉取 Studio 设备
    3. 虚实绑定：自动匹配方案点位 → 现场验证
    4. 校验：人工确认映射
    5. 下发方案到 Studio

[交付阶段]
  安装工发起验收 → 平台上报证据链
    · Temporary Space
    · Studio SN / DC / Health
    · Solution deployment hash
    · 虚实绑定映射
    · 现场照片 / 测试结果

  平台 → Transfer
    source: Project Temporary Space
    target: 客户 Aqara Life Space
    orderId: #ORD-...
    suggestedOperatorScope: 'warranty', suggestedOperatorDays: 90

  客户登录 Aqara Life App
    ↓ 自动获得新的 Space 以及 Space 下的 Studio
    ↓ 客户确认后，可给设计者 / 服务商授予后续服务权限
    ↓ 同 DC，原子转移
    ↓ Temporary Space 转为客户 Space
    ↓ Studio 跟随 Space 转移
    ↓ 可选 Operator Grant 给 Builder（依 Order / 客户确认配置）
    ↓ Order 状态推进到 Delivered

[结算]
  Order 检查证据链：
    · ImplementationSession
    · Temporary Space 创建
    · Studio Bind 事件
    · Solution 部署 hash
    · Transfer consumed 事件
    · 客户接受签名 + 时间戳
  全部 ✓ → 触发分润（含 7 天退订冷静期）
```

> 用到原语 1+3+4 + Order / Project。Builder Pro 提供的是项目和证据链编排，Studio 所有权仍通过 Transfer / OperatorGrant 完成。

### 4.4 跨 DC 服务（5%，需显式管理）

```
Builder (CN) → Bind → Builder Personal WS（CN DC）
Builder → Cubix 部署
Builder → Transfer → 客户 (EU)
        ↓ 检测到 studio.dc != target.dc
        ↓ 进入跨区交付子流程：

  ┌─ Step 1: 导出 Bundle ─────────────────────────
  │   Cubix 把 Studio 完整状态打包：
  │     · 设备清单 + 配置
  │     · 场景 / 自动化
  │     · 插件 / 协议
  │     · 用户偏好（不含个人数据）
  │     · 校验 Hash
  │
  ├─ Step 2: 复位 + 重绑 ─────────────────────────
  │   Studio 工厂复位（CN DC 数据销毁）
  │   客户在 EU App 中 Bind 同一台 Studio（M300 物理是同一台）
  │   Studio 进入 客户 Personal WS（EU DC）
  │
  ├─ Step 3: 重新部署 ────────────────────────────
  │   Builder 在 Cubix 用 Operator Grant 接入新 Studio
  │   导入 Bundle → 自动恢复设备 / 场景 / 自动化
  │
  └─ Step 4: 验收 + 结算 ────────────────────────
      客户验收 → Order Delivered → 结算
```

> 跨 DC **永远是显式 4 步**，没有静默迁移。Bundle 是商业层面的"交付物"，可以单独签收。

### 4.5 二手转手（用户卖给另一个用户）

```
User A → Transfer → User B
  · 同 DC：原子搬
  · 跨 DC：跨区交付（§4.4）
```

完全复用 Transfer 原语，不需要任何特殊代码。

### 4.6 Builder 团队协作（v2 业务，但架构已支持）

```
Builder 主账号 A → Bind 客户 Studio
A → Operator Grant → 团队成员 B、C（scope: service）
A → Transfer → 客户（自己保留 warranty Operator）
B、C 凭 Operator Grant 也能维护
```

无需"Team Workspace"等新概念；现有原语已足够。

---

## 5. UI / IA 规则

### 5.1 隐私规则（关键）

> **痛点：** Builder 用 Aqara Life App 自己看，"我的家"列表会临时出现客户的家。
>
> **解法：1 个字段 + 1 条默认过滤规则。**

`Studio.intent` 字段：

| 值 | 含义 | App 主页"我的家"是否显示 |
|---|---|---|
| `personal` | 自家 | ✓（默认） |
| `service-pending-transfer` | 服务中，待转移给客户 | ✗（默认隐藏） |
| `service-warranty` | 已转移，自己作为 Operator | ✗（默认隐藏） |

- Pro Console 在 Bind 时如果带了 `orderId`，自动设 `intent = service-pending-transfer`
- 客户接受 Transfer 时，目标方 Studio.intent **自动重置为 `personal`**
- App 设置里有"服务中的项目"入口，专门看 `service-*` 的 Studios（Pro 模式）

整个隐私问题用 **元数据 + 客户端默认过滤**就解决，不需要 Service Workspace 这种结构性概念。

### 5.2 Aqara Life App（C 端）

```
[底部 Tab: 家 · 设备 · 我]
顶部 Home Switcher:
  ▾ 我的家
    · 🏠 我的家
    · 👴 父母家（受邀）
    · 🌥 云上的家（无 Studio）
    + 添加新家
[设置 → 服务中的项目]（仅 verifiedBuilder 显示）
    · 🏗 张老师家（待客户接受）
    · 🏨 万豪 1206（保修期内）
```

- 完全屏蔽 Workspace 字样
- "添加新家" = 添加 Cloud Home / mDNS Bind / 接受家庭邀请 / **接受 Transfer** 四种入口合一
- 接受 Transfer 时显示来源 Builder 名称、Order 号、Studio 名、自动赋予 Operator 权限的范围 → 用户一眼知情

### 5.3 Builder 前台 (`/home/*`)

任何用户登录后都看到自己的 Workspaces：

```
我的工作区
├── Personal（默认）
│   └── 🏠 我的家
├── 项目-张老师家  ← 用户自建
│   └── 🏗 Studio-#A1（pending-transfer）
└── 万豪 12-15F  ← 用户自建
    ├── 🏨 1201, 1202, 1203, …
    └── …
```

- 普通用户 = 通常只有 Personal，少数会建"亲戚家" "出租屋"等
- Verified Builder = 通常会建"项目"形式的多个 Workspace
- **Workspace 没有类型；它就是用户自己的文件夹**

### 5.4 Pro Console (`/pro/*`)

Pro Console 是 **Verified Builder 的高频快捷壳**，本身不是新数据层：

```
Pro Console
├── 我的工作区（Workspace 视图，与前台一致）
├── 工单 / Orders
│   ├── #ORD-... · 安装中（关联 Studios）
│   └── #ORD-... · 已交付 · 待结算
├── 一键交付（封装 Transfer + Operator Grant）
└── 结算
```

切换 Workspace 时，模式标识：
- 不带 `metadata.orderId` 的 Studio = "个人创作"
- 带 `metadata.orderId` 的 Studio = "现场交付"（Cubix UI 强制要求关联 Order）

### 5.5 Cubix IDE Sidebar

```
Workspaces ▾
  · Personal
  · 项目-张老师家
  · 万豪 12-15F
  + 新建工作区

Studios（当前 Workspace 内）
  · Studio-#A1  · CN DC · pending-transfer · #ORD-1024
```

切换 Workspace = 切换"我现在在哪个项目里干活"，不影响所有权。

---

## 6. 与 v0.2 / v0.1 对比

| 维度 | v0.1 中转持有 | v0.2 InstallToken 直绑 | **v0.3 统一原语** |
|---|---|---|---|
| 核心信念 | Builder 是特殊用户 | Builder 是特殊用户 | **没有特殊用户** |
| 绑定 API 数量 | 2 套 | 2 套 | **1 套** |
| Workspace 类型 | Personal / Service / Team | Personal / Service / Team | **无类型 —— 所有 WS 同质** |
| Builder 是否短暂持有 Studio | 是 | 否 | 是（再 Transfer 出去） |
| 隐私问题怎么解 | UI 屏蔽 | 物理隔离（不绑到 Builder） | **`Studio.intent` 字段 + App 默认过滤** |
| 跨 DC 服务 | 不可行 | 默认（必须客户绑） | **可行（显式跨区交付 4 步流程）** |
| 朋友 / 二手 / 物业等场景 | 都得加补丁 | 加补丁 | **天然支持** |
| 新增概念数 | 4（Service WS / Pending / 4 状态机...） | 4（InstallToken / OG / Service 投影 / DC 鉴权） | **2（TransferToken / OperatorGrant），都对所有用户开放** |

---

## 7. API 接口（v0.3 草案）

```
# 通用绑定（唯一入口）
POST   /v1/studios/discover                       // mDNS 后端登记
POST   /v1/studios/bind                           // body: { sn, pin, workspaceId?, intent?, metadata? }

# Workspace 自助管理（任何用户都能用）
POST   /v1/workspaces                             // 创建
PATCH  /v1/workspaces/{id}                        // 重命名
DELETE /v1/workspaces/{id}                        // 删除（必须为空）
POST   /v1/studios/{id}/move                      // body: { workspaceId } 同账号内挪动

# Transfer（让渡所有权，任何用户都能用）
POST   /v1/studios/{id}/transfer-tokens           // 签发 TransferToken
POST   /v1/transfer-tokens/{id}/accept            // 接收方接受（同 DC：原子；跨 DC：进入 handoff）
POST   /v1/transfer-tokens/{id}/decline           // 接收方拒绝
POST   /v1/transfer-tokens/{id}/cancel            // 发起方取消

# 跨区交付（仅在跨 DC 转移时触发）
POST   /v1/studios/{id}/handoff/export            // 导出 Bundle
POST   /v1/studios/{id}/handoff/reset             // 工厂复位
POST   /v1/studios/{id}/handoff/import            // 在新 DC 上 Import Bundle

# OperatorGrant（任何 owner 都能用）
POST   /v1/studios/{id}/operator-grants           // 签发
DELETE /v1/studios/{id}/operator-grants/{gid}     // 撤销

# Order（B 端业务层；Verified Builder 才能创建）
POST   /v1/orders                                 // 创建（含 customer / builder / sn 范围）
PATCH  /v1/orders/{id}/status                     // 状态推进
POST   /v1/orders/{id}/settle                     // 检查证据链 + 触发分润

# 审计
GET    /v1/studios/{id}/ownership/events          // 全量事件流（Bind/Move/Transfer/Grant/Reset）
```

**鉴权与跨 DC：**
- 写接口在 owner DC 落库
- 跨 DC 调用（如 Builder 在 CN DC 操作 EU 客户 Studio）由网关路由 + IAM 校验 OperatorGrant
- TransferToken 跨 DC accept 不直接成功，必须走 §4.4 跨区交付流程

---

## 8. 决策点

| # | 问题 | 推荐 |
|---|---|---|
| 1 | Cloud Home 是否每个账号默认创建 | **是** |
| 2 | Transfer 时是否强制带 OrderId | **否** —— 不强制，但 Verified Builder 的 Cubix Pro UI 会强提示 |
| 3 | TransferToken 默认有效期 | **72 小时**（Verified Builder 模式）/ **7 天**（普通模式） |
| 4 | 跨 DC handoff 的 Bundle 加密 | 必须（owner 公钥加密） |
| 5 | OperatorGrant 默认期限 | **90 天**（warranty）/ **365 天**（household 给家人） |
| 6 | App 主页是否完全隐藏 service-* | **是**，仅在"服务中的项目"入口可见（Pro 模式） |
| 7 | 跨 DC 路由的 P95 延迟目标 | 250 ms |
| 8 | 同账号能否跨 DC 切换 | **不能**，必须新账号 |
| 9 | Workspace 数量上限 | Personal: 1；其他：每账号 50（Verified Builder 200） |
| 10 | "Verified Builder"是不是特殊用户 | **不是** —— 仅是资质标记，不开特殊路径 |

---

## 9. 统一登录流程与标签约定（v0.3 关键追加）

### 9.1 一条共同的设计原则

> **绑定与创建的 DC，由"当前活动的国家/地区/服务器"决定；这个 DC 是 C 端登录前选定，B 端 / Dev 登录后可切。Workspace 永不在登录链路上以"二次选择"的方式出现。**

具体表现：

- **C 端 (App / Studio Web)**：登录前选国家/地区 → 该会话锁定 DC → 后续绑定 / 创建全部落在这个 DC 的 Personal Workspace
- **B 端 (Builder 前后台)**：账号+密码登录 → 默认进主 DC → 顶部切换器随时换 DC（同 DC 多国之间切换是纯 UI filter）
- **Dev (Developer Portal)**：账号+密码登录 → 默认进主 Server → 顶部 Server 下拉切换

### 9.2 用户视角 vs 技术视角的标签

国家/地区 ↔ DC 是**多对一**映射，不是同义词。两者用于不同 persona、不同时机：

| 端 | UI 标签 | 标签出现时机 | 真实切换粒度 | 谁看 |
|---|---|---|---|---|
| Aqara Life App | **国家/地区** | 登录前选 | DC（一次性锁定） | C 端用户 |
| Studio Web (M300 本地) | **国家/地区** | 登录前选 | DC（一次性锁定） | 终端用户 / Builder |
| Builder 前台 / 后台 | **国家/地区** | **登录后**在顶部切换 | DC（in-session 可切） | 业务用户 + Verified Builder |
| Developer Portal | **服务器 (Server)** | 登录后在顶部切换 | DC（in-session 可切） | 开发者 |

> Aqara 共 6 个 DC：CN / US / EU / SG / KR / RU；服务 200+ 国家。
> 国家 → DC 的映射在 IAM 元数据中维护，对 C 端用户完全透明。
>
> **注意 Builder 与 App 的关键差异**：App 是登录前选地区（一次性），Builder 是登录后切地区（会话内可切）。原因见 §9.3 与 §9.6。

### 9.3 四端登录链路矩阵（关键差异）

> **核心区分：C 端是"登录前选 DC"，B 端 / Dev 是"登录后切 DC"。**
> 这是因为 C 端用户单 DC 心智、追求专一；B 端 / Dev 是工具平台、可能跨 DC 服务，需要会话内自由切换。

| 端 | 登录链路 | 默认进入 | 切换 DC 的方式 |
|---|---|---|---|
| **Aqara Life App** | **国家/地区** + 账号 + 密码/验证码 | 该 DC 的"我的家"；**完全不暴露 Workspace** | 退出登录重选 |
| **Studio Web (M300)** | **国家/地区** + 账号 + 密码 | Studio 自动连该 DC 的 Studio Cloud；自动绑到该 DC 的 Personal Workspace；**绑定页不让选 Workspace** | 解绑后重选 |
| **Builder 前台** (`/home/*`) | **账号 + 密码**（不选地区） | 全部数据的"汇总视图" | **不在顶部切换**；Studios 页内按 DC 分组陈列（YouTube-style） |
| **Builder 后台** (`/pro/*`) | 同上 | 该账号"主 DC"的客户/项目/Studios | **顶部"工作地区"切换器**（in-session） |
| **Developer Portal** | 账号 + 密码（不选 server） | 主 DC 的 OpenAPI 项目 | 顶部 **Server** 下拉（in-session） |

> **"主 DC" 怎么确定？**
> 1. 账号注册时所在国家对应的 DC
> 2. 如该 DC 无数据，回退到"账号最近一次有数据的 DC"
> 3. 用户可在设置里改默认 DC

### 9.3.1 为什么 Builder 前台的切换器不放在顶部？

Builder 前台 (`/home/*`) 的菜单中，**只有 Studios 是 DC 隔离的**，其余都是全局内容（YouTube-style）：

| 菜单 | 是否 DC 隔离 |
|---|---|
| Home / Discover / Marketplace / Ideabooks / Assets / Messages / Find a Builder / Community | ✗ 全局 |
| **My Studios** | ✓ DC 隔离 |
| My Solutions（部署绑定 DC，方案库可全局） | △ 模糊 |

如果在顶部放全局切换器，**用户在 Discover / Community 页切换地区，社区内容不会变** —— 这是典型的 *affordance lie*（提示了能做的事但实际不会发生）。

**所以正确做法是：**

- Builder 前台 → My Studios 页**按 DC 分组陈列**（无切换器）。普通用户 99% 只在一个 DC 有数据，看到一组就行；跨 DC 用户能一次看全所有。
- Builder 后台 → 顶部全局切换器。Pro Console 几乎所有页（Projects / Customers / Studios / Settlement）都是 DC 隔离的，全局切换器是自然的。

### 9.4 Studio Web (M300 本地) 详细流程

> 这是把"Aqara Life App 登录心智"复制一份到 M300 自带的本地 Web Admin，让用户从 App / Studio Web 任何路径绑定，体验一致。

```
打开浏览器 → http://aqarastudio-b9c4.local
        ↓
[Step 1] 选国家/地区
   · 默认值：从 M300 IP 地理推断
   · 用户可改：下拉选择（同 App 的列表）
        ↓
[Step 2] 账号 + 密码
   · 用户可见的就是 Aqara 账号；与 App 互通
        ↓
   [后台静默]
   Studio Web 用 (国家/地区, account) 决定连哪个 Studio Cloud
   Studio 长连接到该 DC
   自动写入：该 DC · 该账号 · Personal Workspace
        ↓
[Step 3] 「云端连接已就绪 · 🇨🇳 中国大陆」
   · 主信息：账号 + 国家/地区
   · 弱化：Workspace 变成小灰标签
   · 弱化：把"前往 Aqara Builder"换成 3 个等权入口：
        → Aqara Builder（远程访问与协作）
        → Cubix IDE（创作空间方案）
        → Developer Portal（调用 OpenAPI）
   · 底部小字：当前归属于「我的 Personal 工作区」 · [解除绑定]
```

### 9.5 弱化 Workspace 的三条规则

| 场景 | 旧做法 | 新做法 |
|---|---|---|
| App 绑定 M300 时 | 让用户选"绑定到哪个 Workspace" | **不出现 Workspace 选择**；自动落 Personal |
| Studio Web 绑定成功页 | 大卡片显示"Workspace: Jun · 中国大陆" | 主标题用国家/地区；Workspace 仅以小灰标签呈现 |
| Studio Web 绑定成功后的引导 | 单一"前往 Aqara Builder 控制台"按钮 | 三选一入口列表（Builder / Cubix / Developer），等权呈现 |

**Workspace 概念何时出现？**

- 仅当用户主动进入 Builder 前台/后台 / Cubix IDE 等 B 端工具时，才把 Workspace 显式呈现为侧边栏组织单位。
- 普通用户终其一生可能只用 Personal，Workspace 概念对他们 100% 透明。
- Builder 用户会主动创建额外 Workspace（项目-X 客户、万豪 12-15F 等），这是高频用户行为，跟登录链路无关。

### 9.6 "工作地区" 切换器（仅 Builder 后台 + Developer Portal）

> **真相：国家/地区是 UI 标签，DC 是真实的数据隔离边界。**
> Builder 后台用国家/地区做 wrapper 是为了业务感；Developer Portal 用 server 是技术语义；底层切的永远是 DC。
>
> **重要：Builder 前台不放全局切换器**（理由见 §9.3.1）；前台的 My Studios 用"按 DC 分组陈列"。

#### 9.6.1 国家 ↔ DC 是多对一映射

| 用户看到的国家/地区标签 | 实际 DC | 同 DC 多国举例 |
|---|---|---|
| 🇨🇳 中国大陆 | CN | — |
| 🇺🇸 美国 / 🇨🇦 加拿大 / 🇲🇽 墨西哥 | US | 切换不重载 |
| 🇩🇪 德国 / 🇫🇷 法国 / 🇮🇹 意大利 / 🇪🇸 西班牙 / 🇵🇱 波兰 / 🇸🇪 瑞典 … | EU | 切换不重载 |
| 🇸🇬 新加坡 / 🇲🇾 马来西亚 / 🇮🇩 印尼 / 🇹🇭 泰国 / 🇮🇳 印度 … | SG | 切换不重载 |
| 🇰🇷 韩国 / 🇯🇵 日本 | KR | 切换不重载 |
| 🇷🇺 俄罗斯 | RU | — |

> **同 DC 多国之间切换 = UI 内部 filter，不触发数据重拉。**
> **跨 DC 切换 = 真切换，重新加载该 DC 的工作区 / Studio 数据。**

#### 9.6.2 切换器的两层粒度（仅 Builder 后台）

```
┌── 顶部"工作地区"切换器（Builder 后台 Pro Console） ──┐
│                                                    │
│  [🌐 当前: 🇪🇺 欧洲 (EU 数据中心) ▾]              │
│                                                    │
│  下拉打开后:                                        │
│  ─ 我有数据的地区 ─                                │
│   ▸ 🇨🇳 中国大陆 (CN 数据中心) · 12 Studios        │
│   ▸ 🇪🇺 欧洲 (EU 数据中心) · 8 Studios             │
│       已服务: 🇩🇪 🇫🇷 🇮🇹                          │
│   ▸ 🇸🇬 东南亚 (SG 数据中心) · 3 Studios           │
│  ─ 其他可访问地区（暂无数据）─                     │
│   · 🇺🇸 美洲 (US 数据中心)                          │
│   · 🇰🇷 韩国/日本 (KR 数据中心)                     │
│   · 🇷🇺 俄罗斯 (RU 数据中心)                        │
└────────────────────────────────────────────────────┘
```

> **Builder 前台没有这个切换器**，My Studios 页改用按 DC 分组陈列：
> ```
> 🇨🇳 中国大陆  ── CN 数据中心 ─────  2 工作区 · 5 Studio
>   [我的家]  [我的测试空间]
>
> 🇺🇸 美洲    ── US 数据中心 ─────  1 工作区 · 1 Studio
>   [洛杉矶的家]
> ```

**两层逻辑：**

1. **第一层 — DC 粒度（决定看哪份数据）**：6 个数据中心，切换会真重载
2. **第二层 — 国家筛选（DC 内的 UI filter）**：在 Studio 列表里按客户国家进一步筛，瞬时

#### 9.6.3 Studio 列表内的国家二级筛选

```
┌── Studios（当前: 🇪🇺 欧洲 · EU 数据中心 · 8 项）──┐
│                                                   │
│  按客户国家筛选:                                   │
│  [全部 (8)] [🇩🇪 德国 (5)] [🇫🇷 法国 (2)] [🇮🇹 意大利 (1)] │
│                                                   │
│  ▢ 🏨 万豪 慕尼黑 1206         🇩🇪 德国 · DE-MUC   │
│  ▢ 🏠 张奶奶家                 🇩🇪 德国 · DE-BER   │
│  ▢ 🏠 Maria's apartment        🇫🇷 法国 · FR-PAR   │
│  ▢ ...                                            │
└───────────────────────────────────────────────────┘
```

每张 Studio 卡片标"客户国家/地区"，让 Builder 即使在同一 DC 内也能区分客户来自哪个国家（这对发票、合规、运营有意义）。

#### 9.6.4 跨地区交付场景

Builder 主账号自身有"主 DC"（注册时定下），但**账号在多个 DC 都可能有数据**（曾在不同 DC 服务过客户）。流程：

1. 创建 Order 时，**客户国家/地区** 作为 Order 字段单独保存
2. 现场 Bind Studio：Builder 切到客户所在的"工作地区"（DC），登录态自动路由到该 DC，绑定的 Studio 落在 Builder 在该 DC 的 Personal Workspace
3. Transfer 时同 DC 原子转移；如客户账号 DC 与 Studio DC 不同（罕见），走 §4.4 跨区交付
4. 结算事件由 Builder 主 DC 聚合 ledger，跨 DC 写审计副本

> **关键：Builder 一个账号天生跨 DC，不需要多账号；切换 DC 是 in-session 操作。**

### 9.7 Developer Portal 的对照设计

Developer Portal 与 Builder 后台是**同一种切换机制的两种 wrapper**：

| 维度 | Builder 前台/后台 | Developer Portal |
|---|---|---|
| 切换器主标签 | 🇪🇺 欧洲（业务感强） | EU · Europe Server（技术感强） |
| 切换器副标签 | "EU 数据中心" | OpenAPI base URL: `eu.api.aqara.com` |
| 二级筛选 | 客户国家/地区 | API project / device / app |
| 切换时是否重登 | **否**（in-session） | **否**（in-session） |
| 切换是否重载 | 跨 DC 重载，同 DC 不重载 | 同左 |

> 同样的底层逻辑，**用业务用户能理解的语言或开发者能理解的语言，分别打两层皮**。这种"标签解耦底层"是 IA 上正确的事情。

---

## 10. 与现有文档的关系

- 本文是 [`cubix-builder-prd.md`](./cubix-builder-prd.md) §4 数据契约 与 §3.2 用户旅程的细化（v0.3 已对齐）。
- [`builder-console-spec.md`](./builder-console-spec.md) 中"Studio 列表 / 转移 / 结算"按本文 §4 / §7 重新对齐。
- [`aqara-life-app-prd.md`](./aqara-life-app-prd.md) 中"添加家 / 接收转移"按 §5.2 + §9.4 规则实现。
- [`builder-two-sided.md`](./builder-two-sided.md) 中 ACB 服务流程按 §4.3 流程对齐。
- Studio Web (M300 本地 Admin) 的"云端连接"页按 §9.4 + §9.5 改版。
