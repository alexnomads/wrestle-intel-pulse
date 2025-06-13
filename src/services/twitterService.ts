
// Twitter API v2 service with proper rate limiting and error handling
export interface TwitterPost {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
  url: string;
  isFallback?: boolean;
}

// High-volume wrestling accounts to monitor
const WRESTLING_ACCOUNTS = [
  'WWE',
  'AEW', 
  'SeanRossSapp',
  'WrestleVotes',
  'davemeltzerWON',
  'ryansatin',
  'MikeJohnson_pwtorch'
];

class TwitterServiceWithRateLimit {
  private lastRequestTime = 0;
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly RATE_LIMIT = 250; // Stay under 300 limit
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly REQUEST_DELAY = 2000; // 2 seconds between requests

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart >= this.WINDOW_MS) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    // Check if we're at rate limit
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.WINDOW_MS - (now - this.windowStart);
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await this.delay(waitTime);
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    // Ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await this.delay(this.REQUEST_DELAY - timeSinceLastRequest);
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  private async fetchAccountTweets(username: string): Promise<any[]> {
    try {
      await this.enforceRateLimit();

      const response = await fetch('https://wavxulotmntdtixcpzik.supabase.co/functions/v1/twitter-wrestling-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accounts: [username],
          rateLimited: true 
        })
      });

      if (response.status === 429) {
        console.log(`Rate limited for ${username}, skipping...`);
        return [];
      }

      if (!response.ok) {
        console.warn(`Failed to fetch tweets for ${username}: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.tweets || [];
    } catch (error) {
      console.error(`Error fetching tweets for ${username}:`, error);
      return [];
    }
  }

  private formatTweets(tweets: any[]): TwitterPost[] {
    return tweets.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author?.username || 'Unknown',
      timestamp: new Date(tweet.created_at),
      engagement: {
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0
      },
      url: `https://twitter.com/${tweet.author?.username}/status/${tweet.id}`
    }));
  }

  private getMinimalFallback(): TwitterPost[] {
    return [
      {
        id: 'fallback_twitter_1',
        text: 'Wrestling news updates available - Twitter API temporarily unavailable',
        author: 'System',
        timestamp: new Date(),
        engagement: { likes: 0, retweets: 0, replies: 0 },
        url: '#',
        isFallback: true
      }
    ];
  }

  async fetchWrestlingTweets(): Promise<TwitterPost[]> {
    try {
      console.log('Fetching wrestling tweets with rate limiting...');
      const results: any[] = [];

      // Process accounts sequentially to avoid rate limits
      for (const account of WRESTLING_ACCOUNTS) {
        const tweets = await this.fetchAccountTweets(account);
        if (tweets && tweets.length > 0) {
          results.push(...tweets.slice(0, 5)); // Limit to 5 tweets per account
        }
      }

      if (results.length === 0) {
        console.log('No tweets fetched, using minimal fallback');
        return this.getMinimalFallback();
      }

      const formattedTweets = this.formatTweets(results);
      console.log(`Successfully fetched ${formattedTweets.length} tweets`);
      return formattedTweets;

    } catch (error) {
      console.error('Twitter service error:', error);
      return this.getMinimalFallback();
    }
  }
}

const twitterService = new TwitterServiceWithRateLimit();

export const fetchWrestlingTweets = () => twitterService.fetchWrestlingTweets();
