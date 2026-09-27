/**
 * Colours and axis font for the canvas-drawn chart, read from the CSS theme
 * tokens in theme.css. The canvas cannot resolve `var(--…)` itself, so the
 * values are read once from the root element; each falls back to the navy
 * value when the token is missing (e.g. theme.css not loaded).
 */
export type ChartTheme = {
  background: string;
  text: string;
  grid: string;
  rise: string;
  fall: string;
  font: string;
};

const FALLBACK: ChartTheme = {
  background: '#202445',
  text: '#aaafcf',
  grid: '#353a75',
  rise: '#5ee9b5',
  fall: '#ff6b81',
  font: "'IBM Plex Mono', ui-monospace, monospace",
};

export function readChartTheme(root: Element = document.documentElement) {
  const style = getComputedStyle(root);
  const read = (token: string, fallback: string) =>
    style.getPropertyValue(token).trim() || fallback;

  return {
    background: read('--theme-surface', FALLBACK.background),
    text: read('--theme-muted', FALLBACK.text),
    grid: read('--theme-border', FALLBACK.grid),
    rise: read('--theme-rise', FALLBACK.rise),
    fall: read('--theme-fall', FALLBACK.fall),
    font: read('--font-mono', FALLBACK.font),
  } satisfies ChartTheme;
}

/** Appends an alpha channel to a 6-digit hex colour; other formats pass through. */
export function withAlpha(color: string, alpha: number) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
  const byte = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return color + byte.toString(16).padStart(2, '0');
}
