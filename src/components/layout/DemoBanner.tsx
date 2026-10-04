import { RotateCcw } from 'lucide-react';
import { DEMO_SCENARIOS, isDemoScenario, type DemoScenario } from '@shared/demo';
import { Button } from '@/components/ui/button';
import { DEMO_SCENARIO_LABELS } from '@/utils/demoScenarios';

interface DemoBannerProps {
  scenario: DemoScenario;
  onScenarioChange: (scenario: DemoScenario) => void;
  onRestart: () => void;
}

export function DemoBanner({ scenario, onScenarioChange, onRestart }: DemoBannerProps) {
  return (
    <div className="demo-stripes sticky top-0 z-30 border-b border-demo/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <p className="text-sm">
          <strong className="font-display text-demo">MODO DEMONSTRAÇÃO</strong>{' '}
          <span className="text-ink/85">Números fictícios para teste. Nada aqui é resultado real.</span>
        </p>

        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          <label htmlFor="demo-scenario" className="sr-only">
            Cenário de teste
          </label>
          <select
            id="demo-scenario"
            value={scenario}
            onChange={(event) => {
              const { value } = event.target;
              if (isDemoScenario(value)) {
                onScenarioChange(value);
              }
            }}
            className="h-8 min-w-0 flex-1 rounded-md border border-line bg-panel px-2 text-sm text-ink sm:flex-none"
          >
            {DEMO_SCENARIOS.map((option) => (
              <option key={option} value={option}>
                {DEMO_SCENARIO_LABELS[option]}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={onRestart}>
            <RotateCcw aria-hidden className="size-4" />
            Recomeçar
          </Button>
        </div>
      </div>
    </div>
  );
}
