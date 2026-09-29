# Features

What each part of the page shows and where its data comes from. For how the code is organized, see [Architecture](architecture.md).

| Area                | Shows                         | Kraken source                  | Sign-in |
| ------------------- | ----------------------------- | ------------------------------ | ------- |
| Market selector     | All tradeable pairs           | WebSocket `instrument`         | No      |
| Ticker              | Latest price and 24h stats    | WebSocket `ticker`             | No      |
| Order book          | Best bids and asks with depth | WebSocket `book`               | No      |
| Price chart         | Candlesticks and volume       | REST `OHLC`                    | No      |
| System status       | Kraken's trading engine state | WebSocket `status`             | No      |
| Footer: Balances    | Balance per asset             | Private WebSocket `balances`   | Yes     |
| Footer: Open orders | Your working orders           | Private WebSocket `executions` | Yes     |
| Footer: Trades      | Your recent fills             | Private WebSocket `executions` | Yes     |

Placing and cancelling orders is not built yet.

## Market selector

In the bar under the header, left of the ticker (above it on phones). Lists every pair Kraken reports as tradeable, with a leverage badge (for example `5x`) on pairs that allow margin.

- Tabs: **Favorites**, **All**, **Spot**, **Margin**. Favorites are saved in the browser.
- The selected pair is kept in the URL as `?pair=BTC/USD`, so links and Back work. With no pair in the URL, or an unknown one, the app opens BTC/USD.

| Key     | Action                   |
| ------- | ------------------------ |
| `/`     | Open the market selector |
| `↑` `↓` | Move through markets     |
| `Enter` | Select market            |
| `Esc`   | Close popup              |

The keyboard icon in the header lists these shortcuts.

## Ticker

Right of the market selector: last price, 24h change, best bid and ask with their quantities, 24h high, low and volume. While a new pair loads, the previous pair's values stay visible.

## Order book

Left panel. Asks on top, the spread (absolute and percent) in the middle, bids below. Each row shows price, amount and cumulative total; a bar behind the row shows cumulative depth. The app subscribes to 25 levels per side and shows as many as fit the panel.

## Price chart

Right panel. Candlesticks with a volume histogram underneath, from Kraken's REST OHLC endpoint.

- Intervals: 1m, 5m, 15m, 1h, 4h, 1d, 1w.
- Refreshes every quarter of the candle length, between 10 seconds and 5 minutes. Refreshes fetch only new candles.
- Opens on the most recent 100 candles; scroll or zoom for older ones.

## System status

A dot in the header, coloured by Kraken's current status. Click it for a legend:

| Status        | Meaning                                                     |
| ------------- | ----------------------------------------------------------- |
| `online`      | Trading works normally.                                     |
| `post_only`   | Only limit orders that wait in the order book are accepted. |
| `limit_only`  | Only limit orders are accepted.                             |
| `cancel_only` | Existing orders can be cancelled; no new orders.            |
| `maintenance` | Kraken is down for maintenance; no trading.                 |
| `offline`     | Your device is offline; data is not updating.               |

## Sign-in and account footer

The header's login button opens a dialog asking for a Kraken API key and secret. See [Architecture: Sign-in](architecture.md#sign-in) for where the key goes.

Once signed in, the footer at the bottom of the page has three tabs:

| Tab         | Columns                                                |
| ----------- | ------------------------------------------------------ |
| Balances    | Asset, Balance                                         |
| Open orders | Time, Market, Side, Type, Price, Amount, Filled        |
| Trades      | Time, Market, Side, Price, Amount, Cost, Fee (last 50) |

All three update live. Signed out, the footer shows a sign-in prompt.
