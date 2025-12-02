// Polyfill for dotenv module that ts-kraken imports but doesn't need in browser
// Must use CommonJS exports to match what ts-kraken expects

// eslint-disable-next-line no-undef
module.exports = {
  config: () => ({
    parsed: {},
    error: undefined,
  }),
};
