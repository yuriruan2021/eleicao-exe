import { getElectionStatus } from '../../shared/election';
import { buildNarratorEvents } from '../../shared/narrator';
import { OFFICIAL_SOURCE } from '../../shared/source';
import type { DataMode, ElectionPayload } from '../../shared/types';
import type { ProviderResult } from '../providers/ElectionProvider';

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
