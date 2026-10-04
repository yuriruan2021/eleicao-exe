import { Switch } from '@/components/ui/switch';

interface HeaderProps {
  demoEnabled: boolean;
  onDemoChange: (enabled: boolean) => void;
}

export function Header({ demoEnabled, onDemoChange }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pt-7 pb-6">
      <div>
        <h1 className="font-display text-4xl leading-none font-bold tracking-tight sm:text-5xl">
          ELEIÇÃO.EXE
          <span aria-hidden className="cursor-block" />
        </h1>
        <p className="mt-2 text-sm text-dim">Central de acompanhamento eleitoral não-oficial™</p>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="demo-switch" checked={demoEnabled} onCheckedChange={onDemoChange} />
        <label htmlFor="demo-switch" className="cursor-pointer text-sm text-dim">
          Modo demonstração
        </label>
      </div>
    </header>
  );
}
