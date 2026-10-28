import { useLayoutEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import type { Area } from '../../lib/os/janelas';

/** Mede o elemento. O ref de valor é atualizado antes dos efeitos comuns, então pode ser lido logo na montagem. */
export function useArea<T extends HTMLElement>(): [RefObject<T | null>, Area, MutableRefObject<Area>] {
  const elemento = useRef<T>(null);
  const valor = useRef<Area>({ w: 800, h: 600 });
  const [area, setArea] = useState<Area>(valor.current);
  useLayoutEffect(() => {
    const el = elemento.current;
    if (!el) return;
    const medir = () => {
      const r = el.getBoundingClientRect();
      valor.current = { w: r.width, h: r.height };
      setArea(valor.current);
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return [elemento, area, valor];
}
