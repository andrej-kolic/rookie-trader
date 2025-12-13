import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  kraken: {
    apiKey: process.env.KRAKEN_API_KEY || '',
    apiSecret: process.env.KRAKEN_API_SECRET || '',
  },
};

if (!config.kraken.apiKey || !config.kraken.apiSecret) {
  console.warn(
    'WARNING: KRAKEN_API_KEY or KRAKEN_API_SECRET is missing via .env',
  );
}
