/**
 * WebSocket polyfill for ts-kraken in browser environment
 * ts-kraken imports 'ws' (Node.js WebSocket library), but in browser
 * we use the native WebSocket API instead
 */

// Export the native browser WebSocket as default
export default globalThis.WebSocket || window.WebSocket;

// Also export as named export for different import patterns
export const WebSocket = globalThis.WebSocket || window.WebSocket;
