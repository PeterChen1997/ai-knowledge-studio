# Knowledge Studio Implementation Plan

> **For Hermes:** Use this plan together with `docs/prd-breakdown.md`. Implement module-by-module, not page-by-page.

## Goal
把 Knowledge Studio 从“已经有导航的 app shell”推进成“每个模块都具备真实可用功能”的内容创作工作台。

## Phase 1 — Core workflow backbone
### Scope
1. Topics Inbox
2. Content Projects
3. Brief & Structure
4. Sources / References
5. AI Drafting 基础版本流

### Delivery standard
每个模块必须同时满足：
- 可输入
- 可编辑
- 可持久化
- 可跨模块联动
- 有测试覆盖核心状态变化

## Phase 2 — Versioning & Library
1. Draft selected / archive
2. Template editing
3. Library 分类浏览
4. Dashboard 数据联动

## Immediate next slice
### Slice 1
- 完成 Topics 的 tags / status / platformSuggestions
- 完成 Projects 的 status / dueDate
- 完成 Brief 的 outline / guardrails 编辑
- 完成 Sources 的新增 / 编辑 / 删除

### Slice 2
- AI Draft type selector (`title | outline | draft`)
- Draft 版本 selected 状态
- Library 资产视图增强

## Validation
- `npm test`
- `npm run build`
- browser QA for Topics / Projects / Settings / Library / AI Workspace
