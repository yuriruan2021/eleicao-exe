import { OFFICIAL_SOURCE } from '@shared/source';
import { CreatorFooterCredit } from './CreatorCredit';

export function SourceFooter() {
  return (
    <footer className="mt-12 flex flex-col-reverse gap-4 border-t border-line py-6 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p>
          Dados eleitorais:{' '}
          <a
            href={OFFICIAL_SOURCE.url}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            {OFFICIAL_SOURCE.name}
          </a>
        </p>
        <p className="mt-1">Este site é independente e não possui vínculo com o TSE.</p>
      </div>
      <CreatorFooterCredit />
    </footer>
  );
}
