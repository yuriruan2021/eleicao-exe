import { RefreshCw } from 'lucide-react';
import { formatDay } from '@shared/format';
import type { CandidateResult } from '@shared/types';
import { CandidatePhoto } from '@/components/election/CandidatePhoto';
import { WindowTitle } from '@/components/layout/WindowTitle';
import { Button } from '@/components/ui/button';
import { useNow } from '@/hooks/useNow';

interface WaitingStateProps {
  notice: string | null;
  lineup: CandidateResult[];
  releaseAt: string | null;
  demoEnabled: boolean;
  onEnableDemo: () => void;
}

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function splitDuration(ms: number) {
  return {
    days: Math.floor(ms / DAY_MS),
    hours: Math.floor((ms % DAY_MS) / HOUR_MS),
    minutes: Math.floor((ms % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((ms % MINUTE_MS) / SECOND_MS),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="w-16 rounded-xl border border-line bg-raised/80 px-2 py-3 sm:w-20">
      <p className="font-display text-3xl leading-none font-bold tabular-nums sm:text-4xl">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-1.5 text-[0.65rem] tracking-widest text-dim uppercase">{label}</p>
    </div>
  );
}

function Countdown({ remainingMs }: { remainingMs: number }) {
  const { days, hours, minutes, seconds } = splitDuration(remainingMs);
  const label = `Faltam ${days > 0 ? `${days} dias, ` : ''}${hours} horas, ${minutes} minutos e ${seconds} segundos`;

  return (
    <div role="timer" aria-label={label} className="mt-6 flex justify-center gap-2 sm:gap-3">
      {days > 0 && <CountdownUnit value={days} label={days === 1 ? 'dia' : 'dias'} />}
      <CountdownUnit value={hours} label="horas" />
      <CountdownUnit value={minutes} label="min" />
      <CountdownUnit value={seconds} label="seg" />
    </div>
  );
}

function Lineup({ candidates }: { candidates: CandidateResult[] }) {
  return (
    <div className="border-t border-line p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">Na disputa</h3>
        <p className="text-xs text-dim">{candidates.length} candidatos, em ordem de número</p>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {candidates.map((candidate) => (
          <li
            key={candidate.number}
            className="flex items-center gap-3 rounded-xl border border-line bg-raised/60 p-3 transition-colors hover:border-dim/60"
          >
            {candidate.photoUrl ? (
              <CandidatePhoto candidate={candidate} className="size-12 text-sm" />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-line font-display text-lg font-bold text-dim">
                {candidate.number}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-display font-semibold">{candidate.name}</p>
              <p className="truncate text-xs text-dim">
                {candidate.party} · <span className="tabular-nums">{candidate.number}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WaitingState({ notice, lineup, releaseAt, demoEnabled, onEnableDemo }: WaitingStateProps) {
  const now = useNow();
  const remainingMs = releaseAt ? Date.parse(releaseAt) - now : null;
  const isBeforeRelease = remainingMs !== null && remainingMs > 0;

  let description = 'A divulgação oficial começa às 17h (horário de Brasília).';
  if (releaseAt && isBeforeRelease) {
    description = `A divulgação oficial começa ${formatDay(releaseAt, new Date(now))}, às 17h (horário de Brasília).`;
  } else if (releaseAt) {
    description = 'As urnas já fecharam. Os primeiros números podem chegar a qualquer momento.';
  }

  return (
    <section aria-labelledby="waiting-title" className="overflow-hidden rounded-2xl border border-line bg-panel">
      <WindowTitle>~/eleicao.exe/apuracao · aguardando</WindowTitle>

      <div
        className="px-5 py-10 text-center sm:px-8 sm:py-14"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgb(240 162 58 / 0.12), transparent 65%)' }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-heat-warm/40 bg-heat-warm/10 px-3 py-1 font-display text-xs font-semibold tracking-wide text-heat-warm uppercase">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-heat-warm opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-heat-warm" />
          </span>
          {isBeforeRelease ? 'Contagem regressiva' : 'Aguardando o TSE'}
        </span>

        <h2 id="waiting-title" className="mt-5 font-display text-3xl leading-tight font-bold sm:text-4xl">
          Aguardando os primeiros números
          <span aria-hidden className="cursor-block" />
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-dim sm:text-base">{description}</p>

        {isBeforeRelease && <Countdown remainingMs={remainingMs} />}

        <div className="mx-auto mt-8 max-w-md space-y-2 text-left">
          <p className="flex items-center justify-center gap-2 text-xs text-dim">
            <RefreshCw aria-hidden className="size-3.5 animate-[spin_3s_linear_infinite]" />
            Esta página se atualiza sozinha.
          </p>
          {notice && (
            <p className="rounded-lg border border-dashed border-line bg-void/50 px-3 py-2 font-mono text-xs leading-relaxed text-ink/80">
              <span aria-hidden className="text-heat-warm">&gt; </span>
              {notice}
            </p>
          )}
        </div>

        {!demoEnabled && (
          <Button variant="outline" className="mt-6" onClick={onEnableDemo}>
            Testar com números fictícios
          </Button>
        )}
      </div>

      {lineup.length > 0 && <Lineup candidates={lineup} />}
    </section>
  );
}
