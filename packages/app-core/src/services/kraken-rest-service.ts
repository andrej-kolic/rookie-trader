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
