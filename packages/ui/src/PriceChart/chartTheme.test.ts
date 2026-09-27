import { readChartTheme, withAlpha } from './chartTheme';

describe('readChartTheme', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('returnsTokenValues_whenThemeTokensAreSet', () => {
    const root = document.documentElement;
    root.style.setProperty('--theme-surface', '#111111');
    root.style.setProperty('--theme-muted', '#222222');
    root.style.setProperty('--theme-border', '#333333');
    root.style.setProperty('--theme-rise', '#444444');
    root.style.setProperty('--theme-fall', '#555555');
    root.style.setProperty('--font-mono', 'Test Mono, monospace');

    expect(readChartTheme()).toEqual({
      background: '#111111',
      text: '#222222',
      grid: '#333333',
      rise: '#444444',
      fall: '#555555',
      font: 'Test Mono, monospace',
    });
  });

  it('returnsNavyFallbacks_whenThemeTokensAreMissing', () => {
    expect(readChartTheme()).toEqual({
      background: '#202445',
      text: '#aaafcf',
      grid: '#353a75',
      rise: '#5ee9b5',
      fall: '#ff6b81',
      font: "'IBM Plex Mono', ui-monospace, monospace",
    });
  });
});

describe('withAlpha', () => {
  it('appendsAlphaByte_whenColorIsSixDigitHex', () => {
    expect(withAlpha('#5ee9b5', 0.5)).toBe('#5ee9b580');
  });

  it('returnsColorUnchanged_whenColorIsNotSixDigitHex', () => {
    expect(withAlpha('rgb(1 2 3)', 0.5)).toBe('rgb(1 2 3)');
  });
});
