/**
 * Whole price levels that fit on each side of the spread in a book of the
 * given height. At least one per side, so a tiny panel still shows the top
 * of the book.
 */
export function rowsPerSide(
  bookHeight: number,
  spreadHeight: number,
  rowHeight: number,
): number {
  if (rowHeight <= 0) return 1;
  return Math.max(1, Math.floor((bookHeight - spreadHeight) / rowHeight / 2));
}
