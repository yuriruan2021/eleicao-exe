import { formatClock, formatPercentage } from '@shared/format';
import type { ElectionStatus } from '@shared/types';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { STATUS_PRESENTATION } from '@/utils/statusPresentation';

const SEGMENT_COUNT = 20;

interface TotalizationBarProps {
  status: ElectionStatus;
  totalizedPercentage: number;
  updatedAt: string;
}

export function TotalizationBar({ status, totalizedPercentage, updatedAt }: TotalizationBarProps) {
  const animatedPercentage = useAnimatedNumber(totalizedPercentage);
  const filledSegments = (totalizedPercentage / 100) * SEGMENT_COUNT;
  const { emoji, label } = STATUS_PRESENTATION[status];

  return (
    <section aria-label="Andamento da totalização" className="mb-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-display text-sm font-semibold">
          <span aria-hidden>{emoji}</span> {label}
        </p>
        <p className="text-xs text-dim">Atualizado às {formatClock(updatedAt)}</p>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div
          role="progressbar"
          aria-label="Seções totalizadas"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(totalizedPercentage)}
          className="grid flex-1 grid-cols-20 gap-[3px]"
        >
          {Array.from({ length: SEGMENT_COUNT }, (_, index) => {
            const fill = Math.min(Math.max(filledSegments - index, 0), 1);
            return (
              <span key={index} className="relative h-3.5 overflow-hidden rounded-[2px] bg-line">
                <span
                  className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-700 ease-out"
                  style={{ width: `${fill * 100}%` }}
                />
              </span>
            );
          })}
        </div>
        <p className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
          {formatPercentage(animatedPercentage)}
        </p>
      </div>
      <p className="mt-1 text-xs text-dim">das seções totalizadas</p>
    </section>
  );
}
