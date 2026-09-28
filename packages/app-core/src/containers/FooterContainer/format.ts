const amountFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 8,
});

const timeFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** Price or quantity at up to 8 decimals, Kraken's finest asset precision */
export function formatAmount(value: number): string {
  return amountFormat.format(value);
}

export function formatTime(value: Date): string {
  return timeFormat.format(value);
}
