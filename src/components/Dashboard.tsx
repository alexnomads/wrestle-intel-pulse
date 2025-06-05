
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { RealTimeWrestlerTracker } from "./dashboard/RealTimeWrestlerTracker";
import { UnifiedNewsFeed } from "./dashboard/UnifiedNewsFeed";
import { CommunityHotTopics } from "./dashboard/CommunityHotTopics";
import { RosterTabs } from "./RosterTabs";
import { EventCalendar } from "./EventCalendar";
import { SearchBar } from "./SearchBar";
import { DataManagement } from "./DataManagement";
import { WrestlerIntelligenceDashboard } from "./WrestlerIntelligenceDashboard";
import { StorylineTracker } from "./StorylineTracker";
import { IndustryAnalytics } from "./IndustryAnalytics";
import { SmartSearchEngine } from "./SmartSearchEngine";
import { Card, CardContent } from "./ui/card";
import { RefreshCw } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh every 10 minutes for real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      console.log('Auto-refreshing wrestling analytics data...');
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto p-6 flex-grow">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Real-time refresh indicator */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-pulse text-green-500" />
                    <span>Live Wrestling Analytics Dashboard</span>
                  </div>
                  <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Core Feature 1: Real-Time Wrestler Popularity Tracker */}
            <RealTimeWrestlerTracker refreshTrigger={lastRefresh} />

            {/* Core Feature 2: Wrestling News Aggregator & Sentiment Analysis */}
            <UnifiedNewsFeed refreshTrigger={lastRefresh} />

            {/* Core Feature 3: Fan Community Insights Dashboard */}
            <CommunityHotTopics refreshTrigger={lastRefresh} />
          </div>
        )}

        {activeTab === 'rosters' && <RosterTabs searchQuery={searchQuery} />}
        {activeTab === 'events' && <EventCalendar />}
        {activeTab === 'search' && <SmartSearchEngine />}
        {activeTab === 'data' && <DataManagement />}
        {activeTab === 'wrestler-intelligence' && <WrestlerIntelligenceDashboard />}
        {activeTab === 'storyline-tracker' && <StorylineTracker />}
        {activeTab === 'industry-analytics' && <IndustryAnalytics />}
      </main>
    </div>
  );
};

export { Dashboard };
