
import { useState } from "react";
import { Header } from "./Header";
import { SearchBar } from "./SearchBar";
import { WrestlerCard } from "./WrestlerCard";
import { TrendingSection } from "./TrendingSection";
import { NewsFeed } from "./NewsFeed";
import { RedditFeed } from "./RedditFeed";
import { AnalyticsOverview } from "./AnalyticsOverview";

export const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-wrestling-electric via-wrestling-gold to-wrestling-purple bg-clip-text text-transparent glow-text">
            WrestleScope
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The Ultimate Pro Wrestling Intelligence Platform - Track wrestlers, storylines, and industry narratives with AI-powered insights
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        {/* Analytics Overview */}
        <AnalyticsOverview />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wrestler Cards and Trending */}
          <div className="lg:col-span-2 space-y-6">
            <TrendingSection />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WrestlerCard 
                name="CM Punk"
                promotion="WWE"
                status="Active"
                sentiment="94%"
                mentions="2,847"
                trending="up"
                image="/placeholder.svg"
              />
              <WrestlerCard 
                name="Jon Moxley"
                promotion="AEW"
                status="Champion"
                sentiment="87%"
                mentions="1,932"
                trending="stable"
                image="/placeholder.svg"
              />
              <WrestlerCard 
                name="Rhea Ripley"
                promotion="WWE"
                status="Injured"
                sentiment="91%"
                mentions="1,445"
                trending="down"
                image="/placeholder.svg"
              />
              <WrestlerCard 
                name="Will Ospreay"
                promotion="AEW"
                status="Active"
                sentiment="89%"
                mentions="892"
                trending="up"
                image="/placeholder.svg"
              />
            </div>
          </div>

          {/* Right Column - News and Reddit Feeds */}
          <div className="space-y-6">
            <NewsFeed />
            <RedditFeed />
          </div>
        </div>
      </main>
    </div>
  );
};
