import { useEffect, useRef, type ReactNode } from 'react';

export function AppCelular({ titulo, aoVoltar, children }: { titulo: string; aoVoltar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, [titulo]);
  return (
    <section ref={ref} className="cel-app" role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1}>
      <header className="cel-app__barra">
        <button type="button" onClick={aoVoltar} aria-label="Voltar">← VOLTAR</button>
        <span className="cel-app__titulo" aria-hidden="true">{titulo}</span>
      </header>
      <div className="cel-app__corpo">{children}</div>
    </section>
  );
}
