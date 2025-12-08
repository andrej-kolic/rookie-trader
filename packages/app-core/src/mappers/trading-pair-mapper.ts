import type { PublicRestTypes } from 'ts-kraken';
import { TradingPair, type TradingPairStatus } from '../domain/TradingPair';

type AssetPairDTO =
  PublicRestTypes.PublicRestEndpoints.AssetPairs.Result[string];

/**
 * Maps Kraken API AssetPair DTO to TradingPair domain model
 * @param id The pair identifier (e.g., "XXBTZUSD")
 * @param dto The raw API response for a single pair
 * @returns TradingPair domain model instance
 */
export function mapTradingPair(id: string, dto: AssetPairDTO): TradingPair {
  // Determine margin capability
  const maxLeverage = Math.max(...dto.leverage_buy, ...dto.leverage_sell, 0);
  const marginable = maxLeverage > 1;
  const marginInitial = marginable ? 1 / maxLeverage : undefined;

  // Calculate quantity increment from lot decimals
  const qtyIncrement = Math.pow(10, -dto.lot_decimals);

  return new TradingPair(
    dto.wsname || dto.altname || id, // symbol
    dto.base, // base
    dto.quote, // quote
    dto.status as TradingPairStatus, // status (cast to union type)
    parseFloat(dto.ordermin || '0'), // qtyMin
    parseFloat(dto.costmin || '0'), // costMin
    qtyIncrement, // qtyIncrement
    parseFloat(dto.tick_size || '0'), // priceIncrement
    dto.lot_decimals, // qtyPrecision
    dto.pair_decimals, // pricePrecision
    dto.cost_decimals, // costPrecision
    marginable, // marginable
    marginInitial, // marginInitial
    dto.long_position_limit, // longPositionLimit
    dto.short_position_limit, // shortPositionLimit
    false, // hasIndex (not available in this DTO usually)
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
