
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { MainAnalyticsDashboard } from "./MainAnalyticsDashboard";
import { RosterTabs } from "./RosterTabs";
import { EventCalendar } from "./EventCalendar";
import { DataManagement } from "./DataManagement";
import { WrestlerIntelligenceDashboard } from "./WrestlerIntelligenceDashboard";
import { IndustryAnalytics } from "./IndustryAnalytics";
import { SmartSearchEngine } from "./SmartSearchEngine";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto p-6 flex-grow">
        {activeTab === 'overview' && <MainAnalyticsDashboard />}
        {activeTab === 'rosters' && <RosterTabs searchQuery={searchQuery} />}
        {activeTab === 'events' && <EventCalendar />}
        {activeTab === 'search' && <SmartSearchEngine />}
        {activeTab === 'data' && <DataManagement />}
        {activeTab === 'wrestler-intelligence' && <WrestlerIntelligenceDashboard />}
        {activeTab === 'industry-analytics' && <IndustryAnalytics />}
      </main>
    </div>
  );
};

export { Dashboard };
