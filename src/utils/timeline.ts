import type { ElectionSnapshot } from '@shared/types';

/** Mantém o último snapshot de cada janela de tempo (ex.: um a cada 15 min). */
export function sampleTimeline(history: readonly ElectionSnapshot[], windowMinutes: number): ElectionSnapshot[] {
  const windowMs = windowMinutes * 60_000;
  const latestByWindow = new Map<number, ElectionSnapshot>();

  for (const snapshot of history) {
    latestByWindow.set(Math.floor(Date.parse(snapshot.timestamp) / windowMs), snapshot);
  }

  return [...latestByWindow.values()];
}
