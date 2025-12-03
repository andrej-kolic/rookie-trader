import { privateRestRequest, type PrivateRestTypes } from 'ts-kraken';
import { useAuthStore } from '../state/auth-store';

/**
 * Get authenticated credentials from store
 * Throws error if not authenticated
 */
function getAuthenticatedCredentials() {
  const credentials = useAuthStore.getState().credentials;

  if (!credentials) {
    throw new Error('Not authenticated. Please provide API credentials.');
  }

  return credentials.toApiCredentials();
}

/**
 * Validate credentials by attempting to fetch account balance
 * This is a lightweight call to verify API key/secret are valid
 *
 * @param apiKey - Kraken API key
 * @param apiSecret - Kraken API secret
 * @returns Promise that resolves if credentials are valid
 * @throws Error if credentials are invalid or API call fails
 */
export async function validateCredentials(
  apiKey: string,
  apiSecret: string,
): Promise<void> {
  try {
    await privateRestRequest({ url: 'Balance' }, { apiKey, apiSecret });
    // If we get here, credentials are valid
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with more specific message
      if (error.message.includes('Invalid key')) {
        throw new Error('Invalid API key or secret');
      }
      if (error.message.includes('Permission denied')) {
        throw new Error('API key does not have required permissions');
      }
      throw error;
    }
    throw new Error('Failed to validate credentials');
  }
}

/**
 * Fetch account balance
 * Requires authenticated credentials in store
 */
export async function fetchBalance(): Promise<
  PrivateRestTypes.PrivateRestResult<'Balance'>
> {
  const credentials = getAuthenticatedCredentials();

  return privateRestRequest({ url: 'Balance' }, credentials);
}

/**
 * Fetch extended balance information
 * Requires authenticated credentials in store
 */
export async function fetchBalanceEx(): Promise<
  PrivateRestTypes.PrivateRestResult<'BalanceEx'>
> {
  const credentials = getAuthenticatedCredentials();

  return privateRestRequest({ url: 'BalanceEx' }, credentials);
}

/**
 * Fetch open orders
 * Requires authenticated credentials in store
 */
/**
 * Fetch open orders
 * Requires authenticated credentials in store
 *
 * Note: ts-kraken's complex conditional types cause unavoidable type errors here.
 * The types are correct at runtime - we're properly constructing the request object.
 */
export async function fetchOpenOrders(
  data?: PrivateRestTypes.PrivateRestRequest<'OpenOrders'>['data'],
): Promise<PrivateRestTypes.PrivateRestResult<'OpenOrders'>> {
  const credentials = getAuthenticatedCredentials();

  return privateRestRequest(
    data ? { url: 'OpenOrders', data } : { url: 'OpenOrders' },
    credentials,
  );
}

/**
 * Fetch closed orders
 * Requires authenticated credentials in store
 */
export async function fetchClosedOrders(
  data?: PrivateRestTypes.PrivateRestRequest<'ClosedOrders'>['data'],
): Promise<PrivateRestTypes.PrivateRestResult<'ClosedOrders'>> {
  const credentials = getAuthenticatedCredentials();

  return privateRestRequest(
    data ? { url: 'ClosedOrders', data } : { url: 'ClosedOrders' },
    credentials,
  );
}

/**
 * Fetch trades history
 * Requires authenticated credentials in store
 */
export async function fetchTradesHistory(
  data?: PrivateRestTypes.PrivateRestRequest<'TradesHistory'>['data'],
): Promise<PrivateRestTypes.PrivateRestResult<'TradesHistory'>> {
  const credentials = getAuthenticatedCredentials();

  return privateRestRequest(
    data ? { url: 'TradesHistory', data } : { url: 'TradesHistory' },
    credentials,
  );
}

/**
 * Place a market or limit order
 * Requires authenticated credentials in store
 */
export async function placeOrder(
  data: PrivateRestTypes.PrivateRestRequest<'AddOrder'>['data'],
): Promise<PrivateRestTypes.PrivateRestResult<'AddOrder'>> {
  const credentials = getAuthenticatedCredentials();

  return privateRestRequest({ url: 'AddOrder', data }, credentials);
}

/**
 * Cancel an open order
 * Requires authenticated credentials in store
 */
export async function cancelOrder(
  data: PrivateRestTypes.PrivateRestRequest<'CancelOrder'>['data'],
): Promise<PrivateRestTypes.PrivateRestResult<'CancelOrder'>> {
  const credentials = getAuthenticatedCredentials();

  return privateRestRequest({ url: 'CancelOrder', data }, credentials);
}

/**
 * Cancel all open orders
 * Requires authenticated credentials in store
 */
export async function cancelAllOrders(): Promise<
  PrivateRestTypes.PrivateRestResult<'CancelAll'>
> {
  const credentials = getAuthenticatedCredentials();

  return privateRestRequest({ url: 'CancelAll' }, credentials);
}
