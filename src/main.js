import { createIdeaAngles, createKnowledgePack, scoreTopics, summarizePack } from './knowledge-core.js';
import { loadState, saveState } from './store.js';

const state = loadState();
const app = document.querySelector('#app');

function renderHero(pack) {
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
          <span class="pill">平台合规提醒</span>
        </div>
      </div>
      <div class="hero-card">
        <p class="muted">当前内容 brief</p>
        <h2>${pack.title}</h2>
        <p>${pack.coreMessage}</p>
        <p class="summary">${summarizePack(pack)}</p>
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

function render() {
  const pack = createKnowledgePack(state.brief);
  const rankedTopics = scoreTopics(state.topics);
  const angles = createIdeaAngles(state.brief.topic, state.brief.audience);

  app.innerHTML = `
    ${renderHero(pack)}
    ${renderTopicScoring(rankedTopics)}
    ${renderBriefForm(pack)}
    ${renderAngles(angles)}
    ${renderPrompt(pack)}
  `;

  bindTopicEditor();
  bindBriefForm();
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

render();
