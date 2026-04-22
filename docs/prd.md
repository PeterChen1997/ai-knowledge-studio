# Knowledge Studio PRD

> **For Hermes:** Use the ToC discovery/build workflow: keep the MVP focused on one repeatable creator moment.

## 产品定义
Knowledge Studio 是一个面向垂直内容创作者的 AI 知识生产工作台，用来把“我有一个主题”快速转成“可以继续生产的内容工作包”。

## Product framing
- Target user: 需要持续做垂直知识内容的独立创作者 / 产品内容团队 / 科普作者
- Core moment: 今天要做一个选题，但不想从空白文档开始
- Promise: 输入主题 brief，就能拿到可继续生产的标题、结构、角度、素材和 prompt
- Smallest useful version: 选题排序 + 内容工作包 + Prompt Blueprint
- Biggest risk: 如果试图直接做成全自动内容工厂，会在准确性和体验上同时失控

## 目标
1. 让用户从一个主题出发，在 3 分钟内拿到一套内容工作包
2. 帮用户先把“选题值不值得做”判断清楚
3. 把内容生产前置环节标准化，而不是替代最终创作

## 非目标
- 不直接接真实大模型 API
- 不自动生成最终发布内容
- 不做团队协作后台
- 不做素材管理系统

## 产品原则
1. 先做“策划工作包”，不做“最终内容黑盒生成”
2. 强调来源与合规，不只强调效率
3. 输出必须可编辑、可继续加工
4. 页面对创作者应像工作台，不像宣传页

## 核心用户流
### Flow 1：选题排序
输入候选主题 → 系统按需求/权威缺口/分享性/竞争度排序

### Flow 2：Brief 转内容包
输入主题、受众、平台、目标产出 → 输出标题、结构、素材清单

### Flow 3：角度拆解与 Prompt
基于主题生成多个角度和 Prompt Blueprint → 用户复制到后续 AI 工具继续生成

## 信息架构
- Hero
- 选题排序器
- Brief 表单
- 内容结构结果
- 角度拆解区
- Prompt Blueprint 区

## 状态模型
- 初始 demo 数据
- 用户编辑输入
- 前端规则生成输出
- localStorage 保留状态

## MVP 范围
### V0
- Topic scoring
- Knowledge pack generator
- Idea angles
- Prompt blueprint
- Local persistence
- Docs + tests + Pages

### V1
- 接入真实 LLM
- 导出 Markdown / Notion / 飞书文档
- 模板库
- 团队协作

## 成功指标
- 用户能快速理解“先做哪个题”
- 用户能拿到可复制使用的 prompt 和结构
- 刷新后状态不丢

## 验收标准
- 页面加载正常
- 无控制台错误
- 四个核心能力都能操作
- 测试通过
- GitHub Pages 可访问
