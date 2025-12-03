import { AuthCredentials } from '../AuthCredentials';

describe('AuthCredentials', () => {
  const mockApiKey = 'abcd1234EFGH5678ijkl9012MNOP3456qrst7890UVWX1234yzab5678';
  const mockApiSecret =
    'ABCDEFGH12345678ijklmnopQRSTUVWX90123456abcdefghIJKLMNOP78901234qrstuvwxyzABCDEF56789012GHIJKLyzab';

  describe('constructor', () => {
    test('creates credentials with provided values', () => {
      const creds = new AuthCredentials(mockApiKey, mockApiSecret);

      expect(creds.apiKey).toBe(mockApiKey);
      expect(creds.apiSecret).toBe(mockApiSecret);
      expect(creds.createdAt).toBeInstanceOf(Date);
    });

    test('accepts custom createdAt date', () => {
      const customDate = new Date('2025-01-01');
      const creds = new AuthCredentials(mockApiKey, mockApiSecret, customDate);

      expect(creds.createdAt).toBe(customDate);
    });
  });

  describe('getMaskedApiKey', () => {
    test('masks middle portion of API key', () => {
      const creds = new AuthCredentials(mockApiKey, mockApiSecret);

      expect(creds.getMaskedApiKey()).toBe('abcd...5678');
    });

    test('returns *** for short keys', () => {
      const shortKey = '1234567';
      const creds = new AuthCredentials(shortKey, mockApiSecret);

      expect(creds.getMaskedApiKey()).toBe('***');
    });
  });

  describe('getMaskedApiSecret', () => {
    test('completely masks API secret', () => {
      const creds = new AuthCredentials(mockApiKey, mockApiSecret);

      expect(creds.getMaskedApiSecret()).toBe('••••••••••••••••');
      expect(creds.getMaskedApiSecret()).not.toContain(mockApiSecret);
    });
  });

  describe('isValidKeyFormat', () => {
    test('validates correct key length', () => {
      const creds = new AuthCredentials(mockApiKey, mockApiSecret);

      expect(creds.isValidKeyFormat()).toBe(true);
    });

    test('rejects too short keys', () => {
      const shortKey = '12345678901234567890'; // 20 chars
      const creds = new AuthCredentials(shortKey, mockApiSecret);

      expect(creds.isValidKeyFormat()).toBe(false);
    });

    test('rejects too long keys', () => {
      const longKey = 'a'.repeat(100);
      const creds = new AuthCredentials(longKey, mockApiSecret);

      expect(creds.isValidKeyFormat()).toBe(false);
    });
  });

  describe('isValidSecretFormat', () => {
    test('validates correct secret length', () => {
      const creds = new AuthCredentials(mockApiKey, mockApiSecret);

      expect(creds.isValidSecretFormat()).toBe(true);
    });

    test('rejects too short secrets', () => {
      const shortSecret = '12345678901234567890'; // 20 chars
      const creds = new AuthCredentials(mockApiKey, shortSecret);

      expect(creds.isValidSecretFormat()).toBe(false);
    });

    test('rejects too long secrets', () => {
      const longSecret = 'a'.repeat(150);
      const creds = new AuthCredentials(mockApiKey, longSecret);

      expect(creds.isValidSecretFormat()).toBe(false);
    });
  });

  describe('isValidFormat', () => {
    test('returns true when both key and secret are valid', () => {
      const creds = new AuthCredentials(mockApiKey, mockApiSecret);

      expect(creds.isValidFormat()).toBe(true);
    });

    test('returns false when key is invalid', () => {
      const creds = new AuthCredentials('short', mockApiSecret);

      expect(creds.isValidFormat()).toBe(false);
    });

    test('returns false when secret is invalid', () => {
      const creds = new AuthCredentials(mockApiKey, 'short');

      expect(creds.isValidFormat()).toBe(false);
    });
  });

  describe('isOlderThan', () => {
    test('returns false for fresh credentials', () => {
      const creds = new AuthCredentials(mockApiKey, mockApiSecret);

      expect(creds.isOlderThan(1)).toBe(false);
    });

    test('returns true for old credentials', () => {
      const oldDate = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      const creds = new AuthCredentials(mockApiKey, mockApiSecret, oldDate);

      expect(creds.isOlderThan(2)).toBe(true);
    });

    test('returns false when exactly at threshold', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const creds = new AuthCredentials(mockApiKey, mockApiSecret, date);

      expect(creds.isOlderThan(2)).toBe(false);
    });
  });

  describe('toApiCredentials', () => {
    test('returns object in ts-kraken format', () => {
      const creds = new AuthCredentials(mockApiKey, mockApiSecret);
      const apiCreds = creds.toApiCredentials();

      expect(apiCreds).toEqual({
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
      });
    });
  });

  describe('toJSON', () => {
    test('serializes credentials with timestamp', () => {
      const date = new Date('2025-12-03T12:00:00.000Z');
      const creds = new AuthCredentials(mockApiKey, mockApiSecret, date);
      const json = creds.toJSON();

      expect(json).toEqual({
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
        createdAt: '2025-12-03T12:00:00.000Z',
      });
    });
  });

  describe('fromJSON', () => {
    test('deserializes credentials from JSON', () => {
      const json = {
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
        createdAt: '2025-12-03T12:00:00.000Z',
      };
      const creds = AuthCredentials.fromJSON(json);

      expect(creds.apiKey).toBe(mockApiKey);
      expect(creds.apiSecret).toBe(mockApiSecret);
      expect(creds.createdAt).toEqual(new Date('2025-12-03T12:00:00.000Z'));
    });

    test('round-trip serialization', () => {
      const original = new AuthCredentials(mockApiKey, mockApiSecret);
      const json = original.toJSON();
      const restored = AuthCredentials.fromJSON(json);

      expect(restored.apiKey).toBe(original.apiKey);
      expect(restored.apiSecret).toBe(original.apiSecret);
      expect(restored.createdAt.getTime()).toBe(original.createdAt.getTime());
    });
  });
});
