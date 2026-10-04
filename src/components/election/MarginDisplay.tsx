import { formatPp, formatVotes } from '@shared/format';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

interface MarginDisplayProps {
  marginVotes: number;
  marginPp: number;
}

export function MarginDisplay({ marginVotes, marginPp }: MarginDisplayProps) {
  const animatedVotes = useAnimatedNumber(marginVotes);

  return (
    <div className="mt-5 text-center">
      <p className="text-sm text-dim">Diferença</p>
      <p className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">
        {formatVotes(animatedVotes)} <span className="text-lg font-medium text-dim">votos</span>
      </p>
      <p className="text-sm text-dim tabular-nums">{formatPp(marginPp)}</p>
    </div>
  );
}
