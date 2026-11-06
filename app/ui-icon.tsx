import type { CSSProperties } from 'react';

const paths: Record<string, string> = {
  '▦': 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  '▤': 'M4 5h16v15H4z M8 3v4 M16 3v4 M8 11h8 M8 15h5',
  '♙': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-4',
  '♧': 'M20 21v-2a7 7 0 0 0-14 0v2 M13 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  '⌖': 'M12 22s8-7 8-13a8 8 0 0 0-16 0c0 6 8 13 8 13z M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  '▥': 'M4 3v18h17 M8 16v-5 M13 16V7 M18 16v-8',
  '⚙': 'M4 7h16 M4 17h16 M8 4v6 M16 14v6',
  'bell': 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  '▣': 'M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16',
  '＋': 'M12 5v14 M5 12h14', '+': 'M12 5v14 M5 12h14',
  '→': 'M4 12h16 M14 6l6 6-6 6', '↗': 'M6 18 18 6 M6 6h12v12',
  '✓': 'm5 12 4 4L19 6', '!': 'M12 8v5 M12 17h.01 M12 2 2 21h20z',
  '⌕': 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6',
  '×': 'm6 6 12 12 M6 18 18 6', '···': 'M4 12h.01 M12 12h.01 M20 12h.01',
  '↻': 'M20 11a8 8 0 1 0-2 7 M20 3v8h-8',
  'i': 'M12 10v7 M12 6h.01 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  '➜': 'M3 7h12v11H3z M15 11h4l3 4v3h-7 M7 18v3 M18 18v3',
  '⇄': 'M3 7h18 M17 3l4 4-4 4 M21 17H3 M7 13l-4 4 4 4',
  '◇': 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6z',
};
export function Icon({ name, size = 20, style }: { name: string; size?: number; style?: CSSProperties }) {
  return <svg className="ui-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={style}><path d={paths[name] ?? paths['▤']}/></svg>;
}
