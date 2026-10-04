import express from 'express';
import type { ApiErrorBody } from '../shared/types.js';
import { parseMode, parseScenario, parseStartedAt } from './http/parseQuery.js';
import { ProviderUnavailableError, type ElectionProvider } from './providers/ElectionProvider.js';
import { MockElectionProvider } from './providers/MockElectionProvider.js';
import { TseResultsService } from './providers/TseResultsService.js';
import { buildElectionPayload } from './services/electionPayload.js';

const tseResultsService = new TseResultsService();

/** Rotas da API. Usado pelo servidor Node (server/index.ts) e pela função da Vercel (api/index.ts). */
export const app = express();

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.get('/api/election', async (request, response) => {
  const now = Date.now();
  const mode = parseMode(request.query.mode);
  const provider: ElectionProvider =
    mode === 'demo'
      ? new MockElectionProvider({
          scenario: parseScenario(request.query.scenario),
          startedAt: parseStartedAt(request.query.startedAt, now),
          now,
        })
      : tseResultsService;

  try {
    const result = await provider.load();
    response.set('Cache-Control', 'no-store').json(buildElectionPayload(mode, result, new Date(now)));
  } catch (error) {
    const isExpected = error instanceof ProviderUnavailableError;
    if (!isExpected) {
      console.error('[api/election] erro inesperado', error);
    }
    const body: ApiErrorBody = {
      error: isExpected ? error.message : 'Erro inesperado ao montar a apuração.',
    };
    response.status(503).json(body);
  }
});
