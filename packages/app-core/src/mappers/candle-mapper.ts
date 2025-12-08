import type { PublicRestTypes } from 'ts-kraken';
import { Candle } from '../domain/Candle';

type OHLCEntry = [
  time: number,
  open: string,
  high: string,
  low: string,
  close: string,
  vwap: string,
  volume: string,
  count: number,
];

/**
 * Maps single OHLC array entry to Candle domain model
 */
export function mapCandle(entry: OHLCEntry): Candle {
  return new Candle(
    entry[0], // timestamp
    parseFloat(entry[1]), // open
    parseFloat(entry[2]), // high
    parseFloat(entry[3]), // low
    parseFloat(entry[4]), // close
    parseFloat(entry[5]), // vwap
    parseFloat(entry[6]), // volume
    entry[7], // trade count
  );
}

/**
 * Maps array of OHLC entries to Candle domain models
 */
export function mapCandles(entries: OHLCEntry[]): Candle[] {
  return entries.map(mapCandle);
}

/**
 * Maps full OHLC API response to Candles
 * Extracts the pair data from the result object
 */
export function mapOHLCResponse(
  result: PublicRestTypes.PublicRestEndpoints.OHLC.Result,
): { candles: Candle[]; last: number } {
  // Extract pair key (first key that isn't 'last')
  const pairKey = Object.keys(result).find((key) => key !== 'last');

  if (!pairKey) {
    return { candles: [], last: 0 };
  }

  const entries = result[
    pairKey as keyof typeof result
  ] as unknown as OHLCEntry[];
  const last = result.last || 0;

  if (!Array.isArray(entries)) {
    return { candles: [], last };
  }

  return {
    candles: mapCandles(entries),
    last,
  };
}

/**
 * Maximum number of candles to keep in memory
 * Prevents unbounded memory growth during auto-refresh
 */
const MAX_CANDLES = 1000;

/**
 * Merge existing candles with new candle updates
 * Used for incremental updates with 'since' parameter
 * Implements sliding window to prevent memory leaks
 */
export function mergeCandles(
  existing: Candle[],
  newCandles: Candle[],
): Candle[] {
  const candleMap = new Map(existing.map((c) => [c.timestamp, c]));

  // Update or add new candles
  newCandles.forEach((c) => candleMap.set(c.timestamp, c));

  // Return sorted by timestamp ascending
  const sorted = Array.from(candleMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  // Keep only the most recent MAX_CANDLES to prevent unbounded memory growth
  // This implements a sliding window that removes old candles
  if (sorted.length > MAX_CANDLES) {
    return sorted.slice(-MAX_CANDLES);
  }

  return sorted;
}
