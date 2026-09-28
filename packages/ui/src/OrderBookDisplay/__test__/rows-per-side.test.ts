import { rowsPerSide } from '../rows-per-side';

describe('rowsPerSide', () => {
  it('splitsWholeRowsEvenly_whenSpaceLeftOver', () => {
    // (400 - 40) / 30 = 12 rows, 6 per side
    expect(rowsPerSide(400, 40, 30)).toBe(6);
  });

  it('dropsPartialRow_whenRowWouldBeCut', () => {
    // (400 - 40) / 32 = 11.25 rows → 5 whole rows per side
    expect(rowsPerSide(400, 40, 32)).toBe(5);
  });

  it('keepsOneRowPerSide_whenPanelTooSmall', () => {
    expect(rowsPerSide(50, 40, 30)).toBe(1);
  });
});
