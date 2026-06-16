# Spatial IQ AI System

> Builder AI 不是单独模块，是横贯前后台的 **智能层**，并下沉到客户家中的 **Aqara Studio** 边缘节点。
> 统一品牌 + 五层渗透 + 三种 UX 形态 + 云边协同。

---

## 统一品牌

| 视角 | 名称 |
|---|---|
| ACB / 开发者 / 创作者 | **Builder Copilot** |
| C 端用户 | **Spatial IQ**（在 Aqara Life / Community 露出） |
| 底层引擎 | **Spatial IQ Engine**（开发者文档） |
| 客户家边缘 | **Aqara Studio**（运行 Spatial IQ Engine 本地版） |

> **同一底层，前台展示分层。** 详见 [`../00-vision/brand-architecture.md`](../00-vision/brand-architecture.md)。

---

## 五层渗透架构

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 5 — Living AI (Aqara Life + Studio 家庭 Agent)         │
│  → 主动服务、跨设备协调、用户对话；Studio 本地推理优先          │
├──────────────────────────────────────────────────────────────┤
│  Layer 4 — Discovery AI (Community 社区前台)                  │
│  → 视觉搜索 / 对话发现 / ACB 匹配 / Ideabook 增强             │
├──────────────────────────────────────────────────────────────┤
│  Layer 3 — Creator AI (Builder Console Workshop)             │
│  → 拓扑设计 / Persona 推荐 / Plugin 代码 / Content 起草         │
├──────────────────────────────────────────────────────────────┤
│  Layer 2 — Operational AI (Builder Console)                  │
│  → Lead 评分 / Portfolio 优化 / 定价 / 需求预测 / Studio 健康度 │
├──────────────────────────────────────────────────────────────┤
│  Layer 1 — Foundational AI (共享底层 + Studio 边缘小模型)      │
│  → 本体推理 / 视觉理解 / 跨语言 / 推荐排序                       │
└──────────────────────────────────────────────────────────────┘
```

> Layer 5 在 Aqara Life UI + Studio 本地引擎双载体上运行；隐私敏感推理（人脸 / 行为 / 健康）默认在 Studio 本地完成，仅必要元数据回云。

---

## 三种 UX 形态

> **不要把 AI 都塞进聊天框。** 默认 Ambient。

| 形态 | 适用场景 | 例子 |
|---|---|---|
| **Ambient（环境式）** | 嵌在工作区、不打断 | Dashboard 上的 Copilot 建议；Composer 旁的"试试这个" |
| **Invoked（召唤式）** | ⌘K / `/` 唤起 | "/帮我写 Showcase 介绍"；"/给个 80m² 图谱模板" |
| **Agentic（代理式）** | 多步任务、自主执行 | "把项目自动整理成 Showcase 发布" → 全流程草稿 |

### 形态选择决策树

```
是用户明确发起的多步任务？
  ├── 是 → Agentic（需要明确委托确认）
  └── 否
       ├── 是用户主动召唤的单步任务？ → Invoked
       └── 否 → Ambient（被动呈现建议）
```

---

## 专门 AI 入口

### Builder Console: **Spatial IQ Studio**（ACB 端工作流编排）

| Tab | 内容 |
|---|---|
| Ask Anything | 通用对话 + 知识检索 |
| My Workflows | 自定义工作流（招手即用） |
| Agent Marketplace | 公共 Agent 发布与订阅 |
| Studio Ops | 远程诊断 / 批量 OTA 助手（结合客户授权窗） |
| Usage | AI 调用配额 / 用量 |

> ⚠️ 名词消歧：**Spatial IQ Studio** 是 Builder Console 内的 AI 工作流模块，与客户家中的 **Aqara Studio**（硬件 / 本地 OS）是两个不同概念，命名沿用品牌一致性。

### Aqara Life + Studio 边缘: **Spatial IQ for Home**

| 模块 | 内容 |
|---|---|
| 家庭 Agent | 主动服务 + 对话（Studio 本地优先） |
| 推荐 | 设备 / 插件 / Persona 推荐 |
| 洞察 | 家庭使用洞察 / 节能 / 健康（敏感数据 Studio 本地分析） |
| 与 ACB 智能对接 | 一键找原 ACB 优化（带 Studio 健康摘要） |

---

## LLM Gateway 设计

```
业务代码 / Builder Console / Studio Cloud
   │
   ▼
LLM Gateway (薄封装)
   ├── Provider 抽象（Anthropic / 自有 / 本地 / Studio 边缘）
   ├── Prompt Cache 强制开启
   ├── 调用配额 + 计费
   ├── 安全过滤（PII / 敏感）
   ├── Edge / Cloud 路由策略
   ├── Fallback 链
   └── 可观测（trace / 用量 / 错误）
```

**第一版默认主模型**：Claude Sonnet/Opus（按场景选择）。
**Studio 边缘模型**：用于隐私敏感 / 低延迟场景的小模型（视觉、语音、行为模式）。

> 业务代码**永远不直接调** Anthropic SDK，必须经 Gateway。

### 核心约束

1. **Prompt Caching 强制**：任何超过 1k token 的稳定上下文必须缓存。
2. **流式输出**：Builder Console / Aqara Life 内的 AI 交互必须支持流式。
3. **超时与降级**：所有 AI 调用有超时 + 降级路径（不能阻塞主流程）。
4. **边缘优先策略**：能在 Studio 本地完成的推理不上云（隐私 + 延迟 + 离线可用）。
5. **审计**：用户面向场景的输入/输出可审计，但保留时间分级；Studio 本地推理仅记元数据。

---

## 关键能力清单

| 能力 | Layer | 运行位置 | 状态 |
|---|---|---|---|
| Showcase AI 起草 | L3 | 云端 | 必做（content-flywheel 命门） |
| 项目 → Showcase 一键提取 | L3 | 云端（数据来自 Studio） | 必做 |
| Persona 推荐 | L3 | 云端 | 必做 |
| Lead 匹配评分 | L2 | 云端 | 必做 |
| 户型图 OCR + 节点识别 | L1+L3 | 云端 | 必做 |
| ACB Profile 优化建议 | L2 | 云端 | 重要 |
| 对话式落地到我家 | L4 | 云端 | 重要 |
| 视觉搜索 | L4+L1 | 云端 | 重要 |
| 家庭 Agent | L5 | **Studio 本地优先** | 由 Aqara Life + Studio 团队主导 |
| 行为/健康洞察 | L1+L5 | **Studio 本地** | 重要（隐私边界） |
| Studio 健康预测 | L2 | 云端（聚合） | 重要 |
| 跨语言 | L1 | 云端 | 必做（全球社区） |

---

## 落地原则

1. 任何 AI 功能上线前先问"是 Ambient / Invoked / Agentic 哪种形态？" **默认 Ambient**。
2. Showcase Composer 的 AI 起草**必须 ACB 最终审阅**，不能直接发布（保护内容真实性）。
3. AI 调用配额：基础免费、超出按量计费。
4. 设计 AI 推荐时考虑"决策权 vs 执行权"——给建议是默认，自主执行需要明确委托。
5. **跨语言能力是全球社区必备**（Layer 1 基础能力）。
6. 不要做"AI 唯一入口"——那是 ChatGPT 形态，不适合工具+社区产品。
7. **隐私敏感推理默认下沉 Studio 本地**——是 Aqara 区别于纯云 AI 平台的差异化护城河，不是技术细节。
