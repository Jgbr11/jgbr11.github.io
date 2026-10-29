export type TipoIcone = 'pasta' | 'texto' | 'pdf' | 'exe' | 'terminal' | 'jogo' | 'mira';

const K = '#0d0d0d', Y = '#f3e600', C = '#02d7f2', R = '#ff3b4e';

export function Icone({ tipo, selecionado = false }: { tipo: TipoIcone; selecionado?: boolean }) {
  const fio = selecionado ? C : Y;
  switch (tipo) {
    case 'pasta':
      return (
        <svg aria-hidden="true" width="56" height="46" viewBox="0 0 56 46">
          <path d="M2 8h18l5 5h29v31H2z" fill={K} />
          <path d="M2 17h52" stroke={fio} strokeWidth="2" />
          <rect x="6" y="36" width="14" height="3" fill={Y} />
        </svg>
      );
    case 'texto':
      return (
        <svg aria-hidden="true" width="44" height="50" viewBox="0 0 44 50">
          <path d="M4 2h26l10 10v36H4z" fill={K} />
          <path d="M30 2v10h10" fill={Y} />
          <rect x="9" y="22" width="20" height="2.5" fill={Y} />
          <rect x="9" y="28" width="26" height="2.5" fill={Y} opacity=".6" />
          <rect x="9" y="34" width="16" height="2.5" fill={Y} opacity=".6" />
        </svg>
      );
    case 'pdf':
      return (
        <svg aria-hidden="true" width="44" height="50" viewBox="0 0 44 50">
          <path d="M4 2h26l10 10v36H4z" fill={K} />
          <path d="M30 2v10h10" fill={R} />
          <path d="M12 37V29h3a2 2 0 0 1 0 4h-3M19 29h2a4 4 0 0 1 0 8h-2zM28 37V29h4M28 33h3" fill="none" stroke={R} strokeWidth="1.6" />
        </svg>
      );
    case 'exe':
      return (
        <svg aria-hidden="true" width="50" height="46" viewBox="0 0 50 46">
          <rect x="2" y="4" width="46" height="38" fill={K} />
          <rect x="2" y="4" width="46" height="7" fill={Y} />
          <path d="M10 22l15 9 15-9" stroke={C} strokeWidth="2.5" fill="none" />
          <rect x="10" y="20" width="30" height="16" stroke={C} strokeWidth="2" fill="none" />
        </svg>
      );
    case 'terminal':
      return (
        <svg aria-hidden="true" width="50" height="46" viewBox="0 0 50 46">
          <rect x="2" y="4" width="46" height="38" fill={K} />
          <rect x="2" y="4" width="46" height="7" fill={C} />
          <text x="9" y="31" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="12" fill={Y}>&gt;_</text>
        </svg>
      );
    case 'jogo':
      return (
        <svg aria-hidden="true" width="50" height="46" viewBox="0 0 50 46">
          <rect x="2" y="4" width="46" height="38" fill={K} />
          <rect x="2" y="4" width="46" height="7" fill={R} />
          <path d="M11 24h10M16 19v10" stroke={Y} strokeWidth="3" />
          <circle cx="33" cy="21" r="2.5" fill={C} />
          <circle cx="38" cy="27" r="2.5" fill={C} />
        </svg>
      );
    case 'mira':
      return (
        <svg aria-hidden="true" width="50" height="46" viewBox="0 0 50 46">
          <rect x="2" y="4" width="46" height="38" fill={K} />
          <rect x="2" y="4" width="46" height="7" fill={C} />
          <circle cx="25" cy="27" r="9" fill="none" stroke={Y} strokeWidth="2" />
          <path d="M25 14v7M25 33v7M12 27h7M31 27h7" stroke={Y} strokeWidth="2" />
          <circle cx="25" cy="27" r="1.8" fill={Y} />
        </svg>
      );
  }
}
