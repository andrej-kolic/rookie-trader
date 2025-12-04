import { useMemo, useCallback } from 'react';
import { useTradingPairs } from './use-trading-pairs';
import { mapTradingPairs } from '../../mappers/trading-pair-mapper';
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
  const { pairs: pairsDTO, loading, error } = useTradingPairs();

  const pairs = useMemo(() => {
    if (!pairsDTO) return [];

    const domainPairs = mapTradingPairs(pairsDTO);

    return Array.from(domainPairs.values())
      .filter((pair) => pair.isTradeable())
      .sort((a, b) => a.getDisplayName().localeCompare(b.getDisplayName()));
  }, [pairsDTO]);

  const getPairById = useCallback(
    (pairId: string): TradingPair | null => {
      return pairs.find((pair) => pair.id === pairId) ?? null;
    },
    [pairs],
  );

  return {
    pairs,
    loading,
    error,
    getPairById,
  };
}
