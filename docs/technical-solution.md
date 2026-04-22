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
- `src/ai-provider.js`：OpenAI-compatible API 适配层
- `src/store.js`：本地状态持久化
- `src/main.js`：渲染和交互

## API 扩展点
当前已预留 OpenAI-compatible 接口层：
- Provider config 标准字段：`baseUrl` / `apiKey` / `model` / `chatPath`
- 请求协议：`POST {baseUrl}{chatPath}`
- 响应解析：`choices[0].message.content`
- 前端暂时直连，生产版应迁移为后端代理

这意味着后续可以无痛接入 OpenAI、OpenRouter、硅基流动或自建兼容网关。

## 核心模块
### knowledge-core
- `generateHook`
- `createIdeaAngles`
- `createKnowledgePack`
- `scoreTopics`
- `summarizePack`

### ai-provider
- `normalizeProviderConfig`
- `createKnowledgeMessages`
- `buildChatRequest`
- `parseOpenAICompatibleResponse`
- `generateKnowledgePackWithAPI`

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
