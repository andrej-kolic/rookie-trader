import { OrderBookLevel } from '../domain/OrderBookLevel';

/**
 * Removes crossed orders from bid and ask levels
 * Crossed orders occur when best bid >= best ask, which shouldn't exist in a valid book
 * This can happen temporarily due to network delays between separate bid/ask updates
 *
 * @param bids Bid levels (should be sorted descending)
 * @param asks Ask levels (should be sorted ascending)
 * @returns Sanitized bid and ask levels with crossed orders removed
 */
export function removeCrossedOrders(
  bids: readonly OrderBookLevel[],
  asks: readonly OrderBookLevel[],
): {
  sanitizedBids: OrderBookLevel[];
  sanitizedAsks: OrderBookLevel[];
  removedBids: number;
  removedAsks: number;
} {
  if (bids.length === 0 || asks.length === 0) {
    return {
      sanitizedBids: [...bids],
      sanitizedAsks: [...asks],
      removedBids: 0,
      removedAsks: 0,
    };
  }

  const bestBid = bids[0];
  const bestAsk = asks[0];

  // No crossing - return as-is
  if (!bestBid || !bestAsk || bestBid.price < bestAsk.price) {
    return {
      sanitizedBids: [...bids],
      sanitizedAsks: [...asks],
      removedBids: 0,
      removedAsks: 0,
    };
  }

  // Orders are crossed - need to remove invalid levels
  // Strategy: Remove all bids >= bestAsk AND all asks <= bestBid
  // This creates a gap where the spread should be

  // Remove bids that are >= best ask (too high - these bids would cross with asks)
  const sanitizedBids = bids.filter((bid) => bid.price < bestAsk.price);
  const removedBids = bids.length - sanitizedBids.length;

  // Remove asks that are <= best bid (too low - these asks would cross with bids)
  const sanitizedAsks = asks.filter((ask) => ask.price > bestBid.price);
  const removedAsks = asks.length - sanitizedAsks.length;

  // // eslint-disable-next-line no-console
  // console.warn('⚠️ Crossed orders detected and removed', {
  //   originalBestBid: bestBid.price,
  //   originalBestAsk: bestAsk.price,
  //   crossAmount: bestBid.price - bestAsk.price,
  //   removedBids,
  //   removedAsks,
  //   newBestBid: sanitizedBids[0]?.price ?? null,
  //   newBestAsk: sanitizedAsks[0]?.price ?? null,
  //   newSpread:
  //     sanitizedBids[0] && sanitizedAsks[0]
  //       ? sanitizedAsks[0].price - sanitizedBids[0].price
  //       : null,
  // });

  return {
    sanitizedBids,
    sanitizedAsks,
    removedBids,
    removedAsks,
  };
}
