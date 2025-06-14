
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Twitter, Calendar, Settings, Wifi, WifiOff } from 'lucide-react';
import { getDataStatusInfo, formatTimeAgo } from './top-wrestling-tweets/utils';
import { useTopTweetsState } from './top-wrestling-tweets/hooks/useTopTweetsState';
import TweetFilters from './top-wrestling-tweets/TweetFilters';
import TweetItem from './top-wrestling-tweets/TweetItem';
import AccountSettings from './top-wrestling-tweets/AccountSettings';

const TopWrestlingTweets = () => {
  const {
    accounts,
    filterType,
    showSettings,
    newAccount,
    showAddForm,
    lastUpdated,
    dataStatus,
    tweets,
    isLoading,
    error,
    setFilterType,
    setShowSettings,
    setShowAddForm,
    addAccount,
    removeAccount,
    toggleAccount,
    updateNewAccount
  } = useTopTweetsState();

  const activeAccountsCount = accounts.filter(acc => acc.active).length;
  const statusInfo = getDataStatusInfo(dataStatus);
  const StatusIcon = statusInfo.icon === 'Wifi' ? Wifi : WifiOff;

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
                <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
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

        <TweetFilters filterType={filterType} onFilterChange={setFilterType} />
      </CardHeader>

      <CardContent className="space-y-4">
        {showSettings && (
          <AccountSettings
            accounts={accounts}
            showAddForm={showAddForm}
            newAccount={newAccount}
            onToggleAddForm={() => setShowAddForm(!showAddForm)}
            onNewAccountChange={updateNewAccount}
            onAddAccount={addAccount}
            onToggleAccount={toggleAccount}
            onRemoveAccount={removeAccount}
          />
        )}

        <Separator />

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wrestling tweets...</p>
          </div>
        ) : tweets.length > 0 ? (
          <div className="space-y-4">
            {tweets.map((tweet, index) => (
              <TweetItem key={tweet.id} tweet={tweet} index={index} />
            ))}
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
