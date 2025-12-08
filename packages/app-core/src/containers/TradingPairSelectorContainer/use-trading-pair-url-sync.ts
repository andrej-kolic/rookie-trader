import { useEffect, useRef } from 'react';
import { useTradingStore } from '../../state/trading-store';
import type { TradingPair } from '../../domain/TradingPair';

const PAIR_PARAM = 'pair';

type UseTradingPairUrlSyncOptions = {
  loading: boolean;
  pairsCount: number;
  getPairById: (id: string) => TradingPair | null;
};

/**
 * Hook to synchronize trading pair selection with URL query parameters
 * - Reads pair from URL on mount
 * - Updates URL when selection changes
 * - Handles browser back/forward navigation
 */
export function useTradingPairUrlSync({
  loading,
  pairsCount,
  getPairById,
}: UseTradingPairUrlSyncOptions) {
  const selectedPairId = useTradingStore(
    (state) => state.selectedPair?.id ?? '',
  );
  const setSelectedPair = useTradingStore((state) => state.setSelectedPair);
  const isInitialMount = useRef(true);

  // Sync URL with selected pair on mount and when pairs are loaded
  useEffect(() => {
    if (loading || pairsCount === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const pairIdFromUrl = urlParams.get(PAIR_PARAM);

    // If URL has a pair, set it as the initial selection
    if (pairIdFromUrl) {
      const pair = getPairById(pairIdFromUrl);
      if (pair) {
        setSelectedPair(pair);
      }
    }

    isInitialMount.current = false;
    // Only run once when pairs are loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, pairsCount]);

  // Update URL when selection changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const currentUrlPair = urlParams.get(PAIR_PARAM);

    if (selectedPairId) {
      // Set or update pair in URL
      if (currentUrlPair !== selectedPairId) {
        urlParams.set(PAIR_PARAM, selectedPairId);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.pushState({}, '', newUrl);
      }
    } else {
      // Remove pair from URL if none selected
      if (currentUrlPair) {
        urlParams.delete(PAIR_PARAM);
        const newUrl = urlParams.toString()
          ? `${window.location.pathname}?${urlParams.toString()}`
          : window.location.pathname;
        window.history.pushState({}, '', newUrl);
      }
    }
  }, [selectedPairId]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const pairIdFromUrl = urlParams.get(PAIR_PARAM);

      if (pairIdFromUrl && pairIdFromUrl !== selectedPairId) {
        const pair = getPairById(pairIdFromUrl);
        if (pair) {
          setSelectedPair(pair);
        }
      } else if (!pairIdFromUrl && selectedPairId) {
        setSelectedPair(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [getPairById, setSelectedPair, selectedPairId]);
}
