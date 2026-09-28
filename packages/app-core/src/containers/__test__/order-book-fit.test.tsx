import React from 'react';
import { concat, NEVER, of } from 'rxjs';
import { act, render } from '@testing-library/react';
import { OrderBookDisplayContainer } from '../OrderBookDisplayContainer';
import { TradingPair } from '../../domain/TradingPair';
import { useTradingStore } from '../../state/trading-store';

const levels = (start: number, step: number) =>
  Array.from({ length: 25 }, (_, i) => ({ price: start + i * step, qty: 1 }));

// The order book arrives over the Kraken WebSocket
jest.mock('../../api/kraken-ws-api', () => ({
  subscribeToOrderBook: () =>
    concat(
      of({
        type: 'snapshot',
        data: [
          {
            symbol: 'BTC/USD',
            bids: levels(100, -1),
            asks: levels(101, 1),
            checksum: 0,
            timestamp: '2026-09-28T10:00:00Z',
          },
        ],
      }),
      NEVER,
    ),
}));

// Layout is the browser's job; jsdom computes none, so stand in for it
const ROW_HEIGHT = 30;
const SPREAD_HEIGHT = 40;
let resize: (height: number) => void = () => undefined;

beforeAll(() => {
  global.ResizeObserver = class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() {
      resize = (height) => {
        this.callback(
          [{ contentRect: { height } } as ResizeObserverEntry],
          this as unknown as ResizeObserver,
        );
      };
    }
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
  jest
    .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
    .mockImplementation(function (this: HTMLElement) {
      if (this.hasAttribute('data-spread')) return SPREAD_HEIGHT;
      if (this.hasAttribute('data-level')) return ROW_HEIGHT;
      return 0;
    });
});

beforeEach(() => {
  useTradingStore.setState({
    selectedPair: new TradingPair(
      'BTC/USD',
      'BTC',
      'USD',
      'online',
      0.00005,
      0.5,
      0.00000001,
      0.1,
      8,
      1,
      5,
      true,
    ),
  });
});

function visibleLevels(container: HTMLElement) {
  return container.querySelectorAll('[data-level]').length;
}

describe('OrderBookDisplayContainer row fitting', () => {
  it('showsRowsThatFit_whenPanelIsMeasured', () => {
    const { container } = render(<OrderBookDisplayContainer />);

    // 400px: (400 - 40) / 30 = 12 rows, 6 per side
    act(() => {
      resize(400);
    });

    expect(visibleLevels(container)).toBe(12);
  });

  it('showsFewerRows_whenPanelShrinks', () => {
    const { container } = render(<OrderBookDisplayContainer />);
    act(() => {
      resize(400);
    });

    // 200px: (200 - 40) / 30 = 5 rows, 2 per side
    act(() => {
      resize(200);
    });

    expect(visibleLevels(container)).toBe(4);
  });

  it('capsAtFetchedDepth_whenPanelIsVeryTall', () => {
    const { container } = render(<OrderBookDisplayContainer />);

    act(() => {
      resize(5000);
    });

    expect(visibleLevels(container)).toBe(50);
  });
});
