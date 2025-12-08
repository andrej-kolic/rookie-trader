import type { PublicWsTypes } from 'ts-kraken';
import { OrderBook } from '../domain/OrderBook';
import { OrderBookLevel } from '../domain/OrderBookLevel';
import { mergePriceLevels } from '../utils/order-book-utils';
import { removeCrossedOrders } from '../utils/order-book-sanitizer';

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
  depth: number,
): OrderBook {
  // Merge with explicit side information to ensure correct sorting
  let newBids = mergePriceLevels(current.bids, updateDto.bids, 'bid');
  let newAsks = mergePriceLevels(current.asks, updateDto.asks, 'ask');

  // Remove crossed orders (can occur due to separate bid/ask updates arriving out of sync)
  const sanitized = removeCrossedOrders(newBids, newAsks);
  newBids = sanitized.sanitizedBids;
  newAsks = sanitized.sanitizedAsks;

  // Truncate to subscribed depth to prevent unbounded growth
  // Kraken API docs: "after each update, the book should be truncated to your subscribed depth"
  if (newBids.length > depth) {
    newBids = newBids.slice(0, depth);
  }
  if (newAsks.length > depth) {
    newAsks = newAsks.slice(0, depth);
  }

  const merged = new OrderBook(
    updateDto.symbol,
    newBids,
    newAsks,
    new Date(updateDto.timestamp),
    updateDto.checksum,
  );

  return merged.withCumulativeTotals();
}
