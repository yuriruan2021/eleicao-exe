import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CREATOR = {
  name: 'Yuri Ruan',
  initials: 'YR',
  linkedinUrl: 'https://www.linkedin.com/in/yuriruan',
} as const;

const LINKEDIN_BLUE = '#0a66c2';

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function LinkedInButton({ className }: { className?: string }) {
  return (
    <a
      href={CREATOR.linkedinUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`LinkedIn de ${CREATOR.name} (abre em nova aba)`}
      className={cn(
        'group inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-display text-sm font-semibold text-white transition-[filter] hover:brightness-110',
        className,
      )}
      style={{ backgroundColor: LINKEDIN_BLUE }}
    >
      <LinkedInIcon className="size-4" />
      LinkedIn
      <ArrowUpRight
        aria-hidden
        className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  );
}

/** Cartão de destaque, usado no "Sobre". */
export function CreatorCard() {
  return (
    <div
      className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-line p-4"
      style={{ background: 'linear-gradient(135deg, rgb(10 102 194 / 0.16), transparent 70%)' }}
    >
      <span
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${LINKEDIN_BLUE}, var(--color-cand-a))` }}
      >
        {CREATOR.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs tracking-widest text-dim uppercase">Criado por</p>
        <p className="font-display text-xl leading-tight font-bold">{CREATOR.name}</p>
      </div>
      <LinkedInButton />
    </div>
  );
}

/** Versão compacta, usada no rodapé de todas as telas. */
export function CreatorFooterCredit() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm text-ink">
        Criado por <span className="font-display font-bold">{CREATOR.name}</span>
      </p>
      <LinkedInButton className="px-2.5 py-1 text-xs" />
    </div>
  );
}
