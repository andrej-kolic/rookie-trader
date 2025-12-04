import { useMemo, useCallback } from 'react';
import {
  ItemSelector,
  type SelectorItem,
  type SelectorDetails,
} from '@repo/ui';
import { useTradingPairList } from '../hooks/use-trading-pair-list';
import { useTradingStore } from '../state/trading-store';
// import type { TradingPair } from '../domain/TradingPair';

export function TradingPairSelectorContainer() {
  const { pairs, loading, error, getPairById } = useTradingPairList();
  // Use Zustand selectors to only subscribe to needed state
  const selectedPairId = useTradingStore(
    (state) => state.selectedPair?.id ?? '',
  );
  const setSelectedPair = useTradingStore((state) => state.setSelectedPair);

  // Map domain models to UI component props
  const items: SelectorItem[] = useMemo(
    () =>
      pairs.map((pair) => ({
        id: pair.id,
        label: pair.getDisplayName(),
        sublabel: pair.getSymbol(),
      })),
    [pairs],
  );

  const handleSelect = useCallback(
    (pairId: string) => {
      const domainPair = getPairById(pairId);
      setSelectedPair(domainPair);
    },
    [getPairById, setSelectedPair],
  );

  const renderDetails = useCallback(
    (pairId: string): SelectorDetails | null => {
      const pair = getPairById(pairId);
      if (!pair) return null;

      return {
        title: pair.getDisplayName(),
        fields: [
          { label: 'Base', value: pair.base },
          { label: 'Quote', value: pair.quote },
          { label: 'Min Order', value: pair.ordermin },
          { label: 'Status', value: pair.status },
        ],
      };
    },
    [getPairById],
  );

  return (
    <ItemSelector
      items={items}
      selectedId={selectedPairId}
      onSelect={handleSelect}
      loading={loading}
      error={error?.message}
      placeholder="Select a trading pair..."
      label="Trading Pair"
      renderDetails={renderDetails}
    />
  );
}
