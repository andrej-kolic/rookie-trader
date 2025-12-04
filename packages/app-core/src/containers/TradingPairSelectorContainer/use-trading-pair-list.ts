import { useMemo, useCallback } from 'react';
import { useTradingPairs } from './use-trading-pairs';
import type { TradingPair } from '../../domain/TradingPair';

export type TradingPairListState = {
  pairs: TradingPair[];
  loading: boolean;
  error: Error | null;
  getPairById: (pairId: string) => TradingPair | null;
};

/**
 * Business logic hook for trading pairs list
 * Returns filtered and sorted domain models
 */
export function useTradingPairList(): TradingPairListState {
  const { pairs: pairsMap, loading, error } = useTradingPairs();

  const pairs = useMemo(() => {
    return Array.from(pairsMap.values())
      .filter((pair) => pair.isTradeable())
      .sort((a, b) => a.getDisplayName().localeCompare(b.getDisplayName()));
  }, [pairsMap]);

  const getPairById = useCallback(
    (pairId: string): TradingPair | null => {
      return pairsMap.get(pairId) ?? null;
    },
    [pairsMap],
  );

  return {
    pairs,
    loading,
    error,
    getPairById,
  };
}
