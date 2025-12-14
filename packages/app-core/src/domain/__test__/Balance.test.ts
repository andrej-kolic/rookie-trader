import { Balance } from '../Balance';

describe('Balance Domain Model', () => {
  it('should create a balance instance', () => {
    const balance = new Balance('XXBT', 1.5);
    expect(balance.asset).toBe('XXBT');
    expect(balance.balance).toBe(1.5);
  });
});
