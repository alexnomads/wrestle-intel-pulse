
export interface TwitterServiceConfig {
  readonly RATE_LIMIT: number;
  readonly WINDOW_MS: number;
  readonly REQUEST_DELAY: number;
  readonly MAX_ACCOUNTS_PER_CYCLE: number;
}

export const DEFAULT_CONFIG: TwitterServiceConfig = {
  RATE_LIMIT: 75,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  REQUEST_DELAY: 3000, // 3 seconds
  MAX_ACCOUNTS_PER_CYCLE: 15
};

export const TWITTER_API_ENDPOINT = 'https://wavxulotmntdtixcpzik.supabase.co/functions/v1/twitter-wrestling-data';
