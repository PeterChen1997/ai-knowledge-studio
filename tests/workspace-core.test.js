import { describe, expect, test } from 'vitest';
import {
  createEmptyWorkspace,
  createProjectFromTopic,
  createDraftVersion,
  rankTopicCards,
  migrateLegacyState,
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

