# Aqara Builder

> 面向空间智能时代的双面平台 + 全球直管的认证 Builder 网络。
> 对标 Houzz Pro + Tesla Service + Sonos Certified Installer，叠加 Spatial IQ AI 与 Aqara Studio 本地操作系统。

---

## 这个仓库是什么

这是 **Aqara Builder Website** 项目的总仓库，包含：

- 📐 **产品规划文档**（`docs/`）— 战略、产品规格、角色模型、技术架构、路线图
- 🌐 **前端**（后续追加，规划在 `apps/web-*/`）— Community 前台 + Builder Console 后台
- 🛠 **后端**（后续追加，规划在 `apps/api/`）— Identity / Project / Ontology / Plugin / Content / AI / Studio Cloud
- 📦 **共享包**（后续追加，规划在 `packages/`）— UI、类型、SDK

当前阶段以 **文档驱动设计** 为主，前后端代码会在规划稳定后逐步落地。

---

## 文档导航

| 分类 | 内容 |
|---|---|
| [00-vision](docs/00-vision/) | 品牌架构 / B2B2C 战略 / **全球 Builder 网络模型** / 中国过渡期 |
| [01-product](docs/01-product/) | Builder 双面平台 / **Studio + Builder 协同** / Community / Builder Console / Aqara Life / 内容飞轮 |
| [02-roles](docs/02-roles/) | 角色模型（ACB Badge 体系）/ Aqara Academy 课程 |
| [03-architecture](docs/03-architecture/) | 系统总览 / 数据模型 / Spatial IQ AI 架构 / API 契约 |
| [04-roadmap](docs/04-roadmap/) | 里程碑与依赖（含阿联酋灯塔市场） |

新人入门顺序：
1. `00-vision/brand-architecture` → 命名对齐
2. `00-vision/global-network-model` → **核心战略**（必读）
3. `01-product/studio-and-builder` → Studio 与平台协同
4. `01-product/builder-two-sided` → 双面平台
5. `02-roles/role-model` → ACB 身份模型
6. `03-architecture/system-overview` → 技术架构

---

## 核心概念速查

| 概念 | 含义 |
|---|---|
| **Aqara AI**（公司 / 战略层品牌） | C 端产品名 |
| **Aqara Builder**（产品层 — 双面平台） | `builder.aqara.com` |
| **Aqara Certified Builder（ACB / Builder）** | 经 Aqara Academy 认证的专业人士**个人**，平台直管 |
| **Aqara Studio** | 部署在客户场所的本地空间智能操作系统（路由器形态） |
| **Aqara Academy** | 培训 + 认证 + Badge 颁发机构 |
| **Spatial IQ Engine** | AI 底层引擎（开发者品牌） |
| **Builder Copilot** | Builder Console 内嵌 AI 助手 |
| **Ontology Graph / Persona / Plugin** | 空间智能三大基础对象 |
| **City Lead** | 海外重点城市的 Aqara 雇员/合伙人 |
| **区域运营伙伴** | 中国服务商转型形态 + 海外 Master Franchise |

详见 [`docs/00-vision/brand-architecture.md`](docs/00-vision/brand-architecture.md)。

---

## 战略关键词

> **平台直管 Builder Network · Studio 驱动交付 · 内容飞轮 · 长期主义全球化**

不走"分销商/门店"模式，也不简单复制"滴滴/美团骑手"模式。
对标：**Tesla Service + Sonos Certified Installer + Houzz Pro** 三者合体在空间智能领域的首次实现。

详见 [`docs/00-vision/global-network-model.md`](docs/00-vision/global-network-model.md)。

---

## 仓库结构（规划）

```
aqara-builder-by-claude/
├── docs/                      # 产品与技术规划文档（当前阶段）
│   ├── 00-vision/
│   ├── 01-product/
│   ├── 02-roles/
│   ├── 03-architecture/
│   └── 04-roadmap/
├── apps/                      # 应用代码（后续）
│   ├── web-community/         # Next.js — Community 前台
│   ├── web-console/           # Next.js — Builder Console 后台
│   └── api/                   # 后端 (monolith first → split)
├── packages/                  # 共享包（后续）
└── README.md
```

---

## 贡献

文档为**单一事实来源（Single Source of Truth）**。任何与文档冲突的代码或设计都以文档为准；如发现冲突，先更新文档再改代码。

---

## License

MIT — 见 [LICENSE](LICENSE)。
