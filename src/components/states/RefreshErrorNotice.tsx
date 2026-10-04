import { formatClock } from '@shared/format';

interface RefreshErrorNoticeProps {
  message: string;
  lastSuccessAt: number;
}

/** A atualização falhou, mas ainda temos o último dado bom: avisa sem esconder o placar. */
export function RefreshErrorNotice({ message, lastSuccessAt }: RefreshErrorNoticeProps) {
  return (
    <p role="status" className="mb-4 rounded-lg border border-heat-warm/50 bg-heat-warm/10 px-4 py-2.5 text-sm">
      {message} Mostrando os dados recebidos às {formatClock(new Date(lastSuccessAt).toISOString())}. Uma nova
      tentativa acontece automaticamente.
    </p>
  );
}
