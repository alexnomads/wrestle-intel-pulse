
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Twitter, TrendingUp, Heart, Repeat, MessageCircle, Users } from 'lucide-react';
import { useTwitterData } from '@/hooks/useTwitterData';

interface TweetProps {
  tweet: {
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
  };
  rank: number;
}

const TweetCard: React.FC<TweetProps> = ({ tweet, rank }) => {
  const engagementScore = tweet.engagement.likes + tweet.engagement.retweets + tweet.engagement.replies;
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTypeFromUsername = (username: string): string => {
    const federations = ['WWE', 'AEW', 'TNADixie', 'ThisIsTNA', 'WWEItalia'];
    const journalists = ['SeanRossSapp', 'WrestleVotes', 'davemeltzerWON', 'ryansatin', 'MikeJohnson_pwtorch', 'Fightful', 'WrestlingInc'];
    
    if (federations.includes(username)) return 'federation';
    if (journalists.includes(username)) return 'journalist';
    return 'wrestler';
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'federation': return 'bg-red-100 text-red-800';
      case 'journalist': return 'bg-blue-100 text-blue-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  // Special styling for fallback tweets
  if (tweet.isFallback) {
    return (
      <div className="p-4 border border-dashed border-muted rounded-lg bg-muted/20">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-sm text-muted-foreground">@{tweet.author}</span>
              <Badge variant="outline" className="text-xs">System Info</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tweet.text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors relative">
      <div className="absolute top-2 left-2">
        <Badge variant="secondary" className="text-xs font-bold">
          #{rank}
        </Badge>
      </div>
      
      <div className="ml-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Twitter className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-foreground">@{tweet.author}</span>
            <Badge className={`text-xs ${getTypeColor(getTypeFromUsername(tweet.author))}`}>
              {getTypeFromUsername(tweet.author)}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {tweet.timestamp.toLocaleDateString()}
          </span>
        </div>
        
        <p className="text-sm text-foreground mb-3 leading-relaxed">
          {tweet.text}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(tweet.engagement.likes)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Repeat className="h-3 w-3" />
              <span>{formatNumber(tweet.engagement.retweets)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{formatNumber(tweet.engagement.replies)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {formatNumber(engagementScore)} engagement
            </Badge>
            {tweet.url !== '#' && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => window.open(tweet.url, '_blank')}
                className="h-6 px-2 text-xs"
              >
                View
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TopWrestlingTweets: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { data: tweets = [], isLoading, error, refetch } = useTwitterData();

  const handleRefresh = async () => {
    await refetch();
    setLastUpdate(new Date());
  };

  // Separate real tweets from fallback tweets
  const realTweets = tweets.filter(tweet => !tweet.isFallback);
  const fallbackTweets = tweets.filter(tweet => tweet.isFallback);
  
  // Sort real tweets by engagement
  const sortedRealTweets = realTweets.sort((a, b) => {
    const engagementA = a.engagement.likes + a.engagement.retweets + a.engagement.replies;
    const engagementB = b.engagement.likes + b.engagement.retweets + b.engagement.replies;
    return engagementB - engagementA;
  }).slice(0, 10);

  // Total accounts being monitored (this should match the WRESTLING_ACCOUNTS array length)
  const totalAccountsMonitored = 120; // Updated to reflect actual account count

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-wrestling-electric" />
            <span>Top Wrestling Tweets Today</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {sortedRealTweets.length} tweets
            </Badge>
          </CardTitle>
          
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Tracking {totalAccountsMonitored} accounts</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 animate-spin text-wrestling-electric" />
              <span>Loading top wrestling tweets...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error loading tweets</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Show real tweets first */}
            {sortedRealTweets.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Top Engagement Tweets
                </h3>
                {sortedRealTweets.map((tweet, index) => (
                  <TweetCard 
                    key={tweet.id} 
                    tweet={tweet} 
                    rank={index + 1}
                  />
                ))}
              </div>
            )}
            
            {/* Show system information */}
            {fallbackTweets.length > 0 && (
              <div className="space-y-4">
                {sortedRealTweets.length > 0 && (
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                    System Status
                  </h3>
                )}
                {fallbackTweets.map((tweet) => (
                  <TweetCard 
                    key={tweet.id} 
                    tweet={tweet} 
                    rank={0}
                  />
                ))}
              </div>
            )}
            
            {/* Show empty state only if no tweets at all */}
            {sortedRealTweets.length === 0 && fallbackTweets.length === 0 && (
              <div className="text-center py-8">
                <Twitter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No tweets available at the moment
                </p>
                <p className="text-sm text-muted-foreground">
                  Our system is actively monitoring {totalAccountsMonitored} wrestling accounts
                </p>
              </div>
            )}
          </>
        )}
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            🔥 Trending tweets ranked by engagement (likes + retweets + replies) • Progressive rate limiting to respect Twitter API limits
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
