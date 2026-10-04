import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { formatPercentage, formatVotes } from '@shared/format';
import type { CandidateResult } from '@shared/types';
import { CandidatePhoto } from '@/components/election/CandidatePhoto';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { FRIENDS, getFriendInitials } from '@/utils/friends';
import { Fireworks } from './Fireworks';

const COUNT_UP_DELAY_MS = 600;
const FIRST_FRIEND_DELAY_S = 1.4;
const FRIEND_STAGGER_S = 0.3;

interface CelebrationOverlayProps {
  winner: CandidateResult;
  isSimulation: boolean;
  onClose: () => void;
}

function delay(seconds: number): CSSProperties {
  return { animationDelay: `${seconds}s` };
}

export function CelebrationOverlay({ winner, isSimulation, onClose }: CelebrationOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [hasCountedUp, setHasCountedUp] = useState(false);
  const percentage = useAnimatedNumber(hasCountedUp ? winner.percentage : 0);
  const votes = useAnimatedNumber(hasCountedUp ? winner.votes : 0);

  useEffect(() => {
    const timer = window.setTimeout(() => setHasCountedUp(true), COUNT_UP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Trava a rolagem da página, foca o botão e fecha com Esc.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto bg-void/95 backdrop-blur-sm"
      style={{ backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgb(255 209 102 / 0.22), transparent 60%)' }}
    >
      <Fireworks intensity="full" className="fixed inset-0 size-full" />

      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col items-center px-4 py-10 text-center sm:py-14">
        {isSimulation ? (
          <p className="celebration-rise rounded-full border border-demo/60 bg-demo/15 px-3 py-1 font-display text-xs font-semibold tracking-widest text-demo uppercase">
            Simulação · números fictícios
          </p>
        ) : (
          <p className="celebration-rise rounded-full border border-gold/50 bg-gold/10 px-3 py-1 font-display text-xs font-semibold tracking-widest text-gold uppercase">
            Resultado oficial · segundo o TSE
          </p>
        )}

        <div className="celebration-rise relative mt-10" style={delay(0.15)}>
          <span
            aria-hidden
            className="gold-text pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[11rem] leading-none font-bold opacity-25 select-none sm:text-[15rem]"
          >
            {winner.number}
          </span>
          <span aria-hidden className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 -rotate-12 text-5xl sm:-top-11 sm:text-6xl">
            👑
          </span>
          <CandidatePhoto
            candidate={winner}
            ringColor="var(--color-gold)"
            className="celebration-glow relative size-36 text-4xl sm:size-44"
          />
        </div>

        <p
          className="celebration-rise mt-8 font-display text-xs font-semibold tracking-[0.2em] text-gold uppercase sm:text-base sm:tracking-[0.35em]"
          style={delay(0.35)}
        >
          Eleito Presidente da República
        </p>
        <h2
          id="celebration-title"
          className="celebration-rise gold-text mt-2 font-display text-[2.6rem] leading-none font-bold break-words uppercase min-[420px]:text-5xl sm:text-7xl"
          style={delay(0.45)}
        >
          {winner.name}
        </h2>
        <p className="celebration-rise mt-3 text-sm text-dim" style={delay(0.55)}>
          {winner.party} · {winner.number}
        </p>

        <div className="celebration-rise mt-8 grid w-full max-w-md grid-cols-2 gap-2 sm:gap-3" style={delay(0.65)}>
          <div className="min-w-0 rounded-xl border border-gold/40 bg-panel/80 px-2 py-3 sm:px-4">
            <p className="font-display text-2xl font-bold text-gold tabular-nums min-[420px]:text-3xl sm:text-4xl">
              {formatPercentage(percentage)}
            </p>
            <p className="mt-1 text-xs text-dim">dos votos válidos</p>
          </div>
          <div className="min-w-0 rounded-xl border border-gold/40 bg-panel/80 px-2 py-3 sm:px-4">
            <p className="font-display text-2xl font-bold tabular-nums min-[420px]:text-3xl sm:text-4xl">
              {formatVotes(votes)}
            </p>
            <p className="mt-1 text-xs text-dim">votos</p>
          </div>
        </div>

        <section aria-labelledby="celebration-friends-title" className="mt-12 w-full">
          <h3
            id="celebration-friends-title"
            className="celebration-rise font-display text-lg font-semibold"
            style={delay(FIRST_FRIEND_DELAY_S - FRIEND_STAGGER_S)}
          >
            O grupo reage
          </h3>
          <ul className="mt-4 grid gap-3 text-left sm:grid-cols-2">
            {FRIENDS.map(({ name, color, celebrationMessage }, index) => (
              <li
                key={name}
                className="celebration-rise flex items-start gap-3 rounded-xl border border-line bg-panel/85 p-3.5 sm:odd:last:col-span-2"
                style={{ ...delay(FIRST_FRIEND_DELAY_S + index * FRIEND_STAGGER_S), borderLeftColor: color, borderLeftWidth: 3 }}
              >
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-void"
                  style={{ backgroundColor: color }}
                >
                  {getFriendInitials(name)}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold">{name}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink/90">{celebrationMessage}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="celebration-rise mt-10 rounded-xl bg-gold px-6 py-3 font-display text-base font-bold text-void transition-[filter] hover:brightness-110"
          style={delay(FIRST_FRIEND_DELAY_S + FRIENDS.length * FRIEND_STAGGER_S)}
        >
          Ver o resultado completo
        </button>
        <p className="mt-6 text-xs text-dim">ELEIÇÃO.EXE · criado por Yuri Ruan</p>
      </div>
    </div>
  );
}
