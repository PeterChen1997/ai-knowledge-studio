import {
  createIdeaAngles,
  createKnowledgePack,
  summarizePack,
} from './knowledge-core.js';
import {
  generateKnowledgePackWithAPI,
  normalizeProviderConfig,
} from './ai-provider.js';
import { loadState, saveState } from './store.js';
import {
  createBrief,
  createDraftVersion,
  createProjectFromTopic,
  createSource,
  createTemplate,
  createTopicCard,
  rankTopicCards,
  updateBriefRecord,
  updateProjectRecord,
  updateSourceRecord,
  updateTopicCard,
  removeSourceRecord,
} from './workspace-core.js';

const state = loadState();
const app = document.querySelector('#app');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getRankedTopics() {
  return rankTopicCards(state.topics);
}

function getActiveProject() {
  return state.projects.find((project) => project.id === state.navigation.activeProjectId) || state.projects[0] || null;
}

function getActiveTopic() {
  return state.topics.find((topic) => topic.id === state.navigation.activeTopicId) || getRankedTopics()[0] || null;
}

function getBriefForProject(projectId) {
  return state.briefs.find((brief) => brief.projectId === projectId) || null;
}

function getSourcesForProject(projectId) {
  return state.sources.filter((source) => source.projectId === projectId);
}

function getDraftsForProject(projectId) {
  return state.drafts
    .filter((draft) => draft.projectId === projectId)
    .sort((left, right) => right.version - left.version);
}

function getProvider() {
  return normalizeProviderConfig(state.settings.provider);
}

function getAiWorkspaceState(projectId) {
  if (!projectId) return { status: 'idle', content: '', error: '' };
  if (!state.aiWorkspace[projectId]) {
    state.aiWorkspace[projectId] = { status: 'idle', content: '', error: '' };
  }
  return state.aiWorkspace[projectId];
}

function buildProjectPack(project, brief) {
  return createKnowledgePack({
    topic: project.title,
    audience: project.audience,
    platform: project.platform,
    objective: project.objective,
    tone: project.tone,
    sourceCount: brief?.sourceCount || 3,
  });
}

function buildLocalDraft(project, brief) {
  const pack = buildProjectPack(project, brief);
  const angles = createIdeaAngles(project.title, project.audience);
  return [
    `标题建议：${pack.title}`,
    '',
    `核心表达：${pack.coreMessage}`,
    '',
    '结构：',
    ...pack.sections.map((item, index) => `${index + 1}. ${item}`),
    '',
    '传播角度：',
    ...angles.map((item) => `- ${item.angle}：${item.headline}`),
    '',
    '素材清单：',
    ...pack.checklist.map((item) => `- ${item}`),
    '',
    `Prompt Blueprint：${pack.promptBlueprint}`,
  ].join('\n');
}

function renderNav() {
  const items = [
    ['dashboard', 'Dashboard'],
    ['topics', 'Topics'],
    ['projects', 'Projects'],
    ['library', 'Library'],
    ['workspace', 'AI Workspace'],
    ['settings', 'Settings'],
  ];

  return `
    <aside class="sidebar panel">
      <div>
        <p class="eyebrow">Content OS</p>
        <h1 class="sidebar-title">Knowledge Studio</h1>
        <p class="muted">从 Topics → Projects → Drafts → Library 的完整工作台。</p>
      </div>
      <nav class="nav-stack">
        ${items.map(([key, label]) => `
          <button class="nav-pill ${state.navigation.activeView === key ? 'active' : ''}" data-nav="${key}">${label}</button>
        `).join('')}
      </nav>
      <div class="sidebar-foot muted">
        <p>当前项目：${escapeHtml(getActiveProject()?.title || '未选择')}</p>
        <p>已保存到本地浏览器</p>
      </div>
    </aside>
  `;
}

function renderTopbar() {
  const project = getActiveProject();
  const provider = getProvider();
  return `
    <section class="topbar panel">
      <div>
        <p class="eyebrow">Creatos Workspace</p>
        <h2>把内容生产从单页生成器，升级成可持续推进的工作台</h2>
        <p class="section-copy">今天先推进：<strong>${escapeHtml(project?.title || '未选择项目')}</strong></p>
      </div>
      <div class="topbar-meta">
        <div class="mini-stat">
          <span class="mini-label">Topics</span>
          <strong>${state.topics.length}</strong>
        </div>
        <div class="mini-stat">
          <span class="mini-label">Projects</span>
          <strong>${state.projects.length}</strong>
        </div>
        <div class="mini-stat ${provider.enabled ? 'ok' : ''}">
          <span class="mini-label">Provider</span>
          <strong>${provider.enabled ? escapeHtml(provider.model) : 'Local rules'}</strong>
        </div>
      </div>
    </section>
  `;
}

function renderDashboard() {
  const project = getActiveProject();
  const brief = project ? getBriefForProject(project.id) : null;
  const pack = project ? buildProjectPack(project, brief) : null;
  const rankedTopics = getRankedTopics();
  const drafts = project ? getDraftsForProject(project.id) : [];
  const sources = project ? getSourcesForProject(project.id) : [];

  return `
    <section class="panel page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h2>创作总览</h2>
        </div>
        <p class="section-copy">先看今天最值得推进的项目、选题和待补资料。</p>
      </div>
      <div class="dashboard-grid">
        <article class="hero-card">
          <p class="muted">当前项目</p>
          <h3>${escapeHtml(project?.title || '还没有项目')}</h3>
          <p>${escapeHtml(pack?.coreMessage || '先从 Topics 创建一个项目。')}</p>
          <p class="summary">${escapeHtml(pack ? summarizePack(pack) : '')}</p>
          <div class="chip-row">
            <span class="pill">${escapeHtml(project?.platform || '未设置平台')}</span>
            <span class="pill">${escapeHtml(project?.objective || '未设置产出')}</span>
            <span class="pill">${escapeHtml(project?.status || '未开始')}</span>
          </div>
        </article>
        <article class="result-card">
          <h3>本周最值得做</h3>
          <div class="ranking-list compact-list">
            ${rankedTopics.slice(0, 3).map((topic, index) => `
              <article>
                <strong>#${index + 1} ${escapeHtml(topic.title)}</strong>
                <span>机会分 ${topic.score}</span>
              </article>
            `).join('')}
          </div>
        </article>
        <article class="result-card">
          <h3>项目健康度</h3>
          <ul>
            <li>Brief：${brief ? '已建立' : '待补充'}</li>
            <li>资料条数：${sources.length}</li>
            <li>草稿版本：${drafts.length}</li>
          </ul>
        </article>
      </div>
    </section>
  `;
}
function renderTopics() {
  const rankedTopics = getRankedTopics();
  const activeTopic = getActiveTopic();
  return `
    <section class="panel page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Topics Inbox</p>
          <h2>先判断哪个题值得做，再立项</h2>
        </div>
        <div class="inline-actions">
          <button type="button" data-action="add-topic">添加选题</button>
        </div>
      </div>
      <div class="workspace-grid two-panel-layout">
        <div class="stack-list">
          ${rankedTopics.map((topic) => `
            <button class="list-card ${activeTopic?.id === topic.id ? 'selected' : ''}" data-action="select-topic" data-topic-id="${topic.id}">
              <div>
                <strong>${escapeHtml(topic.title)}</strong>
                <p class="muted">${escapeHtml(topic.problem)}</p>
                <p class="mini-tags">${topic.tags.map((tag) => `#${escapeHtml(tag)}`).join(' ')}</p>
              </div>
              <span>${escapeHtml(topic.status)} · ${topic.score}</span>
            </button>
          `).join('')}
        </div>
        <form class="form-card form-stack" id="topic-form">
          ${activeTopic ? `
            <input type="hidden" name="topicId" value="${activeTopic.id}" />
            <label>题目<input name="title" value="${escapeHtml(activeTopic.title)}" /></label>
            <label>为什么值得做<input name="problem" value="${escapeHtml(activeTopic.problem)}" /></label>
            <div class="metric-grid">
              <label>搜索需求<input type="number" min="1" max="5" name="searchDemand" value="${activeTopic.searchDemand}" /></label>
              <label>权威缺口<input type="number" min="1" max="5" name="authorityGap" value="${activeTopic.authorityGap}" /></label>
              <label>分享性<input type="number" min="1" max="5" name="shareability" value="${activeTopic.shareability}" /></label>
              <label>竞争度<input type="number" min="1" max="5" name="competition" value="${activeTopic.competition}" /></label>
            </div>
            <label>状态
              <select name="status">
                ${['inbox', 'scored', 'selected', 'archived'].map((status) => `<option value="${status}" ${activeTopic.status === status ? 'selected' : ''}>${status}</option>`).join('')}
              </select>
            </label>
            <label>标签（逗号或换行分隔）<textarea name="tagsText">${escapeHtml(activeTopic.tags.join('\n'))}</textarea></label>
            <label>平台建议（逗号或换行分隔）<textarea name="platformSuggestionsText">${escapeHtml(activeTopic.platformSuggestions.join('\n'))}</textarea></label>
            <div class="inline-actions">
              <button type="submit">保存选题</button>
              <button type="button" data-action="create-project-from-topic" data-topic-id="${activeTopic.id}">从这个题创建项目</button>
            </div>
          ` : '<p class="muted">先选择一个题目。</p>'}
        </form>
      </div>
    </section>
  `;
}

function renderProjects() {
  const activeProject = getActiveProject();
  const brief = activeProject ? getBriefForProject(activeProject.id) : null;
  const sources = activeProject ? getSourcesForProject(activeProject.id) : [];

  return `
    <section class="panel page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Projects</p>
          <h2>把一个题推进成真正的内容项目</h2>
        </div>
      </div>
      <div class="workspace-grid two-panel-layout">
        <div class="stack-list">
          ${state.projects.map((project) => `
            <button class="list-card ${activeProject?.id === project.id ? 'selected' : ''}" data-action="select-project" data-project-id="${project.id}">
              <div>
                <strong>${escapeHtml(project.title)}</strong>
                <p class="muted">${escapeHtml(project.platform)} · ${escapeHtml(project.objective)}</p>
                <p class="mini-tags">截止：${escapeHtml(project.dueDate || '未设置')}</p>
              </div>
              <span>${escapeHtml(project.status)}</span>
            </button>
          `).join('')}
        </div>
        <div class="detail-column">
          ${activeProject ? `
            <form class="form-card form-stack" id="project-form">
              <input type="hidden" name="projectId" value="${activeProject.id}" />
              <label>项目标题<input name="title" value="${escapeHtml(activeProject.title)}" /></label>
              <div class="metric-grid">
                <label>受众<input name="audience" value="${escapeHtml(activeProject.audience)}" /></label>
                <label>平台<input name="platform" value="${escapeHtml(activeProject.platform)}" /></label>
                <label>目标产出<input name="objective" value="${escapeHtml(activeProject.objective)}" /></label>
                <label>语气<input name="tone" value="${escapeHtml(activeProject.tone)}" /></label>
                <label>状态
                  <select name="status">
                    ${['brief', 'sources', 'drafting', 'editing', 'ready', 'archived'].map((status) => `<option value="${status}" ${activeProject.status === status ? 'selected' : ''}>${status}</option>`).join('')}
                  </select>
                </label>
                <label>截止日期<input type="date" name="dueDate" value="${escapeHtml(activeProject.dueDate || '')}" /></label>
              </div>
              <label>核心观点<textarea name="coreMessage">${escapeHtml(brief?.coreMessage || '')}</textarea></label>
              <label>用户收益<textarea name="userValue">${escapeHtml(brief?.userValue || '')}</textarea></label>
              <label>表达角度<input name="angle" value="${escapeHtml(brief?.angle || '')}" /></label>
              <label>内容结构（换行分隔）<textarea name="outlineText">${escapeHtml((brief?.outline || []).join('\n'))}</textarea></label>
              <label>Guardrails（换行分隔）<textarea name="guardrailsText">${escapeHtml((brief?.guardrails || []).join('\n'))}</textarea></label>
              <label>目标来源数<input type="number" min="1" max="20" name="sourceCount" value="${brief?.sourceCount || 3}" /></label>
              <button type="submit">保存项目 brief</button>
            </form>
            <div class="result-card">
              <div class="section-head tight">
                <div>
                  <h3>资料 Sources</h3>
                  <p class="muted">把证据、引用和摘录放在项目上下文里。</p>
                </div>
                <button type="button" data-action="add-source" data-project-id="${activeProject.id}">添加资料</button>
              </div>
              <div class="stack-list compact-stack">
                ${sources.map((source) => `
                  <form class="source-card form-stack source-form" data-source-form="${source.id}">
                    <input type="hidden" name="sourceId" value="${source.id}" />
                    <label>标题<input name="title" value="${escapeHtml(source.title)}" /></label>
                    <label>链接<input name="url" value="${escapeHtml(source.url || '')}" /></label>
                    <label>摘录<textarea name="excerpt">${escapeHtml(source.excerpt || '')}</textarea></label>
                    <label>可信度
                      <select name="evidenceLevel">
                        ${['low', 'medium', 'high'].map((level) => `<option value="${level}" ${source.evidenceLevel === level ? 'selected' : ''}>${level}</option>`).join('')}
                      </select>
                    </label>
                    <label>标签（逗号或换行分隔）<textarea name="tagsText">${escapeHtml((source.tags || []).join('\n'))}</textarea></label>
                    <div class="inline-actions">
                      <button type="submit">保存资料</button>
                      <button type="button" data-action="delete-source" data-source-id="${source.id}">删除</button>
                    </div>
                  </form>
                `).join('')}
              </div>
            </div>
          ` : '<p class="muted">先从 Topics 创建一个项目。</p>'}
        </div>
      </div>
    </section>
  `;
}

function renderLibrary() {
  const recentDrafts = [...state.drafts].sort((a, b) => b.version - a.version).slice(0, 6);
  const recentSources = [...state.sources].slice(0, 6);
  const angleCards = state.projects.slice(0, 4).flatMap((project) => createIdeaAngles(project.title, project.audience).slice(0, 2));
  return `
    <section class="panel page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Library</p>
          <h2>模板、资料、角度和草稿资产都沉淀在这里</h2>
        </div>
        <button type="button" data-action="add-template">添加模板</button>
      </div>
      <div class="workspace-grid three-panel-layout">
        <div class="result-card">
          <h3>模板库</h3>
          <div class="stack-list compact-stack">
            ${state.templates.map((template) => `
              <article class="library-card">
                <span class="angle-tag">${escapeHtml(template.category)}</span>
                <strong>${escapeHtml(template.name)}</strong>
                <p class="muted">${escapeHtml(template.content)}</p>
              </article>
            `).join('')}
          </div>
        </div>
        <div class="result-card">
          <h3>Sources</h3>
          <div class="stack-list compact-stack">
            ${recentSources.map((source) => `
              <article class="library-card">
                <strong>${escapeHtml(source.title)}</strong>
                <p class="muted">${escapeHtml(source.excerpt || '还没有摘录说明')}</p>
                <span class="source-level">${escapeHtml(source.evidenceLevel)}</span>
              </article>
            `).join('')}
          </div>
        </div>
        <div class="result-card">
          <h3>Angles & Drafts</h3>
          <div class="stack-list compact-stack">
            ${angleCards.map((angle) => `
              <article class="library-card">
                <span class="angle-tag">角度</span>
                <strong>${escapeHtml(angle.angle)}</strong>
                <p class="muted">${escapeHtml(angle.headline)}</p>
              </article>
            `).join('')}
            ${recentDrafts.map((draft) => `
              <article class="library-card">
                <span class="angle-tag">Draft V${draft.version}</span>
                <strong>${escapeHtml(draft.type)}</strong>
                <p class="muted">${escapeHtml(draft.content.slice(0, 90))}</p>
              </article>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderWorkspace() {
  const activeProject = getActiveProject();
  const provider = getProvider();
  const brief = activeProject ? getBriefForProject(activeProject.id) : null;
  const drafts = activeProject ? getDraftsForProject(activeProject.id) : [];
  const pack = activeProject ? buildProjectPack(activeProject, brief) : null;
  const workspaceState = getAiWorkspaceState(activeProject?.id);
  const { status, content, error } = workspaceState;
  const statusText = status === 'loading'
    ? 'AI 正在生成中…'
    : status === 'success'
      ? '已生成最新草稿'
      : status === 'error'
        ? '生成失败'
        : '还没有生成草稿';

  return `
    <section class="panel page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">AI Workspace</p>
          <h2>围绕当前项目继续生成、比较、留存版本</h2>
        </div>
      </div>
      <div class="workspace-grid three-panel-layout">
        <form id="provider-form" class="form-card form-stack">
          <h3>Provider</h3>
          <label>Provider 名称<input name="providerLabel" value="${escapeHtml(state.settings.provider.providerLabel)}" /></label>
          <label>Base URL<input name="baseUrl" value="${escapeHtml(state.settings.provider.baseUrl)}" /></label>
          <label>API Key<input name="apiKey" type="password" value="${escapeHtml(state.settings.provider.apiKey)}" /></label>
          <label>Model<input name="model" value="${escapeHtml(state.settings.provider.model)}" /></label>
          <label>Chat Path<input name="chatPath" value="${escapeHtml(state.settings.provider.chatPath)}" /></label>
          <button type="submit">保存 Provider 配置</button>
          <p class="tiny-note">${provider.enabled ? `当前将优先调用 ${escapeHtml(provider.model)}` : '未配置完整时，会回退到本地规则生成。'}</p>
        </form>
        <div class="result-card">
          <h3>当前项目草稿</h3>
          <p class="muted">${escapeHtml(activeProject?.title || '还没有项目')}</p>
          <p>${escapeHtml(pack?.promptBlueprint || '先创建项目，再生成草稿。')}</p>
          <div class="api-actions">
            <button type="button" data-action="generate-draft" ${activeProject ? '' : 'disabled'}>生成新草稿</button>
          </div>
          <p class="muted">${escapeHtml(statusText)}</p>
          ${error ? `<p class="error-text">${escapeHtml(error)}</p>` : ''}
          <pre>${escapeHtml(content || '生成后，这里会展示当前项目的最新草稿。')}</pre>
        </div>
        <div class="result-card">
          <h3>版本记录</h3>
          <div class="stack-list compact-stack">
            ${drafts.map((draft) => `
              <article class="library-card">
                <strong>${escapeHtml(draft.type)} · V${draft.version}</strong>
                <p class="muted">${escapeHtml(draft.providerLabel)} / ${escapeHtml(draft.model)}</p>
                <p>${escapeHtml(draft.content.slice(0, 120))}</p>
              </article>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="panel page-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Settings</p>
          <h2>工作台偏好</h2>
        </div>
      </div>
      <div class="workspace-grid two-panel-layout">
        <div class="result-card">
          <h3>默认创作偏好</h3>
          <ul>
            <li>默认平台：${escapeHtml(state.settings.defaults?.platform || '未设置')}</li>
            <li>默认产出：${escapeHtml(state.settings.defaults?.objective || '未设置')}</li>
            <li>默认语气：${escapeHtml(state.settings.defaults?.tone || '未设置')}</li>
          </ul>
          <p class="muted">Provider 配置放在 AI Workspace 里，方便一边改配置一边直接生成草稿。</p>
        </div>
        <form class="form-card form-stack" id="defaults-form">
          <h3>更新默认值</h3>
          <label>默认平台<input name="platform" value="${escapeHtml(state.settings.defaults?.platform || '')}" /></label>
          <label>默认产出<input name="objective" value="${escapeHtml(state.settings.defaults?.objective || '')}" /></label>
          <label>默认语气<input name="tone" value="${escapeHtml(state.settings.defaults?.tone || '')}" /></label>
          <button type="submit">保存默认偏好</button>
          <button type="button" data-action="reset-workspace">重置本地工作台</button>
        </form>
      </div>
    </section>
  `;
}

function renderActiveView() {
  switch (state.navigation.activeView) {
    case 'topics':
      return renderTopics();
    case 'projects':
      return renderProjects();
    case 'library':
      return renderLibrary();
    case 'workspace':
      return renderWorkspace();
    case 'settings':
      return renderSettings();
    case 'dashboard':
    default:
      return renderDashboard();
  }
}

function render() {
  app.innerHTML = `
    <div class="layout-shell">
      ${renderNav()}
      <div class="content-shell">
        ${renderTopbar()}
        ${renderActiveView()}
      </div>
    </div>
  `;

  bindEvents();
}

function updateTopic(topicId, updates) {
  const index = state.topics.findIndex((item) => item.id === topicId);
  if (index < 0) return;
  state.topics[index] = updateTopicCard(state.topics[index], updates);
  saveState(state);
  render();
}

function selectProject(projectId) {
  state.navigation.activeProjectId = projectId;
  state.navigation.activeView = 'projects';
  saveState(state);
  render();
}

function addProjectFromTopic(topicId) {
  const topic = state.topics.find((item) => item.id === topicId);
  if (!topic) return;
  const project = createProjectFromTopic(topic, {
    audience: state.briefDraft.audience,
    platform: state.settings.defaults?.platform || state.briefDraft.platform,
    objective: state.settings.defaults?.objective || state.briefDraft.objective,
    tone: state.settings.defaults?.tone || state.briefDraft.tone,
  });
  const brief = createBrief(project, { sourceCount: state.briefDraft.sourceCount });
  state.projects.unshift(project);
  state.briefs = state.briefs.filter((item) => item.projectId !== project.id);
  state.briefs.unshift(brief);
  state.aiWorkspace[project.id] = { status: 'idle', content: '', error: '' };
  topic.status = 'selected';
  state.navigation.activeProjectId = project.id;
  state.navigation.activeView = 'projects';
  saveState(state);
  render();
}

async function generateDraft() {
  const project = getActiveProject();
  const brief = project ? getBriefForProject(project.id) : null;
  if (!project || !brief) return;

  state.aiWorkspace[project.id] = { status: 'loading', content: '', error: '' };
  saveState(state);
  render();

  try {
    const provider = getProvider();
    const content = provider.enabled
      ? await generateKnowledgePackWithAPI(provider, {
        topic: project.title,
        audience: project.audience,
        platform: project.platform,
        objective: project.objective,
        tone: project.tone,
        sourceCount: brief.sourceCount,
      })
      : buildLocalDraft(project, brief);

    state.aiWorkspace[project.id] = { status: 'success', content, error: '' };
    const draft = createDraftVersion(state.drafts, {
      projectId: project.id,
      type: 'draft',
      content,
      providerLabel: provider.enabled ? provider.providerLabel : 'Local Rules',
      model: provider.enabled ? provider.model : 'built-in',
      status: 'candidate',
    });
    state.drafts.unshift(draft);
  } catch (error) {
    state.aiWorkspace[project.id] = {
      status: 'error',
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  saveState(state);
  render();
}

function bindEvents() {
  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      state.navigation.activeView = button.dataset.nav;
      saveState(state);
      render();
    });
  });

  document.querySelectorAll('[data-action="select-topic"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.navigation.activeTopicId = button.dataset.topicId;
      saveState(state);
      render();
    });
  });

  const topicForm = document.querySelector('#topic-form');
  if (topicForm) {
    topicForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      updateTopic(String(form.get('topicId')), Object.fromEntries(form.entries()));
    });
  }

  document.querySelectorAll('[data-action="select-project"]').forEach((button) => {
    button.addEventListener('click', () => selectProject(button.dataset.projectId));
  });

  document.querySelectorAll('[data-action="create-project-from-topic"]').forEach((button) => {
    button.addEventListener('click', () => addProjectFromTopic(button.dataset.topicId));
  });

  document.querySelectorAll('[data-action="add-topic"]').forEach((button) => {
    button.addEventListener('click', () => {
      const topic = createTopicCard({ status: 'inbox' });
      state.topics.unshift(topic);
      state.navigation.activeTopicId = topic.id;
      saveState(state);
      render();
    });
  });

  document.querySelectorAll('[data-action="add-source"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.sources.unshift(createSource(button.dataset.projectId, { title: '新的资料条目', excerpt: '补一句：这条资料能支持哪个判断？' }));
      saveState(state);
      render();
    });
  });

  document.querySelectorAll('[data-action="add-template"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.templates.unshift(createTemplate({ category: 'prompt', name: '新的模板', content: '把一套高频可复用的表达留在这里。', tags: ['new'] }));
      saveState(state);
      render();
    });
  });

  const providerForm = document.querySelector('#provider-form');
  if (providerForm) {
    providerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      state.settings.provider = {
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

  const defaultsForm = document.querySelector('#defaults-form');
  if (defaultsForm) {
    defaultsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      state.settings.defaults = {
        platform: String(form.get('platform')).trim(),
        objective: String(form.get('objective')).trim(),
        tone: String(form.get('tone')).trim(),
      };
      saveState(state);
      render();
    });
  }

  const projectForm = document.querySelector('#project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const projectId = String(form.get('projectId'));
      const projectIndex = state.projects.findIndex((item) => item.id === projectId);
      if (projectIndex < 0) return;

      state.projects[projectIndex] = updateProjectRecord(state.projects[projectIndex], Object.fromEntries(form.entries()));
      const currentBrief = getBriefForProject(projectId) || createBrief(state.projects[projectIndex], {});
      const nextBrief = updateBriefRecord(currentBrief, Object.fromEntries(form.entries()));
      state.briefs = state.briefs.filter((item) => item.projectId !== projectId);
      state.briefs.unshift(nextBrief);
      saveState(state);
      render();
    });
  }

  document.querySelectorAll('[data-source-form]').forEach((formEl) => {
    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const sourceId = String(form.get('sourceId'));
      const sourceIndex = state.sources.findIndex((item) => item.id === sourceId);
      if (sourceIndex < 0) return;
      state.sources[sourceIndex] = updateSourceRecord(state.sources[sourceIndex], Object.fromEntries(form.entries()));
      saveState(state);
      render();
    });
  });

  document.querySelectorAll('[data-action="delete-source"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.sources = removeSourceRecord(state.sources, button.dataset.sourceId);
      saveState(state);
      render();
    });
  });

  document.querySelectorAll('[data-action="generate-draft"]').forEach((button) => {
    button.addEventListener('click', () => {
      generateDraft();
    });
  });

  document.querySelectorAll('[data-action="reset-workspace"]').forEach((button) => {
    button.addEventListener('click', () => {
      localStorage.removeItem('ai-knowledge-studio');
      window.location.reload();
    });
  });
}

render();
