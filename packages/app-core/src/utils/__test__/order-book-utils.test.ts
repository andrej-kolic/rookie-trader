import { OrderBookLevel } from '../../domain/OrderBookLevel';
import {
  mergePriceLevels,
  calculateCumulativeTotals,
  getMaxCumulativeTotal,
  calculateDepthPercentages,
  validateLevelsSorting,
  validateSpread,
  type PriceLevelUpdate,
} from '../order-book-utils';

describe('order-book-utils', () => {
  describe('mergePriceLevels', () => {
    describe('bid side (descending)', () => {
      it('should maintain descending order for bids', () => {
        const currentBids = [
          new OrderBookLevel(100, 1.5),
          new OrderBookLevel(99, 2.0),
          new OrderBookLevel(98, 1.0),
        ];

        const updates: PriceLevelUpdate[] = [
          { price: 101, qty: 0.5 }, // New highest bid
          { price: 97, qty: 3.0 }, // New lowest bid
        ];

        const result = mergePriceLevels(currentBids, updates, 'bid');

        expect(result).toHaveLength(5);
        expect(result.at(0)?.price).toBe(101); // Highest first
        expect(result.at(1)?.price).toBe(100);
        expect(result.at(2)?.price).toBe(99);
        expect(result.at(3)?.price).toBe(98);
        expect(result.at(4)?.price).toBe(97); // Lowest last
      });

      it('should update existing bid levels', () => {
        const currentBids = [
          new OrderBookLevel(100, 1.5),
          new OrderBookLevel(99, 2.0),
        ];

        const updates: PriceLevelUpdate[] = [
          { price: 100, qty: 3.0 }, // Update existing level
        ];

        const result = mergePriceLevels(currentBids, updates, 'bid');

        expect(result).toHaveLength(2);
        expect(result.at(0)?.price).toBe(100);
        expect(result.at(0)?.quantity).toBe(3.0); // Updated quantity
      });

      it('should remove bid levels when qty is 0', () => {
        const currentBids = [
          new OrderBookLevel(100, 1.5),
          new OrderBookLevel(99, 2.0),
          new OrderBookLevel(98, 1.0),
        ];

        const updates: PriceLevelUpdate[] = [
          { price: 99, qty: 0 }, // Remove middle level
        ];

        const result = mergePriceLevels(currentBids, updates, 'bid');

        expect(result).toHaveLength(2);
        expect(result.at(0)?.price).toBe(100);
        expect(result.at(1)?.price).toBe(98);
        expect(result.find((l) => l.price === 99)).toBeUndefined();
      });

      it('should handle empty current levels', () => {
        const currentBids: OrderBookLevel[] = [];

        const updates: PriceLevelUpdate[] = [
          { price: 100, qty: 1.5 },
          { price: 99, qty: 2.0 },
        ];

        const result = mergePriceLevels(currentBids, updates, 'bid');

        expect(result).toHaveLength(2);
        expect(result.at(0)?.price).toBe(100); // Descending order
        expect(result.at(1)?.price).toBe(99);
      });

      it('should maintain descending order even after removing all levels and adding new ones', () => {
        const currentBids = [new OrderBookLevel(100, 1.5)];

        const updates: PriceLevelUpdate[] = [
          { price: 100, qty: 0 }, // Remove existing
          { price: 95, qty: 1.0 }, // Add new
          { price: 96, qty: 2.0 }, // Add new
        ];

        const result = mergePriceLevels(currentBids, updates, 'bid');

        expect(result).toHaveLength(2);
        expect(result.at(0)?.price).toBe(96); // Higher price first
        expect(result.at(1)?.price).toBe(95);
      });
    });

    describe('ask side (ascending)', () => {
      it('should maintain ascending order for asks', () => {
        const currentAsks = [
          new OrderBookLevel(101, 1.5),
          new OrderBookLevel(102, 2.0),
          new OrderBookLevel(103, 1.0),
        ];

        const updates: PriceLevelUpdate[] = [
          { price: 100, qty: 0.5 }, // New lowest ask
          { price: 104, qty: 3.0 }, // New highest ask
        ];

        const result = mergePriceLevels(currentAsks, updates, 'ask');

        expect(result).toHaveLength(5);
        expect(result.at(0)?.price).toBe(100); // Lowest first
        expect(result.at(1)?.price).toBe(101);
        expect(result.at(2)?.price).toBe(102);
        expect(result.at(3)?.price).toBe(103);
        expect(result.at(4)?.price).toBe(104); // Highest last
      });

      it('should update existing ask levels', () => {
        const currentAsks = [
          new OrderBookLevel(101, 1.5),
          new OrderBookLevel(102, 2.0),
        ];

        const updates: PriceLevelUpdate[] = [
          { price: 101, qty: 3.0 }, // Update existing level
        ];

        const result = mergePriceLevels(currentAsks, updates, 'ask');

        expect(result).toHaveLength(2);
        expect(result.at(0)?.price).toBe(101);
        expect(result.at(0)?.quantity).toBe(3.0); // Updated quantity
      });

      it('should remove ask levels when qty is 0', () => {
        const currentAsks = [
          new OrderBookLevel(101, 1.5),
          new OrderBookLevel(102, 2.0),
          new OrderBookLevel(103, 1.0),
        ];

        const updates: PriceLevelUpdate[] = [
          { price: 102, qty: 0 }, // Remove middle level
        ];

        const result = mergePriceLevels(currentAsks, updates, 'ask');

        expect(result).toHaveLength(2);
        expect(result.at(0)?.price).toBe(101);
        expect(result.at(1)?.price).toBe(103);
        expect(result.find((l) => l.price === 102)).toBeUndefined();
      });

      it('should handle empty current levels', () => {
        const currentAsks: OrderBookLevel[] = [];

        const updates: PriceLevelUpdate[] = [
          { price: 102, qty: 2.0 },
          { price: 101, qty: 1.5 },
        ];

        const result = mergePriceLevels(currentAsks, updates, 'ask');

        expect(result).toHaveLength(2);
        expect(result.at(0)?.price).toBe(101); // Ascending order
        expect(result.at(1)?.price).toBe(102);
      });

      it('should maintain ascending order even after removing all levels and adding new ones', () => {
        const currentAsks = [new OrderBookLevel(101, 1.5)];

        const updates: PriceLevelUpdate[] = [
          { price: 101, qty: 0 }, // Remove existing
          { price: 105, qty: 1.0 }, // Add new
          { price: 104, qty: 2.0 }, // Add new
        ];

        const result = mergePriceLevels(currentAsks, updates, 'ask');

        expect(result).toHaveLength(2);
        expect(result.at(0)?.price).toBe(104); // Lower price first
        expect(result.at(1)?.price).toBe(105);
      });
    });
  });

  describe('calculateCumulativeTotals', () => {
    it('should calculate cumulative totals correctly', () => {
      const levels = [
        new OrderBookLevel(100, 1.0),
        new OrderBookLevel(99, 2.0),
        new OrderBookLevel(98, 1.5),
      ];

      const result = calculateCumulativeTotals(levels);

      expect(result.at(0)?.total).toBe(1.0);
      expect(result.at(1)?.total).toBe(3.0); // 1.0 + 2.0
      expect(result.at(2)?.total).toBe(4.5); // 1.0 + 2.0 + 1.5
    });

    it('should handle empty array', () => {
      const levels: OrderBookLevel[] = [];

      const result = calculateCumulativeTotals(levels);

      expect(result).toHaveLength(0);
    });

    it('should handle single level', () => {
      const levels = [new OrderBookLevel(100, 5.0)];

      const result = calculateCumulativeTotals(levels);

      expect(result).toHaveLength(1);
      expect(result.at(0)?.total).toBe(5.0);
    });
  });

  describe('getMaxCumulativeTotal', () => {
    it('should return the last level total', () => {
      const levels = [
        new OrderBookLevel(100, 1.0, 1.0),
        new OrderBookLevel(99, 2.0, 3.0),
        new OrderBookLevel(98, 1.5, 4.5),
      ];

      const result = getMaxCumulativeTotal(levels);

      expect(result).toBe(4.5);
    });

    it('should return 1 for empty array', () => {
      const levels: OrderBookLevel[] = [];

      const result = getMaxCumulativeTotal(levels);

      expect(result).toBe(1);
    });

    it('should return total even if it is 0', () => {
      const levels = [new OrderBookLevel(100, 1.0, 0)];

      const result = getMaxCumulativeTotal(levels);

      expect(result).toBe(1); // Falls back to 1 when total is 0
    });
  });

  describe('calculateDepthPercentages', () => {
    it('should calculate percentages correctly', () => {
      const levels = [
        new OrderBookLevel(100, 1.0, 1.0),
        new OrderBookLevel(99, 2.0, 3.0),
        new OrderBookLevel(98, 1.5, 4.5),
      ];

      const result = calculateDepthPercentages(levels, 9.0);

      expect(result[0]).toBeCloseTo(11.11, 2); // 1.0 / 9.0 * 100
      expect(result[1]).toBeCloseTo(33.33, 2); // 3.0 / 9.0 * 100
      expect(result[2]).toBeCloseTo(50.0, 2); // 4.5 / 9.0 * 100
    });

    it('should handle max total of 0', () => {
      const levels = [new OrderBookLevel(100, 1.0, 1.0)];

      const result = calculateDepthPercentages(levels, 0);

      expect(result[0]).toBe(0);
    });

    it('should handle empty array', () => {
      const levels: OrderBookLevel[] = [];

      const result = calculateDepthPercentages(levels, 100);

      expect(result).toHaveLength(0);
    });
  });

  describe('validateLevelsSorting', () => {
    it('should validate descending bid sorting', () => {
      const validBids = [
        new OrderBookLevel(100, 1.0),
        new OrderBookLevel(99, 2.0),
        new OrderBookLevel(98, 1.5),
      ];

      expect(validateLevelsSorting(validBids, 'bid')).toBe(true);
    });

    it('should detect invalid bid sorting (ascending)', () => {
      const invalidBids = [
        new OrderBookLevel(98, 1.5),
        new OrderBookLevel(99, 2.0),
        new OrderBookLevel(100, 1.0),
      ];

      expect(validateLevelsSorting(invalidBids, 'bid')).toBe(false);
    });

    it('should validate ascending ask sorting', () => {
      const validAsks = [
        new OrderBookLevel(101, 1.0),
        new OrderBookLevel(102, 2.0),
        new OrderBookLevel(103, 1.5),
      ];

      expect(validateLevelsSorting(validAsks, 'ask')).toBe(true);
    });

    it('should detect invalid ask sorting (descending)', () => {
      const invalidAsks = [
        new OrderBookLevel(103, 1.5),
        new OrderBookLevel(102, 2.0),
        new OrderBookLevel(101, 1.0),
      ];

      expect(validateLevelsSorting(invalidAsks, 'ask')).toBe(false);
    });

    it('should allow equal prices', () => {
      const levels = [
        new OrderBookLevel(100, 1.0),
        new OrderBookLevel(100, 2.0),
      ];

      expect(validateLevelsSorting(levels, 'bid')).toBe(true);
      expect(validateLevelsSorting(levels, 'ask')).toBe(true);
    });

    it('should validate single level', () => {
      const levels = [new OrderBookLevel(100, 1.0)];

      expect(validateLevelsSorting(levels, 'bid')).toBe(true);
      expect(validateLevelsSorting(levels, 'ask')).toBe(true);
    });

    it('should validate empty array', () => {
      const levels: OrderBookLevel[] = [];

      expect(validateLevelsSorting(levels, 'bid')).toBe(true);
      expect(validateLevelsSorting(levels, 'ask')).toBe(true);
    });
  });

  describe('validateSpread', () => {
    it('should validate positive spread', () => {
      expect(validateSpread(99, 101)).toBe(true);
    });

    it('should validate zero spread', () => {
      expect(validateSpread(100, 100)).toBe(true);
    });

    it('should detect negative spread', () => {
      expect(validateSpread(101, 99)).toBe(false);
    });

    it('should handle null bid', () => {
      expect(validateSpread(null, 101)).toBe(true);
    });

    it('should handle null ask', () => {
      expect(validateSpread(99, null)).toBe(true);
    });

    it('should handle both null', () => {
      expect(validateSpread(null, null)).toBe(true);
    });
  });

  describe('integration: merge and validate', () => {
    it('should produce valid sorted bids after multiple merges', () => {
      let bids = [new OrderBookLevel(100, 1.0), new OrderBookLevel(99, 2.0)];

      // First update: add levels
      bids = mergePriceLevels(
        bids,
        [
          { price: 101, qty: 1.5 },
          { price: 98, qty: 0.5 },
        ],
        'bid',
      );

      expect(validateLevelsSorting(bids, 'bid')).toBe(true);
      expect(bids.at(0)?.price).toBe(101);

      // Second update: remove some, add some
      bids = mergePriceLevels(
        bids,
        [
          { price: 100, qty: 0 }, // Remove
          { price: 102, qty: 2.0 }, // Add higher
        ],
        'bid',
      );

      expect(validateLevelsSorting(bids, 'bid')).toBe(false);
      expect(bids.at(0)?.price).toBe(102);
    });

    it('should produce valid sorted asks after multiple merges', () => {
      let asks = [new OrderBookLevel(101, 1.0), new OrderBookLevel(102, 2.0)];

      // First update: add levels
      asks = mergePriceLevels(
        asks,
        [
          { price: 100, qty: 1.5 },
          { price: 103, qty: 0.5 },
        ],
        'ask',
      );

      expect(validateLevelsSorting(asks, 'ask')).toBe(true);
      expect(asks.at(0)?.price).toBe(100);

      // Second update: remove some, add some
      asks = mergePriceLevels(
        asks,
        [
          { price: 102, qty: 0 }, // Remove
          { price: 99, qty: 2.0 }, // Add lower
        ],
        'ask',
      );

      expect(validateLevelsSorting(asks, 'ask')).toBe(false);
      expect(asks.at(0)?.price).toBe(99);
    });

    it('should maintain valid spread after merges', () => {
      let bids = [new OrderBookLevel(99, 1.0)];
      let asks = [new OrderBookLevel(101, 1.0)];

      // Multiple updates
      bids = mergePriceLevels(bids, [{ price: 99.5, qty: 2.0 }], 'bid');
      asks = mergePriceLevels(asks, [{ price: 100.5, qty: 2.0 }], 'ask');

      const bestBid = bids.at(0)?.price ?? 0;
      const bestAsk = asks.at(0)?.price ?? 0;

      expect(validateSpread(bestBid, bestAsk)).toBe(true);
      expect(bestAsk).toBeGreaterThan(bestBid);
    });
  });
});
