import type { PublicWsTypes } from 'ts-kraken';
import { Ticker } from '../domain/Ticker';

type TickerDTO = PublicWsTypes.PublicSubscriptionUpdate<'ticker'>['data'][0];

/**
 * Maps Kraken WebSocket ticker DTO to Ticker domain model
 * @param dto Raw ticker data from WebSocket update
 * @returns Ticker domain model instance
 */
export function mapTicker(dto: TickerDTO): Ticker {
  return new Ticker(
    dto.symbol,
    dto.last,
    dto.bid,
    dto.bid_qty,
    dto.ask,
    dto.ask_qty,
    dto.high,
    dto.low,
    dto.volume,
    dto.vwap,
    dto.change,
    dto.change_pct,
    new Date(), // Current timestamp when data received
  );
}
