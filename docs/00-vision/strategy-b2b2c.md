# Strategy: B2B2C via Aqara Certified Builders

> Aqara AI 不直接交付给终端用户，而是经由 **Aqara Certified Builders（ACB）** 完成空间智能配置（部署 Studio + 组装 Persona），再以订阅形态服务用户。
> 这是 Aqara 与 Apple Home / Google Home / Matter 生态的根本差异——**Builder Network 是不可复制的护城河**。

---

## 核心模型

```
Aqara（平台 + 标准 + AI 引擎 + Studio + 全球网络）
   │
   ├── Aqara Academy → 培训 + 认证 ACB，颁发 Badge
   │
   ├── Aqara Builder（平台）→ ACB 工作台（设计、交付、内容、变现）
   │
   ├── Aqara Studio → 部署在客户家的本地空间智能操作系统
   │
   ▼
Aqara Certified Builders（ACB，由 Badge 组合表达身份）
   │
   ├── 现场勘测 + 部署 Studio + 空间图谱设计 + Persona 组装 + 持续优化
   │
   ▼
End User（用 Aqara Life App + 订阅 Aqara AI）
   │
   └── 订阅分佣 → ACB / 区域伙伴 / Aqara
```

> **关键**：Builder 是 **平台直管对象**（不是区域伙伴雇员），全球流动；详见 [`global-network-model.md`](./global-network-model.md)。

---

## 为什么是 B2B2C 而非 B2C

| 维度 | C 端直接配置 | ACB 交付（本策略） |
|---|---|---|
| 空间图谱设计 | Ontology / 拓扑 / 节点边关系，用户不可能也不愿意自己做 | Builder 现场专业完成 |
| Studio 部署与调试 | 复杂电气 / 网络 / 多协议混合 | Builder 一次到位 |
| 多设备协同 | 厂商众多、Matter 实际兼容性参差 | Builder 现场调通 |
| 长期收入 | 一次性硬件 | **订阅持续分佣 + 插件分佣 + Studio 复访升级** |
| 差异化 | 与 Apple Home / Google Home / Matter 同质 | **Builder 网络 + Studio 是不可复制的护城河** |

终端用户得到的是"专业配置好的空间体验"，**不需要理解本体 / 拓扑 / Agent / Studio 这些概念**。

---

## 三个角色与收入

| 角色 | 主要价值 | 收入形态 |
|---|---|---|
| **Aqara** | 平台、标准、AI 引擎、培训认证、Builder 网络运营、保险池 | 订阅抽成、设备销售、企业服务 |
| **区域运营伙伴** | 体验中心 / 前置仓 / 区域招募 / 物流 / 区域被动分成 | 区域订阅分成、挂靠抽成、前置仓发货分成、Studio 部署激励 |
| **ACB（Builder 个人）** | 设计 + 部署 Studio + 交付 + 售后 + 内容 | 项目费、订阅分佣、插件分佣、Lead 转化、Studio 持续维护费 |
| **End User** | 订阅、推荐、内容 UGC | — |

**关键**：
- 区域伙伴**不培训** Builder，培训权全部在 Aqara Academy
- 区域伙伴**不"拥有"** Builder，Builder 是平台直管
- 详见 [`../02-roles/role-model.md`](../02-roles/role-model.md) 和 [`global-network-model.md`](./global-network-model.md)

---

## 在产品上的体现

- "空间编辑器"和"空间智能 Playground"主要面向 **Builder 工作流**（效率 / 批量 / 模板 / 图纸导入），**不把这些复杂概念暴露给 C 端**。
- C 端用户侧只做轻量的增量维护界面（加设备、改名等），或完全由 Agent 自动处理。
- 任何"谁建的图谱 → 后续订阅算谁的"的归属逻辑，要在数据模型里支持（**Studio 实例 ↔ deployed_by Builder ↔ Affiliation 快照**）。
- 与终端用户体验/转化相关的讨论，要分清是 **Builder 工作流** 还是 **用户工作流**。
- 所有 Builder 工作流终点必须落到 **一台具体的 Studio 实例** —— 详见 [`../01-product/studio-and-builder.md`](../01-product/studio-and-builder.md)。

---

## 与 Houzz Pro / Tesla Service / Crestron 的对照

| 维度 | Houzz Pro | Tesla Service | Crestron Certified | **Aqara Builder** |
|---|---|---|---|---|
| Pro 工具 | ✅ | — | 弱 | ✅ |
| 内容飞轮 | ✅ | — | ❌ | ✅ |
| 线下履约 | ❌ | ✅ | ✅ | ✅ Builder Network + Studio |
| 平台直管 | 弱（Pro 是用户） | ✅ Tesla 雇员 | ❌ 经销商体系 | ✅ ACB 直管 |
| 订阅持续收入 | ❌ | 部分（FSD/超充） | ❌ | ✅ Aqara AI 订阅 + 插件分佣 |
| 全球标准化认证 | 弱 | ✅ | 部分 | ✅ Aqara Academy |
| **本地数据 / 长期关系（Studio）** | ❌ | ✅（车数据） | ❌ | ✅ Studio 是终身资产 |

> Aqara 是这套组合在**空间智能**领域的首次实现。详见 [`global-network-model.md`](./global-network-model.md)。

详细产品规格见 [`../01-product/builder-two-sided.md`](../01-product/builder-two-sided.md) 与 [`../01-product/content-flywheel.md`](../01-product/content-flywheel.md)。
