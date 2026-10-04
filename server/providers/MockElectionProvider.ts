import type { DemoScenario } from '../../shared/demo.js';
import { rankCandidates, type UnrankedCandidate } from '../../shared/election.js';
import type { ElectionSnapshot } from '../../shared/types.js';
import { ProviderUnavailableError, type ElectionProvider, type ProviderResult } from './ElectionProvider.js';

/**
 * Gera uma apuração 100% FICTÍCIA para testar a interface antes da eleição.
 * É determinística: o mesmo cenário e o mesmo instante de início produzem sempre os mesmos números.
 */

const DEMO_TICK_MS = 4_000;
const TOTAL_TICKS = 40;
const HOLD_FINAL_TICKS = 8;
const DEMO_CLOCK_STEP_MS = 6 * 60_000;
const DEMO_CLOCK_START_TIME = 'T17:00:00-03:00';
const EXPECTED_TURNOUT = 124_000_000;
const BLANK_RATE = 0.017;
const NULL_RATE = 0.032;
const MINOR_CANDIDATE_SHARES = [4.2, 1.8] as const;
const TOP_TWO_SHARE = 100 - MINOR_CANDIDATE_SHARES[0] - MINOR_CANDIDATE_SHARES[1];
const TOTALIZATION_CURVE_EXPONENT = 1.6;
const NOISE_AMPLITUDE = 0.0012;
const FAILING_TICK_INTERVAL = 4;
/** No cenário "sem dados", a contagem regressiva zera pouco depois de abrir, para testar os dois estados. */
const DEMO_RELEASE_DELAY_MS = 90_000;

interface DemoCandidate {
  number: number;
  name: string;
  party: string;
  photoUrl: string | null;
}

const DEMO_CANDIDATES: readonly DemoCandidate[] = [
  { number: 91, name: 'Ana Exemplo', party: 'PDEMO', photoUrl: null },
  { number: 92, name: 'Bruno Fictício', party: 'PTESTE', photoUrl: null },
  { number: 93, name: 'Carla Simulada', party: 'PMOCK', photoUrl: null },
  { number: 94, name: 'Diego Hipotético', party: 'PSIM', photoUrl: null },
];

/**
 * Cenário "comemoracao": testa a tela de comemoração com o 22 (nome e foto oficiais do TSE) vencendo
 * adversários fictícios. A faixa de modo demonstração e o selo "Simulação" deixam claro que não é resultado real.
 */
const CELEBRATION_CANDIDATES: readonly DemoCandidate[] = [
  {
    number: 22,
    name: 'Flavio Bolsonaro',
    party: 'PL',
    photoUrl: 'https://resultados.tse.jus.br/oficial/ele2026/6257/fotos/br/280002551544.jpeg',
  },
  ...DEMO_CANDIDATES.slice(1),
];

/** Fatia do 1º candidato fictício dentro da soma dos dois primeiros, conforme a totalização avança (0–1). */
type ShareCurve = (fraction: number) => number;

const lateTurnaround: ShareCurve = (fraction) => 0.545 - 0.06 * fraction ** 1.3;

const SHARE_CURVES: Record<DemoScenario, ShareCurve> = {
  virada: lateTurnaround,
  apertada: (fraction) => 0.5 + 0.0045 * Math.sin(fraction * 13) - 0.0015 * fraction,
  folgada: (fraction) => 0.59 - 0.025 * fraction,
  finalizado: (fraction) => 0.575 - 0.01 * fraction,
  erro: lateTurnaround,
  'sem-dados': () => 0.5,
  comemoracao: (fraction) => 0.575 - 0.01 * fraction,
};

/** Cenários que já abrem com 100% totalizado. */
const FINISHED_SCENARIOS: readonly DemoScenario[] = ['finalizado', 'comemoracao'];

export interface MockElectionOptions {
  scenario: DemoScenario;
  startedAt: number;
  now: number;
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

function getTotalizedPercentage(tick: number): number {
  const linearProgress = tick / TOTAL_TICKS;
  return roundTo2(100 * (1 - (1 - linearProgress) ** TOTALIZATION_CURVE_EXPONENT));
}

function deterministicNoise(tick: number): number {
  return Math.sin(tick * 12.9898) * NOISE_AMPLITUDE;
}

function getDemoClockStart(startedAt: number): number {
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(startedAt));
  return Date.parse(`${day}${DEMO_CLOCK_START_TIME}`);
}

function buildSnapshot(
  tick: number,
  curve: ShareCurve,
  clockStart: number,
  demoCandidates: readonly DemoCandidate[],
): ElectionSnapshot {
  const totalizedPercentage = getTotalizedPercentage(tick);
  const fraction = totalizedPercentage / 100;
  const turnout = Math.round(EXPECTED_TURNOUT * fraction);
  const blankVotes = Math.round(turnout * BLANK_RATE);
  const nullVotes = Math.round(turnout * NULL_RATE);
  const validVotes = turnout - blankVotes - nullVotes;

  const firstShare = curve(fraction) + deterministicNoise(tick);
  const shares = [TOP_TWO_SHARE * firstShare, TOP_TWO_SHARE * (1 - firstShare), ...MINOR_CANDIDATE_SHARES];
  const isFullyTotalized = totalizedPercentage >= 100;

  const candidates: UnrankedCandidate[] = demoCandidates.map((candidate, index) => {
    const votes = Math.round((validVotes * shares[index]) / 100);
    const percentage = validVotes > 0 ? roundTo2((votes / validVotes) * 100) : 0;
    return { ...candidate, votes, percentage, elected: isFullyTotalized && percentage > 50 };
  });

  return {
    timestamp: new Date(clockStart + tick * DEMO_CLOCK_STEP_MS).toISOString(),
    totalizedPercentage,
    candidates: rankCandidates(candidates),
    validVotes,
    blankVotes,
    nullVotes,
    turnout,
  };
}

export class MockElectionProvider implements ElectionProvider {
  private readonly options: MockElectionOptions;

  constructor(options: MockElectionOptions) {
    this.options = options;
  }

  async load(): Promise<ProviderResult> {
    const { scenario, startedAt } = this.options;

    if (scenario === 'sem-dados') {
      const lineup = rankCandidates(
        DEMO_CANDIDATES.map((candidate) => ({ ...candidate, votes: 0, percentage: 0, elected: false })),
      );
      return {
        history: [],
        notice: 'Cenário de teste: a fonte ainda não publicou nenhum número.',
        lineup,
        releaseAt: new Date(startedAt + DEMO_RELEASE_DELAY_MS).toISOString(),
      };
    }

    const rawTick = this.getRawTick();
    if (scenario === 'erro' && rawTick % FAILING_TICK_INTERVAL === FAILING_TICK_INTERVAL - 1) {
      throw new ProviderUnavailableError('Falha simulada: a fonte de dados não respondeu.');
    }

    const currentTick = FINISHED_SCENARIOS.includes(scenario) ? TOTAL_TICKS : Math.min(rawTick, TOTAL_TICKS);
    const clockStart = getDemoClockStart(startedAt);
    const curve = SHARE_CURVES[scenario];
    const demoCandidates = scenario === 'comemoracao' ? CELEBRATION_CANDIDATES : DEMO_CANDIDATES;
    const history = Array.from({ length: currentTick }, (_, index) =>
      buildSnapshot(index + 1, curve, clockStart, demoCandidates),
    );

    return { history, notice: null };
  }

  /** Avança um "tick" a cada 4s, segura o resultado final por um tempo e recomeça. */
  private getRawTick(): number {
    const elapsed = Math.max(0, this.options.now - this.options.startedAt);
    return Math.floor(elapsed / DEMO_TICK_MS) % (TOTAL_TICKS + HOLD_FINAL_TICKS);
  }
}
