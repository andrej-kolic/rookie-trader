import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import { privateRestRequest, getWsAuthToken } from 'ts-kraken';
import { config } from './config.js';

const app = express();

app.use(cors());
app.use(express.json());

const credentials = {
  apiKey: config.kraken.apiKey,
  apiSecret: config.kraken.apiSecret,
};

// Helper to handle async errors
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

app.get('/', (req: Request, res: Response) => {
  res.send('Kraken Proxy is running');
});

/**
 * Get WebSocket Token
 * Frontend uses this to connect directly to wss://ws-auth.kraken.com/
 */
app.get(
  '/ws-token',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const token = await getWsAuthToken(credentials);
      res.json({ result: { token } });
    } catch (error: any) {
      console.error('Error fetching WS token:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch token' });
    }
  }),
);

// Add other private endpoints as needed here
// Example: Balance
app.get(
  '/balance',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const response = await privateRestRequest(
        { url: 'Balance' },
        credentials,
      );
      res.json(response);
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      res
        .status(500)
        .json({ error: error.message || 'Failed to fetch balance' });
    }
  }),
);

app.listen(config.port, () => {
  console.log(`Kraken Proxy listening at http://localhost:${config.port}`);
});
