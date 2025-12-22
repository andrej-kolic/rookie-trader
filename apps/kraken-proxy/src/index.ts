import express, { type Express } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { privateRestRequest, getWsAuthToken } from 'ts-kraken';
import { config } from './config.js';

const app: Express = express();

app.use(cors());
app.use(express.json());

//
// Crypto Helpers
//
const ALGORITHM = 'aes-256-gcm';
// Ensure secret is 32 bytes. If longer, slice it. If shorter, pad it (for dev).
// Real app should ensure strong 32-byte key via env.
const SECRET_KEY = Buffer.from(config.appSecret.padEnd(32).slice(0, 32));
const IV_LENGTH = 16; // AES block size

type EncryptedData = {
  iv: string;
  data: string;
  authTag: string;
};

function encrypt(text: string): EncryptedData {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    data: encrypted,
    authTag: authTag.toString('hex'),
  };
}

function decrypt(encrypted: EncryptedData): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    Buffer.from(encrypted.iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
  let decrypted = decipher.update(encrypted.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

//
// Middleware & Auth
//

/**
 * Extracts credentials from Bearer token or falls back to env vars.
 */
const getCredentials = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const tokenStr = authHeader.split(' ')[1];
    if (!tokenStr) {
      throw new Error('Invalid authentication token format');
    }
    try {
      // Token format: iv:data:authTag (base64 encoded commonly, or just joined string)
      // Here we expect a simple JSON stringified > base64 for simplicity
      const jsonStr = Buffer.from(tokenStr, 'base64').toString('utf8');
      const payload = JSON.parse(jsonStr) as {
        key: EncryptedData;
        secret: EncryptedData;
      };

      return {
        apiKey: decrypt(payload.key),
        apiSecret: decrypt(payload.secret),
      };
    } catch (e) {
      console.error('Invalid token:', e);
      throw new Error('Invalid authentication token');
    }
  }

  // Fallback to Env
  // if (config.kraken.apiKey && config.kraken.apiSecret) {
  //   return {
  //     apiKey: config.kraken.apiKey,
  //     apiSecret: config.kraken.apiSecret,
  //   };
  // }

  throw new Error('No credentials provided');
};

// Helper to handle async errors
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

app.get('/', (req: Request, res: Response) => {
  res.send('Kraken Proxy is running');
});

/**
 * Login Endpoint
 * Encrypts provided API Key & Secret into a stateless token.
 */
app.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { apiKey, apiSecret } = req.body;
    if (typeof apiKey !== 'string' || typeof apiSecret !== 'string') {
      res.status(400).json({ error: 'Missing or invalid apiKey/apiSecret' });
      return;
    }

    // Encrypt
    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);
    await Promise.resolve(); // Satisfy async linter

    // Create token payload
    const payload = {
      key: encryptedKey,
      secret: encryptedSecret,
    };

    // Encode as Base64 (simple token format)
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    res.json({ token });
  }),
);

/**
 * Get WebSocket Token
 * Frontend uses this to connect directly to wss://ws-auth.kraken.com/
 */
app.get(
  '/ws-token',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const credentials = getCredentials(req);

      // Validate credentials are not empty or error messages
      if (
        !credentials.apiKey ||
        !credentials.apiSecret ||
        credentials.apiKey.length < 10 ||
        credentials.apiSecret.length < 10
      ) {
        console.error('Invalid credentials format:', {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          keyLength: credentials.apiKey?.length,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          secretLength: credentials.apiSecret?.length,
        });
        res.status(400).json({
          error: 'Invalid credentials format. Please login again.',
        });
        return;
      }

      console.log('Fetching WS token with valid credentials');
      const token = await getWsAuthToken(credentials);

      console.log('Credentials used:', credentials);
      console.log('Obtained ws token:', token);
      console.log('Config.appSecret:', config.appSecret);

      res.json({ result: { token } });
    } catch (error: unknown) {
      console.error('Error fetching WS token:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Check if it's an authentication error
      if (
        errorMessage.includes('No credentials provided') ||
        errorMessage.includes('Invalid authentication token')
      ) {
        res.status(401).json({
          error: 'Authentication required. Please login first.',
        });
        return;
      }

      res.status(401).json({
        error: errorMessage || 'Failed to fetch token',
      });
    }
  }),
);

// Add other private endpoints as needed here
// Example: Balance
app.get(
  '/balance',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const credentials = getCredentials(req);
      const response = await privateRestRequest(
        { url: 'Balance' },
        credentials,
      );
      res.json(response);
    } catch (error: unknown) {
      console.error('Error fetching balance:', error);
      res.status(500).json({
        error:
          (error instanceof Error ? error.message : null) ??
          'Failed to fetch balance',
      });
    }
  }),
);

// Export app for Lambda handler
export { app };

// TODO: move to separate file
// Only start server if not running in Lambda
if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
  app.listen(config.port, () => {
    console.log(`Kraken Proxy listening at http://localhost:${config.port}`);
  });
}
