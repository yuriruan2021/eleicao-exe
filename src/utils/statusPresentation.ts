import type { ElectionStatus } from '@shared/types';

export const STATUS_PRESENTATION: Record<ElectionStatus, { emoji: string; label: string }> = {
  aguardando: { emoji: '🟡', label: 'AGUARDANDO APURAÇÃO' },
  'ao-vivo': { emoji: '🟢', label: 'APURAÇÃO AO VIVO' },
  avancando: { emoji: '🔵', label: 'TOTALIZAÇÃO AVANÇANDO' },
  finalizado: { emoji: '🏁', label: 'RESULTADO FINALIZADO' },
};
