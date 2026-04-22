import { createEmptyWorkspace, migrateLegacyState } from './workspace-core.js';

const STORAGE_KEY = 'ai-knowledge-studio';

export const defaultState = createEmptyWorkspace();

export function hydrateState(rawState) {
  return migrateLegacyState(rawState);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return hydrateState(JSON.parse(raw));
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
