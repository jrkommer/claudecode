import { useMemo } from 'react';
import { useCrossroadsStore } from '../store/useCrossroadsStore';

// Freezes `value` until the global refresh tick changes (bumped by the
// header's Refresh button, or automatically whenever `liveRefreshEnabled`
// is on). A component naturally captures a fresh snapshot on mount too —
// since the app's tabs fully unmount/remount on switch, that means every
// tab activation gets current data even in "frozen" mode; only edits made
// while you stay on the same tab need an explicit refresh to show up.
export function useSnapshot<T>(value: T): T {
  const isLive = useCrossroadsStore((s) => s.liveRefreshEnabled);
  const tick = useCrossroadsStore((s) => s.refreshTick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const frozen = useMemo(() => value, [tick]);
  return isLive ? value : frozen;
}
