# Badge Catalog

> 所有 Aqara Academy 颁发的 Badge 列表 + 晋升路径 + 权限映射。
> Badge 决定 ACB（Aqara Certified Builder）在平台上的能力边界，详见 [`role-model.md`](./role-model.md)。
> 注意："Installer Pro / Plugin Author / Persona Author"等是 **Badge 等级名称**，与历史"Aqara Pro 平台"概念无关。

---

## Badge 分类

| 类别 | 定位 |
|---|---|
| **Installation 系列** | 现场安装、Studio 部署、调试、交付 |
| **Design 系列** | 空间设计、Persona、风格 |
| **Development 系列** | 插件、工作流、Agent 开发 |
| **Specialty 系列** | 适老化、儿童、办公、商业等垂直 |
| **Honor 系列** | 荣誉 / 经验 / 社区贡献，**不可考取**，由系统授予 |

---

## Badge 详表

### Installation 系列

| Badge | 等级 | 考核 | 解锁 |
|---|---|---|---|
| `Installer Certified` | L1 | 线上课程 + 实操考核 | 接单基础权限、Builder Console Project Suite、**Studio 部署许可** |
| `Installer Pro` | L2 | 完成 ≥ 30 项目 + 评分 ≥ 4.5 | 高难度项目派单优先权 |
| `Installer Master` | L3 | 完成 ≥ 100 项目 + 跨城市作业经验 | 区域培训助教资格 |
| `Studio Ops Specialist` | 横向 | Studio 远程运维 / 故障排查实操 | 多客户 Studio 远程批量管理 |

> ⚠️ **Studio 部署是 ACB 唯一硬门槛**：未持 `Installer Certified` 的人不能在客户家激活 Studio。

### Design 系列

| Badge | 等级 | 考核 | 解锁 |
|---|---|---|---|
| `Spatial Designer` | L1 | 空间本体课程 + Ontology 实操 | Persona Composer 高级模板 |
| `Persona Author` | L2 | 发布 ≥ 5 个被复用的 Persona | Persona 市场上架资格 |
| `Solution Architect` | L3 | 复杂跨场景方案考核 | 大客户/商业项目派单优先 |

### Development 系列

| Badge | 等级 | 考核 | 解锁 |
|---|---|---|---|
| `Plugin Developer` | L1 | 插件开发课程 + 沙箱通过审核 | Plugin Builder + Marketplace 上架 |
| `Plugin Author` | L2 | 上架插件 ≥ 3 + 累计安装 ≥ 1k | 营收分成上限提升 |
| `Workflow Builder` | L1 | Spatial IQ Studio 工作流认证 | Agent Marketplace 发布 |

### Specialty 系列（垂直认证）

| Badge | 含义 |
|---|---|
| `Aging Care Certified` | 适老化方案设计与交付 |
| `Child Safety Certified` | 儿童安全 / 教育空间 |
| `Hospitality Certified` | 民宿 / 酒店 / 短租场景 |
| `SMB Office Certified` | 中小办公空间 |
| `Retail Space Certified` | 零售商业空间 |

### Honor 系列（系统授予）

| Badge | 触发 |
|---|---|
| `Founding Builder` | 平台前 1000 名 ACB |
| `Top Reviewer` | 客户评分 Top 5% |
| `Content Star` | Showcase 累计带来 ≥ 100 Lead |
| `Mentor` | 推荐认证新 ACB ≥ 10 |
| `Studio Veteran` | 累计部署激活 ≥ 50 台 Studio |

---

## 晋升路径示意

```
Installer Certified ──────► Installer Pro ──────► Installer Master
       │                              │
       │                              └─加 Studio Ops Specialist─► 多客户远程批量运维
       │
       ├──加 Spatial Designer──► Persona Author ──► Solution Architect
       │
       └──加 Plugin Developer──► Plugin Author
```

> Badge **横向叠加**，不互斥。ACB Profile 上展示完整 Badge 墙。

---

## Badge → 权限映射（数据模型）

```
Badge → Permission Bundle
   ├── lead_match_filters
   ├── workshop_features (Builder Console)
   ├── studio_deploy_scope (能否激活 Studio / 远程运维范围)
   ├── commission_rates
   ├── marketplace_listing
   └── academy_role (e.g., 助教 / 导师)
```

具体表结构详见 [`../03-architecture/data-model.md`](../03-architecture/data-model.md)。

---

## Badge 颁发与维护

- **颁发**：Aqara Academy 课程 + 考核（线上 + 区域线下集训）
- **有效期**：默认 12 个月，到期需续证（轻量考核或继续教育学时）
- **吊销**：严重投诉 / 评分跌破阈值 / Studio 部署事故 / 违反平台规则 → 进入审查流程
- **数据主体**：Badge 跟人走，**不跟区域伙伴 / 服务商**——Affiliation 变更不影响 Badge

---

## 落地原则

1. 任何涉及"角色"的产品功能都要映射到 Badge 集合，**不要再写"如果是 Installer 就……"**。
2. 新 Badge 上线流程：课程内容 → 考核题库 → 灰度颁发 → 权限映射 → 文档更新。
3. Honor Badge 由后台规则计算，不能人为申请。
4. Badge 墙在 ACB Profile 显示，是 ACB **公开的可信资产**。
5. **Studio 部署权限**通过 `Installer Certified` Badge 严控——这是 Aqara 全球质量统一的根本闸门。
