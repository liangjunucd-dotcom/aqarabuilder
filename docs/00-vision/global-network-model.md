# Global Network Model: Aqara Certified Builder Network

> Aqara 不走"分销商门店"模式，也不简单复制"滴滴/美团骑手"模式。
> 我们建立 **Aqara Certified Builder Network（ACB Network）**——一个**总部直管、全球统一、Studio 驱动**的高技能空间智能交付网络。
> 三层组织：**Aqara 总部 → 国家代理（海外才有）→ Aqara Space 门店 → ACB 个人**。**ACB 身份归总部、关系归门店,挂靠规则全球统一**——代理可换、门店可换,ACB 身份不变（学 Apple AASP）。
> 详细资金流 / 履约 / 挂靠规则见 [`../03-architecture/service-billing-model.md`](../03-architecture/service-billing-model.md);身份模型见 [`../03-architecture/identity-model.md`](../03-architecture/identity-model.md)。

---

## 一、术语对齐（重要）

| 术语 | 含义 |
|---|---|
| **Aqara Builder（平台）** | `builder.aqara.com` — Pro 工作台 + Community 双面平台 |
| **Aqara Certified Builder（ACB / Builder）** | 经 Aqara Academy 认证的**专业人士个人**，是平台直管对象 |
| **ACB 子角色** | Installer / Designer / Developer / Service —— 同一 ACB 可叠加多个 |
| **Aqara Studio** | 部署在客户家/办公空间的**本地空间智能操作系统**（路由器形态），是交付物与服务接入点 |
| **Aqara Space 门店** | **服务商门店全球统一品牌** —— 国内由现有服务商升级品牌而来,海外加盟筹备中。是 ACB 挂靠的物理节点。⚠ 与 Space(家庭空间数据模型,见 [`../03-architecture/data-model.md`](../03-architecture/data-model.md))**字面撞车** — 行文必须永远写完整"Aqara Space",不简写 |
| **国家代理（Country Operator）** | 海外才有的**运营治理叠加层**,代 Aqara 总部在当地行使五事下放(仓储/培训/营销/客服/初审仲裁)。**治理 ≠ 拥有,可被替换** |
| **Operator-Store** | **门店即运营层** —— 无国家代理国的过渡复合身份(米兰首个试点),代理建立后剥离 |
| **City Lead** | 在重点海外城市的 Aqara 雇员或合伙人,Phase 1 灯塔市场起步阶段的**先头部队**(早于 Aqara Space 门店开设);随门店和代理体系成熟逐步过渡 |
| **Master Franchise** | "国家代理"在某些地区的法律 / 商业表达;在 ACB 治理体系中等同于国家代理 |

> **重要**：本仓库所有文档此后均使用 **ACB / Builder（人）** 与 **Aqara Builder（平台）** 区分。
> "服务商" 这一术语在产品 / 平台口径下统一升级为 **Aqara Space 门店**(国内现有服务商品牌平移),开发者文档可保留 "服务商"作为内部说法。

---

## 二、为什么不是"全球版滴滴/美团"

| 维度 | 滴滴 / 美团 | Aqara ACB Network |
|---|---|---|
| 任务性质 | 高频低技能 | 低频高技能 |
| 单笔金额 | 几十块 | 几千 ~ 几万 + 多年订阅 |
| 监管 | 强（牌照/反垄断/出租车保护） | 软件 + 培训定位，不挑战当地牌照 |
| 标准化程度 | 全国统一道路/餐品 | 设备协议跨国通用（Matter / Zigbee），但建筑/电气/语言/文化强本地化 |
| 关系周期 | 单次结束 | **Studio 在客户家活几年到几十年，持续服务** |
| 数据可见度 | GPS + 起终点 | **Studio 实时上报：图谱 / 自动化 / 设备 / 哪个 Builder 部署 / 用户使用 / 故障** |
| 全球化记录 | 滴滴/美团没真正全球化 | 我们没成功先例，但模式不需要碾压式规模 |

> **关键认知**：滴滴必须做大才能盈利（高频低单价），Aqara **每个 Studio 都是终身价值**，不需要"几亿单"才赚钱。一线市场每年发展几千 Builder + 几万 Studio 即可养活全球网络。

---

## 三、真正的对标对象

我们是这四者的合体：

| 对标 | 借鉴的能力 |
|---|---|
| **Tesla Service Network** | 品牌即服务、Service Center 直管、Mobile Service Tech |
| **Sonos / Crestron Certified Installer** | 高端家庭技术、认证经销商、品牌责任链 |
| **Apple Authorized Service Provider** | 品牌定标准 + 本地伙伴执行 |
| **Houzz Pro** | 内容飞轮、Pro 工作台、Lead 派单 |

> Aqara 是这套组合在 **空间智能** 领域的**首次实现**——这是 Aqara 真正的护城河。

---

## 四、四层架构

```
┌──────────────────────────────────────────────────────────────────┐
│  Layer 1 — Aqara 总部（全球统一,单一事实来源）                       │
│  ├ Aqara Academy → 培训 + 认证 + Badge（ACB 直管的入口）             │
│  ├ Aqara Builder → ACB 工作台 + Lead 派单 + 内容飞轮                │
│  ├ Studio Cloud → 每台 Studio 的健康/质量/质保/数据飞轮              │
│  ├ 平台保险池 → 全球统一责任保险（必须自建，是 Phase 1 投入）         │
│  ├ 全球 SLA + 评分体系 + 服务质量算法                                │
│  ├ Aqara Space 门店准入【独家审批权】                                │
│  └ Spatial IQ Engine → 模型 + 推理 + 跨语言                         │
├──────────────────────────────────────────────────────────────────┤
│  Layer 2 — 本地组织（国家代理 + Aqara Space 门店,区域差异化）         │
│  ├ 中国：服务商升级为 Aqara Space 门店,总部直管（无国家代理层）        │
│  ├ 海外有代理国：国家代理（治理叠加,五事下放）+ Aqara Space 门店       │
│  │   现有: 韩国 ✓  迪拜 ✓                                         │
│  ├ 海外无代理国：**Operator-Store（门店即运营层）** 过渡复合身份       │
│  │   首个试点: 意大利米兰                                            │
│  ├ 海外灯塔起步：City Lead 先头部队 → 接续 Aqara Space 门店开业       │
│  └ Layer 2 共通职责：仓储 / 培训本地化 / 营销 / 一级客服 / 仲裁初审    │
│     ⚠ Layer 2 治理 ≠ 拥有 —— 代理 / 门店可被替换,Layer 3 / 4 不动  │
├──────────────────────────────────────────────────────────────────┤
│  Layer 3 — Aqara Certified Builder（总部直管对象）                  │
│  ├ 平台账号 / Badge / Profile / Earnings 都属于个人,归 Aqara 总部     │
│  ├ 挂靠 Aqara Space 门店（双向解绑/互相举报/门店分成 5-10%）          │
│  ├ 一个 Builder 可同时持 Installer + Designer + Developer + Service │
│  ├ 全球流动（Badge 跟人走,代理 / 门店替换不影响身份）                  │
│  └ 详细挂靠 / 分润 / 钱包 / 等级规则见 service-billing-model.md      │
├──────────────────────────────────────────────────────────────────┤
│  Layer 4 — 交付单位（Studio 实例）                                  │
│  ├ 每台 Studio 关联到具体 Builder（可多人协作）                       │
│  ├ 客户与 Aqara 是直接服务关系（即使经 Aqara Space 门店引荐）          │
│  ├ 客户评价的是 Builder + Aqara,不是门店或代理                       │
│  └ Studio 数据上报 → 服务质量度量的客观依据                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 五、Studio 改变了游戏规则

> 这是为什么"全球直管 + 高技能"在 Aqara 是可行的——也是**与所有现有 Installer 网络（Lutron / Crestron / Control4 / Savant）的根本区别**。

| 维度 | 传统 Installer 模式 | Aqara + Studio 模式 |
|---|---|---|
| 服务过程 | 黑盒，靠客户主观评价 | **Studio 实时上报**：哪个 Builder 部署了什么、跑得如何 |
| 服务质量 | 主观星级 | **客观指标**：设备成功率 / 自动化稳定度 / 用户使用时长 / 订阅留存 |
| 服务关系 | 一次性，售后靠运气 | Studio 持续在客户家，**Builder 可被反复召回升级** |
| 技术绑定 | 容易被替换 | 客户家所有空间智能跑在 Studio 上，**迁移成本极高** |
| 数据飞轮 | 无 | 每台 Studio 的本体图谱、Persona、设备组合 → 训练 Spatial IQ |
| 责任追溯 | 模糊 | **Builder ↔ Studio ↔ 项目 ↔ Aqara 平台**，链条清晰 |

> 详见 [`../01-product/studio-and-builder.md`](../01-product/studio-and-builder.md)。

---

## 六、本地组织的真正定位（Aqara Space 门店 + 国家代理）

| 旧模式 | 新模式 |
|---|---|
| 卖货中间商 + 代培训 + 雇用 Installer | **Aqara Space 门店**（国内）/ **国家代理 + Aqara Space 门店**（海外）：前置仓 + 体验中心 + 招募协助 + 物流 + 一级客服 + 仲裁初审 |
| Builder 是雇员 / 是渠道 | Builder 是 Aqara 总部直管, **挂靠**到 Aqara Space 门店（多对多, 双向可解绑/互相举报）|
| 收入：硬件差价 + 项目费 | 收入：门店分成 5-10% + 国家代理三层分润（货款通道 / 项目激活 / 服务抽成小头）+ 物流费 + 招募补贴 + 体验中心运营费 + Studio 部署激励 |
| 中国独有 | **全球可复制**：海外的国家代理 + Aqara Space 门店 / Operator-Store 与国内门店本质同模型 |

> 这一变化解决三个问题同时：
> 1. **服务商存量利益**：他们的收入不消失,只是从"控制 Builder + 卖货差价"变成"经营本地基础设施 + 持续分成"
> 2. **总部直管诉求**：Builder 个人 = 总部直管对象,身份归总部,代理 / 门店替换不影响 Builder
> 3. **全球可复制**：海外没服务商包袱时直接走"国家代理 + Aqara Space 门店",模型不变

### 6.1 国内服务商升级到 Aqara Space 门店 — 4 件事拉动

让现有服务商觉得是"拿到新武器",不是"被收编":

1. **AI 工具赋能** — Builder Copilot / Persona Composer 专业版,服务商有 BD 新武器
2. **Lead 派单流量** — Aqara Life 平台 C 端用户流量倾斜给挂靠 Aqara Space 门店
3. **分润透明化** — ACB 钱包看得见,每单 70-85% 直接结算,不再黑箱
4. **门店分成持续 5-10%** — Aqara Space 门店在所有 ACB 订单中持续拿分成,服务商不被绕过

详细迁移路径见 [`./china-transition.md`](./china-transition.md) 与 [`../03-architecture/service-billing-model.md`](../03-architecture/service-billing-model.md) §13。

### 6.2 海外国家代理 — 五权留中、五事下放

| 留中（Aqara 总部独家） | 下放（国家代理执行） |
|---|---|
| ACB 认证与等级评定 | 仓储与履约 |
| 抽成与返利比例制定 | 培训本地化（Academy 课程交付 + 实操 + 监考） |
| 封号权 / 永久除名 | 营销与本地线索注入 |
| 派单算法 | 一级客服 + 现场支持 |
| 价格底盘 | 仲裁初审（终审在总部） |
| 数据所有权 | |
| **Aqara Space 门店准入审批** | （代理只有推荐 + 反对权） |

> ⚠ **代理治理 ≠ 拥有**:代理被替换时,门店和 ACB 身份均不变(学 Apple 切换 Country Distributor 时 AASP 无感)。

### 6.3 Operator-Store — 无代理国过渡模式

Aqara Space 门店在所属国家**暂无国家代理时**,可临时承担 Layer 2 运营职能:

- 复合身份带过渡期标签(`operator_role: temporary`)
- 能力受限:不能审批新门店(总部独家),不能改 ACB 等级,不能改价格底盘 — 沿用"五权留中"
- 激励:Operator 职能期间额外拿运营管理费 + 退出时一次性 Operator 完成奖
- 退出:国家代理上任后 Operator 职能剥离,门店主可优先竞标继续做"国家代理"

**首个试点**:意大利米兰(欧洲首店,意大利暂无国家代理)。

---

## 七、扩张路径（务实版）

### Phase 1（2026 – 2027）：中国转型 + 海外灯塔三国试点

- **中国**：服务商升级为 **Aqara Space 门店**（品牌升级 + 4 件事拉动:AI 工具 / Lead 流量 / 钱包透明 / 门店分成 5-10%);双轨过渡 6-12 个月
- **海外灯塔三国试点**：
  | 试点国 | 模式 | 战略意义 |
  |---|---|---|
  | **韩国** | 国家代理（现成）+ Aqara Space 门店 | 东亚成熟市场;K-PIPA 合规框架;与三星 / LG 智能家居本土玩家差异化(靠 Persona 千人千面) |
  | **迪拜（UAE）** | 国家代理（现成）+ Aqara Space 门店 | 中东富裕免税港;豪宅项目制为主(走 Project Pricing);英语 + 阿拉伯语 |
  | **意大利米兰** | **Operator-Store 过渡模式**（暂无国家代理）| 欧洲首店;GDPR 合规框架压测;"门店即运营层"先行验证 |
- **平台**：Aqara Academy 国际版上线（英语 + 韩语 + 阿语 + 意大利语优先）,Builder 平台跑通 Lead 派单 + Studio 部署 + 评分闭环 + 三层钱包结算
- **Builder Console**：**一套代码跑国内外**,差异化通过配置项(数据中心 / 合规 / 支付通道)实现,不分支

### Phase 2（2028 – 2029）：高端市场扩张

- **北美**：洛杉矶 / 旧金山 / 纽约 / 迈阿密 一线城市切入,先 City Lead 后接 Aqara Space 门店;美国规模化后争取设国家代理或 Aqara 直营子公司
- **欧洲**：伦敦 / 柏林 / 阿姆斯特丹 / 巴黎,沿用米兰试点验证过的 Operator-Store / 国家代理模式
- **日本**：东京 + 大阪,需要专门设立日本数据中心(若市场体量足够)
- **不进入"卖货中间商"模式**,直接走 Aqara Space 门店 + 国家代理双层
- 中国头部服务商(已升级为大型 Aqara Space 门店主)可作为 **海外国家代理候选**(给他们新增长曲线,化解抵触)

### Phase 3（2029+）：中等市场与新兴市场覆盖

- 印度 / 东南亚 / 拉美 / 土耳其 / 中东其他国家
- 低密度区域用 **国家代理（Master Franchise）**(类似洲际把酒店牌照授权给本地集团),但 **Builder 仍是 Aqara 总部直管**,代理只赚 Layer 2 治理钱
- 必要时单一国家代理覆盖跨国(小国合并),但 Aqara Space 门店仍按国独立审批

---

## 八、能力差距与应对（老实评估）

| 能力 | 现状 | 差距 | 应对 |
|---|---|---|---|
| 全球品牌认知 | 中国强、海外弱 | 大 | Phase 1 灯塔市场打认知，5 年慢扩 |
| 本地化运营 | 中国深、海外浅 | 大 | 国家代理(韩国/迪拜) + Operator-Store(米兰) + City Lead 三种触手 |
| 多语言 AI | 待建 | 中 | Spatial IQ Engine 跨语言能力（Layer 1）已在架构内 |
| **全球责任保险** | 无 | **大** | **必须自建平台保险池**（学 Tesla / Airbnb），Phase 1 必投 |
| 法律合规 | 中国成熟、海外缺 | 大 | 海外法务前置，按市场拆解 |
| 监管对接 | 中国成熟、海外按市场各异 | 中 | 不挑战当地牌照，作为"软件 + 培训"角色定位 |
| Studio 海外稳定性 | 待验证 | 中 | 灯塔市场试点 |
| 培训本地化 | 仅中文 | 中 | Aqara Academy 英语 / 阿语 / 西语 / 日语优先 |

---

## 九、心态校准（重要）

> **目标不是"3 年做到滴滴规模"，而是"10 年成为全球高端空间智能的 Tesla"。**

- 滴滴/美团靠**碾压式规模**才能盈利，我们靠**单 Studio 终身价值**就能盈利
- Tesla 用 20 年才形成全球 Service Network；Aqara 起点比 Tesla 当年好（已有中国基础 + 已有 Builder 平台 + 已有 Studio 雏形）
- **慢一点没关系，但每一步都必须把"质量 / 直管 / 标准化"做扎实**——这是与所有竞品的根本差异

---

## 十、落地原则

1. 任何"Builder 归门店 / 代理管理"的假设都要立刻驳回 —— **ACB 身份归 Aqara 总部**。
2. 任何 Builder 相关功能设计必须考虑 **全球流动 + Badge 跟人走 + 挂靠门店可换**。
3. Studio 是核心交付物,所有 Builder 工作流终点必须落到 **一台 Studio 实例**。
4. 平台保险池是 Phase 1 必投,不是"以后再说"。
5. 海外扩张顺序按 **灯塔三国(韩国/迪拜/米兰)→ 高端市场 → 中等/新兴市场**,**不要跳级**。
6. Aqara Space 门店 + 国家代理 / Operator-Store 始终是 "**基础设施 + 治理叠加**",不是 "Builder 雇主"。
7. 心态：**长期主义 + 单 Studio 价值最大化**,不被"规模焦虑"带偏方向。
8. **代理治理 ≠ 拥有** — 代理可被 Aqara 替换,门店和 ACB 身份均不变(学 Apple AASP)。
9. **挂靠规则全球统一** — Builder Console 一套代码跑国内外,差异化通过配置项实现,不分支。
10. **米兰 Operator-Store 是无代理国过渡** — 代理建立后剥离;不要把"门店即运营层"做成长期常态。
11. **Aqara Space 门店准入由总部独家审批** — 国家代理 / Operator-Store 仅有推荐 + 反对权,不得养亲兵。
