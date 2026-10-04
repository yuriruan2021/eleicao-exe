import { Activity, Info, Megaphone, Swords, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardTab } from '@/types/dashboard';

const TABS: { id: DashboardTab; label: string; Icon: LucideIcon }[] = [
  { id: 'placar', label: 'Placar', Icon: Swords },
  { id: 'evolucao', label: 'Evolução', Icon: Activity },
  { id: 'narrador', label: 'Narrador', Icon: Megaphone },
  { id: 'sobre', label: 'Sobre', Icon: Info },
];

interface BottomNavProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Seções"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-void/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = id === activeTab;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-1 py-2.5 text-[11px] transition-colors',
                  isActive ? 'text-ink' : 'text-dim',
                )}
              >
                <Icon aria-hidden className="size-5" strokeWidth={isActive ? 2.4 : 1.8} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
