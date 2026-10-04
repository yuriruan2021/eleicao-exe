import type { DashboardTab } from '@/types/dashboard';

/** No celular só a aba ativa aparece. No desktop tudo aparece junto. */
export function tabVisibility(tab: DashboardTab, activeTab: DashboardTab): string {
  return tab === activeTab ? '' : 'hidden lg:block';
}
