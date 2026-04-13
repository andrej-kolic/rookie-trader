/**
 * Balance Domain Model
 * Represents the balance of a specific asset in the account
 * Immutable snapshot of current balance state
 */
export class Balance {
  constructor(
    public readonly asset: string,
    public readonly balance: number,
  ) {}
}
