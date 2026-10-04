import { getDuel, type Duel } from './election';
import { formatPercentage, formatPp, formatVotes } from './format';
import type { ElectionSnapshot, NarratorEvent, NarratorEventKind } from './types';

/** Faixas de diferença (p.p.) que geram eventos ao serem cruzadas. */
const MARGIN_THRESHOLDS_PP = [5, 3, 1, 0.5] as const;
const TOTALIZATION_MILESTONES = [25, 50, 75, 90] as const;
/** Quantos snapshots esperar entre dois avisos de diferença, para evitar spam. */
const MARGIN_EVENT_COOLDOWN_SNAPSHOTS = 3;

function createEvent(kind: NarratorEventKind, snapshot: ElectionSnapshot, message: string): NarratorEvent {
  return { id: `${kind}-${snapshot.timestamp}`, timestamp: snapshot.timestamp, kind, message };
}

/** Quantos limites a diferença atual já furou para baixo. 0 = acima de 5 p.p. */
function getMarginBand(marginPp: number): number {
  return MARGIN_THRESHOLDS_PP.filter((threshold) => marginPp < threshold).length;
}

function describeThreshold(threshold: number): string {
  const unit = threshold < 2 ? 'ponto percentual' : 'pontos percentuais';
  return `${threshold.toLocaleString('pt-BR')} ${unit}`;
}

function describeContext(snapshot: ElectionSnapshot, duel: Duel): string {
  return `Agora são ${formatPp(duel.marginPp)}, com ${formatPercentage(snapshot.totalizedPercentage, 1)} totalizado.`;
}

function buildMarginEvent(fromBand: number, toBand: number, snapshot: ElectionSnapshot, duel: Duel): NarratorEvent {
  const context = describeContext(snapshot, duel);

  if (toBand > fromBand) {
    const threshold = MARGIN_THRESHOLDS_PP[toBand - 1];
    const lead = threshold <= 0.5 ? '🚨' : '📉';
    return createEvent(
      'diferenca-caiu',
      snapshot,
      `${lead} A diferença caiu para menos de ${describeThreshold(threshold)}. ${context}`,
    );
  }

  const threshold = MARGIN_THRESHOLDS_PP[toBand];
  return createEvent(
    'diferenca-subiu',
    snapshot,
    `📈 A diferença voltou a passar de ${describeThreshold(threshold)}. ${context}`,
  );
}

function detectLeadChange(previousDuel: Duel, duel: Duel, snapshot: ElectionSnapshot): NarratorEvent | null {
  if (previousDuel.leader.number === duel.leader.number) {
    return null;
  }
  return createEvent(
    'lideranca',
    snapshot,
    `🚨 ${duel.leader.name} assume a liderança, com ${formatVotes(duel.marginVotes)} votos de vantagem (${formatPp(duel.marginPp)}).`,
  );
}

function detectMilestone(previous: ElectionSnapshot, snapshot: ElectionSnapshot, duel: Duel): NarratorEvent | null {
  const crossed = TOTALIZATION_MILESTONES.filter(
    (milestone) => previous.totalizedPercentage < milestone && snapshot.totalizedPercentage >= milestone,
  );
  const milestone = crossed.at(-1);
  if (milestone === undefined) {
    return null;
  }
  return createEvent(
    'marco',
    snapshot,
    `📦 ${milestone}% das seções totalizadas. ${duel.leader.name} lidera com ${formatPp(duel.marginPp)} de vantagem.`,
  );
}

function detectFinal(previous: ElectionSnapshot, snapshot: ElectionSnapshot, duel: Duel): NarratorEvent | null {
  if (previous.totalizedPercentage >= 100 || snapshot.totalizedPercentage < 100) {
    return null;
  }
  const officialNote = duel.leader.elected
    ? `O TSE indica ${duel.leader.name} como eleito(a).`
    : 'A palavra final é sempre do TSE.';
  return createEvent('final', snapshot, `🏁 100% das seções totalizadas. ${officialNote}`);
}

/**
 * Gera o feed do narrador a partir do histórico, sempre de forma determinística:
 * o mesmo histórico produz exatamente os mesmos eventos para todo mundo.
 */
export function buildNarratorEvents(history: readonly ElectionSnapshot[]): NarratorEvent[] {
  const events: NarratorEvent[] = [];
  let announcedBand: number | null = null;
  let lastMarginEventIndex = -MARGIN_EVENT_COOLDOWN_SNAPSHOTS;

  history.forEach((snapshot, index) => {
    const duel = getDuel(snapshot);
    const previous = index > 0 ? history[index - 1] : undefined;
    const previousDuel = previous ? getDuel(previous) : null;
    if (!duel) {
      return;
    }

    const band = getMarginBand(duel.marginPp);

    if (!previous || !previousDuel || announcedBand === null) {
      events.push(createEvent('inicio', snapshot, `🟢 Começou a totalização. ${duel.leader.name} abre na frente.`));
      announcedBand = band;
      return;
    }

    const leadChange = detectLeadChange(previousDuel, duel, snapshot);
    const milestone = detectMilestone(previous, snapshot, duel);
    const final = detectFinal(previous, snapshot, duel);

    for (const event of [leadChange, milestone]) {
      if (event) {
        events.push(event);
      }
    }

    const cooldownOver = index - lastMarginEventIndex >= MARGIN_EVENT_COOLDOWN_SNAPSHOTS;
    if (band !== announcedBand && cooldownOver) {
      events.push(buildMarginEvent(announcedBand, band, snapshot, duel));
      announcedBand = band;
      lastMarginEventIndex = index;
    }

    if (final) {
      events.push(final);
    }
  });

  return events;
}
