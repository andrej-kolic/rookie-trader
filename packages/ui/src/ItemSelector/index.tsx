import './styles.css';

export type SelectorItem = {
  id: string;
  label: string;
  sublabel?: string;
};

export type SelectorDetails = {
  title: string;
  fields: { label: string; value: string }[];
};

export type ItemSelectorProps = {
  items: SelectorItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  error?: string | null;
  placeholder?: string;
  label?: string;
  renderDetails?: (itemId: string) => SelectorDetails | null;
};

export function ItemSelector({
  items,
  selectedId,
  onSelect,
  loading = false,
  error = null,
  placeholder = 'Select an item...',
  label = 'Item',
  renderDetails,
}: ItemSelectorProps) {
  if (loading) {
    return (
      <div className="ItemSelector ItemSelector--loading">
        Loading {label.toLowerCase()}s...
      </div>
    );
  }

  if (error) {
    return (
      <div className="ItemSelector ItemSelector--error">
        <strong>Error loading {label.toLowerCase()}s:</strong> {error}
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(e.target.value);
  };

  const details =
    selectedId && renderDetails ? renderDetails(selectedId) : null;

  return (
    <div className="ItemSelector">
      <label htmlFor="item-select" className="ItemSelector__label">
        {label}:
      </label>
      <select
        id="item-select"
        className="ItemSelector__select"
        value={selectedId}
        onChange={handleChange}
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
            {item.sublabel ? ` (${item.sublabel})` : ''}
          </option>
        ))}
      </select>
      {details && (
        <div className="ItemSelector__info">
          <p className="ItemSelector__info-title">
            <strong>{details.title}</strong>
          </p>
          {details.fields.map((field, index) => (
            <p key={index} className="ItemSelector__info-field">
              <strong>{field.label}:</strong> {field.value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
