import type { ReactNode } from 'react';

/** Barra de "janela de terminal" no topo dos painéis. */
export function WindowTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-line bg-raised/60 px-4 py-2.5">
      <span aria-hidden className="size-2.5 rounded-full bg-heat-hot/80" />
      <span aria-hidden className="size-2.5 rounded-full bg-heat-warm/80" />
      <span aria-hidden className="size-2.5 rounded-full bg-heat-calm" />
      <span className="ml-2 font-display text-xs tracking-wide text-dim">{children}</span>
    </div>
  );
}
