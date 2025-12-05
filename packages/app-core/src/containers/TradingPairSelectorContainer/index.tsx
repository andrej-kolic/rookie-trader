import { useMemo, useCallback, useState, useEffect } from 'react';
import { MarketSelector, type MarketItem } from '@repo/ui';
import { useTradingPairList } from '../../hooks/use-trading-pair-list';
import { useTradingPairUrlSync } from './use-trading-pair-url-sync';
import { useTradingStore } from '../../state/trading-store';

export function TradingPairSelectorContainer() {
  const { pairs, loading, error, getPairById } = useTradingPairList();
  const selectedPairId = useTradingStore(
    (state) => state.selectedPair?.id ?? '',
  );
  const setSelectedPair = useTradingStore((state) => state.setSelectedPair);

  // Favorites state (persisted to localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rookie-trader-favorites');
      const parsed = saved ? (JSON.parse(saved) as unknown) : [];
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('rookie-trader-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }, []);

  // Sync trading pair selection with URL
  useTradingPairUrlSync({
    loading,
    pairsCount: pairs.length,
    getPairById,
  });

  // Map domain models to UI component props
  const items: MarketItem[] = useMemo(
    () =>
      pairs.map((pair) => {
        // Calculate leverage (e.g. 0.2 margin = 5x)
        let leverage: string | undefined;
        if (pair.marginable && pair.marginInitial) {
          const lev = Math.round(1 / pair.marginInitial);
          if (lev > 1) {
            leverage = `${lev}x`;
          }
        }

        return {
          id: pair.id,
          symbol: pair.getDisplayName(), // Use display name (e.g. BTC/USD)
          base: pair.base,
          quote: pair.quote,
          isMarginable: pair.marginable,
          leverage,
        };
      }),
    [pairs],
  );

  const handleSelect = useCallback(
    (pairId: string) => {
      const domainPair = getPairById(pairId);
      setSelectedPair(domainPair);
    },
    [getPairById, setSelectedPair],
  );

  if (loading) return <div>Loading markets...</div>;
  if (error) return <div>Error loading markets</div>;

  return (
    <MarketSelector
      items={items}
      selectedId={selectedPairId}
      onSelect={handleSelect}
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      placeholder="Select a trading pair..."
    />
  );
}
