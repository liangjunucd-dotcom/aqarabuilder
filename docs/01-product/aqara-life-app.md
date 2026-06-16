# Aqara Life: Base 底座 + Plugin + 千人千面

> 用户端 App **不是 Aqara Home**，而是全新的 **Aqara Life**。
> 它是配套 **Aqara Studio 本地化交付** 的 **Base 底座 App** —— 自身不堆功能，功能由 Studio + Plugin + Persona 填充。
> 核心：四层渐进 + Shell + Plugin + 千人千面，每位家庭成员可看到独立界面；可由 **ACB** 专业交付，也可由用户**自助** Compose。
> 真正运行时载体是客户家中的 **Aqara Studio**，Aqara Life 是 Studio 的远程触达 + 千人千面 UI 层。云端只是**远程代理 + 元数据服务**，永远不取代本地。

---

## 核心特征

| 特征 | 含义 |
|---|---|
| **Base 底座 App** | App 本体只承担账号 / 设备发现 / Space 容器 / Plugin Shell / AI 入口 / 升级引导，**功能不在 App 主体里** |
| **Shell + Plugin 架构** | App 是"壳"，所有功能由插件组成，插件可在 App 端或 Studio 端执行 |
| **四层渐进** | Direct（单品直连）→ Local（本地 Studio）→ Connected（上云）→ Delivered（ACB 托管），每层都是长期可停留终点 |
| **千人千面** | 同一家庭，每位成员可有独立的个人界面 |
| **Persona Composer 双路径** | 极客用户**自助** Compose 自己 Persona；ACB 在专业控制台为客户**专业交付** |
| **本地优先** | 空间能力本地运行；云端是增值服务（远程代理 / 元数据 / 内容飞轮 / 高级 AI），不接管配置和决策 |
| **Studio 为执行底座** | Aqara Life 配置最终下发到客户家 Aqara Studio 本地执行 |

**对标参考**：Notion Blocks 积木化 + 微信小程序生态 + Apple 配置描述文件 + Apple Watch 表盘灵活度。

---

## 四层渐进模型

```
┌─────────────────────────────────────────────────────────────────┐
│ Tier 3 — Delivered    ACB 托管 / Persona 专业交付 / 远程服务      │  增值
│   入口：Aqara Life "找专业 ACB" / Studio 异常时 AI 推荐            │
├─────────────────────────────────────────────────────────────────┤
│ Tier 2 — Connected    Space 上云 + Builder 自管 + 远程代理 + 飞轮  │  增值
│   入口：Aqara Life / Studio 本地"启用云端连接"                    │
├─────────────────────────────────────────────────────────────────┤
│ Tier 1 — Local        Studio + Aqara Life 局域网，本地完整运行    │  默认
│   入口：开箱 → App 局域网发现 Studio → 配对                       │
├─────────────────────────────────────────────────────────────────┤
│ Tier 0 — Direct       Aqara Life + Zigbee Direct 等单品直连，无 Studio │ 入门
│   入口：买单品 → 装 Aqara Life → 直连配对                          │
└─────────────────────────────────────────────────────────────────┘

         ↑ 升级路径都是"价值兑换"，不是"功能开关" ↑
```

### 关键设计原则

- 每一层都是**完整可停留终点**，不是必经过渡
- 一辈子停留 Tier 0/1 也能正常用 —— 本地优先承诺的具体兑现
- **永远本地运行**：Tier 2 上云后云端只做远程代理，不存配置、不做决策
- 升级触发器都是**价值兑换**：想出门远程控、想用社区场景、家里太复杂——用真痛点引导，不是功能开关

### 层级能力边界

| 层级 | 不需要账号 | 设备控制 | 自动化 | Persona 千人千面 | 远程访问 | 内容飞轮 | ACB 服务 |
|---|---|---|---|---|---|---|---|
| Tier 0 Direct | ✅ | ✅ 单品 | 单品级 | — | — | — | — |
| Tier 1 Local | ✅ | ✅ Studio | ✅ 全本地 | 自助 Composer | — | — | — |
| Tier 2 Connected | — | ✅ | ✅ | 自助 / ACB | ✅ | ✅ | — |
| Tier 3 Delivered | — | ✅ | ✅ | ACB 专业 + 自助微调 | ✅ | ✅ | ✅ |

---

## 配置层级（Cascading Configuration）

```
┌─────────────────────────────────────────────────────┐
│ Layer 3 — 用户实时微调                                │  最高优先级
├─────────────────────────────────────────────────────┤
│ Layer 2 — 配置者组装层（ACB 或 用户自己 Compose）      │
├─────────────────────────────────────────────────────┤
│ Layer 1 — Aqara 角色默认值（基于 Persona Role）        │  默认兜底
└─────────────────────────────────────────────────────┘
```

### Persona Composer 双路径

Layer 2 的"配置者"可以是 ACB（专业版 Composer），也可以是用户自己（自助版 Composer），数据结构和优先级一致：

| 维度 | 自助版（极客用户） | 专业版（ACB） |
|---|---|---|
| 入口 | Aqara Life "我的 Persona" / Builder 个人侧 | Builder 专业控制台 ACB Workshop |
| UI | 模板优先、低自由度、强引导 | 全自由度、可保存模板、跨 Space 复用 |
| 推送对象 | 自己 / 自己家庭成员 | 客户 Space 内的全员 |
| 是否计费 | 免费 | 计入 ACB 服务交付，走分佣 |
| 协作 | 单人 | 多 ACB 协作、版本管理 |
| 学习曲线 | 5 分钟上手 | 培训 + Badge 体系 |

**互通**：用户自助配的 Persona，将来请 ACB 接管时 → ACB 在原配置上继续优化（不必从头来）；ACB 交付的 Persona，用户事后 Layer 3 微调或干脆切回自助版自己改 → 都允许。

### 关键策略

- 升级时**保留 Layer 2 配置**
- 用户可"恢复 ACB 配置"（如果由 ACB 交付过）
- ACB 可"重新交付推送新版"（推送目标是 Studio + Aqara Life）
- 三层均可单独审计 / 回滚

---

## Space 容器与跨数据中心

> Space（空间）是 Aqara Life / Builder / Studio 共用的**父级容器**，绑定一个数据中心，承载该家庭的 Studio / Persona / 数据。

### 默认 Space：我的家

- 每个账号默认有一个 Space，**命名为"我的家" / "My Home"**（用户首次登录可改名）
- 默认 Space **开放邀请家人**（不是单人 Personal）
- 单 Space 用户在 Aqara Life 内**完全看不到 Space 概念**，进 App 直接是这个家的主页

### 多 Space 场景（C 端真实需求）

| 场景 | 说明 |
|---|---|
| 跨国家庭（中国家 + 美国家） | 跨数据中心，必须分 Space |
| 多套房产（自家 + 父母家 + 度假屋） | 同区域多 Space，共享数据中心 |
| 大宅 1 Space 多 Studio | 一个 Space 内 Studio 协同（楼层 / 主副楼）|

### 跨数据中心硬约束

跨数据中心 Space 之间：
- **数据隔离**（合规）—— 中国家的设备数据不会出 CN 数据中心
- **自动化不可联动** —— 不能跨 Space 写"中国家空调 → 美国家窗帘"
- **AI 上下文独立** —— 各自数据中心独立推理
- 切换 Space 跨数据中心时**显式过渡 + 加载态**（"正在连接美国数据中心"），不假装很快

详见 [`../03-architecture/data-model.md`](../03-architecture/data-model.md)。

---

## Aqara Life 端的 Space 交互

> **Space 为主上下文容器**：进入 Space 才拉该 Space 的 Studio / 设备 / Persona。这与数据模型一致（每个 Space 绑数据中心）。

### 首屏决策树

```
启动 App → 登录 Aqara 账号 → 拉 Space 列表（轻量元数据）
   ├── 无 Space（全新用户） → 发现层（浏览 Showcase / 找 ACB / 看样板家）
   ├── 1 个 Space        → 直接进 → 完全不见 Space 概念
   └── 多个 Space        → 进默认 Space（顶部 chip 可切换）
```

### 默认 Space 选择优先级（多 Space 时）

1. **基于位置 / Wi-Fi 自动识别**（在洛杉矶家附近 → 提示切到洛杉矶 Space，不强制）
2. **最近一次使用的 Space**
3. **用户打标的主 Space**（设置里可标记）
4. **第一个创建的 Space**（兜底）

### 切换代价

| 切换类型 | 延迟 | UX |
|---|---|---|
| 同数据中心（自家 + 父母家都在 CN）| 瞬时 | 无感 |
| 跨数据中心（CN ↔ US）| 数秒 | 显式加载态："正在连接美国数据中心" |

---

## 角色与家庭模型

| 内置 Persona Role | 默认行为 |
|---|---|
| 主人 | 完整控制权，所有设备 / 自动化 / 数据 |
| 伴侣 | 完整控制权 + 个人偏好 |
| 老人 | 大字体 / 简化操作 / 紧急呼叫 / 健康监测 |
| 儿童 | 内容过滤 / 限时模式 / 教育插件 |
| 客人 | 临时权限 / 限定区域 / 离场自动收回 |
| 保姆 | 工作时间窗 / 家务清单 / 受限设备 |

### 家庭账号模型

- **成年人** 独立账号（家庭成员关系：Owner / Admin / Member / Guest）
- **未成年 / 老人** 子账号挂在主账号下，或独立账号 + 邀请加入
- **客人 / 保姆** 临时账号 + 时间窗
- **ACB（Service Provider）** 不属于家庭成员关系，是合同关系，UI 单独"专业服务"区显示

详见 [`../03-architecture/data-model.md`](../03-architecture/data-model.md) 的 Space 成员模型。

---

## 插件运行时（Plugin Runtime）

### 设计建议

| 类型 | 说明 | 第一版 |
|---|---|---|
| **声明式（JSON Manifest）** | 标准组件库 + 数据绑定 | ✅ |
| **受控 JS 沙箱** | 简单业务逻辑 | 6 月后加 |
| **Native 扩展** | 极少数 | 长期视情况 |

> 第一版只做声明式，确保安全 + 性能 + 审核效率。
> 插件实际执行可发生在 App 端或 **Studio 端**（自动化 / AI 推理类插件优先 Studio 本地执行）。

### 插件清单关键字段

```json
{
  "id": "com.aqara.morning-routine",
  "version": "1.2.0",
  "compatibleRoles": ["主人", "伴侣"],
  "requiredOntology": ["bedroom", "kitchen"],
  "components": [...],
  "permissions": ["devices.read", "automations.write"],
  "runtime": "studio | app | hybrid",
  "author": { "id": "acb-xxx", "type": "ACB" }
}
```

---

## 插件分成穿透到 Builder

> 用户安装的插件，**交付 ACB 持续拿 10–15%**（仅 Tier 3 Delivered 关系下）。

让 ACB 在交付时主动推荐合适插件，**利益对齐**。

| 来源 | 分成对象 |
|---|---|
| 用户在 Aqara Life 内市场购买 | 推荐链路上的 ACB / 插件作者 / Aqara |
| ACB 在 Builder 专业控制台直接给客户配置 | 该 ACB / 插件作者 / Aqara |

---

## 与 Aqara Home 存量的过渡

- **共用账号**，可双登
- **独立 App**，不强制迁移
- **隐性 EOL**：Aqara Home 不再加新功能（不公开宣布 EOL），仅保留安全 / 兼容更新
- **设备转入路径**：Studio 接入旧设备 → 默认本地管理；可选转出到 IoT 平台保持 Aqara Home 兼容（不强迁）
- **迁移驱动力**：本地优先体验本身 + ACB 千人千面交付 —— 让体验差异自然拉动用户

详见 [`../00-vision/china-transition.md`](../00-vision/china-transition.md)。

---

## 落地原则

1. **Aqara Life 是 Base 底座**——任何功能都从"Studio / Plugin / Persona 填充"思路出发，**不要硬编码到 App 主体**。
2. **Space → Studio** 是数据父子关系，所有视图都跟随这个结构（Aqara Life 走"Space 上下文"，Builder 走"Space 分组"）。
3. **本地优先是硬承诺**——能本地完成的不上云；云只做远程代理 / 元数据 / 内容飞轮，不接管配置或决策。
4. **Persona / Role / Member / Family / Space** 是核心数据模型，先定义清楚。详见 [`../03-architecture/data-model.md`](../03-architecture/data-model.md)。
5. 所有"用户体验"功能都要考虑"哪些是 Layer 1 默认、哪些是 Layer 2 配置者（ACB / 自助）组装、哪些是 Layer 3 用户自己微调"。
6. **Persona Composer 必须双路径**：自助版（Aqara Life / Builder 个人侧）+ 专业版（Builder 专业控制台），数据结构互通。
7. **跨数据中心 Space 不可联动**——自动化 / AI 上下文 / 数据 全部隔离，UX 诚实呈现切换代价。
8. **Default Space "我的家" 默认开放邀请**——不要让用户"必须新建 Space 才能加家人"。
9. 插件 SDK 不要急着对外开放，先用全官方插件跑通生态体验闭环。
10. **ACB 个性化交付（Tier 3 Delivered）是叠加层，不是必经路径**——通过价值（专业 / 省心 / 持续优化 / 出问题有人兜底）拉动用户主动选择，绑定分佣条件。详见 [`./studio-and-builder.md`](./studio-and-builder.md)。
