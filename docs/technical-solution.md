# Technical Solution

## 1. 技术目标重构
产品已从“内容生成页”重构为 **Read → Think → Create OS**。技术上必须支持三类能力：
1. **输入与捕获**：收纳 URL / 摘录 / 笔记
2. **阅读与思辨**：AI 提炼 + 多角度分析 + 反驳结构
3. **创作与沉淀**：Project / Draft / Version / Template / Framework

因此代码架构要从“单页 section render”升级为“多对象、多工作区、多状态”的应用架构。

---

## 2. 受 SnapRead 启发的结构原则
从 `read-it-later` / SnapRead 中，我提炼出三条直接适用于当前产品的技术原则：

### 原则 A：围绕主链路分模块
SnapRead 明确区分了：
- Desk
- Reader
- Studio
- AI 在 Reader 上下文中工作

Knowledge Studio 也应该采用同样的分层：
- Inbox
- Reader
- Projects
- Library
- Studio

### 原则 B：AI 应放在内容上下文里，不是独立玩具区
就像 SnapRead 在 Reader 中展示 AI Summary / Analysis / Chat，Knowledge Studio 里的：
- summary
- claims
- counterview
- rebuttals
- open questions

都应该绑定到当前 input item / article，而不是漂浮在页面上的孤立输出。

### 原则 C：先跑通一条用户真实感知的 MVP 主链路
这一版不应该追求“全功能内容平台”，而应该优先打通：
- 导入材料
- 查看 AI 提炼
- 查看正反思辨分析
- 创建项目
- 生成草稿并保存版本

---

## 3. Build target
- **User-facing app type:** 创作者的阅读-思考-创作工作台
- **Primary user flow:** Inbox → Reader → Project → AI Draft → Version → Library
- **State to persist:** input items、reading analyses、projects、drafts、templates、provider settings
- **Core loop to prove:** 用户可以从一篇材料出发，形成判断，再进入内容创作流程
- **Deployment target:** 当前可继续使用 GitHub Pages 验证单机版；后续升级为前后端结构

---

## 4. 推荐应用架构

### V0 当前阶段
继续允许前端单页实现，但必须模块化：
- Vite
- ES Modules / 或后续迁移 React
- 本地状态对象化
- localStorage / IndexedDB
- OpenAI-compatible provider adapter

### V1+
建议升级：
- 前端：React + Zustand
- 后端：Node / Next API / Supabase / Cloudflare Workers
- 持久化：Postgres / Supabase
- 向量检索 / 资料检索：可选 RAG 层
- AI Gateway：统一 provider routing

---

## 5. 核心 Domain 模型

### 5.1 InputItem
系统里一切内容输入的起点。

```ts
{
  id: string
  type: 'url' | 'note' | 'excerpt'
  title: string
  rawContent?: string
  url?: string
  tags: string[]
  status: 'inbox' | 'reviewed' | 'promoted' | 'archived'
  createdAt: string
}
```

### 5.2 ReadingAnalysis
绑定到 InputItem 的阅读分析结果。

```ts
{
  inputId: string
  summary: string
  coreClaims: string[]
  supportPoints: string[]
  hiddenAssumptions: string[]
  alternativeAngles: string[]
  rebuttals: string[]
  counterRebuttals: string[]
  openQuestions: string[]
  contentOpportunities: string[]
  worthReading: 'low' | 'medium' | 'high'
}
```

### 5.3 Project
```ts
{
  id: string
  sourceInputId?: string
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

### 5.4 Draft
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

### 5.5 Template / Framework
这里不仅是 prompt 模板，还包含“反驳框架”“思辨角度框架”。

```ts
{
  id: string
  category: 'prompt' | 'structure' | 'angle' | 'rebuttal-framework' | 'platform'
  name: string
  content: string
  tags: string[]
}
```

---

## 6. 工作区架构

### 6.1 Inbox Workspace
负责收纳输入材料：
- new input form
- candidate list
- sort / filter / tag
- promote to reader / project

### 6.2 Reader Workspace
这是新的核心页面。

子模块：
- Original content / excerpt preview
- Summary
- Core claims
- Counterview & Rebuttal
- Open questions
- Content opportunities
- Create Project CTA

### 6.3 Projects Workspace
一个 Project 应该有自己的多标签页：
- Brief
- Sources
- Drafts
- Versions

### 6.4 Library Workspace
- Templates
- Angles
- Rebuttal frameworks
- Saved sources

### 6.5 Studio Workspace
- OpenAI-compatible provider settings
- default prompts
- default platform presets

---

## 7. Counterview & Rebuttal 技术设计
这是本轮新增核心能力。

### 输入
- article / note / excerpt 内容
- optional metadata（作者、平台、标签）

### 输出结构
建议 AI 返回以下标准 JSON / section：
- `mainClaim`
- `supportingLogic[]`
- `hiddenAssumptions[]`
- `alternativeAngles[]`
- `rebuttals[]`
- `counterRebuttals[]`
- `openQuestions[]`
- `contentOpportunities[]`

### 展示方式
在 Reader 中分栏或分卡片展示：
- 左：原文 / 摘录 / 摘要
- 右：思辨面板（claims / rebuttals / questions）

### 与创作的连接
每个条目支持：
- save to project brief
- save to angle library
- save to framework
- generate title ideas

---

## 8. OpenAI-compatible 适配层
现有 `ai-provider.js` 已经是一个好的基础，但需要从“单次草稿调用”升级为“多类型分析服务层”。

### 当前能力
- normalize config
- build chat request
- parse response
- generate one AI draft

### 下一步拆分
建议演进为：
- `analyzeInputSummary()`
- `extractCoreClaims()`
- `generateCounterviewAnalysis()`
- `generateProjectBrief()`
- `generateDraftVariants()`
- `rewriteForPlatform()`

### 统一接口风格
```ts
runAiTask({
  task: 'counterview-analysis',
  provider,
  model,
  context,
  input,
})
```

这样后续才能：
- 做任务级缓存
- 做 provider fallback
- 做 prompt versioning
- 做日志与调试

---

## 9. 状态管理建议
当前 app 不应继续只维护一个 `brief + topics` 状态，而应升级为：

```ts
{
  nav: {
    activeView: 'dashboard' | 'inbox' | 'reader' | 'projects' | 'library' | 'studio'
    selectedInputId?: string
    selectedProjectId?: string
  },
  inbox: {
    items: InputItem[]
  },
  analyses: Record<inputId, ReadingAnalysis>,
  projects: Project[],
  drafts: Draft[],
  templates: Template[],
  provider: ProviderConfig,
  ui: {
    loadingTask?: string
    error?: string
  }
}
```

---

## 10. 测试策略

### Domain tests
必须新增：
1. InputItem 创建与状态流转
2. InputItem → Project 转化
3. Draft version 递增
4. Template / framework 保存
5. Dashboard summary 统计

### AI layer tests
继续覆盖：
1. OpenAI-compatible request 组装
2. response 解析
3. task-specific prompt 构建
4. 错误处理

### UI integration tests（后续）
1. Reader 页面渲染分析结果
2. 从 rebuttal 加入 Project
3. Create Project 成功
4. 切换不同 workspace 不丢状态

---

## 11. 当前代码问题与重构方向

### 当前问题
1. `main.js` 仍然是 section-based renderer
2. 状态模型还不支持 Reader / Project / Library 体系
3. Counterview & Rebuttal 尚未成为一等对象
4. AI 任务接口还过于单一

### 重构方向
#### Phase A
- 引入 app shell
- 切换为多 workspace 导航
- 建立 InputItem / ReadingAnalysis / Project domain

#### Phase B
- Reader 页面化
- Counterview 模块接入
- Create Project from Reader

#### Phase C
- Draft / Version / Template 系统
- Library 回流

---

## 12. 结论
新的技术目标不是“把页面做得更像产品”，而是：

> 把产品真正重构成一个围绕内容输入、阅读判断、思辨分析和创作沉淀的内容操作系统。

因此下一版开发必须优先实现：
- Inbox
- Reader
- Counterview & Rebuttal
- Projects
- Studio

而不是继续叠加生成器式区块。