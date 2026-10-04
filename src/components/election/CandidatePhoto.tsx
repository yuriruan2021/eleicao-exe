import { useState } from 'react';
import type { CandidateResult } from '@shared/types';
import { cn } from '@/lib/utils';

interface CandidatePhotoProps {
  candidate: CandidateResult;
  className?: string;
  /** Cor do anel em volta da foto (ex.: destaque de quem está na frente). */
  ringColor?: string;
}

function getInitials(name: string): string {
  const words = name.split(' ').filter((word) => word.length > 2);
  return words.length > 1 ? `${words[0][0]}${words.at(-1)![0]}` : name.slice(0, 2);
}

/** Foto oficial do TSE. Sem foto (modo demonstração) não ocupa espaço; se a imagem falhar, mostra as iniciais. */
export function CandidatePhoto({ candidate, className, ringColor }: CandidatePhotoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const { photoUrl, name } = candidate;
  if (!photoUrl) {
    return null;
  }

  const ringStyle = ringColor ? { boxShadow: `0 0 0 2px var(--color-panel), 0 0 0 4px ${ringColor}` } : undefined;
  const baseClassName = cn('shrink-0 overflow-hidden rounded-full bg-line', className);

  if (failedUrl === photoUrl) {
    return (
      <span
        aria-hidden
        className={cn(baseClassName, 'flex items-center justify-center font-display font-semibold text-dim uppercase')}
        style={ringStyle}
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={`Foto de ${name}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedUrl(photoUrl)}
      className={cn(baseClassName, 'object-cover object-top')}
      style={ringStyle}
    />
  );
}
