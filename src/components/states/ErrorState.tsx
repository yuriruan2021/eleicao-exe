import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section role="alert" className="rounded-2xl border border-heat-hot/60 bg-panel p-8 text-center">
      <p className="font-display text-lg">A apuração não carregou</p>
      <p className="mt-1 text-sm text-dim">{message}</p>
      <Button className="mt-5" onClick={onRetry}>
        Tentar de novo
      </Button>
    </section>
  );
}
