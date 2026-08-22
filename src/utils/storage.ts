import type { CrossroadsState } from '../types';

export function downloadStateAsJson(state: CrossroadsState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `crossroads-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportedState(text: string): CrossroadsState | null {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (!('values' in parsed) || !('scenarios' in parsed) || !('safety' in parsed)) return null;
    return parsed as CrossroadsState;
  } catch {
    return null;
  }
}
