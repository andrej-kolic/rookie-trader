import { publicRestRequest } from 'ts-kraken';

/**
 * Fetch tradable asset pairs from Kraken
 * @param pairs - Optional array of specific pairs to fetch (e.g., ['BTC/USD', 'ETH/EUR'])
 * @returns Promise with asset pairs data
 */
export async function fetchTradingPairs(pairs?: string[]) {
  return publicRestRequest<'AssetPairs'>({
    url: 'AssetPairs',
    params: pairs ? { pair: pairs.join(',') } : undefined,
  });
}

/**
 * Valid time intervals for OHLC data in minutes
 */
export type OHLCInterval = 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600;

/**
 * Fetch OHLC (candlestick) data from Kraken
 * @param pair - Trading pair (e.g., 'XBTUSD')
 * @param interval - Time interval in minutes (1, 5, 15, 30, 60, 240, 1440, 10080, 21600)
 * @param since - Optional Unix timestamp to fetch data from
 * @returns Promise with OHLC data
 */
export async function fetchOHLC(
  pair: string,
  interval: OHLCInterval,
  since?: number,
) {
  return publicRestRequest<'OHLC'>({
    url: 'OHLC',
    params: {
      pair,
      interval,
      ...(since && { since }),
    },
  });
}
