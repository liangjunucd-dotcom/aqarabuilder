# 用户旅程地图 — Aqara Builder

> **作者**: 系统设计 (业务 + 交互 + AI 原生架构 三视角)
> **更新**: 2026-05-10
> **状态**: v1.0 落地原型规划

## 三类用户身份

| 身份 | 占比预测 | 核心动机 | 商业贡献 |
|---|---|---|---|
| **匿名访客 (Anon)** | 占总流量 60–80% | 找方案、看作品、了解产品 | 流量池 / SEO / 转化漏斗起点 |
| **登录用户 (User)** | 占注册用户 95% | 让自家更智能、找灵感、买/连设备 | 设备 GMV / 插件订阅 / 引荐成 Lead |
| **Verified Builder (Pro)** | 占注册用户 5% | 把空间智能做成业务 | 项目分润 / Lead / 创作内容拉新 |

**核心约束**:User 是 95% 的人,但 Pro 是 95% 收入来源。两边都要做好。

---

## 旅程 1 — 匿名访客 → 登录用户

### 触点
- 搜索引擎(Google "smart home design AI")
- 社媒分享(小红书 / Instagram 帖子链接)
- Aqara 官网 / 公众号 / 店铺二维码
- KOL / Builder 自带流量

### 路径
```
Landing (/)
  ↓ 看 Hero "为每个家设计独一无二的空间智能"
  ↓ 看 3 分镜效果 / Showcase 作品 / NetworkMap
  │
  ├─→ 点 Discover → /discover (浏览作品)
  │     ↓ 喜欢一个作品 → /showcase/[id]
  │     ↓ 想 Apply / 想跟创作者沟通 → 提示登录 → /signin
  │
  ├─→ 点 Builders → /builders (浏览全球 Builder)
  │     ↓ 喜欢某 Builder → /u/[handle] 看 Profile
  │     ↓ 想找他做项目 → 提示登录 → /signin
  │
  └─→ 主 CTA "免费试用-给我家用" → /signin
       ↓ 输入手机/邮箱 → 验证码 → setRole('user') → /home?welcome=first
```

### 关键转化点
- **作品详情页 Apply 按钮** — 触发登录
- **Builder Profile 联系按钮** — 触发登录
- **Hero 双 CTA** — 区分用户 / 专业人士

---

## 旅程 2 — 登录用户的核心使用旅程 (借鉴 Houzz / MakerWorld)

### 设计原则
1. **Discovery first** — 用户来不是为了"创作",是为了"找/学/买/看",借鉴 Pinterest / Houzz
2. **Save 比 Make 重要** — Ideabook(灵感收藏夹)是核心,作品收藏 + 创作灵感
3. **轻量 AI 而非重量项目** — 普通用户聊 AI 是为了"我家可以怎么用",不是做交付项目
4. **Connect to Pro** — 当用户需要专业帮助,无缝接到 Builder
5. **Devices 而非 Studios** — 用户视角是"我的设备",不是"Studio 实例"

### 主路径
```
首次登录 → /home?welcome=first
  ↓ 顶部欢迎横幅 + Quick Start 引导:
  ↓   1. 看灵感 (推荐 Discover 作品)
  ↓   2. 创建第一个 Ideabook
  ↓   3. 试 Build AI 输入一个想法
  ↓   4. 连接你的第一台 Aqara Studio

主页 /home (个性化 feed)
  ├─ Continue (上次没看完的作品 / 没保存的 idea)
  ├─ Recommended for you (基于浏览历史 / 户型 / 喜好)
  ├─ From your saved Builders (关注的创作者新作)
  ├─ Trending in your area (你所在城市的热门方案)
  └─ Quick links: 灵感本 / Build AI / 设备 / Find a Pro

侧边栏:
  - Home (feed)
  - Discover (探索作品 — 复用现有 /discover)
  - Ideabooks (我的灵感本) ★ 新
  - Devices (我的设备 + 自动化)
  - Build AI (轻量 AI 创作)
  - Find a Pro (找认证 Builder) ★ 新
  - Messages (对话) ★ 新
  - Community (论坛)
  - Marketplace (插件市场)
  - Academy (学习)
```

### 高频场景

#### 场景 A: 找灵感 + 收藏到 Ideabook
```
1. 浏览 Discover / 推荐 feed
2. 看到喜欢的作品卡 → 点 ❤ 保存
3. 弹窗:"添加到 Ideabook" — 选择已有 / 新建
4. 后续:在 /home/ideas 看自己的所有 Ideabook
   - "我家客厅灵感" - 12 个作品
   - "适老化方案" - 8 个作品 + 3 个 Builder
   - "想要的设备" - 5 个 plugin / 8 个产品
```

#### 场景 B: 用 Build AI 试一个想法
```
1. 进 /home/build
2. 输入 "客厅晚上想要电影院的氛围"
3. AI 生成:
   - 灯光方案 (主灯关闭 → 氛围灯 30%)
   - 推荐设备 (如缺)
   - 触发条件 ("说'看电影'" / "晚 8 点后开投影")
4. 用户可以:
   - "保存到我的自动化" → /home/devices 后续可激活
   - "保存到 Ideabook" → 留作灵感
   - "请 Builder 帮我落地" → 跳 /home/find-pro 推荐合适 Builder
```

#### 场景 C: 找 Builder 帮我做整套
```
1. 进 /home/find-pro
2. 浏览本地 Verified Builder 列表
3. 筛选:专长 (适老/亲子/极客) / 评分 / 价格区间 / 距离
4. 点进 Builder Profile → 看作品 / 评价
5. "联系 Builder" → 弹出 Quote Request 表单:
   - 户型 (上传图)
   - 预算
   - 需求描述 (可选:从已有 Ideabook 自动填)
   - 联系方式
6. 提交 → Builder 收到 Lead → 进入 Messages 对话
```

#### 场景 D: 管理设备 + 激活自动化
```
1. 进 /home/devices
2. 看到:
   - 我的家 (Space 1) - 1 台 Aqara Studio + 47 设备
   - 父母家 (Space 2) - 1 台 Studio + 23 设备
3. 切换 Space → 看具体 Studio 状态 + 设备列表
4. "我的自动化"区:
   - 6 个已激活 (起夜 / 离家 / 影院模式 ...)
   - 3 个待激活 (从 Build AI 保存的)
5. 点某个自动化 → 详情 + 修改 / 暂停
```

#### 场景 E: 在 Community 提问 / 分享
```
1. 进 /home/community
2. 发帖问题 / 看热门讨论
3. 关注感兴趣的 topic / 创作者
4. 互动:点赞 / 评论 / 收藏帖子
```

### 用户 → Pro 进阶触点
分布在多个路径:
1. **Sidebar 底部 CTA** "成为 Verified Builder · 解锁 Pro Console"
2. **Find a Pro 页底部** "你也可以成为 Builder,帮其他人设计 →"
3. **Build AI 页右侧** "经常自己做方案?申请 Verified Builder"
4. **Ideabook 收藏多了** 主动弹出 "看起来你很懂智能家居,要不要试试做 Builder?"
5. **Profile 页** "升级我的身份"

---

## 旅程 3 — Verified Builder 的工作日常 (Pro Console)

### 域名隔离
`pro.builder.aqara.com` — 独立子域,登录后 token 共享。视觉上明显与 user 端区分(密度更高 / 工具更专业)。

### 主路径
```
登录 (Pro 账号已认证) → /pro
  ↓ Operating overview:
  ↓   - 关键状态 (Leads / Projects / Work Orders / Financials / Credentials)
  ↓   - Continue working on (上次编辑项目)
  ↓   - 最近动态 (Lead/告警/分润/Apply)
  ↓   - Builder L4 进度

侧边栏:
  - Projects (客户项目 / Project Passport / Work Orders)
  - Leads (平台机会 / 客户咨询 / 服务意图)
  - Financials (报价 / 合同 / 收款 / Credits / 结算)
  - Company (Profile / Team / 认证 / 服务区域 / Marketplace 供给)

全局工具:
  - Search / Messages / Notifications / Help / Settings
  - Work Context Switcher

底栏:
  - 切回普通用户视图 (/home) — 让 Pro 也能看用户视角
```

### 项目流程 (核心)
```
/pro/projects (列表)
  ↓ 点项目卡 → /pro/projects/[id] (项目工作台 = WORKBENCH)
  │
  │  Workbench 功能(5 tabs):
  │   1. 概览 — 项目状态 / 时间线 / KPI
  │   2. 客户与需求 — 客户档案 / 户型 / 预算 / 需求描述
  │   3. Persona 与场景 — 居住者 + 6 个时间分镜
  │   4. 设备与方案 — BOM / 协议 / 部署
  │   5. 交付与服务 — 交付清单 / 长期服务承诺
  │
  │  右侧:AI 方案助手 (chat)
  │  顶部:"打开项目画板" 按钮 → 沉浸式画布
  │
  ↓ "打开项目画板" → /pro/projects/[id]/canvas (沉浸式 CANVAS,无 sidebar)
       全屏 2D/3D 户型 + 设备 + Persona 光晕 + 时间穿梭
```

### 创作流程
```
/pro/build (创作中心)
  ↓ 顶部:大 chat 输入 "客户 180m² ..." 或 "晚安场景标准模板"
  ↓
  ├─ 启动新客户项目 → 选择/新建客户 → AI 生成草案 → 进 Workbench
  ├─ 启动新模板 → 不绑客户 → 生成模板项目 → Workbench (mode=template)
  ├─ 继续 → 显示最近 3 个项目卡
  └─ Forge 工具墙 (Build · Space / App / Driver)
```

---

## 关键命名规则

| 概念 | User 端称呼 | Pro 端称呼 | 数据模型差异 |
|---|---|---|---|
| 我的家 / 客户家 | 「我的家」「父母家」 | 「李先生家」「王氏别墅」 | User: 关联自己 owner;Pro: 关联客户 + 合同 |
| 设备主机 | 「Aqara Studio 主机」(品牌名) | 「Studio 实例 / aq-li-001」(技术名) | 同一物 |
| AI 创作产物 | 「自动化」 / 「场景」 | 「项目 / Project」 | User 简单;Pro 含合同/billing |
| 灵感收藏 | 「Ideabook · 灵感本」 | (Pro 也可以用,但更多用于参考素材) | 同 |
| AI 算力 | 「A 币」(基础月配额 900) | 「A 币」(基础 5000 + 增值订阅) | 同币不同额度 |
| 找专业人 | 「Find a Builder」 | (不需要 — 自己就是) | — |
| 业务身份 | 「Aqara 用户」 | 「Aqara Verified Builder · L1–L5」 | 同账号不同 role flag |

---

## 设计原则:User vs Pro 不冲突

- **同一账号** 可以同时是 User 和 Pro
- 第一次注册默认 User
- 申请 Onboarding 后变 User+Pro 双身份
- Pro 可以随时切回 User 视图(看自己作为消费者的视角)
- User 端永远可见"成为 Builder"CTA(直到他成为 Pro)
- Pro 端永远可见"切到 User 视图"CTA(底栏)

---

## SEO + 增长视角

| 入口 | SEO 价值 | 实际作用 |
|---|---|---|
| `/discover` | 高 — 关键词"智能家居方案" | 转化 Anon → User |
| `/u/[handle]` | 高 — Builder 个人品牌带流量 | 转化 Anon → User → 找 Builder |
| `/showcase/[id]` | 高 — "适老化智能家居方案" | 转化 + Apply CTA |
| `/builders` | 中 — "找智能家居设计师" | 转化 → Find Pro |
| `/academy` | 中 — "智能家居培训" | 转化 → Onboarding |
| `/founders` | 高 — KOL 品牌引流 | 转化 → Onboarding |
