import { useCallback, useEffect, useRef } from 'react';
import { useTradingStore } from '../../state/trading-store';
import type { TradingPair } from '../../domain/TradingPair';

const PAIR_PARAM = 'pair';
/** Selected when the URL names no pair, or one that doesn't exist */
export const DEFAULT_PAIR_ID = 'BTC/USD';

type UseTradingPairUrlSyncOptions = {
  loading: boolean;
  pairsCount: number;
  getPairById: (id: string) => TradingPair | null;
};

/**
 * Hook to synchronize trading pair selection with URL query parameters
 * - Reads pair from URL on mount, falling back to BTC/USD
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
  const prevSelectedPairId = useRef(selectedPairId);

  // Select the URL's pair, or the default one. The default is written into
  // the URL with replaceState so Back doesn't return to the empty URL.
  const selectPairFromUrl = useCallback(
    (pairIdFromUrl: string | null) => {
      const pair = pairIdFromUrl ? getPairById(pairIdFromUrl) : null;
      if (pair) {
        setSelectedPair(pair);
        return;
      }

      const defaultPair = getPairById(DEFAULT_PAIR_ID);
      if (!defaultPair) return;

      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set(PAIR_PARAM, defaultPair.id);
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}?${urlParams.toString()}`,
      );
      setSelectedPair(defaultPair);
    },
    [getPairById, setSelectedPair],
  );

  // Sync URL with selected pair on mount and when pairs are loaded
  useEffect(() => {
    if (loading || pairsCount === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    selectPairFromUrl(urlParams.get(PAIR_PARAM));

    // Only run once when pairs are loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, pairsCount]);

  // Update URL when selection changes
  useEffect(() => {
    // Act only on a real change: on the first load this effect also runs
    // before the initial selection lands, and would strip the URL's pair
    if (prevSelectedPairId.current === selectedPairId) return;
    prevSelectedPairId.current = selectedPairId;

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

      if (pairIdFromUrl !== selectedPairId) {
        selectPairFromUrl(pairIdFromUrl);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectPairFromUrl, selectedPairId]);
}
