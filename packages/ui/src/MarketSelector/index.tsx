import { useState, useMemo, useRef, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { tabClassName } from '../tabClassName';

export type MarketItem = {
  id: string;
  symbol: string; // e.g. "BTC/USD"
  base: string;
  quote: string;
  isMarginable: boolean;
  leverage?: string; // e.g. "5x"
};

export type MarketSelectorProps = {
  items: MarketItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  placeholder?: string;
  initialOpen?: boolean;
};

type Tab = 'favorites' | 'all' | 'spot' | 'margin';

export function MarketSelector({
  items,
  selectedId,
  onSelect,
  favorites,
  onToggleFavorite,
  placeholder = 'Select market',
  initialOpen = false,
}: MarketSelectorProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedItem = items.find((item) => item.id === selectedId);

  const filteredItems = useMemo(() => {
    let result = items;

    // 1. Filter by Tab
    if (activeTab === 'favorites') {
      result = result.filter((item) => favorites.includes(item.id));
    } else if (activeTab === 'margin') {
      result = result.filter((item) => item.isMarginable);
    } else if (activeTab === 'spot') {
      // Assuming everything is spot unless specified otherwise,
      // but for now let's just show all non-margin or just all?
      // Usually "Spot" implies standard trading.
      // If we treat "Spot" as "All" in this context or specific subset?
      // Let's treat Spot as everything for now, or maybe exclude futures if we had them.
      // Given the data, let's just show all for Spot too, or maybe non-margin?
      // Let's stick to "All" showing everything, and "Spot" showing everything (since it's a spot market app).
      // Actually, let's make "Spot" show everything for now to avoid confusion, or maybe just hide the tab if redundant.
      // Let's keep it simple: Spot = All for this dataset.
    }

    // 2. Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.symbol.toLowerCase().includes(q) ||
          item.base.toLowerCase().includes(q) ||
          item.quote.toLowerCase().includes(q),
      );
    }

    return result;
  }, [items, activeTab, searchQuery, favorites]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onToggleFavorite(id);
  };

  return (
    <div className="relative flex grow">
      <button
        ref={triggerRef}
        className="flex w-full max-w-[400px] cursor-pointer items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink transition-[border-color] duration-200 hover:border-line"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center gap-2">
          {selectedItem ? (
            <>
              <span className="text-sm font-medium text-ink">
                {selectedItem.symbol}
              </span>
              {selectedItem.leverage && (
                <span className="rounded-xs bg-border px-1 py-px text-[10px] text-muted">
                  {selectedItem.leverage}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted">{placeholder}</span>
          )}
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 z-1000 mt-1 flex max-h-[500px] w-[300px] flex-col rounded-lg border border-border bg-surface shadow-[0_4px_12px_var(--theme-shadow)]"
          ref={dropdownRef}
        >
          <div className="border-b border-border p-3">
            <input
              type="text"
              className="w-full rounded border border-border bg-void px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              autoFocus
            />
          </div>

          <div className="flex gap-4 border-b border-border px-3">
            <button
              className={tabClassName(activeTab === 'favorites')}
              onClick={() => {
                setActiveTab('favorites');
              }}
            >
              Favorites
            </button>
            <button
              className={tabClassName(activeTab === 'all')}
              onClick={() => {
                setActiveTab('all');
              }}
            >
              All
            </button>
            <button
              className={tabClassName(activeTab === 'margin')}
              onClick={() => {
                setActiveTab('margin');
              }}
            >
              Margin
            </button>
          </div>

          <div className="flex border-b border-border px-3 py-2 text-xs text-muted">
            <div className="w-6 shrink-0"></div>
            <div className="flex flex-1">Market</div>
            <div className="w-20 text-right">Price</div>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">
                No markets found
              </div>
            ) : (
              <Virtuoso
                style={{ height: '350px' }}
                data={filteredItems}
                itemContent={(_index, item) => {
                  const isFav = favorites.includes(item.id);
                  return (
                    <div
                      className={`flex cursor-pointer items-center px-3 py-2 transition-colors duration-100 hover:bg-border ${
                        item.id === selectedId ? 'bg-border' : ''
                      }`}
                      onClick={() => {
                        handleSelect(item.id);
                      }}
                    >
                      <div className="w-6 shrink-0">
                        <button
                          className={`flex cursor-pointer items-center justify-center hover:text-gold ${
                            isFav ? 'text-gold' : 'text-line'
                          }`}
                          onClick={(e) => {
                            toggleFavorite(e, item.id);
                          }}
                        >
                          {isFav ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="flex flex-1">
                        <span className="text-sm font-medium text-ink">
                          {item.symbol}
                        </span>
                        <div className="ml-2 flex gap-1">
                          {item.leverage && (
                            <span className="rounded-xs bg-border px-1 py-px text-[10px] text-muted">
                              {item.leverage}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        {/* Placeholder for price since we don't have it yet */}
                        <span className="text-muted">--</span>
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
