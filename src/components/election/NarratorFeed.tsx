import { formatClock } from '@shared/format';
import type { NarratorEvent, NarratorEventKind } from '@shared/types';
import { cn } from '@/lib/utils';

const EVENT_ACCENTS: Record<NarratorEventKind, string> = {
  inicio: 'border-l-ink',
  lideranca: 'border-l-heat-hot',
  'diferenca-caiu': 'border-l-heat-warm',
  'diferenca-subiu': 'border-l-heat-calm',
  marco: 'border-l-line',
  final: 'border-l-ink',
};

interface NarratorFeedProps {
  events: NarratorEvent[];
}

export function NarratorFeed({ events }: NarratorFeedProps) {
  const newestFirst = [...events].reverse();

  return (
    <section aria-labelledby="narrator-title" className="rounded-2xl border border-line bg-panel p-5">
      <h2 id="narrator-title" className="font-display text-lg font-semibold">
        <span aria-hidden>🎙️</span> Narrador da apuração
      </h2>

      {newestFirst.length === 0 ? (
        <p className="mt-3 text-sm text-dim">Quando algo importante acontecer, o narrador avisa aqui.</p>
      ) : (
        <ol className="mt-3 max-h-[30rem] space-y-3 overflow-y-auto pr-1">
          {newestFirst.map((event) => (
            <li key={event.id} className={cn('border-l-2 py-0.5 pl-3', EVENT_ACCENTS[event.kind])}>
              <time dateTime={event.timestamp} className="block font-display text-xs text-dim tabular-nums">
                {formatClock(event.timestamp)}
              </time>
              <p className="text-sm leading-relaxed">{event.message}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
