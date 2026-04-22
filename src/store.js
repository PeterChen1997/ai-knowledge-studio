const STORAGE_KEY = 'ai-knowledge-studio';

export const defaultState = {
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
    { topic: '睡前刷手机为什么更难入睡', searchDemand: 5, authorityGap: 4, shareability: 5, competition: 3 },
    { topic: '为什么一焦虑就想吃甜的', searchDemand: 4, authorityGap: 4, shareability: 4, competition: 2 },
  ],
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
