# Knowledge Studio PRD

> **For Hermes:** Treat this as a research-driven content creation and content management system. It is not a landing page, not a prompt toy, and not just a generator. The product must help users decide what is worth reading, what is worth turning into content, and how to think against the text instead of merely summarizing it.

## 1. 一句话产品定义
Knowledge Studio 是一套面向知识创作者与研究型内容团队的 **AI 驱动内容创作与管理工具**：它先替你做结构提炼、核心观点抽取与多角度分析，再把“值得深入的内容”转化成可管理、可创作、可复用的内容项目。

---

## 2. 新的产品判断
过去，人读书 / 读文章的流程往往是：
1. 自己先读
2. 自己先提炼
3. 自己判断值不值得继续投入
4. 自己再把它转成内容

现在这条路径正在反转：
- **结构提炼、内容总结、核心观点抽取**，越来越适合先交给 AI
- **人真正要投入精力的地方**，越来越转向：
  1. 以更低成本筛选什么值得自己真正深入
  2. 在与文本的碰撞中激发新的问题、新的联想、新的内部连接

所以这个产品不该只是“帮用户生成内容”，而应该先回答：

> **在 AI 已经能先做提炼的时代，人为什么还要读？**

答案是：
- 为了筛选值得投入的材料
- 为了形成自己的判断
- 为了在文本冲突中长出自己的问题和表达

这意味着 Knowledge Studio 的真正定位应该是：

> **面向知识创作者的阅读-思考-创作操作系统（Read → Think → Create OS）**

而不是单纯的内容生成器。

---

## 3. 参考 SnapRead / read-it-later 的启发
参考 `read-it-later` 这个产品，我提炼出三个对当前产品特别重要的启发：

### 启发 1：产品应该围绕主链路，而不是围绕功能点堆叠
SnapRead 的 MVP 主链路很清楚：
- Save URL
- 保留页面
- 本地阅读
- AI 摘要
- 在文章上下文中继续对话

对 Knowledge Studio 来说，也应该有同样清晰的主链路：
- 捕获来源内容
- AI 先做结构提炼
- 用户判断是否值得深入
- 对内容做多角度思辨
- 转化为内容项目
- 继续生成草稿与版本

### 启发 2：UI 命名应该是工作流命名，而不是功能命名
SnapRead 不是“Summary Page / Settings Page / Saved Page”，而是：
- Desk
- Reader
- Studio
- Vault
- Signals

Knowledge Studio 也不应该只是：
- 标题生成
- 提纲生成
- Prompt 区

而应该是：
- Inbox
- Reader
- Projects
- Library
- Studio

### 启发 3：AI 的价值要嵌在内容上下文里
SnapRead 不是单独开个 AI 页面，而是在 Reader 中把 AI Summary / Analysis / Chat 放进阅读上下文里。

Knowledge Studio 也应该这样：
- 不只是“生成内容包”
- 而是让 AI 成为阅读理解、反向思考、写作转化过程中的一层工作流能力

---

## 4. Product framing
- **Target user:** 持续做知识型内容输出的个人创作者、研究型账号、教育 / 科普 /商业分析内容团队
- **Core moment:** 用户今天看到几篇文章 / 一批资料，不确定哪些值得深入，也不确定该怎么把其中的价值转成自己的内容
- **Promise:** AI 先帮你提炼结构、观点与冲突，人把注意力放在判断、思辨、联想与表达上
- **Smallest useful version:** 内容捕获 + AI 提炼 + 正反角度分析 + 项目化创作管理
- **Biggest risk:** 如果继续把产品做成“生成一个内容包的页面”，会错失真正的留存价值：阅读判断与思辨沉淀

---

## 5. 产品目标
1. 帮用户快速筛选：哪些内容值得真正深入
2. 帮用户在阅读中形成自己的判断，而不是只接受 AI 总结
3. 帮用户把阅读结果转为可持续推进的内容项目
4. 把阅读、思考、创作、沉淀整合成一个统一工作流
5. 为 OpenAI-compatible 模型、资料库、版本系统、多平台输出提供扩展结构

---

## 6. 非目标
1. 不做通用稍后读工具
2. 不做通用知识库 / PKM 全家桶
3. 不做纯阅读器
4. 不做只会一键生成的“内容老虎机”
5. 不在第一版解决团队权限与自动发布的所有问题

---

## 7. 用户价值重构

### 7.1 用户为什么会来
因为用户有大量输入材料，但：
- 没时间逐篇精读
- 不知道哪些真正值得深挖
- 不想只看摘要，而是想形成自己的内容判断

### 7.2 用户为什么会留下
因为产品不是只“生成一次”，而是持续帮助用户：
- 维护阅读候选池
- 管理值得深入的来源
- 自动展示不同角度和反驳
- 把阅读沉淀成内容项目
- 复用已有的结构、模板和资料

---

## 8. 核心场景

### 场景 A：低成本筛选材料
用户导入文章 / 链接 / 摘录后，AI 先完成：
- 结构提炼
- 核心观点抽取
- 关键信号判断
- 值不值得深入的初步建议

### 场景 B：与文本碰撞，而不是只看摘要
对于思辨类文章，系统自动展示：
- 作者的核心主张
- 支撑证据
- 可能忽略的前提
- 对立角度
- 对这些角度的反驳路径
- 值得继续追问的问题

也就是一个 **“多角度分析与反驳模块”**，帮助用户正反思考。

### 场景 C：从阅读进入内容创作
用户从某篇材料一键创建内容项目：
- 这篇材料为什么值得写
- 面向谁写
- 在什么平台写
- 准备用什么角度写
- 需要补哪些资料

### 场景 D：内容资产沉淀
高质量的：
- 对立角度
- 反驳框架
- 内容结构
- 表达方式
- Prompt 模板

都能进入 Library，形成长期资产。

---

## 9. 产品形态
Knowledge Studio 应该是一个 **Research-to-Content Studio**，核心不是单一写作页，而是以下工作区：

### 9.1 Inbox
存放所有待判断的输入材料：
- URL
- 摘录
- 笔记
- 候选题

### 9.2 Reader
围绕单篇材料展开阅读与理解：
- 原文 / 摘录
- AI Summary
- Core Claims
- Signal / Worth Reading
- Counterview & Rebuttal
- Question Prompts

### 9.3 Projects
从值得做的材料进入项目：
- audience
- platform
- objective
- brief
- sources
- drafts
- versions

### 9.4 Library
沉淀：
- sources
- templates
- prompts
- angles
- rebuttal frameworks
- project outputs

### 9.5 Studio
管理：
- OpenAI-compatible provider
- 默认生成策略
- 阅读 / 分析偏好
- 导出与集成设置

---

## 10. Counterview & Rebuttal 模块（新增核心模块）
这是本次重构最关键的新增判断。

### 10.1 模块目标
帮助用户对思辨类文章进行正反思考，而不是被单一叙事带着走。

### 10.2 适用文章
- 观点型文章
- 商业分析
- 社会评论
- 哲学 / 心理 / 教育类思辨文章
- 高主张密度的长文

### 10.3 模块输出
对于一篇文章，自动展示：
1. **Main Claim** — 作者主张是什么
2. **Supporting Logic** — 作者如何支撑这个主张
3. **Hidden Assumptions** — 这篇文章依赖了哪些未明说前提
4. **Alternative Angles** — 还可以从哪些不同立场理解这件事
5. **Rebuttals** — 针对作者观点，可能的反驳与质疑路径
6. **Counter-Rebuttals** — 作者视角可能如何回应这些反驳
7. **Open Questions** — 这篇文章最值得继续追问的问题
8. **Content Opportunities** — 哪些角度适合发展成你自己的内容选题

### 10.4 用户价值
- 避免只接受“顺滑的 AI 总结”
- 帮用户真正形成判断
- 帮内容创作者找到“可写的冲突点”和“能展开的思辨点”
- 让 AI 不只是总结工具，而是思考加速器

### 10.5 与创作的连接
这个模块输出的每个角度和反驳，都可以：
- 一键加入项目 brief
- 一键加入 angle library
- 一键转成内容标题候选
- 一键转成短视频脚本框架

---

## 11. 信息架构

### 一级导航
1. **Dashboard**
   - 今日待读
   - 值得深入的材料
   - 活跃项目
   - 最近 AI 分析

2. **Inbox**
   - 所有输入材料
   - 待读 / 已判定 / 已转项目

3. **Reader**
   - Summary
   - Core Claims
   - Counterview & Rebuttal
   - Questions
   - Create Project

4. **Projects**
   - Brief
   - Sources
   - Drafts
   - Versions

5. **Library**
   - Sources
   - Templates
   - Prompts
   - Angles
   - Rebuttal Frameworks

6. **Studio**
   - Provider 配置
   - 模型选择
   - 生成偏好
   - 导出与集成

---

## 12. 核心对象模型

### InputItem
- id
- type (url / note / excerpt)
- title
- content / url
- tags
- status (inbox / reviewed / promoted / archived)
- created_at

### ReadingAnalysis
- input_id
- summary
- core_claims
- support_points
- hidden_assumptions
- alternative_angles
- rebuttals
- counter_rebuttals
- open_questions
- content_opportunities

### Project
- id
- source_input_id
- title
- audience
- platform
- objective
- tone
- status
- created_at
- updated_at

### Draft
- id
- project_id
- type
- content
- version
- provider
- model
- created_at

### Template
- id
- category
- name
- content
- tags

---

## 13. 核心用户流

### Flow 1：输入材料 → 判断值不值得深入
导入 URL / 摘录 → AI 提炼结构与核心观点 → 展示 worth-reading 信号 → 用户决定是否继续

### Flow 2：对思辨类材料进行正反思考
进入 Reader → 自动生成 Counterview & Rebuttal → 用户标记值得保留的角度 / 问题 / 反驳

### Flow 3：从 Reader 创建内容项目
从材料一键创建 Project → 把核心角度、反驳框架、开放问题带进 brief

### Flow 4：AI 辅助内容生产
在项目里生成：
- 标题
- 提纲
- 草稿
- 平台改写
- 多版本变体

### Flow 5：沉淀成内容资产
把优质：
- 角度
- 问题
- 反驳框架
- prompt
- 结构模板
沉淀到 Library

---

## 14. MVP 范围（重构后）

### V0 必须包含
1. Inbox 输入池
2. Reader 分析页
3. AI Summary
4. Counterview & Rebuttal 模块
5. Worth-reading 判断区
6. Create Project
7. Project 的基础 brief / draft / version
8. OpenAI-compatible provider 配置
9. local persistence

### V0 不做
- 多人实时协作
- 自动发布到平台
- 复杂权限系统
- 大型知识库检索
- 复盘统计报表

### V1
- Sources 资料管理增强
- Template / Rebuttal framework library
- 导出 Markdown / 飞书 / Notion
- 多项目看板

### V2
- 团队协作
- 发布工作流
- 更强的知识检索与 RAG
- 选题趋势自动发现

---

## 15. 成功指标

### 行为指标
1. 每周导入的材料数
2. Inbox → Project 转化率
3. Reader 中 Counterview 模块的使用率
4. 每个项目保存的 draft/version 数
5. 角度 / rebuttal framework 的复用率

### 结果指标
1. 从材料导入到项目创建的平均时间
2. 从项目创建到可发布草稿的平均时间
3. 用户主动保存的“值得深入材料”比例
4. 周活跃创作者数

---

## 16. 风险
1. 如果仍按生成器思路实现，会再次退化成 landing-page-like demo
2. 如果 Counterview 模块做得太泛，会变成空洞观点拼盘
3. 如果没有 Project / Draft / Library 层，管理价值无法成立
4. 前端直连 API 不适合正式生产
5. 需要控制第一版范围，先把 Reader → Project 主链路跑通

---

## 17. 验收标准
1. 产品主结构体现为“阅读-思考-创作工作台”，不是 section 展示页
2. 至少有 Inbox、Reader、Projects、Studio 四类工作区
3. 用户能完成：
   - 导入材料
   - 查看 AI 提炼
   - 查看 Counterview & Rebuttal
   - 从材料创建项目
   - 生成并保存草稿
4. OpenAI-compatible 接入是系统能力，不是外挂
5. 文档、对象模型、UI 和代码结构都服务于这条主链路

---

## 18. 下一步约束
下一版开发必须围绕这个原则：

> AI 先帮用户把文章“提炼出来”，但人真正要在产品里完成的是“判断”和“碰撞”。

所以 Knowledge Studio 的核心不是“帮你生成一个内容包”，而是：

> **帮你从阅读中长出自己的内容判断，并把这种判断沉淀成可复用的创作系统。**