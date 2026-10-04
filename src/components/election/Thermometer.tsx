import { getThermometer } from '@shared/thermometer';

interface ThermometerProps {
  marginPp: number;
}

export function Thermometer({ marginPp }: ThermometerProps) {
  const reading = getThermometer(marginPp);

  return (
    <section aria-labelledby="thermometer-title" className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="thermometer-title" className="font-display text-lg font-semibold">
          Nível de treta
        </h2>
        <p className="font-display text-2xl font-bold tabular-nums">{reading.heat}% 🔥</p>
      </div>

      <div className="heat-track relative mt-3 h-2.5 rounded-full">
        <span
          aria-hidden
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-void bg-ink transition-[left] duration-700 ease-out"
          style={{ left: `${reading.heat}%` }}
        />
      </div>

      <p className="mt-4 text-lg">
        <span aria-hidden>{reading.emoji}</span> {reading.message}
      </p>
      <p className="mt-1 text-xs text-dim">
        Puro humor, calculado só pela diferença entre os dois primeiros. Não é análise eleitoral.
      </p>
    </section>
  );
}
