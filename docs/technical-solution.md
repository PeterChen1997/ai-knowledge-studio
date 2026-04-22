# Technical Solution

## 1. 技术目标重构
当前产品不再被定义为单页内容生成器，而是一个 **内容创作与管理工具套件**。因此技术设计必须从“单次输入 → 单次输出”的页面逻辑，升级为“多对象 + 多状态 + 可扩展 AI 工作流”的应用结构。

## 2. Build target
- **User-facing app type:** 创作者工作台 / Content OS
- **Primary user flow:** Topics → Projects → Brief → Sources → AI Drafts → Versions → Library
- **State to persist:** topics、projects、briefs、sources、drafts、templates、provider settings
- **Core loop to prove:** 用户能围绕一个内容项目持续推进和管理，而不只是生成一次 prompt
- **Deployment target:** 当前仍可先用 GitHub Pages 验证单机版工作流；后续迁移到后端架构

---

## 3. 推荐架构

### 当前阶段（V0）
适合用前端单页应用快速验证完整工作台结构：
- Vite
- ES Modules 或 React
- 本地状态 + localStorage / IndexedDB
- OpenAI-compatible API adapter

### 下一阶段（V1/V2）
需要升级到更清晰的应用架构：
- 前端：React + Zustand / Redux Toolkit
- 后端：Node / Next.js API / Supabase / Cloudflare Workers
- 持久化：Postgres / Supabase
- 文件与资料：对象存储
- AI 调度：统一 server-side AI gateway

---

## 4. 核心技术模块

### 4.1 Domain Layer
产品应该按“内容对象”组织，而不是按页面区块组织。

建议核心 domain：
- `topics`
- `projects`
- `briefs`
- `sources`
- `drafts`
- `templates`
- `provider-config`

### 4.2 AI Provider Layer
已存在并应继续强化：
- `normalizeProviderConfig`
- `createKnowledgeMessages`
- `buildChatRequest`
- `parseOpenAICompatibleResponse`
- `generateKnowledgePackWithAPI`

后续要扩展为：
- `generateTitles`
- `generateOutline`
- `generateDraft`
- `rewriteForPlatform`
- `summarizeSources`

### 4.3 State Layer
当前 localStorage 仅适合 MVP。

建议拆分为：
- UI State
- Domain State
- Persistence Adapter

例如：
- `topicsStore`
- `projectsStore`
- `draftsStore`
- `settingsStore`

### 4.4 Persistence Layer
#### V0
- localStorage / IndexedDB

#### V1+
- server persistence
- project version history
- source records
- template library

---

## 5. 信息架构对应的前端模块

建议前端模块化为：
- `src/modules/dashboard/`
- `src/modules/topics/`
- `src/modules/projects/`
- `src/modules/library/`
- `src/modules/ai-workspace/`
- `src/modules/settings/`

每个模块内部再拆：
- state
- view
- actions
- serializers

而不是继续把所有逻辑放在单个 `main.js` 文件中。

---

## 6. OpenAI-compatible API 扩展规则

### 标准配置字段
- `providerLabel`
- `baseUrl`
- `apiKey`
- `model`
- `chatPath`

### 标准请求协议
- `POST {baseUrl}{chatPath}`
- body 包含：
  - `model`
  - `messages`
  - `temperature`

### 标准响应解析
- `choices[0].message.content`

### 兼容目标
- OpenAI
- OpenRouter
- 硅基流动
- One API
- 自建 compatible gateway

### 生产要求
前端直连仅用于 MVP 内测。
正式版必须迁移到后端代理，原因：
- API Key 安全
- 请求审计
- 限流与缓存
- 多 provider 路由
- Prompt governance

---

## 7. 数据模型建议

### Topic
```ts
{
  id: string
  title: string
  tags: string[]
  score: number
  status: 'inbox' | 'scored' | 'selected' | 'archived'
  createdAt: string
}
```

### Project
```ts
{
  id: string
  topicId: string
  title: string
  audience: string
  platform: string
  objective: string
  tone: string
  status: 'brief' | 'sources' | 'drafting' | 'editing' | 'ready' | 'archived'
  createdAt: string
  updatedAt: string
}
```

### Source
```ts
{
  id: string
  projectId: string
  title: string
  url: string
  excerpt: string
  evidenceLevel: 'low' | 'medium' | 'high'
}
```

### Draft
```ts
{
  id: string
  projectId: string
  type: 'title' | 'outline' | 'draft' | 'rewrite'
  version: number
  provider: string
  model: string
  content: string
  createdAt: string
}
```

### Template
```ts
{
  id: string
  category: 'prompt' | 'structure' | 'headline' | 'platform'
  name: string
  content: string
  tags: string[]
}
```

---

## 8. 测试策略重构

### 当前已有
- 纯函数测试
- OpenAI-compatible request/response 测试

### 应新增
#### Domain tests
- Topic 排序与状态流转
- Project 创建与状态变更
- Draft 版本保存与选中
- Template 提取与复用

#### Integration tests
- Provider config 存取
- AI draft 调用成功 / 失败
- 从 Topic 创建 Project
- 从 Brief 触发 Draft 生成

#### UI tests
- Dashboard 渲染
- 多对象状态切换
- 表单输入与持久化
- 错误提示与空状态

---

## 9. 当前代码问题与重构方向

### 当前问题
1. `main.js` 承担过多职责
2. 产品状态还没有对象化
3. UI 仍然偏 section-based
4. 还缺 Project / Source / Draft / Template 层

### 重构方向
#### Step 1
把现有单页拆成以下导航壳：
- Dashboard
- Topics
- Projects
- Library
- AI Workspace
- Settings

#### Step 2
引入对象驱动 state model

#### Step 3
将 AI provider 调用从“按钮行为”升级为可复用 action service

#### Step 4
加入 Draft versioning 与项目级存储

---

## 10. 实施建议

### Phase A：结构升级
- 重构信息架构
- 建立多模块导航
- 引入 Topic / Project / Draft 基础模型

### Phase B：管理能力补齐
- Project 管理
- Source 管理
- Draft 管理
- Template Library

### Phase C：AI 工作流增强
- 多生成类型
- 多版本比较
- Prompt 模板与平台改写
- 后端代理

---

## 11. 结论
技术设计也必须与产品定位同步升级：

> 这不是一个“内容包生成页”，而是一套以内容对象、内容流程和内容资产为核心的创作与管理系统。

因此下一版实现不应继续堆 section，而应重构成真正的应用架构。