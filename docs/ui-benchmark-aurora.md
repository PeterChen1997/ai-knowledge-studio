# Aurora 风格界面参考拆解（用于 Knowledge Studio）

## 1. 目的
这份文档用于把 Aurora 截图里的优秀工作台模式，迁移到 Knowledge Studio。

重点不是照抄视觉，而是提炼 4 层：
- 信息架构
- 视觉系统
- 组件系统
- 与当前 PRD 的映射关系

---

## 2. 可直接借鉴的核心结构

### A. 顶部状态栏
包含：
- 模型选择
- 工具能力状态（联网 / 插件）
- 当前项目进度
- 协作成员
- 协作入口
- 用户入口

### B. 左侧导航
分成三层：
1. 主行动作（新建）
2. 历史线程（今天 / 昨天 / 更早）
3. 工作区导航（Dashboard / Projects / Library / Settings）

### C. 中间主工作区
不是普通聊天区，而是：
- 当前线程标题
- 用户输入
- AI 结构化输出卡
- 输出后的对象操作（复制 / 导出 / 创建任务）
- 底部统一输入区

### D. 右侧上下文面板
统一作为 Context Stack：
- 文件预览
- 工具调用结果
- 日程与待办
- 知识引用

---

## 3. 对 Knowledge Studio 的映射

### 顶部栏
Knowledge Studio 顶栏应演化为：
- 当前 Space / 当前 Project
- Provider / Model
- 工具状态
- 进度状态
- 协作入口

### 左栏
Knowledge Studio 左栏应拆成：
- New Thread / New Project
- Recent Threads
- Spaces / Projects
- Core Modules

### 中间区
Knowledge Studio 中间区应从“页面 section 拼接”升级为：
- Thread
- Artifact Card
- Inline Actions
- Composer

### 右栏
Knowledge Studio 右栏应统一为：
- Sources
- Insights
- Tasks
- Related Knowledge

---

## 4. 视觉系统迁移建议

### 色彩
- 主色：紫色 / 蓝紫色
- 背景：白 + 浅灰
- 状态色：绿 / 红 / 黄

### 样式关键词
- 轻量 SaaS
- 高留白
- 弱边框
- 小圆角卡片
- 模块清晰但不过重

### 不建议照搬的点
- 不要把左侧导航信息塞得过满
- 不要让顶部状态栏过于拥挤
- 右侧上下文卡片要支持按需折叠

---

## 5. 组件清单

### 页面壳
- AppShell
- TopStatusBar
- LeftSidebar
- MainWorkspace
- RightContextPanel

### 左栏组件
- BrandBlock
- NewActionButton
- SearchField
- HistoryGroup
- NavGroup
- ProjectTree

### 中间区组件
- ThreadHeader
- UserMessage
- AssistantMessage
- ArtifactCard
- ArtifactActions
- PromptComposer
- CapabilityChips

### 右栏组件
- ContextCard
- FilePreviewCard
- InsightCard
- TaskCard
- KnowledgeReferenceCard

---

## 6. 与当前 PRD Slice 的关系

### Slice 1（已开始）
- Topics / Projects / Brief / Sources 的真实编辑能力
- 对应 Aurora 的“工作台结构基础”

### Slice 2（下一步）
应重点对齐 Aurora 的两个能力：
1. Artifact Card
   - AI 输出要更像对象，而不是纯文本块
2. Right Context Panel
   - 在当前项目中展示 source / insight / task / knowledge

### Slice 3
- 顶部状态栏增强
- Recent Threads
- 协作感与进度感

---

## 7. 结论
Aurora 这张图最值得借鉴的不是“好看”，而是这套工作台逻辑：

- 左边负责定位
- 中间负责创作
- 右边负责上下文
- 顶部负责状态与协作

Knowledge Studio 下一阶段应朝这个方向演化，而不是继续堆 section。
