import { formatPercentage, formatVotes } from '@shared/format';
import type { CandidateResult } from '@shared/types';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useChangeFlash } from '@/hooks/useChangeFlash';
import { cn } from '@/lib/utils';
import { CandidatePhoto } from './CandidatePhoto';

interface CandidateSideProps {
  candidate: CandidateResult;
  isLeader: boolean;
  align: 'left' | 'right';
  color: string;
}

export function CandidateSide({ candidate, isLeader, align, color }: CandidateSideProps) {
  const percentage = useAnimatedNumber(candidate.percentage);
  const votes = useAnimatedNumber(candidate.votes);
  const isFlashing = useChangeFlash(candidate.votes);
  const isRight = align === 'right';

  return (
    <div className={cn('flex min-w-0 flex-col', isRight && 'items-end text-right')}>
      <div className="relative w-fit">
        <CandidatePhoto
          candidate={candidate}
          ringColor={candidate.elected ? 'var(--color-gold)' : isLeader ? color : undefined}
          className={cn('mb-3 size-16 text-lg sm:size-24 sm:text-2xl', !isLeader && 'opacity-75 grayscale-[35%]')}
        />
        {candidate.elected && candidate.photoUrl && (
          <span aria-hidden className="absolute -top-4 left-1/2 -translate-x-1/2 -rotate-12 text-2xl sm:-top-5 sm:text-3xl">
            👑
          </span>
        )}
      </div>
      <p className={cn('flex items-center gap-2 text-xs text-dim', isRight && 'flex-row-reverse')}>
        <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        {candidate.party} {candidate.number}
      </p>
      <p
        className={cn(
          'mt-1.5 font-display text-lg leading-tight font-semibold sm:text-2xl',
          isLeader ? 'text-ink' : 'text-ink/65',
        )}
      >
        {candidate.name}
      </p>

      <p
        className={cn(
          '-mx-1 mt-3 rounded px-1 font-display text-3xl font-bold tabular-nums min-[400px]:text-4xl sm:text-6xl',
          !isLeader && 'text-ink/65',
          isFlashing && 'flash-highlight',
        )}
        style={isLeader ? { color } : undefined}
      >
        {formatPercentage(percentage)}
      </p>
      <p className="mt-1 text-sm text-dim tabular-nums">{formatVotes(votes)} votos</p>

      {isLeader && (
        <span className="mt-3 w-fit rounded-full border px-2.5 py-0.5 text-xs" style={{ borderColor: color, color }}>
          Na frente
        </span>
      )}
      {candidate.elected && <span className="mt-2 text-xs font-semibold text-gold">Eleito(a), segundo o TSE</span>}
    </div>
  );
}
