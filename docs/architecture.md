# Architecture

How the app is put together and why. For what each part of the page does, see [Features](features.md).

## Packages

The app lives in `packages/app-core`, a React library. Three thin apps (`apps/app-vite`, `apps/app-webpack`, `apps/app-esbuild`) bundle the same library with different tools. Presentational components live in `packages/ui` (`@repo/ui`) and are developed in Storybook (`apps/ui-storybook`); they take formatted strings as props and know nothing about Kraken.

## Layers in app-core

Data flows from Kraken inward, then out to the UI. Each layer only imports the ones listed above it. Paths are relative to `packages/app-core/src/`.

| Layer      | Folder        | Job                                                                                                                                                           |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API        | `api/`        | Talks to Kraken (`kraken-ws-api.ts`, `kraken-rest-api.ts`) and the sign-in proxy (`auth-api.ts`). Returns Kraken's own types from `ts-kraken`.                |
| Domain     | `domain/`     | Classes with business methods, no framework code: `TradingPair`, `Ticker`, `OrderBook`, `Candle`, `SystemStatus`, `AuthSession`, `Balance`, `Order`, `Trade`. |
| Mappers    | `mappers/`    | Turn Kraken responses into domain objects; merge incremental updates.                                                                                         |
| State      | `state/`      | Zustand stores: the selected pair, the auth session. Setters only.                                                                                            |
| Services   | `services/`   | Business logic that isn't tied to React: `auth-service.ts` (login, logout, session storage).                                                                  |
| Hooks      | `hooks/`      | Open and close subscriptions for React components; return domain objects plus `loading` and `error`.                                                          |
| Containers | `containers/` | Map domain objects to `@repo/ui` props.                                                                                                                       |

## Live data

Live data comes over Kraken's WebSocket v2 API through `ts-kraken`, as RxJS observables. The price chart is the exception: it polls Kraken's REST OHLC endpoint.

- **Reconnects**: every subscription is wrapped by `withRetryAndShare` in `api/kraken-ws-api.ts`. It resubscribes 3 seconds after the socket fails or closes, and shares one socket subscription between components that ask for the same data.
- **Snapshot, then updates**: the order book, instruments and executions channels first send a full snapshot, then changes. Mappers apply changes to the last known state; for the order book, a quantity of 0 removes a price level.
- **Pair switch**: hooks drop the old pair's data when the selected pair changes, so the page never shows one pair's book under another's name.

## Performance limits

The order book can send many updates per second. Every update is merged into a ref, but React state changes at most twice per second (`THROTTLE_MS` in `hooks/use-order-book.ts`). The price chart keeps at most 1,000 candles (`MAX_CANDLES` in `mappers/candle-mapper.ts`).

## Sign-in

Kraken's private REST API sends no CORS headers, so a browser page cannot call it directly. Sign-in therefore goes through **kraken-proxy**, a small backend kept outside this repo. Its URL is set by `APP_REACT_KRAKEN_PROXY_URL` in `packages/app-core/.env.*`.

1. The login dialog sends the API key and secret to the proxy's `POST /login`.
2. The proxy encrypts them into a token and returns it. It stores nothing, so the token is the session.
3. The app keeps the token in `localStorage` (`kraken_auth_session`) as an `AuthSession`.
4. Before each private WebSocket connect or reconnect, the app calls the proxy's `GET /ws-token` with the token as a Bearer header. The proxy asks Kraken for a WebSocket token and returns it. Kraken accepts a WebSocket token only within 15 minutes of issue, so a fresh one is fetched every time.
5. Private channels (`balances`, `executions`) then connect straight to Kraken's WebSocket with that token; WebSocket connections are not subject to CORS.

Logout clears the stored token and cancels private subscriptions; there is no server-side session to end.

## Styling

Tailwind v4, with theme colours defined as CSS tokens and component variants written with `tailwind-variants`.
