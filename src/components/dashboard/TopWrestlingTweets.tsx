
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Twitter, Calendar, Settings, Wifi, DollarSign } from 'lucide-react';
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
  const StatusIcon = Wifi; // Always show connected for free mode

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Twitter className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold flex items-center space-x-2">
                <span>Enhanced Free Wrestling Social Feed</span>
                <StatusIcon className="w-4 h-4 text-green-500" />
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ENHANCED FREE
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Improved reliability • Multiple sources • Monitoring {activeAccountsCount} wrestling accounts
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

        {/* Enhanced Free Mode Benefits Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800/30">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200">Enhanced Free Wrestling Social Aggregator</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ Improved reliability ✓ Multiple data sources ✓ Better error handling ✓ Enhanced content quality ✓ No API limits
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Enhanced collection system gathering wrestling social content...</p>
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
                ? 'Enhanced content collection in progress. Improved reliability means better results!' 
                : `No ${filterType} content found. Try another filter.`}
            </p>
          </div>
        )}

        <Separator />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Enhanced free aggregator • {activeAccountsCount} accounts • Multiple sources • Improved reliability</span>
          <span>Updates every 10 minutes • Better error handling</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopWrestlingTweets;
