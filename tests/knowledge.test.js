import { describe, expect, test } from 'vitest';
import {
  createKnowledgePack,
  createIdeaAngles,
  generateHook,
  scoreTopics,
  summarizePack,
} from '../src/knowledge-core.js';

describe('generateHook', () => {
  test('matches xiaohongshu style goal with emotional hook', () => {
    expect(generateHook('久坐为什么让人越来越累', '做小红书图文')).toContain('久坐');
  });
});

describe('createKnowledgePack', () => {
  test('creates a structured pack for a vertical topic', () => {
    const pack = createKnowledgePack({
      topic: '久坐为什么让人越来越累',
      audience: '办公室白领',
      platform: '小红书',
      objective: '做图文卡片',
      tone: '专业但不吓人',
      sourceCount: 3,
    });

    expect(pack.title).toContain('久坐');
    expect(pack.sections).toHaveLength(5);
    expect(pack.checklist).toContain('至少准备 3 条权威来源');
    expect(pack.outputTemplates).toContain('图文卡片');
  });
});

describe('createIdeaAngles', () => {
  test('returns multiple content angles from a single topic', () => {
    const angles = createIdeaAngles('为什么总觉得越休息越累', '年轻上班族');
    expect(angles).toHaveLength(4);
    expect(angles[0].headline).toContain('为什么');
  });
});

describe('scoreTopics', () => {
  test('scores candidate topics by demand and differentiation', () => {
    const ranked = scoreTopics([
      { topic: '久坐为什么让人越来越累', searchDemand: 5, authorityGap: 4, shareability: 4, competition: 2 },
      { topic: '今天天气不错', searchDemand: 1, authorityGap: 1, shareability: 1, competition: 4 },
    ]);

    expect(ranked[0].topic).toBe('久坐为什么让人越来越累');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});

describe('summarizePack', () => {
  test('summarizes the pack into a creator-facing brief', () => {
    const pack = createKnowledgePack({
      topic: '睡前刷手机为什么更难入睡',
      audience: '总想晚睡的年轻人',
      platform: '视频号',
      objective: '短视频脚本',
      tone: '克制可信',
      sourceCount: 2,
    });

    const brief = summarizePack(pack);
    expect(brief).toContain('总想晚睡的年轻人');
    expect(brief).toContain('短视频脚本');
  });
});
