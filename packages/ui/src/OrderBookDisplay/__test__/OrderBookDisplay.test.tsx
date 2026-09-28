import React from 'react';
import { render, screen } from '@testing-library/react';
import { OrderBookDisplay } from '..';

describe('OrderBookDisplay states', () => {
  it('showsPlaceholder_whenLoading', () => {
    render(<OrderBookDisplay symbol="" bids={[]} asks={[]} loading />);

    expect(
      screen.getByRole('status', { name: 'Loading order book' }),
    ).toBeTruthy();
  });

  it('showsSingleMessage_whenBookEmpty', () => {
    render(<OrderBookDisplay symbol="BTC/USD" bids={[]} asks={[]} />);

    expect(screen.getByText('No orders in the book')).toBeTruthy();
    expect(screen.queryByText('No asks')).toBeNull();
    expect(screen.queryByText('No bids')).toBeNull();
  });

  it('showsNoAsks_whenOnlyBidsPresent', () => {
    render(
      <OrderBookDisplay
        symbol="BTC/USD"
        bids={[
          { price: '100', quantity: '1', total: '1', depthPercentage: 100 },
        ]}
        asks={[]}
      />,
    );

    expect(screen.getByText('No asks')).toBeTruthy();
    expect(screen.queryByText('No orders in the book')).toBeNull();
  });
});
