import { useEffect, useRef } from 'react';

/** Chuva de caracteres por ~4 s sobre o terminal. Com "reduzir movimento" ligado, termina na hora. */
export function Matrix({ aoTerminar }: { aoTerminar: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { aoTerminar(); return; }
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    const tam = 14;
    const gotas = Array.from({ length: Math.ceil(width / tam) }, () => Math.random() * -20);
    const caracteres = 'アイウエオカキクケコ01JGBR11<>/{}';
    let quadro = 0;
    const id = window.setInterval(() => {
      ctx.fillStyle = 'rgba(13, 13, 13, .18)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${tam}px "JetBrains Mono", monospace`;
      gotas.forEach((y, i) => {
        ctx.fillStyle = Math.random() > .9 ? '#02d7f2' : '#f3e600';
        ctx.fillText(caracteres[Math.floor(Math.random() * caracteres.length)], i * tam, y * tam);
        gotas[i] = y * tam > height && Math.random() > .95 ? 0 : y + 1;
      });
      if (++quadro > 120) { window.clearInterval(id); aoTerminar(); }
    }, 33);
    return () => window.clearInterval(id);
  }, [aoTerminar]);
  return <canvas ref={ref} className="matrix" aria-hidden="true" />;
}
