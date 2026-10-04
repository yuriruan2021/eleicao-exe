import type { Duel } from '@shared/election';
import type { CandidateResult } from '@shared/types';

export const DUEL_COLORS = ['var(--color-cand-a)', 'var(--color-cand-b)'] as const;

/**
 * Lados fixos: o menor número fica à esquerda.
 * Assim ninguém troca de lado quando muda a liderança — quem está na frente é destacado.
 */
export function orderBySlot(duel: Duel): [CandidateResult, CandidateResult] {
  const { leader, runnerUp } = duel;
  return leader.number < runnerUp.number ? [leader, runnerUp] : [runnerUp, leader];
}
