import { describe, expect, test } from 'vitest';
import {
  createEmptyWorkspace,
  createProjectFromTopic,
  createDraftVersion,
  rankTopicCards,
  migrateLegacyState,
  updateTopicCard,
  updateProjectRecord,
  updateBriefRecord,
  updateSourceRecord,
  removeSourceRecord,
} from '../src/workspace-core.js';

describe('rankTopicCards', () => {
  test('sorts topic cards by opportunity score descending', () => {
    const ranked = rankTopicCards([
      { id: 't1', title: '久坐为什么让人越来越累', searchDemand: 5, authorityGap: 4, shareability: 4, competition: 2 },
      { id: 't2', title: '今天天气不错', searchDemand: 1, authorityGap: 1, shareability: 1, competition: 4 },
    ]);

    expect(ranked[0].id).toBe('t1');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});

describe('createProjectFromTopic', () => {
  test('creates a project shell and links the source topic', () => {
    const topic = {
      id: 'topic-1',
      title: '睡前刷手机为什么更难入睡',
      searchDemand: 5,
      authorityGap: 4,
      shareability: 5,
      competition: 3,
      tags: ['睡眠', '健康'],
      status: 'scored',
    };

    const project = createProjectFromTopic(topic, {
      audience: '总想晚睡的年轻人',
      platform: '小红书',
      objective: '图文卡片',
      tone: '克制可信',
    });

    expect(project.topicId).toBe('topic-1');
    expect(project.title).toContain('睡前刷手机');
    expect(project.status).toBe('brief');
    expect(project.tags).toContain('睡眠');
  });
});

describe('createDraftVersion', () => {
  test('increments version numbers within a project', () => {
    const first = createDraftVersion([], {
      projectId: 'project-1',
      type: 'draft',
      content: '第一版内容',
      providerLabel: 'OpenAI Compatible',
      model: 'gpt-4.1-mini',
    });

    const second = createDraftVersion([first], {
      projectId: 'project-1',
      type: 'draft',
      content: '第二版内容',
      providerLabel: 'OpenAI Compatible',
      model: 'gpt-4.1-mini',
    });

    expect(first.version).toBe(1);
    expect(second.version).toBe(2);
  });
});

describe('workspace record updates', () => {
  test('updates topic metadata with normalized tag and platform lists', () => {
    const updated = updateTopicCard({
      id: 'topic-1',
      title: '旧题目',
      problem: '旧问题',
      searchDemand: 3,
      authorityGap: 3,
      shareability: 3,
      competition: 3,
      tags: [],
      platformSuggestions: [],
      status: 'inbox',
      createdAt: '2026-04-22T00:00:00.000Z',
    }, {
      title: '新的题目',
      tagsText: '睡眠, 健康\n效率',
      platformSuggestionsText: '小红书\n公众号',
      status: 'scored',
      searchDemand: '5',
    });

    expect(updated.title).toBe('新的题目');
    expect(updated.status).toBe('scored');
    expect(updated.searchDemand).toBe(5);
    expect(updated.tags).toEqual(['睡眠', '健康', '效率']);
    expect(updated.platformSuggestions).toEqual(['小红书', '公众号']);
  });

  test('updates project status and due date while refreshing updatedAt', () => {
    const updated = updateProjectRecord({
      id: 'project-1',
      topicId: 'topic-1',
      title: '项目',
      audience: '白领',
      platform: '小红书',
      objective: '图文',
      tone: '克制',
      status: 'brief',
      dueDate: '',
      createdAt: '2026-04-22T00:00:00.000Z',
      updatedAt: '2026-04-22T00:00:00.000Z',
    }, {
      status: 'drafting',
      dueDate: '2026-05-01',
    });

    expect(updated.status).toBe('drafting');
    expect(updated.dueDate).toBe('2026-05-01');
    expect(updated.updatedAt).not.toBe('2026-04-22T00:00:00.000Z');
  });

  test('updates brief lists from textarea-like text input', () => {
    const updated = updateBriefRecord({
      projectId: 'project-1',
      coreMessage: '旧观点',
      userValue: '旧收益',
      angle: '旧角度',
      outline: ['旧结构'],
      guardrails: ['旧约束'],
      sourceCount: 2,
    }, {
      outlineText: '问题定义\n关键事实\n行动建议',
      guardrailsText: '标注来源\n避免绝对化',
      sourceCount: '4',
    });

    expect(updated.outline).toEqual(['问题定义', '关键事实', '行动建议']);
    expect(updated.guardrails).toEqual(['标注来源', '避免绝对化']);
    expect(updated.sourceCount).toBe(4);
  });

  test('updates and removes source records', () => {
    const updated = updateSourceRecord({
      id: 'source-1',
      projectId: 'project-1',
      title: '旧资料',
      url: '',
      excerpt: '',
      evidenceLevel: 'medium',
      tags: [],
    }, {
      title: '新资料',
      url: 'https://example.com',
      excerpt: '关键信息',
      evidenceLevel: 'high',
      tagsText: '研究, 数据',
    });

    const remaining = removeSourceRecord([
      updated,
      { id: 'source-2', projectId: 'project-1', title: 'B', url: '', excerpt: '', evidenceLevel: 'low', tags: [] },
    ], 'source-1');

    expect(updated.tags).toEqual(['研究', '数据']);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('source-2');
  });
});

describe('migrateLegacyState', () => {
  test('turns the old single-page generator state into the suite workspace shape', () => {
    const workspace = migrateLegacyState({
      brief: {
        topic: '久坐为什么让人越来越累',
        audience: '办公室白领',
        platform: '小红书',
        objective: '图文卡片',
        tone: '专业但不吓人',
        sourceCount: 3,
      },
      topics: [
        { topic: '久坐为什么让人越来越累', searchDemand: 5, authorityGap: 4, shareability: 4, competition: 2 },
      ],
      provider: {
        providerLabel: 'OpenAI Compatible',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-4.1-mini',
        chatPath: '/chat/completions',
      },
      aiDraft: {
        status: 'success',
        content: '这是一份旧版 AI 草稿',
        error: '',
      },
    });

    expect(workspace.navigation.activeView).toBe('dashboard');
    expect(workspace.topics).toHaveLength(1);
    expect(workspace.projects).toHaveLength(1);
    expect(workspace.drafts[0].content).toContain('旧版 AI 草稿');
    expect(workspace.settings.provider.model).toBe('gpt-4.1-mini');
    expect(workspace.aiWorkspace[workspace.projects[0].id].content).toContain('旧版 AI 草稿');
  });

  test('creates an empty workspace when nothing persisted yet', () => {
    const workspace = createEmptyWorkspace();

    expect(workspace.topics.length).toBeGreaterThan(0);
    expect(workspace.projects.length).toBeGreaterThan(0);
    expect(workspace.templates.length).toBeGreaterThan(0);
    expect(workspace.navigation.activeView).toBe('dashboard');
    expect(workspace.aiWorkspace[workspace.projects[0].id].status).toBe('idle');
  });
});

