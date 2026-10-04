export type ElectionStatus = 'aguardando' | 'ao-vivo' | 'avancando' | 'finalizado';

export type DataMode = 'oficial' | 'demo';

export interface CandidateResult {
  number: number;
  name: string;
  party: string;
  votes: number;
  /** Percentual sobre os votos válidos (0–100). */
  percentage: number;
  position: number;
  /** Só é verdadeiro quando a fonte oficial indica eleição. Nunca é inferido. */
  elected: boolean;
  /** Foto oficial publicada pelo TSE. Nula no modo demonstração ou quando a fonte não tem foto. */
  photoUrl: string | null;
}

export interface ElectionSnapshot {
  timestamp: string;
  /** Percentual de seções totalizadas (0–100). */
  totalizedPercentage: number;
  /** Sempre ordenados do mais votado para o menos votado. */
  candidates: CandidateResult[];
  validVotes: number;
  blankVotes: number;
  nullVotes: number;
  turnout: number | null;
}

export type NarratorEventKind =
  | 'inicio'
  | 'lideranca'
  | 'diferenca-caiu'
  | 'diferenca-subiu'
  | 'marco'
  | 'final';

export interface NarratorEvent {
  id: string;
  timestamp: string;
  kind: NarratorEventKind;
  message: string;
}

export interface DataSource {
  name: string;
  url: string;
}

export interface ElectionPayload {
  mode: DataMode;
  status: ElectionStatus;
  current: ElectionSnapshot | null;
  history: ElectionSnapshot[];
  events: NarratorEvent[];
  /** Candidatos na disputa, já disponíveis antes do primeiro voto apurado. Vazio se a fonte ainda não publicou. */
  lineup: CandidateResult[];
  /** Horário previsto para o início da divulgação oficial. Nulo quando desconhecido. */
  releaseAt: string | null;
  source: DataSource;
  notice: string | null;
  generatedAt: string;
}

export interface ApiErrorBody {
  error: string;
}
