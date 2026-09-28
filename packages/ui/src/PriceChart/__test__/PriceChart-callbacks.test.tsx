import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriceChart, type PriceChartProps } from '..';

const props: PriceChartProps = {
  candles: [],
  volumeData: [],
  loading: false,
  error: 'Network down',
  symbol: 'BTC/USD',
  interval: 60,
};

describe('PriceChart callbacks', () => {
  it('callsLatestOnRefresh_whenOnlyCallbackChanged', async () => {
    const first = jest.fn();
    const latest = jest.fn();
    const { rerender } = render(<PriceChart {...props} onRefresh={first} />);

    rerender(<PriceChart {...props} onRefresh={latest} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(latest).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });
});
