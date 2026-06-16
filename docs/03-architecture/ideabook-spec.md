# Ideabook 概念规格

> **类比**:Houzz Ideabooks · Pinterest Boards · MakerWorld Collections
> **作用**:把"看到喜欢的东西就保存"做成中心化能力,让普通用户的旅程从「单次浏览」转化为「持续回访」

## 设计哲学

普通用户进 Aqara Builder 不是为了"创作",而是为了"看 / 收 / 学 / 装"。Ideabook 是把"看 / 收"沉淀下来的容器,本质是用户在平台留下的「偏好资产」,让平台后续的推荐、Find a Pro、Quote Request 都有上下文。

## 数据模型

```typescript
interface Ideabook {
  id: string;
  ownerId: string;
  title: string;            // "我家客厅灵感"
  emoji?: string;           // 🛋
  description?: string;     // "暖光 + 自然材质 + 智能升降"
  coverImage?: string;
  itemCount: number;
  visibility: 'private' | 'shared' | 'public';
  collaborators?: string[]; // 家人 handle (shared)
  createdAt: string;
  updatedAt: string;
}

interface IdeabookItem {
  id: string;
  ideabookId: string;
  type: 'showcase' | 'builder' | 'plugin' | 'device' | 'automation' | 'note';
  refId: string;            // 关联的对象 ID
  note?: string;            // 用户添加的备注
  position: number;
  addedAt: string;
}
```

## 核心交互

### 1. 收藏触发点 — 一处 ❤,处处生效

每个可收藏的对象都有 ❤ 按钮:
- Showcase 卡 → 收藏作品
- Builder Profile → 收藏 Builder
- Plugin 卡 → 收藏插件
- Device 详情 → 收藏设备
- Build AI 生成的 Automation → 保存到 Ideabook

点 ❤ 弹出选择器:
```
┌─────────────────────────────┐
│ 添加到 Ideabook              │
├─────────────────────────────┤
│ ☑ 我家客厅灵感 (12)          │
│ □ 适老化方案 (8)             │
│ □ 想要的设备 (5)             │
│ □ 远程办公方案 (3)           │
├─────────────────────────────┤
│ + 新建 Ideabook              │
└─────────────────────────────┘
```

### 2. 浏览 — `/home/ideas`

```
┌──────────────────────────────────────────────┐
│ 💡 我的灵感本 (4)                  + 新建本   │
├──────────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │ 🛋   │  │ 👴   │  │ 📱   │  │ 💼   │         │
│  │我家  │  │适老化│  │想要的│  │远程  │         │
│  │客厅  │  │方案  │  │设备  │  │办公  │         │
│  │ 12   │  │ 8    │  │ 5    │  │ 3    │         │
│  └─────┘  └─────┘  └─────┘  └─────┘         │
│                                              │
│ 最近收藏                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  │作品 │ │作品 │ │👤  │ │插件│ │作品 │         │
│  └────┘ └────┘ └────┘ └────┘ └────┘         │
└──────────────────────────────────────────────┘
```

### 3. Ideabook 详情 — `/home/ideas/[id]`

```
┌──────────────────────────────────────────────┐
│ ← 返回                                       │
│                                              │
│ 🛋 我家客厅灵感                               │
│ 暖光 + 自然材质 + 智能升降                    │
│ 12 项 · 创建于 2026-04-12 · 仅自己可见        │
│                                              │
│ [混搭视图] [作品] [Builder] [设备] [插件]    │
│                                              │
│ ┌────┐ ┌────┐ ┌────┐                         │
│ │作品│ │作品│ │👤  │                         │
│ │ ❤ │ │ ❤ │ │Builder│                       │
│ └────┘ └────┘ └────┘                         │
│                                              │
│ 💡 看起来你对客厅设计很有想法 →              │
│   推荐找 Builder 帮你落地                    │
└──────────────────────────────────────────────┘
```

### 4. 转化触发器(关键)

Ideabook 不只是"收藏夹",更是「转化漏斗」:

| 触发器 | 时机 | 转化目标 |
|---|---|---|
| 同主题收藏 ≥ 5 → 推荐相似 Builder | 浏览 ideabook 详情时 | 找 Builder |
| 收藏作品有 Apply 按钮 → 直接 Apply | 列表中 | 设备 GMV |
| Builder 有新作品 → 通知 | 关注后 | 回访 |
| 收藏多了 → "你很懂智能家居,要不要做 Builder?" | 总收藏 ≥ 30 | Pro Onboarding |
| 把 Ideabook "分享给 Builder" → 自动填 Quote Request | Find a Pro | Lead 转化 |

### 5. 与 Build AI 联动

```
User 在 /home/build 用 AI 生成"晚安模式"自动化
  ↓ 选择"保存"
  ├─→ 「激活到我的设备」(/home/devices/automations)
  ├─→ 「保存到 Ideabook」(/home/ideas)
  └─→ 「找 Builder 帮我装」(/home/find-pro,自动带上下文)
```

## 实现优先级

- ✅ P0: `/home/ideas` 列表 + 4 个示例本
- ✅ P0: 详情页 `/home/ideas/[id]` 显示混搭项
- ⚠ P1: Showcase 卡上的 ❤ 按钮(原型可弹 toast)
- ⚠ P1: Build AI 生成结果可保存到 Ideabook
- ❌ P2: 创建/编辑/删除 Ideabook 的完整 CRUD(原型仅展示)
- ❌ P2: 协作分享(原型仅展示分享 affordance)

## 视觉

- Card 用主题色 gradient + emoji 大头(类 Notion)
- 详情页用 Pinterest 风 masonry 网格,但简化为 grid (原型节奏)
