export interface ThermometerReading {
  /** 0 = calmaria total, 100 = ninguém dorme. */
  heat: number;
  emoji: string;
  message: string;
}

interface ThermometerLevel {
  /** O nível vale quando a diferença é MAIOR que este valor (em p.p.). */
  above: number;
  emoji: string;
  message: string;
}

const LEVELS: readonly ThermometerLevel[] = [
  { above: 5, emoji: '😎', message: 'Parece tranquilo por enquanto.' },
  { above: 3, emoji: '👀', message: 'Começou a apertar.' },
  { above: 1, emoji: '🍿', message: 'Agora ficou interessante.' },
  { above: 0.5, emoji: '😰', message: 'Não pisca.' },
  { above: Number.NEGATIVE_INFINITY, emoji: '🚨', message: 'NINGUÉM DORME.' },
];

const MARGIN_WITH_ZERO_HEAT_PP = 8;
const HEAT_CURVE_EXPONENT = 1.5;

export function getThermometer(marginPp: number): ThermometerReading {
  const margin = Math.max(marginPp, 0);
  const level = LEVELS.find((candidateLevel) => margin > candidateLevel.above) ?? LEVELS[LEVELS.length - 1];
  const calmness = Math.min(margin, MARGIN_WITH_ZERO_HEAT_PP) / MARGIN_WITH_ZERO_HEAT_PP;
  const heat = Math.round(100 * (1 - calmness) ** HEAT_CURVE_EXPONENT);

  return { heat, emoji: level.emoji, message: level.message };
}
