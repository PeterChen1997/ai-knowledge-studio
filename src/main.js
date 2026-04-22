import {
  createIdeaAngles,
  createKnowledgePack,
  scoreTopics,
  summarizePack,
} from './knowledge-core.js';
import {
  generateKnowledgePackWithAPI,
  normalizeProviderConfig,
} from './ai-provider.js';
import { loadState, saveState } from './store.js';

const state = loadState();
const app = document.querySelector('#app');

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderHero(pack, provider) {
  return `
    <section class="panel hero-panel">
      <div>
        <p class="eyebrow">AI 知识生产工具</p>
        <h1>Knowledge Studio</h1>
        <p class="lead">把“想做一个垂直知识内容工具”收敛成今天就能用的 MVP：选题、角度、结构、素材清单、提示词蓝图，一次给你。</p>
        <div class="hero-pills">
          <span class="pill">选题排序</span>
          <span class="pill">内容结构</span>
          <span class="pill">Prompt 蓝图</span>
          <span class="pill">OpenAI Compatible Ready</span>
        </div>
      </div>
      <div class="hero-card">
        <p class="muted">当前内容 brief</p>
        <h2>${pack.title}</h2>
        <p>${pack.coreMessage}</p>
        <p class="summary">${summarizePack(pack)}</p>
        <div class="provider-chip ${provider.enabled ? 'connected' : 'disconnected'}">
          <strong>${provider.providerLabel}</strong>
          <span>${provider.enabled ? `已配置 ${provider.model}` : '未配置 API，当前使用本地规则版'}</span>
        </div>
      </div>
    </section>
  `;
}

function renderTopicScoring(rankedTopics) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Step 0</p>
          <h2>先判断哪个题最值得做</h2>
        </div>
        <p class="section-copy">把“搜索需求 / 权威缺口 / 分享性 / 竞争度”放到一个轻量排序里。</p>
      </div>
      <div class="two-col">
        <div class="form-card stack-card">
          <div class="mini-toolbar"><button type="button" id="add-topic">添加备选题</button></div>
          <div id="topic-list" class="stack-list">
            ${state.topics.map((item, index) => `
              <div class="topic-row">
                <input data-topic-field="topic" data-topic-index="${index}" value="${item.topic}" />
                <input data-topic-field="searchDemand" data-topic-index="${index}" type="number" min="1" max="5" value="${item.searchDemand}" />
                <input data-topic-field="authorityGap" data-topic-index="${index}" type="number" min="1" max="5" value="${item.authorityGap}" />
                <input data-topic-field="shareability" data-topic-index="${index}" type="number" min="1" max="5" value="${item.shareability}" />
                <input data-topic-field="competition" data-topic-index="${index}" type="number" min="1" max="5" value="${item.competition}" />
              </div>
            `).join('')}
          </div>
          <button type="button" id="recalculate-topics">重新排序选题</button>
        </div>
        <div class="result-card">
          <h3>推荐优先顺序</h3>
          <div class="ranking-list">
            ${rankedTopics.map((item, index) => `
              <article>
                <strong>#${index + 1} ${item.topic}</strong>
                <span>机会分：${item.score}</span>
              </article>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBriefForm(pack) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Step 1</p>
          <h2>输入一个内容 brief</h2>
        </div>
        <p class="section-copy">目标不是一次生成全部内容，而是先把选题、结构和素材准备正确。</p>
      </div>
      <div class="two-col">
        <form id="brief-form" class="form-card">
          <label>主题<input name="topic" value="${state.brief.topic}" /></label>
          <label>目标受众<input name="audience" value="${state.brief.audience}" /></label>
          <label>目标平台<input name="platform" value="${state.brief.platform}" /></label>
          <label>目标产出<input name="objective" value="${state.brief.objective}" /></label>
          <label>语气<input name="tone" value="${state.brief.tone}" /></label>
          <label>权威来源数量<input name="sourceCount" type="number" min="1" max="10" value="${state.brief.sourceCount}" /></label>
          <button type="submit">生成内容工作包</button>
        </form>
        <div class="result-card">
          <h3>内容结构</h3>
          <ol>${pack.sections.map((item) => `<li>${item}</li>`).join('')}</ol>
          <h4>素材准备</h4>
          <ul>${pack.checklist.map((item) => `<li>${item}</li>`).join('')}</ul>
        </div>
      </div>
    </section>
  `;
}

function renderProviderPanel(provider) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">API Extension</p>
          <h2>OpenAI Compatible 接入预留</h2>
        </div>
        <p class="section-copy">现在已经把 API 接入层独立出来了。你后续可以接 OpenAI、OpenRouter、硅基流动、One API 或任何兼容 `/chat/completions` 的服务。</p>
      </div>
      <div class="two-col">
        <form id="provider-form" class="form-card">
          <label>Provider 名称<input name="providerLabel" value="${state.provider.providerLabel}" /></label>
          <label>Base URL<input name="baseUrl" value="${state.provider.baseUrl}" placeholder="https://api.openai.com/v1" /></label>
          <label>API Key<input name="apiKey" type="password" value="${state.provider.apiKey}" placeholder="sk-..." /></label>
          <label>Model<input name="model" value="${state.provider.model}" placeholder="gpt-4.1-mini" /></label>
          <label>Chat Path<input name="chatPath" value="${state.provider.chatPath}" placeholder="/chat/completions" /></label>
          <button type="submit">保存 Provider 配置</button>
        </form>
        <div class="result-card api-card">
          <h3>当前状态</h3>
          <p>${provider.enabled ? '已具备真实 API 调用条件。' : '尚未配置完整，当前仍使用本地规则引擎。'}</p>
          <ul>
            <li>Base URL：${provider.baseUrl || '未配置'}</li>
            <li>Model：${provider.model || '未配置'}</li>
            <li>Endpoint：${provider.chatPath}</li>
          </ul>
          <div class="api-actions">
            <button type="button" id="generate-ai-draft">用 AI 生成增强版内容草案</button>
          </div>
          <p class="tiny-note">提示：API Key 会保存在你当前浏览器 localStorage，仅用于前端直连测试。后续生产环境建议改为后端代理。</p>
        </div>
      </div>
    </section>
  `;
}

function renderAngles(angles) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Step 2</p>
          <h2>从一个主题拆出多个传播角度</h2>
        </div>
      </div>
      <div class="angle-grid">
        ${angles.map((item) => `
          <article class="angle-card">
            <span class="angle-tag">${item.angle}</span>
            <h3>${item.headline}</h3>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPrompt(pack) {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Step 3</p>
          <h2>直接可用的 Prompt Blueprint</h2>
        </div>
      </div>
      <div class="two-col">
        <div class="result-card">
          <h3>Prompt</h3>
          <pre>${pack.promptBlueprint}</pre>
        </div>
        <div class="result-card">
          <h3>输出模板</h3>
          <div class="hero-pills">${pack.outputTemplates.map((item) => `<span class="pill">${item}</span>`).join('')}</div>
          <h4>合规提醒</h4>
          <ul>
            <li>必须标注来源，避免“专家说”式空泛引用</li>
            <li>医疗、教育、投资等领域避免绝对化承诺</li>
            <li>对不确定结论要保留边界和条件</li>
          </ul>
        </div>
      </div>
    </section>
  `;
}

function renderAiDraft() {
  const { status, content, error } = state.aiDraft;
  const statusText = status === 'loading' ? 'AI 正在生成中…' : status === 'success' ? '已生成增强版草案' : status === 'error' ? '生成失败' : '还没有生成 AI 草案';
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">AI Draft</p>
          <h2>增强版内容草案</h2>
        </div>
      </div>
      <div class="result-card">
        <p class="muted">${statusText}</p>
        ${error ? `<p class="error-text">${escapeHtml(error)}</p>` : ''}
        <pre>${escapeHtml(content || '配置好 OpenAI compatible provider 后，这里会出现真正由模型生成的增强版内容草案。')}</pre>
      </div>
    </section>
  `;
}

function render() {
  const pack = createKnowledgePack(state.brief);
  const rankedTopics = scoreTopics(state.topics);
  const angles = createIdeaAngles(state.brief.topic, state.brief.audience);
  const provider = normalizeProviderConfig(state.provider);

  app.innerHTML = `
    ${renderHero(pack, provider)}
    ${renderTopicScoring(rankedTopics)}
    ${renderBriefForm(pack)}
    ${renderProviderPanel(provider)}
    ${renderAngles(angles)}
    ${renderPrompt(pack)}
    ${renderAiDraft()}
  `;

  bindTopicEditor();
  bindBriefForm();
  bindProviderForm();
  bindAiDraft();
}

function bindBriefForm() {
  document.querySelector('#brief-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.brief = {
      topic: String(form.get('topic')).trim(),
      audience: String(form.get('audience')).trim(),
      platform: String(form.get('platform')).trim(),
      objective: String(form.get('objective')).trim(),
      tone: String(form.get('tone')).trim(),
      sourceCount: Number(form.get('sourceCount')),
    };
    saveState(state);
    render();
  });
}

function bindProviderForm() {
  document.querySelector('#provider-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.provider = {
      providerLabel: String(form.get('providerLabel')).trim(),
      baseUrl: String(form.get('baseUrl')).trim(),
      apiKey: String(form.get('apiKey')).trim(),
      model: String(form.get('model')).trim(),
      chatPath: String(form.get('chatPath')).trim(),
    };
    saveState(state);
    render();
  });
}

function bindTopicEditor() {
  document.querySelectorAll('[data-topic-field]').forEach((input) => {
    input.addEventListener('change', (event) => {
      const index = Number(event.target.dataset.topicIndex);
      const field = event.target.dataset.topicField;
      const raw = event.target.value;
      state.topics[index][field] = field === 'topic' ? raw : Number(raw);
      saveState(state);
    });
  });

  document.querySelector('#add-topic').addEventListener('click', () => {
    state.topics.push({ topic: '新的内容题', searchDemand: 3, authorityGap: 3, shareability: 3, competition: 3 });
    saveState(state);
    render();
  });

  document.querySelector('#recalculate-topics').addEventListener('click', () => {
    saveState(state);
    render();
  });
}

function bindAiDraft() {
  document.querySelector('#generate-ai-draft').addEventListener('click', async () => {
    state.aiDraft = { status: 'loading', content: '', error: '' };
    saveState(state);
    render();

    try {
      const content = await generateKnowledgePackWithAPI(state.provider, state.brief);
      state.aiDraft = { status: 'success', content, error: '' };
    } catch (error) {
      state.aiDraft = {
        status: 'error',
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    saveState(state);
    render();
  });
}

render();
