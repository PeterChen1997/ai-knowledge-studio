function normalizeText(value, fallback) {
  const text = value?.trim();
  return text || fallback;
}

export function generateHook(topic, objective = '') {
  const cleanTopic = normalizeText(topic, '这个主题');
  if (objective.includes('小红书')) return `为什么越来越多人忽视了「${cleanTopic}」这个信号？`;
  if (objective.includes('视频')) return `如果只用 30 秒讲清楚「${cleanTopic}」，我会先讲这 3 点`;
  return `关于「${cleanTopic}」，先别急着下结论，先看这 3 个关键事实`;
}

export function createIdeaAngles(topic, audience) {
  const cleanTopic = normalizeText(topic, '这个主题');
  const cleanAudience = normalizeText(audience, '目标用户');
  return [
    { headline: `为什么 ${cleanAudience} 总在 ${cleanTopic} 上踩坑？`, angle: '痛点切入' },
    { headline: `${cleanTopic} 最容易被忽略的 3 个事实`, angle: '事实拆解' },
    { headline: `如果你也遇到 ${cleanTopic}，先做这 2 个动作`, angle: '行动建议' },
    { headline: `${cleanTopic} 不只是常识问题，它其实影响了什么？`, angle: '认知升级' },
  ];
}

export function createKnowledgePack({ topic, audience, platform, objective, tone, sourceCount = 2 }) {
  const cleanTopic = normalizeText(topic, '这个主题');
  const cleanAudience = normalizeText(audience, '目标用户');
  const cleanPlatform = normalizeText(platform, '全平台');
  const cleanObjective = normalizeText(objective, '内容初稿');
  const cleanTone = normalizeText(tone, '清晰可信');

  return {
    title: generateHook(cleanTopic, `${cleanPlatform}${cleanObjective}`),
    topic: cleanTopic,
    audience: cleanAudience,
    platform: cleanPlatform,
    objective: cleanObjective,
    tone: cleanTone,
    coreMessage: `这份内容包面向 ${cleanAudience}，目标是在 ${cleanPlatform} 上完成 ${cleanObjective}。`,
    sections: [
      `问题定义：${cleanTopic} 为什么值得现在解释`,
      `判断依据：给 ${cleanAudience} 的 3 个关键信号`,
      `行动建议：用户立刻能做的 2 步`,
      `误区提醒：最容易说错或被误解的地方`,
      `结尾 CTA：鼓励收藏、转发或继续阅读`,
    ],
    checklist: [
      `至少准备 ${sourceCount} 条权威来源`,
      '准备一个对比数据或图示',
      '补一条可分享的金句',
      '检查平台敏感表达与合规风险',
    ],
    outputTemplates: ['图文卡片', '短视频脚本', '口播提纲', '封面标题 A/B 版本'],
    promptBlueprint: `请围绕“${cleanTopic}”面向“${cleanAudience}”生成一套用于${cleanPlatform}的${cleanObjective}内容包，语气${cleanTone}，包含标题、结构、关键事实、行动建议与来源提醒。`,
    angles: createIdeaAngles(cleanTopic, cleanAudience),
  };
}

function topicScore(item) {
  return item.searchDemand * 3 + item.authorityGap * 3 + item.shareability * 2 - item.competition * 2;
}

export function scoreTopics(items = []) {
  return [...items]
    .map((item) => ({ ...item, score: topicScore(item) }))
    .sort((a, b) => b.score - a.score);
}

export function summarizePack(pack) {
  return `为 ${pack.audience} 准备的 ${pack.platform}${pack.objective}：核心主题是“${pack.topic}”。建议语气为 ${pack.tone}，先完成标题、结构、关键事实，再补齐来源与合规检查。`;
}
