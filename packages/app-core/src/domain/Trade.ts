import type { OrderSide } from './Order';

/**
 * Trade Domain Model
 * One fill of an order on the account
 */
export class Trade {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly symbol: string,
    public readonly side: OrderSide,
    public readonly price: number,
    public readonly quantity: number,
    /** Price × quantity, in the quote currency */
    public readonly cost: number,
    /** Null when the fill carried no fee */
    public readonly fee: { asset: string; amount: number } | null,
    public readonly time: Date,
  ) {}
}
