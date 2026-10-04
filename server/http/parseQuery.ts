import { isDemoScenario, type DemoScenario } from '../../shared/demo';
import type { DataMode } from '../../shared/types';

const DEFAULT_SCENARIO: DemoScenario = 'virada';
const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;

export function parseMode(value: unknown): DataMode {
  return value === 'demo' ? 'demo' : 'oficial';
}

export function parseScenario(value: unknown): DemoScenario {
  return typeof value === 'string' && isDemoScenario(value) ? value : DEFAULT_SCENARIO;
}

/** Aceita o início enviado pelo navegador, tolerando relógios um pouco diferentes do servidor. */
export function parseStartedAt(value: unknown, now: number): number {
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;
  const isReasonable = Number.isFinite(parsed) && Math.abs(now - parsed) < MAX_CLOCK_SKEW_MS;
  return isReasonable ? parsed : now;
}
