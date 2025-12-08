import { OrderBookLevel } from '../../domain/OrderBookLevel';
import { removeCrossedOrders } from '../order-book-sanitizer';

describe('order-book-sanitizer', () => {
  describe('removeCrossedOrders', () => {
    it('should not modify non-crossed orders', () => {
      const bids = [
        new OrderBookLevel(100, 1.0),
        new OrderBookLevel(99, 2.0),
        new OrderBookLevel(98, 1.5),
      ];

      const asks = [
        new OrderBookLevel(101, 1.0),
        new OrderBookLevel(102, 2.0),
        new OrderBookLevel(103, 1.5),
      ];

      const result = removeCrossedOrders(bids, asks);

      expect(result.sanitizedBids).toEqual(bids);
      expect(result.sanitizedAsks).toEqual(asks);
      expect(result.removedBids).toBe(0);
      expect(result.removedAsks).toBe(0);
    });

    it('should remove crossed bids when best bid >= best ask', () => {
      const bids = [
        new OrderBookLevel(102, 1.0), // Crossed - above best ask
        new OrderBookLevel(101, 2.0), // Crossed - above best ask
        new OrderBookLevel(100, 1.5), // Crossed - equal to best ask
        new OrderBookLevel(99, 1.0), // Valid
        new OrderBookLevel(98, 2.0), // Valid
      ];

      const asks = [
        new OrderBookLevel(100, 1.0), // Best ask - also needs removal (crosses with bids)
        new OrderBookLevel(101, 2.0), // Also crossed
        new OrderBookLevel(102, 1.5), // Also crossed
      ];

      const result = removeCrossedOrders(bids, asks);

      expect(result.sanitizedBids).toHaveLength(2);
      expect(result.sanitizedBids.at(0)?.price).toBe(99);
      expect(result.sanitizedBids.at(1)?.price).toBe(98);
      expect(result.sanitizedAsks).toHaveLength(0); // All asks removed (all <= max bid)
      expect(result.removedBids).toBe(3);
      expect(result.removedAsks).toBe(3);
    });

    it('should remove crossed asks when best bid >= best ask', () => {
      const bids = [
        new OrderBookLevel(102, 1.0), // Best bid - also needs removal (crosses with asks)
        new OrderBookLevel(101, 2.0), // Also crossed
        new OrderBookLevel(100, 1.5), // Also crossed
      ];

      const asks = [
        new OrderBookLevel(98, 1.0), // Crossed - below best bid
        new OrderBookLevel(99, 2.0), // Crossed - below best bid
        new OrderBookLevel(102, 1.5), // Crossed - equal to best bid
        new OrderBookLevel(103, 1.0), // Valid
        new OrderBookLevel(104, 2.0), // Valid
      ];

      const result = removeCrossedOrders(bids, asks);

      expect(result.sanitizedBids).toHaveLength(0); // All bids removed (all >= min ask)
      expect(result.sanitizedAsks).toHaveLength(2);
      expect(result.sanitizedAsks.at(0)?.price).toBe(103);
      expect(result.sanitizedAsks.at(1)?.price).toBe(104);
      expect(result.removedBids).toBe(3);
      expect(result.removedAsks).toBe(3);
    });

    it('should remove from both sides when deeply crossed', () => {
      const bids = [
        new OrderBookLevel(105, 1.0), // Crossed
        new OrderBookLevel(104, 2.0), // Crossed
        new OrderBookLevel(103, 1.5), // Crossed
        new OrderBookLevel(99, 1.0), // Valid
      ];

      const asks = [
        new OrderBookLevel(100, 1.0), // Crossed
        new OrderBookLevel(101, 2.0), // Crossed
        new OrderBookLevel(106, 1.5), // Valid
      ];

      const result = removeCrossedOrders(bids, asks);

      expect(result.sanitizedBids).toHaveLength(1);
      expect(result.sanitizedBids.at(0)?.price).toBe(99);
      expect(result.sanitizedAsks).toHaveLength(1);
      expect(result.sanitizedAsks.at(0)?.price).toBe(106);
      expect(result.removedBids).toBe(3);
      expect(result.removedAsks).toBe(2);
    });

    it('should handle empty bids', () => {
      const bids: OrderBookLevel[] = [];
      const asks = [new OrderBookLevel(100, 1.0)];

      const result = removeCrossedOrders(bids, asks);

      expect(result.sanitizedBids).toEqual([]);
      expect(result.sanitizedAsks).toEqual(asks);
      expect(result.removedBids).toBe(0);
      expect(result.removedAsks).toBe(0);
    });

    it('should handle empty asks', () => {
      const bids = [new OrderBookLevel(100, 1.0)];
      const asks: OrderBookLevel[] = [];

      const result = removeCrossedOrders(bids, asks);

      expect(result.sanitizedBids).toEqual(bids);
      expect(result.sanitizedAsks).toEqual([]);
      expect(result.removedBids).toBe(0);
      expect(result.removedAsks).toBe(0);
    });

    it('should handle both empty', () => {
      const bids: OrderBookLevel[] = [];
      const asks: OrderBookLevel[] = [];

      const result = removeCrossedOrders(bids, asks);

      expect(result.sanitizedBids).toEqual([]);
      expect(result.sanitizedAsks).toEqual([]);
      expect(result.removedBids).toBe(0);
      expect(result.removedAsks).toBe(0);
    });

    it('should handle exactly touching orders (best bid = best ask)', () => {
      const bids = [new OrderBookLevel(100, 1.0), new OrderBookLevel(99, 2.0)];

      const asks = [new OrderBookLevel(100, 1.0), new OrderBookLevel(101, 2.0)];

      const result = removeCrossedOrders(bids, asks);

      // Both at 100 should be removed
      expect(result.sanitizedBids).toHaveLength(1);
      expect(result.sanitizedBids.at(0)?.price).toBe(99);
      expect(result.sanitizedAsks).toHaveLength(1);
      expect(result.sanitizedAsks.at(0)?.price).toBe(101);
      expect(result.removedBids).toBe(1);
      expect(result.removedAsks).toBe(1);
    });

    it('should preserve order after removing crossed levels', () => {
      const bids = [
        new OrderBookLevel(103, 1.0), // Crossed
        new OrderBookLevel(99, 2.0), // Valid
        new OrderBookLevel(98, 1.5), // Valid
      ];

      const asks = [
        new OrderBookLevel(101, 1.0), // Best ask
        new OrderBookLevel(102, 2.0),
      ];

      const result = removeCrossedOrders(bids, asks);

      // Should maintain descending order for bids
      expect(result.sanitizedBids).toHaveLength(2);
      expect(result.sanitizedBids.at(0)?.price).toBe(99);
      expect(result.sanitizedBids.at(1)?.price).toBe(98);
      expect(result.sanitizedBids.at(0)?.price).toBeGreaterThan(
        result.sanitizedBids.at(1)?.price ?? 0,
      );
    });
  });
});
