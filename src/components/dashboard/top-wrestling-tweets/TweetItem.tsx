
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Repeat2, Flame } from 'lucide-react';
import { EnhancedTweet } from './utils';
import { formatNumber, formatTimeAgo, getTypeColor, getRankingBadge } from './utils';

interface TweetItemProps {
  tweet: EnhancedTweet;
  index: number;
}

const TweetItem: React.FC<TweetItemProps> = ({ tweet, index }) => {
  const rankBadge = getRankingBadge(index);

  return (
    <div
      className={`flex space-x-4 p-4 rounded-lg border transition-colors ${
        tweet.isFallback 
          ? 'bg-amber-50/50 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30' 
          : 'bg-secondary/20 hover:bg-secondary/30'
      }`}
    >
      {/* Ranking Badge */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          tweet.isFallback ? 'bg-amber-500 text-white' : `${rankBadge.color} ${rankBadge.text}`
        } font-bold text-sm`}>
          {tweet.isFallback ? 'ℹ️' : rankBadge.icon}
        </div>
      </div>

      {/* Tweet Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-semibold text-foreground">{tweet.displayName}</span>
          {tweet.verified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          <span className="text-muted-foreground">@{tweet.username}</span>
          {!tweet.isFallback && (
            <Badge variant="outline" className={getTypeColor(tweet.account_type)}>
              {tweet.account_type}
            </Badge>
          )}
          {tweet.isFallback && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              System Status
            </Badge>
          )}
          {tweet.trending && (
            <div className="flex items-center space-x-1 text-orange-500">
              <Flame className="h-3 w-3" />
              <span className="text-xs font-medium">TRENDING</span>
            </div>
          )}
          <span className="text-muted-foreground text-sm">
            {formatTimeAgo(tweet.timestamp)}
          </span>
        </div>
        
        <p className="text-foreground mb-3 leading-relaxed">{tweet.text}</p>
        
        {/* Engagement Metrics */}
        {!tweet.isFallback && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{formatNumber(tweet.replies)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Repeat2 className="h-4 w-4" />
                <span className="text-sm">{formatNumber(tweet.retweets)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{formatNumber(tweet.likes)}</span>
              </div>
            </div>
            <Badge variant="secondary">
              {formatNumber(tweet.engagement_score)} score
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default TweetItem;
