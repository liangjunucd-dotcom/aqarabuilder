# Identity Model & Entry Point Routing

> Aqara 账号体系采用**单账号 + 多重身份叠加 + 入口决定上下文**模型。
> 进阶链路：**Customer → Professional（自助进阶） → ACB（经 Aqara Academy 认证）**。
> 个人视图 (Customer) 与专业控制台 (Professional / ACB) **物理隔离**，避免 Studio 列表跨身份混淆。
> Professional Profile、组织进入、Aqara Space / 服务商组织、Remote Service Console 和 Service Plan 的完整架构见 [`./professional-network-architecture.md`](./professional-network-architecture.md)。
> Service Provider 是独立关系类型，不是 Admin 的子集。挂靠关系（ACB ↔ Aqara Space 门店）全球统一，详见 [`./service-billing-model.md`](./service-billing-model.md)。
>
> ⚠ **术语消歧**:本文同时出现两个近似术语 — **Space**(无前缀,家庭空间数据模型,见 [`./data-model.md`](./data-model.md))与 **Aqara Space**(带前缀,服务商门店全球品牌,ACB 挂靠节点)。行文中**永远写完整的"Aqara Space"**,不简写。详细对照见 [`./service-billing-model.md`](./service-billing-model.md) 顶部的"术语备注"。

> 2026-06-07 定版：Builder Pro 是专业工作台能力，不是套餐、认证等级或用户角色。所有 Aqara Account 默认拥有 Personal Profile 和 Personal Workspace。Professional Profile 由 Professional Onboarding 激活，并与 Subscription、Certification、Workspace 解耦。Workspace Type 只保留 Personal Workspace / Team Workspace；计划只使用 Personal Plans（Free / Pro）和 Business Plans（Business / Enterprise）。

---

## 一、为什么要分身份

真实场景里，同一个 Aqara 账号对不同入口是不同"身份姿态"：

- ACB 自己也是普通用户 —— 自己家的 Studio 应该在个人侧
- ACB 服务的客户家 Studio 不能和自己家的混在一起
- ACB 子角色（Installer / Designer / Developer / Service）各自有独立工作流

如果不分身份，**Builder 前台 Studios 页面会同时显示"自己家 + 5 个托管客户家"**，既违反客户隐私期望，也让 ACB 自己界面错乱。

---

## 二、身份模型

### 进阶链路

```
Aqara 账号 (Identity)
│
├── 必有：Customer 身份（普通用户）
│
├── 可选进阶 1：Professional 身份（自助进阶，无门槛）
│   入口：进入 Builder 专业工作台（部分能力受限）
│   适用：创作者 / 开发者 / 设计师 / 极客用户
│
└── 可选进阶 2：ACB 身份（Aqara Certified Builder）
    前置：Professional + Aqara Academy 认证 + Badge
    解锁：接单权 + 采购权（Aqara Shop）+ 分润权 + 等级返利
    │
    └── 子角色（可同时叠加多个）：
        ├── ACB(Installer)    ← 线下安装施工
        ├── ACB(Designer)     ← 空间设计 / Persona Composer 专业版
        ├── ACB(Developer)    ← Plugin / Agent 开发
        └── ACB(Service)      ← 长期 Persona 托管 / 运维
```

同一账号在 Builder 前台还应拥有一份可渐进展示的 `Professional Profile`：

```text
User Profile
-> Professional Profile
-> Badge / Certification
-> Organization Membership
-> Work Context
```

`Professional Profile` 不是新账号，也不是强认证后的结果。用户可以先激活它，之后在发布服务、接 Lead、安装客户项目、代表 Aqara Space / 服务商组织、收款结算等关键动作前逐步补齐资质。

### 身份是叠加的资格，不是互斥角色

- 一个人可以同时是 Customer + Professional + ACB（多个子角色叠加）
- 身份叠加不影响 Customer 身份（ACB 的自己家永远走 Customer 视图）
- **Professional 自助开通**，无门槛；**ACB 必须经 Aqara Academy 认证 + Badge + 资质审查**
- 子角色叠加不需要重新认证，仅在已认证 ACB 内部细化定位

### Aqara Space / 服务商组织进入原则

现有 Aqara Space 门店或服务商组织不是以共享“门店账号”进入 Builder。入口必须是：

```text
负责人个人 Aqara 账号
-> Professional Profile
-> Claim / Register Organization
-> Aqara 验证组织
-> Organization Owner / Admin
-> 邀请员工个人账号加入
```

员工也用自己的个人 Aqara 账号进入，通过组织成员关系获得代表组织工作的权限。个人 Badge、作品和评分跟人走；项目商业责任、Lead 池、团队账本和服务计划可以归组织 Work Context。

### 区域伙伴 / 国家代理是独立的商业关系，不是身份级别

- **区域伙伴（Affiliated）/ 国家代理（Country Operator）** 与 Aqara 之间是商业合同关系，不是 Customer / Professional / ACB 同一维度
- 在身份系统里**正交存在**：一个区域伙伴主体可以同时拥有 Customer / Professional / ACB 多重身份用于自家事务
- 详细组织模型见 [`./service-billing-model.md`](./service-billing-model.md) 第十节

### 三层组织模型（ACB / Aqara Space / 国家代理）

ACB 个人**身份归 Aqara 总部所有（全球唯一）**，但在组织上挂靠到 **Aqara Space 门店**（全球统一品牌）。海外门店之上还有 **国家代理 / Operator-Store** 作为运营治理叠加层；国内由总部直管，不存在此层。

```
Aqara 总部（身份所有权 / 认证 / 等级 / 派单 / 价格底盘）
   │
   │  国内：总部直管
   │  海外：委托国家代理 / Operator-Store（运营治理叠加，可被替换）
   │
   ▼
Aqara Space 门店（全球统一品牌，总部独家审批准入）
   │
   │  ACB ↔ 门店 双向挂靠（全球统一规则）
   │
   ▼
ACB 个人（身份归总部）
```

**关键约束**：
- ACB 身份**永远归总部**，不属于挂靠门店，也不属于海外国家代理
- 代理被替换 / 门店被替换 → ACB 身份不变（学 Apple 切换 Country Distributor 时 AASP 无感）
- 详细挂靠规则、Operator-Store 过渡模式见 [`./service-billing-model.md`](./service-billing-model.md) 第九 / 十节

### 对比：为什么不走业务账号分离

| 方案 | 评估 |
|---|---|
| 单账号 + 多身份（采用）| Aqara 账号已全球化存在；不切存量；跟 Linear / Notion / Figma 一致 |
| 业务账号分离 | ACB 自己家需要切账号登录；重复注册；切存量；不符合现代 SaaS 实践 |

---

## 三、入口分流

### 四个主要入口

| 入口 | URL / 形态 | 激活的身份 | 看到的 Space |
|---|---|---|---|
| **Aqara Life App** | iOS / Android App | Customer | 自己 Owner / Admin / Member / Guest 的家庭 Spaces |
| **Builder 个人侧** | `builder.aqara.com` | Customer | 同上 + 社区 / Showcase / 应用到 Studio |
| **Builder 专业控制台** | `builder.aqara.com/pro` （或独立域名）| Professional / ACB | Professional：极客自助 Compose / 模板编辑；ACB：同 + **Service Provider 关系托管的客户 Spaces**（与个人 Space 物理隔离） |
| **Studio 本地 Web** | `http://<studio-ip>/` | Customer | 当前 Studio 所属 Space |

### 入口决定上下文

- 用户访问哪个入口，就激活对应身份
- 不需要显式"切换身份"（大部分场景），进入哪里就是哪里
- 只有**同账号兼具个人 + 专业身份**时才暴露"身份切换器"

### 入口准入分级

- **纯 Customer 账号**：`builder.aqara.com/pro` 返回 404 或引导（可一键自助进阶到 Professional）
- **Professional 身份**（自助开通）：可访问专业工作台，但**接单权 / 采购权 / 分润权 锁定**（灰显，引导走 Aqara Academy 认证）
- **ACB 身份**（Academy + Badge 认证后）：解锁全部专业能力（接单 / 采购 / 分润 / 等级返利 / 钱包提现）
- 身份回收机制（资格过期 / 违规 / 主动退出）对应权限收回

---

## 四、Space 在各入口的展示（与 Identity Model 衔接）

### Aqara Life App（Customer 身份）

> **Space 为主上下文容器** —— 进入 Space 才拉该 Space 的数据。

- 启动 App → 拉 Space 列表（轻元数据）→ 进默认 Space
- 单 Space 用户**完全看不到 Space 概念**
- 多 Space 用户顶部 chip 切换
- 详见 [`../01-product/aqara-life-app.md`](../01-product/aqara-life-app.md) "Aqara Life 端的 Space 交互"

### Builder 个人侧（Customer 身份）

> **Space 分组展示** —— 多 Space 同屏分组，不强制切换。

```
┌─────────────────────────────────────────────────┐
│  Studios                                        │
│                                                 │
│  🏠 我的家 · 🇨🇳 中国数据中心                      │
│  ┌──────────┐  ┌──────────┐                    │
│  │ Studio 主 │  │ Studio 副 │                   │
│  └──────────┘  └──────────┘                    │
│                                                 │
│  🏠 洛杉矶的家 · 🇺🇸 美国数据中心                   │
│  ┌──────────┐                                  │
│  │ Studio 主 │                                  │
│  └──────────┘                                  │
└─────────────────────────────────────────────────┘
```

- **只显示 Customer 身份下的 Spaces**（自己 Owner / Admin / Member / Guest 的家庭 Spaces）
- **不显示 Service Provider 关系托管的客户 Spaces**（那些在专业控制台看）
- 后端并行拉各数据中心，前端按 Space 分组
- 单 Space 用户 Section 标题弱化或隐藏

### Builder 专业控制台（Professional / ACB 身份）

> **按客户聚合的 Studios / Clients 视图** —— Service Provider 身份下的全部托管 Spaces。

- 与个人侧物理隔离，URL / 界面 / 数据分离
- 按客户聚合而非按 Space 分组（ACB 视角以"我服务的客户"为中心）
- 同时看到 Persona 模板库 / Plugin 开发 / Lead 派单 / Earnings / Academy 等 ACB 专属模块

### Studio 本地 Web（Customer 身份）

- 显示当前 Studio 所属的 Space（截图示例：`Spacelab` Workspace 字段，将改名为 Space）
- 本地界面只关心单 Studio 单 Space，不做聚合视图

---

## 五、ACB 自己家的边界

**关键约束**：ACB 也是普通用户，他自己家也可能有 Studio。这种情况：

- **自己家的 Studio** → 个人 Builder / Aqara Life（Customer 身份）
- **服务的 50 个客户家的 Studio** → 专业控制台（ACB 身份）
- **不允许循环**：ACB 不能"把自己当客户托管自己"（即不能对自己建立 Service Provider 关系）

> 这与 GitHub 个人仓库 vs 组织仓库的逻辑一致：你可以同时拥有，但视图分离。

---

## 六、顶部身份切换器（仅多身份用户）

### 适用条件

- 同账号同时拥有 Customer + Professional 身份时出现
- 单 Customer 身份用户**完全不显示**（99% 普通家庭用户）

### 切换器形态

```
[👤 个人] [💼 专业]   ← 顶部右上角 chip，点击切换视图
```

- 切换是"视图切换"，不是账号切换（同一账号）
- URL 会跟着变（`/home` vs `/pro`）
- 浏览器刷新保持当前视图
- 可在设置里指定"默认进入哪个视图"

---

## 七、Service Provider 不是 Admin 的子集

### 家庭成员 vs 专业服务的两类关系

```
Space 内的关系
├── 家庭成员（信任关系）
│   ├── Owner        ← 业主（1+ 人）
│   ├── Admin        ← 家庭共管（配偶等）
│   ├── Member       ← Persona 授权（老人 / 孩子）
│   └── Guest        ← 临时 + 时间窗（客人 / 保姆）
└── 专业服务（合同关系）
    ├── Service Provider (ACB)  ← 长期托管 + 服务关系生命周期
    └── Temporary Service       ← 一次性时间窗诊断
```

### UI 单独"专业服务"区显示

- Space 成员列表中，家庭成员与专业服务**物理分区**
- 标识清晰：家庭成员是"X 是你的家人"，专业服务是"X 是你的服务商"
- 权限边界：Service Provider 不能转让 Space / 不能改 Owner / 不能注销，所有操作走审计

### 服务关系生命周期

Service Provider 关系**有起止、可续约、可终止**：

- **续约形态**：季度 / 年度续约（与订阅商业模式一致），到期自动续 + 一键终止
- **终止流程**：48h 通知期 → 自动失效 → 操作历史留档 → 客户保留 Persona 配置（ACB 不得带走客户配置）
- **双向发起**：客户在 Aqara Life "解除托管"；ACB 在专业控制台 "结束服务"
- **两类并存**：长期 Service Provider（合同关系）+ 一次性 Temporary Service（时间窗 + 到期自动失效，用于一次性诊断）

> 上述规则为本文首次引入，待 [`../02-roles/role-model.md`](../02-roles/role-model.md) 在后续批次补"服务关系生命周期"章节后以 role-model.md 为准。
>
> **ACB ↔ Aqara Space 门店挂靠关系**（双向解绑、互相举报、门店分成 5-10% 等）的详细规则见 [`./service-billing-model.md`](./service-billing-model.md) 第九节。挂靠规则**全球统一**，海外多一层国家代理 / Operator-Store 不改变挂靠关系本身。

---

## 八、落地原则

1. **身份与入口绑定**：进入哪个入口就激活哪个身份，不做多余切换。
2. **Builder 个人侧永不显示托管客户 Spaces**：这是隐私边界，也是 ACB 自身界面清晰的保证。
3. **专业入口分级准入**：`/pro` 对纯 Customer 不可访问；Professional 自助进入（接单 / 采购 / 分润 灰显）；ACB 全开通。
4. **Service Provider 是独立关系类型**：UI / 权限 / 审计都与家庭成员隔离。
5. **ACB 自己家走 Customer 视图**：禁止对自己建立 Service Provider 关系。
6. **跨身份数据不混淆**：`data-model.md` 中 Studio 的 `deployed_by` / `serviced_by` 字段与 Space 的 `members` / `service_providers` 字段严格分离。
7. **进阶链路差异化**：Professional 自助开通无门槛；ACB 必须经 Aqara Academy 认证 + Badge + 资质审查；身份回收走明确机制。
8. **Installer / Designer / Developer / Service 是 ACB 子角色，不是平行身份**：共享 ACB 等级 / 钱包 / 治理体系，可同时叠加多个子角色。
9. **ACB 身份归 Aqara 总部所有（全球唯一）**：不属于挂靠的 Aqara Space 门店，也不属于海外国家代理。代理 / 门店替换不影响 ACB 身份（学 Apple AASP）。
10. **海外多一层运营治理（国家代理 / Operator-Store）但不改变身份模型**：详细组织规则与 Operator-Store 过渡模式见 [`./service-billing-model.md`](./service-billing-model.md) 第十节。
