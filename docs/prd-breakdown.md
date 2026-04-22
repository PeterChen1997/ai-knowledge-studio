# Knowledge Studio PRD Breakdown

> **For Hermes:** Build against this breakdown instead of treating the PRD as a single large blob. Each module below needs clear data, UI, actions, and acceptance criteria.

## 1. Delivery principle
先把 PRD 拆成可交付模块，再按模块逐步开发。

当前总目标不是“把所有页面都做出来”，而是把下面 7 个模块逐个做成**真实可用能力**：
- 有状态
- 有输入
- 有操作
- 有结果
- 有持久化
- 有验收标准

---

## 2. Module breakdown

## Module A — Topics Inbox
**Goal:** 管理候选选题，并把高优先级选题推进成项目。

### Must-have data
- id
- title
- problem / opportunity
- searchDemand
- authorityGap
- shareability
- competition
- tags
- platformSuggestions
- status (`inbox | scored | selected | archived`)
- createdAt

### Must-have UI
- 选题列表
- 当前选题详情编辑区
- 状态切换
- 标签编辑
- 平台建议编辑
- 排序结果 / 机会分

### Must-have actions
- 新增选题
- 编辑选题
- 修改状态
- 查看排序结果
- 从选题创建项目

### Acceptance criteria
- 用户能新增至少 3 个选题并保存
- 用户能修改 tags / status / platformSuggestions
- 排序结果会随输入变化
- 用户能把某个选题推进为项目

---

## Module B — Content Projects
**Goal:** 把选题变成持续推进的内容项目，而不是一次性输出。

### Must-have data
- id
- topicId
- title
- audience
- platform
- objective
- tone
- status (`brief | sources | drafting | editing | ready | archived`)
- dueDate
- createdAt
- updatedAt

### Must-have UI
- 项目列表
- 当前项目详情
- 项目元信息编辑区
- 状态切换
- 截止时间显示

### Must-have actions
- 从 topic 创建项目
- 编辑项目基本信息
- 修改项目状态
- 设置 due date
- 聚合查看当前项目的 brief / sources / drafts

### Acceptance criteria
- 用户能同时管理多个项目
- 用户能区分不同项目所处阶段
- 项目切换时，下游 brief / sources / drafts 上下文同步变化

---

## Module C — Brief & Structure
**Goal:** 为项目建立真正可执行的 brief，而不是只显示一段 AI 输出。

### Must-have data
- projectId
- coreMessage
- userValue
- angle
- outline[]
- guardrails[]
- sourceCount

### Must-have UI
- Brief 编辑表单
- 结构列表
- guardrails 展示区

### Must-have actions
- 编辑核心观点
- 编辑目标用户收益
- 编辑 angle
- 编辑 outline
- 编辑 guardrails
- 保存到当前项目

### Acceptance criteria
- 每个项目都有独立 brief
- brief 修改后刷新不丢失
- AI 生成时以当前项目 brief 为输入

---

## Module D — Sources / References
**Goal:** 把资料管理做成真实能力，而不是只放几条静态文案。

### Must-have data
- id
- projectId
- title
- url
- excerpt
- evidenceLevel (`low | medium | high`)
- tags

### Must-have UI
- 当前项目 source 列表
- source 编辑表单
- evidence level 标签

### Must-have actions
- 新增 source
- 编辑 title / url / excerpt / evidenceLevel
- 删除 source
- 在 Library 中跨项目查看 sources

### Acceptance criteria
- 用户能为不同项目维护不同资料
- source 修改后持久化
- Library 能看到沉淀下来的 sources

---

## Module E — AI Drafting
**Goal:** 基于项目上下文生成多种内容版本。

### Must-have data
- projectId
- draft type (`title | outline | draft | rewrite`)
- providerLabel
- model
- content
- version
- status (`candidate | selected | archived`)
- createdAt

### Must-have UI
- 生成类型选择器
- 当前生成结果
- 版本列表
- provider 配置

### Must-have actions
- 生成 title / outline / draft
- 记录版本
- 标记一个版本为 selected
- 项目级展示最近一次 AI 结果

### Acceptance criteria
- 不同项目的 AI 结果互不串线
- 同一项目可连续生成多个版本
- 用户可选中一个版本作为当前主版本

---

## Module F — Versions & Editing
**Goal:** 保留内容演进过程，而不是覆盖式生成。

### Must-have UI
- 版本列表
- 选中状态
- 预览内容

### Must-have actions
- 查看版本历史
- 选择主版本
- 归档旧版本

### Acceptance criteria
- 至少支持同项目多版本保存
- 选中版本状态在刷新后保留

---

## Module G — Template Library
**Goal:** 把高质量结构、模板、prompt 沉淀成可复用资产。

### Must-have data
- id
- category (`prompt | structure | headline | platform`)
- name
- content
- tags

### Must-have UI
- 模板列表
- 分类展示
- 已沉淀的 drafts / sources / angles 汇总区

### Must-have actions
- 新增模板
- 编辑模板
- 按 category 查看

### Acceptance criteria
- 用户能新增模板并保存
- Library 不只是展示文案，而是能反映真实资产

---

## 3. Phase plan

## Phase 1 — Core workflow backbone
目标：把 Topics → Projects → Brief → Sources → AI Drafts 跑通。

包含：
- Topics 的完整编辑/状态流
- Projects 的状态/截止时间
- Brief 的真实编辑
- Sources 的新增/编辑/删除
- AI Draft 的项目级生成与版本记录

## Phase 2 — Versioning & Library
目标：让内容真正可沉淀、可复用。

包含：
- draft selected 状态
- 版本归档
- Library 按 category / asset 类型查看
- 模板编辑

## Phase 3 — Polishing & release readiness
目标：让产品更像真实工作台。

包含：
- Dashboard 真实统计
- 空状态 / 错误状态
- 更细的持久化和迁移
- 更完整的 UI QA

---

## 4. Immediate implementation order
按这个顺序开发：
1. Topics + Projects deepening
2. Brief + Sources editing
3. AI Draft type + version selection
4. Library real asset view
5. Dashboard summary polish

---

## 5. Current gap summary
当前代码已经有 app shell，但缺这些真实能力：
- Topics: tags / status / platform suggestions 还不完整
- Projects: status / due date 还不完整
- Brief: outline / guardrails 没有可编辑能力
- Sources: 还没有完整编辑/删除
- AI Drafting: draft type / selected version 没有完成
- Library: 还不是真正的资产管理

这份拆分文档之后，所有开发都按模块验收，不再按“页面像不像产品”来判断。
