const DEFAULT_BRIEF = {
  audience: '办公室白领',
  platform: '小红书',
  objective: '图文卡片',
  tone: '专业但不吓人',
  sourceCount: 3,
};

const DEFAULT_PROVIDER = {
  providerLabel: 'OpenAI Compatible',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4.1-mini',
  chatPath: '/chat/completions',
};

function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function scoreTopicCard(topic) {
  return topic.searchDemand * 3 + topic.authorityGap * 3 + topic.shareability * 2 - topic.competition * 2;
}

export function rankTopicCards(topics = []) {
  return [...topics]
    .map((topic) => ({ ...topic, score: scoreTopicCard(topic) }))
    .sort((left, right) => right.score - left.score);
}

export function createTopicCard(topic = {}) {
  return {
    id: topic.id || createId('topic'),
    title: topic.title || topic.topic || '新的内容题',
    problem: topic.problem || '补一句：这个题为什么值得做？',
    searchDemand: Number(topic.searchDemand ?? 3),
    authorityGap: Number(topic.authorityGap ?? 3),
    shareability: Number(topic.shareability ?? 3),
    competition: Number(topic.competition ?? 3),
    tags: Array.isArray(topic.tags) ? topic.tags : [],
    status: topic.status || 'inbox',
    platformSuggestions: topic.platformSuggestions || ['小红书', '公众号'],
    createdAt: topic.createdAt || nowIso(),
  };
}

export function createProjectFromTopic(topic, overrides = {}) {
  const createdAt = nowIso();
  const cleanTopic = createTopicCard(topic);
  return {
    id: createId('project'),
    topicId: cleanTopic.id,
    title: overrides.title || cleanTopic.title,
    audience: overrides.audience || DEFAULT_BRIEF.audience,
    platform: overrides.platform || DEFAULT_BRIEF.platform,
    objective: overrides.objective || DEFAULT_BRIEF.objective,
    tone: overrides.tone || DEFAULT_BRIEF.tone,
    status: overrides.status || 'brief',
    dueDate: overrides.dueDate || '',
    tags: [...cleanTopic.tags],
    createdAt,
    updatedAt: createdAt,
  };
}

export function createBrief(project, brief = {}) {
  return {
    projectId: project.id,
    coreMessage: brief.coreMessage || `围绕“${project.title}”提炼一个清晰、可信的核心观点。`,
    userValue: brief.userValue || `让${project.audience}快速理解这个主题为什么重要。`,
    angle: brief.angle || '问题定义 + 关键事实 + 可执行建议',
    outline: brief.outline || [
      `问题定义：${project.title} 为什么值得现在解释`,
      `判断依据：给 ${project.audience} 的 3 个关键信号`,
      '行动建议：用户立刻能做的 2 步',
      '误区提醒：最容易说错或被误解的地方',
    ],
    guardrails: brief.guardrails || [
      '必须标注来源，避免空泛归因',
      '避免绝对化承诺与过度结论',
      '对不确定结论保留边界条件',
    ],
    sourceCount: Number(brief.sourceCount ?? DEFAULT_BRIEF.sourceCount),
  };
}

export function createSource(projectId, source = {}) {
  return {
    id: source.id || createId('source'),
    projectId,
    title: source.title || '补一个资料标题',
    url: source.url || '',
    excerpt: source.excerpt || '',
    evidenceLevel: source.evidenceLevel || 'medium',
  };
}

export function createDraftVersion(existingDrafts = [], input = {}) {
  const siblingDrafts = existingDrafts.filter((draft) => draft.projectId === input.projectId && draft.type === input.type);
  const version = siblingDrafts.length + 1;
  return {
    id: createId('draft'),
    projectId: input.projectId,
    type: input.type || 'draft',
    version,
    providerLabel: input.providerLabel || 'Local Rules',
    model: input.model || 'built-in',
    content: input.content || '',
    status: input.status || 'candidate',
    createdAt: nowIso(),
  };
}

export function createTemplate(template = {}) {
  return {
    id: template.id || createId('tpl'),
    category: template.category || 'prompt',
    name: template.name || '新的模板',
    content: template.content || '',
    tags: Array.isArray(template.tags) ? template.tags : [],
  };
}

export function createEmptyWorkspace() {
  const seededTopics = [
    createTopicCard({ title: '久坐为什么让人越来越累', searchDemand: 5, authorityGap: 4, shareability: 4, competition: 2, tags: ['健康', '办公室'], status: 'scored' }),
    createTopicCard({ title: '睡前刷手机为什么更难入睡', searchDemand: 5, authorityGap: 4, shareability: 5, competition: 3, tags: ['睡眠', '行为改变'], status: 'scored' }),
    createTopicCard({ title: '为什么一焦虑就想吃甜的', searchDemand: 4, authorityGap: 4, shareability: 4, competition: 2, tags: ['情绪', '饮食'], status: 'inbox' }),
  ];

  const primaryProject = createProjectFromTopic(seededTopics[0], DEFAULT_BRIEF);
  const briefs = [createBrief(primaryProject, { sourceCount: DEFAULT_BRIEF.sourceCount })];
  const sources = [
    createSource(primaryProject.id, { title: 'WHO 久坐行为指导', url: 'https://www.who.int/', excerpt: '久坐行为与代谢、睡眠、情绪状态相关。', evidenceLevel: 'high' }),
    createSource(primaryProject.id, { title: '办公人群久坐研究综述', excerpt: '久坐时间与疲劳感上升、主观恢复感下降相关。', evidenceLevel: 'medium' }),
  ];
  const drafts = [
    createDraftVersion([], {
      projectId: primaryProject.id,
      type: 'outline',
      content: '1. 久坐不是“没动”这么简单\n2. 疲劳感来自循环与恢复被打断\n3. 给白领的 2 步调整建议',
      providerLabel: 'Local Rules',
      model: 'built-in',
      status: 'selected',
    }),
  ];

  return {
    version: 2,
    navigation: { activeView: 'dashboard', activeProjectId: primaryProject.id, activeTopicId: seededTopics[0].id },
    briefDraft: { ...DEFAULT_BRIEF, topic: primaryProject.title },
    topics: seededTopics,
    projects: [primaryProject],
    briefs,
    sources,
    drafts,
    templates: [
      createTemplate({ category: 'structure', name: '问题定义 → 关键事实 → 行动建议', content: '先解释问题，再给事实依据，最后给操作步骤。', tags: ['知识内容', '图文'] }),
      createTemplate({ category: 'prompt', name: '知识内容包 Prompt', content: '围绕一个主题生成标题、结构、关键事实、行动建议与来源提醒。', tags: ['prompt', 'brief'] }),
    ],
    settings: { provider: { ...DEFAULT_PROVIDER }, defaults: { platform: DEFAULT_BRIEF.platform, objective: DEFAULT_BRIEF.objective, tone: DEFAULT_BRIEF.tone } },
    aiWorkspace: {
      [primaryProject.id]: { status: 'idle', content: '', error: '' },
    },
  };
}

export function migrateLegacyState(state = {}) {
  if (state.version === 2 && state.navigation && Array.isArray(state.projects)) {
    return state;
  }

  const workspace = createEmptyWorkspace();
  const provider = state.provider ? { ...workspace.settings.provider, ...state.provider } : workspace.settings.provider;
  const legacyTopics = Array.isArray(state.topics) && state.topics.length ? state.topics.map((topic) => createTopicCard(topic)) : workspace.topics;
  const briefInput = { ...DEFAULT_BRIEF, ...(state.brief || {}) };
  const primaryTopic = legacyTopics[0] || createTopicCard({ title: briefInput.topic || '新的内容题' });
  const project = createProjectFromTopic(primaryTopic, briefInput);
  const brief = createBrief(project, {
    sourceCount: briefInput.sourceCount,
    coreMessage: `这份内容包面向 ${briefInput.audience || DEFAULT_BRIEF.audience}，目标是在 ${briefInput.platform || DEFAULT_BRIEF.platform} 上完成 ${briefInput.objective || DEFAULT_BRIEF.objective}。`,
  });
  const drafts = state.aiDraft?.content
    ? [createDraftVersion([], {
      projectId: project.id,
      type: 'draft',
      content: state.aiDraft.content,
      providerLabel: provider.providerLabel || 'OpenAI Compatible',
      model: provider.model || 'unknown',
      status: 'selected',
    })]
    : workspace.drafts;

  return {
    ...workspace,
    navigation: { activeView: 'dashboard', activeProjectId: project.id, activeTopicId: primaryTopic.id },
    briefDraft: briefInput,
    topics: legacyTopics,
    projects: [project],
    briefs: [brief],
    drafts,
    settings: {
      provider,
      defaults: {
        platform: briefInput.platform || DEFAULT_BRIEF.platform,
        objective: briefInput.objective || DEFAULT_BRIEF.objective,
        tone: briefInput.tone || DEFAULT_BRIEF.tone,
      },
    },
    aiWorkspace: {
      [project.id]: state.aiDraft || { status: 'idle', content: '', error: '' },
    },
  };
}
