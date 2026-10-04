import { useQuery } from '@tanstack/react-query';
import type { DataMode, ElectionStatus } from '@shared/types';
import { fetchElection, type ElectionQuery } from '@/services/electionApi';

const DEMO_POLL_MS = 4_000;
const OFFICIAL_POLL_MS: Record<ElectionStatus, number> = {
  aguardando: 60_000,
  'ao-vivo': 15_000,
  avancando: 15_000,
  finalizado: 5 * 60_000,
};

function getPollInterval(mode: DataMode, status: ElectionStatus | undefined): number {
  if (mode === 'demo') {
    return DEMO_POLL_MS;
  }
  return OFFICIAL_POLL_MS[status ?? 'aguardando'];
}

/**
 * Consulta o nosso servidor (nunca o TSE direto).
 * Se uma atualização falhar, o TanStack Query mantém o último dado bom em `data`.
 */
export function useElection(query: ElectionQuery) {
  const isDemo = query.mode === 'demo';

  return useQuery({
    queryKey: ['election', query.mode, query.scenario, query.demoStartedAt],
    queryFn: () => fetchElection(query),
    refetchInterval: (current) => getPollInterval(query.mode, current.state.data?.status),
    refetchIntervalInBackground: false,
    staleTime: isDemo ? 0 : 10_000,
    retry: isDemo ? 0 : 2,
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
  });
}
