export function LoadingState() {
  return (
    <section aria-busy="true" className="rounded-2xl border border-line bg-panel p-8 text-center">
      <p className="font-display text-lg">Conectando à central…</p>
      <p className="mt-1 text-sm text-dim">Buscando a posição mais recente da apuração.</p>
    </section>
  );
}
