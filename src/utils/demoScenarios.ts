import type { DemoScenario } from '@shared/demo';

export const DEMO_SCENARIO_LABELS: Record<DemoScenario, string> = {
  virada: 'Virada no fim',
  apertada: 'Briga voto a voto',
  folgada: 'Vantagem folgada',
  finalizado: '100% totalizado',
  erro: 'Fonte instável',
  'sem-dados': 'Sem dados ainda',
  comemoracao: '🎉 Comemoração',
};
