# Aqara Academy Curriculum

> Aqara 培训学院。**ACB（Aqara Certified Builder）培训 + 认证 + Badge 颁发的唯一入口**。
> Aqara 平台直管 Builder（人），Academy 是 Aqara → ACB 之间的核心通道。
> 区域伙伴门店**不再承担培训职能**——只协助招募与场地。

---

## 培训交付形式

| 形式 | 用途 |
|---|---|
| **线上课程** | 理论 + 视频 + 互动测试，自学为主 |
| **线下集训** | 区域基地集中实操（设备调试 / Studio 部署 / 现场作业） |
| **AI 辅助实践** | Builder Console 沙箱内模拟项目，AI Coach 反馈 |
| **导师制（高级 Badge）** | Mentor Badge 持有者 1:N 带教 |
| **复训 / 续证** | 短课程 + 轻量考核，每 12 个月 |

---

## 课程体系（按 Badge 路径）

### 起点课：Aqara 空间智能基础（必修）

| 模块 | 内容 |
|---|---|
| 空间智能哲学 | Aqara AI / Spatial IQ / Ontology 概念 |
| 平台与角色 | Aqara / 区域伙伴 / ACB / 用户的四方关系 |
| 平台工具速览 | Builder Console / Aqara Life / Aqara Studio / Marketplace |
| Studio 概念入门 | Aqara Studio 是什么、为什么部署 Studio = 交付价值 |
| 职业与收入 | Badge 路径、分佣机制（设备 + 订阅 + 插件三流） |
| 合规与隐私 | 客户数据处理、隐私脱敏、Studio 本地优先原则 |

> 通过此课才能进入任何专项 Badge 课程。

---

### Installation 路径

```
基础 → Installer Certified → Installer Pro → Installer Master
                  ↘ Studio Ops Specialist（横向）
```

**Installer Certified（L1）课程**
1. 设备协议与生态（Zigbee / Matter / Wi-Fi / 厂商互操作）
2. 户型勘测与图纸
3. 空间图谱基础与 Space Editor 操作
4. **Aqara Studio 部署与激活全流程**（必修）
5. 标准住宅安装流程
6. 客户沟通与交付报告
7. 实操考核（指定户型完整交付，含 Studio 激活）

**Installer Pro（L2）解锁条件**
- 完成 ≥ 30 项目 + 客户评分 ≥ 4.5
- 进阶课程：复杂户型、跨房屋打通、疑难故障

**Installer Master（L3）解锁条件**
- 完成 ≥ 100 项目 + 跨城市作业经验
- Master 课程：区域统筹、新人带教、特殊场景

**Studio Ops Specialist（横向）**
- Studio 远程运维、批量管理、故障定位、版本灰度

---

### Design 路径

```
基础 → Spatial Designer → Persona Author → Solution Architect
```

**Spatial Designer（L1）课程**
1. 空间本体（Ontology）原理
2. Persona Composer 深度操作
3. 千人千面设计原则（家庭成员心理模型）
4. 风格与调性（住宅 / 适老化 / 儿童 / 办公）
5. 实操：为示范家庭组装 6 个 Persona（部署到测试 Studio）

**Persona Author（L2）**
- 发布 ≥ 5 个被复用的 Persona
- 进阶课程：跨家庭复用、参数化、版本管理

**Solution Architect（L3）**
- 复杂跨场景方案考核（大宅 / 商业空间 / 多分支）
- 进阶课程：商业项目方法论、报价与谈判、多 Studio 编排

---

### Development 路径

```
基础 → Plugin Developer → Plugin Author
基础 → Workflow Builder
```

**Plugin Developer（L1）课程**
1. 声明式插件 Manifest
2. Aqara Life 组件库
3. 数据绑定与权限
4. App 端 vs Studio 端运行时差异
5. 沙箱预览与调试
6. 上架审核流程
7. 实操：发布一个简单插件

**Plugin Author（L2）解锁**：上架 ≥ 3 + 累计安装 ≥ 1k

**Workflow Builder（L1）**：Spatial IQ Studio 工作流 / Agent 编排（在 Studio 本地推理）

---

### Specialty 系列

每个垂直 Badge 对应 1–2 周专项课程 + 实操：
- Aging Care / Child Safety / Hospitality / SMB Office / Retail Space

---

## 区域基地

> 区域伙伴**协助提供场地与招募**，Aqara Academy 派讲师**直接授课**。

- 区域基地 = 集训场地 + 演示空间 + 设备实操室 + Studio 实操台
- **区域伙伴不是培训方**，是场地与招募协助方
- 补贴机制：按区域贡献的认证 ACB 数量 + Studio 部署量给区域伙伴被动分成（详见 [`../00-vision/global-network-model.md`](../00-vision/global-network-model.md) 和 [`../00-vision/china-transition.md`](../00-vision/china-transition.md)）

---

## 在 Builder Console 内的入口

Builder Console 的 **Learn** 入口：
- 当前 Badge 列表与到期提醒
- 推荐课程（基于已持有 Badge + 项目数据 + Studio 部署经验）
- 课程进度 / 考核状态
- 区域线下集训日历
- 续证提醒

---

## 数据与归属

- Badge 颁发记录写入 Identity 服务（详见 [`../03-architecture/data-model.md`](../03-architecture/data-model.md)）
- 学习进度跨 ACB 一生跟随，**与 Affiliation 解耦**——挂靠关系变更（独立 ↔ 区域伙伴雇员）不影响 Badge
- 区域伙伴可以看到旗下 ACB 的 Badge 状态（脱敏汇总），但**不能修改**

---

## 落地原则

1. 任何涉及"培训"的功能 / 入口 / 文案，**指向 Aqara Academy**，不要指向区域伙伴门店。
2. 区域伙伴相关 UI 不出现"培训管理"，只出现"协助招募 / 场地管理"。
3. Badge 课程内容版本化管理，旧版完成的 ACB 在新版上线时给出"差异补课"路径。
4. 海外市场课程由 Aqara Academy 本地化（语言 + 法规），**不外包给海外区域伙伴**。
5. **Studio 部署能力是 Installer Certified 必修**——这是 Academy 守住全球质量底线的核心闸门。
