# Builder: Two-sided Platform

> Aqara Builder（平台）是 **双面平台**，不只是 Pro 工具。
> 对标 **Houzz + Houzz Pro** 模型 + **Tesla Service Network** 直管能力 + **Studio** 本地操作系统三者合体。
> Professional Profile、组织进入和 Service Plan 架构见 [`../03-architecture/professional-network-architecture.md`](../03-architecture/professional-network-architecture.md)。
> Builder 前台的最新产品定位、导航和 Professional 入口以 [`builder-front-and-professional-entry-spec.md`](./builder-front-and-professional-entry-spec.md) 为准。

---

## 双面结构

```
                       ┌──────────────────────────────────────────┐
                       │     Aqara Builder (one platform)          │
                       └──────────────────────────────────────────┘
                          │                                      │
              ┌───────────▼───────────┐    ┌─────────────────────▼────┐
              │  Community 前台（C+ACB）│    │   Builder Console 后台   │
              │  builder.aqara.com    │    │   builder.aqara.com/pro  │
              └───────────────────────┘    └──────────────────────────┘
                          │                                      │
                          └────────────────┬─────────────────────┘
                                           ▼
                       ┌──────────────────────────────────────────┐
                       │  共享底层：                                │
                       │  Identity / Ontology / Plugin / Content   │
                       │  Spatial AI / Studio Cloud / Insurance    │
                       └──────────────────────────────────────────┘
                                           ▲
                                           │ secure remote
                       ┌──────────────────────────────────────────┐
                       │  Aqara Studio Instances（客户家本地）      │
                       └──────────────────────────────────────────┘
```

---

## 1) Community 社区前台（C 端 + ACB 引流）

**顶层导航**：Discover（灵感）/ Showcases（案例）/ Builders（找认证 Builder）/ Marketplace（插件 + 服务包）/ Learn / My

**核心机制**：
> 用户浏览灵感 → 加入 Ideabook → AI 协助"落地到我家" → 联系 Certified Builder

**与 Houzz 差异化**：
- 每张图都是 **可消费的空间智能配方**，带空间图谱徽章、设备/插件/Persona 信息
- Builder Profile 含空间智能特化模块：`Personas Designed` / `Spatial Ontology Coverage` / `Plugins Authored` / `Studios Deployed`
- **Aqara Certified** 徽章是平台公信力的核心体现

详见 [`community-spec.md`](./community-spec.md)。

---

## 2) Builder Console 后台（ACB 工作台 + 商业化）

**顶层导航**：Projects / Leads / Financials / Company

> Builder Pro 一级导航必须遵守 [`builder-pro-menu-closed-loop-review.md`](./builder-pro-menu-closed-loop-review.md) 的四域契约。Studios、Workshop、Remote Service、Service Plans、Marketplace、Earnings、Profile、Showcase Composer、Learn 等能力不再作为默认一级菜单暴露，而是进入 Projects、Leads、Financials、Company 或全局工具入口。

其中 **Workshop** 包含三大创作能力：
- **Space Editor**（空间图谱编辑）
- **Persona Composer**（千人千面布局组装）
- **Plugin Builder**（插件开发）

边界：

- Life Dashboard / Persona Composer 是客户日常体验层的生成和调优能力。
- Remote Service 是 Builder Pro 授权后诊断、调优和服务报告的专业界面。
- Service Plans 是持续服务的商业对象，可来自项目报价、客户请求或 Marketplace 服务包。
- Marketplace 是 Capability Marketplace，不只有插件，也包含模板、服务包、Agent、Connector 和 Solution Pack。获取后先形成 Workspace Entitlement，再进入 Assets 和 Assignment；服务包可进一步实例化为客户名下的 Service Plan。
- Marketplace / Assets 详细契约见 [`marketplace-assets-architecture.md`](./marketplace-assets-architecture.md)。

**Studio 能力** 是项目交付的核心能力，但默认不作为 Builder Pro 一级菜单。它应主要出现在 Project 内，包含：
- 我已部署 / 协作的 Studio 列表
- 健康监控 + 远程操作 + 一键同步
- 跨 Studio 模板复用

**Dashboard 设计哲学**：
> 每个数字都对应可执行动作 + AI 实时建议下一步。

详见 [`builder-console-spec.md`](./builder-console-spec.md)。

---

## 3) 共享底层

| 组件 | 职责 |
|---|---|
| **Identity** | 账号、Badge、Affiliation、Builder 信用档案 |
| **Ontology Graph** | 空间本体 / 节点边关系 / 推理 |
| **Plugin Registry** | 插件注册、版本、签名、分发 |
| **Service Package Registry** | 服务包上架、区域、SLA、Credits 定价、Provider 可用性 |
| **Content Repo** | Showcase / Ideabook / 评论 / 评分 |
| **Spatial AI Models** | 视觉 / 推荐 / 起草 / 跨语言 |
| **Studio Cloud** | Studio 健康监控 / 远程协议 / 飞轮训练数据 |
| **Insurance Pool** | 全球责任保险池（M5 起） |

详见 [`../03-architecture/system-overview.md`](../03-architecture/system-overview.md)。

---

## 关键设计原则

1. **同一账号体系，角色可切换** — Builder 也是普通用户，保证内容真实性。
2. **Community 不是 Builder 工具的副产品，是 Builder 的获客引擎** — Houzz.com 流量是 Houzz Pro 商业化命脉。
3. **三方协同** — 用户 / Builder / Aqara 在同一平台不同视角。
4. **不做"AI 唯一入口"** — 那是 ChatGPT 形态，不适合工具/社区产品。详见 [`../03-architecture/ai-system.md`](../03-architecture/ai-system.md)。
5. **所有 Builder 工作流终点必须落到一台 Studio 实例** — 详见 [`studio-and-builder.md`](./studio-and-builder.md)。
6. **平台直管 Builder（人）** — Aqara Certified Builder 个人是平台直接关系对象，区域伙伴只是 Affiliation 选项。详见 [`../00-vision/global-network-model.md`](../00-vision/global-network-model.md)。

---

## 会员 / 权限模型分层

| 层级 | 权限 |
|---|---|
| Anonymous | 浏览公共 Showcase / Ideabook 只读 |
| Registered User | Ideabook、关注、联系 Builder、订阅 Aqara AI |
| Aqara Life User | + 设备绑定、千人千面、订阅同步 |
| Builder (Free) | + 基础 Profile、有限 Workshop、有限内容发布 |
| Builder (Subscriber) | + 完整 Workshop、AI 配额、Lead 优先派单 |
| **Aqara Certified Builder（ACB）** | + Aqara Certified 徽章、全部 Studio 远程权限、保险覆盖、排名加成、官方推荐 |
| Plugin Developer | + Plugin Builder、Marketplace 上架 |
| Regional Partner Admin | 区域运营伙伴后台（不可培训，只可招募协助） |
| Aqara Internal | 平台运营 / Academy 讲师 / 内容编辑 |

> **重要**：只有 ACB（Aqara Certified Builder）才被允许在客户家部署 Studio + 触发分佣。"Builder Subscriber"等较低层级是订阅工具但未必是认证的人。

---

## Workshop 定价倾向

- **基础免费**（Space Editor 基础功能 / Persona Composer 体验）
- **Builder 订阅解锁高级**（批量、AI 起草、模板库）
- **活跃 ACB 自然免费** — 项目流水绑定，做到一定流水自动免订阅

---

## 为什么这样

> Houzz 真正的护城河不是 Pro 工具，是 **"专业内容驱动需求 → 需求反哺专业人士"** 的飞轮。
> Tesla 真正的护城河不是车，是 **"全球直管 Service Network"**。
> Aqara Builder 把这两者合体，再加上 **Studio 的本地数据 + 终身关系**——三层护城河叠加。

Aqara 比 Houzz 多了 **订阅分佣 + 插件分佣 + 区域分成**，比 Tesla 多了 **内容飞轮**，沉淀了 100 个项目的 ACB 几乎不可能离开。

---

## 落地原则

1. 任何 Builder 平台功能都要问 **"前台还是后台？还是两边都要？还是涉及 Studio？"**
2. Builder Pro 的高频入口是 Projects / Leads / Financials / Company；Workshop、Studio、Remote Service 等深能力必须在正确业务域内打磨极致。
3. Showcase Composer 的 AI 自动起草是飞轮起来的关键（4 小时 → 15 分钟）。详见 [`content-flywheel.md`](./content-flywheel.md)。
4. **全球社区单一站点 + 智能本地化**（不分语言版本，但 Builder 推荐区域化）。
5. 所有 ACB 在 Profile / Showcase / Lead / Pulgin 中露出 **Aqara Certified** 徽章。
