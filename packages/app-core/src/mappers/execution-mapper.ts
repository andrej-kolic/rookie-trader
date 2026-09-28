import type { PrivateWsTypes } from 'ts-kraken';
import { Order } from '../domain/Order';
import { Trade } from '../domain/Trade';

// Update reports carry only the fields that changed, whatever the type says
type ExecutionDTO = Partial<
  PrivateWsTypes.PrivateSubscriptionUpdate<'executions'>['data'][0]
>;

export type ExecutionsState = {
  /** Open orders by order id */
  orders: ReadonlyMap<string, Order>;
  /** Fills, newest first */
  trades: readonly Trade[];
};

export const EMPTY_EXECUTIONS: ExecutionsState = {
  orders: new Map(),
  trades: [],
};

/** Most fills kept in memory; matches the size of Kraken's trade snapshot */
export const MAX_TRADES = 50;

function mapOrder(dto: ExecutionDTO): Order | null {
  if (
    !dto.order_id ||
    !dto.symbol ||
    !dto.side ||
    !dto.order_type ||
    dto.order_qty === undefined ||
    !dto.order_status
  ) {
    return null;
  }
  return new Order(
    dto.order_id,
    dto.symbol,
    dto.side,
    dto.order_type,
    dto.limit_price ?? null,
    dto.order_qty,
    dto.cum_qty ?? 0,
    dto.order_status,
    new Date(dto.timestamp ?? Date.now()),
  );
}

function mapTrade(dto: ExecutionDTO): Trade | null {
  if (
    !dto.exec_id ||
    !dto.order_id ||
    !dto.symbol ||
    !dto.side ||
    dto.last_price === undefined ||
    dto.last_qty === undefined
  ) {
    return null;
  }
  const fee = dto.fees?.[0];
  return new Trade(
    dto.exec_id,
    dto.order_id,
    dto.symbol,
    dto.side,
    dto.last_price,
    dto.last_qty,
    dto.cost ?? dto.last_price * dto.last_qty,
    fee ? { asset: fee.asset, amount: fee.qty } : null,
    new Date(dto.timestamp ?? Date.now()),
  );
}

/**
 * Applies one executions-channel message to the open orders and recent
 * fills. A snapshot replaces the open orders, so orders closed while the
 * connection was down drop out; fills are merged either way. Orders leave the
 * list once filled, cancelled or expired; reports for orders not in the list
 * are ignored unless they describe a new open order in full.
 */
export function applyExecutions(
  state: ExecutionsState,
  message: { type: 'snapshot' | 'update'; data: ExecutionDTO[] },
): ExecutionsState {
  const reports = message.data;
  const orders = new Map(message.type === 'snapshot' ? [] : state.orders);
  const newTrades: Trade[] = [];

  for (const dto of reports) {
    if (dto.exec_type === 'trade') {
      const trade = mapTrade(dto);
      if (trade) newTrades.push(trade);
    }

    if (!dto.order_id) continue;
    const existing = orders.get(dto.order_id);
    const order = existing
      ? existing.withChanges({
          // Amend reports carry a new price or quantity
          limitPrice: dto.limit_price,
          quantity: dto.order_qty,
          filled: dto.cum_qty,
          status: dto.order_status,
        })
      : dto.exec_type === 'trade'
        ? null
        : mapOrder(dto);

    if (order?.isOpen()) {
      orders.set(order.id, order);
    } else {
      orders.delete(dto.order_id);
    }
  }

  if (newTrades.length === 0) return { orders, trades: state.trades };

  const seen = new Set(state.trades.map((trade) => trade.id));
  const trades = [
    ...newTrades.filter((trade) => !seen.has(trade.id)),
    ...state.trades,
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, MAX_TRADES);

  return { orders, trades };
}
