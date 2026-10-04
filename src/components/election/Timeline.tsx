import { getDuel } from '@shared/election';
import { formatClock, formatPercentage, formatPp } from '@shared/format';
import type { ElectionSnapshot } from '@shared/types';
import { sampleTimeline } from '@/utils/timeline';

const TIMELINE_WINDOW_MINUTES = 15;
const MAX_ROWS = 16;

interface TimelineProps {
  history: ElectionSnapshot[];
}

export function Timeline({ history }: TimelineProps) {
  const rows = sampleTimeline(history, TIMELINE_WINDOW_MINUTES).slice(-MAX_ROWS).reverse();

  return (
    <section aria-labelledby="timeline-title" className="rounded-2xl border border-line bg-panel p-5">
      <h2 id="timeline-title" className="font-display text-lg font-semibold">
        Linha do tempo
      </h2>
      <ol className="mt-2 divide-y divide-line">
        {rows.map((snapshot) => {
          const duel = getDuel(snapshot);
          return (
            <li key={snapshot.timestamp} className="grid grid-cols-[3.25rem_1fr_auto] items-baseline gap-3 py-2 text-sm">
              <time dateTime={snapshot.timestamp} className="font-display text-dim tabular-nums">
                {formatClock(snapshot.timestamp)}
              </time>
              <span className="min-w-0 truncate">
                {duel ? (
                  <>
                    {duel.leader.name} <span className="text-dim">+{formatPp(duel.marginPp)}</span>
                  </>
                ) : (
                  <span className="text-dim">Sem duelo definido</span>
                )}
              </span>
              <span className="text-xs text-dim tabular-nums">
                {formatPercentage(snapshot.totalizedPercentage, 1)}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-dim">Última posição de cada janela de 15 minutos, com o percentual totalizado.</p>
    </section>
  );
}
