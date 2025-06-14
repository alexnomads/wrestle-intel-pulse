import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Twitter, TrendingUp, Users, Heart, MessageCircle, Repeat2, Calendar, Flame, Crown, Settings, Plus, X, Filter, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useTwitterData } from '@/hooks/useTwitterData';
import { WRESTLING_ACCOUNTS, TwitterAccount } from '@/constants/wrestlingAccounts';

interface EnhancedTweet {
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

const TopWrestlingTweets = () => {
  const [tweets, setTweets] = useState<EnhancedTweet[]>([]);
  const [accounts, setAccounts] = useState<TwitterAccount[]>(WRESTLING_ACCOUNTS);
  const [filterType, setFilterType] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [newAccount, setNewAccount] = useState({ username: '', displayName: '', type: 'wrestler' as const });
  const [showAddForm, setShowAddForm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataStatus, setDataStatus] = useState<'live' | 'fallback' | 'mixed'>('live');

  const { data: twitterData = [], isLoading, error } = useTwitterData();

  // Enhanced tweet ranking algorithm
  const calculateEngagementScore = (tweet: any, accountType: string, verified: boolean): number => {
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

  // Process and rank tweets with improved fallback handling
  const processTwitterData = () => {
    if (!twitterData.length) return;

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
    let status: 'live' | 'fallback' | 'mixed' = 'fallback';
    if (realTweets.length > 0 && fallbackTweets.length === 0) {
      status = 'live';
    } else if (realTweets.length > 0 && fallbackTweets.length > 0) {
      status = 'mixed';
    }
    setDataStatus(status);

    // Sort real tweets by engagement score and combine with fallback
    const sortedRealTweets = realTweets
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 8); // Take top 8 real tweets

    // Combine real tweets with fallback tweets (fallback tweets go at the end)
    const combinedTweets = [...sortedRealTweets, ...fallbackTweets.slice(0, 3)];

    setTweets(combinedTweets);
    setLastUpdated(new Date());

    console.log(`Processed ${realTweets.length} real tweets and ${fallbackTweets.length} fallback tweets`);
  };

  useEffect(() => {
    processTwitterData();
  }, [twitterData, accounts]);

  const addAccount = () => {
    if (newAccount.username && newAccount.displayName) {
      setAccounts([...accounts, { 
        ...newAccount, 
        active: true, 
        priority: 'low',
        verified: false 
      }]);
      setNewAccount({ username: '', displayName: '', type: 'wrestler' });
      setShowAddForm(false);
    }
  };

  const removeAccount = (username: string) => {
    setAccounts(accounts.filter(acc => acc.username !== username));
  };

  const toggleAccount = (username: string) => {
    setAccounts(accounts.map(acc => 
      acc.username === username ? { ...acc, active: !acc.active } : acc
    ));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const tweetTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - tweetTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getTypeColor = (type: string): string => {
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

  const getRankingBadge = (index: number) => {
    if (index === 0) return { icon: '🏆', color: 'bg-yellow-500', text: 'text-white' };
    if (index === 1) return { icon: '🥈', color: 'bg-gray-400', text: 'text-white' };
    if (index === 2) return { icon: '🥉', color: 'bg-orange-600', text: 'text-white' };
    return { icon: `${index + 1}`, color: 'bg-blue-500', text: 'text-white' };
  };

  const getDataStatusInfo = () => {
    switch (dataStatus) {
      case 'live':
        return { icon: Wifi, color: 'text-green-500', text: 'Live Data', desc: 'Real-time Twitter data' };
      case 'mixed':
        return { icon: Wifi, color: 'text-yellow-500', text: 'Mixed Data', desc: 'Live + System status' };
      case 'fallback':
        return { icon: WifiOff, color: 'text-orange-500', text: 'System Status', desc: 'Rate limited - showing status' };
    }
  };

  const filteredTweets = filterType === 'all' 
    ? tweets 
    : tweets.filter(tweet => tweet.account_type === filterType);

  const activeAccountsCount = accounts.filter(acc => acc.active).length;
  const statusInfo = getDataStatusInfo();

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Twitter className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold flex items-center space-x-2">
                <span>Wrestling Twitter Feed</span>
                <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                <Badge variant="outline" className={statusInfo.color}>
                  {statusInfo.text}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                {statusInfo.desc} • Monitoring {activeAccountsCount} accounts
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {formatTimeAgo(lastUpdated.toISOString())}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 mt-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {['all', 'federation', 'wrestler', 'journalist', 'insider', 'legend'].map(type => (
              <Badge
                key={type}
                variant={filterType === type ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setFilterType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-secondary/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Account Management ({activeAccountsCount} active of {accounts.length} total)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Account
              </Button>
            </div>

            {showAddForm && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-background rounded border">
                <input
                  type="text"
                  placeholder="Username"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                  className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Display name"
                  value={newAccount.displayName}
                  onChange={(e) => setNewAccount({...newAccount, displayName: e.target.value})}
                  className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({...newAccount, type: e.target.value as any})}
                  className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="wrestler">Wrestler</option>
                  <option value="federation">Federation</option>
                  <option value="journalist">Journalist</option>
                  <option value="insider">Insider</option>
                  <option value="legend">Legend</option>
                  <option value="community">Community</option>
                </select>
                <Button onClick={addAccount}>Add</Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {accounts.slice(0, 20).map((account) => (
                <div
                  key={account.username}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full border transition-all ${
                    account.active 
                      ? 'border-blue-500/50 bg-blue-500/10' 
                      : 'border-border bg-secondary/50 opacity-60'
                  }`}
                >
                  <Badge variant="outline" className={getTypeColor(account.type)}>
                    {account.type}
                  </Badge>
                  <span className="text-sm">@{account.username}</span>
                  {account.verified && <span className="text-blue-500">✓</span>}
                  <button
                    onClick={() => toggleAccount(account.username)}
                    className={`w-3 h-3 rounded-full ${
                      account.active ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <button
                    onClick={() => removeAccount(account.username)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {accounts.length > 20 && (
                <Badge variant="outline" className="text-xs">
                  +{accounts.length - 20} more accounts
                </Badge>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Tweet Feed */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wrestling tweets...</p>
          </div>
        ) : filteredTweets.length > 0 ? (
          <div className="space-y-4">
            {filteredTweets.map((tweet, index) => {
              const rankBadge = getRankingBadge(index);
              return (
                <div
                  key={tweet.id}
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
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Twitter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filterType === 'all' 
                ? 'No tweets available. Check back later!' 
                : `No ${filterType} tweets found. Try another filter.`}
            </p>
          </div>
        )}

        {/* Footer Stats */}
        <Separator />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tracking {activeAccountsCount} wrestling accounts • Smart cycling enabled</span>
          <span>Updates every 15 minutes • API optimized</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopWrestlingTweets;
