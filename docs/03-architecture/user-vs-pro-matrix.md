# User vs Pro 功能矩阵

> **目的**:消除"普通用户能做什么 / Pro 能做什么"的混淆,作为 IA 设计的硬约束。

## 总原则

| | 普通用户 (User) | Verified Builder (Pro) |
|---|---|---|
| 域名 | `builder.aqara.com` | `pro.builder.aqara.com` |
| 心智模型 | 「让我家更智能」(Consumer) | 「我帮别人家更智能」(Producer) |
| 时间预算 | 每周 1–2 次,每次 5–15 分钟 | 每天 1–4 小时,工具效率敏感 |
| 复杂度容忍 | 极低 — 看到 8 tabs 就懵 | 高 — 期望专业控制台 |
| 情感诉求 | 找灵感 / 安心 / 简单 | 效率 / 专业感 / 业务掌控 |

## 按模块对比

### 🏠 Home (主页)
| 维度 | User | Pro |
|---|---|---|
| 路由 | `/home` | `/pro` |
| 主体内容 | 个性化 feed (Discover + Saved + Continue + Trending) | KPI Dashboard (Lead / Studios / 分润 / 项目) |
| Hero 元素 | "Welcome to Aqara Builder" + Quick links | "下午好 Jun" + 5 KPI 卡 + 数据洞察 |
| 强转化点 | 成为 Verified Builder CTA(底部) | 切回普通用户视图(底栏) |

### 🤖 Build AI (AI 创作)
| 维度 | User | Pro |
|---|---|---|
| 路由 | `/home/build` | `/pro/build` |
| 主要作用 | 「试一个想法,看 AI 怎么帮我家」 | 「启动新客户项目 / 标准模板」 |
| 输出 | 自动化(Automation)/ Scene | 项目(Project)/ 模板(Template) |
| 持久化 | 「保存到我的自动化」「保存到 Ideabook」 | 「保存到客户项目库」 |
| 后续 | 激活到设备 / 收藏 / 找 Builder 帮装 | 进项目工作台深入编辑 |
| 是否有 Canvas? | ❌ 无 — 只有对话 + 预览 | ✅ 有 — 项目 → workbench → canvas |
| AI 算力档 | 仅「助理 0.5x」 + 月配额 900 A | 三档全开(总建筑师/方案师/助理) + 月配额 5000 A |

### 💡 Ideabook (灵感本) ★ 新概念
| 维度 | User | Pro |
|---|---|---|
| 路由 | `/home/ideas` | `/pro/ideas` (可选,共享同一数据) |
| 用途 | 把喜欢的作品 / Builder / 设备 / 自动化 收藏到主题集 | 收集参考素材,可作为客户提案附件 |
| 数据 | "我家客厅灵感" / "适老化方案" / "想要的设备" 等 | 同结构,但可被链接到 Project |
| 协作 | 可分享给家人(只读) | 可分享给客户(只读)作为提案 |

### 🔌 Devices (设备) vs Studios (Studio 实例)
| 维度 | User | Pro |
|---|---|---|
| 路由 | `/home/devices` | `/pro/studios` |
| 称呼 | 「我的设备」(消费者亲切) | 「Studio 实例 / 客户设备远程管理」(技术) |
| 内容 | Space 切换 (我的家 / 父母家)、设备列表、自动化 | 所有客户 Studio 健康面板、CPU/内存/告警、远程协助 |
| 操作 | 激活 / 暂停 / 重命名 / 添加自动化 | 远程重启 / 推规则 / 升级固件 / 协助 |

### 🤝 找专业人 vs 接单
| 维度 | User | Pro |
|---|---|---|
| 路由 | `/home/find-pro` | `/pro/leads` |
| 主体 | 浏览本地 Verified Builder + Quote Request 表单 | Lead 列表 + 接单/电话/转派 |
| 数据流 | User 提交 → 平台分发 Lead → Pro Inbox | Pro 接 Lead → 沟通 → Convert 项目 |

### 💬 Messages (对话) ★ 新模块
| 维度 | User | Pro |
|---|---|---|
| 路由 | `/home/messages` | `/pro/messages` (可选) |
| 用途 | 与已联系 Builder / 关注创作者对话 | 与所有客户(Lead + 在签 + 已交付)对话 |

### 📚 Community / Discover / Marketplace / Academy
基本一致,可双端共用,Pro 增强:
- Marketplace User 视角:浏览插件 + 安装到自家
- Marketplace Pro 视角:管理「我发布的插件」(收入分润)
- Discover User:看作品收藏
- Discover Pro:看作品 + 学习同行做法
- Academy User:零基础课程
- Academy Pro:Verified 认证 + 进阶课程

## 数据模型差异

### 同一概念在两端的存储:

```typescript
// User 创建的"自动化"(轻量)
interface Automation {
  id: string;
  ownerId: string;
  spaceId: string;       // 用户的 Space (我的家)
  name: string;          // "晚安模式"
  trigger: TriggerSpec;  // 时间 / 语音 / 设备
  actions: ActionSpec[]; // 设备动作
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
  generatedFromBuildAI?: boolean;
  ideabookId?: string;   // 可选关联到 ideabook
}

// Pro 创建的"项目"(重量)
interface Project {
  id: string;
  ownerId: string;       // Pro Builder
  customerId?: string;   // 关联客户(Pro 必填)
  type: 'customer' | 'template';
  title: string;
  budget?: number;
  contractMilestones?: Milestone[];
  deliveryDate?: string;
  spaces: Space[];       // 一个项目可能管多个 Space
  personas: Persona[];   // 居住者
  scenes: Scene[];       // 6 时间分镜
  bom: DeviceBOM[];      // 设备清单
  appliedToStudios: string[];  // 部署到了哪些 Studio
  revenueSplits?: RevenueSplit[];
  warranty?: WarrantySpec;
  status: 'draft' | 'testing' | 'delivered' | 'active' | 'verified';
  visibility: 'private' | 'published' | 'verified';
}

// User 的"自动化"可以"升级"为 Pro 的"项目"
// 触发场景:用户找 Builder 帮我落地 → Builder 把 Automation Fork 为 Project
```

## 关键约束

1. **User 不能 access /pro/***: ProGate 强制 redirect 到 /onboarding
2. **Anon 不能 access /home/***: UserGate 强制 redirect 到 /signin
3. **Pro 可以 access /home/***: 切回 User 视图,看自己作为消费者
4. **路径 /home/build 的产物 ≠ /pro/build 的产物**: 数据模型不同
5. **找 Builder 流程是双向的**: User 提交 Quote → Pro 接单
