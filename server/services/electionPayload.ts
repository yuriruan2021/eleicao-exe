import { getElectionStatus } from '../../shared/election.js';
import { buildNarratorEvents } from '../../shared/narrator.js';
import { OFFICIAL_SOURCE } from '../../shared/source.js';
import type { DataMode, ElectionPayload } from '../../shared/types.js';
import type { ProviderResult } from '../providers/ElectionProvider.js';

export function buildElectionPayload(mode: DataMode, result: ProviderResult, generatedAt: Date): ElectionPayload {
  const current = result.history.at(-1) ?? null;

  return {
    mode,
    status: getElectionStatus(current),
    current,
    history: result.history,
    events: buildNarratorEvents(result.history),
    lineup: result.lineup ?? current?.candidates ?? [],
    releaseAt: result.releaseAt ?? null,
    source: OFFICIAL_SOURCE,
    notice: result.notice,
    generatedAt: generatedAt.toISOString(),
  };
}
