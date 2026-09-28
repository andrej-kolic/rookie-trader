import { useState, useMemo, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Tab } from '../Tab';
import { useDismiss } from '../hooks/useDismiss';
import { marketSelector, marketRow } from './styles';

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

type TabId = 'favorites' | 'all' | 'spot' | 'margin';

const TABS: { id: TabId; label: string }[] = [
  { id: 'favorites', label: 'Favorites' },
  { id: 'all', label: 'All' },
  { id: 'margin', label: 'Margin' },
];

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
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useDismiss(isOpen, [dropdownRef, triggerRef], () => {
    setIsOpen(false);
  });

  const s = marketSelector({ open: isOpen });
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
    <div className={s.root()}>
      <button
        ref={triggerRef}
        className={s.trigger()}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <div className={s.triggerContent()}>
          {selectedItem ? (
            <>
              <span className={s.symbol()}>{selectedItem.symbol}</span>
              {selectedItem.leverage && (
                <span className={s.badge()}>{selectedItem.leverage}</span>
              )}
            </>
          ) : (
            <span className={s.placeholder()}>{placeholder}</span>
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
          className={s.chevron()}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className={s.dropdown()} ref={dropdownRef}>
          <div className={s.search()}>
            <input
              type="text"
              className={s.searchInput()}
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              autoFocus
            />
          </div>

          <div className={s.tabs()}>
            {TABS.map(({ id, label }) => (
              <Tab
                key={id}
                active={activeTab === id}
                onClick={() => {
                  setActiveTab(id);
                }}
              >
                {label}
              </Tab>
            ))}
          </div>

          <div className={s.listHeader()}>
            <div className={s.colFav()}></div>
            <div className={s.colMarket()}>Market</div>
            <div className={s.colPrice()}>Price</div>
          </div>

          <div className={s.list()}>
            {filteredItems.length === 0 ? (
              <div className={s.empty()}>No markets found</div>
            ) : (
              <Virtuoso
                style={{ height: '350px' }}
                data={filteredItems}
                itemContent={(_index, item) => {
                  const isFav = favorites.includes(item.id);
                  const row = marketRow({
                    selected: item.id === selectedId,
                    favorite: isFav,
                  });
                  return (
                    <div
                      className={row.row()}
                      onClick={() => {
                        handleSelect(item.id);
                      }}
                    >
                      <div className={s.colFav()}>
                        <button
                          className={row.favButton()}
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
                      <div className={s.colMarket()}>
                        <span className={s.symbol()}>{item.symbol}</span>
                        <div className={s.badges()}>
                          {item.leverage && (
                            <span className={s.badge()}>{item.leverage}</span>
                          )}
                        </div>
                      </div>
                      <div className={s.colPrice()}>
                        {/* Placeholder for price since we don't have it yet */}
                        <span className={s.placeholder()}>--</span>
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
