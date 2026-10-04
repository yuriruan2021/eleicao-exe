import { formatPercentage } from '@shared/format';

interface DuelBarProps {
  leftShare: number;
  leftColor: string;
  rightColor: string;
}

/** Cabo de guerra: a marca central é o empate entre os dois. */
export function DuelBar({ leftShare, leftColor, rightColor }: DuelBarProps) {
  const rightShare = 100 - leftShare;

  return (
    <div className="mt-7">
      <div
        role="img"
        aria-label={`Divisão entre os dois primeiros: ${formatPercentage(leftShare, 1)} contra ${formatPercentage(rightShare, 1)}`}
        className="relative"
      >
        <div className="flex h-5 gap-[2px] overflow-hidden rounded-full">
          <div
            className="transition-[width] duration-700 ease-out"
            style={{ width: `${leftShare}%`, backgroundColor: leftColor }}
          />
          <div className="flex-1" style={{ backgroundColor: rightColor }} />
        </div>
        <div aria-hidden className="absolute -top-1.5 -bottom-1.5 left-1/2 w-[3px] -translate-x-1/2 rounded bg-ink" />
      </div>
      <p className="mt-2 text-center text-[11px] text-dim">empate</p>
    </div>
  );
}
