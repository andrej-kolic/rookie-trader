import React from 'react';
import { render, screen } from '@testing-library/react';
import { PriceChart } from '..';

const props = {
  candles: [],
  volumeData: [],
  error: null,
  interval: 60 as const,
  onIntervalChange: jest.fn(),
};

describe('PriceChart states', () => {
  it('showsLoading_whenNoSymbolYetButLoading', () => {
    render(<PriceChart {...props} symbol="" loading />);

    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.queryByText(/Select a trading pair/)).toBeNull();
  });

  it('asksToSelectPair_whenNoSymbolAndNotLoading', () => {
    render(<PriceChart {...props} symbol="" loading={false} />);

    expect(screen.getByText(/Select a trading pair/)).toBeTruthy();
  });
});
