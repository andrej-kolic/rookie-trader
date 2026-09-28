import { renderHook } from '@testing-library/react';
import { TradingPair } from '../../../domain/TradingPair';
import { useTradingStore } from '../../../state/trading-store';
import { useTradingPairUrlSync } from '../use-trading-pair-url-sync';

function createPair(base: string, quote: string) {
  return new TradingPair(
    `${base}/${quote}`,
    base,
    quote,
    'online',
    0.00005,
    0.5,
    0.00000001,
    0.1,
    8,
    1,
    5,
    true,
  );
}

const PAIRS = new Map(
  [createPair('BTC', 'USD'), createPair('ETH', 'USD')].map((pair) => [
    pair.id,
    pair,
  ]),
);
const getPairById = (id: string) => PAIRS.get(id) ?? null;

function renderSync(url: string) {
  window.history.replaceState(null, '', url);
  renderHook(() => {
    useTradingPairUrlSync({
      loading: false,
      pairsCount: PAIRS.size,
      getPairById,
    });
  });
}

const selectedId = () => useTradingStore.getState().selectedPair?.id;
const urlPair = () => new URLSearchParams(window.location.search).get('pair');

describe('useTradingPairUrlSync', () => {
  beforeEach(() => {
    useTradingStore.setState({ selectedPair: null });
  });

  it('selectsBtcUsd_whenUrlHasNoPair', () => {
    const historyLength = window.history.length;

    renderSync('/');

    expect(selectedId()).toBe('BTC/USD');
    expect(urlPair()).toBe('BTC/USD');
    expect(window.history.length).toBe(historyLength);
  });

  it('selectsUrlPair_whenUrlPairExists', () => {
    const historyLength = window.history.length;

    renderSync('/?pair=ETH%2FUSD');

    expect(selectedId()).toBe('ETH/USD');
    expect(urlPair()).toBe('ETH/USD');
    expect(window.history.length).toBe(historyLength);
  });

  it('selectsBtcUsd_whenUrlPairIsUnknown', () => {
    renderSync('/?pair=NOPE%2FUSD');

    expect(selectedId()).toBe('BTC/USD');
    expect(urlPair()).toBe('BTC/USD');
  });
});
