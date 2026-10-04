import { useEffect, useRef, useState } from 'react';
import type { CandidateResult } from '@shared/types';

const DISPLAY_DURATION_MS = 3_500;

interface LeadChangeOverlayProps {
  leader: CandidateResult | null;
}

/** Aviso especial quando muda quem está na frente. Não dispara no primeiro carregamento. */
export function LeadChangeOverlay({ leader }: LeadChangeOverlayProps) {
  const leaderNumber = leader?.number ?? null;
  const leaderName = leader?.name ?? null;
  const previousLeaderNumber = useRef(leaderNumber);
  const [announcedName, setAnnouncedName] = useState<string | null>(null);

  useEffect(() => {
    const previous = previousLeaderNumber.current;
    previousLeaderNumber.current = leaderNumber;
    if (previous === null || leaderNumber === null || previous === leaderNumber) {
      return;
    }
    setAnnouncedName(leaderName);
  }, [leaderNumber, leaderName]);

  useEffect(() => {
    if (announcedName === null) {
      return;
    }
    const timer = window.setTimeout(() => setAnnouncedName(null), DISPLAY_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [announcedName]);

  return (
    <div
      role="status"
      aria-live="assertive"
      className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-4"
    >
      {announcedName && (
        <div className="lead-change-pop rounded-2xl border border-heat-hot bg-raised px-6 py-4 text-center shadow-2xl">
          <p className="font-display text-sm font-semibold text-heat-hot">Troca na liderança</p>
          <p className="mt-1 font-display text-2xl font-bold">{announcedName} passa à frente</p>
        </div>
      )}
    </div>
  );
}
