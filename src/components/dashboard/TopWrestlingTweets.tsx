
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Newspaper, Calendar, Settings, Rss, DollarSign } from 'lucide-react';
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
  const StatusIcon = Rss; // Use RSS icon for news aggregator

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Newspaper className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold flex items-center space-x-2">
                <span>Wrestling News Aggregator</span>
                <StatusIcon className="w-4 h-4 text-blue-500" />
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  <DollarSign className="w-3 h-3 mr-1" />
                  FREE NEWS
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Curated wrestling journalism • Social media references • Monitoring {activeAccountsCount} wrestling accounts
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

        {/* Wrestling News Aggregator Benefits Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/30">
          <div className="flex items-center space-x-3">
            <Newspaper className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Wrestling News Aggregator</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ✓ Curated wrestling journalism ✓ Social media references ✓ Backstage reports ✓ Breaking news ✓ Reliable sources
              </p>
            </div>
          </div>
        </div>
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
            <p className="text-muted-foreground">Wrestling news aggregator collecting content from journalism sites...</p>
          </div>
        ) : tweets.length > 0 ? (
          <div className="space-y-4">
            {tweets.map((tweet, index) => (
              <TweetItem key={tweet.id} tweet={tweet} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filterType === 'all' 
                ? 'Wrestling news aggregator collecting content from journalism sites. Real wrestling news coming soon!' 
                : `No ${filterType} content found. Try another filter.`}
            </p>
          </div>
        )}

        <Separator />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Wrestling news aggregator • {activeAccountsCount} accounts • Journalism sources • Curated content</span>
          <span>Updates every 10 minutes • Real wrestling news</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopWrestlingTweets;
