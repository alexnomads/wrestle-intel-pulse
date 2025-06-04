
import { useState } from "react";
import { Header } from "./Header";
import { SearchBar } from "./SearchBar";
import { WrestlerCard } from "./WrestlerCard";
import { TrendingSection } from "./TrendingSection";
import { NewsFeed } from "./NewsFeed";
import { RedditFeed } from "./RedditFeed";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { EventCalendar } from "./EventCalendar";
import { RosterTabs } from "./RosterTabs";
import { useRSSFeeds, useRedditPosts } from "@/hooks/useWrestlingData";
import { analyzeTrendingWrestlers } from "@/services/trendingService";

export const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const {
    data: newsItems = []
  } = useRSSFeeds();
  const {
    data: redditPosts = []
  } = useRedditPosts();

  // Get trending wrestlers based on real data
  const trendingWrestlers = analyzeTrendingWrestlers(newsItems, redditPosts);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-wrestling-electric via-wrestling-gold to-wrestling-purple bg-clip-text text-transparent glow-text">
            The Ultimate Pro Wrestling Intelligence Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track wrestlers, storylines, and industry narratives with AI-powered insights
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center space-x-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "rosters", label: "Rosters" },
            { id: "events", label: "Events" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Analytics Overview */}
            <AnalyticsOverview onNavigate={handleNavigate} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Wrestler Cards and Trending */}
              <div className="lg:col-span-2 space-y-6">
                <TrendingSection />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trendingWrestlers.slice(0, 4).map(trendingWrestler => (
                    <WrestlerCard
                      key={trendingWrestler.wrestler.id}
                      name={trendingWrestler.wrestler.name}
                      promotion={trendingWrestler.promotion.toUpperCase()}
                      status={trendingWrestler.wrestler.status}
                      sentiment={`${Math.round(trendingWrestler.sentiment * 100)}%`}
                      mentions={trendingWrestler.mentions.toString()}
                      trending={trendingWrestler.trend}
                      image={trendingWrestler.wrestler.image}
                      championships={trendingWrestler.wrestler.championships}
                      mentionSources={{
                        news: trendingWrestler.newsArticles.length,
                        reddit: trendingWrestler.redditPosts.length
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column - News and Reddit Feeds */}
              <div className="space-y-6">
                <NewsFeed />
                <RedditFeed />
              </div>
            </div>
          </>
        )}

        {activeTab === "rosters" && <RosterTabs searchQuery={searchQuery} />}
        {activeTab === "events" && <EventCalendar />}
      </main>
    </div>
  );
};
