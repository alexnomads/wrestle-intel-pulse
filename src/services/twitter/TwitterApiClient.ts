
import { TWITTER_API_ENDPOINT } from './TwitterServiceConfig';
import { TwitterRateLimit } from './TwitterRateLimit';

export class TwitterApiClient {
  constructor(private rateLimit: TwitterRateLimit) {}

  async fetchAccountTweets(username: string): Promise<any[]> {
    try {
      await this.rateLimit.enforceRateLimit();

      console.log(`Attempting to fetch tweets for @${username}`);
      
      const response = await fetch(TWITTER_API_ENDPOINT, {
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
        console.log(`Rate limited for ${username}, skipping for this cycle`);
        return [];
      }

      if (!response.ok) {
        console.warn(`Failed to fetch tweets for ${username}: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const tweets = data.tweets || [];
      
      if (tweets.length > 0) {
        console.log(`✅ Successfully fetched ${tweets.length} tweets from @${username}`);
      }
      
      return tweets;
    } catch (error) {
      console.error(`Error fetching tweets for ${username}:`, error);
      return [];
    }
  }
}
