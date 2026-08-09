export function formatDuration(ms: number): string {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function closeActiveInterval(
  activeDurationMs: number,
  currentActiveIntervalStartedAt: string | null,
  nowIso: string,
): number {
  if (!currentActiveIntervalStartedAt) {
    return activeDurationMs;
  }

  const startedAt = Date.parse(currentActiveIntervalStartedAt);
  const now = Date.parse(nowIso);
  if (!Number.isFinite(startedAt) || !Number.isFinite(now) || now <= startedAt) {
    return activeDurationMs;
  }

  return activeDurationMs + (now - startedAt);
}

export function deriveVisibleDuration(
  activeDurationMs: number,
  currentActiveIntervalStartedAt: string | null,
  nowMs: number,
): number {
  if (!currentActiveIntervalStartedAt) {
    return activeDurationMs;
  }

  const startedAt = Date.parse(currentActiveIntervalStartedAt);
  if (!Number.isFinite(startedAt) || nowMs <= startedAt) {
    return activeDurationMs;
  }

  return activeDurationMs + (nowMs - startedAt);
}
