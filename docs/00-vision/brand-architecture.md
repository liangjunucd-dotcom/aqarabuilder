# Brand Architecture

> Aqara 完整品牌架构与命名分层。任何产品/UI/营销文案前都先来这里对齐命名。

---

## 四层品牌


| 层级          | 名称                               | 域名 / 载体                                 | 用途                                |
| ----------- | -------------------------------- | --------------------------------------- | --------------------------------- |
| 公司          | **Aqara**                        | `aqara.com`                             | 公司主站                              |
| 战略叙事        | **Spatial Intelligence / 空间智能**  | （非产品名）                                  | 对外讲故事、技术叙事                        |
| C 端产品       | **Aqara AI**                     | `ai.aqara.com`                          | 用户的 AI 体验 / 营销主页 / 订阅入口           |
| ACB 平台      | **Aqara Builder**                | `builder.aqara.com`                     | 双面平台（Community + Builder Console） |
| 用户 App      | **Aqara Life**                   | App 名                                   | 插件化 App、千人千面                      |
| 本地空间智能 OS   | **Aqara Studio**                 | 设备本地（局域网 + 云远程）                         | 部署在客户场所，是 Builder 工作流的交付单位        |
| 认证专业人士      | **Aqara Certified Builder（ACB）** | —                                       | Aqara Academy 颁发 Badge 的个人        |
| Pro 内 AI 助手 | **Builder Copilot**              | Aqara Builder 内嵌                        | Builder 干活时的 AI 协作者               |
| 底层引擎        | **Spatial IQ Engine**            | 技术文档                                    | 开发者文档、技术品牌                        |
| 开发者文档       | （待定）                             | `developer.aqara.com` 或 `dev.aqara.com` | SDK 文档                            |
| 培训机构        | **Aqara Academy**                | `academy.aqara.com`（或 Builder 内嵌）       | 培训 + 认证 + Badge 颁发                |


---

## 命名规则（必须遵守）

### 1. Aqara Builder（平台） vs Aqara Certified Builder（人）

> 这两个**必须区分清楚**。

- **Aqara Builder** = 平台名，特指 `builder.aqara.com`，永远大写两词
- **Aqara Certified Builder（ACB / Builder）** = 经认证的专业人士个人
- 上下文歧义时优先用 **ACB** 缩写或 **Certified Builder** 全称表达"人"

正例：

- ✅ "登录 Aqara Builder 平台"
- ✅ "派单给本区域的 Certified Builder"
- ✅ "Builder（指 ACB）远程连接客户 Studio"

反例：

- ❌ "Builder 平台分配给 Builder"（混淆）

### 2. Builder Console 里的 AI 助手必须叫 Builder Copilot，不要叫 Aqara AI

- ACB 视角下，**Aqara AI 是他要交付的产品**，**Builder Copilot 是他自己的工作伙伴**——两个概念不能混
- ❌ "Aqara AI 帮你写报价单" — 奇怪
- ✅ "Builder Copilot 帮你写报价单" — 自然

### 3. Aqara AI ≠ Aqara Life 里所有 AI 功能

- **Aqara AI 品牌覆盖**：跨场景、跨设备、需要订阅的高阶能力（家庭 Agent、主动服务、智能推荐）
- **不属于 Aqara AI**：单设备 AI（摄像头人脸识别、传感器算法）——这些是设备能力
- **类比**：Face ID 是 iPhone 能力，不是 Apple Intelligence

### 4. 对外文案锚定 Aqara AI 是产品，不是部门

- ❌ "Aqara AI is researching..."（像研究部门）
- ✅ "Aqara AI helps your home understand you"（是产品）

### 5. 战略叙事用 Spatial Intelligence，但不作为直接产品名

- ✅ "Aqara is building Spatial Intelligence platform" — 战略
- ✅ "powered by Spatial IQ engine" — 技术
- ❌ 用 Spatial Intelligence 做产品/订阅/SKU 名字

### 6. Aqara Studio 是产品名，不是组件名

- ✅ "Connect to your Aqara Studio"
- ✅ "Aqara Studio integrates …"
- ❌ "the studio component"（小写、组件式说法不推荐对外用）

---

## 对外标准口径（中英文）

- **战略**：Aqara is building the world's leading Spatial Intelligence platform.
- **C 端**：For consumers — Aqara AI: the AI that understands your home and the people in it.
- **Pro**：For professionals — Aqara Builder, with Builder Copilot assisting every step.
- **本地基础设施**：Powered by Aqara Studio at every location.
- **网络**：Delivered by Aqara Certified Builders worldwide.
- **技术**：Under the hood — Spatial IQ engine.

营销物料严格按此模板，不擅自改写战略级表述。

---

## ai.aqara.com 站点结构

首页 / 体验区 / 能力总览 / 千人千面演示 / 找 Certified Builder（→ `builder.aqara.com`）/ 订阅套餐 / 下载 Aqara Life / 用户故事 / 给开发者

---

## 商标策略

- "Aqara" + "AI" / "Builder" 单独都难注册，但 logo 化 + 设计语言可注册
- 早期做视觉化 Aqara AI logo（参考 Apple Intelligence 彩虹环、Galaxy AI 星标）
- "Aqara Certified Builder" 作为认证品牌注册（学 Microsoft Certified Professional / AWS Certified）
- 全球优先：US / EU / CN / JP / SG / UAE

---

## 落地原则

1. 任何文案/UI 命名前，先确认场景：是给用户看（Aqara AI）、给 ACB 看（Builder Copilot）、还是给开发者看（Spatial IQ Engine）。
2. 不要在同一界面把多个 AI 名字混在一起（一致性 > 准确性，对前台尤其如此）。
3. `ai.aqara.com` 不只是营销页，是完整的 C 端 AI 产品入口。
4. **Builder（平台） vs Builder（人）** 必须语境清晰，不清晰时用全称或 ACB。
5. **Studio 是部署单位**，所有"在哪台 Studio 上做了什么"的表达必须用 Studio 这个词。

