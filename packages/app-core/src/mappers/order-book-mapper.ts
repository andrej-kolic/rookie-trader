import type { PublicWsTypes } from 'ts-kraken';
import { OrderBook } from '../domain/OrderBook';
import { OrderBookLevel } from '../domain/OrderBookLevel';

type OrderBookDTO = PublicWsTypes.PublicSubscriptionUpdate<'book'>['data'][0];
type PriceLevelDTO = { price: number; qty: number };

/**
 * Maps Kraken WebSocket order book DTO to OrderBook domain model
 * @param dto Raw order book data from WebSocket update
 * @returns OrderBook domain model instance with cumulative totals
 */
export function mapOrderBook(dto: OrderBookDTO): OrderBook {
  const bids = dto.bids.map(mapOrderBookLevel);
  const asks = dto.asks.map(mapOrderBookLevel);

  const orderBook = new OrderBook(
    dto.symbol,
    bids,
    asks,
    new Date(dto.timestamp),
    dto.checksum,
  );

  // Calculate cumulative totals for depth visualization
  return orderBook.withCumulativeTotals();
}

/**
 * Maps a single price level DTO to OrderBookLevel domain model
 */
function mapOrderBookLevel(dto: PriceLevelDTO): OrderBookLevel {
  return new OrderBookLevel(dto.price, dto.qty);
}

/**
 * Merges incremental order book update into existing order book
 * Handles adding, updating, and removing price levels
 *
 * @param current Current OrderBook state
 * @param updateDto Incremental update data
 * @returns New OrderBook with merged changes
 */
export function mergeOrderBookUpdate(
  current: OrderBook,
  updateDto: OrderBookDTO,
): OrderBook {
  const newBids = mergePriceLevels(current.bids, updateDto.bids);
  const newAsks = mergePriceLevels(current.asks, updateDto.asks);

  const merged = new OrderBook(
    updateDto.symbol,
    newBids,
    newAsks,
    new Date(updateDto.timestamp),
    updateDto.checksum,
  );

  return merged.withCumulativeTotals();
}

/**
 * Merges price level updates into existing levels
 * - If qty > 0: add or update the price level
 * - If qty = 0: remove the price level
 * - Maintains sorted order (bids descending, asks ascending)
 *
 * @param currentLevels Existing price levels
 * @param updates Update price levels
 * @returns New array of merged price levels
 */
function mergePriceLevels(
  currentLevels: readonly OrderBookLevel[],
  updates: PriceLevelDTO[],
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

  // Sort: bids descending (highest first), asks ascending (lowest first)
  // determine sort direction by checking if this is bids or asks
  // by looking at the first current level vs first update
  const isDescending = shouldSortDescending(currentLevels, updates);

  return merged.sort((a, b) =>
    isDescending ? b.price - a.price : a.price - b.price,
  );
}

/**
 * Determines if price levels should be sorted descending (bids) or ascending (asks)
 * Bids are sorted highest to lowest, asks are sorted lowest to highest
 */
function shouldSortDescending(
  currentLevels: readonly OrderBookLevel[],
  _updates: PriceLevelDTO[],
): boolean {
  // If we have current levels, check if they're descending (bids) or ascending (asks)
  if (currentLevels.length >= 2) {
    const first = currentLevels.at(0);
    const second = currentLevels.at(1);
    if (first && second) {
      return first.price > second.price;
    }
  }

  // If no current levels but have updates, assume ascending (asks) by default
  // In practice, we'll always have current levels after snapshot
  return false;
}
