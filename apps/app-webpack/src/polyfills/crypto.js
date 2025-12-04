/**
 * Crypto polyfill for ts-kraken in browser environment
 * ts-kraken imports 'crypto' for private API message signing
 * Since we only use public API in browser, we provide empty stubs
 */

// Export empty stubs for crypto methods that ts-kraken might use
export default {};

export const createHmac = () => {
  throw new Error('Private API (crypto) is not supported in browser');
};
