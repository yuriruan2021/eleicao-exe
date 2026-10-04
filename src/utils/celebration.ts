import type { CandidateResult, DataMode, ElectionPayload } from '@shared/types';

/** Número do candidato que o grupo comemora. */
export const CELEBRATED_CANDIDATE_NUMBER = 22;

const SEEN_STORAGE_KEY = 'eleicao-exe:comemoracao-vista';

/**
 * Só comemora com 100% totalizado e com o próprio TSE marcando o 22 como eleito.
 * Nunca deduz o resultado pelos percentuais: se a eleição for para o 2º turno, não há eleito ainda.
 */
export function getCelebratedWinner(payload: ElectionPayload | undefined): CandidateResult | null {
  if (!payload?.current || payload.status !== 'finalizado') {
    return null;
  }
  const winner = payload.current.candidates.find((candidate) => candidate.elected);
  return winner?.number === CELEBRATED_CANDIDATE_NUMBER ? winner : null;
}

/** No modo real a tela cheia aparece uma vez por navegador. No teste, sempre aparece. */
export function wasCelebrationSeen(mode: DataMode): boolean {
  if (mode === 'demo') {
    return false;
  }
  try {
    return window.localStorage.getItem(SEEN_STORAGE_KEY) === 'sim';
  } catch {
    return false;
  }
}

export function rememberCelebrationSeen(mode: DataMode): void {
  if (mode === 'demo') {
    return;
  }
  try {
    window.localStorage.setItem(SEEN_STORAGE_KEY, 'sim');
  } catch {
    // Sem armazenamento (aba anônima, por exemplo): a tela só volta a aparecer ao recarregar.
  }
}
