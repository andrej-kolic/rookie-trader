import { useState } from 'react';
import { useTradingPairs } from '../../containers/TradingPairSelectorContainer/use-trading-pairs';
import './styles.css';

export type TradingPairSelectorProps = {
  onPairSelect?: (pair: string, wsname: string) => void;
};

export function TradingPairSelector({
  onPairSelect,
}: TradingPairSelectorProps) {
  const { pairs, loading, error } = useTradingPairs();
  const [selected, setSelected] = useState<string>('');

  if (loading) {
    return (
      <div className="TradingPairSelector TradingPairSelector--loading">
        Loading trading pairs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="TradingPairSelector TradingPairSelector--error">
        <strong>Error loading pairs:</strong> {error.message}
      </div>
    );
  }

  if (!pairs) {
    return null;
  }

  // Filter for online pairs only and sort alphabetically
  const pairEntries = Object.entries(pairs)
    .filter(([_, pairInfo]) => pairInfo.status === 'online')
    .sort(([_a, a], [_b, b]) => {
      const nameA = a.wsname || a.altname;
      const nameB = b.wsname || b.altname;
      return nameA.localeCompare(nameB);
    });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pairKey = e.target.value;
    setSelected(pairKey);

    if (pairKey && onPairSelect) {
      const pairInfo = pairs[pairKey];
      if (pairInfo) {
        onPairSelect(pairKey, pairInfo.wsname);
      }
    }
  };

  return (
    <div className="TradingPairSelector">
      <label htmlFor="pair-select" className="TradingPairSelector__label">
        Trading Pair:
      </label>
      <select
        id="pair-select"
        className="TradingPairSelector__select"
        value={selected}
        onChange={handleChange}
      >
        <option value="">Select a trading pair...</option>
        {pairEntries.map(([key, pairInfo]) => (
          <option key={key} value={key}>
            {pairInfo.wsname || pairInfo.altname}
          </option>
        ))}
      </select>
      {selected && pairs[selected] && (
        <div className="TradingPairSelector__info">
          <p>
            <strong>Selected:</strong> {pairs[selected].wsname}
          </p>
          <p>
            <strong>Base:</strong> {pairs[selected].base} |{' '}
            <strong>Quote:</strong> {pairs[selected].quote}
          </p>
          <p>
            <strong>Min Order:</strong> {pairs[selected].ordermin}
          </p>
        </div>
      )}
    </div>
  );
}
