import type { PublicWsTypes } from 'ts-kraken';
import { TradingPair } from '../domain/TradingPair';

type InstrumentPairDTO =
  PublicWsTypes.PublicSubscriptionUpdate<'instrument'>['data']['pairs'][number];

/**
 * Maps Kraken WebSocket instrument pair to TradingPair domain model
 * @param dto The raw instrument pair from WebSocket
 * @returns TradingPair domain model instance
 */
export function mapInstrumentPair(dto: InstrumentPairDTO): TradingPair {
  return new TradingPair(
    dto.symbol,
    dto.base,
    dto.quote,
    dto.status,
    dto.qty_min,
    dto.cost_min,
    dto.qty_increment,
    dto.price_increment,
    dto.qty_precision,
    dto.price_precision,
    dto.cost_precision,
    dto.marginable,
    dto.margin_initial,
    dto.position_limit_long,
    dto.position_limit_short,
    dto.has_index,
  );
}

/**
 * Maps multiple instrument pairs to domain models
 * @param pairs Array of instrument pairs from WebSocket
 * @returns Map of symbol to TradingPair domain model
 */
export function mapInstrumentPairs(
  pairs: InstrumentPairDTO[],
): Map<string, TradingPair> {
  const pairMap = new Map<string, TradingPair>();

  for (const dto of pairs) {
    const pair = mapInstrumentPair(dto);
    pairMap.set(pair.symbol, pair);
  }

  return pairMap;
}
