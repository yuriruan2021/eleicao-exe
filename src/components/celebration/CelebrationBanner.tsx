import type { CandidateResult } from '@shared/types';
import { CandidatePhoto } from '@/components/election/CandidatePhoto';

interface CelebrationBannerProps {
  winner: CandidateResult;
  isSimulation: boolean;
  onReplay: () => void;
}

/** Faixa dourada que fica no painel depois que a tela de comemoração é fechada. */
export function CelebrationBanner({ winner, isSimulation, onReplay }: CelebrationBannerProps) {
  return (
    <section
      aria-label="Comemoração"
      className="gold-stripes mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-gold/50 px-5 py-4"
    >
      <div className="relative">
        <CandidatePhoto candidate={winner} ringColor="var(--color-gold)" className="size-12 text-sm" />
        <span aria-hidden className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-12 text-xl">
          👑
        </span>
      </div>
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-display text-[0.7rem] font-semibold tracking-widest text-gold uppercase sm:text-xs">
          {isSimulation ? 'Simulação · números fictícios' : 'Segundo o TSE'}
        </p>
        <p className="font-display text-lg leading-tight font-bold sm:text-2xl">
          🏆 {winner.name} eleito Presidente
        </p>
      </div>
      <button
        type="button"
        onClick={onReplay}
        className="w-full rounded-lg border border-gold/60 bg-void/40 px-3.5 py-2 font-display text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-void sm:w-auto"
      >
        🎉 Rever comemoração
      </button>
    </section>
  );
}
