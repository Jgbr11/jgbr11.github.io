import { useSyncExternalStore } from 'react';

const CONSULTA = '(min-width: 900px)';

export function usePC(): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const m = window.matchMedia(CONSULTA);
      m.addEventListener('change', avisar);
      return () => m.removeEventListener('change', avisar);
    },
    () => window.matchMedia(CONSULTA).matches,
    () => true,
  );
}
