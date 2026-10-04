import { rankCandidates, type UnrankedCandidate } from '../../shared/election';
import type { ElectionSnapshot } from '../../shared/types';
import { ProviderUnavailableError, type ElectionProvider, type ProviderResult } from './ElectionProvider';

/**
 * Fonte oficial: arquivos JSON publicados pelo TSE.
 *
 * 1. Lê o arquivo de configuração das eleições (ele-c.json) e descobre o código da eleição presidencial.
 * 2. Baixa br-c0001-e{código}-u.json (resultado unificado, especificação EA20) no máximo a cada 15s.
 * 3. Normaliza para ElectionSnapshot e guarda um snapshot sempre que a totalização muda.
 * Toda adaptação ao formato do TSE fica isolada aqui.
 */

const TSE_BASE_URL = 'https://resultados.tse.jus.br/oficial';
const ELECTION_CYCLE = 'ele2026';
const PRESIDENT_ROLE_CODE = '1';
const POLL_INTERVAL_MS = 15_000;
const CONFIG_TTL_MS = 10 * 60_000;
const REQUEST_TIMEOUT_MS = 10_000;
const LOWERCASE_NAME_WORDS = new Set(['da', 'das', 'de', 'do', 'dos', 'e']);
/** Fechamento das urnas em Brasília: a partir daí o TSE começa a divulgar. */
const RELEASE_TIME = '17:00:00-03:00';

const WAITING_NOTICE = 'O TSE já publicou a lista de candidatos, mas nenhum voto foi apurado ainda.';

// Formato dos arquivos do TSE: só os campos que usamos.
interface TseConfig {
  pl: { c: string; dt: string; e: { cd: string; abr: { cd: string; cp: { cd: string }[] }[] }[] }[];
}

interface TseCandidate {
  n: string;
  sqcand: string;
  nmu: string;
  e: string;
  vap: string;
  pvap: string;
}

interface TseResults {
  dg: string;
  hg: string;
  carg: { agr: { par: { sg: string; cand: TseCandidate[] }[] }[] }[];
  s: { pst: string };
  e: { c: string };
  v: { vv: string; vb: string; tvn: string };
}

interface ElectionRef {
  code: string;
  date: string;
}

function parseInteger(value: string): number {
  return Number(value) || 0;
}

function parsePercentage(value: string): number {
  return Number(value.replace(',', '.')) || 0;
}

/** "04/10/2026" → "2026-10-04" */
function toIsoDate(tseDate: string): string {
  const [day, month, year] = tseDate.split('/');
  return `${year}-${month}-${day}`;
}

function todayInBrasilia(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** "ESCRITOR AUGUSTO DA SILVA" → "Escritor Augusto da Silva" */
function formatName(urnName: string): string {
  return urnName
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && LOWERCASE_NAME_WORDS.has(word) ? word : word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1),
    )
    .join(' ');
}

function photoUrl(electionCode: string, sqcand: string): string {
  return `${TSE_BASE_URL}/${ELECTION_CYCLE}/${electionCode}/fotos/br/${sqcand}.jpeg`;
}

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch {
    throw new ProviderUnavailableError('O TSE não respondeu. Tentando de novo em instantes.');
  }
  if (!response.ok) {
    throw new ProviderUnavailableError(`O TSE respondeu com erro ${response.status}. Tentando de novo em instantes.`);
  }
  return (await response.json()) as T;
}

/** Turno mais recente da eleição presidencial que já aconteceu (ou o primeiro, antes da eleição). */
function findPresidentialElection(config: TseConfig): ElectionRef | null {
  const elections = config.pl
    .filter((pleito) => pleito.c === ELECTION_CYCLE)
    .flatMap((pleito) =>
      pleito.e
        .filter((election) =>
          election.abr.some((scope) => scope.cd === 'br' && scope.cp.some((role) => role.cd === PRESIDENT_ROLE_CODE)),
        )
        .map((election) => ({ code: election.cd, date: toIsoDate(pleito.dt) })),
    )
    .sort((first, second) => first.date.localeCompare(second.date));

  const today = todayInBrasilia();
  const past = elections.filter((election) => election.date <= today);
  return past.at(-1) ?? elections[0] ?? null;
}

function toSnapshot(results: TseResults, electionCode: string): ElectionSnapshot {
  const candidates: UnrankedCandidate[] = results.carg[0].agr.flatMap((group) =>
    group.par.flatMap((party) =>
      party.cand.map((candidate) => ({
        number: parseInteger(candidate.n),
        name: formatName(candidate.nmu),
        party: party.sg,
        votes: parseInteger(candidate.vap),
        percentage: parsePercentage(candidate.pvap),
        elected: candidate.e === 's',
        photoUrl: photoUrl(electionCode, candidate.sqcand),
      })),
    ),
  );

  return {
    timestamp: new Date(`${toIsoDate(results.dg)}T${results.hg}-03:00`).toISOString(),
    totalizedPercentage: parsePercentage(results.s.pst),
    candidates: rankCandidates(candidates),
    validVotes: parseInteger(results.v.vv),
    blankVotes: parseInteger(results.v.vb),
    nullVotes: parseInteger(results.v.tvn),
    turnout: parseInteger(results.e.c),
  };
}

export class TseResultsService implements ElectionProvider {
  private election: ElectionRef | null = null;
  private electionCheckedAt = 0;
  private history: ElectionSnapshot[] = [];
  private lastResult: ProviderResult | null = null;
  private lastFetchAt = 0;
  private inFlight: Promise<ProviderResult> | null = null;

  /** Não importa quantos amigos estejam com o link aberto: o TSE é consultado no máximo a cada 15s. */
  async load(): Promise<ProviderResult> {
    if (this.lastResult && Date.now() - this.lastFetchAt < POLL_INTERVAL_MS) {
      return this.lastResult;
    }
    this.inFlight ??= this.refresh().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async refresh(): Promise<ProviderResult> {
    const election = await this.getElection();
    if (!election) {
      return { history: [], notice: 'O TSE ainda não publicou a configuração da eleição presidencial de 2026.' };
    }

    const paddedCode = election.code.padStart(6, '0');
    const results = await fetchJson<TseResults>(
      `${TSE_BASE_URL}/${ELECTION_CYCLE}/${election.code}/dados/br/br-c0001-e${paddedCode}-u.json`,
    );
    const snapshot = toSnapshot(results, election.code);
    this.record(snapshot);

    this.lastResult = {
      history: this.history,
      notice: this.history.length === 0 ? WAITING_NOTICE : null,
      lineup: snapshot.candidates,
      releaseAt: new Date(`${election.date}T${RELEASE_TIME}`).toISOString(),
    };
    this.lastFetchAt = Date.now();
    return this.lastResult;
  }

  private async getElection(): Promise<ElectionRef | null> {
    if (this.election && Date.now() - this.electionCheckedAt < CONFIG_TTL_MS) {
      return this.election;
    }
    const config = await fetchJson<TseConfig>(`${TSE_BASE_URL}/comum/config/ele-c.json`);
    const election = findPresidentialElection(config);
    if (election?.code !== this.election?.code) {
      // Novo turno: o histórico recomeça do zero.
      this.history = [];
    }
    this.election = election;
    this.electionCheckedAt = Date.now();
    return election;
  }

  private record(snapshot: ElectionSnapshot): void {
    if (snapshot.totalizedPercentage <= 0) {
      return;
    }
    const last = this.history.at(-1);
    if (last?.totalizedPercentage === snapshot.totalizedPercentage && last.validVotes === snapshot.validVotes) {
      return;
    }
    this.history = [...this.history, snapshot];
  }
}
