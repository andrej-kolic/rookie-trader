import { useState, useMemo, useRef, useEffect } from 'react';
import './styles.css';

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
};

type Tab = 'favorites' | 'all' | 'spot' | 'margin';

export function MarketSelector({
  items,
  selectedId,
  onSelect,
  favorites,
  onToggleFavorite,
  placeholder = 'Select market',
}: MarketSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="MarketSelector">
      <button
        ref={triggerRef}
        className="MarketSelector__trigger"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <div className="MarketSelector__trigger-content">
          {selectedItem ? (
            <>
              <span className="MarketSelector__symbol">
                {selectedItem.symbol}
              </span>
              {selectedItem.leverage && (
                <span className="MarketSelector__badge">
                  {selectedItem.leverage}
                </span>
              )}
            </>
          ) : (
            <span style={{ color: '#848e9c' }}>{placeholder}</span>
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
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="MarketSelector__dropdown" ref={dropdownRef}>
          <div className="MarketSelector__search-container">
            <input
              type="text"
              className="MarketSelector__search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              autoFocus
            />
          </div>

          <div className="MarketSelector__tabs">
            <button
              className={`MarketSelector__tab ${
                activeTab === 'favorites' ? 'MarketSelector__tab--active' : ''
              }`}
              onClick={() => {
                setActiveTab('favorites');
              }}
            >
              Favorites
            </button>
            <button
              className={`MarketSelector__tab ${
                activeTab === 'all' ? 'MarketSelector__tab--active' : ''
              }`}
              onClick={() => {
                setActiveTab('all');
              }}
            >
              All
            </button>
            <button
              className={`MarketSelector__tab ${
                activeTab === 'margin' ? 'MarketSelector__tab--active' : ''
              }`}
              onClick={() => {
                setActiveTab('margin');
              }}
            >
              Margin
            </button>
          </div>

          <div className="MarketSelector__list-header">
            <div className="MarketSelector__col-fav"></div>
            <div className="MarketSelector__col-market">Market</div>
            <div className="MarketSelector__col-price">Price</div>
          </div>

          <div className="MarketSelector__list">
            {filteredItems.length === 0 ? (
              <div className="MarketSelector__empty">No markets found</div>
            ) : (
              filteredItems.map((item) => {
                const isFav = favorites.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`MarketSelector__item ${
                      item.id === selectedId
                        ? 'MarketSelector__item--selected'
                        : ''
                    }`}
                    onClick={() => {
                      handleSelect(item.id);
                    }}
                  >
                    <div className="MarketSelector__col-fav">
                      <button
                        className={`MarketSelector__fav-btn ${
                          isFav ? 'MarketSelector__fav-btn--active' : ''
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
                    <div className="MarketSelector__col-market">
                      <span className="MarketSelector__symbol">
                        {item.symbol}
                      </span>
                      <div className="MarketSelector__badges">
                        {item.leverage && (
                          <span className="MarketSelector__badge">
                            {item.leverage}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="MarketSelector__col-price">
                      {/* Placeholder for price since we don't have it yet */}
                      <span style={{ color: '#848e9c' }}>--</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
