
import { getActiveAccounts } from '@/constants/wrestlingAccounts';
import { TwitterServiceConfig } from './TwitterServiceConfig';

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

export class TwitterDataFormatter {
  constructor(
    private config: TwitterServiceConfig,
    private cycleOffset: number,
    private requestCount: number
  ) {}

  formatTweets(tweets: any[]): TwitterPost[] {
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

  getEnhancedFallback(): TwitterPost[] {
    const activeAccounts = getActiveAccounts();
    const totalAccounts = activeAccounts.length;
    const currentCycle = Math.floor(this.cycleOffset / this.config.MAX_ACCOUNTS_PER_CYCLE) + 1;
    const totalCycles = Math.ceil(totalAccounts / this.config.MAX_ACCOUNTS_PER_CYCLE);
    
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
        text: `📊 Processing cycle ${currentCycle}/${totalCycles} - focusing on ${this.config.MAX_ACCOUNTS_PER_CYCLE} accounts per refresh. High-priority accounts (WWE, AEW, top journalists) are processed more frequently.`,
        author: 'System',
        timestamp: new Date(Date.now() - 60000),
        engagement: { likes: 0, retweets: 0, replies: 0 },
        url: '#',
        isFallback: true
      },
      {
        id: 'fallback_status_1',
        text: `⚡ Live data collection active: ${this.requestCount}/${this.config.RATE_LIMIT} API calls used in current window. Next priority cycle in ${Math.round(this.config.REQUEST_DELAY/1000)}s.`,
        author: 'APIStatus',
        timestamp: new Date(Date.now() - 120000),
        engagement: { likes: 0, retweets: 0, replies: 0 },
        url: '#',
        isFallback: true
      }
    ];
  }
}
