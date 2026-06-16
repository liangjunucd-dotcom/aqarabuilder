# Verified Builder 项目交付全流程设计

> 范围：Builder Pro Console、Cubix IDE、Aqara Studio、Aqara Life App 四端协同
> 目标：让"上门交付"成为可标准化、可结算、可质控的产品化流程
> 版本：v0.1（2026-05-19）

---

## 0. 设计哲学

> **一个 Project = 一个客户 × 一份合同 × 一份交付 × 一份结算 × 一个保修期。**
>
> 一切信息（方案、Studio、客户、签字、结算、KPI）都挂在 Project 上，形成不可篡改的事件流。Project 是 Pro Console 的单一真相源。

由此推出**两条核心架构原则：**

1. **工具职责完全不重叠**
   - Cubix IDE = 创作的唯一入口
   - Pro Console = 交付管理的唯一入口
   - Aqara Life = 客户参与的唯一入口
   - Aqara Studio (M300) = 仅做本地运行时配置 + 云连接

2. **每个阶段必须产生可审计事件**
   - 自动写入 Project Timeline（append-only）
   - 用于结算证据链 + 争议仲裁 + 全球 KPI

---

## 1. 工具职责分工

| 工具 | Persona | 在交付流程中的角色 | **不该做什么** |
|---|---|---|---|
| **Aqara Life App** | C 端业主 / 现场 Builder B | 业主：接收 Order / 设计预览 / 验收签字 / 报修 / NPS<br>Builder B：现场 Builder 模式（配网 / 入网 / 设备亮灯映射 / 一键拉取方案部署） | 不做方案设计；不做项目管理 |
| **Builder 前台** (`/home/*`) | 业主自助 | 按国家查 Space · 社区 · 找 Builder | 不做项目交付；不暴露 Space 概念 |
| **Builder Pro Console** (`/pro/*`) | Verified Builder（A + B） | **交付主控台**：5 阶段在此推进 / 派单接单 / 工单台账 | 不做创作（跳到 Cubix） |
| **Cubix IDE** (`/build/*`) | Builder A 设计师 | **创作主控台**：AI Agent 设计 / 户型解析 / 3D 预览 / 远程部署 | 不做客户管理（跳到 Pro Console）；不做现场配网 |
| **Studio Web (M300)** | Builder B 现场 / 高阶业主 | 本地配置、云连接、协议调试（兜底） | 不做创作；不做项目管理 |

---

## 1.x 双 Builder 协同：四端职责分工

> **场景**：Builder A（方案设计师 · 坐办公室）+ Builder B（现场实施工程师 · 跑工地）协同交付一个项目。
>
> 用户问：4 步流程到底是放在 Builder Pro Console 里，还是 Cubix 里？Studio Web（Web 端）和 Cubix（桌面端 IDE）如何分工？

### 1.x.1 一句话决策

| 步骤 | 主操作端 | 设备形态 | 为什么 |
|---|---|---|---|
| **① 前期方案设计**（Builder A） | **Cubix Desktop IDE** + Pro Console（壳） | 桌面 | 设计是长会话、多文件、需 GPU 渲染 / 户型 OCR / AI Agent 长上下文，**Web 不适合** |
| **② 任务承接**（Builder B 接单） | **Pro Console (Web)** | Web / 移动浏览器 | 工单台账是轻量查阅 + 派单流转，**Web 优先**；现场用手机也能看 |
| **③ 现场落地实施**（Builder B 执行） | **Aqara Life App (Builder 模式)** + Studio Web（兜底） | 手机为主，笔电兜底 | 现场需要扫码 / 蓝牙 / 相机 / 单手操作，**只能手机**；笔电插线时用 Studio Web 兜底 |
| **④ 项目闭环**（A 复核 + 客户验收） | Pro Console (Web) + Aqara Life App | Web + 手机 | 状态机流转、归档、运维授权 = Web；客户验收 = 手机 |

### 1.x.2 三体一台架构

```
┌─────────────────────────────────────────────────────────────┐
│  ☁️ Pro Console (Web)        — 项目台账 / 调度中心  「轻」      │
│  ─────────────────────────────────────────────────────       │
│  · 立项、报价、合同、Customer 绑定                              │
│  · 派单、工单中心、收款结算                                      │
│  · 5 阶段状态机、Timeline 审计、KPI / Tier 看板                  │
│  · 跨设备访问：办公室桌面、现场手机浏览器都能用                    │
└─────────────────────────────────────────────────────────────┘
        │  「打开 Cubix 设计」/ 状态回写        ▲ KPI / 工单回流
        ▼                                     │
┌─────────────────────────────────────────────────────────────┐
│  💻 Cubix Desktop IDE        — 设计 / 编排 / 调试    「重」    │
│  ─────────────────────────────────────────────────────       │
│  · AI Agent 长会话、户型图 OCR、3D 渲染、Topology 编辑          │
│  · 模板库、Diff 审批、虚拟调试、自动化规则编排                    │
│  · 通过 MCP 隧道远程连入任意已绑定 Studio                       │
│  · 本地存储 Solution Draft、本地缓存模板与资产                    │
└─────────────────────────────────────────────────────────────┘
        │  「方案下发」（Solution + 设备清单 + 自动化）
        ▼
┌─────────────────────────────────────────────────────────────┐
│  📱 Aqara Life App (Builder 模式) — 现场移动 IDE   「轻+硬件」 │
│  ─────────────────────────────────────────────────────       │
│  · 切换 Builder 入口 → 选项目 → 进入现场模式                     │
│  · 配网入网、扫码绑定、Studio 注册到云                           │
│  · 设备亮灯映射（实体↔数字孪生点位匹配）                          │
│  · 一键拉取 Cubix 已定稿方案 → 部署到现场 Studio                 │
│  · 完工反馈 / 录屏存证                                          │
└─────────────────────────────────────────────────────────────┘
        │  「现场兜底」（弱网 / 大批量调试时使用）
        ▼
┌─────────────────────────────────────────────────────────────┐
│  🌐 Studio Web (本地局域网)   — 兜底 / 高阶运维    「兜底」      │
│  ─────────────────────────────────────────────────────       │
│  · Builder B 笔电直连 Studio LAN 时使用                        │
│  · 设备列表、规则调试、协议日志、本地账号                         │
│  · 与 Cubix 远程模式互补（无网时本地干）                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.x.3 为什么这么分（深层原因）

**▍Cubix 必须做成桌面端 IDE，不能塞进 Pro Console**

1. **算力**：户型图 OCR、3D Topology 渲染、Agent 长上下文推理 → 浏览器 tab 内存撑不住
2. **文件系统**：Solution 草稿、模板包、客户资产需要本地缓存与版本控制（类比 VSCode）
3. **MCP 隧道 + 本地工具链**：远程连接 Studio、调起本地脚本 → 桌面应用能力
4. **用户角色**：设计师 = 长时段、专注、单任务 → 像 Figma Desktop / VSCode 的产品形态
5. **离线**：设计阶段哪怕断网也能继续做 → Web 做不到

**▍Pro Console 必须保持 Web，不能并入 Cubix**

1. **跨设备**：办公室桌面看大盘、地铁里手机刷工单、客户面前平板演示 → 只能 Web
2. **管理属性**：项目台账、KPI、结算、合规 → 标准 SaaS 形态
3. **平台治理**：Aqara 总部要统一管理全球 Builders → Web 才能集中策略下发
4. **轻量**：单页加载快、状态简单 → 不适合做重型 IDE

**▍现场必须用 Aqara Life App，而不是 Studio Web**

1. **硬件能力**：扫码、蓝牙发现、相机识别 → 浏览器没有
2. **物理位置**：现场要走来走去、爬梯子、贴墙安装 → 单手手机
3. **设备亮灯映射**：必须能拍照 / 蓝牙触发实体灯反馈 → 原生 App 体验
4. **复用 App 信任链**：业主已经装了 Aqara Life，现场 Builder 切换到 Builder 模式即用 → 不用再装东西

**▍Studio Web 退化为"现场兜底 + 高阶运维"**

1. 大批量调试、协议级排错、断网现场 → 笔电 + 局域网直连 Studio Web 比手机高效
2. 与 Cubix 远程模式职责重叠时，**远程优先 Cubix，本地优先 Studio Web**

### 1.x.4 4 步流程 × 工具映射（最终决策表）

| 流程子动作 | 主端 | 备端（兜底） | 状态机事件 |
|---|---|---|---|
| **① A 在 Pro Console 新建商业项目 / 绑定客户** | Pro Console | — | `project-created` |
| **① A 空白搭建 / 导入模板方案** | **Cubix Desktop** | — | `design-started` |
| **① AI 优化布局 / 设备配比 / 联动** | **Cubix Desktop** | — | — |
| **① 生成 2D/3D 点位图 / BOM** | **Cubix Desktop** | Pro Console 项目页可预览 | — |
| **① 编排自动化 / 虚拟调试** | **Cubix Desktop** | — | — |
| **① A 发起施工任务 / 指派 B** | Pro Console | — | `task-assigned` |
| **② B 登录 Pro Console 接单** | **Pro Console (Web)** | Pro Console 移动版 | `task-accepted` |
| **② B 查阅图纸 / 设备清单 / 流程标准** | Pro Console（只读视图） | Cubix 也能查（A 共享） | — |
| **③ B 现场打开 Aqara Life App Builder 模式** | **Aqara Life App** | — | `field-mode-entered` |
| **③ Studio 配网入网 / 注册云** | **Aqara Life App** | Studio Web | `studio-bound` |
| **③ 硬件安装 / 批量入网 / 基础调试** | **Aqara Life App** | Studio Web | `devices-onboarded` |
| **③ 关联绑定项目 + 数字方案** | **Aqara Life App** | — | `studio-attached-to-project` |
| **③ 实体设备亮灯映射数字孪生点位** | **Aqara Life App**（核心硬件能力） | — | `twin-mapped` |
| **③ 一键下发 Cubix 定稿方案到 Studio** | **Aqara Life App** | Cubix 现场模式（远程） | `solution-deployed` |
| **③ 现场录屏存证（高净值项目）** | Aqara Life App | — | `cubix-recording` |
| **④ B 提交完工反馈** | Aqara Life App / Pro Console | — | `installation-completed` |
| **④ A 在 Pro Console 复核归档** | Pro Console | — | `acceptance-requested` |
| **④ 客户在 Aqara Life 验收 + 接受 Transfer** | **Aqara Life App** | — | `acceptance-signed` / `transfer-completed` |
| **④ Builder 保留 OperatorGrant 运维权** | Pro Console（凭证） / Cubix（远程） | — | `operator-grant-issued` |

### 1.x.5 战略含义（为什么这套分工面向未来）

1. **职责零重叠**：每个工具只做它最擅长的事（创作 vs 调度 vs 现场 vs 兜底）
2. **设备形态匹配场景**：桌面 = 创作、Web = 管理、移动 = 现场、本地 Web = 兜底
3. **Cubix 桌面化是护城河**：把"空间智能 IDE"做成像 VSCode / Figma 那样的桌面级体验，竞品在 Web 端难以追上
4. **Aqara Life Builder 模式是杀手锏**：把"设计即交付"塞到客户已有的 App 里，复用信任链 + 硬件能力
5. **Pro Console 是商业化触点**：所有结算、KPI、Tier、客户运营都在这里，是 Aqara 平台对 Builders 治理的载体

---

## 2. 核心数据模型

```ts
interface Project {
  id: string;
  orderId: string;
  builder: { accountId: string; teamId?: string };

  customer: {
    accountId?: string;          // 客户已有 Aqara 账号则填
    phone: string;
    country: Country;            // 决定 Studio 最终归属 DC
    address?: string;
    name: string;
  };

  scope: {
    rooms: number;
    devices: number;
    solutionTemplateId?: string;
    estimatedHours: number;
    quotedAmount: number;
  };

  state: ProjectState;            // 见 §3 状态机
  attachedStudios: string[];      // Studio SN（项目持有的设备）
  cubixSolutions: string[];       // Solution Draft IDs
  evidence: ProjectEvidence[];    // 自动汇聚的证据（哈希、签字、录屏）

  acceptance?: {
    signedAt: string;
    method: 'qr' | 'app' | 'in-person';
    signatureUrl: string;
  };
  warrantyOperatorGrantId?: string;
  settlement?: SettlementState;
  qualityScore?: number;          // 来自 KPI（§5）

  events: ProjectEvent[];         // 不可变审计日志
}

type ProjectState =
  | 'lead'                        // 阶段 1：询单
  | 'accepted'                    // 阶段 1.5：接受报价（生成 Order）
  | 'designing'                   // 阶段 2：Cubix 设计中
  | 'design-confirmed'            // 阶段 2.5：客户预览签字
  | 'installing'                  // 阶段 3：现场装机
  | 'pending-acceptance'          // 阶段 4：装完待验收
  | 'delivered'                   // 阶段 4.5：验收完成（Transfer 同步）
  | 'in-warranty'                 // 阶段 5：保修期
  | 'closed'                      // 保修结束
  | 'cancelled' | 'disputed';

interface ProjectEvent {
  id: string;
  ts: string;
  kind:
    | 'order-created'
    | 'design-started' | 'design-preview-sent' | 'design-signed'
    | 'studio-bound' | 'solution-deployed' | 'devices-onboarded'
    | 'acceptance-requested' | 'acceptance-signed' | 'transfer-completed'
    | 'operator-grant-issued' | 'warranty-ticket' | 'cubix-recording'
    | 'settlement-triggered' | 'kpi-calculated';
  actorAccountId: string;
  payload: Record<string, unknown>;
  hash?: string;                  // 关键事件强制 hash
}
```

---

## 3. 五阶段状态机 + 工具映射

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 阶段 1：接单（Pro Console · Leads）                                      │
│   Lead → Accepted                                                         │
│   ─────────────────────────────────────────────────────────────────       │
│   Builder：在 Leads 收单 → 报价 → 发送合同到客户 Life App                 │
│   客户：Life App 收到 → 同意报价 → Order 生成                             │
│   产出：orderId · 合同哈希 · 响应时长 KPI                                  │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 阶段 2：设计（Cubix IDE 虚拟模式）                                        │
│   Designing → Design-Confirmed                                            │
│   ─────────────────────────────────────────────────────────────────       │
│   Builder：在 Cubix 用 AI 设计空间图谱 / 设备清单 / 场景 / 自动化         │
│   - 可上传客户户型图                                                       │
│   - Solution Draft 自动绑定 Project                                        │
│   - 完成后点 "发送预览给客户"                                              │
│   客户：Life App 收到预览（3D / Topo / 设备清单）→ 一键签字确认           │
│   产出：Solution Draft 哈希 · 客户签字（IAM Token）                       │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 阶段 3：装机（Studio Web + Cubix 现场模式）                              │
│   Installing                                                              │
│   ─────────────────────────────────────────────────────────────────       │
│   Builder 现场：                                                           │
│     1) M300 通电 → mDNS → Studio Web 用 Builder 自己账号 Bind            │
│        → Studio 落到 Builder Personal Workspace · Builder 主 DC          │
│        → 自动打 metadata.orderId 标记 intent='service-pending-transfer'  │
│     2) 在 Pro Console 项目页里点"现场装机" → 唤起 Cubix 现场模式         │
│        → Cubix 自动加载阶段 2 的 Solution Draft → 一键部署                │
│     3) 完成现场任务清单：                                                  │
│        ☑ 设备入网    ☑ 关键场景验证    ☑ 现场录屏（可选）                │
│   产出：bind 事件 + Solution 部署 hash + 设备清单 + 录屏 URL              │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 阶段 4：验收（Aqara Life App + Pro Console）                             │
│   Pending-Acceptance → Delivered                                          │
│   ─────────────────────────────────────────────────────────────────       │
│   Builder：在 Pro Console 项目页点 "发起验收"                              │
│     → 生成测试场景包推送到客户 Life                                       │
│     → 同时发起 Transfer（Studio 让渡）                                    │
│   客户：Life App 收到测试任务 → 完成测试 → 一键验收（同意 Transfer）       │
│     → 同 DC：原子转移；跨 DC：进入 §4.4 跨区交付子流程                    │
│     → Transfer 完成自动签发 OperatorGrant 给 Builder（默认 90 天保修）   │
│     → Studio.intent 自动改为 'service-warranty'                           │
│   产出：Transfer 完成事件 + 客户签字 + OperatorGrant ID                   │
│        → 触发结算（7 天冷静期）                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 阶段 5：运维（Cubix + Pro Console + Life）                               │
│   In-Warranty → Closed                                                    │
│   ─────────────────────────────────────────────────────────────────       │
│   客户 Life App：报修 / 评价 / 补充设计需求                                │
│   Builder：Pro Console 收到工单 → Cubix 远程接入（凭 OperatorGrant）       │
│   产出：工单数 / SLA 响应时长 / NPS（影响 Builder Tier）                   │
│   保修结束：OperatorGrant 失效 → 项目转 Closed                            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3.x 交付操作时序（推荐主路径 + 现场兜底）

> 上面的 5 阶段是**项目级状态机**（项目处于哪个阶段）。这里是**Builder 操作时序**（Builder 怎么动手）。两者正交。
>
> 推荐主路径不是“现场都弄完了才创建项目”，而是：**上门前先创建/确认 Project**，现场只负责把 Studio 接入、挂载、部署、验收。  
> 但为了兼顾真实业务，系统也允许“现场临时成交/临时加单”时在现场创建 Project 作为兜底。

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 0. 上门前准备（推荐主路径）                                               │
│    0-1  Pro Console 创建/确认 Project                                     │
│         · Project Name / Customer / Project Country / Building Type        │
│         · Project Country 表示项目所在地，用于匹配可关联 Studio 的国家     │
│    0-2  Cubix 生成或确认 Solution Draft                                   │
│         · 工具：Pro Console + Cubix                                        │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. 前往项目现场                                                           │
│    1-1  Builder 登录自己的 Aqara 账号（Life App 或 Studio Web）            │
│    1-2  到现场后准备初始化 Studio                                         │
│         · 工具：Life App / Studio Web                                     │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 2. 局域网发现 / 访问 Studio                                               │
│    2-1  在 Aqara Life App 局域网内 mDNS 发现 Studio                       │
│    2-2  浏览器直接打开 Studio Web 局域网 IP 访问                           │
│         · 工具：Life App / Studio Web（任选其一即可，等价）               │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 3. Studio 初始化（本地账号/密码）                                         │
│    设备级凭据，断网时仍可登录配置；与 Aqara 云无关                        │
│    · 工具：Studio Web                                                     │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 4. 绑定 Studio 到 Aqara 云端                                              │
│    4-1  路径 A：Life App 内一键连云                                        │
│         → Studio 注册到 App 当前登录的国家/地区对应的数据中心             │
│         · 工具：Life App + Studio                                         │
│    4-2  路径 B：不用 App，直接 Studio Web 单独连云                        │
│         → Studio Web 自带"选国家/地区 + 输入 Aqara 账号"流程              │
│         · 工具：Studio Web                                                │
│    无论 A / B，效果完全一致：Studio 落到 Builder 自己 Personal Workspace  │
│    （Builder 也是普通用户，遵循 Unified Primitives）                      │
│    校验：Studio 国家/地区必须与 Project Country 一致，否则不能直接挂载     │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 5. 挂载 Studio 到 Project + Cubix 部署                                    │
│    5-1  Pro Console 项目详情页 Studios Tab 选择已连云 Studio              │
│    5-2  仅显示/允许选择与 Project Country 一致的 Studio                   │
│    5-3  挂载后 Studio.intent = service-pending-transfer                   │
│    5-4  从 Project 打开 Cubix 现场模式，部署 Solution Draft               │
│         · 工具：Pro Console + Cubix                                       │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 6. 客户验收 + 发起 / 完成 Transfer                                        │
│    6-1  Builder 在 Pro Console 发起 Transfer                              │
│    6-2  客户 Aqara Life 收到安装验收通知                                  │
│    6-3  客户完成测试场景，一键验收并接受 Studio                           │
│         · 同 DC 项目 → 客户 Aqara Life 收到验收通知 → 一键接受 → 原子转移 │
│         · 跨 DC 项目 → 4 步 handoff 流程（见 §3 跨 DC 转移）              │
│    6-4  Transfer 完成后：Studio Owner=客户，Builder 得到 90 天授权        │
└──────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 兜底路径：现场临时创建 Project                                            │
│    如果客户现场临时成交或项目未提前创建：                                 │
│    A. Builder 可在 Pro Console 临时创建 Project                           │
│    B. Project Country 必须选择现场所在地                                  │
│    C. 只能挂载同国家/地区已连云 Studio                                    │
│    D. 后续仍回到步骤 5/6 完成挂载、部署、验收、Transfer                   │
└──────────────────────────────────────────────────────────────────────────┘
```

**关键校验点（自动写入 Project Timeline 的事件）：**

| 步骤 | 自动事件 | 用途 |
|---|---|---|
| 1-2 | 无 | Studio 本地状态，不写云 |
| 4 | `studio-bound` (hash) | 结算证据链 1/4 |
| 0 / 兜底 A | `project-created` | 项目创建；记录项目所在地 |
| 5 | `studio-attached-to-project` (intent change) | 隐私保护切换点 |
| 6 | `transfer-initiated` / `transfer-completed` (signed) | 结算证据链 4/4 |

**为什么 Project Country 是“项目所在地”，不是“数据中心选择器”？**

- Builder 选择的是项目所在地，例如中国大陆、德国、美国。
- 系统根据项目所在地推导默认服务器，例如中国服务器、欧洲服务器、美国服务器。
- 关联 Studio 时，Studio 的国家/地区必须与项目所在地一致；否则不能直接关联。
- 如果 Builder 跨境交付，必须走跨 DC handoff / 重新绑定流程，而不是把不同国家的 Studio 直接挂进项目。

---

## 4. Pro Console 信息架构（IA）调整

### 4.1 四域侧栏

```
Pro Console
├── Projects                    ← Project Passport + Work Orders + Design / Studio / Acceptance / Service
├── Leads                       ← 线索承接 + 平台派单 + SLA + Won 后转 Project
├── Financials                  ← 报价 / 合同 / 收款 / Credits / 结算
└── Company                     ← Profile / Organization / Members / Credentials / Service Area / Catalog
```

**变化：**
- `Leads` 只承接线索、服务意图、平台派单和转项目动作；成交后进入 `Projects / Project Passport`。
- `Projects` 是交付主入口，通过 `WorkOrder` 承载远程设计、现场勘测、安装、Studio 调试、远程服务、维护和验收。
- `Financials` 承载旧 Ledger、Earnings、Credits、报价、合同和结算。
- `Company` 承载旧 Profile、Organization、Marketplace 供给、认证、服务区域和成员。
- Performance / Academy / Showcase 等成长能力默认进入 Company 或全局工具，不作为一级菜单。

### 4.2 Project 详情页（`/pro/projects/[id]`）

**结构：**

1. **顶部状态轨**：5 阶段进度（接单 → 设计 → 装机 → 验收 → 运维）
2. **当前阶段操作面板**（动态根据 `state` 渲染）
3. **Tabs**：概览 / Cubix 方案 / Studios / 设备 / Timeline / 结算

**各阶段面板设计：**

| 状态 | 操作面板核心 | 主要 CTA |
|---|---|---|
| `lead` → `accepted` | 询价 / 报价 / 合同模板 | 发送合同到 Life |
| `designing` | Cubix Solution 设计进度（缩略） | 进入 Cubix · 发送预览 |
| `design-confirmed` | 客户签字回执 + 装机准备清单 | 排期上门 |
| `installing` | 现场装机 checklist + 设备绑定实时进度 | 在 Cubix 现场模式打开 · 录屏 |
| `pending-acceptance` | 客户验收倒计时 + 测试场景包 | 重新推送 · 催办 |
| `delivered` → `in-warranty` | 保修期内事件流 + 工单 | 远程接入 Studio · 关闭工单 |

---

## 5. 全球质量管理（Aqara 视角）

### 5.1 自动收集的 KPI（每个 Project 完成时计算）

| KPI 指标 | 取数 | 用途 |
|---|---|---|
| 响应时长 | `Lead` → `Accepted` 间隔 | 计入 Builder Tier |
| 设计回退率 | `Designing` 阶段被打回次数 | 影响 Spider 模板权重 |
| 装机一次通过率 | `Installing` 阶段是否回退 | 影响保险费率 |
| 客户验收时长 | `Pending-Acceptance` → `Delivered` 间隔 | 反映装机质量 |
| 保修期工单数 | `In-Warranty` 内 ticket count | 反映装机质量 |
| 客户 NPS | Life App 评分 + 评论 | 公开显示在 Builder 主页 |
| Cubix 录屏完整性 | 关键步骤是否录屏 | 争议仲裁证据 |

### 5.2 三层 Builder 等级

| Tier | 进入门槛 | 平台权益 |
|---|---|---|
| 🥉 Bronze | 通过 Verified 认证 | 基础曝光、自找客户 |
| 🥈 Silver | NPS ≥ 4.5 · 一次通过率 ≥ 90% | 精准 Lead 派发 |
| 🥇 Gold | NPS ≥ 4.8 · 一次通过率 ≥ 95% · 累计交付 ≥ 50 | 高净值 Lead 优先 · Aqara 联合品牌 |

每季度自动重算，公示在 Pro Console `Performance`。

### 5.3 Aqara 总部内部 Admin（不属 Pro Console）

```
Aqara Delivery Ops Dashboard（仅 Aqara 员工）
├── 全球地图：今日活跃 Project 分布
├── 质量预警：保修期工单异常的 Builder
├── 争议中心：客户/Builder 投诉 + Cubix 录屏证据
├── Tier 自动调整审批
└── Builder 资质年审看板
```

> Pro Console 的 `Performance` 页 = Builder 自己看自己的指标
> Aqara Ops Dashboard = Aqara 总部看全球供给侧

### 5.4 结算证据链

```
结算自动触发条件（全部满足）：
  ✓ Order 哈希
  ✓ Solution 部署 hash
  ✓ Studio Bind 事件
  ✓ Transfer 完成 + 客户签字（IAM 鉴权）
  ✓ 7 天冷静期通过
  ✓ 客户未提起争议

任一缺失 → Pro Console 显式提示 Builder 补齐
```

---

## 6. 端到端示例：张奶奶适老化项目

```
[Day 0] Lead 进入
  · 客户女儿在 Life App 询单："给奶奶装适老化"
  · Pro Console "Leads" 收到 Lead
  · Builder Jun 24h 内回复报价 8400 元

[Day 1] Order 生成
  · 客户女儿在 Life 接受报价 → Order #ORD-1024
  · Project 自动创建（state=accepted），country=中国大陆

[Day 2-4] Cubix 设计
  · Jun 在 Cubix 上传户型图 → AI 生成空间图谱
  · 设计「起夜模式 / 跌倒检测 / 紧急呼叫」三套场景
  · 点 "发送预览" → 客户女儿 Life 看到 3D 预览 + 设备清单
  · 客户 Life 一键签字确认 → state=design-confirmed

[Day 5] 现场装机
  · Jun 上门 → M300 通电 → Studio Web 用 Jun 账号绑定
    （metadata.orderId 自动标记 intent=service-pending-transfer）
  · Pro Console 项目页点 "现场装机" → Cubix 现场模式打开
  · 一键部署 Solution → 11 台设备入网 → 关键场景验证 5/5
  · 录屏 12 分钟（可选）→ 上传 S3
  · state=pending-acceptance

[Day 6] 验收
  · Jun 点 "发起验收" → 客户女儿收到测试任务（在 Life）
  · 客户女儿测试通过 → 一键验收 → 同意 Transfer
  · 同 DC（中国服务器）原子转移
  · 自动签发 OperatorGrant 给 Jun（90 天）
  · Studio.intent='service-warranty'
  · state=delivered → 触发结算（7 天冷静期）

[Day 13] 结算入账
  · 7 天冷静期通过 → 自动结算
  · 平台费 10% (840) + 设备返佣 5%
  · Jun 实收 7560 元

[Day 30] 保修期事件
  · 奶奶夜里跌倒检测误触 → Life 报修
  · Jun Pro Console 收到工单 → Cubix 远程调试
  · 调整阈值 → 工单关闭 → SLA 响应 2h

[Day 90] 保修结束
  · OperatorGrant 自动失效
  · Jun 续约提醒 / 转 Closed
  · KPI 全量计算：NPS 4.9 · 保修工单 1 · 一次通过 ✓
```

---

## 7. 未尽事项 / 决策点

| # | 决策 | 推荐 |
|---|---|---|
| 1 | Leads 内是否进一步分 New / Follow-up / Estimate / Won | 是，Kanban 风格更直观 |
| 2 | 现场录屏强制 vs 可选 | 高净值（>5万）项目强制；其他可选 |
| 3 | 结算冷静期长度 | 默认 7 天；高净值项目可延长 |
| 4 | Builder Team 协作（多人共享 Project） | v2 再做 |
| 5 | Aqara 直营 Lead 分配规则 | 先按 Tier + 距离 + 历史 NPS |
| 6 | 跨 DC 项目结算 | 客户 DC 落账 → Builder 主 DC 提现 |
| 7 | 项目失败的处理 | 进入 cancelled / disputed，证据链冻结 |

---

## 8. 与现有文档的关系

- 上承 [`account-and-studio-lifecycle.md`](./account-and-studio-lifecycle.md) §4 的 Verified Builder 服务流程，把它**展开**成 5 阶段 + 工具协同
- 与 [`cubix-builder-prd.md`](./cubix-builder-prd.md) §4 数据契约对齐 Project 实体
- [`builder-console-spec.md`](./builder-console-spec.md) 的 Pro Console IA 按本文 §4 改造
- [`aqara-life-app-prd.md`](./aqara-life-app-prd.md) 接收"客户参与"的端：预览 / 验收 / 报修 / NPS
