import type { PrivateWsTypes } from 'ts-kraken';
import { Balance } from '../domain/Balance';

type BalanceDTO =
  PrivateWsTypes.PrivateSubscriptionUpdate<'balances'>['data'][0];

/**
 * Maps Kraken WebSocket balance DTO to Balance domain model
 * @param dto Raw balance data from WebSocket update
 * @returns Balance domain model instance
 */
export function mapBalance(dto: BalanceDTO): Balance {
  return new Balance(dto.asset, dto.balance);
}
