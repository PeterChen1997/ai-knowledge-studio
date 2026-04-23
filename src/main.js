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
  removeSourceRecord,
  updateBriefRecord,
  updateProjectRecord,
  updateSourceRecord,
  updateTopicCard,
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

function getProvider() {
  return normalizeProviderConfig(state.settings.provider);
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

function renderHeader() {
  const provider = getProvider();
  const activeProject = getActiveProject();
  const collaboration = state.collaboration;
  const members = collaboration.teamMembers || [];

  return `
    <header class="top-header">
      <div class="brand-block">
        <div class="brand-logo">✦</div>
        <div>
          <strong>Aurora</strong>
          <p>AI 助手工作台</p>
        </div>
      </div>
      <div class="header-controls">
        <button class="header-chip model-chip">
          <span>${escapeHtml(provider.model || 'GPT-4.1')}</span>
          <em>Pro</em>
        </button>
        <button class="header-chip">
          联网搜索
          <small>已启用</small>
        </button>
        <button class="header-chip">
          插件中心
          <span class="chip-badge">8</span>
        </button>
      </div>
      <div class="header-progress">
        <div>
          <p>项目进度：${escapeHtml(collaboration.currentProjectLabel || activeProject?.title || '当前项目')}</p>
          <div class="progress-track"><div class="progress-fill" style="width:${collaboration.progressPercent || 0}%"></div></div>
        </div>
        <strong>${collaboration.progressPercent || 0}%</strong>
      </div>
      <div class="header-side">
        <div class="avatar-stack">
          ${members.map((member) => `<span class="avatar-dot">${escapeHtml(member.slice(0, 1))}</span>`).join('')}
          <span class="avatar-more">+${collaboration.extraCount || 0}</span>
        </div>
        <button class="primary-action small">协作空间</button>
        <button class="icon-button">🔔</button>
        <div class="profile-pill">林深</div>
      </div>
    </header>
  `;
}

function renderSidebar() {
  const navItems = [
    ['dashboard', '仪表盘'],
    ['projects', '项目空间'],
    ['library', '知识库'],
    ['workspace', '数据分析'],
    ['topics', '选题池'],
    ['settings', '设置中心'],
  ];

  const historyGroups = [
    ['今天', state.recentThreads.today || []],
    ['昨天', state.recentThreads.yesterday || []],
    ['更早', state.recentThreads.earlier || []],
  ];

  return `
    <aside class="workspace-sidebar">
      <button class="primary-action full-width" data-action="new-thread">新建对话</button>
      <label class="search-box">
        <span>⌕</span>
        <input type="text" placeholder="搜索对话" disabled />
      </label>

      <section class="sidebar-section">
        <div class="sidebar-title-row">
          <h3>会话历史</h3>
        </div>
        ${historyGroups.map(([label, items]) => `
          <div class="history-group">
            <p class="group-label">${label}</p>
            ${items.map((item, index) => `
              <button class="history-item ${(index === 0 && label === '今天') ? 'selected' : ''}">
                <div>
                  <strong>${escapeHtml(item.title)}</strong>
                </div>
                <span>${escapeHtml(item.time)}</span>
              </button>
            `).join('')}
          </div>
        `).join('')}
      </section>

      <section class="sidebar-section">
        <div class="sidebar-title-row">
          <h3>工作区导航</h3>
        </div>
        <nav class="workspace-nav-list">
          ${navItems.map(([key, label]) => `
            <button class="workspace-nav-item ${state.navigation.activeView === key ? 'selected' : ''}" data-nav="${key}">${label}</button>
          `).join('')}
        </nav>
        <div class="project-tree">
          <p class="group-label">项目空间</p>
          ${state.projects.map((project) => `
            <button class="project-tree-item ${getActiveProject()?.id === project.id ? 'selected' : ''}" data-action="select-project-tree" data-project-id="${project.id}">
              ${escapeHtml(project.title)}
            </button>
          `).join('')}
        </div>
      </section>
    </aside>
  `;
}

function renderDashboardView() {
  const project = getActiveProject();
  const brief = project ? getBriefForProject(project.id) : null;
  const pack = project ? buildProjectPack(project, brief) : null;
  const rankedTopics = getRankedTopics();
  const drafts = project ? getDraftsForProject(project.id) : [];
  const sources = project ? getSourcesForProject(project.id) : [];

  return `
    <div class="module-grid dashboard-view">
      <article class="artifact-card highlight-card">
        <div class="artifact-meta">当前项目 / ${escapeHtml(project?.status || 'brief')}</div>
        <h3>${escapeHtml(project?.title || '还没有项目')}</h3>
        <p>${escapeHtml(pack?.coreMessage || '先从 Topics 创建一个项目。')}</p>
        <p class="artifact-summary">${escapeHtml(pack ? summarizePack(pack) : '')}</p>
        <div class="token-row">
          <span class="soft-token">${escapeHtml(project?.platform || '未设置平台')}</span>
          <span class="soft-token">${escapeHtml(project?.objective || '未设置产出')}</span>
          <span class="soft-token">草稿 ${drafts.length}</span>
        </div>
      </article>
      <article class="artifact-card compact-panel">
        <h3>本周最值得做</h3>
        <div class="metric-list">
          ${rankedTopics.slice(0, 3).map((topic, index) => `
            <div class="metric-item">
              <div>
                <strong>#${index + 1} ${escapeHtml(topic.title)}</strong>
                <p>${escapeHtml(topic.problem)}</p>
              </div>
              <span>${topic.score}</span>
            </div>
          `).join('')}
        </div>
      </article>
      <article class="artifact-card compact-panel">
        <h3>项目健康度</h3>
        <ul class="status-list">
          <li><span>Brief</span><strong>${brief ? '已建立' : '待补充'}</strong></li>
          <li><span>资料条数</span><strong>${sources.length}</strong></li>
          <li><span>草稿版本</span><strong>${drafts.length}</strong></li>
        </ul>
      </article>
    </div>
  `;
}

function renderTopicsView() {
  const rankedTopics = getRankedTopics();
  const activeTopic = getActiveTopic();

  return `
    <div class="module-grid split-grid">
      <section class="artifact-card list-panel">
        <div class="panel-header-row">
          <div>
            <div class="artifact-meta">Topics Inbox</div>
            <h3>候选选题池</h3>
          </div>
          <button class="secondary-action" data-action="add-topic">添加选题</button>
        </div>
        <div class="topic-list">
          ${rankedTopics.map((topic) => `
            <button class="topic-list-item ${activeTopic?.id === topic.id ? 'selected' : ''}" data-action="select-topic" data-topic-id="${topic.id}">
              <div>
                <strong>${escapeHtml(topic.title)}</strong>
                <p>${escapeHtml(topic.problem)}</p>
                <small>${topic.tags.map((tag) => `#${escapeHtml(tag)}`).join(' ')}</small>
              </div>
              <span>${escapeHtml(topic.status)} · ${topic.score}</span>
            </button>
          `).join('')}
        </div>
      </section>
      <form class="artifact-card editor-panel" id="topic-form">
        ${activeTopic ? `
          <input type="hidden" name="topicId" value="${activeTopic.id}" />
          <div class="panel-header-row">
            <div>
              <div class="artifact-meta">Topic Editor</div>
              <h3>${escapeHtml(activeTopic.title)}</h3>
            </div>
            <button type="button" class="secondary-action" data-action="create-project-from-topic" data-topic-id="${activeTopic.id}">立项</button>
          </div>
          <label>题目<input name="title" value="${escapeHtml(activeTopic.title)}" /></label>
          <label>机会描述<textarea name="problem">${escapeHtml(activeTopic.problem)}</textarea></label>
          <div class="form-grid">
            <label>搜索需求<input type="number" min="1" max="5" name="searchDemand" value="${activeTopic.searchDemand}" /></label>
            <label>权威缺口<input type="number" min="1" max="5" name="authorityGap" value="${activeTopic.authorityGap}" /></label>
            <label>分享性<input type="number" min="1" max="5" name="shareability" value="${activeTopic.shareability}" /></label>
            <label>竞争度<input type="number" min="1" max="5" name="competition" value="${activeTopic.competition}" /></label>
          </div>
          <div class="form-grid two-column">
            <label>状态
              <select name="status">
                ${['inbox', 'scored', 'selected', 'archived'].map((status) => `<option value="${status}" ${activeTopic.status === status ? 'selected' : ''}>${status}</option>`).join('')}
              </select>
            </label>
            <div class="info-chip-box">
              <span class="info-chip">平台建议 ${activeTopic.platformSuggestions.length}</span>
            </div>
          </div>
          <label>标签（逗号或换行分隔）<textarea name="tagsText">${escapeHtml(activeTopic.tags.join('\n'))}</textarea></label>
          <label>平台建议（逗号或换行分隔）<textarea name="platformSuggestionsText">${escapeHtml(activeTopic.platformSuggestions.join('\n'))}</textarea></label>
          <button type="submit" class="primary-action">保存选题</button>
        ` : '<p class="empty-state">先选择一个题目。</p>'}
      </form>
    </div>
  `;
}

function renderProjectsView() {
  const activeProject = getActiveProject();
  const brief = activeProject ? getBriefForProject(activeProject.id) : null;
  const sources = activeProject ? getSourcesForProject(activeProject.id) : [];

  return `
    <div class="module-grid split-grid">
      <section class="artifact-card list-panel">
        <div class="panel-header-row">
          <div>
            <div class="artifact-meta">Project Spaces</div>
            <h3>项目列表</h3>
          </div>
        </div>
        <div class="topic-list">
          ${state.projects.map((project) => `
            <button class="topic-list-item ${activeProject?.id === project.id ? 'selected' : ''}" data-action="select-project" data-project-id="${project.id}">
              <div>
                <strong>${escapeHtml(project.title)}</strong>
                <p>${escapeHtml(project.platform)} · ${escapeHtml(project.objective)}</p>
                <small>截止：${escapeHtml(project.dueDate || '未设置')}</small>
              </div>
              <span>${escapeHtml(project.status)}</span>
            </button>
          `).join('')}
        </div>
      </section>
      <div class="project-workspace">
        <form class="artifact-card editor-panel" id="project-form">
          ${activeProject ? `
            <input type="hidden" name="projectId" value="${activeProject.id}" />
            <div class="panel-header-row">
              <div>
                <div class="artifact-meta">Project Brief</div>
                <h3>${escapeHtml(activeProject.title)}</h3>
              </div>
              <span class="soft-token">${escapeHtml(activeProject.status)}</span>
            </div>
            <div class="form-grid">
              <label>项目标题<input name="title" value="${escapeHtml(activeProject.title)}" /></label>
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
              <label>目标来源数<input type="number" min="1" max="20" name="sourceCount" value="${brief?.sourceCount || 3}" /></label>
            </div>
            <label>核心观点<textarea name="coreMessage">${escapeHtml(brief?.coreMessage || '')}</textarea></label>
            <label>用户收益<textarea name="userValue">${escapeHtml(brief?.userValue || '')}</textarea></label>
            <label>表达角度<input name="angle" value="${escapeHtml(brief?.angle || '')}" /></label>
            <label>内容结构（换行分隔）<textarea name="outlineText">${escapeHtml((brief?.outline || []).join('\n'))}</textarea></label>
            <label>Guardrails（换行分隔）<textarea name="guardrailsText">${escapeHtml((brief?.guardrails || []).join('\n'))}</textarea></label>
            <button type="submit" class="primary-action">保存项目 brief</button>
          ` : '<p class="empty-state">先从 Topics 创建一个项目。</p>'}
        </form>
        <section class="artifact-card compact-panel">
          <div class="panel-header-row">
            <div>
              <div class="artifact-meta">Sources</div>
              <h3>项目资料</h3>
            </div>
            ${activeProject ? `<button class="secondary-action" data-action="add-source" data-project-id="${activeProject.id}">添加资料</button>` : ''}
          </div>
          <div class="source-stack">
            ${sources.map((source) => `
              <form class="source-form" data-source-form="${source.id}">
                <input type="hidden" name="sourceId" value="${source.id}" />
                <label>标题<input name="title" value="${escapeHtml(source.title)}" /></label>
                <label>链接<input name="url" value="${escapeHtml(source.url || '')}" /></label>
                <label>摘录<textarea name="excerpt">${escapeHtml(source.excerpt || '')}</textarea></label>
                <div class="form-grid two-column">
                  <label>可信度
                    <select name="evidenceLevel">
                      ${['low', 'medium', 'high'].map((level) => `<option value="${level}" ${source.evidenceLevel === level ? 'selected' : ''}>${level}</option>`).join('')}
                    </select>
                  </label>
                  <label>标签<textarea name="tagsText">${escapeHtml((source.tags || []).join('\n'))}</textarea></label>
                </div>
                <div class="inline-actions">
                  <button type="submit" class="secondary-action">保存资料</button>
                  <button type="button" class="ghost-action" data-action="delete-source" data-source-id="${source.id}">删除</button>
                </div>
              </form>
            `).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderLibraryView() {
  const recentDrafts = state.drafts.slice(0, 4);
  const recentSources = state.sources.slice(0, 4);
  const angles = state.projects.slice(0, 3).flatMap((project) => createIdeaAngles(project.title, project.audience).slice(0, 2));

  return `
    <div class="module-grid triple-grid">
      <section class="artifact-card compact-panel">
        <div class="artifact-meta">Templates</div>
        <h3>模板库</h3>
        <div class="stack-group">
          ${state.templates.map((template) => `
            <article class="library-item">
              <span class="soft-token small">${escapeHtml(template.category)}</span>
              <strong>${escapeHtml(template.name)}</strong>
              <p>${escapeHtml(template.content)}</p>
            </article>
          `).join('')}
        </div>
      </section>
      <section class="artifact-card compact-panel">
        <div class="artifact-meta">Sources</div>
        <h3>资料资产</h3>
        <div class="stack-group">
          ${recentSources.map((source) => `
            <article class="library-item">
              <strong>${escapeHtml(source.title)}</strong>
              <p>${escapeHtml(source.excerpt || '暂无摘录')}</p>
              <span class="soft-token small">${escapeHtml(source.evidenceLevel)}</span>
            </article>
          `).join('')}
        </div>
      </section>
      <section class="artifact-card compact-panel">
        <div class="artifact-meta">Angles & Drafts</div>
        <h3>角度与草稿</h3>
        <div class="stack-group">
          ${angles.map((angle) => `
            <article class="library-item">
              <span class="soft-token small">角度</span>
              <strong>${escapeHtml(angle.angle)}</strong>
              <p>${escapeHtml(angle.headline)}</p>
            </article>
          `).join('')}
          ${recentDrafts.map((draft) => `
            <article class="library-item">
              <span class="soft-token small">${escapeHtml(draft.type)} V${draft.version}</span>
              <p>${escapeHtml(draft.content.slice(0, 120))}</p>
            </article>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderWorkspaceView() {
  const activeProject = getActiveProject();
  const brief = activeProject ? getBriefForProject(activeProject.id) : null;
  const provider = getProvider();
  const drafts = activeProject ? getDraftsForProject(activeProject.id) : [];
  const workspaceState = getAiWorkspaceState(activeProject?.id);
  const pack = activeProject ? buildProjectPack(activeProject, brief) : null;
  const statusText = workspaceState.status === 'loading'
    ? 'AI 正在生成中…'
    : workspaceState.status === 'success'
      ? '已生成最新草稿'
      : workspaceState.status === 'error'
        ? '生成失败'
        : '还没有生成草稿';

  return `
    <div class="module-grid split-grid">
      <form class="artifact-card compact-panel" id="provider-form">
        <div class="artifact-meta">Model & Tools</div>
        <h3>Provider 配置</h3>
        <label>Provider 名称<input name="providerLabel" value="${escapeHtml(state.settings.provider.providerLabel)}" /></label>
        <label>Base URL<input name="baseUrl" value="${escapeHtml(state.settings.provider.baseUrl)}" /></label>
        <label>API Key<input name="apiKey" type="password" value="${escapeHtml(state.settings.provider.apiKey)}" /></label>
        <label>Model<input name="model" value="${escapeHtml(state.settings.provider.model)}" /></label>
        <label>Chat Path<input name="chatPath" value="${escapeHtml(state.settings.provider.chatPath)}" /></label>
        <button type="submit" class="primary-action">保存 Provider 配置</button>
        <p class="helper-text">${provider.enabled ? `当前将优先调用 ${escapeHtml(provider.model)}` : '未配置完整时，会回退到本地规则生成。'}</p>
      </form>
      <section class="artifact-card editor-panel">
        <div class="artifact-meta">Aurora AI</div>
        <h3>${escapeHtml(activeProject?.title || '当前项目')}</h3>
        <p>${escapeHtml(pack?.promptBlueprint || '先创建项目，再生成草稿。')}</p>
        <div class="reference-strip">已阅读 ${getSourcesForProject(activeProject?.id || '').length} 个参考资料</div>
        <div class="inline-actions">
          <button class="primary-action" data-action="generate-draft" ${activeProject ? '' : 'disabled'}>生成新草稿</button>
          <button class="secondary-action">导出文档</button>
          <button class="secondary-action">创建任务</button>
        </div>
        <p class="helper-text">${escapeHtml(statusText)}</p>
        ${workspaceState.error ? `<p class="error-text">${escapeHtml(workspaceState.error)}</p>` : ''}
        <pre>${escapeHtml(workspaceState.content || '生成后，这里会展示当前项目的最新草稿。')}</pre>
      </section>
      <section class="artifact-card compact-panel">
        <div class="artifact-meta">Versions</div>
        <h3>生成记录</h3>
        <div class="stack-group">
          ${drafts.map((draft) => `
            <article class="library-item">
              <strong>${escapeHtml(draft.type)} · V${draft.version}</strong>
              <p>${escapeHtml(draft.providerLabel)} / ${escapeHtml(draft.model)}</p>
              <p>${escapeHtml(draft.content.slice(0, 120))}</p>
            </article>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderSettingsView() {
  return `
    <div class="module-grid split-grid">
      <section class="artifact-card compact-panel">
        <div class="artifact-meta">Workspace Defaults</div>
        <h3>默认创作偏好</h3>
        <ul class="status-list">
          <li><span>默认平台</span><strong>${escapeHtml(state.settings.defaults?.platform || '未设置')}</strong></li>
          <li><span>默认产出</span><strong>${escapeHtml(state.settings.defaults?.objective || '未设置')}</strong></li>
          <li><span>默认语气</span><strong>${escapeHtml(state.settings.defaults?.tone || '未设置')}</strong></li>
        </ul>
      </section>
      <form class="artifact-card compact-panel" id="defaults-form">
        <div class="artifact-meta">Settings</div>
        <h3>更新默认值</h3>
        <label>默认平台<input name="platform" value="${escapeHtml(state.settings.defaults?.platform || '')}" /></label>
        <label>默认产出<input name="objective" value="${escapeHtml(state.settings.defaults?.objective || '')}" /></label>
        <label>默认语气<input name="tone" value="${escapeHtml(state.settings.defaults?.tone || '')}" /></label>
        <div class="inline-actions">
          <button type="submit" class="primary-action">保存默认偏好</button>
          <button type="button" class="ghost-action" data-action="reset-workspace">重置本地工作台</button>
        </div>
      </form>
    </div>
  `;
}

function renderActiveModule() {
  switch (state.navigation.activeView) {
    case 'topics':
      return renderTopicsView();
    case 'projects':
      return renderProjectsView();
    case 'library':
      return renderLibraryView();
    case 'workspace':
      return renderWorkspaceView();
    case 'settings':
      return renderSettingsView();
    case 'dashboard':
    default:
      return renderDashboardView();
  }
}

function renderMainThread() {
  const activeProject = getActiveProject();
  return `
    <section class="thread-shell">
      <div class="thread-header">
        <div>
          <div class="artifact-meta">项目空间 / ${escapeHtml(state.collaboration.currentProjectLabel || activeProject?.title || '当前项目')}</div>
          <h2>${escapeHtml((state.recentThreads.today || [])[0]?.title || '工作线程')}</h2>
        </div>
      </div>
      <div class="thread-stream">
        <article class="message-row user">
          <div class="message-avatar">林</div>
          <div class="message-bubble">
            <div class="message-meta"><strong>林深</strong><span>10:24</span></div>
            <p>帮我基于现有资料，继续推进当前项目的结构化内容，输出可执行的工作结果。</p>
          </div>
        </article>
        <article class="message-row ai">
          <div class="message-avatar aurora">✦</div>
          <div class="message-bubble artifact-bubble">
            <div class="message-meta"><strong>Aurora AI</strong><span>10:24</span></div>
            <p>好的，我会基于现有资料与当前项目上下文，为你生成下一步可执行结果。</p>
            ${renderActiveModule()}
          </div>
        </article>
      </div>
      <form class="composer-shell">
        <textarea placeholder="给 Aurora 发送消息，输入 / 触发指令" disabled></textarea>
        <div class="composer-footer">
          <div class="capability-chips">
            <span>深度思考</span>
            <span>联网搜索</span>
            <span>数据分析</span>
            <span>图表生成</span>
            <span>更多</span>
          </div>
          <button type="button" class="primary-action small">发送</button>
        </div>
      </form>
    </section>
  `;
}

function renderContextPanel() {
  const file = state.contextPanel.filePreview;
  const insights = state.contextPanel.insights || [];
  const tasks = state.contextPanel.tasks || [];
  const refs = state.contextPanel.knowledgeRefs || [];

  return `
    <aside class="context-panel">
      <section class="context-card">
        <div class="panel-header-row">
          <h3>文件预览</h3>
          <span class="soft-token small">${escapeHtml(file.type)}</span>
        </div>
        <strong>${escapeHtml(file.title)}</strong>
        <p class="context-meta">${escapeHtml(file.size)} · ${escapeHtml(file.updatedAt)}</p>
        <div class="file-preview-box">
          <div>
            <p class="preview-title">Q2 市场方案</p>
            <p class="preview-subtitle">基础资料</p>
          </div>
          <ol>
            ${file.outline.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ol>
        </div>
      </section>

      <section class="context-card">
        <div class="panel-header-row">
          <h3>工具调用结果</h3>
          <span class="status-badge success">已获取</span>
        </div>
        <div class="insight-table">
          ${insights.map((item) => `
            <div class="insight-row">
              <div>
                <strong>${escapeHtml(item.label)}</strong>
                <p>${escapeHtml(item.value)}</p>
              </div>
              <span class="delta ${item.tone}">${escapeHtml(item.delta)}</span>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="context-card two-col-card">
        <div>
          <div class="panel-header-row">
            <h3>日程</h3>
          </div>
          <div class="agenda-list">
            <div><strong>10:00</strong><span>项目组周会 · 30 分钟</span></div>
            <div><strong>14:00</strong><span>用户访谈 · 60 分钟</span></div>
            <div><strong>16:30</strong><span>方案评审 · 45 分钟</span></div>
          </div>
        </div>
        <div>
          <div class="panel-header-row">
            <h3>待办 (${tasks.length})</h3>
          </div>
          <div class="task-list">
            ${tasks.map((task) => `
              <div class="task-item ${task.tone}">
                <span>${escapeHtml(task.title)}</span>
                <small>${escapeHtml(task.deadline)}</small>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="context-card">
        <div class="panel-header-row">
          <h3>知识库引用</h3>
          <span class="soft-link">查看全部</span>
        </div>
        <div class="reference-list">
          ${refs.map((item) => `
            <article class="reference-item">
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.excerpt)}</p>
              </div>
              <span>${escapeHtml(item.score)}</span>
            </article>
          `).join('')}
        </div>
      </section>
    </aside>
  `;
}

function render() {
  app.innerHTML = `
    <div class="aurora-shell">
      ${renderHeader()}
      <div class="workspace-layout">
        ${renderSidebar()}
        ${renderMainThread()}
        ${renderContextPanel()}
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

function selectProject(projectId, nextView = 'projects') {
  state.navigation.activeProjectId = projectId;
  state.navigation.activeView = nextView;
  state.collaboration.currentProjectLabel = state.projects.find((project) => project.id === projectId)?.title || state.collaboration.currentProjectLabel;
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
  state.collaboration.currentProjectLabel = project.title;
  state.contextPanel.filePreview.title = `${project.title} 基础资料.pdf`;
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

  document.querySelectorAll('[data-action="select-project-tree"]').forEach((button) => {
    button.addEventListener('click', () => selectProject(button.dataset.projectId, 'projects'));
  });

  document.querySelectorAll('[data-action="select-topic"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.navigation.activeTopicId = button.dataset.topicId;
      state.navigation.activeView = 'topics';
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
      state.navigation.activeView = 'topics';
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

      const entries = Object.fromEntries(form.entries());
      state.projects[projectIndex] = updateProjectRecord(state.projects[projectIndex], entries);
      const currentBrief = getBriefForProject(projectId) || createBrief(state.projects[projectIndex], {});
      const nextBrief = updateBriefRecord(currentBrief, entries);
      state.briefs = state.briefs.filter((item) => item.projectId !== projectId);
      state.briefs.unshift(nextBrief);
      state.collaboration.currentProjectLabel = state.projects[projectIndex].title;
      state.contextPanel.filePreview.title = `${state.projects[projectIndex].title} 基础资料.pdf`;
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
