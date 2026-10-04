import type { CandidateResult, ElectionSnapshot, ElectionStatus } from './types';

const ADVANCED_TOTALIZATION_PERCENTAGE = 50;

export type UnrankedCandidate = Omit<CandidateResult, 'position'>;

export interface Duel {
  leader: CandidateResult;
  runnerUp: CandidateResult;
  marginPp: number;
  marginVotes: number;
}

export function rankCandidates(candidates: readonly UnrankedCandidate[]): CandidateResult[] {
  return [...candidates]
    .sort((first, second) => second.votes - first.votes || first.number - second.number)
    .map((candidate, index) => ({ ...candidate, position: index + 1 }));
}

export function getDuel(snapshot: ElectionSnapshot): Duel | null {
  const [leader, runnerUp] = snapshot.candidates;
  if (!leader || !runnerUp) {
    return null;
  }

  return {
    leader,
    runnerUp,
    marginPp: leader.percentage - runnerUp.percentage,
    marginVotes: leader.votes - runnerUp.votes,
  };
}

export function getElectionStatus(snapshot: ElectionSnapshot | null): ElectionStatus {
  if (!snapshot || snapshot.totalizedPercentage <= 0) {
    return 'aguardando';
  }
  if (snapshot.totalizedPercentage >= 100) {
    return 'finalizado';
  }
  if (snapshot.totalizedPercentage >= ADVANCED_TOTALIZATION_PERCENTAGE) {
    return 'avancando';
  }
  return 'ao-vivo';
}
