
import { TwitterPost } from '@/services/twitterService';
import { TwitterAccount } from '@/constants/wrestlingAccounts';

export interface EnhancedTweet {
  id: string;
  username: string;
  displayName: string;
  text: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  engagement_score: number;
  velocity_score?: number;
  verified: boolean;
  account_type: string;
  trending?: boolean;
  isFallback?: boolean;
}

export const calculateEngagementScore = (tweet: any, accountType: string, verified: boolean): number => {
  const baseScore = (tweet.engagement?.likes || 0) + (tweet.engagement?.retweets || 0) + (tweet.engagement?.replies || 0);
  
  // Account type multipliers
  const typeMultipliers = {
    federation: 1.5,
    journalist: 1.4,
    wrestler: 1.3,
    legend: 1.2,
    insider: 1.1,
    community: 1.0
  };
  
  // Verified account bonus
  const verifiedBonus = verified ? 1.2 : 1.0;
  
  // Recency bonus (tweets from last 6 hours get bonus)
  const tweetAge = Date.now() - new Date(tweet.timestamp).getTime();
  const recencyBonus = tweetAge < 6 * 60 * 60 * 1000 ? 1.1 : 1.0;
  
  return Math.round(baseScore * typeMultipliers[accountType] * verifiedBonus * recencyBonus);
};

export const processTwitterData = (twitterData: TwitterPost[], accounts: TwitterAccount[]) => {
  if (!twitterData.length) return { tweets: [], dataStatus: 'fallback' as const };

  console.log(`Processing ${twitterData.length} tweets from Twitter data`);

  const enhancedTweets: EnhancedTweet[] = twitterData.map(tweet => {
    const account = accounts.find(acc => acc.username === tweet.author);
    const accountType = account?.type || 'community';
    const verified = account?.verified || false;
    
    // Handle fallback tweets differently
    if (tweet.isFallback) {
      return {
        id: tweet.id,
        username: tweet.author,
        displayName: tweet.author,
        text: tweet.text,
        timestamp: tweet.timestamp.toISOString(),
        likes: 0,
        retweets: 0,
        replies: 0,
        engagement_score: 0,
        verified: false,
        account_type: 'community',
        isFallback: true
      };
    }
    
    const engagementScore = calculateEngagementScore(tweet, accountType, verified);
    
    return {
      id: tweet.id,
      username: tweet.author,
      displayName: account?.displayName || tweet.author,
      text: tweet.text,
      timestamp: tweet.timestamp.toISOString(),
      likes: tweet.engagement?.likes || 0,
      retweets: tweet.engagement?.retweets || 0,
      replies: tweet.engagement?.replies || 0,
      engagement_score: engagementScore,
      verified,
      account_type: accountType,
      trending: engagementScore > 50000,
      isFallback: false
    };
  });

  // Separate real tweets from fallback
  const realTweets = enhancedTweets.filter(tweet => !tweet.isFallback);
  const fallbackTweets = enhancedTweets.filter(tweet => tweet.isFallback);

  // Determine data status
  let dataStatus: 'live' | 'fallback' | 'mixed' = 'fallback';
  if (realTweets.length > 0 && fallbackTweets.length === 0) {
    dataStatus = 'live';
  } else if (realTweets.length > 0 && fallbackTweets.length > 0) {
    dataStatus = 'mixed';
  }

  // Sort real tweets by engagement score and combine with fallback
  const sortedRealTweets = realTweets
    .sort((a, b) => b.engagement_score - a.engagement_score)
    .slice(0, 8); // Take top 8 real tweets

  // Combine real tweets with fallback tweets (fallback tweets go at the end)
  const combinedTweets = [...sortedRealTweets, ...fallbackTweets.slice(0, 3)];

  console.log(`Processed ${realTweets.length} real tweets and ${fallbackTweets.length} fallback tweets`);

  return { tweets: combinedTweets, dataStatus };
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const tweetTime = new Date(timestamp);
  const diffInHours = Math.floor((now.getTime() - tweetTime.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

export const getTypeColor = (type: string): string => {
  const colors = {
    wrestler: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    federation: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    journalist: 'bg-green-500/20 text-green-300 border-green-500/40',
    insider: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    legend: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    community: 'bg-slate-500/20 text-slate-300 border-slate-500/40'
  };
  return colors[type] || colors.community;
};

export const getRankingBadge = (index: number) => {
  if (index === 0) return { icon: '🏆', color: 'bg-yellow-500', text: 'text-white' };
  if (index === 1) return { icon: '🥈', color: 'bg-gray-400', text: 'text-white' };
  if (index === 2) return { icon: '🥉', color: 'bg-orange-600', text: 'text-white' };
  return { icon: `${index + 1}`, color: 'bg-blue-500', text: 'text-white' };
};

export const getDataStatusInfo = (dataStatus: 'live' | 'fallback' | 'mixed') => {
  switch (dataStatus) {
    case 'live':
      return { icon: 'Wifi', color: 'text-green-500', text: 'Live Data', desc: 'Real-time Twitter data' };
    case 'mixed':
      return { icon: 'Wifi', color: 'text-yellow-500', text: 'Mixed Data', desc: 'Live + System status' };
    case 'fallback':
      return { icon: 'WifiOff', color: 'text-orange-500', text: 'System Status', desc: 'Rate limited - showing status' };
  }
};
