import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Duel } from '@shared/election';
import { formatClock, formatPercentage } from '@shared/format';
import type { ElectionSnapshot } from '@shared/types';
import { DUEL_COLORS, orderBySlot } from '@/utils/duel';

interface EvolutionChartProps {
  history: ElectionSnapshot[];
  duel: Duel;
}

type ChartRow = Record<string, string | number | null>;

function seriesKey(candidateNumber: number): string {
  return `candidato-${candidateNumber}`;
}

function findPercentage(snapshot: ElectionSnapshot, candidateNumber: number): number | null {
  return snapshot.candidates.find((candidate) => candidate.number === candidateNumber)?.percentage ?? null;
}

export function EvolutionChart({ history, duel }: EvolutionChartProps) {
  const series = orderBySlot(duel).map((candidate, index) => ({ candidate, color: DUEL_COLORS[index] }));

  const rows: ChartRow[] = history.map((snapshot) => {
    const row: ChartRow = { time: formatClock(snapshot.timestamp) };
    for (const { candidate } of series) {
      row[seriesKey(candidate.number)] = findPercentage(snapshot, candidate.number);
    }
    return row;
  });

  return (
    <section aria-labelledby="evolution-title" className="rounded-2xl border border-line bg-panel p-5">
      <h2 id="evolution-title" className="font-display text-lg font-semibold">
        Como está chegando
      </h2>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {series.map(({ candidate, color }) => (
          <li key={candidate.number} className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-4 rounded" style={{ backgroundColor: color }} />
            {candidate.name}
          </li>
        ))}
      </ul>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="var(--color-dim)"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              stroke="var(--color-dim)"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value: number) => `${Math.round(value)}%`}
            />
            <ReferenceLine
              y={50}
              stroke="var(--color-dim)"
              strokeDasharray="4 4"
              label={{ value: '50%', fill: 'var(--color-dim)', fontSize: 11, position: 'insideTopRight' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-raised)',
                border: '1px solid var(--color-line)',
                borderRadius: 8,
                color: 'var(--color-ink)',
              }}
              labelStyle={{ color: 'var(--color-dim)' }}
              formatter={(value) => (typeof value === 'number' ? formatPercentage(value) : String(value))}
            />
            {series.map(({ candidate, color }) => (
              <Line
                key={candidate.number}
                type="monotone"
                dataKey={seriesKey(candidate.number)}
                name={candidate.name}
                stroke={color}
                strokeWidth={2.5}
                dot={history.length < 3}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
