
import { getActiveAccounts } from '@/constants/wrestlingAccounts';
import { DEFAULT_CONFIG } from './twitter/TwitterServiceConfig';
import { TwitterRateLimit } from './twitter/TwitterRateLimit';
import { TwitterAccountSelector } from './twitter/TwitterAccountSelector';
import { TwitterDataFormatter, TwitterPost } from './twitter/TwitterDataFormatter';
import { TwitterApiClient } from './twitter/TwitterApiClient';

// Re-export the TwitterPost interface for backward compatibility
export type { TwitterPost };

class TwitterServiceWithRateLimit {
  private rateLimit: TwitterRateLimit;
  private accountSelector: TwitterAccountSelector;
  private apiClient: TwitterApiClient;

  constructor() {
    this.rateLimit = new TwitterRateLimit(DEFAULT_CONFIG);
    this.accountSelector = new TwitterAccountSelector(DEFAULT_CONFIG);
    this.apiClient = new TwitterApiClient(this.rateLimit);
  }

  async fetchWrestlingTweets(): Promise<TwitterPost[]> {
    try {
      const totalAccounts = getActiveAccounts().length;
      console.log(`🎯 Starting smart Twitter fetch cycle for ${totalAccounts} total accounts`);
      
      // Get smart account selection based on priority cycling
      const accountsToProcess = this.accountSelector.getSmartAccountSelection();
      const { priorityCycle } = this.accountSelector.getCurrentCycleInfo();
      
      console.log(`📋 Processing ${accountsToProcess.length} accounts (Priority cycle ${priorityCycle % 3}): ${accountsToProcess.join(', ')}`);
      
      const results: any[] = [];
      let successfulFetches = 0;

      // Process accounts sequentially with proper delays
      for (const account of accountsToProcess) {
        const tweets = await this.apiClient.fetchAccountTweets(account);
        if (tweets && tweets.length > 0) {
          results.push(...tweets.slice(0, 3)); // Take up to 3 tweets per account
          successfulFetches++;
        }
      }

      // Update cycle offsets for next request
      this.accountSelector.updateCycleOffsets();

      // Create formatter with current state
      const formatter = new TwitterDataFormatter(
        DEFAULT_CONFIG,
        this.accountSelector.getCurrentCycleInfo().cycleOffset,
        this.rateLimit.getRequestCount()
      );

      if (results.length === 0) {
        console.log(`⚠️ No tweets fetched from ${accountsToProcess.length} accounts, using enhanced fallback`);
        return formatter.getEnhancedFallback();
      }

      const formattedTweets = formatter.formatTweets(results);
      console.log(`✅ Successfully processed ${formattedTweets.length} tweets from ${successfulFetches}/${accountsToProcess.length} accounts`);
      
      // Mix real tweets with one status fallback to show system is working
      const statusFallback = formatter.getEnhancedFallback().slice(0, 1);
      return [...formattedTweets, ...statusFallback];

    } catch (error) {
      console.error('Twitter service error:', error);
      const formatter = new TwitterDataFormatter(
        DEFAULT_CONFIG,
        this.accountSelector.getCurrentCycleInfo().cycleOffset,
        this.rateLimit.getRequestCount()
      );
      return formatter.getEnhancedFallback();
    }
  }
}

const twitterService = new TwitterServiceWithRateLimit();

export const fetchWrestlingTweets = () => twitterService.fetchWrestlingTweets();
