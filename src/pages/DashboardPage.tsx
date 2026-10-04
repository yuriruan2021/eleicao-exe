import { useCallback, useState } from 'react';
import { getDuel } from '@shared/election';
import type { ElectionPayload } from '@shared/types';
import { CelebrationBanner } from '@/components/celebration/CelebrationBanner';
import { CelebrationOverlay } from '@/components/celebration/CelebrationOverlay';
import { Fireworks } from '@/components/celebration/Fireworks';
import { DuelCard } from '@/components/election/DuelCard';
import { EvolutionChart } from '@/components/election/EvolutionChart';
import { LeadChangeOverlay } from '@/components/election/LeadChangeOverlay';
import { NarratorFeed } from '@/components/election/NarratorFeed';
import { Scoreboard } from '@/components/election/Scoreboard';
import { Thermometer } from '@/components/election/Thermometer';
import { Timeline } from '@/components/election/Timeline';
import { TotalizationBar } from '@/components/election/TotalizationBar';
import { AboutSection } from '@/components/layout/AboutSection';
import { BottomNav } from '@/components/layout/BottomNav';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Header } from '@/components/layout/Header';
import { SourceFooter } from '@/components/layout/SourceFooter';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { RefreshErrorNotice } from '@/components/states/RefreshErrorNotice';
import { WaitingState } from '@/components/states/WaitingState';
import { useDemoSettings } from '@/hooks/useDemoSettings';
import { useElection } from '@/hooks/useElection';
import { cn } from '@/lib/utils';
import type { ElectionQuery } from '@/services/electionApi';
import type { DashboardTab } from '@/types/dashboard';
import { getCelebratedWinner, rememberCelebrationSeen, wasCelebrationSeen } from '@/utils/celebration';
import { tabVisibility } from '@/utils/tabs';

interface LiveDashboardProps {
  payload: ElectionPayload;
  activeTab: DashboardTab;
}

function LiveDashboard({ payload, activeTab }: LiveDashboardProps) {
  const { current, history, events, status } = payload;
  if (!current) {
    return null;
  }
  const duel = getDuel(current);

  return (
    <>
      <TotalizationBar status={status} totalizedPercentage={current.totalizedPercentage} updatedAt={current.timestamp} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className={cn('space-y-6 lg:col-span-7', tabVisibility('placar', activeTab))}>
          {duel && <DuelCard duel={duel} />}
          {duel && <Thermometer marginPp={duel.marginPp} />}
          <Scoreboard snapshot={current} />
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className={cn('space-y-6', tabVisibility('evolucao', activeTab))}>
            {duel && <EvolutionChart history={history} duel={duel} />}
            <Timeline history={history} />
          </div>
          <div className={tabVisibility('narrador', activeTab)}>
            <NarratorFeed events={events} />
          </div>
        </div>
      </div>
    </>
  );
}

export function DashboardPage() {
  const demo = useDemoSettings();
  const [activeTab, setActiveTab] = useState<DashboardTab>('placar');

  const query: ElectionQuery = {
    mode: demo.settings.enabled ? 'demo' : 'oficial',
    scenario: demo.settings.scenario,
    demoStartedAt: demo.settings.startedAt,
  };
  const election = useElection(query);
  const payload = election.data;
  const sessionKey = `${query.mode}-${query.scenario}-${query.demoStartedAt}`;
  const leader = payload?.current?.candidates[0] ?? null;

  // Comemoração: abre sozinha uma vez quando o 22 é eleito; depois fica a faixa dourada com "Rever".
  const winner = getCelebratedWinner(payload);
  const isSimulation = query.mode === 'demo';
  const celebrationKey = isSimulation ? sessionKey : 'oficial';
  const [dismissedCelebrationKey, setDismissedCelebrationKey] = useState<string | null>(() =>
    wasCelebrationSeen('oficial') ? 'oficial' : null,
  );
  const [isReplayingCelebration, setIsReplayingCelebration] = useState(false);
  const showCelebration = winner !== null && (isReplayingCelebration || dismissedCelebrationKey !== celebrationKey);
  const closeCelebration = useCallback(() => {
    setIsReplayingCelebration(false);
    setDismissedCelebrationKey(celebrationKey);
    rememberCelebrationSeen(query.mode);
  }, [celebrationKey, query.mode]);

  const changeTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  const renderElection = () => {
    if (election.isPending) {
      return <LoadingState />;
    }
    if (!payload) {
      return <ErrorState message={election.error?.message ?? 'Erro desconhecido.'} onRetry={() => election.refetch()} />;
    }
    if (!payload.current) {
      return (
        <WaitingState
          notice={payload.notice}
          lineup={payload.lineup}
          releaseAt={payload.releaseAt}
          demoEnabled={demo.settings.enabled}
          onEnableDemo={() => demo.setEnabled(true)}
        />
      );
    }
    return (
      <>
        {winner && !showCelebration && (
          <CelebrationBanner
            winner={winner}
            isSimulation={isSimulation}
            onReplay={() => setIsReplayingCelebration(true)}
          />
        )}
        <LiveDashboard payload={payload} activeTab={activeTab} />
      </>
    );
  };

  return (
    <div className="min-h-dvh pb-24 lg:pb-8">
      {demo.settings.enabled && (
        <DemoBanner scenario={demo.settings.scenario} onScenarioChange={demo.setScenario} onRestart={demo.restart} />
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Header demoEnabled={demo.settings.enabled} onDemoChange={demo.setEnabled} />

        <main>
          <div className={activeTab === 'sobre' ? 'hidden lg:block' : undefined}>
            {election.isError && payload && (
              <RefreshErrorNotice message={election.error.message} lastSuccessAt={election.dataUpdatedAt} />
            )}
            {renderElection()}
          </div>

          <div className={cn('mt-6', activeTab !== 'sobre' && activeTab !== 'placar' && 'hidden lg:block')}>
            <AboutSection activeTab={activeTab} />
          </div>
        </main>

        <SourceFooter />
      </div>

      <BottomNav activeTab={activeTab} onChange={changeTab} />
      <LeadChangeOverlay key={sessionKey} leader={leader} />

      {winner && !showCelebration && <Fireworks intensity="light" className="fixed inset-0 z-20 size-full" />}
      {winner && showCelebration && (
        <CelebrationOverlay winner={winner} isSimulation={isSimulation} onClose={closeCelebration} />
      )}
    </div>
  );
}
