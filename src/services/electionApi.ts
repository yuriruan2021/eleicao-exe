import type { DemoScenario } from '@shared/demo';
import type { ApiErrorBody, DataMode, ElectionPayload } from '@shared/types';

const REQUEST_TIMEOUT_MS = 8_000;

export interface ElectionQuery {
  mode: DataMode;
  scenario: DemoScenario;
  demoStartedAt: number;
}

export class ElectionApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ElectionApiError';
  }
}

function buildElectionUrl(query: ElectionQuery): string {
  const params = new URLSearchParams({ mode: query.mode });
  if (query.mode === 'demo') {
    params.set('scenario', query.scenario);
    params.set('startedAt', String(query.demoStartedAt));
  }
  return `/api/election?${params.toString()}`;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && typeof (value as { error?: unknown }).error === 'string';
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (isApiErrorBody(body)) {
      return body.error;
    }
  } catch {
    // Corpo sem JSON: cai na mensagem padrão abaixo.
  }
  return `O servidor da apuração respondeu com erro ${response.status}.`;
}

export async function fetchElection(query: ElectionQuery): Promise<ElectionPayload> {
  let response: Response;
  try {
    response = await fetch(buildElectionUrl(query), { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new ElectionApiError('Sem resposta do servidor da apuração.');
  }

  if (!response.ok) {
    throw new ElectionApiError(await readErrorMessage(response));
  }

  return (await response.json()) as ElectionPayload;
}
