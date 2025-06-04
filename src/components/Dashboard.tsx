
import { useState } from "react";
import { Header } from "./Header";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { TrendingSection } from "./TrendingSection";
import { NewsFeed } from "./NewsFeed";
import { RedditFeed } from "./RedditFeed";
import { RosterTabs } from "./RosterTabs";
import { EventCalendar } from "./EventCalendar";
import { SearchBar } from "./SearchBar";
import { DataManagement } from "./DataManagement";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto p-6 flex-grow">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AnalyticsOverview onNavigate={setActiveTab} />
              <NewsFeed />
            </div>
            <div className="space-y-6">
              <TrendingSection />
              <RedditFeed />
            </div>
          </div>
        )}

        {activeTab === 'rosters' && <RosterTabs searchQuery={searchQuery} />}
        {activeTab === 'events' && <EventCalendar />}
        {activeTab === 'search' && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
        {activeTab === 'data' && <DataManagement />}
      </main>
    </div>
  );
};

export { Dashboard };
