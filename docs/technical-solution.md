# Technical Solution

## Build target
- User-facing app type: Pages-first 单页内容工作台
- Primary user flow: 排序选题 → 输入 brief → 获取 pack → 复制 prompt
- State to persist: brief 与候选 topic 列表
- Core loop to prove: 前端规则 + 本地持久化足以验证价值
- Deployment target: GitHub Pages

## 技术方案
- 原生 ES Modules + Vite
- `src/knowledge-core.js`：纯业务逻辑
- `src/store.js`：本地状态持久化
- `src/main.js`：渲染和交互

## 核心模块
### knowledge-core
- `generateHook`
- `createIdeaAngles`
- `createKnowledgePack`
- `scoreTopics`
- `summarizePack`

## 测试策略
先写 failing tests，再实现：
1. hook 生成
2. knowledge pack 结构
3. 内容角度数量与样式
4. 选题排序逻辑
5. brief 摘要输出

## 扩展路径
- `createKnowledgePack` 可替换为 API adapter
- `scoreTopics` 后续可接真实搜索数据 / 社媒数据
- `store.js` 后续可换 Supabase / backend
