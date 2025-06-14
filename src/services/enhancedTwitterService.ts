
import { TwitterPost } from './twitterService';

export interface EnhancedTwitterMetrics {
  totalEngagement: number;
  avgEngagementPerTweet: number;
  topPerformingAccount: string;
  trendingHashtags: string[];
  peakEngagementTime: string;
  accountTypeBreakdown: { [key: string]: number };
}

export interface TwitterAccountStats {
  username: string;
  totalTweets: number;
  totalEngagement: number;
  avgEngagement: number;
  type: string;
  verified: boolean;
}

class EnhancedTwitterAnalytics {
  private tweets: TwitterPost[] = [];
  private lastAnalysis: Date | null = null;

  updateTweets(tweets: TwitterPost[]) {
    this.tweets = tweets;
    this.lastAnalysis = new Date();
  }

  calculateEngagementVelocity(tweet: TwitterPost): number {
    const hoursSincePosted = (Date.now() - tweet.timestamp.getTime()) / (1000 * 60 * 60);
    const totalEngagement = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
    
    if (hoursSincePosted < 1) return totalEngagement * 24; // Extrapolate hourly rate
    return totalEngagement / hoursSincePosted;
  }

  detectTrendingHashtags(): string[] {
    const hashtagMap = new Map<string, number>();
    
    this.tweets.forEach(tweet => {
      const hashtags = tweet.text.match(/#\w+/g) || [];
      hashtags.forEach(tag => {
        const normalizedTag = tag.toLowerCase();
        hashtagMap.set(normalizedTag, (hashtagMap.get(normalizedTag) || 0) + 1);
      });
    });

    return Array.from(hashtagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  getAccountTypeBreakdown(): { [key: string]: number } {
    const breakdown = {
      federation: 0,
      wrestler: 0,
      journalist: 0,
      insider: 0,
      legend: 0,
      community: 0
    };

    // This would need account type mapping from the main service
    this.tweets.forEach(tweet => {
      // For now, we'll use a simple heuristic based on username
      const author = tweet.author.toLowerCase();
      if (['wwe', 'aew', 'njpw', 'tna'].some(fed => author.includes(fed))) {
        breakdown.federation++;
      } else if (['sapp', 'meltzer', 'satin', 'johnson'].some(journalist => author.includes(journalist))) {
        breakdown.journalist++;
      } else {
        breakdown.wrestler++;
      }
    });

    return breakdown;
  }

  getMetrics(): EnhancedTwitterMetrics {
    if (this.tweets.length === 0) {
      return {
        totalEngagement: 0,
        avgEngagementPerTweet: 0,
        topPerformingAccount: '',
        trendingHashtags: [],
        peakEngagementTime: '',
        accountTypeBreakdown: {}
      };
    }

    const totalEngagement = this.tweets.reduce((sum, tweet) => 
      sum + tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies, 0
    );

    const avgEngagement = totalEngagement / this.tweets.length;

    // Find top performing account
    const accountEngagement = new Map<string, number>();
    this.tweets.forEach(tweet => {
      const current = accountEngagement.get(tweet.author) || 0;
      const tweetEngagement = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
      accountEngagement.set(tweet.author, current + tweetEngagement);
    });

    const topAccount = Array.from(accountEngagement.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Analyze posting times for peak engagement
    const hourlyEngagement = new Array(24).fill(0);
    this.tweets.forEach(tweet => {
      const hour = tweet.timestamp.getHours();
      const engagement = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
      hourlyEngagement[hour] += engagement;
    });

    const peakHour = hourlyEngagement.indexOf(Math.max(...hourlyEngagement));
    const peakEngagementTime = `${peakHour}:00 - ${peakHour + 1}:00`;

    return {
      totalEngagement,
      avgEngagementPerTweet: Math.round(avgEngagement),
      topPerformingAccount: topAccount,
      trendingHashtags: this.detectTrendingHashtags(),
      peakEngagementTime,
      accountTypeBreakdown: this.getAccountTypeBreakdown()
    };
  }

  getAccountStats(): TwitterAccountStats[] {
    const accountMap = new Map<string, {
      tweets: number;
      engagement: number;
      type: string;
      verified: boolean;
    }>();

    this.tweets.forEach(tweet => {
      const current = accountMap.get(tweet.author) || {
        tweets: 0,
        engagement: 0,
        type: 'wrestler',
        verified: false
      };

      const tweetEngagement = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
      
      accountMap.set(tweet.author, {
        tweets: current.tweets + 1,
        engagement: current.engagement + tweetEngagement,
        type: current.type, // Would be properly determined from account data
        verified: current.verified
      });
    });

    return Array.from(accountMap.entries()).map(([username, stats]) => ({
      username,
      totalTweets: stats.tweets,
      totalEngagement: stats.engagement,
      avgEngagement: Math.round(stats.engagement / stats.tweets),
      type: stats.type,
      verified: stats.verified
    })).sort((a, b) => b.totalEngagement - a.totalEngagement);
  }

  rankTweetsByEngagement(tweets: TwitterPost[], accountTypes: Map<string, string>): TwitterPost[] {
    return tweets
      .map(tweet => {
        const accountType = accountTypes.get(tweet.author) || 'community';
        const velocity = this.calculateEngagementVelocity(tweet);
        
        // Enhanced scoring with velocity and account type
        const baseScore = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
        const velocityBonus = velocity > 1000 ? 1.5 : 1.0;
        const typeMultiplier = this.getTypeMultiplier(accountType);
        
        return {
          ...tweet,
          enhancedScore: Math.round(baseScore * velocityBonus * typeMultiplier)
        };
      })
      .sort((a, b) => (b as any).enhancedScore - (a as any).enhancedScore);
  }

  private getTypeMultiplier(accountType: string): number {
    const multipliers = {
      federation: 1.5,
      journalist: 1.4,
      wrestler: 1.3,
      legend: 1.2,
      insider: 1.1,
      community: 1.0
    };
    return multipliers[accountType] || 1.0;
  }
}

export const enhancedTwitterAnalytics = new EnhancedTwitterAnalytics();
