import { formatPercentage, formatVotes } from '@shared/format';
import type { ElectionSnapshot } from '@shared/types';
import { CandidatePhoto } from './CandidatePhoto';

interface ScoreboardProps {
  snapshot: ElectionSnapshot;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-dim">{label}</dt>
      <dd className="mt-0.5 font-display text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function Scoreboard({ snapshot }: ScoreboardProps) {
  return (
    <section aria-labelledby="scoreboard-title" className="rounded-2xl border border-line bg-panel p-5">
      <h2 id="scoreboard-title" className="font-display text-lg font-semibold">
        Placar completo
      </h2>

      <ol className="mt-2 divide-y divide-line">
        {snapshot.candidates.map((candidate) => (
          <li key={candidate.number} className="flex items-center gap-3 py-2.5">
            <span className="w-7 font-display text-dim tabular-nums">{candidate.position}º</span>
            <CandidatePhoto candidate={candidate} className="size-9 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate">{candidate.name}</p>
              <p className="text-xs text-dim">
                {candidate.party} {candidate.number}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display font-semibold tabular-nums">{formatPercentage(candidate.percentage)}</p>
              <p className="text-xs text-dim tabular-nums">{formatVotes(candidate.votes)}</p>
            </div>
          </li>
        ))}
      </ol>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
        <Stat label="Votos válidos" value={formatVotes(snapshot.validVotes)} />
        <Stat label="Brancos" value={formatVotes(snapshot.blankVotes)} />
        <Stat label="Nulos" value={formatVotes(snapshot.nullVotes)} />
        <Stat
          label="Comparecimento"
          value={snapshot.turnout === null ? 'Indisponível' : formatVotes(snapshot.turnout)}
        />
      </dl>
      <p className="mt-3 text-xs text-dim">Percentuais calculados sobre os votos válidos, como faz o TSE.</p>
    </section>
  );
}
