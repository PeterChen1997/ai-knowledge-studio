function stripTrailingSlash(value = '') {
  return value.replace(/\/+$/, '');
}

export function normalizeProviderConfig(config = {}) {
  const baseInput = (config.baseUrl || '').trim();
  let baseUrl = stripTrailingSlash(baseInput);
  if (baseUrl && !baseUrl.endsWith('/v1')) {
    baseUrl = `${baseUrl}/v1`;
  }

  const normalized = {
    providerLabel: (config.providerLabel || 'OpenAI Compatible').trim() || 'OpenAI Compatible',
    baseUrl,
    apiKey: (config.apiKey || '').trim(),
    model: (config.model || '').trim(),
    chatPath: (config.chatPath || '/chat/completions').trim() || '/chat/completions',
    enabled: false,
  };

  normalized.enabled = Boolean(normalized.baseUrl && normalized.apiKey && normalized.model);
  return normalized;
}

export function createKnowledgeMessages(brief) {
  return [
    {
      role: 'system',
      content: 'You are a Chinese content strategist. Return concise, creator-ready planning output with sections for title, structure, key facts, actions, risks, and a reusable prompt. Avoid absolute claims and mention source boundaries.',
    },
    {
      role: 'user',
      content: `请围绕以下 brief 生成中文内容工作包：
主题：${brief.topic}
受众：${brief.audience}
平台：${brief.platform}
目标产出：${brief.objective}
语气：${brief.tone}
至少引用来源数：${brief.sourceCount}`,
    },
  ];
}

export function buildChatRequest(config, messages) {
  const normalized = normalizeProviderConfig(config);
  return {
    url: `${normalized.baseUrl}${normalized.chatPath}`,
    body: {
      model: normalized.model,
      messages,
      temperature: 0.7,
    },
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${normalized.apiKey}`,
      },
    },
  };
}

export function parseOpenAICompatibleResponse(payload) {
  return payload?.choices?.[0]?.message?.content || '';
}

export async function generateKnowledgePackWithAPI(config, brief, fetchImpl = fetch) {
  const normalized = normalizeProviderConfig(config);
  if (!normalized.enabled) {
    throw new Error('Provider config incomplete');
  }

  const request = buildChatRequest(normalized, createKnowledgeMessages(brief));
  const response = await fetchImpl(request.url, {
    ...request.options,
    body: JSON.stringify(request.body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return parseOpenAICompatibleResponse(payload);
}
