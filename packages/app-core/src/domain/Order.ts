export type OrderSide = 'buy' | 'sell';
export type OrderStatus =
  | 'pending_new'
  | 'new'
  | 'partially_filled'
  | 'filled'
  | 'canceled'
  | 'expired';

const OPEN_STATUSES: ReadonlySet<OrderStatus> = new Set([
  'pending_new',
  'new',
  'partially_filled',
]);

/**
 * Order Domain Model
 * An order placed on the account, as last reported by the executions feed
 */
export class Order {
  constructor(
    public readonly id: string,
    public readonly symbol: string,
    public readonly side: OrderSide,
    public readonly type: string,
    /** Null for order types without a limit price, e.g. market */
    public readonly limitPrice: number | null,
    public readonly quantity: number,
    public readonly filled: number,
    public readonly status: OrderStatus,
    public readonly createdAt: Date,
  ) {}

  /** Still on the book: not filled, cancelled or expired */
  isOpen(): boolean {
    return OPEN_STATUSES.has(this.status);
  }

  /** Copy with the fields a later execution report changed, e.g. a fill or an amend */
  withChanges(
    changes: Partial<
      Pick<Order, 'limitPrice' | 'quantity' | 'filled' | 'status'>
    >,
  ): Order {
    return new Order(
      this.id,
      this.symbol,
      this.side,
      this.type,
      changes.limitPrice ?? this.limitPrice,
      changes.quantity ?? this.quantity,
      changes.filled ?? this.filled,
      changes.status ?? this.status,
      this.createdAt,
    );
  }
}
