
import { TwitterServiceConfig } from './TwitterServiceConfig';

export class TwitterRateLimit {
  private lastRequestTime = 0;
  private requestCount = 0;
  private windowStart = Date.now();

  constructor(private config: TwitterServiceConfig) {}

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart >= this.config.WINDOW_MS) {
      this.requestCount = 0;
      this.windowStart = now;
      console.log('Rate limit window reset');
    }

    // Check if we're at rate limit
    if (this.requestCount >= this.config.RATE_LIMIT) {
      const waitTime = this.config.WINDOW_MS - (now - this.windowStart);
      console.log(`Rate limit reached (${this.requestCount}/${this.config.RATE_LIMIT}), waiting ${Math.round(waitTime/1000)}s`);
      await this.delay(waitTime + 1000);
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    // Ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.REQUEST_DELAY) {
      const delayNeeded = this.config.REQUEST_DELAY - timeSinceLastRequest;
      await this.delay(delayNeeded);
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  getRateLimit(): number {
    return this.config.RATE_LIMIT;
  }
}
