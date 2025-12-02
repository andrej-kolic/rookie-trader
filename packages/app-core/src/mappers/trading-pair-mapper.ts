import type { PublicRestTypes } from 'ts-kraken';
import { TradingPair } from '../domain/TradingPair';

type AssetPairDTO =
  PublicRestTypes.PublicRestEndpoints.AssetPairs.Result[string];

/**
 * Maps Kraken API AssetPair DTO to TradingPair domain model
 * @param id The pair identifier (e.g., "XXBTZUSD")
 * @param dto The raw API response for a single pair
 * @returns TradingPair domain model instance
 */
export function mapTradingPair(id: string, dto: AssetPairDTO): TradingPair {
  return new TradingPair(
    id,
    dto.altname,
    dto.wsname,
    dto.aclass_base,
    dto.base,
    dto.aclass_quote,
    dto.quote,
    dto.pair_decimals,
    dto.cost_decimals,
    dto.lot_decimals,
    dto.lot_multiplier,
    dto.leverage_buy,
    dto.leverage_sell,
    dto.fees,
    dto.fees_maker,
    dto.fee_volume_currency,
    dto.margin_call,
    dto.margin_stop,
    dto.ordermin,
    dto.costmin,
    dto.tick_size,
    dto.status,
    dto.long_position_limit,
    dto.short_position_limit,
  );
}

/**
 * Maps multiple asset pairs from API response to domain models
 * @param result The complete API response with all pairs
 * @returns Map of pair ID to TradingPair domain model
 */
export function mapTradingPairs(
  result: PublicRestTypes.PublicRestEndpoints.AssetPairs.Result,
): Map<string, TradingPair> {
  const pairs = new Map<string, TradingPair>();

  for (const [id, dto] of Object.entries(result)) {
    pairs.set(id, mapTradingPair(id, dto));
  }

  return pairs;
}
