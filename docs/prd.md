# Knowledge Studio PRD

> **For Hermes:** This product is not a landing page and not a single-purpose prompt toy. Treat it as a full-stack content creation and content management workspace for knowledge creators.

## 1. 一句话产品定义
Knowledge Studio 是一套面向垂直知识创作者与小型内容团队的 **AI 内容创作与管理工具**：从选题、资料整理、内容策划、AI 辅助生成、版本编辑，到内容资产沉淀与复用，形成完整工作流。

---

## 2. 背景与机会
当前大量“AI 内容工具”只解决一个局部问题：
- 要么只是一个 prompt 输入框
- 要么只是一个图文/视频生成器
- 要么只是一个内容日历或素材库

但真实的知识内容创作不是一次性生成，而是一条连续链路：
1. 发现值得做的选题
2. 判断这个题面向谁、在哪个平台做、该用什么表达方式
3. 收集和管理资料、观点、证据与参考来源
4. 形成 brief、提纲、角度与标题
5. 借助 AI 生成草稿与变体
6. 继续编辑、比较版本、沉淀模板
7. 最终输出成可发布内容，并积累为可复用资产

所以这个产品的真正形态不该是“生成一个内容包的页面”，而应该是：

> **内容创作操作系统（Content OS）/ 内容工作台（Content Studio）**

---

## 3. Product framing
- **Target user:** 持续做知识型内容输出的个人创作者、研究型内容账号、品牌内容团队、科普/教育内容团队
- **Core moment:** 今天有几个想做的题，需要快速判断做什么、怎么做、基于什么资料做，并把内容推进到可发布状态
- **Promise:** 让知识内容生产从“散乱的文档 + 聊天记录 + 灵感碎片”变成结构化、可复用、可管理的工作流
- **Smallest useful version:** 选题池 + 内容项目 + brief/结构生成 + AI 草稿 + 资料/版本管理
- **Biggest risk:** 如果继续按“单页生成器”去设计，会在产品层失焦，无法形成真正的留存和复用价值

---

## 4. 目标与非目标

### 4.1 产品目标
1. 把知识内容创作从单次生成升级为持续管理的流程工具
2. 把“选题—资料—策划—生成—沉淀”串成一个统一工作台
3. 提升创作者的三个核心指标：
   - 选题效率
   - 生产稳定性
   - 内容资产复用率
4. 为后续接入 OpenAI-compatible 模型、多平台发布、团队协作留下清晰结构

### 4.2 非目标
1. 不做通用型项目管理平台
2. 不做全功能设计/剪辑软件
3. 不做纯社交社区
4. 不在第一版解决自动发布到所有平台
5. 不承诺“一键全自动出高质量最终稿”

---

## 5. 核心用户与场景

### 5.1 用户分层
#### A. 独立知识创作者
- 做小红书 / 公众号 / 视频号 / B 站 / 抖音知识内容
- 痛点：题多、信息散、资料难复用、创作流程不稳定

#### B. 小型内容团队
- 1-5 人内容团队、工作室、品牌内容组
- 痛点：多人共享标准不统一，内容迭代过程不可追踪

#### C. 专业型内容生产者
- 科普、教育、商业分析、行业研究
- 痛点：准确性、来源、结构化表达和版本管理要求高

### 5.2 核心场景
1. **选题决策场景**
   - 今天有多个选题候选，先判断做哪个
2. **内容策划场景**
   - 为一个选题建立内容项目，明确受众、平台、语气、目标产物
3. **资料整理场景**
   - 收纳来源、观点、事实、引用，避免下次重找
4. **AI 草稿场景**
   - 生成结构、标题、草稿、变体，但保留人工编辑空间
5. **内容资产沉淀场景**
   - 把项目沉淀为模板、素材包、角度库、prompt 库

---

## 6. 产品原则
1. **工作流优先，不是单点功能优先**
2. **管理与创作并重**：不是只生成，还要能组织、沉淀、检索
3. **AI 是加速器，不是黑盒替代者**
4. **内容必须有来源和上下文**
5. **输出可编辑、可复用、可追溯**
6. **先做创作者工作台，再考虑团队协作和发布系统**

---

## 7. 产品形态重构

### 7.1 正确的产品形态
Knowledge Studio 应该是一个 **内容创作与内容管理工具套件**，而不是单屏输入输出页。

### 7.2 核心模块
#### 模块 A：选题池 Topics Inbox
管理所有待做、已验证、已放弃、已完成的主题。

核心能力：
- 候选题录入
- 选题评分
- 标签与优先级
- 平台适配建议
- 从选题创建内容项目

#### 模块 B：内容项目 Content Projects
每个题不是一次生成，而是一个项目。

每个项目包含：
- 项目标题
- 目标受众
- 发布平台
- 目标产出（图文/短视频/口播/长文）
- 项目状态
- 截止时间 / 节奏状态

#### 模块 C：内容 Brief & Structure
围绕项目形成真正可执行的 brief：
- 核心观点
- 目标读者收益
- 表达角度
- 内容结构
- 不该说什么

#### 模块 D：资料与来源库 Sources / References
沉淀资料，而不是每次临时拼凑：
- 来源链接
- 摘录片段
- 核心事实
- 可引用观点
- 可信度状态

#### 模块 E：AI 创作工作台 AI Drafting
基于 brief 和资料生成：
- 标题变体
- 提纲变体
- 草稿
- 不同平台版本
- 不同语气版本

#### 模块 F：版本与编辑 Versions
内容不是一次成型：
- 保留多个生成版本
- 比较不同角度
- 标记采用版本
- 手动编辑与覆盖

#### 模块 G：模板与资产 Template Library
沉淀高价值资产：
- 标题模板
- 内容结构模板
- Prompt 模板
- 平台模板
- 已验证过的高表现角度

---

## 8. 信息架构

### 一级导航建议
1. **Dashboard**
   - 今天要推进的项目
   - 最近编辑
   - 待补资料
   - AI 生成记录

2. **Topics**
   - 候选选题池
   - 评分与排序
   - 状态：待评估 / 值得做 / 已立项 / 已放弃

3. **Projects**
   - 所有内容项目
   - 状态看板：Brief 中 / 资料中 / 草稿中 / 待发布 / 已完成

4. **Library**
   - Sources
   - Templates
   - Prompts
   - Angles

5. **AI Workspace**
   - 面向当前项目的一次或多次生成操作
   - Provider 配置
   - 生成历史

6. **Settings**
   - OpenAI-compatible provider
   - 默认平台模板
   - 默认语气与输出结构

---

## 9. 核心对象模型

### Topic
- id
- title
- problem / opportunity
- platform candidates
- score
- tags
- status
- created_at

### Project
- id
- topic_id
- title
- audience
- platform
- objective
- tone
- status
- due_date
- created_at
- updated_at

### Brief
- project_id
- core message
- user value
- angle
- outline
- guardrails

### Source
- id
- project_id
- title
- url
- excerpt
- evidence_level
- tags

### Draft
- id
- project_id
- type
- content
- provider
- model
- version
- created_at

### Template
- id
- category
- name
- content
- tags

---

## 10. 状态流转

### Topic 状态
- Inbox
- Scored
- Selected
- Archived

### Project 状态
- Drafting Brief
- Collecting Sources
- Generating Drafts
- Editing
- Ready to Publish
- Published
- Archived

### Draft 状态
- Generated
- Edited
- Selected
- Rejected

---

## 11. 核心用户流重构

### Flow 1：从选题到项目
候选题录入 → 评分 → 选中 → 创建项目

### Flow 2：从项目到可生成状态
填写 audience / platform / objective → 形成 brief → 补充资料与来源

### Flow 3：AI 辅助创作
选择生成类型（标题 / 提纲 / 草稿 / 平台改写）→ 调用 OpenAI-compatible 模型 → 返回多个版本

### Flow 4：内容沉淀
选中版本 → 手动编辑 → 保存到项目 → 提取成模板/资产

### Flow 5：项目闭环
项目完成后归档，并把高价值结构、角度、prompt 回流到 Library

---

## 12. MVP 范围（重构后）

### V0：真正的内容工作台 MVP
必须包含：
1. Topics 选题池
2. Projects 内容项目
3. Brief 生成与编辑
4. Sources 简易资料区
5. AI Draft 工作区（支持 OpenAI-compatible）
6. Draft 版本区
7. Template / Prompt 基础沉淀
8. local persistence

### V0 不做
- 团队实时协作
- 多平台自动发布
- 权限系统
- 复杂分析报表
- 资产审批流程

### V1
- 项目看板
- 导出 Markdown / 飞书 / Notion
- 多版本比较
- Prompt 模板管理
- 平台改写模板

### V2
- 团队协作
- 内容日历
- AI 工作流自动编排
- 多平台发布与复盘数据接回

---

## 13. 成功指标

### 核心行为指标
1. 用户每周创建的 Topic 数
2. Topic → Project 转化率
3. 每个 Project 的 AI 生成次数
4. 每个 Project 保存的版本数
5. Template / Prompt 复用率

### 结果指标
1. 从选题到可发布草稿的平均时间
2. 资料复用率
3. 项目完成率
4. 周活跃创作者数

---

## 14. 风险
1. 如果还是按“生成器页面”设计，产品会缺乏留存
2. 如果功能过多，第一版会再次变成空壳平台
3. 前端直连 API 不适合生产环境
4. 没有资料和模板沉淀，内容质量会波动很大
5. 如果不设计项目与版本层，管理工具属性无法成立

---

## 15. 验收标准
1. 产品主结构体现为“内容工作台”，而不是 landing page
2. 至少能管理 Topic、Project、Draft 三类核心对象
3. 用户能完成：
   - 录入候选题
   - 创建项目
   - 生成 brief
   - 调用 AI 生成草稿
   - 保存版本
4. OpenAI-compatible 配置为一等能力，不是外挂输入框
5. 本地状态可持久化
6. 文档、架构、UI 与“内容创作与管理工具”定位一致

---

## 16. 下一步设计约束
后续界面与技术实现都应围绕这个判断展开：

> Knowledge Studio 是内容创作者的工作台，不是一个“帮你临时生成一下”的网页。

这意味着下一版 UI / 代码都应该朝着：
- Dashboard
- Topics
- Projects
- Library
- AI Workspace
- Settings

这种产品结构演进，而不是继续堆叠模块化落地页区块。