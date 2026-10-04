import { useEffect, useState } from 'react';
import { isDemoScenario, type DemoScenario } from '@shared/demo';

const DEMO_URL_PARAM = 'demo';
const DEFAULT_SCENARIO: DemoScenario = 'virada';

export interface DemoSettings {
  enabled: boolean;
  scenario: DemoScenario;
  startedAt: number;
}

function readInitialSettings(): DemoSettings {
  const value = new URLSearchParams(window.location.search).get(DEMO_URL_PARAM);
  return {
    enabled: value !== null,
    scenario: isDemoScenario(value) ? value : DEFAULT_SCENARIO,
    startedAt: Date.now(),
  };
}

/** Guarda o modo demonstração na URL (?demo=apertada) para dar para compartilhar o link de teste. */
export function useDemoSettings() {
  const [settings, setSettings] = useState<DemoSettings>(readInitialSettings);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (settings.enabled) {
      url.searchParams.set(DEMO_URL_PARAM, settings.scenario);
    } else {
      url.searchParams.delete(DEMO_URL_PARAM);
    }
    window.history.replaceState(null, '', url);
  }, [settings.enabled, settings.scenario]);

  return {
    settings,
    setEnabled: (enabled: boolean) => setSettings((current) => ({ ...current, enabled, startedAt: Date.now() })),
    setScenario: (scenario: DemoScenario) => setSettings((current) => ({ ...current, scenario, startedAt: Date.now() })),
    restart: () => setSettings((current) => ({ ...current, startedAt: Date.now() })),
  };
}
