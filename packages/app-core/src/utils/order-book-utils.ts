import { OrderBookLevel } from '../domain/OrderBookLevel';

export type PriceLevelUpdate = {
  price: number;
  qty: number;
};

export type OrderBookSide = 'bid' | 'ask';

/**
 * Merges price level updates into existing levels
 * - If qty > 0: add or update the price level
 * - If qty = 0: remove the price level
 * - Maintains sorted order based on side (bids descending, asks ascending)
 *
 * @param currentLevels Existing price levels
 * @param updates Update price levels
 * @param side Whether these are bids (descending) or asks (ascending)
 * @returns New array of merged price levels, correctly sorted
 */
export function mergePriceLevels(
  currentLevels: readonly OrderBookLevel[],
  updates: PriceLevelUpdate[],
  side: OrderBookSide,
): OrderBookLevel[] {
  // Convert readonly array to mutable map for efficient updates
  const levelMap = new Map<number, OrderBookLevel>();

  // Add all current levels to map
  currentLevels.forEach((level) => {
    levelMap.set(level.price, level);
  });

  // Process updates
  updates.forEach((update) => {
    if (update.qty === 0) {
      // Remove level (qty = 0 means delete)
      levelMap.delete(update.price);
    } else {
      // Add or update level
      levelMap.set(update.price, new OrderBookLevel(update.price, update.qty));
    }
  });

  // Convert map back to sorted array
  const merged = Array.from(levelMap.values());

  // Sort based on side: bids descending (highest first), asks ascending (lowest first)
  const isDescending = side === 'bid';

  return merged.sort((a, b) =>
    isDescending ? b.price - a.price : a.price - b.price,
  );
}

/**
 * Calculate cumulative totals for price levels
 * Each level's total is the sum of all quantities up to and including that level
 *
 * @param levels Price levels to calculate totals for
 * @returns New array of levels with cumulative totals
 */
export function calculateCumulativeTotals(
  levels: readonly OrderBookLevel[],
): OrderBookLevel[] {
  let cumulative = 0;
  return levels.map((level) => {
    cumulative += level.quantity;
    return level.withTotal(cumulative);
  });
}

/**
 * Get the maximum cumulative total from a list of price levels
 * Used as reference point for depth bar visualization
 *
 * @param levels Price levels with cumulative totals
 * @returns Maximum cumulative total, or 1 as fallback
 */
export function getMaxCumulativeTotal(
  levels: readonly OrderBookLevel[],
): number {
  if (levels.length === 0) return 1;

  // Since levels have cumulative totals, the last level has the max total
  const lastLevel = levels[levels.length - 1];
  const total = lastLevel?.total ?? 0;

  // Return 1 as minimum to avoid division by zero
  return total > 0 ? total : 1;
}
