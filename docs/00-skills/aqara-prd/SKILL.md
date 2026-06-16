---
name: aqara-prd
description: Use this skill when writing or updating Aqara-style PRDs for Builder, Builder Pro, Aqara Life, Studio, Marketplace, service plans, onboarding, or related product flows. It formats product requirements in Jun's preferred structure with background, positioning, principles, functional requirements, data model, non-functional requirements, metrics, boundaries, and open questions.
---

# Aqara PRD

## Output Style

Write in Chinese by default. Use a clear PRD structure, not an engineering spec. Prefer product intent, interaction flows, state tables, data entities, and boundary notes.

Use this default outline:

```markdown
# <产品/模块> 产品需求文档

| 版本 | 修订说明 | 修订人 | 修订日期 | 备注 |
| --- | --- | --- | --- | --- |
| v1.0 | 初稿 | Jun | <date> | <scope> |

---

## 一、需求背景
## 二、产品定位
## 三、设计原则
## 四、功能需求
## 五、数据模型
## 六、非功能需求
## 七、埋点与指标
## 八、边界与不展开内容
## 九、待确认问题
```

## Writing Rules

- Start from the product problem and why the module exists.
- Explain the module's positioning, target users, and value to user / professional / Aqara when relevant.
- Use numbered design principles in a table.
- In 功能需求, organize by user-facing page, step, mode, or state.
- For each feature, include 功能概述, 触发条件 or 入口, 页面文案 or 界面构成, 交互流程, 状态 / 校验 / 异常情况 when needed.
- Use tables for options, fields, states, permissions, and data models.
- Add 设计意图 only when it clarifies a meaningful product decision.
- Be explicit about what is not included in the PRD.
- End with 待确认问题 when product or backend decisions remain.

## Aqara Domain Conventions

- Builder Pro is not a separate account. It is the professional identity and workbench on the same Aqara Account.
- Use `Professional Profile` for the activated professional identity; it starts as a draft.
- Use `Work Context` for Personal / Team / Service Org / Aqara Space contexts.
- Aqara Space / service provider organizations are existing service-network entities; Builder Pro should not become store ERP.
- Life Dashboard is the customer daily experience layer; Remote Service Console and Service Plan are Builder Pro service surfaces.
- Marketplace can include plugins and service packages; service packages instantiate service plans or service requests.

## Formatting Preferences

- Use Chinese section numbering: `一、二、三...`
- Use `### 4.1` for feature subsections.
- Keep prose direct and product-oriented.
- Use English product terms where already established: Builder Pro, Professional Profile, Work Context, Service Plan, Marketplace.
- Avoid over-explaining internal implementation unless it affects product behavior.
