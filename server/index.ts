import path from 'node:path';
import express from 'express';
import type { ApiErrorBody } from '../shared/types';
import { parseMode, parseScenario, parseStartedAt } from './http/parseQuery';
import { ProviderUnavailableError, type ElectionProvider } from './providers/ElectionProvider';
import { MockElectionProvider } from './providers/MockElectionProvider';
import { TseResultsService } from './providers/TseResultsService';
import { buildElectionPayload } from './services/electionPayload';

const PORT = Number(process.env.PORT ?? 3001);
const DIST_DIRECTORY = path.resolve(process.cwd(), 'dist');

const tseResultsService = new TseResultsService();
const app = express();

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

// Em produção, o mesmo servidor entrega o frontend já compilado (npm run build).
app.use(express.static(DIST_DIRECTORY));

app.listen(PORT, () => {
  console.log(`ELEIÇÃO.EXE no ar: http://localhost:${PORT}`);
});
