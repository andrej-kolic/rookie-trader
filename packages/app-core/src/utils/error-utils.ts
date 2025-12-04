/**
 * Extracts meaningful error message from various error types
 * Handles CloseEvent, Error objects, and unknown types
 */
export function extractErrorMessage(err: unknown): string {
  // Handle CloseEvent from WebSocket
  if (err && typeof err === 'object' && 'type' in err && err.type === 'close') {
    const closeEvent = err as CloseEvent;
    const code = closeEvent.code;
    const reason = closeEvent.reason || 'No reason provided';
    const wasClean = closeEvent.wasClean;

    return `WebSocket connection closed ${wasClean ? 'cleanly' : 'unexpectedly'} (code: ${code}${reason ? `, reason: ${reason}` : ''})`;
  }

  // Handle standard Error objects
  if (err instanceof Error) {
    return err.message;
  }

  // Handle string errors
  if (typeof err === 'string') {
    return err;
  }

  // Fallback for unknown error types
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error occurred';
  }
}

/**
 * Converts unknown error to Error instance with meaningful message
 */
export function toError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  return new Error(extractErrorMessage(err));
}
