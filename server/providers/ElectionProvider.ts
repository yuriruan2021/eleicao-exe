import type { CandidateResult, ElectionSnapshot } from '../../shared/types';

export interface ProviderResult {
  /** Snapshots em ordem cronológica. O último é o estado atual. */
  history: ElectionSnapshot[];
  /** Aviso opcional para exibir na tela (ex.: fonte ainda sem dados). */
  notice: string | null;
  /** Candidatos na disputa, mesmo sem votos apurados. */
  lineup?: CandidateResult[];
  /** Horário previsto (ISO) para o início da divulgação oficial. */
  releaseAt?: string | null;
}

export interface ElectionProvider {
  load(): Promise<ProviderResult>;
}

/** Falha esperada da fonte de dados: o servidor responde 503 e o front mantém o último dado. */
export class ProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderUnavailableError';
  }
}
