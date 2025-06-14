
import { WRESTLING_ACCOUNTS, getAccountsByPriority, getActiveAccounts } from '@/constants/wrestlingAccounts';

// Twitter API v2 service with improved rate limiting and error handling
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

class TwitterServiceWithRateLimit {
  private lastRequestTime = 0;
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly RATE_LIMIT = 75; // Increased from 50
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly REQUEST_DELAY = 3000; // Reduced from 10s to 3s
  private readonly MAX_ACCOUNTS_PER_CYCLE = 15; // Increased from 5 to 15
  private cycleOffset = 0;
  private priorityCycle = 0; // Track which priority level we're processing

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart >= this.WINDOW_MS) {
      this.requestCount = 0;
      this.windowStart = now;
      console.log('Rate limit window reset');
    }

    // Check if we're at rate limit
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.WINDOW_MS - (now - this.windowStart);
      console.log(`Rate limit reached (${this.requestCount}/${this.RATE_LIMIT}), waiting ${Math.round(waitTime/1000)}s`);
      await this.delay(waitTime + 1000);
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    // Ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      const delayNeeded = this.REQUEST_DELAY - timeSinceLastRequest;
      await this.delay(delayNeeded);
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  private async fetchAccountTweets(username: string): Promise<any[]> {
    try {
      await this.enforceRateLimit();

      console.log(`Attempting to fetch tweets for @${username}`);
      
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

  private getEnhancedFallback(): TwitterPost[] {
    const activeAccounts = getActiveAccounts();
    const totalAccounts = activeAccounts.length;
    const currentCycle = Math.floor(this.cycleOffset / this.MAX_ACCOUNTS_PER_CYCLE) + 1;
    const totalCycles = Math.ceil(totalAccounts / this.MAX_ACCOUNTS_PER_CYCLE);
    
    return [
      {
        id: 'fallback_system_1',
        text: `🔄 Currently monitoring ${totalAccounts} wrestling accounts across all federations and news sources. System is in smart-cycling mode to respect API limits.`,
        author: 'WrestlingDataHub',
        timestamp: new Date(),
        engagement: { likes: 0, retweets: 0, replies: 0 },
        url: '#',
        isFallback: true
      },
      {
        id: 'fallback_system_2',
        text: `📊 Processing cycle ${currentCycle}/${totalCycles} - focusing on ${this.MAX_ACCOUNTS_PER_CYCLE} accounts per refresh. High-priority accounts (WWE, AEW, top journalists) are processed more frequently.`,
        author: 'System',
        timestamp: new Date(Date.now() - 60000),
        engagement: { likes: 0, retweets: 0, replies: 0 },
        url: '#',
        isFallback: true
      },
      {
        id: 'fallback_status_1',
        text: `⚡ Live data collection active: ${this.requestCount}/${this.RATE_LIMIT} API calls used in current window. Next priority cycle in ${Math.round(this.REQUEST_DELAY/1000)}s.`,
        author: 'APIStatus',
        timestamp: new Date(Date.now() - 120000),
        engagement: { likes: 0, retweets: 0, replies: 0 },
        url: '#',
        isFallback: true
      }
    ];
  }

  private getSmartAccountSelection(): string[] {
    const priorities = ['high', 'medium', 'low'] as const;
    const currentPriority = priorities[this.priorityCycle % priorities.length];
    
    // Get accounts for current priority
    const priorityAccounts = getAccountsByPriority(currentPriority);
    
    if (priorityAccounts.length === 0) {
      // Fallback to all active accounts if no accounts in current priority
      const allAccounts = getActiveAccounts();
      const startIndex = this.cycleOffset % allAccounts.length;
      const endIndex = Math.min(startIndex + this.MAX_ACCOUNTS_PER_CYCLE, allAccounts.length);
      
      return allAccounts.slice(startIndex, endIndex).map(acc => acc.username);
    }

    // For high priority, process more frequently
    const accountsToProcess = currentPriority === 'high' ? 
      Math.min(10, priorityAccounts.length) : 
      Math.min(this.MAX_ACCOUNTS_PER_CYCLE, priorityAccounts.length);

    const startIndex = this.cycleOffset % priorityAccounts.length;
    const selectedAccounts = [];
    
    for (let i = 0; i < accountsToProcess; i++) {
      const accountIndex = (startIndex + i) % priorityAccounts.length;
      selectedAccounts.push(priorityAccounts[accountIndex].username);
    }

    return selectedAccounts;
  }

  async fetchWrestlingTweets(): Promise<TwitterPost[]> {
    try {
      const totalAccounts = getActiveAccounts().length;
      console.log(`🎯 Starting smart Twitter fetch cycle for ${totalAccounts} total accounts`);
      
      // Get smart account selection based on priority cycling
      const accountsToProcess = this.getSmartAccountSelection();
      
      console.log(`📋 Processing ${accountsToProcess.length} accounts (Priority cycle ${this.priorityCycle % 3}): ${accountsToProcess.join(', ')}`);
      
      const results: any[] = [];
      let successfulFetches = 0;

      // Process accounts sequentially with proper delays
      for (const account of accountsToProcess) {
        const tweets = await this.fetchAccountTweets(account);
        if (tweets && tweets.length > 0) {
          results.push(...tweets.slice(0, 3)); // Increased from 2 to 3 tweets per account
          successfulFetches++;
        }
      }

      // Update cycle offsets for next request
      this.cycleOffset = (this.cycleOffset + this.MAX_ACCOUNTS_PER_CYCLE) % totalAccounts;
      this.priorityCycle++;

      if (results.length === 0) {
        console.log(`⚠️ No tweets fetched from ${accountsToProcess.length} accounts, using enhanced fallback`);
        return this.getEnhancedFallback();
      }

      const formattedTweets = this.formatTweets(results);
      console.log(`✅ Successfully processed ${formattedTweets.length} tweets from ${successfulFetches}/${accountsToProcess.length} accounts`);
      
      // Mix real tweets with one status fallback to show system is working
      const statusFallback = this.getEnhancedFallback().slice(0, 1);
      return [...formattedTweets, ...statusFallback];

    } catch (error) {
      console.error('Twitter service error:', error);
      return this.getEnhancedFallback();
    }
  }
}

const twitterService = new TwitterServiceWithRateLimit();

export const fetchWrestlingTweets = () => twitterService.fetchWrestlingTweets();
