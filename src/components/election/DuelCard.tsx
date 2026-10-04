import type { Duel } from '@shared/election';
import { DUEL_COLORS, orderBySlot } from '@/utils/duel';
import { CandidateSide } from './CandidateSide';
import { DuelBar } from './DuelBar';
import { MarginDisplay } from './MarginDisplay';

interface DuelCardProps {
  duel: Duel;
}

export function DuelCard({ duel }: DuelCardProps) {
  const [left, right] = orderBySlot(duel);
  const leftShare = (left.percentage / (left.percentage + right.percentage)) * 100;

  return (
    <section aria-labelledby="duel-title" className="rounded-2xl border border-line bg-panel p-5 sm:p-7">
      <h2 id="duel-title" className="sr-only">
        O duelo: os dois primeiros colocados
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <CandidateSide
          candidate={left}
          isLeader={left.number === duel.leader.number}
          align="left"
          color={DUEL_COLORS[0]}
        />
        <CandidateSide
          candidate={right}
          isLeader={right.number === duel.leader.number}
          align="right"
          color={DUEL_COLORS[1]}
        />
      </div>
      <DuelBar leftShare={leftShare} leftColor={DUEL_COLORS[0]} rightColor={DUEL_COLORS[1]} />
      <MarginDisplay marginVotes={duel.marginVotes} marginPp={duel.marginPp} />
    </section>
  );
}
