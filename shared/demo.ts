export const DEMO_SCENARIOS = [
  'virada',
  'apertada',
  'folgada',
  'finalizado',
  'erro',
  'sem-dados',
  'comemoracao',
] as const;

export type DemoScenario = (typeof DEMO_SCENARIOS)[number];

export function isDemoScenario(value: string | null): value is DemoScenario {
  return DEMO_SCENARIOS.some((scenario) => scenario === value);
}
