# Domain Layer

This directory contains rich domain models with business logic, following Domain-Driven Design principles.

## TradingPair

A comprehensive domain model for Kraken trading pairs that encapsulates all pair-specific data and business rules.

### Key Features

- **Complete DTO mapping**: All fields from Kraken API are preserved
- **Business logic methods**: Validation, formatting, fee calculation
- **Immutability**: Read-only properties via `readonly` modifier
- **Type safety**: Strict TypeScript class with no `any` types

### Usage Example

```typescript
import { mapTradingPair } from '../mappers/trading-pair-mapper';

// Map from DTO to domain model
const pair = mapTradingPair('XXBTZUSD', krakenApiResponse['XXBTZUSD']);

// Use business methods
if (pair.isTradeable()) {
  const validation = pair.validateOrderSize(0.001);
  if (validation.valid) {
    const fee = pair.calculateFeeAmount(0.001, 45000, false);
    console.log(`Fee: ${fee} ${pair.quote}`);
  }
}

// Format display values
console.log(pair.formatPrice(45123.456)); // "45123.5"
console.log(pair.getSymbol()); // "XXBT/ZUSD"
```

### Business Methods

#### Trading Status

- `isTradeable()` - Check if pair is available for trading
- `isMarketOrderAllowed()` - Check if market orders are permitted
- `canOpenPosition()` - Check if new positions can be opened
- `isCancelOnly()` - Check if only cancellations are allowed

#### Validation

- `validateOrderSize(volume)` - Validate order volume against minimum
- `validateOrderCost(cost)` - Validate order cost against minimum

#### Formatting

- `formatPrice(price)` - Format price to pair decimals
- `formatVolume(volume)` - Format volume to lot decimals
- `getDisplayName()` - Get human-readable name
- `getSymbol()` - Get BASE/QUOTE format

#### Fee Calculation

- `calculateFeeRate(volume, isMaker)` - Get fee percentage for volume tier
- `calculateFeeAmount(volume, price, isMaker)` - Calculate actual fee amount

#### Leverage

- `hasLeverageBuy()` / `hasLeverageSell()` - Check leverage availability
- `getMaxLeverageBuy()` / `getMaxLeverageSell()` - Get maximum leverage

### Testing

Comprehensive test suite in `__test__/TradingPair.test.ts` covering all business methods.

```bash
pnpm test TradingPair.test.ts
```

### Design Decisions

1. **Class over frozen object**: Classes provide better IDE support, clearer intent, and easier testing
2. **Full DTO mapping**: All Kraken API fields preserved for future features
3. **Trust API data**: No validation on mapping, assumes Kraken provides valid data
4. **Comprehensive tests**: 18 test cases covering all business logic
