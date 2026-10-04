const TIME_ZONE = 'America/Sao_Paulo';

const integerFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

const clockFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
});

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: TIME_ZONE,
});

function formatDecimal(value: number, fractionDigits: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatVotes(votes: number): string {
  return integerFormatter.format(Math.round(votes));
}

export function formatPercentage(value: number, fractionDigits = 2): string {
  return `${formatDecimal(value, fractionDigits)}%`;
}

export function formatPp(value: number, fractionDigits = 2): string {
  return `${formatDecimal(value, fractionDigits)} p.p.`;
}

export function formatClock(isoTimestamp: string): string {
  return clockFormatter.format(new Date(isoTimestamp));
}

/** "domingo, 4 de outubro", ou "hoje" quando é o mesmo dia em Brasília. */
export function formatDay(isoTimestamp: string, now = new Date()): string {
  const day = dayFormatter.format(new Date(isoTimestamp));
  return day === dayFormatter.format(now) ? 'hoje' : day;
}
