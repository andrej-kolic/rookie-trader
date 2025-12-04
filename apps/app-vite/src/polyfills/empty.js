// Polyfill for dotenv module that ts-kraken imports but doesn't need in browser
// Using ES module exports for Vite compatibility

export function config() {
  return {
    parsed: {},
    error: undefined,
  };
}

// Default export for CommonJS-style imports
export default {
  config,
};
