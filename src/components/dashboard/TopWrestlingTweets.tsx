
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Twitter, TrendingUp, Users, Heart, MessageCircle, Repeat2, Calendar, Flame, Crown, Settings, Plus, X, Filter } from 'lucide-react';
import { useTwitterData } from '@/hooks/useTwitterData';

interface TwitterAccount {
  username: string;
  displayName: string;
  type: 'wrestler' | 'federation' | 'journalist' | 'insider' | 'legend' | 'community';
  active: boolean;
  priority?: 'high' | 'medium' | 'low';
  verified?: boolean;
}

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
}

const WRESTLING_ACCOUNTS: TwitterAccount[] = [
  // Major Federations
  { username: 'WWE', displayName: 'WWE', type: 'federation', active: true, priority: 'high', verified: true },
  { username: 'AEW', displayName: 'All Elite Wrestling', type: 'federation', active: true, priority: 'high', verified: true },
  { username: 'njpw1972', displayName: 'NJPW', type: 'federation', active: true, priority: 'high', verified: true },
  { username: 'ThisIsTNA', displayName: 'TNA Wrestling', type: 'federation', active: true, priority: 'high', verified: true },

  // Top Wrestlers
  { username: 'CMPunk', displayName: 'CM Punk', type: 'wrestler', active: true, priority: 'high', verified: true },
  { username: 'RomanReigns', displayName: 'Roman Reigns', type: 'wrestler', active: true, priority: 'high', verified: true },
  { username: 'TheRock', displayName: 'The Rock', type: 'wrestler', active: true, priority: 'high', verified: true },
  { username: 'JohnCena', displayName: 'John Cena', type: 'wrestler', active: true, priority: 'high', verified: true },
  { username: 'AJStylesOrg', displayName: 'AJ Styles', type: 'wrestler', active: true, priority: 'high', verified: true },
  { username: 'WWESheamus', displayName: 'Sheamus', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'FightOwensFight', displayName: 'Kevin Owens', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'mikethemiz', displayName: 'The Miz', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'TrueKofi', displayName: 'Kofi Kingston', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: '_Theory1', displayName: 'Theory', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'WWEGable', displayName: 'Chad Gable', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'KingRicochet', displayName: 'Ricochet', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'MustafaAli_X', displayName: 'Mustafa Ali', type: 'wrestler', active: true, priority: 'medium', verified: true },

  // Wrestling Journalists & Insiders
  { username: 'SeanRossSapp', displayName: 'Sean Ross Sapp', type: 'journalist', active: true, priority: 'high', verified: true },
  { username: 'WrestleVotes', displayName: 'WrestleVotes', type: 'insider', active: true, priority: 'high', verified: false },
  { username: 'davemeltzerWON', displayName: 'Dave Meltzer', type: 'journalist', active: true, priority: 'high', verified: true },
  { username: 'ryansatin', displayName: 'Ryan Satin', type: 'journalist', active: true, priority: 'high', verified: true },
  { username: 'MikeJohnson_pwtorch', displayName: 'Mike Johnson', type: 'journalist', active: true, priority: 'high', verified: true },
  { username: 'WrestlingInc', displayName: 'Wrestling Inc', type: 'journalist', active: true, priority: 'medium', verified: true },
  { username: 'Fightful', displayName: 'Fightful', type: 'journalist', active: true, priority: 'medium', verified: true },

  // Wrestling Legends
  { username: 'RicFlairNatrBoy', displayName: 'Ric Flair', type: 'legend', active: true, priority: 'high', verified: true },
  { username: 'steveaustinBSR', displayName: 'Steve Austin', type: 'legend', active: true, priority: 'high', verified: true },
  { username: 'ShawnMichaels', displayName: 'Shawn Michaels', type: 'legend', active: true, priority: 'high', verified: true },
  { username: 'TheMarkHenry', displayName: 'Mark Henry', type: 'legend', active: true, priority: 'medium', verified: true },
  { username: 'JerryLawler', displayName: 'Jerry Lawler', type: 'legend', active: true, priority: 'medium', verified: true },
  { username: 'RealKurtAngle', displayName: 'Kurt Angle', type: 'legend', active: true, priority: 'medium', verified: true },

  // Community & Content Creators
  { username: 'WrestleNotice', displayName: 'Wrestling Notice', type: 'community', active: true, priority: 'medium', verified: false },
  { username: 'WrestleTubePC', displayName: 'WrestleTube', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'BustedOpenRadio', displayName: 'Busted Open Radio', type: 'community', active: true, priority: 'medium', verified: true },
  { username: 'WrestlePurists', displayName: 'Wrestling Purists', type: 'community', active: true, priority: 'low', verified: false }
];

const TopWrestlingTweets = () => {
  const [tweets, setTweets] = useState<EnhancedTweet[]>([]);
  const [accounts, setAccounts] = useState<TwitterAccount[]>(WRESTLING_ACCOUNTS);
  const [filterType, setFilterType] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [newAccount, setNewAccount] = useState({ username: '', displayName: '', type: 'wrestler' as const });
  const [showAddForm, setShowAddForm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data: twitterData = [], isLoading, error } = useTwitterData();

  // Enhanced tweet ranking algorithm
  const calculateEngagementScore = (tweet: any, accountType: string, verified: boolean): number => {
    const baseScore = tweet.engagement?.likes + tweet.engagement?.retweets + tweet.engagement?.replies;
    
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

  // Process and rank tweets
  const processTwitterData = () => {
    if (!twitterData.length) return;

    const enhancedTweets: EnhancedTweet[] = twitterData.map(tweet => {
      const account = accounts.find(acc => acc.username === tweet.author);
      const accountType = account?.type || 'community';
      const verified = account?.verified || false;
      
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
        trending: engagementScore > 50000 // Mark high-engagement tweets as trending
      };
    });

    // Sort by engagement score and take top 10
    const topTweets = enhancedTweets
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 10);

    setTweets(topTweets);
    setLastUpdated(new Date());
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

  const filteredTweets = filterType === 'all' 
    ? tweets 
    : tweets.filter(tweet => tweet.account_type === filterType);

  const activeAccountsCount = accounts.filter(acc => acc.active).length;

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
                <span>Top Wrestling Tweets</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </CardTitle>
              <p className="text-muted-foreground">
                Most engaging tweets from {activeAccountsCount} wrestling accounts
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
                Account Management ({activeAccountsCount} active)
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
              {accounts.map((account) => (
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
            </div>
          </div>
        )}

        <Separator />

        {/* Tweet Feed */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading top wrestling tweets...</p>
          </div>
        ) : filteredTweets.length > 0 ? (
          <div className="space-y-4">
            {filteredTweets.map((tweet, index) => {
              const rankBadge = getRankingBadge(index);
              return (
                <div
                  key={tweet.id}
                  className="flex space-x-4 p-4 bg-secondary/20 rounded-lg border hover:bg-secondary/30 transition-colors"
                >
                  {/* Ranking Badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${rankBadge.color} ${rankBadge.text} font-bold text-sm`}>
                      {rankBadge.icon}
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
                      <Badge variant="outline" className={getTypeColor(tweet.account_type)}>
                        {tweet.account_type}
                      </Badge>
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
          <span>Tracking {activeAccountsCount} wrestling accounts</span>
          <span>Updates every 15 minutes</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopWrestlingTweets;
